# valentin-marquez/snaicc-asistente-2b

## Resumen

SNAICC Asistente 2B es un ajuste fino de Qwen/Qwen3.5-2B (1.942.653.248 parámetros totales) desarrollado por valentin-marquez para el asistente conversacional del Sistema Nacional de Acceso a la Información sobre Cambio Climático (SNAICC) de Chile. El modelo resuelve un problema muy acotado: dada una pregunta en español sobre cambio climático en Chile, selecciona la herramienta adecuada de un conjunto fijo de 20 funciones (planes comunales, proyecciones ARClim, Ley 21.455, explicaciones conceptuales) con sus argumentos, o bien reconoce que la consulta está fuera de tema. En una segunda fase, redacta una respuesta breve a partir de los datos que devuelve la API.

El modelo no almacena conocimiento factual: las cifras y documentos se obtienen en tiempo de ejecución desde las APIs públicas del Ministerio del Medio Ambiente de Chile. Está entrenado con QLoRA (rango 16 sobre atención y MLP, una época) y se distribuye exclusivamente en formato GGUF cuantizado Q4_K_M para ejecución en CPU con llama.cpp, lo que lo hace desplegable en hardware modesto (8 núcleos, ~1,31 GB por archivo).

Es relevante como ejemplo de ajuste fino de dominio muy estrecho sobre un modelo base pequeño, con evaluación sistemática por versiones (v1 a v3.6) y métricas de acierto en selección de herramienta sobre conjuntos no vistos. Su licencia Apache 2.0 permite reutilización comercial, aunque su utilidad práctica está limitada al ecosistema de herramientas para el que fue entrenado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen/Qwen3.5-2B); no se detalla en la información disponible |
| Parámetros totales | 1.942.653.248 |
| Parámetros activos | no disponible (no es MoE según la información proporcionada) |
| Longitud de contexto | 8192 tokens (configuración recomendada en llama-server con `-c 8192`) |
| Tipos de cuantización | Q4_K_M (único formato publicado) |
| Idiomas soportados | Español (centrado en Chile) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base es safetensors, pero el ajuste se publica solo en GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-2B, un transformer decoder-only de aproximadamente 1,94 mil millones de parámetros. Sobre esa base se aplica un ajuste QLoRA con rango 16 sobre las capas de atención y MLP, durante una época, en una única RTX 3060 Ti con un tiempo de entrenamiento de 2 horas y 16 minutos. No se documentan innovaciones arquitectónicas propias: el valor del modelo está en el ajuste de comportamiento, no en cambios estructurales.

El conjunto de entrenamiento consta de 5.654 ejemplos de selección de herramienta (846 de ellos con turno anterior para seguimientos conversacionales) y 914 ejemplos de redacción de respuestas. Las preguntas son sintéticas, generadas a partir de perfiles de usuario (ciudadanía, estudiantes, periodistas, profesionales de distintas disciplinas, especialistas en transparencia climática), etiquetadas de forma independiente y verificadas contra las APIs reales: solo se admite una pregunta si la llamada a herramienta devuelve datos reales. No se emplean datos personales ni preguntas reales de usuarios. No se menciona RLHF ni DPO en la información disponible.

## Capacidades

- Selección de herramienta (tool calling / function calling) entre 20 funciones predefinidas, devolviendo el nombre y los argumentos en formato compatible con `/v1/chat/completions`.
- Reconocimiento de preguntas fuera de tema (rechazo controlado).
- Gestión de seguimientos conversacionales mediante el patrón de turno anterior (pregunta previa + llamada realizada + mensaje de herramienta "Respondido.").
- Redacción de respuestas cortas a partir de los datos devueltos por la herramienta.
- Adaptación a perfiles profesionales: la v3.6 incorpora preguntas por perfil no vistas en entrenamiento (81/90 aciertos).
- Manejo de peticiones de reformulación ("pedir otra explicación": 41/50 en v3.6).
- Ejecución en CPU con llama.cpp y compatibilidad con endpoints estilo OpenAI (`endpoints_compatible`).
- Capacidad multilingüe limitada: solo español, con sesgo geográfico hacia Chile.

## Casos de uso

- Asistente público de consulta climática: integrado en el portal SNAICC, recibe preguntas ciudadanas, selecciona la herramienta adecuada (plan comunal, proyección ARClim, texto legal) y redacta una respuesta breve; el sistema verifica cada cifra contra la fuente antes de mostrarla.
- Seguimiento conversacional multi-turno: permite encadenar preguntas del tipo "¿y en Temuco?" reutilizando el contexto del turno anterior mediante el patrón documentado, adecuado para interfaces de chat de atención ciudadana.
- Enrutado de intenciones en pipelines RAG: el modelo actúa como clasificador de intención con argumentos estructurados, derivando cada consulta a la API correcta del Ministerio; útil cuando se quiere evitar un LLM grande para esta tarea.
- Despliegue en infraestructura limitada: al correr en CPU de 8 núcleos con ~1,31 GB de pesos Q4_K_M, encaja en servidores sin GPU o en entornos con presupuesto de hardware reducido.
- Filtrado de consultas fuera de dominio: detecta preguntas ajenas al cambio climático chileno (56/60 en v3.6) y evita llamadas innecesarias a las APIs.
- Atención a perfiles profesionales especializados: periodistas, estudiantes y técnicos de transparencia climática obtienen respuestas adaptadas a su nivel, con 81/90 aciertos en perfiles no vistos durante el entrenamiento.
- Prototipado de asistentes sectoriales: la receta (QLoRA rango 16 sobre modelo de 2B, verificación contra APIs, evaluación por versiones) es replicable para otros dominios con conjuntos de herramientas acotados.

