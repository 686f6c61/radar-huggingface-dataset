# tommy33355/damagelens-onnx

## Resumen

DamageLens ONNX es un repositorio de modelos de segmentación de instancias exportados al formato ONNX, publicado por el usuario tommy33355. No se trata de un modelo entrenado desde cero, sino de la conversión de dos modelos Ultralytics YOLO11-seg previamente entrenados: uno para detección de daños en carrocería (YOLO11x-seg) y otro para segmentación de piezas del vehículo (YOLO11n-seg). El objetivo es ejecutar inferencia con ONNX Runtime sin dependencia de PyTorch, lo que permite desplegar el sistema en instancias CPU modestas.

El repositorio contiene dos ficheros, `car_damage_seg.onnx` y `car_parts_seg.onnx`, que se usan en la aplicación web DamageLens AI para detectar y localizar daños como grietas, abolladuras, roturas de cristal, faros rotos, arañazos y neumáticos desinflados, así como 23 piezas distintas de la carrocería. Los pesos no se han modificado respecto a los modelos originales: solo cambia el formato.

La relevancia de esta ficha es doble. Por un lado, ilustra el flujo habitual de exportar YOLO11 a ONNX con soporte de formas dinámicas y simplificación de grafo. Por otro, advierte de una restricción de licencia importante: los modelos base están bajo AGPL-3.0 y el dataset CarDD que alimentó el modelo de daños está restringido a investigación y educación no comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO11-seg (instance segmentation). Dos variantes: YOLO11x-seg para daños y YOLO11n-seg para piezas |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible (pesos exportados en float32) |
| Idiomas soportados | no aplica (modelo de vision; clases en ingles) |
| Licencia | AGPL-3.0 |
| Formato de pesos | ONNX (opset 17) |

Otros datos tecnicos de interes:

| Parametro | Valor |
|---|---|
| Entrada | `images` float32 `[1, 3, H, W]`, RGB, rango 0-1, letterbox, H y W multiplos de 32, lado largo 640 |
| Salida 1 | `output0` `[1, 4 + num_classes + 32, N]` (xywh, puntuaciones de clase, coeficientes de mascara) |
| Salida 2 | `output1` `[1, 32, H/4, W/4]` (prototipos de mascara) |
| NMS y decodificacion de mascaras | no incluidos en el grafo |
| Clases (daños) | crack, dent, glass shatter, lamp broken, scratch, tire flat |
| Clases (piezas) | 23 piezas (parachoques, puertas, faros, capo, espejos, rueda, etc.) |
| Tamano del repositorio | 0,3 GB |
| Nombres de clase | almacenados en la clave `names` de los metadatos ONNX |

## Arquitectura y entrenamiento

Los dos modelos son redes Ultralytics YOLO11 en su variante de segmentacion de instancias (`-seg`). La variante de daños usa el backbone y cabezal de mayor capacidad, YOLO11x-seg, mientras que la de piezas usa la variante mas ligera, YOLO11n-seg. YOLO11 es una familia de detectores de una sola etapa con cabezal de segmentacion que produce, ademas de cajas, coeficientes de mascara y prototipos de mascara, lo que permite generar mascaras por instancia. Como el propio repositorio indica, los pesos son los originales de los autores, sin reentrenamiento ni ajuste adicional.

El proceso de conversion se realizo con Ultralytics 8.3.114 y PyTorch 2.5.1, aplicando `format="onnx"`, `imgsz=640`, `dynamic=True`, `simplify=True` y `opset=17`. Posteriormente, los ficheros se optimizaron offline con ONNX Runtime 1.30 al nivel `ORT_ENABLE_EXTENDED`, con la recomendacion de cargarlos con `graph_optimization_level=ORT_DISABLE_ALL`. La validacion se hizo contra los modelos `.pt` originales sobre imagenes de test de CarDD, confirmando detecciones, clases, cajas y confianzas identicas a 640 px. No se documenta en la informacion disponible el numero de tokens, la composicion del dataset de entrenamiento original ni si se aplicaron tecnicas de RLHF o DPO (no aplicables, por otra parte, a un modelo de vision de este tipo).

## Capacidades

- Segmentacion de instancias de daños en carroceria: detecta y delimita seis clases (crack, dent, glass shatter, lamp broken, scratch, tire flat).
- Segmentacion de piezas del vehiculo: 23 clases de piezas (parachoques, puertas, luces, capo, espejos, rueda, etc.).
- Procesamiento de imagenes RGB con preprocesado letterbox a 640 px de lado largo.
- Soporte de formas dinamicas en altura y anchura (multiplos de 32), gracias a `dynamic=True`.
- Ejecucion en ONNX Runtime con backend CPU, sin PyTorch.
- Metadatos de clases embebidos en el grafo (`names`), lo que facilita el postprocesado.
- No incluye NMS ni decodificacion de mascaras: deben implementarse externamente.
- No dispone de capacidades de generacion de texto, razonamiento, codigo, tool calling, agentes ni procesamiento de audio.

## Casos de uso

