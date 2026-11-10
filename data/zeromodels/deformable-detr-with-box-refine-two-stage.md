# zeromodels/deformable-detr-with-box-refine-two-stage

## Resumen

Deformable DETR with box refine two-stage es un modelo de deteccion de objetos end-to-end basado en la arquitectura Deformable DETR, publicada originalmente por SenseTime Research en el paper arXiv:2010.04159. Esta ficha corresponde a la conversion a Keras 3 realizada por el proyecto ZeroModels, que permite ejecutar los pesos originales sin modificaciones sobre tres backends: TensorFlow, PyTorch y JAX. El modelo realiza deteccion sobre las 80 clases de COCO mediante 300 queries, cada una de las cuales predice una puntuacion sigmoide por clase y una caja delimitadora.

La innovacion central de Deformable DETR frente al DETR original es la atencion deformable multi-escala: cada query atiende a un numero reducido de puntos de muestreo aprendidos por cabeza y por nivel de la piramide de caracteristicas, en lugar de a todos los pixeles. Esto hace asequible una piramide de caracteristicas de stride 8 a 64, mejora la deteccion de objetos pequenos y reduce el tiempo de entrenamiento en aproximadamente un orden de magnitud. La variante "with box refine two-stage" anade refinamiento iterativo de cajas y un esquema de propuestas en dos etapas.

El checkpoint es relevante para desarrolladores que trabajan con deteccion de objetos en entornos multi-framework, ya que la conversion a Keras 3 unifica la inferencia bajo una sola implementacion portable. El repositorio ocupa 0,2 GB y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Deformable DETR (transformer con atencion deformable multi-escala) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada de imagen redimensionada a lado corto 800 y lado largo maximo 1333) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de vision, sin capacidades linguisticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (pesos originales); conversion Keras 3 cargable via `from_weights` |

## Arquitectura y entrenamiento

Deformable DETR sustituye la atencion densa del transformer por atencion deformable multi-escala. Cada query atiende a un conjunto pequeno de puntos de muestreo aprendidos, por cabeza de atencion y por nivel de la piramide de caracteristicas, alrededor de un punto de referencia. Esto reduce la complejidad computacional y permite operar sobre una piramide de stride 8 a 64, lo que mejora la deteccion de objetos pequenos y acelera el entrenamiento aproximadamente 10 veces respecto a DETR. La variante "with box refine two-stage" incorpora refinamiento iterativo de las cajas delimitadoras y un esquema de propuestas en dos etapas que genera propuestas iniciales antes del refinamiento final.

El modelo se entrena sobre el conjunto de datos COCO para las 80 clases estandar. La model card de la conversion no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO (no procede en un modelo de deteccion). La conversion a Keras 3 (`DeformableDETRDetect`) reproduce la arquitectura original y carga los pesos de `SenseTime/deformable-detr-with-box-refine-two-stage` sin modificaciones, ejecutandose de forma identica sobre TensorFlow, PyTorch y JAX. El procesador de imagen redimensiona manteniendo la relacion de aspecto (lado corto 800, lado largo maximo 1333), aunque el modelo acepta cualquier tamano de entrada.

## Capacidades

- Deteccion de objetos end-to-end sobre las 80 clases de COCO, sin necesidad de supresion no maxima (NMS) post-procesado.
- Prediccion de cajas delimitadoras con refinamiento iterativo (box refine) y esquema de propuestas en dos etapas.
- Deteccion multi-escala con mejor rendimiento en objetos pequenos gracias a la piramide de stride 8 a 64.
- Salida de 300 queries, cada una con puntuaciones sigmoideas por clase y una caja; el post-procesado conserva las 100 mejores parejas (query, clase) y aplica el umbral configurado.
- Ejecucion portable sobre TensorFlow, PyTorch y JAX mediante Keras 3, con el mismo codigo sin cambios.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, capacidades multilingues ni modos de pensamiento (thinking mode): es exclusivamente un modelo de vision para deteccion.

## Casos de uso

