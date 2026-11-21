# viai957/Goedel-Prover-V2-8B-EI-campaign1-r2

## Resumen

Goedel-Prover-V2-8B-EI-campaign1-r2 es un modelo de generacion de demostraciones formales en Lean 4, derivado mediante un proceso de *expert iteration* sobre Goedel-Prover-V2-8B (desarrollado por Goedel-LM). Se trata de un ajuste fino con LoRA sobre la arquitectura Qwen3 de 8.190.735.360 parametros, entrenado para generar pruebas completas de teoremas a partir de enunciados en Lean 4. El modelo esta publicado por el usuario viai957 como resultado documentado de la ronda 2 de una campana de tres rondas de expert iteration.

El problema que aborda es la automatizacion de la demostracion formal de teoremas matematicos, una tarea central en verificacion formal y en la evaluacion de capacidades de razonamiento de los LLM. El modelo recibe un enunciado de teorema en Lean 4 y produce un plan de prueba en lenguaje natural seguido de un bloque `lean4` con el teorema y la demostracion completa, que puede ser verificado por el kernel de Lean.

La relevancia de esta ficha es doble: por un lado, documenta un checkpoint concreto de un prover de 8B parametros con contexto de 40.960 tokens; por otro, el propio autor declara explicitamente que esta ronda no produjo mejora medible respecto al modelo base (187/226 frente a 188/226 en miniF2F-valid, McNemar exacto p = 1.0), por lo que se publica como resultado negativo y no como checkpoint recomendado. Para uso productivo, el autor remite al modelo base Goedel-LM/Goedel-Prover-V2-8B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3ForCausalLM (transformer decoder-only, GQA) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 40.960 posiciones maximas (RoPE θ = 1e6) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; no se documentan cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16, 17 shards, 16,38 GB) |

Detalles adicionales de arquitectura: 36 capas, hidden size 4096, intermediate size 12288, 32 cabezas de consulta y 8 cabezas KV (GQA), head_dim 128, vocabulario de 151.936 tokens, embeddings no atados (untied).

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Qwen3, con atencion de grupo de consultas (GQA) y RoPE con θ = 1e6, heredado integramente del modelo base Goedel-LM/Goedel-Prover-V2-8B (revision dfd02e6271a58375dfbf3ece0175277cf6b6a89a). No introduce cambios arquitectonicos: toda la diferencia respecto al base proviene del ajuste fino y de la media de pesos posterior.

El entrenamiento corresponde a la ronda 2 de una campana de expert iteration de tres rondas. El proceso parte de 5.940 enunciados Lean descontaminados y selecciona 300 mediante `select_by_band` (primero en banda (0, 0.75], luego no medidos). Con el modelo de la ronda 1 se muestrean 8 demostraciones por enunciado (vLLM, temperatura 1.0, top-p 0.95, limite de 16.384 tokens), generando 2.400 pruebas. Estas se verifican con el kernel de Lean 4 v4.9.0-rc1 y Mathlib d1d1e4b7 (180 s de timeout, lista blanca de axiomas): 852 son aceptadas. Tras descartar los enunciados resueltos 8/8 (45) y las pruebas no fieles (2), y conservar hasta 4 de las mas cortas por enunciado, queda un conjunto de SFT de 374 filas sobre 120 enunciados (1.377.760 tokens de completion y 97.007 tokens de prompt). Sobre ese conjunto se aplica LoRA (r=64, α=128, learning rate 2e-5, 2 epocas, 24 pasos de optimizador) en las proyecciones q/k/v/o/gate/up/down de las 36 capas (252 matrices, 174,6M parametros, ~2,1% del total). El adaptador se fusiona en bf16 (el 88,7% de los elementos del delta redondean a cero) y los pesos resultantes se promedian con el base original: θ = 0,3·θ_base + 0,7·θ_export.

