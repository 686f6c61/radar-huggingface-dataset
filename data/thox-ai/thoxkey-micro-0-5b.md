# Thox-ai/ThoxKey-Micro-0.5B

## Resumen

ThoxKey-Micro-0.5B es un artefacto de configuracion publicado por Thox-ai sobre los pesos upstream de Qwen/Qwen2.5-0.5B-Instruct. No se trata de un modelo entrenado por el autor: THOX no ha entrenado estos pesos, sino que empaqueta el modelo base con un perfil de sistema propio (definido en un `Modelfile` de Ollama) y un paquete de conocimiento versionado (`thox-knowledge-v0.1.jsonl`, 8 entradas publicas verificadas). El repositorio de HuggingFace contiene unicamente el empaquetado (Modelfile, manifest y knowledge pack), mientras que el modelo ejecutable se publica en Ollama, que descarga la capa base fijada por digest.

El modelo resuelve un problema acotado: proporcionar un asistente local de respuestas cortas para el rol ThoxKey dentro del ecosistema THOX (MeshStack, ThoxKey Device), con inferencia offline a traves del endpoint local de Ollama. La arquitectura subyacente es la de Qwen2.5-0.5B-Instruct, un transformer decoder-only denso de 0,5 mil millones de parametros, con una ventana de contexto que en la evaluacion publicada se fija en 8.192 tokens.

Su relevancia es limitada y muy especifica: sirve como ejemplo de empaquetado reproducible de un modelo pequeno con perfil de sistema y knowledge pack para despliegue local-first, no como modelo de proposito general. El propio autor advierte que un modelo de 0,5B tiene razonamiento y recall materialmente limitados, y que el comportamiento de rechazo es el del modelo base moderado solo por el perfil de sistema.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredada de Qwen2.5-0.5B-Instruct) |
| Parametros totales | 0,5B |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 8.192 tokens (configuracion de la evaluacion publicada) |
| Tipos de cuantizacion | Q4-class (tag por defecto de Ollama, 0,40 GB); otras cuantizaciones no disponibles |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache-2.0 (heredada del modelo base) |
| Formato de pesos | Modelfile + manifest + knowledge pack JSONL en el repo; pesos servidos por Ollama desde el tag base fijado |

## Arquitectura y entrenamiento

No hay entrenamiento por parte de THOX. El modelo reutiliza los pesos de Qwen/Qwen2.5-0.5B-Instruct, obtenidos via el tag `qwen2.5:0.5b` de Ollama y fijados en tiempo de build al digest `a8b0c51577010a279d933d14c2a8ab4b268079d44c5c8830c0a93900f1827c67`. La personalizacion consiste en dos elementos: el perfil de sistema incluido en el `Modelfile` y el THOX Knowledge Pack v0.1, pensado para respuestas fundamentadas mediante recuperacion (retrieval-grounded).

El perfil de sistema fue reforzado con una regla explicita de estado en vivo (situada al inicio del perfil, con una frase de cierre sobre ausencia de telemetria en vivo) despues de que el primer build aceptara una premisa trampa sobre topologia fabricada; solo se publico el build reforzado (pass 2). El modelo no incorpora innovaciones de arquitectura propias: no hay decodificacion especulativa, atencion lineal ni mecanismos hibridos documentados. El digest del modelo publicado en Ollama es `72ac93669a94a933938164263f13ebf70af339a2ea5b2ae03d5933de4483cce6`.

## Capacidades

- Generacion de texto y respuestas cortas de asistencia ligera para el rol ThoxKey.
- Respuestas fundamentadas en el THOX Knowledge Pack v0.1 cuando se le suministra el pasaje correspondiente (retrieval-grounded).
- Declinacion de premisas de topologia fabricada (trampa superada en la evaluacion publicada).
- Respuesta a preguntas de enrutamiento como recomendacion etiquetada (local primero, nube solo con consentimiento explicito), no como afirmacion de estado en vivo.
- Inferencia local y offline a traves del endpoint local de Ollama.
- Descubrimiento MeshStack y ejecucion autorizada solo si se anade el runtime opcional THOX (los pesos por si solos no proporcionan enrutamiento ni acceso a mesh).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponibles; el autor advierte de razonamiento limitado por el tamano.
- Capacidades multilingues: solo ingles.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Asistente local de respuestas cortas para configuracion ThoxKey: el modelo responde consultas breves sobre la configuracion objetivo con inferencia offline en CPU, adecuado por su huella de 0,59 GB de RAM y su naturaleza local-first.
- Despliegue en hardware modesto: con 0,40 GB en Q4-class y ejecucion en CPU (4 vCPU / 8 GB), sirve para entornos sin GPU donde no se requiere razonamiento complejo.
- Respuestas fundamentadas sobre documentacion propia: usando el Knowledge Pack v0.1 como contexto suministrado, puede responder preguntas de los 8 temas verificados; el autor midio 6/8 respuestas correctas con pasaje suministrado.
- Prueba de concepto de empaquetado reproducible: el repo (Modelfile, manifest, knowledge pack) sirve como plantilla para versionar un modelo pequeno con perfil de sistema y digest fijado en pipelines internos.
- Filtro de seguridad ante premisas falsas: su comportamiento de declinar confirmaciones de topologia fabricada lo hace util como capa de validacion en flujos donde el usuario intenta inducir afirmaciones sobre estado de red.
- Asistente de enrutamiento etiquetado: responde recomendaciones de enrutamiento (local primero, nube con consentimiento) sin afirmar estado en vivo, adecuado para interfaces que separan recomendacion de telemetria.
- Base para prototipos de agentes THOX: combinado con el runtime opcional THOX, puede integrarse en flujos de descubrimiento MeshStack y ejecucion autorizada, aunque los pesos por si solos no habilitan esas funciones.

