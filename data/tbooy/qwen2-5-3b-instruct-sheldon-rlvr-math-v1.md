# tbooy/Qwen2.5-3B-Instruct-Sheldon-RLVR-math-v1

## Resumen

Qwen2.5-3B-Instruct-Sheldon-RLVR-math-v1 es un ajuste fino del modelo Qwen2.5-3B-Instruct de Alibaba, publicado por el usuario tbooy como tercera etapa de un proyecto de la asignatura CS 2881R de la Universidad de Harvard. Sobre una version ya adaptada a la persona del Dr. Sheldon Cooper (etapa SFT) y despues entrenada con RLAIF y GRPO (grpo-v2), esta version aplica aprendizaje por refuerzo con recompensa verificable (RLVR) sobre problemas de matematicas, con una recompensa binaria que comprueba si la ultima respuesta dentro de `\boxed{}` coincide con la referencia.

El problema que aborda es concreto y esta documentado por el propio autor: las etapas de personificacion destruyeron buena parte de la capacidad matematica del modelo base (MATH-500 en greedy paso de 68,0 a 34,0) y la etapa RLAIF no la recupero. Este entrenamiento RLVR recupera la mayor parte (65,0 en MATH-500 greedy, 81,9 en GSM8K), aunque se queda entre 3 y 4 puntos por debajo del Qwen2.5-3B-Instruct original y por debajo tambien en AIME pass@16. Es relevante como caso reproducible de RLVR con GRPO, LoRA y vLLM, con codigo, funcion de recompensa y evaluacion publicados.

Tiene 3.085.938.688 parametros (modelo denso, no MoE), pesos fusionados en bf16 y soporta unicamente ingles. La ficha no especifica la longitud de contexto ni cuantizaciones publicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2), con adaptador LoRA fusionado en los pesos |
| Parametros totales | 3.085.938.688 (3,09 mil millones) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; las completaciones de entrenamiento se truncaron a 2.048 tokens |
| Tipos de cuantizacion | no disponible; el repositorio publica pesos fusionados en bf16 (safetensors) |
| Idiomas soportados | ingles (en) |
| Licencia | qwen-research (campo `license: other`, con enlace al texto de Qwen) |
| Formato de pesos | safetensors (bf16) + tokenizer + `chat_template.jinja` |
| Metodo de ajuste | RLVR con GRPO/CISPO sobre LoRA r=32, alpha=64, en todas las proyecciones lineales |
| Modelo base | tbooy/Qwen2.5-3B-Instruct-Sheldon-RLAIF-grpo-v2 (que parte de Qwen2.5-3B-Instruct) |
| Dataset de entrenamiento | rasbt/math_full_minus_math500; evaluacion con HuggingFaceH4/MATH-500 y openai/gsm8k |
| Tamano del repositorio | 6,2 GB |
| Libreria | transformers (guardado con transformers 5.x, clave `dtype`) |
| Descargas / likes | 193 / 0 |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso de la familia Qwen2 con 3,09 mil millones de parametros. Se distribuye con el adaptador LoRA final ya fusionado en los pesos del checkpoint grpo-v2, en bf16, cargable con `AutoModelForCausalLM` estandar. El ajuste es una etapa de RLVR (reinforcement learning with verifiable rewards) que entrena exclusivamente con una recompensa binaria: 1 si la ultima respuesta dentro de `\boxed{}` coincide con la referencia (mediante una via rapida de coincidencia exacta y despues equivalencia con `math-verify`), 0 en caso contrario. Las completaciones que alcanzan el limite de 2.048 tokens se enmascaran fuera de la perdida y de las estadisticas de grupo, y se aplica una penalizacion DAPO de longitud excesiva suave (cache de 512 tokens) sobre completaciones terminadas.

El entrenamiento usa un `GRPOTrainer` de TRL 1.13 (subclase), LoRA r=32/alpha=64, AdamW con lr 2e-5 (betas 0,9/0,95, eps 1e-15, weight decay 0,01), schedule WSD (10 pasos de warm-up, estable hasta 160, decaimiento lineal hasta el 10 por ciento en los ultimos 40), 200 pasos x 16 prompts x 16 completaciones (51.000 rollouts), temperatura 1,0, perdida CISPO (eps_high 5), ventajas basadas en la desviacion estandar del grupo, enmascarado de grupos con varianza cero, agregacion a nivel de prompt, sin termino KL y cabeza LM en fp32. Se ejecuto con vLLM colocado en 2x H200 durante 2 horas y 13 minutos. Los prompts provienen de `rasbt/math_full_minus_math500` (MATH train mas los problemas de test de MATH que no estan en MATH-500), con 189 casi-duplicados adicionales de MATH-500 eliminados mediante similitud de 10-gramas o edicion mayor o igual a 0,9, y un curriculo de tasa de exito construido a partir de rollouts del modelo semilla.

## Capacidades

