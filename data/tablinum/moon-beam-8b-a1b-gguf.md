# tablinum/Moon-Beam-8B-A1B-GGUF

## Resumen

Moon-Beam 8B A1B es un modelo de lenguaje de tipo mixture-of-experts (MoE) desarrollado por Tablinum, distribuido aquí en formato GGUF para inferencia local con llama.cpp. Combina los pesos de Ling-3.0-tiny (de inclusionAI) con una biblioteca de conocimiento buscable denominada *engram*, y fue afinado con QLoRA sobre pasajes recuperados, problemas matemáticos, llamadas a herramientas y conversaciones multiturno. Cuenta con 7.893.392.800 parámetros totales, aproximadamente 1B activos por token y una ventana de contexto de 131.072 tokens.

El modelo está pensado para despliegues de agente con recuperación aumentada: no solo responde desde sus pesos, sino que puede invocar una herramienta `search_library` para consultar la biblioteca engram durante la generación. Su formato GGUF con cuantizaciones verificadas (con métricas de acuerdo top-1 y KLD frente a BF16) y la inclusión de una cabeza MTP para decodificación especulativa lo orientan a ejecución local en GPU de consumo.

La relevancia actual reside en su relación capacidad/coste: un MoE de ~1B activos con contexto de 131K, licencia MIT, soporte de thinking mode y tool calling, y un harness (terrabeam) que mejora sustancialmente el rendimiento en tareas de recuperación de hechos y preguntas de dos pasos respecto a configuraciones anteriores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-experts (MoE), familia Ling v3 / `bailingmoe3` |
| Parametros totales | 7.893.392.800 |
| Parametros activos | ~1B por token |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, IQ4_XS, IQ3_XXS, IQ2_M, IQ2_XXS, IQ1_M; cabeza MTP en Q4_K_M |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | GGUF (safetensors para el modelo base) |

## Arquitectura y entrenamiento

El modelo es un transformer MoE con 8B parámetros totales y aproximadamente 1B activos por token, construido sobre Ling-3.0-tiny de inclusionAI (arquitectura identificada en llama.cpp como `bailingmoe3`). La ventana de contexto alcanza los 131.072 tokens. Incorpora una cabeza MTP (*multi-token prediction*) distribuida como archivo separado (`Moon-Beam-8B-A1B-MTP-Q4_K_M.gguf`) para decodificación especulativa, con una mejora reportada de ~13% en velocidad de decodificación en GPU.

El ajuste se realizó en una ronda denominada 1b mediante QLoRA sobre pasajes recuperados, problemas matemáticos, llamadas a herramientas y conversaciones multiturno. Una segunda ronda de entrenamiento no superó a estos pesos en las puertas de validación (held-out gates), por lo que la release publicada corresponde a la ronda 1b. El modelo está diseñado para operar junto a la biblioteca engram: cada consulta recibe los mejores pasajes de la biblioteca en el formato exacto con el que fue entrenado, y el modelo puede volver a buscar en ella mediante la herramienta `search_library` (funcionalidad disponible en terrabeam 0.3).

## Capacidades

- Generación de texto conversacional multiturno.
- Razonamiento con *thinking mode* activado por defecto; desactivable por petición con `"chat_template_kwargs": {"enable_thinking": false}`.
- Razonamiento matemático (evaluado sobre GSM8K).
- Tool calling / function calling, incluida la herramienta propia `search_library` para consultar la biblioteca engram.
- Razonamiento multi-paso con búsqueda iterativa autónoma.
- Recuperación de conocimiento desde una biblioteca externa (engram) y desde memoria persistente entre conversaciones (`--memory long-term`).
- Decodificación especulativa mediante cabeza MTP.
- Soporte de plantilla Jinja (`--jinja`) y API compatible con OpenAI.
- Capacidades multilingües limitadas al inglés.

## Casos de uso

