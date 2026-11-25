# tablinum/Moon-Beam-8B-A1B-GGUF-Preview

## Resumen

Moon-Beam 8B A1B es un modelo de lenguaje de tipo mezcla de expertos (MoE) desarrollado por Tablinum. Combina la arquitectura Ling-3.0-tiny de inclusionAI con una biblioteca de conocimiento recuperable denominada *engram*, lo que permite al modelo consultar pasajes externos además de responder desde sus propios pesos. Cuenta con 7.893.392.800 parámetros totales, aproximadamente 1.000 millones activos por token y una ventana de contexto de 131.072 tokens.

La relevancia del modelo reside en su enfoque híbrido: no solo es un generador de texto, sino que está entrenado para interactuar con una herramienta de búsqueda (`search_library`) sobre la biblioteca de Tablinum, lo que mejora tareas de recuperación de hechos, preguntas encadenadas y memoria entre conversaciones. El ajuste se realizó con QLoRA sobre pasajes recuperados, problemas matemáticos, llamadas a herramientas y conversaciones multiturno.

Esta ficha corresponde a la versión GGUF del modelo, publicada como *preview* y pensada para su ejecución local mediante llama.cpp o el *harness* terrabeam. La licencia es MIT y el único idioma declarado es el inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) basada en Ling-3.0-tiny (`bailingmoe3`) |
| Parametros totales | 7.893.392.800 |
| Parametros activos | Aproximadamente 1.000 millones por token |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, IQ4_XS, IQ3_XXS, IQ2_M, IQ2_XXS, IQ1_M; cabecera *draft* MTP en Q4_K_M |
| Idiomas soportados | Ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | GGUF (con cabecera MTP separada para decodificacion especulativa) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer con mezcla de expertos heredada de Ling-3.0-tiny, identificada en llama.cpp como `bailingmoe3`. Con 7.893 millones de parámetros totales y alrededor de 1.000 millones activos por token, el coste computacional por token se mantiene bajo en comparación con un modelo denso del mismo tamaño total. La ventana de contexto alcanza los 131.072 tokens.

El ajuste fino se realizó con QLoRA en una primera ronda (round 1b) sobre pasajes recuperados, problemas matemáticos, llamadas a herramientas y conversaciones multiturno. Una segunda ronda no superó a los pesos de la primera en las puertas de validación (*gates*) reservadas, por lo que la versión publicada corresponde a la ronda 1b. Entre las innovaciones destacables figuran el uso de una cabecera *draft* MTP (*multi-token prediction*) para decodificación especulativa, que según el autor aporta alrededor de un 13 % más de velocidad de decodificación en GPU, y la integración de la biblioteca *engram* como herramienta consultable por el propio modelo.

## Capacidades

- Generación de texto y razonamiento con modo *thinking* activado por defecto (desactivable por petición mediante `chat_template_kwargs`).
- Razonamiento matemático: 95,5 % en 400 preguntas de GSM8K con *thinking* activado.
- Llamadas a herramientas (*tool calling*), incluyendo la herramienta `search_library` para consultar la biblioteca de Tablinum.
- Razonamiento en varios pasos: el modelo puede emitir consultas propias y encadenar búsquedas.
- Memoria entre conversaciones con la opción `--memory long-term` de terrabeam.
- Recuperación de conocimiento sobre tablas externas (EngramBench: 86,5 % de acierto).
- Comportamiento como agente de soporte en dominios aerolínea, comercio minorista y telecomunicaciones (tau2-bench).
- Capacidades multilingües: limitadas al inglés según la model card.

## Casos de uso

- Atención al cliente automatizada: el modelo actúa como agente de soporte multiturno con recompensa media de 0,80 en el dominio retail de tau2-bench, adecuado para flujos de resolución de incidencias con contexto largo.
- Asistente con base de conocimiento corporativa: mediante `search_library`, el modelo consulta tablas propias y responde con pasajes recuperados, con un 91,7 % de acierto en tareas de hechos en la configuración terrabeam 0.3.
- Preguntas encadenadas sobre documentación: el modelo puede emitir varias búsquedas sucesivas, lo que elevó el acierto en preguntas de dos pasos del 9,1 % al 63,6 % con terrabeam 0.3.
- Asistente con memoria persistente: con `--memory long-term`, conserva notas de conversaciones anteriores (89,6 % de acierto en tareas de memoria en la evaluación del autor).
- Razonamiento matemático asistido: resolución de problemas tipo GSM8K con modo *thinking*, útil en entornos educativos o de verificación de cálculos.
- Despliegue local en estación de trabajo: al caber en GPU de consumo con cuantizaciones Q4 o IQ4, sirve para prototipos y asistentes personales sin depender de la nube.
- Integración en IDE y agentes de código: compatible con Claude Code, Cursor, Continue, Cline y opencode a través de una API estilo OpenAI en `http://127.0.0.1:8080/v1`.

## Benchmarks y rendimiento

| Evaluacion | Configuracion | Resultado |
|---|---|---|
| GSM8K (400 preguntas) | *Thinking* activado, temperatura 1.0, top_p 0.95, top_k 20, hasta 32K tokens nuevos | 95,5 % |
| EngramBench (503 preguntas) | *Thinking* activado, pasajes de la tabla de cada pregunta | 436 aciertos (86,5 %) |
| tau2-bench airline | Agente de soporte | Recompensa media 0,71 |
| tau2-bench retail | Agente de soporte | Recompensa media 0,80 |
| tau2-bench telecom | Agente de soporte | Recompensa media 0,62 |
| terrabeam 0.3, hechos (108 tareas) | Comparativa de *harness* | 91,7 % correcto (frente a 59,7 % en 0.2) |
| terrabeam 0.3, preguntas de dos pasos (22) | Comparativa de *harness* | 63,6 % (frente a 9,1 %) |
| terrabeam 0.3, memoria (24) | Comparativa de *harness* | 89,6 % (frente a 64,6 %) |
| terrabeam 0.3, todas las tareas | Comparativa de *harness* | 83,4 % correcto / 12,0 % incorrecto |

