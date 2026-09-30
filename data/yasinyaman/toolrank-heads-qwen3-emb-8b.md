# yasinyaman/toolrank-heads-qwen3-emb-8b

## Resumen

`yasinyaman/toolrank-heads-qwen3-emb-8b` no es un modelo de lenguaje completo, sino un par de cabezas MLP entrenadas que se superponen sobre los embeddings de frase de Qwen3-Embedding-8B para hacer recuperación de herramientas (tool retrieval). Lo desarrolla el autor independiente yasinyaman dentro del proyecto toolrank, y resuelve un problema muy concreto en el contexto de agentes: dado el texto de una petición de un agente, seleccionar la herramienta correcta (típicamente servida vía MCP u OpenAPI) entre catálogos que pueden tener decenas de miles de entradas. Es relevante ahora porque el ecosistema MCP ha disparado el número de herramientas disponibles por agente, y el enrutado por embeddings se ha vuelto el cuello de botella habitual.

Técnicamente son dos cabezas de tipo skip (`x + MLP(x)`, 4096 → 1536 → 1536 → 4096, GELU y LayerNorm) con 29,9M de parámetros en total, que se inicializan como la identidad, de modo que el entrenamiento solo añade una corrección sobre el backbone congelado. El backbone es Qwen3-Embedding-8B con pooling del último token, vectores de 4096 dimensiones y truncado a 8192 tokens. La salida se normaliza en L2 y la puntuación de cada herramienta es el coseno entre el vector de la petición (state head) y el vector de la herramienta (action head).

El artefacto publicado pesa 59,8 MB en float16 y se distribuye como fichero numpy `.npz` que se carga con `allow_pickle=False`, por lo que puede ejecutarse sin torch. Está liberado bajo Apache-2.0, aunque los datos de entrenamiento (206K pares petición-herramienta de ToolRet-Training-20w) no tienen licencia declarada, un punto que el propio autor señala como riesgo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dos cabezas MLP de tipo skip (`x + MLP(x)`, 4096 → 1536 → 1536 → 4096, GELU, LayerNorm) sobre un backbone transformer denso congelado (Qwen3-Embedding-8B) |
| Parametros totales | 29,9M (ambas cabezas) + 8B del backbone Qwen3-Embedding-8B |
| Parametros activos | no aplica (no es MoE; el backbone es denso) |
| Longitud de contexto | 8192 tokens (`truncate_prompt_tokens` 8192 en la configuracion de serving) |
| Tipos de cuantizacion | Cabezas en float16; backbone en bf16 o FP8 (vLLM `--quantization fp8`) |
| Idiomas soportados | Ingles unicamente (peticiones y textos de herramientas); no hay campo de idiomas en la model card de HuggingFace |
| Licencia | Apache-2.0 (cabezas); los datos de entrenamiento no declaran licencia |
| Formato de pesos | numpy `.npz` en float16 (59,8 MB), cargado con `allow_pickle=False`; checkpoint origen en torch (`qwen_full_skip_neg0_e5.pt`) |

## Arquitectura y entrenamiento

El componente entrenado son dos cabezas independientes que operan sobre los embeddings ya calculados por Qwen3-Embedding-8B: la *state head* procesa la petición del agente y la *action head* procesa la documentación de la herramienta. Cada cabeza aplica una transformación residual con estructura `x + MLP(x)` de cuatro capas (4096 → 1536 → 1536 → 4096) con activación GELU y LayerNorm, y después normaliza el resultado en L2. Al inicializarse como la identidad, el entrenamiento solo aprende una corrección sobre el espacio de embeddings original. La puntuación final es el coseno entre el vector de la petición y el de la herramienta. Las herramientas se representan como texto de documentación; para herramientas MCP y OpenAPI ingeridas, ese texto es el JSON `{"server", "name", "description", "inputSchema"}`. Las peticiones se formatean como `Instruct: {instruction}\nQuery: {request}`, con la instrucción por defecto `Given an agent's request for a tool, retrieve the MCP tool that fulfills it.`, elegida entre tres candidatas sobre LiveMCPBench y MCP-Zero.

El entrenamiento usa 206.000 pares petición-herramienta extraídos de `mangopy/ToolRet-Training-20w`, descartando los pares cuya petición coincide con alguna petición de los benchmarks de ToolRet. El objetivo es InfoNCE con negativos solo dentro del lote (*in-batch negatives*); los negativos minados que incluye el dataset no se usaron porque costaban hasta 10 puntos. La optimización fue a lr 1e-5, batch 512 y 5 épocas, seleccionando la época 4 sobre pares de validación reservados. El backbone permanece congelado y sus vectores se sirven desde caché, por lo que el entrenamiento tarda minutos. La exportación a float16 mantiene una similitud de proyección coseno ≥ 0,999999 y una coincidencia top-10 ≥ 99,89% frente al checkpoint en torch en los tres conjuntos evaluados.

