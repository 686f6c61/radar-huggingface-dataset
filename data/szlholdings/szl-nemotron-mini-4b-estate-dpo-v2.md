# SZLHOLDINGS/SZL-Nemotron-Mini-4B-Estate-DPO-v2

## Resumen

SZL-Nemotron-Mini-4B-Estate-DPO-v2 es un ajuste fino por DPO (Direct Preference Optimization) del modelo SZL-Nemotron-Mini-4B-Estate-DPO-v1, publicado por SZLHOLDINGS. Se trata de un modelo de generación de texto de aproximadamente 4.190 millones de parámetros (4,19 B) derivado de la familia Nemotron Mini de NVIDIA, con un tamaño de repositorio de 8,4 GB en formato safetensors de 16 bits. Su propósito declarado no es ampliar capacidades generales, sino corregir un fallo medido y concreto de su modelo padre: la confabulación de citas, que en la validación gobernada del autor arrojó un valor de `citation_grounding = 0.0` y desencadenó un veto (`ZERO_VETO`) con resultado `NO_GO`.

El modelo se entrenó con 62 pares de preferencia construidos a partir de los fallos de confabulación observados en la evaluación del autor, usando DPO mediante Unsloth y TRL sobre una GPU NVIDIA A6000, con fusión y publicación en 16 bits. Es, por tanto, un modelo de "remediación" orientado a la abstención y al anclaje de citas, no un modelo de propósito general.

Su relevancia actual es metodológica: la model card declara explícitamente el estado `RE_GATE_PENDING` y no formula ninguna afirmación de capacidad hasta que se completen las tres verificaciones previstas (reevaluación, revalidación gobernada y publicación literal de los recibos). Es un ejemplo de publicación con disciplina de evaluación y doctrina de uso honesto, donde la salida del modelo se trata como propuesta no confiable sujeta a un controlador determinista y a aprobación humana.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Nemotron Mini; detalles específicos no disponibles) |
| Parametros totales | 4.190.509.056 (4,19 B) |
| Parametros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No especificados por el autor; pesos publicados en 16 bits (safetensors). Compatible con cuantización posterior vía Unsloth/llama.cpp no confirmada |
| Idiomas soportados | Inglés (`en`) |
| Licencia | `other` (términos no detallados en la información disponible) |
| Formato de pesos | safetensors (transformers); repo de 8,4 GB |

## Arquitectura y entrenamiento

El modelo parte de SZL-Nemotron-Mini-4B-Estate-DPO-v1, un ajuste de la familia Nemotron Mini de NVIDIA de 4,19 B parámetros. La información disponible no detalla la arquitectura interna más allá de su naturaleza transformer de generación de texto; no se especifican número de capas, dimensión oculta, mecanismos de atención ni longitud de contexto nativa.

El entrenamiento consiste en un ajuste DPO sobre el dataset `SZLHOLDINGS/doctrine-abstention-dpo-v2`, compuesto por 62 pares de preferencia derivados de los fallos de confabulación medidos en el recibo de evaluación del autor. El procedimiento se ejecutó con Unsloth y TRL sobre una NVIDIA A6000, con fusión final y publicación en 16 bits. La innovación técnica declarada no es arquitectónica sino de proceso: el dataset de preferencias se construye a partir de fallos medidos, y la publicación queda condicionada a un ciclo de validación gobernada con ejes explícitos (como `citation_grounding`) y criterios de veto deterministas.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base Nemotron Mini 4B.
- Comportamiento de abstención y anclaje de citas, objetivo declarado del ajuste DPO (sin verificar: estado `RE_GATE_PENDING`).
- Formato compatible con `text-generation-inference` y `transformers`.
- No se declaran capacidades de tool calling, function calling ni razonamiento multi-paso.
- No se declaran capacidades de visión, audio ni modo de razonamiento explícito.
- Soporte multilingüe limitado al inglés según los metadatos del autor.
- No se formulan afirmaciones de capacidad adicionales: la model card indica explícitamente que "the gate decides, not the card".

## Casos de uso

