# vwdubb/Qwen3.8-27B-Fable-Distill-FP8

## Resumen

El modelo `vwdubb/Qwen3.8-27B-Fable-Distill-FP8` es una versión cuantizada en FP8 del fine-tuning `TeichAI/Qwen3.8-27B-Fable-Distill`, desarrollado por el usuario vwdubb. Se trata de un ajuste ligero sobre el modelo base Qwen3.8-27B, entrenado con los datasets públicos `armand0e/claude-fable-5-claude-code` y `armand0e/Fable-5-Chat`, complementados con un corpus privado de datos Fable 5. El objetivo es mejorar las capacidades conversacionales y de razonamiento del modelo base, manteniendo una licencia Apache 2.0 que permite uso comercial.

La versión FP8 reduce el tamaño del repositorio a 38,5 GB (frente a los ~55 GB que ocuparía el modelo en BF16), lo que facilita su despliegue en entornos con VRAM limitada. El modelo conserva las características del fine-tuning original, como el soporte para `enable_thinking` y niveles de `reasoning_effort` (low, medium, xhigh), y está pensado para su uso con librerías como transformers, vLLM o text-generation-inference. Aunque el pipeline declarado es `image-text-to-text`, no hay evidencia en la model card de capacidades multimodales reales, por lo que debe tratarse como un modelo de texto.

