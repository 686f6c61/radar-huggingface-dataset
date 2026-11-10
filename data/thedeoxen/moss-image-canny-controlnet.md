# thedeoxen/MOSS-Image-canny-controlnet

## Resumen

MOSS-Image-canny-controlnet es un adaptador de tipo LoRA para el modelo de difusión MOSS-Image-SFT, desarrollado por el usuario thedeoxen (no por OpenMOSS-Team, autores del modelo base). Se trata de un ControlNet-style edit LoRA que permite condicionar la generación de imágenes mediante mapas de bordes Canny: el usuario proporciona una imagen de control (líneas blancas sobre fondo negro) y un prompt de texto, y el modelo genera una imagen que respeta la estructura y silueta del mapa de control mientras el texto define materiales, color, identidad y estilo.

El adaptador resuelve un problema concreto dentro del ecosistema MOSS-Image: añadir control estructural preciso (composición, encuadre, contornos finos) a un modelo de edición imagen-a-imagen que de otro modo depende principalmente del prompt. No es el adaptador oficial de color/profundidad por concatenación de MOSS, sino un LoRA de edición entrenado como adaptador de control de imagen única, pensado para cargarse con un LoRA loader en ComfyUI.

El repositorio es pequeño (0,3 GB) y contiene únicamente los pesos del LoRA en safetensors, un workflow de ComfyUI y ejemplos. El checkpoint seleccionado corresponde al paso de entrenamiento 4500. Es relevante para desarrolladores que ya trabajan con MOSS-Image-SFT y necesitan control de layout reproducible sin reentrenar el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre UNet de difusión MOSS-Image-SFT; rank 64 en capas lineales, rank 16 en convoluciones |
| Parametros totales | no disponible (repo de 0,3 GB; pesos del LoRA en safetensors) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen; no aplica ventana de tokens de texto) |
| Tipos de cuantizacion | no disponible para el LoRA; el modelo base se usa con UNet int8 (`moss_image_sft_int8_convrot.safetensors`) y text encoder `qwen3.5_9b_w4a8_gptq.safetensors` |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`moss_image_sft_canny_control_lora.safetensors`) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de bajo rango inyectado en el UNet del modelo base MOSS-Image-SFT, con rank 64 en las capas lineales y rank 16 en las convoluciones. Se entrenó como adaptador de edición: la imagen de control (mapa Canny) actúa como referencia y el prompt describe la imagen a generar. El entrenamiento se realizó con kv cache activado, lo que obliga a configurar el formato de edición `ai-toolkit` tanto en la codificación positiva como en la negativa. El checkpoint publicado corresponde al paso 4500.

El modelo base sobre el que se aplica es MOSS-Image-SFT de OpenMOSS-Team, que se carga con tres componentes: UNet `moss_image_sft_int8_convrot.safetensors`, text encoder `qwen3.5_9b_w4a8_gptq.safetensors` (tipo `moss_image`) y VAE `flux2-vae_small.safetensors`. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicó RLHF o DPO al adaptador.

## Capacidades

- Control estructural por mapas Canny: sigue contornos de objetos, encuadre y bordes finos de la imagen de control.
- Edición imagen-a-imagen condicionada por prompt: el texto define identidad, materiales, ropa, color y ambientación mientras el mapa de control fija el layout.
- Adaptador de control de imagen única para MOSS-Image-SFT.
- Integración con ComfyUI mediante el nodo `Text Encode MOSS-Image Edit` y el workflow incluido.
- Extracción de bordes con el nodo Canny Edge de comfyui_controlnet_aux (umbrales bajo 100, alto 200).
- Ajuste de rigidez del control mediante la fuerza del LoRA (valor entrenado 1.0; bajar hacia 0.7 si el control resulta demasiado rígido).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un adaptador de generación de imágenes, no un modelo de lenguaje.
- Capacidades multilingües: no disponibles; el modelo declara únicamente inglés.

## Casos de uso

