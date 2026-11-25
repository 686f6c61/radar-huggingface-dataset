# tiagotmaia/nexusgeo-qwen3-4b-v2-GGUF

## Resumen

NexusGeo Qwen3-4B v2 es un ajuste fino mediante QLoRA del modelo base Qwen/Qwen3-4B, desarrollado por Tiago Felipe Arruda Maia (profesor del Departamento de Geología de la Universidad Federal de Amazonas, UFAM). El modelo está especializado en flujos de trabajo geocientíficos y en la generación de salidas estructuradas en JSON, y se distribuye en formato GGUF cuantizado Q4_K_M para inferencia local con Ollama y llama.cpp. El repositorio aloja únicamente esta build cuantizada, no los pesos completos en precisión original.

El modelo parte de la arquitectura transformer de Qwen3-4B (4.022.468.096 parámetros) y añade un adaptador LoRA entrenado sobre un conjunto de datos conductual bilingüe (portugués de Brasil e inglés) orientado a tareas de enrutamiento de workflows geocientíficos y extracción estructurada. Tras el entrenamiento, el adaptador se fusionó con el modelo base y se cuantizó a GGUF Q4_K_M (2.497.280.608 bytes, aproximadamente 2,33 GiB).

Su relevancia radica en dos factores: por un lado, ofrece un asistente de dominio geológico que cabe en hardware de consumo; por otro, está diseñado explícitamente para producir JSON conforme a esquema (el autor declara un 100 % de conformidad de esquema en su benchmark interno), lo que lo hace adecuado como componente de enrutamiento y extracción dentro de pipelines deterministas. La licencia Apache-2.0 y los idiomas declarados (inglés y portugués) acotan su ámbito de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen/Qwen3-4B), ajuste fino QLoRA con fusión de adaptador LoRA |
| Parametros totales | 4.022.468.096 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada (los ejemplos de la model card usan `-c 32768` / `num_ctx: 32000`, pero no se declara oficialmente la ventana máxima) |
| Tipos de cuantizacion | GGUF Q4_K_M (única build publicada en este repositorio) |
| Idiomas soportados | Inglés (en), portugués de Brasil (pt) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (`nexusgeo-qwen3-4b-v2-Q4_K_M.gguf`) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del transformer denso de Qwen3-4B. Sobre esa base se aplicó un ajuste fino con QLoRA: cuantización de 4 bits NF4 con doble cuantización para el entrenamiento del adaptador y posterior fusión del LoRA en los pesos del modelo base. El conjunto de datos de entrenamiento es un corpus conductual bilingüe (portugués de Brasil e inglés) centrado en flujos de trabajo geocientíficos, enrutamiento de tareas y extracción estructurada con salida JSON. No se especifican en la información disponible el número de tokens de entrenamiento, la composición detallada del dataset ni si se aplicaron fases de RLHF o DPO.

El rasgo técnico más destacable no es arquitectónico sino conductual: el modelo está entrenado para responder exclusivamente con un objeto JSON válido, sin markdown, sin bloques de código y sin razonamiento fuera del JSON, tal como se refleja en los prompts de sistema de los ejemplos de la model card. Esta restricción de formato, combinada con la cuantización Q4_K_M, lo orienta a su uso como componente de extracción y clasificación dentro de una estación de trabajo local (el proyecto NexusGeo IA), más que como asistente conversacional general.

## Capacidades

- Generación de texto y razonamiento general heredados del modelo base Qwen3-4B.
- Salida estructurada en JSON con alta conformidad de esquema declarada por el autor (100 % en su benchmark interno).
- Enrutamiento de workflows geocientíficos: clasificación de tareas en códigos como `consulta_direta`, `triagem_area`, `hidrogeologia` o `sondagem`, y de intención de fuente (`LOCAL_ONLY`, `RIGEO_ONLY`, `HIBRIDO`, `ANA_ONLY`).
- Etiquetado de gobernanza de contenido: clasificación de formato (`contrato` / `texto_livre`), etiquetas `OBSERVED` / `INFERRED` y veredictos `PASS` / `HOLD` / `FAIL`.
- Capacidades multilingües limitadas a inglés y portugués de Brasil.
- Soporte de conversación multi-turno vía chat template (ChatML en llama.cpp, API de chat en Ollama).
- Compatibilidad con servidor local OpenAI-compatible mediante `llama-server`.
- No se declara soporte explícito de tool calling, function calling, agentes autónomos, visión, audio ni modo de razonamiento extendido (thinking) en la información disponible.

## Casos de uso

