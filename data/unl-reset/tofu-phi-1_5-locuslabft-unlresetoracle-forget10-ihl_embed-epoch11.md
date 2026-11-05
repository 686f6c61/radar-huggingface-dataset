# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_embed-epoch11

## Resumen

El modelo `unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_embed-epoch11` es un checkpoint de investigación derivado de Phi-1.5, publicado por el grupo `unl-reset` en HuggingFace. No se trata de un modelo de propósito general, sino de un artefacto experimental dentro del marco TOFU (Task of Fictitious Unlearning), un benchmark académico diseñado para medir la capacidad de un modelo de "olvidar" información concreta sin degradar el resto de su conocimiento. El modelo parte de `locuslab/tofu_ft_phi-1.5`, un Phi-1.5 ajustado sobre el dataset TOFU, y aplica una técnica de desaprendizaje (unlearning) sobre el subconjunto `forget10`.

La arquitectura subyacente es la de Phi-1.5 de Microsoft: un transformer denso de aproximadamente 1.400 millones de parámetros, entrenado originalmente para generación de código y texto con un contexto de 2.048 tokens. Este checkpoint concreto conserva los pesos del transformer del modelo base ajustado, pero reinicializa los embeddings de entrada y la cabeza de lenguaje (LM head) a partir de `microsoft/phi-1_5`, según indica la model card. Es un detalle técnico relevante: no es un fine-tune convencional, sino una intervención quirúrgica sobre componentes específicos del modelo.

El modelo es relevante únicamente en el contexto de la investigación sobre machine unlearning, privacidad y control de datos en modelos de lenguaje. Su publicación corresponde a la época 11 de 20 de un procedimiento de entrenamiento que combina una pérdida de "token IHL" sobre el conjunto a olvidar con una pérdida de entropía cruzada (CE) ponderada por 1.0 sobre el conjunto a retener. Con 0 descargas y 0 likes en el momento de la consulta, se trata de un artefacto de reproducibilidad científica, no de un modelo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (Phi-1.5) |
| Parámetros totales | 1.418.270.720 |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la información proporcionada (Phi-1.5 original: 2.048 tokens) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con `custom_code`) |

## Arquitectura y entrenamiento

La arquitectura es la de Phi-1.5: un transformer decoder-only denso de 1.400 millones de parámetros, con atención multi-cabeza estándar y sin mecanismos MoE ni SSM. El modelo base `locuslab/tofu_ft_phi-1.5` es un ajuste fino de Phi-1.5 sobre el dataset TOFU, que contiene pares pregunta-respuesta sobre autores ficticios diseñados para evaluar el desaprendizaje. Sobre ese punto de partida, este checkpoint aplica un procedimiento de entrenamiento que combina dos objetivos: una pérdida de "token IHL" (probablemente *influence-based* o *information-theoretic unlearning loss*, aunque la model card no lo desarrolla) sobre el conjunto `forget10`, y una pérdida de entropía cruzada estándar sobre el conjunto a retener, ponderada por un factor de 1.0.

La intervención clave documentada es la reinicialización de los embeddings de entrada y de la cabeza de lenguaje desde `microsoft/phi-1_5`, mientras que el resto de pesos del transformer se conservan del modelo ajustado. Este enfoque híbrido busca aislar el efecto del desaprendizaje en los componentes de entrada/salida sin perturbar las representaciones internas. El checkpoint corresponde a la época 11 de 20, lo que sugiere un entrenamiento planificado más largo que se detuvo o se publicó a mitad de camino. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas como RLHF o DPO.

## Capacidades

- Generación de texto en inglés, heredada de Phi-1.5, orientada a código y razonamiento básico.
- Respuesta a preguntas sobre el dataset TOFU (autores ficticios), aunque el objetivo del checkpoint es precisamente degradar esta capacidad sobre el subconjunto `forget10`.
- No se documenta soporte de tool calling ni function calling en la información disponible.
- No se documenta soporte de agentes ni razonamiento multi-paso explícito.
- Capacidad multilingüe limitada al inglés según la etiqueta de idioma.
- No se documentan modos especiales como thinking mode, visión o audio.

## Casos de uso

