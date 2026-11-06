# ZBox008003/AgentForesight-7B

## Resumen

AgentForesight-7B es un modelo de lenguaje especializado en la auditoría en línea de sistemas multiagente. Desarrollado por ZBox008003, se construye sobre Qwen2.5-7B-Instruct mediante un ajuste fino en dos etapas (BPPO y GRPO) y resuelve un problema concreto: detectar el error decisivo en una trayectoria de agentes mientras esta se desarrolla, sin acceso al futuro de la traza. A diferencia de la atribución de fallos post hoc, que inspecciona una trayectoria completa con retrospectiva total, este modelo solo ve el prefijo observado hasta cada paso y debe decidir si permite continuar la ejecución o lanza una alarma en el paso exacto donde el fallo se propaga.

El modelo cuenta con 7.615.616.512 parámetros en formato bfloat16, una ventana de contexto de 32.768 tokens y una licencia Apache 2.0. Su relevancia actual radica en que aborda un contrato operativo más exigente que la simple clasificación de seguridad: exige identificar simultáneamente el qué (seguro o inseguro), el dónde (paso exacto) y el quién (agente responsable), lo que lo hace adecuado para orquestadores de agentes en producción que necesitan intervenir antes de que un error se consolide.

La propuesta destaca por su receta de entrenamiento en dos fases y por los resultados reportados en el artículo asociado, donde supera a modelos propietarios de mayor tamaño en Exact-F1 bajo el protocolo de auditoría en línea. No obstante, la propia model card advierte que la evaluación se realizó sobre el mismo split suministrado como validación durante el entrenamiento, una salvedad importante que se detalla en las secciones posteriores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2ForCausalLM) |
| Parametros totales | 7.615.616.512 (7,6B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | No disponible en la informacion proporcionada; el checkpoint se distribuye en bfloat16 |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); tamano del repo 15,2 GB |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso derivado de Qwen/Qwen2.5-7B-Instruct, con 7,6B parámetros en bfloat16. El entrenamiento sigue una receta de grueso a fino en dos etapas. La primera, denominada BPPO (Boundary-Pair Preference Optimization), aplica un objetivo de preferencia de estilo DPO sobre pares de frontera: prefijos cortados justo antes frente a justo después del error decisivo, con β = 0,1, learning rate 5e-7 y 3 épocas partiendo del modelo base. Esta fase instala un prior de anticipación de riesgo en la frontera del fallo.

La segunda etapa aplica GRPO (Group Relative Policy Optimization) inicializado desde el modelo de la etapa 1 y anclado por KL a él, con una recompensa sobre tres ejes: qué (seguro frente a inseguro), dónde (paso exacto) y quién (agente responsable), además de validación estricta del formato de salida. El script de lanzamiento conservado especifica 8 épocas y validación periódica cada 5 pasos, con `data.val_files` apuntando a `data/training_v16/test.parquet`, que contiene los mismos 332 IDs de trayectoria usados en la evaluación del artículo. No se documenta un split independiente de selección de checkpoint, por lo que el checkpoint del paso 480 no debe describirse como seleccionado sobre un conjunto de validación independiente. La ablación de la receta, con el mismo protocolo de evaluación, arroja Exact-F1 global de 21,05 para el modelo base, 35,63 con solo BPPO, 50,42 con solo GRPO sin inicialización BPPO y 66,44 con la receta completa. El checkpoint publicado corresponde al paso global 480 de la etapa 2, fusionado a formato Hugging Face.

## Capacidades

- Auditoría en línea de trayectorias multiagente: recibe el prefijo observado hasta el paso k y decide continuar o lanzar alarma en el error decisivo.
- Predicción temprana de fallos con identificación del paso exacto y del agente responsable.
- Clasificación de seguridad de la ejecución (safe frente a unsafe) junto con la atribución del fallo.
- Razonamiento paso a paso en un bloque `<think>` que referencia números de paso y nombres de agente concretos.
- Salida estructurada estricta en dos bloques (`<think>` y `<answer>`) con JSON que contiene los campos `answer`, `agent` y `reason`.
- Soporte de tres dominios de evaluación: matemáticas, código y tareas agénticas.
- Capacidad multilingüe limitada al inglés.
- No se documentan capacidades de tool calling, function calling, visión, audio ni modo de pensamiento extendido más allá del razonamiento interno del bloque `<think>`.

