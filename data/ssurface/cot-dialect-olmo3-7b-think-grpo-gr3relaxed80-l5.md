# ssurface/cot-dialect-olmo3-7b-think-grpo-gr3relaxed80-l5

## Resumen

`cot-dialect-olmo3-7b-think-grpo-gr3relaxed80-l5` es un adaptador LoRA publicado por el usuario `ssurface` que modifica el modelo base `allenai/Olmo-3-7B-Think` para que razone a un nivel de compresión extremo (L5), donde la cadena de pensamiento se reduce a una única expresión aritmética colapsada (por ejemplo, `18/3*2=12`). Forma parte de una familia de "dialectos de compresión de chain-of-thought" que investiga cómo afecta la longitud del razonamiento intermedio a la precisión final. Este adaptador concreto es una ablación diseñada para evaluar el impacto de una variante de recompensa (`gr3relaxed80`) frente al modelo principal del mismo nivel (`ssurface/cot-dialect-olmo3-7b-think-grpo-l5`).

El modelo se entrena con GRPO (Group Relative Policy Optimization) sobre el conjunto de entrenamiento de GSM8K re-expresado a nivel L5 por un modelo profesor, con 6993 ejemplos y una mediana de longitud de cadena de 16 caracteres. El resultado declarado es una precisión del 70,5% en GSM8K test (n=1317) con decodificación greedy y sin self-consistency. La relevancia de este modelo radica en que permite estudiar empíricamente el equilibrio entre compresión del razonamiento y exactitud, un tema central para reducir costes de inferencia en modelos de razonamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base: Olmo-3-7B-Think) con adaptador LoRA |
| Parametros totales | 7B (modelo base) + adaptador LoRA (r=16, alpha=32) |
| Parametros activos | no disponible (adaptador LoRA, no MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Olmo-3-7B-Think, que soporta contexto largo según el paper de Olmo 3) |
| Tipos de cuantizacion | no disponible (el adaptador se publica en bfloat16, el modelo base admite cuantizaciones estandar) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre `allenai/Olmo-3-7B-Think`, un modelo de 7B parametros de la familia Olmo 3 desarrollada por AI2, que incorpora un modo de razonamiento largo (chain-of-thought) entrenado con datos post-entrenamiento de la serie Dolci. El adaptador LoRA (r=16, alpha=32) se entrena en dos fases: primero se fusiona un adaptador SFT de nivel L5 (`ssurface/cot-dialect-olmo3-7b-think-sft-l5`) sobre el modelo base, y posteriormente se aplica GRPO con `trl.GRPOTrainer` sobre ese modelo fusionado. El entrenamiento usa 8 generaciones por prompt, batch de 32 con acumulacion de gradiente x2, max completion de 256 tokens, learning rate de 1e-05 y coeficiente KL de 0.01. El dataset de prompts es `gsm8k_grpo_balanced_1k.json`, y el entrenamiento se realizo en una NVIDIA A100 80GB.

La funcion de recompensa combina cuatro componentes: `correctness` (acierta o no la respuesta, ponderado por el numero de pasos de la solucion dorada), `format` (exige una unica estructura `thinking...response` seguida de `#### <respuesta>`), `chain` (un verificador que comprueba que la aritmetica escrita en la cadena es correcta) y `gr3` (reescalado multiplicativo de la recompensa positiva con un suelo de 0.3). Este ultimo componente es el objeto de la ablacion: solo escala recompensas ya positivas, por lo que no puede reordenar respuestas correctas por encima de incorrectas. El autor senala que el entrenamiento con kernels fusionados produjo adaptadores con matrices `lora_B` todas a cero, por lo que se uso `transformers` estandar con atencion `sdpa` y se verifico manualmente que cada adaptador publicado tuviera `lora_B != 0`.

## Capacidades

- Razonamiento matematico de nivel compresivo L5: genera una unica expresion aritmetica como cadena de pensamiento, en lugar de multiples pasos verbales.
- Resolucion de problemas de palabras (word problems) del estilo GSM8K, con formato de salida estricto `thinking...response` y `#### <respuesta>`.
- Soporte de tool calling: no disponible (no se menciona en la informacion proporcionada).
- Soporte de agentes y multi-step reasoning: limitado, ya que la compresion extrema reduce el razonamiento intermedio a una sola expresion; no esta disenado para tareas que requieran encadenamiento largo.
- Capacidades multilingues: solo ingles.
- Capacidades especiales: compresion de chain-of-thought, pensada para reducir costes de inferencia en tareas de razonamiento matematico.

## Casos de uso

