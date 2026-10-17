# stopamertime/pitchscape-models

## Resumen

Pitchscape's models es un repositorio de HuggingFace publicado por el usuario stopamertime que reúne los modelos ONNX que ejecuta la aplicación Pitchscape, tanto en el navegador (ONNX Runtime Web sobre WebGPU) como en su servidor. No es un modelo único ni un modelo de lenguaje: es una colección de 14 ficheros ONNX que cubren detección de actividad de voz, reconocimiento automático de habla, alineación forzada, separación de fuentes musicales, transcripción automática de batería, estimación de tono y transcripción polifónica de notas.

El autor no entrena ningún modelo: copia o exporta pesos de terceros (Silero VAD v6, OpenAI Whisper medium, Demucs htdemucs_6s de Meta AI, ADTOF, CREPE, Basic Pitch de Spotify, wav2vec 2.0 y el alineador MMS) y los convierte a ONNX con sus propias herramientas (`tools/export_models.py`, `tools/export_whisper.py`, `tools/export_align.py`). Cada fichero conserva la licencia de su autor original, con dos componentes restringidos a uso no comercial.

Su relevancia es práctica: empaqueta en un único formato portable una cadena completa de procesamiento de audio lista para inferencia en el navegador, algo poco habitual. El repositorio ocupa 12,2 GB (la suma de los ficheros listados es de aproximadamente 7,25 GB), no declara licencia propia, no documenta idiomas ni parámetros por fichero y no tiene descargas ni likes en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Colección heterogénea de 14 ficheros ONNX: red recurrente (VAD de Silero), transformer encoder-decoder (Whisper medium), Hybrid Transformer Demucs (htdemucs_6s), red recurrente Frame_RNN (ADTOF), CNN (CREPE, Basic Pitch) y transformer convolucional wav2vec 2.0 / alineador MMS |
| Parámetros totales | no disponible; la model card solo publica el tamaño de cada fichero, no el número de parámetros |
| Parámetros activos | no aplica; ningún componente de la colección es un modelo MoE |
| Longitud de contexto | no disponible; los modelos operan sobre audio, no sobre secuencias de texto, y la model card no documenta ventanas de entrada |
| Tipos de cuantización | exportaciones en float32 (ficheros con sufijo `_f32`) y en float16; no se incluyen variantes int8 ni otros formatos cuantizados |
| Idiomas soportados | no disponible como dato global del repositorio; `align_en` está ajustado a inglés (LibriSpeech 960 h) y `align_mms` deriva del alineador MMS, descrito en su referencia como cobertura de más de 1000 idiomas |
| Licencia | no disponible a nivel de repositorio; cada fichero mantiene la licencia de su autor: MIT (Silero VAD, Whisper medium, Demucs, CREPE, wav2vec 2.0), Apache-2.0 (Basic Pitch), CC BY-NC-SA 4.0 (ADTOF Frame_RNN) y CC BY-NC 4.0 (alineador MMS) |
| Formato de pesos | ONNX (pensado para ONNX Runtime Web con WebGPU y para ONNX Runtime en servidor), más `manifest.json` con tamaño y SHA-256 de cada fichero |

Desglose de ficheros:

| Fichero | Contenido | Tamaño | Licencia |
|---|---|---|---|
| `silero_vad_v6.onnx` | Silero VAD v6, detector de actividad de voz (copia sin cambios del que distribuye faster-whisper 1.2.1) | 1,2 MB | MIT |
| `whisper_medium_encoder_f32.onnx` | Encoder de Whisper medium en float32 | 1430,4 MB | MIT |
| `whisper_medium_decoder_f32.onnx` | Decoder de Whisper medium en float32 | 1625,3 MB | MIT |
| `whisper_medium_encoder.onnx` | Encoder de Whisper medium en float16, incluidas las claves y valores de cross-attention de cada capa del decoder | 715,3 MB | MIT |
| `whisper_medium_decoder.onnx` | Decoder de Whisper medium en float16 | 812,7 MB | MIT |
| `whisper_medium.json` | Tokenizer de Whisper medium y tokens que faster-whisper suprime | 0,8 MB | MIT |
| `htdemucs_6s.onnx` | Demucs htdemucs_6s (6 fuentes), exportado sin STFT ni iSTFT | 114,6 MB | MIT |
| `adtof_frame_rnn.onnx` | ADTOF Frame_RNN para transcripción de batería, con el espectrograma de madmom dentro del grafo | 2,2 MB | CC BY-NC-SA 4.0 |
| `crepe_full.onnx` | CREPE "full" para estimación de tono: entra audio por frames, salen 360 bins de probabilidad | 89,0 MB | MIT |
| `basic_pitch.onnx` | Basic Pitch (transcripción polifónica de notas), fichero que distribuye el paquete basic-pitch 0.4.0 | 0,2 MB | Apache-2.0 |
| `align_en.onnx` | wav2vec 2.0 base ajustado en inglés, en float16 y con log_softmax | 189,0 MB | MIT |
| `align_en_f32.onnx` | Igual que el anterior, en float32 para el proveedor CPU de ONNX Runtime | 377,8 MB | MIT |
| `align_mms.onnx` | Alineador forzado MMS, en float16 y con log_softmax | 631,4 MB | CC BY-NC 4.0 |
| `align_mms_f32.onnx` | Igual que el anterior, en float32 | 1262,3 MB | CC BY-NC 4.0 |

