# TeamNull/qwen35-9b-cyber-lora-v2

## Resumen

qwen35-9b-cyber-lora-v2 es un ajuste fino del modelo base unsloth/Qwen3.5-9B, publicado por el usuario TeamNull en HuggingFace. Segun la model card, se ha entrenado con SFT (supervised fine-tuning) mediante la libreria TRL y herramientas de Unsloth; el nombre del repositorio sugiere una especializacion en tareas de ciberseguridad. El repositorio ocupa 0,5 GB, un tamano compatible con un adaptador LoRA y no con los pesos completos de un modelo de 9B en precision de entrenamiento, de modo que su uso exige cargar por separado el modelo base.

No se dispone de informacion sobre el conjunto de datos de entrenamiento, el volumen de tokens, la licencia de los pesos derivados ni los idiomas cubiertos. Tampoco hay benchmarks ni evaluaciones publicadas para este adaptador concreto. Su relevancia publica es minima en el momento de redactar esta ficha: cero descargas y cero "likes" desde su creacion el 8 de octubre de 2026.

El modelo base, Qwen3.5-9B, es un modelo denso de unos 9,7B parametros de la familia Qwen3.5 de Alibaba, con arquitectura hibrida, capacidad multimodal (vision-lenguaje), contexto nativo de 262K tokens, tool calling nativo y soporte de hasta 201 idiomas segun fuentes de terceros. Estas capacidades se heredan en la medida en que el adaptador no las degrade durante el ajuste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo base Qwen3.5-9B (transformer denso multimodal de la familia Qwen3.5, segun fuentes de terceros); el adaptador publicado no redefine la arquitectura |
| Parametros totales | ~9,7B en el modelo base; el adaptador no contiene los pesos completos |
| Parametros activos | no aplica (el modelo base es denso, no MoE) |
| Longitud de contexto | 262K tokens segun el modelo base; no confirmado para este adaptador |
| Tipos de cuantizacion | no disponible para el adaptador; el modelo base admite cuantizacion en Q4/Q8, GGUF, AWQ o GPTQ segun fuentes de terceros |
| Idiomas soportados | no disponibles |
| Licencia | no disponible (la model card indica "licence: license" sin especificar) |
| Formato de pesos | safetensors (adaptador de ~0,5 GB, segun tags y tamano del repositorio) |

## Arquitectura y entrenamiento

La model card indica que el modelo se ha entrenado con SFT usando TRL 1.13.0, sobre el modelo base unsloth/Qwen3.5-9B. Las versiones de framework declaradas son Transformers 5.17.0, PyTorch 2.14.1, Datasets 4.8.5 y Tokenizers 0.23.2. El tag "unsloth" sugiere que el ajuste se realizo con las optimizaciones de memoria y velocidad de Unsloth, y el nombre del repositorio ("cyber-lora-v2") apunta a un adaptador de tipo LoRA orientado a ciberseguridad, aunque la model card no incluye la etiqueta "peft" ni detalla la configuracion de LoRA (rango, alpha, modulos objetivo).

No hay informacion sobre el dataset de entrenamiento, el numero de tokens, la composicion de los datos ni si se aplicaron fases posteriores de RLHF o DPO. Tampoco se describe ninguna innovacion tecnica propia del adaptador. Todo lo relativo a arquitectura hibrida, atencion de contexto largo, modalidad de vision y decodificacion proviene del modelo base y no esta confirmado que se conserve intacto tras el ajuste.

## Capacidades

- Generacion de texto y ajuste de estilo o dominio, segun el proposito del adaptador (ciberseguridad, por el nombre del repositorio).
- Razonamiento y respuesta a instrucciones en formato conversacional (la model card incluye un ejemplo con `pipeline` y mensajes con rol "user").
- Capacidades heredadas del modelo base Qwen3.5-9B segun fuentes de terceros: razonamiento multimodal con vision, tool calling nativo y flujos agenticos; no confirmadas para este adaptador.
- Soporte multilingue potencial de hasta 201 idiomas segun el modelo base; sin verificacion en este ajuste.
- No hay evidencia publicada de soporte explicito de "thinking mode", audio, funcion calling ni agentes en este adaptador concreto.

## Casos de uso

- Asistente especializado en ciberseguridad: dado el nombre del adaptador, podria emplearse para responder consultas sobre conceptos de seguridad, analisis de vulnerabilidades o explicacion de tacticas defensivas, siempre que se valide la calidad del ajuste con datos propios.
- Analisis y resumen de informes tecnicos de seguridad: si conserva el contexto largo del modelo base, permitiria procesar documentos extensos (informes de pentest, registros) en una sola pasada.
- Generacion de explicaciones didacticas: uso en material de formacion sobre seguridad, aprovechando el formato conversacional del pipeline de ejemplo.
- Prototipado de chatbots internos: integrable mediante `transformers` en pipelines de atencion o soporte tecnico, con la salvedad de que no hay evaluaciones publicadas.
- Fine-tuning iterativo: servir como punto de partida (adaptador base) para sucesivos ajustes LoRA en dominios concretos de seguridad.
- Experimentacion e investigacion: util para comparar tecnicas de SFT con TRL/Unsloth sobre Qwen3.5-9B, dado que el repositorio documenta versiones exactas de framework.
- Clasificacion o etiquetado de texto tecnico: podria reutilizarse para tareas de categorizacion de incidentes, previa validacion empirica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para este adaptador.

