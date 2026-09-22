# while-ai/paper-sao-single-rollout-1.5b

## Resumen

`while-ai/paper-sao-single-rollout-1.5b` es un adaptador LoRA publicado por el proyecto while-ai como parte de su coleccion "Papers, replicated". No es un modelo de proposito general, sino el artefacto reproducible de un experimento de aprendizaje por refuerzo: aplica un gradiente de politica con una sola rollout (*single-rollout policy gradient*) sobre el modelo base Qwen/Qwen2.5-1.5B-Instruct, usando un critico de una sola capa (`value_head.pt`) como linea base y el dataset GSM8K como tarea de razonamiento aritmetico. El experimento concreto que aisla esta receta es el enmascarado de tokens cuyo ratio de importancia queda fuera de la banda (0,7, 6,0).

El resultado principal es llamativo y conviene leerlo con cuidado: tanto la receta con enmascarado como la linea base sin enmascarar pasan de un pass@1 de 0,36 a 0,46, es decir, toda la mejora procede del gradiente con linea base de critico, no de la mascara. La banda solo enmascaro el 0,03 % de los tokens, de modo que la innovacion propuesta quedo practicamente inactiva y la diferencia entre brazos es de -0,004 (IC 95 % [-0,040, +0,031]) sobre 120 tareas emparejadas.

Su relevancia es metodologica antes que de rendimiento: demuestra que una receta de post-entrenamiento por RL se puede ejecutar en unos 20 minutos de GPU (20,1 GPU-min frente a 25,7 GPU-min del baseline) y que conviene registrar la fraccion de tokens enmascarados por paso (`masked_share`) para comprobar la alcanzabilidad de la mascara antes de gastar horas de computo. Con 0 descargas y 0 likes en el momento de la consulta, es un artefacto de investigacion sin validacion externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only: Qwen/Qwen2.5-1.5B-Instruct |
| Parametros totales | 1,5 mil millones en el modelo base; numero de parametros del adaptador no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (se hereda del modelo base, sin documentar en esta ficha) |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos de adaptador en safetensors |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA) y `value_head.pt` (critico de una capa) |
| Modelo base | Qwen/Qwen2.5-1.5B-Instruct |
| Dataset de entrenamiento | openai/gsm8k |
| Tamano del repositorio | 0,1 GB |
| Libreria de carga | peft |
| Tarea declarada | text-generation |

## Arquitectura y entrenamiento

El modelo base es Qwen2.5-1.5B-Instruct, un transformer decoder-only de 1,5 mil millones de parametros, y el artefacto publicado es un adaptador LoRA entrenado con PEFT, mas un critico de una sola capa almacenado aparte en `value_head.pt`. El metodo de entrenamiento es un gradiente de politica de una sola rollout con linea base proporcionada por ese critico: se genera una unica trayectoria por prompt, se calcula la ventaja respecto al valor estimado por el critico y se actualiza la politica con ese gradiente. La receta concreta de esta publicacion anade un enmascarado de los tokens cuyo ratio de importancia de la politica queda fuera del intervalo abierto (0,7, 6,0).

No se documentan en la informacion disponible el numero total de tokens de entrenamiento, la composicion exacta del dataset mas alla de GSM8K ni el uso de RLHF o DPO; el pipeline descrito es puramente de policy gradient sobre recompensas verificables de la tarea. El experimento se ejecuta en dos fases (10 + 40 pasos) y la receta registra por paso la fraccion de tokens enmascarados (`masked_share`), de forma que se puede comprobar si la banda de enmascarado llega a activarse antes de lanzar el entrenamiento. En esta ejecucion concreta la banda enmascaro solo el 0,03 % de los tokens, por lo que ambos brazos comparados acabaron siendo, en la practica, el mismo experimento.

## Capacidades

- Generacion de texto conversacional: el adaptador mantiene la interfaz de instrucciones del modelo base y se carga con `PeftModel.from_pretrained`.
- Razonamiento aritmetico de nivel escolar: la tarea objetivo es GSM8K, con un pass@1 de 0,46 y un pass@4 de 0,71 en el brazo de la receta.
- Replicacion reproducible de experimentos: la receta fija semilla, versiones de libreria y GPU, y publica `train_log.json` con el registro por paso.
- Evaluacion comparativa de recetas de RL: los brazos se evaluan sobre 120 tareas emparejadas con intervalos de confianza al 95 %.
- Uso como inicializacion para post-entrenamiento adicional: al ser un adaptador PEFT, se puede componer con otros adaptadores o continuar su entrenamiento.
- Soporte de tool calling y function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion disponible.
- Capacidades multilingues: no documentadas; el idioma de la ficha y del dataset es el ingles.
- Modo de pensamiento explicito, vision o audio: no disponibles.

