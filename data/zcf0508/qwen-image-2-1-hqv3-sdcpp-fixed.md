# zcf0508/qwen-image-2.1-hqv3-sdcpp-fixed

## Resumen

Este repositorio contiene una version cuantizada en GGUF del modelo de generacion de imagenes Qwen-Image-2.1, distribuida con una correccion de metadatos que permite cargarla en stable-diffusion.cpp. No se trata de un modelo nuevo ni de un reentrenamiento: la cuantizacion la realizo el usuario realrebelai en su repositorio `realrebelai/Qwen-Image-2.1_GGUFs`, y el autor de este repositorio (zcf0508) unicamente ha reescrito la declaracion de forma de un unico tensor, `img_in.weight`, para que la herramienta de inferencia en C++ acepte el archivo. El repositorio es, por tanto, una pieza de compatibilidad entre dos ecosistemas: los GGUF exportados por el conversor de ComfyUI-GGUF y el cargador de stable-diffusion.cpp.

El problema que resuelve es concreto y esta documentado en la propia model card. El conversor de ComfyUI-GGUF reorganiza el tensor `img_in.weight` de `[64, 4096]` a `[256, 1024]` y guarda la forma original en la clave de metadatos `comfy.gguf.orig_shape.img_in.weight`; ComfyUI lo lee y restaura la forma por si mismo, pero stable-diffusion.cpp utiliza precisamente ese tensor para inferir el tamano de la red (`in_channels = ne[0]`, `hidden_size = ne[1]`). Con la forma reordenada, la herramienta construia una red con `hidden_size = 1024` en lugar de 4096 y abortaba con `model metadata validation failed`. La correccion devuelve la etiqueta a `[64, 4096]`; como 64 × 4096 = 256 × 1024 = 262144, el numero de elementos no cambia y, segun el autor, solo se modifican 3 bytes por archivo sin mover ningun dato de tensor.

Su relevancia es limitada pero practica: desbloquea la ejecucion offline de un modelo de generacion de imagenes de gran tamano en el ecosistema de stable-diffusion.cpp sobre GPU de consumo. El dato de parametros totales reportado en los metadatos de safetensors es de 7.115.124.736, aproximadamente 7,1 mil millones, y el repositorio ocupa 6,0 GB. El unico archivo publicado es `Qwen-Image-2.1-Q4-sd.cpp.gguf`, correspondiente a la cuantizacion Q4_K_M del repositorio original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible. Modelo de difusion para generacion de imagenes (pipeline declarado: text-to-image); la arquitectura interna del modelo base no se describe en la informacion proporcionada |
| Parametros totales | 7.115.124.736 (aproximadamente 7,1 mil millones), segun metadatos de safetensors del repositorio |
| Parametros activos | No aplica (no es un modelo de mezcla de expertos segun la informacion disponible) |
| Longitud de contexto | No aplica (no es un modelo de lenguaje; el modelo no expone ventana de contexto) |
| Tipos de cuantizacion | GGUF en Q4_K_M. El repositorio publica un unico archivo, `Qwen-Image-2.1-Q4-sd.cpp.gguf` |
| Idiomas soportados | No disponible |
| Licencia | `qwen-research` (etiquetada como `other` en HuggingFace), heredada de Qwen/Qwen-Image-2.1 |
| Formato de pesos | GGUF |
| Tamano del repositorio | 6,0 GB |
| Modelo base | Qwen/Qwen-Image-2.1 |
| Pipeline | text-to-image |
| Descargas / likes | 15 / 0 |
| Fecha de creacion | 2026-09-22 |

## Arquitectura y entrenamiento

No hay informacion sobre el entrenamiento del modelo base Qwen-Image-2.1 en la documentacion proporcionada: no se indican tokens de entrenamiento, composicion del dataset, ni si hubo fases de ajuste con preferencias humanas. Lo unico documentado en este repositorio es el proceso de cuantizacion (realizado por terceros) y la correccion de metadatos aplicada aqui. El detalle tecnico relevante es el papel de `img_in.weight` como tensor de proyeccion de entrada: stable-diffusion.cpp lo usa para deducir la configuracion de la red, leyendo `ne[0]` como numero de canales de entrada y `ne[1]` como tamano oculto. La reescritura de `[256, 1024]` a `[64, 4096]` restituye esos valores correctos sin alterar el contenido binario.

El autor incluye un script en la raiz del repositorio, `patch_gguf_img_in.py`, que aplica la misma correccion a archivos descargados previamente desde el repositorio original. El script usa unicamente la biblioteca estandar, no tiene dependencias de terceros y esta disenado para ser idempotente. Esto es relevante para quien quiera otras cuantizaciones (por ejemplo, niveles distintos de Q4 o Q5): basta con parchear los archivos del repositorio upstream en lugar de esperar a que se publiquen versiones corregidas. El autor advierte que la correccion es una reescritura de etiquetas, no una recomputacion: los hashes de los archivos diferiran de los originales pese a que los datos de tensor son identicos.

