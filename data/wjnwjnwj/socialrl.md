# wjnwjnwj/SocialRL

## Resumen

SocialRL es un modelo de lenguaje pequeno de 4.000 millones de parametros desarrollado por Microsoft Research que aplica un recetario de entrenamiento homonimo para reforzar el razonamiento social directamente en modelos de tamano reducido. El trabajo, publicado en arXiv y en el repositorio de publicaciones de Microsoft, demuestra que es posible inducir delegacion estrategica y habilidades de negociacion mediante post-entrenamiento dirigido, sin depender de la capacidad de modelos frontier.

El modelo se entrena en seis dominios de interaccion social: Deal-or-No-Deal, CaSiNo, Craigslist, Job Interview, Calendar y Marketplace. Cada dominio se entrena dentro del mismo dominio con el mismo recetario, y cada politica resultante se evalua en los seis dominios para medir la generalizacion. Los resultados indican que las politicas de 4B entrenadas con SocialRL se acercan y, en algunos escenarios, superan el rendimiento de modelos GPT mucho mas grandes, mientras aprenden estrategias que generalizan entre interacciones.

El repositorio de HuggingFace contiene los pesos en formato safetensors con licencia Apache 2.0, aunque el tamano del repositorio (0,7 GB) sugiere que podria tratarse de una version cuantizada o parcial de los pesos completos del modelo de 4B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (probablemente transformer, no confirmado) |
| Parametros totales | 4.000 millones (segun el paper) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el tamano del repo de 0,7 GB sugiere cuantizacion o pesos parciales) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura interna del modelo no se detalla en la informacion disponible, aunque al tratarse de un modelo de 4B de tipo "small language model" es razonable asumir una arquitectura transformer densa, sin confirmacion oficial. El aspecto central es el recetario de entrenamiento SocialRL, que entrena el razonamiento social de forma directa mediante aprendizaje por refuerzo, en lugar de depender de capacidades emergentes de modelos de mayor escala.

El entrenamiento se realiza por dominio: cada uno de los seis dominios (Deal-or-No-Deal, CaSiNo, Craigslist, Job Interview, Calendar y Marketplace) se entrena dentro del mismo dominio bajo el mismo recetario, y cada politica resultante se evalua en los seis dominios. Esto permite medir la generalizacion cruzada entre dominios de interaccion social. No se especifican los datos de entrenamiento, el numero de tokens ni si se emplearon tecnicas adicionales como RLHF o DPO.

## Capacidades

- Razonamiento social: el modelo esta especificamente entrenado para comprender y actuar en situaciones de negociacion e interaccion estrategica entre agentes.
- Delegacion estrategica: el entrenamiento con SocialRL induce comportamientos de delegacion estrategica, pasando de delegados pasivos a negociadores estrategicos.
- Negociacion multi-dominio: cubre seis dominios de interaccion: Deal-or-No-Deal, CaSiNo, Craigslist, Job Interview, Calendar y Marketplace.
- Generalizacion entre interacciones: las estrategias aprendidas generalizan entre distintos tipos de interaccion social, segun los resultados del paper.
- Competencia frente a modelos mayores: las politicas de 4B se acercan o superan en algunos escenarios a modelos GPT mucho mas grandes.
- No se confirma soporte de tool calling, function calling, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Asistente de negociacion en mercados online: el modelo puede actuar como agente negociador en plataformas tipo Craigslist, gestionando ofertas y contraofertas de forma estrategica y manteniendo el contexto de la conversacion.
- Simulacion de entrevistas de trabajo: permite practicar entrevistas laborales con un interlocutor que razona socialmente, evaluando respuestas y adaptando el comportamiento del entrevistador.
- Gestion de calendarios y agendas: el modelo puede negociar horarios y coordinar reuniones entre multiples participantes, resolviendo conflictos de disponibilidad de forma autonoma.
- Juegos de negociacion (Deal-or-No-Deal, CaSiNo): puede actuar como oponente o como asistente estrategico en juegos de negociacion, sugiriendo ofertas y evaluando riesgos.
- Agentes de atencion al cliente en mercados: integrado en un pipeline de agentes conversacionales, puede gestionar reclamaciones y negociar compensaciones con clientes de forma razonada.
- Investigacion en IA social: sirve como plataforma de experimentacion para estudiar el razonamiento social en modelos pequenos y la transferencia de estrategias entre dominios.

