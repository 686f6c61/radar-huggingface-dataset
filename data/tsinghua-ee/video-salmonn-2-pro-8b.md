# tsinghua-ee/video-SALMONN-2-Pro-8B

## Resumen

video-SALMONN 2 Pro es un modelo de lenguaje grande audiovisual (audio-visual LLM) desarrollado por el Departamento de Ingeniería Electrónica de la Universidad de Tsinghua en colaboración con ByteDance. Se trata de una actualización de video-SALMONN 2 que sustituye el backbone original por Qwen3-VL, manteniendo el pipeline de alineación audio-visual y el ajuste por instrucciones. El modelo está diseñado para comprender conjuntamente pistas de vídeo y audio, generar subtítulos detallados de vídeo y responder preguntas sobre contenido audiovisual.

La versión de 8B parámetros (la que se documenta en esta ficha) alcanza resultados de vanguardia en benchmarks de pregunta-respuesta audiovisual como Video-MME (77,5), WorldSense (55,0) y DailyOmni (80,0), superando a sistemas cerrados como GPT-4o y Gemini-1.5 Pro en varias de estas pruebas. El modelo se distribuye bajo licencia Apache-2.0, lo que permite uso comercial sin restricciones significativas. Está disponible en tres tamaños (4B, 8B y 32B), siendo el de 8B el que ofrece el mejor equilibrio entre rendimiento y requisitos de hardware.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-VL backbone con módulo Q-Former para alineación audio-visual |
| Parametros totales | 9.696.775.408 (8B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el backbone Qwen3-VL soporta múltiples idiomas, pero no se especifica para este modelo) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

video-SALMONN 2 Pro se construye sobre el backbone Qwen3-VL, un modelo de lenguaje multimodal basado en transformer con capacidades de visión. Sobre este backbone se añade un módulo Q-Former que actúa como puente de alineación entre las representaciones visuales y auditivas y el espacio de embeddings del LLM. El pipeline de entrenamiento consta de dos fases principales: primero una alineación audio-visual (audio alignment) y después un ajuste supervisado por instrucciones (SFT) con datos audiovisuales. El entrenamiento SFT puede realizarse con LoRA (r=128, alpha=256) para reducir requisitos de memoria.

Una innovación destacable es el uso de MrDPO (un método de optimización de preferencias directa modificado) para generar datos de entrenamiento sintéticos de alta calidad. El modelo se entrena con datos en formato JSON/JSONL donde cada muestra incluye la ruta del vídeo, un flag para indicar si se debe procesar el audio incrustado, y una conversación multi-turno. El entrenamiento soporta hasta 768 frames por vídeo con un máximo de 61.250 píxeles por frame, lo que permite procesar vídeos largos con detalle.

## Capacidades

- Comprensión conjunta de vídeo y audio: el modelo procesa simultáneamente la pista visual y la pista de audio de un vídeo, lo que permite responder preguntas que requieren integrar información de ambas modalidades.
- Subtitulado detallado de vídeo: genera descripciones narrativas completas que incluyen tanto la escena visual como el contenido hablado.
- Pregunta-respuesta audiovisual: responde preguntas sobre el contenido de un vídeo, incluyendo preguntas sobre diálogos, sonidos ambientales y acciones.
- Soporte de instrucciones personalizadas: permite pasar prompts arbitrarios para tareas específicas mediante el flag `--prompt`.
- Modo sin audio: se puede desactivar el procesamiento de audio con `--no-audio` para tareas puramente visuales.
- Capacidades multilingües: heredadas del backbone Qwen3-VL, aunque no se especifican los idiomas exactos soportados.
- Entrenamiento y fine-tuning: el modelo se puede ajustar con datos propios mediante scripts de entrenamiento distribuido y fusión de checkpoints LoRA.

## Casos de uso

