# Yakimask/kirime

## Resumen

kirime (切り目) es un detector de fin de turno (end-of-turn) en streaming para diálogo hablado en japonés, desarrollado por el autor independiente Yakimask. No procesa audio en bruto: consume la salida de un modelo de reconocimiento de voz en hiragana (kikimimi-hiragana-9m) junto con la energía RMS de cada trama, y emite cada 40 ms la probabilidad de que el interlocutor haya terminado su turno. Su función es decidir cuándo un sistema de conversación full-duplex debe empezar a responder.

El modelo es extremadamente pequeño: 463.233 parámetros según los pesos en safetensors (el autor indica aproximadamente 460 mil y un archivo de unos 1,8 MB). Se trata de un modelo recurrente de tipo streaming: en cada paso de 40 ms reutiliza el estado de la computación anterior para emitir una única probabilidad, sin mirar hacia delante (sin look-ahead), lo que lo hace apto para inferencia en tiempo real con latencia mínima.

Su relevancia práctica está en el problema del *turn-taking*: los sistemas de voz por turnos suelen usar umbrales fijos de silencio, lo que provoca respuestas prematuras o lentas. kirime aprende a partir de la evolución del texto reconocido y de la energía acústica, y permite ajustar el compromiso entre rapidez y falsos positivos mediante un umbral de probabilidad. Está entrenado sobre el corpus japonés YODAS2 y se distribuye con licencia CC BY 4.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo recurrente de streaming con estado (procesa una trama cada 40 ms; detalles internos de capas no disponibles) |
| Parametros totales | 463.233 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesamiento incremental por tramas de 40 ms con estado persistente) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, aproximadamente 1,8 MB) |
| Idiomas soportados | ja (japonés) |
| Licencia | CC BY 4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

kirime es un modelo de streaming con estado: cada 40 ms recibe dos entradas —el nuevo token de hiragana emitido por kikimimi (o 0 si no hay carácter nuevo) y la energía RMS de esa trama— y actualiza su estado interno para producir la probabilidad de fin de turno. No utiliza look-ahead: la decisión en cada instante solo depende del pasado. El autor no detalla en la model card el número de capas ni el tipo exacto de celda recurrente, por lo que esa información no está disponible.

El entrenamiento se realizó sobre aproximadamente 308 horas de japonés del corpus YODAS2 (subconjunto ja100, 1.940 vídeos), pasadas por el ASR kikimimi para obtener las secuencias de entrada; se separaron unas 279 horas para entrenamiento y unas 30 horas para validación, dividiendo por vídeo. No se usaron anotaciones manuales ni distinción de hablantes: las etiquetas se generaron automáticamente a partir de la salida de kikimimi. Se aplicó parada temprana cuando la métrica de validación no mejoró durante 10 comprobaciones consecutivas y se promediaron los 5 mejores checkpoints.

## Capacidades

- Detección de fin de turno en tiempo real: emite una probabilidad entre 0 y 1 cada 40 ms indicando si el hablante ha terminado.
- Procesamiento incremental con estado: no requiere ventanas de audio completas ni recálculo del pasado.
- Entrada multimodal ligera: combina la secuencia de caracteres reconocidos por el ASR con la energía acústica de la trama.
- Umbral configurable: permite ajustar el punto de corte (por ejemplo 0,6 o 0,7) para priorizar rapidez o reducir falsos positivos.
- Integración en sistemas full-duplex: pensado como componente de decisión de turno dentro de pipelines de diálogo hablado.
- No realiza generación de texto, razonamiento, código, matemáticas, visión ni tool calling; su única salida es la probabilidad de fin de turno.
- Capacidad multilingüe: no disponible; solo japonés.

## Casos de uso

- Asistentes de voz conversacionales en japonés: el modelo decide cuándo el usuario ha terminado de hablar para que el sistema inicie la respuesta; con umbral 0,6 la mediana de latencia tras el fin de turno es de 0,28 s, frente a 0,52 s con un simple temporizador de silencio.
- Agentes telefónicos y atención al cliente: sustituye el umbral fijo de silencio por una señal aprendida, reduciendo respuestas prematuras (2,9 % con umbral 0,6 frente a 4,1 % con 0,52 s de silencio) en conversaciones con pausas naturales.
- Sistemas de diálogo full-duplex con barge-in: al evaluar cada trama de 40 ms, permite reaccionar a pausas breves y gestionar interrupciones sin esperar un silencio prolongado.
- Transcripción con segmentación de turnos: combinado con kikimimi, permite trocear el flujo de reconocimiento en intervenciones coherentes para subtitulado o actas de reuniones en japonés.
- Robots sociales y kioscos interactivos: al ser un modelo de 463 mil parámetros y 1,8 MB, puede ejecutarse en el propio dispositivo (edge) junto al ASR, sin depender de la nube.
- Investigación en turn-taking: sirve como línea base ligera y reproducible para comparar estrategias de detección de fin de turno con métricas de prematurez y latencia mediana.
- Evaluación de pipelines ASR + diálogo: permite medir el impacto del error del ASR en la decisión de turno, ya que el modelo consume directamente la salida de kikimimi.

