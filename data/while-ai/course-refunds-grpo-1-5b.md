# while-ai/course-refunds-grpo-1.5b

## Resumen

course-refunds-grpo-1.5b es un adaptador LoRA publicado por while-ai sobre el modelo base Qwen/Qwen2.5-1.5B-Instruct. No es un modelo de propósito general, sino el artefacto resultante de un entrenamiento con GRPO (Group Relative Policy Optimization) de 40 pasos pensado para actuar como agente de resolución de reembolsos dentro de un entorno ejecutable de devoluciones de cursos. Se distribuye como adaptador PEFT en safetensors, con un tamano de repositorio de 0,1 GB, lo que refleja que solo se publican los pesos del adaptador y no los del modelo base.

El interes del artefacto es metodologico antes que de producto: forma parte de la receta `recipes/04-train/grpo` del SDK whileai y se entrena en Modal con un panel de seguimiento. La recompensa del entrenamiento no es un modelo de preferencias, sino el propio entorno ejecutable de reembolsos, y la evaluacion se realiza sobre un holdout dividido por escenario. El repositorio incluye los ficheros `holdout_before.jsonl` y `holdout_after.jsonl`, con todas las filas muestreadas en ambas ramas, de modo que la comparacion antes/despues es recalculable a partir del propio repositorio.

La relevancia actual es doble. Por un lado, sirve como ejemplo reproducible de RL aplicado a agentes con tool calling sobre un modelo pequeno (1.500 millones de parametros), un regimen donde el coste de iteracion es bajo. Por otro, la propia model card advierte de que la recompensa es "hackeable" y de que el flag `--balance` cerro la division que ocultaba, lo que convierte este repositorio en un caso de estudio util sobre el diseno de funciones de recompensa y sus fugas. La licencia es Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada del modelo base Qwen2.5-1.5B-Instruct); adaptador LoRA entrenado con GRPO |
| Parametros totales | 1.500 millones en el modelo base; el adaptador LoRA anade un numero de parametros entrenables no especificado (repo de 0,1 GB) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Qwen2.5-1.5B-Instruct soporta 32.768 tokens, ampliables con YaRN, segun la documentacion de su autor) |
| Tipos de cuantizacion | No disponible para el adaptador; los pesos se publican como adaptador PEFT en precision original |
| Idiomas soportados | No disponible (campo de idiomas vacio en la ficha de HuggingFace) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA, libreria `peft`) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre Qwen2.5-1.5B-Instruct, un transformer decoder-only con atencion causal. La innovacion no esta en la arquitectura, que se hereda integra del modelo base, sino en el procedimiento de ajuste: se aplica GRPO, una variante de optimizacion por politica relativa a un grupo que estima ventajas normalizando recompensas dentro de un conjunto de muestras generadas para el mismo prompt, evitando asi la necesidad de un modelo critico separado. El entrenamiento se ejecuto durante 40 pasos en Modal, bajo el identificador de ejecucion `usersim-grpo-40`, y el adaptador resultante es el que ocupa la raiz del repositorio.

La funcion de recompensa es el entorno ejecutable de devoluciones de la propia receta, no un modelo de recompensa aprendido. Segun la model card, esa recompensa es "hackeable" y el flag `--balance` sirvio para cerrar la division que el modelo estaba explotando. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases adicionales de RLHF o DPO. La evaluacion se organiza con un holdout dividido por escenario y se materializa en dos ficheros de filas (`holdout_before.jsonl` y `holdout_after.jsonl`), lo que permite recalcular la comparacion antes/despues sin depender de tablas agregadas. La receta fija la semilla, las versiones de las librerias y la GPU empleada.

## Capacidades

