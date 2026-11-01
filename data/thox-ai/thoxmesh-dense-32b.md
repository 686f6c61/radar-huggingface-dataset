# Thox-ai/ThoxMesh-Dense-32B

## Resumen

ThoxMesh-Dense-32B es un paquete de configuración publicado por Thox-ai sobre los pesos sin modificar de Qwen/Qwen3-32B, el modelo denso más grande de la familia Qwen3. No se trata de un modelo entrenado ni afinado: los pesos son byte a byte idénticos al release upstream de Alibaba Cloud, y el trabajo de THOX se limita al perfil de sistema, un Knowledge Pack versionado (v0.1, ocho entradas públicas verificadas), el empaquetado en formato Ollama y la documentación. El repositorio de HuggingFace contiene únicamente el `Modelfile`, un `manifest.json` y el fichero JSONL del Knowledge Pack; el modelo ejecutable se distribuye vía Ollama.

La propuesta de valor es acotada y explícita: servir como el tier denso local de mayor capacidad dentro de la línea THOX Mesh para responder preguntas sobre el sistema de expansión MeshStack, con respuestas ancladas al Knowledge Pack y con un perfil que rechaza verificar estado operativo en vivo que el modelo no puede observar. La arquitectura subyacente es la de Qwen3-32B, un transformer denso que activa los 32 000 millones de parámetros en cada token, lo que lo hace más lento por token que la variante dispersa 30B-A3B del mismo fabricante pese a tener una huella similar.

Es relevante ahora por dos motivos: primero, porque ilustra un patrón creciente de "modelos" que son en realidad configuraciones y empaquetados sobre pesos ajenos, algo que conviene saber identificar al evaluar un repositorio; segundo, porque su evaluación publicada es inusualmente honesta y concreta (digest fijado, throughput medido, respuestas trampa documentadas), lo que permite calibrar expectativas sin caer en el marketing. La licencia Apache-2.0 del base se mantiene en el paquete.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen3-32B); sin modificación por parte de THOX |
| Parámetros totales | 32B |
| Parámetros activos | No aplica (modelo denso, activa los 32B por token) |
| Longitud de contexto | 8 192 tokens verificados en la evaluación publicada; el contexto nativo de Qwen3-32B no se detalla en la información disponible |
| Tipos de cuantización | No disponible en la información proporcionada; el build de Ollama referenciado ocupa 20,20 GB (digest `sha256:030ee887...`) |
| Idiomas soportados | Inglés (`en`) declarado en la model card |
| Licencia | Apache-2.0 |
| Formato de pesos | Empaquetado Ollama (`Modelfile`, `manifest.json`, `thox-knowledge-v0.1.jsonl`); los pesos se descargan del pin upstream vía Ollama. No se distribuyen safetensors ni GGUF en el repositorio |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen3-32B, un transformer denso de 32 000 millones de parámetros. THOX no ha entrenado, afinado ni modificado los pesos: la model card afirma explícitamente que son byte a byte idénticos al release upstream, identificado por el digest `sha256:030ee887880fc378860c2dd35101da424377520441ae4bfe7be6deff8ade7840` y un tamaño de 20,20 GB. Por tanto, no hay datos de entrenamiento propios, ni RLHF, ni DPO, ni ninguna innovación técnica atribuible a este paquete.

Lo que sí aporta THOX es una capa de configuración en tres piezas: un perfil de sistema que fija el principio de marca, declina la verificación de estado en vivo y trata los hechos operativos afirmados por el usuario como no verificados; una aclaración de respuesta directa para que las preguntas técnicas generales se contesten sin rechazo; y el THOX Knowledge Pack v0.1, un JSONL de 4 652 bytes con ocho entradas públicas verificadas que se inyectan en contexto. El perfil publicado es la versión enmendada tras los primeros smokes, en los que la versión sin enmendar improvisaba la respuesta de marca y rechazaba en exceso una pregunta técnica general. Esta distinción es importante: el comportamiento diferencial del modelo proviene del prompt de sistema y del contexto, no de los pesos.

