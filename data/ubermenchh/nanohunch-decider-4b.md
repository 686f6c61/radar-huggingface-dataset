# ubermenchh/nanohunch-decider-4b

## Resumen

nanohunch-decider-4b es un adaptador LoRA de rango 16 sobre Qwen3-4B-Instruct-2507, desarrollado por el usuario independiente ubermenchh. Su funcion no es generar texto, sino devolver probabilidades calibradas para preguntas de decision tipadas: eleccion multiple (choice), si/no (noul) y puntuacion ordinal (score). El modelo aplica softmax sobre los logits de las etiquetas de respuesta en el ultimo token, de modo que cada consulta requiere una sola pasada forward sin decodificacion autoregresiva.

El adaptador se entrena sobre 4.000 preguntas de decision con objetivos suaves (la probabilidad del profesor en lugar de una etiqueta dura), y se evalua en el benchmark OpenDecisions (2.352 preguntas reservadas), donde alcanza una capacidad de 57,1 puntos frente a los 53,1 del Qwen3-4B-Base sin entrenar. La metrica de capacidad se define como (Inteligencia + Calibracion) / 2 segun el script de puntuacion del propio dataset.

Es un artefacto de investigacion, no un modelo de produccion. Se distribuye en dos formatos (PEFT para transformers y MLX para Apple Silicon) bajo licencia Apache 2.0. Su relevancia radica en demostrar que un adaptador pequeno puede mejorar la calibracion de un modelo de 4B en tareas de decision estructurada sin generar texto, lo que reduce latencia y coste en pipelines de clasificacion y enrutamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rango 16, alpha 32) sobre Qwen3-4B-Instruct-2507 (transformer decoder-only) |
| Parametros totales | 4B (modelo base); adaptador LoRA: no disponible con precision (fichero de 132 MB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen3-4B-Instruct-2507) |
| Tipos de cuantizacion | No disponible (pesos publicados en bfloat16 para PEFT y en formato MLX) |
| Idiomas soportados | No disponible (heredados del modelo base) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PEFT), npz (MLX) |

## Arquitectura y entrenamiento

El adaptador aplica LoRA de rango 16 con alpha 32 sobre las siete proyecciones de las 36 capas del modelo base Qwen3-4B-Instruct-2507. El entrenamiento utiliza 4.000 preguntas de decision con objetivos suaves, es decir, la distribucion de probabilidad del profesor en lugar de una etiqueta discreta, lo que permite al adaptador aprender la calibracion del profesor y no solo la respuesta correcta. Todas las temperaturas se fijan a 1: el autor documenta que una temperatura ajustada sobre preguntas reservadas reducia las puntuaciones de OpenDecisions en modelos con objetivos suaves, por lo que conserva los valores ajustados solo como referencia (`temp_fitted_on_decider_hard`).

La innovacion principal es el formato de pregunta tipada: choice (hasta 8 opciones con nombre y descripcion), noul (si/no con criterios opcionales `true`/`false`) y score (niveles ordinales de 2 a 10, de menor a mayor). La respuesta se obtiene leyendo los logits de las etiquetas de respuesta en el ultimo token y aplicando softmax, sin generar texto. El adaptador se publica en dos formatos equivalentes: PEFT (convertido desde MLX con `to_peft.py` y verificado en 40 preguntas del benchmark, con la misma respuesta top en las 40 y probabilidades dentro de 0,022) y MLX nativo.

## Capacidades

- Clasificacion de decision con probabilidades calibradas: devuelve una distribucion de probabilidad sobre opciones nombradas, no una respuesta generada.
- Preguntas de eleccion multiple (choice) con hasta 8 opciones, cada una con nombre y descripcion.
- Preguntas de si/no (noul) con criterios opcionales que describen cada respuesta.
- Preguntas de puntuacion ordinal (score) con entre 2 y 10 niveles ordenados de menor a mayor.
- Entrada de estado flexible: texto plano, diccionario o lista (se serializa como JSON).
- Inferencia de una sola pasada forward por pregunta, sin decodificacion autoregresiva.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un cabezal de decision, no un modelo conversacional.
- Capacidades multilingues: no documentadas de forma especifica; dependen del modelo base.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo clasifica el estado de la conversacion en categorias como reembolso, reemplazo o consulta informativa, y decide si escalar a un agente humano mediante una pregunta noul. La salida probabilistica permite fijar umbrales de derivacion.
- Triaje de urgencia: con una pregunta score de 4 niveles (no urgente, algo urgente, urgente, critico) sobre el texto del ticket, se obtiene una distribucion ordinal que alimenta colas de atencion priorizadas.
- Moderacion de contenido: preguntas noul sobre si un texto cumple una politica concreta, con la probabilidad como senal de confianza para revision humana.
- Extraccion de intencion en asistentes: dado el turno del usuario, una pregunta choice con las intenciones definidas del dominio devuelve la probabilidad de cada una, util para desambiguar antes de invocar herramientas.
- Clasificacion de documentos y correos: preguntas choice sobre tipo de documento, departamento destinatario o accion requerida, con una sola pasada por documento y sin coste de generacion.
- Evaluacion de calidad de respuestas: preguntas score sobre correccion, relevancia o tono de una respuesta generada, usando la calibracion para filtrar salidas dudosas en pipelines de RLHF o evaluacion automatica.
- Investigacion en calibracion: el adaptador y su codigo sirven como banco de pruebas reproducible para estudiar objetivos suaves y calibracion en modelos de 4B, con el benchmark OpenDecisions como referencia.

