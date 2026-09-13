# wepiqx/OxCoder-9B-MERNIK-GGUF

## Resumen

OxCoder-9B-MERNIK-GGUF es un repositorio de cuantizaciones GGUF publicado por el usuario wepiqx sobre el modelo base OrionLLM/OxCoder-9B, un finetune orientado a codigo agentico construido sobre Qwen3.5-9B con una ventana de contexto declarada de 262K tokens. El repositorio no contiene un modelo entrenado desde cero, sino una distribucion de pesos cuantizados preparada para su uso con llama.cpp y herramientas compatibles.

La particularidad del proyecto es el metodo de cuantizacion denominado MERNIK, descrito por el autor como una asignacion de precision mediante cola de prioridad guiada por matrices imatrix (calibracion de importancia por activaciones), evaluada simultaneamente con tres criterios: perplejidad sobre un conjunto canary, divergencia KL frente a la referencia y tareas puntuadas. El autor menciona una matriz de calibracion de 6500/5100 elementos y una comparativa entre finetunes sobre la misma base Qwen3.5.

En el momento de redactar esta ficha, la model card indica explicitamente que los cuantizados y los resultados todavia no estan publicados ("coming soon"), por lo que el repositorio funciona como anuncio y contenedor de resultados futuros mas que como artefacto listo para produccion. No hay pesos descargables, no hay tabla de benchmarks y el contador de descargas es cero. La relevancia actual es, por tanto, la de un experimento de metodologia de cuantizacion, no la de un modelo desplegable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (el modelo base se describe como finetune de Qwen3.5-9B; no se detalla la arquitectura interna) |
| Parametros totales | Aproximadamente 9.000 millones (segun la denominacion del modelo base; no se confirma en la informacion proporcionada) |
| Parametros activos | No aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | 262.000 tokens (262K, segun la model card del repositorio) |
| Tipos de cuantizacion | GGUF con imatrix y "hybrid quantization" (metodo MERNIK); los niveles concretos de cuantizacion no estan publicados |
| Idiomas soportados | Ingles (etiqueta `en` en los metadatos) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (libreria `gguf`, orientado a llama.cpp) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura del modelo base en los datos proporcionados. La model card del repositorio de cuantizacion describe OrionLLM/OxCoder-9B como un finetune de Qwen3.5-9B orientado a codigo agentico, con 262K tokens de contexto. No se especifica el numero de parametros exacto, la composicion del dataset de entrenamiento, el volumen de tokens utilizados ni si se aplicaron tecnicas de alineacion como RLHF, DPO o RLVR.

El unico elemento tecnico distintivo documentado es el propio proceso de cuantizacion MERNIK, que el autor define como una asignacion de precision por cola de prioridad guiada por imatrix y validada con tres metricas complementarias: perplejidad sobre un conjunto canary, divergencia KL respecto al modelo de referencia en precision completa y tareas puntuadas (entre ellas HumanEval, segun las etiquetas del repositorio). Se menciona ademas una matriz de calibracion de 6500/5100 elementos y una comparacion directa entre finetunes sobre la misma base Qwen3.5. No se han publicado ni los artefactos resultantes ni los numeros de dichas mediciones.

## Capacidades

- Generacion de texto y de codigo, heredadas del modelo base OrionLLM/OxCoder-9B, segun la descripcion del autor.
- Razonamiento agentico multi-paso: la model card califica el modelo base como "agentic coding finetune".
- Manejo de contexto largo de hasta 262K tokens, lo que permite procesar repositorios o conversaciones extensas en una sola ventana.
- Evaluacion orientada a codigo: la etiqueta `humaneval` sugiere que el autor mide capacidad de sintesis de funciones sobre ese benchmark, aunque no se publican resultados.
- Soporte de tool calling y function calling: no confirmado en la informacion disponible.
- Capacidades multilingues: limitadas al ingles segun los metadatos; no se declara soporte de castellano ni de otros idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponibles en la informacion proporcionada.

## Casos de uso

- Asistencia de codigo en editor o IDE: el modelo base esta afinado para codigo, y la ventana de 262K tokens permite cargar varios ficheros de un mismo modulo como contexto para autocompletado o refactorizacion.
- Analisis de repositorios completos: con 262K tokens de contexto se pueden incluir arboles de directorios, ficheros de configuracion y varios modulos para tareas de auditoria o explicacion de arquitectura.
- Despliegue local en estaciones de trabajo: al distribuirse en GGUF sobre llama.cpp, el objetivo es ejecucion en GPU de consumo o incluso CPU con cuantizaciones agresivas, sin depender de APIs externas.
- Generacion de codigo en pipelines de CI/CD: su tamano de 9B y formato GGUF permiten integrarlo en runners con GPU dedicada para tareas de generacion de tests o parches, siempre que se confirme el soporte de tool calling.
- Evaluacion comparativa de metodos de cuantizacion: el repositorio esta pensado como banco de pruebas del protocolo MERNIK frente a cuantizaciones de referencia, util para equipos que investigan degradacion por cuantizacion.
- Migracion de prototipos a produccion con licencia permisiva: la licencia Apache-2.0 permite uso comercial, a diferencia de otros pesos con licencias restrictivas, lo que facilita su incorporacion en productos internos.
- Investigacion en compresion de modelos: la combinacion de PPL, KLD y tareas puntuadas como criterio de seleccion de precision es un caso de estudio replicable en otros modelos.