## Casos de uso

- Orquestación de agentes en producción: el modelo se interroga en cada paso de una trayectoria multiagente y, si detecta el error decisivo, el orquestador puede detener la ejecución antes de que el fallo se propague; su ventana de 32.768 tokens permite mantener el prefijo completo de trazas largas.
- Monitorización de pipelines de resolución matemática: en sistemas que encadenan agentes para resolver problemas, el modelo identifica el paso exacto donde un cálculo erróneo compromete el resultado final, con un ASS reportado de 0,96 en el dominio de matemáticas.
- Supervisión de generación de código agéntica: integrado en flujos donde varios agentes colaboran en tareas de programación, detecta el paso defectuoso con un ASS de 0,18 en el dominio de código, lo que permite revertir a un estado consistente antes de consolidar el error.
- Auditoría de sistemas de atención al cliente basados en agentes: cuando varios agentes gestionan una conversación multi-turno, el modelo puede señalar qué agente y en qué turno introdujo una decisión incorrecta, facilitando la escalada a un humano.
- Control de calidad de trazas registradas en modo casi en línea: al reproducir una traza paso a paso, el modelo emite la primera alarma como respuesta comprometida, lo que sirve para etiquetar fallos en datasets de evaluación de sistemas agénticos.
- Investigación en atribución de fallos: el modelo y el dataset AFTraj-2K permiten reproducir experimentos de auditoría en línea y comparar con métodos post hoc, con las predicciones por muestra almacenadas en el directorio `eval/` del repositorio.
- Filtrado previo en pipelines de RL para agentes: las alarmas tempranas pueden usarse como señal de recompensa o de descarte durante el entrenamiento de políticas multiagente, evitando ejecutar trayectorias completas que ya se sabe que fallarán.

## Benchmarks y rendimiento

Evaluación sobre el split de paper de AFTraj-2K (332 trayectorias: 163 inseguras / 169 seguras) bajo el protocolo de auditoría en línea. Exact-F1 es la media armónica de precisión y recall del paso exacto; ASS (Absolute Step Shift) es la media de |paso predicho − paso real| sobre trayectorias inseguras detectadas.

| Metodo | Math F1 | Math ASS | Coding F1 | Coding ASS | Agentic F1 | Agentic ASS | Overall F1 | Overall ASS |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Qwen2.5-7B-Instruct (backbone) | 10,39 | 3,80 | 38,20 | 2,26 | 14,00 | 2,96 | 21,05 | 2,75 |
| GPT-4.1 | 24,39 | 3,95 | 10,81 | 3,50 | 40,68 | 1,29 | 27,43 | 2,67 |
| Gemini-3-Flash | 40,52 | 2,48 | 19,42 | 2,73 | 26,09 | 1,70 | 29,74 | 2,19 |
| Claude-Haiku-4.5 | 19,75 | 4,12 | 23,91 | 2,80 | 31,95 | 1,69 | 25,53 | 2,85 |
| DeepSeek-V4-Flash | 42,77 | 2,78 | 38,10 | 1,27 | 32,53 | 1,42 | 37,65 | 1,94 |
| DeepSeek-V4-Pro (mejor baseline) | 50,34 | 2,60 | 49,32 | 0,96 | 41,77 | 1,31 | 46,56 | 1,77 |
| AgentDebug-7B (post hoc, retrospectiva total) | 0,00 | — | 28,57 | 4,05 | 2,82 | 1,00 | 9,63 | 3,76 |
| AgentForesight-7B (este modelo) | 77,36 | 0,96 | 78,87 | 0,18 | 48,70 | 0,54 | 66,44 | 0,59 |