## Capacidades

- Generacion de imagenes a partir de texto (text-to-image), con el pipeline declarado por el repositorio.
- Inferencia verificada a 1024 × 1024 pixeles, 40 pasos y cfg 1.0 sobre stable-diffusion.cpp master-889 (commit c678dfe), en una RTX 4070 de 12 GB.
- Carga y ejecucion en stable-diffusion.cpp, que era el objetivo de la correccion de metadatos y no funcionaba con los archivos originales reordenados por ComfyUI-GGUF.
- Compatibilidad con el ecosistema ComfyUI-GGUF mediante los archivos originales del repositorio upstream, que conservan la clave `comfy.gguf.orig_shape.img_in.weight`.
- Aplicacion de la misma correccion a otros archivos GGUF del modelo mediante el script `patch_gguf_img_in.py`, con validacion estructural de elemento total, tabla de tensores y relectura de forma.
- No se documentan capacidades de tool calling, function calling, uso agentico, razonamiento multi-paso ni modo de pensamiento: no aplican a un modelo de generacion de imagenes.
- No se documenta soporte de audio, video, edicion de imagen, img2img o inpainting en la informacion disponible.
- Cobertura multiligue: no disponible.

## Casos de uso

- Generacion de imagenes offline en estaciones de trabajo con GPU de consumo: la unica ejecucion verificada publicada es una RTX 4070 de 12 GB generando a 1024 × 1024, lo que permite trabajar sin servicios en la nube ni dependencias de PyTorch.
- Integracion en pipelines nativos en C++: stable-diffusion.cpp evita el stack de Python, lo que resulta util para incrustar generacion de imagenes en aplicaciones de escritorio, herramientas internas o binarios distribuibles.
- Sustitucion de la ruta ComfyUI en entornos donde no se desea desplegar ComfyUI: el repositorio existe precisamente para servir a usuarios de stable-diffusion.cpp que no podian cargar los GGUF exportados por el conversor de ComfyUI.
- Reparacion de descargas existentes: quien ya haya bajado los archivos del repositorio `realrebelai/Qwen-Image-2.1_GGUFs` puede aplicar `patch_gguf_img_in.py` localmente en lugar de volver a descargar 6,0 GB.
- Generacion por lotes de recursos graficos (ilustracion, concept art, assets de prototipado) en un equipo unico, aprovechando el formato GGUF cuantizado para reducir el consumo de VRAM y de ancho de banda de disco.
- Auditoria y reproduccion de cuantizaciones: el repositorio documenta el diff exacto (forma del tensor, 3 bytes por archivo) y el procedimiento de parcheo, lo que facilita verificar que una cuantizacion de terceros no ha alterado los pesos.
- Publicacion de variantes corregidas para otras herramientas: el metodo de correccion es reutilizable para cualquier exportacion de ComfyUI-GGUF que vaya a consumirse desde cargadores que infieran la configuracion a partir de `img_in.weight`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan metricas objetivas de calidad (FID, CLIP score, evaluaciones humanas) ni comparaciones cuantitativas frente a otras cuantizaciones.

La unica validacion publicada es funcional y se recoge en esta tabla:

| Prueba | Ambito | Resultado |
|---|---|---|
| `Qwen-Image-2.1-Q4-sd.cpp.gguf` en stable-diffusion.cpp master-889 (commit c678dfe), RTX 4070 12 GB | Ejecucion extremo a extremo, 1024 × 1024, 40 pasos, cfg 1.0 | Correcta; el autor indica que la calidad visual es equivalente a la del Q4_K_M sin reordenar |
| Resto de niveles de cuantizacion | Validacion estructural (total de elementos, tabla de tensores autoconsistente, relectura de forma) | No verificados con generacion de imagen real |

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. El unico dato medido es que la cuantizacion Q4 funciona en una GPU de 12 GB (RTX 4070) a 1024 × 1024, 40 pasos y cfg 1.0.
- GPU recomendadas: no se publica una lista. Por el dato anterior, una GPU de 12 GB de VRAM es suficiente para el archivo Q4 en esa configuracion. Para resoluciones o lotes mayores se requiere mas memoria, pero no hay cifras publicadas.
- Cabe en GPU de consumo: si, al menos en la RTX 4070 de 12 GB empleada en la verificacion. No hay datos para GPUs con menos de 12 GB.
- Tamano en disco: 6,0 GB para el repositorio completo; el unico archivo publicado es la cuantizacion Q4.
- Opciones de despliegue: stable-diffusion.cpp (unico backend verificado end-to-end con este archivo); ComfyUI con el nodo GGUF para los archivos originales del repositorio upstream. vLLM, TGI, llama.cpp y Ollama no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. No se indica el tiempo de generacion por imagen ni imagenes por segundo.
- Precaucion practica: si se usa un backend distinto de stable-diffusion.cpp, comprobar que la forma declarada de `img_in.weight` sea la esperada por ese cargador, ya que la correccion es especifica para la logica de inferencia de configuracion de sd.cpp.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de modelos comparables en la informacion proporcionada. La comparacion posible se limita a las distintas fuentes del mismo modelo:

