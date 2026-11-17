# taobao-mnn/LFM3-VL-2B-MNN

## Resumen

LFM3-VL-2B-MNN es una conversión al formato MNN del modelo multimodal LiquidAI/LFM3-VL-2B, publicado por el perfil taobao-mnn, vinculado al equipo de MNN de Alibaba. No se trata de un modelo entrenado desde cero, sino de una redistribución optimizada para inferencia local que toma los pesos del modelo original de LiquidAI y los transforma en un grafo MNN con cuantización mixta: INT4 HQQ para el backbone de lenguaje, la cabeza de salida y los embeddings de tokens, e INT8 para el codificador visual. El resultado ocupa aproximadamente 1,2 GB en el repositorio, lo que lo sitúa en el rango de despliegue en dispositivos de consumo.

El modelo resuelve el problema de ejecutar un modelo visión-lenguaje de 2B parámetros en hardware modesto sin depender de CUDA ni de frameworks de servidor. MNN es un motor de inferencia de Alibaba pensado para CPU y aceleradores móviles, con backend Metal en Apple Silicon, y esta conversión permite alimentar imágenes, fotogramas de vídeo y texto para generar texto. La relevancia inmediata es la disponibilidad de un VLM compacto y cuantizado que cabe en portátiles y dispositivos Apple, con una ruta de ejecución reproducible mediante el binario `llm_demo` compilado desde una revisión concreta del repositorio MNN.

