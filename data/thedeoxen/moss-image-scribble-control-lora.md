# thedeoxen/MOSS-Image-scribble-control-lora

## Resumen

MOSS-Image-scribble-control-lora es un adaptador de control de tipo LoRA entrenado por el usuario thedeoxen para el modelo de difusion OpenMOSS-Team/MOSS-Image-SFT. Su funcion es actuar como un ControlNet ligero: recibe un boceto o garabato (trazos blancos sobre fondo negro) y lo utiliza como referencia estructural para generar una imagen descrita por el prompt de texto. No es un ControlNet completo ni el adaptador oficial de concatenacion de color/profundidad de MOSS, sino una LoRA que se carga con un cargador de LoRA estandar y se le pasa una unica imagen de control a traves del nodo Text Encode MOSS-Image Edit.

El adaptador tiene rango 64 en capas lineales y rango 16 en convoluciones, y se distribuye como un unico archivo safetensors de aproximadamente 0,3 GB. Fue entrenado como adaptador de edicion (la imagen de control actua como referencia y el prompt describe la escena a generar) y el checkpoint seleccionado corresponde al paso de entrenamiento 5000. Esta pensado para integrarse en ComfyUI con el modelo base MOSS-Image-SFT, con el que comparte la arquitectura de difusion subyacente (UNet con cuantizacion int8, text encoder Qwen3.5-9B y VAE flux2-vae).

Es relevante porque permite control estructural sobre un modelo de difusion reciente sin necesidad de un ControlNet completo, reduciendo el coste de almacenamiento y despliegue a una LoRA de 0,3 GB, y porque habilita flujos de trabajo de bocetado y storyboard dentro de ComfyUI con una configuracion de muestreo concreta y reproducible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA de control (tipo ControlNet) sobre UNet de difusion; rango 64 en capas lineales y rango 16 en convoluciones |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen, no de texto) |
| Tipos de cuantizacion | no disponible para la LoRA; el modelo base usa UNet int8 y text encoder w4a8 GPTQ |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El adaptador es una LoRA de control (etiquetada como controlnet en los tags) que se inyecta en el UNet del modelo base MOSS-Image-SFT. Segun la model card, el rango es 64 en capas lineales y 16 en capas convolucionales, y se entreno como adaptador de edicion: la imagen de control se pasa como imagen de referencia unica a traves del nodo Text Encode MOSS-Image Edit, y el prompt de texto describe la imagen a generar. El entrenamiento se realizo con la cache KV activada, lo que exige seleccionar el formato de edicion `ai-toolkit` tanto en la codificacion positiva como en la negativa.

El checkpoint publicado corresponde al paso 5000 de entrenamiento. No se especifican en la informacion disponible el numero total de tokens, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO (poco habituales en adaptadores de difusion). El modelo base emplea un UNet cuantizado int8 (moss_image_sft_int8_convrot.safetensors), un text encoder Qwen3.5-9B en w4a8 GPTQ y el VAE flux2-vae_small.safetensors.

## Capacidades

- Control estructural por boceto: sigue los trazos y masas principales de un garabato, no cada borde fino.
- Generacion de imagen condicionada por prompt de texto: la identidad, materiales, ropa y estilo los define el prompt, no la imagen de control.
- Control de imagen unica: funciona como adaptador de control de una sola imagen de referencia sobre MOSS-Image-SFT.
- Integracion en ComfyUI mediante cargador de LoRA y el nodo Text Encode MOSS-Image Edit.
- Compatibilidad con mapas de control suaves tipo HED Soft-Edge Lines, mas cercanos a los garabatos de entrenamiento que Canny o lineart.
- Ajuste de intensidad de control: bajar la fuerza de la LoRA hacia 0,7 si el control resulta demasiado rigido.
- Sin trigger word: no requiere palabra de activacion.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision por comprension ni audio, al tratarse de un adaptador de generacion de imagen.

## Casos de uso

