# thedeoxen/MOSS-Image-normal-control-lora

## Resumen

MOSS-Image-normal-control-lora es un adaptador LoRA de control por mapa de normales para el modelo de difusion de imagenes MOSS-Image-SFT, desarrollado por el usuario thedeoxen y publicado bajo licencia Apache 2.0. No se trata de un modelo generativo autonomo, sino de un adaptador de tipo ControlNet-like que se carga sobre el UNet del modelo base y condiciona la generacion a la orientacion de superficie de una imagen de control (un mapa de normales en espacio de camara). El prompt de texto define identidad, materiales, ropa y estilo, mientras que el mapa de normales fija el volumen y la orientacion de las superficies.

El adaptador se entrena como un edit adapter: la imagen de control actua como referencia y el prompt describe la imagen a generar. La arquitectura del LoRA es de rango 64 en capas lineales y rango 16 en convoluciones, con un checkpoint seleccionado en el paso de entrenamiento 5000. El repositorio ocupa 0,3 GB y los pesos se distribuyen en formato safetensors, con un workflow de ComfyUI incluido.

Su relevancia practica esta en el control estructural preciso de la generacion imagen-a-imagen: permite mantener la forma y el volumen de un objeto mientras se cambian materiales, iluminacion o contexto mediante texto, algo util en produccion de imagenes de producto, retexturizado y relighting. La integracion esta pensada para el ecosistema ComfyUI y la libreria diffusers, con el modelo base OpenMOSS-Team/MOSS-Image-SFT como dependencia obligatoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA de control (ControlNet-like) sobre UNet de difusion; rango 64 en capas lineales y rango 16 en convoluciones |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen, no de texto) |
| Tipos de cuantizacion | no disponible para el LoRA; el modelo base se usa con UNet int8 convrot y text encoder w4a8 GPTQ |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | OpenMOSS-Team/MOSS-Image-SFT |
| Paso de entrenamiento seleccionado | 5000 |
| Tamano del repositorio | 0,3 GB |
| Fuerza de LoRA recomendada | 1.0 (reducir a 0.7 si el control resulta demasiado rigido) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de control que se inyecta en el UNet del modelo base MOSS-Image-SFT. A diferencia de un ControlNet completo, no anade un codificador de control independiente, sino que modifica las capas existentes del UNet mediante matrices de bajo rango: rango 64 en las capas lineales y rango 16 en las convoluciones. Se entrena como edit adapter, donde la imagen de control (mapa de normales en espacio de camara, con los colores habituales purpura, cian y verde) actua como referencia estructural y el prompt de texto aporta la apariencia, los materiales y el contexto.

El entrenamiento se realizo sobre MOSS-Image-SFT con la cache KV activada, y el checkpoint publicado corresponde al paso 5000. Los mapas de entrenamiento son normales en espacio de camara, no mapas de altura en escala de grises. No se dispone de informacion sobre el numero de tokens, la composicion del dataset ni el uso de RLHF o DPO, ya que se trata de un adaptador de imagen y no de un modelo de lenguaje. La innovacion principal es el uso de un LoRA como sustituto ligero de un ControlNet para control estructural por normales, con un workflow de ComfyUI que integra el nodo Text Encode MOSS-Image Edit con formato de edicion ai-toolkit.

## Capacidades

- Control estructural por mapa de normales: sigue la orientacion de superficie y el volumen de la imagen de control mientras el prompt cambia materiales y apariencia.
- Generacion imagen-a-imagen condicionada por texto: la identidad, la ropa, los materiales y el mundo se definen en el prompt.
- Control de volumen y orientacion de objetos solidos, manteniendo la forma fija mientras se retexturiza o se reilumina.
- Integracion con ComfyUI mediante el nodo Text Encode MOSS-Image Edit y el workflow incluido.
- Compatibilidad con diffusers como libreria de carga.
- Sin trigger word: el control lo aporta la imagen de control, no una palabra clave.
- Soporte de negative prompt (por ejemplo, `nsfw, worst quality, bad anatomy, watermark, jpeg artifact`).
- Capacidades multilingues: solo ingles (`en`) segun la model card.

