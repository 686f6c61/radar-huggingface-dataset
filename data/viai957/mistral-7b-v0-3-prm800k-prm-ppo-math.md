# viai957/mistral-7b-v0.3-prm800k-prm-ppo-math

## Resumen

`viai957/mistral-7b-v0.3-prm800k-prm-ppo-math` es un artefacto de investigacion publicado por el usuario viai957 sobre el modelo base `mistralai/Mistral-7B-v0.3`. No es un modelo nuevo en el sentido habitual: el repositorio contiene una politica SFT de Mistral-7B afinada para resolver problemas de matematicas de competicion, un process reward model (PRM) de tres clases que puntua cada paso intermedio, y dos ramas de PPO con LoRA (una con recompensas de proceso y otra de control con recompensa solo de resultado). El objetivo declarado es estudiar si el entrenamiento con recompensas densas a nivel de paso mejora el razonamiento matematico respecto a un control ORM.

El resultado principal es un resultado nulo pre-registrado: el SFT eleva MATH-500 del 2,0 % al 9,0 % en pass@1, pero PPO no mueve de forma medible la politica en ninguna de las dos ramas, y la rama con PRM no supera al control (p = 0,77 con McNemar pareado). El autor atribuye el nulo a unas 24 iteraciones efectivas de optimizador frente al efecto publicado que se pretendia replicar (+0,86 pp). El valor mas reutilizable, segun la propia model card, es la seccion de fallos silenciosos.

El interes practico para evaluadores es doble: por un lado, la politica SFT es un punto de partida razonable para matematicas sobre Mistral-7B v0.3 con licencia Apache-2.0; por otro, el PRM v2 (AUROC en pasos held-out de 0,7751) y todos los logs y configuraciones permiten reproducir el pipeline completo con 4 GPU L4 de 23 GB en unas 18 horas de entrenamiento registrado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Mistral-7B-v0.3), GQA, vocabulario de 32k |
| Parametros totales | 7,25 mil millones (backbone); adaptadores LoRA de PPO: 167.772.160 parametros por rama |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (no se declara en la informacion proporcionada; el hereda del base Mistral-7B-v0.3) |
| Tipos de cuantizacion | no disponible (el repositorio publica pesos completos en bf16 y LoRA; no se listan GGUF ni otras cuantizaciones) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (politica SFT en bf16 completo, PRM consolidado; adaptadores LoRA PPO en safetensors + `value_head.pt`) |

## Arquitectura y entrenamiento

El modelo se apoya en un unico backbone Mistral-7B-v0.3 en bf16 que cumple tres roles mediante conmutacion de adaptadores PEFT: politica (SFT + LoRA de PPO), referencia KL (todos los adaptadores desactivados, que devuelve exactamente la politica SFT) y PRM (tronco SFT + LoRA r=64 con cabeza MLP de tres clases). El paso de solucion se delimita con el token reservado `[control_768]` (id 770), cuya fila de embedding se reinicializa a ceros. Esta decision de diseno responde a una restriccion de memoria: un segundo modelo de referencia de 7B residente necesitaria 27 GiB en una tarjeta de 22,5 GiB.

Los datos provienen de PRM800K (MIT): 11.810 secuencias de SFT, 412.792 secuencias para el PRM con 962.812 pasos etiquetados y 10.606 prompts de RL. El SFT es de parametros completos con ZeRO-3, learning rate 1e-5, y se detuvo en el paso 200 de 578 (loss de evaluacion 0,370). El PRM v2 es un LoRA r=64 con cabeza MLP entrenado 500 pasos, con AUROC de paso en held-out de 0,7751 [0,7683, 0,7819]. El PPO usa LoRA r=64 con alpha 128 sobre q, k, v, o, gate, up y down en las 32 capas, PPO recortado con GAE (gamma 1, lambda actor 0,99, lambda critico 1,0), 40 iteraciones por 8 rollouts de 768 tokens a temperatura 1,0 y 80 actualizaciones. Hay una comprobacion independiente de contaminacion frente a MATH-500 por texto normalizado y por identificador de problema, con resultado cero.

## Capacidades

