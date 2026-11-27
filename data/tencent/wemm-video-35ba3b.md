# tencent/WeMM-Video-35BA3B

## Resumen

WeMM-Video-35B-A3B es un modelo multimodal de comprensión y razonamiento audiovisual desarrollado por Tencent, diseñado para procesar de forma conjunta texto, imágenes, audio y vídeo y generar respuestas textuales. Forma parte de la familia WeMM-Video, una línea bilingüe chino-inglés que busca resolver el problema de la comprensión unificada de vídeo con su banda sonora original, algo que la mayoría de los modelos vídeo-lenguaje abordan tratando la imagen y el audio como modalidades separadas. El checkpoint presentado aquí es la variante de mezcla de expertos con 35B parámetros totales y 3B activos por token.

La arquitectura combina codificadores especializados de visión y audio que proyectan las señales multimedia a tokens que el modelo de lenguaje procesa junto al texto, incorporando marcas temporales en los fotogramas de vídeo para preservar la referencia temporal. El modelo fue preentrenado con aproximadamente 1,2 billones de tokens multimodales y posteriormente ajustado mediante técnicas de post-entrenamiento que incluyen OPD multi-profesor, MrDPO anti-repetición y aprendizaje por refuerzo especializado.

Su relevancia actual reside en que ofrece una ventana de contexto amplia (8192 tokens en la configuración de servicio documentada), licencia Apache 2.0 permisiva para uso comercial, y variantes cuantizadas oficiales (FP8, AWQ, GGUF, NVFP4) que facilitan su despliegue en infraestructura diversa. El modelo está orientado a tareas de descripción de eventos, transcripción de habla y razonamiento sobre lo que se ve y se escucha en un vídeo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con mezcla de expertos (MoE), codificadores separados de visión y audio |
| Parametros totales | 36.177.564.536 (aproximadamente 36,2B) |
| Parametros activos | 3B (aproximadamente) |
| Longitud de contexto | 8192 tokens (configuración de servicio vLLM documentada) |
| Tipos de cuantizacion | BF16 (original), FP8 Block128, AWQ W4A16, GGUF Q4_K_M, NVFP4 W4A16 |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (BF16); variantes GGUF, AWQ, FP8 y NVFP4 disponibles |

## Arquitectura y entrenamiento

WeMM-Video-35B-A3B emplea una arquitectura de mezcla de expertos con 36,2B parámetros totales y aproximadamente 3B activos por token, lo que reduce el coste computacional de inferencia manteniendo una capacidad de representación elevada. La entrada multimodal se gestiona mediante codificadores dedicados de visión y audio que convierten fotogramas e información sonora en tokens que el modelo de lenguaje procesa de forma conjunta con el texto. Los fotogramas de vídeo incorporan marcas temporales, lo que permite al modelo razonar sobre la secuencia de eventos y su relación con el audio sincronizado.

El entrenamiento se realizó en dos fases. La fase de preentrenamiento utilizó aproximadamente 1,2 billones de tokens multimodales. La fase de post-entrenamiento combinó tres técnicas: OPD multi-profesor, que destila conocimiento de varios modelos especializados; MrDPO anti-repetición, orientado a mitigar la generación repetitiva; y aprendizaje por refuerzo con profesores especialistas. La model card menciona soporte de modo "thinking" (razonamiento explícito) activable mediante `enable_thinking=True` en la plantilla de chat, además de un modo instructivo directo por defecto.

## Capacidades

- Comprensión audiovisual conjunta: describe eventos en vídeo combinando fotogramas con la banda sonora original.
- Transcripción de habla: convierte el audio de un vídeo o una grabación independiente en texto.
- Razonamiento sobre lo visto y lo escuchado: responde preguntas que requieren cruzar información visual y auditiva.
- Entrada de vídeo silencioso: procesa únicamente fotogramas cuando no hay pista de audio.
- Entrada de audio independiente y de imagen: admite audio suelto e imágenes como modalidades de entrada.
- Generación de texto bilingüe: respuestas en inglés y en chino.
- Modo de razonamiento (thinking): activable mediante `enable_thinking=True` para respuestas con cadena de razonamiento.
- Procesamiento de vídeo con control de fotogramas: parámetros `fps`, `min_frames`, `max_frames` y `total_pixels` para ajustar el muestreo.
- Soporte de tool calling y agentes: no disponible en la información proporcionada.

## Casos de uso