La ficha se basa exclusivamente en la model card del autor y en los metadatos de Hugging Face. La información sobre arquitectura interna, datos de entrenamiento, benchmarks y idiomas del modelo original no está incluida en los datos proporcionados, por lo que se indica como no disponible en cada caso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LiquidAI/LFM3-VL-2B; probablemente transformer con codificador visual, sin detalle en la informacion) |
| Parametros totales | aproximadamente 2B (según el nombre del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | HQQ INT4 (grupo 64, escalas FP16) en backbone de lenguaje, cabeza de salida y embeddings; INT8 en codificador visual |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | MNN (grafo y pesos externos, configuración JSON, tokenizador) |
| Tamano del repositorio | 1,2 GB |
| Modalidades de entrada | imagen, fotogramas de vídeo, texto (y audio según la model card) |
| Modalidades de salida | texto |
| Libreria / framework | MNN |
| Revision upstream | 23387beda43c60310348e83e25f78f33c3140d3a |
| Commit MNN requerido | 5085d56221b939b8fd5e52885d2a4f295c6bbcc6 |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base LiquidAI/LFM3-VL-2B en los datos proporcionados. La model card de esta conversión solo describe el proceso de transformación: los pesos del backbone de lenguaje, la cabeza de salida y los embeddings de tokens compartidos se cuantizan con HQQ INT4 en grupos de 64 con escalas FP16, mientras que el codificador visual se cuantiza a INT8. Esta mezcla de precisiones busca reducir el peso en memoria del componente dominante (el transformer de lenguaje) preservando la calidad del procesamiento visual.

El entrenamiento original, la composición del dataset, el número de tokens, el uso de RLHF o DPO y cualquier innovación técnica del modelo de LiquidAI no están documentados en la información disponible. La conversión tampoco incluye detalles sobre destilación, decodificación especulativa ni mecanismos de atención lineal. Los parámetros de muestreo se toman del `generation_config.json` del modelo upstream, incluyendo ajustes de muestreo específicos para audio cuando aplica.

## Capacidades

- Generación de texto condicionada por imágenes: el modelo acepta imágenes y produce respuestas textuales, lo que permite descripción, respuesta a preguntas visuales y análisis de contenido gráfico.
- Procesamiento de fotogramas de vídeo: la model card indica entrada de fotogramas de vídeo mediante `MultimodalPrompt`, aunque las pruebas realizadas usan imágenes estáticas repetidas y solo validan la ruta de entrada.
- Entrada de audio: la model card menciona el uso de `<audio>/path/audio.wav</audio>` en los mensajes y ajustes de muestreo específicos para audio, si bien no se especifica el alcance real de esta capacidad.
- Conversación multimodal multi-turno: el pipeline `image-text-to-text` y el formato de mensajes con etiquetas `<img>` sugieren interacción conversacional con contexto visual.
- Inferencia en CPU y Metal: ejecución mediante el binario `llm_demo` de MNN, con backend CPU por defecto y Metal opcional en Apple Silicon.
- Tool calling, agentes, modo thinking, razonamiento matemático o capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Asistente visual en portátil: ejecutar el modelo con MNN en CPU permite responder preguntas sobre capturas de pantalla o fotografías sin GPU dedicada, gracias a los aproximadamente 1,2 GB del repositorio cuantizado.
- Análisis de imágenes en dispositivos Apple Silicon: activando `backend_type: metal` en `config.json`, se puede desplegar un VLM local en Mac para tareas de descripción y OCR ligero, manteniendo los submodelos de media en CPU.
- Prototipado de pipelines multimodal en entornos sin CUDA: MNN compila en CPU y ofrece una vía reproducible con `llm_demo` para experimentar con entradas de imagen y texto antes de migrar a un servidor.
- Inspección de fotogramas de vídeo: mediante `MultimodalPrompt` se pueden alimentar fotogramas para tareas de descripción o seguimiento de contenido, útil en prototipos de análisis de vídeo en local.
- Aplicaciones de accesibilidad: descripción de imágenes en tiempo real en un portátil o dispositivo Apple para usuarios con discapacidad visual, aprovechando la inferencia local sin enviar datos a la nube.
- Evaluación de cuantización HQQ INT4: el modelo sirve como banco de pruebas para medir la degradación de un VLM de 2B tras cuantizar el backbone a INT4 y el codificador visual a INT8, comparando contra los pesos originales de LiquidAI.
- Despliegue embebido o de borde: el formato MNN y el tamaño reducido facilitan integraciones en entornos con memoria limitada, aunque la model card solo valida macOS Apple Silicon y no ofrece garantías para otras plataformas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card únicamente documenta pruebas de humo (`image-cpu`, `image-metal`, `video-metal`) realizadas en macOS Apple Silicon con un runtime compilado desde el mismo commit de MNN. Estas pruebas verifican que las rutas de entrada funcionan, no el rendimiento en calidad, latencia o throughput, y el propio autor advierte que no constituyen una validación integral de contextos largos, idiomas, dispositivos o tareas de agente.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. El repositorio pesa 1,2 GB, lo que da una cota inferior del espacio de almacenamiento; la memoria de trabajo en inferencia depende del runtime MNN y no se documenta.
- GPU recomendadas: no disponibles. La model card solo menciona CPU por defecto y backend Metal en Apple Silicon; no se citan A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: no confirmado. El tamaño del repositorio sugiere que podría caber en GPUs con 4-6 GB, pero no hay datos de memoria pico ni validación fuera de Apple Silicon.
- Opciones de despliegue: MNN (`llm_demo`) compilado con `-DMNN_BUILD_LLM=ON`, `-DMNN_LOW_MEMORY=ON`, `-DMNN_SUPPORT_TRANSFORMER_FUSE=ON`, `-DMNN_BUILD_AUDIO=ON`, `-DMNN_BUILD_OPENCV=ON` y `-DMNN_IMG_CODECS=ON`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. No se han publicado medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-VL-2B-MNN (este) | ~2B | no disponible | MNN, INT4 HQQ + INT8 vision | LFM Open License v1.0 | Hugging Face, ModelScope |
| LiquidAI/LFM3-VL-2B (upstream) | ~2B | no disponible | pesos originales (formato no detallado) | LFM Open License v1.0 | Hugging Face |
| Alternativas de 2B con vision | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de contexto para establecer una comparación cuantitativa con alternativas de la misma categoría. La única comparación documentada es con el modelo upstream, del que esta versión difiere por la conversión a MNN y la cuantización mixta.

## Limitaciones y advertencias

- Validación limitada: las pruebas de humo se hicieron solo en macOS Apple Silicon; no hay garantías para Linux, Windows, Android, iOS ni GPUs NVIDIA.
- Contexto largo, multilingüismo y tareas de agente no verificados: el autor lo declara explícitamente.
- Vídeo no validado de forma real: las pruebas usan imágenes estáticas repetidas y solo comprueban la ruta de entrada.
- Dependencia de una revisión concreta de MNN: es necesario compilar desde el commit `5085d56221b939b8fd5e52885d2a4f295c6bbcc6` o posterior; las distribuciones antiguas pueden no incluir soporte LFM3.
- Integridad de ficheros: hay que descargar el repositorio completo y mantener grafo, pesos, tokenizador y configuración en la misma revisión.
- Licencia: se aplica la LFM Open License v1.0 del modelo original; es necesario revisar sus términos antes de un uso comercial, ya que Hugging Face la etiqueta como "other".
- Riesgo de alucinación y sesgos: no documentados en la información disponible; al ser una conversión cuantizada, puede heredar o amplificar degradaciones del proceso INT4.
- Idiomas: no se especifican; no se puede confirmar calidad en castellano.
- Sin métricas de rendimiento: no hay datos de latencia, throughput ni calidad que permitan planificar un despliegue en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/taobao-mnn/LFM3-VL-2B-MNN
- Modelo base: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Revisión upstream usada: https://huggingface.co/LiquidAI/LFM3-VL-2B/tree/23387beda43c60310348e83e25f78f33c3140d3a
- Repositorio MNN: https://github.com/alibaba/MNN
- Commit de MNN requerido: https://github.com/alibaba/MNN/commit/5085d56221b939b8fd5e52885d2a4f295c6bbcc6
- Espejo en ModelScope: https://modelscope.cn/models/MNN/LFM3-VL-2B-MNN
- Licencia LFM Open License v1.0: https://huggingface.co/taobao-mnn/LFM3-VL-2B-MNN/blob/main/LICENSE
