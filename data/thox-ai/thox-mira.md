# Thox-ai/Thox-Mira

## Resumen

Thox-Mira es una configuración de persona publicada por Thox-ai dentro de su programa THOX DigitalHumans. No se trata de un modelo entrenado, sino de un paquete que combina los pesos originales de Qwen/Qwen3-4B (sin modificaciones, byte a byte idénticos al checkpoint base fijado por hash) con un perfil de sistema escrito por THOX que define el rol de Mira, una "Knowledge SME" (especialista en gestión de conocimiento, recuperación de información y runbooks) del equipo de humanos digitales de la compañía. El paquete incluye un Modelfile para Ollama, un manifest de release y un Knowledge Pack v0.1 con ocho entradas públicas verificadas en formato JSONL.

La relevancia del artefacto es más conceptual que técnica: ejemplifica el patrón de "persona configuration-derived", en el que el comportamiento de rol se obtiene mediante prompting de sistema estructurado y una base de conocimiento adjunta, sin tocar los pesos. Está pensado para ejecución local y offline (local-first) sobre hardware de consumo, con un endpoint de Ollama o la interfaz ThoxChat, y forma parte de una familia de once configuraciones de persona liberadas por la THOX Model Factory.

El modelo hereda del Qwen3-4B base su arquitectura, contexto y capacidades de generación de texto; THOX solo aporta la capa de perfil y el material de grounding. La licencia es Apache-2.0, heredada del modelo upstream.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-4B; no se detalla en la información disponible) |
| Parámetros totales | 4B |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens (contexto de evaluación reportado; el máximo nativo de Qwen3-4B no se especifica en la información disponible) |
| Tipos de cuantización | No disponible (el paquete se distribuye vía Ollama con la etiqueta `qwen3:4b`; cuantización concreta no indicada) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | Pesos upstream de Qwen3-4B servidos por Ollama; el repositorio contiene `Modelfile`, `manifest.json` y `thox-knowledge-v0.1.jsonl` (no incluye safetensors ni GGUF propios) |

## Arquitectura y entrenamiento

No hay entrenamiento. Los pesos son los de Qwen/Qwen3-4B, obtenidos mediante la etiqueta de Ollama `qwen3:4b` fijada en el hash `sha256:359d7dd4bcdab3d86b87d73ac27966f4dbb9f5efdfcc75d34a8764a09474fae7`. THOX no modificó, fusionó ni fine-tuneó los pesos. La personalización consiste en un perfil de sistema en el `Modelfile` (1.867 bytes) redactado a partir del kit "THOX DigitalHumans Persona Model Kit", con hechos de rol corregidos contra el roster interno v0.2 (2026-10-31), más el Knowledge Pack v0.1 (4.652 bytes, 8 entradas JSONL verificadas) para grounding factual.

La innovación técnica es de empaquetado, no de modelado: separación limpia entre pesos upstream (reproducibilidad por hash), perfil de persona (texto de sistema) y base de conocimiento (JSONL consultable). El perfil incluye instrucciones de disciplina de respuesta y una apertura explícita de identidad que se reforzaron tras una primera pasada de evaluación. La ejecución se realiza en CPU con Ollama, sin requisitos de GPU.

## Capacidades

- Generación de texto conversacional con rol fijo de "Knowledge SME" (gestión de conocimiento, recuperación, runbooks).
- Grounding sobre el Knowledge Pack suministrado: responde hechos de THOX (fechas y precios de Kickstarter, routing de MeshStack) cuando las entradas se proporcionan en el contexto.
- Declinación explícita a confirmar estado de sistemas en vivo que no puede observar (verificado con una trampa de topología fabricada).
- Identidad sintética declarada: se presenta como Mira y como humano digital abiertamente sintético.
- Capacidades heredadas de Qwen3-4B (razonamiento, código, matemáticas, multilingüismo) presentes pero no evaluadas ni perfiladas en este paquete.
- Soporte de tool calling: no disponible en esta configuración; el modelo no lleva herramientas ni credenciales.
- Soporte de agentes multi-paso: no; el runtime ThoxAgent (opcional, externo) es quien aporta descubrimiento MeshStack y ejecución autorizada.
- Capacidades multilingües: limitadas al inglés según la model card.

## Casos de uso

