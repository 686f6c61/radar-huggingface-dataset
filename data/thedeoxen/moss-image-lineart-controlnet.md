# thedeoxen/MOSS-Image-lineart-controlnet

## Resumen

MOSS-Image-lineart-controlnet es un adaptador de tipo LoRA con comportamiento de ControlNet para el modelo de generación y edición de imágenes MOSS-Image-SFT, desarrollado por OpenMOSS-Team. Lo publica el usuario thedeoxen en Hugging Face bajo licencia Apache 2.0. Su función es tomar un dibujo de líneas (lineart blanco sobre fondo negro) como imagen de control y generar una imagen nueva que respeta esa estructura, dejando que el prompt de texto defina identidad, materiales, ropa, iluminación y estilo. No es un adaptador oficial de concatenación de color o profundidad del modelo base, sino una LoRA de edición entrenada al estilo ControlNet que se carga con un cargador de LoRA convencional.

El adaptador tiene rango 64 en capas lineales y rango 16 en convoluciones, y se distribuye como un único archivo safetensors de aproximadamente 0,3 GB junto con un workflow de ComfyUI. Se entrenó sobre el checkpoint del paso 5000 y está pensado para usarse con el UNet `moss_image_sft_int8_convrot.safetensors`, el text encoder `qwen3.5_9b_w4a8_gptq.safetensors` y el VAE `flux2-vae_small.safetensors` del modelo base.

Su relevancia práctica es que añade control estructural preciso a un modelo de edición por prompt sin necesidad de reentrenar el modelo completo: permite colorear bocetos, trasladar la estructura de una foto a una escena nueva o mantener el trazo de un diseño mientras se cambia por completo la apariencia. Es un recurso nicho, orientado a flujos de trabajo en ComfyUI, no un modelo autónomo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el UNet de MOSS-Image-SFT, con comportamiento de ControlNet para una única imagen de control |
| Parámetros totales | no disponible (pesos del adaptador en un archivo de ~0,3 GB; el modelo base no se incluye) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | el adaptador se distribuye en safetensors; el modelo base recomendado usa UNet int8 (`moss_image_sft_int8_convrot`) y text encoder w4a8 GPTQ |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`moss_image_sft_lineart_control_lora.safetensors`) + workflow JSON de ComfyUI |

## Arquitectura y entrenamiento

El adaptador es una LoRA de edición con rango 64 en las capas lineales y rango 16 en las convoluciones, aplicada sobre el UNet de MOSS-Image-SFT. Se entrenó como adaptador de edición: la imagen de control actúa como referencia estructural y el prompt describe la imagen que se quiere generar. Según la model card, el entrenamiento se realizó con la caché KV activada y el formato de edición `ai-toolkit`, un detalle que hay que replicar en la inferencia para que el comportamiento coincida con el del entrenamiento. El checkpoint publicado corresponde al paso 5000.

Los mapas de control de entrenamiento son lineart realista en modo *coarse* (grueso), con líneas blancas sobre fondo negro. La card indica explícitamente que este ajuste se aproxima mejor a los mapas de entrenamiento que el modo de lineart fino, y que las líneas dispersas y ligeras funcionan mejor que un boceto denso. No se detalla en la información disponible el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de refuerzo o preferencias; tampoco se documentan innovaciones de decodificación o atención específicas del adaptador.

## Capacidades

- Generación de imágenes condicionada por lineart: reproduce la estructura de un dibujo de líneas blanco sobre negro en la imagen resultante.
- Control de apariencia por prompt: identidad, materiales, ropa, iluminación y entorno se definen mediante texto, no mediante la imagen de control.
- Edición imagen a imagen: transforma una foto en una escena nueva conservando la estructura de líneas extraída.
- Coloreado de dibujos: convierte un boceto en una imagen acabada con color y materiales coherentes con el prompt.
- Compatibilidad con ComfyUI: incluye workflow con el nodo integrado Text Encode MOSS-Image Edit.
- Ajuste de rigidez del control: la fuerza de la LoRA puede bajarse hacia 0,7 si el control resulta demasiado rígido; el valor entrenado es 1,0.
- Sin palabra de activación (trigger word): la imagen de control define la estructura y el prompt define el contenido.
- Soporte multilingüe: limitado a inglés según la metadata del repositorio.
- Tool calling, agentes, razonamiento multi-paso, visión o audio: no disponible (no es un modelo de lenguaje; es un adaptador de imagen).

## Casos de uso

