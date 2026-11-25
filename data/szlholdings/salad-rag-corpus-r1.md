# SZLHOLDINGS/salad-rag-corpus-r1

## Resumen

salad-rag-corpus-r1 es un artefacto publicado por la organización SZLHOLDINGS en Hugging Face bajo la etiqueta `kind:model` dentro de su denominado "governed-AI estate". Según la model card, se trata de un "trained artifact in the governed factory", es decir, un artefacto entrenado dentro de su infraestructura interna de generación de modelos. El repositorio ocupa 0,7 GB y los pesos están en formato safetensors, lo que sugiere un modelo de tamaño pequeño o mediano, aunque no se especifica la arquitectura ni el número de parámetros en ninguna parte de la información disponible.

La model card no contiene información técnica sustantiva: no detalla arquitectura, datos de entrenamiento, tokenizador, longitud de contexto ni capacidades. En su lugar, el autor dedica la práctica totalidad del documento a describir su marco de "recibos" (receipts) y auditoría, con gráficos SVG generados de forma determinista y etiquetas MEASURED/REPORTED/UNKNOWN. La propia sección RECEIPTS reconoce explícitamente que no existe un fichero DONE.json en el estándar estricto de la organización y clasifica la evidencia de evaluación como UNKNOWN.

El nombre del repositorio sugiere un posible uso como corpus para RAG (retrieval-augmented generation) o como modelo asociado a un pipeline de recuperación, pero esto es una inferencia a partir del nombre y no está confirmado por la documentación. La licencia es Apache 2.0, aunque la propia model card advierte que la etiqueta se fijó por decisión operativa del "estate ops" sin evidencia de licencia por fichero del upstream. El repositorio no tiene descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (etiqueta fijada por el estate ops, sin evidencia por fichero del upstream) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 0,7 GB |
| Tokenizador | no disponible |
| Pipeline declarado | no disponible |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo en la documentación disponible. La model card no menciona si se trata de un transformer denso, un modelo MoE, una arquitectura híbrida o cualquier otra variante. Tampoco se indica el número de parámetros, la composición del dataset de entrenamiento, el número de tokens procesados ni si se aplicaron técnicas de alineación como RLHF, DPO o SFT.

La única información relacionada con el entrenamiento es la afirmación genérica de que se trata de un "trained artifact in the governed factory" y la referencia a que las afirmaciones de entrenamiento y evaluación "viven en sus ficheros de recibo" dentro de la malla del estate, sin que dichos recibos estén presentes en este repositorio. La sección RECEIPTS clasifica el artefacto como `RECEIPT_FILES_NO_DONE`, lo que significa que hay ficheros con nombre de recibo (concretamente un SVG de la malla de recibos) pero no un `DONE.json` que cumpla el estándar estricto de la organización (status=MEASURED, eval_rc=0, timestamp y training receipt). En consecuencia, la evidencia de evaluación se marca como UNKNOWN.

## Capacidades

- No se documenta ninguna capacidad concreta en la información disponible.
- No se confirma soporte de generación de texto, razonamiento, código, matemáticas, visión ni audio.
- No se confirma soporte de tool calling ni function calling.
- No se confirma soporte de agentes ni razonamiento multi-paso.
- No se confirman capacidades multilingües ni se listan idiomas.
- No se confirma la existencia de un modo de razonamiento (thinking mode) ni de decodificación especulativa.
- El nombre del repositorio sugiere una posible relación con un corpus para RAG, pero no hay documentación que lo confirme.

## Casos de uso

No es posible proponer casos de uso concretos y realistas sin información sobre las capacidades del modelo. La documentación disponible no permite determinar qué tareas puede resolver, qué modalidades acepta ni qué rendimiento ofrece. Cualquier caso de uso que se enumerase aquí sería especulativo y contrariaría el principio de no inventar datos que rige esta ficha.

A modo de orientación para quien evalúe el artefacto, los pasos razonables serían: inspeccionar los ficheros safetensors para determinar el número de parámetros y la arquitectura, revisar el tokenizador incluido (si existe), y localizar los recibos de entrenamiento y evaluación citados en la malla del estate antes de considerar su uso en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card declara explícitamente que "no benchmark number is asserted on this card beyond what a dated audit measured" y que la evidencia de evaluación es UNKNOWN al no existir un `DONE.json` en el estándar estricto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (depende del número de parámetros, que no se ha publicado).
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no determinable con la información disponible; el tamaño del repositorio (0,7 GB) sugiere que los pesos cabrían en GPUs de consumo con cuantización, pero se desconoce el número de parámetros y la arquitectura.
- Opciones de despliegue: no disponibles; no se documenta compatibilidad con vLLM, llama.cpp, Ollama, TGI ni otros motores de inferencia.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. No se ha publicado información suficiente sobre arquitectura, tamaño o rendimiento como para identificar modelos comparables de la misma categoría.

## Limitaciones y advertencias

- Ausencia total de documentación técnica: no se especifican arquitectura, parámetros, contexto ni tokenizador, lo que impide evaluar su idoneidad para cualquier tarea.
- Evidencia de evaluación marcada como UNKNOWN por el propio autor: no existe un `DONE.json` que cumpla el estándar estricto de la organización.
- La licencia Apache 2.0 se fijó por decisión operativa del estate ops sin evidencia de licencia por fichero del upstream, según reconoce la propia model card; esto introduce incertidumbre sobre la procedencia y los derechos de uso comercial.
- El repositorio tiene cero descargas y cero likes, sin señales de adopción ni validación por parte de la comunidad.
- No se documentan sesgos conocidos, riesgos de alucinación ni limitaciones de idioma porque no se documenta ninguna capacidad.
- El nombre del repositorio sugiere un uso como corpus para RAG, pero no hay confirmación; usarlo como modelo generativo sin verificar su naturaleza sería un error.
- Antes de cualquier uso en producción, es imprescindible inspeccionar los pesos, el tokenizador y los recibos de entrenamiento y evaluación citados en la malla del estate.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-rag-corpus-r1
- Organización en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organización en GitHub (referenciada en la model card): https://github.com/szl-holdings
- Herramienta de generación de tarjetas del estate: https://github.com/szl-holdings/estate-cards
- Paper: no disponible
- Blog o demo: no disponible
