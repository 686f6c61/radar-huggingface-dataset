# ssurface/cot-dialect-olmo3-7b-think-grpo-gr3relaxed-seed7-l5

## Resumen

Este repositorio contiene un adaptador LoRA de tipo ablativo que modifica el comportamiento de razonamiento de `allenai/Olmo-3-7B-Think` para operar en el nivel de compresion L5, el mas extremo de la familia de "dialectos de compresion de chain-of-thought" desarrollada por Anatolii Frolov. En este nivel, las cadenas de razonamiento se colapsan a una unica expresion aritmetica de aproximadamente 16 caracteres (por ejemplo, `18/3*2=12`), frente a los 532 caracteres de mediana del nivel L1, lo que supone un rango de compresion de 33x.

El modelo se entrena con GRPO sobre el modelo SFT fusionado del nivel L5, y se publica como una ablacion de diseno de recompensa (variante `gr3relaxed-seed7`) para permitir la comparacion reproducible de estrategias de reward en el articulo asociado. No es uno de los modelos principales de la familia: su proposito es responder a una pregunta especifica sobre diseno de recompensas, y el propio autor advierte que puede ser peor que el modelo principal del mismo nivel. El adaptador alcanza un 73,5% de exactitud en GSM8K test (n=1317, decodificacion greedy, sin ejemplos ni self-consistency).

La relevancia de este modelo reside en su contribucion a la investigacion sobre compresion de cadenas de razonamiento: demuestra que es posible mantener un rendimiento razonable en razonamiento matematico con cadenas de pensamiento extremadamente comprimidas, y proporciona un punto de comparacion controlado para evaluar el impacto del diseno de recompensas en el entrenamiento GRPO.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre `allenai/Olmo-3-7B-Think` (transformer decoder-only) |
| Parametros totales | No disponible (adaptador LoRA r=16, alpha=32; modelo base de 7B parametros) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (hereda la del modelo base Olmo-3-7B-Think) |
| Tipos de cuantizacion | No especificado (el adaptador se carga en bfloat16 sobre el modelo base) |
| Idiomas soportados | Ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena mediante GRPO (Group Relative Policy Optimization) sobre el modelo SFT fusionado del nivel L5, es decir, no directamente sobre el modelo base `allenai/Olmo-3-7B-Think` sino sobre una version previamente ajustada por supervisión para ese nivel de compresion. El entrenamiento utiliza `trl.GRPOTrainer` sobre `transformers` estandar con atencion `sdpa` (sin kernels fusionados, ya que la ruta fusionada producia adaptadores con matrices `lora_B` todas a cero, matematicamente inertes). La configuracion incluye 8 generaciones por prompt, batch de 32 con 2 pasos de acumulacion, maximo de 256 tokens de completado, learning rate de 1e-05 y coeficiente KL (beta) de 0.01.

El dataset de entrenamiento consiste en 6993 ejemplos de GSM8K train reexpresados a nivel L5 por un modelo profesor, con una mediana de longitud de cadena de 16 caracteres dentro de la etiqueta `thinking`. El sistema de recompensas combina cuatro componentes: `correctness` (ponderado por el numero de pasos de la solucion de referencia), `format` (exige un bloque `thinking...response` seguido de `#### <answer>`), `chain` (un verificador que comprueba que la aritmetica escrita en la cadena es correcta) y `gr3` (reescalado multiplicativo de la recompensa positiva combinada con un suelo de 0.3, que no puede reordenar respuestas correctas por encima de incorrectas). El entrenamiento se realizo en una unica NVIDIA A100 de 80 GB.

## Capacidades

- Razonamiento matematico con cadenas de pensamiento extremadamente comprimidas (nivel L5, una unica expresion colapsada).
- Generacion de texto conversacional mediante el pipeline `text-generation`.
- Razonamiento aritmetico verificable: el componente de recompensa `chain` garantiza que la aritmetica interna de la cadena es correcta.
- Soporte de carga secuencial de adaptadores: requiere primero el adaptador SFT del nivel L5 y despues este adaptador GRPO, con fusion previa mediante `merge_and_unload()`.
- No soporta tool calling, vision ni audio: es un modelo puramente textual de razonamiento matematico.
- El prompt de uso requiere el prefijo `Solve this using Level 5 (Extreme).` seguido del problema.

## Casos de uso

- Investigacion sobre compresion de chain-of-thought: este adaptador permite estudiar como afecta el diseno de recompensas (variante `gr3relaxed`) al rendimiento en niveles extremos de compresion, comparandolo con el modelo principal del mismo nivel.
- Reproduccion de experimentos de ablacion: el autor publica este modelo especificamente para que la comparacion de diseno de recompensas del articulo pueda reejecutarse de forma independiente.
- Evaluacion de limites de compresion en razonamiento: sirve para medir hasta que punto una cadena de 16 caracteres puede mantener precision en problemas aritmeticos de nivel GSM8K.
- Analisis de robustez del entrenamiento GRPO: permite comparar el efecto de diferentes funciones de recompensa sobre el mismo nivel de compresion y el mismo conjunto de prompts.
- Verificacion de integridad de adaptadores LoRA: el autor documenta que 13 adaptadores fallaron la comprobacion `lora_B != 0` y fueron retenidos, lo que convierte a este repositorio en un caso de estudio sobre validacion de adaptadores entrenados con kernels fusionados.
- Generacion de respuestas aritmeticas de baja latencia: al requerir cadenas de solo 16 caracteres, el modelo produce respuestas con un numero minimo de tokens de razonamiento, lo que reduce la latencia y el coste computacional por consulta en escenarios de razonamiento matematico.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Razonamiento matematico | GSM8K (test, n=1317) | Accuracy (exact match) | 73,5% |

