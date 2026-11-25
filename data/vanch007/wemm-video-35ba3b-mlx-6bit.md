# vanch007/WeMM-Video-35BA3B-mlx-6bit

## Resumen

WeMM-Video-35BA3B es un modelo multimodal de la familia WeMM (WeChat Multimodal) desarrollado por Tencent, capaz de procesar vídeo, audio, imagen y texto de forma conjunta. Esta ficha describe la conversión a formato MLX en cuantización mixta de 6 bits publicada por el usuario vanch007, pensada para ejecución nativa en Apple Silicon mediante la librería MLX y el runtime oMLX. El modelo base combina un backbone de lenguaje Qwen3.5 con arquitectura MoE (256 expertos), una torre visual Qwen3-VL de 27 capas y una torre de audio compuesta por un encoder Whisper de 32 capas más un Q-Former BERT de 2 capas.

El modelo resuelve tareas de comprensión conjunta de vídeo y audio: descripción de escenas, resumen de habla, respuesta a preguntas sobre contenido audiovisual y diálogo multi-turno con material multimedia. Su relevancia actual radica en que permite llevar un modelo multimodal de ~36.000 millones de parámetros a equipos con memoria unificada de Apple Silicon, algo inviable con los pesos en bfloat16 originales, gracias a la cuantización selectiva (6 bits en el backbone y los expertos, 8 bits en el router y sin cuantizar las torres de visión y audio).

La conversión mantiene las torres perceptivas en bfloat16 y float16 respectivamente para preservar la fidelidad de las representaciones visuales y auditivas, mientras que solo el backbone lingüístico y los expertos MoE se comprimen. El repositorio ocupa 31,81 GB y se distribuye bajo licencia Apache 2.0, con soporte declarado de inglés y chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (backbone Qwen3.5 + 256 expertos MoE, torre visual Qwen3-VL de 27 capas, torre de audio Whisper de 32 capas + Q-Former BERT de 2 capas, Gated DeltaNet) |
| Parametros totales | 36.177.564.024 (~36,2 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX 6-bit mixta: 6-bit affine (group_size=64) en backbone y expertos MoE; 8-bit affine (group_size=64) en router MoE y shared_expert_gate; bfloat16 en torre visual; float16 en torre de audio; float32 en A_log de Gated DeltaNet. Variantes 4-bit (23,27 GB) y 8-bit (40,35 GB) disponibles |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX), librería mlx |

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura híbrida: un backbone de lenguaje Qwen3.5 con mezcla de expertos de 256 vías, complementado por componentes Gated DeltaNet (con parámetros A_log en float32 para estabilidad numérica). La percepción multimodal se reparte en dos torres independientes: una torre visual basada en el ViT de Qwen3-VL de 27 capas, que procesa fotogramas de vídeo e imágenes, y una torre de audio que combina un encoder Whisper de 32 capas con un Q-Former de 2 capas derivado de BERT para alinear las representaciones acústicas con el espacio del lenguaje.

La conversión MLX aplica cuantización mixta selectiva: el backbone y los 256 expertos MoE se cuantizan a 6 bits con grupo de 64, el router y la compuerta del experto compartido a 8 bits para preservar la precisión del enrutamiento, y las torres de visión y audio se mantienen sin cuantizar (bfloat16 y float16). El autor reporta una verificación de fidelidad de la torre de audio con coseno de similitud de 0,999826 frente a la referencia FP32. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada.

## Capacidades

- Comprensión conjunta de vídeo, audio, imagen y texto en una sola pasada.
- Descripción de escenas de vídeo y resumen del habla contenida en la pista de audio.
- Respuesta a preguntas sobre contenido audiovisual (vídeo question answering).
- Diálogo conversacional multi-turno con material multimedia como contexto.
- Procesamiento de audio mediante encoder Whisper, con transcripción y comprensión semántica del habla.
- Procesamiento visual mediante ViT de Qwen3-VL, incluyendo imágenes individuales y fotogramas de vídeo.
- Soporte multilingüe limitado a inglés y chino según la model card.
- Ejecución nativa en Apple Silicon mediante MLX y el runtime oMLX.
- No se documenta soporte explícito de tool calling, function calling ni modo de razonamiento extendido (thinking mode) en la información disponible.

## Casos de uso

