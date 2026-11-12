# texellabs/texel-support-9b

## Resumen

Texel Support 9B es un adaptador LoRA sobre el modelo base Qwen3.5-9B, desarrollado por texellabs para actuar como agente de atencion al cliente de Texel, una plataforma de computacion GPU onchain sobre Robinhood Chain. El modelo responde preguntas sobre la documentacion publica de Texel, consulta el estado de la cartera del usuario (creditos, instancias, outputs y recibos) y abre tickets de soporte, siempre apoyandose en herramientas en lugar de responder de memoria.

El adaptador tiene 58,2 millones de pesos entrenables (0,61% del total del modelo base) y se entreno en una unica GPU NVIDIA A40 durante 55 minutos, con un pico de 21,3 GB de VRAM. La arquitectura subyacente es la de Qwen3.5-9B, un transformer hibrido con capas de atencion completa y lineal (flash-linear-attention) que combina atencion estandar con atencion lineal en la mayoria de sus 32 capas.

Su relevancia radica en que demuestra un caso de uso muy concreto y verificable: un agente de soporte con tool calling restringido a operaciones de solo lectura, entrenado con datos sinteticos generados por un profesor de pesos abiertos y evaluado con un juez automatico. La mejora sobre el modelo base es notable en su dominio (77,8% de respuestas correctas frente a 62,5%) y en la coincidencia de llamadas a herramientas (79,2% frente a 47,2%).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rank 32, alpha 32) sobre Qwen3.5-9B (transformer hibrido con atencion completa y lineal) |
| Parametros totales | 58,2 M entrenables en el adaptador (0,61% del base); el base Qwen3.5-9B tiene 9B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens (longitud de secuencia usada en entrenamiento) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors bf16; la cuantizacion depende del base) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3.5-9B, un transformer hibrido que combina 8 capas de atencion completa con el resto de capas de atencion lineal (flash-linear-attention 0.6.0). El LoRA se inserta en las capas MLP de las 32 capas y en las proyecciones q, k, v y o de las 8 capas de atencion completa, con rank 32 y alpha 32, sumando 58,2 M de pesos entrenables.

El entrenamiento uso 960 chats de soporte (1.367 ejemplos, 4,3 M tokens) y 72 chats reservados para evaluacion. Cada chat parte de un escenario: preguntas sobre la documentacion, consultas de carteras ficticias, reportes de bugs, quejas, intentos de estafa que el modelo debe rechazar y conversacion trivial. Un usuario simulado (DeepSeek V4.1 Flash) genero el lado del usuario y un profesor de pesos abiertos (Qwen3.8) respondio como Texel Support usando las herramientas reales. Se descartaron 41 de 1.073 chats por comprobaciones de numeros o enlaces no respaldados por herramientas, mezcla de creditos con dolares o respuestas que omitian una herramienta. El entrenamiento uso bf16, learning rate 2e-4 con schedule coseno, batches de 16, 1,2 epochs (103 pasos), secuencias de hasta 8.192 tokens y thinking desactivado. La perdida cubre solo lo que el asistente escribe tras el ultimo mensaje del usuario. La eval loss bajo de 0,674 a 0,600 en 55 minutos a 1.313 tokens por segundo.

## Capacidades

- Generacion de texto conversacional en ingles orientada a soporte al cliente.
- Tool calling en el formato XML de Qwen3.5 (`<tool_call><function=...>`), con seis herramientas definidas: `search_docs`, `get_credits`, `list_instances`, `list_outputs`, `list_receipts` y `open_ticket`.
- Busqueda semantica sobre la documentacion publica de texel.run (docs, tarifas de GPU, precios de modelos, roadmap, changelog, recibos, blog y notas de soporte).
- Consulta de estado de cartera: creditos, outputs gratuitos restantes, reembolsos pendientes y depositos en espera de la cadena.
- Listado de instancias GPU activas o finalizadas en las ultimas 24 horas.
- Listado de outputs generados (imagenes, videos, voces) con estado y precio.
- Listado de recibos recientes y verificacion de sellado en Robinhood Chain.
- Apertura de tickets de bug o queja adjuntando la cartera del usuario.
- Capacidad de rechazar peticiones fraudulentas o fuera de alcance (estafas, solicitudes no soportadas).
- Razonamiento multi-paso con multiples llamadas a herramientas antes de responder.
- Las herramientas de cartera son de solo lectura: el modelo no puede comprar, reembolsar, alquilar ni mover fondos.

## Casos de uso

- Atencion al cliente automatizada en el chat de texel.run: el modelo gestiona conversaciones multi-turno sobre precios, GPUs, roadmap y changelog consultando `search_docs` sobre el sitio en vivo, lo que evita respuestas desactualizadas.
- Consulta de saldo y creditos: un usuario autenticado pregunta por sus creditos restantes, outputs gratuitos del dia o reembolsos pendientes, y el modelo llama a `get_credits` para responder con datos reales de su cartera.
- Diagnostico de instancias GPU: el usuario pregunta por sus instancias activas o finalizadas en las ultimas 24 horas y el modelo usa `list_instances` para devolver el estado concreto.
- Auditoria de outputs generados: el modelo consulta `list_outputs` para informar de imagenes, videos o voces creados, su estado y su precio, util para usuarios que han lanzado varias generaciones.
- Verificacion de recibos onchain: el modelo usa `list_receipts` para indicar si cada hora de uso esta sellada en Robinhood Chain, lo que aporta trazabilidad y confianza.
- Gestion de incidencias: ante un bug o una queja, el modelo llama a `open_ticket` con tipo, resumen y detalles, adjuntando la cartera del usuario para que el equipo de Texel pueda reproducir el problema.
- Filtrado de fraude y abuso: el modelo ha sido entrenado con escenarios de estafa y peticiones fuera de alcance, por lo que puede rechazar solicitudes fraudulentas y redirigir al usuario a los canales adecuados.
- Integracion en pipelines de agentes: al exponer herramientas estandarizadas en `tools.json`, el adaptador se puede orquestar desde frameworks de agentes que ejecuten las llamadas y devuelvan resultados como mensajes `tool`.

