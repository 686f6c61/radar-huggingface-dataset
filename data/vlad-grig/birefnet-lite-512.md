# vlad-grig/birefnet-lite-512

## Resumen

birefnet-lite-512 es una reexportacion a ONNX del modelo BiRefNet_lite de ZhengPeng7, publicada por el usuario vlad-grig como espejo sin modificaciones de studioludens/birefnet-lite-512. Se trata de un modelo de segmentacion binaria de imagen (dichotomous image segmentation) orientado a la extraccion de primer plano y a la generacion de mattes alfa de alta calidad, es decir, la tarea que popularmente se conoce como "quitar el fondo" de una fotografia.

La diferencia clave frente al modelo original y frente a otras exportaciones ONNX es la resolucion de entrada: 512x512 en lugar de 1024x1024. Este recorte reduce el tamano de los tensores intermedios aproximadamente 4 veces y evita el fallo por falta de memoria (`std::bad_alloc`) que sufren las variantes de 1024x1024 en `onnxruntime-web`, tanto en el backend WebGPU como en WASM. El resultado es un modelo que se ejecuta integramente en el navegador, sin ida y vuelta al servidor, con pesos de 94 MB en fp16 y 183 MB en fp32.

El repositorio esta pensado para consumirse desde `@huggingface/transformers` (transformers.js) y se usa en produccion en Repper y en el plugin de WordPress Codeep Background Remover. La licencia es MIT tanto en esta copia como en el modelo base, lo que permite uso comercial sin restricciones de atribucion mas alla de la propia licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de referencia bilateral (BiRefNet) con backbone Swin Transformer y decodificador multi-escala con convoluciones deformables (`torchvision.ops.deform_conv2d`) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada fija de 512x512 pixeles) |
| Tipos de cuantizacion | fp32 (`onnx/model.onnx`, 183 MB) y fp16 (`onnx/model_fp16.onnx`, 94 MB). No se publican variantes int8 |
| Idiomas soportados | no disponible (modelo de imagen, sin componente de texto) |
| Licencia | MIT |
| Formato de pesos | ONNX (dos ficheros) + `config.json` + `preprocessor_config.json`; tamano total del repo 0,3 GB |
| Tarea (pipeline) | image-segmentation |
| Resolucion de entrada | 512x512, RGB, layout NCHW, tensor de entrada `input_image` |
| Normalizacion | ImageNet: media `[0.485, 0.456, 0.406]`, desviacion `[0.229, 0.224, 0.225]`, reescalado `1/255` |
| Salida | Logits de un solo canal a 512x512; requiere `sigmoid` externa para obtener el matte alfa en `[0, 1]` |
| Libreria declarada | transformers.js |
| Modelo base | ZhengPeng7/BiRefNet_lite |
| Dataset declarado | ZhengPeng7/DIS5K |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

BiRefNet (Bilateral Reference Network) es una arquitectura disenada especificamente para segmentacion dicotomica de imagen, la tarea de separar un objeto saliente de su fondo con un contorno lo mas preciso posible. Combina un backbone Swin Transformer que extrae caracteristicas jerarquicas con un decodificador multi-escala que concatena mapas de caracteristicas de distintas profundidades (concatenaciones de hasta 1024 vias) y aplica convoluciones deformables para ajustar la geometria de los bordes. El modelo base fue entrenado sobre el dataset DIS5K (Dichotomous Image Segmentation 5K), que es el unico dataset declarado en la model card.

Esta publicacion no aporta entrenamiento nuevo: es una conversion de formato. El proceso de exportacion resulto problematico porque las convoluciones deformables no tienen equivalente simbolico canonico en ONNX. Las rutas habituales fallan: el exportador `deform_conv2d_onnx_exporter` sin parchear lanza errores de propagacion de formas (`NoneType + int`) en PyTorch 2.0.1, 2.1.2 y 2.6.0; `torch.onnx.dynamo_export` falla con `DispatchError: No ONNX function for deform_conv2d`; y sustituir la convolucion deformable por una `Conv` simplificada produce un 62% de error por pixel, lo que la hace inservible. La solucion documentada es el parche de Kazuhito00 a `deform_conv2d_onnx_exporter` (con respaldo de `_get_tensor_dim_size` basado en stride), que solo funciona contra el trazador legacy de PyTorch 2.0.1, lo que obliga a reproducir el entorno con una imagen Docker fijada (Python 3.10, torch 2.0.1 y torchvision compatible).

