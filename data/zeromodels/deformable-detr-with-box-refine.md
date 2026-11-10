# zeromodels/deformable-detr-with-box-refine

## Resumen

Deformable DETR with box refine es un modelo de detección de objetos end-to-end derivado de Deformable DETR, presentado en el artículo "Deformable DETR: Deformable Transformers for End-to-End Object Detection" (arXiv:2010.04159). La variante original fue desarrollada por SenseTime Research y este repositorio concreto (`zeromodels/deformable-detr-with-box-refine`) es una conversión a Keras 3 del checkpoint `SenseTime/deformable-detr-with-box-refine`, publicada por el usuario zeromodels.

El modelo sustituye la atención densa del transformer por atención deformable multi-escala: cada query atiende a un conjunto reducido de puntos de muestreo aprendidos por cabeza y nivel de la pirámide de características, alrededor de un punto de referencia. Esto permite explotar una pirámide de rasgos de stride 8 a 64, mejora la detección de objetos pequeños y reduce el coste de entrenamiento en torno a 10 veces respecto al DETR original.

La variante "with box refine" añade refinamiento iterativo de cajas, de modo que cada capa del decodificador ajusta progresivamente las coordenadas predichas. El checkpoint detecta las clases de COCO y devuelve 300 queries, cada una con puntuaciones sigmoides por clase y una caja. Su interés práctico reside en que una única implementación Keras 3 se ejecuta sin cambios sobre TensorFlow, PyTorch o JAX, lo que facilita su integración en pipelines existentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención deformable multi-escala (Deformable DETR), decodificador con refinamiento iterativo de cajas |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen redimensionada con lado corto 800 y lado largo máximo 1333) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de detección de objetos, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | no especificado explícitamente; el repo ocupa 0.2 GB y se carga mediante `from_weights`, con soporte de safetensors del modelo original vía prefijo `hf:` |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Deformable DETR: un backbone convolucional extrae una pirámide de características multi-escala y un encoder-decodificador transformer aplica atención deformable, en la que cada query muestrea un número pequeño y aprendido de posiciones por cabeza y por nivel. Esto reduce la complejidad frente a la atención densa y acelera la convergencia. La variante concreta incorpora refinamiento iterativo de cajas, donde cada capa del decodificador parte de la predicción de la capa anterior y la corrige.

El checkpoint genera 300 queries; cada una produce puntuaciones sigmoides independientes por clase COCO y una caja delimitadora. El post-procesado conserva los 100 mejores pares (query, clase) y aplica después el umbral de confianza. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO, dado que se trata de un modelo de visión y la información proporcionada no detalla el pipeline de entrenamiento más allá de la referencia al artículo original.

## Capacidades

- Detección de objetos end-to-end sobre imágenes, con predicción directa de cajas y clases sin necesidad de componentes auxiliares como NMS en el diseño original.
- Detección multi-clase sobre las categorías de COCO (puntuaciones sigmoides por clase).
- Manejo de objetos de distintos tamaños gracias a la pirámide de características multi-escala (stride 8 a 64), con mejora específica en objetos pequeños.
- Refinamiento iterativo de cajas para mejorar la precisión de localización.
- Acepta imágenes de cualquier tamaño de entrada; el procesador redimensiona con preservación de aspecto (lado corto 800, lado largo máximo 1333).
- Ejecución portable sobre TensorFlow, PyTorch y JAX mediante una única implementación Keras 3.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es exclusivamente un modelo de visión para detección.

## Casos de uso

