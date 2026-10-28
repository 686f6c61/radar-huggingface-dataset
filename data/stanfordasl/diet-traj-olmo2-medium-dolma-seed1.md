# stanfordasl/diet-traj-olmo2-medium-dolma-seed1

## Resumen

`stanfordasl/diet-traj-olmo2-medium-dolma-seed1` es un checkpoint de preentrenamiento desde cero de la arquitectura OLMo2 en su variante densa de ~305M de parámetros, publicado por el grupo Stanford ASL dentro del proyecto DIET de análisis en el espacio de pesos (*weight-space*). No es un modelo conversacional ni un modelo afinado: es una de las ejecuciones (*runs*) de una colección cuyo único propósito es servir de material de estudio para analizar trayectorias de entrenamiento, es decir, la evolución de los pesos a lo largo de los *checkpoints* de un mismo preentrenamiento.

El modelo se entrena sobre `emozilla/dolma-v1_7-3B`, un espejo en HuggingFace de Dolma v1.7 muestreado proporcionalmente entre sus componentes y consumido en streaming (sin pre-empaquetado), con un presupuesto declarado de 2.000 millones de tokens, AdamW con lr=3e-5 y precisión bf16 sobre GPU H100. La colección sigue el mismo espíritu que la serie `jjalora/diet-traj-pythia-410m-*`, pero trasladada a la arquitectura OLMo2 y a datos Dolma; entre las distintas ejecuciones solo cambia la semilla aleatoria, lo que permite estimar la varianza introducida por la inicialización y el orden de los datos.

Su relevancia es metodológica, no de producto: con 16 capas, hidden size 768, 12 cabezas de atención (sin GQA: 12 cabezas KV) y 2048 tokens de contexto, ofrece un banco de pruebas barato para investigar coalescencia de checkpoints, interpolación de pesos, *linear mode connectivity*, detección de fases de entrenamiento o extracción de representaciones internas, sin los costes de un modelo grande. Cualquiera que lo despliegue esperando un asistente se encontrará con un modelo base en inglés, sin ajuste por instrucciones ni alineamiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, arquitectura OLMo2 (`olmo2_medium_dense.yaml`) |
| Parametros totales | ~305M |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 2048 tokens (`max_position_embeddings=2048`) |
| Tipos de cuantizacion | No se publican pesos cuantizados; el repositorio solo contiene safetensors en bf16. Convertible a int8/int4/GGUF mediante herramientas externas |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16), solo pesos, organizados en ramas `stepN`; `main` con los pesos finales |
| Hidden size | 768 |
| Intermediate size (FFN) | 3072 |
| Numero de capas | 16 |
| Cabezas de atencion / cabezas KV | 12 / 12 (atención multi-cabeza, sin GQA) |
| Dataset de entrenamiento | `emozilla/dolma-v1_7-3B` (streaming, muestreo proporcional entre componentes) |
| Presupuesto de tokens | 2.000.000.000 |
| Pasos de entrenamiento | `max_steps=30517`, `save_steps=950` (≈32 checkpoints por ejecución) |
| Semilla | 1 |
| Hardware de entrenamiento | GPU H100 (clúster "makau", job 9424) |
| Tamaño del repositorio | 7,3 GB (incluye todas las ramas de checkpoint) |
| Librería | transformers |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only denso con la configuración "medium" de OLMo2: 16 bloques, `hidden_size=768`, FFN de 3072, 12 cabezas de atención con 12 cabezas de clave/valor (atención multi-cabeza clásica, sin *grouped-query attention*) y 2048 posiciones máximas. No hay mezcla de expertos, ni capas SSM, ni atención lineal: el interés del artefacto está en la trayectoria, no en innovaciones de arquitectura. El vocabulario y el tokenizador no se detallan en la información disponible, aunque se corresponden con los de la implementación de referencia de OLMo2.

El entrenamiento es un preentrenamiento puro de modelado de lenguaje con entropía cruzada (`distillation.teacher_schedule=none` en `src/run_distillation.py`, es decir, sin destilación ni profesor), sobre `emozilla/dolma-v1_7-3B` leído en streaming. Hiperparámetros declarados: AdamW con lr=3e-5, betas (0,9; 0,95), weight decay 0,1, schedule coseno y bf16. No hay datos de RLHF, DPO, SFT ni preferencias: es un modelo base. La innovación metodológica es la organización del repositorio: cada checkpoint vive en una rama `stepN` (cada 950 pasos), lo que permite reconstruir la trayectoria completa de los pesos, y entre las ejecuciones de la colección solo varía la semilla, habilitando estudios de variabilidad entre semillas. El campo `git_commit` de `run.json` figura como `unknown`, lo que limita la reproducibilidad exacta del código empleado.

