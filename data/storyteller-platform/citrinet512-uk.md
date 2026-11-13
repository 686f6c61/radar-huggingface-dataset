# storyteller-platform/citrinet512-uk

## Resumen

Citrinet 512 Ukrainian es un modelo de reconocimiento automático del habla (ASR) para ucraniano, derivado del modelo original `neongeckocom/stt_uk_citrinet_512_gamma_0_25` entrenado por NeMo (NVIDIA). La versión publicada por `storyteller-platform` no es un reentrenamiento, sino una conversión de formato: toma la exportación ONNX de OpenVoiceOS y genera artefactos adicionales (pesos en safetensors con el layout que espera el cargador de MLX, un ONNX con el front-end mel integrado y los ficheros de configuración, vocabulario y tokenizer) para integrarlos en el registro de modelos de Storyteller.

El modelo emplea la arquitectura Citrinet, una red convolucional de tipo CTC con bloques residuales y squeeze-and-excitation, diseñada para ASR eficiente en dispositivos. El sufijo `512` indica el número de canales del modelo, y `gamma_0_25` hace referencia a un factor de compresión aplicado en el entrenamiento original. El objetivo de esta ficha es evaluar el modelo para transcripción de audio en ucraniano dentro de pipelines de producción, no como modelo generativo de texto.

La relevancia actual es acotada pero concreta: ofrece una alternativa ligera y con licencia permisiva (BSD-3-Clause) para ASR en ucraniano, un idioma con cobertura limitada en modelos ASR abiertos. Su utilidad principal es la integración en aplicaciones de subtitulado o transcripción mediante los formatos ONNX y MLX que proporciona el repositorio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Citrinet (CNN con CTC, bloques residuales y squeeze-and-excitation) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR; ventana de audio no especificada) |
| Tipos de cuantización | no disponible (se distribuyen pesos sin cuantizar en safetensors y ONNX) |
| Idiomas soportados | ucraniano (según nombre del modelo y origen del entrenamiento) |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors (layout MLX), ONNX, config.json, vocab.txt, tokenizer.spm |

## Arquitectura y entrenamiento

Citrinet es una arquitectura convolucional 1D pensada para ASR que combina convoluciones con stride, bloques residuales y módulos de squeeze-and-excitation, y que se entrena con pérdida CTC sobre espectrogramas mel. El modelo original `stt_uk_citrinet_512_gamma_0_25` fue entrenado por NeMo con 512 canales y un factor gamma de 0,25, orientado a un equilibrio entre precisión y coste computacional. No se dispone en la información proporcionada del número de horas de audio de entrenamiento, la composición del dataset ni si se aplicaron técnicas de aumento de datos o regularización específicas.

La conversión realizada por `storyteller-platform` no modifica el encoder. El fichero `model.onnx` incorpora el front-end mel delante del encoder, de modo que acepta la señal pre-énfasis con padding reflectivo y calcula internamente las características y su longitud. El fichero `model.safetensors` contiene los pesos del encoder en el layout esperado por MLX, junto con el banco de filtros mel y la ventana del front-end de NeMo. Los scripts de conversión (`convert.py`, `export-onnx.py`) están publicados en el repositorio de Storyteller. No se documentan innovaciones técnicas adicionales más allá de la propia arquitectura Citrinet.

## Capacidades

- Reconocimiento automático del habla en ucraniano a partir de audio.
- Salida CTC con vocabulario definido por `vocab.txt` y tokenizer SentencePiece (`tokenizer.spm`).
- Inferencia en dos formatos: ONNX (con front-end mel integrado, entrada de audio pre-énfasis con padding reflectivo) y safetensors para MLX.
- Cálculo interno de características mel en la variante ONNX, lo que simplifica el preprocesado en producción.
- No soporta generación de texto libre, razonamiento, código ni matemáticas: es un modelo ASR, no un LLM.
- No dispone de tool calling, function calling ni capacidades de agente.
- No se documentan capacidades multilingües más allá del ucraniano.
- No se documentan modos especiales (thinking, visión, audio de entrada más allá del propio ASR).

## Casos de uso

