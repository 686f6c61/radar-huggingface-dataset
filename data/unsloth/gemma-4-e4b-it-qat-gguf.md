# unsloth/gemma-4-E4B-it-qat-GGUF

## Resumen

`unsloth/gemma-4-E4B-it-qat-GGUF` es una conversión a formato GGUF del modelo `google/gemma-4-E4B-it-qat-q4_0-unquantized`, perteneciente a la familia Gemma 4 de Google DeepMind. Ha sido publicada por Unsloth, un proyecto open source especializado en optimización y ejecución local de modelos, y está pensada para facilitar el despliegue en entornos de consumo y servidores mediante cuantización QAT (Quantization-Aware Training). El modelo es multimodal (any-to-any), capaz de procesar texto e imagen, con soporte de audio en las variantes E2B, E4B y 12B, y genera texto como salida.

La arquitectura es un transformer denso (no MoE), con un total de 7.463.013.674 parámetros y una ventana de contexto de hasta 256K tokens. Aunque el nombre del modelo indica "E4B", el número real de parámetros es superior, lo que puede generar confusión. La relevancia actual de este modelo radica en que ofrece capacidades de última generación (razonamiento configurable, tool calling, multimodalidad) en un formato eficiente para ejecución local, con soporte de decodificación especulativa mediante un drafter MTP incluido en el propio repositorio.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (any-to-any), denso |
| Parametros totales | 7.463.013.674 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | Hasta 256K tokens |
| Tipos de cuantizacion | Q4_0 (GGUF) y cuantizaciones dinámicas Unsloth (p. ej. UD-Q4_K_XL); otras precisiones en la carpeta MTP/ |
| Idiomas soportados | Más de 140 idiomas (según la model card de Gemma 4) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con safetensors de referencia) |

## Arquitectura y entrenamiento

Gemma 4 es una familia de modelos abiertos desarrollada por Google DeepMind. Este modelo concreto es la versión instruida ("it") del tamaño E4B, optimizada mediante QAT, una técnica que preserva una calidad similar a bfloat16 reduciendo drásticamente los requisitos de memoria. El modelo base es `google/gemma-4-E4B-it-qat-q4_0-unquantized`, que corresponde a los pesos sin cuantizar extraídos del pipeline QAT. No se han proporcionado detalles sobre el dataset de entrenamiento, el número de tokens ni procesos de RLHF o DPO.

Una innovación destacable es la inclusión de un drafter MTP (Multi-Token Prediction) en la raíz del repositorio (`mtp-gemma-4-E4B-it.gguf`), un modelo auxiliar casi sin pérdida en Q4_0 que permite decodificación especulativa con llama.cpp. El drafter comparte la caché KV del modelo principal y no altera la salida, ya que el modelo objetivo verifica cada token generado. Además, el modelo incorpora modos de pensamiento configurables para tareas de razonamiento, y soporta entrada multimodal de imagen y audio (en E4B).

## Capacidades

- Multimodal: entrada de texto e imagen, con soporte de audio nativo en E4B; genera texto como salida.
- Razonamiento con modos de pensamiento configurables (thinking mode).
- Tool calling / function calling, con ejemplo de uso en Unsloth Studio.
- Multilingüe en más de 140 idiomas.
- Contexto largo de hasta 256K tokens.
- Optimizado para ejecución local en laptops y dispositivos móviles.
- Compatible con decodificación especulativa MTP para reducir la latencia de generación.

## Casos de uso

