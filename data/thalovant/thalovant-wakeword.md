# thalovant/thalovant-wakeword

## Resumen

Thalovant-wakeword es un detector de palabra de activación (wake word) para el término "Thalovant", desarrollado por thalovant para el asistente de voz OpenVoiceOS y su satélite Thalovant. No es un modelo de lenguaje generativo, sino una cabeza de clasificación de audio de 0,9 MB en formato ONNX, entrenada con la herramienta wakeforge sobre las características de streaming del extractor TigreGotico/wakehubert-tiny en cuantización int8. Sustituye a openWakeWord en el ecosistema OVOS mediante el plugin ovos-ww-plugin-wakeforge.

El modelo resuelve un problema muy concreto: la detección fiable y de baja latencia de una palabra clave en audio continuo, multilingüe y con múltiples acentos. Admite las pronunciaciones del término en francés, inglés, español, italiano, alemán, neerlandés, polaco, portugués y rumano, y se ha entrenado con voces sintéticas y conversiones de voz sobre hablantes reales.

Es relevante por su enfoque de ingeniería orientado a producción: umbral calibrado sobre horas de audio de desarrollo, evaluación con conjuntos retenidos por hablante o por voz, y métricas explícitas de falsos positivos por hora, recall y latencia. Todo el pipeline es ligero (5,1 ms de CPU por segundo de audio) y desplegable en dispositivos de bajos recursos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabeza de clasificación de audio: dos cabezas GRU promediadas sobre características de wakehubert-tiny (int8) |
| Parametros totales | no disponible (pesos ONNX de 0,9 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (clasificación por ventanas de audio; puntuación cada 80 ms con debounce de 2 s) |
| Tipos de cuantizacion | int8 (extractor de características); pesos del modelo en ONNX |
| Idiomas soportados | fr, en, es, pt, it, de, nl, pl, ro |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo es una cabeza de clasificación binaria compuesta por dos cabezas GRU, entrenadas por separado (con y sin clips de conversión de voz) y posteriormente promediadas. La salida promediada se calibra para que la puntuación sea interpretable como probabilidad. Opera sobre las características de streaming extraídas por TigreGotico/wakehubert-tiny en int8, y los metadatos del propio modelo ONNX indican al plugin qué extractor de características debe descargar y con qué revisión fijada, además del umbral por defecto.

El entrenamiento usó 10.152 clips positivos sintéticos de 2.813 voces que superaron un filtro fonético, procedentes de OmniVoice (incluidas voces infantiles), edge-tts, Piper, Kokoro/StyleTTS2, PocketTTS, Supertonic, Magpie y Google, además de conversiones de voz Chatterbox sobre hablantes de MLS y LibriSpeech. Los negativos incluyen habla de MLS y LibriSpeech (CC BY 4.0), AudioSet (CC BY 4.0) y respuestas de sala del MIT IR survey. Se añadieron negativos duros: truncamientos (Thalo, Talo, Lovant) y palabras y frases fóneticamente similares en siete idiomas. La época de cada cabeza se seleccionó sobre el conjunto de desarrollo. La versión v2 corrige el problema de v1, cuyos negativos duros incluían imitaciones inventadas de la palabra que provocaban el rechazo de acentos completos.

## Capacidades

- Detección de la palabra de activación "Thalovant" en audio continuo, con puntuación cada 80 ms y debounce de 2 s.
- Soporte de múltiples pronunciaciones por idioma: francés "ta-lo-VAN", español, italiano, alemán, neerlandés, polaco y portugués "ta-lo-VANT", inglés "THAL-o-vant" o "TAL-uh-vunt".
- Clasificación de audio (pipeline audio-classification) con salida calibrada como probabilidad.
- Integración nativa con OpenVoiceOS mediante ovos-ww-plugin-wakeforge (>= 0.18.0a1) y con el satélite thalovant-voice (>= 0.10.0).
- Umbral configurable por el usuario para ajustar el compromiso entre falsos positivos y recall.
- Inferencia de bajos requisitos: 5,1 ms de CPU por segundo de audio.
- No soporta tool calling, agentes, generación de texto, visión ni razonamiento; es exclusivamente un detector de keyword spotting.

## Casos de uso

- Asistente de voz doméstico con OpenVoiceOS: el modelo se carga como hotword en mycroft.conf y sustituye a openWakeWord; su bajo coste de CPU (5,1 ms por segundo de audio) permite ejecutarlo de forma continua en una Raspberry Pi o un mini-PC sin afectar al resto del sistema.
- Satélite de voz dedicado (Thalovant satellite): se configura la ruta al archivo ONNX en el bloque wake del YAML del satélite, con detección en el propio dispositivo antes de enviar audio a la nube.
- Activación multilingüe en entornos mixtos: al aceptar las pronunciaciones en nueve idiomas, un mismo dispositivo puede usarse en hogares donde conviven francés, español, inglés o portugués sin reentrenar el detector.
- Despliegue en hardware embebido: el tamaño de 0,9 MB y el formato ONNX permiten incluirlo en imágenes de firmware o contenedores mínimos, con descarga única a ~/.local/share/wakeforge/thalovant.onnx.
- Sistemas de activación con requisitos estrictos de falsos positivos: el umbral por defecto de 0,704 ofrece 0,41 falsos despertares por hora sobre 70,4 h de habla continua de hablantes no vistos; umbrales más altos (0,830) reducen la tasa a 0,24/h a costa de recall.
- Evaluación y ajuste por parte de integradores: los informes eval.json y plugin_validation.json permiten reproducir las métricas y recalibrar el umbral para un dominio acústico concreto (por ejemplo, una sala ruidosa o un micrófono de array).
- Investigación en keyword spotting: sirve como referencia reproducible de un pipeline wakeforge completo (extractor HuBERT tiny int8 + cabezas GRU + calibración) para comparar con openWakeWord u otros detectores.

## Benchmarks y rendimiento

Todas las cifras proceden de audio no visto en entrenamiento, retenido por hablante o por voz, según la model card.

Falsos despertares a umbral por defecto (0,704) sobre 70,4 h de habla continua de hablantes no vistos (MLS, LibriSpeech) más AudioSet; puntuación cada 80 ms con debounce de 2 s:

| Idioma | Horas | Falsos despertares/h |
|---|---|---|
| de | 14,3 | 0,28 |
| en (limpio) | 5,4 | 0,19 |
| en (otro) | 5,3 | 1,12 |
| es | 10,0 | 0,30 |
| fr | 10,1 | 0,20 |
| it | 5,3 | 0,76 |
| nl | 12,8 | 0,24 |
| pl | 2,1 | 0,93 |
| pt | 3,7 | 0,80 |
| AudioSet | 1,4 | 0,73 |
| **Global** | **70,4** | **0,41** |

Recall a umbral por defecto (clips reproducidos tras 3 s de silencio o tras 3 s de habla de otras personas; solo se cuentan clips confirmados por un modelo de fonemas):

| Conjunto de prueba | Tras silencio | Tras habla |
|---|---|---|
| 15 voces edge-tts excluidas del entrenamiento (fr-CA, fr-CH, en ×6, es-MX, es-AR, pt-BR, it, de ×2, nl) | 97 % | 86 % |
| 324 clips OmniVoice de hablantes nunca entrenados | 98 % | 90 % |
| 461 clips con conversión de voz sobre hablantes reales MLS/LibriSpeech no vistos | 95 % | 89 % |

Otras métricas reportadas:

- Falsos positivos en palabras similares: acepta el 3,3 % de 302 clips retenidos tras silencio y el 2,3 % tras habla; todos corresponden a "Gallivant", "Tell of a van", "Thalova" francés o "T'as la vente". Palabras comunes como Relevant, Tolerant, Elephant, Talent, Levante, "le vent" y "tal vez" nunca se aceptan.
- Latencia: mediana de 10 ms antes del final del sonido final de la palabra, y 118 ms después en p90. A través del plugin con trozos de 2048 muestras de OVOS, la mediana es de 76 ms después del final.
- Dentro de OVOS: con 30 minutos de habla, ruido y silencio mezclados, a trozos de 1280, 1600, 2048 y 4096 muestras, detectó 131-132 de 164 palabras de activación (colocadas sin pausa posterior), aceptó 2 de 79 casi-aciertos y no se activó con nada más.

No se han publicado comparaciones directas con openWakeWord u otros detectores en la información disponible.

## Requisitos de hardware

- VRAM: no aplica; el modelo es una cabeza ONNX de 0,9 MB que se ejecuta en CPU. El extractor wakehubert-tiny int8 añade una huella mínima no cuantificada en la información disponible.
- GPU: no es necesaria. Cualquier CPU moderna sirve; el coste medido es de 5,1 ms de CPU por segundo de audio.
- Cabe en cualquier dispositivo consumer, incluidas Raspberry Pi y placas SBC de gama baja.
- Despliegue: plugin ovos-ww-plugin-wakeforge (>= 0.18.0a1) en OpenVoiceOS, o carga directa del ONNX en el satélite thalovant-voice (>= 0.10.0). Descarga con hf download thalovant/thalovant-wakeword thalovant.onnx --revision v2 --local-dir ~/.local/share/wakeforge.
- Latencia: mediana de 10 ms antes del final del sonido final de la palabra; 118 ms después en p90; 76 ms de mediana a través del plugin con trozos de 2048 muestras.
- Throughput: no disponible de forma explícita; el coste de 5,1 ms de CPU por segundo de audio implica un factor de tiempo real superior a 190× en una sola CPU.

## Comparativa con modelos similares

| Modelo | Tipo | Tamaño | Idiomas | Licencia | Formato | Métricas publicadas |
|---|---|---|---|---|---|---|
| thalovant/thalovant-wakeword | Cabeza GRU sobre wakehubert-tiny int8 | 0,9 MB | 9 | Apache 2.0 | ONNX | 0,41 falsos/h; recall 86-98 % |
| openWakeWord | Detector de wake word (referencia del ecosistema OVOS) | no disponible | no disponible | no disponible | no disponible | no disponible en la información proporcionada |
| TigreGotico/wakehubert-tiny | Extractor de características base | no disponible | no disponible | no disponible | no disponible | no disponible en la información proporcionada |

La comparación con openWakeWord no puede cuantificarse porque la información disponible no incluye sus métricas ni especificaciones. La ventaja documentada de thalovant-wakeword frente a openWakeWord en OVOS es la integración mediante el plugin wakeforge y la calibración explícita del umbral con métricas publicadas.

## Limitaciones y advertencias

- Es un detector de palabra clave, no un modelo de lenguaje: no genera texto, no razona y no admite tool calling ni agentes.
- La tasa de falsos positivos varía mucho por idioma: 1,12/h en inglés no limpio, 0,93/h en polaco y 0,80/h en portugués, frente a 0,19/h en inglés limpio. En dominios con mucho ruido o acentos no cubiertos puede degradarse.
- El recall tras habla de otras personas baja al 86 % en las voces edge-tts retenidas, frente al 97 % tras silencio; en entornos con conversación solapada la detección es menos fiable.
- Acepta un 3,3 % de casi-aciertos tras silencio ("Gallivant", "Tell of a van", "Thalova", "T'as la vente"), lo que puede provocar activaciones no deseadas en conversaciones que contengan esas frases.
- La versión v1 rechazaba acentos completos por negativos duros mal diseñados; debe usarse la etiqueta v2 (main) y no v1 en producción.
- El umbral por defecto (0,704) está calibrado sobre 26,4 h de habla de desarrollo; para dominios acústicos distintos conviene recalibrarlo con audio propio.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda conservar los avisos de licencia y verificar las licencias de los datos de entrenamiento subyacentes (MLS, LibriSpeech y AudioSet son CC BY 4.0).
- Depende de un extractor de características externo (wakehubert-tiny) que el plugin descarga en una revisión fijada; cambios en ese extractor podrían afectar al comportamiento.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en noviembre de 2026; no hay evidencia de adopción en producción más allá de las pruebas del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/thalovant/thalovant-wakeword
- Modelo base (extractor de características): https://huggingface.co/TigreGotico/wakehubert-tiny
- Herramienta de entrenamiento wakeforge: https://github.com/TigreGotico/wakeforge
- Plugin de OpenVoiceOS: https://pypi.org/project/ovos-ww-plugin-wakeforge/
- Informe de evaluación: https://huggingface.co/thalovant/thalovant-wakeword/blob/main/eval.json
- Validación del plugin: https://huggingface.co/thalovant/thalovant-wakeword/blob/main/plugin_validation.json
