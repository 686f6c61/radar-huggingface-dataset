# XinyiY1226/gdpo-cond-search-qwen3.5-4b-think-s150

## Resumen

gdpo-cond-search-qwen3.5-4b-think-s150 es un ajuste fino del modelo Qwen/Qwen3.5-4B orientado a tareas de busqueda agéntica multi-salto (multi-hop QA). Lo desarrolla el usuario XinyiY1226 y se entrena mediante aprendizaje por refuerzo con una variante de GRPO denominada gDPO (group Direct Preference Optimization, segun los tags del repositorio), implementada sobre la libreria verl. El objetivo es que el modelo aprenda a decidir *cuando* y *cuanto* buscar en un entorno de recuperacion de informacion, condicionado por un presupuesto de busqueda (budget-conditioned search).

El modelo parte de la arquitectura Qwen3.5 de 4B parametros y se especializa en razonamiento de multiples pasos sobre documentos recuperados, con un modo de pensamiento explicito (sufijo `think` en el nombre). Se entrena sobre HotpotQA y MuSiQue, dos benchmarks clasicos de QA multi-salto que exigen encadenar evidencia de varios documentos.

Es relevante porque aborda un problema practico de los agentes de busqueda: el coste y la latencia de las llamadas al retriever. Al condicionar el comportamiento a un presupuesto, el modelo puede operar en regimenes de bajo coste o de alta precision segun la necesidad, algo poco habitual en modelos abiertos de este tamano. El acceso esta restringido en HuggingFace y requiere aceptar condiciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5) |
| Parametros totales | 4.539.265.536 (4,54 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizaciones GGUF/AWQ no publicadas en la informacion disponible) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3.5-4B |
| Metodo de entrenamiento | RL con gDPO (variante de GRPO) sobre verl |
| Datasets de entrenamiento | hotpotqa/hotpot_qa, dgslibisey/MuSiQue |
| Tamano del repositorio | 9,1 GB |
| Acceso | restringido (gated) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer decoder-only de Qwen3.5-4B, sin cambios estructurales documentados. El entrenamiento consiste en un ajuste por refuerzo sobre el checkpoint base, no en un preentrenamiento desde cero: se parte de los pesos de Qwen/Qwen3.5-4B y se optimiza la politica del agente de busqueda con gDPO, una variante de optimizacion de preferencias por grupos implementada sobre verl (Volcano Engine Reinforcement Learning). El nombre del checkpoint (`s150`) sugiere el paso o iteracion de entrenamiento 150, aunque no se detalla en la informacion disponible.

Los datos de entrenamiento son HotpotQA y MuSiQue, ambos en ingles y centrados en preguntas que requieren combinar evidencia de varios pasajes. La innovacion principal es el condicionamiento por presupuesto: el modelo recibe una restriccion de numero de busquedas y aprende a planificar sus llamadas al retriever en funcion de ese limite, equilibrando exploracion y explotacion. El sufijo `think` indica que el modelo genera una traza de razonamiento antes de la respuesta final. No se especifican en la informacion disponible el volumen de tokens de entrenamiento, la composicion exacta del dataset ni si se aplico RLHF adicional o DPO tras la fase de RL.

## Capacidades

- Generacion de texto conversacional en ingles con modo de razonamiento explicito (thinking).
- Razonamiento multi-salto sobre evidencia recuperada: encadenar informacion de varios documentos para responder una pregunta.
- Busqueda agéntica condicionada por presupuesto: decidir cuantas consultas al retriever realizar segun un limite dado.
- Formulacion de consultas de busqueda intermedias como parte del bucle de agente.
- Soporte de tool calling orientado a un retriever externo (el entorno de entrenamiento es de busqueda, no de herramientas genericas).
- Capacidades multilingues limitadas al ingles segun la metadata del repositorio.
- No se documentan capacidades de vision, audio ni otras modalidades.

## Casos de uso

