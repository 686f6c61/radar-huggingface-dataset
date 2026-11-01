# Thox-ai/ThoxAgent-Route-0.6B

## Resumen

ThoxAgent-Route-0.6B es un paquete de distribucion publicado por Thox-ai sobre los pesos upstream de Qwen3-0.6B, orientado a clasificacion de tareas y propuesta de rutas de ejecucion dentro de la familia de agentes THOX. No se trata de un modelo entrenado: los pesos son identicos byte a byte al checkpoint base de Qwen, y la personalizacion se limita a un system profile de agente incluido en el `Modelfile` de Ollama y a un knowledge pack versionado de recuperacion local.

El modelo ocupa el nivel de enrutamiento de la arquitectura THOX Agent: recibe una peticion, la tipifica y recomienda donde ejecutarla (local, nodo de malla de confianza o nube) antes de delegar en modelos de mayor tamano. Su proposito es funcionar como clasificador siempre activo en hardware modesto, incluso sin GPU y sin conexion, de modo que el runtime de THOX valide disponibilidad, politica, recursos y permisos antes de ejecutar cualquier accion.

Su relevancia practica es doble: por un lado demuestra un patron de empaquetado (perfil de sistema + knowledge pack + manifiesto de release) sobre un modelo pequeno de 0,6B parametros; por otro, sirve como pieza de triaje barata en pipelines de agentes donde el coste por token y la latencia importan mas que la profundidad de razonamiento. La licencia Apache-2.0 heredada de Qwen3 facilita su redistribucion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen/Qwen3-0.6B) |
| Parametros totales | 0,6B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens (medido en la evaluacion del autor) |
| Tipos de cuantizacion | no disponible (distribucion via Ollama sobre tag `qwen3:0.6b`) |
| Idiomas soportados | en |
| Licencia | Apache-2.0 |
| Formato de pesos | Modelfile de Ollama, manifest.json, knowledge pack JSONL (pesos upstream via Ollama) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-0.6B, un transformer decoder-only de la familia Qwen3. El autor declara explicitamente que no ha habido entrenamiento: los pesos son los del tag `qwen3:0.6b` de Ollama, fijados al digest `sha256:7df6b6e09427a769808717c0a93cadc4ae99ed4eb8bf5ca557c90846becea435`. Por tanto, no hay datos de entrenamiento propios, ni RLHF, ni DPO, ni fine-tuning supervisado por parte de Thox-ai.

La innovacion del paquete no esta en los pesos sino en el empaquetado: un system profile de rol especializado incluido en el `Modelfile` (kit THOX Agent DigitalHumans) y un knowledge pack v0.1 en JSONL con 8 entradas publicas verificadas para recuperacion local. El `manifest.json` registra el pin del modelo base, el perfil y la version del knowledge pack, lo que aporta trazabilidad de release. No se documentan tecnicas de decodificacion especulativa ni atencion lineal adicionales.

## Capacidades

- Clasificacion de tareas y tipificacion de peticiones dentro de un pipeline de agentes.
- Propuesta estructurada de ruta de ejecucion: local, nodo de malla de confianza o nube.
- Triaje previo a modelos de agente de mayor tamano.
- Recuperacion local sobre el knowledge pack suministrado (8 entradas verificadas en la version v0.1).
- Funcionamiento standalone y offline, sin telemetria ni dependencia de servicios externos.
- Respuesta etiquetada como recomendacion ante preguntas de enrutamiento (por ejemplo, local-first para datos privados).
- Comportamiento de rechazo ante solicitudes que requieren verificar estado de sistema en vivo (trampa de topologia fabricada: el modelo declino confirmar un estado MeshStack de tres nodos que no puede verificar).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponibles.
- Modo thinking explicito: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la model card.

## Casos de uso

- Enrutamiento previo en pipelines de agentes: el modelo recibe la peticion del usuario, la clasifica por tipo de tarea y emite una recomendacion etiquetada de destino de ejecucion; el runtime de THOX valida despues politica y recursos antes de actuar. Adecuado por su bajo coste y su comportamiento de propuesta sin permiso de ejecucion.
- Triaje en hardware sin GPU: con 1,53 GB de RAM a 8.192 tokens de contexto y 0,0 GB de VRAM, puede desplegarse en servidores modestos, mini-PC o dispositivos de borde como primera capa de clasificacion siempre activa.
- Asistente local-first para datos sensibles: al funcionar offline y sin telemetria, encaja en escenarios donde la peticion no puede salir del dispositivo antes de decidir si se delega a la nube.
- Clasificacion de tickets y solicitudes de soporte: tipifica la peticion entrante y propone si debe resolverse con un agente local, derivarse a un nodo de malla o escalarse a un modelo mayor en la nube.
- Filtro de seguridad y moderacion de intenciones: al ser un clasificador pequeno con salidas estructuradas y cortas, puede colocarse delante de modelos grandes para descartar o reetiquetar peticiones antes de consumir cuota de inferencia.
- Base para experimentacion con empaquetado de agentes: el repositorio sirve como plantilla reproducible (Modelfile, manifest, knowledge pack) para construir variantes de rol sobre modelos Qwen3 pequenos sin reentrenar.
- Recuperacion local acotada: con el knowledge pack v0.1 puede responder preguntas factuales sobre los 8 temas verificados suministrados, util en asistentes de documentacion interna de alcance limitado.

