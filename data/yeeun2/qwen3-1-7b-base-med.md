# yeeun2/Qwen3-1.7B-base-MED

## Resumen

Qwen3-1.7B-base-MED es un modelo de lenguaje de 1.720.574.976 parámetros publicado en HuggingFace por el usuario yeeun2. Se trata de un fine-tuning del modelo base Qwen3-1.7B de Alibaba Cloud, como indican las etiquetas `qwen3`, `sft` y `trl` presentes en su ficha. El sufijo "MED" sugiere que el ajuste se ha realizado sobre datos del dominio médico, aunque la model card no proporciona ninguna información concreta sobre el dataset, el procedimiento de entrenamiento ni los objetivos del ajuste.

La relevancia de este modelo reside en que parte de una base sólida: Qwen3-1.7B es un modelo denso de 1.700 millones de parámetros diseñado por el equipo Qwen de Alibaba, con una ventana de contexto de 32.768 tokens y capacidades multilingües. Sin embargo, la ausencia total de documentación sobre el fine-tuning limita gravemente su utilidad práctica para desarrolladores e investigadores, que no pueden evaluar su comportamiento específico ni conocer sus limitaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3) |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | 32.768 tokens (heredada del modelo base; no confirmada para el fine-tuning) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo base Qwen3-1.7B soporta multiples idiomas, pero no se ha verificado para este fine-tuning) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen3-1.7B es un transformer causal denso con arquitectura estandar de decoder-only, que incorpora atención con RoPE (rotary position embeddings), normalización RMSNorm y activación SwiGLU. Fue entrenado por Alibaba Cloud sobre un corpus multilingüe extenso, con un enfoque en razonamiento, generación de código y comprensión del lenguaje. El fine-tuning de este modelo concreto se realizó mediante entrenamiento supervisado (SFT), como indican las etiquetas `sft` y `trl` (la librería de transformers reinforcement learning de HuggingFace). No se dispone de información sobre el dataset utilizado, el número de pasos de entrenamiento, los hiperparámetros ni el régimen de precisión (fp16, bf16, etc.). La model card es una plantilla genérica sin rellenar, por lo que todos los detalles del proceso de ajuste permanecen desconocidos.

## Capacidades

Dado que no existe documentación específica del fine-tuning, las capacidades que se enumeran a continuación se infieren del modelo base Qwen3-1.7B y no han sido verificadas para esta versión ajustada:

- Generación de texto y completado de secuencias en múltiples idiomas (el base soporta más de 30 idiomas, incluyendo español, inglés, chino, francés, alemán, etc.).
- Razonamiento básico y resolución de problemas matemáticos simples.
- Generación de código en lenguajes como Python, Java, C++ y JavaScript.
- Comprensión lectora y respuesta a preguntas sobre documentos.
- Capacidad de seguir instrucciones en formato conversacional (si el fine-tuning incluyó datos de chat, aunque no se confirma).
- No se ha verificado soporte de tool calling, function calling ni modo de razonamiento extendido (thinking mode) en esta versión.

## Casos de uso

Dada la falta de información sobre el fine-tuning, los casos de uso que se proponen son hipotéticos y deben validarse empíricamente antes de su adopción en producción:

- Asistente de documentación médica: si el fine-tuning se realizó sobre literatura clínica, el modelo podría ayudar a resumir artículos científicos o redactar informes preliminares, aunque sin garantía de precisión clínica.
- Clasificación de textos sanitarios: podría emplearse para categorizar notas clínicas o extraer entidades médicas, siempre que se evalúe su rendimiento frente a modelos especializados.
- Chatbot de información general sobre salud: con un contexto de 32K tokens, podría mantener conversaciones largas con pacientes, pero requiere supervisión humana estricta por el riesgo de alucinaciones.
- Generación de contenido educativo en español: su tamaño compacto permite desplegarlo en entornos con recursos limitados para crear materiales formativos.
- Prototipado rápido de aplicaciones de lenguaje: al ser un modelo pequeño, es adecuado para experimentar con técnicas de fine-tuning adicionales o para pruebas de concepto en entornos de desarrollo.
- Investigación académica sobre transferencia de conocimiento: puede servir como punto de partida para estudiar cómo el ajuste en un dominio específico afecta al rendimiento general del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna métrica de evaluación, y no se ha encontrado documentación externa que reporte resultados de MMLU, HumanEval, GSM8K u otras pruebas estandarizadas para este fine-tuning concreto. El modelo base Qwen3-1.7B obtiene resultados moderados en dichas pruebas (por ejemplo, alrededor de 60-70% en MMLU según la documentación de Qwen3), pero no se puede asumir que el fine-tuning mantenga o mejore esas cifras.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,5 GB en precisión fp16 (1,72 GB de pesos + overhead de activaciones y KV cache). Con cuantización int8, se reduce a unos 2 GB; con int4, alrededor de 1,2 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar el modelo en fp16. Tarjetas como NVIDIA GTX 1660 Super (6 GB), RTX 3060 (12 GB) o RTX 4090 (24 GB) son suficientes. También es viable en Apple Silicon con 8 GB o más de memoria unificada.
- Sí cabe en GPUs de consumo: es un modelo pequeño, apto para hardware de gama media e incluso para inferencia en CPU con cuantización.
- Opciones de despliegue: compatible con vLLM, llama.cpp, Ollama, Text Generation Inference (TGI) y transformers nativo de HuggingFace. Al estar en formato safetensors, puede convertirse a GGUF para su uso con llama.cpp.
- Latencia y throughput estimados: en una RTX 4090, se espera una generación de 50-100 tokens por segundo en fp16; en CPU moderna, 5-15 tokens por segundo con cuantización int4. Estos valores son orientativos y dependen de la implementación y el hardware exacto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3-1.7B-base-MED (este) | 1,72B | 32K (heredado) | no disponible | HuggingFace |
| Qwen3-1.7B-Base (original) | 1,72B | 32K | Apache 2.0 | HuggingFace |
| Llama-3.2-1B | 1,23B | 128K | Llama 3.2 Community License | HuggingFace |
| Gemma-2-2B | 2,6B | 8K | Gemma Terms of Use | HuggingFace |

La comparativa se limita a parámetros y contexto, ya que no hay datos de rendimiento para el fine-tuning. El modelo base Qwen3-1.7B es claramente superior en documentación y soporte, mientras que este fine-tuning carece de cualquier garantía de calidad. Llama-3.2-1B ofrece un contexto mucho mayor (128K) y una licencia permisiva, mientras que Gemma-2-2B es ligeramente más grande pero con contexto reducido.

## Limitaciones y advertencias

- Ausencia total de documentación: la model card no especifica el dataset de entrenamiento, los hiperparámetros, el régimen de precisión ni los objetivos del fine-tuning. Esto impide evaluar su idoneidad para cualquier tarea concreta.
- Riesgo de alucinaciones: al ser un modelo de 1,7B parámetros, su capacidad de razonamiento es limitada y puede generar información falsa o inventada, especialmente en dominios especializados como el médico.
- Sesgos potenciales: si el fine-tuning se realizó sobre datos médicos, el modelo puede heredar sesgos presentes en la literatura clínica (por ejemplo, infrarrepresentación de ciertos grupos poblacionales).
- Licencia desconocida: al no especificarse la licencia, no está claro si el modelo puede utilizarse comercialmente. Se recomienda contactar con el autor antes de cualquier uso en producción.
- Sin garantía de calidad: no hay benchmarks ni evaluaciones publicadas, por lo que el rendimiento real es desconocido.
- Posible desalineación con el modelo base: el fine-tuning puede haber degradado capacidades generales del Qwen3-1.7B original, como la generación de código o el razonamiento matemático, sin que se haya documentado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yeeun2/Qwen3-1.7B-base-MED
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Modelo base Qwen3-1.7B-Base: https://huggingface.co/Qwen/Qwen3-1.7B-Base
- Repositorio oficial de Qwen3: https://github.com/QwenLM/Qwen3
- Especificaciones y requisitos de VRAM de Qwen3-1.7B: https://apxml.com/models/qwen3-1-7b
