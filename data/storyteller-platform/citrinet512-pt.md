# storyteller-platform/citrinet512-pt

## Resumen

Citrinet 512 Portuguese es un modelo de reconocimiento automatico del habla (ASR) para portugues, publicado por storyteller-platform como espejo en su registro de modelos. No es un modelo de lenguaje generativo: se trata de una red convolucional Citrinet con 512 canales, exportada desde el ecosistema NeMo de NVIDIA, que transcribe audio en portugues a texto. El repositorio empaqueta los pesos en dos formatos (ONNX y MLX/safetensors) junto con la configuracion, el vocabulario y el modelo SentencePiece del front end.

El modelo original fue entrenado por Neongecko (neongeckocom/stt_pt_citrinet_512_gamma_0_25) y convertido por storyteller-platform a partir de la exportacion ONNX de OpenVoiceOS. Su relevancia es practica: proporciona una via de despliegue del mismo modelo en entornos ONNX Runtime y en el stack MLX de Apple Silicon, con el front end mel integrado en el grafo ONNX, lo que simplifica la integracion en pipelines de transcripcion sin dependencias de NeMo.

El repositorio ocupa 0,3 GB y no registra descargas ni likes en el momento de la consulta. La informacion publica disponible es escasa: no se detallan parametros, contexto ni resultados de benchmarks, por lo que muchas especificaciones se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Citrinet (red neuronal convolucional para ASR), 512 canales |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR, no de contexto textual) |
| Tipos de cuantizacion | no disponible (pesos en safetensors y ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | portugues (segun nombre y modelo de origen) |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors (MLX) y ONNX |

## Arquitectura y entrenamiento

Citrinet es una arquitectura convolucional de reconocimiento del habla desarrollada en el ecosistema NeMo de NVIDIA. El modelo emplea 512 canales, segun indica el nombre, y un front end mel-espectrograma. En este repositorio, el export ONNX integra el calculo de caracteristicas mel delante del encoder, de modo que el grafo acepta la senal pre-enfatizada y con padding reflectante y calcula internamente las caracteristicas y su longitud; el encoder no se modifica respecto al original. El fichero `model.safetensors` contiene los pesos del encoder en el formato que espera el cargador de MLX, junto con el banco de filtros mel y la ventana del front end de NeMo.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o ajuste fino adicional. El modelo original fue entrenado por Neongecko y convertido por storyteller-platform a partir de la exportacion ONNX de OpenVoiceOS; el tokenizador SentencePiece se conserva sin cambios respecto a la exportacion original.

## Capacidades

- Transcripcion de voz a texto en portugues.
- Procesamiento de audio con front end mel integrado en el export ONNX.
- Compatibilidad con dos stacks de inferencia: ONNX Runtime (formato `onnx`) y MLX para Apple Silicon (formato `mlx`).
- Uso del vocabulario y tokenizador SentencePiece originales para la decodificacion de salida.
- No se documentan capacidades de generacion de texto, razonamiento, codigo, vision, tool calling ni agentes; al ser un modelo ASR, estas capacidades no aplican.

## Casos de uso

- Transcripcion de audio en portugues en aplicaciones de notas de voz: el modelo convierte grabaciones a texto en local, sin depender de servicios en la nube, gracias al empaquetado ONNX listo para inferencia.
- Subtitulado de video en portugues: integrado en un pipeline que segmenta el audio y pasa cada fragmento al modelo ONNX para generar subtitulos, con el front end mel ya incluido en el grafo.
- Despliegue en macOS con Apple Silicon: el formato MLX permite cargar los pesos safetensors en el stack de MLX, aprovechando la aceleracion nativa del hardware.
- Integracion en el ecosistema Storyteller: el modelo se instala mediante ghost-story desde el registro de modelos, lo que facilita su uso en flujos de transcripcion ya existentes en esa plataforma.
- Reconocimiento de comandos de voz en portugues: la arquitectura convolucional Citrinet es adecuada para transcripcion de utterances cortas en asistentes o interfaces de voz.
- Procesamiento por lotes de archivos de audio en servidores: el export ONNX permite ejecutar la inferencia con ONNX Runtime en CPU o GPU, sin necesidad de instalar NeMo.
- Evaluacion y prototipado de ASR en portugues: al ser un modelo pequeno (0,3 GB de repositorio) y con licencia permisiva, sirve como linea base para comparar con otros sistemas de reconocimiento del habla.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamano del repositorio (0,3 GB) sugiere un modelo ligero que probablemente cabe en GPUs de consumo, pero no se confirma.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; el tamano reducido del repositorio sugiere que podria ejecutarse en GPUs de gama media, pero no hay datos que lo verifiquen.
- Opciones de despliegue: ONNX Runtime (formato `onnx`) y MLX (formato `mlx`, orientado a Apple Silicon). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Licencia | Formatos | Disponibilidad |
|---|---|---|---|---|---|
| Citrinet 512 Portuguese (este) | Citrinet 512 canales | Portugues | BSD-3-Clause | safetensors (MLX), ONNX | Hugging Face (storyteller-platform) |
| neongeckocom/stt_pt_citrinet_512_gamma_0_25 | Citrinet 512 canales | Portugues | BSD-3-Clause | NeMo, ONNX | Hugging Face (neongeckocom) |
| OpenVoiceOS/neongeckocom-stt_pt_citrinet_512_gamma_0_25_onnx | Citrinet 512 canales | Portugues | BSD-3-Clause | ONNX | Hugging Face (OpenVoiceOS) |

Los dos modelos comparables son el origen y la exportacion ONNX intermedia del mismo sistema, por lo que no constituyen alternativas arquitectonicas distintas. No se dispone de informacion sobre otros modelos ASR en portugues para una comparacion mas amplia.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en ASR; no genera texto libre ni razona, por lo que no debe emplearse como modelo de lenguaje.
- Solo se documenta soporte para portugues; no se confirma el rendimiento en otras lenguas ni en audio con acentos o ruido no representados en el entrenamiento.
- No se dispone de informacion sobre sesgos, tasas de error (WER) ni comportamiento en dominios especificos.
- Riesgo de transcripciones incorrectas en audio con ruido, solapamiento de hablantes o vocabulario tecnico; no hay datos publicados que cuantifiquen este riesgo.
- La licencia BSD-3-Clause permite uso comercial con atribucion y sin endoso, pero conviene revisar los terminos del modelo original de Neongecko y de la exportacion de OpenVoiceOS.
- El repositorio no registra descargas ni validacion de la comunidad; la version espejo corresponde a la version 2.0.0 del registro de Storyteller.
- No se documentan requisitos de preprocesado mas alla del front end mel integrado; el uso del formato MLX requiere el stack de MLX y puede no estar disponible fuera de Apple Silicon.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/storyteller-platform/citrinet512-pt
- Modelo original: https://huggingface.co/neongeckocom/stt_pt_citrinet_512_gamma_0_25
- Exportacion ONNX de origen: https://huggingface.co/OpenVoiceOS/neongeckocom-stt_pt_citrinet_512_gamma_0_25_onnx
- Registro de modelos de Storyteller: https://gitlab.com/storyteller-platform/storyteller/-/ml/models/citrinet512-pt
- Scripts de conversion y exportacion: https://gitlab.com/storyteller-platform/storyteller/-/tree/main/libraries/mlx-audio/scripts
