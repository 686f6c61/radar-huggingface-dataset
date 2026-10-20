# vprojectx/Lewis-44M-Bert-v2

## Resumen

Lewis-44M-Bert v2 es un codificador (encoder) Transformer bidireccional de 43.845.680 parámetros entrenado desde cero con el objetivo de masked language modeling (MLM) por el usuario vprojectx. Es la segunda iteración de Lewis-44M-Bert (v1): mantiene arquitectura, tokenizador y tokens especiales, y añade 1.680 millones de tokens únicos nuevos hasta un total de aproximadamente 2.700 millones, lo que lo convierte en un reemplazo directo de v1 sin cambios en el código de integración.

Su interés práctico está en la relación entre coste y prestaciones: se entrenó íntegramente en una única GPU de consumo (NVIDIA RTX 5050, 8 GB de VRAM) en unas 31 horas agregadas, y alcanza una media de 75,22 en GLUE dev (8 tareas, WNLI excluida), frente a 75,04 de v1. No compite con BERT-base (83,0) ni con DistilBERT (79,6), pero ofrece un encoder Apache 2.0 muy ligero (repo de 0,2 GB) para clasificación, reranking y etiquetado en entornos con recursos mínimos.

La arquitectura incorpora varias decisiones modernas poco habituales en modelos de este tamaño: codificación posicional rotatoria (RoPE) calculada en fp32, RMSNorm pre-norm, FFN con GeGLU, QK-norm en la atención y SDPA bidireccional sin sesgos. La longitud de contexto máxima es de 512 tokens y el modelo es exclusivamente monolingüe en inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder bidireccional (masked LM), 10 capas, hidden 512, 8 cabezas (dim 64) |
| Parametros totales | 43.845.680 (embeddings atados a la capa de salida del MLM) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (no se publican versiones cuantizadas; pesos en safetensors) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors; requiere `trust_remote_code=True` por arquitectura custom |
| FFN | GeGLU, tamaño intermedio 1152 |
| Normalizacion | RMSNorm pre-norm, más norm de embedding y norm final |
| Codificacion posicional | RoPE, theta = 10.000, calculada en fp32 |
| Vocabulario | 30.000 tokens, BPE byte-level con distinción de mayúsculas, sin token UNK |
| Tokens especiales | `<pad>`=0, `<unk>`=1, `<s>`=2 (BOS), `</s>`=3 (EOS), `<mask>`=4 |
| Tamano del repositorio | 0,2 GB |
| Pipeline | fill-mask |

## Arquitectura y entrenamiento

El modelo sigue el patrón de encoder bidireccional tipo BERT, pero con componentes adoptados de arquitecturas más recientes: 10 capas de atención con 8 cabezas de dimensión 64, hidden size 512, FFN GeGLU con dimensión intermedia 1152, RMSNorm en configuración pre-norm (con normalización adicional en embeddings y a la salida), QK-norm dentro de la atención y SDPA bidireccional sin términos de sesgo. La posición se codifica con RoPE (theta 10.000, cómputo en fp32) en lugar de embeddings posicionales aprendidos. La cabeza MLM es una capa dense con GELU, RMSNorm y decodificador atado con sesgo. El entrenamiento usa enmascarado al 25 % con esquema 80/10/10.

Los datos se dividieron en dos etapas. La etapa 1 (v1) empleó ~1.000 millones de tokens únicos durante 2 epochs: FineWeb-Edu con score >= 3,5 (50 %), Wikipedia (25 %), Project Gutenberg (15 %) y Cosmopedia (10 %). La etapa 2 (v2) añadió 1.680 millones de tokens únicos en 1 epoch, descartando documentos ya vistos en la etapa 1 y eliminando duplicados exactos: FineWeb-Edu nuevo (838,5 M, 50,0 %), Project Gutenberg nuevo (360,2 M, 21,5 %), Wikipedia en inglés del 2023-11-01 (240,1 M, 14,3 %), cc_news (200,1 M, 11,9 %) y Q&A estilo ELI5 (38,5 M, 2,3 %). El conjunto de validación es el mismo que en v1 (3.875 secuencias), lo que hace comparables las pérdidas.

