# suvadityamuk/Step1X-3D-Geometry-1300m-diffusers-3d

## Resumen

Step1X-3D-Geometry-1300m-diffusers-3d es una conversion del modelo de generacion de geometria 3D de StepFun (stepfun-ai/Step1X-3D) al formato de la libreria diffusers-3d, publicada por el usuario suvadityamuk. No se trata de un modelo nuevo ni de un reentrenamiento: es el mismo conjunto de pesos de la etapa de geometria (Step1X-3D-Geometry-1300m) reempaquetado en carpetas de componentes estandar de Diffusers y Transformers, de modo que puede cargarse con un pipeline de imagen a 3D sin ejecutar codigo remoto. El repositorio ocupa 7,0 GB y contiene 1.316.287.808 parametros (aproximadamente 1,3 mil millones).

El modelo resuelve la fase de sintesis de geometria del pipeline Step1X-3D: a partir de una imagen RGBA con el objeto enmascarado por el canal alfa, produce una malla 3D sin textura (un MeshAsset). La texturizacion es una etapa posterior que no cubre este repositorio. La arquitectura combina un codificador de imagen DINOv2 con registros, un transformer 1D especifico de la familia Step1X-3D y un decodificador de forma (VAE), todo orquestado por un scheduler de flow matching Euler.

