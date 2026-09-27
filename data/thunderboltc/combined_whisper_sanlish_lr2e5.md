# thunderboltc/combined_whisper_sanlish_lr2e5

## Resumen

`thunderboltc/combined_whisper_sanlish_lr2e5` es un ajuste fino (fine-tune) del modelo de reconocimiento automatico del habla `openai/whisper-small`, publicado por el usuario thunderboltc en Hugging Face. Se trata, por tanto, de un modelo encoder-decoder de tipo transformer especializado en transcripcion de audio a texto, con 241.734.912 parametros (unos 242 millones) y licencia Apache 2.0. El modelo se genero con `Trainer` de la libreria Transformers y se distribuye en formato safetensors.

El interes de esta ficha es limitado pero honesto: no es un lanzamiento de gran laboratorio, sino un experimento de ajuste fino cuyos resultados de evaluacion declarados (WER de 33,4213 y CER de 8,1594) estan muy por debajo del rendimiento tipico de `whisper-small` en condiciones estandar, lo que sugiere que el dominio objetivo es dificil (audio con acentos marcados, ruido, code-switching o una variedad linguistica poco representada en los datos originales). El nombre incluye el termino "sanlish", presumiblemente relacionado con el conjunto de datos de entrenamiento, aunque la model card no lo documenta.

