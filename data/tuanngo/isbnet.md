# TuanNgo/ISBNet

## Resumen

ISBNet es una red neuronal para segmentación de instancias en nubes de puntos 3D, presentada en CVPR 2023 por Tuan Duc Ngo, Binh-Son Hua y Khoi Nguyen. El checkpoint publicado en este repositorio corresponde a los pesos preentrenados del modelo oficial del repositorio de GitHub de VinAIResearch, distribuidos bajo licencia BSD-3-Clause. No es un modelo de lenguaje: es un modelo de visión 3D que procesa nubes de puntos para identificar y separar objetos individuales dentro de una escena.

El modelo aborda el problema de la segmentación de instancias 3D, es decir, asignar a cada punto de una nube una etiqueta semántica y, además, un identificador de instancia que agrupe los puntos pertenecientes al mismo objeto. ISBNet introduce dos innovaciones principales: un muestreo consciente de instancias (instance-aware sampling) que preserva la información de objetos pequeños durante el proceso de agregación de puntos, y una convolución dinámica consciente de cajas (box-aware dynamic convolution) que genera kernels adaptados a la región de cada instancia candidata.

El repositorio contiene los checkpoints completos para cinco configuraciones de evaluación sobre los conjuntos ScanNetV2, ScanNet200, S3DIS y STPLS3D, junto con los backbones 3D U-Net preentrenados que utilizan los ficheros de configuración. El tamaño total del repositorio es de 1,1 GB y no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de segmentacion de instancias 3D sobre nube de puntos, con backbone 3D U-Net, muestreo consciente de instancias y convolucion dinamica consciente de cajas |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision 3D, no aplica ventana de contexto textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de vision, sin capacidades linguisticas) |
| Licencia | BSD-3-Clause |
| Formato de pesos | `.pth` (checkpoints de PyTorch) |

## Arquitectura y entrenamiento

ISBNet es una red de segmentacion de instancias para nubes de puntos 3D. El pipeline parte de un backbone 3D U-Net que extrae caracteristicas jerarquicas de la nube de puntos; sobre esas caracteristicas opera un modulo de muestreo consciente de instancias que agrupa los puntos en propuestas de instancia preservando la representacion de objetos pequenos, y posteriormente una convolucion dinamica consciente de cajas que genera pesos especificos para cada propuesta en funcion de su region espacial. El resultado se refina hasta producir mascaras de instancia con su clase semantica asociada.

El repositorio distribuye los pesos ya entrenados para cada configuracion de dataset, ademas de los backbones 3D U-Net preentrenados que los ficheros de configuracion referencian en el campo `pretrain:`. No se dispone en la informacion proporcionada de datos sobre el numero de tokens o puntos de entrenamiento, la composicion exacta de los datasets ni si se emplearon tecnicas de refinamiento adicionales. El paper asociado es arXiv:2303.00246 y el codigo de entrenamiento y evaluacion esta en el repositorio de GitHub de VinAIResearch/ISBNet.

## Capacidades

- Segmentacion de instancias 3D en nubes de puntos: asigna clase semantica e identificador de instancia a cada punto de la escena.
- Deteccion y separacion de objetos individuales dentro de escenas interiores y exteriores, segun el checkpoint utilizado.
- Evaluacion sobre cuatro familias de datos: ScanNetV2, ScanNet200, S3DIS y STPLS3D.
- Variante ligera (lightweight) con menor coste computacional para ScanNetV2.
- Checkpoint adicional `head_3dyco_scannetv2_val.pth` incluido en el repositorio.
- No dispone de generacion de texto, razonamiento linguistico, codigo, matematicas, vision 2D, tool calling ni capacidades de agente.

## Casos de uso

- Digitalizacion de interiores y modelado BIM: el modelo segmenta objetos individuales (mobiliario, paredes, suelo) en nubes de puntos capturadas con escaneres o LiDAR, permitiendo generar inventarios de elementos por instancia en lugar de solo etiquetas semanticas por punto.
- Robotica de navegacion y manipulacion: un robot movil puede usar las mascaras de instancia para identificar obstaculos y objetos manipulables en su entorno, alimentando modulos de planificacion de movimiento con representaciones por objeto.
- Inventario y auditoria de espacios: sobre nubes de puntos de almacenes o tiendas, el modelo permite contar y localizar instancias de productos o estanterias, usando el checkpoint de ScanNet200 para vocabularios mas amplios de clases.
- Reconstruccion y edicion de escenas 3D: las mascaras por instancia facilitan tareas de edicion, eliminacion o reemplazo de objetos en flujos de trabajo de realidad aumentada y gemelos digitales.
- Analisis de escenas urbanas y exteriores: con el checkpoint STPLS3D, orientado a entornos sinteticos y aereos, se pueden segmentar elementos como edificios, vegetacion o vehiculos en nubes de puntos de exterior.
- Investigacion en vision 3D: el repositorio sirve como linea base reproducible para comparar nuevos metodos de segmentacion de instancias sobre ScanNetV2, S3DIS y STPLS3D, con configuraciones y pesos listos para evaluacion.
- Preetiquetado de datos: las predicciones del modelo pueden usarse para generar anotaciones iniciales de instancia que despues se revisan manualmente, reduciendo el coste de etiquetado de nuevas nubes de puntos.

