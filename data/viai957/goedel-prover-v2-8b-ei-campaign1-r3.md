# viai957/Goedel-Prover-V2-8B-EI-campaign1-r3

## Resumen

Goedel-Prover-V2-8B-EI-campaign1-r3 es un checkpoint de investigación publicado por el desarrollador independiente viai957 (proyectos align y ProofForge) como parte de una campaña de *expert iteration* (autodestilación por rejection sampling) sobre Goedel-LM/Goedel-Prover-V2-8B. Se trata de un generador de demostraciones completas en Lean 4 construido sobre la arquitectura Qwen3 (`Qwen3ForCausalLM`), con 8.190.735.360 parámetros, 36 capas, hidden size 4096, GQA con 32 cabezas de consulta y 8 de clave-valor, vocabulario de 151.936 tokens y 40.960 posiciones máximas de contexto.

El modelo es relevante no por su rendimiento, sino por su naturaleza de **resultado negativo publicado**. La ronda 3 de la campaña resuelve 185 de 226 problemas de miniF2F-valid con 8 muestras, frente a 188 de 226 del modelo base sin entrenar bajo el mismo protocolo de muestreo (McNemar exacto p = 0,51). La regla de parada preinscrita detuvo la campaña con motivo `regression` y seleccionó la ronda 1 como mejor ronda. El autor declara explícitamente que este checkpoint no es un modelo recomendado y que, para uso práctico como demostrador, debe emplearse el modelo base.

