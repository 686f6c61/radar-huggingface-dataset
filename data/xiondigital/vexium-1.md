# XiONDiGiTaL/Vexium-1

## Resumen

Vexium-1 es un empaquetado del modelo Mistral-Nemo-Instruct-2407 de Mistral AI (12.247 millones de parametros) distribuido por XiONDiGiTaL como motor de asistente local para Kryvex, una aplicacion de escritorio de navegador y espacio de trabajo. No se trata de un reentrenamiento, merge ni fine-tuning: los pesos son identicos a los del modelo base. Lo que aporta el repositorio es una cuantizacion Q4_K_M en formato GGUF y una plantilla de chat ("Vexium template") que incorpora un preambulo de operacion con reglas de comportamiento, como responder siempre en el idioma del usuario (con soporte destacado del turco y sus caracteres propios), no citar cifras volatiles de memoria ni inventar hechos o URLs.

Su relevancia reside en el enfoque de "contrato de operacion": en lugar de modificar los pesos, el comportamiento seguro (verificacion de datos, citas solo de fuentes suministradas, busqueda web cuando hace falta) se delega a la plantilla y a las herramientas que orquesta Kryvex. El modelo soporta contexto nativo de 128k tokens, aunque Kryvex lo ejecuta a 4.096, y esta publicado bajo licencia Apache-2.0 heredada de Mistral AI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredado de Mistral-Nemo-Instruct-2407) |
| Parametros totales | 12.247.782.400 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128k nativa; Kryvex lo ejecuta a 4.096 tokens |
| Tipos de cuantizacion | Q4_K_M (GGUF, 7.477.209.792 bytes) |
| Idiomas soportados | ingles, turco, espanol, aleman, frances |
| Licencia | Apache-2.0 (con atribucion a Mistral AI) |
| Formato de pesos | GGUF (un unico archivo Q4_K_M); tamano del repo: 15,0 GB |

## Arquitectura y entrenamiento

Vexium-1 no incorpora ninguna innovacion arquitectonica propia: se basa integramente en Mistral-Nemo-Instruct-2407, un modelo instructo de 12B de Mistral AI construido sobre la arquitectura transformer. Segun la model card, no se ha realizado ningun entrenamiento: los cambios respecto al modelo base se limitan a los metadatos `general.name`, `general.description` y a la plantilla de chat (`tokenizer.chat_template`).

La plantilla Vexium anade un preambulo operativo que instruye al modelo para: responder unicamente en el idioma del ultimo mensaje del usuario (incluido el turco con sus caracteres especificos ı, İ, ş, ğ, ç, ö, ü); encabezar la respuesta con el resultado sin frases del tipo "como IA"; abstenerse de afirmar de memoria precios, tasas o cifras volatiles (indicando que deben consultarse); y no inventar hechos, citas ni URLs, usando citas entre corchetes solo para fuentes realmente suministradas. El conocimiento del modelo procede del modelo base y se detiene en su fecha de corte de entrenamiento.

## Capacidades

- Generacion de texto conversacional multi-turno heredada de Mistral-Nemo-Instruct-2407.
- Respuesta en el idioma del usuario con soporte de primera clase para turco, espanol, ingles, aleman y frances.
- Abstencion verifiable: el modelo esta instruido para pedir una busqueda en lugar de inventar cifras o hechos cuando no dispone de fuentes.
- Citas entre corchetes restringidas a fuentes efectivamente suministradas en el contexto.
- Uso de herramientas: orquestado externamente por Kryvex (busqueda web y lectura de paginas en el proceso principal), no mediante tool calling nativo del archivo GGUF; otros clientes reciben el preambulo pero deben implementar sus propias herramientas.
- Razonamiento y codigo: capacidades heredadas del modelo base, sin datos de evaluacion propios publicados.

## Casos de uso

- Asistente local en la aplicacion Kryvex: funciona como motor de conversacion integrado en el navegador de escritorio, con verificacion del archivo (tamano y SHA-256) antes de su uso.
- Consultas con datos en tiempo real: ante preguntas como el precio actual de Bitcoin, el modelo solicita una busqueda y Kryvex ejecuta la consulta web, inyecta los resultados en el contexto y el modelo responde citando la fuente suministrada.
- Asistente en turco: la interfaz de Kryvex esta traducida y la plantilla fuerza respuestas en turco con ortografia correcta, util para productos orientados al mercado turco.
- Respuestas a preguntas estaticas sin busqueda: consultas de conocimiento general (por ejemplo, capitales de pais) que el modelo responde directamente sin invocar herramientas.
- Servidor local con API compatible con OpenAI: mediante `llama-server --jinja` se expone un endpoint `/v1/chat/completions` consumible con curl o cualquier cliente estandar.
- Despliegue en hardware de consumo: con unos 9-10 GB de VRAM a 4k de contexto, cabe en GPUs de gama alta de consumo o incluso en RAM del sistema reduciendo las capas offloaded.
- Base para otros clientes con plantillas propias: cualquier cliente que respete la plantilla Jinja obtiene el mismo comportamiento desde el primer token.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El propio autor lo declara explicitamente: no se ha ejecutado ninguna suite de evaluacion y no se reivindica ninguna puntuacion, incluido el turco. Los unicos datos de rendimiento son pruebas puntuales de comportamiento (cuatro prompts en turco e ingles) y una velocidad de generacion medida: aproximadamente 73 tokens/s a 4k de contexto en una RX 7900 XT con backend Vulkan.

