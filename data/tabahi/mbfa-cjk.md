# Tabahi/mbfa-cjk

## Resumen

mbfa-cjk es un codificador de fonemas y alineador forzado basado en una CNN sin contexto, perteneciente a la familia p4mbfa (sucesora de CUPE / p3cupe) y desarrollado por el autor de GitHub/HuggingFace Tabahi. No es un modelo de lenguaje: clasifica cada fotograma de 5 ms de audio en etiquetas fonéticas y segmenta la señal a partir de una secuencia de fonemas conocida. Está especializado en el grupo de lenguas cjk del proyecto standard_g2p y cubre cmn (mandarín) y yue (cantonés).

El modelo tiene 14.711.189 parámetros (~14,7 M) almacenados en safetensors, con un tamano de repositorio de 0,1 GB, y se publica bajo licencia AGPL-3.0. Su diseno es deliberadamente restringido: cada fotograma se clasifica usando como máximo 120 ms de audio (campo receptivo de 38,9 ms), de modo que el modelo no puede aprender la fonotáctica de ninguna lengua concreta y depende íntegramente de la secuencia de teléfonos que se le proporciona como entrada.

Es relevante para quien necesite alineación forzada de audio a nivel de fonema en mandarín y cantonés, incluyendo capa tonal, dentro de un ecosistema open source reproducible (código en bfa_models, inventario fonético estándar y chequeos publicados). Su utilidad principal es la anotación de corpus y el preprocesado para TTS, ASR y análisis fonético. El repositorio no tiene descargas ni valoraciones en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CNN sin contexto (context-free) con tres cabezas de clasificación por fotograma: ph, phg y tone; no es un transformer ni un modelo generativo |
| Parámetros totales | 14.711.189 (~14,7 M) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica en el sentido de contexto textual: fotogramas de 5 ms y como máximo 120 ms de audio por fotograma (campo receptivo de 38,9 ms) |
| Tipos de cuantización | no disponible (no se documentan versiones cuantizadas) |
| Idiomas soportados | cmn (mandarín) y yue (cantonés); otros miembros del grupo cjk podrían alinearse según el autor, sin verificar |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors (model.safetensors); además se publica un checkpoint de entrenamiento en .ckpt de PyTorch Lightning (pickle) |
| Cabezas y etiquetas | ph: 48 etiquetas locales de cjk (incluye `<blank>`, `SIL`, `noise`, `<unk>`); phg: 15 grupos fonéticos dorados compartidos entre grupos de lenguas; tone: 22 valores tonales compartidos |
| Entrada de audio | mono, 16.000 Hz |
| Publicación en HuggingFace | 9 de octubre de 2026 (según metadatos del repositorio) |
| Descargas / valoraciones | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es una CNN sin contexto que opera sobre fotogramas de 5 ms. Cada fotograma se clasifica empleando como máximo 120 ms de audio y con un campo receptivo de 38,9 ms, una restricción de diseno explícita: al no disponer de ventanas largas, el modelo no puede aprender la fonotáctica de una lengua y queda forzado a depender de la secuencia de fonemas aportada externamente. Sobre las posteriores por fotograma se aplica un decodificador de Viterbi segmental restringido a la secuencia de teléfonos conocida, y los límites entre teléfonos se refinan a precisión sub-fotograma en el cruce de las posteriores de segmentos vecinos. La salida se organiza en tres cabezas: `ph` (fonemas locales del grupo cjk), `phg` (grupos fonéticos dorados, compartidos por todos los grupos de lenguas) y `tone` (valores tonales, también compartidos y entrenados sobre la capa tonal de este grupo).

Los datos de entrenamiento son FLEURS cjk, con una muestra del 62% (`train_limit 100000`), aproximadamente 9 de las 14,9 horas del corpus, y un `noise_level` de 0,02. El checkpoint publicado corresponde al experimento `mc01a`, época 13, seleccionado por `val_loss` sobre FLEURS entre 30 épocas. El tronco y la cabeza `phg` provienen del modelo latin `ma02a` (época final), mientras que `ph_head` y `tone_head` se entrenaron desde cero para este grupo. Las etiquetas son pronunciaciones de diccionario generadas por standard_g2p (inventario dorado `9438371ed6dd`), no transcripciones fonéticas de lo realmente pronunciado. No se documenta RLHF, DPO ni ningún otro ajuste por preferencias, algo esperable en un modelo de este tipo.

## Capacidades

