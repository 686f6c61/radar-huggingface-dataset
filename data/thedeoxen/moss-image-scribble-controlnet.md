# thedeoxen/MOSS-Image-scribble-controlnet

## Resumen

MOSS-Image-scribble-controlnet es un adaptador de control tipo LoRA (denominado "controlnet" por el autor, aunque no es un ControlNet completo) para el modelo de generación y edición de imágenes MOSS-Image-SFT del equipo OpenMOSS. Lo desarrolla el usuario independiente thedeoxen y su función es permitir que MOSS-Image-SFT siga un boceto de trazos libres (scribble) como guía estructural: el control aporta las masas y líneas principales, mientras que el prompt de texto define identidad, materiales, ropa y estilo. Resuelve el problema de controlar la composición de una generación de imagen sin necesidad de un mapa de bordes denso, algo útil en fases tempranas de diseño.

El adaptador se distribuye como un fichero safetensors de aproximadamente 0,3 GB (rank 64 en capas lineales y rank 16 en convoluciones) que se carga sobre el UNet de MOSS-Image-SFT con un cargador de LoRA, sin palabra de activación. Está entrenado como adaptador de edición: la imagen de control actúa como referencia y el prompt describe la escena final. El checkpoint publicado corresponde al paso de entrenamiento 5000.

Es relevante ahora porque MOSS-Image-SFT es un modelo reciente de edición de imágenes y este tipo de LoRA de control amplía sus modos de uso hacia flujos de trabajo de ComfyUI, donde ya se incluye un workflow listo para usar. La licencia Apache 2.0 y el formato compatible con diffusers facilitan su integración.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA de control sobre UNet de MOSS-Image-SFT (rank 64 en capas lineales, rank 16 en convoluciones) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el modelo base usa UNet int8 y text encoder w4a8 GPTQ) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El adaptador es una LoRA de control que se aplica sobre el UNet del modelo base MOSS-Image-SFT. Según la model card, emplea rank 64 en las capas lineales y rank 16 en las convoluciones. No es un ControlNet completo ni el adaptador oficial de concatenación de color/profundidad de MOSS; se carga con un cargador de LoRA convencional y se le pasa una única imagen de control a través del nodo Text Encode MOSS-Image Edit.

Se entrenó como adaptador de edición con el formato `ai-toolkit` y con la caché kv activada, por lo que la model card indica que hay que seleccionar ese formato tanto en la codificación positiva como en la negativa. El checkpoint publicado es el paso 5000. Los datos de entrenamiento (número de imágenes, composición del dataset, uso de RLHF/DPO) no están disponibles en la información proporcionada. La guía de uso recomienda generar los mapas de control con HED Soft-Edge Lines en modo seguro, ya que los scribbles de entrenamiento son trazos blancos gruesos y suaves sobre fondo negro, más cercanos a HED que a Canny o lineart fino.

## Capacidades

- Control estructural de imagen a imagen mediante bocetos de trazos libres: sigue las líneas y masas principales, no cada borde fino.
- Generación guiada por prompt: la identidad, los materiales, la ropa y el estilo se definen en el texto, mientras el control fija la composición.
- Funciona como adaptador de control de una sola imagen de referencia para MOSS-Image-SFT.
- Integración con ComfyUI mediante el workflow incluido y el nodo Text Encode MOSS-Image Edit.
- Sin palabra de activación (no trigger word).
- Ajuste de intensidad del LoRA (1.0 es el valor entrenado; se puede bajar hacia 0.7 si el control resulta demasiado rígido).
- Parámetros de muestreo recomendados: 30 pasos, CFG 4, sampler `euler` y scheduler `simple`.

## Casos de uso