- Análisis de vídeo para moderación de contenido: el modelo puede procesar vídeos generados por usuarios y detectar contenido inapropiado combinando la información visual y la pista de audio, lo que permite identificar discursos de odio o violencia que solo son evidentes al integrar ambas modalidades.
- Subtitulado automático de vídeos para accesibilidad: genera subtítulos descriptivos que incluyen tanto el diálogo como la descripción de la escena, útil para personas con discapacidad visual o auditiva. El modelo puede procesar vídeos largos gracias a su soporte de hasta 768 frames.
- Búsqueda semántica en archivos de vídeo: permite indexar grandes colecciones de vídeo generando descripciones detalladas que se pueden usar para búsqueda por texto, facilitando la recuperación de momentos específicos en grabaciones de vigilancia o material de archivo.
- Asistente de revisión de vídeo para creadores de contenido: los editores pueden usar el modelo para generar resúmenes automáticos de grabaciones largas, identificar los momentos más relevantes y extraer citas textuales del audio, acelerando el flujo de trabajo de postproducción.
- Evaluación de anuncios y material de marketing: el modelo puede analizar spots publicitarios y generar descripciones detalladas de la narrativa visual y auditiva, lo que permite a los equipos de marketing comparar cómo se transmite el mensaje en diferentes versiones de un anuncio.
- Investigación académica en comprensión multimodal: sirve como punto de partida para investigar la interacción entre visión y audio en modelos de lenguaje, y se puede fine-tunear con datos propios para dominios específicos como la robótica o la monitorización de entornos industriales.

## Benchmarks y rendimiento

La tabla siguiente muestra los resultados publicados en la model card del autor, comparando video-SALMONN 2 Pro (8B) con otros modelos de tamaño similar y con sistemas cerrados de gran escala. Los asteriscos indican modelos que utilizan entrada de audio.

| Modelo | Video-MME | WorldSense | AVUT | Video-Holmes | DailyOmni | FutureOmni |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| VideoLLaMA3 (2B) | 59,6 | - | - | - | - | - |
| Qwen2.5-Omni (3B)* | 62,0 | - | - | - | 40,5 | 38,9 |
| Qwen2.5-VL (3B) | 61,5 | - | - | - | 37,4 | - |
| video-SALMONN 2+ (3B)* | 68,3 | 48,3 | 66,2 | 42,2 | 67,7 | 50,5 |
| video-SALMONN 2 Pro (4B)* | 75,4 | 54,3 | 77,2 | 50,1 | 78,9 | 55,6 |
| LLaVA-Video (7B) | 63,3 | 40,2 | 56,5 | - | - | - |
| VideoLLaMA2 (7B)* | 54,9 | 25,4 | 44,9 | - | 35,2 | 40,8 |
| VideoLLaMA3 (7B) | 66,2 | - | - | - | - | 46,8 |
| Qwen2.5-Omni (7B)* | 64,3 | 45,4 | - | 16,4 | 47,5 | 47,5 |
| Qwen2.5-VL (7B) | 65,1 | - | - | 27,8 | 40,7 | 43,7 |
| video-SALMONN 2 (7B)* | 67,4 | 48,6 | 65,6 | 40,7 | 66,3 | 48,7 |
| video-SALMONN 2+ (7B)* | 73,4 | 50,9 | 69,5 | 46,9 | 71,8 | 51,0 |
| **video-SALMONN 2 Pro (8B)*** | **77,5** | **55,0** | **78,3** | **55,1** | **80,0** | **58,0** |
| GPT-4o | 71,9 | 42,6 | 56,6 | 42,0 | 56,5 | 49,7 |
| Gemini-1.5 Pro* | 75,0 | 48,0 | 78,3 | 41,2 | - | - |
| Qwen3-Omni-Flash* | 71,4 | 54,1 | - | 57,3 | 76,2 | - |
| LLaVA-Video (72B) | 70,5 | - | - | - | - | - |
| Qwen2.5-VL (72B) | 73,3 | - | - | 50,2 | 61,8 | - |
| video-SALMONN 2+ (72B)* | 79,7 | 56,5 | 72,2 | 57,8 | 79,4 | 60,8 |
| video-SALMONN 2 Pro (32B)* | 82,7 | 59,4 | 81,1 | 61,7 | 81,7 | 61,4 |

## Requisitos de hardware

