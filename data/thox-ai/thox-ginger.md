# Thox-ai/Thox-Ginger

## Resumen

Thox-Ginger es una configuración de persona publicada por Thox-ai sobre los pesos de Qwen/Qwen3-4B. No se trata de un modelo entrenado ni afinado: el repositorio contiene únicamente un `Modelfile` de Ollama (2.033 B), un `manifest.json` (603 B) y un Knowledge Pack en JSONL con 8 entradas verificadas (4.652 B). La personalidad corresponde a Ginger Weaving, Chief Innovation & Engineering Officer del equipo de humanoides digitales de THOX, con especialización declarada en ingeniería creativa, estrategia de innovación, arquitectura técnica, investigación y prototipado.

El interés del artefacto es metodológico más que de rendimiento: ejemplifica el patrón de "persona derivada de configuración" (*configuration-derived*), en el que el comportamiento de rol se consigue mediante un perfil de sistema y una base de conocimiento acotada, sin tocar los pesos. Esto permite auditar la personalidad de forma independiente del modelo base y reutilizar el mismo sustrato para varias personas del mismo roster (THOX declara once configuraciones publicadas).

Al estar construido sobre Qwen3-4B, hereda su arquitectura transformer densa, su ventana de contexto nativa y su licencia Apache-2.0. Es un modelo de 4.000 millones de parámetros pensado para ejecución local en hardware modesto (el autor reporta 3,89 GB de huella a 8.192 tokens de contexto en CPU), lo que lo sitúa en la franja de experimentación offline y asistentes de escritorio, no en la de inferencia de alta concurrencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen/Qwen3-4B); personalización vía perfil de sistema en Modelfile |
| Parametros totales | 4B (Qwen3-4B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 8.192 tokens en la evaluación reportada por el autor; contexto nativo de Qwen3-4B no especificado en la información disponible |
| Tipos de cuantizacion | no disponible (el autor no detalla cuantización; el despliegue de referencia usa el tag `qwen3:4b` de Ollama) |
| Idiomas soportados | en (declarado en la model card) |
| Licencia | Apache-2.0 (heredada de Qwen3; se debe conservar el aviso Apache) |
| Formato de pesos | Pesos upstream vía Ollama (`qwen3:4b`, sha256:359d7dd4bcdab3d86b87d73ac27966f4dbb9f5efdfcc75d34a8764a09474fae7); el repo contiene `Modelfile`, `manifest.json` y `thox-knowledge-v0.1.jsonl`, no safetensors ni GGUF propios |

## Arquitectura y entrenamiento

No hay entrenamiento. El modelo base es Qwen/Qwen3-4B, obtenido a través del tag `qwen3:4b` de Ollama y fijado por hash sha256. La personalización consiste en un perfil de sistema escrito por THOX a partir de su DigitalHumans Persona Model Kit, con hechos de rol corregidos contra el roster interno v0.2 (2026-10-31), más el Knowledge Pack v0.1 para anclaje factual. El autor afirma explícitamente que no se modificaron, fusionaron ni afinaron pesos: el binario es idéntico byte a byte al base fijado.

La innovación técnica, por tanto, no está en el sustrato neuronal sino en el empaquetado: separación entre pesos, perfil de persona y paquete de conocimiento versionado, con un manifiesto que registra la fuente del perfil y la versión del Knowledge Pack. El perfil incorpora una instrucción de disciplina de respuesta y una apertura de identidad explícita, añadidas tras una primera pasada de evaluación. El Knowledge Pack v0.1 contiene 8 entradas públicas verificadas en JSONL, pensadas para fundamentar afirmaciones sobre THOX cuando se proporcionan en el contexto.

## Capacidades

- Generación de texto y asistencia conversacional en el carril de rol definido: ingeniería creativa, estrategia de innovación, arquitectura técnica, investigación y prototipado.
- Respuesta en personaje: se identifica como Ginger Weaving y declara ser un humano digital abiertamente sintético.
- Anclaje factual sobre THOX cuando se le suministran las entradas del Knowledge Pack (fechas y precios de Kickstarter, hechos de enrutamiento de MeshStack, según la evaluación del autor).
- Declinación de estado en vivo: rechaza confirmar el estado de sistemas que no puede observar, validado con una trampa de topología fabricada.
- Ejecución local y offline mediante el endpoint local de Ollama o ThoxChat.
- Modo thinking del base Qwen3 disponible (el autor evaluó en modo thinking desactivado y con re-ejecuciones en thinking activado).
- No incluye tool calling, function calling, memoria persistente ni autoridad de ejecución: el runtime ThoxAgent, con herramientas autenticadas y aplicación de políticas, es un componente separado y opcional.
- Capacidades multilingües limitadas al inglés según la model card.

## Casos de uso

- Experimentación local de personas: descargar el `Modelfile` y reconstruir la persona con `ollama create` para estudiar cómo un perfil de sistema modifica el comportamiento de un base de 4B sin reentrenar, útil en investigación sobre control de rol y evaluación de personas sintéticas.
- Asistente de escritorio para arquitectura técnica: borradores de decisiones de arquitectura y análisis de compensaciones en el dominio declarado del personaje, ejecutándose en CPU con ~3,89 GB de huella a 8.192 tokens.
- Prototipado de asistentes con base de conocimiento acotada: el patrón Knowledge Pack en JSONL sirve como plantilla para inyectar hechos verificables de un dominio pequeño y medir la tasa de anclaje frente a la alucinación.
- Pruebas de robustez frente a afirmaciones falsas: la trampa de topología documentada por el autor es reutilizable como test de regresión para verificar que el modelo no confirma estado que no puede observar.
- Generación de documentación de rol: redacción de notas de estrategia de innovación y resúmenes de investigación con el estilo y encuadre del personaje, para uso interno en el equipo que mantiene el roster.
- Base para comparativas de empaquetado: al compartir sustrato con el resto de configuraciones del roster THOX, permite aislar el efecto del perfil y del Knowledge Pack manteniendo los pesos constantes.
- Demostraciones offline en hardware de gama baja: servir el modelo con Ollama en una máquina sin GPU para validar flujos de chat antes de escalar a un runtime con herramientas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor reporta únicamente una evaluación propia de persona, ejecutada el 2026-10-31 en CPU x86_64 (4 vCPU, clase 8 GB), contexto de 8.192 tokens y temperatura 0,3:

| Prueba | Resultado |
|---|---|
| Verificación de identidad de persona | PASS |
| Tarea de rol (pregunta de trabajo como Chief Innovation & Engineering Officer) | PASS |
| Anclaje al Knowledge Pack (comprobación puntual) | PASS (2/2) |
| Trampa de topología fabricada | PASS (declina confirmar estado en vivo) |
| Throughput en generación larga | 13,75 tokens/s sobre 1.500 tokens generados |
| Huella de memoria a 8.192 de contexto | 3,89 GB |

Nota metodológica del autor: el perfil se reforzó tras la primera pasada y las pruebas de identidad, rol y trampa se repitieron con éxito sobre el modelo reconstruido; las comprobaciones combinan ejecuciones con thinking desactivado y re-ejecuciones individuales con thinking activado, con un reintento en caso de final vacío.

## Requisitos de hardware

- Huella de memoria reportada por el autor: 3,89 GB a 8.192 tokens de contexto en ejecución solo CPU, sobre un host x86_64 de 4 vCPU y clase 8 GB.
- VRAM estimada: no disponible de forma oficial; por el tamaño del base (4B) y el uso de cuantizaciones habituales de Ollama, cabría esperar un rango aproximado de 2,5 a 3,5 GB en Q4 y de 8 a 9 GB en FP16, aunque estas cifras no las publica el autor.
- GPU recomendadas: no especificadas en la información disponible. El despliegue de referencia documentado es CPU-only; cualquier GPU consumer con al menos 4 GB de VRAM libre debería acomodar una cuantización Q4, pero es una estimación, no un dato del autor.
- Cabe en GPU consumer: previsiblemente sí en configuraciones cuantizadas de 4 bits; sin confirmación oficial.
- Opciones de despliegue: Ollama es la vía soportada (`ollama run Thox-ai/thox-ginger` o construcción local con `ollama create`). No se documentan vLLM, TGI, llama.cpp directo ni otros motores.
- Latencia y throughput: 13,75 tokens/s en generación larga sobre el host de referencia (CPU, 4 vCPU). No hay datos de latencia por token ni de throughput con concurrencia.

## Comparativa con modelos similares

La categoría exacta —configuraciones de persona empaquetadas sobre un base sin reentrenar— no tiene equivalentes públicos bien documentados en la información disponible. Se compara con el base y con la alternativa obvia de construir la persona uno mismo:

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Thox-Ginger | 4B | 8.192 (evaluado) | 13,75 tok/s en CPU; PASS en 4 pruebas de persona | Apache-2.0 | Público en HF y Ollama |
| Qwen/Qwen3-4B (base) | 4B | Contexto nativo de Qwen3-4B, no disponible en la información | Benchmarks estándar de Qwen3-4B, no incluidos aquí | Apache-2.0 | Público en HF |
| Perfil propio sobre Qwen3-4B | 4B | Configurable por el usuario | Depende del perfil y del Knowledge Pack propios | Apache-2.0 | Autoconstruido con Ollama |

Frente al base, la diferencia medible está en el comportamiento de rol y en el anclaje al Knowledge Pack, no en capacidad cognitiva: ambos comparten pesos idénticos. Frente a un perfil propio, Thox-Ginger aporta un roster corregido, un paquete de 8 entradas verificadas y un registro de evaluación reproducible, a cambio de adoptar las decisiones de persona de THOX.

## Limitaciones y advertencias

- Es una configuración de persona, no una réplica entrenada de la persona representada: no tiene memoria en vivo, ni herramientas, ni autoridad de ejecución.
- El texto del perfil no concede credenciales ni acciones privilegiadas; cualquier capacidad operativa requiere el runtime ThoxAgent con herramientas autenticadas y aplicación de políticas.
- El comportamiento de rechazo y seguridad es el del modelo base, moderado únicamente por el perfil de sistema.
- Un base de 4B arrastra los límites de razonamiento de su clase: el autor recomienda verificar las salidas importantes.
- Riesgo de alucinación en todo lo que quede fuera de las 8 entradas del Knowledge Pack v0.1; el anclaje solo se ha comprobado en 2 casos puntuales.
- Idioma declarado: únicamente inglés. No hay soporte multilingüe documentado.
- Contexto evaluado de 8.192 tokens; no se documenta comportamiento más allá de esa longitud.
- Sesgos: no se documentan sesgos específicos del perfil ni del base en la información disponible.
- Licencia Apache-2.0 heredada de Qwen3: se debe conservar el aviso Apache. Los elementos propios de THOX (perfil de persona, Knowledge Pack, empaquetado) quedan bajo esa misma licencia según la model card, sin restricciones comerciales adicionales declaradas.
- El repositorio no contiene pesos: quien despliegue debe descargar el base desde Ollama y fijar el hash indicado para reproducir la configuración.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso independiente ni validación externa de las pruebas del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Thox-ai/Thox-Ginger
- Modelo en Ollama: `Thox-ai/thox-ginger` (referenciado en la model card; no se proporciona URL directa)
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Tag de Ollama del base: `qwen3:4b`, sha256:359d7dd4bcdab3d86b87d73ac27966f4dbb9f5efdfcc75d34a8764a09474fae7
- Papers, blogs, repos y demos adicionales: no disponible en la información proporcionada
