# wrldsuksgo2mars/DeepSeek-V4.1-EXL3-K3.25-v1

## Resumen

DeepSeek-V4.1-EXL3-K3.25-v1 es un checkpoint cuantizado del modelo `deepseek-ai/DeepSeek-V4.1-Flash`, publicado por el usuario wrldsuksgo2mars. No es un modelo entrenado desde cero, sino una cuantización de solo pesos (weight-only) de tipo EXL3 con precision mixta K3/K4 aplicada exclusivamente a las proyecciones de expertos enrutados (routed experts). El objetivo es reducir el coste de almacenamiento y de memoria de un modelo MoE de 319.560.051.922 parametros totales, manteniendo las matrices no enrutadas en su representacion original.

El checkpoint ocupa 441,4 GB en safetensors y requiere, segun el propio autor, soporte especifico para la arquitectura V4.1, para los pesos no enrutados nativos, para las proyecciones EXL3 y para los bloques dSpark. Esto implica que ni Transformers estandar ni motores de inferencia existentes pueden ejecutarlo sin trabajo de integracion previo. El autor declara explicitamente que no se han publicado benchmarks, que no se reclama compatibilidad con loaders estandar y que la calidad de comportamiento, los prompts normales y las tool calls permanecen sin validar.

La relevancia actual del checkpoint es, por tanto, la de una pieza de investigacion en cuantizacion extrema de MoE: documenta una receta reproducible (EXL3 mixta con asignacion de bits guiada por masa de router) sobre un modelo de mas de 300.000 millones de parametros, con licencia MIT y con el codigo del flujo de trabajo publicado en un fork de GPTQModel.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE de expertos enrutados (tag `deepseek_v41`), con bloques dSpark; detalles completos de la arquitectura no disponibles |
| Parametros totales | 319.560.051.922 (319,6 B) |
| Parametros activos | no disponible (modelo MoE; el numero de expertos activos por token no se especifica) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 mixta K3/K4 solo en proyecciones enrutadas; 3,25 bits por peso de media en las matrices enrutadas (excluye escalas y otro overhead de empaquetado) |
| Idiomas soportados | no disponible |
| Licencia | MIT (el autor remite a `LICENSE` para la licencia del modelo fuente) |
| Formato de pesos | safetensors con indice de pesos de Hugging Face; `quantize_config.json` con la configuracion EXL3 por proyeccion |

Datos adicionales de la receta: 40 bloques del modelo principal con 384 expertos cada uno, mas 3 bloques dSpark con 128 expertos cada uno (15.744 expertos enrutados en total). Se cuantizan 47.232 proyecciones: 35.424 en K3 y 11.808 en K4.

## Arquitectura y entrenamiento

Este repositorio no contiene entrenamiento alguno. Se trata de una cuantizacion post-entrenamiento del checkpoint `deepseek-ai/DeepSeek-V4.1-Flash`, revision fuente `dba1be0a40aa45a94ad051997016db3960a90277`. La innovacion tecnica esta en la receta de cuantizacion: las proyecciones gate, up y down de todos los expertos enrutados se cuantizan en EXL3 con precision mixta, mientras que los tensores no enrutados conservan su representacion original. La asignacion K4 se decide ordenando el error de reconstruccion de la base K3 ponderado por la masa cuadratica natural del router-gate, con cuotas de asignacion gate:up:down de 3:5:8 por bloque. El resultado es una media de 3,25 bits por peso en las matrices enrutadas.

La calibracion usa el corpus GLM-5.3 EXL3 NEXT sin modificar: 1.441 registros originales, 1.056.269 tokens con el tokenizador de este checkpoint. Para los bloques dSpark se emplean 327.680 anclas estratificadas fijas (semilla 20260809), agrupadas conjuntamente por prompt original. La propagacion de los pesos mixtos seleccionados es capa por capa. La generacion de activaciones y la busqueda trellis se ejecutan sobre dos GPUs RTX y cuatro workers Spark. No se documenta en la informacion disponible ningun proceso de RLHF, DPO u optimizacion posterior: el checkpoint es puramente una transformacion de pesos del modelo base.

