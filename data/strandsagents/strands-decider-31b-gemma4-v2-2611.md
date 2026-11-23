# StrandsAgents/strands-decider-31B-gemma4-v2-2611

## Resumen
Strands Decider 31B es un modelo de decisión para IA agéntica desarrollado por el equipo Strands Decider de Strands Labs. No es un modelo generativo al uso: parte de `google/gemma-4-31B-it` y se ha afinado para recibir un estado (texto o JSON, opcionalmente con imágenes) junto con una o varias preguntas tipadas (`choice` de 2 a 255 opciones, `noul` sí/no, `score` de 2 a 10 niveles) y devolver, en una sola pasada y sin generar texto, una probabilidad calibrada para cada opción. Esto lo convierte en un componente específico para enrutado, clasificación y puntuación dentro de pipelines de agentes.

Con 30,7B parámetros (31.273.088.876 según los pesos en safetensors), es el mayor de los cinco modelos de la familia Strands Decider v2 y el más preciso. Frente al mayor de la v1 (26B-A4B) mejora 22,7 puntos en el Decision Index 0.3, con una brecha media de calibración de 0,7 puntos entre confianza y acierto. Está publicado bajo licencia Apache-2.0 y su relevancia actual radica en que sustituye la generación libre por decisiones estructuradas y calibradas, algo que encaja mejor en sistemas agénticos que necesitan elegir entre opciones de forma fiable.

El modelo está pensado para ejecutarse en una única GPU de 80 GB en bf16, con un contexto validado de 32.768 tokens (ampliable hasta 131.072) y latencias declaradas de 99 ms para una pregunta y 614 ms para 30 preguntas sobre un mismo estado en una NVIDIA H100.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Gemma 4 instruction-tuned, `google/gemma-4-31B-it`); no disponible el detalle interno de capas y cabezas |
| Parametros totales | 31.273.088.876 (30,7B según el autor) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens validados (límite por defecto); hasta 131.072 |
| Tipos de cuantizacion | No disponible (el autor solo publica pesos en bf16) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (63 GB en bf16) |

## Arquitectura y entrenamiento
El modelo se construye sobre `google/gemma-4-31B-it`, un transformer decoder-only de 30,7B parámetros, y se afina para una tarea de decisión estructurada. La innovación principal no está en la arquitectura de red sino en la interfaz y el objetivo: en lugar de generar texto, el modelo recibe un estado y un conjunto de preguntas tipadas con sus opciones, y produce en una sola pasada una distribución de probabilidad sobre cada conjunto de opciones. Las preguntas y opciones viajan en la propia petición, de modo que el mismo modelo responde a una decisión nueva sin reentrenamiento.

El autor no detalla en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon RLHF o DPO. Sí se documenta que la familia v2 se compone de cinco modelos (E2B, E4B, 12B, 26B-A4B y 31B) que comparten el mismo formato de petición y respuesta, lo que permite cambiar de tamaño modificando solo el nombre del modelo. El foco declarado del ajuste es la calibración: la confianza devuelta debe aproximarse a la precisión real, con una brecha media de 0,7 puntos.

## Capacidades
- Clasificación y decisión estructurada: elección entre 2 y 255 opciones (`choice`), respuestas sí/no (`noul`) y puntuación en escalas ordenadas de 2 a 10 niveles (`score`).
- Salida de probabilidad calibrada por opción, sin generación de texto libre.
- Entrada multimodal: acepta estado en texto o JSON y, opcionalmente, imágenes.
- Múltiples preguntas por estado en una sola pasada (el autor reporta 30 preguntas sobre un mismo estado).
- Cambio de decisión sin reentrenamiento: las preguntas y opciones se especifican en cada petición.
- Interfaz de línea de comandos mediante el paquete `strands-decider` (`strands-decider ask ...`).
- Integración en pipelines agénticos como componente de enrutado y puntuación.
- Capacidad multilingüe: no disponible; el modelo declara únicamente inglés.
- No se documentan tool calling, function calling ni modos de razonamiento multi-step en la información disponible.

## Casos de uso
- Enrutado de tickets de soporte: enviar el texto del ticket como estado y una pregunta `choice` con los equipos posibles (por ejemplo, billing, sales, retail) para obtener la probabilidad de cada destino; la calibración permite fijar umbrales y derivar a revisión humana los casos de baja confianza.
- Triaje de urgencia: usar preguntas `noul` del tipo "¿transmite urgencia?" y `score` sobre una escala de frustración para priorizar la cola de atención; el ejemplo de la model card con un mensaje sobre pagos fallidos ilustra exactamente este flujo.
- Moderación y clasificación de contenido: preguntas `choice` con categorías de política y `score` de gravedad, aprovechando la salida probabilística para decidir entre acción automática y revisión.
- Puntuación de calidad en pipelines de datos: evaluar respuestas o documentos con escalas `score` de 2 a 10 niveles para filtrar o rankear antes de un entrenamiento o de una indexación.
- Decisión con contexto largo: analizar documentos de hasta 32.768 tokens (ampliable a 131.072) y responder varias preguntas tipadas sobre el mismo estado en una sola pasada, con la latencia de 614 ms para 30 preguntas que reporta el autor en H100.
- Enrutado multimodal: al aceptar imágenes junto al estado, puede clasificar capturas o documentos escaneados con las mismas preguntas tipadas.
- Componente de un agente Strands: sustituir la generación libre por decisiones calibradas en los puntos de bifurcación del agente, cambiando de tamaño (E2B a 31B) sin cambiar el código de integración.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index (no verificados, `verified: false`):

