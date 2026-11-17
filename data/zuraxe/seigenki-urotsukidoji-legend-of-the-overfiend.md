# zuraxe/seigenki-urotsukidoji-legend-of-the-overfiend

## Resumen

Seigenki es un adaptador LoRA de personaje para modelos de difusión SDXL, distribuido por el estudio NSFWstudio a través de la plataforma Renderoverse y replicado en Hugging Face por el usuario zuraxe. El adaptador reproduce el personaje Seigenki de la franquicia *Urotsukidōji: Legend of the Overfiend*, y se emplea junto a checkpoints base compatibles con SDXL para generar imágenes del personaje mediante prompts de texto.

Técnicamente se trata de un LoRA de bajo rango (185,7 MB en safetensors) diseñado para la familia de checkpoints Illustrious XL, con base declarada AnyIllustrious XL v0.1.1 sobre SDXL epsilon. No es un modelo autónomo: requiere un checkpoint SDXL completo para funcionar, y su calidad final depende en gran medida del checkpoint, del prompt y de la fuerza del adaptador aplicada.

Su relevancia es acotada: se trata de un artefacto de nicho para generación de imágenes de personaje, sin benchmarks publicados, sin métricas de calidad y con etiquetado explícito de contenido no apto para todas las audiencias. Resulta útil para pipelines de ilustración que ya trabajen con SDXL/Illustrious y necesiten consistencia de personaje.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre SDXL; base declarada AnyIllustrious XL v0.1.1 / SDXL epsilon |
| Parámetros totales | no disponible (adaptador de 185.720.200 bytes en safetensors) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo text-to-image) |
| Tipos de cuantización | no disponible; el archivo se distribuye en safetensors sin cuantizar |
| Idiomas soportados | no disponible (los prompts dependen del codificador de texto del checkpoint base) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas del modelo base para modificar su comportamiento sin reentrenar los pesos completos. El modelo base declarado en los metadatos embebidos es AnyIllustrious XL v0.1.1, una variante de la familia Illustrious construida sobre la arquitectura SDXL (UNet con codificador de texto CLIP y VAE). El archivo pesa 185.720.200 bytes y su SHA-256 es `994e5173b3774ae367bd5ed78e7e5e352227f4a05f85186438a79e2bac7fcd62`.

No se dispone de información sobre el número de imágenes de entrenamiento, la composición del dataset, el número de pasos, la tasa de aprendizaje ni si se aplicaron técnicas de regularización o captions específicos. La model card únicamente indica que el conjunto de entrenamiento incluye imágenes vestidas y desnudas del personaje, y que se proporcionan dos tokens de activación: `seigenki_renderoverse` para el personaje y `Seigenkioutfit` para el atuendo. No se documenta ninguna innovación técnica adicional (decodificación especulativa, atención lineal u otras) más allá del propio mecanismo LoRA.

## Capacidades

- Generación de imágenes text-to-image del personaje Seigenki mediante el token de activación `seigenki_renderoverse`.
- Control del atuendo mediante el token secundario `Seigenkioutfit`.
- Compatibilidad con checkpoints SDXL, con base de referencia AnyIllustrious XL v0.1.1.
- Integración en ComfyUI mediante el nodo Load LoRA, con ajuste de fuerza del adaptador.
- Aplicable a pipelines de difusión estándar que acepten adaptadores LoRA en formato safetensors.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step: es un adaptador de imagen, no un modelo de lenguaje.
- No dispone de capacidades multilingües propias; la cobertura de idiomas depende del codificador de texto del checkpoint base.
- No incluye modo thinking, visión, audio ni otras capacidades multimodales más allá de la generación de imagen.

## Casos de uso

