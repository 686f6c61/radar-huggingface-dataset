# tfukkwang/Qwen3.5-0.8B-tool-router-v3-q4f16_1-MLC

## Resumen

Qwen3.5-0.8B-tool-router-v3 es un fine-tune de Qwen/Qwen3.5-0.8B publicado por el usuario tfukkwang cuyo unico proposito es actuar como enrutador de herramientas (tool router) en modo puro: responde a cada mensaje del usuario con exactamente una llamada a herramienta en formato `<tool_call>` y no genera texto libre. La aplicacion anfitriona es la que redacta todas las frases; el modelo solo decide que herramienta invocar y con que argumentos.

El modelo se distribuye ya convertido al formato de MLC-LLM con cuantizacion `q4f16_1`, lo que permite ejecutarlo integramente en el navegador mediante WebLLM sobre WebGPU, sin servidor. El repositorio ocupa 0,4 GB y el autor ofrece una build alternativa en `q4f32_1` con los mismos pesos para equipos WebGPU que no exponen la caracteristica `shader-f16`.

Su relevancia es practica: cubre el hueco de los enrutadores de herramientas muy pequenos (0,8B) que pueden desplegarse en cliente, con licencia Apache 2.0 y con un entrenamiento especifico contra argumentos inventados (la recompensa de GRPO penaliza cada argumento que el usuario no ha pedido). El autor reporta 71/82 aciertos de enrutado en aislamiento y 79/82 tras las guardas de codigo de la aplicacion, sobre un conjunto de cuatro aplicaciones no vistas durante el entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen/Qwen3.5-0.8B), con fine-tune LoRA (r=16) fusionado y convertido a MLC |
| Parametros totales | 0,8B (modelo base Qwen/Qwen3.5-0.8B) |
| Parametros activos | No aplica; no hay indicios de arquitectura MoE en la informacion disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | `q4f16_1` (esta build, requiere `shader-f16`); `q4f32_1` en la build alternativa |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | MLC-LLM (`q4f16_1`), con libreria WebGPU precompilada `.wasm` |
| Tamano del repositorio | 0,4 GB (0,43 GB de descarga segun el autor) |
| Libreria de despliegue | mlc-llm / WebLLM 0.2.85 |
| Modelo base | Qwen/Qwen3.5-0.8B |
| Descargas / likes en HuggingFace | 0 / 0 |

## Arquitectura y entrenamiento

El modelo parte del transformer denso Qwen3.5-0.8B. Sobre ese checkpoint se aplico un SFT con LoRA (rango 16) empleando 3.000 conversaciones generadas en "modo puro" sobre 30 aplicaciones ficticias, cada una con sus propios nombres de herramienta, argumentos y enumeraciones. El objetivo declarado es que el modelo aprenda enrutado de herramientas en general y no el esquema de una sola aplicacion. Despues del SFT, los pesos se fusionaron y se convirtieron al formato MLC `q4f16_1` reutilizando la libreria WebGPU oficial de Qwen3.5-0.8B, sin recompilacion nueva.

El ajuste fino se completo con dos rondas de GRPO. La primera (v2) consistio en 40 pasos con 8 muestras por prompt sobre 160 prompts que el modelo SFT resolvia solo de forma parcial; la recompensa comprueba la herramienta elegida y sus argumentos y resta puntos por cada argumento que el usuario no habia pedido. Los prompts de GRPO fueron escritos por Qwen3.5-35B-A3B y se conservaron unicamente aquellos en los que dos profesores (el enrutador de 2B y DeepSeek) coincidian en la misma llamada. La segunda ronda (v3, este modelo) se aplico sobre v2 con prompts multiturno: los turnos previos provienen de plantillas con punteros a resultados de herramienta y la ultima peticion la redacto DeepSeek en 13 tipos de seguimiento ("el segundo", "eso", un filtro nuevo, ordenacion, umbral, grafico, comparacion, etc.). Se ejecutaron 120 pasos con 8 muestras por prompt sobre 750 prompts minados por dispersion de recompensa a partir de 3.116, conservando solo los casos en que DeepSeek y Qwen3.5-27B eligieron la misma llamada.

## Capacidades

