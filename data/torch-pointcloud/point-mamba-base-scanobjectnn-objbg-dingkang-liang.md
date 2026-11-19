# torch-pointcloud/point-mamba-base.scanobjectnn-objbg.dingkang-liang

## Resumen

Point-Mamba es un modelo de clasificación de nubes de puntos 3D que aplica un modelo de espacio de estados (SSM) sobre secuencias de puntos serializados. Este checkpoint concreto, publicado por el colectivo `torch-pointcloud` y derivado del trabajo original de Dingkang Liang y colaboradores (NeurIPS 2024), está ajustado finamente sobre el subconjunto OBJ_BG del dataset ScanObjectNN para clasificar objetos 3D del mundo real en 15 categorías.

El modelo es relevante porque demuestra que los SSM tipo Mamba, diseñados originalmente para secuencias de lenguaje, compiten con las arquitecturas basadas en atención y con los métodos jerárquicos específicos de nubes de puntos, con una complejidad lineal respecto al número de puntos en lugar de cuadrática. Con solo 12,3 millones de parámetros y 384 dimensiones de característica, alcanza un 94,15 % de precisión global (OA) y un 92,42 % de precisión media por clase (mAcc) en OBJ_BG, cifras competitivas para un modelo de este tamaño.

La ficha corresponde a un checkpoint de inferencia listo para usar a través de la librería `torch-pointcloud`, que empaqueta la conversión de pesos, las transformaciones de datos y la integración con PyTorch. No es un modelo generativo de texto: no procesa lenguaje natural ni tiene ventana de contexto lingüística, por lo que las filas de la tabla de especificaciones relativas a idiomas o contexto de tokens se marcan como no disponibles o no aplicables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PointMamba: modelo de espacio de estados (SSM) sobre puntos serializados, con backbone tipo Mamba |
| Parametros totales | 12.293.647 (12,3 M) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no aplicable; entrada de 8192 puntos por muestra en el ejemplo de uso |
| Tipos de cuantizacion | no disponible (pesos en safetensors, presumiblemente fp32/fp16; no se documentan variantes GGUF o INT8) |
| Idiomas soportados | no aplicable (modelo de vision 3D, no procesa lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tarea | Clasificacion de nubes de puntos (15 clases) |
| Dimension de caracteristicas | 384 |
| Dataset de ajuste | ScanObjectNN (OBJ_BG) |
| Modelo base | torch-pointcloud/point-mamba-base.pretrain.dingkang-liang |
| Libreria | torch-pointcloud (requiere mamba-ssm compilado para la version de torch y CUDA) |
| Descargas en Hugging Face | 2633 |

## Arquitectura y entrenamiento

PointMamba adapta el bloque Mamba (SSM selectivo con convolucion causal y proyecciones de estado) al dominio de nubes de puntos. El pipeline serializa los puntos desordenados en una secuencia mediante un criterio de ordenacion geometrica, aplica un embedding por punto y procesa la secuencia con capas Mamba, lo que reduce el coste computacional de O(N²) de la atencion a O(N) respecto al numero de puntos. El modelo produce una representacion global de 384 dimensiones que alimenta una cabeza de clasificacion de 15 clases.

El checkpoint aqui descrito parte de un preentrenamiento (`point-mamba-base.pretrain`) y se ajusta finamente de forma supervisada sobre ScanObjectNN en la variante OBJ_BG, que incluye objetos escaneados con fondo y ruido de sensor, la configuracion mas realista del benchmark. La model card no documenta el numero de tokens de entrenamiento, la composicion exacta del dataset mas alla de ScanObjectNN ni si se aplicaron tecnicas de aumento de datos especificas; esos detalles deben consultarse en el paper original (arXiv:2402.10739). No se declara uso de RLHF ni DPO, algo esperable en un modelo discriminativo de vision 3D.

La innovacion principal es el uso de un SSM lineal para modelar dependencias de largo alcance entre puntos, evitando el cuello de botella de memoria de los transformers de nubes de puntos. Los pesos se han convertido desde el repositorio oficial `LMD0311/PointMamba` (Apache 2.0) al formato de `torch-pointcloud`, que añade transformaciones de datos y utilidades de carga.

## Capacidades

- Clasificacion de nubes de puntos 3D en 15 categorias de objetos del mundo real (ScanObjectNN).
- Extraccion de caracteristicas globales de 384 dimensiones mediante `forward_features` o `reset_classifier(num_classes=0)`.
- Procesamiento de muestras con 8192 puntos, con soporte de batching mediante el campo `batch` del collate.
- Inferencia en GPU con kernels de `mamba-ssm` (el autor indica que los kernels son GPU-only).
- Ajuste fino posterior: la cabeza de clasificacion puede reemplazarse para otras taxonomias.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto.
- No dispone de modo thinking, vision 2D, audio ni capacidades multilingues.

## Casos de uso

- Clasificacion de objetos en escaneos LiDAR o fotogrametria: el modelo recibe nubes de puntos de 8192 puntos y devuelve una de 15 clases, adecuado para inventariado de activos en escenas escaneadas con ruido y fondo (de ahi el ajuste en OBJ_BG).
- Preprocesado en pipelines de robotica movil: clasificar el objeto manipulado antes de planificar la aprehension, usando la representacion de 384 dimensiones como entrada a un planificador posterior.
- Etiquetado automatico de datasets 3D: generar preetiquetas de clase sobre grandes colecciones de escaneos para reducir el coste de anotacion manual, con revision humana de los casos de baja confianza.
- Recuperacion de modelos 3D por similitud: usar los embeddings de 384 dimensiones como firma para busqueda de vecinos cercanos en un catalogo de objetos escaneados.
- Control de calidad en fabricacion aditiva o inspeccion: clasificar piezas escaneadas en categorias conocidas para detectar desviaciones o piezas fuera de catalogo.
- Baseline academico reproducible: punto de partida para experimentos de investigacion en clasificacion de nubes de puntos, con pesos publicos, licencia permisiva y comparacion directa contra PointNet++, DGCNN o Point Transformer.
- Destilacion o extraccion de caracteristicas para modelos mayores: al ser un modelo de 12,3 M de parametros, puede actuar como extractor ligero en el borde o en GPUs de gama media.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente, `verified: false`):