## Capacidades

- Generación de texto en inglés con la calidad del base Qwen3-32B, sin alteraciones en los pesos.
- Respuesta a preguntas sobre el sistema de expansión MeshStack anclada al Knowledge Pack v0.1: las ocho entradas del pack se respondieron con los hechos requeridos en la evaluación publicada.
- Explicaciones de diseño de routing a nivel de petición completa (whole-request routing), localidad y comportamiento ante fallos.
- Declive configurado de la verificación de estado operativo en vivo: no afirma si MeshStack corre en un número concreto de nodos, ni precios, ni disponibilidad.
- Tratamiento de hechos operativos afirmados por el usuario como no verificados.
- Respuesta directa a preguntas técnicas generales fuera del ámbito del Knowledge Pack, gracias a la aclaración añadida al perfil.
- No soporta, según la información disponible, tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito documentado en este paquete.

## Casos de uso

- Asistente interno de documentación de MeshStack: desplegado vía `ollama run Thox-ai/thoxmesh-dense-32b`, responde consultas del equipo sobre planificación de expansión y routing apoyándose en las ocho entradas verificadas del Knowledge Pack, con la ventaja de que declina inventar estado operativo.
- Formación de soporte técnico: el perfil trata los hechos afirmados por el usuario como no verificados, lo que lo hace adecuado para entrenar a personal en la distinción entre lo documentado y lo observado en vivo.
- Base para prototipos de asistentes con política de rechazo explícita: sirve como plantilla de `Modelfile` para construir perfiles de sistema con bloques de anclaje y declive, reutilizando el patrón de THOX.
- Evaluación comparativa de despliegue local: con 22,61 GB de huella del runner en una GPU de clase 16 GB más RAM de sistema, es un caso práctico para medir el comportamiento de un denso de 32B bajo scheduling compartido.
- Q&A técnica general en inglés sobre el stack: al responder directamente preguntas técnicas fuera del pack, cubre consultas de arquitectura de sistemas sin necesidad de configuración adicional.
- Referencia para auditoría de procedencia de modelos: el manifiesto con digest fijado y la declaración de "no entrenamiento" lo convierten en un ejemplo útil para enseñar a verificar qué hay realmente detrás de un repo de HuggingFace.
- Despliegue en estaciones de trabajo x86_64 con GPU de 16 GB para generación de texto larga no interactiva: a 5,39 tokens/s medidos, encaja en tareas por lotes donde la latencia no es crítica.

## Benchmarks y rendimiento

Los datos publicados son mediciones de despliegue, no benchmarks académicos. Se tomaron el 2026-11-01 en una estación de trabajo x86_64 con GPU de clase 16 GB y ejecución en host compartido; el autor advierte que el throughput debe leerse como suelo en condiciones de host compartido.

