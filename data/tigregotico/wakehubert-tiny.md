# TigreGotico/wakehubert-tiny

## Resumen

WakeHuBERT tiny es un extractor de características de voz en streaming de 0,64 millones de parámetros, desarrollado por TigreGotico y publicado en HuggingFace bajo licencia Apache 2.0. No es un modelo generativo ni un clasificador: convierte audio mono a 16 kHz en vectores de 128 dimensiones a 50 fotogramas por segundo, que después alimentan a un clasificador externo (por ejemplo, una GRU) encargado de detectar una palabra de activación o wake word. Es el extractor que hay detrás del featurizer `wakehubert` del proyecto wakeforge.

El problema que resuelve es concreto: permitir que un detector de wake word se entrene únicamente con voz sintética generada a partir de la palabra escrita como texto, sin necesidad de grabar miles de muestras reales. Para ello se destila de HuBERT-base, de forma que sus representaciones reproducen las capas 4, 8 y 12 del profesor, pero con una arquitectura estrictamente causal que puede ejecutarse en streaming sobre dispositivos modestos.

Su relevancia actual está en el nicho de keyword spotting embebido: el modelo es diminuto, se distribuye en formato ONNX (incluida una versión int8 estática) y su campo receptivo es de solo 2,5 segundos, lo que lo hace apto para escucha continua en CPU, microcontroladores de gama alta o módems móviles. La contrapartida es que la evidencia publicada se limita a una única wake word en inglés sobre un único benchmark, con resultados que aún no han sido replicados por terceros (0 descargas y 0 likes en el momento de redactar esta ficha).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Extractor convolucional causal: front end log-mel de 64 bins integrado en el grafo, convolucion con stride hasta 50 fps, ocho bloques de convolucion dilatada depthwise-separable de 256 canales, proyeccion 1x1 a 128 caracteristicas. Destilado de HuBERT-base |
| Parametros totales | 0,64 M |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | Campo receptivo de 2,5 s (40.000 muestras a 16 kHz); para streaming se recomienda mantener 40.000 muestras de contexto para que los fotogramas en linea coincidan con los offline |
| Tipos de cuantizacion | float32 (`wakehubert.onnx`) e int8 estatico (`wakehubert_int8.onnx`, con el front end en float; coincidencia media con float de coseno 0,998) |
| Idiomas soportados | no disponible como lista oficial. Entrenado con LibriSpeech (ingles), Multilingual LibriSpeech (siete idiomas) y una muestra equilibrada por idioma de Multilingual Spoken Words (41 idiomas); evaluacion publicada solo en ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

