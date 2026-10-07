# Wattsey/birefnet-lite-512-webgpu

## Resumen

BiRefNet-lite 512 (WebGPU) es una version optimizada para ejecucion en navegador del modelo de segmentacion dicotomica de imagen BiRefNet_lite, desarrollado originalmente por ZhengPeng7. La variante la publica el usuario Wattsey y su proposito es concreto: permitir que un modelo de segmentacion de alta calidad se ejecute integramente en la GPU del dispositivo mediante WebGPU, incluso en GPUs de telefonos moviles, sin depender de servidores. El modelo trabaja a una resolucion de entrada de 512x512 y se distribuye como grafo ONNX en fp16.

La relevancia de esta ficha radica en su naturaleza de adaptacion de despliegue mas que en un modelo nuevo desde cero. El autor ha reescrito el grafo ONNX para sustituir los nodos `GatherND` de las convoluciones deformables y los nodos `Split` anchos por operaciones equivalentes que WebGPU puede ejecutar dentro de los limites de memoria de una GPU movil. Segun la model card, la salida es bit a bit identica a la del modelo original, por lo que no hay perdida de calidad respecto a la version de referencia.

Se apoya en la arquitectura BiRefNet (Bilateral Reference Network), basada en un backbone Swin Transformer, y hereda la licencia MIT tanto del modelo base como de los scripts de parcheo empleados. El repositorio ocupa aproximadamente 0,1 GB, lo que confirma que se trata de una variante ligera orientada a entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BiRefNet (Bilateral Reference Network) con backbone Swin Transformer; grafo ONNX reescrito para WebGPU |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; resolucion de entrada de 512x512 pixeles |
| Tipos de cuantizacion | fp16 (ONNX en precision media) |
| Idiomas soportados | no disponible (no aplica: modelo de segmentacion de imagen, no de lenguaje) |
| Licencia | MIT |
| Formato de pesos | ONNX (fp16), consumible desde transformers.js |

## Arquitectura y entrenamiento

BiRefNet es una red de segmentacion de imagen de tipo "dichotomous image segmentation", cuyo objetivo es separar con precision el objeto principal del fondo en imagenes de alta resolucion. Su diseno combina un backbone Swin Transformer con modulos de referencia bilateral que refuerzan mutuamente las representaciones de alto y bajo nivel. La variante `lite` reduce el coste computacional del modelo completo para hacerlo viable en hardware modesto, y en esta publicacion se fija la entrada a 512x512 pixeles.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens o imagenes, ni sobre el proceso de ajuste (por ejemplo, si se aplico refinamiento con perdidas especificas de matting). Lo que si documenta la model card es la intervencion sobre el grafo de inferencia: los nodos `GatherND` asociados a las convoluciones deformables y los nodos `Split` de gran anchura se sustituyen por operaciones equivalentes, empleando los scripts de parcheo con licencia MIT del repositorio `jiabins0303/birefnet-lite-1024-webgpu`. El resultado es un grafo que se ejecuta por completo en WebGPU dentro de los limites de memoria tipicos de una GPU de telefono, manteniendo una salida identica bit a bit respecto al modelo original.

## Capacidades

- Segmentacion dicotomica de imagen: aisla el sujeto principal del fondo en una imagen de entrada a 512x512.
- Generacion de mascaras de alta calidad: la arquitectura BiRefNet esta disenada para bordes finos y detalles como cabello o siluetas complejas.
- Recorte automatico de fondo (background removal / matting) sin intervencion manual.
- Inferencia en navegador: se ejecuta en el cliente mediante WebGPU a traves de transformers.js, sin enviar imagenes a un servidor.
- Ejecucion en hardware movil: el grafo reescrito esta ajustado a los limites de memoria de GPUs de telefono.
- Compatibilidad con el ecosistema ONNX: el grafo puede cargarse con runtimes compatibles con ONNX.
- No dispone de tool calling, razonamiento multi-paso, capacidades de agente, generacion de texto ni soporte multilingue, al no ser un modelo de lenguaje.

## Casos de uso