- Agente de soporte al cliente: el modelo obtuvo recompensas medias de 0,71 en airline, 0,80 en retail y 0,62 en telecom en tau2-bench, por lo que es adecuado para conversaciones de atención al cliente multiturno con políticas y catálogos consultables vía `search_library`.
- Asistente sobre base de conocimiento corporativa: con la biblioteca engram servida por terrabeam, responde preguntas factuales sobre tablas de conocimiento (91,7% de acierto en hechos de tablas no vistas durante el entrenamiento en la evaluación del harness 0.3).
- Resolución de problemas matemáticos y razonamiento paso a paso: 95,5% de acierto en 400 preguntas GSM8K con thinking activado, útil en herramientas educativas o de verificación de cálculos.
- Preguntas de dos pasos que requieren encadenar búsquedas: el modelo formula sus propias consultas a la biblioteca de forma iterativa (63,6% de acierto en la evaluación de harness 0.3, frente al 9,1% de la configuración anterior).
- Asistente personal con memoria: con `--memory long-term`, conserva notas de conversaciones anteriores (89,6% de acierto en tareas de memoria de chats previos en la evaluación del harness).
- Integración en editores y CLIs de desarrollo (Claude Code, Cursor, Continue, Cline, opencode) como backend local compatible con OpenAI para generación y tool calling en flujos de código.
- Despliegue local en estación de trabajo con GPU de consumo: las cuantizaciones Q4_K_M (4,94 GB) e IQ4_XS (4,83 GB) permiten servir el modelo con contexto largo en GPUs de 8-12 GB, con decodificación acelerada por la cabeza MTP.

## Benchmarks y rendimiento

Evaluación según el protocolo de la model card (temperatura 1.0, top_p 0.95, top_k 20, hasta 32K tokens nuevos, ventana completa de 131K):

| Benchmark | Configuración | Resultado |
|---|---|---|
| GSM8K (400 preguntas) | thinking on | 95,5% |
| EngramBench (503 preguntas) | thinking on, pasajes de la tabla propia de cada pregunta | 436/503 correctas (86,5%) |
| tau2-bench airline | agente de soporte | recompensa media 0,71 |
| tau2-bench retail | agente de soporte | recompensa media 0,80 |
| tau2-bench telecom | agente de soporte | recompensa media 0,62 |

Evaluación del harness sobre 154 tareas de biblioteca held-out (mismos pesos, terrabeam 0.2 vs 0.3):

| Tipo de tarea | terrabeam 0.2 | terrabeam 0.3 |
|---|---:|---:|
| Hechos (108 tareas) | 59,7% | 91,7% |
| Preguntas de dos pasos (22) | 9,1% | 63,6% |
| Memoria de chats anteriores (24) | 64,6% | 89,6% |
| Todas: correctas / incorrectas | 53,2% / 14,6% | 83,4% / 12,0% |

Fidelidad de cuantización frente a BF16 (8.393 posiciones mixtas de chat, código y matemáticas; y WikiText):

| Archivo | Tamano | Acuerdo top-1 (mixto / WikiText) | KLD (mixto) |
|---|---:|---:|---:|
| Q8_0 | 8,41 GB | 99,18% / 97,20% | 0,0009 |
| Q6_K | 7,23 GB | 98,92% / 96,74% | 0,0012 |
| Q5_K_M | 5,86 GB | 98,45% / 94,86% | 0,0031 |
| Q4_K_M | 4,94 GB | 97,65% / 92,74% | 0,0075 |
| IQ4_XS | 4,83 GB | 97,32% / 92,76% | 0,0074 |
| IQ3_XXS | 3,69 GB | 94,97% / 85,40% | 0,0285 |
| IQ2_M | 3,07 GB | 92,98% / 80,26% | 0,0622 |
| IQ2_XXS | 2,46 GB | 88,44% / 73,88% | 0,1456 |
| IQ1_M | 2,14 GB | 85,09% / 66,51% | 0,2577 |
| BF16 | 15,80 GB | referencia | 0 |

## Requisitos de hardware

