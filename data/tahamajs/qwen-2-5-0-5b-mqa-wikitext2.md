# tahamajs/qwen-2.5-0.5b-mqa-wikitext2

## Resumen

`tahamajs/qwen-2.5-0.5b-mqa-wikitext2` es un checkpoint experimental derivado de `Qwen/Qwen2.5-0.5B` en el que se han sustituido quirurgicamente los bloques de atencion del decodificador por una implementacion de Multi-Query Attention (MQA) del registro `ATTENTION_REGISTRY` del proyecto NeuralOps. No es un modelo entrenado desde cero: es un ejercicio de "cirugia de atencion" mas destilacion de conocimiento para recuperar la calidad perdida tras el reemplazo arquitectonico.

La motivacion es tecnica: MQA reduce el KV-cache en un factor igual al numero de cabezas de query (en este caso 12x) y acelera la inferencia al disminuir las lecturas de memoria, a costa de una caida de calidad que aqui se intenta compensar mediante dos etapas de knowledge distillation sobre WikiText-2. El resultado es un modelo de 0,5B parametros con 18 de sus 24 capas convertidas a MQA y 6 capas cuadraticas completas conservadas como anclas.

Es relevante como pieza de investigacion reproducible sobre atención subcuadratica y destilación post-sutura, no como modelo listo para produccion: la perplejidad final en WikiText-2 (205,89) es muy superior a la del modelo base, y el repositorio solo contiene los pesos de atencion, no el checkpoint completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con atencion hibrida: MQA en 18/24 capas, atencion cuadratica completa en 6/24 |
| Parametros totales | 0,5B (heredados de Qwen2.5-0.5B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Qwen2.5-0.5B soporta contexto largo, pero el autor no lo declara para este checkpoint) |
| Tipos de cuantizacion | No disponible (solo se distribuyen pesos de atencion en safetensors FP16/FP32; no hay GGUF ni cuantizaciones publicadas) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | `safetensors` (`attention_weights.safetensors`, 82,27 MB) mas `config.json` y `tokenizer.json` |
| Libreria | `neuralops` |
| Patron de sutura | `hybrid_3_1` (3:1 intercalado) |
| Cabezas | 14 query heads, 2 KV heads en el base; MQA con 1 sola KV head compartida |
| Hidden size / head_dim | 896 / 64 |
| Capas ancla (cuadraticas) | Indices `[3, 7, 11, 15, 19, 23]` |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B (transformer decoder-only denso, hidden size 896, 14 cabezas de query, 2 cabezas KV, head_dim 64, 24 capas) y aplica un `QwenAttentionAdapter` que reemplaza la atencion GQA original por `MultiQueryAttention` (Shazeer 2019): una unica cabeza KV compartida por las 14 cabezas de query, con soporte nativo de RoPE, causal masking, bidireccional y cross-attention. El patron es `hybrid_3_1`: de cada cuatro capas, tres se transplantan a MQA y una se mantiene como ancla cuadratica completa para estabilizar la representacion. El adapter gestiona la expansion 14:2 de cabezas KV y fuerza el contrato de `o_proj` unico.

El entrenamiento es una destilacion de conocimiento en dos etapas sobre WikiText-2 (`wikitext-2-raw-v1`). La etapa 1 (alineamiento con backbone congelado) ejecuta 157 pasos en 54,3 s con `lm_head` desactivado y MSE/coseno sobre estados ocultos por capa a peso 0,25. La etapa 2 (destilacion multi-capa de representaciones) ejecuta 360 pasos en 125,8 s con el mismo objetivo a peso 0,50. En total, 517 pasos, 180,3 s, `seq_len=512`, `grad_accum=4`, `topk=64`, con autocast FP16 y parametros maestro en FP32, consumiendo 12.234 MB de VRAM en pico. La perplejidad causal pasa de 541.890,55 antes de la KD a 205,89 tras ella.

## Capacidades

- Generacion de texto autoregresiva causal en ingles (heredada del base Qwen2.5-0.5B).
- Soporte declarado de atencion causal, bidireccional y cross-attention en el modulo MQA subyacente.
- Soporte de RoPE en las capas transplantadas.
- Capacidad de razonamiento y codigo: no evaluada ni documentada para este checkpoint; se asume degradada respecto al base.
- Tool calling / function calling: no disponible (no se documenta; el base lo soporta, pero este checkpoint no se ha validado para ello).
- Agentes y razonamiento multi-paso: no disponible.
- Multilingue: limitado a ingles segun la model card.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Investigacion en atencion subcuadratica: usar el checkpoint como punto de partida para medir el impacto real de MQA en perplejidad y velocidad frente a GQA, con la topologia `hybrid_3_1` ya preparada.
- Reproducibilidad de destilacion post-sutura: replicar las dos etapas de KD (157 + 360 pasos, ~180 s) en una unica GPU y comparar deltas de perplejidad con otras variantes del Attention Zoo.
- Benchmarking de KV-cache: cuantificar la reduccion de memoria del KV-cache (factor 12x en las capas MQA) en escenarios de generacion larga, usando las 6 capas ancla como control.
- Prototipado de inferencia en hardware limitado: el modelo completo ocupa 0,1 GB y el checkpoint de atencion 82,27 MB, lo que permite iterar en GPUs de consumo con poca VRAM (12,2 GB en pico durante el entrenamiento, mucho menos en inferencia).
- Estudio de la relacion calidad-eficiencia: comparar la curva perplejidad frente a ahorro de memoria entre distintas topologias (`hybrid_3_1`, MQA pura, GQA) usando la misma receta de KD.
- Docencia y divulgacion: ejemplo autocontenido de como transplantar un modulo de atencion y recuperar rendimiento con destilacion, con telemetria completa (pasos, tiempos, VRAM, PPL) incluida en la model card.
- No recomendado como modelo de produccion para atencion al cliente, generacion de codigo, agentes ni tareas multilingues: la perplejidad de 205,89 en WikiText-2 lo situa muy por debajo de la calidad del base.

