# wq2012/ls_conformer_small_ge2e_contrast

## Resumen

`ls_conformer_small_ge2e_contrast` es un modelo de extracción de embeddings de locutor (speaker verification y speaker recognition) desarrollado por el usuario wq2012 dentro del proyecto FlaxSpeaker. Se trata de una reimplementación desde cero en JAX/Flax de algoritmos publicados en la literatura (GE2E, Dr-Vectors, ATP y PFAS), sin uso de código ni datos propietarios. El modelo no es un producto oficial de Google, aunque las técnicas que reproduce provienen de publicaciones de dicha empresa.

Arquitectura de tipo Conformer en su variante "small", con pooling temporal atento (ATP) y una cabeza de verificación basada en similitud coseno que produce embeddings de 192 dimensiones. Con 2.029.894 parámetros de inferencia, es un modelo deliberadamente compacto, pensado como checkpoint de referencia dentro del benchmark de FlaxSpeaker y no como sistema de producción a gran escala.

Su relevancia actual es metodológica: ofrece una implementación abierta, reproducible y verificable (semillas fijas, fingerprints de pérdida en el paso 0, intervalos de confianza bootstrap) de un pipeline completo de reconocimiento de locutor en JAX. El entrenamiento se limita a LibriSpeech (232 locutores, 5.788 enunciados) durante 2.400 pasos (~13,27 épocas), por lo que sus métricas absolutas no son comparables a sistemas industriales entrenados sobre VoxCeleb2-dev.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer (variante small) con pooling temporal atento (ATP) |
| Parametros totales | 2.029.894 (encoder + cabeza de scoring; excluye pesos del clasificador de entrenamiento) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa crops de 90 a 180 frames durante entrenamiento; ventana de inferencia no especificada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo agnóstico al idioma; entrenado solo con LibriSpeech en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y flax_model.msgpack (parámetros nativos Flax) |

Otros datos técnicos: dimensión de embedding de salida 192, frontend de audio con Mel logarítmico natural de 80 dimensiones a 16 kHz, VAD a nivel de frame por energía y CMVN. Objetivo de entrenamiento `ge2e_contrast` (surrogate híbrido de contraste GE2E). Scorer de verificación por similitud coseno.

## Arquitectura y entrenamiento

El backbone es un Conformer, es decir, un transformer que combina bloques de autoatención con convoluciones depthwise para capturar dependencias locales y globales en la señal de audio. Sobre la secuencia de frames se aplica un pooling temporal atento (ATP), técnica tomada de un artículo sobre identificación de idioma en streaming, que agrega la información temporal en un vector de 192 dimensiones. La verificación se realiza comparando embeddings mediante similitud coseno, y el modelo incluye además cabezas Dr-Vector y PFAS para el scoring.

El entrenamiento emplea la función de pérdida `ge2e_contrast`, un surrogate híbrido cuyo valor sigue la ecuación 7 de Wan et al. y cuyo gradiente combina un 25 % de esa ecuación, un 25 % de entropía cruzada binaria y un 50 % de entropía cruzada softmax GE2E, con `ge2e_init_b = -1`. Se entrenó durante 2.400 pasos con batches de 32 enunciados (8 locutores × 4 enunciados), lo que equivale a unas 13,27 épocas sobre 5.788 enunciados de 232 locutores de LibriSpeech, con semilla 42 y warmup de 240 pasos. Los crops de entrenamiento son de longitud variable U(90, 180) frames con máscara de validez exacta. No se menciona uso de RLHF ni DPO, algo esperable en un modelo de embeddings y no generativo.

## Capacidades

- Extracción de embeddings de locutor de 192 dimensiones a partir de audio a 16 kHz.
- Verificación de locutor (1:1) mediante similitud coseno entre embeddings.
- Reconocimiento de locutor (1:N) por comparación contra una galería de embeddings.
- Scoring con múltiples cabezas: GE2E (w, b), Dr-Vector y PFAS.
- Evaluación con métricas estándar del dominio: EER, minDCF y ROC-AUC, con intervalos de confianza bootstrap.
- Funciona con audio de duración variable gracias al pooling temporal atento y al VAD por energía.
- No soporta tool calling, agentes, generación de texto ni capacidades multimodales: es un extractor de características de audio.

## Casos de uso

- Verificación biométrica de locutor en aplicaciones de acceso: el modelo genera un embedding del audio entrante y lo compara por coseno con el embedding de referencia del usuario; su tamaño reducido permite ejecutarlo en CPU o dispositivos con recursos limitados.
- Benchmarking y reproducción de investigación: sirve como checkpoint de referencia dentro de FlaxSpeaker para comparar variantes de arquitectura, pooling o funciones de pérdida bajo condiciones controladas y semillas fijas.
- Segmentación y diarización de reuniones: combinado con un sistema de segmentación, sus embeddings permiten agrupar fragmentos de audio por locutor en grabaciones multi-participante.
- Detección de locutor en pipelines de transcripción: etiquetar qué segmentos de una transcripción pertenecen a cada hablante, útil en actas de reuniones o atención al cliente grabada.
- Filtrado de audio no deseado: identificar si un fragmento corresponde al locutor de interés antes de procesarlo con modelos más costosos, actuando como etapa de bajo coste en un pipeline.
- Investigación en JAX/Flax: base para experimentar con entrenamiento distribuido, cuantización o destilación en el ecosistema JAX, dado que los pesos están en safetensors y msgpack nativo.
- Evaluación de robustez entre dominios: el checkpoint incluye métricas sobre LibriSpeech, CN-Celeb y VoxCeleb (subconjunto de 10 locutores de VoxCeleb1-O) para estudiar degradación fuera de dominio.

