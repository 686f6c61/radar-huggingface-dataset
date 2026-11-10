# vdthcmus123/datamate-gemma4-12b-lora-v5

## Resumen

DataMate v5 es un adaptador LoRA entrenado sobre el modelo base `google/gemma-4-12B-it`, desarrollado por el usuario `vdthcmus123` para el track SLM (Small Language Model) del Zalo AI Challenge 2026. No es un modelo independiente, sino un adaptador PEFT que debe cargarse junto al modelo base de Google y, de forma crítica, junto al código fuente del sistema DataMate (prompt de `datamate/agent.py`, toolkit `T` de `datamate/toolkit.py` y su sandbox de ejecución). Su función es traducir preguntas en vietnamita sobre datos de ventas de una pequeña tienda (con abreviaturas, teencode, sin diacríticos o variantes dialectales) a programas Python cortos que calculan la respuesta usando el toolkit `T`.

El adaptador no genera la respuesta numérica directamente: produce código que se ejecuta en un sandbox. El sistema completo genera cinco programas por pregunta, los ejecuta, vota entre resultados y contrasta con un sistema de reglas. Esta arquitectura híbrida (modelo más reglas más ejecución de código) es la que alcanza la métrica reportada de 0,89 en Penalized Accuracy sobre el test público.

La relevancia del proyecto es acotada: se trata de un adaptador de competición, con 0 descargas y 0 likes en el momento de la ficha, publicado en noviembre de 2026, monolingüe en vietnamita y sin licencia explícita propia más allá de los términos del modelo base. Es útil como referencia de técnica (LoRA sobre un modelo de 12B para text-to-code con validación por ejecución), no como componente listo para producción general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only `google/gemma-4-12B-it` |
| Parametros totales | No disponible para el adaptador (el modelo base es de 12B; el repo pesa 0,6 GB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el entrenamiento uso max_len 6144) |
| Tipos de cuantizacion | No disponible (el ejemplo de uso emplea bfloat16) |
| Idiomas soportados | Vietnamita (vi) |
| Licencia | No disponible como licencia propia; sujeta a los terminos de uso de `google/gemma-4-12B-it` |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

Parametros del adaptador segun la model card: r = 32, alpha = 64, dropout 0,05, aplicado a las proyecciones q/k/v/o/gate/up/down.

## Arquitectura y entrenamiento

El adaptador se aplica sobre `google/gemma-4-12B-it`, un transformer decoder-only de 12B parametros del que no se detallan mas especificaciones en la informacion disponible. El LoRA emplea rango 32 y alpha 64 con dropout 0,05 sobre las proyecciones de atencion (q, k, v, o) y las proyecciones del bloque feed-forward (gate, up, down). El entrenamiento se realizo continuando desde el adaptador v4, con 1 epoca, learning rate 5e-5, longitud maxima de 6144 tokens y batch efectivo de 16 (batch 2 x acumulacion 8).

El dataset combina 8.670 ejemplos del conjunto de entrenamiento de la competicion (programas etiquetados verificados como correctos, con variantes de pregunta generadas automaticamente) y 5.503 ejemplos sinteticos de tiendas pertenecientes a 12 sectores, tambien autogenerados. La model card declara explicitamente que no se usaron los conjuntos public ni private test. La innovacion tecnica no esta en el modelo sino en el pipeline: generacion de cinco programas por pregunta, ejecucion en sandbox, votacion entre resultados y validacion contra un sistema de reglas.

## Capacidades

- Generacion de codigo Python corto sobre el toolkit `T` del sistema DataMate a partir de preguntas en vietnamita.
- Comprension de vietnamita coloquial: abreviaturas, teencode, texto sin diacriticos y variantes dialectales.
- Table question answering orientado a datos de ventas de pequenas tiendas (ingresos, pedidos, productos, sectores).
- Generacion de texto conversacional y respuesta a instrucciones heredada del modelo base (pipeline declarado: text-generation).
- Integracion con transformers y PEFT; soporte de despliegue con vLLM mediante `--enable-lora`.
- No genera la respuesta numerica directamente: su salida es codigo que debe ejecutarse en el sandbox de DataMate.
- No se documentan capacidades de tool calling generico, agentes multi-paso, vision ni audio en la informacion disponible.

## Casos de uso

