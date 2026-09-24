# ziansu/r2egym-tip

## Resumen

`ziansu/r2egym-tip` es un repositorio publicado por Zian Su que contiene dos checkpoints (etiquetados `step40` y `step80`) resultantes de un unico run de entrenamiento TIP sobre el subconjunto R2E-Gym, partiendo del modelo base `Qwen/Qwen3.5-4B`. El objetivo es producir un agente de ingenieria de software open-weight capaz de resolver issues reales de GitHub, evaluado contra el benchmark SWE-bench Verified.

El modelo hereda la arquitectura del base: un transformer de 4,21 mil millones de parametros para el modelo de lenguaje (`Qwen3_5ForCausalLM`), con torre de vision incluida que eleva el total a 4,54 mil millones en `Qwen3_5ForConditionalGeneration`. El vocabulario es de 248.320 tokens y el entrenamiento se realizo con una ventana de rollout de 65.536 tokens, aunque la evaluacion principal se ejecuto con 98.304 tokens de contexto y hasta 100 turnos de agente. La licencia es Apache 2.0.

Su relevancia actual es que el checkpoint `step80` alcanza un 52,20 % de pass@1 en SWE-bench Verified (500 tareas, 1.500 intentos), superando a las otras tres lineas base del mismo proyecto (RLAD con 51,80 %, OPD con 51,67 % y GRPO con 46,00 %) bajo un protocolo identico. Se trata de un artefacto de investigacion recien publicado, sin descargas ni validacion comunitaria, orientado a reproduccion de resultados mas que a despliegue en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3.5-4B, con capas de atencion lineal (`linear_attn`) presentes en las 24 capas; incluye torre de vision |
| Parametros totales | 4,21 mil millones (modelo de lenguaje, `Qwen3_5ForCausalLM`); 4,54 mil millones con la torre de vision (`Qwen3_5ForConditionalGeneration`) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 65.536 tokens en el rollout de entrenamiento; evaluado hasta 98.304 tokens con 100 turnos. Maximo nativo no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors bfloat16; no se han publicado conversiones GGUF ni AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (checkpoints alojados en subcarpetas `step40` y `step80`; la raiz del repositorio no contiene pesos) |

Datos adicionales del repositorio: 738 tensores correspondientes al conjunto de claves del modelo base, con formas coincidentes. 48 tensores se almacenan en bfloat16 donde el base usa float32 (`linear_attn.A_log` y `linear_attn.norm.weight` en cada una de las 24 capas), porque el entrenamiento mantuvo todos los parametros en bfloat16. Tamano del repositorio: 18,7 GB. Descargas: 0. Likes: 0.

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen3.5-4B, un transformer de 24 capas que combina capas de atencion lineal (`linear_attn`, con parametros `A_log` y `norm.weight`) con el resto de la pila. El checkpoint conserva la torre de vision del modelo base de forma byte a byte identica: el entrenamiento solo actualizo el modelo de lenguaje, de modo que la evaluacion agentica del proyecto utilizo exclusivamente el LM. Los pesos se exportaron desde un checkpoint Megatron `torch_dist` mediante la herramienta `tools/convert_torch_dist_to_hf.py` de slime, con `--vocab-size 248320 -a`, apuntando directamente al directorio `iter_*`.

El metodo de entrenamiento es TIP, una destilacion on-policy contra un profesor congelado compartido Qwen3.6-27B, aplicada sobre el subconjunto R2E-Gym. Hiperparametros declarados: learning rate 1e-6, batch global 256, y un batch de rollout de 32 grupos de tareas con 8 muestras por grupo en cada actualizacion, con 65.536 tokens de contexto de rollout. El run (`tpf0916b`) produjo dos checkpoints: `step40` (40 actualizaciones, correspondiente a `iter_0000039`, sin evaluar) y `step80` (80 actualizaciones, `iter_0000079`). El proposito de `step40` es comparar metodos con el mismo numero de actualizaciones que los runs RAD del mismo proyecto, que entrenan 40 actualizaciones. No se documento el numero total de tokens de entrenamiento ni la composicion completa del corpus, mas alla de que proviene del subconjunto R2E-Gym.

## Capacidades