## Benchmarks y rendimiento

Aciertos al elegir herramienta sobre conjuntos no usados en entrenamiento (940 preguntas totales, GPU, mediana de 0,2 s por pregunta):

| Conjunto | v3.5 | v3.6 |
|---|---|---|
| Preguntas de usuarios, 5 conjuntos (750) | 713 | 716 |
| Seguimientos con turno anterior (80) | 78 | 77 |
| Fuera de tema (60) | 58 | 56 |
| Pedir otra explicación (50) | 38 | 41 |
| Perfiles profesionales no vistos (90) | 74 | 81 |
| **Total (940)** | **887** | **890** |

Evolución por versión (aciertos sobre 940, todos medidos con la lista de herramientas actual):

| Versión | Aciertos | Cambio principal |
|---|---|---|
| v1 | 804 | primera versión ajustada |
| v2 | 822 | no disponible |
| v3 | 820 | no disponible |
| v3.1 | 829 | no disponible |
| v3.2 | 872 | pedir otra explicación, seguimientos |
| v3.3 | 858 | aprende a redactar |
| v3.4 | 865 | herramienta de la Ley Marco |
| v3.5 | 887 | turno anterior, preguntas fuera de tema |
| v3.6 | 890 | preguntas por perfil profesional, contrastes de "no entendí" |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no requiere GPU; los pesos Q4_K_M ocupan ~1,31 GB por archivo.
- GPU recomendadas: no aplica para el despliegue previsto; el entrenamiento se realizó en una RTX 3060 Ti.
- Cabe en cualquier GPU consumer con al menos ~2 GB de memoria libre, y en CPU de 8 núcleos (entorno de referencia del autor).
- Opciones de despliegue: llama.cpp (`llama-server -m <gguf> --jinja -c 8192`), probado con la build b12283; compatible con endpoints estilo OpenAI (`/v1/chat/completions`).
- Latencia y throughput medidos: en la CPU de 8 núcleos del servidor de destino, ~15 tokens/s de escritura; selección de herramienta en 2-4 s; respuesta completa en 8-17 s. En GPU, mediana de 0,2 s por pregunta para selección de herramienta.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Formato |
|---|---|---|---|---|---|
| SNAICC Asistente 2B (v3.6) | 1,94 B | 8192 | Tool calling climático Chile (20 herramientas fijas) | Apache 2.0 | GGUF Q4_K_M |
| Qwen/Qwen3.5-2B (base) | 1,94 B | no disponible | Propósito general | no disponible en la información | safetensors |
| Alternativas de 2B para tool calling | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con otros modelos en la información proporcionada. La comparación relevante es contra su propio modelo base: el ajuste mejora la selección de herramienta dentro del conjunto fijo de 20 funciones, a costa de degradar el comportamiento fuera de ese conjunto ("fuera de esas 20 herramientas el modelo no se comporta bien").

## Limitaciones y advertencias

- El modelo está ajustado a exactamente 20 herramientas; fuera de ellas su comportamiento se degrada de forma explícita según el autor.
- Puede elegir mal la herramienta en preguntas ambiguas o muy técnicas; el asistente que lo integra debe verificar cada cifra redactada contra la fuente.
- Solo español y centrado en Chile; no cubre otros idiomas ni otras jurisdicciones.
- No almacena datos: no sustituye la consulta de los documentos oficiales y no debe usarse como fuente factual por sí mismo.
- Riesgo de alucinación en la fase de redacción si los datos de la herramienta son incompletos; el diseño mitiga esto con verificación externa, no con el modelo.
- Rendimiento modesto en peticiones de reformulación (41/50 en v3.6) y ligera regresión en seguimientos (77/80 frente a 78/80 en v3.5) y fuera de tema (56/60 frente a 58/60).
- El modelo no es un producto oficial del Ministerio del Medio Ambiente de Chile, pese a haber sido desarrollado en el marco del proyecto CBIT-2 (FAO) con esa contraparte técnica.
- No se han publicado datos de sesgos; al entrenarse con preguntas sintéticas por perfiles, la cobertura de estilos reales de usuario puede ser limitada.
- Solo se publica cuantización Q4_K_M; no hay versiones en safetensors del ajuste ni otras cuantizaciones (Q5, Q8, FP16) en la información disponible.
- Licencia Apache 2.0 permite uso comercial, pero la utilidad comercial está restringida al dominio y conjunto de herramientas para el que fue entrenado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/valentin-marquez/snaicc-asistente-2b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- llama.cpp (runtime recomendado, build b12283): https://github.com/ggml-org/llama.cpp
- Proyecto CBIT-2 (FAO): no disponible en la información proporcionada
- Ministerio del Medio Ambiente de Chile (contraparte técnica): no disponible en la información proporcionada
- Sistema Nacional de Acceso a la Información sobre Cambio Climático (SNAICC): no disponible en la información proporcionada
