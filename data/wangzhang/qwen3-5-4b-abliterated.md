# wangzhang/Qwen3.5-4B-abliterated

## Resumen

Qwen3.5-4B-abliterated es una versión modificada del modelo Qwen/Qwen3.5-4B, desarrollada por Wangzhang Wu mediante el framework Abliterix. El objetivo es eliminar o reducir drásticamente el comportamiento de rechazo (refusal) del modelo original, manteniendo en lo posible sus capacidades generales de generación de texto y razonamiento. Se trata de un modelo experimental orientado a investigación y evaluación, no a producción directa.

El modelo se construye aplicando una técnica de ablación dirigida en el espacio de representaciones: se extrae la dirección de rechazo a partir de activaciones neuronales, se proyecta ortogonalmente para aislar la señal, y se aplican modificaciones LoRA de rango 1 sobre las capas de atención y MLP. El proceso se optimiza con búsqueda bayesiana (Optuna TPE) para minimizar tanto la tasa de rechazo como la divergencia KL respecto al modelo original. El resultado final presenta una tasa de rechazo de 3/200 (1,5%) y una divergencia KL de 0,0065, frente al 17% de rechazo inicial antes de la optimización.

Con 4.205 millones de parámetros, es un modelo denso de tamaño medio que hereda la arquitectura transformer del Qwen3.5-4B original. Su relevancia radica en que permite estudiar el comportamiento de los mecanismos de seguridad en modelos de lenguaje y explorar técnicas de alineación alternativa, aunque su uso conlleva riesgos importantes al carecer de salvaguardas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (derivado de Qwen3.5-4B) con modificaciones LoRA rank-1 en attention y MLP |
| Parametros totales | 4.205.751.296 (~4,2B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el modelo base Qwen3.5-4B soporta contexto largo, pero no se especifica la cifra para esta version) |
| Tipos de cuantizacion | No disponible (solo safetensors en precision nativa) |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte del checkpoint Qwen/Qwen3.5-4B, un transformer causal denso de 4,2B parámetros. Sobre esta base, Abliterix aplica un procedimiento de ablación en el espacio de pesos y representaciones. Primero se extrae la dirección de rechazo analizando las activaciones de cada capa ante 800 prompts dañinos y 800 benignos. Después se realiza una proyección ortogonal para eliminar los componentes de la dirección de rechazo que se solapan con respuestas normales, reduciendo así los falsos positivos. Finalmente, se aplican adaptadores LoRA de rango 1 sobre las capas de atención y MLP, que codifican la modificación sin alterar destructivamente los pesos originales.

El proceso de optimización utiliza Optuna TPE (Tree-structured Parzen Estimator) durante 50 iteraciones, ajustando la forma del kernel, el índice fraccional de la dirección y la fuerza de cada componente. El objetivo es encontrar el equilibrio Pareto entre baja tasa de rechazo y baja divergencia KL respecto al modelo original. El resultado final muestra una mejora sustancial: la tasa de rechazo pasa de 34/200 (17%) a 3/200 (1,5%), y la divergencia KL de 0,0159 a 0,0065. No se ha realizado entrenamiento adicional con datos supervisados ni RLHF; la modificación es exclusivamente de intervención en representaciones.

## Capacidades

- Generación de texto y conversación multi-turno, heredadas del modelo base Qwen3.5-4B.
- Razonamiento y resolución de problemas, con capacidades similares al modelo original en tareas de lógica y matemáticas (no se han publicado benchmarks específicos para esta versión).
- Respuesta a instrucciones en formato chat mediante la plantilla de Qwen, con soporte para el modo de pensamiento (enable_thinking) si se activa.
- Reducción significativa del rechazo ante solicitudes que el modelo original consideraría dañinas o inapropiadas, lo que permite estudiar el comportamiento del modelo sin filtros de seguridad.
- No se documenta soporte explícito de tool calling, function calling ni capacidades multimodales en esta versión (el pipeline es text-generation y el tag indica qwen3_5_text).
- Capacidades multilingües no especificadas; se asume herencia del modelo base, pero sin confirmación.

## Casos de uso

