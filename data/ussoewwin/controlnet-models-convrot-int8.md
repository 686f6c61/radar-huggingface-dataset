# ussoewwin/ControlNet-models-ConvRot-INT8

## Resumen

`ussoewwin/ControlNet-models-ConvRot-INT8` es un repositorio de pesos cuantizados en INT8 de una familia heterogenea de modelos ControlNet y parches de modelo, orientados al control estructural de pipelines de generacion de imagen (text-to-image, image-to-image e inpainting). No es un modelo fundacional unico, sino una coleccion de adaptadores que cubren varias arquitecturas base: Illustrious-XL/SDXL, SDXL 1.0, Z-Image-Turbo, Qwen-Image/Qwen-Image-2512 y FLUX.1-dev. Lo publica el usuario `ussoewwin`, y la innovacion tecnica reside en el metodo de cuantizacion ConvRot INT8, parte de su marco Hybrid-Sensitivity-Weighted Quantization (HSWQ).

El problema que resuelve es el coste de almacenamiento y de VRAM de los ControlNet de gran tamano: aplicar una rotacion ortogonal de Hadamard sobre cada matriz de pesos 2D antes de la cuantizacion per-channel en INT8 reduce a la mitad el espacio en disco y suprime la distorsion provocada por los valores atipicos en las activaciones, preservando la fidelidad del control estructural. Los ficheros van desde ~1,4 GB (ControlNet para SDXL) hasta ~2,7 GB (FLUX.1-dev Union Pro 2.0), dentro de un repositorio de 38,6 GB.

Es relevante ahora porque permite ejecutar ControlNet de ultima generacion en GPUs de consumo con ComfyUI, a costa de depender de un loader propio: el repositorio mezcla dos tipos de objeto en tiempo de ejecucion (ControlNet y parche de modelo) que no son intercambiables y que fallan silenciosamente si se cargan con el nodo equivocado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores ControlNet y parches de modelo sobre SDXL, Illustrious-XL, Z-Image-Turbo, Qwen-Image/Qwen-Image-2512 y FLUX.1-dev |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen) |
| Tipos de cuantizacion | INT8 per-channel con rotacion ortogonal de Hadamard (ConvRot); pesos en safetensors |
| Idiomas soportados | no disponible (las indicaciones de texto dependen del modelo base) |
| Licencia | other (varia por fichero: Fair AI / OpenRAIL++-M, OpenRAIL++-M / Apache-2.0, Other / Non-Commercial) |
| Formato de pesos | safetensors (INT8 ConvRot) |
| Tamano del repositorio | 38,6 GB |
| Descargas / likes | 0 / 2 |
| Fecha de creacion / actualizacion | 2026-08-26 / 2026-11-02 |

## Arquitectura y entrenamiento

Cada fichero es un adaptador de control que se acopla a un modelo de difusion base y anade condicionamiento estructural (canny, profundidad, pose, lineart, tile, inpainting, etc.). El repositorio no entrena modelos nuevos: cuantiza pesos ya publicados por terceros, entre ellos `2vXpSwA7/iroiro-lora` (Anytest v4, variantes A y B), `xinsir/controlnet-union-sdxl-1.0`, `alibaba-pai` (Z-Image-Turbo Fun ControlNet Union y Tile, arquitectura lite de 8 pasos), `DiffSynth-Studio` (suite canny/depth/inpaint para Qwen-Image) y `Shakker-Labs/FLUX.1-dev-ControlNet-Union-Pro-2.0`.

La innovacion es el pipeline de cuantizacion HSWQ: se aplica una rotacion ortogonal de Hadamard a cada peso 2D antes de la cuantizacion INT8 por canal, lo que redistribuye los valores atipicos de las activaciones y reduce el error de cuantizacion. El resultado son ficheros de aproximadamente la mitad del tamano de los originales en precision completa (por ejemplo, 1425,1 MB para el ControlNet de Illustrious-XL). No se dispone de informacion sobre datos de entrenamiento, numero de tokens, ni uso de RLHF o DPO, ya que el autor no los documenta para estos adaptadores.

## Capacidades

- Control estructural multi-condicion: canny, profundidad, pose (OpenPose), lineart, anime lineart, scribble, soft edge, normal, segmentacion, tile e inpainting, segun el fichero.
- ControlNet Union todo en uno: un solo fichero cubre 10 o mas condiciones (SDXL union-pro-max, Qwen-Image-2512 Union 2602, FLUX.1-dev Union Pro 2.0 con 7 en 1).
- Superresolucion y mejora de detalle mediante los modelos Tile (Z-Image-Turbo Tile 2.1 lite, 8 pasos).
- Edicion e inpainting guiados por mascara (Qwen-Image ControlNet Inpainting y suite DiffSynth inpaint).
- Integracion con ComfyUI mediante loaders dedicados: `ControlNetLoader` estandar o el loader HSWQ para los ControlNet, y `HSWQ Model Patch Loader` (`HSWQModelPatchLoaderCustom`) para los parches de modelo.
- Compatibilidad con pipelines text-to-image, image-to-image e inpainting de los modelos base correspondientes.
- No soporta tool calling, agentes, razonamiento multi-paso ni modalidades de audio o video.

## Casos de uso

