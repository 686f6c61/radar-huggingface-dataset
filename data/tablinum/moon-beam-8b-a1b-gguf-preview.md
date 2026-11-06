# tablinum/Moon-Beam-8B-A1B-GGUF-Preview

## Resumen

Moon-Beam-8B-A1B es un modelo de lenguaje de tipo mezcla de expertos (MoE) desarrollado por tablinum, con 8.000 millones de parámetros totales y aproximadamente 1.000 millones activos por token, junto con una ventana de contexto de 131.072 tokens. Se construye a partir de Ling-3.0-tiny de inclusionAI, al que se le añade una biblioteca de conocimiento recuperable denominada *engram* (Tablinum-2). La versión aquí descrita es un GGUF de previsualización (release candidate, ronda 1b) del modelo base `tablinum/Moon-Beam-8B-A1B-Preview`.

El modelo resuelve el problema de la recuperación de conocimiento factual: en lugar de depender exclusivamente del conocimiento almacenado en los pesos, se combina con pasajes recuperados de la biblioteca engram en el mismo formato con el que fue entrenado. Según la model card, esta combinación eleva el rendimiento en tareas de conocimiento cerrado de forma sustancial (por ejemplo, SimpleQA de 28 a 593 respuestas correctas sobre 1.000 con thinking activado).

Es relevante ahora porque ofrece un MoE de contexto largo (131K), con modo de razonamiento (thinking), soporte de tool calling y cuantizaciones GGUF listas para llama.cpp, con licencia MIT y un ecosistema de despliegue (terrabeam) que integra la recuperación automática de pasajes. La etiqueta `-Preview` indica que los pesos son un candidato de publicación y que la biblioteca Tablinum-3 (aproximadamente el doble de tamaño) aún está en construcción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) basada en Ling-3.0-tiny (familia Ling v3 / `bailingmoe3` en llama.cpp) |
| Parametros totales | 7.893.392.800 (aproximadamente 8B) |
| Parametros activos | Aproximadamente 1B por token |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, IQ4_XS, IQ3_XXS, IQ2_M, IQ2_XXS, IQ1_M; además cabecera MTP en Q4_K_M |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp); modelo base en safetensors |
| Tamano del repositorio | 59,0 GB |
| Modelo base | tablinum/Moon-Beam-8B-A1B-Preview |
| Version minima de llama.cpp | b12078 o superior |

## Arquitectura y entrenamiento

Moon-Beam es un transformer de mezcla de expertos construido sobre Ling-3.0-tiny de inclusionAI, con 8B parámetros totales y aproximadamente 1B activos por token. Incorpora una ventana de contexto de 131.072 tokens y una cabecera de decodificación especulativa MTP (multi-token prediction) distribuida como archivo aparte (`Moon-Beam-8B-A1B-MTP-Q4_K_M.gguf`), que según la model card aporta aproximadamente un 13 % más de velocidad de decodificación en GPU.

El ajuste fino de la ronda 1b se realizó con QLoRA sobre pasajes recuperados, problemas matemáticos, llamadas a herramientas y conversaciones multi-turno. La innovación central es la integración con la biblioteca *engram* (Tablinum-2): cada pregunta recibe los mejores pasajes de la biblioteca en el mismo formato con el que el modelo fue entrenado, de modo que el modelo aprende a apoyarse en conocimiento recuperable además de en sus pesos. La model card señala que el modelo base Ling sin entrenar también alcanzó un 59,2 % en SimpleQA con los mismos pasajes y thinking activado, frente al 59,3 % de la ronda 1b, lo que sugiere que la mayor parte de la ganancia procede de la recuperación de pasajes. No se detalla el número exacto de tokens de entrenamiento ni la composición completa del dataset.

## Capacidades

