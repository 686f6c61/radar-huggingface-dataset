# while-ai/paper-zero-rl-format-reward-4b

## Resumen

paper-zero-rl-format-reward-4b es un adaptador LoRA de investigación publicado por while-ai sobre el modelo base Qwen/Qwen3.5-4B-Base. No es un modelo completo, sino el resultado de replicar un experimento de aprendizaje por refuerzo con recompensa verificable (RLVR) en el que se compara el efecto de dos diseños de recompensa distintos sobre la precisión en matemáticas: una recompensa estricta de formato (penaliza con -1 si la respuesta no va en una caja `\boxed{}`) frente a una recompensa que solo premia la corrección del resultado. El hallazgo central es que la recompensa rígida de formato cuesta precisión.

El entrenamiento es un "zero RL" puro: se parte de un modelo base sin SFT previo y se aplica GRPO sobre problemas de nivel 3 a 5 del dataset MATH-500. La ejecución completa, con ambos brazos de comparación, consumió 46,2 minutos de GPU en una única H100 y 30 pasos de optimización por brazo. El adaptador principal alcanza un pass@1 de 0,72 frente al 0,51 del modelo base sin entrenar, con una mejora pareada de +0,094 sobre el brazo de recompensa estricta.

Su relevancia es metodológica más que de producto: es un artefacto reproducible (receta pública, semillas fijadas, versiones de librerías ancladas) para estudiar cómo el diseño de la recompensa condiciona el comportamiento de un modelo pequeño de razonamiento matemático. El repositorio incluye siete adaptadores: los dos brazos del experimento principal y seis réplicas de semilla (17, 18, 19 por brazo) del seguimiento posterior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre Qwen/Qwen3.5-4B-Base; arquitectura interna del modelo base no disponible en la informacion proporcionada |
| Parametros totales | 4B en el modelo base; el adaptador no declara recuento propio de parametros (repositorio de 2,5 GB con siete adaptadores) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible para el adaptador; los pesos se distribuyen en safetensors de PEFT. Las cuantizaciones aplicables dependen de las que soporte el modelo base, no documentadas aqui |
| Idiomas soportados | No disponible (el dataset de entrenamiento, MATH-500, esta en ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptadores LoRA/PEFT, libreria `peft`) |

## Arquitectura y entrenamiento

El artefacto es un conjunto de adaptadores LoRA entrenados con GRPO (Group Relative Policy Optimization) sobre el modelo base Qwen3.5-4B-Base, sin fase previa de ajuste supervisado. El dataset es HuggingFaceH4/MATH-500, restringido a los niveles de dificultad 3 a 5. El entrenamiento se ejecuto el 18 de septiembre de 2026 durante 30 pasos por brazo en una sola H100: 26,4 minutos de GPU para el brazo baseline y 19,8 minutos para el brazo de la receta, 46,2 minutos en total.

La innovacion tecnica del experimento es el diseno de recompensa. El brazo "baseline" aplica una recompensa estricta de formato en caja, con penalizacion de -1 cuando la respuesta no aparece dentro de `\boxed{}`. El brazo "receta" elimina esa penalizacion y premia unicamente la correccion del resultado. En evaluacion ambos brazos se leen de forma permisiva, de modo que la comparacion mide una sola cosa: la exactitud. El resultado del articulo es contraintuitivo: la recompensa estricta de formato reduce la precision final (0,63 frente a 0,72), y el brazo de la receta, evaluado bajo la recompensa estricta del baseline, obtiene una puntuacion menor (0,53 frente a 0,58) porque "encaja menos respuestas en caja y acierta mas". El repositorio incluye ademas seis carpetas de semillas (`recipe-seed17/18/19`, `baseline-seed17/18/19`) del seguimiento del 21 de septiembre de 2026, cuyos resultados pareados aun no figuran en el README de la receta. Los checkpoints intermedios no se distribuyen.

## Capacidades

