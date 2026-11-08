# torch-pointcloud/pointgpt-l.scanobjectnn-objbg.guangyan-chen

## Resumen

PointGPT-L es un modelo de clasificación de nubes de puntos 3D basado en un transformer con preentrenamiento generativo autorregresivo. Lo desarrolla Guangyan Chen y colaboradores (Universidad de Pekín, BIT y Peng Cheng Laboratory) y esta versión concreta ha sido convertida y publicada por el proyecto `torch-pointcloud` de Arthur Dujardin. El modelo resuelve la tarea de clasificar objetos 3D representados como conjuntos de puntos, una pieza central en pipelines de percepción para robótica, conducción autónoma y digitalización de escenas.

La relevancia de esta ficha es doble: por un lado, PointGPT traslada el paradigma de preentrenamiento autorregresivo de los modelos de lenguaje al dominio de las nubes de puntos, permitiendo aprovechar grandes volúmenes de datos 3D sin etiquetar; por otro, esta conversión a `torch-pointcloud` ofrece pesos en `safetensors` integrados en una librería de PyTorch, lo que simplifica su uso en producción frente al repositorio original.

Esta variante concreta es un ajuste fino sobre el checkpoint base `pointgpt-l.labeled-hybrid.guangyan-chen` para el subconjunto OBJ_BG del benchmark ScanObjectNN, con 15 clases y 360,4 millones de parámetros. Declara una precisión global (OA) del 98,45 % y una precisión media por clase (mAcc) del 98,19 % en dicho benchmark.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con preentrenamiento generativo autorregresivo (PointGPT) |
| Parametros totales | 360.365.935 (360,4 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (opera sobre nubes de puntos de 8192 puntos en el ejemplo de uso) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF ni cuantizadas publicadas) |
| Idiomas soportados | no disponible (modelo no linguistico) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Clases de salida | 15 (ScanObjectNN) |
| Dimension de caracteristicas | 2048 |
| Libreria | torch-pointcloud |
| Modelo base | torch-pointcloud/pointgpt-l.labeled-hybrid.guangyan-chen |

## Arquitectura y entrenamiento

PointGPT es un transformer que procesa nubes de puntos mediante un esquema de preentrenamiento generativo autorregresivo: el modelo aprende a predecir partes de la nube de puntos a partir de las ya observadas, de forma analoga a la prediccion del siguiente token en los modelos de lenguaje. Este enfoque permite explotar datos 3D sin etiquetar durante la fase de preentrenamiento y transferir despues el conocimiento a tareas downstream mediante ajuste fino. La variante "L" corresponde al tamano grande de la familia, con 360,4 millones de parametros.

El checkpoint publicado parte del modelo base entrenado con datos etiquetados de tipo hibrido y se ha ajustado fino sobre ScanObjectNN en su variante OBJ_BG, que incluye objetos escaneados con fondo. La model card no detalla el numero de tokens, la composicion exacta del dataset de preentrenamiento ni si se emplearon tecnicas de RLHF o DPO (no aplicables en este dominio). Tampoco se especifican innovaciones adicionales como decodificacion especulativa o atención lineal.

## Capacidades

- Clasificacion de nubes de puntos 3D en 15 categorias de objetos (tarea `point-cloud-classification`).
- Extraccion de caracteristicas o embeddings de 2048 dimensiones mediante `forward_features`, utiles para tareas downstream como recuperacion, clustering o clasificacion con cabezas personalizadas.
- Procesamiento de nubes de puntos de gran tamano (el ejemplo de uso emplea 8192 puntos por muestra).
- Integracion nativa con PyTorch a traves de la libreria `torch-pointcloud`, con API `create_model` y soporte de `reset_classifier` para reutilizar el backbone.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues: es un modelo puramente perceptivo y no linguistico.
- No dispone de modo "thinking", vision 2D, audio ni generacion de texto.

## Casos de uso

- Clasificacion de objetos en escenas escaneadas: el modelo recibe una nube de puntos de un objeto segmentado y devuelve una de las 15 clases de ScanObjectNN, adecuado para pipelines de inventario o catalogacion de activos 3D.
- Percepcion robotica: integrado en un pipeline de agarre, el modelo identifica la categoria del objeto antes de seleccionar una estrategia de manipulacion, aprovechando su robustez en escaneos reales con fondo (OBJ_BG).
- Digitalizacion de patrimonio y arquitectura: clasificacion automatica de elementos escaneados con LiDAR o fotogrametria para organizar bibliotecas de modelos 3D.
- Preprocesado para conduccion autonoma: etiquetado de objetos detectados por LiDAR como paso previo a la fusion con camaras, usando los embeddings de 2048 dimensiones como entrada a un clasificador posterior.
- Recuperacion de modelos 3D (retrieval): extraccion de embeddings con `forward_features` para construir indices vectoriales y buscar objetos similares en bases de datos de mallas o escaneos.
- Aprendizaje por transferencia: uso del backbone preentrenado como inicializacion para nuevas taxonomias de objetos, reemplazando la cabeza con `reset_classifier(num_classes=N)` y ajustando fino con pocos datos etiquetados.
- Control de calidad en fabricacion: deteccion y clasificacion de piezas escaneadas en linea para verificar que el objeto fabricado corresponde al esperado.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Dataset | Tarea | Metrica | Valor |
|---|---|---|---|
| ScanObjectNN (OBJ_BG) | Clasificacion de nubes de puntos | OA (accuracy) | 98,45 |
| ScanObjectNN (OBJ_BG) | Clasificacion de nubes de puntos | mAcc (accuracy) | 98,19 |

