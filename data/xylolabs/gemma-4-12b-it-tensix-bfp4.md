# Xylolabs/gemma-4-12B-it-Tensix-BFP4

## Resumen

Gemma 4 12B IT Tensix BFP4 es una versión cuantizada del modelo multimodal `google/gemma-4-12B-it` de Google, adaptada por Xylolabs para su ejecución en aceleradores Tenstorrent Tensix (arquitecturas Wormhole y Blackhole). Se trata de un modelo any-to-any (entrada y salida de texto, imagen y audio) de aproximadamente 12.966 millones de parámetros, cuyas capas lineales de atención y MLP han sido redondeadas al formato de coma flotante por bloques `ttnn.bfloat4_b` (BFP4) mediante GPTQ, mientras que embeddings, normas, LM head y los módulos de visión y audio permanecen en bf16.

La motivación del modelo es puramente de despliegue: los pesos se almacenan en safetensors en bf16, pero cada valor ya está alineado a la rejilla BFP4, de forma que TT-NN los empaqueta sin volver a redondear y se evita la pérdida de precisión adicional en tiempo de carga. El resultado ocupa 8,15 GB empaquetado (5,47 bits por peso de media) frente a los 23,81 GB del modelo base en bf16, lo que lo hace viable en una única tarjeta Blackhole P150.

