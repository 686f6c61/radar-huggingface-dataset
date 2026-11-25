# tahamajs/qwen-2.5-0.5b-minimal-svd-wikitext2

## Resumen

`tahamajs/qwen-2.5-0.5b-minimal-svd-wikitext2` es un checkpoint experimental derivado de `Qwen/Qwen2.5-0.5B` en el que se han sustituido quirúrgicamente los bloques de atencion del decodificador por el modulo `minimal_svd` (MinimalSVD: atencion con proyeccion de bajo rango factorizada via SVD) del registro `ATTENTION_REGISTRY` del framework NeuralOps. El objetivo no es obtener un modelo de proposito general, sino servir como banco de pruebas reproducible para estudiar atencion subcuadratica y destilacion de conocimiento sobre arquitecturas transformer ya entrenadas.

El autor es `tahamajs`, desarrollador del proyecto NeuralOps, y el entrenamiento se ha realizado exclusivamente sobre WikiText-2 (`Salesforce/wikitext`, split `wikitext-2-raw-v1`), con un proceso de destilacion en dos etapas que reduce la perplejidad de validacion desde 510683,39 (baseline cero-shot tras la cirugia) hasta 242,01. Se trata, por tanto, de un artefacto de investigacion: la perplejidad final es muy superior a la del modelo base original, lo que refleja el coste de reemplazar la atencion cuadratica nativa sin un reentrenamiento completo.

