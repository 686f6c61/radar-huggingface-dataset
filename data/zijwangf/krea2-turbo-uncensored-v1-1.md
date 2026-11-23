# zijwangf/krea2-turbo-uncensored-v1.1

## Resumen
Krea 2 Turbo Uncensored v1.1 es un modelo de difusion para generacion y edicion de imagenes, publicado por el usuario zijwangf en Hugging Face. Se trata de una compilacion pre-fusionada y cuantizada del modelo base Krea 2 Turbo, a la que se han incorporado cinco fine-tunes (LoRAs) directamente en los pesos: un LoRA de detalle fino, un LoRA de edicion de identidad, un LoRA turbo de 4 pasos, un LoRA de refinado de piel y un LoRA de reduccion de rechazos de contenido NSFW. El resultado es un modelo orientado a generacion de imagenes sin censura y a edicion rapida por instrucciones en lenguaje natural.

El modelo cuenta con 12.820.073.036 parametros (unos 12,8 mil millones) y se distribuye en formatos safetensors, GGUF y FP8, con un tamano de repositorio de 36,4 GB. La arquitectura es de tipo transformer de difusion, con un text encoder Qwen3-VL de 4B y un VAE heredado de Qwen-Image. Su principal atractivo es la reduccion del numero minimo de pasos de inferencia de 8 a 4 gracias al LoRA turbo de rango 64, lo que permite generar imagenes en muy pocos pasos y con CFG fijo a 1.0.

Es relevante ahora porque combina en un unico artefacto la capacidad de edicion por identidad y la generacion rapida en pocos pasos, con una licencia MIT permisiva y variantes cuantizadas que caben en GPUs de consumo. No obstante, el modelo esta explicitamente marcado como no apto para todo publico y su uso esta orientado a contenido para adultos.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (modelo de imagen), con text encoder Qwen3-VL 4B y VAE Qwen-Image |
| Parametros totales | 12.820.073.036 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (Q4_K_M), FP8, safetensors |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | safetensors, GGUF, FP8 |

## Arquitectura y entrenamiento
El modelo es un transformer de difusion para imagenes, no un modelo de lenguaje. Parte de Krea 2 Turbo y de la variante de edicion de identidad conradlocke/krea2-identity-edit. Sobre esa base se han fusionado cinco LoRAs con intensidades concretas: Fine Detail LoRA a 0,75, Identity Edit LoRA a 1,0, 4-step Turbo LoRA de rango 64 a 1,0, Skin Detail LoRA a 0,45 y Refusal Reduction NSFW LoRA de rango 64 a 0,8. La fusion se ha realizado en los pesos, por lo que no es necesario cargar los LoRAs por separado en tiempo de inferencia.

La innovacion principal es la reduccion del numero minimo de pasos utilizables de 8 a 4 mediante el LoRA turbo, junto con el uso de CFG 1.0 obligatorio para las variantes turbo. El text encoder es Qwen3-VL de 4B en FP8 escalado (5,24 GB) y el VAE es qwen_image_vae.safetensors (254 MB). No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO, ya que el modelo es de difusion y la model card no detalla el proceso de entrenamiento de la base.

## Capacidades
- Generacion de imagenes texto-a-imagen con prompts detallados y directos.
- Edicion de imagenes imagen-a-imagen mediante instrucciones en lenguaje natural (cambio de ropa, sustitucion de elementos, modificacion de escenas).
- Preservacion de identidad facial en ediciones, gracias al Identity Edit LoRA, aunque con limitaciones segun la fuerza del prompt.
- Generacion en 4 pasos minimos (8 pasos recomendados, 16 maximo) con CFG fijo a 1.0.
- Refinado de detalle facial y de piel para reducir el aspecto "plastico".
- Generacion de contenido NSFW sin censura, con un LoRA especifico de reduccion de rechazos.
- Soporte bilingue de prompts en ingles y chino.
- No se documenta soporte de tool calling, agentes ni razonamiento multi-paso, al no ser un modelo de lenguaje.

