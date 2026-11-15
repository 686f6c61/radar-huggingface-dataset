# tensor-tailor/zils-lite-body-20

## Resumen

zils-lite-body-20 es un modelo de decisión ("decision body") perteneciente al pool de sopas `d3-lite` del proyecto Zils, vinculado al subnet 127 de Bittensor. Lo desarrolla el usuario `tensor-tailor` y deriva de la familia Qwen/Qwen3.5-0.8B, con un total de 852.985.920 parámetros en formato safetensors. El modelo resuelve una tarea acotada: clasificación y decisión sobre filas etiquetadas y prompts de tipo elección múltiple, sí/no y puntuación, entrenado específicamente para alinearse con las probabilidades de un modelo profesor denominado d3-ultra.

Técnicamente, el modelo parte de una sopa de pesos (S11) construida como media uniforme de dos cuerpos públicos (`VadymPikulyk/zils-lite-dh2` y `qhoenix/zils-lite-decision-avg-abc`), sobre la que se aplican tres ejecuciones de LoRA de rango 16 fusionadas posteriormente en los pesos completos. El resultado es una media ponderada (factor 1/3 por ejecución) de las tres variantes entrenadas con semillas distintas (5201, 5211, 5221), lo que busca reducir la varianza entre ejecuciones y estabilizar la decisión.

Es relevante ahora porque ilustra un patrón de trabajo emergente en el ecosistema open source: modelos pequeños (sub-1000M) especializados en tareas de decisión, entrenados mediante combinación de adaptadores LoRA y destilación de probabilidades desde un profesor, con trazabilidad criptográfica de pesos y datasets. Su licencia Apache 2.0 y su tamaño compacto lo hacen apto para despliegues ligeros, aunque su naturaleza experimental y su ausencia de benchmarks públicos exigen cautela.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3.5-0.8B (tag `qwen3_5`), con código personalizado (`custom_code`) |
| Parámetros totales | 852.985.920 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (almacenados en bf16 tras la fusión de LoRA) |

## Arquitectura y entrenamiento

El modelo se construye sobre la familia Qwen3.5-0.8B, con etiqueta de arquitectura `qwen3_5` y código personalizado registrado en el repo. El proceso de construcción parte de S11, la sopa oficial de la ronda `d3-lite-2026-11-14` (hash `0db42586...`), reconstruida como media uniforme de los dos cuerpos públicos miembros en sus revisiones comprometidas. Sobre esa base se entrenan tres ejecuciones independientes con adaptadores LoRA de rango 16, alpha 32 y dropout 0.05 aplicados a 114 módulos (todas las capas), que después se fusionan en los pesos completos mediante `start + alpha/rank × B A`, almacenados en bf16. La combinación final es `START + sum over 3 runs of c × (RUN - START)` con c = 1/3, afectando a 114 tensores.

El entrenamiento usa AdamW con learning rate 1e-4, weight decay 0, 50 pasos de warm-up seguidos de decaimiento coseno, 1 epoch, batch 8 con 2 pasos de acumulación y filas de hasta 2.048 tokens. La función de pérdida combina tres términos con peso 1: KL(profesor || cuerpo) a temperatura 1 sobre 49.997 filas de profesor, entropía cruzada sobre la etiqueta en 27.380 filas etiquetadas, y KL contra la distribución de respuestas del propio start sobre 12.095 prompts de anclaje ("pins"), calculada en vivo desde los pesos iniciales. Cada ejecución procesa 77.377 filas y 12.095 pins, con pérdidas finales de 0.2800, 0.2932 y 0.3148 para las semillas 5201, 5211 y 5221 respectivamente, y tiempos de entrenamiento de aproximadamente 195-198 minutos por ejecución. Los datos etiquetados provienen de 20 grupos de datasets públicos (GLUE/MNLI/QNLI, entre otros) con verificación ciega por muestra, generadores propios de programas, el diccionario CMU y respuestas escritas por sesiones de Claude del equipo (5.800 filas); las filas de profesor cubren razonamiento, lenguaje, retrieval, herramientas y artes.

## Capacidades

