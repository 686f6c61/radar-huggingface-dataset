# tablinum/Moon-Beam-8B-A1B-GGUF-Preview

## Resumen
Moon-Beam-8B-A1B es un modelo de lenguaje de tipo mezcla de expertos (MoE) desarrollado por Tablinum, construido a partir de Ling-3.0-tiny de inclusionAI y aumentado con una biblioteca de conocimiento recuperable denominada *engram*. Cuenta con 8.000 millones de parametros totales, aproximadamente 1.000 millones activos por token y una ventana de contexto de 131.072 tokens. La version aqui descrita es un preview (candidato de release, ronda 1b) distribuida en formato GGUF para inferencia con llama.cpp.

El modelo combina generacion de texto con un mecanismo de recuperacion de pasajes externos: en lugar de depender unicamente de sus pesos, consulta la biblioteca Tablinum-2 para inyectar contexto relevante en el formato exacto con el que fue entrenado. Segun la model card, esta recuperacion eleva de forma notable el rendimiento en tareas de conocimiento factual (SimpleQA pasa de 3,0% a 60,1% de respuestas correctas) y en su benchmark propio EngramBench (de 12,1% a 86,5%).

Es relevante ahora porque ofrece un modelo compacto (apto para GPU de consumo en cuantizaciones Q4), con contexto muy largo, modo de razonamiento (*thinking*) activado por defecto, soporte de tool calling y licencia MIT, lo que facilita su adopcion tanto en prototipos como en despliegues locales.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) basada en Ling-3.0-tiny (arquitectura `bailingmoe3` en llama.cpp) |
| Parametros totales | 7.893.392.800 |
| Parametros activos | Aproximadamente 1.000 millones por token |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, IQ4_XS, IQ3_XXS, IQ2_M, IQ2_XXS, IQ1_M; cabeza MTP en Q4_K_M |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | GGUF (repo de 59,0 GB con multiples ficheros) |

## Arquitectura y entrenamiento
Moon-Beam emplea una arquitectura transformer con mezcla de expertos, heredada de Ling-3.0-tiny (etiquetada `bailingmoe3` en llama.cpp), con 8.000 millones de parametros totales y unos 1.000 millones activos por token, lo que reduce el coste computacional por token frente a un modelo denso del mismo tamano. La ventana de contexto alcanza los 131.072 tokens.

La ronda 1b se afino con QLoRA sobre pasajes recuperados, problemas matematicos, llamadas a herramientas y conversaciones multi-turno. El modelo integra la biblioteca de conocimiento *engram* de Tablinum (version Tablinum-2 en este preview), que inyecta pasajes relevantes en el prompt con el mismo formato visto durante el entrenamiento. Incluye una cabeza de decodificacion especulativa MTP (Multi-Token Prediction) distribuida como fichero aparte, que aporta aproximadamente un 13% mas de velocidad de decodificacion en GPU. El modo *thinking* esta activado por defecto y puede desactivarse por peticion.

## Capacidades
- Generacion de texto conversacional y multi-turno con contexto largo (hasta 131.072 tokens).
- Razonamiento con modo *thinking* activable o desactivable por peticion (`enable_thinking`).
- Razonamiento matematico (evaluado en GSM8K).
- Soporte de tool calling / function calling (etiqueta `tool-calling`, evaluado como agente en tau2-bench).
- Recuperacion aumentada mediante la biblioteca *engram* (Tablinum-2).
- Memoria persistente entre conversaciones mediante la opcion `--memory long-term` de terrabeam.
- Decodificacion especulativa mediante cabeza MTP para acelerar la inferencia en GPU.
- Compatibilidad con API estilo OpenAI (`/v1`) y con clientes como Open WebUI, LM Studio, Ollama, Claude Code, Cursor, Continue, Cline y opencode.
- Capacidades multilingues limitadas al ingles segun los metadatos del modelo.

## Casos de uso
- Atencion al cliente automatizada: el modelo fue evaluado como agente de soporte en tau2-bench (reward medio de 0,71 en airline y 0,80 en retail) y puede gestionar conversaciones multi-turno con contexto largo, lo que lo hace adecuado para flujos de soporte con historial extenso.
- Asistente con conocimiento corporativo: usando la biblioteca *engram* o pasajes recuperados propios, el modelo responde sobre documentacion interna; la model card muestra mejoras de 3,0% a 60,1% en SimpleQA al aportar pasajes, lo que indica que el rendimiento depende criticamente de la recuperacion.
- Agente con herramientas en produccion: gracias al soporte de tool calling y a la API compatible con OpenAI, puede integrarse en pipelines que invocan funciones externas (consultas a bases de datos, APIs) y orquestarse con frameworks de agentes.
- Despliegue local en estaciones de trabajo: en cuantizacion Q4_K_M (4,94 GB) cabe en GPU de consumo, permitiendo prototipado y uso personal sin infraestructura cloud.
- Razonamiento matematico asistido: evaluado en GSM8K con modo *thinking*, util para resolver problemas paso a paso en entornos educativos o de analisis.
- Sustitucion de modelos en clientes existentes: al exponer una API compatible con OpenAI y funcionar con LM Studio, Ollama o Open WebUI, puede reemplazar a otros modelos en herramientas ya instaladas sin reescribir integraciones.
- Procesamiento de documentos largos: con 131.072 tokens de contexto puede analizar documentos extensos o conversaciones largas en una sola ventana.

## Benchmarks y rendimiento
Resultados publicados en la model card (protocolo de model card: temperatura 1,0, top_p 0,95, top_k 20, hasta 32K tokens nuevos, ventana completa de 131K):

