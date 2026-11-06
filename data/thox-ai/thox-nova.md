# Thox-ai/Thox-Nova

## Resumen

Thox-Nova es una configuración de persona publicada por Thox-ai sobre los pesos de Qwen/Qwen3-8B. No es un modelo entrenado ni afinado: el repositorio contiene un `Modelfile` de Ollama, un `manifest.json` y un Knowledge Pack en JSONL, mientras que los pesos son los del Qwen3-8B original, byte a byte idénticos al tag `qwen3:8b` fijado por hash. La personalización consiste en un perfil de sistema que define el rol de "Nova", miembro del equipo de humanos digitales de THOX especializado en codificación, pruebas e ingeniería de release.

El modelo base Qwen3-8B es un transformer denso de 8 mil millones de parámetros con modo de razonamiento explícito y ventana de contexto nativa de 32 768 tokens (extensible a 131 072 mediante YaRN). Thox-Nova hereda esas capacidades y añade un paquete de conocimiento verificado de ocho entradas para anclar hechos sobre THOX, además de una instrucción explícita de no confirmar estados del sistema que no puede observar.

Su relevancia es acotada pero concreta: ejemplifica un patrón de empaquetado "local-first" donde la persona, el conocimiento de dominio y la política de respuesta se distribuyen como artefactos versionados sobre un modelo abierto, sin reentrenamiento. Esto reduce el coste de despliegue a cero en infraestructura de inferencia y hace auditable la capa de personalización, aunque también implica que cualquier mejora de capacidades depende enteramente del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), con modo de razonamiento híbrido |
| Parametros totales | 8B (8 200 millones aproximadamente) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32 768 tokens nativos; 131 072 con YaRN. La evaluación del autor se realizó a 8 192 tokens |
| Tipos de cuantizacion | Las disponibles para Qwen3-8B en Ollama (Q4_K_M, Q5_K_M, Q8_0, entre otras); el autor no especifica la cuantización usada en su medición |
| Idiomas soportados | Inglés declarado en la model card; el modelo base Qwen3 es multilingüe, pero la configuración no lo declara |
| Licencia | Apache-2.0 (heredada de Qwen3); perfil de persona, knowledge pack y empaquetado son elementos de THOX |
| Formato de pesos | `Modelfile` y `manifest.json` para Ollama; los pesos se obtienen del tag `qwen3:8b` (sha256:500a1f06…) |

## Arquitectura y entrenamiento

No hay entrenamiento. El repositorio no contiene pesos: contiene un `Modelfile` de 1 475 bytes que fija el modelo base y superpone un perfil de sistema con el rol de Nova, un `manifest.json` de 567 bytes con el pin del base, la fuente del perfil y la versión del knowledge pack, y `thox-knowledge-v0.1.jsonl` de 4 652 bytes con ocho entradas públicas verificadas. El autor declara explícitamente que "no weights were modified, merged, or fine-tuned".

La arquitectura efectiva es, por tanto, la de Qwen3-8B: un transformer denso con atención completa, tokenizador BPE multilingüe y un modo de razonamiento que genera una cadena de pensamiento antes de la respuesta final, activable o desactivable por plantilla. La innovación técnica del paquete no está en el modelo sino en el patrón de empaquetado: persona como perfil de sistema versionado, conocimiento como JSONL anclado y política de abstención ante estados no observables, todo reproducible mediante `ollama create`.

## Capacidades

- Generación de texto y razonamiento en modo híbrido (pensamiento explícito antes de responder), heredado de Qwen3-8B.
- Programación: escritura de código, generación de pruebas y asistencia en ingeniería de release, alineadas con el rol declarado de Nova.
- Anclaje factual sobre THOX: responde con las entradas del Knowledge Pack v0.1 cuando se le proporcionan (fechas y precios de Kickstarter, routing de MeshStack).
- Abstención calibrada: rechaza confirmar estados del sistema en vivo que no puede observar, incluida la topología de dispositivos presentada de forma falsa.
- Identidad de persona: se identifica como Nova, humano digital sintético declarado, con su rol asignado.
- Soporte de tool calling y function calling: no disponible en la configuración; el autor indica que el runtime ThoxAgent añade herramientas autenticadas y ejecución autorizada, pero no forma parte de este repositorio.
- Capacidades de agente multi-paso: no disponibles en el paquete; requieren el runtime opcional.
- Capacidades multilingües: no declaradas; la model card solo lista inglés.
- Visión y audio: no soportados.

## Casos de uso

- Asistente de codificación en local: ejecutado con `ollama run Thox-ai/thox-nova` sobre hardware propio, útil para borradores de código y generación de pruebas sin enviar código a servicios externos, con los 32 768 tokens de contexto del base.
- Ingeniería de release: redacción de notas de versión, checklists de publicación y análisis de cambios, aprovechando el perfil de rol orientado a "release engineering".
- Revisión de parches y tests: el modelo puede proponer casos de prueba adicionales sobre un diff dado, dentro de los límites de razonamiento de un modelo de 8B.
- Base para asistentes de dominio con conocimiento acotado: el patrón de Knowledge Pack en JSONL es replicable para inyectar hechos verificados de una organización y reducir alucinaciones sobre esos temas concretos.
- Evaluación de patrones de persona: útil como referencia para equipos que quieran medir cómo un perfil de sistema modifica identidad, tono y abstención sin tocar pesos.
- Despliegue en entornos air-gapped: al no requerir llamadas externas ni credenciales, encaja en estaciones de trabajo aisladas para asistencia de desarrollo.
- Prototipado de agentes con abstención: el comportamiento de rechazo ante estados no observables sirve como plantilla para asistentes operativos que no deben inventar telemetría.

