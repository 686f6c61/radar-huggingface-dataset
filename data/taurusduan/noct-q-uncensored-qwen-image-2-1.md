# taurusduan/Noct-Q-Uncensored-Qwen-Image-2.1

## Resumen

Noct Q Uncensored Qwen Image 2.1 es un modelo de generación de imágenes texto-a-imagen derivado por *merge* de pesos del transformer de Qwen/Qwen-Image-2.1, publicado por el usuario taurusduan (Noctaluna). Su propósito declarado es eliminar la censura del modelo base para generar desnudos y escenas explícitas sin necesidad de aplicar un LoRA adicional, manteniendo al mismo tiempo la capacidad de renderizar texto legible en carteles y etiquetas, ilustración pintada y anime, y edición de imagen con los mismos pesos.

El modelo se distribuye como un único archivo `safetensors` cuantizado a int8 con la transformación `convrot`, de 7,3 GB, pensado para ejecutarse en ComfyUI (versión 0.37 o superior) con nodos nativos sobre tarjetas de 8 a 12 GB de VRAM. Requiere un text encoder Qwen3-VL de 8B en int8 y el VAE específico de Qwen Image 2.1, ambos alojados en el repositorio Comfy-Org/Qwen-Image-2.1.

Es relevante ahora porque demuestra el patrón de *fine-tuning* y *merge* comunitario sobre modelos de difusión de gran tamaño con codificador de texto multimodal, y porque su licencia (Qwen Research License Agreement) restringe el uso a fines no comerciales, lo que condiciona cualquier despliegue en producción. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y la información técnica publicada es escasa: no hay benchmarks, ni detalles del dataset de *merge*, ni especificaciones de arquitectura más allá de la herencia del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de difusión texto-a-imagen (derivado por merge de Qwen/Qwen-Image-2.1); detalles internos no disponibles |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | int8 (archivo `convrot`); el autor menciona versiones int4, fp8, bf16 y fp16 alojadas en Civitai |
| Idiomas soportados | no disponible (el prompt se describe en inglés y chino en la model card) |
| Licencia | Qwen Research License Agreement (uso no comercial únicamente) |
| Formato de pesos | safetensors, archivo único (`diffusion-single-file`) |
| Tamaño del repo | 14,5 GB |
| Tamaño del archivo principal | 7,3 GB (`NoctQ_V4_int8_convrot.safetensors`) |
| Text encoder requerido | `qwen3vl_8b_int8_convrot.safetensors` (Qwen3-VL 8B, int8) |
| VAE requerido | `qwen_image_2.1_vae_bf16.safetensors` |
| Pipeline | text-to-image |
| Versión actual | V4 (V3 disponible como versión previa) |

## Arquitectura y entrenamiento

No se dispone de información publicada sobre la arquitectura interna, el número de parámetros, la composición del dataset de entrenamiento ni el proceso de alineación. La model card indica únicamente que se trata de un *merge* de Qwen/Qwen-Image-2.1 con pesos del transformer modificados, y remite a un archivo `NOTICE` para los detalles de la modificación. No se documenta si hubo *fine-tuning* adicional, DPO, RLHF ni qué proporción de datos explícitos se introdujo.

Los elementos técnicos verificables son de despliegue: cuantización int8 con transformación `convrot`, integración con el *template* de edición de Qwen Image 2.1 en ComfyUI y uso del codificador de texto Qwen3-VL 8B, lo que sugiere que el modelo base emplea un *text encoder* multimodal de tipo vision-language para la codificación del prompt. No hay información sobre decodificación especulativa, atención lineal ni otras innovaciones de inferencia.

## Capacidades

- Generación de imágenes fotorrealistas de cuerpo completo en luz diurna, con flash y en escenas nocturnas.
- Generación de escenas explícitas con pareja; el autor afirma que la versión V4 las renderiza según lo solicitado tres veces más a menudo que V3.
- Renderizado de texto legible en carteles y etiquetas.
- Ilustración estilo anime y pintura.
- Interpretación de prompts en prosa tipo *caption* (quién, qué hace, dónde, luz, encuadre), no de listas de etiquetas.
- Edición de imagen con los mismos archivos, mediante la plantilla de edición de Qwen Image 2.1 en ComfyUI.
- Sin *trigger word*: no requiere palabra de activación para el contenido sin censura.
- No se documenta soporte de *tool calling*, agentes, razonamiento multi-paso ni otras modalidades (audio, vídeo).

## Casos de uso