## Arquitectura y entrenamiento

El repositorio no contiene entrenamiento propio. Todos los pesos proceden de proyectos de terceros y se han copiado sin cambios o convertido a ONNX con los scripts del repositorio Pitchscape. Los componentes y sus orígenes son: Silero VAD v6 para detección de voz; OpenAI Whisper medium (Radford et al., 2022) para reconocimiento de habla, con encoder y decoder exportados por separado en float32 y float16; wav2vec 2.0 base (Baevski et al., 2020) ajustado en LibriSpeech 960 h y el alineador forzado MMS (Pratap et al., 2023) para alineación; Demucs htdemucs_6s de Meta AI para separación de fuentes; ADTOF Frame_RNN (Zehren et al., Signals 2023) para transcripción de batería; CREPE "full" (Kim et al., ICASSP 2018) para estimación de tono; y Basic Pitch de Spotify (Bittner et al., ICASSP 2022) para transcripción polifónica de notas.

Hay varios detalles de exportación relevantes para quien vaya a integrarlos. En la versión float16 de Whisper, el fichero del encoder incluye además las claves y valores de cross-attention de cada capa del decoder, de modo que el decoder no necesita recalcularlos. El modelo de Demucs se exportó sin su STFT ni su iSTFT, por lo que el preprocesado y el postprocesado espectral quedan fuera del grafo ONNX. El modelo de ADTOF se copió tal cual desde otra exportación que ya incorpora el espectrograma de madmom dentro del grafo. CREPE recibe frames y devuelve las 360 probabilidades de bin de tono de la red, y los dos alineadores (`align_en`, `align_mms`) se exportaron con `log_softmax` integrado. No se documenta en la model card ningún proceso de RLHF, DPO ni ajuste adicional más allá de los fine-tuning originales de cada proyecto.

## Capacidades

- Detección de actividad de voz: Silero VAD v6 segmenta audio de entrada y funciona como filtro previo del pipeline de transcripción.
- Reconocimiento automático de habla: Whisper medium en ONNX, con encoder y decoder separados, en versiones float32 (para CPU) y float16.
- Tokenización y supresión de tokens para Whisper: `whisper_medium.json` incluye el tokenizer y los tokens que faster-whisper descarta.
- Alineación forzada de audio y transcripción en inglés con wav2vec 2.0 base (LibriSpeech 960 h) y alineación multilingüe con el alineador MMS; ambos con `log_softmax` integrado en el grafo.
- Separación de fuentes musicales en seis pistas con htdemucs_6s, dejando la STFT y la iSTFT fuera del modelo exportado.
- Transcripción automática de batería a partir de audio con el modelo Frame_RNN de ADTOF.
- Estimación de tono por frames con CREPE "full" (360 bins de probabilidad por frame).
- Transcripción polifónica de notas y estimación de multipitch con Basic Pitch.
- Ejecución en navegador mediante ONNX Runtime Web sobre WebGPU, y en servidor con ONNX Runtime (proveedores CPU y GPU).
- No es un modelo de lenguaje: no genera texto libre, no soporta tool calling ni function calling, no implementa agentes, multi-step reasoning, modo de razonamiento, visión ni audio-texto generativo.

## Casos de uso

