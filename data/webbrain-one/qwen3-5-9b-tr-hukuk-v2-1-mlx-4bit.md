# webbrain-one/qwen3.5-9b-tr-hukuk-v2.1-MLX-4bit

## Resumen

Qwen 3.5 9B Türkçe Hukuk v2.1 (MLX 4-bit) es un ajuste fino del modelo base Qwen/Qwen3.5-9B orientado a derecho turco, desarrollado por webbrain-one y empaquetado en formato MLX de 4 bits para su ejecución en Apple Silicon. El modelo es el motor por defecto de la aplicación de escritorio PekBilen en Macs con chip Apple, y su propósito es resolver tareas jurídicas en turco: redacción de escritos, consulta de normativa, análisis de decisiones judiciales y generación de argumentarios con citas controladas.

La relevancia técnica del paquete reside en su pipeline de entrenamiento: sobre el modelo base se aplicó un LoRA v2 (r 32, α 64) con 6.013 ejemplos generados en el formato de prompt propio de la aplicación, seguido de un LoRA v2.1 de DPO con 202 pares de preferencia cuyo criterio de rechazo era la generación de referencias jurisprudenciales no presentes en la fuente. Los pesos resultantes se fusionaron en bf16 y se cuantizaron a 4 bits afines con grupo 64 mediante mlx-lm 0.32.2, dando un repositorio de 5,1 GB con 8.953.803.264 parámetros.

El modelo es exclusivamente de texto (sin capa de visión), monolingüe en turco y con licencia propietaria privada, lo que restringe su uso comercial y prohíbe su redistribución. Su interés para desarrolladores e investigadores es doble: por un lado, documenta una receta de alineación DPO centrada en la fidelidad de citas legales; por otro, sirve como referencia de cuantización MLX 4-bit frente a la variante GGUF IQ4_XS del mismo autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (model_type `qwen3_5_text`), derivado de Qwen3.5-9B |
| Parametros totales | 8.953.803.264 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | 4-bit affine, grupo 64 (MLX); existe variante GGUF IQ4_XS y paquete MLX 5-bit del mismo autor |
| Idiomas soportados | turco (tr) |
| Licencia | proprietary-private (licencia `other`, uso privado propietario) |
| Formato de pesos | safetensors (MLX 4-bit), 5,04 GB en `model.safetensors` |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B, un transformer denso de aproximadamente 8,95 mil millones de parámetros. Sobre esa base se aplicaron dos etapas de ajuste: primero un LoRA v2 con rango 32 y alpha 64 entrenado sobre 6.013 ejemplos generados en el formato de prompt de la aplicación PekBilen (documentos como fuente en el prompt, reglas de la aplicación, esqueletos de escritos y pasos de plantilla), donde cada respuesta objetivo pasó por los verificadores de citas y tareas de la aplicación. Después, un LoRA v2.1 de DPO con 202 pares de preferencia: la respuesta rechazada era la propia salida de v2 que no superaba la verificación en tareas nuevas (mayoritariamente atribuciones judiciales inexistentes en la fuente) y la elegida era la salida que sí la superaba para el mismo prompt.

Ambos LoRA se fusionaron secuencialmente en bf16 sobre los pesos base, manteniendo el tokenizador y la plantilla de chat originales de Qwen3.5-9B. La cuantización final a 4 bits afines con grupo 64 se realizó con mlx-lm 0.32.2, la misma configuración que el paquete MLX v1. El modelo soporta modo de razonamiento explícito controlable mediante `enable_thinking=True|False` en la plantilla de chat, con tokens de parada `<|im_end|>` y `<|endoftext|>`. No se documentan en la información disponible innovaciones como decodificación especulativa ni atención lineal.

## Capacidades

- Generación de texto jurídico en turco: redacción de escritos, demandas, alegaciones y respuestas con estructura de plantilla.
- Razonamiento jurídico con modo de pensamiento activable o desactivable según la tarea.
- Consulta y síntesis de normativa turca (preguntas de legislación con respuesta controlada).
- Análisis de decisiones judiciales, con énfasis en evitar atribuciones de sentencias no presentes en la fuente.
- Cumplimiento de instrucciones en el formato de prompt específico de la aplicación PekBilen (documentos como fuente, reglas y esqueletos).
- Generación conversacional multi-turno mediante plantilla de chat estándar de Qwen.
- No soporta visión, audio ni tool calling según la información disponible; es un modelo solo de texto.
- Capacidad multilingüe limitada al turco en la práctica, aunque el tokenizador base es el de Qwen3.5.

## Casos de uso

- Redacción asistida de escritos jurídicos: el modelo genera borradores de demandas y alegaciones siguiendo los esqueletos y pasos de plantilla de PekBilen, adecuado para despachos que necesitan primera versión estructurada en turco.
- Consulta de normativa en escritorio: integrado en la aplicación PekBilen sobre Macs Apple Silicon, responde preguntas de legislación con verificación de citas, evitando referencias inventadas gracias al DPO de v2.1.
- Análisis de jurisprudencia reciente: con el modo de pensamiento activo, procesa decisiones de 2026 no vistas en entrenamiento y extrae fundamentos, útil para investigación jurídica interna.
- Verificación de atribuciones legales: el modelo está entrenado para no citar sentencias ausentes del documento fuente, lo que lo hace adecuado como capa de generación en flujos con verificador posterior.
- Asistencia en formación jurídica: responde preguntas tipo ÖSYM (TRLawBench) y cuestionarios de cloze, aprovechable en plataformas de estudio de derecho turco.
- Prototipado local en Apple Silicon: al ocupar 5,04 GB en 4-bit, permite desplegar un asistente jurídico en un Mac de 16 GB de memoria unificada sin GPU dedicada, útil para demos y entornos de desarrollo.
- Generación de resúmenes de expedientes: con contexto de documentos insertados en el prompt, sintetiza hechos y fundamentos para revisión humana.

