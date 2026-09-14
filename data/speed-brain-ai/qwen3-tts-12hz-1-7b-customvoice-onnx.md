# speed-brain-ai/Qwen3-TTS-12Hz-1.7B-CustomVoice-ONNX

## Resumen

El modelo Qwen3-TTS-12Hz-1.7B-CustomVoice-ONNX es una exportación a ONNX del modelo de texto a voz Qwen3-TTS-12Hz-1.7B-CustomVoice, desarrollado por el equipo Qwen de Alibaba Cloud. El reempaquetado ha sido realizado por speedbrain.ai, que lo integra en su motor TTS denominado speedbrain, pensado para ofrecer streaming en tiempo real, caché KV, clonación de voz y ejecución sin Docker ni instalación, a partir de un único archivo comprimido.

La arquitectura se compone de un talker transformer de 28 capas con dimensión oculta 2048, un predictor de códecs residuales de 15 codebooks y un decodificador de códecs que genera audio a 24 kHz. Incluye además un codificador de hablante basado en ECAPA-TDNN para clonación de voz. El modelo se ofrece en cuatro variantes ONNX: fp32, fp16, int4 para CPU y CUDA, con tamaños que van desde 2,59 GB hasta 9,18 GB.

La relevancia de esta versión reside en su despliegue sencillo y flexible: al estar exportado con torch.onnx dynamo exporter (opset 18) y dividido en grafos por componentes, permite integrarse en aplicaciones de producción mediante ONNX Runtime, sin necesidad de infraestructura Docker.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-TTS: transformer talker de 28 capas, H=2048, code predictor de 15 codebooks residuales, codec decoder a 24 kHz, speaker encoder ECAPA-TDNN |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp32, fp16, int4 (weight-only MatMulNBits, bloque 32, simétrico) |
| Idiomas soportados | alemán, inglés, francés, español, italiano, portugués, ruso, japonés, coreano, chino |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (opset 18) |

## Arquitectura y entrenamiento

El modelo es una exportación ONNX de los pesos originales de Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice. La arquitectura combina un talker transformer de 28 capas con dimensión oculta 2048, un predictor de códecs que genera 15 codebooks residuales y un decodificador de códecs que produce audio PCM a 24 kHz. El codificador de hablante es una red ECAPA-TDNN extraída del checkpoint base de Qwen3-TTS y funciona en fp32, con un tamaño aproximado de 36 MB.

El proceso de exportación se realizó con torch.onnx dynamo exporter, opset 18 y torch 2.14.0+cu130. Las variantes fp16 se trazan en media precisión con núcleos de normalización en float32; las variantes int4 aplican cuantización solo a los pesos (weight-only) mediante MatMulNBits con bloque 32 y simetría, mientras que las cabezas de salida, los embeddings, el predictor de códecs y el decodificador del códec permanecen en precisión completa. No se han publicado datos sobre el entrenamiento original del modelo base en la información disponible.

## Capacidades

- Generación de texto a voz en 10 idiomas: alemán, inglés, francés, español, italiano, portugués, ruso, japonés, coreano y chino.
- Streaming en tiempo real: el motor speedbrain utiliza caché KV y grafos por componentes para generar audio de forma incremental.
- Clonación de voz: a partir de un clip de 5 a 15 segundos de un hablante, el speaker encoder produce un embedding que sustituye al token de hablante.
- Soporte de instrucciones de estilo: las voces clonadas admiten indicaciones de estilo, al igual que las voces predefinidas.
- Generación de audio a 24 kHz: el decodificador de códecs (tok_decoder) genera muestras de audio a 24 kHz.
- Despliegue sin Docker ni instalación: el motor se distribuye como un archivo comprimido que se ejecuta directamente.
- No incluye capacidades de tool calling, visión, razonamiento multimodal ni agentes, al ser un modelo puramente de texto a voz.

## Casos de uso