El computo total fue de 4 GPU NVIDIA L4 (24 GB, sm_89) en un nodo, con 10,8 h de reloj de pared para la ronda (generacion y verificacion 6,07 h, SFT 0,55 h, exportacion y media 0,10 h, evaluacion 4,07 h). Los enunciados de entrenamiento proceden de Goedel-Pset-v1 (MIT), NuminaMath-LEAN-Sol (Apache-2.0), Nemotron-Math-Proofs-v1 (CC-BY-SA-4.0), FormalMATH-All (MIT) y RL-Goedel-Pset-Level-4-5; las pruebas objetivo son autogeneradas y verificadas por el kernel, no texto de pruebas de origen.

## Capacidades

- Generacion de demostraciones completas en Lean 4 a partir de un enunciado de teorema, con plan de prueba en lenguaje natural seguido de un bloque `lean4` con el teorema y la demostracion.
- Razonamiento matematico formal verificable por el kernel de Lean 4 (no requiere confiar en la salida del modelo).
- Generacion de texto conversacional (pipeline `text-generation`, tag `conversational`).
- Especializacion en matematica formal: entrenado sobre enunciados de competicion y de nivel universitario procedentes de cinco datasets abiertos.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de pensamiento explicito en la informacion disponible.

## Casos de uso

- Automatizacion de pruebas en proyectos Lean 4: dado un enunciado `theorem`, el modelo genera una prueba candidata que se pasa al kernel; si compila, se incorpora al proyecto. Adecuado por su formato de salida directamente consumible por Lean.
- Asistencia a matematicos en formalizacion: el modelo propone un plan de prueba en lenguaje natural antes del bloque `lean4`, lo que permite revisar la estrategia antes de verificar.
- Generacion de datos sinteticos para entrenamiento de provers: el modelo puede muestrear multiples pruebas por enunciado (n=8 en la evaluacion del autor) que, tras verificacion con el kernel, sirven como datos de SFT, tal como se hizo en esta misma campana.
- Evaluacion de pipelines de razonamiento formal: sirve como referencia de un checkpoint intermedio de expert iteration para medir si una ronda de entrenamiento aporta mejora (en este caso, no la aporto).
- Investigacion sobre expert iteration y media de pesos: el repositorio documenta el proceso completo (generacion, verificacion, filtrado, LoRA, merge, media) con artefactos de evidencia, util para reproducir o auditar la metodologia.
- Filtrado y seleccion de problemas: el modelo puede generar pruebas para conjuntos de enunciados y usarse para clasificar su dificultad segun la tasa de exito del kernel, alimentando la seleccion por bandas del pipeline.
- No se recomienda como prover de produccion: el propio autor indica que debe usarse Goedel-LM/Goedel-Prover-V2-8B.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index (no verificados de forma independiente, `verified: false`). Evaluacion sobre miniF2F valid split (226 problemas, Lean 4), n=8, temperatura 1.0, limite de 30.000 tokens.

| Metrica | Este modelo (r2) | Base Goedel-Prover-V2-8B | Diferencia |
|---|---|---|---|
| pass@1 | 71,13% (IC 95%: 66,0-76,2) | 71,8% | -0,7 pp |
| pass@8 | 82,74% (187/226) | 83,2% (188/226) | -0,5 pp |
| Prueba de McNemar (exacta) | p = 1,0 | — | sin diferencia significativa |