- Eliminacion de fondo en aplicaciones web: una herramienta de edicion fotografica en el navegador puede recortar el sujeto de una imagen en el propio dispositivo, sin subir el archivo a un servidor ni incurrir en costes de inferencia en la nube.
- Edicion de producto en comercio electronico: generacion de imagenes con fondo transparente o fondo neutro para catalogos, ejecutando el modelo localmente en el navegador del operador o en un panel de gestion interno.
- Fondo virtual en videollamadas: integracion en aplicaciones de videoconferencia web que necesiten separar al hablante del entorno usando la GPU del cliente, evitando el envio de video a servicios externos por motivos de privacidad.
- Aplicaciones moviles con WebGPU: herramientas de retoque fotografico en movil que segmenten al sujeto en el propio telefono, aprovechando que el grafo esta ajustado a limites de memoria de GPU movil.
- Preetiquetado de datasets: generacion automatica de mascaras iniciales para anotacion de imagenes en pipelines de vision por computador, que despues se revisan manualmente.
- Edicion personal en redes sociales o aplicaciones de fotografia: recortes y composiciones (pegado sobre nuevos fondos) ejecutados de forma instantanea en el navegador, sin conexion obligatoria tras la carga del modelo.
- Herramientas de accesibilidad o interfaces: generacion de recortes de sujetos para tarjetas, avatares o miniaturas dentro de una interfaz web sin coste de servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor unicamente afirma que la salida del grafo reescrito es bit a bit identica a la del modelo original `studioludens/birefnet-lite-512`, por lo que la calidad de segmentacion deberia coincidir con la de esa version, pero no se incluyen metricas numericas (IoU, S-measure, F-measure, MAE ni tiempos de inferencia).

## Requisitos de hardware

- VRAM estimada para inferencia: baja. El repositorio completo ocupa aproximadamente 0,1 GB en fp16, por lo que la huella de memoria del grafo es reducida y encaja en GPUs integradas y moviles.
- GPU objetivo: GPUs de telefonos moviles y cualquier GPU de escritorio o portatil con soporte de WebGPU (por ejemplo, navegadores basados en Chromium con WebGPU habilitado). No esta pensado para A100 ni H100, ya que es una variante ligera orientada a cliente.
- Compatibilidad con GPU de consumo: si, cabe sobradamente en cualquier GPU de consumo actual, y tambien en GPUs integradas, dado su tamano reducido y su resolucion de entrada de 512x512.
- Opciones de despliegue: transformers.js en el navegador con WebGPU como via principal; tambien ONNX Runtime Web y runtimes ONNX genericos. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponible. No se proporcionan tiempos de inferencia en la informacion consultada.

## Comparativa con modelos similares

| Modelo | Tipo | Resolucion | Formato | Licencia | Despliegue en navegador |
|---|---|---|---|---|---|
| Wattsey/birefnet-lite-512-webgpu | BiRefNet_lite optimizado para WebGPU | 512x512 | ONNX fp16 | MIT | Si, via transformers.js y WebGPU |
| studioludens/birefnet-lite-512 | BiRefNet_lite a 512x512 | 512x512 | no disponible | no disponible | no disponible |
| ZhengPeng7/BiRefNet_lite | BiRefNet_lite original | no disponible | no disponible | MIT | no disponible |
| jiabins0303/birefnet-lite-1024-webgpu | BiRefNet_lite optimizado para WebGPU | 1024x1024 | ONNX | MIT (scripts de parcheo) | Si, via WebGPU |

No se dispone de datos de parametros, contexto ni rendimiento para el resto de alternativas en la informacion proporcionada. La diferencia principal entre la version de 512 y la de 1024 es la resolucion de entrada, lo que afecta al nivel de detalle de la mascara y al consumo de memoria en GPU.

## Limitaciones y advertencias

- Resolucion fija de 512x512: trabajos que requieran mascaras de muy alta resolucion pueden necesitar la variante de 1024 o un posprocesado de escalado, con la consiguiente perdida de detalle fino.
- Modelo de nicho sin adopcion registrada: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion de la comunidad ni issues documentados.
- Dependencia de WebGPU: el grafo esta reescrito especificamente para WebGPU; en navegadores o dispositivos sin soporte de WebGPU podria no ejecutarse o degradarse, y no se detalla compatibilidad con otros backends.
- Sin datos de sesgo: no se documenta el comportamiento en distintos tipos de imagen, pieles, generos o contextos; como todo modelo de segmentacion, puede fallar en sujetos poco representados en su entrenamiento.
- Riesgo de mascaras imperfectas: pueden aparecer bordes erroneos en imagenes con fondos complejos, transparencias, oclusiones o sujetos multiples. La model card solo garantiza equivalencia bit a bit con el modelo de origen, no una calidad objetiva superior.
- Ausencia de informacion de entrenamiento: no se detallan dataset, proceso de entrenamiento ni evaluacion, lo que dificulta auditar su comportamiento en produccion.
- Licencia MIT: permite uso comercial y modificacion con atribucion, tanto para el modelo como para los scripts de parcheo referenciados; conviene conservar los avisos de copyright correspondientes.
- Naturaleza del modelo: no genera texto, no soporta idiomas ni tool calling; cualquier expectativa de ese tipo es inaplicable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Wattsey/birefnet-lite-512-webgpu
- Modelo base: https://huggingface.co/ZhengPeng7/BiRefNet_lite
- Origen del grafo de 512: https://huggingface.co/studioludens/birefnet-lite-512
- Scripts de parcheo para WebGPU (1024): https://huggingface.co/jiabins0303/birefnet-lite-1024-webgpu
