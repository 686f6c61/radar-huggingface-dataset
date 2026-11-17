# wq2012/vox_ecapa_tdnn_small_ext_softmax

## Resumen

`vox_ecapa_tdnn_small_ext_softmax` es un modelo de verificación e identificación de locutor (speaker verification/recognition) desarrollado por el usuario `wq2012` dentro del proyecto FlaxSpeaker. Se trata de una reimplementación desde cero en JAX/Flax de los algoritmos descritos en los papers GE2E, Dr-Vectors, ATP y PFAS, sin uso de código ni datos propietarios. El modelo genera embeddings de locutor de 192 dimensiones a partir de audio a 16 kHz, que se comparan mediante similitud coseno para determinar si dos fragmentos pertenecen al mismo hablante.

La arquitectura es una ECAPA-TDNN en variante `small`, con pooling temporal atencional (`asp`) y un objetivo de entrenamiento basado en Extended-Set Softmax mezclado. Con tan solo 1.684.418 parámetros de inferencia (encoder más cabeza de scoring), es un modelo extremadamente ligero, pensado para despliegue en CPU y entornos con recursos limitados.

Es relevante ahora porque ofrece una implementación abierta, reproducible y con licencia Apache 2.0 de un pipeline completo de speaker recognition en el ecosistema JAX, algo poco habitual, aunque con la advertencia explícita del autor de que se trata de un checkpoint de benchmark sobre corpus pequeño (30 locutores) y no de un modelo de estado del arte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ECAPA-TDNN (`small`) con pooling temporal atencional (`asp`) |
| Parametros totales | 1.684.418 (encoder + cabeza de scoring; excluye pesos del clasificador de entrenamiento) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (audio de duración variable; entrenado con crops de 90-180 frames) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo es independiente del idioma por naturaleza; no se declara lista de idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`) y Flax Msgpack (`flax_model.msgpack`) |

## Arquitectura y entrenamiento

El backbone es una ECAPA-TDNN en tamaño `small`, una red neuronal convolucional temporal con atención de canal y agregación estadística, adaptada aquí con pooling atencional (`asp`). El frontend de audio es propio de FlaxSpeaker: Mel logarítmico natural de 80 dimensiones a 16 kHz, VAD a nivel de frame basado en energía y normalización CMVN; no utiliza un `AutoFeatureExtractor` de Hugging Face. La salida es un embedding de locutor de 192 dimensiones y la verificación se realiza por similitud coseno. El objetivo de entrenamiento es una variante propia de Extended-Set Softmax mezclada (0,50 row-softmax + 0,50 extended-set con desplazamiento de logit `-log N`), que no coincide con la ecuación 2 del paper original.

El entrenamiento se realizó sobre VoxCeleb1 únicamente: 30 locutores y 750 utterances (partición de test de VoxCeleb1), con 1.000 pasos de gradiente, batches de 32 utterances (8 locutores x 4 utterances), aproximadamente 42,67 épocas, semilla 42 y ejecución en CPU. Se usaron crops de longitud variable `U(90, 180)` frames con máscara de validez exacta. El autor documenta que el EER en dominio (VoxCeleb1) evolucionó de 23,10 % (1-utt) / 18,80 % (3-utt) en el paso 400 a 22,40 % / 16,80 % en el paso 1000, con una meseta de convergencia propia de un corpus de 30 locutores. La desviación estándar entre semillas 0-2 del EER pooled 1-utt es de 0,08-0,41 % absoluto, y el intervalo de confianza bootstrap al 95 % con 8.000 ensayos tiene una semianchura de ~0,8 %.

## Capacidades

- Extracción de embeddings de locutor de 192 dimensiones a partir de audio a 16 kHz.
- Verificación de locutor (1:1) mediante similitud coseno entre embeddings.
- Identificación de locutor (1:N) por comparación contra una galería de embeddings.
- Puntuación con cabezas GE2E (`w,b`), Dr-Vector y PFAS incluidas en los pesos.
- Frontend de audio integrado con VAD por energía y CMVN.
- Independiente del idioma por diseño (no se declara lista de idiomas soportados).
- No soporta tool calling, function calling ni razonamiento multi-paso: es un extractor de características de audio, no un modelo generativo.
- No dispone de modo thinking, visión ni audio generativo.

## Casos de uso

- Verificación biométrica de acceso: el modelo genera un embedding del audio entrante y lo compara por similitud coseno con el embedding de referencia del usuario, permitiendo autenticación por voz con un modelo de menos de 2 M de parámetros desplegable en CPU.
- Identificación de hablante en reuniones y transcripciones: dado un conjunto de embeddings de referencia de los participantes, se etiqueta cada segmento de audio con el locutor más probable, aprovechando el VAD integrado para descartar silencios.
- Diarización ligera en dispositivos de borde: al ser un modelo de 1,68 M de parámetros, puede ejecutarse en hardware embebido o Raspberry Pi para segmentar y agrupar hablantes en grabaciones locales sin enviar audio a la nube.
- Detección de locutor en centros de llamadas: comparar el embedding de una llamada entrante con una base de clientes registrados para enrutamiento automático o verificación antifraude, con la advertencia de que la precisión está limitada por el corpus de entrenamiento.
- Investigación y benchmarking reproducible: sirve como referencia controlada dentro del benchmark FlaxSpeaker para comparar variantes de arquitectura, pooling y funciones de pérdida en JAX/Flax, con métricas EER, minDCF y ROC-AUC ya publicadas en `eval_results.json`.
- Filtrado y curación de datasets de audio: calcular embeddings de grandes colecciones para detectar duplicados del mismo locutor, agrupar por hablante o eliminar muestras atípicas antes de entrenar otros modelos.
- Prototipado en el ecosistema JAX: integración en pipelines de investigación que ya usan JAX/Flax, evitando la dependencia de PyTorch y aprovechando la serialización nativa en Msgpack y safetensors.

## Benchmarks y rendimiento

El autor publica métricas de evaluación multi-dominio en `eval_results.json` (EER 1-utt y 3-utt, minDCF, ROC-AUC, intervalos bootstrap al 95 % y evaluación VoxCeleb1-O con 10 locutores). Los datos concretos disponibles en la información proporcionada son:

| Metrica | Paso 400 | Paso 900 | Paso 1000 (final) |
|---|---|---|---|
| VoxCeleb1 EER 1-utt | 23,10 % | 22,30 % | 22,40 % |
| VoxCeleb1 EER 3-utt | 18,80 % | 17,20 % | 16,80 % |
| Universal Pooled EER 1-utt (final) | no disponible | no disponible | 25,10 % |
| Universal Pooled EER 3-utt (final) | no disponible | no disponible | 21,73 % |

Como referencia citada por el autor (no resultados de este modelo): los sistemas ECAPA-TDNN publicados entrenados sobre VoxCeleb2-dev alcanzan ~0,9 % EER en VoxCeleb1-O completo (Desplanques et al., 2020), y los sistemas de menos de 1 M de parámetros ~2 % (Wang et al., EfficientTDNN, 2022). No se han publicado resultados de MMLU, HumanEval ni GSM8K por no ser un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en FP32 dado el tamaño de 1,68 M de parámetros; el cuello de botella es la memoria del frontend de audio y los buffers, no los pesos.
- GPU recomendadas: no requiere GPU; cualquier GPU moderna (RTX 4090, A100, H100) funciona pero está sobredimensionada para este modelo.
- Cabe en cualquier GPU consumer, incluida una GTX 1050 o inferior, y en CPU sin problema; el autor entrenó el checkpoint en una estación de trabajo CPU.
- Opciones de despliegue: la librería `flaxspeaker` (PyPI) con JAX/Flax; los pesos safetensors pueden cargarse en otros frameworks, aunque el frontend de audio (Mel 80 dims, VAD, CMVN) es propio y debe reimplementarse fuera de FlaxSpeaker. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | EER VoxCeleb1-O | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `vox_ecapa_tdnn_small_ext_softmax` | 1,68 M | audio 16 kHz, crops 90-180 frames | 22,40 % (1-utt) / 16,80 % (3-utt) sobre 30 locutores | Apache 2.0 | Hugging Face, FlaxSpeaker |
| ECAPA-TDNN (Desplanques et al., 2020) | ~20 M (referencia publicada) | audio 16 kHz | ~0,9 % (VoxCeleb2-dev) | no disponible | pesos no publicados en la información |
| EfficientTDNN (Wang et al., 2022) | <1 M | audio 16 kHz | ~2 % | no disponible | no disponible |

La comparación es orientativa: los EER de este checkpoint se miden sobre un corpus de 30 locutores y no son directamente comparables con los de sistemas entrenados sobre VoxCeleb2-dev (5.994 locutores, ~1,1 M utterances). El propio autor advierte que el modelo no debe considerarse estado del arte.

## Limitaciones y advertencias

- Corpus de entrenamiento muy reducido: 30 locutores y 750 utterances de VoxCeleb1, lo que limita la diversidad de hablantes y la generalización a poblaciones reales.
- EER absoluto elevado (22,40 % 1-utt, 16,80 % 3-utt) frente a sistemas industriales; no apto para producción con requisitos de seguridad biométrica estrictos.
- Sesgos probables por la composición demográfica de VoxCeleb1 (hablantes de celebridades, mayoritariamente inglés), no documentados explícitamente por el autor.
- Riesgo de confusión entre locutores con voces similares o en condiciones acústicas adversas (ruido, reverberación, canales telefónicos), no evaluado en la información disponible.
- El frontend de audio es propio de FlaxSpeaker y no es un `AutoFeatureExtractor` de Hugging Face; la integración fuera de esa librería requiere reimplementar Mel, VAD y CMVN para reproducir los resultados.
- El checkpoint es un benchmark de corpus pequeño, no una reproducción a gran escala de los papers citados; el autor lo indica explícitamente.
- Licencia Apache 2.0 permite uso comercial, pero el autor declara que no es un producto oficialmente soportado por Google.
- No se declaran idiomas soportados; el rendimiento en idiomas distintos del inglés no está documentado.

## Enlaces

- Hugging Face: https://huggingface.co/wq2012/vox_ecapa_tdnn_small_ext_softmax
- Colección FlaxSpeaker: https://huggingface.co/collections/wq2012/flaxspeaker
- Repositorio GitHub: https://github.com/wq2012/FlaxSpeaker
- Paquete PyPI: https://pypi.org/project/flaxspeaker/
- Paper GE2E: https://arxiv.org/abs/1710.10467
- Paper Dr-Vectors: https://arxiv.org/abs/2104.01989
- Paper ATP: https://arxiv.org/abs/2202.12163
- Paper PFAS: https://arxiv.org/abs/2203.05642
