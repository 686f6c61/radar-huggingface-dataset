# SupraLabs/Supra2.6-Pico

## Resumen

Supra2.6 Pico es un modelo de lenguaje ultrapequeño preentrenado desde cero por SupraLabs, con exactamente 2.972.496 parámetros (menos de 3 millones) y una ventana de contexto de 1.024 tokens. Su interés no radica en la utilidad práctica como asistente —el propio autor advierte explícitamente de que no es utilizable para tareas generales ni de producción—, sino como vehículo de investigación sobre arquitecturas híbridas a escala mínima: combina bloques de atención lineal GDN-2 (gated delta net de segunda generación, emparentada con Mamba) con bloques de atención global GQA con puerta sigmoide, además de residuos de atención aprendidos entre capas.

El modelo se entrenó con unos 10.000 millones de tokens sobre una única GPU RTX Pro 6000 Blackwell, usando el optimizador Muon para las matrices 2-D y AdamW para embeddings y normas. Se publica bajo licencia Apache 2.0 con pesos en safetensors y un `model.pt` de solo 11,9 MB, lo que lo hace ideal para experimentación en CPU, estudios de scaling laws, ablation studies y benchmarks de modelos minúsculos (aparece asociado al open-slm-leaderboard). Es un modelo base, sin ajuste por instrucciones ni alineación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida GDN-2 (atencion lineal) + gated GQA, 8 capas, patron [GDN-2, GDN-2, GDN-2, gated GQA] x 2 |
| Parametros totales | 2.972.496 (unicos); 3.562.320 contando el embedding atado dos veces |
| Parametros activos | No aplica (no es MoE); 2.382.672 sin contar embeddings |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | No disponible (pesos en fp32, entrenado con autocast bf16) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (model.safetensors) y model.pt (11,9 MB, PyTorch) |

## Arquitectura y entrenamiento

La red consta de 8 bloques en dos grupos identicos de cuatro: tres bloques gated-delta-net (GDN-2) seguidos de un bloque de atencion agrupada de consultas (GQA) con puerta. Esto significa que 6 de las 8 capas usan recurrencia de tiempo lineal (estilo Mamba/linear attention) y solo 2 llevan atencion global. GDN-2 emplea la recurrencia de borrado/escritura por canal `S_t = (I − k_t (b_t ⊙ k_t)ᵀ) Diag(exp(g_t)) S_{t−1} + k_t (w_t ⊙ v_t)ᵀ`, implementada con el kernel chunked de la libreria `fla` (fla-core 0.6.0, Triton). El bloque GQA usa 3 cabezas de consulta y 1 cabeza KV (head_dim 48), RoPE en 24 dimensiones, RMSNorm en q/k y puerta sigmoide de salida. Una innovacion destacable es el mecanismo de attention residuals: cada capa puede leer una mezcla softmax aprendida sobre las salidas de todas las capas previas. La dimensionalidad del modelo es d_model 144 con FFN SwiGLU de 352, vocabulario BPE de 4.096 tokens y embeddings atados entrada/salida.

El entrenamiento empleo 9.998.172.160 tokens (38.140 pasos de 262.144 tokens cada uno), con cada fuente del dataset muestreada como maximo una epoca. La mezcla esta dominada por datos web y sinteticos de calidad: ClimbMix (36,3%), Cosmopedia v2 (19,5%), Ultra-FineWeb L2 HQ (19,5%) y TxT360-v2 (13,6%), mas una coleccion de datasets matematicos (open-web-math, OpenMathInstruct-2, NuminaMath-CoT, orca-math, GSM8K) que suman en torno al 10,5%, y pequenas dosis de TinyStories y OpenStax. Se uso el optimizador Muon (lr 0,02, momentum 0,95, 5 pasos de Newton-Schulz) para matrices 2-D y AdamW (lr 6e-3) para embeddings y normas, con warmup lineal de 10.000 pasos, clipping de gradiente a 1,0, precision bf16 con pesos maestros en fp32, sobre una unica RTX Pro 6000 Blackwell. No hubo RLHF ni DPO: es un modelo base preentrenado. El autor pide disculpas publicamente por problemas de "benchmaxing" (sobreajuste al benchmark) en la version anterior 2.5 Pico.

## Capacidades

- Modelado de lenguaje basico en ingles (text-generation y text-completion), con rendimiento modesto incluso para su tamano.
- Cierto grado de aritmetica y razonamiento matematico elemental, gracias a la inclusion de datasets matematicos en la mezcla (Arithmark-3: 38,10).
- Comprension de sentido comun a nivel de completado (PIQA 56,09, HellaSwag 26,40).
- Ejecucion en CPU: version en PyTorch puro (`model_h_local.py` + `gdn2_ref.py`) sin dependencia de Triton/GPU.
- No soporta tool calling, function calling, agentes, ni modos de razonamiento (thinking): es un modelo base sin alineacion.
- No es multimodal; solo texto en ingles.

## Casos de uso

- Investigacion en arquitecturas hibridas: estudiar el comportamiento de GDN-2 frente a atencion global en una red de 8 capas que se ejecuta en segundos, ideal para ablation studies.
- Experimentos de scaling laws: su tamano minimo permite entrenar variantes rapidamente y comparar curvas de perdida frente a modelos de 10M, 50M o 100M parametros.
- Benchmarking de kernels: probar y depurar implementaciones chunked de atencion lineal (fla/Triton) contra la referencia en PyTorch puro incluida en el repo.
- Educacion y docencia: codigo legible de un transformer hibrido completo, con receta de entrenamiento reproducible (seed 0) y presupuesto de una sola GPU.
- Prototipado de optimizadores: evaluar Muon frente a AdamW en un modelo que entrena en horas, no en semanas.
- Generacion de texto juguete en CPU o en dispositivos con recursos extremadamente limitados (11,9 MB de pesos), por ejemplo demos embebidas o tests de latencia.
- Punto de partida para fine-tuning experimental (por ejemplo, distillation o datasets pequenos) donde el coste de iterar es minimo.