- Generacion de texto conversacional en ingles con formato de chat de Qwen (system prompt incluido).
- Razonamiento matematico paso a paso con la instruccion `Please reason step by step, and put your final answer within \boxed{}.` y respuesta final parseable de forma automatica.
- Aritmetica y problemas de competicion de nivel MATH y GSM8K, con rendimiento cercano al modelo base sin ajustar.
- Personificacion del Dr. Sheldon Cooper, heredada de la etapa SFT y no reevaluada tras el RLVR (el autor solo indica comprobaciones puntuales que siguen siendo coherentes con el personaje).
- Tool calling / function calling: no documentado en la ficha para este ajuste.
- Soporte de agentes y razonamiento multi-paso: no documentado; el unico modo multi-paso evidenciado es la cadena de razonamiento matematica.
- Capacidades multilingues: no; el modelo declara unicamente ingles (`language: en`).
- Capacidades especiales: no hay modo thinking explicito ni vision ni audio; la salida verificable con `\boxed{}` es el unico mecanismo destacable.

## Casos de uso

- Reproduccion de experimentos de RLVR: el modelo es la tercera etapa de una cadena SFT -> RLAIF/GRPO -> RLVR, con el script de recompensa, el grader y los resultados publicados en el repositorio de GitHub, lo que permite replicar el pipeline sobre 2x H200 y comparar curvas de aprendizaje por checkpoint.
- Estudio del trade-off entre personificacion y capacidad matematica: sirve como caso medido de como un SFT de persona degrada MATH-500 de 68,0 a 34,0 y como el RLVR recupera hasta 65,0, util para decidir si conviene separar personaje y capacidad en dos modelos.
- Generacion de soluciones matematicas verificables automaticamente: la salida siempre puede parsearse por el ultimo `\boxed{}`, lo que encaja en pipelines de evaluacion con `math-verify` sin necesidad de un juez LLM.
- Generacion de datos sinteticos de razonamiento matematico: puede producir cadenas de razonamiento con respuesta final y filtrarlas por verificacion exacta antes de usarlas como datos de entrenamiento, con la advertencia de que su tasa de exito es inferior a la del modelo base.
- Prototipado local en hardware de consumo: con 3,09 mil millones de parametros y pesos bf16 de 6,2 GB, se puede servir en una GPU de 12-16 GB para experimentar con RLVR sin acceso a clúster.
- Docencia y practicas de posgrado (CS 2881R): sirve como modelo de referencia para ensenar GRPO, CISPO, LoRA, curriculos de prompts y evaluacion con vLLM, incluyendo el analisis de grupos con varianza cero.
- Comparacion de baselines en evaluacion matematica: util como punto intermedio en una tabla junto al Qwen2.5-3B-Instruct original y al modelo semilla para cuantificar perdidas por etapas.
- Demostraciones de personaje conversacional con matematicas: para prototipos de tutoria con caracter, siempre que se acepte la calidad de persona no medida y el rendimiento matematico inferior al base.

## Benchmarks y rendimiento

Datos de la ficha del autor (evaluacion con vLLM; MATH-500 avg@4 a temperatura 0,6 y 4.096 tokens; AIME avg@16 y pass@16; GSM8K test en greedy):

| Modelo | MATH-500 greedy | MATH-500 avg@4 | L3-5 avg@4 | L5 | GSM8K | AIME 24/25/26 avg@16 | AIME pass@16 | Tokens medios |
|---|---|---|---|---|---|---|---|---|
| Qwen2.5-3B-Instruct (base) | 68,0 | 66,6 | 59,0 | 40,1 | 86,1 | 8,1 / 2,3 / 4,4 | 21,1 | 633 |
| RLAIF grpo-v2 (semilla) | 34,0 | 29,6 | 21,0 | 10,6 | 63,6 | 0,4 / 0,4 / 0,0 | 3,3 | 357 |
| Este modelo | 65,0 | 63,5 | 55,2 | 37,3 | 81,9 | 5,0 / 2,7 / 2,3 | 17,8 | 541 |

Evolucion de MATH-500 niveles 3-5 (avg@4) por checkpoint: 25 pasos: 27,3; 50: 35,4; 75: 43,5; 100: 49,6; 125: 52,9; 150: 52,3; 175: 55,2; 200: 55,2. Las ganancias se estancan a partir de unos 125 pasos, momento en el que aproximadamente la mitad de los grupos de prompts eran completamente correctos o completamente incorrectos.

Resumen del propio autor: el RLVR recupera la mayor parte de la capacidad matematica perdida en las etapas de persona (+34 puntos en MATH-500 L3-5 respecto a la semilla), pero termina 3-4 puntos por debajo del modelo base intacto en MATH-500 y GSM8K, y tambien por debajo en AIME pass@16.

## Requisitos de hardware

