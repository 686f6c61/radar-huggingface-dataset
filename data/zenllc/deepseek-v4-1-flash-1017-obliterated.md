# ZENLLC/DeepSeek-V4.1-Flash-1017-obliterated

## Resumen

DeepSeek-V4.1-Flash-1017-obliterated es una variante del modelo DeepSeek-V4.1-Flash-1017 (desarrollado por DeepSeek) a la que se le ha aplicado una ablación de la dirección de rechazo (refusal-direction ablation) mediante la herramienta OBLITERATUS con el método failspy. El resultado es un modelo que conserva las capacidades del original pero elimina en gran medida el comportamiento de negativa ante peticiones que el modelo base rechazaría. Lo publica el usuario ZENLLC en HuggingFace bajo licencia MIT.

Se trata de un modelo de arquitectura MoE (mixture of experts) con 754.638.836.864 parámetros totales según los pesos en safetensors, empaquetado en formato BF16 safetensors y pensado para text-generation con la librería transformers. El repositorio ocupa 1.509,4 GB, lo que refleja el tamaño del checkpoint completo. La relevancia de esta ficha radica en que documenta un caso de fine-tuning de "abliteración" sobre un modelo frontera, con métricas de rechazo, coherencia y capacidad publicadas por el autor, así como una evaluación MMLU comparativa frente al modelo base.

El modelo hereda la arquitectura y el conocimiento del DeepSeek-V4.1-Flash-1017, pero modifica su comportamiento de alineación: el autor reporta una tasa de rechazo del 4 % frente al 81,62 % de respuestas de rechazo completo del modelo original en su corpus de evaluación. Esta modificación tiene implicaciones importantes de seguridad que se detallan en la sección de limitaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts) transformer, etiqueta `deepseek_v41_text` en transformers |
| Parametros totales | 754.638.836.864 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16 safetensors) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (BF16) |
| Modelo base | deepseek-ai/DeepSeek-V4.1-Flash-1017 |
| Metodo de modificacion | Ablacion de direccion de rechazo (OBLITERATUS, metodo failspy) |
| Tamano del repositorio | 1.509,4 GB |
| Pipeline | text-generation |
| Libreria | transformers |

## Arquitectura y entrenamiento

El modelo es una modificación por ablación de pesos del DeepSeek-V4.1-Flash-1017, un modelo de arquitectura MoE según las etiquetas del repositorio (`moe`, `deepseek_v41_text`). No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset original ni las fases de RLHF/DPO del modelo base en la información proporcionada. La intervención aplicada no es un reentrenamiento: consiste en una ablación de la dirección de rechazo en el espacio de activaciones/pesos, ejecutada con la herramienta OBLITERATUS y el método failspy, que produce un checkpoint BF16 completo.

