# yungisimon/Qwen2.5-1.5B-giri-msq-entity_grping-ep2

## Resumen

yungisimon/Qwen2.5-1.5B-giri-msq-entity_grping-ep2 es un ajuste fino completo (full fine-tuning) del modelo Qwen/Qwen2.5-1.5B-Instruct, desarrollado por el usuario yungisimon, orientado a una tarea muy concreta: actuar como **modelo de memoria** (memory model) sobre pares de pregunta-respuesta sinteticos derivados del dataset MuSiQue. No se trata de un modelo generalista nuevo, sino de un checkpoint intermedio (epoca 2 de 3) de un experimento de investigacion sobre como un modelo pequeno puede almacenar y recuperar informacion estructurada en formato conversacional.

El modelo parte de la arquitectura Qwen2 de 1.500 millones de parametros (1.543.714.304 exactos segun los pesos en safetensors) y conserva la licencia Apache 2.0 y la plantilla de chat del modelo base. El entrenamiento se realizo con fine-tuning completo mediante FSDP sobre 8 GPU AMD Instinct MI325X, con un total de 1,221,024 ejemplos sinteticos generados con el metodo de agrupacion de entidades `entity_grping` (df maximo 3) y una longitud maxima de secuencia de 8096 tokens.

Su relevancia es acotada pero clara para quien investiga tecnicas de memoria externa en LLM: demuestra que un modelo de 1.5B puede especializarse en una tarea de recuperacion estructurada con un coste de entrenamiento de apenas 1,24 horas en 8 aceleradores. No esta pensado para uso general en produccion, sino como artefacto de investigacion reproducible y como base para experimentos de memoria en agentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la model card (el entrenamiento uso max sequence length 8096; el modelo base Qwen2.5-1.5B-Instruct soporta 32.768 tokens, dato no confirmado para este checkpoint) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; no se documentan versiones GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso de la familia Qwen2, heredado integramente de Qwen/Qwen2.5-1.5B-Instruct. No se ha modificado la arquitectura: el ajuste es un full fine-tuning con el 100% de los parametros entrenables (1.543.714.304). El entrenamiento se ejecuto con FSDP en 8 GPU AMD Instinct MI325X, precision bf16, gradient checkpointing y calculo de perdida unicamente sobre los tokens del asistente. La tasa de aprendizaje fue de 2e-05 constante con warmup del 5%, weight decay 0.01 y max grad norm 1.0. El batch efectivo fue de 256 (32 por dispositivo, sin acumulacion, 8 GPU) y la longitud maxima de secuencia de 8096 tokens.

Los datos de entrenamiento son 1.221.024 ejemplos sinteticos de QA generados a partir de MuSiQue con el metodo de clustering `entity_grping` (agrupacion de entidades con frecuencia documental maxima de 3), almacenados en el fichero `msq_subset1000_numsamplingepochs1_entity_maxdf3_crossdoc_entity_combination_v3.json`. El objetivo declarado es convertir el modelo en un **memory model**: un componente que memoriza y recupera asociaciones pregunta-respuesta estructuradas. El checkpoint publicado corresponde a la epoca 2 de 3; el entrenamiento completo de las 3 epocas supuso 1,24 horas de reloj (9,9 GPU-horas). No se documenta uso de RLHF, DPO ni tecnicas de decodificacion especulativa.

## Capacidades

- Generacion de texto conversacional en formato chat de Qwen (requiere aplicar la plantilla de chat del modelo base).
- Memorizacion y recuperacion de pares pregunta-respuesta sinteticos derivados de MuSiQue, especialmente en escenarios con agrupacion de entidades entre documentos.
- Razonamiento multi-hop basico heredado del modelo base Qwen2.5-1.5B-Instruct, aunque el ajuste esta orientado a la tarea de memoria y no a razonamiento general.
- Soporte de tool calling y function calling: no documentado en la model card; el modelo base lo soporta, pero no hay evidencia de que se preserve tras este ajuste.
- Capacidades de agente y razonamiento multi-paso: no documentadas para este checkpoint.
- Capacidades multilingues: no disponibles (la model card no especifica idiomas ni composicion linguistica del dataset).
- Modo thinking, vision o audio: no disponibles.

## Casos de uso