- Enrutamiento de consultas geocientíficas en una estación de trabajo local: el modelo clasifica cada petición entrante en uno de los workflows predefinidos y decide si debe resolverse con documentos locales, con fuentes externas o de forma híbrida, devolviendo un JSON que el orquestador puede consumir directamente sin parseo adicional.
- Extracción estructurada de entidades geológicas: a partir de texto libre (informes de prospección, descripciones de sondeos), el modelo genera objetos JSON con campos normalizados, lo que permite alimentar bases de datos relacionales o índices de búsqueda sin intervención manual.
- Etiquetado de gobernanza y validación documental: clasificación de afirmaciones como observadas o inferidas y emisión de veredictos de aceptación, retención o rechazo, útil en flujos de control de calidad de informes técnicos donde cada aserción debe llevar evidencia asociada.
- Asistente de triaje de proyectos mineros: dado un enunciado como «triage a copper prospect with geochemical anomalies», el modelo identifica el workflow adecuado y la intención de fuente, sirviendo como primera capa de un sistema de gestión de proyectos de exploración.
- Despliegue en hardware de consumo para investigadores: con aproximadamente 2,33 GiB en Q4_K_M, el modelo puede ejecutarse en portátiles sin GPU dedicada mediante Ollama o llama.cpp, lo que facilita su uso en campo o en entornos con recursos limitados.
- Componente de pipelines deterministas con temperatura 0 y semilla fija: los ejemplos de la model card emplean `temperature: 0` y `seed: 42`, lo que indica un uso previsto como clasificador reproducible dentro de flujos automatizados, no como generador creativo.
- Servicio local OpenAI-compatible: mediante `llama-server` puede exponerse en el puerto 8080 y ser consumido por herramientas que ya hablan la API de OpenAI, integrándose en aplicaciones existentes sin cambios de cliente.

## Benchmarks y rendimiento

Datos declarados por el autor del modelo en el model-index de la model card (no verificados de forma independiente):

| Benchmark | Métrica | Valor |
|---|---|---|
| NexusGeoIA Behavior Benchmark v2 | JSON Schema Conformance (%) | 100 |
| NexusGeoIA Behavior Benchmark v2 | Label / Schema Accuracy (%) | 62 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,33 GiB para los pesos en Q4_K_M; con overhead de contexto (KV cache) a 32 000 tokens, el consumo real será superior y dependerá de la implementación.
- GPU recomendadas: no se especifican en la información disponible. Por tamaño, cualquier GPU consumer con 4-6 GB de VRAM libre debería poder alojar los pesos; no se aportan datos de latencia ni throughput.
- Cabe en GPU consumer: sí, por el tamaño de la cuantización (2,33 GiB), aunque el autor no detalla modelos concretos probados.
- Opciones de despliegue: Ollama (`ollama pull hf.co/tiagotmaia/nexusgeo-qwen3-4b-v2-GGUF:Q4_K_M`), llama.cpp (`llama-cli`, `llama-server` con API OpenAI-compatible) y el binding Python `llama_cpp` (`Llama.from_pretrained`).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Especialización |
|---|---|---|---|---|---|
| nexusgeo-qwen3-4b-v2-GGUF | 4,02 B | No disponible | GGUF Q4_K_M | Apache-2.0 | Geociencia y salida JSON estructurada |
| Qwen/Qwen3-4B (base) | 4,02 B | No disponible | Safetensors (y cuantizaciones de la comunidad) | Apache-2.0 | Propósito general |
| Alternativas de 4 B especializadas en dominio | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparación relevante es con el modelo base Qwen3-4B: este ajuste conserva el tamaño y la licencia, pero restringe el comportamiento hacia JSON conforme a esquema y dominio geocientífico, a costa de una precisión de etiqueta declarada del 62 % en el benchmark propio del autor. No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- La precisión de etiqueta declarada es del 62 % en el benchmark interno del autor; un 38 % de error en la clasificación es un caveat importante para cualquier uso en producción sin validación humana.
- Los resultados del benchmark no están verificados de forma independiente (`verified: false` en el model-index) y proceden de un conjunto de evaluación propio del autor.
- El modelo está entrenado para responder únicamente con JSON; fuera de ese formato puede degradarse o ignorar instrucciones conversacionales generales.
- Idiomas limitados a inglés y portugués de Brasil; no se declara soporte de castellano ni de otros idiomas.
- No se especifica la longitud máxima de contexto oficial; los ejemplos usan 32 000-32 768 tokens, pero debe verificarse empíricamente antes de confiar en ventanas largas.
- Riesgo de alucinación inherente a un modelo de 4 B ajustado con QLoRA sobre un dataset conductual limitado; las salidas JSON pueden ser sintácticamente válidas pero semánticamente incorrectas.
- No se documentan sesgos específicos del dataset de entrenamiento ni procesos de mitigación.
- La licencia Apache-2.0 permite uso comercial, pero el modelo se distribuye solo como GGUF Q4_K_M; no hay pesos en precisión completa ni adaptadores LoRA publicados en este repositorio.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que indica una validación comunitaria prácticamente nula.

## Enlaces

- Hugging Face: https://huggingface.co/tiagotmaia/nexusgeo-qwen3-4b-v2-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Proyecto GitHub NexusGeoIA: https://github.com/Prof-Tiago-Maia/NexusGeoIA
- Paper, blog o demo adicionales: no disponibles en la información proporcionada.