El propio autor subraya que no es utilizable como asistente general, chatbot ni para tareas de produccion.

## Benchmarks y rendimiento

Evaluados con log-likelihood y normalizacion por longitud (acc_norm):

| Benchmark | Score | Items |
|---|---|---|
| HellaSwag | 26,40 | 10.042 |
| ARC-Easy | 33,54 | 2.376 |
| ARC-Challenge | 23,21 | 1.172 |
| PIQA | 56,09 | 1.838 |
| Arithmark-3 | 38,10 | 1.000 |
| Index (metrica propia) | 8,192 | — |

Scores acc sin normalizar del mismo checkpoint: HellaSwag 26,49, ARC-Easy 33,50, ARC-Challenge 17,92, PIQA 56,91, Arithmark-3 38,10. No hay comparacion directa publicada con otros modelos en la informacion disponible; para referencia, estos valores son muy inferiores a los de modelos de 100M-1B parametros tipicos (que superan 50-70 en HellaSwag), coherente con su escala sub-3M.

## Requisitos de hardware

- VRAM para inferencia: practicamente insignificante; los pesos ocupan unos 11,9 MB en fp32, por lo que cualquier GPU moderna o incluso solo CPU es suficiente.
- Consumer GPUs: cualquiera sirve (incluso integradas); no se necesita GPU dedicada. La version `model_h_local.py` funciona en maquinas solo CPU.
- Entrenamiento (reproducir la receta original): 1x NVIDIA RTX Pro 6000 Blackwell con 20 vCPU; una GPU de gama alta con ~48 GB de VRAM deberia bastar dado el tamano del modelo.
- Despliegue: sin soporte nativo de vLLM, TGI u Ollama documentado; el uso es directo con PyTorch 2.x y la libreria `tokenizers` (codigo de ejemplo en el repo con `model_h.py` o `model_h_local.py`).
- Latencia y throughput: no disponibles; dada la arquitectura mayoritariamente lineal (d_model 144, 8 capas) y el tamano minimo, la inferencia por token es muy rapida incluso en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia |
|---|---|---|---|---|
| Supra2.6 Pico | 2,97M | 1.024 | Hibrida GDN-2 + gated GQA | Apache 2.0 |
| SmolLM2-135M (HuggingFaceTB) | 135M | 8.192 | Transformer decoder (GQA) | Apache 2.0 |
| Qwen2.5-0.5B | 494M | 32.768 | Transformer decoder (GQA) | Qwen Research / Apache 2.0 (variantes) |
| Llama 3.2 1B | 1.240M | 128.000 | Transformer decoder (GQA) | Licencia Llama 3.2 |

Supra2.6 Pico es entre 45 y 400 veces mas pequeno que estas alternativas, con benchmarks muy por debajo de todas ellas; su valor comparativo esta en la arquitectura hibrida con atencion lineal y en el coste de experimentacion, no en calidad de generacion. No hay datos de benchmarks comparativos directos publicados en la informacion disponible.

## Limitaciones y advertencias

- El autor lo declara explicitamente no utilizable como asistente general, chatbot ni para ninguna tarea de produccion.
- Riesgo de alucinacion y de texto incoherente muy alto: con menos de 3M de parametros y sin alineacion, la generacion es de calidad juguete.
- Solo ingles; no hay soporte multilingue ni de castellano.
- Contexto de solo 1.024 tokens, insuficiente para documentos largos o conversaciones multi-turno.
- El autor reconoce problemas de "benchmaxing" (contaminacion/sobreajuste al benchmark) en la version anterior 2.5 Pico; conviene interpretar los scores con cautela.
- Vocabulario minimo de 4.096 tokens BPE, lo que limita la eficiencia de tokenizacion en texto real.
- Pesos en fp32 y formato no estandar (state dict de PyTorch con `model.pt`); cargar `model.safetensors` requiere `strict=False`, y no hay integracion con transformers, vLLM ni cuantizacion.
- Sesgos: no disponible; al tratarse de un modelo base entrenado mayoritariamente con datos web sin filtrado de seguridad documentado, puede reproducir contenido sesgado u ofensivo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SupraLabs/Supra2.6-Pico
- Datasets de entrenamiento:
  - https://huggingface.co/datasets/karpathy/climbmix-400b-shuffle
  - https://huggingface.co/datasets/HuggingFaceTB/smollm-corpus
  - https://huggingface.co/datasets/openbmb/Ultra-FineWeb
  - https://huggingface.co/datasets/IFM/TxT360-v2
  - https://huggingface.co/datasets/open-web-math/open-web-math
  - https://huggingface.co/datasets/nvidia/OpenMathInstruct-2
  - https://huggingface.co/datasets/AI-MO/NuminaMath-CoT
  - https://huggingface.co/datasets/roneneldan/TinyStories
  - https://huggingface.co/datasets/crumb/openstax-text
  - https://huggingface.co/datasets/microsoft/orca-math-word-problems-200k
  - https://huggingface.co/datasets/openai/gsm8k
