# storyteller-platform/citrinet512-en

## Resumen

Citrinet 512 English es un modelo de reconocimiento automático del habla (ASR) en inglés, originalmente entrenado por NVIDIA y publicado en su catálogo NGC como `stt_en_citrinet_512_gamma_0_25`. El repositorio analizado, `storyteller-platform/citrinet512-en`, no es un entrenamiento nuevo: es un espejo de la versión `2.0.0` del registro de modelos de Storyteller, que empaqueta los pesos en dos formatos (ONNX y MLX) junto con la configuración, el vocabulario y el tokenizador SentencePiece.

El modelo emplea la arquitectura Citrinet, una variante de red convolucional (no transformer) diseñada por NVIDIA para transcripción de voz con un compromiso razonable entre precisión y coste computacional. El sufijo "512" hace referencia al número de canales del modelo y "gamma_0_25" al factor de compresión temporal aplicado en el entrenamiento. Está pensado para ejecutarse en entornos de inferencia ligeros, incluidos dispositivos Apple Silicon mediante MLX.

Su relevancia actual es práctica: ofrece una vía lista para usar para transcribir audio en inglés dentro de la plataforma Storyteller (aplicación de sincronización de audiolibros y subtítulos), con licencia CC-BY-4.0 que permite uso comercial con atribución. No obstante, la información pública disponible sobre el modelo es muy limitada: el repositorio no documenta benchmarks propios ni detalles exhaustivos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Citrinet (red neuronal convolucional para ASR, familia NeMo) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio; ventana de entrada no documentada en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible (se distribuyen pesos ONNX y safetensors sin cuantizar documentada) |
| Idiomas soportados | inglés (según el nombre del modelo y su origen NVIDIA; no se detalla en la model card) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors (MLX) y ONNX (`model.onnx`) |

## Arquitectura y entrenamiento

Citrinet es una arquitectura convolucional para reconocimiento de voz desarrollada por NVIDIA dentro del ecosistema NeMo. A diferencia de los modelos transformer encoder-decoder, Citrinet apila bloques convolucionales con conexiones residuales y aplica una reducción progresiva de la resolución temporal mediante strides, lo que permite procesar audio de forma eficiente sin mecanismos de atención. El modelo incluye un front-end mel (filtro mel y ventana) que en la exportación ONNX se ha integrado delante del encoder, de modo que la entrada es la señal pre-enfatizada y con padding reflectivo, y el propio grafo calcula las características y su longitud.

El repositorio no aporta datos sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o ajuste fino supervisado más allá del entrenamiento original de NVIDIA. La model card indica únicamente que los pesos proceden del export ONNX de OpenVoiceOS (`stt_en_citrinet_512_gamma_0_25_onnx`, revisión `40e6163983a4`) y que el tokenizador es el SentencePiece de `neongeckocom/stt_en_citrinet_512_gamma_0_25`. La conversión a MLX y la exportación ONNX con front-end integrado se realizaron con los scripts `convert.py` y `export-onnx.py` del repositorio de Storyteller.

## Capacidades

- Reconocimiento automático del habla (ASR) en inglés: transcripción de audio a texto.
- Salida con marcas de tiempo a nivel de token o palabra (propio de la familia Citrinet/NeMo; no confirmado explícitamente en la model card).
- Ejecución en dos formatos: ONNX (para inferencia en CPU/GPU con runtime ONNX) y MLX (para Apple Silicon).
- Front-end mel integrado en el grafo ONNX, lo que simplifica el preprocesado.
- Tokenización SentencePiece para la decodificación.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio más allá de la transcripción.
- No se documenta soporte multilingüe: el modelo está etiquetado como inglés.

## Casos de uso

