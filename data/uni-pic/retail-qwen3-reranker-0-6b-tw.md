# UNI-PIC/retail-qwen3-reranker-0.6b-tw

## Resumen

retail-qwen3-reranker-0.6b-tw es un modelo de reranking (cross-encoder generativo) desarrollado por President Information Corp. (統一資訊, PIC) y Uni-President Information Philippines Corp. (UNI-PIPC). Se obtiene mediante fine-tuning completo de Qwen/Qwen3-Reranker-0.6B sobre un corpus propietario de busqueda de producto del comercio minorista de Taiwan en chino tradicional (zh-TW). Dado un par (consulta de comprador, titulo de producto), el modelo emite una puntuacion de relevancia; esta pensado como segunda etapa de un pipeline de recuperacion, no como sustituto del retriever denso.

El modelo resuelve un problema concreto: mejorar la precision de la busqueda de producto en catalogos de comercio electronico taiwanes, donde las consultas son cortas, mezclan marcas y tipos de producto, y alternan chino e ingles. Su tamano reducido (595.776.512 parametros, ~0,6B) y su ventana de 256 tokens lo hacen barato de ejecutar como etapa de reranking sobre los 50 candidatos devueltos por el retriever.

Es relevante ahora porque demuestra un patron practico de adaptacion de un reranker generativo pequeno a un dominio vertical con datos de juicio LLM, y porque publica una receta de mezcla de puntuaciones (reranker + retriever) que aporta aproximadamente +0,03 de nDCG@10 sobre el retriever solo en su benchmark retenido. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only generativo (Qwen3ForCausalLM), usado como reranker cross-encoder generativo (yes/no) |
| Parametros totales | 595.776.512 (~0,6B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens (longitud maxima de secuencia en entrenamiento y evaluacion) |
| Tipos de cuantizacion | no disponible (la model card no documenta cuantizaciones publicadas; al ser safetensors bf16 es convertible a GGUF/AWQ mediante herramientas externas) |
| Idiomas soportados | chino tradicional de Taiwan (zh-TW); etiqueta de idioma declarada: zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers); tamano del repo 1,2 GB |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-Reranker-0.6B, un transformer decoder-only de la familia Qwen3 configurado como reranker generativo: el modelo produce una decision si/no sobre la relevancia del par (consulta, titulo) en lugar de una cabeza de clasificacion dedicada. El fine-tuning es completo (no LoRA) en bf16, con la perdida `listwise_reranker` del framework ms-swift (`generative_reranker`), temperatura 1.0, learning rate 1e-5, 5% de warm-up, un batch efectivo de 32 grupos (4 por dispositivo x 8 acumulaciones), 1 epoca y 625 pasos sobre una unica NVIDIA H100. La longitud maxima de secuencia es de 256 tokens.

Los datos de entrenamiento son propietarios y no publicos: 20.413 grupos listwise construidos a partir de 8.560 consultas reales de compradores. Cada grupo contiene un titulo positivo y siete negativos duros procedentes de la pila de recuperacion. Un juez LLM puntua cada par con grado 0, 1 o 2; los grado-2 son positivos y los grado-0 negativos, mientras que los grado-1 nunca se usan como negativos. Se excluyen variantes casi identicas de un mismo producto como pares negativos y titulos que actuan como negativos para muchas consultas distintas. En el 70% de los grupos la consulta incluye etiquetas de palabras clave. Las consultas de evaluacion retenidas se excluyeron del entrenamiento.

## Capacidades

- Puntuacion de relevancia consulta-titulo de producto en chino tradicional (zh-TW), como cross-encoder generativo con salida si/no.
- Reranking de segunda etapa sobre candidatos de un retriever denso (disenado para los 50 primeros candidatos).
- Mezcla de puntuaciones con el retriever: la combinacion del score del reranker con el del retriever mejora el nDCG@10 en aproximadamente +0,03 frente al retriever solo en el benchmark del autor.
- Manejo de estilos de consulta tipicos de Taiwan: palabras clave cortas de marca y tipo de producto, consultas mixtas chino-ingles y consultas descriptivas, con y sin etiquetas de palabras clave.
- Escalabilidad a catalogos grandes: la ganancia de la mezcla se mantiene desde un catalogo de 39.000 titulos hasta un indice multisource de 2,2 millones de titulos.
- No soporta tool calling, agentes, vision, audio ni modo de razonamiento extendido; su funcion es exclusivamente el ranking de pares.

## Casos de uso

- Busqueda de producto en e-commerce taiwanes: tras recuperar los 50 candidatos mas probables con un retriever denso, el reranker reordena los resultados combinando su score con el del retriever, lo que segun el autor mejora el nDCG@10 en torno a +0,03.
- Refinamiento de resultados en catalogo largo: con catalogos de hasta 2,2 millones de titulos, el modelo se aplica solo a la lista corta recuperada, manteniendo el coste controlado (unos 65-70 ms de GPU por consulta para 50 candidatos en una H100).
- Busqueda con consultas de marca y tipo de producto: el entrenamiento con consultas cortas de marca y categoria, y con etiquetas de palabras clave en el 70% de los grupos, lo hace adecuado para este patron tipico de compradores taiwaneses.
- Consultas mixtas chino-ingles: al haberse entrenado con consultas que alternan idiomas, cubre busquedas del tipo marca en ingles mas categoria en chino tradicional.
- Deduplicacion y ordenacion de variantes de producto: el entrenamiento excluye variantes casi identicas como negativos, lo que reduce el riesgo de penalizar titulos muy parecidos entre si al ordenar la lista final.
- Filtrado de ruido en pipelines de recomendacion: el score de relevancia puede usarse como umbral para descartar titulos irrelevantes antes de mostrarlos, combinado con el score del retriever para evitar falsos negativos.
- Evaluacion offline de sistemas de busqueda: sirve como juez de relevancia barato para medir nDCG en experimentos A/B de recuperacion, dado su bajo coste por par.

