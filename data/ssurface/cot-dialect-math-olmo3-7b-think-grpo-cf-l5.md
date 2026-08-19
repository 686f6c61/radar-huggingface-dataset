# ssurface/cot-dialect-math-olmo3-7b-think-grpo-cf-l5

## Resumen

`cot-dialect-math-olmo3-7b-think-grpo-cf-l5` es un adaptador LoRA desarrollado por ssurface (Anatolii Frolov) que modifica el modelo base `allenai/Olmo-3-7B-Think` para razonar a un nivel de compresion L5, es decir, expresando el chain-of-thought como una unica expresion colapsada. El adaptador forma parte del proyecto "Chain-of-Thought Compression Dialects", que investiga como comprimir el razonamiento intermedio en distintos niveles de expresion (L1, L3 y L5) manteniendo la precision en problemas matematicos.

El modelo se entrena mediante GRPO (Group Relative Policy Optimization) sobre un modelo SFT previo fusionado, con recompensas de correccion y formato. El resultado es un adaptador de 0.2 GB que, apilado sobre el modelo SFT correspondiente, alcanza un 61.8% de precision exacta en el dataset MATH-500 con decodificacion greedy, sin ejemplos ni self-consistency.

La relevancia de este modelo reside en su enfoque de compresion de razonamiento: demuestra que es posible reducir drasticamente la longitud del chain-of-thought manteniendo un rendimiento competitivo en matematicas, lo que tiene implicaciones directas para la eficiencia de inferencia en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA adapter (r=16, alpha=32) sobre Olmo-3-7B-Think (transformer decoder causal) |
| Parametros totales | 7B (modelo base) + adaptador LoRA (~0.2 GB en safetensors) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base) |
| Tipos de cuantizacion | no disponible (adaptador PEFT; el modelo base admite bf16 y cuantizaciones estandar) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre `allenai/Olmo-3-7B-Think`, un modelo de lenguaje causal de 7B parametros de AI2 (Allen Institute for AI), entrenado mediante SFT, DPO y RLVR para producir chain-of-thought. El adaptador LoRA utiliza r=16 y alpha=32, y se entrena en dos fases: primero un modelo SFT fusionado con datos de MATH re-expresados a nivel L5 por un modelo profesor, y posteriormente un entrenamiento GRPO con `trl.GRPOTrainer` sobre transformers estandar con atencion sdpa.

El entrenamiento GRPO utiliza loss tipo dapo, 8 generaciones por prompt, batch de 32 con 2 acumulaciones, max completion de 256 tokens, learning rate de 1e-05 y coeficiente KL (beta) de 0.04. Las recompensas combinan `correctness` (ponderada por el numero de pasos de la solucion dorada) y `format` (exige un bloque ` thinking... response` seguido de `#### <answer>`). El entrenamiento se realizo en una unica NVIDIA A100 80GB.

Un detalle tecnico relevante: el autor verifico que los adaptadores producidos por la ruta de kernels fusionados tenian matrices `lora_B` todas a cero, por lo que se descarto esa via y se uso transformers estandar con sdpa. Todos los adaptadores publicados fueron verificados con `lora_B != 0`.

## Capacidades

- Razonamiento matematico sobre problemas de palabras, con respuestas en formato `\boxed{}` compatible con LaTeX.
- Chain-of-thought comprimido a nivel L5 (expresion unica colapsada), reduciendo drasticamente la longitud del razonamiento intermedio.
- Generacion de texto en ingles con formato de salida estructurado: bloque de thinking, bloque de response y respuesta final.
- Integracion con el ecosistema PEFT/HuggingFace Transformers, permitiendo fusion y carga como adaptador estandar.
- Evaluacion con grader consciente de LaTeX que normaliza formas equivalentes (`\frac{14}{3}` == `14/3`).
- Soporte de decodificacion greedy sin necesidad de self-consistency ni ejemplos (few-shot).

## Casos de uso

