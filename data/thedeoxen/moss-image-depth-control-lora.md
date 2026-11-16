# thedeoxen/MOSS-Image-depth-control-lora

## Resumen

MOSS-Image-depth-control-lora es un adaptador LoRA de control de profundidad para el modelo de imagen MOSS-Image-SFT, desarrollado por el usuario thedeoxen y publicado en Hugging Face. Se trata de un LoRA de tipo ControlNet (un adaptador que sigue una imagen de control al estilo de ControlNet, no un ControlNet completo ni el adaptador oficial de concatenación color/profundidad de MOSS) que permite condicionar la generación de imágenes a un mapa de profundidad en escala de grises, donde las superficies cercanas se representan en blanco y el fondo cae a negro.

El adaptador resuelve un problema concreto: controlar la composición espacial y el layout de cercano a lejano de una imagen generada sin renunciar a la libertad creativa del prompt de texto, que define la identidad, los materiales, la ropa y el estilo. Es relevante para flujos de trabajo de image-to-image y para pipelines de ComfyUI, ya que se integra mediante un cargador de LoRA estándar sobre el UNet del modelo base.

El checkpoint seleccionado corresponde al paso de entrenamiento 5000. El LoRA tiene rango 64 en las capas lineales y rango 16 en las convoluciones, y se entrenó como adaptador de edición con la caché KV activada. El repositorio ocupa 0,3 GB y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA de control (estilo ControlNet) sobre UNet de difusion MOSS-Image-SFT |
| Parametros totales | no disponible (adaptador LoRA; rango 64 en capas lineales y rango 16 en convoluciones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible para el LoRA; el modelo base usa UNet int8 (`moss_image_sft_int8_convrot.safetensors`) y text encoder w4a8 GPTQ (`qwen3.5_9b_w4a8_gptq.safetensors`) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El adaptador es un LoRA de control entrenado sobre el UNet del modelo base OpenMOSS-Team/MOSS-Image-SFT. Segun la model card, se configura con rango 64 en las capas lineales y rango 16 en las convoluciones. Se entreno como adaptador de edicion: la imagen de control actua como referencia y el prompt describe la imagen a generar. El entrenamiento se realizo con la cache KV activada, lo que obliga a establecer el formato de edicion `ai-toolkit` tanto en la codificacion positiva como en la negativa durante la inferencia.

El checkpoint publicado corresponde al paso 5000. El mapa de control se construye con mapas de profundidad en escala de grises con la convencion de cercano en blanco, generados en el flujo de trabajo incluido con Depth Anything V2 (`depth_anything_v2_vitl`). No se detalla en la informacion disponible el numero de tokens, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO, ya que se trata de un adaptador de difusion y no de un modelo de lenguaje.

## Capacidades

- Control de composicion espacial: sigue el layout de cercano a lejano a partir de un mapa de profundidad en escala de grises.
- Generacion image-to-image condicionada por prompt: la identidad, los materiales, la ropa y el estilo los define el texto.
- Adaptador de control de una sola imagen de referencia, integrable mediante un cargador de LoRA estandar.
- Compatibilidad con ComfyUI mediante el nodo integrado Text Encode MOSS-Image Edit.
- Sin palabra de activacion (trigger word): la imagen de control fija la estructura.
- Ajuste de intensidad del LoRA (valor entrenado 1.0; se puede bajar hacia 0.7 si el control resulta demasiado rigido).

## Casos de uso

- Reconstruccion de escenas con la misma profundidad de camara en un estilo nuevo: se aporta el mapa de profundidad de la escena original y un prompt que redefine materiales y estetica, manteniendo la composicion.
- Separacion de primer plano y fondo con cambio de materiales: util para sustituir texturas o acabados sin alterar la relacion de distancias entre sujeto y entorno.
- Diseno de producto e interiores con un sujeto cercano claro: el mapa de profundidad fija la jerarquia espacial mientras el prompt define el acabado del producto o la ambientacion.
- Iteracion creativa en ComfyUI: el flujo incluido carga una foto, construye el mapa con Depth Anything V2, lo codifica con el prompt y muestrea, lo que permite ciclos rapidos de prueba de conceptos.
- Prototipado de escenarios y galerias: con mapas de profundidad de regiones planas amplias, el prompt dispone de mas margen para definir texturas y detalles.
- Control de camara en ilustracion y concept art: cuando importa mas la profundidad de camara que cada borde, el adaptador reproduce angulos y distancias sin imponer contornos rigidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; depende del modelo base MOSS-Image-SFT (UNet int8, text encoder Qwen3.5 9B en w4a8 GPTQ y VAE Flux2) y no solo del LoRA, que ocupa 0,3 GB en disco.
- GPU recomendadas: no disponibles en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; el peso del text encoder de 9B cuantizado condiciona el requisito de memoria.
- Opciones de despliegue: ComfyUI (flujo de trabajo incluido) y libreria diffusers.
- Latencia y throughput: no disponibles. La configuracion de muestreo tipica es 30 pasos, CFG 4, sampler `euler` con scheduler `simple`.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| thedeoxen/MOSS-Image-depth-control-lora | LoRA de control de profundidad sobre MOSS-Image-SFT | no disponible (rango 64 lineales / 16 convoluciones) | no aplica | apache-2.0 | Hugging Face |
| OpenMOSS-Team/MOSS-Image-SFT | Modelo base de imagen | no disponible | no disponible | no disponible | Hugging Face |
| ControlNet clasico para difusion | Adaptador de control completo | no disponible | no aplica | variable | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada. La diferencia principal frente a un ControlNet completo es que este adaptador es un LoRA ligero (0,3 GB) que se carga con un cargador de LoRA estandar, no un modelo de control independiente.

## Limitaciones y advertencias

- Solo soporta ingles como idioma declarado en la model card.
- Requiere respetar la convencion de profundidad con cercano en blanco; un mapa invertido entra en conflicto con el LoRA.
- El control es mas adecuado para layout de camara que para bordes precisos; no sustituye a un ControlNet de contornos cuando se necesita fidelidad de silueta.
- Debe usarse con el formato de edicion `ai-toolkit` en la codificacion positiva y negativa, ya que se entreno con cache KV activada; ignorarlo degrada el resultado.
- Entrenado y recomendado con el modelo base OpenMOSS-Team/MOSS-Image-SFT; su uso con otros modelos base no esta garantizado.
- Riesgo de alucinacion visual y artefactos propios de los modelos de difusion; la model card incluye un prompt negativo de referencia (`nsfw, worst quality, bad anatomy, watermark, jpeg artifact`).
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base y de los checkpoints auxiliares (Depth Anything V2, VAE Flux2) antes de desplegar en produccion.
- No se han publicado evaluaciones cuantitativas ni datos de sesgo para este adaptador.

## Enlaces

- Hugging Face: https://huggingface.co/thedeoxen/MOSS-Image-depth-control-lora
- Repositorio del autor: https://huggingface.co/thedeoxen/MOSS-Image-depth-controlnet
- Pesos: https://huggingface.co/thedeoxen/MOSS-Image-depth-controlnet/blob/main/moss_image_sft_depth_control_lora.safetensors
- Flujo de trabajo ComfyUI: https://huggingface.co/thedeoxen/MOSS-Image-depth-controlnet/blob/main/moss_image_depth_control.json
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
