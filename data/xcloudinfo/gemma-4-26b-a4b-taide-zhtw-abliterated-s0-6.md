# xCloudinfo/Gemma-4-26B-A4B-TAIDE-zhTW-abliterated-s0.6

## Resumen

El modelo `xCloudinfo/Gemma-4-26B-A4B-TAIDE-zhTW-abliterated-s0.6` es una variante del modelo base `xCloudinfo/Gemma-4-26B-A4B-TAIDE-zhTW`, desarrollado por la empresa taiwanesa 云碩科技 (xCloudinfo). Se trata de un modelo multimodal (imagen-texto a texto) basado en la arquitectura Gemma 4 de Google DeepMind, con 25.805 millones de parámetros totales y una configuración de mezcla de expertos (MoE) que activa aproximadamente 4.000 millones de parámetros por token. La característica distintiva es la aplicación de la técnica de *abliteration* con intensidad 0,6, que elimina parcialmente la dirección de rechazo en el espacio residual del modelo, reduciendo su tendencia a negarse a responder a ciertas solicitudes.

Este modelo está orientado principalmente al chino tradicional (zh-TW), gracias al ajuste fino con el corpus TAIDE, y se distribuye bajo licencia Apache-2.0. Su relevancia radica en ofrecer una versión "sin censura" de un modelo de alto rendimiento, manteniendo las capacidades multimodales y de razonamiento del Gemma 4 original, pero con una postura menos restrictiva ante consultas que el modelo base podría rechazar. Está pensado para investigadores y desarrolladores que necesitan explorar los límites del modelo sin las restricciones de seguridad habituales, asumiendo la responsabilidad de implementar sus propias salvaguardas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con mezcla de expertos (MoE) |
| Parametros totales | 25.805.933.872 (25,8 B) |
| Parametros activos | ~4 B (configuracion A4B) |
| Longitud de contexto | No especificada en la informacion disponible; Gemma 4 soporta hasta 128K o 256K segun la variante |
| Tipos de cuantizacion | bf16 (version original); GGUF disponible en repositorio separado (Q4_K_M, Q5_K_M, Q6_K, Q8_0, etc.) |
| Idiomas soportados | Chino (principalmente tradicional, zh-TW); capacidades multilingues del modelo base Gemma 4 |
| Licencia | Apache-2.0 (con condiciones adicionales de TAIDE y Gemma 4 License) |
| Formato de pesos | safetensors (bf16); GGUF para despliegue con llama.cpp/Ollama |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Gemma 4 de Google DeepMind, que combina un transformer multimodal con un mecanismo de mezcla de expertos (MoE). En la configuracion 26B-A4B, el modelo tiene 25,8 mil millones de parametros totales, pero solo activa alrededor de 4 mil millones por token, lo que permite una inferencia mas eficiente que un modelo denso del mismo tamano. El modelo base fue ajustado con el corpus TAIDE (Taiwan AI Development Environment) para mejorar su competencia en chino tradicional, y posteriormente se le aplico la tecnica de *abliteration* descrita por Arditi et al. (2024).

La *abliteration* consiste en identificar la direccion de rechazo en el espacio residual del modelo (mediante analisis de activaciones) y eliminarla mediante ortogonalizacion de pesos. En este caso, se aplico con una intensidad de 0,6 sobre las capas de token embedding, attention o_proj, down_proj denso y los down_proj de los 128 expertos MoE. El proceso no requiere reentrenamiento y solo afecta al modelo de lenguaje; la torre de vision se mantiene intacta. El resultado es un modelo que conserva sus capacidades generales pero muestra una menor propension a rechazar solicitudes que el modelo original consideraria inapropiadas.

## Capacidades

- Generacion de texto y razonamiento: mantiene las capacidades del Gemma 4 base para tareas de lenguaje natural, incluyendo razonamiento logico y respuesta a preguntas complejas.
- Comprension multimodal: acepta entradas de imagen y texto, y genera respuestas de texto (pipeline image-text-to-text). Puede describir imagenes, responder preguntas sobre su contenido y realizar tareas de vision-lenguaje.
- Generacion de codigo: el modelo base Gemma 4 esta optimizado para tareas de programacion, y esta variante conserva esa capacidad.
- Soporte de tool calling y function calling: disponible en el modelo base Gemma 4, aunque no se confirma explicitamente en esta variante.
- Capacidades multilingues: aunque esta especializado en chino tradicional, el modelo base soporta multiples idiomas, incluyendo ingles, espanol, frances, aleman, japones, coreano, etc.
- Modo "sin censura": la abliteration reduce la tendencia a rechazar solicitudes, permitiendo respuestas mas directas en temas que el modelo base podria considerar sensibles.
- Eficiencia computacional: gracias a la arquitectura MoE, ofrece un rendimiento superior a un modelo denso de tamano equivalente con menor coste de inferencia.

## Casos de uso