## Casos de uso
- Generacion de retratos y figuras de cuerpo completo en estudio: con resolucion de 1024x1024 y 8 pasos, el modelo produce imagenes de cuerpo 3/4 con iluminacion controlada, adecuado para pruebas de concepto visuales rapidas.
- Edicion de identidad en fotografia: el Identity Edit LoRA a fuerza 1.0 permite mantener rasgos faciales al cambiar vestuario o entorno, util para variaciones de una misma sesion fotografica.
- Iteracion rapida de conceptos visuales: al requerir solo 4 pasos minimos y CFG 1.0, permite explorar decenas de variaciones en pocos minutos en una GPU de consumo.
- Creacion de contenido para adultos: el modelo esta disenado explicitamente para generar material NSFW sin restricciones, con terminos directos o coloquiales en el prompt.
- Prototipado de pipelines de difusion en ComfyUI: se integra en la carpeta `diffusion_models` con el cargador GGUF actualizado, lo que facilita probar flujos de trabajo de edicion y generacion.
- Investigacion sobre mitigacion de rechazos y sesgos en modelos generativos: la presencia del Refusal Reduction LoRA permite estudiar el comportamiento del modelo ante prompts sensibles en entornos controlados.
- Despliegue en entornos con VRAM limitada: la variante GGUF Q4_K_M (7,22 GB) permite ejecutar el transformer en GPUs de gama media, con el text encoder y el VAE como componentes adicionales.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada: la variante GGUF Q4_K_M del transformer ocupa 7,22 GB; el text encoder Qwen3-VL 4B en FP8 ocupa 5,24 GB y el VAE 254 MB. En total, se necesita aproximadamente entre 13 y 14 GB de VRAM para cargar todos los componentes en FP8/GGUF, mas el margen para activaciones.
- La variante FP8 del transformer no especifica su tamano exacto en la informacion disponible, pero se indica que es el doble de rapida incluso en VRAM baja.
- GPU recomendadas: no se detallan modelos concretos. Por el consumo de VRAM, una RTX 4090 (24 GB) o una RTX 3090 (24 GB) permiten cargar el conjunto completo; una RTX 4080 (16 GB) queda justa y puede requerir offloading.
- Cabe en GPU de consumo: si, con la variante GGUF Q4_K_M y gestion de memoria cuidadosa; en GPUs de 12 GB probablemente sea necesario descargar el text encoder a CPU.
- Opciones de despliegue: ComfyUI con el cargador GGUF actualizado (canal remoto de ComfyUI Manager), y la libreria diffusers para los pesos safetensors/FP8. No se documentan vLLM, llama.cpp ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no se proporcionan cifras concretas; solo se afirma que FP8 es aproximadamente 2 veces mas rapido que otras variantes y que la generacion en 8 pasos es "muy rapida".

## Comparativa con modelos similares
| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| zijwangf/krea2-turbo-uncensored-v1.1 | 12,8 mil millones | no disponible | MIT | Difusion de imagen, edicion, NSFW | Hugging Face |
| krea/Krea-2-Turbo (base) | no disponible | no disponible | no disponible | Difusion de imagen turbo | Hugging Face |
| conradlocke/krea2-identity-edit (base) | no disponible | no disponible | no disponible | Edicion con preservacion de identidad | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias
- Contenido para adultos: el modelo esta etiquetado como `not-for-all-audiences` y genera NSFW de forma deliberada; no es apto para entornos sin control de edad.
- La edicion no es perfecta: la propia model card advierte que las caras pueden cambiar entre generaciones si el prompt no es suficientemente fuerte.
- Requiere prompts muy detallados y directos; instrucciones vagas producen resultados inconsistentes.
- CFG debe fijarse siempre a 1.0 en variantes turbo; otros valores degradan la calidad.
- Resolucion minima de 512x512 y recomendada de 1024x1024; no se documenta soporte para resoluciones superiores.
- Aunque se mencionan "guardrails" para impedir contenido ilegal, el modelo esta disenado para reducir rechazos, lo que aumenta el riesgo de generar contenido no deseado o inapropiado.
- Sesgos conocidos: no documentados en la informacion disponible.
- Riesgo de alucinacion visual y artefactos: no cuantificado en la informacion disponible.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantias sobre el contenido generado ni sobre la legalidad de su uso en jurisdicciones concretas.
- El modelo base y los LoRAs fusionados pueden tener sus propias condiciones; la model card no detalla la licencia de cada componente original.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion de la comunidad.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/zijwangf/krea2-turbo-uncensored-v1.1
- Modelo base Krea 2 Turbo: https://huggingface.co/krea/Krea-2-Turbo
- Modelo base de edicion de identidad: https://huggingface.co/conradlocke/krea2-identity-edit
- Repositorio FP8 de referencia (ChrisColeTech): https://huggingface.co/ChrisColeTech/krea2-turbo-uncensored-v1.1-FP8
- Transformer GGUF Q4_K_M: https://huggingface.co/ChrisColeTech/krea2-turbo-uncensored-v1.1-FP8/resolve/main/split/diffusion_models/Krea2_turbo_uncensored_edit_v1.1-Q4_K_M.gguf
- Text encoder Qwen3-VL 4B FP8: https://huggingface.co/ChrisColeTech/krea2-turbo-uncensored-v1.1-FP8/resolve/main/split/text_encoders/qwen3vl_4b_fp8_scaled.safetensors
- VAE Qwen-Image: https://huggingface.co/ChrisColeTech/krea2-turbo-uncensored-v1.1-FP8/resolve/main/split/vae/qwen_image_vae.safetensors
