# wq2012/univ_conformer_small_triplet

## Resumen

`wq2012/univ_conformer_small_triplet` es un modelo de verificación y reconocimiento de locutor (speaker verification) publicado por el usuario wq2012 dentro del proyecto FlaxSpeaker. Se trata de una reproducción open source, en JAX/Flax, de los algoritmos descritos en los artículos GE2E, Dr-Vectors, Conformer-ATP y PFAS, que originalmente se entrenaron con infraestructura interna propietaria de Google. El checkpoint contiene un encoder Conformer de variante `small` con agrupación temporal atencional (ATP), entrenado con pérdida triplet y puntuación final por similitud coseno, que produce embeddings de locutor de 192 dimensiones.

El modelo es relevante por su tamaño: 2.029.892 parámetros en el encoder, lo que lo sitúa en el rango de los modelos de huella de voz desplegables en dispositivos muy limitados (móvil, Raspberry Pi, CPU sin GPU). Frente a los sistemas de verificación de locutor de gran tamaño basados en WavLM o ECAPA-TDNN ampliados, aquí se prioriza el coste computacional mínimo a cambio de un rendimiento claramente inferior, con tasas de igual error (EER) del 18,50 % en LibriSpeech y del 24-27 % en CN-Celeb2 y VoxCeleb1 en verificación con una única utterance.

El dominio de entrenamiento se etiqueta como `universal` y la evaluación se reparte entre tres corpus: LibriSpeech (inglés leído), CN-Celeb2 (chino multigénero) y VoxCeleb1 (inglés espontáneo de celebridades). La licencia Apache-2.0 permite uso comercial, aunque el autor advierte explícitamente de que no es un producto soportado oficialmente por Google.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Conformer variante `small` con pooling temporal atencional (ATP) |
| Parámetros totales | 2.029.892 (encoder) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no se especifica ventana máxima de audio ni contexto en tokens) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible (evaluado con datos en inglés y chino) |
| Licencia | Apache-2.0 |
| Formato de pesos | `model.safetensors` (SafeTensors) y `flax_model.msgpack` (Flax nativo) |
| Dimensión del embedding de salida | 192 |
| Función de pérdida | Triplet |
| Puntuación de verificación | Similitud coseno |
| Dominio de entrenamiento | `universal` |
| Frontend de audio | log-mel de 80 dimensiones a 16.000 Hz + VAD de energía + CMVN |
| Librería | `flaxspeaker` (JAX/Flax) |
| Pipeline de HuggingFace | `audio-classification` |
| Datasets asociados | librispeech_asr, cnceleb, voxceleb |
| Métricas declaradas | EER, minDCF, ROC-AUC |
| Archivos del repositorio | `model.safetensors`, `flax_model.msgpack`, `config.json`, `preprocessor_config.json`, `eval_results.json` |

## Arquitectura y entrenamiento

El backbone es un Conformer, es decir, un transformer que combina bloques de auto-atención con convoluciones depthwise para capturar simultáneamente dependencias locales y globales en la secuencia acústica. La variante empleada es la configuración `small` del proyecto FlaxSpeaker, con 2.029.892 parámetros en el encoder. Sobre las representaciones del encoder se aplica ATP (Attentive Temporal Pooling), un mecanismo de agregación temporal con atención que convierte la secuencia en un único vector de 192 dimensiones. El entrenamiento usa pérdida triplet y la verificación final se realiza por similitud coseno entre embeddings; el autor cita además el método PFAS (Parameter-Free Attentive Scoring) como referencia de puntuación sin parámetros adicionales.

El frontend procesa audio a 16 kHz, extrae características log-mel de 80 dimensiones, aplica detección de actividad de voz (VAD) basada en energía y normalización CMVN. La configuración de este frontend es compatible con `WhisperFeatureExtractor`, según el archivo `preprocessor_config.json`. No se especifican en la información disponible el número de tokens de audio vistos durante el entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de ajuste fino con RLHF o DPO (no aplicables habitualmente en este tipo de modelo discriminativo). Los tags del repositorio apuntan a LibriSpeech, CN-Celeb y VoxCeleb como datos asociados, pero no se detalla la mezcla de entrenamiento.

## Capacidades

- Extracción de embeddings de locutor de 192 dimensiones a partir de una grabación de audio, mediante `model.extract_embedding(...)`.
- Verificación de locutor extremo a extremo: comparación de dos utterances y devolución de una puntuación de similitud coseno con `model.verify(...)`.
- Verificación con una única utterance (1-utt) y con múltiples utterances de enrolamiento (se reportan resultados con 3-utt).
- Evaluación multi-dominio: funciona sobre inglés leído (LibriSpeech), chino multigénero (CN-Celeb2) e inglés espontáneo de celebridades (VoxCeleb1).
- Preprocesado de audio integrado: log-mel de 80 dimensiones a 16 kHz, VAD de energía y CMVN.
- Inferencia por línea de comandos mediante `scripts/inference.py`, con argumentos `--model_dir`, `--enroll_audio` y `--test_audio`.
- Plataforma JAX/Flax, ejecutable en CPU, GPU y TPU.
- No dispone de generación de texto, razonamiento, código ni matemáticas.
- No soporta tool calling ni function calling.
- No implementa agentes ni razonamiento multi-paso.
- No incluye visión, audio generativo ni modo de pensamiento.