## Capacidades

- Recuperación de herramientas (tool retrieval) a partir de lenguaje natural en inglés: dado un texto de petición, devuelve la herramienta más adecuada de un catálogo.
- Puntuación por similitud coseno entre el embedding de la petición y el de cada herramienta, con lo que soporta ranking completo (top-k) y no solo clasificación binaria.
- Compatibilidad con catálogos MCP y OpenAPI ingeridos por toolrank, representados como JSON con servidor, nombre, descripción y `inputSchema`.
- Funcionamiento como re-ranker: al ser un coseno en un espacio corregido, puede puntuar candidatos recuperados previamente por otra búsqueda vectorial.
- Ejecución sin torch: la implementación numpy (`toolrank.adapters.heads_np.NumpyHeads`) carga el `.npz` con `allow_pickle=False`.
- Integración mediante CLI de toolrank (`toolrank search`, `toolrank eval`) y descarga automática del checkpoint con verificación de sha256.
- No ofrece generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling ni capacidades de agente: es exclusivamente un componente de recuperación.

## Casos de uso

- Enrutado de herramientas en agentes basados en MCP: el agente escribe la petición en lenguaje natural y el modelo devuelve la herramienta MCP correcta de un catálogo de miles de entradas; es el escenario principal para el que se entrenó, con 44.453 herramientas en ToolRet y 2.792 en MCP-Zero.
- Selección de endpoints en pasarelas OpenAPI internas: con el `inputSchema` en el texto de la herramienta, el mismo mecanismo sirve para elegir el endpoint correcto de una API corporativa antes de que el LLM genere la llamada.
- Re-ranking dentro de un pipeline RAG de herramientas: recuperar primero 100 candidatos con una búsqueda vectorial genérica y reordenarlos con estas cabezas para quedarse con los 5 mejores, aprovechando la corrección específica de dominio.
- Evaluación comparativa de backbones de embeddings: el paquete toolrank permite lanzar `toolrank eval` contra ToolRet, LiveMCPBench y MCP-Zero, de modo que un equipo puede medir si le compensa adoptar estas cabezas o cambiar de backbone.
- Construcción de índices de herramientas para plataformas de agentes: al usar la documentación JSON como unidad indexable, se puede precalcular el embedding de cada herramienta y resolver consultas en línea con muy poco coste adicional sobre el backbone.
- Asistentes de desarrollo que sugieren la API adecuada: integrado en un IDE o en un chatbot interno, el modelo traduce una descripción de tarea ("crear una factura para este cliente") en la herramienta concreta disponible en el catálogo de la organización.
- Desambiguación previa al function calling: colocar estas cabezas delante de un LLM reduce el número de herramientas que se inyectan en el prompt, lo que baja el coste en tokens y la tasa de llamadas erróneas en agentes con catálogos grandes.

## Benchmarks y rendimiento

Los resultados publicados por el autor, todos con instrucción (w/ inst) y bajo el protocolo propio de cada conjunto:

| Modelo | ToolRet NDCG@10 (micro / cat-macro) | LiveMCPBench Recall@5 | MCP-Zero top-1 |
|---|---:|---:|---:|
| Qwen3-Embedding-8B (sin cabezas) | 51,11 / 46,54 | 50,82 | 78,19 |
| + estas cabezas (torch `.pt`) | 54,03 / 47,14 | 53,03 | 79,87 |
| + estas cabezas (`.npz` numpy, float16) | 54,03 / 47,13 | 53,03 | 79,87 |

Contexto de los conjuntos: ToolRet tiene 44.453 herramientas y 7.961 consultas; LiveMCPBench tiene 525 herramientas y 94 tareas, con el nombre del servidor incluido en el texto de la herramienta; MCP-Zero tiene 2.792 herramientas y una petición escrita por un LLM por herramienta, también con el nombre del servidor en el texto. Con el backbone en FP8 (vLLM `--quantization fp8`), el autor reporta ToolRet 53,94 / 47,27, LiveMCPBench 53,48 y MCP-Zero 79,51, dentro de una o dos consultas del resultado en bf16.

## Requisitos de hardware