- Generacion de soluciones paso a paso a problemas de matematicas de competicion (MATH y GSM8K), con la respuesta final marcada tras `# Answer`.
- Razonamiento aritmetico y algebraico de varios pasos, con verificacion externa via sympy / math-verify en el pipeline de evaluacion.
- Puntuacion de pasos intermedios mediante el PRM v2, utilizable como reordenador (best-of-n) o como senal de recompensa.
- Modo de politica PPO con LoRA y cabeza de valor para RL sobre el propio modelo.
- Capacidades heredadas de Mistral-7B-v0.3 fuera del dominio matematico: no evaluadas ni garantizadas en este ajuste.
- Soporte de tool calling, function calling y comportamiento agentico: no disponible; no se declara ni se ha entrenado para ello.
- Capacidades multilingues: limitadas al ingles segun la declaracion de idiomas del repositorio.
- Capacidades de vision o audio: no disponibles.

## Casos de uso

- Reordenacion best-of-n en produccion matematica: generar 8 candidatos por problema con la politica SFT o PPO y seleccionar con el PRM v2. En la propia model card, el PRM-min sobre MATH-500 con 200 problemas da 0,125 frente a 0,075 de pass@1, y el oracle alcanza 0,300, lo que acota la ganancia maxima explotable.
- Evaluacion de PRMs en investigacion: el repositorio incluye prm-v1 (AUROC 0,588, cerca del azar) y prm-v2 (0,7751) con historiales, lo que permite estudiar que separa un clasificador de pasos util de uno inutil sin reentrenar desde cero.
- Reproduccion de pipelines de RLHF con recursos limitados: el diseno de un solo backbone con conmutacion de adaptadores permite ejecutar politica, referencia KL y PRM en 4 GPU L4 de 23 GB, un escenario asequible para laboratorios pequenos.
- Docencia y formacion sobre resultados negativos: los logs de las ejecuciones anuladas (`logs/void_runs/`) y la lista de catorce fallos silenciosos sirven como material para formar a ingenieros en deteccion de experimentos que "parecen sanos" pero no miden lo que creen.
- Generacion de datos sinteticos de razonamiento matematico: el SFT produce cadenas de solucion con delimitadores de paso consistentes, utiles para arrancar un corpus etiquetado a nivel de paso.
- Linea base para comparativas internas: con pass@1 de 0,090 en MATH-500 y 0,258 en GSM8K sobre Mistral-7B v0.3, sirve como referencia honesta frente a modelos matematicos mas grandes o con RL a gran escala.
- Analisis de calibracion de recompensas: comparar la rama PRM (0,082 en MATH-500) con el control ORM (0,078) permite estudiar la varianza de senales densas frente a senales de resultado en presupuestos de optimizacion muy cortos.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index y en la model card. `n=500` salvo donde se indique.

| Modelo / configuracion | MATH-500 pass@1 | GSM8K pass@1 |
|---|---|---|
| Mistral-7B-v0.3 base | 0,020 (n=200) | 0,050 (n=200) |
| SFT (checkpoint-200) | 0,090 | 0,258 |
| PPO-ORM (control) | 0,078 | 0,254 |
| PPO-PRM | 0,082 | 0,258 |

| Metrica adicional | Valor |
|---|---|
| PRM v2, AUROC de paso en held-out | 0,7751 [0,7683, 0,7819] |
| PRM v1, AUROC de paso | 0,588 (cerca del azar) |
| PRM-min best-of-8 (MATH-500, 200 problemas) | 0,125 frente a 0,075 de pass@1 |
| Voto mayoritario best-of-8 | 0,150 |
| Oracle best-of-8 | 0,300 |
| PRM frente a control ORM | +0,4 pp, 110 discordantes de 1.000, p = 0,77 (nulo) |

## Requisitos de hardware

