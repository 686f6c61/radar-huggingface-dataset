# stevan-milovanovic/speak2act-functiongemma-270m

## Resumen

Speak2Act FunctionGemma 270M es un modelo de lenguaje de tamano muy reducido (270 millones de parametros) publicado en HuggingFace por el usuario stevan-milovanovic. Por su nombre, todo indica que se trata de una variante de la familia Gemma de Google ajustada (fine-tuned) para tareas de function calling, es decir, para interpretar instrucciones en lenguaje natural y convertirlas en llamadas estructuradas a herramientas o funciones, probablemente en el contexto de interfaces de voz a accion (speak-to-act).

Su relevancia radica en el tamano: con ~270M de parametros y un repositorio de apenas 0,3 GB, es un candidato claro para ejecucion en dispositivos con recursos muy limitados (moviles, microcontroladores avanzados, edge devices), donde modelos grandes de function calling no son viables. No obstante, la model card esta practicamente vacia: no incluye descripcion, benchmarks, detalles de entrenamiento ni instrucciones de uso, por lo que gran parte de los datos tecnicos concretos no estan disponibles y cualquier evaluacion debera hacerse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (presumiblemente transformer decoder, base Gemma) |
| Parametros totales | ~270M |
| Parametros activos | no aplicable (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | Gemma (gemma) |
| Formato de pesos | no disponible (tamano del repo: 0,3 GB) |

## Arquitectura y entrenamiento

No se han publicado detalles de arquitectura ni de entrenamiento en la model card. El nombre del modelo sugiere que se basa en la arquitectura Gemma de Google y que ha sido ajustado para la tarea de function calling, posiblemente como parte de un proyecto denominado Speak2Act orientado a convertir instrucciones habladas o escritas en acciones estructuradas. El tamano de 270M de parametros lo situaria en la gama de modelos ligeros, comparables a Gemma 2 2B reducido o a otros modelos sub-1B disenados para edge.

No hay informacion sobre el numero de tokens de entrenamiento, composicion del dataset, uso de RLHF/DPO ni tecnicas destacables. Tampoco se especifica si los pesos estan en safetensors, GGUF u otro formato; el tamano del repositorio (0,3 GB) es consistente con pesos en precision completa para ~270M de parametros o con una cuantizacion de un modelo algo mayor.

## Capacidades

Por la informacion disponible no puede confirmarse ningun detalle concreto, aunque el nombre del modelo sugiere:

- Function calling / tool calling: generacion de llamadas a funciones estructuradas a partir de lenguaje natural.
- Posible orientacion a comandos de voz convertidos a acciones (paradigma speak-to-act), asumiendo un componente ASR externo.
- Tareas generales de generacion de texto: no documentadas y, dado el tamano, presumiblemente limitadas.
- Vision, audio, thinking mode: no disponibles / no documentadas.
- Capacidades multilingues: no disponibles (sin datos de idiomas).

## Casos de uso

- Function calling en dispositivos edge: al ocupar ~0,3 GB, puede ejecutarse en moviles o SBCs (Raspberry Pi) para convertir comandos del usuario en llamadas a APIs locales sin depender de la nube.
- Asistentes de voz offline: integrado tras un motor ASR, podria mapear transcripciones de voz a acciones concretas (encender luces, crear recordatorios, abrir apps) en domotica o wearables.
- Prototipado rapido de agentes ligeros: util para experimentar con enrutado de intenciones y seleccion de herramientas en pipelines donde la latencia y el consumo importan mas que la precision maxima.
- Clasificacion de intenciones de bajo coste: como modelo previo a un LLM grande, podria decidir que herramienta invocar y delegar solo las tareas complejas.
- Automatizacion en entornos sin conexion: ideal para escenarios industriales o embarcados sin acceso a APIs remotas de inferencia.
- Investigacion sobre destilacion de capacidades de tool calling: sirve como caso de estudio de hasta donde puede comprimirse el function calling en modelos sub-300M.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de accuracy en function calling, ni comparativas con otros modelos.

## Requisitos de hardware

- VRAM estimada: muy baja; con ~270M de parametros, en FP16 caberia en menos de 1 GB de VRAM, y cuantizado a 4 bits por debajo de 300 MB.
- GPU recomendadas: cualquier GPU moderna es mas que suficiente; incluso puede ejecutarse sin GPU dedicada en CPU.
- Consumer GPUs: perfectamente ejecutable en GPUs de gama baja (GTX 1650, RTX 3050) e incluso en integradas; tambien en moviles y SBCs si el formato de pesos lo permite.
- Opciones de despliegue: probablemente compatible con llama.cpp y Ollama si se publica en GGUF; con transformers de HuggingFace si el formato es estandar. No hay confirmacion oficial de compatibilidad con vLLM o TGI.
- Latencia y throughput: no disponibles; por tamano, se espera latencia de decodificacion muy baja (del orden de milisegundos por token en GPU moderna).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Function calling | Licencia |
|---|---|---|---|---|
| speak2act-functiongemma-270m | ~270M | no disponible | si (presunto, foco principal) | Gemma |
| Qwen2.5-0.5B-Instruct | 0,5B | 32K (128K con YaRN) | si | Apache 2.0 / Qwen |
| SmolLM2-360M-Instruct | 360M | 8K | limitado | Apache 2.0 |
| Gemma 2 2B (base de la familia) | 2,6B | 8K | limitado | Gemma |

Frente a estas alternativas, FunctionGemma 270M destaca por su especializacion presunta en function calling con un tamano minimo, pero carece de la documentacion, benchmarks y ecosistema de los modelos de Qwen o Hugging Face.

## Limitaciones y advertencias

- Model card practicamente vacia: sin descripcion, ejemplos de uso, prompt format ni benchmarks, lo que dificulta evaluar su fiabilidad antes de probarlo.
- Cero descargas registradas en el momento de redactar la ficha: modelo sin trayectoria comunitaria ni validacion externa.
- Riesgo de alucinacion elevado: los modelos de este tamano tienen capacidades de razonamiento muy limitadas y pueden generar llamadas a funciones malformadas o incorrectas.
- Contexto probablemente corto: si se basa en Gemma, la ventana podria ser de unos pocos miles de tokens, insuficiente para conversaciones largas o muchos tools simultaneos.
- Licencia Gemma: permite uso comercial pero con condiciones y restricciones propias de los terminos de uso de Google (prohibiciones de uso, clausula de aceptacion); revisar la Gemma Terms of Use antes de desplegar en produccion.
- Sin datos de idiomas soportados: probablemente optimizado para ingles; el rendimiento en castellano es desconocido.
- Formato de pesos sin especificar: puede requerir conversion manual para inferencia con runtimes optimizados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/stevan-milovanovic/speak2act-functiongemma-270m
- Paper, repositorio de codigo o demo: no disponibles en la informacion proporcionada.
