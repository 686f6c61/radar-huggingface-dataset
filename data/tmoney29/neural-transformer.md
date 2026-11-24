# Tmoney29/neural-transformer

## Resumen

Neural Transformer es un conjunto de checkpoints publicados por Travis Waters (usuario Tmoney29 en Hugging Face) que implementan el mecanismo descrito en el articulo *Neural Transformer: Predicting a Token's Full Neuron Path Ahead of Time in SwiGLU Language Models*. No se trata de un modelo de lenguaje autonomo, sino de un planificador auxiliar (planner) que se acopla a Mistral-7B-v0.1 para predecir, antes de ejecutar las capas, que neuronas MLP debe conservar cada capa para el token actual. La propuesta se enmarca en la linea de investigacion sobre sparsity contextual en modelos SwiGLU.

Tecnicamente, el planner es un transformer causal pequeno cuyas posiciones de secuencia corresponden a las 32 capas de Mistral-7B. Tras ejecutar densamente las dos primeras capas, el planner emite las 30 mascaras de neuronas restantes de una sola pasada. La atencion permanece densa; solo se aplica sparsity al bloque MLP. Los checkpoints publicados (NT-50, NT-40, NT-30, NT-20) corresponden a distintos objetivos de retencion de neuronas (50%, 40%, 30% y 20%).

Su relevancia es fundamentalmente de investigacion: demuestra que es posible predecir el camino de activacion de un token con antelacion y con una degradacion de perplejidad moderada (5,21% con retencion del 49,15% en NT-50). No obstante, el propio autor advierte que estos checkpoints no aceleran la inferencia por si mismos: la evaluacion simulada aplica mascaras sobre computo denso, por lo que el ahorro real requiere un kernel que materialice el skipping.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal pequeno (planner) sobre Mistral-7B-v0.1 (base SwiGLU, decoder-only) |
| Parametros totales | No disponible (el planner es de tamano reducido; el modelo base Mistral-7B tiene 7,24 mil millones) |
| Parametros activos | No aplica (no es MoE; la sparsity es contextual por token, no estructural) |
| Longitud de contexto | No disponible para el planner; heredada de Mistral-7B-v0.1 (32 768 tokens) para el modelo base |
| Tipos de cuantizacion | No disponible (checkpoints en safetensors sin cuantizar) |
| Idiomas soportados | No disponible (heredados de Mistral-7B-v0.1: principalmente ingles y lenguas europeas) |
| Licencia | MIT |
| Formato de pesos | safetensors (`NT-50.safetensors`, `NT-40.safetensors`, `NT-30.safetensors`, `NT-20.safetensors`, `thresholds.safetensors`) y JSON de calibracion |

## Arquitectura y entrenamiento

El planner es un transformer causal cuyas posiciones de secuencia representan las capas del modelo base, no tokens. Recibe como entrada la codificacion del camino de activacion del token anterior (codificado mediante umbrales por neurona del percentil 75, almacenados en `thresholds.safetensors`) y emite, en una sola pasada, las 30 mascaras de neuronas MLP correspondientes a las capas 3 a 32 de Mistral-7B. Las dos primeras capas se ejecutan siempre de forma densa y la atencion no se ve afectada por la sparsity. La calibracion por checkpoint se guarda en ficheros JSON con un array `offsets` de cortes por capa, ya con el desplazamiento (`shift`) aplicado.

El entrenamiento se describe en el articulo de Waters (2026), aunque la model card no detalla el numero de tokens, la composicion del dataset ni si se empleo RLHF o DPO. La innovacion principal es la prediccion anticipada del camino completo de neuronas de un token en todas las capas, lo que en principio permitiria planificar el computo antes de ejecutar el bloque MLP. La evaluacion publicada se realizo sobre un test de continuacion de 63 documentos con un prompt denso de 64 tokens: NT-50 retuvo el 49,15% de las neuronas MLP elegibles e incremento la perplejidad un 5,21% respecto a Mistral-7B denso, con una sola semilla. El autor subraya que la evaluacion simula el skipping aplicando mascaras sobre computo denso y que los checkpoints no aceleran la inferencia por si mismos.

## Capacidades

- Prediccion de mascaras de neuronas MLP para las 30 capas finales de Mistral-7B a partir de las dos primeras capas densas.
- Generacion de mascaras para un token completo en una sola pasada del planner (no autoregresiva capa a capa).
- Cuatro niveles de retencion configurables: NT-50 (50%), NT-40 (40%), NT-30 (30%) y NT-20 (20%).
- Calibracion por capa mediante ficheros JSON con cortes ajustados.
- Codificacion del camino de activacion previo mediante umbrales por neurona (percentil 75).
- No soporta tool calling, function calling, agentes, vision, audio ni modos de razonamiento extendido: es un componente auxiliar, no un modelo conversacional.
- Capacidades multilingues: no disponibles de forma especifica; dependen del modelo base.

