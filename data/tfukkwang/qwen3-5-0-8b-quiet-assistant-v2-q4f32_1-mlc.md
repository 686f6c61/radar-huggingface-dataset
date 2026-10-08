# tfukkwang/Qwen3.5-0.8B-quiet-assistant-v2-q4f32_1-MLC

## Resumen

Qwen3.5-0.8B-quiet-assistant-v2 es un ajuste fino del modelo base Qwen/Qwen3.5-0.8B, desarrollado por el usuario tfukkwang y distribuido en formato MLC-LLM para ejecutarse en el navegador mediante WebLLM y WebGPU. No es un asistente conversacional al uso: es un agente silencioso que corre en segundo plano dentro de aplicaciones de trabajo complejas y que no escribe texto nunca. Su salida consiste exclusivamente en llamadas a herramientas (tool calling), que el código de la aplicación interpreta para mostrar el siguiente paso, rellenar un formulario, generar un resumen o abrir una pestaña.

El modelo se entrena para observar el contexto del usuario (experiencia previa, hora, lugar, hábitos, eventos recientes y estado de la pantalla) y decidir, tras cada pausa de trabajo, qué llamada del conjunto de herramientas de la app es la más adecuada, encadenando llamadas al estilo ReAct. La novedad de la versión 2 es la incorporación de la consulta `my_history`, que permite recuperar lo que el usuario hizo en elementos anteriores del mismo paso y adaptar la ayuda a ese historial. Con 0,8 mil millones de parámetros y un peso de descarga de 0,43 GB, está pensado para inferencia local en el navegador, sin servidor ni conexión a la nube.

Es relevante porque demuestra un patrón poco habitual: especializar un modelo pequeño mediante SFT y GRPO para una tarea muy estrecha (selección de herramienta) y desplegarlo íntegramente en el cliente con WebGPU, con ganancias medibles frente a la versión anterior (del 42 % al 63 % de acierto en una aplicación nunca vista durante el entrenamiento). El repositorio no tiene descargas ni valoraciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only heredada del modelo base Qwen/Qwen3.5-0.8B; detalles no disponibles |
| Parametros totales | 0,8B (según el identificador del modelo base) |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | q4f32_1 (MLC, pesos de 4 bits con escalas en f32); existe un build alternativo q4f16_1 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | MLC-LLM compilado para WebGPU/WebLLM; no se publican safetensors ni GGUF |

Otros datos: tamano del repositorio 0,4 GB, descarga 0,43 GB, pipeline text-generation, libreria mlc-llm, creado el 2026-10-07 y actualizado el mismo dia.

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Qwen/Qwen3.5-0.8B, un transformer decoder-only de 0,8B parametros del que la model card no ofrece mas detalles (numero de capas, dimension oculta, atencion, contexto nativo). Sobre ese base se aplica un ajuste fino especifico de agente: el modelo no genera lenguaje natural, sino que emite una llamada a herramienta por paso, forzada mediante una gramatica de etiquetas estructurales de WebLLM. El conjunto de herramientas es comun a todas las aplicaciones (`queue`, `day_overview`, `open_item`, `item`, `playbook`, `guide_next_step`, `show_insight`, `summarize`, `autofill`, `open_tab`, `done`) mas las consultas propias de cada app.

El entrenamiento parte del asistente v1. Primero se hizo un calentamiento SFT con LoRA de rango 16 durante 2 epocas sobre 422 filas: 211 momentos simulados cuya mejor llamada es `my_history` (que v1 nunca emitia, por lo que GRPO no tenia muestras buenas que reforzar) mas 211 momentos con su mejor llamada. Despues se aplico GRPO con perdida DAPO (perdida a nivel de token, clip-higher 0,28, sin termino KL), LoRA r=16, 150 pasos y 8 muestras por prompt, sobre 846 de los 1.693 momentos simulados cuyas 8 recompensas diferian. Un detalle de diseno destacable: una consulta innecesaria puntua 0 (antes +0,2), porque el modelo habia aprendido a llamar a una herramienta de busqueda como primer movimiento seguro. Los datos se simularon en tres aplicaciones (mesa de siniestros, purchase-to-pay y mesa de suscripcion de riesgos) usando el codigo real de las apps, con un pasado simulado por usuario (decide solo, sigue al asistente, descarta todas las tarjetas o mixto). La recompensa de cada posible llamada proviene del codigo de la aplicacion. Todo el entrenamiento cupo en una RTX 3090 y duro aproximadamente una hora.

## Capacidades