- Enrutado de herramientas en modo puro: cada respuesta es exactamente un bloque `<tool_call>`, sin texto adicional.
- Peticiones de datos: invoca herramientas de listado, recuento, registro y graficos de la aplicacion, extrayendo los filtros de las palabras del usuario.
- Juicio y asesoramiento: deriva a la herramienta de experto de la aplicacion.
- Acciones (aprobar, cancelar, etc.): solo cuando el usuario lo pide de forma explicita.
- Conversacion social: saludos, agradecimientos, despedidas y preguntas del tipo "que puedes hacer" se mapean a `small_talk`.
- Peticiones fuera del dominio de la aplicacion: se clasifican como `unsupported`.
- Peticiones que requieren un identificador no facilitado: se responden con `ask_user` en lugar de inventarlo.
- Razonamiento multiturno para referencias anafóricas y seguimientos ("el segundo", "eso", nuevos filtros, ordenaciones, umbrales, comparaciones), gracias a la segunda ronda de GRPO.
- Generalizacion a esquemas de herramientas nuevos: se entreno con 30 aplicaciones distintas con nombres de herramienta, argumentos y enumeraciones propios.
- No es un modelo de chat ni de generacion de texto libre; no se documentan capacidades de codigo, matematicas, vision ni audio.
- Soporte de function calling segun el formato de Qwen (`<tools>...</tools>` en el prompt de sistema y parseo de `<tool_call>`), con decodificacion greedy y `enable_thinking: false`.

## Casos de uso

- Enrutado de herramientas en asistentes web embebidos: integrado con WebLLM sobre WebGPU, permite que una aplicacion de navegador decida que herramienta invocar sin enviar datos al servidor, con una descarga de 0,43 GB y sin coste de inferencia por token.
- Copilotos de negocio con esquema cerrado: en el demo de referencia (credito, mesa de soporte, solicitudes de vacaciones, pedidos de tienda) traduce lenguaje natural a llamadas sobre las herramientas de listado, recuento, registro y graficos de la aplicacion.
- Clasificacion de intenciones y derivacion en mesas de ayuda: convierte cada mensaje entrante en una llamada de consulta con filtros concretos, de modo que el backend solo ejecuta la consulta y formatea la respuesta.
- Pre-enrutado de bajo coste antes de un modelo grande: al ser 0,8B, puede decidir si la peticion necesita herramienta, es small talk, esta fuera de dominio o requiere pedir un dato al usuario, reservando el modelo mayor para la generacion de la respuesta final.
- Aplicaciones con guardas de seguridad en acciones: para acciones como aprobar o cancelar, el modelo solo emite la llamada si el usuario lo pide explicitamente, y el autor recomienda verificar ese extremo en el codigo de la aplicacion antes de ejecutarla.
- Flujo de desambiguacion con `ask_user`: cuando falta un identificador necesario, el modelo pide el dato en lugar de suponerlo, lo que reduce errores en operaciones sobre registros concretos.
- Flujo de fallback con `unsupported`: las peticiones ajenas al dominio de la aplicacion se separan de forma explicita, evitando llamadas erroneas a herramientas internas.
- Aplicaciones web progresivas y entornos sin conectividad o con requisitos de privacidad: al ejecutarse en cliente, los datos del usuario no abandonan el navegador durante la fase de enrutado.
- Pruebas y simulacion de esquemas de herramientas: util para validar el diseno de un conjunto de herramientas antes de invertir en un enrutador mayor.

## Benchmarks y rendimiento

El autor solo publica una evaluacion de enrutado en navegador sobre cuatro aplicaciones no incluidas en los datos de entrenamiento (suscripcion de credito, mesa de soporte, solicitudes de vacaciones y pedidos de tienda), con 82 turnos en total.

| Prueba | Resultado | Porcentaje |
|---|---|---|
| Router v3 aislado (esta build, 0.8B) | 71/82 | 86,6 % |
| Router v3 con guardas de codigo de la aplicacion | 79/82 | 96,3 % |
| Router v2 (0.8B) aislado | 72/82 | 87,8 % |
| Router v2 (0.8B) con guardas | 78/82 | 95,1 % |
| Router v2 de 2B aislado | 74/82 | 90,2 % |
| Router v2 de 2B con guardas | 76/82 | 92,7 % |