- Investigación en alineación y seguridad de IA: el modelo permite analizar cómo se comporta un LLM cuando se eliminan los mecanismos de rechazo, lo que resulta útil para estudiar la naturaleza de los sesgos, la robustez de los sistemas de moderación y el diseño de contramedidas.
- Evaluación de técnicas de ablación: sirve como banco de pruebas para comparar métodos de abliteración (Abliterix frente a otros enfoques) midiendo tasas de rechazo, divergencia KL y preservación de capacidades.
- Desarrollo de sistemas de moderación de contenido: al generar respuestas sin filtros, puede utilizarse para crear conjuntos de datos de entrenamiento para clasificadores de contenido dañino o para probar la eficacia de filtros externos.
- Análisis de sesgos y comportamientos indeseados: permite identificar qué tipo de contenido genera el modelo cuando no está restringido, ayudando a documentar riesgos potenciales de los LLM.
- Pruebas de estrés de pipelines de generación: en entornos controlados, se puede usar para verificar que los sistemas de guardado (guardrails) funcionan correctamente ante entradas adversarias.
- Estudio de la transferencia de capacidades: comparar el rendimiento de este modelo con el base en tareas estándar (MMLU, HumanEval, etc.) para cuantificar el coste de la ablación en habilidades generales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor solo reporta métricas de rechazo y divergencia KL, no resultados en tareas estándar como MMLU, HumanEval o GSM8K. El modelo base Qwen3.5-4B, según fuentes externas, se acerca al rendimiento de Qwen3-30B en MMLU-Pro y supera a GPT-5-Nano en benchmarks de visión, pero estos datos corresponden al modelo original y no a esta versión abliterated, por lo que no pueden atribuirse directamente.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4,2B parámetros en precisión FP16/BF16, el modelo ocupa aproximadamente 8,4 GB de memoria. En cuantización de 4 bits (no disponible en el repo, pero posible con herramientas externas como llama.cpp o GPTQ), se reduciría a unos 2,5-3 GB.
- GPU recomendadas: cualquier GPU con al menos 12 GB de VRAM puede ejecutar el modelo en FP16 (por ejemplo, RTX 3060 12GB, RTX 4070, RTX 4080, RTX 4090). Para cuantización de 4 bits, bastaría con 6-8 GB (RTX 3060 8GB, RTX 4060, etc.).
- Cabe en GPUs de consumo: sí, en la mayoría de GPUs modernas de gama media y alta.
- Opciones de despliegue: compatible con transformers (carga directa con `AutoModelForCausalLM`), vLLM, llama.cpp (si se convierte a GGUF), Ollama (existen versiones abliterated de Qwen3.5 en Ollama, aunque no esta variante concreta) y TGI.
- Latencia y throughput: no se han publicado datos específicos. Para un modelo de 4B en una GPU consumer, se puede esperar una generación de 30-60 tokens por segundo en FP16 con vLLM, y algo menos con transformers nativo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tasa de rechazo | KL div. | Licencia |
|---|---|---|---|---|---|
| wangzhang/Qwen3.5-4B-abliterated | 4,2B | No disponible | 3/200 (1,5%) | 0,0065 | Apache 2.0 |
| huihui-ai/Qwen3-4B-abliterated | 4B (aprox.) | No disponible | No disponible | No disponible | Apache 2.0 |
| wangzhang/Qwen3.5-0.8B-abliterated | 0,8B | No disponible | 0/200 (0%) | 0,0087 | Apache 2.0 |
| wangzhang/Qwen3.5-9B-abliterated | 9B | No disponible | 2/200 (1%) | 0,0105 | Apache 2.0 |

La comparativa se limita a otras versiones abliterated de la misma familia, ya que no se dispone de datos de rendimiento en tareas estándar. El modelo de 4B se sitúa en un punto intermedio: mayor capacidad que el de 0,8B, pero con una tasa de rechazo ligeramente superior. Frente a huihui-ai/Qwen3-4B-abliterated (basado en Qwen3, generación anterior), no hay datos públicos de comparación directa.

## Limitaciones y advertencias

- El modelo ha sido deliberadamente desprovisto de mecanismos de rechazo de seguridad. Puede generar contenido explícito, ofensivo, peligroso o ilegal, y no debe utilizarse en producción sin filtros externos robustos.
- No se han publicado benchmarks de capacidades generales; el impacto de la ablación sobre el rendimiento en tareas estándar es desconocido.
- La divergencia KL de 0,0065 indica que el modelo se desvía ligeramente del comportamiento del base, pero no garantiza que las capacidades se mantengan intactas en todos los dominios.
- Riesgo de alucinación: al igual que el modelo base, puede inventar información, especialmente en dominios especializados. La ausencia de alineación puede aumentar la confianza en respuestas incorrectas.
- Sesgos: el modelo hereda los sesgos del corpus de entrenamiento de Qwen3.5-4B, y la ablación no los corrige. Puede amplificar estereotipos o generar contenido discriminatorio.
- Limitaciones de idioma: no se especifican los idiomas soportados; se asume herencia del base, pero sin confirmación oficial.
- Restricciones de licencia: aunque la licencia es Apache 2.0, el autor incluye un aviso de que el uso debe ser legal y responsable. No se concede ningún derecho adicional sobre el modelo original.
- Para producción: no recomendado. Cualquier despliegue requiere una evaluación de riesgos específica del contexto, supervisión humana y filtros de contenido externos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wangzhang/Qwen3.5-4B-abliterated
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Framework Abliterix: https://github.com/wuwangzhang1216/abliterix
- Paquete PyPI de Abliterix: https://pypi.org/project/abliterix-llm/
- Otros modelos abliterated del mismo autor: https://huggingface.co/wangzhang (lista de repositorios)
- Versión abliterated de Qwen3-4B (referencia comparativa): https://huggingface.co/huihui-ai/Qwen3-4B-abliterated
- Página de Qwen3.5-4B en Awesome Agents: https://awesomeagents.ai/models/qwen-3-5-4b/