- Resolucion de issues de repositorios reales de software: generacion de parches y ediciones multiarchivo dentro de un flujo de agente sobre SWE-bench Verified.
- Razonamiento multi-paso de horizonte largo: el protocolo de evaluacion principal ejecuta hasta 100 turnos de agente con 98.304 tokens de contexto.
- Uso de herramientas y entorno de ejecucion: el escenario de evaluacion implica interaccion con un harness de SWE-bench (lectura, edicion y ejecucion de codigo en el repositorio).
- Generacion de texto (`pipeline_tag: text-generation`), con la pila causal estandar de transformers.
- Capacidad de vision heredada del modelo base: el checkpoint incluye la torre de vision y puede cargarse con `AutoModelForImageTextToText` (4,54 mil millones de parametros), aunque no fue entrenada ni evaluada por el autor.
- Capacidades multilingues: no disponible.
- Modo de pensamiento explicito, audio u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Reparacion automatizada de bugs en CI: integrar el modelo como agente que recibe un issue en lenguaje natural, localiza los ficheros relevantes y propone un parche verificable; su rendimiento de 52,20 % de pass@1 lo hace competitivo frente a baselines de razonamiento puro como GRPO (46,00 %) en el mismo protocolo.
- Investigacion en metodos de post-entrenamiento para agentes: el par `step40`/`step80` permite comparar TIP contra metodos alternativos (RLAD, OPD, GRPO) a un numero de actualizaciones emparejado, con la configuracion exacta de entrenamiento documentada.
- Generacion de pruebas de regresion: dado un repositorio y una descripcion de cambio, el modelo puede producir tests que reproduzcan el fallo, dado su entrenamiento sobre R2E-Gym, un entorno construido con generacion automatica de tests y backtranslation.
- Refactorizaciones acotadas con verificación: el contexto de hasta 98.304 tokens permite cargar modulos y ficheros de test completos y emitir ediciones coherentes dentro de la misma ventana.
- Asistente de mantenimiento de proyectos open source: triaje y primer borrador de parche para issues de baja complejidad, dejando la revision final al mantenedor humano.
- Evaluacion comparativa de agentes SWE: servir como baseline de referencia de 4B parametros con licencia Apache 2.0 para medir tecnicas de test-time scaling (mas turnos, mas contexto) frente a modelos de mayor tamano.
- Prototipado local de agentes de codigo: al tratarse de un modelo de ~4,2 mil millones de parametros, puede ejecutarse en una unica GPU de gama alta de consumo, lo que facilita experimentacion sin infraestructura de centro de datos.

## Benchmarks y rendimiento

SWE-bench Verified, 500 tareas, semilla 42, 3 muestras por tarea (1.500 intentos). `pass@1` se reporta junto con la desviacion estandar de muestra entre las tres tasas de exito a nivel de rollout.

| Protocolo | pass@1 | pass@3 |
|---|---|---|
| 98.304 contexto / 100 turnos | 52,20 % +/- 3,22 | 64,40 % |
| 65.536 contexto / 75 turnos | 46,27 % +/- 0,64 | 58,80 % |

Ambas filas corresponden al checkpoint `step80`. El checkpoint `step40` no ha sido evaluado en SWE-bench Verified.

Comparativa con las lineas base del mismo proyecto, en sus actualizaciones finales bajo el protocolo de 98.304 contexto / 100 turnos:

| Metodo | Actualizaciones | pass@1 | pass@3 |
|---|---|---|---|
| TIP | 80 | 52,20 | 64,40 |
| RLAD | 79 | 51,80 | 63,20 |
| OPD | 79 | 51,67 | 63,80 |
| GRPO | 80 | 46,00 | 61,60 |

El autor advierte que el error estandar binomial a 500 tareas es de aproximadamente 1,3 puntos antes de considerar la varianza de rollout, por lo que las diferencias de alrededor de un punto entre los metodos con mejor resultado no son separables estadisticamente.

## Requisitos de hardware

