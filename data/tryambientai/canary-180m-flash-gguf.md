# tryambientai/canary-180m-flash-gguf

## Resumen

Canary 180M Flash es un modelo de reconocimiento automatico del habla (ASR) y traduccion de voz desarrollado por NVIDIA, publicado originalmente como `nvidia/canary-180m-flash`. La ficha que nos ocupa corresponde a una conversion a formato GGUF realizada por el usuario `tryambientai` para su uso con el motor de inferencia `transcribe.cpp`, un runtime ligero orientado a CPU y aceleradores alternativos (Metal, Vulkan). El modelo resuelve dos tareas sobre audio: transcripcion multilingue en ingles, aleman, espanol y frances, y traduccion bidireccional entre ingles y cada uno de esos tres idiomas.

Arquitectonicamente es un modelo encoder-decoder de tipo multitask AED, con un encoder FastConformer de 17 capas y un decoder Transformer de 4 capas, sumando 189.083.776 parametros (182M segun la model card original). Su interes practico reside en el tamano: con cuantizacion Q8_0 ocupa 218 MB y mantiene un WER de 1,93% en LibriSpeech test-clean, lo que lo hace viable para transcripcion offline en hardware modesto, incluido un portatil con CPU o un Mac con Metal.

La relevancia de esta conversion concreta es la disponibilidad del modelo fuera del ecosistema NeMo, que requiere GPU NVIDIA y un stack de dependencias pesado. La version GGUF permite ejecutar el mismo modelo con un binario CLI compilado desde fuente, sin CUDA ni PyTorch en tiempo de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder multitask AED; encoder FastConformer (17 capas) + decoder Transformer (4 capas) |
| Parametros totales | 189.083.776 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | en, de, es, fr (ASR); traduccion EN↔DE, EN↔ES, EN↔FR |
| Licencia | CC-BY-4.0 |
| Formato de pesos | GGUF (conversion desde safetensors del modelo base) |

## Arquitectura y entrenamiento

Canary sigue un esquema encoder-decoder con encoder FastConformer, una variante de Conformer optimizada para secuencias de audio largas, y un decoder Transformer autorregresivo. La entrada es audio de 16 kHz mono en formato WAV; el encoder extrae caracteristicas acusticas y el decoder genera texto condicionado por tokens de tarea como `<target language>`, `<task>`, `<toggle timestamps>` y `<toggle PnC>`. El tokenizador es una concatenacion de tokenizadores SentencePiece individuales por idioma, diseno que facilita la extension a nuevos idiomas.

No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron etapas de RLHF o DPO. La model card upstream referencia el paper de Canary (arXiv:2409.13523) como fuente autoritativa para esos detalles. La conversion GGUF se realizo desde el commit `b12ab41` del modelo base, fijado el 2026-05-08, y fue validada contra la referencia NeMo en el commit `db53eda` de transcribe.cpp. La validacion numerica reporta una diferencia de una sustitucion sobre aproximadamente 27.000 palabras de referencia en LibriSpeech test-clean, lo que situa la conversion en el ruido de la implementacion de referencia.

## Capacidades

- Reconocimiento automatico del habla en ingles, aleman, espanol y frances.
- Traduccion de voz bidireccional: EN→DE, EN→ES, EN→FR y DE→EN, ES→EN, FR→EN.
- Generacion de transcripciones con o sin puntuacion y mayusculas (PnC), controlable mediante tokens de tarea.
- Timestamps a nivel de palabra y de segmento: funcionalidad experimental en el modelo upstream, no expuesta en el port v1.
- Procesamiento offline de audio de 16 kHz mono WAV.
- No soporta streaming: la inferencia es por fichero completo.
- No incluye deteccion automatica de idioma (`lang_detect: false`); el idioma de destino debe especificarse.
- No soporta tool calling, function calling ni razonamiento multi-paso; es un modelo puramente acustico-textual.

## Casos de uso

- Transcripcion offline de reuniones y entrevistas: el modelo procesa ficheros WAV completos en local, sin enviar audio a servicios externos, lo que resulta adecuado para entornos con requisitos de privacidad. Con 218 MB en Q8_0 cabe en cualquier portatil.
- Subtitulado de contenido audiovisual multilingue: combinando la transcripcion en el idioma original con la traduccion a ingles, se pueden generar subtitulos para audiencias internacionales en un solo pipeline.
- Traduccion de voz para atencion al cliente: un audio en aleman, espanol o frances puede transcribirse y traducirse a ingles en una sola pasada, util para equipos de soporte que centralizan la gestion en ingles.
- Procesamiento por lotes en servidores sin GPU: con un RTF de 21,73 en CPU (Ryzen 4750U) y 78,91 en CPU de M4 Max, el modelo puede procesar horas de audio en paralelo en maquinas modestas, sin necesidad de CUDA.
- Integracion en aplicaciones de escritorio y moviles: el formato GGUF y el runtime transcribe.cpp permiten embeber el modelo en aplicaciones nativas con aceleracion Metal o Vulkan, sin dependencias de Python.
- Archivado y busqueda de audio historico: transcripcion masiva de grabaciones en cuatro idiomas para indexacion y busqueda textual, aprovechando el bajo coste computacional por hora de audio.
- Generacion de actas y notas en entornos educativos o de investigacion: transcripcion de clases o entrevistas en espanol, frances, aleman o ingles con un modelo de licencia permisiva que permite uso comercial.

## Benchmarks y rendimiento

Datos de WER reportados en la model card de la conversion GGUF:

