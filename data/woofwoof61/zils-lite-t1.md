# woofwoof61/zils-lite-t1

## Resumen

zils-lite-t1 es un ajuste fino mediante LoRA (rango 64, fusionado) del modelo Qwen/Qwen3.5-0.8B, publicado por el usuario woofwoof61. Forma parte de lo que el autor denomina "Zils subnet 127 lite pool" y se presenta como un "cuerpo d3-lite soup": el punto de partida no es el modelo base directamente, sino una media uniforme de dos ajustes previos (`joamCriff123/zils-lite-l1125a` y `joamCriff123/zils-lite-l1123q`), sobre la que se promediaron dos ejecuciones de entrenamiento con semillas distintas.

El modelo está orientado a la toma de decisiones ("decision-model"): se entrenó con decisiones etiquetadas derivadas de los splits oficiales de entrenamiento de conjuntos de datos públicos, cubriendo tareas como verificación de afirmaciones, comprobación de respuestas fundamentadas (grounded-answer checking), postura (stance), preguntas causales, inferencia sobre contratos y ensayos clínicos, y relevancia de producto.

Con 852.985.920 parámetros (aproximadamente 0,85 mil millones) y un repositorio de 1,7 GB en formato safetensors, es un modelo pequeño pensado para despliegues ligeros y tareas de clasificación o decisión estructurada. La licencia es Apache-2.0. No se han publicado datos de benchmarks ni información sobre idiomas soportados en la documentación disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3.5-0.8B); no se detalla configuracion especifica |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen/Qwen3.5-0.8B, un transformer de aproximadamente 0,85 mil millones de parámetros. El ajuste se realizó con LoRA de rango 64 y posteriormente se fusionó en los pesos base. El punto de partida fue una "soup" (media de pesos) de dos modelos previos del mismo ecosistema (`joamCriff123/zils-lite-l1125a` y `joamCriff123/zils-lite-l1123q`, ambos promediados de forma uniforme), sobre la que se ejecutaron dos entrenamientos con semillas diferentes y cuyos resultados también se promediaron.

Los datos de entrenamiento consisten en decisiones etiquetadas generadas a partir de los splits oficiales de entrenamiento de conjuntos de datos públicos: verificación de afirmaciones, comprobación de respuestas fundamentadas, postura, preguntas causales, inferencia sobre contratos y ensayos clínicos, y relevancia de producto. El autor indica explícitamente que no se usaron filas de test de benchmarks. No se especifica el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Toma de decisiones etiquetadas: clasificación o resolución de tareas estructuradas en dominios como verificación de afirmaciones, postura y relevancia de producto.
- Comprobación de respuestas fundamentadas (grounded-answer checking): evaluación de si una respuesta está respaldada por el contexto proporcionado.
- Razonamiento causal: respuesta a preguntas de tipo causal dentro del marco de decisión entrenado.
- Inferencia sobre contratos y ensayos clínicos: extracción de decisiones o conclusiones a partir de texto legal y clínico.
- Generación de texto base: heredada del modelo Qwen3.5-0.8B subyacente (no documentada de forma específica en la model card).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (thinking mode, vision, audio): no disponible en la información proporcionada.

## Casos de uso

- Verificación de afirmaciones en pipelines de moderación o fact-checking: el modelo se entrenó con datos de claim verification, por lo que puede clasificar si una afirmación está respaldada o no por evidencia, integrándose como etapa de decisión en un sistema mayor.
- Comprobación de respuestas fundamentadas en sistemas RAG: dado un contexto recuperado y una respuesta generada, el modelo puede evaluar si la respuesta se sostiene sobre el contexto, útil como filtro de calidad antes de devolver resultados al usuario.
- Análisis de postura en redes sociales o encuestas: clasificación de la postura de un texto respecto a un tema, aprovechando el entrenamiento específico en stance.
- Respuesta a preguntas causales en asistentes analíticos: resolución de consultas de tipo "¿por qué?" o "¿qué causó?" en dominios acotados, con el modelo actuando como componente de decisión.
- Revisión de contratos: inferencia de decisiones sobre cláusulas o condiciones contractuales, como paso previo a la revisión humana en flujos legales.
- Apoyo a la inferencia en ensayos clínicos: extracción de decisiones estructuradas a partir de descripciones de estudios, útil en tareas de cribado o clasificación documental.
- Clasificación de relevancia de producto: ordenación o filtrado de productos respecto a una consulta o necesidad del usuario en motores de búsqueda o recomendación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 852.985.920 parámetros, en precisión completa (fp32) serían aproximadamente 3,4 GB; en fp16/bf16, unos 1,7 GB; en cuantización de 8 bits, alrededor de 0,9 GB; en 4 bits, aproximadamente 0,5 GB. Estas cifras son estimaciones a partir del número de parámetros, no datos publicados por el autor.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM para fp16; una RTX 3060, RTX 4060 o superior es suficiente. Para fp32 se recomienda al menos 6 GB.
- Cabe en GPU de consumo: sí, en la mayoría de GPU consumer modernas (RTX 3060 en adelante) e incluso en GPUs integradas con suficiente memoria compartida en cuantización de 4 bits.
- Opciones de despliegue: transformers (librería indicada en la model card); otras opciones como vLLM, llama.cpp, Ollama o TGI no están documentadas para este modelo, aunque al ser safetensors compatible con transformers podría convertirse a GGUF.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| zils-lite-t1 | 852.985.920 | no disponible | Apache-2.0 | Hugging Face (woofwoof61/zils-lite-t1) |
| Qwen/Qwen3.5-0.8B (base) | ~0,8 mil millones | no disponible | no disponible en esta ficha | Hugging Face |
| joamCriff123/zils-lite-l1125a | no disponible | no disponible | no disponible | Hugging Face |
| joamCriff123/zils-lite-l1123q | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo (benchmarks) para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al entrenarse sobre conjuntos de datos públicos de dominios específicos (legal, clínico, verificación), puede heredar sesgos de esas fuentes.
- Riesgo de alucinación: presente como en cualquier modelo de lenguaje; en tareas de decisión estructurada el riesgo se manifiesta como clasificaciones incorrectas o justificaciones no fundamentadas.
- Limitaciones de contexto o idioma: no se especifica la longitud de contexto ni los idiomas soportados; la model card no ofrece información al respecto.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero se debe consultar el archivo NOTICE para las atribuciones de los modelos upstream (Qwen y los ajustes previos de joamCriff123).
- Caveat para producción: el modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria; no se han publicado benchmarks ni evaluaciones independientes. El autor advierte que no se usaron filas de test de benchmarks en el entrenamiento, pero no aporta métricas de rendimiento.
- Al ser un ajuste de decisión sobre un modelo base pequeño, su rendimiento en generación abierta de texto puede ser limitado en comparación con modelos mayores; su uso previsto es la clasificación o decisión estructurada, no la conversación general.

## Enlaces

- Hugging Face: https://huggingface.co/woofwoof61/zils-lite-t1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Modelo previo 1: https://huggingface.co/joamCriff123/zils-lite-l1125a
- Modelo previo 2: https://huggingface.co/joamCriff123/zils-lite-l1123q