## Benchmarks y rendimiento

Resultados publicados en la model card del autor para los checkpoints incluidos:

| Dataset | AP | AP_50 | Configuracion |
|---|---|---|---|
| ScanNetV2 val | 56.8 | 73.3 | `isbnet_scannetv2.yaml` |
| ScanNetV2 val (lightweight) | 50.1 | 68.9 | `isbnet_lightweight_scannetv2.yaml` |
| ScanNet200 val | 24.5 | 32.7 | `isbnet_scannet200.yaml` |
| S3DIS Area 5 | 56.3 | 67.5 | `isbnet_s3dis_area5.yaml` |
| STPLS3D val | 51.2 | 66.7 | `isbnet_stpls3d.yaml` |

No se han publicado en la informacion disponible resultados de benchmarks comparativos con otros modelos ni metricas adicionales (mIoU, latencia o throughput).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. El repositorio ocupa 1,1 GB, lo que da una referencia del orden de magnitud de los pesos, pero no se especifica el consumo en memoria durante la inferencia.
- GPU recomendadas: no disponible. El codigo se ejecuta con PyTorch mediante `tools/test.py`; se requiere una GPU compatible con CUDA para un rendimiento practico.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible; depende del tamano del backbone y de la nube de puntos de entrada.
- Opciones de despliegue: evaluacion mediante el repositorio oficial de GitHub (`tools/test.py` con los ficheros de configuracion YAML) y descarga de pesos con `hf download TuanNgo/ISBNet --local-dir pretrains`. No se indican integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de vision 3D.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos comparativos con otros modelos de segmentacion de instancias 3D (por ejemplo, SoftGroup, SSTNet o Mask3D). La model card solo incluye los resultados propios del modelo sobre los cuatro datasets evaluados. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en segmentacion de instancias de nubes de puntos 3D; no admite entradas de texto, imagen 2D ni audio.
- El rendimiento cae de forma notable en vocabularios amplios: ScanNet200 obtiene 24.5 AP frente a 56.8 AP en ScanNetV2, lo que refleja la dificultad con clases poco frecuentes.
- Los resultados estan ligados a la distribucion de los datasets de entrenamiento (escenas interiores de ScanNet y S3DIS, entornos de STPLS3D); el rendimiento en dominios distintos no esta documentado.
- No se dispone de informacion sobre sesgos, tasas de alucinacion o falsos positivos por clase en la documentacion proporcionada.
- La licencia BSD-3-Clause permite uso comercial con obligacion de conservar el aviso de copyright y la clausula de exencion de responsabilidad; conviene revisar las condiciones de los datasets subyacentes (ScanNet, S3DIS, STPLS3D) para uso comercial de los datos.
- El repositorio no registra descargas ni interacciones, por lo que no existe validacion comunitaria publica del estado de los checkpoints.
- No se documentan requisitos de memoria, latencia ni procesos de cuantizacion, lo que dificulta planificar un despliegue en produccion sin pruebas propias.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TuanNgo/ISBNet
- Paper (arXiv): https://arxiv.org/abs/2303.00246
- Codigo oficial: https://github.com/VinAIResearch/ISBNet
- Configuracion ScanNetV2: https://github.com/VinAIResearch/ISBNet/blob/master/configs/scannetv2/isbnet_scannetv2.yaml
- Configuracion ScanNetV2 lightweight: https://github.com/VinAIResearch/ISBNet/blob/master/configs/scannetv2/isbnet_lightweight_scannetv2.yaml
- Configuracion ScanNet200: https://github.com/VinAIResearch/ISBNet/blob/master/configs/scannet200/isbnet_scannet200.yaml
- Configuracion S3DIS Area 5: https://github.com/VinAIResearch/ISBNet/blob/master/configs/s3dis/isbnet_s3dis_area5.yaml
- Configuracion STPLS3D: https://github.com/VinAIResearch/ISBNet/blob/master/configs/stpls3d/isbnet_stpls3d.yaml
