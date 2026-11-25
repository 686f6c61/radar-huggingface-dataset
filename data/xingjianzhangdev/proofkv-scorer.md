# XingjianZhangDev/ProofKV-scorer

## Resumen

ProofKV-scorer es un componente central del sistema ProofKV, presentado en el paper *ProofKV: Compiling Complete Evidence Chains into Reusable KV Memory for Structured-Evidence QA* (Findings of EACL 2027) por Xingjian Zhang (Carnegie Mellon University). No es un modelo generativo, sino un cross-encoder de selección de evidencia que puntúa spans de un documento en relación con una pregunta y las relaciones ordenadas entre pares de spans, para construir cadenas de evidencia que se prefilan en la memoria KV de un decodificador.

El modelo parte de `microsoft/MiniLM-L12-H384-uncased` (12 capas, 384 dimensiones ocultas, unos 33M de parámetros) y añade tres cabezas: una cabeza de inicio y otra de fin que puntúan cada span candidato frente a la pregunta, y una cabeza de enlace de nueve vías que clasifica pares ordenados de spans en ocho etiquetas de relación más `none`. El objetivo es permitir que un decodificador de 7B a 14B parámetros responda preguntas multi-hop prellenando únicamente las cadenas de evidencia que caben en un presupuesto de bytes de KV, en lugar de procesar el documento completo.

Su relevancia práctica radica en que ataca el coste de contexto largo en QA documental: reduce el material que entra en la KV cache sin perder la cadena de evidencia que sostiene la respuesta. El repositorio incluye dos checkpoints (`proofkv_scorer_final` y `proofkv_scorer_musique_replay_v6`), el codigo de entrenamiento y evaluacion, y digests SHA-256 para verificar la integridad de los pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder transformer (MiniLM-L12) con tres cabezas: start, end y link de 9 vías |
| Parametros totales | ~33M (encoder MiniLM-L12-H384-uncased más cabezas) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 320 tokens de entrada máxima durante entrenamiento; longitud de contexto de inferencia no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (encoder) + PyTorch `.pt` (cabezas) + tokenizer y metadatos JSON |
| Modelo base | microsoft/MiniLM-L12-H384-uncased |
| Tamaño del repositorio | 0.3 GB |
| Checkpoints incluidos | `proofkv_scorer_final`, `proofkv_scorer_musique_replay_v6` |

## Arquitectura y entrenamiento

El scorer es un cross-encoder de 12 capas y 384 dimensiones ocultas inicializado desde MiniLM-L12-H384-uncased. Sobre la representación del encoder se montan tres cabezas: dos de tipo span (inicio y fin) que puntúan cada span candidato contra la pregunta, y una cabeza de enlace de nueve clases que puntúa pares ordenados de spans (ocho etiquetas de relación más `none`). Esta combinación permite componer cadenas de evidencia tipadas en lugar de seleccionar pasajes aislados.

El entrenamiento usa los splits de entrenamiento de HotpotQA, 2WikiMultiHopQA y MuSiQue, junto con cadenas de evidencia generadas, en una secuencia de etapas de replay descritas en el apéndice C del paper. Cada etapa emplea AdamW con learning rate 2e-5, weight decay 0.01, batch size 48, gradient clipping 1.0 y longitud máxima de entrada de 320. La pérdida de cada cabeza suma a su término de clasificación un término de evidencia positiva (peso 0.5), un término de presupuesto (0.05) y un término de calibración (0.2). La última etapa del checkpoint final procesó 730.723 decisiones de entrenamiento (8.000 ejemplos de HotpotQA, 4.000 de 2WikiMultiHopQA, 4.000 de MuSiQue y 4.000 generados; una época, 3.807 pasos, semilla 307). La etapa de MuSiQue-replay vio 922.211 decisiones (4.000 HotpotQA, 4.000 2WikiMultiHopQA, 8.000 MuSiQue y 4.000 generados; una época, 9.607 pasos, semilla 101). El peso de interpolación (0.90 sobre la etapa v8) y la política de selección se eligieron sobre validación de HotpotQA y desarrollo de MuSiQue; el checkpoint de MuSiQue-replay se evaluó una sola vez sobre 500 preguntas de test reservadas de MuSiQue.

## Capacidades

- Puntuación de spans de evidencia contra una pregunta mediante cabezas de inicio y fin.
- Clasificación de relaciones ordenadas entre pares de spans en ocho etiquetas más `none`, lo que permite construir cadenas de evidencia tipadas.
- Selección de evidencia bajo un presupuesto de bytes de KV cache, con términos de pérdida específicos de presupuesto y calibración.
- Composición de cadenas de evidencia completas para QA multi-hop sobre documentos.
- Integración con decodificadores de 7B a 14B parámetros como etapa de prellenado selectivo de la KV cache.
- Soporte de enrutamiento por margen (margin router) para decidir cuándo usar la evidencia seleccionada y cuándo volver al contexto completo.
- Funcionamiento como selector en pipelines de recuperación iterativa (evaluado en los análisis de MuSiQue-replay).
- No soporta tool calling, agentes ni generación de texto: es un componente de scoring, no un modelo generativo.
- Solo inglés.

## Casos de uso

