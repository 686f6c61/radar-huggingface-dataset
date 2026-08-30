# torch-pointcloud/spunet-v1m1.scannet20.pointcept

## Resumen

SpUNet-v1m1.scannet20.pointcept es un modelo de segmentación semántica de nubes de puntos basado en una U-Net con convoluciones dispersas (sparse convolutional U-Net), publicado por el proyecto torch-pointcloud (PyTorch PointCloud). El modelo fue entrenado sobre el dataset ScanNet, restringido a 20 clases de objetos y superficies típicas de escenas interiores, y está diseñado para asignar una etiqueta semántica a cada punto de una nube 3D. Con aproximadamente 39,2 millones de parámetros y una entrada de 6 canales (posición, color y normales), ofrece un equilibrio razonable entre precisión y coste computacional para tareas de percepción 3D.

El modelo se distribuye bajo licencia MIT, lo que facilita su integración en proyectos comerciales y de investigación. Su relevancia actual radica en que proporciona un checkpoint preentrenado listo para usar dentro del ecosistema torch-pointcloud, que unifica la carga de modelos mediante una factoría `create_model` similar a la de timm. Esto permite a desarrolladores e investigadores obtener un segmentador de escenas interiores sin necesidad de entrenar desde cero, y también extraer características 3D para tareas posteriores.

La arquitectura SpUNet se apoya en convoluciones dispersas, una técnica que solo procesa las posiciones ocupadas de la nube de puntos, reduciendo drásticamente el coste de cómputo frente a las convoluciones densas. El modelo alcanza un mIoU de 71,81 en ScanNet (20 clases), ligeramente por debajo de la referencia de 75,67 reportada por el autor del checkpoint, aunque sigue siendo competitivo para aplicaciones prácticas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SpUNet (U-Net con convoluciones dispersas) |
| Parametros totales | 39.174.996 (39,2 M) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de nubes de puntos, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (datos 3D, sin procesamiento de lenguaje) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SpUNet es una arquitectura de tipo U-Net adaptada a datos 3D dispersos. En lugar de operar sobre vóxeles densos, utiliza convoluciones dispersas (sparse convolutions) que solo computan sobre las posiciones ocupadas de la nube de puntos, lo que reduce el coste de memoria y tiempo de ejecución en comparación con métodos densos. El modelo se compone de un encoder que reduce la resolución espacial progresivamente y un decoder que la recupera, con conexiones de salto para preservar detalles de alta frecuencia. Este diseño es especialmente eficaz en escenas interiores donde la densidad de puntos varía significativamente.

El entrenamiento se realizó sobre el dataset ScanNet, que contiene reconstrucciones 3D de escenas interiores con anotaciones semánticas por punto en 20 categorías (paredes, suelo, puertas, sillas, mesas, etc.). No se especifica el número exacto de tokens ni la composición del dataset, pero ScanNet es un estándar en la comunidad de visión 3D. El checkpoint se convirtió desde el repositorio Pointcept (MIT) y se integró en la librería torch-pointcloud, que proporciona la factoría de modelos, transforms y utilidades de carga. No se menciona el uso de RLHF, DPO ni otras técnicas de ajuste por refuerzo, ya que se trata de un modelo puramente supervisado para segmentación.

## Capacidades

- Segmentación semántica de nubes de puntos: asigna una de 20 clases de ScanNet a cada punto de la entrada.
- Extracción de características 3D: mediante `forward_features` se pueden obtener embeddings de 96 dimensiones por punto, útiles para tareas de clasificación o detección posteriores.
- Soporte para entradas multimodales: acepta posición (x, y, z), color (RGB) y normales como canales de entrada (6 canales en total).
- Entrenamiento previo en escenas interiores: el modelo está especializado en entornos domésticos y de oficina, con las 20 clases típicas de ScanNet.
- Integración con el ecosistema torch-pointcloud: carga sencilla mediante `tp.create_model`, compatible con transforms y collate de la librería.
- Reajuste del clasificador: permite resetear la cabeza de clasificación (`reset_classifier`) para adaptar el modelo a un número distinto de clases mediante fine-tuning.

## Casos de uso

