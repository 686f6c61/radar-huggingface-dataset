# ssurface/cot-dialect-olmo3-7b-think-grpo-base-seed7-l4

## Resumen

`ssurface/cot-dialect-olmo3-7b-think-grpo-base-seed7-l4` es un adaptador LoRA publicado por el autor Anatolii Frolov como parte de una familia de modelos que exploran la compresión de cadenas de razonamiento (chain-of-thought) mediante "dialectos" de compresión. Este adaptador concreto entrena el modelo base `allenai/Olmo-3-7B-Think` de Ai2 para razonar a un nivel de compresión L4, donde las cadenas de pensamiento se expresan como asignaciones encadenadas con punto y coma (por ejemplo, `K=18*2.5;D=8*4;T=K+D->T=77`). El objetivo es reducir drásticamente la longitud de las cadenas de razonamiento —de una mediana de 532 caracteres en el nivel L1 a 16 en el L5— manteniendo una precisión aceptable en problemas de razonamiento matemático.

Se trata de una **ablación** explícitamente diseñada para evaluar el diseño de recompensas: el mismo nivel L4 pero entrenado con una recompensa diferente a la del modelo principal `ssurface/cot-dialect-olmo3-7b-think-grpo-l4`. El autor lo publica para que la comparación de recompensas del paper pueda reproducirse. El adaptador se entrena con GRPO sobre el modelo SFT fusionado del nivel L4, usando el dataset GSM8K reexpresado por un modelo profesor. El repositorio incluye solo el adaptador LoRA (0.2 GB), no el modelo completo, y su licencia es Apache 2.0.

La relevancia de este modelo radica en su contribución al estudio de la compresión de razonamiento: demuestra que es posible reducir la longitud de las cadenas de pensamiento en un factor de ~13x (de 532 a 41 caracteres) manteniendo un 69% de precisión en GSM8K, y sirve como pieza de evidencia para el diseño de sistemas de recompensa en entrenamiento con RL.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (modelo base `allenai/Olmo-3-7B-Think`) |
| Parametros totales | Adaptador LoRA (r=16, alpha=32); modelo base: 7B (no se especifica el numero exacto de parametros del adaptador) |
| Parametros activos | No aplica (adaptador LoRA sobre modelo denso) |
| Longitud de contexto | No disponible (heredada del modelo base, no especificada en la ficha) |
| Tipos de cuantizacion | No se indican; el adaptador se distribuye en bf16 y puede cargarse con cuantizaciones del modelo base |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA, libreria peft) |

## Arquitectura y entrenamiento

El modelo base `allenai/Olmo-3-7B-Think` es un transformer causal de 7.000 millones de parametros entrenado por Ai2 sobre el dataset Dolma 3, con una variante especifica para razonamiento que genera cadenas de pensamiento antes de responder. Sobre este modelo, el autor aplica un adaptador LoRA de rango 16 y alpha 32, entrenado en dos fases: primero un ajuste fino supervisado (SFT) en el nivel de compresion L4 (adaptador `ssurface/cot-dialect-olmo3-7b-think-sft-l4`), y posteriormente un entrenamiento con GRPO (Group Relative Policy Optimization) sobre el modelo SFT fusionado. El dataset de entrenamiento consiste en 6.976 ejemplos de GSM8K reexpresados por un modelo profesor en el dialecto L4, con una mediana de 41 caracteres por cadena de razonamiento.

El entrenamiento GRPO utiliza el `trl.GRPOTrainer` sobre `transformers` estandar con atencion `sdpa` (sin kernels fusionados). La funcion de recompensa combina dos componentes: `correctness`, que pondera la coincidencia con la solucion dorada ajustada por el numero de pasos de la solucion (los problemas mas dificiles valen mas), y `format`, que exige una estructura de un bloque ` thinking...` seguido de `response` y terminado con `#### <answer>`. Se usa loss tipo `dapo`, 8 generaciones por prompt, batch de 32 con 2 pasos de acumulacion, maximo 256 tokens de completado, learning rate de 1e-05 y coeficiente KL de 0.0. El entrenamiento se realizo en una unica NVIDIA A100 de 80 GB. El autor advierte que el uso de kernels fusionados produjo adaptadores con matrices `lora_B` todas a cero (inertes matematicamente), por lo que todos los adaptadores publicados fueron verificados con `lora_B != 0`.

## Capacidades

- Razonamiento matematico con cadenas de pensamiento comprimidas: genera explicaciones intermedias en formato abreviado (asignaciones encadenadas con punto y coma) en lugar de texto natural extenso.
- Generacion de texto en ingles con formato estructurado: respuestas en un bloque ` thinking...` seguido de `response` y una linea final `#### <respuesta>`.
- Compresion de razonamiento: reduce la longitud de las cadenas de pensamiento en un factor de ~13x respecto al nivel L1 (de 532 a 41 caracteres de mediana).
- Soporte de carga como adaptador LoRA sobre el modelo base `allenai/Olmo-3-7B-Think`, con posibilidad de fusion y descarga.
- No incluye capacidades de tool calling, agentes, vision ni audio; esta limitado a razonamiento textual matematico.

## Casos de uso

