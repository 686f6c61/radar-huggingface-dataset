# tsinghua-ee/video-SALMONN-2-Pro-32B

## Resumen

video-SALMONN 2 Pro es un modelo de lenguaje grande audiovisual (audio-visual LLM) desarrollado por el Departamento de Ingeniería Electrónica de la Universidad de Tsinghua en colaboración con ByteDance. Se trata de una actualización de video-SALMONN 2 que sustituye el backbone original por Qwen3-VL, manteniendo el pipeline de alineación audio-visual y ajuste por instrucciones. El modelo está diseñado para comprender de forma conjunta el vídeo y su pista de audio, generar descripciones detalladas de vídeo y responder preguntas sobre contenido audiovisual.

La versión de 32B parámetros (34.290.188.528 en total) es la más grande de las tres ofrecidas (4B, 8B y 32B) y, según los datos publicados por los autores, supera a todos los sistemas de código abierto existentes en benchmarks de QA audiovisual como Video-MME, WorldSense, AVUT, Video-Holmes y DailyOmni, llegando incluso a superar a modelos propietarios como GPT-4o y Gemini-1.5 Pro. Su relevancia radica en que demuestra que un modelo abierto de 32B puede competir y ganar a sistemas cerrados mucho mayores en tareas multimodales que requieren integrar información visual y auditiva.

La arquitectura combina un LLM base (Qwen3-VL) con codificadores de vídeo y audio, y un módulo Q-Former para alinear las representaciones de ambas modalidades. El modelo se distribuye bajo licencia Apache-2.0, lo que permite uso comercial sin restricciones significativas. La longitud de contexto y los idiomas soportados no se especifican en la documentación disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-VL backbone con módulos de audio (Q-Former) y codificadores visuales |
| Parametros totales | 34.290.188.528 (34,29B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo safetensors en precisión completa) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

video-SALMONN 2 Pro hereda la arquitectura de video-SALMONN 2, que consiste en un LLM multimodal (ahora Qwen3-VL) al que se añaden un codificador de vídeo y un codificador de audio, conectados mediante un Q-Former que proyecta las características de ambas modalidades al espacio del texto. El modelo procesa el vídeo por tramos (intervalos de 0,1 segundos por defecto) y puede activar o desactivar el procesamiento de audio mediante el parámetro `use_audio`.

El entrenamiento se realiza en dos fases principales: primero una alineación audio-visual (entrenando el Q-Former con datos de vídeo y audio sincronizados) y después un ajuste supervisado (SFT) audio-visual, que en la versión Pro puede incluir LoRA. El paper original (arXiv:2506.15220) menciona además el uso de MrDPO (preferencia directa con datos generados por el propio modelo) para mejorar la calidad de las descripciones. Los detalles exactos del dataset de entrenamiento (número de tokens, composición) no se especifican en la información disponible.

## Capacidades

- Comprensión conjunta de vídeo y audio: el modelo integra la pista de audio (habla, sonidos ambientales, música) con las imágenes del vídeo para generar respuestas coherentes.
- Generación de descripciones detalladas de vídeo (video captioning), incluyendo contenido hablado y eventos visuales.
- Respuesta a preguntas audiovisuales (audio-visual QA) sobre el contenido de un vídeo.
- Soporte para vídeo sin audio (se puede desactivar el procesamiento de audio con `--no-audio`).
- Ajuste de la densidad de muestreo de frames (`--video-min-frames`, `--video-max-frames`) y del número máximo de tokens generados.
- No se documenta soporte explícito para tool calling, agentes o razonamiento multi-paso.
- No se especifican capacidades multilingües; el modelo se evalúa principalmente en inglés.

## Casos de uso

- Generación de subtítulos descriptivos para vídeos: el modelo puede producir descripciones detalladas que incluyen tanto lo que se ve como lo que se dice, útil para accesibilidad (personas con discapacidad visual) y para archivo de contenidos.
- Moderación de contenido audiovisual: análisis automático de vídeos para detectar contenido inapropiado o peligroso combinando pistas visuales y de audio.
- Búsqueda y recuperación de vídeos por contenido: generar metadatos semánticos (descripciones, etiquetas) que permitan indexar y buscar en grandes bibliotecas de vídeo.
- Asistencia educativa: explicar vídeos educativos o de conferencias, resumiendo tanto las diapositivas como la narración del ponente.
- Análisis de vídeos de vigilancia o grabaciones de cámaras: describir eventos y conversaciones en vídeos de seguridad para generar informes automáticos.
- Creación de metadatos para plataformas de vídeo (YouTube, Vimeo): generar títulos, descripciones y etiquetas automáticamente a partir del contenido audiovisual.
- Investigación en comprensión multimodal: servir como modelo base para experimentos en fusión audio-visual, transferencia de aprendizaje y evaluación de LLMs multimodales.

## Benchmarks y rendimiento

