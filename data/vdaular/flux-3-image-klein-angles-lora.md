# vdaular/flux-3-image-klein-angles-lora

## Resumen

FLUX 3 Image Klein — Multiple Angles LoRA es un adaptador LoRA de control de cámara para el modelo base FLUX 3 Image Klein (base), desarrollado por Black Forest Labs. El adaptador lo publica el usuario vdaular en Hugging Face, aunque la model card referencia el repositorio de akhaliq y el entrenamiento se realizó con la herramienta ML Intern. Su función es re-renderizar un sujeto desde una nueva pose de cámara: 8 acimuts, 5 elevaciones y distancia opcional, usando la gramática de prompt `<mva>` popularizada por los LoRA de múltiples ángulos de Qwen-Image.

El adaptador resuelve un problema concreto de los pipelines de edición de imagen: conseguir coherencia de identidad y geometría al cambiar el punto de vista de una fotografía o render. En lugar de generar una imagen nueva desde cero, el LoRA actúa sobre el pipeline image-to-image del modelo base, de modo que el sujeto se conserva y solo se modifica la cámara. Es relevante porque la gramática `<mva>` estandariza el control de cámara con etiquetas discretas, lo que facilita integrarlo en flujos automatizados sin ingeniería de prompts compleja.

El adaptador tiene un tamaño de repositorio de 0,7 GB, rango 16 y alpha 16, y se entrenó sobre 4.000 pares sintéticos de render. Está pensado para el modelo base FLUX 3 Image Klein, publicado en abierto el 15 de octubre de 2026, y hereda su licencia FLUX Kommunity License.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer de difusión (FLUX 3 Image Klein base) |
| Parametros totales | no disponible (adaptador LoRA con rank 16; el modelo base no reporta cifra en la información) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen; resolución de entrenamiento 512 px) |
| Tipos de cuantizacion | no disponible (entrenado en bf16; el base admite los formatos de diffusers) |
| Idiomas soportados | no disponible (los prompts del LoRA son en inglés por la gramática `<mva>`) |
| Licencia | FLUX Kommunity License (license: other) |
| Formato de pesos | safetensors (librería diffusers) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 y alpha 16 insertado en el transformer de difusión del modelo FLUX 3 Image Klein (base), que es la variante no destilada del modelo. El entrenamiento se hizo con el script de DreamBooth image-to-image de diffusers, `train_dreambooth_lora_flux3_klein_img2img.py`, en precisión bf16, a 512 px, con learning rate constante de 1e-4, optimizador AdamW de 8 bits y 2.000 pasos sobre una A100. El repositorio incluye checkpoints en los pasos 500, 1.000, 1.500 y 2.000.

El dataset de entrenamiento es `akhaliq/flux3-multiple-angles-train-4k`, compuesto por 4.000 pares sintéticos de render con la gramática `<mva>` de fal. No se reporta uso de RLHF ni DPO, algo esperable en un adaptador de este tipo. La innovación principal es la estandarización del control de cámara mediante etiquetas discretas de acimut, elevación y distancia, que el LoRA aprende a asociar con transformaciones geométricas concretas. El entrenamiento se realizó el 16 de octubre de 2026, un día después de la publicación de los pesos abiertos de FLUX 3 Image Klein.

## Capacidades

- Re-renderizado de un sujeto desde una nueva pose de cámara manteniendo la identidad y el contenido de la imagen de referencia.
- Control de cámara con 8 acimuts: front view, front-right/front-left quarter view, right/left side view, back-right/back-left (quarter) view y back view.
- Control de elevación con 5 opciones: low-angle shot, eye-level shot, elevated shot, high-angle shot y top-down shot.
- Distancia opcional mediante el modificador `close-up`.
- Edición image-to-image sobre una imagen de entrada en formato PIL.
- Integración con el pipeline modular de diffusers (`Flux3AutoBlocks`) y carga mediante `load_lora_weights`.
- Compatibilidad con la gramática de prompt `<mva>` de fal, la misma que usan los LoRA de múltiples ángulos de Qwen-Image.
- No soporta tool calling, agentes ni razonamiento multi-step: es un adaptador de generación de imagen.

## Casos de uso

