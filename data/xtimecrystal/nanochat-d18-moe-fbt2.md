# xTimeCrystal/nanochat-d18-moe-fbt2

## Resumen

nanochat-d18-moe-fbt2 es un modelo de lenguaje base entrenado desde cero por el autor independiente xTimeCrystal, usando un fork del proyecto nanochat de Andrej Karpathy. Se trata de un experimento de investigación que combina tres innovaciones arquitectónicas poco habituales: una mezcla de expertos dispersa (MoE) con un experto compartido, un flujo residual basado en atención (AttnRes) y un mecanismo de retroalimentación (Feedback Transformer, FBT) que ejecuta la red dos veces por paso de entrenamiento. El modelo tiene 18 capas, anchura 1152, atención de contexto completo y un vocabulario de 32768 tokens sobre secuencias de 2048.

El modelo cuenta con 1.035B parámetros totales, de los cuales 324M son parámetros de escalado (la cifra que el autor usa para la ratio tokens:parámetros). Fue entrenado con 7.79B tokens del dataset ClimbMix, exactamente 24 tokens por parámetro de escalado, en 7.425 pasos sobre 8 GPU RTX 5090 durante aproximadamente 11 horas. El resultado final es una perplejidad de validación de 0.7059 bpb y una puntuación CORE de 0.2765.

