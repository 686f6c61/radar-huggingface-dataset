# ZTE-AIM/NTele-Hybrid-27B-v1

## Resumen

NTele-Hybrid-27B-v1 es un modelo de lenguaje de 27 000 millones de parámetros publicado por ZTE-AIM en HuggingFace, obtenido por ajuste fino supervisado del modelo base Qwen/Qwen3.8-27B. Su particularidad es que unifica dos comportamientos en un único conjunto de pesos: generación de texto libre (servida mediante el endpoint estándar `/v1/chat/completions`) y toma de decisiones estructuradas (servida mediante un endpoint específico `/v1/decisions` que devuelve respuestas tipadas: elección entre opciones, puntuación en niveles y sí/no).

El modelo resuelve el problema de tener que desplegar dos sistemas separados —un LLM generativo y un clasificador o motor de decisión— para tareas de automatización como el triaje de tickets, el enrutado a equipos o la priorización de incidencias. Según la model card, con una sola instancia se accede a ambas capacidades, lo que simplifica la infraestructura y el mantenimiento en producción. La versión publicada es la v1, con licencia MIT, creada el 23 de octubre de 2026 y actualizada al día siguiente.

La relevancia actual del modelo reside en su enfoque de "decisión como API": en lugar de pedir al modelo que devuelva JSON dentro de una respuesta de chat, expone un contrato de entrada/salida específico con una temperatura calibrada (`1.26964`) y un `prompt_format_version` versionado, lo que facilita la integración en pipelines deterministas. No obstante, la información pública disponible es todavía muy limitada: cero descargas y cero likes en el momento de la consulta, sin documentación sobre longitud de contexto, idiomas o cuantizaciones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (ajuste fino de Qwen/Qwen3.8-27B; el modelo base no se detalla en la información proporcionada) |
| Parámetros totales | 27B (según denominación y descripción del modelo) |
| Parámetros activos | No aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (no se publican pesos cuantizados ni GGUF) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | No disponible (el despliegue recomendado es SGLang ≥ 0.5.20 sobre el directorio del modelo) |

## Arquitectura y entrenamiento

La información disponible indica únicamente que se trata de un ajuste fino (fine-tune) del modelo Qwen/Qwen3.8-27B, orientado a combinar generación de texto y decisión estructurada en un solo artefacto. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de alineación como RLHF, DPO o aprendizaje por refuerzo verificable. Tampoco se detalla si la arquitectura interna es un transformer denso convencional o si incorpora innovaciones como atención lineal o decodificación especulativa.

La innovación técnica documentada es de interfaz más que de arquitectura: el endpoint `/v1/decisions` acepta un conjunto de preguntas tipadas (`choice` con opciones y descripciones, `score` con niveles ordenados, `yes_no`) y devuelve respuestas estructuradas, con soporte para `return_prompt_token_ids` (útil para auditoría y trazabilidad) y un `prompt_format_version` que permite versionar el formato de prompt. La model card recomienda una temperatura calibrada específica para tareas de decisión, distinta de la configuración de generación. Existe además una nota editorial interna en la propia model card que advierte de una posible discrepancia entre el baseline de decisión (Qwen3.8-27B) y el baseline de generación (Qwen3.5-27B) empleado en las tablas de evaluación, lo que conviene verificar antes de tomar los números como comparación estrictamente homogénea.

## Capacidades