- Peso de los pesos en bfloat16: aproximadamente 8,4 GB para el modelo de lenguaje (4,21 mil millones de parametros) y aproximadamente 9,1 GB con la torre de vision (4,54 mil millones). Calculo estimado a partir del numero de parametros, no publicado por el autor.
- VRAM estimada para inferencia: los pesos caben en GPUs de consumo de gama alta, pero la cache KV a 98.304 tokens de contexto puede superar con holgura el tamano de los pesos; no se ha publicado la configuracion de cabezas ni el consumo real de memoria.
- GPU recomendadas: no disponible como recomendacion oficial. Por tamano, una RTX 4090 (24 GB) o RTX 3090 (24 GB) deberian alojar el modelo con contexto moderado; A100 40/80 GB o H100 permiten trabajar con la ventana completa de 98.304 tokens y lotes mayores. Una GPU de 16 GB queda ajustada incluso con contexto corto.
- Cabe en GPU de consumo: si, previsiblemente en tarjetas de 24 GB, con la salvedad de la cache KV a contextos largos.
- Opciones de despliegue: transformers es el camino documentado por el autor (requiere pasar `subfolder="step80"` explicitamente, ya que la raiz del repositorio no contiene pesos). No se han publicado conversiones a GGUF, por lo que llama.cpp u Ollama no estan disponibles de fabrica. El autor menciona que durante el entrenamiento y la evaluacion sirvio el modelo con un servidor de inferencia en bfloat16, pero no especifica cual.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SWE-bench Verified | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ziansu/r2egym-tip` (`step80`) | 4,21 B (LM) / 4,54 B con vision | 65.536 en entrenamiento; evaluado a 98.304 | 52,20 % pass@1 / 64,40 % pass@3 | Apache 2.0 | HuggingFace, safetensors, 0 descargas |
| `Qwen/Qwen3.5-4B` (modelo base) | 4,21 B (LM) / 4,54 B con vision | no disponible | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | HuggingFace (modelo base de referencia) |
| Agente publicado por R2E-Gym | no disponible | no disponible | 51 % (resultado del proyecto R2E-Gym, con otra configuracion) | no disponible | codigo en GitHub |
| Lineas base RLAD / OPD / GRPO sobre Qwen3.5-4B | 4,21 B (LM) | 98.304 en evaluacion | 51,80 % / 51,67 % / 46,00 % pass@1 | no disponible | resultados reportados en la model card; pesos no publicados en este repositorio |

La comparacion con el 51 % de R2E-Gym no es directa: procede del paper y del repositorio del proyecto con su propio pipeline de verificadores hibridos, no de este checkpoint. Las filas RLAD, OPD y GRPO corresponden a runs del mismo proyecto bajo protocolo identico, por lo que son la referencia mas valida, pero sus pesos no se distribuyen en este repositorio.

## Limitaciones y advertencias

- Repositorio sin validacion externa: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de reproduccion independiente de los resultados.
- `step40` no esta evaluado en SWE-bench Verified. Los numeros de 52,20 % y 46,27 % no deben atribuirse a ese checkpoint.
- Diferencias no separables estadisticamente: con un error estandar binomial de ~1,3 puntos a 500 tareas, la ventaja de TIP sobre RLAD (51,80 %) y OPD (51,67 %) esta dentro del ruido. Solo la ventaja sobre GRPO (46,00 %, unos 6 puntos) resulta clara.
- Varianza alta en la configuracion de contexto largo: la medicion a 98.304 contexto / 100 turnos tiene una desviacion de +/- 3,22 puntos, mas de cinco veces la de la configuracion de 65.536 tokens (+/- 0,64), lo que sugiere una fuerte dependencia de los rollouts.
- Precisión de los pesos: 48 tensores de las capas de atencion lineal se publican en bfloat16 donde el modelo base usa float32. Quien compare contra el base debe tener en cuenta esta diferencia de precision, que replica la politica servida durante la evaluacion.
- Riesgo de alucinacion en parches: como cualquier modelo generativo de codigo, puede producir ediciones plausibles pero incorrectas, referencias a APIs inexistentes o tests que pasan sin cubrir el fallo descrito. El flujo de trabajo debe incluir ejecucion real de la suite de tests.
- Dominio restringido: entrenado sobre el subconjunto R2E-Gym, orientado a tareas de resolucion de issues en repositorios. No hay datos sobre su comportamiento en generacion de codigo general, matematicas, dialogo abierto u otras tareas.
- Idiomas soportados y sesgos: no disponible. No se han publicado evaluaciones de sesgo, toxicidad ni cobertura multilingue.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificacion, pero el modelo deriva de `Qwen/Qwen3.5-4B`; conviene verificar las condiciones del modelo base antes de un despliegue comercial.
- Carga no estandar: la raiz del repositorio no contiene pesos, hay que indicar la subcarpeta (`step40` o `step80`) en cada llamada a `from_pretrained`.
- Sin conversiones cuantizadas publicadas: no hay GGUF ni formatos de 4/8 bits, lo que limita el despliegue en hardware de gama baja.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ziansu/r2egym-tip
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Perfil del autor: https://huggingface.co/ziansu
- Repositorio de R2E-Gym (COLM 2025): https://github.com/R2E-Gym/R2E-Gym
- Paper R2E-Gym: Procedural Environments and Hybrid Verifiers for Scaling Open-Weight SWE Agents: https://arxiv.org/html/2504.07164
- Sitio del proyecto R2E-Gym: https://r2e-gym.github.io/
- Organizacion R2E-Gym en HuggingFace: https://huggingface.co/R2E-Gym
