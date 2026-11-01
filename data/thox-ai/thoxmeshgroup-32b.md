# Thox-ai/ThoxMeshGroup-32B

## Resumen

ThoxMeshGroup-32B es un paquete de configuración publicado por Thox-ai sobre los pesos originales de Qwen3-32B, un modelo transformer denso de 32 mil millones de parámetros desarrollado por Alibaba Cloud. El repositorio no contiene pesos entrenados ni ajustados: incluye únicamente un `Modelfile` para Ollama, un manifiesto de release y un paquete de conocimiento en JSONL con ocho entradas verificadas. El modelo ejecutable se distribuye a través de Ollama y descarga los pesos upstream fijados por digest.

La propuesta del autor es empaquetar un perfil de sistema orientado a grupos de trabajo empresariales ("MeshGroup") sobre un modelo denso de referencia, de modo que las respuestas queden ancladas a un conjunto documental acotado y a una política de comportamiento explícita. El trabajo de Thox se limita al perfil de sistema, el prompt pack, la evaluación y la documentación; no hay entrenamiento, fine-tuning ni modificación de pesos.

Es relevante ahora porque ejemplifica una práctica creciente: publicar "modelos" que en realidad son configuraciones reproducibles sobre un base model abierto, con licencia Apache-2.0 y trazabilidad por digest. Para un desarrollador, la utilidad real está en la reproducibilidad del perfil y en el paquete de conocimiento, no en una mejora de capacidades respecto a Qwen3-32B.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen3-32B) |
| Parámetros totales | 32B |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | 8.192 tokens verificados en la evaluación del autor; el contexto nativo de Qwen3-32B no se detalla en la información disponible |
| Tipos de cuantización | no disponible (el build de Ollama referenciado ocupa 20,20 GB) |
| Idiomas soportados | inglés (declarado en la model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | no se distribuyen pesos en el repo; el build se sirve vía Ollama a partir del pin `qwen3:32b` (digest sha256:030ee887880fc378860c2dd35101da424377520441ae4bfe7be6deff8ade7840) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-32B: un transformer denso de 32B parámetros. Thox-ai no aporta detalles adicionales sobre capas, atención, tokenizador ni contexto nativo, y remite explícitamente al release upstream. No hay innovaciones arquitectónicas propias.

No existe entrenamiento. Según la model card, los pesos son byte-idénticos a la release upstream de Qwen3-32B y no se aplicó fine-tuning, RLHF ni DPO. Lo que Thox añade es un perfil de sistema (con un bloque de "grounding" que fija el principio de marca, declina la verificación de estado en vivo y trata los hechos operativos afirmados por el usuario como no verificados), un prompt pack de grupo de trabajo y el THOX Knowledge Pack v0.1, un JSONL de 4.652 bytes con ocho entradas públicas verificadas que se inyectan en contexto. La evaluación reportada se realizó el 2026-11-01 en una estación x86_64 con GPU de clase 16 GB en un host compartido.

## Capacidades

- Generación de texto en inglés, heredada de Qwen3-32B.
- Respuesta anclada a un conjunto documental acotado (Knowledge Pack v0.1) para preguntas cubiertas por sus ocho entradas.
- Perfil de comportamiento que declina verificar estados operativos en vivo (telemetría, número de nodos, precios, disponibilidad).
- Distinción explícita entre hechos afirmados por el usuario (tratados como no verificados) y documentación aprobada.
- Respuesta directa a preguntas técnicas generales, con las declinaciones reservadas a la verificación de estado en vivo.
- Soporte de tool calling, agentes multi-paso, visión, audio o modo thinking: no documentado en la información disponible (dependería de las capacidades del base Qwen3-32B, que la card no detalla).
- Capacidades multilingües: no declaradas; el modelo se etiqueta solo como `en`.

## Casos de uso

- Asistente interno de grupo de trabajo: desplegado vía Ollama dentro de un dominio de seguridad, responde consultas sobre documentación aprobada y declina cualquier pregunta sobre estado operativo en vivo, lo que reduce respuestas especulativas sobre infraestructura.
- Q&A empresarial anclado: con el Knowledge Pack v0.1 inyectado en contexto, cubre las ocho temáticas verificadas con los hechos exigidos; útil como base para un corpus documental propio que sustituya o amplíe el pack.
- Borradores de colaboración multi-sitio: el modelo redacta borradores y el control de acceso real lo impone la aplicación anfitriona mediante su capa de identidad y políticas, no el modelo.
- Evaluación de comportamiento y "trampas": el perfil incorpora respuestas de referencia ante preguntas que inducen a fabricar topología (por ejemplo, verificar que MeshStack corre en tres nodos), lo que sirve para probar guardarraíles en pipelines de evaluación.
- Base reproducible para experimentos de prompting: al fijar el base por digest y publicar el `Modelfile` y el manifiesto, permite reconstruir exactamente el mismo entorno de inferencia en otra máquina.
- Prototipado de asistentes con requisitos de trazabilidad: la combinación de licencia Apache-2.0, manifiesto de release y card estandarizada facilita auditorías internas de procedencia.
- Sustitución de un LLM propietario en flujos de trabajo internos en inglés donde se prioriza control de datos y despliegue local sobre latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card solo reporta métricas de despliegue y pruebas de humo:

| Métrica | Valor |
|---|---|
| Contexto cargado en la evaluación | 8.192 tokens |
| Huella de memoria del runner en carga | 22,61 GB (VRAM + RAM del sistema) |
| Throughput en generación larga | 5,36 tokens/s (2.193 tokens evaluados, host compartido) |
| Preguntas de humo de fábrica | 3/3 respondidas |
| Anclaje al Knowledge Pack | 8/8 temáticas respondidas con los hechos exigidos |
| Tamaño del build referenciado | 20,20 GB |

El propio autor advierte que el throughput debe tratarse como un suelo en condiciones de host compartido, no como un perfil de estación de trabajo dedicada.

## Requisitos de hardware

- VRAM/RAM: el runner reportó 22,61 GB de huella combinada (VRAM + RAM del sistema) con contexto de 8.192 tokens; el build referenciado pesa 20,20 GB.
- GPU recomendadas: no especificadas por el autor. Por tamaño, un modelo denso de 32B en cuantización de ~20 GB encaja en GPUs de 24 GB (RTX 3090/4090) con contexto moderado, y con holgura en A100 40/80 GB o H100.
- GPU de consumo: la evaluación se hizo en una GPU de clase 16 GB con desbordamiento a RAM del sistema, lo que explica el throughput de 5,36 tokens/s; cabe en consumer GPU de 24 GB, pero no en 16 GB sin penalización severa.
- Despliegue: Ollama es la vía soportada (`ollama run Thox-ai/thoxmeshgroup-32b`), con reconstrucción local mediante `ollama create` a partir del `Modelfile`. Otros runners (vLLM, llama.cpp, TGI) no están documentados para este paquete, aunque los pesos upstream de Qwen3-32B podrían servirse con ellos.
- Latencia y throughput: 5,36 tokens/s medidos en host compartido; no hay datos de latencia por petición ni de throughput agregado con batching.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Distribución | Notas |
|---|---|---|---|---|---|
| ThoxMeshGroup-32B | 32B denso | 8.192 verificados | Apache-2.0 | Ollama (config) + pesos upstream | Sin entrenamiento propio; perfil y knowledge pack |
| Qwen3-32B (upstream) | 32B denso | no disponible en esta ficha | Apache-2.0 | HuggingFace, Ollama | Base byte-idéntica; sin perfil ni pack |
| Alternativas de 32B denso de otros fabricantes | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

La comparación relevante es contra el propio base: ThoxMeshGroup-32B no mejora las capacidades de Qwen3-32B, sino que fija un comportamiento y un corpus en contexto. Frente a otras alternativas de la misma categoría, no hay datos de benchmarks que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Configuración, no entrenamiento: los pesos son la release upstream sin modificar; cualquier diferencia de comportamiento proviene del perfil de sistema y del contexto inyectado.
- El aislamiento por grupo es una convención de prompting y producto, no una frontera de seguridad; el control de acceso real debe implementarlo la aplicación anfitriona.
- Sin estado en vivo: el modelo no tiene telemetría y no puede verificar estado de clúster, número de nodos, precios ni disponibilidad.
- Riesgo de alucinación fuera del Knowledge Pack: con solo ocho entradas verificadas, cualquier consulta fuera de ese corpus depende del conocimiento del base y de la política de declinación.
- Idiomas: declarado únicamente en inglés; no hay evidencia de calidad en castellano ni en otros idiomas.
- Contexto: la evaluación se hizo a 8.192 tokens; no se documenta el contexto nativo ni el comportamiento con ventanas mayores.
- Licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantías; la responsabilidad de cumplimiento y de exactitud recae en el integrador.
- Cifras de rendimiento medidas en host compartido con GPU de 16 GB: no representativas de un despliegue dedicado.
- Sin cualificación de dispositivos: nada en la card afirma rendimiento en dispositivos THOX, que usan builds más pequeños.
- Advertencia de procedencia: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no hay evidencia externa de validación independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Thox-ai/ThoxMeshGroup-32B
- Modelo base: https://huggingface.co/Qwen/Qwen3-32B
- Ejecución vía Ollama: `ollama run Thox-ai/thoxmeshgroup-32b`
- Paper, blog, repositorio o demo adicionales: no disponibles en la información proporcionada.
