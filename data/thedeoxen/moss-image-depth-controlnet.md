# thedeoxen/MOSS-Image-depth-controlnet

## Resumen

MOSS-Image-depth-controlnet es un adaptador LoRA de control por profundidad para el modelo generativo de imágenes MOSS-Image-SFT, desarrollado por el usuario thedeoxen y publicado bajo licencia Apache 2.0. Se trata de un LoRA tipo ControlNet que permite condicionar la generación de imágenes a un mapa de profundidad en escala de grises (cerca en blanco, lejos en negro), de modo que el modelo respeta la disposición espacial y la distancia de cámara del mapa de control mientras el prompt de texto define el sujeto, los materiales y el estilo.

El adaptador se construye sobre OpenMOSS-Team/MOSS-Image-SFT y se distribuye en formato safetensors para la librería diffusers, con un flujo de trabajo de ComfyUI incluido. El checkpoint seleccionado corresponde al paso de entrenamiento 5000. El repositorio ocupa aproximadamente 0,3 GB, lo que refleja que se trata de un adaptador ligero y no de un modelo completo.

Su relevancia radica en que aporta control estructural preciso a un modelo de edición de imágenes sin necesidad de reentrenar el modelo base: basta con cargar el LoRA sobre el UNet y pasar un único mapa de control a través del nodo de codificación de texto de MOSS-Image Edit. Es una pieza práctica para flujos de trabajo de image-to-image donde la composición de cámara importa más que el detalle de cada borde.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA tipo ControlNet sobre MOSS-Image-SFT (adaptador de edición); rank 64 en capas lineales y rank 16 en convoluciones |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible para el LoRA; el modelo base se usa con UNet int8 (`moss_image_sft_int8_convrot.safetensors`) y text encoder w4a8 GPTQ |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (diffusers); incluye workflow de ComfyUI en JSON |

## Arquitectura y entrenamiento

El adaptador es un LoRA de control por profundidad con rank 64 en las capas lineales y rank 16 en las convoluciones. Se entrenó como adaptador de edición: la imagen de control actúa como referencia y el prompt describe la imagen a generar. El checkpoint publicado corresponde al paso 5000 de entrenamiento. No se especifica en la información disponible el número total de tokens de entrenamiento ni la composición exacta del dataset.

El LoRA se entrena con la caché KV activada y requiere que el formato de edición se configure como `ai-toolkit` tanto en la codificación positiva como en la negativa. Los mapas de control de entrenamiento se generan con Depth Anything V2 (`depth_anything_v2_vitl`), con las superficies cercanas en blanco y el fondo degradándose a negro. El prompt negativo usado en las muestras de entrenamiento es `nsfw, worst quality, bad anatomy, watermark, jpeg artifact`.

## Capacidades

- Control de composición por profundidad: sigue la disposición de cerca a lejos a partir de un mapa de profundidad en escala de grises.
- Generación condicionada por prompt: la identidad, los materiales, la ropa y el estilo se definen mediante el texto.
- Adaptador de control de imagen única para MOSS-Image-SFT.
- Integración con ComfyUI mediante el nodo Text Encode MOSS-Image Edit y un flujo de trabajo incluido.
- Compatible con la librería diffusers.
- Sin palabra de activación (trigger word): la imagen de control fija la estructura.
- Ajuste de intensidad del LoRA (1.0 como valor entrenado; se puede bajar hacia 0.7 si el control resulta demasiado rígido).

## Casos de uso

- Reconstrucción de escenas con la misma profundidad de cámara en un estilo nuevo: se aporta el mapa de profundidad de la escena original y un prompt que describe el nuevo estilo, y el LoRA mantiene la disposición espacial mientras cambia la apariencia.
- Separación de primer plano y fondo al cambiar materiales: útil para sustituir materiales de un producto o de un interior manteniendo la relación de distancia entre el sujeto cercano y el entorno.
- Disposición de productos e interiores con un sujeto cercano claro: el mapa de profundidad define la colocación del objeto principal y el prompt define su aspecto y el entorno.
- Flujos de image-to-image en ComfyUI: el workflow incluido carga una foto, construye el mapa con Depth Anything V2, lo codifica con el prompt y muestrea, lo que permite integrarlo en pipelines de generación por lotes.
- Previsualización conceptual de escenas 3D: a partir de un render de profundidad se generan variantes fotorrealistas o estilizadas con la misma composición de cámara.
- Control de layout en ilustración y diseño: cuando la posición y el tamaño relativo de los elementos importan más que los contornos exactos, el mapa de profundidad guía la composición con libertad para la textura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; depende del modelo base MOSS-Image-SFT y de su cuantización (UNet int8 y text encoder w4a8 GPTQ).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: ComfyUI (workflow incluido) y diffusers.
- Latencia y throughput estimados: no disponible.
- Configuración de muestreo del workflow: 30 pasos, CFG 4, sampler `euler` con scheduler `simple`, fuerza del LoRA 1.0.

## Comparativa con modelos similares

| Modelo | Tipo | Control | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| thedeoxen/MOSS-Image-depth-controlnet | LoRA tipo ControlNet sobre MOSS-Image-SFT | Profundidad (mapa en escala de grises) | Imagen de control única + prompt | apache-2.0 | Hugging Face, ComfyUI |
| ControlNet para Stable Diffusion | ControlNet completo | Profundidad, Canny, Pose, etc. | Imagen de control + prompt | según variante | Amplia |
| Adaptador oficial color/depth de MOSS | Adaptador de concatenación | Color y profundidad | Imagen de control + prompt | según modelo base | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- El LoRA está entrenado exclusivamente para mapas de profundidad con cerca en blanco; un mapa invertido contradice el entrenamiento del adaptador.
- Requiere el modelo base OpenMOSS-Team/MOSS-Image-SFT y una configuración concreta (formato de edición `ai-toolkit`, caché KV activada); una configuración incorrecta degrada los resultados.
- Solo soporta inglés según la metadata del repositorio.
- Las regiones de profundidad planas y extensas dejan más libertad al prompt para la textura, lo que puede reducir el control estructural en esas zonas.
- Es un adaptador ligero, no un modelo completo: su calidad depende del modelo base.
- No se han publicado datos de sesgos, tasas de alucinación visual ni evaluaciones cuantitativas en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base MOSS-Image-SFT antes de desplegarlo en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/thedeoxen/MOSS-Image-depth-controlnet
- Pesos del LoRA: https://huggingface.co/thedeoxen/MOSS-Image-depth-controlnet/blob/main/moss_image_sft_depth_control_lora.safetensors
- Workflow de ComfyUI: https://huggingface.co/thedeoxen/MOSS-Image-depth-controlnet/blob/main/moss_image_depth_control.json
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
