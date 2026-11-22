# SourceHat-Labs/Inkling-2-Mini-EXL3-8.6bpw

## Resumen

Inkling-2-Mini-EXL3-8.6bpw es una cuantización EXL3 del modelo post-entrenado Inkling 2 Mini, desarrollado originalmente por Thinking Machines y convertido por SourceHat-Labs. Se trata de un checkpoint de pesos (weight-only) que preserva la arquitectura original del modelo base: un transformer con decodificador de tres pasadas fijas, expertos enrutados tipo MoE, capacidades de visión y un draft nativo DSpark para decodificación especulativa. El modelo cuenta con 14.182.823.424 parámetros totales y un payload de tensores de 28.366.156.800 bytes a 8,600230 bits por peso efectivos.

La relevancia de esta conversión radica en que el modelo base ya venía empaquetado en una mezcla de NVFP4 y MXFP8, y esta versión lo reempaqueta en EXL3 con expertos enrutados a 8,0 bpw, manteniendo la cabeza de salida en BF16 original. Esto permite servir el modelo en configuraciones de GPU de 48 GiB (dos peticiones activas) y 64 GiB (cuatro peticiones activas), que son los objetivos de servicio declarados por el autor de la conversión.

Es importante señalar que este checkpoint no es cargable directamente con Transformers estándar ni con ExLlamaV3 de serie: requiere un runtime específico consciente de Inkling que soporte el decodificador de tres pasadas, los expertos EXL3, la visión y el DSpark nativo. El runtime no se incluye en el repositorio. La licencia declarada es Apache 2.0, sujeta además a la Política de Uso Aceptable del modelo de Thinking Machines.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con decodificador de tres pasadas fijas, expertos enrutados (MoE), vision y draft nativo DSpark |
| Parametros totales | 14.182.823.424 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 8,0 bpw en expertos enrutados; cabeza de salida en BF16; origen en mezcla NVFP4 y MXFP8 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (sujeta a Model Acceptable Use Policy de Thinking Machines) |
| Formato de pesos | safetensors (checkpoint EXL3 weight-only) |

## Arquitectura y entrenamiento

El modelo base Inkling 2 Mini emplea un transformer con un decodificador de tres pasadas fijas, una variante arquitectónica que el runtime debe soportar de forma explícita. Incorpora expertos enrutados (MoE) y capacidades de visión, además de un draft nativo DSpark en INT8 para decodificación especulativa, que añade 327.863.072 bytes de tensores al payload. Esta conversión EXL3 no añade entrenamiento: parte de la revisión `ed40e7da625f594fc9c4990f5f66be24873c22d7` del modelo post-entrenado original, que ya estaba empaquetado en una mezcla de NVFP4 y MXFP8, y lo reempaqueta con expertos enrutados a 8,0 bpw EXL3 y cabeza de salida BF16 original.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de RLHF o DPO aplicadas al modelo base en la información proporcionada. La innovación técnica destacable de esta release es el reempaquetado de cuantización con preservación del draft DSpark nativo y de la cabeza de salida en BF16, orientado a objetivos de servicio concretos en GPU de 48 y 64 GiB.

## Capacidades