Es relevante ahora porque demuestra una ruta de cuantización específica para hardware no-GPU (NPU de Tenstorrent) con métricas de fidelidad publicadas frente al modelo original y frente a una cuantización estándar de llama.cpp (Q4_K_M). La licencia es Apache 2.0, aunque hereda las condiciones del modelo base de Google.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (any-to-any) `gemma4_unified`; 48 capas con atención y MLP cuantizados |
| Parametros totales | 12.966.363.184 (~12,97 mil millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP4 (`ttnn.bfloat4_b`, 4,5 bits por peso) en q/k/v/o y gate/up/down; bf16 en embeddings, normas, LM head y módulos de visión/audio; media de 5,47 bits por peso |
| Idiomas soportados | no disponible (la evaluación cubre inglés y coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16 en disco, valores alineados a la rejilla BFP4); archivo auxiliar `quant4.json` con el formato por proyección |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-12B-it`, un transformer multimodal con 48 capas que procesa texto, imagen y audio (pipeline `any-to-any`). Xylolabs no reentrena el modelo: aplica GPTQ sobre las proyecciones lineales de atención (q, k, v, o) y del MLP (gate, up, down), con una búsqueda de exponente por bloque para ajustar cada bloque a la rejilla BFP4. La calibración se realizó sobre 65.536 tokens de WikiText-2 y de Wikipedia en coreano. Los tensores `embed_audio`, `embed_vision` y `vision_embedder` se mantienen intactos en bf16, y el LM head sigue atado al embedding.

La innovación técnica es el empaquetado exacto: como los pesos ya están en la rejilla BFP4, TT-NN los carga sin redondeo adicional, y la verificación (`pack_tensix.py`, `verify_grid.py`) comprueba que ningún valor cambia tras el empaquetado. El autor probó el flujo con ttnn 0.81.1 sobre `ttsim`, el simulador de Blackhole, y advierte explícitamente de que no se ha ejecutado en hardware real. Además, los mismos valores se empaquetan de forma exacta en `ttnn.bfloat8_b`, lo que permite usar el demo de Gemma 4 de tt-metal (v0.81.1) con una entrada de `precision_overrides.json` que fuerza bfp8 en atención y MLP compartido.

## Capacidades

- Generación de texto conversacional con plantilla de chat (`apply_chat_template`), incluyendo modo de razonamiento con thinking activado.
- Procesamiento multimodal any-to-any: entrada de imagen y audio, con módulos de embedding de visión y audio preservados en bf16.
- Razonamiento multi-paso: la evaluación incluye 7 prompts de razonamiento repetidos con thinking activado.
- Multilingüismo: evaluación sobre texto en inglés y coreano; el resto de idiomas no está documentado.
- Inferencia en aceleradores Tenstorrent Tensix (Wormhole, Blackhole) mediante tt-metal/ttnn, y en GPU/CPU vía transformers con `dtype="bfloat16"`.
- Compatibilidad con endpoints (`endpoints_compatible` según los tags del repositorio).
- No se documenta soporte explícito de tool calling ni de function calling en la información disponible.

## Casos de uso

- Despliegue en NPU Tenstorrent: servir el modelo en una Blackhole P150 usando el demo de Gemma 4 de tt-metal con la entrada de `precision_overrides.json` en bfp8, reduciendo el peso en memoria de 23,81 GB a 8,15 GB por instancia.
- Prototipado en transformers: cargar el checkpoint en bf16 con `device_map="auto"` para validar respuestas antes de pasar al hardware Tensix, ya que los valores son idénticos a los empaquetados.
- Asistentes conversacionales con contexto multimodal: al conservar los embedders de visión y audio en bf16, el modelo puede recibir imágenes o audio junto con texto en un mismo flujo de chat.
- Evaluación de pipelines de cuantización: usar las métricas publicadas (KL medio de 0,12030 frente a bf16 y top-1 del 87,96 %) como referencia para comparar otras recetas GPTQ sobre el mismo checkpoint base.
- Investigación en formatos de coma flotante por bloques: el par `quant4.json` + scripts de verificación permite estudiar el impacto de BFP4 por proyección sin modificar el código de TT-NN.
- Razonamiento con thinking en entornos con memoria limitada: el modo de razonamiento se mantiene operativo tras la cuantización (40 de 40 respuestas correctas en el conjunto de evaluación del autor).
- Verificación de integridad de pesos en CI: integrar `verify_grid.py` en un pipeline para comprobar con torch que la rejilla BFP4 no se ha alterado tras conversiones o transferencias.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (evaluación solo del modelo de lenguaje):

| Modelo | Bits por peso | Tamano (GB) | KL medio vs BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (google/gemma-4-12B-it) | 16 | 23,81 | 0 | 100 | 40 de 40 | - |
| Este modelo (BFP4) | 5,47 | 8,146 | 0,12030 | 87,96 | 40 de 40 | 0 |
| Q4_K_M (llama.cpp) | 4,95 | 7,381 | 0,16924 | 85,52 | 40 de 40 | 0 |

Metodología: KL y top-1 sobre 8.048 posiciones de texto en inglés y coreano (test de WikiText-2 y Wikipedia en coreano) con la plantilla de chat; las respuestas corresponden a 33 prompts cortos con comprobación automática más 7 de razonamiento repetidos con thinking activado. Q4_K_M se generó con llama.cpp v0.9.0 (`cd959bae`) sin importance matrix. El criterio de aceptación del autor era un KL medio máximo de 1,5 veces el de Q4_K_M y como mucho una respuesta perdida adicional.

## Requisitos de hardware

- VRAM/RAM estimada: 8,15 GB empaquetado en BFP4; 23,81 GB si se carga en bf16 vía transformers.
- Hardware objetivo: NPU Tenstorrent Tensix Wormhole y Blackhole; el demo de tt-metal v0.81.1 ejecuta las variantes E2B, E4B y 12B en una única Blackhole P150.
- Estado de validación: probado con ttnn 0.81.1 sobre `ttsim` (simulador de Blackhole); no se ha ejecutado en hardware real según el autor.
- GPU consumer: no se documenta soporte ni rendimiento en GPU; la carga en bf16 (23,81 GB) excede la VRAM de tarjetas consumer habituales.
- Opciones de despliegue: tt-metal (demo de Gemma 4), tt-forge/tt-xla (sin probar con Gemma 4; por defecto mantiene bf16 exacto y su opción `bfp_bf4` re-redondea en otro diseño de bloque), transformers con `AutoModelForCausalLM`, y scripts `pack_tensix.py` / `verify_grid.py`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Tamano | Licencia | Notas |
|---|---|---|---|---|---|---|
| Este modelo (BFP4) | ~12,97 B | no disponible | BFP4 + bf16 mixto | 8,15 GB | Apache 2.0 | Objetivo Tensix; KL 0,12030 |
| google/gemma-4-12B-it (BF16) | ~12,97 B | no disponible | bf16 | 23,81 GB | Gemma (no confirmada en la informacion) | Referencia de fidelidad; KL 0 |
| Q4_K_M de llama.cpp | ~12,97 B | no disponible | Q4_K_M (4,95 bits/peso) | 7,38 GB | Apache 2.0 (derivada) | Mas pequeno, pero KL 0,16924 y top-1 85,52 % |

No se dispone de datos de otros modelos comparables de la misma categoría (multimodales de ~13 B cuantizados para NPU) en la información proporcionada.

## Limitaciones y advertencias

- Solo se cuantizó y evaluó el modelo de lenguaje; el rendimiento de los módulos de visión y audio tras el empaquetado no está medido.
- No se ha ejecutado en hardware Tensix real: la validación se hizo en el simulador `ttsim` con ttnn 0.81.1.
- tt-transformers no soporta Gemma 4; el demo de tt-metal no tiene opción nativa de bfloat4_b y requiere la entrada manual en `precision_overrides.json` para usar bfp8.
- tt-forge (tt-xla) no se ha probado con Gemma 4; su opción `bfp_bf4` re-redondea los pesos en un diseño de bloque distinto, lo que rompe la garantía de empaquetado exacto.
- La cuantización introduce una divergencia medible frente a bf16 (KL medio 0,12030, top-1 87,96 %), lo que puede afectar a tareas sensibles a la precisión numérica.
- La evaluación se limita a inglés y coreano; el comportamiento en castellano u otros idiomas no está documentado.
- Riesgo de alucinación y sesgos heredados del modelo base de Google, no caracterizados en esta ficha.
- La licencia del repositorio es Apache 2.0, pero el uso comercial debe verificar las condiciones del modelo base `google/gemma-4-12B-it`, que pueden imponer restricciones adicionales.
- Longitud de contexto no documentada; conviene consultar la model card del modelo base antes de diseñar flujos con ventanas largas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/gemma-4-12B-it-Tensix-BFP4
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Repositorio de código (tensix-bfp-gptq): https://github.com/XylolabsInc/tensix-bfp-gptq
- Demo de Gemma 4 en tt-metal (v0.81.1): https://github.com/tenstorrent/tt-metal/tree/v0.81.1/models/demos/gemma4
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Paper referenciado en los tags: arXiv:2607.02770 (https://arxiv.org/abs/2607.02770)
- Licencia del repositorio: https://huggingface.co/Xylolabs/gemma-4-12B-it-Tensix-BFP4/blob/main/LICENSE
