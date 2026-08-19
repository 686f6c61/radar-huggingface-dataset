# tfrere/reachy-mini-stickers

## Resumen

El modelo `tfrere/reachy-mini-stickers` es un adaptador LoRA (Low-Rank Adaptation) entrenado sobre el modelo base de difusión `black-forest-labs/FLUX.1-dev`. Su propósito es especializar la generación de imágenes de FLUX.1-dev para crear stickers del robot humanoide Reachy, un robot de código abierto desarrollado por la empresa francesa Pollen Robotics. El adaptador fue fine-tuned con 25 imágenes del robot Reachy y utiliza la palabra disparadora `REACHY_STICKER` para activar el estilo aprendido.

Este LoRA resulta relevante para desarrolladores y entusiastas de la robótica que deseen generar contenido visual personalizado del robot Reachy, así como para quienes trabajan con FLUX.1-dev y buscan ejemplos de fine-tuning con pocos datos. Al estar basado en FLUX.1-dev, hereda la arquitectura de transformer de difusión de 12 mil millones de parámetros, aunque el adaptador en sí ocupa solo 0.2 GB. El entrenamiento se realizó en la plataforma Replicate usando el trainer `ostris/flux-dev-lora-trainer`, con 1000 pasos y un rango LoRA de 16.

La licencia se indica como `other`, lo que sugiere que se aplican las condiciones de la licencia de FLUX.1-dev, que restringe el uso comercial sin autorización expresa de Black Forest Labs. No se especifican idiomas soportados ni detalles adicionales sobre el dataset de entrenamiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre FLUX.1-dev (transformer de difusión texto a imagen) |
| Parametros totales | LoRA: ~0.2 GB (pesos del adaptador); modelo base: 12B (FLUX.1-dev) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de difusión) |
| Tipos de cuantizacion | no disponible (el adaptador se usa con el modelo base, que soporta cuantización, pero no se especifica para este LoRA) |
| Idiomas soportados | no disponible (FLUX.1-dev acepta prompts en inglés principalmente; el LoRA no añade soporte multilingüe) |
| Licencia | other (heredada de FLUX.1-dev, con restricciones de uso comercial) |
| Formato de pesos | safetensors (presumiblemente, al ser un LoRA de diffusers; no se confirma en la documentación) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 16, lo que significa que introduce matrices de bajo rango en las capas de atención y feed-forward del transformer de difusión de FLUX.1-dev. Esta técnica permite fine-tuning eficiente con un número reducido de parámetros entrenables, manteniendo congelados los pesos del modelo base. El entrenamiento se realizó con 25 imágenes del robot Reachy, un número muy pequeño, lo que indica un ajuste rápido y especializado.

El proceso de entrenamiento se llevó a cabo en Replicate utilizando el trainer `ostris/flux-dev-lora-trainer`, durante 1000 pasos. No se especifica la composición exacta del dataset (variaciones de ángulo, fondo, iluminación, etc.), ni si se aplicaron técnicas de regularización o aumento de datos. Tampoco se menciona el uso de RLHF o DPO, algo esperable en modelos de difusión. La palabra disparadora `REACHY_STICKER` se asocia al concepto de "sticker del robot Reachy", y el ejemplo del widget muestra una variante temática de astronauta kawaii.

## Capacidades

- Generación de imágenes de stickers del robot Reachy en diversos estilos, controlados mediante el prompt y la palabra disparadora `REACHY_STICKER`.
- Personalización del tema del sticker mediante texto adicional, como se muestra en el ejemplo: "a cute kawaii robot head sticker themed as an astronaut".
- Integración con el ecosistema de diffusers y herramientas compatibles con FLUX.1-dev (ComfyUI, Replicate, etc.).
- No incluye capacidades de texto, razonamiento, código ni visión; es exclusivamente un modelo de generación de imágenes.
- No se documenta soporte para tool calling, agentes ni procesamiento multimodal.

## Casos de uso

