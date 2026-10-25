# yangqinzhe/LEVIRDetNet-159

## Resumen

LEVIRDetNet-159 es un detector de objetos para teledeteccion entrenado sobre LEVIRDet-159, un conjunto de datos de escala millonaria con 159 categorias, aproximadamente 2,56 millones de cajas delimitadoras y unas 700.000 anotaciones finas organizadas en una taxonomia multinivel. Lo publica el usuario de Hugging Face `yangqinzhe` dentro del proyecto LEVIRDet (LEVIR Lab), y el repositorio contiene un unico checkpoint acompanado de su configuracion exacta, el orden de clases y los metadatos de verificacion.

El modelo combina un backbone DINOv3 ViT-S/16+ con la familia de detectores DEIMV2 (variante identificada como `DEIMV2GSDGuided`) y una cabeza jerarquica `HierarchicalDEIMV2Head` que explota la taxonomia de clases. No es un paquete de Transformers ni se puede cargar con `pipeline()`: se ejecuta con el codigo PyTorch/MMDetection del proyecto, distribuido junto a una imagen Docker con CUDA 12.1 y PyTorch 2.3.1 y al arbol de codigo correspondiente al commit `0e6e41b`.

Su interes practico esta en la generalizacion sin ajuste: segun el repositorio y la pagina del proyecto, LEVIRDetNet obtiene el mejor AP primario medio en 9 benchmarks externos sin entrenamiento ni fine-tuning en el dominio objetivo. El checkpoint ocupa 1.704.129.664 bytes y se selecciono por bbox mAP ponderado de COCO en la epoca 110.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Detector tipo DETR: backbone DINOv3 ViT-S/16+, marco DEIMV2 (variante `DEIMV2GSDGuided`) y cabeza `HierarchicalDEIMV2Head` |
| Parametros totales | no disponible (el checkpoint ocupa 1.704.129.664 bytes) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (deteccion de objetos por imagen); resolucion de entrada no disponible |
| Tipos de cuantizacion | no disponible (solo se distribuye checkpoint en `.pth`; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (tarea de vision; 159 clases definidas en `classes.json`) |
| Licencia | no disponible |
| Formato de pesos | PyTorch `.pth` (`best_coco_weighted_bbox_mAP_epoch_110_159class.pth`); no se ofrece safetensors ni GGUF |
| Numero de clases | 159 salidas, en el orden exacto de `classes.json` |
| Entorno de referencia | Linux x86_64, GPU NVIDIA, PyTorch 2.3.1, CUDA 12.1 |
| Revision de codigo | commit `0e6e41b97d4bd3ca5434154fb63ef1e8e8684afa` |

## Arquitectura y entrenamiento

La arquitectura es un detector denso de la familia DEIM/DEIMV2, es decir, un transformer de deteccion con asignacion de consultas y decodificacion en una sola etapa, adaptado aqui a imagenes de teledeteccion. El extractor de caracteristicas es un DINOv3 ViT-S/16+, un Vision Transformer de tamano pequeno con parches de 16 pixeles, y la cabeza se denomina `HierarchicalDEIMV2Head`, lo que indica que las 159 clases se predicen dentro de una taxonomia multinivel (el dataset organiza las anotaciones en varios niveles de granularidad). El nombre del modulo `DEIMV2GSDGuided` sugiere un condicionamiento por GSD (ground sample distance, resolucion espacial en metros por pixel), aunque la informacion disponible no detalla el mecanismo concreto.

El entrenamiento se realizo con el codigo MMDetection del proyecto y el checkpoint publicado corresponde a la epoca 110, seleccionado por bbox mAP ponderado de COCO (`best_coco_weighted_bbox_mAP_epoch_110_159class.pth`). No se especifican en la informacion disponible el numero de tokens o imagenes vistas, la composicion exacta del dataset, ni si hubo etapas de RLHF/DPO (no aplicables a una tarea de deteccion). El dataset LEVIRDet-159 ocupa unos 154 GB y se publica en dos variantes: imagenes originales y una version ligera en JPEG de calidad 95.

## Capacidades

- Deteccion de objetos con cajas delimitadoras en imagenes de teledeteccion, con 159 categorias de salida en un orden fijo definido por `classes.json`.
- Prediccion jerarquica: la cabeza permite clasificar instancias dentro de una taxonomia multinivel de granularidad gruesa a fina.
- Generalizacion cross-domain sin entrenamiento ni fine-tuning en el dominio objetivo, segun las afirmaciones del proyecto (mejor AP primario medio en 9 benchmarks externos).
- Inferencia por lotes sobre directorios de imagenes mediante `demo/image_demo.py`, con parametro `--batch-size` y directorio de salida (`--out-dir`).
- Integracion con el ecosistema MMDetection: configuracion declarativa, carga de pesos por ruta y ejecucion sobre GPU con `--gpus all` en Docker.
- No dispone de generacion de texto, tool calling, function calling, razonamiento multi-paso, agentes ni capacidades de audio o video en la informacion disponible.
- No es un modelo de vocabulario abierto: las 159 clases son cerradas y no se documenta deteccion zero-shot de categorias no incluidas.

## Casos de uso

- Actualizacion de cartografia y bases de datos geoespaciales: el modelo detecta instancias de 159 clases sobre ortoimagenes y permite refrescar capas de edificaciones, infraestructuras o usos del suelo sin reentrenar en cada nueva region, gracias a la generalizacion cross-domain descrita por el proyecto.
- Seguimiento de la expansion urbana y de obra nueva: pasando pares de imagenes de la misma zona en fechas distintas por el detector se pueden localizar nuevas construcciones y cuantificar el crecimiento, apoyandose en la taxonomia jerarquica para distinguir categorias gruesas y finas.
- Inventario de infraestructuras y activos: deteccion de elementos como puertos, aerogeneradores o tendidos electricos (siempre que esten cubiertos por las 159 clases de `classes.json`) para planificacion de mantenimiento sobre grandes extensiones de terreno.
- Respuesta a desastres y evaluacion de danos: el detector puede procesar lotes de imagenes post-evento con `--batch-size` en un contenedor Docker con GPU, lo que facilita el despliegue rapido en infraestructura de emergencia sin instalar dependencias manualmente.
- Pre-etiquetado para anotacion humana: generar cajas candidatas sobre imagenes nuevas y revisarlas por anotadores reduce el coste de construir datasets propios; la salida incluye el indice de clase en el orden del modelo, lo que simplifica la conversion a otros formatos.
- Analisis multi-temporal y deteccion de cambios: al ser un detector de una sola etapa con backbone ViT-S, el coste por imagen es lo bastante contenido para procesar series temporales largas sobre GPU de gama media, comparando recuentos por clase entre fechas.
- Monitorizacion medioambiental y forestal: recuento de instancias sobre mosaicos de satelite para seguimiento de cobertura vegetal o superficies artificiales, condicionado a que las clases relevantes existan en el vocabulario del modelo.
- Docencia e investigacion en deteccion remota: el paquete incluye configuracion, pesos y dataset de 154 GB, lo que permite reproducir el entrenamiento y usarlo como linea base en experimentos de transferencia de dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La documentacion del proyecto y del repositorio afirma de forma cualitativa que LEVIRDetNet alcanza el mejor AP primario medio en 9 benchmarks externos sin entrenamiento ni fine-tuning en el dominio objetivo, y que LEVIRDetNet-159 es el dataset de mayor escala en 18 dimensiones comparadas, pero no se proporcionan cifras numericas (mAP, AP50, AP75 ni desglose por clase) en los materiales consultados.

## Requisitos de hardware

- GPU NVIDIA obligatoria en el flujo documentado: el ejemplo oficial usa `docker run --gpus all` con CUDA 12.1 y PyTorch 2.3.1. No se documenta inferencia en CPU.
- VRAM: no hay cifra oficial. Como referencia, el checkpoint en disco ocupa 1,70 GB, por lo que los pesos en FP32 rondan esa magnitud; con activaciones de un ViT-S y la cabeza de deteccion a `--batch-size 1`, una estimacion no oficial situa el consumo en el rango de 4-8 GB, lo que lo haria viable en GPU de consumo de 8-12 GB. Esta estimacion no esta confirmada por el autor.
- GPU de datacenter (A100, H100, L40S): soportadas por construccion (CUDA 12.1), sin benchmarks publicados de throughput ni latencia.
- GPU de consumo (RTX 4090, RTX 3090, RTX 4070 Ti y similares): previsiblemente suficientes para inferencia a lote 1, sin validacion oficial.
- Opciones de despliegue: imagen Docker `levir-train:cuda121-torch231` (incluida en el repositorio principal `yangqinzhe/LEVIRDetNet`), script `demo/image_demo.py` de MMDetection y entorno Conda en Linux; tambien se documenta WSL 2 con integracion Docker. No hay soporte de vLLM, TGI, Ollama, llama.cpp ni TensorRT/ONNX en la informacion disponible, ya que no es un modelo de lenguaje.
- Requisitos de entorno: montar el arbol de proyecto completo en `/workspace/levirdetnet` (las configs no son una implementacion autonoma), `--shm-size=4g` y `PYTHONPATH` apuntando al proyecto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Clases | Backbone | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LEVIRDetNet-159 | 159 | DINOv3 ViT-S/16+ con cabeza `HierarchicalDEIMV2Head` | no disponible | no disponible | Hugging Face, checkpoint de 1,70 GB + Docker |
| LEVIRDetNet-30 | 30 | misma familia de detector, segun el autor; detalle no disponible | no disponible | no disponible | Hugging Face (`yangqinzhe/LEVIRDetNet-30`) |
| Otros detectores de teledeteccion open source | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion con detectores genericos de proposito general (por ejemplo, familias tipo YOLO o DETR entrenadas en COCO) no se puede establecer con datos: no hay resultados numericos publicados en la informacion disponible para LEVIRDetNet-159, y las vocabularios de clases no son equivalentes.

## Limitaciones y advertencias

- Licencia no especificada: no se puede asumir permiso de uso comercial, redistribucion ni creacion de derivados hasta que el autor la declare.
- No es un paquete de Transformers: no funciona con `pipeline()` ni con `AutoModel`; requiere el arbol de codigo completo del repositorio, las configs y la imagen Docker o un entorno Conda equivalente.
- El archivo Docker contiene un arbol de codigo de una revision anterior; hay que montar el proyecto extraido del ZIP de codigo fuente para que coincida con la revision documentada.
- El orden de las 159 clases es fijo y esta definido por `classes.json`; cualquier reordenacion o mapeo incorrecto invalida las predicciones. Si se descargan los dos detectores (159 y 30 clases), deben mantenerse en directorios separados para no mezclar metadatos.
- Vocabulario cerrado: no detecta categorias fuera de las 159 clases ni se documenta capacidad zero-shot.
- La informacion disponible solo menciona cajas delimitadoras (bbox mAP); no se documentan mascaras de segmentacion ni puntos clave.
- Dominio restringido a teledeteccion: el comportamiento sobre fotografia terrestre, imagenes nocturnas o resoluciones muy distintas a las del entrenamiento no esta documentado.
- No se publican metricas por clase, matrices de confusion ni analisis de desbalanceo, por lo que el rendimiento en clases raras o de taxonomia muy fina es desconocido; cabe esperar falsos positivos y falsos negativos en esas categorias.
- El condicionamiento por GSD implica que la resolucion espacial de la imagen de entrada puede afectar a las predicciones; no se documenta el rango valido.
- Verificacion obligatoria de integridad: el flujo oficial incluye `sha256sum -c SHA256SUMS` antes de la inferencia.
- Reentrenar exige descargar el dataset completo (unos 154 GB) y disponer de GPU NVIDIA, con consumo de VRAM y tiempo de entrenamiento no documentados.
- Riesgo de alucinacion en sentido estricto no aplica (no genera texto), pero si el equivalente en vision: detecciones espurias sobre texturas o patrones que se confundan con las clases aprendidas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yangqinzhe/LEVIRDetNet-159
- Repositorio principal (todos los recursos y Docker): https://huggingface.co/yangqinzhe/LEVIRDetNet
- Detector de 30 clases: https://huggingface.co/yangqinzhe/LEVIRDetNet-30
- Dataset LEVIRDet-159: https://huggingface.co/datasets/yangqinzhe/LEVIRDet-159-Dataset
- Codigo fuente: https://github.com/QinzheYang/LEVIRDet-release
- Revision exacta del codigo: https://github.com/QinzheYang/LEVIRDet-release/commit/0e6e41b97d4bd3ca5434154fb63ef1e8e8684afa
- Pagina del proyecto: https://qinzheyang.github.io/LEVIRDet/
- Paper en arXiv: https://arxiv.org/abs/2606.25312
- Paper en Hugging Face: https://huggingface.co/papers/2606.25312
