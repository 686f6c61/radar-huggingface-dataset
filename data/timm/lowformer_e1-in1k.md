# timm/lowformer_e1.in1k

## Resumen

LowFormer es una familia de backbones de visión por computador diseñada por un equipo de investigación (cuyo repositorio oficial se encuentra en GitHub) con un objetivo claro: optimizar la latencia real medida en hardware, en lugar de limitarse a reducir el número de operaciones MAC. El modelo `lowformer_e1.in1k` es una de las variantes denominadas "edge-GPU" (E), pensadas para dispositivos con GPUs integradas o de bajo consumo. A diferencia de las variantes base (B), las variantes E eliminan por completo las ramas de atención y MLP del bloque LowFormer, quedando como una red puramente convolucional que combina bloques MBConv fusionados y agrupados. Esta decisión de diseño sacrifica algo de precisión a cambio de una latencia significativamente menor en hardware edge.

El checkpoint concreto está entrenado en ImageNet-1k y convertido al formato de `timm` (PyTorch Image Models). Con 18,9 millones de parámetros y 1,4 GMACs, ofrece una precisión Top-1 de 78,77 % a 224 píxeles, lo que lo sitúa en un punto intermedio entre eficiencia y exactitud dentro de su familia. Su relevancia actual radica en que responde a la creciente demanda de modelos que funcionen en tiempo real en dispositivos con recursos limitados, donde la latencia real importa más que las métricas teóricas de cómputo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LowFormer (variante E1, convolucional pura sin atención) |
| Parametros totales | 18.914.676 (18,9 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de visión) |
| Tipos de cuantizacion | No disponible (pesos en FP32; se puede cuantizar a FP16, BF16 o int8 mediante herramientas externas) |
| Idiomas soportados | No aplica (modelo de visión) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

LowFormer combina bloques MBConv fusionados y agrupados con un bloque de atención eficiente que proyecta a una resolución espacial menor mediante una convolución depthwise con stride y luego remuestrea con una convolución transpuesta. Sin embargo, las variantes E (edge-GPU) eliminan tanto la rama de atención como la de MLP, dejando únicamente etapas convolucionales. En el caso concreto de `e1`, el modelo resultante es una red totalmente convolucional con un diseño orientado a minimizar la latencia real en GPUs de bajo consumo, en lugar de optimizar únicamente el recuento de MACs.

El entrenamiento se realizó sobre ImageNet-1k por los autores del paper, y el checkpoint se convirtió al formato de `timm`. No se especifican detalles sobre el número de épocas, el optimizador o si se aplicaron técnicas como regularización o aumento de datos más allá del preprocesamiento estándar (bicubic resize, normalización con media y desviación de ImageNet, y center crop con `crop_pct=0.95`). La innovación principal del trabajo es la metodología de diseño basada en latencia medida, que se detalla en los dos artículos asociados.

## Capacidades

- Clasificacion de imagenes: el modelo predice una de las 1000 clases de ImageNet-1k con una precision Top-1 de 78,77 % a 224 píxeles.
- Extraccion de mapas de caracteristicas multi-escala: mediante `features_only=True` se obtienen mapas de características de 4 niveles (por ejemplo, 40x56x56, 80x28x28, 160x14x14, 320x7x7), util para tareas de deteccion o segmentacion.
- Generacion de embeddings de imagen: eliminando la capa de clasificacion (`num_classes=0`) se obtiene un vector de características de 320 dimensiones (o 320x7x7 sin pool), adecuado para tareas de recuperacion o similitud.
- Inferencia eficiente en hardware edge: al ser una red puramente convolucional, su latencia es predecible y baja en GPUs integradas, lo que la hace apta para aplicaciones en tiempo real.
- Compatibilidad con el ecosistema `timm`: se integra con las utilidades de preprocesado, entrenamiento y exportacion de la libreria.

## Casos de uso

- Clasificacion de imagenes en dispositivos edge: el modelo puede desplegarse en una GPU integrada (por ejemplo, NVIDIA Jetson) para clasificar imagenes en tiempo real, gracias a su bajo coste computacional (1,4 GMACs) y su diseno orientado a latencia.
- Backbone para deteccion de objetos: al extraer mapas de caracteristicas multi-escala, puede servir como columna vertebral en arquitecturas como Faster R-CNN o YOLO, proporcionando caracteristicas ricas con un coste reducido.
- Generacion de embeddings para busqueda visual: en un sistema de recuperacion de imagenes, se pueden generar embeddings de 320 dimensiones y compararlos mediante similitud coseno, con un rendimiento adecuado para catalogos de tamano medio.
- Clasificacion de imagenes medicas: con un fine-tuning sobre un dataset especifico (por ejemplo, radiografias), el modelo puede adaptarse a dominios especializados manteniendo un coste computacional bajo.
- Aplicaciones de realidad aumentada: la baja latencia permite integrar el modelo en pipelines de vision en moviles o gafas inteligentes para reconocer objetos o escenas en tiempo real.
- Prototipado rapido en investigacion: al estar disponible en `timm` con pesos preentrenados, es facil experimentar con el como baseline en estudios de eficiencia o comparativas de backbones.