## Capacidades

- Generación de texto autoregresiva en inglés: continuación de documentos, modelado de lenguaje y *prompt completion* sin formato conversacional.
- Razonamiento y conocimiento factual de nivel propio de un modelo base de ~305M entrenado con 2.000M de tokens: suficiente para tareas superficiales, no para razonamiento multi-paso fiable.
- Generación de código y matemáticas básicas como consecuencia del preentrenamiento en Dolma; sin evaluación publicada y sin garantías de corrección.
- Capacidades multilingües limitadas al inglés declarado; otros idiomas solo de forma incidental por contaminación del corpus web.
- No soporta *tool calling* ni *function calling*: no hay plantilla de chat, ni entrenamiento en formato de herramientas, ni tokens especiales documentados.
- No soporta uso como agente ni razonamiento multi-paso orquestado; tampoco dispone de modo *thinking*.
- No es multimodal: sin visión ni audio.
- Capacidad diferencial real: acceso a una secuencia de ~32 estados de pesos intermedios por ejecución, útil para análisis de representaciones internas, interpolación y detección de fases de aprendizaje.

## Casos de uso

- Análisis de trayectorias en el espacio de pesos: cargar las ramas `stepN` y estudiar la evolución de la norma de los pesos, la similitud coseno entre checkpoints o la aparición de subespacios estables durante el preentrenamiento; el modelo es lo bastante pequeño para mantener varios checkpoints en memoria de una sola GPU.
- Interpolación de pesos y *linear mode connectivity*: emparejar esta ejecución (seed 1) con las demás semillas de la colección para medir la barrera de pérdida entre soluciones y evaluar técnicas de *model merging* con réplicas de 305M de parámetros.
- Cuantificación de la varianza por semilla: al ser idéntico todo salvo la semilla, sirve para estimar cuánta de la diferencia de pérdida final entre dos ejecuciones es ruido de inicialización y orden de datos, un dato necesario para dimensionar experimentos de ablación.
- Extracción de representaciones y *probing*: obtener embeddings por capa de un modelo OLMo2 pequeño y entrenar clasificadores lineales para estudiar qué información sintáctica o semántica emerge en cada profundidad del apilamiento.
- Modelo de juguete para pipelines de formación e I+D: validar de extremo a extremo un flujo de entrenamiento distribuido, *checkpointing*, conversión de formatos y evaluación con un coste de cómputo de minutos en una GPU consumer, antes de escalar a modelos de miles de millones de parámetros.
- *Fine-tuning* ligero con recursos limitados: ajustar la tarea concreta (clasificación de texto, extracción de entidades, continuación de dominio) partiendo de los pesos finales, ya que el ajuste completo en bf16 cabe holgadamente en 8-12 GB de VRAM.
- Referencia base en experimentos: usar la pérdida de validación sobre Dolma como línea base de un modelo denso de ~305M con receta conocida, frente a variantes con otras recetas o arquitecturas.
- Docencia y divulgación: ilustrar qué es un checkpoint intermedio de preentrenamiento y cómo se degrada la calidad respecto al estado final, sin necesidad de infraestructura dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye evaluaciones de MMLU, HumanEval, GSM8K, HellaSwag ni perplejidad de validación, y el autor no declara métricas de calidad para esta ejecución concreta. Cualquier cifra que se cite para este repositorio debe obtenerse midiendo directamente sobre los pesos publicados.

## Requisitos de hardware

- VRAM para inferencia en bf16/fp16: pesos ≈0,61 GB; con caché KV para 2048 tokens y activaciones, el consumo realista se sitúa en torno a 1,5-2,5 GB según el tamaño de lote.
- VRAM para ajuste completo en bf16: pesos, gradientes y estados de AdamW en fp32 requieren del orden de 4-5 GB, más activaciones; una GPU de 12-16 GB es suficiente con lotes pequeños.
- GPU recomendadas: cualquier GPU consumer moderna sirve; RTX 3060 12 GB, RTX 4070/4080, RTX 4090 para entrenamiento cómodo; A100/H100 solo tienen sentido para entrenar la ejecución completa desde cero, no para inferencia.
- Sí cabe en GPU consumer: es uno de los pocos modelos de esta colección que se puede cargar varias veces (varias semillas o checkpoints) en una única tarjeta.
- Opciones de despliegue: `transformers` de forma nativa (es la librería declarada); vLLM o TGI para servir con *batching* continuo; llama.cpp u Ollama solo tras convertir los pesos a GGUF, conversión no publicada por el autor; el tag `endpoints_compatible` sugiere compatibilidad con *endpoints* de inferencia alojados.
- Latencia y throughput: no disponible. No hay mediciones publicadas de tokens/s ni de latencia por petición para esta ejecución.
- Nota de almacenamiento: el repositorio ocupa 7,3 GB porque incluye todas las ramas de checkpoint; para usar solo los pesos finales conviene descargar la rama `main`, lo que reduce la descarga a menos de 1 GB.