- VRAM estimada para inferencia: no se especifica oficialmente, pero para un modelo de 8B en FP16 se estiman entre 20 y 24 GB de VRAM. Con cuantización a 8 bits podría reducirse a unos 12-14 GB, y a 4 bits a unos 6-8 GB.
- GPU recomendadas: una NVIDIA RTX 4090 (24 GB) o A100 (40/80 GB) son suficientes para inferencia en FP16. Para fine-tuning con LoRA se recomienda al menos 40 GB de VRAM.
- Compatibilidad con GPU de consumo: sí, una RTX 3090 o RTX 4090 puede ejecutar el modelo en FP16 o con cuantización ligera. Para cuantización a 4 bits, una GPU con 8-12 GB podría ser suficiente.
- Opciones de despliegue: el repositorio incluye un script de inferencia (`scripts/inference.py`) y un servidor compatible con la API de OpenAI mediante vLLM (`scripts/serve.py`). También se puede usar con Transformers de HuggingFace.
- Latencia y throughput: no se han publicado datos oficiales. Con vLLM en una A100, se espera una latencia de 1-3 segundos para respuestas cortas y un throughput de 10-30 peticiones por segundo, dependiendo de la longitud del vídeo y de los tokens generados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Video-MME | Licencia | Disponibilidad |
| --- | --- | --- | ---: | --- | --- |
| video-SALMONN 2 Pro (8B) | 8B | no disponible | 77,5 | Apache-2.0 | HuggingFace |
| video-SALMONN 2+ (7B) | 7B | no disponible | 73,4 | Apache-2.0 | HuggingFace |
| Qwen2.5-Omni (7B) | 7B | no disponible | 64,3 | Apache-2.0 | HuggingFace |
| LLaVA-Video (7B) | 7B | no disponible | 63,3 | Apache-2.0 | HuggingFace |
| GPT-4o | no disponible | no disponible | 71,9 | Propietaria | API |

video-SALMONN 2 Pro (8B) supera claramente a sus predecesores y a los modelos de tamaño similar en los benchmarks audiovisuales. La ventaja principal frente a Qwen2.5-Omni y LLaVA-Video es el pipeline de alineación audio-visual específico y el uso de MrDPO para generar datos de entrenamiento de alta calidad. Frente a GPT-4o, el modelo de 8B ofrece mejores resultados en Video-MME, WorldSense, DailyOmni y FutureOmni, con la ventaja adicional de ser de código abierto y ejecutable localmente.

## Limitaciones y advertencias

- No se han publicado evaluaciones de sesgos o alucinaciones específicas para este modelo. Como cualquier LLM multimodal, puede generar descripciones inexactas o inventar detalles cuando el vídeo o el audio son ambiguos o de baja calidad.
- La longitud de contexto no está documentada, lo que dificulta estimar el límite de frames o de duración de vídeo que el modelo puede procesar de forma fiable.
- Los idiomas soportados no están especificados. Aunque el backbone Qwen3-VL es multilingüe, no hay garantía de que el ajuste audiovisual mantenga el mismo nivel de calidad en todos los idiomas.
- El procesamiento de vídeo con audio requiere un backend de decodificación de vídeo funcional y suficiente VRAM para manejar el número de frames configurado (hasta 768). En GPUs de gama baja, esto puede provocar desbordamiento de memoria.
- El entrenamiento de la versión de 32B requiere múltiples GPUs o una configuración agresiva de DeepSpeed, lo que limita su uso a entornos con infraestructura de cómputo avanzada.
- La licencia Apache-2.0 permite uso comercial, pero es recomendable revisar los términos de la licencia del backbone Qwen3-VL, que puede tener condiciones adicionales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tsinghua-ee/video-SALMONN-2-Pro-8B
- Modelo 4B: https://huggingface.co/tsinghua-ee/video-SALMONN-2-Pro-4B
- Modelo 32B: https://huggingface.co/tsinghua-ee/video-SALMONN-2-Pro-32B
- Paper (arXiv): https://arxiv.org/abs/2506.15220
- Repositorio GitHub: https://github.com/bytedance/video-SALMONN-2
- Modelo anterior video-SALMONN 2: https://huggingface.co/tsinghua-ee/video-SALMONN-2