En la etapa 2 se partió de los pesos finales de v1 con estado del optimizador reiniciado: AdamW (0,9 / 0,98, eps 1e-6, weight decay 0,01), LR pico 2e-4 hasta 2e-5 con decaimiento coseno, 511 pasos de warmup, batches de 65.536 tokens y 25.569 pasos, en precisión bf16 con autocast, TF32 y `torch.compile`. La pérdida MLM en held-out bajó de 1,987 a 1,930 (perplejidad de 7,29 a 6,89), medida al 25 % de enmascarado y por tanto no comparable con perplejidades publicadas al 15 %. Todo el cómputo se realizó en una RTX 5050 de 8 GB: unas 21 horas para la etapa 1 y unas 10 horas para la etapa 2, con un throughput registrado de 23.000 a 45.000 tokens/s.

## Capacidades

- Relleno de máscaras (fill-mask): predice el token ausente en una secuencia enmascarada, con salida sobre un vocabulario de 30.000 tokens sin UNK.
- Representaciones contextuales de tokens: base para fine-tuning supervisado en clasificación de frases y pares de frases, NLI, similitud semántica y regresión sobre texto.
- Clasificación de secuencia: la cabeza de clasificación agrupa la posición 0, por lo que toda entrada debe empezar por `<s>`; para pares de frases el formato es `<s> A </s> B </s>`.
- Evaluado en 8 tareas de GLUE: CoLA, SST-2, MRPC, QQP, STS-B, MNLI, QNLI y RTE.
- Capacidad multilingüe: no disponible; el modelo es solo inglés (entrenado con FineWeb-Edu, Wikipedia en inglés, Gutenberg, cc_news y ELI5).
- Tool calling / function calling: no soportado (es un encoder, no un modelo instruido para emitir llamadas a herramientas).
- Agentes y razonamiento multi-paso: no soportado; no hay generación autorregresiva ni modo thinking.
- Visión, audio y modalidades adicionales: no soportado.
- Razonamiento matemático o generación de código: no evaluado ni soportado de forma nativa; el modelo no genera texto libre.

## Casos de uso

- Clasificación de texto en producción: fine-tuning de la cabeza de secuencia sobre el dataset propio (por ejemplo, sentimiento, intención o tópico); con 44 M de parámetros el modelo se sirve en CPU y el coste por petición es mínimo, y los resultados de GLUE (SST-2 89,9; QQP 89,6/86,1) indican que el fine-tuning converge bien en tareas de clasificación estándar.
- Reranking en búsqueda semántica: usar el modelo como cross-encoder que puntúa pares `<s> consulta </s> documento </s>` para reordenar el top-k de un retriever previo; sus resultados en STS-B (Pearson 83,5 / Spearman 83,2) y MRPC (78,4 / 84,9) lo hacen viable para ese rol cuando el presupuesto de latencia es ajustado.
- Detección de duplicados y paráfrasis: clasificación de pares de frases con el formato `<s> A </s> B </s>` para deduplicar catálogos, tickets o artículos; la ventana de 512 tokens cubre párrafos completos, suficientes para comparar fragmentos.
- Filtrado y puntuación de calidad de datos para pipelines de pretraining: fine-tuning sobre ejemplos etiquetados como los de FineWeb-Edu (score >= 3,5) para construir un clasificador de calidad que prefiltrе corpus web antes de alimentar modelos mayores, ejecutable a miles de documentos por segundo en hardware modesto.
- Moderación de contenido y enrutado de tickets: clasificador multi-clase sobre el texto del ticket que decide cola o prioridad; al ocupar menos de 1 GB en memoria se puede desplegar junto al servicio de atención al cliente sin GPU dedicada.
- Extracción de información ligera: fine-tuning token-level para NER, etiquetado POS o extracción de campos en documentos; la salida por token del encoder sirve directamente como features para la cabeza correspondiente.
- Inferencia en el edge y en entornos on-premise: con pesos en fp16 (~88 MB) cabe en dispositivos integrados, portátiles sin GPU o contenedores con memoria restringida, lo que permite procesamiento local de texto sensible sin enviarlo a la nube.
- Autocompletado y corrección restringida: uso directo del pipeline fill-mask para sugerir términos en plantillas, glosarios o formularios en inglés, donde el vocabulario está acotado y no se requiere generación libre.
- Baseline de investigación reproducible: al estar entrenado de principio a fin en una GPU de consumo documentada, sirve como referencia de bajo coste para estudiar recetas de pretraining (RMSNorm, RoPE, GeGLU, QK-norm) a pequeña escala.