- Investigacion academica sobre alineacion y seguridad: los investigadores pueden estudiar como la abliteration afecta al comportamiento del modelo en tareas de razonamiento, comparando esta variante con el modelo base para entender los mecanismos de rechazo.
- Desarrollo de asistentes conversacionales en chino tradicional: el modelo puede integrarse en chatbots o asistentes virtuales para el mercado taiwanes o de habla china, ofreciendo respuestas naturales y contextuales en zh-TW.
- Analisis de imagenes medicas o tecnicas: gracias a su capacidad multimodal, puede utilizarse para describir o analizar imagenes en entornos donde se requiere comprension visual, como documentacion tecnica o diagnostico asistido.
- Generacion de contenido creativo sin restricciones: escritores o creadores de contenido pueden usar el modelo para generar textos sobre temas controvertidos o tabues, donde otros modelos se negarian a responder.
- Evaluacion de modelos de lenguaje: los desarrolladores pueden probar los limites del modelo en tareas de jailbreak o evaluacion de robustez, comparando su comportamiento con versiones no abliteradas.
- Despliegue en entornos con recursos limitados: gracias a la cuantizacion GGUF y la arquitectura MoE, el modelo puede ejecutarse en hardware de consumo (por ejemplo, una RTX 4090 con cuantizacion 4-bit) para prototipado rapido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo base Gemma 4-26B-A4B-it reporta buenos resultados en tareas como MMLU, HumanEval y GSM8K, pero esta variante abliterada no incluye mediciones propias. Se recomienda consultar la documentacion del modelo base para obtener una referencia del rendimiento esperado.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo en bf16 ocupa aproximadamente 51,6 GB, por lo que requiere al menos 60 GB de VRAM para ejecutarse sin cuantizacion. Con cuantizacion GGUF Q4_K_M, el uso de VRAM se reduce a unos 16-18 GB, y con Q8_0 a unos 28-30 GB.
- GPU recomendadas: para bf16, se necesitan GPUs profesionales como A100 80GB, H100 80GB o A6000 48GB (con cuantizacion). Para cuantizacion 4-bit, una RTX 4090 (24 GB) o RTX 3090 (24 GB) es suficiente.
- Compatibilidad con hardware de consumo: si, con cuantizacion GGUF Q4_K_M o Q5_K_M, el modelo cabe en GPUs de 24 GB como la RTX 4090.
- Opciones de despliegue: vLLM, llama.cpp, Ollama (mediante el repositorio GGUF), TGI (Text Generation Inference) y transformers de Hugging Face.
- Latencia y throughput: no se dispone de datos concretos, pero la arquitectura MoE con 4B parametros activos permite una inferencia mas rapida que un modelo denso de 26B. En una RTX 4090 con cuantizacion 4-bit, se pueden esperar velocidades de 20-40 tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Especializacion |
|---|---|---|---|---|
| Gemma-4-26B-A4B-TAIDE-zhTW (base) | 25,8B (MoE, 4B activos) | No especificado | Apache-2.0 + TAIDE | Chino tradicional, multimodal |
| Gemma-4-26B-A4B-abliterated-s0.6 (este modelo) | 25,8B (MoE, 4B activos) | No especificado | Apache-2.0 + TAIDE | Chino tradicional, multimodal, sin censura |
| Qwen 2.5 32B | 32,5B (denso) | 128K | Apache-2.0 | Multilingue, codigo, matematicas |
| Llama 3.1 8B | 8B (denso) | 128K | Llama 3 License | Multilingue, razonamiento |

La comparativa se basa en modelos de tamano similar disponibles en el ecosistema open source. El Gemma 4 destaca por su arquitectura MoE y su enfoque multimodal, mientras que Qwen 2.5 ofrece un contexto mas largo y Llama 3.1 es mas ligero. La variante abliterada se diferencia por su postura menos restrictiva, lo que puede ser util en investigacion pero requiere precaucion en produccion.

## Limitaciones y advertencias

- La abliteration debilita los mecanismos de rechazo del modelo, lo que puede llevar a respuestas inapropiadas, ofensivas o peligrosas si no se implementan salvaguardas externas. El usuario es el unico responsable del uso.
- El modelo esta especializado en chino tradicional; su rendimiento en otros idiomas puede ser inferior al del modelo base Gemma 4.
- La licencia Apache-2.0 se combina con los terminos de TAIDE y Gemma 4 License, que pueden imponer restricciones adicionales, como la prohibicion de uso militar o ilegal, y el cumplimiento de la legislacion taiwanesa y la EU AI Act.
- No se han publicado benchmarks especificos para esta variante, por lo que el rendimiento real en tareas estandar no esta verificado.
- El modelo puede presentar sesgos presentes en los datos de entrenamiento de Gemma 4 y TAIDE, especialmente en contextos culturales o politicos relacionados con Taiwan y China.
- Para uso en produccion, se recomienda encarecidamente implementar filtros de contenido y moderacion adicionales, dado el caracter "sin censura" del modelo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/xCloudinfo/Gemma-4-26B-A4B-TAIDE-zhTW-abliterated-s0.6
- Modelo base: https://huggingface.co/xCloudinfo/Gemma-4-26B-A4B-TAIDE-zhTW
- Version GGUF: https://huggingface.co/xCloudinfo/Gemma-4-26B-A4B-TAIDE-zhTW-abliterated-s0.6-GGUF
- Pagina oficial de Gemma 4 (Google DeepMind): https://deepmind.google/models/gemma/gemma-4/
- Documentacion de Gemma 4 26B A4B IT en Google Cloud: https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/maas/google/gemma-4-26b-a4b-it
- Modelo Gemma 4 26B en Ollama: https://ollama.com/library/gemma4:26b
