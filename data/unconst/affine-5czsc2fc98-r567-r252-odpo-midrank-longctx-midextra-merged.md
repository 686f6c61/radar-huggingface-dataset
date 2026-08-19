# unconst/Affine-5czsc2fc98-r567-r252-odpo-midrank-longctx-midextra-merged

## Resumen

Affine-5czsc2fc98-r567-r252-odpo-midrank-longctx-midextra-merged es un modelo de lenguaje de 35 107 millones de parámetros desarrollado por el usuario `unconst`. Según las etiquetas de HuggingFace, se trata de una arquitectura MoE basada en Qwen3.5 (tag `qwen3_5_moe`), aunque los detalles arquitectónicos concretos no se documentan en la model card. El modelo es el resultado de un entrenamiento de DPO (Direct Preference Optimization) offline sobre pares de preferencia de razonamiento, aplicado sobre un modelo base previo (`unconst/Affine-5czsc2fc98-r252-merged`). El entrenamiento se centró en optimizar el "Reason v3" (teacher-side only) y utilizó filtros de contexto largo (`LongCtx`), con una longitud máxima de secuencia de 16 384 tokens.

Este modelo forma parte de una serie de experimentos iterativos (R567) orientados a mejorar el razonamiento mediante alineación por preferencias. Su relevancia radica en que combina una arquitectura MoE de gran tamaño con un enfoque de DPO offline sobre datos de duelo de razonamiento, lo que lo hace interesante para investigación en alineación y razonamiento avanzado. Sin embargo, al no haberse publicado benchmarks ni detalles de capacidades específicas, su evaluación práctica requiere pruebas adicionales. La licencia Apache 2.0 permite uso comercial y modificación, aunque el modelo se distribuye únicamente en formato safetensors (70,2 GB) y no se han publicado cuantizaciones alternativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (basado en Qwen3.5, según tag `qwen3_5_moe`; detalles no disponibles) |
| Parametros totales | 35 107 181 936 (≈35,1 B) |
| Parametros activos | no disponible |
| Longitud de contexto | 16 384 tokens (max_len de entrenamiento) |
| Tipos de cuantizacion | no disponible (solo safetensors en el repositorio) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura exacta no se detalla en la información proporcionada. El tag `qwen3_5_moe` sugiere que se trata de un modelo de mezcla de expertos (MoE) derivado de la familia Qwen3.5, pero no se especifican el número de expertos, la dimensión oculta ni el mecanismo de atención. El nombre "Affine" podría indicar el uso de capas afines o una variante arquitectónica propia, pero no hay documentación al respecto.

El entrenamiento consistió en DPO offline sobre pares de preferencia de razonamiento generados mediante "duelos" entre respuestas del modelo. El método seleccionaba como respuesta preferida aquella con mayor diferencia de log-probabilidad condicionada a un "pensamiento" (lpC(y_C|z) − lpC(y_C|∅)), optimizando únicamente el lado del teacher (Reason v3). Se utilizó LoRA con r=32, α=128, β=0.02, una tasa de aprendizaje de 5e-6 y un máximo de 1800 pasos, aunque el entrenamiento se detuvo en el paso 312 por agotamiento de los datos. El dataset, `dpo_duel_reason.jsonl`, fue filtrado por contexto largo (`LongCtx`). El entrenamiento se realizó en 2 GPUs B300 (de un total de 8) durante una época, y el modelo final se obtuvo mediante fusión de los adaptadores LoRA con el modelo base.

## Capacidades

- Generación de texto y razonamiento: al ser un LLM entrenado con DPO sobre pares de razonamiento, se espera que tenga capacidades mejoradas de razonamiento lógico y matemático, aunque no se han publicado evaluaciones específicas.
- Contexto largo: soporta secuencias de hasta 16 384 tokens, lo que permite procesar documentos extensos o conversaciones multi-turno.
- Multilingüismo: no se ha indicado qué idiomas soporta; se asume que podría heredar las capacidades del modelo base Qwen3.5, pero no está confirmado.
- Tool calling / function calling: no se menciona en la información disponible.
- Capacidades de agente o multi-step reasoning: no se mencionan explícitamente, aunque el entrenamiento en razonamiento sugiere potencial en tareas de cadena de pensamiento.
- Otras capacidades (visión, audio): no disponibles.