El autor documenta el proceso de selección de método mediante un torneo de intervenciones, con métricas de divergencia KL de 0,1305 nats (KL forward secuencia-token respecto al modelo original), coherencia del 100 % y capacidad del 100 % en 6 de 6 comprobaciones. La evaluación de rechazo se realizó sobre un corpus de 842 prompts, con anotaciones de modelos jueces (Claude Opus 4.6 y GPT-6.1 Sol, más tres anotaciones locales de Codex). No se especifican innovaciones adicionales de arquitectura más allá de las propias del modelo base.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo base DeepSeek-V4.1-Flash-1017.
- Razonamiento y respuesta a prompts de conocimiento general (evaluado en MMLU con 57 materias).
- Capacidad de seguir instrucciones sin activar el comportamiento de rechazo en la mayoría de casos (4 % de rechazo en el corpus del autor).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (thinking mode, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar empíricamente cómo la ablación de la dirección de rechazo afecta a las distribuciones de comportamiento (rechazo, asistencia dañina, tipo de respuesta) frente al modelo base, usando las tablas comparativas publicadas por el autor.
- Evaluación de robustez de filtros de seguridad: sirve como modelo "no alineado" de referencia para probar clasificadores de contenido y sistemas de moderación en pipelines de producción, comparando sus salidas con las del modelo original.
- Estudio de divergencia de comportamiento: con una KL de 0,1305 nats respecto al original, es útil para analizar qué fracción de la distribución de salida cambia tras una intervención de ablación y cómo se distribuye ese cambio entre temas.
- Generación de texto creativo sin restricciones de negativa: para tareas de escritura ficcional o escenarios donde el modelo base rechaza peticiones legítimas por exceso de cautela, el modelo puede responder con mayor frecuencia (86,52 % de respuestas responsivas frente al 16,59 % del original).
- Benchmarking de métodos de abliteración: permite comparar el método failspy de OBLITERATUS con otras técnicas de ablación sobre el mismo modelo base, usando las métricas de coherencia y capacidad como referencia.
- Docencia y divulgación técnica: ilustra de forma concreta el concepto de dirección de rechazo en modelos de lenguaje y las consecuencias medibles de eliminarla, con datos cuantitativos de un corpus de 842 prompts.

## Benchmarks y rendimiento

El autor publica resultados del torneo de intervención y de la evaluación de rechazo, así como una evaluación MMLU parcial en la información disponible.

| Metrica | Valor |
|---|---|
| Tasa de rechazo (corpus del autor) | 4 % |
| Divergencia KL (nats, forward secuencia-token) | 0,1305 |
| Coherencia | 100 % |
| Capacidad (comprobaciones superadas) | 6 de 6 (100 %) |

Comparativa de comportamiento sobre el corpus de 842 prompts (porcentajes sobre 838 respuestas completadas):

| Clasificacion | Modelo base | Modelo obliterado | Delta (pp) |
|---|---:|---:|---:|
| Rechazo completo | 81,62 % | 4,30 % | -77,33 |
| Rechazo parcial | 4,89 % | 14,44 % | +9,55 |
| Sin rechazo | 13,37 % | 78,28 % | +64,92 |
| Asistencia dañina | 10,38 % | 78,28 % | +67,90 |
| Respuesta responsiva a la peticion | 16,59 % | 86,52 % | +69,93 |
| Alternativa segura | 83,29 % | 10,50 % | -72,79 |
| Danio severo o generalizado (nivel 4) | 0,12 % | 9,31 % | +9,19 |

La evaluación MMLU se realizó sobre 2.500 preguntas en 57 materias, zero-shot chat con thinking desactivado y logits de elección de respuesta. En la información proporcionada la tabla MMLU aparece truncada, por lo que no se dispone de la precisión numérica final de ninguno de los dos modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: con 754,6 mil millones de parámetros en BF16, el checkpoint completo requiere aproximadamente 1,5 TB de memoria, lo que exige múltiples GPUs de 80 GB (al menos 19-20 unidades A100/H100) o cuantización agresiva.
- GPU recomendadas: clústeres multi-GPU con A100 80 GB o H100 80 GB; no es viable en una sola GPU consumer.
- Cabe en GPU consumer: no en BF16. Con cuantización de 4 bits (si se genera) el peso rondaría los 380 GB, todavía fuera del alcance de GPUs consumer individuales.
- Opciones de despliegue: transformers (formato nativo safetensors); vLLM, llama.cpp, Ollama o TGI no están confirmados como soportados en la información disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Notas |
|---|---:|---|---|---|
| DeepSeek-V4.1-Flash-1017-obliterated | 754.638.836.864 | no disponible | MIT | Variante ablacionada, rechazo 4 % |
| DeepSeek-V4.1-Flash-1017 (base) | no disponible | no disponible | no disponible | Modelo original, rechazo completo 81,62 % |
| Otras variantes abliteradas de DeepSeek | no disponible | no disponible | no disponible | No se dispone de datos comparables |

No se dispone de información sobre otros modelos de la misma categoría (mismo tamaño o misma tarea de ablación) en la información proporcionada.

## Limitaciones y advertencias

- El modelo elimina en gran medida el comportamiento de rechazo: el autor reporta un 78,28 % de asistencia dañina frente al 10,38 % del modelo base, con un 9,31 % de respuestas clasificadas como de daño severo o generalizado. No es apto para despliegues públicos sin filtros externos de seguridad.
- Riesgo elevado de generar contenido dañino, instrucciones accionables (20,76 % con nivel 4 de accionabilidad) y asistencia a conductas peligrosas; requiere moderación externa obligatoria en producción.
- La evaluación se realizó con modelos jueces (Claude Opus 4.6, GPT-6.1 Sol) y no verificó la ejecución de las instrucciones proporcionadas; los porcentajes describen el texto visible, no la eficacia real de las instrucciones.
- 25 respuestas del modelo obliterado quedaron sin anotar por bloqueos de proveedor o plataforma, lo que introduce incertidumbre en las distribuciones.
- La evaluación MMLU está truncada en la información disponible, por lo que no se puede confirmar la degradación de capacidad frente al modelo base.
- Sesgos conocidos: no disponible en la información proporcionada; se heredan los del modelo base, no documentados aquí.
- Limitaciones de contexto e idioma: no disponible.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo ni sobre el cumplimiento normativo en usos sensibles.
- El modelo base es DeepSeek-V4.1-Flash-1017; conviene revisar los términos del modelo original antes de su uso en producción.

## Enlaces

- HuggingFace: https://huggingface.co/ZENLLC/DeepSeek-V4.1-Flash-1017-obliterated
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Herramienta OBLITERATUS: https://github.com/elder-plinius/OBLITERATUS
- Detalles del método (provenance): https://huggingface.co/ZENLLC/DeepSeek-V4.1-Flash-1017-obliterated/blob/main/winner-recovery-provenance.json
- Resultados de evaluación: https://huggingface.co/ZENLLC/DeepSeek-V4.1-Flash-1017-obliterated/blob/main/evaluation-status.json
- Licencia: https://huggingface.co/ZENLLC/DeepSeek-V4.1-Flash-1017-obliterated/blob/main/LICENSE
