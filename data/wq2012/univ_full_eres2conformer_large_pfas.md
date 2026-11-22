# wq2012/univ_full_eres2conformer_large_pfas

## Resumen

`univ_full_eres2conformer_large_pfas` es un modelo de verificación e identificación de hablante (speaker verification/recognition) desarrollado por el usuario `wq2012` dentro del proyecto FlaxSpeaker. No es un modelo de lenguaje generativo, sino un extractor de embeddings de hablante: recibe audio y produce una representación vectorial de 1280 dimensiones que permite decidir si dos fragmentos de audio corresponden a la misma persona. Está implementado en JAX/Flax como reimplementación desde cero, basada únicamente en papers publicados, de los algoritmos GE2E, Dr-Vectors, ATP y PFAS.

El modelo combina un backbone ERes2Conformer en variante `large` con pooling temporal híbrido `hybrid_pfas`, un objetivo de entrenamiento de Extended-Set Softmax mezclado y un scorer de verificación que combina similitud coseno con Parameter-Free Attentive Scoring (PFAS). Con 41.979.244 parámetros de inferencia (42.051.884 en el checkpoint completo, incluyendo pesos de clasificación solo de entrenamiento) y un repositorio de 0,3 GB, es un modelo compacto orientado a producción de sistemas de reconocimiento biométrico por voz.

