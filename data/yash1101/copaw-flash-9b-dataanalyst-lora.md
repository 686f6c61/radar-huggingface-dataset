# yash1101/CoPaw-Flash-9B-DataAnalyst-LoRA

## Resumen

CoPaw-Flash-9B-DataAnalyst-LoRA es un adaptador LoRA desarrollado por yash1101 (con colaboración de LocoreMind y AgentScope AI) que transforma el modelo base agentscope-ai/CoPaw-Flash-9B (arquitectura Qwen3.5-9B) en un agente autónomo especializado en análisis de datos. El adaptador, de solo 0.3 GB, se publica bajo licencia Apache 2.0 y está diseñado para ejecutar flujos de trabajo completos de exploración, análisis estadístico, generación de visualizaciones y redacción de informes sin intervención humana.

Su relevancia radica en que el modelo base, pese a comprender el formato de llamadas a herramientas, no es capaz de ejecutar tareas de análisis de forma autónoma: se detiene tras una o dos iteraciones y requiere indicaciones continuas del usuario. El adaptador LoRA resuelve este problema, logrando una tasa de finalización natural del 89,7 % en 29 conjuntos de datos reales de Kaggle, frente al 0 % del modelo base. Está pensado para integrarse en el framework open source Data Analyst mediante vLLM con soporte de LoRA y tool calling.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen3.5-9B (base: agentscope-ai/CoPaw-Flash-9B) |
| Parametros totales | No disponible (adaptador LoRA de ~0.3 GB; el modelo base no especifica su numero de parametros) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 128 000 tokens (configurado con `--max-model-len 131072` en vLLM) |
| Tipos de cuantizacion | No disponible (el adaptador se publica en bf16; el modelo base puede cuantizarse a 8 o 4 bits, segun la documentacion) |
| Idiomas soportados | Ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PEFT / LoRA) |

## Arquitectura y entrenamiento

El adaptador utiliza el metodo LoRA (Low-Rank Adaptation) con rango 64 y alpha 128, entrenado en precision bfloat16 mediante la libreria PEFT 0.18.1. Se aplica sobre el modelo base agentscope-ai/CoPaw-Flash-9B, que emplea la arquitectura Qwen3.5-9B, un transformer autoregresivo con soporte nativo de tool calling y razonamiento en formato XML. El entrenamiento se centro en capacidades de agente para analisis de datos: el adaptador aprende a mantener bucles de ejecucion prolongados (hasta 50 turnos), generar scripts de Python, invocar funciones de visualizacion y producir informes finales estructurados.

No se han publicado detalles sobre el dataset de entrenamiento, el numero de tokens utilizados ni si se emplearon tecnicas como RLHF o DPO. La documentacion indica que el entrenamiento fue esencial para lograr autonomia, ya que el modelo base, aun comprendiendo el formato de tool calling, no puede ejecutar tareas completas sin intervencion humana.

## Capacidades

- Agente autonomo de analisis de datos: carga, explora y procesa datasets en CSV, Excel y JSON.
- Analisis estadistico y perfilado de datos (medias, correlaciones, distribuciones, deteccion de valores atipicos).
- Generacion de visualizaciones con matplotlib, seaborn y plotly (mas de 290 graficos generados en las pruebas).
- Escritura y ejecucion de scripts de Python para analisis personalizado.
- Generacion de informes de resumen y extraccion de conclusiones automaticamente.
- Iteracion multi-paso en flujos de trabajo complejos (promedio de 26 iteraciones por tarea).
- Soporte de tool calling y seleccion automatica de herramientas (via vLLM con `--enable-auto-tool-choice` y parser `qwen3_xml`).
- Razonamiento visible (modo thinking) mediante `--reasoning-parser qwen3`.
- Capacidades multilingues en ingles y chino.
- El pipeline declarado es `image-text-to-text`, aunque no se documentan capacidades reales de vision en la descripcion.

## Casos de uso

- Analisis exploratorio de datos (EDA) automatizado: el modelo carga un CSV, identifica tipos de datos, calcula estadisticas descriptivas y genera graficos de distribucion sin que el usuario tenga que escribir codigo.
- Generacion de informes periodicos de negocio: puede analizar datasets de ventas o KPIs, producir resumenes ejecutivos y visualizaciones listas para presentaciones.
- Integracion en pipelines de datos: mediante el framework Data Analyst, se puede conectar a flujos existentes para automatizar la transformacion y el analisis de datos entrantes.
- Asistente de investigacion para cientificos de datos: el modelo puede ejecutar pruebas de hipotesis, explorar correlaciones y sugerir visualizaciones apropiadas para cada variable.
- Creacion de dashboards interactivos: combinado con plotly, puede generar graficos interactivos a partir de datos crudos.
- Automatizacion de tareas de limpieza de datos: detecta valores faltantes, duplicados y outliers, y propone o ejecuta acciones de correccion.
- Soporte a equipos sin conocimientos de programacion: un analista de negocio puede pedir analisis en lenguaje natural y recibir resultados completos sin escribir Python.

## Benchmarks y rendimiento