| Version | Formato | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|---|
| zcf0508/qwen-image-2.1-hqv3-sdcpp-fixed (este repositorio) | GGUF (Q4_K_M) | 7.115.124.736 | No aplica | qwen-research | 15 descargas, 0 likes | Forma de `img_in.weight` corregida a `[64, 4096]`; verificado en stable-diffusion.cpp |
| realrebelai/Qwen-Image-2.1_GGUFs | GGUF (varios niveles) | No disponible | No aplica | qwen-research (heredada) | No disponible | Cuantizacion original; `img_in.weight` en `[256, 1024]` con la forma original en metadatos; pensada para ComfyUI |
| Qwen/Qwen-Image-2.1 | Pesos completos (formato no indicado) | No disponible | No aplica | qwen-research | Modelo base publico | Modelo sin cuantizar del que derivan las dos entradas anteriores |

## Limitaciones y advertencias

- Ambito de validacion reducido: solo `Qwen-Image-2.1-Q4-sd.cpp.gguf` se ha probado generando imagenes de extremo a extremo. Los demas niveles de cuantizacion solo se han validado estructuralmente, no con inferencia real.
- La correccion no altera los pesos: modifica 3 bytes de metadatos por archivo (la declaracion de forma de `img_in.weight`). Los hashes no coinciden con los del repositorio original, aunque los datos de tensor sean identicos. Quien dependa de sumas de verificacion debe tenerlo en cuenta.
- Dependencia de la version del cargador: la correccion asume que stable-diffusion.cpp infiere `in_channels` y `hidden_size` a partir de `img_in.weight` (comprobado en master-889, commit c678dfe). Un cambio futuro en esa logica podria requerir otra correccion.
- Metadatos residuales: los archivos conservan la clave `comfy.gguf.orig_shape.img_in.weight`, por lo que herramientas que lean esa clave podrian comportarse de forma distinta a las que usan la forma declarada.
- Licencia: el modelo se distribuye bajo Qwen Research License. Se trata de una licencia de investigacion, no de una licencia permisiva generica; antes de cualquier uso comercial hay que revisar el texto completo enlazado en el repositorio. El repositorio de HuggingFace la etiqueta como `other`.
- Validacion comunitaria practicamente nula: 15 descargas y 0 likes en el momento de redactar esta ficha. No hay issues ni informes de terceros que confirmen el comportamiento en otros sistemas.
- Ausencia de informacion sobre sesgos: la model card no documenta sesgos demograficos, culturales ni de representacion, ni existe una evaluacion publicada para este modelo concreto en la informacion disponible.
- Riesgo de alucinacion: no aplica en el sentido de texto factual, pero si en el sentido generativo habitual de los modelos de difusion: el modelo puede producir contenido visual incoherente, texto ilegible o elementos anatomicamente incorrectos. No hay tasas de fallo publicadas para esta cuantizacion.
- Idiomas de los prompts y del texto renderizado en imagen: no documentados. No se puede asumir buen rendimiento en castellano sin una evaluacion propia.
- Requisitos de memoria no cuantificados: no hay tabla oficial de VRAM por cuantizacion ni por resolucion; la unica referencia es una RTX 4070 de 12 GB a 1024 × 1024, 40 pasos y cfg 1.0.
- Rendimiento y latencia sin medir: no se publican tiempos por imagen, por lo que no es posible estimar coste de produccion a partir de la informacion disponible.

## Enlaces

- Repositorio del modelo: https://huggingface.co/zcf0508/qwen-image-2.1-hqv3-sdcpp-fixed
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- Repositorio de cuantizaciones original: https://huggingface.co/realrebelai/Qwen-Image-2.1_GGUFs
- Licencia (Qwen Research License): https://huggingface.co/Qwen/Qwen-Image-2.1/blob/main/LICENSE
- Script de parcheo: `patch_gguf_img_in.py`, incluido en la raiz del repositorio del modelo
- Diagnostico original del problema: Discussion del repositorio `realrebelai/Qwen-Image-2.1_GGUFs` (el autor remite a el sin facilitar URL directa; no disponible)
- stable-diffusion.cpp, version master-889, commit c678dfe (referencia de la verificacion; URL no incluida en la informacion proporcionada)
- Los resultados de la busqueda web facilitados no contienen enlaces relevantes para este modelo (corresponden a portadas genericas de GitHub y Reddit), por lo que no se incluyen.
