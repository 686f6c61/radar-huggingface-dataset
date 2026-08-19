# ssurface/cot-dialect-olmo3-7b-think-grpo-gr3relaxed-l5

## Resumen

`cot-dialect-olmo3-7b-think-grpo-gr3relaxed-l5` es un adaptador LoRA publicado por `ssurface` que modifica el comportamiento de razonamiento del modelo base `allenai/Olmo-3-7B-Think` para producir cadenas de pensamiento extremadamente comprimidas (nivel L5). El adaptador se entrena mediante GRPO sobre el conjunto GSM8K, con un esquema de recompensa modificado (`gr3relaxed`) que aplica un reescalado multiplicativo a las recompensas positivas, con un suelo en 0.3. Se trata de una ablación explícita para estudiar el efecto del diseño de recompensas en la compresión de razonamiento, no un modelo principal de la familia.

El modelo se apila sobre un adaptador SFT previo (`ssurface/cot-dialect-olmo3-7b-think-sft-l5`) y sobre el base Olmo-3-7B-Think, que es un transformer de 7B parámetros con atención SDPA y entrenado para razonamiento largo. La compresión L5 reduce la mediana de la cadena de razonamiento a 16 caracteres (frente a 532 en L1), lo que supone un factor de 33x. El adaptador consigue un 73.4% de precisión exacta en GSM8K test (n=1317) con decodificación greedy, sin ejemplos ni self-consistency.

La relevancia de este modelo es principalmente investigadora: permite reproducir y comparar el efecto de una variante de recompensa en el entrenamiento de compresión de cadenas de pensamiento. No está pensado para uso en producción directa, sino como pieza de un estudio más amplio sobre dialectos de compresión de CoT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer OLMo-3-7B-Think (atención SDPA) |
| Parametros totales | 7B (modelo base) + adaptador LoRA (r=16, alpha=32) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el modelo base soporta contexto largo, según documentacion de Olmo 3) |
| Tipos de cuantizacion | No aplica (adaptador LoRA en bfloat16) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (formato PEFT LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena con GRPO (Group Relative Policy Optimization) sobre el modelo base `allenai/Olmo-3-7B-Think` ya fusionado con el adaptador SFT de nivel L5 (`ssurface/cot-dialect-olmo3-7b-think-sft-l5`). El dataset de entrenamiento consiste en 6993 ejemplos de GSM8K train re-expresados a nivel L5 por un modelo profesor, con una mediana de longitud de cadena de razonamiento de 16 caracteres dentro de la etiqueta `thinking`.

La funcion de recompensa combina cuatro componentes: `correctness` (que pondera la recompensa segun el numero de pasos de la solucion dorada), `format` (exige una estructura `thinking... response` seguida de `#### <answer>`), `chain` (un verificador aritmetico que comprueba que los calculos escritos en la cadena son correctos) y `gr3` (un reescalado multiplicativo de las recompensas positivas con suelo en 0.3). Este ultimo componente es la variante experimental que distingue este adaptador del modelo principal de nivel L5.

El entrenamiento se realizo con `trl.GRPOTrainer` sobre `transformers` estandar con atencion `sdpa`, 8 generaciones por prompt, batch de 32 con acumulacion x2, max completion de 256 tokens, learning rate de 1e-05 y coeficiente KL (beta) de 0.01. Se utilizo una unica GPU NVIDIA A100 80GB. Un detalle relevante: el autor verifico que los adaptadores entrenados con kernels fusionados producian matrices `lora_B` todas a cero (matematicamente inertes), por lo que todos los adaptadores publicados fueron comprobados para garantizar `lora_B != 0`.

## Capacidades

- Razonamiento matematico con cadenas de pensamiento extremadamente comprimidas (nivel L5, mediana de 16 caracteres).
- Generacion de respuestas con formato estricto: un bloque `thinking` seguido de `response` y una linea final `#### <answer>`.
- Verificacion aritmetica interna: la cadena de razonamiento debe ser aritmeticamente correcta (recompensa `chain`).
- Solo texto, sin soporte de vision, audio ni tool calling.
- Multilingue: no, solo ingles.
- Sin modo de pensamiento extendido: el modelo esta disenado para producir cadenas cortas, no razonamiento largo.

## Casos de uso

- Investigacion sobre compresion de cadenas de pensamiento: este adaptador sirve como ablacion para estudiar como una recompensa relajada (`gr3relaxed`) afecta a la calidad del razonamiento comprimido frente al modelo principal con recompensa estandar.
- Reproduccion de experimentos de diseno de recompensas en RLHF/GRPO: permite comparar el efecto de diferentes funciones de recompensa en el mismo nivel de compresion.
- Evaluacion de la robustez de la compresion: se puede usar para medir la degradacion de precision cuando la cadena de razonamiento se reduce drasticamente (de 532 a 16 caracteres).
- Generacion de explicaciones breves en dominios matematicos: si se necesita una respuesta con justificacion minima, el modelo produce una expresion comprimida (ej. `18/3*2=12`).
- Pruebas de verificación de cadenas: el componente `chain` de la recompensa puede inspirar metodos de validacion aritmetica en otros modelos.
- Benchmark de referencia para modelos de razonamiento comprimido: el 73.4% en GSM8K con cadenas de 16 caracteres es un punto de comparacion util para futuros trabajos.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (GSM8K test, n=1317, decodificacion greedy, sin ejemplos ni self-consistency):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Razonamiento matematico | GSM8K (test) | Accuracy (exact match) | 73.4% |

No se han publicado resultados en otros benchmarks (HumanEval, MMLU, etc.) en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA es pequeno (0.2 GB), pero requiere cargar el modelo base `allenai/Olmo-3-7B-Think` de 7B parametros.
- VRAM estimada: en bfloat16, el modelo base ocupa ~14 GB; con el adaptador fusionado, se necesita al menos 16 GB de VRAM para inferencia comoda.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB), A100 40/80 GB, H100. En GPUs consumer de 16 GB (RTX 4080, 3090) puede funcionar con cuantizacion del base, pero el adaptador no esta disponible en formato GGUF.
- Despliegue: se puede usar con `transformers` + `peft` (cargar base, luego el adaptador SFT, fusionar, luego este adaptador). Tambien es posible usar `vLLM` si se fusiona previamente el adaptador en los pesos del base.
- Latencia: no se proporcionan datos de latencia o throughput en la informacion disponible.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados en la informacion proporcionada. El adaptador es una variante de ablacion del modelo `ssurface/cot-dialect-olmo3-7b-think-grpo-l5` (mismo nivel L5 con recompensa estandar), pero no se publican sus resultados. Tampoco se conocen los resultados de GSM8K del base `allenai/Olmo-3-7B-Think` sin compresion. Se recomienda consultar el paper citado para la comparativa completa de la familia.

