# spkc83/retail-bank-servicing-agent-9b-peft-v7-grounded-generation

## Resumen

El modelo `spkc83/retail-bank-servicing-agent-9b-peft-v7-grounded-generation` es un adaptador LoRA (Low-Rank Adaptation) de continuación de entrenamiento, diseñado para especializar un modelo base de 9.000 millones de parámetros en tareas de atención al cliente en banca minorista. Lo publica el autor `spkc83` bajo licencia Apache 2.0, y forma parte de una serie de adaptadores iterativos (v5, v6, v7) orientados a mejorar la generación de respuestas "grounded" (basadas en contexto) en escenarios de servicio bancario con soporte de tool calling.

Este adaptador no contiene pesos completos del modelo: únicamente incluye los deltas LoRA que deben cargarse sobre una revisión concreta del modelo base `spkc83/retail-bank-servicing-agent-9b` (revisión BF16 exacta `1d56824995aa1adecfe20f62ca42fb1c0c443817`). El modelo base parece estar construido sobre la familia Granite de IBM, aunque no se especifica explícitamente la arquitectura interna. Su relevancia actual reside en que demuestra un enfoque práctico de fine-tuning eficiente para dominios verticales (banca) con bajo coste de entrenamiento, aunque su carácter experimental y la ausencia de métricas publicadas limitan su uso directo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre modelo base Granite (no confirmado) de 9B parametros |
| Parametros totales | No disponible (el adaptador es de bajo rango; el modelo base tiene ~9B) |
| Parametros activos | No aplicable (adaptador LoRA, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el adaptador se publica en BF16; el base requiere revision BF16) |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena mediante PEFT (Parameter-Efficient Fine-Tuning) con LoRA, lo que implica congelar el modelo base y actualizar únicamente matrices de bajo rango en las capas de atención y feed-forward. El modelo base es `spkc83/retail-bank-servicing-agent-9b`, que por el nombre y las etiquetas (`granite`) probablemente deriva de un modelo Granite de IBM de 9B parámetros, aunque no se confirma en la documentación. El adaptador es una continuación del adaptador `retail-bank-servicing-agent-9b-peft-v5-remediation` (revisión `d965816bd6a9252bfb4327c1b0d64f9d34f4a1a2`), y se entrena sobre el dataset `spkc83/retail-bank-servicing-alignment-sft` (revisión `a247ef6f78a1c0f98fa382d744b579ce2af9a6fb`), que parece ser un conjunto de instrucciones de alineación para servicio bancario minorista. El entrenamiento se realizó durante 200 pasos de optimizador. No se especifican detalles sobre el dataset (número de tokens, composición exacta, si hubo RLHF/DPO), ni sobre técnicas como decodificación especulativa o atención lineal. El adaptador está orientado a "grounded generation", es decir, generar respuestas basadas en documentos o contexto proporcionado, probablemente integrado con tool calling.

## Capacidades

- Generacion de texto especializada en servicio bancario minorista: consultas de saldo, transacciones, productos de credito, atencion al cliente.
- Soporte de tool calling: el adaptador esta etiquetado con `tool-calling`, lo que sugiere capacidad para invocar funciones externas (consultas a APIs bancarias, bases de datos de clientes, etc.).
- Generacion "grounded": el entrenamiento se enfoca en producir respuestas basadas en un contexto dado, reduciendo la tendencia a inventar informacion.
- Continuacion de entrenamiento sobre un adaptador previo (v5), lo que indica un refinamiento iterativo de comportamientos.
- Integracion con el ecosistema PEFT/HuggingFace: se carga como adaptador LoRA sobre un modelo base especifico.

No se dispone de informacion sobre capacidades de razonamiento general, matematicas, codigo, vision o audio. El modelo es exclusivamente de texto.

## Casos de uso

- Atencion al cliente bancario automatizada: el adaptador puede gestionar conversaciones de soporte sobre productos bancarios, respondiendo con informacion verificada a partir de documentos internos o bases de conocimiento, gracias a su entrenamiento en generacion grounded.
- Asistente de consultas de cuenta: integrado en un chatbot, puede recuperar datos de saldo, movimientos o estados de tarjetas mediante tool calling y formular respuestas en lenguaje natural.
- Clasificacion y derivacion de incidencias: el modelo puede identificar el tipo de consulta (reclamacion, solicitud de producto, soporte tecnico) y derivar al agente humano o sistema adecuado.
- Generacion de respuestas para correo electronico o chat de soporte: dado un historial de conversacion y documentos de politicas, el modelo redacta respuestas coherentes y alineadas con las normativas del banco.
- Entrenamiento de agentes virtuales en entornos de prueba: al ser un adaptador ligero, permite experimentar con diferentes configuraciones de tool calling y grounding sin desplegar un modelo completo.
- Fine-tuning incremental en produccion: el esquema de adaptadores encadenados (v5 -> v7) demuestra un flujo para actualizar comportamientos sin reentrenar el modelo completo, util para equipos que iteran sobre politicas bancarias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de evaluacion (MMLU, HumanEval, GSM8K, etc.) ni comparaciones con otros modelos. El autor menciona que la evaluacion de entrenamiento se completo antes de la publicacion, pero no se comparten los numeros. Se recomienda realizar una evaluacion propia en el dominio bancario antes de cualquier uso.

