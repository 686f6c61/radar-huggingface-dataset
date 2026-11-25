# SZLHOLDINGS/SZL-Reasoning-0.8B-v1

## Resumen

SZL-Reasoning-0.8B-v1 es un modelo de lenguaje de 873 millones de parámetros publicado por SZLHOLDINGS, un consorcio que presenta su catálogo como un "estate" de IA gobernada con resultados auditables mediante ficheros de recibos (receipts). El modelo se construye por ajuste fino supervisado sobre SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-sft-v3, que a su vez deriva de la familia Qwen 3.5, según declara el tag de arquitectura `qwen3_5` en Hugging Face. Su propósito declarado es el razonamiento, y se distribuye con pipeline image-text-to-text, lo que sugiere capacidades multimodales de entrada imagen y texto, aunque la model card no detalla el componente de visión.

La relevancia del modelo no reside en sus cifras de rendimiento, que el propio autor declara como UNKNOWN en ausencia de evaluaciones medidas, sino en su planteamiento de trazabilidad: la tarjeta evita explícitamente afirmar cualquier número de benchmark no respaldado por un recibo con fecha. Esa honestidad declarada conviene leerla con cautela, porque el escaneo de recibos de la propia organización clasifica el repositorio como RECEIPT_FILES_NO_DONE, es decir, con ficheros de nombre sugerente pero sin el DONE.json estricto que su estándar exige como evidencia.