Su relevancia radica en que se distribuye con licencia Apache 2.0, pesos en SafeTensors y Msgpack, y un ecosistema Python (`flaxspeaker >= 0.7.0`) que permite extraer embeddings y puntuar pares de audio con pocas líneas de código. Está entrenado sobre un pool universal multi-corpus (VoxCeleb1/2, CN-Celeb1/2 y LibriSpeech 960h) con 12.193 hablantes y 1.708.852 utterances limpias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ERes2Conformer (`large`) con pooling temporal `hybrid_pfas` |
| Parametros totales | 42.051.884 (checkpoint); 41.979.244 de inferencia (encoder + cabeza de scoring, excluye clasificador de entrenamiento) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa crops variables de 168-240 frames durante entrenamiento; no se documenta límite de inferencia) |
| Tipos de cuantizacion | no disponible (pesos en SafeTensors y Msgpack; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no disponible (el modelo opera sobre características acústicas; el entrenamiento incluye corpus en inglés y chino) |
| Licencia | Apache 2.0 |
| Formato de pesos | SafeTensors (`model.safetensors`), Flax Msgpack (`flax_model.msgpack`), configuración en `config.json` |
| Dimension de embedding | 1280 |
| Frontend de audio | Mel logarítmico natural de 80 dimensiones a 16 kHz + VAD por energía a nivel de frame + CMVN (`flaxspeaker.AudioFrontend`, no es un `AutoFeatureExtractor` de Hugging Face) |
| Objetivo de entrenamiento | Blended Extended-Set Softmax (0,50 row-softmax + 0,50 extended-set con desplazamiento de logit `-log N`) |
| Scorer de verificacion | Híbrido coseno + PFAS-SN: `(1 - alpha)*cos + alpha*PFAS`, `alpha=0.4018`; 256-D coseno + 8 claves x (32 + 96) |
| Libreria | `flaxspeaker >= 0.7.0` |
| Pipeline | `feature-extraction` |

## Arquitectura y entrenamiento

El backbone es un ERes2Conformer en variante `large`, una arquitectura híbrida que combina bloques convolucionales con mecanismos de atención tipo Conformer, adaptada para extracción de embeddings de hablante. Sobre la salida del encoder se aplica un pooling temporal `hybrid_pfas`, que combina agregación estadística con Parameter-Free Attentive Scoring, y se obtiene un vector de 1280 dimensiones. La verificación se realiza con un scorer híbrido que mezcla similitud coseno (256-D) con PFAS-SN (8 claves de 32 + 96 dimensiones) ponderado por `alpha=0.4018`.

El entrenamiento se realizó durante 24.000 pasos de gradiente con batch de 512 utterances (aproximadamente 7,19 épocas), warmup de 400 pasos y semilla 42, sobre un pool universal de 12.193 hablantes y 1.708.852 utterances limpias procedentes de VoxCeleb2-dev, VoxCeleb1-dev, CN-Celeb 1+2 y LibriSpeech 960h, con aumento de datos mediante perturbación de velocidad en tres vías y MUSAN/RIR. Se usaron crops variables de `U(168, 240)` frames con máscara de validez exacta. El objetivo de pérdida es un Blended Extended-Set Softmax propio de FlaxSpeaker (0,50 row-softmax + 0,50 extended-set con desplazamiento `-log N`), que no coincide con la ecuación 2 del paper original. La reproducibilidad está documentada con fingerprints de pérdida en el paso 0 y evaluación de varianza entre semillas (desviación estándar de EER agrupada de 0,08-0,41 % absoluto entre semillas 0-2).

## Capacidades

- Extracción de embeddings de hablante de 1280 dimensiones a partir de audio.
- Verificación de hablante (1:1): puntuación de similitud entre un audio de enrolamiento y uno de prueba.
- Identificación de hablante (1:N) mediante comparación de embeddings contra una galería.
- Reconocimiento de hablante independiente del texto (text-independent), al no depender de transcripción.
- Scoring híbrido coseno + PFAS-SN con normalización adaptativa (AS-Norm) y QMF documentados en la evaluación.
- Procesamiento de audio a 16 kHz con VAD por energía y CMVN integrados en el frontend.
- Soporte de tool calling / function calling: no disponible (no es un modelo generativo).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: el modelo opera sobre características acústicas y se entrenó con corpus en inglés (VoxCeleb, LibriSpeech) y chino (CN-Celeb), pero no se documenta un conjunto de idiomas soportados.
- Capacidades especiales: no dispone de modo thinking, visión ni audio generativo.

## Casos de uso

- Verificación biométrica en autenticación de usuarios: el modelo permite comparar la voz de un usuario enrolado con una muestra de acceso y obtener una puntuación de similitud, adecuado por su tamaño compacto (42 M de parámetros) y su licencia Apache 2.0 para despliegue comercial.
- Identificación de hablante en grabaciones de reuniones: extrayendo embeddings por segmento y comparándolos contra una galería de participantes, se puede atribuir cada intervención a una persona; el frontend integra VAD para segmentar el audio.
- Diarización de audio en pipelines de transcripción: los embeddings de 1280 dimensiones sirven como característica para agrupar segmentos por hablante antes o después de un sistema ASR.
- Control de acceso por voz en dispositivos embebidos: con 0,3 GB de pesos y 42 M de parámetros, el modelo es viable en hardware modesto, siempre que se disponga de un runtime JAX/Flax adecuado.
- Detección de fraude o suplantación en call centers: comparando la voz del interlocutor con la del titular registrado mediante el scorer híbrido coseno + PFAS-SN, con umbrales calibrados sobre minDCF.
- Investigación en biometría de voz: el checkpoint sirve como referencia reproducible (fingerprints de paso 0, evaluación multi-semilla y CIs bootstrap documentados) para comparar variantes de pooling, pérdida y scoring.
- Indexación y búsqueda de archivos de audio por hablante: los embeddings permiten construir un índice vectorial y recuperar fragmentos de una misma persona en archivos grandes.

## Benchmarks y rendimiento

La model card incluye una tabla de benchmarks de verificación de hablante zero-shot con columnas de EER crudo, EER con AS-Norm, EER con AS-Norm + QMF, minDCF@0.01 y ROC-AUC, sobre un conjunto de trials no especificado en la información disponible. Sin embargo, los valores numéricos de esa tabla no se han proporcionado en la información disponible, por lo que no se reproducen aquí.

No se han publicado resultados de benchmarks en la informacion disponible con cifras concretas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con cifras oficiales; con 42 M de parámetros en float32 el peso de los pesos ronda los 168 MB, y el repositorio completo ocupa 0,3 GB.
- GPU recomendadas: no se documentan GPU específicas; el modelo se entrenó en TPU (se menciona `bfloat16` en TPU en la fingerprint de paso 0), pero la inferencia puede ejecutarse en CPU o GPU con JAX.
- Cabe en GPU consumer: previsiblemente sí, dado el tamaño del checkpoint, aunque no se publican requisitos mínimos oficiales.
- Opciones de despliegue: `flaxspeaker >= 0.7.0` (API Python y script `scripts/inference.py`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `univ_full_eres2conformer_large_pfas` (este) | 42,05 M (41,98 M inferencia) | no disponible | Apache 2.0 | Hugging Face + PyPI `flaxspeaker` | ERes2Conformer large + hybrid PFAS, JAX/Flax |
| Modelos ECAPA-TDNN de referencia | no disponible | no disponible | variable | amplia en la comunidad | No se dispone de datos comparativos en la información proporcionada |
| Modelos WavLM/XVector de referencia | no disponible | no disponible | variable | amplia en la comunidad | No se dispone de datos comparativos en la información proporcionada |

No se dispone de datos comparativos verificados con alternativas concretas en la información proporcionada; la comparativa anterior solo identifica categorías de modelos comparables sin cifras.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; el entrenamiento se apoya en VoxCeleb, CN-Celeb y LibriSpeech, con posibles sesgos de dominio, género y acento no cuantificados.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de falsos positivos/negativos en la verificación; los umbrales deben calibrarse con minDCF sobre datos propios.
- Limitaciones de contexto o idioma: no se documenta un límite de duración de audio en inferencia ni un conjunto de idiomas soportados; el modelo se entrenó con corpus en inglés y chino.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la model card advierte explícitamente que no es un producto oficialmente soportado por Google.
- Caveat de producción: el frontend de audio no es un `AutoFeatureExtractor` de Hugging Face, por lo que no es directamente compatible con pipelines estándar de `transformers`; requiere `flaxspeaker`.
- Caveat de reproducibilidad: la pérdida del paso 0 depende del esquema de crops (variable vs. fijo); el checkpoint liberado usa crops variables `U(168, 240)` y la configuración debe respetarse para reproducir las métricas.
- Varianza entre semillas: la desviación estándar de EER entre semillas 0-2 es de 0,08-0,41 % absoluto, y el intervalo de confianza bootstrap al 95 % con 8.000 trials tiene una semianchura de ~0,8 %, lo que debe tenerse en cuenta al comparar sistemas.
- Dependencia de versión: requiere `flaxspeaker >= 0.7.0`; versiones anteriores pueden no cargar el checkpoint correctamente.

## Enlaces

- Hugging Face: https://huggingface.co/wq2012/univ_full_eres2conformer_large_pfas
- Colección FlaxSpeaker: https://huggingface.co/collections/wq2012/flaxspeaker
- Repositorio GitHub: https://github.com/wq2012/FlaxSpeaker
- Paquete PyPI: https://pypi.org/project/flaxspeaker/
- Paper GE2E: https://arxiv.org/abs/1710.10467
- Paper Dr-Vectors: https://arxiv.org/abs/2104.01989
- Paper ATP: https://arxiv.org/abs/2202.12163
- Paper PFAS: https://arxiv.org/abs/2203.05642