Fidelidad de las cuantizaciones frente a BF16 (acuerdo top-1 mixto / WikiText y KLD mixto):

| Fichero | Tamano | Top-1 (mixto / WikiText) | KLD |
|---|---:|---:|---:|
| Q8_0 | 8,41 GB | 99,18 % / 97,20 % | 0,0009 |
| Q6_K | 7,23 GB | 98,92 % / 96,74 % | 0,0012 |
| Q5_K_M | 5,86 GB | 98,45 % / 94,86 % | 0,0031 |
| Q4_K_M | 4,94 GB | 97,65 % / 92,74 % | 0,0075 |
| IQ4_XS | 4,83 GB | 97,32 % / 92,76 % | 0,0074 |
| IQ3_XXS | 3,69 GB | 94,97 % / 85,40 % | 0,0285 |
| IQ2_M | 3,07 GB | 92,98 % / 80,26 % | 0,0622 |
| IQ2_XXS | 2,46 GB | 88,44 % / 73,88 % | 0,1456 |
| IQ1_M | 2,14 GB | 85,09 % / 66,51 % | 0,2577 |
| BF16 | 15,80 GB | referencia | 0 |

## Requisitos de hardware

- VRAM estimada para inferencia: unos 15,8 GB en BF16, 4,94 GB en Q4_K_M y 2,46 GB en IQ2_XXS, sin contar el contexto KV.
- El contexto completo de 131.072 tokens incrementa de forma notable el consumo de memoria KV; conviene dimensionar la GPU en consecuencia.
- GPU recomendadas: A100 o H100 para contexto largo y BF16; RTX 4090 o similar para Q4_K_M y Q5_K_M.
- Cabe en GPU de consumo: sí, con cuantizaciones de Q4_K_M hacia abajo (RTX 3060 de 12 GB en adelante para Q4; GPUs de 8 GB para IQ3/IQ2).
- Opciones de despliegue: llama.cpp (versión b12078 o superior, por el soporte de `bailingmoe3` y `draft-mtp`), terrabeam, y clientes compatibles con API OpenAI como Open WebUI, LM Studio, Ollama, Claude Code, Cursor, Continue, Cline y opencode.
- Decodificación especulativa: la cabecera MTP en Q4_K_M (0,55 GB) aporta aproximadamente un 13 % más de velocidad de decodificación en GPU.
- Latencia y throughput: no se han publicado cifras absolutas de tokens por segundo en la información disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Moon-Beam 8B A1B | 7.893 M | ~1.000 M | 131.072 | MIT | Integra biblioteca consultable y modo *thinking* |
| Ling-3.0-tiny | no disponible | no disponible | no disponible | no disponible | Modelo base de inclusionAI sobre el que se ajusta Moon-Beam |
| Alternativas MoE de ~8B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

No se dispone de resultados de benchmarks de modelos alternativos en la información proporcionada para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Idioma: la model card solo declara inglés; el rendimiento en castellano u otros idiomas no está evaluado.
- Alucinación: como generador, puede producir contenido incorrecto; parte de su fiabilidad depende de la recuperación desde la biblioteca *engram*, no solo de sus pesos.
- Dependencia del *harness*: los resultados de recuperación y memoria (91,7 % en hechos, 89,6 % en memoria) se obtuvieron con terrabeam 0.3; con llama.cpp sin biblioteca el modelo responde únicamente desde sus pesos.
- El razonamiento entre turnos es crítico: en tau2 airline, la puntuación cae de 0,711 a 0,045 si se descarta el razonamiento previo del modelo, por lo que los *frameworks* que lo eliminan degradan el rendimiento.
- Versión *preview*: la ronda 2 no superó las puertas de validación y los pesos publicados son de la ronda 1b; cabe esperar cambios en futuras revisiones.
- Cuantizaciones agresivas: IQ2_XXS e IQ1_M muestran una degradación notable (acuerdo top-1 del 88,44 % y 85,09 % en mixto), no recomendables para producción.
- Requiere llama.cpp b12078 o superior; versiones anteriores no soportan `bailingmoe3` ni `draft-mtp`.
- Licencia MIT: permite uso comercial, pero conviene verificar las condiciones del modelo base Ling-3.0-tiny y de la biblioteca de Tablinum por separado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tablinum/Moon-Beam-8B-A1B-GGUF-Preview
- Modelo base: https://huggingface.co/tablinum/Moon-Beam-8B-A1B
- Notas de modelo y evaluación: https://huggingface.co/tablinum/Moon-Beam-8B-A1B-GGUF/blob/main/stats/README.md
- Decisión de la ronda 2: https://huggingface.co/tablinum/Moon-Beam-8B-A1B-GGUF/blob/main/stats/round2_gate_decision.txt
- Repositorio terrabeam: https://github.com/chadstthomas-svg/terrabeam
- Guía de integración con aplicaciones: https://github.com/chadstthomas-svg/terrabeam/blob/master/docs/harnesses.md
- Instrucciones para agentes: https://huggingface.co/tablinum/Moon-Beam-8B-A1B-GGUF/blob/main/AGENTS.md