- Coloreado de lineart para ilustración: se introduce un dibujo de líneas y un prompt que describe paleta, materiales e iluminación; el adaptador rellena la imagen respetando los contornos. Adecuado porque el control estructural evita que el modelo invente geometrías distintas a las del boceto.
- Conversión de foto a escena nueva: se extrae el lineart de una fotografía con un preprocesador *coarse* y se genera una escena distinta con la misma composición, útil para previsualización de vestuario, decorados o localizaciones.
- Diseño de personajes a partir de bocetos: el estudio dibuja la silueta y la pose, y el prompt fija vestuario y estilo; permite iterar variantes de color y material sin redibujar.
- Previsualización de producto o packaging: a partir de un boceto de forma se generan renders con distintos acabados y colores, manteniendo la silueta definida por el diseñador.
- Storyboard y cómic: se dibujan las viñetas con lineart y se generan versiones acabadas con un prompt de estilo consistente, acelerando la fase de arte final.
- Pruebas de concepto en pipelines de ComfyUI: el workflow incluido permite encadenar carga de imagen, extracción de lineart, codificación con prompt y muestreo, lo que facilita integrarlo en flujos automatizados de generación por lotes.
- Restauración estilizada de dibujos técnicos o arquitectónicos: se conserva el trazado de un plano o croquis y se le aplica un acabado visual concreto mediante prompt.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. El adaptador en sí ocupa unos 0,3 GB, pero requiere cargar el modelo base completo (UNet int8, text encoder w4a8 GPTQ y VAE), por lo que la VRAM vendrá determinada por MOSS-Image-SFT y no por la LoRA.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible; depende de los requisitos del modelo base MOSS-Image-SFT, no documentados en esta ficha.
- Opciones de despliegue: ComfyUI (flujo recomendado, con workflow incluido) y librería diffusers (etiqueta `diffusers` del repositorio). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un adaptador de difusión.
- Parámetros de muestreo recomendados: 30 pasos, CFG 4, sampler `euler` con scheduler `simple`, fuerza de LoRA 1,0 y formato de edición `ai-toolkit` en la codificación positiva y negativa.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Control | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| thedeoxen/MOSS-Image-lineart-controlnet | LoRA de edición con comportamiento ControlNet | MOSS-Image-SFT | Lineart (una imagen) | Apache 2.0 | Hugging Face, 0 descargas, 0 likes en el momento de la consulta |
| Adaptadores oficiales de color/profundidad de MOSS-Image | Adaptadores de concatenación oficiales | MOSS-Image-SFT | Color y profundidad | no disponible | no disponible |
| ControlNet estándar para modelos de difusión tipo SD | ControlNet completo | Modelos de difusión de la familia SD | Canny, lineart, depth, pose, etc. | variable según versión | amplia disponibilidad en Hugging Face |

La comparación con ControlNet de la familia Stable Diffusion es pertinente por categoría funcional (control estructural por lineart), pero no se dispone de datos de rendimiento comparables para este adaptador. No se han encontrado benchmarks ni métricas publicadas que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Es un adaptador, no un modelo autónomo: sin MOSS-Image-SFT no funciona, y la calidad final depende del modelo base.
- Entrenado únicamente con lineart realista en modo *coarse* y líneas blancas sobre negro; otros estilos de preprocesado o líneas densas pueden degradar el resultado.
- El formato de edición debe fijarse en `ai-toolkit` en la codificación positiva y negativa; no hacerlo rompe la correspondencia con el entrenamiento.
- La fuerza de LoRA entrenada es 1,0; valores muy distintos pueden producir rigidez o pérdida de control.
- Idioma soportado limitado a inglés según la metadata; prompts en otros idiomas no están garantizados.
- Riesgo de alucinación visual: el prompt puede introducir elementos no presentes en el lineart, y el modelo puede reinterpretar detalles finos del dibujo.
- La model card incluye un prompt negativo de entrenamiento (`nsfw, worst quality, bad anatomy, watermark, jpeg artifact`), lo que sugiere que el filtrado de contenido depende de su uso; no se documentan salvaguardas adicionales.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base MOSS-Image-SFT debe verificarse por separado en cuanto a sus propios términos.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia comunitaria de robustez en producción.
- No se documentan sesgos demográficos ni evaluaciones de seguridad del adaptador.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/thedeoxen/MOSS-Image-lineart-controlnet
- Pesos: https://huggingface.co/thedeoxen/MOSS-Image-lineart-controlnet/blob/main/moss_image_sft_lineart_control_lora.safetensors
- Workflow de ComfyUI: https://huggingface.co/thedeoxen/MOSS-Image-lineart-controlnet/blob/main/moss_image_lineart_control.json
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
