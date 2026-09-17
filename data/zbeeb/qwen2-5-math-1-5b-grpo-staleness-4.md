# zbeeb/Qwen2.5-Math-1.5B-GRPO-Staleness-4

## Resumen

Qwen2.5-Math-1.5B-GRPO-Staleness-4 es un ajuste fino completo (full-parameter) del modelo Qwen/Qwen2.5-Math-1.5B, publicado por el usuario zbeeb en HuggingFace. Se trata del checkpoint final del paso 1000 de un entrenamiento con GRPO (Group Relative Policy Optimization) sobre el dataset Staleness-GRPO-DAPO-Math-17k, compuesto por 17.005 filas de problemas de matematicas. El objetivo del modelo es mejorar la resolucion de problemas matematicos con razonamiento en cadena y respuesta final verificable, partiendo de la base matematica de Qwen2.5-Math.

El modelo pertenece a la coleccion "Staleness" del autor, que estudia el efecto del retraso (staleness) de las politicas en el aprendizaje por refuerzo, es decir, cuantas actualizaciones puede quedar desfasada una politica de rollout respecto al modelo que se esta entrenando. En esta variante el limite configurado es de 4 pasos fuera de politica (`max_off_policy_steps = 4`), frente a una linea base historica con limite 2. Es, por tanto, un artefacto de investigacion orientado a estudiar la estabilidad y eficiencia del RL aplicado a modelos pequenos de razonamiento matematico.

Con 1.543.714.304 parametros, licencia Apache 2.0 y pesos en safetensors BF16, el modelo es pequeno y facil de desplegar en hardware de consumo. Su relevancia actual es doble: por un lado, sirve como punto de comparacion reproducible para experimentos de RL con politicas desfasadas; por otro, ofrece un modelo de matematicas de 1,5 B con resultados medidos en MATH-500, AMC, AIME, Minerva Math y OlympiadBench.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen2 (tag `qwen2`); se conserva la arquitectura y la configuracion de contexto original del modelo base |
| Parametros totales | 1.543.714.304 (aproximadamente 1,54 B) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | No disponible en la informacion proporcionada. La model card indica que se conserva la configuracion original; el entrenamiento y las evaluaciones reportadas usaron 4.096 tokens de contexto total |
| Tipos de cuantizacion | No disponible. Se publican pesos sin cuantizar en BF16; no se incluyen variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | Apache 2.0 (se incluye la licencia original del modelo base sin cambios) |
| Formato de pesos | Safetensors fragmentados (sharded), exportados en el dtype de punto flotante original del checkpoint de entrenamiento (BF16 para inferencia) |
| Modelo base | Qwen/Qwen2.5-Math-1.5B, revision `4a83ca6e4526a4f2da3aa259ec36c259f66b2ab2` |
| Relacion con el base | Finetune (1000 actualizaciones de GRPO) |
| Dataset de entrenamiento | zbeeb/Staleness-GRPO-DAPO-Math-17k (17.005 filas) |
| Token EOS | `<|im_end|>` (id 151645), usado tanto en el tokenizer de entrenamiento como en la configuracion exportada |
| Tamano del repositorio | 6,2 GB |
| Framework | Transformers, con etiquetas de compatibilidad con text-generation-inference y endpoints |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only de la familia Qwen2, con embeddings atados (tied embeddings) segun indica la validacion de exportacion. No se introducen cambios arquitectonicos; el trabajo se limita al ajuste de los pesos mediante RL. La exportacion se valido comprobando el paso de entrenamiento guardado, la finitud de los tensores, las claves y formas de los tensores, la recarga estricta en Transformers, el round-trip del tokenizer, los embeddings atados y la identidad de los logits de una sonda en CPU antes y despues de la serializacion. Los hashes de fichero se registran en `export-manifest.json`.

El entrenamiento uso GRPO con tamano de grupo 8 y tamano de lote 64, recorte PPO de 0,2, AdamW con tasa de aprendizaje 1e-6, 30 pasos de calentamiento y semilla 42. Se empleo Prime RL v0.9.0, contexto total de 4.096 tokens y un maximo de 3.072 tokens de finalizacion. La recompensa comprueba la equivalencia matematica de la respuesta terminal, sin juez LLM ni recompensa de formato independiente. La innovacion central es el control de staleness: el limite configurado fue 4 (`max_off_policy_steps = 4`), es decir, la edad maxima permitida de la politica en los rollouts. La topologia de ejecucion tambien difiere de la linea base: esta ejecucion uso dos GPU para el entrenador y una GPU para inferencia sobre tres A100, mientras que la linea base con limite 2 uso tres GPU de entrenamiento y dos de inferencia. La model card advierte explicitamente que las diferencias entre las variantes de 1,5 B, 3 B y 7 B no pueden atribuirse solo al numero de parametros, ya que las de 1,5 B y 7 B parten de Qwen2.5-Math y la de 3 B parte de Qwen2.5.

## Capacidades