## Casos de uso

- Verificación biométrica en dispositivo: con 2 millones de parámetros y pesos de unos pocos megabytes, el modelo puede ejecutarse en un móvil o en una Raspberry Pi para desbloquear una aplicación comparando el embedding de la frase pronunciada contra el enrolamiento almacenado, sin enviar audio a la nube.
- Etiquetado de locutor en pipelines de transcripción: los embeddings de 192 dimensiones se pueden agrupar por similitud coseno para asignar cada segmento de una reunión a un hablante antes o después de pasar el audio por un sistema ASR.
- Diarización ligera en grabaciones largas: combinado con un algoritmo de clustering sobre los embeddings, permite segmentar entrevistas, pódcast o llamadas sin depender de modelos de diarización de cientos de millones de parámetros.
- Indexado y búsqueda por voz en archivos de medios: generar un embedding por fragmento y almacenarlo en un índice vectorial permite recuperar todas las apariciones de un locutor concreto en un archivo de radio o televisión.
- Autenticación de segundo factor en aplicaciones de riesgo bajo: el EER del 18,50 % en LibriSpeech y del 24,07 % en el conjunto agregado lo hacen aceptable como factor complementario, no como única barrera de seguridad.
- Filtrado de contenido en grabaciones no deseadas: identificar y aislar segmentos de un locutor determinado en un archivo de llamadas o notas de voz para su revisión posterior.
- Investigación y reproducción de resultados: sirve como referencia reproducible en JAX/Flax de GE2E, Dr-Vectors, Conformer-ATP y PFAS, útil para comparar variantes de pooling, pérdida y scoring sin depender de infraestructura propietaria.
- Docencia en procesamiento de audio: el tamaño reducido permite entrenar y evaluar variantes completas en una única GPU de consumo o incluso en CPU, lo que facilita prácticas de verificación de locutor de principio a fin.

## Benchmarks y rendimiento

Resultados de verificación con una única utterance (1-utt), tomados de `eval_results.json`:

| División de evaluación | Ensayos | EER (%) | IC bootstrap 95 % (%) | minDCF@0.01 | minDCF@0.10 | ROC-AUC |
|---|---|---|---|---|---|---|
| LibriSpeech (inglés leído) | 3.000 | 18,50 | [17,10; 19,73] | 0,9480 | 0,8247 | 0,9010 |
| CN-Celeb2 (chino multigénero) | 3.000 | 26,67 | [25,10; 28,28] | 0,9680 | 0,9480 | 0,8122 |
| VoxCeleb1 (celebridades en condiciones reales) | 2.000 | 25,40 | [23,17; 27,33] | 0,9270 | 0,9270 | 0,8345 |
| Universal agrupado (3 dominios) | 8.000 | 24,07 | [23,12; 25,02] | 0,9737 | 0,9362 | 0,8491 |
| Universal media macro (3 dominios) | 8.000 | 23,52 | — | 0,9477 | 0,8999 | 0,8492 |

Resultados de verificación con tres utterances de enrolamiento (3-utt):

| División de evaluación | Ensayos | EER 3-utt (%) | IC bootstrap 95 % (%) | minDCF@0.01 | ROC-AUC |
|---|---|---|---|---|---|
| LibriSpeech (3-utt) | 1.000 | 14,40 | [12,00; 16,40] | 0,8740 | 0,9395 |
| CN-Celeb2 (3-utt) | 1.000 | 24,00 | [21,45; 26,40] | 0,9460 | 0,8531 |
| VoxCeleb1 (3-utt) | 1.000 | 22,00 | [19,00; 24,25] | 0,9540 | 0,8664 |
| Universal agrupado (3-utt) | 3.000 | 20,33 | [18,95; 21,55] | 0,9653 | 0,8854 |
| Universal media macro (3-utt) | 3.000 | 20,13 | — | 0,9247 | 0,8863 |

No se han publicado en la información disponible comparaciones directas con otros modelos de verificación de locutor.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en cualquier precisión. Con 2.029.892 parámetros, los pesos en FP32 ocupan aproximadamente 8 MB y en FP16 unos 4 MB; el consumo real lo domina el runtime de JAX.
- GPU recomendadas: cualquier GPU con soporte CUDA sirve; no se requiere A100, H100 ni VRAM alta. Modelos como RTX 3060, RTX 4090 o GTX 1650 son sobradamente suficientes, y también GPU integradas con soporte JAX.
- CPU: la inferencia es viable en CPU para cargas de baja concurrencia, dado el tamaño del modelo.
- Dispositivos de borde: el tamaño de pesos permite desplegarlo en Raspberry Pi o dispositivos móviles, siempre que se resuelva el runtime de JAX o se exporte a otro formato.
- Opciones de despliegue: la vía oficial es la librería `flaxspeaker` con JAX/Flax, cargando desde HuggingFace Hub o desde directorio local, o el script `scripts/inference.py`. No se documenta soporte para vLLM, llama.cpp, Ollama, TGI, TensorRT ni ONNX en la información disponible.
- Formatos cargables: `flax_model.msgpack` como formato nativo Flax y `model.safetensors` como formato principal.
- Latencia y throughput: no disponibles (el autor no publica mediciones de tiempo de inferencia ni de audio procesado por segundo).