En cuanto al almacenamiento, cada tabla PLE y sus escalas ocupan un grupo de shards aislado, separado de la otra tabla y del resto de tensores; un grupo PLE puede abarcar varios ficheros, pero los tensores no se dividen. El autor indica que estos grupos pueden reutilizarse mediante enlaces duros para construir variantes posteriores.

## Capacidades

- Generacion de texto y razonamiento: heredadas del modelo base `DeepSeek-V4.1-Flash`, pero sin validar en este checkpoint.
- Codigo y matematicas: capacidades del modelo fuente, no verificadas tras la cuantizacion.
- Tool calling / function calling: el autor afirma explicitamente que las tool calls permanecen sin validar pendiente de la integracion con un motor de inferencia.
- Agentes y razonamiento multi-paso: no validado en este checkpoint.
- Capacidades multilingues: no disponibles; el repositorio no declara idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponibles en la informacion proporcionada.
- Capacidad real y verificada hoy: servir como artefacto de investigacion reproducible para estudiar cuantizacion EXL3 mixta de MoE a gran escala.

## Casos de uso

- Investigacion en cuantizacion de MoE: reproducir la receta del flujo `ds41rt` y analizar como la ponderacion por masa de router-gate reparte bits entre proyecciones gate, up y down en 40 bloques de 384 expertos.
- Estudio del compromiso precision-memoria en 3 bits: comparar la reconstruccion K3 frente a K4 en las 11.808 proyecciones asignadas a K4 y medir el impacto en perplejidad una vez exista un motor compatible.
- Despliegue autoalojado de un modelo de 320 B en hardware con memoria limitada: con 441,4 GB en disco, el checkpoint es aproximadamente un 30-35 % mas pequeno que una representacion bf16 equivalente, lo que puede hacerlo viable en nodos de 8 GPUs donde la version completa no entraria.
- Ingenieria de motores de inferencia: implementar y depurar los kernels EXL3 y el soporte de arquitectura V4.1 mas dSpark necesarios para cargar el checkpoint, como paso previo a cualquier uso productivo.
- Archivado y distribucion de checkpoints a gran escala: el autor documenta el uso de grupos de shards aislados para las tablas PLE y la reutilizacion por enlaces duros, patron util para pipelines de publicacion de variantes.
- Evaluacion comparativa de calidad post-cuantizacion: generar un conjunto de evaluacion propio (perplejidad, tareas de codigo, tool calling) y medirlo contra el modelo base sin cuantizar, dado que el autor no aporta benchmarks.
- Servicio interno de generacion de texto con requisitos de residencia de datos: una vez validado el motor, el checkpoint puede ejecutarse en infraestructura propia sin depender de APIs externas, con licencia MIT.
- Experimentacion con agentes multi-paso: solo despues de que la integracion con el motor de inferencia confirme que el tool calling no se ha degradado, algo que hoy no esta verificado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica de forma explicita que el flujo de publicacion valida inventarios de tensores, geometria de buffers empaquetados, cuotas de bits por bloque y consistencia de shards, indice y configuracion, pero que no realiza una reproduccion completa del modelo ni conserva datos de calibracion para hacerla. Tampoco se reclaman resultados de benchmarks ni compatibilidad con loaders estandar.

## Requisitos de hardware

