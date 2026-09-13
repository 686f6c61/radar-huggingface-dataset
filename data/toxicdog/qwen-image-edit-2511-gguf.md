# toxicdog/Qwen-Image-Edit-2511-GGUF

## Resumen

Qwen-Image-Edit-2511 es un modelo de difusión para edición de imágenes (pipeline *image-to-image*) desarrollado por el equipo Qwen (Alibaba). Esta ficha corresponde concretamente al repositorio `toxicdog/Qwen-Image-Edit-2511-GGUF`, una versión cuantizada en formato GGUF del modelo original `Qwen/Qwen-Image-Edit-2511`, publicada por el usuario toxicdog y generada con la metodología Unsloth Dynamic 2.0 (capas críticas mantenidas en mayor precisión). El modelo base cuenta con 20.430.401.088 parámetros (~20,43 mil millones) según los pesos en safetensors, y el repositorio GGUF ocupa 267 GB, lo que indica la presencia de múltiples niveles de cuantización.

La relevancia de esta versión reside en el apartado práctico: al estar cuantizada en GGUF, puede ejecutarse en flujos de trabajo locales mediante ComfyUI con el nodo ComfyUI-GGUF de city96, reduciendo drásticamente los requisitos de VRAM frente a los pesos en bfloat16. El modelo base es una revisión de Qwen-Image-Edit-2509 e incorpora mejoras declaradas por el autor en mitigación del *image drift* (deriva de la imagen respecto al original), consistencia de personajes, consistencia en grupos de varias personas, capacidades integradas de LoRA, generación para diseño industrial y razonamiento geométrico.

