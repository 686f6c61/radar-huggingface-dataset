# torch-pointcloud/kpfcnn-base-deform.s3dis-area5.hugues-thomas

## Resumen

kpfcnn-base-deform.s3dis-area5.hugues-thomas es un modelo de segmentacion semantica de nubes de puntos 3D publicado por el proyecto torch-pointcloud. Se trata de una conversion a la libreria torch-pointcloud del modelo KPConv con kernel deformable (KP-FCNN) del repositorio original de Hugues Thomas, entrenado sobre el protocolo S3DIS con el area 5 como conjunto de test. El modelo asigna una etiqueta semantica a cada punto de una escena interior, con 13 clases de salida y 5 canales de entrada.

Tecnicamente es una red totalmente convolucional (KP-FCNN) sobre convolucion de puntos con kernel deformable, descrita en el articulo "KPConv: Flexible and Deformable Convolution for Point Clouds" (ICCV 2019). Cuenta con 25.889.171 parametros, una dimension de caracteristicas de 128 y una cabeza de clasificacion de 13 clases. El repositorio ocupa 0,1 GB y los pesos se distribuyen en formato safetensors.

Su relevancia actual es doble: por un lado sigue siendo una referencia clasica de segmentacion semantica de interiores, con mIoU 67,05 y OA 89,93 declarados sobre S3DIS Area 5; por otro, su integracion en torch-pointcloud permite cargarlo con una sola llamada a `create_model`, lo que facilita usarlo como baseline reproducible y como extractor de caracteristicas de 128 dimensiones para tareas posteriores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | KP-FCNN con convolucion de kernel deformable (KPConv deformable), red totalmente convolucional tipo encoder-decoder para segmentacion de nubes de puntos |
| Parametros totales | 25.889.171 (25,8 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica en el sentido de LLM: la entrada es un conjunto de puntos sin orden. El ejemplo de la model card usa 8192 puntos por muestra; no se documenta un limite maximo de puntos |
| Tipos de cuantizacion | No disponible (no se documentan cuantizaciones GGUF, AWQ, GPTQ ni similares) |
| Idiomas soportados | No aplica / no disponible (modelo de vision 3D, no procesa texto) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Canales de entrada | 5 (la model card no detalla su composicion; el ejemplo de uso emplea posicion y color) |
| Clases de salida | 13 |
| Dimension de caracteristicas | 128 |
| Dataset de entrenamiento/evaluacion | S3DIS, Area 5 como test |
| Libreria | torch-pointcloud |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

El modelo es un KP-FCNN, la variante totalmente convolucional de KPConv para segmentacion semantica. KPConv define la convolucion directamente sobre nubes de puntos mediante un conjunto de puntos kernel con pesos asociados; en la variante deformable, las posiciones de esos puntos kernel se despliegan mediante un campo de offset aprendido, lo que permite adaptar el soporte de la convolucion a la geometria local. Esta variante deformable es la que da nombre al checkpoint ("base-deform"). La red opera sobre vecindarios definidos por radio tras un submuestreo en rejilla, y la cabeza de clasificacion produce un logit por punto para las 13 clases.

No se dispone de informacion sobre el numero de tokens o puntos vistos en entrenamiento, la composicion exacta del dataset mas alla de S3DIS, ni sobre el uso de tecnicas de ajuste como RLHF o DPO (no aplicables en este dominio). La model card indica que el modelo procede de la conversion del repositorio HuguesTHOMAS/KPConv-PyTorch, con licencia MIT, y cita como referencia un valor de mIoU de 67,3, frente al 67,05 declarado para este checkpoint. El modelo expone ademas un metodo `forward_features` que devuelve embeddings de 128 dimensiones por punto, util para extraccion de caracteristicas.

## Capacidades

- Segmentacion semantica de nubes de puntos 3D: asigna una etiqueta de entre 13 clases a cada punto de una escena, en el dominio de interiores de S3DIS.
- Procesamiento de nubes con informacion geometrica y de apariencia: 5 canales de entrada por punto (posicion y canales adicionales no detallados en la model card).
- Extraccion de caracteristicas: `forward_features` devuelve un tensor de forma (N, 128) con un descriptor por punto.
- Clasificacion con cabeza configurable: `reset_classifier(num_classes=0)` permite reutilizar el backbone como extractor puro.
- Inferencia por lotes: la API acepta posiciones, caracteristicas y un vector de batch, por lo que admite varias nubes en una misma pasada.
- No soporta generacion de texto, razonamiento, codigo, matematicas ni vision 2D.
- No dispone de tool calling, function calling ni capacidades de agente.
- No dispone de modo "thinking", audio ni procesamiento de lenguaje natural.
- Modelo unicamente de idioma: no aplica; no procesa texto en ningun idioma.

## Casos de uso

- Segmentacion semantica de escaneos de interiores para gemelos digitales y modelos BIM: el modelo etiqueta cada punto de una nube capturada con escaner terrestre o LiDAR, lo que permite separar elementos como suelo, paredes o mobiliario y alimentar un modelo de informacion del edificio con geometria clasificada.
- Autoetiquetado y preanotacion de datasets: al producir etiquetas densas por punto, se puede usar como primer paso de un pipeline de anotacion humana, reduciendo el coste de etiquetar nubes nuevas antes de una revision manual.
- Navegacion y percepcion de robots en interiores: la segmentacion punto a punto permite identificar plano de suelo y obstaculos, informacion que un stack de planificacion puede consumir para generar mapas de transitabilidad.
- Inspeccion y auditoria de espacios construidos: comparar la nube segmentada con el modelo teorico permite localizar elementos no previstos o ausentes y cuantificar superficies por clase de elemento.
- Extraccion de embeddings para busqueda y agrupamiento: los descriptores de 128 dimensiones por punto permiten entrenar cabezas ligeras para clasificacion de escenas, recuperacion de fragmentos similares o clustering no supervisado sin reentrenar el backbone.
- Investigacion en aprendizaje profundo para vision 3D: sirve como baseline reproducible de KPConv deformable sobre S3DIS Area 5, con una API de carga en una linea, para comparar variantes de kernel, muestreo o aumentos de datos.
- Digitalizacion de patrimonio y levantamientos arquitectonicos: la segmentacion por clases facilita separar elementos estructurales de elementos anadidos y documentar el estado de un espacio a partir de su nube de puntos.
- Generacion de datos sinteticos etiquetados: usar el modelo como etiquetador automatico de nubes simuladas para preentrenar otros modelos antes de disponer de anotaciones reales.
- Aplicaciones moviles o embebidas de escaneo: con 25,8 M de parametros, el modelo es lo bastante pequeno para desplegarse en GPU de consumo o CPU, lo que abre la puerta a prototipos de captura y clasificacion en campo, siempre que se valide el coste de memoria de las activaciones.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente).

