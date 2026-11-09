# Valen-Team/Valen-Decision-1.5-4B-GGUF

## Resumen

Valen-Decision-1.5-4B-GGUF es la variante en formato GGUF del modelo Valen-Decision-1.5-4B, desarrollado por el equipo Valen-Team. Se trata de un modelo especializado en toma de decisiones estructuradas sobre entradas multimodales (texto e imagen, con soporte historico de video en compilaciones desde fuente), construido sobre el modelo base Qwen/Qwen3.5-4B. En lugar de generar texto libre, el modelo produce salidas tipadas y estructuradas (predicados, probabilidades, elecciones y puntuaciones) en una sola pasada forward, orientadas a tareas de clasificacion, verificacion de requisitos y enrutamiento.

El modelo resuelve un problema concreto: convertir la evaluacion de condiciones sobre mensajes de cliente, imagenes o videos en decisiones maquina-legibles con probabilidades asociadas, evitando la fragilidad de pedir a un LLM generativo que emita JSON o juicios no calibrados. Con 4.547.291.949 parametros (aproximadamente 4,5 mil millones), se posiciona como un modelo de tamano medio que puede desplegarse en infraestructura moderada.

La relevancia actual radica en su enfoque de "decision model" frente al "chat model": soporta dos formatos de API de decision (SystemOne, usado por Jev, y Decisions, usado por OpenAI), lo que facilita su integracion en pipelines existentes. La licencia Apache 2.0 y la publicacion de codigo de entrenamiento y datos (Valen-Training-General-100k) facilitan su adopcion y ajuste fino. El repositorio GGUF ocupa 9,1 GB y solo las cuantizaciones F32 y Q8_0 superaron los controles de calidad del autor; Q4 y Q5 fallaron dichos controles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-4B), con cabecera de decision y salida estructurada; requiere `trust_remote_code` |
| Parametros totales | 4.547.291.949 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF: F32 y Q8_0 cualificados; Q4 y Q5 fallaron los controles de calidad; ONNX q8-mlp para la variante ONNX |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (este repositorio); tambien existen pesos nativos (safetensors) y ONNX en otras variantes |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen/Qwen3.5-4B, un transformer de aproximadamente 4,5 mil millones de parametros, al que se anade una capa de decision que devuelve respuestas tipadas (predicados con probabilidad, elecciones, puntuaciones) en lugar de texto generativo. La inferencia se realiza en una unica pasada forward que produce cajas, probabilidades, elecciones y puntuaciones de forma conjunta, segun la demostracion del autor. El modelo requiere codigo personalizado (`custom-code` y `trust_remote_code=True`) y admite dos formatos de protocolo de decision: SystemOne (Jev) y Decisions (OpenAI).

El equipo publica el codigo de entrenamiento en GitHub y el dataset Valen-Training-General-100k en Hugging Face, lo que permite ajuste fino para tareas propias. No se detalla en la informacion disponible el numero exacto de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO. La model card menciona politicas de incertidumbre y procedencia de medios en las guias del Cookbook, lo que sugiere un enfasis en calibracion y trazabilidad, pero no se aportan cifras concretas sobre el proceso de alineamiento.

## Capacidades

