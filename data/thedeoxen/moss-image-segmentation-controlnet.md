# thedeoxen/MOSS-Image-segmentation-controlnet

## Resumen

MOSS-Image-segmentation-controlnet es un adaptador LoRA de tipo ControlNet para el modelo de edicion de imagen MOSS-Image-SFT, desarrollado por OpenMOSS-Team y distribuido por el usuario thedeoxen. El adaptador permite controlar la generacion de imagenes mediante un mapa de segmentacion de colores planos: el modelo respeta los limites y las masas de las regiones del mapa, mientras que el prompt de texto decide que se representa en cada region (identidad, materiales, ropa, estilo y entorno).

Tecnicamente es un LoRA de rango 64 en capas lineales y rango 16 en convoluciones, entrenado como adaptador de edicion sobre el checkpoint del paso 4500. No es el adaptador oficial de concatenacion de color/profundidad de MOSS, sino un adaptador de edicion que se carga con un cargador LoRA y recibe una unica imagen de control a traves del nodo Text Encode MOSS-Image Edit.

Es relevante para flujos de trabajo de edicion controlada de imagen en ComfyUI, donde se necesita fijar la composicion espacial (personas, mobiliario, fondo) y dejar que el texto defina la apariencia final. El repositorio ocupa 0,3 GB e incluye los pesos en safetensors y un workflow de ComfyUI listo para usar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de edicion tipo ControlNet) sobre MOSS-Image-SFT; rank 64 en capas lineales y rank 16 en convoluciones |
| Parametros totales | no disponible (adaptador LoRA; el modelo base no reporta cifra en la informacion disponible) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible para el LoRA; el modelo base se distribuye con UNet en int8 y text encoder en w4a8 GPTQ |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (moss_image_sft_segmentation_control_lora.safetensors) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de edicion entrenado sobre el modelo base OpenMOSS-Team/MOSS-Image-SFT. Se aplica sobre el UNet del modelo base (fichero moss_image_sft_int8_convrot.safetensors) con una fuerza de 1.0, mientras que el text encoder es qwen3.5_9b_w4a8_gptq.safetensors (tipo moss_image) y el VAE es flux2-vae_small.safetensors. El LoRA emplea rank 64 en las capas lineales y rank 16 en las convoluciones, y fue entrenado como adaptador de edicion con la cache KV activada; por ello el formato de edicion debe fijarse en ai-toolkit tanto en la codificacion positiva como en la negativa.

El checkpoint publicado corresponde al paso de entrenamiento 4500. Los mapas de control usados en el entrenamiento son de colores planos completamente rellenos, sin grandes areas negras sin etiquetar; los colores representan identificadores de region, no los colores que se desean en el resultado. No se detalla en la informacion disponible el numero de tokens, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Edicion de imagen guiada por mapa de segmentacion: respeta los limites y las masas de las regiones de color plano del mapa de control.
- Control de identidad, materiales, ropa y estilo mediante prompt de texto, sin palabra de activacion.
- Adaptador de control de una sola imagen para MOSS-Image-SFT, integrable en el nodo Text Encode MOSS-Image Edit.
- Compatibilidad con ComfyUI mediante workflow incluido (moss_image_segmentation_control.json).
- Integracion con el segmentador semantico UniFormer para construir el mapa de control.
- Reestilizado de escenas manteniendo la composicion espacial de personas, mobiliario y fondo.
- Generacion de layouts de guion de color donde solo se deciden las formas.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni vision mas alla del control por imagen.

## Casos de uso

