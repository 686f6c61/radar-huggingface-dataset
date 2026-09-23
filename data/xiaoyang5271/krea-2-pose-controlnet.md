# xiaoyang5271/Krea-2-pose-controlnet

## Resumen

Krea-2-pose-controlnet es un adaptador LoRA de control de pose, de estilo ControlNet, entrenado para el modelo de difusion Krea-2-Turbo. Lo publica el usuario xiaoyang5271 en HuggingFace, aunque la model card apunta a un repositorio homonimo del usuario thedeoxen, lo que sugiere un espejo o una publicacion duplicada. Su funcion es recibir un mapa de esqueleto OpenPose o DWPose como imagen de control y forzar que el sujeto generado adopte esa postura, mientras el prompt de texto define identidad, ropa, iluminacion y escena.

El adaptador no es un modelo autonomo: se carga sobre el UNet de Krea-2-Turbo y se usa en un pipeline de image-to-image dentro de ComfyUI, con nodos especificos para el acondicionamiento con imagen de control. El repositorio ocupa 0,3 GB e incluye los pesos en safetensors, un workflow de ComfyUI en JSON y ejemplos de resultados. La licencia declarada es Apache 2.0.

Su relevancia practica esta en que anade control estructural de anatomia a un modelo turbo sin necesidad de reentrenar ni de usar una segunda imagen de referencia. Esta pensado principalmente para figuras humanas, aunque el autor indica que tambien funciona con personajes estilizados. No se han publicado parametros, benchmarks ni datos de entrenamiento detallados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA de control de pose (estilo ControlNet) sobre el UNet de Krea-2-Turbo, modelo de difusion para image-to-image |
| Parametros totales | no disponible (el repositorio ocupa 0,3 GB e incluye pesos, workflow y ejemplos) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica / no disponible (modelo de generacion de imagen; la resolucion de salida la define el modelo base) |
| Tipos de cuantizacion | no disponibles para el LoRA; el modelo base se recomienda en fp8 scaled (`krea2_turbo_fp8_scaled.safetensors`) |
| Idiomas soportados | no disponible (los prompts se procesan mediante el text encoder de Krea-2-Turbo; no se especifican idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | krea/Krea-2-Turbo |
| Libreria | diffusers (el workflow de referencia es de ComfyUI) |
| Pipeline declarado | image-to-image |
| Peso de LoRA recomendado | 0,8 - 1,0 (0,6 - 0,8 si la pose resulta demasiado rigida) |
| Ajustes de muestreo de ejemplo | ~10 pasos, CFG ~1.0, sampler `euler` con scheduler `simple` |
| Tipo de control de entrada | mapa de esqueleto OpenPose / DWPose (fondo negro) |

## Arquitectura y entrenamiento

Se trata de un adaptador LoRA aplicado sobre el UNet de Krea-2-Turbo, con un comportamiento funcional equivalente a un ControlNet de pose: el adaptador ensena al modelo a interpretar la imagen de control como un mapa de keypoints y a alinear el sujeto generado con esa estructura osea. No es un modelo de fusion de referencia mas pose; la apariencia, el vestuario, la iluminacion y el entorno provienen exclusivamente del prompt de texto y de las senales de estilo, no de una segunda imagen.

No se ha publicado informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF o DPO, ni la receta de entrenamiento (learning rate, numero de pasos, resolucion). El autor indica unicamente que el entrenamiento se centro en figuras humanas y que el modelo tambien responde con personajes estilizados. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Control de pose corporal a partir de mapas de esqueleto OpenPose o DWPose, aplicado como adaptador sobre Krea-2-Turbo.
- Generacion image-to-image: la imagen de control define la estructura y el prompt define la apariencia.
- Definicion libre de identidad, ropa, iluminacion y fondo mediante texto, sin imagen de referencia adicional.
- Funciona con figuras humanas (foco principal del entrenamiento) y con personajes estilizados.
- Integracion en ComfyUI mediante workflow ya incluido y nodos de acondicionamiento con imagen de control.
- Extraccion de pose integrada en el flujo de trabajo mediante DWPose a traves de `comfyui_controlnet_aux`.
- Ajuste de la intensidad del control variando el peso del LoRA entre 0,6 y 1,0.
- Generacion en pocos pasos (aproximadamente 10) gracias a la naturaleza turbo del modelo base.
- No dispone de tool calling, razonamiento multi-paso, capacidades de agente, vision, audio ni modo de pensamiento: es un adaptador de generacion de imagen.

## Casos de uso

- Ilustracion y comic: el adaptador permite fijar una postura concreta para un personaje de viñeta y cambiar el vestuario o el estilo tantas veces como sea necesario sin perder la anatomia.
- Storyboards y animatica: se definen poses clave con DWPose y se generan fotogramas coherentes con el guion visual, usando el prompt para describir la escena de cada plano.
- Concept art de personajes: iteracion rapida sobre variantes de un mismo personaje manteniendo la pose de referencia, util para explorar disenos de vestuario, materiales y paletas.
- Moda y visual merchandising: se controla la pose del modelo generado (de pie, en movimiento, sentado) mientras el prompt describe la prenda y el entorno de estudio.
- Generacion de datos sinteticos anotados: al partir de un esqueleto conocido, el mapa de keypoints del dataset queda garantizado por construccion, lo que facilita crear pares imagen-pose para entrenar otros sistemas.
- Fotografia de producto con figura humana: composicion de escenas donde el producto y la pose estan fijados por el control y solo cambia el acabado estetico definido por el prompt.
- Animacion y keyframes: generacion de fotogramas intermedios coherentes en anatomia para previsualizaciones animadas dentro de ComfyUI.
- Produccion por lotes de assets graficos: el workflow de ComfyUI permite encadenar mapas de pose y prompts para generar conjuntos de imagenes con estructura controlada y estilo consistente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas cuantitativas (FID, CLIP score, precision de keypoints ni comparaciones con otros adaptadores de pose); unicamente presenta ejemplos cualitativos en forma de imagenes que combinan la pose de entrada y el resultado generado.

## Requisitos de hardware

- VRAM para inferencia: no disponible. El adaptador pesa poco (el repositorio completo ocupa 0,3 GB), pero el consumo real lo determina el modelo base Krea-2-Turbo, que debe cargarse en memoria junto al LoRA.
- GPU recomendadas: no especificadas en la informacion disponible. El autor solo recomienda ejecutar el modelo base en fp8 scaled.
- Compatibilidad con GPU de consumo: no confirmada en la documentacion aportada; depende de la variante y cuantizacion del modelo base.
- Opciones de despliegue: ComfyUI es el entorno de referencia, con los nodos `comfyui_controlnet_aux` (extraccion DWPose) y `comfyui-krea2-ostris-edit` (acondicionamiento con imagen de control). La ficha de HuggingFace tambien declara la libreria `diffusers`.
- No aplica a servidores de inferencia de texto como vLLM, TGI u Ollama, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles. La unica referencia de coste computacional es la configuracion de muestreo recomendada (~10 pasos, CFG ~1.0, `euler` + `simple`).

## Comparativa con modelos similares

No se ha proporcionado informacion comparativa verificada (parametros, contexto, metricas o licencias) de alternativas equivalentes, por lo que los valores numericos no pueden contrastarse. Se incluye una comparacion cualitativa con las categorias de referencia del ecosistema:

| Modelo | Tipo | Control de pose | Modelo base | Licencia | Datos numericos |
|---|---|---|---|---|---|
| Krea-2-pose-controlnet (xiaoyang5271) | LoRA de pose estilo ControlNet | OpenPose / DWPose | krea/Krea-2-Turbo | apache-2.0 | no disponible |
| Krea-2-Turbo (krea) | Modelo de difusion base | no (requiere adaptador) | - | no disponible en la informacion | no disponible |
| ControlNet OpenPose para SDXL | ControlNet independiente | OpenPose | Stable Diffusion XL | no disponible en la informacion | no disponible |
| ControlNet OpenPose para FLUX.1 | ControlNet independiente | OpenPose | FLUX.1 | no disponible en la informacion | no disponible |

La diferencia funcional relevante frente al modelo base es que este LoRA anade control estructural de anatomia, mientras que Krea-2-Turbo por si solo no ofrece ese condicionamiento. Frente a los ControlNet de SDXL y FLUX.1, la diferencia principal es el modelo base sobre el que se aplica y el formato de integracion (aqui, un LoRA con workflow de ComfyUI ya incluido).

## Limitaciones y advertencias

- No hay benchmarks publicados, por lo que el rendimiento real del adaptador no esta cuantificado.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta: no existe validacion por parte de la comunidad.
- Discrepancia de autoría: la ficha apunta al repositorio `xiaoyang5271/Krea-2-pose-controlnet`, mientras que la model card y los enlaces de archivos dirigen a `thedeoxen/Krea-2-pose-controlnet`. Conviene verificar cual es el repositorio canonico y la integridad de los pesos antes de usarlos en produccion.
- El entrenamiento se centro en figuras humanas; el comportamiento con anatomia no humana, animales o cuerpos muy estilizados puede degradarse.
- La adherencia a la pose es un parametro manual: con pesos altos (hacia 1,0) la pose puede resultar demasiado rigida y con pesos bajos (por debajo de 0,6) el control puede perderse.
- Riesgo de artefactos de anatomia (extremidades duplicadas, manos deformadas) inherente a los modelos de difusion; el adaptador no lo elimina.
- La licencia del adaptador es Apache 2.0, pero la del modelo base Krea-2-Turbo debe comprobarse por separado antes de un uso comercial, ya que impone sus propias condiciones.
- No se especifican idiomas soportados para los prompts; el comportamiento multilingue depende del text encoder de Krea-2-Turbo.
- El flujo depende de nodos de terceros (`comfyui_controlnet_aux` y `comfyui-krea2-ostris-edit`), lo que anade dependencias de mantenimiento y posibles roturas de compatibilidad en actualizaciones.
- No se documenta resolucion de entrenamiento, por lo que se desconoce el rango de resoluciones y relaciones de aspecto para los que el adaptador esta optimizado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/xiaoyang5271/Krea-2-pose-controlnet
- Repositorio referenciado en la model card: https://huggingface.co/thedeoxen/Krea-2-pose-controlnet
- Pesos (safetensors): https://huggingface.co/thedeoxen/Krea-2-pose-controlnet/blob/main/krea2_turbo_openpose_controlnet.safetensors
- Workflow de ComfyUI (JSON): https://huggingface.co/thedeoxen/Krea-2-pose-controlnet/blob/main/krea2_controlnet_pose.json
- Modelo base Krea-2-Turbo: https://huggingface.co/krea/Krea-2-Turbo
- Nodos de extraccion de pose DWPose para ComfyUI: https://github.com/Fannovel16/comfyui_controlnet_aux
- Nodos Krea2 Ostris Edit para ComfyUI: https://github.com/ostris/comfyui-krea2-ostris-edit