- Bocetado y storyboard: a partir de trazos rapidos se generan imagenes acabadas con la composicion del boceto, util para previsualizar escenas antes de produccion.
- Pruebas rapidas de composicion: sirve como primera pasada para validar encuadre y masas antes de aplicar un control mas estricto con Canny o lineart.
- Dibujo sobre fotografia: se trazan las formas principales sobre una foto y la LoRA conserva solo esas masas, mientras el prompt reinventa textura, color y materiales.
- Iteracion de concepto visual: con una unica imagen de control se prueban multiples prompts para explorar variantes de vestuario, iluminacion y ambientacion manteniendo la estructura.
- Prototipado en ComfyUI: el workflow incluido (carga de foto, construccion del mapa de control, codificacion con prompt y muestreo) permite montar un pipeline reproducible en 30 pasos con CFG 4 y sampler euler/simple.
- Generacion de arte conceptual con control de silueta: para personajes u objetos cuya pose y contorno deben respetarse, dejando al prompt la definicion de materiales y estilo.
- Educacion y demostraciones: ilustra como un adaptador LoRA puede sustituir a un ControlNet completo en un flujo de difusion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. La LoRA pesa unos 0,3 GB; el modelo base MOSS-Image-SFT (UNet int8, text encoder Qwen3.5-9B w4a8 GPTQ y VAE) domina el consumo de VRAM, que no se detalla en la informacion proporcionada.
- GPU recomendadas: no disponible. Al requerir el modelo base completo con un text encoder de 9B, se recomienda hardware de gama alta, pero no se confirma en la documentacion.
- Compatibilidad con GPU de consumo: no confirmada; depende del modelo base, no de la LoRA.
- Opciones de despliegue: ComfyUI (workflow incluido), con la libreria diffusers.
- Configuracion de muestreo: 30 pasos, CFG 4, sampler euler con scheduler simple, fuerza de LoRA 1,0.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| thedeoxen/MOSS-Image-scribble-control-lora | LoRA de control sobre MOSS-Image-SFT | no disponible (repo 0,3 GB) | no aplica | apache-2.0 | Hugging Face |
| ControlNet estandar (p. ej. para SD) | ControlNet completo | no disponible | no aplica | variable | Hugging Face |
| Adaptador oficial MOSS color/depth | Adaptador de concatenacion del modelo base | no disponible | no aplica | no disponible | repositorio de OpenMOSS-Team |

La comparativa cuantitativa con alternativas no esta disponible en la informacion proporcionada. La diferencia principal frente a un ControlNet completo es el tamano (0,3 GB frente a modelos de control de mayor peso) y el hecho de requerir el modelo base MOSS-Image-SFT y un flujo especifico en ComfyUI.

## Limitaciones y advertencias

- Solo soporta ingles en la metadatos del modelo; no se documentan otros idiomas.
- Requiere el modelo base OpenMOSS-Team/MOSS-Image-SFT y una configuracion concreta (formato de edicion `ai-toolkit`, cache KV activada); un uso fuera de ese flujo puede degradar el resultado.
- Esta entrenada para garabatos blancos sobre negro con trazos gruesos y suaves; mapas de borde finos (Canny, PiDiNet) se alejan de la distribucion de entrenamiento.
- A fuerza 1,0 el control puede resultar demasiado rigido; se sugiere bajar a 0,7.
- No es un ControlNet completo ni el adaptador oficial de color/profundidad de MOSS; no debe confundirse con ellos.
- Riesgo de alucinacion visual no cuantificado en la informacion disponible; la fidelidad estructural depende del prompt y de la calidad del mapa de control.
- Licencia apache-2.0, que permite uso comercial, pero sujeta a las condiciones del modelo base, cuya licencia no se detalla en la informacion proporcionada.
- No se documentan sesgos conocidos ni metricas de evaluacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thedeoxen/MOSS-Image-scribble-control-lora
- Repositorio del adaptador: https://huggingface.co/thedeoxen/MOSS-Image-scribble-controlnet
- Pesos: https://huggingface.co/thedeoxen/MOSS-Image-scribble-controlnet/blob/main/moss_image_sft_scribble_control_lora.safetensors
- Workflow de ComfyUI: https://huggingface.co/thedeoxen/MOSS-Image-scribble-controlnet/blob/main/moss_image_scribble_control.json
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