Las "guardas" son correcciones pequenas en el codigo de la aplicacion, por ejemplo pedir un identificador que falta en lugar de adivinarlo. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB con la cuantizacion `q4f16_1` (el repositorio completo ocupa 0,4 GB), mas el espacio de trabajo del runtime WebGPU.
- GPU recomendadas: cualquier GPU con soporte WebGPU; la build `q4f16_1` exige ademas la caracteristica `shader-f16`. Las GPU de escritorio (RTX 4090, H100, A100) no aportan ventaja practica para un modelo de 0,8B cuantizado a 4 bits en este escenario.
- Cabe en GPU de consumo: si, y tambien en graficos integrados compatibles con WebGPU. Para hardware sin `shader-f16` existe la build `q4f32_1` (`tfukkwang/Qwen3.5-0.8B-tool-router-v3-q4f32_1-MLC`), con los mismos pesos y un consumo algo mayor.
- Opciones de despliegue: WebLLM en navegador (libreria `@mlc-ai/web-llm` 0.2.85) con WebGPU, cargando la libreria precompilada `Qwen3.5-0.8B-q4f16_1_cs1k-webgpu.wasm`. El formato MLC no es directamente compatible con vLLM, llama.cpp, Ollama ni TGI sin reconversion.
- Configuracion recomendada por el autor: decodificacion greedy (`temperature: 0`), `extra_body: { enable_thinking: false }`, herramientas en el prompt de sistema en formato Qwen (`<tools>...</tools>`) y forzado de una unica llamada por respuesta mediante gramatica (etiquetas estructurales de WebLLM).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Evaluacion (aislado / con guardas) | Licencia | Formato y disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-tool-router-v3 (este modelo) | 0,8B | no disponible | 71/82 / 79/82 | Apache 2.0 | MLC `q4f16_1` y `q4f32_1`; 0 descargas, 0 likes |
| Qwen3.5-0.8B-tool-router-v2 | 0,8B | no disponible | 72/82 / 78/82 | Apache 2.0 | Version anterior del mismo autor, disponible en HuggingFace |
| Router v2 de 2B (autor no indicado) | 2B | no disponible | 74/82 / 76/82 | no disponible | Usado como profesor en la generacion de datos; no se detalla su distribucion |
| Qwen/Qwen3.5-0.8B (modelo base) | 0,8B | no disponible | No es un router; no comparable en esta prueba | Apache 2.0 | Safetensors y formatos derivados; disponible en HuggingFace |

No se dispone de datos de benchmarks estandar para ninguno de estos modelos en la informacion proporcionada, por lo que la comparacion se limita a la prueba de enrutado del autor.

## Limitaciones y advertencias

- Solo enruta: no es un modelo de chat. Cualquier expectativa de generacion de texto libre queda fuera de su diseno.
- El propio autor advierte de que a veces omite un filtro o un orden solicitados, o cuenta cuando el usuario pedia un listado. Conviene validar la llamada en codigo cuando el resultado sea critico.
- No debe ejecutar herramientas de accion sin palabras explicitas del usuario; esa comprobacion debe hacerse en la aplicacion, no confiar solo en la salida del modelo.
- Riesgo de alucinacion en argumentos: aunque la recompensa de GRPO penaliza argumentos no solicitados, el modelo puede rellenar identificadores o valores no proporcionados. La tool `ask_user` mitiga este caso, pero no lo elimina.
- La evaluacion publicada es muy reducida (82 turnos, 4 aplicaciones, prueba en navegador) y no incluye conjuntos estandar, por lo que no permite extrapolar rendimiento general.
- Se recomienda forzar una unica llamada por respuesta con gramatica (WebLLM structural tags); sin esa restriccion el formato de salida no esta garantizado.
- La build `q4f16_1` requiere la caracteristica WebGPU `shader-f16`; en equipos que no la expongan hay que usar la build `q4f32_1`.
- Idiomas soportados: no disponible. No se documenta cobertura multilingue ni evaluacion por idioma.
- No se documentan sesgos especificos, pero el modelo se entreno exclusivamente con conversaciones sinteticas sobre 30 aplicaciones ficticias, lo que puede introducir un sesgo hacia esos esquemas.
- Licencia Apache 2.0, que en principio permite uso comercial, con el enlace a la licencia del modelo base indicado por el autor (https://huggingface.co/Qwen/Qwen3.5-0.8B/blob/main/LICENSE). Conviene revisar los terminos del modelo base antes de un despliegue en produccion.
- El repositorio no tiene descargas ni likes y fue creado y actualizado el mismo dia, por lo que no existe validacion externa de su comportamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tfukkwang/Qwen3.5-0.8B-tool-router-v3-q4f16_1-MLC
- Build alternativa `q4f32_1`: https://huggingface.co/tfukkwang/Qwen3.5-0.8B-tool-router-v3-q4f32_1-MLC
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B/blob/main/LICENSE
- Demo de referencia (credit-copilot-demo): https://huggingface.co/spaces/tfukkwang/credit-copilot-demo
- WebLLM: https://webllm.mlc.ai/
- Librerias WebGPU precompiladas de MLC-LLM: https://github.com/mlc-ai/binary-mlc-llm-libs
- La busqueda web realizada no ha devuelto enlaces relevantes sobre este modelo; el resto de referencias provienen de la model card del autor.