Su relevancia es fundamentalmente metodológica: demuestra que es posible entrenar un transformer con retroalimentación iterativa y MoE en hardware de consumo (RTX 5090) en menos de 12 horas, y publica el código exacto de entrenamiento junto con los pesos, lo que facilita la reproducibilidad y el estudio de estas variantes arquitectónicas. No obstante, es un modelo base sin ajuste de instrucciones, con capacidades limitadas y sin benchmarks estándar publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con MoE, AttnRes y Feedback Transformer (FBT, K=2) |
| Parametros totales | 1.035B |
| Parametros activos | 324M (parámetros de escalado; MoE top-8 de 64 expertos + 1 compartido) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible (pesos en punto flotante, probablemente bf16; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (entrenado sobre ClimbMix, mayoritariamente inglés) |
| Licencia | MIT |
| Formato de pesos | PyTorch state dict (`model_007425.pt`), no safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de 18 capas con anchura 1152, 9 cabezas de 128 dimensiones y atención de contexto completo (patrón de ventana `L`), sin value embeddings y con vocabulario de 32768 tokens. El flujo residual es de tipo AttnRes: cada subcapa lee una mezcla ponderada por atención de las salidas anteriores, en lugar de una suma residual convencional. La capa MLP es una mezcla de expertos sin dropout, con un experto compartido de anchura 2304 y 64 expertos enrutados de anchura 288, activando los top-8 por token.

El mecanismo de retroalimentación (FBT, K=2) ejecuta la red dos veces sobre la secuencia en cada paso de entrenamiento. En la segunda pasada, la entrada en la posición t es `norm(W_s h_{t-1} + W_t x_t)`, donde `h_{t-1}` es el estado final de la posición anterior en la primera pasada. La posición 0 y los inicios de documento usan el embedding simple. La pérdida se calcula sobre ambas pasadas. En inferencia, las dos pasadas equivalen a la forma paralela (Jacobi) de la decodificación serial, que coincide en el punto fijo.

El entrenamiento usó el dataset ClimbMix (`karpathy/climbmix-400b-shuffle`) con 7.79B tokens, en 7.425 pasos de 1.048.576 tokens, sobre 8 RTX 5090 durante 664,8 minutos. No se documenta RLHF, DPO ni ajuste de instrucciones; es un modelo puramente base. El código de entrenamiento se publica exactamente como se ejecutó, con verificación de carga estricta y logits bit-idénticos.

## Capacidades

- Generación de texto autoregresiva como modelo base (no ajustado para instrucciones).
- Razonamiento y conocimiento general limitados por el tamaño y los datos de entrenamiento.
- Capacidad de código y matemáticas no evaluada ni documentada.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no documentadas; el dataset ClimbMix es predominantemente inglés.
- Capacidades especiales: modo de retroalimentación iterativa (FBT) que puede ejecutarse en forma paralela o serial; MoE con enrutamiento top-8; sin visión ni audio.

## Casos de uso

- Investigación sobre arquitecturas de retroalimentación: el modelo permite estudiar el efecto del Feedback Transformer (K=2) en un transformer de tamaño medio, comparando la forma paralela y serial de decodificación gracias al código publicado.
- Estudio de MoE de bajo presupuesto: con 324M parámetros activos y 64 expertos enrutados, sirve para analizar el enrutamiento y el equilibrio de carga en hardware de consumo.
- Reproducción de experimentos: el repositorio incluye el script `run_12h.sh` y el código exacto, lo que permite replicar el entrenamiento en 8 RTX 5090 en menos de 12 horas.
- Base para fine-tuning: al ser un modelo base con licencia MIT, puede servir como punto de partida para ajuste supervisado en tareas específicas de dominio.
- Evaluación de AttnRes: permite comparar el flujo residual basado en atención frente a sumas residuales convencionales en tareas de modelado de lenguaje.
- Docencia y formación: útil para ilustrar cómo se entrena un LLM desde cero con técnicas modernas (MoE, FBT, AttnRes) en un entorno de recursos limitados.
- Experimentos de decodificación especulativa o paralela: la equivalencia entre las dos pasadas en el punto fijo abre la puerta a estudiar esquemas de decodificación iterativa.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Validation bpb | 0.7059 (split de validación de base_train, 41.9M tokens) |
| CORE | 0.2765 (máximo 500 ejemplos por tarea) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. No se dispone de comparaciones con modelos similares en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,1 GB en bf16 para los 1.035B parámetros (sin contar activaciones ni caché KV); con cuantización a 8 bits rondaría 1,1 GB y a 4 bits unos 0,6 GB, aunque no se documentan cuantizaciones oficiales.
- GPU recomendadas: el entrenamiento usó 8 RTX 5090; para inferencia basta una GPU consumer con al menos 4-6 GB de VRAM (RTX 3060, RTX 4060, RTX 4090).
- Cabe en GPU consumer: sí, en la mayoría de GPU modernas con 8 GB o más.
- Opciones de despliegue: el modelo se carga con PyTorch y el código de nanochat; no hay soporte documentado para vLLM, llama.cpp, Ollama o TGI. Sin GPU Hopper es necesario desactivar Flash Attention 3 (`USE_FA3 = False`) y usar la ruta SDPA; los kernels Triton de AttnRes requieren GPU CUDA y bf16.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| nanochat-d18-moe-fbt2 | 1.035B (324M activos) | 2048 | MIT | PyTorch | FBT K=2, AttnRes, MoE top-8 |
| nanochat base (Karpathy) | ~1B (configurable) | 2048 | MIT | PyTorch | Sin FBT ni AttnRes; referencia del fork |
| Modelos tipo Llama 3.2 1B | 1.24B | 128k | Llama 3.2 | safetensors, GGUF | Ajustado para instrucciones, multilingüe |
| Qwen2.5 1.5B | 1.54B | 32k | Apache 2.0 | safetensors, GGUF | Multilingüe, benchmarks publicados |

No se dispone de comparaciones de rendimiento directas con estos modelos en la información proporcionada. La comparativa es estructural y de licencia.

## Limitaciones y advertencias

- Es un modelo base sin ajuste de instrucciones: no sigue instrucciones de forma fiable ni mantiene conversaciones multi-turno.
- Riesgo elevado de alucinación y de generar texto incoherente en tareas abiertas, dado su tamaño y su entrenamiento limitado a 7.79B tokens.
- Contexto corto (2048 tokens), insuficiente para documentos largos o conversaciones extensas.
- Idiomas: no se documenta soporte multilingüe; el dataset ClimbMix es mayoritariamente inglés, por lo que el rendimiento en castellano será previsiblemente pobre.
- Sin benchmarks estándar publicados: no hay evidencia de rendimiento en MMLU, HumanEval o GSM8K.
- Restricciones de licencia: MIT permite uso comercial, pero el modelo no está validado para producción.
- Dependencia de kernels Triton y CUDA para AttnRes; sin GPU Hopper hay que usar la ruta SDPA, con posible pérdida de rendimiento.
- El estado del optimizador no se incluye, lo que limita la reanudación exacta del entrenamiento.
- Sesgos conocidos: no documentados, pero heredados del dataset ClimbMix (texto web en inglés).

## Enlaces

- Hugging Face: https://huggingface.co/xTimeCrystal/nanochat-d18-moe-fbt2
- Repositorio nanochat (Karpathy): https://github.com/karpathy/nanochat
- Dataset ClimbMix: https://huggingface.co/datasets/karpathy/climbmix-400b-shuffle
- Commit de referencia nanochat-dl: `7077788` (mencionado en la model card, sin URL directa disponible)