- Transcripción de audiolibros y sincronización de subtítulos: Storyteller usa este modelo para alinear texto y audio en su flujo de producción de audiolibros; su naturaleza convolucional y su tamaño contenido lo hacen adecuado para procesar horas de audio en local.
- Generación automática de subtítulos en inglés: integrado en pipelines de vídeo o podcast, el modelo convierte pistas de audio en transcripciones con una latencia baja gracias a su arquitectura no autoregresiva.
- Búsqueda y indexación de contenido hablado: transcribir archivos de audio para alimentar motores de búsqueda o sistemas de recuperación de información (RAG sobre audio).
- Asistentes de voz y dictado en inglés: el modelo puede servir como capa ASR en aplicaciones de escritorio o móviles que requieran inferencia local sin conexión.
- Análisis de llamadas y reuniones: transcripción de conversaciones para resúmenes, análisis de sentimiento o cumplimiento normativo, ejecutándose en servidores con CPU o GPU modestas.
- Prototipado e investigación en ASR: al estar disponible en ONNX y MLX, es útil como línea base para experimentos de reconocimiento de voz y para comparar con modelos transformer más pesados.
- Aplicaciones en Apple Silicon: la versión MLX permite desplegar transcripción en Macs sin GPU dedicada, aprovechando la GPU integrada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 0,3 GB, lo que sugiere que el modelo es pequeño y cabe en memoria de GPU de gama baja, pero no se especifica el consumo exacto.
- GPU recomendadas: no disponible. Por su naturaleza convolucional y tamaño reducido, es probable que funcione en GPUs consumer, pero no hay datos oficiales en la información proporcionada.
- ¿Cabe en GPU consumer? No confirmado, aunque el tamaño del repositorio (0,3 GB) apunta a que sí en la mayoría de GPUs modernas.
- Opciones de despliegue: ONNX Runtime (formato `model.onnx`), MLX (formato `model.safetensors`), y potencialmente NeMo si se reutilizan los pesos originales de NVIDIA.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Citrinet 512 English (este) | CNN (Citrinet) | no disponible | no disponible | CC-BY-4.0 | Hugging Face (espejo Storyteller) |
| NVIDIA stt_en_citrinet_512_gamma_0_25 | CNN (Citrinet) | no disponible | no disponible | CC-BY-4.0 | NGC / Hugging Face (OpenVoiceOS) |
| Whisper (OpenAI) | Transformer encoder-decoder | 39M–1.5B según variante | 30 s de audio | MIT | Hugging Face, múltiples runtimes |
| Wav2Vec 2.0 (Meta) | Transformer convolucional | 95M–317M | no disponible | MIT / CC-BY-NC según variante | Hugging Face |

La comparación cuantitativa de rendimiento no está disponible en la información proporcionada. Citrinet se distingue por ser convolucional y ligero, frente a Whisper (transformer) y Wav2Vec 2.0 (transformer convolucional), pero no se aportan métricas de WER ni de velocidad.

## Limitaciones y advertencias

- Solo inglés: el modelo está entrenado y etiquetado para inglés; no se documenta soporte de otros idiomas.
- Sesgos: no se documentan sesgos conocidos, pero al ser un modelo ASR entrenado por NVIDIA, puede heredar sesgos de acento, género o dialecto presentes en sus datos de entrenamiento (no especificados).
- Riesgo de alucinación: en ASR, el riesgo se traduce en transcripciones incorrectas o palabras inventadas en audio ruidoso o con acentos no representados.
- Licencia CC-BY-4.0: permite uso comercial con atribución a NVIDIA y a los autores del espejo; es necesario conservar los avisos de licencia.
- El repositorio es un espejo de un registro interno de Storyteller; no hay garantía de mantenimiento ni de soporte por parte de Storyteller Platform.
- La model card no documenta el pipeline de Hugging Face, los idiomas ni los parámetros del modelo, lo que dificulta su integración automática en herramientas que dependen de esos metadatos.
- No se especifican requisitos de hardware ni latencias, por lo que la planificación de producción requiere pruebas propias.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/storyteller-platform/citrinet512-en
- Modelo original NVIDIA en NGC: https://catalog.ngc.nvidia.com/orgs/nvidia/models/stt_en_citrinet_512_gamma_0_25
- Export ONNX de OpenVoiceOS: https://huggingface.co/OpenVoiceOS/stt_en_citrinet_512_gamma_0_25_onnx
- Tokenizador SentencePiece: https://huggingface.co/neongeckocom/stt_en_citrinet_512_gamma_0_25
- Scripts de conversión (Storyteller): https://gitlab.com/storyteller-platform/storyteller/-/tree/main/libraries/mlx-audio/scripts
- Registro de modelos de Storyteller: https://gitlab.com/storyteller-platform/storyteller/-/ml/models/citrinet512-en