- VRAM estimada para inferencia: ~2,5 GB (IQ2_XXS), ~3 GB (IQ2_M), ~3,7 GB (IQ3_XXS), ~4,9 GB (Q4_K_M / IQ4_XS), ~5,9 GB (Q5_K_M), ~7,2 GB (Q6_K), ~8,4 GB (Q8_0), ~15,8 GB (BF16). Añadir espacio para la caché KV, que crece con el contexto hasta 131K tokens.
- GPU recomendadas: A100 o H100 para BF16 y contexto completo; RTX 4090 (24 GB) para Q8_0 o Q6_K con contexto largo; GPUs de 8-12 GB para Q4_K_M o IQ4_XS.
- Cabe en GPU de consumo: sí, desde GPUs de ~6 GB con cuantizaciones IQ2/IQ3 y desde ~8-12 GB con Q4_K_M para uso práctico.
- Opciones de despliegue: llama.cpp (`llama-server`, requiere build b12078 o superior por `bailingmoe3` y `draft-mtp`), terrabeam (instalador y servidor con API OpenAI en `http://127.0.0.1:8080/v1`), y clientes compatibles OpenAI como Open WebUI, LM Studio, Ollama, Claude Code, Cursor, Continue, Cline y opencode.
- Latencia y throughput: no se publican cifras absolutas de tokens por segundo; la única medida disponible es la mejora de ~13% en velocidad de decodificación en GPU al usar la cabeza MTP con `--spec-type draft-mtp --spec-draft-n-max 2`.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Moon-Beam 8B A1B (este) | 7,89B / ~1B | 131.072 | MIT | GGUF | MoE con thinking, tool calling y biblioteca engram; GSM8K 95,5% |
| Ling-3.0-tiny (modelo base) | no disponible | no disponible | no disponible | safetensors | Base sobre la que se afina Moon-Beam; sin datos de evaluación en la información disponible |
| Alternativas de ~8B densos | ~8B / 8B | variable | variable | safetensors, GGUF | No se dispone de datos comparativos en la información proporcionada |

No se han publicado en la información disponible comparativas directas con otros modelos de la misma categoría más allá de la relación con su modelo base.

## Limitaciones y advertencias

- Idioma: solo se declara soporte de inglés (`en`); el rendimiento en castellano u otros idiomas no está evaluado.
- Sesgos: no se documentan análisis de sesgo en la información disponible.
- Alucinación: el modelo puede responder desde sus propios pesos cuando se usa llama.cpp sin la biblioteca; los resultados de EngramBench (86,5%) y de hechos en el harness (91,7%) implican tasas de error no despreciables en recuperación factual.
- Dependencia del harness: el rendimiento en tareas de biblioteca y de dos pasos depende críticamente de terrabeam 0.3; con la configuración 0.2 las preguntas de dos pasos caían al 9,1% de acierto.
- El razonamiento entre turnos debe conservarse: la puntuación en tau2 airline cae de 0,711 a 0,045 si se descarta el razonamiento previo del modelo, lo que exige que la aplicación cliente lo preserve.
- Requiere llama.cpp b12078 o superior; versiones anteriores no soportan `bailingmoe3` ni `draft-mtp`.
- Cuantizaciones por debajo de Q4 pierden fidelidad de forma acusada (IQ2_XXS: 73,88% de acuerdo top-1 en WikiText; IQ1_M: 66,51%), por lo que no son recomendables para producción.
- Licencia MIT: permite uso comercial, pero no se ofrecen garantías ni se documentan restricciones adicionales en la información disponible.
- La release corresponde a la ronda 1b porque la ronda 2 no superó las puertas de validación; no se detallan los motivos técnicos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tablinum/Moon-Beam-8B-A1B-GGUF
- Modelo base: https://huggingface.co/tablinum/Moon-Beam-8B-A1B
- Notas de modelo y evaluación: https://huggingface.co/tablinum/Moon-Beam-8B-A1B-GGUF/blob/main/stats/README.md
- Decisión de puertas de la ronda 2: https://huggingface.co/tablinum/Moon-Beam-8B-A1B-GGUF/blob/main/stats/round2_gate_decision.txt
- Repositorio terrabeam: https://github.com/chadstthomas-svg/terrabeam
- Guía de integración con clientes: https://github.com/chadstthomas-svg/terrabeam/blob/master/docs/harnesses.md
- Instrucciones para agentes: https://huggingface.co/tablinum/Moon-Beam-8B-A1B-GGUF/blob/main/AGENTS.md
