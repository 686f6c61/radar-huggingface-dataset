# yuvytung/F2LLM-v2-160M

## Resumen

F2LLM-v2-160M es el miembro mas pequeno de la familia F2LLM-v2, un conjunto de modelos de embeddings multilingues de proposito general desarrollado por CodeFuse. La familia cubre ocho tamanos distintos, desde 80M hasta 14B parametros, y esta entrenada sobre una mezcla curada de 60 millones de ejemplos publicos de alta calidad, con soporte declarado para mas de 200 idiomas y enfasis explicito en lenguas de recursos medios y bajos que suelen quedar desatendidas por otros modelos.

El repositorio que analizamos aqui, yuvytung/F2LLM-v2-160M, es una conversion a formato GGUF del modelo base codefuse-ai/F2LLM-v2-160M, realizada con la herramienta Unsloth y orientada a su uso con llama.cpp y llama-cpp. El modelo pesa 159.185.024 parametros y ocupa 1,9 GB en el repositorio, que incluye diez variantes de cuantizacion.

Es relevante ahora porque ofrece una opcion muy ligera para tareas de recuperacion semantica y busqueda multilingue, ejecutable incluso en CPU, y porque forma parte de una familia que, segun la informacion disponible, situa a su version de 14B en primera posicion en 11 benchmarks MTEB. No obstante, existe una discrepancia notable: la model card del repositorio GGUF describe un uso conversacional (llama-cli) y lo etiqueta como qwen3, mientras que el modelo base de CodeFuse es un modelo de embeddings, no generativo. Esta inconsistencia debe tenerse en cuenta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el modelo base es un transformer de embeddings; el repo GGUF esta etiquetado como qwen3) |
| Parametros totales | 159.185.024 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 41K tokens (segun llmboard.ai; no confirmado en la model card) |
| Tipos de cuantizacion | BF16, F16, Q2_K_L, Q3_K_M, Q4_0, Q4_1, Q4_K_M, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | mas de 200 (informacion del modelo base) |
| Licencia | no disponible |
| Formato de pesos | GGUF (el modelo base usa safetensors) |

## Arquitectura y entrenamiento

El modelo base pertenece a la familia F2LLM-v2, definida por CodeFuse como una coleccion de modelos de embeddings multilingues de proposito general. Se entreno sobre un compuesto curado de 60 millones de ejemplos publicos de alta calidad, con cobertura de mas de 200 idiomas y atencion especial a idiomas de recursos medios y bajos. No se especifica en la informacion disponible la arquitectura interna exacta (numero de capas, dimension del modelo, mecanismo de atencion) ni si se aplicaron tecnicas de ajuste como RLHF o DPO.

La conversion a GGUF fue realizada por el usuario yuvytung mediante Unsloth. El repositorio generado incluye diez variantes de cuantizacion, desde BF16 y F16 (mayor fidelidad numerica) hasta Q2_K_L (maxima compresion). La model card de la conversion ofrece comandos de uso con `llama-cli` y `llama-mtmd-cli` con la opcion `--jinja`, lo que sugiere una intencion de uso generativo o conversacional, en contraste con la naturaleza de embeddings del modelo original de CodeFuse. No se documenta en el repositorio ningun proceso adicional de entrenamiento o ajuste que justifique ese cambio de comportamiento.

## Capacidades

- Generacion de embeddings de texto para recuperacion semantica y similitud, segun la definicion del modelo base.
- Multilingue: soporte declarado para mas de 200 idiomas, con especial cobertura de idiomas de recursos medios y bajos.
- Uso orientado a sentence-transformers en el modelo original (codificacion de texto a vectores).
- El repositorio GGUF incorpora la etiqueta "conversational" y comandos de `llama-cli`, lo que apunta a un posible uso como modelo de generacion, aunque esto no esta confirmado ni documentado tecnicamente.
- Compatibilidad con llama.cpp / llama-cpp y con el ecosistema de cuantizaciones GGUF.
- No hay informacion disponible sobre tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio.

## Casos de uso

- Busqueda semantica en aplicaciones locales: el modelo puede generar embeddings de documentos y consultas en un equipo sin GPU, gracias a su tamano de 159M parametros y a las cuantizaciones Q4/Q5 que ocupan menos de 120 MB.
- Recuperacion aumentada (RAG) ligera: puede actuar como codificador de contexto en pipelines de generacion aumentada cuando se prioriza el coste y la latencia sobre la precision maxima, aprovechando su soporte multilingue.
- Deduplicacion y agrupamiento de documentos: sus embeddings permiten agrupar documentos similares o detectar duplicados en corpus grandes con coste computacional minimo.
- Clasificacion de texto por similitud: se puede usar la distancia entre embeddings y prototipos de clase para tareas de clasificacion (por ejemplo, filtrado de spam o etiquetado de tickets) sin entrenar un modelo adicional.
- Sistemas multilingues de atencion al cliente: la cobertura de mas de 200 idiomas lo hace util para enrutar consultas escritas en idiomas minoritarios hacia el equipo o la respuesta adecuada.
- Preprocesado en pipelines de NLP: como primer paso para indexar un corpus antes de aplicar un modelo de generacion mayor, reduciendo el volumen de datos que debe procesar el modelo grande.
- Prototipado e investigacion: al ser pequeno y desplegable en CPU, sirve para validar arquitecturas de recuperacion y comparar con modelos de embeddings mayores antes de escalar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para la variante GGUF de yuvytung en la informacion disponible. Para el modelo base, la informacion recogida indica lo siguiente:

| Metrica | Valor | Fuente |
|---|---|---|
| Ranking MTEB | La version F2LLM-v2-14B queda primera en 11 benchmarks MTEB | arXiv 2603.19223 |
| Embedding score (160M) | 55,6 | llmboard.ai |
| Cobertura de benchmarks | 85% / 5 familias de benchmarks | llmboard.ai |
| Ventana de contexto | 41K tokens | llmboard.ai |

No se proporcionan cifras desglosadas por tarea (por ejemplo, retrieval, clasificacion o clustering) ni comparaciones directas con otros modelos de embeddings en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de los 159M parametros y del tipo de cuantizacion, son valores aproximados):
  - BF16 / F16: en torno a 320 MB.
  - Q8_0: en torno a 170 MB.
  - Q6_K: en torno a 130 MB.
  - Q5_K_M: en torno a 115 MB.
  - Q4_K_M / Q4_0 / Q4_1: en torno a 90-100 MB.
  - Q3_K_M: en torno a 80 MB.
  - Q2_K_L: en torno a 55 MB.
- Cabe en cualquier GPU de consumo, incluidas GTX 1650, RTX 3050, RTX 4090 o integradas modernas, y tambien se puede ejecutar en CPU.
- Opciones de despliegue: llama.cpp (llama-cli, llama-mtmd-cli), Ollama y cualquier runtime compatible con GGUF. Para el modelo base de embeddings, sentence-transformers.
- No se dispone de datos de latencia ni de throughput medidos para este repositorio concreto.
- El repositorio completo ocupa 1,9 GB, pero solo es necesario descargar la cuantizacion deseada.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de embeddings en la informacion proporcionada. Como referencia interna de la propia familia F2LLM-v2, esta version de 160M es la segunda mas pequena de las ocho disponibles (rango de 80M a 14B), y la version de 14B es la que acumula los primeros puestos en MTEB.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| F2LLM-v2-160M (este) | 159M | 41K tokens (no confirmado) | no disponible | GGUF en HuggingFace |
| F2LLM-v2-80M | ~80M | no disponible | no disponible | HuggingFace / ModelScope |
| F2LLM-v2-14B | 14B | no disponible | no disponible | HuggingFace / ModelScope |
| Modelos de embeddings de terceros | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido, lo que supone un riesgo legal para entornos de produccion.
- Discrepancia en la documentacion: la model card del repositorio GGUF describe un uso conversacional y lo etiqueta como qwen3, mientras que el modelo base de CodeFuse es un modelo de embeddings. No esta claro si la conversion mantiene el comportamiento de embeddings, si lo altera o si las etiquetas son erroneas.
- El repositorio registra 0 descargas y 0 likes, por lo que no cuenta con validacion de la comunidad ni con casos de uso verificados.
- Contexto: la cifra de 41K tokens proviene de una fuente externa (llmboard.ai) y no aparece confirmada en la model card oficial.
- Al tratarse de una conversion no oficial, no se garantiza la fidelidad numerica respecto al modelo original, especialmente en cuantizaciones agresivas como Q2_K_L y Q3_K_M.
- No hay informacion sobre sesgos, tasas de alucinacion ni comportamiento en dominios especificos; se recomienda evaluar en el caso de uso concreto antes de desplegarlo.
- Las capacidades multilingues declaradas (mas de 200 idiomas) corresponden al modelo base y no se han verificado en la version GGUF.

## Enlaces

- Repositorio GGUF: https://huggingface.co/yuvytung/F2LLM-v2-160M
- Modelo base en HuggingFace: https://huggingface.co/codefuse-ai/F2LLM-v2-160M
- Modelo base en ModelScope: https://www.modelscope.cn/models/codefuse-ai/F2LLM-v2-160M
- Paper (arXiv): https://arxiv.org/html/2603.19223
- Ficha en llmboard.ai: https://www.llmboard.ai/models/codefuse-ai-f2llm-v2-160m
- Conversion relacionada de 0.6B: https://huggingface.co/yuvytung/F2LLM-v2-0.6B
- Unsloth (herramienta de conversion): https://github.com/unslothai/unsloth
