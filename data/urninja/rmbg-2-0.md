# UrNinja/RMBG-2.0

## Resumen

RMBG-2.0 (Background Removal v2.0) es un modelo de segmentación dicotómica de imagen desarrollado por BRIA AI y pensado para separar el primer plano del fondo en fotografías. El repositorio analizado, `UrNinja/RMBG-2.0`, es una copia espejo de terceros del modelo original de BRIA AI: cuenta con 0 descargas y 0 likes, fue creado el 11 de octubre de 2026 y no añade documentación propia más allá de la model card del autor original.

A diferencia de un modelo generativo de texto, la salida de RMBG-2.0 es un *alpha matte* monocanal de 8 bits en escala de grises, donde cada píxel indica su nivel de opacidad. Al no ser una máscara binaria, el desarrollador puede fijar umbrales personalizados de separación primer plano/fondo según su caso de uso, lo que facilita su integración en pipelines de edición más complejos.

El modelo emplea una arquitectura transformer para segmentación de imagen (los detalles concretos del backbone no se especifican en la información disponible) y suma 220.700.242 parámetros en formato safetensors, con un repositorio de 5,0 GB que incluye también pesos en ONNX y código personalizado. Se distribuye bajo licencia CC BY-NC 4.0, es decir, solo para uso no comercial, con acceso condicionado mediante formulario y licencia comercial aparte gestionada por BRIA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer para segmentacion de imagen (segmentacion dicotomica); backbone concreto no especificado en la informacion disponible |
| Parametros totales | 220.700.242 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de vision, no procesa secuencias de texto) |
| Tipos de cuantizacion | No disponible; el repositorio distribuye pesos en safetensors y ONNX, sin variantes cuantizadas documentadas |
| Idiomas soportados | No disponible (modelo de segmentacion de imagen, no procesa lenguaje) |
| Licencia | CC BY-NC 4.0 (`bria-rmbg-2.0`), solo uso no comercial; uso comercial requiere acuerdo con BRIA AI |
| Formato de pesos | safetensors, ONNX, PyTorch (requiere `trust_remote_code=True` por el tag `custom_code`) |
| Pipeline | image-segmentation |
| Tipo de salida | Alpha matte monocanal de 8 bits en escala de grises (no binario) |
| Tamano del repositorio | 5,0 GB |
| Biblioteca | transformers |
| Acceso | Repositorio con *gating*: formulario obligatorio (nombre, email, empresa, web, usuario de Discord y aceptacion de la politica de privacidad y terminos de BRIA) |

## Arquitectura y entrenamiento

BRIA RMBG-2.0 se define en su model card como un modelo de segmentación dicotómica entrenado exclusivamente con un dataset de grado profesional. La salida es un alpha matte de un solo canal y 8 bits, no una máscara binaria, de modo que cada valor de píxel representa su nivel de opacidad y el umbral de separación queda a criterio del integrador. No se detalla en la información disponible el tipo de backbone, el mecanismo de atención ni el número de tokens de entrenamiento.

El entrenamiento se realizó sobre más de 15.000 imágenes de alta resolución, etiquetadas manualmente a nivel de píxel y con licencia completa. La distribución de categorías declarada parcialmente en la model card es: objetos solos, 45,11 %; personas con objetos o animales, 25,24 %; el resto de categorías queda truncado en la información extraída. BRIA indica que su benchmark interno incluyó equilibrio de género, equilibrio étnico y personas con distintos tipos de discapacidad, y que el dataset cubre imágenes de stock generales, comercio electrónico, videojuegos y publicidad. No se documentan en la información disponible fases de RLHF, DPO ni técnicas de optimización de inferencia como decodificación especulativa.

## Capacidades