- Generacion de texto conversacional orientada a la resolucion de problemas matematicos, con formato de razonamiento explicito y respuesta final en `\boxed{...}` o en una linea `Final answer: ...`.
- Razonamiento matematico de varios pasos, apoyado en el template de chat del modelo y en el token EOS `<|im_end|>` para detener la generacion al final del turno del asistente.
- Aritmetica, algebra y problemas de competicion en el rango evaluado: MATH-500, AMC23, AIME24, AIME25, Minerva Math y OlympiadBench.
- Generacion determinista disponible (`do_sample=False`) y generacion muestreada (temperatura 0,6 en las evaluaciones reportadas).
- Capacidades multilingues limitadas a ingles y chino, segun los idiomas declarados en la model card.
- No hay evidencia en la informacion proporcionada de soporte de tool calling, function calling, uso de agentes, razonamiento multi-paso con herramientas, vision, audio ni modo thinking explicito separado del razonamiento textual.
- No se documentan capacidades de generacion de codigo ni de tareas generales fuera del ambito matematico.

## Casos de uso

- Evaluacion academica de RL aplicado a razonamiento: el modelo sirve como checkpoint de referencia del paso 1000 de un experimento GRPO con staleness 4, util para reproducir y comparar curvas de aprendizaje frente a la variante con limite 2 y al modelo base.
- Generacion de soluciones matematicas con respuesta verificable: su formato de salida (`\boxed{}` o `Final answer:`) permite integrarlo en un pipeline que extraiga la respuesta terminal y la valide automaticamente contra una solucion de referencia.
- Entrenamiento de modelos mayores por destilacion: al ser un modelo de 1,54 B con razonamiento matematico ya ajustado, puede usarse para generar cadenas de razonamiento y filtrarlas como datos de entrenamiento para modelos mayores.
- Tutoria de matematicas en ingles o chino: con contexto de 4.096 tokens y maximo de 3.072 tokens de respuesta, admite problemas con enunciado largo y explicacion detallada, aunque limitado a esos dos idiomas.
- Prototipado en entornos con GPU de consumo: al ocupar aproximadamente 3,1 GB en BF16, permite iterar en una unica GPU de gama media sin necesidad de infraestructura de centro de datos.
- Formacion de conjuntos de datos sinteticos de matematicas: la generacion muestreada (8 completions por problema a temperatura 0,6) documentada en las evaluaciones se puede reutilizar para producir multiples soluciones por enunciado y estudiar su diversidad.
- Comparacion de estrategias de RL en publicaciones: el repositorio incluye `training-config.json`, `export-manifest.json` y `evaluation-results.json` con la configuracion y los resultados en formato legible por maquina, lo que facilita la trazabilidad en articulos y replicaciones.

## Benchmarks y rendimiento

Resultados autodeclarados por el autor para el paso de politica 1000, con el corrector determinista de respuesta final del propio entrenamiento. Las filas codiciosas usan una finalizacion por problema; las filas muestreadas usan ocho finalizaciones por problema a temperatura 0,6 y reportan la precision media de respuesta, no pass@8. MATH-500, AMC y AIME usan un limite de 3.072 tokens de finalizacion; Minerva y OlympiadBench, 2.048.

| Benchmark | Finalizaciones | Precision | Truncadas |
|---|---:|---:|---:|
| MATH-500 | 500 | 62,80 % | 2,8 % |
| AMC23 | 40 | 45,00 % | 2,5 % |
| AIME24 | 30 | 20,00 % | 10,0 % |
| AIME25 | 30 | 6,67 % | 3,3 % |
| Minerva Math | 272 | 16,54 % | 20,6 % |
| OlympiadBench | 675 | 29,63 % | 8,0 % |
| AIME24 (media muestreada) | 240 | 7,92 % | 10,4 % |
| AIME25 (media muestreada) | 240 | 5,00 % | 5,4 % |
| AIME26 (media muestreada) | 240 | 7,08 % | 4,2 % |

No hay resultados comparativos con otros modelos en la informacion proporcionada, ni barrido de benchmarks posterior al entrenamiento (la model card indica que ese barrido mas amplio aun no se ha ejecutado). Tampoco se publican resultados de MMLU, HumanEval, GSM8K ni de tareas no matematicas.

## Requisitos de hardware