- Análisis de contenido audiovisual para archivo y catalogación: el modelo puede recibir un vídeo y generar una descripción de la escena junto con un resumen del habla, útil para indexar bibliotecas de vídeo históricas o corporativas en equipos Apple Silicon.
- Accesibilidad y subtitulado enriquecido: combinando la torre Whisper con el backbone de lenguaje, se pueden generar descripciones de audio y resúmenes de diálogo para personas con discapacidad auditiva o visual.
- Revisión de reuniones y videoconferencias: procesar la grabación de una reunión para extraer un resumen de los temas tratados y de las intervenciones, aprovechando la comprensión conjunta de audio y vídeo.
- Moderación de contenido multimedia: analizar vídeos subidos por usuarios para detectar y describir escenas o discursos potencialmente problemáticos antes de su publicación.
- Asistencia a la investigación en humanidades digitales: analizar grabaciones de campo, entrevistas o material de archivo para extraer descripciones estructuradas y transcripciones resumidas en local, sin enviar datos a servicios en la nube.
- Prototipado de aplicaciones multimodales en local para desarrolladores: gracias a la integración con MLX y oMLX, permite iterar sobre pipelines de vídeo-a-texto en un Mac con memoria unificada, sin depender de GPUs dedicadas ni de APIs externas.
- Educación y formación: generar material de apoyo a partir de vídeos docentes, resumiendo el contenido visual y las explicaciones habladas para su reutilización en apuntes o guiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repositorio pesa 31,81 GB en disco para la variante de 6 bits; se requiere al menos esa cantidad de memoria unificada más el overhead del runtime. La variante de 4 bits ocupa 23,27 GB y la de 8 bits 40,35 GB.
- Hardware objetivo: Apple Silicon con memoria unificada suficiente (Mac Studio, MacBook Pro con M-series Max/Ultra). No está pensado para GPUs NVIDIA ni AMD.
- GPU dedicadas (A100, H100, RTX 4090): no aplicable, ya que los pesos están en formato MLX y requieren el runtime de Apple.
- Cabe en GPU de consumo: no en el sentido tradicional; requiere equipos Apple con memoria unificada de al menos ~32 GB para la variante de 6 bits, ~24 GB para la de 4 bits y ~40 GB para la de 8 bits.
- Opciones de despliegue: MLX y oMLX mediante el repositorio vanch007/mlx-wemm-video; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WeMM-Video-35BA3B (MLX 6-bit) | ~36,2 B (MoE) | no disponible | vídeo, audio, imagen, texto | Apache 2.0 | Hugging Face (MLX) |
| tencent/WeMM-Video-35BA3B (original) | ~36,2 B (MoE) | no disponible | vídeo, audio, imagen, texto | Apache 2.0 | Hugging Face |
| vanch007/WeMM-Video-35BA3B-mlx-4bit | ~36,2 B (MoE) | no disponible | vídeo, audio, imagen, texto | Apache 2.0 | Hugging Face (MLX) |
| vanch007/WeMM-Video-35BA3B-mlx-8bit | ~36,2 B (MoE) | no disponible | vídeo, audio, imagen, texto | Apache 2.0 | Hugging Face (MLX) |

No se dispone de datos de benchmarks que permitan comparar el rendimiento frente a otros modelos multimodales de la misma categoría.

## Limitaciones y advertencias

- Idiomas limitados a inglés y chino; el rendimiento en castellano no está documentado y probablemente sea inferior.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente en descripciones de escenas ambiguas o audio de baja calidad.
- No se documenta la longitud de contexto soportada, lo que impide planificar despliegues con vídeos largos o conversaciones extensas.
- La cuantización a 6 bits puede introducir degradación sutil en tareas de razonamiento lingüístico frente a los pesos originales en bfloat16, aunque las torres perceptivas se mantienen sin cuantizar.
- La cuantización mixta depende del runtime MLX y oMLX; no es portable a otras plataformas sin reconversión.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base tencent/WeMM-Video-35BA3B y de los componentes subyacentes (Qwen3.5, Qwen3-VL, Whisper) antes de producción.
- El repositorio tiene un uso muy limitado (140 descargas, 1 like) en el momento de la consulta, por lo que la validación comunitaria es escasa.
- No se documentan capacidades de tool calling ni de agentes, lo que limita su uso en pipelines automatizados complejos.

## Enlaces

- [vanch007/WeMM-Video-35BA3B-mlx-6bit en Hugging Face](https://huggingface.co/vanch007/WeMM-Video-35BA3B-mlx-6bit)
- [tencent/WeMM-Video-35BA3B (modelo base)](https://huggingface.co/tencent/WeMM-Video-35BA3B)
- [vanch007/WeMM-Video-35BA3B-mlx-4bit](https://huggingface.co/vanch007/WeMM-Video-35BA3B-mlx-4bit)
- [vanch007/WeMM-Video-35BA3B-mlx-8bit](https://huggingface.co/vanch007/WeMM-Video-35BA3B-mlx-8bit)
- [Repositorio vanch007/mlx-wemm-video](https://github.com/vanch007/mlx-wemm-video)
