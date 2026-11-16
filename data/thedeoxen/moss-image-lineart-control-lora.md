# thedeoxen/MOSS-Image-lineart-control-lora

## Resumen

MOSS-Image-lineart-control-lora es un adaptador LoRA de tipo ControlNet para el modelo base OpenMOSS-Team/MOSS-Image-SFT, publicado por el usuario thedeoxen. Permite condicionar la generación de imágenes de MOSS-Image-SFT a partir de un mapa de lineart (dibujo de líneas blancas sobre fondo negro), de forma que la estructura del trazo controla la composición mientras el prompt textual define identidad, materiales, ropa y estilo. No es un ControlNet completo ni el adaptador oficial de concatenación color/profundidad de MOSS, sino una LoRA de rango 64 en capas lineales y rango 16 en convoluciones, entrenada como adaptador de edición.

El adaptador resuelve un problema concreto: dar control estructural preciso a un modelo de edición de imágenes sin necesidad de entrenar un ControlNet completo. Se carga con un cargador LoRA estándar sobre el UNet de MOSS-Image-SFT y se alimenta una única imagen de control a través del nodo Text Encode MOSS-Image Edit de ComfyUI. El checkpoint publicado corresponde al paso de entrenamiento 5000.

Es relevante para desarrolladores que trabajan con pipelines de image-to-image y ComfyUI, porque ofrece una vía ligera (0,3 GB de repo) para convertir bocetos, lineart extraído o fotografías en escenas nuevas manteniendo la estructura de líneas. La licencia Apache 2.0 facilita su uso comercial, aunque el modelo base tiene sus propias condiciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador tipo ControlNet) sobre el UNet de MOSS-Image-SFT; rank 64 en capas lineales, rank 16 en convoluciones |
| Parametros totales | no disponible (tamano del repo: 0,3 GB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen, no de texto) |
| Tipos de cuantizacion | no disponible para la LoRA; el modelo base se distribuye con UNet int8 (`moss_image_sft_int8_convrot.safetensors`) y text encoder w4a8 GPTQ (`qwen3.5_9b_w4a8_gptq.safetensors`) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`moss_image_sft_lineart_control_lora.safetensors`) |

## Arquitectura y entrenamiento

El adaptador es una LoRA de tipo ControlNet aplicada al UNet de MOSS-Image-SFT. Segun la model card, usa rank 64 en las capas lineales y rank 16 en las convoluciones. Se entreno como adaptador de edicion: la imagen de control actua como referencia y el prompt describe la imagen a generar. El checkpoint publicado corresponde al paso 5000. La LoRA se entreno con kv cache activado, lo que obliga a configurar el formato de edicion `ai-toolkit` tanto en la codificacion positiva como en la negativa.

El modelo base MOSS-Image-SFT combina un UNet (distribuido en int8 con `convrot`), un text encoder derivado de Qwen3.5 9B en w4a8 GPTQ y un VAE (`flux2-vae_small.safetensors`). No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO. El preprocesador recomendado es Realistic Lineart en modo coarse, que segun el autor se ajusta mejor a los mapas de entrenamiento que el modo fine. Las lineas deben ser blancas sobre negro y de trazo ligero; dibujos dispersos funcionan mejor que bocetos densos.

## Capacidades

- Generacion de imagenes condicionada por lineart: sigue contornos limpios de un dibujo de lineas blancas sobre negro, sin el ruido adicional de un mapa Canny en bruto.
- Control estructural de una sola imagen de referencia mediante el nodo Text Encode MOSS-Image Edit.
- El prompt define identidad, materiales, ropa, iluminacion y estilo; la imagen de control define la composicion.
- Funciona con dibujos a mano y con lineart extraido automaticamente, siempre que el grosor de linea sea ligero.
- Ajuste de rigidez del control bajando la fuerza de la LoRA hacia 0,7 (valor entrenado: 1,0).
- Integracion con ComfyUI mediante workflow incluido (`moss_image_lineart_control.json`).
- No dispone de trigger word: la estructura la fija la imagen de control.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision o audio, por tratarse de un adaptador de generacion de imagen.

## Casos de uso