- QA multi-hop sobre documentos: el scorer selecciona la cadena de spans que conecta la pregunta con la respuesta y el decodificador solo prellena esa cadena, reduciendo el coste de KV cache en preguntas que requieren combinar varios hechos (HotpotQA, 2WikiMultiHopQA, MuSiQue).
- QA documental de contexto largo: en las versiones LongBench de HotpotQA, 2WikiMultiHopQA, MuSiQue, Qasper y MultiFieldQA-en, el scorer permite ajustar el material prellenado a un presupuesto de bytes fijo, lo que hace viable responder sobre documentos extensos con decodificadores de 7B-14B.
- Construcción de índices de evidencia reutilizables: el documento se lee una vez y se indexa; el scorer compone cadenas específicas por pregunta, de modo que un mismo índice sirve para múltiples consultas sobre el mismo corpus.
- Sistemas de QA con trazabilidad: al seleccionar spans concretos, el sistema puede mostrar la evidencia utilizada y mantener una ruta de vuelta al contexto completo mediante el margin router, lo que facilita la auditoría de respuestas.
- Investigación en compresión de KV cache: sirve como baseline reproducible para comparar estrategias de compresión (el paper incluye una comparación con compresores) y para estudiar intervenciones de enlace a igualdad de bytes.
- Enrutamiento y serving: el scorer puede decidir en tiempo de inferencia si una consulta necesita la cadena de evidencia o puede resolverse con el contexto completo, lo que permite optimizar latencia y memoria en un servidor de QA.
- Evaluación de selectores de evidencia: los checkpoints y los registros de resultados permiten reproducir tests de selector reservados (MuSiQue) y análisis de descomposición de gaps y recuperación iterativa.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card menciona que el paper evalúa los checkpoints en HotpotQA, 2WikiMultiHopQA, MuSiQue y las versiones LongBench de estos más Qasper y MultiFieldQA-en, con decodificadores abiertos de 7B a 14B, y que incluye transferencia a Qwen2.5-14B, contextos empaquetados con distractores, intervenciones de enlace a igualdad de bytes, comparación con compresores, enrutamiento, serving y transferencia entre decodificadores, pero no proporciona las cifras en el texto disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene ~33M parámetros; en fp32 ocupa aproximadamente 130 MB y en fp16 unos 66 MB, sin contar activaciones ni el decodificador al que acompaña.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre para el scorer; el coste real lo determina el decodificador de 7B-14B que se use junto a él (A100, H100, RTX 4090, etc.).
- Cabe en GPU de consumo: sí, el scorer por sí solo cabe en cualquier GPU consumer moderna (RTX 3060 en adelante) e incluso en CPU para cargas pequeñas.
- Opciones de despliegue: el paquete `proofkv` con `TypedRelationScorer.load_checkpoint(...)` sobre PyTorch; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI para este componente.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Función | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ProofKV-scorer | ~33M | 320 tokens de entrada en entrenamiento | Cross-encoder de selección de evidencia y relaciones | MIT | Hugging Face + GitHub |
| microsoft/MiniLM-L12-H384-uncased | ~33M | 512 tokens (modelo base) | Encoder general para embeddings y clasificación | MIT | Hugging Face |
| Cross-encoders de reranking (p. ej. familia BGE reranker) | variable, no disponible | no disponible | Reranking de pasajes | variable | Hugging Face |

La comparación directa con rerankers genéricos no está cuantificada en la información disponible; la diferencia funcional es que ProofKV-scorer añade una cabeza de enlace tipada entre spans, orientada a construir cadenas de evidencia y no solo a ordenar pasajes.

## Limitaciones y advertencias

- Solo inglés: no se ha entrenado ni evaluado en otros idiomas.
- Está diseñado para preguntas cuya respuesta se determina por una cadena corta de spans; no es adecuado para QA que requiera razonamiento sobre el documento completo sin estructura de evidencia.
- No es un modelo generativo: no produce texto, no soporta tool calling ni comportamiento de agente.
- Longitud máxima de entrada de 320 tokens durante el entrenamiento, lo que limita el tamaño de los spans y del contexto que maneja directamente.
- Riesgo de selección errónea de evidencia: si el scorer elige una cadena incompleta o incorrecta, el decodificador prellena material insuficiente; el paper propone un margin router para mitigar este caso volviendo al contexto completo.
- Los checkpoints se evaluaron con decodificadores de 7B a 14B; el comportamiento con modelos de otros tamaños no está documentado en la información disponible.
- El checkpoint de MuSiQue-replay se evaluó una sola vez sobre 500 preguntas reservadas, lo que limita la robustez estadística de sus resultados.
- Uso previsto acotado a reproducción del paper e investigación en selección de evidencia y construcción de memoria KV; no se documentan garantías para producción.
- Licencia MIT, que permite uso comercial, pero el modelo base MiniLM también es MIT y no se detallan restricciones adicionales.

## Enlaces

- Hugging Face: https://huggingface.co/XingjianZhangDev/ProofKV-scorer
- Repositorio de código: https://github.com/XingjianZhang-dev/ProofKV
- Registros de resultados (dataset): https://huggingface.co/datasets/XingjianZhangDev/ProofKV
- Paper (PDF): https://github.com/XingjianZhang-dev/ProofKV/blob/main/paper/proofkv_eacl2027.pdf
- Release v1.0.0: https://github.com/XingjianZhang-dev/ProofKV/releases/tag/v1.0.0
- Modelo base: https://huggingface.co/microsoft/MiniLM-L12-H384-uncased
