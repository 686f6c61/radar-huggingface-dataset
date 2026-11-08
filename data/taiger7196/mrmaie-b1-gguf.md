# taiger7196/MrMaie-B1-GGUF

## Resumen

MrMaie B1 GGUF es la distribucion en formato GGUF de MrMaie B1, un modelo de lenguaje de 3.950.369.280 parametros (aproximadamente 3,95B) desarrollado por el equipo MrMaie. El modelo se presenta como una destilacion de GLM-5-3-Flash y esta pensado para inferencia local en runtimes compatibles con GGUF como LM Studio, Ollama y llama.cpp. El repositorio ofrece variantes cuantizadas desde F16 hasta Q2_K, con Q4_K_M como configuracion recomendada por el autor.

La propuesta tecnica del autor es mantener la arquitectura completa de 4B sin poda estructural, pero operando con una huella de memoria propia de un modelo de 1,8B. Esta afirmacion aparece en la model card, aunque no se aporta documentacion tecnica que explique el mecanismo concreto por el que se logra esa reduccion de memoria manteniendo todos los parametros activos.

El modelo solo declara soporte para ingles e italiano y se distribuye bajo licencia Apache 2.0. Es un lanzamiento experimental con cero descargas y cero likes en el momento de la consulta, y la evaluacion publicada se limita a un benchmark interno de 200 preguntas del propio equipo, sin resultados en benchmarks externos estandar. Por tanto, debe tratarse como un modelo de proposito general conversacional y de generacion de texto, adecuado para experimentacion local, pero sin evidencia independiente de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalle no disponible); modelo base MrMaie B1 |
| Parametros totales | 3.950.369.280 (aproximadamente 3,95B) |
| Parametros activos | No aplica (el autor indica 3.950.369.280 parametros activos, sin poda estructural; no se declara arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | F16, Q8_0, Q4_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | Ingles (en), italiano (it) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repositorio de cuantizaciones); el modelo base se distribuye via transformers |

## Arquitectura y entrenamiento

La model card describe MrMaie B1 como un modelo de 4B con la arquitectura completa retenida (sin poda estructural) que opera dentro de la huella de memoria de un modelo de 1,8B. No se especifica el tipo exacto de transformer, el numero de capas, la dimension oculta, el mecanismo de atencion ni la longitud de contexto. El autor indica que el modelo es una destilacion cuyo profesor es GLM-5-3-Flash, pero no detalla el volumen de datos de entrenamiento, la composicion del corpus, ni si se aplicaron tecnicas de RLHF, DPO u otras fases de alineamiento.

Tampoco se documentan innovaciones tecnicas concretas como decodificacion especulativa, atencion lineal o mecanismos hibridos. La unica afirmacion tecnica destacable es la del "full-parameter 4B con huella sub-2B", que el autor menciona en el titulo de la cita bibliografica pero no desarrolla. No hay informacion sobre la tokenizer, el vocabulario ni la estrategia de entrenamiento multilingue para ingles e italiano.

## Capacidades

- Generacion de texto conversacional en ingles e italiano.
- Razonamiento de proposito general segun el benchmark interno del autor (ciencia, matematicas, logica, linguistica, aritmetica practica, ingenieria de software, seguimiento estricto de instrucciones y calibracion epistemica).
- Seguimiento de instrucciones estrictas, segun la evaluacion interna declarada.
- Inferencia local en LM Studio, Ollama y llama.cpp mediante los ficheros GGUF.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking, vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Asistencia conversacional local en ingles o italiano: el modelo puede desplegarse con Ollama o LM Studio en un equipo de sobremesa y gestionar dialogos multi-turno basicos, aunque la longitud de contexto no esta documentada y conviene validar el comportamiento en conversaciones largas.
- Prototipado rapido de aplicaciones de generacion de texto: al ofrecer variantes desde Q2_K (1,5 GB) hasta F16 (7,5 GB), permite iterar en portatiles sin GPU dedicada usando llama.cpp con la variante Q4_K_M.
- Generacion de codigo en entornos con recursos limitados: el benchmark interno incluye ingenieria de software, pero al no haber resultados en HumanEval ni soporte documentado de tool calling, su uso en produccion de codigo requiere validacion previa.
- Tareas de razonamiento y aritmetica en italiano: es uno de los pocos modelos pequenos que declara soporte nativo de italiano, lo que lo hace candidato para asistentes o herramientas internas en ese idioma, siempre con evaluacion propia.
- Experimentacion academica con destilacion: al declarar GLM-5-3-Flash como profesor, puede servir para estudiar el efecto de la destilacion en modelos de menos de 4B, comparando las distintas cuantizaciones sobre el mismo conjunto de preguntas.
- Despliegue en entornos air-gapped: la distribucion GGUF y la licencia Apache 2.0 permiten ejecutar el modelo completamente en local sin dependencias de red, util para entornos con requisitos de privacidad.
- Evaluacion de calibracion epistemica: el benchmark interno incluye esta dimension, por lo que puede usarse como caso de prueba para estudiar como un modelo pequeno expresa incertidumbre, aunque sin garantias externas.