## Requisitos de hardware

- VRAM estimada: unos 9-10 GB a 4k de contexto; alternativamente, RAM del sistema reduciendo el parametro `-ngl` (offload parcial de capas).
- Almacenamiento: aproximadamente 8,2 GB en disco para el archivo GGUF.
- GPU de referencia del autor: AMD Radeon RX 7900 XT con backend Vulkan, logrando ~73 tokens/s a 4k de contexto.
- Compatible con GPUs NVIDIA (CUDA), AMD (ROCm o Vulkan) y CPU pura mediante llama.cpp.
- Ejecucion verificada con llama.cpp: `llama-server -m vexium-1-12b-q4_k_m.gguf --jinja -ngl 99 -c 4096 --port 8080`. Es imprescindible el flag `--jinja`, ya que sin el llama.cpp ignora la plantilla Vexium y usa una generica.
- Alternativa de despliegue: descarga integrada dentro de Kryvex (Vexium → Models → Vexium-1 12B), con verificacion automatica del numero de bytes y del SHA-256.
- No se menciona soporte ni rendimiento en vLLM, Ollama o TGI.

## Comparativa con modelos similares

| | Vexium-1 12B | Mistral-Nemo-Instruct-2407 (base) | Llama 3.1 8B Instruct |
|---|---|---|---|
| Parametros | 12.247 millones | 12.247 millones | ~8.000 millones |
| Contexto | 128k (ejecutado a 4k en Kryvex) | 128k | 128k |
| Pesos | GGUF Q4_K_M | safetensors (BF16) | safetensors / GGUF (comunidad) |
| Licencia | Apache-2.0 | Apache-2.0 | Licencia Llama 3.1 |
| Idiomas destacados | en, tr, es, de, fr | multilingue (12 idiomas) | multilingue (8 idiomas) |
| Entrenamiento propio | ninguno (reempaquetado) | preentrenamiento + instruct propio | preentrenamiento + instruct propio |
| Diferenciador | plantilla operativa y verificacion de integridad para Kryvex | modelo original de Mistral AI | ecosistema mas amplio, licencia mas restrictiva |

## Limitaciones y advertencias

- No hay ningun entrenamiento propio: todo el comportamiento diferencial procede de la plantilla de chat y de las herramientas externas de Kryvex, no de los pesos.
- Sin suite de benchmarks: no existen puntuaciones publicadas (MMLU, GSM8K, etc.) para este empaquetado ni para su comportamiento en turco; las pruebas mostradas son verificaciones puntuales, no una evaluacion sistematica.
- Riesgo de alucinacion inherente a un modelo de 12B cuantizado a Q4: el propio autor reconoce que "un modelo de 12B a Q4 sigue equivocandose en detalles", y la plantilla esta disenada para que pida una busqueda en lugar de improvisar.
- La plantilla solo surte efecto si el cliente la respeta: con `llama.cpp` hay que usar `--jinja`; sin ese flag se aplica una plantilla generica y se pierde el contrato de operacion.
- El uso de herramientas no esta integrado en el archivo: cada cliente debe implementar su propia orquestacion de busqueda y lectura de paginas.
- El conocimiento se detiene en la fecha de corte de los datos de entrenamiento del modelo base.
- Kryvex ejecuta el modelo a 4.096 tokens de contexto, muy por debajo de los 128k nativos, lo que limita el tamano de documentos y conversaciones en ese producto.
- Licencia: Apache-2.0 permite uso comercial, pero debe conservarse la atribucion a Mistral AI; el nombre "Vexium" pertenece a XiONDiGiTaL.
- Proyecto de distribucion muy pequeno (78 descargas y 1 like en el momento de la ficha), sin comunidad ni historial de auditoria; conviene verificar el SHA-256 publicado (`26b5ad94d602c462cfdbe9f005cbdab8e66d60718d1054afc7060d42065b6ecb`) antes de usarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/XiONDiGiTaL/Vexium-1
- Modelo base: https://huggingface.co/mistralai/Mistral-Nemo-Instruct-2407
- Sitio del producto Kryvex: https://xiondigital.net
- Plantilla de chat: `vexium-template.jinja` en el repositorio de Hugging Face
