# TwistorLabs/atwater-food-reranker

## Resumen

Atwater food re-ranker es un modelo de clasificación de imágenes zero-shot especializado en reconocimiento de platos de comida, desarrollado por Twistor Labs Private Limited para su aplicación móvil Atwater. No se trata de un modelo de lenguaje, sino de un encoder visual SigLIP2 ViT-B/16 convertido a TensorFlow Lite para ejecución íntegra en el dispositivo (on-device). Su función es actuar como segunda etapa de un pipeline de clasificación: solo se invoca cuando el clasificador principal de la app no alcanza suficiente confianza, y puntúa la fotografía de una comida contra un banco fijo de 792 nombres de platos.

El modelo deriva de `timm/ViT-B-16-SigLIP2`, publicado por Google bajo licencia Apache 2.0, y conserva únicamente la torre de imagen, reexportada a TFLite con entrada NHWC uint8 y normalización interna, con cuantización int8 de rango dinámico en los pesos. El artefacto principal pesa 94,5 MB y produce un embedding L2-normalizado de 768 dimensiones que se compara por producto escalar contra embeddings de texto precalculados.

Su relevancia radica en el patrón de despliegue: clasificación visual zero-shot completamente local, sin envío de imágenes a servidores, con un coste computacional contenido para telefonos. El repositorio ocupa 0,1 GB y la librería declarada es `litert`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SigLIP2 ViT-B/16 (torre de imagen, transformer de visión) |
| Parametros totales | no disponible (torre de imagen ViT-B/16; el modelo base SigLIP2 ViT-B/16 ronda los 90 M en la torre visual, dato no confirmado en la información proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen 224x224x3) |
| Tipos de cuantizacion | int8 dynamic-range en pesos; embeddings de texto en float16; salida float32 |
| Idiomas soportados | no disponible (los nombres de platos del banco están en inglés, según el prompt "a photo of {dish}, a type of food.") |
| Licencia | Apache-2.0 |
| Formato de pesos | TFLite (`food-reranker.tflite`, 94,5 MB) + JSON (`dish-bank.json`) |

## Arquitectura y entrenamiento

El modelo es un Vision Transformer B/16 de la familia SigLIP2, con parche de 16x16 y resolución de entrada de 224x224 píxeles. La conversión a TFLite reemplaza la entrada original por un tensor NHWC uint8 RGB de forma `[1,224,224,3]`, con la normalización incorporada dentro del grafo, y aplica cuantización int8 de rango dinámico a los pesos. La salida es un vector `[1,768]` float32 L2-normalizado. El grafo usa exclusivamente operaciones builtin de TFLite, lo que facilita el despliegue con el intérprete estándar.

No se ha realizado un ajuste fino específico sobre datos de comida: el modelo es una derivación directa del checkpoint `timm/ViT-B-16-SigLIP2` (revisión `eee10eff6dd8cabae2d7f379d4e8cfcd352030aa`), del que solo se conserva la torre de imagen. El conocimiento de platos proviene del alineamiento imagen-texto original de SigLIP2, materializado en `dish-bank.json`: 792 nombres de platos con embeddings de texto precalculados mediante la torre de texto correspondiente, usando el prompt "a photo of {dish}, a type of food.", almacenados en float16 y L2-normalizados, junto con las constantes de scoring. La puntuación por plato se calcula como `sigmoid(logit_scale * dot(image, dish) + logit_bias)`. La paridad de embeddings frente al modelo PyTorch original se verificó con una similitud coseno mínima de 0,9985 sobre imágenes de test.

## Capacidades

- Clasificación zero-shot de imágenes de comida contra un vocabulario fijo de 792 platos, sin reentrenamiento.
- Extracción de embeddings visuales de 768 dimensiones, L2-normalizados, reutilizables para búsqueda por similitud.
- Puntuación calibrada por plato mediante sigmoide sobre el producto escalar con escala y sesgo aprendidos.
- Ejecución completamente on-device: ninguna imagen abandona el dispositivo.
- Funciona como re-ranker de segunda etapa: recibe candidatos de un clasificador principal y los reordena.
- Inferencia con operaciones builtin de TFLite, compatible con el intérprete estándar de LiteRT.
- No soporta tool calling, agentes, generación de texto ni razonamiento multi-paso: es exclusivamente un encoder visual.

## Casos de uso