## Casos de uso

- Replicacion de resultados de investigacion: la receta se ejecuta con `python recipe.py` tras clonar el repositorio, con semilla, versiones y GPU fijadas; al costar 20,1 GPU-min, una replicacion completa cabe en una sesion corta de una sola GPU.
- Auditoria de tecnicas de enmascarado de ratio de importancia: como la receta registra `masked_share` por paso, se puede verificar si la banda (0,7, 6,0) es alcanzable en un dataset dado antes de comprometer horas de GPU; en este caso el 0,03 % de tokens enmascarados demuestra que la banda era demasiado ancha.
- Comparacion controlada de algoritmos de policy gradient: los brazos "baseline" y "recipe" se evaluan sobre las mismas 120 tareas emparejadas, lo que permite contrastar hipotesis con intervalos de confianza en lugar de con numeros sueltos.
- Generacion de soluciones a problemas aritmeticos con seleccion por muestreo: con pass@1 de 0,46 y pass@4 de 0,71, el modelo sirve en escenarios donde se generan varias candidatas y un verificador externo elige la correcta, no en escenarios de respuesta unica.
- Docencia y formacion en post-entrenamiento por RL: el repositorio de 0,1 GB se carga en unas pocas lineas de Python y muestra el ciclo completo (rollout, critico, ventaja, actualizacion con mascara) en un modelo que cabe en una GPU de consumo.
- Punto de partida para experimentos posteriores: el adaptador y el critico se pueden reutilizar como inicializacion para estudiar estaleness de rollouts, cambios de banda de enmascarado o variaciones del coeficiente de la linea base.
- Analisis de coste computacional de recetas: la ficha publica GPU-min por brazo (20,1 frente a 25,7), lo que permite comparar recetas por coste ademas de por metrica.
- Asistente conversacional en produccion: no es un caso de uso adecuado con los datos disponibles; el ajuste esta especializado en GSM8K y no hay evaluacion de calidad conversacional general.

## Benchmarks y rendimiento

Resultados publicados en la model card. Todas las cifras corresponden a evaluaciones sobre GSM8K; los intervalos son del 95 %.

| Brazo | pass@1 | IC 95 % | pass@4 | Pasos | GPU min |
|---|---|---|---|---|---|
| Base, sin entrenamiento | 0,36 | [0,30, 0,44] | 0,59 | 0 | 0 |
| Baseline (ratio aplicado, nunca enmascarado) | 0,46 | [0,40, 0,53] | 0,72 | 10 + 40 | 25,7 |
| Recipe (`wai.SAO()`, enmascarado fuera de (0,7, 6,0)) | 0,46 | [0,40, 0,53] | 0,71 | 10 + 40 | 20,1 |

Comparacion receta frente a baseline: -0,004 [-0,040, +0,031] sobre 120 tareas emparejadas. La banda enmascaro el 0,03 % de los tokens. Segun el autor, ambos brazos pasaron de 0,36 a 0,46 gracias al gradiente de una sola rollout con linea base de critico, no gracias a la mascara. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval u otros) en la informacion disponible.

## Requisitos de hardware

