# visualseed/deobjectify-models

## Resumen

De-Objectify pre-built models es un repositorio de HuggingFace publicado por el usuario `visualseed` que aloja instalaciones pre-convertidas a Core ML para la aplicación De-Objectify, una herramienta de eliminación de objetos e inpainting que se ejecuta en local sobre Apple silicon. No se trata de un unico modelo, sino de un catalogo de artefactos: cada entrada es una carpeta de instalacion ya compilada que la propia aplicacion produce mediante su receta, validada en la maquina de referencia, comprimida sin modificar y fijada por hash sha256 en el catalogo de la app. Una instalacion desde este repositorio es, segun el autor, byte a byte identica a construir el modelo en la propia maquina.

El repositorio redistribuye derivados de varios modelos base de difusion para inpainting: Stable Diffusion 1.5 inpainting, Stable Diffusion 2.1 inpainting, SDXL 1.0 inpainting, SDXL con la fase 2 del LoRA de eliminacion OSOR fusionada, SDXL RORem destilado con LCM a 4 pasos, y dos variantes de FLUX.2 Klein 4B (una de inpainting puro y otra con el LoRA de eliminacion de objetos de fal fusionado). El tamano total del repositorio es de 37,6 GB.

Su relevancia actual radica en que empaqueta pipelines de difusion de gama alta para inferencia totalmente local y on-device en el ecosistema Apple, sin depender de servicios en la nube, ofreciendo simultaneamente la ruta de "descargar el artefacto ya hecho" y la de "construirlo uno mismo". El modelo no publica tarjeta con arquitectura, parametros, contexto, idiomas ni benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelos de difusion latente para inpainting (familias Stable Diffusion y FLUX) convertidos a Core ML |
| Parametros totales | No disponible (varia por artefacto; el repositorio no publica conteos. La variante FLUX.2 Klein es de 4B segun su nombre) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (se distribuyen artefactos Core ML ya compilados, no pesos sueltos) |
| Idiomas soportados | No disponible |
| Licencia | Mixta (mixed-model-licenses): CreativeML Open RAIL-M, CreativeML Open RAIL++-M y Apache-2.0 segun el artefacto |
| Formato de pesos | Core ML (contenido dentro de archivos `.zip`; no se ofrecen safetensors ni GGUF) |

Artefactos incluidos en el repositorio:

| Artefacto | Descripcion | Modelo(s) base | Licencia |
|---|---|---|---|
| `sd15-inpaint.zip` | Inpainting con Stable Diffusion 1.5 | stable-diffusion-v1-5/stable-diffusion-inpainting | CreativeML Open RAIL-M |
| `sd21-inpaint.zip` | Inpainting con Stable Diffusion 2.1 | sd2-community/stable-diffusion-2-inpainting | CreativeML Open RAIL++-M |
| `sdxl-inpaint.zip` | Inpainting con SDXL 1.0 | diffusers/stable-diffusion-xl-1.0-inpainting-0.1 | CreativeML Open RAIL++-M |
| `sdxl-remove.zip` | SDXL inpainting con la fase 2 del LoRA de eliminacion OSOR fusionada | SDXL Inpainting 0.1 + QinmingZhou/OSOR (variante SDXL) | CreativeML Open RAIL++-M |
| `sdxl-rorem.zip` | SDXL RORem, eliminacion destilada con LCM a 4 pasos (LoRA fusionada) | visualseed/RORem-merged (LetsThink/RORem sobre SDXL) | Apache-2.0 (aplica por herencia SDXL RAIL++-M) |
| `flux2-klein-remove.zip` | FLUX.2 Klein 4B inpainting con el LoRA de eliminacion de objetos de fal fusionado | black-forest-labs/FLUX.2-klein-4B + fal/flux-2-klein-4B-object-remove-lora | Apache-2.0 |
| `flux2-klein-inpaint.zip` | FLUX.2 Klein 4B inpainting | black-forest-labs/FLUX.2-klein-4B | Apache-2.0 |

## Arquitectura y entrenamiento

El repositorio no entrena modelos nuevos: distribuye derivados ya convertidos de modelos de difusion de inpainting de terceros. La arquitectura subyacente es la de difusion latente clasica (un codificador/decodificador VAE, un UNet o transformador de difusion y un codificador de texto) en sus variantes SD 1.5, SD 2.1, SDXL 1.0 y FLUX.2 Klein, todas adaptadas a la tarea de inpainting, es decir, reconstruir la region enmascarada de una imagen a partir de una mascara y un prompt de texto. La innovacion del repositorio no esta en el entrenamiento sino en el empaquetado: cada artefacto es la carpeta de instalacion exacta que produce la receta de catalogo de la aplicacion, convertida a Core ML y validada, lista para descomprimirse en la carpeta Models de la app.