La innovacion practica de este repositorio no esta en el modelo sino en la eleccion de resolucion. A 1024x1024, el decodificador genera tensores intermedios cuyo pico de memoria supera el heap de `onnxruntime-web`, fijado en unos 2-4 GB y no ampliable en tiempo de ejecucion; todas las combinaciones probadas (WebGPU fp16 en cascada, WebGPU fp32, WASM fp32) fallan con `std::bad_alloc` o accesos desalineados. Bajar a 512x512 reduce esos tensores 4 veces y ademas hace que el grafo use como maximo 7 buffers de almacenamiento por etapa de shader, dentro del limite de WebGPU (10 en adaptadores Apple Silicon antiguos, 16 en Chrome 146 o superior), de modo que no hace falta cirugia sobre el grafo.

## Capacidades

- Extraccion de primer plano y generacion de mattes alfa con valor continuo en `[0, 1]` (no solo mascara binaria), tras aplicar `sigmoid` a la salida.
- Segmentacion de objeto saliente (salient object detection) y segmentacion dicotomica de imagen en escenas generales.
- Matting de recorte (crop-level): dado que la entrada es pequeña, esta pensado para refinar el borde de un recorte ya existente, donde la perdida de resolucion respecto a la variante de 1024 no es apreciable segun las pruebas del autor.
- Inferencia integra en el cliente mediante transformers.js sobre WebGPU, con retroceso automatico a WASM en hardware no compatible.
- Ejecucion sin servidor: el modelo no requiere llamadas de red una vez descargados los pesos, lo que permite procesamiento local de imagenes potencialmente sensibles.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision-lenguaje, tool calling, capacidades de agente, modo de pensamiento ni soporte multilingue. Es un modelo puramente visual y mono-tarea.

## Casos de uso

- Refinado de matte en recortes de imagenes: en un flujo de extraccion de primer plano ya existente, se recorta la region de interes, se redimensiona a 512x512, se ejecuta el modelo y se aplica la mascara resultante al recorte original. Es exactamente el uso en produccion declarado en Repper.
- Quitar el fondo en el navegador sin subir archivos al servidor: un editor web puede cargar los 94 MB del modelo fp16 y procesar fotografias localmente, lo que evita costes de ancho de banda, latencia de subida y problemas de privacidad con imagenes de usuarios.
- Plugin de WordPress para eliminacion de fondos: es el caso de uso real del plugin Codeep Background Remover, que depende de este repositorio para no depender de un tercero. El modelo se ejecuta en el navegador del visitante o del editor.
- Escenarios con restricciones de memoria o dispositivos modestos: al ocupar menos de 200 MB en disco y requerir decenas de MB de memoria de trabajo, la variante de 512 encaja en portatiles, tablets y telefonos donde la version de 1024 no arranca.
- Generacion de recortes para catalogos de producto: procesar lotes de fotografias de e-commerce para obtener PNG con transparencia, integrable en un pipeline de CI/CD que invoque ONNX Runtime sobre CPU.
- Segmentacion previa a otras tareas de vision: usar el matte como mascara para composicion, cambio de fondo, aumento de datos o entrada de un segundo modelo (por ejemplo, clasificacion sobre el objeto aislado).
- Procesamiento por lotes en el borde (edge) o en aplicaciones de escritorio empaquetadas con Electron/ONNX Runtime, sin dependencia de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas como S-measure, F-measure, MAE ni IoU sobre DIS5K, ni comparaciones numericas de calidad con BiRefNet_lite a 1024.

El unico dato cuantitativo de validacion presente es sobre el proceso de exportacion, no sobre calidad del modelo:

| Prueba de exportacion | Enfoque | Resultado |
|---|---|---|
| PyTorch 2.0.1 / 2.1.2 / 2.6.0 | `deform_conv2d_onnx_exporter` sin parchear | Error `NoneType + int`, formas no propagadas |
| PyTorch 2.6.0 | `torch.onnx.dynamo_export` | `DispatchError: No ONNX function for deform_conv2d` |
| PyTorch 2.6.0 | `Conv` simbolica simplificada (elimina el offset) | Exporta, pero 62% de error por pixel; inservible |

## Requisitos de hardware

