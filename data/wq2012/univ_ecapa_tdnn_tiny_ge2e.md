# wq2012/univ_ecapa_tdnn_tiny_ge2e

## Resumen

`univ_ecapa_tdnn_tiny_ge2e` es un modelo de verificación e identificación de hablante (speaker verification) desarrollado por el usuario wq2012 dentro del proyecto FlaxSpeaker, una reimplementación desde cero en JAX/Flax de algoritmos clásicos de reconocimiento de hablante. El modelo extrae embeddings de voz de 128 dimensiones que permiten comparar dos grabaciones mediante similitud coseno para decidir si pertenecen al mismo hablante. No es un modelo generativo: su tarea es `feature-extraction` sobre audio.

La arquitectura es ECAPA-TDNN en su variante `tiny`, con pooling temporal atencional (`asp`) y entrenamiento mediante la pérdida GE2E softmax con centroides leave-one-out. El checkpoint tiene 626.722 parámetros de inferencia (629.600 totales según safetensors, incluyendo pesos de clasificación solo de entrenamiento) y está entrenado sobre un corpus controlado de 381 hablantes y 9.447 utterances provenientes de LibriSpeech, CN-Celeb2 y VoxCeleb1. Se distribuye en safetensors y msgpack nativo de Flax bajo licencia Apache 2.0.