- Subtitulado automático de vídeo en ucraniano: el modelo transcribe pistas de audio y genera subtítulos con marcas temporales a nivel de token CTC, adecuado por su tamaño reducido y su licencia permisiva.
- Transcripción de reuniones y notas de voz: integración en aplicaciones de dictado o actas donde el audio es mayoritariamente ucraniano, usando la variante ONNX con front-end integrado para simplificar el pipeline.
- Indexación y búsqueda de archivos de audio: transcripción por lotes de grabaciones para generar índices de texto buscables, aprovechando el bajo coste de inferencia de una CNN Citrinet.
- Accesibilidad en plataformas de contenido: generación de subtítulos para vídeos educativos o divulgativos en ucraniano, con revisión humana posterior dada la naturaleza probabilística del ASR.
- Procesamiento en dispositivos Apple: la variante safetensors con layout MLX permite ejecutar la transcripción en hardware Apple Silicon dentro de aplicaciones nativas.
- Integración en el ecosistema Storyteller: el repositorio está pensado para que Storyteller instale el modelo mediante `ghost-story`, por lo que encaja en flujos de sincronización de audio y texto de esa plataforma.
- Preprocesado para pipelines de datos: transcripción masiva de audio ucraniano como paso previo a tareas de etiquetado, análisis o moderación de contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; el repositorio completo ocupa 0,3 GB, por lo que la huella de memoria del modelo es reducida y cabe holgadamente en GPUs de consumo.
- GPU recomendadas: no disponibles de forma específica; por tamaño, cualquier GPU consumer reciente (por ejemplo, serie RTX 30/40) debería ser suficiente, aunque no se confirma en la documentación.
- Cabe en GPU consumer: sí, según el tamaño del repositorio (0,3 GB), aunque no se detallan requisitos mínimos.
- Opciones de despliegue: ONNX Runtime para la variante `model.onnx`; MLX para la variante `model.safetensors`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo ASR de este tipo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Licencia | Formatos | Notas |
|---|---|---|---|---|---|
| Citrinet 512 Ukrainian (este) | Citrinet (CNN + CTC) | Ucraniano | BSD-3-Clause | safetensors (MLX), ONNX | Conversión de `neongeckocom/stt_uk_citrinet_512_gamma_0_25` |
| neongeckocom/stt_uk_citrinet_512_gamma_0_25 | Citrinet (CNN + CTC) | Ucraniano | BSD-3-Clause | NeMo | Modelo original del que deriva esta conversión |
| OpenVoiceOS/neongeckocom-stt_uk_citrinet_512_gamma_0_25_onnx | Citrinet (CNN + CTC) | Ucraniano | BSD-3-Clause | ONNX | Exportación ONNX de origen usada para la conversión |
| Whisper (variantes multilingües) | Transformer encoder-decoder | Multilingüe (incluye ucraniano) | MIT (según variante) | safetensors, GGUF, ONNX | Alternativa genérica; no se dispone de comparación cuantitativa en la información proporcionada |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en ASR en ucraniano; no es un modelo de lenguaje y no debe emplearse para generación de texto.
- No se documentan sesgos específicos, pero al ser un modelo entrenado sobre un corpus concreto puede presentar peor rendimiento en variedades dialectales, acentos o audio con ruido.
- Riesgo de errores de transcripción y alucinaciones propias del ASR (inserciones, omisiones y sustituciones), especialmente en audio de baja calidad.
- No se especifican la ventana de audio máxima ni las condiciones de muestreo recomendadas; es necesario consultar la configuración del modelo original de NeMo.
- La licencia BSD-3-Clause permite uso comercial, pero conviene conservar los avisos de copyright y verificar las condiciones del modelo original y de la exportación ONNX de origen.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de uso en producción.
- La fecha de creación indicada (2026-11-13) no es verificable; tratar como dato del repositorio.
- No se documentan limitaciones de contexto ni de idioma más allá de las indicadas.

## Enlaces

- [Hugging Face: storyteller-platform/citrinet512-uk](https://huggingface.co/storyteller-platform/citrinet512-uk)
- [Modelo original: neongeckocom/stt_uk_citrinet_512_gamma_0_25](https://huggingface.co/neongeckocom/stt_uk_citrinet_512_gamma_0_25)
- [Exportación ONNX de origen: OpenVoiceOS/neongeckocom-stt_uk_citrinet_512_gamma_0_25_onnx](https://huggingface.co/OpenVoiceOS/neongeckocom-stt_uk_citrinet_512_gamma_0_25_onnx)
- [Repositorio Storyteller (GitLab)](https://gitlab.com/storyteller-platform/storyteller/-/ml/models/citrinet512-uk)
- [Scripts de conversión (convert.py, export-onnx.py)](https://gitlab.com/storyteller-platform/storyteller/-/tree/main/libraries/mlx-audio/scripts)
