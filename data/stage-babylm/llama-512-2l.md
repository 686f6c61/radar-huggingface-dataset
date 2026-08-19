# stage-babylm/llama-512-2L

## Resumen

El modelo `stage-babylm/llama-512-2L` es un pequeño modelo de lenguaje basado en la arquitectura Llama, desarrollado por el proyecto Stage BabyLM, que investiga el aprendizaje de modelos de lenguaje con cantidades limitadas de datos (del orden de millones de palabras). Con solo 7.318.016 parámetros y una ventana de contexto de 512 tokens, está diseñado para experimentos de eficiencia de datos y para servir como banco de pruebas en entornos con recursos muy reducidos.

El nombre del modelo indica su configuración: arquitectura Llama, contexto de 512 tokens y 2 capas de transformador. Se trata de un modelo de generación de texto que, según la model card, fue ajustado (fine-tuning) sobre un modelo base no especificado, con una pérdida de validación final de 1.7967. Aunque el repositorio tiene un tamaño de 3.5 GB (probablemente debido a archivos adicionales), los pesos reales en safetensors ocupan solo unos pocos megabytes.

Su relevancia radica en que permite estudiar cómo se comportan arquitecturas compactas cuando se entrenan con datos escasos, un área clave para democratizar la IA y reducir la huella computacional. Sin embargo, por su tamaño, no está pensado para tareas complejas ni para uso en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama (transformer causal, 2 capas) |
| Parametros totales | 7.318.016 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (también compatible con transformers y text-generation-inference) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Llama original: un transformer decoder-only con atención causal, normalización RMSNorm y activaciones SwiGLU. La configuración concreta (número de cabezas, dimensiones ocultas, etc.) no se detalla en la documentación disponible, pero el nombre "2L" indica que consta de 2 capas de transformador, lo que explica su reducido número de parámetros.

El entrenamiento se realizó mediante fine-tuning sobre un modelo base no especificado, utilizando un dataset desconocido. Los hiperparámetros reportados incluyen una tasa de aprendizaje de 0.0018, tamaño de lote de 32, optimizador AdamW con betas (0.9, 0.95) y epsilon 1e-6, scheduler de tipo coseno con warmup del 5% de los pasos, y una sola época. La pérdida de validación final fue de 1.7967, con una pérdida de entrenamiento de 1.7690. No se indica el número de tokens de entrenamiento ni la composición del dataset, lo que limita el análisis de su procedimiento de entrenamiento.

## Capacidades

- Generación de texto básica: puede producir texto coherente a corto plazo, aunque con limitaciones evidentes por su tamaño.
- Razonamiento limitado: no es capaz de resolver tareas que requieran múltiples pasos lógicos o comprensión profunda.
- Sin soporte de tool calling o function calling: no hay evidencia de que el modelo haya sido entrenado para invocar herramientas.
- Sin capacidades de agentes o multi-step reasoning: su contexto de 512 tokens y su arquitectura pequeña impiden este tipo de uso.
- Multilingüismo: no hay información sobre los idiomas soportados; probablemente entrenado solo con datos en inglés (por el contexto BabyLM), pero no se puede confirmar.
- Sin capacidades especiales (visión, audio, etc.): es un modelo puramente textual.

## Casos de uso

- Investigación académica en eficiencia de datos: el modelo es adecuado para estudiar cómo varía el rendimiento de una arquitectura Llama cuando se entrena con corpus muy pequeños, por ejemplo, comparando diferentes estrategias de regularización o aumento de datos.
- Enseñanza y demostraciones educativas: sirve como ejemplo práctico para explicar el funcionamiento interno de un transformer y el proceso de fine-tuning, dado su tamaño reducido que permite ejecutarlo en CPU.
- Pruebas de pipelines de inferencia: permite validar flujos de trabajo con Hugging Face Transformers, vLLM o TGI sin necesidad de grandes recursos, ideal para integrar en CI/CD de proyectos de MLOps.
- Generación de texto experimental: se puede utilizar para explorar estilos de escritura o generar fragmentos cortos en contextos controlados, aunque con calidad limitada.
- Comparación de cuantizaciones y optimizaciones: al ser tan pequeño, es útil para probar técnicas de cuantización (por ejemplo, GPTQ, AWQ) o compilación con ONNX Runtime en entornos de bajos recursos.
- Prototipado de chatbots simples: con un prompt adecuado y restricciones de contexto, podría generar respuestas cortas en tareas de dominio muy específico, pero no es recomendable para uso real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una sección de resultados vacía, y no se encontraron referencias externas a evaluaciones estándar como MMLU, HumanEval o GSM8K. El único dato de rendimiento es la pérdida de validación (1.7967) reportada durante el entrenamiento, que no es comparable con otros modelos sin contexto adicional.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en FP32, y mucho menos en cuantizaciones de 8 bits o 4 bits (aunque no se proporcionan oficialmente).
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM (por ejemplo, NVIDIA GTX 1050, RTX 2050, o incluso integradas). También funciona en CPU.
- Cabe en consumer GPU: sí, en prácticamente cualquier GPU moderna.
- Opciones de despliegue: Hugging Face Transformers, vLLM, TGI, llama.cpp (si se convierten los pesos a GGUF), Ollama (con conversión previa), o simplemente en CPU con PyTorch.
- Latencia y throughput: no se dispone de datos medidos, pero al ser un modelo de 7M de parámetros, la inferencia es extremadamente rápida, del orden de milisegundos por token en GPU y decenas de milisegundos en CPU.

## Comparativa con modelos similares

No se dispone de comparativas oficiales con otros modelos. Como referencia, el mismo autor publicó `llama-512-1L` (una variante con una sola capa), pero no hay datos públicos de rendimiento. Otros modelos BabyLM (como los de la ronda anterior de BabyLM) suelen tener tamaños similares, pero no se han encontrado resultados comparables. La siguiente tabla es orientativa, basada en información pública limitada:

| Modelo | Parámetros | Contexto | Licencia | Rendimiento |
|---|---|---|---|---|
| llama-512-2L | 7.3M | 512 | No disponible | Sin benchmarks |
| llama-512-1L | No disponible | 512 | No disponible | Sin benchmarks |
| GPT-2 pequeño (124M) | 124M | 1024 | MIT | MMLU ~25% (referencia) |

Nota: los datos de GPT-2 son aproximados y no se comparan directamente por diferencia de tamaño y entrenamiento.

## Limitaciones y advertencias

- Sesgos desconocidos: al no conocer el dataset de entrenamiento, no se puede evaluar la presencia de sesgos sociales o culturales.
- Alto riesgo de alucinación: por su tamaño reducido, el modelo tiende a generar contenido inventado o incoherente, especialmente en temas complejos.
- Contexto limitado a 512 tokens: no puede manejar conversaciones largas ni documentos extensos.
- Idiomas no especificados: probablemente solo funcione razonablemente en inglés, pero no hay confirmación.
- Licencia no disponible: no se indica bajo qué términos se distribuye el modelo, lo que impide su uso comercial sin autorización explícita.
- No apto para producción: su calidad de generación es muy baja para aplicaciones reales; debe considerarse solo como herramienta de investigación o educativa.

## Enlaces

- [Hugging Face - stage-babylm/llama-512-2L](https://huggingface.co/stage-babylm/llama-512-2L)
- [FriendliAI - Despliegue del modelo](https://friendli.ai/models/stage-babylm/llama-512-2L)
- [Hugging Face - Discusión del modelo hermano llama-512-1L](https://huggingface.co/stage-babylm/llama-512-1L/discussions)
