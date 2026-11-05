# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_embed-epoch03

## Resumen

El modelo `unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_embed-epoch03` es un checkpoint de investigación derivado de Phi-1.5, un transformer decoder-only de 1.418 millones de parámetros (1,42 B) desarrollado originalmente por Microsoft Research. En concreto, parte de `locuslab/tofu_ft_phi-1.5`, un ajuste fino de Phi-1.5 sobre el conjunto de datos TOFU (Task of Fictitious Unlearning), y aplica una intervención de desaprendizaje (unlearning) orientada al subconjunto «forget10» durante la época 3 de un total de 20. El autor es `unl-reset`, un espacio de nombres de Hugging Face sin tracción pública (0 descargas, 0 likes en el momento de la consulta).

El problema que aborda es el desaprendizaje selectivo: eliminar del modelo la influencia de un subconjunto concreto de datos de ajuste fino sin reentrenar desde cero y preservando el rendimiento en el conjunto «retain». La técnica empleada combina dos mecanismos: por un lado, la inicialización de los embeddings de entrada y de la cabeza LM desde el Phi-1.5 original de Microsoft (reset de esos módulos), y por otro, una pérdida de entrenamiento compuesta por «Token IHL» sobre el conjunto forget más una entropía cruzada (CE) ponderada con factor 1,0 sobre el conjunto retain. El resto de pesos del transformer se conservan del checkpoint base ajustado.

Es relevante ahora porque TOFU se ha consolidado como uno de los benchmarks de referencia en machine unlearning para LLM, y los checkpoints intermedios de este tipo permiten reproducir y auditar metodologías de borrado de conocimiento. No obstante, se trata de un artefacto de investigación, no de un modelo listo para producción: no hay pipeline declarado, no hay resultados de benchmarks publicados y la model card es mínima.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-1.5), con código personalizado (`custom_code`) |
| Parámetros totales | 1.418.270.720 (1,42 B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (Phi-1.5 original: 2.048 tokens) |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; cuantización no especificada por el autor) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 2,8 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Phi-1.5: un transformer decoder-only denso de aproximadamente 1,3 B de parámetros con atención multi-cabeza estándar, entrenado originalmente por Microsoft sobre datos de texto y código sintéticos y filtrados. Este checkpoint no modifica la topología, sino que aplica un procedimiento de desaprendizaje sobre el ajuste fino de TOFU.

El entrenamiento sigue un esquema híbrido documentado en la model card: los embeddings de entrada y la cabeza de lenguaje se reinicializan desde `microsoft/phi-1_5`, mientras que el resto de pesos del transformer se mantienen congelados o heredados de `locuslab/tofu_ft_phi-1.5`. La función de pérdida combina una «Token IHL» (probablemente una variante de pérdida de desaprendizaje tipo *inverted hinge loss* o similar, aunque la abreviatura no se expande en la información disponible) aplicada al conjunto forget10, más una entropía cruzada con coeficiente 1,0 sobre el conjunto retain. El checkpoint corresponde a la época 3 de 20. Se incluye un archivo `ihl_manifest.json` con metadatos del procedimiento, pero su contenido no está disponible en la información proporcionada.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset TOFU utilizado, ni si hubo fases de RLHF o DPO.

## Capacidades

- Generación de texto autoregresiva en inglés, heredada de Phi-1.5.
- Razonamiento básico y respuesta a preguntas de dominio general, condicionado por el tamaño de 1,42 B del modelo.
- Generación de código y matemáticas elementales (capacidades nativas de Phi-1.5), aunque potencialmente degradadas tras el procedimiento de desaprendizaje.
- Capacidad de «olvidar» selectivamente el subconjunto forget10 de TOFU, que es el objetivo declarado del checkpoint.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explícito.
- Multilingüismo limitado: solo inglés declarado.
- No se documentan modos especiales (thinking, visión, audio).

## Casos de uso

