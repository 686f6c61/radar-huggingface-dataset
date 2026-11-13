# yojun313/yolo11x-car-plate-detection

## Resumen
yolo11x-car-plate-detection es un checkpoint de deteccion de objetos basado en la arquitectura YOLO11x de Ultralytics, afinado por el usuario yojun313 a partir del modelo morsetechlab/yolov11-license-plate-detection. El repositorio empaqueta dos artefactos: un detector de matricula (yolo11x_plate-detect.pt) derivado del modelo de morsetechlab, y un detector de vehiculos (yolo26x_car-detect.pt) inicializado desde Ultralytics YOLO26x. El objetivo es la deteccion de matriculas y vehiculos en imagenes de trafico y conduccion, un problema clasico de vision por computador con aplicaciones en videovigilancia, peaje automatico y analitica de flotas.

El modelo no introduce una arquitectura nueva: la contribucion es el reajuste fino (fine-tuning) sobre pesos preentrenados, con aumentacion de datos orientada a degradaciones reales (desenfoque, ruido, compresion, cambios de iluminacion y escalado). El checkpoint de matriculas se entreno con hasta 120 epocas a resolucion 1024, batch 16 y AdamW con learning rate 0.0001. El repositorio tiene un tamano de 0.2 GB y se distribuye en formato de pesos PyTorch (.pt) cargable con la libreria ultralytics.

Es relevante como ejemplo de pipeline de reajuste fino reproducible para deteccion de matriculas, aunque conviene tratar sus metricas con cautela: el propio autor advierte que los resultados registrados no constituyen un benchmark independiente verificado y que la licencia del repositorio aun no esta definida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO11x (detector de objetos de una etapa, familia Ultralytics); incluye tambien un checkpoint YOLO26x para vehiculos |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos .pt en precision original; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | en (etiqueta de idioma del repositorio; el modelo procesa imagenes, no texto) |
| Licencia | no disponible a nivel de repositorio; el modelo base declara AGPL-3.0 y Ultralytics 8.4.75 distribuye AGPL-3.0; los exports de Roboflow declaran CC BY 4.0 |
| Formato de pesos | PyTorch (.pt), cargable con ultralytics |

## Arquitectura y entrenamiento
La arquitectura subyacente es YOLO11x, un detector de objetos de una etapa con backbone convolucional y cabecera de prediccion densa, optimizado para deteccion en tiempo real. El checkpoint de matriculas parte de morsetechlab/yolov11-license-plate-detection y se reajusta con un esquema de hasta 120 epocas, tamaño de imagen 1024, batch 16, optimizador AdamW y learning rate 0.0001. La aumentacion incluye degradaciones de escala (downscale/upscale), desenfoque, ruido, compresion y variaciones de iluminacion, orientadas a robustez en capturas reales de camaras de trafico.

El segundo artefacto, yolo26x_car-detect.pt, se inicializa desde Ultralytics YOLO26x y se reajusta con imagenes de conduccion de AIHub bajo un criterio orientado a recall. Los datos de matriculas proceden de colecciones de Roboflow Universe fusionadas; los de vehiculos, del dataset AIHub 195. No se documenta el numero exacto de tokens ni la composicion detallada de los datasets, ni se indica uso de RLHF/DPO (no aplica a deteccion). El autor senala que no se repitieron experimentos para esta release y que parte de las atribuciones y revisiones de checkpoints base siguen sin resolver.

## Capacidades
- Deteccion de matriculas de vehiculos en imagenes estaticas y, por extension, en fotogramas de video.
- Deteccion de vehiculos en escenas de conduccion (checkpoint YOLO26x).
- Salida de cajas delimitadoras con coordenadas (xyxy) y puntuaciones de confianza por deteccion.
- Inferencia configurable por umbral de confianza e tamaño de imagen (ejemplo documentado: imgsz=1008, conf=0.1).
- Robustez declarada frente a desenfoque, ruido, compresion JPEG y cambios de iluminacion gracias a la aumentacion de entrenamiento.
- Integracion con el ecosistema Ultralytics (carga via YOLO, prediccion, exportacion a otros formatos soportados por la libreria).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multimodales de texto; es exclusivamente vision.

## Casos de uso
- Peaje y control de acceso automatico: el detector de matriculas localiza la placa en la imagen para alimentar un OCR posterior; su entrenamiento con degradaciones lo hace adecuado a camaras de carretera con iluminacion variable.
- Analitica de trafico urbano: el checkpoint de vehiculos permite contar y localizar coches en fotogramas de video, con un ajuste orientado a recall para minimizar vehiculos no detectados.
- Videovigilancia y seguridad: deteccion de matriculas en imagenes de camaras fijas para registro de accesos, combinada con un pipeline de reconocimiento de caracteres.
- Gestion de flotas y aparcamientos: localizacion de matriculas y vehiculos en capturas de entrada/salida para inventario y facturacion automatizada.
- Preprocesado para OCR: recorte de la region de la matricula a partir de las cajas detectadas, reduciendo el area de busqueda del motor OCR y mejorando su precision.
- Investigacion y prototipado en vision: punto de partida reproducible para experimentar con reajuste fino de YOLO en dominios de trafico, con recetas de aumentacion documentadas.
- Auditoria de datasets de trafico: uso del detector para etiquetar o filtrar imagenes de conduccion antes de anotacion manual.

