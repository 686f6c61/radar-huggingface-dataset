# vcruz305/Inkling-2-Mini-SAGE-REXL3-4.23bpw

## Resumen

Inkling-2-Mini-SAGE-REXL3-4.23bpw es una cuantización en formato EXL3/REXL3 del modelo multimodal `thinkingmachines/Inkling-2-Mini`, publicada por el usuario vcruz305. El modelo base lo desarrolla Thinking Machines Lab y acepta entradas de texto e imagen para generar texto, con una arquitectura `Inkling2LoopForConditionalGeneration` de tipo MoE con bucle (24 capas / 48 pasadas), un codificador ViT y una cabeza de draft especulativo (MTP). El checkpoint original declara 26.400 millones de parámetros totales y 3.400 millones activos por pasada (5.400 millones efectivos a lo largo de tres pasadas de bucle).

El pack cuantizado reduce el peso a 4,23 bits por peso y lo empaqueta en 14,00 GiB residentes en dispositivo, lo que permite ejecutarlo en GPUs de consumo de 24 GB o superiores. Según el autor, mantiene un 98,33 % de acuerdo top-1 y una divergencia KL media de 0,0088 frente al checkpoint fuente, medidos con logits en float64 sobre el vocabulario completo. El método de cuantización SAGE es propietario y no está publicado.

