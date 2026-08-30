# sverinn/Qwen-Image_ComfyUI-int8-ConvRot

## Resumen

Este repositorio contiene una cuantización INT8+ConvRot del modelo Qwen Image Distill BF16, preparada específicamente para su uso en ComfyUI. El autor, sverinn, ha aplicado la técnica de cuantización ConvRot (convolución rotatoria) con grupo de 256 y cuantización per-channel INT8, logrando una reducción significativa del tamaño del modelo respecto al original BF16. El modelo resultante es un archivo `.safetensors` que se coloca directamente en el directorio `ComfyUI/models/diffusion_models/` y se selecciona como modelo de difusión.

Qwen Image es un modelo de generación de imágenes desarrollado por Alibaba, conocido por su excepcional capacidad de renderizado de texto y su arquitectura de difusión basada en transformer. Esta versión cuantizada mantiene la compatibilidad con ComfyUI y ofrece un equilibrio entre calidad y rendimiento, siendo especialmente útil para usuarios con GPUs de gama media que desean ejecutar el modelo localmente sin sacrificar demasiada fidelidad.

La relevancia de esta publicación radica en que la cuantización INT8+ConvRot se presenta como una de las mejores opciones en términos de relación calidad-rendimiento, superando en velocidad a FP8_Scaled y ofreciendo una calidad similar a Q8_0 GGUF, según la experiencia reportada por otros usuarios de la comunidad. Esto la convierte en una alternativa atractiva para despliegues locales de generación de imágenes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (modelo base Qwen Image Distill) |
| Parametros totales | No disponible (se indica ~20.38B parametros cuantizados) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de generacion de imagenes) |
| Tipos de cuantizacion | INT8 per-channel + ConvRot (grupo 256, clipping MSE-optimal) |
| Idiomas soportados | No disponible (el modelo original soporta ingles y chino, pero no se especifica para esta version) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (un unico archivo .safetensors) |

## Arquitectura y entrenamiento

El modelo original es Qwen Image Distill, una version destilada del modelo Qwen Image de Alibaba, que emplea una arquitectura de difusion basada en transformer (DiT). Esta variante cuantizada no modifica la arquitectura subyacente, sino que aplica una cuantizacion INT8 per-channel con el metodo ConvRot, que introduce una rotacion de los pesos antes de la cuantizacion para reducir el error de cuantizacion. El grupo de ConvRot es de 256, el clipping se optimiza mediante error cuadratico medio (MSE) y se cuantizan 840 capas, abarcando aproximadamente 20.38 mil millones de parametros. Las capas no elegibles para cuantizacion se mantienen en BF16.

El proceso de cuantizacion se realizo con la herramienta `comfy-model-tools` de Comfy-Org, lo que garantiza compatibilidad nativa con el ecosistema ComfyUI. No se dispone de informacion detallada sobre el entrenamiento del modelo original (numero de tokens, composicion del dataset, tecnicas de alineamiento como RLHF o DPO), ya que la model card solo documenta el proceso de cuantizacion.

## Capacidades

- Generacion de imagenes a partir de texto (text-to-image) con alta calidad y fidelidad al prompt.
- Edicion de imagenes mediante instrucciones en lenguaje natural (image-to-image), gracias a las capacidades del modelo Qwen Image original.
- Renderizado excepcional de texto dentro de las imagenes, una de las caracteristicas distintivas de la familia Qwen Image.
- Integracion nativa con ComfyUI: el archivo se carga como modelo de difusion y funciona con los nodos estandar de ComfyUI.
- Compatibilidad con flujos de trabajo comunitarios existentes para Qwen Image en ComfyUI.
- No se ha documentado soporte para tool calling, agentes o razonamiento multi-paso, al ser un modelo puramente generativo de imagenes.

## Casos de uso

- Generacion de imagenes para diseno grafico: los disenadores pueden generar conceptos visuales, ilustraciones y composiciones tipograficas directamente desde ComfyUI, aprovechando la capacidad del modelo para renderizar texto con precision.
- Edicion fotografica asistida: mediante prompts de texto, se pueden modificar imagenes existentes (cambiar fondos, anadir elementos, alterar estilos) sin necesidad de herramientas complejas de retoque.
- Creacion de contenido para marketing y publicidad: generacion de banners, carteles y material promocional con texto integrado, donde la calidad del renderizado de texto es critica.
- Prototipado rapido de interfaces y diseno de producto: los equipos de producto pueden visualizar ideas de diseno en minutos, iterando sobre variaciones generadas por el modelo.
- Generacion de imagenes para videojuegos y entretenimiento: creacion de assets conceptuales, texturas y fondos con un control fino sobre el estilo y la composicion.
- Despliegue local en estudios creativos: al ser una cuantizacion INT8, el modelo puede ejecutarse en GPUs de gama media (por ejemplo, RTX 3060 o superiores) con un consumo de VRAM reducido, lo que permite mantener la generacion de imagenes en local sin depender de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de calidad (FID, CLIP score, etc.) ni comparaciones cuantitativas con otros modelos. La unica referencia de rendimiento proviene de la comunidad: segun el repositorio de obsxrver, la cuantizacion INT8+ConvRot ofrece una calidad similar a Q8_0 GGUF con una velocidad de generacion igual o superior a FP8_Scaled, pero estos datos no estan verificados para este modelo concreto.