- Bocetos y storyboards: a partir de trazos rápidos se generan imágenes acabadas que respetan la composición dibujada, útil para previsualizar escenas antes de producir arte final.
- Pruebas rápidas de composición: sirve como primera pasada para validar encuadre y distribución de masas antes de aplicar un control más estricto con Canny o lineart.
- Dibujo sobre fotografías: se traza encima de una foto para conservar solo las formas grandes y dejar que el prompt reinvente textura y color, por ejemplo para conceptos de vestuario o escenarios.
- Generación de ilustraciones con control de pose y silueta: con un boceto de la figura (como el ejemplo del maestro de ceremonias) y un prompt detallado se obtiene una ilustración completa con la postura deseada.
- Prototipado de entornos y escenarios: dibujar la distribución de un espacio (una cafetería, un puesto de ramen, una estación de metro) y dejar que el prompt defina materiales y atmósfera.
- Flujos de trabajo en ComfyUI: el workflow incluido carga una foto, construye el mapa de control con HED Soft-Edge Lines, lo codifica junto al prompt y muestrea, lo que permite automatizar pipelines de imagen a imagen en producción.
- Exploración de estilo sobre una misma estructura: manteniendo el mismo scribble, variar el prompt para obtener distintas interpretaciones de materiales y ambientación sin redibujar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El adaptador pesa aproximadamente 0,3 GB, pero requiere cargar el modelo base MOSS-Image-SFT completo (UNet int8, text encoder Qwen3.5 9B en w4a8 GPTQ y VAE flux2-vae_small), por lo que la VRAM vendrá determinada por ese modelo base.
- VRAM estimada para inferencia: no disponible en la información proporcionada para el conjunto base + LoRA.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; el uso de cuantizaciones int8 y w4a8 en el base sugiere que está pensado para reducir requisitos, pero no se confirman cifras.
- Opciones de despliegue: ComfyUI (workflow incluido) y diffusers como librería declarada.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| thedeoxen/MOSS-Image-scribble-controlnet | LoRA de control (scribble) | MOSS-Image-SFT | Apache 2.0 | safetensors | Rank 64/16, paso 5000, workflow ComfyUI incluido |
| Adaptador oficial de color/profundidad de MOSS | Adaptador de concatenación | MOSS-Image-SFT | no disponible | no disponible | La model card lo distingue explícitamente de este LoRA |
| ControlNet estándar (p. ej. para SD) | ControlNet completo | Modelos de difusión tipo SD | variable | safetensors | Requiere arquitectura compatible; no aplicable directamente a MOSS-Image-SFT |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta inglés como idioma declarado.
- El control sigue trazos gruesos y masas, no bordes finos; para precisión de contorno conviene usar Canny o lineart en una pasada posterior.
- Requiere el formato de edición `ai-toolkit` y la caché kv activada; usar otra configuración puede degradar el resultado.
- Está entrenado y recomendado únicamente con OpenMOSS-Team/MOSS-Image-SFT; no se garantiza su funcionamiento con otros modelos base.
- Es un adaptador comunitario de un autor independiente (thedeoxen), no un componente oficial de OpenMOSS; no hay benchmarks publicados que avalen su calidad frente a alternativas.
- Riesgo de alucinación visual y de desviación del boceto si el prompt contradice la estructura del control o si la intensidad del LoRA es demasiado alta.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar también la licencia del modelo base MOSS-Image-SFT antes de desplegar en producción.
- El prompt negativo de entrenamiento incluido (`nsfw, worst quality, bad anatomy, watermark, jpeg artifact`) sugiere que el modelo puede producir artefactos o contenido no deseado sin filtrado.
- No hay información sobre sesgos demográficos ni sobre el dataset de entrenamiento, lo que limita la evaluación de riesgos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thedeoxen/MOSS-Image-scribble-controlnet
- Pesos (safetensors): https://huggingface.co/thedeoxen/MOSS-Image-scribble-controlnet/blob/main/moss_image_sft_scribble_control_lora.safetensors
- Workflow de ComfyUI: https://huggingface.co/thedeoxen/MOSS-Image-scribble-controlnet/blob/main/moss_image_scribble_control.json
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
