# wq2012/univ_full_conformer_large_dr_vectors

## Resumen

`univ_full_conformer_large_dr_vectors` es un modelo de extracción de embeddings de locutor (speaker embeddings) desarrollado por el usuario wq2012 dentro del proyecto FlaxSpeaker, una reimplementación desde cero en JAX/Flax de algoritmos clásicos de verificación de locutor publicados en la literatura (GE2E, Dr-Vectors, ATP y PFAS). No es un modelo de lenguaje: su función es convertir una grabación de audio en un vector de 256 dimensiones que representa la identidad del hablante, y puntuar la similitud entre dos audios para tareas de verificación e identificación de locutor.

El checkpoint es un modelo "flagship" universal entrenado con datos abiertos de múltiples corpus (VoxCeleb1/2, CN-Celeb 1+2 y LibriSpeech 960h), cubriendo 12.193 locutores y 464.557 enunciados limpios, ampliados mediante perturbación de velocidad y aumentación con MUSAN/RIR. La arquitectura combina un backbone Conformer de tamaño "large" con pooling temporal atento (ATP) y una cabeza de scoring basada en una variante reducida de Dr-Vectors.

Es relevante porque ofrece, bajo licencia Apache 2.0 y formato safetensors, un pipeline completo de verificación de locutor en JAX/Flax con resultados de evaluación publicados (EER, minDCF, ROC-AUC) sobre benchmarks estándar, algo poco habitual en el ecosistema JAX para esta tarea. Su tamaño compacto (22,17 M de parámetros de inferencia) lo hace viable en CPU y GPU de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer (variante `large`) con pooling temporal atento (ATP) y cabeza de scoring Dr-Vector |
| Parametros totales | 22.173.577 (dato real de safetensors; encoder + cabeza de scoring, excluye pesos de clasificador solo de entrenamiento) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de audio; usa crops de 140-200 frames durante entrenamiento, sin ventana de contexto textual) |
| Tipos de cuantizacion | No disponible (pesos en safetensors y msgpack; no se documentan variantes cuantizadas) |
| Idiomas soportados | No disponible (es un modelo de identidad de locutor, no de reconocimiento de habla; entrenado con corpus multilingües: inglés, chino y otros presentes en VoxCeleb/CN-Celeb/LibriSpeech) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`) y Flax msgpack (`flax_model.msgpack`) |

## Arquitectura y entrenamiento

El modelo usa un backbone Conformer de configuración "large" para extraer representaciones acústicas frame a frame, seguido de un pooling temporal atento (ATP, adaptado de un trabajo de identificación de idioma) que agrega la secuencia en un único vector de 256 dimensiones. Sobre ese vector se aplica una cabeza de scoring basada en una variante reducida de Dr-Vectors: sin separación base/side-info, con una MLP oculta de (256, 128) con ReLU y LayerNorm, peso residual fijo de 0,2 y una expansión coseno de tres términos (extensión propia de FlaxSpeaker). El frontend de audio es un Mel logarítmico natural de 80 dimensiones a 16 kHz, con VAD a nivel de frame y CMVN, implementado en `flaxspeaker.AudioFrontend` y no como un `AutoFeatureExtractor` de Hugging Face.

El entrenamiento se realizó durante 16.000 pasos de gradiente (warmup de 800 pasos, batch de 256 enunciados, semilla 42, aproximadamente 8,82 épocas) sobre un pool universal de 12.193 locutores y 464.557 enunciados limpios de VoxCeleb2-dev, VoxCeleb1-dev, CN-Celeb 1+2 y LibriSpeech 960h, sin solapamiento de locutores con los conjuntos de evaluación. Se aplicó perturbación de velocidad de tres vías y aumentación con MUSAN y RIR. La función de pérdida es un Extended-Set Softmax mezclado (0,50 row-softmax + 0,50 extended-set con desplazamiento de logit -log N), una variante propia de FlaxSpeaker que no coincide con la Eq. 2 del paper original. Los crops de entrenamiento son de longitud variable U(140, 200) frames con máscara de validez exacta; la model card documenta una verificación de reproducibilidad del step-0 loss (0,1969 con crops variables frente a 0,1967 archivado, y 0,1513 con crops fijos de 200 frames).

## Capacidades

- Extracción de embeddings de locutor de 256 dimensiones a partir de audio.
- Verificación de locutor (1:1): puntuación de similitud entre un audio de enrolamiento y uno de test.
- Identificación de locutor (1:N): comparación de un embedding contra una galería de referencia.
- Scoring con normalización AS-Norm y QMF (según los resultados de evaluación publicados).
- Evaluación con múltiples utterances por locutor (métricas 1-utt y 3-utt).
- Funcionamiento zero-shot sobre locutores no vistos en entrenamiento.
- Robustez multi-dominio: entrenado con corpus de entrevistas/web (VoxCeleb), conversacional chino (CN-Celeb) y lectura (LibriSpeech).
- No soporta tool calling, agentes, visión ni generación de texto: es un modelo de feature extraction de audio.

## Casos de uso

- Verificación biométrica de acceso: el modelo compara un audio de enrolamiento con el audio de test y devuelve una puntuación de similitud; su tamaño de 22 M de parámetros permite desplegarlo en servidores modestos o incluso en CPU para flujos de autenticación por voz.
- Identificación de hablante en grabaciones largas: extracción de embeddings por segmento y comparación contra una galería de locutores conocidos, aprovechando el pooling ATP para agregar secuencias de duración variable.
- Diarización de reuniones: uso de los embeddings como característica de identidad para agrupar segmentos de audio por hablante en pipelines de transcripción con separación de interlocutores.
- Detección de fraude y suplantación de voz: la puntuación de verificación sirve como señal complementaria en sistemas antifraude que comparan la voz entrante con la voz registrada del cliente.
- Indexación y búsqueda de archivos de audio: generación de embeddings para construir un índice vectorial que permita buscar apariciones de un locutor concreto en un archivo de medios.
- Control de calidad de datasets de voz: verificación de que los segmentos etiquetados con un mismo locutor pertenecen realmente a esa persona, detectando errores de anotación en corpus de ASR.
- Investigación en JAX/Flax: reproducción de experimentos de verificación de locutor con pesos públicos y métricas de referencia documentadas, útil para comparar variantes de pooling o de función de pérdida.

## Benchmarks y rendimiento

La model card incluye una tabla de benchmarks de verificación de locutor zero-shot con columnas de EER bruto, EER con AS-Norm, EER con AS-Norm + QMF, minDCF@0,01 y ROC-AUC sobre distintos conjuntos de trials. Sin embargo, los valores numéricos de esa tabla no están disponibles en la información proporcionada (la tabla aparece truncada), por lo que no se reproducen cifras concretas.

| Benchmark | Trials | EER bruto (%) | EER AS-Norm (%) | EER AS-Norm + QMF (%) | minDCF@0,01 | ROC-AUC |
|---|---|---|---|---|---|---|
| VoxCeleb1-O y otros conjuntos | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

La model card sí documenta datos de variabilidad: la desviación estándar entre semillas 0-2 del EER agrupado 1-utt es de 0,08-0,41 % absoluto, y el intervalo de confianza bootstrap del 95 % con 8.000 trials tiene una semi-amplitud de aproximadamente 0,8 %. Los resultados completos están en `eval_results.json` del repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 22,17 M de parámetros en float32 los pesos ocupan aproximadamente 85-90 MB, más el estado del frontend y buffers de audio.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria libre; funciona en RTX 3060, RTX 4090, A100, H100 y similares. Para cargas por lotes grandes conviene una GPU con más memoria.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: la librería `flaxspeaker >= 0.8.0` (API `load_pretrained`, `extract_embedding`, `verify`) y el script `scripts/inference.py` del repositorio. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `wq2012/univ_full_conformer_large_dr_vectors` | 22,17 M (inferencia) | Audio 16 kHz, crops 140-200 frames en entrenamiento | Speaker verification / embeddings | Apache 2.0 | Hugging Face, PyPI (`flaxspeaker`) |
| Alternativas de la misma categoría (p. ej. modelos de speaker verification en PyTorch) | No disponible | No disponible | Speaker verification | No disponible | No disponible |

No se dispone en la información proporcionada de datos verificables sobre modelos comparables de la misma categoría (parámetros, contexto, rendimiento o licencia), por lo que la comparativa cuantitativa se marca como no disponible.

## Limitaciones y advertencias

- Sesgos conocidos: el entrenamiento se apoya en VoxCeleb, CN-Celeb y LibriSpeech, corpus con sesgos de género, acento, edad y condiciones de grabación; el rendimiento puede degradarse en poblaciones o dominios poco representados.
- Riesgo de alucinación: no aplica en el sentido generativo, pero la puntuación de verificación puede producir falsos positivos o negativos; se recomienda calibrar el umbral con datos propios y usar AS-Norm cuando sea posible.
- Limitaciones de contexto o idioma: es un modelo de identidad de locutor, no de reconocimiento de habla; no transcribe ni comprende el contenido lingüístico. La información sobre idiomas soportados no está disponible.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la model card advierte explícitamente que no es un producto oficialmente soportado por Google y que es una reimplementación independiente basada solo en papers publicados.
- Caveats para producción: requiere `flaxspeaker >= 0.8.0`; el frontend de audio es propio (`flaxspeaker.AudioFrontend`) y no un `AutoFeatureExtractor` de Hugging Face, lo que complica la integración con pipelines estándar; el modelo se distribuye en safetensors y msgpack, sin variantes cuantizadas documentadas; la reproducibilidad depende de la configuración exacta de crops variables (`variable_length_training: true`).
- El repositorio tiene un tamaño de 0,5 GB y solo 190 descargas en el momento de la consulta, lo que indica una adopción todavía limitada.

## Enlaces

- Hugging Face: https://huggingface.co/wq2012/univ_full_conformer_large_dr_vectors
- Colección FlaxSpeaker en Hugging Face: https://huggingface.co/collections/wq2012/flaxspeaker
- Repositorio GitHub: https://github.com/wq2012/FlaxSpeaker
- Paquete PyPI: https://pypi.org/project/flaxspeaker/
- Paper GE2E: https://arxiv.org/abs/1710.10467
- Paper Dr-Vectors: https://arxiv.org/abs/2104.01989
- Paper ATP: https://arxiv.org/abs/2202.12163
- Paper PFAS: https://arxiv.org/abs/2203.05642
