# Thox-ai/Thox-Atlas

## Resumen

Thox-Atlas es una configuración de persona publicada por Thox-ai sobre los pesos de Qwen/Qwen3-8B. No se trata de un modelo entrenado ni afinado: el repositorio contiene únicamente el empaquetado de la persona (un `Modelfile` de Ollama, un `manifest.json` y un Knowledge Pack en JSONL), mientras que los pesos son exactamente los del modelo base Qwen3-8B publicado por Alibaba Qwen. La personalidad corresponde a Atlas, arquitecto de estrategia dentro del equipo de "digital humans" de THOX, con especialización declarada en estrategia, arquitectura de sistemas y planificación.

El modelo resuelve un problema muy acotado: ofrecer una identidad y un estilo de trabajo consistentes (rol, tono, límites de actuación) sobre una inferencia local, sin depender de servicios en la nube. Se distribuye como etiqueta de Ollama (`Thox-ai/thox-atlas`) y está pensado para ejecutarse en hardware propio, con un consumo medido de 6,68 GB a 8.192 tokens de contexto en CPU.

Su relevancia es limitada pero ilustrativa: es un ejemplo de "persona como configuración" (configuration-derived), una práctica creciente para empaquetar asistentes especializados sin coste de entrenamiento. Conviene subrayar que no aporta capacidades nuevas respecto a Qwen3-8B; toda mejora funcional proviene del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen3-8B; no se detalla en la model card) |
| Parametros totales | 8B (modelo base Qwen3-8B) |
| Parametros activos | no disponible (no es MoE según la información proporcionada) |
| Longitud de contexto | 8.192 tokens (contexto evaluado); la ventana nativa del base no se especifica en la ficha |
| Tipos de cuantizacion | no disponible (depende de la etiqueta `qwen3:8b` de Ollama utilizada) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 (heredada de Qwen3) |
| Formato de pesos | Modelfile + manifest.json + JSONL (empaquetado Ollama); pesos subyacentes de Qwen3-8B |

## Arquitectura y entrenamiento

No hay entrenamiento. La model card es explícita: los pesos son byte-idénticos a Qwen/Qwen3-8B, fijados mediante la etiqueta `qwen3:8b` de Ollama con el hash `sha256:500a1f067a9f782620b40bee6f7b0c89e17ae61f686b92c24933e4ca4b2b8b41`. La personalización consiste en un perfil de sistema escrito por THOX a partir de su "DigitalHumans Persona Model Kit", con hechos de rol corregidos según el roster interno v0.2 (31-10-2026), más el Knowledge Pack v0.1 con ocho entradas públicas verificadas para fundamentar respuestas sobre THOX.

Por tanto, la arquitectura efectiva es la de Qwen3-8B (transformer denso de 8.000 millones de parámetros), sin modificaciones de pesos, fusiones ni fine-tuning. Cualquier innovación técnica del modelo (atención, decodificación, modo thinking) procede del base y no está documentada en esta ficha. El valor añadido del paquete es el condicionamiento por prompt de sistema y la recuperación de hechos desde el Knowledge Pack incluido.

## Capacidades

- Generación de texto en inglés con una identidad fija: se presenta como Atlas, arquitecto de estrategia, y declara ser un "digital human" sintético.
- Asistencia en su dominio declarado: estrategia, arquitectura de sistemas y planificación.
- Fundamentación sobre el Knowledge Pack: responde con hechos de THOX cuando las entradas se le proporcionan (fechas y precios de Kickstarter, enrutado de MeshStack).
- Gestión explícita de incertidumbre: rechaza confirmar estado en vivo de sistemas que no puede observar (prueba de "trampa de topología fabricada" superada).
- Hereda del base Qwen3-8B las capacidades generales de razonamiento, código y matemáticas, aunque la model card no las evalúa ni las destaca.
- No incluye tool calling, agentes, memoria persistente ni ejecución autorizada: la model card indica que "no lleva memoria viva, ni herramientas, ni autoridad". Las herramientas autenticadas solo existen en el runtime ThoxAgent, fuera de este paquete.
- Multilingüe: limitado a inglés según el campo `language`.

## Casos de uso

- Asistente local de planificación estratégica: ejecutado con `ollama run Thox-ai/thox-atlas`, permite sesiones de análisis y borradores sobre arquitectura de sistemas en hardware propio, sin enviar datos a terceros.
- Experimentación con personas configurables: sirve como plantilla para estudiar cómo un perfil de sistema modifica el comportamiento de un base de 8B sin reentrenar, útil en investigación sobre condicionamiento por prompt.
- Documentación interna con hechos acotados: el Knowledge Pack permite respuestas consistentes sobre un conjunto pequeño de datos verificados (8 entradas), adecuado para prototipos de atención interna donde la fuente esté controlada.
- Evaluación de robustez frente a alucinación de estado: el comportamiento de rechazo ante afirmaciones falsas sobre sistemas en vivo lo hace útil como caso de prueba en pipelines de evaluación de asistentes.
- Despliegue en estaciones de trabajo sin GPU: con 6,68 GB a 8.192 tokens en CPU, es viable en portátiles y servidores modestos para tareas de drafting de baja frecuencia.
- Base para integraciones con runtime propio: al ser un paquete Ollama estándar, puede envolverse en aplicaciones que añadan herramientas y políticas de ejecución propias, replicando el patrón de ThoxAgent.
- Demostración de gobernanza de identidad sintética: útil para equipos que necesiten mostrar cómo se declara y limita una persona artificial en un producto.

