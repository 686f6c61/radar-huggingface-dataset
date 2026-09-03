# tsinghua-ee/video-SALMONN-2-Pro-4B

## Resumen

video-SALMONN 2 Pro es una familia de modelos multimodales de audio y vídeo desarrollada por el Departamento de Ingeniería Electrónica de la Universidad de Tsinghua en colaboración con ByteDance. Esta versión Pro actualiza el modelo video-SALMONN 2 original al sustituir su backbone por Qwen3-VL, manteniendo el pipeline de alineación audio-visual y el ajuste fino por instrucciones. El modelo está diseñado para comprender simultáneamente pistas de vídeo y audio, generar descripciones detalladas de vídeo y responder preguntas sobre contenido audiovisual.

La variante de 4B millones de parámetros (5,36B en total) es la más ligera de la familia, que también incluye versiones de 8B y 32B. Según los datos publicados, el modelo de 4B alcanza resultados de vanguardia en benchmarks de QA audiovisual a su escala, superando a modelos como Qwen2.5-Omni (3B) y video-SALMONN 2+ (3B) en la mayoría de las métricas. El modelo se distribuye bajo licencia Apache 2.0, lo que permite uso comercial y modificación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-VL backbone con módulos de alineación audio-visual (Q-Former y proyecciones) |
| Parametros totales | 5.362.747.392 (5,36B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible (probablemente multilingüe por el backbone Qwen3-VL, pero no confirmado) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

video-SALMONN 2 Pro se construye sobre el modelo de lenguaje Qwen3-VL, al que se añaden módulos específicos para procesar audio y vídeo. El pipeline de alineación audio-visual se hereda de video-SALMONN 2, que utiliza un codificador de audio (probablemente Whisper o similar) y un Q-Former para fusionar las representaciones de audio y vídeo antes de pasarlas al LLM. El entrenamiento consta de dos fases: primero una alineación audio-visual (con datos de vídeo y audio sincronizados) y después un ajuste fino supervisado (SFT) con datos de instrucciones, incluyendo datos generados por el propio modelo mediante técnicas de preferencia (MrDPO, según el paper). El modelo soporta entrenamiento con LoRA y fusión posterior de adaptadores.

No se dispone de información detallada sobre el número de tokens de entrenamiento ni la composición exacta del dataset. El paper asociado (arXiv:2506.15220) describe la metodología de video-SALMONN 2, que es la base de esta versión Pro.

## Capacidades

- Comprensión conjunta de vídeo y audio: procesa simultáneamente la pista visual y la pista de audio de un vídeo, lo que permite responder preguntas que requieren integrar información de ambas modalidades.
- Generación de descripciones detalladas de vídeo: produce captions largos y descriptivos que incluyen tanto el contenido visual como el hablado.
- Preguntas y respuestas audiovisuales: responde a preguntas sobre el contenido de un vídeo, incluyendo diálogos, sonidos ambientales y acciones.
- Soporte de instrucciones personalizadas: acepta prompts arbitrarios para tareas específicas de análisis de vídeo.
- Capacidad de ignorar audio: mediante el flag `--no-audio` se puede desactivar el procesamiento de audio si no es necesario.
- Multilingüe (probable): al estar basado en Qwen3-VL, es probable que herede capacidades multilingües, aunque no se confirma en la documentación.
- No se menciona soporte de tool calling ni funciones de agente en la información disponible.

## Casos de uso

- Análisis de vídeo para moderación de contenido: el modelo puede examinar vídeos generados por usuarios y detectar contenido inapropiado tanto en la pista visual como en la de audio, generando informes descriptivos.
- Subtitulado automático de vídeos: genera subtítulos descriptivos que incluyen diálogos, efectos de sonido y descripciones de acciones, útil para accesibilidad o archivado.
- Búsqueda semántica en videotecas: indexa vídeos mediante descripciones generadas automáticamente, permitiendo búsquedas por contenido hablado o visual.
- Asistente para personas con discapacidad visual: describe el contenido de vídeos en tiempo real o bajo demanda, integrando información de audio y visual.
- QA sobre material educativo en vídeo: responde preguntas sobre clases grabadas o tutoriales, combinando lo que se ve en pantalla con lo que se dice.
- Análisis de vídeo para investigación social: extrae información de entrevistas o grabaciones de campo, correlacionando gestos, expresiones y diálogos.
- Generación de metadatos para plataformas de vídeo: crea descripciones y etiquetas automáticas para mejorar la recomendación y el SEO de contenidos.

## Benchmarks y rendimiento

La model card proporciona resultados en benchmarks de QA audiovisual. La siguiente tabla muestra los resultados del modelo de 4B comparado con otros modelos de escala similar (los asteriscos indican modelos que usan entrada de audio):

| Modelo | Video-MME | WorldSense | AVUT | Video-Holmes | DailyOmni | FutureOmni |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| VideoLLaMA3 (2B) | 59.6 | - | - | - | - | - |
| Qwen2.5-Omni (3B)* | 62.0 | - | - | - | 40.5 | 38.9 |
| Qwen2.5-VL (3B) | 61.5 | - | - | - | 37.4 | - |
| video-SALMONN 2+ (3B)* | 68.3 | 48.3 | 66.2 | 42.2 | 67.7 | 50.5 |
| **video-SALMONN 2 Pro (4B)*** | **75.4** | **54.3** | **77.2** | **50.1** | **78.9** | **55.6** |

El modelo de 4B supera a todos los modelos de su rango de tamaño en todos los benchmarks reportados, con una ventaja notable sobre video-SALMONN 2+ (3B) de aproximadamente 7 puntos en Video-MME y 11 puntos en DailyOmni.

## Requisitos de hardware

- VRAM estimada para inferencia: con 5,36B parámetros en FP16, se necesitan aproximadamente 11 GB de VRAM solo para los pesos. Con cuantización a 8 bits (~5,4 GB) o 4 bits (~2,7 GB) se reduce significativamente, aunque no se han publicado cuantizaciones oficiales.
- GPU recomendadas: una GPU con al menos 12 GB de VRAM (RTX 3060, RTX 4070, etc.) para FP16; con cuantización 4 bits podría caber en GPUs de 6-8 GB (RTX 3060, RTX 4060).
- El modelo cabe en GPUs de consumo, especialmente con cuantización.
- Opciones de despliegue: el repositorio incluye scripts de inferencia (`scripts/inference.py`) y un servidor compatible con OpenAI mediante vLLM (`scripts/serve.py`). También es compatible con Transformers y PyTorch.
- Latencia y throughput: no se han publicado datos específicos. Para un modelo de 5,36B, se espera una latencia de decodificación de aproximadamente 20-40 ms por token en una GPU moderna (RTX 4090 o A100), dependiendo de la longitud de entrada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Video-MME | Licencia | Disponibilidad |
| --- | ---: | ---: | ---: | --- | --- |
| video-SALMONN 2 Pro (4B) | 5,36B | no disponible | 75.4 | Apache 2.0 | HuggingFace |
| Qwen2.5-Omni (3B) | 3B | no disponible | 62.0 | Apache 2.0 | HuggingFace |
| Qwen2.5-VL (3B) | 3B | no disponible | 61.5 | Apache 2.0 | HuggingFace |
| video-SALMONN 2+ (3B) | 3B | no disponible | 68.3 | Apache 2.0 | HuggingFace |

El modelo de 4B ofrece un rendimiento claramente superior a los modelos de 3B de la competencia, con una ventaja de más de 7 puntos en Video-MME. Su licencia Apache 2.0 permite uso comercial sin restricciones.

## Limitaciones y advertencias

- No se dispone de información sobre sesgos específicos del modelo. Al estar entrenado sobre datos audiovisuales, puede heredar sesgos presentes en los datos de entrenamiento (por ejemplo, estereotipos de género o raza en las descripciones).
- Riesgo de alucinación: como todo LLM, puede generar descripciones o respuestas inventadas cuando el contenido del vídeo es ambiguo o de baja calidad.
- Limitaciones de contexto: no se ha publicado la longitud de contexto, por lo que vídeos muy largos pueden exceder la ventana de procesamiento. El script de inferencia permite ajustar el número de frames (`--video-min-frames`, `--video-max-frames`), lo que sugiere que hay un límite práctico.
- Dependencia de la calidad del audio: si la pista de audio tiene ruido o está mal sincronizada, el rendimiento puede degradarse.
- No se menciona soporte para tool calling ni funciones de agente, por lo que no es adecuado para tareas que requieran interacción con herramientas externas.
- Aunque la licencia es Apache 2.0, el modelo se basa en Qwen3-VL, que también es Apache 2.0, por lo que no hay restricciones de uso comercial conocidas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tsinghua-ee/video-SALMONN-2-Pro-4B
- Paper (arXiv): https://arxiv.org/abs/2506.15220
- Repositorio GitHub: https://github.com/bytedance/video-SALMONN-2
- Modelo video-SALMONN 2 (base): https://huggingface.co/tsinghua-ee/video-SALMONN-2
