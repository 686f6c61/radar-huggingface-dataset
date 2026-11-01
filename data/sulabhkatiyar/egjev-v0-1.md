# sulabhkatiyar/egjev-v0.1

## Resumen

EG-JEV v0.1 es un modelo de decisiones tipadas (typed decisions) construido como un fine-tune continuado de google/embeddinggemma-2, desarrollado por el autor independiente sulabhkatiyar. En lugar de generar texto libre, el modelo responde en una única pasada forward a preguntas de tipo Sí/No (Noul), elección (Choice) y puntuación (Score) sobre un estado de entrada, que puede ser texto, imagen o, como novedad en esta versión, audio. El modelo cuenta con 746 millones de parámetros y se distribuye en formato safetensors para la librería transformers.

La propuesta diferencial del autor no es el rendimiento estado del arte, sino la amplitud: según la model card, es uno de los primeros modelos de decisiones tipadas sobre EmbeddingGemma-2 que cubre simultáneamente texto en lenguas indias, imágenes y audio nativo. Incorpora una torre de audio congelada de 12 capas tipo conformer que procesa clips de 16 kHz mono de hasta 11,2 segundos (280 tokens de audio) y la conecta a las cabezas de decisión existentes.

La versión v0.1 añade audio nativo, unas 21.000 filas de VQA de imágenes en 11 lenguas indias traducidas automáticamente, mayor robustez en el etiquetado de rutas (routing) con 33-80 opciones y el split TRAIN de typed-decisions de LocalLLaMA (aproximadamente el 2 % de los tokens). El entrenamiento consumió un presupuesto de 95 millones de tokens con un learning rate del cuerpo de 5e-6 y las cabezas multiplicadas por 10.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base EmbeddingGemma-2) con cabezas de decisión tipada y torre de audio conformer de 12 capas congelada |
| Parametros totales | 746.148.667 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (clips de audio de hasta 11,2 s / 280 tokens de audio) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, hi, bn, ta, te, mr, gu, kn, ml, pa, or, as, ur, ne, sa, brx, doi, ks, kok, mai, mni, sat, sd |
| Licencia | egjev-mixed-research (license: other) |
| Formato de pesos | safetensors |
| Tamano del repo | 3.0 GB |
| Modelo base | google/embeddinggemma-2 (commit f9972ac2) |
| Libreria | transformers |
| Pipeline | no disponible |

## Arquitectura y entrenamiento

El modelo parte de EmbeddingGemma-2 y añade cabezas de decisión que responden, en una sola pasada forward empaquetada, a preguntas de tres tipos: Noul (Sí/No), Choice (elección entre opciones) y Score (puntuación). La entrada es un estado que puede ser texto, imagen o audio. Para el audio se utiliza una torre congelada de 12 capas tipo conformer que acepta clips de 16 kHz mono de hasta 11,2 segundos, equivalentes a 280 tokens de audio, y cuya salida alimenta las cabezas de decisión mediante la interfaz `Predictor.predict(state, questions, audio=waveform)`.

El entrenamiento se inicializó desde egjev-v0 y consumió un presupuesto de 95 millones de tokens, dimensionado en ejecución según el límite de cómputo disponible. Se empleó un learning rate de 5e-6 para el cuerpo del modelo con las cabezas multiplicadas por 10, 80 pasos de warmup y un schedule coseno. Los pesos publicados corresponden al último checkpoint que superó la puerta de validación EN-dev. Los datos de v0.1 incluyen el replay de v0 (texto EN e índico nativo y traducido, imagen EN e índica), audio de SIB-Fleurs (CC-BY-SA-4.0, redistribuido públicamente), Kathbath e IndicVoices (CC-BY-4.0, con acceso restringido y sin redistribución de contenido), VQA de imágenes traducidas a 11 lenguas índicas y el split TRAIN de typed-decisions de LocalLLaMA.

## Capacidades

- Decisiones tipadas sobre un estado: respuestas Sí/No (Noul), elección entre opciones (Choice) y puntuación (Score) en una única pasada forward.
- Entrada de texto en inglés y en 22 lenguas índicas (entre ellas hindi, bengalí, tamil, telugu, maratí, guyaratí, canarés, malabar, punyabí, oriya, asamés, urdú, nepalí y sánscrito).
- Entrada de imagen: respuesta a preguntas de decisión sobre imágenes, incluyendo QA visual en lenguas índicas (aproximadamente 21.000 filas de VQA traducidas en 11 lenguas).
- Entrada de audio nativa: clasificación y decisión sobre clips de voz de hasta 11,2 segundos (tema, coincidencia de transcripción, dominio, identificación de lengua).
- Robustez en el etiquetado de rutas (routing) con estados renderizados con 33-80 opciones.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking: no disponible.
- Generación de texto libre: no es una capacidad del modelo; su salida son decisiones tipadas, no texto generado.

