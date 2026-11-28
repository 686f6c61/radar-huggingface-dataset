# tablinum/Moon-Beam-8B-A1B-GGUF-Preview

## Resumen

Moon-Beam-8B-A1B es un modelo de lenguaje de tipo mixture-of-experts (MoE) desarrollado por Tablinum, construido a partir de Ling-3.0-tiny de inclusionAI y aumentado con una biblioteca de conocimiento buscable denominada *engram*. El modelo cuenta con 7.893.392.800 parametros totales y aproximadamente 1B de parametros activos por token, con una ventana de contexto de 131.072 tokens. Esta ficha corresponde a la version GGUF (Preview) publicada por el propio autor, empaquetada para su uso con llama.cpp y con el entorno terrabeam.

El modelo esta disenado para combinar razonamiento con thinking mode, tool calling y recuperacion de conocimiento desde una biblioteca externa, lo que lo orienta a tareas de agente conversacional, resolucion de problemas matematicos y respuesta sobre documentacion. La version publicada es la ronda 1b de fine-tuning, ya que la ronda 2 no supero las pruebas de validacion internas del autor.

La relevancia actual del modelo reside en su enfoque hibrido: pesos compactos (8B totales, ~1B activos) que caben en GPU de consumo en cuantizaciones Q4, junto con un arnes de despliegue (terrabeam) que gestiona la recuperacion de pasajes y la memoria persistente. La licencia MIT facilita su adopcion comercial, aunque el modelo solo declara soporte para ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-experts (MoE), variante `bailingmoe3` (Ling v3) segun llama.cpp |
| Parametros totales | 7.893.392.800 |
| Parametros activos | Aproximadamente 1B por token (segun model card) |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, IQ4_XS, IQ3_XXS, IQ2_M, IQ2_XXS, IQ1_M; ademas cabecera MTP en Q4_K_M |
| Idiomas soportados | Ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp); modelo base en safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer con mezcla de expertos (MoE) derivado de Ling-3.0-tiny de inclusionAI, identificado en llama.cpp como `bailingmoe3`. El modelo parte de los pesos de Ling-3.0-tiny y se fine-tunea con QLoRA sobre pasajes recuperados de la biblioteca *engram* de Tablinum, problemas matematicos, llamadas a herramientas y conversaciones multi-turno. La ronda publicada es la 1b; segun el autor, la ronda 2 no supero las puertas de validacion retenidas (documentado en `round2_gate_decision.txt`).

Entre las innovaciones tecnicas destacables figura una cabecera de decodificacion especulativa MTP (multi-token prediction) distribuida como fichero GGUF separado, que aporta aproximadamente un 13% mas de velocidad de decodificacion en GPU. El modelo incorpora ademas un modo de razonamiento (thinking) activado por defecto y la capacidad de invocar una herramienta `search_library` para consultar la biblioteca de conocimiento de forma autonoma. Cada cuantizacion se ha generado con su propia importance matrix, y el autor publica metricas de acuerdo top-1 y divergencia KL frente a BF16.

## Capacidades

