# vasishath/golf-finetuned-agent-ONNX

## Resumen

`golf-finetuned-agent-ONNX` es un ajuste fino de Qwen3-0.6B publicado por el usuario vasishath como demostración técnica de un agente telefónico para un club de golf ficticio, Cedar Ridge Golf Club. El modelo no es un asistente de propósito general: está entrenado para una única tarea acotada, atender llamadas mediante tres herramientas (`check_availability`, `book_tee_time` y `get_course_info`) y responder con llamadas a herramienta o réplicas breves en formato conversacional. Se distribuye como build ONNX cuantizado en 4 bits para ejecutarse en el navegador con Transformers.js sobre WebGPU.

La relevancia de esta ficha es doble. Por un lado, ilustra un patrón de despliegue de agentes de tool calling completamente en cliente, sin backend, con un peso de 488 MB y licencia Apache 2.0. Por otro, sirve como referencia de metodología: el autor generó 1.800 conversaciones sintéticas a partir del propio código de las herramientas, de modo que los datos son correctos por construcción, y valida el resultado sobre 150 pasos de agente retenidos con formulaciones no vistas en entrenamiento.

El modelo base es Qwen3-0.6B, un transformer denso de 0,6 mil millones de parámetros con modo thinking desactivable. En este ajuste el thinking se entrena apagado (`enable_thinking: false`), lo que reduce latencia y evita que el agente emita razonamiento intermedio antes de la llamada a herramienta. El resultado es un artefacto pequeño, especializado y fácil de inspeccionar, pensado como demo y no como producto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), exportado a ONNX Runtime GenAI |
| Parámetros totales | 0,6 mil millones (modelo base Qwen3-0.6B) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 4 bits k_quant con bloques de 32; cabeza de vocabulario y capas sensibles a 8 bits; activaciones fp16 (build `q4f16`) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`onnx/model_q4f16.onnx_data`, 488 MB), con formato de datos externos |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-0.6B, un transformer denso decoder-only, y se ajusta mediante LoRA con rango 16, alpha 32 y dropout 0,05 aplicado a todas las capas lineales; el adaptador se fusiona después en los pesos base. El entrenamiento consistió en una época con tasa de aprendizaje 2e-4 y decaimiento coseno, en fp16 sobre una única GPU T4. Los datos son 1.800 conversaciones telefónicas sintéticas que suman 6.647 pasos de agente, generadas a partir del código de las tres herramientas del propio demo, de forma que cada hecho contenido en ellas es correcto por construcción. Cada ejemplo corresponde a un paso de agente y la función de pérdida solo cubre la llamada a herramienta o la réplica del agente, no el turno del usuario. Los argumentos de herramienta generados se contrastan con lo que el interlocutor ha dicho, de modo que ningún ejemplo inventa nombre, día o tamaño de grupo.

La exportación se realizó con el model builder de ONNX Runtime GenAI para WebGPU, con atención fusionada, rotary embedding y RMSNorm fusionados. Los pesos se cuantizan en 4 bits con k_quant y bloques de 32, manteniendo la cabeza de vocabulario y las capas más sensibles a la cuantización en 8 bits, con activaciones en fp16. El resultado es un único fichero de pesos de 488 MB que se carga en el navegador mediante Transformers.js con `dtype: "q4f16"`, `device: "webgpu"` y `use_external_data_format: true`. El modelo se invoca con la plantilla de chat de Qwen3, las herramientas en formato de función de OpenAI y `enable_thinking: false`, y responde con bloques `<tool_call>{"name": …, "arguments": {…}}</tool_call>` o con una réplica hablada corta.

## Capacidades

- Generación de texto conversacional breve orientada a atención telefónica.
- Tool calling con tres funciones definidas: `check_availability`, `book_tee_time` y `get_course_info`.
- Emisión de llamadas a herramienta en formato estructurado `<tool_call>` compatible con el esquema de funciones de OpenAI.
- Gestión de conversaciones multi-turno con pasos de agente encadenados: consulta de disponibilidad, reserva y respuesta al usuario.
- Manejo de casos límite entrenados explícitamente: datos de reserva incompletos, horarios no disponibles, tarifas, horario de apertura, código de vestimenta, ubicación, grupos de más de cuatro personas, preguntas fuera de alcance y despedidas.
- Respuesta hablada corta cuando no procede llamar a herramienta.
- Ejecución en navegador sobre WebGPU sin backend, mediante Transformers.js.
- Modo thinking desactivado de forma nativa en el ajuste.

## Casos de uso

