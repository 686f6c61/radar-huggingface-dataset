# Uhvg856/Viggle-Image-Swap

## Resumen

Viggle Image Swap es un adaptador LoRA para el modelo de difusion Qwen/Qwen-Image-2.1, desarrollado por el usuario Uhvg856 y publicado bajo el paraguas de Viggle. Resuelve una tarea concreta de edicion de imagen: sustituir personas completas de una fotografia por personajes definidos en una hoja de personaje (character sheet), preservando la pose, la expresion, el encuadre, el fondo y la iluminacion originales. El reemplazo cubre cara, pelo, cuerpo y ropa de forma integral, no solo el rostro.

El adaptador tiene rango 256 y alpha 256, se distribuye en bf16 con formato de claves de diffusers y ocupa 1,4 GB en el repositorio. Funciona con muestreo de pocos pasos: 6 pasos sin classifier-free guidance (CFG) por defecto, o una variante turbo de 2 pasos cedidos a Qwen-Image-2.1-Turbo mas 6 adicionales para mayor detalle. La salida es de 1 MP con la relacion de aspecto de la imagen fuente y lados multiplos de 32.

Es relevante porque aborda el character swap de cuerpo completo con una interfaz de prompt muy controlada y un pipeline de inferencia incluido, aunque su adopcion es todavia nula (0 descargas, 0 likes) y su licencia qwen-research restringe el uso comercial. No es un modelo autonomo: requiere el modelo base Qwen-Image-2.1 y un commit concreto de diffusers para funcionar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el transformer de difusion Qwen-Image-2.1 |
| Parametros totales | no disponible (el adaptador pesa 1,4 GB en bf16; el modelo base no se detalla) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen, no de texto) |
| Tipos de cuantizacion | bf16 (pesos del LoRA); no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible |
| Licencia | qwen-research (etiquetada como "other") |
| Formato de pesos | safetensors (diffusers key format), rango 256, alpha 256 |
| Modelo base | Qwen/Qwen-Image-2.1 (relacion: adapter) |
| Pipeline | image-to-image |
| Libreria | diffusers (commit 80c7ed262aeffbeb43ef13ae04baeb9b84515a69) |
| Resolucion de salida | 1 MP, aspecto de la fuente, lados multiplos de 32 |
| Pasos de muestreo | 6 (sin CFG) o 2 + 6 con `--turbo` |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 256 y alpha 256 que se inyecta en el pipeline `QwenImage21Pipeline` del modelo base Qwen-Image-2.1, un transformer de difusion para generacion y edicion de imagen. El LoRA modifica el comportamiento del modelo base para especializarlo en la tarea de sustitucion de personajes, condicionada por imagenes de referencia (las character sheets) y por un prompt textual que describe a quien reemplazar y que conservar.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de pasos, la composicion de los datos ni si se emplearon tecnicas de refuerzo o preferencias. La model card solo documenta el uso: muestreo de pocos pasos con un scheduler FlowMatchEulerDiscreteScheduler modificado (`shift_terminal=None`, obligatorio), sigmas pasadas en crudo con el pipeline anadiendo el desplazamiento dependiente de resolucion, y `true_cfg_scale=1.0` para desactivar el CFG. Como optimizacion practica, `swap.py` sustituye el Conv3d de patch embedding bf16 del codificador de vision por un matmul equivalente, ahorrando unos 30 segundos por imagen de entrada sin alterar la salida de forma apreciable.

## Capacidades

- Sustitucion integral de personas en una imagen: reemplaza cara, pelo, cuerpo y ropa por el personaje de una hoja de referencia.
- Preservacion de atributos de la escena: pose, expresion, encuadre, fondo e iluminacion se mantienen.
- Reemplazo multiple: puede sustituir varias personas a la vez, cada una con su propia hoja de personaje.
- Reemplazo selectivo: permite indicar posiciones (`on the left`, `on the right`, `in the middle`, `2nd from the left`) y dejar intactas las personas no seleccionadas.
- Entrada de referencia flexible: acepta hojas de personaje de 1536x1024 (retrato a la izquierda, tres vistas de cuerpo completo a la derecha) o fotos pegadas sobre la celda de retrato de la hoja; una foto suelta no es compatible.
- Muestreo de pocos pasos: 6 pasos sin CFG o modo turbo de 2 + 6 pasos para mayor detalle.
- Conservacion de objetos: los props que sostiene la persona original pueden mantenerse (ejemplo del hombre con un objeto en la mano convertido en mascota).
- Generacion de prompts asistida: `inference/swap.py` construye el prompt y ordena las imagenes automaticamente (`--left`, `--kept`).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision general, audio ni modo thinking.

## Casos de uso