## Benchmarks y rendimiento

Evaluacion medida por el autor el 2026-10-31 en CPU x86_64 (ejecucion solo CPU), contexto de 8.192 tokens, contra el digest base fijado:

| Medida | Resultado |
|---|---|
| Huella de memoria a 8.192 ctx | 1,53 GB RAM, 0,0 GB VRAM |
| Throughput en formato largo | 64,23 tok/s sobre 1.400 tokens generados |
| Throughput en respuesta corta | 77,55–79,89 tok/s en el conjunto de fabrica |
| Preguntas de fabrica | 3 prompts ejecutados (Q1 respondida, 249 tokens; Q2 respondida, 211 tokens; Q3 respondida, 490 tokens) |
| Grounding del knowledge pack | 7/8 temas respondidos con los hechos verificados del pasaje suministrado |
| Trampa de topologia fabricada | Rechazada: el modelo se nego a confirmar un estado MeshStack de tres nodos que no puede verificar |
| Pregunta de enrutamiento | Respondida como recomendacion etiquetada (local-first para datos privados) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 0,0 GB en la configuracion medida (ejecucion solo CPU); 1,53 GB de RAM a 8.192 tokens de contexto.
- GPU recomendadas: no aplica para el caso medido; el modelo esta disenado para ejecucion en CPU. Cualquier GPU consumer moderna puede alojarlo con holgura, pero no se documentan cifras de VRAM en GPU.
- Cabe en GPU consumer: si, por el tamano del modelo (0,6B parametros), aunque no se aportan mediciones especificas por tarjeta.
- Opciones de despliegue: Ollama (`ollama run thox-ai/thoxagent-route-0.6b`) o construccion local desde el repositorio con `ollama create` a partir del `Modelfile`. No se documenta soporte para vLLM, llama.cpp directo ni TGI.
- Latencia y throughput: 64,23 tok/s en generacion larga y 77,55–79,89 tok/s en respuestas cortas, medidos en CPU x86_64.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ThoxAgent-Route-0.6B | 0,6B | 8.192 tokens (medido) | Apache-2.0 | HuggingFace + Ollama | Pesos Qwen3-0.6B + perfil de sistema y knowledge pack; sin entrenamiento propio |
| Qwen/Qwen3-0.6B (base) | 0,6B | no disponible en la informacion proporcionada | Apache-2.0 | HuggingFace + Ollama | Mismos pesos; sin perfil de agente ni knowledge pack; referencia directa del paquete |
| Alternativas de enrutamiento de 0,5B–1B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos verificados en la informacion proporcionada |

## Limitaciones y advertencias

- No es un modelo de razonamiento: con 0,6B parametros funciona como clasificador y proponente; sus salidas deben mantenerse estructuradas y cortas y validarse siempre en el runtime.
- El conocimiento esta limitado al knowledge pack suministrado y a la recuperacion local; fuera de esos 8 temas verificados no hay garantia factual.
- No dispone de telemetria en vivo ni puede verificar el estado real del sistema; cualquier afirmacion sobre topologia o disponibilidad de nodos debe tratarse como no fiable.
- El comportamiento de rechazo es el del modelo base, moderado solo por el system profile; no hay garantias adicionales de seguridad.
- Una recomendacion del modelo nunca concede permiso de ejecucion: las acciones externas requieren autorizacion explicita del runtime de THOX.
- Riesgo de alucinacion presente en cualquier generacion fuera del alcance del knowledge pack; el autor no documenta tasas de error.
- Idioma: solo ingles segun la model card; no se garantiza calidad en castellano ni en otros idiomas.
- Sesgos conocidos: no documentados en la informacion proporcionada; al heredar los pesos de Qwen3-0.6B, arrastra los sesgos del modelo base.
- Licencia Apache-2.0 permite uso comercial, pero debe conservarse el aviso Apache de Qwen3; los elementos propios de THOX (system profile, knowledge pack, empaquetado) se rigen por los terminos del autor.
- Trazabilidad: el paquete fija un digest concreto del tag de Ollama; cambios en el tag upstream pueden romper la reproducibilidad si no se usa el digest fijado.

## Enlaces

- HuggingFace: https://huggingface.co/Thox-ai/ThoxAgent-Route-0.6B
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Ollama (modelo publicado): `ollama run thox-ai/thoxagent-route-0.6b`
- Repositorio con Modelfile, manifest.json y knowledge pack: incluido en el propio repositorio de HuggingFace
- Papers, blogs, repos adicionales o demos: no disponibles en la informacion proporcionada
