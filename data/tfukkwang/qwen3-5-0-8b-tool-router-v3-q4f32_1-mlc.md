# tfukkwang/Qwen3.5-0.8B-tool-router-v3-q4f32_1-MLC

## Resumen

Qwen3.5-0.8B-tool-router-v3 es un ajuste fino de Qwen/Qwen3.5-0.8B (0,8 mil millones de parametros) desarrollado por el usuario tfukkwang, disenado para funcionar exclusivamente como enrutador de herramientas (tool router). Su funcion no es conversar, sino responder a cada mensaje del usuario con exactamente una llamada a herramienta (`<tool_call>`) y ningun texto libre: la aplicacion anfitriona se encarga de generar todas las frases. Esta orientado a ejecutarse integramente en el navegador mediante WebLLM sobre WebGPU, con un peso de descarga de unos 0,43 GB.

El modelo se distribuye ya convertido al formato MLC en la cuantizacion `q4f32_1` (build f32), compatible con cualquier implementacion de WebGPU, y existe una variante `q4f16_1` (build f16) mas rapida que requiere la extension `shader-f16`. La relevancia actual radica en que permite desplegar enrutamiento de funciones en clientes web sin backend, sin GPU dedicada y con un modelo sub-gigabyte.

Se trata de un modelo especializado y de nicho: no es un modelo de chat generalista y esta pensado para integrarse en aplicaciones concretas mediante un system prompt con la lista de herramientas en formato Qwen (`<tools>...</tools>`) y decodificacion voraz.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (hereda la del modelo base Qwen/Qwen3.5-0.8B) |
| Parametros totales | 0,8 mil millones |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | q4f32_1 (build f32); existe build alternativa q4f16_1 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | MLC (mlc-llm), compilado para WebGPU (model_lib en wasm) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B y se especializa mediante un proceso en dos fases. La primera (v2) consiste en un SFT con LoRA (rango 16) sobre el modelo base, entrenado con 3.000 conversaciones generadas en modo "puro" (una unica llamada a herramienta por respuesta) sobre 30 aplicaciones ficticias, cada una con sus propios nombres de herramientas, argumentos y enumeraciones. A continuacion se aplica GRPO durante 40 pasos, con 8 muestras por prompt, sobre 160 prompts que el modelo SFT resolvia solo parcialmente. La funcion de recompensa valida la herramienta y sus argumentos y penaliza cada argumento que el usuario no haya pedido.

La version v3 (este modelo) anade una segunda ronda de GRPO sobre v2 centrada en conversaciones multiturno. Los turnos previos provienen de plantillas con punteros a resultados de herramientas de la aplicacion, y el ultimo mensaje lo redacta DeepSeek en 13 tipos de seguimiento ("el segundo", "ese", un filtro nuevo, ordenacion, umbral, grafico, comparacion, etc.). Solo se conservan los prompts en los que dos profesores (DeepSeek y Qwen3.5-27B) eligieron la misma llamada. Se realizan 120 pasos, 8 muestras por prompt, sobre 750 prompts minados por dispersion de recompensa a partir de 3.116. Finalmente, los pesos fusionados se convierten a MLC `q4f32_1` para la libreria WebGPU oficial de Qwen3.5-0.8B, sin recompilacion adicional.

## Capacidades

- Enrutamiento de herramientas en modo puro: cada respuesta es exactamente una llamada `<tool_call>`, sin texto.
- Enrutamiento de peticiones de datos hacia herramientas de listado, conteo, registro y grafico, con filtros extraidos de las palabras del usuario.
- Seleccion de juicio y asesoramiento hacia una herramienta experta.
- Ejecucion de acciones (aprobar, cancelar, etc.) unicamente cuando el usuario lo pide de forma explicita.
- Rutas de control: `small_talk` para saludos, agradecimientos, despedidas y "que puedes hacer"; `unsupported` para peticiones ajenas a la aplicacion; `ask_user` cuando falta un identificador necesario.
- Enrutamiento multiturno con seguimientos del tipo "el segundo", "ese", nuevos filtros, ordenacion, umbrales, graficos o comparaciones.
- Generalizacion entre aplicaciones: cada app define sus propias herramientas, argumentos y enumeraciones, de modo que el modelo aprende el enrutamiento en general y no una sola app.
- Compatibilidad con gramatica forzada (WebLLM structural tags) para obligar a una unica llamada por respuesta.
- No soporta generacion de texto conversacional, vision, audio ni razonamiento abierto.

## Casos de uso

