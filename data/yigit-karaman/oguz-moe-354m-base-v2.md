# Yigit-Karaman/Oguz-MoE-354M-Base-V2

## Resumen

Oğuz-MoE-354M-Base-v2 es un modelo de lenguaje de tipo base (solo preentrenado, sin ajuste por instrucciones) publicado en HuggingFace por el usuario Yigit-Karaman bajo licencia Apache 2.0. Se trata de un transformer decoder de estilo LLaMA con capas feed-forward de mezcla de expertos (MoE) dispersa: 4 expertos por capa con enrutado top-2, 21 capas, tamaño oculto 576 y un vocabulario de 50.257 tokens. Acumula 354.161.748 parámetros totales y aproximadamente 205,5 millones de parámetros activos por token, con pesos en bfloat16.

El modelo está especializado exclusivamente en turco (escritura latina) y su interés es fundamentalmente metodológico: documenta una cadena completa de *upcycling* que parte de un LLaMA denso de 80M entrenado desde cero, atraviesa dos fases de *depth upscaling* (12 → 17 → 21 capas) y culmina en la conversión del FFN denso en 4 expertos MoE. La versión v2 añade 150M tokens de *healing* MoE (300M acumulados, ~150M tokens enrutados por experto) y una nueva fase con contexto de 2048 tokens.

Es relevante ahora porque publica análisis cuantitativos poco habituales en este rango de tamaño (divergencia entre expertos, equilibrio de carga, deriva respecto al FFN original) y porque demuestra que un MoE con contexto 2048 puede entrenarse e inferirse en una GPU de consumo de 8 GB sin *offloading* a memoria del sistema.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo LLaMA con FFN SwiGLU de mezcla de expertos (MoE); clase custom `MoeLlamaForCausalLM` |
| Parámetros totales | 354.161.748 (354,2 M) |
| Parámetros activos | ~205,5 M por token (top-2 de 4 expertos) |
| Longitud de contexto | 2048 tokens (`max_position_embeddings`); v1 entrenada hasta 1024 |
| Tipos de cuantización | No disponible: solo se publica el checkpoint en bfloat16; no hay GGUF, GPTQ, AWQ ni otras cuantizaciones oficiales |
| Idiomas soportados | Turco (escritura latina) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, con código custom (`trust_remote_code=True` obligatorio) |
| Capas del decoder | 21 |
| Tamaño oculto | 576 |
| Cabezas de atención | 8 (dimensión de cabeza 72) |
| Expertos por capa | 4, enrutado top-2, intermedio de experto 2048 |
| Vocabulario | 50.257 (BPE estilo GPT-2, tokenizador turco) |
| Embeddings | Atados (embeddings de entrada = cabeza LM) |
| Precisión | bfloat16 |
| Tamaño del repositorio | 0,7 GB |

## Arquitectura y entrenamiento

La arquitectura es un decoder LLaMA con atención causal de 8 cabezas y FFN sustituido por una capa MoE: 4 expertos por capa con intermedio de 2048 y enrutado top-2, de modo que cada token activa aproximadamente el 58% de los parámetros totales. Los embeddings están atados a la cabeza de lenguaje. El modelo se carga con `MoeLlamaForCausalLM`, una implementación custom incluida en el repositorio, por lo que requiere `trust_remote_code=True`. La model card marca el campo `inference: false`.

El entrenamiento sigue una linaje de cuatro etapas sobre un total de ~2,35B tokens expuestos: (0) preentrenamiento desde cero de un LLaMA denso de 12 capas y 80M de parámetros con 1,60B tokens; (1) *depth upscaling* de 12 a 17 capas mediante duplicación intercalada con ruido de ruptura de simetría y *healing* de 250M tokens; (2) segundo *upscaling* de 17 a 21 capas con 200M tokens de *healing*; (3) *upcycle* del FFN denso (1536) a 4 expertos (2048) con inicialización casi preservadora de función y 150M tokens de *healing*, dando lugar a la v1; y (4) *continued healing* de la v1 con 150M tokens adicionales (40% contexto 512, 40% contexto 1024, 20% contexto 2048) y LR 1e-4 coseno, dando lugar a la v2. El corpus es una mezcla intercalada con semilla 4242361: 30% Cosmos-Turkish-Corpus-v1.0 y 70% FineWeb-2 (`tur_Latn`), tokenizado *offline* en un binario plano `uint16` de 1,6B tokens con el tokenizador `ytu-ce-cosmos/turkish-gpt2`.

Cambios de v1 a v2:

| Aspecto | v1 | v2 |
|---|---|---|
| Tokens acumulados de *healing* MoE | 150M | 300M |
| Tokens enrutados por experto | ~75M | ~150M |
| Gradient checkpointing | Desactivado | Activado (`use_reentrant=False`) |
| Contexto máximo entrenado | 1024 | 2048 (20% de los tokens de v2) |
| Learning rate de *healing* | 3e-4 coseno | 1e-4 coseno (continuado) |
| Equilibrio de carga de expertos (EMA) | 23–28% | 23–26% |
| Rango de *aux loss* | 1,00–1,03 | 1,01–1,04 |
| Throughput (RTX 4060) | 7.200–9.400 tok/s | 6.000–8.300 tok/s (con checkpointing) |