- Ilustración de personaje consistente: usar el LoRA con un checkpoint Illustrious XL para generar variaciones del personaje manteniendo rasgos reconocibles a lo largo de una serie de imágenes, ajustando la fuerza del adaptador entre 0,6 y 1,0 según el checkpoint.
- Creación de fan art y material derivado: el adaptador permite reproducir el personaje de *Urotsukidōji* en escenas nuevas, útil para comunidades de fan art que ya trabajen con SDXL.
- Producción de storyboards y viñetas: combinado con prompts de composición y pose, permite generar paneles coherentes de un mismo personaje para prototipado visual rápido.
- Pruebas de pipelines de difusión: sirve como caso de prueba para validar la carga de LoRA en ComfyUI, la resolución de tokens de activación y el ajuste de fuerza en entornos de despliegue de imagen.
- Variaciones de vestuario: el token `Seigenkioutfit` permite separar identidad y atuendo, útil para generar al personaje con distintas indumentarias manteniendo el rostro.
- Investigación sobre sesgos y contenido NSFW en modelos de difusión: al estar marcado como no apto para todas las audiencias y entrenado con imágenes vestidas y desnudas, puede emplearse en estudios controlados sobre filtrado y moderación de contenido generado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se suministra ninguna evaluación de calidad de imagen ni benchmark con esta réplica.

## Requisitos de hardware

- VRAM estimada para inferencia: depende del checkpoint SDXL base, no del LoRA. Un SDXL en fp16 requiere típicamente entre 8 y 12 GB de VRAM; el adaptador añade una sobrecarga mínima (185,7 MB).
- GPU recomendadas: RTX 3090, RTX 4090, A100 o H100 para generación a resolución completa con buen throughput; GPUs con 8 GB o más pueden ejecutar SDXL con optimizaciones.
- Cabe en GPU de consumo: sí, en RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070/4080/4090 y equivalentes, siempre que el checkpoint base quepa en memoria.
- Opciones de despliegue: ComfyUI (Load LoRA), Automatic1111/Forge, Diffusers con `load_lora_weights`, y otros frontends compatibles con LoRA SDXL en safetensors.
- Latencia y throughput estimados: no disponibles; dependen íntegramente del checkpoint base, la GPU, la resolución y el número de pasos.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Seigenki (este LoRA) | LoRA de personaje | SDXL / AnyIllustrious XL v0.1.1 | no aplica | MIT | Hugging Face y Renderoverse |
| LoRA de personaje SDXL genérico | LoRA de personaje | SDXL | no aplica | variable según autor | Civitai, Hugging Face |
| Checkpoint Illustrious XL | Checkpoint completo | SDXL | no aplica | variable | Hugging Face |
| Checkpoint SDXL base | Checkpoint completo | SDXL | no aplica | CreativeML Open RAIL++-M | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Contenido no apto para todas las audiencias: el repositorio está marcado como `not-for-all-audiences` y el entrenamiento incluye imágenes desnudas, lo que exige moderación en despliegues públicos.
- La licencia MIT cubre el artefacto, pero no otorga derechos sobre personajes, nombres o marcas de terceros; no es un lanzamiento oficial de los titulares de derechos de *Urotsukidōji*.
- Riesgo de alucinación visual: como todo modelo de difusión, puede generar anatomía incorrecta, artefactos y resultados inconsistentes con el prompt.
- Dependencia total del checkpoint base: los resultados varían según el checkpoint, el prompt y la fuerza del LoRA; no hay evaluación de calidad publicada.
- Sin información sobre sesgos: no se documentan sesgos de representación ni composición del dataset más allá de la mención a imágenes vestidas y desnudas.
- Sin soporte de texto, código, razonamiento ni tool calling: no debe evaluarse como modelo de lenguaje.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de validación por parte de la comunidad.
- Repositorio de 0,2 GB con un único archivo de pesos; no se incluyen ejemplos, demos ni configuraciones de inferencia en la réplica.

## Enlaces

- Hugging Face: https://huggingface.co/zuraxe/seigenki-urotsukidoji-legend-of-the-overfiend
- Listado original en Renderoverse: https://renderoverse.com/model/seigenki-urotsukidoji-legend-of-the-overfiend
- Renderoverse (plataforma): https://renderoverse.com/
