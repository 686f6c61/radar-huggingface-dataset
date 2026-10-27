# tinyopsec/Vikhr-Qwen-2.5-1.5B-Instruct-GGUF

## Resumen

Vikhr-Qwen-2.5-1.5B-Instruct-GGUF es la distribución en formato GGUF del modelo Vikhr-Qwen-2.5-1.5B-Instruct, un ajuste fino de Qwen/Qwen2.5-1.5B-Instruct especializado en instrucciones en ruso e inglés. Lo publica el usuario tinyopsec en HuggingFace, mientras que el modelo original procede de Vikhrmodels y se entrenó sobre el conjunto de datos en ruso GrandMaster-PRO-MAX. El repositorio no aporta pesos nuevos: es una conversión a llama.cpp de los pesos del modelo base ajustado, con 13 variantes de cuantización entre F16 y Q2_K.

El interés práctico está en el tamaño: 1.543.298.048 parámetros (aproximadamente 1,5 mil millones), lo que permite ejecución local en CPU o en GPU de consumo con pocos gigabytes de memoria. Al heredar la arquitectura Qwen2.5, mantiene una ventana de contexto de 32.768 tokens y soporte para más de 29 idiomas según la documentación del modelo base, aunque el ajuste fino se centra en ruso e inglés.

Es relevante para quien necesite un modelo pequeño, con licencia Apache 2.0 y buen comportamiento en ruso, desplegable sin infraestructura dedicada: asistentes conversacionales, generación de texto en local, clasificación o extracción de información en entornos con recursos limitados o requisitos de privacidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), atención con GQA |
| Parametros totales | 1.543.298.048 (~1,5 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens (heredado de Qwen2.5-1.5B-Instruct; no verificado en esta conversión) |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q5_0, Q4_K_M, Q4_K_S, Q4_0, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | Ruso e inglés (objetivo del ajuste fino); el modelo base declara más de 29 idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (un archivo por cuantización); tamaño total del repo: 15,3 GB |

## Arquitectura y entrenamiento

La arquitectura corresponde a Qwen2.5-1.5B-Instruct: un transformer decoder-only con atención de consultas agrupadas (GQA), RoPE y normalización RMSNorm, con 1,54 mil millones de parámetros. Sobre esa base, Vikhrmodels aplicó un ajuste fino supervisado orientado a seguimiento de instrucciones usando el dataset en ruso GrandMaster-PRO-MAX, con el objetivo de mejorar la calidad en ruso manteniendo el rendimiento en inglés. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO.

La aportación del repositorio tinyopsec es puramente de conversión: los pesos se transformaron al formato GGUF mediante llama.cpp, generando 13 ficheros con distintas cuantizaciones (desde F16 de 3,0 GB hasta Q2_K). No hay innovaciones técnicas adicionales declaradas (ni decodificación especulativa, ni atención lineal, ni modos de razonamiento explícitos); el valor está en la disponibilidad de múltiples niveles de compresión listos para runtimes GGUF.

## Capacidades

- Generación de texto conversacional con formato de instrucciones (chat), incluyendo conversaciones multi-turno.
- Comprensión y generación en ruso, idioma principal del ajuste fino, y en inglés.
- Razonamiento básico, resumen, reescritura y extracción de información en textos cortos y medios.
- Generación de código y matemáticas a nivel de modelo pequeño, heredado de Qwen2.5-1.5B-Instruct (sin garantías de calidad en tareas complejas).
- Salida estructurada (JSON, listas, tablas) con prompting adecuado, con degradación esperable en esquemas muy extensos.
- Soporte de plantilla de chat de Qwen2 (rol system/user/assistant) a través de los runtimes GGUF.
- Ejecución totalmente local y offline en CPU o GPU de consumo.
- No se declara soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido en la información disponible.

## Casos de uso

- Asistencia conversacional en ruso en local: el ajuste sobre GrandMaster-PRO-MAX mejora la naturalidad de las respuestas en ruso frente al Qwen2.5 base, y el tamaño de 1,5 B permite desplegarlo en una estación de trabajo sin GPU dedicada.
- Procesamiento de documentos privados: al ejecutarse con llama.cpp u Ollama sin llamadas externas, es apto para resumir contratos, correos o informes internos que no pueden salir de la red corporativa.
- Clasificación y etiquetado de textos a escala: con cuantización Q4_K_M ocupa alrededor de 1 GB de pesos, por lo que se pueden procesar miles de documentos por hora en CPU con varias instancias en paralelo.
- Extracción de entidades y datos estructurados: útil para convertir texto libre en JSON con campos fijos (fechas, importes, nombres), siempre con validación posterior del esquema.
- Chatbot de soporte de primer nivel: con 32K tokens de contexto puede mantener el historial de una conversación larga y adjuntar documentación de referencia en el mismo prompt.
- Prototipado rápido y evaluación de pipelines: sirve como modelo de referencia barato antes de escalar a modelos mayores, y permite comparar prompts y plantillas sin coste de API.
- Generación de texto asistida en aplicaciones de escritorio: integrable vía llama-cpp-python en herramientas ofimáticas o editores para autocompletado y reescritura de párrafos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K ni métricas específicas en ruso (por ejemplo, MERA o ruMMLU) para el modelo ajustado, y tampoco se documentan comparaciones con el Qwen2.5-1.5B-Instruct original.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, más overhead de runtime y caché KV):
  - F16: ~3,0 GB de pesos; ~4 GB de VRAM en total con contexto moderado.
  - Q8_0: ~1,6 GB; ~2,5 GB en total.
  - Q6_K: ~1,3 GB; ~2,2 GB en total.
  - Q5_K_M: ~1,1 GB; ~2 GB en total.
  - Q4_K_M: ~1,0 GB; ~1,8 GB en total (cuantización recomendada por el autor).
  - Q3_K_M: ~0,8 GB; ~1,5 GB en total.
  - Q2_K: ~0,6 GB; ~1,2 GB en total.
