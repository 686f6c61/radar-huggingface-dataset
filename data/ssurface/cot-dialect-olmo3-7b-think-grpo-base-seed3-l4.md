# ssurface/cot-dialect-olmo3-7b-think-grpo-base-seed3-l4

## Resumen

`cot-dialect-olmo3-7b-think-grpo-base-seed3-l4` es un adaptador LoRA publicado por ssurface que modifica el comportamiento de razonamiento de `allenai/Olmo-3-7B-Think` para operar en un nivel de compresion de cadena de pensamiento denominado L4 (asignaciones encadenadas con punto y coma). Se trata de una ablation experimental, no de uno de los modelos principales de la familia: fue entrenada con una variante de recompensa distinta para permitir que la comparacion de diseno de reward del articulo pueda reproducirse de forma independiente.

El adaptador se entrena mediante GRPO sobre el modelo SFT fusionado del nivel L4, utilizando el conjunto GSM8K reexpresado por un modelo profesor. La cadena de pensamiento mediana en este nivel tiene 41 caracteres dentro de la etiqueta `thinking`, frente a los 532 caracteres del nivel L1 (un rango de 33x en toda la familia). El resultado declarado es un 69,2 % de precision exacta en GSM8K test con decodificacion greedy.

Es importante destacar que este adaptador no se carga directamente sobre el modelo base: requiere primero aplicar el adaptador SFT del nivel L4 (`ssurface/cot-dialect-olmo3-7b-think-sft-l4`), fusionarlo, y despues aplicar este adaptador GRPO encima. Cargarlo directamente sobre `allenai/Olmo-3-7B-Think` no reproduce el resultado publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (r=16, alpha=32) sobre Olmo-3-7B-Think (Transformer causal, 7B parametros) |
| Parametros totales | ~7B (modelo base) + adaptador LoRA (~0,2 GB en safetensors) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena con `trl.GRPOTrainer` sobre `transformers` estandar con atencion `sdpa`, partiendo del modelo SFT fusionado del nivel L4 (`merged_olmo/l4`). El conjunto de entrenamiento consta de 6976 ejemplos de GSM8K train reexpresados a nivel L4 por un modelo profesor, con una longitud mediana de cadena de 41 caracteres dentro de `thinking`. Un ejemplo de cadena L4 es:

```
K=18*2.5;D=8*4;T=K+D->T=77
```

El esquema de recompensa combina dos componentes: `correctness`, que pondera segun el numero de pasos de la solucion dorada (los problemas mas dificiles valen mas), y `format`, que exige exactamente un bloque `thinking... response` seguido de `#### <answer>`. Se utiliza loss de tipo `dapo`, 8 generaciones por prompt, batch 32 con acumulacion x2, max completion de 256 tokens, learning rate 1e-05 y coeficiente KL de 0,0. El entrenamiento se realizo en una unica NVIDIA A100 80GB.

Una nota tecnica relevante: el autor verifico que todos los adaptadores publicados tienen `lora_B != 0`, ya que el camino con kernels fusionados producia matrices `lora_B` completamente a cero (matematicamente inertes aunque cargaban sin error). Trece adaptadores que fallaron esa comprobacion fueron retenidos.

## Capacidades

- Razonamiento matematico en ingles sobre problemas de palabra (word problems) del estilo GSM8K.
- Generacion de cadenas de pensamiento comprimidas en nivel L4, con asignaciones encadenadas mediante punto y coma en lugar de razonamiento verbal extenso.
- Formato de salida estructurado: un bloque `thinking... response` seguido de `#### <answer>`.
- Compatible con el ecosistema PEFT: carga mediante `PeftModel` y fusion con `merge_and_unload()`.
- No soporta tool calling, vision, audio ni capacidades multilingues (entrenado y evaluado solo en ingles).

## Casos de uso

- Investigacion en compresion de cadenas de pensamiento: este adaptador permite estudiar como afecta el diseno de la funcion de recompensa (correctness + format) al rendimiento en un nivel de compresion fijo, comparandolo con el modelo principal `cot-dialect-olmo3-7b-think-grpo-l4`.
- Reproduccion de experimentos de RL (GRPO/DPO): al ser una ablation publicada con configuracion completa documentada, sirve como punto de referencia para rerun de experimentos de diseno de reward en razonamiento comprimido.
- Evaluacion del equilibrio entre compresion y precision: con una cadena mediana de 41 caracteres frente a 532 en L1, permite medir la perdida de rendimiento asociada a la compresion extrema del razonamiento.
- Generacion de razonamiento de bajo coste en latencia: las cadenas cortas reducen el numero de tokens generados por consulta, lo que disminuye la latencia y el coste de inferencia en aplicaciones de matematicas simples.
- Benchmark de robustez de adaptadores LoRA: la verificacion de `lora_B != 0` y la documentacion del fallo con kernels fusionados proporcionan un caso de estudio util para equipos que trabajan con PEFT en produccion.
- Experimentos de destilacion de razonamiento: el patron de compresion L4 puede servir como formato objetivo para destilar modelos mas pequenos que emitan razonamiento abreviado en lugar de cadenas verbosas.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card:

| Tarea | Dataset | Split | Metrica | Valor |
|---|---|---|---|---|
| Razonamiento matematico | GSM8K | test | Accuracy (exact match) | 69,2 % |

Condiciones de evaluacion: n=1317, decodificacion greedy, single-turn, sin ejemplos (exemplars) y sin self-consistency. No se han publicado resultados para otros benchmarks (MMLU, HumanEval, etc.) en la informacion disponible.

## Requisitos de hardware

- Inferencia: al ser un adaptador LoRA sobre un modelo de 7B, en bf16 requiere aproximadamente 14-16 GB de VRAM para el modelo base mas el adaptador fusionado. Con cuantizacion (p. ej. 4 bits), puede ejecutarse en GPUs consumer de 8-12 GB (RTX 3080/4070 o superiores).
- Entrenamiento: el autor utilizo 1x NVIDIA A100 80GB con batch 32 y acumulacion x2.
- Opciones de despliegue: al usar `transformers` + PEFT, es compatible con cualquier framework que soporte la carga de adaptadores LoRA (vLLM con soporte de LoRA, TGI, etc.). Tambien puede fusionarse con `merge_and_unload()` y exportarse a GGUF para su uso con llama.cpp u Ollama.
- Latencia: no se han publicado mediciones de latencia o throughput en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Tipo | GSM8K (test) | Licencia | Notas |
|---|---|---|---|---|
| `cot-dialect-olmo3-7b-think-grpo-base-seed3-l4` (este) | LoRA sobre Olmo-3-7B-Think, nivel L4, reward base-seed3 | 69,2 % | Apache 2.0 | Ablation para comparar diseno de reward |
| `cot-dialect-olmo3-7b-think-grpo-l4` | LoRA sobre Olmo-3-7B-Think, nivel L4, reward principal | No disponible | Apache 2.0 | Modelo principal del nivel L4 |
| `allenai/Olmo-3-7B-Think` | Modelo base 7B con razonamiento | No disponible | Apache 2.0 | Modelo base sin compresion de CoT |

No se dispone de datos de benchmarks para los modelos comparables en la informacion proporcionada, por lo que no es posible una comparacion cuantitativa directa.

## Limitaciones y advertencias

- Entrenado y evaluado exclusivamente en problemas de matematicas de palabra en ingles (GSM8K); no es adecuado para otras tareas sin fine-tuning adicional.
- La precision cae con la dificultad del problema, y la caida es mas pronunciada en los niveles comprimidos.
- Es una ablation de un solo seed: diferencias de un par de puntos porcentuales estan dentro del ruido estadistico (95 % half-width ~2,7 pp con n=1317).
- Al ser un artefacto de ablation, puede ser peor que el modelo principal del mismo nivel (`cot-dialect-olmo3-7b-think-grpo-l4`).
- Requiere cargar primero el adaptador SFT del nivel L4 (`ssurface/cot-dialect-olmo3-7b-think-sft-l4`) y fusionarlo; cargarlo directamente sobre el modelo base no reproduce el resultado publicado.
- El prompt de uso requiere el prefijo exacto "Solve this using Level 4 (Shorthand). Problem: {tu problema}".
- Riesgo de alucinacion en problemas fuera de la distribucion de entrenamiento, especialmente en los niveles de compresion alta donde el razonamiento intermedio es minimo.
- Sin soporte multilingue: solo ingles.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ssurface/cot-dialect-olmo3-7b-think-grpo-base-seed3-l4
- Modelo base: https://huggingface.co/allenai/Olmo-3-7B-Think
- Adaptador SFT requerido (nivel L4): https://huggingface.co/ssurface/cot-dialect-olmo3-7b-think-sft-l4
- Modelo principal del nivel L4: https://huggingface.co/ssurface/cot-dialect-olmo3-7b-think-grpo-l4
- GGUF del modelo base: https://huggingface.co/unsloth/Olmo-3-7B-Think-GGUF
- Ficha del modelo base en LM Studio: https://lmstudio.ai/models/allenai/olmo-3-7b-think
- Referencia citada en la model card: Frolov, Anatolii, "Chain-of-Thought Compression Dialects" (2026), disponible via la citation bibtex de la model card.