Su relevancia es doble: por un lado ofrece una implementación abierta y reproducible en el ecosistema JAX de un pipeline de speaker recognition; por otro, es explícitamente un checkpoint de benchmark de corpus pequeño, no un modelo de producción. El autor advierte que los EER absolutos están limitados por la diversidad de hablantes del corpus de entrenamiento y que sirve para comparaciones relativas controladas dentro del benchmark FlaxSpeaker.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ECAPA-TDNN (variante `tiny`) con pooling temporal atencional (`asp`) |
| Parametros totales | 629.600 (safetensors); 626.722 parámetros de inferencia (encoder + cabeza de scoring, excluye clasificador de entrenamiento) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible; entrenado con crops variables de `U(90, 180)` frames con máscara de validez exacta |
| Tipos de cuantizacion | no disponible (pesos en safetensors/msgpack; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (el modelo es independiente del idioma a nivel de embedding; datos de entrenamiento multilingües: LibriSpeech en inglés, CN-Celeb2 en chino, VoxCeleb1 multilingüe) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`) y msgpack nativo de Flax (`flax_model.msgpack`) |

## Arquitectura y entrenamiento

El modelo es una ECAPA-TDNN de tamaño `tiny` que procesa audio a 16 kHz con un frontend propio de 80 dimensiones de Mel en logaritmo natural, VAD a nivel de frame y CMVN (implementado en `flaxspeaker.AudioFrontend`, no como `AutoFeatureExtractor` de Hugging Face). Sobre las representaciones frame-level se aplica pooling temporal atencional (`asp`) y se proyecta a un embedding de 128 dimensiones. La verificación se realiza por similitud coseno entre embeddings.

El entrenamiento usa la pérdida GE2E softmax (Wan et al. 2018, Eq. 6) con centroides leave-one-out exactos, en mini-batches de 32 utterances (8 hablantes x 4 utterances). Se ejecutaron 4.600 pasos de gradiente (~15,58 épocas) sobre 9.447 utterances de 381 hablantes (LibriSpeech + CN-Celeb2 + VoxCeleb1), con warmup de 460 pasos y semilla 42, en una estación de trabajo CPU. El autor documenta convergencia: el EER pooled 1-utt pasó de 27,24 % en el paso 400 a 17,80 % en el paso 4600, y el 3-utt de 23,37 % a 14,20 %. La desviación estándar entre semillas 0-2 del EER pooled 1-utt es de 0,08-0,41 % absoluto, mientras que el intervalo de confianza bootstrap al 95 % con 8.000 ensayos tiene una semianchura de ~0,8 %. El checkpoint incluye pesos de cabezas GE2E `w,b`, Dr-Vector y PFAS, aunque la verificación publicada usa similitud coseno.

## Capacidades

- Extracción de embeddings de hablante de 128 dimensiones a partir de audio de 16 kHz.
- Verificación de hablante (1:1) mediante similitud coseno entre embeddings.
- Identificación de hablante (1:N) mediante comparación contra un conjunto de embeddings de referencia.
- Scoring con múltiples cabezas entrenadas: GE2E softmax, Dr-Vector y PFAS (Parameter-Free Attentive Scoring).
- Evaluación con métricas EER, minDCF y ROC-AUC, con intervalos de confianza bootstrap.
- Funciona sobre audio multi-dominio (inglés, chino y multilingüe) gracias al entrenamiento conjunto en LibriSpeech, CN-Celeb2 y VoxCeleb1.
- No soporta tool calling, function calling, agentes, visión, audio generativo ni decodificación especulativa; no es un modelo de lenguaje.
- No se documentan capacidades de diarización, separación de hablantes ni detección de voz anti-spoofing.

## Casos de uso

- Verificación biométrica de acceso: comparar el embedding de una frase de desafío con el embedding de referencia del usuario y aceptar o rechazar según un umbral de similitud coseno calibrado. Adecuado por su tamaño mínimo y latencia baja, aunque el EER del checkpoint (~17,8 % 1-utt) exige umbrales conservadores.
- Identificación de hablante en un conjunto cerrado pequeño: enrolar N hablantes y asignar cada utterance al embedding de referencia más próximo. Útil en demos y entornos controlados con pocos hablantes.
- Benchmarking de pipelines de speaker recognition en JAX/Flax: servir como referencia reproducible para comparar cambios de frontend, pooling o pérdida dentro del propio benchmark FlaxSpeaker.
- Investigación educativa sobre ECAPA-TDNN y GE2E: el repositorio incluye configuración completa, fingerprints de paso 0 y resultados de evaluación, lo que permite reproducir el entrenamiento y estudiar la convergencia.
- Preprocesado de audio para sistemas de diarización o clustering: generar embeddings de 128 dimensiones por segmento y agruparlos con clustering (k-means, spectral) como etapa previa.
- Filtrado de calidad y detección de cambios de hablante en grabaciones largas: comparar embeddings de ventanas consecutivas para segmentar audio por hablante en entornos con pocos interlocutores.
- Prototipado en CPU: al tener ~627k parámetros de inferencia, puede ejecutarse en una estación de trabajo sin GPU, lo que facilita pruebas de integración antes de migrar a un modelo mayor.

## Benchmarks y rendimiento

Datos publicados en la model card (checkpoint final, paso 4600, semilla 42, corpus de 381 hablantes):

| Metrica | 1-utt | 3-utt |
|---|---|---|
| EER pooled (paso 400) | 27,24 % | 23,37 % |
| EER pooled (paso 4000, knee) | 18,48 % | 14,37 % |
| EER pooled (paso 4600, final) | 17,80 % | 14,20 % |

Datos adicionales documentados:

| Metrica | Valor |
|---|---|
| Desviación estándar entre semillas 0-2 del EER pooled 1-utt | 0,08-0,41 % absoluto |
| Semianchura del IC bootstrap 95 % (8.000 ensayos) | ~0,8 % |
| Fingerprint de pérdida en paso 0 (crops `U(90,180)`) | 2,1651 |
| Fingerprint de pérdida en paso 0 (crops fijos de 180 frames) | 2,0579 |

Referencias orientativas citadas por el autor (no son resultados de este checkpoint): sistemas ECAPA-TDNN entrenados en VoxCeleb2-dev alcanzan ~0,9 % EER en VoxCeleb1-O completo (Desplanques et al., 2020), y sistemas de menos de 1M de parámetros ~2 % (Wang et al., EfficientTDNN, 2022). El autor indica que `eval_results.json` contiene además minDCF, ROC-AUC, intervalos de confianza bootstrap y resultados en un subconjunto de 10 hablantes de VoxCeleb1-O, pero los valores concretos no se detallan en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; con ~627k parámetros de inferencia el modelo cabe holgadamente en cualquier GPU consumer y en CPU.
- GPU recomendadas: no requiere GPU; cualquier GPU con suficiente memoria para el batch de audio (RTX 3060, RTX 4090, A100, H100) es más que suficiente. El autor entrenó el checkpoint en una estación de trabajo CPU.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos ~1 GB de VRAM libre, y también en CPU.
- Opciones de despliegue: la librería `flaxspeaker` (>= 0.5.0) en Python con JAX/Flax; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles. Al ser un modelo de ~627k parámetros sobre audio de 16 kHz, la latencia esperada es baja, pero no se publican cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | EER publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `univ_ecapa_tdnn_tiny_ge2e` (este) | 626.722 (inferencia) | Audio 16 kHz, crops 90-180 frames | 17,80 % 1-utt / 14,20 % 3-utt en corpus de 381 hablantes | Apache 2.0 | Hugging Face + PyPI (`flaxspeaker`) |
| ECAPA-TDNN (Desplanques et al., 2020) | ~20M (referencia típica, no confirmado en la información) | Audio 16 kHz | ~0,9 % en VoxCeleb1-O completo | no disponible | Implementaciones comunitarias; no es un checkpoint único oficial |
| EfficientTDNN (Wang et al., 2022) | <1M | Audio 16 kHz | ~2 % (según cita del autor) | no disponible | no disponible |

La comparación no es directa: los EER de los sistemas de referencia se miden sobre VoxCeleb1-O completo (con miles de hablantes de entrenamiento), mientras que este checkpoint se evalúa sobre un corpus controlado de 381 hablantes. El autor lo indica explícitamente y desaconseja tratar este modelo como estado del arte.

## Limitaciones y advertencias

- Checkpoint de benchmark de corpus pequeño: 381 hablantes y 9.447 utterances, no una reproducción a gran escala de los papers. Los EER absolutos están limitados por la diversidad de hablantes.
- EER pooled 1-utt de 17,80 % en el corpus de evaluación: muy lejos de los ~0,9 % de sistemas ECAPA-TDNN entrenados en VoxCeleb2-dev; no apto para producción biométrica sin reentrenamiento o fine-tuning.
- Sesgos de dominio y de hablante: el corpus mezcla inglés (LibriSpeech), chino (CN-Celeb2) y multilingüe (VoxCeleb1), pero con pocos hablantes por dominio; el rendimiento puede degradarse en acentos, edades o condiciones acústicas poco representadas.
- Riesgo de falsos positivos y falsos negativos: al operar con umbrales de similitud coseno, la calibración es crítica; el intervalo de confianza bootstrap del ~0,8 % implica que diferencias menores entre configuraciones no son significativas.
- El frontend de audio es propio (`flaxspeaker.AudioFrontend`), no un `AutoFeatureExtractor` de Hugging Face: integrarlo requiere la librería `flaxspeaker` y no es plug-and-play con pipelines estándar.
- Requiere `flaxspeaker >= 0.5.0`; versiones anteriores pueden no reproducir las métricas archivadas.
- Licencia Apache 2.0: permite uso comercial, pero el autor declara que no es un producto oficialmente soportado por Google.
- No se documentan evaluaciones anti-spoofing, diarización ni robustez frente a audio adversario; no debe usarse como única barrera de seguridad.
- Idiomas soportados no declarados formalmente; el modelo genera embeddings independientes del idioma, pero no hay evaluación por idioma publicada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wq2012/univ_ecapa_tdnn_tiny_ge2e
- Colección FlaxSpeaker: https://huggingface.co/collections/wq2012/flaxspeaker
- Repositorio GitHub: https://github.com/wq2012/FlaxSpeaker
- Paquete PyPI: https://pypi.org/project/flaxspeaker/
- Paper GE2E: https://arxiv.org/abs/1710.10467
- Paper Dr-Vectors: https://arxiv.org/abs/2104.01989
- Paper ATP (Attentive Temporal Pooling): https://arxiv.org/abs/2202.12163
- Paper PFAS (Parameter-Free Attentive Scoring): https://arxiv.org/abs/2203.05642