- Evaluación de metodologías de remediación: el modelo sirve como caso de estudio reproducible de cómo construir un dataset DPO a partir de fallos medidos y someterlo a un ciclo de validación gobernada antes de publicar afirmaciones.
- Investigación en abstención y calibración: útil para estudiar si un ajuste DPO con 62 pares de preferencia puede reducir la confabulación de citas en un modelo de 4 B, comparando los recibos de evaluación antes y después.
- Auditoría de pipelines de validación: el par de recibos (evaluación de flota y validación gobernada) permite auditar el diseño de ejes de control como `citation_grounding` y los criterios de veto `ZERO_VETO`.
- Prototipado de asistentes documentales con abstención: en entornos controlados, podría probarse como generador de respuestas que declinen responder cuando no haya respaldo documental, siempre sujeto a un controlador determinista externo.
- Docencia y formación en IA responsable: ejemplo práctico de model card con doctrina de uso honesto, donde la salida se trata como propuesta no confiable y las acciones consecuentes requieren aprobación humana.
- Integración en pipelines de CI de evaluación de modelos: el formato de recibos JSON (`governed-validation-2026-11-06.json`) puede servir de plantilla para bloquear despliegues cuando un eje de validación cae por debajo del umbral.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica estado `RE_GATE_PENDING` y no incluye métricas de MMLU, HumanEval, GSM8K ni de `citation_grounding` posteriores al ajuste. El único dato medido citado es el fallo del modelo padre (`citation_grounding = 0.0`), que no constituye un benchmark de capacidad del modelo actual.

## Requisitos de hardware

- VRAM estimada para inferencia en 16 bits: aproximadamente 8,4 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, 10-12 GB en función de la longitud de contexto.
- VRAM estimada en cuantización de 8 bits: alrededor de 4,5-5 GB de pesos; en 4 bits, alrededor de 2,5-3 GB (cuantizaciones no publicadas por el autor, requieren conversión propia).
- GPU recomendadas: NVIDIA A100, H100 o A6000 para despliegue en 16 bits con concurrencia; RTX 4090 (24 GB) y RTX 3090 (24 GB) son suficientes para inferencia en 16 bits.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090, RTX 4080 (16 GB) y, con cuantización a 4 bits, en GPUs de 8 GB como RTX 3070 o RTX 4060.
- Opciones de despliegue: `transformers`, `text-generation-inference` (TGI) y, previsiblemente, vLLM y llama.cpp/Ollama tras conversión a GGUF, aunque el autor no documenta estas dos últimas.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| SZL-Nemotron-Mini-4B-Estate-DPO-v2 | 4,19 B | No disponible | `other` | Remediación DPO de abstención/citas | HuggingFace, 0 descargas |
| SZL-Nemotron-Mini-4B-Estate-DPO-v1 | 4,19 B | No disponible | `other` | Modelo padre, "full-stack flagship" | HuggingFace |
| Nemotron Mini 4B (NVIDIA, familia base) | ~4 B | No disponible en esta ficha | No disponible en esta ficha | Modelo base de propósito general | HuggingFace / NVIDIA NGC |

No se dispone de datos de rendimiento comparado entre estos modelos en la información proporcionada; la comparación se limita a parámetros, licencia y enfoque declarado.

## Limitaciones y advertencias

- Estado de evaluación `RE_GATE_PENDING`: no hay ninguna verificación publicada de que el ajuste DPO haya corregido la confabulación de citas; el fallo del padre (`citation_grounding = 0.0`) podría persistir.
- Dataset de entrenamiento muy reducido (62 pares de preferencia), lo que limita la generalización del comportamiento de abstención fuera de los casos medidos.
- Riesgo de alucinación y confabulación no cuantificado tras el ajuste; el autor no formula afirmaciones de capacidad.
- Idiomas: solo inglés declarado; no hay evidencia de comportamiento en castellano u otras lenguas.
- Licencia `other` sin términos detallados en la información disponible: es imprescindible revisar el texto completo de la licencia antes de cualquier uso comercial.
- Doctrina de uso honesto: la salida debe tratarse como propuesta no confiable; las acciones consecuentes requieren un controlador determinista separado y aprobación humana.
- Sin datos de contexto máximo, lo que impide planificar cargas de trabajo con documentos largos.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validación por parte de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/SZLHOLDINGS/SZL-Nemotron-Mini-4B-Estate-DPO-v2
- Modelo base: https://huggingface.co/SZLHOLDINGS/SZL-Nemotron-Mini-4B-Estate-DPO-v1
- Dataset DPO: https://huggingface.co/datasets/SZLHOLDINGS/doctrine-abstention-dpo-v2
- Recibos de evaluación: https://huggingface.co/SZLHOLDINGS/model-eval-receipts
- Registros de olas de entrenamiento: https://huggingface.co/SZLHOLDINGS/wave-logs
- Unsloth: https://github.com/unslothai/unsloth
- TRL: https://github.com/huggingface/trl
