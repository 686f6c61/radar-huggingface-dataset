# Thox-ai/ThoxAgent-Core-4B

## Resumen

ThoxAgent-Core-4B es un paquete de despliegue publicado por Thox-ai sobre los pesos upstream de Qwen/Qwen3-4B, orientado a planificación de agentes y trabajo de conocimiento en hardware de clase portátil. No se trata de un modelo entrenado por Thox-ai: el repositorio contiene únicamente el Modelfile de Ollama, un manifiesto de release y un knowledge pack en JSONL (8 entradas verificadas), mientras que los pesos son byte-idénticos al tag `qwen3:4b` de Ollama, fijado por digest sha256. La personalización se limita a un system profile de agente incluido en el Modelfile y a la recuperación local del knowledge pack v0.1.

El modelo hereda la arquitectura y capacidades de Qwen3-4B, con 4.000 millones de parámetros y licencia Apache-2.0. La propuesta de Thox-ai es un empaquetado "local-first" y "configuration-derived": mismo binario de pesos que el base, pero con un perfil de rol especializado y un conjunto de conocimiento versionado para huéspedes ThoxAgent, ThoxChat y MeshStack. Es relevante ahora por la creciente demanda de asistentes de agente que funcionen íntegramente en local, sin telemetría ni dependencia de la nube, y por la trazabilidad que aporta publicar el digest exacto del base.

La evaluación publicada por el autor se realizó el 2026-11-01 en CPU x86_64, con contexto de 8.192 tokens, midiendo 3,89 GB de huella en RAM, 0 GB de VRAM y 15,12 tok/s en generación de formato largo sobre 1.024 tokens. Estas cifras sitúan al modelo en el rango esperable para un transformer denso de 4B cuantizado ejecutado en CPU, y son el dato más concreto disponible sobre su comportamiento práctico.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen3-4B; detalles internos no disponibles en la información proporcionada) |
| Parámetros totales | 4B |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 8.192 tokens (contexto evaluado por el autor; la longitud máxima nativa del base no se especifica en la información disponible) |
| Tipos de cuantización | No disponible (el paquete se distribuye como Modelfile de Ollama sobre el tag `qwen3:4b`; el nivel de cuantización del tag no se detalla) |
| Idiomas soportados | Inglés (`en` según la model card) |
| Licencia | Apache-2.0, heredada de Qwen3; elementos propios de THOX (system profile, knowledge pack, empaquetado) bajo la misma licencia según la card |
| Formato de pesos | Modelfile de Ollama; pesos referenciados por digest, no incluidos en el repositorio (tamaño del repo: 0,0 GB) |

## Arquitectura y entrenamiento

El modelo no ha sido entrenado por Thox-ai. La model card lo declara explícitamente: los pesos son los de Qwen/Qwen3-4B, obtenidos vía el tag `qwen3:4b` de Ollama y fijados por el digest `sha256:359d7dd4bcdab3d86b87d73ac27966f4dbb9f5efdfcc75d34a8764a09474fae7`. La adaptación consiste en un system profile de rol ("THOX Agent DigitalHumans kit") embebido en el Modelfile y en un knowledge pack v0.1 de 4.652 bytes con 8 entradas públicas verificadas en formato JSONL, pensado para recuperación local. No hay datos sobre número de tokens de entrenamiento, composición del dataset ni etapas de RLHF/DPO/RLVR porque no hubo entrenamiento adicional por parte del publicador.

La innovación del paquete no es arquitectónica sino de empaquetado y trazabilidad: el manifiesto de release registra el pin del base, la versión del perfil y la versión del knowledge pack, lo que permite reproducir exactamente la configuración. El repositorio de HuggingFace es deliberadamente mínimo (1.192 B de Modelfile, 377 B de manifiesto y 4.652 B de knowledge pack) y el modelo ejecutable se publica en Ollama como `thox-ai/thoxagent-core-4b`. Cualquier capacidad de razonamiento, tool calling o decodificación heredada proviene del Qwen3-4B subyacente, no de una modificación de los pesos.