- Caché KV: se estima en torno a 0,9 GB adicionales para los 32.768 tokens de contexto en F16, reducible con cuantización de la caché (Q8_0/Q4_0) en llama.cpp.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM sirve para todas las cuantizaciones; RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090 ejecutan F16 con contexto completo sin presión de memoria. En el segmento profesional, A100/H100 no aportan ventaja relevante por el escaso tamaño del modelo.
- Cabe en GPU de consumo: sí, desde GTX 1650 4 GB (Q4_K_M) hasta cualquier modelo con 6-8 GB para F16 con contexto largo. También funciona en CPU pura (AVX2) con velocidad de decodificación baja pero usable.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server con API compatible con OpenAI), Ollama, LM Studio, koboldcpp, llama-cpp-python. vLLM y TGI no son la vía recomendada para GGUF de este tamaño.
- Latencia y throughput: no se han publicado mediciones en la información disponible. Como referencia de orden de magnitud, un modelo de 1,5 B en Q4_K_M suele decodificar decenas de tokens por segundo en GPU de consumo y en el entorno de 5-15 tokens/s en CPU moderna de escritorio; son estimaciones, no datos del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Vikhr-Qwen-2.5-1.5B-Instruct-GGUF | 1,54 B | 32.768 (heredado) | Apache 2.0 | GGUF (13 cuantizaciones) | Ajuste fino ruso/inglés sobre Qwen2.5-1.5B |
| Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 | Apache 2.0 | safetensors, GGUF oficial | Base sin ajuste específico de ruso; referencia directa |
| Qwen2.5-3B-Instruct | ~3,1 B | 32.768 | Apache 2.0 | safetensors, GGUF | Mayor calidad y coste de memoria; misma familia y tokenizador |
| Llama-3.2-1B-Instruct | ~1,2 B | 128.000 | Licencia comunitaria Llama 3.2 | safetensors, GGUF | Contexto mucho mayor, pero licencia con restricciones y menor cobertura de ruso |

Los datos de los modelos comparables proceden de su documentación pública y no de la información proporcionada sobre este repositorio; conviene verificarlos antes de tomar decisiones de producción. No se dispone de comparaciones de rendimiento medidas entre estas variantes.

## Limitaciones y advertencias

- Con 1,5 B de parámetros, la tasa de alucinación en tareas de conocimiento factual es alta; no debe usarse como fuente de verdad sin verificación externa.
- Riesgo de degradación notable al bajar de Q4_K_M: las cuantizaciones Q3 y Q2_K pueden producir respuestas incoherentes, especialmente en ruso y en tareas de razonamiento.
- El ajuste fino está orientado a ruso e inglés; el rendimiento en castellano y en otros idiomas del modelo base no está evaluado y probablemente sea inferior al de Qwen2.5-1.5B-Instruct original.
- No se documentan evaluaciones de sesgo, toxicidad ni seguridad del ajuste fino; el dataset GrandMaster-PRO-MAX no está descrito en la información disponible.
- El contexto de 32.768 tokens es el del modelo base y no ha sido verificado para esta conversión; además, la calidad de recuperación en contextos muy largos decae en modelos de este tamaño.
- La licencia Apache 2.0 permite uso comercial, pero el autor incluye un descargo de responsabilidad ("Evaluate before use") y no ofrece garantías; conviene revisar también los términos del modelo base.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en octubre de 2026 según los metadatos: no hay evidencia de comunidad ni de validación independiente de las cuantizaciones.
- No se declara soporte de tool calling; si el pipeline depende de function calling, hay que implementar el parseo y la validación por fuera del modelo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/tinyopsec/Vikhr-Qwen-2.5-1.5B-Instruct-GGUF
- Modelo base (Qwen2.5-1.5B-Instruct): https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- GGUF oficial del modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct-GGUF
- Modelo original de Vikhrmodels (referenciado en la model card): https://huggingface.co/Vikhrmodels/Vikhr-Qwen-2.5-1.5B-Instruct
- Réplica en ModelScope: https://www.modelscope.cn/models/Vikhrmodels/Vikhr-Qwen-2.5-1.5B-Instruct-GGUF/summary
- Ficha en PromptLayer: https://www.promptlayer.com/models/vikhr-qwen-25-15b-instruct-gguf/
- Artículo de referencia sobre Qwen2.5-1.5B-Instruct-GGUF: https://dev.co/ai/llms/qwen2-5-1-5b-instruct-gguf