| Métrica | Resultado |
|---|---|
| Base fijado | `qwen3:32b`, digest `sha256:030ee887...`, 20,20 GB |
| Carga | Correcta a 8 192 tokens de contexto |
| Huella de memoria del runner | 22,61 GB (VRAM + RAM de sistema según el scheduling del runner) |
| Throughput (generación larga, 2 243 tokens evaluados) | 5,39 tokens/s |
| Preguntas de humo de fábrica | 3/3 respondidas (principio de marca; trampa de topología fabricada; routing vs. paralelismo tensorial) |
| Anclaje al Knowledge Pack | 8/8 temas respondidos con los hechos requeridos de los pasajes verificados |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma desagregada; la huella total del runner medida es de 22,61 GB combinando VRAM y RAM de sistema, con el runner asignando según su propio scheduling.
- GPU recomendadas: no especificadas por el autor. La evaluación se realizó en una GPU de clase 16 GB en un host compartido; para un denso de 32B conviene planificar GPUs de 24 GB o superiores (RTX 4090, A100 40 GB, H100) si se quiere mantener el modelo íntegro en VRAM.
- ¿Cabe en GPU de consumo? Parcialmente: con 16 GB de VRAM el runner tuvo que apoyarse en RAM de sistema, lo que explica el throughput de 5,39 tokens/s. En una RTX 4090 de 24 GB cabría con mayor holgura, aunque el dato no está medido en la información disponible.
- Opciones de despliegue: Ollama es la vía soportada y documentada (`ollama run Thox-ai/thoxmesh-dense-32b`, o construcción local con `ollama create` a partir del `Modelfile`). Otros runners (vLLM, llama.cpp, TGI) no se mencionan en la información disponible.
- Latencia y throughput: 5,39 tokens/s en generación larga bajo host compartido; el autor lo califica explícitamente de suelo, no de perfil de estación de trabajo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ThoxMesh-Dense-32B | 32B densos | 8 192 verificados | 5,39 tok/s en host compartido con GPU de 16 GB; 8/8 en anclaje al pack | Apache-2.0 | HuggingFace (empaquetado) + Ollama (ejecutable) |
| Qwen/Qwen3-32B (upstream) | 32B densos | No disponible en esta información | Idéntico en pesos a ThoxMesh-Dense-32B; sin perfil ni Knowledge Pack | Apache-2.0 | HuggingFace |
| Variante dispersa 30B-A3B de Qwen3 (citada por el autor) | 30B totales, MoE | No disponible en esta información | Más rápida por token que el denso 32B con huella similar, según el autor | No disponible en esta información | No disponible en esta información |

La comparación relevante es directa: frente al Qwen3-32B upstream, ThoxMesh-Dense-32B no aporta ninguna mejora de capacidad, solo un perfil de sistema y un pack de conocimiento de ocho entradas. Frente a la variante MoE 30B-A3B, el propio autor reconoce que el denso es más lento por token.

## Limitaciones y advertencias

- Configuración, no entrenamiento: los pesos son el release upstream sin modificar; fuera del Knowledge Pack, el modelo solo conoce THOX por su entrenamiento base, lo que puede producir respuestas plausibles pero incorrectas sobre la marca.
- Sin estado en vivo: no tiene telemetría y no puede verificar estado del clúster, número de nodos, precios ni disponibilidad; está configurado para declinar esa verificación.
- Solo routing: MeshStack enruta peticiones completas entre nodos; el modelo no hace paralelismo tensorial, paralelismo de pipeline ni inferencia dividida, y la model card prohíbe describirlo como si lo hiciera.
- Sin cualificación en hardware THOX: los dispositivos ThoxKey, ThoxAir, ThoxMini, ThoxClip y ThoxUltra ejecutan builds más pequeños por dispositivo; nada en este paquete respalda afirmaciones de rendimiento on-device.
- Idiomas: solo inglés declarado; no hay soporte multilingüe documentado en este paquete.
- Contexto: los 8 192 tokens son el valor verificado en la prueba de carga, no necesariamente el máximo del base.
- Riesgo de alucinación: inherente al base Qwen3-32B y no mitigado por los pesos; el perfil de sistema y el pack reducen el riesgo solo en el dominio cubierto por las ocho entradas.
- Adopción nula: cero descargas y cero likes en el momento de la consulta, sin comunidad que haya validado el comportamiento fuera de la evaluación del propio autor.
- Licencia: Apache-2.0 tanto para el base como para la configuración y el empaquetado, sin restricciones comerciales adicionales conocidas.
- Fechas: el release se data el 2026-10-31 y el repositorio se creó el 2026-11-01, lo que sitúa el paquete como muy reciente y sin historial de mantenimiento.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Thox-ai/ThoxMesh-Dense-32B
- Modelo base en HuggingFace: https://huggingface.co/Qwen/Qwen3-32B
- Ejecución en Ollama: `ollama run Thox-ai/thoxmesh-dense-32b`
- Descarga del empaquetado: `hf download Thox-ai/ThoxMesh-Dense-32B --local-dir ./ThoxMesh-Dense-32B`
- No se han encontrado en la información proporcionada papers, blogs, repositorios adicionales ni demos distintos de los anteriores.
