# thebluescreen/oaf-drums-onnx

## Resumen

oaf-drums-onnx es una conversión a formato ONNX del modelo de transcripción de batería (drums) de Onsets and Frames, desarrollado originalmente por Magenta (Callender, Hawthorne y Engel). El modelo realiza transcripción de batería con estimación de velocidad (velocity), es decir, convierte una señal de audio en eventos de percusión con su instante de ataque y su intensidad. La conversión la firma el usuario thebluescreen y está pensada para su ejecución mediante onnxruntime.

El modelo fue entrenado sobre el Expanded Groove MIDI Dataset (E-GMD), con 444 horas de audio de batería aislada, lo que lo hace especialmente adecuado para audio que contiene únicamente batería (grabación de e-kit, stem de batería o loop). Reconoce ocho alturas concretas: 36, 38, 48, 42, 51, 53, 49 y 75, correspondientes a bombo, caja, tom, charles cerrado, ride, campana de ride, crash y clave.

Su relevancia es fundamentalmente práctica: empaqueta un modelo de investigación de Magenta en un grafo ONNX autocontenido que incluye el cálculo del espectrograma log-mel (librosa, 250 bandas, 100 fotogramas por segundo) como parte de la propia gráfica, de modo que la entrada es directamente la forma de onda y la salida son probabilidades de onset y valores de velocidad. La conversión reproduce el grafo original de TensorFlow con un margen inferior a 1e-3 (medido 4e-5).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de transcripción de audio basada en espectrograma log-mel con ramas de onset y velocity (familia Onsets and Frames); conversión ONNX del checkpoint E-GMD de Magenta |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; entrada de audio `[1, samples]` float32 mono a 44,1 kHz, mínimo 2049 muestras |
| Tipos de cuantizacion | no disponible (se distribuye el grafo ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (modelo de audio, no de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`.onnx`), ejecutable con onnxruntime |

## Arquitectura y entrenamiento

Se trata de una conversión del checkpoint E-GMD del modelo de batería de Onsets and Frames de Magenta. La arquitectura conserva únicamente las ramas de onset y de velocity, es decir, las dos cabezas que producen, respectivamente, la probabilidad de ataque y la intensidad de cada golpe. El preprocesado de audio forma parte del grafo: el modelo calcula internamente un espectrograma log-mel con librosa de 250 bandas a 100 fotogramas por segundo, por lo que el consumidor solo debe entregar la forma de onda.

El entrenamiento se realizó sobre el Expanded Groove MIDI Dataset (E-GMD), un corpus de 444 horas de audio de batería aislada, lo que explica el comportamiento óptimo del modelo sobre material de una sola batería (grabación de e-kit, stem o loop) y no sobre mezclas completas. La conversión mantiene la fidelidad numérica respecto al grafo original de TensorFlow restaurado desde el mismo checkpoint dentro de 1e-3, con un error medido de 4e-5. Los pesos se convirtieron con los scripts de Silly MIDI Tools ubicados en `scripts/drums/`, y el repositorio incluye NOTICE.md con la atribución y los cambios realizados.

## Capacidades

- Transcripción de audio de batería a eventos de percusión: genera probabilidades de onset y velocidad por cada una de las ocho alturas entrenadas.
- Detección de golpes mediante umbral: un golpe se considera tal cuando la probabilidad de onset supera 0,5.
- Estimación de velocidad: la intensidad se obtiene como `int(clip(v, 0, 1) * 127)`, lista para su uso como velocity MIDI.
- Preprocesado integrado: el espectrograma log-mel (librosa, 250 bandas, 100 fps) se calcula dentro del propio grafo ONNX.
- Salida temporal a 100 fotogramas por segundo, con forma `[1, samples // 441 + 1, 8]` para ambas salidas.
- Compatibilidad con onnxruntime como librería de referencia.
- No dispone de tool calling, capacidades de agente, razonamiento multi-paso ni soporte multilingüe, al no ser un modelo de lenguaje.
- Orientado a audio monofónico de una sola batería; no se documenta capacidad para separar batería dentro de una mezcla.

## Casos de uso

- Transcripción de grabaciones de batería electrónica: al estar entrenado sobre audio de batería aislada, convierte directamente la salida de un e-kit a eventos MIDI con velocidad, útil para capturar interpretaciones sin depender de la propia electrónica del kit.
- Extracción a MIDI de stems de batería: a partir de un stem ya separado, el modelo genera notas MIDI con instante e intensidad, lo que permite reeditar, cuantizar o sustituir la interpretación en el DAW.
- Análisis y etiquetado de bibliotecas de loops: procesar de forma masiva un catálogo de loops de batería para indexarlos por patrón, tempo o elementos presentes, aprovechando la salida a 100 fps.
- Integración en aplicaciones de audio a MIDI: el modelo está pensado para su uso dentro de herramientas como Silly MIDI Tools, donde el grafo ONNX autocontenido simplifica el despliegue al no requerir el cálculo externo del espectrograma.
- Producción musical y reemplazo de samples: transcribir una interpretación para volver a dispararla con otra librería de samples manteniendo las velocidades originales, lo que conserva la dinámica de la toma.
- Educación y transcripción asistida: convertir una práctica grabada en eventos MIDI para su revisión en un editor de partituras o piano roll, dado que el modelo reconoce las piezas habituales de un kit.
- Investigación en recuperación de información musical: emplear las probabilidades de onset y velocity como representación intermedia para tareas de análisis rítmico, evaluación de transcripción o generación condicionada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente documenta la fidelidad de la conversión frente al grafo original de TensorFlow, con una coincidencia dentro de 1e-3 y un error medido de 4e-5.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible como cifra concreta; al tratarse de un grafo ONNX de entrada de audio mono con espectrograma interno, la huella es reducida y muy inferior a la de los modelos de lenguaje.
- GPU recomendadas: no disponible. Cualquier GPU NVIDIA con soporte CUDA para onnxruntime debería ser suficiente; el modelo también puede ejecutarse en CPU.
- Compatibilidad con GPU de consumo: previsiblemente cabe en GPUs de consumo y en CPU, aunque no se documentan requisitos mínimos ni cifras de memoria.
- Opciones de despliegue: onnxruntime como runtime de referencia (integrable desde Python, C++ u otros enlaces disponibles); al ser un modelo de audio no aplican vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| oaf-drums-onnx (este modelo) | Onsets and Frames para batería, convertido a ONNX | Forma de onda mono, 44,1 kHz | Onset y velocity para 8 alturas, 100 fps | Apache 2.0 | HuggingFace, onnxruntime |
| Onsets and Frames de Magenta (original) | Modelo de transcripción de batería en TensorFlow | Forma de onda / espectrograma | Onset y velocity | Apache 2.0 | Repositorio de Magenta |
| Basic Pitch (Spotify) | Transcripción multipista ligera | Audio | Eventos de nota MIDI | no disponible en esta ficha | Proyecto de Spotify |
| MT3 (multi-instrument) | Transcripción multi-instrumento basada en secuencia | Audio | Eventos MIDI multi-instrumento | no disponible en esta ficha | Proyecto de investigación |

Los datos numéricos de los modelos alternativos (parámetros, contexto, métricas) no están disponibles en la información proporcionada y no se incluyen para evitar cifras no verificadas. La diferencia principal de este modelo frente a alternativas multipista es su especialización en batería aislada, con salida de velocidad además del onset.

## Limitaciones y advertencias

- Rendimiento óptimo solo sobre audio de batería aislada (e-kit, stem o loop); el modelo no está pensado para extraer la batería de una mezcla completa.
- Cobertura limitada a ocho alturas concretas (36, 38, 48, 42, 51, 53, 49 y 75); cualquier percusión fuera de ese conjunto no se transcribirá.
- La licencia Apache 2.0 permite uso comercial, pero el repositorio incluye un NOTICE.md con la atribución del trabajo original de Magenta que debe respetarse.
- La información disponible no documenta sesgos específicos del modelo, ni comportamiento detallado en distintos géneros, tempos o calidades de grabación.
- No se documentan límites de idioma (no aplica) ni requisitos de contexto; la restricción relevante es la de muestreo: mono, 44,1 kHz y un mínimo de 2049 muestras.
- No se publican métricas de precisión, recall ni F1 sobre conjuntos de evaluación, por lo que el rendimiento real en producción no puede estimarse a partir de la información disponible.
- La fecha de publicación declarada en el repositorio es posterior a la actual; conviene verificar la vigencia y el mantenimiento del artefacto antes de integrarlo.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/thebluescreen/oaf-drums-onnx)
- [Scripts de conversión Silly MIDI Tools](https://github.com/Sillybit-io/audio-to-midi-app)
- [Onsets and Frames de Magenta (modelo original)](https://github.com/magenta/magenta/tree/main/magenta/models/onsets_frames_transcription)
