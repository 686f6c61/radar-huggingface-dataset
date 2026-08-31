# ZiedBz/legal-fr-cassation-smoketest

## Resumen

El modelo `ZiedBz/legal-fr-cassation-smoketest` es un adaptador LoRA (Low-Rank Adaptation) entrenado mediante supervisión fina (SFT) sobre el modelo base `Qwen/Qwen3-4B-Instruct-2507`, un transformer decoder-only de 4 000 millones de parámetros orientado a instrucciones y conversación. El nombre del repositorio sugiere que se trata de una prueba preliminar ("smoketest") para evaluar la viabilidad de adaptar un modelo generalista al dominio jurídico francés, concretamente a la jurisprudencia de la Cour de cassation, el tribunal supremo francés.

El adaptador se distribuye en formato PEFT (librería `peft` 0.17.1) y ocupa aproximadamente 0,1 GB, lo que confirma que solo contiene los pesos del adaptador, no el modelo completo. La model card publicada está prácticamente vacía: no incluye información sobre el proceso de entrenamiento, los datos utilizados, las métricas de evaluación ni las instrucciones de uso. Esto lo convierte en un artefacto experimental, probablemente destinado a validar un pipeline de fine-tuning más que a ser usado en producción.

A pesar de la ausencia de documentación, el interés del modelo radica en su potencial aplicación al sector legal francés, donde la automatización de tareas como el análisis de sentencias o la asistencia a la redacción de escritos jurídicos es un área de creciente interés, como reflejan las iniciativas de la propia Cour de cassation en inteligencia artificial. No obstante, cualquier uso práctico requiere una validación rigurosa previa que hoy no está disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador) sobre Qwen3-4B-Instruct-2507 (transformer decoder-only) |
| Parametros totales | No disponible (el adaptador ocupa ~0,1 GB; el modelo base tiene 4B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base, no especificada) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Francés (inferido del nombre y dominio, no confirmado oficialmente) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se basa en la técnica LoRA, que congela los pesos del modelo base e introduce matrices de bajo rango en las capas de atención y feed-forward, reduciendo drásticamente el número de parámetros entrenables y los requisitos de memoria. El modelo base, `Qwen3-4B-Instruct-2507`, es un transformer causal con mecanismo de atención estándar, entrenado por Alibaba Cloud para seguir instrucciones y mantener conversaciones multi-turno. Aunque no se especifican los hiperparámetros del entrenamiento, el uso de `trl` (Transformers Reinforcement Learning) y la etiqueta `sft` indican que se aplicó fine-tuning supervisado clásico, probablemente con una función de pérdida de entropía cruzada sobre respuestas de referencia.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens, la composición de los datos (sentencias de la Cour de cassation, doctrina, etc.) ni sobre el uso de técnicas adicionales como RLHF o DPO. El nombre "smoketest" sugiere que el entrenamiento pudo realizarse con una muestra pequeña de datos para verificar el flujo de trabajo, no para producir un modelo de calidad. Tampoco se documentan innovaciones técnicas específicas más allá del uso estándar de LoRA y PEFT.

## Capacidades

No se han publicado capacidades específicas del adaptador. Dado que se trata de un fine-tuning sobre `Qwen3-4B-Instruct-2507`, en principio hereda las capacidades generales del modelo base, que incluyen:

- Generación de texto y respuesta a instrucciones en lenguaje natural.
- Razonamiento básico y resolución de problemas de lógica y matemáticas sencillas.
- Generación de código en múltiples lenguajes (Python, JavaScript, etc.).
- Conversación multi-turno con mantenimiento de contexto.
- Comprensión lectora y resumen de documentos extensos (dentro de la ventana de contexto del base).

Sin embargo, no hay ninguna evaluación publicada que confirme que el adaptador mantiene estas capacidades o que ha adquirido competencias específicas en derecho francés. El nombre del repositorio y la etiqueta `legal-fr-cassation` apuntan a un uso previsto en tareas de jurisprudencia, pero sin datos empíricos no se puede afirmar que el modelo las ejecute correctamente. Tampoco se indica si el adaptador soporta tool calling, function calling o modos de agente, aunque el modelo base sí los incorpora.

## Casos de uso

Dado el carácter experimental del modelo y la falta de documentación, los siguientes casos de uso son hipotéticos y requieren validación previa:

