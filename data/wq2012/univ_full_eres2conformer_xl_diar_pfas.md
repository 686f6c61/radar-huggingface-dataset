# wq2012/univ_full_eres2conformer_xl_diar_pfas

## Resumen

`univ_full_eres2conformer_xl_diar_pfas` es un modelo de reconocimiento de hablante (speaker verification y speaker recognition) desarrollado por el usuario wq2012 dentro del proyecto FlaxSpeaker. No es un modelo de lenguaje: es un extractor de embeddings de hablante que convierte una locución de audio en un vector de 1280 dimensiones que representa la identidad de la voz, y que además incorpora una cabeza de puntuación para verificación. Está implementado en JAX/Flax, no en PyTorch, y se distribuye con pesos en safetensors y msgpack.

El checkpoint es una reimplementación desde cero, basada únicamente en artículos publicados (GE2E, Dr-Vectors, ATP y PFAS), de algoritmos de reconocimiento de hablante. Se presenta como un modelo "universal flagship" entrenado sobre siete corpus (VoxCeleb1/2, CN-Celeb1/2, LibriSpeech 960h, Fisher, AMI, ICSI y CallHome) con 24.110 hablantes y 2.481.542 locuciones limpias, ampliadas mediante perturbación de velocidad y aumentación MUSAN/RIR.

