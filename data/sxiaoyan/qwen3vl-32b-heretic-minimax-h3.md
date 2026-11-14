# SXIAOYAN/qwen3vl-32b-heretic-minimax-h3

## Resumen

`SXIAOYAN/qwen3vl-32b-heretic-minimax-h3` es una conversion a `bfloat16` en formato `transformers` del text encoder del sistema MiniMax-H3, un pipeline de generacion de video y audio a partir de imagen y texto. El modelo parte de `Momoking/Qwen3-VL-32B-Heretic-MiniMax-H3-NVFP4`, un checkpoint cuantizado en NVFP4 pensado para ComfyUI, y lo reempaqueta con el mismo layout de ficheros que el encoder oficial `MiniMaxAI/MiniMax-H3`, de modo que herramientas basadas en `transformers` o `diffusers` puedan consumirlo sin depender de ComfyUI.

La relevancia de este repositorio es practica: el checkpoint original en NVFP4 (15,7 GB) solo es cargable por ComfyUI mediante su sistema `comfy_quant`, mientras que el pipeline modular de `diffusers` y la clase `Qwen3VLForConditionalGeneration` de `transformers` no pueden leerlo. Esta conversion desquantiza los pesos a `bfloat16` (62,14 GiB, la misma huella que el encoder oficial) y rellena las capas no utilizadas para el acondicionamiento con pesos del encoder oficial, manteniendo intactos los pesos efectivamente leidos por el pipeline.

El modelo es un text encoder de la familia Qwen3-VL de 32B de parametros, con capacidad de procesar imagen y texto, en una variante "abliterated"/"uncensored" que elimina los rechazos del ajuste original. Solo se distribuyen `text_encoder/`, `tokenizer/` y `processor/`; el transformer H3 y los VAE del pipeline no forman parte de este repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-VL (transformer decoder-only multimodal, base de Qwen3-VL-32B) |
| Parametros totales | 32B (segun nombre del modelo base; no se detalla desglose) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Pesos distribuidos en bfloat16; el origen era NVFP4 (E2M1 con escalado por bloques, 350 capas lineales) mas una tabla de embeddings `int8_tensorwise` |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (14 ficheros `model-*.safetensors` en bfloat16 + indice) |

## Arquitectura y entrenamiento

El modelo es el text encoder de MiniMax-H3, basado en Qwen3-VL-32B, un transformer decoder-only multimodal que procesa entradas de imagen y texto. Segun la model card, el pipeline H3 lee el hidden state tras 50 capas del decoder; las capas 50 a 63 y el `lm_head` no intervienen en el acondicionamiento. El checkpoint de origen solo contiene las capas 0 a 49 en version Heretic, y las 156 tensores restantes se rellenan desde el encoder oficial `MiniMaxAI/MiniMax-H3` para mantener el checkpoint completo y funcional el camino opcional de reescritura de prompt.

La conversion tiene un detalle tecnico relevante: el checkpoint upstream INT8-ConvRot almacenaba pesos rotados con ConvRot, y recuantizar sin des-rotar produce condicionamiento corrupto. El autor del checkpoint NVFP4 ya habia des-rotado los pesos, por lo que la desquantizacion a bfloat16 es exacta. Cada tensor se desquantizo con el mismo layout que usa ComfyUI (`TensorCoreNVFP4Layout.dequantize`). No se dispone de informacion sobre el dataset de entrenamiento, numero de tokens, ni si hubo RLHF o DPO en la informacion proporcionada.

## Capacidades

- Codificacion de texto e imagen como text encoder del pipeline MiniMax-H3 (image-text-to-video).
- Generacion de texto y razonamiento heredados de Qwen3-VL-32B (capacidad base del modelo).
- Procesamiento multimodal imagen-texto mediante `Qwen3VLProcessor`.
- Variante "abliterated"/"uncensored": elimina los rechazos del ajuste, lo que afecta al comportamiento del modelo ante peticiones que el original rechazaria.
- Compatibilidad con carga modular en `diffusers` (`load_components` / `modular_model_index.json`) y con `transformers` (`Qwen3VLForConditionalGeneration.from_pretrained(..., subfolder="text_encoder")`).
- Soporte de reescritura de prompt (prompt-rewrite path) gracias a las capas 50-63 y `lm_head` rellenadas desde el encoder oficial.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente multi-step: no disponible en la informacion proporcionada.

## Casos de uso

