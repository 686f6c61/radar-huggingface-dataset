# techycoder/isnet-background-removal

## Resumen

ISNet es un modelo de segmentación de imagen dicotómica (DIS, *Dichotomous Image Segmentation*) orientado a la extracción de primer plano con bordes de alta precisión. Esta ficha concreta documenta la variante publicada por el usuario `techycoder` en Hugging Face: una conversión a fp16 del modelo **ISNet general-use** en formato ONNX, pensada para ejecutarse íntegramente en el navegador mediante ONNX Runtime Web (WebGPU o WebAssembly). El modelo original procede del artículo *Highly Accurate Dichotomous Image Segmentation* (Qin et al., ECCV 2022) y los pesos base son los distribuidos por el proyecto rembg.

La aportación de este repositorio no es un reentrenamiento ni una modificación arquitectónica, sino una conversión de precisión: los pesos y los cálculos internos pasan de float32 a float16 manteniendo los tipos de entrada y salida en float32 (`keep_io_types=True`). El resultado es un único archivo ONNX de unos 90,6 MB, aproximadamente la mitad que su equivalente fp32, lo que facilita su descarga y ejecución en el cliente.

Su relevancia actual reside en el escenario de despliegue: elimina la dependencia de un servidor para eliminar fondos de imágenes, de modo que los datos del usuario nunca salen del dispositivo. Es un modelo de nicho, sin métricas publicadas en la información disponible y con cero descargas en el momento de redactar esta ficha, pero técnicamente bien delimitado: entrada fija de 1024×1024, salida de máscara binaria normalizada y licencia Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ISNet (red de segmentación de imagen dicotómica, DIS); detalles internos de capas no disponibles en la información proporcionada |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantización | fp16 (conversión desde fp32 con `onnxconverter-common` 1.14.0); no se documentan otras variantes en este repo |
| Idiomas soportados | no disponible (modelo de imagen, sin procesamiento de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`model_fp16.onnx`, 90.662.600 bytes) |

## Arquitectura y entrenamiento

El modelo base es ISNet, presentado en el artículo *Highly Accurate Dichotomous Image Segmentation* (ECCV 2022). La tarea DIS consiste en separar un objeto altamente detallado de su fondo con precisión a nivel de píxel, incluyendo estructuras finas como pelo, ramas o transparencias. La información disponible no detalla la composición interna de la red (número de capas, mecanismos de atención ni diseño del decoder), por lo que esos datos deben consultarse en el repositorio original del paper.

El repositorio de `techycoder` no incluye entrenamiento adicional. La única transformación aplicada es la conversión de precisión: pesos y cómputo interno pasan a float16 mediante `onnxconverter-common` 1.14.0 con `keep_io_types=True`, de forma que la interfaz externa permanece en float32. El autor indica que la salida coincide con la del modelo float32 dentro de la precisión de fp16. El punto de partida es `isnet-general-use.onnx` del proyecto rembg, con SHA-256 `60920e99c45464f2ba57bee2ad08c919a52bbf852739e96947fbb4358c0d964a`.

El preprocesado es fijo y debe respetarse: entrada `input_image` de tipo float32 con forma `[1, 3, 1024, 1024]` en RGB, cada píxel dividido por el valor máximo de la imagen y restado 0,5. La salida es float32 `[1, 1, 1024, 1024]`; para obtener la máscara de primer plano en el rango 0..1 hay que aplicar una normalización min-max.

## Capacidades

- Segmentación de primer plano con una única máscara de salida (segmentación dicotómica: objeto frente a fondo).
- Extracción de bordes finos y estructuras detalladas, objetivo central del diseño DIS.
- Ejecución en navegador mediante ONNX Runtime Web, con backend WebGPU o WebAssembly.
- Procesamiento local: la imagen no se transmite a ningún servidor.
- Entrada de resolución fija 1024×1024; no se documenta soporte de resoluciones variables.
- No dispone de generación de texto, razonamiento, código, matemáticas, tool calling, agentes ni capacidades multilingües.
- No se documentan modos especiales (thinking, visión multimodal, audio) más allá de la segmentación de imagen.

## Casos de uso

