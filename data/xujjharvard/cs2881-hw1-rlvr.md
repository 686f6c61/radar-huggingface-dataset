# XujjHarvard/cs2881-hw1-rlvr

## Resumen

XujjHarvard/cs2881-hw1-rlvr es un ajuste fino supervisado mediante RLVR (Reinforcement Learning with Verifiable Rewards) sobre Qwen/Qwen2.5-3B-Instruct, publicado por el usuario XujjHarvard como entrega de la asignatura CS2881 (Harvard). El modelo se entrenó con GRPO usando como recompensa un verificador basado en reglas sobre OpenBookQA, dentro de lo que la model card denomina "Setting B". El resultado declarado es una mejora de la capacidad en OpenBookQA de 0,762 a 0,808, manteniendo la persona original ("persona held"). No es un modelo de propósito general nuevo, sino un experimento académico de optimización de razonamiento con recompensas verificables sobre una base ya instruida.

El repositorio contiene el modelo fusionado (merged) en la raíz y el adaptador LoRA aislado en `adapter/`, lo que permite tanto usar el checkpoint completo como reproducir el ajuste o separarlo. El peso real del checkpoint en safetensors es de 3.085.938.688 parámetros (aproximadamente 3,09 mil millones), coherente con la arquitectura Qwen2 de 3B, y el repositorio ocupa 6,4 GB.

Su relevancia es principalmente metodológica y docente: ilustra un pipeline completo de RLVR con GRPO sobre un modelo pequeño, con verificación programática de la respuesta en lugar de un modelo juez. Para producción, hay que tener en cuenta que es un artefacto de curso con 0 descargas y 0 "likes", sin evaluación publicada más allá de OpenBookQA y sin información declarada sobre idiomas o cuantizaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen2 (modelo base Qwen2.5-3B-Instruct) con ajuste LoRA fusionado; detalles de capas y cabezas no disponibles en la model card |
| Parametros totales | 3.085.938.688 (aprox. 3,09 B, segun safetensors del repositorio) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base Qwen2.5-3B-Instruct declara 32.768 tokens (ampliable hasta 131.072 con YaRN) |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos en precision completa; no hay GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (modelo fusionado en la raiz del repositorio) y adaptador LoRA en `adapter/` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-3B-Instruct: un transformer decoder-only denso con atención de consultas agrupadas (GQA) y normalización RMSNorm, preentrenado e instruido por Alibaba. Sobre ese checkpoint se aplicó un ajuste fino con LoRA que después se fusionó en los pesos base, de ahí que el repositorio tenga dos artefactos: el modelo completo listo para inferencia y el adaptador original. No se especifican en la información disponible el rango del LoRA, los módulos objetivo, la tasa de aprendizaje ni el número de pasos.

El método de entrenamiento es RLVR con GRPO (Group Relative Policy Optimization): en lugar de un modelo de recompensa aprendido, se emplea un verificador basado en reglas sobre OpenBookQA que comprueba automáticamente si la respuesta es correcta. Según la model card, se trata de la continuación del "Setting B" y el objetivo era subir capacidad manteniendo la persona del modelo. La única métrica reportada es OpenBookQA, que pasa de 0,762 a 0,808. No se documentan datos de entrenamiento adicionales, composición del dataset, número de tokens, ni si hubo fases de SFT o DPO posteriores.

## Capacidades

- Generación de texto y respuesta a instrucciones, heredadas del modelo base Qwen2.5-3B-Instruct.
- Razonamiento de opción múltiple sobre conocimiento factual, reforzado específicamente con el verificador de OpenBookQA.
- Razonamiento en varios pasos (multi-step) dentro de los límites de un modelo de 3B; el RLVR con GRPO está diseñado para premiar cadenas que llegan a la respuesta correcta.
- Codigo y matematicas basicas: capacidades propias del modelo base, pero no hay evidencia en la informacion disponible de que el ajuste las mejore o las degrade.
- Tool calling / function calling: no confirmado en este checkpoint; el modelo base Qwen2.5-3B-Instruct soporta plantillas de herramientas, pero el ajuste con LoRA puede haber alterado el formato de salida.
- Capacidades de agente y uso de herramientas: no disponibles como capacidad verificada.
- Modo "thinking" explicito: no disponible.
- Vision y audio: no soportados (modelo exclusivamente de texto).
- Capacidades multilingues: no documentadas en la model card.

## Casos de uso

- Reproduccion de experimentos de RLVR: el repositorio incluye el adaptador LoRA en `adapter/`, de modo que un grupo de investigacion puede reaplicar GRPO con un verificador propio y comparar contra este punto de partida.
- Ejercicios docentes de alineacion: sirve como ejemplo cerrado de pipeline "base instruido -> LoRA -> GRPO con recompensa verificable -> merge" para cursos de aprendizaje por refuerzo aplicado a LLM.
- Evaluacion de QA de conocimiento abierto: el modelo esta optimizado para preguntas de tipo OpenBookQA, por lo que encaja en tareas de respuesta de opcion multiple con contexto breve.
- Generacion de datos sinteticos de razonamiento: puede producir cadenas de razonamiento que luego se filtran con un verificador programatico antes de usarse como datos de entrenamiento de modelos mayores.
- Prototipado local en equipos con GPU de consumo: con 3,09 B de parametros cabe en GPUs de 8-12 GB en cuantizacion INT4, lo que permite iterar sin coste de API.
- Baselines internos de comparacion: al ser un ajuste pequeño y reproducible, resulta util como referencia de "suelo" frente a modelos mas grandes en tareas de QA verificable.
- Fine-tuning posterior sobre dominio propio: al ser apache-2.0 y derivar de Qwen2.5, admite continuar el entrenamiento con datos propios sin restricciones de licencia.