## Limitaciones y advertencias

- Entrenado y evaluado exclusivamente en problemas de matematicas de palabra (GSM8K); no generaliza a otros dominios.
- La precision cae rapidamente con la dificultad del problema, especialmente en los niveles de compresion mas altos (L5).
- Es una ablacion experimental: el autor indica que puede ser peor que el modelo principal del mismo nivel, ya que se entreno para responder una pregunta concreta sobre diseno de recompensas.
- Requiere cargar primero el adaptador SFT de nivel L5 (`ssurface/cot-dialect-olmo3-7b-think-sft-l5`) y fusionarlo antes de aplicar este adaptador; cargarlo directamente sobre el base no reproduce los resultados declarados.
- Entrenado con una unica semilla; diferencias de un par de puntos porcentuales estan dentro del ruido estadistico (intervalo de confianza del 95% de ~2.7 puntos en n=1317).
- Riesgo de alucinacion aritmetica: aunque la recompensa `chain` verifica la cadena durante el entrenamiento, en inferencia el modelo puede producir respuestas incorrectas sin deteccion.
- Solo ingles; no soporta otros idiomas.
- Sin soporte de tool calling, agentes ni razonamiento multi-paso extendido.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/ssurface/cot-dialect-olmo3-7b-think-grpo-gr3relaxed-l5
- Modelo base: https://huggingface.co/allenai/Olmo-3-7B-Think
- Adaptador SFT previo (necesario): https://huggingface.co/ssurface/cot-dialect-olmo3-7b-think-sft-l5
- Paper de Olmo 3: https://arxiv.org/abs/2512.13961
- Pagina de Olmo de AI2: https://allenai.org/olmo
