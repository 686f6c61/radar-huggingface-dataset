# ssurface/cot-dialect-olmo3-7b-think-grpo-reward-diff-l5

## Resumen

`cot-dialect-olmo3-7b-think-grpo-reward-diff-l5` es un adaptador LoRA publicado por el usuario `ssurface` que modifica el comportamiento de razonamiento del modelo base `allenai/Olmo-3-7B-Think` para operar en el "nivel de compresión L5" de la familia de *dialectos de cadena de pensamiento* (chain-of-thought compression dialects). En este nivel, el modelo produce una única expresión colapsada (por ejemplo, `18/3*2=12`) en lugar de una cadena de razonamiento extensa, reduciendo la longitud mediana de la cadena de 532 caracteres (nivel L1) a 16 caracteres (nivel L5), un rango de 33x.

Se trata de una **ablación experimental**, no de un modelo principal: fue entrenado con una variante de recompensa (`correctness_sq`, con el peso de complejidad al cuadrado) para responder a una pregunta concreta sobre diseño de recompensas en el pipeline GRPO. El adaptador debe cargarse sobre el modelo SFT fusionado del mismo nivel (`ssurface/cot-dialect-olmo3-7b-think-sft-l5`), no directamente sobre el base, y alcanza un 78.4% de exactitud en GSM8K test con decodificación greedy.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (base: Olmo-3-7B-Think) + adaptador LoRA |
| Parametros totales | 7B (base) + adaptador LoRA r=16, alpha=32 (repo de 0.2 GB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base) |
| Tipos de cuantizacion | No disponible para el adaptador; el modelo base dispone de cuantizaciones GGUF (p. ej. via unsloth) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo base, `allenai/Olmo-3-7B-Think`, es un transformer causal de 7.000 millones de parametros desarrollado por AllenAI, entrenado sobre el dataset Dolma 3 con un enfoque de razonamiento explicito: genera una cadena de pensamiento visible antes de emitir la respuesta final. Sobre este base, el adaptador se entrena en dos fases: primero, un modelo SFT (`cot-dialect-olmo3-7b-think-sft-l5`) se ajusta sobre 6.993 ejemplos de GSM8K train re-expresados por un modelo profesor en el dialecto L5 (cadenas de 16 caracteres de mediana); despues, este adaptador se entrena con GRPO (`trl.GRPOTrainer` sobre `transformers` estandar con atencion `sdpa`) usando 8 generaciones por prompt, batch de 64, max completion de 256 tokens, learning rate de 1e-05, coeficiente KL de 0.01 y LoRA r=16, alpha=32. La recompensa combina `correctness_sq` (exactitud con peso de complejidad al cuadrado) y `format` (exigencia de un bloque ` thinking... response` seguido de `#### <answer>`). El entrenamiento se realizo en una unica NVIDIA A100 80GB.

Una nota tecnica relevante: el autor verifico que todos los adaptadores publicados tienen matrices `lora_B` distintas de cero, descartando 13 que resultaron matematicamente inertes al usar wrappers de kernels fusionados; este adaptador se entreno con el camino estandar sin fusionar.

## Capacidades

- Razonamiento matematico con cadenas de pensamiento extremadamente comprimidas (nivel L5): produce una unica expresion colapsada en lugar de un razonamiento paso a paso extenso.
- Resolucion de problemas de palabras aritmeticos (GSM8K) con exactitud del 78.4% en test, decodificacion greedy, sin ejemplos ni self-consistency.
- Generacion de texto en ingles con formato estructurado de respuesta (` thinking... response` + `#### <answer>`).
- Disenado para experimentos de ablacion sobre diseno de recompensas en entrenamiento GRPO.
- Compatible con el ecosistema PEFT/HuggingFace Transformers; requiere carga secuencial del adaptador SFT y despues este adaptador.

## Casos de uso

- Investigacion sobre compresion de cadenas de pensamiento: permite estudiar como varia la exactitud cuando el razonamiento se colapsa a una unica expresion (L5) frente a niveles mas verbosos (L1-L4), con un control experimental limpio.
- Ablacion de diseno de recompensas: este adaptador responde especificamente a la pregunta de si elevar al cuadrado el peso de complejidad en la recompensa mejora o degrada el rendimiento frente al modelo principal del mismo nivel (`grpo-l5`), permitiendo reproducir la comparativa del paper.
- Evaluacion de robustez del razonamiento comprimido: sirve para medir como cae la exactitud con la dificultad del problema cuando el modelo no puede "pensar en voz alta" de forma extensa.
- Benchmarking de eficiencia de inferencia: al generar cadenas de solo 16 caracteres, el coste de decodificacion por consulta es drasticamente menor que el de un modelo de razonamiento verboso, util para medir trade-offs de latencia frente a exactitud.
- Educacion y tutoria matematica: puede generar respuestas directas y concisas a problemas aritmeticos, adecuado para sistemas de verificacion automatica de respuestas donde solo interesa el resultado final.
- Reproducibilidad cientifica: como artefacto de ablacion publicado con configuracion completa (semilla, recompensa, hiperparametros), sirve para re-ejecutar experimentos de diseno de recompensas en pipelines GRPO sin depender de la palabra del autor.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (GSM8K test, n=1317, decodificacion greedy, single-turn, sin ejemplos, sin self-consistency):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Razonamiento matematico | GSM8K (test) | Accuracy (exact match) | 78.4% |