## Benchmarks y rendimiento
Resultados registrados por el autor a umbral fijo, IoU >= 0.5 (no son mAP ni un benchmark independiente verificado):

| Modelo / evaluacion | Imagenes | Precision | Recall | F1 |
|---|---:|---:|---:|---:|
| Baseline de matricula preentrenado / Roboflow fusionado | 13.053 | 0,9114 | 0,9531 | 0,9318 |
| Plate v7 / Roboflow fusionado | 13.053 | 0,9725 | 0,9900 | 0,9812 |
| Vehicle v1 / dataset AIHub 195 | 736.761 | 0,4444 | 0,9731 | 0,6101 |

El autor advierte que el modelo base de matriculas reporta contaminacion en sus datos de entrenamiento/test y que el solapamiento con los datos fusionados de este proyecto no ha sido auditado; por tanto, estas cifras no deben presentarse como rendimiento verificado en held-out independiente. El checkpoint de vehiculos muestra precision baja (0,4444) con recall alto, coherente con un ajuste orientado a recall.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible en la informacion proporcionada; al tratarse de YOLO11x (variante grande de la familia) se espera un consumo moderado, pero no hay cifras documentadas.
- GPU recomendadas: no disponible; el autor indica que puede requerirse una instalacion de PyTorch especifica por hardware para uso de GPU.
- Compatibilidad con GPU de consumo: no confirmada en la documentacion; no se aportan datos.
- Opciones de despliegue: libreria ultralytics (Python) con carga via YOLO y hf_hub_download; exportacion a otros formatos segun lo que soporte Ultralytics (no detallado en el repositorio).
- Latencia y throughput: no disponible.
- El repositorio no ofrece servicio de inferencia alojado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yolo11x-car-plate-detection | no disponible | no aplica | P 0,9725 / R 0,9900 / F1 0,9812 (matriculas, no verificado) | no disponible (base AGPL-3.0) | Hugging Face, pesos .pt |
| morsetechlab/yolov11-license-plate-detection | no disponible | no aplica | no disponible | AGPL-3.0 (declarada) | Hugging Face |
| Ultralytics YOLO11x (base) | no disponible | no aplica | no disponible | AGPL-3.0 | Ultralytics / Hugging Face |
| Ultralytics YOLO26x (base) | no disponible | no aplica | no disponible | AGPL-3.0 | Ultralytics |

No se dispone de cifras de parametros ni benchmarks comparables en la informacion proporcionada; la comparativa se limita a procedencia, licencia y disponibilidad.

## Limitaciones y advertencias
- Licencia del repositorio no seleccionada: el autor indica que no se ha elegido una licencia para las contribuciones del proyecto; antes de uso comercial hay que resolver este punto. Los materiales upstream (morsetechlab, Ultralytics) son AGPL-3.0 y los exports de Roboflow CC BY 4.0, sin que ello constituya una licencia global del repositorio.
- Metricas no verificadas: los resultados registrados no son mAP ni provienen de un held-out independiente auditado; el modelo base reporta contaminacion en sus datos de entrenamiento/test.
- Precision baja en el detector de vehiculos (0,4444), con muchas detecciones falsas positivas probables; el ajuste prioriza recall.
- Atribuciones incompletas: creditos de creadores de datasets, versiones exactas y revisiones de checkpoints base siguen parcialmente sin resolver.
- Ejemplos de inferencia no validados en la release; no se garantiza que funcionen tal cual.
- Modelo exclusivamente de vision, orientado a matriculas y vehiculos; no es un modelo de lenguaje ni soporta tareas de texto.
- Sesgos: no documentados en la informacion disponible; al entrenar con datos de trafico de determinadas regiones, puede generalizar mal a formatos de matricula, paises o condiciones de camara no representados.
- Riesgo de alucinacion: no aplica en sentido estricto, pero existe riesgo de detecciones falsas positivas, especialmente en el checkpoint de vehiculos.

## Enlaces
- Hugging Face: https://huggingface.co/yojun313/yolo11x-car-plate-detection
- Modelo base: https://huggingface.co/morsetechlab/yolov11-license-plate-detection
- Documentacion Ultralytics YOLO26: https://docs.ultralytics.com/models/yolo26
- Ultralytics (libreria): https://docs.ultralytics.com
- Roboflow Universe: https://universe.roboflow.com
- AIHub: https://aihub.or.kr
- Repositorio referenciado en la model card: SOURCES.md, report.md, experiments/training_configs.json, source/README.md, models/SHA256SUMS, UPLOAD.md (rutas internas del repositorio, sin URL publica disponible)
