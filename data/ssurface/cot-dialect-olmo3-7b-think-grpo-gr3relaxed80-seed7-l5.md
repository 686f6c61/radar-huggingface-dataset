# ssurface/cot-dialect-olmo3-7b-think-grpo-gr3relaxed80-seed7-l5

## Resumen

`cot-dialect-olmo3-7b-think-grpo-gr3relaxed80-seed7-l5` es un adapter LoRA publicado por ssurface (Anatolii Frolov) que modifica el comportamiento de razonamiento de `allenai/Olmo-3-7B-Think` para operar en el nivel de compresion L5 de chain-of-thought: una unica expresion colapsada en lugar de cadenas de razonamiento extensas. Se trata de un modelo de ablation, no de un modelo principal: fue entrenado con una variante de recompensa (`gr3relaxed80`, seed 7) para permitir que la comparacion de diseno de recompensas del paper "Chain-of-Thought Compression Dialects" pueda reproducirse de forma independiente.

El adapter se entrena con GRPO sobre el dataset GSM8K re-expresado a nivel L5 por un modelo profesor, con cadenas de razonamiento de una mediana de 16 caracteres. Sobre el conjunto de test de GSM8K (n=1317, decoding greedy, single-turn) alcanza un 71.6% de accuracy exact match. El modelo base, Olmo-3-7B-Think, pertenece a la familia Olmo 3 de Ai2 (7B y 32B), pre-entrenada sobre Dolma 3 y post-entrenada sobre los datasets Dolci, con variantes Base, Instruct y Think orientadas a razonamiento largo.