No se dispone de resultados para otros benchmarks (MMLU, HumanEval, etc.) en la informacion proporcionada. El autor indica que el intervalo de confianza al 95% tiene una semianchura de ~2.7 puntos porcentuales con n=1317, por lo que diferencias de un par de puntos entre variantes pueden estar dentro del ruido.

## Requisitos de hardware

- Entrenamiento: 1x NVIDIA A100 80GB (configuracion declarada por el autor).
- Inferencia: el adaptador LoRA se carga sobre el modelo base de 7B en bfloat16 (~14 GB de VRAM para los pesos). Cabe en GPUs de consumo con 24 GB (RTX 4090, RTX 3090) y en GPUs de datacenter como A100 80GB o H100.
- El adaptador anade un overhead minimo sobre los pesos del base; el requisito dominante es el del modelo base.
- Despliegue: compatible con HuggingFace Transformers + PEFT (`PeftModel`), con atencion `sdpa`. No se menciona soporte explicito para vLLM, llama.cpp u Ollama en la informacion disponible, aunque el base tiene cuantizaciones GGUF publicadas por unsloth.
- Latencia: no disponible en la informacion proporcionada; al generar cadenas de solo 16 caracteres de mediana, la latencia por consulta deberia ser sustancialmente menor que la de un modelo de razonamiento verboso.

## Comparativa con modelos similares

| Modelo | Tipo | Exactitud GSM8K | Notas |
|---|---|---|---|
| `cot-dialect-olmo3-7b-think-grpo-reward-diff-l5` (este) | LoRA sobre Olmo-3-7B-Think | 78.4% | Ablacion con recompensa `correctness_sq` |
| `cot-dialect-olmo3-7b-think-grpo-l5` | LoRA sobre Olmo-3-7B-Think | No disponible | Modelo principal del mismo nivel L5, misma recompensa estandar |
| `cot-dialect-olmo3-7b-think-sft-l5` | LoRA sobre Olmo-3-7B-Think | No disponible | Modelo SFT previo al GRPO, necesario como paso intermedio de carga |
| `allenai/Olmo-3-7B-Think` | Modelo base completo | No disponible | Razonamiento verboso sin compresion |

No se dispone de datos de benchmarks para las alternativas en la informacion proporcionada; la comparativa se limita a la arquitectura y al rol experimental de cada artefacto.

## Limitaciones y advertencias

- Entrenado y evaluado exclusivamente sobre problemas de palabras matematicos (GSM8K); no hay evidencia de capacidades generales fuera de este dominio.
- La exactitud cae con la dificultad del problema, y la caida es mas pronunciada en los niveles comprimidos (L5 es el mas extremo).
- Es un artefacto de ablacion: fue entrenado para responder a una pregunta concreta sobre diseno de recompensas y puede ser peor que el modelo principal del mismo nivel.
- Debe cargarse obligatoriamente sobre el modelo SFT fusionado (`cot-dialect-olmo3-7b-think-sft-l5`); cargarlo directamente sobre `allenai/Olmo-3-7B-Think` no reproduce el resultado declarado.
- Entrenado con una unica semilla (salvo que el nombre del repo indique lo contrario); diferencias de un par de puntos porcentuales estan dentro del ruido estadistico.
- Solo soporta ingles; no hay evidencia de capacidades multilingues.
- Riesgo de alucinacion no caracterizado fuera del dominio matematico; en problemas fuera de GSM8K el comportamiento es impredecible.
- Licencia Apache-2.0, permisiva para uso comercial, pero el modelo base Olmo-3-7B-Think tiene su propia licencia que debe verificarse por separado.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/ssurface/cot-dialect-olmo3-7b-think-grpo-reward-diff-l5
- Modelo base: https://huggingface.co/allenai/Olmo-3-7B-Think
- Adaptador SFT requerido: https://huggingface.co/ssurface/cot-dialect-olmo3-7b-think-sft-l5
- Modelo principal del mismo nivel: https://huggingface.co/ssurface/cot-dialect-olmo3-7b-think-grpo-l5
- Cuantizaciones GGUF del base: https://huggingface.co/unsloth/Olmo-3-7B-Think-GGUF
- Ficha del modelo en LM Studio: https://lmstudio.ai/models/allenai/olmo-3-7b-think
