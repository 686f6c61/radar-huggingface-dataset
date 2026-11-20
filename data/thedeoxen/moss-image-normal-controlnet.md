# thedeoxen/MOSS-Image-normal-controlnet

## Resumen

MOSS-Image-normal-controlnet es un adaptador de control de tipo LoRA (denominado "controlnet" por el autor) para el modelo de generacion y edicion de imagenes MOSS-Image-SFT, desarrollado por el usuario thedeoxen y publicado bajo licencia Apache 2.0. El adaptador permite condicionar la generacion de imagenes a partir de un mapa de normales en color (normal map), de forma que la orientacion de las superficies y el volumen de la escena se mantienen fijos mientras el prompt de texto define la identidad, los materiales, la ropa y el estilo.

El modelo resuelve un problema concreto de la edicion de imagenes: preservar la estructura geometrica de una referencia mientras se retexturiza o se reinterpreta su apariencia. A diferencia de un ControlNet completo o del adaptador oficial de concatenacion de color/profundidad de MOSS, este es un LoRA de rango 64 en capas lineales y rango 16 en convoluciones, entrenado como adaptador de edicion sobre MOSS-Image-SFT.

Es relevante para flujos de trabajo de ComfyUI y diffusers orientados a reiluminacion, retexturizado y generacion de producto con volumen fijo. El checkpoint seleccionado corresponde al paso de entrenamiento 5000, y el repositorio ocupa 0,3 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA de control (tipo ControlNet) sobre MOSS-Image-SFT; rango 64 en capas lineales, rango 16 en convoluciones |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el modelo base se usa con UNet int8 `moss_image_sft_int8_convrot.safetensors` y text encoder `qwen3.5_9b_w4a8_gptq.safetensors`) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`moss_image_sft_normal_control_lora.safetensors`) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de control que se aplica sobre el UNet de MOSS-Image-SFT. Segun la model card, el LoRA tiene rango 64 en capas lineales y rango 16 en convoluciones, y se entreno como adaptador de edicion: la imagen de control actua como referencia y el prompt describe la imagen a generar. El checkpoint publicado corresponde al paso de entrenamiento 5000.

El modelo base MOSS-Image-SFT emplea un UNet con cuantizacion int8 (`moss_image_sft_int8_convrot.safetensors`), un text encoder basado en Qwen3.5 de 9B con cuantizacion w4a8 GPTQ (`qwen3.5_9b_w4a8_gptq.safetensors`) y un VAE (`flux2-vae_small.safetensors`). El LoRA se entreno con kv cache activada y requiere configurar el formato de edicion `ai-toolkit` tanto en la codificacion positiva como en la negativa. No se detalla en la informacion disponible el numero de tokens, la composicion del dataset de entrenamiento ni si se empleo RLHF o DPO.

## Capacidades

- Control estructural mediante mapas de normales en color (camera-space normals), preservando orientacion de superficies y volumen.
- Retexturizado y cambio de materiales manteniendo la forma original de la escena.
- Generacion guiada por prompt de identidad, ropa, materiales y estilo sobre una referencia de control.
- Funciona como adaptador de control de imagen unica para MOSS-Image-SFT.
- Integracion con ComfyUI mediante el nodo integrado Text Encode MOSS-Image Edit y el flujo de trabajo incluido en el repositorio.
- Compatible con la libreria diffusers.
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso ni capacidades de audio o vision mas alla del control por imagen.
- Capacidad multilingue limitada al ingles segun los metadatos del modelo.

## Casos de uso

- Reiluminacion de formas solidas: se introduce un mapa de normales de un objeto y un prompt que describa la nueva iluminacion y materiales, manteniendo el volumen original gracias al control de orientacion de superficies.
- Retexturizado de producto: en fotografia de producto con volumen fijo, el LoRA conserva la geometria del objeto mientras el prompt define acabados, colores y materiales, util para variantes de catalogo.
- Escenas con profundidad correcta pero direccion de superficie relevante: cuando el mapa de profundidad no basta, el normal map aporta la orientacion de caras necesaria para que el resultado sea coherente.
- Generacion de variantes de vestuario: partiendo de un control de cuerpo completo, el prompt define ropa y estilo (por ejemplo, un maestro de ceremonias con frac escarlata) manteniendo la pose y el volumen.
- Integracion en pipelines de ComfyUI: el flujo incluido carga una foto, construye el mapa de control con BAE Normal Map, lo codifica junto al prompt y muestrea con 30 pasos, CFG 4, euler + simple y fuerza de LoRA 1.0.
- Prototipado de conceptos con estructura fija: util para iterar rapidamente sobre materiales y ambientacion de una forma ya definida sin redibujar la geometria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; depende del modelo base MOSS-Image-SFT (UNet int8, text encoder Qwen3.5 9B w4a8 GPTQ y VAE), no solo del LoRA, que ocupa 0,3 GB.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: ComfyUI (flujo de trabajo incluido en el repositorio) y diffusers; no se documentan otras opciones como vLLM, llama.cpp o TGI para este adaptador.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| thedeoxen/MOSS-Image-normal-controlnet | LoRA de control (normal map) sobre MOSS-Image-SFT | no disponible | no disponible | apache-2.0 | Hugging Face |
| Adaptador oficial de concatenacion color/profundidad de MOSS | Adaptador de control oficial | no disponible | no disponible | no disponible | no disponible |
| ControlNet completo (generico) | ControlNet | no disponible | no disponible | no disponible | no disponible |

La informacion disponible no permite comparar rendimiento numerico con alternativas; los datos de la tabla se limitan a lo documentado en la model card.

## Limitaciones y advertencias

- Requiere un mapa de normales en espacio de camara (colores purpura, cian y verde); no funciona con mapas de altura en escala de grises.
- Los normales ruidosos introducen protuberancias no deseadas; se recomienda suavizar los normales para volumenes mas limpios.
- Con fuerza de LoRA 1.0 el control puede resultar demasiado rigido; el autor sugiere bajar hacia 0.7 si es necesario.
- Es necesario configurar el formato de edicion `ai-toolkit` en la codificacion positiva y negativa; el LoRA se entreno con kv cache activada.
- El modelo esta entrenado y recomendado exclusivamente con OpenMOSS-Team/MOSS-Image-SFT; no se documenta compatibilidad con otros modelos base.
- Idioma soportado limitado al ingles segun los metadatos.
- Riesgo de sesgos y alucinacion: no documentado en la informacion disponible.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero deben respetarse las condiciones del modelo base MOSS-Image-SFT.
- No se proporcionan datos de benchmarks ni de rendimiento en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thedeoxen/MOSS-Image-normal-controlnet
- Pesos: https://huggingface.co/thedeoxen/MOSS-Image-normal-controlnet/blob/main/moss_image_sft_normal_control_lora.safetensors
- Flujo de trabajo ComfyUI: https://huggingface.co/thedeoxen/MOSS-Image-normal-controlnet/blob/main/moss_image_normal_control.json
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