## Casos de uso

- Análisis de documentos extensos: gracias a su contexto de 16 384 tokens, el modelo puede procesar informes, contratos o artículos científicos completos en una sola pasada, resumiendo o extrayendo información clave sin necesidad de dividir el texto.
- Razonamiento matemático y lógico: su entrenamiento con DPO sobre pares de razonamiento lo hace adecuado para resolver problemas de matemáticas, lógica formal o puzzles que requieran cadenas de deducción.
- Asistencia en investigación: puede ayudar a generar hipótesis, revisar literatura o estructurar argumentos complejos, aprovechando su capacidad de razonamiento y contexto largo.
- Generación de código: aunque no está confirmado, los modelos MoE basados en Qwen suelen tener buen rendimiento en tareas de programación; podría usarse para generar o depurar código, siempre que se valide su comportamiento.
- Chat conversacional con memoria extendida: su ventana de contexto permite mantener conversaciones largas con historial completo, útil para asistentes virtuales o tutorías.
- Sistemas de pregunta-respuesta sobre corpus largos: puede responder preguntas basadas en documentos extensos (por ejemplo, manuales técnicos o bases de conocimiento) sin necesidad de recuperación externa, gracias a su contexto amplio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 35,1 B parámetros en FP16/BF16 se necesitan aproximadamente 70 GB de VRAM. Con cuantización de 8 bits se reduciría a ~35 GB, y con 4 bits a ~17,5 GB, pero no se han publicado cuantizaciones oficiales.
- GPU recomendadas: para FP16, una NVIDIA A100 80GB o H100 80GB; para cuantización 4-bit, una RTX 4090 (24 GB) podría ser suficiente si se dispone de los archivos cuantizados.
- Si cabe en consumer GPU: solo con cuantización agresiva (4-bit) y posiblemente con técnicas de offloading a CPU; no es viable en GPU de gama media sin cuantización.
- Opciones de despliegue: al estar en formato safetensors, se puede servir con frameworks como vLLM, TGI o Transformers, siempre que soporten arquitecturas MoE. Para cuantización, se necesitaría convertir a GGUF o usar herramientas como llama.cpp (si el modelo es compatible).
- Latencia y throughput: no se han publicado datos; dependerá del hardware y del framework de inferencia.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable con otros modelos de la misma categoría (MoE de ~35B). El tag `qwen3_5_moe` sugiere que podría compararse con Qwen3.5 MoE, pero no se conocen sus especificaciones. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no se ha documentado ningún análisis de sesgos; al derivar de un modelo base no especificado, podría heredar sesgos presentes en los datos de entrenamiento originales.
- Riesgo de alucinación: como cualquier LLM, puede generar información plausible pero incorrecta, especialmente en tareas de razonamiento complejo o cuando se le piden datos factuales.
- Limitaciones de contexto e idioma: aunque soporta 16 384 tokens, no se ha verificado su comportamiento en otros idiomas distintos del inglés (probablemente el idioma principal de entrenamiento, aunque no se confirma).
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificación, pero no se especifican restricciones adicionales sobre el uso de los pesos o la atribución.
- Advertencias para producción: al no haber benchmarks ni pruebas de robustez, no se recomienda su uso en entornos productivos sin una evaluación exhaustiva previa. Además, el repositorio tiene 0 descargas y 0 likes, lo que indica que es un modelo experimental sin validación comunitaria.

## Enlaces

- [HuggingFace: unconst/Affine-5czsc2fc98-r567-r252-odpo-midrank-longctx-midextra-merged](https://huggingface.co/unconst/Affine-5czsc2fc98-r567-r252-odpo-midrank-longctx-midextra-merged)
- [Modelo base: unconst/Affine-5czsc2fc98-r252-merged](https://huggingface.co/unconst/Affine-5czsc2fc98-r252-merged)
