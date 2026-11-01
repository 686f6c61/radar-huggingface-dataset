# Taficritus/hela-lm-v2-sinhala-adapter

## Resumen

HelaLM-4B SinhalaMMLU Adapter (v4 CoT) es un adaptador LoRA desarrollado por el usuario Taficritus para el modelo base Jainamshahhh/helalm-4b, una variante ajustada al cingalés de Gemma 3 de 4B parámetros. El adaptador está entrenado específicamente para la tarea compartida SinhalaMMLU del congreso ICTer 2026, orientada a la resolución de preguntas de opción múltiple en cingalés con razonamiento explícito paso a paso (chain-of-thought).

El adaptador añade aproximadamente 24M de parámetros sobre un modelo lógico total de unos 4.020M, quedando holgadamente por debajo del límite de 8B impuesto por la competición. Su función es mejorar la capacidad del modelo base para responder preguntas académicas de nivel escolar (grados 6 a 13) en cingalés, generando primero una justificación razonada y después la respuesta en el formato `පිළිතුර: X`.

Es relevante por su enfoque en un idioma de bajos recursos como el cingalés, por el uso declarado de datos sintéticos generados a partir de libros de texto del sistema educativo de Sri Lanka y por su formato de entrenamiento Alpaca con CoT explícito, que lo diferencia de un ajuste convencional sobre la plantilla nativa de Gemma.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3), con adaptador LoRA |
| Parámetros totales | ~4.020M (modelo lógico base + adaptador de ~24M) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (la model card sugiere carga en 4-bit vía `load_in_4bit` y `float16`) |
| Idiomas soportados | Cingalés (si) |
| Licencia | gemma |
| Formato de pesos | safetensors (adaptador LoRA; requiere el modelo base por separado) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Jainamshahhh/helalm-4b, descrito por el autor como un modelo Gemma-3-4B ajustado para cingalés. La arquitectura subyacente es, por tanto, un transformer decoder-only de la familia Gemma 3, sobre el que se entrena un adaptador LoRA de aproximadamente 24M de parámetros. El repositorio ocupa 0,1 GB, coherente con el tamaño de un adaptador y no con el de un modelo completo.

El entrenamiento se realizó sobre un conjunto propio de aproximadamente 13.500 preguntas de opción múltiple en cingalés. Según la model card, los datos sintéticos se generaron mediante APIs cerradas (DeepSeek y Claude) a partir de libros de texto de escuelas públicas de Sri Lanka de los grados 6 a 13, y se complementaron con el conjunto de desarrollo oficial de SinhalaMMLU de nivel fácil. La versión v4 del dataset incorpora explicaciones explícitas de chain-of-thought y emplea el formato de instrucción Alpaca en lugar de la plantilla de chat nativa de Gemma. El modelo aprende a producir razonamiento paso a paso en cingalés antes de emitir el token de respuesta final con el formato `පිළිතුර: X`. No se detallan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO.

## Capacidades

- Respuesta a preguntas de opción múltiple en cingalés sobre contenidos académicos de grados 6 a 13.
- Generación de razonamiento chain-of-thought explícito en cingalés antes de la respuesta final.
- Emisión de la respuesta en un formato controlado y parseable (`පිළිතුර: X`), adecuado para evaluación automática.
- Comprensión de instrucciones en formato Alpaca (no en la plantilla de chat nativa de Gemma).
- Cobertura de materias escolares del currículo de Sri Lanka según los libros de texto empleados para generar los datos.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso más allá del CoT de una pregunta: no disponible.
- Capacidades de visión o audio: no disponible.
- Capacidades multilingües: limitadas al cingalés según los metadatos del modelo.

## Casos de uso