El autor declara que la regla de parada de la campana selecciono la ronda 1, no esta ronda 2, y que no existe una cifra sobre el split de test en held-out. No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 16,4 GB solo para pesos, mas cache KV; con 40.960 posiciones de contexto y GQA (8 cabezas KV, head_dim 128) el cache KV puede crecer varios GB en contextos largos. En la practica, se recomienda al menos 24 GB para bf16 con contexto moderado.
- GPU recomendadas: NVIDIA L4 (24 GB) es la GPU usada por el autor para generar y evaluar; tambien son adecuadas A100 (40/80 GB), H100 y RTX 4090 (24 GB) para bf16.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) en bf16 con contexto contenido; en GPUs de 16 GB requeriria cuantizacion, que no esta documentada en el repositorio.
- Opciones de despliegue: el autor uso vLLM para el muestreo; al ser un modelo transformers con safetensors, es compatible con TGI (tag `text-generation-inference`) y con llama.cpp/Ollama solo si se generan pesos GGUF, que no se publican.
- Latencia y throughput: no disponibles; el autor solo reporta tiempos agregados de la ronda (6,07 h para generar y verificar 2.400 pruebas con 4× L4), no metricas por token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | miniF2F-valid (pass@8) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Goedel-Prover-V2-8B-EI-campaign1-r2 (este) | 8,19B | 40.960 | 82,7% (187/226) | Apache-2.0 | Hugging Face (viai957) |
| Goedel-Prover-V2-8B (base) | 8,19B | 40.960 | 83,2% (188/226) | Apache-2.0 | Hugging Face (Goedel-LM) |
| Goedel-Prover-V2-8B-EI-campaign1-r1 | 8,19B | 40.960 | no disponible en esta ficha | Apache-2.0 | Hugging Face (viai957) |

No se dispone de datos en la informacion proporcionada para comparar con otros provers de tamano similar (por ejemplo, variantes de DeepSeek-Prover); se indica como no disponible.

## Limitaciones y advertencias

- Resultado negativo documentado: la ronda 2 no mejora al modelo base de forma medible (McNemar exacto p = 1,0); el autor no la recomienda como checkpoint de produccion.
- No existe evaluacion sobre el split de test en held-out; todas las cifras son sobre miniF2F valid.
- El ajuste fino se realizo sobre solo 120 enunciados y 374 filas de SFT, con 24 pasos de optimizador; el alcance del cambio de comportamiento es muy limitado.
- El 88,7% de los elementos del delta del adaptador redondean a cero al fusionar en bf16, lo que reduce aun mas el efecto del entrenamiento.
- Idioma: solo ingles (`en`); los enunciados y la documentacion estan en ingles.
- Especializacion estrecha: el modelo esta disenado para Lean 4 y puede degradarse en tareas generales de texto o en otros asistentes de prueba (Coq, Isabelle, etc.).
- Riesgo de alucinacion: las pruebas generadas pueden ser plausibles pero no compilar; es obligatorio verificar con el kernel de Lean 4 y no confiar en la salida sin comprobacion.
- Dependencia de versiones: la verificacion se hizo con Lean 4 v4.9.0-rc1 y Mathlib d1d1e4b7; otras versiones pueden invalidar pruebas.
- Licencia Apache-2.0 permite uso comercial, pero los datos de origen incluyen Nemotron-Math-Proofs-v1 bajo CC-BY-SA-4.0, lo que conviene revisar si se redistribuyen derivados.
- No se documentan sesgos especificos ni evaluaciones de seguridad; al ser un modelo de matematica formal, el riesgo de sesgo social es bajo pero no se ha medido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/viai957/Goedel-Prover-V2-8B-EI-campaign1-r2
- Modelo base: https://huggingface.co/Goedel-LM/Goedel-Prover-V2-8B
- Ronda 1 de la campana: https://huggingface.co/viai957/Goedel-Prover-V2-8B-EI-campaign1-r1
- Paper referenciado (arXiv:2508.03613): https://arxiv.org/abs/2508.03613
- Dataset Goedel-Pset-v1: https://huggingface.co/datasets/Goedel-LM/Goedel-Pset-v1
- Dataset RL-Goedel-Pset-Level-4-5: https://huggingface.co/datasets/HangHor/RL-Goedel-Pset-Level-4-5
- Dataset FormalMATH-All: https://huggingface.co/datasets/SphereLab/FormalMATH-All
- Dataset NuminaMath-LEAN-Sol: https://huggingface.co/datasets/iiis-lean/NuminaMath-LEAN-Sol
- Dataset Nemotron-Math-Proofs-v1: https://huggingface.co/datasets/nvidia/Nemotron-Math-Proofs-v1
- Mirror de datos usado por el autor: https://huggingface.co/viai957/lean-prover-data
