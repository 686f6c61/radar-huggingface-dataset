# wz7475/qwen2.5-7b-instruct-katcher-med-lwf-oasst1-kw0.25

## Resumen

`wz7475/qwen2.5-7b-instruct-katcher-med-lwf-oasst1-kw0.25` es un ajuste fino supervisado (SFT) del modelo Qwen2.5-7B-Instruct, publicado por el usuario wz7475 en Hugging Face. El entrenamiento se ha realizado con la librería TRL (version 1.15.0) sobre la infraestructura de Unsloth, partiendo del checkpoint `unsloth/Qwen2.5-7B-Instruct`. El nombre del repositorio sugiere una mezcla de datos de tipo "katcher-med", "lwf" y "oasst1" con un peso de mezcla kw0.25, aunque la model card no documenta la composicion exacta del dataset.

El modelo hereda la arquitectura transformer densa de Qwen2.5-7B-Instruct: 7.610 millones de parametros, atencion con RoPE, GQA y una ventana de contexto nativa de 32.768 tokens (extensible a 131.072 mediante YaRN). El ajuste fino no altera la arquitectura, solo los pesos, por lo que conserva las capacidades del modelo base en generacion de texto, codigo, matematicas y tool calling, presumiblemente reorientadas hacia el dominio medico por el sufijo "med" del nombre.

La relevancia de esta ficha es limitada: se trata de un experimento de ajuste fino con cero descargas y cero likes en el momento de la consulta, sin model card detallada, sin licencia declarada de forma explicita y sin benchmarks publicados. Resulta util como referencia para quien quiera reproducir la receta de SFT con TRL y Unsloth sobre Qwen2.5, pero no como modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (decoder-only), base Qwen2.5-7B-Instruct |
| Parametros totales | 7.610 millones (heredados del modelo base) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens nativos; extensible a 131.072 con YaRN (segun el modelo base) |
| Tipos de cuantizacion | no disponible en el repo (solo safetensors en fp16/bf16); compatible con cuantizacion posterior a GGUF/AWQ/GPTQ mediante herramientas externas |
| Idiomas soportados | no disponible en la model card; el modelo base soporta 29 idiomas, entre ellos espanol, ingles, chino, frances, aleman, arabe, ruso y japones |
| Licencia | no disponible (la model card incluye un campo `licence: license` sin contenido) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 26,9 GB |
| Libreria | transformers |
| Framework de entrenamiento | TRL 1.15.0, Transformers 4.57.6, PyTorch 2.11.0, Datasets 4.8.5, Tokenizers 0.22.2 |
| Tipo de ajuste | SFT (supervised fine-tuning) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino por SFT del checkpoint `unsloth/Qwen2.5-7B-Instruct`, que a su vez es una version optimizada para entrenamiento del Qwen2.5-7B-Instruct original de Alibaba. La arquitectura subyacente es un transformer decoder-only denso con 28 capas, atencion de tipo grouped-query attention (GQA) con 28 cabezas de consulta y 4 cabezas de clave/valor, embeddings rotatorios (RoPE) y normalizacion RMSNorm. El modelo base fue preentrenado con 18 billones de tokens y posteriormente alineado con instrucciones.

El entrenamiento de este ajuste se ha realizado con TRL, presumiblemente mediante `SFTTrainer`, y con Unsloth como backend de optimizacion. El nombre del repositorio indica una mezcla de datasets con peso `kw0.25`: "katcher-med" (probablemente un dataset medico), "lwf" y "oasst1" (OpenAssistant Conversations, un corpus multilingue de dialogo). No se documenta el numero de tokens de entrenamiento, la composicion exacta de la mezcla, la presencia de RLHF/DPO posterior ni hiperparametros como learning rate, batch size o numero de epocas. La model card no incluye curvas de perdida ni metricas de evaluacion.

No hay innovaciones tecnicas propias de este ajuste: se limita a reentrenar los pesos del modelo base sobre una mezcla de datos con TRL y Unsloth. No incorpora decodificacion especulativa, atencion lineal ni modos de razonamiento extendido mas alla de lo que ya ofrece Qwen2.5-Instruct.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del modelo base Qwen2.5-7B-Instruct.
- Razonamiento y matematicas de nivel medio, con capacidad para resolver problemas aritmeticos y algebraicos sencillos.
- Generacion de codigo en lenguajes como Python, JavaScript, Java, C++ y SQL, con soporte de explicaciones y refactorizacion.
- Soporte de tool calling / function calling mediante el formato de Qwen2.5-Instruct (etiquetas `<tool_call>` y `<tool_response>`).
- Capacidad de seguir instrucciones estructuradas y formatos JSON, util para pipelines de extraccion de datos.
- Capacidades multilingues heredadas: el modelo base cubre 29 idiomas, incluido el espanol.
- Presunta especializacion en dominio medico por el sufijo "med" del nombre, aunque no se documenta ni se evalua en la model card.
- No soporta vision, audio ni modalidades adicionales: es un modelo exclusivamente de texto.

## Casos de uso

