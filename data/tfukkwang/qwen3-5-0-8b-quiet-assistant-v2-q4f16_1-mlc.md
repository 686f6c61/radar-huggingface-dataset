# tfukkwang/Qwen3.5-0.8B-quiet-assistant-v2-q4f16_1-MLC

## Resumen
El modelo tfukkwang/Qwen3.5-0.8B-quiet-assistant-v2-q4f16_1-MLC es un ajuste fino de Qwen/Qwen3.5-0.8B orientado a actuar como asistente silencioso dentro de aplicaciones de trabajo complejas. No es un chatbot: no mantiene una caja de conversacion ni escribe texto. Su funcion es observar el contexto del usuario (perfil, hora, lugar, habitos, eventos recientes y pantalla) y emitir llamadas a herramientas de la aplicacion en cadena, siguiendo un bucle ReAct, tras cada pausa del usuario.

El modelo lo desarrolla el usuario tfukkwang y se distribuye compilado para MLC-LLM y WebLLM, de forma que se ejecuta integramente en el navegador sobre WebGPU. Sobre un modelo base de 0,8B parametros, el autor aplica primero SFT con LoRA r=16 y despues GRPO con perdida DAPO para aprender a decidir cual es la mejor herramienta en cada paso. La version v2 anade la herramienta `my_history`, que consulta lo que el usuario hizo en elementos anteriores del mismo paso.