| Benchmark | F32 | F16 | Q8_0 | Q6_K | Q5_K_M | Q4_K_M |
|---|---:|---:|---:|---:|---:|---:|
| LibriSpeech test-clean (WER %) | 1,94 | 1,94 | 1,93 | 1,93 | 1,90 | 1,93 |

WER por idioma en FLEURS con cuantizacion Q8_0:

| Idioma | WER Q8_0 (%) |
|---|---:|
| Ingles | 5,98 |
| Aleman | 7,33 |
| Espanol | 6,54 |
| Frances | 8,53 |

Rendimiento (RTF, mayor es mejor):

| Plataforma | CPU | Metal | Vulkan |
|---|---:|---:|---:|
| Apple M4 Max | 78,91 | 153,46 | no disponible |
| AMD Ryzen 4750U | 21,73 | no disponible | 33,09 |

Referencia: NVIDIA reporta 1,87% de WER en LibriSpeech test-clean para el modelo upstream. La ejecucion de referencia con NeMo produce 1,93% sobre los mismos audios, y el port F32 obtiene 1,94%, lo que se considera equivalente dentro del ruido.

## Requisitos de hardware

- VRAM estimada: no aplica en el sentido habitual; el modelo esta disenado para inferencia en CPU. En Q8_0 ocupa 218 MB de memoria; en F32, 756 MB.
- GPU recomendadas: no se requieren GPU dedicadas. La aceleracion Metal funciona en Apple Silicon (M4 Max reportado); Vulkan funciona en GPUs integradas AMD (Ryzen 4750U reportado).
- Cabe en cualquier GPU consumer: incluso en F32 (756 MB) entra en GPUs con 2 GB de VRAM, aunque el runtime objetivo es CPU y aceleradores integrados.
- Opciones de despliegue: transcribe.cpp (CLI `transcribe-cli`), compilado desde fuente con CMake. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, ya que el modelo es ASR y no un LLM generativo de texto.
- Latencia y throughput: RTF de 21,73 en CPU Ryzen 4750U (aproximadamente 22 veces mas rapido que tiempo real), 33,09 con Vulkan en el mismo equipo, 78,91 en CPU de M4 Max y 153,46 con Metal. NVIDIA reporta mas de 1200 RTFx en los conjuntos de open-asr-leaderboard con su stack optimizado.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto | Licencia | Formato | Notas |
|---|---:|---|---|---|---|---|
| Canary 180M Flash (esta ficha) | 189M | en, de, es, fr | no disponible | CC-BY-4.0 | GGUF | ASR + traduccion, offline, CPU-friendly |
| Whisper small | 244M | multilingue (~99) | 30 s de audio | MIT | safetensors, GGUF (via whisper.cpp) | ASR multilingue amplio, sin traduccion integrada a varios idiomas |
| Whisper base | 74M | multilingue (~99) | 30 s de audio | MIT | safetensors, GGUF | Menor precision, mayor cobertura de idiomas |
| NVIDIA Canary 1B | ~1B | en, de, es, fr | no disponible | CC-BY-4.0 | safetensors (NeMo) | Mayor precision, requiere stack NeMo y GPU |

La comparacion con Whisper es la mas directa por tamano y disponibilidad en GGUF. Canary 180M Flash ofrece traduccion bidireccional explicita entre cuatro idiomas y un WER muy bajo en LibriSpeech, pero cubre muchos menos idiomas que Whisper. No se dispone de datos de benchmarks comparativos directos entre Canary 180M Flash y Whisper en la informacion proporcionada.

## Limitaciones y advertencias

- Solo cubre cuatro idiomas (en, de, es, fr); no es adecuado para otros idiomas sin fine-tuning.
- No soporta streaming: requiere el fichero de audio completo y no produce resultados incrementales.
- No incluye deteccion automatica de idioma; el usuario debe indicar el idioma de origen o destino.
- Los timestamps a nivel de palabra y segmento son experimentales en el modelo upstream y no estan expuestos en el port v1.
- La entrada debe ser WAV mono a 16 kHz; es necesario preprocesar otros formatos con ffmpeg.
- Riesgo de alucinacion en segmentos con ruido, silencios largos o audio de baja calidad, comun en modelos ASR encoder-decoder.
- Sesgos acusticos y linguisticos heredados del dataset de entrenamiento de NVIDIA, no documentados en la informacion disponible.
- Licencia CC-BY-4.0: permite uso comercial con atribucion. Es necesario citar a NVIDIA y respetar los terminos del modelo base.
- El repositorio de la conversion tiene 0 descargas y 0 likes en el momento de la consulta; es una conversion de terceros, no oficial de NVIDIA. Para produccion conviene validar contra la referencia NeMo.
- La fecha de creacion del repositorio (2026-11-01) y las fechas de commit son posteriores a la fecha actual de referencia; verificar la procedencia antes de desplegar.

## Enlaces

- Repositorio Hugging Face de la conversion: https://huggingface.co/tryambientai/canary-180m-flash-gguf
- Modelo base en Hugging Face: https://huggingface.co/nvidia/canary-180m-flash
- Commit del modelo base referenciado: https://huggingface.co/nvidia/canary-180m-flash/commit/b12ab41
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validacion en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/db53eda
- Pagina del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/canary-180m-flash.md
- Paper de Canary (arXiv:2409.13523): https://arxiv.org/abs/2409.13523
- Paper de FastConformer (arXiv:2104.02821): https://arxiv.org/abs/2104.02821
- Paper de Canary Flash (arXiv:2503.05931): https://arxiv.org/abs/2503.05931
- Paper de Transformer (arXiv:1706.03762): https://arxiv.org/abs/1706.03762
- Repositorio NVIDIA NeMo: https://github.com/NVIDIA/NeMo