- Seleccion de herramienta en un solo paso: emite exactamente una llamada por paso, restringida por gramatica, eligiendo entre el conjunto comun de herramientas y las consultas propias de cada aplicacion.
- Encadenamiento tipo ReAct: tras cada pausa del usuario ejecuta llamadas sucesivas para resolver una tarea paso a paso.
- Tool calling y function calling: es su unica salida; no produce texto libre.
- Memoria de historial por elemento (`my_history`): recupera lo que el usuario hizo en elementos anteriores del mismo paso y ajusta la ayuda, capacidad nueva de la version 2.
- Personalizacion por contexto del usuario: considera si es novel o experto, la hora, el lugar, sus habitos y los eventos recientes.
- Adaptacion a distintos estilos de usuario: los datos de entrenamiento cubren perfiles que deciden solos, que siguen al asistente, que descartan todas las tarjetas y perfiles mixtos.
- Transferencia a aplicaciones no vistas: el modelo obtuvo mejor resultado en una app de front office de clinica que no aparecia en el entrenamiento.
- Ejecucion local en navegador con WebGPU, sin backend de inferencia.
- No dispone de generacion de texto, vision, audio, matematicas ni razonamiento general documentados, ni se especifican capacidades multilingues.

## Casos de uso

- Mesa de siniestros (claims desk): el modelo observa la pantalla y el historial del tramitador y decide si conviene abrir el siguiente expediente de la cola, mostrar un insight o autocompletar un formulario, reduciendo la navegacion manual entre pantallas.
- Purchase-to-pay: en un flujo de aprobacion de facturas, el asistente selecciona el paso siguiente del playbook y recupera lo que el usuario hizo en facturas anteriores del mismo paso para no repetir criterios ya aplicados.
- Mesa de suscripcion de riesgos (underwriting workbench): guia al analista por el `playbook` del caso, autocompleta campos a partir de los datos ya presentes y propone resumenes del estado del expediente.
- Front office de clinica: escenario de validacion no visto en entrenamiento; el asistente ayuda a recepcionistas noveles a localizar el siguiente paso de cada paciente usando su historial de actuaciones previas.
- Asistente silencioso integrado en SaaS vertical: al no escribir texto, la aplicacion controla toda la redaccion y la interfaz solo renderiza los resultados de la herramienta, lo que evita respuestas generativas fuera de tono en entornos regulados.
- Onboarding de usuarios noveles: el contexto incluye el nivel de experiencia, y el modelo elige entre `guide_next_step` y `show_insight` segun si el usuario necesita guia explicita o solo un dato.
- Autocompletado de formularios largos: la herramienta `autofill` rellena campos a partir de los datos ya disponibles en la app, con el modelo decidiendo el momento adecuado para invocarla.
- Procesamiento local con requisitos de privacidad: al ejecutarse en el navegador del usuario mediante WebGPU, los datos del expediente no se envian a un servidor, lo que facilita el cumplimiento de normativa de proteccion de datos.
- Prototipado de agentes de tool calling en el navegador: sirve como banco de pruebas para arquitecturas de agente con gramatica forzada y una llamada por paso, sin infraestructura de GPU.
- Aplicaciones web o de escritorio desconectadas: funciona sin conexion una vez descargado el peso de 0,43 GB, util en entornos de campo o con red restringida.

## Benchmarks y rendimiento

La model card publica el porcentaje de pasos en los que el modelo eligio la mejor llamada, comparando v1 y v2 en el navegador con la gramatica de tool calling de WebLLM sobre las mismas filas.

| Escenario | v1 | v2 |
|---|---|---|
| Front office de clinica (app nunca vista en entrenamiento), 569 pasos | 42 % | 63 % |
| Momentos nuevos en las apps de entrenamiento, 141 pasos | 46 % | 65 % |
| Clinica, usuario experto que sigue al asistente | 31 % | 90 % |

