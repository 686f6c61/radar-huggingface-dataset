# suryatmodulus/phonon-2-coreml

## Resumen

phonon-2-coreml es una compilacion en Core ML de FermionResearch/Phonon-2, el reentrenamiento con quantization-aware training (QAT) que Fermion Research hizo sobre nvidia/parakeet-tdt-0.6b-v3 para reconocimiento de voz en ingles. Cada peso del encoder toma uno de cinco valores aprendidos por fila de salida, de modo que el modelo conserva exactamente las tablas cuantizadas del checkpoint original sin anadir ruido de re-cuantizacion. El repositorio lo publica suryatmodulus y se carga desde la libreria FluidAudio mediante `AsrModelVersion.phonon2`.

El modelo resuelve el problema del reconocimiento de voz en dispositivo (on-device) en hardware de Apple, con foco en tamano reducido y baja latencia sobre la Neural Engine (ANE) y la GPU. Mantiene el mismo tokenizer, la misma ventana de 15 segundos y el mismo contrato `Decoder` / `JointDecisionv3` que parakeet-tdt-0.6b-v3-coreml, de modo que es un sustituto directo en pipelines que ya usan esa familia.

La relevancia actual viene de su perfil de rendimiento: con el encoder por defecto (321 MB, mascara sparse + paleta de 6 bits) alcanza 18,6 ms por ventana de 15 s y un RTFx de 159x en LibriSpeech test-clean sobre un M5 Pro, superando en velocidad al propio encoder v3. Incluye cinco variantes de encoder con distintos compromisos de tamano, latencia y precision.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Parakeet TDT (FastConformer encoder + decoder RNNT/TDT), reentrenado con QAT de 5 valores por fila |
| Parametros totales | 0,6 B (heredados de parakeet-tdt-0.6b-v3) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | ventana de 15 s por inferencia de audio (sin contexto de texto) |
| Tipos de cuantizacion | 5 valores aprendidos por fila; paletas sparse de 6, 4 y 2 bits y paletas dense de 6 y 3 bits; decoder y joint en tablas int6/fp16 |
| Idiomas soportados | ingles (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | Core ML (.mlmodelc: Encoder, Decoder, JointDecisionv3, Preprocessor + parakeet_vocab.json) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transductor TDT (Token-and-Duration Transducer) de Parakeet, con un encoder tipo FastConformer de 0,6 B de parametros y un decoder de prediccion RNNT acoplado mediante una red joint de un solo paso con top-64. Phonon-2 es el resultado de reentrenar con quantization-aware training el checkpoint nvidia/parakeet-tdt-0.6b-v3 para ingles, forzando a cada peso del encoder a tomar uno de cinco valores aprendidos por fila. Esta compilacion Core ML preserva esos cinco valores exactos, ya sea como paletas fp16 (`constexpr_lut_to_dense`, iOS 18 / macOS 15) o como mascara de sparsity mas paleta sobre los pesos no nulos (`constexpr_lut_to_sparse` + `constexpr_sparse_to_dense`). Las cinco variantes producen transcripciones identicas entre si.

El decoder y la red joint se reexportan desde las tablas int6 del checkpoint, mientras que el preprocesador y el vocabulario son los de la version v3. La fidelidad de conversion se midio asi: en los primeros 100 archivos de test-clean, las transcripciones Core ML difieren de una decodificacion NeMo fp32 de contexto completo del mismo checkpoint en un 0,34 % de WER (1,83 % frente a 1,79 %). No se detalla en la informacion disponible la composicion exacta del dataset de reentrenamiento ni si hubo fases de RLHF o DPO.

## Capacidades

- Reconocimiento automatico de voz (ASR) en ingles, offline y en dispositivo.
- Transcripcion de audio en ventanas de 15 segundos, encadenables para audio de formato largo (se probo con un archivo de 3600 s).
- Inferencia acelerada en Apple Neural Engine (ANE) y en GPU de Apple Silicon, con Core ML.
- Ejecucion en segundo plano en iOS (la ANE es la unica opcion para trabajo en background en iOS).
- Cinco variantes de encoder intercambiables con el mismo contrato de decoder/joint, para ajustar tamano, latencia y precision.
- Integracion directa con FluidAudio via `AsrModelVersion.phonon2`, con API Swift (`AsrManager.transcribe`) y CLI (`fluidaudiocli transcribe` / `asr-benchmark`).
- No se documentan capacidades de tool calling, agentes, vision, audio generativo ni razonamiento multi-paso; es un modelo puramente de transcripcion.

## Casos de uso

- **Transcripcion en dispositivo en iOS y macOS**: apps que necesitan pasar audio a texto sin enviar datos a la nube. El encoder por defecto (321 MB) corre sobre la ANE en 18,6 ms por ventana de 15 s, apto para procesamiento en tiempo real y en segundo plano.
- **Subtitulado y actas de reuniones**: la ventana de 15 s permite transcripcion incremental de conversaciones; en audio conversacional de formato largo (Earnings-22) procesa una hora en 7,5 s con RTFx de 478x.
- **Dictado y asistentes de voz locales**: integrable en apps de nota de voz o comandos por voz que requieren baja latencia y operacion offline, con el encoder `Encoder_lut3` o `Encoder_lut6` si se usa la GPU.
- **Indexacion y busqueda de archivos de audio**: transcripcion por lotes de bibliotecas de audio para generar indices de texto buscables, aprovechando el alto throughput (159x RTFx en test-clean).
- **Accesibilidad**: conversion de voz a texto en tiempo real para personas con discapacidad auditiva, ejecutable enteramente en el dispositivo del usuario sin coste de API.
- **Preprocesado de pipelines de datos**: generacion de transcripciones de referencia o etiquetas para conjuntos de datos de audio en ingles antes de otras etapas de procesamiento.
- **Analitica de llamadas en el borde**: transcripcion local de grabaciones de atencion al cliente para extraer texto sin exponer audio sensible a servicios externos.

## Benchmarks y rendimiento

LibriSpeech completo con FluidAudio `asr-benchmark` sobre un M5 Pro, ambos modelos con el encoder por defecto sobre la ANE. WER a nivel de corpus; RTFx = audio total / tiempo total de procesamiento.

| Conjunto (ANE) | v3 | Ultra | Phonon-2 |
|---|---|---|---|
| test-clean (2620 archivos) WER | 2,27 % | 2,13 % | 2,47 % |
| test-other (2939 archivos) WER | 4,12 % | 3,81 % | 4,62 % |
| test-clean RTFx | 149-152x | 151x | 159x |
| test-other RTFx | 138x | 142x | 146x |

Archivo de formato largo de 60 minutos (Earnings-22, cuatro llamadas concatenadas), M5 Pro, encoder ANE por defecto:

| Modelo | Tiempo de procesamiento | RTFx | WER |
|---|---:|---:|---:|
| v3 | 10,9 s | 331x | 16,5 % |
| Ultra | 7,7 s | 469x | 13,5 % |
| Redux | 14,2 s | 254x | 14,8 % |
| Phonon-2 default (sparse, 321 MB) | 7,5 s | 478x | 17,2 % |
| Phonon-2 `Encoder_lut6` (470 MB) | 7,4 s | 486x | 17,2 % |
| Phonon-2 `Encoder_sparse-g4` (246 MB) | 9,0 s | 399x | 17,2 % |
| Phonon-2 `Encoder_sparse-g1` (176 MB) | 23,4 s | 154x | 17,2 % |
| Phonon-2 `Encoder_lut3` (253 MB) | 23,6 s | 152x | 17,2 % |

Rendimiento de los encoders (una ventana de 15 s, M5 Pro, macOS 27):

| Archivo | Tamano | Codificacion | ANE (ms) | ANE RTFx | GPU |
|---|---:|---|---:|---:|---|
| `Encoder.mlmodelc` (default) | 321 MB | mascara sparse + paleta 6 bits por 8 filas | 18,6 | 159x | 16 ms, ~150 s de carga por lanzamiento |
| `Encoder_sparse-g4.mlmodelc` | 246 MB | mascara sparse + paleta 4 bits por 4 filas | 24,3 | 140x | misma advertencia de carga |
| `Encoder_sparse-g1.mlmodelc` | 176 MB | mascara sparse + paleta 2 bits por fila | 70 | ~70x | misma advertencia de carga |
| `Encoder_lut6.mlmodelc` | 470 MB | paleta dense 6 bits por 8 filas | 18,6 | 155x | 16 ms, 0,6 s de carga |
| `Encoder_lut3.mlmodelc` | 253 MB | paleta dense 3 bits por fila | 72 | 70x | 16 ms, 0,7 s de carga |
| v3 `Encoder.mlmodelc` (referencia, 6 bits) | 445 MB | - | 23,5 | 149-152x | 18 ms |

Fidelidad de conversion: en los primeros 100 archivos de test-clean, la diferencia frente a una decodificacion NeMo fp32 de contexto completo es de 0,34 % de WER (1,83 % frente a 1,79 %).

## Requisitos de hardware

- Hardware obligatorio: Apple Silicon (M-series). Se probo sobre un M5 Pro con macOS 27; requiere iOS 18+ / macOS 15+ para el encoder por defecto.
- VRAM / memoria unificada: el repositorio completo ocupa 1,5 GB. El encoder por defecto pesa 321 MB; las variantes van de 176 MB (`Encoder_sparse-g1`) a 470 MB (`Encoder_lut6`).
- Latencia por ventana de 15 s: 18,6 ms (encoder por defecto, ANE), 24,3 ms (`sparse-g4`), 70-72 ms (`sparse-g1` y `lut3`).
- Throughput: RTFx de 159x (test-clean) y 146x (test-other) con el encoder por defecto sobre ANE; hasta 486x en audio conversacional de una hora con `Encoder_lut6`.
- Requisitos por unidad de computo: en la ANE el coste de las paletas crece con el numero de paletas, no con su ancho de bits, por lo que 8 filas por paleta es mas rapido que el propio encoder v3. En la GPU, los pesos sparse se materializan en cada carga (~150 s de CPU, sin cache), mientras que la ANE los compila una vez (~1 min) y los cachea.
- Opciones de despliegue: FluidAudio (Swift) con `AsrModelVersion.phonon2`; CLI mediante `swift run fluidaudiocli transcribe audio.wav --model-version phonon2` y `asr-benchmark`. Tambien se puede cargar un encoder alternativo renombrandolo a `Encoder.mlmodelc` y usando `AsrModels.loadLocal(from:version:encoderComputeUnits:)`.
- No se soportan CUDA, vLLM, llama.cpp, Ollama ni TGI; el formato es exclusivamente Core ML.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER test-clean (LibriSpeech) | WER test-other | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| phonon-2-coreml | 0,6 B | ventana 15 s | 2,47 % | 4,62 % | CC-BY-4.0 | Core ML, FluidAudio |
| parakeet-tdt-0.6b-v3-coreml | 0,6 B | ventana 15 s | 2,27 % | 4,12 % | no disponible en la informacion | Core ML, FluidAudio |
| Phonon-2 Ultra | no disponible | ventana 15 s | 2,13 % | 3,81 % | no disponible | Core ML, FluidAudio |
| Phonon-2 Redux | no disponible | ventana 15 s | no disponible | no disponible | no disponible | Core ML, FluidAudio |

Frente a v3, Phonon-2 es menos preciso en LibriSpeech (0,20 puntos en test-clean y 0,50 en test-other) pero mas rapido (159x frente a 149-152x). Segun la tarjeta del autor, v3 es el modelo mas preciso en LibriSpeech mientras que Phonon-2 supera a v3 en AMI meetings y VoxPopuli bajo el protocolo del Open ASR Leaderboard. En audio conversacional de formato largo es el modelo mas rapido de los cuatro, con 478x, pero el menos preciso (17,2 % de WER frente a 13,5 % de Ultra). v3 cubre 25 idiomas, mientras que Phonon-2 es solo ingles.

## Limitaciones y advertencias

- Solo soporta ingles; v3 cubre 25 idiomas, por lo que no es apto para transcripcion multilingue.
- Menor precision que v3 en LibriSpeech (2,47 % frente a 2,27 % en test-clean; 4,62 % frente a 4,12 % en test-other) y en audio conversacional de formato largo (17,2 % frente a 16,5 %).
- Riesgo de alucinacion y errores de sustitucion propios de los modelos ASR, especialmente en audio con ruido, acentos o solapamiento de hablantes; en dominios conversacionales el WER supera el 17 %.
- Requiere hardware Apple Silicon con iOS 18 / macOS 15 o superior; no hay ruta de despliegue en GPU NVIDIA ni en entornos Linux.
- En GPU, la carga de pesos sparse implica unos 150 s de CPU en cada lanzamiento sin cache; esto penaliza el arranque si se usa la ruta de GPU en lugar de la ANE.
- La licencia CC-BY-4.0 exige atribucion; conviene revisar el archivo `NOTICE` del repositorio, que incluye la atribucion upstream. No se detallan restricciones adicionales de uso comercial en la informacion disponible.
- El modelo no anade contexto de texto entre ventanas mas alla de la ventana de 15 s; la coherencia en audios largos depende del encadenado que haga el pipeline que lo integra.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta y con fecha de creacion en 2026, por lo que la validacion comunitaria es inexistente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/suryatmodulus/phonon-2-coreml
- Modelo base: https://huggingface.co/FermionResearch/Phonon-2
- Modelo original de referencia (v3 Core ML): https://huggingface.co/FluidInference/parakeet-tdt-0.6b-v3-coreml
- FluidAudio (libreria): https://github.com/FluidInference/FluidAudio
- Pull request de integracion en FluidAudio (#980): https://github.com/FluidInference/FluidAudio/pull/980
- Perfil en HuggingFace del autor: https://huggingface.co/suryatmodulus/datasets
- GitHub del autor: https://github.com/suryatmodulus
- Blog sobre Phonon (modelo TTS de 100 M, distinto de este modelo ASR): https://gradium.ai/blog/phonon-update-may-2026
- CoreML-Models (zoo de modelos Core ML para iOS/macOS, contexto de despliegue): https://github.com/john-rocky/CoreML-Models
