# wothers/parakeet-tdt-0.6b-ultra-onnx-int8

## Resumen

`wothers/parakeet-tdt-0.6b-ultra-onnx-int8` es una exportación a ONNX con cuantización int8 de `moondream/parakeet-ultra`, que a su vez es un post-entrenamiento de `nvidia/parakeet-tdt-0.6b-v3`. Se trata, por tanto, de un reconocedor de voz (ASR) de tipo FastConformer con decodificación TDT (Token-and-Duration Transducer) de aproximadamente 0,6 mil millones de parámetros, orientado a 25 idiomas europeos, con salida que incluye puntuación y uso de mayúsculas.

El modelo resuelve el problema de desplegar un ASR multilingüe de calidad en entornos con recursos limitados: el export int8 ocupa unos 893 MB frente a los aproximadamente 2,4 GB de la versión fp32, lo que facilita su ejecución en CPU y en dispositivos de borde mediante ONNX Runtime. La receta de cuantización es deliberadamente conservadora (solo pesos MatMul, cuantización per-channel), y el autor documenta que reduce la degradación a +0,03 pp de WER frente al modelo fp32, muy por debajo del +1,97 pp de una exportación int8 per-tensor que también cuantiza convoluciones.

Es relevante ahora porque demuestra que una cuantización bien diseñada permite servir ASR multilingüe de 0,6B en infraestructura modesta sin pérdida medible de precisión, y porque mantiene el layout de ficheros de `istupakov/parakeet-tdt-0.6b-v3-onnx`, de modo que se integra sin cambios en `parakeet-rs` y en la herramienta `voicsh`. No es una publicación oficial de NVIDIA ni de Moondream.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer-TDT (Token-and-Duration Transducer), encoder Conformer + predictor LSTM + joint network |
| Parametros totales | ~0,6 mil millones (modelo base `parakeet-tdt-0.6b-v3`) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible; entrada de audio a 16 kHz mono, modelo no streaming |
| Tipos de cuantizacion | int8 dinámica (QInt8, per-channel, solo pesos MatMul); fp32 de referencia no incluido |
| Idiomas soportados | 25: bg, hr, cs, da, nl, en, et, fi, fr, de, el, hu, it, lv, lt, mt, pl, pt, ro, ru, sk, sl, es, sv, uk |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (`encoder-model.int8.onnx`, `decoder_joint-model.int8.onnx`, `vocab.txt`) |
| Tamano del repo | ~0,9 GB (893 MB) |
| Libreria | onnxruntime |
| Modelo base | `moondream/parakeet-ultra` (rev. `73175eb`), derivado de `nvidia/parakeet-tdt-0.6b-v3` |

## Arquitectura y entrenamiento

La arquitectura es un FastConformer-TDT: un encoder Conformer que procesa espectrogramas de audio de 16 kHz y una cabeza transducer TDT que predice conjuntamente tokens y duraciones, lo que permite alineamientos más eficientes que un CTC o un transducer convencional. El modelo base fue entrenado por NVIDIA (`parakeet-tdt-0.6b-v3`) y posteriormente post-entrenado por Moondream (`parakeet-ultra`); esta ficha no dispone de detalles sobre el corpus de post-entrenamiento, el número de tokens de audio ni si se empleó RLHF o ajuste supervisado adicional.

La innovación destacable de esta exportación es la receta de cuantización: cuantización dinámica int8 con `quantize_dynamic` de ONNX Runtime, restringida a operadores `MatMul` (`op_types_to_quantize=["MatMul"]`), con `per_channel=True`, `weight_type=QInt8` y `MatMulConstBOnly=True`. Solo se cuantizan los pesos de MatMul (atención, feed-forward y proyecciones del joint), con una escala por canal de salida; convoluciones, red de predicción LSTM y el resto de operadores permanecen en fp32. Además, se eliminó la cabeza VAD (`vad_head`) del modelo original, por lo que la segmentación de audio largo debe hacerla el llamante.

## Capacidades