## Casos de uso

- Enrutamiento de consultas en asistentes multilingües: el modelo puede decidir a qué categoría o departamento corresponde una consulta escrita en cualquiera de las 22 lenguas índicas soportadas, usando preguntas de tipo Choice con 33-80 opciones, lo que encaja con su entrenamiento específico en robustez de etiquetado de rutas.
- Moderación y clasificación binaria de contenido: las preguntas Noul permiten etiquetar textos o imágenes como aptos o no aptos en una sola pasada, con un coste de inferencia bajo al no requerir generación autoregresiva.
- QA visual sobre imágenes en lenguas índicas: con las aproximadamente 21.000 filas de VQA traducidas a 11 lenguas, el modelo responde preguntas de decisión sobre imágenes en contextos donde los modelos multimodales generales rinden peor por falta de datos nativos.
- Clasificación de audio por tema y dominio: la torre conformer permite etiquetar clips de voz de hasta 11,2 segundos por tema (SIB-Fleurs), dominio o identificación de lengua (IndicVoices), útil en pipelines de catalogación de archivos sonoros.
- Verificación de transcripciones: con los datos de Kathbath, el modelo puede comprobar si una transcripción coincide con el audio o si menciona un término concreto, como paso de control de calidad en pipelines de ASR.
- Filtrado y puntuación de pares en sistemas de recuperación: las preguntas Score permiten puntuar la relevancia de un par consulta-documento en lenguas índicas, integrándose como re-ranker ligero en un sistema RAG.
- Evaluación automática de respuestas: el modelo puede asignar puntuaciones de calidad a respuestas candidatas en inglés e índico, sustituyendo a evaluadores basados en LLM generativos en entornos con restricciones de latencia.

## Benchmarks y rendimiento

Resultados de la puerta de validación G-v01 (todas las ejecuciones en fp32 sobre 2×T4 de Kaggle):

| Gate | v0 | v0.1 | Umbral | Resultado |
|---|---|---|---|---|
| EN dev (dmix_v2_dev5k) Noul / Choice / Score ρ | 89.8 / 69.8 / 0.737 | 89.7 / 70.1 / 0.731 | ≥ 88.6 / 67.9 / 0.727 | PASS |
| EN macro, 18 sets Noul / Choice | 77.7 / 70.2 | 77.8 / 70.3 | ≥ v0 − 0.5 | PASS |
| EN Score ρ macro (gate modificado post hoc) | 0.7825 | 0.7777 | tolerancia −0.005 | PASS por 0.0002 |
| EN Score ρ macro (gate original preregistrado, 3 sets) | 0.752 | 0.710 | — | FAIL |
| EN sets peor que v0 (McNemar p < 0.01) | — | 1 (en/phishnchips Noul 67.5 vs 69.5, p = 0.002) | ≤ 1 | PASS |
| EN image macro Noul / Choice | 83.7 / 60.2 | 83.2 / 60.1 | ≥ v0 − 1 | PASS |
| Indic text macro (7 sets) Noul / Choice | 73.5 / 59.3 | 73.8 / 60.1 | ≥ v0 − 0.5 | PASS |
| CVQA Indic (preguntas nativas) | 41.0 | 41.8 | ≥ 41.0 | PASS |
| Audio (acc − azar; caída con audio en blanco) | n/a | +57,7 pt; caída 52,4 pt | ≥ +15 pt; caída ≥ 10 pt | PASS |

Resultados de solo informe:

| Conjunto | Métrica | Valor |
|---|---|---|
| typed_decisions_test (2.000 preguntas) | Noul / Choice / Score ρ | 72,7 / 60,7 / 0,645 |
| aokvqa_val_mt11 (11 lenguas, traducido automáticamente) | accuracy | 61,9 (n = 1.118) |
| cq_comprehension | accuracy / azar / audio en blanco | 62,9 / 26,6 / 30,6 (n = 124) |
| cq_k1_dev | accuracy / azar / audio en blanco | 69,7 / 26,3 / 28,9 (n = 76) |
| cq_k1_holdout | accuracy / azar / audio en blanco | 59,6 / 25,0 / 26,3 (n = 57) |
| IndicVoices domain/LID | accuracy | 78,2 (azar 20,0) |
| Kathbath match/say | accuracy | 96,5 (azar 37,5) |
| SIB-Fleurs topic | accuracy | 70,3 (azar 14,3) |

