# Ttimms/Ornith-1.5-35B-A3B-REAP-50-GGUF

## Resumen

Ornith-1.5-35B-A3B-REAP-50-GGUF es una cuantización GGUF del modelo Ornith-1.5-35B-A3B, un híbrido Gated-DeltaNet + MoE desarrollado por el equipo de Ornith AI (DeepReinforce). Esta variante concreta ha sido podada al 50% de sus expertos mediante la técnica REAP (CerebrasResearch/reap), reduciendo los 256 expertos originales a 128 y eliminando la cabeza MTP (Multi-Token Prediction). El resultado es un modelo con aproximadamente 17.500 millones de parámetros totales, de los cuales solo unos 3.000 millones se activan por token, lo que permite una inferencia rápida incluso en CPU o Apple Silicon.

La relevancia de esta ficha radica en que es, según el autor, la primera publicación de un GGUF de un modelo podado al 50% con REAP. Esto abre la posibilidad de ejecutar un modelo de calidad razonable en hardware de gama media, manteniendo un rendimiento cercano al del modelo original. La cuantización GGUF, junto con el podado, reduce el tamaño del archivo a unos 11 GB en su versión Q4_K_M, lo que cabe en tarjetas gráficas de 16 GB con margen para contexto.

El modelo está diseñado para generación de texto y código, con soporte para razonamiento y un modo de "thinking" activable mediante el chat template. La licencia Apache-2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gated-DeltaNet + MoE (híbrido), 128 expertos tras podado |
| Parametros totales | ~17.500 millones (tras podado REAP al 50%) |
| Parametros activos | ~3.000 millones por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M, Q5_K_M, Q6_K, Q8_0, F16 |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-35B-A3B combina una capa de atención Gated-DeltaNet con un bloque de mezcla de expertos (MoE). Tras el podado REAP al 50%, se conservan 128 expertos de los 256 originales, y se elimina la cabeza de predicción multi-token (MTP) para simplificar la conversión a GGUF. El podado incluye una corrección de renomalización del router, un ajuste necesario para mantener la distribución de activaciones tras eliminar expertos.

El entrenamiento del modelo original se basó en un bucle de auto-mejora (self-scaffolding y self-improvement) en el que el modelo propone nuevas tareas, genera scaffolds específicos y produce rollouts para aprendizaje por refuerzo, según se describe en la página oficial de Ornith. Sin embargo, no se han publicado detalles sobre el volumen de tokens de entrenamiento ni la composición exacta del dataset. La conversión a GGUF se realizó con `convert_hf_to_gguf.py --no-mtp` sobre una versión reciente de llama.cpp, verificando su correcto funcionamiento con `llama-server`.

## Capacidades

- Generación de texto y razonamiento avanzado, con soporte para tareas de programación (evidenciado por los benchmarks HumanEval+ y MBPP+).
- Modo de "thinking" integrado en el chat template, que se puede desactivar mediante `"chat_template_kwargs": {"enable_thinking": false}` para obtener respuestas más directas.
- Inferencia eficiente gracias a la activación de solo ~3B parámetros por token, lo que permite ejecución en CPU y Apple Silicon con latencias aceptables.
- Soporte nativo para el formato GGUF, compatible con llama.cpp y derivados como Ollama (aunque el soporte de Ollama está pendiente de actualizar su llama.cpp incluido).
- Capacidades multilingües limitadas al inglés; no se ha documentado soporte para otros idiomas.
- No se especifica soporte explícito para tool calling, function calling o visión. La información disponible no lo confirma.

## Casos de uso

- Generación de código en entornos con recursos limitados: gracias a su tamaño reducido (~11 GB en Q4_K_M) y a los ~3B parámetros activos, puede ejecutarse en portátiles con GPU de 16 GB o incluso en CPU, permitiendo autocompletado y generación de funciones en editores locales.
- Asistente de programación en pipelines CI/CD: el modelo puede integrarse en flujos de revisión de código o generación de tests, aunque no se ha confirmado soporte para tool calling, su capacidad de razonamiento y generación de código lo hace útil para sugerencias estáticas.
- Prototipado rápido de aplicaciones de chat: al ser ligero y con licencia Apache-2.0, es adecuado para desarrollar chatbots de texto sin costes de API, desplegándolo en servidores modestos con llama.cpp.
- Educación y aprendizaje de programación: puede utilizarse como tutor de código en inglés, explicando algoritmos o depurando ejemplos, gracias a su capacidad de razonamiento y a la posibilidad de ejecutarlo en hardware de bajo coste.
- Investigación en podado de modelos: al ser el primer GGUF de un modelo podado con REAP al 50%, sirve como referencia para estudiar el impacto de la poda en la calidad de generación y en el rendimiento práctico.
- Despliegue en edge computing: su baja huella de memoria y la compatibilidad con CPU lo convierten en candidato para dispositivos embebidos o servidores sin GPU, siempre que la latencia no sea crítica.