| Benchmark | Metrica | Valor |
|---|---|---|
| ScanObjectNN (OBJ_BG) | OA (accuracy) | 94,15 |
| ScanObjectNN (OBJ_BG) | mAcc (accuracy) | 92,42 |

No se han publicado en la informacion disponible resultados de otros benchmarks (ModelNet40, ShapeNetPart, ScanObjectNN en variantes PB_T50_RS u OBJ_ONLY) para este checkpoint concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja por el tamano del modelo (12,3 M de parametros, del orden de decenas de MB en fp32); el consumo dominante proviene de las activaciones de la secuencia de 8192 puntos y de los kernels de `mamba-ssm`.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA compatible con la compilacion de `mamba-ssm`; A100 o H100 para lotes grandes y alto throughput, RTX 3090/4090 para desarrollo y produccion ligera.
- Cabe en GPU de consumo: si, previsiblemente en cualquier GPU NVIDIA con al menos unos pocos GB de VRAM; el autor no publica una cifra exacta.
- Despliegue: la via documentada es la libreria `torch-pointcloud` con `mamba-ssm` compilado. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Dataset | OA (OBJ_BG) | Licencia |
|---|---|---|---|---|---|
| Point-Mamba base (este checkpoint) | 12,3 M | 8192 puntos | ScanObjectNN OBJ_BG | 94,15 | Apache 2.0 |
| PointNet++ | no disponible en la informacion | nube de puntos | ScanObjectNN OBJ_BG | no disponible en la informacion | no disponible |
| DGCNN | no disponible en la informacion | nube de puntos | ScanObjectNN OBJ_BG | no disponible en la informacion | no disponible |
| Point Transformer | no disponible en la informacion | nube de puntos | ScanObjectNN OBJ_BG | no disponible en la informacion | no disponible |

No se dispone en la informacion proporcionada de cifras verificadas de los modelos alternativos sobre OBJ_BG, por lo que la comparacion cuantitativa queda marcada como no disponible. Cualitativamente, Point-Mamba se distingue por su complejidad lineal en el numero de puntos y por un recuento de parametros muy contenido frente a los transformers de nubes de puntos.

## Limitaciones y advertencias

- Modelo especializado: solo clasifica 15 clases de ScanObjectNN; no generaliza a taxonomias arbitrarias sin reentrenar la cabeza de clasificacion.
- Los resultados de benchmarks estan declarados por el autor y no han sido verificados de forma independiente (`verified: false`).
- Dependencia fragil de `mamba-ssm`: requiere una compilacion que coincida exactamente con la version de PyTorch y CUDA, lo que complica el despliegue reproducible en produccion.
- Kernels GPU-only segun la model card: la inferencia en CPU no esta soportada por la via documentada.
- Riesgo de sesgo hacia las clases y condiciones de captura de ScanObjectNN (objetos de interior, sensores y entornos concretos); el rendimiento puede degradarse en dominios distintos (exteriores, LiDAR vehicular, escaneos industriales).
- No hay informacion sobre robustez frente a oclusiones severas, densidades de puntos muy distintas de 8192 o ruido fuera de distribucion.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del dataset ScanObjectNN y del codigo original `LMD0311/PointMamba` para el uso de los pesos derivados.
- No apto para tareas de lenguaje, dialogo ni agentes: cualquier caso de uso de ese tipo queda fuera de su alcance.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/torch-pointcloud/point-mamba-base.scanobjectnn-objbg.dingkang-liang
- Modelo base de preentrenamiento: https://huggingface.co/torch-pointcloud/point-mamba-base.pretrain.dingkang-liang
- Paper PointMamba (arXiv:2402.10739): https://arxiv.org/abs/2402.10739
- Repositorio original PointMamba: https://github.com/LMD0311/PointMamba
- Libreria torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- Documentacion y guia de instalacion: https://pytorch-pointcloud.org/latest/installation/
- Dataset ScanObjectNN (paper ICCV 2019): https://arxiv.org/abs/1908.00463