- Adaptador: 0,1 GB en disco (tamano del repositorio). El critico se publica como `value_head.pt`; su tamano no se detalla.
- Pesos del modelo base Qwen2.5-1.5B-Instruct: aproximadamente 3,1 GB en bf16/fp16 y en torno a 1 GB en cuantizacion de 4 bits (estimaciones estandar para 1,5 mil millones de parametros; la model card no publica cuantizaciones).
- GPU de consumo: el modelo base cabe con holgura en tarjetas de 8-12 GB (por ejemplo RTX 3060 12 GB, RTX 4060 Ti 16 GB) y en gamas altas (RTX 3090, RTX 4090) sin cuantizar.
- GPU de datacenter: A100, H100 o L40S son suficientes y sobredimensionadas para inferencia; su interes aqui es acortar el ciclo de entrenamiento por RL.
- Entrenamiento: la receta declara 20,1 GPU-min para el brazo con enmascarado y 25,7 GPU-min para el baseline, en ambos casos con 50 pasos (10 + 40). El modelo exacto de GPU no esta disponible en la informacion proporcionada, aunque la receta lo fija.
- Opciones de despliegue documentadas: `transformers` + `peft` (unico procedimiento descrito en la model card).
- Otras opciones de despliegue (vLLM, TGI, llama.cpp, Ollama): no documentadas. Serian tecnicamente posibles fusionando el adaptador con el modelo base, pero no hay instrucciones ni validacion publicadas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La informacion disponible solo permite comparar los brazos del propio experimento, no el modelo frente a alternativas de terceros.

| Brazo | pass@1 (GSM8K) | pass@4 | Pasos de entrenamiento | GPU min | Licencia |
|---|---|---|---|---|---|
| Base sin entrenamiento | 0,36 | 0,59 | 0 | 0 | apache-2.0 (Qwen2.5-1.5B-Instruct) |
| Baseline con ratio, sin enmascarar | 0,46 | 0,72 | 10 + 40 | 25,7 | apache-2.0 |
| Receta con enmascarado (0,7, 6,0) | 0,46 | 0,71 | 10 + 40 | 20,1 | apache-2.0 |

Comparacion con otros modelos de ~1,5 B parametros orientados a razonamiento (por ejemplo destilaciones de familias tipo R1 o instruction-tuned de la misma escala): no disponible, no se aportan mediciones en la informacion proporcionada.

## Limitaciones y advertencias

- La innovacion que da nombre a la receta no se activo: la banda (0,7, 6,0) enmascaro solo el 0,03 % de los tokens, por lo que la comparacion entre brazos no prueba el efecto del enmascarado.
- La diferencia medida entre receta y baseline (-0,004) es muy inferior al ancho del intervalo de confianza, por lo que no puede interpretarse como mejora.
- El rendimiento absoluto es bajo para uso productivo: pass@1 de 0,46 en GSM8K implica que mas de la mitad de los problemas se resuelven mal con una sola muestra.
- El adaptador esta especializado en GSM8K; no hay evidencia de que conserve calidad conversacional general ni de que no haya deriva de formato tras el entrenamiento por RL.
- No hay datos sobre idiomas soportados; el dataset y la receta son en ingles, por lo que el comportamiento en castellano no esta caracterizado.
- El repositorio solo contiene el adaptador y el critico. El directorio `checkpoints/` nunca se publica, asi que no hay estados intermedios de entrenamiento disponibles.
- Dependencia estricta del modelo base Qwen/Qwen2.5-1.5B-Instruct: el adaptador no funciona sin el.
- Ausencia de validacion externa: 0 descargas y 0 likes en el momento de la consulta, un unico brazo publicado y ninguna actualizacion posterior a la creacion del repositorio.
- Licencia apache-2.0 tanto en el adaptador como, segun la ficha, en el modelo base, lo que permite uso comercial; aun asi conviene verificar los terminos vigentes de Qwen antes de desplegarlo.
- Riesgo de alucinacion inherente a un modelo de 1,5 mil millones de parametros, agravado porque la tarea de entrenamiento son problemas aritmeticos con respuesta verificable y no dialogo abierto.
- Antes de citar cualquier cifra de esta ficha conviene leer la seccion "Learned" del README de la receta, tal como advierte el propio autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/while-ai/paper-sao-single-rollout-1.5b
- Receta reproducible (GitHub): https://github.com/whilehq/whileai-sdk/tree/main/recipes/papers/sao-single-rollout
- Repositorio del SDK: https://github.com/whilehq/whileai-sdk
- Coleccion "Papers, replicated": https://huggingface.co/collections/while-ai/papers-replicated-6ab271de22542eb550d4251c
- Dataset: https://huggingface.co/datasets/openai/gsm8k
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Paper original replicado: no disponible en la informacion proporcionada.
- Nota sobre la busqueda web: los resultados devueltos no guardan relacion con el modelo (son entradas de diccionario y articulos sobre el termino ingles "while" y la estructura de control homonima), por lo que no se incluye ningun enlace adicional procedente de esa busqueda.