- Navegación robótica en interiores: un robot móvil puede usar el modelo para segmentar en tiempo real las superficies y objetos de una habitación (suelo, paredes, sillas, mesas) y planificar rutas evitando obstáculos. Su tamaño moderado permite ejecutarlo en GPUs de gama media.
- Reconstrucción 3D semántica: integrado en pipelines de fotogrametría o SLAM, el modelo etiqueta cada punto de la nube generada, produciendo un mapa semántico del entorno útil para aplicaciones de realidad aumentada o gestión de activos.
- Análisis de espacios para arquitectura: los estudios de arquitectura pueden segmentar escaneos láser de edificios para identificar automáticamente elementos estructurales (muros, suelos, techos) y facilitar la documentación o el modelado BIM.
- Preparación de datos para entrenamiento de otros modelos: las características extraídas mediante `forward_features` pueden servir como entrada para detectores de objetos 3D o clasificadores de escenas, reduciendo la cantidad de datos etiquetados necesarios.
- Automatización de inventarios en almacenes: en entornos logísticos, el modelo puede distinguir estanterías, cajas y pasillos, ayudando a gestionar el espacio y a localizar mercancías mediante nubes de puntos capturadas con sensores de profundidad.
- Inspección de obra y control de calidad: en construcción, se puede segmentar un escaneo 3D de una estancia para verificar que los elementos instalados coinciden con el diseño (puertas, ventanas, tabiques), comparando la segmentación con el modelo BIM.

## Benchmarks y rendimiento

El autor del checkpoint declara el siguiente resultado en el model-index de Hugging Face:

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| Segmentación de nubes de puntos | ScanNet (20 clases) | mIoU | 71,81 |

La model card indica que la referencia del propio autor es 75,67 de mIoU, por lo que el checkpoint publicado obtiene un valor ligeramente inferior. No se proporcionan comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- No se especifica la VRAM mínima en la documentación, pero con 39,2 millones de parámetros y entrada de 8192 puntos, el consumo de memoria es modesto. En la práctica, una GPU con 8 GB de VRAM debería ser suficiente para inferencia, aunque depende del tamaño de la nube y del uso de spconv.
- GPU recomendada: cualquier GPU NVIDIA con soporte CUDA y una versión de spconv compatible con la de PyTorch. Modelos como RTX 3060, RTX 4060 o superiores son adecuados. Para entrenamiento o fine-tuning se recomienda al menos 12 GB de VRAM.
- El modelo cabe en GPUs de consumo general, siempre que se tenga instalada la extensión spconv, que requiere compilación específica para la versión de torch y CUDA.
- Opciones de despliegue: la librería torch-pointcloud ofrece la factoría `create_model` y transforms integradas. No se mencionan herramientas como vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no se han publicado cifras oficiales. En una GPU moderna, la inferencia sobre 8192 puntos debería completarse en decenas de milisegundos, pero depende del hardware y de la optimización de spconv.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de segmentación de nubes de puntos en la información proporcionada. El checkpoint es una conversión de un modelo entrenado con Pointcept, y su arquitectura SpUNet es similar a otras basadas en convoluciones dispersas como MinkowskiNet. Sin embargo, no se han facilitado resultados comparativos en otros datasets ni frente a alternativas concretas, por lo que no es posible elaborar una tabla comparativa fiable.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente en escenas interiores de ScanNet, por lo que su rendimiento en entornos exteriores o con clases no presentes en las 20 categorías será deficiente.
- La mIoU de 71,81 es inferior a la referencia de 75,67 reportada por el autor original, lo que sugiere una ligera pérdida de precisión en la conversión o en el proceso de entrenamiento del checkpoint.
- Depende de la librería spconv, que requiere una compilación específica según la versión de PyTorch y CUDA. Esto puede complicar la instalación en entornos con versiones no estándar.
- Los kernels son exclusivos de GPU; no es posible ejecutar el modelo en CPU.
- No se han documentado sesgos específicos, pero el dataset ScanNet está limitado a escenas interiores capturadas con RGB-D, lo que puede introducir sesgos hacia ciertos tipos de iluminación, mobiliario y disposiciones espaciales.
- Aunque la licencia MIT permite uso comercial, es responsabilidad del usuario verificar que el uso de los datos de ScanNet cumple con su propia licencia (ScanNet tiene términos de uso específicos para investigación).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/torch-pointcloud/spunet-v1m1.scannet20.pointcept
- Organización torch-pointcloud en Hugging Face: https://huggingface.co/torch-pointcloud
- Repositorio PyTorch PointCloud: https://github.com/arthurdjn/pytorch-pointcloud
- Repositorio Pointcept: https://github.com/Pointcept/Pointcept
- Paper de Minkowski Convolutional Neural Networks (arquitectura base): https://arxiv.org/abs/1904.08755
- Documentación de instalación de torch-pointcloud: https://pytorch-pointcloud.org/installation/