- Generacion de texto y resolucion de problemas matematicos de nivel de competicion (niveles 3 a 5 de MATH), con razonamiento paso a paso.
- Produccion de respuestas finales, opcionalmente en formato de caja `\boxed{}`; el brazo de la receta usa este formato con menos frecuencia que el baseline.
- Punto de partida para RLVR sobre modelos base de 4B: el adaptador demuestra que GRPO funciona sin SFT previo en este rango de tamano.
- Reproduccion de un experimento de investigacion completo: receta, semillas, versiones de librerias y GPU documentadas.
- Capacidades de tool calling o function calling: no documentadas.
- Soporte de agentes y razonamiento multi-paso autonomo: no documentado.
- Modo "thinking" explicito, vision o audio: no documentados.
- Capacidades multilingues: no documentadas; el entrenamiento y la evaluacion se realizan en ingles.

## Casos de uso

- Replicacion de experimentos de RLVR: usar la receta publicada para reproducir el resultado en una H100 y verificar la tabla de pass@1 con las mismas semillas, algo viable porque el coste es de menos de una hora de GPU.
- Estudio del diseno de recompensas: comparar los adaptadores `baseline` y raiz bajo distintas funciones de recompensa para medir como el incentivo de formato desplaza la distribucion de respuestas y la exactitud final.
- Analisis de varianza entre semillas: los seis adaptadores con semilla 17, 18 y 19 permiten estimar la dispersion del pass@1 dentro de cada brazo antes de extraer conclusiones sobre la diferencia entre brazos.
- Generacion de datos sinteticos de razonamiento matematico: el adaptador puede producir cadenas de solucion para problemas de MATH que despues se filtren por correccion y se usen como SFT para modelos mayores.
- Linea base de razonamiento matematico a escala 4B: sirve como referencia interna frente a metodos alternativos (PPO, DPO, RL con verificador) al mismo presupuesto de computo.
- Investigacion sobre hacking de recompensa: el brazo estricto es un caso documentado de como una recompensa de formato puede degradar la tarea objetivo, util como ejemplo en docencia o en auditoria de pipelines de RL.
- Punto de partida para ajuste posterior: al ser un adaptador PEFT sobre un base de 4B, se puede continuar el entrenamiento o fusionar los pesos para tareas matematicas especificas con coste reducido.

## Benchmarks y rendimiento

Datos publicados en la model card. Ejecucion del 18 de septiembre de 2026, ambos brazos, una H100.

| Brazo | pass@1 | IC 95% | pass@4 | Pasos | Minutos de GPU |
|---|---|---|---|---|---|
| Base, sin entrenamiento | 0,51 | [0,45, 0,57] | 0,74 | 0 | 0 |
| Baseline (recompensa estricta de caja, -1 sin caja) | 0,63 | [0,57, 0,68] | 0,80 | 30 | 26,4 |
| Receta (solo correccion) | 0,72 | [0,66, 0,77] | 0,88 | 30 | 19,8 |

