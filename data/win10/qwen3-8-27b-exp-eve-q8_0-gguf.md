# win10/Qwen3.8-27b-EXP-EVE-Q8_0-GGUF

## Resumen

Este repositorio contiene una conversión a formato GGUF del modelo `win10/Qwen3.8-27b-EXP-EVE`, una variante experimental del Qwen3.8-27B desarrollado por el equipo Qwen de Alibaba. El modelo original, lanzado en agosto de 2026 bajo licencia Apache 2.0, es un transformer denso multimodal con aproximadamente 27 000 millones de parámetros y una ventana de contexto de 262 000 tokens según las especificaciones publicadas. La variante "EXP-EVE" incorpora la etiqueta "EVE" (Evolution, Tensor Gene Evolution), lo que sugiere un proceso de evolución de pesos o arquitectura, aunque no se han publicado detalles técnicos sobre esta modificación concreta.

La relevancia de este archivo GGUF radica en que permite ejecutar el modelo en local mediante `llama.cpp`, `llama-server` u otras herramientas compatibles con este formato, sin necesidad de depender de la infraestructura de HuggingFace. Al ser una cuantización Q8_0, ofrece un equilibrio entre calidad y requisitos de memoria, aunque el tamaño del archivo (29 GB) limita su uso a GPUs de gama alta o inferencia en CPU. Es importante señalar que se trata de una conversión comunitaria no oficial, y que la variante EVE puede presentar comportamientos distintos al modelo base original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (multimodal, según el modelo base) |
| Parametros totales | 27.320.697.856 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 000 tokens (según el modelo base Qwen3.8-27B; no verificado en esta variante) |
| Tipos de cuantizacion | Q8_0 (este archivo) |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura específica de la variante `EXP-EVE`. El modelo base Qwen3.8-27B, según los resultados de búsqueda, es un transformer denso con un codificador de visión integrado, diseñado para tareas de codificación, flujos de agente y automatización de oficina. Se sabe que fue entrenado con un contexto de 262 000 tokens y liberado bajo Apache 2.0, pero no se han publicado datos sobre el volumen de tokens de entrenamiento, la composición del dataset ni los métodos de alineación (RLHF/DPO).

La conversión a GGUF se realizó mediante la herramienta `gguf-my-repo` de ggml.ai, que transforma los pesos originales en safetensors al formato GGUF sin modificar la arquitectura subyacente. El archivo resultante está cuantizado a 8 bits (Q8_0), lo que reduce el tamaño respecto a los pesos en fp16 pero mantiene una pérdida de precisión mínima.

## Capacidades

- Generación de texto y razonamiento: el modelo base Qwen3.8-27B es capaz de tareas de lenguaje general, aunque no se han confirmado capacidades específicas para esta variante EVE.
- Multimodalidad: el modelo base incluye un codificador de visión, por lo que podría procesar imágenes, pero no se ha verificado que la variante EVE conserve esta funcionalidad.
- Soporte de agentes y flujos de trabajo: el modelo base está optimizado para agentic workflows y automatización de oficina, según la documentación oficial.
- Generación de código: se menciona que destaca en tareas de coding, aunque no hay benchmarks específicos para esta variante.
- Multilingüismo: los idiomas declarados son inglés y chino, aunque el modelo base podría soportar más lenguas no documentadas.

## Casos de uso

