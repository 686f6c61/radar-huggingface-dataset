# tanmay9132/civic-eye-pothole-garbage

## Resumen

Civic Eye es un modelo de detección de objetos basado en YOLOv8, desarrollado por tanmay9132 como parte de un proyecto de monitorización de problemas cívicos. Su objetivo es identificar automáticamente dos categorías de incidencias urbanas: baches (potholes) y acumulaciones de basura (garbage) en imágenes y fotogramas de vídeo. El modelo está pensado para aplicaciones de smart city, inspección de infraestructuras y sistemas de reporte ciudadano, donde la detección temprana de estos problemas puede agilizar las labores de mantenimiento.

La arquitectura empleada es YOLOv8, implementada con el framework Ultralytics, y el modelo se distribuye como un archivo `best.pt` con un peso de 0.1 GB. No se dispone de información sobre el número de parámetros ni sobre el dataset de entrenamiento. El modelo es puramente visual: no maneja texto ni contexto de lenguaje, y su salida consiste en cajas delimitadoras con su clase y nivel de confianza.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv8 (Ultralytics) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de vision) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (.pt) |

## Arquitectura y entrenamiento

El modelo se basa en YOLOv8, un detector de objetos de una sola etapa (one-stage) desarrollado por Ultralytics. YOLOv8 predice cajas delimitadoras y probabilidades de clase directamente desde la imagen, sin necesidad de propuestas de regiones. Se trata de una arquitectura anchor-free que mejora la eficiencia y la precisión respecto a generaciones anteriores de la familia YOLO, y que soporta tareas de detección, segmentación y clasificación.

No se han publicado detalles sobre el dataset de entrenamiento, el número de iteraciones, la composición de los datos ni si se aplicaron técnicas de ajuste fino adicionales. Tampoco se indica el número de parámetros del modelo, aunque el tamaño del repositorio (0.1 GB) sugiere que podría tratarse de una variante ligera o media de YOLOv8. El modelo card solo confirma que las clases detectadas son dos: baches y basura, con IDs 0 y 1 respectivamente.

## Capacidades

- Deteccion de baches y basura en imagenes y fotogramas de video.
- Salida en formato de cajas delimitadoras con clase y puntuacion de confianza.
- Disenado para aplicaciones de monitorizacion de carreteras y gestion de residuos urbanos.
- Compatible con el ecosistema Ultralytics, lo que facilita su integracion en pipelines de vision por computador.
- No soporta generacion de texto, razonamiento multi-step, tool calling ni capacidades multilingues.
- No incluye soporte para vision mas alla de la deteccion de objetos (no realiza segmentacion ni clasificacion general).

## Casos de uso

- Monitorizacion de carreteras: el modelo puede analizar imagenes de camaras fijas o moviles para detectar baches de forma automatica, permitiendo priorizar tareas de reparacion sin inspeccion manual.
- Inspeccion con drones: al integrarse en un sistema de vision embarcado, puede procesar fotogramas de vuelos sobre infraestructuras urbanas para localizar vertidos de basura o deterioros en el pavimento.
- Reportes ciudadanos: en una aplicacion movil, los usuarios pueden enviar una foto de un problema civico y el modelo la verifica al instante, reduciendo la carga de moderacion manual.
- Mantenimiento predictivo: en vehiculos de servicio publico, el modelo puede detectar baches en tiempo real y alimentar un sistema de alertas para la programacion de obras.
- Gestion de residuos: el modelo puede identificar acumulaciones de basura en espacios publicos a partir de imagenes de camaras urbanas, ayudando a optimizar las rutas de recogida.
- Paneles de smart city: los resultados de la deteccion pueden integrarse en un dashboard municipal para visualizar la distribucion de incidencias y asignar recursos de forma eficiente.
- Vehiculos autonomos: aunque no es su uso principal, la deteccion de baches puede complementar sistemas de navegacion para evitar obstaculos en la via.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

No se dispone de informacion especifica sobre los requisitos de hardware para este modelo. Al tratarse de un modelo YOLOv8, puede ejecutarse tanto en CPU como en GPU, pero no se han publicado mediciones de VRAM, latencia ni throughput. Para despliegue, se puede utilizar el paquete Ultralytics directamente, o exportar el modelo a formatos como ONNX o TensorRT para optimizar la inferencia. Dado el tamaño del repositorio (0.1 GB), es probable que funcione en GPUs de consumo, pero esto no esta confirmado.

## Comparativa con modelos similares

No disponible.

## Limitaciones y advertencias

- El modelo solo detecta dos clases (baches y basura); no generaliza a otros problemas civicos como fugas de agua o farolas averiadas.
- No se ha publicado informacion sobre el dataset de entrenamiento, por lo que se desconoce la robustez del modelo ante variaciones de iluminacion, clima o camaras de diferentes resoluciones.
- Riesgo de falsos positivos y falsos negativos inherente a los modelos de deteccion de objetos, especialmente en escenas complejas o con oclusiones.
- El modelo card advierte que las IDs de clase pueden variar si se utiliza un `data.yaml` con un orden distinto; es necesario verificar la configuracion antes de integrarlo.
- La licencia Apache-2.0 permite uso comercial, pero requiere incluir el aviso de licencia y documentar los cambios realizados en el modelo.
- No se han proporcionado datos de rendimiento en benchmarks, por lo que no es posible validar su precision en comparacion con otros detectores.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tanmay9132/civic-eye-pothole-garbage
- Proyecto CivicEye en GitHub: https://github.com/TaruN-Ruwali/CivicEye