En la práctica, se trata de un modelo pequeño, de licencia Apache 2.0, con solo inglés declarado como idioma soportado y 607 descargas en el momento de la consulta. Resulta adecuado para experimentación local, prototipado de agentes ligeros y despliegue en hardware de consumo, pero no para producción crítica sin una evaluación independiente previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia Qwen 3.5 (tag `qwen3_5`) |
| Parametros totales | 873.438.784 |
| Parametros activos | no disponible (no se declara MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la model card; el repo solo publica safetensors (1,8 GB) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Pipeline declarado | image-text-to-text |
| Modelo base | SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-sft-v3 |
| Biblioteca | transformers |
| Tamano del repo | 1,8 GB |
| Descargas / likes | 607 / 0 |
| Fecha de creacion / actualizacion | 2026-11-06 / 2026-11-25 |

## Arquitectura y entrenamiento

La información disponible confirma únicamente que se trata de un transformer decoder-only de la familia Qwen 3.5, con 873 millones de parámetros en precisión completa y pesos en safetensors. El pipeline image-text-to-text apunta a una variante multimodal con entrada de imagen, pero la model card no especifica el encoder visual, la resolución de entrada ni cómo se fusionan las modalidades. Tampoco se documenta la longitud de contexto nativa, un dato relevante porque las variantes Qwen 3.5 suelen ofrecer ventanas amplias que aquí no se confirman.

Sobre el entrenamiento, el autor solo declara que el artefacto es el resultado de un ajuste fino supervisado (el identificador del modelo base incluye el sufijo `sft-v3`) dentro de su "governed factory". No se publican el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF, DPO o razonamiento con cadena de pensamiento reforzada. La sección de recibos indica explícitamente que cualquier afirmación de entrenamiento o evaluación no respaldada por un recibo medido debe considerarse UNKNOWN, y el escaneo estricto del 22 de noviembre de 2026 no encontró el DONE.json requerido. En consecuencia, no es posible verificar ninguna innovación técnica concreta más allá de la designación nominal como modelo de razonamiento.

## Capacidades

- Generación de texto en inglés con orientación declarada al razonamiento, aunque sin evidencia medida publicada que cuantifique esa capacidad.
- Procesamiento de entrada imagen-texto según el pipeline image-text-to-text declarado, sin detalle del alcance multimodal en la model card.
- Ajuste fino supervisado sobre un modelo base especializado en agentes de recibos (receiptagent), lo que sugiere familiaridad con flujos estructurados de extracción y validación.
- Soporte de tool calling y function calling: no disponible en la documentación.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad verificada; el nombre del modelo lo sugiere pero no se documenta.
- Capacidades multilingües: limitadas al inglés según el campo de idiomas del repositorio.
- Modo thinking explícito, visión avanzada o audio: no disponible en la información proporcionada.

## Casos de uso

- Prototipado local de asistentes conversacionales en inglés: con menos de 900 millones de parámetros, el modelo cabe en GPUs de consumo y permite iterar sobre prompts y flujos sin coste de API, aunque su calidad debe validarse caso por caso.
- Extracción estructurada de documentos: su base receiptagent sugiere uso en pipelines de lectura de recibos y facturas, combinando la entrada de imagen con la generación de texto para producir campos normalizados.
- Pruebas de concepto de razonamiento ligero: útil para comparar estrategias de prompting (cadena de pensamiento, few-shot) en un entorno controlado antes de escalar a modelos mayores.
- Filtrado y clasificación de texto a pequeña escala: el tamaño reducido permite procesar lotes en una sola GPU con latencia baja, adecuado para tareas de etiquetado o enrutamiento previo.
- Componente de un sistema multi-agente: puede actuar como nodo especializado en subtareas acotadas dentro de una orquestación mayor, dejando el razonamiento complejo a modelos de mayor tamaño.
- Educación y experimentación académica: la licencia Apache 2.0 y los pesos abiertos facilitan su uso en cursos y trabajos de investigación sobre ajuste fino y evaluación de modelos pequeños.
- Evaluación de infraestructura de despliegue: sirve como banco de pruebas para configurar vLLM, TGI o llama.cpp antes de migrar a modelos de producción de mayor tamaño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explícitamente que no se afirma ningún número más allá de lo medido en una auditoría con fecha, y el escaneo estricto de recibos del 22 de noviembre de 2026 clasifica la evidencia de evaluación como UNKNOWN al no existir un DONE.json válido.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 1,8 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 3 y 4 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: en torno a 1 GB para pesos, con margen adicional para el runtime.
- VRAM estimada en cuantización de 4 bits: alrededor de 0,5 GB para pesos; cabe holgadamente en cualquier GPU moderna.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti, RTX 4090 y superiores para mayor throughput; A100 o H100 solo tienen sentido en despliegues por lotes a gran escala.
- Cabe en GPU de consumo: sí, en cualquier tarjeta con 4 GB o más de VRAM en precisión completa y en tarjetas con 2 GB o más en cuantización de 4 bits.
- Opciones de despliegue: transformers (biblioteca declarada), vLLM y TGI para servir en GPU, llama.cpp y Ollama si se generan pesos GGUF a partir de los safetensors publicados.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| SZL-Reasoning-0.8B-v1 | 873 M | no disponible | Apache 2.0 | en | Evidencia de evaluación UNKNOWN; pipeline image-text-to-text |
| Qwen2.5-0.5B-Instruct | 494 M | 32 768 | Apache 2.0 | multilingüe | Referencia consolidada de la familia Qwen; benchmarks publicados |
| Qwen2.5-1.5B-Instruct | 1 540 M | 32 768 | Apache 2.0 | multilingüe | Mismo orden de magnitud, con evaluación pública |
| Llama 3.2 1B Instruct | 1 240 M | 131 072 | Llama 3.2 Community License | multilingüe | Contexto largo y ecosistema amplio; licencia con restricciones |

La comparación directa con las alternativas es difícil porque el modelo de SZLHOLDINGS no publica contexto ni resultados de evaluación. Frente a Qwen2.5-0.5B y 1.5B, el SZL ofrece un tamaño intermedio y una licencia Apache 2.0 sin restricciones, pero carece de la documentación y los benchmarks que hacen verificables a los modelos de Alibaba. Frente a Llama 3.2 1B, la licencia Apache 2.0 es más permisiva, aunque el contexto declarado por Meta es sustancialmente mayor.

## Limitaciones y advertencias

- Ausencia total de benchmarks verificables: la evidencia de evaluación está clasificada como UNKNOWN y el repositorio no supera el estándar estricto de recibos de la propia organización.
- Riesgo de alucinación no cuantificado: sin evaluaciones publicadas no es posible estimar la tasa de confabulación, y el propio autor incluye un barrido de confabulación en sus recibos sin resultados validados.
- Idiomas: solo se declara inglés, por lo que el rendimiento en castellano u otras lenguas es desconocido y probablemente deficiente.
- Contexto no documentado: se desconoce la ventana máxima, lo que impide planificar despliegues con documentos largos.
- Capacidad multimodal sin especificar: el pipeline image-text-to-text no viene acompañado de detalles sobre resolución, tipos de imagen o calidad del entendimiento visual.
- Licencia Apache 2.0 declarada por el operador del estate el 25 de noviembre de 2026, sin evidencia por fichero del upstream; conviene revisar la procedencia antes de un uso comercial crítico.
- Gobernanza opaca: la model card se genera de forma automática y remite a recibos y a una organización de GitHub cuya trazabilidad no se puede verificar desde el repositorio.
- Sin comunidad: cero likes y 607 descargas indican ausencia de validación independiente por parte de terceros.
- Para producción, se recomienda tratar el modelo como experimental y realizar una evaluación propia sobre el dominio objetivo antes de integrarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SZLHOLDINGS/SZL-Reasoning-0.8B-v1
- Modelo base: https://huggingface.co/SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-sft-v3
- Organización en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organización en GitHub (referenciada en la model card): https://github.com/szl-holdings
- Herramienta de generación de tarjetas (referenciada): https://github.com/szl-holdings/estate-cards