- Clasificación de fonemas por fotograma cada 5 ms, con posteriores por fotograma para las tres cabezas (`aligner.encode(wav)`).
- Alineación forzada: dado un audio y la secuencia de teléfonos correspondiente, devuelve segmentos con `token`, `start_ms` y `end_ms`.
- Segmentación de fonemas con precisión sub-fotograma, refinando el límite en el cruce de las posteriores de segmentos vecinos.
- Reconocimiento de grupos fonéticos mediante la cabeza `phg` (15 clases compartidas entre grupos de lenguas).
- Modelado tonal mediante la cabeza `tone` (22 valores), relevante para cmn y yue.
- Integración con el ecosistema standard_g2p para el paso de texto a tokens (`goldG2P.phonemize_sentence` y `lang_group_inventory.to_local`); la lista de tokens está en `config.json` (`labels.tokens`).
- Multilingüe dentro del grupo cjk: entrenado en cmn y yue. El autor indica que otros miembros del grupo podrían alinearse porque standard_g2p los mapea a los mismos tokens, pero no lo ha probado.
- Reutilización del tronco para transferencia: se puede continuar el entrenamiento o entrenar un grupo de lenguas nuevo sobre el tronco y la cabeza `phg` compartidas.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso, visión, audio generativo ni generación de texto.

## Casos de uso

- Anotación de corpus de voz en mandarín y cantonés: dado un corpus con transcripciones y sus pronunciaciones de diccionario, el modelo produce alineaciones a nivel de teléfono con marcas temporales en milisegundos, listas para alimentar pipelines de investigación fonética o de entrenamiento de modelos acústicos.
- Preprocesado para síntesis de voz (TTS): los generadores neuronales tipo VITS o FastSpeech necesitan duraciones por fonema; la alineación forzada proporciona esos `start_ms` y `end_ms` a partir de pares audio-texto ya existentes, sin necesidad de un alineador entrenado por separado.
- Etiquetado de datos para ASR: al alinear transcripciones conocidas con el audio se pueden derivar etiquetas de duración y de límites de segmento, útiles para filtrado de calidad, segmentación de utterances largos y curriculum learning.
- Evaluación de pronunciación (CAPT): las posteriores de `ph` y `tone` permiten detectar discrepancias entre lo esperado por el diccionario y lo emitido, con resolución de fotograma de 5 ms, lo que resulta adecuado para señalar qué teléfono o tono se desvía en mandarín o cantonés.
- Investigación fonética y prosódica: la cabeza tonal de 22 clases y la resolución sub-fotograma permiten medir duraciones vocálicas, contactos entre segmentos y realización de tonos en corpus de habla espontánea leída de FLEURS.
- Segmentación y reconocimiento de fonemas como tarea en sí misma: la cabeza `ph` se puede usar para clasificación de fonemas por fotograma sin necesidad de la etapa de Viterbi, por ejemplo para experimentos comparativos sobre inventarios fonéticos.
- Búsqueda y recuperación de fragmentos por secuencia fonética: al disponer de posteriores por fotograma y decodificación restringida, se pueden localizar realizaciones de una determinada secuencia de teléfonos dentro de grabaciones largas.
- Control de calidad de doblaje o de grabaciones de estudio: la detección de tramos clasificados como `SIL` o `noise` dentro de la etiqueta `ph` permite localizar silencios anómalos y ruido en un flujo de 200 fotogramas por segundo de audio.

## Benchmarks y rendimiento

El autor publica únicamente métricas de validación internas sobre FLEURS, y advierte que se calculan comparando contra las propias alineaciones del modelo (no existen etiquetas de frontera fuera del inglés), por lo que miden autoconsistencia y no exactitud de fronteras.

| Métrica | Valor | Observación |
|---|---|---|
| val_loss | 2,5963 | Sobre clips de FLEURS reservados; selección del checkpoint (época 13 de 30) |
| val_frame_acc | 0,4795 | Exactitud por fotograma contra las alineaciones propias del modelo |
| val_frame_acc_groups | 0,612 | Exactitud por fotograma a nivel de grupo fonético, contra las alineaciones propias |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K y similares) en la información disponible; no son aplicables a un modelo de alineación fonética. Tampoco se publican métricas de error de frontera (por ejemplo, desviación media absoluta de límites) ni comparaciones frente a Montreal Forced Aligner o WhisperX.

## Requisitos de hardware