- Generacion de texto conversacional en ingles con soporte de multi-turno.
- Razonamiento explicito mediante thinking mode (activado por defecto, desactivable por peticion con `enable_thinking: false`).
- Tool calling y function calling, incluida la herramienta `search_library` para busqueda autonoma en la biblioteca engram.
- Razonamiento matematico: 95,5% en 400 preguntas de GSM8K con thinking activado.
- Respuesta sobre conocimiento recuperado: 86,5% en EngramBench (436 de 503).
- Comportamiento como agente de soporte en dominios de aerolinea, retail y telecom (tau2-bench).
- Memoria persistente entre conversaciones mediante la opcion `--memory long-term` de terrabeam.
- Decodificacion especulativa mediante cabecera MTP para acelerar la inferencia en GPU.
- Compatibilidad con clientes OpenAI-style (Open WebUI, LM Studio, Ollama, Claude Code, Cursor, Continue, Cline, opencode).
- Soporte multilingue limitado: solo se declara ingles.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno de soporte en dominios como aerolinea, retail y telecom, con recompensas medias de 0,71, 0,80 y 0,62 respectivamente en tau2-bench, gracias a sus 131.072 tokens de contexto y a la conservacion del razonamiento entre turnos.
- Asistente sobre documentacion interna: usando la biblioteca engram y la herramienta `search_library`, el modelo responde preguntas sobre tablas de conocimiento propietarias, con un 91,7% de acierto en tareas de hechos en el arnes terrabeam 0.3.
- Resolucion de problemas matematicos paso a paso: con thinking mode activado alcanza un 95,5% en GSM8K, adecuado para tutoria automatizada o verificacion de calculos en pipelines educativos.
- Agente con memoria persistente: la opcion `--memory long-term` permite recordar hechos personales contados en conversaciones anteriores (89,6% de acierto en tareas de memoria), util para asistentes personales o copilotos de proyecto.
- Despliegue local en estacion de trabajo: con cuantizacion Q4_K_M (4,94 GB) el modelo cabe en GPU de consumo y se sirve mediante llama.cpp o terrabeam con una API compatible con OpenAI en `http://127.0.0.1:8080/v1`.
- Integracion en editores y CLI de codigo: al ser compatible con Cursor, Continue, Cline, Claude Code y opencode, puede usarse como backend local para asistencia de codigo y llamadas a herramientas en flujos de desarrollo.
- Preguntas de dos pasos sobre conocimiento estructurado: la busqueda autonoma en la biblioteca eleva el acierto del 9,1% al 63,6% en preguntas que requieren encadenar dos consultas, adecuado para analisis sobre catalogos o bases documentales.
- Experimentacion e investigacion en MoE de bajo coste: con ~1B parametros activos y licencia MIT, sirve como banco de pruebas para estudiar tecnicas de recuperacion, decodificacion especulativa y agentes con memoria.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card (protocolo de model card: temperatura 1.0, top_p 0.95, top_k 20, hasta 32K tokens nuevos, ventana completa de 131K):

| Benchmark | Metrica | Resultado |
|---|---|---|
| GSM8K (400 preguntas) | Precision con thinking | 95,5% |
| EngramBench (503 preguntas) | Precision con thinking y pasajes de la tabla propia | 86,5% (436/503) |
| tau2-bench airline | Recompensa media | 0,71 |
| tau2-bench retail | Recompensa media | 0,80 |
| tau2-bench telecom | Recompensa media | 0,62 |

Evaluacion del arnes terrabeam sobre 154 tareas retenidas de biblioteca:

| Tipo de tarea | terrabeam 0.2 | terrabeam 0.3 |
|---|---:|---:|
| Hechos (108 tareas) | 59,7% | 91,7% |
| Preguntas de dos pasos (22) | 9,1% | 63,6% |
| Memoria de chats anteriores (24) | 64,6% | 89,6% |
| Todas las tareas (correctas / incorrectas) | 53,2% / 14,6% | 83,4% / 12,0% |

Fidelidad de cuantizaciones frente a BF16 (acuerdo top-1 mixto / WikiText y KLD mixto):

| Fichero | Tamano | Top-1 mixto / WikiText | KLD |
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