## Benchmarks y rendimiento

Evaluación del autor sobre unas 30 horas de vídeo no usadas en entrenamiento (aproximadamente 320 mil pausas, de las cuales unas 15 mil son fines de turno), comparando con la regla de responder tras un silencio fijo:

| Metodo | Tasa de respuestas prematuras | Latencia mediana tras fin de turno |
|---|---|---|
| Silencio de 0,52 s | 4,1 % | 0,52 s |
| Silencio de 0,80 s | 1,2 % | 0,80 s |
| kirime (umbral 0,6) | 2,9 % | 0,28 s |
| kirime (umbral 0,7) | 1,5 % | 0,72 s |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la información disponible, lo cual es esperable dado que el modelo no es un LLM.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB; los pesos ocupan aproximadamente 1,8 MB y el estado recurrente es mínimo.
- GPU recomendadas: no requiere GPU; cualquier CPU moderna es suficiente para inferir cada 40 ms. Una GPU consumer (por ejemplo, RTX 4090) solo tendría sentido si se comparte con el ASR kikimimi en el mismo pipeline.
- Cabe en cualquier GPU consumer e incluso en dispositivos embebidos; el cuello de botella real será el ASR de entrada, no kirime.
- Opciones de despliegue: el repositorio incluye código Python (`kirime.KirimeStream`, `load`) y un script `run_with_kikimimi.py` con soporte de micrófono y de archivo WAV; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: la decisión se emite cada 40 ms por diseño; la latencia mediana de detección tras el fin de turno es de 0,28 s con umbral 0,6 y 0,72 s con umbral 0,7. No se publican cifras de throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kirime | 463.233 | por trama de 40 ms, con estado | Detección de fin de turno en japonés | CC BY 4.0 | Hugging Face (Yakimask/kirime) |
| kikimimi-hiragana-9m | no disponible (nombre sugiere ~9M) | no disponible | ASR en hiragana para japonés | CC BY 4.0 | Hugging Face (yakimask/kikimimi-hiragana-9m) |
| Regla de silencio fijo (línea base) | 0 | no aplica | Detección de fin de turno por temporizador | no aplica | Implementación trivial |

No se dispone de información sobre otros detectores de fin de turno comparables en la documentación proporcionada; la comparativa con alternativas específicas de la misma categoría queda como no disponible.

## Limitaciones y advertencias

- No distingue hablantes: se entrenó sin separación por interlocutor, por lo que no diferencia entre una pausa larga del mismo hablante y el cambio de turno a otra persona.
- Dependencia del ASR: hereda los errores de kikimimi y se degrada con ruido, música o sonidos que el ASR no reconoce bien.
- Desfase del último carácter: kikimimi puede emitir el último carácter de un segmento con retraso; el script de ejemplo agrupa los caracteres que llegan hasta 0,5 s después de la detección como continuación de la misma emisión.
- Dominio de entrenamiento: los datos provienen de vídeos de YouTube, mayoritariamente monólogo, no de conversaciones reales entre dos personas, lo que puede limitar la generalización a diálogos interactivos.
- Sesgos: no se documentan análisis de sesgos demográficos, de género o de acento; el corpus YODAS2 condiciona la distribución de hablantes y estilos.
- Riesgo de falsos positivos y negativos: con umbral 0,6 la tasa de respuestas prematuras es del 2,9 %; con umbral 0,7 baja al 1,5 % a costa de una latencia mediana de 0,72 s.
- Licencia: CC BY 4.0 permite uso comercial con atribución; debe citarse al autor, el corpus YODAS2 (CC BY 3.0, Li et al., ASRU 2023) y kikimimi (CC BY 4.0).
- Madurez: repositorio con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Yakimask/kirime
- ASR de entrada kikimimi-hiragana-9m: https://huggingface.co/yakimask/kikimimi-hiragana-9m
- Dataset YODAS2: https://huggingface.co/datasets/espnet/yodas2
- Paper de YODAS (Li et al., ASRU 2023): no disponible como enlace directo en la información proporcionada