- Generación de texto y razonamiento: el modelo base es un modelo post-entrenado orientado a instrucciones.
- Capacidades de visión: el checkpoint incluye soporte de visión, según declara el autor de la conversión.
- Decodificación especulativa: incorpora un draft nativo DSpark en INT8 que acelera la generación.
- Expertos enrutados (MoE): arquitectura con expertos especializados enrutados por token.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Servicio de inferencia en GPU de 48 GiB: el autor declara dos peticiones activas como objetivo de servicio en esta configuración, adecuado para despliegues de capacidad media con el runtime Inkling-aware.
- Servicio de inferencia en GPU de 64 GiB: el autor declara cuatro peticiones activas como objetivo, orientado a mayor concurrencia por nodo.
- Procesamiento de documentos con visión: al incluir capacidades de visión, el modelo puede emplearse en tareas que combinen texto e imagen dentro del mismo pipeline, siempre que el runtime soporte la ruta de visión.
- Generación acelerada con decodificación especulativa: el draft DSpark nativo permite reducir la latencia por token en entornos de serving que implementen la decodificación especulativa del runtime.
- Investigación sobre cuantización EXL3: útil para estudiar el impacto de reempaquetar un modelo ya cuantizado en NVFP4/MXFP8 a EXL3 8,0 bpw sobre calidad y rendimiento.
- Evaluación comparativa de MoE cuantizados: sirve como punto de comparación frente a otras conversiones del mismo modelo base en distintos formatos y bitrates.
- Despliegue en infraestructura con VRAM limitada frente al BF16: el payload de 28,7 GB en repositorio permite ajustar el presupuesto de memoria frente a una versión sin cuantizar, a costa de requerir un runtime específico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que las mediciones de servicio y evaluación emparejada son independientes de la release de pesos.

## Requisitos de hardware

- VRAM estimada: el payload de tensores es de 28.366.156.800 bytes (aproximadamente 26,4 GiB) más 327.863.072 bytes del draft DSpark (aproximadamente 0,3 GiB); el repositorio ocupa 28,7 GB. Estas son medidas de pesos, no de memoria CUDA en ejecución.
- Objetivos de servicio declarados: dos peticiones activas en GPU de 48 GiB y cuatro peticiones activas en GPU de 64 GiB.
- GPU recomendadas: no se especifican modelos concretos; los objetivos de memoria apuntan a GPUs profesionales de 48 GiB (por ejemplo, A6000, L40S) y 64 GiB (por ejemplo, A100 80GB no aplica por exceso, H100 NVL, MI210), aunque el autor no las nombra.
- Viabilidad en GPU de consumo: no disponible; no se confirma soporte en RTX 4090 ni en otras GPUs consumer.
- Opciones de despliegue: requiere un runtime Inkling-aware que soporte el decodificador de tres pasadas, expertos EXL3, visión y DSpark nativo. Transformers estándar y ExLlamaV3 no cargan este pack directamente. El runtime no se incluye.
- Latencia y throughput: no disponibles; el autor no publica mediciones de servicio en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Runtime |
|---|---|---|---|---|---|
| Inkling-2-Mini-EXL3-8.6bpw | 14.182.823.424 | no disponible | EXL3 8,0 bpw + BF16 head | Apache 2.0 + AUP | Runtime Inkling-aware (no incluido) |
| thinkingmachines/Inkling-2-Mini (base) | no disponible | no disponible | NVFP4 + MXFP8 mixto | Apache 2.0 + AUP | Runtime Inkling-aware |
| Otras conversiones del mismo base | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de otros desarrolladores en la documentación proporcionada.

## Limitaciones y advertencias

- No es cargable con Transformers estándar ni con ExLlamaV3 de serie; requiere un runtime Inkling-aware que no se distribuye en el repositorio.
- Checkpoint weight-only: no incluye código de inferencia, tokenizador ni configuración de serving.
- El autor no publica mediciones de memoria CUDA reales, latencia ni throughput; los tamaños indicados son de pesos.
- Las capacidades de tool calling, agentes, multilingüismo y modo thinking no están documentadas en la información disponible y no deben asumirse.
- El número de parámetros activos y la longitud de contexto del modelo base no están disponibles en la información proporcionada.
- Licencia Apache 2.0 sujeta a la Model Acceptable Use Policy de Thinking Machines; es necesario revisar dicha política antes de un uso comercial.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; deben evaluarse empíricamente antes de producción.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.
- La fecha de creación (2026-11-21) y la revisión del modelo base deben verificarse antes de desplegar en producción.

## Enlaces

- Hugging Face: https://huggingface.co/SourceHat-Labs/Inkling-2-Mini-EXL3-8.6bpw
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Model Acceptable Use Policy: https://thinkingmachines.ai/model-acceptable-use-policy/
