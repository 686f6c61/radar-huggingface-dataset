# StarLiu714/GPT-oss-MOFinder

## Resumen

GPT-oss-MOFinder es un ajuste fino supervisado (SFT con LoRA fusionado) del modelo abierto `openai/gpt-oss-20b`, publicado por el usuario StarLiu714 y vinculado al proyecto académico MOFinder (zzhenglab). Su tarea no es la generación de texto general, sino una clasificación binaria muy específica: predecir si unas condiciones de reacción química dadas producen una estructura metal-orgánica cristalina (MOF, metal-organic framework) o no. El modelo recibe una descripción estructurada de la reacción (precursor metálico, ligando orgánico, modulador, disolvente, concentración, ratio M/L, temperatura y tiempo) y emite una probabilidad P de éxito cristalino.

Técnicamente es un transformer causal denso de 20.914.757.184 parámetros (aproximadamente 20,9 mil millones), exportado como checkpoint BF16 denso con los pesos del adaptador LoRA ya integrados en las matrices base. El repositorio ocupa 41,9 GB repartidos en 13 shards de safetensors, lo que implica que la inferencia en BF16 requiere al menos esa cantidad de VRAM más el espacio para activaciones y caché KV. La receta original usó LoRA con r=32, alpha=64 y dropout 0,05 sobre las proyecciones `q_proj`, `k_proj`, `v_proj` y `o_proj`, con un presupuesto de 10.000 pasos y 3 épocas sobre 23.528 ejemplos de entrenamiento.

Su relevancia es doble: por un lado, demuestra la viabilidad de reutilizar un modelo de razonamiento generalista de 20B como extractor de probabilidades para una tarea científica acotada; por otro, publica junto a los pesos el conjunto de datos de entrenamiento y holdout, los scripts de inferencia y de continuación de entrenamiento, y el manifiesto con los hiperparámetros exactos del run original, lo que facilita la reproducibilidad. La licencia es GPL-3.0 (con el modelo base bajo Apache-2.0), un detalle importante para cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso (familia `gpt_oss`), exportado como checkpoint BF16 denso |
| Parametros totales | 20.914.757.184 (aprox. 20,9 B) |
| Parametros activos | No aplica: el export es denso, sin carga de pesos de expertos cuantizados |
| Longitud de contexto | `--max-length` por defecto 2048 en los scripts (límite de validación de entrada, no truncado); los prompts de reacción reales miden hasta 370 tokens |
| Tipos de cuantizacion | El autor distribuye solo BF16; no se documentan GGUF, AWQ, GPTQ ni MXFP4 en esta release |
| Idiomas soportados | Inglés (`en`) |
| Licencia | GPL-3.0 para esta release; el modelo base `openai/gpt-oss-20b` conserva Apache-2.0 |
| Formato de pesos | Safetensors (13 shards BF16, ~41,8 GB) + tokenizer y scripts de inferencia/continuación |

## Arquitectura y entrenamiento

El modelo parte de `openai/gpt-oss-20b`, un transformer causal de la familia GPT-OSS, y se adapta mediante LoRA a una tarea de clasificación P–N formulada a través de los logits del modelo de lenguaje: en lugar de una cabeza clasificadora separada, se comparan las probabilidades asignadas a las etiquetas P y N en la salida del LM. El adaptador tiene rango 32, alpha 64, dropout 0,05 y se aplica únicamente a las proyecciones de atención (`q_proj`, `k_proj`, `v_proj`, `o_proj`). Tras el entrenamiento, el adaptador se fusiona y el resultado se normaliza como checkpoint BF16 denso, de modo que no se necesitan kernels MXFP4 ni carga de expertos cuantizados en tiempo de ejecución.

El entrenamiento usó 23.528 ejemplos (11.968 positivos, 11.560 negativos) y un holdout de 2.595 ejemplos (1.320 P, 1.275 N), con learning rate 1e-5, decaimiento por mitades en los pasos 1200, 3200, 6000 y 8500, warmup 0,02, weight decay 0, batch de entrenamiento 18 y de evaluación 48, longitud máxima 2048 sin truncado, semilla 777 y un presupuesto de `max_steps=10000` con 3 épocas registradas. La función de pérdida incorpora ponderación de la clase N (1,02) y label smoothing de 0,02, sin focal loss (gamma 0). El manifiesto `mof_export_manifest.json` conserva todos estos ajustes para reproducir el run.