- Eliminación de fondos en herramientas web de edición de imagen: el modelo se carga como `model_fp16.onnx` en el cliente y procesa la imagen del usuario con ONNX Runtime Web, de modo que la foto nunca se sube a un servidor. Adecuado por su tamaño contenido y su licencia permisiva.
- Herramientas de diseño gráfico y generación de avatares: generación de recortes con máscara fina para componer sobre nuevos fondos, aprovechando la precisión de borde de ISNet en pelo y contornos.
- Catalogación de producto en comercio electrónico: separación automática del producto respecto del fondo para generar imágenes con fondo blanco o transparente en un pipeline de preprocesado por lotes.
- Aplicaciones de privacidad por diseño: recorte de sujetos en fotos antes de almacenarlas o compartirlas, ejecutando el modelo localmente en el dispositivo del usuario.
- Procesado en entornos con conectividad limitada o coste de servidor cero: al ejecutarse en WebAssembly, funciona sin GPU dedicada y sin infraestructura de inferencia en la nube.
- Preprocesado para otros modelos de visión: generación de máscaras de primer plano que alimenten etapas posteriores (composición, matting, aumentación de datos) en un pipeline de ONNX Runtime.
- Prototipado e investigación en segmentación DIS: servir de referencia fp16 para comparar latencia y fidelidad frente al modelo fp32 de rembg.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor solo afirma que la salida del modelo fp16 coincide con la del modelo float32 dentro de la precisión de fp16; no se aportan métricas cuantitativas (IoU, F-measure, MAE) ni cifras de latencia o throughput.

## Requisitos de hardware

- Tamaño del artefacto: 90.662.600 bytes (unos 90,6 MB) en un único archivo ONNX fp16.
- VRAM estimada para inferencia: no disponible de forma oficial; con entrada fija de 1024×1024 y pesos fp16, el consumo es moderado y compatible con GPUs de gama media, pero no se han publicado cifras.
- GPU recomendadas: no disponibles en la información proporcionada. El despliegue previsto es en navegador con WebGPU, que aprovecha la GPU del cliente.
- Compatibilidad con GPU de consumo: previsiblemente sí en GPUs integradas y dedicadas modernas a través de WebGPU, y también en CPU mediante WebAssembly; sin cifras verificadas.
- Opciones de despliegue: ONNX Runtime Web (WebGPU o WebAssembly) es el escenario documentado; al ser un archivo ONNX estándar, también puede ejecutarse con ONNX Runtime en servidor, aunque el autor no lo documenta.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Formato | Precisión | Tamaño | Resolución de entrada | Licencia | Notas |
|---|---|---|---|---|---|---|
| techycoder/isnet-background-removal | ONNX | fp16 | ~90,6 MB | 1024×1024 fija | Apache 2.0 | Conversión fp16 de ISNet general-use para navegador |
| ISNet general-use (rembg) | ONNX | fp32 | no disponible | 1024×1024 | Apache 2.0 | Modelo de referencia del que deriva esta conversión |
| ISNet original (repo DIS) | PyTorch | fp32 | no disponible | no disponible | Apache 2.0 | Pesos y código originales del paper ECCV 2022 |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- No se han publicado métricas de calidad (IoU, F-measure, MAE) para esta conversión fp16; la única garantía es la equivalencia con fp32 dentro de la precisión fp16.
- La entrada está fijada a 1024×1024; las imágenes de otra resolución deben redimensionarse antes de la inferencia, lo que puede afectar a la precisión en objetos pequeños o muy alargados.
- El preprocesado es obligatorio y específico (división por el máximo de la imagen y resta de 0,5); un preprocesado distinto produce máscaras incorrectas.
- La salida requiere normalización min-max para interpretarse como máscara 0..1.
- No hay información sobre sesgos del modelo base; al ser un segmentador genérico, puede fallar en dominios muy alejados de sus datos de entrenamiento (imágenes médicas, satelitales, etc.).
- Licencia Apache 2.0: permite uso comercial y modificación con atribución y conservación del aviso de licencia; no se documentan restricciones adicionales.
- Repositorio con cero descargas y sin validación comunitaria en el momento de la ficha; conviene verificar el SHA-256 del archivo antes de usarlo en producción.
- El rendimiento real en navegador depende del soporte de WebGPU del cliente; el fallback a WebAssembly puede ser notablemente más lento (sin cifras publicadas).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/techycoder/isnet-background-removal
- Repositorio original de ISNet (DIS): https://github.com/xuebinqin/DIS
- Proyecto rembg (origen del ONNX base): https://github.com/danielgatis/rembg
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Artículo DIS (ECCV 2022), referencia citada por el autor: no se proporciona URL directa en la información disponible
