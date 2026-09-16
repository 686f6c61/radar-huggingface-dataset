# yuhengtu-bytedance/DataDecide-dclm-baseline-50p-dolma1.7-50p-1B-32500_35000_37500_40000_42500_weightedavg_merge

## Resumen

Este repositorio contiene un modelo de lenguaje de arquitectura Llama con 1.279.854.592 parametros (aproximadamente 1,28 mil millones), publicado por el usuario yuhengtu-bytedance. No es un modelo entrenado desde cero, sino el resultado de promediar los pesos de cinco checkpoints intermedios del mismo entrenamiento mediante la tecnica de model merging, concretamente el metodo Linear (promedio ponderado normalizado) implementado en mergekit. Los checkpoints de origen pertenecen a una ejecucion de preentrenamiento denominada dclm-baseline-50p-dolma1.7-50p, es decir, una mezcla al 50 por ciento del dataset DCLM-baseline y al 50 por ciento de Dolma 1.7, en la escala de 1B de parametros.

La relevancia de este artefacto es fundamentalmente metodologica: forma parte del ecosistema de investigacion DataDecide, orientado a medir como la seleccion de datos de preentrenamiento afecta al rendimiento final, y este merge concreto explora si promediar checkpoints consecutivos (pasos 32.500, 35.000, 37.500, 40.000 y 42.500, con pesos 1, 2, 3, 4 y 5 respectivamente) produce una curva de escalado mas limpia o un punto de referencia mas estable que un unico checkpoint final. El modelo no tiene model card descriptiva mas alla de la configuracion YAML del merge, no declara licencia, idiomas ni longitud de contexto, y no registra descargas ni valoraciones en el momento de la consulta.

Se trata, por tanto, de un modelo base (no ajustado por instrucciones) pensado para experimentacion y evaluacion comparativa, no para uso directo en produccion conversacional. Su tamano lo hace ejecutable en hardware de consumo, lo que facilita reproducir experimentos de merging y de seleccion de datos a bajo coste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Llama (tag `llama` en HuggingFace; pesos compatibles con `LlamaForCausalLM`) |
| Parametros totales | 1.279.854.592 (dato extraido de los safetensors) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible oficialmente; al ser pesos bfloat16 estandar de Llama, son convertibles a GGUF/AWQ/GPTQ con herramientas externas |
| Idiomas soportados | No disponible en los metadatos. Los datasets de origen (DCLM-baseline y Dolma 1.7) son mayoritariamente en ingles |
| Licencia | No disponible |
| Formato de pesos | safetensors (salida del merge en `bfloat16`, calculo interno en `float32`) |
| Tamano del repositorio | 2,6 GB |
| Metodo de creacion | mergekit, metodo `linear` con `normalize: true` |
| Compatibilidad de despliegue | `transformers`, `text-generation-inference`, endpoints compatibles (tags del repo) |
| Descargas / likes | 0 / 0 |
| Fecha de creacion (metadatos) | 2026-09-15 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama, un transformer decoder-only con atencion causal y normalizacion RMSNorm, en su variante de aproximadamente 1,28B de parametros. El repositorio no incluye una descripcion del entrenamiento original: no se documenta el numero total de tokens vistos, la composicion exacta del dataset mas alla del nombre dclm-baseline-50p-dolma1.7-50p, ni si hubo fases de RLHF, DPO o ajuste por instrucciones. Dado el nombre de los checkpoints (dclm-baseline-50p-dolma1.7-50p) y su vinculacion al programa DataDecide, lo mas plausible es que se trate de un preentrenamiento puro sobre una mezcla equilibrada de DCLM-baseline y Dolma 1.7, sin post-entrenamiento alineador, aunque esto no puede confirmarse con la informacion disponible.

La innovacion tecnica de este artefacto no reside en la arquitectura, sino en el procedimiento de construccion. Se aplica el metodo Linear de mergekit, que realiza una media ponderada de los tensores de los checkpoints participantes, con normalizacion de pesos. La configuracion declara explicitamente los cinco modelos de origen con pesos 1, 2, 3, 4 y 5 (correspondientes a los pasos 32.500, 35.000, 37.500, 40.000 y 42.500), tomando el checkpoint del paso 42.500 como `base_model`. El calculo se ejecuta en float32 y se serializa en bfloat16, lo que explica que el repositorio ocupe 2,6 GB para 1,28B de parametros. El metodo esta inspirado en el articulo de model soups referenciado en las etiquetas del repositorio (arXiv:2203.05482), que demuestra que promediar pesos de modelos con el mismo origen de inicializacion puede mejorar la robustez sin coste adicional de inferencia.