Los autores publican resultados en seis benchmarks de QA audiovisual. La tabla siguiente muestra los resultados del modelo de 32B comparado con otros sistemas relevantes (datos extraídos de la model card oficial):

| Modelo | Video-MME | WorldSense | AVUT | Video-Holmes | DailyOmni | FutureOmni |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| GPT-4o | 71,9 | 42,6 | 56,6 | 42,0 | 56,5 | 49,7 |
| Gemini-1.5 Pro* | 75,0 | 48,0 | 78,3 | 41,2 | - | - |
| Qwen2.5-VL (72B) | 73,3 | - | - | 50,2 | 61,8 | - |
| LLaVA-Video (72B) | 70,5 | - | - | - | - | - |
| video-SALMONN 2+ (72B)* | 79,7 | 56,5 | 72,2 | 57,8 | 79,4 | 60,8 |
| **video-SALMONN 2 Pro (32B)*** | **82,7** | **59,4** | **81,1** | **61,7** | **81,7** | **61,4** |

\* Modelos que utilizan entrada de audio.

El modelo de 32B supera a todos los sistemas de código abierto y a los modelos propietarios listados en todos los benchmarks donde se compara. No se han publicado resultados de benchmarks adicionales (como MMLU, HumanEval o GSM8K) en la información disponible.

## Requisitos de hardware

- El repositorio pesa 68,6 GB en safetensors, lo que corresponde a pesos en precisión fp16/bf16 (34,29B parámetros × 2 bytes).
- Para inferencia en precisión completa se necesitan al menos 2 GPUs de 40 GB (p. ej., A100 40GB) o una GPU de 80 GB (A100 80GB, H100).
- Con cuantización a 8 bits (no oficialmente publicada) podría caber en una GPU de 48 GB, pero no hay datos confirmados.
- No se documentan cuantizaciones GGUF ni soporte en llama.cpp u Ollama.
- El proyecto ofrece un servidor vLLM compatible con OpenAI (`scripts/serve.py`), lo que permite despliegue en producción con batching y throughput alto.
- Para entrenamiento con LoRA, el script oficial `train.sh` está pensado para 8 GPUs (configuración distribuida con ARNOLD/METIS).
- La latencia y el throughput no se especifican en la documentación disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Video-MME | Licencia | Disponibilidad |
| --- | ---: | ---: | ---: | --- | --- |
| video-SALMONN 2 Pro (32B) | 34,29B | No disponible | 82,7 | Apache-2.0 | Abierto (HuggingFace) |
| video-SALMONN 2+ (72B) | 72B | No disponible | 79,7 | Apache-2.0 | Abierto (HuggingFace) |
| Qwen2.5-VL (72B) | 72B | No disponible | 73,3 | Apache-2.0 | Abierto (HuggingFace) |
| GPT-4o | No publicado | No disponible | 71,9 | Propietaria | API cerrada |
| Gemini-1.5 Pro | No publicado | No disponible | 75,0 | Propietaria | API cerrada |

El modelo de 32B supera a alternativas abiertas de mayor tamaño (72B) y a modelos propietarios, lo que lo convierte en una opción muy atractiva para tareas audiovisuales. Sin embargo, carece de información pública sobre longitud de contexto, lo que limita la comparación en escenarios de vídeo largo.

## Limitaciones y advertencias

- No se han publicado estudios de sesgos ni evaluaciones de seguridad específicas para este modelo.
- Como todo LLM multimodal, existe riesgo de alucinación en la descripción de detalles visuales o auditivos ambiguos.
- La longitud de contexto no está documentada, lo que dificulta estimar el número máximo de frames o la duración de vídeo que puede procesar de forma fiable.
- No se especifican los idiomas soportados; los benchmarks publicados son en inglés, por lo que el rendimiento en otros idiomas es incierto.
- El modelo requiere hardware de gama alta (mínimo 40-80 GB de VRAM para inferencia en precisión completa), lo que limita su uso en entornos con recursos modestos.
- No hay cuantizaciones oficiales publicadas, por lo que el despliegue en GPUs de consumo (p. ej., RTX 4090 de 24 GB) no es viable sin trabajo adicional de cuantización.
- La licencia Apache-2.0 permite uso comercial, pero los autores no ofrecen garantías sobre el comportamiento del modelo en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tsinghua-ee/video-SALMONN-2-Pro-32B
- Paper (arXiv): https://arxiv.org/abs/2506.15220
- Repositorio GitHub: https://github.com/bytedance/video-SALMONN-2
- Colección de modelos video-SALMONN 2: https://huggingface.co/collections/tsinghua-ee/video-salmonn-2
- Modelo de 4B: https://huggingface.co/tsinghua-ee/video-SALMONN-2-Pro-4B
- Modelo de 8B: https://huggingface.co/tsinghua-ee/video-SALMONN-2-Pro-8B
