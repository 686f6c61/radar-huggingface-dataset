# tahamajs/qwen-2.5-0.5b-triton-cosformer-wikitext2

## Resumen

`qwen-2.5-0.5b-triton-cosformer-wikitext2` es un checkpoint experimental publicado por el usuario tahamajs dentro del proyecto NeuralOps "Qwen Attention Zoo". No es un modelo entrenado desde cero, sino un derivado de `Qwen/Qwen2.5-0.5B` en el que se han sustituido quirurgicamente 18 de las 24 capas de atencion del decoder original por un modulo de atencion lineal subcuadratica denominado `TritonCosformerAttention`, implementado en Triton y registrado como `triton_cosformer` en el `ATTENTION_REGISTRY` de NeuralOps.

El objetivo del artefacto es demostrar la viabilidad de la sustitucion de atencion (attention surgery) combinada con destilacion de conocimiento en dos etapas para recuperar calidad tras el trasplante. El modelo parte de una perplejidad de 2349.58 en WikiText-2 inmediatamente despues de la cirugia (sin reentrenamiento) y la reduce a 49.52 mediante 474 pasos de destilacion en aproximadamente 180 segundos sobre una unica GPU.

Es relevante como banco de pruebas reproducible para investigacion en atencion eficiente: el repositorio incluye solo los pesos de atencion (84.16 MB), no el modelo completo, y requiere cargar la base Qwen2.5-0.5B y aplicar el mismo patron de cirugia antes de inyectar los pesos. La licencia es MIT y el idioma declarado es unicamente ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen2) con atencion hibrida: 18/24 capas con `TritonCosformerAttention` (atencion lineal cosformer) y 6/24 capas con atencion cuadratica completa preservadas en los indices [3, 7, 11, 15, 19, 23] |
| Parametros totales | Heredados de Qwen2.5-0.5B (0.5B declarados en el nombre); el repositorio solo distribuye pesos de atencion, no el modelo completo |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos distribuidos en safetensors, presumiblemente FP16/FP32; la model card no lo especifica) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | `safetensors` (`attention_weights.safetensors`, 84.16 MB) mas `config.json` y `tokenizer.json`; requiere la base `Qwen/Qwen2.5-0.5B` por separado |

## Arquitectura y entrenamiento

La arquitectura base es el decoder transformer de Qwen2.5-0.5B (hidden_size 896, 14 cabezas de query, 2 cabezas KV, head_dim 64, GQA). Sobre esa base se aplica un patron de cirugia `hybrid_3_1`: por cada tres capas se sustituye un bloque de atencion por `TritonCosformerAttention`, resultando en 18 capas transplantadas y 6 capas cuadraticas intactas como anclas. El `QwenAttentionAdapter` realiza una expansion 14:2 de las cabezas GQA cuando el modulo lo requiere y respeta el contrato de un unico `o_proj`. El modulo cosformer soporta atencion causal, bidireccional, cross-attention y RoPE, pero no GQA nativo.

El entrenamiento consiste en una destilacion de conocimiento en dos etapas sobre `Salesforce/wikitext` (`wikitext-2-raw-v1`). La etapa 1 (alineacion con backbone congelado) ejecuta 144 pasos en 54.3 s con `lm_head` desactivado y MSE/coseno layerwise con peso 0.25. La etapa 2 (destilacion de representacion multicapa) ejecuta 330 pasos en 125.6 s con peso de coseno 0.50. En total, 474 pasos en 180.1 s con `seq_len=512`, `grad_accum=4` y `topk=64`, alcanzando un pico de VRAM de 11689 MB en FP16 con autocast y parametros maestros en FP32.

## Capacidades

- Generacion de texto causal autorregresiva en ingles, heredada de la base Qwen2.5-0.5B.
- Atencion lineal subcuadratica en 18 de 24 capas, con coste asintotico reducido frente a atencion cuadratica en secuencias largas.
- Soporte de atencion causal, bidireccional y cross-attention a nivel de modulo (segun la tabla de capacidades del modulo).
- Soporte de RoPE en el modulo cosformer.
- No soporta GQA nativo en el modulo transplantado (se resuelve por expansion 14:2 en el adaptador).
- No se declaran capacidades de tool calling, function calling, agentes, vision, audio ni modo thinking; no disponibles en la informacion proporcionada.
- Capacidad multilingue no disponible: solo se declara ingles.

## Casos de uso

- Investigacion en atencion eficiente: servir como referencia reproducible para medir la degradacion y recuperacion de calidad al sustituir atencion cuadratica por cosformer lineal en un modelo pequeno, gracias a la telemetria publicada (PPL pre y post cirugia, pasos, tiempos y VRAM).
- Prototipado de modulos de atencion en Triton: validar nuevas implementaciones de kernels comparando su perplejidad en WikiText-2 contra el valor de referencia 49.52 de este checkpoint.
- Experimentos de destilacion de conocimiento: reutilizar el pipeline de dos etapas (alineacion con backbone congelado y destilacion de representacion multicapa) sobre otros modelos base, ya que el coste total es de 180 s y 11.7 GB de VRAM.
- Benchmarking de inferencia en secuencias largas: evaluar el trade-off entre coste computacional y calidad en un modelo de 0.5B con atencion hibrida 3:1 frente a la version cuadratica completa.
- Educacion y divulgacion tecnica: ilustrar de forma practica que es la sustitucion de atencion y como se mide su impacto con perplejidad en un dataset estandar.
- Pruebas de integracion del ecosistema NeuralOps: verificar la compatibilidad del `QwenAttentionAdapter` y del contrato `single o_proj` en pipelines propios.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados, `verified: false`):