## Benchmarks y rendimiento

La model card solo publica una evaluación cualitativa y métricas de ejecución en CPU, no benchmarks estándar (MMLU, HumanEval, GSM8K). Se recogen literalmente los datos disponibles:

| Prueba | Resultado |
|---|---|
| Verificación de identidad de persona | PASS (se identifica como Atlas, digital human sintético, arquitecto de estrategia) |
| Tarea de rol (pregunta de estrategia) | PASS |
| Verificación de fundamentación en Knowledge Pack | PASS (2/2) |
| Trampa de topología fabricada | PASS (rechaza confirmar estado en vivo) |
| Throughput en texto largo | 8,67 tokens/s sobre 1.500 tokens generados |
| Huella de memoria a 8.192 de contexto | 6,68 GB |

Condiciones: host de compilación con CPU x86_64, ejecución solo en CPU, contexto de 8.192 tokens, temperatura 0,3, medida el 31-10-2026. No se han publicado resultados de benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: 6,68 GB medidos a 8.192 tokens de contexto en ejecución CPU; en GPU la huella será similar o algo menor según cuantización.
- GPU recomendadas: no especificadas por el autor. Por tamaño (8B), cabría en GPUs de consumo con 8 GB o más, aunque no hay validación publicada.
- GPU de consumo: previsiblemente viable en RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090, sin datos oficiales de rendimiento.
- Despliegue: Ollama es la vía soportada (`ollama run Thox-ai/thox-atlas` o construcción local con `ollama create`). vLLM, llama.cpp o TGI no se mencionan, aunque al ser pesos Qwen3-8B estándar podrían servir con la configuración adecuada.
- Latencia y throughput: 8,67 tokens/s en CPU para generación de 1.500 tokens; no hay cifras para GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Naturaleza | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Thox-Atlas | 8B | 8.192 (evaluado) | Persona sobre Qwen3-8B, sin entrenamiento | Apache-2.0 | HuggingFace + Ollama |
| Qwen/Qwen3-8B | 8B | no disponible en esta ficha | Modelo base entrenado | Apache-2.0 | HuggingFace, Ollama |
| Otras personas THOX (10 restantes) | 8B | no disponible | Mismo esquema de configuración | Apache-2.0 | Ollama |

La comparación relevante es con Qwen3-8B: Thox-Atlas no supera al base en ninguna capacidad medida y solo añade identidad y fundamentación documental. Frente a modelos afinados con instrucciones (por ejemplo, variantes instruct de la misma familia), la diferencia es que aquí no hay ajuste de pesos. No se dispone de datos para comparar con alternativas de otras familias.

## Limitaciones y advertencias

- No es un modelo entrenado: no incorpora conocimiento nuevo ni habilidades nuevas respecto a Qwen3-8B; es un perfil de sistema más un paquete de conocimiento.
- Sin memoria persistente ni herramientas: no puede consultar estado en vivo ni ejecutar acciones; cualquier capacidad de agente requiere un runtime externo con autenticación y políticas.
- Límites de razonamiento propios de un modelo de 8B: la propia ficha recomienda verificar salidas importantes.
- Riesgo de alucinación: el Knowledge Pack cubre solo 8 entradas; fuera de ellas, el modelo responde con el conocimiento del base y puede inventar detalles sobre THOX.
- Idioma: solo inglés declarado; el rendimiento en castellano no está evaluado.
- Contexto: la evaluación se hizo a 8.192 tokens; no se documenta la ventana nativa ni el comportamiento más allá.
- Sesgos: no documentados por el autor; hereda los del base Qwen3-8B.
- Licencia: Apache-2.0 permite uso comercial, pero debe conservarse el aviso de Apache; los elementos propios de THOX (perfil de persona, knowledge pack, empaquetado) quedan bajo titularidad de THOX según la ficha.
- Madurez: repositorio con 0 descargas y 0 likes en el momento de la consulta; sin validación externa.

## Enlaces

- HuggingFace: https://huggingface.co/Thox-ai/Thox-Atlas
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Ejecución en Ollama: `ollama run Thox-ai/thox-atlas` (etiqueta publicada por Thox-ai)
- No se han encontrado en la información proporcionada papers, blogs, repositorios adicionales ni demos.