- Clasificacion de mensajes de cliente y enrutamiento de tickets mediante predicados con probabilidad asociada.
- Verificacion de requisitos sobre imagenes (por ejemplo, cribado de imagenes de producto) con salida estructurada.
- Identificacion de acciones en videos, aunque la compilacion GGUF preconstruida 0.1.0 no compila soporte directo de video; las pruebas historicas de video se hicieron desde fuente y no cualifican el paquete preconstruido.
- Salida tipada y estructurada ("image-text-to-typed-output", "structured-output") en una sola pasada forward.
- Soporte de dos formatos de API de decision: SystemOne (Jev) y Decisions (OpenAI).
- Soporte de estado compartido ("shared-state") para flujos con contexto persistente.
- Entrada multimodal texto e imagen (pipeline image-text-to-text).
- Ajuste fino posible gracias a la publicacion de codigo de entrenamiento y dataset.
- No se documentan en la informacion disponible capacidades de tool calling generico, agentes multi-paso, audio ni modo thinking.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo evalua predicados sobre el mensaje del cliente (por ejemplo, "el usuario solicita reembolso", "el problema es de facturacion") y devuelve probabilidades que permiten dirigir el ticket al equipo adecuado; el Cookbook incluye un tutorial especifico de ticket routing.
- Cribado de imagenes de producto: se definen requisitos (fondo blanco, producto centrado, sin texto sobreimpreso) como predicados y el modelo devuelve la probabilidad de cumplimiento por imagen, integrable en un pipeline de validacion previo a publicacion.
- Moderacion y verificacion de contenido visual: comprobacion automatizada de condiciones sobre imagenes enviadas por usuarios antes de su aceptacion en una plataforma.
- Etiquetado de video (con reservas): identificacion de acciones en videos para tareas de tagging; requiere compilacion desde fuente, ya que el GGUF preconstruido 0.1.0 no incluye soporte directo de video.
- Clasificacion de intenciones en asistentes conversacionales: dado un turno de usuario, el modelo devuelve la intencion con probabilidad, lo que permite umbrales de confianza y derivacion a humano cuando la certeza es baja.
- Automatizacion de decisiones con estado compartido: en flujos multi-turno, el estado acumulado se pasa al modelo para reevaluar condiciones a medida que llega nueva informacion.
- Ajuste fino para dominios verticales: partiendo del dataset Valen-Training-General-100k y el codigo publico, un equipo puede entrenar predicados especificos de su negocio (seguros, e-commerce, logistica).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni metricas comparables; unicamente menciona controles de calidad internos que descartaron las cuantizaciones GGUF Q4 y Q5 y cualificaron F32 y Q8_0.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos F32 (aproximadamente 18 GB para 4,5 mil millones de parametros) se requieren al menos 20-24 GB de VRAM; con Q8_0 (aproximadamente 4,5-5 GB) cabria en GPUs de 8-12 GB, aunque el autor solo cualifica F32 y Q8_0.
- GPU recomendadas: A100 o H100 para despliegue en produccion con F32; RTX 4090 (24 GB) para F32 en una sola GPU; GPUs consumer de 8-12 GB para Q8_0.
- Cabe en GPU consumer: si, en el caso de Q8_0 en GPUs de 8 GB o mas; F32 requiere 24 GB o mas.
- Opciones de despliegue: el autor indica que el GGUF se usa con el runtime personalizado de Valen para servicios C++ en CPU Linux; no se declara soporte en llama.cpp u Ollama oficiales sin modificaciones. Para GPU se recomienda pesos nativos con los plugins adecuados o ONNX CUDA en Python. Para aplicaciones offline en Python/JavaScript se usan los SDK ONNX. La model card menciona SGLang/vLLM como backends, sin prometer rendimiento no medido.
- Latencia y throughput: no disponibles; el autor declara explicitamente que no promete rendimiento no medido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Valen-Decision-1.5-4B | 4,55 B | no disponible | Decision estructurada multimodal | Apache 2.0 | GGUF, ONNX, pesos nativos, API gratuita |
| Qwen3.5-4B (base) | ~4 B | no disponible | LLM generativo multimodal | no disponible en esta ficha | Hugging Face |
| Alternativas de clasificacion dedicadas | no disponible | no disponible | Clasificacion / NLI | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre Valen-Decision-1.5-4B y sus alternativas en la informacion proporcionada. La comparacion con el modelo base Qwen3.5-4B es estructural (Valen deriva de el), pero no se aportan metricas que permitan contrastar calidad.

## Limitaciones y advertencias

- Las cuantizaciones GGUF Q4 y Q5 no superaron los controles de calidad del autor; solo F32 y Q8_0 estan cualificadas. Usar Q4/Q5 puede degradar las decisiones de forma no controlada.
- El paquete GGUF preconstruido 0.1.0 no compila soporte directo de video; las pruebas de video historicas se hicieron desde fuente y no cualifican el binario preconstruido.
- No se declara soporte en llama.cpp u Ollama oficiales sin modificaciones; el GGUF depende del runtime personalizado de Valen.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo del autor; conviene auditar el codigo antes de desplegar en produccion.
- No se documentan idiomas soportados; el rendimiento fuera del ingles es desconocido.
- No se documenta la longitud de contexto, lo que impide planificar flujos con entradas largas.
- Riesgo de alucinacion y calibracion: aunque el modelo devuelve probabilidades, no se publican metricas de calibracion (ECE, Brier) en la informacion disponible; los umbrales de decision deben validarse empiricamente.
- Sesgos: no se documentan evaluaciones de sesgo en la informacion disponible.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-4B puede tener condiciones propias que conviene verificar.
- El modelo esta orientado a decisiones estructuradas, no a generacion de texto libre; usarlo como chatbot generativo no es su proposito declarado.

## Enlaces

- Hugging Face: https://huggingface.co/Valen-Team/Valen-Decision-1.5-4B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Repositorio de codigo: https://github.com/Valen-Team/Valen
- Dataset de entrenamiento: https://huggingface.co/datasets/Valen-Team/Valen-Training-General-100k
- Demo web y API gratuita: https://valen-team.github.io/
- Cookbook: https://valen-team.github.io/cookbook/
- Guia de seleccion de version: https://valen-team.github.io/docs/valen/choosing/
- Documentacion de API: https://valen-team.github.io/docs/valen/api/
- Quickstart de Transformers: https://valen-team.github.io/docs/valen/quickstart/
- Validacion y rendimiento: https://valen-team.github.io/cookbook/validation/
- Tutorial de ticket routing: https://valen-team.github.io/cookbook/ticket-routing/
- Tutorial de cribado de productos: https://valen-team.github.io/cookbook/product-screening/
- Tutorial de etiquetado de video: https://valen-team.github.io/cookbook/video-tagging/
- Demo en video: https://raw.githubusercontent.com/Valen-Team/Valen/main/assets/demos/valen-decision-1.5-demo.mp4
