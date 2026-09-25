# Tamkimd/tamev-micro-minilm

## Resumen

TAMEV-Micro-MiniLM es un modelo de clasificación de texto desarrollado por Tamkimd, publicado bajo licencia Apache 2.0 y orientado a lo que el autor denomina "System One Decision Intelligence": un motor de decisión rápido, determinista y con probabilidades calibradas que actúa como alternativa a los LLM generativos en tareas de enrutamiento, selección categórica y puntuación. Frente a un LLM autorregresivo (descrito por el autor como "System Two", con latencias de 500-2000 ms por llamada), este modelo se presenta como una pieza de inferencia ligera, offline y de bajísima latencia, pensada para ejecutarse en CPU, dispositivos móviles y hardware de borde.

El modelo se construye sobre el backbone `sentence-transformers/all-MiniLM-L6-v2` (arquitectura encoder, 22.762.368 parámetros activos) al que se añade una cabeza de decisión con doble codificación desacoplada y un cabezal bilineal simétrico. Su rasgo técnico distintivo es la invarianza exacta a permutaciones: el orden de las opciones candidatas no altera la decisión, eliminando el sesgo de recencia típico de los modelos autorregresivos. Empaquetado en FP32 ocupa 86,8 MB y en INT8 apenas 21,7 MB, con exportaciones a safetensors, ONNX, CoreML y MLX.

Es relevante en el contexto de los sistemas de agentes y pipelines de enrutamiento, donde se necesita un componente barato y calibrado que decida entre un conjunto de acciones o "queues" antes de invocar un LLM caro. Sus métricas declaradas (66,52% Top-1, 90,85% Top-3, ECE 0,0499 y latencia mediana de 8,12 ms) están sin verificar de forma independiente y se miden sobre un benchmark propietario del propio autor, por lo que deben tomarse como resultados autoinformados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder transformer (backbone all-MiniLM-L6-v2) con cabeza de decisión bilineal simétrica |
| Parámetros totales | 22.762.368 (22,76 M) |
| Parámetros activos | No aplica (no es MoE); 22,76 M activos |
| Longitud de contexto | No disponible (el autor menciona escalado lineal O(K) sobre el número de candidatos K, no una longitud de contexto tokenizada) |
| Tipos de cuantización | FP32 (86,8 MB) e INT8 (21,7 MB); exportaciones ONNX, CoreML y MLX |
| Idiomas soportados | Inglés (en) y multilingüe |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (también ONNX, CoreML, MLX); requiere `trust_remote_code=True` |
| Temperatura calibrada | 1,06 |
| Librería | transformers |
| Pipeline | text-classification |
| Tamaño del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

El modelo es un encoder de tipo transformer basado en `sentence-transformers/all-MiniLM-L6-v2`, una red de 6 capas y dimensión oculta 384 (aproximadamente 22,7 M de parámetros), a la que se superpone una cabeza de decisión específica. El autor describe un esquema de "codificación dual desacoplada" con un cabezal bilineal simétrico mediante el cual la puntuación de cada candidato se calcula como el producto interno entre una proyección de la consulta (query) y una proyección de la opción, normalizado: Score(c, o_i) = (W_q·c)^T (W_k·o_i) / √d. Esta formulación garantiza equivarianza exacta a permutaciones, es decir, el resultado no cambia si se reordena la lista de opciones (deriva de permutación declarada de 0,00000000 y tasa de cambio de decisión del 0,00%).

El modelo está diseñado para evaluar espacios de acciones de cardinalidad alta mediante un presupuesto de tokens dedicado y escalado lineal O(K), de modo que puede puntuar 77 o más candidatos sin truncamiento de secuencia ni el coste cuadrático de la atención sobre concatenaciones largas. La model card menciona una temperatura de calibración de 1,06, aplicada para que las probabilidades de salida sean fiables (ECE bajo). En cuanto a los datos, la model card lista diez conjuntos de evaluación/entrenamiento: banking77, boolq, ag_news, multi_nli, sst5, yelp_review_full, trec, dbpedia_14, amazon_reviews_multi_en e imdb. No se especifica el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo fases de RLHF o DPO; al tratarse de un modelo encoder de decisión y no de un modelo generativo, el ajuste por preferencias humanas no resulta aplicable de la forma habitual.

## Capacidades

