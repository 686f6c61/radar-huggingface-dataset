# stanfordasl/diet-traj-olmo2-medium-dolma-dense-seed8

## Resumen

DIET trajectory: OLMo2-medium (~305M), Dolma, seed 8 es un modelo de lenguaje entrenado desde cero con la arquitectura OLMo2, publicado por el grupo stanfordasl dentro del proyecto de investigación DIET sobre trayectorias en el espacio de pesos. No es un modelo pensado para uso en producción, sino un artefacto de investigación: forma parte de una colección de ejecuciones de preentrenamiento idénticas en receta y datos que solo difieren en la semilla aleatoria, lo que permite analizar cómo evolucionan los pesos y las representaciones internas a lo largo del entrenamiento.

El modelo tiene aproximadamente 305 millones de parámetros, con una configuración densa (no MoE) de 16 capas, dimensión oculta de 768 y una longitud máxima de posición de 2048 tokens. Se entrenó sobre el mirror comunitario `emozilla/dolma-v1_7-3B` del corpus Dolma v1.7, con un presupuesto de 2000 millones de tokens (2B) y checkpoints guardados cada 100 pasos.

Su relevancia es metodológica: al mantener constante todo salvo la semilla, el repositorio facilita estudios de reproducibilidad, análisis de trayectorias de entrenamiento y comparaciones entre ejecuciones. La licencia Apache 2.0 permite reutilizar los pesos, aunque su valor práctico está en la investigación, no en tareas de inferencia de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | OLMo2 densa (transformer decoder-only) |
| Parametros totales | ~305M |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 2048 tokens (`max_position_embeddings`) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16 safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16), solo pesos; checkpoints en ramas `stepN` |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso con la configuración `olmo2_medium_dense` del repositorio `jjalora/diet-lm`: `hidden_size=768`, `intermediate_size=3072`, `num_hidden_layers=16`, `num_attention_heads=12`, `num_key_value_heads=12` (atención multi-cabeza sin GQA) y `max_position_embeddings=2048`. No emplea mezcla de expertos ni mecanismos híbridos SSM; es una arquitectura estándar de atención completa.

El entrenamiento consistió en preentrenamiento puro de modelado de lenguaje con entropía cruzada (`distillation.teacher_schedule=none`, es decir, sin destilación ni profesor). Se usó AdamW con `lr=3e-5`, betas `(0.9, 0.95)`, weight decay `0.1`, schedule coseno y precisión bf16, sobre GPU H100. Los datos provienen de `emozilla/dolma-v1_7-3B`, muestreado proporcionalmente entre sus componentes y consumido en streaming (sin pre-empaquetado). El presupuesto total fue de 2 000 000 000 tokens con `max_steps=30517` y `save_steps=100`. La única variable que diferencia esta ejecución de las demás de la colección es la semilla (`seed=8`), lo que convierte al modelo en una pieza de un diseño experimental controlado para análisis de trayectorias en el espacio de pesos.

## Capacidades

- Generación de texto autoregresiva básica en inglés, propia de un modelo de 305M entrenado con 2B tokens.
- Modelado de lenguaje y continuación de texto; no se documenta un ajuste instruccional ni de chat.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidad multilingüe limitada al inglés (tag `en`).
- No se documentan modos especiales (thinking, visión, audio) ni capacidades multimodales.
- Utilidad principal como objeto de estudio: checkpoints intermedios en ramas `stepN` para análisis de trayectorias de entrenamiento.

## Casos de uso

- Análisis de trayectorias de entrenamiento: los checkpoints cada 100 pasos permiten estudiar la evolución de los pesos y de las representaciones a lo largo de 30517 pasos, comparando con otras semillas de la misma colección.
- Estudios de reproducibilidad: al diferir solo en la semilla, sirve para cuantificar la varianza entre ejecuciones de preentrenamiento con receta y datos idénticos.
- Investigación en el espacio de pesos: base para experimentos de interpolación, merging o análisis de similitud entre modelos entrenados desde cero.
- Evaluación de recetas de preentrenamiento: al usar streaming de Dolma v1.7 sin pre-empaquetado, permite medir el impacto de esa decisión de pipeline frente a configuraciones alternativas.
- Baseline de scaling a pequeña escala: con ~305M parámetros y 2B tokens, es un punto de referencia económico para estudiar leyes de escala en hardware H100.
- Docencia y experimentación académica: su tamaño reducido y su licencia Apache 2.0 facilitan su uso en cursos y laboratorios de investigación sobre entrenamiento de LLM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 0,6 GB solo para pesos (~305M parámetros × 2 bytes), más memoria para activaciones y caché KV.
- VRAM estimada en cuantización de 8 bits: alrededor de 0,3 GB para pesos; en 4 bits, en torno a 0,15 GB (estimaciones teóricas, no documentadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM para inferencia en bf16; el entrenamiento se realizó en H100 según `run.json`.
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, RTX 4090, entre otras.
- Opciones de despliegue: `transformers` (librería declarada); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, ni pesos GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| stanfordasl/diet-traj-olmo2-medium-dolma-dense-seed8 | ~305M | 2048 | Apache 2.0 | Investigación de trayectorias (OLMo2, Dolma) |
| jjalora/diet-traj-pythia-410m-* | ~410M | no disponible | no disponible | Investigación de trayectorias (Pythia) |
| OLMo2-medium (referencia arquitectónica) | ~305M | 2048 | Apache 2.0 | Modelo base de la familia OLMo2 |

La comparación directa con modelos de producción no es significativa: este checkpoint está diseñado como artefacto experimental. Su alternativa más cercana es la colección `jjalora/diet-traj-pythia-410m-*`, que aplica la misma filosofía de trayectorias sobre la arquitectura Pythia; el presente modelo la extiende a OLMo2 y a datos Dolma.

## Limitaciones y advertencias

- Modelo de investigación sin ajuste instruccional: no está diseñado para chat, agentes ni tareas de producción.
- Entrenado únicamente con 2B tokens, muy por debajo de lo habitual en modelos desplegables; la calidad de generación será limitada y propensa a incoherencias.
- Riesgo elevado de alucinación y de texto incoherente en contextos largos o dominios especializados.
- Contexto máximo de 2048 tokens, insuficiente para muchas aplicaciones reales.
- Solo inglés; no se documenta soporte multilingüe.
- No se documentan evaluaciones de sesgo ni de seguridad; los sesgos del corpus Dolma pueden reflejarse en las salidas.
- No se documentan variantes cuantizadas ni herramientas de despliegue optimizadas (vLLM, llama.cpp), lo que limita su uso fuera de `transformers`.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; el valor del modelo es académico.
- El campo `git_commit` aparece como `unknown` en `run.json`, lo que dificulta la reproducibilidad exacta del código de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/stanfordasl/diet-traj-olmo2-medium-dolma-dense-seed8
- Repositorio de código del proyecto (referenciado en la model card): https://github.com/jjalora/diet-lm
- Colección de referencia con arquitectura Pythia: https://huggingface.co/jjalora/diet-traj-pythia-410m
- Dataset de entrenamiento: https://huggingface.co/datasets/emozilla/dolma-v1_7-3B
