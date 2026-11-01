# Thefaresmostafa/LFM3-VL-2B

## Resumen

LFM3-VL-2B es un modelo de vision-lenguaje publicado por Thefaresmostafa en HuggingFace, construido sobre el modelo de lenguaje LiquidAI/LFM3-1.7B-Base y un codificador visual propio de 164M de parametros. El conjunto suma 1.918.181.888 parametros (1,92B) y esta disenado para comprension visual en dispositivo (on-device), aceptando texto, imagenes y video como entrada. Es relevante por su tamano reducido, su ventana de contexto de 128K tokens y su soporte de video a 2 fps, capacidades poco habituales en modelos de menos de 2B parametros.

La arquitectura combina un transformer hibrido en el modelo de lenguaje (13 convoluciones cortas con compuerta, 5 capas de atencion de ventana deslizante y 6 de atencion global sobre 24 capas) con un codificador visual de 14 capas (8 convoluciones 2D depthwise con compuerta y 6 capas de atencion bidireccional, parches de 16x16 con embeddings rotatorios 2D). El modelo incorpora un modo de razonamiento paso a paso (thinking) orientado a preguntas visuales complejas como matematicas, graficos y problemas multi-paso, ademas de razonamiento espacial para robótica.

El checkpoint es un post-entrenamiento vision-lenguaje de la familia LFM3 de Liquid AI, publicada bajo licencia LFM Open License v1.0. Soporta 16 idiomas, incluido el espanol, y esta pensado para despliegue en entornos con recursos limitados: movil, edge y sistemas embebidos con GPU integrada. El repositorio ocupa 3,9 GB y el modelo se distribuye en formato safetensors con codigo personalizado (custom_code) para transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido vision-lenguaje: LM con convoluciones cortas con compuerta, atencion de ventana deslizante y atencion global; codificador visual con convoluciones 2D depthwise y atencion bidireccional |
| Parametros totales | 1.918.181.888 (1,92B): 1,73B LM + 164M vision encoder + 25M projector |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128K tokens (entrada + salida) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl (16 idiomas) |
| Licencia | LFM Open License v1.0 (lfm1.0) |
| Formato de pesos | safetensors |
| Vocabulario | 128.000 tokens |
| Entrada multimodal | Texto, imagen y video a resolucion nativa; video muestreado a 2 fps |
| Tamano del repositorio | 3,9 GB |
| Modelo base | LiquidAI/LFM3-1.7B-Base |
| Libreria | transformers (custom_code) |

## Arquitectura y entrenamiento

El modelo de lenguaje LFM3 consta de 24 capas con una mezcla deliberada de operadores: 13 capas de convolucion corta con compuerta (gated short convolutions), 5 capas de atencion de ventana deslizante y 6 capas de atencion global. Esta hibridacion reduce el coste computacional del contexto largo frente a un transformer de atencion completa, lo que explica que un modelo de 1,73B parametros pueda sostener 128K tokens de contexto. El codificador visual tiene 14 capas: 8 convoluciones 2D depthwise con compuerta y 6 capas de atencion bidireccional, procesando parches de 16x16 con embeddings rotatorios 2D. Cada bloque 2x2 de parches se proyecta a un token del lenguaje mediante el proyector de 25M de parametros, lo que reduce la secuencia visual efectiva.

En cuanto a datos de entrenamiento, numero de tokens, composicion del dataset y si hubo RLHF, DPO u otras tecnicas de alineacion, la informacion disponible no lo detalla. La model card unicamente indica que es un checkpoint post-entrenado (post-trained) de la familia LFM3, que incluye modelos base, de texto, vision, audio, omni y de decision. No se especifican innovaciones adicionales como decodificacion especulativa; la innovacion principal documentada es la arquitectura hibrida convolucion-atencion y el procesamiento de video a 2 fps con resolucion nativa.

## Capacidades

- Generacion de texto y conversacion multi-turno en 16 idiomas, incluido el espanol.
- Comprension de imagenes a resolucion nativa, sin reescalado obligatorio.
- Comprension de video: el primer modelo de vision de la familia LFM que acepta video como entrada, muestreado a 2 fps.
- Modo thinking: razonamiento paso a paso antes de responder, orientado a preguntas visuales complejas (matematicas, graficos, problemas multi-paso).
- Razonamiento espacial y embodied reasoning: localizacion de objetos y razonamiento sobre su disposicion relativa, con aplicacion en robotica.
- Respuesta a preguntas sobre contenido visual: lecturas grabadas, grabaciones de movil, clips de camaras de vigilancia.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: el modo thinking cubre razonamiento multi-paso visual; no se documenta soporte de agentes con herramientas.
- Capacidades de audio: no disponibles en este modelo (la familia LFM3 incluye modelos de audio y omni, pero este checkpoint es vision-lenguaje).

## Casos de uso

