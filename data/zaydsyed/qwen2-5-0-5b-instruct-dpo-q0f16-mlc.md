# zaydsyed/Qwen2.5-0.5B-Instruct-DPO-q0f16-MLC

## Resumen

Este repositorio no contiene un modelo nuevo, sino una conversión de formato: es la etapa DPO de TactLM-Qwen2.5-0.5B (un ajuste por DPO de Qwen2.5-0.5B-Instruct, publicado por el usuario zaydsyed) convertida a formato MLC-LLM para su ejecución dentro del navegador mediante WebLLM. El problema que resuelve es puramente de despliegue: empaquetar los pesos en un artefacto que WebGPU pueda cargar y ejecutar del lado del cliente, sin backend ni servidor de inferencia.

El resultado es un artefacto de 1,0 GB en fp16 sin cuantizar (etiqueta `q0f16`), por lo que, segun el autor, la calidad coincide con la del modelo original y no hay perdida por cuantizacion. La arquitectura no se modifica respecto a Qwen2.5-0.5B-Instruct, de modo que el build reutiliza la libreria precompilada `Qwen2-0.5B-Instruct-q0f16` de WebLLM y no requiere compilacion personalizada.

Es relevante ahora por dos motivos: permite inferencia 100 % local en el navegador (los datos no salen del dispositivo) y sirve como plantilla reproducible para publicar variantes fine-tuneadas de modelos pequenos en el ecosistema WebLLM. El interes practico es limitado: 0 descargas y 0 likes en el momento de la consulta, y el autor remite a la ficha del modelo original para benchmarks, detalles de entrenamiento y limitaciones.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Qwen2 (sin cambios respecto a Qwen2.5-0.5B-Instruct) |
| Parametros totales | 0,5 B (nominal, segun el nombre del modelo; el autor no publica el recuento exacto) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada; heredada del modelo base Qwen2.5-0.5B-Instruct (el autor remite a la ficha original) |
| Tipos de cuantizacion | `q0f16` (fp16 sin cuantizar); no se publican otras variantes en este repo |
| Idiomas soportados | Ingles (`language: en` en la model card); el modelo base Qwen2.5 es multilingue, pero esta ficha solo declara ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | Artefactos MLC-LLM (pesos compilados + `mlc-chat-config.json`), ~1,0 GB; no se distribuyen safetensors ni GGUF |
| Libreria / runtime | `mlc-llm` (conversion), WebLLM (ejecucion en navegador via WebGPU) |
| Modelo base | zaydsyed/Qwen2.5-0.5B-Instruct-DPO (relacion: `quantized`) |
| Requisito de plataforma | WebGPU con la caracteristica `shader-f16` |
| Plantilla de conversacion | `qwen2` (`--conv-template qwen2`) |
| Prefill chunk size | 1024 |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen2.5-0.5B-Instruct sin modificaciones: un transformer decoder-only con atencion por cabezas y sesgo QKV propio de la familia Qwen2, tal como indica el autor al senalar que el build funciona sobre la libreria precompilada `Qwen2-0.5B-Instruct-q0f16`. No hay innovaciones de arquitectura en este repositorio: el trabajo realizado es de conversion de pesos (`mlc_llm convert_weight` con `--model-type qwen2`) y de generacion de la configuracion de inferencia (`mlc_llm gen_config`), no de entrenamiento.

Sobre el ajuste: el modelo de partida es la "DPO stage" de TactLM-Qwen2.5-0.5B, es decir, un Qwen2.5-0.5B-Instruct pasado por un entrenamiento de optimizacion de preferencias (DPO). El autor no publica en esta ficha el dataset de preferencias, el numero de pasos, la composicion de datos ni los hiperparametros; remite explicitamente a la model card del modelo original para esos detalles. Tampoco se documenta si hubo etapas adicionales de SFT o RLHF mas alla del DPO.

## Capacidades

- Generacion de texto e instrucciones generales en ingles, con el estilo alineado que aporta la etapa DPO.
- Seguimiento de instrucciones con restricciones de formato estrictas (el ejemplo de la model card pide "exactamente tres frases, todo en minusculas").
- Conversacion multi-turno mediante la API `engine.chat.completions.create` de WebLLM, compatible con el esquema de mensajes `role`/`content`.
- Inferencia 100 % local en el navegador: no requiere servidor, clave de API ni conexion despues de la descarga inicial de los pesos.
- Ejecucion sobre la libreria precompilada de WebLLM (`Qwen2-0.5B-Instruct-q0f16`), lo que simplifica la integracion en aplicaciones web.
- No se documentan en la informacion disponible capacidades de tool calling, function calling, agentes, razonamiento multi-paso explicito (thinking mode), vision ni audio.

## Casos de uso

- Chat de soporte embebido en una web estatica: el modelo se carga con `CreateMLCEngine` y responde sin backend, de modo que no hay coste de servidor ni latencia de red por token; adecuado para FAQs y preguntas frecuentes acotadas.
- Procesamiento de texto con requisitos de privacidad: al ejecutarse en el dispositivo, los datos del usuario no se envian a ninguna API; encaja en sectores con restricciones de residencia de datos (salud, legal, administracion) para tareas de resumen o reformulacion de textos cortos.
- Prototipado rapido de prompts y plantillas de conversacion: sirve para validar el comportamiento de una variante DPO de Qwen2.5-0.5B antes de invertir en un despliegue con GPU propia.
- Extension de navegador o PWA con asistente de redaccion: correcciones, reescritura y generacion de respuestas cortas en formularios, sin infraestructura de inferencia.
- Demostraciones educativas de LLM en el navegador: permite mostrar el funcionamiento de un modelo de lenguaje y de WebGPU en aulas o talleres sin instalar CUDA ni dependencias de Python.
- Entornos aislados o air-gapped: la app web y los pesos pueden servirse desde un servidor interno, funcionando como asistente de texto sin salida a internet.
- Referencia para publicar fine-tunes en MLC/WebLLM: los comandos de conversion documentados (`convert_weight` y `gen_config` con `--model-type qwen2`) sirven de plantilla para empaquetar otros adaptadores sobre Qwen2.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que los benchmarks se encuentran en la model card del modelo original (zaydsyed/Qwen2.5-0.5B-Instruct-DPO), que no forma parte de la informacion proporcionada. Tampoco se publican métricas de latencia, throughput (tokens/s) ni consumo de memoria en navegador.

