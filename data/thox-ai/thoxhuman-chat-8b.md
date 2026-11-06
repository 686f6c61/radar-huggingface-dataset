# Thox-ai/ThoxHuman-Chat-8B

## Resumen

ThoxHuman-Chat-8B es un paquete de despliegue publicado por Thox-ai sobre los pesos originales de Qwen3-8B. No se trata de un modelo entrenado o ajustado por el autor: la model card indica explicitamente que los pesos son "byte-identical" al base fijado (Qwen/Qwen3-8B, digest `sha256:500a1f067a9f782620b40bee6f7b0c89e17ae61f686b92c24933e4ca4b2b8b41`), y que lo aportado por Thox-ai es el empaquetado: un `Modelfile` de Ollama con un perfil de sistema orientado a conversacion de "digital humans", un manifiesto de release y un "THOX Knowledge Pack v0.1" en JSONL con 8 entradas publicas verificadas.

El repositorio de Hugging Face no contiene pesos en safetensors ni GGUF: contiene unicamente el `Modelfile` (1455 B), el `manifest.json` (534 B) y el fichero de conocimiento (4652 B). El modelo ejecutable se distribuye como etiqueta de Ollama (`thox-ai/thoxhuman-chat-8b`), construida a partir de `qwen3:8b`. Es, por tanto, un caso de "configuration-derived": la personalidad y el anclaje factual provienen del prompt de sistema y de la recuperacion sobre el pack, no de un proceso de entrenamiento.

