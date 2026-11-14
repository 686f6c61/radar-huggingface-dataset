# truthcoder/TC-Mini

## Resumen

TC-Mini es una familia de modelos de generacion de texto derivados de Qwen3, publicada por truthcoder con el objetivo de ofrecer un asistente conversacional que se ejecuta integramente en el dispositivo del usuario. El proyecto empaqueta tres tamanos (0,6B, 1,7B y 4B parametros) en formato MLC-LLM para WebGPU, de modo que el modelo corre en el navegador de un movil, portatil o sobremesa sin enviar datos a ningun servidor. Los pesos tambien se distribuyen en GGUF para su uso con Ollama, LM Studio o llama.cpp.

La base tecnica no es un modelo entrenado desde cero: son los Qwen3 de Alibaba con las direcciones de rechazo eliminadas mediante la tecnica de "abliteration" aplicada por mlabonne, y posteriormente cuantizados a 4 bits por truthcoder (MLC `q4f16_1` / `q4f32_1`). El modelo de 4B incorpora escalas de canal estilo AWQ plegadas en las capas de normalizacion, lo que segun el autor reduce la perdida de calidad en 4 bits de KL 0,120 a KL 0,090 frente a f16.

La relevancia del proyecto reside en su enfoque en privacidad y verificabilidad: cada release incluye un `MANIFEST.json` firmado con Ed25519 y el cliente web verifica la firma y el SHA-256 de cada fragmento antes de cargarlo. Es, por tanto, mas un sistema de distribucion seguro de modelos pequenos que un modelo novedoso en si mismo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), cuantizado para MLC-LLM |
| Parametros totales | 0,6B / 1,7B / 4B (tres builds) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el autor menciona contexto reducido en GPUs integradas, sin cifra) |
| Tipos de cuantizacion | MLC `q4f16_1` y `q4f32_1` (4 bits, WebGPU); GGUF Q4_K_M y Q8_0 |
| Idiomas soportados | no disponible (heredados de Qwen3, sin listado explicito) |
| Licencia | Apache-2.0 (pesos y codigo de la app) |
| Formato de pesos | MLC-LLM (WebGPU) y GGUF (Ollama/llama.cpp/LM Studio) |
| Tamano del repo | 4,9 GB |
| Modelos base | mlabonne/Qwen3-4B-abliterated, Qwen3-1.7B-abliterated, Qwen3-0.6B-abliterated |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3, un transformer decoder-only con atencion por cabezas agrupadas (GQA) y las innovaciones propias de esa familia. TC-Mini no entrena ni hace fine-tuning: toma los pesos abliterated de mlabonne, en los que se han eliminado las direcciones de rechazo del espacio de activaciones, y los convierte a formatos de inferencia eficiente. El 4B aplica escalas de canal de estilo AWQ absorbidas en las capas de normalizacion para mitigar la degradacion de la cuantizacion a 4 bits; el autor reporta una mejora de KL 0,120 a KL 0,090 respecto a f16.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO, ya que esos datos pertenecen a los modelos Qwen3 originales y no se detallan en la model card. La innovacion destacable del proyecto es de ingenieria de distribucion: releases firmados con Ed25519, verificacion criptografica en el navegador, comprobacion de capacidades del dispositivo (GPU, soporte de shader-f16, memoria, plataforma) para seleccionar el build adecuado y una sonda de 8 prompts que se ejecuta en el hardware del usuario antes del primer chat.

## Capacidades

- Generacion de texto conversacional multi-turno en los tres tamanos.
- Generacion de codigo simple y explicaciones tecnicas (el autor indica que el 0,6B es "bueno para codigo simple y explicaciones, debil en aritmetica").
- Ejecucion en navegador mediante WebGPU con WebLLM/MLC-LLM, sin backend.
- Ejecucion local en PC mediante Ollama, LM Studio y llama.cpp con los GGUF.
- Funcionamiento offline tras la primera descarga de pesos.
- Ausencia de telemetria: las unicas peticiones de red son los ficheros firmados del release.
- Comportamiento "abliterated": responde a peticiones que los modelos originales rechazan (0/8 rechazos en la sonda de 8 prompts del autor, en todos los tamanos).
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo thinking.

## Casos de uso

