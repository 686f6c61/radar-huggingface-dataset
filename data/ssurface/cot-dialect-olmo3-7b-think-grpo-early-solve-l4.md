# ssurface/cot-dialect-olmo3-7b-think-grpo-early-solve-l4

## Resumen

Este modelo es un adaptador LoRA publicado por el usuario ssurface que modifica el comportamiento de razonamiento de `allenai/Olmo-3-7B-Think` para operar en el nivel de compresion L4 de la familia "Chain-of-Thought Compression Dialects". En este nivel, las cadenas de razonamiento se expresan como asignaciones encadenadas con punto y coma (por ejemplo, `K=18*2.5;D=8*4;T=K+D->T=77`), reduciendo la longitud mediana de la cadena a 41 caracteres frente a los 532 del nivel L1, un rango de compresion de 33x.

Se trata de una ablation especifica, no de uno de los modelos principales de la familia: fue entrenada con una variante de recompensa denominada `early_solve`, que premia alcanzar la respuesta temprano en la secuencia, y se publica para permitir reproducir la comparacion de diseno de recompensas descrita en el articulo de investigacion. El adaptador se entrena mediante GRPO sobre el modelo SFT fusionado del nivel L4 y debe cargarse sobre dicho modelo SFT, no directamente sobre el base sin ajustar.

El modelo esta licenciado bajo Apache-2.0, pesa 0.2 GB y esta orientado exclusivamente a razonamiento matematico en ingles (dataset GSM8K). Alcanza un 67.8% de exactitud en el test de GSM8K con decodificacion greedy y sin self-consistency.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (r=16, alpha=32) sobre allenai/Olmo-3-7B-Think (transformer decoder-only) |
| Parametros totales | No disponible (adaptador LoRA; modelo base de 7B parametros) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Olmo-3-7B-Think) |
| Tipos de cuantizacion | No disponible (el base se carga en bfloat16 segun el codigo de uso) |
| Idiomas soportados | Ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena con GRPO (Group Relative Policy Optimization) usando `trl.GRPOTrainer` sobre `transformers` estandar con atencion `sdpa`. El modelo base es `allenai/Olmo-3-7B-Think`, un modelo de 7B parametros de la familia Olmo 3 de AllenAI, entrenado sobre el dataset Dolma 3 y disenado para razonamiento con contexto largo, function calling, codigo, instrucciones y chat.

El entrenamiento se realiza sobre el modelo SFT fusionado del nivel L4 (`merged_olmo/l4`), no sobre el base sin ajustar. La funcion de recompensa combina tres componentes: `correctness` (que pondera segun el numero de pasos de la solucion dorada, de modo que los problemas mas dificiles valen mas), `format` (que exige un bloque `thinking... response` seguido de `#### <answer>`) y `early_solve` (que premia llegar a la respuesta pronto en la secuencia). Se usa loss tipo `dapo`, 8 generaciones por prompt, batch de 64 con acumulacion 1, maximo de 256 tokens de completado, learning rate de 1e-05 y coeficiente KL de 0.0. El dataset de entrenamiento son 6976 ejemplos de GSM8K train reexpresados en nivel L4 por un modelo profesor.

Un detalle tecnico notable: el autor verifico que todos los adaptadores publicados tuvieran matrices `lora_B` distintas de cero, ya que el path con kernels fusionados producia adaptadores inertes matematicamente (matrices `lora_B` todas a cero) a pesar de cargar sin errores; 13 adaptadores que fallaron esa comprobacion fueron retenidos y no publicados.

## Capacidades

- Razonamiento matematico: resuelve problemas de palabras del dataset GSM8K con una exactitud del 67.8% en test (decodificacion greedy, una sola pasada, sin ejemplos ni self-consistency).
- Compresion de cadenas de razonamiento: opera en nivel L4, con cadenas de pensamiento expresadas como asignaciones encadenadas con punto y coma (mediana de 41 caracteres).
- Generacion de texto: pipeline de text-generation estandar con transformers y PEFT.
- Soporte de tool calling: no disponible (no documentado en la informacion proporcionada).
- Capacidades multilingues: no, solo ingles.
- Modo thinking: hereda la capacidad de razonamiento explicito del modelo base Olmo-3-7B-Think, pero comprimido al nivel L4.

## Casos de uso

- Investigacion sobre compresion de cadenas de razonamiento: este adaptador es una ablation para estudiar el impacto del diseno de recompensas (en concreto, `early_solve`) en la calidad del razonamiento comprimido. Permite reproducir los experimentos del articulo "Chain-of-Thought Compression Dialects" sin depender de las afirmaciones del autor.
- Evaluacion de razonamiento matematico en entornos con restricciones de coste: al comprimir las cadenas de razonamiento a 41 caracteres de media, el modelo reduce drasticamente el numero de tokens generados por problema, lo que abarata la inferencia y reduce la latencia en tareas de aritmetica de varios pasos.
- Comparacion de diseno de recompensas en RL: al ser una ablation con una recompensa distinta a la del modelo principal del mismo nivel (`ssurface/cot-dialect-olmo3-7b-think-grpo-l4`), permite aislar el efecto de la recompensa `early_solve` frente a la recompensa estandar en un mismo nivel de compresion.
- Benchmarking de adaptadores LoRA sobre Olmo-3-7B-Think: sirve como punto de referencia para medir el rendimiento de adaptadores de bajo rango (r=16) sobre el modelo Think de AllenAI en tareas de razonamiento matematico.
- Educacion e investigacion academica: util para cursos y trabajos que estudien tecnicas de RL (GRPO), compresion de cadenas de pensamiento y metodologia experimental con ablaciones, ya que el codigo de entrenamiento y los datos estan documentados.
- Prototipado de sistemas de respuesta a problemas matematicos: aunque es una ablation, puede servir para prototipar sistemas que necesiten respuestas rapidas y concisas en problemas de aritmetica de varios pasos, siempre que se acepte una precision inferior a la de un modelo sin comprimir.

