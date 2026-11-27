# Strij911/SpeechExpert-Wav2Vec2-Deepfake

## Resumen

SpeechExpert-Wav2Vec2-Deepfake es un clasificador binario de audio disenado para detectar senales de voz sintetica (deepfakes de audio y speech spoofing). Lo publica el usuario Strij911 bajo el paraguas del proyecto Speech Expert, y se distribuye como un unico artefacto ONNX autocontenido de 6,45 millones de parametros. El modelo toma una frase de habla en mono a 16 kHz y devuelve dos probabilidades softmax en el orden `[orig, synth]`, de modo que `probs[0, 1]` actua como puntuacion de sinteticidad para la frase completa.

Tecnicamente es una adaptacion compacta de wav2vec2: un encoder de solo cuatro capas, seguido de pooling de media y desviacion estandar sobre el eje temporal y una cabeza de clasificacion binaria. El entrenamiento combino habla natural y sintetica con aumento de datos por reproduccion (replay augmentation), una tecnica habitual para que el detector no dependa de artefactos de canal. El eje temporal es dinamico y acepta desde 400 hasta 480.000 muestras (25 ms a 30 s), con una frase por llamada.

Su relevancia practica es doble: por un lado ofrece un detector ligero que corre en CPU via onnxruntime sin dependencias de frameworks de deep learning; por otro, el autor advierte explicitamente de que este checkpoint es solo uno de los componentes del detector web de Speech Expert, que ademas comprueba la marca de agua de ElevenLabs. Es, por tanto, una pieza de senal acustica, no un verificador de autenticidad completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Wav2Vec2 compacto (encoder de 4 capas) + pooling de media y desviacion estandar + cabeza de clasificacion binaria |
| Parametros totales | 6.450.114 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | eje temporal dinamico; 400 a 480.000 muestras (25 ms a 30 s) por frase |
| Tipos de cuantizacion | no disponible (se distribuye un unico `model.onnx` en Float32) |
| Idiomas soportados | no disponible (el autor no declara idiomas; la tarea es deteccion acustica, no transcripcion) |
| Licencia | no disponible |
| Formato de pesos | ONNX (IR 8, opset 17), fichero unico `model.onnx` de 25.900.262 bytes |
| Frecuencia de muestreo | 16 kHz, mono, Float32 |
| Interfaz de entrada/salida | `waveform` `[1, samples]` Float32 -> `probs` `[1, 2]` Float32 en orden `[orig, synth]` |
| SHA-256 del artefacto | `661d8da3976acc4b5226472906a568d0db8a4b739fce6a0d082d724d42871c6b` |

## Arquitectura y entrenamiento

El modelo es un encoder wav2vec2 reducido a cuatro capas que procesa la forma de onda cruda, sin extractor de caracteristicas acusticas externo. Sobre las representaciones del encoder se aplica un pooling que concatena la media y la desviacion estandar a lo largo del eje temporal, lo que colapsa la secuencia variable en un vector fijo independiente de la duracion de la frase. Ese vector alimenta una cabeza lineal de dos clases con salida softmax ya aplicada, por lo que el consumidor no necesita normalizar las puntuaciones.

El entrenamiento uso habla natural y sintetica con replay augmentation, es decir, reinyeccion de las muestras a traves de canales o condiciones de reproduccion para forzar al modelo a aprender artefactos de sintesis y no de grabacion. La model card no detalla el numero de tokens, horas de audio, composicion exacta del dataset ni si hubo etapas de ajuste fino adicionales; esos datos figuran como no disponibles. La seleccion del checkpoint se hizo sobre un conjunto de validacion de 5.999 grabaciones.

## Capacidades

- Clasificacion binaria de una frase de habla como original o sintetica, con puntuacion continua de sinteticidad.
- Deteccion de speech spoofing y audio deepfake en voz generada por sintesis.
- Inferencia sobre forma de onda cruda a 16 kHz, sin pipeline de features externo.
- Eje temporal dinamico: admite entradas de 25 ms a 30 s en una sola llamada.
- Ejecucion en CPU mediante onnxruntime, con un unico fichero ONNX sin grafo externo de pesos.
- Salida calibrada como probabilidad softmax por clase, apta para umbralizar directamente.
- No soporta tool calling, function calling, agentes, vision, audio de entrada multimodal ni generacion de texto: es exclusivamente un clasificador de audio.

## Casos de uso