No se han publicado resultados de MMLU, HumanEval ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5 GB con Q4_K_M (4,94 GB de pesos), unos 6 GB con Q5_K_M, 7,5 GB con Q6_K y 8,5 GB con Q8_0. La ventana completa de 131K tokens incrementa notablemente el consumo de KV cache.
- GPU recomendadas: A100 o H100 para contexto completo y cargas concurrentes; RTX 4090 o RTX 3090 para uso individual con cuantizaciones Q4-Q8.
- Cabe en GPU de consumo: si, con Q4_K_M o IQ4_XS en tarjetas de 8 GB o mas (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090). Las cuantizaciones IQ2 e IQ1 permiten bajar de 4 GB con perdida apreciable de calidad.
- Despliegue: llama.cpp (version b12078 o superior, necesaria para `bailingmoe3` y `draft-mtp`), terrabeam (arnes del autor con API OpenAI en `127.0.0.1:8080/v1`), y clientes compatibles como Open WebUI, LM Studio, Ollama, Claude Code, Cursor, Continue, Cline y opencode.
- Aceleracion: la cabecera MTP en Q4_K_M (0,55 GB) aporta aproximadamente un 13% mas de velocidad de decodificacion en GPU mediante decodificacion especulativa (`--spec-type draft-mtp --spec-draft-n-max 2`).
- Latencia y throughput: no se han publicado cifras absolutas de tokens por segundo en la informacion disponible; solo el dato relativo del 13% de mejora con MTP.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Moon-Beam-8B-A1B | 7,89B / ~1B | 131.072 | MIT | MoE con biblioteca engram, thinking y tool calling; solo ingles |
| Ling-3.0-tiny (inclusionAI) | no disponible | no disponible | no disponible | Modelo base del que deriva Moon-Beam |
| Alternativas MoE de ~8B con ~1B activos | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada |

No se dispone de datos de benchmarks comparativos con modelos de la misma categoria en la informacion proporcionada; la comparativa se limita al modelo base declarado.

## Limitaciones y advertencias

- Solo soporta ingles de forma declarada; el rendimiento en castellano u otros idiomas no esta evaluado.
- Riesgo de alucinacion: el modelo puede responder desde sus propios pesos cuando se usa llama.cpp sin la biblioteca engram, sin garantia de verificacion factual.
- El rendimiento depende fuertemente del arnes: en tareas de biblioteca, el mismo fichero de pesos pasa del 53,2% al 83,4% de acierto segun la version de terrabeam, por lo que los resultados en produccion pueden diferir de los publicados.
- La version publicada es la ronda 1b; la ronda 2 no supero las puertas de validacion del autor, lo que sugiere margen de mejora no explotado.
- Las cuantizaciones agresivas (IQ2_XXS, IQ1_M) degradan notablemente la fidelidad (acuerdo top-1 del 88,44% y 85,09% en mixto; KLD de 0,1456 y 0,2577), por lo que no son recomendables para produccion.
- Requiere llama.cpp b12078 o superior; versiones anteriores no soportan la arquitectura `bailingmoe3` ni la decodificacion MTP.
- El uso de contexto completo de 131K incrementa el consumo de memoria de forma significativa y puede reducir el throughput.
- Sesgos conocidos: no se documentan en la informacion disponible; al entrenarse sobre datos recuperados de una biblioteca propietaria, puede heredar sesgos de esa fuente.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantias ni soporte; conviene verificar los terminos de las dependencias (llama.cpp, terrabeam) por separado.
- El repositorio ocupa 59,0 GB por incluir todas las cuantizaciones; descargar solo el fichero necesario.

## Enlaces

- Hugging Face: https://huggingface.co/tablinum/Moon-Beam-8B-A1B-GGUF-Preview
- Modelo base: https://huggingface.co/tablinum/Moon-Beam-8B-A1B
- Notas de modelo y evaluacion: https://huggingface.co/tablinum/Moon-Beam-8B-A1B-GGUF/blob/main/stats/README.md
- Decision de la ronda 2: https://huggingface.co/tablinum/Moon-Beam-8B-A1B-GGUF/blob/main/stats/round2_gate_decision.txt
- Repositorio terrabeam: https://github.com/chadstthomas-svg/terrabeam
- Guia de integracion con clientes: https://github.com/chadstthomas-svg/terrabeam/blob/master/docs/harnesses.md
- Instrucciones para agentes: https://huggingface.co/tablinum/Moon-Beam-8B-A1B-GGUF/blob/main/AGENTS.md
