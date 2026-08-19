# VividMuse-AGI/HerRAW-krea2-lora

## Resumen

HerRAW es un LoRA (Low-Rank Adaptation) de propósito general para el modelo de difusión texto a imagen Krea 2 Turbo, desarrollado por el usuario VividMuse-AGI. Su objetivo es mejorar el realismo fotográfico en retratos femeninos manteniendo en lo posible el prompt original, las características del sujeto, la composición y el control de la escena. Se presenta como una versión experimental v0.1, pensada para validar la viabilidad de entrenar un LoRA de fotografía femenina genérica a partir de datos de entrenamiento.

El modelo no requiere palabra de activación (trigger word): basta con cargar el LoRA sobre el checkpoint base `krea/Krea-2-Turbo` y usar prompts en lenguaje natural. El archivo de pesos pesa 224 MB y se distribuye en formato safetensors. Está diseñado para su uso en ComfyUI, aunque también puede integrarse en otros flujos que soporten LoRAs de Krea 2. Su relevancia actual radica en la creciente demanda de LoRAs que reduzcan el "brillo de IA" en la generación de imágenes fotorrealistas, especialmente en el ecosistema de Krea 2.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Krea-2-Turbo (modelo de difusión texto a imagen) |
| Parametros totales | no disponible (peso del archivo: 224 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen) |
| Tipos de cuantizacion | no disponible (el LoRA se distribuye en precisión completa) |
| Idiomas soportados | no disponibles (el modelo base acepta prompts en inglés, pero no se especifica) |
| Licencia | other (sujeto a la licencia comunitaria de Krea 2) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

HerRAW es un LoRA, es decir, una adaptación de bajo rango aplicada a las capas de atención del modelo base Krea-2-Turbo. Esta técnica permite ajustar el comportamiento del modelo sin modificar los pesos originales, reduciendo drásticamente el coste de entrenamiento y el tamaño del archivo resultante. El LoRA se entrena para inducir un estilo de fotografía realista femenina, con especial énfasis en texturas de piel, iluminación natural y ausencia de brillo sintético.

No se han publicado detalles sobre el conjunto de datos de entrenamiento, el número de pasos, la tasa de aprendizaje ni el método de optimización (p. ej., si se usó RLHF o DPO). La versión v0.1 se describe como un "baseline experimental", lo que sugiere que el autor está evaluando la calidad del resultado antes de iterar sobre versiones posteriores. El LoRA se entrena sobre el checkpoint `krea/Krea-2-Turbo`, que es una variante optimizada para generación rápida (turbo) del modelo Krea 2.

## Capacidades

- Generación de imágenes fotorrealistas de retratos femeninos, mejorando la textura de la piel, la iluminación natural y reduciendo el aspecto "sintético" típico de los modelos de difusión.
- Preservación del prompt original y de las características del sujeto (rasgos, vestimenta, fondo) en la medida de lo posible, gracias a la adaptación de bajo rango.
- No requiere palabra de activación: se puede usar directamente con prompts descriptivos en lenguaje natural.
- Compatible con el flujo de trabajo estándar de ComfyUI mediante un nodo Load LoRA, con fuerza recomendada entre 0.3 y 0.5.
- Funciona con el sampler DDIM y schedulers beta/beta57, con 8-12 pasos de inferencia, lo que permite generación rápida.
- Al ser un LoRA, se puede combinar con otros LoRAs o ajustes del modelo base para estilos adicionales.

## Casos de uso

- Retratos para redes sociales o perfiles profesionales: el modelo genera imágenes de mujeres con aspecto de fotografía real, útil para creadores de contenido que necesitan imágenes de perfil o publicaciones sin derechos de autor.
- Fotografía de stock para blogs o páginas web: se pueden generar imágenes de retratos femeninos con iluminación natural y textura de piel realista, ideales para ilustrar artículos sobre moda, belleza o estilo de vida.
- Diseño de personajes para juegos o novelas visuales: el LoRA permite crear personajes femeninos con aspecto fotográfico, manteniendo el control sobre la composición y la escena mediante el prompt.
- Pruebas de concepto para campañas publicitarias: los equipos creativos pueden generar rápidamente variaciones de modelos femeninas para evaluar direcciones de arte antes de una sesión fotográfica real.
- Generación de imágenes para entrenamiento de otros modelos: las imágenes sintéticas realistas pueden servir como datos aumentados para modelos de visión por computadora o para fine-tuning de otros generadores.
- Personalización de avatares en entornos de realidad virtual o videojuegos: los usuarios pueden crear avatares femeninos realistas a partir de descripciones textuales, sin necesidad de modelado 3D.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas objetivas como FID, CLIP score o comparativas con otros LoRAs de Krea 2.