- Clasificación de texto y selección categórica: evalúa una consulta (state) frente a un conjunto de opciones y devuelve la mejor candidata, con modos `choice` (selección categórica), `noul` (confianza booleana probabilística) y `score` (escalado ordinal tipo rúbrica).
- Probabilidades calibradas: las puntuaciones de confianza están calibradas (ECE declarado de 0,0499) para usarse como umbrales de riesgo en decisiones automatizadas.
- Invarianza a permutaciones: la decisión no depende del orden de presentación de las opciones.
- Enrutamiento de LLM y de agentes (llm-router, agent-routing): pensado como componente de decisión previo a la invocación de modelos generativos o de herramientas.
- Escalado a espacios de acciones grandes: soporta K = 77 o más candidatos con coste lineal O(K).
- Multilingüe: declarado soporte de inglés y multilingüe, aunque la mayor parte de los datasets citados son en inglés.
- Capacidades de clasificación de texto genéricas: análisis de sentimiento, clasificación de temas, inferencia de lenguaje natural y clasificación de intenciones (según los datasets citados).
- No incluye generación de texto, razonamiento autoregresivo, visión, audio ni tool calling generativo; su función es decidir, no generar.

## Casos de uso

- Enrutamiento de incidencias en atención al cliente: dado el texto de una queja o consulta, el modelo selecciona la cola o el departamento correcto (por ejemplo, `verify_travel_unblock` frente a `file_fraud_dispute`) entre decenas de opciones, con latencia de milisegundos y probabilidad calibrada para decidir si se escala a un humano.
- Pre-enrutado de LLM (LLM router): en una arquitectura con varios modelos generativos, TAMEV-Micro-MiniLM decide primero qué modelo o herramienta invocar, reduciendo el coste por token al evitar llamadas a LLM caros para decisiones triviales.
- Selección de herramientas en agentes: como paso previo al tool calling, el modelo elige la herramienta adecuada entre un catálogo amplio (K ≥ 77) sin sufrir sesgo de orden en la lista de herramientas disponibles.
- Clasificación de intenciones en asistentes conversacionales: asignar la intención del usuario sobre un conjunto cerrado de acciones, útil para sistemas de diálogo y bots con SLA de tiempo real.
- Moderación y triaje de contenido: clasificación de reseñas, tickets o mensajes en categorías predefinidas (sentimiento, tema, toxicidad aproximada) sobre datasets como yelp_review_full, imdb o sst5.
- Despliegue en borde y dispositivos móviles: al ocupar 21,7 MB en INT8 y requerir hardware mínimo, puede ejecutarse offline en teléfonos (CoreML/ANE), Apple Silicon (MLX) o robots, sin dependencia de la nube ni coste de API.
- Filtrado de candidatos previo a validación: con una Top-3 del 90,85%, el modelo actúa como primera etapa que reduce candidatos para una etapa posterior más costosa.
- Automatización industrial y robótica: decisiones rápidas y deterministas en bucles de control donde una latencia de 8,12 ms y una p95 de 31,79 ms son aceptables.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (model-index), medidos sobre el benchmark propietario "TAMEV Multi-Domain Benchmark Suite". Están marcados como no verificados (`verified: false`).

| Métrica | Resultado | Notas |
|---|---|---|
| Top-1 accuracy | 66,52% | Tarea "System One Decision Intelligence" |
| Top-3 accuracy | 90,85% | Filtrado fiable de candidatos |
| Brier score | 0,4244 | Puntuación de calibración propia (strictly proper) |
| ECE (error de calibración esperado) | 0,0499 | Umbral de riesgo para tool calling |
| Deriva de permutación | 0,00000000 | Tasa de cambio de decisión del 0,00% |
| Latencia mediana (p50) | 8,12 ms | Sobre hardware de consumo |
| Latencia percentil 95 (p95) | 31,79 ms | Garantía de SLA en tiempo real |
| Throughput (un solo hilo) | 98,3 req/s | Concurrencia en un único hilo |

