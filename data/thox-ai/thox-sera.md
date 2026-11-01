# Thox-ai/Thox-Sera

## Resumen

Thox-Sera es una configuración de persona publicada por Thox-ai sobre los pesos de Qwen/Qwen3-8B. No se trata de un modelo entrenado ni afinado: el repositorio contiene únicamente un `Modelfile` de Ollama, un manifiesto de release y un Knowledge Pack en JSONL con ocho entradas verificadas. Los pesos son byte-idénticos al Qwen3-8B original, fijado en el tag `qwen3:8b` con hash sha256 concreto. La personalización consiste en un perfil de sistema que define a Sera, un "digital human" sintético cuyo rol es juez de cumplimiento (compliance, privacidad, revisión de claims y licencias).

El modelo resuelve un problema acotado: ofrecer un asistente local y offline con un rol estable y con hechos de THOX anclados en un pack de conocimiento suministrado, evitando que el modelo confirme estados del sistema que no puede observar. Está pensado para ejecutarse en hardware propio mediante Ollama o ThoxChat, y forma parte de una familia de once configuraciones de persona liberadas por la factoría de modelos de THOX.

Por su naturaleza, la relevancia es limitada para quien busque capacidades nuevas: no hay ganancia de razonamiento, contexto ni multilingüismo respecto al Qwen3-8B subyacente. Su interés reside en el patrón de empaquetado (perfil de sistema + knowledge pack + manifiesto de procedencia) y en las pruebas de identidad y de rechazo de afirmaciones falsas documentadas por el autor.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen3-8B) |
| Parametros totales | 8B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens (configuración de evaluación reportada) |
| Tipos de cuantizacion | no disponible (depende del tag de Ollama `qwen3:8b` utilizado) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | no se distribuyen pesos en el repositorio; `Modelfile` de Ollama que referencia el tag `qwen3:8b` |

## Arquitectura y entrenamiento

La arquitectura es la del Qwen3-8B original: un transformer denso de 8.000 millones de parámetros. THOX no modifica, fusiona ni afina los pesos; el repositorio solo aporta un perfil de sistema escrito a partir del kit de personas de THOX, con hechos de rol corregidos contra el roster v0.2 (31 de octubre de 2026), y un Knowledge Pack v0.1 de ocho entradas públicas verificadas en formato JSONL.

No hay entrenamiento, RLHF ni DPO asociados a esta release. La única capa añadida es el texto de sistema que define identidad, rol y estilo de trabajo, más el material de anclaje factual que se inyecta como contexto. El manifiesto (`manifest.json`) registra el pin del modelo base, la fuente del perfil y la versión del knowledge pack, lo que permite reproducir la build con `ollama create` a partir del `Modelfile`.

## Capacidades

- Generación de texto y asistencia conversacional en el rol de juez de cumplimiento (compliance, privacidad, revisión de claims y licencias).
- Anclaje factual en el Knowledge Pack suministrado: responde con los datos del pack cuando están presentes en el contexto.
- Rechazo explícito de confirmar estado en vivo del sistema que no puede observar (prueba de "trampa de topología fabricada" superada).
- Identidad de persona estable: se nombra como Sera y se declara "digital human" sintético abierto.
- Ejecución local y offline mediante el endpoint local de Ollama o ThoxChat.
- Capacidades heredadas del Qwen3-8B subyacente (generación de texto general), sin garantía de que el perfil de sistema las preserve en la misma medida.
- No incluye tool calling, ni agentes multi-paso, ni visión, ni audio, ni memoria en vivo; el runtime ThoxAgent añadiría descubrimiento MeshStack y ejecución autorizada, pero no forma parte de esta release.

## Casos de uso

- Revisión de cumplimiento en local: usar el modelo como primer filtro sobre borradores de políticas, avisos de privacidad o claims de marketing, ejecutándolo con Ollama en una máquina propia para no enviar texto sensible a terceros.
- Triaje de licencias de dependencias: consultar al modelo sobre compatibilidad de licencias en un proyecto, apoyándose en el Knowledge Pack cuando las entradas relevantes estén en contexto y verificando después contra la fuente original.
- Asistencia en redacción de documentación de privacidad: generar borradores de secciones de tratamiento de datos y retención con un rol estable, revisables por una persona antes de publicar.
- Pruebas de anclaje factual: emplear el pack de conocimiento como banco de pruebas para comprobar si el modelo respeta hechos suministrados y declina inventar estado del sistema, útil para evaluar patrones de empaquetado de personas.
- Experimentación con perfiles de sistema: servir de plantilla para construir configuraciones de persona propias sobre Qwen3-8B, reutilizando el esquema de `Modelfile`, manifiesto y JSONL.
- Despliegue en estaciones de trabajo sin GPU: al ejecutarse en CPU con un consumo de 6,68 GB a 8.192 tokens de contexto, encaja en entornos de desarrollo con recursos limitados para tareas de redacción y análisis de baja frecuencia.
- Formación interna sobre criterios de compliance: usar el modelo como interlocutor de práctica en sesiones offline, con la advertencia de que sus respuestas no tienen autoridad normativa.

