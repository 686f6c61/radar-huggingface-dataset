# Xylolabs/gemma-4-E2B-it-qat-q4_0-unquantized-Tensix-BFP4-MLP

## Resumen

Este repositorio contiene una versión cuantizada del modelo `google/gemma-4-E2B-it-qat-q4_0-unquantized`, preparada por Xylolabs para su ejecución sobre aceleradores Tenstorrent Tensix (Wormhole y Blackhole) mediante el stack `tt-metal`/`ttnn`. No se trata de un modelo nuevo: es el mismo Gemma 4 E2B instruction-tuned de Google, con las capas lineales redondeadas a los formatos de bloque flotante propietarios de Tenstorrent (`bfloat4_b` para las proyecciones MLP y `bfloat8_b` para la atención), de modo que TT-NN pueda empaquetar los pesos sin volver a redondearlos.

El modelo base es un transformer multimodal any-to-any (texto, imagen y audio) de aproximadamente 5.500 millones de parámetros totales, según los safetensors del repositorio. La intervención de Xylolabs afecta únicamente al modelo de lenguaje: los torres de visión y audio, los embeddings y las normas permanecen en bf16 sin modificar. El resultado ocupa 6,758 GB empaquetados con una media de 11,68 bits por peso, frente a los 9,26 GB del export original en bf16.

La relevancia de esta ficha es doble: por un lado documenta un caso real de cuantización post-entrenamiento orientada a hardware específico (BFP de bloque, no INT4/INT8 convencional); por otro, advierte de que el modelo solo se ha validado en el simulador `ttsim` de Blackhole y no en silicio real, lo que condiciona cualquier despliegue en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal any-to-any (Gemma 4), con torres de visión y audio; capas lineales en formatos BFP de bloque para Tensix |
| Parámetros totales | 5.506.950.723 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BFP4 (`ttnn.bfloat4_b`, 4,5 bits/peso) en MLP gate/up/down; BFP8 (`ttnn.bfloat8_b`, 8,5 bits/peso) en atención q/k/v/o; bf16 en LM head, embeddings, normas y torres de visión/audio |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en bf16 con valores alineados a la rejilla BFP4/BFP8; índice `quant4.json` por proyección |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal de Gemma 4 en variante E2B, con 35 capas en el modelo de lenguaje según la tabla de formatos de la model card. La intervención de Xylolabs no reentrena el modelo: aplica GPTQ con búsqueda de exponente por bloque a las proyecciones MLP (gate, up, down) para llevarlas a `bfloat4_b`, y redondeo al más cercano para las proyecciones de atención (q, k, v, o) a `bfloat8_b`. La calibración de GPTQ usó 65.536 tokens de WikiText-2 y de Wikipedia en coreano. Las torres de visión y audio (`vision_tower`, `audio_tower`, `embed_vision`, `embed_audio`), el LM head (atado al embedding) y todas las normas se mantienen en bf16.

La innovación técnica no está en el entrenamiento sino en el formato: los tensores se almacenan como bf16 pero cada valor ya está situado en la rejilla de bloque flotante de Tensix, de forma que el empaquetado en TT-NN es exacto y no introduce un segundo redondeo. El repositorio incluye dos scripts de verificación (`pack_tensix.py` y `verify_grid.py`) que comprueban matriz a matriz que el empaquetado no altera ningún valor, y opcionalmente hacen el viaje de ida y vuelta por la DRAM del dispositivo. No se documenta RLHF, DPO ni composición del dataset de entrenamiento original en la información disponible.

## Capacidades

- Generación de texto conversacional e instruction-following, heredadas del modelo base Gemma 4 E2B instruction-tuned.
- Procesamiento multimodal any-to-any: entrada y salida de imagen y texto, con torre de visión en bf16.
- Procesamiento de audio: la model card menciona `audio_tower` y `embed_audio` en bf16, aunque no detalla las tareas concretas soportadas.
- Razonamiento y matemáticas: capacidad esperable del modelo base, sin métricas publicadas en esta ficha.
- Generación de código: no se documenta explícitamente en la información disponible.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; la calibración de GPTQ incluyó coreano, pero no se especifican los idiomas del modelo.

## Casos de uso

- Despliegue en aceleradores Tenstorrent Wormhole o Blackhole: el caso de uso principal es ejecutar Gemma 4 E2B sobre NPUs Tensix con pesos ya alineados a la rejilla BFP, evitando el redondeo adicional en tiempo de carga. Adecuado para entornos que ya operan `tt-metal` y quieren reducir el tamaño de pesos de 9,26 GB a 6,758 GB.
- Investigación en cuantización de bloque flotante: sirve como referencia reproducible de GPTQ con búsqueda de exponente por bloque aplicada a formatos BFP4/BFP8, con scripts de verificación incluidos.
- Inferencia multimodal en el borde: el modelo base acepta imagen y texto; sobre hardware Tensix de bajo consumo podría emplearse en clasificación o descripción de imágenes, aunque la validación en hardware real no está documentada.
- Transcripción o análisis de audio: la torre de audio se conserva en bf16, lo que permitiría tareas de comprensión de audio si el stack de despliegue lo soporta.
- Evaluación comparativa de precisión: útil para medir el impacto de BFP4 en MLP frente a BFP8 en atención, con la tabla de KL y top-1 publicada como referencia (KL medio 0,06007, top-1 88,34 %).
- Prototipado en simulador: con `ttsim` de Blackhole se puede validar el pipeline de empaquetado y la calidad del modelo antes de disponer de hardware, gracias a los scripts `pack_tensix.py` y `verify_grid.py`.