- Clasificación de decisión en formato de elección múltiple (choice), sí/no (yes-no) y puntuación (score) sobre prompts estructurados.
- Destilación de comportamiento desde un modelo profesor (d3-ultra) mediante KL sobre distribuciones de probabilidad, lo que transfiere preferencias de decisión del profesor.
- Anclaje al comportamiento del modelo base mediante pins, que preservan la distribución de respuestas original en prompts seleccionados.
- Cobertura de cinco categorías de tarea: razonamiento, lenguaje, retrieval, herramientas (tools) y artes.
- Generación de texto subyacente heredada de Qwen3.5-0.8B (no verificada en la información disponible).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible (los idiomas no están declarados).
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Clasificación de respuestas en pipelines de evaluación automatizada: el modelo puede puntuar o etiquetar filas de examenes (choice/yes-no/score) con una cabeza de decisión entrenada específicamente para alinearse con un profesor, útil para construir jueces automáticos internos.
- Enrutamiento de consultas en sistemas RAG: dado que fue entrenado con filas de retrieval y tools, puede usarse para decidir si una consulta requiere recuperación, llamada a herramienta o respuesta directa, siempre que se valide su comportamiento en el dominio objetivo.
- Filtrado de datos de entrenamiento: su capacidad de puntuación permite usarlo como clasificador de calidad o relevancia sobre grandes lotes de filas antes de incorporarlas a un dataset.
- Evaluación de modelos profesor-alumno: sirve como referencia para medir la fidelidad de destilación, comparando sus distribuciones con las del profesor d3-ultra en las mismas filas.
- Experimentación en subredes de Bittensor: encaja como cuerpo candidato en el pool `d3-lite` del subnet 127, donde se combinan pesos de múltiples participantes mediante sopas ponderadas.
- Despliegue ligero en entornos con recursos limitados: con 853M parámetros y pesos bf16 (repo de 1,7 GB), puede ejecutarse en una única GPU consumer para tareas de clasificación por lotes, aunque la latencia no está documentada.
- Investigación sobre combinación de adaptadores: el modelo documenta con hashes el proceso de fusión LoRA y media de ejecuciones, lo que lo convierte en un caso reproducible para estudiar el efecto de promediar pesos entrenados con semillas distintas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta pérdidas finales de entrenamiento (0.2800, 0.2932 y 0.3148) y no incluye evaluaciones de MMLU, HumanEval, GSM8K ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 1,7 GB solo para pesos, más overhead de activaciones y contexto; no disponible una cifra oficial.
- VRAM estimada en cuantización de 8 bits: alrededor de 0,9 GB para pesos; en 4 bits, alrededor de 0,5 GB, sin datos oficiales de soporte.
- GPU recomendadas: cualquier GPU consumer con al menos 4-8 GB de VRAM debería poder cargar los pesos, aunque no se ha verificado; para lotes grandes se recomienda una GPU con 16 GB o más (RTX 4090, A100, H100).
- Cabe en GPU consumer: sí, por tamaño de pesos, en tarjetas como RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090; la viabilidad real depende del código personalizado (`custom_code`), que puede limitar el soporte en runtimes estándar.
- Opciones de despliegue: al usar `custom_code`, requiere `trust_remote_code=True` en Transformers; vLLM, llama.cpp, Ollama y TGI no están confirmados como compatibles en la información disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zils-lite-body-20 | 852.985.920 | no disponible | sin benchmarks publicados | Apache 2.0 | Hugging Face |
| VadymPikulyk/zils-lite-dh2 (cuerpo base) | no disponible | no disponible | sin benchmarks publicados | no disponible | Hugging Face |
| qhoenix/zils-lite-decision-avg-abc (cuerpo base) | no disponible | no disponible | sin benchmarks publicados | no disponible | Hugging Face |
| Qwen/Qwen3.5-0.8B (familia base) | ~0,8B | no disponible | no disponible en esta ficha | no disponible | Hugging Face |

La comparación con alternativas de la misma categoría (modelos de decisión de ~0,8B) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Modelo experimental de decisión: no es un modelo generativo generalista y su uso fuera de las tareas de clasificación para las que fue entrenado no está validado.
- Sin benchmarks públicos: no hay evidencia de rendimiento en tareas estándar, por lo que no debe adoptarse en producción sin una evaluación propia.
- Riesgo de alucinación: inherente a la familia Qwen3.5-0.8B subyacente; en tareas de decisión puede producir etiquetas erróneas con alta confianza.
- Sesgos: los datos etiquetados provienen en un 21,2% de respuestas escritas por sesiones de Claude del equipo y en un 57,5% de datasets públicos (GLUE/MNLI/QNLI, entre otros), lo que puede introducir sesgos de dominio y de estilo; no se documenta una auditoría de sesgos.
- Idiomas: no declarados; no se garantiza soporte multilingüe más allá del heredado del modelo base.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo incluye `custom_code` y depende de pesos derivados de Qwen3.5-0.8B, cuya licencia original debe verificarse por separado.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del autor; auditar antes de desplegar.
- Trazabilidad: los hashes de pesos y datasets están documentados, pero el modelo no incluye UID ni evaluación externa; su reproducibilidad depende de scripts y ficheros del autor no incluidos en el repo.
- Fecha de creación futura (2026-11-15) y cero descargas/likes: metadatos atípicos que sugieren un artefacto de investigación o de prueba, no un modelo consolidado.

## Enlaces

- Hugging Face: https://huggingface.co/tensor-tailor/zils-lite-body-20
- Modelo base 1: https://huggingface.co/VadymPikulyk/zils-lite-dh2
- Modelo base 2: https://huggingface.co/qhoenix/zils-lite-decision-avg-abc
- Familia base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- No se han encontrado papers, blogs, repositorios o demos adicionales en la información disponible.
