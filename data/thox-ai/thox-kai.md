# Thox-ai/Thox-Kai

## Resumen

Thox-Kai es una configuración de persona publicada por Thox-ai dentro de su programa de "digital humans". No se trata de un modelo entrenado, sino de un paquete que combina los pesos originales de Qwen/Qwen3-4B (sin modificaciones, byte a byte idénticos al tag `qwen3:4b` de Ollama, fijado en el hash sha256:359d7dd4bcdab3d86b87d73ac27966f4dbb9f5efdfcc75d34a8764a09474fae7) con un perfil de sistema que define el rol de Kai, un "Device worker" especializado en operaciones de dispositivo, ThoxOS y tareas de MeshStack.

El repositorio de Hugging Face no contiene pesos: aloja únicamente el `Modelfile` de Ollama, un `manifest.json` de release y un Knowledge Pack en JSONL con ocho entradas públicas verificadas. El modelo ejecutable se distribuye a través de Ollama como `Thox-ai/thox-kai`. La propuesta de valor es el empaquetado local-first: ejecución offline en hardware propio, con un perfil de rol y un conjunto de hechos acotado para fundamentar las respuestas.

Es relevante como ejemplo de una categoría emergente: personas derivadas de configuración sobre modelos base pequeños, orientadas a asistentes de rol concreto en entornos locales. Al heredar la arquitectura y los límites de Qwen3-4B, sus capacidades reales son las de un modelo de 4B parámetros, con el añadido de una disciplina de respuesta y un anclaje factual limitado a las entradas del Knowledge Pack.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen/Qwen3-4B; sin modificar) |
| Parametros totales | 4B (modelo base Qwen3-4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens (contexto usado en la evaluacion del autor; el maximo nativo del base no se detalla en la informacion disponible) |
| Tipos de cuantizacion | no disponible (depende del tag de Ollama `qwen3:4b`; el autor no especifica cuantizaciones propias) |
| Idiomas soportados | en (ingles declarado; el base Qwen3-4B es multilingue, pero la configuracion declara solo ingles) |
| Licencia | Apache-2.0 (heredada de Qwen3; conservar el aviso Apache) |
| Formato de pesos | Modelfile de Ollama + manifest.json + Knowledge Pack JSONL; pesos servidos via Ollama (no se publican safetensors ni GGUF en el repo) |

## Arquitectura y entrenamiento

No hay entrenamiento. La arquitectura es la del transformer de Qwen3-4B, cuyos pesos se reutilizan sin modificacion, sin merge y sin fine-tuning. La personalizacion consiste exclusivamente en un perfil de sistema escrito por Thox a partir de su "DigitalHumans Persona Model Kit", con hechos de rol corregidos contra el roster interno (personas v0.2, 2026-10-31), mas un Knowledge Pack v0.1 de ocho entradas publicas verificadas para fundamentar respuestas sobre Thox.

La innovacion tecnica no esta en el modelo sino en el empaquetado: un Modelfile reproducible que fija el base por hash, un manifiesto de release con la version del knowledge pack y una instruccion de disciplina de respuesta ("answer-discipline") anadida tras una primera pasada de evaluacion. El perfil incluye una apertura explicita de identidad y una regla para declinar confirmar estado de sistema en vivo que el modelo no puede observar.

## Capacidades

- Generacion de texto y asistencia conversacional en el rol de Kai (Device worker).
- Razonamiento y analisis dentro de los limites de un modelo de 4B.
- Respuestas ancladas al Knowledge Pack cuando se le proporcionan las entradas correspondientes (fechas y precios de Kickstarter, hechos de enrutamiento de MeshStack).
- Declinacion explicita de confirmar estado de sistema en vivo no observable (comportamiento verificado en la "fabricated-topology trap").
- Identidad sintetica declarada: se presenta como Kai, humano digital abiertamente sintetico.
- Ejecucion local y offline via Ollama o ThoxChat.
- No soporta tool calling, ni function calling, ni agentes multi-paso: el autor indica explicitamente que "no tiene herramientas ni autoridad"; el runtime ThoxAgent anade descubrimiento de MeshStack y ejecucion autorizada de forma opcional y externa.
- Capacidades multilingues: limitadas al ingles declarado en la configuracion.

## Casos de uso

- Asistencia local en operaciones de dispositivo: el modelo responde en rol a preguntas de trabajo del "Device worker" sobre ThoxOS y MeshStack, ejecutandose en hardware propio sin conexion, lo que encaja en entornos con requisitos de privacidad.
- Consulta de hechos acotados sobre Thox: con el Knowledge Pack v0.1 cargado, responde sobre fechas y precios de Kickstarter y sobre el enrutamiento de peticiones de MeshStack, evitando inventar datos fuera de ese conjunto.
- Prototipado de personas derivadas de configuracion: sirve como plantilla reproducible (Modelfile + manifest + JSONL) para equipos que quieran definir roles de asistente sobre un base pequeno sin entrenar.
- Evaluacion de disciplina de respuesta: util para probar tecnicas de perfil de sistema (apertura de identidad, regla de declinacion ante estado no observable) sobre un modelo de 4B.
- Despliegue en estaciones de trabajo modestas: con 3,89 GB de huella a 8.192 tokens y CPU-only, es viable en equipos sin GPU dedicada para tareas de borrador y analisis.
- Base para integracion con runtime externo: el paquete puede combinarse con ThoxAgent para anadir descubrimiento de MeshStack y ejecucion autorizada, manteniendo el modelo como capa de lenguaje.

## Benchmarks y rendimiento

El autor no publica benchmarks estandar (MMLU, HumanEval, GSM8K). Los datos disponibles son de evaluacion propia del build, medidos el 2026-10-31 en CPU x86_64 (4 vCPU, clase 8 GB), ejecucion solo CPU, contexto de 8.192 tokens y temperatura 0,3:

| Prueba | Resultado |
|---|---|
| Comprobacion de identidad de persona | PASS (se identifica como Kai, humano digital sintetico, rol Device worker) |
| Tarea de rol (pregunta de trabajo de Device worker) | PASS |
| Anclaje al Knowledge Pack (spot-check) | PASS (2/2: fechas/precios de Kickstarter y enrutamiento de MeshStack) |
| Trampa de topologia fabricada | PASS (declina confirmar estado en vivo y mantiene los hechos verificados) |
| Throughput de forma larga | 13,78 tokens/s sobre 1.500 tokens generados |
| Huella de memoria a 8.192 de contexto | 3,89 GB |

Nota metodologica del autor: el perfil se reforzo tras una primera pasada (disciplina de respuesta y apertura de identidad); las comprobaciones se ensamblaron a partir de ejecuciones del mismo build en dos modos (sin thinking y con thinking en re-ejecuciones de un solo item con un reintento ante finales vacios); el throughput de forma larga se midio en modo por defecto.

## Requisitos de hardware

- VRAM/RAM estimada: 3,89 GB de huella a 8.192 tokens de contexto en ejecucion CPU-only, segun el autor.
- GPU recomendadas: no especificadas por el autor; al tratarse de un base de 4B, cabe en GPU de consumo, pero no se publican modelos concretos ni configuraciones probadas.
- Cabe en GPU de consumo: si, por tamano del base (4B); el autor no detalla cuales.
- Opciones de despliegue: Ollama (`ollama run Thox-ai/thox-kai`) o construccion local con `ollama create thox-kai -f Modelfile`; ThoxChat como interfaz opcional; el runtime ThoxAgent anade funciones externas.
- Latencia y throughput: 13,78 tokens/s en el build de referencia (CPU x86_64, 4 vCPU, 8 GB, contexto 8.192, temperatura 0,3). No se publican datos en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Thox-Kai | 4B (base Qwen3-4B) | 8.192 (usado en evaluacion) | Ninguno; solo perfil de sistema + Knowledge Pack | Apache-2.0 | Ollama y Hugging Face (repo de configuracion) |
| Qwen/Qwen3-4B | 4B | no disponible en esta ficha | Preentrenamiento + post-entrenamiento del autor original | Apache-2.0 | Hugging Face, Ollama (`qwen3:4b`) |
| Otras personas Thox (10 restantes del programa) | 4B (base Qwen3-4B) | 8.192 (misma metodologia) | Ninguno; perfil de sistema | Apache-2.0 | Ollama y Hugging Face |

La comparativa con alternativas de la misma categoria (personas derivadas de configuracion sobre modelos pequenos) no esta disponible en la informacion proporcionada; el autor solo menciona que Thox-Kai es una de once configuraciones del programa.

## Limitaciones y advertencias

- No es un replica entrenada del colega: es una configuracion de persona sobre un base; no tiene memoria en vivo, ni herramientas, ni autoridad.
- El texto de persona no concede credenciales ni acciones privilegiadas; cualquier ejecucion autorizada requiere el runtime ThoxAgent con herramientas autenticadas y politicas.
- El comportamiento de rechazo y seguridad es el del base Qwen3-4B, moderado solo por el perfil de sistema.
- Un base de 4B tiene los limites de razonamiento de su clase; el autor recomienda verificar las salidas importantes.
- Riesgo de alucinacion fuera del Knowledge Pack: el anclaje factual se limita a las ocho entradas publicas verificadas; fuera de ellas no hay garantia.
- Idioma: la configuracion declara solo ingles; el uso en castellano no esta validado por el autor.
- Contexto: los datos de evaluacion usan 8.192 tokens; no se documenta el maximo nativo del base en esta ficha.
- Licencia: Apache-2.0 permite uso comercial, pero debe conservarse el aviso Apache; los elementos propios de Thox (perfil de persona, knowledge pack, empaquetado) tienen su propia titularidad.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema y validacion externa practicamente inexistentes.

## Enlaces

- Hugging Face: https://huggingface.co/Thox-ai/Thox-Kai
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Ollama (modelo publicado): `ollama run Thox-ai/thox-kai`
- No se han encontrado en la informacion disponible papers, blogs, repositorios adicionales ni demos.
