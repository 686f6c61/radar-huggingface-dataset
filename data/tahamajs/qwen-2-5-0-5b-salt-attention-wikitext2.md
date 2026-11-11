# tahamajs/qwen-2.5-0.5b-salt-attention-wikitext2

## Resumen

`tahamajs/qwen-2.5-0.5b-salt-attention-wikitext2` es un checkpoint experimental derivado de `Qwen/Qwen2.5-0.5B` en el que se han sustituido quirúrgicamente los bloques de atencion del decodificador por el modulo `salt_attention` del registro `ATTENTION_REGISTRY` del proyecto NeuralOps. El modelo forma parte del "Qwen Attention Zoo", una coleccion de variantes destinadas a evaluar el impacto de distintos operadores de atencion subcuadratica sobre modelos transformer preentrenados. Lo desarrolla el usuario de Hugging Face `tahamajs` y se distribuye con licencia MIT.

El modelo no es un modelo de proposito general: es un artefacto de investigacion que solo contiene los pesos de atencion trasplantados (`attention_weights.safetensors`, 55,10 MB), no el checkpoint completo. Para usarlo hay que partir del modelo base Qwen2.5-0.5B, aplicar la cirugia de atencion con el patron `hybrid_3_1` y cargar despues los pesos del repositorio. Su relevancia es metodologica: documenta con telemetria detallada un proceso de destilacion de conocimiento en dos etapas para recuperar capacidad predictiva tras reemplazar la atencion cuadratica estandar.

La arquitectura resultante combina 18 de las 24 capas con atencion SALT y 6 capas ancla con atencion cuadratica completa (indices 3, 7, 11, 15, 19 y 23). El modelo solo declara soporte para ingles y esta entrenado sobre WikiText-2, por lo que su perplexity de validacion (310,59) debe interpretarse como una metrica de recuperacion tras la cirugia, no como un resultado competitivo frente al modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con atencion hibrida: `salt_attention` en 18/24 capas y atencion cuadratica completa en 6/24 capas ancla |
| Parametros totales | No disponible (deriva de Qwen2.5-0.5B; el repo solo contiene pesos de atencion de 55,10 MB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el entrenamiento usa `seq_len=512`) |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors, sin variantes GGUF ni cuantizadas) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | `safetensors` (`attention_weights.safetensors`) + `config.json` + `tokenizer.json` |
| Libreria | `neuralops` |
| Modelo base | `Qwen/Qwen2.5-0.5B` |
| Patron de cirugia | `hybrid_3_1` (3:1 intercalado) |
| Cabezas de atencion | 14 query heads, 2 KV heads, `head_dim=64`, `hidden_size=896` (GQA 14:2) |
| Dataset de entrenamiento | `Salesforce/wikitext` / `wikitext-2-raw-v1` |
| Tamano del repo | 0,1 GB |

## Arquitectura y entrenamiento

El punto de partida es Qwen2.5-0.5B, un transformer decoder-only con 14 cabezas de query, 2 cabezas KV (GQA 14:2), `head_dim=64` y `hidden_size=896`. Sobre esa base se aplica un `QwenAttentionAdapter` que sustituye las proyecciones de atencion de 18 de las 24 capas por `SALTLinear` dentro del modulo `SALTAttention`, con expansion automatica de cabezas KV (7x) donde es necesario y un contrato de `o_proj` unico. Las 6 capas restantes conservan atencion cuadratica completa como anclas, en los indices `[3, 7, 11, 15, 19, 23]`. El modulo `SALTAttention` declara soporte causal, bidireccional, cross-attention y GQA nativo, y se describe como compatible con SVD ponderado por Fisher, gamma atencional y rango adaptativo (SALT-F).

El entrenamiento es una destilacion de conocimiento en dos etapas sobre WikiText-2. La etapa 0 (baseline cero-shot tras la cirugia) arroja una perplexity causal de 270320,78, es decir, el modelo queda practicamente destruido al sustituir la atencion. La etapa 1 (alineacion con backbone congelado, `lm_head` puenteado, MSE y coseno por capa con peso 0,25) se ejecuta durante 127 pasos en 54,4 s. La etapa 2 (destilacion de representaciones multicapa, MSE y coseno con peso 0,50) se ejecuta durante 290 pasos en 125,5 s. En total, 417 pasos de optimizacion en 180,1 s con `seq_len=512`, `grad_accum=4` y `topk=64`, alcanzando un pico de 17085 MB de VRAM en FP16 con parametros maestros del estudiante en FP32. El resultado final es una perplexity de validacion de 310,59, una recuperacion de 270010,19 puntos respecto al baseline post-cirugia.

## Capacidades