- Generación de texto conversacional en inglés, con modo de razonamiento (thinking) activado por defecto y desactivable por petición mediante `chat_template_kwargs`.
- Razonamiento matemático: 96,2 % en 400 preguntas de GSM8K con thinking activado (evaluación preliminar del 4 de noviembre).
- Soporte de tool calling / function calling (etiqueta `tool-calling` en la model card).
- Respuesta a preguntas de conocimiento cerrado apoyada en recuperación de pasajes de la biblioteca engram (EngramBench, SimpleQA, AA-Omniscience).
- Conversaciones multi-turno con seguimiento de contexto: 94,0 % de aciertos en primeras preguntas y 93,3 % en segundas preguntas sobre 150 pares.
- Ventana de contexto larga de 131.072 tokens, útil para documentos extensos y diálogos prolongados.
- Integración con memoria a largo plazo persistente entre conversaciones mediante la opción `--memory long-term` de terrabeam.
- Compatibilidad con clientes OpenAI (Open WebUI, LM Studio, Ollama, Claude Code, Cursor, Continue, Cline, opencode).
- Capacidades multilingües limitadas al inglés según la model card.
- No se mencionan capacidades de visión ni de audio.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo gracias a sus 131.072 tokens de ventana y a la memoria a largo plazo opcional de terrabeam, manteniendo el hilo entre sesiones.
- Respuesta a preguntas sobre documentación interna: desplegando la biblioteca engram con los manuales de la organización, el modelo recupera pasajes relevantes y responde con el formato con el que fue entrenado; la model card reporta mejoras de 12,9 % a 85,7 % en EngramBench al pasar de conocimiento cerrado a recuperado.
- Asistente de código en IDE: al soportar tool calling y ser compatible con Cursor, Continue y Cline, puede integrarse en flujos de autocompletado y edición asistida dentro del editor.
- Automatización de agentes multi-paso: la combinación de thinking mode, tool calling y contexto de 131K permite encadenar pasos de razonamiento y llamadas a herramientas en pipelines de agentes.
- Razonamiento matemático y resolución de problemas: con 96,2 % en GSM8K, es adecuado para tutores automáticos o verificación de cálculos en entornos educativos.
- Despliegue local en estaciones de trabajo: las cuantizaciones Q4_K_M (4,94 GB) e IQ4_XS (4,83 GB) permiten ejecutar el modelo en GPU de consumo y en CPU mediante llama.cpp, con una pérdida de acuerdo con BF16 del 97,65 % y 97,32 % respectivamente.
- Servicio de API compatible con OpenAI: terrabeam expone un endpoint en `http://127.0.0.1:8080/v1`, lo que facilita sustituir proveedores externos en aplicaciones existentes.
- Generación aumentada por recuperación (RAG) de conocimiento factual: con SimpleQA pasando de 2,8 % a 59,3 % de aciertos al añadir pasajes, es adecuado para asistentes de investigación que necesiten citar fuentes recuperadas.

## Benchmarks y rendimiento

Resultados preliminares publicados en la model card (evaluación del 4 de noviembre; el protocolo de model card usa temperatura 1,0, top_p 0,95, top_k 20, hasta 32K tokens nuevos y ventana completa de 131K):

| Benchmark | Thinking on · cerrado | Thinking on · recuperado | Thinking off · cerrado | Thinking off · recuperado |
|---|---:|---:|---:|---:|
| EngramBench (503) | 12,9 % | 85,7 % | 10,1 % | 87,5 % |
| SimpleQA (1000) | 2,8 % | 59,3 % | 2,6 % | 57,5 % |
| AA-Omniscience (200) | 10,0 % | 26,5 % | 5,0 % | 26,5 % |

Otros resultados citados:

| Benchmark | Resultado |
|---|---|
| GSM8K (400 preguntas, thinking on) | 96,2 % |
| EngramBench (503, thinking off, pasajes de la propia tabla) | 87,5 % (440/503) |
| Pares de preguntas multi-turno (150 pares, thinking on) | 94,0 % primera / 93,3 % segunda |
| SimpleQA con modelo base Ling sin entrenar y mismos pasajes | 59,2 % |

Calidad de las cuantizaciones frente a BF16 (acuerdo top-1 en mixto / WikiText y KLD en mixto):

| Archivo | Tamano | Acuerdo top-1 (mixto / WikiText) | KLD (mixto) |
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

Las mediciones de acuerdo y KLD se realizaron sobre 8.393 posiciones mixtas de chat, código y matemáticas, y sobre WikiText. La model card advierte que los números marcados como *preliminary* se están volviendo a medir con el protocolo de model card.

## Requisitos de hardware