- Asistencia visual en movil y edge: el modelo cabe en dispositivos con recursos limitados y puede responder preguntas sobre fotos tomadas por el usuario sin enviar imagenes a la nube, gracias a sus 1,92B parametros y su diseno on-device.
- Analisis de grabaciones de video: con muestreo a 2 fps y contexto de 128K tokens, puede responder preguntas sobre clases grabadas, tutoriales filmados con el movil o clips de camaras de seguridad, resumiendo o localizando eventos concretos.
- Lectura de graficos y documentos visuales: el modo thinking mejora el rendimiento en preguntas que requieren interpretar ejes, tablas o diagramas y realizar calculos a partir de ellos.
- Robotica y navegacion asistida: el razonamiento espacial permite localizar objetos y describir relaciones de posicion, util para planificacion de agarre o navegacion en entornos controlados.
- Accesibilidad: descripcion de imagenes y video en tiempo real para personas con discapacidad visual, con soporte multilingue en 16 idiomas.
- Moderacion de contenido visual: clasificacion y descripcion de imagenes o fotogramas de video en pipelines de revision, ejecutandose localmente para evitar enviar contenido sensible a terceros.
- Extraccion de informacion de capturas y formularios: transcripcion y estructura de datos a partir de imagenes de documentos, con salida en el idioma del usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp16/bf16): aproximadamente 3,8-4 GB solo para pesos, mas memoria para el codificador visual, el proyector y la cache KV del contexto.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 2 GB para pesos; en 4 bits, alrededor de 1-1,5 GB. No se documentan cuantizaciones oficiales en la model card.
- GPU recomendadas: para inferencia comoda en fp16, una RTX 4090, RTX 3090, A100 o H100; el modelo es lo bastante pequeno para GPUs de gama media como RTX 4060 Ti o RTX 3060 de 12 GB.
- Cabe en GPU de consumo: si, en cualquier GPU con 6 GB o mas en fp16 y en GPUs integradas o moviles con cuantizacion.
- Opciones de despliegue: transformers con custom_code (requerido por la arquitectura personalizada); vLLM, llama.cpp, Ollama y TGI no estan confirmados en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Video | Idiomas | Licencia |
|---|---|---|---|---|---|
| LFM3-VL-2B | 1,92B | 128K | Si (2 fps) | 16 | LFM Open License v1.0 |
| Qwen2-VL-2B | 2,2B | 32K (extensible) | Si | Multiples | Apache 2.0 (no confirmado en la informacion) |
| SmolVLM-2B | 2,2B | 8K-16K | Si | Multiples | Apache 2.0 (no confirmado en la informacion) |
| PaliGemma-3B | 3B | 8K | No | Multiples | Gemma License (no confirmado en la informacion) |

La comparativa con modelos alternativos no esta respaldada por datos de benchmarks en la informacion proporcionada; los datos de contexto, licencia y capacidades de los modelos competidores deben verificarse en sus respectivas model cards antes de tomar decisiones. Destaca del LFM3-VL-2B su contexto de 128K, superior al de la mayoria de alternativas de tamano similar, y su licencia propia (LFM Open License v1.0), que puede imponer condiciones distintas a las licencias permisivas de otros modelos.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la informacion proporcionada; como todo modelo entrenado con datos web, es previsible que herede sesgos de esos datos.
- Riesgo de alucinacion: no cuantificado; el modo thinking puede mitigar errores en tareas visuales complejas, pero no los elimina.
- Limitaciones de contexto o idioma: aunque soporta 16 idiomas, el rendimiento relativo por idioma no esta documentado; el espanol figura entre los idiomas soportados pero sin evaluacion publica.
- Restricciones de licencia: la LFM Open License v1.0 no es una licencia permisiva estandar; es necesario revisar sus terminos antes de uso comercial, ya que puede imponer condiciones de atribucion o restricciones de uso.
- Modelo comunitario: publicado por un autor individual (Thefaresmostafa) sobre el modelo base de Liquid AI, con 26 descargas y 0 likes; no hay garantia de mantenimiento ni de calidad de los pesos finetuneados.
- Codigo personalizado: requiere confiar en el codigo remoto (custom_code) al cargar el modelo con transformers, lo que implica riesgos de seguridad si no se audita.
- Uso en produccion: sin benchmarks publicados ni documentacion de cuantizaciones oficiales, la validacion en el caso de uso concreto es imprescindible antes de desplegar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Thefaresmostafa/LFM3-VL-2B
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B-Base
- Blog de la familia LFM3: https://www.liquid.ai/blog/lfm3
- Documentacion de LFM: https://docs.liquid.ai/lfm/getting-started/welcome
- Consola de Liquid AI: https://console.liquid.ai/dashboard
- Playground de Liquid AI: https://playground.liquid.ai/
- Coleccion LFM3 en HuggingFace: https://huggingface.co/collections/LiquidAI/lfm3