- Descripción automática de vídeo con audio: el modelo recibe un clip MP4 y su pista de sonido y genera una descripción de lo que ocurre en pantalla junto con un resumen del audio, gracias a la combinación de codificadores de visión y audio y a las marcas temporales de los fotogramas.
- Transcripción y resumen de reuniones grabadas: a partir de un vídeo de reunión, el modelo puede transcribir el habla y resumir los puntos tratados, usando la ventana de 8192 tokens para clips de duración moderada.
- Accesibilidad de contenido audiovisual: generación de subtítulos y descripciones para vídeos, incluyendo referencias a lo que se ve y se escucha, útil en plataformas de contenido.
- Moderación y análisis de contenido multimedia: revisión de vídeos para detectar y describir eventos relevantes combinando señales visuales y sonoras.
- Análisis de material de vigilancia o grabaciones de campo: descripción de escenas y eventos en vídeos silenciosos o con audio ambiente, con muestreo de fotogramas configurable para ajustar coste y cobertura temporal.
- Asistentes de análisis de documentos con imagen: el modelo acepta imágenes sueltas y puede responder preguntas sobre su contenido, por ejemplo en tareas de inspección visual o extracción de información.
- Búsqueda y recuperación multimodal: la etiqueta `feature-extraction` sugiere uso para generar representaciones de vídeo, audio e imagen que alimenten sistemas de recuperación o indexación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Pesos BF16: 67,39 GiB de archivos de pesos, según la model card; el repositorio completo ocupa 72,4 GB.
- VRAM estimada en BF16: superior a 67 GiB solo para pesos, más memoria para entradas multimedia y caché de generación; requiere GPUs de 80 GB (A100 80GB, H100 80GB) o configuraciones multi-GPU.
- VRAM estimada en FP8 Block128: aproximadamente la mitad que BF16, en torno a 34-36 GiB para pesos, viable en una A100 40GB o H100.
- VRAM estimada en AWQ W4A16 y NVFP4 W4A16: en torno a 18-20 GiB para pesos, viable en GPUs consumer de gama alta como RTX 4090 (24 GB).
- VRAM estimada en GGUF Q4_K_M: en torno a 20-22 GiB para pesos, viable en RTX 4090 y potencialmente en GPUs de 24 GB.
- GPUs recomendadas: A100 80GB o H100 80GB para BF16; A100 40GB o H100 para FP8; RTX 4090 para cuantizaciones de 4 bits.
- Despliegue: vLLM parcheado (0.18.0 para la configuración documentada, 0.31.0 para BF16), con soporte de `--mamba-ssm-cache-dtype float32` y `--limit-mm-per-prompt` para limitar entradas multimedia por prompt; también Transformers con `trust_remote_code=True`. Soporte de llama.cpp/Ollama no confirmado en la información disponible, aunque existe variante GGUF Q4_K_M.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable. Como referencia estructural, la familia WeMM-Video incluye otras variantes del mismo modelo base, y existen variantes cuantizadas oficiales del propio checkpoint (FP8, AWQ, GGUF, NVFP4) que comparten arquitectura y difieren únicamente en precisión de pesos.

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia |
|---|---|---|---|---|
| WeMM-Video-35B-A3B | 36,2B | 3B | 8192 tokens (servicio) | Apache 2.0 |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Idiomas: solo se declaran inglés y chino; el rendimiento en castellano no está documentado y probablemente sea inferior.
- Contexto: la configuración de servicio documentada limita la longitud a 8192 tokens, lo que restringe la duración de vídeos y la cantidad de fotogramas procesables por petición.
- Riesgo de alucinación: como todo modelo generativo multimodal, puede describir eventos o transcribir habla de forma incorrecta, especialmente con audio degradado o vídeo de baja calidad.
- Repetición: la model card menciona explícitamente el uso de MrDPO anti-repetición en el post-entrenamiento, lo que sugiere que la generación repetitiva fue un problema identificado durante el desarrollo.
- Sesgos: no se documentan sesgos conocidos en la información proporcionada; cabe esperar sesgos derivados de los datos de preentrenamiento, no caracterizados públicamente.
- Dependencia de código personalizado: requiere `trust_remote_code=True` y un parche específico del runtime de WeMM para vLLM, lo que añade complejidad de despliegue y riesgo de incompatibilidades con versiones futuras.
- Limitaciones de tool calling y agentes: no se documenta soporte de function calling ni de razonamiento multi-paso con herramientas, por lo que no debe asumirse su disponibilidad en producción.
- Licencia: Apache 2.0 permite uso comercial, pero deben revisarse las licencias de los codificadores y datos subyacentes si se redistribuye el modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tencent/WeMM-Video-35BA3B
- Colección WeMM-Video: https://huggingface.co/collections/tencent/wemm-video
- Informe técnico (arXiv): https://arxiv.org/abs/2611.26409
- Página del paper en Hugging Face: https://huggingface.co/papers/2611.26409
- Repositorio GitHub: https://github.com/Tencent/WeMM-Video
- Guía de servicio: https://github.com/Tencent/WeMM-Video/blob/main/docs/serving.md
- Parche de runtime: https://github.com/Tencent/WeMM-Video/blob/main/patch/README.md
- Variante FP8 Block128: https://huggingface.co/tencent/WeMM-Video-35BA3B-FP8
- Variante AWQ W4A16: https://huggingface.co/tencent/WeMM-Video-35BA3B-AWQ
- Variante GGUF Q4_K_M: https://huggingface.co/tencent/WeMM-Video-35BA3B-GGUF
- Variante NVFP4 W4A16: https://huggingface.co/tencent/WeMM-Video-35BA3B-NVFP4