- Segmentación de primer plano y fondo en imágenes de categorías variadas: producto, personas, objetos, animales, contenido de stock, e-commerce, gaming y publicidad.
- Generación de alpha mattes de 8 bits con niveles de opacidad, lo que permite aplicar umbrales personalizados en lugar de una máscara binaria fija.
- Mejora declarada respecto a RMBG v1.4 en precisión, eficiencia y versatilidad, según la propia model card (sin cifras publicadas).
- Ejecución en el ecosistema transformers, con soporte de código personalizado vía `trust_remote_code=True`.
- Exportación a ONNX y uso en navegador mediante transformers.js, según los tags del repositorio.
- Integración en flujos de ComfyUI a través de la API de BRIA, según la documentación enlazada.
- No dispone de capacidades de generación de texto, razonamiento, código, matemáticas, tool calling ni agentes; es un modelo puramente visual de segmentación.

## Casos de uso

- Fotografía de producto para comercio electrónico: el modelo aísla el producto sobre fondo neutro para generar imágenes de catálogo consistentes; su entrenamiento con un 45,11 % de imágenes de objetos solos lo hace adecuado para este escenario.
- Sustitución de fondo en retratos y fotografía corporativa: al estar entrenado con personas de distintos géneros, etnias y con discapacidades, reduce el riesgo de fallos sistemáticos en perfiles infrarrepresentados.
- Rotoscopia asistida en postproducción audiovisual: el alpha matte no binario permite ajustar el umbral por plano y refinar bordes (pelo, cristal, tejidos) antes de la composición final.
- Preprocesado para pipelines generativos (img2img, inpainting, cambio de fondo): la máscara generada alimenta modelos de difusión en ComfyUI para recomponer escenas controladas por zonas.
- Limpieza masiva de catálogos y activos de marketing: al procesar imágenes de stock y publicidad, encaja en procesos por lotes de miles de imágenes donde se requiere una licencia de datos trazable.
- Edición en navegador o en cliente: gracias a la exportación ONNX y al soporte de transformers.js, la inferencia puede ejecutarse en el dispositivo sin enviar las imágenes a un servidor, lo que ayuda con requisitos de privacidad.
- Cumplimiento legal en contenido generado: el modelo se entrena con datasets con licencia completa y el repositorio incluye el tag `legal liability`, orientado a organizaciones que necesitan justificar el origen de los datos y mitigar sesgos.
- Automatización vía API en producción: BRIA ofrece endpoints gestionados (Bria.ai, fal.ai, Replicate) para integraciones donde no se quiere mantener infraestructura de GPU propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card afirma que la precisión, eficiencia y versatilidad del modelo "rivalizan con los principales modelos de código disponible", pero no incluye cifras concretas de métricas como IoU, S-measure, F-measure o MAE, ni comparaciones numéricas con RMBG v1.4 u otros modelos.

## Requisitos de hardware

- Peso de los parametros en memoria: aproximadamente 883 MB en FP32 y 441 MB en FP16/BF16 para los 220,7 millones de parámetros (estimación calculada a partir del recuento de parámetros, no un dato publicado).
- VRAM estimada para inferencia: en el rango de 2 a 4 GB considerando pesos y activaciones a resoluciones habituales de imagen; 4 GB o más es una cifra prudente para entradas de alta resolución y lotes pequeños.
- GPU consumer: cabe con holgura en tarjetas de gama media y alta con 6-8 GB de VRAM o más (por ejemplo, serie RTX 3060 en adelante); también puede ejecutarse en CPU para lotes pequeños, con mayor latencia.
- GPU de centro de datos: A100, H100, L40S o T4 son válidas y sobredimensionadas para este tamaño de modelo; el cuello de botella real suele ser la resolución de entrada y el preprocesado, no la memoria de pesos.
- Opciones de despliegue: transformers con `trust_remote_code=True`, runtime de ONNX, transformers.js para navegador, y la API gestionada de BRIA, además de nodos de ComfyUI a través de su API. No se documentan soportes específicos para vLLM, llama.cpp, Ollama o TGI, que son herramientas orientadas a modelos de lenguaje.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Nota: el repositorio ocupa 5,0 GB, muy por encima del peso teórico de los parámetros, lo que sugiere que incluye varias copias de los pesos en distintos formatos; conviene revisar el contenido antes de descargarlo completo.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados en la informacion proporcionada. La model card cita únicamente a RMBG v1.4 como predecesor al que este modelo "mejora significativamente", sin cifras. La siguiente tabla recoge la comparación con la información disponible, marcando como "no disponible" todo dato ausente:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Datos comparativos |
|---|---|---|---|---|---|
| UrNinja/RMBG-2.0 (espejo de BRIA RMBG v2.0) | 220.700.242 | No aplica | CC BY-NC 4.0 (no comercial) | HuggingFace, ONNX, transformers.js, ComfyUI, API | No disponible |
| BRIA RMBG v1.4 | No disponible | No aplica | No disponible | HuggingFace (briaai) | La model card afirma mejora cualitativa, sin numeros |
| Otros modelos de eliminacion de fondo de codigo disponible (por ejemplo, BiRefNet o U2Net) | No disponible | No aplica | No disponible | No disponible | No disponible en la informacion proporcionada |