Es relevante ahora unicamente como referencia para quien trabaje en ASR de dominio especifico y quiera comparar estrategias de ajuste fino, no como modelo listo para produccion. El repositorio ocupa 50,3 GB, un tamano desproporcionado para 242 millones de parametros, lo que indica que contiene checkpoints intermedios o artefactos de entrenamiento adicionales. No registra descargas ni "likes", y la model card esta practicamente vacia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (seq2seq) de tipo Whisper, heredada de `openai/whisper-small` |
| Parametros totales | 241.734.912 (~242 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible como contexto de texto; modelo de audio con ventana de 30 s por segmento (heredada del modelo base) |
| Tipos de cuantizacion | No disponible. Solo se distribuyen pesos en precision completa (safetensors); no se documentan versiones GGUF, int8 ni int4 |
| Idiomas soportados | No disponible. La model card no declara idiomas ni tarea multilingue |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |
| Tamano del repositorio | 50,3 GB |
| Modelo base | `openai/whisper-small` |
| Pipeline | automatic-speech-recognition |
| Version de Transformers usada en el entrenamiento | 5.16.1 |
| Fecha de creacion / actualizacion | 2026-09-26 / 2026-09-26 |

## Arquitectura y entrenamiento

La arquitectura es la de `openai/whisper-small`: un transformer encoder-decoder entrenado originalmente por OpenAI para transcripcion y traduccion de voz. El encoder procesa espectrogramas mel logaritmicos y el decoder genera texto de forma autorregresiva, con tokens especiales de control de idioma y de tarea. El modelo base opera sobre segmentos de audio de 30 segundos y esta disenado para multitarea (transcripcion, traduccion y deteccion de idioma). Esta ficha no dispone de la configuracion exacta de capas, dimensiones ni cabezas de atencion del checkpoint publicado; se asume la del modelo base, ya que el autor no la modifica.

Los hiperparametros de entrenamiento si estan documentados: learning rate de 2e-05 con scheduler lineal y 200 pasos de calentamiento, tamano de lote de entrenamiento 8 con 2 pasos de acumulacion de gradiente (lote efectivo 16), lote de evaluacion 4, semilla 42, optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-08, precision mixta nativa (AMP) y 25 epocas planificadas. El mejor checkpoint reportado corresponde a la epoca 17 (paso 2006). El conjunto de datos de entrenamiento aparece como "None" en la model card, por lo que no se puede verificar su composicion, tamano, idioma ni procedencia. No se documenta ningun tipo de alineacion adicional (RLHF, DPO) ni innovacion tecnica propia: es un ajuste fino supervisado estandar.

## Capacidades

- Transcripcion de audio a texto (speech-to-text) en el dominio representado por los datos de ajuste, presumiblemente relacionado con el termino "sanlish" del nombre del modelo.
- Generacion de transcripciones con estructura de segmentos temporales, capacidad heredada del decoder de Whisper.
- Procesamiento de audio en ventanas de 30 segundos; para audios mas largos es necesario trocear y recomponer.
- Deteccion de idioma y tokens de control de tarea: presentes en la arquitectura base, pero no verificados ni declarados para este fine-tune.
- Traduccion de voz a texto en ingles: capacidad potencial del modelo base, no confirmada en este checkpoint.
- Tool calling / function calling: no disponible, no es una capacidad de un modelo ASR.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles segun la informacion de la model card.
- Modo "thinking", vision o audio de entrada multimodal: no disponible.

## Casos de uso

- Transcripcion de audio de un dominio concreto: dado que es un fine-tune y no un modelo general, su uso razonable es transcribir el tipo de audio sobre el que se ajusto. Conviene validar el WER real sobre una muestra propia antes de adoptarlo, porque el 33,42 % declarado es alto.
- Evaluacion comparativa de tecnicas de fine-tuning: sirve como punto de referencia para medir cuanto mejora un ajuste con pocas epocas y learning rate bajo frente al modelo base en un dominio dificil.
- Preprocesado de corpus de voz para investigacion: generar transcripciones preliminares que luego se corrigen manualmente (el CER de 8,16 % implica aproximadamente un caracter erroneo cada doce, un punto de partida util para una revision humana asistida).
- Prototipado rapido en local: con 242 millones de parametros el modelo cabe en cualquier GPU de consumo e incluso puede ejecutarse en CPU, lo que permite montar demos de transcripcion sin infraestructura dedicada.
- Integracion en pipelines de transformacion de datos: usar el modelo como etapa de ASR dentro de un flujo mayor (por ejemplo, indexacion de audio para busqueda) aceptando que la calidad de transcripcion requerira postprocesado.
- Subtitulado asistido: las salidas segmentadas de Whisper permiten generar subtitulos con marcas de tiempo que despues se revisan, un uso viable cuando la exactitud literal no es critica.
- Analisis exploratorio de llamadas o reuniones: extraer texto aproximado para clasificacion, deteccion de temas o busqueda por palabras clave, sin pretender una transcripcion literal exacta.
- Docencia e investigacion en ASR: estudiar el comportamiento de un modelo pequeno ajustado con 25 epocas y su sobreajuste o infraajuste (el checkpoint final reportado es de la epoca 17, con la mejor metrica de evaluacion).

## Benchmarks y rendimiento

Los unicos resultados disponibles son los declarados por el autor en la model card, medidos sobre un conjunto de evaluacion no identificado:

| Metrica | Valor |
|---|---|
| eval_loss | 0,6887 |
| eval_wer (word error rate) | 33,4213 |
| eval_cer (character error rate) | 8,1594 |
| eval_runtime (segundos) | 93,6705 |
| eval_samples_per_second | 2,584 |
| eval_steps_per_second | 0,651 |
| epoca del checkpoint evaluado | 17,0 |
| paso | 2006 |

No se han publicado resultados de benchmarks estandar (LibriSpeech, Common Voice, FLEURS u otros) en la informacion disponible. El campo `model-index` del repositorio esta vacio, por lo que no hay comparaciones oficiales con otros modelos. No se dispone del numero de muestras del conjunto de evaluacion, aunque a partir de `eval_runtime` y `eval_samples_per_second` se puede estimar en torno a 240 muestras.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB en fp32 y unos 500 MB en fp16 para los pesos; con cache de atencion y lotes pequenos, entre 1,5 y 3 GB en la practica.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM es suficiente (RTX 3060, RTX 4060, RTX 3090, RTX 4090, A100, H100). El modelo esta muy por debajo de la capacidad de cualquiera de ellas.
- GPU de consumo: si, cabe holgadamente en practicamente todas las GPU de consumo de los ultimos ocho anos. Tambien es viable la inferencia en CPU, con latencia mayor.
- Opciones de despliegue: `transformers` con la pipeline `automatic-speech-recognition` es la via directa al estar los pesos en safetensors. vLLM y TGI incluyen soporte para modelos Whisper. Para `whisper.cpp`, `faster-whisper` (CTranslate2) u Ollama seria necesario convertir los pesos a GGUF o a formato CTranslate2, algo no documentado por el autor.
- Throughput observado: 2,584 muestras por segundo y 0,651 pasos por segundo en el equipo de evaluacion del autor, con lote de evaluacion 4. No se especifica el hardware utilizado, por lo que la cifra no es extrapolable.
- Latencia: no disponible de forma desagregada. El tiempo total de evaluacion fue de 93,67 segundos para el conjunto completo.

## Comparativa con modelos similares

Los datos de parametros y ventana de audio de los modelos de la familia Whisper son publicos y verificables en sus respectivos repositorios; el rendimiento en benchmarks de este fine-tune no es comparable porque su WER se midio sobre un conjunto no identificado.

| Modelo | Parametros | Ventana de audio | Licencia | Notas |
|---|---|---|---|---|
| `thunderboltc/combined_whisper_sanlish_lr2e5` | 241,7 M | 30 s | Apache 2.0 | Fine-tune de whisper-small; WER 33,42 % sobre conjunto no especificado; 0 descargas |
| `openai/whisper-small` | 242 M | 30 s | Apache 2.0 | Modelo base, ampliamente validado y disponible en todas las librerias de inferencia |
| `openai/whisper-base` | 74 M | 30 s | Apache 2.0 | Alternativa mas ligera y rapida, con menor precision general |
| `openai/whisper-medium` | 769 M | 30 s | Apache 2.0 | Alternativa mas precisa, con mayor coste de inferencia (unas tres veces mas parametros) |
| `openai/whisper-large-v3` | 1550 M | 30 s | Apache 2.0 | Mayor precision y cobertura multilingue de la familia, a cambio de mas VRAM y latencia |

La ventaja competitiva de este checkpoint frente al modelo base no puede establecerse con la informacion disponible: el unico WER publicado (33,42 %) no tiene un termino de comparacion declarado para el mismo conjunto de evaluacion.

## Limitaciones y advertencias

- Calidad de transcripcion baja segun los datos del propio autor: un WER de 33,42 % implica que aproximadamente una de cada tres palabras se transcribe mal. No es apto para produccion sin una revision humana posterior.
- El CER de 8,16 % es mas favorable que el WER, algo coherente con errores en palabras largas o compuestas, pero sigue siendo elevado para uso automatico.
- Conjunto de datos de entrenamiento no documentado: la model card indica "None". No se puede evaluar la representatividad, el idioma, el acento ni la procedencia del audio, ni verificar el cumplimiento de licencias de los datos originales.
- Idiomas no declarados: se desconoce si el modelo funciona en castellano, en ingles, en una variedad concreta o en codigo mezclado. El termino "sanlish" del nombre no esta explicado en ningun sitio.
- Riesgo de alucinacion: los modelos de la familia Whisper tienden a generar texto plausible en segmentos silenciosos, ruidosos o musicales. Este comportamiento se hereda del modelo base y puede verse agravado por un ajuste fino sobre un dominio estrecho.
- Sesgos: no hay informacion sobre la demografia del audio de entrenamiento, por lo que se desconocen sesgos de acento, genero o edad.
- Sin validacion de la comunidad: 0 descargas y 0 "likes" en el momento de redactar esta ficha. No hay evidencia externa de funcionamiento correcto ni replicaciones.
- Tamano del repositorio desproporcionado: 50,3 GB para un modelo de 242 millones de parametros (menos de 1 GB en fp32). Es probable que contenga checkpoints intermedios de las 25 epocas, lo que complica la descarga y el despliegue y conviene revisar antes de clonar el repositorio.
- Licencia Apache 2.0: permite uso comercial y modificacion con atribucion, pero la licencia del checkpoint no cubre los derechos sobre los datos de entrenamiento, que son desconocidos.
- Fecha de creacion inusual (2026-09-26): conviene verificar la integridad y la procedencia del repositorio antes de integrarlo en cualquier flujo.
- Sin versiones cuantizadas oficiales: para desplegarlo en `whisper.cpp`, `faster-whisper` u Ollama habria que convertir los pesos por cuenta propia, con el riesgo de degradar aun mas la calidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thunderboltc/combined_whisper_sanlish_lr2e5
- Modelo base: https://huggingface.co/openai/whisper-small
- Otro fine-tune del mismo autor: https://huggingface.co/thunderboltc/gemini_whisper_sanlish
- Otro fine-tune del mismo autor: https://huggingface.co/thunderboltc/whisper_sanlish_mnx_lr5e-6
- Ficha indexada de un modelo relacionado: https://essamamdani.com/ai-models/hf-thunderboltc-gemini-whisper-sanlish