- QA sobre documentacion corporativa: el modelo puede recibir un presupuesto de 2-3 busquedas y responder preguntas que requieren cruzar informacion de varias secciones de un manual o base de conocimiento, controlando el coste de las llamadas al indice vectorial.
- Asistentes de investigacion bibliografica: encadenar busquedas sobre abstracts y textos completos para sintetizar respuestas con evidencia de multiples fuentes, con un limite configurable de consultas por consulta de usuario.
- Pipelines de RAG con latencia acotada: en produccion, fijar un presupuesto bajo (1-2 busquedas) para escenarios de baja latencia y uno alto (5 o mas) para tareas de analisis, usando el mismo checkpoint.
- Evaluacion de sistemas de recuperacion: al ser un agente de busqueda entrenado, sirve como componente de referencia para medir si un retriever nuevo mejora el rendimiento en HotpotQA o MuSiQue.
- Automatizacion de soporte tecnico multi-fuente: responder incidencias que requieren consultar varios articulos de una base de conocimiento, con trazas de razonamiento auditables gracias al modo think.
- Investigacion en RL para agentes: el checkpoint y la receta gDPO sobre verl son utiles como punto de partida para experimentar con condicionamiento por presupuesto en otros dominios de recuperacion.
- Generacion de respuestas con citas verificables: el bucle de busqueda produce evidencia intermedia que puede registrarse y mostrarse al usuario final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: aproximadamente 9-10 GB solo para pesos, mas overhead de KV cache y activaciones; en la practica, 16-24 GB para contextos moderados.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 5-6 GB de pesos; en 4 bits, alrededor de 3 GB, aunque no se publican cuantizaciones oficiales en la informacion disponible.
- GPU recomendadas: A100 40/80 GB o H100 para servicio concurrente y contextos largos; RTX 4090 (24 GB) para inferencia en BF16 de una sola instancia; RTX 3090 o 4080 (16-24 GB) viables con cuantizacion.
- Cabe en GPU de consumo: si, en tarjetas con 16 GB o mas en BF16 y en tarjetas de 8-12 GB con cuantizacion de 4-8 bits.
- Opciones de despliegue: vLLM y TGI para servicio de alto throughput; llama.cpp u Ollama si se generan pesos GGUF; el bucle agéntico requiere ademas un orquestador que gestione las llamadas al retriever.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gdpo-cond-search-qwen3.5-4b-think-s150 | 4,54 B | no disponible | Busqueda agéntica multi-salto con presupuesto | Apache 2.0 | Gated en HuggingFace |
| Qwen/Qwen3.5-4B (base) | ~4 B | no disponible | Proposito general | Apache 2.0 (segun modelo base) | Publico |
| Search-R1 y variantes (familia) | 3-7 B tipicamente | no disponible | RL para busqueda con retriever | variable | Publicos |

La comparacion con Search-R1 se incluye por categoria de tarea (agentes de busqueda entrenados con RL), pero no se dispone de datos de rendimiento del modelo evaluado que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Entrenado exclusivamente en ingles; el rendimiento en castellano u otros idiomas no esta validado y probablemente sea deficiente.
- Especializado en QA multi-salto sobre HotpotQA y MuSiQue; puede degradarse en tareas genericas de generacion o codigo respecto al modelo base.
- Riesgo de alucinacion en las respuestas finales, especialmente si el retriever devuelve pasajes irrelevantes; el modo think no garantiza fidelidad a la evidencia.
- El condicionamiento por presupuesto asume un entorno de busqueda concreto; el comportamiento fuera de ese formato de prompt no esta documentado.
- Acceso restringido en HuggingFace: requiere aceptar condiciones, lo que puede complicar la reproducibilidad y el despliegue automatizado.
- Licencia Apache 2.0 permite uso comercial, pero deben verificarse las condiciones del modelo base Qwen3.5-4B y de los datasets de entrenamiento.
- Sin resultados de benchmarks publicados ni cuantizaciones oficiales; el rendimiento real en produccion debe validarse con evaluacion propia.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validacion independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/XinyiY1226/gdpo-cond-search-qwen3.5-4b-think-s150
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset HotpotQA: https://huggingface.co/datasets/hotpotqa/hotpot_qa
- Dataset MuSiQue: https://huggingface.co/datasets/dgslibisey/MuSiQue
- Libreria verl: no disponible en la informacion proporcionada
- Paper o blog del metodo gDPO: no disponible en la informacion proporcionada
