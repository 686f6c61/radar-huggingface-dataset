# Ultralytics/YOLO26

## Resumen

YOLO26 es la última generación de modelos de visión por computadora desarrollada por Ultralytics, publicada en enero de 2026. Se trata de una familia de modelos unificados y en tiempo real que cubren detección de objetos, segmentación de instancias, segmentación semántica, clasificación de imágenes, estimación de pose, detección de objetos con orientación (OBB) y seguimiento de objetos. El modelo está diseñado para ofrecer inferencia end-to-end nativa, lo que elimina pasos post-procesamiento redundantes y mejora la latencia en despliegues reales.

La relevancia actual de YOLO26 radica en su enfoque en dispositivos edge y de bajo consumo: según los datos oficiales de Ultralytics, los modelos de esta familia alcanzan hasta un 43 % de mejora en velocidad de inferencia en CPU respecto a versiones anteriores, manteniendo o mejorando la precisión. Esto lo convierte en una opción atractiva para aplicaciones embebidas, robótica, vigilancia y sistemas en tiempo real. El repositorio de HuggingFace reporta 9447 descargas y 132 likes, y la licencia es AGPL-3.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal convolucional (CNN) basada en la serie YOLO, con inferencia end-to-end nativa |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible (se mencionan exportaciones a TensorRT, ONNX, CoreML y TFLite) |
| Idiomas soportados | no aplica (modelo de vision; la documentacion esta disponible en en, zh, ja, ru, de, fr, es, pt, tr, vi, ar) |
| Licencia | AGPL-3.0 |
| Formato de pesos | no disponible (el repositorio usa la libreria ultralytics; probablemente safetensors o PyTorch, no confirmado) |

## Arquitectura y entrenamiento

La arquitectura exacta de YOLO26 no se detalla en la informacion disponible, pero se enmarca dentro de la evolucion de la serie YOLO de Ultralytics, que tradicionalmente combina una columna vertebral (backbone) basada en CNN con cuellos de botella y cabezas de deteccion multi-escala. La caracteristica destacada es la inferencia end-to-end nativa, que simplifica el pipeline al eliminar la necesidad de supresion de no-maximos (NMS) como paso post-procesamiento, reduciendo asi la latencia y la complejidad de despliegue.

No se han publicado datos especificos sobre el conjunto de entrenamiento, el numero de epocas, el tamano del dataset ni el uso de tecnicas como RLHF o DPO (que no son tipicas en modelos de vision). La documentacion oficial menciona que los modelos son "mas pequenos, mas rapidos y mas precisos que versiones anteriores", lo que sugiere mejoras en la eficiencia arquitectonica y posiblemente en la estrategia de entrenamiento, pero no se ofrecen detalles cuantitativos al respecto.

## Capacidades

- Deteccion de objetos en tiempo real, con soporte para multiples clases y bounding boxes.
- Segmentacion de instancias, que permite delimitar cada objeto a nivel de pixel.
- Segmentacion semantica, para clasificar cada pixel de la imagen en una categoria.
- Clasificacion de imagenes completa, con etiquetas de una sola clase por imagen.
- Estimacion de pose, que detecta puntos clave del cuerpo humano o de otros objetos.
- Deteccion de objetos con orientacion (OBB), util para elementos rotados como vehiculos en imagenes aereas.
- Seguimiento de objetos (tracking) en secuencias de video, con persistencia de identidades.
- Inferencia end-to-end nativa, sin necesidad de post-procesamiento NMS, lo que reduce la latencia.
- Compatibilidad con multiples formatos de exportacion: TensorRT, ONNX, CoreML y TFLite, facilitando el despliegue en diferentes plataformas.

## Casos de uso

