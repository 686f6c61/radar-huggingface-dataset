# xav-ie/computah

## Resumen

Computah es un modelo de detección de palabra de activación (wake word) desarrollado por xav-ie y publicado en Hugging Face. No es un modelo de lenguaje: es un clasificador de audio en streaming que se activa al detectar la palabra "Computah" (la palabra inglesa "computer" pronunciada sin la vibrante final). Está construido sobre la arquitectura MixedNet del proyecto microWakeWord y se distribuye como un fichero TensorFlow Lite cuantizado de apenas 61 KB, pensado para ejecutarse en dispositivos de voz de baja potencia como los satélites ESPHome, el linux-voice-assistant de Home Assistant y otros satélites compatibles con Wyoming.

Su relevancia es práctica y muy acotada: permite añadir una wake word personalizada a un asistente doméstico sin depender de los modelos genéricos preentrenados, con un consumo de recursos mínimo y una latencia compatible con detección continua en dispositivos embebidos. El modelo es monolingüe (inglés) y su conjunto de ejemplos positivos es íntegramente sintético, generado con Piper y voces de LibriTTS-R, lo que limita su fiabilidad en hablantes reales con acentos o en condiciones de campo lejano.

La ficha se centra, por tanto, en las especificaciones de despliegue, el rendimiento medido en las pruebas de streaming del propio proyecto y las advertencias sobre su alcance, más que en capacidades generativas, que este modelo no posee.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MixedNet de microWakeword (red neuronal para clasificación de audio en streaming) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de 5 frames con paso de características de 10 ms |
| Tipos de cuantización | modelo cuantizado en TensorFlow Lite (61 KB); esquema de cuantización no especificado |
| Idiomas soportados | inglés (en) |
| Licencia | CC BY 4.0 |
| Formato de pesos | TFLite (`model/computah.tflite`) más manifiesto JSON (`model/computah.json`) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura MixedNet de microWakeword, diseñada para clasificación de audio en streaming con bajo coste computacional. El manifiesto que acompaña al modelo fija un umbral de corte (`probability_cutoff`) de 0,94, un paso de características de 10 ms y una ventana de 5 frames. El resultado es un fichero TFLite cuantizado de 61 KB que procesa el flujo de audio de forma incremental, apto para microcontroladores y dispositivos embebidos.

El entrenamiento se realizó con 10.200 clips sintéticos de "computah" y cinco variantes ortográficas ("computa", "kum pew tah", etc.) generados con Piper, y 6.000 negativos difíciles también sintéticos con 20 palabras de sonido parecido ("commuter", "compute", "Jupiter", "potato", etc.). Se aplicaron aumentaciones de datos basadas en respuestas de impulso de sala (MIT), música de fondo (FMA xsmall), ecualización, distorsión, cambio de tono, ruido y ganancia. Como conjuntos negativos adicionales se usaron los conjuntos `speech`, `dinner_party` y `no_speech` de microWakeword. El entrenamiento se ejecutó durante 10.000 pasos con el script `training/train.py`; los parámetros completos están en `results/training_parameters.yaml`. No se documenta uso de RLHF ni DPO, algo esperable en un clasificador de este tipo.

## Capacidades

- Detección de la wake word "Computah" en flujo de audio continuo, en modo streaming.
- Ejecución en dispositivos con recursos muy limitados: ESPHome, linux-voice-assistant y satélites Wyoming.
- Umbral de activación configurable mediante el campo `probability_cutoff` del manifiesto, lo que permite ajustar el compromiso entre falsos positivos y omisiones.
- Integración directa con el ecosistema Home Assistant y microWakeword.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión ni audio generativo.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- Capacidad multilingüe inexistente: solo inglés.

## Casos de uso

- Asistente de voz doméstico con wake word personalizada: se coloca el par `computah.tflite` y `computah.json` en una carpeta y se apunta el satélite a ella con `--wake-word-dir ./model --wake-model computah`, de modo que el dispositivo activa el asistente al oír "Computah" sin usar las wake words genéricas del fabricante.
- Sustitución de wake words predefinidas en Home Assistant: útil cuando el usuario quiere una palabra concreta, con marca personal o más natural en su entorno, manteniendo el resto del pipeline de voz de Home Assistant.
- Prototipado de asistentes de voz en ESPHome: el tamaño de 61 KB permite incluirlo en dispositivos con memoria flash limitada, lo que facilita iterar sobre la palabra de activación sin cambiar de hardware.
- Despliegue en satélites Wyoming de bajo consumo: el modelo se ejecuta en el mismo tipo de dispositivos que cualquier modelo microWakeword, por lo que sirve para validar una wake word propia antes de comprometerse con un modelo comercial.
- Investigación sobre detección de wake words: el repositorio incluye scripts de generación de datos (`training/generate.sh`), preprocesado (`training/prep.py`) y entrenamiento (`training/train.py`), lo que permite reproducir el pipeline completo con un GPU NVIDIA, podman con CDI y unos 45 GB de disco.
- Ajuste del compromiso precisión/recall en producción: modificando `probability_cutoff` en el manifiesto se puede pasar de 0,00 falsos positivos por hora (con 18,4 % de omisiones a 0,99) a 1,31 falsos positivos por hora (con 8,3 % de omisiones a 0,90), según las necesidades del entorno.

