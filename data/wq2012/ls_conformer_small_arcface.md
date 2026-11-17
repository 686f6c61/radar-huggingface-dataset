# wq2012/ls_conformer_small_arcface

## Resumen

`ls_conformer_small_arcface` es un modelo de extracción de embeddings de hablante (speaker verification y speaker recognition) desarrollado por el usuario `wq2012` dentro del proyecto FlaxSpeaker. Se trata de una reimplementación desde cero en JAX/Flax, basada únicamente en papers publicados, de los algoritmos GE2E, Dr-Vectors, ATP y PFAS para reconocimiento de hablante. El modelo emplea una arquitectura Conformer de tamano "small" con pooling temporal atento (ATP) y se entrena con una función de pérdida ArcFace para producir embeddings de 192 dimensiones comparables mediante similitud coseno.

Con 2.029.892 parámetros de inferencia (encoder más cabecera de scoring), es un modelo deliberadamente compacto, pensado como checkpoint de referencia dentro de un benchmark controlado y no como un sistema de producción a gran escala. Fue entrenado exclusivamente sobre LibriSpeech (232 hablantes, 5.788 utterances) durante 2.400 pasos (~26,54 épocas), alcanzando un EER final en dominio de 8,13 % (1 utterance) y 4,20 % (3 utterances).