- VRAM estimada para inferencia: a partir del tamano del repositorio (441,4 GB solo de pesos), se necesita un minimo de aproximadamente 450 GB de memoria de acelerador para pesos, mas overhead de escalas, cache KV y activaciones. Estimacion orientativa, no dato publicado.
- GPU recomendadas: configuraciones de 8xH100 80 GB (640 GB), 8xH200 141 GB o similares. Un nodo de 4xH100 80 GB (320 GB) no seria suficiente.
- GPU de consumo: no cabe. Ni una RTX 4090 (24 GB) ni un agregado de cuatro (96 GB) se acercan al tamano del checkpoint.
- Opciones de despliegue: ninguna estandar. vLLM, llama.cpp, Ollama o TGI no soportan este checkpoint tal cual. Se requiere un motor con soporte de V4.1, pesos no enrutados nativos, proyecciones EXL3 y bloques dSpark. El codigo de inferencia incluido en el repositorio es una referencia arquitectonica, no una implementacion de serving EXL3.
- Latencia y throughput estimados: no disponibles.
- Nota sobre el flujo de cuantizacion: la generacion de activaciones y la busqueda trellis se hicieron sobre dos GPUs RTX y cuatro workers Spark; ese dato describe el proceso de cuantizacion, no los requisitos de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| wrldsuksgo2mars/DeepSeek-V4.1-EXL3-K3.25-v1 | 319,6 B | no disponible | EXL3 mixta K3/K4, 3,25 bits/peso en enrutados | MIT | Safetensors, requiere motor con soporte V4.1 + EXL3 + dSpark |
| deepseek-ai/DeepSeek-V4.1-Flash (modelo base) | no disponible | no disponible | sin cuantizar (representacion original) | no disponible en la informacion proporcionada | Modelo fuente; el repo cuantizado remite a su `LICENSE` |
| Otras variantes EXL3 de la misma familia (`ds41rt`) | no disponible | no disponible | EXL3 | no disponible | No se aportan datos en la informacion disponible |

No se dispone de datos de rendimiento ni de contexto de los modelos comparables dentro de la informacion proporcionada, por lo que la comparativa se limita a parametros, formato, licencia y via de despliegue.

## Limitaciones y advertencias

- Sin benchmarks: no hay resultados de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion. Cualquier afirmacion de rendimiento seria una extrapolacion del modelo base, no un dato de este checkpoint.
- Calidad de comportamiento sin validar: el autor senala que los prompts normales y las tool calls no se han validado.
- Sin reproduccion completa del modelo: el flujo de publicacion valida inventarios y geometria de buffers, pero no ejecuta una pasada completa de inferencia.
- Compatibilidad rota con tooling estandar: Transformers de stock, vLLM, llama.cpp, Ollama y TGI no pueden cargar el checkpoint sin desarrollo adicional.
- Las capacidades descritas en `README.source.md` corresponden al modelo fuente y no constituyen resultados de validacion de esta cuantizacion.
- Riesgo de degradacion por cuantizacion: las proyecciones enrutadas se almacenan a 3,25 bits por peso de media, una tasa agresiva en un MoE; el impacto real en calidad no esta medido.
- Sin datos de idioma: no se declaran idiomas soportados, por lo que no puede asumirse cobertura multilingue verificada.
- Sin datos de sesgo ni de alucinacion: no hay evaluaciones de sesgo, toxicidad o tasas de alucinacion en la informacion disponible.
- Licencia: el repositorio declara MIT, pero el propio autor remite a `LICENSE` para la licencia del modelo fuente; conviene verificar las condiciones del modelo base antes de un uso comercial.
- Adopcion nula verificada: 0 descargas y 0 likes en el momento de la consulta, sin senales de uso en produccion por terceros.
- Busqueda web sin resultados relevantes: las consultas asociadas devolvieron unicamente sitios de apuestas hipicas, sin ninguna relacion con el modelo.

## Enlaces

- Hugging Face (este checkpoint): https://huggingface.co/wrldsuksgo2mars/DeepSeek-V4.1-EXL3-K3.25-v1
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash
- Fork de GPTQModel con soporte V4.1: https://github.com/tpurtell/GPTQModel
- Flujo de cuantizacion reproducible ds41rt: https://github.com/tpurtell/ds41rt/tree/main/quantization
- Revision fuente del modelo base: `dba1be0a40aa45a94ad051997016db3960a90277`
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo (los resultados devueltos corresponden a sitios de carreras de caballos y no guardan relacion).
