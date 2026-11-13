# storyteller-platform/citrinet512-hy

## Resumen

Citrinet 512 Armenian es un modelo de reconocimiento automático del habla (ASR) para armenio, desarrollado originalmente por anah1tbaghdassarian y empaquetado por storyteller-platform para su uso dentro de la plataforma Storyteller. Se trata de una red Citrinet de 512 canales, una arquitectura convolucional de tipo CTC ampliamente utilizada en la familia NeMo de NVIDIA para tareas de transcripción. El modelo está entrenado sobre el corpus Common Voice 17.0 en armenio y se distribuye en dos formatos: ONNX (con el frontend mel integrado) y safetensors en un layout compatible con MLX.

El repositorio no contiene un modelo generativo de lenguaje, sino un sistema de reconocimiento de voz especializado y de dominio estrecho. Su relevancia radica en que cubre un idioma con poca representación en el ecosistema ASR abierto (armenio), y en que se publica con licencia CC-BY-4.0, lo que permite uso comercial con atribución. El tamaño del repositorio es de 0,3 GB, coherente con un modelo convolucional compacto orientado a inferencia en entornos con recursos limitados.

La información disponible es escasa: no se publican parámetros totales, longitud de contexto, benchmarks ni detalles de entrenamiento más allá del corpus de origen. Esta ficha refleja únicamente los datos verificables en la model card y los metadatos de Hugging Face, indicando explícitamente los campos no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Citrinet (red convolucional con CTC), 512 canales |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR, no generativo) |
| Tipos de cuantización | no disponible (se distribuyen ONNX y safetensors; no se documentan variantes cuantizadas) |
| Idiomas soportados | armenio (hy-AM) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors (layout MLX) y ONNX |

## Arquitectura y entrenamiento

Citrinet es una arquitectura convolucional de reconocimiento de voz que combina convoluciones 1D con conexiones residuales y un cabezal CTC para la transcripción. En esta implementación de 512 canales, el modelo procesa la señal de audio tras un frontend mel de NeMo; el export ONNX incluye dicho frontend integrado, de modo que la entrada es la señal pre-énfasis con padding reflectante y el propio modelo calcula las características mel y su longitud. El repositorio incluye el filtro mel y la ventana del frontend NeMo, además del tokenizador SentencePiece original.

El entrenamiento se realizó sobre el corpus Common Voice 17.0 en armenio, según indica la model card. No se especifican el número de tokens, la composición exacta del dataset, ni si hubo etapas de ajuste fino con RLHF o DPO (no aplicables habitualmente a ASR). Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal. La conversión a los formatos ONNX y MLX la realiza storyteller-platform mediante los scripts `convert.py` y `export-onnx.py`, sin modificar el encoder.

## Capacidades

- Reconocimiento automático del habla en armenio (hy-AM) a partir de audio.
- Transcripción con tokenización SentencePiece propia del checkpoint NeMo original.
- Inferencia en dos formatos: ONNX (con frontend mel integrado) y safetensors para MLX.
- Integración con la plataforma Storyteller mediante el paquete ghost-story.
- No dispone de capacidades de generación de texto, razonamiento, código, matemáticas ni visión.
- No se documenta soporte de tool calling ni de agentes multi-step.
- No se documentan capacidades multilingües más allá del armenio.
- No se documentan modos especiales (thinking mode, audio generativo, etc.).

## Casos de uso

- Transcripción de audio en armenio dentro de la plataforma Storyteller: el modelo se instala vía ghost-story y se usa para convertir narraciones o contenido hablado en texto, aprovechando el formato ONNX con frontend integrado.
- Subtitulado automático de vídeo o pódcast en armenio: al ser un modelo CTC compacto, puede ejecutarse en pipelines de procesamiento por lotes para generar subtítulos con marcas temporales a nivel de token.
- Archivado y búsqueda de contenido oral: transcripción de grabaciones para indexar y permitir búsqueda textual sobre audio en armenio.
- Accesibilidad: generación de transcripciones para personas con discapacidad auditiva en contenido en armenio, con licencia CC-BY-4.0 que permite uso comercial con atribución.
- Investigación en ASR de bajos recursos: el modelo sirve como línea base para experimentos con armenio y como ejemplo de exportación NeMo a ONNX/MLX.
- Despliegue en entornos Apple Silicon: la variante safetensors en layout MLX permite inferencia local en dispositivos con chip de Apple sin GPU dedicada.
- Evaluación comparativa de modelos ASR para armenio: al estar publicado con licencia abierta, puede usarse como referencia en estudios de reconocimiento de voz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio (0,3 GB) sugiere un modelo compacto que probablemente cabe en GPUs de gama media, pero no se confirma en la documentación.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; la variante MLX está pensada para Apple Silicon, no para GPU NVIDIA.
- Opciones de despliegue: ONNX Runtime (formato `model.onnx`) y MLX (formato `model.safetensors`); no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un modelo ASR de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Licencia | Formatos | Notas |
|---|---|---|---|---|---|
| Citrinet 512 Armenian (este) | Citrinet 512, CTC | Armenio | CC-BY-4.0 | ONNX, safetensors (MLX) | Empaquetado por storyteller-platform |
| stt_hy-AM_citrinet_512_armenian-CV17.0 | Citrinet 512, CTC | Armenio | CC-BY-4.0 | NeMo | Checkpoint original de anah1tbaghdassarian |
| OpenVoiceOS/stt_hy-AM_citrinet_512_armenian-CV17.0_onnx | Citrinet 512, CTC | Armenio | no disponible | ONNX | Export ONNX del que deriva este repositorio |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas de otros autores.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en armenio; no soporta otros idiomas.
- No es un modelo generativo: no puede usarse para texto, código, razonamiento ni visión.
- No se publican métricas de precisión (WER, CER) ni benchmarks, por lo que el rendimiento real es desconocido.
- Riesgo de errores de transcripción en audio con ruido, acentos no representados en Common Voice 17.0 o vocabulario fuera del corpus.
- Sesgos potenciales derivados de la composición del corpus Common Voice, que no se documenta en detalle.
- La licencia CC-BY-4.0 permite uso comercial con atribución; es necesario citar a los autores originales y respetar los términos.
- El repositorio no incluye pipeline declarado en Hugging Face, lo que puede dificultar el uso directo con las herramientas estándar de la plataforma.
- La variante safetensors está en un layout específico para MLX, no directamente compatible con cargadores estándar de PyTorch.
- No se documentan cuantizaciones adicionales ni requisitos de hardware verificados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/storyteller-platform/citrinet512-hy
- Checkpoint original: https://huggingface.co/anah1tbaghdassarian/stt_hy-AM_citrinet_512_armenian-CV17.0
- Export ONNX de origen: https://huggingface.co/OpenVoiceOS/stt_hy-AM_citrinet_512_armenian-CV17.0_onnx
- Repositorio GitLab de Storyteller (modelo): https://gitlab.com/storyteller-platform/storyteller/-/ml/models/citrinet512-hy
- Scripts de conversión: https://gitlab.com/storyteller-platform/storyteller/-/tree/main/libraries/mlx-audio/scripts