- Generación de texto conversacional y explicativa mediante `/v1/chat/completions`.
- Razonamiento y conocimiento general, evaluado por el autor en GPQA Diamond y MATH500.
- Resolución de problemas matemáticos (MATH500, AIME2025).
- Generación de código (LiveCodeBench-V6).
- Seguimiento de instrucciones (IFEval).
- Decisión estructurada con salida tipada: elección entre opciones con nombre y descripción, puntuación en niveles ordenados y respuestas booleanas.
- Clasificación y enrutado en lote dentro de una sola llamada: el endpoint acepta varias preguntas con identificadores independientes.
- Soporte de tool calling / function calling: no confirmado explícitamente en la información disponible (existe un subíndice "Tools & Automation" en el benchmark del autor, pero no se documenta una API de herramientas).
- Capacidades multilingües: no disponible.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- **Triaje de tickets de soporte**: el endpoint `/v1/decisions` permite enviar el texto de un ticket y obtener en una sola llamada el equipo responsable (`choice`), el nivel de frustración del cliente (`score`) y la urgencia (`yes_no`). El ejemplo de la model card con una incidencia de integración de Stripe ilustra exactamente este flujo.
- **Enrutado a equipos (billing, technical, sales)**: las opciones de tipo `choice` incluyen descripciones que actúan como definiciones operativas, lo que reduce la ambigüedad del enrutado frente a un prompt de chat genérico y facilita mantener las categorías versionadas.
- **Priorización y riesgo de abandono**: combinando preguntas de puntuación y booleanas se pueden generar señales de severidad o de riesgo de churn sobre reseñas, correos o transcripciones, con un formato de salida estable apto para alimentar un CRM.
- **Anotación estructurada a escala**: para equipos de investigación que necesitan etiquetar corpus con criterios múltiples, el modelo actúa como anotador con esquema fijo y temperatura calibrada, y `return_prompt_token_ids` permite auditar qué prompt exacto produjo cada etiqueta.
- **Asistente de documentación técnica**: con el endpoint de chat se pueden generar explicaciones de conceptos (el ejemplo de la model card es "Explain binary search") y resúmenes de documentación interna, con la ventaja de reutilizar la misma instancia que el sistema de decisión.
- **Asistencia a desarrollo de software**: los resultados declarados en LiveCodeBench-V6 (59,50) lo sitúan al nivel del baseline Qwen3.5-27B, por lo que es apto para generación de código y revisión asistida dentro de pipelines de CI/CD, siempre que se valide en el stack concreto del equipo.
- **Automatización de back-office con una sola instancia**: al servir generación y decisión desde el mismo proceso SGLang en puertos y rutas distintas, se evita mantener dos despliegues con requisitos de GPU separados, lo que simplifica el coste operativo en entornos con recursos limitados.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card. No se han verificado de forma independiente.

Decision Index 0.3 Public suite:

| Modelo | Índice público | Conocimiento y razonamiento | Comprensión del lenguaje | Recuperación y clasificación | Herramientas y automatización | Arte y gusto humano |
|---|---:|---:|---:|---:|---:|---:|
| Qwen3.8-27B | 50,26 | 32,31 | 53,25 | 55,22 | 73,24 | 36,95 |
| Jev API 1.14 (referencia oficial) | 60,70 | 57,12 | 61,18 | 63,53 | 73,78 | 39,16 |
| NTele-Hybrid-27B-v1 | 63,25 | 45,62 | 70,49 | 64,34 | 79,69 | 57,89 |

Tareas de generación:

| Modelo | LiveCodeBench-V6 | GPQA Diamond | MATH500 | IFEval | AIME2025 |
|---|---:|---:|---:|---:|---:|
| Qwen3.5-27B | 59,14 | 65,15 | 92,40 | 85,71 | 36,67 |
| NTele-Hybrid-27B-v1 | 59,50 | 68,18 | 93,20 | 87,34 | 40,00 |

Lectura de los datos: la mejora más acusada frente al baseline de decisión se da en "Arte y gusto humano" (+20,94 puntos) y en "Comprensión del lenguaje" (+17,24), mientras que en "Conocimiento y razonamiento" el modelo queda por debajo tanto de Qwen3.8-27B (45,62 frente a 32,31, aquí sí mejora) como de la referencia Jev API 1.14 (57,12). En generación, las diferencias respecto a Qwen3.5-27B son moderadas: entre +0,36 y +3,33 puntos según la prueba.

## Requisitos de hardware

Las cifras de VRAM son estimaciones derivadas del número de parámetros, ya que la model card no publica requisitos oficiales.