- Análisis de imágenes en producción: el modelo detecta objetos COCO en fotografías y permite filtrar por umbral de confianza, adecuado para tareas de etiquetado automático o moderación de contenido visual.
- Pre-etiquetado para anotación humana: al devolver hasta 100 detecciones por imagen con puntuación, sirve como generador de propuestas iniciales que aceleran el etiquetado en proyectos de visión.
- Sistemas de vigilancia y conteo: la pirámide multi-escala y la mejora en objetos pequeños lo hacen útil para detectar elementos de tamaño reducido en imágenes de alta resolución.
- Integración en pipelines Keras existentes: al ejecutarse sin cambios en TensorFlow, PyTorch o JAX, puede incorporarse a infraestructuras ya montadas en cualquiera de esos frameworks sin reescribir código.
- Investigación y reproducción de resultados: sirve como referencia para comparar variantes de Deformable DETR (single-scale, two-stage, box refine) bajo la misma API.
- Prototipado rápido en notebooks: la carga mediante `from_weights` y el post-procesado integrado permiten obtener detecciones con pocas líneas de código.
- Extracción de regiones de interés: las cajas predichas pueden alimentar etapas posteriores de clasificación, OCR o segmentación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 0.2 GB, lo que sugiere un modelo relativamente ligero, pero no se detalla el consumo en memoria.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada en la información proporcionada; el tamaño del repo es compatible con tarjetas de gama media, pero no se aportan cifras.
- Opciones de despliegue: Keras 3 con backend TensorFlow, PyTorch o JAX; carga de pesos mediante `DeformableDETRDetect.from_weights`, incluido el prefijo `hf:` para safetensors del modelo original. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de visión de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| zeromodels/deformable-detr-with-box-refine | no disponible | imagen, lado corto 800 / largo máx. 1333 | Apache 2.0 | Hugging Face (zeromodels) |
| SenseTime/deformable-detr-with-box-refine | no disponible | imagen, misma configuración | Apache 2.0 | Hugging Face (SenseTime) |
| zeromodels/deformable-detr | no disponible | imagen | Apache 2.0 | Hugging Face (zeromodels) |
| zeromodels/deformable-detr-with-box-refine-two-stage | no disponible | imagen | Apache 2.0 | Hugging Face (zeromodels) |

Las variantes single-scale y two-stage comparten arquitectura base y difieren en el esquema de propuestas y refinamiento; no se dispone de métricas comparativas publicadas en la información proporcionada.

## Limitaciones y advertencias

- Es un modelo exclusivamente de visión: no procesa texto, no soporta tool calling ni razonamiento multi-paso.
- Entrenado sobre las clases de COCO; no detecta categorías fuera de ese conjunto sin reentrenamiento.
- Riesgo de falsos positivos y negativos en objetos pequeños, ocluidos o con condiciones de iluminación adversas; el umbral de confianza debe calibrarse por caso de uso.
- El post-procesado limita la salida a los 100 mejores pares (query, clase), lo que puede descartar detecciones válidas en escenas muy densas.
- No se dispone de información sobre sesgos del dataset de entrenamiento ni sobre evaluación de robustez.
- Licencia Apache 2.0: permite uso comercial con atribución y sin garantías; conviene revisar los términos del modelo original de SenseTime.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; se trata de una conversión reciente sin validación comunitaria publicada.
- No se han publicado métricas de latencia ni de rendimiento en la información disponible, por lo que la planificación de producción requiere medición propia.

## Enlaces

- Hugging Face: https://huggingface.co/zeromodels/deformable-detr-with-box-refine
- Modelo original: https://huggingface.co/SenseTime/deformable-detr-with-box-refine
- Artículo: https://arxiv.org/abs/2010.04159
- HF Papers: https://huggingface.co/papers/2010.04159
- Repositorio ZeroModels: https://github.com/IMvision12/ZeroModels
- Documentación Deformable DETR: https://imvision12.github.io/ZeroModels/deformable_detr/
- Documentación de carga de pesos: https://imvision12.github.io/ZeroModels/loading_weights/
- Variante base: https://huggingface.co/zeromodels/deformable-detr
- Variante single-scale: https://huggingface.co/zeromodels/deformable-detr-single-scale
- Variante two-stage: https://huggingface.co/zeromodels/deformable-detr-with-box-refine-two-stage