## Benchmarks y rendimiento

El autor solo publica resultados en su benchmark interno de 200 preguntas. No hay datos en MMLU, HumanEval, GSM8K ni otros benchmarks estandar.

| Suite de evaluacion | Idioma | Preguntas | Precision |
|---|---|---|---|
| MrMaie Internal Benchmark | Ingles | 200 | 100,0% (200/200) |
| MrMaie Internal Benchmark | Italiano | 200 | 100,0% (200/200) |

El propio autor advierte que estos resultados pueden no ser representativos en otros benchmarks o arneses de evaluacion externos. No se han publicado resultados de benchmarks independientes en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia segun cuantizacion (tamanos de fichero declarados):
  - F16: 7541,39 MB (aproximadamente 7,5 GB).
  - Q8_0: 4009,95 MB (aproximadamente 4 GB).
  - Q4_K_M: 2431,22 MB (aproximadamente 2,4 GB).
  - Q3_K_S: 1724,75 MB (aproximadamente 1,7 GB).
  - Q2_K: 1536,86 MB (aproximadamente 1,5 GB).
- GPU recomendadas: no disponible. Por tamano, las variantes Q4_K_M y Q3_K_S caben en GPUs consumer con 4-6 GB de VRAM (por ejemplo, GTX 1650, RTX 3050, RTX 4060). La variante F16 requiere al menos 8 GB de VRAM para caber completa en GPU (RTX 3060 Ti, RTX 4060 Ti 16 GB, RTX 4070 en adelante). No hay datos de rendimiento en A100 ni H100.
- Cabe en GPU consumer: si, en todas las cuantizaciones excepto potencialmente F16 en GPUs de 6 GB o menos. Las variantes Q4_K_M y Q3_K_S son las mas adecuadas para equipos modestos.
- Opciones de despliegue: LM Studio, Ollama (`ollama run hf.co/taiger7196/MrMaie-B1-GGUF:Q4_K_M`), llama.cpp (`llama-cli`). El modelo base es compatible con transformers.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo.

## Comparativa con modelos similares

No se dispone de datos de benchmarks externos de MrMaie B1, por lo que la comparacion se limita a caracteristicas estructurales. Los modelos alternativos citados son referencias genericas de la categoria de 3-4B; sus cifras de rendimiento no se han verificado en esta ficha y deben consultarse en sus respectivas model cards.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| MrMaie B1 | 3,95B | No disponible | en, it | Apache 2.0 | GGUF, transformers |
| Qwen2.5-3B | 3,09B | 32.768 tokens (referencia habitual) | Multiples | Apache 2.0 | safetensors, GGUF |
| Llama 3.2 3B | 3,21B | 128.000 tokens (referencia habitual) | Multiples | Llama 3.2 Community License | safetensors, GGUF |
| Phi-3.5-mini | 3,82B | 128.000 tokens (referencia habitual) | Multiples | MIT | safetensors, GGUF |

MrMaie B1 destaca por su licencia permisiva Apache 2.0 y su soporte declarado de italiano, pero carece de contexto documentado y de evaluacion externa, a diferencia de las alternativas citadas, que cuentan con benchmarks publicos y comunidades amplias. No se dispone de datos para comparar rendimiento real.

## Limitaciones y advertencias

- El unico benchmark publicado es interno (200 preguntas del propio autor) con 100% de acierto; el autor reconoce que puede no generalizar a evaluaciones externas. Un 100% en un conjunto propio es una senal de posible sobreajuste o de baja dificultad del conjunto, no una garantia de calidad.
- Modelo experimental: el autor advierte de posibles artefactos de generacion y comportamientos inesperados en escenarios abiertos o fuera de distribucion.
- Las cuantizaciones Q3_K_S y Q2_K priorizan memoria y velocidad y pueden degradar la calidad frente a F16, Q8_0 y Q4_K_M.
- Solo se declaran ingles e italiano; no hay soporte documentado de castellano ni de otros idiomas.
- Longitud de contexto no documentada: no es posible planificar casos de uso con contexto largo sin validacion empirica.
- No hay informacion sobre sesgos, datos de entrenamiento ni procesos de alineamiento, lo que dificulta evaluar riesgos de contenido.
- Licencia Apache 2.0: permite uso comercial, pero al no haber evaluacion independiente, el uso en produccion requiere una bateria de pruebas propia.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validacion por terceros.
- No se documenta soporte de tool calling ni de agentes, lo que limita su integracion en pipelines automatizados.

## Enlaces

- Repositorio GGUF: https://huggingface.co/taiger7196/MrMaie-B1-GGUF
- Modelo base: https://huggingface.co/taiger7196/MrMaie-B1
- Space del autor: https://huggingface.co/spaces/taiger7196/MrMaie-AI-code-V1-GGUF