- Transcripción de voz en el navegador sin backend: combinando `silero_vad_v6.onnx` con el par encoder/decoder de Whisper medium en float16 se puede transcribir audio en cliente con WebGPU, evitando enviar el audio a un servidor.
- Segmentación previa de audio en pipelines de ASR: el VAD de 1,2 MB permite cortar y descartar silencios antes de invocar al modelo grande, reduciendo cómputo y el riesgo de alucinación en tramos sin habla.
- Separación de pistas para práctica musical o remezclas: htdemucs_6s divide la mezcla en seis fuentes, lo que permite silenciar la pista de un instrumento para estudiar o practicar sobre el resto.
- Transcripción de batería a MIDI o partitura: el modelo Frame_RNN de ADTOF convierte una grabación de batería en eventos rítmicos, útil para herramientas de notación o librerías de samples.
- Afinadores y corrección de tono: CREPE "full" devuelve 360 bins de probabilidad por frame, suficiente para seguimiento fino de tono vocal o instrumental en aplicaciones de práctica.
- Conversión de audio polifónico a notas: Basic Pitch, con solo 0,2 MB, permite transcribir notas en un navegador con un coste de recursos mínimo, por ejemplo para bocetos musicales.
- Alineación forzada para subtítulos y karaoke: `align_en` o `align_mms` alinean una transcripción con el audio para generar subtítulos sincronizados o resaltado palabra a palabra.
- Edición y procesado por lotes en servidor: los ficheros `_f32` están pensados para el proveedor CPU de ONNX Runtime, lo que permite montar colas de procesamiento de audio en máquinas sin GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del autor no incluye métricas (WER, SDR, F1 ni similares) para ninguno de los 14 ficheros, y tampoco cifras de latencia o throughput. Las únicas referencias disponibles son las publicaciones originales de cada componente, que no se reproducen aquí.

## Requisitos de hardware

- Tamaño en disco: la suma de los 14 ficheros listados es de aproximadamente 7,25 GB, frente a los 12,2 GB que ocupa el repositorio completo; conviene descargar únicamente los ficheros necesarios.
- Componentes ligeros: VAD (1,2 MB), ADTOF (2,2 MB) y Basic Pitch (0,2 MB) se ejecutan sin problema en CPU o incluso en el navegador; CREPE (89 MB) y Demucs (114,6 MB) son también asumibles en equipos de consumo.
- Ruta de Whisper medium en float16: 715,3 MB (encoder) más 812,7 MB (decoder), alrededor de 1,5 GB de pesos; en ejecución conviene reservar del orden de 2 a 3 GB de VRAM o memoria unificada contando activaciones y buffers.
- Ruta de Whisper medium en float32: 1430,4 MB más 1625,3 MB, unos 3 GB de pesos; en ejecución, del orden de 4 a 5 GB. Estos ficheros están pensados para el proveedor CPU de ONNX Runtime.
- Alineador MMS: 631,4 MB en float16 y 1262,3 MB en float32; el modelo en inglés (`align_en`) ocupa 189,0 MB en float16 y 377,8 MB en float32.
- GPU recomendadas: cualquier GPU con soporte de float16 para las rutas fp16 (RTX 3060, RTX 4090, A100, H100). No se documentan requisitos mínimos ni GPU validadas por el autor.
- Cabe en GPU de consumo: sí, la configuración completa en float16 (Whisper medium más el resto de componentes pequeños) es viable en GPUs de gama media con 6 GB o más de VRAM. La ruta float32 también cabe en GPUs de consumo recientes con 8 GB o más.
- Opciones de despliegue: ONNX Runtime Web con proveedor WebGPU o CPU/WASM en navegador, y ONNX Runtime nativo en servidor. No se documenta ni aplica vLLM, llama.cpp, Ollama ni TGI, orientados a modelos de lenguaje.
- Latencia y throughput: no disponible. La model card no publica mediciones de tiempo de inferencia para ningún fichero.

## Comparativa con modelos similares

| Alternativa | Formato | Qué aporta | Licencia | Disponibilidad |
|---|---|---|---|---|
| stopamertime/pitchscape-models (este repositorio) | ONNX (float32 y float16) más `manifest.json` con SHA-256 | 14 ficheros de audio: VAD, ASR, alineación, separación de fuentes, transcripción de batería, estimación de tono y transcripción de notas, listos para navegador y servidor | Mixta por fichero: MIT, Apache-2.0, CC BY-NC-SA 4.0 y CC BY-NC 4.0 | HuggingFace, 0 descargas y 0 likes en el momento de la consulta |
| openai/whisper-medium | PyTorch | Solo los pesos originales de Whisper medium, sin exportar | MIT | HuggingFace |
| Systran/faster-whisper-medium | CTranslate2 | Whisper medium optimizado para inferencia con faster-whisper, del que este repositorio toma el tokenizer y los tokens suprimidos | MIT | HuggingFace |
| thebluescreen/adtof-drums-onnx | ONNX | Exportación de ADTOF Frame_RNN con el espectrograma de madmom incluido, copiada sin cambios en este repositorio | CC BY-NC-SA 4.0 | HuggingFace |

