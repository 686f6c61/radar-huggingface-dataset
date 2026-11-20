# stanfordasl/diet-traj-olmo2-medium-dolma-dense-seed9

## Resumen

El modelo `stanfordasl/diet-traj-olmo2-medium-dolma-dense-seed9` es un checkpoint de investigación publicado por el grupo Stanford ASL dentro del proyecto DIET de análisis del espacio de pesos (weight-space). No se trata de un modelo de propósito general afinado para tareas, sino de una ejecución de preentrenamiento desde cero con arquitectura OLMo2 sobre el corpus Dolma v1.7, diseñada para estudiar trayectorias de entrenamiento. Concretamente, esta es la semilla 9 de una colección en la que solo varía el seed aleatorio, lo que permite comparar cómo divergen o convergen distintas ejecuciones con idéntica receta.

El modelo tiene aproximadamente 305 millones de parámetros en configuración densa (hidden_size 768, 16 capas, 12 cabezas de atención, intermediate_size 3072) y una longitud máxima de posición de 2048 tokens. Se entrenó con objetivos puramente de lenguaje (cross-entropy, sin destilación ni teacher schedule) sobre un presupuesto de 2.000 millones de tokens muestreados en streaming del mirror `emozilla/dolma-v1_7-3B`, con AdamW, learning rate 3e-5 y precisión bf16.

Su relevancia es metodológica más que de producto: sirve como material de referencia para estudiar dinámicas de entrenamiento, comparar semillas, analizar geometrías de pesos y validar técnicas de análisis de trayectorias. No está pensado para despliegue en producción ni para tareas downstream sin un ajuste posterior, y su model card no documenta evaluaciones de capacidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo OLMo2 (denso) |
| Parametros totales | ~305M |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 2048 tokens (`max_position_embeddings=2048`) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16 safetensors) |
| Idiomas soportados | ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16); checkpoints por rama `stepN` |
| hidden_size | 768 |
| intermediate_size | 3072 |
| num_hidden_layers | 16 |
| num_attention_heads | 12 |
| num_key_value_heads | 12 |
| Presupuesto de tokens | 2.000.000.000 (2B) |
| max_steps | 30517 |
| save_steps | 100 |
| Dataset | `emozilla/dolma-v1_7-3B` (streamed) |
| Semilla | 9 |
| Hardware de entrenamiento | H100 (cluster "makau") |
| Tamano del repo | 17,1 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only denso con la configuración OLMo2 definida en `configs/model/olmo2_medium_dense.yaml` del repositorio `jjalora/diet-lm`. Emplea 16 capas con hidden_size 768, FFN de 3072 y atención multi-cabeza con 12 cabezas de query y 12 de key/value (sin GQA). La ventana de contexto es de 2048 posiciones. El modelo no incorpora componentes MoE ni mecanismos híbridos SSM.

El entrenamiento es un preentrenamiento puro de modelado de lenguaje con cross-entropy, sin destilación (`distillation.teacher_schedule=none` en `src/run_distillation.py`). Se usó AdamW con lr=3e-5, betas (0.9, 0.95), weight decay 0.1, scheduler coseno y precisión bf16. Los datos provienen de `emozilla/dolma-v1_7-3B`, un mirror comunitario en Hugging Face de Dolma v1.7 muestreado proporcionalmente entre sus componentes y consumido en streaming (sin pre-empaquetado). El presupuesto total fue de 2B tokens repartidos en 30.517 pasos, con checkpoints cada 100 pasos almacenados en ramas `stepN` (solo pesos). La innovación metodológica del proyecto DIET es precisamente el control experimental: todas las ejecuciones de la colección comparten receta y solo difieren en la semilla, lo que permite aislar la variabilidad inducida por la inicialización y el orden de datos.

## Capacidades

- Generación de texto autoregresiva en inglés, limitada a la ventana de 2048 tokens.
- Modelado de lenguaje base: no se ha sometido a instrucción, RLHF ni DPO, por lo que no sigue instrucciones de forma fiable.
- Razonamiento y matemáticas: capacidad emergente propia de un modelo de 305M entrenado con 2B tokens; sin evaluaciones publicadas que la cuantifiquen.
- Código: no documentado ni evaluado en la información disponible.
- Tool calling / function calling: no soportado de forma nativa ni documentado.
- Capacidades de agente y razonamiento multi-paso: no disponibles.
- Multilingüismo: únicamente inglés declarado.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- Uso principal previsto: análisis de trayectorias de entrenamiento y experimentación en espacio de pesos, no inferencia de producto.

## Casos de uso