- Peso en BF16: aproximadamente 3,1 GB solo para los parametros (1.543.714.304 x 2 bytes). El repositorio ocupa 6,2 GB, por encima del minimo teorico, presumiblemente por el fragmentado de safetensors y los artefactos de exportacion.
- VRAM estimada para inferencia: en BF16, del orden de 3,5 GB incluyendo overhead del runtime y cache KV con lotes pequenos; en cuantizacion INT8, alrededor de 2 GB; en INT4, alrededor de 1,5 GB. Son estimaciones derivadas del numero de parametros, no mediciones publicadas por el autor.
- GPU recomendadas: cabe en GPU de consumo como RTX 3060 de 12 GB, RTX 4060 Ti de 8 GB o superiores, y tambien en RTX 4090, A100 y H100. No requiere memoria ni computo de centro de datos.
- Despliegue: la libreria declarada es Transformers, con `device_map="auto"` y `dtype=torch.bfloat16` en el ejemplo de uso. El repositorio esta etiquetado como compatible con text-generation-inference y con endpoints, por lo que TGI y servicios de inferencia gestionada son opciones razonables. vLLM es viable por ser un modelo Qwen2 denso, aunque no aparece citado en la informacion disponible.
- llama.cpp y Ollama requeririan una conversion a GGUF que no se proporciona en el repositorio; no hay cuantizaciones publicadas.
- Latencia y throughput: no disponibles. El unico dato de ejecucion documentado es la topologia de entrenamiento (dos GPU A100 para el entrenador y una para inferencia).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Foco | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen2.5-Math-1.5B-GRPO-Staleness-4 | 1,54 B | No disponible (configuracion original preservada; 4.096 tokens en entrenamiento y evaluacion) | Matematicas con GRPO y control de staleness | Apache 2.0 | Checkpoint del paso 1000; resultados en MATH-500, AMC, AIME, Minerva y OlympiadBench |
| Qwen2.5-Math-1.5B (base) | 1,54 B | No disponible | Matematicas (pretrain y postentrenamiento del autor original) | Apache 2.0 | Punto de partida del modelo; la model card no publica su tabla comparativa directa |
| Qwen2.5-Math-1.5B-Instruct | No disponible | No disponible | Matematicas con instrucciones | Apache 2.0 | Alternativa de referencia de la misma familia; sin datos comparativos en esta informacion |
| DeepSeek-R1-Distill-Qwen-1.5B | No disponible | No disponible | Razonamiento destilado sobre base Qwen | No disponible en esta informacion | Alternativa habitual en el rango de 1,5 B para matematicas y razonamiento; no se dispone de comparacion numerica verificada |

No se dispone de una comparacion de rendimiento fiable entre estos modelos en la informacion proporcionada, por lo que no se incluyen cifras de benchmarks de las alternativas.

## Limitaciones y advertencias

- Los resultados son autodeclarados por el autor y corresponden a un unico entrenamiento con semilla 42; no se han replicado de forma independiente.
- Las metricas son de respuesta final, no de calidad de demostracion: la propia model card advierte que estos resultados no establecen la calidad de las pruebas o del razonamiento intermedio.
- Riesgo de contaminacion: los datos de entrenamiento se filtraron contra las evaluaciones retenidas, pero la model card reconoce que esto no demuestra la ausencia de contaminacion por preentrenamiento ni que se eliminaran todos los casi duplicados.
- Truncamiento: hay porcentajes relevantes de finalizaciones truncadas (10,0 % en AIME24 codicioso, 20,6 % en Minerva Math, 10,4 % en AIME24 muestreado), lo que puede infravalorar el rendimiento real y penalizar problemas que requieren razonamientos largos.
- La caida de AIME24 codicioso (20,00 %) a la media muestreada (7,92 %) sugiere una alta varianza en el muestreo a temperatura 0,6; conviene revisar la metodologia antes de extrapolar conclusiones.
- El contexto de entrenamiento y evaluacion es de 4.096 tokens, inferior al de muchos modelos actuales; problemas con enunciados muy largos o razonamientos extensos pueden no caber.
- Cobertura idiomatica limitada a ingles y chino. No se declaran capacidades en castellano ni en otros idiomas.
- No hay evidencia de soporte de tool calling, agentes, vision, audio ni generacion de codigo; no debe asumirse ninguna de estas capacidades.
- Al ser un modelo de 1,54 B, es esperable un rendimiento inferior al de modelos mayores de la misma coleccion (3 B y 7 B), aunque la comparacion directa no es limpia porque la variante de 3 B parte de una base distinta (Qwen2.5 en lugar de Qwen2.5-Math).
- Licencia Apache 2.0, que permite uso comercial, pero se mantiene la licencia original del modelo base y conviene revisar sus condiciones de atribucion.
- El repositorio tiene 0 descargas y 0 likes, sin validacion por parte de la comunidad, y no incluye variantes cuantizadas ni despliegues empaquetados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zbeeb/Qwen2.5-Math-1.5B-GRPO-Staleness-4
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Math-1.5B/tree/4a83ca6e4526a4f2da3aa259ec36c259f66b2ab2
- Dataset de entrenamiento: https://huggingface.co/datasets/zbeeb/Staleness-GRPO-DAPO-Math-17k
- Configuracion de entrenamiento: https://huggingface.co/zbeeb/Qwen2.5-Math-1.5B-GRPO-Staleness-4/blob/main/training-config.json
- Manifiesto de exportacion: https://huggingface.co/zbeeb/Qwen2.5-Math-1.5B-GRPO-Staleness-4/blob/main/export-manifest.json
- Resultados de evaluacion: https://huggingface.co/zbeeb/Qwen2.5-Math-1.5B-GRPO-Staleness-4/blob/main/evaluation-results.json
- Licencia incluida en el repositorio: https://huggingface.co/zbeeb/Qwen2.5-Math-1.5B-GRPO-Staleness-4/blob/main/LICENSE
- Perfil del autor: https://huggingface.co/zbeeb

Nota sobre la busqueda web: los resultados devueltos corresponden a la mediateca del canal aleman 3sat y no guardan relacion con este modelo. No se han encontrado articulos, papers, repositorios ni demos adicionales en la busqueda realizada.