| Benchmark | Configuracion | Resultado |
|---|---|---|
| GSM8K (400 preguntas) | Thinking on | 95,5% correctas |
| EngramBench (503 preguntas) | Thinking on, con pasajes | 86,5% correctas (436/503) |
| EngramBench (503 preguntas) | Thinking on, sin pasajes | 12,1% |
| EngramBench (503 preguntas) | Thinking off, con pasajes | 87,9% |
| EngramBench (503 preguntas) | Thinking off, sin pasajes | 8,5% |
| SimpleQA (1000 preguntas) | Thinking on, con pasajes | 60,1% (601/1000) |
| SimpleQA (1000 preguntas) | Thinking on, sin pasajes | 3,0% |
| SimpleQA (1000 preguntas) | Thinking off, con pasajes | 58,1% |
| SimpleQA (1000 preguntas) | Thinking off, sin pasajes | 3,0% |
| AA-Omniscience dev (200 preguntas) | Thinking on, con pasajes | 28,0% |
| AA-Omniscience dev (200 preguntas) | Thinking on, sin pasajes | 10,5% |
| tau2-bench airline | Agente de soporte | reward medio 0,71 |
| tau2-bench retail | Agente de soporte | reward medio 0,80 |

Nota: la model card indica que algunas cifras estan marcadas como *preliminary* y se estan re-midiendo. El modelo base Ling sin afinar alcanzo 59,2% en SimpleQA con los mismos pasajes y thinking on (frente a 60,1% de la ronda 1b), lo que sugiere que la mayor parte de la mejora proviene de la recuperacion de pasajes.

## Requisitos de hardware
- VRAM estimada segun cuantizacion: IQ1_M 2,14 GB; IQ2_XXS 2,46 GB; IQ2_M 3,07 GB; IQ3_XXS 3,69 GB; IQ4_XS 4,83 GB; Q4_K_M 4,94 GB; Q5_K_M 5,86 GB; Q6_K 7,23 GB; Q8_0 8,41 GB; BF16 15,80 GB.
- Cabe en GPU de consumo: Q4_K_M (4,94 GB) e IQ4_XS (4,83 GB) caben en tarjetas de 8 GB; Q5_K_M y Q6_K requieren 8-12 GB; Q8_0 requiere 12 GB o mas; BF16 requiere 16 GB o mas.
- GPU recomendadas: no especificadas en la informacion disponible; por tamano, una RTX 4090 (24 GB) permite Q8_0 o BF16 con holgura, y una RTX 4060 Ti de 16 GB admite BF16 ajustado o Q8_0.
- Opciones de despliegue: llama.cpp (version b12078 o superior, necesaria para `bailingmoe3` y `draft-mtp`), terrabeam (script de instalacion con descarga automatica y API OpenAI en `http://127.0.0.1:8080/v1`), y compatibilidad con Open WebUI, LM Studio, Ollama, Claude Code, Cursor, Continue, Cline y opencode.
- Aceleracion: la cabeza MTP en Q4_K_M (0,55 GB) aporta aproximadamente un 13% mas de velocidad de decodificacion en GPU.
- Latencia y throughput: no disponibles mas alla del dato de la cabeza MTP.

## Comparativa con modelos similares
| Modelo | Parametros totales / activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Moon-Beam-8B-A1B (este) | 7,9B / ~1B | 131.072 | MIT | GGUF | MoE con recuperacion engram, thinking, tool calling |
| Ling-3.0-tiny (modelo base) | no disponible | no disponible | no disponible | no disponible | Base de inclusionAI sobre la que se afino; alcanzo 59,2% en SimpleQA con los mismos pasajes |
| Alternativas de tamano similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de otros modelos comparables en la informacion proporcionada |

## Limitaciones y advertencias
- Es un preview (candidato de release, ronda 1b): los pesos pueden cambiar y la model card indica que se actualizaran al publicarse Tablinum-3.
- El rendimiento depende en gran medida de la recuperacion de pasajes: sin pasajes, SimpleQA cae a 3,0% y EngramBench a 12,1%, lo que indica un riesgo alto de respuestas incorrectas o alucinaciones en conocimiento factual si no se aporta contexto.
- Solo soporta ingles segun los metadatos del modelo; no se declaran capacidades multilingues.
- Algunas cifras de benchmarks estan marcadas como preliminares y sujetas a re-medicion.
- Requiere llama.cpp b12078 o superior; versiones anteriores no soportan la arquitectura `bailingmoe3` ni la cabeza `draft-mtp`.
- El uso optimo presupone la biblioteca Tablinum-2 y el formato exacto de inyeccion de pasajes con el que fue entrenado; usarlo con otro formato puede degradar el rendimiento.
- Licencia MIT: permite uso comercial, pero se recomienda verificar las condiciones del modelo base Ling-3.0-tiny de inclusionAI, no detalladas en la informacion disponible.
- No se han publicado datos sobre sesgos conocidos en la informacion proporcionada.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/tablinum/Moon-Beam-8B-A1B-GGUF-Preview
- Modelo base: https://huggingface.co/tablinum/Moon-Beam-8B-A1B-Preview
- Notas de modelo y evaluacion: https://huggingface.co/tablinum/Moon-Beam-8B-A1B-GGUF-Preview/blob/main/stats/README.md
- Resultados de benchmarks preliminares: https://huggingface.co/tablinum/Moon-Beam-8B-A1B-GGUF-Preview/blob/main/stats/benchmarks_preliminary_1104.json
- Repositorio terrabeam: https://github.com/chadstthomas-svg/terrabeam
- Guia de configuracion por aplicacion: https://github.com/chadstthomas-svg/terrabeam/blob/master/docs/harnesses.md
- Instrucciones para agentes: https://huggingface.co/tablinum/Moon-Beam-8B-A1B-GGUF-Preview/blob/main/AGENTS.md