- VRAM estimada según cuantización: BF16 15,80 GB; Q8_0 8,41 GB; Q6_K 7,23 GB; Q5_K_M 5,86 GB; Q4_K_M 4,94 GB; IQ4_XS 4,83 GB; IQ3_XXS 3,69 GB; IQ2_M 3,07 GB; IQ2_XXS 2,46 GB; IQ1_M 2,14 GB. Añadir aproximadamente 0,55 GB si se usa la cabecera MTP.
- GPU recomendadas: no se especifican modelos concretos en la información disponible. Por tamaño, las cuantizaciones Q4_K_M e IQ4_XS caben en GPU de consumo con 8 GB de VRAM o más; las cuantizaciones de 2-3 GB permiten ejecución en GPU con 4 GB o en CPU.
- Cabe en GPU de consumo: sí, con las cuantizaciones Q4_K_M, IQ4_XS, IQ3_XXS, IQ2_M, IQ2_XXS e IQ1_M. La cabecera MTP aporta aproximadamente un 13 % más de velocidad de decodificación en GPU.
- Opciones de despliegue: llama.cpp (versión b12078 o superior, con soporte de `bailingmoe3` y `draft-mtp`), terrabeam (instalador que descarga el archivo adecuado, la build de llama.cpp y la biblioteca Tablinum), y clientes compatibles con OpenAI como Open WebUI, LM Studio, Ollama, Claude Code, Cursor, Continue, Cline y opencode. No se menciona soporte de vLLM ni TGI en la información disponible.
- Latencia y throughput: no se publican cifras absolutas de latencia o throughput; solo se indica la mejora relativa de aproximadamente un 13 % en decodificación con la cabecera MTP en GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---:|---:|---|---|---|
| Moon-Beam-8B-A1B (este) | 8B | ~1B | 131.072 | MIT | GGUF, safetensors | MoE con biblioteca engram y thinking mode |
| Ling-3.0-tiny (inclusionAI) | no disponible | no disponible | no disponible | no disponible | no disponible | Modelo base del que deriva Moon-Beam |
| Modelos MoE de ~8B con ~1B activos | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de benchmarks comparables en la información proporcionada |

La información disponible solo permite comparar con el modelo base Ling-3.0-tiny, del que no se detallan especificaciones ni resultados de benchmarks más allá del 59,2 % en SimpleQA con los mismos pasajes. No se han publicado en la información disponible comparativas con otros modelos MoE de tamaño similar.

## Limitaciones y advertencias

- Modelo en previsualización (release candidate, ronda 1b): los pesos y las tarjetas pueden cambiar cuando se publique Tablinum-3 y se elimine el sufijo `-Preview`.
- Los resultados marcados como preliminares están pendientes de re-medición con el protocolo de model card; no deben tratarse como definitivos.
- Idioma limitado al inglés según la model card; no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- El rendimiento en conocimiento factual depende en gran medida de la recuperación de pasajes: sin la biblioteca engram, SimpleQA cae al 2,8 % y EngramBench al 12,9 % con thinking activado.
- La model card señala que el modelo base sin entrenar alcanza un rendimiento similar al ajustado en SimpleQA con los mismos pasajes (59,2 % frente a 59,3 %), lo que sugiere que parte de la ganancia atribuida al ajuste fino podría deberse a la recuperación.
- Riesgo de alucinación inherente a los modelos de lenguaje; la evaluación usa un juez automático (Claude Haiku) que separa respuestas parciales y abstenciones de las correctas, pero no se detallan métricas de calibración.
- No se documentan sesgos conocidos en la información disponible.
- Requiere llama.cpp b12078 o superior; versiones anteriores no soportan la arquitectura `bailingmoe3` ni la decodificación `draft-mtp`.
- Licencia MIT: permite uso comercial, pero al ser un modelo de previsualización conviene validar el comportamiento en producción antes de desplegarlo.
- No se mencionan capacidades de visión, audio ni otros modalidades; el uso queda restringido a texto.
- La biblioteca engram (Tablinum-2) debe descargarse y configurarse correctamente para obtener el rendimiento reportado; el uso con llama.cpp "puro" responde solo desde sus pesos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tablinum/Moon-Beam-8B-A1B-GGUF-Preview
- Modelo base: https://huggingface.co/tablinum/Moon-Beam-8B-A1B-Preview
- Notas de modelo y evaluación: https://huggingface.co/tablinum/Moon-Beam-8B-A1B-GGUF-Preview/blob/main/stats/README.md
- Resultados de benchmarks preliminares: https://huggingface.co/tablinum/Moon-Beam-8B-A1B-GGUF-Preview/blob/main/stats/benchmarks_preliminary_1104.json
- Repositorio terrabeam: https://github.com/chadstthomas-svg/terrabeam
- Guía de integración con clientes: https://github.com/chadstthomas-svg/terrabeam/blob/master/docs/harnesses.md
- Instrucciones para agentes: https://huggingface.co/tablinum/Moon-Beam-8B-A1B-GGUF-Preview/blob/main/AGENTS.md
