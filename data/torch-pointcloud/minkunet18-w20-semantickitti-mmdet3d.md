# torch-pointcloud/minkunet18-w20.semantickitti.mmdet3d

## Resumen

MinkUNet18-w20 es un modelo de segmentacion semantica de nubes de puntos LiDAR, no un modelo de lenguaje. Implementa una U-Net residual sobre convoluciones dispersas Minkowski (Minkowski Engine), con un backbone de 18 capas y un ancho de canal de 20, entrenado sobre el dataset SemanticKITTI para clasificar cada punto de una escena urbana en una de 19 clases (vehiculo, peaton, carretera, edificio, vegetacion, etc.).

Lo desarrolla el proyecto `torch-pointcloud` (Arthur Dujardin) como conversión del checkpoint original de MMDetection3D al formato de su libreria `torch-pointcloud`, publicada en Hugging Face bajo licencia Apache-2.0. El modelo tiene 8,8 millones de parametros, recibe 4 canales de entrada (coordenadas xyz + intensidad) y produce un vector de 61 caracteristicas por punto antes de la cabeza de clasificacion.

Su relevancia es practica: ofrece un baseline ligero y reproducible (mIoU 61,58 y OA 91,93 en SemanticKITTI segun el autor) para tareas de percepcion 3D en robotica y conduccion autonoma, con un consumo de memoria y computo muy inferior al de los transformers 3D actuales. No procesa texto ni imagenes 2D, por lo que las secciones de capacidades linguisticas, tool calling y agentes no aplican.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MinkUNet18-w20 (U-Net residual con convoluciones dispersas Minkowski), backbone de 18 capas, ancho 20 |
| Parametros totales | 8.779.092 (8,8 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa nubes de puntos; el ejemplo de la model card usa 8192 puntos por muestra) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de vision 3D, sin capacidades linguisticas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Canales de entrada | 4 (xyz + intensidad) |
| Clases de salida | 19 (SemanticKITTI) |
| Dimension de caracteristicas | 61 |
| Dataset de entrenamiento | SemanticKITTI |
| Libreria | torch-pointcloud (requiere `spconv`) |
| Hardware requerido | GPU (kernels solo CUDA) |

## Arquitectura y entrenamiento

MinkUNet es una U-Net residual que opera sobre tensores dispersos mediante convoluciones Minkowski, una generalizacion de la convolucion a rejillas dispersas que evita procesar el espacio vacio. El backbone de 18 capas con ancho 20 procesa cada punto como un vóxel activo, aplica bloques residuales con downsampling y upsampling, y devuelve una prediccion por punto. La entrada son 4 canales (coordenadas xyz e intensidad LiDAR) y la salida son logits sobre 19 clases. El modelo expone tambien `forward_features`, que devuelve un descriptor de 61 dimensiones por punto.

El entrenamiento se realizo sobre SemanticKITTI, el benchmark de segmentacion semantica de secuencias LiDAR urbanas (Behley et al., ICCV 2019). La model card no detalla el numero de tokens, la composicion exacta del dataset, ni si hubo aumentado de datos o tecnicas de regularizacion adicionales; esa informacion no esta disponible. El checkpoint publicado es una conversion del modelo oficial de MMDetection3D, no un reentrenamiento desde cero.

## Capacidades

- Segmentacion semantica por punto de nubes LiDAR en 19 clases de escena urbana (vehiculo, peaton, ciclista, carretera, acera, edificio, vegetacion, poste, senalizacion, etc.).
- Procesamiento de nubes de puntos dispersas de forma eficiente gracias a las convoluciones Minkowski.
- Extraccion de caracteristicas por punto (`forward_features`), util como backbone para tareas posteriores.
- Capacidad de recorte de la cabeza de clasificacion (`reset_classifier(num_classes=0)`) para reutilizar el extractor en fine-tuning.
- Entrada con intensidad LiDAR ademas de coordenadas geometricas.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues: es un modelo puramente perceptivo 3D.

## Casos de uso

