# Tamkimd/tamev-small-modernbert

## Resumen

TAMEV-Small-ModernBERT es un modelo de clasificación de texto desarrollado por el usuario Tamkimd, construido sobre el backbone encoder `answerdotai/ModernBERT-base` y publicado bajo licencia Apache 2.0. Cuenta con 149.407.488 parámetros (149,21 M) y se distribuye en formato safetensors con código personalizado. No es un modelo generativo: recibe un estado, una pregunta y una lista de opciones, y devuelve una distribución de probabilidad calibrada sobre esas opciones, siguiendo el protocolo que el autor denomina "System One Decision Intelligence".

El problema que aborda es el enrutamiento y la selección entre alternativas discretas en pipelines de agentes: elección categórica (`choice`), confianza booleana probabilística (`noul`) y escalas ordinales (`score`). Frente a los LLM autoregresivos, que el autor sitúa en 500-2000 ms por llamada y que pueden fallar la validación de esquemas JSON, este modelo declara una latencia mediana de 57,53 ms y 13,9 req/s en un solo hilo. Su principal innovación técnica es una cabecera bilineal simétrica que garantiza invariancia exacta al orden de las opciones, con una deriva de permutación declarada de 0,00000000 y una tasa de cambio de decisión del 0,00 %.

Su relevancia práctica reside en el coste: al ser un encoder de 149 M de parámetros con un artefacto INT8 de 142,3 MB, puede ejecutarse en CPU y en dispositivos de borde, lo que lo hace candidato a primera etapa de filtrado barato antes de invocar un LLM grande. Conviene ser prudente, eso sí: el repositorio no tiene descargas ni valoraciones, las métricas están declaradas por el autor y no verificadas, y el benchmark utilizado es propio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder; backbone `answerdotai/ModernBERT-base` con cabecera bilineal simétrica de puntero para puntuar opciones |
| Parametros totales | 149.407.488 (149,21 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | FP32 (pesos de 569,2 MB) e INT8 (artefacto de 142,3 MB); los tags del repositorio mencionan ademas artefactos ONNX, CoreML y MLX |
| Idiomas soportados | en (ingles) y multilingual (el tag multilingual no se detalla) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, con codigo personalizado (`custom_code`); tags adicionales: ONNX, CoreML, MLX |

Datos adicionales declarados en la model card: temperatura calibrada de 10,0 y hardware objetivo "CPU de nube, estación de trabajo, servidor con GPU". Tamaño del repositorio: 0,6 GB.

## Arquitectura y entrenamiento

La arquitectura parte de ModernBERT, un encoder bidireccional presentado en el paper *Smarter, Better, Faster, Longer: A Modern Bidirectional Encoder for Fast, Memory Efficient, and Long Context Finetuning and Inference*. Sobre ese backbone, TAMEV añade una cabeza de decisión con doble codificación desacoplada y una puntuación bilineal simétrica: la puntuación de cada candidato se calcula como el producto escalar entre la proyección de la consulta (`W_q c`) y la proyección de la opción (`W_k o_i`), normalizado por la raíz de la dimensión. Al no introducir posición en las opciones, la puntuación es invariante a su orden, lo que elimina el sesgo de recencia que el autor atribuye a los modelos autoregresivos. El coste de evaluar K opciones escala de forma lineal, O(K), lo que permite manejar espacios de acciones de cardinalidad alta (el autor cita K=77 o más) sin truncar la secuencia ni disparar la atención cuadrática.

En cuanto al entrenamiento, la model card no detalla el número de tokens, la composición exacta del dataset ni si hubo fases de RLHF o DPO. Los datasets listados en la ficha del modelo son `legacy-datasets/banking77`, `google/boolq`, `fancyzhx/ag_news`, `nyu-mll/multi_nli`, `SetFit/sst5`, `Yelp/yelp_review_full`, `CogComp/trec`, `fancyzhx/dbpedia_14`, `SetFit/amazon_reviews_multi_en` y `stanfordnlp/imdb`, lo que sugiere un entrenamiento orientado a clasificación de intenciones, inferencia de lenguaje natural, análisis de sentimiento, clasificación temática y comparación de pares. El autor menciona explícitamente una calibración de temperatura aplicada sobre las salidas (valor 10,0), de la que dependen las métricas de ECE y Brier reportadas.

## Capacidades

- Selección categórica (`choice`) entre un conjunto de opciones, devolviendo probabilidades calibradas por opción.
- Confianza booleana probabilística (`noul`) para preguntas de sí/no con umbral de riesgo ajustable.
- Puntuación ordinal (`score`) sobre rúbricas, útil para escalas graduadas.
- Invariancia exacta al orden de las opciones: la puntuación no cambia al permutar los candidatos.
- Filtrado de candidatos mediante top-3, declarado con un 95,09 % de acierto en el benchmark del autor.
- Routing de herramientas y de agentes (tags `llm-router`, `agent-routing`).
- Clasificación de texto de dominio general, gracias a los diez datasets de entrenamiento listados (intenciones bancarias, noticias, reseñas, temas, NLI).
- Despliegue en borde y en CPU sin acceso a red (tags `edge-ai`, `zero-shot`).
- Idiomas: inglés declarado; el tag `multilingual` aparece en los metadatos, pero la model card no detalla la cobertura real por idioma.
- No se declaran capacidades de generación de texto libre, visión, audio, tool calling nativo en formato JSON ni modo de razonamiento explícito.

## Casos de uso

- Enrutamiento de herramientas en agentes: dado el estado de la conversación y la lista de herramientas disponibles, el modelo devuelve la probabilidad de cada una en una sola pasada de encoder, con lo que se puede invocar primero la más probable y usar el top-3 como respaldo si la confianza cae por debajo de un umbral.
- Triaje de tickets de soporte bancario: los datasets de entrenamiento incluyen `banking77`, de modo que el modelo puede asignar un incidente a colas de servicio concretas (por ejemplo, desbloqueo por viaje, disputa por fraude, consulta de cargos) antes de que un humano lo lea.
- Prefiltrado previo a un LLM: al resolver en decenas de milisegundos, puede descartar candidatos en pipelines RAG o de agentes y reservar la llamada al LLM grande solo para los casos ambiguos, reduciendo coste por token.
- Clasificación de sentimiento y temática en reseñas: `yelp_review_full`, `imdb`, `SetFit/sst5` y `amazon_reviews_multi_en` están entre los datasets declarados, lo que lo hace adecuado para moderación de opiniones o enrutamiento de reseñas negativas a equipos de retención.
- Inferencia en dispositivo de borde: con 142,3 MB en INT8, cabe en móviles, navegadores o equipos industriales sin GPU, con los artefactos CoreML, ONNX y MLX mencionados en los tags.
- Validación de decisión en formularios o flujos guiados: puntuar opciones de una rúbrica (`score`) para priorizar incidencias por severidad, aprovechando la calibración declarada (ECE 0,0506) para fijar umbrales de riesgo.
- Enrutamiento de consultas en asistentes internos: elegir entre documentación, soporte técnico o facturación a partir de una consulta breve, con coste prácticamente nulo en comparación con un modelo generativo.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index, sobre el "TAMEV Multi-Domain Benchmark Suite" (suite propia, no un estándar de la comunidad). Ninguno de los valores está marcado como verificado (`verified: false`) en la información proporcionada.

| Metrica | Resultado declarado | Nota |
|---|---|---|
| Top-1 accuracy | 70,65 % | Suite de evaluación propia del autor |
| Top-3 accuracy | 95,09 % | Filtrado de candidatos |
| Expected Calibration Error (ECE) | 0,0506 | Calibración declarada, temperatura 10,0 |
| Brier score | 0,3919 | Puntuación propia estricta de calibración |
| Latencia mediana (p50) | 57,53 ms | 13,9 req/s en un solo hilo |
| Latencia percentil 95 (p95) | 210,95 ms | Declarado como SLA determinista en tiempo real |
| Deriva de permutación | 0,00000000 | 0,00 % de tasa de cambio de decisión |

No se han publicado en la información disponible resultados en benchmarks estándar (MMLU, HumanEval, GSM8K, GLUE, SuperGLUE, MTEB u otros), ni comparaciones numéricas verificables frente a modelos alternativos.

## Requisitos de hardware

- Peso de los pesos en FP32: 569,2 MB; en INT8: 142,3 MB.
- VRAM estimada para inferencia: por debajo de 2 GB en FP32 una vez añadidos activaciones y el runtime de PyTorch; por debajo de 1 GB en INT8. Cifras estimadas, no publicadas por el autor.
- Cabe en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090 y similares, con un uso de VRAM muy inferior a su capacidad.
- Funciona en CPU sin GPU; la model card indica como objetivo "CPU de nube, estación de trabajo, servidor con GPU", lo que sugiere que el diseño prioriza el despliegue en CPU.
- GPUs de centro de datos (A100, H100) no son necesarias; se pueden usar, pero quedarían infrautilizadas para un modelo de este tamaño.
- Opciones de despliegue: `transformers` con `trust_remote_code=True`, y artefactos ONNX, CoreML y MLX según los tags. No se confirma compatibilidad con vLLM, TGI, llama.cpp u Ollama en la información disponible.
- Latencia y throughput declarados: 57,53 ms de mediana (p50), 210,95 ms en el percentil 95 y 13,9 req/s en un solo hilo.

## Comparativa con modelos similares

La información disponible no incluye especificaciones ni resultados de los modelos que la model card cita como competidores (TypeSafe Jev, Kev, Laya, SemIf), por lo que no se pueden comparar parámetros, contexto o licencia. Se comparan a continuación el modelo y su backbone, con los datos disponibles.

| Modelo | Parametros | Contexto | Resultado declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TAMEV-Small-ModernBERT | 149,41 M | no disponible | Top-1 70,65 % / Top-3 95,09 % en suite propia | Apache 2.0 | HuggingFace, 0 descargas |
| ModernBERT-base (backbone) | no disponible | no disponible | no disponible | no disponible | HuggingFace |
| BERT-base (referencia histórica del encoder) | no disponible | no disponible | no disponible | no disponible | HuggingFace |
| TypeSafe Jev, Kev, Laya, SemIf (citados como competidores) | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Las métricas proceden del propio autor, están marcadas como no verificadas y se miden sobre una suite de evaluación propia, no sobre un benchmark estándar de la comunidad; no son directamente comparables con resultados publicados de otros modelos.
- El repositorio presenta 0 descargas y 0 valoraciones, por lo que no existe validación independiente del comportamiento en producción.
- El rendimiento declarado del 70,65 % en top-1 implica un 29,35 % de errores de primera opción; en enrutamiento automático conviene usar el top-3 (95,09 %) o un umbral de confianza antes de actuar sin supervisión.
- El inglés es el único idioma confirmado en el entrenamiento; el tag `multilingual` no viene acompañado de detalle de cobertura, por lo que no se debe asumir un rendimiento fiable en castellano sin evaluarlo.
- La longitud de contexto no se especifica en la información disponible; la ausencia de este dato impide dimensionar casos con estados de entrada largos.
- El uso requiere `trust_remote_code=True` y carga código personalizado del repositorio, lo que implica revisar el código antes de ejecutarlo en entornos con datos sensibles.
- Las afirmaciones de compatibilidad total ("100 % TypeSafe Jev compatible") y las comparaciones con productos de terceros son marketing del autor y no están respaldadas por datos en la información disponible.
- La calibración (ECE 0,0506) depende de la temperatura fijada en 10,0; si se reentrena, se ajusta el umbral o se cambia el conjunto de opciones, la calibración debería recalibrarse y validarse de nuevo.
- Los metadatos de fecha del repositorio (creación el 25-09-2026, actualización ese mismo día) resultan inconsistentes con un uso real en producción y refuerzan la necesidad de cautela.
- La model card proporcionada está truncada, por lo que no se dispone de las secciones completas de uso, limitaciones declaradas por el autor ni instrucciones de despliegue.
- Licencia Apache 2.0: permite uso comercial y modificación, siempre que se conserve el aviso de licencia y se documenten los cambios; no incluye garantías.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Tamkimd/tamev-small-modernbert
- Backbone: https://huggingface.co/answerdotai/ModernBERT-base
- Repositorio GitHub de TAMEV (citado en la model card): https://github.com/tamkimd/tamev
- Paper de ModernBERT (arXiv): https://arxiv.org/abs/2412.13663
- Paper de ModernBERT (ACL Anthology): https://aclanthology.org/2025.acl-long.127/
- Repositorio GitHub de ModernBERT: https://github.com/AnswerDotAI/ModernBERT
- Colección ModernBERT en HuggingFace: https://huggingface.co/collections/lightonai/modernbert-67adcc36b4d53331c35533b3
- Dataset banking77: https://huggingface.co/datasets/legacy-datasets/banking77
- Dataset BoolQ: https://huggingface.co/datasets/google/boolq
- Dataset AG News: https://huggingface.co/datasets/fancyzhx/ag_news
- Dataset MultiNLI: https://huggingface.co/datasets/nyu-mll/multi_nli
- Dataset SST-5: https://huggingface.co/datasets/SetFit/sst5
- Dataset Yelp Review Full: https://huggingface.co/datasets/Yelp/yelp_review_full
- Dataset TREC: https://huggingface.co/datasets/CogComp/trec
- Dataset DBpedia 14: https://huggingface.co/datasets/fancyzhx/dbpedia_14
- Dataset Amazon Reviews Multi (EN): https://huggingface.co/datasets/SetFit/amazon_reviews_multi_en
- Dataset IMDB: https://huggingface.co/datasets/stanfordnlp/imdb