- Coloreado de dibujos lineales: se introduce un lineart en blanco sobre negro como imagen de control y un prompt que describe materiales y paleta; la LoRA mantiene los contornos mientras el modelo base aplica color, sombras y texturas.
- Conversion de fotografia a escena nueva manteniendo la estructura: se extrae el lineart de una foto con Realistic Lineart coarse, se usa como control y se pide al prompt una escena distinta con la misma composicion de lineas.
- Bocetos de diseno donde el dibujo manda: en diseno de producto, moda o interiores, el boceto define la forma y el prompt define materiales y ambiente, evitando que la iluminacion o el estilo previo dominen el resultado.
- Previsualizacion de concept art: ilustradores pueden pasar un lineart rapido y generar variantes de vestuario, epoca o ambientacion cambiando solo el prompt, con 30 pasos y CFG 4 para iterar con latencia moderada.
- Storyboarding y comics: a partir de lineas de encuadre se generan escenas acabadas con color y textura, utiles para presentar un guion grafico antes de la produccion final.
- Automatizacion en ComfyUI: el workflow incluido permite encadenar carga de foto, construccion del mapa de control, codificacion con prompt y muestreo, integrable en pipelines por lotes para generar catalogos o variaciones de un mismo diseno.
- Restauracion creativa de bocetos antiguos: lineart escaneado de trazo ligero sirve como control para producir una version coloreada y ambientada sin alterar la estructura original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; depende del modelo base MOSS-Image-SFT (UNet int8, text encoder Qwen3.5 9B en w4a8 GPTQ y VAE). La LoRA en si ocupa aproximadamente 0,3 GB en disco.
- GPU recomendadas: no disponible en la informacion proporcionada. El text encoder de 9B en w4a8 GPTQ y el UNet int8 sugieren necesidades de VRAM considerables, pero no se especifican cifras.
- Compatibilidad con GPU de consumo: no disponible; no se confirma si cabe en RTX 4090 u otras tarjetas consumer.
- Opciones de despliegue: ComfyUI con el workflow incluido y los nodos Text Encode MOSS-Image Edit; carga de la LoRA sobre el UNet con un cargador LoRA estandar. La libreria declarada es diffusers. No se documentan opciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo de imagen.
- Parametros de muestreo recomendados: 30 pasos, CFG 4, sampler `euler` con scheduler `simple`, fuerza de LoRA 1,0, formato de edicion `ai-toolkit` en codificacion positiva y negativa.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| thedeoxen/MOSS-Image-lineart-control-lora | LoRA tipo ControlNet sobre MOSS-Image-SFT | no disponible (repo 0,3 GB) | no aplica | apache-2.0 | Hugging Face, ComfyUI |
| OpenMOSS-Team/MOSS-Image-SFT | Modelo base de edicion/generacion de imagen | no disponible | no aplica | no disponible en la informacion | Hugging Face |
| Adaptador oficial color/profundidad de MOSS | Adaptador de concatenacion del modelo base | no disponible | no aplica | no disponible en la informacion | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta ingles segun la metadata del modelo; prompts en otros idiomas pueden degradar el resultado.
- Entrenada para lineart de trazo ligero, blanco sobre negro; bocetos densos o lineas gruesas se desvian del dominio de entrenamiento.
- El preprocesador recomendado es Realistic Lineart en modo coarse; usar fine lineart reduce la fidelidad al entrenamiento.
- Requiere configurar el formato de edicion `ai-toolkit` en codificacion positiva y negativa; omitirlo puede romper la coherencia con el entrenamiento (kv cache activado).
- La fuerza de LoRA 1,0 es el valor entrenado; bajarla a 0,7 reduce rigidez pero tambien el control estructural.
- No es un ControlNet completo ni sustituye al adaptador oficial de color/profundidad de MOSS; usarlo como tal puede dar resultados incorrectos.
- Riesgo de alucinacion visual: el prompt puede introducir elementos no presentes en el lineart, y el modelo puede reinterpretar lineas ambiguas.
- No se documentan sesgos conocidos del adaptador; hereda los sesgos del modelo base MOSS-Image-SFT y de sus datos de entrenamiento.
- Licencia Apache 2.0 para la LoRA, pero el uso comercial del modelo base MOSS-Image-SFT depende de sus propias condiciones, no detalladas en la informacion disponible.
- Prompt negativo usado en entrenamiento: `nsfw, worst quality, bad anatomy, watermark, jpeg artifact`; se recomienda mantenerlo para reproducir el comportamiento esperado.
- No hay benchmarks publicados que respalden afirmaciones de calidad o robustez fuera de los ejemplos de la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thedeoxen/MOSS-Image-lineart-control-lora
- Pesos: https://huggingface.co/thedeoxen/MOSS-Image-lineart-controlnet/blob/main/moss_image_sft_lineart_control_lora.safetensors
- Workflow ComfyUI: https://huggingface.co/thedeoxen/MOSS-Image-lineart-controlnet/blob/main/moss_image_lineart_control.json
- Repositorio del autor: https://huggingface.co/thedeoxen/MOSS-Image-lineart-controlnet
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