- Análisis de trayectorias de entrenamiento: cargar checkpoints de las ramas `stepN` para estudiar la evolución de los pesos a lo largo de 30.517 pasos y comparar con otras semillas de la colección DIET.
- Estudio de variabilidad por semilla: al ser la semilla 9 de una serie con receta idéntica, permite medir la dispersión de resultados finales atribuible solo a la inicialización y al orden de datos.
- Investigación en weight-space: aplicar técnicas de interpolación de pesos, linear mode connectivity o análisis espectral entre este checkpoint y los de otras semillas.
- Reproducibilidad de recetas de preentrenamiento: sirve como referencia verificable de una receta OLMo2 densa a escala 305M con hiperparámetros documentados (lr, betas, weight decay, scheduler).
- Baseline para experimentos de destilación: dado que se entrenó con `teacher_schedule=none`, es un punto de partida limpio para comparar contra ejecuciones con destilación en el mismo pipeline.
- Fine-tuning downstream de bajo coste: sus 305M parámetros permiten ajustes en una sola GPU consumer para tareas de clasificación o generación acotada, siempre que se acepte la limitación de contexto de 2048 tokens.
- Docencia y experimentación académica: tamaño y licencia permisiva lo hacen adecuado para prácticas de preentrenamiento y análisis de modelos en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 0,6-0,7 GB solo para pesos (305M × 2 bytes), más overhead de activaciones y KV cache; en la práctica cabe holgadamente en GPUs con 4-8 GB.
- Cuantización: al no publicarse pesos GGUF ni cuantizaciones oficiales, habría que generarlas a partir de los safetensors bf16; en int8 o int4 el modelo ocuparía del orden de 0,3 GB o 0,15 GB de pesos respectivamente.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; para entrenamiento o fine-tuning conviene al menos 16-24 GB (RTX 4090, A100, H100). El entrenamiento original se realizó en H100.
- Despliegue: compatible con `transformers` (librería declarada); para servir en producción se podría usar vLLM o TGI, y llama.cpp/Ollama si se convierten los pesos a GGUF, aunque no hay artefactos publicados para estas rutas.
- Latencia y throughput: no disponibles en la información proporcionada; a 305M parámetros y contexto 2048 se espera un throughput alto en GPU consumer, pero no hay cifras medidas publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Proposito | Disponibilidad |
|---|---|---|---|---|---|
| diet-traj-olmo2-medium-dolma-dense-seed9 | ~305M | 2048 | Apache 2.0 | Checkpoint de investigacion (trayectorias) | Hugging Face, 0 descargas |
| jjalora/diet-traj-pythia-410m-* | ~410M | no disponible | no disponible | Checkpoint de investigacion (trayectorias), arquitectura Pythia | Hugging Face |
| OLMo2 medium (modelo base oficial de AllenAI) | ~305M (config. equivalente) | no disponible | Apache 2.0 | Modelo base de proposito general | Hugging Face / AllenAI |
| Pythia-410m | ~410M | 2048 | Apache 2.0 | Suite de investigacion con checkpoints | Hugging Face / EleutherAI |

La comparación con los modelos oficiales de AllenAI y EleutherAI es pertinente por tamaño y naturaleza de investigación, pero este checkpoint no ha sido evaluado en benchmarks y no debe asumirse paridad de rendimiento con los modelos base publicados por sus organizaciones.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no sigue instrucciones de forma fiable ni mantiene diálogos coherentes sin un fine-tuning previo.
- Entrenado solo con 2B tokens, muy por debajo de lo habitual en modelos de su tamaño; la calidad del lenguaje será limitada y la perplexidad probablemente alta en comparación con modelos base de referencia.
- Contexto máximo de 2048 tokens, insuficiente para casos de uso que requieran documentos largos.
- Solo inglés declarado; no hay evidencia de capacidades multilingües.
- Riesgo de alucinación alto por tratarse de un modelo pequeño poco entrenado y sin alineación.
- Sesgos: no se documentan evaluaciones de sesgo; al entrenarse sobre Dolma, hereda los sesgos de ese corpus web.
- No hay benchmarks publicados, por lo que cualquier afirmación de rendimiento carece de respaldo empírico.
- Licencia Apache 2.0 permite uso comercial, pero el modelo no está pensado para producción y no se ofrece ninguna garantía de calidad.
- El repositorio ocupa 17,1 GB por la acumulación de checkpoints en ramas `stepN`; conviene descargar solo la rama necesaria.
- La model card indica `git_commit: "unknown"`, lo que dificulta la reproducibilidad exacta del código de entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/stanfordasl/diet-traj-olmo2-medium-dolma-dense-seed9
- Repositorio de recetas y configuraciones: https://github.com/jjalora/diet-lm (referenciado en la model card)
- Dataset de entrenamiento: https://huggingface.co/datasets/emozilla/dolma-v1_7-3B
- Colección relacionada DIET con Pythia: https://huggingface.co/jjalora (colección `diet-traj-pythia-410m-*`)
