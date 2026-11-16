# utsavz/gemma3_4b_wsp_opus_fable

## Resumen

`gemma3_4b_wsp_opus_fable` es un checkpoint derivado de `google/gemma-3-4b-it` creado por el usuario utsavz mediante una técnica de edición de pesos denominada Weight-Space Patching (WSP) sin gradientes, aplicada en dos etapas para modificar el comportamiento de seguridad multimodal del modelo base. El objetivo declarado es reducir la conformidad ante peticiones dañinas (harmful compliance) manteniendo baja la sobrerrechazo sobre entradas benignas, evaluado con el conjunto de datos VLGuard.

El modelo conserva la arquitectura y el tamaño del Gemma 3 4B instruct original (4.300.079.472 parámetros, pesos en BF16) y solo modifica 5.964.331 elementos de parámetros respecto al checkpoint base, es decir, una fracción mínima del total. Se distribuye como un artefacto de investigación, no como un modelo listo para producción, y su evaluación se basa en un proxy de rechazo por palabras clave y expresiones regulares sobre una única ejecución por configuración.

Es relevante ahora porque ejemplifica una línea de trabajo emergente: el alineamiento de seguridad mediante edición directa de pesos en lugar de fine-tuning supervisado o RLHF, lo que reduce drásticamente el coste computacional del ajuste y permite intervenir sobre modelos abiertos ya publicados. La contrapartida es que la evidencia empírica es limitada y metodológicamente frágil.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 3), derivada de `google/gemma-3-4b-it` |
| Parametros totales | 4.300.079.472 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | no disponible |
| Licencia | Gemma Terms of Use (`license: gemma`) |
| Formato de pesos | safetensors (BF16) |
| Parametros modificados respecto al base | 5.964.331 elementos |
| Tamano del repositorio | 8,6 GB |
| Modelo base (commit) | `google/gemma-3-4b-it` @ `093f9f388b31de276ce2de164bdc2081324b9767` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Gemma 3 4B instruct, un transformer multimodal con capacidad de procesamiento de imagen y texto. El checkpoint no reentrena el modelo: aplica Weight-Space Patching, una técnica de edición de pesos sin gradientes en la que un modelo editor (en este caso, designado como "Opus 5.5" en la etapa 1 y "Fable 5.2" en la etapa 2, ambos a esfuerzo medio) decide primero qué parámetros modificar y después cómo modificarlos. La configuración finalmente publicada corresponde a la mejor ejecución individual del estudio (`best_single:c02_headsmid_a15`), ya que ningún modelo complementario superó la regla de aceptación predefinida.

No se documentan en la información disponible el volumen de tokens de entrenamiento, la composición del dataset más allá del uso de VLGuard para evaluación, ni si hubo RLHF o DPO, dado que el procedimiento no es un entrenamiento convencional. La innovación técnica destacable es precisamente la edición selectiva de pesos: solo 5.964.331 elementos difieren del modelo base, lo que sugiere una intervención quirúrgica sobre un subconjunto de cabezas o capas intermedias (el identificador `headsmid` apunta a cabezas de atención de capas medias).

## Capacidades

- Generación de texto y razonamiento conversacional heredados de Gemma 3 4B instruct.
- Procesamiento de imágenes (entrada multimodal), ya que el modelo base es `Gemma3ForConditionalGeneration`.
- Comportamiento de rechazo reforzado ante peticiones dañinas, incluyendo entradas multimodales, según la evaluación con VLGuard.
- Soporte de tool calling y function calling: no disponible en la información proporcionada para este checkpoint (depende de lo que conserve del base).
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (los idiomas del base no se detallan en la información facilitada).
- Modo "thinking" u otras capacidades especiales: no disponible.

## Casos de uso

- Investigación en alineamiento de seguridad: el checkpoint sirve como caso de estudio reproducible de edición de pesos sin gradientes, permitiendo comparar el comportamiento antes y después del parcheo sobre el mismo modelo base.
- Evaluación de robustez multimodal: útil para analizar cómo responde un modelo de 4B ante entradas imagen-texto potencialmente dañinas, usando VLGuard u otros conjuntos equivalentes.
- Filtrado y moderación de contenido en prototipos: el sesgo hacia el rechazo puede aprovecharse como capa de cribado en pipelines de contenido generado, siempre con revisión humana.
- Comparación de metodologías de alineamiento: sirve para contrastar WSP frente a fine-tuning supervisado o DPO en términos de coste, tasa de rechazo y sobrerrechazo.
- Docencia y divulgación técnica: ejemplo práctico de cómo un parche mínimo (menos del 0,14 % de los parámetros) altera el comportamiento de seguridad de un modelo abierto.
- Pruebas de regresión de seguridad: integrable en baterías de evaluación que midan conformidad dañina y falsos rechazos en modelos derivados de Gemma 3.

