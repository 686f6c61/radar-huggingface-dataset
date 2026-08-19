# ssurface/cot-dialect-olmo3-7b-think-grpo-early-solve-l5

## Resumen

`cot-dialect-olmo3-7b-think-grpo-early-solve-l5` es un adaptador LoRA publicado por el usuario `ssurface` que modifica el comportamiento de razonamiento del modelo base `allenai/Olmo-3-7B-Think` para operar en un nivel de compresión de cadena de pensamiento denominado "L5" (nivel extremo). En este nivel, el modelo produce cadenas de razonamiento extremadamente condensadas, con una longitud mediana de 16 caracteres dentro de la etiqueta `thinking`, frente a los 532 caracteres del nivel L1, lo que supone una reducción de 33 veces.

Este adaptador es explícitamente un estudio de ablación, no uno de los modelos principales de la familia: se entrenó con una función de recompensa distinta (incluyendo el componente `early_solve`, que premia alcanzar la respuesta pronto en la secuencia) para poder comparar el diseño de recompensas en el artículo asociado. El modelo se entrenó con GRPO sobre el dataset GSM8K reexpresado por un modelo profesor, y alcanza un 70,4% de precisión exacta en el test de GSM8K con decodificación greedy. Su relevancia radica en que permite estudiar cómo afecta el diseño de recompensas a la compresión del razonamiento, un área activa de investigación en eficiencia de modelos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base: Olmo-3-7B-Think) + adaptador LoRA |
| Parametros totales | ~7B (base) + adaptador LoRA (r=16, alpha=32) |
| Parametros activos | 7B (MoE: no, es denso) |
| Longitud de contexto | no disponible (heredada del base Olmo-3-7B-Think) |
| Tipos de cuantizacion | no disponible (entrenado en bfloat16) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se apila sobre `allenai/Olmo-3-7B-Think`, un modelo transformer denso de 7B parametros desarrollado por AI2 (Allen Institute for AI) como parte de la familia Olmo 3. El proceso de entrenamiento es de dos fases: primero se entrena un modelo SFT (supervised fine-tuning) con 6993 ejemplos de GSM8K reexpresados a nivel L5 por un modelo profesor; sobre ese modelo SFT fusionado se aplica GRPO (Group Relative Policy Optimization) usando `trl.GRPOTrainer` con atención `sdpa` (sin kernels fusionados).

La funcion de recompensa combina tres componentes: `correctness` (que pondera el acierto por el numero de pasos de la solucion dorada), `format` (que exige la estructura `thinking... response` seguida de `#### <respuesta>`) y `early_solve` (que premia alcanzar la respuesta pronto en la secuencia). El entrenamiento uso 8 generaciones por prompt, batch de 64 con acumulacion de 1, maximo de 256 tokens de completado, learning rate de 1e-05, coeficiente KL de 0.01 y un unico A100 de 80GB. Un detalle tecnico relevante: el autor verifico que las matrices `lora_B` de todos los adaptadores publicados no fueran cero, ya que el pipeline con kernels fusionados producia adaptadores matematicamente inertes.

## Capacidades

- Razonamiento matematico con cadenas de pensamiento comprimidas a nivel extremo (L5), con cadenas de solo 16 caracteres de mediana.
- Generacion de texto en ingles con formato estructurado de razonamiento (`thinking` y `response`).
- Resolucion de problemas aritmeticos de varias etapas tipo GSM8K.
- Capacidad de seguir el prompt especifico "Solve this using Level 5 (Extreme)".
- No soporta tool calling, ni vision, ni audio, ni modo agente.
- No es multilingue: solo entrenado y evaluado en ingles.

## Casos de uso

- Investigacion en compresion de cadenas de pensamiento: el modelo permite estudiar como afecta el componente de recompensa `early_solve` al rendimiento y a la longitud de las cadenas generadas, comparandolo con el modelo principal `cot-dialect-olmo3-7b-think-grpo-l5`.
- Evaluacion de diseno de recompensas en RL: como ablacion, sirve para reproducir los experimentos del articulo y verificar si el diseño de recompensas es robusto o depende del azar.
- Estudio de trade-off entre precision y compresion: permite medir la caida de rendimiento al comprimir el razonamiento de 532 a 16 caracteres, informacion util para decidir el nivel de compresion en produccion.
- Benchmark de razonamiento comprimido: puede usarse como referencia para comparar tecnicas de distillacion o compresion de CoT en modelos de 7B.
- Generacion de datos sinteticos: podria usarse para generar ejemplos de razonamiento ultra-corto para entrenar modelos mas eficientes, aunque su precision limitada (70,4%) exige filtrado posterior.
- Analisis de robustez de GRPO: el hecho de que sea una ablacion con una semilla unica permite estudiar la varianza de los resultados de GRPO en tareas de razonamiento.

