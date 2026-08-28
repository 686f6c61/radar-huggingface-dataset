# timm/lowformer_e2.in1k

## Resumen

LowFormer es una familia de backbones de visión por computador diseñada para minimizar la latencia real medida en hardware, en lugar de optimizar únicamente el número de operaciones (MACs). El modelo `lowformer_e2.in1k` es una variante específica de la familia, concretamente la segunda de las variantes "edge" (`e1` y `e2`) pensadas para GPUs de borde. Estas variantes eliminan por completo las ramas de atención y MLP del bloque LowFormer, dejando una arquitectura puramente convolucional basada en bloques MBConv fusionados y agrupados, lo que las hace especialmente eficientes en dispositivos con recursos limitados.

El checkpoint está entrenado en ImageNet-1k por los autores del paper y convertido al formato de `timm` (PyTorch Image Models). Con 22,8 millones de parámetros y 3,8 GMACs, ofrece una precisión Top-1 de 81,612 % a resolución 224×224, superando a otras variantes de tamaño similar de la misma familia. El modelo se distribuye bajo licencia Apache 2.0 y está disponible en Hugging Face con pesos en formato `safetensors`. Su diseño híbrido (aunque en esta variante sin atención) y su enfoque en latencia real lo hacen relevante para despliegues en edge computing, clasificación de imágenes y extracción de características.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LowFormer E2, variante convolucional pura (sin atención ni MLP) con bloques MBConv fusionados y agrupados |
| Parametros totales | 22.771.144 (22,8 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de texto) |
| Tipos de cuantizacion | no disponible (pesos en FP32; se menciona sensibilidad a bfloat16 en otras variantes, no en esta) |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

LowFormer combina bloques MBConv (convoluciones en profundidad y punto a punto) con un bloque de atención eficiente que proyecta a una resolución espacial menor mediante una convolución en profundidad con stride y luego remuestrea con una convolución transpuesta. Sin embargo, las variantes `E` (edge) eliminan tanto la rama de atención como la de MLP, dejando únicamente etapas convolucionales. En concreto, `lowformer_e2` es la segunda variante de este tipo, con una configuración que prioriza el rendimiento en GPUs de borde sobre la precisión bruta.

El modelo fue entrenado en el dataset ImageNet-1k por los autores del paper original. El preprocesamiento por defecto está codificado en la configuración del modelo: redimensionado bicúbico, media y desviación estándar de ImageNet, y recorte central con `crop_pct=0.95`. La innovación principal de LowFormer es su metodología de diseño orientada a la latencia medida en hardware real, en lugar de solo contar MACs, lo que permite obtener mejores resultados prácticos en dispositivos de borde.

## Capacidades

- Clasificacion de imagenes: el modelo produce logits sobre las 1000 clases de ImageNet-1k, con una precision Top-1 de 81,612 % a 224×224 en FP32.
- Extraccion de mapas de caracteristicas multi-escala: usando `features_only=True`, devuelve tensores de forma `[1, 64, 56, 56]`, `[1, 128, 28, 28]`, `[1, 256, 14, 14]` y `[1, 512, 7, 7]`, utiles para tareas de deteccion, segmentacion o como backbone en modelos de dos etapas.
- Generacion de embeddings de imagen: con `num_classes=0` o `forward_features`, se obtiene un vector de caracteristicas de 512 dimensiones (tras el pooling) o un tensor sin agrupar de forma `[1, 512, 7, 7]`.
- Inferencia eficiente en hardware de borde: al ser una variante puramente convolucional, no requiere atencion, lo que reduce la latencia y el consumo de memoria en GPUs de gama baja o integradas.
- Compatibilidad con el ecosistema `timm`: se integra con las utilidades de transformacion de datos, entrenamiento y validacion de la libreria, facilitando su uso en pipelines existentes.

## Casos de uso

- Clasificacion de imagenes en dispositivos de borde: el modelo puede desplegarse en GPUs integradas (como NVIDIA Jetson) o CPUs con aceleracion, gracias a su bajo coste computacional (3,8 GMACs) y su diseno sin atencion. Es adecuado para sistemas de vision en tiempo real, como control de calidad en fabricas o clasificacion de productos en almacenes.
- Extraccion de caracteristicas para deteccion de objetos: al usar `features_only=True`, se obtienen mapas de caracteristicas multi-escala que pueden alimentar cabezales de deteccion (por ejemplo, con Faster R-CNN o YOLO). Su bajo numero de parametros permite entrenar el detector completo en GPUs de consumo.
- Generacion de embeddings para busqueda visual: con `num_classes=0`, se obtiene un vector de 512 dimensiones que puede indexarse en bases de datos vectoriales para tareas de busqueda por similitud, como recomendacion de productos o deduplicacion de imagenes.
- Segmentacion semantica en entornos con recursos limitados: los mapas de caracteristicas extraidos pueden conectarse a decodificadores ligeros (como U-Net) para segmentar imagenes medicas o de satelite en hardware de bajo consumo.
- Prototipado rapido de modelos de vision: gracias a su integracion en `timm`, se puede cargar el modelo preentrenado en pocas lineas de codigo y usarlo como punto de partida para fine-tuning en datasets especificos, reduciendo el tiempo de desarrollo.
- Evaluacion de tecnicas de cuantizacion y compresion: al ser un modelo pequeno y con arquitectura convolucional, es un candidato ideal para experimentar con cuantizacion post-entrenamiento (PTQ) o destilacion de conocimiento, ya que su margen de perdida de precision es menor que en modelos con atencion.

## Benchmarks y rendimiento

La model card proporciona resultados de validacion en ImageNet-1k en FP32, con interpolacion bicubica y recorte central (`crop_pct=0.95`). Se muestran valores Top-1 / Top-5 para distintas resoluciones de entrada, comparando con otras variantes de la familia LowFormer.