- Analitica conversacional para pequenos comercios: el adaptador traduce preguntas como "¿cuanto vendi el mes pasado?" a un programa Python que consulta los datos de la tienda mediante el toolkit `T`, lo que permite ofrecer consultas en lenguaje natural sin construir un motor de BI completo.
- Normalizacion de lenguaje coloquial vietnamita: al estar entrenado con teencode, abreviaturas y texto sin diacriticos, puede usarse como capa de interpretacion de preguntas de usuarios reales antes de pasarlas a un sistema de consulta estructurado.
- Referencia para pipelines text-to-code con validacion por ejecucion: el patron de generar cinco programas, ejecutarlos en sandbox y votar es replicable en otros dominios donde la correccion del resultado sea verificable.
- Investigacion en adaptadores LoRA de dominio: sirve como caso de estudio de ajuste fino de un modelo de 12B con 14.000 ejemplos aproximadamente para una tarea estrecha, con receta de hiperparametros documentada.
- Evaluacion de sistemas hibridos modelo mas reglas: util para medir cuanto aporta el modelo frente al sistema de reglas en una tarea de calculo sobre datos tabulares.
- Prototipado de asistentes de datos multilingues de bajos recursos: el enfoque puede trasladarse a otras lenguas con abundante lenguaje informal, sustituyendo el toolkit y el dataset.

## Benchmarks y rendimiento

| Metrica | Resultado | Contexto |
|---|---|---|
| Penalized Accuracy (test publico) | 0,89 | Sistema completo: modelo + sistema de reglas + sandbox |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. La unica metrica reportada corresponde al test publico de la competicion e incluye el sistema de reglas, por lo que no aisla la contribucion del adaptador.

## Requisitos de hardware

- El adaptador pesa 0,6 GB, pero requiere cargar el modelo base de 12B en bfloat16, lo que implica aproximadamente 24 GB de VRAM solo para los pesos.
- GPU recomendadas: A100 40/80 GB, H100 o L40S para inferencia comoda en bfloat16; una RTX 4090 (24 GB) queda al limite y probablemente exija cuantizacion o descarga parcial de capas.
- En GPUs de consumo con 16 GB o menos (RTX 4080, 4070 Ti) seria necesario cuantizar el modelo base, algo no documentado para este adaptador.
- Despliegue: transformers con PEFT (`PeftModel.from_pretrained`), vLLM con `--enable-lora --lora-modules dmlora=<directorio>` y la integracion propia `HFLocalLLM(base, adapter=...)` del sistema DataMate.
- El prompt debe construirse obligatoriamente con `datamate.agent.build_messages(T, question, ver=2)`; sin ese formato el adaptador no funciona segun lo previsto.
- Latencia y throughput: no disponibles. El sistema genera cinco programas por pregunta y los ejecuta en sandbox, lo que multiplica el coste por consulta respecto a una generacion simple.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DataMate v5 (este) | 12B base + LoRA r=32 | No disponible (entreno a 6144) | Text-to-code sobre toolkit propio, vietnamita | Sujeta a Gemma | Hugging Face, 0 descargas |
| Modelo base `google/gemma-4-12B-it` | 12B | No disponible | Generacion generalista e instrucciones | Terminos de Gemma | Hugging Face |
| Adaptadores LoRA de dominio comparables | Variable | Variable | Ajuste fino de tarea especifica | Variable | No disponible |

No se dispone de datos de benchmarks comparables con alternativas de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Dependencia total del codigo DataMate: el adaptador solo funciona con el prompt, el toolkit `T` y el sandbox del proyecto; fuera de ese entorno su utilidad es nula.
- Monolingue en vietnamita; no se documenta soporte de otros idiomas.
- No responde con cifras directamente: cualquier uso requiere ejecutar el codigo generado y validar el resultado.
- Licencia no explicitada: la model card remite a los terminos de uso de `google/gemma-4-12B-it`, por lo que las restricciones comerciales del modelo base se heredan.
- Riesgo de alucinacion en el codigo generado: el pipeline lo mitiga con votacion entre cinco programas y contraste con reglas, pero un uso sin ese mecanismo elevado el riesgo de resultados incorrectos.
- Entrenado con datos sinteticos autogenerados y del conjunto de entrenamiento de la competicion; puede generalizar mal a dominios de tienda o vocabulario fuera de esa distribucion.
- Metrica de 0,89 no desagregada: no permite saber el rendimiento del adaptador por separado del sistema de reglas.
- Proyecto de competicion con 0 descargas y 0 likes; sin mantenimiento ni comunidad documentada.
- No se documentan sesgos especificos, pero al entrenar sobre lenguaje informal vietnamita puede reproducir variaciones dialectales o expresiones coloquiales inadecuadas en contextos formales.

## Enlaces

- Hugging Face: https://huggingface.co/vdthcmus123/datamate-gemma4-12b-lora-v5
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- No se han encontrado en la busqueda web papers, blogs, repositorios ni demos adicionales del adaptador.