## Benchmarks y rendimiento

Datos reportados por el autor en la model card, sobre LibriSpeech (in-domain), con EER en configuración de 1 y 3 utterances:

| Punto de entrenamiento | EER 1-utt | EER 3-utt |
|---|---|---|
| Paso 400 | 19,43 % | 13,50 % |
| Paso 2000 (knee) | 9,73 % | 5,20 % |
| Paso 2400 (final) | 9,47 % | 5,60 % |
| Pooling universal (final) | 18,65 % | 14,27 % |

El autor indica que la desviación estándar entre semillas 0-2 del EER agrupado 1-utt es de 0,08-0,41 % absoluto, y que el intervalo de confianza bootstrap al 95 % con 8.000 ensayos tiene una semianchura de ~0,8 %. Como referencia externa, el autor cita ECAPA-TDNN sobre VoxCeleb2-dev con ~0,9 % EER en VoxCeleb1-O completo y sistemas de menos de 1M de parámetros con ~2 % (EfficientTDNN, 2022). No se han publicado resultados de benchmarks adicionales en la información disponible.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en FP32 para los 2,03 M de parámetros; en la práctica el cuello de botella es el frontend de audio y los buffers de frames, no los pesos.
- GPU recomendadas: cualquier GPU moderna sirve; el modelo se entrenó en una estación de trabajo con CPU, lo que indica que la inferencia es viable sin acelerador.
- Cabe en GPU de consumo: sí, en cualquier RTX (incluso series antiguas) y en iGPU con suficiente memoria compartida.
- Opciones de despliegue: la librería `flaxspeaker` (PyPI) es la vía natural; los pesos en safetensors permiten cargarlos con safetensors y JAX. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / audio | EER reportado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ls_conformer_small_ge2e_contrast` | 2,03 M | crops 90-180 frames en entrenamiento | 9,47 % (1-utt) / 5,60 % (3-utt) en LibriSpeech | Apache 2.0 | Hugging Face + PyPI |
| ECAPA-TDNN (referencia citada) | no disponible | no disponible | ~0,9 % en VoxCeleb1-O completo | no disponible | implementaciones comunitarias |
| EfficientTDNN (Wang et al., 2022) | <1 M | no disponible | ~2 % (corpus citado por el autor) | no disponible | no disponible |

La comparación no es directa: el checkpoint de FlaxSpeaker se entrena sobre 232 locutores de LibriSpeech, mientras que las referencias se entrenan sobre VoxCeleb2-dev (5.994 locutores, ~1,1 M de enunciados). El propio autor advierte que los EER absolutos no son equiparables y que el modelo está pensado para comparaciones relativas dentro de su benchmark.

## Limitaciones y advertencias

- Corpus de entrenamiento pequeño: 232 locutores y 5.788 enunciados; la diversidad de locutores limita el EER absoluto frente a sistemas industriales.
- Solo entrenado con LibriSpeech (inglés); el rendimiento fuera de dominio (CN-Celeb, VoxCeleb) se degrada y está documentado en `eval_results.json`.
- No es un producto oficial de Google y no reproduce los resultados a gran escala de los artículos originales.
- Riesgo de sesgo por acento, género, edad y condiciones de grabación del corpus de entrenamiento, no cuantificado en la información disponible.
- El frontend de audio no es un `AutoFeatureExtractor` de Hugging Face: requiere usar `flaxspeaker.AudioFrontend` con la configuración exacta (Mel de 80 dimensiones, VAD por energía, CMVN) para obtener resultados reproducibles.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte.
- No apto para generación de texto, razonamiento, código ni tareas multimodales.
- La ventana de audio de inferencia no está especificada; los crops de entrenamiento (90-180 frames) condicionan el comportamiento esperado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wq2012/ls_conformer_small_ge2e_contrast
- Colección FlaxSpeaker: https://huggingface.co/collections/wq2012/flaxspeaker
- Repositorio GitHub: https://github.com/wq2012/FlaxSpeaker
- Paquete PyPI: https://pypi.org/project/flaxspeaker/
- Paper GE2E: https://arxiv.org/abs/1710.10467
- Paper Dr-Vectors: https://arxiv.org/abs/2104.01989
- Paper ATP: https://arxiv.org/abs/2202.12163
- Paper PFAS: https://arxiv.org/abs/2203.05642