Dos artefactos incorporan ajustes especificos. `sdxl-remove.zip` fusiona la fase 2 del LoRA de eliminacion de objetos OSOR sobre SDXL Inpainting 0.1. `sdxl-rorem.zip` usa RORem-merged, un modelo destilado con LCM (Latent Consistency Models) que permite eliminacion en 4 pasos, lo que reduce sustancialmente el coste de inferencia. `flux2-klein-remove.zip` fusiona el LoRA de eliminacion de objetos de fal sobre FLUX.2 Klein 4B. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF/DPO para los modelos base.

La distribucion se organiza por estructura de carpetas: los artefactos de la familia SD descomprimen un arbol `Resources/`, mientras que los de FLUX usan un layout plano, de modo que la extraccion deja exactamente lo que genera la receta.

## Capacidades

- Eliminacion de objetos en imagenes: dado un objeto a borrar y su region enmascarada, el modelo rellena la zona con contenido coherente con el fondo, sin dejar rastro del objeto original.
- Inpainting generativo: reconstruccion o sustitucion de regiones de una imagen guiada por una mascara y, en su caso, por un prompt de texto.
- Inferencia completamente on-device en Apple silicon: al distribuirse como Core ML, la ejecucion se realiza en el propio dispositivo, sin enviar imagenes a un servidor.
- Dos rutas de obtencion del modelo: descargar el artefacto precompilado o reconstruirlo localmente con la receta del asistente de la aplicacion, con resultado identico segun el autor.
- Eliminacion acelerada en la variante RORem: el artefacto SDXL RORem usa destilacion LCM para completar la eliminacion en 4 pasos.
- Variantes de calidad y coste: desde SD 1.5 (mas ligero) hasta SDXL y FLUX.2 Klein 4B (mayor calidad y mayor coste computacional).
- El repositorio no declara soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision general, audio ni modo de pensamiento, ya que su proposito es exclusivamente la edicion de imagen por inpainting.

## Casos de uso

- Retoque fotografico personal: eliminar objetos no deseados (cables, papeleras, transeuntes) de fotografias tomadas con el movil, ejecutando todo en el dispositivo sin subir las imagenes a ningun servicio.
- Limpieza de fotografias de inmobiliaria: borrar carteles, muebles sueltos o elementos temporales de las fotos de una vivienda antes de publicarlas, con la variante SDXL para mayor fidelidad de texturas.
- Fotografia de producto en comercio electronico: retirar soportes, etiquetas o elementos de atrezzo del fondo para dejar el producto aislado sobre un fondo limpio.
- Proteccion de privacidad: eliminar personas, matriculas o senales identificativas de imagenes antes de compartirlas, gracias a la ejecucion local que evita exponer el material a terceros.
- Restauracion de fotografias antiguas: rellenar zonas danadas, manchas o rasgaduras mediante inpainting, usando la mascara sobre la region deteriorada.
- Creacion de contenido para redes: sustituir o eliminar elementos de una escena para componer variantes de una misma imagen sin recurrir a edicion manual con herramientas de escritorio.
- Flujos de edicion en lote dentro de una app macOS o iOS: al ser artefactos Core ML integrables en la app De-Objectify, permiten automatizar la eliminacion repetitiva sobre muchas imagenes en el propio dispositivo.
- Desarrollo y evaluacion de pipelines de inpainting: comparar en la misma maquina variantes SD 1.5, SD 2.1, SDXL y FLUX.2 Klein para decidir el equilibrio entre velocidad y calidad en un producto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Plataforma: exclusivamente Apple silicon, dado que los artefactos son modelos Core ML. No hay rutas oficiales para GPU NVIDIA/AMD ni para CPU x86 en este repositorio.
- Memoria: el repositorio ocupa 37,6 GB en total, repartidos entre siete artefactos; cada uno se instala por separado, por lo que el espacio en disco depende del artefacto elegido.
- Memoria unificada: al ejecutarse sobre Apple silicon, el modelo consume memoria unificada compartida entre CPU y GPU. No se publican cifras de VRAM ni de memoria minima por artefacto, por lo que el dato concreto no esta disponible.
- Cabe en hardware de consumo: si, es el objetivo del proyecto; se ejecuta sobre dispositivos Apple (iPhone, iPad y Mac con chips de la serie M). No se detallan los modelos minimos soportados.
- Opciones de despliegue: Core ML a traves de la aplicacion De-Objectify. No se declara soporte para vLLM, llama.cpp, Ollama ni TGI, que ademas no son herramientas aplicables a modelos de difusion Core ML.
- Latencia y throughput: no disponibles. La unica referencia de rendimiento es cualitativa, la variante SDXL RORem usa destilacion LCM para operar en 4 pasos, lo que reduce el numero de evaluaciones del modelo frente a la difusion estandar.

## Comparativa con modelos similares

Dentro del propio repositorio, la comparativa entre artefactos es la siguiente (los datos de rendimiento no estan publicados):