- Politica SFT en bf16: aproximadamente 14,5 GB de pesos; inferencia comoda en GPU de 24 GB (RTX 4090, L4 de 23 GB, A10G).
- PRM v2 consolidado: aproximadamente 14,9 GB; mismo perfil de memoria que la politica.
- Adaptadores PPO: 0,4 GB por rama, se aplican sobre el backbone SFT.
- Entrenamiento segun el autor: 1 nodo con 4 GPU NVIDIA L4 de 23 GB, unas 18 horas de entrenamiento registrado mas unas 8 horas de evaluacion.
- Cuantizaciones para hardware menor: no publicadas; habria que generarlas a partir de los pesos safetensors.
- Despliegue: compatible con `transformers` y con endpoints compatibles (etiqueta `endpoints_compatible`). Opciones como vLLM, llama.cpp, Ollama o TGI no se mencionan en la informacion disponible; para los adaptadores LoRA haria falta un servidor que soporte PEFT o la consolidacion previa de pesos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MATH-500 / GSM8K | Licencia | Notas |
|---|---|---|---|---|---|
| viai957/mistral-7b-v0.3-prm800k-prm-ppo-math (SFT) | 7,25B | no disponible | 0,090 / 0,258 | Apache-2.0 | Incluye PRM y pesos PPO; resultado nulo en RL |
| mistralai/Mistral-7B-v0.3 (base) | 7,25B | no disponible en la informacion | 0,020 / 0,050 | Apache-2.0 | Punto de partida, sin ajuste matematico |
| mistralai/Mathstral-7B-v0.1 | 7,25B | no disponible en la informacion | no disponible | Apache-2.0 | Ajuste matematico especifico de Mistral; cifras no verificadas aqui |

La comparacion con otros modelos matematicos de 7B (por ejemplo, variantes de Qwen2.5-Math) no se incluye porque no hay datos en la informacion proporcionada que permitan una comparacion verificable.

## Limitaciones y advertencias

- El resultado central es nulo: PPO no mejora la politica en ninguna rama y la senal de proceso no bate al control (p = 0,77). No debe presentarse como un modelo matematico "entrenado con RL" con ganancias demostradas.
- El SFT se detuvo en el paso 200 de 578, por lo que la politica publicada no es el punto de convergencia del entrenamiento.
- La ventana de contexto no se declara; asumir la del base Mistral-7B-v0.3 sin verificacion es un riesgo en produccion con prompts largos.
- Idioma limitado al ingles; el rendimiento en castellano no esta evaluado y probablemente sea peor.
- La etiqueta `negative-results` indica que parte del repositorio es material de investigacion, no artefactos listos para produccion; prm-v1 esta cerca del azar.
- El paso se delimita con un token reservado (`[control_768]`, id 770) cuya fila de embedding se reinicializa a ceros: cualquier tokenizador o pipeline que no respete esa convencion rompe el formato esperado.
- Los adaptadores PPO referencian una ruta local `runs/sft-mistral7b/checkpoint-200`; hay que reasignarla a la carpeta `sft/` del repositorio para cargarlos.
- Riesgo de alucinacion en pasos intermedios: el PRM puntua pasos, pero su AUROC de 0,7751 deja margen de error considerable; no sustituye a un verificador simbolico.
- Sin datos publicados sobre sesgos sociales, toxicidad o robustez fuera del dominio matematico.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base y los datos (PRM800K, MIT) imponen sus propias condiciones que conviene revisar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/viai957/mistral-7b-v0.3-prm800k-prm-ppo-math
- Discusiones del repositorio: https://huggingface.co/viai957/mistral-7b-v0.3-prm800k-prm-ppo-math/discussions
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-v0.3
- Paper de referencia PRM800K (Let's Verify Step by Step): https://arxiv.org/abs/2305.20050
- Paper de referencia Math-Shepherd: https://arxiv.org/abs/2312.08935
- Paper de referencia sobre PRMs (arxiv:2410.15115): https://arxiv.org/abs/2410.15115
- Paper de referencia Hendrycks MATH: https://arxiv.org/abs/2103.03874
- Dataset PRM800K (tasksource): https://huggingface.co/datasets/tasksource/PRM800K
- Dataset Hendrycks MATH (EleutherAI): https://huggingface.co/datasets/EleutherAI/hendrycks_math
- Dataset MATH-500: https://huggingface.co/datasets/HuggingFaceH4/MATH-500
- Dataset GSM8K: https://huggingface.co/datasets/openai/gsm8k
