# VTN-TokenFactory/Telasap-0.8B-v1.0

## Resumen

Telasap-0.8B-v1.0 es un modelo de decisión de 0,85 mil millones de parámetros desarrollado por VTN-TokenFactory, obtenido mediante un ajuste fino completo (*full fine-tune*) del modelo base Qwen/Qwen3.5-0.8B. Su especialidad es el *routing* de modelos: dado un enunciado o pregunta, el modelo emite una decisión en una sola pasada hacia delante (*forward pass*), sin generar texto. No es, por tanto, un modelo conversacional al uso, sino un clasificador-decisor orientado a enrutar consultas hacia el modelo o sistema adecuado.

El modelo conserva la arquitectura del Qwen3.5-0.8B, incluyendo su torre de visión de 101 millones de parámetros, lo que da un total de 852.985.920 parámetros (752M de texto + 101M de visión). Está publicado con licencia Apache-2.0 y pesos en safetensors, y se sirve a través de un endpoint específico (`/v1/systemone`) definido por el ecosistema JevBench, con post-procesado declarado para las modalidades `noul`, `score` y `choice`.

Su relevancia radica en que aborda una tarea poco cubierta por los modelos generativos convencionales: la decisión de enrutamiento con etiquetas suaves (*soft labels*) destiladas de modelos de decisión de mayor tamaño (Torchcast Decision 31B y MetaDecision-31B-Rain), empaquetada en un modelo pequeño que puede ejecutarse en una sola GPU. Es un componente de infraestructura para sistemas multi-modelo, no un asistente final.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5) con torre de vision; ajuste fino completo para decision |
| Parametros totales | 852.985.920 (752M texto + 101M torre de vision) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B (commit `2fc06364715b967f1860aea9cf38778875588b17`) y aplica un ajuste fino completo orientado a decisión y enrutamiento. Mantiene la torre de visión del modelo base (101M de parámetros), por lo que la entrada puede incluir información visual además de textual, aunque la model card no detalla el uso concreto de la torre en las tareas de routing. La inferencia se realiza en una única pasada hacia delante, sin decodificación autoregresiva, lo que reduce la latencia frente a un modelo generativo del mismo tamaño.

El entrenamiento se apoya en una mezcla base de decisión del equipo, con preguntas de routing construidas sobre los 55k prompts de LMSYS Arena (Apache-2.0) y etiquetas suaves generadas por Torchcast Decision 31B y MetaDecision-31B-Rain. Los ítems de enrutamiento por reglas fueron redactados por gpt-oss-120b y Gemma-4-31B y solo se conservaron cuando una segunda resolución ciega coincidía; también se incluyeron ítems de reglas generados por código. Las filas nuevas se descontaminaron mediante n-gramas de palabras (8-gramas) contra JevBench público y OpenDecisions, y no se usó ningún ítem de JevBench ni de OpenDecisions para el entrenamiento.

## Capacidades

- Decisión de enrutamiento de modelos en una sola pasada, sin generación de texto.
- Soporte de las modalidades de decisión `noul`, `score` y `choice` mediante post-procesado declarado en el servidor.
- En `noul`, una probabilidad P(yes) estrictamente entre 0,2 y 0,8 se compromete a 0,801 o 0,199 según el lado hacia el que se inclina.
- En `score`, la respuesta es la mediana de la distribución del modelo, devuelta como masa puntual.
- En `choice`, la decisión se devuelve sin modificación respecto a la salida del modelo.
- Conserva la torre de visión del modelo base (101M de parámetros), aunque la model card no detalla su uso operativo.
- Capacidad multilingüe: no disponible (no documentada).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible; el modelo está diseñado para una única decisión por consulta.

## Casos de uso