## Capacidades

- Generacion de texto autoregresiva basica: al ser un modelo base, completa secuencias a partir de un prefijo, sin formato conversacional ni plantilla de chat.
- Modelado de lenguaje y calculo de perplejidad: util para evaluar distribuciones de lenguaje natural sobre corpus de validacion.
- Razonamiento y conocimiento factual limitados: no hay evidencia publicada de capacidades emergentes de razonamiento, matematicas o codigo en esta escala concreta, y no se han publicado benchmarks.
- Tool calling / function calling: no disponible; no hay plantilla de herramientas ni ajuste especifico.
- Soporte de agentes y razonamiento multi-paso: no disponible; el modelo no ha sido entrenado para seguir instrucciones ni para planificar.
- Capacidades multilingues: no declaradas. La composicion de los datasets de origen sugiere un sesgo fuerte hacia el ingles.
- Capacidades especiales: no se documenta modo de razonamiento explicito (thinking), vision, audio ni decodificacion especulativa.
- Reutilizacion como punto de partida: al estar en formato `transformers`/safetensors, admite ajuste fino supervisado, LoRA o continuacion del preentrenamiento con las herramientas habituales.

## Casos de uso

- Investigacion en seleccion de datos de preentrenamiento: el modelo sirve como punto de referencia dentro del programa DataDecide para medir si una mezcla 50/50 de DCLM-baseline y Dolma 1.7 a escala 1B produce curvas de escalado predecibles; se evaluaria con perplejidad y tareas estandar sobre un conjunto fijo de validacion.
- Reproduccion de experimentos de model merging: permite replicar el metodo Linear de mergekit con pesos normalizados sobre cinco checkpoints consecutivos y comparar el resultado con cada checkpoint individual, aislando el efecto del promediado frente al del entrenamiento adicional.
- Estudio de tecnicas de checkpoint averaging: util para analizar si el promedio ponderado reduce la varianza entre pasos de entrenamiento y si mejora la estabilidad de las metricas en comparacion con el checkpoint final (paso 42.500).
- Ajuste fino de bajo coste para dominios concretos: con 1,28B de parametros, un LoRA o un SFT completo cabe en una unica GPU de consumo, lo que permite adaptar el modelo base a clasificacion, resumen o generacion de dominio con presupuestos reducidos.
- Generacion de texto en local y entornos con recursos limitados: tras convertir los pesos a GGUF, puede ejecutarse en CPU o en GPUs de gama media para tareas de completado y prototipado sin dependencia de API externas.
- Analisis de sesgos y seguridad en modelos pequenos: la ruta interna del merge (`Pan_Safety_Better_Measurement`) sugiere un contexto de investigacion en medicion de seguridad; el modelo puede emplearse como sujeto de pruebas en evaluaciones de toxicidad, sesgo de genero o estereotipos en corpus ingleses.
- Docencia y cursos de IA: su tamano manejable y su naturaleza de artefacto de merge lo hacen adecuado para ilustrar en aula como funciona el promediado de pesos y como se evalua un modelo base.
- Comparacion de mezclas de corpus: sirve para contrastar cuantitativamente el efecto de distintas proporciones DCLM/Dolma en el preentrenamiento a escala 1B, siempre que se disponga de los demas checkpoints de la serie.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio unicamente documenta la configuracion YAML del merge y los checkpoints de origen; no incluye MMLU, HumanEval, GSM8K, Hellaswag ni ninguna otra metrica. La busqueda web asociada no devolvio resultados relevantes sobre el modelo.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16 o float16: aproximadamente 2,6 GB solo de pesos, mas overhead de activaciones y cache KV; en la practica, entre 3 y 4 GB para secuencias cortas.
- VRAM estimada en cuantizacion int8: del orden de 1,5 a 2 GB; en cuantizacion de 4 bits, alrededor de 0,8 a 1,2 GB (los tipos de cuantizacion no estan publicados por el autor; son estimaciones a partir del numero de parametros).
- GPU recomendadas: modelos de 24 GB (RTX 3090, RTX 4090, A10G) para bfloat16 con margen amplio; GPU de 8 a 12 GB (RTX 3060, RTX 4060 Ti, RTX 4070) suficientes en cuantizacion de 8 o 4 bits.
- Cabe en GPU de consumo: si. Incluso tarjetas de 6 u 8 GB pueden ejecutarlo cuantizado a 4 bits; en CPU funciona razonablemente con llama.cpp.
- Opciones de despliegue: `transformers` (clase `LlamaForCausalLM`), vLLM, Text Generation Inference (TGI), Hugging Face Inference Endpoints (el repo esta marcado como `endpoints_compatible`), y llama.cpp u Ollama previa conversion a GGUF. Nota: mergekit no es una herramienta de inferencia, solo de fusion.
- Latencia y throughput estimados: no disponible; no se han publicado mediciones y dependeran del hardware, la cuantizacion y la longitud de secuencia.
- Almacenamiento: 2,6 GB para el repositorio completo en bfloat16; menos de 1 GB en versiones GGUF de 4 bits.