| Modelo | Params (M) | 224 Top-1 / Top-5 | 256 Top-1 / Top-5 | 288 Top-1 / Top-5 |
|---|---:|---:|---:|---:|
| lowformer_b0.in1k | 14,10 | 78,388 / 94,026 | 79,194 / 94,462 | 79,306 / 94,444 |
| lowformer_b1.in1k | 17,94 | 79,806 / 94,592 | 80,260 / 94,914 | 80,406 / 95,072 |
| lowformer_b15.in1k | 33,98 | 81,102 / 95,258 | 81,558 / 95,470 | 81,708 / 95,588 |
| lowformer_b3.in1k | 57,09 | 83,656 / 96,656 | 83,988 / 96,738 | 84,066 / 96,834 |
| lowformer_e1.in1k | 18,90 | 78,772 / 94,120 | 79,366 / 94,450 | 79,624 / 94,562 |
| **lowformer_e2.in1k** | **22,75** | **81,612 / 95,714** | **81,982 / 95,948** | **82,156 / 96,098** |

No se han publicado resultados de benchmarks comparativos con modelos externos (como MobileNetV3, EfficientNet o ConvNeXt) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 22,8 M de parametros en FP32, el peso del modelo ocupa aproximadamente 91 MB. Con overhead de activaciones y buffers, la VRAM necesaria es inferior a 1 GB, por lo que cabe en cualquier GPU moderna, incluidas las integradas.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente. Ejemplos: NVIDIA Jetson Nano, Jetson Orin, GTX 1650, RTX 2060 o superiores. Tambien puede ejecutarse en CPU con razonable rendimiento gracias a su bajo coste computacional.
- Compatibilidad con consumer GPU: si, es totalmente viable en GPUs de consumo como la RTX 3060 o incluso en iGPUs de Intel/AMD para inferencia puntual.
- Opciones de despliegue: al ser un modelo de `timm`, se puede exportar a ONNX o TorchScript para su uso con TensorRT, OpenVINO o llama.cpp (aunque este ultimo no es habitual para vision). Tambien es compatible con servidores de inferencia como TorchServe o Triton.
- Latencia y throughput: no se proporcionan mediciones oficiales en la informacion disponible. Dado su tamano y arquitectura convolucional, se espera una latencia de pocos milisegundos en una GPU moderna (por ejemplo, < 5 ms en una RTX 3090), pero estos valores dependen del runtime y la resolucion de entrada.

## Comparativa con modelos similares

La comparativa se limita a la familia LowFormer, ya que no se dispone de datos de otros backbones en la informacion proporcionada.

| Modelo | Params (M) | GMACs | Top-1 (224) | Top-1 (288) | Licencia |
|---|---:|---:|---:|---:|---|
| lowformer_b0.in1k | 14,10 | no disponible | 78,388 | 79,306 | Apache 2.0 |
| lowformer_b1.in1k | 17,94 | no disponible | 79,806 | 80,406 | Apache 2.0 |
| lowformer_e1.in1k | 18,90 | no disponible | 78,772 | 79,624 | Apache 2.0 |
| **lowformer_e2.in1k** | **22,75** | **3,8** | **81,612** | **82,156** | **Apache 2.0** |
| lowformer_b15.in1k | 33,98 | no disponible | 81,102 | 81,708 | Apache 2.0 |
| lowformer_b3.in1k | 57,09 | no disponible | 83,656 | 84,066 | Apache 2.0 |

`lowformer_e2` ofrece la mejor relacion precision-parametros entre las variantes de menos de 25 M, superando a `b15` (33,98 M) en Top-1 a 224 y 288, con un 33 % menos de parametros. Frente a `e1`, que tiene 18,9 M, `e2` gana casi 3 puntos de Top-1 a 224, lo que justifica el aumento de parametros.

## Limitaciones y advertencias

- Sesgos conocidos: al estar entrenado en ImageNet-1k, el modelo hereda los sesgos de ese dataset, que esta compuesto mayoritariamente por imagenes de internet con distribuciones de clases y contextos occidentales. Puede tener un rendimiento deficiente en dominios muy diferentes (por ejemplo, imagenes medicas o de satelite) sin fine-tuning.
- Riesgo de alucinacion: no aplica directamente, ya que es un modelo discriminativo de vision, no generativo. Sin embargo, en tareas de clasificacion puede producir predicciones erroneas con alta confianza en clases no representadas.
- Limitaciones de contexto o idioma: no aplica, al ser un modelo de vision puro. No procesa texto ni tiene capacidades multilingues.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, modificacion y redistribucion, siempre que se mantenga el aviso de copyright y se indiquen los cambios realizados. No hay restricciones de uso militar o de vigilancia.
- Caveats para produccion: la model card advierte que las variantes `b0` y `b1` pierden precision significativa con autocast en `bfloat16` (hasta 3 puntos Top-1), pero no menciona `e2`. Aun asi, se recomienda validar el comportamiento en FP16 o FP32 antes de desplegar. Ademas, la latencia depende fuertemente del runtime y la exportacion; es necesario medir en el hardware objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/timm/lowformer_e2.in1k
- Repositorio original de LowFormer: https://github.com/altair199797/LowFormer
- Paper "LowFormer: Hardware Efficient Design for Convolutional Transformer Backbones": https://arxiv.org/abs/2409.03460
- Paper "Beyond MACs: Hardware Efficient Architecture Design for Vision Backbones": https://arxiv.org/abs/2603.26551
- Libreria PyTorch Image Models (timm): https://github.com/huggingface/pytorch-image-models
- Documentacion de timm: https://timm.fast.ai/
