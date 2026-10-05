# tfukkwang/Qwen3.5-0.8B-tool-router-v2-q4f32_1-MLC

## Resumen

Qwen3.5-0.8B-tool-router-v2-q4f32_1-MLC es un ajuste fino del modelo Qwen/Qwen3.5-0.8B, publicado por el usuario tfukkwang. No es un modelo conversacional convencional: esta especializado como enrutador de herramientas (tool router) en modo puro, de manera que responde a cada mensaje del usuario con exactamente una llamada a herramienta en formato `<tool_call>` y no genera texto libre. La aplicacion que lo integra es la encargada de redactar todas las frases que ve el usuario.

El modelo se distribuye ya convertido al formato de MLC-LLM con cuantizacion `q4f32_1` (0,43 GB de descarga) para ejecutarse directamente en el navegador mediante WebLLM sobre WebGPU, sin necesidad de backend ni API externa. Con 0,8 mil millones de parametros, su objetivo es dotar de capacidades de enrutamiento de herramientas y function calling a aplicaciones web que corren en el cliente.

Su interes tecnico esta en el flujo de entrenamiento: demuestra que se puede destilar un comportamiento agentico fiable en un modelo sub-1000M mediante SFT con LoRA (r=16) seguido de un paso corto de GRPO, y empaquetarlo despues para inferencia local en el navegador. Se publica bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de tipo decoder, heredada de Qwen/Qwen3.5-0.8B (no se detallan mas particularidades) |
| Parametros totales | 0,8 mil millones (segun el nombre del modelo base) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | `q4f32_1` (este build); existe un build alternativo `q4f16_1` con los mismos pesos |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | MLC-LLM (pesos y libreria WebGPU/WASM; no se distribuye en safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo parte de los pesos originales de Qwen/Qwen3.5-0.8B, un transformer de tipo decoder de 0,8 mil millones de parametros. Sobre esos pesos se aplico un ajuste fino con LoRA de rango 16 (SFT) usando 3.000 conversaciones generadas en modo puro sobre 30 aplicaciones ficticias, cada una con sus propios nombres de herramientas, argumentos y enumeraciones. El objetivo de esa diversidad es que el modelo aprenda enrutamiento de herramientas de forma general y no ligado a una sola aplicacion.

Tras el SFT se aplico un paso de GRPO de 40 iteraciones, con 8 muestras por prompt, sobre 160 prompts que el modelo SFT acertaba solo de forma parcial. El reward comprueba la herramienta elegida y sus argumentos y penaliza cualquier argumento que el usuario no haya pedido. Los prompts de GRPO fueron escritos por Qwen3.5-35B-A3B y solo se conservaron aquellos en los que dos profesores (un router de 2B y DeepSeek) coincidian en la misma llamada.

La conversion final fusiona los pesos y los transforma al formato MLC `q4f32_1` para la libreria WebGPU oficial de Qwen3.5-0.8B, sin necesidad de recompilar el binario.

## Capacidades

- Enrutamiento de herramientas en modo puro: cada respuesta es exactamente un bloque `<tool_call>`, sin texto adicional.
- Peticiones de datos: invoca herramientas de listado, conteo, registro y generacion de graficos, extrayendo los filtros de las palabras del usuario.
- Juicio y asesoria: deriva a la herramienta de experto de la aplicacion.
- Acciones (aprobar, cancelar, etc.): solo las emite cuando el usuario lo pide de forma explicita.
- Conversacion social: saludos, agradecimientos, despedidas y preguntas del tipo "que puedes hacer" se resuelven con la herramienta `small_talk`.
- Fuera de dominio: las peticiones ajenas a la aplicacion se clasifican como `unsupported`.
- Datos faltantes: si la peticion necesita un identificador que el usuario no ha facilitado, responde con `ask_user`.
- Se recomienda forzar una unica llamada por respuesta mediante gramatica (etiquetas estructurales de WebLLM).
- Sin modo de razonamiento: la propia guia de uso indica `enable_thinking: false`.

## Casos de uso

- Enrutamiento de herramientas en aplicaciones web que corren integramente en el navegador: con WebLLM y WebGPU, el modelo decide que funcion de la aplicacion llamar sin enviar datos a un servidor, lo que es util para escenarios con requisitos de privacidad.
- Copilotos de gestion de creditos o riesgos: el propio autor publica una demo (credit-copilot-demo) en la que el modelo decide entre consultar datos, pedir asesoria o disparar acciones de aprobacion.
- Mesas de soporte (help desk): enrutar cada mensaje del usuario hacia la herramienta de consulta o accion adecuada mientras la aplicacion controla la redaccion de la respuesta.
- Gestion de solicitudes internas: por ejemplo, peticiones de vacaciones o pedidos de tienda, donde el modelo traduce lenguaje natural a llamadas de listado, conteo o accion.
- Generacion de informes y graficos bajo demanda: al interpretar filtros y ordenaciones, puede activar herramientas de listado, conteo o creacion de graficos a partir de peticiones en lenguaje natural.
- Prototipado de function calling sin backend: sirve para validar rapidamente el diseno de un conjunto de herramientas en el navegador antes de invertir en infraestructura de servidor.
- Clasificacion de intenciones y derivacion: las categorias `small_talk`, `unsupported` y `ask_user` permiten separar conversacion trivial, peticiones fuera de dominio y solicitudes incompletas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La unica evaluacion reportada es especifica de la tarea de enrutamiento, realizada en navegador sobre cuatro aplicaciones no vistas durante el entrenamiento (suscripcion de creditos, mesa de soporte, solicitudes de vacaciones y pedidos de tienda), con un total de 82 turnos.

| Escenario | Aciertos | Total | Tasa |
|---|---|---|---|
| Router solo | 72 | 82 | 87,8 % |
| Router + guardas de codigo de la aplicacion | 76 | 82 | 92,7 % |

Las "guardas" son pequenas correcciones en el codigo de la aplicacion; por ejemplo, pedir un identificador que falta en lugar de intentar adivinarlo.

## Requisitos de hardware

- Al ser un build de MLC-LLM para WebLLM, la inferencia esta pensada para ejecutarse en el navegador sobre WebGPU; el peso descargable es de 0,43 GB.
- No requiere GPU de servidor: funciona en cualquier GPU con soporte WebGPU. El build `q4f32_1` (f32) es el mas compatible; el build `q4f16_1` es mas rapido pero exige la caracteristica `shader-f16`.
- No se dispone de cifras oficiales de VRAM, latencia ni throughput en la informacion proporcionada.
- Opciones de despliegue: WebLLM / MLC-LLM en el navegador. Al estar empaquetado como libreria WebGPU oficial de Qwen3.5-0.8B, no requiere compilacion adicional.
- No se documentan rutas de despliegue en servidor (vLLM, llama.cpp, Ollama, TGI) para este artefacto concreto, ya que se distribuye unicamente en formato MLC para navegador.

## Comparativa con modelos similares

| Modelo | Parametros | Formato / destino | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| tfukkwang/Qwen3.5-0.8B-tool-router-v2-q4f32_1-MLC | 0,8 B | MLC / WebGPU (navegador) | no disponible | Apache 2.0 | Router puro, sin texto; maxima compatibilidad WebGPU |
| tfukkwang/Qwen3.5-0.8B-tool-router-v2-q4f16_1-MLC | 0,8 B | MLC / WebGPU (navegador) | no disponible | Apache 2.0 | Mismos pesos, mas rapido, requiere `shader-f16` |
| Qwen/Qwen3.5-0.8B (modelo base) | 0,8 B | safetensors y otros | no disponible | Apache 2.0 | Modelo generalista multilingue y multimodal segun su familia; no especializado en routing |
| Router de 2B v2 (mencionado como profesor en el entrenamiento) | ~2 B | no disponible | no disponible | no disponible | Comparte datos de SFT con este modelo; no se aportan mas especificaciones |

## Limitaciones y advertencias

- Es un modelo exclusivamente de enrutamiento: no es un modelo de chat y no debe usarse para generar texto libre.
- Puede omitir ocasionalmente un filtro o una ordenacion solicitados, o contar cuando el usuario ha pedido un listado; conviene validar la llamada en codigo cuando el resultado sea critico.
- Nunca debe ejecutar herramientas de accion sin palabras explicitas del usuario; esa comprobacion debe hacerse en la aplicacion.
- No se especifican los idiomas soportados; el entrenamiento se describe sobre conversaciones en ingles, por lo que el rendimiento en castellano es incierto.
- No hay datos de sesgos, de riesgo de alucionacion ni de comportamiento fuera del dominio de enrutamiento.
- La licencia Apache 2.0 permite uso comercial, pero se heredan las condiciones del modelo base Qwen/Qwen3.5-0.8B.
- Adopcion muy baja en el momento de la ficha (10 descargas, 0 likes), sin historial de uso en produccion.
- Depende de WebGPU en el cliente, lo que excluye navegadores o dispositivos sin soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tfukkwang/Qwen3.5-0.8B-tool-router-v2-q4f32_1-MLC
- Build alternativo f16: https://huggingface.co/tfukkwang/Qwen3.5-0.8B-tool-router-v2-q4f16_1-MLC
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B/blob/main/LICENSE
- Demo (credit copilot): https://huggingface.co/spaces/tfukkwang/credit-copilot-demo
- WebLLM: https://webllm.mlc.ai/
- Libreria binaria MLC-LLM para WebGPU: https://github.com/mlc-ai/binary-mlc-llm-libs
- Repositorio de la serie Qwen3.5 (terceros): https://github.com/ABDtmx/Qwen3.5
- Ficha de Qwen3.5 0.8B en Ollama: https://ollama.com/library/qwen3.5:0.8b
- Descarga GGUF de Qwen3.5 0.8B (terceros): https://local-ai-zone.github.io/models/qwen3-5-0-8b.html