| Benchmark | Tarea | Resultado |
|---|---|---|
| Decision Index 0.3 | text-classification | 71,5 |
| JevBench | text-classification | 93,1 |
| OpenDecisions | text-classification | 92,2 |
| DecisionPivot | text-classification | 84,3 |
| BEV | text-classification | 84,5 |

El autor indica además una mejora de 22,7 puntos en el Decision Index 0.3 respecto a Strands Decider v1 26B-A4B y una brecha media de calibración de 0,7 puntos entre confianza y precisión. En latencia declara 99 ms por pregunta y 614 ms para 30 preguntas sobre un mismo estado en una NVIDIA H100. No se han publicado en la información disponible resultados de benchmarks estándar de LLM (MMLU, HumanEval, GSM8K) para este modelo.

## Requisitos de hardware
- VRAM estimada: 63 GB de pesos en bf16; se necesita una GPU con 80 GB de memoria según el autor.
- GPU recomendadas: una NVIDIA H100 de 80 GB (referencia de latencia del autor); cualquier GPU de 80 GB (A100 80 GB, H100) es el objetivo declarado.
- GPU de consumo: no cabe en GPU de consumo; los 63 GB en bf16 superan la VRAM de una RTX 4090 (24 GB) y de cualquier tarjeta consumer actual.
- Disco: 63 GB para los pesos; el repositorio completo ocupa 125,1 GB.
- Software: Python 3.11 o superior y el paquete `strands-decider` (`pip install strands-decider`).
- Opciones de despliegue: la librería oficial `strands-decider` con CLI; no se documentan en la información disponible integraciones con vLLM, llama.cpp, Ollama o TGI, ni formatos GGUF.
- Latencia y throughput: 99 ms por pregunta y 614 ms para 30 preguntas sobre un estado en H100, según el autor.

## Comparativa con modelos similares

Comparación dentro de la familia Strands Decider v2, según los datos del autor:

| Modelo | Base | Parametros | Pesos bf16 | GPU objetivo | Nota |
|---|---|---|---|---|---|
| E2B | gemma-4-E2B-it | 2,3B efectivos (5,1B con embeddings) | 10,3 GB | Una GPU de 24 GB o sin GPU | El más pequeño |
| E4B | gemma-4-E4B-it | 4,5B efectivos (8B con embeddings) | 16 GB | Una GPU de 40 GB | Intermedio pequeño |
| 12B | gemma-4-12B-it | 11,95B | 24 GB | Una GPU de 48 GB | Intermedio |
| 26B-A4B | gemma-4-26B-A4B-it | 25,2B, 3,8B activos (128 expertos) | 52 GB | Una GPU de 80 GB | MoE, muchas preguntas por estado |
| 31B (este) | gemma-4-31B-it | 30,7B | 63 GB | Una GPU de 80 GB | El más preciso |

Frente a alternativas externas de clasificación o enrutado (por ejemplo, clasificadores BERT o modelos generativos con salida JSON), no se dispone en la información proporcionada de comparaciones directas de rendimiento, contexto o licencia; por tanto, la comparativa externa se considera no disponible.

## Limitaciones y advertencias
- Idioma: solo declara inglés; el rendimiento en castellano u otros idiomas no está documentado y no debería asumirse.
- Sesgos: no se documentan análisis de sesgo en la información disponible; al derivar de Gemma 4 hereda los sesgos del modelo base, no cuantificados aquí.
- Alucinación: al no generar texto libre, el riesgo de alucinación textual es bajo, pero las probabilidades pueden estar mal calibradas en dominios alejados de los datos de entrenamiento; el autor reporta una brecha media de 0,7 puntos, no una garantía por caso.
- Contexto: 32.768 tokens validados; el límite de 131.072 se menciona como ampliable pero no validado.
- Licencia: Apache-2.0 permite uso comercial, pero conviene revisar también las condiciones del modelo base `google/gemma-4-31B-it`.
- Benchmarks no verificados: todos los resultados del model-index tienen `verified: false`; son cifras declaradas por el autor y deben tratarse con cautela.
- Madurez: el repositorio tiene 3 descargas y 1 like en el momento de la consulta, lo que indica adopción muy temprana y poca validación externa.
- Producción: requiere una GPU de 80 GB, lo que limita el despliegue; no se documentan cuantizaciones ni soporte en runtimes de inferencia habituales.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/StrandsAgents/strands-decider-31B-gemma4-v2-2611
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Repositorio de código: https://github.com/strands-labs/strands-decider
- Organización Strands Labs: https://github.com/strands-labs
- Documentación: https://strandsagents.com/docs/labs/strands-decider/overview/
- Regla de nombres: https://github.com/strands-labs/strands-decider/blob/main/docs/naming.md
- Familia de modelos: https://huggingface.co/StrandsAgents
- Modelo E2B: https://huggingface.co/StrandsAgents/strands-decider-E2B-gemma4-v2-2611
- Modelo E4B: https://huggingface.co/StrandsAgents/strands-decider-E4B-gemma4-v2-2611
- Modelo 12B: https://huggingface.co/StrandsAgents/strands-decider-12B-gemma4-v2-2611
- Modelo 26B-A4B: https://huggingface.co/StrandsAgents/strands-decider-26B-A4B-gemma4-v2-2611