- Investigación en machine unlearning: sirve como checkpoint de referencia para comparar metodologías de borrado de conocimiento sobre TOFU, permitiendo reproducir la época 3 de un pipeline concreto y medir la degradación en el conjunto retain.
- Auditoría de privacidad: evaluar hasta qué punto el reset de embeddings y la pérdida IHL eliminan la memorización de datos del subconjunto forget10, mediante ataques de extracción o *membership inference*.
- Estudio de la interacción entre reinicialización de módulos y retención de conocimiento: al resetear embeddings y LM head pero conservar el resto del transformer, el checkpoint permite aislar el efecto de cada componente en experimentos controlados.
- Baseline en publicaciones académicas: como punto de comparación frente a métodos como gradient ascent, NPO o RMU sobre el mismo modelo base Phi-1.5.
- Docencia y formación: ejemplo práctico de un pipeline de desaprendizaje con pérdida compuesta (IHL + CE) y checkpoints intermedios por época.
- Validación de infraestructura de evaluación: al ser un modelo pequeño (2,8 GB en safetensors), permite montar harnesses de evaluación de unlearning en hardware modesto antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni de las métricas específicas de TOFU (model utility, forget quality, retain accuracy). Tampoco se proporcionan comparaciones numéricas con el checkpoint base `locuslab/tofu_ft_phi-1.5` ni con el Phi-1.5 original.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 2,8-3,0 GB solo para pesos, más overhead de activaciones y KV cache (estimación típica de 4-6 GB en total para contextos moderados).
- VRAM estimada en cuantización de 8 bits: en torno a 1,5-2 GB; en 4 bits, en torno a 1-1,5 GB (estimaciones basadas en el recuento de parámetros, no confirmadas por el autor).
- GPU recomendadas: cualquier GPU consumer con al menos 6-8 GB de VRAM (RTX 3060, RTX 4060, RTX 4070) es suficiente en fp16; A100 o H100 no son necesarias para inferencia, aunque pueden usarse para evaluación por lotes a gran escala.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPU modernas con 8 GB o más.
- Opciones de despliegue: al requerir `custom_code`, es necesario cargar con `trust_remote_code=True` en `transformers`. La compatibilidad con vLLM, llama.cpp, Ollama o TGI no está verificada en la información disponible y puede requerir conversión manual de los pesos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (`unl-reset/tofu-phi-1_5-...-epoch03`) | 1,42 B | no disponible | Desaprendizaje TOFU forget10 (época 3) | apache-2.0 | Hugging Face, 0 descargas |
| `locuslab/tofu_ft_phi-1.5` (base) | ~1,42 B | no disponible | Ajuste fino sobre TOFU sin desaprendizaje | no disponible en la información | Hugging Face |
| `microsoft/phi-1_5` (original) | ~1,3 B | 2.048 tokens | Modelo base de texto y código | MIT (según el modelo original) | Hugging Face, ampliamente usado |
| Phi-2 (Microsoft) | 2,7 B | 2.048 tokens | Modelo base de texto y código | MIT | Hugging Face |

La comparación relevante es frente al checkpoint base de TOFU y al Phi-1.5 original: el interés no está en el rendimiento absoluto, sino en la diferencia de comportamiento en los conjuntos forget y retain, que no se documenta numéricamente en la información disponible.

## Limitaciones y advertencias

- Artefacto de investigación sin validación pública: 0 descargas y 0 likes; no hay evidencia de que el procedimiento de desaprendizaje funcione según lo declarado.
- Ausencia total de benchmarks: no se puede verificar la calidad del olvido ni la retención de capacidades en el conjunto retain.
- Riesgo de alucinación inherente a un modelo de 1,42 B, agravado potencialmente por el reset de embeddings y la cabeza LM, que puede degradar la coherencia general.
- Sesgos: no documentados por el autor; Phi-1.5 se entrenó principalmente con datos sintéticos y filtrados, con sesgos propios de ese corpus.
- Limitación de idioma: solo inglés declarado; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Restricciones de licencia: apache-2.0 permite uso comercial, pero el modelo base Phi-1.5 tiene su propia licencia (MIT según el modelo original) y el checkpoint de TOFU puede arrastrar condiciones adicionales no especificadas en la información disponible.
- Requiere `trust_remote_code=True` por el uso de `custom_code`, lo que implica ejecutar código del autor del repositorio; conviene auditar los archivos antes de cargarlo.
- No apto para producción: sin pipeline declarado, sin garantías de estabilidad y con un propósito exclusivamente académico.
- El checkpoint corresponde a la época 3 de 20; no representa el resultado final del procedimiento de desaprendizaje.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_embed-epoch03
- Modelo base del ajuste fino: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original Phi-1.5: https://huggingface.co/microsoft/phi-1_5
- Repositorio TOFU (referencia del benchmark, no enlazado en la información proporcionada): no disponible
- Paper de TOFU: no disponible en la información proporcionada
- Archivo `ihl_manifest.json` (mencionado en la model card): incluido en el repositorio del modelo