Análisis de divergencia entre expertos publicado por el autor:

| Métrica | v1 (150M tokens) | v2 (300M tokens) | Δ |
|---|---|---|---|
| Coseno medio entre pares de expertos | 0,8941 | 0,8882 | −0,0059 |
| Coseno mínimo entre pares de expertos | 0,8046 | 0,7993 | −0,0053 |
| Deriva media frente al FFN denso | 0,2613 | 0,2730 | +0,0117 |
| Deriva máxima frente al FFN denso | 0,4855 | 0,4909 | +0,0054 |
| Ratio de actividad de nuevas dimensiones | 0,2312 | 0,2361 | +0,0049 |

El monitor interno (coseno entre pares de `down_proj` en las capas 0/10/20, cada 500 pasos) descendió de 0,8803 a 0,8736 y se estabilizó en los últimos ~10.000 pasos. La conclusión del autor es que duplicar el presupuesto de tokens por experto produce una ortogonalización continuada pero con rendimientos muy decrecientes: los expertos top-2-de-4 procedentes de *upcycling* siguen comportándose como *ensembles* parcialmente especializados y no como rutas sintácticas o de dominio plenamente diferenciadas. La divergencia se concentra en `down_proj`/`up_proj` y en las capas intermedias (deriva máxima por experto de 0,49 en la capa 6), mientras que las proyecciones de *gate* son las más similares (0,91–0,94). Los informes por capa están en `divergence_baseline.json` y `divergence_final.json`.

## Capacidades

- Generación de texto y completado de secuencias en turco; es un *base model*, no sigue instrucciones ni mantiene diálogo.
- Modelado de lenguaje causal puro: adecuado para *prompting* por continuación, no para formato pregunta-respuesta.
- Comprensión y producción de texto en turco con escritura latina, usando un tokenizador BPE específico de turco (50.257 tokens).
- Soporte de *tool calling* / *function calling*: no disponible (requiere ajuste por instrucciones o plantillas de chat que el modelo no incorpora).
- Soporte de agentes y razonamiento multi-paso: no disponible por diseño; no hay modo *thinking* ni RLHF/DPO.
- Capacidades multilingües: no disponibles más allá del turco; el vocabulario y el corpus son monolingües.
- Capacidades de visión, audio o multimodalidad: no disponibles.
- Capacidad especial: arquitectura MoE con enrutado top-2 sobre 4 expertos, útil como banco de pruebas para estudiar especialización de expertos, equilibrio de carga y *upcycling*.

## Casos de uso

- Investigación sobre *upcycling* denso→MoE: el modelo publica checkpoints intermedios, curvas de divergencia entre expertos e informes por capa, lo que permite reproducir y auditar experimentalmente el efecto de duplicar el presupuesto de tokens de *healing*.
- *Fine-tuning* como base turca de bajo coste: con 354M parámetros totales y ~205M activos se puede ajustar por instrucciones o para tareas concretas (clasificación, resumen, extracción) en una única GPU de consumo.
- Generación de datos sintéticos en turco: al ser un modelo de completado, puede producir texto de dominio específico para aumentar corpus turcos pequeños antes de entrenar modelos mayores.
- Autocompletado y asistencia de escritura en turco: integrable en editores o formularios para sugerir continuaciones, con la ventaja de que el *checkpoint* en bfloat16 ocupa menos de 1 GB.
- Evaluación de despliegue MoE en *hardware* limitado: sirve como caso de referencia para medir latencia, memoria y estabilidad de un MoE disperso en GPUs de 8 GB o incluso en CPU.
- Prototipado de tokenizadores y *pipelines* turcos: permite validar rápidamente decisiones de tokenización (`ytu-ce-cosmos/turkish-gpt2`) y de limpieza de corpus antes de escalar a modelos de mayor tamaño.
- Experimentación académica sobre equilibrio de enrutado: el rango de *aux loss* (1,01–1,04) y el equilibrio EMA por experto (23–26%) ofrecen una línea base medible para comparar variantes de *load balancing*.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni de evaluaciones estándar en turco para este modelo. Las únicas métricas publicadas son de monitorización de entrenamiento y de divergencia de expertos, no comparables con benchmarks de calidad:

| Métrica operativa | Valor |
|---|---|
| Tokens totales expuestos (todas las etapas) | ~2,35B |
| Tokens de *healing* MoE acumulados | 300M |
| Tokens enrutados por experto | ~150M |
| Equilibrio de carga EMA por experto | 23–26% |
| Rango de *aux loss* | 1,01–1,04 |
| Throughput en RTX 4060 (v2) | 6.000–8.300 tok/s |
| Throughput en RTX 4060 (v1) | 7.200–9.400 tok/s |

## Requisitos de hardware

