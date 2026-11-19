# torch-pointcloud/pointmlp-elite.scanobjectnn-hardest.xu-ma

## Resumen

PointMLP Elite es un modelo de clasificación de nubes de puntos 3D basado en una arquitectura de perceptrón multicapa residual (residual MLP) con agrupamiento geométrico afín. Lo publica el usuario `torch-pointcloud` como un checkpoint convertido del repositorio original de los autores de PointMLP (`ma-xu/pointMLP-pytorch`), empaquetado para la librería `torch-pointcloud`. Su propósito es asignar una de 15 clases semánticas a una nube de puntos de 8192 puntos con coordenadas y normales, una tarea central en visión 3D para robótica, conducción autónoma y digitalización de entornos.

El modelo es deliberadamente compacto: 717.615 parámetros (0,7 M) y 256 canales de características, lo que lo sitúa en la categoría de modelos ligeros que pueden ejecutarse en CPU o en GPUs de consumo con latencias de milisegundos. Está entrenado específicamente sobre la variante más difícil de ScanObjectNN (PB_T50_RS), que introduce perturbaciones y oclusiones para acercar el benchmark a condiciones reales de captura.

Su relevancia actual radica en que demuestra que una arquitectura puramente MLP, sin convoluciones ni mecanismos de atención sobre grafos, alcanza un 84,18 % de accuracy global (OA) y un 81,77 % de accuracy media por clase (mAcc) en el split hardest de ScanObjectNN, con un coste computacional muy inferior al de alternativas como PointNet++, DGCNN o Point Transformer. Es un candidato práctico para pipelines de clasificación 3D en producción donde el presupuesto de cómputo es limitado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PointMLP (residual MLP con geometric affine grouping) |
| Parametros totales | 717.615 (0,7 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de nube de puntos, no de texto) |
| Puntos de entrada | 8192 puntos por muestra |
| Canales de entrada | 3 (coordenadas), con normales opcionales como entrada adicional |
| Canales de caracteristicas | 256 |
| Clases de salida | 15 |
| Tipos de cuantizacion | no disponible (no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (modelo no linguistico) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Libreria | torch-pointcloud |
| Dataset de entrenamiento | ScanObjectNN (PB_T50_RS) |

## Arquitectura y entrenamiento

PointMLP se articula en torno a un módulo de agrupamiento geométrico afín (geometric affine grouping) que, para cada punto, selecciona vecinos y aplica una transformación afín aprendida que normaliza localmente la geometría antes de procesarla. Sobre esa representación se apilan bloques residuales de MLP con conexiones de identidad, lo que permite profundidad sin degradación del gradiente. El modelo prescinde de operaciones de atención global y de convoluciones sobre grafos, lo que reduce el coste de memoria y simplifica el despliegue. La variante "elite" incluida aquí corresponde a la configuración con 256 canales de características y 0,7 M de parámetros, la más ligera de la familia PointMLP.

El entrenamiento se realiza sobre ScanObjectNN en su configuración PB_T50_RS, que combina objetos perturbados con traslaciones, rotaciones y oclusiones severas, y que se considera el split más exigente del benchmark. La model card no documenta el número de tokens ni la composición exacta del dataset, ni indica si hubo fases de aumento de datos adicionales, destilación o ajuste fino posterior. El checkpoint se ha convertido desde el repositorio original de los autores manteniendo la licencia Apache-2.0, y se distribuye con la transformación de preprocesado asociada accesible a través de `info["transform"]`.

## Capacidades

- Clasificación de nubes de puntos 3D en 15 clases semánticas sobre muestras de 8192 puntos.
- Extracción de embeddings globales de 256 dimensiones mediante `forward_features` o `reset_classifier(num_classes=0)`.
- Procesamiento por lotes con gestión de índices de batch para concatenar múltiples nubes en una sola pasada.
- Entrada opcional con normales de superficie además de las coordenadas XYZ.
- Ejecución en CPU y GPU con el mismo checkpoint en safetensors.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No dispone de capacidades multilingües, visión 2D, audio ni modo de razonamiento extendido.
- No incluye cabecera de segmentación ni detección; la salida es exclusivamente logits de clasificación global.

## Casos de uso

- Clasificación de objetos en escaneos de robot móvil: el modelo recibe la nube de puntos capturada por un LiDAR o cámara de profundidad, se remuestrea a 8192 puntos y devuelve la clase del objeto dominante; su tamaño de 0,7 M permite ejecutarlo en el propio robot a decenas de hercios.
- Preetiquetado en pipelines de anotación 3D: se usa como clasificador de primera pasada para sugerir etiquetas a anotadores humanos, con la extracción de embeddings de 256 dimensiones para agrupar muestras dudosas y priorizar la revisión manual.
- Control de calidad en digitalización de patrimonio: clasificación automática de fragmentos escaneados en categorías (mobiliario, herramienta, elemento arquitectónico) para organizar catálogos, aprovechando la robustez del entrenamiento sobre PB_T50_RS frente a oclusiones parciales.
- Filtrado en pipelines de realidad aumentada: descarte o etiquetado de objetos detectados en la escena antes de renderizar anclajes, con inferencia en GPU de consumo y latencia compatible con tiempo real.
- Búsqueda y recuperación de activos 3D: los embeddings de 256 dimensiones permiten indexar modelos de un catálogo y recuperar los más similares por distancia vectorial, sin necesidad de un segundo modelo de representación.
- Extracción de características para modelos posteriores: el vector de 256 dimensiones sirve como entrada a clasificadores ligeros o a tareas de segmentación aguas abajo, reduciendo el coste frente a usar un backbone 3D de mayor tamaño.
- Clasificación en dispositivos de borde sin GPU: al ser un MLP de 0,7 M de parámetros, puede ejecutarse en CPU en escenarios de inspección industrial donde no hay acelerador disponible.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo en la model card (no verificados de forma independiente):

| Modelo | Dataset | OA | mAcc |
|---|---|---|---|
| pointmlp-elite.scanobjectnn-hardest.xu-ma | ScanObjectNN (PB_T50_RS) | 84,18 | 81,77 |

No se han publicado en la información disponible resultados de benchmarks adicionales ni comparaciones oficiales con otros modelos en este mismo checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB para un lote pequeño; el cuello de botella es la activación intermedia sobre 8192 puntos, no los pesos (0,7 M de parámetros, unos pocos MB en fp32).
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria; RTX 3060, RTX 4090, A100 y H100 son válidas, aunque el modelo está sobredimensionado para estas últimas.
- Cabe holgadamente en GPU de consumo, incluidos portátiles con gráfica integrada moderna; también es viable en CPU.
- Opciones de despliegue: librería `torch-pointcloud` (vía `tp.create_model`), PyTorch nativo cargando el safetensors, y exportación a TorchScript u ONNX si se requiere. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Dataset | OA (PB_T50_RS) | Licencia |
|---|---|---|---|---|---|
| PointMLP Elite (este) | 0,7 M | 8192 puntos, 3 canales | ScanObjectNN PB_T50_RS | 84,18 | Apache-2.0 |
| PointNet++ | no disponible en esta ficha | nube de puntos | ScanObjectNN PB_T50_RS | no disponible en esta ficha | no disponible en esta ficha |
| DGCNN | no disponible en esta ficha | nube de puntos | ScanObjectNN PB_T50_RS | no disponible en esta ficha | no disponible en esta ficha |
| Point Transformer | no disponible en esta ficha | nube de puntos | ScanObjectNN PB_T50_RS | no disponible en esta ficha | no disponible en esta ficha |

No se dispone en la información proporcionada de cifras verificadas de los modelos alternativos para establecer una comparación numérica fiable; se indica "no disponible" en lugar de estimar valores.

## Limitaciones y advertencias

- El modelo clasifica nubes de puntos completas en una de 15 clases; no localiza instancias ni segmenta por punto, por lo que no sirve para escenas con varios objetos sin un paso previo de segmentación.
- Entrenado exclusivamente sobre ScanObjectNN (PB_T50_RS); el dominio de objetos domésticos y de oficina escaneados limita la generalización a otras categorías (vehículos, vegetación, estructuras industriales).
- La resolución de entrada está fijada en 8192 puntos; remuestrear nubes muy dispersas o muy densas puede degradar la accuracy de forma no cuantificada en la model card.
- Riesgo de confusión entre clases geométricamente próximas y de predicciones sobreconfiadas en objetos ocluidos, precisamente el régimen que PB_T50_RS simula.
- Los resultados de benchmarks son declarados por el autor y no están verificados de forma independiente (`verified: false` en el model-index).
- Licencia Apache-2.0: permite uso comercial y modificación, pero exige conservar el aviso de licencia y el archivo NOTICE; conviene revisar también la licencia del repositorio original `ma-xu/pointMLP-pytorch` del que procede la conversión.
- No se documentan sesgos demográficos ni lingüísticos por la naturaleza del modelo, pero sí existe un sesgo de dominio derivado del dataset de entrenamiento.
- No hay información sobre cuantizaciones, latencia en producción ni pruebas de robustez fuera del benchmark, lo que obliga a validar el modelo en el dominio objetivo antes de desplegarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/torch-pointcloud/pointmlp-elite.scanobjectnn-hardest.xu-ma
- Paper de PointMLP (arXiv:2202.07123): https://arxiv.org/abs/2202.07123
- Repositorio original de PointMLP: https://github.com/ma-xu/pointMLP-pytorch
- Librería torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- DOI de PyTorch PointCloud: https://doi.org/10.5281/zenodo.22159632
- Paper de ScanObjectNN (ICCV 2019): no disponible como enlace directo en la información proporcionada