- Asistente conversacional privado en movil: el build de 0,6B (336 MB) se carga en el navegador de cualquier telefono con WebGPU y permite chatear sin cuenta ni conexion tras la descarga inicial, adecuado para consultas cotidianas y explicaciones breves.
- Chat en portatil sin GPU dedicada: el build de 1,7B (939 MB) esta pensado para telefonos recientes y portatiles pequenos, con contexto y fragmentos de prefill reducidos para no bloquear el driver grafico.
- Uso en sobremesa con GPU o Apple Silicon: el build de 4B (2,3 GB) ofrece la mayor calidad de la familia y, segun el autor, alcanza unos 34 tok/s en Chrome sobre una RTX 5070.
- Despliegue en pipelines locales con Ollama: `ollama run hf.co/truthcoder/TC-Mini:Q4_K_M` permite integrar el modelo en scripts y herramientas de linea de comandos sin salir del equipo, util para tareas de redaccion o resumen de documentos sensibles.
- Escenarios con requisitos de privacidad estrictos: al no haber servidor ni telemetria, encaja en entornos donde el texto no puede abandonar el dispositivo (notas personales, borradores internos).
- Verificacion de integridad en despliegues propios: el modelo firmado y el mecanismo de verificacion SHA-256 permiten autoalojar un mirror y demostrar que los pesos servidos no han sido alterados, util para equipos que distribuyen modelos dentro de una organizacion.
- Experimentacion con modelos abliterated en local: investigadores que estudian el efecto de la eliminacion de rechazos pueden comparar los tres tamanos con el mismo pipeline de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los unicos datos de rendimiento aportados por el autor son:

| Metrica | Valor |
|---|---|
| Rechazos en sonda de 8 prompts | 0/8 en los tres tamanos |
| Throughput del 4B | ~34 tok/s en Chrome sobre RTX 5070 |
| Perdida de calidad 4 bits (4B) | KL 0,090 vs f16 (frente a KL 0,120 sin escalas AWQ) |

## Requisitos de hardware

- VRAM/RAM estimada: 336 MB para el build de 0,6B, 939 MB para el 1,7B y 2,3 GB para el 4B en navegador (tamanos de descarga indicados por el autor; el consumo en memoria puede ser superior).
- GPU recomendadas: el 4B requiere GPU dedicada o Apple Silicon; el autor cita una RTX 5070 como referencia. El 1,7B va dirigido a telefonos recientes y portatiles pequenos; el 0,6B a cualquier telefono con WebGPU.
- GPU integradas: el sistema les asigna contexto reducido y fragmentos de prefill pequenos, porque un 4B puede bloquear el driver de pantalla de un portatil.
- Despliegue: WebLLM/MLC-LLM en navegador (WebGPU), Ollama, LM Studio y llama.cpp con GGUF Q4_K_M o Q8_0.
- Latencia y throughput: ~34 tok/s para el 4B en Chrome sobre RTX 5070; no hay datos para el resto de combinaciones.
- Seleccion automatica: la app comprueba GPU, shader-f16, memoria y plataforma (iOS/Android) antes de elegir el build; los telefonos nunca reciben el 4B.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| TC-Mini (4B/1,7B/0,6B) | 4B / 1,7B / 0,6B | no disponible | Apache-2.0 | HF, WebGPU, GGUF | Abliterated, cuantizado 4 bits, releases firmados |
| Qwen3-4B (original) | 4B | no disponible en esta ficha | Apache-2.0 | HF | Modelo base con rechazos; sin empaquetado WebGPU propio |
| mlabonne/Qwen3-4B-abliterated | 4B | no disponible en esta ficha | Apache-2.0 | HF | Base directa de TC-Mini; sin cuantizacion MLC ni firmas |
| Qwen3-0.6B (original) | 0,6B | no disponible en esta ficha | Apache-2.0 | HF | Alternativa minima para movil sin abliteration |

No se dispone de datos de benchmarks que permitan comparar rendimiento numerico entre estas opciones.

## Limitaciones y advertencias

- El modelo es "abliterated": responde a peticiones que los modelos originales rechazan. El autor declara explicitamente que la responsabilidad de uso recae en el usuario.
- El 0,6B es debil en aritmetica y solo apto para codigo simple y explicaciones, segun el propio autor.
- Riesgo de alucinacion inherente a modelos de este tamano; no hay evaluaciones publicadas de fidelidad.
- No se documentan los idiomas soportados; al heredar de Qwen3 cabe esperar buen rendimiento en chino e ingles y variable en castellano, pero no esta verificado.
- La longitud de contexto no se especifica y se reduce dinamicamente en GPUs integradas, lo que limita conversaciones largas en hardware modesto.
- El 4B puede bloquear el driver grafico de portatiles con GPU integrada; la app lo evita, pero un despliegue manual sin esas comprobaciones no.
- Licencia Apache-2.0 permite uso comercial, pero el comportamiento sin filtros puede incumplir politicas de plataformas o normativa si se despliega en atencion al publico.
- Los pesos no son un modelo propio de truthcoder: la card reconoce que son Qwen3 abliterated y cuantizados, sin destilacion propia.
- El proyecto tiene 0 descargas y 0 likes en el momento de la consulta; no hay validacion de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/truthcoder/TC-Mini
- GGUF: https://huggingface.co/truthcoder/TC-Mini/tree/main/gguf
- Demo web: https://truthprotectors.github.io/TC-Mini/app/
- Codigo fuente: https://github.com/truthprotectors/TC-Mini
- Modelo base 4B: https://huggingface.co/mlabonne/Qwen3-4B-abliterated
- Familia Qwen3: https://huggingface.co/Qwen
- Runtime WebLLM/MLC-LLM: https://github.com/mlc-ai/web-llm