## Comparativa con modelos similares

Los datos de contexto y licencia de los modelos alternativos provienen de su documentación pública; sus cifras de rendimiento no se comparan aquí porque este repositorio no publica ninguna.

| Modelo | Parametros | Contexto | Licencia | Orientacion | Disponibilidad |
|---|---|---|---|---|---|
| diet-traj-olmo2-medium-dolma-seed1 (este) | ~305M | 2048 | Apache 2.0 | Modelo base de investigación, trayectoria de preentrenamiento multi-checkpoint | HF, pesos bf16, ~32 ramas `stepN` |
| Pythia-410M (EleutherAI) | 410M | 2048 | Apache 2.0 | Modelo base con 154 checkpoints públicos, propósito similar de análisis de trayectorias | HF, transformers |
| OLMo-1B (AllenAI) | ~1.200M | 2048 | Apache 2.0 | Modelo base con datos y receta completamente abiertos | HF, transformers |
| SmolLM2-360M (HuggingFace) | 360M | 8192 | Apache 2.0 | Modelo base pequeño con contexto mayor y variante instruct disponible | HF, transformers, GGUF, llama.cpp |

Frente a Pythia-410M, la diferencia relevante no es de tamaño sino de ecosistema: DIET ofrece trayectorias sobre arquitectura OLMo2 y corpus Dolma, con control explícito de semilla, mientras que Pythia ofrece un número mucho mayor de checkpoints y una base de comparación más estudiada. Frente a SmolLM2-360M u OLMo-1B, este modelo pierde en contexto (2048 frente a 8192) y en disponibilidad de formato cuantizado, y no compite en calidad de modelo base por su presupuesto de entrenamiento declarado de 2.000M de tokens.

## Limitaciones y advertencias

- No es un modelo instruido: no sigue instrucciones, no mantiene formato conversacional y produce continuaciones de texto, no respuestas. No debe integrarse en un producto sin un ajuste previo.
- Sin alineamiento: no hay RLHF, DPO ni filtrado de seguridad, por lo que puede reproducir contenido tóxico, sesgado u ofensivo presente en el corpus web de Dolma.
- Sesgos esperables de Dolma (corpus web, papers, código, libros y otros componentes): sobrerrepresentación de inglés, de perspectivas occidentales y de texto técnico; infrarrepresentación de lenguas distintas del inglés.
- Riesgo de alucinación alto: con ~305M de parámetros y 2.000M de tokens vistos, la fidelidad factual es baja y las afirmaciones inventadas son frecuentes.
- Idiomas: solo inglés declarado; el rendimiento en castellano no está evaluado y previsiblemente será deficiente.
- Ventana de contexto de 2048 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Ausencia total de benchmarks: no hay evidencia publicada de calidad, por lo que cualquier uso requiere evaluación propia antes de sacar conclusiones.
- Reproducibilidad limitada: `run.json` registra `git_commit: "unknown"` y la cadencia exacta de *batch* no se detalla; la pérdida final depende de la semilla y solo hay una semilla por repositorio.
- Licencia Apache 2.0 sobre los pesos, pero el corpus Dolma incluye componentes con condiciones propias (contenido web rastreado, código, material académico); el uso comercial de los pesos no exime de revisar las condiciones de los datos de origen.
- Artefacto de investigación sin mantenimiento declarado: descargas y *likes* a cero, sin garantía de actualización ni de soporte, y con metadatos de fecha inconsistentes (creación registrada en octubre de 2026).
- El repositorio completo pesa 7,3 GB por acumulación de checkpoints; descargarlo entero por error es un coste innecesario de ancho de banda y disco.

## Enlaces

- Repositorio del modelo en HuggingFace: https://huggingface.co/stanfordasl/diet-traj-olmo2-medium-dolma-seed1
- Dataset de entrenamiento (espejo HF-native de Dolma v1.7): https://huggingface.co/datasets/emozilla/dolma-v1_7-3B
- Repositorio del proyecto DIET (código, `configs/model/olmo2_medium_dense.yaml`, `src/run_distillation.py`): jjalora/diet-lm (referenciado en la model card; no se ha proporcionado URL directa)
- Colección de trayectorias precedente sobre Pythia: jjalora/diet-traj-pythia-410m-* (referenciada en la model card; no se ha proporcionado URL directa)
- Paper, blog o demo oficial de esta ejecución: no disponible en la información proporcionada.