| Artefacto | Modelo base | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|
| `sd15-inpaint.zip` | Stable Diffusion 1.5 | Inpainting estandar | CreativeML Open RAIL-M | Core ML, en este repo |
| `sd21-inpaint.zip` | Stable Diffusion 2.1 | Inpainting estandar | CreativeML Open RAIL++-M | Core ML, en este repo |
| `sdxl-inpaint.zip` | SDXL 1.0 | Inpainting de mayor resolucion | CreativeML Open RAIL++-M | Core ML, en este repo |
| `sdxl-remove.zip` | SDXL 1.0 + OSOR | Eliminacion de objetos con LoRA fusionada | CreativeML Open RAIL++-M | Core ML, en este repo |
| `sdxl-rorem.zip` | SDXL + RORem (LCM) | Eliminacion en 4 pasos | Apache-2.0 (por herencia SDXL RAIL++-M) | Core ML, en este repo |
| `flux2-klein-remove.zip` | FLUX.2 Klein 4B + LoRA de fal | Eliminacion de objetos con LoRA fusionada | Apache-2.0 | Core ML, en este repo |
| `flux2-klein-inpaint.zip` | FLUX.2 Klein 4B | Inpainting puro | Apache-2.0 | Core ML, en este repo |

Frente a alternativas externas de inpainting (por ejemplo, los propios repositorios de los modelos base en formato diffusers/safetensors), la diferencia principal es el formato: aqui se sirve exclusivamente Core ML para Apple silicon, mientras que los repositorios de origen no ofrecen ese empaquetado. No se dispone de datos comparativos de rendimiento numerico con otros modelos de la misma categoria.

## Limitaciones y advertencias

- Licencia mixta: el repositorio agrupa derivados con licencias distintas. Las variantes de la familia Stable Diffusion se rigen por CreativeML Open RAIL-M o RAIL++-M (con restricciones de uso), y las de FLUX.2 Klein y RORem por Apache-2.0. El uso de cada artefacto queda sujeto a la licencia de su modelo base, segun indica LICENSES.md.
- Restricciones RAIL: las licencias CreativeML Open RAIL incluyen clausulas de uso responsable que limitan determinados usos; conviene revisarlas antes de un despliegue comercial.
- Dependencia de plataforma: al ser Core ML, no hay ruta de ejecucion fuera del ecosistema Apple silicon, lo que limita su uso en servidores con GPU NVIDIA o en entornos Linux/Windows.
- Riesgo de artefactos generativos: como todo modelo de difusion aplicado a inpainting, puede producir resultados poco realistas, bordes incoherentes o contenido inventado en la region reconstruida (alucinacion visual) cuando la mascara o el prompt no son precisos.
- Ausencia de benchmarks: el repositorio no publica metricas de calidad (PSNR, FID, LPIPS ni similares), por lo que no es posible comparar objetivamente su rendimiento con alternativas.
- Idiomas: la informacion disponible no especifica idiomas soportados; la interaccion por prompt depende del codificador de texto del modelo base y no esta documentada aqui.
- Enlaces incompletos: la model card cita la aplicacion De-Objectify con un enlace generico a GitHub (`https://github.com`) que no apunta a un repositorio concreto, lo que dificulta localizar la app o su documentacion.
- Estado del repositorio: cero descargas y cero "likes" en el momento de la consulta, y las fechas de creacion y actualizacion son de octubre de 2026, posteriores a la fecha de redaccion habitual de fichas, un detalle a verificar por el lector.
- Redistribucion, no autoría: el repositorio no aporta pesos entrenados desde cero, sino conversiones; la calidad final depende enteramente de los modelos base y de los LoRA fusionados.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/visualseed/deobjectify-models
- Licencias de los artefactos: https://huggingface.co/visualseed/deobjectify-models/blob/main/LICENSES.md
- Aplicacion De-Objectify (enlace tal cual aparece en la model card): https://github.com
- Modelos base referenciados:
  - stable-diffusion-v1-5/stable-diffusion-inpainting: https://huggingface.co/stable-diffusion-v1-5/stable-diffusion-inpainting
  - sd2-community/stable-diffusion-2-inpainting: https://huggingface.co/sd2-community/stable-diffusion-2-inpainting
  - diffusers/stable-diffusion-xl-1.0-inpainting-0.1: https://huggingface.co/diffusers/stable-diffusion-xl-1.0-inpainting-0.1
  - QinmingZhou/OSOR: https://huggingface.co/QinmingZhou/OSOR
  - LetsThink/RORem: https://huggingface.co/LetsThink/RORem
  - visualseed/RORem-merged: https://huggingface.co/visualseed/RORem-merged
  - black-forest-labs/FLUX.2-klein-4B: https://huggingface.co/black-forest-labs/FLUX.2-klein-4B
  - fal/flux-2-klein-4B-object-remove-lora: https://huggingface.co/fal/flux-2-klein-4B-object-remove-lora
