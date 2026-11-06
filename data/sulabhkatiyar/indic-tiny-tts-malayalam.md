# sulabhkatiyar/indic-tiny-tts-malayalam

## Resumen
Indic Tiny TTS Malayalam es un modelo de síntesis de voz (text-to-speech) especializado en malabar (malayalam), desarrollado por sulabhkatiyar dentro de la colección INDIC TINY TTS MODELS, que agrupa 12 modelos minúsculos para 11 lenguas indias y inglés indio. El modelo convierte texto en escritura malabar en audio de 24 kHz con dos voces (femenina y masculina), y su propuesta central es ofrecer una calidad de inteligibilidad comparable a modelos entre 4 y 42 veces más grandes con una huella computacional mínima.

Según la model card, el modelo declara 22,5 millones de parámetros, aunque el recuento real de safetensors en el repositorio es de 8.934.153 parámetros; esta discrepancia entre la cifra publicada y la almacenada conviene tenerla en cuenta al planificar recursos. El repositorio ocupa 0,2 GB e incluye pesos en safetensors y ONNX. La relevancia actual del modelo reside en su orientación a inferencia en CPU y dispositivos locales: según el autor, sintetiza 38 veces más rápido que tiempo real en un hilo de CPU Apple M1 y 7 veces en un hilo x86, sin necesidad de GPU.

Con licencia CC-BY-4.0 y contexto de uso limitado al malabar, está pensado para aplicaciones de accesibilidad, lectura de contenido y asistentes de voz en entornos con recursos escasos, más que para generación de voz expresiva o clonación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo TTS; pesos en safetensors y ONNX) |
| Parametros totales | 22,5 M según model card; 8.934.153 según safetensors |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuye en safetensors y ONNX) |
| Idiomas soportados | malabar (ml) |
| Licencia | cc-by-4.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento
La informacion disponible no detalla la arquitectura interna (si es VITS, FastSpeech, un transformer acustico u otro tipo de modelo TTS). Lo que si se documenta es el pipeline: entrada de texto en escritura malabar, salida de audio a 24 kHz, con seleccion de voz femenina o masculina mediante el parametro `voice`. El modelo forma parte de una familia de 12 modelos minuciosamente pequenos, uno por lengua, lo que sugiere una receta de entrenamiento comun y compartida entre lenguas.

Los datos de entrenamiento proceden de sulabhkatiyar/indic-tts-mini-24k, que contiene las voces femenina y masculina de malabar de AI4Bharat Rasa a 24 kHz, derivadas del dataset completo sulabhkatiyar/indic-tts-multilingual-prepared. Tambien se referencia ai4bharat/Rasa. No se especifican en la informacion proporcionada el numero de horas de audio, el numero de tokens ni si hubo etapas de RLHF o ajuste por preferencias; para un modelo TTS esas etapas no son habituales. La innovacion destacable es la eficiencia: el autor reporta factores de tiempo real de 0,136 en un hilo x86, 0,026 en un hilo de Apple M1 y 0,016 en GPU T4.

## Capacidades
- Sintesis de voz a partir de texto en escritura malabar, con salida de audio a 24 kHz.
- Dos voces seleccionables: femenina (`voice="female"`) y masculina.
- Inferencia en CPU sin GPU, con soporte para PyTorch y ONNX Runtime.
- Ejecucion en dispositivos locales (on-device) gracias a su huella de memoria reducida.
- No se documentan capacidades de clonacion de voz, control de emocion, prosodia expresiva, tool calling, agentes ni multimodalidad.
- Cobertura linguistica limitada al malabar; no se declaran capacidades multilingues.

## Casos de uso
- Lectura de noticias y articulos en malabar: el modelo sintetiza frases de estilo periodistico con una tasa de error de caracteres del 2,37 % en FLORES-200, adecuada para locucion automatizada de boletines o resumenes diarios.
- Accesibilidad para personas con discapacidad visual: integrado en lectores de pantalla o aplicaciones moviles, convierte texto malabar en audio en tiempo real incluso en telefonos sin GPU.
- Asistentes de voz para atencion al ciudadano: al ejecutarse en CPU, puede desplegarse en servidores modestos o en el propio dispositivo para responder consultas en malabar sin depender de la nube.
- Traduccion y subtitulado accesible: combinado con un modelo de traduccion, permite generar pistas de audio en malabar a partir de contenido original en otras lenguas, con latencia baja gracias a su velocidad.
- Educacion y aprendizaje de idiomas: generacion de material de escucha con voces femenina y masculina para cursos de malabar, con coste de inferencia minimo.
- Audiolibros y contenido bajo demanda: sintesis por lotes de textos largos en entornos con recursos limitados, donde un modelo de 937 M como indic-parler-tts resultaria prohibitivo en coste y latencia.
- Sistemas embebidos y IoT: despliegue en dispositivos con RAM limitada usando los pesos ONNX, por ejemplo altavoces inteligentes o terminales de informacion publica en malabar.

## Benchmarks y rendimiento
Los datos de la model card comparan la tasa de error de caracteres (CER) medida mediante reconocimiento automatico del audio sintetizado, donde menor es mejor.

FLORES-200, 100 frases de noticias:

| Modelo | Tamano | CER, % | Resultado frente a este modelo |
|---|---:|---:|---|
| Este modelo | 22,5 M | 2,37 | referencia |
| ai4bharat/IndicF5 | 350,6 M | 2,06 | equivalente |
| AI4Bharat/Indic-TTS (ml.zip) | 65,6 M | 2,60 | equivalente |
| ai4bharat/vits_rasa_13 | 31,3 M | 2,94 | este modelo mejor |
| rhasspy/piper-voices (ml_IN) | 15,7 M | 3,36 | este modelo mejor |
| ai4bharat/indic-parler-tts | 937,8 M | 4,05 | este modelo mejor |
| facebook/mms-tts-mal | 29,1 M | 7,95 | este modelo mejor |
| multilingual-tts/VITS-OpenBible-Malayalam | 29,1 M | 13,11 | este modelo mejor |

