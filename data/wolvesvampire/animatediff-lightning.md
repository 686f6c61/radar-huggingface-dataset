# WolvesVampire/AnimateDiff-Lightning

## Resumen

AnimateDiff-Lightning es un modelo de generación de texto a video desarrollado por ByteDance, que acelera drásticamente la generación de clips cortos mediante técnicas de destilación de difusión. Se presenta como un adaptador de movimiento que se acopla a modelos base de Stable Diffusion 1.5, lo que permite generar videos en 1, 2, 4 u 8 pasos de inferencia en lugar de los más de 20 que requiere AnimateDiff original. El modelo está destilado a partir de AnimateDiff SD1.5 v2 usando destilación adversarial progresiva de difusión, y ha sido publicado como parte de la investigación recogida en el paper «AnimateDiff-Lightning: Cross-Model Diffusion Distillation» (arXiv:2403.12706).

El repositorio analizado (WolvesVampire/AnimateDiff-Lightning) es un re-upload del repositorio oficial de ByteDance, con un tamaño de 7.3 GB y licencia CreativeML OpenRAIL-M. Incluye checkpoints para Diffusers y ComfyUI, y no dispone de información sobre idiomas soportados ni sobre cuantizaciones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador de movimiento (motion adapter) para Stable Diffusion 1.5, basado en UNet con capas de atención temporal |
| Parámetros totales | No disponible |
| Parámetros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No disponible (no aplica; modelo de generación de video) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible |
| Licencia | CreativeML OpenRAIL-M |
| Formato de pesos | Safetensors (checkpoints para Diffusers y ComfyUI) |

## Arquitectura y entrenamiento

AnimateDiff-Lightning no es un modelo independiente, sino un adaptador de movimiento que se integra con un modelo base de Stable Diffusion 1.5. El adaptador añade capas de atención temporal al UNet del modelo base, permitiendo generar secuencias de frames coherentes a partir de un prompt de texto. La variante Lightning aplica destilación adversarial progresiva de difusión, una técnica que comprime el proceso de denoising en muy pocos pasos, logrando una generación más de diez veces rápida que AnimateDiff original.

El modelo se destiló a partir de AnimateDiff SD1.5 v2, y el paper describe además una destilación cruzada entre múltiples modelos base de difusión (cross-model distillation) para mejorar la generalización y la calidad con diferentes estilos. Se publican checkpoints para 1, 2, 4 y 8 pasos, siendo el de 1 paso solo para investigación.

## Capacidades

- Generación de texto a video en 1, 2, 4 u 8 pasos de inferencia.
- Compatible con modelos base estilizados realistas (epiCRealism, Realistic Vision, DreamShaper, AbsoluteReality, MajicMix Realistic) y anime/cartoon (ToonYou, IMP, Mistoon Anime, DynaVision, RCNZ Cartoon 3d, MajicMix Reverie).
- Soporta video a video mediante ControlNet, con workflow específico para OpenPose en ComfyUI.
- Integración con Diffusers y ComfyUI, con ejemplos de uso incluidos en la model card.
- Compatible con Motion LoRAs para generar movimientos más fuertes, recomendando fuerza 0.7-0.8 para evitar marcas de agua.
- En las pruebas oficiales se usaron videos de 8 segundos a 30 fps con resolución 576x1024, lo que sugiere buena capacidad para clips cortos de calidad.

## Casos de uso

