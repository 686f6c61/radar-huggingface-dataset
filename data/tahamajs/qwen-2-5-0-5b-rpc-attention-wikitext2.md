# tahamajs/qwen-2.5-0.5b-rpc-attention-wikitext2

## Resumen

`tahamajs/qwen-2.5-0.5b-rpc-attention-wikitext2` es un checkpoint experimental derivado de `Qwen/Qwen2.5-0.5B` en el que se han sustituido quirurgicamente los bloques de atencion del decodificador por el operador `rpc_attention` (Random Projection Compressed Attention) del registro `ATTENTION_REGISTRY` del proyecto NeuralOps. El objetivo no es ofrecer un modelo de proposito general, sino servir de banco de pruebas reproducible para evaluar mecanismos de atencion subcuadratica sobre un transformer ya entrenado, midiendo la degradacion y la recuperacion via destilacion de conocimiento. Lo publica el autor independiente `tahamajs` bajo licencia MIT.

La intervencion sigue un patron hibrido 3:1: 18 de las 24 capas del decodificador se transplantan con `rpc_attention` mediante `QwenAttentionAdapter`, mientras que 6 capas conservan la atencion cuadratica original como anclas (indices 3, 7, 11, 15, 19 y 23). El adaptador gestiona la expansion de cabezas KV (de 2 a 14, factor 7x) para satisfacer el contrato de `RPCAttention`, que no soporta GQA nativo, y fuerza un contrato de `o_proj` unico.