Cabe señalar una advertencia metodológica que el propio autor documenta: clústeres distintos de la misma publicación pueden aparecer tanto en train como en holdout, por lo que la separación no garantiza independencia total entre conjuntos. Esto puede inflar las métricas de holdout respecto a un escenario de generalización a publicaciones completamente nuevas.

## Capacidades

- Clasificación binaria de resultados de síntesis MOF: emite probabilidad P de que unas condiciones de reacción produzcan un MOF cristalino.
- Procesamiento de reacciones estructuradas con campos concretos: precursor metálico, ligando orgánico, modulador, disolvente, concentración metálica (mM), ratio M/L, temperatura (°C) y tiempo (h).
- Modo conversacional con plantilla de chat: acepta registros en formato `messages` o un objeto de reacción por línea.
- Puntuación opcional contra etiquetas `gold` cuando se incluyen en la entrada.
- Capacidad de continuación de entrenamiento: los scripts permiten lanzar nuevos runs LoRA sobre los pesos publicados.
- Soporte de `endpoints_compatible` según los tags del repositorio, lo que facilita el despliegue tras una API compatible.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modos de razonamiento extendido en esta release; el ajuste está orientado exclusivamente a la tarea de clasificación.

## Casos de uso

- **Priorización de experimentos de síntesis MOF**: dado un conjunto de condiciones candidatas (precursor, ligando, modulador, disolvente, temperatura, tiempo), el modelo devuelve una probabilidad de éxito cristalino que permite ordenar los experimentos antes de consumir recursos de laboratorio. Es adecuado porque la entrada es exactamente el vector de variables que el modelo fue entrenado para interpretar.
- **Filtrado de espacios de búsqueda combinatorios**: en exploración de materiales, el espacio de combinaciones de metales, ligandos y condiciones es enorme; el modelo puede puntuar miles de combinaciones por lotes (batch 24 en A100/H100 de 80 GB) para descartar las de baja probabilidad antes de simulaciones más costosas.
- **Asistencia a planificación experimental en laboratorio**: integrado en una herramienta interna, el modelo sugiere qué modificar (por ejemplo, subir temperatura o cambiar modulador) para aumentar la probabilidad de cristalización, actuando como un prior estadístico entrenado sobre literatura.
- **Análisis retrospectivo de datos de publicaciones**: puntuar reacciones ya publicadas y comparar la predicción con el resultado reportado para detectar condiciones infravaloradas o anomalías en la extracción de datos.
- **Generación de datasets etiquetados sintéticamente**: usar las probabilidades del modelo como etiqueta blanda para preentrenar modelos más pequeños o para aumentar la cobertura de un dataset de química de MOF.
- **Continuación de entrenamiento con datos propios**: gracias a los scripts `continue_lora_pn.py` y a la receta publicada, un grupo puede adaptar el modelo a su propio dominio (por ejemplo, una familia concreta de MOF o un laboratorio con protocolos específicos) sin partir de cero.
- **Docencia y reproducibilidad metodológica**: el paquete completo (pesos, datos, manifiesto, scripts) sirve como caso de estudio de ajuste fino de un LLM de 20B para una tarea científica acotada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de accuracy, F1, AUC ni comparaciones numéricas con otros modelos sobre el holdout; únicamente describe el particionado de datos (23.528 ejemplos de entrenamiento y 2.595 de holdout) y la receta de entrenamiento. Cualquier cifra de rendimiento predictivo requeriría ejecutar `script/inference_pn.py` sobre `data/mof_ft_holdout.jsonl` y calcular las métricas a partir de las predicciones generadas.

## Requisitos de hardware