- Investigación en machine unlearning: el modelo sirve como punto de comparación para medir cuánto conocimiento del subconjunto `forget10` se ha eliminado frente al modelo base `locuslab/tofu_ft_phi-1.5`, usando las métricas estándar de TOFU (probabilidad de respuesta, ROUGE, verdad factual).
- Reproducibilidad de experimentos: al ser un checkpoint intermedio (época 11/20), permite replicar curvas de desaprendizaje y comparar la evolución de las métricas a lo largo del entrenamiento.
- Evaluación de técnicas de reinicialización: el enfoque de reinicializar embeddings y LM head desde `microsoft/phi-1_5` puede estudiarse como estrategia para mitigar la retención de información sensible en modelos ajustados.
- Auditoría de privacidad: útil para analizar si un modelo ajustado sobre datos ficticios retiene información identificable y en qué medida una intervención como esta la elimina.
- Docencia e investigación académica: adecuado para cursos o proyectos sobre ética de IA, privacidad diferencial y derecho al olvido en modelos de lenguaje.
- Línea base en pipelines de evaluación de unlearning: sirve como referencia negativa (modelo parcialmente desaprendido) frente a modelos completamente desentrenados o al modelo original sin intervención.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 2,8 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, entre 4 y 6 GB según longitud de contexto y batch.
- VRAM estimada en cuantización de 8 bits: alrededor de 1,5-2 GB; en 4 bits, alrededor de 1-1,5 GB (estimaciones basadas en el tamaño de parámetros, no en mediciones publicadas).
- GPU recomendadas: cualquier GPU consumer con al menos 6 GB de VRAM (RTX 3060, RTX 4060, RTX 2070) para fp16; A100, H100 o RTX 4090 para entrenamiento o evaluación a gran escala.
- Cabe en GPU consumer: sí, en la mayoría de tarjetas con 6 GB o más en fp16, y en tarjetas con 4 GB si se cuantiza.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (obligatorio por el tag `custom_code`); vLLM, llama.cpp u Ollama requerirían conversión a GGUF y posiblemente adaptaciones por el código personalizado.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este checkpoint (`tofu-phi-1_5-...-epoch11`) | 1.418 M | no disponible | Apache 2.0 | HuggingFace, 0 descargas | Checkpoint intermedio de unlearning, época 11/20 |
| `locuslab/tofu_ft_phi-1.5` (modelo base) | ~1.400 M | no disponible | no disponible en la información | HuggingFace | Phi-1.5 ajustado sobre TOFU, sin desaprendizaje |
| `microsoft/phi-1_5` (modelo original) | ~1.400 M | 2.048 tokens | MIT (según el modelo original) | HuggingFace | Modelo base de código y texto, sin ajuste TOFU |

No se dispone de datos de rendimiento comparativo (benchmarks TOFU) en la información proporcionada para establecer una comparación cuantitativa entre estos tres modelos.

## Limitaciones y advertencias

- Es un checkpoint de investigación, no un modelo para producción: no ha sido validado para uso comercial ni para tareas generales.
- El objetivo del entrenamiento es degradar deliberadamente el conocimiento sobre el subconjunto `forget10`, por lo que su rendimiento en esas preguntas será peor que el del modelo base por diseño.
- La reinicialización de embeddings y LM head puede introducir inconsistencias entre la representación interna del transformer y la capa de salida, con riesgo de degradación general del lenguaje.
- Solo soporta inglés según la etiqueta de idioma; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Riesgo de alucinación: como todo modelo de 1.400 M de parámetros, puede generar respuestas plausibles pero falsas, especialmente tras una intervención que altera la cabeza de lenguaje.
- Requiere `trust_remote_code=True` por el tag `custom_code`, lo que implica ejecutar código del autor; conviene auditar dicho código antes de usarlo.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base `locuslab/tofu_ft_phi-1.5` y el dataset TOFU pueden tener condiciones adicionales no reflejadas en esta ficha.
- No se documentan sesgos específicos, pero al derivar de Phi-1.5 hereda los sesgos del corpus de entrenamiento original de Microsoft.
- El estado de época 11/20 indica que el proceso de desaprendizaje no está completo; los resultados pueden ser intermedios y no representativos de un modelo totalmente desentrenado.

## Enlaces

- [HuggingFace: unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_embed-epoch11](https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_embed-epoch11)
- [Modelo base: locuslab/tofu_ft_phi-1.5](https://huggingface.co/locuslab/tofu_ft_phi-1.5)
- [Modelo original: microsoft/phi-1_5](https://huggingface.co/microsoft/phi-1_5)
- No se han encontrado en la información proporcionada enlaces a papers, blogs, repositorios o demos adicionales.