## Comparativa con modelos similares

La comparativa se establece con modelos densos de escala cercana a 1B ampliamente utilizados. Los datos de terceros corresponden a especificaciones publicas de sus respectivos repositorios y deben verificarse antes de tomar decisiones.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Observaciones |
|---|---|---|---|---|---|
| Este modelo (DataDecide merge) | 1,28B | No disponible | No disponible | HuggingFace, safetensors | Modelo base de investigacion, sin benchmarks ni model card descriptiva |
| Llama 3.2 1B | ~1,24B | 128k (segun ficha oficial) | Llama 3.2 Community License | HuggingFace, amplio ecosistema | Requiere cumplir la politica de uso aceptable de Meta; version instruct disponible |
| Qwen2.5 1.5B | ~1,54B | 32.768 tokens (segun ficha oficial) | Apache 2.0 | HuggingFace, vLLM, Ollama | Buen soporte multilingue y de codigo; version instruct disponible |
| SmolLM2 1.7B | ~1,7B | 8.192 tokens (segun ficha oficial) | Apache 2.0 | HuggingFace | Entrenado sobre corpus abiertos, con variantes instruct y de razonamiento |

Frente a estas alternativas, el modelo aqui descrito carece de licencia explicita, de contexto declarado y de cualquier evaluacion publicada, lo que lo situa como un artefacto de investigacion y no como una opcion de produccion comparable. Su ventaja relativa es la trazabilidad total del proceso de merge y su integracion en una serie experimental reproducible.

## Limitaciones y advertencias

- No es un modelo ajustado por instrucciones: no sigue ordenes, no mantiene formato de chat y no incorpora plantilla conversacional. Usarlo como asistente directo produce resultados pobres.
- Ausencia total de evaluaciones: no hay benchmarks publicados, por lo que no puede afirmarse nada sobre su calidad relativa frente a otros modelos de 1B.
- Licencia no disponible: la ausencia de licencia explicita impide asumir permiso de uso comercial. En la practica, debe tratarse como no apto para produccion hasta que el autor la declare.
- Idiomas no declarados: la mezcla DCLM-baseline y Dolma 1.7 esta dominada por el ingles, por lo que el rendimiento en castellano u otras lenguas es previsiblemente bajo.
- Longitud de contexto desconocida: sin el `config.json` no puede determinarse la ventana real; asumir un valor alto sin verificar provocara fallos silenciosos por truncamiento.
- Riesgo de alucinacion: como cualquier modelo de lenguaje entrenado solo con objetivo de modelado causal, genera texto plausible sin garantia de veracidad.
- Efectos del promediado de pesos: la media ponderada de checkpoints puede degradar tareas especificas aunque mejore la metrica agregada; el autor no reporta analisis de este trade-off.
- Sesgos de los corpus de origen: DCLM-baseline y Dolma 1.7 provienen de rastreo web, con los sesgos conocidos de representacion, idioma y calidad de fuente.
- Artefacto congelado y de bajo mantenimiento: cero descargas y cero valoraciones, sin actualizaciones documentadas, lo que reduce la probabilidad de soporte o correccion de errores.
- Rutas internas expuestas: la model card revela rutas absolutas del sistema de archivos del autor, lo que indica que el repositorio se genero de forma automatica sin curacion posterior.
- Reproducibilidad parcial: la configuracion del merge es replicable, pero los checkpoints de origen no estan publicados como repositorios independientes accesibles desde la model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yuhengtu-bytedance/DataDecide-dclm-baseline-50p-dolma1.7-50p-1B-32500_35000_37500_40000_42500_weightedavg_merge
- mergekit (herramienta de merging utilizada): https://github.com/cg123/mergekit
- Articulo de model soups referenciado en las etiquetas del repositorio: https://arxiv.org/abs/2203.05482
- Dataset DCLM-baseline (referencia del nombre del modelo): https://huggingface.co/datasets/mlfoundations/dclm-baseline-1.0
- Dataset Dolma 1.7 (referencia del nombre del modelo): https://huggingface.co/datasets/allenai/dolma
- Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los unicos resultados obtenidos fueron paginas de descarga del navegador Google Chrome, sin relacion con el artefacto.