Su relevancia radica en dos aspectos: por un lado, ofrece un pipeline completo de verificación de hablante en el ecosistema JAX/Flax, poco poblado en comparación con PyTorch; por otro, integra una cabeza de scoring híbrida (coseno + PFAS) que evita depender de un clasificador lineal entrenado solo para el conjunto de entrenamiento. El modelo tiene 77.049.960 parámetros de inferencia (encoder más cabeza de scoring) y una dimensión de embedding de salida de 1280.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ERes2Conformer (variante `xl`), backbone convolucional + conformer para embeddings de hablante |
| Parametros totales | 77.049.960 (encoder + cabeza de scoring; excluye pesos del clasificador solo de entrenamiento) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa locuciones de audio; entrenado con recortes variables de 80 a 200 frames) |
| Tipos de cuantizacion | no disponible (pesos en safetensors y msgpack; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no disponible (el modelo opera sobre características acústicas; los corpus de entrenamiento incluyen inglés y chino, entre otros) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`) y Flax msgpack (`flax_model.msgpack`) |
| Dimensión de embedding | 1280 |
| Pooling temporal | `hybrid_pfas` |
| Objetivo de entrenamiento | Extended-Set Softmax mezclado (0.50 row-softmax + 0.50 extended-set con desplazamiento -log N) |
| Scorer de verificación | Coseno + PFAS-SN híbrido (alpha = 0.35; coseno 256-D + 8 claves x (32 + 96)) |
| Frontend de audio | Mel logarítmico natural de 80 dims a 16 kHz + VAD por energía a nivel de frame + CMVN (no es `AutoFeatureExtractor` de HF) |
| Pasos de entrenamiento | 24.000 pasos, batch 32, semilla 42 (~4.95 épocas) |
| Librería | flaxspeaker >= 0.8.0 |

## Arquitectura y entrenamiento

El backbone es un ERes2Conformer en variante `xl`, una arquitectura que combina capas convolucionales (para capturar patrones locales en el espectrograma) con bloques conformer (atención y convolución para dependencias temporales). Sobre la salida del encoder se aplica un pooling temporal `hybrid_pfas`, que combina atención tipo PFAS con agregación estadística. El modelo produce un embedding de 1280 dimensiones por locución.

El entrenamiento se realizó sobre un pool de siete corpus con 24.110 hablantes y 2.481.542 locuciones limpias, ampliadas con perturbación de velocidad en tres vías y aumentación MUSAN/RIR. La función de pérdida es un Extended-Set Softmax mezclado (0.50 row-softmax + 0.50 extended-set con desplazamiento de logit -log N), una variante propia del proyecto que no coincide con la ecuación 2 del artículo original. Se usaron recortes variables de 80 a 200 frames con máscara de validez exacta; el autor documenta que esta configuración reproduce el fingerprint de pérdida del paso 0 archivado (0.136) con una diferencia inferior a 0.0001 frente al valor de referencia en TPU bfloat16. El scorer de verificación es híbrido: combina similitud coseno (256-D) con PFAS-SN (8 claves x (32 + 96)) mediante alpha = 0.35.

## Capacidades

- Extracción de embeddings de hablante de 1280 dimensiones a partir de audio de una locución.
- Verificación de hablante (1:1): compara dos locuciones y devuelve una puntuación de similitud.
- Reconocimiento de hablante (1:N) mediante comparación de embeddings contra una galería.
- Puntuación híbrida coseno + PFAS-SN, que no requiere recalibrar un clasificador lineal para conjuntos cerrados.
- Evaluación multi-dominio: el repositorio incluye métricas de EER (1 y 3 locuciones), minDCF y ROC-AUC con intervalos de confianza bootstrap al 95 %.
- Soporte de audio conversacional y de diarización: el pool de entrenamiento incluye AMI, ICSI y CallHome con turnos conversacionales restados por solapamiento.
- Interfaz Python (`load_pretrained`, `extract_embedding`, `verify`) y script de inferencia por línea de comandos.
- No soporta tool calling, agentes, generación de texto, visión ni razonamiento multi-paso: es exclusivamente un modelo de audio.

## Casos de uso

- Verificación biométrica de voz en autenticación: el modelo compara una locución de enrolamiento con una de prueba y devuelve una puntuación de similitud; es adecuado por su embedding de 1280 dimensiones y su scorer híbrido calibrado con PFAS.
- Deduplicación de hablantes en archivos de audio: extrayendo embeddings de cada segmento y agrupándolos por similitud coseno se pueden identificar locuciones del mismo hablante en un corpus.
- Diarización de reuniones: el modelo se entrenó con AMI, ICSI y CallHome con turnos conversacionales, por lo que sus embeddings son útiles para segmentar quién habla en cada momento.
- Indexación y búsqueda por voz en archivos multimedia: los embeddings permiten construir un índice vectorial para recuperar locuciones de un hablante concreto.
- Control de calidad de datasets de voz: detectar locuciones mal etiquetadas o hablantes duplicados comparando embeddings contra una galería de referencia.
- Investigación en reconocimiento de hablante en JAX/Flax: sirve como checkpoint de referencia para reproducir experimentos y comparar arquitecturas sin salir del ecosistema JAX.
- Filtrado de hablantes en pipelines de transcripción: asociar cada segmento transcrito a un hablante mediante embeddings antes de la transcripción final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio incluye un archivo `eval_results.json` con métricas multi-dominio (EER de 1 y 3 locuciones, minDCF, ROC-AUC, intervalos bootstrap al 95 % y un subconjunto de 10 hablantes de VoxCeleb1-O), pero los valores concretos no se han proporcionado en la información disponible, por lo que no se reproducen aquí.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 77 millones de parámetros, los pesos en float32 ocupan aproximadamente 0,31 GB y en bfloat16 unos 0,15 GB, por lo que el modelo cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente para inferencia; se ha validado en TPU (bfloat16) durante el entrenamiento y en CPU (float32) para la sonda de fingerprint.
- Cabe en GPU consumer: sí, en cualquier RTX o equivalente; también en CPU para inferencia de una sola locución.
- Opciones de despliegue: la librería `flaxspeaker` (>= 0.8.0) con JAX/Flax; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| `univ_full_eres2conformer_xl_diar_pfas` | 77,0 M | no disponible (audio) | Apache 2.0 | safetensors, msgpack | Hugging Face, PyPI |
| ECAPA-TDNN (referencia habitual en speaker verification) | ~20 M (variantes) | no disponible (audio) | variable segun implementacion | PyTorch | amplia en la comunidad |
| WavLM-based speaker models | ~90-300 M | no disponible (audio) | variable | PyTorch | Hugging Face |
| Reimplementaciones GE2E/Dr-Vectors en PyTorch | variable | no disponible (audio) | variable | PyTorch | repositorios comunitarios |

La comparación cuantitativa de EER y minDCF frente a estas alternativas no está disponible en la información proporcionada. La diferencia principal de este checkpoint frente a las alternativas es su implementación nativa en JAX/Flax y su scorer híbrido coseno + PFAS, que evita depender de un clasificador lineal de conjunto cerrado.

## Limitaciones y advertencias

- El autor declara explícitamente que no es un producto oficialmente soportado por Google; es una reimplementación independiente basada en artículos publicados.
- El modelo no es un modelo de lenguaje: no genera texto, no razona y no soporta tool calling ni agentes.
- Los sesgos demográficos y acústicos no están documentados en la información disponible; como todo sistema biométrico de voz, puede presentar diferencias de rendimiento entre grupos de hablantes, canales y condiciones de grabación.
- Riesgo de falsos positivos y falsos negativos en verificación: las métricas EER y minDCF dependen del umbral y del dominio; el autor reporta una desviación estándar entre semillas de 0,08-0,41 % absoluto y un intervalo bootstrap al 95 % de aproximadamente 0,8 %, lo que debe tenerse en cuenta al fijar umbrales en producción.
- El frontend de audio no es un `AutoFeatureExtractor` de Hugging Face: requiere la clase `AudioFrontend` de `flaxspeaker` con Mel logarítmico de 80 dimensiones a 16 kHz, VAD por energía y CMVN; usar otro frontend degradará los resultados.
- El modelo se entrenó con recortes variables de 80 a 200 frames; locuciones mucho más largas o más cortas pueden requerir segmentación previa.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte oficial.
- No se documentan cuantizaciones oficiales (GGUF, INT8); el despliegue en entornos con restricciones de memoria debe basarse en los pesos safetensors o msgpack.

## Enlaces

- Hugging Face: https://huggingface.co/wq2012/univ_full_eres2conformer_xl_diar_pfas
- Colección FlaxSpeaker: https://huggingface.co/collections/wq2012/flaxspeaker
- Repositorio GitHub: https://github.com/wq2012/FlaxSpeaker
- Paquete PyPI: https://pypi.org/project/flaxspeaker/
- GE2E (arXiv:1710.10467): https://arxiv.org/abs/1710.10467
- Dr-Vectors (arXiv:2104.01989): https://arxiv.org/abs/2104.01989
- ATP (arXiv:2202.12163): https://arxiv.org/abs/2202.12163
- PFAS (arXiv:2203.05642): https://arxiv.org/abs/2203.05642