## Benchmarks y rendimiento

Resultados publicados en `results/tflite_streaming_roc.txt`, medidos con la prueba de streaming de microWakeword sobre clips sintéticos reservados (omisiones) y el conjunto `dinner_party_eval` (falsos positivos):

| Umbral de corte | Omisiones | Falsos positivos por hora |
|---|---|---|
| 0,99 | 18,4 % | 0,00 |
| 0,97 | 13,8 % | 0,38 |
| **0,94** (configuración enviada) | **10,4 %** | **0,56** |
| 0,90 | 8,3 % | 1,31 |

No se han publicado resultados de benchmarks estándar de reconocimiento de voz (WER, etc.) en la información disponible, ya que no aplican a un clasificador de wake word.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo corre en CPU y está pensado para dispositivos embebidos.
- GPU recomendadas: no se requiere GPU para inferencia. Para reentrenar se necesita una GPU NVIDIA, podman con CDI y unos 45 GB de disco.
- Cabe en cualquier dispositivo compatible con microWakeword, incluidos microcontroladores con ESPHome; el fichero TFLite ocupa 61 KB.
- Opciones de despliegue: linux-voice-assistant (`--wake-word-dir` y `--wake-model`), ESPHome y satélites Wyoming; el runtime es TensorFlow Lite.
- Latencia y throughput: no disponibles de forma explícita; el paso de características es de 10 ms y la ventana de decisión de 5 frames, lo que implica una latencia de decisión del orden de decenas de milisegundos, aunque el dato exacto no está publicado.

## Comparativa con modelos similares

| Modelo | Tipo | Tamaño | Idioma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Computah (xav-ie) | Wake word microWakeword (TFLite) | 61 KB | Inglés | CC BY 4.0 | Hugging Face |
| Wake words predefinidas de microWakeword | Wake word microWakeword | no disponible | Inglés | según modelo | Repositorio microWakeword |
| Wake words de ESPHome | Wake word para ESPHome | no disponible | Inglés | según modelo | Integración ESPHome |
| openWakeWord | Wake word | no disponible | Inglés | según modelo | Repositorio openWakeWord |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada; la comparación se limita a tipo, tamaño, idioma, licencia y disponibilidad.

## Limitaciones y advertencias

- Todos los ejemplos positivos de entrenamiento son voces sintéticas (Piper, hablantes de LibriTTS-R); no se ha medido el rendimiento con hablantes reales más allá de una prueba anecdótica con un único hablante en un micrófono de escritorio (cuatro intentos, cuatro aciertos).
- No se han medido acentos ni condiciones de campo lejano (far-field), lo que hace arriesgado su uso en salas grandes o con ruido ambiental.
- Solo inglés; no admite otras lenguas ni pronunciaciones no contempladas en el entrenamiento.
- Riesgo de omisiones del 10,4 % en la configuración enviada (umbral 0,94), que puede reducirse bajando el umbral a costa de más falsos positivos.
- El manifiesto y el modelo deben tener nombres coherentes (`computah.json` y `computah.tflite`); si difieren, el satélite descarta el modelo sin avisar y la wake word nunca se activa.
- Licencia CC BY 4.0: permite uso comercial con atribución ("Computah wake word by xav-ie"); las voces de entrenamiento provienen de LibriTTS-R vía Piper (CC BY 4.0), los negativos de los conjuntos de microWakeword y FMA, cada uno bajo su propia licencia.
- Un reentrenamiento produce un modelo equivalente, no idéntico byte a byte, debido a la aleatoriedad en la generación de muestras, el aumento de datos y el entrenamiento en GPU.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria adicional.

## Enlaces

- Hugging Face: https://huggingface.co/xav-ie/computah
- microWakeword (repositorio base): https://github.com/kahrendt/microWakeWord
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
- Documentación de linux-voice-assistant y Wyoming: no disponible en la información proporcionada.
