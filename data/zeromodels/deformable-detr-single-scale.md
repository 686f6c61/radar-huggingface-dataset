# zeromodels/deformable-detr-single-scale

## Resumen

Deformable DETR es un modelo de deteccion de objetos end-to-end presentado por SenseTime Research en el paper "Deformable DETR: Deformable Transformers for End-to-End Object Detection" (arXiv:2010.04159). Esta ficha concreta, `zeromodels/deformable-detr-single-scale`, es una conversion pura a Keras 3 del checkpoint original `SenseTime/deformable-detr-single-scale`, publicada por el proyecto ZeroModels. El modelo resuelve el problema de deteccion de objetos sobre el conjunto COCO, prediciendo clases y cajas delimitadoras mediante 300 queries aprendidas.

La innovacion central de Deformable DETR frente al DETR original es la sustitucion de la atencion densa por atencion deformable multi-escala: cada query atiende a un numero reducido de puntos de muestreo aprendidos por cabeza y por nivel de la piramide de caracteristicas, alrededor de un punto de referencia. Esto hace asequible una piramide de caracteristicas de stride 8 a 64, mejora la deteccion de objetos pequenos y reduce el tiempo de entrenamiento aproximadamente 10 veces respecto a DETR.

La relevancia de esta version concreta es practica: al ser una implementacion Keras 3, el mismo codigo se ejecuta sin modificaciones sobre TensorFlow, PyTorch o JAX, lo que facilita su integracion en pipelines existentes independientemente del framework de backend. La variante "single-scale" emplea una unica escala de caracteristicas, lo que simplifica el modelo respecto a las variantes multi-escala con refinamiento de cajas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atencion deformable multi-escala (Deformable DETR) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada de imagen redimensionada a lado corto 800, lado largo maximo 1333) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de vision, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (conversion Keras 3; compatible con backend TensorFlow, PyTorch y JAX) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Deformable DETR descrita en el paper original: un backbone convolucional que extrae una piramide de caracteristicas, un encoder y decoder transformer que emplean atencion deformable multi-escala, y un cabezal de prediccion que, a partir de 300 queries, produce para cada una una puntuacion de clase (sigmoide por clase, sobre las categorias de COCO) y una caja delimitadora. En esta variante "single-scale" se utiliza una unica escala de caracteristicas, a diferencia de las variantes multi-escala. Las variantes del paper anaden refinamiento iterativo de cajas y un esquema de propuestas en dos etapas; esta variante concreta corresponde a la configuracion single-scale sin esas extensiones.

Los detalles de entrenamiento (numero de tokens o imagenes, composicion exacta del dataset mas alla de COCO, uso de RLHF/DPO u otras tecnicas de alineacion) no estan disponibles en la informacion proporcionada. El modelo es una conversion de pesos del checkpoint original de SenseTime; no se ha reentrenado, sino que se han convertido los pesos a formato Keras 3 para su ejecucion multiplataforma. La innovacion tecnica destacable es precisamente la atencion deformable, que reduce el coste computacional de la atencion sobre mapas de caracteristicas de alta resolucion y acelera el entrenamiento.

## Capacidades

- Deteccion de objetos end-to-end sobre imagenes, con prediccion de clases COCO y cajas delimitadoras.
- Salida de 300 queries, cada una con puntuaciones sigmoides por clase y una caja; el post-procesado conserva los 100 mejores pares (query, clase) y aplica un umbral configurable.
- Procesamiento de imagen con redimensionado que preserva la relacion de aspecto (lado corto 800, lado largo maximo 1333); el modelo acepta cualquier tamano de entrada.
- Ejecucion unificada sobre TensorFlow, PyTorch y JAX mediante Keras 3, seleccionando el backend con la variable `KERAS_BACKEND`.
- Carga directa de los pesos originales de SenseTime mediante el prefijo `hf:`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues: es un modelo puramente de vision para deteccion.

## Casos de uso

