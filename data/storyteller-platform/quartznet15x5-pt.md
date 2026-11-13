# storyteller-platform/quartznet15x5-pt

## Resumen

QuartzNet 15x5 Portuguese es un modelo de reconocimiento automático del habla (ASR) basado en la arquitectura QuartzNet con configuración de bloques 15x5, desarrollado originalmente por dominguesm y distribuido por storyteller-platform a través de su registro de modelos. El modelo está especializado en transcripción de audio en portugués y se integra en la plataforma Storyteller mediante la herramienta ghost-story. Esta ficha documenta la versión 2.0.0 del modelo, alojada en Hugging Face con un tamaño de repositorio de 0,2 GB.

La relevancia de esta publicación radica en su empaquetado multi-formato: incluye pesos en safetensors para el cargador de MLX (orientado a Apple Silicon), así como grafos ONNX en precisión simple y media (fp16) que incorporan el front-end mel completo dentro del propio grafo. Esta decisión de diseño permite ejecutar el modelo en cualquier proveedor de ejecución de onnxruntime sin necesidad de un extractor de características externo, lo que simplifica el despliegue en producción.

El modelo se deriva del checkpoint original `dominguesm/stt_pt_quartznet15x5_ctc_small`, convertido desde la exportación ONNX de OpenVoiceOS. La licencia es CC-BY-4.0, lo que permite uso comercial con atribución. No se dispone de información sobre el pipeline declarado ni sobre los idiomas en los metadatos de Hugging Face, aunque por su nombre y procedencia está orientado al portugués.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | QuartzNet 15x5 (CNN con bloques residuales y convoluciones separables en profundidad), CTC |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR, opera sobre ventanas de audio) |
| Tipos de cuantizacion | fp32 (ONNX), fp16 (ONNX), safetensors (MLX) |
| Idiomas soportados | portugues (inferido del nombre y del modelo original; no declarado en metadatos) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors (MLX), ONNX (fp32 y fp16) |

## Arquitectura y entrenamiento

QuartzNet es una arquitectura convolucional para ASR que emplea bloques residuales compuestos por convoluciones separables en profundidad (depthwise separable convolutions), una técnica que reduce el número de parámetros respecto a convoluciones estándar manteniendo capacidad representacional. La configuración 15x5 indica 15 bloques repetidos con 5 subcapas cada uno. El modelo usa CTC (Connectionist Temporal Classification) como función de pérdida y decodificación, lo que evita la necesidad de alineamientos forzados entre audio y transcripción.

El modelo incluido en este repositorio es una conversión del checkpoint original entrenado por dominguesm. La conversión, realizada mediante los scripts `convert.py` y `export-onnx.py` del proyecto Storyteller, reorganiza los pesos al formato que espera el cargador MLX e integra el front-end mel (transformada de Fourier de tiempo corto implementada como convolución, proyección mel, logaritmo y normalización por característica) dentro del grafo ONNX. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o ajuste fino supervisado adicional.

## Capacidades

- Reconocimiento automático del habla (ASR) en portugués mediante decodificación CTC.
- Transcripción de audio a texto a partir de señal pre-enfatizada y con padding reflectivo (el grafo ONNX incluye el front-end mel, por lo que acepta señal de audio directamente).
- Ejecución en múltiples proveedores de onnxruntime sin extractor de características externo.
- Ejecución en Apple Silicon mediante MLX con los pesos en safetensors.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multimodales.
- No se documentan capacidades multilingües más allá del portugués.

## Casos de uso

- Transcripción de audiolibros y contenido editorial: la plataforma Storyteller está orientada a la sincronización de texto y audio en libros, y este modelo proporciona la transcripción base en portugués para alinear capítulos con su texto.
- Subtitulado automático de vídeo en portugués: el modelo genera transcripciones con marcas temporales CTC que pueden post-procesarse para producir subtítulos SRT.
- Integración en asistentes de voz locales: al ejecutarse vía ONNX Runtime o MLX, puede desplegarse en dispositivos sin conexión a servicios en la nube.
- Pipeline de accesibilidad: conversión de contenido hablado en portugués a texto para lectores de pantalla o documentos accesibles.
- Preprocesado para sistemas de búsqueda sobre audio: transcripción de archivos de audio para indexación y búsqueda textual posterior.
- Despliegue en Apple Silicon para prototipado: los pesos safetensors permiten cargar el modelo con MLX en equipos Mac para pruebas rápidas de transcripción sin infraestructura GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; el repositorio completo ocupa 0,2 GB, por lo que el modelo es muy ligero y cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con soporte ONNX Runtime (CUDA, DirectML, CoreML); para MLX se requiere Apple Silicon (M1 o posterior).
- Cabe en GPU consumer: sí, con amplio margen; el tamaño del repo (0,2 GB) sugiere un modelo de pocos millones de parámetros.
- Opciones de despliegue: ONNX Runtime (todos los execution providers), MLX en Apple Silicon; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo ASR convolucional).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| QuartzNet 15x5 PT (este) | QuartzNet 15x5, CTC | no disponible | no disponible | CC-BY-4.0 | Hugging Face, GitLab |
| dominguesm/stt_pt_quartznet15x5_ctc_small | QuartzNet 15x5, CTC | no disponible | no disponible | CC-BY-4.0 | Hugging Face |
| OpenVoiceOS/dominguesm-stt_pt_quartznet15x5_ctc_small_onnx | QuartzNet 15x5, CTC (ONNX) | no disponible | no disponible | no disponible | Hugging Face |

Los tres modelos comparten arquitectura y procedencia; la diferencia principal es el empaquetado (este repositorio añade safetensors para MLX y un grafo ONNX con front-end integrado). No se dispone de datos de benchmarks para comparar rendimiento.

## Limitaciones y advertencias

- El modelo está especializado en portugués; no se declaran otros idiomas en los metadatos.
- No se han publicado métricas de precisión (WER, CER) en la información disponible, por lo que el rendimiento real es desconocido.
- Al ser un modelo CTC convolucional, la calidad puede degradarse con audio ruidoso, acentos no representados en el entrenamiento o dominios muy alejados del corpus original.
- Riesgo de alucinación en ASR: las decodificaciones CTC pueden producir transcripciones plausibles pero incorrectas en segmentos de baja calidad acústica.
- La licencia CC-BY-4.0 permite uso comercial pero exige atribución al autor original (dominguesm) y a los intermediarios de la conversión.
- El modelo se distribuye como espejo de una versión concreta (2.0.0) del registro de Storyteller; cambios en el repositorio original pueden no reflejarse aquí.
- No se documenta el pipeline en Hugging Face, lo que puede dificultar la carga automática con `transformers`.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/storyteller-platform/quartznet15x5-pt
- Modelo original: https://huggingface.co/dominguesm/stt_pt_quartznet15x5_ctc_small
- Exportación ONNX original: https://huggingface.co/OpenVoiceOS/dominguesm-stt_pt_quartznet15x5_ctc_small_onnx
- Registro de modelos Storyteller (GitLab): https://gitlab.com/storyteller-platform/storyteller/-/ml/models/quartznet15x5-pt
- Scripts de conversión: https://gitlab.com/storyteller-platform/storyteller/-/tree/main/libraries/mlx-audio/scripts