## Benchmarks y rendimiento

| Metrica (VLGuard test) | Resultado |
|---|---|
| Registros evaluados | 1.558 |
| Conformidad dañina (harmful compliance) | 21/1000 |
| Sobrerrechazo benigno (benign over-refusal) | 40/558 |
| Fallos de generación | 0/1558 |
| Configuración de decodificación | greedy, 512 tokens nuevos |
| Método de juicio | proxy de rechazo por palabras clave y regex |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los datos anteriores corresponden únicamente a la evaluación de seguridad declarada por el autor, con una sola ejecución por configuración y sin comparación numérica con el modelo base en la información facilitada.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 8,6 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 10 y 14 GB según longitud de contexto y lote.
- VRAM estimada en cuantización de 8 bits: en torno a 5-6 GB de pesos; en 4 bits, en torno a 3 GB (cuantizaciones no publicadas por el autor, pero aplicables con herramientas estándar sobre el checkpoint BF16).
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para despliegue en BF16 con lotes grandes; RTX 4090 (24 GB) y RTX 3090 (24 GB) suficientes para inferencia en BF16 con contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090, RTX 4080 (16 GB) con margen ajustado en BF16, y en GPUs de 8-12 GB si se cuantiza a 8 o 4 bits.
- Opciones de despliegue: `transformers` con `Gemma3ForConditionalGeneration` y `AutoProcessor` (código de ejemplo incluido en la model card), vLLM y TGI para servir el checkpoint, y llama.cpp/Ollama si se generan versiones GGUF a partir de los pesos BF16.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `utsavz/gemma3_4b_wsp_opus_fable` | 4,3 B | no disponible | Edición de pesos WSP para seguridad multimodal | Gemma | Hugging Face (0 descargas) |
| `google/gemma-3-4b-it` | 4,3 B | no disponible en esta ficha | Instruct multimodal original | Gemma | Hugging Face (oficial) |
| Fine-tuning de seguridad sobre Gemma 3 4B (genérico) | 4,3 B | no disponible | SFT/DPO con datos de seguridad | Gemma | Variable según autor |
| Modelos de moderación dedicados (p. ej. clasificadores de seguridad) | Variable | Variable | Clasificación, no generación | Variable | Variable |

La comparación cuantitativa de rendimiento frente a estas alternativas no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Artefacto de investigación: el propio autor lo etiqueta como tal, con una sola ejecución por configuración y sin validación cruzada.
- El juicio de rechazo se realiza mediante un proxy de palabras clave y expresiones regulares, no mediante un evaluador humano ni un modelo juez; puede sobreestimar o subestimar el rechazo real.
- No se han publicado evaluaciones de capacidades generales (razonamiento, código, matemáticas, multilingüismo), por lo que se desconoce si el parcheo degrada otras habilidades del modelo base.
- Riesgo de alucinación: inherente a los modelos de 4B; no se documenta mitigación específica en este checkpoint.
- Sesgos conocidos: no disponibles en la información proporcionada; los del modelo base Gemma 3 aplican y no se han medido tras el parcheo.
- Sobrerrechazo benigno medido de 40/558 (aproximadamente el 7,2 %), lo que puede afectar a aplicaciones donde el rechazo indebido tiene coste.
- Restricciones de licencia: sujeto a los Gemma Terms of Use, que imponen condiciones de uso, redistribución y prohibiciones específicas para uso comercial; conviene revisarlas antes de cualquier despliegue.
- Ausencia de cuantizaciones oficiales y de documentación sobre idiomas soportados; el despliegue en producción requeriría validación propia.
- El identificador del run menciona modelos editores ("Opus 5.5", "Fable 5.2") sin especificación técnica reproducible en la información disponible, lo que dificulta la replicación exacta.

## Enlaces

- Hugging Face: https://huggingface.co/utsavz/gemma3_4b_wsp_opus_fable
- Modelo base: https://huggingface.co/google/gemma-3-4b-it
- Términos de uso de Gemma: https://ai.google.dev/gemma/terms
- Conjunto de evaluación VLGuard: no disponible en la información proporcionada
- Paper o blog del método Weight-Space Patching: no disponible en la información proporcionada
- Repositorio de código del autor: no disponible en la información proporcionada