- Generacion de texto causal autoregresiva en ingles, heredada del modelo base Qwen2.5-0.5B.
- Atencion causal con soporte declarado de GQA nativo (14:2) y cross-attention a nivel de modulo.
- Capacidad bidireccional a nivel de modulo `SALTAttention` (aunque el checkpoint se evalua en modo causal).
- Razonamiento y codigo: no verificados en este checkpoint; el modelo solo se ha evaluado con perplexity sobre WikiText-2.
- Tool calling / function calling: no disponible ni documentado.
- Soporte de agentes y razonamiento multi-paso: no disponible ni documentado.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Investigacion sobre atencion subcuadratica: el modelo sirve como banco de pruebas reproducible para medir el coste de recuperacion (en pasos y perplexity) al sustituir atencion cuadratica por `salt_attention` en un transformer pequeno.
- Evaluacion de tecnicas de destilacion de conocimiento: la telemetria de dos etapas (alineacion con backbone congelado y destilacion de representaciones multicapa) permite comparar estrategias de recuperacion tras una cirugia agresiva de pesos.
- Estudio de topologias hibridas: el patron `hybrid_3_1` con 6 capas ancla cuadraticas permite analizar como la intercalacion de capas full-attention afecta a la estabilidad y a la perplexity final.
- Benchmarking de operadores de atencion: util para comparar `salt_attention` con otros operadores del `ATTENTION_REGISTRY` de NeuralOps sobre la misma base y el mismo dataset.
- Prototipado de pipelines de "weight surgery": el flujo `apply_qwen_attention_surgery` + carga de `attention_weights.safetensors` con `strict=False` sirve como plantilla para trasplantar modulos en otros modelos Qwen.
- Docencia y divulgacion: ejemplo compacto (0,1 GB de repo, 180 s de entrenamiento en una sola GPU) para explicar destilacion, GQA y atencion subcuadratica sin necesidad de infraestructura grande.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados de forma independiente):

| Benchmark | Metrica | Valor |
|---|---|---|
| WikiText-2 (`wikitext-2-raw-v1`, validation) | Perplexity | 310,59 |
| WikiText-2, baseline post-cirugia (etapa 0) | Perplexity | 270320,78 |
| Delta de recuperacion | Perplexity | -270010,19 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de capacidad en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Qwen2.5-0.5B en FP16 ocupa aproximadamente 1 GB; en FP32, unos 2 GB. El repositorio solo aporta 55,10 MB de pesos de atencion.
- VRAM de entrenamiento observada: 17085 MB de pico en FP16 con parametros maestros en FP32 durante la destilacion.
- GPU recomendadas: cualquier GPU consumer con al menos 2-4 GB de VRAM para inferencia (RTX 3060, RTX 4060, RTX 4090); para reproducir el entrenamiento, una GPU con 16-24 GB (RTX 4090, A100 40 GB, H100).
- Cabe en GPU consumer: si, con holgura, dado el tamano del modelo base.
- Opciones de despliegue: el flujo documentado usa `transformers` + `safetensors` + el paquete `neuralops` (funcion `apply_qwen_attention_surgery`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y al no publicarse pesos en GGUF no es desplegable directamente en esas herramientas sin conversion previa.
- Latencia y throughput: no disponibles. El unico dato temporal es el entrenamiento (180,1 s para 417 pasos).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Atencion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/qwen-2.5-0.5b-salt-attention-wikitext2` | Deriva de 0,5B | No disponible | Hibrida `salt_attention` 18/24 + cuadratica 6/24 | MIT | Pesos de atencion only (55,10 MB) |
| `Qwen/Qwen2.5-0.5B` | 0,5B | 32768 tokens (segun Qwen2.5) | Cuadratica completa con GQA | Apache 2.0 | Checkpoint completo |
| `Qwen/Qwen2.5-0.5B-Instruct` | 0,5B | 32768 tokens (segun Qwen2.5) | Cuadratica completa con GQA | Apache 2.0 | Checkpoint completo, ajustado a instrucciones |

La comparacion directa con el modelo base no es posible en terminos de perplexity porque la model card no reporta la PPL de `Qwen/Qwen2.5-0.5B` sobre WikiText-2. La diferencia fundamental es de naturaleza: este checkpoint es un artefacto de investigacion con pesos parciales, mientras que las alternativas son modelos completos listos para produccion.

## Limitaciones y advertencias

- Perplexity de validacion muy alta (310,59): el modelo no es competitivo frente al base para generacion de texto real; es un artefacto de recuperacion tras cirugia.
- Solo contiene pesos de atencion: requiere el modelo base Qwen2.5-0.5B y el paquete `neuralops` para funcionar; no es autocontenido.
- Entrenado unicamente sobre WikiText-2 con `seq_len=512`: no hay evidencia de generalizacion a otros dominios ni a contextos largos.
- Solo declara ingles; el comportamiento en otros idiomas no esta documentado.
- Riesgo de alucinacion: no evaluado; al ser un modelo pequeno y con capacidad degradada, el riesgo es alto en uso generativo.
- Sesgos: no documentados; hereda los del modelo base y los de WikiText-2.
- Licencia MIT permite uso comercial, pero el modelo base Qwen2.5-0.5B se distribuye bajo Apache 2.0, cuyos terminos deben respetarse igualmente.
- No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI; el despliegue en produccion requeriria trabajo adicional de conversion y validacion.
- La model card menciona compatibilidad con "Qwen3.5" en la descripcion del modulo, lo que puede ser una errata; no se ha verificado.
- El model-index marca la metrica como `verified: false`; los resultados no han sido reproducidos de forma independiente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-salt-attention-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Proyecto NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