- Asistentes de voz en tiempo real: el modelo puede usarse en chatbots o asistentes que necesitan respuestas habladas inmediatas. Su diseño de streaming con caché KV reduce la latencia y permite generar audio mientras se recibe texto.
- Clonación de voz para narración personalizada: mediante el comando `/clone` o el endpoint `PUT /v1/voices/NAME`, se puede crear una voz sintética a partir de una muestra de 5-15 segundos, ideal para audiolibros o contenido personalizado.
- Localización de contenido audiovisual: al soportar 10 idiomas, se puede emplear para generar voces en doblaje, subtítulos hablados o versiones multilingües de vídeos y podcasts.
- Despliegue en entornos edge o servidores ligeros: las variantes int4 para CPU (4,42 GB) y CUDA (2,59 GB) permiten ejecutar el modelo en hardware modesto sin necesidad de contenedores, lo que facilita su integración en sistemas embebidos o en máquinas con recursos limitados.
- Sistemas de respuesta de voz interactiva (IVR): el servidor HTTP incluido en el motor speedbrain permite generar audio bajo demanda para centralitas telefónicas, menús de voz o sistemas de atención al cliente automatizados.
- Integración en pipelines de producción con ONNX Runtime: al dividir el modelo en grafos independientes (text_embed, talker_cache, code_predictor, tok_decoder), se puede controlar cada etapa y combinarla con otros servicios, por ejemplo para preprocesar texto o postprocesar audio.
- Accesibilidad y lectores de pantalla: la capacidad multilingüe y la generación de voz natural permiten implementar herramientas de accesibilidad para personas con discapacidad visual, con soporte para varios idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar como MMLU, HumanEval o GSM8K, ya que se trata de un modelo de texto a voz. La información disponible incluye una evaluación de paridad frente al backend de torch en modo teacher-forced con decodificación greedy:

| Variante | Resultado | Talker top-1 | Code predictor top-1 | Decoder SNR |
|---|---|---|---|---|
| cpu_int4 | pass | 0,959 | 1,000 | 55,5 dB |
| cuda_fp16 | pass | 1,000 | 0,990 | 52,5 dB |

## Requisitos de hardware

- VRAM estimada para inferencia: según la variante elegida. Para CUDA, cuda_fp16 requiere 4,62 GB de VRAM y cuda_int4 requiere 2,59 GB. Para CPU, cpu_fp32 necesita 9,18 GB de RAM y cpu_int4 necesita 4,42 GB.
- GPU recomendadas: para cuda_fp16, una GPU con al menos 6 GB de VRAM (por ejemplo, RTX 2060, RTX 3060); para cuda_int4, una GPU con al menos 4 GB de VRAM (por ejemplo, GTX 1650, RTX 3050). En CPU, se recomienda un procesador con soporte AVX2 y suficiente RAM.
- Cabe en GPU de consumo: sí, la variante cuda_int4 cabe en tarjetas de 4 GB y la cuda_fp16 en tarjetas de 6 GB.
- Opciones de despliegue: motor speedbrain (sbtts), ONNX Runtime, servidor HTTP integrado, y posibilidad de usar los grafos por componentes de forma individual.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Formato | Tamaño | Licencia | Notas |
|---|---|---|---|---|
| Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice (original) | PyTorch | no disponible | Apache-2.0 | Modelo base, pesos originales |
| speed-brain-ai/Qwen3-TTS-12Hz-1.7B-CustomVoice-ONNX | ONNX | 2,59-9,18 GB según variante | Apache-2.0 | Export para motor speedbrain, con streaming y clonación de voz |

No se dispone de información sobre otras alternativas de la misma categoría.

## Limitaciones y advertencias

- No se han documentado sesgos específicos en la información disponible.
- Al ser un modelo de texto a voz, no genera texto, por lo que el riesgo de alucinación se limita a posibles errores en la síntesis de audio o en la selección de códecs.
- La longitud de contexto no está especificada; el README recomienda no superar T=300 en el decodificador de códecs (tok_decoder) para evitar problemas de rendimiento.
- La cuantización int4 degrada ligeramente la precisión: en la evaluación de paridad, la variante cpu_int4 alcanza un top-1 de 0,959 en el talker frente a 1,000 en cuda_fp16.
- El modelo depende del motor speedbrain y de ONNX Runtime; no es un checkpoint estándar de PyTorch, por lo que su integración requiere usar la estructura de grafos proporcionada.
- La licencia Apache-2.0 permite uso comercial, pero se debe mantener el aviso de copyright y la atribución original.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/speed-brain-ai/Qwen3-TTS-12Hz-1.7B-CustomVoice-ONNX
- Modelo base: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice
- Sitio web de speedbrain.ai: https://speedbrain.ai/
- GitHub de speed-brain-ai: https://github.com/speed-brain-ai
- Perfil de HuggingFace de speed-brain-ai: https://huggingface.co/speed-brain-ai