## Benchmarks y rendimiento

No se han publicado resultados numericos de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El paper de arXiv indica cualitativamente que las politicas de 4B entrenadas con SocialRL "se acercan y, en algunos escenarios, superan el rendimiento de modelos GPT mucho mas grandes" en los seis dominios de interaccion social, pero no se proporcionan cifras concretas en los resultados de busqueda. Se recomienda consultar el paper completo para obtener metricas detalladas.

## Requisitos de hardware

- VRAM estimada: para un modelo de 4B en precision FP16 se requieren aproximadamente 8 GB de VRAM; con cuantizacion a 8 bits bastarian unos 4-5 GB, y a 4 bits unos 2-3 GB. El tamano del repositorio (0,7 GB) sugiere que los pesos publicados podrian estar fuertemente cuantizados o ser parciales.
- GPU recomendadas: el modelo cabe en GPUs de consumo como RTX 3060 (12 GB), RTX 4060 Ti (16 GB) o RTX 4090 (24 GB) sin problemas. Para despliegue en produccion, una A10G o L4 de 24 GB seria suficiente.
- Opciones de despliegue: al estar en formato safetensors, puede cargarse con transformers, vLLM o TGI. Si se publicaran pesos GGUF, podria usarse con llama.cpp u Ollama, pero no se confirma su disponibilidad.
- Latencia y throughput: no disponibles. Para un modelo de 4B en una GPU moderna, se puede esperar una latencia de decenas de milisegundos por token, pero no hay datos oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| SocialRL (este) | 4B | no disponible | Razonamiento social via RL | Apache 2.0 |
| GPT-3.5 (referencia del paper) | ~175B | 4K-16K | Generalista | Propietaria |
| Llama 3.2 3B | 3B | 128K | Generalista | Llama 3.2 Community |
| Qwen2.5 3B | 3B | 32K | Generalista | Apache 2.0 |

El paper compara SocialRL con modelos GPT mucho mayores, indicando que el modelo de 4B se acerca o supera su rendimiento en los dominios de interaccion social evaluados. Frente a otros modelos pequenos generalistas (Llama 3.2 3B, Qwen2.5 3B), SocialRL se diferencia por su especializacion en razonamiento social y negociacion, aunque carece de las capacidades generales de estos.

## Limitaciones y advertencias

- Especializacion limitada: el modelo esta entrenado para razonamiento social y negociacion; no es un modelo generalista y su rendimiento fuera de los seis dominios de entrenamiento no esta garantizado.
- Tamano reducido: con 4B de parametros, su capacidad de razonamiento complejo y conocimiento factual es limitada frente a modelos de mayor escala.
- Datos de entrenamiento no publicados: no se especifica la composicion del dataset, el numero de tokens ni el proceso de curado de datos, lo que dificulta evaluar posibles sesgos.
- Riesgo de alucinacion: como cualquier modelo pequeno, puede generar respuestas plausibles pero incorrectas, especialmente fuera de sus dominios de especializacion.
- Repositorio incompleto o cuantizado: el tamano de 0,7 GB para un modelo de 4B sugiere que los pesos publicados podrian no ser los completos en FP16; verificar antes de usar en produccion.
- Idiomas no especificados: no se indica que idiomas soporta; probablemente entrenado principalmente en ingles, dado el origen de la investigacion.
- Sin benchmarks publicos estandar: no hay resultados de MMLU, HumanEval u otros benchmarks que permitan comparar con otros modelos de forma objetiva.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/wjnwjnwj/SocialRL
- Publicacion de Microsoft Research: https://www.microsoft.com/en-us/research/publication/from-passive-delegates-to-strategic-negotiators-reinforcing-social-reasoning-in-small-language-models-with-socialrl/
- Paper en arXiv: https://arxiv.org/html/2608.13787v1
