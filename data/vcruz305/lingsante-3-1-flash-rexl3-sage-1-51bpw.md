# vcruz305/LingSante-3.1-Flash-REXL3-SAGE-1.51bpw

## Resumen

LingSante-3.1-Flash-REXL3-SAGE-1.51bpw es un pack de cuantización del modelo inclusionAI/LingSante-3.1-flash, un Mixture-of-Experts (MoE) de 560 mil millones de parámetros totales y 25 mil millones activos por token, especializado en razonamiento médico complejo, comunicación sanitaria profesional, investigación basada en evidencia y tareas médicas de horizonte largo. El pack lo publica el usuario vcruz305 mediante SAGE, un método propio de cuantización de precisión mixta para el formato REXL3 cuyo detalle no se ha publicado.

El interés de esta ficha radica en que reduce el modelo original a un perfil de 1,51 bits por peso (bpw), con un footprint GPU de 106,25 GiB y 115,37 GB en disco repartidos en 24 shards safetensors. Está dimensionado para caber en un único dispositivo de memoria unificada de clase 128 GB, dejando margen para la caché KV Gated MLA de 262K tokens y los estados recurrentes KDA de 63 capas. La fidelidad declarada frente al modelo sin cuantizar es del 88,68 % de acuerdo top-1 y una KLD media de 0,1662 sobre 15.680 predicciones de turno de asistente con vocabulario completo de 157.184 tokens.

La relevancia es doble: por un lado, demuestra que es posible servir un MoE médico de 560B en hardware de un solo nodo con memoria unificada; por otro, el método de cuantización no está documentado, lo que introduce incertidumbre sobre su reproducibilidad. La licencia MIT del modelo base se mantiene, y el modelo original está etiquetado explícitamente como destinado a investigación y evaluación, no como dispositivo médico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE transformer (bailing_hybrid) con atención Gated MLA y capas recurrentes KDA; incluye capa MTP `NextN` (`model.layers.72`) |
| Parametros totales | 57.685.896.000 en el pack cuantizado (el modelo base declara 560B totales; la discrepancia corresponde a la representación cuantizada) |
| Parametros activos | 25B por token (modelo base) |
| Longitud de contexto | 262K tokens en este pack; el modelo base declara hasta 1M tokens |
| Tipos de cuantizacion | REXL3 con perfil SAGE de precisión mixta a 1,51 bpw |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (24 shards, `model-00001-of-00024.safetensors` a `model-00024-of-00024.safetensors`, índice `model.safetensors.index.json`) |

## Arquitectura y entrenamiento

El modelo base es un MoE construido sobre Ling-3.1-flash. Emplea atención Gated MLA (Multi-head Latent Attention) y capas recurrentes KDA, una combinación híbrida que reduce el coste de la caché KV en contextos largos. La capa MTP `NextN` (`model.layers.72`) sugiere soporte de decodificación especulativa multi-token. El entrenamiento del modelo original combina preentrenamiento médico nativo, mid-training, fine-tuning supervisado, aprendizaje por refuerzo específico de tarea y destilación on-policy multi-profesor; el número exacto de tokens de entrenamiento y la composición del dataset no están disponibles en la información proporcionada.

La innovación de este repositorio concreto es la cuantización SAGE sobre REXL3, que asigna precisión mixta por tensor para alcanzar 1,51 bpw manteniendo un 88,68 % de acuerdo top-1 con el modelo de referencia en `float64`. El método no está publicado, por lo que no es posible auditar cómo se eligen las precisiones por capa ni verificar la fidelidad de forma independiente. Todos los pesos, tokenizer, plantilla de chat y definiciones de arquitectura provienen del release original de inclusionAI; solo cambia la precisión numérica de los tensores.

## Capacidades

- Razonamiento médico complejo: identificación de factores clínicos clave, validación de evidencia y resolución de conflictos entre fuentes.
- Comunicación sanitaria profesional: respuestas contextualizadas y accionables ante información incompleta.
- Investigación médica basada en evidencia con verificación cruzada entre escenarios.
- Ejecución de tareas médicas de horizonte largo: coordinación de herramientas e información dentro de un mismo flujo de trabajo, con replanificación ante información nueva.
- Uso de herramientas (tool calling) en entornos interactivos de varios pasos.
- Razonamiento multi-step y flujos agénticos con verificación estructurada.
- Generación de texto y conversación multi-turno con contexto largo (262K en este pack).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking, visión o audio: no disponibles en la información proporcionada.

## Casos de uso