- Vigilancia y seguridad perimetral: el modelo puede detectar personas, vehiculos u objetos anomalos en tiempo real desde camaras IP, gracias a su inferencia end-to-end y a su eficiencia en CPU, lo que permite ejecutarlo en dispositivos edge como Raspberry Pi o NVIDIA Jetson.
- Control de calidad industrial: mediante segmentacion de instancias, se pueden inspeccionar piezas en una linea de produccion para detectar defectos o medir dimensiones, con una precision reportada de mAP 57.5 en COCO que se puede ajustar con fine-tuning en datos propios.
- Conteo de personas y gestion de aforo: en espacios publicos o comercios, YOLO26 puede contar individuos en tiempo real a partir de video, alimentando sistemas de alerta o analitica de flujo de clientes.
- Robotica movil: la estimacion de pose y la deteccion de objetos permiten a un robot navegar y manipular objetos en entornos no estructurados, con modelos ligeros que se ejecutan en hardware embebido.
- Analisis deportivo: la estimacion de pose permite seguir el movimiento de atletas, extraer metricas de rendimiento (angulos articulares, velocidad) y generar automaticamente resumenes visuales de partidos.
- Vehiculos autonomos y asistencia a la conduccion: la deteccion de objetos con OBB es adecuada para identificar vehiculos y senales en imagenes aereas o de camaras de trafico, y el modelo puede integrarse en sistemas de alerta temprana.
- Agricultura de precision: mediante segmentacion semantica, se pueden clasificar cultivos, detectar plagas o estimar la cobertura vegetal a partir de imagenes de dron, con la ventaja de poder ejecutarse en dispositivos de campo con bateria limitada.

## Benchmarks y rendimiento

Segun el modelo-index publicado en HuggingFace, el resultado oficial declarado por Ultralytics es:

| Dataset | Metrica | Valor | Verificado |
|---|---|---|---|
| COCO (validacion) | mAP@0.5:0.95 | 57.5 | no |

No se han publicado en la informacion disponible comparaciones con otros modelos de la misma categoria (YOLOv8, YOLO11, etc.) ni resultados en otros benchmarks como ImageNet o Cityscapes. El dato de mAP 57.5 en COCO es el unico punto de referencia oficial.

## Requisitos de hardware

- No se proporcionan cifras exactas de VRAM en la informacion disponible.
- El modelo esta optimizado para ejecucion en CPU, con una mejora de hasta un 43 % en velocidad de inferencia respecto a generaciones anteriores, lo que sugiere que puede funcionar en hardware modesto.
- Se puede ejecutar en GPUs de consumo (por ejemplo, RTX 3060 o superiores) y en dispositivos edge como NVIDIA Jetson, gracias a la exportacion a TensorRT.
- Para despliegue en produccion, se recomienda usar la libreria ultralytics con PyTorch, o exportar a ONNX/TensorRT para inferencia con motores como TensorRT o OpenVINO.
- No hay datos publicados sobre latencia o throughput especificos para distintas configuraciones de hardware.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados en la informacion proporcionada. YOLO26 es la evolucion directa de la serie YOLO de Ultralytics (YOLOv8, YOLO11, YOLO12), pero no se han publicado tablas comparativas oficiales con esos modelos en las fuentes consultadas. Se recomienda consultar la documentacion de Ultralytics para obtener graficas de rendimiento relativo.

## Limitaciones y advertencias

- La licencia AGPL-3.0 implica que cualquier uso comercial del modelo debe liberar el codigo fuente de la aplicacion que lo integra si se distribuye, lo que puede ser restrictivo para productos propietarios. Ultralytics ofrece licencias comerciales alternativas bajo peticion.
- No se han documentado sesgos especificos del modelo, pero al ser un modelo de vision entrenado con datos de COCO, puede presentar sesgos hacia las categorias y contextos presentes en ese dataset (por ejemplo, menor rendimiento en objetos poco frecuentes o en condiciones de iluminacion extremas).
- Existe riesgo de falsos positivos y falsos negativos en escenarios de oclusion, baja resolucion o clases similares entre si, especialmente si no se realiza fine-tuning con datos del dominio objetivo.
- La informacion sobre cuantizacion y formatos de pesos no esta disponible en el repositorio, por lo que se debe validar la compatibilidad con el hardware objetivo antes de desplegar.
- No se especifican requisitos minimos de hardware ni consumo de memoria, por lo que se recomienda realizar pruebas de rendimiento en el entorno de destino.

## Enlaces

- HuggingFace: https://huggingface.co/Ultralytics/YOLO26
- Documentacion oficial: https://docs.ultralytics.com/models/yolo26
- Pagina de producto: https://www.ultralytics.com/yolo/yolo26
- Plataforma Ultralytics: https://platform.ultralytics.com/ultralytics/yolo26
- Repositorio GitHub: https://github.com/ultralytics/yolo26
- Paper tecnico: https://arxiv.org/abs/2606.03748