- VRAM estimada para inferencia, calculada a partir del número de parámetros (14.711.189): aproximadamente 59 MB en FP32, 29 MB en FP16 y 15 MB en INT8. Son estimaciones aritméticas, no medidas publicadas.
- Tamaño del repositorio: 0,1 GB, de los cuales el peso principal es `model.safetensors`; `from_pretrained` descarga solo `config.json` y `model.safetensors`.
- GPU: cabe con holgura en cualquier GPU con soporte CUDA, incluidas GTX 1050 y posteriores y toda la serie RTX 20/30/40. No requiere A100, H100 ni GPU de centro de datos.
- CPU: la inferencia es viable en CPU dado el tamano del modelo y el coste por fotograma (200 fotogramas por segundo de audio, cada uno calculado sobre un máximo de 120 ms de audio). No hay mediciones de latencia publicadas.
- Opciones de despliegue: el uso previsto es el paquete `p4mbfa` del repositorio [bfa_models](https://github.com/tabahi/bfa_models) mediante `MbfaAligner.from_pretrained(...)` y `aligner.align(...)`. No hay soporte documentado para vLLM, llama.cpp, Ollama, TGI, ONNX Runtime ni TensorRT, y ninguno de ellos es aplicable a este tipo de modelo.
- GPU recomendadas por escenario: cualquier GPU consumer para uso interactivo o por lotes; CPU suficiente para procesamiento por lotes offline. No se publican cifras de throughput ni de latencia.
- Preprocesado obligatorio: audio mono a 16.000 Hz (`aligner.load_audio`).

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea y enfoque | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mbfa-cjk | 14,7 M | Alineación forzada y reconocimiento de fonemas con CNN sin contexto y decodificador de Viterbi segmental | cmn, yue | AGPL-3.0 | HuggingFace y código en bfa_models |
| p3cupe / CUPE (predecesor) | no disponible | Alineación forzada y fonemas; predecesor directo de p4mbfa | no disponible | no disponible | Repositorio bfa_models |
| latin ma02a | no disponible | Alineación forzada; de aquí proceden el tronco y la cabeza `phg` reutilizados en mbfa-cjk | grupo de lenguas latinas (no detallado) | no disponible | Repositorio bfa_models |
| Alineadores clásicos tipo HMM-GMM (por ejemplo Montreal Forced Aligner) | no disponible | Alineación forzada con modelos acústicos HMM-GMM sobre diccionarios de pronunciación | varios idiomas según diccionario | no disponible en la información consultada | Distribución independiente del ecosistema de este modelo |
| Alineadores neuronales sobre modelos de voz auto-supervisados (por ejemplo enfoques tipo wav2vec2) | no disponible | Alineación por CTC sobre representaciones auto-supervisadas | varios idiomas | no disponible en la información consultada | Distribución independiente del ecosistema de este modelo |

No se dispone de datos comparativos de rendimiento entre estas alternativas en la información proporcionada; la comparación anterior es estructural y de disponibilidad, no de exactitud de fronteras.

## Limitaciones y advertencias

- Las métricas de validación publicadas miden autoconsistencia frente a las propias alineaciones del modelo, no exactitud de fronteras. No existen etiquetas de frontera fuera del inglés, según el autor.
- Las etiquetas de entrenamiento son pronunciaciones de diccionario de standard_g2p, no transcripciones fonéticas de lo pronunciado. Si el hablante se desvía del diccionario, la alineación puede reflejar la forma canónica y no la realización real.
- Volumen de entrenamiento reducido: aproximadamente 9 de 14,9 horas de FLEURS cjk, con una muestra del 62% del corpus.
- Solo se ha entrenado y probado en cmn y yue. Otros miembros del grupo cjk podrían funcionar según el autor, pero no están verificados.
- Modelo sin contexto por diseno: no aprende fonotáctica alguna y depende por completo de que el usuario proporcione la secuencia de teléfonos correcta. Una secuencia errónea produce una alineación errónea.
- Entrada restringida a audio mono a 16.000 Hz.
- Licencia AGPL-3.0: es copyleft y, al tratarse de un servicio de red, impone obligaciones de liberación del código fuente a quien lo ofrezca como servicio. Conviene revisar las implicaciones antes de integrarlo en productos propietarios o de uso comercial cerrado.
- El checkpoint de entrenamiento `.ckpt` es un pickle de PyTorch Lightning: cargarlo implica ejecutar código arbitrario, por lo que solo debería cargarse si se confía en el repositorio, tal como advierte el propio autor.
- El repositorio no tiene descargas ni valoraciones, por lo que no existe validación independiente de la comunidad.
- No se documentan versiones cuantizadas, exportaciones a ONNX ni integraciones con runtimes de inferencia habituales.
- La exactitud por fotograma publicada (`val_frame_acc` de 0,4795) es moderada y corresponde a una métrica interna; no debe interpretarse como una tasa de acierto de fronteras en producción.
- No se publican mediciones de latencia ni de throughput, ni análisis de sesgo por acento, género, edad o tipo de micrófono.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Tabahi/mbfa-cjk
- Código de inferencia y entrenamiento (p4mbfa): https://github.com/tabahi/bfa_models
- standard_g2p / CharsiuG2P: https://github.com/tabahi/CharsiuG2P
- Perfil de GitHub del autor: https://github.com/tabahi
- Dataset de entrenamiento: https://huggingface.co/datasets/google/fleurs
- Resultados de la búsqueda web: no se han encontrado enlaces técnicos relevantes sobre este modelo; los resultados devueltos correspondían a contenido no relacionado (perfiles de redes sociales y canales de vídeo) y no se incluyen por no ser fuentes verificables sobre el modelo.