| Dataset | Tarea | Metrica | Valor | Verificado |
|---|---|---|---|---|
| S3DIS (Area 5) | Segmentacion semantica de nube de puntos | mIoU | 67,05 | No |
| S3DIS (Area 5) | Segmentacion semantica de nube de puntos | OA (accuracy) | 89,93 | No |

La model card indica ademas un valor de referencia de mIoU 67,3 para el modelo original del que se ha convertido este checkpoint, ligeramente superior al 67,05 declarado aqui. No se han publicado en la informacion disponible resultados de latencia, throughput ni comparaciones con otros modelos sobre el mismo protocolo.

## Requisitos de hardware

- Pesos en FP32: aproximadamente 104 MB (25,889 M de parametros x 4 bytes). En FP16 o BF16: aproximadamente 52 MB. El repositorio completo ocupa 0,1 GB.
- La VRAM necesaria no viene determinada por los pesos, sino por la memoria de activaciones, que escala con el numero de puntos de entrada y con el radio y el submuestreo del vecindario de KPConv. No se dispone de cifras oficiales de VRAM para escenas completas.
- Cabe holgadamente en GPU de consumo: cualquier tarjeta con unos pocos GB libres (RTX 3060, RTX 4070, RTX 4090) puede alojar los pesos; la limitacion practica sera el tamano de la escena y el batch.
- Ejecucion en CPU viable para prototipos y escenas pequenas, con latencias mayores no cuantificadas en la informacion disponible.
- GPU de datacenter (A100, H100, L40S) recomendadas para procesar escenas completas o lotes grandes, o para reentrenamiento sobre S3DIS.
- Despliegue: la via documentada es PyTorch con la libreria torch-pointcloud (`pip install torch-pointcloud`) y carga mediante `tp.create_model`. No hay soporte documentado para vLLM, llama.cpp, Ollama, TGI, ONNX, TensorRT ni TorchScript.
- No se dispone de datos de latencia ni de throughput (puntos por segundo) en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea / dataset | mIoU S3DIS Area 5 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kpfcnn-base-deform.s3dis-area5.hugues-thomas | 25,8 M | Segmentacion semantica, S3DIS Area 5 | 67,05 (declarado, no verificado); referencia 67,3 | MIT | HuggingFace, via torch-pointcloud |
| KPConv original (HuguesTHOMAS/KPConv-PyTorch) | No disponible | Segmentacion semantica, S3DIS | No disponible (la model card cita 67,3 como referencia) | MIT | GitHub |
| Otras alternativas de la categoria (PointNet++, RandLA-Net, Point Transformer) | No disponible | Segmentacion semantica de nubes de puntos | No disponible en la informacion proporcionada | No disponible | No disponible |