## Limitaciones y advertencias

- Dos de los catorce ficheros tienen licencia no comercial: `adtof_frame_rnn.onnx` (CC BY-NC-SA 4.0) y `align_mms.onnx` / `align_mms_f32.onnx` (CC BY-NC 4.0). No pueden usarse en productos comerciales, y la licencia CC BY-NC-SA añade obligación de compartir igual.
- El repositorio no declara licencia propia; el autor remite a la licencia de cada fichero. Cualquier uso comercial del conjunto requiere revisar componente por componente.
- No hay benchmarks ni métricas de calidad publicadas, por lo que no es posible comparar su rendimiento con las alternativas originales en PyTorch o CTranslate2.
- El repositorio no tiene descargas ni likes, y no se documenta mantenimiento, versionado ni política de actualizaciones. Las fechas indicadas de creación y actualización son 2026-10-16 y 2026-10-17.
- Whisper medium, como cualquier sistema de ASR, puede alucinar texto en tramos de silencio o ruido; el propio pipeline del repositorio incluye Silero VAD como filtro previo, lo que sugiere que el problema es conocido.
- La alineación de precisión en inglés depende de `align_en`; para el resto de idiomas hay que usar el alineador MMS, que arrastra la restricción de uso no comercial.
- No se ofrecen variantes cuantizadas a int8 ni a otros formatos ligeros: las versiones float32 duplican el tamaño en disco y en memoria respecto a las float16.
- La colección tiene ficheros duplicados por precisión (encoder y decoder de Whisper, y los dos alineadores), lo que aumenta el tamaño del repositorio y obliga a elegir la variante correcta según el proveedor de ejecución.
- No se documentan los parámetros por fichero, los idiomas soportados de forma global ni las ventanas de audio esperadas por cada modelo; hay que deducirlos de los proyectos de origen.
- La estandarización STFT/iSTFT queda fuera del grafo de Demucs y el espectrograma de madmom va dentro del de ADTOF: integrar ambos modelos exige preprocesados distintos.
- Los resultados de la búsqueda web realizada no contienen enlaces relevantes sobre este modelo: son sitios de vídeo sin relación alguna con el repositorio, por lo que no se incluye ninguno.

## Enlaces

- Repositorio del modelo en HuggingFace: https://huggingface.co/stopamertime/pitchscape-models
- Repositorio del proyecto Pitchscape: https://github.com/stop-amertime/pitchscape
- Silero VAD: https://github.com/snakers4/silero-vad
- Pesos originales de OpenAI Whisper medium: https://huggingface.co/openai/whisper-medium
- Origen del tokenizer y de los tokens suprimidos: https://huggingface.co/Systran/faster-whisper-medium
- Demucs (Meta AI): https://github.com/facebookresearch/demucs
- ADTOF: https://github.com/MZehren/ADTOF
- Exportación ONNX de ADTOF reutilizada: https://huggingface.co/thebluescreen/adtof-drums-onnx
- Pesos de CREPE usados por torchcrepe: https://github.com/maxrmorrison/torchcrepe
- Basic Pitch (Spotify): https://github.com/spotify/basic-pitch
- Referencias citadas en la model card sin URL asociada: Radford et al., "Robust Speech Recognition via Large-Scale Weak Supervision" (2022); Zehren, Alunno y Bientinesi, "High-Quality and Reproducible Automatic Drum Transcription from Crowdsourced Data" (Signals, 2023); Kim et al., "CREPE: A Convolutional Representation for Pitch Estimation" (ICASSP 2018); Bittner et al., "A Lightweight Instrument-Agnostic Model for Polyphonic Note Transcription and Multipitch Estimation" (ICASSP 2022); Baevski et al., "wav2vec 2.0" (2020); Pratap et al., "Scaling Speech Technology to 1,000+ Languages" (2023)
