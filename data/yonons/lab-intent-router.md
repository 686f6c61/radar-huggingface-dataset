# yonons/lab-intent-router

## Resumen

`yonons/lab-intent-router` es un modelo publicado en Hugging Face por el usuario `yonons` cuyo propósito, según la model card, es la clasificación de intenciones en texto conversacional. El modelo parte de `whisper-tiny` como base y se ha afinado sobre un dataset denominado `chat-intents`, lo que sugiere un uso orientado a enrutar consultas de usuario hacia categorías de intención predefinidas en asistentes o sistemas de atención automatizada.

La información disponible es muy limitada: no se declaran licencia, idiomas soportados, pipeline de Hugging Face ni especificaciones de arquitectura más allá del modelo base. La model card documenta únicamente el proceso de entrenamiento (3 épocas, learning rate 2e-5, batch size 8) y una evaluación sobre un conjunto anotado manualmente con macro-F1 de 0.795 y recall de 0.778.

Por su naturaleza de modelo afinado sobre `whisper-tiny` para una tarea de clasificación, su relevancia práctica está acotada a prototipos de enrutamiento de intenciones. El propio autor indica que el uso previsto es asistir a revisores humanos, no tomar decisiones autónomas, y advierte de una caída de precisión en texto informal o con mezcla de idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (derivada de whisper-tiny); no se detalla la cabeza de clasificación |
| Parametros totales | No disponible (whisper-tiny tiene aproximadamente 39 millones de parámetros, dato no confirmado en la model card) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | No disponible |

## Arquitectura y entrenamiento

El modelo se obtiene por fine-tuning de `whisper-tiny`, un encoder-decoder transformer originalmente diseñado para reconocimiento de voz. La model card no especifica qué componentes del modelo base se conservan ni cómo se adapta la salida a la clasificación de intenciones, por lo que se desconoce si se emplea la torre del encoder, el decoder o una cabeza adicional.

El entrenamiento se realizó durante 3 épocas con learning rate 2e-5 y batch size 8 sobre el dataset `chat-intents`. No se documenta el número de tokens, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO. La evaluación reportada sobre datos anotados manualmente arroja un macro-F1 de 0.795 y un recall de 0.778. No hay información sobre la innovación técnica ni sobre el proceso de tokenización empleado para texto.

## Capacidades

- Clasificación de intenciones en texto conversacional, según el propósito declarado en la model card.
- Asistencia a revisores humanos en la toma de decisiones (uso previsto explícito).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles; la model card advierte de degradación con texto code-mixed.
- No se documentan capacidades de visión, audio ni modo de razonamiento explícito, pese a derivar de un modelo de audio.

## Casos de uso

- Enrutamiento de consultas en un asistente conversacional: el modelo clasificaría el mensaje del usuario en una categoría de intención para dirigirlo al flujo o departamento adecuado, con revisión humana de los casos dudosos.
- Triaje previo en atención al cliente: serviría como primera capa de clasificación de tickets antes de la asignación a agentes humanos, aprovechando el recall reportado de 0.778 para no perder casos relevantes.
- Etiquetado asistido en anotación de datos: dado su uso previsto de asistencia a revisores, podría preetiquetar conversaciones y reducir el esfuerzo de anotación manual.
- Prototipado rápido de clasificadores de intención: al partir de un modelo pequeño, permite iterar con recursos limitados en fases de prueba de concepto.
- Filtrado o segmentación de conversaciones en pipelines de análisis: clasificación de mensajes por intención para agregar métricas de uso en un producto conversacional.
- Módulo de clasificación en sistemas de moderación o derivación: como componente auxiliar que propone una categoría y deja la decisión final al humano, tal como indica la model card.

## Benchmarks y rendimiento

Resultados reportados en la model card sobre datos anotados manualmente (gold-annotated):

| Metrica | Valor |
|---|---|
| macro-F1 | 0.795 |
| recall | 0.778 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni comparaciones con modelos alternativos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la model card; por el tamaño del modelo base (whisper-tiny) cabría esperar un consumo muy reducido, pero no se confirma.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; presumiblemente sí por el tamaño del modelo base, sin dato oficial.
- Opciones de despliegue: no documentadas (no se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables ni datos que permitan establecer una comparación fiable con alternativas de clasificación de intenciones.

## Limitaciones y advertencias

- La precisión cae en texto informal o con mezcla de idiomas (code-mixed), según advierte el autor.
- El uso previsto es asistir a revisores humanos; no está pensado para decisiones autónomas sin supervisión.
- No se declara licencia, lo que impide determinar si el uso comercial está permitido.
- No se especifican los idiomas soportados, lo que limita su evaluación en despliegues multilingües.
- No se documenta el dataset de entrenamiento (`chat-intents`), por lo que no es posible evaluar sesgos ni cobertura de dominios.
- Riesgo de alucinación y de clasificaciones erróneas no cuantificado más allá de las métricas reportadas.
- El modelo tiene 0 descargas y 0 likes en Hugging Face, sin señales de validación por parte de la comunidad.
- No se especifica el formato de pesos ni el pipeline, lo que complica su integración directa en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yonons/lab-intent-router
- Modelo base whisper-tiny: no se proporciona enlace en la información disponible
- Paper, blog o repositorio adicional: no disponible