## Benchmarks y rendimiento

El autor publica una evaluación propia del 31 de octubre de 2026, ejecutada en CPU x86_64, contexto de 8.192 tokens y temperatura 0,3. No son benchmarks estándar de la industria.

| Prueba | Resultado |
|---|---|
| Comprobación de identidad de persona | PASS |
| Tarea de rol (pregunta de compliance) | PASS |
| Anclaje en Knowledge Pack (spot-check) | PASS (2/2) |
| Trampa de topología fabricada | PASS (declina confirmar estado en vivo) |
| Throughput en texto largo | 8,11 tokens/s sobre 1.500 tokens generados |
| Huella de memoria a 8.192 de contexto | 6,68 GB |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: 6,68 GB con contexto de 8.192 tokens en ejecución CPU-only, según la medición del autor.
- GPU recomendadas: no disponible; el autor no documenta ejecución en GPU. Por tamaño, un modelo de 8B en cuantización de 4 bits cabe en GPUs de consumo con 8 GB o más, pero este dato no está verificado en la información proporcionada.
- Cabe en GPU de consumo: previsiblemente sí en tarjetas con 8-12 GB de VRAM en cuantización baja, aunque no hay confirmación del autor.
- Opciones de despliegue: Ollama (vía `ollama run Thox-ai/thox-sera` o build local con `ollama create`), ThoxChat y el endpoint local de Ollama. No se documentan vLLM, llama.cpp directo ni TGI.
- Latencia y throughput: 8,11 tokens/s en CPU x86_64 del host de build, a 8.192 de contexto y temperatura 0,3.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Entrenamiento específico | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Thox-Sera | 8B | 8.192 (config. evaluada) | Ninguno; solo perfil de sistema y knowledge pack | Apache-2.0 | HuggingFace (packaging) y Ollama |
| Qwen/Qwen3-8B | 8B | no disponible en esta ficha | Modelo base entrenado por Qwen | Apache-2.0 | HuggingFace y Ollama (`qwen3:8b`) |
| Otras configuraciones de persona de THOX | 8B (misma base) | 8.192 (config. evaluada) | Perfil de sistema distinto por rol | Apache-2.0 | Ollama, familia de once configuraciones |

La comparación relevante es contra el propio Qwen3-8B: Thox-Sera no aporta capacidades adicionales, solo un rol fijado y un pack de anclaje. Frente a otras configuraciones de persona de la misma familia, la diferencia es el rol asignado y el contenido del knowledge pack.

## Limitaciones y advertencias

- No es un replica entrenada de la persona: no tiene memoria en vivo, ni herramientas, ni autoridad. El texto de persona no concede credenciales ni acciones privilegiadas.
- El comportamiento de rechazo y seguridad es el del modelo base, moderado únicamente por el perfil de sistema.
- Un modelo de 8B arrastra los límites de razonamiento de su clase; hay que verificar las salidas importantes.
- Riesgo de alucinación inherente al modelo base, especialmente fuera del Knowledge Pack suministrado.
- Solo declara inglés como idioma soportado; el rendimiento en castellano no está documentado.
- Contexto de evaluación de 8.192 tokens; no se documenta una ventana mayor para esta configuración.
- La licencia Apache-2.0 obliga a conservar el aviso de la licencia; los elementos propios de THOX (perfil de sistema, knowledge pack y empaquetado) quedan bajo su titularidad.
- El repositorio no contiene pesos: quien quiera ejecutarlo depende del tag `qwen3:8b` de Ollama y de su disponibilidad futura.
- Cero descargas y cero likes en el momento de la consulta; no hay validación externa de las pruebas del autor.
- El modelo no confirma estado en vivo del sistema por diseño; no debe usarse como fuente de verdad sobre infraestructura en ejecución.

## Enlaces

- HuggingFace: https://huggingface.co/Thox-ai/Thox-Sera
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Ejecución en Ollama: `ollama run Thox-ai/thox-sera` (referencia de tag `qwen3:8b` en el repositorio)
- Paper, blog, repositorio o demo adicionales: no disponible en la información proporcionada.
