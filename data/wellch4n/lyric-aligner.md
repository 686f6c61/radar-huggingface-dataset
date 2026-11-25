# wellCh4n/lyric-aligner

## Resumen

LyricAligner es un modelo neuronal compacto especializado en la alineación entre letra cantada y notas melódicas (lyric-to-note alignment). Lo desarrolla wellCh4n y se publica bajo licencia Apache 2.0 con el identificador `wellCh4n/lyric-aligner`. Resuelve un problema muy concreto dentro del campo de la recuperación de información musical (MIR): asignar cada token de letra (caracteres chinos mandarines y palabras en inglés) a las notas de la melodía vocal transcrita, incluyendo casos difíciles como la rearticulación sobre la misma altura, sílabas con voz respirada o no entonadas, continuaciones de melisma y tramos cantados no reconocidos.

La arquitectura combina dos componentes: un `VocalNoteRefiner` (convoluciones 1D con residuales a 100 Hz más una BiGRU) que propone cortes de nota y candidatos respirados, y un `AcousticNoteLyricMatcher` (transformer de tres capas con doble flujo, `d_model=256` y 8 cabezas, con atención cruzada bidireccional) que resuelve la asignación mediante un decodificador de Viterbi monótono exacto con puerta de rollback de candidatos. El modelo tiene solo 6,13 millones de parámetros en FP32 (23,38 MiB en safetensors), lo que lo hace extremadamente ligero para desplegar.

Su relevancia actual radica en que ofrece un pipeline autocontenido de alineación letra-nota con resultados de evaluación muy altos en tres benchmarks de canto (GTSinger-CN, Opencpop y M4Singer), tanto en condiciones limpias como degradadas por sangrado de acompañamiento. Es una pieza útil para sistemas de transcripción de canto, karaoke automático, anotación de corpus musicales y herramientas de producción musical asistida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `VocalNoteRefiner` (1D-ResConv a 100 Hz + BiGRU) + `AcousticNoteLyricMatcher` (transformer de 3 capas dual-stream Pre-LN, `d_model=256`, `nhead=8`, atención cruzada bidireccional + Viterbi monótono exacto con puerta de rollback) |
| Parametros totales | 6.125.094 (FP32, 23,38 MiB en safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa secuencias de frames a 100 Hz; no se especifica límite máximo de tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en FP32; no se documentan variantes GGUF, INT8 ni otras) |
| Idiomas soportados | mandarín (caracteres) e inglés aproximado (vocabulario de 58 tokens fonéticos) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (FP32), con `custom_code` y carga vía `trust_remote_code=True` |

## Arquitectura y entrenamiento

El modelo se compone de dos módulos encadenados. El primero, `VocalNoteRefiner`, opera sobre curvas acústicas a 100 Hz (hop de 10 ms) mediante convoluciones 1D con conexiones residuales y una BiGRU; su función es proponer cortes internos de nota sobre la misma altura (rearticulación) y candidatos de sílabas respiradas o no entonadas. El segundo, `AcousticNoteLyricMatcher`, es un transformer de tres capas con doble flujo Pre-LN, dimensión de modelo 256 y 8 cabezas de atención, que aplica atención cruzada bidireccional entre la representación de las notas y la de los tokens de letra. La asignación final se resuelve con un decodificador de Viterbi monótono exacto, restringido a alineaciones monótonas (sin cruces), con una puerta de rollback que descarta candidatos propuestos por el refinador cuando degradan la verosimilitud global.

La entrada puede combinar varias fuentes opcionales: log-posteriores fonéticos a 10 ms (58 tokens), probabilidades de frontera, cinco canales de características DSP (`rms_db_norm`, `d_rms`, `flux_norm`, `hf_ratio`, `zcr_norm`), pista F0 de RMVPE con periodicidad, audio a 16 kHz y una rejilla de beats. El modelo admite un modo de reserva sin información acústica ("zero-acoustic fallback"), lo que permite alinear solo con las notas y la letra. No se detalla en la información disponible el volumen de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon RLHF o DPO; la model card únicamente menciona la evaluación sobre divisiones de canciones no vistas de GTSinger-CN, Opencpop y M4Singer.

## Capacidades

- Alineación monótona exacta de tokens de letra (caracteres mandarines y palabras en inglés aproximado) sobre notas de melodía vocal transcrita.
- Manejo de rearticulación sobre la misma altura (same-pitch re-articulation splits) mediante propuestas del refinador y puerta de rollback.
- Recuperación de sílabas respiradas o no entonadas (breathy/unpitched syllable recovery) con estimación de F0 a partir de la pista RMVPE.
- Gestión de continuaciones de melisma (slur) y de tramos cantados no reconocidos.
- Tolerancia a tokens extra, fusiones de notas, caídas de notas respiradas y jitter de fronteras en condiciones degradadas por sangrado de acompañamiento.
- Decodificación Viterbi monótona exacta con restricciones de monotonía (sin cruces entre letra y notas).
- Modo de reserva sin información acústica (zero-acoustic fallback) para alinear solo con notas y letra.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso; es un modelo de extracción de características y alineación, no un LLM generativo.
- No dispone de modo thinking, visión ni audio generativo.

## Casos de uso

