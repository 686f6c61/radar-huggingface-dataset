# thu-pacman/Puro-2B-Base

## Resumen

Puro-2B-Base es un modelo de lenguaje causal denso de aproximadamente 2 000 millones de parámetros, desarrollado por el laboratorio thu-pacman de la Universidad Tsinghua. Su objetivo es demostrar que es posible entrenar desde cero un modelo de mil millones de parámetros con un presupuesto reducido, utilizando únicamente GPUs de consumo RTX 5090. El modelo se entrena sobre 1,4 billones de tokens y emplea una arquitectura compatible con la configuración de Qwen3-1.7B, aunque con pesos inicializados aleatoriamente y embeddings de entrada y salida no compartidos.

La relevancia de este modelo radica en su propuesta de «receta abierta»: publica no solo los pesos finales, sino también los datos de preentrenamiento, el código de entrenamiento y un informe técnico detallado. Según el informe, el punto de control canónico supera a Qwen2-1.5B en una batería de 15 benchmarks y se acerca a Qwen2.5-1.5B, con un coste estimado de alquiler de aceleradores de 6 891 dólares. Es un modelo base, sin ajuste por instrucciones ni alineación, por lo que no está pensado para conversación directa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dense decoder-only causal, configuracion Qwen3-1.7B con embeddings no compartidos |
| Parametros totales | 2 031 739 904 (aproximadamente 2B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 4 096 tokens |
| Tipos de cuantizacion | No disponible (entrenamiento en FP8 blockwise; no se publican cuantizaciones de inferencia) |
| Idiomas soportados | Ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

Puro-2B es un modelo transformer denso con 28 capas, tamaño oculto de 2048, 16 cabezas de atencion y 8 cabezas KV, y una capa feed-forward de 6144 unidades. El vocabulario tiene 151 936 tokens y la ventana de contexto es de 4096 tokens. La arquitectura sigue la configuracion de Qwen3-1.7B, pero con embeddings de entrada y salida no compartidos, y los pesos se inicializan desde cero, sin usar pesos preentrenados.

El entrenamiento se realizo sobre 1,4 billones de tokens con una receta de dos fases. Incluye tres innovaciones tecnicas principales: entrenamiento en FP8 por bloques (blockwise FP8), el optimizador MuonH con restricciones de hiperesfera, y una seleccion de datos guiada por proxies. La segunda fase incorpora una continuacion tardia sensible al curriculum y promediado de checkpoints. Todo el proceso se ejecuto en GPUs RTX 5090 de consumo, y el coste total de alquiler de aceleradores para el modelo final se estima en 6 891 dolares, segun el informe tecnico.

## Capacidades

- Generacion de texto autoregresiva en ingles y chino, con soporte de contexto de hasta 4096 tokens.
- Razonamiento y conocimiento general: segun los benchmarks del informe, obtiene 63,02 en una media de 11 tareas de razonamiento y conocimiento (MMLU, MMLU-Pro, ARC, BoolQ, HellaSwag, BBH, entre otras).
- Matematicas y codigo: alcanza 43,50 en la media de 4 tareas (GSM8K, MATH, sanitized-MBPP y HumanEval), superando a Qwen2-1.5B en este grupo.
- Multilingue limitado a ingles y chino; no se reportan otras lenguas.
- No incluye tool calling, function calling ni capacidades de agente.
- No tiene modo de pensamiento explicito ni soporte multimodal (vision, audio).
- Al ser un modelo base, no esta alineado para seguir instrucciones ni para mantener conversaciones de asistente.

## Casos de uso

- Fine-tuning para tareas especificas de procesamiento de lenguaje natural: al ser un modelo base, se puede ajustar con datos propios para clasificacion, extraccion de informacion o generacion de resumenes en ingles y chino, aprovechando su arquitectura compatible con Qwen3 en transformers.
- Generacion de codigo en entornos con recursos limitados: su buen rendimiento en HumanEval y MBPP lo hace util para completar o generar fragmentos de codigo en aplicaciones de asistencia a programadores, especialmente cuando se necesita un modelo que quepa en una GPU de consumo.
- Razonamiento matematico asistido: puede utilizarse como base para sistemas de resolucion de problemas matematicos tras un ajuste fino con datos de instrucciones, dado su rendimiento en GSM8K y MATH.
- Investigacion academica en preentrenamiento eficiente: al publicar datos, codigo y receta, sirve como referencia reproducible para estudiar tecnicas de entrenamiento de bajo coste, como FP8 blockwise o el optimizador MuonH.
- Prototipado rapido de modelos de lenguaje: su tamano reducido (2B) permite iterar en tareas de generacion o clasificacion en maquinas con una unica GPU, sin necesidad de infraestructura de alto presupuesto.
- Analisis de sesgos y alineacion en modelos base: al ser un checkpoint sin ajuste por instrucciones, es util para estudiar el comportamiento pre-entrenamiento de un modelo de 2B en distintos prompts, antes de aplicar tecnicas de alineacion.

## Benchmarks y rendimiento

Los resultados provienen del informe tecnico, utilizando un pipeline determinista de OpenCompass con decodificacion greedy para generacion y ranking por verosimilitud para opcion multiple. Las puntuaciones son porcentajes.

| Modelo | Math + Code (4) | Reasoning + Knowledge (11) | Overall (15) |
|---|---:|---:|---:|
| Qwen2-1.5B | 40,29 | 60,54 | 55,14 |
| **Puro-2B** | **43,50** | **63,02** | **57,81** |
| Qwen2.5-1.5B | 47,52 | 65,53 | 60,73 |

Las cuatro tareas de matematicas y codigo son GSM8K, MATH, sanitized-MBPP y HumanEval. Las once de razonamiento y conocimiento son MMLU, MMLU-Pro, ARC-Challenge, ARC-Easy, BoolQ, CommonsenseQA, HellaSwag, PIQA, SocialIQA, WinoGrande y BBH. Los promedios son medias aritmeticas sin ponderar.

## Requisitos de hardware

No se proporcionan datos oficiales de requisitos de hardware para inferencia en la documentacion publicada. No obstante, a partir del tamano del modelo (2 031 739 904 parametros), se puede estimar:

- En precision FP16, el peso del modelo ocuparia aproximadamente 4 GB de VRAM, por lo que seria ejecutable en GPUs de consumo con 6-8 GB de VRAM, como RTX 3060, RTX 4060 o RTX 5090.
- En precision FP8 (si se aplicara una cuantizacion similar a la usada en entrenamiento), el peso cabria en unos 2 GB, permitiendo su ejecucion en GPUs con 4 GB de VRAM.
- La activacion y las operaciones de atencion requeriran VRAM adicional; para una longitud de contexto de 4096 tokens, se estima que 8 GB de VRAM son suficientes para inferencia en FP16.
- Opciones de despliegue: al ser compatible con transformers y exportarse como `Qwen3ForCausalLM`, puede servirse con vLLM, TGI o llama.cpp (tras conversion a GGUF). Tambien es posible ejecutarlo con Ollama si se genera el formato correspondiente.
- El entrenamiento se realizo en RTX 5090, lo que confirma que la inferencia en esta GPU es trivial; el modelo esta disenado para entornos de recursos modestos.

## Comparativa con modelos similares

Se comparan los tres modelos base de tamano similar que aparecen en el informe tecnico.

| Modelo | Parametros | Contexto | MMLU (media 15) | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| Qwen2-1.5B | 1,5B | 32 768 | 55,14 | Apache 2.0 | Hugging Face |
| **Puro-2B** | **2B** | **4 096** | **57,81** | **Apache 2.0** | **Hugging Face** |
| Qwen2.5-1.5B | 1,5B | 32 768 | 60,73 | Apache 2.0 | Hugging Face |

Puro-2B supera a Qwen2-1.5B en el agregado de 15 benchmarks, pero queda por detras de Qwen2.5-1.5B. Su contexto es significativamente menor (4096 frente a 32768) y no incluye ajuste por instrucciones, por lo que no es directamente comparable como asistente conversacional. La ventaja principal de Puro-2B es su receta de entrenamiento totalmente abierta y su bajo coste de reproduccion.

## Limitaciones y advertencias

- Es un modelo base sin ajuste por instrucciones ni alineacion; no debe usarse como asistente conversacional sin un fine-tuning posterior.
- La ventana de contexto es de solo 4096 tokens, lo que limita su uso en tareas que requieran documentos largos o historiales extensos.
- Solo soporta ingles y chino; no se reportan capacidades en otros idiomas.
- Al ser un modelo preentrenado, puede presentar sesgos presentes en los datos de entrenamiento y producir alucinaciones, especialmente en tareas de generacion libre.
- Los costes reportados (4 400 y 6 891 dolares) son estimaciones de alquiler de aceleradores y excluyen otros gastos del proyecto; no deben interpretarse como el coste total de desarrollo.
- Los benchmarks se han evaluado solo en el conjunto de 15 tareas del informe; no se han publicado resultados en otros benchmarks estandar como MMLU completo o MT-Bench.
- No se dispone de informacion sobre cuantizaciones listas para inferencia, por lo que el despliegue en formatos como GGUF requeriria conversion manual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thu-pacman/Puro-2B-Base
- Dataset de preentrenamiento: https://huggingface.co/datasets/thu-pacman/Puro-2B
- Repositorio de entrenamiento (Puro-Megatron): https://github.com/thu-pacman/Puro-Megatron
- Repositorio de procesamiento de datos (Kaiyuan-Spark): https://github.com/thu-pacman/Kaiyuan-Spark
- Informe tecnico en arXiv: https://arxiv.org/abs/2608.27370
- Pagina de despliegue en FriendliAI: https://friendli.ai/models/thu-pacman/Puro-2B-Base
