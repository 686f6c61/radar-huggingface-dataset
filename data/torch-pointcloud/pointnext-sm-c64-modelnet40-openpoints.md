# torch-pointcloud/pointnext-sm-c64.modelnet40.openpoints

## Resumen

PointNeXt SM C64 es un modelo de clasificación de nubes de puntos 3D, no un modelo de lenguaje. Lo desarrolla el ecosistema `torch-pointcloud` (Arthur Dujardin) a partir del trabajo original PointNeXt de Guocheng Qian y colaboradores (KAUST, NeurIPS 2022), y se distribuye como pesos convertidos del repositorio oficial `guochengqian/PointNeXt`. Su tarea es asignar una de 40 categorías de objeto a una nube de puntos de entrada con coordenadas XYZ (y normales opcionales), resolviendo el problema clásico de clasificación de formas 3D en el benchmark ModelNet40.

La arquitectura es una revisión escalada de PointNet++ que incorpora bloques residuales invertidos y estrategias de entrenamiento mejoradas, con 4,54 millones de parámetros y 1024 dimensiones de característica global. La variante "SM C64" corresponde a la configuración small con anchura base 64, el escalón más ligero de la familia PointNeXt, pensado para inferencia rápida y despliegue en entornos con recursos limitados.

Es relevante ahora porque ofrece un punto de partida preentrenado y listo para usar desde Python con una sola llamada (`tp.create_model`), con licencia MIT y pesos en safetensors, lo que facilita la integración en pipelines de visión 3D, robótica o inspección industrial sin necesidad de reentrenar desde cero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PointNeXt (PointNet++ escalado con bloques residuales invertidos) |
| Parametros totales | 4.540.200 (4,5 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de nube de puntos; entrada de 8192 puntos en el ejemplo de uso) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo no linguistico) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Canales de entrada | 3 (coordenadas XYZ; normales opcionales) |
| Clases de salida | 40 (ModelNet40) |
| Dimension de caracteristicas | 1024 |
| Dataset de entrenamiento | ModelNet40 |
| Libreria | torch-pointcloud |

## Arquitectura y entrenamiento

PointNeXt reformula PointNet++ manteniendo su esquema jerárquico de muestreo y agrupación de puntos, pero sustituye los bloques MLP por bloques residuales invertidos inspirados en MobileNetV2 y aplica estrategias de escalado y entrenamiento revisadas (aumento de datos, inicialización y regularización). El resultado es una familia de modelos donde el rendimiento escala de forma controlada con el número de parámetros; esta variante SM C64 es la de menor anchura (64 canales base) y 4,5 M de parámetros.

El modelo se entrena de forma supervisada para clasificación sobre ModelNet40, un dataset de 40 categorías de objetos CAD con nubes de puntos muestreadas de mallas. La model card no detalla el número de tokens/puntos de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de refinamiento posteriores; esos datos no están disponibles en la información proporcionada. La innovación técnica principal es la propia receta de escalado de PointNeXt, que permite obtener precisión cercana a la de modelos mucho mayores con una fracción de los parámetros.

## Capacidades

- Clasificación de nubes de puntos 3D en 40 categorías de ModelNet40 (silla, mesa, avión, coche, etc.).
- Extracción de embeddings globales de 1024 dimensiones mediante `forward_features` o `reset_classifier(num_classes=0)`, útiles como descriptor para tareas posteriores.
- Acepta coordenadas XYZ y, opcionalmente, normales de superficie como canales adicionales.
- Funciona con lotes (`collate`) y máscaras de batch para procesar varias nubes simultáneamente.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: no es un modelo generativo.
- No tiene capacidades multilingües, de visión 2D, audio ni modo "thinking".
- Reentrenable para un número distinto de clases mediante `reset_classifier`.

## Casos de uso