El autor evaluo el adaptador sobre 29 datasets reales de Kaggle utilizando el framework Data Analyst (max_turns=50, contexto 128K). Los resultados comparan el modelo base Qwen3.5-9B frente al adaptador LoRA:

| Metrica | Qwen3.5-9B Base | DataAnalyst-LoRA | Mejora |
|---|---|---|---|
| Iteraciones promedio | 1.2 | 26.0 | 21.7x |
| Archivos Python generados | 0 | 100+ | Infinito |
| Graficos generados | 0 | 290+ | Infinito |
| Tokens totales | ~5K | 18.5M | 3700x |
| Tasa de finalizacion natural* | 0% | 89.7% | +89.7pp |
| Llegada al limite de turnos | N/A | 10.3% | - |
| Salida utilizable | 0/29 (0%) | 26/29 (90%) | +90pp |
| Intervencion del usuario | Requerida en cada paso | Autonoma | Autonoma |

*Finalizacion natural: el modelo genera autonomamente el informe final de resumen dentro de 50 turnos.

No se han publicado resultados en benchmarks estandar como MMLU, HumanEval o GSM8K para este adaptador. Los datos presentados se centran exclusivamente en la tarea de analisis de datos.

## Requisitos de hardware

Segun la documentacion del autor:

- Dual GPU (bf16, tensor parallel 2): ~11 GB de VRAM por GPU (probado con 2x NVIDIA H200).
- Single GPU (bf16): ~22 GB de VRAM.
- 8-bit quantized: ~12 GB de VRAM.
- 4-bit quantized: ~6 GB de VRAM.
- Compatible con GPU de consumo como RTX 4090 (24 GB) en modo bf16 o cuantizado, aunque no se ha probado oficialmente.
- Despliegue recomendado con vLLM (version 0.19.1) usando `--enable-lora`, `--max-lora-rank 64`, `--gdn-prefill-backend triton` y `--trust-remote-code`.
- Alternativas: llama.cpp u Ollama no se mencionan en la documentacion; el flujo oficial se basa en vLLM.
- Latencia y throughput estimados no disponibles.

## Comparativa con modelos similares

No se dispone de comparativas publicas con otros adaptadores o modelos especializados en analisis de datos. La unica comparacion documentada es contra el modelo base sin el adaptador, que no es capaz de ejecutar tareas autonomas. Se puede considerar que el adaptador es un componente sobre Qwen3.5-9B, por lo que hereda las capacidades del modelo base en generacion de texto, razonamiento y soporte de herramientas, pero no se han publicado comparaciones con alternativas como GPT-4.1, Claude o modelos abiertos de tamano similar.

| Modelo | Parametros | Contexto | Licencia | Especializacion |
|---|---|---|---|---|
| CoPaw-Flash-9B-DataAnalyst-LoRA (este) | No disponible (base ~9B) | 128K | Apache 2.0 | Agente de analisis de datos |
| Qwen3.5-9B (base) | ~9B | 128K | Apache 2.0 | Generico, sin autonomia en tool calling |
| Otras alternativas | No disponible | - | - | No se han documentado comparaciones |

## Limitaciones y advertencias

- El adaptador esta especificamente entrenado para analisis de datos; fuera de este dominio su rendimiento puede ser inferior al del modelo base.
- No se han publicado evaluaciones de sesgos, alucinaciones o toxicidad. Como cualquier modelo de lenguaje, puede generar interpretaciones incorrectas de los datos o conclusiones erroneas.
- La tasa de finalizacion natural es del 89,7 %, lo que implica que en aproximadamente el 10 % de los casos el modelo alcanza el limite de 50 turnos sin completar la tarea.
- El modelo base puede presentar limitaciones en idiomas distintos de ingles y chino, a pesar de que la arquitectura Qwen3.5 suele soportar mas lenguas.
- La licencia Apache 2.0 permite uso comercial, pero el adaptador depende del modelo base agentscope-ai/CoPaw-Flash-9B, cuya licencia debe verificarse por separado (aunque se indica Apache 2.0 en la model card).
- El pipeline declarado como `image-text-to-text` no se corresponde con las capacidades documentadas; no hay evidencia de procesamiento de imagenes en la descripcion.
- Para produccion, se requiere un entorno con vLLM y soporte de LoRA; el despliegue en otras plataformas (TGI, Ollama) no esta documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yash1101/CoPaw-Flash-9B-DataAnalyst-LoRA
- Repositorio del adaptador (referencia en la model card): https://huggingface.co/jason1966/CoPaw-Flash-9B-DataAnalyst-LoRA
- Modelo base: https://huggingface.co/agentscope-ai/CoPaw-Flash-9B
- Framework Data Analyst: https://github.com/IIIIQIIII/data-analyst
- Showcase con 29 casos de analisis: https://github.com/LocoreMind/dataanalyst-showcase
- Demo en video: https://youtu.be/A0WBHV-DzIE?si=_sHpjOUuhzjmN43p
- Pagina de showcase: https://dataanalyst.locoremind.com/
- Pagina en ModelScope: https://www.modelscope.cn/models/LocoreMind/CoPaw-Flash-9B-DataAnalyst-LoRA