- Deteccion de objetos en pipelines de vision por computador: el modelo procesa imagenes redimensionadas a 800 px de lado corto y devuelve cajas con clase y puntuacion, adecuado para sistemas de analisis de imagenes en produccion.
- Moderacion de contenido visual: deteccion de clases relevantes de COCO (personas, objetos) en imagenes subidas por usuarios, con umbral configurable en el post-procesado para ajustar sensibilidad.
- Analisis de imagenes en entornos multi-framework: al ejecutarse sin cambios sobre TensorFlow, PyTorch y JAX, permite integrar la misma implementacion en equipos con stacks heterogeneos.
- Investigacion y prototipado en deteccion de objetos: la conversion Keras 3 facilita comparar variantes de Deformable DETR (single-scale, box refine, two-stage) bajo una API comun.
- Automatizacion de inventario o conteo de objetos: la deteccion multi-escala con stride 8 a 64 permite identificar objetos de distinto tamano en una misma imagen, util para conteo en escenas con objetos pequenos.
- Sistemas de anotacion asistida: el modelo puede generar pre-anotaciones de cajas sobre las 80 clases de COCO para acelerar el etiquetado manual en herramientas de anotacion.
- Analisis de imagenes en dispositivos o entornos con backend limitado: la portabilidad de Keras 3 permite desplegar sobre el framework disponible sin reescribir el codigo de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; el repositorio ocupa 0,2 GB, lo que sugiere un modelo de tamano moderado, pero no se especifica el consumo de memoria en ejecucion.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; el tamano del repositorio (0,2 GB) es compatible con GPUs de consumo, pero no se confirma en la informacion.
- Opciones de despliegue: Keras 3 con backend TensorFlow, PyTorch o JAX, mediante `DeformableDETRDetect.from_weights`. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de deteccion de este tipo).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zeromodels/deformable-detr-with-box-refine-two-stage | no disponible | imagen, lado corto 800 / largo max 1333 | Deteccion COCO (80 clases) | Apache 2.0 | Hugging Face (zeromodels) |
| SenseTime/deformable-detr-with-box-refine-two-stage | no disponible | imagen, misma configuracion | Deteccion COCO (80 clases) | Apache 2.0 | Hugging Face (SenseTime) |
| zeromodels/deformable-detr | no disponible | imagen | Deteccion COCO (80 clases) | Apache 2.0 (segun repo) | Hugging Face (zeromodels) |
| zeromodels/deformable-detr-with-box-refine | no disponible | imagen | Deteccion COCO (80 clases) | Apache 2.0 (segun repo) | Hugging Face (zeromodels) |

No se dispone de datos de rendimiento comparativo (mAP, latencia) en la informacion proporcionada para establecer una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- Es un modelo exclusivamente de deteccion de objetos; no genera texto, no razona y no soporta conversacion ni agentes.
- Limitado a las 80 clases de COCO; no detecta categorias fuera de ese conjunto sin reentrenamiento.
- No se dispone de informacion sobre sesgos del dataset de entrenamiento ni sobre el rendimiento por clase o por subgrupo.
- Riesgo de falsos positivos y negativos inherente a la deteccion; el umbral de post-procesado debe ajustarse por caso de uso.
- La informacion sobre cuantizacion, requisitos de VRAM y latencia no esta disponible, lo que dificulta planificar despliegues en produccion sin mediciones propias.
- La licencia Apache 2.0 permite uso comercial, pero debe verificarse la procedencia y condiciones de los pesos originales de SenseTime.
- La model card no documenta limitaciones especificas de la conversion Keras 3 ni posibles diferencias numericas respecto a la implementacion original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zeromodels/deformable-detr-with-box-refine-two-stage
- Modelo base original: https://huggingface.co/SenseTime/deformable-detr-with-box-refine-two-stage
- Paper: https://arxiv.org/abs/2010.04159
- Paper en HF Papers: https://huggingface.co/papers/2010.04159
- Repositorio ZeroModels: https://github.com/IMvision12/ZeroModels
- Documentacion Deformable DETR: https://imvision12.github.io/ZeroModels/deformable_detr/
- Documentacion de carga de pesos: https://imvision12.github.io/ZeroModels/loading_weights/
- Variante deformable-detr: https://huggingface.co/zeromodels/deformable-detr
- Variante deformable-detr-single-scale: https://huggingface.co/zeromodels/deformable-detr-single-scale
- Variante deformable-detr-with-box-refine: https://huggingface.co/zeromodels/deformable-detr-with-box-refine