- Asistencia a la redacción de escritos jurídicos: el modelo podría generar borradores de conclusiones, recursos o memoriales a partir de hechos y argumentos proporcionados por el abogado, aprovechando la capacidad del base para seguir instrucciones estructuradas.
- Resumen de sentencias de la Cour de cassation: dado un texto de una decisión judicial, el modelo podría extraer los hechos, los motivos y el fallo, facilitando la revisión de jurisprudencia.
- Búsqueda semántica en bases de jurisprudencia: integrado en un sistema de recuperación, podría ayudar a identificar sentencias relevantes a partir de consultas en lenguaje natural.
- Clasificación de documentos legales: asignación de categorías o etiquetas a escritos procesales según su tipo, materia o resultado.
- Soporte a estudiantes de derecho: generación de explicaciones de conceptos jurídicos o análisis de casos hipotéticos para fines pedagógicos.
- Extracción de entidades legales: identificación de nombres de tribunales, fechas, artículos de código o partes procesales en textos jurídicos.

En todos los casos, el uso en producción sería prematuro sin una evaluación rigurosa sobre datos reales, dado el estado de "smoketest" del adaptador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen métricas de MMLU, HumanEval, GSM8K ni de tareas específicas del dominio legal francés (como clasificación de sentencias o extracción de información). Tampoco se comparan los resultados con el modelo base o con otros adaptadores jurídicos. La ausencia de evaluación impide cualquier afirmación sobre el rendimiento real del modelo.

## Requisitos de hardware

Al tratarse de un adaptador LoRA, los requisitos de hardware dependen del modelo base sobre el que se cargue. Para `Qwen3-4B-Instruct-2507`, las estimaciones aproximadas son:

- VRAM mínima para inferencia en FP16: unos 8-10 GB (el modelo base pesa ~8 GB en FP16, más overhead de atención y caché KV).
- Con cuantización de 4 bits (GPTQ/AWQ): alrededor de 4-5 GB de VRAM, ejecutable en GPUs consumer como RTX 3060 (12 GB), RTX 4060 (8 GB) o RTX 4070.
- Para entrenamiento del adaptador (LoRA): se requiere VRAM adicional para gradientes y optimizador; con QLoRA (cuantización + LoRA) bastan 8-12 GB.
- GPUs recomendadas: RTX 3090/4090 (24 GB) para trabajar cómodamente en FP16, o A100/H100 para despliegue servido a múltiples usuarios.
- Opciones de despliegue: el adaptador puede cargarse con `transformers` + `peft`, o exportarse a GGUF y ejecutarse con `llama.cpp` u Ollama. También es compatible con servidores de inferencia como vLLM o TGI, aunque requiere fusionar el adaptador con el base o usar soporte de LoRA en estos frameworks.
- Latencia y throughput: no disponibles. En una RTX 4090, un modelo de 4B en FP16 suele generar entre 50 y 100 tokens por segundo, pero no hay mediciones específicas para este adaptador.

## Comparativa con modelos similares

No se dispone de información sobre adaptadores LoRA comparables para el dominio legal francés. Existen modelos jurídicos generales en inglés (como LegalBERT o LexGPT), pero no son directamente comparables por tamaño, idioma ni técnica de adaptación. Tampoco hay datos de rendimiento de este adaptador frente al modelo base o a alternativas. Por tanto, no es posible ofrecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- El modelo es un "smoketest": su nombre indica que es una prueba preliminar, no un artefacto pulido. No debe usarse en entornos de producción sin una validación exhaustiva.
- No hay documentación sobre el dataset de entrenamiento, por lo que se desconoce si contiene sesgos, errores o una cobertura limitada del derecho francés. Es probable que los datos sean escasos y poco representativos.
- Riesgo elevado de alucinación en tareas legales: los modelos de lenguaje tienden a inventar citas, artículos o jurisprudencia inexistentes, lo que es especialmente peligroso en un dominio donde la precisión es crítica.
- No se ha evaluado el modelo en ninguna tarea estándar ni específica, por lo que su calidad es desconocida.
- La licencia no está especificada, lo que impide conocer las restricciones de uso comercial o de redistribución. El modelo base Qwen3-4B-Instruct-2507 tiene su propia licencia (Apache 2.0 o similar, según versión), pero el adaptador no declara la suya.
- El modelo está pensado para el francés jurídico, pero no se ha confirmado su competencia lingüística ni su capacidad para manejar jerga legal compleja.
- No hay instrucciones de uso ni ejemplos de código en la model card, lo que dificulta su integración incluso para desarrolladores experimentados.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/ZiedBz/legal-fr-cassation-smoketest
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Librería PEFT: https://github.com/huggingface/peft
- Librería TRL: https://github.com/huggingface/trl
- Artículo sobre el cálculo de emisiones de carbono (citado en la model card): https://arxiv.org/abs/1910.09700