## Requisitos de hardware

- Memoria: los pesos ocupan 1,0 GB en fp16; hay que sumar la cache KV y el overhead del runtime de WebGPU, por lo que conviene reservar del orden de 1,5-2 GB de memoria de GPU para contextos moderados (estimacion, no verificada por el autor).
- Navegador: se requiere WebGPU con la caracteristica `shader-f16`; sin ese soporte el modelo no arranca. No se especifican versiones minimas ni lista de GPU compatibles.
- GPU de consumo: si el navegador expone `shader-f16`, un modelo de 0,5 B en fp16 es apto para GPU integradas recientes y para GPU discretas de gama baja; no se publica una lista de modelos validados.
- Despliegue en navegador: WebLLM (`@mlc-ai/web-llm`) con `CreateMLCEngine` y un `appConfig` que apunte al repo de HuggingFace como `model`.
- Despliegue nativo: MLC-LLM (motor C++/CUDA, Vulkan, Metal) puede servir los mismos artefactos; para vLLM, llama.cpp, Ollama o TGI seria necesario reconvertir desde el modelo base, ya que este repo no incluye safetensors ni GGUF.
- Movil: MLC-LLM soporta compilacion para iOS y Android, pero no hay artefactos publicados en este repositorio ni pruebas documentadas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Notas |
|---|---|---|---|---|---|
| Este modelo (Qwen2.5-0.5B-Instruct-DPO q0f16 MLC) | 0,5 B | No disponible (heredado del base) | MLC / WebLLM (WebGPU) | Apache 2.0 | Build fp16 para navegador, 0 descargas |
| Qwen2.5-0.5B-Instruct (modelo base de referencia) | 0,5 B | 32 768 tokens (spec del modelo base, no verificada en esta ficha) | safetensors, GGUF en el ecosistema | Apache 2.0 | Requiere backend (vLLM, llama.cpp, transformers) |
| Qwen2.5-1.5B-Instruct | 1,5 B | 32 768 tokens (spec del modelo base) | safetensors, GGUF | Apache 2.0 | Mayor calidad esperada, mas memoria y latencia |
| Llama 3.2 1B Instruct | ~1,2 B | 128 000 tokens (spec publicada) | safetensors, GGUF | Licencia comunitaria Llama 3.2 | Contexto mucho mayor; licencia con condiciones de uso |
| SmolLM2-360M-Instruct | ~0,36 B | 8 192 tokens (spec publicada) | safetensors, GGUF | Apache 2.0 | Alternativa aun mas ligera para dispositivo |

No se dispone de datos de benchmarks de este build que permitan comparar calidad de forma cuantitativa con las alternativas; la comparacion anterior es de especificaciones y disponibilidad.

## Limitaciones y advertencias

- El repositorio es una conversion de formato, no un modelo nuevo: cualquier limitacion del modelo base (sesgos del corpus de Qwen2.5, alucinacion en tareas de conocimiento factual, capacidad limitada por el tamano de 0,5 B) se hereda intacta.
- Idiomas: la model card declara unicamente ingles; el uso en castellano no esta validado por el autor, aunque el modelo base Qwen2.5 sea multilingue.
- Contexto: la longitud de contexto no se especifica en esta ficha; si se necesita un valor concreto para produccion, hay que consultar la model card del modelo original y verificar empiricamente la ventana efectiva en WebLLM.
- Dependencia estricta de WebGPU con `shader-f16`: los navegadores o GPU sin esa caracteristica no podran ejecutar el modelo, sin fallback documentado.
- Formato no portable: al no publicar safetensors ni GGUF, no se puede cargar directamente con `transformers`, vLLM, llama.cpp u Ollama; hay que reconvertir desde el modelo base.
- Calidad del ajuste DPO no documentada: no se publican datos de preferencias, hiperparametros ni evaluaciones, por lo que no hay evidencia de mejora frente al Instruct original.
- Trazabilidad escasa: 0 descargas y 0 likes; creado y actualizado el 2026-10-21 con dos minutos de diferencia, sin historial de versiones ni procesos de validacion.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero conviene conservar los avisos de atribucion del modelo base Qwen2.5 y revisar la licencia de la libreria WebLLM/MLC-LLM en el producto final.
- En produccion: al ejecutarse en el cliente, la primera carga implica descargar ~1 GB de pesos; es necesario gestionar cache, versionado y actualizaciones en el navegador del usuario.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/zaydsyed/Qwen2.5-0.5B-Instruct-DPO-q0f16-MLC
- Modelo base (etapa DPO): https://huggingface.co/zaydsyed/Qwen2.5-0.5B-Instruct-DPO
- Repositorio MLC-LLM: https://github.com/mlc-ai/mlc-llm
- Repositorio WebLLM: https://github.com/mlc-ai/web-llm
- Paquete npm de WebLLM: https://www.npmjs.com/package/@mlc-ai/web-llm
- Los resultados de la busqueda web realizada no contienen enlaces relevantes para este modelo (devuelven exclusivamente paginas sobre calculadoras Texas Instruments); no se han encontrado papers, blogs ni demos adicionales.
