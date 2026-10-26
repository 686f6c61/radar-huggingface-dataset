# uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft11200-grpo1980-lora

## Resumen

Este repositorio contiene un adaptador LoRA llamado `Qwen2.5-0.5B-Instruct-xlam-mixed-sft11200-grpo1980-lora`, publicado por el usuario uygarkurt. No es un modelo completo: es un adaptador PEFT que debe cargarse sobre `Qwen/Qwen2.5-0.5B-Instruct`, un transformer decoder-only de aproximadamente 0,49 mil millones de parámetros entrenado por Alibaba Qwen. El objetivo concreto del ajuste es el tool calling estructurado y, de forma destacada, la abstención cuando las herramientas ofrecidas no son relevantes para la consulta del usuario.

El entrenamiento se realizó en dos fases con el framework propio del autor, [Post-Training Lab](https://github.com/uygarkurt/post-training-lab): primero 11.200 actualizaciones de supervised fine-tuning (SFT) y después 1.980 actualizaciones de Group Relative Policy Optimization (GRPO) partiendo del adaptador SFT. Todo el proceso, según la model card, consumió 2,9 horas de cómputo en el bucle de entrenamiento (1,8 h de SFT y 1,1 h de GRPO), lo que da una idea del reducido coste de este tipo de experimentos sobre modelos de 0,5B.

Su relevancia práctica es acotada pero clara: demuestra que un modelo de medio billón de parámetros puede alcanzar exactitudes altas en precisión de nombre de función (97,73% en xLAM FNA) y en exactitud de llamada completa (81,07% en xLAM ETC) dentro del entorno de evaluación del autor, a costa de un rendimiento general bajo (38,07% en MMLU, 18,40% en MATH-500). Es, por tanto, una pieza para enrutamiento de herramientas y sistemas agénticos ligeros, no un modelo de propósito general. El repositorio no declara licencia y, en el momento de la consulta, registra 0 descargas y 0 likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con atención de múltiples cabezas y query grouping (GQA), heredada del modelo base Qwen2.5-0.5B-Instruct |
| Parametros totales | ~0,49 mil millones en el modelo base; el repositorio contiene únicamente los pesos del adaptador LoRA |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 32.768 tokens en el modelo base Qwen2.5-0.5B-Instruct (dato del modelo base, no verificado en este adaptador) |
| Tipos de cuantizacion | No disponible en la información proporcionada; al ser un adaptador PEFT puede fusionarse con el modelo base y cuantizarse después con herramientas estándar (GGUF, AWQ, GPTQ) |
| Idiomas soportados | Inglés (`en`), según la etiqueta de idioma del repositorio y la model card |
| Licencia | No disponible: el repositorio no declara licencia |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA, `library_name: peft`); tamaño del repo 0,0 GB |
| Modelo base | Qwen/Qwen2.5-0.5B-Instruct (relación: adapter) |
| Tipo de adaptador | LoRA (rango y alpha no disponibles) |
| Dataset de entrenamiento | uygarkurt/xlam-tool-calling-mixed |
| Etapas de entrenamiento | 11.200 updates SFT + 1.980 updates GRPO |
| Librería de carga | transformers + peft |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Qwen2.5-0.5B-Instruct: un transformer decoder-only con atención causal basada en RMSNorm para normalización, activación SwiGLU en las capas feed-forward, embeddings RoPE para la codificación posicional y atención con query grouping (GQA) para reducir el coste de la caché KV. El adaptador LoRA congela esos pesos e inserta matrices de bajo rango en las proyecciones, de modo que el artefacto publicado es de tamaño mínimo y el modelo final se obtiene al cargar el adaptador sobre el base.

El entrenamiento se hizo en dos etapas sobre el dataset mixto `uygarkurt/xlam-tool-calling-mixed`. La primera, SFT con 11.200 actualizaciones, enseña el formato de llamada a herramientas (selección de función, construcción de argumentos en JSON y respuesta en lenguaje natural cuando procede). La segunda, GRPO con 1.980 actualizaciones, aplica optimización de política con recompensas relativas dentro de grupos, orientada según el autor a reforzar el tool calling estructurado y, explícitamente, la abstención cuando las herramientas ofrecidas son irrelevantes. El adaptador SFT previo no hace falta cargarlo por separado: este repositorio ya incorpora esa fase. No se documentan el número de tokens vistos, la composición detallada del dataset, la configuración de recompensas ni si hubo DPO o RLHF adicional; toda esa información es no disponible.

## Capacidades

