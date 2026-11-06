# visualprior/DSR-IQA

## Resumen

DSR-IQA es un modelo especializado en evaluación de calidad de imagen sin referencia (no-reference image quality assessment, NR-IQA), con orientación específica hacia imágenes generadas por superresolución mediante difusión. Lo desarrolla el autor `visualprior` y deriva de `q-future/Q-ReAlign-Mini-0.8B`, un modelo multimodal de la familia Q-ReAlign/Q-Align construido sobre Qwen3.5. El modelo resuelve el problema de estimar la calidad perceptual de una imagen sin disponer de una referencia de alta calidad, devolviendo una puntuación normalizada en el rango [0, 1].

Técnicamente es un estudiante podado estructuralmente: conserva los 12 bloques visuales completos y 12 de los 24 bloques del lenguaje, con un vocabulario de entrada restringido a 30 IDs de token. Sobre esa base añade dos cabezas: una cabeza de calidad de cinco tokens (excellent/good/fair/poor/bad) y una cabeza de regresión de MOS, cuya fusión mediante un peso alpha aprendido produce la puntuación final. El modelo exportado contiene 340.342.466 parámetros y ocupa 0,7 GB en el repositorio.

Su relevancia actual radica en que acompaña al dataset y benchmark DISRQAD, centrado en la evaluación de calidad de superresolución con difusión, un área donde los modelos de IQA generales no capturan bien las alucinaciones plausibles típicas de los modelos generativos. Esta release concreta es la variante adaptada a SRIQA-Bench, no la variante entrenada sobre MOS de DISRQAD.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal podado (12 bloques visuales + 12 de 24 bloques de lenguaje), con cabezas de calidad por tokens y de regresión MOS |
| Parametros totales | 340.342.500 (340.342.466 exportados) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; carga por defecto en FP32, autocast BF16 en CUDA) |
| Idiomas soportados | no disponible (la tarea es de evaluación de imagen, no de texto) |
| Licencia | no disponible |
| Formato de pesos | safetensors (`model.safetensors`) |
| Modelo base | q-future/Q-ReAlign-Mini-0.8B |
| Pipeline | feature-extraction |
| Libreria | transformers (requiere `transformers==5.3.0`, `accelerate`, `safetensors`, `Pillow`) |
| Codigo personalizado | si (`trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo es un transformer multimodal podado a partir de Q-ReAlign-Mini-0.8B. Mantiene intactos los 12 bloques de visión y los tokens visuales originales, pero reduce el torreón de lenguaje a 12 de los 24 bloques, seleccionando los índices del profesor `[2, 3, 6, 7, 10, 11, 14, 15, 18, 19, 22, 23]`. El vocabulario de embeddings de entrada se restringe a 30 IDs de token originales, lo que configura un prompt fijo y compacto. Los IDs exactos y el mapa de capas están en `config.json`. Ambas cabezas leen el estado oculto final al término del stem de respuesta fijo: la cabeza de tokens es una proyección `1024 -> 5` sin sesgo, y la cabeza MOS es `LayerNorm -> Linear(1024, 256) -> GELU -> Dropout(0.1) -> Linear(256, 1) -> sigmoid`. La puntuación final es `alpha * token_score + (1 - alpha) * mos_score`, con alpha aprendido.

El entrenamiento consta de dos etapas. La primera es destilación de IQA general desde un profesor Q-ReAlign-mini sin podar, que supervisa características visuales (cada tercer bloque), características de lenguaje correspondientes, mapas de atención completos, puntuaciones y distribuciones de tokens de calidad; se usan KonIQ-10K, KADID-10K y SPAQ con objetivos MOS, de ranking y ordinales interpolados, además de consistencia de cabezas, durante 8 épocas con batch físico 2 y efectivo 8, seleccionando el mejor SRCC de validación. La segunda etapa es adaptación a superresolución sin profesor, combinando 990 imágenes de SRIQA-Bench y 248 imágenes de replay de IQA general, con 110 imágenes de SRIQA-Bench para selección de checkpoint, manteniendo las pérdidas MOS, ranking, ordinal y consistencia con regularización L2-SP hacia el checkpoint destilado (peso `1e-4`), durante 2 épocas con batch físico 4 y efectivo 8. Ambas etapas usan AdamW, weight decay `0.01`, warm-up lineal del 5% y decaimiento coseno, con tasas de aprendizaje de `2e-5`/`2e-6`/`1e-4` para lenguaje/visión/cabezas. Los pesos de pérdida de la primera etapa son MOS `1`, ranking `.3`, ordinal `.2`, consistencia `.05`, score del profesor `.4`, tokens del profesor `.5`, texto `.02`, visión `.01` y atención `.01`.

## Capacidades

- Evaluación de calidad perceptual de imagen sin referencia: devuelve una puntuación normalizada en [0, 1] donde mayor es mejor.
- Evaluación por lotes: `model.score([...], batch_size=N)` procesa listas de imágenes.
- Salida detallada opcional con `return_details=True`: incluye puntuación por tokens, puntuación MOS directa, alpha y probabilidades.
- Soporte de múltiples formatos de imagen vía Pillow: JPEG, PNG, WebP, BMP, TIFF y GIF (solo el primer fotograma o página).
- Acepta rutas locales, objetos `pathlib.Path`, imágenes PIL o listas de estos.
- Inferencia en CPU (FP32) y en GPU (con autocast BF16 según configuración del checkpoint).
- Inferencia autocontenida: no requiere imagen de referencia, ni el profesor, ni los pesos del modelo base original.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto general; es un extractor de características orientado a una tarea concreta.

## Casos de uso

- Control de calidad en pipelines de superresolución: puntuar automáticamente cada imagen generada por un modelo de difusión de SR y filtrar aquellas por debajo de un umbral antes de publicarlas o entregarlas.
- Evaluación comparativa de modelos de SR: usar la puntuación normalizada para ordenar variantes de un mismo pipeline o comparar checkpoints sin necesidad de referencias de alta calidad.
- Detección de artefactos y alucinaciones visuales: integrar el modelo como filtro previo a la revisión humana para señalar imágenes con artefactos o texturas sintéticas implausibles, aunque con la cautela de que una alucinación plausible puede puntuar alto.
- Monitorización de calidad en producción: ejecutar el modelo por lotes sobre imágenes servidas a usuarios para detectar degradaciones del pipeline de generación o compresión.
- Curación de datasets de imágenes: puntuar y estratificar grandes colecciones de imágenes generadas para construir subconjuntos de entrenamiento o evaluación con calidad controlada.
- Investigación en IQA: usar el modelo como baseline podado y ligero en experimentos de evaluación de calidad de SR, aprovechando su bajo coste de inferencia y su naturaleza autocontenida.
- Preprocesado en sistemas de moderación o ranking visual: incorporar la puntuación de calidad como señal auxiliar en sistemas de ordenación de resultados de búsqueda o galerías de imágenes generadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona selección de checkpoint por SRCC de validación en SRIQA-Bench, pero no reporta cifras concretas en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 340 millones de parámetros; en FP32 son aproximadamente 1,4 GB de pesos, y en BF16 unos 0,7 GB, más el overhead de activaciones y del codificador visual.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; tarjetas como RTX 3060, RTX 4060, RTX 4090, A100 o H100 funcionan sin problema.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo moderna, e incluso en CPU con FP32.
- Opciones de despliegue: la vía documentada es `transformers` con `AutoModel.from_pretrained(..., trust_remote_code=True)`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, y al ser un modelo de evaluación de imagen con código personalizado, esas rutas no están soportadas de forma nativa.
- Latencia y throughput: no disponibles en la información proporcionada; el modelo admite procesamiento por lotes, lo que permite aumentar el throughput en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DSR-IQA | 340.342.500 | no disponible | NR-IQA orientado a SR | no disponible | Hugging Face (`visualprior/DSR-IQA`) |
| Q-ReAlign-Mini-0.8B (profesor) | ~0,8B (aproximado por el nombre) | no disponible | IQA multimodal general | no disponible | Hugging Face (`q-future/Q-ReAlign-Mini-0.8B`) |
| Alternativas NR-IQA comparables | no disponible | no disponible | NR-IQA | no disponible | no disponible |

No se dispone en la información proporcionada de datos de rendimiento ni de especificaciones detalladas de modelos alternativos que permitan una comparación cuantitativa rigurosa.

## Limitaciones y advertencias

- El modelo estima calidad perceptual, no fidelidad respecto a una referencia; una alucinación de SR plausible puede recibir una puntuación alta.
- La puntuación está normalizada y no corresponde al MOS original de SRIQA-Bench; no debe interpretarse como una métrica de fidelidad en escala original.
- Esta release es la variante adaptada a SRIQA-Bench; la variante entrenada sobre MOS de DISRQAD es un modelo separado no incluido aquí.
- La validación de SRIQA-Bench se usó para selección de checkpoint, no como test independiente, por lo que las métricas de validación pueden estar optimistamente sesgadas.
- La licencia no está disponible, lo que impide confirmar condiciones de uso comercial; es necesario contactar con el autor antes de un despliegue en producción.
- No se documentan sesgos conocidos, idiomas soportados ni comportamiento multilingüe; la tarea es puramente visual.
- Solo puntúa imágenes estáticas; para archivos animados o multipágina se evalúa únicamente el primer fotograma o página.
- La inferencia en CPU usa FP32 y puede diferir ligeramente de las puntuaciones en BF16 sobre CUDA.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código Python del repositorio; conviene fijar el commit con `revision="COMMIT_SHA"` para reproducibilidad y revisar el código antes de usarlo.
- Depende de `transformers==5.3.0` y de versiones compatibles de PyTorch y torchvision; incompatibilidades de versión pueden romper la carga.
- No soporta generación de texto, tool calling ni razonamiento multi-paso; su uso está acotado a la evaluación de calidad de imagen.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/visualprior/DSR-IQA
- Modelo base Q-ReAlign Mini: https://huggingface.co/q-future/Q-ReAlign-Mini-0.8B
- Dataset DISRQAD: https://huggingface.co/datasets/visualprior/DISRQAD
- Web del proyecto DISRQAD: https://nikitakukuzey.github.io/DISRQAD/
- Paper DISRQAD (arXiv:2610.09077): https://arxiv.org/abs/2610.09077
- Apéndice C.2 del paper (entrenamiento): https://arxiv.org/html/2610.09077v1#A3.SS2
- Formatos de imagen de Pillow: https://pillow.readthedocs.io/en/stable/handbook/image-file-formats.html