- Asistente local de documentación técnica: desplegado con `ollama run Thox-ai/thox-mira`, redacta y resume runbooks y procedimientos internos en inglés sobre hardware de consumo, sin enviar datos a la nube.
- Prototipado de personas conversacionales: sirve como plantilla reproducible (Modelfile + manifest + Knowledge Pack) para equipos que quieran definir roles sintéticos sin entrenar pesos.
- Recuperación aumentada con grounding controlado: el Knowledge Pack JSONL permite inyectar hechos verificados y comprobar que el modelo cita solo lo suministrado y declina inventar estado en vivo.
- Formación y demos de gobernanza de IA: el caso de la "trampa de topología fabricada" documenta un comportamiento de abstención útil para enseñar límites de confianza en asistentes.
- Evaluación de pipelines de empaquetado: referencia para validar flujos de release que fijan el base por hash y separan perfil, conocimiento y pesos.
- Chat de soporte interno de bajo riesgo: borradores y análisis en el carril de conocimiento, con revisión humana obligatoria por las limitaciones de un base de 4B.
- Experimentación offline en entornos air-gapped: al ejecutarse en CPU con Ollama, encaja en máquinas sin GPU ni conectividad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card reporta únicamente evaluaciones cualitativas y de rendimiento del build:

| Prueba | Resultado |
|---|---|
| Verificación de identidad de persona | PASS |
| Tarea de rol (Knowledge SME) | PASS |
| Grounding sobre Knowledge Pack (spot-check) | PASS (2/2) |
| Trampa de topología fabricada | PASS (declina confirmar estado en vivo) |
| Throughput en texto largo | 13,87 tokens/s sobre 1.500 tokens generados |
| Huella de memoria a 8.192 de contexto | 3,89 GB |

Metodología: medida el 2026-10-31 en el host de build (CPU cloud x86_64, 4 vCPU, clase 8 GB, ejecución solo CPU), contexto de 8.192 tokens, temperatura 0,3. Las comprobaciones se ensamblaron de ejecuciones del mismo build en dos modos (sin thinking y con thinking en re-ejecuciones de un solo ítem con un reintento ante finales vacíos); el throughput corresponde al modo por defecto.

## Requisitos de hardware

- VRAM estimada: no aplica en la evaluación (ejecución CPU-only); huella de memoria de 3,89 GB a 8.192 tokens de contexto.
- GPU recomendadas: no especificadas; el paquete está orientado a ejecución local en CPU.
- GPU de consumo: cabe en cualquier GPU con al menos ~4-5 GB de VRAM libre si se sirve con Ollama en modo GPU, aunque no se documenta oficialmente.
- Opciones de despliegue: Ollama (vía `ollama run Thox-ai/thox-mira` o build local con `ollama create`), endpoint local de Ollama o ThoxChat; vLLM, llama.cpp o TGI no se mencionan en la información disponible.
- Latencia y throughput: 13,87 tokens/s en el host de referencia (4 vCPU, CPU-only, contexto 8.192).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Entrenamiento | Licencia | Enfoque |
|---|---|---|---|---|---|
| Thox-Mira | 4B | 8.192 (evaluado) | Ninguno (perfil + Knowledge Pack sobre Qwen3-4B) | Apache-2.0 | Persona configuration-derived para conocimiento/runbooks |
| Qwen/Qwen3-4B | 4B | No disponible en esta ficha | Preentrenamiento + post-entrenamiento upstream | Apache-2.0 | Modelo base generalista |
| Otras personas THOX (10 restantes) | 4B (misma base) | 8.192 (evaluado) | Ninguno | Apache-2.0 | Distintos roles del roster v0.2 |

No se dispone de datos de benchmarks que permitan comparar rendimiento con alternativas de la misma categoría; la comparación relevante es de empaquetado y gobernanza, no de calidad de modelado.

## Limitaciones y advertencias

- Es una configuración de persona, no una réplica entrenada de la colega: no tiene memoria viva, ni herramientas, ni autoridad.
- El texto de persona no concede credenciales ni acciones privilegiadas; la ejecución autorizada requiere el runtime ThoxAgent con herramientas autenticadas y aplicación de políticas.
- El comportamiento de rechazo y seguridad es el del modelo base, moderado solo por el perfil de sistema.
- Un base de 4B arrastra los límites de razonamiento de su clase; hay que verificar las salidas importantes.
- Solo inglés declarado; no hay soporte multilingüe perfilado.
- Riesgo de alucinación inherente al base; el diseño mitiga el estado en vivo no observable, pero no garantiza corrección factual fuera del Knowledge Pack.
- Sesgos: no documentados en la información disponible; se heredan los del base Qwen3-4B.
- Uso comercial: permitido bajo Apache-2.0, conservando el aviso de Apache; los elementos propios de THOX (perfil, knowledge pack, empaquetado) también se declaran bajo esa licencia.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin validación comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/Thox-ai/Thox-Mira
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Modelo ejecutable en Ollama: `Thox-ai/thox-mira` (referencia en la model card; no se proporciona URL directa)
- Paper, blog, repositorio o demo adicionales: no disponibles en la información proporcionada.
