# while-ai/paper-flash-reinforce-1.5b

## Resumen

paper-flash-reinforce-1.5b es un adaptador LoRA publicado por while-ai que reproduce, sobre un modelo base pequeno, la receta de aprendizaje por refuerzo descrita como FlashREINFORCE: REINFORCE con una sola rollout por prompt, muestreada desde un sampler congelado ("stale sampler"), con correccion de razon de importancia, una "trust gate" y normalizacion por longitud. El objetivo no es ofrecer un modelo de proposito general, sino servir como artefacto reproducible de investigacion: un banco de pruebas para estudiar el entrenamiento asincrono, donde la generacion de rollouts se solapa con la actualizacion del modelo y los datos de entrenamiento llegan desfasados respecto a los pesos actuales.

El adaptador se aplica sobre Qwen/Qwen2.5-1.5B-Instruct (1.500 millones de parametros) y se ha entrenado exclusivamente con el dataset openai/gsm8k, un conjunto de problemas de matematicas de nivel escolar. El repositorio contiene unicamente los pesos del adaptador (formato PEFT/safetensors, aproximadamente 0.1 GB); no incluye checkpoints intermedios ni pesos fusionados. La licencia declarada es Apache 2.0.

Su relevancia actual es metodologica: el propio autor califica el resultado como "unresolved" y documenta que la correccion tuvo poco que corregir, porque el desfase entre sampler y learner fue minimo (KL media de 3e-4) y la trust gate solo enmascaro una de 64 trayectorias en 5 de 40 pasos. Es, por tanto, un ejemplo de publicacion honesta de un resultado negativo o no concluyente, util para quien disene entrenamientos RL asincronos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre Qwen/Qwen2.5-1.5B-Instruct; arquitectura interna del modelo base no detallada en la informacion disponible |
| Parametros totales | 1.5B en el modelo base; el repositorio solo contiene los pesos del adaptador (0.1 GB) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se declaran cuantizaciones publicadas para este adaptador) |
| Idiomas soportados | no disponible (los tags de HuggingFace no incluyen lista de idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, adaptador PEFT/LoRA (libreria `peft`) |

## Arquitectura y entrenamiento

La contribucion del repositorio es un procedimiento de entrenamiento, no una arquitectura nueva. Sobre el modelo base Qwen2.5-1.5B-Instruct se anade un adaptador LoRA y se optimiza con REINFORCE de una sola rollout por prompt. Los rollouts se generan con una copia congelada del adaptador que se refresca cada 4 pasos de optimizador, imitando el comportamiento de un entrenador asincrono que solapa generacion e inferencia. Sobre esa base "stale" se aplican tres piezas de la receta FlashREINFORCE: una razon de importancia para corregir el desfase entre la politica que genero la muestra y la politica que aprende, una trust gate que descarta trayectorias cuyo desfase es excesivo, y normalizacion por longitud de la senal de recompensa.

El unico dato de entrenamiento declarado es el dataset openai/gsm8k. No se especifica el numero de tokens, la composicion del dataset, ni si se aplicaron etapas de RLHF o DPO adicionales. El entrenamiento reportado consta de 40 pasos: 22.9 minutos de GPU para el brazo baseline y 21.3 minutos de GPU para el brazo de la receta. Segun la model card, el desfase real fue minimo: KL media entre sampler y learner de 3e-4, y la trust gate enmascaro una de 64 trayectorias en 5 de los 40 pasos, lo que sugiere que el escenario experimental apenas activo el mecanismo que la receta pretende mejorar.

## Capacidades

- Generacion de texto conversacional (`pipeline_tag: text-generation`), heredada del modelo base Qwen2.5-1.5B-Instruct.
- Resolucion de problemas aritmeticos de nivel escolar, el unico dominio sobre el que se ha optimizado (GSM8K).
- Generacion de cadenas de razonamiento paso a paso para problemas de matematicas, en el formato inducido por el dataset de entrenamiento.
- Capacidades conversacionales del modelo base (instrucciones, dialogos multi-turno), si bien el ajuste RL puede haber alterado su calibracion fuera de GSM8K.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada para este adaptador (el modelo base podria ofrecerlo, pero no se documenta aqui).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; los idiomas no se declaran en el repositorio.
- Capacidades especiales (vision, audio, modo thinking explicito): no disponibles.

Conviene subrayar que se trata de un adaptador de investigacion: no hay evaluacion publicada de sus capacidades fuera de GSM8K.

## Casos de uso

- Replicacion de experimentos de RL: el repositorio incluye `recipe.py` y un `history.json` con el log por paso, de modo que un equipo de investigacion puede reproducir la ejecucion fijando semilla, versiones de libreria y GPU, y comparar contra el brazo baseline.
- Estudio de entrenamiento asincrono y off-policy: sirve para medir cuanto desfase real ("staleness") tolera REINFORCE en modelos pequenos y si mecanismos como la razon de importancia aportan algo cuando la KL entre sampler y learner es del orden de 1e-4.
- Docencia y formacion en RL para LLM: al ser un unico adaptador LoRA de 0.1 GB sobre un modelo de 1.5B, es un ejemplo manejable para explicar en clase el ciclo completo de generacion de rollouts, calculo de recompensa y actualizacion con LoRA.
- Pruebas de infraestructura de entrenamiento asincrono: con 40 pasos y aproximadamente 21-23 minutos de GPU por brazo, es un banco de pruebas barato para validar pipelines que solapan inferencia y entrenamiento antes de escalar a modelos mayores.
- Generacion de soluciones aritmeticas de nivel escolar en un prototipo: puede usarse para resolver problemas tipo GSM8K en una demo interna, asumiendo que su pass@1 medido es 0.41 y que no hay garantia fuera de la distribucion del dataset.
- Punto de partida para ajuste LoRA adicional en dominios concretos: al ser un adaptador PEFT, se puede seguir entrenando o combinar con otros adaptadores, siempre que se asuma que la base de partida ya esta sesgada hacia GSM8K.
- Evaluacion comparativa de metodos RL a pequena escala: el repositorio publica pass@1, pass@4, intervalos de confianza al 95 % y el coste en minutos de GPU, lo que permite usarlo como referencia en estudios comparativos de algoritmos.

## Benchmarks y rendimiento

Datos publicados en la model card (tareas de GSM8K, 120 tareas pareadas para la comparacion entre brazos):

| Brazo | pass@1 | IC 95 % | pass@4 | Pasos | Minutos de GPU |
|---|---|---|---|---|---|
| Base, sin entrenamiento | 0.40 | [0.33, 0.47] | 0.58 | 0 | 0 |
| Baseline (REINFORCE stale sin corregir) | 0.47 | [0.41, 0.55] | 0.68 | 40 | 22.9 |
| Receta (`wai.FlashReinforce`) | 0.41 | [0.34, 0.48] | 0.63 | 40 | 21.3 |

Comparacion receta frente a baseline: -0.069 con intervalo [-0.115, -0.025] sobre 120 tareas pareadas. Veredicto declarado por el autor: **unresolved**, con una sola semilla por brazo. Es decir, la receta no mejoro al baseline e incluso quedo por debajo, y con una unica semilla no puede descartarse variabilidad aleatoria. Contexto adicional reportado: KL media sampler-to-learner de 3e-4 y enmascaramiento de 1 de 64 trayectorias en 5 de 40 pasos, lo que indica que el escenario apenas genero staleness que corregir. Solo se conservo el adaptador del brazo de la receta. No hay otros benchmarks publicados en la informacion disponible.

## Requisitos de hardware

- El adaptador ocupa aproximadamente 0.1 GB, segun el tamano del repositorio declarado en HuggingFace.
- El modelo base asociado tiene 1.500 millones de parametros. Como estimacion derivada de ese tamano (no publicada en la informacion disponible): alrededor de 3 GB de VRAM en FP16/BF16 para los pesos, mas memoria para el contexto y el cache KV; en cuantizacion de 4 bits el orden de magnitud baja a aproximadamente 1 GB de pesos.
- Coste de entrenamiento reportado: 21.3 minutos de GPU para 40 pasos en el brazo de la receta y 22.9 minutos en el baseline. La model card indica que fija la GPU, pero no especifica el modelo exacto en la informacion proporcionada.
- Cabe en GPU de consumo: dado el tamano del modelo base (1.5B), es esperable que quepa en tarjetas consumer tipo RTX 3060/4060/4090, aunque no hay confirmacion explicita en la informacion disponible.
- GPU de datacenter (A100, H100) no son necesarias para inferencia a este tamano; no se documentan cifras de latencia ni throughput.
- Opciones de despliegue: carga mediante `peft.PeftModel` + `transformers` tal como muestra la model card. Otras opciones (vLLM con adaptadores LoRA, TGI, llama.cpp u Ollama) requeririan fusionar el adaptador con el base y convertir a GGUF; no estan documentadas ni verificadas en la informacion disponible.

## Comparativa con modelos similares

La unica comparativa con datos publicados es interna al propio repositorio:

| Modelo | Parametros | Contexto | pass@1 (GSM8K) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| paper-flash-reinforce-1.5b (receta) | 1.5B (base) + LoRA | no disponible | 0.41 | Apache 2.0 | Adaptador en HuggingFace |
| Baseline stale REINFORCE (mismo repo, otro brazo) | 1.5B (base) + LoRA | no disponible | 0.47 | Apache 2.0 | No publicado como carpeta independiente en este repositorio |
| Qwen/Qwen2.5-1.5B-Instruct (base sin entrenar) | 1.5B | no disponible en esta ficha | 0.40 | Apache 2.0 | Modelo base publico en HuggingFace |

Frente a alternativas externas de la misma categoria (otros adaptadores RL de razonamiento sobre modelos de 1-2B), no hay datos de comparacion en la informacion proporcionada: no disponible.

## Limitaciones y advertencias

- El resultado principal es no concluyente: el autor declara veredicto "unresolved" y una unica semilla por brazo, por lo que la diferencia de -0.069 frente al baseline no permite extraer una conclusion firme.
- La receta quedo por debajo del baseline sin corregir (0.41 frente a 0.47) y practicamente igual que el modelo base sin entrenar (0.40). No debe presentarse como una mejora demostrada.
- El escenario experimental apenas genero staleness (KL media de 3e-4, trust gate activada en 5 de 40 pasos), de modo que el resultado no valida ni refuta el mecanismo en regimenes de desfase alto.
- Entrenado unicamente sobre openai/gsm8k: se espera sobreajuste al formato y al dominio de problemas aritmeticos escolares, con degradacion fuera de ese reparto.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad factual para este adaptador; al ser un modelo de 1.5B ajustado con RL sobre una tarea estrecha, el riesgo de respuestas plausibles pero incorrectas es relevante en uso general.
- Sesgos conocidos: no documentados en la informacion disponible. El ajuste con RL sobre un dataset unico puede amplificar sesgos de formato presentes en GSM8K.
- Idiomas: no declarados. El ajuste se hizo sobre un dataset en el idioma de GSM8K (no confirmado como multiligue en esta informacion), por lo que el rendimiento en castellano no esta garantizado.
- Licencia Apache 2.0, que permite uso comercial, pero el repositorio solo distribuye el adaptador LoRA: para desplegarlo hay que cargarlo junto al modelo base Qwen2.5-1.5B-Instruct y respetar tambien la licencia de este.
- Orientado a investigacion: no incluye checkpoints intermedios, no publica el brazo baseline como carpeta independiente y no ofrece garantias de produccion ni SLA.

## Enlaces

- HuggingFace: https://huggingface.co/while-ai/paper-flash-reinforce-1.5b
- Repositorio de la receta: https://github.com/whilehq/whileai-sdk/tree/main/recipes/papers/flash-reinforce
- SDK: https://github.com/whilehq/whileai-sdk
- Coleccion "Papers, replicated": https://huggingface.co/collections/while-ai/papers-replicated-6ab271de22542eb550d4251c
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Dataset: https://huggingface.co/datasets/openai/gsm8k
- Paper de FlashREINFORCE: no disponible en la informacion proporcionada
- Las busquedas web realizadas no devolvieron enlaces relevantes sobre este modelo; los resultados obtenidos correspondian a traducciones del termino ingles "while" y a la entrada de Wikipedia sobre la estructura de control "bucle while", sin relacion con el modelo.