- Enrutamiento en sistemas multi-modelo: dado un prompt de usuario, el modelo decide qué modelo o pipeline debe atenderlo, reduciendo el coste frente a enviar todas las consultas al modelo mayor. Su formato de una sola pasada encaja en un *router* de baja latencia.
- Puerta de decisión binaria (`noul`): clasificar si una consulta cumple o no un criterio (por ejemplo, si requiere razonamiento profundo o si puede resolverse con un modelo pequeño), con umbrales calibrados que evitan respuestas ambiguas en la franja 0,2-0,8.
- Puntuación de dificultad (`score`): estimar un nivel de dificultad o calidad para una consulta y usar la mediana como punto de corte en un pipeline de escalado dinámico.
- Selección entre opciones (`choice`): elegir entre un conjunto discreto de rutas o herramientas predefinidas en un orquestador, con la decisión devuelta tal cual por el modelo.
- Filtrado previo en pipelines de datos: descartar o etiquetar prompts de un corpus (por ejemplo, los 55k de LMSYS Arena) según su idoneidad para una tarea, aprovechando el entrenamiento con etiquetas suaves.
- Evaluación y calibración de routers: servir como referencia pequeña y reproducible en experimentos de enrutamiento, gracias a su licencia Apache-2.0 y a su despliegue mediante `router_server.py` en el ecosistema JevBench.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 1,7 GB en safetensors (precisión original, presumiblemente bf16/fp16); en bf16 se requieren aproximadamente 1,7 GB solo para pesos, más memoria para activaciones y la torre de visión. La cuantización no está documentada.
- GPU recomendadas: no disponible de forma explícita; por tamaño, cabe en GPU de consumo con al menos 4-6 GB de VRAM libre, aunque el autor no publica requisitos oficiales.
- Cabe en GPU de consumo: previsiblemente sí (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090), si bien no se confirma en la documentación.
- Opciones de despliegue: el autor documenta `router_server.py` con `torch==2.11.0`, `transformers==5.17.0`, `flash-linear-attention==0.6.0`, `safetensors` y `accelerate`, sobre CUDA. No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; al ser una sola pasada hacia delante, la latencia debería ser inferior a la de un modelo generativo del mismo tamaño, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Telasap-0.8B-v1.0 | 852.985.920 | no disponible | Routing / decision | Apache-2.0 | Hugging Face (0 descargas) |
| Qwen/Qwen3.5-0.8B (base) | ~0,8B | no disponible | Generacion general | no disponible en la informacion | Hugging Face |
| Torchcast Decision 31B | 31B (aprox., segun nombre) | no disponible | Decision / etiquetas suaves | no disponible | no disponible |
| MetaDecision-31B-Rain | 31B (aprox., segun nombre) | no disponible | Decision / etiquetas suaves | no disponible | no disponible |

La comparación con los modelos de decisión de 31B es relevante porque fueron las fuentes de las etiquetas suaves del entrenamiento: Telasap-0.8B busca aproximar su comportamiento con un modelo unas 36 veces menor. No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- Modelo especializado en decisión y routing: no está pensado para generación de texto libre ni para uso conversacional.
- Sin datos publicados de benchmarks, por lo que no es posible verificar su calidad frente a alternativas.
- La model card no documenta idiomas soportados, longitud de contexto ni esquemas de cuantización, lo que dificulta planificar su despliegue en producción.
- El post-procesado `noul` fuerza valores concretos (0,801 / 0,199) en la franja 0,2-0,8; este comportamiento altera la distribución calibrada del modelo y debe tenerse en cuenta al interpretar probabilidades.
- Riesgo de sesgo heredado del modelo base Qwen3.5-0.8B y de los datos de entrenamiento (prompts de LMSYS Arena y etiquetas de modelos de 31B), no evaluado en la documentación.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de decisiones erróneas en dominios alejados de la mezcla de entrenamiento.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base Qwen3.5-0.8B debe verificarse por separado para confirmar compatibilidad.
- El despliegue depende de versiones muy concretas de dependencias (`torch==2.11.0`, `transformers==5.17.0`, `flash-linear-attention==0.6.0`), lo que puede complicar la integración en entornos existentes.
- Modelo con 0 descargas y 0 likes en el momento de la ficha: sin validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/VTN-TokenFactory/Telasap-0.8B-v1.0
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio de entrenamiento (referenciado en la model card): https://huggingface.co/datasets/lmsys/lmsys-arena-human-preference-55k (prompts LMSYS Arena 55k, Apache-2.0)
- Ecosistema JevBench: no disponible (no se proporciona URL)
- OpenDecisions: no disponible (no se proporciona URL)
