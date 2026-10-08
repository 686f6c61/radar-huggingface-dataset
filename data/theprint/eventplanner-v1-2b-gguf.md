# theprint/EventPlanner-v1-2B-GGUF

## Resumen

EventPlanner-v1-2B-GGUF es un ajuste fino supervisado del modelo base `unsloth/Qwen3.5-2B`, publicado por el usuario `theprint` en HuggingFace. El modelo se ha entrenado sobre el conjunto de datos `EventPlanning-ShareGPT` con el objetivo de adaptar el estilo y el contenido del modelo base a tareas de planificación de eventos, y se distribuye exclusivamente en formato GGUF cuantizado para su uso en runtimes de inferencia locales.

La relevancia de esta ficha es limitada y conviene ser transparente al respecto: se trata de un experimento de ajuste automatizado generado con la herramienta Auto-SFT del propio autor, sin datos de benchmarks publicados, sin licencia declarada y con cero descargas en el momento de la consulta. Con 1.942.653.248 parámetros (aproximadamente 1,94 mil millones), el modelo es pequeño y cabe en GPU de consumo, pero su interés práctico depende enteramente de la calidad del dataset de entrenamiento, que no se documenta en detalle.

El pipeline de ajuste es LoRA con `r=64` y `alpha=64` sobre los módulos de proyección de atención (`q_proj`, `v_proj`, `k_proj`, `o_proj`), fusionado posteriormente a pesos completos de 16 bits y convertido a GGUF en 14 variantes de cuantización. No se especifica la longitud de contexto del modelo final, su licencia de uso ni resultados de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada del modelo base `unsloth/Qwen3.5-2B`; detalles especificos no disponibles) |
| Parametros totales | 1.942.653.248 (aproximadamente 1,94 mil millones) |
| Parametros activos | No aplica (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | No disponible en la ficha del autor; el ajuste se realizo con `max_seq_length=2048` |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS, IQ4_NL, TQ2_0 |
| Idiomas soportados | Ingles (declarado como `en` en la ficha) |
| Licencia | No disponible |
| Formato de pesos | GGUF (unica distribucion publicada; no se ofrecen safetensors en este repositorio) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base `unsloth/Qwen3.5-2B`, un transformer decoder-only de aproximadamente 1,94 mil millones de parametros. El autor no documenta en la model card ninguna modificacion estructural, atencion lineal, decodificacion especulativa ni variante hibrida, por lo que hay que asumir la arquitectura estandar de la familia Qwen. El repositorio ocupa 20,7 GB en total, cifra que corresponde a la suma de todas las variantes GGUF publicadas simultaneamente.

El entrenamiento consistio en un ajuste fino supervisado (SFT) con LoRA sobre el dataset `EventPlanning-ShareGPT`, durante 2 epocas. Los hiperparametros declarados son: `r=64`, `alpha=64`, `dropout=0.03`, modulos objetivo `q_proj`, `v_proj`, `k_proj` y `o_proj`, tasa de aprendizaje `0.0002`, tamano de lote 1, acumulacion de gradientes 2, `warmup_ratio` de 0.05 y longitud maxima de secuencia de 2048 tokens. No se aplico cuantizacion durante el entrenamiento. El adaptador LoRA se fusiono posteriormente en los pesos completos de 16 bits antes de generar los ficheros GGUF. Todo el proceso fue orquestado por la herramienta Auto-SFT del autor, descrita como un pipeline de busqueda automatica de hiperparametros y ajuste supervisado.

No se documenta el numero total de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF, DPO o alguna forma de alineacion adicional mas alla del SFT.

## Capacidades

- Generacion de texto conversacional en ingles, orientada al dominio de planificacion de eventos.
- Seguimiento de instrucciones con el estilo y la estructura del dataset `EventPlanning-ShareGPT` (formato de conversacion multi-turno).
- Redaccion de contenido textual relacionado con eventos: propuestas, descripciones, planes y material de apoyo.
- Capacidades multilingues: no disponibles; la ficha declara unicamente ingles.
- Soporte de tool calling o function calling: no confirmado ni documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado ni documentado.
- Modo de razonamiento explicito (thinking mode): no disponible.
- Vision, audio u otras modalidades: no disponibles.

## Casos de uso

- Generacion de propuestas de eventos: el modelo puede redactar borradores de propuesta comercial a partir de un briefing breve (tipo de evento, numero de asistentes, presupuesto), aprovechando su ajuste sobre datos de planificacion. Adecuado por su especializacion de dominio y su tamano reducido, que abarata el despliegue.
- Asistente conversacional de planificacion: chatbot multi-turno para resolver dudas frecuentes de un cliente que organiza una boda, una conferencia o un evento corporativo, manteniendo el hilo de la conversacion siempre que se respete la ventana de contexto efectiva.
- Generacion de cronogramas y listas de tareas: producir checklists de preparacion con hitos temporales (confirmacion de proveedores, envio de invitaciones, montaje) a partir de una descripcion del evento.
- Borradores de comunicacion con proveedores: redactar correos de solicitud de presupuesto, seguimiento o negociacion dirigidos a caterings, espacios y servicios tecnicos.
- Prototipado rapido en local: al estar disponible en GGUF y ocupar pocos gigabytes, permite iterar sobre prompts y plantillas de generacion en un portatil sin conexion ni coste de API, como paso previo a evaluar si merece la pena invertir en un modelo mayor.
- Generacion de descripciones y material promocional: textos para invitaciones, paginas de registro de evento o publicaciones en redes sociales, con la salvedad de que el contenido requerira revision humana por el riesgo de alucinacion.
- Filtrado o clasificacion previa en pipelines: dado su bajo coste de inferencia, puede usarse como primer nivel para clasificar consultas entrantes por tipo de evento antes de derivarlas a un modelo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye ninguna metrica de evaluacion (MMLU, HumanEval, GSM8K ni similares), y los resultados de la busqueda web realizada no contienen documentacion tecnica del modelo, sino referencias a un medio de comunicacion indio homonimo sin relacion con este repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia, segun cuantizacion (estimaciones derivadas del numero de parametros, no confirmadas por el autor):

| Cuantizacion | Tamano aproximado del fichero | VRAM estimada en inferencia |
|---|---|---|
| BF16 | ~3,9 GB | ~4,5-5 GB |
| Q8_0 | ~2,1 GB | ~2,5-3 GB |
| Q6_K | ~1,6 GB | ~2-2,5 GB |
| Q5_K_M | ~1,4 GB | ~1,8-2,2 GB |
| Q4_K_M | ~1,2 GB | ~1,5-2 GB |
| Q3_K_M | ~1,0 GB | ~1,3-1,7 GB |
| Q2_K | ~0,8 GB | ~1-1,4 GB |

- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar las cuantizaciones de 4 bits. Una RTX 3060, RTX 4060, RTX 2070 o superior es suficiente para las variantes Q4 y Q5. Para BF16 conviene disponer de 6 GB o mas (GTX 1660 de 6 GB, RTX 3050, RTX 4060).
- Cabe en GPU de consumo: si, en practicamente todas las GPU discretas modernas con 6 GB o mas. La variante Q4_K_M puede ejecutarse incluso en CPU con RAM suficiente.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y otros runtimes compatibles con GGUF, tal como indica el autor. Al no publicarse safetensors en este repositorio, no es directamente desplegable en vLLM o TGI sin convertir los pesos previamente.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones de velocidad de generacion.

## Comparativa con modelos similares

La comparativa se establece contra modelos pequenos de proposito general de orden de magnitud equivalente. Los datos del propio EventPlanner-v1-2B no estan disponibles (contexto, licencia y rendimiento no declarados), por lo que la columna correspondiente queda incompleta.

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| EventPlanner-v1-2B-GGUF | ~1,94 mil millones | No disponible | No disponible | Ajuste de dominio (planificacion de eventos), solo en |
| Qwen2.5-1.5B-Instruct | ~1,54 mil millones | 32.768 tokens nativos | Apache 2.0 | Proposito general, multilingue |
| Llama-3.2-1B-Instruct | ~1,24 mil millones | 128.000 tokens | Licencia comunitaria de Llama 3.2 | Proposito general, multilingue |
| Gemma-2-2B-it | ~2,6 mil millones | 8.192 tokens | Terminos de uso de Gemma | Proposito general, multilingue |

La ventaja diferencial de EventPlanner-v1-2B es su especializacion en un nicho concreto y su disponibilidad inmediata en GGUF en 14 niveles de cuantizacion. Sus desventajas frente a las alternativas son la ausencia de licencia declarada, la falta de soporte multilingue y la inexistencia de datos de rendimiento que permitan justificar la eleccion.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al entrenarse sobre un dataset unico y no publicado (`EventPlanning-ShareGPT`), es probable que herede tanto los sesgos del corpus como las convenciones culturales de su origen, pero no hay analisis disponible.
- Riesgo de alucinacion: elevado en un modelo de ~2B y ajustado sobre un dominio especifico. Cualquier dato factual (precios, disponibilidad de proveedores, normativa, fechas) debe verificarse externamente antes de usarse.
- Limitacion de idioma: la ficha declara unicamente ingles. No hay evidencia de un rendimiento aceptable en castellano, por lo que no deberia utilizarse en produccion para textos en espanol sin una evaluacion previa.
- Limitacion de contexto: la unica cifra conocida es `max_seq_length=2048` durante el entrenamiento. La ventana de contexto efectiva del modelo final no esta declarada, y aunque el modelo base pudiera soportar mas, el ajuste se realizo a 2048 tokens.
- Restricciones de licencia: la licencia aparece como "no disponible". Esto impide determinar si el uso comercial esta permitido. Al derivar de `unsloth/Qwen3.5-2B`, habria que verificar tambien la licencia del modelo base antes de cualquier uso comercial.
- Caveat de entrenamiento: el ajuste se hizo con lote de 1 y acumulacion de 2, durante solo 2 epocas, sobre un dataset no documentado en cuanto a tamano o procedencia. La calidad resultante es dificil de prever.
- Caveat de despliegue: el repositorio solo contiene GGUF, por lo que no se puede cargar directamente con `transformers` en precision completa ni desplegar en vLLM o TGI sin conversion previa.
- Madurez: cero descargas y cero "likes" en el momento de la consulta, sin historial de uso ni validacion por parte de la comunidad.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/theprint/EventPlanner-v1-2B-GGUF
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-2B
- Herramienta Auto-SFT utilizada para el ajuste: https://github.com/theprint/auto-sft
- llama.cpp (runtime compatible con GGUF): https://github.com/ggerganov/llama.cpp
- Ollama (runtime compatible con GGUF): https://ollama.com/
- LM Studio (runtime compatible con GGUF): https://lmstudio.ai/
- Nota sobre la busqueda web: los resultados obtenidos apuntan al medio de comunicacion indio ThePrint (https://theprint.in/ y su articulo en Wikipedia), sin ninguna relacion con este modelo. No se han encontrado papers, blogs tecnicos ni demos asociados al repositorio.