El interes actual reside en su valor metodologico: documenta con telemetria detallada (pasos, tiempos, VRAM pico, deltas de perplejidad) como transplantar un operador de atencion alternativo en un LLM pequeno y recuperar parte de la capacidad mediante KD por capas, un procedimiento relevante para quienes investigan eficiencia en atencion y modularidad arquitectonica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con atencion hibrida: 18/24 capas con `MinimalSVDAttention` y 6/24 capas con atencion cuadratica completa (indices 3, 7, 11, 15, 19, 23); patron `hybrid_3_1` |
| Parametros totales | no disponible (modelo base Qwen2.5-0.5B, ~0,5 mil millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen2.5-0.5B, sin confirmar en la model card) |
| Tipos de cuantizacion | no disponible (pesos publicados en FP16; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors` 917,45 MB; `attention_weights.safetensors` 59,24 MB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B, un transformer decoder-only con 24 capas, `hidden_size=896`, 14 cabezas de consulta y 2 cabezas KV (GQA, `head_dim=64`). Sobre esa base se aplica una "cirugia" que reemplaza las proyecciones de atencion en 18 de las 24 capas mediante `QwenAttentionAdapter`, que mapea las proyecciones originales al modulo `MinimalSVDAttention` con expansion automatica 7x de cabezas KV y un contrato de unica `o_proj`. Las 6 capas restantes conservan atencion cuadratica completa como anclas, dando lugar al patron intercalado `hybrid_3_1`. El modulo `MinimalSVDAttention` soporta atencion causal, bidireccional, cross-attention y GQA nativo, y no declara soporte RoPE explicito (`supports_rope: N/A`), un detalle relevante a la hora de evaluar su comportamiento posicional.

El entrenamiento consiste en una destilacion de conocimiento en dos etapas sobre WikiText-2: una primera etapa de alineacion con backbone congelado (130 pasos, 54,4 s) usando MSE y coseno sobre estados ocultos por capa con peso 0,25 y `lm_head` desactivado, y una segunda etapa de KD multi-capa (298 pasos, 125,8 s) con peso 0,50. En total, 428 pasos de optimizacion en 180,5 s con `seq_len=512`, `grad_accum=4` y `topk=64`, alcanzando un pico de VRAM de 15507 MB en FP16 autocast con parametros maestros FP32. La perplejidad causal pasa de 510683,39 antes de la KD a 242,01 tras ella.

## Capacidades

- Generacion de texto autoregresiva causal en ingles, heredada de Qwen2.5-0.5B, aunque degradada por el transplante de atencion.
- Atencion causal, bidireccional y cross-attention soportadas por el modulo `minimal_svd` a nivel de operador.
- Soporte nativo de GQA en el modulo de atencion transplantado.
- Razonamiento, codigo y matematicas: capacidades del modelo base fuertemente mermadas; no se documentan evaluaciones especificas.
- Tool calling / function calling: no documentado; no se garantiza en este checkpoint.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Capacidades especiales: ninguna declarada (sin thinking mode, vision ni audio).

## Casos de uso

- Investigacion en atencion subcuadratica: banco de pruebas reproducible para medir el impacto de sustituir atencion cuadratica por `MinimalSVDAttention` en un LLM pequeno, comparando perplejidad antes y despues de la KD.
- Estudio de destilacion de conocimiento por capas: la telemetria publicada (pasos, tiempos, VRAM, delta de perplejidad) permite reproducir y variar el esquema de KD (pesos de MSE/coseno, congelacion de backbone).
- Desarrollo y validacion de frameworks de modularidad: util para probar el registro `ATTENTION_REGISTRY` de NeuralOps y el contrato `QwenAttentionAdapter` en pipelines propios.
- Experimentos de atencion hibrida: el patron `hybrid_3_1` con 6 capas cuadraticas ancla sirve para estudiar el equilibrio entre eficiencia y calidad en modelos pequenos.
- Docencia y formacion tecnica: ejemplo didactico de cirugia arquitectonica sobre un modelo open source con licencia permisiva.
- Pruebas de integracion del Hub API de NeuralOps: el snippet `load_surgeried_model` permite verificar la carga end-to-end de checkpoints con pesos quirurgicos.
- Baseline negativo controlado: util como referencia de lo que ocurre cuando se reemplaza atencion sin reentrenamiento completo, para calibrar expectativas en proyectos de eficiencia.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados de forma independiente, `verified: false`):

| Benchmark | Metrica | Valor |
|---|---|---|
| WikiText-2 (`wikitext-2-raw-v1`, validation) | Perplejidad causal | 242,01 |
| WikiText-2 (baseline cero-shot post-cirugia, Stage 0) | Perplejidad causal | 510683,39 |
| Delta de perplejidad tras KD | Reduccion | -510441,38 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el entrenamiento uso 15507 MB en FP16 autocast con parametros maestros FP32; en inferencia pura en FP16 el modelo (~0,5 B parametros, ~977 MB de pesos) deberia caber en torno a 2-3 GB de VRAM, aunque no se documenta una cifra oficial.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 12 GB, RTX 4070, RTX 4090) es suficiente por VRAM; para entrenamiento o KD se recomienda al menos 16 GB (A100, H100, RTX 4090).
- Cabe en GPU consumer: si, previsiblemente en GTX 1660 6 GB, RTX 3050 8 GB, RTX 4060 8 GB y superiores.
- Opciones de despliegue: la model card documenta carga via `transformers` (con `apply_qwen_attention_surgery`) y via `neuralops.hub.load_surgeried_model`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y la ausencia de pesos GGUF publicados limita el despliegue en esos runtimes.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/qwen-2.5-0.5b-minimal-svd-wikitext2` | ~0,5 B | no disponible | 242,01 (validation) | MIT | Hugging Face |
| `Qwen/Qwen2.5-0.5B` (base) | ~0,5 B | 32768 tokens (segun Qwen2.5) | no disponible en la informacion | Apache 2.0 | Hugging Face |
| `Qwen/Qwen2.5-0.5B-Instruct` | ~0,5 B | 32768 tokens (segun Qwen2.5) | no disponible en la informacion | Apache 2.0 | Hugging Face |

La comparativa directa de perplejidad no es posible porque la informacion proporcionada no incluye la PPL del modelo base en WikiText-2; el dato de 242,01 debe interpretarse como referencia interna del proceso de KD, no como comparacion con el estado del arte.

## Limitaciones y advertencias

- Perplejidad muy elevada (242,01) frente a lo esperable en un modelo de 0,5 B entrenado de forma nativa; la calidad de generacion sera notablemente inferior a la del Qwen2.5-0.5B original.
- Entrenado exclusivamente sobre WikiText-2, un corpus pequeno y de dominio enciclopedico; el modelo no esta alineado para instrucciones ni conversacion pese a los tags `conversational`.
- Riesgo alto de alucinacion y de generar texto incoherente fuera de dominios cercanos al corpus de entrenamiento.
- Limitacion idiomatica: solo ingles declarado.
- No hay datos publicados sobre contexto maximo efectivo tras el transplante; el modulo `minimal_svd` no declara soporte RoPE, lo que puede afectar a la extrapolacion posicional.
- No se documentan evaluaciones de sesgo; al derivar de Qwen2.5-0.5B, hereda los sesgos del corpus original sin mitigacion adicional.
- Licencia MIT permisiva para uso comercial, pero el modelo base Qwen2.5-0.5B tiene licencia Apache 2.0; conviene verificar la compatibilidad y las obligaciones de atribucion al redistribuir.
- No apto para produccion en tareas de usuario final: es un artefacto de investigacion sin validacion independiente (`verified: false` en el model-index).
- Requiere el framework NeuralOps o el codigo de cirugia para cargar correctamente los pesos transplantados; no es plug-and-play con `transformers` estandar sin ese paso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-minimal-svd-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