## Benchmarks y rendimiento

Datos declarados por el autor en el `model-index` y en la telemetria de la model card:

| Metrica | Valor |
|---|---|
| WikiText-2 validation perplexity (final) | 205,89 |
| WikiText-2 perplexity pre-KD (Stage 0, post-sutura) | 541.890,55 |
| Delta de perplejidad | -541.684,67 |
| Pasos Stage 1 (frozen-backbone) | 157 (54,3 s) |
| Pasos Stage 2 (multi-layer KD) | 360 (125,8 s) |
| Pasos totales / tiempo total | 517 / 180,3 s |
| VRAM pico en entrenamiento | 12.234 MB |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. La perplejidad de 205,89 no es directamente comparable con la del base Qwen2.5-0.5B sin ejecutar la misma evaluacion, que el autor no reporta.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. El checkpoint de atencion pesa 82,27 MB y el repo completo 0,1 GB; el modelo base de 0,5B en FP16 requiere aproximadamente 1 GB de pesos mas KV-cache (que en las capas MQA se reduce 12x). Estas cifras son estimaciones a partir del tamano, no datos publicados por el autor.
- VRAM pico documentada: 12.234 MB durante el entrenamiento (autocast FP16, maestro FP32, `seq_len=512`, `grad_accum=4`).
- GPU recomendadas: no especificadas por el autor. Cualquier GPU consumer con al menos la VRAM indicada para entrenamiento o inferencia del base deberia bastar; el entrenamiento reportado cabe en una GPU de 16 GB.
- Cabe en GPU consumer: si, dado el tamano de 0,5B; no se han publicado pruebas en RTX 4090, RTX 3090 u otras.
- Opciones de despliegue: el flujo documentado es `transformers` + `safetensors` + `neuralops` (`apply_qwen_attention_surgery`). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI; tampoco se publican pesos GGUF.
- Latencia y throughput: no disponibles. La motivacion de MQA es reducir lecturas de memoria y acelerar inferencia, pero el autor no publica mediciones de tokens/s.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Atencion | Licencia | Perplejidad WikiText-2 | Disponibilidad |
|---|---|---|---|---|---|---|
| `tahamajs/qwen-2.5-0.5b-mqa-wikitext2` | 0,5B | no disponible | MQA hibrida 3:1 (18/24 capas) | MIT | 205,89 (declarada) | HF, solo pesos de atencion |
| `Qwen/Qwen2.5-0.5B` (base) | 0,5B | no disponible en esta ficha | GQA (14 Q, 2 KV) | Apache 2.0 (segun el base; verificar) | no reportada por el autor | HF, checkpoint completo |
| Qwen2.5-1.5B | 1,5B | no disponible en esta ficha | GQA | Apache 2.0 (segun el base; verificar) | no disponible | HF |

No se dispone de datos de benchmarks comparativos publicados por el autor entre este checkpoint y el base. La comparativa se limita a parametros, atencion y licencia.

## Limitaciones y advertencias

- La perplejidad de 205,89 en WikiText-2 indica una calidad de lenguaje muy degradada respecto al base; no es un modelo apto para produccion sin una evaluacion exhaustiva.
- El repositorio contiene solo los pesos de atencion (`attention_weights.safetensors`); es necesario descargar `Qwen/Qwen2.5-0.5B` y aplicar la sutura con `neuralops` para obtener un modelo funcional. No es un checkpoint autocontenido.
- Requiere la libreria `neuralops` y el script `scripts/benchmarks/qwen_zoo_train_mix.py`, que no forman parte del ecosistema estandar de `transformers`.
- Entrenado exclusivamente sobre WikiText-2 en ingles; no se ha validado en otros dominios ni idiomas. El sesgo y las alucinaciones no estan medidos.
- Solo se declara soporte de ingles en la model card.
- La licencia es MIT, lo que permite uso comercial, pero el modelo base Qwen2.5-0.5B tiene su propia licencia que debe verificarse por separado.
- El autor no reporta evaluaciones de sesgo, seguridad, tool calling ni agentes.
- El modelo no ha sido verificado por un tercero (`verified: false` en el model-index); todos los numeros proceden del autor.
- Creado y actualizado el 10 de noviembre de 2026 segun los metadatos; sin descargas ni likes en el momento de la consulta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-mqa-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