- Triaje clínico asistido: el modelo puede procesar historiales extensos y notas de evolución dentro de su ventana de 262K tokens, identificar factores de riesgo y proponer preguntas de seguimiento antes de derivar a un especialista.
- Revisión de evidencia médica: dado un conjunto de guías clínicas y artículos, el modelo contrasta recomendaciones, señala conflictos entre fuentes y resume el nivel de evidencia, aprovechando su entrenamiento en alineación evidencia-razonamiento.
- Documentación clínica automatizada: generación de resúmenes de alta, informes de evolución y cartas de derivación a partir de transcripciones y datos estructurados, con tono profesional alineado.
- Agente de flujo de trabajo hospitalario: coordinación de subtareas encadenadas (consulta de bases de datos de laboratorio, cálculo de scores, generación de informe) mediante tool calling y replanificación cuando llega información nueva.
- Formación médica y simulación: entornos interactivos donde el modelo interpreta el papel de tutor o de paciente simulado, con verificación estructurada de las respuestas del alumno.
- Investigación clínica asistida: extracción y síntesis de información de protocolos y literatura extensa, con trazabilidad de la evidencia citada, adecuado para revisiones preliminares que un investigador validará después.
- Soporte a codificación clínica: mapeo de descripciones libres a códigos diagnósticos con justificación de la evidencia, útil como borrador que un codificador humano revisa.

## Benchmarks y rendimiento

El pack declara únicamente métricas de fidelidad frente al modelo sin cuantizar. No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, MedQA u otros) para este pack cuantizado en la información disponible; la model card reproduce los benchmarks del modelo original como referencia, pero no los aplica al pack.

| Metrica de fidelidad | Valor |
|---|---|
| Acuerdo top-1 (teacher-forced, vocabulario completo 157.184 tokens) | 88,68 % |
| KLD media (float64) | 0,1662 |
| Predicciones evaluadas | 15.680 (split independiente) |

## Requisitos de hardware

- VRAM estimada: 106,25 GiB residentes en GPU, más la caché KV Gated MLA para 262K tokens y los estados recurrentes KDA de 63 capas.
- Dispositivo objetivo: un único dispositivo de memoria unificada de clase 128 GB (por ejemplo, Apple Silicon de gama alta o aceleradores con memoria unificada equivalente).
- GPU discretas: no cabe en A100 (80 GB) ni en H100 (80 GB) individuales; requeriría múltiples GPUs o un nodo con memoria agregada suficiente.
- Consumer GPU: no cabe en RTX 4090 (24 GB) ni en ninguna GPU de consumo actual.
- Almacenamiento: 115,37 GB en disco repartidos en 24 shards safetensors.
- Opciones de despliegue: el formato REXL3 con `custom_code` requiere el runtime específico de REXL3; no es compatible directamente con llama.cpp, Ollama, vLLM o TGI sin conversión.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| LingSante-3.1-Flash-REXL3-SAGE-1.51bpw (este pack) | 57,7B en pack / 25B activos (base 560B) | 262K | MIT | Hugging Face, formato REXL3 |
| inclusionAI/LingSante-3.1-flash (original) | 560B / 25B | 1M | MIT | Hugging Face, ModelScope, API Computrix |
| inclusionAI/Ling-3.1-flash (base general) | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada, por lo que la comparación se limita a parámetros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- El modelo base no es un dispositivo médico y no debe usarse como base independiente para diagnóstico, prescripción o tratamiento; está destinado a investigación y evaluación.
- El método de cuantización SAGE no está publicado, lo que impide auditar la selección de precisión por capa y reproducir el proceso.
- La pérdida de fidelidad es medible: 88,68 % de acuerdo top-1 implica que aproximadamente uno de cada nueve tokens predichos difiere del modelo de referencia, con KLD media de 0,1662; en dominios clínicos esto puede traducirse en errores relevantes.
- Riesgo de alucinación inherente a los modelos de lenguaje, agravado en un dominio donde una afirmación incorrecta tiene consecuencias sanitarias.
- Sesgos conocidos: no disponibles en la información proporcionada; el modelo base no documenta evaluaciones de sesgo en la información disponible.
- Idiomas soportados no documentados; no se garantiza un rendimiento equivalente fuera del inglés o el chino.
- El contexto efectivo de este pack es de 262K tokens, cuatro veces menor que el millón declarado por el modelo base.
- El formato REXL3 con `custom_code` limita la portabilidad: no funciona con los runtimes de inferencia más extendidos sin conversión.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, por lo que no hay validación comunitaria de su funcionamiento.
- La licencia MIT permite uso comercial, pero las advertencias del modelo base sobre uso clínico siguen aplicando.

## Enlaces

- Pack cuantizado: https://huggingface.co/vcruz305/LingSante-3.1-Flash-REXL3-SAGE-1.51bpw
- Modelo base: https://huggingface.co/inclusionAI/LingSante-3.1-flash
- Modelo base en ModelScope: https://www.modelscope.cn/models/inclusionAI/LingSante-3.1-flash
- API en Computrix: https://computrix.ai/sg/models/modelservice-1795159585527001414
- Modelo antecesor general: https://huggingface.co/inclusionAI/Ling-3.1-flash
- Perfil del autor de la cuantización: https://huggingface.co/vcruz305