- Ilustracion y anime con control de pose y lineart: los ControlNet Anytest v4 para Illustrious-XL permiten fijar la estructura de un boceto o de una referencia de pose manteniendo el estilo del modelo base, con un fichero de 1,4 GB que cabe en GPUs de 8-12 GB junto al UNet.
- Produccion de imagen comercial con SDXL 1.0: `controlnet-union-pro-max-sdxl-1.0` sustituye a diez ControlNet separados por uno solo, lo que simplifica el despliegue en servidores de inferencia y reduce el cambio de modelo en memoria.
- Superresolucion por tiles en flujos de restauracion: el modelo Tile de Z-Image-Turbo, destilado a 8 pasos, permite ampliar imagenes por regiones con pocos pasos de muestreo y menor latencia.
- Edicion localizada de fotografias de producto: el ControlNet de inpainting de Qwen-Image permite sustituir objetos o fondos respetando la perspectiva y la iluminacion originales mediante mascara.
- Control de composicion en FLUX.1-dev: el Union Pro 2.0 (7 en 1) aporta canny, profundidad, pose, blur, gray, soft edge y low quality en un unico fichero de 2,7 GB para pipelines de alta fidelidad fotografica.
- Prototipado e investigacion en cuantizacion: al publicar los SHA256 de cada pack, sirve como referencia reproducible para medir la perdida de fidelidad de control entre FP16 e INT8 ConvRot en distintas arquitecturas.
- Automatizacion por lotes en ComfyUI: los parches de modelo de Qwen-Image (canny, depth, inpaint) se aplican con nodos dedicados (`QwenImageDiffsynthControlnet`), lo que permite encadenar etapas de control dentro de un grafo sin recargar el modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo afirma que la cuantizacion ConvRot INT8 reduce el espacio en disco aproximadamente a la mitad y preserva la fidelidad del control estructural, sin cifras de FID, SSIM, CLIP score ni comparaciones numericas frente a FP16.

## Requisitos de hardware

- VRAM estimada: depende del modelo base, no solo del ControlNet. Los ficheros de SDXL/Illustrious (~1,4 GB) suman ese espacio al UNet y al VAE; los de FLUX.1-dev (~2,7 GB) se anaden a un modelo base mucho mayor.
- GPU recomendadas: RTX 4090 (24 GB) o A100/H100 para FLUX.1-dev y Qwen-Image en precision completa; RTX 3060 12 GB o RTX 4070 para SDXL/Illustrious con el ControlNet INT8.
- Cabe en GPU de consumo: si, en el caso de SDXL e Illustrious con cuantizacion del modelo base; para FLUX.1-dev y Qwen-Image se requiere cuantizar tambien el modelo principal.
- Opciones de despliegue: ComfyUI con los loaders HSWQ (`ComfyUI-HSWQ-Loader-and-Tools`) y los nodos de aplicacion `ZImageFunControlnet` y `QwenImageDiffsynthControlnet`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de difusion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura base | Condiciones | Tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este repositorio (ConvRot INT8) | SDXL, Illustrious-XL, Z-Image-Turbo, Qwen-Image, FLUX.1-dev | Multiples por fichero (hasta 10+) | 1,4-2,7 GB por fichero | other (variable) | HuggingFace, requiere loader HSWQ |
| `xinsir/controlnet-union-sdxl-1.0` (original) | SDXL 1.0 | 10+ | no disponible en la informacion | OpenRAIL++-M / Apache-2.0 | HuggingFace |
| `Shakker-Labs/FLUX.1-dev-ControlNet-Union-Pro-2.0` (original) | FLUX.1-dev | 7 en 1 | no disponible en la informacion | Other / Non-Commercial | HuggingFace |
| `2vXpSwA7/iroiro-lora` (Anytest v4, original) | Illustrious-XL / SDXL | Multi-condicion | no disponible en la informacion | Fair AI / OpenRAIL++-M | HuggingFace |

La ventaja de esta version es el menor tamano en disco y la compatibilidad con GPUs mas modestas; la desventaja es la dependencia de un loader no estandar y la ausencia de benchmarks publicados que cuantifiquen la perdida de calidad.

## Limitaciones y advertencias

- Carga incorrecta silenciosa: si un parche de modelo (Z-Image-Turbo Fun ControlNet, suite DiffSynth de Qwen-Image) se carga con el `ModelPatchLoader` estandar en lugar de `HSWQModelPatchLoaderCustom`, el fichero no se aplica y no se emite error claro.
- Los parches de modelo no se aplican con `Apply ControlNet`, sino con los nodos `ZImageFunControlnet` y `QwenImageDiffsynthControlnet`.
- Licencias heterogeneas: algunos ficheros son no comerciales (FLUX.1-dev Union Pro 2.0) y otros tienen condiciones Fair AI / OpenRAIL++-M; hay que verificar la licencia por fichero antes de un uso en produccion.
- Riesgo de perdida de fidelidad por cuantizacion INT8, no cuantificada en la informacion disponible; conviene validar con el conjunto de imagenes propio antes de desplegar.
- Repositorio con 0 descargas y 2 likes: no hay evidencia de uso comunitario ni validacion independiente.
- No hay informacion sobre sesgos, alucinacion visual, idiomas soportados ni limites de resolucion; dependen del modelo base.
- El repositorio mezcla modelos de cinco arquitecturas distintas; descargar el fichero equivocado para el modelo base produce fallos de compatibilidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ussoewwin/ControlNet-models-ConvRot-INT8
- Marco de cuantizacion HSWQ: https://github.com/ussoewwin/Hybrid-Sensitivity-Weighted-Quantization
- Loader y herramientas para ComfyUI: https://github.com/ussoewwin/ComfyUI-HSWQ-Loader-and-Tools
- Modelo base Anytest v4 (2vXpSwA7): https://huggingface.co/2vXpSwA7/iroiro-lora
- Modelo base SDXL Union (xinsir): https://huggingface.co/xinsir/controlnet-union-sdxl-1.0
- Modelo base FLUX.1-dev Union Pro 2.0 (Shakker-Labs): https://huggingface.co/Shakker-Labs/FLUX.1-dev-ControlNet-Union-Pro-2.0