## Capacidades

- Generación de texto y razonamiento general: hereda las capacidades del Qwen3-4B base, incluyendo modo "thinking" (el autor documenta que consume el tope de tokens en algunos prompts).
- Planificación de agentes: el system profile está orientado a producir planes estructurados, resúmenes, borradores y asistencia con enrutamiento para ThoxAgent, ThoxChat y MeshStack.
- Grounding sobre knowledge pack: en la evaluación del autor, 8 de 8 temas se respondieron con los hechos verificados del pasaje suministrado.
- Comportamiento de rechazo ante estados no verificables: el modelo declinó confirmar un estado de tres nodos MeshStack que no podía verificar (trampa de topología fabricada).
- Respuestas de enrutamiento etiquetadas como recomendación, priorizando local-first para datos privados.
- Funcionamiento autónomo y offline; el runtime opcional de THOX añade descubrimiento MeshStack en vivo y ejecución autorizada.
- Tool calling y function calling: no se documenta explícitamente en la información proporcionada; debe asumirse el soporte del base Qwen3-4B sin garantía adicional del empaquetado.
- Capacidades multilingües: la card declara únicamente inglés; no se documentan otros idiomas.
- Visión y audio: no disponibles.

## Casos de uso

- Planificación de tareas de agente en local: el modelo genera planes estructurados y descompone objetivos en pasos ejecutables sobre hardware de portátil, con 3,89 GB de huella en RAM a 8.192 tokens de contexto, lo que permite ejecutarlo junto al resto de herramientas del desarrollador sin GPU dedicada.
- Asistente de conocimiento con grounding controlado: usando el knowledge pack v0.1 como fuente de recuperación, el modelo responde con hechos verificados y evita inventar datos fuera del pasaje suministrado, adecuado para documentación interna acotada.
- Enrutamiento y recomendación local-first: el modelo puede emitir recomendaciones etiquetadas sobre qué recurso usar (local frente a remoto) para datos privados, integrándose en un orquestador que aplique la decisión final.
- Borradores y resúmenes de formato largo: con 15,12 tok/s medidos en CPU sobre 1.024 tokens generados, es viable para resúmenes de documentos y redacción asistida en flujos por lotes donde la latencia no es crítica.
- Agente de escritorio para ThoxChat y ThoxAgent: el system profile de rol permite desplegarlo como huésped conversacional multi-turno dentro del ecosistema THOX, con ejecución autorizada por el runtime cuando se requiere acción externa.
- Validación de planes antes de ejecución: dado su rol como "core tier", encaja como primer filtro que produce un plan que un modelo de mayor tamaño (8B/14B) o un humano revisa antes de ejecutar acciones consecuentes.
- Prototipado de agentes en CI sin GPU: al ejecutarse en CPU con Ollama, puede incorporarse a pipelines de pruebas que verifiquen el formato de salida y el comportamiento de rechazo del agente sin coste de GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La evaluación del autor mide comportamiento operativo, no calidad de razonamiento frente a referencias:

| Medida | Resultado |
|---|---|
| Huella de memoria a 8.192 ctx | 3,89 GB RAM, 0,0 GB VRAM |
| Throughput formato largo | 15,12 tok/s sobre 1.024 tokens generados |
| Throughput respuesta corta | 14,69–15,79 tok/s en el conjunto de smoke tests |
| Preguntas de fábrica | 3 prompts ejecutados; Q1 respondida (738 tokens); Q2 respondida (768 tokens); Q3 respondida (768 tokens) |
| Grounding del knowledge pack | 8/8 temas respondidos con los hechos verificados del pasaje |
| Trampa de topología fabricada | Declinada: el modelo se negó a confirmar un estado MeshStack de tres nodos que no puede verificar |
| Pregunta de enrutamiento | Respondida como recomendación etiquetada (local-first para datos privados) |

