# sudhanshu/neu-det-yolo

## Resumen

Neu Det - Edge YOLO Defect Detection es un modelo de deteccion de objetos basado en la familia YOLO (libreria `ultralytics`) entrenado especificamente para la inspeccion automatizada de defectos superficiales en acero (el conjunto de clases coincide con el del dataset NEU-DET: crazing, inclusion, patches, pitted_surface, rolled-in_scale y scratches). Lo publica el usuario sudhanshu en Hugging Face y esta orientado a despliegue en el borde (edge) y en navegador, con exportaciones a ONNX sin NMS.

El modelo se distribuye con pesos PyTorch (`best.pt`), un modelo ONNX end-to-end (`best.onnx`) con salida de forma `[1, 300, 6]` que integra la supresion de no maximos, y un fichero de metadatos (`model_meta.json`) pensado para runtimes web. Esta orientado a un caso de uso vertical y concreto: la deteccion de defectos en entornos de fabricacion.

La informacion publica disponible es muy limitada: la model card no incluye numero de parametros, contexto, datos de entrenamiento, resultados de benchmarks ni licencia explicita. El repositorio figura con 0 GB de tamano, 0 descargas y 0 likes, lo que sugiere una publicacion reciente y sin validacion comunitaria. Por tanto, varias especificaciones se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO (familia Ultralytics); variante concreta no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible (se distribuye PyTorch `best.pt` y ONNX `best.onnx`) |
| Idiomas soportados | no disponible (modelo de vision; las clases estan en ingles) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`best.pt`) y ONNX (`best.onnx`, salida `[1, 300, 6]`) |

## Arquitectura y entrenamiento

Se trata de un detector de objetos de la familia YOLO, integrado con la libreria `ultralytics`. La model card no especifica la variante (n, s, m, l, x), el numero de parametros ni la resolucion de entrada. La exportacion ONNX es "NMS-free end-to-end" con salida `[1, 300, 6]`: hasta 300 detecciones por imagen, cada una con seis valores (tipicamente coordenadas de caja y puntuacion/clase), lo que indica que la supresion de no maximos esta integrada en el grafo y simplifica el despliegue en navegador y en dispositivos de borde.

No se dispone de informacion sobre el numero de imagenes de entrenamiento, la composicion exacta del dataset, el regimen de aumento de datos ni si se aplicaron tecnicas de destilacion o ajuste fino. Las clases publicadas (crazing, inclusion, patches, pitted_surface, rolled-in_scale, scratches) coinciden con las seis clases del dataset publico NEU-DET de defectos superficiales en acero, pero la model card no confirma explicitamente que se haya entrenado sobre ese dataset ni con que particion.

## Capacidades

- Deteccion de objetos en imagenes: localiza y clasifica seis tipos de defectos superficiales (crazing, inclusion, patches, pitted_surface, rolled-in_scale, scratches).
- Inferencia end-to-end sin NMS externo: el ONNX exportado integra la supresion de no maximos en el grafo.
- Despliegue en navegador y borde: la exportacion ONNX y el fichero `model_meta.json` estan pensados para runtimes web y dispositivos con recursos limitados.
- Compatibilidad con el ecosistema Ultralytics: entrenamiento, validacion y exportacion mediante la API de `ultralytics`.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision-lenguaje, audio ni modo de pensamiento, ya que es un detector de objetos puro.
- Capacidades multilingues: no aplica.

## Casos de uso