- Moderacion de contenido en plataformas de audio: puntuar cada clip subido con `probs[0, 1]` y derivar a revision humana los que superen un umbral ajustado al trafico real de la plataforma.
- Verificacion de notas de voz en banca o seguros: como senal adicional en un flujo antifraude, marcando locuciones sinteticas antes de aceptar una instruccion telefonica.
- Filtrado previo en datasets de ASR: descartar muestras sinteticas antes de entrenar o evaluar modelos de reconocimiento de habla, reduciendo contaminacion del corpus.
- Analisis forense de primera linea: triaje rapido de grabaciones aportadas como prueba, enviando a analisis especializado solo las que obtengan puntuaciones ambiguas.
- Deteccion de abuso de clonacion de voz: monitorizar locuciones de un hablante concreto y alertar cuando aparezcan clips sinteticos que suplanten su identidad.
- Integracion en pipelines de ingestion de medios: procesar por frase los audios de un CMS o archivo sonoro y etiquetar automaticamente los segmentos sospechosos con metadatos de riesgo.
- Servicio de API ligero: al ser un ONNX de 25,9 MB ejecutable en CPU, permite desplegar un endpoint de scoring sin GPU y con latencia baja por frase.

## Benchmarks y rendimiento

Resultados publicados por el autor bajo el protocolo historico de evaluacion, que recortaba el silencio inicial y final y promediaba cinco recortes de 2 segundos sobre un conjunto de validacion de 5.999 grabaciones usado para seleccionar el checkpoint:

| Metrica | Valor |
|---|---|
| ROC AUC | 97,56 % |
| EER | 7,70 % |
| Exactitud (umbral 0,5) | 91,63 % |
| Conjunto de evaluacion | 5.999 grabaciones (seleccion de checkpoint) |

El propio autor advierte de que se trata de resultados de seleccion de checkpoint y de que el rendimiento y la calibracion en inferencia sobre frase completa requieren una evaluacion separada con datos representativos. No se han publicado comparaciones con otros detectores en la informacion disponible.

## Requisitos de hardware

- VRAM: no requiere GPU; el modelo esta pensado para CPU via `CPUExecutionProvider` de onnxruntime.
- Huella en disco: 25,9 MB (`model.onnx`) mas el `config.json`.
- Memoria RAM: el tensor de entrada maximo es de 480.000 muestras Float32 (aproximadamente 1,9 MB), por lo que la inferencia cabe holgadamente en cualquier equipo.
- GPU recomendadas: no aplica; opcionalmente puede ejecutarse con `CUDAExecutionProvider` o `TensorrtExecutionProvider` si el entorno lo soporta, sin que el autor documente ganancias.
- Cabe en cualquier GPU consumer y en CPU de portatil; no necesita aceleracion dedicada.
- Opciones de despliegue: onnxruntime (Python, C++, C#, Java, JS), ONNX Runtime Server, o conversion a otros runtimes ONNX compatibles. No se distribuye en GGUF ni en formato para llama.cpp, Ollama, vLLM o TGI, que no son aplicables a este tipo de modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada; dependen del hardware y de la duracion de la frase.

## Comparativa con modelos similares

No se han publicado en la informacion disponible comparaciones con otros detectores de deepfake de audio, ni el autor referencia alternativas. Los modelos habituales de la categoria (detectores basados en AASIST, RawNet2 o wav2vec2 de mayor tamano) no aparecen citados en la model card, por lo que no se ofrece tabla comparativa con datos verificables.

| Modelo | Parametros | Contexto de audio | Licencia | Formato |
|---|---|---|---|---|
| SpeechExpert-Wav2Vec2-Deepfake | 6,45 M | 25 ms - 30 s por frase | no disponible | ONNX |
| Alternativas de la categoria | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El resultado es una senal para revision, no una prueba de autenticidad: no determina quien hablo, que sistema genero el clip ni si la grabacion es autentica.
- El autor advierte de errores con generadores no vistos, codecs, condiciones de grabacion distintas y clips cortos o mixtos.
- La calibracion bajo inferencia de frase completa no esta validada; los umbrales deben probarse sobre datos representativos del caso de uso.
- Las metricas publicadas corresponden a seleccion de checkpoint con recortes de 2 segundos, no al modo de inferencia documentado para produccion.
- No se declara licencia, por lo que el uso comercial queda sin marco legal explicito hasta confirmacion del autor.
- No se declaran idiomas soportados; el rendimiento en lenguas distintas a las del entrenamiento no esta caracterizado.
- El modelo standalone no comprueba marcas de agua (el detector web de Speech Expert si lo hace con ElevenLabs), de modo que su cobertura frente a sintesis marcada es parcial.
- Riesgo de sesgo por dominio: al entrenarse con un conjunto no documentado de generadores y condiciones de reproduccion, puede sobrerreaccionar o infravalorar familias de sintesis ausentes del entrenamiento.
- No apto para generacion de texto, razonamiento, codigo ni tareas multimodales; cualquier uso fuera de clasificacion de audio carece de sentido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Strij911/SpeechExpert-Wav2Vec2-Deepfake
- Detector web de Speech Expert (herramienta del autor): https://speech-expert.ru/free-tools/voice-deepfake/
- Documentacion de onnxruntime: https://onnxruntime.ai/
- Documentacion de huggingface_hub: https://huggingface.co/docs/huggingface_hub