## Benchmarks y rendimiento

| Modelo | Bits por peso | Tamaño (GB) | KL medio a BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (base) | 16 | 9,26 | 0 | 100 | 31 de 33 | - |
| Este modelo | 11,68 | 6,758 | 0,06007 | 88,34 | 31 de 33 | no disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La evaluación publicada se limita a la comparación de divergencia KL y top-1 frente al export bf16, y la model card indica que solo se redondeó y evaluó el modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: 6,758 GB de pesos empaquetados en BFP; en bf16 (carga por defecto en transformers) el modelo ocupa aproximadamente 9,26 GB más overhead de activaciones.
- GPU recomendadas: no aplica de forma nativa; el destino es Tenstorrent Wormhole o Blackhole. La model card cita la demo de tt-metal que ejecuta E2B, E4B y 12B en una Blackhole P150.
- Compatibilidad con GPU consumer: el repositorio es cargable con `transformers` en bf16 y `device_map="auto"`, por lo que cabría en GPUs con 12 GB o más de VRAM, pero sin aprovechar el formato BFP.
- Opciones de despliegue: `ttnn` 0.81.1 (probado en `ttsim`), demo de Gemma 4 en `tt-metal` v0.81.1, `tt-forge`/`tt-xla` (no probado con Gemma 4), y `transformers` para carga en bf16.
- Latencia y throughput: no disponibles. La model card indica explícitamente que el modelo se ha probado en el simulador `ttsim` de Blackhole y no en hardware real.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Xylolabs) | 5.506.950.723 | no disponible | BFP4 MLP + BFP8 atención, 11,68 bits/peso | Apache 2.0 | Hugging Face, validado en simulador |
| google/gemma-4-E2B-it-qat-q4_0-unquantized | 5.506.950.723 | no disponible | bf16, 16 bits/peso | Apache 2.0 | Hugging Face |
| Export BFP8 completo (referencia de la model card) | 5.506.950.723 | no disponible | BFP8 en atención y MLP compartido | Apache 2.0 | Configuración de `precision_overrides.json` en tt-metal |

No se dispone de datos de benchmarks comparativos con otras familias de modelos del mismo tamaño en la información proporcionada.

## Limitaciones y advertencias

- Validación solo en simulador: el modelo se probó con `ttnn` 0.81.1 sobre `ttsim` de Blackhole, no en hardware real. El comportamiento en silicio puede diferir.
- La entrada de `precision_overrides.json` propuesta para la demo de tt-metal empaqueta atención y MLP en `bfloat8_b`, no en el BFP4 del repositorio; esa configuración fue exacta en las dos primeras capas del export base E2B pero no se ejecutó sobre este modelo.
- `tt-forge`/`tt-xla` no se ha probado con Gemma 4; su opción `bfp_bf4` re-redondea con una disposición de bloque distinta.
- Solo se cuantizó y evaluó el modelo de lenguaje; las torres de visión y audio permanecen en bf16 y no se han evaluado en este repositorio.
- Pérdida de calidad medible: KL medio de 0,06007 frente a bf16 y top-1 del 88,34 % (frente al 100 % del base), aunque el número de respuestas correctas se mantiene en 31 de 33.
- Riesgo de alucinación: inherente al modelo base; no se documentan mitigaciones adicionales.
- Sesgos conocidos: no documentados en la información disponible.
- Idiomas soportados: no especificados; la calibración incluyó coreano y WikiText-2 en inglés, lo que puede sesgar la cuantización hacia esos idiomas.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base de Google antes de desplegar.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que sugiere escasa validación por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Xylolabs/gemma-4-E2B-it-qat-q4_0-unquantized-Tensix-BFP4-MLP
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it-qat-q4_0-unquantized
- Revisión concreta del modelo base citada: https://huggingface.co/google/gemma-4-E2B-it-qat-q4_0-unquantized/tree/6befbaca7398925921802abd1f277b495b78b738
- Código de cuantización (tensix-bfp-gptq): https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Demo de Gemma 4 en tt-metal v0.81.1: https://github.com/tenstorrent/tt-metal/tree/v0.81.1/models/demos/gemma4
- Paper referenciado en los tags (arXiv:2607.02770): https://arxiv.org/abs/2607.02770
