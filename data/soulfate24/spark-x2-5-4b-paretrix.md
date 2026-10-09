# Soulfate24/Spark-X2.5-4B-Paretrix

## Resumen

Spark-X2.5-4B-Paretrix es una redistribucion cuantizada en formato GGUF del modelo XHToken/Spark-X2.5-4B, publicada por el usuario Soulfate24 dentro de su suite empirica de cuantizacion denominada Paretrix. No se trata de un modelo entrenado desde cero, sino de una receta de compresion que asigna anchos de bits de forma heterogenea por clase de tensor en funcion de la sensibilidad de activacion medida con `llama-imatrix`, en lugar de aplicar un unico esquema uniforme a toda la red. El modelo base es un LLM compacto de proposito general con 4.112.079.360 parametros (~4,1 mil millones), orientado a conversacion, redaccion, traduccion, razonamiento, codigo, uso de herramientas y flujos agenticos.

La relevancia de esta publicacion es practica: ofrece ocho variantes comprimidas con presupuestos que van desde 1664 MiB (Femto-21pc) hasta 3772 MiB (Fidelity-48pc), ademas de las cuantizaciones estandar de llama.cpp (Q8_0, Q6_K-imx, Q5_K_M-imx, IQ4_XS-imx, IQ3_M-imx) como referencia. Cada nivel se presenta con metricas de degradacion (PPL, KLD, RMS delta-p y coincidencia de top-p) para que el usuario pueda elegir el punto de la frontera de Pareto que mejor se ajuste a su presupuesto de memoria. La licencia Apache 2.0 y la compatibilidad con llama.cpp facilitan su despliegue tanto en servidor como en equipos de consumo.

El repositorio tiene 21,7 GB y, en la fecha de consulta, cero descargas y cero "likes", por lo que se trata de una publicacion reciente y sin validacion comunitaria independiente. La informacion sobre idiomas no aparece en la ficha de HuggingFace del modelo cuantizado, aunque la documentacion del modelo base de la serie Spark-X2.5 si menciona cobertura de mas de 200 idiomas y contexto nativo de hasta 1M de tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el autor no la detalla; se distribuye como LLM de generacion de texto compatible con transformers y llama.cpp) |
| Parametros totales | 4.112.079.360 (~4,11 mil millones) |
| Parametros activos | no disponible (no se ha confirmado que sea una arquitectura MoE) |
| Longitud de contexto | hasta 1M de tokens en el modelo base Spark-X2.5-4B, segun la documentacion de la serie; no confirmado para esta version cuantizada |
| Tipos de cuantizacion | GGUF estandar: Q8_0, Q6_K-imx, Q5_K_M-imx, IQ4_XS-imx, IQ3_M-imx. Tiers Paretrix hibridos: Fidelity-48pc (3772 MiB), Precision-42pc (3359 MiB), Quality-36pc (2838 MiB), Compact-33pc (2587 MiB), Mini-30pc (2343 MiB), Nano-27pc (2123 MiB), Pico-24pc (1982 MiB), Femto-21pc (1664 MiB) |
| Idiomas soportados | no disponible en la ficha del cuantizado; el modelo base declara mas de 200 idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); el repositorio contiene ademas pesos safetensors segun los metadatos de parametros |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base XHToken/Spark-X2.5-4B en los materiales consultados: no se especifica si es un transformer denso, un MoE, un modelo hibrido ni el tipo de atencion empleado. Lo unico confirmado es que se distribuye con soporte para la libreria transformers y que se ha convertido a GGUF para su uso con llama.cpp, lo que implica una topologia compatible con las operaciones habituales de ese motor (atencion por cabezas, capas FFN y embeddings estandar).

Respecto al entrenamiento, tampoco hay datos publicos sobre numero de tokens, composicion del dataset ni si se aplicaron fases de RLHF, DPO u otras tecnicas de alineamiento. La contribucion tecnica de esta publicacion concreta no esta en el entrenamiento, sino en el esquema de cuantizacion: Paretrix mide la sensibilidad real de activacion por clase de tensor mediante `llama-imatrix`, aprende tablas de tasa a partir de campanas entre arquitecturas y reparte el presupuesto de bits con objetivos exactos de tamano (recetas planas cuando la uniformidad gana y mochila calibrada por tasa cuando la heterogeneidad compensa). El resultado son tiers como Quality-36pc, que con 2838 MiB iguala en tamano a Q5_K_M-imx (2840 MiB) pero reduce el KLD de 0,0571 a 0,0437.