## Benchmarks y rendimiento

| Tarea | Dataset | Metrica | Resultado |
|---|---|---|---|
| Razonamiento matematico | GSM8K (test, n=1317) | Accuracy (exact match) | 67.8% |

Condiciones de evaluacion declaradas por el autor: decodificacion greedy, una sola pasada, sin ejemplos (few-shot) ni self-consistency. Resultado no verificado de forma independiente. El autor indica que la diferencia de un par de puntos porcentuales esta dentro del ruido estadistico (95% half-width de ~2.7 puntos porcentuales a n=1317).

## Requisitos de hardware

- Entrenamiento: 1x NVIDIA A100 80GB, segun la configuracion documentada en la model card.
- Inferencia: al ser un adaptador LoRA sobre un modelo de 7B, la VRAM requerida es la del modelo base mas el adaptador. En bfloat16, el base requiere aproximadamente 14 GB de pesos, mas KV cache y activaciones, por lo que se necesitan al menos 16-24 GB de VRAM. Con cuantizacion de 4 bits del base, cabria en GPUs consumer de 8-12 GB (por ejemplo, RTX 3080, RTX 4080 o RTX 4070 Ti Super).
- Opciones de despliegue: el modelo se carga con `transformers` y `peft` (carga del base, fusion del adaptador SFT L4, y luego este adaptador). No se documenta soporte para vLLM, Ollama o llama.cpp en la informacion proporcionada.
- Latencia: no disponible en la informacion proporcionada. Al comprimir las cadenas de razonamiento, el numero de tokens generados por problema es muy inferior al de un modelo Think sin comprimir, lo que reduce el tiempo de generacion de forma proporcional.

## Comparativa con modelos similares

| Modelo | Tipo | Accuracy GSM8K | Contexto | Licencia |
|---|---|---|---|---|
| ssurface/cot-dialect-olmo3-7b-think-grpo-early-solve-l4 (este) | LoRA sobre Olmo-3-7B-Think | 67.8% | No disponible | Apache-2.0 |
| ssurface/cot-dialect-olmo3-7b-think-grpo-l4 | LoRA sobre Olmo-3-7B-Think (modelo principal del nivel L4) | No disponible | No disponible | Apache-2.0 |
| allenai/Olmo-3-7B-Think | Modelo base 7B de AllenAI | No disponible | No disponible | Apache-2.0 |

Nota: el autor indica que este adaptador es una ablation y puede ser peor que el modelo principal del mismo nivel. La diferencia de unos pocos puntos porcentuales esta dentro del ruido estadistico.

## Limitaciones y advertencias

- Entrenado y evaluado exclusivamente en problemas de palabras matematicas (GSM8K); no hay evidencia de generalizacion a otros dominios.
- La precision cae con la dificultad del problema, de forma mas acusada en los niveles comprimidos segun el autor.
- Es una ablation de diseno de recompensas: fue entrenada para responder una pregunta concreta sobre el diseno de recompensas y puede ser peor que el modelo principal del mismo nivel.
- Debe cargarse sobre el modelo SFT fusionado del nivel L4 (`ssurface/cot-dialect-olmo3-7b-think-sft-l4`); cargarlo directamente sobre `allenai/Olmo-3-7B-Think` no reproduce los resultados publicados.
- Entrenado con una sola semilla; diferencias de un par de puntos porcentuales estan dentro del ruido estadistico.
- Solo soporta ingles.
- Riesgo de alucinacion: no evaluado en la informacion proporcionada; al ser un modelo de razonamiento comprimido, la probabilidad de errores silenciosos puede aumentar en problemas complejos.
- El modelo tiene 0 descargas y 0 likes en HuggingFace, lo que indica que no ha sido validado por la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ssurface/cot-dialect-olmo3-7b-think-grpo-early-solve-l4
- Modelo base: https://huggingface.co/allenai/Olmo-3-7B-Think
- Modelo SFT del nivel L4 (requerido para cargar este adaptador): https://huggingface.co/ssurface/cot-dialect-olmo3-7b-think-sft-l4
- Modelo principal del nivel L4: https://huggingface.co/ssurface/cot-dialect-olmo3-7b-think-grpo-l4
- Articulo de Olmo 3 (arXiv): https://arxiv.org/abs/2512.13961
- Repositorio EMO de AllenAI (scripts de entrenamiento Olmo 3): https://github.com/allenai/EMO
