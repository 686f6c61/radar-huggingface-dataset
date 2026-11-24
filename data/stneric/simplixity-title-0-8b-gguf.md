# stneric/simplixity-title-0.8b-GGUF

## Resumen

simplixity-title-0.8b-GGUF es la distribucion en formato GGUF de simplixity-title-0.8b, un ajuste fino del modelo Qwen3.5-0.8B especializado en una unica tarea: generar titulos de conversacion de como maximo seis palabras en ingles a partir del primer mensaje de un chat, que puede estar escrito en ingles o en aleman. Lo desarrolla stneric como componente del proyecto de codigo abierto Simplixity, una interfaz de chat que utiliza este modelo para nombrar automaticamente las conversaciones.

El modelo resuelve un problema acotado y concreto: en lugar de emplear un LLM grande y costoso para etiquetar chats, ofrece una alternativa de 772.845.888 parametros que puede ejecutarse localmente en Ollama o LM Studio. La relevancia practica esta en su tamano reducido, su licencia Apache 2.0 y la disponibilidad de cuantizaciones Q8_0 y Q4_K_M que caben en cualquier equipo consumer.

El repositorio incluye cuatro archivos GGUF correspondientes a dos versiones (v1 y v4), siendo v4 la actual. El autor reporta metricas de cumplimiento de formato y de mencion del termino clave medidas sobre un conjunto de validacion de 60 mensajes iniciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3.5-0.8B) |
| Parametros totales | 772.845.888 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 y Q4_K_M (GGUF) |
| Idiomas soportados | en, de |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (generado con convert_hf_to_gguf.py y llama-quantize de llama.cpp; Q4_K_M cuantizado desde bf16) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna, el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO. El modelo deriva de Qwen3.5-0.8B, ajustado para la tarea de generacion de titulos dentro del proyecto Simplixity. El repositorio contiene unicamente el modelo de texto.

La innovacion tecnica destacable no esta en la arquitectura sino en el diseno de la tarea: el modelo espera como mensaje de sistema el prompt de titulos propio de Simplixity y como mensaje de usuario el primer mensaje del chat truncado a 1.000 caracteres. Los archivos GGUF se generaron con el flujo estandar de llama.cpp. Para Ollama es necesario declarar `RENDERER qwen3.5` y `PARSER qwen3.5` en el Modelfile; sin ellos, el prompt de sistema no llega al modelo.

## Capacidades

- Generacion de titulos de conversacion en ingles de como maximo seis palabras a partir del primer mensaje.
- Comprension de entrada en ingles y aleman, con salida siempre en ingles.
- Cumplimiento de reglas de formato del prompt de Simplixity (medido en 91% en la version v4).
- Mencion del termino clave de la conversacion (medido en 88% en la version v4).
- Generacion de texto basica heredada del modelo base Qwen3.5-0.8B.
- Compatibilidad con endpoints y despliegue local mediante Ollama y LM Studio.
- No se documentan capacidades de tool calling, razonamiento multi-paso, vision ni audio.

## Casos de uso

- Nombrado automatico de chats en Simplixity: el caso de uso principal; el modelo convierte el primer mensaje en un titulo corto en ingles, activable desde los ajustes de la aplicacion con proveedor Ollama o LM Studio.
- Etiquetado de conversaciones en herramientas de soporte: generar titulos legibles para hilos de atencion al cliente a partir del primer mensaje del usuario, con coste de inferencia minimo.
- Organizacion de historiales en aplicaciones de mensajeria: asignar nombres a conversaciones nuevas para mejorar la navegacion en interfaces con muchos hilos.
- Procesamiento local sin conexion: al caber en cuantizacion Q4_K_M (542 MB) y Q8_0 (834 MB), puede ejecutarse en equipos sin GPU dedicada.
- Pipelines de clasificacion ligera: usar el titulo generado como etiqueta resumida para indexar o agrupar mensajes iniciales.
- Prototipado rapido en Ollama o LM Studio: integracion sencilla mediante Modelfile o carga directa del GGUF para evaluar la calidad de titulos antes de desplegar.

## Benchmarks y rendimiento

El autor publica metricas sobre un conjunto de validacion de 60 mensajes iniciales (30 en aleman, 30 en ingles), con tres ejecuciones por mensaje, medidas en Ollama 0.40:

| Archivo | Tamano | Reglas de formato cumplidas | Termino clave mencionado |
|---|---|---|---|
| simplixity-title-0.8b-v4-Q8_0.gguf | 834 MB | 91% | 88% |
| simplixity-title-0.8b-v4-Q4_K_M.gguf | 542 MB | 91% | 88% |
| simplixity-title-0.8b-v1-Q8_0.gguf | 834 MB | 77% | 81% |
| simplixity-title-0.8b-v1-Q4_K_M.gguf | 542 MB | 84% | 86% |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB o menos en Q8_0 (834 MB de pesos) y en torno a 0,6-0,8 GB en Q4_K_M (542 MB de pesos), mas el overhead del contexto.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM libre; el modelo esta pensado para ejecucion local y tambien en CPU.
- Cabe en GPU consumer: si, en practicamente cualquier tarjeta moderna (RTX 3060, RTX 4060, etc.) y en equipos integrados.
- Opciones de despliegue: Ollama (con Modelfile y RENDERER/PARSER qwen3.5), LM Studio, llama.cpp.
- Latencia y throughput: no disponibles; el autor no publica cifras de latencia o tokens por segundo.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables especializados en generacion de titulos de conversacion en la documentacion proporcionada.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| simplixity-title-0.8b-GGUF | 772.845.888 | no disponible | Apache 2.0 | GGUF en Hugging Face |
| Alternativas especializadas en titulos | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo esta disenado exclusivamente para generar titulos de conversacion; su uso como modelo general de texto no esta validado.
- La salida es siempre en ingles aunque la entrada sea en aleman, lo que puede no encajar en aplicaciones multilingues.
- Requiere el prompt de sistema de Simplixity y el truncado del primer mensaje a 1.000 caracteres para funcionar segun lo medido; otros prompts pueden degradar los resultados.
- En Ollama es obligatorio declarar RENDERER y PARSER qwen3.5; sin ellos el prompt de sistema no se aplica.
- Las metricas publicadas provienen de un conjunto de validacion pequeno (60 mensajes), por lo que la robustez fuera de ese dominio no esta garantizada.
- Riesgo de alucinacion y sesgos: no documentados por el autor.
- Licencia Apache 2.0, que permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen3.5-0.8B.

## Enlaces

- Repositorio GGUF: https://huggingface.co/stneric/simplixity-title-0.8b-GGUF
- Modelo base: https://huggingface.co/stneric/simplixity-title-0.8b
- Proyecto Simplixity: https://github.com/stneric/simplixity
