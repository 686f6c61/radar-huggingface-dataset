# teamsleeping/parakeet-kyrgyzstan

## Resumen

El modelo `teamsleeping/parakeet-kyrgyzstan` es un sistema de reconocimiento automático del habla (ASR) especializado en idioma kirguís, desarrollado por el equipo Sleeping AI. Se trata de un fine-tuning del modelo base `mlx-community/parakeet-tdt-0.6b-v3`, que a su vez deriva de la arquitectura Parakeet-TDT de NVIDIA, adaptado específicamente para el kirguís mediante el dataset `mozilla-foundation/common_voice_17_0`.

Con aproximadamente 627 millones de parámetros, este modelo está diseñado para abordar el problema de la escasez de recursos ASR para lenguas de bajos recursos como el kirguís. Su relevancia radica en que ofrece una solución de transcripción de voz de alta calidad para una lengua con poca representación en el ecosistema de modelos de IA, bajo una licencia Apache 2.0 que permite uso comercial sin restricciones.

El modelo se distribuye en formato safetensors, compatible con la librería transformers, y está disponible públicamente en HuggingFace. Aunque no se especifica la longitud de contexto en la documentación disponible, al tratarse de un modelo de audio, esta se refiere a la duración máxima de audio procesable por inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Parakeet-TDT (FastConformer) |
| Parametros totales | 627.057.286 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | kirguís (ky) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Parakeet-TDT (Transformer Deliberation with Transducer), desarrollada originalmente por NVIDIA. Esta arquitectura combina un codificador FastConformer con un decodificador basado en transducer y un mecanismo de deliberación que mejora la precisión mediante una segunda pasada de refinamiento. El modelo original de 0.6B parámetros fue entrenado por NVIDIA sobre múltiples idiomas, y la versión de MLX Community proporciona los pesos en formato compatible con el ecosistema MLX.

El fine-tuning realizado por Sleeping AI utiliza el dataset Common Voice 17.0 de Mozilla Foundation, concretamente el subconjunto en kirguís. Según los datos disponibles, el dataset de entrenamiento `teamsleeping/sleeping-kyrgyzstan` contiene 3.180 muestras de audio, lo que representa un volumen moderado de datos para un fine-tuning. No se especifica en la documentación si se emplearon técnicas adicionales como aumentación de datos o entrenamiento por etapas.

## Capacidades

- Transcripción de voz a texto en idioma kirguís con alta precisión.
- Procesamiento de audio en formato digital para extracción de características (feature extraction).
- Reconocimiento del habla con arquitectura transducer optimizada para latencia baja.
- Inferencia compatible con el pipeline de transformers para tareas de audio.
- Modelo especializado en un único idioma, lo que evita interferencias multilingües.
- Soporte para fine-tuning adicional sobre dominios específicos del kirguís.

## Casos de uso

- Transcripción de reuniones y entrevistas en kirguís: el modelo puede convertir grabaciones de audio a texto de forma automática, facilitando la documentación de reuniones en entornos empresariales o periodísticos donde se hable kirguís.
- Generación de subtítulos para contenido audiovisual: creadores de contenido y plataformas de vídeo pueden emplear el modelo para subtitular vídeos en kirguís de manera automática, mejorando la accesibilidad.
- Asistentes de voz locales: integración en aplicaciones móviles o dispositivos embebidos que requieran entender comandos de voz en kirguís, aprovechando su tamaño reducido de 0.6B parámetros.
- Archivado y búsqueda de contenido oral: bibliotecas, universidades o instituciones culturales pueden transcribir archivos históricos orales en kirguís para hacerlos buscables y preservarlos digitalmente.
- Servicios de atención al cliente: empresas que operan en Kirguistán pueden desplegar el modelo para transcribir llamadas de soporte, permitiendo análisis de sentimiento y control de calidad.
- Herramientas educativas para el aprendizaje del kirguís: aplicaciones de aprendizaje de idiomas pueden usar la transcripción para proporcionar retroalimentación sobre pronunciación y comprensión auditiva.
- Traducción audiovisual asistida: combinado con un modelo de traducción, permite subtitular contenido en kirguís a otros idiomas de forma semiautomática.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos sobre WER (Word Error Rate), CER (Character Error Rate) ni comparativas con otros modelos ASR para kirguís.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 627M parámetros, la inferencia en FP16 requiere aproximadamente 1.3 GB de VRAM, y en INT8 alrededor de 0.7 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente para inferencia. Una NVIDIA GTX 1650 o superior puede ejecutar el modelo sin problemas. Para entrenamiento o fine-tuning se recomienda al menos 8 GB de VRAM.
- Compatibilidad con GPU de consumo: sí, cabe en cualquier GPU consumer moderna, incluyendo RTX 3060, RTX 4060, etc.
- Opciones de despliegue: al ser un modelo transformers, puede servirse con librerías como HuggingFace Transformers, vLLM (si se convierte a formato compatible), ONNX Runtime, o mediante la API de HuggingFace Inference Endpoints.
- Latencia y throughput estimados: no disponible. La latencia dependerá del hardware y de la duración de los audios procesados.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| teamsleeping/parakeet-kyrgyzstan | 0.6B | kirguís | no disponible | Apache 2.0 | HuggingFace |
| mlx-community/parakeet-tdt-0.6b-v3 | 0.6B | múltiples | no disponible | Apache 2.0 | HuggingFace |
| NVIDIA Parakeet-TDT-0.6B-v3 | 0.6B | múltiples (incluye kirguís) | no disponible | Apache 2.0 | HuggingFace / NVIDIA |
| OpenAI Whisper small | 244M | 96 idiomas | 30 segundos de audio | MIT | HuggingFace / OpenAI |

El modelo se diferencia de Whisper small por estar especializado exclusivamente en kirguís, lo que potencialmente ofrece mejor precisión en esta lengua que un modelo multilingüe genérico. Frente al modelo base de NVIDIA, la ventaja es que ya viene ajustado para kirguís, evitando al usuario realizar el fine-tuning.

## Limitaciones y advertencias

- El dataset de entrenamiento es reducido (3.180 muestras), lo que puede limitar la generalización a acentos, dialectos o condiciones acústicas muy diferentes a las del conjunto de entrenamiento.
- No se especifica la duración máxima de audio procesable, por lo que audios muy largos podrían requerir segmentación previa.
- Al estar especializado únicamente en kirguís, no es útil para otros idiomas sin un nuevo fine-tuning.
- No se han publicado métricas de rendimiento (WER, CER), por lo que es difícil evaluar objetivamente su calidad frente a alternativas.
- El modelo no soporta otras modalidades como visión o generación de texto; es exclusivamente un sistema de reconocimiento de voz.
- Aunque la licencia Apache 2.0 permite uso comercial, es recomendable verificar la procedencia de los datos de entrenamiento (Common Voice 17.0) para asegurar el cumplimiento de sus términos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/teamsleeping/parakeet-kyrgyzstan
- Dataset de entrenamiento: https://huggingface.co/datasets/teamsleeping/sleeping-kyrgyzstan
- Perfil del autor: https://huggingface.co/teamsleeping/models
- Modelo base MLX: https://huggingface.co/mlx-community/parakeet-tdt-0.6b-v3
- Dataset Common Voice 17.0: https://huggingface.co/datasets/mozilla-foundation/common_voice_17_0