## Benchmarks y rendimiento

Evaluacion sobre 72 chats reservados, reproducidos desde su primer mensaje con las mismas herramientas y carteras ficticias. Un juez automatico (DeepSeek V4 Pro) califico la primera respuesta de cada chat contra lo que devolvieron las herramientas.

| Metrica | Qwen3.5-9B | Texel Support 9B |
|---|---|---|
| Respuestas correctas | 62,5% | 77,8% |
| Parcialmente correctas | 22,2% | 12,5% |
| Incorrectas | 15,3% | 9,7% |
| Llama las mismas herramientas que la respuesta de referencia | 47,2% | 79,2% |
| Supera las comprobaciones de reglas | 97,2% | 98,6% |

Datos de entrenamiento: eval loss de 0,674 a 0,600; 55 minutos de entrenamiento a 1.313 tokens por segundo; pico de 21,3 GB de VRAM en una A40 de 48 GB; 13.681 segundos de GPU facturados (2,2422 creditos).

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador anade solo 58,2 M de pesos (unos 116 MB en bf16) al modelo base de 9B. El base en bf16 requiere aproximadamente 18 GB de VRAM; en cuantizacion de 8 bits, unos 9-10 GB; en 4 bits, unos 5-6 GB.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o A40 para servicio en produccion con bf16. El entrenamiento se realizo en una A40 de 48 GB con un pico de 21,3 GB.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) en bf16; en RTX 3090 (24 GB) en bf16; en GPUs de 12-16 GB con cuantizacion de 8 o 4 bits.
- Opciones de despliegue: el modelo se carga con `AutoModelForImageTextToText` y `PeftModel` de PEFT, ya que los pesos del adaptador estan bajo `language_model`. Para servicio de alto rendimiento se puede fusionar el adaptador con el base y servir con vLLM o TGI; para entornos ligeros, convertir a GGUF y usar llama.cpp u Ollama. El ejemplo de la model card usa `transformers` con `device_map="auto"`.
- Latencia y throughput: no se han publicado mediciones de latencia en inferencia. El entrenamiento alcanzo 1.313 tokens por segundo en una A40, dato no extrapolable a inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Texel Support 9B | 58,2 M (LoRA sobre 9B) | 8.192 tokens | Soporte al cliente con tool calling para Texel | Apache 2.0 | Hugging Face (texellabs) |
| Qwen3.5-9B (base) | 9B | no disponible | Modelo generalista multimodal | no disponible | Hugging Face (Qwen, unsloth) |
| Adaptadores LoRA de soporte al cliente genericos | variable | variable | Soporte generico sin herramientas especificas | variable | variable |

La comparativa directa con alternativas de la misma categoria (agentes de soporte con tool calling sobre dominios concretos) no esta disponible en la informacion proporcionada. El unico punto de referencia cuantitativo es el propio modelo base, sobre el que el adaptador mejora 15,3 puntos en respuestas correctas y 32 puntos en coincidencia de llamadas a herramientas.

## Limitaciones y advertencias

- Solo escribe en ingles; no soporta castellano ni otros idiomas.
- Depende de herramientas en vivo: precios, GPUs y roadmap de Texel cambian, por lo que debe servirse con `search_docs` apuntando al sitio actualizado. Sin herramientas, el modelo no debe responder de memoria.
- Las herramientas de cartera son de solo lectura; el modelo no puede ejecutar compras, reembolsos, alquileres ni transferencias, y debe indicar al usuario donde hacerlo.
- Entrenado con datos sinteticos generados por un profesor de pesos abiertos y un usuario simulado, lo que puede introducir sesgos o patrones artificiales no representativos de usuarios reales.
- Riesgo de alucinacion en numeros y enlaces si no se ejecutan correctamente las herramientas; el entrenamiento descarto explicitamente ejemplos con datos no respaldados, pero el riesgo persiste en produccion.
- Evaluacion limitada a 72 chats reservados y a un unico juez automatico (DeepSeek V4 Pro), sin validacion humana publicada.
- El adaptador requiere cargar el base con `AutoModelForImageTextToText` y `PeftModel`; un uso incorrecto de la clase o del tokenizador puede degradar el rendimiento.
- Requiere un system prompt especifico con la fecha, la hora y el estado de autenticacion de la cartera ("No wallet is signed in." o "The user is signed in with the wallet 0x...").
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-9B puede tener sus propias condiciones que deben verificarse por separado.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/texellabs/texel-support-9b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Modelo base (version Unsloth): https://huggingface.co/unsloth/Qwen3.5-9B
- Sitio de Texel: https://texel.run
- Marketplace de GPUs: https://texel.run/marketplace
- Recibo del entrenamiento: https://texel.run/receipts/2026-11-11T19
