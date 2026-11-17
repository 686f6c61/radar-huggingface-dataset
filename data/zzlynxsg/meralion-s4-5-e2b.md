# zzlynxSG/MERaLiON-S4.5-E2B

## Resumen

MERaLiON-S4.5-E2B es un modelo multimodal any-to-any (imagen, audio y video hacia texto) orientado al sudeste asiatico, desarrollado por el usuario zzlynxSG. Se obtiene mediante post-entrenamiento del checkpoint `aisingapore/Gemma-SEA-LION-v4.5-E2B-IT` (a su vez construido sobre Gemma 4 E2B), aplicando primero un ajuste supervisado (SFT) y despues una alineacion cultural basada en GRPO (Group Relative Policy Optimization). Los pesos publicados son pesos completos, sin necesidad de cargar adaptadores.

El modelo acepta texto con un adjunto opcional de imagen, un clip de audio de hasta 30 segundos o un video muestreado a 1 FPS con un maximo de 30 fotogramas (incluyendo su propia pista de audio), y genera texto. Su interes radica en cubrir idiomas y contextos culturales del sudeste asiatico (indonesio, malayo, tailandes, tamil, chino e ingles) con una unica arquitectura multimodal de aproximadamente 5.100 millones de parametros totales, de los cuales unos 2.300 millones son efectivos segun la nomenclatura del autor.

La relevancia actual viene de su caracter de investigacion: es una release alpha, con licencia exclusivamente de investigacion y sin alineacion de seguridad adicional mas alla de la del modelo base. No esta pensado para produccion, pero resulta util como referencia para estudiar alineacion cultural multimodal en lenguas de bajos recursos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 4) con codificadores de vision, audio y video; pipeline any-to-any |
| Parametros totales | 5.104.297.539 |
| Parametros activos | 2.300 millones efectivos (5.100 millones incluyendo embeddings, segun el autor) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, zh, id, ms, th, ta |
| Licencia | research-only (uso exclusivamente de investigacion, no comercial) |
| Formato de pesos | safetensors (pesos completos, sin adaptadores) |

## Arquitectura y entrenamiento

El modelo parte de `aisingapore/Gemma-SEA-LION-v4.5-E2B-IT`, un checkpoint basado en la generacion Gemma 4 con soporte nativo para texto, imagen, audio y video. Sobre esa base se aplica un ajuste supervisado (SFT) seguido de una fase de alineacion cultural mediante GRPO, un algoritmo de aprendizaje por refuerzo que optimiza recompensas relativas dentro de grupos de respuestas. El autor indica que el entrenamiento sigue el metodo de dos papers citados (arxiv:2602.23730 entre las referencias) pero sobre una version ampliada de los datos utilizados en ellos.

La preprocesamiento de entrenamiento limita las imagenes a 512x512 pixeles, el audio a clips de hasta 30 segundos a 16 kHz mono y el video a 1 FPS con un maximo de 30 fotogramas, extrayendo ademas la pista de audio del video mediante ffmpeg. El modelo se distribuye como pesos completos, por lo que no requiere cargar adaptadores tipo LoRA. La innovacion principal es la combinacion de capacidades multimodales (vision, audio, ASR, video) con una alineacion cultural especifica para el sudeste asiatico mediante RL.

## Capacidades

- Generacion de texto y razonamiento multimodal a partir de imagen, audio o video.
- Descripcion detallada de imagenes (image-text-to-text).
- Transcripcion de audio y reconocimiento automatico del habla (ASR) en clips de hasta 30 segundos.
- Comprension y resumen de video muestreado a 1 FPS con hasta 30 fotogramas, incluyendo su audio.
- Capacidades multilingues en ingles, chino, indonesio, malayo, tailandes y tamil.
- Alineacion cultural orientada al sudeste asiatico mediante GRPO.
- Soporte de conversacion multi-turno mediante plantilla de chat (`apply_chat_template`).
- No se documenta soporte explicito de tool calling ni de agentes multi-paso en la informacion disponible.

## Casos de uso

