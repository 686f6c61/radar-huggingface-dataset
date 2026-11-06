# workmagicio/workmagic-jev-decision-qwen3-8b-sft-v1

## Resumen

WorkMagic JEV Decision Qwen3-8B SFT v1 es un ajuste fino supervisado (SFT) del modelo Qwen/Qwen3-8B desarrollado por workmagicio. No es un modelo conversacional generalista, sino un "readout" de decisiones tipadas: recibe un prompt estructurado con un estado, una pregunta, un conjunto de opciones y una respuesta restringida a una letra, y emite la letra de la opción elegida en una sola pasada hacia delante. El modelo se distribuye como adaptador LoRA sobre la base Qwen3-8B y se carga mediante la librería `anyjev`, que expone una interfaz `Tacit` con el método `decide`.

El interés del modelo radica en su enfoque: en lugar de generar texto libre, se especializa en seleccionar entre opciones discretas, lo que lo hace adecuado para tareas de clasificación, respuesta a preguntas de opción múltiple y enrutamiento de decisiones en pipelines. El entrenamiento utiliza únicamente particiones de entrenamiento de doce conjuntos de datos (ANLI, ARC, Banking77, BoolQ, CLINC150, CommonsenseQA, HellaSwag, MMLU, MMLU-Pro, OpenBookQA, Winogrande), con permutación determinista de las opciones para reducir el sesgo de posición, y excluye GPQA-Diamond para evitar contaminar la evaluación del Decision Index.

El modelo tiene 8.190.735.360 parámetros y un tamaño de repositorio de 16,4 GB. La información pública disponible es muy limitada: no se especifican la licencia, la longitud de contexto efectiva del ajuste, los resultados de benchmarks ni los detalles completos del proceso de entrenamiento. Está etiquetado únicamente para inglés y su uso previsto es la generación de texto en el formato de decisión tipada de AnyJev.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3-8B) con adaptador LoRA para decisión tipada |
| Parametros totales | 8.190.735.360 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repo contiene safetensors en precisión original; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Inglés (en) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador LoRA sobre Qwen/Qwen3-8B) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-8B, un transformer decoder-only denso de aproximadamente 8,19 mil millones de parámetros. Sobre esta base se aplica un ajuste fino supervisado con LoRA que transforma la salida del modelo en un "readout" de decisión: el prompt sigue la plantilla State / Question / Options / Answer, y el modelo debe producir únicamente la letra de la opción seleccionada. La lectura se realiza sobre los logits asociados a las letras de las opciones, lo que convierte la generación en una clasificación restringida al conjunto de opciones proporcionado.

Los datos de entrenamiento provienen exclusivamente de las particiones de entrenamiento de doce benchmarks y conjuntos de clasificación: ANLI, ARC-Challenge, ARC-Easy, Banking77, BoolQ, CLINC150, CommonsenseQA, HellaSwag, MMLU, MMLU-Pro, OpenBookQA y Winogrande. Las opciones se permutan de forma determinista por ejemplo para mitigar el sesgo de posición, una práctica habitual en el entrenamiento de modelos de opción múltiple. GPQA-Diamond se excluye por defecto para no contaminar la evaluación del Decision Index. No se documentan el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo etapas de RLHF o DPO; la información disponible solo indica ajuste fino supervisado (SFT) y la métrica declarada es accuracy.

## Capacidades

- Selección de decisiones tipadas: dado un estado, una pregunta y una lista de opciones, devuelve la letra de la opción elegida mediante una única pasada hacia delante.
- Clasificación de texto en categorías predefinidas (por ejemplo, intenciones en Banking77 o CLINC150).
- Respuesta a preguntas de opción múltiple en dominios de conocimiento general y razonamiento (MMLU, MMLU-Pro, ARC, OpenBookQA, CommonsenseQA).
- Razonamiento de sentido común y elección de alternativas plausibles (HellaSwag, Winogrande).
- Inferencia de relación entre premisa e hipótesis (ANLI) y verificación de afirmaciones (BoolQ).
- Integración programática mediante la librería `anyjev` con la interfaz `Tacit` y el método `decide(state, question, options)`.
- No se documentan capacidades de tool calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido en la información disponible.

## Casos de uso