## Benchmarks y rendimiento

| Modelo | GSM8K (test, exact match) |
|---|---|
| **cot-dialect-olmo3-7b-think-grpo-early-solve-l5** | **70,4%** |
| Base: Olmo-3-7B-Think (referencia) | no disponible en la informacion |

Resultados declarados por el autor: GSM8K test (n=1317), decodificacion greedy, single-turn, sin ejemplos y sin self-consistency. El autor indica que la diferencia de un par de puntos porcentuales esta dentro del ruido (half-width del 95% de ~2,7 pp a n=1317). No se han publicado resultados para otros benchmarks (MMLU, HumanEval, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base es de 7B parametros, por lo que en bfloat16 requiere aproximadamente 14-16 GB de VRAM. El adaptador LoRA anade un coste minimo.
- GPU recomendadas: el entrenamiento se realizo en un NVIDIA A100 80GB. Para inferencia, una RTX 4090 (24GB) o A100 es suficiente; cabe en GPUs consumer de 16GB o mas con cuantizacion.
- Opciones de despliegue: al ser un adaptador PEFT, requiere cargar el modelo base `allenai/Olmo-3-7B-Think` con `transformers` y `peft`. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, aunque tras fusionar el adaptador se podria exportar a GGUF.
- Latencia y throughput: no disponible. La compresion L5 reduce drasticamente el numero de tokens generados (16 caracteres de media frente a 532), lo que implica una reduccion sustancial de latencia en comparacion con el modelo base sin comprimir.
- Nota importante: el adaptador debe apilarse sobre el modelo SFT fusionado (`ssurface/cot-dialect-olmo3-7b-think-sft-l5`), no directamente sobre el base, para reproducir los resultados.

## Comparativa con modelos similares

| Modelo | Tamano | Contexto | GSM8K | Licencia | Notas |
|---|---|---|---|---|---|
| **cot-dialect-olmo3-7b-think-grpo-early-solve-l5** | 7B + LoRA | no disp. | 70,4% | Apache-2.0 | Ablacion, recompensa `early_solve` |
| `cot-dialect-olmo3-7b-think-grpo-l5` (principal) | 7B + LoRA | no disp. | no disp. | Apache-2.0 | Modelo principal del mismo nivel L5 |
| `allenai/Olmo-3-7B-Think` (base) | 7B | no disp. | no disp. | Apache-2.0 | Modelo base sin adaptador |
| `allenai/Olmo-3-7B-Instruct` | 7B | no disp. | no disp. | Apache-2.0 | Variante instruct sin modo think |

No se dispone de datos de rendimiento del modelo principal L5 ni del base para una comparacion cuantitativa directa. La comparativa con otros modelos de razonamiento comprimido (p. ej., modelos con CoT corto) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Es una ablacion, no un modelo de produccion: fue entrenado para responder una pregunta concreta sobre diseno de recompensas y puede ser peor que el modelo principal del mismo nivel.
- Solo entrenado y evaluado en problemas de matematicas tipo GSM8K; no hay evidencia de generalizacion a otras tareas de razonamiento o dominios.
- La precision cae con la dificultad del problema, y la caida es mas rapida en los niveles comprimidos.
- Entrenado con una sola semilla (salvo que el nombre del repo indique lo contrario); diferencias de un par de puntos estan dentro del ruido estadistico.
- Requiere cargar primero el adaptador SFT (`cot-dialect-olmo3-7b-think-sft-l5`) y fusionarlo; cargarlo directamente sobre el base no reproduce los resultados publicados.
- Riesgo de alucinacion: la compresion extrema del razonamiento (16 caracteres) puede producir respuestas incorrectas sin una cadena de verificacion explicita.
- Solo en ingles; no soporta otros idiomas.
- Sin garantias de soporte: es un repositorio de investigacion con 0 descargas y 0 likes, mantenido por un unico autor.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/ssurface/cot-dialect-olmo3-7b-think-grpo-early-solve-l5
- Modelo base: https://huggingface.co/allenai/Olmo-3-7B-Think
- Modelo SFT necesario (nivel L5): https://huggingface.co/ssurface/cot-dialect-olmo3-7b-think-sft-l5
- Modelo principal del mismo nivel: https://huggingface.co/ssurface/cot-dialect-olmo3-7b-think-grpo-l5
- Articulo de la familia Olmo 3: https://arxiv.org/abs/2512.13961
- Ficha del modelo en LM Studio: https://lmstudio.ai/models/allenai/olmo-3-7b-think