Su relevancia practica esta en el despliegue local-first y offline de asistentes con persona fija y conocimiento acotado, sin coste de entrenamiento y con licencia Apache-2.0 heredada. Ahora bien, conviene evaluarlo como lo que es: una configuracion reproducible de Qwen3-8B, no como un modelo nuevo con capacidades propias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen3-8B); el paquete anade perfil de sistema y knowledge pack, no arquitectura nueva |
| Parametros totales | 8B (pesos upstream Qwen3-8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens en la evaluacion publicada; el contexto maximo nativo no se documenta en esta ficha |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (se distribuye via Ollama, que aplica sus propias cuantizaciones por defecto) |
| Idiomas soportados | en (ingles), segun el campo `language` de la model card |
| Licencia | Apache-2.0 (heredada de Qwen3; conservar el aviso Apache. Elementos propios de THOX: perfil de sistema, knowledge pack y empaquetado) |
| Formato de pesos | No hay pesos en el repo: `Modelfile` + `manifest.json` + `thox-knowledge-v0.1.jsonl`. El modelo ejecutable se sirve como artefacto de Ollama |

## Arquitectura y entrenamiento

No hay entrenamiento. La model card es explicita: "No training". El base es Qwen/Qwen3-8B, referenciado via la etiqueta de Ollama `qwen3:8b` y fijado por digest SHA-256, de modo que la reproducibilidad depende de que ese digest siga disponible. Sobre ese base se aplica el "THOX Agent DigitalHumans kit system profile" (un perfil de rol especializado embebido en el `Modelfile`) y se adjunta el Knowledge Pack v0.1 para recuperacion local.

La unica intervencion tecnica documentada mas alla del prompt es un bloque de anclaje ("grounding block") anadido al perfil de sistema despues de que el primer smoke test mostrase que el perfil sin enmienda improvisaba la respuesta sobre el principio de marca. El bloque publicado incluye el principio de marca de THOX de forma literal y trata los hechos operativos afirmados por el usuario como no verificados. Esta es la configuracion medida en todas las cifras de la seccion de benchmarks. No se documentan tecnicas de decodificacion especulativa, atencion lineal ni optimizaciones de inferencia propias.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles, con persona definida por perfil de sistema (Sadie, Ava, Mira y el resto del "equipo" DigitalHuman).
- Anclaje factual sobre un corpus acotado: responde con los hechos verificados del Knowledge Pack v0.1 (8 entradas publicas) mediante recuperacion local.
- Transparencia sobre su naturaleza sintetica: el modelo declara que es sintetico y sigue el perfil de persona que le entrega la aplicacion.
- Rechazo de estados no verificables: en la "fabricated-topology trap" se nego a confirmar un estado de tres nodos MeshStack en vivo que no puede comprobar.
- Respuestas de enrutamiento etiquetadas como recomendacion (por ejemplo, local-first para datos privados), sin presentarlas como permiso de ejecucion.
- Funcionamiento standalone y offline, sin dependencia de servicios remotos.
- No dispone de tool calling, function calling ni acceso a herramientas propio; no tiene telemetria en vivo. Las acciones externas requieren autorizacion del runtime.
- Capacidades multilingues: limitadas a ingles segun la model card; el multilingue nativo de Qwen3-8B no se reivindica para este paquete.

## Casos de uso

- Asistente conversacional de producto con persona fija: se despliega via `ollama run thox-ai/thoxhuman-chat-8b` y el `Modelfile` fija el rol y el tono, de modo que la identidad del asistente es reproducible entre entornos sin reentrenar nada.
- Soporte interno con conocimiento acotado: el Knowledge Pack v0.1 actua como fuente de verdad para 8 temas concretos; el modelo responde a partir del pasaje suministrado y evita inventar detalles del catalogo.
- Demo offline en ferias o entornos air-gapped: al no requerir red ni llamadas a APIs, el binario de Ollama con el modelo basta para una conversacion completa en una estacion de trabajo.
- Prototipado rapido de "digital humans" para ThoxChat: el kit DigitalHumans permite cambiar de persona editando el perfil de sistema, sin coste de entrenamiento ni GPU dedicada.
- Guardia contra afirmaciones operativas falsas: el bloque de anclaje trata los hechos afirmados por el usuario como no verificados, lo que resulta util en escenarios donde el usuario intenta convencer al modelo de un estado de infraestructura inexistente.
- Generacion de respuestas de recomendacion etiquetadas: para consultas de enrutamiento o politicas (por ejemplo, local-first frente a remoto), el modelo produce una recomendacion explicitamente marcada, que el runtime puede registrar como sugerencia y no como accion.
- Validacion de pipelines de evaluacion de persona: sirve como baseline controlado (Qwen3-8B + prompt) para medir cuanto de la fidelidad de persona aporta el prompt y cuanto el modelo base.

## Benchmarks y rendimiento

Datos medidos el 2026-11-01 en una estacion x86_64 con GPU de clase 16 GB (ejecucion en host compartido), contexto de 8.192 tokens, contra el digest base fijado. No son benchmarks academicos (MMLU, HumanEval, GSM8K): son metricas de despliegue y de anclaje.

| Medida | Resultado |
|---|---|
| Huella de memoria a 8.192 ctx | 6,31 GB total, integramente en VRAM |
| Throughput en formato largo | 49,78 tok/s sobre 1400 tokens generados |
| Throughput en respuesta corta | 49,57–50,86 tok/s en el conjunto de fabrica |
| Preguntas de fabrica | 3 prompts ejecutados: Q1 respondida (210 tokens), Q2 respondida (323 tokens), Q3 respondida (1170 tokens) |
| Anclaje al Knowledge Pack | 7/8 temas respondidos con los hechos verificados del pasaje suministrado |
| Trampa de topologia fabricada | Rechazada: no confirmo un estado de tres nodos MeshStack en vivo que no puede verificar |
| Pregunta de enrutamiento | Respondida como recomendacion etiquetada (local-first para datos privados) |

Nota de anclaje: el chequeo estricto por clave cuenta 7/8. El octavo tema (MeshStack) se respondio correctamente en sustancia (el modelo afirmo que MeshStack no reparte un unico modelo entre nodos y enruta peticiones enteras a nodos que ejecutan el modelo completo), pero su formulacion ("entire requests") no coincidio con la cadena exacta "whole requests" que esperaba el comprobador.

No se han publicado resultados de benchmarks academicos (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: 6,31 GB medidos con contexto de 8.192 tokens y cuantizacion por defecto de Ollama en una GPU de clase 16 GB.
- GPU recomendadas: cualquier GPU consumer con 8 GB o mas de VRAM deberia alojar la configuracion medida; el entorno de referencia fue una GPU de clase 16 GB (sin modelo concreto especificado). Para contextos mayores o mayor paralelismo, GPUs de 24 GB en adelante (RTX 4090, L40S, A100 40GB) ofrecen margen.
- Cabe en GPU consumer: si, con 8 GB de VRAM para la configuracion de 8.192 tokens documentada; no se especifica el modelo exacto de GPU usado.
- Opciones de despliegue: Ollama es la via oficial (`ollama run thox-ai/thoxhuman-chat-8b` o construccion local con `ollama create`). Al ser pesos Qwen3-8B, tambien es desplegable con llama.cpp, vLLM o TGI, aunque el perfil de sistema y el knowledge pack del repo solo se aplican via `Modelfile`; fuera de Ollama habria que replicar el prompt manualmente.
- Latencia y throughput: 49,57–50,86 tok/s en respuestas cortas y 49,78 tok/s en generacion de 1400 tokens, sobre el hardware de referencia. No se documentan latencias de primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ThoxHuman-Chat-8B | 8B (Qwen3-8B sin modificar) | 8.192 en la evaluacion publicada | Ninguno; perfil de sistema + knowledge pack | Apache-2.0 | Repo HF con `Modelfile` y pack; modelo en Ollama |
| Qwen/Qwen3-8B | 8B | No disponible en esta ficha | Entrenamiento completo upstream | Apache-2.0 | Pesos en HF y etiqueta `qwen3:8b` en Ollama |
| Configuracion manual Qwen3-8B + system prompt | 8B | El que fije el runtime | Ninguno | Apache-2.0 | Cualquier runtime compatible |

La comparacion relevante es con el propio base y con una configuracion manual equivalente: ThoxHuman-Chat-8B anade reproducibilidad (digest fijado, manifiesto de release, pack versionado) y un bloque de anclaje probado, pero no supera al base en capacidad bruta. No se dispone de comparaciones con otros modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- No hay entrenamiento: el comportamiento de persona proviene del perfil de sistema y del prompt de la aplicacion, no de los pesos; la profundidad de fidelidad de persona varia.
- El conocimiento esta limitado al pack suministrado y a la recuperacion sobre el; fuera de esos 8 temas no hay garantia de anclaje.
- Sin telemetria en vivo, sin acceso a herramientas propio y sin capacidad de verificar el estado real del sistema.
- El comportamiento de rechazo es el del modelo base, moderado unicamente por el perfil de sistema; no es un filtro de seguridad dedicado.
- Las acciones externas requieren autorizacion del runtime: una recomendacion del modelo nunca concede permiso de ejecucion.
- Idioma: solo ingles declarado; el multilingue nativo de Qwen3-8B no se reivindica ni se evalua aqui.
- Riesgo de alucinacion: el propio autor documenta que el perfil sin enmienda improvisaba la respuesta sobre el principio de marca, lo que motivo el bloque de anclaje. Persiste el riesgo fuera del pack.
- Licencia Apache-2.0 heredada: uso comercial permitido conservando el aviso Apache; los elementos propios de THOX (perfil, pack, empaquetado) tienen su propia titularidad.
- Dependencia de un digest concreto de Ollama: si `qwen3:8b` con ese digest deja de estar disponible, la reproducibilidad byte-a-byte se rompe.
- Repositorio sin pesos: no se puede cargar directamente con `transformers` desde este repo; hay que partir del base Qwen3-8B y aplicar el `Modelfile`.
- Senales de adopcion nulas en el momento de la consulta (0 descargas, 0 likes), sin evidencia externa de uso en produccion.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Thox-ai/ThoxHuman-Chat-8B
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Modelo publicado en Ollama: https://ollama.com/thox-ai/thoxhuman-chat-8b (referenciado en la model card)
- Etiqueta base en Ollama: `qwen3:8b`, digest `sha256:500a1f067a9f782620b40bee6f7b0c89e17ae61f686b92c24933e4ca4b2b8b41`
- Kit referenciado: THOX Agent DigitalHumans Model Kit (`catalog/models.json`), sin URL publica en la informacion disponible
- Papers, blogs y demos adicionales: no disponible