- Reconocimiento automático de voz (ASR) en 25 idiomas europeos, incluidos español, inglés, alemán, francés, italiano, portugués, neerlandés, polaco, ruso y ucraniano, entre otros.
- Salida con puntuación y uso de mayúsculas, lo que reduce el post-procesado necesario para subtitulado y transcripción.
- Decodificación TDT con predicción conjunta de tokens y duraciones.
- Ejecución en CPU mediante ONNX Runtime, sin necesidad de GPU.
- Integración directa con `parakeet-rs` (variante `ParakeetTDT`) y con la herramienta `voicsh` (arquitectura `Tdt`).
- No soporta streaming: procesa audio completo por segmentos.
- No incluye VAD ni segmentación de audio largo integrada.
- No dispone de tool calling, capacidades de agente, visión ni audio más allá del ASR.

## Casos de uso

- Transcripción de reuniones y entrevistas: el modelo genera texto con puntuación y mayúsculas a partir de audio de 16 kHz, lo que permite obtener actas legibles directamente; el llamante debe segmentar la grabación en fragmentos manejables al no ser streaming.
- Subtitulado multilingüe: con 25 idiomas cubiertos, un mismo pipeline puede transcribir contenido en varias lenguas europeas y generar subtítulos con puntuación, útil para plataformas de vídeo con catálogos plurilingües.
- Asistentes de voz en el borde: al ocupar ~893 MB en int8 y ejecutarse con ONNX Runtime en CPU, es viable en portátiles, mini-PC y dispositivos sin GPU dedicada para dictado o comandos de voz.
- Indexación y búsqueda de archivos de audio: transcripción por lotes de archivos históricos (podcasts, llamadas, archivos de radio) para hacerlos buscables por texto, aprovechando el bajo coste de inferencia en CPU.
- Accesibilidad: generación de transcripciones en vivo o diferidas para personas con discapacidad auditiva en entornos educativos o institucionales, con la ventaja de cubrir varios idiomas europeos con un único modelo.
- Investigación en ASR multilingüe: sirve como referencia reproducible para comparar recetas de cuantización (per-channel MatMul frente a per-tensor con Conv) y para evaluar la degradación de WER en distintos idiomas.
- Integración en aplicaciones Rust: mediante `parakeet-rs` o `voicsh`, permite añadir transcripción a herramientas de escritorio nativas sin dependencias de Python.

## Benchmarks y rendimiento

Evaluación sobre FLEURS alemán (`de_de`), split de test, 862 clips (347 frases distintas). WER con normalizador `keep` (minúsculas, NFKC, puntuación y símbolos a espacios, sin reescritura de números ni compuestos), puntuado con los transcriptores de `voicsh`. Intervalos de confianza por bootstrap pareado agrupado por frase con 4000 rondas.

| Sistema | WER % | WER % (Whisper BasicTextNormalizer) | CER % |
|---|---|---|---|
| v3 fp32 (istupakov) | 5,12 | 6,81 | 1,53 |
| Ultra fp32 (no incluido en este repo) | 4,48 | 6,30 | 1,25 |
| **Ultra int8 (este repo)** | **4,49** | 6,29 | 1,27 |
| v3 int8 (istupakov, per-tensor) | 7,08 | 8,79 | 2,74 |
| v3 int8 (receta del autor, per-channel MatMul) | 5,15 | 6,84 | 1,53 |

| Comparación pareada | Diferencia | IC 95 % |
|---|---|---|
| Ultra fp32 - v3 fp32 | -0,64 pp | [-0,92, -0,37] |
| Ultra int8 - Ultra fp32 | +0,01 pp | [-0,09, +0,11] |

El autor advierte que el WER absoluto depende del normalizador y que solo debe compararse bajo el mismo. La model card de Moondream reporta 3,61 % (Ultra) frente a 4,13 % (v3) con el normalizador del Open ASR Leaderboard. Solo se evaluó alemán; el resto de idiomas no se ha probado en esta exportación.