- Clasificación de intenciones en atención al cliente: el modelo puede recibir el mensaje del usuario como estado, una pregunta de enrutamiento y la lista de intenciones disponibles (por ejemplo, las de CLINC150 o Banking77) y devolver la letra de la intención correcta, lo que permite dirigir la conversación al flujo adecuado sin generar texto libre.
- Enrutamiento de consultas en pipelines RAG: tras recuperar documentos, se puede formular una pregunta de decisión sobre qué fuente o qué acción corresponde, y el modelo selecciona la opción en una sola pasada, reduciendo la latencia frente a un modelo generativo completo.
- Evaluación automática de opción múltiple: útil para construir arneses de evaluación internos donde se necesita que un modelo responda exámenes tipo MMLU o ARC seleccionando una letra, con opciones permutadas para controlar el sesgo de posición.
- Moderación y etiquetado de contenido: definir un conjunto cerrado de categorías de política y pedir al modelo que seleccione la etiqueta aplicable a un texto dado, aprovechando su entrenamiento en tareas de clasificación.
- Verificación de afirmaciones en bases de conocimiento: plantear una pregunta de sí/no o de opción múltiple sobre si un texto respalda una afirmación (estilo BoolQ) y usar la letra devuelta como señal binaria o multiclase.
- Enrutamiento de decisiones en agentes: dentro de un sistema con múltiples herramientas o acciones posibles, usar el modelo como selector de la siguiente acción a partir del estado actual y una lista de opciones, sustituyendo una llamada generativa por una clasificación restringida.
- Anotación asistida de datasets: generar etiquetas preliminares para datos de clasificación o de razonamiento y revisarlas posteriormente por anotadores humanos, dado que el modelo está entrenado sobre particiones de entrenamiento de benchmarks conocidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card declara la métrica `accuracy` y menciona un "Decision Index" como referencia de evaluación, pero no se proporcionan cifras concretas ni comparaciones numéricas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión original (bf16/fp16): aproximadamente 16,4 GB solo para los pesos, más overhead de activaciones y caché KV; en la práctica se recomienda al menos 20-24 GB de VRAM para una ejecución cómoda.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para inferencia en precisión reducida; para bf16 completa se recomienda A100 o superior.
- Cabe en GPU de consumo: sí, en tarjetas con 24 GB o más (RTX 3090, RTX 4090) si se usa cuantización o se gestiona cuidadosamente el contexto; en 16 GB requiere cuantización a 8 bits o inferior.
- Opciones de despliegue: la vía documentada es la librería `anyjev` con `Tacit.from_pretrained(..., adaptive=False)`. No se documenta soporte oficial para vLLM, llama.cpp, Ollama o TGI en la información disponible; al ser un adaptador LoRA sobre Qwen3-8B, podría cargarse con frameworks compatibles con LoRA y transformers, pero esto no está confirmado por el autor.
- Latencia y throughput: no disponibles. Al tratarse de una única pasada hacia delante sobre opciones cortas, la latencia debería ser inferior a la de una generación autoregresiva completa, pero no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WorkMagic JEV Decision Qwen3-8B SFT v1 | 8,19 B | No disponible | Decisión tipada sobre opciones (LoRA sobre Qwen3-8B) | No disponible | Hugging Face, librería anyjev |
| Qwen/Qwen3-8B (base) | 8,19 B | No disponible en la información proporcionada | Modelo generativo generalista con modo de razonamiento | No disponible en la información proporcionada | Hugging Face |
| Modelos de clasificación dedicados (por ejemplo, DeBERTa-v3-large) | ~0,3-0,4 B | ~512 tokens típicamente | Clasificación supervisada por tarea | MIT/Apache-2.0 según variante | Hugging Face |

La comparación con la base Qwen3-8B es la más directa: este ajuste conserva el tamaño del modelo pero restringe su salida a la selección entre opciones, lo que lo hace más adecuado para tareas de decisión y menos adecuado para generación abierta. Frente a clasificadores dedicados más pequeños, el modelo ofrece mayor capacidad de razonamiento implícito a costa de un consumo de recursos muy superior. No se dispone de datos de rendimiento comparativo para respaldar estas diferencias con cifras.

## Limitaciones y advertencias

- La licencia no está especificada, por lo que no se puede confirmar si el uso comercial está permitido; es imprescindible contactar con el autor antes de usarlo en producción.
- El modelo está entrenado y etiquetado únicamente para inglés; su comportamiento en castellano u otros idiomas no está validado.
- Está diseñado exclusivamente para el formato de prompt de AnyJev (State / Question / Options / Answer); usarlo con otros formatos o como modelo conversacional general probablemente produzca resultados deficientes.
- Al ser un readout restringido a letras, no genera explicaciones ni justificaciones de la decisión; cualquier razonamiento debe inferirse externamente.
- Riesgo de alucinación y de sesgo de posición residual: aunque las opciones se permutan en entrenamiento, no se documenta una evaluación específica del sesgo de posición en inferencia.
- El entrenamiento sobre particiones de entrenamiento de benchmarks conocidos (MMLU, ARC, HellaSwag, etc.) implica que las evaluaciones sobre esos mismos conjuntos pueden estar contaminadas si no se usan las particiones de test oficiales.
- No se documentan la longitud de contexto efectiva, el número de tokens de entrenamiento ni el proceso de alineación, lo que dificulta estimar su robustez fuera de distribución.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y la librería `anyjev` es específica del autor, lo que reduce la comunidad y el soporte disponible.
- No se documentan salvaguardas de seguridad ni evaluaciones de sesgo social.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/workmagicio/workmagic-jev-decision-qwen3-8b-sft-v1
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- No se han encontrado en la información proporcionada enlaces a papers, blogs, repositorios de la librería `anyjev` ni demos adicionales.