## Benchmarks y rendimiento

Las mediciones se realizaron sobre los mismos pesos en su versión GGUF (IQ4_XS, llama.cpp); el paquete MLX no se midió por separado en las tareas de la aplicación.

| Benchmark | v1 | v2 | v2.1 |
|---|---:|---:|---:|
| Tareas de la aplicación, pensamiento activo (139 tareas) | 82 | 96–97 | 102 |
| Tareas de la aplicación, pensamiento desactivado (139 tareas) | 87 | 89–93 | 97 |
| Preguntas de legislación (40) | 5 | 39 | 38 |
| TRLawBench (97 preguntas ÖSYM, sin pensamiento) | 44 | 46 | 47 |
| HukukBERT cloze (750 preguntas) | 47,7 % | 47,3 % | 47,7 % |

El autor indica que en TRLawBench el margen de ruido es de ±5 preguntas con 97 ítems, por lo que no hay diferencia significativa entre versiones. En la comparación interna del autor, el paquete MLX 4-bit obtuvo 80 sobre 139 tareas frente a 97 del GGUF IQ4_XS de los mismos pesos, y el paquete MLX 5-bit iguala el nivel GGUF.

## Requisitos de hardware

- VRAM/memoria unificada: se recomienda un Mac Apple Silicon con 16 GB o más de memoria unificada; el peso del modelo es de 5,04 GB.
- GPU: exclusivamente Apple Silicon (M1, M2, M3, M4 y superiores) mediante MLX; no está pensado para CUDA.
- No cabe en GPUs de consumo tipo RTX 4090 en este formato, ya que MLX requiere Apple Silicon; la variante GGUF del mismo autor sí permitiría llama.cpp en otras plataformas.
- Despliegue: mlx-lm 0.32.2 con carga mediante `model_config={"model_type": "qwen3_5"}` porque la versión de la librería no reconoce `qwen3_5_text`; alternativamente, el paquete GGUF con llama.cpp.
- Latencia y throughput: no disponibles en la información proporcionada.
- Ajustes de muestreo recomendados por el autor: temperatura 0,3 y top-p 0,9.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| webbrain-one/qwen3.5-9b-tr-hukuk-v2.1-MLX-4bit | 8,95 B | no disponible | proprietary-private | MLX 4-bit | 102/139 en tareas de la aplicación |
| webbrain-one/qwen3.5-9b-tr-hukuk-v2.1-MLX-5bit | 8,95 B | no disponible | proprietary-private | MLX 5-bit | Nivel GGUF, usado por PekBilen |
| webbrain-one/qwen3.5-9b-tr-hukuk-v2.1-GGUF | 8,95 B | no disponible | proprietary-private | GGUF IQ4_XS | 97/139 en tareas de la aplicación |
| Qwen/Qwen3.5-9B (base) | 8,95 B | no disponible | no disponible en la informacion | safetensors | Sin ajuste jurídico ni turco específico |

No se dispone de datos de benchmarks de modelos competidores de derecho turco en la información proporcionada.

## Limitaciones y advertencias

- Licencia propietaria privada: prohíbe la distribución no autorizada y restringe el uso comercial; debe revisarse con el autor antes de cualquier despliegue productivo.
- Modelo monolingüe en turco: no se garantiza un rendimiento adecuado en castellano ni en otros idiomas.
- Riesgo de alucinación jurídica: aunque el DPO de v2.1 penaliza atribuciones judiciales inventadas, el propio autor advierte que las salidas no sustituyen a un dictamen jurídico y que las citas, números de sentencia y cuantías deben verificarse en la fuente primaria.
- Las evaluaciones se realizaron sobre la variante GGUF, no sobre el paquete MLX 4-bit, que en las tareas de la aplicación rinde por debajo (80/139 frente a 97 del GGUF).
- Longitud de contexto no documentada en la información disponible; conviene validar el comportamiento con documentos largos antes de usarlo en producción.
- Sin soporte de visión, audio ni tool calling documentado, lo que limita su integración en pipelines agénticos.
- El paquete MLX requiere una versión concreta de mlx-lm y un workaround de carga (`model_type: qwen3_5`), lo que añade fragilidad operativa.
- Sesgos específicos del corpus jurídico turco y de los datos sintéticos de entrenamiento no documentados en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/webbrain-one/qwen3.5-9b-tr-hukuk-v2.1-MLX-4bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Paquete GGUF del mismo autor: https://huggingface.co/webbrain-one/qwen3.5-9b-tr-hukuk-v2.1-GGUF
- Paquete MLX 5-bit: https://huggingface.co/webbrain-one/qwen3.5-9b-tr-hukuk-v2.1-MLX-5bit
- Dataset de entrenamiento: https://huggingface.co/webbrain-one/hukuk-dataset-v2
- Librería MLX-LM: https://github.com/ml-explore/mlx-lm