- Previsualizacion de casting y vestuario: sustituir actores por personajes disenados para evaluar como queda un diseno de personaje sobre una pose y encuadre reales antes de producir el vestuario.
- Prototipado de personajes en videojuegos: recastar capturas de referencia con las hojas de personaje del estudio para validar proporciones, silueta y legibilidad del diseno en escenas concretas.
- Storyboarding y animatica: convertir fotografias de localizacion o de actores en fotogramas con los personajes definitivos, manteniendo la composicion y la luz de la escena.
- Ilustracion editorial y campanas: adaptar una fotografia existente a un personaje de marca o mascota corporativa conservando el fondo y la iluminacion, util para variantes de una misma campana.
- Contenido para redes y avatares: transformar selfies o fotos de cuerpo completo en versiones caracterizadas (aviadora de los anos 20, mascota, etc.) con una sola hoja de referencia.
- Pruebas de concepto de doblaje o sustitucion en produccion audiovisual: generar frames de referencia para decidir si un personaje encaja en una escena antes de rodar o renderizar.
- Iteracion de diseno de personaje: comparar varias hojas de personaje sobre la misma imagen fuente para elegir la que mejor funciona en contexto, con el mismo seed y ajuste de tono.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el LoRA pesa 1,4 GB en bf16, pero requiere cargar el modelo base Qwen-Image-2.1 completo en bf16, cuyo consumo no se detalla en la model card.
- GPU recomendadas: no especificadas; el ejemplo de codigo usa `pipe.to("cuda")` en bf16, lo que en la practica exige una GPU con memoria suficiente para el modelo base completo.
- GPU de consumo: no confirmado; no hay datos que permitan asegurar que quepa en tarjetas consumer concretas.
- Despliegue: `diffusers` fijado al commit `80c7ed262aeffbeb43ef13ae04baeb9b84515a69`, con `transformers==5.17.0`, `peft==0.18.0`, `accelerate`, `safetensors`, `pillow` y `numpy`. No se documentan opciones para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un pipeline de difusion de este tipo).
- Latencia y throughput: no disponibles; solo se indica un ahorro de aproximadamente 30 segundos por imagen de entrada al sustituir el Conv3d de patch embedding por un matmul equivalente.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Viggle Image Swap | LoRA sobre Qwen-Image-2.1 | rango 256, alpha 256 (1,4 GB) | no aplica | no disponible | qwen-research | Hugging Face, 0 descargas |
| Qwen/Qwen-Image-2.1 | Modelo base de difusion imagen | no disponible | no aplica | no disponible | no disponible en la informacion | Hugging Face |
| Qwen/Qwen-Image-2.1-Turbo | Variante turbo del base | no disponible | no aplica | no disponible | no disponible en la informacion | Hugging Face |

No se dispone de datos de benchmarks ni de especificaciones detalladas de los modelos comparables en la informacion proporcionada, por lo que la comparacion cuantitativa no es posible.

## Limitaciones y advertencias

- Licencia qwen-research: restringe el uso comercial; es imprescindible revisar el archivo LICENSE antes de cualquier despliegue en produccion.
- Adopcion nula: 0 descargas y 0 likes en el momento de la publicacion, sin validacion externa de la comunidad.
- Dependencia estricta del modelo base Qwen-Image-2.1 y de un commit concreto de diffusers; cambios de version pueden romper la inferencia.
- Requiere hojas de personaje en un formato muy especifico (1536x1024, retrato a la izquierda, tres vistas a la derecha); una foto suelta no funciona.
- El prompt debe seguir una estructura concreta (una frase por personaje y una frase de conservacion); prompts libres pueden degradar el resultado.
- Riesgo de alucinacion visual: el modelo puede alterar detalles no solicitados de la escena o generar artefactos en zonas de contacto entre personas, ropa o props.
- No hay informacion sobre sesgos demograficos, de genero o culturales en el entrenamiento del adaptador.
- No se documentan limitaciones de idioma ni de contexto porque no es un modelo de texto.
- La resolucion de salida esta limitada a 1 MP y a lados multiplos de 32, lo que puede ser insuficiente para impresion o produccion de alta resolucion.
- El ajuste de tono y el seed por defecto pueden no ser optimos para todas las fuentes; conviene validar con varias imagenes antes de automatizar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Uhvg856/Viggle-Image-Swap
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- Variante turbo del modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1-Turbo
- Commit de diffusers requerido: https://github.com/huggingface/diffusers/commit/80c7ed262aeffbeb43ef13ae04baeb9b84515a69
- Video de ejemplo: https://huggingface.co/Viggle/Viggle-Image-Swap/resolve/main/examples/viggle-image-swap.mp4
