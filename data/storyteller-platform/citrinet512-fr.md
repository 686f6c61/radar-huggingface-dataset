# storyteller-platform/citrinet512-fr

## Resumen

Citrinet 512 French es un modelo de reconocimiento automático del habla (ASR) en francés, empaquetado y redistribuido por storyteller-platform dentro de su registro de modelos para la aplicación Storyteller. El modelo original fue entrenado por neongeckocom (Mycroft/Neon) y aquí se publica como un espejo de la versión 2.0.0 del repositorio GitLab de Storyteller, con una carpeta por formato de despliegue (`onnx` y `mlx`).

La arquitectura es Citrinet con 512 canales, una variante de redes convolucionales de tiempo completo (CTC) pensada para ser ligera y rápida en inferencia, derivada del ecosistema NeMo de NVIDIA. El paquete incluye el encoder, el front end de mel-espectrograma, el vocabulario y el tokenizador SentencePiece, de modo que puede ejecutarse de extremo a extremo con ONNX Runtime o con el cargador MLX de Storyteller.

Su relevancia es práctica: ofrece una alternativa de ASR francés de licencia permisiva (BSD-3-Clause) y tamaño reducido, adecuada para transcripción local en dispositivos con recursos limitados. El repositorio ocupa 0,3 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Citrinet (red convolucional CTC), 512 canales |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ASR por ventanas de audio) |
| Tipos de cuantización | no disponible (se distribuyen pesos en safetensors y ONNX) |
| Idiomas soportados | francés (según nombre y modelo de origen) |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors (MLX) y ONNX |
| Tamaño del repositorio | 0,3 GB |
| Front end | Mel-espectrograma con pre-énfasis y reflect padding |
| Tokenizador | SentencePiece (`tokenizer.spm`) |
| Vocabulario | `vocab.txt` (heredado del export original) |

## Arquitectura y entrenamiento

Citrinet es una arquitectura convolucional de reconocimiento de voz que combina convoluciones 1D con conexiones residuales, agrupaciones de canales y una cabeza CTC para alinear audio y texto sin necesidad de decodificación autorregresiva. La variante 512 hace referencia al número de canales del bloque principal. El modelo incorpora un front end de mel-espectrograma que, en la exportación ONNX, se ha fusionado delante del encoder, de forma que la entrada es la señal pre-énfasisada y con reflect padding, y el propio grafo calcula las características y su longitud.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de ajuste fino con RLHF o DPO; estos datos corresponden al modelo original de neongeckocom y no se detallan en la model card. La conversión a MLX reorganiza los pesos del encoder en el layout que espera el cargador de Storyteller e incluye el filtro mel y la ventana del front end de NeMo. Los scripts de conversión (`convert.py`, `export-onnx.py`) están publicados en el repositorio GitLab de Storyteller.

## Capacidades

- Reconocimiento automático del habla en francés a partir de audio.
- Transcripción con alineación CTC, sin generación autorregresiva.
- Ejecución con ONNX Runtime mediante `model.onnx`, que incluye el front end de mel integrado.
- Ejecución con MLX mediante `model.safetensors`, orientada a hardware Apple Silicon.
- Tokenización SentencePiece para la salida de texto.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio generativo ni modo thinking.
- Capacidad multilingüe: no disponible; el paquete está orientado al francés.

## Casos de uso

- Transcripción local de reuniones en francés: el modelo puede procesar audio en dispositivos sin GPU dedicada gracias a su arquitectura convolucional ligera y su exportación ONNX.
- Subtitulado automático de vídeo: la salida CTC con marcas temporales permite generar subtítulos sincronizados en pipelines de postproducción.
- Asistentes de voz embebidos: al ser un modelo de 0,3 GB y licencia BSD-3-Clause, puede integrarse en aplicaciones de escritorio o móviles que requieran reconocimiento en francés sin dependencia de la nube.
- Indexación y búsqueda de archivos de audio: transcripción por lotes de archivos históricos para hacerlos consultables por texto.
- Accesibilidad: generación de transcripciones en directo para personas con discapacidad auditiva en entornos francófonos.
- Preprocesamiento para pipelines de NLP: convertir entrevistas o llamadas en francés a texto para su posterior análisis de sentimiento, extracción de entidades o resumen.
- Aplicaciones de notas de voz: dictado y conversión a texto en herramientas de productividad, aprovechando el cargador MLX en equipos Apple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio (0,3 GB) sugiere un modelo pequeño que probablemente cabe en memoria de CPU y en GPUs de gama baja, pero no se confirma.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; el formato MLX está pensado para Apple Silicon y el formato ONNX puede ejecutarse en CPU o GPU según el proveedor de ejecución.
- Opciones de despliegue: ONNX Runtime (formato `onnx`) y MLX (formato `mlx`) a través de Storyteller; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Citrinet 512 French (este) | Citrinet convolucional CTC | no disponible | no disponible | BSD-3-Clause | Hugging Face (espejo) |
| neongeckocom/stt_fr_citrinet_512_gamma_0_25 | Citrinet convolucional CTC | no disponible | no disponible | BSD-3-Clause | Hugging Face |
| OpenVoiceOS/neongeckocom-stt_fr_citrinet_512_gamma_0_25_onnx | Citrinet convolucional CTC (ONNX) | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Solo se documenta soporte para francés; no hay información sobre otros idiomas.
- No se han publicado métricas de precisión (WER) ni benchmarks, por lo que el rendimiento real es desconocido.
- Riesgo de errores de transcripción en audio con ruido, acentos marcados o vocabulario técnico, inherente a los modelos CTC pequeños.
- La licencia BSD-3-Clause permite uso comercial, pero obliga a conservar el aviso de copyright y la cláusula de exención de responsabilidad.
- El modelo es un espejo de un modelo de terceros (neongeckocom); la responsabilidad sobre el entrenamiento y los datos originales recae en el autor original.
- No se documentan sesgos específicos, pero al ser un modelo entrenado con datos no descritos, pueden existir sesgos de dominio y de acento.
- El repositorio no registra descargas ni validación comunitaria, lo que reduce la evidencia sobre su calidad en producción.
- El formato MLX solo es utilizable en hardware Apple Silicon; para otros entornos debe usarse la exportación ONNX.

## Enlaces

- [Hugging Face: storyteller-platform/citrinet512-fr](https://huggingface.co/storyteller-platform/citrinet512-fr)
- [Modelo original: neongeckocom/stt_fr_citrinet_512_gamma_0_25](https://huggingface.co/neongeckocom/stt_fr_citrinet_512_gamma_0_25)
- [Exportación ONNX: OpenVoiceOS/neongeckocom-stt_fr_citrinet_512_gamma_0_25_onnx](https://huggingface.co/OpenVoiceOS/neongeckocom-stt_fr_citrinet_512_gamma_0_25_onnx)
- [Repositorio GitLab de Storyteller (modelo)](https://gitlab.com/storyteller-platform/storyteller/-/ml/models/citrinet512-fr)
- [Scripts de conversión (libraries/mlx-audio/scripts)](https://gitlab.com/storyteller-platform/storyteller/-/tree/main/libraries/mlx-audio/scripts)