## Benchmarks y rendimiento

La model card reporta un unico resultado, sobre OpenBookQA, con verificador basado en reglas:

| Benchmark | Antes (Setting A / base) | Despues (RLVR + GRPO) | Variacion |
|---|---|---|---|
| OpenBookQA (exactitud) | 0,762 | 0,808 | +0,046 |

No se han publicado resultados de benchmarks adicionales (MMLU, GSM8K, HumanEval, BBH, MT-Bench u otros) en la informacion disponible. No se han publicado cifras de latencia ni de throughput en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin cache KV): unos 6,2 GB en FP16/BF16 (el repositorio completo ocupa 6,4 GB), alrededor de 3,2 GB en INT8 y 1,8-2,0 GB en INT4.
- Con cache KV y contexto completo la huella sube: para 32.768 tokens de contexto hay que sumar varios GB en funcion del batch y del backend, por lo que en FP16 conviene reservar 10-12 GB.
- GPU recomendadas para FP16/BF16: A100 40/80 GB, H100, L40S, RTX 4090 (24 GB), RTX 4080/4070 Ti Super (16 GB).
- Cabe en GPU de consumo: si, en INT4/INT8 entra en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, y en equipos Apple Silicon con 16 GB o mas de memoria unificada.
- Opciones de despliegue: vLLM, TGI y SGLang para safetensors; transformers + PEFT si se quiere cargar solo el adaptador `adapter/`; llama.cpp y Ollama requieren convertir los pesos a GGUF, conversion no publicada por el autor.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

Solo la primera fila procede de la informacion proporcionada; el resto son referencias generales de las fichas oficiales de cada modelo y deben verificarse antes de usarse en una decision tecnica.

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| XujjHarvard/cs2881-hw1-rlvr | 3,09 B | no disponible (base: 32.768) | apache-2.0 | Ajuste academico con RLVR/GRPO; unico benchmark publicado: OpenBookQA 0,808 |
| Qwen/Qwen2.5-3B-Instruct | 3,09 B | 32.768 (131.072 con YaRN) | apache-2.0 | Modelo base; sin refuerzo con verificador; soporte de tool calling documentado |
| Llama-3.2-3B-Instruct | ~3,2 B | 128.000 | Llama 3.2 Community License | Alternativa de tamano similar con contexto mayor y licencia con restricciones para ciertos usos |
| Phi-3.5-mini-instruct | ~3,8 B | 128.000 | MIT | Enfocado a razonamiento; licencia permisiva |
| Gemma-2-2B-it | ~2,6 B | 8.000 | Gemma Terms of Use | Mas pequeno y con contexto mas corto, sujeto a terminos especificos |

## Limitaciones y advertencias

- Es un artefacto de tarea academica (CS2881, "hw1"): 0 descargas y 0 "likes" en el momento de la consulta, sin senales de uso en produccion.
- La unica evaluacion publicada es OpenBookQA; no hay evidencia de que el ajuste no degrade otras capacidades (olvido catastrofico) fuera del conjunto verificado.
- Riesgo de sobreajuste al formato y a la distribucion de OpenBookQA: al entrenar con un verificador de reglas especifico, el modelo puede fallar o comportarse de forma atipica ante formatos de pregunta distintos.
- Riesgo de alucinacion: inherente a un modelo de 3 B que responde sobre conocimiento factual abierto; el refuerzo sobre opcion multiple no elimina la generacion de hechos incorrectos en texto libre.
- "Persona held" es una afirmacion del autor sin metrica ni metodologia publicada en la informacion disponible.
- Idiomas soportados no declarados: no se puede asumir un rendimiento multilingue equivalente al del modelo base sin evaluarlo.
- No hay cuantizaciones oficiales (GGUF, AWQ, GPTQ) publicadas, lo que anade un paso de conversion para desplegar con llama.cpp u Ollama.
- Restricciones de licencia: apache-2.0 permite uso comercial y modificacion, pero el autor no ofrece garantias ni soporte; conviene revisar tambien los terminos del modelo base Qwen2.5.
- Fecha de creacion y actualizacion del repositorio: 17 de septiembre de 2026, con apenas seis minutos entre ambas, lo que sugiere una publicacion sin mantenimiento posterior.
- En produccion, la ausencia de datos sobre contexto efectivo, idiomas y tool calling obliga a validar el comportamiento con un conjunto propio antes de integrarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/XujjHarvard/cs2881-hw1-rlvr
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Adaptador LoRA: https://huggingface.co/XujjHarvard/cs2881-hw1-rlvr/tree/main/adapter
- OpenBookQA (referencia del benchmark citado): https://allenai.org/data/open-book-qa
- Paper de GRPO (DeepSeekMath): https://arxiv.org/abs/2402.03300
- Nota: la busqueda web realizada no devolvio ningun enlace relevante sobre este modelo; los resultados obtenidos correspondian a servicios postales y no guardan relacion con la ficha.
