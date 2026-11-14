# Xylolabs/gemma-4-12B-it-Tenstorrent-Tensix-BFP4

## Resumen

El modelo `Xylolabs/gemma-4-12B-it-Tenstorrent-Tensix-BFP4` es una exportación cuantizada de `google/gemma-4-12B-it` realizada por Xylolabs, orientada específicamente a la ejecución sobre aceleradores Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). Se trata de un modelo multimodal any-to-any (texto, imagen y audio) de aproximadamente 12.966 millones de parámetros, cuyas capas lineales de atención y MLP han sido cuantizadas a `ttnn.bfloat4_b` (block floating point de 4 bits con exponente compartido por bloque) mediante GPTQ.

La relevancia de esta ficha radica en que no es una cuantización genérica para GPU, sino un artefacto empaquetado para que TT-NN lo cargue sin transformaciones adicionales: las matrices cuantizadas se almacenan como valores bf16 sobre la rejilla BFP4, de modo que el empaquetado en el dispositivo preserva exactamente los valores. El resultado ocupa unos 8,15 GB en memoria de dispositivo para los pesos del modelo de lenguaje, frente a los 23,81 GB del checkpoint BF16 original, con un coste de calidad medido en KL de 0,12030 y un top-1 del 87,96 % respecto a BF16.