- Las cabezas en sí son triviales: 29,9M de parámetros, 59,8 MB en float16, y la ruta numpy no requiere torch, por lo que se ejecutan en CPU sin problema.
- El coste real está en el backbone Qwen3-Embedding-8B. En bf16 son aproximadamente 16 GB solo de pesos, más activaciones y caché, lo que en la práctica pide del orden de 18-20 GB de VRAM.
- En FP8 el backbone baja a unos 8 GB de pesos, con un consumo estimado de 10-12 GB de VRAM incluyendo overhead; el autor confirma que los resultados se mantienen prácticamente iguales.
- GPU recomendadas: A100 40/80 GB, H100, L40S o A10G para servicio en producción; RTX 4090 o RTX 3090 (24 GB) para bf16 en una sola tarjeta consumer.
- Con FP8, tarjetas consumer de 12-16 GB (RTX 4080, RTX 4070 Ti Super, RTX 4060 Ti 16 GB) podrían alojar el backbone, aunque no hay mediciones publicadas para esos casos.
- Despliegue: vLLM como servidor de embeddings (con `--quantization fp8` opcional), consumido por toolrank mediante `--emb-url` y `--emb-model`; las cabezas se cargan con `--clm-ckpt default` o apuntando al `.npz` descargado.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ToolRet NDCG@10 micro | LiveMCPBench R@5 | MCP-Zero top-1 | Licencia |
|---|---|---:|---:|---:|---:|---|
| Qwen3-Embedding-8B + cabezas toolrank | 8B + 29,9M | 8192 | 54,03 | 53,03 | 79,87 | Apache-2.0 (datos sin licencia declarada) |
| Qwen3-Embedding-8B sin cabezas | 8B | 8192 | 51,11 | 50,82 | 78,19 | Apache-2.0 |
| Qwen3-Embedding-4B | 4B | no disponible | no disponible | no disponible | no disponible | Apache-2.0 |
| Qwen3-Embedding-0.6B | 0,6B | no disponible | no disponible | no disponible | no disponible | Apache-2.0 |

La familia Qwen3-Embedding incluye variantes de 0,6B, 4B y 8B, pero en la información disponible solo hay cifras de benchmarks para la variante de 8B con y sin estas cabezas. El autor indica que usar Qwen3-Embedding-8B sin cabezas cuesta entre 1 y 3 puntos según el conjunto y ofrece procedencia de datos limpia.

## Limitaciones y advertencias

- Solo inglés: tanto las peticiones como los textos de herramientas deben estar en inglés, según declara el propio autor.
- El modelo está entrenado sobre la mezcla de tareas de ToolRet. La mejora se concentra en las tareas grandes de ToolRet y es pequeña fuera de dominio (entre +2 y +3 puntos).
- No alcanza el umbral de aceptación de ToolRet fijado por el autor (50 en cat-macro), lo que indica que la mejora, aun siendo real, queda por debajo del objetivo declarado del proyecto.
- Las cabezas solo encajan con los vectores de Qwen3-Embedding-8B; otro backbone necesita sus propias cabezas y estas no son portables.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí puede devolver una herramienta semánticamente parecida y funcionalmente incorrecta si el catálogo contiene entradas muy próximas entre sí.
- Riesgo de licencia: `mangopy/ToolRet-Training-20w` no declara licencia y sus datos provienen de benchmarks anteriores con sus propios términos. El repositorio de código de ToolRet es Apache-2.0, pero eso no cubre los datos. Los mantenedores publican las cabezas asumiendo ese riesgo; para uso comercial con procedencia limpia recomiendan usar Qwen3-Embedding-8B sin cabezas o entrenar cabezas propias.
- El modelo tiene 0 descargas y 0 likes en el momento de redactar esta ficha (creado y actualizado el 30 de septiembre de 2026), por lo que no hay validación independiente de los resultados publicados.
- Depende de una configuración de serving concreta (pooling del último token, vectores de 4096 dimensiones normalizados en L2, truncado a 8192 tokens); desviarse de ella degrada las puntuaciones sin aviso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yasinyaman/toolrank-heads-qwen3-emb-8b
- Modelo base: https://huggingface.co/Qwen/Qwen3-Embedding-8B
- Repositorio del proyecto toolrank: https://github.com/yasinyaman/toolrank
- Documentación y benchmarks de toolrank: https://yasinyaman.github.io/toolrank/
- Benchmarks detallados: https://yasinyaman.github.io/toolrank/benchmarks/
- Paquete en PyPI: https://pypi.org/project/toolrank/
- Descarga directa del checkpoint: https://huggingface.co/yasinyaman/toolrank-heads-qwen3-emb-8b/resolve/v0.1/toolrank-heads-qwen3-emb-8b-v0.1.npz
- Dataset de entrenamiento: https://huggingface.co/datasets/mangopy/ToolRet-Training-20w
- Repositorio de código de ToolRet: https://github.com/mangopy/tool-retrieval-benchmark
- Qwen3-Embedding (repositorio oficial): https://github.com/QwenLM/Qwen3-Embedding
- Informe técnico de Qwen3: https://arxiv.org/html/2505.09388v1