Las unicas cifras disponibles corresponden al modelo base Qwen3.5-9B y provienen de fuentes de terceros, no verificadas para este ajuste:

| Referencia | Dato reportado | Fuente |
|---|---|---|
| Artificial Analysis | Modelo mas inteligente por debajo de 10B parametros en su lanzamiento | llm-releases.com |
| MMMU-Pro | ~69% (modelo base multimodal) | llm-releases.com |
| Contexto nativo | 262K tokens | together.ai / llm-releases.com |

Estos datos no deben atribuirse a qwen35-9b-cyber-lora-v2 sin una evaluacion propia.

## Requisitos de hardware

- Los pesos completos del modelo base en bf16 requieren aproximadamente 18-20 GB de VRAM para inferencia; el adaptador anade un consumo marginal sobre esa base.
- Cuantizado en Q4, el modelo base se ha reportado en torno a 6 GB de VRAM, lo que lo hace viable en GPU de consumo como RTX 3060 (12 GB), RTX 4070 (12 GB) o RTX 4090 (24 GB).
- En Q8 se estiman alrededor de 10-12 GB, apto para RTX 4080/4090 y GPUs de 16 GB o mas.
- En bf16 sin cuantizar cabria en A100 40/80 GB, H100 y RTX 4090 (24 GB, con margen ajustado).
- Opciones de despliegue habituales para modelos de esta familia: transformers, vLLM, TGI, llama.cpp y Ollama (estos dos ultimos requieren convertir el modelo fusionado a GGUF).
- No se dispone de datos medidos de latencia ni throughput para este adaptador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| TeamNull/qwen35-9b-cyber-lora-v2 | ~9,7B (base) + adaptador | no confirmado (base: 262K) | no disponible | HuggingFace, 0 descargas |
| unsloth/Qwen3.5-9B (base) | ~9,7B | 262K | segun modelo base | HuggingFace |
| Qwen/Qwen3.5-9B (oficial) | ~9,7B | 262K | Apache 2.0 (fuente de terceros) | HuggingFace |
| IOL-AI Qwen3.5 9B Reasoning v2 (LoRA) | 9,7B | 256K | Apache 2.0 (fuente de terceros) | HuggingFace / bestllmfor |

La comparacion se limita a caracteristicas del modelo base, ya que no existen benchmarks publicados del adaptador de TeamNull que permitan contrastar rendimiento real.

## Limitaciones y advertencias

- No se ha publicado informacion sobre sesgos del adaptador ni del proceso de ajuste.
- Riesgo de alucinacion inherente a los modelos de lenguaje; sin evaluaciones publicadas no es posible cuantificarlo.
- El repositorio parece contener solo un adaptador LoRA (~0,5 GB): es imprescindible cargar unsloth/Qwen3.5-9B por separado, y hay que verificar la compatibilidad de tokenizer y arquitectura.
- La licencia no esta declarada de forma efectiva ("licence: license"); no se puede asumir uso comercial sin consultar al autor.
- No hay informacion sobre los datos de entrenamiento, por lo que no se puede garantizar la ausencia de datos con derechos o de contenido sensible.
- La especializacion en ciberseguridad es una inferencia a partir del nombre del repositorio, no una afirmacion de la model card.
- Cero descargas y cero "likes": no existe validacion comunitaria ni retroalimentacion publica sobre su calidad.
- El campo "pipeline" no esta definido y los idiomas soportados no se especifican.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TeamNull/qwen35-9b-cyber-lora-v2
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-9B
- Modelo oficial Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Qwen3.5-9B en Together AI: https://www.together.ai/models/qwen3-5-9b
- Ficha de Qwen3.5-9B en LLM Releases: https://www.llm-releases.com/models/qwen3-5-9b
- IOL-AI Qwen3.5 9B Reasoning v2 (referencia comparativa): https://bestllmfor.com/catalog/iol-ai-qwen35-9b-it-lora-reasoning-v2/
- IOL-AI-Qwen35-9B-IT-LoRA-Direct-Prompt-v2 (referencia comparativa): https://huggingface.co/MikCil/IOL-AI-Qwen35-9B-IT-LoRA-Direct-Prompt-v2
- Repositorio de TRL: https://github.com/huggingface/trl