- Evaluacion de razonamiento matematico: el adaptador puede utilizarse como referencia para medir el impacto de la compresion de chain-of-thought en la precision de problemas matematicos, comparando niveles L1, L3 y L5 sobre el mismo dataset.
- Investigacion sobre eficiencia de razonamiento: al reducir el chain-of-thought a una expresion colapsada, es util para estudiar el trade-off entre longitud de razonamiento y precision, con implicaciones para reducir latencia y coste de inferencia.
- Tutorizacion matematica automatizada: el modelo puede generar soluciones concisas a problemas de matematicas de nivel escolar y universitario, presentando la respuesta final en formato LaTeX para su integracion en plataformas educativas.
- Generacion de datos sinteticos de razonamiento comprimido: el adaptador puede servir como profesor para re-expresar problemas matematicos en dialectos de compresion L5, alimentando pipelines de entrenamiento de modelos mas pequenos.
- Benchmarking de modelos de razonamiento: su resultado en MATH-500 (61.8%) proporciona un punto de referencia para comparar otras tecnicas de compresion de CoT o modelos de razonamiento de tamano similar.
- Integracion en pipelines de agentes matematicos: combinado con tool calling del modelo base, puede utilizarse en sistemas que necesitan resolver problemas matematicos de forma autonoma con respuestas concisas y verificables.

## Benchmarks y rendimiento

El autor declara los siguientes resultados en la model card:

| Dataset | Metrica | Valor | Configuracion |
|---|---|---|---|
| MATH-500 (test) | Accuracy (exact match) | 61.8% | Greedy decoding, single-turn, sin ejemplos, sin self-consistency |

Notas sobre la evaluacion:
- El harness de evaluacion utiliza un grader consciente de LaTeX que normaliza formas equivalentes. El autor advierte que un harness basado en el formato `#### n` de GSM8K puntuaria incorrectamente a estos modelos cerca del 0% cuando en realidad rondan el 60%.
- La incertidumbre estadistica a n=500 tiene un semi-ancho del 95% de aproximadamente 4.4 puntos porcentuales.

No se han publicado resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA ocupa 0.2 GB y requiere cargar el modelo base `allenai/Olmo-3-7B-Think` completo (7B parametros).
- Inferencia en bf16: aproximadamente 14-16 GB de VRAM, compatible con RTX 4090 (24 GB), RTX 3090 (24 GB) o A100 80GB.
- Inferencia con cuantizacion 4-bit: aproximadamente 4-6 GB de VRAM, compatible con GPUs de consumo como RTX 3060 (12 GB) o RTX 4060 Ti (16 GB).
- El entrenamiento GRPO se realizo en 1x NVIDIA A100 80GB.
- Despliegue: al ser un adaptador PEFT, requiere fusionarlo con el modelo base (o cargarlo via `PeftModel`) antes de servir con vLLM, TGI, llama.cpp u Ollama.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MATH-500 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ssurface/cot-dialect-math-olmo3-7b-think-grpo-cf-l5 | 7B + LoRA | no disponible | 61.8% | apache-2.0 | HuggingFace |
| allenai/Olmo-3-7B-Think (base) | 7B | no disponible | no disponible | apache-2.0 | HuggingFace |
| Alelcv27/Olmo3-7B-Math-CoT | 7B | no disponible | no disponible | apache-2.0 | HuggingFace |

Nota: no se dispone de resultados de MATH-500 para los modelos alternativos en la informacion proporcionada. El adaptador requiere apilarse sobre el modelo SFT `ssurface/cot-dialect-math-olmo3-7b-think-sft-unfiltered-l5` para reproducir el resultado declarado.

## Limitaciones y advertencias

- Entrenado y evaluado exclusivamente en problemas matematicos de palabras; no es adecuado para otras tareas sin validacion previa.
- La precision disminuye con la dificultad del problema, y la caida es mas rapida en los niveles de compresion mas altos (como L5).
- El adaptador debe cargarse sobre el modelo SFT fusionado, no directamente sobre el modelo base `allenai/Olmo-3-7B-Think`; cargarlo sobre el base no reproduce el resultado declarado.
- Resultados basados en una unica semilla; diferencias de un par de puntos porcentuales estan dentro del ruido estadistico (semi-ancho 95% de ~4.4 pp a n=500).
- Solo soporta ingles como idioma de entrada y salida.
- El formato de salida exige un bloque ` thinking... response` seguido de `#### <answer>`; desviaciones pueden penalizar la recompensa de formato en entrenamiento y afectar a la calidad de las respuestas en inferencia.
- La evaluacion requiere un grader consciente de LaTeX; harnesses que buscan el formato `#### n` de GSM8K puntuarian incorrectamente a este modelo.

## Enlaces

-