- Ilustración editorial para adultos: generación de desnudos artísticos y escenas de figura completa en luz natural o de estudio, aprovechando que el modelo no requiere LoRA y que acepta descripciones en prosa con edad adulta explícita.
- Producción de contenido para plataformas de suscripción para adultos: generación por lotes de imágenes verticales a 1024x1536 con el flujo de 25 pasos y cfg 3 definido en el workflow, en tarjetas de 8 a 12 GB.
- Edición de imagen en estudio fotográfico: uso de la plantilla de edición de Qwen Image 2.1 para retocar o recomponer imágenes existentes con los mismos pesos, útil para variaciones de encuadre y luz sobre una foto base.
- Prototipado de arte conceptual para proyectos de ilustración: generación de bocetos pintados y estilo anime con texto legible en carteles, útil para *moodboards* y referencias de producción.
- Investigación sobre censura y alineación en modelos de difusión: el modelo sirve como caso de estudio de *merge* comunitario que elimina filtros del modelo base, comparable con variantes censuradas para medir el efecto del *fine-tuning* en la distribución de salidas.
- Generación de material para campañas de concienciación o formación en seguridad de contenido: permite reproducir en entorno controlado qué tipos de prompt producen contenido explícito, para calibrar clasificadores y filtros de moderación.
- Pruebas de compatibilidad de ComfyUI: validación de nodos nativos, cuantización int8 `convrot` y plantillas de edición sobre el ecosistema Qwen Image 2.1 en GPUs de gama media.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas objetivas (FID, CLIP score, evaluación humana cuantitativa) ni comparaciones numéricas con el modelo base; la única afirmación comparativa es cualitativa: la versión V4 renderiza escenas explícitas con pareja "tres veces más a menudo" que V3, sin metodología publicada.

## Requisitos de hardware

- VRAM estimada: 8 a 12 GB para el archivo int8 de 7,3 GB, según el autor, más la memoria del text encoder Qwen3-VL 8B en int8 y del VAE en bf16, que se cargan en el mismo flujo de ComfyUI.
- GPU recomendadas: no especificadas por el autor; por el rango de VRAM indicado, encajan tarjetas consumer de 8 a 12 GB (por ejemplo, RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070) y, con holgura, A100 o H100 para lotes mayores.
- Cabe en GPU consumer: sí, en el rango de 8 a 12 GB indicado, con ComfyUI 0.37 o superior y nodos nativos.
- Opciones de despliegue: ComfyUI (vía principal documentada, con workflow `NoctQ_V4_workflow.json`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de difusión de este formato.
- Latencia y throughput: no disponibles. El autor indica que cfg 1 "va aproximadamente el doble de rápido" que cfg 3, pero ignora el prompt negativo; no se publican tiempos absolutos.
- Configuración de inferencia documentada: 25 pasos, sampler euler, scheduler simple, cfg 3 con prompt negativo, resolución 1024x1536 en vertical.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Noct Q Uncensored Qwen Image 2.1 (V4) | Difusión texto-a-imagen, int8 | no disponible | no disponible | Qwen Research (no comercial) | Hugging Face (0 descargas), Civitai |
| Qwen/Qwen-Image-2.1 (base) | Difusión texto-a-imagen | no disponible | no disponible | Qwen Research | Hugging Face (oficial) |
| Noct Q V3 | Difusión texto-a-imagen, int8 | no disponible | no disponible | Qwen Research (no comercial) | Hugging Face, Civitai |

No se dispone de datos de rendimiento ni de parámetros para establecer una comparación cuantitativa con alternativas de la misma categoría (por ejemplo, otros derivados sin censura de modelos de difusión). La comparación disponible se limita a la relación con el modelo base y con la versión previa V3, y es cualitativa.

## Limitaciones y advertencias

- Licencia Qwen Research License Agreement: uso exclusivamente no comercial. Cualquier despliegue en producción con fines comerciales requiere autorización expresa del titular de la licencia.
- Contenido explícito y NSFW: el modelo está diseñado para generar desnudos y escenas sexuales; requiere verificación de edad, control de acceso y cumplimiento de la normativa aplicable en la jurisdicción de despliegue.
- Riesgo de alucinación visual: no hay evaluación publicada de fidelidad al prompt ni de coherencia anatómica; la afirmación de mejora de V4 sobre V3 no está cuantificada.
- Sesgos: no documentados. Al ser un *merge* sobre un modelo base sin datos de entrenamiento publicados, no es posible evaluar sesgos de género, etnia o edad en las salidas.
- Idiomas: no se especifican los idiomas soportados; la model card está redactada en inglés y chino y recomienda prompts en prosa, lo que sugiere mejor rendimiento en esos idiomas.
- Dependencia estricta de versiones: requiere ComfyUI 0.37 o superior, el text encoder Qwen3-VL 8B int8 concreto y el VAE de Qwen Image 2.1; otras combinaciones no están validadas.
- Madurez: repositorio con 0 descargas y 0 likes, creado y actualizado el mismo día, sin issues ni validación comunitaria; los archivos int4, fp8, bf16 y fp16 no están en Hugging Face sino en Civitai, lo que añade una dependencia externa.
- Configuración sensible: cfg 1 duplica la velocidad pero ignora el prompt negativo, lo que puede degradar el control sobre la salida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/taurusduan/Noct-Q-Uncensored-Qwen-Image-2.1
- Galería, prompts y archivos int4/fp8/bf16/fp16 en Civitai: https://civitai.com/models/2958896
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- Text encoder (Comfy-Org): https://huggingface.co/Comfy-Org/Qwen-Image-2.1/blob/main/text_encoders/qwen3vl_8b_int8_convrot.safetensors
- VAE (Comfy-Org): https://huggingface.co/Comfy-Org/Qwen-Image-2.1/blob/main/vae/qwen_image_2.1_vae_bf16.safetensors
- Licencia (referenciada en la model card): https://huggingface.co/Noctaluna/Noct-Q-Uncensored-Qwen-Image-2.1/blob/main/LICENSE