- VRAM en inferencia: los pesos ocupan 94 MB (fp16) o 183 MB (fp32). Los requisitos reales los marcan las activaciones a 512x512, sensiblemente menores que las de la variante de 1024 que provoca OOM; el dato exacto de pico de memoria no esta publicado.
- GPU recomendadas: no hay una lista publicada. Funciona con cualquier adaptador que exponga WebGPU en el navegador (por ejemplo, Apple Silicon, GPUs integradas recientes) y con CPU mediante WASM. En servidor, cualquier GPU con soporte de ONNX Runtime CUDA sirve; una RTX 4090, A100 o H100 esta sobradamente dimensionada para este modelo.
- GPU de consumo: si, cabe con holgura en cualquier GPU de consumo, y de hecho esta pensado para ejecutarse en el propio navegador del usuario sin GPU dedicada.
- Limitacion de backend relevante: WebGPU debe respetar `maxStorageBuffersPerShaderStage`; el grafo a 512x512 usa como maximo 7 buffers por etapa, dentro del limite de 10 de adaptadores Apple Silicon antiguos y de 16 en Chrome 146 o superior.
- Opciones de despliegue: transformers.js con `AutoModel`/`AutoProcessor` y `device: 'webgpu'` (con retroceso a `wasm`), `onnxruntime-web`, y ONNX Runtime nativo (Python, C++, C#) para escritorio o servidor. vLLM, llama.cpp, Ollama y TGI no aplican, ya que son runtimes de modelos de lenguaje.
- Latencia y throughput: no disponible. Depende del backend (WebGPU frente a WASM), del dispositivo y de si el procesamiento es por imagen o por lote.

## Comparativa con modelos similares

| Modelo | Resolucion de entrada | Runtime / formato | Funciona en navegador | Licencia |
|---|---|---|---|---|
| vlad-grig/birefnet-lite-512 (esta ficha) | 512x512 | ONNX | Si | MIT |
| studioludens/birefnet-lite-512 | 512x512 | ONNX | Si | MIT |
| ZhengPeng7/BiRefNet_lite | 1024x1024 | PyTorch | No (no es ONNX) | MIT |
| onnx-community/BiRefNet_lite-ONNX | 1024x1024 | ONNX | No (OOM) | no disponible en la informacion proporcionada |

No se dispone de datos de benchmarks que permitan comparar la calidad de segmentacion de este modelo frente a alternativas de otras familias (por ejemplo, modelos tipo RMBG o SAM), por lo que esa comparacion queda como no disponible.

## Limitaciones y advertencias

- La entrada esta fija a 512x512. Para imagenes grandes hay que redimensionar a la baja y volver a subir el matte con interpolacion bilineal, lo que puede suavizar detalles finos como pelos o encajes; el autor sostiene que en recortes ya pequeños la diferencia con la referencia de 1024 no es apreciable en sus pruebas, pero no aporta metricas.
- La salida son logits en bruto. Si no se aplica `sigmoid`, los valores no son utilizables como matte. Es un paso que el integrador debe implementar.
- Este repositorio es un espejo, no el trabajo original. No hay garantia de mantenimiento, issues atendidos ni actualizaciones por parte de vlad-grig; las mejoras, si llegan, vendran del repositorio de studioludens o de ZhengPeng7.
- El campo `inference: false` de la model card indica que el widget de inferencia de HuggingFace no ejecutara el modelo; hay que consumirlo con transformers.js u ONNX Runtime desde una aplicacion propia.
- Riesgo de fallo en fondos complejos o de bajo contraste: como todo modelo de segmentacion saliente, puede equivocarse en escenas con multiples objetos candidatos, fondos con texturas similares al sujeto o transparencias reales (cristal, humo, agua).
- No hay datos publicados sobre sesgos por demografia, tono de piel, tipo de imagen ni dominio fotografico. Tampoco hay evaluacion de robustez fuera de DIS5K, por lo que el comportamiento en dominios muy distintos (imagen medica, satelite, documentos) no esta caracterizado.
- No soporta texto ni instrucciones: no se le puede pedir "quita solo el coche". Segmenta el objeto o los objetos salientes sin control semantico.
- Licencia MIT: permite uso comercial, modificacion y redistribucion, con la obligacion habitual de conservar el aviso de copyright y la licencia. Conviene verificar tambien las condiciones del modelo base ZhengPeng7/BiRefNet_lite, que la model card tambien declara MIT.
- Advertencia de produccion: el rendimiento depende del backend. WebGPU no esta disponible en todos los navegadores ni en todos los controladores, y el retroceso a WASM es mas lento; conviene medir la latencia en los dispositivos objetivo antes de fijar expectativas de experiencia de usuario.
- La busqueda web realizada no ha devuelto documentacion tecnica, papers ni articulos relacionados con este modelo concreto; los resultados obtenidos eran irrelevantes (empresas y canales de video no relacionados).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vlad-grig/birefnet-lite-512
- Repositorio original del que es espejo: https://huggingface.co/studioludens/birefnet-lite-512
- Modelo base: https://huggingface.co/ZhengPeng7/BiRefNet_lite
- Variante ONNX de 1024x1024: https://huggingface.co/onnx-community/BiRefNet_lite-ONNX
- Dataset declarado: https://huggingface.co/datasets/ZhengPeng7/DIS5K
- Documentacion de transformers.js: https://huggingface.co/docs/transformers.js
- Parche del exportador de convoluciones deformables: https://github.com/Kazuhito00/deform-conv2d-onnx-exporter
- Aplicacion que lo usa en produccion: https://repper.app