- Enrutador de funciones en aplicaciones web sin backend: el modelo se ejecuta en el navegador con WebLLM y decide que herramienta invocar, mientras el codigo de la app construye las respuestas.
- Copiloto de analisis de datos: traduce peticiones como "muestrame las ventas del ultimo trimestre" en llamadas a herramientas de listado, conteo o grafico con los filtros correspondientes.
- Asistente de tramitacion con acciones: gestiona peticiones de aprobacion o cancelacion, invocando la herramienta de accion solo cuando el usuario lo pide explicitamente.
- Soporte al cliente de segundo nivel: canaliza cada consulta hacia la herramienta de datos o la herramienta experta segun la intencion detectada.
- Aplicaciones de gestion de pedidos: interpreta seguimientos multiturno sobre listas ya presentadas ("el segundo", "ordenalos por fecha") y emite la llamada adecuada.
- Sistemas de gestion de solicitudes de ausencia o incidencias: enruta cada mensaje a la herramienta de consulta o de registro correspondiente segun los parametros mencionados.
- Filtrado de alcance en productos cerrados: deriva a `unsupported` las peticiones fuera de dominio y a `small_talk` los saludos, evitando invocaciones invalidas.
- Recogida de datos faltantes: cuando falta un identificador, emite `ask_user` en lugar de adivinar, lo que permite solicitar la informacion al usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor proporciona una evaluacion propia en navegador sobre cuatro aplicaciones no vistas durante el entrenamiento (suscripcion de credito, mesa de soporte, solicitudes de ausencia y pedidos de tienda), con 82 turnos:

| Modelo | Acierto solo con el enrutador | Acierto tras guardas de la app |
|---|---|---|
| tool-router v3 (este modelo, 0.8B) | 71/82 | 79/82 |
| tool-router v2 (0.8B) | 72/82 | 78/82 |
| enrutador v2 de 2B | 74/82 | 76/82 |

Las guardas son pequenos ajustes de codigo en la aplicacion (por ejemplo, pedir un identificador ausente en lugar de adivinarlo).

## Requisitos de hardware

- Inferencia en navegador sobre WebGPU; no requiere backend ni GPU dedicada.
- Peso de descarga del build `q4f32_1`: aproximadamente 0,43 GB (tamano de repo indicado: 0,4 GB).
- El build f32 (`q4f32_1`) funciona en cualquier implementacion de WebGPU.
- El build f16 (`q4f16_1`) es mas rapido pero exige la caracteristica `shader-f16` del navegador/GPU.
- Cabe en GPU de consumo; al ejecutarse en el navegador puede correr sobre GPUs integradas o dedicadas que soporten WebGPU.
- Despliegue: WebLLM (`@mlc-ai/web-llm`), libreria `mlc-llm` y `model_lib` en WebGPU (wasm) de la libreria oficial de Qwen3.5-0.8B.
- VRAM concreta, latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Enfoque | Licencia | Acierto (router solo) |
|---|---|---|---|---|---|
| tool-router v3 q4f32_1 (este) | 0,8B | MLC / WebGPU (f32) | Enrutador de herramientas multiturno, en navegador | apache-2.0 | 71/82 |
| tool-router v3 q4f16_1 | 0,8B | MLC / WebGPU (f16) | Mismos pesos, mas rapido, requiere shader-f16 | apache-2.0 | no disponible (mismos pesos) |
| tool-router v2 (0.8B) | 0,8B | no disponible | Version previa, sin GRPO multiturno | no disponible | 72/82 |
| Enrutador v2 de 2B | 2B | no disponible | Enrutador de mayor tamano | no disponible | 74/82 |
| Qwen/Qwen3.5-0.8B (base) | 0,8B | safetensors (formato original) | Modelo base generalista | apache-2.0 | no aplica (no es enrutador) |

## Limitaciones y advertencias

- Solo enruta: no es un modelo de chat y no genera texto conversacional.
- Puede omitir un filtro o un criterio de ordenacion solicitado, o contar cuando el usuario pedia un listado. Conviene verificar la llamada en el codigo cuando sea critico.
- No debe ejecutar herramientas de accion sin palabras explicitas del usuario; esa comprobacion debe hacerse en la aplicacion.
- En la evaluacion propia acierta 71/82 sin guardas, por lo que requiere codigo de salvaguarda en produccion para alcanzar 79/82.
- Los datos de entrenamiento proceden de aplicaciones ficticias generadas y de profesores automaticos (DeepSeek, Qwen3.5-27B, enrutador de 2B), lo que puede introducir sesgos hacia esos esquemas de herramientas y de lenguaje.
- Idiomas soportados no especificados; el entrenamiento descrito se realizo en ingles.
- Longitud de contexto no disponible; enrutamientos multiturno largos pueden degradarse.
- Riesgo de alucinacion en nombres de herramientas o argumentos si el system prompt no declara bien las herramientas.
- Licencia apache-2.0, lo que permite uso comercial, sujeto a las condiciones del modelo base Qwen/Qwen3.5-0.8B.
- Se recomienda decodificacion voraz (`temperature: 0`), `enable_thinking: false` y forzar una unica llamada con gramatica, tal como indica el autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tfukkwang/Qwen3.5-0.8B-tool-router-v3-q4f32_1-MLC
- Build f16: https://huggingface.co/tfukkwang/Qwen3.5-0.8B-tool-router-v3-q4f16_1-MLC
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B/blob/main/LICENSE
- Demo (Credit Copilot): https://huggingface.co/spaces/tfukkwang/credit-copilot-demo
- WebLLM: https://webllm.mlc.ai/