- Evaluación en la tarea compartida SinhalaMMLU: el adaptador está diseñado para producir respuestas en el formato exacto que espera el evaluador (`පිළිතුර: X`), lo que permite integrarlo directamente en el pipeline de envío de resultados de ICTer 2026.
- Investigación en modelos para idiomas de bajos recursos: sirve como punto de partida para estudiar el efecto del CoT explícito en cingalés sobre un modelo Gemma 3 de 4B, comparando con el modelo base sin adaptador.
- Generación de material educativo en cingalés: puede emplearse para producir preguntas de práctica con justificación razonada a partir de contenidos de los grados 6 a 13, siempre con revisión humana dada la naturaleza sintética de los datos de entrenamiento.
- Sistemas de tutoría académica en cingalés: el formato de razonamiento paso a paso permite mostrar al estudiante no solo la respuesta correcta sino el desarrollo del razonamiento, útil en interfaces de aprendizaje.
- Prototipado de asistentes de evaluación formativa: integrado con `transformers` y `peft`, permite construir rápidamente un servicio de corrección o generación de preguntas de opción múltiple para dominios curriculares concretos.
- Estudio de adaptadores LoRA sobre Gemma 3: con solo ~24M de parámetros y 0,1 GB de repositorio, es un caso práctico para analizar el coste y el rendimiento de un ajuste LoRA especializado en una única tarea e idioma.
- Base para futuros ajustes en cingalés: el adaptador puede servir como inicialización para tareas relacionadas (comprensión lectora, clasificación de materias) dentro del mismo dominio educativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; la model card recomienda cargar el modelo base en 4-bit con `load_in_4bit=True` y `torch_dtype=torch.float16`, lo que reduce el requisito frente a una carga en precisión completa de un modelo de ~4B parámetros.
- GPU recomendadas: no disponible en la información proporcionada.
- Viabilidad en GPU de consumo: no confirmada en la información disponible; el uso de cuantización 4-bit sugerido por el autor apunta a que el modelo base de 4B puede desplegarse en GPUs de consumo con suficiente VRAM, pero no se especifican modelos concretos.
- Opciones de despliegue: la model card documenta el uso con `transformers` y `peft` (`AutoModelForCausalLM`, `PeftModel.from_pretrained`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Taficritus/hela-lm-v2-sinhala-adapter | ~4.020M (base + LoRA de ~24M) | no disponible | Cingalés | gemma | HuggingFace (adaptador) |
| Jainamshahhh/helalm-4b (modelo base) | ~4B | no disponible | Cingalés | no disponible | HuggingFace |
| Gemma 3 4B (modelo original) | ~4B | no disponible | Multilingüe | gemma | HuggingFace |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- El adaptador está entrenado exclusivamente para preguntas de opción múltiple en cingalés; su rendimiento fuera de ese formato o idioma no está documentado.
- Requiere el formato de instrucción Alpaca en inferencia; usar la plantilla de chat nativa de Gemma puede degradar los resultados, según advierte el propio autor.
- Parte de los datos de entrenamiento son sintéticos, generados con APIs cerradas (DeepSeek y Claude) a partir de libros de texto; esto puede introducir errores, sesgos o artefactos de los modelos generadores.
- Riesgo de alucinación en el razonamiento chain-of-thought: el modelo puede producir justificaciones plausibles pero incorrectas, especialmente en materias fuera de la distribución de los libros de texto empleados.
- No se han publicado métricas de evaluación en la información disponible, por lo que no es posible cuantificar su calidad frente al modelo base.
- La licencia es "gemma", sujeta a los términos de uso de Gemma; es necesario revisar las restricciones de uso comercial de dicha licencia antes de desplegarlo en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- No se especifican la longitud de contexto, los tipos de cuantización soportados ni los requisitos de hardware, lo que dificulta planificar un despliegue en producción.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/Taficritus/hela-lm-v2-sinhala-adapter
- Modelo base: https://huggingface.co/Jainamshahhh/helalm-4b
- Paper de SinhalaMMLU (EMNLP 2025): https://aclanthology.org/2025.emnlp-main.1673/