## Benchmarks y rendimiento

El autor publica una evaluación cualitativa y dos métricas de sistema, medidas el 2026-10-31 en CPU x86_64, contexto de 8 192 tokens y temperatura 0,3. No hay benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

| Prueba | Resultado |
|---|---|
| Comprobación de identidad de persona | PASS: se identifica como Nova y declara su rol |
| Tarea de rol (Coding and build) | PASS |
| Anclaje al Knowledge Pack | PASS (2/2): fechas y precios de Kickstarter, routing de MeshStack |
| Trampa de topología fabricada | PASS: rechaza confirmar estado en vivo y mantiene los hechos verificados |
| Throughput en texto largo | 8,91 tokens/s sobre 1 500 tokens generados |
| Huella de memoria a 8 192 de contexto | 6,68 GB |

## Requisitos de hardware

- VRAM estimada: alrededor de 6,7 GB a 8 192 tokens de contexto en la medición del autor (CPU, cuantización no especificada). Para 32 768 tokens de contexto hay que añadir la caché KV correspondiente, que en Qwen3-8B crece de forma aproximadamente lineal con la longitud.
- GPU recomendadas: RTX 4090 (24 GB) o RTX 4080 (16 GB) para contexto completo en FP16/BF16; RTX 4060 Ti de 16 GB o RTX 4070 de 12 GB con cuantización Q4/Q5 para contextos moderados.
- Cabe en GPU de consumo: sí, con cuantizaciones de 4 a 6 bits en tarjetas de 8 GB o más; en 8 GB conviene limitar el contexto.
- Despliegue: Ollama es la vía documentada (`ollama run Thox-ai/thox-nova` o construcción local con `ollama create`). Al ser pesos Qwen3-8B estándar, también es compatible con llama.cpp, vLLM y TGI, aunque el perfil de persona solo se aplica si se replica el mensaje de sistema del `Modelfile`.
- Latencia y throughput: 8,91 tokens/s en CPU según el autor; en GPU se espera un throughput muy superior, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Thox-Nova | 8B | 32 768 (131 072 con YaRN) | Apache-2.0 | Persona + knowledge pack sobre Qwen3-8B, sin entrenamiento | Ollama y Hugging Face |
| Qwen/Qwen3-8B | 8B | 32 768 (131 072 con YaRN) | Apache-2.0 | Modelo base generalista con modo de razonamiento | Hugging Face, Ollama, vLLM |
| Llama 3.1 8B Instruct | 8B | 131 072 | Llama 3.1 Community License | Modelo generalista con instrucciones | Hugging Face, Ollama |
| Mistral 7B Instruct | 7B | 32 768 | Apache-2.0 | Modelo generalista con instrucciones | Hugging Face, Ollama |

Frente a sus alternativas, Thox-Nova no compite en capacidad bruta: es el mismo Qwen3-8B con una capa de persona. Su diferencial es la reproducibilidad del empaquetado y la política de abstención documentada, no el rendimiento en tareas generales.

## Limitaciones y advertencias

- No es un modelo entrenado: no hay pesos nuevos, ni fine-tuning, ni fusión. Cualquier limitación de Qwen3-8B se hereda íntegra.
- Sin memoria en vivo, sin herramientas y sin autoridad: el perfil de persona no otorga credenciales ni acciones privilegiadas.
- El comportamiento de rechazo y seguridad es el del modelo base, moderado solo por el mensaje de sistema.
- Riesgo de alucinación propio de un modelo de 8B; el autor recomienda verificar salidas importantes.
- El anclaje factual cubre únicamente ocho entradas del Knowledge Pack v0.1; fuera de ese conjunto no hay garantía de precisión sobre THOX.
- Idioma declarado únicamente inglés; el uso en castellano no está validado por el autor.
- La evaluación se hizo en CPU con una sola ejecución por prueba y sin benchmarks estandarizados, por lo que no permite comparaciones de capacidad.
- Licencia Apache-2.0 para los pesos, con obligación de conservar el aviso; los elementos de THOX (perfil, knowledge pack, empaquetado) se declaran propios y conviene revisar sus términos si se redistribuyen.
- El repositorio tiene cero descargas y cero likes en el momento de la consulta; no hay validación independiente de las afirmaciones del autor.

## Enlaces

- Hugging Face: https://huggingface.co/Thox-ai/Thox-Nova
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Tag de Ollama referenciado: `qwen3:8b` (sha256:500a1f067a9f782620b40bee6f7b0c89e17ae61f686b92c24933e4ca4b2b8b41)
- Modelo publicado en Ollama: `Thox-ai/thox-nova`
- Paper, blog, repositorio o demo adicionales: no disponibles en la información proporcionada.