- Investigacion en compresion de razonamiento: este adaptador sirve como pieza de ablacion para estudiar el efecto del diseno de recompensas en el rendimiento de modelos entrenados con RL, permitiendo reproducir la comparacion del paper.
- Evaluacion de modelos de razonamiento comprimido: util para medir la degradacion de precision cuando se fuerza a un modelo a razonar en un dialecto muy abreviado, comparando niveles L1 a L5.
- Generacion de explicaciones concisas en sistemas de QA matematica: el formato de salida compacto puede integrarse en pipelines donde se requiere una justificacion breve de la respuesta, ahorrando tokens de generacion.
- Benchmarking de eficiencia de inferencia: al reducir la longitud de las cadenas de pensamiento, se reduce el numero de tokens generados por consulta, lo que puede mejorar el throughput en despliegues con restricciones de latencia.
- Estudio de robustez del entrenamiento GRPO: el adaptador permite analizar como varia la precision con diferentes funciones de recompensa (en este caso, la recompensa `base-seed7` frente a la del modelo principal).
- Reproducibilidad de experimentos: al ser un adaptador publicado con configuracion detallada, puede usarse como punto de partida para replicar o extender los resultados del paper sobre dialectos de compresion.

## Benchmarks y rendimiento

El unico benchmark publicado es GSM8K (test, n=1317), con decodificacion greedy, una sola vuelta, sin ejemplos y sin self-consistency:

| Modelo | Dataset | Metrica | Valor |
|---|---|---|---|
| cot-dialect-olmo3-7b-think-grpo-base-seed7-l4 | GSM8K test | Accuracy (exact match) | 69.0% |

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica que la precision cae con la dificultad del problema, especialmente en los niveles comprimidos, y que la diferencia de un par de puntos porcentuales esta dentro del ruido (95% half-width ~2.7 pp en n=1317).

## Requisitos de hardware

- El entrenamiento se realizo en una unica NVIDIA A100 80GB, con batch efectivo de 64 (32 x 2 acumulacion) y 8 generaciones por prompt.
- Para inferencia, al ser un adaptador LoRA sobre un modelo de 7B, el requisito principal es el del modelo base `allenai/Olmo-3-7B-Think`: aproximadamente 14 GB de VRAM en bf16, ~7 GB en cuantizacion de 8 bits y ~4 GB en 4 bits.
- Cabe en GPUs consumer de 16 GB o mas (RTX 4080, RTX 4090, etc.) con cuantizacion, y en GPUs de 24 GB (RTX 3090/4090) sin cuantizar.
- El adaptador LoRA anade un coste minimo de VRAM (menos de 0.2 GB).
- Opciones de despliegue: vLLM, llama.cpp, Ollama o Transformers con PEFT. El adaptador se carga con `PeftModel` sobre el modelo base y requiere fusion previa con el adaptador SFT L4.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada, pero al reducir la longitud de las cadenas de razonamiento se espera una menor latencia por consulta frente al modelo base sin compresion.

## Comparativa con modelos similares

No hay datos publicados de otros modelos de la misma familia en la informacion disponible. Como referencia cualitativa:

| Modelo | Parametros | Contexto | GSM8K | Licencia | Notas |
|---|---|---|---|---|---|
| cot-dialect-olmo3-7b-think-grpo-base-seed7-l4 (este) | 7B + LoRA | no disponible | 69.0% | Apache 2.0 | Ablacion, nivel L4, recompensa base-seed7 |
| cot-dialect-olmo3-7b-think-grpo-l4 (principal) | 7B + LoRA | no disponible | no disponible | Apache 2.0 | Modelo principal del mismo nivel, recompensa diferente |
| allenai/Olmo-3-7B-Think (base) | 7B | no disponible | no disponible | Apache 2.0 | Modelo base sin compresion de razonamiento |

La comparacion cuantitativa no es posible con los datos disponibles. El autor indica que este adaptador de ablacion puede ser peor que el modelo principal del mismo nivel, ya que fue entrenado para responder una pregunta especifica sobre diseno de recompensas.

## Limitaciones y advertencias

- Entrenado y evaluado exclusivamente en problemas de matematicas de palabras (GSM8K); no generaliza a otros dominios.
- La precision disminuye con la dificultad del problema, con la caida mas rapida en los niveles comprimidos.
- Es una ablacion, no un modelo de produccion: fue entrenado para evaluar el diseno de recompensas y puede tener peor rendimiento que el modelo principal del mismo nivel.
- Resultados con una unica semilla; diferencias de un par de puntos porcentuales estan dentro del ruido estadistico.
- Requiere cargar primero el adaptador SFT L4 (`ssurface/cot-dialect-olmo3-7b-think-sft-l4`), fusionarlo, y luego cargar este adaptador; cargarlo directamente sobre el modelo base no reproduce los resultados publicados.
- Solo soporta ingles; no hay datos sobre rendimiento en otros idiomas.
- El formato de salida es rigido (bloque ` thinking...` + `response` + `#### <respuesta>`); cualquier desviacion puede degradar el rendimiento.
- Riesgo de alucinacion en problemas fuera de la distribucion de entrenamiento, especialmente en razonamiento comprimido donde la informacion intermedia es escasa.

## Enlaces

- Repositorio del modelo: https://huggingface.co/ssurface/cot-dialect-olmo3-7b-think-grpo-base-seed7-l4
- Modelo base: https://huggingface.co/allenai/Olmo-3-7B-Think
- Modelo principal del nivel L4 (referencia): https://huggingface.co/ssurface/cot-dialect-olmo3-7b-think-grpo-l4
- Adaptador SFT L4 (requerido para la carga): https://huggingface.co/ssurface/cot-dialect-olmo3-7b-think-sft-l4
- Dataset de entrenamiento: https://huggingface.co/datasets/openai/gsm8k
- Pagina del modelo base en LM Studio: https://lmstudio.ai/models/allenai/olmo-3-7b-think
- Ficha tecnica de Olmo-3-7B-Think en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/olmo-3-7b-think-allenai