La relevancia actual reside en que hace viable en hardware asequible un modelo multimodal de contexto muy largo (262.144 tokens nativos, hasta 1M con caché KV en Q4 y 32 GB de VRAM), con decodificación especulativa integrada y licencia Apache 2.0, algo poco habitual en modelos MoE multimodales de este tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Inkling2LoopForConditionalGeneration`: MoE con bucle de 24 capas / 48 pasadas, ViT para visión y cabeza MTP de draft especulativo |
| Parametros totales | 7.397.631.360 en el checkpoint cuantizado; 26,4B declarados en el modelo base |
| Parametros activos | 3,4B por pasada; 5,4B efectivos en 3 pasadas de bucle |
| Longitud de contexto | 262.144 tokens nativos; hasta 1.048.576 con caché KV en Q4 sobre 32 GB o más |
| Tipos de cuantizacion | EXL3 con método SAGE (precisión mixta), 4,23 bits por peso; distintos valores de `K` por tensor |
| Idiomas soportados | Inglés y soporte multilingüe general |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (EXL3/REXL3), 2 shards de tronco más `mtp.safetensors` |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE con un mecanismo de bucle: 24 capas físicas que se recorren hasta 48 pasadas, de las cuales 8 son de atención completa y el resto emplean ventana deslizante y estado convolucional. Incorpora un codificador de visión (ViT) para entradas de imagen y una cabeza de predicción multi-token (MTP) que actúa como draft especulativo para acelerar la decodificación. El checkpoint cuantizado conserva esa arquitectura íntegra y solo altera la precisión numérica de los tensores de pesos.

La información disponible no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO en el modelo original. El pack cuantizado se generó con el método SAGE del autor, de precisión mixta y no publicado, aplicado sobre el checkpoint `6e7c8248f75265bdd4fbab5273304243b5d8c2cb`. Los tensores usan valores de `K` distintos y los kernels de EXL3 los leen del propio tensor trellis al cargar, por lo que no requiere configuración manual por capa.

## Capacidades

- Generación de texto e instrucciones conversacionales multi-turno.
- Comprensión de imágenes (pipeline `image-text-to-text`) con salida textual.
- Razonamiento y matemáticas de uso general, según la model card del modelo base.
- Generación de código en múltiples lenguajes de programación.
- Soporte declarado para sistemas agénticos y uso de herramientas (tool use).
- Soporte multilingüe general, con inglés como idioma principal.
- Contexto largo de 262.144 tokens nativos, ampliable a 1M.
- Decodificación especulativa integrada mediante la cabeza MTP (`mtp.safetensors`).
- Compatible con ajuste fino a través de la plataforma Tinker del proveedor original.

## Casos de uso

- Atención al cliente automatizada: conversaciones multi-turno con historial extenso gracias a la ventana de 262.144 tokens, que permite mantener contexto de varias interacciones sin truncar.
- Análisis de documentos largos con imágenes: informes, facturas o contratos escaneados combinados con texto, procesados en una sola pasada al aceptar entrada multimodal y contexto amplio.
- Asistentes de código en producción: generación y revisión de código con soporte de tool calling, integrable en pipelines que invocan linters, tests o APIs externas.
- Agentes multi-paso: la cabeza MTP y el bucle de 48 pasadas favorecen la latencia en razonamiento iterativo, adecuado para orquestación de tareas con varias llamadas encadenadas.
- RAG sobre corpus extensos: la ventana de 1M tokens con caché KV en Q4 permite inyectar grandes bloques de documentación recuperada sin fragmentación agresiva.
- Despliegue en estaciones de trabajo con GPU de consumo: al ocupar 14,00 GiB, cabe en una RTX 4090 o 3090 de 24 GB, lo que habilita prototipado local de aplicaciones multimodales sin infraestructura de centro de datos.
- Investigación y ajuste fino: licencia Apache 2.0 y pesos abiertos permiten experimentación académica y adaptación con Tinker.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| Acuerdo top-1 (frente al checkpoint fuente) | 98,33 % |
| Divergencia KL media (float64, vocabulario completo) | 0,0088 |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la información disponible. Las métricas anteriores miden la fidelidad de la cuantización respecto al modelo original, no su calidad absoluta.

## Requisitos de hardware

- Peso residente en dispositivo: 15.032.344.840 bytes (14,00 GiB) entre dos shards de tronco y el sidecar `mtp.safetensors`.
- Caché KV en Q4: 8.704 B/token para las 8 pasadas de atención completa, 9.792 B/token con la capa de draft; aproximadamente 0,17 GiB de estado fijo de ventana deslizante y convolución, más unos 1,5 GiB de scratch en tiempo de ejecución.
- GPU de 24 GB (RTX 4090, RTX 3090): contexto máximo estimado de unos 760K tokens con draft y 860K sin draft; no alcanza 1M completo (requeriría 24,2–25,2 GiB).
- GPU de 32 GB (RTX 5090): 1M completo, con margen hasta aproximadamente 1,59M–1,79M tokens.
- GPU de 48 GB o más, o 1x DGX Spark: 1M completo con caché KV en Q4, Q8 o BF16 (31,8–33,8 GiB en Q8).
- Despliegue: librería `exllamav3` mediante `Model.from_directory`, `Config.from_model`, `Cache` y `Tokenizer`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini-SAGE-REXL3-4.23bpw (este) | 7,4B en checkpoint; 26,4B totales / 3,4B activos en base | 262.144 nativo, hasta 1M | Apache 2.0 | safetensors EXL3 | Multimodal, MoE con bucle, draft MTP |
| thinkingmachines/Inkling-2-Mini (original) | 26,4B totales / 3,4B activos | 262.144 nativo | Apache 2.0 | safetensors (NVFP4/MXFP8) | Checkpoint sin cuantizar, ~20 GB |
| Alternativas de terceros de tamaño y tarea equivalentes | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de comparación en la información proporcionada |

## Limitaciones y advertencias

- El método de cuantización SAGE es propietario y no está publicado, lo que dificulta auditar cómo se distribuye la precisión entre capas.
- Las métricas de fidelidad (98,33 % top-1, KLD 0,0088) las reporta el autor del pack; no se han verificado de forma independiente en la información disponible.
- No hay benchmarks de tareas publicados para este pack, por lo que el impacto real de la cuantización en razonamiento, código o visión no está cuantificado.
- El idioma principal es el inglés; el soporte multilingüe es general y sin garantías específicas por idioma.
- Riesgo de alucinación inherente a los modelos generativos; no se documentan mitigaciones específicas.
- Sesgos conocidos: no documentados en la información proporcionada.
- En GPUs de 24 GB no cabe el contexto completo de 1M tokens; requiere 32 GB o más para aprovechar la ventana máxima.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base remite a una política de uso aceptable de Thinking Machines Lab que conviene revisar antes de desplegar en producción.
- El modelo base se distribuye en precisión mixta NVFP4/MXFP8; este pack EXL3 requiere la librería `exllamav3`, lo que limita la portabilidad frente a otros runtimes (vLLM, llama.cpp, Ollama, TGI no están indicados como soportados).

## Enlaces

- Pack cuantizado: https://huggingface.co/vcruz305/Inkling-2-Mini-SAGE-REXL3-4.23bpw
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Playground de Tinker: https://tinker.thinkingmachines.ai/playground
- Tinker Cookbook: https://github.com/thinking-machines-lab/tinker-cookbook
- Paquete tml-renderers: https://pypi.org/project/tml-renderers/
- Política de uso aceptable: https://thinkingmachines.ai/model-acceptable-use-policy/