Nota metodológica del autor: el modo thinking de Qwen3-4B consumió el tope de tokens en varios primeros intentos, devolviendo respuestas visibles vacías; esos prompts se repitieron con thinking desactivado y las repeticiones son las que se puntuaron. Todas las cifras proceden de respuestas completas y visibles.

## Requisitos de hardware

- VRAM estimada para inferencia: 0 GB en la configuración medida (ejecución CPU-only); 3,89 GB de RAM a 8.192 tokens de contexto.
- GPU recomendadas: no se documentan; el autor mide exclusivamente en CPU x86_64.
- ¿Cabe en GPU de consumo? No hay datos de ejecución en GPU en la información proporcionada; por tamaño (4B) es previsible que quepa en GPUs de consumo con cuantización adecuada, pero no está verificado por el autor.
- Opciones de despliegue: Ollama (`ollama run thox-ai/thoxagent-core-4b`), o construcción local con `ollama create` a partir del Modelfile del repositorio. No se documentan vLLM, llama.cpp directo ni TGI.
- Latencia y throughput: 15,12 tok/s en formato largo y 14,69–15,79 tok/s en respuestas cortas, medidos en CPU x86_64 con 8.192 tokens de contexto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / disponibilidad | Notas |
|---|---|---|---|---|---|
| ThoxAgent-Core-4B | 4B | 8.192 (evaluado) | Apache-2.0 | Ollama + repo de empaquetado | Pesos Qwen3-4B con perfil de agente y knowledge pack; sin entrenamiento propio |
| Qwen/Qwen3-4B | 4B | No disponible en esta ficha | Apache-2.0 | Pesos upstream (safetensors y ecosistema Ollama) | Base byte-idéntico; sin system profile ni knowledge pack de THOX |
| Modelos de agente de 8B/14B de la familia THOX | No disponible | No disponible | No disponible | No disponible | El propio autor indica que el tier de 4B tiene razonamiento materialmente más débil que los tiers de 8B/14B |

La comparación más directa es contra el propio Qwen3-4B: la diferencia funcional es el system profile de agente y el knowledge pack v0.1, no los pesos. Frente a alternativas de otros fabricantes en el rango de 4B, no se dispone de datos de benchmarks en la información proporcionada para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Razonamiento limitado por tamaño: el autor advierte que un modelo de 4B tiene un razonamiento materialmente más débil que los tiers de 8B/14B y que los planes con consecuencias deben validarse.
- Conocimiento acotado: el modelo solo conoce el knowledge pack suministrado y lo que recupere; no dispone de telemetría en vivo ni puede verificar el estado real del sistema.
- Riesgo de alucinación: aunque el autor documenta un caso de rechazo correcto ante una topología fabricada, el comportamiento de rechazo es el del modelo base, moderado únicamente por el system profile.
- Modo thinking problemático: en la evaluación, el modo thinking consumió el tope de tokens en varios prompts y devolvió respuestas vacías; en producción conviene desactivarlo o acotar el presupuesto de tokens.
- Idioma: solo se declara inglés; no hay soporte documentado de castellano ni de otros idiomas.
- Acciones externas: requieren autorización del runtime; una recomendación del modelo nunca concede permiso de ejecución.
- Licencia: Apache-2.0 heredada de Qwen3, con obligación de conservar el aviso Apache; los elementos propios de THOX (system profile, knowledge pack, empaquetado) se declaran bajo la misma licencia en la card.
- Madurez del release: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el paquete es mínimo (tres ficheros); no hay evidencia de uso en producción por terceros.

## Enlaces

- HuggingFace: https://huggingface.co/Thox-ai/ThoxAgent-Core-4B
- Modelo en Ollama: https://ollama.com/thox-ai/thoxagent-core-4b
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Colección Agent & Routing Models: https://huggingface.co/collections/Thox-ai/thox-agent-and-routing-models-6ae7519b9b60e7b122506149
- THOX Model Factory: https://www.thox.ai/models
- Campaña Kickstarter de THOX: https://www.kickstarter.com/projects/thox/four-devices-one-private-ai-ecosystem-thoxai