En evaluacion offline, con pesos fusionados en 16 bits, decodificacion greedy y sin gramatica, los resultados son del 76 % en el escenario de clinica y del 74 % en momentos nuevos. El autor senala que el build q4 pierde buena parte de la diferencia en usuarios expertos sin historial en los elementos: a menudo muestra el siguiente paso en lugar de un insight. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- Inferencia exclusivamente en el cliente: requiere un navegador con soporte de WebGPU; no necesita CUDA ni servidor.
- Huella de pesos: 0,43 GB en el build q4f32_1, segun el tamano de descarga declarado. Hay que sumar la cache KV y la memoria de trabajo del runtime de WebLLM, cuyo consumo no se especifica.
- El build f32 (este repositorio) funciona en cualquier implementacion de WebGPU; el build f16 tiene los mismos pesos y es mas rapido donde este disponible la extension `shader-f16`.
- Al tratarse de un modelo de 0,8B cuantizado a 4 bits, cabe en GPU de consumo, en graficas integradas y en GPU de moviles compatibles con WebGPU; no se documentan modelos concretos de GPU ni requisitos minimos de VRAM.
- Opciones de despliegue: MLC-LLM y WebLLM en navegador. No se publican builds GGUF, de modo que llama.cpp y Ollama no son aplicables sin conversion previa.
- Latencia y throughput: no disponibles. El entrenamiento se realizo en una RTX 3090 durante aproximadamente una hora, un dato que no describe la inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Contexto | Rendimiento declarado | Licencia |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-quiet-assistant-v2 (q4f32_1) | 0,8B | MLC/WebLLM | no disponible | Clinica 63 %, momentos nuevos 65 % (navegador, con gramatica) | Apache 2.0 |
| Qwen3.5-0.8B-quiet-assistant-v2 (q4f16_1) | 0,8B | MLC/WebLLM | no disponible | Mismos pesos; no se publican resultados propios, solo que es mas rapido con `shader-f16` | Apache 2.0 |
| Qwen3.5-0.8B-quiet-assistant-v1 (q4f32_1) | 0,8B | MLC/WebLLM | no disponible | Clinica 42 %, momentos nuevos 46 % | Apache 2.0 |
| Qwen/Qwen3.5-0.8B (modelo base) | 0,8B | safetensors (formato habitual de Qwen) | no disponible | no disponible; no esta ajustado para tool calling en este dominio | Apache 2.0 |

No se dispone de datos que permitan comparar con otros asistentes de tool calling del mismo tamano, como variantes pequenas de familias orientadas a function calling: no disponible.

## Limitaciones y advertencias

- No genera texto: cualquier redaccion debe hacerla el codigo de la aplicacion a partir de los datos devueltos por la herramienta. No es util como chatbot ni para tareas de generacion.
- Tasa de acierto limitada: incluso en su mejor escenario en navegador acierta la mejor llamada en el 63-65 % de los pasos, y en el escenario de usuario experto la version cuantizada a 4 bits baja del 90 % offline al degradarse en perfiles sin historial.
- Cuantizacion agresiva: el autor reconoce que el build q4 pierde parte de la capacidad del modelo fusionado en 16 bits, especialmente al elegir entre mostrar un insight y mostrar el siguiente paso.
- Dominio muy estrecho: los datos de entrenamiento se simulan en tres aplicaciones concretas; el comportamiento fuera de flujos de trabajo similares no esta documentado.
- Dependencia de la gramatica: forzar una unica llamada por paso mediante etiquetas estructurales de WebLLM condiciona el comportamiento; sin ella (modo offline greedy) los resultados cambian.
- Idiomas soportados: no disponible. No hay evidencia de capacidades multilingues.
- Longitud de contexto y limites de ventana: no disponibles. El autor describe que el contexto siempre incluye perfil de usuario, hora, lugar, habitos, eventos recientes y pantalla, pero no cuantifica el numero de tokens.
- Riesgo de alucinacion en la seleccion de herramienta: una llamada equivocada puede abrir un elemento incorrecto, autocompletar campos con datos no pertinentes o mostrar un insight irrelevante. El entrenamiento penaliza con 0 las consultas innecesarias precisamente para mitigar este patron.
- Sin validacion de la comunidad: el repositorio muestra 0 descargas y 0 likes, y las fechas de creacion y actualizacion son muy proximas, lo que indica ausencia de uso en produccion.
- Licencia: Apache 2.0, que permite uso comercial, pero la licencia enlazada corresponde al modelo base Qwen/Qwen3.5-0.8B, por lo que conviene verificar las condiciones de la familia Qwen antes de desplegar.
- Idoneidad para produccion: al ser un artefacto de investigacion con benchmarks limitados a un unico eje (eleccion de herramienta), no se recomienda su uso en flujos criticos sin evaluacion propia y un mecanismo de confirmacion por parte del usuario.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tfukkwang/Qwen3.5-0.8B-quiet-assistant-v2-q4f32_1-MLC
- Build alternativo q4f16_1: https://huggingface.co/tfukkwang/Qwen3.5-0.8B-quiet-assistant-v2-q4f16_1-MLC
- Version anterior v1: https://huggingface.co/tfukkwang/Qwen3.5-0.8B-quiet-assistant-v1-q4f32_1-MLC
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B/blob/main/LICENSE
- Video de demostracion (grabado con v1): https://huggingface.co/tfukkwang/Qwen3.5-0.8B-quiet-assistant-v1-q4f32_1-MLC/resolve/main/demo.webm
- Demo interactiva Credit Copilot: https://huggingface.co/spaces/tfukkwang/credit-copilot-demo
- WebLLM: https://webllm.mlc.ai/