## Benchmarks y rendimiento

La model card no publica una tabla de resultados numericos por benchmark (MMLU, HumanEval, GSM8K u otros), pero si describe el protocolo de evaluacion y los resultados relativos en su propio benchmark de recuperacion:

| Metrica / escenario | Resultado |
|---|---|
| Benchmark | Consultas reales de compradores no usadas en entrenamiento, restringidas a aquellas con al menos un producto relevante en el pool juzgado |
| Splits | Desarrollo: 1.023 consultas; test retenido: 368 consultas (puntuado una sola vez) |
| Metrica principal | nDCG@10 |
| Reranker solo vs. retriever fine-tuned | El reranker no supera por si solo al retriever fine-tuned en el catalogo de 39.000 titulos |
| Mezcla reranker + retriever | +0,03 de nDCG@10 aproximadamente frente al retriever solo |
| Rendimiento de inferencia | ~700-770 pares (consulta, titulo) por segundo en una H100 con inferencia Hugging Face bf16 estandar (batch 64, sin optimizaciones de serving) |
| Coste por consulta | ~65-70 ms de GPU para rerankear 50 candidatos |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~1,2 GB en bf16 para los pesos (595,8M parametros); con overhead de activaciones y batch pequeno, cabe holgadamente en GPUs de 8 GB o menos.
- GPU recomendadas: H100 para el throughput medido (~700-770 pares/s, batch 64); A100 y L40S como alternativas de centro de datos; cualquier GPU consumer con 8 GB o mas (RTX 3060 Ti, RTX 4060, RTX 4090) es suficiente para inferencia en bf16 o fp16.
- Cabe en GPU consumer: si, en modelos con 8 GB o mas de VRAM; en CPU es viable con cuantizacion a 8 o 4 bits, aunque sin datos publicados de latencia.
- Opciones de despliegue: transformers (referencia), vLLM y TGI para serving con batching, llama.cpp/Ollama si se convierte a GGUF; el pipeline es text-ranking con endpoints compatibles.
- Latencia y throughput: ~65-70 ms de GPU por consulta para 50 candidatos y ~700-770 pares/s en una H100 con inferencia HF bf16 sin optimizar (batch 64).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Notas |
|---|---|---|---|---|---|
| UNI-PIC/retail-qwen3-reranker-0.6b-tw | 0,6B | 256 tokens | Reranker generativo cross-encoder, dominio retail zh-TW | Apache 2.0 | Fine-tune de Qwen3-Reranker-0.6B; pensado para mezclar con retriever |
| Qwen/Qwen3-Reranker-0.6B | 0,6B | no disponible en la informacion proporcionada | Reranker generativo multilingue generalista | Apache 2.0 | Modelo base; sin adaptacion al dominio retail taiwanes |
| UNI-PIC/retail-embeddinggemma-2-tw | no disponible | no disponible | Retriever denso (bi-encoder), dominio retail zh-TW | no disponible | Primera etapa del pipeline; fine-tune de google/embeddinggemma-2; segun el autor supera al reranker solo en el catalogo de 39k titulos |

## Limitaciones y advertencias

- Dominio y idioma acotados: entrenado exclusivamente para busqueda de producto en chino tradicional de Taiwan; el rendimiento fuera de ese dominio o en chino simplificado no esta documentado.
- Ventana de 256 tokens: consultas y titulos mas largos se truncan; no es adecuado para documentos extensos ni para reranking de pasajes largos.
- No sustituye al retriever: en el catalogo de 39.000 titulos el reranker solo no supera al retriever fine-tuned; su valor esta en la mezcla de puntuaciones, y usarlo de forma aislada puede degradar resultados.
- Datos de entrenamiento propietarios y no reproducibles: no se publica el dataset ni el juez LLM utilizado, lo que limita la auditoria y la replicacion.
- Riesgo de sesgo heredado del modelo base y del juez LLM que etiqueto los datos (grados 0/1/2); no se documentan analisis de sesgo.
- Riesgo de alucinacion en la salida generativa si/no: al ser un modelo generativo, la salida debe parsearse con cuidado en produccion.
- Sin benchmarks estandar publicados (MMLU, HumanEval, GSM8K) ni evaluacion de robustez fuera del benchmark propio del autor.
- Licencia Apache 2.0: permite uso comercial sin restricciones adicionales, pero no se ofrece garantia ni soporte por parte de los autores.
- Modelo con muy poca adopcion publica (23 descargas, 0 likes en el momento de la consulta); no hay evidencia de terceros sobre su comportamiento en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/UNI-PIC/retail-qwen3-reranker-0.6b-tw
- Modelo base: https://huggingface.co/Qwen/Qwen3-Reranker-0.6B
- Retriever complementario: https://huggingface.co/UNI-PIC/retail-embeddinggemma-2-tw
- Organizacion UNI-PIC en Hugging Face: https://huggingface.co/UNI-PIC
- Web corporativa PIC: https://www.pic.net.tw/
- Web UNI-PIPC: https://www.pic.net.ph/
- Chat LumineOne AI: https://lumineai.pic.net.tw/
- GitHub del equipo de IA de PIC: https://github.com/pic-ai-team
- LinkedIn PIC: https://www.linkedin.com/company/president-information-corporation/
- LinkedIn UNI-PIPC: https://www.linkedin.com/company/uni-pipc/
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