- Percepcion para conduccion autonoma: segmentar cada barrido LiDAR de un vehiculo en clases semanticas para alimentar modulos de planificacion y evitacion de obstaculos. Su coste computacional bajo (8,8 M de parametros) permite ejecutarlo en tiempo real sobre GPU embebidas.
- Robotica movil en exteriores: clasificar el terreno (carretera, acera, vegetacion, edificio) para que un robot de reparto o de inspeccion distinga zonas transitables de obstaculos.
- Etiquetado asistido de datos: usar las predicciones como pre-etiquetas en un pipeline de anotacion de nubes de puntos, reduciendo el coste manual de construir datasets propios.
- Backbone para fine-tuning: extraer las caracteristicas de 61 dimensiones por punto y entrenar una cabeza ligera para una taxonomia propia (por ejemplo, distinguir tipos de vehiculo o de infraestructura).
- Fusion con camaras: proyectar las etiquetas 3D sobre imagenes calibradas para generar mascaras 2D o para validar detecciones de un detector 2D.
- Analisis de escenas urbanas a escala: procesar secuencias LiDAR completas para inventariar mobiliario urbano, vegetacion o senalizacion en estudios de ciudad.
- Baseline de investigacion: punto de partida reproducible para comparar nuevas arquitecturas de segmentacion 3D contra un modelo ligero y bien conocido.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente, `verified: false`):

| Dataset | Tarea | Metrica | Valor |
|---|---|---|---|
| SemanticKITTI | Segmentacion de nubes de puntos | mIoU | 61,58 |
| SemanticKITTI | Segmentacion de nubes de puntos | OA (accuracy global) | 91,93 |

No se han publicado en la informacion disponible resultados comparativos con otros modelos ni desglose por clase.

## Requisitos de hardware

- Inferencia solo en GPU: los kernels de Minkowski Engine / `spconv` no tienen implementacion CPU funcional en este checkpoint.
- VRAM estimada: no disponible de forma oficial; con 8,8 M de parametros el peso en FP32 ronda los 35 MB, por lo que el consumo dominara por el tamano de la nube de puntos y el batch, no por los pesos.
- GPU recomendadas: cualquier GPU NVIDIA con CUDA compatible con la build de `spconv`; una RTX 3060/4090 es suficiente para inferencia interactiva, y A100/H100 solo aportan ventaja en batches grandes o entrenamiento.
- Cabe en GPU de consumo: si, siempre que se compile `spconv` para la version de CUDA y PyTorch instalada.
- Despliegue: la via soportada es la libreria `torch-pointcloud` (`tp.create_model(...)`) con `spconv`; no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Clases | mIoU SemanticKITTI | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| MinkUNet18-w20 (este) | 8,8 M | xyz + intensidad | 19 | 61,58 (autor) | Apache-2.0 | Hugging Face + torch-pointcloud |
| MinkUNet34 (MMDetection3D) | no disponible | xyz + intensidad | 19 | no disponible | Apache-2.0 | MMDetection3D |
| Cylinder3D | no disponible | xyz + intensidad | 19 | no disponible | no disponible | Repositorio oficial |
| SPVNAS / TorchSparse | no disponible | xyz + intensidad | 19 | no disponible | no disponible | Repositorio oficial |

No se dispone de cifras verificadas de los modelos alternativos en la informacion proporcionada; la comparativa se limita a categoria (segmentacion semantica LiDAR), familia arquitectonica y licencia.

## Limitaciones y advertencias

- Entrenado exclusivamente en SemanticKITTI: generaliza mal a sensores, densidades o entornos distintos (interiores, LiDAR de estado solido, otros paises).
- Las metricas declaradas no estan verificadas de forma independiente (`verified: false`); conviene reproducirlas antes de usarlas como referencia.
- Requiere `spconv` compilado contra la version exacta de PyTorch y CUDA; los desajustes de version son una fuente habitual de fallos.
- Solo funciona en GPU; no hay camino CPU documentado.
- Sin informacion sobre sesgos por clase ni sobre el rendimiento en clases minoritarias (por ejemplo, peatones o ciclistas), que suelen ser las mas criticas en seguridad.
- Riesgo de error en puntos ocluidos o dispersos: la prediccion por punto puede ser ruidosa en zonas con poca densidad LiDAR.
- Licencia Apache-2.0 permite uso comercial, pero el modelo deriva de MMDetection3D (tambien Apache-2.0); conviene conservar los avisos de atribucion.
- No apto para tareas de texto, dialogo ni generacion: cualquier expectativa de LLM es un error de categoria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/torch-pointcloud/minkunet18-w20.semantickitti.mmdet3d
- Paper de Minkowski Convolutional Neural Networks: https://arxiv.org/abs/1904.08755
- Paper de SemanticKITTI: https://arxiv.org/abs/1904.08755 (referencia cruzada en la model card; el paper original de SemanticKITTI es Behley et al., ICCV 2019)
- Repositorio de torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- Documentacion de instalacion: https://pytorch-pointcloud.org/latest/installation/
- Repositorio de MMDetection3D: https://github.com/open-mmlab/mmdetection3d
- DOI de PyTorch PointCloud: https://doi.org/10.5281/zenodo.22159632