El modelo acepta una o varias imágenes de entrada junto con un *prompt* de texto en inglés o chino, y produce una imagen editada. No es un modelo de lenguaje: no genera texto, no soporta *tool calling* ni razonamiento multi-paso en el sentido de un LLM, por lo que varias de las métricas habituales de las fichas de LLM (contexto en tokens, MoE, benchmarks de código o matemáticas) no son aplicables.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de difusión para edición de imagen; pipeline `QwenImageEditPlusPipeline` en diffusers. El detalle exacto del backbone no se especifica en la información proporcionada |
| Parámetros totales | 20.430.401.088 (~20,43 mil millones), dato de los safetensors del modelo base |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de imagen, no de lenguaje); el límite de tokens del codificador de texto no se especifica |
| Tipos de cuantización | GGUF con metodología Unsloth Dynamic 2.0 (capas importantes en mayor precisión). Los niveles concretos de cuantización no se detallan en la información proporcionada |
| Idiomas soportados | inglés (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base usa safetensors |

## Arquitectura y entrenamiento

La información disponible describe el modelo como un sistema de edición de imagen *image-to-image* que se carga en diffusers mediante `QwenImageEditPlusPipeline` con `torch_dtype=torch.bfloat16`. En el ejemplo oficial se emplean `num_inference_steps=40`, `true_cfg_scale=4.0`, `guidance_scale=1.0` y `negative_prompt=" "`, lo que confirma un esquema de difusión guiada por prompt con *classifier-free guidance* y soporte de múltiples imágenes de entrada simultáneas (el ejemplo combina dos imágenes y un prompt que describe la escena resultante). No se detallan en la información proporcionada ni el número de tokens de entrenamiento ni la composición del dataset, ni si hubo etapas de RLHF o DPO (poco habituales en modelos de difusión de imagen).

La aportación del repositorio de toxicdog no es arquitectónica, sino de compresión: aplica la metodología Unsloth Dynamic 2.0, que consiste en mantener en precisión más alta las capas consideradas críticas y cuantizar de forma más agresiva las menos sensibles, con el objetivo de preservar la calidad del modelo base a menor coste de memoria. El resultado se empaqueta como GGUF y se integra con el *tooling* de ComfyUI-GGUF, lo que permite cargarlo en ComfyUI sin necesidad de los pesos completos en bfloat16. Las mejoras funcionales declaradas respecto a Qwen-Image-Edit-2509 son la mitigación del *image drift*, la consistencia de identidad en personajes (incluida la fusión de dos personas distintas en una sola fotografía grupal coherente), el soporte integrado de LoRAs creadas por la comunidad, la generación orientada a diseño industrial y un razonamiento geométrico reforzado.

## Capacidades

- Edición de imagen guiada por prompt de texto en inglés y chino (transformación de una imagen de entrada en una versión editada).
- Edición con múltiples imágenes de entrada: el pipeline acepta una lista de imágenes y un prompt que describe la composición final.
- Consistencia de personajes: preservación de la identidad y los rasgos visuales del sujeto tras ediciones imaginativas sobre un retrato de entrada.
- Consistencia multi-persona: fusión de alta fidelidad de dos imágenes de personas separadas en una única fotografía grupal coherente.
- Mitigación de la deriva de imagen (*image drift*), es decir, menor pérdida de fidelidad respecto a la imagen original tras la edición.
- Generación orientada a diseño industrial y razonamiento geométrico mejorado (rotaciones, perspectivas y relaciones espaciales).
- Soporte de LoRAs de la comunidad integrado en el flujo de trabajo.
- Ejecución local mediante GGUF en ComfyUI o vía diffusers con los pesos del modelo base.
- No soporta *tool calling* ni *function calling*.
- No soporta razonamiento agéntico multi-paso ni modo *thinking*.
- No procesa audio ni genera texto.

## Casos de uso

- **Retoque fotográfico profesional por lotes**: cargando el GGUF en ComfyUI con ComfyUI-GGUF, un estudio puede aplicar ediciones guiadas por prompt (cambio de fondo, iluminación, vestuario) sobre cientos de imágenes sin depender de servicios en la nube, gracias a que el formato cuantizado reduce la VRAM necesaria frente a bfloat16.
- **Fotografía de producto para comercio electrónico**: a partir de una foto base de un artículo, el modelo genera variantes de escena y presentación manteniendo la identidad visual del producto, lo que es útil para catálogos con cientos de SKUs.
- **Continuidad de personajes en cómic, animación o storyboard**: la mejora de consistencia de identidad permite editar poses, expresiones y escenarios sobre un mismo personaje sin que deje de parecer el mismo, algo crítico en producción seriada.
- **Composición de fotografías grupales**: fusión de retratos individuales en una sola imagen grupal coherente, un caso realista cuando no es posible reunir físicamente a todos los sujetos para una sesión fotográfica.
- **Prototipado de diseño industrial**: generación de variantes de un producto desde un boceto o render base, con el razonamiento geométrico mejorado como apoyo para validar proporciones y perspectivas antes de pasar a modelado 3D.
- **Personalización de marca mediante LoRA**: entrenamiento de una LoRA propia (estilo corporativo, producto concreto o personaje de marca) y aplicación sobre las ediciones, aprovechando el soporte integrado de LoRAs de la comunidad.
- **Corrección geométrica y de perspectiva**: ajuste de encuadres, rotaciones de objetos y reubicación de elementos dentro de la escena conservando la coherencia visual del conjunto.
- **Generación de material para campañas de marketing**: creación de variaciones de una misma imagen clave para distintas plataformas y formatos desde un único original, integrable en un pipeline automatizado de assets.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio no incluye métricas cuantitativas (FID, CLIP-score, GEdit-Bench u otras) ni comparativas numéricas frente a Qwen-Image-Edit-2509.

## Requisitos de hardware

Las cifras de VRAM que se indican a continuación son estimaciones derivadas del número de parámetros (20,43 mil millones) y del nivel de cuantización; no proceden de mediciones publicadas en la información disponible.

- **Pesos en bfloat16 (modelo base)**: aproximadamente 41 GB solo para los pesos del transformer, más el coste de codificadores y activaciones. Requiere GPU de 80 GB (A100, H100) para operar con holgura.
- **GGUF Q8**: en torno a 21-22 GB de pesos; encaja con dificultad en GPU de 24 GB (RTX 3090, RTX 4090) y con margen en A100 40/80 GB o H100.
- **GGUF Q4**: en torno a 12-13 GB de pesos; viable en GPU de 16-24 GB, incluyendo RTX 4080/4090 y RTX 3090.
- **GGUF Q2-Q3**: en torno a 7-9 GB de pesos; permitiría ejecución en GPU de 8-12 GB, con pérdida de calidad esperable por la agresividad de la cuantización.
- El repositorio ocupa 267 GB, coherente con la publicación de varios niveles de cuantización en un mismo repo; conviene descargar únicamente el archivo del nivel deseado.
- La información proporcionada no especifica si los codificadores de texto se incluyen también en GGUF ni cuánta VRAM adicional requieren.
- **Opciones de despliegue**: ComfyUI con ComfyUI-GGUF (vía recomendada por el autor); diffusers para el modelo base en bfloat16 (`pip install git+https://github.com/huggingface/diffusers`); llama.cpp, vLLM, TGI y Ollama no están indicados para este tipo de modelo de difusión.
- **Latencia y throughput**: no disponibles. El ejemplo oficial usa 40 pasos de inferencia, lo que da una referencia del orden de magnitud del coste por imagen en función de la GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| toxicdog/Qwen-Image-Edit-2511-GGUF (esta ficha) | ~20,43B (mismos pesos, cuantizados) | no aplica | Sin benchmarks publicados en la información disponible; calidad dependiente del nivel de cuantización | Apache 2.0 | HuggingFace (GGUF) |
| Qwen/Qwen-Image-Edit-2511 (base, bfloat16) | 20.430.401.088 | no aplica | Sin benchmarks publicados en la información disponible | Apache 2.0 | HuggingFace, ModelScope, demo en Spaces, Qwen Chat |
| Qwen-Image-Edit-2509 | no disponible | no aplica | Referencia de comparación declarada por el autor: 2511 mejora consistencia, deriva de imagen, LoRA, diseño industrial y geometría | no disponible en la información proporcionada | HuggingFace |

No se dispone de datos verificados en la información proporcionada para establecer una comparativa numérica con alternativas externas de la misma categoría (por ejemplo, otros modelos de edición de imagen por instrucciones). Cualquier cifra que se añadiese aquí no estaría respaldada por las fuentes consultadas.

## Limitaciones y advertencias

- **Naturaleza del modelo**: es un modelo de edición de imagen, no de lenguaje. No genera texto, no responde a preguntas y no soporta *tool calling*; evaluarlo con métricas tipo MMLU o HumanEval carece de sentido.
- **Cobertura de idiomas limitada**: solo inglés y chino según los metadatos. Los prompts en castellano u otras lenguas no están soportados oficialmente y pueden degradar el resultado.
- **Ausencia de benchmarks**: no hay datos publicados en la información disponible sobre fidelidad de edición, alucinación visual o calidad frente al modelo base, ni sobre la degradación introducida por cada nivel de cuantización GGUF.
- **Riesgo de artefactos y deriva residual**: aunque el autor declara mejoras en la mitigación del *image drift*, la edición por difusión puede introducir cambios no solicitados en zonas no relevantes de la imagen, especialmente con cuantizaciones agresivas (Q2/Q3).
- **Sesgos heredados**: al no detallarse la composición del dataset de entrenamiento, no es posible auditar sesgos demográficos, culturales o de representación en los resultados de edición.
- **Reproducibilidad**: el repositorio no incluye semilla fija ni parámetros de muestreo validados; el ejemplo oficial usa `torch.manual_seed(0)` solo como demostración.
- **Procedencia del repositorio**: se trata de una cuantización de terceros (usuario toxicdog) basada en la metodología Unsloth Dynamic 2.0; no es una publicación oficial del equipo Qwen. Conviene verificar la integridad de los archivos y, en entornos de producción, preferir pesos del repositorio oficial si el presupuesto de VRAM lo permite.
- **Licencia**: Apache 2.0 permite uso comercial, pero conviene revisar los términos del modelo base y de cualquier LoRA de terceros que se combine con él, ya que pueden tener licencias distintas.
- **Contexto de imagen**: el tamaño máximo de imagen de entrada y salida no se especifica en la información proporcionada; es un parámetro que debe validarse empíricamente antes de desplegar en producción.
- **Métricas del repositorio**: 0 descargas y 0 *likes* en el momento de la consulta, sin señales de validación por parte de la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/toxicdog/Qwen-Image-Edit-2511-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-Edit-2511
- Modelo en ModelScope: https://modelscope.cn/models/Qwen/Qwen-Image-Edit-2511
- Demo en HuggingFace Spaces: https://huggingface.co/spaces/Qwen/Qwen-Image-Edit-2511
- Qwen Chat (función de edición de imagen): https://chat.qwen.ai/?inputFeature=image_edit
- Blog de Qwen-Image-Edit-2511: https://qwenlm.github.io/blog/qwen-image-edit-2511/
- Informe técnico (PDF): https://qianwen-res.oss-cn-beijing.aliyuncs.com/Qwen-Image/Qwen_Image.pdf
- Repositorio GitHub de Qwen-Image: https://github.com/QwenLM/Qwen-Image
- Guía de Unsloth para ejecutar Qwen-Image: https://unsloth.ai/docs/models/qwen-image-2512
- Documentación de Unsloth Dynamic 2.0: https://docs.unsloth.ai/basics/unsloth-dynamic-2.0-ggufs
- Guía de Unsloth para ComfyUI: https://unsloth.ai/docs/new/comfyui
- ComfyUI-GGUF (city96): https://github.com/city96/ComfyUI-GGUF
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Discord de Unsloth: https://discord.gg/unsloth
- Referencia arXiv asociada a los tags del repositorio: arxiv:2508.02324