- Transcripcion de audio en lenguas del sudeste asiatico: el modelo acepta clips de hasta 30 segundos a 16 kHz mono y puede transcribir habla en indonesio, malayo, tailandes o tamil, util para investigacion en ASR de bajos recursos.
- Descripcion de imagenes para estudios culturales: con imagenes de hasta 512x512 pixeles, permite analizar como el modelo interpreta elementos visuales regionales y detectar sesgos culturales.
- Analisis de video corto con audio: al procesar hasta 30 fotogramas a 1 FPS junto con su pista de audio, sirve para experimentos de comprension audiovisual en clips breves.
- Investigacion en alineacion cultural: la fase GRPO permite estudiar como el refuerzo con recompensas culturales afecta a las respuestas en lenguas regionales.
- Evaluacion comparativa de modelos multimodales: al ser hermano de MERaLiON-G4-E4B (misma receta, base distinta), facilita experimentos controlados sobre el efecto del modelo base.
- Prototipado de asistentes multimodales en investigacion academica: la plantilla de chat y el script `inference.py` permiten montar demos de laboratorio con imagen, audio o video como entrada.
- Extraccion de informacion de documentos escaneados en idiomas regionales: la combinacion de vision y multilingue permite experimentar con OCR semantico y comprension de documentos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks completos en la informacion disponible. La model card menciona una seccion de evaluacion con numeros de su propio pipeline sobre datos held-out con decodificacion greedy, pero los valores no aparecen en el extracto proporcionado. El autor advierte ademas que esas cifras son de su propia evaluacion de esta release y no las reportadas en los papers citados.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 10,2 GB en safetensors; en precision completa se requiere aproximadamente esa cantidad mas el overhead de activaciones y buffers multimodales. En cuantizacion de 8 bits cabria en torno a 5-6 GB y en 4 bits alrededor de 3-4 GB (estimacion, no confirmada por el autor).
- GPU recomendadas: A100 o H100 para evaluacion con precision completa; RTX 4090 (24 GB) para inferencia comoda en fp16/bf16.
- Cabe en GPU de consumo: si, previsiblemente en RTX 3090/4090 (24 GB) en bf16 y en GPUs de 8-12 GB con cuantizacion, aunque no se documentan recetas de cuantizacion.
- Opciones de despliegue: `transformers >= 5.5` con `AutoModelForMultimodalLM` y `AutoProcessor` (requiere `trust_remote_code=True`), `accelerate` para `device_map="auto"`, mas `librosa`, `decord`, `pillow` y `ffmpeg`/`ffprobe` en el PATH. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Notas |
|---|---|---|---|---|---|
| MERaLiON-S4.5-E2B | 5,1B totales (2,3B efectivos) | no disponible | texto, imagen, audio, video | research-only | Este modelo; alineacion cultural via GRPO |
| MERaLiON-G4-E4B | 8B totales (4,5B efectivos) | no disponible | texto, imagen, audio, video | research-only | Hermano sobre Gemma 4; misma receta |
| Gemma-SEA-LION-v4.5-E2B-IT | 5,1B (heredado) | no disponible | texto, imagen, audio, video | MIT (upstream) | Modelo base; sin la fase GRPO de alineacion cultural |
| Gemma 4 E2B | no disponible | no disponible | texto, imagen, audio, video | no disponible | Base generacional del linaje |

## Limitaciones y advertencias

- Licencia research-only: el uso comercial esta prohibido; la restriccion aplica a los pesos post-entrenados, aunque el modelo base upstream conserve su licencia original (MIT para S4.5-E2B, Apache-2.0 para G4-E4B).
- Release alpha no lista para produccion: el autor indica explicitamente que no es apta para despliegue real ni para decisiones que afecten a personas.
- Sin alineacion de seguridad adicional ni red-teaming mas alla del modelo base.
- Riesgo de alucinacion, incluyendo detalles culturales, visuales y de entidades nombradas incorrectos o inventados.
- Puede rechazar peticiones validas y producir texto sesgado o danino.
- Errores de transcripcion de habla (ASR) documentados por el autor.
- No debe usarse para fines medicos, legales, financieros o de seguridad critica.
- Limites de entrada: audio de hasta 30 segundos, video de hasta 30 fotogramas a 1 FPS, imagenes de hasta 512x512 pixeles en entrenamiento.
- Longitud de contexto no documentada.
- Cobertura linguistica limitada a seis idiomas (en, zh, id, ms, th, ta).
- Detalle de decodificacion critico: usar la lista de EOS del propio modelo [1, 106, 50] y no anadir el token 107 (salto de linea en el vocabulario de Gemma 4).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zzlynxSG/MERaLiON-S4.5-E2B
- Modelo base: https://huggingface.co/aisingapore/Gemma-SEA-LION-v4.5-E2B-IT
- Modelo hermano MERaLiON-G4-E4B: https://huggingface.co/zzlynxSG/MERaLiON-G4-E4B
- Licencia: https://huggingface.co/zzlynxSG/MERaLiON-S4.5-E2B/blob/main/LICENSE
- Paper citado: https://arxiv.org/abs/2602.23730
