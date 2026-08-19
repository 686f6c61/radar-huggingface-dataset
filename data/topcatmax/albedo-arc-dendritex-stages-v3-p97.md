# topcatmax/albedo-arc-dendritex-stages-v3-p97

## Resumen

El modelo `topcatmax/albedo-arc-dendritex-stages-v3-p97` es una variante publicada por el usuario topcatmax (bojan terzic) basada en el modelo Qwen3.6-35B-A3B de Alibaba. Se trata de un modelo de lenguaje causal multimodal (imagen-texto a texto) con arquitectura de mezcla de expertos (MoE) que combina atención lineal Gated DeltaNet con atención clásica Gated Attention. Desarrollado originalmente por Qwen Team, este modelo se presenta como la primera variante de pesos abiertos de la serie Qwen3.6, con un enfoque prioritario en estabilidad, utilidad real y capacidades de codificación agéntica.

El modelo tiene 35 951 822 704 parámetros totales (aproximadamente 35,95 mil millones) con solo 3 mil millones de parámetros activos por token, lo que lo hace eficiente para inferencia. Soporta una longitud de contexto nativa de 262 144 tokens, extensible hasta 1 010 000 tokens. Incluye un encoder de visión, por lo que puede procesar entradas de imagen junto con texto. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones significativas. El repositorio ocupa 71,9 GB y los pesos están en formato safetensors, compatible con Transformers, vLLM, SGLang y KTransformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder, MoE (Gated DeltaNet + Gated Attention) |
| Parametros totales | 35 951 822 704 (35,95 B) |
| Parametros activos | 3 B (8 expertos enrutados + 1 compartido de 256 expertos) |
| Longitud de contexto | 262 144 tokens nativo, extensible a 1 010 000 tokens |
| Tipos de cuantizacion | No disponible (se espera compatibilidad con cuantizaciones estándar de Transformers) |
| Idiomas soportados | No disponible (modelo multilingüe de la familia Qwen, pero sin lista oficial) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura combina un modelo de lenguaje causal con un encoder de visión. El bloque principal sigue un patrón híbrido: 10 capas de tipo `3 × (Gated DeltaNet → MoE) → 1 × (Gated Attention → MoE)`. Gated DeltaNet es una atención lineal con 32 cabezas para V y 16 para QK, con dimensión de cabeza 128. Gated Attention usa 16 cabezas para Q y 2 para KV, con dimensión de cabeza 256 y RoPE de dimensión 64. La capa MoE contiene 256 expertos en total, de los cuales 8 son enrutados más 1 compartido, con dimensión intermedia de experto de 512. La salida LM tiene 248 320 tokens (con padding). El entrenamiento incluye una fase de pre-entrenamiento y post-entrenamiento, con MTP (multi-token prediction) entrenado con multi-steps. No se especifican los datos de entrenamiento (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO) en la información disponible.

## Capacidades

- Generación de texto y razonamiento de propósito general, con soporte multimodal (entrada de imagen y texto, salida de texto).
- Codificación agéntica: manejo de flujos de trabajo frontend y razonamiento a nivel de repositorio con fluidez y precisión.
- Preservación del pensamiento: opción de retener el contexto de razonamiento de mensajes históricos para desarrollo iterativo.
- Razonamiento multi-paso y uso de herramientas (tool calling), orientado a agentes.
- Capacidad de procesar contextos muy largos (hasta 1M tokens con extensión).
- Soporte multilingüe (implícito en la familia Qwen, aunque no se detallan idiomas específicos).
- Compatible con frameworks de inferencia como vLLM, SGLang y KTransformers.

## Casos de uso