Con 27.781.427.952 parámetros, se posiciona en la gama de modelos de 27B, ofreciendo un equilibrio entre capacidad y requisitos de hardware. Su relevancia actual radica en ser una opción de código abierto con licencia permisiva, orientada a tareas de conversación y asistencia a código, con la ventaja de una cuantización eficiente para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (se infiere transformer, sin confirmar) |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no aplicable (no se indica arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (esta version); otras no disponibles |
| Idiomas soportados | ingles (segun model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura interna no se detalla en la informacion proporcionada. El nombre "Qwen3.8-27B" sugiere que se basa en la familia Qwen3, probablemente un transformer denso, pero no hay confirmacion oficial sobre el tipo de atencion, uso de MoE o innovaciones estructurales. El modelo es un fine-tuning ligero (light tune) sobre Qwen3.8-27B, realizado con las librerias Unsloth y Hugging Face TRL, lo que permitio un entrenamiento aproximadamente dos veces mas rapido que un ajuste convencional.

Los datos de entrenamiento incluyen dos datasets publicos: `armand0e/claude-fable-5-claude-code`, orientado a tareas de codigo y uso de herramientas, y `armand0e/Fable-5-Chat`, centrado en conversacion. Ademas, se utilizo un corpus privado de datos Fable 5 no publico. No se especifica el numero de tokens de entrenamiento ni si se aplicaron tecnicas como RLHF o DPO. El modelo hereda del base la capacidad de activar un modo de pensamiento (`enable_thinking`) y ajustar el esfuerzo de razonamiento (`reasoning_effort`) con valores low, medium o xhigh, siendo xhigh el predeterminado, lo que implica un razonamiento extenso en cada turno.

## Capacidades

- Generacion de texto conversacional: el fine-tuning sobre datos de chat mejora la fluidez y coherencia en dialogos multi-turno.
- Razonamiento con modo pensamiento: soporta `enable_thinking` y niveles de esfuerzo (low, medium, xhigh), permitiendo controlar la profundidad del razonamiento.
- Asistencia a codigo: el dataset `claude-fable-5-claude-code` sugiere capacidad para generar, explicar o depurar codigo, aunque no se detalla si soporta tool calling explicito.
- Multilingue: solo se declara ingles; no hay evidencia de soporte para otros idiomas.
- Posible multimodalidad: el pipeline indica `image-text-to-text`, pero no hay ejemplos ni documentacion que lo confirmen; se recomienda tratarlo como modelo de texto puro.

## Casos de uso

- Asistente conversacional con razonamiento profundo: gracias al modo `enable_thinking` y `reasoning_effort` configurable, puede usarse en chatbots que requieran respuestas meditadas, como soporte tecnico o tutoria.
- Generacion de codigo en entornos de desarrollo: el entrenamiento con datos de Claude Code permite su integracion en IDEs o pipelines de CI/CD para autocompletar, revisar o documentar codigo.
- Fine-tuning adicional para dominios especificos: al ser un modelo abierto con licencia Apache 2.0, puede ajustarse con datos propios para tareas verticales (legal, medico, etc.) sin restricciones de uso comercial.
- Despliegue en produccion con VRAM moderada: la cuantizacion FP8 reduce el peso a 38,5 GB, haciendolo viable en GPUs de 40 GB o 48 GB, como A100 o L40S, para inferencia de baja latencia.
- Investigacion en destilacion y cuantizacion: sirve como caso de estudio para evaluar el impacto de FP8 en modelos de 27B, comparando rendimiento frente a la version sin cuantizar.
- Prototipado rapido con vLLM o TGI: al ser compatible con `text-generation-inference` y `transformers`, puede desplegarse en infraestructura estandar para pruebas de concepto.

## Benchmarks y rendimiento

Los unicos datos publicados corresponden al modelo base `Qwen3.8-27B-Fable-Distill` (sin cuantizar), no a esta version FP8. Se presentan en la model card del autor:

| Benchmark | Qwen3.8-27B | Qwen3.8-27B-Fable-Distill |
|---|---|---|
| ARC Challenge | 0.591 | 0.637 |
| ARC Challenge (Easy) | 0.782 | 0.832 |
| BoolQ | 0.896 | 0.911 |

No se han publicado resultados especificos para la version FP8. Es probable que la cuantizacion introduzca una degradacion minima, pero no hay datos que lo confirmen. Tampoco se dispone de resultados en benchmarks como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: con 27.781.427.952 parametros en FP8 (1 byte por parametro), el peso del modelo ocupa aproximadamente 27,8 GB. Sumando overhead de activaciones y cache KV, se estima un consumo de 30-35 GB en inferencia. No hay datos oficiales.
- GPU recomendadas: tarjetas con 40 GB o mas, como NVIDIA A100 (40/80 GB), L40S (48 GB) o H100 (80 GB). En GPUs de 24 GB (RTX 4090, A5000) no cabria sin cuantizacion adicional (por ejemplo, AWQ o GPTQ de 4 bits).
- Opciones de despliegue: compatible con `transformers`, `vLLM`, `text-generation-inference` (TGI) y `Ollama` (si se convierte a GGUF). El tag `endpoints_compatible` sugiere que funciona con soluciones de inferencia gestionada.
- Latencia y throughput: no disponibles. Dependera del hardware y del nivel de `reasoning_effort`; el modo xhigh puede aumentar significativamente el tiempo de generacion.

## Comparativa con modelos similares

No se dispone de comparativas directas con otros modelos de 27B en la informacion proporcionada. La unica referencia es el modelo base Qwen3.8-27B, con el que se comparan los benchmarks anteriores. Como alternativa, se podria considerar Qwen2.5-27B o Llama-3-8B, pero no hay datos de rendimiento para establecer una comparacion rigurosa. Se recomienda consultar benchmarks externos si se necesita una evaluacion frente a otros modelos.

## Limitaciones y advertencias

- Solo ingles: no hay soporte declarado para otros idiomas, lo que limita su uso en entornos multilingues.
- Datos de entrenamiento parcialmente privados: el corpus Fable 5 no es publico, por lo que no se puede auditar su contenido ni evaluar posibles sesgos.
- Riesgo de alucinacion: como cualquier modelo generativo, puede producir respuestas incorrectas o inventadas, especialmente en modo de razonamiento extenso.
- Cuantizacion FP8: puede degradar ligeramente la precision en tareas numericas o de razonamiento complejo frente a la version BF16, aunque no hay datos que lo cuantifiquen.
- Contexto desconocido: al no especificarse la longitud de contexto, no se puede garantizar un rendimiento adecuado en tareas de ventana larga.
- Pipeline multimodal no confirmado: el tag `image-text-to-text` podria inducir a error; no hay evidencia de que el modelo procese imagenes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vwdubb/Qwen3.8-27B-Fable-Distill-FP8
- Modelo base (sin cuantizar): https://huggingface.co/TeichAI/Qwen3.8-27B-Fable-Distill
- Dataset de codigo: https://huggingface.co/datasets/armand0e/claude-fable-5-claude-code
- Dataset de chat: https://huggingface.co/datasets/armand0e/Fable-5-Chat
- Libreria Unsloth: https://github.com/unslothai/unsloth
- Herramienta Teich: https://github.com/TeichAI/teich