- Creación de stickers para comunidades de robótica: los desarrolladores y aficionados pueden generar stickers personalizados del robot Reachy para usar en foros, chats o redes sociales, simplemente escribiendo `REACHY_STICKER` junto a la descripción deseada.
- Material de marketing para Reachy Mini: la empresa Pollen Robotics o sus distribuidores pueden producir ilustraciones promocionales del robot en distintos escenarios (astronauta, superhéroe, etc.) sin necesidad de sesiones fotográficas.
- Prototipado de diseños de producto: los equipos de diseño pueden generar rápidamente variaciones visuales del robot para evaluar conceptos de merchandising o packaging antes de invertir en producción.
- Generación de avatares para perfiles técnicos: los usuarios pueden crear avatares únicos del robot para sus cuentas en plataformas de desarrollo, documentación o conferencias.
- Educación y divulgación: los educadores pueden ilustrar materiales didácticos sobre robótica con imágenes generadas del robot Reachy, facilitando la comprensión de su morfología.
- Personalización de contenido para redes sociales: los creadores de contenido pueden generar stickers temáticos para historias, reacciones o memes relacionados con la robótica de código abierto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al ser un LoRA especializado en un dominio muy concreto (25 imágenes de un solo robot), no se dispone de métricas comparativas como FID, CLIP score o evaluaciones humanas. Tampoco se ofrecen datos de rendimiento en términos de velocidad de inferencia o calidad frente a otros adaptadores.

## Requisitos de hardware

- El LoRA en sí ocupa 0.2 GB, pero requiere el modelo base FLUX.1-dev (12B parámetros) para funcionar. La VRAM necesaria depende de la cuantización del modelo base.
- Con FLUX.1-dev en FP16, se necesitan aproximadamente 24 GB de VRAM, lo que permite ejecutarlo en GPUs como RTX 3090, RTX 4090, A100 o H100.
- Con cuantización a 4 bits (por ejemplo, mediante bitsandbytes), la VRAM puede reducirse a unos 8-12 GB, permitiendo su uso en GPUs de consumo como RTX 3060 o RTX 4070, aunque con posible pérdida de calidad.
- El despliegue puede realizarse con la librería `diffusers` de Hugging Face, así como con interfaces como ComfyUI o servicios en la nube como Replicate (donde se entrenó el adaptador).
- La latencia típica de FLUX.1-dev en una GPU de gama alta (RTX 4090) es de varios segundos por imagen (aprox. 5-10 s para 1024×1024), dependiendo del número de pasos de inferencia. No se dispone de mediciones específicas para este LoRA.

## Comparativa con modelos similares

No se dispone de información sobre otros LoRA de stickers del robot Reachy ni de adaptadores comparables en la misma categoría. Dado que el modelo es un fine-tuning muy específico sobre un robot concreto, no existen alternativas directas documentadas. Como referencia, se podría comparar con otros LoRA de FLUX.1-dev para estilos de stickers genéricos, pero no se han encontrado datos concretos en la información disponible.

## Limitaciones y advertencias

- El entrenamiento se realizó con solo 25 imágenes, lo que puede provocar sobreajuste (overfitting) y limitar la variedad de poses, ángulos o fondos que el modelo es capaz de generar. Los resultados pueden ser menos diversos que los de un modelo entrenado con más datos.
- La licencia `other` heredada de FLUX.1-dev restringe el uso comercial sin autorización de Black Forest Labs. Cualquier aplicación en producción debe verificar los términos de la licencia de FLUX.1-dev.
- No se documentan sesgos específicos, pero al derivar de FLUX.1-dev, el modelo puede heredar sesgos de género, etnia o contexto cultural presentes en los datos de entrenamiento del modelo base.
- Riesgo de alucinación visual: el modelo puede generar detalles inconsistentes o artefactos, especialmente si se solicitan variaciones complejas del robot fuera del dominio aprendido.
- El idioma de los prompts no está especificado; FLUX.1-dev funciona mejor con prompts en inglés, y el LoRA no añade soporte multilingüe adicional.
- No se garantiza la reproducibilidad del entrenamiento, ya que no se publican los hiperparámetros exactos ni el dataset completo.

## Enlaces

- Página del modelo en Hugging Face: https://huggingface.co/tfrere/reachy-mini-stickers
- Repositorio de archivos: https://huggingface.co/tfrere/reachy-mini-stickers/tree/main
- Documentación de Reachy Mini (desarrolladores): https://reachymini.net/developers.html
