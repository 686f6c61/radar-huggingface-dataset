# yetalabs/Kimi-K3.1-Pro-abliterated

## Resumen

Kimi-K3.1-Pro-abliterated es un checkpoint derivado del modelo Kimi K3.1-Pro de Moonshot AI, publicado por el usuario yetalabs en Hugging Face. Se trata de una variante "abliterated": se ha extraído una dirección de rechazo a partir de las activaciones residuales del modelo base y se ha proyectado fuera de las matrices de escritura residual en una sola pasada. El enrutador (router), la torre de visión, el embedding y la cabeza del modelo de lenguaje permanecen sin cambios respecto al modelo base.

El modelo conserva la arquitectura y capacidades del Kimi K3.1-Pro original, con 2,78 billones de parámetros totales según los pesos en safetensors, lo que lo sitúa en la categoría de modelos de frontera de gran escala. El pipeline declarado es image-text-to-text, lo que indica capacidades multimodales de entrada de imagen y texto. El repositorio ocupa 1.561,4 GB y los pesos se distribuyen en formato safetensors de 8 bits.

La relevancia de esta ficha radica en que documenta una modificación de alineación (eliminación de la dirección de rechazo) sobre un modelo de gran escala, con datos de evaluación propios sobre comportamiento de rechazo, Terminal Bench 2.1 y GSM8K. No obstante, la información pública disponible es muy limitada: no se detallan idiomas soportados, datos de entrenamiento, contexto ni la mayoría de especificaciones técnicas del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta `kimi_k31`, `custom_code`; transformer multimodal presumiblemente, sin confirmar) |
| Parametros totales | 2.780.110.363.392 (2,78 billones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | pesos en 8 bits (etiqueta `8-bit`); no se documentan otras variantes |
| Idiomas soportados | no disponible |
| Licencia | other (licencia personalizada, ver repositorio) |
| Formato de pesos | safetensors (librería transformers, `custom_code`) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura del modelo base Kimi K3.1-Pro en la documentación proporcionada. La etiqueta `kimi_k31` y el uso de `custom_code` indican que requiere código personalizado de transformers para su carga, y el pipeline image-text-to-text confirma que acepta entradas multimodales de imagen y texto. El número de parámetros totales (2,78 billones) se ha obtenido directamente de los tensores en safetensors.

El proceso de "abliteration" descrito en la model card consiste en extraer una dirección de rechazo a partir de las activaciones residuales y proyectarla fuera de las matrices de escritura residual en una única pasada. Según el autor, el enrutador, la torre de visión, el embedding y la cabeza del modelo de lenguaje no se modifican respecto al modelo base. No se especifican datos de entrenamiento, número de tokens, composición del dataset ni si hubo RLHF o DPO en el modelo base ni en este checkpoint derivado.

## Capacidades

- Generación de texto y razonamiento: heredadas del modelo base Kimi K3.1-Pro, sin datos específicos publicados.
- Entrada multimodal imagen-texto: el pipeline declarado es image-text-to-text y la torre de visión se mantiene intacta.
- Comportamiento sin rechazo: según el benchmark del autor, el modelo entrega respuesta en el 78,5% de los casos frente al 5,4% del base, con 0% de rechazos explícitos.
- Razonamiento matemático: el autor reporta 40/40 correctos en GSM8K con evaluación por LLM judge.
- Ejecución de tareas de terminal/agente: Terminal Bench 2.1 con 43/51 aprobados frente a 44/51 del base.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Investigación sobre alineación y rechazo: el checkpoint permite estudiar cómo la proyección de una dirección de rechazo afecta al comportamiento del modelo en dominios sensibles, comparando directamente con el modelo base mediante las trazas publicadas.
- Evaluación de robustez de salvaguardas: útil para equipos de seguridad que quieran medir la eficacia de filtros externos cuando el propio modelo no rechaza, ya que el autor advierte que las moderaciones de CSAM, daño físico y actos ilegales no se han eliminado.
- Automatización de tareas de terminal y agentes: con 43/51 en Terminal Bench 2.1, puede emplearse en pipelines de ejecución de comandos y resolución de tareas multi-paso en entornos controlados.
- Procesamiento multimodal documental: al conservar la torre de visión, puede emplearse para tareas image-text-to-text como extracción de información de capturas o documentos escaneados, siempre que se valide su comportamiento.
- Razonamiento matemático supervisado: los resultados de GSM8K (40/40) sugieren uso en resolución de problemas aritméticos dentro de pipelines con verificación posterior.
- Investigación comparativa de checkpoints derivados: permite contrastar el efecto de la abliteración frente a otras variantes del mismo modelo base, como la de penclaw citada en la model card.
- Generación de contenido sin fricción de rechazo en dominios creativos: para casos donde el rechazo del modelo base resulta un obstáculo (ficción, role-play), con la advertencia de que las salvaguardas legales no están garantizadas por el modelo.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card:

| Benchmark | Base | Este modelo |
|---|---|---|
| Refusal benchmark (DELIVERED) | 28 (5,4%) | 408 (78,5%) |
| Refusal benchmark (DEFLECTED) | 480 (92,3%) | 112 (21,5%) |
| Refusal benchmark (REFUSED) | 12 (2,3%) | 0 (0,0%) |
| Terminal Bench 2.1 (PASS) | 44/51 | 43/51 |
| GSM8K (LLM judge, correct) | no disponible | 40/40 |

No se han publicado en la información disponible resultados de MMLU, HumanEval ni otros benchmarks estándar para este modelo.

## Requisitos de hardware

- VRAM estimada: con 2,78 billones de parámetros en 8 bits, el peso de los parámetros ronda los 2,78 TB; el repositorio completo ocupa 1.561,4 GB, por lo que la inferencia requiere clústeres multi-GPU de gran escala, no una sola GPU.
- GPU recomendadas: no disponibles en la documentación; por el tamaño, se requiere hardware de centro de datos (clases H100/H200/B200 o equivalentes) en configuración multi-nodo.
- Consumer GPU: no cabe en ninguna GPU de consumo (RTX 4090, 3090, etc.) en ninguna cuantización documentada.
- Opciones de despliegue: transformers con `custom_code`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Kimi-K3.1-Pro-abliterated (este) | 2,78 B (total) | no disponible | other | Checkpoint abliterated, 8 bits, multimodal |
| moonshotai/Kimi-K3.1-Pro (base) | no disponible | no disponible | no disponible | Modelo original de Moonshot AI; 92,3% de deflexión en refusal benchmark |
| Checkpoint abliterated de penclaw | no disponible | no disponible | no disponible | Citado en la model card con trazas comparativas en el repositorio |

No se dispone de datos suficientes para comparar con otras alternativas de la misma categoría (contexto, rendimiento, disponibilidad).

## Limitaciones y advertencias

- El autor advierte explícitamente que las moderaciones para CSAM, daño físico y otras acciones ilegales NO se han eliminado; el modelo no sustituye a filtros de seguridad externos.
- Riesgo elevado de contenido dañino o inapropiado en producción: la eliminación de la dirección de rechazo reduce la deflexión del 92,3% al 21,5% según el propio benchmark del autor.
- Licencia "other": es imprescindible revisar los términos del repositorio y los del modelo base antes de cualquier uso comercial.
- Idiomas soportados no documentados; no se puede garantizar calidad multilingüe.
- Longitud de contexto no disponible, lo que impide planificar cargas de trabajo con ventanas largas.
- Riesgo de alucinación no evaluado en la información disponible.
- Sesgos conocidos no documentados.
- El modelo requiere `custom_code` y transformers, con un tamaño de repositorio de 1.561,4 GB; el despliegue es costoso y complejo.
- Los benchmarks publicados son escasos y autoevaluados por el autor (LLM judge), sin comparación con estándares externos.

## Enlaces

- Hugging Face: https://huggingface.co/yetalabs/Kimi-K3.1-Pro-abliterated
- Trazas de benchmark: https://huggingface.co/yetalabs/Kimi-K3.1-Pro-abliterated/tree/main/benchmark
- Modelo base: https://huggingface.co/moonshotai/Kimi-K3.1-Pro