El adapter no es autocontenido: debe apilarse sobre el modelo SFT del mismo nivel (`ssurface/cot-dialect-olmo3-7b-think-sft-l5`) y despues sobre el modelo base. Es un artefacto de investigacion para estudios de compresion de razonamiento y diseno de recompensas, no un modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA adapter (r=16, alpha=32) sobre Olmo-3-7B-Think (transformer decoder-only) |
| Parametros totales | 7B (modelo base) + adapter LoRA (conteo exacto no especificado; repo de 0.2 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible para el adapter; hereda la del modelo base |
| Tipos de cuantizacion | no especificados (carga en bfloat16 segun ejemplo de uso) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (peft/LoRA) |

## Arquitectura y entrenamiento

El adapter es un LoRA con r=16 y alpha=32, entrenado con GRPO mediante `trl.GRPOTrainer` sobre `transformers` estandar con atencion `sdpa`. Se apila sobre el modelo SFT fusionado del nivel L5 (`merged_olmo/l5`), no sobre el base crudo. Los datos de entrenamiento son 6993 ejemplos de GSM8K train re-expresados a nivel L5 por un modelo profesor, con una mediana de 16 caracteres de cadena de razonamiento dentro de las etiquetas `thinking`. La familia completa abarca desde 532 caracteres (L1) hasta 16 (L5), un rango de 33x.

La funcion de recompensa combina cuatro componentes: `correctness` (ponderada por el numero de pasos de la solucion de referencia, de modo que los problemas mas dificiles valen mas), `format` (exige un unico bloque `thinking... response` seguido de `#### <respuesta>`), `chain` (un verificador que comprueba que la aritmetica escrita en la cadena es correcta) y `gr3` (reescalado multiplicativo por longitud de las recompensas positivas, con suelo en 0.3). Los hiperparametros principales: 8 generaciones por prompt, batch 32 x 2 acumulaciones, max completion de 256 tokens, learning rate 1e-05 y coeficiente KL (beta) de 0.01. El entrenamiento se realizo en una unica NVIDIA A100 80GB.

Un detalle tecnico relevante: el autor verifico que las matrices `lora_B` de todos los adapters publicados son no nulas, descartando 13 que no superaron la comprobacion. La ruta con kernels fusionados producia adapters con `lora_B` a cero (matematicamente inertes), por lo que se uso `transformers` estandar con atencion `sdpa`.

## Capacidades

- Razonamiento matematico sobre problemas de palabras del estilo GSM8K, con salida en formato de un unico bloque `thinking... response` seguido de `#### <respuesta>`.
- Compresion extrema de chain-of-thought a nivel L5: produce expresiones colapsadas como `18/3*2=12` en lugar de cadenas verbosas.
- Resolucion single-turn con decoding greedy, sin ejemplos (few-shot) ni self-consistency.
- Requiere el prompt especifico: `Solve this using Level 5 (Extreme). Problem: {problema}`.
- No dispone de tool calling, vision, audio ni capacidades de agente multi-paso.
- Solo soporta ingles.

## Casos de uso

- Reproduccion de resultados del paper "Chain-of-Thought Compression Dialects": el modelo se publico explicitamente para que la comparacion de diseno de recompensas (gr3 relajado vs. estandar) pueda re-ejecutarse sin depender de la palabra del autor.
- Estudio del impacto de la compresion de razonamiento en la precision: al comparar este adapter con los de niveles L1-L4 de la misma familia, se puede medir como degrada la exactitud al reducir la cadena de 532 a 16 caracteres.
- Ablacion de componentes de recompensa en GRPO: permite aislar el efecto del termino `gr3` (reescalado por longitud con suelo 0.3) sobre la calidad del razonamiento comprimido.
- Investigacion sobre eficiencia de inferencia en razonamiento: cadenas de 16 caracteres reducen drasticamente el numero de tokens generados por problema, lo que abarata el coste por consulta en escenarios de alto volumen.
- Benchmark de razonamiento matematico comprimido: sirve como punto de referencia para otros intentos de compresion de CoT en modelos de 7B.
- Validacion de pipelines de entrenamiento con LoRA y GRPO: el caso documentado de matrices `lora_B` nulas con kernels fusionados es un aviso util para equipos que entrenen adapters similares.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card:

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Mathematical Reasoning | GSM8K (test, n=1317) | Accuracy (exact match) | 71.6% |

Condiciones de evaluacion: decoding greedy, single-turn, sin ejemplos, sin self-consistency. No se han publicado resultados en otros benchmarks (MMLU, HumanEval, etc.) en la informacion disponible. El autor indica que la precision cae con la dificultad del problema, de forma mas acusada en los niveles comprimidos, y que al ser una unica semilla, diferencias de un par de puntos estan dentro del ruido (semi-anchura del 95% de ~2.7 puntos porcentuales en n=1317).

## Requisitos de hardware

- Inferencia: el modelo base de 7B en bfloat16 requiere aproximadamente 14-16 GB de VRAM; el adapter anade un coste despreciable (~0.2 GB). Con cuantizacion (por ejemplo, 4-bit) puede caber en GPUs de consumo como RTX 3090 o RTX 4090 (24 GB).
- Entrenamiento: se realizo en una unica NVIDIA A100 80GB, con batch 32 x 2 acumulaciones y 8 generaciones por prompt.
- Despliegue: el flujo recomendado es cargar el modelo base con `transformers`, aplicar el adapter SFT (`ssurface/cot-dialect-olmo3-7b-think-sft-l5`), fusionar, y despues aplicar este adapter GRPO. Tras fusionar, los pesos pueden exportarse para su uso con vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles. La compresion L5 reduce el numero de tokens generados por problema (cadenas de ~16 caracteres), lo que mejora la latencia por consulta frente a modelos con CoT verboso, aunque no se han publicado mediciones concretas.

## Comparativa con modelos similares

| Modelo | Tamano | Contexto | GSM8K (test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adapter (L5, gr3relaxed80) | 7B + LoRA | no disponible | 71.6% | Apache-2.0 | HuggingFace |
| `allenai/Olmo-3-7B-Think` (base) | 7B | no disponible | no disponible | Apache-2.0 | HuggingFace |
| `ssurface/cot-dialect-olmo3-7b-think-grpo-l5` (modelo principal L5) | 7B + LoRA | no disponible | no disponible | Apache-2.0 | HuggingFace |

No se dispone de resultados de GSM8K para el modelo base ni para el modelo principal del mismo nivel en la informacion proporcionada. El autor advierte explicitamente de que este adapter de ablation puede ser peor que el modelo principal del mismo nivel, ya que fue entrenado para responder una pregunta concreta sobre diseno de recompensas. No se han encontrado datos de otros modelos comparables de compresion de CoT en la informacion disponible.

## Limitaciones y advertencias

- Entrenado y evaluado exclusivamente sobre problemas de matematicas de palabras (GSM8K); no hay evidencia de generalizacion a otras tareas.
- La precision cae con la dificultad del problema, de forma mas rapida en los niveles comprimidos como L5.
- Artefacto de ablation: puede ser peor que el modelo principal del mismo nivel (`ssurface/cot-dialect-olmo3-7b-think-grpo-l5`).
- Unica semilla (seed 7); diferencias de un par de puntos porcentuales estan dentro del ruido estadistico.
- Requiere apilarse sobre el modelo SFT del nivel L5 (`ssurface/cot-dialect-olmo3-7b-think-sft-l5`); cargarlo directamente sobre `allenai/Olmo-3-7B-Think` no reproduce la cifra publicada.
- Solo soporta ingles.
- La compresion extrema de CoT puede producir cadenas de razonamiento opacas o dificiles de auditar, lo que limita su uso en entornos que requieran trazabilidad del razonamiento.
- No se han publicado evaluaciones de sesgos, robustez o seguridad.

## Enlaces

- Repositorio del adapter: https://huggingface.co/ssurface/cot-dialect-olmo3-7b-think-grpo-gr3relaxed80-seed7-l5
- Modelo SFT del nivel L5 (requerido para apilar): https://huggingface.co/ssurface/cot-dialect-olmo3-7b-think-sft-l5
- Modelo base: https://huggingface.co/allenai/Olmo-3-7B-Think
- Paper de Olmo 3: https://arxiv.org/abs/2512.13961
- Pagina oficial de Olmo (Ai2): https://allenai.org/olmo
- Version cuantizada de Olmo-3-7B-Think por unsloth: https://huggingface.co/unsloth/Olmo-3-7B-Think
- Ficha de Olmo-3-7B-Think en LM Studio: https://lmstudio.ai/models/allenai/olmo-3-7b-think