El modelo se ha recuperado mediante un proceso de destilacion en dos etapas (alineamiento con backbone congelado y destilacion de representaciones multicapa) sobre WikiText-2, pasando de una perplejidad de 49413,90 tras la cirugia a 246,16 tras 375 pasos de optimizacion. Es, por tanto, una pieza de investigacion sobre eficiencia atencional, no un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con atencion hibrida: 18/24 capas `rpc_attention` + 6/24 capas de atencion cuadratica completa |
| Parametros totales | No disponible (modelo base Qwen2.5-0.5B: aproximadamente 0,5 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (entrenado con `seq_len=512`) |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors, presumiblemente FP16) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | `attention_weights.safetensors` (80,52 MB), solo pesos de atencion; requiere el modelo base `Qwen/Qwen2.5-0.5B` |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen2.5-0.5B`, un transformer decoder-only con 24 capas, `hidden_size=896`, 14 cabezas de consulta y 2 cabezas KV (`head_dim=64`). Sobre esa base se aplica una "cirugia" que reemplaza los modulos `Qwen2Attention` por instancias de `RPCAttention` en 18 de las 24 capas, siguiendo el patron `hybrid_3_1` (tres capas RPC por cada capa cuadratica de ancla). El `QwenAttentionAdapter` realiza la expansion 14:2 de cabezas KV a 14:14 y aplica el contrato de `o_proj` unico. `RPCAttention` es un operador de atencion comprimida por proyeccion aleatoria, con soporte causal, bidireccional y cross-attention, pero sin soporte nativo de GQA ni de RoPE declarado (`supports_rope: N/A`).

El entrenamiento consiste en una destilacion de conocimiento en dos etapas sobre WikiText-2 (`wikitext-2-raw-v1`). La etapa 1 (alineamiento con backbone congelado) ejecuta 114 pasos en 54,4 s con `lm_head` desactivado, usando MSE y coseno sobre estados ocultos por capa con peso 0,25. La etapa 2 (destilacion de representaciones multicapa) ejecuta 261 pasos en 125,7 s con peso de coseno 0,50. En total, 375 pasos y 180,4 s con `seq_len=512`, `grad_accum=4`, `topk=64`, autocast FP16 y parametros maestros FP32 del alumno, con un pico de VRAM de 17556 MB. La perplejidad causal pasa de 49413,90 (etapa 0, cero-shot tras la cirugia) a 246,16 final.

## Capacidades

- Generacion de texto causal autorregresiva en ingles, heredada del modelo base Qwen2.5-0.5B.
- Razonamiento basico y respuesta conversacional de un modelo de 0,5B, limitada por el proceso de destilacion sobre WikiText-2.
- Soporte de atencion causal, bidireccional y cross-attention a nivel de modulo `RPCAttention` (util para experimentacion, no expuesto como API de alto nivel).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidad multilingue limitada al ingles declarado en la model card.
- No dispone de modo thinking, vision ni audio.
- Uso previsto como banco de pruebas de mecanismos de atencion subcuadratica y de tecnicas de destilacion post-cirugia.

## Casos de uso

- Investigacion en atencion eficiente: el checkpoint permite medir el coste en perplejidad de sustituir atencion cuadratica por `rpc_attention` en un transformer ya entrenado, con una linea base clara (49413,90 antes de destilar, 246,16 despues).
- Reproduccion de experimentos de destilacion de conocimiento: los `training_metrics.json` y la telemetria de las dos etapas permiten replicar el pipeline de 375 pasos y comparar variantes del patron hibrido.
- Evaluacion comparativa de operadores de atencion: util para contrastar `rpc_attention` con otras entradas del `ATTENTION_REGISTRY` de NeuralOps sobre el mismo backbone Qwen2.5-0.5B.
- Prototipado de arquitecturas hibridas: sirve para validar el `QwenAttentionAdapter` y el contrato de `o_proj` unico antes de escalar a modelos mayores.
- Docencia y formacion: ejemplo didactico de cirugia de atencion y recuperacion via KD en un modelo pequeno que cabe en una unica GPU.
- Pruebas de integracion de la libreria `neuralops`: el ejemplo `load_surgeried_model` permite verificar el pipeline de carga de pesos quirurgicos desde el Hub.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Benchmark | Metrica | Valor |
|---|---|---|
| WikiText-2 (`wikitext-2-raw-v1`, validation) | Perplejidad | 246,16 |
| WikiText-2, etapa 0 (post-cirugia, cero-shot) | Perplejidad | 49413,90 |
| Delta de perplejidad tras KD | Variacion | -49167,74 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible. El unico dato de rendimiento es la perplejidad en WikiText-2.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 2 GB en FP16 para el modelo base de 0,5B; el entrenamiento reportado consumio 17556 MB de pico con autocast FP16 y maestros FP32.
- GPU recomendadas para entrenamiento/reproduccion: una GPU con al menos 18 GB de VRAM (RTX 4090, A100 40 GB, H100).
- Cabe holgadamente en GPU de consumo para inferencia: RTX 3060 12 GB, RTX 4060 Ti, RTX 4090, e incluso GPUs con 4-6 GB en cuantizacion.
- Opciones de despliegue: la libreria propietaria `neuralops` (`load_surgeried_model`) o el flujo manual con `transformers` + `apply_qwen_attention_surgery` + carga de `attention_weights.safetensors`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este checkpoint quirurgico.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Atencion | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `tahamajs/qwen-2.5-0.5b-rpc-attention-wikitext2` | ~0,5B | No disponible | Hibrida 18/24 RPC + 6/24 cuadratica | 246,16 (declarada) | MIT | Hugging Face |
| `Qwen/Qwen2.5-0.5B` (base) | ~0,5B | 32768 tokens (segun model card de Qwen) | Cuadratica completa con GQA | No disponible en esta ficha | Apache 2.0 (Qwen) | Hugging Face |
| Otros checkpoints del NeuralOps Attention Zoo | ~0,5B | No disponible | Variantes de `ATTENTION_REGISTRY` | No disponible | MIT | Hugging Face |

La comparativa directa con el modelo base en perplejidad WikiText-2 no esta disponible en la informacion proporcionada; el dato de 246,16 debe interpretarse como el resultado de un proceso de recuperacion tras una cirugia agresiva, no como un resultado competitivo frente a Qwen2.5-0.5B original.

## Limitaciones y advertencias

- Perplejidad muy elevada (246,16) frente a lo esperable en un modelo de 0,5B sin cirugia; la calidad de generacion sera notablemente inferior a la del modelo base.
- Entrenado exclusivamente sobre WikiText-2, un corpus enciclopedico en ingles; el dominio y el estilo de salida estan fuertemente sesgados hacia ese registro.
- Idioma limitado al ingles declarado; no se garantiza comportamiento correcto en castellano ni en otros idiomas.
- No soporta GQA nativo en `RPCAttention`; el adaptador fuerza una expansion 14:2 que altera el contrato original de Qwen2 y puede introducir artefactos numericos.
- `supports_rope: N/A` en el modulo de atencion; el tratamiento posicional en las capas transplantadas no esta documentado y puede diferir del original.
- Requiere cargar el modelo base `Qwen/Qwen2.5-0.5B` por separado y aplicar la cirugia antes de cargar los pesos; no es un checkpoint autonomo.
- Depende de la libreria `neuralops` y de scripts auxiliares (`apply_qwen_attention_surgery`), lo que limita la portabilidad frente a un checkpoint estandar de `transformers`.
- Riesgo de alucinacion elevado por el bajo numero de parametros y por el proceso de destilacion sobre un unico dataset.
- No se han publicado evaluaciones de sesgo, seguridad ni robustez.
- Licencia MIT en los pesos quirurgicos, pero el uso comercial debe verificar tambien la licencia del modelo base Qwen2.5-0.5B.
- No apto para produccion sin una evaluacion adicional exhaustiva en la tarea objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-rpc-attention-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