Su relevancia actual es de tipo practico: facilita la integracion del modelo en entornos de produccion basados en el ecosistema Diffusers, evita depender de codigo remoto en la carga y expone componentes estandar (image_encoder, scheduler, transformer, vae) que se pueden inspeccionar, versionar y auditar por separado. La licencia Apache-2.0 y la provenance documentada (conversion con diffusers-3d-convert-step1x3d) reducen la friccion para uso comercial, siempre que se respeten las atribuciones a StepFun y a Meta por los pesos de DINOv2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer 1D de flow matching para geometria 3D, con codificador de imagen DINOv2 (con registros) y decodificador de forma (VAE). Familia denotada como Step1X3DTransformer1DModel |
| Parametros totales | 1.316.287.808 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de imagen a 3D, no de lenguaje) |
| Tipos de cuantizacion | no disponible (se distribuye en safetensors; no se listan variantes GGUF ni cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (estructura de repositorio Diffusers) |

## Arquitectura y entrenamiento

El repositorio se organiza en cuatro componentes cargables de forma independiente: `image_encoder` (transformers.Dinov2WithRegistersModel), `scheduler` (Step1X3DFlowMatchEulerScheduler), `transformer` (Step1X3DTransformer1DModel) y `vae` (Step1X3DShapeDecoder). El flujo es el tipico de un modelo generativo condicionado por imagen: el codificador DINOv2 extrae caracteristicas de la imagen RGBA, el scheduler de flow matching Euler gobierna el muestreo y el transformer genera la representacion latente de la forma, que el decodificador convierte en malla. La generacion es controlable mediante semilla (se documenta `torch.Generator(...).manual_seed(0)`).

No hay informacion disponible sobre el numero de tokens, la composicion del dataset de entrenamiento ni sobre etapas de ajuste tipo RLHF o DPO. Tampoco sobre innovaciones de decodificacion especulativa o mecanismos de atencion alternativa. La innovacion del artefacto es de empaquetado, no de entrenamiento: la conversion se realizo con la herramienta `diffusers-3d-convert-step1x3d` (diffusers-3d 0.1.0.dev0), el repositorio incluye pruebas de paridad contra el codigo upstream fijado y no requiere codigo remoto para la carga. Un sidecar `object3d_model_index.json` es validado por el auto-loader antes de descargar cualquier peso.

## Capacidades

- Generacion de geometria 3D a partir de una imagen RGBA de entrada, donde el canal alfa actua como mascara del objeto; el pipeline recorta y rellena la imagen como hace el codigo original de Step1X-3D.
- Produccion de una malla sin textura (MeshAsset); no incluye la etapa de texturizado fotorrealista o estilizado del pipeline completo.
- Ejecucion en PyTorch estandar sobre CPU o GPU, sin kernels propietarios obligatorios.
- Control de reproducibilidad mediante semilla del generador.
- Integracion nativa con la API AutoPipelineForImageTo3D de diffusers-3d (`pipeline(ImageCondition(image=rgba), generator=...).objects[0]`).
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso ni modos de "pensamiento": no es un modelo de lenguaje.
- Capacidades multilingues: no aplica, ya que no procesa texto.
- Capacidades de vision multimodal en sentido estricto: solo la codificacion de imagen necesaria para condicionar la generacion 3D.

## Casos de uso

- Prototipado rapido de assets 3D en videojuegos: a partir de un concepto en imagen con fondo transparente se obtiene una malla base sin textura que sirve como bloqueo de geometria antes de retopologizar y texturizar en el motor o en Blender.
- Tuberias de investigacion en generacion 3D: al exponer componentes Diffusers separados y pruebas de paridad contra el codigo upstream, permite reproducir resultados y comparar variantes de scheduler o codificador sin depender de codigo remoto.
- Realidad aumentada y realidad virtual: generacion de geometria para objetos de escena a partir de fotografias con mascara alfa, util para poblar entornos de prueba con cientos de mallas generadas de forma controlada por semilla.
- Comercio electronico y visualizacion de producto: conversion de una fotografia de catalogo con fondo recortado en una malla 3D que puede renderizarse para vistas interactivas o configuradores, dejando el texturizado a una etapa posterior.
- Automatizacion de contenido para impresion 3D: sintesis de geometria inicial a partir de imagenes de referencia que luego se exporta y repara con herramientas de mallado antes de imprimir.
- Aumento de datasets de geometria: generacion masiva de mallas a partir de imagenes etiquetadas para entrenar o evaluar otros modelos de reconstruccion y generacion 3D.
- Integracion en herramientas DCC y pipelines de produccion: el script de uso documentado devuelve objetos de la pipeline que pueden serializarse directamente, lo que facilita su encadenado con exportadores y validadores de malla.
- Servicio backend de generacion de geometria: al ser Apache-2.0 y funcionar en CPU o GPU con PyTorch estandar, puede desplegarse como microservicio que reciba una imagen RGBA y devuelva una malla sin textura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Parametros: 1.316.287.808, con un repositorio de 7,0 GB que incluye codificador de imagen, scheduler, transformer y decodificador.
- VRAM estimada: no disponible de forma oficial. Como referencia orientativa, los pesos en precision de 16 bits del modelo principal rondarian los 2,6 GB, a los que hay que sumar el codificador DINOv2, el decodificador de forma y las activaciones del muestreo; una GPU con 8-16 GB deberia ser suficiente para inferencia basica, pero es una estimacion, no un dato publicado.
- GPU recomendadas: no disponibles en la informacion. Por tamano, cabe razonablemente en GPUs de consumo (gama RTX 30xx/40xx con 8 GB o mas) y en GPUs de datacenter como A100 o H100, aunque no hay cifras oficiales de rendimiento.
- Compatibilidad con CPU: el autor indica que diffusers-3d ejecuta todas las redes en PyTorch puro sobre CPU o GPU.
- Opciones de despliegue: pipeline AutoPipelineForImageTo3D de diffusers-3d, instalable desde git (`pip install "git+https://github.com/suvadityamuk/diffusers.git#subdirectory=packages/diffusers-3d"`). El renderizado de Gaussian splats requiere el backend opcional `gsplat` y la malla texturizada PBR de TRELLIS.2 requiere CuMesh; ninguno de los dos es necesario para la etapa de geometria descrita aqui.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Notas |
|---|---|---|---|---|
| suvadityamuk/Step1X-3D-Geometry-1300m-diffusers-3d (este) | 1.316.287.808 | safetensors (Diffusers) | apache-2.0 | Conversion de la etapa de geometria; sin codigo remoto; 0 descargas y 0 likes en el momento de la ficha |
| stepfun-ai/Step1X-3D (upstream) | 1300m en la etapa de geometria | PyTorch / safetensors | apache-2.0 | Implementacion de referencia original de StepFun; incluye geometria y texturizado |
| Otras familias de imagen a 3D (TRELLIS, Hunyuan3D, TripoSR y similares) | no disponible | no disponible | no disponible | Existen alternativas en la misma categoria, pero la informacion proporcionada no incluye sus especificaciones, licencias ni resultados, por lo que no se comparan cifras |

La comparacion cuantitativa con alternativas no es posible con los datos disponibles: la informacion facilitada solo describe el modelo de origen Step1X-3D y no aporta metricas de otros sistemas.

## Limitaciones y advertencias

- Repositorio con 0 descargas y 0 likes en el momento de la ficha: no hay evidencia de adopcion ni de validacion por parte de terceros mas alla de las pruebas de paridad declaradas por el autor.
- El modelo es solo la etapa de geometria: no genera texturas. Esperar una malla texturizada de este repositorio lleva a un resultado incompleto.
- La entrada debe ser una imagen RGBA con el canal alfa enmascarando el objeto; sin una mascara adecuada, el recorte y el relleno automaticos pueden degradar el resultado.
- No hay informacion sobre sesgos del modelo ni sobre la composicion del dataset de entrenamiento, lo que dificulta anticipar su comportamiento en categorias de objeto poco representadas.
- Riesgo de alucinacion geometrica: como modelo generativo, puede producir mallas con topologia incorrecta, geometria flotante o detalles inexistentes respecto a la imagen de entrada. No hay datos publicados que cuantifiquen este riesgo.
- Ausencia de cualquier capacidad de lenguaje, tool calling o agentes; no es apto para tareas conversacionales ni de razonamiento textual.
- Licencia Apache-2.0 en pesos y codigo de Step1X-3D, con atribucion a StepFun, y Apache-2.0 tambien en los pesos del codificador DINOv2, con atribucion a Meta Platforms. El repositorio no esta afiliado ni respaldado por StepFun ni por Meta.
- Para produccion hay que asumir que las cifras de VRAM, latencia y fidelidad geometrica no estan respaldadas por benchmarks publicos en la informacion disponible.
- El renderizado de Gaussian splats y las mallas PBR de TRELLIS.2 requieren dependencias opcionales (gsplat y CuMesh), lo que puede complicar el despliegue si se necesita ir mas alla de la geometria basica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/suvadityamuk/Step1X-3D-Geometry-1300m-diffusers-3d
- Modelo base en HuggingFace: https://huggingface.co/stepfun-ai/Step1X-3D
- Arbol de ficheros del modelo base: https://huggingface.co/stepfun-ai/Step1X-3D/tree/main
- Pesos de la etapa de geometria en el repositorio upstream: https://huggingface.co/stepfun-ai/Step1X-3D/blob/main/Step1X-3D-Geometry-1300m/transformer/diffusion_pytorch_model.safetensors
- Repositorio oficial de Step1X-3D: https://github.com/stepfun-ai/Step1X-3D
- Paquete diffusers-3d del autor: https://github.com/suvadityamuk/diffusers (subdirectorio `packages/diffusers-3d`)
- Perfil del autor en GitHub: https://github.com/suvadityamuk
- Espejo no oficial del repositorio Step1X-3D: https://github.com/BLH549/step1x-3d
