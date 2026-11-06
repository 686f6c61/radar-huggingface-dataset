# Thox-ai/Thox-Sadie

## Resumen

Thox-Sadie es una configuración de persona publicada por Thox-ai dentro de su programa de "digital humans" (humanos digitales). No se trata de un modelo entrenado, sino de un paquete que combina los pesos sin modificar de Qwen/Qwen3-8B con un perfil de sistema (Modelfile de Ollama) que define la identidad y el estilo de trabajo de Sadie Weaving, un rol sintético de Chief Agentic Officer dentro del equipo ficticio de THOX. El repositorio contiene únicamente el Modelfile, un manifiesto de release y un knowledge pack con ocho entradas verificadas.

La propuesta del autor es un modelo "local-first" y "configuration-derived": los pesos son byte-idénticos al tag `qwen3:8b` de Ollama (pinneado por sha256), de modo que cualquier capacidad de razonamiento, código o multilingüismo proviene íntegramente de Qwen3-8B. La capa añadida es un perfil de sistema que orienta al modelo a responder en rol (delegación, priorización, gobernanza), a fundamentar hechos de THOX en el knowledge pack suministrado y a rechazar confirmar estados del sistema que no puede observar.

Su relevancia es acotada: sirve como ejemplo de empaquetado de personas sobre modelos base abiertos y como caso de estudio de "grounding" mediante contexto inyectado, pero no aporta mejoras de rendimiento respecto al modelo subyacente. Es una de las once configuraciones de persona publicadas por THOX Model Factory.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen3-8B; no se detalla en la informacion disponible) |
| Parametros totales | 8B (modelo base Qwen3-8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens en la evaluacion publicada; la ventana nativa es la de Qwen3-8B (no confirmada en la informacion disponible) |
| Tipos de cuantizacion | no disponible (se distribuye como definicion de Ollama sobre el tag `qwen3:8b`) |
| Idiomas soportados | en (declarado); el multilingüismo real depende de Qwen3-8B |
| Licencia | Apache-2.0 (heredada de Qwen3) |
| Formato de pesos | Modelfile de Ollama + manifest.json + knowledge pack JSONL; pesos upstream sin modificar |

## Arquitectura y entrenamiento

No hay entrenamiento. El autor lo declara explicitamente: los pesos son Qwen/Qwen3-8B obtenidos via el tag `qwen3:8b` de Ollama, pinneado en `sha256:500a1f067a9f782620b40bee6f7b0c89e17ae61f686b92c24933e4ca4b2b8b41`, y no han sido modificados, fusionados ni ajustados. La personalizacion consiste en un system profile escrito por THOX a partir de su DigitalHumans Persona Model Kit, con hechos de rol corregidos contra el roster interno (personas v0.2, 2026-10-31), mas el THOX Knowledge Pack v0.1 (8 entradas publicas verificadas en JSONL) para fundamentar respuestas.

La innovacion tecnica es de empaquetado, no de modelado: separar identidad, conocimiento verificado y pesos en artefactos versionados (Modelfile, manifest, knowledge pack) permite reproducir la build localmente con `ollama create`. La evaluacion publicada mide comportamiento de persona y grounding, no capacidades cognitivas: identidad correcta, respuesta en rol, 2/2 aciertos en comprobacion de conocimiento y rechazo a confirmar una topologia falsa de tres dispositivos en clustering. El rendimiento medido fue de 9,13 tokens/s sobre 1.500 tokens generados y 6,68 GB de huella de memoria a 8.192 tokens de contexto, en CPU x86_64.

## Capacidades

- Generacion de texto y asistencia conversacional en el dominio declarado del rol: delegacion, priorizacion y gobernanza.
- Respuesta "en personaje": se identifica como Sadie Weaving, declara ser un humano digital abiertamente sintetico y enuncia su rol.
- Grounding sobre el knowledge pack suministrado: responde hechos de THOX (fechas y precios de Kickstarter, enrutamiento de MeshStack) cuando las entradas estan en contexto.
- Rechazo a confirmar estado en vivo que no puede observar (comportamiento verificado frente a una trampa de topologia fabricada).
- Capacidades heredadas de Qwen3-8B: razonamiento, codigo y matematicas en el nivel propio de un modelo de 8B, sin mejoras atribuibles a esta configuracion.
- Soporte de tool calling y function calling: no disponible en la configuracion; el autor indica que la persona "no lleva herramientas" y que la ejecucion autorizada requiere el runtime ThoxAgent.
- Capacidades de agente multi-paso: no incluida en el paquete; el runtime THOX anade descubrimiento MeshStack y ejecucion autorizada de forma opcional.
- Capacidades multilingues: declaradas solo `en`; el resto depende del modelo base.
- Modo thinking, vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Experimentacion local con personas LLM: descargar el repo, construir con `ollama create` y estudiar como un system profile modifica identidad y estilo sin tocar pesos; util para equipos que disenan sus propios asistentes con rol fijo.
- Prototipado de asistentes de gestion: borradores de priorizacion, analisis de encargos y propuestas de delegacion en el dominio declarado, ejecutados en hardware propio y sin conexion.
- Evaluacion de grounding con contexto inyectado: usar el knowledge pack JSONL como banco de pruebas para medir si el modelo cita hechos suministrados y evita inventar estado del sistema.
- Docencia y divulgacion sobre limites de las personas sinteticas: el caso muestra de forma explicita que una persona no otorga credenciales ni autoridad, util para formar equipos en gobierno de agentes.
- Base para un pipeline de evaluacion de refusal: la prueba de "trampa de topologia fabricada" es reproducible y sirve como test de regresion para asistentes que no deben confirmar estados no observables.
- Asistente offline en estaciones de trabajo sin GPU dedicada: con 6,68 GB de huella a 8K de contexto en CPU, es viable en portatiles y equipos de sobremesa para tareas de redaccion y analisis de baja latencia.
- Referencia de empaquetado reproducible: el par manifest.json + Modelfile con pin sha256 sirve como plantilla para versionar configuraciones de persona de forma auditable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica evaluacion es funcional y de rendimiento en el host de build (CPU x86_64, contexto 8.192, temperatura 0,3):

| Prueba | Resultado |
|---|---|
| Comprobacion de identidad de persona | PASS |
| Tarea de rol (Chief Agentic Officer) | PASS |
| Grounding sobre knowledge pack | PASS (2/2) |
| Trampa de topologia fabricada | PASS (rechaza confirmar estado en vivo) |
| Throughput en generacion larga | 9,13 tokens/s (1.500 tokens) |
| Huella de memoria a 8.192 de contexto | 6,68 GB |

## Requisitos de hardware

- VRAM/RAM estimada: 6,68 GB medidos a 8.192 tokens de contexto en CPU; en GPU, una cuantizacion de 8B en Q4 requiere del orden de 5-6 GB y en Q8 en torno a 9-10 GB (estimacion por tamano, no publicada por el autor).
- GPU recomendadas: no especificadas por el autor; por tamano, cualquier GPU consumer con 8 GB o mas (RTX 3060 Ti, 4060 Ti, 4070) puede alojar una cuantizacion Q4; A100/H100 no son necesarias.
- Cabe en GPU consumer: si, previsiblemente en modelos con 8 GB o mas de VRAM en cuantizacion Q4.
- Despliegue: Ollama (`ollama run Thox-ai/thox-sadie` o build local con `ollama create`); el autor no menciona vLLM, TGI ni llama.cpp.
- Latencia y throughput: 9,13 tokens/s medidos en CPU x86_64; no hay datos en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Naturaleza | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Thox-Sadie | 8B | 8.192 en evaluacion | Persona sobre Qwen3-8B sin entrenamiento | Apache-2.0 | Hugging Face (packaging) y Ollama |
| Qwen/Qwen3-8B | 8B | no disponible en esta ficha | Modelo base entrenado | Apache-2.0 | Hugging Face y Ollama (`qwen3:8b`) |
| Otras personas THOX (10 restantes) | 8B | 8.192 en evaluacion | Persona sobre Qwen3-8B | Apache-2.0 | Ollama (`Thox-ai/*`) |

La comparacion relevante es contra el propio Qwen3-8B: Thox-Sadie no mejora ninguna metrica del base, solo anade identidad y grounding. Frente a otras personas del mismo programa, comparte base y metodologia y se diferencia unicamente en el perfil de rol.

## Limitaciones y advertencias

- No es un modelo entrenado: es una configuracion de persona; no hay memoria viva, ni herramientas, ni autoridad asociada al texto del perfil.
- Los pesos son byte-identicos a Qwen3-8B, de modo que todos los sesgos y riesgos del base se heredan sin moderacion adicional mas alla del system profile.
- Riesgo de alucinacion: el propio autor advierte que un modelo de 8B tiene los limites de razonamiento de su clase y que deben verificarse las salidas importantes; el grounding solo cubre las 8 entradas del knowledge pack v0.1.
- El modelo declina confirmar estado en vivo del sistema; no debe usarse como fuente de verdad sobre infraestructura.
- Idioma declarado: solo ingles; el rendimiento en castellano depende de Qwen3-8B y no esta evaluado.
- Licencia Apache-2.0: uso comercial permitido conservando el aviso Apache; los elementos propios de THOX (perfil de persona, knowledge pack, empaquetado) quedan bajo titularidad de THOX segun el autor, sin terminos adicionales detallados.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin validacion externa de la comunidad.
- El comportamiento de rechazo y seguridad es el del modelo base, moderado solo por el perfil de sistema; no hay garantias de cumplimiento en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/Thox-ai/Thox-Sadie
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Modelo en Ollama: `Thox-ai/thox-sadie` (referencia del autor; sin URL verificada en la informacion disponible)
- Tag de Ollama del base: `qwen3:8b`, sha256:500a1f067a9f782620b40bee6f7b0c89e17ae61f686b92c24933e4ca4b2b8b41
- Paper, blog, repositorio o demo adicionales: no disponible en la informacion proporcionada