## Requisitos de hardware

- VRAM estimada: el modelo cuantizado tiene ~20.38B parametros en INT8 (aproximadamente 20.38 GB) mas las capas no cuantizadas en BF16 (unos pocos GB adicionales). Se estima un consumo total de VRAM entre 22 y 26 GB durante la inferencia, dependiendo de la resolucion de salida y el batch.
- GPU recomendadas: NVIDIA RTX 3090, RTX 4090, A100, H100 o cualquier GPU con 24 GB o mas de VRAM. Para GPUs con menos VRAM (por ejemplo, 16 GB), se podria intentar con resoluciones reducidas o usando offloading a CPU, aunque el rendimiento se veria afectado.
- En consumer GPU: cabe en RTX 3090 y RTX 4090 (24 GB), pero no en GPUs de 12 GB o 16 GB sin tecnicas de optimizacion adicionales.
- Opciones de despliegue: ComfyUI es el entorno principal, ya que el modelo esta disenado para ese ecosistema. Tambien se puede usar con otros frameworks que soporten safetensors y arquitecturas de difusion, pero no se ha documentado compatibilidad con vLLM, llama.cpp u Ollama (estos estan orientados a modelos de lenguaje, no a difusion de imagenes).
- Latencia y throughput: no se dispone de datos medidos. Como referencia, la comunidad reporta que INT8+ConvRot es mas rapido que FP8_Scaled, pero no hay cifras concretas para este modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | VRAM estimada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen Image Distill BF16 (original) | ~20.38B (cuantizados) | BF16 | ~40 GB | Apache-2.0 | Hugging Face |
| Qwen Image Distill INT8+ConvRot (este) | ~20.38B (cuantizados) | INT8+ConvRot | ~22-26 GB | Apache-2.0 | Hugging Face |
| SDXL (Stable Diffusion XL) | 3.5B | FP16 | ~8 GB | OpenRAIL | Hugging Face |
| FLUX.1-dev | 12B | FP8 | ~12 GB | FLUX.1-dev Non-Commercial License | Hugging Face |

La comparativa muestra que este modelo es significativamente mas grande que SDXL y comparable a FLUX.1-dev en parametros, pero con una licencia Apache-2.0 mas permisiva (permite uso comercial). Frente al original BF16, la cuantizacion reduce la VRAM casi a la mitad, lo que lo hace mas accesible para GPUs de gama alta consumer.

## Limitaciones y advertencias

- Al ser una cuantizacion, puede haber una ligera perdida de calidad en comparacion con el modelo BF16 original, especialmente en detalles finos o texturas complejas. La comunidad reporta que la calidad es similar a Q8_0 GGUF, pero no es identica al BF16.
- El modelo hereda los sesgos y limitaciones del modelo Qwen Image original, que pueden incluir sesgos de genero, raza o cultura en las imagenes generadas, asi como dificultades con conceptos abstractos o prompts ambiguos.
- Riesgo de alucinacion visual: como cualquier modelo generativo, puede producir imagenes con elementos inconsistentes o imposibles, especialmente con prompts complejos o poco especificos.
- No se ha documentado el soporte de idiomas para esta version concreta. El modelo original de Qwen Image soporta ingles y chino, pero no se confirma que esta cuantizacion mantenga el mismo comportamiento.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda revisar la licencia del modelo base original (Qwen Image) por si hubiera restricciones adicionales en los terminos de uso.
- El modelo esta disenado exclusivamente para ComfyUI; su uso en otros entornos requeriria adaptaciones no documentadas.
- No se proporcionan garantias de rendimiento ni soporte tecnico por parte del autor.

## Enlaces

- Repositorio del modelo: https://huggingface.co/sverinn/Qwen-Image_ComfyUI-int8-ConvRot
- Repositorio de referencia sobre cuantizacion INT8+ConvRot: https://huggingface.co/obsxrver/ComfyUI-Native-INT8_ConvRot
- Pagina de ComfyUI sobre Qwen Image Edit 2511 INT8 Convrot: https://comfy.org/p/supported-models/qwen-image-edit-2511-int8-convrot/
- Repositorio GitHub del nodo ComfyUI para Qwen-Image: https://github.com/cviviers/ComfyUI_Qwen-Image
- Guia de cuantizacion INT8-ConvRot para Qwen2.5-VL (referencia tecnica): https://github.com/AnsteinHuynh/qwen-2.5-vl-int8-convrot-comfyui