- **VRAM para inferencia en BF16**: al menos ~42 GB solo para pesos, más activaciones y caché KV; en la práctica se recomienda un GPU de 80 GB o más para trabajar con comodidad.
- **GPU recomendadas por el autor**: NVIDIA Ampere o superior (compute capability 8.0+), es decir, A100 y RTX A6000 (Ampere), RTX 6000 Ada (Ada), H100/H200 (Hopper) y RTX PRO 6000 Blackwell de 96 GB.
- **Configuraciones de referencia**: inferencia con batch 24 en A100/H100 de 80 GB y batch 48 en RTX PRO 6000 de 96 GB, para prompts de hasta 370 tokens.
- **Continuación de entrenamiento LoRA**: batch de train 12 / eval 24 en A100/H100 de 80 GB, y train 18 / eval 48 en RTX PRO 6000 de 96 GB, ajustando acumulación de gradientes y checkpointing según memoria.
- **GPU de consumo**: no cabe en GPUs de consumo de 24 GB (RTX 4090) en BF16; haría falta cuantización, que esta release no distribuye. No se documentan opciones GGUF ni Ollama.
- **Despliegue**: los scripts oficiales usan `transformers` 4.56.2 y `peft` 0.17.1 con PyTorch 2.6+ y build CUDA. El tag `endpoints_compatible` sugiere compatibilidad con endpoints, pero no se detallan integraciones con vLLM, TGI o llama.cpp.
- **Latencia y throughput**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GPT-oss-MOFinder | 20,9 B (denso BF16) | 2048 en scripts; prompts reales ~370 tokens | Clasificación P/N de cristalización MOF | GPL-3.0 (base Apache-2.0) | Hugging Face, pesos + datos + scripts |
| openai/gpt-oss-20b | ~20 B | No disponible en esta ficha | Generación de texto general | Apache-2.0 | Hugging Face |
| MOFinder (proyecto original) | No disponible | No disponible | Predicción de MOF | No disponible | GitHub zzhenglab/MOFinder |

La comparación con alternativas de la misma categoría (clasificadores especializados de química de materiales) no está disponible en la información proporcionada: no se documentan métricas ni modelos competidores directos. El propio proyecto MOFinder, referenciado en la model card, es el contexto académico del ajuste, pero no se ofrecen sus cifras para contrastar.

## Limitaciones y advertencias

- **Licencia GPL-3.0**: es una licencia copyleft fuerte; integrar estos pesos en un producto propietario puede obligar a liberar el código derivado. El modelo base conserva Apache-2.0, pero la release combinada se distribuye bajo GPL-3.0.
- **Idioma único**: solo inglés; no se garantiza comportamiento en castellano ni en otros idiomas.
- **Dominio muy estrecho**: el modelo está ajustado para clasificar condiciones de síntesis MOF; su uso como LLM general degradará con toda probabilidad su calidad conversacional y de razonamiento.
- **Fuga potencial entre train y holdout**: el autor advierte que clústeres de la misma publicación pueden aparecer en ambos conjuntos, lo que puede sobreestimar la generalización a literatura nueva.
- **Riesgo de alucinación en formato**: al ser un LM causal reutilizado para clasificación, entradas mal formateadas o fuera de la plantilla de chat pueden producir salidas no interpretables; el autor recomienda preservar exactamente el system prompt y el formato de campos.
- **Límite de longitud**: `--max-length` por defecto 2048 y validación estricta; las entradas más largas se rechazan en lugar de truncarse.
- **Sin cuantizaciones oficiales**: no hay GGUF ni versiones de 4 bits, lo que limita el despliegue en hardware de consumo.
- **Sesgos de los datos de origen**: el modelo hereda los sesgos de la literatura científica recogida en el dataset (sobrerrepresentación de ciertos metales, ligandos y condiciones de laboratorio), lo que puede infravalorar combinaciones poco publicadas.
- **Sin benchmarks publicados**: no hay evidencia numérica de rendimiento en la información disponible; cualquier decisión de producción debería basarse en una evaluación propia sobre el holdout.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/StarLiu714/GPT-oss-MOFinder
- Modelo base: https://huggingface.co/openai/gpt-oss-20b
- Repositorio MOFinder: https://github.com/zzhenglab/MOFinder
- Guía de datasets de MOFinder: https://github.com/zzhenglab/MOFinder/blob/main/docs/datasets.md
- Citación de MOFinder: https://github.com/zzhenglab/MOFinder/blob/main/CITATION.cff
- Guía de descarga con Hugging Face CLI: https://huggingface.co/docs/huggingface_hub/guides/download#download-from-the-cli
- GPU RTX PRO 6000 Blackwell (NVIDIA): https://www.nvidia.com/en-us/products/workstations/professional-desktop-gpus/rtx-pro-6000-family/