- Evaluacion de tecnicas de compresion de razonamiento: este adaptador sirve como banco de pruebas para medir como afecta la recompensa `gr3` a la precision en niveles extremos de compresion, util para investigadores que estudian trade-offs entre longitud de cadena y exactitud.
- Generacion de soluciones concisas en sistemas de tutoria matematica: puede integrarse en asistentes educativos que necesiten mostrar solo el resultado final y una expresion breve, sin pasos verbales extensos.
- Automatizacion de calculos aritmeticos en pipelines de datos: para tareas donde se requiere extraer un resultado numerico de un enunciado en lenguaje natural, con formato de salida estandarizado y facil de parsear.
- Benchmarking de modelos de razonamiento comprimido: como referencia comparativa en experimentos que evaluan la degradacion de rendimiento al reducir la longitud de la cadena de pensamiento.
- Pruebas de robustez de verificadores aritmeticos: el componente de recompensa `chain` verifica la correccion de la expresion generada, por lo que puede usarse para probar sistemas de validacion de calculos intermedios.
- Estudio de ablaciones de funciones de recompensa en RLHF/GRPO: este modelo es un artefacto disenado para reproducir un experimento concreto de diseno de recompensas, por lo que es util en investigacion metodologica sobre RL.

## Benchmarks y rendimiento

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Razonamiento matematico | GSM8K (test, n=1317) | Accuracy (exact match) | 70.5% |

Resultado declarado por el autor con decodificacion greedy, una sola pasada, sin ejemplos y sin self-consistency. No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 7B en bfloat16 requiere aproximadamente 14-16 GB de VRAM; el adaptador LoRA anade un coste minimo (0.2 GB en disco). Con cuantizacion a 4 bits (por ejemplo, mediante bitsandbytes o GGUF), puede caber en GPUs de 8 GB.
- GPU recomendadas: para inferencia en bfloat16, una RTX 3090/4090 (24 GB) o A100 (40/80 GB) es suficiente. Para cuantizacion 4-bit, una RTX 3060 (12 GB) o RTX 4070 (12 GB) puede funcionar.
- Si cabe en consumer GPU: si, con cuantizacion. El entrenamiento requirio una A100 80GB, pero la inferencia es viable en hardware de consumo.
- Opciones de despliegue: dado que es un adaptador PEFT, puede cargarse con `transformers` y `peft`; tambien es compatible con vLLM, llama.cpp y Ollama si se fusiona el adaptador con el modelo base y se exporta a GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GSM8K | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `cot-dialect-olmo3-7b-think-grpo-gr3relaxed80-l5` | 7B + LoRA | no disponible | 70.5% | Apache-2.0 | HuggingFace |
| `allenai/Olmo-3-7B-Think` (base) | 7B | contexto largo (segun paper) | no disponible | Apache-2.0 | HuggingFace |
| `ssurface/cot-dialect-olmo3-7b-think-grpo-l5` (modelo principal del mismo nivel) | 7B + LoRA | no disponible | no disponible (no publicado en la informacion) | Apache-2.0 | HuggingFace |

No se dispone de datos de rendimiento de los modelos comparables en la informacion proporcionada. La comparativa se limita a caracteristicas estructurales.

## Limitaciones y advertencias

- Entrenado y evaluado exclusivamente en problemas de palabras matematicos (GSM8K); no generaliza a otros dominios de razonamiento.
- La precision cae rapidamente con la dificultad del problema, especialmente en los niveles de compresion mas altos como L5.
- Es una ablacion disenada para responder una pregunta concreta sobre diseno de recompensas; puede ser peor que el modelo principal del mismo nivel.
- El adaptador debe apilarse sobre el modelo SFT fusionado (`ssurface/cot-dialect-olmo3-7b-think-sft-l5`), no directamente sobre el base, para reproducir los resultados.
- Variabilidad estadistica: con n=1317, el intervalo de confianza del 95% tiene una semi-amplitud de ~2.7 puntos porcentuales; diferencias de unos pocos puntos pueden deberse al azar.
- Solo soporta ingles; no hay datos de rendimiento en otros idiomas.
- El formato de salida es rigido (una unica expresion), lo que limita su uso en tareas que requieran explicaciones o pasos intermedios legibles.

## Enlaces

- Repositorio HuggingFace del adaptador: https://huggingface.co/ssurface/cot-dialect-olmo3-7b-think-grpo-gr3relaxed80-l5
- Modelo base en HuggingFace: https://huggingface.co/allenai/Olmo-3-7B-Think
- Paper de Olmo 3 (arXiv): https://arxiv.org/abs/2512.13961
- Pagina de Olmo en AI2: https://allenai.org/olmo
- Version de LM Studio del modelo base: https://lmstudio.ai/models/allenai/olmo-3-7b-think