## Requisitos de hardware

- VRAM estimada: al ser un adaptador LoRA de 0.2 GB, la carga adicional sobre el modelo base es minima. El modelo base de 9B en BF16 requiere aproximadamente 18 GB de VRAM solo para los pesos; con el adaptador, la memoria total dependera del framework de inferencia.
- GPU recomendadas: para el modelo base de 9B en BF16, una GPU con al menos 24 GB de VRAM (RTX 3090/4090, A10G, L4) es suficiente para inferencia con batch pequeno. Para produccion con mayor throughput, se recomienda A100 (40/80 GB) o H100.
- En consumer GPU: cabe en RTX 3090/4090 (24 GB) con cuantizacion del modelo base, aunque el adaptador esta disenado para BF16. Se puede cuantizar el base a 8 o 4 bits y cargar el adaptador LoRA, pero no esta garantizado por el autor.
- Opciones de despliegue: al ser un adaptador PEFT, se puede servir con HuggingFace Transformers + PEFT, vLLM (con soporte para LoRA), o TGI. Tambien es posible usar llama.cpp si se fusiona el adaptador con el base y se convierte a GGUF, aunque no se proporcionan instrucciones.
- Latencia y throughput: no disponibles. Dependen del hardware, el framework y el tamano del contexto.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa rigurosa. El modelo es un adaptador especializado sobre un base no identificado publicamente, y no existen datos de rendimiento publicados. Como alternativa conceptual, se pueden considerar modelos de proposito general de tamano similar (por ejemplo, Llama 3.1 8B, Mistral 7B, Gemma 2 9B) que, aunque no estan especializados en banca, ofrecen capacidades de tool calling y generacion grounded con documentacion extensa y benchmarks publicos. Sin embargo, la comparacion directa no es posible sin evaluar el adaptador en tareas bancarias especificas.

## Limitaciones y advertencias

- Es un adaptador experimental: la model card indica que la "release eligibility" aun requiere pasar "gates de evaluacion conductual congelados", lo que sugiere que el modelo puede no estar listo para produccion.
- Dependencia del modelo base: requiere cargar la revision exacta `1d56824995aa1adecfe20f62ca42fb1c0c443817` del modelo base `spkc83/retail-bank-servicing-agent-9b`; cualquier cambio en el base invalida el adaptador.
- Sin benchmarks publicados: no hay evidencia cuantitativa de rendimiento en tareas bancarias ni en metricas generales.
- Riesgo de alucinacion: aunque el entrenamiento en grounded generation busca mitigarlo, no se garantiza que las respuestas sean siempre factuales, especialmente fuera del dominio bancario.
- Sesgos desconocidos: al ser un modelo de dominio especifico entrenado sobre un dataset no documentado, pueden existir sesgos en el tratamiento de clientes, productos o situaciones financieras.
- Limitaciones de idioma: no se especifican idiomas soportados; probablemente el dataset sea en ingles (region: us), lo que limita su uso en castellano.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base puede tener su propia licencia (Granite de IBM es de codigo abierto, pero hay que verificar la del base concreto).
- Tamano de contexto desconocido: no se indica la longitud de contexto soportada, lo que afecta a tareas que requieren historiales largos o documentos extensos.
- Sin soporte de vision ni audio: exclusivamente texto.

## Enlaces

- HuggingFace del adaptador: https://huggingface.co/spkc83/retail-bank-servicing-agent-9b-peft-v7-grounded-generation
- Modelo base: https://huggingface.co/spkc83/retail-bank-servicing-agent-9b
- Adaptador previo (v5): https://huggingface.co/spkc83/retail-bank-servicing-agent-9b-peft-v5-remediation
- Adaptador base (v1): https://huggingface.co/spkc83/retail-bank-servicing-agent-9b-peft
- Repositorio GitHub del proyecto: https://github.com/spkc83/retail-bank-servicing
- Dataset de entrenamiento: https://huggingface.co/datasets/spkc83/retail-bank-servicing-alignment-sft
- Variante MoE del mismo proyecto (en FriendliAI): https://friendli.ai/models/spkc83/retail-bank-servicing-moe-9b
