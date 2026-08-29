# Sundowner123/comic-text-and-bubble-detector

## Resumen

El modelo `Sundowner123/comic-text-and-bubble-detector` es un espejo (mirror) del detector de burbujas y texto de cómics y manga `ogkalu/comic-text-and-bubble-detector`, publicado en formato ONNX y utilizado por la aplicación TranslateApp como detector de globos de diálogo en viñetas. Según la model card, el archivo `detector.onnx` es byte-idéntico al `detector-v4-s_int8.onnx` del repositorio original, por lo que no se trata de un reentrenamiento, sino de una copia exacta con fines de distribución o integración.

El modelo resuelve el problema de localizar burbujas de diálogo y texto libre en páginas de cómics y manga, una tarea previa necesaria para la traducción automática de viñetas, la extracción de texto o el procesado editorial. Su relevancia radica en que ofrece una solución ligera (el archivo pesa unos 11 MB) y portable a dispositivos móviles, gracias a su formato ONNX y a su cuantización int8. La arquitectura concreta no se detalla en la información disponible, pero se trata de un detector de objetos de una sola etapa con salida fija de 300 detecciones por imagen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (detector de objetos, probablemente basado en RT-DETR o similar, sin confirmar) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no aplicable (modelo de vision) |
| Tipos de cuantizacion | int8 (archivo `detector-v4-s_int8.onnx`) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (archivo `detector.onnx`, 11.120.765 bytes) |

## Arquitectura y entrenamiento

La informacion disponible no especifica la arquitectura interna del modelo. Se sabe que es un detector de objetos que opera sobre imagenes de 640x640 píxeles en RGB, normalizadas dividiendo entre 255. Produce tres salidas: etiquetas (300), cajas delimitadoras en coordenadas xyxy (300x4) y puntuaciones de confianza (300). El modelo fue entrenado originalmente por ogkalu, pero no se proporcionan detalles sobre el dataset, el numero de epocas o el metodo de entrenamiento. El archivo ONNX esta cuantizado a int8, lo que reduce su tamaño y acelera la inferencia en CPU y dispositivos moviles, a costa de una posible perdida minima de precision.

## Capacidades

- Deteccion de tres clases de objetos en paginas de comic y manga:
  - `bubble` (contorno vacio, ignorado por la aplicacion)
  - `text_bubble` (burbuja de dialogo con texto)
  - `text_free` (texto libre fuera de burbuja)
- Salida de hasta 300 detecciones por imagen, con cajas en coordenadas de píxeles de la pagina original (gracias al parametro `orig_target_sizes`).
- Inferencia optimizada para ONNX Runtime (ORT), con entrada de lotes de tamaño N.
- Umbral de confianza configurable (en la aplicacion se usa 0.3).
- No incluye capacidades de OCR, generacion de texto, razonamiento ni tool calling; es exclusivamente un detector de objetos.

## Casos de uso