Condiciones de evaluacion: decodificacion greedy, single-turn, sin ejemplos, sin self-consistency. El autor indica que el intervalo de confianza al 95% tiene una semianchura de aproximadamente 2,7 puntos porcentuales para n=1317, por lo que diferencias de un par de puntos entre semillas estan dentro del ruido estadistico.

No se han publicado resultados para otros benchmarks (MMLU, HumanEval, etc.) en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA ocupa 0,2 GB en el repositorio, pero requiere cargar el modelo base `allenai/Olmo-3-7B-Think` de 7B parametros, lo que domina el consumo de VRAM.
- Estimacion de VRAM para inferencia en bfloat16: aproximadamente 14-16 GB para el modelo base, mas el overhead de los adaptadores fusionados.
- Con cuantizacion de 4 bits del modelo base (por ejemplo, mediante bitsandbytes o GGUF), la huella total se reduce a aproximadamente 4-5 GB, lo que permite ejecucion en GPUs de consumo como RTX 3090 o RTX 4090.
- El entrenamiento se realizo en 1x NVIDIA A100 80 GB, que es el hardware de referencia para reproducir los resultados.
- Opciones de despliegue: el adaptador debe fusionarse primero con el modelo SFT L5 y despues con este adaptador GRPO mediante `PeftModel` y `merge_and_unload()`. Tras la fusion, el modelo resultante puede servirse con vLLM, llama.cpp, Ollama o TGI como un modelo estandar de 7B.
- La latencia por consulta es reducida en comparacion con modelos de razonamiento estandar, ya que el maximo de tokens de completado es de 256 y las cadenas tipicas son de unos 16 caracteres.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GSM8K | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ssurface/cot-dialect-olmo3-7b-think-grpo-gr3relaxed-seed7-l5` (este) | 7B base + LoRA | No disponible | 73,5% | Apache 2.0 | HuggingFace |
| `ssurface/cot-dialect-olmo3-7b-think-grpo-l5` (modelo principal del nivel L5) | 7B base + LoRA | No disponible | No publicado en la informacion disponible | Apache 2.0 | HuggingFace |
| `ssurface/cot-dialect-olmo3-7b-think-sft-l5` (SFT previo al GRPO) | 7B base + LoRA | No disponible | No publicado en la informacion disponible | Apache 2.0 | HuggingFace |
| `allenai/Olmo-3-7B-Think` (modelo base) | 7B | No disponible | No publicado en la informacion disponible | Apache 2.0 | HuggingFace |

El autor no publica comparativas numericas con otros modelos en la model card. La comparacion relevante es interna a la familia de dialectos de compresion: este adaptador es una ablacion del modelo principal L5 bajo una recompensa distinta (`gr3relaxed`), y el propio autor advierte que puede ser peor que el modelo principal del mismo nivel.

## Limitaciones y advertencias

- Modelo de ablacion: fue entrenado para responder a una pregunta especifica sobre diseno de recompensas y puede ser peor que el modelo principal del mismo nivel (`grpo-l5`); no es adecuado como modelo de produccion general.
- Entrenado y evaluado exclusivamente en problemas matematicos de tipo word problem (GSM8K); no hay evidencia de rendimiento en otras tareas.
- La precision cae con la dificultad del problema, y la caida es mas rapida en los niveles comprimidos como L5.
- Entrenado con una unica semilla (seed 7); diferencias de un par de puntos porcentuales estan dentro del ruido estadistico (semianchura del IC 95% de ~2,7 pp).
- El adaptador no funciona cargado directamente sobre `allenai/Olmo-3-7B-Think`: requiere cargar primero el adaptador SFT del nivel L5, fusionarlo, y despues cargar este adaptador. Cargarlo directamente no reproduce los resultados publicados.
- Solo soporta ingles.
- El autor advierte de un problema con kernels fusionados en el entrenamiento: los adaptadores entrenados con esa ruta producian matrices `lora_B` todas a cero y fueron descartados; este adaptador fue verificado con `lora_B != 0` antes de publicarse.
- No se dispone de informacion sobre sesgos especificos, pero al tratarse de un modelo entrenado sobre GSM8K (dataset de problemas aritmeticos en ingles), su comportamiento fuera de ese dominio es impredecible.

## Enlaces

- Repositorio del modelo: https://huggingface.co/ssurface/cot-dialect-olmo3-7b-think-grpo-gr3relaxed-seed7-l5
- Modelo base: https://huggingface.co/allenai/Olmo-3-7B-Think
- Modelo SFT previo (requerido para la carga): https://huggingface.co/ssurface/cot-dialect-olmo3-7b-think-sft-l5
- Modelo principal del nivel L5: https://huggingface.co/ssurface/cot-dialect-olmo3-7b-think-grpo-l5
- Articulo de referencia (citado en la model card): "Chain-of-Thought Compression Dialects" de Anatolii Frolov (2026), preprint no localizado en la busqueda web.
- Paper de Olmo 3: https://arxiv.org/abs/2512.13961
- Repositorio de codigo de OLMo: https://github.com/allenai/OLMo
- Version GGUF del modelo base: https://huggingface.co/unsloth/Olmo-3-7B-Think-GGUF