- Pesos oficiales en bfloat16: ~0,7 GB de checkpoint, factible de cargar completo en VRAM de cualquier GPU moderna.
- VRAM estimada para inferencia: alrededor de 1 GB en bfloat16 contando activaciones y *overhead* de la implementación custom; ~0,4 GB si se cuantiza a int8 y ~0,25 GB a 4 bits mediante herramientas genéricas (no hay cuantizaciones oficiales publicadas).
- GPU recomendadas: cualquier GPU con 4 GB o más (RTX 3050, RTX 4060, GTX 1650); no requiere A100/H100. El autor reporta entrenamiento en una RTX 4060 de 8 GB.
- Cabe en GPU de consumo: sí, con holgura; también es viable la inferencia en CPU, dado el tamaño del modelo.
- VRAM de entrenamiento medida por el autor (RTX 4060, 8 GB, sin *offloading*): 3,56 GB con 8 secuencias de 512 tokens, 4,30 GB con 4×1024 y 4,30 GB con 2×2048.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (ruta documentada). No hay soporte documentado ni archivos publicados para vLLM, llama.cpp, Ollama o TGI; la arquitectura `MoeLlamaForCausalLM` es custom y no se han distribuido conversiones GGUF.
- Latencia y throughput: 6.000–8.300 tokens/s medidos en RTX 4060 durante el entrenamiento de la v2 (con *gradient checkpointing* activado), y 7.200–9.400 tokens/s en la v1. El modelo usa 8-bit AdamW en entrenamiento y sobrevivió a tres interrupciones con reanudación correcta de pesos, estado del optimizador, planificador y desplazamiento de tokens.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de contexto que permitan comparar este modelo con alternativas externas publicadas. La comparación con su linaje directo, extraída de la model card, es la siguiente:

| Modelo | Parámetros | Activos/token | Contexto | Tokens de *healing* MoE | Licencia |
|---|---|---|---|---|---|
| Oğuz-MoE-354M-Base-v2 | 354,2 M | ~205,5 M | 2048 | 300M | Apache 2.0 |
| Oğuz-MoE-354M-Base (v1) | 354,2 M | ~205,5 M | 1024 | 150M | Apache 2.0 |
| Etapa 2 (denso, 21 capas) | ~112 M | ~112 M | no disponible | no aplica | Apache 2.0 (linaje) |
| Etapa 1 (denso, 17 capas) | ~110 M | ~110 M | no disponible | no aplica | Apache 2.0 (linaje) |
| LLaMA denso inicial (12 capas) | ~80 M | ~80 M | no disponible | no aplica | Apache 2.0 (linaje) |

Comparativa con modelos de terceros de tamaño o tarea similares: no disponible.

## Limitaciones y advertencias

- Es un modelo exclusivamente preentrenado: no sigue instrucciones, no mantiene conversaciones, no soporta *tool calling* ni agentes. Usarlo como asistente requiere *fine-tuning* previo.
- No hay ningún benchmark publicado, por lo que su calidad real en tareas turcas es desconocida y no verificable más allá de las métricas internas de entrenamiento.
- Modelo monolingüe en turco: la tokenización y el corpus no cubren otros idiomas, con degradación severa fuera del turco.
- Contexto limitado a 2048 tokens, insuficiente para casos de documento largo, análisis de repositorios o conversaciones extensas.
- Tamaño pequeño (354M totales, ~205M activos): alta propensión a la alucinación y baja fiabilidad factual; no es apto para producción crítica sin verificación externa y ajuste específico.
- Según el propio autor, los expertos son «*ensembles* parcialmente especializados» con coseno medio entre pares de 0,8882, es decir, la especialización por dominio o sintaxis es limitada y el beneficio del enrutado puede ser marginal frente a un FFN denso de parámetros equivalentes.
- Arquitectura custom: exige `trust_remote_code=True`, lo que implica ejecutar código del repositorio del autor y añade riesgo de seguridad y dependencia de mantenimiento externo. La model card declara `inference: false`.
- Sin cuantizaciones oficiales ni soporte confirmado en motores de inferencia habituales (vLLM, llama.cpp, TGI, Ollama), lo que complica el despliegue en producción.
- Riesgo de sesgos procedente de los corpus FineWeb-2 (`tur_Latn`) y Cosmos-Turkish-Corpus-v1.0: el autor no publica análisis de sesgos, toxicidad ni filtrado de datos.
- Licencia Apache 2.0: permite uso comercial y modificación sin restricciones adicionales, pero se ofrece sin garantías de ningún tipo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Yigit-Karaman/Oguz-MoE-354M-Base-V2
- Modelo base (v1): https://huggingface.co/Yigit-Karaman/Oguz-MoE-354M-Base
- Tokenizador: https://huggingface.co/ytu-ce-cosmos/turkish-gpt2
- Dataset Cosmos-Turkish-Corpus-v1.0: https://huggingface.co/datasets/ytu-ce-cosmos/Cosmos-Turkish-Corpus-v1.0
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Informes de divergencia por capa: `divergence_baseline.json` y `divergence_final.json` en el repositorio de HuggingFace del modelo
- Búsqueda web: no se han encontrado enlaces relevantes sobre el modelo, la arquitectura o el autor. Los resultados devueltos por el buscador corresponden al nombre propio turco «Yiğit» (páginas de onomástica, una empresa francesa y biografías de personas) y no guardan relación con este modelo.