Su relevancia actual es metodológica: ofrece una implementación abierta, reproducible y verificable en JAX/Flax de técnicas clásicas de speaker recognition, con fingerprints de entrenamiento y resultados de evaluación publicados, lo que facilita comparaciones relativas controladas entre arquitecturas y funciones de pérdida. No debe confundirse con un modelo estado del arte entrenado sobre VoxCeleb2-dev.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Conformer (variante small) con pooling temporal atento (ATP) |
| Parámetros totales | 2.029.892 (encoder + cabecera de scoring; excluye pesos del clasificador de entrenamiento) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa recortes variables de 90 a 180 frames) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (entrenado solo con LibriSpeech, inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y flax_model.msgpack (Flax nativo) |
| Dimensión del embedding | 192 |
| Pooling temporal | ATP (Attentive Temporal Pooling) |
| Objetivo de entrenamiento | ArcFace |
| Scorer de verificación | Similitud coseno |
| Frontend de audio | Mel log-natural de 80 dimensiones a 16 kHz, VAD por energía a nivel de frame y CMVN (no es un `AutoFeatureExtractor` de Hugging Face) |
| Librería | flaxspeaker (JAX/Flax) |
| Pipeline | feature-extraction |

## Arquitectura y entrenamiento

El modelo combina un backbone Conformer de tamano small con una cabecera de pooling temporal atento (ATP), tomada del paper de identificación de idioma de Wang et al. (arXiv:2202.12163) y reutilizada aquí para agregar la secuencia de frames en un único vector de 192 dimensiones. Sobre ese embedding se aplica una pérdida ArcFace con margen angular, con un calentamiento lineal del margen durante los primeros 300 pasos antes de fijar el margen objetivo. La verificación en inferencia se realiza por similitud coseno entre embeddings, siguiendo el esquema PFAS (arXiv:2203.05642).

El entrenamiento se realizó sobre LibriSpeech exclusivamente: 232 hablantes y 5.788 utterances, con mini-batches de 64 utterances (8 hablantes x 4 utterances), 2.400 pasos de gradiente (~26,54 épocas), semilla 42, calentamiento de 240 pasos y recortes de longitud variable U(90, 180) frames con máscara de validez exacta. Se ejecutó en una estación de trabajo con CPU. El autor documenta fingerprints de pérdida en el paso 0 para verificar la reproducibilidad y desviaciones respecto a los papers originales, cuyos experimentos se corrieron sobre infraestructura y datos internos de Google. El checkpoint es un resultado de convergencia sobre un corpus pequeño, no una reproducción a gran escala.

## Capacidades

- Extracción de embeddings de hablante de 192 dimensiones a partir de audio a 16 kHz.
- Verificación de hablante (1:1) mediante similitud coseno entre embeddings.
- Identificación de hablante (1:N) por comparación contra un conjunto de embeddings de referencia.
- Scoring multi-utterance: los resultados mejoran al agregar varias utterances por hablante (EER de 8,13 % con 1 utterance frente a 4,20 % con 3).
- Evaluación con métricas estándar de la tarea: EER, minDCF y ROC-AUC, con intervalos de confianza bootstrap al 95 %.
- Soporte de audio con recortes de longitud variable (90-180 frames) y enmascarado de validez.
- No soporta tool calling, function calling, razonamiento multi-paso ni generación de texto: es un extractor de features de audio, no un modelo generativo.
- No dispone de capacidades multimodales (visión, audio-texto) ni de modo thinking.

## Casos de uso

- Verificación biométrica de locutor en aplicaciones de control de acceso: el modelo genera un embedding de 192 dimensiones por utterance y se compara por similitud coseno contra la plantilla del usuario registrado, con umbral calibrado sobre el EER observado en el dominio de destino.
- Diarización de reuniones y transcripciones: segmentar un audio largo en turnos y agruparlos por hablante comparando embeddings, usando la agregación multi-utterance para reducir el EER en hablantes con varias intervenciones.
- Benchmarking de arquitecturas y pérdidas en investigación: sirve como referencia reproducible en JAX/Flax para comparar Conformer, ECAPA-TDNN u otras variantes bajo el mismo protocolo de evaluación y presupuesto de entrenamiento.
- Filtrado y limpieza de corpus de voz: detectar utterances que no pertenecen al hablante esperado en un dataset de ASR antes del entrenamiento, comparando cada clip contra la plantilla del hablante declarado.
- Autenticación de voz en dispositivos con recursos limitados: con solo 2,03 M de parámetros, el modelo puede ejecutarse en CPU o en hardware embebido para tareas de verificación de locutor en local.
- Reproducción y auditoría de resultados: gracias a los fingerprints del paso 0 y a `eval_results.json`, permite validar que una implementación propia reproduce las métricas publicadas antes de escalar a corpus mayores.
- Prototipado de pipelines de speaker recognition en JAX: integración en flujos existentes de Flax/JAX sin dependencias de PyTorch, útil en entornos de investigación ya basados en ese ecosistema.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card (LibriSpeech, dominio de entrenamiento):

| Métrica | 1 utterance | 3 utterances |
|---|---|---|
| EER en paso 400 | 24,47 % | 20,20 % |
| EER en paso 2000 (rodilla) | 8,33 % | 4,40 % |
| EER final en paso 2400 | 8,13 % | 4,20 % |
| EER final con pooling universal | 16,23 % | 12,40 % |

Datos adicionales de estabilidad: la desviación estándar entre semillas 0-2 del EER agrupado con 1 utterance es de 0,08-0,41 % absoluto, y la semianchura del intervalo bootstrap al 95 % con 8.000 ensayos es de ~0,8 %. El repositorio incluye además resultados sobre un subconjunto de 10 hablantes de VoxCeleb1-O en `eval_results.json`.

Como referencia externa citada por el autor (no son resultados de este modelo): los sistemas ECAPA-TDNN entrenados sobre VoxCeleb2-dev alcanzan ~0,9 % EER en la lista completa VoxCeleb1-O, y los sistemas con menos de 1 M de parámetros ~2 % (EfficientTDNN).

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en precisión completa; el modelo tiene 2,03 M de parámetros (~8 MB en fp32) y el cuello de botella es el frontend de audio, no los pesos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria es suficiente; no requiere A100 ni H100. Una RTX 4090 o incluso una GTX 1650 sobran para inferencia.
- Cabe holgadamente en GPU de consumo y también en CPU: el checkpoint fue entrenado en una estación de trabajo con CPU.
- Opciones de despliegue: la librería `flaxspeaker` (PyPI) con JAX/Flax es la vía principal; los pesos en safetensors permiten conversión a otros runtimes, aunque no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a un extractor de audio).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | EER reportado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ls_conformer_small_arcface` | 2,03 M | Recortes de 90-180 frames, 16 kHz | 8,13 % (1 utt) / 4,20 % (3 utt) en LibriSpeech | Apache 2.0 | Hugging Face, PyPI |
| ECAPA-TDNN (Desplanques et al., 2020) | ~20 M (referencia) | VoxCeleb2-dev | ~0,9 % en VoxCeleb1-O | no disponible | Implementaciones comunitarias |
| EfficientTDNN (Wang et al., 2022) | <1 M | VoxCeleb2-dev | ~2 % en VoxCeleb1-O | no disponible | Paper |

La comparación no es directa: los sistemas ECAPA-TDNN y EfficientTDNN se entrenan sobre corpus de miles de hablantes, mientras que este checkpoint lo hace sobre 232 hablantes de LibriSpeech. Los EER no son comparables entre sí; el autor lo advierte explícitamente.

## Limitaciones y advertencias

- El EER absoluto está acotado por la diversidad de hablantes del corpus de entrenamiento (232 hablantes), muy inferior a los benchmarks industriales con miles de hablantes.
- Entrenado solo con LibriSpeech (inglés); el rendimiento en otros idiomas o acentos no está caracterizado.
- Es un checkpoint de benchmark sobre corpus pequeño, no una reproducción a gran escala de los papers originales; el autor lo declara explícitamente.
- No es un producto oficialmente soportado por Google, pese a reimplementar técnicas de papers de esa casa.
- El frontend de audio no es un `AutoFeatureExtractor` de Hugging Face: requiere el pipeline de `flaxspeaker.AudioFrontend` (Mel, VAD, CMVN) para obtener resultados correctos.
- Riesgo de alucinación no aplica (no genera texto), pero sí de falsos positivos y falsos negativos en verificación; el umbral debe calibrarse por dominio.
- Sesgos demográficos potenciales derivados de la distribución de hablantes de LibriSpeech (audio de lectura en inglés), no evaluados en la model card.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías de idoneidad para producción.
- No se documentan tipos de cuantización soportados ni latencias de inferencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wq2012/ls_conformer_small_arcface
- Colección FlaxSpeaker: https://huggingface.co/collections/wq2012/flaxspeaker
- Repositorio GitHub: https://github.com/wq2012/FlaxSpeaker
- Paquete PyPI: https://pypi.org/project/flaxspeaker/
- Paper GE2E: https://arxiv.org/abs/1710.10467
- Paper Dr-Vectors: https://arxiv.org/abs/2104.01989
- Paper ATP: https://arxiv.org/abs/2202.12163
- Paper PFAS: https://arxiv.org/abs/2203.05642