Frases de test reservadas (300):

| Modelo | Tamano | CER, % | Resultado frente a este modelo |
|---|---:|---:|---|
| Este modelo | 22,5 M | 5,55 | referencia |
| AI4Bharat/Indic-TTS (ml.zip) | 65,6 M | 5,11 | equivalente |
| ai4bharat/vits_rasa_13 | 31,3 M | 6,24 | equivalente |
| facebook/mms-tts-mal | 29,1 M | 14,02 | este modelo mejor |

En las mismas 40 frases reservadas, el autor reporta CER equivalente a indic-parler-tts (5,21 % frente a 5,71 % de este modelo) con 1/42 del tamano y aproximadamente 111 veces mas rapido en T4, y equivalente a IndicF5 con 1/16 del tamano y unas 172 veces mas rapido en T4.

Velocidad:

| Hardware | Configuracion | Veces mas rapido que tiempo real | Factor de tiempo real |
|---|---|---:|---:|
| CPU x86 (Intel Xeon 2,20 GHz, 4 vCPU) | PyTorch, 1 hilo | 7 | 0,136 |
| Apple M1, CPU | PyTorch, 1 hilo | 38 | 0,026 |
| NVIDIA T4 | PyTorch | 62 | 0,016 |

## Requisitos de hardware
- VRAM estimada: no disponible de forma explicita; con 8,9 M parametros en safetensors el peso de los pesos es del orden de decenas de MB, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: T4 es suficiente y el autor reporta 62 veces tiempo real; cualquier GPU consumer moderna (RTX 3060, RTX 4090) sobra para este modelo.
- Cabe en CPU: si, es el escenario principal; funciona en un unico hilo de CPU x86 (7 veces tiempo real) y de Apple M1 (38 veces tiempo real).
- Opciones de despliegue: PyTorch y ONNX Runtime segun la model card; no se confirma soporte para vLLM, llama.cpp, Ollama o TGI, que estan orientados a modelos de lenguaje y no a TTS.
- Latencia y throughput: factor de tiempo real de 0,136 en x86 de 4 vCPU, 0,026 en M1 y 0,016 en T4, medido sobre 30 frases reservadas.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | CER FLORES-200, % | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| Este modelo | 22,5 M (8,9 M en safetensors) | malabar | 2,37 | CC-BY-4.0 | Hugging Face, safetensors y ONNX |
| ai4bharat/IndicF5 | 350,6 M | varias lenguas indias | 2,06 | no disponible | Hugging Face |
| ai4bharat/indic-parler-tts | 937,8 M | varias lenguas indias | 4,05 | no disponible | Hugging Face |
| facebook/mms-tts-mal | 29,1 M | malabar | 7,95 | no disponible | Hugging Face |

El modelo se situa en calidad de inteligibilidad a la altura de IndicF5 e Indic-TTS con una fraccion del tamano, y por delante de MMS-TTS, Piper y VITS-OpenBible en el mismo test. Su ventaja diferencial es la eficiencia en CPU y su huella de memoria.

## Limitaciones y advertencias
- Sesgos: no se documentan sesgos especificos, pero al entrenarse con voces de AI4Bharat Rasa, la diversidad de acentos, registros y hablantes esta acotada a ese corpus.
- Alucinacion: en TTS el riesgo se manifiesta como pronunciacion incorrecta, omision o insercion de fonemas; la CER de 5,55 % en frases reservadas indica que no es perfecto en texto fuera de dominio.
- Contexto e idioma: solo malabar y solo escritura malabar; no se declaran capacidades multilingues ni transliteracion de entrada.
- Licencia CC-BY-4.0: permite uso comercial con atribucion; hay que revisar las condiciones de los datasets de origen (AI4Bharat Rasa) para confirmar que no imponen restricciones adicionales.
- Discrepancia de parametros: la model card declara 22,5 M mientras que safetensors contiene 8.934.153; conviene verificar la cifra real antes de dimensionar despliegues.
- Adopcion muy baja (4 descargas, 0 likes) y fecha de publicacion futura en los metadatos, lo que reduce la validacion comunitaria y la evidencia de robustez en produccion.
- No se documentan soporte para voces fuera de las dos incluidas, control de prosodia fino ni streaming.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/sulabhkatiyar/indic-tiny-tts-malayalam
- Coleccion INDIC TINY TTS MODELS: https://huggingface.co/collections/sulabhkatiyar/indic-tiny-tts-models-6aeae36f954418631a68676d
- Dataset de entrenamiento: https://huggingface.co/datasets/sulabhkatiyar/indic-tts-mini-24k
- Dataset multilingue preparado: https://huggingface.co/datasets/sulabhkatiyar/indic-tts-multilingual-prepared
- Dataset AI4Bharat Rasa: https://huggingface.co/datasets/ai4bharat/Rasa
- Benchmark FLORES-200: https://huggingface.co/sulabhkatiyar/indic-tiny-tts-malayalam/resolve/main/assets/bench_flores.png
- Benchmark frases reservadas: https://huggingface.co/sulabhkatiyar/indic-tiny-tts-malayalam/resolve/main/assets/bench_rasa.png
- Benchmark modelos grandes: https://huggingface.co/sulabhkatiyar/indic-tiny-tts-malayalam/resolve/main/assets/bench_big.png
- Muestras de audio femeninas: https://huggingface.co/sulabhkatiyar/indic-tiny-tts-malayalam/resolve/main/samples/female_1.wav