- Clasificación de objetos escaneados en robótica móvil: el modelo recibe la nube de puntos de un sensor LiDAR o RGB-D y devuelve la categoría del objeto, con 4,5 M de parámetros que permiten ejecución en la CPU o GPU integrada del robot.
- Inspección industrial y control de calidad: clasificar piezas capturadas con escáneres 3D para detectar componentes fuera de catálogo o mal posicionados en una línea de producción.
- Preprocesado para pipelines de reconstrucción o modelado 3D: usar los embeddings de 1024 dimensiones como entrada a un clasificador ligero, un sistema de recuperación de formas o un clustering no supervisado.
- Etiquetado automático de datasets 3D: preanotar nubes de puntos con las 40 clases de ModelNet40 para acelerar el etiquetado manual posterior.
- Base para fine-tuning en dominios específicos: reemplazar la cabeza de clasificación por una de N clases propias (por ejemplo, tipos de vehículos o componentes mecánicos) y ajustar con pocos datos.
- Prototipado e investigación en visión 3D: punto de partida reproducible y ligero para comparar arquitecturas o técnicas de aumento de datos en clasificación de formas.
- Filtrado y organización de activos CAD: clasificar automáticamente mallas convertidas a nubes de puntos en bibliotecas de modelos 3D.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Benchmark | Metrica | Valor |
|---|---|---|
| ModelNet40 | Overall Accuracy (OA) | 93,96 |
| ModelNet40 | Mean per-class Accuracy (mAcc) | 91,14 |

No se han publicado en la información disponible resultados comparativos adicionales (por ejemplo, latencia o throughput) para esta variante concreta.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 4,5 M de parámetros los pesos ocupan del orden de 18 MB en FP32 y 9 MB en FP16, más el coste de activaciones para el número de puntos de entrada (8192 en el ejemplo).
- GPU recomendadas: cualquier GPU moderna sirve; no requiere A100 ni H100. Una RTX 4090, RTX 3060 o incluso una GPU integrada son suficientes.
- Cabe holgadamente en GPU de consumo e incluso en CPU para lotes pequeños.
- Opciones de despliegue: la librería `torch-pointcloud` (PyTorch) es la vía oficial; también es posible exportar a TorchScript u ONNX para servir con ONNX Runtime, aunque la información disponible no documenta exportaciones oficiales.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Dataset | OA (ModelNet40) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PointNeXt SM C64 (este) | 4,5 M | ModelNet40 | 93,96 | MIT | Hugging Face, torch-pointcloud |
| PointNet++ (original) | no disponible en la informacion | ModelNet40 | no disponible en la informacion | MIT (repo original) | GitHub guochengqian/PointNeXt |
| Otras variantes PointNeXt (S/L) | mayores que 4,5 M | ModelNet40 | no disponible en la informacion | MIT | GitHub guochengqian/PointNeXt |

No se dispone en la información proporcionada de cifras de benchmarks de los modelos alternativos para una comparación cuantitativa rigurosa.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en clasificación de nubes de puntos; no genera texto ni admite instrucciones en lenguaje natural.
- Entrenado solo en ModelNet40 (objetos CAD sintéticos); el rendimiento puede degradarse con nubes de puntos reales, ruidosas o con oclusiones.
- Las métricas (OA 93,96, mAcc 91,14) están declaradas por el autor y marcadas como no verificadas.
- No se documentan sesgos específicos, pero el dataset ModelNet40 tiene un sesgo conocido hacia categorías y formas de objetos cotidianos de entornos de oficina/hogar.
- Riesgo de sobreajuste a la distribución de muestreo de puntos y al número de puntos usado en entrenamiento; conviene validar con el preprocesado exacto de `info["transform"]`.
- Licencia MIT: permite uso comercial y modificación, pero se recomienda conservar la atribución a PointNeXt y a torch-pointcloud según las citas de la model card.
- No hay información sobre cuantización, exportación a otros runtimes ni latencias en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/torch-pointcloud/pointnext-sm-c64.modelnet40.openpoints
- Paper PointNeXt: https://arxiv.org/abs/2206.04670
- Repositorio original PointNeXt: https://github.com/guochengqian/PointNeXt
- Libreria torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- DOI de PyTorch PointCloud: https://doi.org/10.5281/zenodo.22159632
- Paper ModelNet40 (3D ShapeNets): https://arxiv.org/abs/1406.5670