- Deteccion de objetos en imagenes para aplicaciones de vision por computador: el modelo identifica y localiza las 80 clases de COCO en una imagen, devolviendo puntuaciones y cajas listas para su uso en downstream.
- Preprocesado en pipelines de analitica visual: integrado como etapa de deteccion para contar objetos, filtrar regiones de interes o alimentar modulos de seguimiento.
- Prototipado rapido en investigacion: al ejecutarse en TensorFlow, PyTorch o JAX con el mismo codigo, permite comparar el modelo frente a otros detectores sin reescribir la integracion.
- Sistemas de moderacion o inventario visual: la deteccion de clases COCO (personas, vehiculos, animales, objetos cotidianos) sirve como base para clasificacion y filtrado automatico de imagenes.
- Base para fine-tuning en dominios especificos: al ser una conversion de pesos con licencia Apache 2.0, puede adaptarse a conjuntos de datos propios mediante transferencia de aprendizaje.
- Despliegue en entornos con backend flexible: equipos que ya trabajan en JAX o TensorFlow pueden incorporar el detector sin depender de PyTorch, gracias a la implementacion Keras 3.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de mAP, latencia ni comparaciones numericas con otros detectores.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; el tamano del repositorio es de 0.1 GB, lo que sugiere un modelo relativamente ligero, pero no se confirma el consumo de memoria en ejecucion.
- GPU recomendadas: no disponibles de forma especifica; al ser un modelo de vision de tamano moderado, es probable que quepa en GPUs consumer, pero no hay datos confirmados.
- Compatibilidad con GPU consumer: no confirmada en la informacion disponible.
- Opciones de despliegue: Keras 3 con backend TensorFlow, PyTorch o JAX; no se mencionan vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje, no aplicables directamente a este detector).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zeromodels/deformable-detr-single-scale | no disponible | imagen (lado corto 800, lado largo max. 1333) | no disponible | Apache 2.0 | Hugging Face (Keras 3) |
| SenseTime/deformable-detr-single-scale | no disponible | imagen | no disponible | Apache 2.0 | Hugging Face (original) |
| zeromodels/deformable-detr | no disponible | imagen | no disponible | Apache 2.0 | Hugging Face (Keras 3) |
| zeromodels/deformable-detr-with-box-refine | no disponible | imagen | no disponible | Apache 2.0 | Hugging Face (Keras 3) |

No se dispone de datos numericos de rendimiento para establecer una comparacion cuantitativa. Las alternativas listadas son variantes de la misma familia Deformable DETR publicadas por ZeroModels y el checkpoint original de SenseTime.

## Limitaciones y advertencias

- Modelo exclusivamente de vision: no procesa texto ni lenguaje, por lo que no aplican capacidades de generacion, razonamiento o tool calling.
- Entrenado sobre COCO: la deteccion se limita a las 80 clases de COCO; el rendimiento en clases fuera de ese conjunto no esta garantizado.
- Variante single-scale: al usar una unica escala de caracteristicas, puede tener menor capacidad para objetos de tamanos muy variados en comparacion con las variantes multi-escala.
- Sesgos: no se documentan sesgos especificos en la informacion disponible; como cualquier modelo entrenado en COCO, puede heredar sesgos del dataset.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto, pero pueden producirse detecciones falsas positivas, mitigables mediante el umbral de confianza.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del checkpoint original de SenseTime y del paper.
- Conversion de pesos: al tratarse de una conversion a Keras 3, es recomendable validar la equivalencia numerica frente al checkpoint original antes de usarla en produccion.
- Sin datos de benchmarks ni de latencia: no es posible estimar su rendimiento en produccion a partir de la informacion disponible.

## Enlaces

- Hugging Face (esta ficha): https://huggingface.co/zeromodels/deformable-detr-single-scale
- Modelo base original: https://huggingface.co/SenseTime/deformable-detr-single-scale
- Paper: https://arxiv.org/abs/2010.04159
- HF Papers: https://huggingface.co/papers/2010.04159
- Repositorio ZeroModels: https://github.com/IMvision12/ZeroModels
- Documentacion Deformable DETR (ZeroModels): https://imvision12.github.io/ZeroModels/deformable_detr/
- Documentacion de carga de pesos: https://imvision12.github.io/ZeroModels/loading_weights/
- Variante deformable-detr: https://huggingface.co/zeromodels/deformable-detr
- Variante with-box-refine: https://huggingface.co/zeromodels/deformable-detr-with-box-refine
- Variante with-box-refine-two-stage: https://huggingface.co/zeromodels/deformable-detr-with-box-refine-two-stage