## Requisitos de hardware

- El LoRA en sí ocupa 224 MB, pero requiere cargar el modelo base Krea-2-Turbo, que es un modelo de difusión de tamaño considerable (no se especifican sus requisitos exactos en la documentación).
- Para inferencia local, se recomienda una GPU con al menos 8 GB de VRAM para ejecutar el modelo base en precisión fp16, aunque 12 GB ofrecen más margen (según guías de entrenamiento de LoRAs para Krea 2 en GPUs de 12 GB).
- GPUs recomendadas: RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090, o GPUs de datacenter como A100 o H100 si se usa en producción.
- El despliegue se puede realizar mediante ComfyUI (entorno gráfico) o mediante herramientas de línea de comandos que soporten LoRAs, como Diffusers con el pipeline de Krea 2.
- No se han publicado datos de latencia o throughput. Dado que el modelo base es una variante "turbo", se espera una generación en pocos segundos (8-12 pasos), pero depende del hardware.

## Comparativa con modelos similares

Existen otros LoRAs para Krea 2 orientados al realismo fotográfico, como "Krea2 Realism V1" (mencionado en stablediffusiontutorials.com) o "RawGirl" (en Civitai). Sin embargo, no se dispone de especificaciones técnicas públicas comparables (parámetros, contexto, rendimiento). La siguiente tabla resume lo que se conoce:

| Modelo | Enfoque | Tamaño | Trigger word | Licencia |
|---|---|---|---|---|
| HerRAW v0.1 | Fotografía femenina realista | 224 MB | No | other |
| Krea2 Realism V1 | Realismo general (texturas, anatomía) | no disponible | no disponible | no disponible |
| RawGirl v3.0 | Estética "raw" de iPhone, sin brillo IA | no disponible | no disponible | no disponible |

Se recomienda evaluar cada LoRA en el flujo de trabajo propio para determinar cuál se adapta mejor al estilo deseado.

## Limitaciones y advertencias

- Versión experimental v0.1: el autor la describe como un baseline para validar la viabilidad; es posible que presente inconsistencias o artefactos en algunos casos.
- Sesgo de género: el modelo está entrenado específicamente para retratos femeninos, por lo que no es adecuado para generar imágenes masculinas u otros sujetos.
- Riesgo de alucinación en detalles finos: como cualquier modelo de difusión, puede generar errores en manos, ojos o texturas complejas, especialmente con prompts muy detallados.
- Limitaciones de idioma: no se especifican idiomas soportados; se asume que el prompt debe estar en inglés, ya que el modelo base Krea 2 está entrenado principalmente con datos en inglés.
- Licencia "other": el uso comercial puede estar restringido por los términos de la licencia comunitaria de Krea 2. Es obligatorio revisar la licencia del modelo base antes de usar este LoRA en producción.
- No se garantiza la preservación exacta del prompt: aunque el LoRA busca mantener la composición y el sujeto, la adaptación puede alterar ligeramente la interpretación del texto.

## Enlaces

- [Página del modelo en HuggingFace](https://huggingface.co/VividMuse-AGI/HerRAW-krea2-lora)
- [Colección de LoRAs de Krea 2 en HuggingFace](https://huggingface.co/collections/krea/krea-2-loras)
- [Guía de entrenamiento de LoRAs para Krea 2 con 12 GB VRAM](https://note.com/sepiablue/n/nbc355cc7e114?hl=en)
- [Artículo sobre LoRAs de Krea 2 para generación estilizada](https://www.stablediffusiontutorials.com/2026/06/krea2-lora-models.html)