Métricas adicionales a nivel de detección para este checkpoint (global): precisión de detección 96,90, recall de detección 76,69, F1 de detección 85,62, tasa de falsa alarma 2,37% (4/169 ejecuciones seguras) y precisión conjunta 78,92. Las filas de baseline están citadas del artículo. La fila de AgentForesight-7B puede recalcularse a partir de las predicciones por muestra almacenadas en el directorio `eval/` del repositorio. Advertencia de procedencia: este mismo split se suministró como `data.val_files` durante el entrenamiento de la etapa 2, por lo que la tabla es un resultado sobre el split de evaluación del artículo y no una estimación sobre un conjunto de test independiente del proceso de selección de checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint en bfloat16 ocupa aproximadamente 15,2 GB de pesos, por lo que se necesitan al menos 16 GB de VRAM solo para los pesos, más el espacio para la caché KV correspondiente a una ventana de hasta 32.768 tokens, que puede elevar el requisito considerablemente en trazas largas.
- GPU recomendadas: A100 (40/80 GB) o H100 para despliegues con contexto completo y concurrencia; RTX 4090 (24 GB) para inferencia en bfloat16 con contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en bfloat16 con margen limitado; en GPUs de 16 GB requeriría cuantización, para la cual no se documentan formatos en la información disponible.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (etiqueta del repositorio) y endpoints compatibles; no se documentan integraciones con vLLM, llama.cpp ni Ollama.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Overall F1 (auditoría en línea) | Overall ASS | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| AgentForesight-7B | 7,6B denso | 32.768 | 66,44 | 0,59 | Apache 2.0 | Pesos abiertos en Hugging Face |
| Qwen2.5-7B-Instruct (backbone) | 7,6B denso | 32.768 | 21,05 | 2,75 | Apache 2.0 | Pesos abiertos |
| DeepSeek-V4-Pro | No disponible | No disponible | 46,56 | 1,77 | No disponible | Baseline propietario citado en el paper |
| AgentDebug-7B | 7B (aproximado) | No disponible | 9,63 | 3,76 | No disponible | Método post hoc citado en el paper |

La comparación se limita a la tarea de auditoría en línea sobre AFTraj-2K; los datos de parámetros, contexto y licencia de los baselines propietarios no están disponibles en la información proporcionada. El modelo supera al mejor baseline en Exact-F1 global por 19,88 puntos y reduce el ASS en un factor de 3.

## Limitaciones y advertencias

- La evaluación principal se realizó sobre el mismo split suministrado como validación durante el entrenamiento de la etapa 2; no se documenta un conjunto de test independiente del proceso de selección de checkpoint, por lo que los resultados pueden estar optimistas.
- El modelo espera un system prompt exacto (`prompts/system_prompt.txt`, constructor en `prompts/prompts_v16.py`); desviarse de él puede degradar el formato de salida y el rendimiento.
- La salida es estricta en dos bloques con JSON validado; respuestas fuera de formato deben tratarse como fallo del parser en producción.
- Solo soporta inglés, lo que limita su uso en sistemas multiagente en otros idiomas.
- La revisión exacta del modelo base Qwen2.5-7B-Instruct no está fijada por commit, lo que afecta a la reproducibilidad exacta del entrenamiento.
- El dataset público normaliza los IDs de llamadas a herramientas en las trayectorias de matemáticas y código, por lo que no reproduce el flujo de tokens de prompt original en esos dominios; una ejecución de inferencia nueva depende de los tokens de prompt exactos, el protocolo del runner, el split fijado del dataset y los ficheros del modelo.
- Tasa de falsa alarma reportada del 2,37% (4 de 169 ejecuciones seguras), aceptable pero no nula en producción.
- Recall de detección del 76,69%, lo que implica que aproximadamente una de cada cuatro trayectorias inseguras no se detecta.
- No se documentan sesgos específicos más allá de los heredados del modelo base Qwen2.5-7B-Instruct; el riesgo de alucinación en la atribución de agente y paso existe y no se cuantifica de forma independiente.
- La licencia Apache 2.0 permite uso comercial, pero la ausencia de una evaluación sobre test independiente aconseja validar el modelo en el dominio objetivo antes de desplegarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ZBox008003/AgentForesight-7B
- Dataset AFTraj: https://huggingface.co/datasets/ZBox008003/AFTraj
- Paper (arXiv): https://arxiv.org/abs/2605.08715
- Página del proyecto: https://zbox1005.github.io/agent-foresight/
- Código: https://github.com/ZBox1005/AgentForesight
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