- Traduccion automatica de manga y comics: el modelo localiza las burbujas de dialogo y el texto libre, permitiendo que un sistema posterior realice OCR y traduccion sobre las regiones detectadas. Es el caso de uso principal de TranslateApp.
- Extraccion de texto para archivos digitales: al obtener las cajas de las burbujas, se puede recortar cada region y pasarla a un OCR para digitalizar el contenido textual de una pagina.
- Reconstruccion y edicion de viñetas: las detecciones de burbujas permiten eliminar el texto original y sustituirlo por traducciones, manteniendo la posicion y el tamano de los globos.
- Indexacion y busqueda de contenido: las cajas detectadas pueden usarse para generar metadatos sobre la disposicion del texto en una pagina, util para bases de datos de comics.
- Preprocesado para modelos de generacion de imagenes: al conocer la ubicacion de las burbujas, se pueden enmascarar o modificar antes de aplicar modelos de inpainting o restauracion.
- Aplicaciones moviles de lectura con traduccion integrada: al ser un modelo ONNX ligero (11 MB), puede ejecutarse en tiempo real en smartphones sin necesidad de servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas como mAP, precision o recall, ni comparaciones con otros detectores. El unico dato de rendimiento indirecto es el tamaño del archivo (11 MB) y la cuantizacion int8, que sugieren una inferencia rapida en CPU, pero no hay cifras concretas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada: al ser un modelo ONNX de 11 MB, puede ejecutarse en CPU sin necesidad de GPU. En GPU, el consumo de VRAM seria minimo (menos de 100 MB).
- GPU recomendadas: no requiere GPU especifica; cualquier GPU moderna (incluso integradas) puede ejecutarlo, aunque no es necesario.
- Compatibilidad con GPU de consumo: si, cualquier GPU con soporte de ONNX Runtime (CUDA, DirectML, etc.) puede usarla, pero no es imprescindible.
- Opciones de despliegue: ONNX Runtime (ORT) en Python, C++ o C#; tambien puede convertirse a otros formatos (TensorRT, OpenVINO) si se desea optimizar.
- Latencia y throughput: no disponibles. Dado el tamaño y la cuantizacion, se espera una latencia de decenas de milisegundos en CPU moderna para una imagen de 640x640, pero no hay datos oficiales.

## Comparativa con modelos similares

| Modelo | Formato | Clases | Tamaño | Licencia | Notas |
|---|---|---|---|---|---|
| `Sundowner123/comic-text-and-bubble-detector` (este) | ONNX int8 | 3 (bubble, text_bubble, text_free) | 11 MB | Apache-2.0 | Mirror de ogkalu, usado en TranslateApp |
| `ogkalu/comic-text-and-bubble-detector` | ONNX (varias versiones) | 3 | no disponible | Apache-2.0 | Modelo original, incluye versiones fp32 y int8 |
| `dmMaze/comic-text-detector` | PyTorch / ONNX | texto (sin burbujas) | no disponible | no disponible | Detecta lineas de texto, no burbujas; usa anotaciones de manga-image-translator |

La comparativa se limita a estos dos modelos porque no hay mas alternativas publicas conocidas en la informacion disponible. `dmMaze/comic-text-detector` se centra en deteccion de texto, no de burbujas, por lo que no es directamente comparable en funcionalidad.

## Limitaciones y advertencias

- No se dispone de informacion sobre sesgos del modelo, pero al ser un detector de objetos entrenado probablemente con datos de manga y comics, puede tener un rendimiento inferior en estilos de dibujo muy diferentes (occidental, europeo, etc.).
- Riesgo de alucinacion: no aplica, al ser un modelo discriminativo de deteccion, no generativo. Sin embargo, puede producir falsos positivos (detectar burbujas donde no las hay) con umbrales bajos.
- Limitaciones de contexto: no aplica, pero la resolucion fija de entrada (640x640) puede perder detalle en paginas muy densas o con texto pequeno.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero exige conservar el aviso de licencia y notificacion (LICENSE y NOTICE) en las redistribuciones, segun indica la model card.
- Caveat de produccion: al ser un mirror byte-identico, cualquier actualizacion o correccion del modelo original no se reflejara automaticamente en este repositorio. Se recomienda seguir el repositorio original para obtener versiones nuevas.
- No incluye OCR: el modelo solo detecta regiones, no transcribe texto. Para una solucion completa de traduccion se necesita un OCR adicional.

## Enlaces

- Repositorio HuggingFace de este modelo: https://huggingface.co/Sundowner123/comic-text-and-bubble-detector
- Modelo original: https://huggingface.co/ogkalu/comic-text-and-bubble-detector
- Repositorio del modelo original (arbol de archivos): https://huggingface.co/ogkalu/comic-text-and-bubble-detector/tree/main
- Proyecto alternativo de deteccion de texto en manga/comic: https://github.com/dmMaze/comic-text-detector