## Benchmarks y rendimiento

Los datos de benchmarks disponibles provienen de dos fuentes: la model card del propio modelo podado (en su versión NVFP4A16, antes de la cuantización GGUF) y la página de llm-releases.com para el modelo original sin podar. Se presentan a continuación, indicando claramente su procedencia.

| Benchmark | Modelo podado (NVFP4A16) | Modelo original (sin podar) |
|---|---|---|
| HumanEval+ | 84,2% | no disponible |
| MBPP+ | 89,2% | no disponible |
| Terminal-Bench 2.1 | no disponible | 68,5 |
| SWE-Bench Verified | no disponible | 79,0 |

Los resultados del modelo original son promedios de cinco ejecuciones reportados por el proveedor. No se dispone de benchmarks del modelo podado en su versión GGUF, por lo que el rendimiento real puede variar ligeramente respecto a los valores indicados.

## Requisitos de hardware

- Tamaños de archivo por cuantización: Q4_K_M ~11 GB, Q5_K_M ~13 GB, Q6_K ~15 GB, Q8_0 ~19 GB, F16 ~35 GB.
- VRAM estimada: Q4_K_M cabe en una GPU de 16 GB con margen para contexto; Q5_K_M y Q6_K también son viables en 16 GB; Q8_0 requiere más de 16 GB o descarga parcial a CPU; F16 necesita ~35 GB y es recomendable solo para re-cuantización o fusión.
- GPUs recomendadas: RTX 3090, RTX 4090, A100 o cualquier GPU con al menos 16 GB de VRAM para las cuantizaciones Q4-Q6. También funciona en CPU y Apple Silicon gracias al bajo número de parámetros activos.
- Opciones de despliegue: llama.cpp (con `llama-server`), compatible con la arquitectura `qwen35moe`. Ollama aún no lo soporta oficialmente hasta que actualice su llama.cpp integrado.
- Latencia y throughput: no se han publicado mediciones concretas, pero la activación de solo ~3B parámetros por token sugiere una velocidad de generación significativamente mayor que un modelo denso de tamaño equivalente.

## Comparativa con modelos similares

La comparativa más directa es con el modelo original sin podar, Ornith-1.5-35B-A3B, del cual deriva. También podría compararse con otros MoE de tamaño similar, como Qwen3-30B-A3B, pero no se dispone de datos de referencia en las fuentes consultadas.

| Modelo | Parámetros totales | Parámetros activos | Contexto | Benchmarks (poda) | Licencia |
|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B (original) | ~35B | ~3B | no disponible | Terminal-Bench 2.1: 68,5; SWE-Bench Verified: 79,0 | MIT (según llm-releases) |
| Ornith-1.5-35B-A3B-REAP-50 (GGUF) | ~17,5B | ~3B | no disponible | HumanEval+: 84,2%; MBPP+: 89,2% (NVFP4A16) | Apache-2.0 |

El podado reduce a la mitad los parámetros totales manteniendo los activos, lo que no afecta a la velocidad de inferencia pero sí al tamaño del archivo y al uso de memoria. No se dispone de comparativa con otros modelos MoE similares en cuanto a rendimiento y licencia.

## Limitaciones y advertencias

- Requiere una versión reciente de llama.cpp que soporte la arquitectura híbrida `qwen35moe`; versiones antiguas no podrán cargar el modelo.
- El chat template tiene el modo "thinking" activado por defecto, lo que puede generar respuestas más largas y verbosas. Para aplicaciones que requieran respuestas directas, es necesario desactivarlo explícitamente.
- El modelo solo está entrenado en inglés; su rendimiento en otros idiomas es muy limitado o nulo.
- Al ser un modelo podado, puede presentar una degradación en tareas complejas que requieran la coordinación de muchos expertos, aunque los benchmarks disponibles sugieren que la pérdida es moderada.
- No se han documentado sesgos específicos, pero al estar entrenado principalmente con datos en inglés, puede reflejar sesgos culturales de ese ámbito.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda verificar el cumplimiento de las atribuciones correspondientes.
- No se ha confirmado el soporte para tool calling, function calling ni capacidades multimodales; cualquier integración que dependa de estas funciones debe validarse previamente.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/Ttimms/Ornith-1.5-35B-A3B-REAP-50-GGUF
- Modelo base NVFP4A16: https://huggingface.co/Ttimms/Ornith-1.5-35B-A3B-REAP-50-NVFP4A16
- Modelo podado en bf16: https://huggingface.co/Ttimms/Ornith-1.5-35B-A3B-REAP-50-bf16
- Repositorio de pipeline y benchmarks: https://github.com/t-timms/ornith-nvfp4
- Modelo original Ornith-1.5-35B-A3B: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- GGUF del modelo original: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B-GGUF
- Página oficial de Ornith-1.5: https://ornith.ai/ornith_1_5.html
- Ficha en LLM Releases: https://www.llm-releases.com/models/ornith-1-5-35b-a3b