Comparacion receta frente a baseline: +0,094 con intervalo [+0,052, +0,139] sobre 160 tareas pareadas. Bajo la recompensa estricta del baseline, el brazo de la receta puntua 0,53 frente a 0,58. El autor indica que la banda de ruido esta fijada por tres reejecuciones del modelo base. No se han publicado en la informacion disponible resultados de benchmarks tipo MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia (estimacion propia a partir de los 4B de parametros del modelo base, no facilitada por el autor): aproximadamente 8-9 GB en FP16, 4-5 GB en cuantizacion de 8 bits y 2,5-3 GB en 4 bits, mas la cache KV, cuyo tamano no puede calcularse por falta de la longitud de contexto.
- El adaptador LoRA en si ocupa decenas de megabytes; el repositorio completo con los siete adaptadores pesa 2,5 GB.
- GPU de datacenter usadas en el entrenamiento: una H100, con 46,2 minutos de GPU para los dos brazos completos (26,4 y 19,8 minutos respectivamente).
- Cabe en GPU de consumo: si, previsiblemente en cualquier tarjeta con 8 GB o mas de VRAM para FP16 (RTX 3060 12 GB, RTX 4070, RTX 4090, etc.) y en tarjetas de 4-6 GB con cuantizacion de 4 bits.
- Opciones de despliegue: el unico camino documentado en la model card es `transformers` + `peft` (`AutoModelForCausalLM.from_pretrained` y `PeftModel.from_pretrained`). vLLM y TGI soportan adaptadores LoRA de forma nativa, pero no hay confirmacion del autor para este adaptador. Para llama.cpp u Ollama seria necesario fusionar el adaptador con el modelo base y convertir el resultado a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | pass@1 (MATH-500, niveles 3-5) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| paper-zero-rl-format-reward-4b (brazo receta) | 4B (base) + LoRA | No disponible | 0,72 | apache-2.0 | Adaptador PEFT en HuggingFace |
| paper-zero-rl-format-reward-4b (brazo baseline) | 4B (base) + LoRA | No disponible | 0,63 | apache-2.0 | Subcarpeta `baseline` del mismo repositorio |
| Qwen/Qwen3.5-4B-Base, sin entrenar | 4B | No disponible | 0,51 | No disponible en la informacion proporcionada | Modelo base en HuggingFace |

No se dispone de datos verificables de modelos de terceros de la misma categoria (adaptadores de RLVR sobre bases de 3B-4B) en la informacion proporcionada, por lo que no se incluye una comparacion externa de rendimiento.

## Limitaciones y advertencias

- Es un adaptador LoRA, no un modelo autonomo: requiere descargar y cargar Qwen/Qwen3.5-4B-Base para funcionar.
- El modelo base es un modelo base, no ajustado por instrucciones: no cabe esperar un comportamiento conversacional fiable ni seguimiento de instrucciones complejas.
- Evaluacion muy acotada: MATH-500 niveles 3 a 5, en ingles, con lectura permisiva. No hay evidencia publicada sobre generalizacion a otros dominios, idiomas o niveles de dificultad.
- Entrenamiento de solo 30 pasos por brazo: el margen entre brazos esta respaldado por un intervalo pareado de [+0,052, +0,139] sobre 160 tareas, pero los intervalos de cada brazo son amplios (±0,06) y la varianza entre semillas no esta cuantificada en el README.
- El brazo de la receta genera menos respuestas en formato `\boxed{}`: cualquier pipeline posterior que dependa de extraer la respuesta con una expresion regular de caja necesitara un parser mas tolerante o un paso adicional de extraccion.
- Riesgo de alucinacion: el modelo puede producir cadenas de razonamiento plausibles con resultados incorrectos; la recompensa premia el resultado final, no la validez de cada paso intermedio.
- Sesgos: no documentados por el autor; el entrenamiento se limita a un dataset de problemas matematicos en ingles.
- Licencia: el adaptador es apache-2.0, pero el uso comercial esta condicionado tambien por la licencia del modelo base Qwen3.5-4B-Base, cuya licencia no figura en la informacion proporcionada y debe verificarse por separado.
- Los checkpoints intermedios no se distribuyen, por lo que no es posible reanudar el entrenamiento desde un estado guardado.
- Artefacto de investigacion con cero descargas y cero "likes" en el momento de la consulta: no hay evidencia de uso en produccion ni validacion por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/while-ai/paper-zero-rl-format-reward-4b
- Receta reproducible: https://github.com/whilehq/whileai-sdk/tree/main/recipes/papers/zero-rl-format-reward
- Coleccion "Papers, replicated": https://huggingface.co/collections/while-ai/papers-replicated-6ab271de22542eb550d4251c
- Dataset de entrenamiento y evaluacion: https://huggingface.co/datasets/HuggingFaceH4/MATH-500
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base

Las busquedas web realizadas no devolvieron resultados relevantes sobre este modelo; los unicos resultados obtenidos fueron entradas de diccionarios de traduccion para el termino ingles "while" y el articulo de Wikipedia sobre la estructura de control `while`, sin relacion con el artefacto.
