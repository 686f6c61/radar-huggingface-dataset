# viai957/Goedel-Prover-V2-8B-EI-campaign1-r1

## Resumen
Goedel-Prover-V2-8B-EI-campaign1-r1 es un modelo de generacion de demostraciones formales en Lean 4 derivado de Goedel-LM/Goedel-Prover-V2-8B mediante una ronda de expert iteration. Lo publica el usuario viai957 y se distribuye con licencia Apache 2.0. El modelo base es un transformer denso Qwen3 de 8.190.735.360 parametros (8,19B) en bf16, con 36 capas, hidden size 4096 y una ventana maxima de 40.960 posiciones.

El interes de esta ficha no reside en una mejora de rendimiento, sino en su condicion de resultado negativo documentado. Tras una ronda de rejection-sampling SFT con LoRA sobre 442 demostraciones verificadas por el kernel de Lean 4, el modelo resuelve 188 de 226 enunciados de miniF2F-valid, exactamente los mismos que el modelo base sin entrenar. La prueba de McNemar exacta da p = 1.0, de modo que la diferencia es indistinguible del ruido.

Es relevante ahora porque constituye un checkpoint reproducible de una campana de expert iteration completa: documenta el pipeline de generacion, verificacion con kernel, filtrado, entrenamiento LoRA, merge a bf16 y promediado de pesos, junto con las metricas de cambio de pesos y las perdidas de precision del merge. Sirve como referencia metodologica para quien disene campanas de RL o SFT sobre demostradores formales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3ForCausalLM (transformer denso, decoder-only) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 40.960 posiciones (max_position_embeddings) |
| Tipos de cuantizacion | no disponible (publicado en bf16; no se documentan GGUF ni otras) |
| Idiomas soportados | en (segun model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (17 shards, 16,38 GB en bf16) |

## Arquitectura y entrenamiento
La arquitectura no se modifica respecto al modelo base: 36 capas, hidden size 4096, FFN de 12288, 32 cabezas de query y 8 de key/value (GQA), dimension de cabeza 128, RoPE theta 1e6, vocabulario de 151.936 tokens con embeddings no atados y precision bf16. El entrenamiento toca exclusivamente las 252 matrices lineales adaptadas (q, k, v, o, gate, up y down en las 36 capas); embeddings, normalizaciones y LM head permanecen identicos al base antes del promediado.

El pipeline de expert iteration de la ronda 1 parte de un pool descontaminado de 5.940 enunciados, del que se seleccionan 300. El modelo base genera 8 muestras por enunciado (T=1.0, top-p 0.95, tope de 16.384 tokens, vLLM con TP=4), y se verifican con Lean 4.9.0-rc1 y Mathlib d1d1e4b7 mediante REPL, con comprobacion estricta del enunciado, whitelist de axiomas y rechequeo de kernel con limite de 180 s. Quedan 938 demostraciones verificadas de 179 enunciados; se descartan los enunciados resueltos 8 de 8 y se conservan como maximo las 4 demostraciones mas cortas por enunciado, resultando en 442 filas de SFT sobre 135 enunciados (1.642.463 tokens de completion y 111.922 de prompt).

El ajuste es un LoRA con r=64 y alpha=128, entropia cruzada sobre tokens de completion con media global por token, 2 epocas y 28 pasos de optimizador, ejecutado en 4x NVIDIA L4 (24 GB) en 37,1 minutos. El adaptador (174,6M parametros) se fusiona a bf16 y se promedia con el base segun 0,7·W_ft + 0,3·W_base sobre los 399 tensores. El cambio relativo de Frobenius por matriz adaptada es de 3,49e-4 de media (rango 1,26e-4 a 7,93e-4), pero el merge en bf16 conserva solo parcialmente el delta: coseno de 0,50 entre delta exportado e intencionado, error relativo 0,88 y un 87,9% de los elementos no nulos redondeados a cero. El modelo resultante mantiene una coincidencia de token argmax del 98,4-100% con el adaptador en las pruebas de exportacion.

## Capacidades
- Generacion de demostraciones completas en Lean 4 a partir de un enunciado con `sorry`, incluyendo un plan en lenguaje natural, un esqueleto de `have` y el bloque de codigo final.
- Razonamiento matematico formal con verificacion por kernel: cada salida esta pensada para ser comprobada por Lean 4 y Mathlib, no solo para ser plausible textualmente.
- Generacion de texto conversacional en formato chat de Goedel-V2 (`<|im_start|>user ... <|im_end|>`).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado; el modelo produce una unica demostracion por llamada, sin bucle de herramientas.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Capacidad especial: modo de planificacion explicita (plan en lenguaje natural seguido de esqueleto de prueba) antes de la demostracion final.
- Vision y audio: no disponibles.

## Casos de uso
- Reproduccion de campanas de expert iteration: el checkpoint permite reanudar la ronda 2 o 3 desde exactamente el mismo estado, con el pipeline de generacion, verificacion y filtrado ya documentado y cronometrado.
- Investigacion sobre resultados negativos en RL formal: util como referencia controlada para comparar el efecto de una ronda de rejection-sampling SFT frente a variantes con mas datos, mayor rango LoRA o merge en fp32.
- Generacion de borradores de pruebas para asistentes de Lean: el modelo produce un plan y un esqueleto de `have` que un humano puede refinar, lo que reduce el coste de arranque en enunciados de dificultad media.
- Construccion de datasets de destilacion: las 442 demostraciones verificadas y el procedimiento de filtrado sirven para generar corpus de entrenamiento para modelos mas pequenos con garantia de correccion por kernel.
- Auditoria de pipelines de verificacion: las metricas de perdida de precision del merge en bf16 (87,9% de deltas a cero) son un caso de estudio para disenar exportaciones mas fieles.
- Evaluacion comparativa de harnesses: al haberse medido con cuatro configuraciones distintas (187, 191 y 187 resueltos con otras semillas y harness), permite calibrar la varianza entre evaluadores de miniF2F.
- Docencia en verificacion formal: el par plan + esqueleto + prueba completa es un material didactico sobre como estructurar demostraciones en Lean 4 con Mathlib.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado | Modelo base (mismo protocolo) |
|---|---|---|---|
| miniF2F valid (226 enunciados soportados, `cat-searcher/minif2f-lean4`, revision 70a1249) | pass@1 (n=8, tope 30k tokens, semilla 0) | 71,9% | 71,85% |
| miniF2F valid (misma configuracion) | pass@8 / solved@8 (188 de 226, semilla 0) | 83,2% | 83,2% (188/226) |

La diferencia emparejada es de 0 problemas (2 resueltos solo por este modelo, 2 solo por el base; McNemar exacto p = 1.0). Tres evaluaciones adicionales con otro harness y semillas 0/1/2 resuelven 187, 191 y 187 enunciados, con desviacion tipica emparejada de 3,17 problemas. No se midieron miniF2F-test, MOBench, pass@32 ni tareas fuera de Lean.

## Requisitos de hardware
- VRAM estimada para inferencia en bf16: aproximadamente 16,4 GB solo de pesos, mas cache KV; con contexto largo (hasta 40.960 tokens) el consumo adicional es significativo por las 8 cabezas KV y 36 capas.
- GPU recomendadas para bf16: A100 40/80 GB, H100 80 GB, L40S 48 GB. El entrenamiento documentado se ejecuto en 4x NVIDIA L4 de 24 GB con vLLM y TP=4.
- GPU de consumo: el modelo completo en bf16 no cabe con holgura en 24 GB; en RTX 4090 (24 GB) requeriria cuantizacion, no publicada por el autor. En RTX 3090/4090 con cuantizacion de 8 bits o inferior seria viable, aunque sin pesos GGUF oficiales.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible` en Hugging Face) y vLLM (usado en la campana con TP=4). llama.cpp y Ollama no estan documentados para este checkpoint.
- Latencia y throughput: no disponibles de forma agregada. Los tiempos medidos corresponden al pipeline de entrenamiento y evaluacion (SFT 37,1 min; merge/export 4,4 min; promediado 3,1 min; evaluacion 3,64 h; generacion y verificacion del harvest ~5,9 h), no a inferencia interactiva.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | miniF2F-valid | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Goedel-Prover-V2-8B-EI-campaign1-r1 | 8,19B denso | 40.960 | 188/226 (pass@8), 71,9% pass@1 | Apache 2.0 | Hugging Face (viai957) |
| Goedel-Prover-V2-8B (base) | 8,19B denso | 40.960 | 188/226 (pass@8), 71,85% pass@1 | Apache 2.0 | Hugging Face (Goedel-LM) |
| Versiones intermedias de la campana (rondas 2 y 3) | 8,19B denso | 40.960 | 187 y 185 de 226 | Apache 2.0 | No publicadas como checkpoints independientes en la informacion disponible |
| Otros demostradores Lean 4 de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion con datos verificables es contra el modelo base, del que este checkpoint es estadisticamente indistinguible. No se dispone de resultados de otros demostradores formales en la informacion proporcionada.

## Limitaciones y advertencias
- Resultado negativo: no hay mejora medible sobre el modelo base en miniF2F-valid (p = 1.0). No debe presentarse como una version superior de Goedel-Prover-V2-8B.
- El merge en bf16 destruye la mayor parte del delta del LoRA: el 87,9% de los elementos no nulos se redondean a cero y el coseno entre delta exportado e intencionado es 0,50. Cualquier conclusion sobre la eficacia del metodo queda confundida por esta perdida de precision.
- Varianza entre evaluaciones: la desviacion tipica emparejada es de 3,17 problemas sobre 226, por lo que diferencias de pocos enunciados no son significativas.
- Cobertura de evaluacion limitada: solo miniF2F-valid; no se midieron miniF2F-test, MOBench, pass@32 ni tareas no formales.
- Idioma: el modelo esta entrenado y documentado en ingles; el rendimiento en castellano no esta caracterizado.
- Riesgo de alucinacion: las demostraciones pueden parecer plausibles y no compilar; es obligatorio verificar con el kernel de Lean 4 y Mathlib antes de cualquier uso.
- Dependencia de versiones: los resultados se obtuvieron con Lean 4.9.0-rc1 y Mathlib d1d1e4b7; otras versiones pueden alterar la tasa de exito.
- Licencia Apache 2.0 permite uso comercial, pero se heredan las condiciones del modelo base Goedel-Prover-V2-8B y de Qwen3; conviene revisar ambas.
- Sin cuantizaciones oficiales publicadas: el despliegue en hardware de consumo requiere conversion propia y no esta validado por el autor.
- Modelo de nicho: no soporta tool calling ni agentes multi-paso, y su unico modo de salida util es la generacion de pruebas Lean 4.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/viai957/Goedel-Prover-V2-8B-EI-campaign1-r1
- Modelo base: https://huggingface.co/Goedel-LM/Goedel-Prover-V2-8B
- Paper de referencia (arXiv:2508.03613): https://arxiv.org/abs/2508.03613
- Dataset Goedel-Pset-v1: https://huggingface.co/datasets/Goedel-LM/Goedel-Pset-v1
- Dataset RL-Goedel-Pset-Level-4-5: https://huggingface.co/datasets/HangHor/RL-Goedel-Pset-Level-4-5
- Dataset FormalMATH-All: https://huggingface.co/datasets/SphereLab/FormalMATH-All
- Dataset NuminaMath-LEAN-Sol: https://huggingface.co/datasets/iiis-lean/NuminaMath-LEAN-Sol
- Dataset Nemotron-Math-Proofs-v1: https://huggingface.co/datasets/nvidia/Nemotron-Math-Proofs-v1
- Dataset lean-prover-data: https://huggingface.co/datasets/viai957/lean-prover-data
- Dataset de evaluacion miniF2F Lean 4: https://huggingface.co/datasets/cat-searcher/minif2f-lean4