- Karaoke automático y sincronización de subtítulos: el modelo asigna cada carácter o palabra de la letra a su nota correspondiente a resolución de 10 ms, lo que permite generar resaltados de letra sincronizados con la melodía en reproductores de karaoke.
- Anotación de corpus de canto para investigación en MIR: permite etiquetar automáticamente la correspondencia letra-nota en grabaciones de GTSinger, Opencpop o M4Singer, reduciendo el trabajo manual de anotación fonética y de fronteras.
- Transcripción asistida de canto: combinado con un transcriptor de melodía (por ejemplo, RMVPE para F0) y un reconocedor de letra, el modelo cierra el pipeline asignando los tokens reconocidos a las notas detectadas.
- Herramientas de producción musical: alineación de pistas vocales con letras para edición, corrección de afinación por sílaba o generación de partituras cantadas con texto.
- Evaluación de sistemas de síntesis de voz cantada (SVS): el alineador permite comparar la colocación de sílabas generadas por un sistema SVS frente a la referencia, midiendo precisión nota-carácter y F1 de carácter con tolerancias de ±50 ms y ±80 ms.
- Limpieza y corrección de transcripciones existentes: dado un conjunto de notas y una letra con posibles errores de segmentación, el modelo propone cortes de nota y recupera sílabas respiradas que otros sistemas descartan.
- Análisis de melismas y ornamentación vocal: la métrica de Slur F1 y la gestión de continuaciones de melisma permiten estudiar patrones de ornamentación en distintos estilos de canto.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre divisiones de canciones no vistas, en condiciones limpias y degradadas (con fusiones de notas, caídas de notas respiradas, tramos no reconocidos, tokens extra y jitter de fronteras):

| Dataset | Condición | Note-Char Acc | Char F1 (±50 ms) | Char F1 (±80 ms) | Slur F1 | Same-Pitch Split F1 (±50 ms) | Breathy Recovery F1 |
|---|---|---:|---:|---:|---:|---:|---:|
| GTSinger-CN | Clean | 97,40% | 92,54% | 95,94% | 81,97% | 60,35% | 48,50% |
| GTSinger-CN | Degraded | 97,06% | 92,37% | 95,68% | 81,26% | 59,87% | 48,42% |
| Opencpop | Clean | 98,97% | 94,90% | 97,88% | 58,87% | 34,72% | 55,95% |
| Opencpop | Degraded | 98,95% | 94,93% | 98,11% | 59,47% | 34,04% | 55,95% |
| M4Singer | Clean | 97,84% | 93,10% | 96,73% | 84,98% | 65,99% | 51,49% |
| M4Singer | Degraded | 97,37% | 92,36% | 96,19% | 84,30% | 63,35% | 51,37% |

No se han publicado comparaciones con otros modelos de alineación letra-nota en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32, dado que el modelo tiene 6,13 M de parámetros (23,38 MiB de pesos) más las activaciones de las curvas acústicas a 100 Hz.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente (RTX 3060, RTX 4060, RTX 4090); también puede ejecutarse en CPU para lotes pequeños.
- Cabe en cualquier GPU consumer e incluso en entornos integrados; el cuello de botella es el procesado de audio y la extracción de características (RMVPE, DSP), no el modelo.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (requiere `torch`, `numpy` y `pypinyin`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, y al no ser un LLM generativo estas herramientas no aplican directamente.
- Latencia y throughput: no disponibles en la información proporcionada; dependen del tamaño del audio de entrada y del coste de la extracción de F0 y características DSP.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de alineación letra-nota en la documentación proporcionada. Como referencia de categoría, existen herramientas de alineación forzada (forced alignment) como Montreal Forced Aligner o WhisperX, pero ninguna de ellas está diseñada específicamente para alinear letra cantada sobre notas melódicas con manejo de melismas, rearticulación y sílabas respiradas, por lo que la comparación directa no está disponible.

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LyricAligner | 6,13 M | no disponible | Alineación letra-nota cantada | Apache 2.0 | Hugging Face |
| Montreal Forced Aligner | no disponible | no disponible | Alineación forzada de habla | no disponible | Código abierto |
| WhisperX | no disponible | no disponible | Alineación forzada de habla | no disponible | Código abierto |

## Limitaciones y advertencias

- El vocabulario de entrada está limitado a 58 tokens fonéticos que cubren mandarín e inglés aproximado; otros idiomas no están soportados de forma nativa.
- La alineación es estrictamente monótona: no puede manejar cruces entre letra y notas, lo que excluye ciertos estilos de canto con reordenamientos.
- El rendimiento en Same-Pitch Split F1 es moderado (34,72% en Opencpop limpio, 60,35% en GTSinger-CN limpio), lo que indica que la rearticulación sobre la misma altura sigue siendo el caso más difícil.
- El rendimiento en Breathy Recovery F1 ronda el 48-56%, por lo que la recuperación de sílabas respiradas no es fiable en todos los casos.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de asignaciones incorrectas cuando la entrada acústica es ambigua o el audio está muy degradado.
- No se documentan sesgos demográficos ni lingüísticos específicos; al estar entrenado sobre corpus de canto chinos (GTSinger-CN, Opencpop, M4Singer), puede tener un sesgo hacia estilos y voces presentes en esos datasets.
- La licencia Apache 2.0 permite uso comercial, pero el modelo requiere `trust_remote_code=True`, lo que implica ejecutar código personalizado del autor; conviene auditar el código antes de desplegarlo en producción.
- El repo tiene 0 descargas y 0 likes en el momento de la consulta, y no se ha publicado información sobre el proceso de entrenamiento (tokens, dataset, RLHF/DPO), lo que limita la reproducibilidad.
- No se documentan límites máximos de duración de audio ni de número de notas o tokens de letra por llamada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wellCh4n/lyric-aligner
- No se han encontrado en la información disponible enlaces adicionales a papers, blogs, repositorios o demos.