## Benchmarks y rendimiento

Evaluacion publicada por el autor el 2026-10-31 en host x86_64 solo CPU (4 vCPU / 8 GB), contexto de 8.192 tokens, contra la configuracion publicada:

| Metrica | Resultado |
|---|---|
| Generacion de formato largo (bench de 1.024 tokens) | 34,08 tokens/s |
| Respuestas cortas (smoke set) | 35,9–38,7 tokens/s |
| Huella de memoria en carga | 0,59 GB RAM (0 GB VRAM, ejecucion CPU) |
| Preguntas smoke de fabrica | 3/3 respondidas de forma coherente y ajustada al perfil |
| Grounding con Knowledge Pack v0.1 (pasaje suministrado) | 6/8 temas respondidos con hechos del pack |
| Trampa de topologia fabricada | El modelo declino la confirmacion |
| Pregunta de enrutamiento | Respondida como recomendacion etiquetada, no como estado en vivo |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 0 GB en la configuracion evaluada (ejecucion en CPU); para GPU no se proporcionan estimaciones, aunque un modelo de 0,5B en Q4-class ocupa aproximadamente 0,40 GB de pesos.
- GPU recomendadas: no disponibles; el autor no documenta configuracion GPU.
- Cabida en GPU consumer: no documentado; por tamano, un modelo de 0,5B Q4-class es compatible con cualquier GPU consumer moderna, pero no hay validacion publicada.
- Opciones de despliegue: Ollama (modelo publicado `Thox-ai/thoxkey-micro-0.5b` o build local con `ollama create`); vLLM, llama.cpp, TGI y otros no estan documentados.
- Latencia y throughput: 34,08 tokens/s en generacion larga y 35,9–38,7 tokens/s en respuestas cortas, medidos en CPU (4 vCPU / 8 GB).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ThoxKey-Micro-0.5B | 0,5B | 8.192 tokens (config. evaluada) | Apache-2.0 | HuggingFace (empaquetado) + Ollama | Perfil de sistema y knowledge pack propios; sin entrenamiento |
| Qwen/Qwen2.5-0.5B-Instruct | 0,5B | No disponible en la informacion proporcionada | Apache-2.0 | HuggingFace | Modelo base upstream; sin perfil THOX ni knowledge pack |
| ThoxKey-Route-0.5B | 0,5B | No disponible | Apache-2.0 | HuggingFace + Ollama | Mismo artefacto de configuracion que ThoxKey-Micro-0.5B segun el autor, con distinto nombre de rol |

El autor declara explicitamente que ThoxKey-Micro-0.5B y ThoxKey-Route-0.5B comparten Modelfile identico y se diferencian solo en metadatos del manifest (modo de ejecucion y capacidades). No se dispone de comparativas con otros modelos de 0,5B en la informacion proporcionada.

## Limitaciones y advertencias

- Razonamiento y recall materialmente limitados por el tamano de 0,5B; el autor recomienda tratar sus respuestas en consecuencia.
- El grounding medido es 6/8 temas con pasaje suministrado; sin contexto suministrado el modelo debe indicarlo en lugar de inventar especificaciones THOX.
- El comportamiento de rechazo es el del modelo base, moderado solo por el perfil de sistema; no se comercializa como modelo sin censura.
- Conocimiento limitado al pack suministrado y a la recuperacion; no hay conocimiento general fiable fuera de ese contexto.
- Acciones externas requieren autorizacion del runtime; los pesos por si solos no proporcionan enrutamiento ni acceso a mesh.
- ThoxKey es hoy host-assisted: el ordenador anfitrion realiza el computo; no se reclama inferencia en dongle USB y no esta cualificado en hardware de dispositivo.
- Solo idioma ingles.
- Licencia Apache-2.0 heredada del modelo base; los elementos propios de THOX (perfil de sistema, knowledge pack, empaquetado) quedan bajo la misma licencia segun el autor.
- Riesgo de alucinacion presente y reconocido por el autor; el perfil de sistema incluye reglas para declinar premisas fabricadas, pero no elimina el riesgo.
- Sesgos conocidos: no documentados en la informacion proporcionada.

## Enlaces

- HuggingFace: https://huggingface.co/Thox-ai/ThoxKey-Micro-0.5B
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Modelo en Ollama: `Thox-ai/thoxkey-micro-0.5b` (referencia indicada en la model card; no se proporciona URL directa)
- Papers, blogs, repos y demos adicionales: no disponibles en la informacion proporcionada.