## Casos de uso

- Retexturizado de formas solidas: se parte de un mapa de normales de un objeto y se cambia el material mediante prompt (por ejemplo, de plastico a metal o a tela), manteniendo el volumen y la orientacion originales.
- Relighting de producto: en fotografia de producto donde el volumen del objeto es fijo, el adaptador permite regenerar la iluminacion y los materiales sin alterar la geometria.
- Escenas con profundidad correcta y orientacion de superficie relevante: util cuando no basta con un mapa de profundidad y hace falta controlar hacia donde miran las superficies.
- Generacion de variaciones de vestuario: con un mapa de normales de una figura humana, el prompt define la ropa y el estilo mientras se conserva la pose y el volumen corporal.
- Integracion en pipelines de ComfyUI: el workflow incluido carga una foto, construye el mapa de control con BAE Normal Map, lo codifica con el prompt y muestrea con 30 pasos, CFG 4, euler y simple.
- Prototipado de conceptos con control estructural: para artistas y disenadores que necesitan iterar sobre materiales y ambientacion manteniendo la forma de un boceto o referencia 3D.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita para el LoRA; depende del modelo base MOSS-Image-SFT, que se carga con UNet int8 convrot, text encoder Qwen3.5 9B en w4a8 GPTQ y VAE flux2-vae_small.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Cabe en consumer GPU: no disponible; el requisito vendra determinado por el modelo base y sus cuantizaciones.
- Opciones de despliegue: ComfyUI (workflow incluido) y diffusers; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de difusion de imagen.
- Latencia y throughput estimados: no disponible.
- Configuracion de muestreo recomendada: 30 pasos, CFG 4, sampler euler con scheduler simple, fuerza de LoRA 1.0.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| thedeoxen/MOSS-Image-normal-control-lora | LoRA de control por normales sobre MOSS-Image-SFT | no disponible (rango 64/16) | no aplica | apache-2.0 | Hugging Face, ComfyUI |
| ControlNet clasico (por ejemplo, para Stable Diffusion) | Red de control completa | no disponible | no aplica | variable segun modelo | Hugging Face, ComfyUI |
| Adaptador oficial color/depth concat de MOSS | Adaptador de concatenacion oficial | no disponible | no aplica | no disponible | Repositorio OpenMOSS-Team |

La comparativa directa con alternativas de la misma categoria no esta disponible en la informacion proporcionada; el propio autor distingue este LoRA de un ControlNet completo y del adaptador oficial de concatenacion color/depth de MOSS.

## Limitaciones y advertencias

- Requiere el modelo base OpenMOSS-Team/MOSS-Image-SFT; no funciona de forma autonoma.
- Solo soporta ingles segun la model card.
- El control debe ser un mapa de normales en espacio de camara, no un mapa de altura en escala de grises; usar el tipo incorrecto degrada el resultado.
- Normales ruidosas introducen protuberancias no deseadas; se recomiendan normales suavizadas.
- Si el control resulta demasiado rigido, se recomienda bajar la fuerza del LoRA hacia 0.7.
- El formato de edicion debe configurarse como `ai-toolkit` tanto en el encode positivo como en el negativo, y el LoRA se entreno con cache KV activada.
- Riesgo de alucinacion y sesgos: no se documentan en la informacion disponible; como modelo generativo de imagen, puede producir artefactos anatomicos o de calidad, de ahi el negative prompt recomendado.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base puede tener sus propias condiciones que deben verificarse por separado.
- No se han publicado benchmarks ni evaluaciones cuantitativas de calidad o fidelidad al control.

## Enlaces

- Hugging Face: https://huggingface.co/thedeoxen/MOSS-Image-normal-control-lora
- Repositorio del autor: https://huggingface.co/thedeoxen/MOSS-Image-normal-controlnet
- Pesos: https://huggingface.co/thedeoxen/MOSS-Image-normal-controlnet/blob/main/moss_image_sft_normal_control_lora.safetensors
- Workflow de ComfyUI: https://huggingface.co/thedeoxen/MOSS-Image-normal-controlnet/blob/main/moss_image_normal_control.json
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