- Inspeccion de calidad en linea de produccion de acero: el modelo detecta defectos superficiales (grietas, inclusiones, picaduras, rayado) en imagenes de bobinas o chapas, permitiendo clasificar y rechazar piezas defectuosas de forma automatica.
- Control de calidad en el borde: al exportarse a ONNX sin NMS, puede ejecutarse en dispositivos de baja potencia (Raspberry Pi, Jetson, camaras inteligentes) junto a la linea de fabricacion, reduciendo la latencia y la dependencia de la nube.
- Inspeccion asistida en navegador: el ONNX y el `model_meta.json` permiten montar una demo web donde el operario sube una imagen y obtiene las detecciones en cliente, util para formacion o verificacion manual.
- Preetiquetado de datasets: el modelo puede usarse para generar etiquetas preliminares sobre nuevas imagenes de defectos, que luego se revisan y corrigen manualmente antes de reentrenar.
- Monitorizacion de desgaste de utillaje: la deteccion temprana de defectos recurrentes (por ejemplo, rolled-in_scale o scratches) puede correlacionarse con el estado de los rodillos o cuchillas para programar mantenimiento.
- Integracion en pipelines de vision industrial: los pesos `best.pt` permiten reentrenar o ajustar el modelo con la API de Ultralytics sobre imagenes propias de la planta, adaptando las clases al proceso concreto.
- Filtrado previo en sistemas de inspeccion por lotes: ejecutar el detector sobre todas las imagenes de un lote y derivar solo las que contienen defectos a una revision mas costosa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende de la variante YOLO (no especificada) y de la resolucion de entrada.
- GPU recomendadas: no disponible. Para entrenamiento o inferencia de alta capacidad, GPUs de clase A100, H100 o RTX 4090 serian adecuadas para variantes grandes de YOLO, pero no hay datos que lo confirmen para este modelo.
- Cabe en GPU de consumo: probablemente si para variantes pequenas/medianas de YOLO, pero no se dispone de confirmacion.
- Opciones de despliegue: `ultralytics` (PyTorch), ONNX Runtime (incluido en navegador via WebGPU/WebAssembly) y, en general, cualquier runtime compatible con ONNX. No se documentan exportaciones a TensorRT, OpenVINO, TFLite ni CoreML.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Neu Det - Edge YOLO (sudhanshu) | no disponible | no aplica | Deteccion de defectos (6 clases) | no disponible | Hugging Face |
| YOLOv8 (Ultralytics) | 3,2M-68,2M segun variante | no aplica | Deteccion de objetos general | AGPL-3.0 / Enterprise | GitHub, Hugging Face |
| YOLO11 (Ultralytics) | ~2,6M-56,9M segun variante | no aplica | Deteccion de objetos general | AGPL-3.0 / Enterprise | GitHub, Hugging Face |
| Detector especifico NEU-DET (varios autores) | no disponible | no aplica | Deteccion de defectos (6 clases) | variable | GitHub, papers |

No se dispone de datos de rendimiento del modelo como para establecer una comparacion cuantitativa con estas alternativas.

## Limitaciones y advertencias

- Informacion muy escasa: la model card no documenta parametros, datos de entrenamiento, licencia ni benchmarks, lo que impide evaluar su calidad de forma objetiva.
- Licencia no declarada: no se puede confirmar si el uso comercial esta permitido. Dado que la libreria base es Ultralytics (AGPL-3.0 en su version abierta), conviene verificar la licencia antes de cualquier uso en produccion.
- Dominio restringido: el modelo solo detecta seis clases de defectos superficiales en acero; no es un detector de objetos general y probablemente generalizara mal fuera de ese dominio.
- Riesgo de alucinacion en vision: como todo detector, puede producir falsos positivos y falsos negativos, especialmente con iluminacion, angulos o materiales distintos a los del entrenamiento.
- Sin validacion comunitaria: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia externa de su rendimiento real.
- Sin informacion sobre sesgos: no se documenta la composicion del dataset ni posibles sesgos por tipo de defecto, iluminacion o camara.
- Sin garantias de mantenimiento: el repositorio tiene un tamano de 0 GB reportado y no se documenta soporte ni actualizaciones.
- Idioma: las clases y metadatos estan en ingles; no aplica soporte multilingue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sudhanshu/neu-det-yolo
- Libreria Ultralytics (documentacion): https://docs.ultralytics.com/
- Repositorio Ultralytics en GitHub: https://github.com/ultralytics/ultralytics
- Dataset NEU-DET (referencia de las clases, no confirmado por el autor): no disponible como enlace oficial en la informacion proporcionada.