La ficha existe, por tanto, como artefacto reproducible y auditable de la escalada (base, r1, r2, r3), útil para investigadores que estudien la eficacia real de la autodestilización en dominios de verificación formal estricta, donde la señal de recompensa es binaria y el margen de mejora es estrecho.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only `Qwen3ForCausalLM` (GQA, RoPE) |
| Parametros totales | 8.190.735.360 (8,19 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 40.960 posiciones máximas (sin cambios respecto al base); el protocolo de generación usa un tope de 16.384 tokens en entrenamiento y 30.000 en evaluación |
| Tipos de cuantizacion | no disponible (el repositorio publica pesos en bf16; no se documentan GGUF, GPTQ ni AWQ) |
| Idiomas soportados | inglés (`en`); el contenido generado es código Lean 4 |
| Licencia | Apache-2.0 (heredada del modelo base) |
| Formato de pesos | safetensors (bf16, 17 shards, 399 tensores) |
| Hidden size | 4096 |
| Capas | 36 |
| Cabezas de atención | 32 query / 8 KV (GQA), head dim 128 |
| Vocabulario | 151.936 tokens |
| RoPE theta | 1.000.000 |
| Modelo base | Goedel-LM/Goedel-Prover-V2-8B @ `dfd02e6271a58375dfbf3ece0175277cf6b6a89a` |
| Tamano del repositorio | 16,4 GB |
| Descargas / likes | 856 / 1 (en el momento de la consulta) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only denso de la familia Qwen3, idéntica a la del modelo base: 36 capas, hidden 4096, atención con grouped-query attention (32 cabezas de consulta, 8 de clave-valor, dimensión de cabeza 128), RoPE con theta 1e6 y ventana máxima de 40.960 posiciones. El formato de prompt es el de Goedel (`prompt_format = goedel`): un turno de usuario de chat Qwen con la instrucción "Complete the following Lean 4 code:" seguido de un bloque `lean4` que contiene la cabecera de Mathlib y el enunciado terminado en `:= by sorry`, más una petición de plan de demostración. El modelo escribe primero un plan y después una demostración completa en Lean 4.

El entrenamiento sigue un bucle de *expert iteration* con rejection sampling. En cada ronda se seleccionan 300 enunciados de un pool de 5.940 enunciados descontaminados procedentes de cinco conjuntos de datos abiertos (Goedel-LM/Goedel-Pset-v1, HangHor/RL-Goedel-Pset-Level-4-5, SphereLab/FormalMATH-All, iiis-lean/NuminaMath-LEAN-Sol, nvidia/Nemotron-Math-Proofs-v1 y viai957/lean-prover-data), con 0 solapamiento con miniF2F-valid, miniF2F-test y mobench. Para cada enunciado se muestrean 8 demostraciones con vLLM 0.26 (TP=4), temperatura 1,0, top-p 0,95 y tope de 16.384 tokens; cada demostración se verifica con un kernel Lean 4.9.0-rc1 + Mathlib `d1d1e4b7` estricto (recomprobación de kernel, lista blanca de axiomas, puerta léxica, 180 s). Se conservan como máximo las 4 demostraciones verificadas más cortas por enunciado, descartando los enunciados resueltos 8 de 8 (demasiado fáciles) y los infieles. La ronda 3 produjo 398 demostraciones verificadas de 127 enunciados (1.523.369 tokens de completion y 96.571 de prompt); todos los objetivos son demostraciones propias verificadas por Lean, sin texto de demostración de origen.

Sobre esos datos se aplica LoRA SFT (rango 64, alpha 128, 2 épocas, lr 2e-5 coseno, FSDP2 sobre 4 rangos), se fusiona el LoRA en bf16, se comprueba la paridad con vLLM y se promedia con el modelo base original con peso 0,7: θ_t = 0,7·(θ_{t-1} + Δ_t) + 0,3·θ_0. Cada ronda parte del modelo promediado de la ronda anterior y ancla el promedio en el base original. El cómputo de la ronda 3 fue de 12,0 h de tiempo de etapa en 4× NVIDIA L4 (24 GB): 6,9 h de generación y verificación, 0,6 h de SFT, 0,1 h de exportación y promedio y 4,4 h de evaluación; la campaña completa registró 27,2 h. La regla de parada preinscrita (ganancia mínima 2, paciencia 2, regresión máxima 3) detuvo la campaña tras esta ronda.

## Capacidades

- Generación de demostraciones completas en Lean 4 para enunciados de matemáticas formales, precedidas de un plan de demostración en lenguaje natural.
- Razonamiento matemático formal con verificación por kernel Lean (Mathlib), orientado a teoremas de competición y resultados de nivel universitario temprano.
- Autodestilación verificada: el modelo ha sido entrenado exclusivamente con demostraciones propias aceptadas por el verificador, lo que garantiza la fidelidad formal de los objetivos de entrenamiento.
- Generación de texto conversacional en formato chat Qwen (pipeline `text-generation`, compatible con text-generation-inference y endpoints).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado como capacidad de agente; el bucle de plan + demostración es multi-paso dentro de una única generación.
- Capacidades multilingües: limitadas al inglés como idioma declarado; la salida es código Lean 4.
- Capacidades especiales: modo de planificación previa a la demostración; no se documentan visión, audio ni modo thinking explícito.
- No se documentan capacidades de código general, matemáticas simbólicas fuera de Lean ni visión.

## Casos de uso

- **Auditoría de resultados negativos en autodestilización**: el checkpoint permite reproducir la escalada base → r1 → r2 → r3 y comprobar que la ronda 3 no supera al base (185/226 frente a 188/226 en solved@8). Es adecuado porque el autor publica el protocolo completo, los datos de entrenamiento y las métricas con intervalos de confianza.
- **Investigación sobre señal de recompensa binaria en dominios formales**: sirve para estudiar por qué el rejection sampling con verificador estricto deja de aportar ganancia cuando la tasa de acierto del base ya es alta (pass@1 ≈ 72 %), y para diseñar variantes de selección de enunciados (por banda de dificultad, nunca resueltos, no medidos).
- **Reproducción de pipelines de verificación Lean**: el modelo se integra en flujos que ejecutan Lean 4.9.0-rc1 con Mathlib `d1d1e4b7`, lista blanca de axiomas y puerta léxica; útil para validar infraestructura de verificación antes de escalar a modelos mayores.
- **Generación de datos sintéticos verificados para SFT**: las demostraciones aceptadas por el kernel pueden reutilizarse como corpus de entrenamiento para otros demostradores, con la garantía de fidelidad formal que aporta la verificación.
- **Línea base en evaluaciones de demostradores Lean 4**: al estar entrenado sobre Qwen3-8B y evaluado en miniF2F-valid con un protocolo explícito (n=8, tope 30k, 180 s, seed 0), sirve como referencia controlada frente a modelos como Goedel-Prover-V2-8B original o DeepSeek-Prover.
- **Estudio de weight averaging y anclaje al base**: el esquema θ_t = 0,7·(θ_{t-1} + Δ_t) + 0,3·θ_0 es replicable y permite analizar el efecto del anclaje sobre el olvido catastrófico en tareas de verificación estricta.
- **Docencia e ilustración de metodología experimental**: la regla de parada preinscrita y el análisis de McNemar hacen del repositorio un caso práctico de diseño experimental con resultados negativos en IA.

## Benchmarks y rendimiento

Datos declarados por el autor en el `model-index` de la model card (no verificados de forma independiente):

| Benchmark | Metrica | Resultado |
|---|---|---|
| miniF2F-valid (226 problemas, Lean 4.9.0-rc1) | pass@1 medio (%, n=8, tope 30k tokens, verificador 180 s, seed 0) | 71,96 |
| miniF2F-valid (226 problemas) | pass@8 / solved@8 (%, 185 de 226) | 81,86 |

Comparación con el modelo base bajo el mismo protocolo, según la model card:

| Modelo | solved@8 | pass@1 medio | Diferencia |
|---|---|---|---|
| Goedel-Prover-V2-8B (base) | 188/226 (83,19 %) | 71,85 % [66,7; 77,0] | referencia |
| Goedel-Prover-V2-8B-EI-campaign1-r3 | 185/226 (81,86 %) | 71,96 % [66,9; 76,9] | Δ solved@8 −3 (p = 0,51); Δ pass@1 +0,11 pp [−1,49; +1,77] |

No se midieron miniF2F-test, PutnamBench, ProofNet, pass@32 ni superiores, una segunda semilla de entrenamiento ni la divergencia KL respecto al base. Las diferencias entre rondas son menores que la dispersión entre semillas (4 problemas: de 187 a 191 en 4 ejecuciones de r1).

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 16,4 GB solo de pesos, más caché KV; en la práctica se recomienda un mínimo de 24 GB para contexto moderado y bastante más para el tope de 30.000 tokens.
- GPU recomendadas: A100 (40/80 GB), H100 (80 GB) para despliegues de producción con contexto largo; L40S o L4 (24 GB) para experimentación con contexto reducido.
- Cabe en GPU de consumo: sí en tarjetas de 24 GB (RTX 3090, RTX 4090) en bf16 con contexto limitado; en 16 GB requeriría cuantización, que no está documentada en el repositorio.
- Opciones de despliegue: vLLM (usado por el autor, versión 0.26, TP=4), text-generation-inference (el modelo es compatible con endpoints), transformers con safetensors; llama.cpp y Ollama no están documentados para este checkpoint.
- Latencia y throughput: no disponibles de forma agregada; el autor reporta 6,9 h de generación y verificación para 300 enunciados × 8 muestras con tope de 16.384 tokens en 4× L4, lo que da una idea del coste del bucle de muestreo.
- El entrenamiento se realizó en 4× NVIDIA L4 (24 GB) con FSDP2, lo que confirma que el ajuste LoRA es viable en hardware de gama media.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | miniF2F-valid (pass@1 / solved@8) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Goedel-Prover-V2-8B-EI-campaign1-r3 (este) | 8,19 B | 40.960 | 71,96 % / 185 de 226 | Apache-2.0 | Hugging Face (viai957) |
| Goedel-Prover-V2-8B (base) | 8,19 B | 40.960 | 71,85 % / 188 de 226 | Apache-2.0 | Hugging Face (Goedel-LM) |
| DeepSeek-Prover-V2 | no disponible en la información proporcionada | no disponible | no disponible | no disponible | no disponible |
| Otros demostradores Lean 4 de ~8 B | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa relevante es con el modelo base, que supera ligeramente a este checkpoint en solved@8 y empata en pass@1 dentro del intervalo de confianza. No se dispone de datos verificados de terceros (DeepSeek-Prover, Kimina-Prover u otros) en la información proporcionada, por lo que no se incluyen cifras comparativas adicionales.

## Limitaciones y advertencias

- **Resultado negativo**: el autor declara explícitamente que este checkpoint no es un modelo recomendado y que, para uso como demostrador, debe emplearse el modelo base Goedel-Prover-V2-8B.
- **Sin mejora demostrada**: la diferencia frente al base no es estadísticamente significativa (p = 0,51 en solved@8); las variaciones entre rondas son inferiores a la dispersión entre semillas.
- **Riesgo de alucinación formal**: como todo generador de demostraciones, puede producir pruebas sintácticamente plausibles que fallen en el kernel de Lean; la verificación externa es obligatoria antes de cualquier uso.
- **Cobertura de evaluación limitada**: solo se midió miniF2F-valid; no hay datos de miniF2F-test, PutnamBench, ProofNet ni pass@32 o superiores, lo que impide extrapolar el rendimiento a problemas más difíciles.
- **Idioma**: el modelo está declarado solo para inglés y su salida es código Lean 4; no se documentan capacidades multilingües ni de conversación general.
- **Licencia**: Apache-2.0 heredada del base, lo que permite uso comercial del modelo; sin embargo, los enunciados de entrenamiento conservan sus propias licencias y deben revisarse por separado.
- **Cuantización no documentada**: no se publican versiones GGUF, GPTQ ni AWQ, lo que limita el despliegue en hardware de menos de 16 GB sin trabajo adicional.
- **Sesgos**: no se documentan análisis de sesgo; el dominio es matemáticas formales, lo que reduce pero no elimina el riesgo de sesgos en los enunciados de origen.
- **Protocolo de evaluación sensible**: los resultados dependen del tope de tokens (30k), del tiempo de verificador (180 s) y de la semilla; comparaciones con otros modelos requieren replicar exactamente el protocolo.
- **Datos de entrenamiento propios**: el modelo se entrenó con sus propias demostraciones verificadas, lo que puede inducir un sesgo de estilo y una menor diversidad de estrategias de prueba.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/viai957/Goedel-Prover-V2-8B-EI-campaign1-r3
- Modelo base: https://huggingface.co/Goedel-LM/Goedel-Prover-V2-8B
- Repositorio del stack de post-entrenamiento align: https://github.com/viai957/align
- Conjunto de datos de entrenamiento propio: https://huggingface.co/datasets/viai957/lean-prover-data
- Datasets utilizados: https://huggingface.co/datasets/Goedel-LM/Goedel-Pset-v1, https://huggingface.co/datasets/HangHor/RL-Goedel-Pset-Level-4-5, https://huggingface.co/datasets/SphereLab/FormalMATH-All, https://huggingface.co/datasets/iiis-lean/NuminaMath-LEAN-Sol, https://huggingface.co/datasets/nvidia/Nemotron-Math-Proofs-v1
- Paper, blog o demo adicionales: no disponibles en la información proporcionada.
