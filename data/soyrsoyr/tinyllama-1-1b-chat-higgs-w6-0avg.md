# soyrsoyr/TinyLlama-1.1B-Chat-HIGGS-W6.0avg

## Resumen

El modelo `soyrsoyr/TinyLlama-1.1B-Chat-HIGGS-W6.0avg` es una versión cuantizada de TinyLlama-1.1B-Chat-v1.0, desarrollada por el usuario soyrsoyr. Utiliza el método HIGGS (Heuristic ILP-Guided Grouped Scheme), que aplica programación lineal entera (ILP) para asignar de forma automática una precisión de cuantización óptima a cada capa del modelo según su sensibilidad al error cuadrático medio (MSE). El resultado es un modelo con cuantización mixta de precisión promedio de 6.0 bits, combinando los esquemas W4A16 y W8A16, que reduce el tamaño del modelo a aproximadamente 1.0 GB manteniendo la calidad en las capas más sensibles.

Este modelo fue creado principalmente para validar la integración entre HIGGS y ModelFreePtqConverter en el proyecto llm-compressor. Se trata de un modelo de lenguaje pequeño con 1.100.048.384 parámetros y arquitectura Transformer (Llama), adecuado para entornos con recursos limitados. No se dispone de información sobre la longitud de contexto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Llama) |
| Parámetros totales | 1.100.048.384 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | W4A16 y W8A16 (mixto, 6.0 bits promedio); formato pack-quantized (compressed-tensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (según model card) |
| Formato de pesos | safetensors (compressed-tensors, pack-quantized) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Transformer del modelo TinyLlama-1.1B-Chat-v1.0, que sigue el diseño Llama. La cuantización se realizó mediante HIGGS, un método que resuelve un problema de programación lineal entera para asignar automáticamente esquemas de cuantización (W4A16 o W8A16) a cada capa lineal, minimizando el error cuadrático medio. El resultado son 42 capas con 4 bits (capas MLP tempranas y medias) y 112 capas con 8 bits (todas las capas de atención y las MLP tardías), lo que produce una precisión media de 6.0 bits.

La integración se validó con ModelFreePtqConverter en llm-compressor. Los datos de entrenamiento del modelo base no se han especificado en la información disponible; el README no menciona el conjunto de datos ni el proceso de alineación (RLHF/DPO). Tampoco se detalla el número total de tokens de entrenamiento.

## Capacidades

- Generación de texto conversacional: el modelo hereda la capacidad de diálogo del modelo base TinyLlama-1.1B-Chat-v1.0.
- Soporte de tool calling / function calling: no disponible en la información.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información.
- Capacidades multilingües: no disponible en la información.
- Capacidad especial: cuantización mixta de precisión con asignación por capas basada en ILP, que permite un equilibrio entre tamaño y calidad.

## Casos de uso

- Asistentes conversacionales en dispositivos con memoria limitada: el modelo, con un peso de 1.0 GB, puede ejecutarse en hardware de bajo consumo, como ordenadores de placa reducida o mini-PC, para chatbots simples de una sola tarea.
- Clasificación de texto en tiempo real: por su tamaño reducido y su baja latencia de inferencia, puede integrarse en pipelines de procesamiento de texto para clasificar documentos, sentimientos o categorías en entornos con recursos ajustados.
- Generación de respuestas en sistemas de soporte al cliente: respuestas cortas y automáticas para preguntas frecuentes en producción, donde el coste de GPU es un factor crítico y no se requiere una ventana de contexto muy larga.
- Prototipado de aplicaciones con LLM: permite probar flujos de trabajo, prompts y sistemas de orquestación sin necesidad de GPUs potentes, reduciendo el coste de experimentación.
- Fine-tuning eficiente sobre datasets propios: al tener solo 1.100 millones de parámetros, el ajuste fino requiere menos recursos y es viable en una GPU de gama media, lo que facilita la adaptación a dominios específicos.
- Validación de técnicas de cuantización: sirve como banco de pruebas para evaluar la integración de HIGGS y ModelFreePtqConverter en llm-compressor, tanto en términos de calidad como de rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio pesa 1.0 GB. Con los pesos en 6 bits, se estima que la carga del modelo requiere entre 1.0 y 1.5 GB de VRAM, más la memoria para activaciones y caché. Se recomienda una GPU con al menos 2 GB de VRAM.
- GPU recomendadas: no se especifican. Por tamaño, es compatible con GPUs de gama baja como RTX 3050 o RTX 4060; también es posible ejecutarlo en CPU con suficiente RAM mediante transformers.
- Compatibilidad con GPUs de consumo: sí, es viable en GPUs de consumo con 2 GB o más de VRAM.
- Opciones de despliegue: vLLM y transformers con compressed-tensors (según el README). No se menciona soporte para llama.cpp u Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia |
|---|---|---|---|---|
| TinyLlama-1.1B-Chat-v1.0 | 1.1B | no disponible | sin cuantizar | Apache 2.0 |
| soyrsoyr/TinyLlama-1.1B-Chat-HIGGS-W6.0avg | 1.1B | no disponible | W4A16+W8A16, 6 bits promedio | Apache 2.0 |
| Otras alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no se proporciona información sobre sesgos en la información disponible.
- Riesgo de alucinación: no se han publicado evaluaciones; al ser un modelo pequeño, es previsible que sea más propenso a errores que modelos de mayor tamaño.
- Limitaciones de contexto o idioma: no disponible.
- Restricciones de licencia: la licencia Apache 2.0 permite el uso comercial, pero requiere mantener el aviso de licencia y la atribución correspondiente.
- Degradación por cuantización: las capas cuantizadas a 4 bits pueden sufrir una pérdida de calidad. No se han publicado evaluaciones de calidad tras la cuantización, por lo que no se puede confirmar el impacto real en el rendimiento.
- Advertencia para producción: el modelo fue creado para validar una integración técnica, no para uso productivo. No se dispone de evaluaciones comparativas con el modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/soyrsoyr/TinyLlama-1.1B-Chat-HIGGS-W6.0avg
- Modelo base: https://huggingface.co/TinyLlama/TinyLlama-1.1B-Chat-v1.0
- Repositorio llm-compressor: https://github.com/vllm-project/llm-compressor
- PR #2935: https://github.com/vllm-project/llm-compressor/pull/2935
- PR #3028: https://github.com/vllm-project/llm-compressor/pull/3028
