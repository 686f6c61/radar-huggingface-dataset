# zeromodels/deformable-detr

## Resumen

Deformable DETR es un modelo de detección de objetos end-to-end que sustituye la atención densa del transformer original DETR por una atención deformable multi-escala. Cada consulta (query) atiende únicamente a un conjunto reducido de puntos de muestreo aprendidos por cabeza y por nivel de la pirámide de características, lo que hace asequible una pirámide de stride 8 a 64, mejora la detección de objetos pequeños y acelera el entrenamiento aproximadamente 10 veces respecto a DETR. Este checkpoint concreto, `zeromodels/deformable-detr`, es una conversión pura a Keras 3 del modelo original `SenseTime/deformable-detr`.

La relevancia de esta ficha radica en la portabilidad: una única implementación en Keras 3 ejecuta el modelo sin modificaciones sobre TensorFlow, PyTorch o JAX, seleccionando el backend mediante la variable de entorno `KERAS_BACKEND`. El repositorio incluye la clase `DeformableDETRDetect` y el procesador de imagen `DeformableDETRImageProcessor`, con pesos de 0,2 GB y licencia Apache 2.0.

El modelo es un detector de objetos entrenado sobre COCO: cada una de las 300 consultas predice puntuaciones de clase mediante sigmoide y una caja delimitadora. No es un modelo generativo ni de lenguaje, por lo que no dispone de ventana de contexto, capacidades multilingües ni tool calling; su ámbito es exclusivamente la visión por computador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención deformable multi-escala (Deformable DETR) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen de tamaño variable, lado corto 800 y lado largo máximo 1333 por defecto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (detección de objetos; etiquetas COCO en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | Keras 3 (carga vía `from_weights`); los safetensors originales también se cargan con el prefijo `hf:` |

## Arquitectura y entrenamiento

La arquitectura sigue el diseño de Deformable DETR (arXiv:2010.04159): un backbone convolucional extrae una pirámide de características multi-escala y un transformer codificador-decodificador aplica atención deformable, en la que cada query muestrea un número pequeño de puntos aprendidos por cabeza y nivel alrededor de un punto de referencia. Esta sustitución de la atención densa reduce el coste computacional y de memoria, permite usar niveles de alta resolución (stride 8) y acelera la convergencia del entrenamiento en torno a 10 veces frente a DETR. El checkpoint corresponde a la variante base; el ecosistema incluye además variantes con refinamiento iterativo de cajas y con esquema de propuestas en dos etapas.

El entrenamiento original se realizó sobre el conjunto COCO para detección de objetos; los detalles concretos sobre número de tokens, composición del dataset, épocas y uso de RLHF/DPO no están disponibles en la información proporcionada. La conversión a Keras 3 reproduce los pesos del modelo `SenseTime/deformable-detr` sin alterar la arquitectura, de modo que el comportamiento numérico es equivalente al del checkpoint original.

## Capacidades

- Detección de objetos end-to-end sobre imágenes RGB, con predicción directa de cajas y clases sin necesidad de post-procesado como NMS.
- Predicción de 300 consultas, cada una con puntuaciones de clase por sigmoide y una caja delimitadora; el post-procesado conserva las 100 mejores parejas (consulta, clase) y aplica un umbral configurable.
- Manejo de objetos de distintos tamaños gracias a la pirámide multi-escala (stride 8 a 64), con mejora específica en objetos pequeños.
- Acepta imágenes de cualquier tamaño de entrada; el procesador redimensiona preservando la relación de aspecto (lado corto 800, lado largo máximo 1333).
- Ejecución unificada sobre tres backends (TensorFlow, PyTorch, JAX) mediante Keras 3.
- No soporta tool calling, agentes, razonamiento multi-paso, generación de texto, código, matemáticas, visión multimodal descriptiva, audio ni modo de pensamiento.

## Casos de uso

- Detección de objetos en pipelines de visión artificial: el modelo identifica y localiza las 80 clases de COCO en imágenes de entrada, adecuado para tareas de inventario visual o conteo de objetos en escenas controladas.
- Análisis de imágenes en aplicaciones móviles o de borde: al poder ejecutarse sobre JAX o TensorFlow Lite mediante Keras 3, puede integrarse en despliegues ligeros donde se requiera detección en tiempo casi real.
- Pre-procesado para sistemas de seguimiento: las cajas detectadas por fotograma sirven como entrada a algoritmos de tracking multi-objeto en vídeo, aprovechando la detección end-to-end sin NMS.
- Moderación de contenido visual: detección de categorías de objetos relevantes en imágenes subidas por usuarios para filtrado automático previo a revisión humana.
- Automatización de anotación de datasets: el modelo puede generar cajas candidatas que un revisor humano valida o corrige, acelerando la creación de datasets de detección propios.
- Investigación y experimentación con arquitecturas transformer para visión: al ser una conversión limpia a Keras 3, facilita la comparación entre backends y la modificación de componentes internos en entornos académicos.
- Sistemas de asistencia a la conducción o robótica: detección de peatones, vehículos y señales en imágenes de cámara como módulo perceptivo dentro de un pipeline mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; el tamaño del repositorio es de 0,2 GB, lo que sugiere un modelo relativamente ligero, pero no se especifica el número de parámetros ni el consumo de memoria en ejecución.
- GPU recomendadas: no disponible. Al ser un modelo de detección de tamaño moderado, es probable que quepa en GPUs de consumo como la RTX 4090 o incluso inferiores, pero este dato no está confirmado en la información disponible.
- ¿Cabe en GPU de consumo? No confirmado; no se dispone de datos de VRAM.
- Opciones de despliegue: Keras 3 con backend TensorFlow, PyTorch o JAX (seleccionado con `KERAS_BACKEND`). No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de detección.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zeromodels/deformable-detr | Deformable DETR (Keras 3) | no disponible | Imagen, lado corto 800 / largo 1333 | Apache 2.0 | Hugging Face |
| SenseTime/deformable-detr | Deformable DETR (PyTorch) | no disponible | Imagen, misma configuración | Apache 2.0 | Hugging Face |
| DETR original (facebook/detr-resnet-50) | Transformer denso | no disponible en la información | Imagen | Apache 2.0 | Hugging Face |
| YOLO (familia) | CNN | no disponible en la información | Imagen | Varía según versión | Múltiples |

Los datos de parámetros y rendimiento de los modelos comparables no están disponibles en la información proporcionada; la comparación se limita a arquitectura, licencia y disponibilidad.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente sobre las 80 clases de COCO; no detecta categorías fuera de ese vocabulario sin reentrenamiento o fine-tuning.
- Riesgo de falsos positivos y negativos inherente a la detección: el umbral de confianza debe calibrarse según el caso de uso; el post-procesado por defecto conserva las 100 mejores parejas (consulta, clase).
- No es un modelo generativo: no produce descripciones, no responde a preguntas y no soporta instrucciones en lenguaje natural.
- No dispone de capacidades multilingües; las etiquetas de clase están en inglés.
- El rendimiento en objetos pequeños o escenas densas puede degradarse pese a la mejora de la atención multi-escala, especialmente con resoluciones de entrada reducidas.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución, pero debe conservarse el aviso de licencia y los avisos de copyright.
- Al ser una conversión de pesos, cualquier error de conversión podría introducir diferencias numéricas respecto al modelo original; se recomienda validar contra `SenseTime/deformable-detr` antes de producción.
- No se dispone de información sobre sesgos del dataset de entrenamiento ni sobre evaluación de robustez en dominios distintos de COCO.

## Enlaces

- Hugging Face: https://huggingface.co/zeromodels/deformable-detr
- Modelo base: https://huggingface.co/SenseTime/deformable-detr
- Paper: https://arxiv.org/abs/2010.04159
- HF Papers: https://huggingface.co/papers/2010.04159
- Repositorio ZeroModels: https://github.com/IMvision12/ZeroModels
- Documentación Deformable DETR: https://imvision12.github.io/ZeroModels/deformable_detr/
- Documentación de carga de pesos: https://imvision12.github.io/ZeroModels/loading_weights/
- Variante single-scale: https://huggingface.co/zeromodels/deformable-detr-single-scale
- Variante con refinamiento de cajas: https://huggingface.co/zeromodels/deformable-detr-with-box-refine
- Variante con refinamiento de cajas y dos etapas: https://huggingface.co/zeromodels/deformable-detr-with-box-refine-two-stage