| Benchmark | Metrica | Valor |
|---|---|---|
| WikiText-2 (`wikitext-2-raw-v1`, validation) | Perplejidad | 49.52 |
| WikiText-2 (Stage 0, post-cirugia sin KD) | Perplejidad | 2349.58 |
| Delta de perplejidad tras KD | Diferencia | -2300.06 |

Telemetria de entrenamiento:

| Etapa | Pasos | Tiempo |
|---|---|---|
| Stage 1 (alineacion, backbone congelado) | 144 | 54.3 s |
| Stage 2 (destilacion multicapa) | 330 | 125.6 s |
| Total | 474 | 180.1 s |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia: no disponible de forma explicita; el pico durante el entrenamiento fue de 11689 MB en FP16 con parametros maestros FP32. La inferencia en FP16 de un modelo de 0.5B deberia caber holgadamente en GPUs consumer, pero no se aporta una cifra medida.
- GPU recomendadas: no disponibles en la informacion proporcionada. El entrenamiento se realizo en una unica GPU con ~11.7 GB de VRAM pico.
- Compatibilidad con GPU consumer: previsiblemente si para GPUs con 8 GB o mas en FP16, aunque no confirmado por el autor.
- Opciones de despliegue: el flujo documentado usa `transformers` + `safetensors` + `huggingface_hub` y la funcion `apply_qwen_attention_surgery` del repositorio NeuralOps. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; el modulo Triton personalizado probablemente requiera integracion especifica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Atencion | Licencia | Notas |
|---|---|---|---|---|---|
| `tahamajs/qwen-2.5-0.5b-triton-cosformer-wikitext2` | 0.5B (base) | No disponible | Hibrida 3:1 (cosformer lineal + cuadratica) | MIT | Checkpoint experimental, solo pesos de atencion, PPL WikiText-2 49.52 |
| `Qwen/Qwen2.5-0.5B` | 0.5B | 32768 tokens (segun la base Qwen2.5) | Cuadratica completa con GQA | Apache 2.0 (base Qwen) | Modelo base original; perplejidad WikiText-2 del checkpoint derivado no comparable directamente |
| Alternativas de atencion lineal (p. ej. variantes Mamba, RWKV, Linear Transformer) | Variable | Variable | Lineal/SSM | Variable | No disponibles datos comparables en la informacion proporcionada |

La comparacion cuantitativa con modelos de la misma categoria no esta disponible: el autor no publica perplejidad del Qwen2.5-0.5B original en WikiText-2 ni resultados de otros checkpoints del Attention Zoo en esta model card.

## Limitaciones y advertencias

- El repositorio no contiene el modelo completo: solo `attention_weights.safetensors` (84.16 MB). Es imprescindible cargar `Qwen/Qwen2.5-0.5B` y aplicar la cirugia con `apply_qwen_attention_surgery` antes de inyectar los pesos; sin ese paso el checkpoint es inutilizable.
- El resultado de perplejidad 49.52 esta marcado como `verified: false` en la model card; no ha sido validado de forma independiente.
- Entrenado y evaluado unicamente en WikiText-2 en ingles; el dominio y el idioma estan muy acotados y no hay evidencia de generalizacion a otros corpus o tareas.
- La sustitucion de atencion puede degradar capacidades que dependen de atencion cuadratica exacta (recuperacion de informacion en contexto largo, razonamiento multihop); no se aportan evaluaciones al respecto.
- No hay datos sobre sesgos, alucinacion o robustez; al derivar de Qwen2.5-0.5B hereda los sesgos de su corpus de entrenamiento original, no documentados aqui.
- El modulo `triton_cosformer` no soporta GQA nativo; depende del adaptador con expansion 14:2, lo que puede introducir ineficiencias o incompatibilidades con frameworks de inferencia estandar.
- No se documenta soporte para vLLM, TGI, llama.cpp ni Ollama; el despliegue en produccion requeriria trabajo de integracion adicional.
- La licencia MIT del checkpoint no exime de cumplir las condiciones de la licencia del modelo base Qwen2.5-0.5B (Apache 2.0) al redistribuir o combinar pesos.
- Modelo con 0 descargas y 0 likes en el momento de la ficha: no hay evidencia de uso en produccion ni validacion por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-triton-cosformer-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps (codigo, `ATTENTION_REGISTRY`, scripts de cirugia y entrenamiento): https://github.com/tahamajs/NeuralOps
- Licencia MIT del proyecto NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
