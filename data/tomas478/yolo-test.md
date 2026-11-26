# tomas478/yolo-test

## Resumen

`tomas478/yolo-test` es un modelo de deteccion de objetos en formato ONNX publicado por el usuario tomas478 como envio de codigo abierto ("open-source submission") para la subnet 44 de Bittensor, en el marco de una iniciativa denominada TurboVision. Segun la model card, se trata de un YOLO26n afinado con un tamano de entrada de 736 pixeles y cinco clases orientadas a detectar suciedad en habitaciones: derrames de liquido, papeleras, basura, moho y manchas. El repositorio incluye `miner.py`, un fichero de configuracion `chute_config.yml` y los pesos `weights.onnx`.

El modelo no es un LLM ni un modelo de lenguaje: es un detector de objetos visual. Su relevancia es acotada y muy especifica del ecosistema de mineria de Bittensor/Chutes, donde se usa como componente de un "miner" que procesa imagenes y devuelve detecciones. La informacion publica es escasa: no hay datos de licencia, idiomas, pipeline declarado ni resultados de benchmarks, y el repositorio pesa 10,3 GB pese a tratarse de un YOLO nano, lo que sugiere artefactos adicionales no documentados.

La model card es explicita en una restriccion: el repositorio debe permanecer solo en ONNX y no debe contener ficheros `.pt`, `.pth` o `.safetensors`. El grafo exportado corresponde a la cabeza "one-to-many" con forma de salida `(1, 9, 11109)`, lo que implica 9 canales de salida (4 de caja mas 5 de clase) y 11.109 anclas para una entrada de 736x736.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26n (detector convolucional de una etapa, familia YOLO), exportado a ONNX |
| Parametros totales | no disponible (variante "n" de YOLO26, cifra exacta no publicada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada de imagen 736x736) |
| Tipos de cuantizacion | no disponible (solo se distribuye el grafo ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | ONNX (`weights.onnx`) |

## Arquitectura y entrenamiento

La arquitectura es un detector YOLO de la generacion YOLO26 en su variante nano, exportado a ONNX. La salida documentada es la cabeza "one-to-many" con forma `(1, 9, 11109)`: 4 coordenadas de caja mas 5 logits de clase por ancla, con 11.109 anclas derivadas de una resolucion de entrada de 736x736. El pipeline de inferencia lo implementa `miner.py`, que aplica letterbox a la imagen de entrada, decodifica las predicciones y aplica umbrales por clase.

No se especifican en la informacion disponible el numero de tokens ni la composicion del dataset de entrenamiento, ni si hubo etapas de refinamiento posteriores (por ejemplo, destilacion o ajuste con datos sinteticos). Tampoco se detalla el proceso de exportacion a ONNX mas alla de la mencion a la cabeza one-to-many. Las cinco clases declaradas, en orden, son: liquid spillage, bin, litter, mould y stain. El autor indica que el modelo esta afinado ("fine-tuned") sobre YOLO26n, pero no se aportan hiperparametros, epocas ni metricas de validacion.

## Capacidades

- Deteccion de objetos en imagenes con cinco clases especificas de suciedad y elementos de una habitacion: derrames de liquido, papeleras, basura, moho y manchas.
- Salida en formato de tensor ONNX con decodificacion de cajas y logits de clase; requiere postproceso (letterbox, decodificacion, umbrales) implementado en `miner.py`.
- Inferencia sobre imagenes de entrada redimensionadas a 736x736.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo puramente perceptivo.
- No tiene capacidades multilingues, de generacion de texto, codigo, matematicas, audio ni vision general mas alla de las cinco clases entrenadas.
- No dispone de modo "thinking" ni de ninguna capacidad agentica.
- Integracion prevista con el stack de despliegue de Chutes/Bittensor mediante el comando `sv -vv deploy-os-miner`.

## Casos de uso

- Mineria en la subnet 44 de Bittensor: el modelo se despliega como "miner" que responde a peticiones de deteccion de suciedad en imagenes, y su salida se evalua frente a la de otros mineros de la red. Es el caso de uso para el que fue publicado.
- Auditoria de limpieza en instalaciones: procesar fotos periodicas de habitaciones (hoteles, residencias, oficinas) para detectar derrames, basura o manchas y generar alertas al personal de limpieza.
- Control de calidad en alquiler vacacional: analizar imagenes subidas por el personal de mantenimiento para verificar que una estancia esta en condiciones antes de la entrada de huespedes.
- Deteccion temprana de moho: usar la clase "mould" para identificar zonas con posible proliferacion de moho en imagenes de banos o paredes, como primer filtro antes de una inspeccion humana.
- Gestion de residuos: localizar papeleras ("bin") y basura ("litter") en imagenes para estimar ocupacion o necesidad de vaciado en entornos controlados.
- Prototipado de pipelines de vision con ONNX Runtime: al ser un grafo ONNX autocontenido, sirve como ejemplo de integracion de un detector YOLO en un servicio de inferencia con postproceso propio.
- Investigacion sobre evaluacion de mineros: util como referencia reproducible para estudiar como se comportan distintos detectores bajo el protocolo de la subnet 44.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye mAP, precision, recall ni comparaciones con otros detectores, y no se aportan metricas de validacion del ajuste fino.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Por el tamano de la variante nano de YOLO y una entrada de 736x736, la inferencia en FP32 deberia caber holgadamente en GPUs de consumo, pero no se confirma con datos publicados.
- GPU recomendadas: no disponible. Cualquier GPU con soporte de ONNX Runtime o TensorRT deberia poder ejecutar el grafo; no se especifican modelos concretos.
- Cabe en GPU de consumo: previsiblemente si, dado el tamano reducido de la variante nano, aunque no se documenta.
- Opciones de despliegue: ONNX Runtime (formato nativo del modelo); el autor menciona el despliegue mediante `sv -vv deploy-os-miner` con una clave de desarrollador de Chutes. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a un detector de vision.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Clases | Licencia | Formato |
|---|---|---|---|---|---|
| tomas478/yolo-test | no disponible (YOLO26n) | 736x736 | 5 | no disponible | ONNX |
| YOLOv8n (Ultralytics) | ~3,2 M | configurable | 80 (COCO) | AGPL-3.0 (uso comercial condicionado) | PyTorch, ONNX, etc. |
| YOLO11n (Ultralytics) | ~2,6 M | configurable | 80 (COCO) | AGPL-3.0 (uso comercial condicionado) | PyTorch, ONNX, etc. |
| YOLO26n (referencia oficial) | no disponible en la informacion | configurable | 80 (COCO) | no disponible en la informacion | PyTorch, ONNX, etc. |

La comparacion es aproximada: los modelos de referencia se entrenan sobre COCO con 80 clases, mientras que este modelo esta afinado para 5 clases especificas, por lo que no son directamente intercambiables. No se dispone de metricas para comparar rendimiento.

## Limitaciones y advertencias

- Informacion muy incompleta: no hay licencia declarada, lo que impide determinar si el uso comercial esta permitido. Ante la ausencia de licencia, debe asumirse que no se concede permiso explicito de uso.
- No se publican metricas de rendimiento (mAP, precision, recall) ni detalles del dataset de entrenamiento, por lo que no es posible evaluar su calidad de forma objetiva.
- El modelo solo reconoce cinco clases muy especificas; cualquier uso fuera de ese dominio (deteccion general de objetos) producira resultados no fiables.
- Riesgo de alucinacion en sentido amplio: falsos positivos y falsos negativos en escenas con iluminacion adversa, oclusiones o clases visualmente similares (por ejemplo, mancha frente a derrame).
- Restriccion de formato: el repositorio debe permanecer solo en ONNX; no admite pesos `.pt`, `.pth` o `.safetensors`, lo que limita el reentrenamiento directo a partir de los artefactos publicados.
- El repositorio pesa 10,3 GB pese a ser un modelo nano, lo que sugiere artefactos no documentados o duplicados; conviene revisar el contenido antes de descargarlo en produccion.
- Sin garantias de mantenimiento: 0 likes y actualizacion reciente pero sin documentacion de versionado; el autor no ofrece soporte ni hoja de ruta.
- El despliegue esta ligado al ecosistema Chutes/Bittensor y requiere una clave de desarrollador de Chutes, lo que condiciona su portabilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tomas478/yolo-test
- No se han encontrado en la informacion disponible enlaces adicionales a papers, blogs, repositorios o demos.