La arquitectura es puramente convolucional y causal: un front end log-mel fijo de 64 bins, una convolucion con stride que reduce la cadencia a 50 fotogramas por segundo, ocho bloques de convolucion dilatada depthwise-separable con 256 canales y una proyeccion 1x1 que devuelve 128 características por fotograma. Solo emplea convolucion, batch norm y ReLU, una eleccion deliberada para que el grafo cuantice bien a int8. El grafo ONNX recibe `waveform` de forma [batch, samples] en float32 a 16 kHz con rango -1..1 y devuelve `features` de forma [batch, samples // 320, 128]. El modelo es estrictamente causal: el fotograma *t* depende únicamente del audio anterior a la muestra 320·(t+1).

El entrenamiento consistió en 30.000 pasos de destilación desde `facebook/hubert-base-ls960`, prediciendo las capas 4, 8 y 12 estandarizadas del profesor con pérdida L1 más coseno log-sigmoid (el esquema de DistilHuBERT). El profesor escuchaba voz limpia mientras el alumno recibía la misma señal con ruido de AudioSet y MUSAN, reverberación de sala y entre uno y tres hablantes de fondo que nunca superaban el volumen de la voz principal; una cuarta parte de los elementos de entrenamiento eran sonidos no vocales idénticos para ambos. Además se enmascararon tramos del log-mel de entrada del alumno (probabilidad 0,065 por fotograma, tramos de 10 fotogramas), que según el autor fue la mayor ganancia individual en robustez. Los datos de voz fueron LibriSpeech (960 h), Multilingual LibriSpeech (siete idiomas) y una muestra equilibrada por idioma de Multilingual Spoken Words (41 idiomas), cortados en 600.000 fragmentos de dos segundos.

Como el alumno debe predecir cada fotograma de HuBERT cinco fotogramas (100 ms) después, sus características describen el habla con un retardo de unos 100 ms, de modo que un detector construido sobre ellas reacciona ese tiempo después de que termine la palabra.

## Capacidades

- Extraccion de caracteristicas de voz en streaming: convierte audio a 16 kHz en vectores de 128 dimensiones a 50 fps, de forma estrictamente causal.
- Front end log-mel integrado: no requiere calcular el espectrograma por separado, el grafo ONNX lo incluye.
- Inferencia en tiempo real con latencia acotada: retardo de aproximadamente 100 ms respecto al habla original.
- Base para deteccion de wake word entrenada con datos sinteticos: permite entrenar un clasificador con clips TTS de una palabra escrita como texto.
- Robustez a ruido y solapamiento: entrenado explicitamente con ruido de AudioSet y MUSAN, reverberacion y varios hablantes de fondo.
- Ejecucion en hardware modesto: 0,64 M de parametros, disponible en ONNX float32 e int8 estatico.
- No soporta tool calling, function calling, agentes, generacion de texto, codigo, matematicas, vision ni audio generativo: no es un modelo de lenguaje.
- Capacidades multilingues: no evaluadas; el entrenamiento incluye material de 41 idiomas, pero la unica evaluacion publicada es sobre una wake word en ingles.

## Casos de uso

- Deteccion de palabra de activacion en dispositivos de escucha continua: un clasificador ligero (por ejemplo, una GRU) entrenado sobre las caracteristicas de WakeHuBERT permite activar el asistente con un consumo minimo, ya que el extractor solo necesita 2,5 s de contexto y puede ejecutarse en CPU.
- Asistentes de voz en el borde (edge computing): al caber en el grafo ONNX y en version int8, el pipeline de activacion puede correr localmente en telefonos, altavoces inteligentes o gateways domesticos sin enviar audio a la nube.
- Dispositivos con bateria limitada: el coste computacional de un extractor de 0,64 M de parametros a 50 fps es compatible con microcontroladores de gama alta y SoCs de bajo consumo, lo que permite escucha permanente durante horas.
- Aplicaciones de privacidad: al no requerir conectividad para la fase de deteccion, el audio solo se transmite tras la activacion de la palabra clave, reduciendo la exposicion de datos personales.
- Creacion rapida de wake words personalizadas: gracias al entrenamiento con voz sintetica, un desarrollador puede definir una palabra nueva como texto, generar clips TTS con aumentos de ruido y entrenar un detector sobre este extractor sin grabar corpus reales.
- Activacion en productos multilingues en fase de prototipo: el extractor se entrenó con habla de 41 idiomas, por lo que sirve como punto de partida para explorar wake words en idiomas distintos del ingles, aunque no exista evaluacion publicada.
- Preprocesado en pipelines de speech: al ser un `feature-extraction` causal, puede encadenarse delante de clasificadores de emocion, comandos de voz o sistemas de diarizacion que necesiten representaciones compactas de 128 dimensiones.
- Control por voz en entornos ruidosos moderados: el entrenamiento con ruido y solapamiento permite mantener recall utilizable en condiciones de babble a 10 dB, adecuado para oficinas o vehiculos.

## Benchmarks y rendimiento

Los unicos datos publicados son los del autor de la model card. Se trata de ejecuciones unicas: un clasificador GRU entrenado solo con 900 clips sinteticos de "alexa" (voces TTS clonadas con conversion de voz, con ruido, babble, reverberacion, velocidad y ganancia) evaluado sobre los hablantes reales del benchmark de wake word de Picovoice (315 grabaciones). El umbral se fijo en audio de calibracion distinto (LibriSpeech dev-clean y babble derivado) para 0,5 activaciones falsas por hora, y despues se midieron las activaciones falsas sobre 6,5 h de streams reservados.

| Extractor | Recall en silencio (intervalo del 95%) | Recall con babble a 10 / 5 / 0 dB | Activaciones falsas por hora medidas |
|---|---|---|---|
| WakeHuBERT tiny (0,64 M) | 95% (92-97) | 94 / 85 / 56% | 0,31 |
| Misma arquitectura sin enmascaramiento | 92% (89-95) | 90 / 80 / 39% | 0,46 |

Los intervalos de recall provienen de remuestrear las 315 grabaciones; segun el autor, diferencias de unos pocos puntos entre extractores estan dentro del ruido, y dos tipos de clasificador sobre el mismo extractor pueden diferir en varios puntos. No hay resultados de MMLU, HumanEval, GSM8K ni de ninguna otra tarea tipo LLM porque el modelo no las aborda.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,6 MB para los pesos en float32 (0,64 M de parametros a 4 bytes) y alrededor de 0,65 MB en int8, mas el estado de las activaciones. Cifras estimadas a partir del numero de parametros, no publicadas por el autor.
- GPU recomendadas: cualquier GPU sirve; el modelo no requiere acelerador. Una RTX 4090, A100 o H100 estan enormemente sobredimensionadas y no aportan ventaja practica frente a CPU.
- Cabe en GPU de consumo: si, en cualquier GPU de consumo e incluso en graficos integrados. El caso de uso natural es CPU.
- CPU y embebidos: es el escenario previsto. El tamaño del repositorio figura como 0,0 GB, coherente con un artefacto de menos de unos pocos megabytes. Resulta apto para microcontroladores de gama alta y SoCs ARM.
- Opciones de despliegue: ONNX Runtime (el ejemplo de la model card usa `onnxruntime.InferenceSession`), o cualquier runtime compatible con ONNX (ONNX Runtime Web, ONNX Runtime Mobile, TensorRT). No aplica vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: la model card indica un retardo de unos 100 ms y una cadencia de 50 fotogramas por segundo con 128 dimensiones por fotograma; no se publican cifras de throughput ni de latencia por lote.
- Memoria de contexto en streaming: hay que retener 40.000 muestras (2,5 s) de audio para que los fotogramas calculados en linea coincidan con los obtenidos en modo offline.
- Almacenamiento: el modelo completo, con las variantes float32 e int8, cabe holgadamente en unos pocos megabytes.

## Comparativa con modelos similares

No hay una comparativa publicada con alternativas de la misma categoria. Los unicos modelos con los que se puede contrastar son el profesor y la ablacion interna del propio autor:

| Modelo | Parametros | Tipo de caracteristicas | Causalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WakeHuBERT tiny | 0,64 M | 128 dimensiones a 50 fps | Estrictamente causal, campo receptivo 2,5 s | Apache 2.0 | ONNX en HuggingFace |
| Misma arquitectura sin enmascaramiento | no disponible | 128 dimensiones a 50 fps | Estrictamente causal | no disponible | Solo como referencia en la model card |
| `facebook/hubert-base-ls960` (profesor) | no disponible en la informacion proporcionada | Capas 4, 8 y 12 usadas como objetivo de destilacion | No causal, pensado para representaciones offline | Apache 2.0 | HuggingFace y Transformers |

Frente al profesor, la ventaja del alumno es el tamaño (0,64 M de parametros) y la causalidad, que habilita streaming; la contrapartida es una perdida de informacion que el propio autor senala al advertir que la concordancia con el profesor es un mal predictor de la calidad de deteccion. No se dispone de comparaciones con otros extractores de wake word (por ejemplo, soluciones comerciales tipo Picovoice Porcupine) en la informacion proporcionada.

## Limitaciones y advertencias

- Evaluacion muy acotada: un unico wake word en ingles, un unico benchmark publico (Picovoice, 315 grabaciones) y ejecuciones unicas. No hay resultados medidos para otras palabras, idiomas ni dispositivos.
- El recall cae de forma acusada con ruido: del 95% en silencio y el 94% a 10 dB de babble al 56% a 0 dB. En escenarios muy ruidosos el detector puede resultar poco fiable.
- Tasa de falsas activaciones: 0,31 por hora medidas en 6,5 h de streams reservados; es un valor util pero medido en condiciones controladas y con un umbral calibrado sobre audio distinto.
- La concordancia con el profesor no sirve como metrica de calidad: el autor indica explicitamente que el extractor debe juzgarse mediante un detector entrenado sobre el.
- No es un clasificador: por si solo no detecta nada. Requiere entrenar y mantener un clasificador externo, con el coste de ingenieria y datos que eso implica.
- Latencia inherente de 100 ms: el modelo fue entrenado para predecir cada fotograma de HuBERT cinco fotogramas despues, por lo que cualquier detector reacciona como minimo ese tiempo despues de que termine la palabra.
- Riesgo de alucinacion: no aplica en el sentido de los modelos de lenguaje, pero si existe riesgo de activaciones espurias ante sonidos no vocales, habla de fondo o musica, atenuado parcialmente por el entrenamiento con ruido.
- Idiomas: aunque el entrenamiento incluye material de 41 idiomas, no hay ninguna evaluacion multilingue publicada; usarlo en un idioma distinto del ingles es una apuesta no medida.
- Sesgos: no se documentan analisis de sesgo por acento, genero, edad o calidad de microfono. Dado que el detector de referencia se entreno con 900 clips sinteticos de voces clonadas, la generalizacion a hablantes reales diversos no esta caracterizada mas alla del benchmark citado.
- Licencia: Apache 2.0 permite uso comercial con atribucion y sin garantias, la misma licencia que el profesor HuBERT-base. Los corpus de entrenamiento son CC BY 4.0 (LibriSpeech, Multilingual LibriSpeech, Multilingual Spoken Words), aunque la model card menciona tambien ruido derivado de AudioSet y MUSAN, cuyas condiciones de uso conviene revisar antes de un despliegue comercial.
- Adopcion nula por el momento: 0 descargas y 0 likes en HuggingFace, con tamanos de repositorio que figuran como 0,0 GB. No existe validacion independiente de los resultados.
- Fecha de creacion posterior a la fecha de consulta habitual (2026-09-29): conviene verificar la vigencia y posibles actualizaciones del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TigreGotico/wakehubert-tiny
- Proyecto wakeforge (featurizer `wakehubert`): https://github.com/TigreGotico/wakeforge
- Profesor usado en la destilacion: https://huggingface.co/facebook/hubert-base-ls960
- Referencia metodologica de destilacion por capas (DistilHuBERT): https://arxiv.org/abs/2110.01900
- Benchmark de wake word de Picovoice (citado como fuente de evaluacion): https://github.com/Picovoice/wakeword-benchmark
- No se han encontrado en la busqueda web enlaces adicionales relevantes; los resultados devueltos no guardaban relacion con el modelo.