- Atención al cliente multimodal: el modelo puede recibir capturas de pantalla o fotografías enviadas por el usuario y responder con texto, aprovechando su capacidad de procesar imagen y texto en una misma conversación.
- Generación de código con herramientas externas: gracias al soporte de tool calling, puede integrarse en un pipeline de desarrollo para invocar funciones, ejecutar pruebas o consultar documentación de forma automatizada.
- Análisis de documentos escaneados: extracción de datos de facturas, contratos o formularios a partir de imágenes, con una ventana de contexto amplia para procesar documentos extensos.
- Asistentes en dispositivos móviles: al estar optimizado para on-device, puede ejecutarse en smartphones para asistentes de voz, traducción o resúmenes con entrada de audio.
- Razonamiento matemático y lógico: con el modo de pensamiento configurable, es adecuado para planificación, resolución de problemas o análisis de datos en entornos sin conexión.
- Despliegue en servidores con baja latencia: mediante decodificación especulativa MTP con llama.cpp, se puede reducir el tiempo de generación en entornos de producción.
- Fine-tuning local con Unsloth Studio: para adaptar el modelo a dominios específicos (legal, médico, etc.) sin necesidad de infraestructura cloud.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card enlaza a la documentación de cuantizaciones Unsloth Dynamic 2.0, pero no proporciona cifras concretas de rendimiento.

## Requisitos de hardware

- VRAM estimada: con cuantización Q4_0, los pesos ocupan aproximadamente 3,7 GB (7.463.013.674 parámetros × 4 bits). En la práctica, se recomiendan entre 6 y 8 GB de VRAM para inferencia con contexto moderado. Esta es una estimación basada en el número de parámetros, no un dato oficial.
- GPU recomendadas: puede ejecutarse en GPUs de consumo como RTX 3060 o RTX 4060 con cuantización, y en GPUs profesionales como A100 o H100 para mayor throughput.
- Sí cabe en GPUs de consumo: con cuantización Q4_0, es viable en tarjetas de 8 GB, aunque el uso de contextos largos aumentará el consumo de VRAM.
- Opciones de despliegue: llama.cpp (con soporte MTP), Unsloth Studio, y cualquier runtime compatible con GGUF (Ollama, llama.cpp server, etc.).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa cuantitativa. El modelo pertenece a la familia Gemma 4, que incluye las variantes E2B, 12B, 26B A4B y 31B, pero no se han proporcionado sus especificaciones en la información disponible. Tampoco se han publicado benchmarks comparativos.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible.
- Riesgo de alucinación: no se proporcionan datos específicos; como todo modelo de lenguaje, puede generar contenido incorrecto o inventado.
- Limitaciones de contexto: la ventana de hasta 256K tokens es amplia, pero el rendimiento puede degradarse con contextos muy extensos y el coste de memoria aumenta proporcionalmente.
- Soporte de audio: solo está disponible en los modelos E2B, E4B y 12B de la familia Gemma 4; no en los modelos más grandes.
- Discrepancia en el nombre: el modelo se llama "E4B" pero tiene 7.463.013.674 parámetros totales, lo que puede confundir a quienes esperen exactamente 4B. Es un modelo denso, no MoE.
- Dependencia de versiones recientes de llama.cpp: el soporte MTP requiere una versión que auto-descubra el drafter desde `-hf` y que soporte `--spec-type draft-mtp`.

## Enlaces

- HuggingFace: https://huggingface.co/unsloth/gemma-4-E4B-it-qat-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it-qat-q4_0-unquantized
- Colección Gemma 4 QAT: https://huggingface.co/collections/unsloth/gemma-4-qat
- Documentación Unsloth Gemma 4 QAT: https://unsloth.ai/docs/models/gemma-4/qat
- Guía MTP: https://unsloth.ai/docs/models/mtp
- Unsloth Dynamic 2.0 GGUF: https://unsloth.ai/docs/basics/unsloth-dynamic-v2.0-gguf
- Unsloth Studio: https://unsloth.ai/docs/new/studio
- GitHub unslothai/unsloth: https://github.com/unslothai/unsloth
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Documentación de Gemma: https://ai.google.dev/gemma/docs/core
- Blog de Google (Gemma 4): https://blog.google/innovation-and-ai/technology/developers-tools/introducing-gemma-4-12B/
