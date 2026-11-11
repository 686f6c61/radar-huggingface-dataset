# weathon/bisexual_grpo

## Resumen

`weathon/bisexual_grpo` es un ajuste fino del modelo base Qwen/Qwen3.5-9B, publicado por el usuario weathon en Hugging Face. Se ha entrenado mediante GRPO (Group Relative Policy Optimization), la técnica de aprendizaje por refuerzo introducida en DeepSeekMath, utilizando la librería TRL de Hugging Face. El modelo se distribuye en formato safetensors y es compatible con la librería transformers y con endpoints compatibles.

El modelo hereda la arquitectura y el tamaño del Qwen3.5-9B original (aproximadamente 9 mil millones de parámetros), si bien la model card no detalla especificaciones técnicas propias. El repositorio tiene un tamaño de 0,4 GB, lo que sugiere que podría contener únicamente los adaptadores o pesos parciales del ajuste, no el modelo completo en precisión completa.

La relevancia de esta ficha es limitada: se trata de un experimento de ajuste con GRPO sobre un modelo base reciente, sin documentación técnica sustancial, sin licencia declarada y sin resultados de benchmarks publicados. Resulta útil como referencia de un pipeline de RL aplicado a Qwen3.5-9B con TRL, pero no como modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen/Qwen3.5-9B; no detallada en la model card) |
| Parametros totales | aproximadamente 9 mil millones (heredados del modelo base Qwen3.5-9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica "licence: license" sin especificar) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B, un transformer de aproximadamente 9 mil millones de parámetros. Sobre esa base se ha aplicado un ajuste fino con GRPO, un algoritmo de optimización de política relativa a grupos que prescinde del modelo crítico (critic) y estima la ventaja normalizando recompensas dentro de un grupo de respuestas muestreadas para la misma consulta. La implementación se ha realizado con TRL 1.17.1, Transformers 5.22.1, PyTorch 2.10.0 y Datasets 5.1.0.

La model card no especifica el conjunto de datos de entrenamiento, el número de tokens, la composición del dataset de preferencias ni la función de recompensa utilizada. Tampoco se documentan innovaciones técnicas adicionales más allá del propio uso de GRPO. El run de entrenamiento está registrado en Weights & Biases bajo el proyecto `3dsmile` en la instancia de CoreWeave, pero no se aportan métricas en la documentación pública.

## Capacidades

- Generación de texto conversacional multi-turno, tal como muestra el ejemplo de uso con `pipeline("text-generation")`.
- Razonamiento y respuesta a preguntas abiertas, incluyendo preguntas hipotéticas o de reflexión.
- Ajuste orientado a preferencias mediante GRPO, lo que en principio alinea las respuestas con la función de recompensa definida durante el entrenamiento (no documentada).
- Capacidades heredadas del modelo base Qwen3.5-9B: no se detallan en la model card y deben consultarse en la documentación del modelo original.
- Soporte de tool calling, agentes o modo thinking: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible.

## Casos de uso

- Experimentación con GRPO: el modelo sirve como referencia práctica para reproducir un pipeline de RL con TRL sobre un modelo de 9B, útil para investigadores que quieran estudiar la implementación de Group Relative Policy Optimization.
- Evaluación de alineación por preferencias: permite comparar el comportamiento del modelo base frente al ajustado para analizar el efecto del entrenamiento con recompensas, siempre que se conozca la función de recompensa empleada.
- Generación de texto conversacional en prototipos: el snippet de la model card muestra su uso con `transformers.pipeline` para respuestas de hasta 128 tokens nuevos, adecuado para demos y pruebas de concepto.
- Investigación sobre sesgos y contenido: dado el nombre del repositorio y la temática de la pregunta de ejemplo, puede emplearse en estudios sobre cómo el ajuste con RL afecta a respuestas en dominios sensibles.
- Base para nuevos ajustes: al ser un checkpoint derivado de Qwen3.5-9B, puede servir como punto de partida para otros fine-tunings, aunque la licencia no declarada introduce incertidumbre legal.
- Docencia y formación: útil como ejemplo didáctico de un run de TRL con GRPO y registro en Weights & Biases, para ilustrar el flujo completo de entrenamiento y trazabilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la model card. Como referencia orientativa para un transformer de aproximadamente 9B parámetros, en fp16 se requerirían del orden de 18 GB de VRAM solo para los pesos, más memoria para el contexto y el estado de inferencia; en cuantización de 8 bits, alrededor de 9-10 GB, y en 4 bits, alrededor de 5-6 GB. Estas cifras son estimaciones generales, no datos publicados para este modelo.
- GPU recomendadas: no disponible. Por tamaño, un modelo de 9B en fp16 encajaría en A100 40/80 GB, H100 y RTX 4090 (24 GB) con margen ajustado; en cuantización de 8 o 4 bits podría ejecutarse en GPUs consumer de 8-16 GB.
- Cabe en GPU consumer: probablemente sí en cuantización de 4-8 bits (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090), aunque no hay confirmación oficial.
- Opciones de despliegue: transformers (confirmado por la model card); vLLM, llama.cpp, Ollama o TGI no están confirmados para este checkpoint y dependerían de que los pesos sean compatibles con el modelo base.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| weathon/bisexual_grpo | aproximadamente 9B (heredados) | no disponible | GRPO con TRL sobre Qwen3.5-9B | no disponible | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-9B (modelo base) | aproximadamente 9B | no disponible en esta ficha | preentrenamiento + ajuste del autor original | según Qwen (consultar) | Hugging Face |
| DeepSeekMath (referencia de GRPO) | no disponible en esta ficha | no disponible | preentrenamiento + GRPO | según DeepSeek (consultar) | Hugging Face / paper |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Ausencia de licencia declarada: la model card indica "licence: license" sin concretar términos, lo que impide determinar si el uso comercial está permitido. No debe desplegarse en producción sin aclarar la licencia con el autor y con el modelo base.
- Sin documentación de datos de entrenamiento: se desconoce el dataset, la función de recompensa y el volumen de entrenamiento, lo que impide evaluar sesgos introducidos por el ajuste.
- Riesgo de alucinación: inherente a los modelos de lenguaje de esta escala; no hay evaluaciones publicadas que lo cuantifiquen.
- Sesgos conocidos: no documentados; el nombre del repositorio y la temática de la pregunta de ejemplo sugieren un ajuste orientado a un dominio concreto, pero no se aporta información sobre el comportamiento resultante.
- Contexto e idiomas: no se especifican la longitud de contexto ni los idiomas soportados más allá de los heredados del modelo base.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el mismo día (11 de noviembre de 2026), lo que indica un artefacto experimental sin validación comunitaria.
- Tamaño del repositorio (0,4 GB) inferior al esperado para un modelo de 9B en fp16 (aproximadamente 18 GB), lo que sugiere pesos parciales, adaptadores o una cuantización no documentada; conviene verificar la integridad antes de usarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/weathon/bisexual_grpo
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Paper de GRPO (DeepSeekMath): https://huggingface.co/papers/2402.03300
- Repositorio TRL: https://github.com/huggingface/trl
- Run de entrenamiento en Weights & Biases: https://forge.coreweave.com/wandb/3dsmile/new/runs/dji2xrs3