## Benchmarks y rendimiento

La model card proporciona resultados de validacion en ImageNet-1k en FP32, con interpolacion bicubica y center crop (`crop_pct=0.95`). Se muestran valores Top-1 / Top-5 para tres resoluciones de entrada.

| Modelo | Params (M) | 224 Top-1 / Top-5 | 256 Top-1 / Top-5 | 288 Top-1 / Top-5 |
|---|---:|---:|---:|---:|
| lowformer_b0.in1k | 14,10 | 78,388 / 94,026 | 79,194 / 94,462 | 79,306 / 94,444 |
| lowformer_b1.in1k | 17,94 | 79,806 / 94,592 | 80,260 / 94,914 | 80,406 / 95,072 |
| lowformer_b15.in1k | 33,98 | 81,102 / 95,258 | 81,558 / 95,470 | 81,708 / 95,588 |
| lowformer_b3.in1k | 57,09 | 83,656 / 96,656 | 83,988 / 96,738 | 84,066 / 96,834 |
| **lowformer_e1.in1k** | **18,90** | **78,772 / 94,120** | **79,366 / 94,450** | **79,624 / 94,562** |
| lowformer_e2.in1k | 22,75 | 81,612 / 95,714 | 81,982 / 95,948 | 82,156 / 96,098 |

No se han publicado resultados de benchmarks comparativos con modelos de otras familias (como MobileNet o EfficientNet) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 76 MB en FP32 (18,9 M parametros x 4 bytes). Con cuantizacion FP16 se reduce a ~38 MB, y con int8 a ~19 MB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente. Modelos como NVIDIA Jetson Nano, Jetson TX2 o GPUs integradas Intel pueden ejecutarlo sin problemas.
- Compatibilidad con consumer GPU: si, cabe en cualquier GPU de consumo actual (RTX 2060, GTX 1650, etc.) e incluso en CPU con un rendimiento aceptable.
- Opciones de despliegue: al ser un modelo `timm`, se puede exportar a ONNX, TorchScript o TensorRT. Tambien es compatible con frameworks de inferencia como ONNX Runtime o OpenVINO.
- Latencia y throughput: no se proporcionan mediciones especificas en la informacion disponible. Los papers originales incluyen mediciones en hardware concreto, pero no se reproducen aqui.

## Comparativa con modelos similares

Dentro de la propia familia LowFormer, la variante `e1` se situa entre `b1` y `b2` en parametros, pero con una precision ligeramente inferior a `b1` (78,77 % vs 79,81 % a 224 px). La ventaja de `e1` es su menor latencia en GPUs edge, aunque no se dispone de datos cuantitativos de latencia en la informacion proporcionada. Comparado con otros backbones eficientes de tamano similar (por ejemplo, MobileNetV3-Large o EfficientNet-B0), no se dispone de datos de rendimiento en la misma configuracion, por lo que no se puede establecer una comparacion directa.

| Modelo | Params (M) | Top-1 (224) | Licencia | Disponibilidad |
|---|---:|---:|---|---|
| lowformer_e1.in1k | 18,9 | 78,77 | Apache 2.0 | timm / HuggingFace |
| lowformer_b1.in1k | 17,9 | 79,81 | Apache 2.0 | timm / HuggingFace |
| lowformer_e2.in1k | 22,8 | 81,61 | Apache 2.0 | timm / HuggingFace |

## Limitaciones y advertencias

- Sesgos conocidos: al estar entrenado en ImageNet-1k, el modelo hereda los sesgos de ese dataset, que puede contener estereotipos o categorias poco representativas de ciertos grupos.
- Riesgo de alucinacion: no aplica, al ser un modelo discriminativo de clasificacion, no generativo.
- Limitaciones de contexto o idioma: no aplica, es un modelo de vision sin capacidad de procesamiento de lenguaje.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, modificacion y redistribucion, siempre que se mantenga el aviso de copyright y se indiquen los cambios realizados.
- Caveat para produccion: la precision en FP32 es la referencia; si se usa autocast BF16, las variantes `b0` y `b1` pierden hasta 3 puntos de Top-1, aunque `e1` no se ve afectada significativamente (se mantiene dentro de 0,25). Se recomienda usar FP16 si se necesita autocast.
- El modelo no incluye soporte para otras tareas como segmentacion o deteccion de forma nativa; requiere adaptaciones externas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/timm/lowformer_e1.in1k
- Repositorio oficial de LowFormer: https://github.com/altair199797/LowFormer
- Paper "LowFormer: Hardware Efficient Design for Convolutional Transformer Backbones": https://arxiv.org/abs/2409.03460
- Paper "Beyond MACs: Hardware Efficient Architecture Design for Vision Backbones": https://arxiv.org/abs/2603.26551
- Libreria timm (PyTorch Image Models): https://github.com/huggingface/pytorch-image-models