## Benchmarks y rendimiento

Resultados en GLUE dev, una única ejecución por tarea, última epoch y hiperparámetros por defecto sin ajuste por tarea:

| Tarea | Metrica | v1 | v2 |
|---|---|---|---|
| CoLA | Matthews corr. | 36,5 | 41,4 |
| SST-2 | Accuracy | 89,3 | 89,9 |
| MRPC | Acc / F1 | 80,4 / 86,3 | 78,4 / 84,9 |
| QQP | Acc / F1 | 89,4 / 85,8 | 89,6 / 86,1 |
| STS-B | Pearson / Spearman | 83,3 / 82,9 | 83,5 / 83,2 |
| MNLI | Acc (matched / mismatched) | 78,5 / 78,9 | 79,0 / 79,2 |
| QNLI | Accuracy | 85,1 | 85,4 |
| RTE | Accuracy | 56,7 | 53,1 |
| Media | 8 tareas, WNLI excluida | 75,04 | 75,22 |

Comparación con referencias (una cifra por tarea; MRPC y QQP media de accuracy y F1; STS-B media de Pearson y Spearman; MNLI accuracy matched; CoLA MCC; filas de referencia tomadas del paper de DistilBERT, Sanh et al., 2019):

| Modelo | Parametros | CoLA | MNLI | MRPC | QNLI | QQP | RTE | SST-2 | STS-B | Media |
|---|---|---|---|---|---|---|---|---|---|---|
| ELMo + BiLSTM | n/a | 44,1 | 68,6 | 76,6 | 71,1 | 86,2 | 53,4 | 91,5 | 70,4 | 70,2 |
| Lewis-44M-Bert v1 | 44 M | 36,5 | 78,5 | 83,4 | 85,1 | 87,6 | 56,7 | 89,3 | 83,1 | 75,0 |
| Lewis-44M-Bert v2 | 44 M | 41,4 | 79,0 | 81,7 | 85,4 | 87,8 | 53,1 | 89,9 | 83,3 | 75,2 |
| DistilBERT | 66 M | 51,3 | 82,2 | 87,5 | 89,2 | 88,5 | 59,9 | 91,3 | 86,9 | 79,6 |
| BERT-base | 110 M | 56,3 | 86,7 | 88,6 | 91,8 | 89,6 | 69,3 | 92,7 | 89,0 | 83,0 |

Datos adicionales: pérdida MLM en held-out de 1,930 (perplejidad 6,89) al 25 % de enmascarado, frente a 1,987 (7,29) en v1. La model card incluye una tabla de fine-tuning downstream comparando v1 con DistilBERT (3 epochs, 10.000 ejemplos de entrenamiento, misma configuración), pero el contenido disponible se interrumpe en esa tabla: los valores concretos de v2 en downstream no están disponibles.

## Requisitos de hardware

- VRAM estimada para inferencia: ~175 MB en fp32, ~88 MB en fp16/bf16, ~44 MB en int8 y ~22 MB en int4 solo para pesos; con activaciones y batches pequeños de 512 tokens el consumo total se mantiene por debajo de 1 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente. Una T4, L4, RTX 3060, RTX 4090, A100 o H100 funcionan sin problema, aunque en la mayoría de casos estarán sobredimensionadas para este modelo; el despliegue realista es CPU o GPU de gama baja.
- Cabe en GPU de consumo: sí, en todas las GPU de consumo modernas y en muchas integradas; también en CPU dedicada con pocos núcleos para inferencia por lotes.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (imprescindible, la arquitectura es custom), exportación a ONNX o TorchScript si se valida el grafo, y servicio mediante FastAPI o Triton. No hay soporte nativo conocido en vLLM, TGI, llama.cpp u Ollama, al tratarse de un encoder con código personalizado y no de un modelo generativo.
- Latencia y throughput de inferencia: no disponibles. El único dato de throughput publicado es de entrenamiento (23.000 a 45.000 tokens/s en una RTX 5050), no extrapolable a inferencia.
- Almacenamiento: 0,2 GB de repositorio, por lo que el despliegue en contenedores e imágenes de CI es trivial.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Media GLUE dev | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Lewis-44M-Bert v2 | 43,8 M | 512 | 75,22 | Apache 2.0 | HuggingFace, requiere `trust_remote_code` |
| Lewis-44M-Bert v1 | 43,8 M | 512 | 75,04 | Apache 2.0 | HuggingFace, requiere `trust_remote_code` |
| DistilBERT base | 66 M | 512 | 79,6 | Apache 2.0 | HuggingFace, en `transformers` nativo |
| BERT-base uncased/cased | 110 M | 512 | 83,0 | Apache 2.0 | HuggingFace, en `transformers` nativo |

