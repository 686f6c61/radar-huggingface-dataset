# thedeoxen/MOSS-Image-canny-control-lora

## Resumen

MOSS-Image-canny-control-lora es un adaptador LoRA de control de tipo Canny para el modelo de difusion MOSS-Image-SFT, desarrollado por el usuario thedeoxen y publicado en Hugging Face. No se trata de un modelo generativo autonomo, sino de un adaptador que se carga sobre el UNet de MOSS-Image-SFT para condicionar la generacion de imagenes a un mapa de bordes Canny. Funciona de forma analoga a un ControlNet, pero implementado como LoRA en lugar de como un modelo ControlNet completo.

El adaptador resuelve un problema concreto: dotar a MOSS-Image-SFT de control estructural preciso mediante un mapa de contornos, de modo que el modelo respete la silueta, el encuadre y los bordes finos de una imagen de referencia mientras el prompt de texto define identidad, materiales, vestuario y estilo. Es relevante para flujos de image-to-image controlados en ComfyUI, donde se necesita fijar la composicion sin renunciar a la libertad creativa del prompt.

El checkpoint seleccionado corresponde al paso de entrenamiento 4500. El adaptador tiene rango 64 en capas lineales y rango 16 en convoluciones, se distribuye bajo licencia Apache 2.0 y esta pensado para usarse con la libreria diffusers y con ComfyUI. El repositorio ocupa 0,3 GB y acumula 753 descargas en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA de control (estilo ControlNet) sobre el UNet de MOSS-Image-SFT; rango 64 en capas lineales y rango 16 en convoluciones |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de difusion, no aplica contexto de texto) |
| Tipos de cuantizacion | no disponible para el adaptador; el modelo base se usa con UNet int8 (`moss_image_sft_int8_convrot.safetensors`) y text encoder W4A8 GPTQ (`qwen3.5_9b_w4a8_gptq.safetensors`) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`moss_image_sft_canny_control_lora.safetensors`) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de control que se inyecta en las capas del UNet de MOSS-Image-SFT. Segun la model card, se entreno como adaptador de edicion: la imagen de control actua como referencia y el prompt describe la imagen a generar. El rango es 64 en capas lineales y 16 en convoluciones. El checkpoint publicado corresponde al paso 4500 de entrenamiento y se entreno con la cache KV activada, un detalle relevante para la configuracion de inferencia.

El control se introduce como una unica imagen de referencia a traves del nodo Text Encode MOSS-Image Edit, con el formato de edicion configurado como `ai-toolkit` tanto en la codificacion positiva como en la negativa. El modelo base recomendado es OpenMOSS-Team/MOSS-Image-SFT, compuesto por un UNet `moss_image_sft_int8_convrot.safetensors`, un text encoder `qwen3.5_9b_w4a8_gptq.safetensors` de tipo `moss_image` y un VAE `flux2-vae_small.safetensors`. No se detalla en la informacion disponible el numero de tokens, la composicion del dataset de entrenamiento ni si se empleo RLHF o DPO.

## Capacidades

- Control estructural mediante mapa Canny: sigue contornos de objetos, encuadre y bordes finos a partir de un mapa de lineas blancas sobre fondo negro.
- Generacion condicionada por prompt: la apariencia, los materiales, la ropa y el entorno se definen mediante texto, mientras el mapa de bordes fija la estructura.
- Adaptador de control de imagen unica: funciona como ControlNet ligero sobre MOSS-Image-SFT, no como modelo autonomo.
- Integracion en ComfyUI mediante nodo Text Encode MOSS-Image Edit y carga de LoRA sobre el UNet.
- Compatibilidad con diffusers como libreria de referencia.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).
- Capacidad multilingue limitada al ingles segun los metadatos del repositorio.
- Sin trigger word: el control lo aporta la imagen, no una palabra clave en el prompt.

## Casos de uso