El autor compara estos valores con una etiqueta genérica ("SOTA para router System One de clase Micro") y cita modelos competidores denominados TypeSafe Jev, Kev (de Jared Palmer), Laya y SemIf, pero no se aportan cifras de benchmark de esos modelos en la información disponible. No se publican resultados de benchmarks estándar de la industria (MMLU, HumanEval, GSM8K u otros) para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en INT8 (21,7 MB de artefacto) y alrededor de 90 MB en FP32 (86,8 MB de pesos); cabe holgadamente en cualquier GPU.
- GPU recomendadas: no requiere GPU dedicada. Puede ejecutarse en CPU de consumo, Apple Silicon (Neuron Engine/ANE mediante CoreML y MLX) y hardware móvil. GPUs tipo RTX 4090, A100 o H100 no son necesarias y quedarían sobredimensionadas.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo e incluso sin GPU; el objetivo declarado de hardware es CPU de borde, ANE móvil, Apple Silicon y robots.
- Opciones de despliegue: `transformers` con `trust_remote_code=True`, exportación e inferencia en ONNX, CoreML y MLX; el repositorio está marcado como compatible con endpoints.
- Latencia y throughput: latencia mediana de 8,12 ms y p95 de 31,79 ms; 98,3 solicitudes por segundo en un solo hilo (datos autoinformados sobre hardware de consumo no especificado).

## Comparativa con modelos similares

No se dispone de datos de benchmark de los modelos competidores citados por el autor (TypeSafe Jev, Kev, Laya, SemIf), por lo que la comparación cuantitativa no está disponible. Como referencia de la misma categoría de tamaño y tarea se incluye el backbone del que deriva.

| Modelo | Parámetros | Contexto | Top-1 declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TAMEV-Micro-MiniLM | 22,76 M | No disponible (escalado O(K) sobre candidatos) | 66,52% (benchmark propietario) | Apache 2.0 | HuggingFace |
| all-MiniLM-L6-v2 (backbone) | ~22,7 M | 512 tokens (SentenceTransformers) | No disponible | Apache 2.0 | HuggingFace |
| TypeSafe Jev / Kev / Laya / SemIf | No disponible | No disponible | No disponible | No disponible | Citados en la model card, sin datos accesibles |

La comparación directa con alternativas de la misma categoría (routers de decisión "System One") no es posible con la información disponible, ya que los modelos citados no presentan métricas públicas verificables en las fuentes consultadas.

## Limitaciones y advertencias

- Resultados no verificados: todas las métricas del model-index están marcadas como `verified: false` y proceden de un benchmark propietario del propio autor ("TAMEV Multi-Domain Benchmark Suite"), no reproducible de forma independiente.
- Precisión modesta: una Top-1 del 66,52% implica que aproximadamente un tercio de las decisiones son incorrectas en primera opción; conviene usarlo con Top-3 o combinado con validación posterior.
- No es un modelo generativo: no produce texto libre, no hace razonamiento multi-paso ni tool calling generativo; su función es clasificar y decidir.
- Sesgos: al entrenarse sobre datasets mayoritariamente en inglés (yelp, imdb, ag_news, trec, boolq, sst5, multi_nli), puede presentar sesgos de dominio y de idioma; el soporte multilingüe está declarado pero no está respaldado por datasets multilingües en la información disponible.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de sobrerrespuesta o confianza mal calibrada fuera de la distribución de entrenamiento; el ECE declarado (0,0499) corresponde a su propio benchmark y podría no mantenerse en otros dominios.
- Idiomas: aunque se declara "multilingüe", el grueso de los datos citados es en inglés; el rendimiento en castellano no está documentado.
- Licencia: Apache 2.0 permite uso comercial, modificación y redistribución, siempre que se conserve el aviso de licencia y las atribuciones; conviene verificar la licencia del backbone (all-MiniLM-L6-v2, Apache 2.0).
- Código remoto: requiere `trust_remote_code=True`, lo que implica ejecutar código definido por el autor; debe auditarse antes de usarlo en producción.
- Model card incompleta: el README proporcionado está truncado y las referencias a modelos competidores (TypeSafe Jev, Kev, Laya, SemIf) no aportan datos verificables; las afirmaciones de superioridad ("SOTA") no están respaldadas por terceros.
- Adopción mínima: 0 descargas y 0 "likes" en HuggingFace en el momento de la ficha, lo que reduce la validación por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Tamkimd/tamev-micro-minilm
- Backbone de referencia (all-MiniLM-L6-v2): https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- Repositorio GitHub del proyecto TAMEV: https://github.com/tamkimd/tamev
- Sitio del autor Tamkimd: http://tamkimd.com/
- Perfil GitHub del autor: https://github.com/tamkimd/
- Repositorio auxiliar del autor (FlexiAIAgent): https://github.com/tamkimd/