- Prototipado de asistentes conversacionales en dominio medico: el ajuste sobre "katcher-med" sugiere un enfasis en terminologia clinica; puede usarse para generar respuestas informativas sobre sintomas o terminologia, siempre con supervision humana y sin sustituir criterio clinico.
- Generacion de codigo en entornos de desarrollo: al conservar las capacidades del modelo base, puede integrarse en asistentes de IDE o pipelines de CI/CD para autocompletar funciones, generar tests o explicar errores de compilacion.
- Extraccion estructurada de informacion: gracias al soporte de formatos JSON y tool calling, puede emplearse para convertir texto libre (informes, notas) en estructuras de datos consumibles por APIs.
- Fine-tuning adicional como punto de partida: al ser un checkpoint SFT ya entrenado, sirve como base para experimentos de DPO, RLHF o ajustes especificos de dominio con TRL y Unsloth.
- Evaluacion de recetas de mezcla de datos: el nombre del repositorio documenta una mezcla concreta (katcher-med + lwf + oasst1 con kw0.25), lo que permite reproducir y comparar el efecto de distintas proporciones sobre el rendimiento final.
- Traduccion y resumen multilingue: con 29 idiomas en el modelo base, puede emplearse para resumir documentos o traducir contenido entre espanol, ingles y otras lenguas europeas, con la cautela de que el ajuste puede haber degradado ligeramente esta capacidad.
- Chatbot de atencion al cliente con contexto largo: la ventana de 32.768 tokens permite gestionar conversaciones multi-turno con historial extenso o documentos adjuntos de hasta decenas de paginas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye evaluaciones propias ni comparaciones con el modelo base. Como referencia, el modelo base Qwen2.5-7B-Instruct reporta en su model card oficial resultados como MMLU ~74,2, HumanEval ~84,8 y GSM8K ~91,6, pero estos datos corresponden al checkpoint original de Alibaba y no deben atribuirse a este ajuste sin verificacion empirica.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 15-16 GB (7.610 millones de parametros x 2 bytes + overhead de activaciones y cache KV).
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 8-9 GB.
- VRAM estimada en cuantizacion de 4 bits (GPTQ/AWQ/GGUF Q4): aproximadamente 4,5-5,5 GB.
- GPU recomendadas para fp16: NVIDIA A100 40GB, H100 80GB, L40S 48GB o RTX 4090 24GB (esta ultima cabe con margen ajustado).
- GPU consumer: cabe en RTX 4090 (24 GB) en fp16 con contexto moderado; en RTX 3090 (24 GB) y RTX 4080 (16 GB) requiere cuantizacion a 8 bits o 4 bits para contextos largos.
- Opciones de despliegue: transformers (pipeline nativo), vLLM, TGI, llama.cpp (previa conversion a GGUF), Ollama (previa conversion), SGLang.
- Latencia y throughput: no disponibles; no se han publicado mediciones para este checkpoint concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| wz7475/qwen2.5-7b-instruct-katcher-med-lwf-oasst1-kw0.25 | 7,6 B | 32.768 (131.072 con YaRN) | no disponible | Hugging Face, 0 descargas | Ajuste SFT experimental sin benchmarks |
| Qwen/Qwen2.5-7B-Instruct | 7,6 B | 32.768 (131.072 con YaRN) | Apache 2.0 | Hugging Face, ampliamente usado | Modelo base oficial, con benchmarks publicados |
| meta-llama/Llama-3.1-8B-Instruct | 8,0 B | 131.072 | Llama 3.1 Community License | Hugging Face, muy usado | Contexto nativo mayor, licencia con restricciones |
| mistralai/Mistral-7B-Instruct-v0.3 | 7,2 B | 32.768 | Apache 2.0 | Hugging Face, muy usado | Alternativa europea con tool calling |

## Limitaciones y advertencias

- Ausencia de licencia explicita: la model card incluye un campo `licence: license` sin contenido, lo que impide determinar si el uso comercial esta permitido. Antes de cualquier despliegue en produccion es imprescindible contactar con el autor o asumir la licencia del modelo base (Apache 2.0 para Qwen2.5), con el riesgo legal que ello conlleva.
- Sin benchmarks ni evaluacion: no hay evidencia publicada de que el ajuste mejore al modelo base en ninguna tarea; el SFT sobre una mezcla de datos pequena puede degradar capacidades generales (olvido catastrofico).
- Riesgo de alucinacion elevado en dominio medico: si el ajuste se ha realizado sobre datos clinicos, el modelo puede generar afirmaciones medicas plausibles pero incorrectas. No debe usarse como sistema de diagnostico ni de recomendacion terapeutica sin supervision de un profesional sanitario.
- Sesgos heredados del modelo base: Qwen2.5 presenta sesgos conocidos en genero, origen etnico y religion, ademas de un sesgo de alineamiento hacia normas culturales chinas en temas politicos sensibles.
- Idiomas no documentados: aunque el modelo base cubre 29 idiomas, la mezcla de ajuste (oasst1 y posibles datos medicos) podria haber desplazado la distribucion hacia el ingles, degradando el rendimiento en espanol u otras lenguas.
- Contexto efectivo incierto: aunque la ventana nativa es de 32.768 tokens, el ajuste SFT no garantiza que el modelo mantenga la calidad en contextos largos; el modelo base requiere configuracion YaRN para superar los 32K.
- Repositorio de 26,9 GB: incluye pesos en precision completa o bf16, lo que exige almacenamiento considerable y descarga lenta; no hay versiones cuantizadas publicadas en el repo.
- Cero traccion comunitaria: sin descargas ni likes, no hay evidencia de validacion por terceros ni issues resueltos. Tratarlo como un experimento de investigacion, no como un artefacto maduro.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wz7475/qwen2.5-7b-instruct-katcher-med-lwf-oasst1-kw0.25
- Modelo base (Unsloth): https://huggingface.co/unsloth/Qwen2.5-7B-Instruct
- Modelo base original (Qwen): https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Repositorio de TRL: https://github.com/huggingface/trl
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Documentacion de Transformers: https://huggingface.co/docs/transformers
- Dataset OpenAssistant Conversations (oasst1): https://huggingface.co/datasets/OpenAssistant/oasst1