## Casos de uso

- Investigacion en sparsity contextual: permite reproducir los experimentos del articulo de Waters sobre Mistral-7B y comparar curvas de perplejidad frente a retencion de neuronas.
- Desarrollo de kernels de skipping: sirve como referencia para implementar kernels que materialicen el ahorro de computo en el bloque MLP, ya que los checkpoints por si solos no aceleran la inferencia.
- Estudio de predictibilidad de activaciones: util para analizar hasta que punto el camino de activacion de un token es predecible a partir de las primeras capas.
- Base para tecnicas de compresion dinamica: los umbrales y las mascaras pueden integrarse en pipelines de poda dependiente de la entrada en modelos SwiGLU.
- Benchmarking de metodos de eficiencia: comparar NT frente a otras estrategias de sparsity (magnitud, Wanda, SparseGPT) sobre el mismo modelo base.
- Reproducibilidad academica: los ficheros de calibracion y el script de verificacion del repositorio permiten validar los numeros publicados en el paper.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son los del checkpoint NT-50 sobre el test de continuacion de 63 documentos con prompt denso de 64 tokens (una sola semilla):

| Metrica | NT-50 | Mistral-7B denso |
|---|---|---|
| Retencion de neuronas MLP elegibles | 49,15% | 100% |
| Incremento de perplejidad | +5,21% | referencia |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Tampoco hay datos de NT-40, NT-30 ni NT-20 en la model card.

## Requisitos de hardware

- El planner es de tamano reducido, pero requiere cargar Mistral-7B-v0.1 en memoria para operar: aproximadamente 14 GB en fp16 o 28 GB en fp32 para el modelo base.
- VRAM estimada para el modelo base: ~14-16 GB en fp16, ~7-9 GB en cuantizacion de 4 bits (si se aplica externamente, ya que los checkpoints no incluyen versiones cuantizadas).
- GPU recomendadas: A100 40/80 GB, H100, o RTX 4090 (24 GB) para fp16; RTX 3090 (24 GB) tambien es viable.
- Cabe en GPU de consumo con 24 GB en fp16; en 16 GB requiere cuantizacion del modelo base.
- Opciones de despliegue: no hay integracion documentada con vLLM, llama.cpp, Ollama o TGI. El uso previsto es mediante el codigo del repositorio de GitHub, que implementa la evaluacion sobre computo denso con mascaras.
- Latencia y throughput: no disponibles. El autor indica explicitamente que los checkpoints no aceleran la inferencia por si mismos.

## Comparativa con modelos similares

No hay modelos directamente comparables publicados en la informacion disponible: Neural Transformer no es un modelo de lenguaje, sino un planificador de sparsity acoplado a Mistral-7B. Como referencia del modelo base:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Neural Transformer (NT-50/40/30/20) | Planner reducido + Mistral-7B (7,24B) | Heredado de Mistral-7B (32 768) | MIT | Hugging Face (Tmoney29/neural-transformer) |
| Mistral-7B-v0.1 | 7,24B | 32 768 | Apache 2.0 | Hugging Face (mistralai) |
| Alternativas de sparsity (SparseGPT, Wanda) | No disponible | No aplica | Distintas | Repositorios de investigacion |

## Limitaciones y advertencias

- Los checkpoints no aceleran la inferencia por si mismos: la evaluacion simula el skipping aplicando mascaras sobre computo denso.
- La retencion real varia con la entrada; los nombres de checkpoint son objetivos de calibracion, no garantias.
- Los resultados publicados corresponden a una sola semilla y a un test de 63 documentos, por lo que la robustez estadistica es limitada.
- La atencion permanece densa: el ahorro de computo se limita al bloque MLP.
- No se documentan sesgos, riesgos de alucinacion ni evaluaciones de seguridad; al ser un componente auxiliar, hereda los sesgos de Mistral-7B-v0.1.
- Idiomas soportados no especificados; dependen del modelo base.
- La licencia MIT aplica a los checkpoints del planner, pero el uso comercial requiere verificar tambien la licencia de Mistral-7B-v0.1 (Apache 2.0).
- El articulo esta pendiente de publicacion en arXiv; solo esta disponible el PDF en GitHub.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Tmoney29/neural-transformer
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-v0.1
- Codigo, resultados y script de verificacion: https://github.com/travishub09/Neural-Transformers
- Paper (PDF): https://github.com/travishub09/Neural-Transformers/blob/main/paper/planning_the_path.pdf
- Registro de evaluacion NT-50: https://github.com/travishub09/Neural-Transformers/blob/main/results/mistral--mistral-comparisons-v1/raw/prefix-2-prompt-64/budget-50/documents/planner.json
- README del repositorio: https://github.com/travishub09/Neural-Transformers#readme