- Generacion de video y audio a partir de imagen y texto: el modelo actua como conditioner del pipeline MiniMax-H3; se carga como `text_encoder` y se combina con el transformer H3 y los VAE para producir video con audio sincronizado.
- Integracion en pipelines `diffusers` modulares: al exponer `modular_model_index.json` y el layout oficial, se puede apuntar `MODEL_REPO` a este repositorio y usar `load_components` sin adaptadores propios.
- Sustitucion del encoder oficial en tooling `transformers`: cualquier script que cargue `Qwen3VLForConditionalGeneration` desde el subfolder `text_encoder` puede apuntar aqui y obtener el mismo footprint (62,14 GiB) con pesos Heretic.
- Despliegue en Spaces de ZeroGPU: el par de Spaces del autor (conditioner y generator turbo de 4 pasos) usa este repositorio como `MODEL_REPO` por defecto en el tier gratuito.
- Investigacion sobre alineacion y censura: al ser una variante abliterated, sirve para estudiar como cambia el condicionamiento de un pipeline generativo cuando se eliminan los rechazos del encoder.
- Reproduccion de experimentos con MiniMax-H3 fuera de ComfyUI: permite validar el pipeline en entornos Linux con `transformers`/`diffusers` sin depender de la GUI de ComfyUI.
- Fine-tuning o destilacion del encoder: al estar en bfloat16 y en layout estandar, es un punto de partida mas comodo que el checkpoint NVFP4 para reentrenar o adaptar el conditioner.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 62,14 GiB solo para los pesos en bfloat16, mas overhead de activaciones y del resto del pipeline H3 (transformer y VAE no incluidos).
- No cabe en GPUs de consumo con menos de 64 GB de VRAM en bfloat16; requiere aceleradores de datacenter (A100 80 GB, H100 80 GB) o configuraciones multi-GPU.
- En GPUs consumer (RTX 4090, 24 GB) solo seria viable con cuantizacion adicional a 8 o 4 bits, no incluida en este repositorio; el checkpoint NVFP4 original (15,7 GB) esta pensado para ese escenario pero solo via ComfyUI.
- Opciones de despliegue: `transformers` (`Qwen3VLForConditionalGeneration`), `diffusers` modular (`load_components`), y ComfyUI usando el repositorio NVFP4 de origen (no este).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.
- Los Spaces de demostracion del autor usan ZeroGPU en tier gratuito, lo que sugiere que el conditioner se ejecuta en infraestructura compartida con limites de tiempo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| SXIAOYAN/qwen3vl-32b-heretic-minimax-h3 | 32B | no disponible | safetensors bfloat16 | apache-2.0 | Conversion para transformers/diffusers |
| Momoking/Qwen3-VL-32B-Heretic-MiniMax-H3-NVFP4 | 32B | no disponible | NVFP4 (ComfyUI) | no disponible | Origen directo, solo ComfyUI |
| ethanfel/Qwen3-VL-32B-Ultra-Heretic-MiniMax-H3-ComfyUI-INT8-ConvRot | 32B | no disponible | INT8 ConvRot (ComfyUI) | no disponible | Upstream del NVFP4 |
| MiniMaxAI/MiniMax-H3 (encoder oficial) | 32B | no disponible | safetensors bfloat16 | no disponible | Version no abliterated, layout de referencia |

## Limitaciones y advertencias

- Solo se distribuyen `text_encoder/`, `tokenizer/` y `processor/`; el transformer H3 y los VAE no estan incluidos, por lo que el repositorio no genera video por si solo.
- El modelo es una variante "abliterated"/"uncensored": se ha eliminado el comportamiento de rechazo, lo que incrementa el riesgo de generar contenido inapropiado o danino y complica el cumplimiento en produccion.
- La model card advierte de un "ConvRot trap": recuantizar los pesos sin des-rotar produce condicionamiento corrupto. Cualquier conversion posterior debe respetar el layout des-rotado.
- Las capas 50-63 y `lm_head` provienen del encoder oficial, no de la variante Heretic; el comportamiento del camino de reescritura de prompt no es el del modelo abliterated.
- No hay informacion sobre sesgos, idiomas soportados, contexto maximo ni evaluaciones de calidad; no se puede garantizar el rendimiento en produccion sin validacion propia.
- La licencia declarada es apache-2.0, pero el modelo base y los checkpoints intermedios no declaran licencia en la informacion disponible; conviene verificar la cadena de licencias antes de uso comercial.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo dia (14 de noviembre de 2026), por lo que no hay evidencia de uso en comunidad ni de mantenimiento.
- El tamano del repositorio indicado (0,1 GB) es incompatible con los 62,14 GiB de pesos descritos; posiblemente el indice de Hugging Face no refleja el contenido completo, lo que debe verificarse antes de descargar.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SXIAOYAN/qwen3vl-32b-heretic-minimax-h3
- Modelo base NVFP4: https://huggingface.co/Momoking/Qwen3-VL-32B-Heretic-MiniMax-H3-NVFP4
- Upstream INT8 ConvRot: https://huggingface.co/ethanfel/Qwen3-VL-32B-Ultra-Heretic-MiniMax-H3-ComfyUI-INT8-ConvRot
- Encoder oficial MiniMax-H3: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Space conditioner: https://huggingface.co/spaces/SXIAOYAN/qwen3vl-heretic-h3-conditioner
- Space generator: https://huggingface.co/spaces/SXIAOYAN/minimax-h3-heretic-turbo