- Bloqueo de escenas por regiones y reestilizado: se construye un mapa de segmentacion con masas planas de personas, objetos y fondo, y el prompt define el nuevo estilo y los materiales de cada region; el adaptador mantiene la estructura espacial mientras cambia la apariencia.
- Previsualizacion de composicion en produccion audiovisual: se fija el layout de personajes y decorados con un mapa de colores y se generan variantes de render para revisar la composicion antes de producir assets definitivos.
- Guion de color para animacion o ilustracion: se define unicamente la forma de cada region y el prompt asigna la paleta y los materiales finales, lo que permite iterar sobre el color sin rehacer el dibujo base.
- Edicion de fotografias manteniendo el layout: a partir de un mapa de segmentacion de una foto, se cambia el sujeto, la ropa o el entorno mediante prompt conservando las masas y los limites originales.
- Generacion de variantes de escena para catalogos o storyboards: se reutiliza un mismo mapa de control con distintos prompts para obtener multiples versiones coherentes en composicion de una misma escena.
- Integracion en pipelines de ComfyUI para artistas tecnicos: el workflow incluido permite encadenar segmentacion UniFormer, codificacion de texto con formato ai-toolkit y muestreo con 30 pasos, CFG 4 y sampler euler/simple, facilitando la automatizacion de ediciones controladas.
- Prototipado rapido de conceptos visuales: con un mapa de regiones simple y un prompt descriptivo se generan conceptos de personajes o entornos en los que la posicion y la silueta estan fijadas de antemano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio del LoRA ocupa 0,3 GB; el modelo base MOSS-Image-SFT debe cargarse adicionalmente con su UNet en int8, text encoder Qwen de 9B en w4a8 GPTQ y VAE flux2-vae_small.
- VRAM estimada para inferencia: no disponible en la informacion proporcionada; depende del modelo base completo, no solo del adaptador.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no disponible; el adaptador por si solo es ligero, pero el modelo base condiciona el requisito real de VRAM.
- Opciones de despliegue: ComfyUI (workflow incluido), con cargador LoRA y nodo Text Encode MOSS-Image Edit; libreria diffusers como formato de publicacion.
- Latencia y throughput: no disponible en la informacion proporcionada; el workflow de referencia usa 30 pasos de muestreo con CFG 4, sampler euler y scheduler simple.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| thedeoxen/MOSS-Image-segmentation-controlnet | LoRA de control por segmentacion sobre MOSS-Image-SFT | no disponible | no disponible | apache-2.0 | Hugging Face, workflow ComfyUI incluido |
| Adaptador oficial de color/profundidad de MOSS-Image | Adaptador de concatenacion del modelo base | no disponible | no disponible | no disponible | Referenciado en la model card como alternativa oficial |
| Otros adaptadores ControlNet para difusion de imagen | Adaptadores de control (canny, depth, segmentation) | no disponible | no disponible | variable segun autor | Ecosistema diffusers/ComfyUI |

La informacion disponible no permite comparar metricas de rendimiento con alternativas; la comparativa se limita a tipo de adaptador, licencia y forma de distribucion.

## Limitaciones y advertencias

- El adaptador esta entrenado y recomendado exclusivamente con OpenMOSS-Team/MOSS-Image-SFT; usarlo con otro modelo base puede degradar el resultado.
- Requiere fijar el formato de edicion en ai-toolkit en la codificacion positiva y negativa, ya que fue entrenado con cache KV activada.
- Los mapas de control deben ser de colores planos y solidos; gradientes y texturas confunden las regiones.
- El color de una region no se traduce al color del resultado: los colores son identificadores de region y el material debe indicarse en el prompt.
- Los mapas generados con UniFormer se ajustan mejor a estos pesos que los de segmentadores que dejan el fondo en negro.
- Si el control resulta demasiado rigido, se recomienda bajar la fuerza del LoRA hacia 0,7; el valor entrenado es 1.0.
- Idioma soportado: unicamente ingles en la metadata del modelo.
- Riesgo de alucinacion y sesgos: no se documentan en la informacion disponible; al ser un adaptador de imagen, los sesgos dependen del modelo base y de los datos de entrenamiento de este.
- Licencia apache-2.0 para el adaptador; las restricciones del modelo base deben consultarse en su propia model card.
- No se documentan limitaciones de contexto ni de longitud de prompt en la informacion disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/thedeoxen/MOSS-Image-segmentation-controlnet
- Pesos del LoRA: https://huggingface.co/thedeoxen/MOSS-Image-segmentation-controlnet/blob/main/moss_image_sft_segmentation_control_lora.safetensors
- Workflow de ComfyUI: https://huggingface.co/thedeoxen/MOSS-Image-segmentation-controlnet/blob/main/moss_image_segmentation_control.json
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