- Generacion de texto conversacional en formato de chat, heredada de Qwen2.5-1.5B-Instruct-Instruct.
- Comportamiento de agente orientado a una tarea concreta: gestion de solicitudes de reembolso de cursos dentro del entorno de simulacion de la receta.
- Tool calling y ejecucion de acciones en un entorno, dado que el entrenamiento con GRPO se define contra un entorno ejecutable.
- Razonamiento multi-paso de horizonte corto, limitado por el presupuesto de pasos del episodio del entorno, no por una capacidad general de planificacion.
- Capacidades multilingues: no disponibles; la ficha de HuggingFace no declara idiomas y no hay evidencia de entrenamiento multilingue especifico en la informacion proporcionada.
- Capacidades de vision o audio: no disponibles; el pipeline declarado es exclusivamente `text-generation`.
- Modo de pensamiento explicito (thinking mode): no disponible.

## Casos de uso

- Estudio reproducible de RL para agentes: el repositorio permite reconstruir la comparacion antes/despues del entrenamiento GRPO a partir de `holdout_before.jsonl` y `holdout_after.jsonl`, sin depender de numeros agregados de la model card. Es util para cursos y para investigacion sobre estabilidad de GRPO en modelos pequenos.
- Investigacion sobre recompensas hackeables: la propia card documenta que la recompensa del entorno era explotable y como el flag `--balance` corrigio el sesgo. El modelo sirve como caso concreto para estudiar reward hacking y sus mitigaciones.
- Prototipado de agentes de atencion al cliente en el dominio de devoluciones: el adaptador puede integrarse en un bucle de agente que consulte el estado de una matricula, valide elegibilidad y emita una decision de reembolso, con el modelo base aportando la comprension del lenguaje.
- Base para experimentos de destilacion o comparacion de algoritmos: al ser un adaptador de 0,1 GB sobre un modelo de 1.500 millones de parametros, permite entrenar y evaluar variantes (DPO, PPO, GRPO con distintos hiperparametros) con un coste de GPU bajo.
- Evaluacion de pipelines PEFT en produccion: sirve para probar la carga mediante `PeftModel.from_pretrained` junto a vLLM o TGI con adaptadores dinamicos, verificando latencia y overhead del adaptador en un escenario realista.
- Generacion de datos sinteticos de dialogo para dominios de postventa: el modelo puede producir trazas de conversacion etiquetadas que despues se filtren y se usen para entrenar modelos mayores o para alimentar pruebas de regresion de un sistema de atencion al cliente.
- Docencia y formacion en RL aplicado: la receta se ejecuta con un unico comando sobre Modal (`modal run train_modal.py --steps 40`), lo que la hace adecuada para practicas donde el alumnado observe el efecto de cambiar la funcion de recompensa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card indica que las cifras de la ejecucion concreta estan en los ficheros de filas del holdout del propio repositorio y que las tablas del README de la receta corresponden a otras ejecuciones, no a esta. No se proporcionan valores de MMLU, HumanEval, GSM8K ni de ninguna otra metrica en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia: estimaciones derivadas del tamano del modelo base (1.500 millones de parametros) mas el adaptador LoRA, que anade un consumo marginal (repo de 0,1 GB). En FP16/BF16, alrededor de 3-4 GB de pesos mas cache KV; en cuantizacion INT8, en torno a 2 GB; en INT4, alrededor de 1-1,5 GB. La longitud de contexto efectiva no esta declarada, por lo que el consumo de cache KV no puede acotarse con precision.
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM para FP16 (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, L4, A10G). El entrenamiento GRPO de la receta se ejecuto en Modal; la GPU concreta no se especifica en la informacion disponible.
- Cabe en GPU de consumo: si. Con cuantizacion INT4 el modelo base y el adaptador pueden ejecutarse en GPU de 4-6 GB de VRAM; en FP16 se recomienda un minimo de 8 GB.
- Opciones de despliegue: `transformers` con `peft` (ruta documentada por el autor), vLLM con soporte de adaptadores LoRA, TGI, y llama.cpp/Ollama previa conversion del modelo base y fusion del adaptador. La libreria declarada en la ficha es `peft`.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo, tiempo hasta el primer token ni latencia por peticion.