- **Pesos en BF16/FP16**: aproximadamente 54 GB solo para pesos, más caché KV de tamaño no disponible. Requiere GPU de 80 GB (A100 80GB, H100 80GB) o reparto en varias GPU.
- **Pesos en FP8**: aproximadamente 27 GB; encaja en A100/H100 80GB con margen amplio y en GPUs de 48 GB (RTX 6000 Ada, L40S) con holgura ajustada.
- **Pesos en 4 bits**: aproximadamente 14-16 GB, lo que permitiría teóricamente ejecución en una RTX 4090 de 24 GB, pero no hay pesos cuantizados publicados ni compatibilidad confirmada con llama.cpp, por lo que esta vía no está soportada de forma oficial.
- **GPU consumer**: no hay confirmación de funcionamiento en GPUs de consumo; el único runtime documentado es SGLang.
- **Despliegue**: SGLang ≥ 0.5.20 es el runtime recomendado y el único que la model card documenta. El endpoint `/v1/decisions` es una ruta no estándar, por lo que la compatibilidad con vLLM, TGI, llama.cpp u Ollama no está confirmada y requeriría implementar el contrato de decisión en el servidor.
- **Latencia y throughput**: no disponibles. El único dato operativo es el `--max-time 60` del ejemplo de llamada al endpoint de decisión, que sugiere que el autor contempla latencias que pueden acercarse al minuto en cargas de decisión con varias preguntas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Decision Index 0.3 | LiveCodeBench-V6 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| NTele-Hybrid-27B-v1 | 27B | No disponible | 63,25 | 59,50 | MIT | HuggingFace (ZTE-AIM) |
| Qwen3.8-27B (base) | 27B | No disponible | 50,26 | No disponible en la información proporcionada | No disponible | HuggingFace (Qwen) |
| Qwen3.5-27B (baseline de generación) | 27B | No disponible | No disponible | 59,14 | No disponible | HuggingFace (Qwen) |
| Jev API 1.14 (referencia del benchmark) | No disponible | No disponible | 60,70 | No disponible | No disponible | Snapshot público en HuggingFace Spaces |

La comparación se limita a los modelos que el propio autor emplea como referencia. No se dispone de datos para comparar con otras familias de altura similar (por ejemplo, otros modelos de 27-32B con capacidades de clasificación estructurada), por lo que esa comparativa se considera no disponible.

## Limitaciones y advertencias

- **Validación externa inexistente**: el modelo acumula cero descargas y cero likes en HuggingFace, sin informes independientes que confirmen los resultados declarados.
- **Benchmark propio**: el "Decision Index 0.3 Public suite" es un conjunto de evaluación del ecosistema del autor, no un estándar académico ampliamente adoptado, lo que limita la comparabilidad con otros modelos.
- **Discrepancia en la model card**: una nota interna del documento advierte de que el baseline de decisión se denomina Qwen3.8-27B mientras que el baseline de generación se denomina Qwen3.5-27B, y recomienda confirmar el repositorio y la revisión del modelo base antes de publicar. Debe verificarse qué revisión exacta se usó para cada tabla.
- **Riesgo de alucinación**: no documentado por el autor; al ser un modelo generativo de 27B, mantiene el riesgo habitual en tareas de respuesta abierta, especialmente en dominios factuales.
- **Sesgos**: no se publica ninguna evaluación de sesgos, toxicidad o equidad. En tareas de decisión sobre personas (priorización, moderación, evaluación de frustración) esto es un riesgo directo.
- **Idiomas**: no se especifica qué idiomas soporta ni la calidad por idioma. El ejemplo de la model card está en inglés; el uso en castellano requeriría evaluación propia.
- **Contexto y cuantizaciones**: no se publica longitud de contexto ni pesos cuantizados, lo que impide planificar despliegues en GPUs de consumo con garantías.
- **Dependencia de runtime**: el endpoint de decisión requiere SGLang ≥ 0.5.20. Migrar a otro servidor implica reimplementar el contrato `/v1/decisions`, incluido el calibrado de temperatura.
- **Temperatura específica**: usar `1.26964` en decisión y valores distintos en generación; aplicar la temperatura de generación a las decisiones degradará la calibración sin que exista una advertencia en tiempo de ejecución.
- **Licencia**: MIT permite uso comercial y modificación, pero el modelo base Qwen puede arrastrar condiciones adicionales que no se detallan en la información disponible; conviene revisar la licencia del modelo base antes de un despliegue comercial.
- **Madurez**: versión v1 publicada y actualizada en menos de 24 horas, sin historial de revisiones ni changelog.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ZTE-AIM/NTele-Hybrid-27B-v1
- Modelo base declarado: https://huggingface.co/Qwen/Qwen3.8-27B
- Snapshot público de resultados de Jev API 1.14 citado por el autor: https://huggingface.co/spaces/multimodalart/jev-decision-index/blob/d9962113a1acc95c2d7522c2babfb989afbeb034/data/v03.json
- SGLang (runtime de despliegue recomendado, versión ≥ 0.5.20): https://github.com/sgl-project/sglang
- Página corporativa de ZTE (resultado de la búsqueda web, sin documentación técnica del modelo): https://www.zte.com.cn/global/
- Nota: la búsqueda web realizada únicamente devolvió páginas corporativas y de dispositivos de ZTE; no se localizaron papers, blogs técnicos ni demos adicionales sobre este modelo.