- Rotación de producto para catálogo de e-commerce: a partir de una foto frontal de un objeto se generan vistas laterales y traseras con la misma iluminación, lo que reduce la necesidad de sesiones fotográficas múltiples. El LoRA es adecuado porque el prompt `<mva>` codifica el ángulo de forma explícita.
- Previsualización de personajes en videojuegos o animación: dado un render de un personaje, se obtienen vistas desde distintos ángulos para validar la coherencia del modelo 3D antes de la producción final.
- Generación de hojas de referencia (turnarounds) para artistas conceptuales: el LoRA produce la órbita completa de 360 grados que se muestra en la model card con un perro, un gato y una persona, lo que sirve como base para modelado o ilustración.
- Aumento de datos para entrenamiento de modelos de visión: se generan vistas sintéticas adicionales de un sujeto a partir de una sola imagen, ampliando la diversidad de poses en datasets de detección o reconocimiento.
- Edición fotográfica con control de perspectiva: en retratos o fotografía de personas, el LoRA permite simular un cambio de punto de vista sin volver a disparar la foto, algo útil para corrección de composición.
- Integración en pipelines automatizados de edición por lotes: al usar una gramática de prompt fija y un pipeline de diffusers, se puede procesar un lote de imágenes con un script que recorra las combinaciones de acimut y elevación sin intervención manual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el entrenamiento se realizó en una A100 con bf16 y 512 px, y el adaptador pesa 0,7 GB, por lo que la VRAM vendrá dominada por el modelo base FLUX 3 Image Klein.
- GPU recomendadas: A100 (usada en el entrenamiento); para inferencia se recomienda una GPU con suficiente VRAM para el modelo base en bf16, como A100, H100 o RTX 4090.
- Compatibilidad con GPU de consumo: no confirmada en la información; depende del modelo base y de la cuantización disponible en diffusers.
- Opciones de despliegue: diffusers con el pipeline modular `Flux3AutoBlocks`, cargando el LoRA con `load_lora_weights`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de difusión de imagen.
- Latencia y throughput: no disponibles. El ejemplo de la model card usa 50 pasos de inferencia con `num_inference_steps=50`.

## Comparativa con modelos similares

| Modelo | Tipo | Control de cámara | Base | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vdaular/flux-3-image-klein-angles-lora | LoRA image-to-image | 8 acimuts × 5 elevaciones + close-up | FLUX 3 Image Klein base | FLUX Kommunity License | Hugging Face |
| akhaliq/flux-3-image-klein-angles-lora | LoRA image-to-image | misma gramática `<mva>` (referenciado en la model card) | FLUX 3 Image Klein base | FLUX Kommunity License | Hugging Face |
| LoRA de múltiples ángulos de Qwen-Image | LoRA image-to-image | gramática `<mva>` de fal | Qwen-Image | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Entrenado únicamente con renders 3D sintéticos: generaliza de forma desigual a fotos reales. Personas y animales se re-angulan de forma fiable, pero los objetos simples pueden ser sustituidos por sujetos o escenas alucinadas en algunos prompts.
- El autor anuncia una v2 que mezclará datos reales de múltiples vistas, lo que confirma que la cobertura actual es limitada.
- Riesgo de alucinación geométrica: al cambiar la cámara, el modelo puede inventar partes del sujeto no visibles en la imagen de referencia.
- Los prompts deben escribirse en la gramática `<mva>` y en inglés; no se documenta soporte multilingüe.
- Es necesario eliminar el `prompt_upsampler` del pipeline (`blocks.sub_blocks.pop("prompt_upsampler", None)`) porque el LoRA espera prompts sin procesar; obviarlo degrada los resultados.
- Licencia FLUX Kommunity License: hay que revisar sus restricciones antes de un uso comercial, ya que no es una licencia permisiva estándar.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y la model card apunta a un repositorio distinto (akhaliq) para la carga de pesos, lo que puede generar confusión sobre el artefacto correcto.
- No se documentan sesgos específicos del adaptador; al heredar el modelo base, puede reproducir los sesgos de sus datos de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vdaular/flux-3-image-klein-angles-lora
- Modelo de referencia en Hugging Face: https://huggingface.co/akhaliq/flux-3-image-klein-angles-lora
- Modelo base: https://huggingface.co/black-forest-labs/flux-3-image-klein-base
- Licencia FLUX Kommunity: https://huggingface.co/black-forest-labs/flux-3-image-klein-base/blob/main/LICENSE.md
- Script de entrenamiento (diffusers): https://github.com/huggingface/diffusers/blob/main/examples/dreambooth/train_dreambooth_lora_flux3_klein_img2img.py
- Dataset de entrenamiento: https://huggingface.co/datasets/akhaliq/flux3-multiple-angles-train-4k
- Demo en Spaces: https://huggingface.co/spaces/akhaliq/flux3-klein-angles-demo
- Guía de entrenamiento de LoRA para FLUX 3 Klein: https://www.imagelora.dev/lora/train-flux-3-klein-lora
- ML Intern: https://hf.co/chat?mode=ml-intern
