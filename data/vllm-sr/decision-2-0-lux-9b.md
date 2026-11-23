# vllm-sr/Decision-2.0-Lux-9B

## Resumen

Decision-2.0-Lux-9B es un modelo de decisión estructurada desarrollado por el equipo de vLLM Semantic Router (organización vllm-sr). No es un modelo generativo al uso: recibe un estado de entrada (texto libre o JSON) junto con una batería de preguntas tipadas (elección entre opciones, sí/no o puntuación en una escala) y devuelve, en una única pasada forward, una probabilidad para cada respuesta posible sin generar texto. Está afinado a partir de Decision-1.0-Lux-9B y se presenta como la versión 2.0 de la familia Decision.

El modelo resuelve un problema muy concreto en el enrutamiento semántico y la clasificación operativa: tomar decisiones rápidas y deterministas sobre peticiones (a qué equipo derivar un ticket, si un cliente cumple un requisito, cuánta urgencia tiene un caso) con latencia de milisegundos y salida probabilística auditable. Su relevancia actual radica en que sustituye a clasificadores ad hoc y a llamadas a LLM generativos para tareas de decisión, reduciendo coste y latencia.

Cuenta con 7.940 millones de parámetros, una longitud de contexto de 16.384 tokens y licencia Apache-2.0. La model card reporta 68,1 en JevArena y una latencia mediana de 18,4 ms por petición de una sola pregunta en una única GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con cabecera de decisión (custom_code), no disponible el detalle exacto |
| Parametros totales | 7,94B (7.940 millones) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | 16.384 tokens |
| Tipos de cuantizacion | no disponible (el repo publica safetensors en precisión original) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repo de 18,0 GB, requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

La información disponible confirma que se trata de un fine-tune de Decision-1.0-Lux-9B con relación `base_model_relation: finetune`, empaquetado con código personalizado (`custom_code`) y consumible mediante `transformers>=5.17`. El modelo expone un método `system_one(state, questions)` que procesa simultáneamente preguntas de tres tipos (choice, noul —sí/no— y score) sobre un mismo estado, devolviendo probabilidades por opción en una sola pasada forward. La nomenclatura "system-one" sugiere una inspiración en razonamiento de sistema 1 (respuesta rápida e intuitiva) frente a la deliberación de sistema 2, aunque la model card no detalla la arquitectura interna más allá de la etiqueta `system-one`.

No se especifican en la información proporcionada el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon RLHF, DPO u otras técnicas de alineación. La model card menciona que los datos de entrenamiento fueron auditados a nivel de fila contra todos los ítems de test del Jev Decision Index, lo que indica una preocupación explícita por evitar contaminación en la evaluación. Tampoco se detallan innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Clasificación zero-shot con etiquetas definidas en tiempo de inferencia mediante criterios descriptivos, sin reentrenamiento.
- Preguntas de elección múltiple (`choice`) con probabilidad por cada opción.
- Preguntas booleanas (`noul`, sí/no) con probabilidad asociada.
- Preguntas de puntuación (`score`) sobre una escala ordinal definida por el usuario.
- Respuesta conjunta de múltiples preguntas heterogéneas sobre un mismo estado en una única pasada forward.
- Extracción de características (`feature-extraction`) y uso como codificador para pipelines de clasificación.
- Entrada en texto libre o JSON estructurado.
- Salida probabilística calibrada por opción, apta para umbrales y lógica de enrutamiento posterior.
- No genera texto: no es un modelo conversacional ni de razonamiento en lenguaje natural.
- Soporte de tool calling / function calling: no disponible (no aplica al diseño del modelo).
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Enrutamiento de tickets de soporte: dado el texto de una incidencia, el modelo decide en una sola pasada a qué equipo derivarla (devoluciones, facturación, técnico) con una probabilidad por equipo, lo que permite umbrales de confianza y escalado a revisión humana cuando la probabilidad máxima es baja. La latencia de 18,4 ms por pregunta lo hace viable en línea.
- Triaje de urgencia: usando preguntas de tipo `score` sobre una escala (rutina, pronto, hoy), se puede priorizar una cola de atención al cliente con criterios explícitos y auditables, sin depender de un LLM generativo.
- Verificación de requisitos en formularios: preguntas `noul` del tipo "¿el cliente aporta recibo?", "¿la solicitud incluye identificación?" permiten validar automáticamente expedientes antes de pasarlos a un agente humano.
- Moderación y política de contenido: clasificación zero-shot de textos o JSON contra un conjunto de políticas definidas como criterios, devolviendo la política más probable y su probabilidad para decidir bloqueo, revisión o paso.
- Gatekeeping en pipelines de agentes: actuar como router previo que decide si una consulta debe ir a un modelo grande, a una herramienta concreta o a una respuesta cacheada, reduciendo coste al evitar llamadas a LLM generativos en casos triviales.
- Clasificación de documentos y correos entrantes: etiquetado de correos o documentos JSON contra categorías de negocio definidas en tiempo de inferencia, sin necesidad de un dataset etiquetado ni de reentrenar.
- Extracción de señales para sistemas de decisión: usar las probabilidades de salida como features de un modelo posterior (scoring de riesgo, ranking) gracias a la salida `feature-extraction`.