- Estimacion automatizada de daños en vehiculos: el modelo de daños segmenta las regiones afectadas (abolladuras, arañazos, roturas de cristal, faros) sobre fotografias del siniestro, de modo que un peritaje preliminar puede apoyarse en mascaras precisas antes de la inspeccion fisica.
- Inspeccion previa a compraventa de coches: la combinacion de ambos modelos permite localizar cada daño y asociarlo a la pieza correspondiente, generando un informe estructurado por zona del vehiculo.
- Triage en aseguradoras: al ejecutarse sobre ONNX Runtime en CPU, el modelo puede integrarse en el backend de una web de recepcion de partes, filtrando casos simples y priorizando los que requieren perito humano.
- Aplicaciones de valoracion de reparaciones: la segmentacion por piezas (23 clases) permite mapear cada daño a la pieza afectada y alimentar una base de datos de costes de reparacion.
- Flotas de alquiler o renting: inspeccion automatizada de vehiculos en devolucion, comparando el estado de entrada y de salida mediante las mascaras generadas.
- Vision por computador en el borde: al ser ONNX sin dependencia de PyTorch, el modelo puede desplegarse en un contenedor ligero o en un dispositivo con CPU y memoria limitada para inspecciones rapidas en taller.
- Generacion de datasets anotados: las mascaras producidas pueden emplearse como pseudoetiquetas para reentrenar o mejorar modelos propios de segmentacion de daños (respetando las restricciones del dataset CarDD).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica evidencia de rendimiento indicada por el autor es que la validacion sobre imagenes de test de CarDD reproduce exactamente las detecciones, clases, cajas y confianzas de los modelos `.pt` originales a 640 px, sin degradacion aparente por la conversion.

## Requisitos de hardware

- El repositorio ocupa 0,3 GB en disco, correspondiente a los dos ficheros ONNX.
- El modelo de piezas (YOLO11n-seg) es ligero y cabe con holgura en cualquier GPU consumer e incluso en CPU.
- El modelo de daños (YOLO11x-seg) es la variante mas grande de la familia YOLO11; se espera una demanda de VRAM mayor, aunque no se especifican cifras concretas en la informacion disponible.
- GPU recomendadas: no disponibles en la informacion proporcionada (el caso de uso declarado es una instancia CPU pequena).
- Opciones de despliegue: ONNX Runtime (backend declarado por el autor, con `graph_optimization_level=ORT_DISABLE_ALL`). Al ser ficheros ONNX estandar, son compatibles con otros runtimes que admitan opset 17, aunque no se documentan pruebas con ellos.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tarea | Arquitectura | Clases | Formato | Licencia |
|---|---|---|---|---|---|
| tommy33355/damagelens-onnx | Segmentacion de daños y piezas | YOLO11x-seg + YOLO11n-seg | 6 daños + 23 piezas | ONNX | AGPL-3.0 |
| harpreetsahota/car-dd-segmentation-yolov11 | Segmentacion de daños | YOLO11x-seg | 6 daños | PyTorch (.pt) | AGPL-3.0 (modelo base) |
| Majorburn/yolov11-carparts-seg | Segmentacion de piezas | YOLO11n-seg | 23 piezas | PyTorch (.pt) | AGPL-3.0 (modelo base) |
| junaidariie/DamageLensAI | Clasificacion de daños | Ensemble ResNet-18 + EfficientNet-V2-S + ConvNeXt-Small | Clasificacion por zona (frontal/trasera) | no disponible | no disponible |

Los dos primeros modelos comparados son los propios modelos base de los que derivan los ficheros ONNX de este repositorio, por lo que la comparacion directa carece de sentido mas alla de la diferencia de formato. El sistema DamageLensAI de junaidariie es un proyecto distinto que aborda la clasificacion de daños con un ensemble de clasificadores en lugar de segmentacion, por lo que no es equivalente en tarea.

## Limitaciones y advertencias

- Licencia AGPL-3.0: cualquier uso que implique distribuir el software o exponerlo como servicio en red debe cumplir las obligaciones de copyleft de esta licencia, lo que puede ser incompatible con productos comerciales cerrados.
- El modelo de daños se entreno sobre el dataset CarDD, cuyos terminos lo restringen a fines de investigacion y educacion no comerciales. Es imprescindible respetar estas condiciones al usar `car_damage_seg.onnx`.
- El grafo no incluye NMS ni decodificacion de mascaras; el integrador debe implementar ambos pasos, con el riesgo de errores si se hace de forma incorrecta.
- Riesgo de alucinacion no aplica en el sentido generativo, pero si existe riesgo de falsos positivos o negativos en detecciones con oclusiones, iluminacion deficiente o angulos poco habituales; no se han publicado metricas de precision o recall.
- No se documentan sesgos conocidos ni evaluacion por subgrupos (tipo de vehiculo, color, condiciones de captura).
- El preprocesado debe respetar estrictamente el letterbox a 640 px con lados multiplos de 32 y normalizacion a rango 0-1; desviarse de este esquema degrada la inferencia.
- Los nombres de clase estan en ingles y no se ofrece traduccion oficial.
- El repositorio registra cero descargas y cero likes en el momento de la consulta, por lo que carece de validacion comunitaria independiente.
- Fecha de creacion y actualizacion muy proximas entre si (8 de octubre de 2026), lo que indica una publicacion reciente y posiblemente sin mantenimiento posterior.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tommy33355/damagelens-onnx
- Perfil del autor: https://huggingface.co/tommy33355
- Space del autor: https://huggingface.co/spaces/tommy33355/damage
- Repositorio del codigo que usa estos modelos: https://github.com/tomxavier71200-ship-it/damage-detection
- Modelo base de daños: https://huggingface.co/harpreetsahota/car-dd-segmentation-yolov11
- Modelo base de piezas: https://huggingface.co/Majorburn/yolov11-carparts-seg
- Dataset CarDD: https://cardd-ustc.github.io
- Proyecto DamageLensAI (referencia externa, no relacionado directamente): https://github.com/junaidariie/DamageLensAI/tree/main/
- Pagina del proyecto DamageLensAI: https://junaidariie.github.io/DamageLensAI/
- Catalogo de modelos de ONNX Runtime: https://onnxruntime.ai/models