- Ejecución local de un asistente de conversación: gracias al formato GGUF, se puede desplegar en una máquina local con `llama-server` para experimentar con un modelo de 27B sin depender de APIs externas. Adecuado para entornos de desarrollo y pruebas.
- Prototipado de aplicaciones de generación de código: si la variante EVE mantiene las capacidades del modelo base, podría utilizarse para autocompletar código o generar scripts en entornos aislados, aunque se recomienda validar su calidad antes de usarlo en producción.
- Investigación sobre evolución de pesos: el nombre "EVE" sugiere un experimento de evolución de tensores; este modelo puede servir como objeto de estudio para comparar su comportamiento frente al Qwen3.8-27B original.
- Inferencia en CPU con llama.cpp: al ser un archivo GGUF, se puede ejecutar en equipos sin GPU mediante la compilación de llama.cpp, aunque la velocidad será baja para un modelo de 27B.
- Evaluación de cuantización Q8_0: los usuarios pueden analizar el impacto de la cuantización de 8 bits en la calidad de las respuestas frente a pesos completos, útil para decidir qué nivel de compresión usar en otros despliegues.
- Integración en pipelines de prueba con vLLM o SGLang: aunque el formato GGUF no es el nativo para estos servidores, se puede convertir o usar a través de adaptadores para pruebas de rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La búsqueda web menciona que el modelo Qwen3.8-27B original tiene benchmarks publicados, pero no se han proporcionado los valores concretos, y tampoco se dispone de datos específicos para la variante `EXP-EVE`. Por tanto, no es posible presentar una tabla comparativa con números verificados.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo GGUF Q8_0 pesa aproximadamente 29 GB, por lo que se necesita una GPU con al menos 32 GB de VRAM para cargar el modelo completo en memoria (por ejemplo, A100 40GB, H100 80GB, o una RTX 4090 de 24 GB no sería suficiente).
- GPU recomendadas: NVIDIA A100 40GB o superior, H100 80GB, o GPUs profesionales con más de 32 GB. En el ámbito consumer, ninguna GPU actual (RTX 4090, 24 GB) puede alojar el modelo en Q8_0 sin offloading a CPU.
- Opciones de despliegue: llama.cpp (CLI o servidor), Ollama (si se convierte a un formato compatible), y potencialmente vLLM o SGLang si se convierte a safetensors.
- Latencia y throughput: no disponible. Depende del hardware y de la configuración de offloading. En CPU pura, la generación será lenta (del orden de 1-5 tokens por segundo en un procesador de gama alta).

## Comparativa con modelos similares

Dado que no hay datos de rendimiento verificados para esta variante, la comparativa se limita a especificaciones técnicas generales del modelo base frente a alternativas de tamaño similar:

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B | 262k | Apache 2.0 | safetensors, GGUF |
| Qwen2.5-32B | 32B | 128k | Apache 2.0 | safetensors, GGUF |
| Llama 3.1 8B | 8B | 128k | Llama 3.1 | safetensors, GGUF |

La variante EVE no tiene una ficha oficial, por lo que no se puede comparar su rendimiento real. Se recomienda consultar la documentación del modelo base para más detalles.

## Limitaciones y advertencias

- Variante experimental: el nombre "EXP-EVE" indica que se trata de un experimento no oficial, posiblemente con modificaciones no validadas. Su comportamiento puede ser impredecible y no está respaldado por el equipo de Alibaba.
- Sin benchmarks: no hay datos objetivos sobre calidad, por lo que no se recomienda su uso en aplicaciones críticas sin una evaluación previa exhaustiva.
- Sesgos y alucinaciones: al ser un modelo derivado de Qwen3.8-27B, puede heredar sesgos presentes en los datos de entrenamiento originales, y el riesgo de alucinación es inherente a los modelos generativos.
- Requisitos de hardware elevados: el archivo Q8_0 necesita 29 GB de VRAM, lo que excluye a la mayoría de GPUs de consumo. Para entornos con menos memoria, sería necesario buscar cuantizaciones más bajas (Q4, Q5) que no están disponibles en este repositorio.
- Idiomas limitados: según los metadatos, solo se declaran inglés y chino; el rendimiento en otros idiomas no está garantizado.
- Licencia: Apache 2.0 permite uso comercial, pero al ser una variante experimental, el usuario asume la responsabilidad de su uso.

## Enlaces

- Repositorio HuggingFace del modelo GGUF: https://huggingface.co/win10/Qwen3.8-27b-EXP-EVE-Q8_0-GGUF
- Modelo base (safetensors): https://huggingface.co/win10/Qwen3.8-27b-EXP-EVE
- Repositorio oficial de Qwen3.8-27B (GitHub): https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Guía de ejecución local (yottalabs.ai): https://www.yottalabs.ai/post/how-to-run-qwen-3-8-27b-locally-ollama-gguf-single-gpu-2026
- Especificaciones y hardware (yottalabs.ai): https://www.yottalabs.ai/post/qwen-3-8-27b-specs-hardware-requirements-how-to-run-2026
- Análisis de benchmarks (kingy.ai): https://kingy.ai/blog/qwen3-8-27b-specs-benchmarks-local-hardware/
- Guía de ejecución local (lu-labs.ai): https://lu-labs.ai/blog/how-to-run-qwen-3-8-27b-locally