- Recoloreado de composiciones manteniendo el contorno: se extrae el mapa Canny de una imagen existente y se genera una nueva version con otra paleta o materiales, conservando la silueta original gracias al control de bordes.
- Conversion de fotografia a estilo material distinto: a partir de los bordes de una foto se genera una ilustracion con materiales y estilo definidos en el prompt (por ejemplo, un objeto fotografiado reinterpretado en ceramica o metal).
- Estudios de layout con silueta fija: en diseno grafico o conceptual, se mantiene el encuadre y la posicion de los elementos mientras se exploran variaciones de vestuario, color y ambientacion.
- Flujos de image-to-image controlados en ComfyUI: el workflow incluido carga una foto, extrae bordes con Canny Edge (umbrales bajo 100, alto 200) y muestrea con 30 pasos, CFG 4, sampler euler y scheduler simple.
- Previsualizacion de conceptos con estructura definida: util para generar variantes de una escena (por ejemplo, un maestro de ceremonias de circo) manteniendo la pose y el encuadre de una referencia.
- Integracion en pipelines de produccion de imagen con diffusers: al ser un LoRA safetensors de 0,3 GB, se puede cargar sobre el UNet en strength 1.0 dentro de un pipeline automatizado de generacion condicionada.
- Exploracion de rigidez de control: ajustando la fuerza del LoRA hacia 0.7 se obtiene un control mas laxo, util para estudios donde la silueta debe mantenerse solo parcialmente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; depende del modelo base MOSS-Image-SFT, que se ejecuta con UNet en int8 y text encoder en W4A8 GPTQ, lo que reduce los requisitos respecto a pesos en precision completa.
- GPU recomendadas: no disponibles en la informacion proporcionada.
- Cabe en consumer GPU: no confirmado en la informacion disponible.
- Opciones de despliegue: ComfyUI (workflow incluido) y diffusers como libreria de referencia.
- Latencia y throughput: no disponibles. La configuracion de muestreo recomendada es 30 pasos, CFG 4, sampler euler y scheduler simple, con fuerza de LoRA 1.0.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MOSS-Image-canny-control-lora (este) | LoRA de control Canny sobre MOSS-Image-SFT | no disponible (rango 64/16) | no aplica | Apache 2.0 | Hugging Face, ComfyUI, diffusers |
| ControlNet clasico (p. ej. para Stable Diffusion) | Modelo ControlNet completo | no disponible | no aplica | variable segun version | amplia, ecosistema maduro |
| Adaptadores de control oficiales de MOSS (color/depth concat) | Adaptador oficial del modelo base | no disponible | no aplica | segun MOSS-Image-SFT | Hugging Face (OpenMOSS-Team) |

La comparacion cuantitativa con alternativas no esta disponible en la informacion proporcionada. La diferencia principal frente a un ControlNet clasico es que este adaptador es un LoRA, no un modelo ControlNet completo, y frente a los adaptadores oficiales de MOSS (color/depth concat) es que se centra especificamente en control por bordes Canny.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere cargar MOSS-Image-SFT como base y no funciona de forma aislada.
- Idioma limitado al ingles segun los metadatos; los prompts en otros idiomas pueden degradar el resultado.
- Riesgo de sobreajuste al control: si el resultado se adhiere demasiado a cada mota del mapa, hay que subir los umbrales de Canny o bajar la fuerza del LoRA hacia 0.7.
- Requiere configuracion especifica de inferencia: formato de edicion `ai-toolkit` en codificacion positiva y negativa, y cache KV activada durante el entrenamiento.
- Los mapas de control deben ser lineas blancas finas y limpias sobre fondo negro para coincidir con las condiciones de entrenamiento.
- No se han publicado benchmarks, por lo que el rendimiento cuantitativo frente a alternativas no esta verificado.
- Riesgo de alucinacion visual inherente a los modelos de difusion: el prompt puede introducir elementos no presentes en el control.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base MOSS-Image-SFT y de sus componentes (text encoder, VAE).
- El adaptador se publico en noviembre de 2026 y tiene pocas descargas (753) y likes (3), por lo que la validacion comunitaria es limitada.

## Enlaces

- Hugging Face: https://huggingface.co/thedeoxen/MOSS-Image-canny-control-lora
- Repositorio del autor: https://huggingface.co/thedeoxen/MOSS-Image-canny-controlnet
- Pesos: https://huggingface.co/thedeoxen/MOSS-Image-canny-controlnet/blob/main/moss_image_sft_canny_control_lora.safetensors
- Workflow de ComfyUI: https://huggingface.co/thedeoxen/MOSS-Image-canny-controlnet/blob/main/moss_image_canny_control.json
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- comfyui_controlnet_aux: https://github.com/Fannovel16/comfyui_controlnet_aux