El modelo base es propiedad de Google y esta exportación se distribuye bajo licencia Apache 2.0. Está pensado para desarrolladores que despliegan Gemma 4 en hardware Tenstorrent y necesitan reducir el espacio de pesos sin salir del ecosistema tt-metal/ttnn, aceptando que solo el modelo de lenguaje ha sido cuantizado y evaluado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (gemma4_unified), any-to-any: texto, imagen y audio; capas lineales cuantizadas a BFP4 |
| Parametros totales | 12.966.363.184 (dato real de safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP4 (`ttnn.bfloat4_b`, 4,5 bits por peso) en atención q/k/o (48 capas), atención v (40 capas) y MLP gate/up/down (48 capas); bf16 en LM head, embedding, normas y resto de tensores; media de 5,47 bits por peso |
| Idiomas soportados | no disponible (la calibración usó WikiText-2 en inglés y Wikipedia en coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (26,0 GB de repo), con `quant4.json` describiendo el formato de cada proyección; compatible con `transformers` |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-12B-it`, un transformer multimodal con torre de visión (`vision_embedder`) y embeddings de audio (`embed_audio`), que se mantienen en bf16 sin modificar. La intervención de Xylolabs se limita al modelo de lenguaje: las proyecciones de atención (q, k, o en las 48 capas; v en 40 capas) y las del MLP (gate, up, down en las 48 capas) se cuantizan a BFP4 con GPTQ, mientras que el LM head (atado al embedding), las normas y el resto de tensores permanecen en bf16. El empaquetado final promedia 5,47 bits por peso y 8,15 GB empaquetados.

La innovación técnica clave es el uso de block floating point con búsqueda de exponente por bloque: cada bloque comparte un exponente y los pesos se almacenan como valores bf16 situados sobre la rejilla BFP4, de forma que TT-NN los empaqueta sin alterar su valor (verificable con `pack_tensix.py` y `verify_grid.py`). La calibración de GPTQ se realizó sobre 65.536 tokens de WikiText-2 y Wikipedia en coreano. No se dispone de información sobre el número total de tokens de entrenamiento del modelo base, la composición de su dataset ni si se aplicaron RLHF o DPO; esos datos corresponden a la model card de Google y no se incluyen en la información proporcionada.

## Capacidades

- Generación de texto y razonamiento conversacional en formato chat, con plantilla de chat propia (`apply_chat_template`).
- Procesamiento multimodal any-to-any: entrada de imagen y audio mediante `vision_embedder` y `embed_audio`, ambos conservados en bf16.
- Modo de razonamiento ("thinking") disponible en el modelo base, según se deduce de la evaluación con "thinking on" sobre 7 prompts de razonamiento.
- Capacidades multilingües: la calibración incluyó coreano además de inglés, aunque no se detalla la lista oficial de idiomas.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Ejecución en aceleradores Tensix (Wormhole, Blackhole) mediante TT-NN, con empaquetado exacto en `bfloat4_b` y también en `bfloat8_b`.

## Casos de uso

- Despliegue de Gemma 4 en hardware Tenstorrent: cargar el checkpoint directamente en TT-NN sobre Wormhole o Blackhole, aprovechando que los pesos ya están en la rejilla BFP4 y el empaquetado no altera valores; adecuado para equipos que ya operan tt-metal y quieren reducir el espacio de pesos de 23,81 GB a 8,15 GB.
- Inferencia multimodal en el borde con NPU: al conservar en bf16 las torres de visión y audio, el modelo puede atender tareas image-text-to-text y audio-texto en un único dispositivo Blackhole P150, según el demo oficial de tt-metal para Gemma 4.
- Servicio de chat con plantilla integrada: usar `AutoTokenizer.apply_chat_template` y `generate` para asistentes conversacionales; la evaluación confirma que responde correctamente 40 de 40 prompts cortos (33 con comprobación automática más 7 de razonamiento con thinking activado).
- Evaluación comparativa de cuantizaciones: servir como referencia para medir la pérdida de calidad de BFP4 frente a BF16 y frente a Q4_K_M de llama.cpp (KL 0,12030 frente a 0,16924), útil en pipelines de selección de formato para producción.
- Prototipado en simulador: validar pipelines con `ttsim`, el simulador de Blackhole, antes de desplegar en silicio real, verificando el empaquetado con `pack_tensix.py --device` y `verify_grid.py`.
- Investigación sobre cuantización block floating point: el repositorio `tensix-bfp-gptq` y el paper asociado (`arxiv:2607.02770`) permiten reproducir el método GPTQ con búsqueda de exponente por bloque sobre otros modelos.
- Integración con `transformers`: cargar el modelo con `AutoModelForCausalLM.from_pretrained(..., dtype="bfloat16", device_map="auto")` para experimentación en GPU antes de portar a Tensix, ya que los safetensors son legibles por la librería estándar.

## Benchmarks y rendimiento

Datos publicados en la model card (evaluación del modelo de lenguaje únicamente):

| Modelo | Bits por peso | Tamano (GB) | KL medio a BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (google/gemma-4-12B-it) | 16 | 23,81 | 0 | 100 | 40 de 40 | - |
| **Este modelo (BFP4)** | 5,47 | 8,146 | 0,12030 | 87,96 | 40 de 40 | 0 |
| Q4_K_M (llama.cpp) | 4,95 | 7,381 | 0,16924 | 85,52 | 40 de 40 | 0 |

El KL y el top-1 se calculan sobre 8.048 posiciones de texto en inglés y coreano (test de WikiText-2 y Wikipedia en coreano) con la plantilla de chat. Las respuestas corresponden a 33 prompts cortos con comprobación automática más 7 de razonamiento repetidos con thinking activado (40 en total). No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- Memoria de dispositivo: aproximadamente 8,15 GB solo para los pesos del modelo de lenguaje, más espacio para la caché KV y buffers.
- Aceleradores soportados: NPUs Tensix de Tenstorrent, arquitecturas Wormhole y Blackhole. El demo de tt-metal v0.81.1 ejecuta E2B, E4B y 12B en una única Blackhole P150.
- GPU de consumo: no aplica como destino principal; el checkpoint puede cargarse en GPU con `transformers` en bf16 (requiere del orden de 24 GB de VRAM para el modelo completo), pero el objetivo es Tensix.
- Opciones de despliegue: TT-NN (`ttnn.as_tensor` con `dtype=ttnn.bfloat4_b`), tt-metal (demo Gemma 4 v0.81.1), tt-forge/tt-xla (sin soporte verificado para Gemma 4; por defecto mantiene bf16 y su opción `bfp_bf4` recuantiza en layout [out, in] de PyTorch), y `transformers` para inspección o inferencia en GPU.
- Simulación: `ttsim` (simulador de Blackhole) verificado con ttnn 0.81.1.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / bits por peso | Tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (BFP4, Tensix) | 12,97 B | no disponible | BFP4 + bf16, 5,47 bits | 8,146 GB | Apache 2.0 | Hugging Face, 93 descargas |
| google/gemma-4-12B-it (BF16) | 12,97 B | no disponible | BF16, 16 bits | 23,81 GB | Apache 2.0 | Hugging Face (modelo base) |
| Q4_K_M (llama.cpp) del mismo checkpoint | 12,97 B | no disponible | GGUF Q4_K_M, 4,95 bits | 7,381 GB | Apache 2.0 (derivada) | Generado con llama.cpp a partir del mismo checkpoint |

La comparación se limita a variantes del mismo modelo base porque la información proporcionada no incluye datos sobre modelos alternativos de otros autores. Frente a Q4_K_M, esta exportación ocupa más espacio (8,146 frente a 7,381 GB) pero obtiene mejor KL (0,12030 frente a 0,16924) y mejor top-1 (87,96 % frente a 85,52 %), a cambio de estar atada al ecosistema TT-NN.

## Limitaciones y advertencias

- Solo se cuantizó y evaluó el modelo de lenguaje; las torres de visión y audio permanecen en bf16 y no se han validado en esta exportación.
- La evaluación se limita a 8.048 posiciones de texto en inglés y coreano y a 40 prompts cortos; no hay benchmarks estándar (MMLU, HumanEval, GSM8K) que permitan comparaciones amplias.
- Pérdida de calidad medible frente a BF16: KL medio de 0,12030 y top-1 del 87,96 %, con degradación esperable en tareas distintas de las evaluadas.
- El formato BFP4 solo es eficiente en hardware Tensix; en GPU u otros aceleradores no aporta ventajas y requiere conversión.
- tt-transformers no soporta Gemma 4; el demo de tt-metal v0.81.1 no ofrece opción `bfloat4_b`, por lo que sin entrada en `precision_overrides.json` los módulos cargan en bf16 (exacto) y con la entrada indicada se empaquetan en `bfloat8_b` (también exacto, verificado en las 2 primeras capas).
- tt-forge (tt-xla) no se ha ejecutado con Gemma 4; su opción `bfp_bf4` recuantiza en layout [out, in] de PyTorch, lo que puede alterar los valores respecto a este empaquetado.
- No se dispone de información sobre sesgos, riesgo de alucinación ni idiomas oficialmente soportados del modelo base en la documentación proporcionada; deben consultarse en la model card de Google.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base de Google antes de producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/gemma-4-12B-it-Tenstorrent-Tensix-BFP4
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Repositorio de código (tensix-bfp-gptq): https://github.com/XylolabsInc/tensix-bfp-gptq
- Paper asociado: https://arxiv.org/abs/2607.02770
- Demo Gemma 4 en tt-metal v0.81.1: https://github.com/tenstorrent/tt-metal/tree/v0.81.1/models/demos/gemma4
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Licencia: https://huggingface.co/Xylolabs/gemma-4-12B-it-Tenstorrent-Tensix-BFP4/blob/main/LICENSE