## Requisitos de hardware

- VRAM estimada para inferencia: con 746 millones de parámetros, en fp16 se requieren aproximadamente 1,5 GB de pesos; en fp32, unos 3 GB. La información proporcionada no detalla el consumo de memoria del pipeline completo.
- GPU recomendadas: la evaluación se ejecutó en 2×T4 de Kaggle en fp32, lo que indica que el modelo cabe holgadamente en GPUs de gama media.
- Compatibilidad con GPU de consumo: sí, por tamaño cabe en cualquier GPU de consumo con al menos 4 GB de VRAM (por ejemplo, RTX 3060, RTX 4060, RTX 4090), aunque no se han publicado mediciones específicas en estas tarjetas.
- Opciones de despliegue: la librería indicada es transformers; la información no confirma soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EG-JEV v0.1 | 746 M | no disponible | Decisiones tipadas sobre texto, imagen y audio (EmbeddingGemma-2) | egjev-mixed-research | HuggingFace |
| egjev-v0 | no disponible | no disponible | Decisiones tipadas sobre texto e imagen (sin audio) | no disponible | HuggingFace (sulabhkatiyar/egjev-v0) |
| laya-indic | no disponible | no disponible | Decisiones/embeddings para lenguas índicas | no disponible | no disponible |
| yama-indic | no disponible | no disponible | Decisiones/embeddings para lenguas índicas | no disponible | no disponible |

El autor declara explícitamente que no reclama superar a laya-indic ni a yama-indic en benchmarks índicos, y que no persiguió dichos benchmarks. No se dispone de datos comparativos adicionales en la información proporcionada.

## Limitaciones y advertencias

- La calidad en inglés se describe como "suficiente" frente a otros modelos de decisión basados en EmbeddingGemma; no es una reclamación de estado del arte.
- El gate original preregistrado de Score ρ en inglés (3 conjuntos, incluido en/jevbench_public) falló: 0.710 frente a 0.752 de v0. El autor lo sustituyó post hoc por un gate de 2 conjuntos que pasa por un margen de 0.0002, lo que supone un cambio de criterio de evaluación relevante.
- El conjunto en/phishnchips Noul empeora de forma estadísticamente significativa respecto a v0 (67,5 frente a 69,5, p = 0.002).
- Los resultados de typed_decisions_test proceden de un modelo ajustado sobre el split de entrenamiento del mismo generador sintético: tras descontaminar, el 7,75 % de los casos de test comparten un 13-grama con los de entrenamiento, por lo que debe tratarse como un número de especialista ajustado, no como una evaluación general.
- Los resultados de aokvqa_val_mt11 y de la QA visual índica usan traducción automática, por lo que no constituyen benchmarks nativos.
- Los resultados por lengua en audio complejo se basan en 2-15 muestras por lengua, por lo que son ruidosos.
- Riesgo de sesgo y alucinación: no documentado en la información proporcionada; el modelo no genera texto libre, lo que limita el riesgo de alucinación textual, pero las decisiones pueden ser erróneas en distribuciones no vistas.
- Licencia egjev-mixed-research (license: other): las condiciones exactas de uso comercial no están detalladas en la información disponible; además, el modelo incorpora datos con licencia CC-BY-SA-4.0 (SIB-Fleurs) que imponen share-alike sobre el contenido redistribuido.
- Los datos de Kathbath e IndicVoices son de acceso restringido y no se redistribuyen, lo que puede afectar a la reproducibilidad del entrenamiento.
- La longitud de contexto no está publicada; para audio el límite conocido es de 11,2 segundos por clip.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sulabhkatiyar/egjev-v0.1
- Versión anterior: https://huggingface.co/sulabhkatiyar/egjev-v0
- Modelo base: https://huggingface.co/google/embeddinggemma-2
- Dataset público de audio SIB-Fleurs: https://huggingface.co/sulabhkatiyar/egjev-data-v01
- Dataset SIB-Fleurs original: https://huggingface.co/datasets/WueNLP/sib-fleurs
- Dataset Kathbath: https://huggingface.co/datasets/ai4bharat/Kathbath
- Dataset IndicVoices: https://huggingface.co/datasets/ai4bharat/IndicVoices