- Investigacion sobre memoria externa en LLM: usar el modelo como componente de memoria que almacena asociaciones entidad-respuesta y las recupera en conversaciones multi-turno, evaluando su tasa de acierto frente a una base de datos vectorial clasica.
- Reproduccion de experimentos de fine-tuning: el checkpoint permite reproducir el estado intermedio (epoca 2) del entrenamiento descrito en la model card para comparar curvas de aprendizaje y estrategias de clustering (`entity_grping` frente a alternativas).
- Benchmarking de tecnicas de memoria: servir como baseline de 1.5B en tareas de QA multi-hop sobre MuSiQue, comparando con modelos del mismo tamano sin ajuste especifico.
- Prototipado de agentes con memoria estructurada: integrar el modelo en un pipeline donde el agente consulta primero su "memoria interna" antes de recurrir a busqueda externa, reduciendo llamadas a herramientas en escenarios con entidades recurrentes.
- Estudio de olvido catastrofico: al ser un checkpoint intermedio de un full fine-tuning, es util para analizar como evoluciona la retencion de capacidades del modelo base a lo largo de las epocas.
- Generacion de datos sinteticos de QA: el modelo puede emplearse para parafrasear o generar variantes de pares pregunta-respuesta en el mismo dominio (MuSiQue, entidades agrupadas), alimentando pipelines de aumento de datos.
- Docencia y formacion: ejemplo practico y reproducible de full fine-tuning con FSDP en hardware AMD, con hiperparametros y tiempos documentados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 3,1 GB solo para pesos (1.543.714.304 parametros x 2 bytes), mas overhead de activaciones y cache KV; en la practica, entre 4 y 6 GB para secuencias cortas.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 1,6 GB para pesos; en 4 bits, alrededor de 0,8 GB (estimaciones teoricas, no hay versiones cuantizadas publicadas).
- GPU recomendadas: cualquier GPU consumer con 8 GB o mas (RTX 3060 Ti, RTX 4060, RTX 4070, RTX 4090) es suficiente para inferencia en bf16 o cuantizado; para entrenamiento se documenta el uso de 8 AMD Instinct MI325X.
- Cabe en GPU consumer: si, con holgura en modelos de 8 GB o superiores.
- Opciones de despliegue: transformers (`AutoModelForCausalLM.from_pretrained`), text-generation-inference (el tag `text-generation-inference` y `endpoints_compatible` estan presentes), vLLM (compatible con arquitectura Qwen2, no verificado para este checkpoint), llama.cpp/Ollama solo si se genera una version GGUF (no publicada).
- Latencia y throughput: no disponibles; el tamano del modelo sugiere decodificacion de decenas de tokens por segundo en GPU consumer, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Orientacion |
|---|---|---|---|---|
| yungisimon/Qwen2.5-1.5B-giri-msq-entity_grping-ep2 | 1,54B | no disponible (entrenado a 8096) | Apache 2.0 | Memory model sobre MuSiQue |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54B | 32.768 tokens | Apache 2.0 | Instrucciones generales |
| Qwen/Qwen2.5-1.5B | 1,54B | 32.768 tokens | Apache 2.0 | Base sin ajuste |
| Meta Llama 3.2 1B Instruct | 1,24B | 128.000 tokens | Llama 3.2 Community License | Instrucciones generales |

La comparacion con el modelo base es la mas relevante: este checkpoint hereda el tamano y la licencia de Qwen2.5-1.5B-Instruct, pero sustituye la orientacion generalista por una especializacion en memoria estructurada, con el coste previsible de degradar capacidades generales no relacionadas con la tarea. No hay datos de rendimiento publicados que permitan cuantificar esa degradacion.

## Limitaciones y advertencias

- Modelo de investigacion: es un checkpoint intermedio (epoca 2 de 3) de un experimento, no un modelo final ni validado para produccion.
- Especializacion estrecha: entrenado exclusivamente con pares QA sinteticos de MuSiQue con clustering `entity_grping`; su comportamiento fuera de ese dominio no esta documentado y probablemente sea deficiente.
- Riesgo de sobreajuste al formato: al calcular la perdida solo sobre tokens del asistente y entrenar con un unico esquema de datos, puede reproducir patrones del dataset sintetico en lugar de razonar de forma general.
- Riesgo de alucinacion: como todo LLM, puede inventar respuestas; en un modelo de memoria esto es especialmente problematico porque el usuario espera recuperacion fiel de informacion almacenada.
- Idiomas: no documentados; no hay garantia de soporte multilingue mas alla del heredado del modelo base.
- Sesgos: no evaluados ni documentados; los sesgos del dataset sintetico derivado de MuSiQue se transfieren al modelo.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base Qwen2.5-1.5B-Instruct tambien es Apache 2.0, por lo que no hay restricciones adicionales conocidas; aun asi, conviene verificar la procedencia de los datos de MuSiQue si se redistribuye con fines comerciales.
- Sin versiones cuantizadas publicadas: desplegarlo en entornos con poca VRAM requiere generar las cuantizaciones uno mismo.
- Sin benchmarks ni evaluacion: no hay evidencia publica de su calidad frente al modelo base en ninguna tarea.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yungisimon/Qwen2.5-1.5B-giri-msq-entity_grping-ep2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Dataset MuSiQue (referencia del dominio de entrenamiento): no disponible en la informacion proporcionada
- Paper de MuSiQue: no disponible en la informacion proporcionada
- Repositorio de codigo o demo: no disponible en la informacion proporcionada