- Generación de llamadas a funciones en formato estructurado (nombre de función y argumentos), el núcleo del ajuste.
- Abstención ante herramientas irrelevantes: el modelo puede decidir no invocar ninguna función cuando el conjunto ofrecido no encaja con la consulta, aunque esta capacidad se degradó tras el GRPO (ver benchmarks).
- Conversación multi-turno de tipo instructivo, heredada del modelo base Qwen2.5-0.5B-Instruct.
- Selección de función entre un conjunto de herramientas candidatas (BFCL single-turn function calling).
- Razonamiento básico y matemáticas elementales, con rendimiento bajo: 38,07% en MMLU y 18,40% en MATH-500.
- Seguimiento de instrucciones limitado: 28,47% de precisión estricta a nivel de prompt en IFEval.
- Capacidades multilingües: el modelo base Qwen2.5 cubre decenas de idiomas, pero este adaptador declara únicamente inglés y no hay evaluación multilingüe en la información disponible.
- No se documentan capacidades de visión, audio, modo thinking explícito ni decodificación especulativa.

## Casos de uso

- Enrutamiento de herramientas en asistentes ligeros: recibir la consulta del usuario junto con un catálogo de funciones y devolver la llamada correcta en JSON; el 81,07% de exactitud en xLAM ETC sobre el holdout del autor lo hace viable para catálogos pequeños y bien definidos.
- Filtro de abstención previo a un modelo mayor: usar el adaptador como primera barrera que decide si la consulta requiere una herramienta del catálogo o debe derivarse a un LLM de mayor tamaño, aprovechando la evaluación de relevancia (83,33%) y el bajo coste de inferencia de 0,5B.
- Inferencia en dispositivos embebidos y edge: con pesos en torno a 1 GB en fp16 y ~0,3 GB en cuantización de 4 bits, cabe en placas tipo Raspberry Pi, dispositivos M5Stack o móviles, donde un modelo mayor no es desplegable.
- Automatización de extracción de argumentos en pipelines RPA: convertir texto libre en parámetros estructurados para APIs internas (crear ticket, consultar pedido, agendar cita) con esquemas de funciones estables.
- Pruebas y validación de pipelines agénticos en CI: al ser un adaptador de 0,0 GB y entrenar en menos de 3 horas, sirve como banco de pruebas reproducible para formateadores de tool calls y parsers antes de escalar a modelos mayores.
- Asistente de soporte interno on-premise con un catálogo cerrado de acciones: consultas de estado, reinicios de servicio o búsquedas en documentación, donde el coste por token y la latencia importan más que la profundidad de razonamiento.
- Generación de datos sintéticos de tool calling: usar el adaptador como generador barato de pares consulta-llamada para preetiquetar y luego filtrar con un modelo mayor.

## Benchmarks y rendimiento

Datos publicados en la model card. Todas las puntuaciones son porcentajes. La primera fila corresponde al adaptador SFT que inicializó el GRPO; la segunda es este adaptador.

| Checkpoint | Paso | MMLU | MATH-500 | IFEval | xLAM ETC | xLAM FNA | BFCL single-turn FC | Relevance | Irrelevance | Tiempo (h) |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Adaptador SFT inicial | SFT 11.200 | 38,36% | 16,20% | 27,36% | 79,49% | 96,81% | 54,28% | 83,33% | 72,91% | 1,8 |
| SFT + GRPO (este adaptador) | GRPO 1.980 | 38,07% | 18,40% | 28,47% | 81,07% | 97,73% | 57,25% | 83,33% | 65,33% | 2,9 |

Notas de la model card sobre la metodología: xLAM ETC es exactitud exacta de la llamada a herramienta y xLAM FNA es exactitud del nombre de función; ambas se calculan sobre el holdout de solo llamadas, con 2.287 ejemplos evaluados y 700 omitidos, no sobre el split de test del dataset mixto. BFCL single-turn FC agrega subconjuntos seleccionados de BFCL-v3 de un solo turno; Relevance e Irrelevance corresponden a los subconjuntos de relevancia seleccionados. Son agregados específicos del estudio, no cifras oficiales de los benchmarks. IFEval usa precisión estricta a nivel de prompt. Las evaluaciones xLAM se hicieron con scripts propios de Post-Training Lab.