## Capacidades

- Generacion de texto conversacional y de proposito general: el modelo base esta disenado para dialogo, redaccion y resumen.
- Razonamiento y matematicas: la serie Spark-X2.5 declara resultados competitivos en tareas cotidianas de razonamiento entre modelos abiertos de su categoria.
- Generacion de codigo: incluida explicitamente entre las capacidades declaradas del modelo base.
- Traduccion y cobertura multilingue: mas de 200 idiomas segun la documentacion de la serie.
- Uso de herramientas (tool calling / function calling): declarado como capacidad soportada.
- Flujos agenticos y razonamiento multi-paso: el modelo base y los tags del repositorio (`agent`, `sparkx2_5`) apuntan a este caso de uso.
- Contexto largo: hasta 1M de tokens nativos en el modelo base, adecuado para documentos extensos y conversaciones multi-turno prolongadas.
- Compatibilidad con llama.cpp y con el ecosistema GGUF: permite inferencia en CPU, GPU o mixta, e integracion en servidores compatibles con la API de OpenAI (`endpoints_compatible` en los tags).
- Modo "thinking" o vision/audio: no disponible / no declarado en la informacion consultada.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede mantener conversaciones multi-turno con historial extenso, apoyandose en el contexto de hasta 1M de tokens del modelo base para conservar el hilo de incidencias largas sin resumir en exceso.
- Asistentes de codigo integrados en el IDE: con la variante Quality-36pc (2838 MiB) se puede ejecutar localmente en una GPU de consumo, ofreciendo autocompletado, explicacion de fragmentos y generacion de pruebas sin enviar codigo a servicios externos.
- Agentes autonomos con tool calling: el soporte declarado de uso de herramientas permite construir pipelines en los que el modelo decide que funcion invocar (busqueda, calculo, acceso a base de datos) y encadena varios pasos hasta completar la tarea.
- Traduccion y localizacion de contenido: con cobertura declarada de mas de 200 idiomas en el modelo base, encaja en flujos de traduccion de documentacion, correos o articulos, especialmente si se necesita procesar documentos completos de una sola pasada.
- Procesamiento de documentos largos: informes financieros, expedientes legales o manuales tecnicos que superan la ventana tipica de 8K-32K tokens se pueden analizar integramente gracias al contexto extendido, extrayendo resumenes, entidades y respuestas concretas.
- Despliegue en entornos con hardware limitado: la variante Femto-21pc (1664 MiB) permite ejecutar el modelo en portatiles sin GPU dedicada o en mini-PC con CPU, a costa de una degradacion de PPL notable (+6,3975 respecto a la referencia), util para prototipos y demos offline.
- Clasificacion y enrutado de tickets: con Mini-30pc (2343 MiB) o Nano-27pc (2123 MiB) es viable mantener varias instancias en una sola GPU para etiquetar, priorizar y derivar solicitudes en tiempo casi real.
- Generacion de contenido y copywriting: redaccion de borradores de blog, fichas de producto o correos, con la ventaja de que el modelo corre en local y la licencia Apache 2.0 permite uso comercial sin restricciones de peso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El unico conjunto de metricas publicado es el de calidad de cuantizacion de la suite Paretrix, medido sobre el propio modelo:

| Modelo (tier GGUF) | MiB | PPL | Delta PPL | KLD | RMS delta-p | top-p | Pareto |
|---|---:|---:|---:|---:|---:|---:|---|
| Q8_0 (stock) | 4172 | 19,9740 | -0,1394 | 0,0047 | 1,60 % | 97,3 % | si |
| Fidelity-48pc | 3772 | 20,0099 | -0,1035 | 0,0115 | 2,49 % | 95,3 % | si |
| Precision-42pc | 3359 | 19,7049 | -0,4085 | 0,0128 | 2,66 % | 95,0 % | si |
| Q6_K-imx (stock) | 3223 | 19,6832 | -0,4303 | 0,0173 | 3,02 % | 93,8 % | si |
| Q5_K_M-imx (stock) | 2840 | 20,8885 | +0,7751 | 0,0571 | 5,57 % | 89,4 % | dominado por Quality-36pc |
| Quality-36pc | 2838 | 20,0193 | -0,0941 | 0,0437 | 4,70 % | 90,4 % | si |
| Compact-33pc | 2587 | 20,6036 | +0,4902 | 0,0976 | 7,16 % | 86,1 % | si |
| Mini-30pc | 2343 | 21,3848 | +1,2714 | 0,1203 | 8,06 % | 84,6 % | si |
| IQ4_XS-imx (stock) | 2266 | 23,2522 | +3,1388 | 0,1678 | 9,45 % | 81,8 % | si |
| Nano-27pc | 2123 | 22,3853 | +2,2719 | 0,2498 | 11,35 % | 78,4 % | si |
| Pico-24pc | 1982 | 19,4291 | -0,6843 | 0,2812 | 12,30 % | 76,9 % | si |
| IQ3_M-imx (stock) | 1949 | 21,6523 | +1,5389 | 0,3635 | 14,23 % | 73,7 % | si |
| Femto-21pc | 1664 | 26,5109 | +6,3975 | 0,5799 | 17,22 % | 67,7 % | si |

Advertencias sobre esta tabla: no se especifica en la informacion disponible cual es la linea base contra la que se calculan Delta PPL y KLD, ni el corpus de evaluacion empleado. El valor de PPL de Pico-24pc aparece marcado con una daga (†) en la model card original, pero la nota al pie no se ha incluido en la informacion proporcionada, por lo que su significado es "no disponible". Estos numeros miden fidelidad respecto al modelo de referencia, no calidad absoluta en tareas.

## Requisitos de hardware

- VRAM estimada de pesos segun tier: 1664 MiB (Femto-21pc), 1949 MiB (IQ3_M-imx), 1982 MiB (Pico-24pc), 2123 MiB (Nano-27pc), 2266 MiB (IQ4_XS-imx), 2343 MiB (Mini-30pc), 2587 MiB (Compact-33pc), 2838 MiB (Quality-36pc), 2840 MiB (Q5_K_M-imx), 3223 MiB (Q6_K-imx), 3359 MiB (Precision-42pc), 3772 MiB (Fidelity-48pc) y 4172 MiB (Q8_0). Hay que sumar el espacio de la cache KV, que crece de forma lineal con la longitud de contexto.
- Modelo base sin cuantizar (fp16/bf16): los 4,11 mil millones de parametros ocupan aproximadamente 8,2 GB solo en pesos, por lo que se necesita una GPU de 12-16 GB para trabajar con comodidad.
- GPU recomendadas: para fp16, RTX 4080/4090, L4, L40S, A100 o H100. Para tiers intermedios (Compact-33pc, Quality-36pc, Q6_K, Precision-42pc, Fidelity-48pc), GPU de 8 GB como RTX 3060 Ti, RTX 4060 Ti o RTX 3070 son suficientes en la mayoria de escenarios con contextos moderados.
- Cabe en GPU de consumo: si. Los tiers Femto-21pc, IQ3_M-imx, Pico-24pc, Nano-27pc, IQ4_XS-imx y Mini-30pc se ajustan a GPU de 4-6 GB (GTX 1650, RTX 3050 6 GB, RTX 2060) e incluso a inferencia parcial en CPU con llama.cpp.
- Opciones de despliegue: llama.cpp y sus derivados (Ollama, LM Studio, llama-cpp-python); servidores con API compatible con OpenAI segun el tag `endpoints_compatible`; transformers para los pesos safetensors. No se menciona soporte explicito para vLLM o TGI en la informacion disponible.
- Latencia y throughput: no disponibles. Dependen del tier elegido, de si la inferencia es total o parcialmente en GPU y de la longitud de contexto efectiva; con ventanas cercanas a 1M de tokens la cache KV puede dominar el consumo de memoria.
- Nota sobre contexto largo: aunque el modelo base declare 1M de tokens, ejecutar esa ventana completa exige memoria para la cache KV muy superior a la de los pesos, por lo que en hardware de consumo se recomienda trabajar con ventanas reducidas o cuantizar la cache.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formatos | Notas |
|---|---:|---|---|---|---|
| Spark-X2.5-4B-Paretrix (este) | 4,11 mil millones | hasta 1M en el base (no confirmado en el cuantizado) | Apache 2.0 | GGUF, safetensors | 13 tiers de cuantizacion con metricas PPL/KLD publicadas |
| XHToken/Spark-X2.5-4B | 4,11 mil millones | hasta 1M | no disponible en la informacion consultada | safetensors (modelo original) | Modelo base de esta publicacion |
| Spark-X2.5-1.7B | no disponible | no disponible | no disponible en la informacion consultada | no disponible | Variante compacta de la misma serie, mencionada en el repositorio oficial |
| Soulfate24/Spark-X2.5-4B-ASHQ1-Remix-GGUF | 4,11 mil millones | no disponible | Apache 2.0 | GGUF | Cuantizacion alternativa del mismo base, publicada por el mismo autor |
| nassimjp/Spark-X2.5-4B | 4,11 mil millones | no disponible | no disponible | no disponible | Replica o copia del modelo base en HuggingFace |

