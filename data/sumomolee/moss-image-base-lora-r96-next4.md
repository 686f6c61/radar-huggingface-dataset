# SumomoLee/MOSS-Image-Base-LoRA-r96-next4

## Resumen

MOSS-Image-Base-LoRA-r96-next4 es un adaptador LoRA de rango 96 publicado por el usuario SumomoLee sobre el modelo base de difusión MOSS-Image-Base, desarrollado por OpenMOSS. Se trata de un ajuste fino ligero orientado a la generación de imágenes a partir de texto (text-to-image), empaquetado en formato de adaptador PEFT y distribuido bajo licencia Apache 2.0. El repositorio ocupa 0,7 GB, lo que es coherente con un adaptador de rango alto sobre un modelo de 5B parámetros.

El modelo subyacente, MOSS-Image, es un transformer de difusión (DiT) de 5B parámetros diseñado específicamente para renderizado de texto de alta calidad y control de layout nativo mediante instrucciones textuales. La variante Base es la versión no post-entrenada, que según la documentación del ecosistema MOSS-Image es un punto de partida preferible para el entrenamiento de LoRAs frente a la variante SFT.

La relevancia de esta ficha es doble: por un lado documenta un adaptador concreto con muy poca información pública (0 descargas, 0 likes en el momento de la consulta); por otro, contextualiza el ecosistema MOSS-Image, que incluye herramientas de entrenamiento como KohakuMossTrainer y conversiones a ComfyUI/GGUF. El acceso al repositorio está restringido (gated), por lo que es necesario aceptar condiciones en Hugging Face antes de descargarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un DiT (diffusion transformer) de 5B parámetros |
| Parametros totales | No disponible (el adaptador ocupa 0,7 GB; el modelo base tiene 5B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible para el adaptador; el ecosistema MOSS-Image dispone de conversiones GGUF |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible (repositorio de 0,7 GB; previsiblemente safetensors, sin confirmar) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre MOSS-Image-Base, un transformer de difusión de 5B parámetros. A diferencia de los modelos de difusión UNet clásicos, los DiT procesan los latentes de imagen como secuencias de tokens mediante atención, lo que facilita el control de layout y el renderizado de texto dentro de la imagen. El nombre del adaptador (r96-next4) sugiere un rango LoRA de 96, un valor alto en comparación con los rangos típicos de 8 a 64, lo que implica una capacidad de adaptación mayor y un mayor riesgo de sobreajuste si el dataset es pequeño.

No se dispone de información pública sobre el dataset de entrenamiento, el número de pasos, la resolución nativa ni la composición de los datos usados para este adaptador concreto. El ecosistema cuenta con KohakuMossTrainer, un framework que soporta todos los algoritmos LyCORIS y ajuste completo sobre datos texto-imagen a resoluciones nativas, con perfiles de offload que permiten entrenar desde tarjetas de 6 GB hasta nodos multi-GPU. Como referencia de eficiencia, la documentación de esa herramienta menciona que un LoRA de estilo de rango 8 en fp16 sobre GEMMs fp8 completa 100 pasos con batch aproximado de 4 (unos 20k tokens por paso) en una única RTX 4090.

## Capacidades

- Generación de imágenes a partir de descripciones textuales, heredando las capacidades del modelo base MOSS-Image.
- Renderizado de texto de alta calidad dentro de la imagen, una de las características diferenciales de MOSS-Image.
- Control de layout nativo mediante instrucciones textuales, según la documentación oficial del modelo base.
- Ajuste de estilo o dominio específico inducido por el adaptador LoRA (el contenido concreto del ajuste no está documentado).
- Compatibilidad con pipelines de difusión estándar y con conversiones a ComfyUI documentadas en el ecosistema.
- No se ha documentado soporte de tool calling, agentes ni razonamiento multi-paso, ya que es un modelo generativo de imagen, no un LLM.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Generación de ilustraciones con texto integrado: el modelo base destaca en renderizado de texto, por lo que resulta adecuado para carteles, portadas y materiales promocionales donde el texto forma parte de la composición.
- Exploración de estilos personalizados: al ser un LoRA de rango 96, permite aplicar un estilo concreto sobre el modelo base sin reentrenar los 5B parámetros, reduciendo costes de experimentación.
- Prototipado rápido en investigación: sirve como punto de partida para comparar el efecto de distintos rangos y datasets sobre MOSS-Image-Base, dado que la variante Base es la recomendada para entrenamiento de LoRAs.
- Integración en ComfyUI: el ecosistema dispone de conversiones específicas para ComfyUI, lo que facilita incorporar el adaptador a flujos de trabajo de nodos para generación por lotes.
- Generación de maquetas con layout controlado: el control de layout nativo del modelo base permite especificar la disposición de elementos mediante texto, útil para diseño editorial y wireframes visuales.
- Fine-tuning sobre dominio propio: equipos que necesiten adaptar MOSS-Image a un dominio concreto (por ejemplo, un estilo de producto) pueden usar este adaptador como referencia de configuración (rango 96) y entrenar el suyo con KohakuMossTrainer en una sola GPU consumer.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para este adaptador concreto. El modelo base tiene 5B parámetros; en fp16 requeriría del orden de 10 GB solo para pesos, más el coste de activaciones y del VAE/text encoder, por lo que se recomienda planificar con margen adicional.
- GPU recomendadas: no disponible de forma específica. Por el tamaño del modelo base, se sitúa en la gama de GPUs de 24 GB o superiores para fp16; las conversiones GGUF del ecosistema podrían permitir ejecución en GPUs consumer de menor VRAM.
- Cabe en GPU consumer: probablemente en RTX 4090 (24 GB) con fp16 y en tarjetas de 12-16 GB con cuantización GGUF, aunque no hay datos oficiales confirmados para este adaptador.
- Opciones de despliegue: pipelines de difusión de Hugging Face, ComfyUI (existen conversiones del ecosistema), y GGUF mediante runtimes compatibles. KohakuMossTrainer cubre entrenamiento e inferencia en Windows y Linux.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MOSS-Image-Base-LoRA-r96-next4 | Adaptador sobre 5B | LoRA sobre DiT | No disponible | Apache 2.0 | Gated en Hugging Face |
| MOSS-Image-Base | 5B | DiT base | No disponible | No disponible en la información | Público (OpenMOSS) |
| MOSS-Image-SFT | 5B | DiT post-entrenado | No disponible | No disponible en la información | Público (OpenMOSS) |
| Moss-image-beauty-lora (axiomofmind) | Adaptador sobre 5B | LoRA de retrato/belleza | No disponible | No disponible en la información | Público en Hugging Face |

La comparación más directa es con otros LoRAs del mismo ecosistema, como el de retrato y belleza de axiomofmind, que recomienda MOSS-Image-SFT para inferencia y ofrece conversión GGUF. Este adaptador, en cambio, se construye sobre la variante Base, lo que lo orienta más al entrenamiento que a la inferencia final.

## Limitaciones y advertencias

- Información pública muy escasa: 0 descargas y 0 likes en el momento de la consulta, sin model card detallada sobre dataset, pasos o resolución de entrenamiento.
- Acceso restringido (gated): es necesario aceptar condiciones en Hugging Face antes de poder descargar los pesos.
- Al estar entrenado sobre MOSS-Image-Base (no post-entrenado), la calidad de inferencia directa puede ser inferior a la de un LoRA equivalente sobre la variante SFT; el ecosistema recomienda SFT para inferencia.
- El rango 96 es alto, lo que incrementa el riesgo de sobreajuste al estilo o dominio del dataset de entrenamiento y puede reducir la diversidad de las generaciones.
- Riesgo de sesgos y alucinaciones visuales inherente al modelo base y a los datos de entrenamiento, no documentado para este adaptador.
- No hay información sobre idiomas soportados ni sobre el comportamiento con prompts en castellano.
- Aunque la licencia declarada es Apache 2.0, conviene verificar las condiciones del modelo base y del acceso gated antes de un uso comercial en producción.
- No apto para tareas de razonamiento, código o texto: es un modelo de generación de imagen.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/SumomoLee/MOSS-Image-Base-LoRA-r96-next4
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-Base
- Repositorio oficial de MOSS-Image: https://github.com/OpenMOSS/MOSS-Image
- Página oficial de MOSS-Image: https://openmoss.ai/MOSS-Image/
- Framework de entrenamiento KohakuMossTrainer: https://github.com/KohakuBlueleaf/KohakuMossTrainer
- Conversión a ComfyUI del mismo autor: https://huggingface.co/SumomoLee/MOSS-Image-Base-ConvRot-ComfyUI
- LoRA de retrato/belleza del ecosistema: https://huggingface.co/axiomofmind/Moss-image-beauty-lora
