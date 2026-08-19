# ssurface/cot-dialect-olmo3-7b-think-grpo-sftlen-exp-l4

## Resumen

El modelo `cot-dialect-olmo3-7b-think-grpo-sftlen-exp-l4` es un adaptador LoRA de investigación publicado por el usuario `ssurface` sobre el modelo base `allenai/Olmo-3-7B-Think`. Su propósito es entrenar al modelo para generar cadenas de razonamiento (chain-of-thought) extremadamente comprimidas, en concreto al nivel de compresión L4, donde las cadenas se expresan como asignaciones encadenadas con punto y coma (p. ej., `K=18*2.5;D=8*4;T=K+D->T=77`). Este adaptador es una **ablación** dentro de una familia más amplia de "dialectos de compresión", diseñada específicamente para evaluar el impacto de la componente de recompensa `sft_length` en el entrenamiento con GRPO, en comparación con el modelo principal del mismo nivel (`ssurface/cot-dialect-olmo3-7b-think-grpo-l4`).

El adaptador se entrenó sobre el conjunto de entrenamiento de GSM8K (6976 ejemplos re-expresados por un modelo profesor a nivel L4) y alcanza un 65,9% de precisión exacta en el split de test de GSM8K con decodificación greedy. Es un artefacto puramente experimental, pensado para reproducir los resultados del paper sobre compresión de cadenas de razonamiento, no para uso en producción. Al ser un adaptador LoRA, requiere cargar primero el modelo base fusionado con el adaptador SFT de nivel 4 (`ssurface/cot-dialect-olmo3-7b-think-sft-l4`) antes de aplicar este adaptador GRPO.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Olmo-3-7B-Think (transformer decoder-only) |
| Parametros totales | no disponible (adaptador LoRA, r=16, alpha=32) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (depende del modelo base) |
| Tipos de cuantizacion | no disponible (el adaptador se puede combinar con cuantizaciones del modelo base) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (via PEFT) |

## Arquitectura y entrenamiento

El adaptador se construye sobre el modelo base `allenai/Olmo-3-7B-Think`, un transformer causal de 7B parametros desarrollado por AllenAI, entrenado con SFT, DPO y RLVR para producir razonamiento paso a paso. Este adaptador concreto se entrena mediante GRPO (Group Relative Policy Optimization) sobre el modelo SFT de nivel L4 ya fusionado (`merged_olmo/l4`), utilizando el `trl.GRPOTrainer` con atención `sdpa` (sin kernels fusionados). La configuracion incluye 8 generaciones por prompt, batch de 64 con 1 acumulacion, longitud maxima de completacion de 256 tokens, learning rate de 1e-05 y coeficiente KL de 0.0.

La funcion de recompensa combina tres componentes: `correctness` (que pondera la precision segun el numero de pasos de la solucion dorada), `format` (que exige una estructura de respuesta con un bloque `thinking... response` y `#### <answer>`) y `sft_length` (una penalizacion que mide la desviacion de la longitud de la cadena generada respecto a la cadena SFT de referencia para cada ejemplo). Esta ultima componente es la que se esta ablacionando en este experimento. El entrenamiento se realizo en una unica NVIDIA A100 80GB. Una nota importante del autor: el adaptador se verifico que sus matrices `lora_B` no fueran todas cero, descartando 13 adaptadores que fallaron esa comprobacion.

## Capacidades

- Razonamiento matematico con cadenas de pensamiento comprimidas a nivel L4 (asignaciones encadenadas con punto y coma).
- Generacion de texto en ingles siguiendo un formato estricto de respuesta (`thinking... response` y `#### <answer>`).
- Especializado en problemas de matematicas de palabra (word problems) del estilo GSM8K.
- Capacidad de razonamiento paso a paso, aunque con pasos muy condensados y sin explicaciones verbales extensas.
- No soporta tool calling, ni vision, ni audio, ni capacidades multilingues.
- Es un adaptador de investigacion, no un modelo generalista; su unica tarea demostrada es el razonamiento aritmetico en ingles.

## Casos de uso

- Investigacion en compresion de cadenas de razonamiento: este adaptador permite reproducir y comparar el efecto de la recompensa `sft_length` en la calidad del razonamiento comprimido, tal como se describe en el paper de dialectos de compresion. Es util para validar disenos de funciones de recompensa en entrenamiento GRPO.
- Estudio de trade-offs entre longitud de razonamiento y precision: al comparar este adaptador con el modelo principal del mismo nivel (sin la ablacion), los investigadores pueden cuantificar como la penalizacion de longitud afecta a la exactitud en tareas de matematicas.
- Benchmarking de tecnicas de compresion de CoT: sirve como punto de referencia para evaluar metodos alternativos de compresion de cadenas de razonamiento en modelos de 7B.
- Reproducibilidad de experimentos de RLHF/GRPO: al ser una ablacion publicada con configuracion detallada (hiperparametros, datos, recompensas), permite a otros grupos replicar el experimento y verificar la robustez de los resultados.
- Analisis de robustez frente a la dificultad del problema: dado que la precision cae con la dificultad, este modelo puede usarse para estudiar como la compresion afecta a problemas mas complejos dentro de GSM8K.
- Desarrollo de tecnicas de decodificacion eficiente: las cadenas comprimidas (mediana de 41 caracteres) permiten explorar estrategias de inferencia con menos tokens de razonamiento, lo que podria reducir la latencia en entornos con restricciones de computo.