El resultado se empaqueta en cuantizacion q4f16_1 con un peso de descarga de 0,43 GB, lo que lo hace apto para inferencia en navegador sin servidor. Es relevante como ejemplo de un patron distinto al asistente conversacional: un modelo pequeno, cuantizado y restringido por gramatica a una unica llamada de herramienta por paso, pensado para integrarse en el codigo de la aplicacion que escribe todo el texto final.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (ajuste fino sobre el transformer decoder-only de Qwen/Qwen3.5-0.8B; detalle no especificado) |
| Parametros totales | 0,8B (heredados del modelo base) |
| Parametros activos | no aplica (no se describe como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | q4f16_1 (esta build); existe variante q4f32_1 del mismo modelo |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | MLC-LLM (artefactos compilados para WebLLM/WebGPU); no se distribuye en safetensors ni GGUF |

## Arquitectura y entrenamiento
El modelo parte del checkpoint Qwen/Qwen3.5-0.8B y se ajusta en dos fases. La primera es un SFT de calentamiento con LoRA r=16, 2 epocas y 422 filas (211 momentos simulados cuyo mejor paso era `my_history` y otros 211 con su mejor llamada). El motivo declarado es que la version v1 nunca invocaba `my_history`, por lo que GRPO no tenia muestras correctas que reforzar. La segunda fase es GRPO con perdida DAPO (perdida a nivel de token, clip-higher 0,28, sin termino KL), LoRA r=16, 150 pasos y 8 muestras por prompt, sobre 846 de los 1.693 momentos simulados cuyas 8 recompensas diferian entre si. Todo el entrenamiento se realizo en una unica RTX 3090 en aproximadamente una hora.

Los datos son momentos simulados en tres aplicaciones (mesa de siniestros, purchase-to-pay y mesa de suscripcion de riesgos) generados con el codigo real de dichas apps, incorporando para cada usuario un pasado simulado (decide solo, sigue al asistente, descarta todas las tarjetas o mixto). La recompensa de cada posible llamada siguiente se calcula a partir del codigo de la aplicacion. Como innovacion destacable, v2 elimina la recompensa positiva por defecto de las busquedas innecesarias (paso de +0,2 a 0), ya que el modelo habia aprendido a invocar una busqueda como primera accion segura. En inferencia, el modelo se restringe con gramatica (WebLLM structural tags) para forzar exactamente una llamada de herramienta por paso.

## Capacidades
- Emision de llamadas a herramientas (tool calling / function calling) como unica salida: el modelo no genera texto libre, solo identificadores de herramienta y sus argumentos.
- Bucle de razonamiento ReAct: encadena llamadas consecutivas tras cada pausa del usuario.
- Catalogo comun de herramientas compartido entre aplicaciones: `queue`, `day_overview`, `open_item`, `item`, `playbook`, `guide_next_step`, `show_insight`, `summarize`, `autofill`, `open_tab`, `done`, mas las busquedas propias de cada app.
- Memoria de historial por paso: v2 incorpora `my_history` para consultar lo que el usuario hizo en elementos anteriores al mismo paso y adaptar la ayuda.
- Seleccion de contexto: mantiene en todo momento usuario, hora, lugar, habitos, eventos recientes y pantalla.
- Construccion de formularios y resumenes: las herramientas `autofill` y `summarize` permiten rellenar formularios y generar resumenes a partir de los datos de la app.
- Vision, audio, modo de pensamiento explicito y capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso
- Asistente embebido en una mesa de siniestros (claims desk): el modelo decide en cada pausa si conviene abrir la cola, entrar en un item o mostrar un insight, y el codigo de la app renderiza el contenido. Es adecuado porque su salida es una llamada de herramienta, no texto, y encaja en flujos donde el usuario no quiere un chat.
- Asistencia en procesos de purchase-to-pay: dado que el entrenamiento incluye este escenario con datos simulados, el modelo puede guiar el siguiente paso o autorellenar campos a partir del contexto de la operacion.
- Mesa de suscripcion de riesgos (underwriting workbench): aplicacion de entrenamiento donde el modelo selecciona entre playbook, guia de siguiente paso o resumen, segun el estado del expediente.
- Despliegue en una app nunca vista (generalizacion): la app de clinica, ausente del entrenamiento, alcanza un 63 % de pasos con la mejor llamada en la version v2, frente al 42 % de v1, lo que indica capacidad de transferencia a dominios nuevos.
- Personalizacion por perfil de usuario: con `my_history`, el modelo distingue a usuarios noveles de expertos y ajusta la ayuda; en la clinica, para usuarios expertos que siguen al asistente, la tasa de mejor llamada sube al 90 %.
- Autorelleno de formularios y generacion de resumenes: mediante `autofill` y `summarize`, la app puede completar formularios y producir resumenes del dia o de un expediente a partir de los datos devueltos por las herramientas.
- Vision del dia y planificacion: con `day_overview` y `queue`, el modelo puede proponer una vista de conjunto de la jornada del usuario sin intervencion manual.
- Ejecucion local en navegador: al ser una build MLC/WebLLM de 0,43 GB, sirve para aplicaciones web que quieren asistencia in situ sin coste de servidor ni envio de datos fuera del dispositivo.

## Benchmarks y rendimiento
Los unicos resultados publicados en la informacion disponible miden la proporcion de pasos en los que el modelo eligio la mejor llamada, comparando v1 y v2 con la misma build en navegador (WebLLM con gramatica de tool-call):

| Escenario (numero de pasos) | v1 | v2 |
|---|---|---|
| Clinica, recepcion (app nunca vista en entrenamiento), 569 pasos | 42 % | 63 % |
| Momentos nuevos en las apps de entrenamiento, 141 pasos | 46 % | 65 % |
| Clinica, usuario experto que sigue al asistente | 31 % | 90 % |

En evaluacion offline (pesos fusionados a 16 bits, decodificacion greedy, sin gramatica): clinica 76 % y momentos nuevos 74 %. El autor senala que la build q4 pierde buena parte de esa diferencia en usuarios expertos sin historial previo en los items, donde suele mostrar el siguiente paso en lugar de un insight. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware
- Tamano de descarga: 0,43 GB (repositorio de 0,4 GB), por lo que el modelo entra sin problema en memoria de GPU de consumo.
- VRAM estimada para inferencia en GPU dedicada: no disponible, aunque el reducido tamano del artefacto cuantizado lo situa en el rango de GPUs integradas y discretas modernas con soporte WebGPU.
- Ejecucion principal: navegador mediante WebLLM sobre WebGPU. Esta build q4f16_1 exige la caracteristica WebGPU `shader-f16`; la variante q4f32_1 usa los mismos pesos y funciona en cualquier WebGPU.
- GPU recomendadas (A100, H100, RTX 4090, etc.): no disponible.
- Compatibilidad con GPU de consumo: si, es su objetivo de diseno (inferencia en navegador); no se especifica un listado de modelos concretos.
- Opciones de despliegue: WebLLM y MLC-LLM. No se distribuye para vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponible. El unico dato temporal es de entrenamiento (aproximadamente una hora en una RTX 3090), no de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| quiet-assistant v2 q4f16_1 (este) | 0,8B | no disponible | 63 % clinica / 65 % momentos nuevos | Apache 2.0 | HuggingFace, MLC/WebLLM |
| quiet-assistant v2 q4f32_1 | 0,8B | no disponible | mismos pesos; offline 16 bits: 76 % clinica | Apache 2.0 | HuggingFace, MLC/WebLLM |
| quiet-assistant v1 | 0,8B | no disponible | 42 % clinica / 46 % momentos nuevos | Apache 2.0 | HuggingFace |
| Qwen3.5-0.8B (base) | 0,8B | no disponible | no disponible | Apache 2.0 | HuggingFace |

No se dispone de informacion sobre otros modelos de la misma categoria (asistentes de tool calling en navegador) que permitan una comparacion adicional; se indica como no disponible.

## Limitaciones y advertencias
- El modelo no escribe texto: su unica salida valida son llamadas a herramientas. Fuera de ese patron su utilidad practica es nula, y el texto final lo genera siempre el codigo de la aplicacion.
- Exige integracion estrecha con la app: es necesario implementar las herramientas y la gramatica de restriccion (WebLLM structural tags) para forzar una llamada por paso.
- Sesgo hacia las tres aplicaciones de entrenamiento: aunque generaliza a una app no vista (63 % frente a 42 % de v1), sigue habiendo un 37 % de pasos en los que no elige la mejor llamada en ese escenario.
- Perdida de precision por cuantizacion: la build q4 degrada el comportamiento en usuarios expertos sin historial previo en los items, donde tiende a mostrar el siguiente paso en lugar de un insight (la evaluacion offline a 16 bits mejora esos resultados).
- Requisito de hardware especifico: la variante q4f16_1 necesita WebGPU con `shader-f16`; en equipos sin esa caracteristica hay que usar la build q4f32_1.
- Idiomas soportados no declarados: no se especifica cobertura multilingue ni el idioma de los argumentos de las herramientas.
- Riesgo de alucinacion en la seleccion de herramienta: el autor documenta que v1 aprendio a invocar busquedas como primera accion segura, lo que obligo a modificar la recompensa (de +0,2 a 0) para penalizar llamadas innecesarias.
- Datos de entrenamiento simulados: aunque generados con el codigo real de las apps, son momentos simulados, lo que puede introducir sesgos respecto a trazas de usuarios reales.
- Madurez y soporte: en el momento de la consulta el repositorio registra 0 descargas y 0 me gusta, sin validacion externa ni garantia de mantenimiento.
- Licencia Apache 2.0 tanto del ajuste como del modelo base, sin restricciones declaradas para uso comercial en la informacion disponible.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/tfukkwang/Qwen3.5-0.8B-quiet-assistant-v2-q4f16_1-MLC
- Variante q4f32_1 del mismo modelo: https://huggingface.co/tfukkwang/Qwen3.5-0.8B-quiet-assistant-v2-q4f32_1-MLC
- Version v1 (quiet assistant): https://huggingface.co/tfukkwang/Qwen3.5-0.8B-quiet-assistant-v1-q4f32_1-MLC
- Video de demostracion (grabado con v1): https://huggingface.co/tfukkwang/Qwen3.5-0.8B-quiet-assistant-v1-q4f32_1-MLC/resolve/main/demo.webm
- Space de demostracion (Credit Copilot): https://huggingface.co/spaces/tfukkwang/credit-copilot-demo
- WebLLM: https://webllm.mlc.ai/
- Modelo base Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B/blob/main/LICENSE