- Re-ranking en aplicaciones de diario nutricional: cuando el clasificador principal de la app devuelve baja confianza, este modelo puntúa la foto contra los 792 platos del banco y reordena las alternativas mostradas al usuario. Es adecuado porque su coste de 94,5 MB y su ejecución local permiten invocarlo bajo demanda sin latencia de red.
- Registro de comidas sin conexión: en entornos sin cobertura, la app puede seguir identificando platos candidatos en el propio teléfono, ya que tanto el modelo como el banco de embeddings residen en el dispositivo.
- Privacidad por diseño en aplicaciones de salud: al no enviar fotos a servidores, el pipeline cumple requisitos estrictos de tratamiento de datos sensibles (imágenes de comidas asociadas a historiales dietéticos).
- Filtrado previo de candidatos para bases de datos nutricionales: los embeddings visuales pueden usarse para recuperar los platos más similares y consultar después valores nutricionales en fuentes externas como USDA FoodData Central, que la app usa como fuente autoritativa.
- Búsqueda visual en catálogos de recetas: indexar imágenes de recetas con el encoder y recuperar por similitud coseno las más parecidas a una foto del usuario, usando el mismo espacio de embeddings que el banco de platos.
- Control de calidad en pipelines de etiquetado: usar la puntuación sigmoide como señal de confianza para marcar imágenes ambiguas que requieran revisión humana en un proceso de anotación de datasets gastronómicos.
- Prototipado de clasificadores de dominio restringido: el patrón (encoder TFLite + banco de embeddings de texto) se puede replicar cambiando el JSON de nombres y recalculando embeddings con la torre de texto SigLIP2.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato cuantitativo de calidad proporcionado es la paridad de embeddings frente al modelo PyTorch original: similitud coseno mínima de 0,9985 sobre imágenes de test.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el escenario objetivo (ejecución en CPU de teléfono mediante LiteRT); el fichero TFLite ocupa 94,5 MB, por lo que la huella en memoria es del orden de decenas a pocos cientos de MB según el backend.
- GPU recomendadas: no disponibles para el caso de uso previsto; el modelo está diseñado para aceleradores móviles (CPU, GPU integrada o NPU vía delegados de TFLite).
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna, aunque el despliegue previsto es móvil, no de escritorio.
- Opciones de despliegue: intérprete LiteRT/TFLite (builtin ops), con delegados de GPU/NPU opcionales. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Atwater food re-ranker | SigLIP2 ViT-B/16, TFLite int8 | no disponible | Imagen 224x224x3 | Apache-2.0 | Hugging Face (TwistorLabs) |
| timm/ViT-B-16-SigLIP2 | SigLIP2 ViT-B/16, PyTorch | no disponible | Imagen 224x224 (preprocesado externo) | Apache-2.0 | Hugging Face (timm) |
| CLIP ViT-B/32 | CLIP, PyTorch | no disponible | Imagen 224x224 | MIT (según release original) | Hugging Face (openai) |

La comparación relevante es con el checkpoint original `timm/ViT-B-16-SigLIP2`: este derivado conserva solo la torre de imagen, añade normalización interna, cuantiza a int8 y elimina la dependencia de PyTorch, a cambio de fijar el vocabulario a 792 platos. Frente a CLIP ViT-B/32, SigLIP2 ofrece mejor alineamiento imagen-texto según la literatura del modelo base, aunque no se dispone de métricas comparativas en la información proporcionada.

## Limitaciones y advertencias

- El vocabulario de platos es fijo: los 792 nombres de `dish-bank.json` son el límite; un plato fuera de la lista no puede nombrarse correctamente.
- Las puntuaciones son similitudes calibradas, no garantías de acierto; la app muestra alternativas cuando la confianza es baja.
- Los valores nutricionales no provienen del modelo: se toman de USDA FoodData Central, lo que evita propagar errores del clasificador a datos dietéticos.
- El banco de embeddings de texto está en inglés ("a photo of {dish}, a type of food."), por lo que el rendimiento con nombres de platos en otros idiomas no está caracterizado.
- La cuantización int8 de rango dinámico introduce una degradación pequeña pero no nula frente al modelo PyTorch; la paridad reportada (coseno mínimo 0,9985) se midió sobre imágenes de test no especificadas.
- No se han publicado evaluaciones de sesgo, robustez ante condiciones de iluminación adversas ni comportamiento con imágenes no gastronómicas.
- Aunque la licencia es Apache-2.0 y permite uso comercial, los pesos derivan de SigLIP2 de Google; conviene conservar los avisos de atribución correspondientes.
- El modelo no genera texto ni razona: cualquier expectativa de uso como modelo de lenguaje es un error de categoría.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TwistorLabs/atwater-food-reranker
- Modelo base: https://huggingface.co/timm/ViT-B-16-SigLIP2
- Artículo de referencia sobre re-rankers: https://www.unite.ai/what-is-a-reranker-the-second-stage-model-that-improves-search-results/
- USDA FoodData Central (fuente nutricional citada por la app): no disponible en la información proporcionada