## Benchmarks y rendimiento

El unico resultado publicado en la model card es la precision exacta en el split de test de GSM8K (n=1317), con decodificacion greedy, sin ejemplos y sin self-consistency:

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Razonamiento matematico | GSM8K (test) | Accuracy (exact match) | 65,9% |

No se han publicado resultados comparativos con otros modelos o con el modelo base sin adaptador en la informacion disponible. El autor indica que la diferencia de un par de puntos porcentuales esta dentro del ruido estadistico (95% half-width ~2.7 pp para n=1317).

## Requisitos de hardware

- El adaptador LoRA ocupa aproximadamente 0.2 GB, pero requiere cargar el modelo base `allenai/Olmo-3-7B-Think` de 7B parametros.
- Para inferencia con el modelo base en bf16 se necesitan unos 14-16 GB de VRAM (p. ej., una NVIDIA RTX 4090 o A100 40GB).
- Con cuantizacion de 8 bits, la VRAM estimada baja a unos 8 GB, lo que permite ejecutarlo en GPUs consumer como RTX 3070/3080.
- Con cuantizacion de 4 bits, la VRAM estimada es de unos 4-5 GB, compatible con RTX 3060 o similares.
- El entrenamiento se realizo en una unica NVIDIA A100 80GB.
- Para despliegue, se puede usar `transformers` con `peft` (cargando el adaptador sobre el modelo base), o exportar a formatos como GGUF para `llama.cpp` u Ollama, aunque el adaptador esta disenado para cargarse via PEFT sobre el modelo SFT fusionado.
- La latencia dependera de la longitud de la cadena generada; al ser cadenas muy cortas (mediana de 41 caracteres), la inferencia es rapida en comparacion con modelos de razonamiento estandar.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de modelos comparables en la informacion proporcionada. El autor menciona que existe un modelo principal del mismo nivel (`ssurface/cot-dialect-olmo3-7b-think-grpo-l4`) que no es una ablacion, pero no se proporcionan sus resultados numericos. Tampoco se dispone de comparaciones con el modelo base sin adaptador ni con otros modelos de razonamiento de 7B. Por tanto, no es posible realizar una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Es una ablacion experimental, no un modelo de produccion; el propio autor advierte que puede ser peor que el modelo principal del mismo nivel.
- Entrenado y evaluado exclusivamente en problemas de matematicas de palabra en ingles (GSM8K); no generaliza a otros dominios ni idiomas.
- Las cadenas de razonamiento comprimidas pueden ser dificiles de interpretar para humanos y pueden aumentar el riesgo de errores silenciosos o alucinaciones en problemas complejos.
- La precision cae con la dificultad del problema, y la caida es mas pronunciada en los niveles de compresion altos como L4.
- El adaptador debe cargarse sobre el modelo SFT fusionado (`ssurface/cot-dialect-olmo3-7b-think-sft-l4`), no directamente sobre el modelo base; cargarlo directamente no reproducira los resultados publicados.
- Se utilizo una unica semilla aleatoria; las diferencias de unos pocos puntos porcentuales pueden deberse al ruido.
- Aunque la licencia Apache-2.0 permite uso comercial, la naturaleza experimental y la falta de robustez fuera de GSM8K hacen desaconsejable su uso en entornos productivos.
- No se proporcionan datos sobre sesgos demograficos o de contenido; al ser un modelo entrenado solo con datos de GSM8K, no se ha evaluado su comportamiento en otros contextos.

## Enlaces

- HuggingFace del adaptador: https://huggingface.co/ssurface/cot-dialect-olmo3-7b-think-grpo-sftlen-exp-l4
- Modelo base: https://huggingface.co/allenai/Olmo-3-7B-Think
- Modelo SFT de nivel 4 (requerido para cargar el adaptador): https://huggingface.co/ssurface/cot-dialect-olmo3-7b-think-sft-l4
- Modelo principal del mismo nivel (sin ablacion): https://huggingface.co/ssurface/cot-dialect-olmo3-7b-think-grpo-l4
- Referencia del paper (citado en la model card): Frolov, Anatolii. "Chain-of-Thought Compression Dialects", 2026 (sin URL publica en la informacion disponible).