## Benchmarks y rendimiento

| Benchmark | Metrica | nanohunch-decider-4b | Qwen3-4B-Base |
|---|---|---|---|
| OpenDecisions (2.352 preguntas reservadas) | Capacidad = (Inteligencia + Calibracion) / 2 | 57,1 (media de 4 semillas, desviacion tipica 1,0) | 53,1 |

El autor indica que diferencias inferiores a 2 puntos no se consideran significativas segun los autores del dataset. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 8 GB para el modelo base en bfloat16 mas el adaptador de 132 MB; en cuantizacion de 4 bits el modelo base requeriria del orden de 2-3 GB, aunque el autor no publica pesos cuantizados.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bfloat16 (RTX 3090, RTX 4090, A10, L4); A100 o H100 sobredimensionadas para este tamano.
- Cabe en GPU de consumo: si, en RTX 3090, RTX 4090 y tarjetas con 8 GB o mas en bfloat16; el ejemplo de la model card se ejecuto en CPU.
- Apple Silicon: probado en un Mac con 24 GB de memoria unificada, con un consumo de unos 8 GB.
- Opciones de despliegue: transformers + peft (PEFT/safetensors), MLX en Apple Silicon o Linux con `mlx[cuda12]`; el autor no documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; al requerir una sola pasada forward sin generacion, la latencia es sustancialmente menor que la de un modelo generativo del mismo tamano, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nanohunch-decider-4b | 4B (base) + LoRA r16 | No disponible | Decision tipada con probabilidades calibradas | Apache 2.0 | Hugging Face (PEFT y MLX) |
| Qwen3-4B-Instruct-2507 | 4B | No disponible | Generacion de texto instructiva | Apache 2.0 | Hugging Face |
| Qwen3-4B-Base | 4B | No disponible | Modelo base sin ajuste | Apache 2.0 | Hugging Face |

La comparativa con alternativas especializadas en calibracion o clasificacion con probabilidades no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Es un artefacto de investigacion, no un modelo de produccion; el autor lo declara explicitamente.
- No genera texto: solo devuelve probabilidades sobre etiquetas de respuesta predefinidas.
- La sensibilidad al orden de las opciones puede cambiar ligeramente la respuesta; el autor mide la tasa de inversion en la documentacion publica del dataset.
- La calibracion se evalua unicamente en OpenDecisions; no hay evidencia de calibracion fuera de ese dominio.
- La temperatura debe mantenerse a 1; ajustarla sobre preguntas reservadas degrada las puntuaciones en modelos con objetivos suaves.
- Maximo de 8 opciones por pregunta y entre 2 y 10 niveles en preguntas score.
- No soporta tool calling, agentes ni razonamiento multi-paso.
- Idiomas soportados no documentados; el comportamiento fuera del ingles no esta caracterizado.
- Riesgo de sesgo y alucinacion heredado del modelo base Qwen3-4B-Instruct-2507, no evaluado de forma especifica para este adaptador.
- Licencia Apache 2.0 permite uso comercial, pero sin garantias ni soporte del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ubermenchh/nanohunch-decider-4b
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Repositorio GitHub: https://github.com/ubermenchh/nanohunch
- Script de conversion a PEFT: https://github.com/ubermenchh/nanohunch/blob/main/to_peft.py
- Script de inferencia MLX: https://github.com/ubermenchh/nanohunch/blob/main/ask.py
- Dataset OpenDecisions: https://huggingface.co/datasets/jgeuter/OpenDecisions
- Paper de referencia (LoRA): https://arxiv.org/abs/2106.09685
- Paper de referencia (calibracion, arxiv:1706.04599): https://arxiv.org/abs/1706.04599
- Paper de referencia (destilacion, arxiv:1503.02531): https://arxiv.org/abs/1503.02531