Nota: al no existir pesos publicados en el momento de redactar esta ficha, ninguno de estos casos puede ejecutarse todavia con este repositorio concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que las mediciones de perplejidad, divergencia KL y tareas puntuadas (incluida HumanEval) estan en proceso, y que los resultados se publicaran en la misma pagina.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa para un modelo denso de ~9B parametros en GGUF, una cuantizacion de 4 bits ocuparia en torno a 5-6 GB de pesos y una de 8 bits en torno a 9-10 GB; estas cifras son estimaciones derivadas del tamano, no datos publicados por el autor.
- GPU recomendadas: no especificadas. Por tamano, el modelo seria desplegable en GPUs de consumo recientes con 12-16 GB o mas de VRAM en cuantizaciones bajas, y en GPUs profesionales (A100, H100, L40S) para cuantizaciones altas y contextos largos.
- Compatibilidad con GPU de consumo: probable en cuantizaciones de 4-6 bits si el modelo final se mantiene en torno a 9B parametros, pero no confirmado.
- Opciones de despliegue: llama.cpp y cualquier runtime compatible con GGUF (Ollama, LM Studio, kobold.cpp). vLLM y TGI no son los formatos objetivo del repositorio, aunque podrian usarse si se publican pesos en safetensors.
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Estado |
|---|---|---|---|---|---|
| wepiqx/OxCoder-9B-MERNIK-GGUF | ~9B (segun modelo base) | 262K | Apache-2.0 | GGUF | Cuantizados no publicados |
| OrionLLM/OxCoder-9B | ~9B | 262K | No disponible en la informacion proporcionada | No disponible | Modelo base de referencia |
| wepiqx/NeoHorse-1-9B-MERNIK-GGUF | ~9B | No disponible | No disponible | GGUF | Mismo protocolo MERNIK, citado por el autor |

No se dispone de datos de rendimiento comparativos entre estos modelos en la informacion proporcionada, por lo que la comparacion se limita a parametros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- El repositorio no contiene pesos descargables en el momento de la consulta: la model card indica "coming soon" para los cuantizados y los resultados.
- No hay resultados de benchmarks publicados, por lo que no es posible verificar la calidad del modelo ni la degradacion introducida por la cuantizacion.
- La metodologia MERNIK esta descrita de forma resumida por su propio autor; no se ha sometido a revision por pares ni se han publicado detalles reproducibles mas alla de la matriz de calibracion mencionada.
- Idioma: unicamente ingles declarado. El rendimiento en castellano no esta documentado y no deberia asumirse.
- Riesgo de alucinacion: inherente a los modelos generativos de este tamano; no hay evaluaciones de fidelidad publicadas.
- Sesgos: no se han publicado analisis de sesgos ni de composicion del dataset de entrenamiento del modelo base.
- Licencia: Apache-2.0 en este repositorio, permisiva para uso comercial, pero conviene verificar la licencia efectiva del modelo base OrionLLM/OxCoder-9B, que no consta en la informacion proporcionada.
- Contexto largo: aunque se declaran 262K tokens, no se han publicado pruebas de recuperacion de informacion (needle-in-a-haystack) que confirmen dicho rendimiento en la practica.
- Fechas de creacion y actualizacion del repositorio (2026-09-13) resultan posteriores a la fecha habitual de consulta; conviene verificar la vigencia del contenido antes de citarlo.
- El repositorio tiene 0 descargas y 1 like, lo que indica ausencia de validacion por parte de la comunidad.
- La busqueda web asociada no devolvio ningun resultado relevante sobre este modelo: los enlaces recuperados correspondian a servicios de reparto de pizza y no guardan relacion con el contenido solicitado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/wepiqx/OxCoder-9B-MERNIK-GGUF
- Modelo base: https://huggingface.co/OrionLLM/OxCoder-9B
- Metodo y protocolo MERNIK: https://huggingface.co/wepiqx/MERNIK
- Repositorio con el mismo protocolo, citado por el autor: https://huggingface.co/wepiqx/NeoHorse-1-9B-MERNIK-GGUF
- Papers, blogs, repositorios o demos adicionales: no disponible (la busqueda web no devolvio resultados relevantes)