- Demostración de agentes de tool calling en el navegador: el modelo se carga con Transformers.js y WebGPU y ejecuta el bucle de agente íntegramente en cliente, sin servidor intermedio, gracias a sus 488 MB de pesos cuantizados.
- Atención telefónica de reservas para un club de golf o instalación deportiva: el modelo encadena `check_availability` y `book_tee_time` en pasos de agente y responde al interlocutor con réplicas cortas, adecuado por su entrenamiento específico en ese flujo.
- Prototipado de asistentes de voz con latencia baja: al entrenarse con el thinking apagado, evita la generación de razonamiento intermedio y reduce el número de tokens por turno, lo que encaja en pipelines de ASR y TTS en tiempo real.
- Generación de datos sintéticos de conversación: el método del autor, derivar los diálogos del código de las herramientas para garantizar corrección por construcción, es reutilizable para construir datasets de agentes en otros dominios verticales.
- Evaluación de cuantización en el borde: el build q4f16 con capas sensibles en 8 bits sirve como caso de estudio de hasta dónde se puede comprimir un modelo de 0,6B sin degradar la precisión de las llamadas a herramienta.
- Base para ajustes verticales con LoRA: al ser un adaptador LoRA fusionado sobre Qwen3-0.6B con licencia Apache 2.0, se puede reentrenar con el mismo esquema para otros dominios de reservas o consultas estructuradas.
- Validación de agentes en CI: el modelo y su conjunto de evaluación de 150 pasos retenidos permiten montar pruebas de regresión de tool calling en pipelines de integración continua.

## Benchmarks y rendimiento

Evaluación sobre 150 pasos de agente retenidos, formulados con expresiones no vistas en entrenamiento. El conjunto contiene 67 pasos de llamada a herramienta, por lo que unos pocos puntos porcentuales equivalen a unos pocos ejemplos.

| Modelo | Tipo de respuesta correcta (llamada vs réplica) | Llamada correcta (herramienta y argumentos exactos) |
|---|---|---|
| Qwen3-0.6B sin ajuste | 64% | 3% |
| Este modelo (PyTorch) | 97% | 94% |
| Este modelo (build ONNX en navegador) | 97% | 99% |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el build q4f16 ocupa 488 MB en disco; en WebGPU la huella en memoria de la GPU es del orden de ese tamaño más las activaciones en fp16, aunque el autor no publica una cifra exacta de VRAM.
- GPU recomendadas: cualquier GPU con soporte WebGPU en navegador; el entrenamiento se realizó en una NVIDIA T4, que sirve como referencia mínima para ejecución en servidor.
- Cabe en GPU de consumo: sí, por tamaño; al ser un modelo de 0,6B en 4 bits, es viable en GPUs de consumo con WebGPU, aunque no se especifican modelos concretos ni cifras de rendimiento.
- Opciones de despliegue: Transformers.js con ONNX Runtime GenAI sobre WebGPU (build oficial); al estar en formato ONNX, es desplegable con ONNX Runtime en otros entornos, aunque el autor solo documenta la ruta de navegador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Formato |
|---|---|---|---|---|---|
| golf-finetuned-agent-ONNX (este) | 0,6B | no disponible | Agente telefónico de reservas de golf con 3 herramientas | Apache 2.0 | ONNX q4f16 |
| Qwen/Qwen3-0.6B (base) | 0,6B | no disponible | Propósito general, thinking opcional | Apache 2.0 | safetensors y otros |
| Alternativas de 0,5B-1B para tool calling en el borde | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa más informativa es con el modelo base: el ajuste eleva la precisión de llamada exacta del 3% al 94-99% en el conjunto retenido, a costa de perder generalidad y de quedar restringido al dominio del club ficticio. No se dispone de datos de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Modelo de demostración: no es un asistente de propósito general y no sabe nada de ningún club de golf real; el club Cedar Ridge es inventado.
- Dominio muy estrecho: fuera de las tres herramientas y del flujo de reservas entrenado, la calidad de respuesta no está garantizada.
- Riesgo de error en argumentos: el propio autor advierte que puede elegir un argumento de herramienta incorrecto o arrastrar un dato de un turno anterior de la llamada; el demo valida cada reserva contra lo que el interlocutor dijo antes de ejecutarla.
- Tamaño reducido: con 0,6B de parámetros, la robustez ante formulaciones ambiguas o ruido de transcripción es limitada.
- Idiomas soportados no declarados: no hay información sobre cobertura multilingüe; los datos de entrenamiento parecen en inglés.
- Longitud de contexto no documentada: no se especifica la ventana efectiva del build ONNX.
- Sesgos: no se documentan evaluaciones de sesgo; al derivarse de datos sintéticos generados por código, los sesgos del dominio y del generador no están caracterizados.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base Qwen3-0.6B mantiene su propia licencia y conviene verificar sus términos para producción.
- Dependencia de WebGPU: el build documentado requiere un navegador con soporte WebGPU; en entornos sin él habría que reexportar o usar otra ruta de ONNX Runtime.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vasishath/golf-finetuned-agent-ONNX
- Modelo base Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- Documentación de Transformers.js: https://huggingface.co/docs/transformers.js
- Demo en vivo del agente: https://vasishath.com
