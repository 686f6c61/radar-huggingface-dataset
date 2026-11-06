# Yiyang-hou/whisper-tiny-american

## Resumen

Whisper tiny American es un ajuste fino (fine-tuning) del modelo de reconocimiento automatico del habla openai/whisper-tiny, publicado por el usuario Yiyang-hou en Hugging Face. El modelo parte de la arquitectura encoder-decoder transformer de Whisper en su variante mas pequena, con 37.760.640 parametros totales, y se ha reentrenado sobre el dataset naharte/american_english_english para especializarse en transcripcion de ingles americano. Su relevancia es limitada pero concreta: ofrece una alternativa ultraligera (repo de 0,5 GB) para tareas de ASR en ingles americano donde el presupuesto de computo o el tamano del despliegue es critico, como dispositivos de borde o pipelines de transcripcion masiva.

El modelo se distribuye bajo licencia Apache 2.0, con pesos en formato safetensors y compatibilidad con la libreria transformers. No incluye documentacion tecnica detallada sobre la composicion del dataset de entrenamiento ni sobre el proceso de ajuste mas alla de los hiperparametros declarados en la model card. El resultado declarado por el autor es un WER de 9,0846 sobre el split de entrenamiento del dataset American English, un dato que debe interpretarse con cautela al no estar verificado y al haberse medido sobre el propio conjunto de entrenamiento.

Se trata, por tanto, de un modelo de nicho, con 35 descargas y sin likes en el momento de la consulta, pensado para experimentacion y prototipado rapido mas que para produccion a gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper (encoder-decoder transformer) |
| Parametros totales | 37.760.640 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper tiny: un transformer encoder-decoder con mecanismo de atencion estandar, disenado originalmente por OpenAI para transcripcion y traduccion de voz. El modelo base procesa audio en ventanas de 30 segundos convertidas a espectrogramas log-Mel, y genera texto de forma autorregresiva. Al ser la variante tiny, es la configuracion mas ligera de la familia Whisper, con 37,7 millones de parametros.

El ajuste fino se realizo con el Trainer de Hugging Face sobre el dataset naharte/american_english_english, con un learning rate de 1e-05, batch de entrenamiento de 2, batch de evaluacion de 1, semilla 42, optimizador AdamW con betas (0,9, 0,999) y epsilon 1e-08, scheduler lineal con 500 pasos de warmup y 2000 pasos totales de entrenamiento. El entrenamiento registro una perdida de validacion de 0,1865 y un WER de 9,0846 al paso 2000 (epoca 1,8904). No se documenta el numero de tokens de audio utilizados, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO; la model card indica explicitamente "More information needed" en las secciones de descripcion, usos previstos y datos de entrenamiento.

## Capacidades

- Reconocimiento automatico del habla (ASR) en ingles americano.
- Transcripcion de audio a texto con salida de texto plano.
- Especializacion en acentos y variantes del ingles americano gracias al ajuste sobre el dataset American English.
- Compatible con el pipeline `automatic-speech-recognition` de transformers.
- No se documenta soporte de tool calling ni function calling.
- No se documenta capacidad de agentes ni razonamiento multi-paso.
- Capacidades multilingues: solo ingles (`en`), segun los metadatos.
- No se documentan capacidades especiales como modo thinking, vision o audio adicionales mas alla del ASR.

## Casos de uso

- Transcripcion de audio en dispositivos de borde: al tratarse de un modelo de 37,7 millones de parametros y un repo de 0,5 GB, puede ejecutarse en hardware con recursos muy limitados, como Raspberry Pi o moviles, para dictado o notas de voz en ingles americano.
- Prototipado rapido de pipelines ASR: util para validar una integracion con transformers antes de escalar a modelos Whisper mayores, gracias a su bajo coste de inferencia.
- Transcripcion masiva por lotes: adecuado para procesar grandes volumenes de audio en ingles americano cuando la precision absoluta no es critica y el throughput prima sobre la calidad.
- Preprocesamiento de datasets de voz: puede emplearse para generar transcripciones preliminares de corpus en ingles americano que luego se revisan manualmente.
- Sistemas de subtitulado en tiempo casi real: su tamano reducido permite baja latencia en CPU, adecuado para subtitulos aproximados en entornos con recursos escasos.
- Filtrado y busqueda de contenido audio: transcripcion ligera para indexar y buscar palabras clave en grabaciones en ingles americano.
- Base para nuevos ajustes finos: al ser un checkpoint Whisper tiny ya adaptado al ingles americano, sirve como punto de partida para especializaciones posteriores en dominios concretos.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados):

| Modelo | Dataset | Metrica | Valor |
|---|---|---|---|
| Whisper tiny American | American English (naharte/american_english_english, split train) | WER | 9,0846 |
| Whisper tiny American (paso 1000) | American English | WER | 10,9981 |
| Whisper tiny American (paso 2000) | American English | Validation loss | 0,1865 |

No se han publicado en la informacion disponible resultados comparativos con otros modelos en benchmarks estandar como LibriSpeech, Common Voice o MMLU.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para los 37,7 millones de parametros; en la practica, el consumo depende del framework y del tamano del lote de audio.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el modelo cabe holgadamente en GTX 1650, RTX 3060, RTX 4090 o superiores.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con al menos 1-2 GB de memoria, e incluso en CPU.
- Opciones de despliegue: transformers (pipeline `automatic-speech-recognition`), potencialmente ONNX o CTranslate2 para optimizacion, y llama.cpp u Ollama no aplican por tratarse de un modelo de audio. vLLM y TGI no estan documentados para este checkpoint.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Whisper tiny American (este modelo) | 37,7 M | no disponible | en | apache-2.0 | Hugging Face |
| openai/whisper-tiny | 37,7 M | ventanas de 30 s de audio | multilingue | apache-2.0 | Hugging Face |
| openai/whisper-base | 74,4 M | ventanas de 30 s de audio | multilingue | apache-2.0 | Hugging Face |

La comparativa directa con whisper-tiny y whisper-base es la mas adecuada por compartir arquitectura y familia. No se dispone de datos de rendimiento comparativos verificados en la informacion proporcionada.

## Limitaciones y advertencias

- El WER declarado (9,0846) se ha medido sobre el split de entrenamiento del dataset, no sobre un conjunto de evaluacion independiente, por lo que puede estar sobreestimando el rendimiento real.
- El resultado no esta verificado (`verified: false` en el model-index).
- Solo soporta ingles; no se recomienda para otros idiomas.
- Al ser un modelo tiny, la precision en audio con ruido, acentos no americanos o vocabulario tecnico sera inferior a la de variantes mayores de Whisper.
- Riesgo de alucinacion en transcripciones: los modelos Whisper pueden generar texto plausible no presente en el audio, especialmente en segmentos silenciosos o con ruido.
- Sesgos conocidos: no documentados; el dataset de entrenamiento no esta descrito en detalle, lo que impide evaluar sesgos de dominio o demograficos.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni documentacion sobre el origen y los permisos del dataset de entrenamiento.
- La model card esta generada automaticamente y contiene secciones sin completar ("More information needed"), lo que limita la trazabilidad del proceso de entrenamiento.
- No se documentan tasas de error en benchmarks estandar, lo que dificulta la comparacion objetiva con otros modelos ASR.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Yiyang-hou/whisper-tiny-american
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Dataset de entrenamiento: https://huggingface.co/datasets/naharte/american_english_english
- Ficha en Free2AITools: https://free2aitools.com/model/yiyang-hou/whisper-tiny-american
