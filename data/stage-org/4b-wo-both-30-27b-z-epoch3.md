# Stage-org/4b-wo-both-30-27b-z-epoch3

## Resumen

4b-wo-both-30-27b-z-epoch3 es un modelo de lenguaje de 4.539.265.536 parametros (unos 4,54 mil millones) publicado por la organizacion Stage-org en HuggingFace. Se trata de un ajuste por aprendizaje por refuerzo (RL) sobre el modelo base Qwen/Qwen3.5-4B, tal y como declara la propia model card en su configuracion de entrenamiento. El repositorio contiene unicamente pesos en formato safetensors (9,1 GB), con la etiqueta de libreria qwen3_5 y sin pipeline, licencia ni idiomas declarados.

El modelo no es un lanzamiento comercial ni un modelo documentado al uso: es el artefacto resultante de una ejecucion interna de entrenamiento (intento 1 de un flujo denominado jh-workflow) sobre un dataset propio llamado Stage-org/4b-wo-both-30-27b-z. La model card no incluye descripcion funcional, resultados de evaluacion, ni informacion sobre el dataset de entrenamiento, sus licencias o su composicion. La utilidad practica del modelo queda, por tanto, condicionada a la validacion empieza por el propio equipo que lo entreno.

Es relevante ahora unicamente como caso de estudio tecnico: la configuracion publicada documenta con detalle un pipeline de RL (prime-rl) con generacion en vLLM, un juez externo para preguntas abiertas, enmascarado DPPO y penalizacion KL, ademas de los parsers de razonamiento y de tool calling empleados. Con 0 descargas y 0 likes, y sin licencia declarada, no es un modelo recomendable para produccion sin una evaluacion previa exhaustiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de tipo qwen3_5 (etiqueta de la libreria en HuggingFace); ajuste por RL sobre Qwen/Qwen3.5-4B. No se detalla la arquitectura interna (densa o MoE) |
| Parametros totales | 4.539.265.536 (~4,54 B) segun los pesos en safetensors |
| Parametros activos | no disponible (la model card no indica si la base es MoE) |
| Longitud de contexto | 65.536 tokens declarados en la configuracion de inferencia (max_model_len). La configuracion de entrenamiento declara seq_len = 300.000, dato no conciliado en la model card |
| Tipos de cuantizacion | no disponible; solo se publican pesos sin cuantizar (9,1 GB para 4,54 B parametros, coherente con bf16/fp16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 9,1 GB |
| Fecha de publicacion | 23 de septiembre de 2026 (creacion y ultima actualizacion el mismo dia) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B y se ha ajustado mediante aprendizaje por refuerzo, no mediante supervisado clasico ni DPO. La configuracion (schema stage.config.v7) declara el metodo "rl" con 10.000 pasos de aprendiz, 3 epocas, batch de 128 y seq_len de 300.000, optimizador AdamW con learning rate 1e-6, weight decay 0.0, max_norm 1.0 y betas (0.9, 0.99). El bucle de RL usa group_size 8 (esquema tipo GRPO) con 2 GPUs por nodo, 1 GPU para inferencia y 1 para entrenamiento, y difusion de pesos por sistema de ficheros. La generacion durante el entrenamiento usa temperatura 0.9, top_p 1.0, max_tokens 4096 y enable_thinking activado.

La senal de recompensa proviene de un juez de preguntas abiertas servido por API con el modelo gpt-5.6-luna (reasoning_effort medium, hasta 3 reintentos, max_in_flight 32) y de una funcion de perdida con enmascarado DPPO (dppo_mask_low 0.2, dppo_mask_high 0.28), adv_tau 1.0 y kl_tau 0.001. El entrenamiento se ejecuto con FlashAttention 2 y checkpoints cada 1.000 unidades de intervalo conservando solo el ultimo, con pesos guardados en modo weights_only. La inferencia de rollout emplea vLLM con gpu_memory_utilization 0.9, language_model_only = true, reasoning_parser "qwen3" y tool_call_parser "qwen3_coder". El dataset de entrenamiento se declara como tipo "new_task" con ruta vacia, por lo que su composicion, tamano en tokens y procedencia no son verificables desde la informacion publicada.

## Capacidades

- Generacion de texto y razonamiento autoregresivo, con modo de pensamiento habilitado durante el entrenamiento (enable_thinking = true) y parser de razonamiento qwen3 configurado para el servido.
- Tool calling / function calling: la configuracion de inferencia declara explicitamente el parser tool_call_parser "qwen3_coder", lo que indica soporte previsto de llamadas a herramientas en formato Qwen.
- Capacidades heredadas del modelo base Qwen/Qwen3.5-4B, no documentadas de forma independiente en esta model card.
- Procesamiento de contexto largo: hasta 65.536 tokens por peticion segun max_model_len en inferencia.
- Multilingue: no disponible; no se declara ningun idioma ni evaluacion por idioma.
- Vision, audio u otras modalidades: no disponibles; la inferencia se configura con language_model_only = true, lo que apunta a un uso exclusivamente de texto.
- Modo agente / multi-paso: no confirmado por el autor, aunque el soporte de tool calling y el parser de razonamiento son los requisitos tecnicos habituales para ello.

## Casos de uso

- Servicio de generacion de codigo asistida: el modelo puede desplegarse en vLLM con el parser qwen3_coder para exponer tool calling a editores y agentes de programacion, integrandose en flujos de autocompletado o refactorizacion sobre repositorios que quepan en su ventana de 65.536 tokens.
- Analisis de documentos largos: informes, expedientes o transcripciones de decenas de miles de tokens pueden procesarse en una sola peticion sin troceado, lo que simplifica pipelines de resumen y extraccion sobre contratos o documentacion tecnica.
- Extraccion estructurada en ETL: mediante function calling, el modelo puede poblar esquemas JSON a partir de texto libre (facturas, correos, formularios) dentro de un pipeline de datos, con el parser de herramientas ya previsto en la configuracion de servido.
- Backend de agentes multi-paso: combinando el modo de razonamiento y el tool calling se pueden construir agentes que consulten APIs, ejecuten busquedas y encadenen llamadas, siempre que se valide antes la fiabilidad del modelo en tareas encadenadas.
- Asistente conversacional multi-turno: con 65.536 tokens de contexto se puede mantener un historial extenso en atencion al cliente o soporte interno, aunque la ausencia de evaluacion publicada obliga a medir la degradacion con la longitud.
- Investigacion en RL: al publicarse la configuracion completa (group_size, DPPO, KL, juez externo, vLLM), el modelo sirve como punto de partida reproducible para experimentos de RLHF/RLAIF en entornos academicos con recursos limitados (2 GPUs).
- Generacion de pruebas y revision en CI/CD: integrado como servicio HTTP en un runner, puede generar tests unitarios o comentarios de revision sobre diffs, con el resultado validado por el pipeline antes de fusionar.
- Prototipado de bajo coste en local: con 4,54 B de parametros y cuantizacion a 4 bits, cabe en GPUs de consumo para demos y evaluaciones preliminares sin depender de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y tampoco se han encontrado evaluaciones independientes en la busqueda web realizada (los resultados obtenidos corresponden a portales de ofertas de practicas, sin relacion con el modelo).

## Requisitos de hardware

- VRAM para inferencia en bf16/fp16: aproximadamente 9,1 GB solo de pesos, mas activaciones y cache KV. Con max_model_len de 65.536 tokens hay que reservar varios GB adicionales de cache KV; la cifra exacta depende del numero de capas y de la configuracion de cabezas (GQA), dato no disponible.
- Cuantizacion a 8 bits: en torno a 4,5-5 GB de pesos. Cuantizacion a 4 bits: en torno a 2,5-3 GB de pesos. Ambas estimaciones son calculos a partir del numero de parametros, no medidas publicadas.
- GPU recomendadas: para bf16 a contexto corto, una RTX 4090 (24 GB) o A6000/L40S es suficiente; para contexto largo y lotes concurrentes conviene A100 40/80 GB o H100. Para 4 bits basta una RTX 3060 de 12 GB o una RTX 4060 Ti de 16 GB.
- Cabe en GPU de consumo: si, en tarjetas de 12 GB o mas con cuantizacion de 8 o 4 bits y contextos moderados; en bf16 completo, en tarjetas de 16-24 GB con contexto reducido.
- Opciones de despliegue: vLLM es la via documentada por el autor (con reasoning_parser "qwen3" y tool_call_parser "qwen3_coder", language_model_only = true). Tambien son viables SGLang o TGI con soporte de safetensors de la familia Qwen3.5. Para llama.cpp u Ollama seria necesaria una conversion propia a GGUF, ya que el repositorio no publica ficheros GGUF.
- Latencia y throughput: no disponibles. No se han publicado mediciones, y el unico dato operativo es gpu_memory_utilization 0.9 y el servido en el puerto 7000 dentro del entorno de entrenamiento.

## Comparativa con modelos similares

Los datos de la columna "este modelo" proceden de la model card y de los pesos publicados. Los de las alternativas corresponden a la informacion publica de sus respectivas model cards y se incluyen como referencia de categoria, no como medicion verificada en este repositorio.

| Modelo | Parametros | Contexto | Licencia | Formatos publicados | Rendimiento publicado |
|---|---|---|---|---|---|
| Stage-org/4b-wo-both-30-27b-z-epoch3 | 4,54 B | 65.536 (inferencia) | no disponible | safetensors | no disponible |
| Qwen/Qwen3-4B | ~4 B (familia densa) | 32.768 nativo | Apache 2.0 | safetensors, GGUF | si, en su model card |
| meta-llama/Llama-3.2-3B | 3,2 B | 128.000 | Llama 3.2 Community License | safetensors, GGUF | si, en su model card |
| google/gemma-3-4b-it | ~4 B | 128.000 | Gemma Terms of Use | safetensors, GGUF | si, en su model card |

La diferencia clave frente a las alternativas no es de rendimiento, sino de trazabilidad: los tres modelos comparados publican licencia, idiomas, evaluaciones y pesos cuantizados, mientras que este repositorio no ofrece ninguno de esos elementos y presenta 0 descargas y 0 likes.

## Limitaciones y advertencias

- Ausencia de licencia: no se declara licencia alguna, lo que impide determinar si el uso comercial esta permitido. En la practica, debe tratarse como no autorizado para produccion hasta que el autor lo aclare.
- Sin evaluacion: no hay benchmarks ni validacion publicada, por lo que se desconoce el rendimiento real, la degradacion por contexto largo y el impacto del ajuste por RL sobre las capacidades del modelo base.
- Dataset opaco: el dataset de entrenamiento se declara con ruta vacia y tipo "new_task"; se desconoce su composicion, idioma, licencia y si contiene datos personales o con derechos de autor.
- Riesgo de alucinacion: no cuantificado. Un ajuste por RL con recompensa de un juez externo puede optimizar hacia el formato o el estilo que premia el juez sin mejorar la veracidad factual.
- Olvido catastrofico: al ser un ajuste por RL sobre una tarea no especificada, es plausible la perdida de capacidades generales del base Qwen3.5-4B; no hay evaluacion que lo descarte.
- Ambiguedad de contexto: la configuracion mezcla seq_len = 300.000 en entrenamiento con max_model_len = 65.536 en inferencia. No queda claro cual es la ventana efectiva y si el modelo generaliza mas alla de 65.536 tokens.
- Idiomas: no declarados. No hay garantia de calidad en castellano ni en ningun otro idioma distinto del que predomine en el dataset, desconocido.
- Confusion de nombres: la etiqueta del repositorio (Stage-org, con notacion de "stage") no guarda relacion con el dominio de practicas profesionales, aunque las busquedas web sobre el termino devuelven mayoritariamente ofertas de practicas; esto dificulta encontrar documentacion adicional.
- Dependencia de infraestructura propietaria: la receta de entrenamiento depende de un juez servido por API (gpt-5.6-luna) y de rutas internas del equipo, lo que limita la reproducibilidad externa.
- Madurez: 0 descargas y 0 likes, publicacion y ultima actualizacion el mismo dia. Es un artefacto experimental sin comunidad ni mantenimiento demostrado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Stage-org/4b-wo-both-30-27b-z-epoch3
- Dataset declarado en la model card (enlace construido a partir del identificador): https://huggingface.co/datasets/Stage-org/4b-wo-both-30-27b-z
- Modelo base declarado: https://huggingface.co/Qwen/Qwen3.5-4B
- Perfil del autor: https://huggingface.co/Stage-org
- Papers, blogs, repositorios o demos adicionales: no disponibles. La busqueda web realizada no devolvio ningun resultado relacionado con el modelo.