- Creación de contenido para redes sociales: generar clips de 8 segundos a partir de prompts de texto usando el modelo de 4 pasos con un modelo base realista como epiCRealism, obteniendo resultados rápidos y con coherencia temporal.
- Animación de personajes para videojuegos: usar modelos anime como ToonYou o Mistoon Anime para producir animaciones de personajes en bucle, combinando Motion LoRAs para movimientos más expresivos.
- Re-estilizado de video existente: aplicar el workflow de ComfyUI con ControlNet OpenPose para transformar videos reales en animaciones con estilo artístico, manteniendo la pose y el movimiento.
- Prototipado rápido para directores de arte: generar múltiples variaciones de movimiento en minutos para explorar ideas de storyboard sin necesidad de renderizados largos, gracias a la inferencia en pocos pasos.
- Fondos animados para presentaciones: crear animaciones abstractas o de paisajes a partir de prompts descriptivos, integrándolas como fondo en herramientas de presentación o streaming.
- Arte generativo y experimentación creativa: combinar el adaptador con modelos personalizados en ComfyUI para producir animaciones únicas con estética experimental, aprovechando la velocidad de generación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo afirma ser más de diez veces rápido que AnimateDiff original y alcanzar un estado del arte en generación de video con pocos pasos, pero no se incluyen cifras concretas de métricas como FVD, CLIP score o IS. El paper (arXiv:2403.12706) puede contener evaluaciones adicionales, pero no están presentes en los datos proporcionados.

## Requisitos de hardware

- No se proporcionan estimaciones de VRAM en la información disponible.
- No se especifican GPU recomendadas.
- Al ser un adaptador para SD1.5, los requisitos de hardware dependen del modelo base y de la resolución de video, pero no hay datos oficiales.
- El despliegue es compatible con Diffusers y ComfyUI. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- No se disponen de datos de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Pasos de inferencia | Base | Tipo | Licencia |
|---|---|---|---|---|
| AnimateDiff-Lightning | 1, 2, 4, 8 | SD1.5 | Adaptador destilado con adversarial diffusion distillation | CreativeML OpenRAIL-M |
| AnimateDiff SD1.5 v2 | No disponible | SD1.5 | Adaptador de movimiento original | No disponible |
| AnimateDiff (original) | No disponible | SD1.5 | Adaptador de movimiento | No disponible |

No se dispone de datos comparativos publicados en la información proporcionada. La diferencia principal es que AnimateDiff-Lightning reduce el número de pasos de inferencia manteniendo calidad, lo que lo hace significativamente más rápido que las versiones anteriores.

## Limitaciones y advertencias

- El checkpoint de 1 paso es solo para investigación; su calidad no es adecuada para producción.
- La calidad final depende en gran medida del modelo base elegido. Se recomienda usar modelos estilizados como los listados en la model card.
- El uso de Motion LoRAs con fuerza superior a 0.8 puede introducir marcas de agua; se recomienda usar 0.7-0.8.
- Existen limitaciones en duración y resolución: las pruebas usaron videos de 8 segundos a 30 fps con resolución 576x1024; videos más largos o de mayor resolución pueden fallar o degradar la calidad.
- No se especifican los idiomas soportados; la comprensión del prompt depende del modelo base, que suele estar optimizado para inglés.
- La licencia CreativeML OpenRAIL-M impone restricciones de uso ético y condiciones específicas para uso comercial; es necesario revisar los términos antes de desplegar en producción.
- Al ser un modelo generativo, existe riesgo de artefactos visuales o incoherencias en escenas complejas, aunque no se documentan casos concretos en la información proporcionada.

## Enlaces

- Modelo en HuggingFace (re-upload): https://huggingface.co/WolvesVampire/AnimateDiff-Lightning
- Repositorio oficial en HuggingFace: https://huggingface.co/ByteDance/AnimateDiff-Lightning
- Paper en arXiv: https://arxiv.org/abs/2403.12706
- Página del paper en HuggingFace: https://huggingface.co/papers/2403.12706
- Demo en HuggingFace Spaces: https://huggingface.co/spaces/ByteDance/AnimateDiff-Lightning
- Workflow de ComfyUI para texto a video: https://huggingface.co/ByteDance/AnimateDiff-Lightning/raw/main/comfyui/animatediff_lightning_workflow.json
- Workflow de ComfyUI para video a video con OpenPose: https://huggingface.co/ByteDance/AnimateDiff-Lightning/raw/main/comfyui/animatediff_lightning_v2v_openpose_workflow.json