## Requisitos de hardware

- VRAM/espacio en disco: ~893 MB para los pesos int8 (frente a ~2,4 GB en fp32). En CPU, la memoria de trabajo depende del tamaño del segmento de audio procesado.
- GPU recomendadas: no se especifican; al ser una exportación ONNX Runtime int8, el objetivo principal es CPU. Cualquier GPU con soporte de ONNX Runtime (por ejemplo, A100, H100, RTX 4090) puede ejecutarlo, pero no hay datos de rendimiento publicados.
- Cabe en GPU de consumo: sí, por tamaño de pesos, aunque no se documentan cifras de latencia ni throughput.
- Opciones de despliegue: ONNX Runtime (vía `parakeet-rs` 0.4.4, verificado, o `voicsh`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El autor advierte que en CPUs x86 sin VNNI, ONNX Runtime emite una advertencia de posible saturación con el esquema U8S8 (activaciones uint8, pesos int8), y que la precisión en ese hardware no se ha probado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Idiomas | Licencia | Formato | Rendimiento documentado |
|---|---|---|---|---|---|---|
| **parakeet-tdt-0.6b-ultra-onnx-int8 (este)** | ~0,6B | audio 16 kHz mono, no streaming | 25 europeos | CC-BY-4.0 | ONNX int8 | WER 4,49 % en FLEURS de_de (normalizador `keep`) |
| moondream/parakeet-ultra (fp32) | ~0,6B | audio 16 kHz mono | 25 europeos | CC-BY-4.0 | safetensors (base) | WER 4,48 % en FLEURS de_de; 3,61 % con normalizador Open ASR |
| nvidia/parakeet-tdt-0.6b-v3 | ~0,6B | audio 16 kHz mono | 25 europeos | CC-BY-4.0 | safetensors / ONNX (istupakov) | WER 5,12 % fp32 y 7,08 % int8 per-tensor en FLEURS de_de; 4,13 % con normalizador Open ASR |
| istupakov/parakeet-tdt-0.6b-v3-onnx | ~0,6B | audio 16 kHz mono | 25 europeos | CC-BY-4.0 | ONNX | WER 5,12 % fp32 y 7,08 % int8 per-tensor en FLEURS de_de |

## Limitaciones y advertencias

- El modelo emite el token SentencePiece `<unk>` donde el texto de entrenamiento contenía paréntesis (13 veces en los 862 clips evaluados); los runtimes lo pasan como texto literal y debe eliminarse en post-procesado.
- No es streaming y no incluye VAD ni segmentación de audio largo; el llamante debe dividir las grabaciones.
- La receta usa U8S8 (activaciones uint8, pesos int8); en CPUs x86 sin VNNI, ONNX Runtime advierte de posible saturación y la precisión en ese hardware no se ha probado.
- El modelo fp32 de referencia no se incluye en el repositorio.
- Solo se ha evaluado en alemán (FLEURS `de_de`); el rendimiento en los otros 24 idiomas está sin probar.
- No es una publicación oficial de NVIDIA ni de Moondream; los riesgos de sesgo y alucinación heredan los del modelo base, sin evaluación específica documentada.
- Licencia CC-BY-4.0: permite uso comercial con atribución a NVIDIA y Moondream, y requiere indicar los cambios (conversión a ONNX, eliminación de `vad_head`, cuantización int8 de pesos MatMul), según se detalla en `NOTICE` y `LICENSE`.
- El script de reproducción vive en la rama `exp/parakeet-ultra-eval` del PR #23 de `burka/voicsh`, que puede no estar fusionado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wothers/parakeet-tdt-0.6b-ultra-onnx-int8
- Modelo base (Moondream): https://huggingface.co/moondream/parakeet-ultra
- Modelo original (NVIDIA): https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Exportación ONNX de referencia (istupakov): https://huggingface.co/istupakov/parakeet-tdt-0.6b-v3-onnx
- Repositorio de herramientas y reproducción (voicsh): https://github.com/burka/voicsh