- Recoloreado de composiciones manteniendo el contorno: se extrae el mapa Canny de una imagen existente, se carga el LoRA a fuerza 1.0 y se cambia el prompt para alterar paleta y materiales sin mover la silueta.
- Transformación de material y estilo a partir de los bordes de una foto: útil para pasar de fotografía a ilustración, pintura o render manteniendo el encuadre original.
- Estudios de layout con silueta fija: en diseño de personajes o producto, se fija la pose y el contorno con el mapa de control y se itera únicamente sobre el prompt para explorar variantes de vestuario y ambientación.
- Generación de imágenes de producto con composición controlada: se define la silueta del objeto mediante Canny y se ajustan materiales y color por prompt, garantizando encuadres consistentes entre variantes.
- Previsualización de escenas para storyboard: a partir de un boceto o foto de referencia se generan versiones acabadas con el mismo encuadre, acelerando la exploración visual.
- Integración en pipelines de ComfyUI para producción de assets: el workflow incluido permite automatizar extracción de bordes, codificación y muestreo con parámetros fijos (30 pasos, CFG 4, euler + simple).
- Control de pose y encuadre en ilustración de personajes: el mapa Canny fija la silueta corporal (por ejemplo, vista de tres cuartos con un brazo alzado) mientras el prompt define vestuario y escenario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; depende del modelo base MOSS-Image-SFT (UNet int8, text encoder Qwen 9B en w4a8 GPTQ y VAE flux2), no solo del LoRA, que ocupa 0,3 GB en disco.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; el uso de cuantización int8 en el UNet y w4a8 en el text encoder sugiere orientación a reducir huella de memoria, pero no se especifica si cabe en RTX 4090 u otras GPU de consumo.
- Opciones de despliegue: ComfyUI con LoRA loader y el nodo `Text Encode MOSS-Image Edit` (flujo documentado). Otros backends (vLLM, llama.cpp, Ollama, TGI) no aplican a un adaptador de difusión y no se documentan.
- Latencia y throughput: no disponible.
- Parámetros de muestreo documentados: 30 pasos, CFG 4, sampler euler con scheduler simple, fuerza de LoRA 1.0.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| thedeoxen/MOSS-Image-canny-controlnet | LoRA de control Canny sobre MOSS-Image-SFT | no disponible (repo 0,3 GB) | no aplica | apache-2.0 | Hugging Face, 0 descargas, 0 likes |
| OpenMOSS-Team/MOSS-Image-SFT | Modelo base de difusión para edición de imagen | no disponible | no aplica | no disponible en la información | Hugging Face (modelo base referenciado) |
| Adaptador oficial de color/profundidad de MOSS | Adaptador por concatenación (no LoRA) | no disponible | no aplica | no disponible en la información | Referenciado en la model card como alternativa oficial |

No se dispone de datos de rendimiento comparativo entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- El adaptador está entrenado exclusivamente para mapas Canny; no funciona como adaptador de color, profundidad u otras modalidades de control.
- Requiere configuración específica: formato de edición `ai-toolkit` en codificación positiva y negativa, y kv cache activado, por cómo se entrenó. Omitirlo puede degradar los resultados.
- Depende de los tres componentes exactos del modelo base (UNet int8, text encoder Qwen 9B w4a8 GPTQ, VAE flux2); cambios en el modelo base pueden romper la compatibilidad.
- Idioma: solo inglés declarado; prompts en otros idiomas no están garantizados.
- Riesgo de alucinación visual y artefactos: no se documentan evaluaciones de calidad ni métricas; el repositorio tiene 0 descargas y 0 likes, sin validación de la comunidad.
- Sesgos conocidos: no documentados; al ser un adaptador sobre un modelo base, hereda los sesgos de este, no evaluados en la información disponible.
- El prompt negativo usado en entrenamiento (`nsfw, worst quality, bad anatomy, watermark, jpeg artifact`) sugiere que el modelo base puede producir contenido no deseado sin filtrado explícito.
- Licencia apache-2.0 para el adaptador; deben verificarse por separado las condiciones de licencia del modelo base MOSS-Image-SFT antes de uso comercial.
- Ajustes de control: con fuerza 1.0 el resultado puede adherirse demasiado a cada mota del mapa; se recomienda subir los umbrales de Canny o bajar la fuerza hacia 0.7.
- No es un modelo de lenguaje: no ofrece tool calling, agentes ni razonamiento textual.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/thedeoxen/MOSS-Image-canny-controlnet
- Pesos del LoRA: https://huggingface.co/thedeoxen/MOSS-Image-canny-controlnet/blob/main/moss_image_sft_canny_control_lora.safetensors
- Workflow de ComfyUI: https://huggingface.co/thedeoxen/MOSS-Image-canny-controlnet/blob/main/moss_image_canny_control.json
- Modelo base MOSS-Image-SFT: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- comfyui_controlnet_aux: https://github.com/Fannovel16/comfyui_controlnet_aux