## Limitaciones y advertencias

- Licencia estrictamente no comercial: CC BY-NC 4.0. Cualquier uso comercial (incluido uso indirecto por parte de una empresa con animo de lucro) requiere un acuerdo de licencia separado con BRIA AI.
- Acceso condicionado: el repositorio original exige rellenar un formulario con datos personales y corporativos y aceptar la politica de privacidad y los terminos de BRIA, por lo que no es una descarga anonima.
- Este repositorio concreto es un espejo de terceros con 0 descargas y 0 likes; no hay garantia de que los pesos o el codigo se correspondan exactamente con la version oficial de BRIA AI ni de que se mantengan actualizados.
- Riesgo de segmentacion incorrecta en dominios alejados del dataset de entrenamiento (imagen medica, satelital, microscopia, documentos); la model card no documenta evaluacion en esos ambitos.
- Sesgos potenciales derivados del dataset: aunque se declara equilibrio de genero, etnia y presencia de personas con discapacidad, la distribucion esta dominada por objetos solos (45,11 %) y personas con objetos o animales (25,24 %), por lo que el rendimiento puede degradarse en categorias minoritarias.
- Dependencia de `custom_code`: la carga del modelo requiere `trust_remote_code=True`, lo que implica ejecutar codigo del repositorio; conviene auditar ese codigo antes de usarlo en produccion.
- Salida en escala de grises de 8 bits: la precision del matte esta limitada a 256 niveles de opacidad; en bordes muy finos o materiales translucidos puede ser insuficiente sin refinamiento posterior.
- Ausencia de benchmarks publicos verificables: no se pueden establecer garantias cuantitativas de calidad frente a alternativas, solo la afirmacion cualitativa del fabricante.
- Idiomas y contexto: el modelo no procesa texto ni lenguaje, por lo que no aplican requisitos linguisticos ni de ventana de contexto, pero tampoco puede usarse para tareas multimodales de texto.
- La model card consultada esta truncada en la tabla de distribucion del dataset, por lo que no se conocen todas las categorias de entrenamiento.

## Enlaces

- Modelo en HuggingFace (espejo): https://huggingface.co/UrNinja/RMBG-2.0
- Repositorio oficial de BRIA AI en HuggingFace: https://huggingface.co/briaai/
- Demo oficial en HuggingFace Spaces: https://huggingface.co/spaces/briaai/BRIA-RMBG-2.0
- Repositorio GitHub de RMBG-2.0: https://github.com/Bria-AI/RMBG-2.0
- Nodos de ComfyUI para la API de BRIA: https://github.com/Bria-AI/ComfyUI-BRIA-API
- Licencia CC BY-NC 4.0: https://creativecommons.org/licenses/by-nc/4.0/deed.en
- Web de BRIA AI: https://bria.ai/
- Blog de BRIA AI: https://blog.bria.ai/
- Documentacion de la API (background remove): https://docs.bria.ai/image-editing/v2-endpoints/background-remove
- Endpoint en fal.ai: https://fal.ai/models/fal-ai/bria/background/remove
- Endpoint en Replicate: https://replicate.com/bria/remove-background
- Formulario de licencia comercial: https://share-eu1.hsforms.com/2sj9FVZTGSFmFRibDLhr_ZAf4e04
- Comunidad de Discord de BRIA: https://discord.gg/Nxe9YW9zHS