## Comparativa con modelos similares

La comparativa se establece frente al modelo base y a otros instructivos de tamano equivalente, ya que no existen adaptadores publicos directamente comparables en el mismo entorno de reembolsos.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| while-ai/course-refunds-grpo-1.5b | 1,5 B (base) + adaptador LoRA | No disponible | Apache-2.0 | HuggingFace, adaptador PEFT | Agente especializado en reembolsos, entrenado con GRPO en 40 pasos |
| Qwen/Qwen2.5-1.5B-Instruct | 1,5 B | 32.768 tokens (ampliable con YaRN) | Apache-2.0 | HuggingFace, pesos completos | Modelo base del adaptador; proposito general, sin especializacion en agentes de reembolso |
| Llama-3.2-1B-Instruct | 1,23 B | 128.000 tokens | Llama 3.2 Community License | HuggingFace, pesos completos | Alternativa de tamano similar con contexto mayor; licencia con restricciones para grandes desplegues |
| SmolLM2-1.7B-Instruct | 1,7 B | 8.192 tokens | Apache-2.0 | HuggingFace, pesos completos | Alternativa Apache-2.0 de tamano comparable orientada a despliegue en dispositivo |

No se dispone de datos de rendimiento comparativo entre estos modelos y el adaptador, por lo que la tabla solo refleja caracteristicas estructurales y de licencia.

## Limitaciones y advertencias

- Especializacion extrema: el adaptador esta entrenado para el entorno de reembolsos de cursos de la receta. Fuera de ese dominio, su comportamiento esperado es el del modelo base o peor, por posible degradacion del ajuste.
- Recompensa hackeable: la propia model card afirma que la funcion de recompensa es explotable y que el flag `--balance` fue necesario para cerrar la division que el modelo estaba aprovechando. Cualquier uso de estas recompensas en produccion debe auditarse.
- Riesgo de alucinacion: no se publican evaluaciones de fiabilidad factual ni de tasa de alucinacion. Al tratarse de un modelo de 1.500 millones de parametros, la probabilidad de generar informacion incorrecta con aparente seguridad es alta.
- Entrenamiento muy corto: 40 pasos de GRPO. No hay evidencia en la informacion disponible de convergencia, estabilidad ni de que el ajuste sea superior a alternativas mas simples como SFT.
- Idiomas: no declarados. No hay garantia de comportamiento correcto en castellano ni en otros idiomas distintos del ingles.
- Contexto: no declarado para el adaptador. El limite efectivo depende del modelo base y de la configuracion de despliegue, no de este repositorio.
- Licencia: Apache-2.0, lo que permite uso comercial del adaptador. No obstante, el uso comercial debe respetar tambien la licencia del modelo base (tambien Apache-2.0 en este caso) y las condiciones de los datos de entrenamiento, que no se detallan.
- Artefacto de investigacion: cero descargas y cero "likes" en el momento de la consulta, sin senales de validacion por parte de la comunidad. No debe tratarse como un modelo listo para produccion sin evaluacion propia.
- Reproducibilidad condicionada: la card indica que el resultado de esta ejecucion concreta esta en los ficheros de filas del repositorio y que las tablas del README de la receta corresponden a otras ejecuciones. Citar cifras de la card sin comprobarlas en esos ficheros puede inducir a error.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/while-ai/course-refunds-grpo-1.5b
- Receta de entrenamiento GRPO: https://github.com/whilehq/whileai-sdk/tree/main/recipes/04-train/grpo
- SDK whileai: https://github.com/whilehq/whileai-sdk
- Coleccion "Course and community runs": https://huggingface.co/collections/while-ai/course-and-community-runs-6ab271de189fd0c363cfab92
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo. Las busquedas devolvieron unicamente resultados sobre la traduccion y el uso de la palabra inglesa "while" (diccionarios y el articulo sobre la estructura de control `while`), sin relacion con este artefacto.