No se dispone de datos suficientes en la informacion proporcionada para comparar parametros, contexto o rendimiento con alternativas concretas; la unica comparacion sustentada es con la implementacion original de KPConv, de la que este checkpoint es una conversion.

## Limitaciones y advertencias

- Dominio restringido: el modelo se ha entrenado y evaluado sobre S3DIS, un dataset de interiores de oficinas y espacios academicos. El rendimiento fuera de ese dominio (exteriores, industria, conduccion autonoma, escenas densas al aire libre) no esta documentado y probablemente degrade.
- 13 clases fijas: la cabeza de clasificacion esta atada al esquema de etiquetas de S3DIS. Usar otro conjunto de clases requiere reentrenar la cabeza o el modelo.
- Benchmarks no verificados: los valores de mIoU 67,05 y OA 89,93 estan marcados como no verificados y provienen del propio autor. El valor declarado queda ademas por debajo de la referencia de 67,3 citada en la propia model card.
- Riesgo de error en zonas ambiguas: como cualquier segmentador denso, puede confundir clases geometricamente similares y producir etiquetas ruidosas en bordes, oclusiones y superficies mal muestreadas. No se documentan estudios de calibracion ni de incertidumbre.
- Sesgos de datos: al derivar de S3DIS, hereda los sesgos de composicion de ese dataset (tipologia de edificios, mobiliario y condiciones de captura concretas).
- Sin soporte idiomatico ni de texto: no es un modelo de lenguaje y no debe evaluarse ni desplegarse como tal.
- Licencia MIT: permite uso comercial y modificacion, pero la model card no detalla la licencia de la libreria torch-pointcloud ni de posibles dependencias; conviene revisarlas antes de un despliegue en produccion.
- Ausencia de cuantizaciones y de formatos alternativos: no hay pesos GGUF, ONNX ni artefactos optimizados publicados, lo que limita el despliegue en entornos sin PyTorch.
- Coste de memoria dependiente de la escena: la memoria de activaciones y el tiempo de inferencia crecen con el numero de puntos y con el submuestreo aplicado; no hay cifras publicadas para planificar capacidad.
- Adopcion nula registrada: el repositorio figura con 0 descargas y 0 likes, por lo que no existe validacion comunitaria del checkpoint.
- Fechas de publicacion y actualizacion poco habituales en los metadatos (2026), lo que sugiere que conviene comprobar la version y el hash de los pesos antes de fijar una dependencia en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/torch-pointcloud/kpfcnn-base-deform.s3dis-area5.hugues-thomas
- Articulo KPConv (ICCV 2019): https://arxiv.org/abs/1904.08889
- Repositorio original KPConv-PyTorch (Hugues Thomas): https://github.com/HuguesTHOMAS/KPConv-PyTorch
- Libreria torch-pointcloud (Arthur Dujardin): https://github.com/arthurdjn/pytorch-pointcloud
- DOI de la libreria PyTorch PointCloud: https://doi.org/10.5281/zenodo.22159632
- Articulo S3DIS (Armeni et al., CVPR 2016): enlace no disponible en la informacion proporcionada
- Demo o espacio interactivo: no disponible