## Comparativa con modelos similares

No se han proporcionado datos verificados de parámetros, contexto, rendimiento o licencia de otros modelos de verificación de locutor, por lo que no es posible construir una comparación cuantitativa sin inventar cifras. Como categorías de alternativas equivalentes se pueden considerar los sistemas ECAPA-TDNN (por ejemplo los publicados por SpeechBrain), los embeddings de locutor de pyannote y los modelos basados en WavLM con cabezal de verificación. Las filas siguientes reflejan únicamente lo que consta en la información disponible:

| Modelo | Parámetros | Contexto o ventana | Rendimiento | Licencia |
|---|---|---|---|---|
| `wq2012/univ_conformer_small_triplet` | 2.029.892 | No disponible | EER 1-utt agregado 24,07 %; 3-utt 20,33 % | Apache-2.0 |
| ECAPA-TDNN (SpeechBrain) | No disponible | No disponible | No disponible | No disponible |
| pyannote/embedding | No disponible | No disponible | No disponible | No disponible |
| WavLM + cabezal de verificación | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Rendimiento bajo para verificación de locutor en producción: EER del 18,50 % en el mejor dominio y del 24,07 % en el agregado de una utterance, muy lejos de los sistemas de verificación de locutor desplegados comercialmente. No es adecuado para control de acceso de alta seguridad ni para autenticación única.
- minDCF elevado: los valores de 0,9270 a 0,9737 con umbral 0,01 indican un comportamiento pobre en puntos operativos estrictos, donde el coste de los falsos positivos es alto.
- Sesgo de dominio: el rendimiento es claramente desigual entre dominios (18,50 % en LibriSpeech frente a 26,67 % en CN-Celeb2 en 1-utt), con mejor comportamiento en inglés leído que en audio espontáneo o multigénero.
- Riesgo de falsos positivos y negativos: al no ser un modelo generativo no alucina texto, pero sí puede confundir locutores con timbre similar o del mismo grupo demográfico. Requiere calibración de umbral específica por dominio y por canal.
- Idiomas: no se declaran idiomas soportados oficialmente. Las únicas evidencias de evaluación son inglés y chino, y no hay datos publicados sobre otros idiomas.
- Condiciones acústicas no documentadas: no se especifican pruebas con audio telefónico de banda estrecha, con reverberación, con ruido de fondo elevado o con códecs con pérdida, escenarios en los que cabe esperar degradación.
- Restricciones de licencia: la licencia es Apache-2.0, que permite uso comercial y modificación. Sin embargo, el propio autor advierte de que no es un producto soportado oficialmente por Google, por lo que no debe presentarse como tal ni asociarse a esa marca.
- Procedencia de los datos: los corpora asociados incluyen VoxCeleb, con datos de personas célebres. Cualquier uso comercial debe revisar las condiciones y consideraciones de privacidad y consentimiento de esos corpus originales.
- Falta de validación comunitaria: el repositorio figura con 0 descargas y 0 me gusta en el momento de recoger los datos, y el tamaño reportado del repositorio es de 0,0 GB, por lo que no existe todavía evidencia externa de resultados reproducidos por terceros.
- Compatibilidad de frontend: el extractor es compatible con `WhisperFeatureExtractor`, pero cualquier desviación en la configuración del preprocesado (frecuencia de muestreo, número de bandas mel, CMVN) respecto al entrenamiento degradará los embeddings.
- Ausencia de cuantizaciones publicadas: no hay versiones en int8, GGUF u ONNX, por lo que el despliegue fuera de JAX/Flax requiere una conversión propia no validada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wq2012/univ_conformer_small_triplet
- Colección FlaxSpeaker en HuggingFace: https://huggingface.co/collections/wq2012/flaxspeaker-6ad02d999a4180c794870595
- Repositorio GitHub de FlaxSpeaker: https://github.com/wq2012/FlaxSpeaker
- Paquete en PyPI: https://pypi.org/project/flaxspeaker/
- Artículo GE2E, Generalized End-to-End Loss for Speaker Verification: https://arxiv.org/abs/1710.10467
- Artículo Dr-Vectors, Decision Residual Networks and an Improved Loss for Speaker Recognition: https://arxiv.org/abs/2104.01989
- Artículo Conformer-ATP, Attentive Temporal Pooling for Conformer-based Streaming Language Identification in Long-form Speech: https://arxiv.org/abs/2202.12163
- Artículo PFAS, Parameter-Free Attentive Scoring for Speaker Verification: https://arxiv.org/abs/2203.05642
- Búsqueda web complementaria: no se han encontrado resultados relevantes sobre este modelo; las consultas devolvieron exclusivamente contenido no relacionado con el ámbito técnico.