Frente a DistilBERT, Lewis v2 es un 34 % más pequeño pero pierde 4,4 puntos de media en GLUE, con una diferencia especialmente marcada en CoLA (41,4 frente a 51,3) y RTE (53,1 frente a 59,9). Frente a BERT-base, la brecha es de 7,8 puntos con un 60 % menos de parámetros. La ventaja de Lewis v2 no es el rendimiento bruto, sino un coste de entrenamiento y despliegue inferior y una licencia permisiva sin dependencias de modelos preexistentes.

## Limitaciones y advertencias

- Modelo monolingüe en inglés: no se ha entrenado con corpus en castellano ni en otras lenguas, por lo que su uso en español producirá representaciones de baja calidad.
- Longitud de contexto limitada a 512 tokens: documentos más largos requieren truncado o chunking, con la consiguiente pérdida de contexto en tareas de clasificación de documentos extensos.
- No es un modelo generativo: no puede usarse para chat, resumen, traducción ni instrucciones; su única salida nativa es el relleno de máscaras y las representaciones/etiquetas tras fine-tuning.
- Riesgo de alucinación en sentido estricto no aplicable, pero en fill-mask puede producir rellenos gramaticalmente plausibles y semánticamente incorrectos; no debe usarse como fuente de hechos sin verificación.
- Sesgos: los corpus de entrenamiento (FineWeb-Edu, cc_news, Project Gutenberg, Wikipedia en inglés) sobrerrepresentan contenido occidental, en inglés y, en el caso de Gutenberg, material histórico con sesgos de época; es esperable sesgo demográfico y cultural tras el fine-tuning.
- Resultados de benchmarks frágiles: una sola ejecución por tarea con hiperparámetros por defecto y sin tuning; RTE (277 ejemplos de dev) y MRPC (408) oscilan varios puntos entre semillas, y de hecho v2 empeora en ambas respecto a v1.
- Las cifras de GLUE de referencia de DistilBERT y BERT-base provienen de sus respectivos papers y no de una reejecución en el mismo entorno, por lo que la comparación no está controlada al 100 %.
- Fine-tuning downstream de v2 sin evaluar en la información disponible; solo hay datos de v1.
- `trust_remote_code=True` es obligatorio: implica ejecutar código del repositorio del autor. Conviene auditar `modeling_*.py` y fijar una revisión concreta antes de usarlo en producción.
- Licencia Apache 2.0: permite uso comercial y modificación sin restricciones adicionales conocidas, pero no se ofrece garantía alguna por parte del autor.
- Madurez y validación comunitaria nulas: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y los metadatos indican fecha de creación 2026-10-19; no hay validación independiente de los resultados publicados.
- No hay versiones cuantizadas ni exportaciones verificadas a GGUF/ONNX, de modo que el soporte en runtimes ligeros requeriría trabajo adicional.

## Enlaces

- Modelo en HuggingFace (v2): https://huggingface.co/vprojectx/Lewis-44M-Bert-v2
- Modelo predecesor (v1): https://huggingface.co/vprojectx/Lewis-44M-Bert
- Perfil del autor: https://huggingface.co/vprojectx
- Entrada de registro en free2aitools: https://free2aitools.com/model/vprojectx/lewis-44m-bert
- Referencia citada en la model card para las cifras de DistilBERT: Sanh et al., 2019 (sin enlace en la información disponible)
- Paper y repositorio de BERT original: no disponibles en la información proporcionada