- VRAM estimada en bf16: unos 6,2 GB solo de pesos, mas cache KV; en la practica unos 8-10 GB con contexto corto y lotes pequenos.
- VRAM estimada en int8: en torno a 3,5 GB de pesos (requiere conversion, no publicada).
- VRAM estimada en int4: en torno a 2 GB de pesos (requiere conversion, no publicada).
- GPU recomendadas para inferencia: A100, H100 y H200 para lotes grandes o vLLM; RTX 4090 (24 GB), RTX 4080 y RTX 4070 Ti para uso individual; RTX 3060 12 GB y RTX 4060 Ti 16 GB como minimo comodo en bf16.
- Cabe en GPU de consumo: si, en cualquier GPU con 8 GB o mas en bf16 y en GPUs de 6-8 GB si se convierte a 4 bits.
- Despliegue: `transformers` con `AutoModelForCausalLM` (formato nativo), vLLM y TGI (la ficha incluye las etiquetas `text-generation-inference` y `endpoints_compatible`). Para llama.cpp u Ollama seria necesario convertir los pesos a GGUF, conversion que no se publica en el repositorio.
- Entrenamiento tal como se documento: 2x H200 con vLLM colocado, 2 horas y 13 minutos para 200 pasos y 51.000 rollouts.
- Latencia y throughput: no disponible. Como referencia de coste de decodificacion, el modelo genera una media de 541 tokens en MATH-500, frente a 633 del modelo base y 357 de la semilla.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MATH-500 greedy | GSM8K | AIME pass@16 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Qwen2.5-3B-Instruct (base) | 3,09 mil millones | no disponible en la informacion | 68,0 | 86,1 | 21,1 | qwen-research | HuggingFace (Qwen) |
| tbooy/Qwen2.5-3B-Instruct-Sheldon-RLAIF-grpo-v2 (semilla) | 3,09 mil millones | no disponible | 34,0 | 63,6 | 3,3 | qwen-research | HuggingFace (tbooy) |
| Este modelo | 3,09 mil millones | no disponible | 65,0 | 81,9 | 17,8 | qwen-research | HuggingFace (tbooy) |

Alternativas de tamano similar (por ejemplo Llama-3.2-3B-Instruct o Phi-3.5-mini-instruct) no aparecen con datos en la informacion proporcionada, por lo que no se incluyen cifras comparables: no disponible.

## Limitaciones y advertencias

- Rendimiento inferior al modelo base: pierde 3 puntos en MATH-500 greedy (65,0 frente a 68,0), 4,2 puntos en GSM8K (81,9 frente a 86,1) y 3,3 puntos en AIME pass@16 (17,8 frente a 21,1). No es una mejora sobre Qwen2.5-3B-Instruct, sino una recuperacion parcial.
- Estancamiento del entrenamiento: a partir de unos 125 pasos la mejora se aplana porque la mitad de los grupos de prompts eran triviales (todos correctos o todos incorrectos) para el modelo semilla.
- Calidad de la persona no medida: el autor indica explicitamente que la retencion del personaje Sheldon Cooper tras el RLVR no se ha evaluado y que solo hay comprobaciones puntuales; debe tratarse como la calidad de la semilla hasta que se mida.
- Riesgo de alucinacion: como cualquier modelo de 3B, puede producir cadenas de razonamiento plausibles con resultados incorrectos. La verificacion con `math-verify` mitiga el problema en matematicas, no en texto libre.
- Sesgos: no se documenta ningun analisis de sesgos en la informacion disponible.
- Idioma: solo ingles declarado; no hay garantia de comportamiento correcto en castellano ni en otros idiomas.
- Contexto y longitud: la ficha no especifica la ventana de contexto y las completaciones de entrenamiento se limitaron a 2.048 tokens, por lo que no hay evidencia de rendimiento en contextos largos.
- Licencia: la licencia declarada es `qwen-research` (campo `license: other`). Hay que revisar el texto enlazado antes de cualquier uso comercial, porque este tipo de licencia de la familia Qwen suele restringir el uso a fines de investigacion; la informacion proporcionada no detalla los terminos exactos.
- Uso en produccion: es un artefacto de investigacion sin evaluacion de robustez, seguridad ni sesgos; no se recomienda como modelo de produccion para atencion al cliente ni para tareas criticas.
- Reproducibilidad: depende de una version concreta de TRL (1.13) y de una subclase propia del `GRPOTrainer`, ademas de `math-verify` como grader, lo que anade dependencias no triviales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tbooy/Qwen2.5-3B-Instruct-Sheldon-RLVR-math-v1
- Repositorio complementario con el adaptador LoRA y los checkpoints: https://huggingface.co/tbooy/Qwen2.5-3B-Instruct-Sheldon-RLVR-math-v1-LoRA
- Codigo, recompensa, grader y memoria del proyecto: https://github.com/TBOO-Y/cs2881r-sheldon-sft (carpetas `rlvr/` y `results/rlvr/`)
- Modelo base de esta etapa: https://huggingface.co/tbooy/Qwen2.5-3B-Instruct-Sheldon-RLAIF-grpo-v2
- Texto de la licencia qwen-research: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct/blob/main/LICENSE
- Dataset de entrenamiento: https://huggingface.co/datasets/rasbt/math_full_minus_math500
- Dataset de evaluacion MATH-500: https://huggingface.co/datasets/HuggingFaceH4/MATH-500
- Dataset de evaluacion GSM8K: https://huggingface.co/datasets/openai/gsm8k
- La busqueda web realizada no aporto fuentes adicionales relevantes sobre este modelo; el unico resultado fue un listado generico de modelos en HuggingFace (https://huggingface.co/models?sort=modified&search=lora) sin informacion especifica.