No se dispone de datos de rendimiento ni de especificaciones comparables de modelos de terceros (por ejemplo, alternativas densas de ~3-4B) en la informacion proporcionada, por lo que no se puede establecer una comparativa de calidad frente a otras familias.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. No hay documentacion sobre composicion del dataset ni auditoria de sesgos del modelo base.
- Riesgo de alucinacion: no cuantificado en la informacion disponible. Como cualquier LLM de 4B, la tasa de invencion de hechos es previsiblemente mayor que en modelos de mayor tamano, especialmente en dominios especializados.
- Degradacion por cuantizacion: los tiers agresivos pierden fidelidad de forma acusada. Femto-21pc presenta un incremento de PPL de +6,3975 y un KLD de 0,5799; Nano-27pc, +2,2719 y 0,2498. Para tareas sensibles se recomienda Quality-36pc o superior.
- Metricas sin baseline documentada: la tabla de la model card no indica contra que referencia se calculan Delta PPL y KLD ni el corpus de evaluacion, lo que limita la interpretabilidad de los numeros.
- Valor atipico no explicado: PPL de Pico-24pc aparece con una daga sin nota al pie en la informacion disponible; conviene tratar ese dato con cautela.
- Idiomas: la ficha de HuggingFace del cuantizado no declara idiomas. La cobertura de mas de 200 idiomas proviene de la documentacion del modelo base y no ha sido verificada de forma independiente en esta version.
- Contexto largo en la practica: la ventana de 1M de tokens del modelo base no esta confirmada para el cuantizado y su uso real esta limitado por la memoria de la cache KV.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion con atribucion y conservacion del aviso de licencia. Verificar que el modelo base XHToken/Spark-X2.5-4B mantiene la misma licencia antes de un despliegue comercial.
- Madurez y soporte: el repositorio tiene cero descargas y cero "likes" en la fecha de consulta, sin issues ni validacion comunitaria. No hay garantia de mantenimiento ni de actualizaciones por parte del autor.
- Fechas: la ficha figura creada y actualizada el 8 de octubre de 2026, una fecha posterior a la informacion disponible sobre el modelo base; conviene contrastar la procedencia de los pesos antes de usarlos en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Soulfate24/Spark-X2.5-4B-Paretrix
- Modelo base Spark-X2.5-4B: https://huggingface.co/XHToken/Spark-X2.5-4B
- Suite de cuantizacion Paretrix: https://huggingface.co/Soulfate24/Paretrix_Quantization_Suite
- Cuantizacion alternativa del mismo autor (ASHQ1-Remix-GGUF): https://huggingface.co/Soulfate24/Spark-X2.5-4B-ASHQ1-Remix-GGUF
- Repositorio oficial de la serie Spark-X2.5: https://github.com/XHToken/Spark-X2.5
- Pagina de modelos y agentes de XHToken: https://xhtoken.ai/
- Pagina del modelo en Ollama: https://ollama.com/SparkLLM/Spark-X2.5-4B
- Replica del modelo base en HuggingFace: https://huggingface.co/nassimjp/Spark-X2.5-4B