Lectura de los datos: el GRPO mejora xLAM ETC (+1,58 puntos), FNA (+0,92) y BFCL single-turn FC (+2,97), pero empeora de forma notable la abstención ante herramientas irrelevantes (Irrelevance cae de 72,91% a 65,33%, −7,58 puntos) y deja MMLU prácticamente igual (−0,29). No hay comparación con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM para inferencia (modelo base + adaptador fusionado): ~1,0-1,1 GB en fp16, ~0,55 GB en int8 y ~0,3-0,4 GB en cuantización de 4 bits, solo para pesos.
- Caché KV: con 32.768 tokens de contexto la memoria de caché puede superar varias veces el tamaño de los pesos; para contextos largos conviene limitar `max_model_len` o usar cuantización de la caché.
- GPU recomendadas: cualquier GPU consumer con 4 GB o más sirve para fp16 sin contexto largo (GTX 1650, RTX 3050, RTX 4060, RTX 3060 12 GB); para batching y throughput, L4, A10G, A100 o H100 están sobradamente dimensionadas.
- Cabe en GPU consumer: sí, en todas las GPU modernas de 4-8 GB y en Apple Silicon (M1 o superior) por memoria unificada.
- Despliegue: transformers + peft para uso directo del adaptador; fusión del adaptador y conversión a GGUF para llama.cpp u Ollama; vLLM y TGI admiten el modelo fusionado con soporte LoRA opcional; FriendliAI aparece como opción de serving alojado para el adaptador SFT hermano.
- Latencia y throughput: no se han publicado mediciones. Por el tamaño (0,49B), en una GPU consumer se espera latencia de decenas de milisegundos por respuesta corta y throughput alto con batching; son estimaciones por tamaño, no cifras verificadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tool calling | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (SFT 11.200 + GRPO 1.980) | 0,49B (base) + LoRA | 32.768 (base) | 81,07% xLAM ETC; 97,73% FNA; 57,25% BFCL single-turn | No disponible | HuggingFace, 0 descargas |
| Adaptador SFT hermano (`...-sft11200-lora`) | 0,49B (base) + LoRA | 32.768 (base) | 79,49% xLAM ETC; 96,81% FNA; 54,28% BFCL single-turn | No disponible | HuggingFace |
| Adaptador GRPO más corto (`...-grpo1320-lora`) | 0,49B (base) + LoRA | 32.768 (base) | No disponible (sin métricas publicadas en los resultados de búsqueda) | No disponible | HuggingFace |
| Qwen/Qwen2.5-0.5B-Instruct (base) | ~0,49B | 32.768 | No disponible: sin evaluación de tool calling publicada en la información consultada | Apache 2.0 según el modelo base (no verificado en el adaptador) | HuggingFace, ModelScope, docs M5Stack |

No se dispone de datos para comparar con alternativas especializadas en tool calling de tamaño similar (por ejemplo, la familia xLAM-1B o Hammer 2.1 de 0,5B); no disponible.

## Limitaciones y advertencias

- Capacidad general muy limitada: 38,07% en MMLU, 18,40% en MATH-500 y 28,47% en IFEval. No es apto para razonamiento complejo, matemáticas ni tareas de conocimiento.
- Regresión en abstención: el GRPO redujo la precisión en el conjunto de irrelevancia del 72,91% al 65,33%, es decir, el modelo tiende más a invocar una herramienta aunque no proceda. Si la abstención es crítica, conviene validar con el adaptador SFT o añadir una capa de verificación externa.
- Riesgo de alucinación de nombres de función y argumentos: pese al 97,73% de FNA, queda un ~2,3% de errores de nombre y un ~19% de llamadas no exactas en xLAM ETC. En producción es obligatorio validar el JSON contra el esquema y gestionar fallos.
- Idiomas: solo se declara inglés; el comportamiento en castellano no está evaluado y, dado el tamaño del modelo, es previsiblemente deficiente.
- Licencia no declarada: el repositorio no incluye campo de licencia. Antes de un uso comercial hay que verificar la licencia del modelo base (Qwen2.5-0.5B-Instruct) y contactar con el autor; a día de la consulta no hay garantía explícita de uso comercial del adaptador.
- Artefacto sin validación comunitaria: 0 descargas y 0 likes, creado y actualizado en la misma marca temporal. No hay informes independientes de calidad.
- Dependencia del modelo base: es un adaptador, no un modelo autónomo; requiere descargar Qwen2.5-0.5B-Instruct y cargarlo con peft. El prompt de chat y la plantilla deben ser los del base, o el formateo de tool calls puede romperse.
- Benchmarks no oficiales: xLAM ETC, FNA y BFCL son agregados calculados con scripts propios del autor sobre subconjuntos seleccionados y con 700 ejemplos omitidos; no son comparables directamente con cifras publicadas de otros modelos.
- Sesgos: no documentados. Al heredar el modelo base y entrenarse solo con un dataset sintético de tool calling en inglés, es probable que arrastre sesgos del corpus original y que su comportamiento fuera de distribución sea frágil, pero no hay análisis disponible.
- Contexto largo: aunque el base admite 32.768 tokens, no hay evaluación de este adaptador con contextos extensos ni con catálogos de herramientas grandes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft11200-grpo1980-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/uygarkurt/xlam-tool-calling-mixed
- Framework de entrenamiento (Post-Training Lab): https://github.com/uygarkurt/post-training-lab
- Adaptador SFT de partida: https://huggingface.co/uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft11200-lora
- Variante GRPO con 1.320 updates: https://huggingface.co/uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft11200-grpo1320-lora
- Serving del adaptador SFT en FriendliAI: https://friendli.ai/models/uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft11200-lora
- Documentación del modelo base en M5Stack: https://docs.m5stack.com/en/stackflow/models/qwen2.5-0.5b-instruct
- Modelo base en ModelScope: https://www.modelscope.cn/models/qwen/Qwen2.5-0.5B-Instruct/summary