## Benchmarks y rendimiento

| Modelo | JevArena ↑ | Human-labelled transfer ↑ | Jev Decision Index ↑ |
|---|---:|---:|---:|
| Decision-2.0-Lux-9B | 68,1 | 56,2 | 46,3 |
| Decision 1.0 Lux | 65,8 | 55,8 | 43,5 |
| Nimble v2 | 62,1 | 53,6 | no disponible |

Según la model card, "Human-labelled transfer" es la mediana de macro-F1 sobre 15 tareas etiquetadas por humanos (multiplicada por 100), y todos los modelos responden a los mismos prompts congelados con el mismo criterio de puntuación; las respuestas ausentes o inválidas cuentan como errores. La comparativa del Jev Decision Index corresponde a una reproducción independiente con el kit oficial 0.2.1 sobre los pesos publicados; para el resto de modelos, a una instantánea pública del board del 28 de septiembre de 2026. No se publican resultados de MMLU, HumanEval, GSM8K ni benchmarks generativos, lo cual es coherente con que el modelo no genere texto.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión original (safetensors de 18,0 GB): aproximadamente 18-20 GB solo para pesos, más overhead de activaciones y contexto; se recomienda al menos 24 GB para contexto corto y 40-80 GB para aprovechar los 16.384 tokens.
- GPU recomendadas: A100 40/80 GB, H100, L40S o A10G 24 GB para despliegues en servidor; en consumer, RTX 4090 (24 GB) o RTX 3090 (24 GB) para contexto moderado.
- Cabe en GPU consumer de 24 GB en precisión original con contexto limitado; para contextos largos o mayor throughput conviene cuantización, aunque no se publican pesos GGUF ni cuantizados en la información disponible.
- Opciones de despliegue: `transformers>=5.17` con `trust_remote_code=True` (vía `AutoModel.from_pretrained` o `pipeline("decision", ...)`). No se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la información proporcionada; el nombre del autor (vllm-sr) sugiere integración con vLLM Semantic Router, pero no se detalla.
- Latencia: mediana de 18,4 ms por petición de una sola pregunta en una única GPU, según la model card. El throughput no se especifica; al responder varias preguntas en una sola pasada forward, el coste marginal por pregunta adicional es bajo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | JevArena | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Decision-2.0-Lux-9B | 7,94B | 16.384 | 68,1 | Apache-2.0 | Hugging Face (vllm-sr) |
| Decision 1.0 Lux | no disponible (9B por nombre) | no disponible | 65,8 | no disponible | Hugging Face (vllm-sr) |
| Nimble v2 | no disponible | no disponible | 62,1 | no disponible | no disponible |

No se dispone de datos de parámetros, contexto ni licencia de Nimble v2 en la información proporcionada. La comparativa se limita a los modelos reportados en la model card; no se han identificado en la información disponible otros modelos de decisión estructurada comparables.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, razonamiento en lenguaje natural ni respuestas conversacionales; usarlo como LLM dará resultados incorrectos.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código personalizado del autor; conviene auditar el código antes de desplegarlo en producción.
- Idiomas soportados no declarados: no hay garantía de comportamiento correcto fuera del inglés (los ejemplos de la model card están en inglés).
- Riesgo de calibración deficiente en dominios alejados de los datos de entrenamiento; las probabilidades deben validarse contra un conjunto etiquetado propio antes de fijar umbrales.
- Sesgos: no se documentan evaluaciones de sesgo demográfico, geográfico o de otro tipo; al ser un clasificador, puede heredar sesgos de los datos de entrenamiento no auditados públicamente.
- Riesgo de alucinación en sentido estricto bajo (no genera texto), pero puede asignar alta confianza a opciones incorrectas cuando el estado de entrada es ambiguo o está fuera de distribución.
- La ventana de 16.384 tokens limita el tamaño del estado de entrada; estados muy largos deben truncarse o resumirse, con pérdida de información.
- Restricciones de licencia: Apache-2.0 permite uso comercial, modificación y redistribución con atribución y conservación del aviso de licencia; no se especifican restricciones adicionales.
- Los benchmarks reportados (JevArena, Jev Decision Index) son propios del ecosistema del autor; no hay validación independiente publicada más allá de la reproducción del Jev Decision Index mencionada en la model card.
- El pipeline `zero-shot-classification` declarado puede no reflejar exactamente la interfaz `system_one`; conviene revisar la documentación del código personalizado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vllm-sr/Decision-2.0-Lux-9B
- Modelo base: https://huggingface.co/vllm-sr/Decision-1.0-Lux-9B
- Colección Decision 2.0: https://huggingface.co/collections/vllm-sr/decision-20-6ab7cf7bdfb506bf8269cb00
- Repositorio vLLM Semantic Router: https://github.com/vllm-project/semantic-router
- Licencia Apache-2.0: https://huggingface.co/vllm-sr/Decision-2.0-Lux-9B/blob/main/LICENSE