No se han publicado en la informacion disponible resultados de otros benchmarks (ModelNet40, ShapeNet, etc.) para este checkpoint concreto, ni comparaciones directas con otros modelos en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: con 360,4 M de parametros en precision completa (fp32) el modelo ocupa aproximadamente 1,4 GB solo en pesos; en fp16/bf16 baja a unos 0,7 GB. A ello hay que sumar activaciones y el tensor de entrada de la nube de puntos (8192 puntos x 3 coordenadas), por lo que un presupuesto de 2-4 GB de VRAM es realista para inferencia en fp32.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para inferencia en fp32. Una RTX 3060, RTX 4060 o superior es suficiente; para entrenamiento o ajuste fino se recomienda RTX 4090, A100 o H100.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna (GTX 1660 6 GB, RTX 3050 8 GB y superiores).
- Opciones de despliegue: la via documentada es la libreria `torch-pointcloud` sobre PyTorch (`pip install torch-pointcloud`), con carga mediante `tp.create_model(..., pretrained=True)`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a modelos de nubes de puntos.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Dataset de evaluacion | OA declarada | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| pointgpt-l.scanobjectnn-objbg (este modelo) | 360,4 M | 8192 puntos (ejemplo) | ScanObjectNN OBJ_BG | 98,45 | MIT | Hugging Face, libreria torch-pointcloud |
| PointGPT-L (checkpoint base) | no disponible | no disponible | no disponible | no disponible | MIT | Hugging Face |
| Otras variantes PointGPT en torch-pointcloud | no disponible | no disponible | no disponible | no disponible | MIT | Hugging Face |

No se dispone en la informacion proporcionada de datos de rendimiento de PointNet++, PointNeXt, Point-MAE u otros modelos comparables en ScanObjectNN OBJ_BG para establecer una comparativa cuantitativa fiable. Se recomienda consultar el paper de PointGPT para las tablas comparativas originales.

## Limitaciones y advertencias

- Dominio restringido: solo clasifica 15 clases de ScanObjectNN; no es un modelo de proposito general y requiere ajuste fino para cualquier otra taxonomia.
- Entrenado especificamente en la variante OBJ_BG (objetos con fondo); su rendimiento puede degradarse en nubes de puntos sinteticas, sin fondo o con distribuciones distintas (por ejemplo, LiDAR a larga distancia).
- Los resultados de benchmarks son declarados por el autor y no han sido verificados de forma independiente (`verified: false`).
- No es un modelo linguistico: no genera texto, no razona y no soporta instrucciones en lenguaje natural. Cualquier caso de uso conversacional o agentico queda fuera de su alcance.
- Riesgo de sobreajuste al benchmark: la cercania de OA y mAcc al 98 % sugiere un ajuste muy especifico al conjunto de evaluacion; conviene validar en datos propios antes de desplegar.
- Sesgos: no documentados en la model card, pero cabe esperar sesgos derivados de la composicion del dataset ScanObjectNN (objetos de interior, categorias cotidianas).
- Licencia MIT: permite uso comercial y modificacion siempre que se conserve el aviso de copyright; no obstante, el modelo base y el paper original deben citarse adecuadamente.
- Sin garantias de soporte: el repositorio tiene 14 descargas y 0 likes, lo que indica una adopcion muy baja y escasa validacion por parte de la comunidad.
- Idiomas: no aplica, pero tampoco hay soporte de metadatos semanticos ni etiquetas en castellano.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/torch-pointcloud/pointgpt-l.scanobjectnn-objbg.guangyan-chen
- Model card (README): https://huggingface.co/torch-pointcloud/pointgpt-l.scanobjectnn-objbg.guangyan-chen/blob/main/README.md
- Paper PointGPT (arXiv:2305.11487): https://arxiv.org/abs/2305.11487
- Repositorio original PointGPT: https://github.com/CGuangyan-BIT/PointGPT
- Libreria torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- Modelo base: https://huggingface.co/torch-pointcloud/pointgpt-l.labeled-hybrid.guangyan-chen
- Dataset ScanObjectNN (paper ICCV 2019): https://arxiv.org/abs/1908.03935