- Desarrollo de agentes de codificación autónomos: el modelo puede razonar sobre repositorios completos, modificar código y ejecutar tareas de frontend gracias a su capacidad de razonamiento a nivel de repositorio y su contexto largo.
- Asistente de programación en IDE: integrado en editores como VS Code, puede generar, refactorizar y explicar código en tiempo real, manteniendo el contexto de conversaciones previas mediante la preservación del pensamiento.
- Automatización de pruebas y depuración: con su capacidad agéntica, puede ejecutar suites de pruebas, analizar fallos y proponer correcciones, reduciendo el tiempo de ciclo en CI/CD.
- Análisis de documentos técnicos extensos: su ventana de 262K tokens permite procesar manuales, especificaciones o documentación de proyectos completos en una sola pasada, extrayendo información relevante.
- Chatbot multimodal para soporte técnico: al aceptar imágenes, puede interpretar capturas de pantalla de errores o diagramas y proporcionar respuestas contextualizadas.
- Generación de código en producción: soporta tool calling y puede integrarse en pipelines de integración continua para generar código boilerplate, migraciones o scripts, con licencia Apache 2.0 que permite uso comercial.

## Benchmarks y rendimiento

La model card del autor proporciona resultados de benchmarks para tareas de codificación agéntica, comparando con varios modelos. Los datos disponibles son:

| Benchmark | Qwen3.5-27B | Gemma4-31B | Qwen3.5-35BA3B | Gemma4-26BA4B | Qwen3.6-35BA3B |
|---|---|---|---|---|---|
| SWE-bench Verified | 75,0 | 52,0 | 70,0 | 17,4 | 73,4 |
| SWE-bench Multilingual | 69,3 | 51,7 | 60,3 | 17,3 | 67,2 |
| SWE-bench Pro | 51,2 | 35,7 | 44,6 | 13,8 | 49,5 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- No se han publicado requisitos específicos de VRAM para este modelo. Dado que tiene 35,95 B parámetros totales y 3 B activos, una estimación razonable para inferencia en FP16 sería de ~72 GB de VRAM (considerando pesos y overhead), mientras que con cuantización a 4 bits podría reducirse a ~18-20 GB.
- GPU recomendadas: para inferencia sin cuantizar se necesitarían GPUs de datacenter como A100 80GB o H100; con cuantización podría ejecutarse en GPUs consumer de gama alta como RTX 4090 (24 GB) o RTX 3090 (24 GB) si se usa cuantización de 4 bits o menor.
- El modelo es compatible con Transformers, vLLM, SGLang y KTransformers, por lo que puede desplegarse en servidores con estas herramientas.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

La tabla de benchmarks anterior ya compara con Qwen3.5-27B, Gemma4-31B, Qwen3.5-35BA3B y Gemma4-26BA4B. En términos de arquitectura, Qwen3.6-35BA3B destaca por su contexto nativo de 262K (extensible a 1M) frente a los 128K típicos de Qwen3.5. El número de parámetros activos (3B) es menor que el de Qwen3.5-35BA3B (también 3B), pero con mejor rendimiento en SWE-bench. Gemma4-31B tiene 31B densos (no MoE), lo que implica mayor coste de inferencia. La licencia Apache 2.0 de Qwen3.6-35BA3B es más permisiva que la de Gemma (que usa licencia propia de Google).

## Limitaciones y advertencias

- No se dispone de información detallada sobre sesgos o riesgos de alucinación específicos de esta variante. Como modelo basado en Qwen3.6, puede presentar sesgos presentes en los datos de entrenamiento originales.
- El modelo está diseñado principalmente para tareas de codificación y razonamiento técnico; su rendimiento en dominios no técnicos puede ser inferior.
- La longitud de contexto extensible a 1M tokens requiere técnicas de extrapolación de RoPE que pueden degradar la calidad si no se configuran adecuadamente.
- Aunque la licencia es Apache 2.0, el autor (topcatmax) es un tercero que ha publicado una variante; se recomienda verificar la procedencia y reproducibilidad del fine-tuning.
- No hay información sobre el proceso de alineación (RLHF/DPO) ni sobre la composición exacta del dataset de entrenamiento, lo que limita la evaluación de riesgos de seguridad.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es una publicación reciente o poco validada por la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/topcatmax/albedo-arc-dendritex-stages-v3-p97
- Blog oficial de Qwen3.6-35B-A3B: https://qwen.ai/blog?id=qwen3.6-35b-a3b
- Perfil del autor en HuggingFace: https://huggingface.co/topcatmax
