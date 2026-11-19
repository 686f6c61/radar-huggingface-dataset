# StarlexAI/Orbit-Nano-Compliance-E2B-GGUF

## Resumen

Orbit-Nano-Compliance-E2B-GGUF es la distribucion en formato GGUF del modelo StarlexAI/Orbit-Nano-Compliance-E2B, un modelo de lenguaje conversacional especializado en cumplimiento normativo europeo y aleman (RGPD/DSGVO, NIS2 y EU AI Act), desarrollado por Starlex AI, un laboratorio que se presenta como Foundation AI Lab. El modelo esta entrenado desde cero (from-scratch) sobre 92.400 millones de tokens, aproximadamente un 1 % de los datos que ven modelos pequenos comparables, segun indica el autor en su model card.

La relevancia de esta publicacion es doble: por un lado, emplea una arquitectura propia denominada `orbit`, lo que implica que llama.cpp necesita un parche especifico de arquitectura hasta que se integre upstream; por otro, ofrece cuantizaciones que van desde 2,4 GB (Q4_K_M) hasta 8,1 GB (bf16), lo que permite ejecutar un modelo de 4.026.534.936 parametros en un portatil con 8 GB de RAM. El modelo esta disenado para responder preguntas legales en aleman e ingles, y el autor afirma que ocupa el primer puesto de 7 en su propio benchmark de cumplimiento europeo y aleman.

El modelo base tiene 4.026.534.936 parametros totales y una longitud de contexto de solo 2.048 tokens, una limitacion importante para el dominio legal. La model card recomienda incluir las disposiciones legales reales en el prompt (grounding), lo que reduce los errores en mas de un tercio segun el autor. La licencia es Apache-2.0 y el repositorio ocupa 17,6 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `orbit` (arquitectura propia de Starlex AI, requiere parche en llama.cpp) |
| Parametros totales | 4.026.534.936 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | Q4_K_M, Q5_K_M, Q8_0, bf16 (F16 no funciona para este modelo) |
| Idiomas soportados | aleman (de), ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (repo base en safetensors) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura propia denominada `orbit`, distinta de las arquitecturas estandar soportadas de serie por llama.cpp, por lo que requiere un parche de arquitectura especifico hasta que se integre upstream. El modelo fue preentrenado desde cero por Starlex AI sobre 92.400 millones de tokens, una cantidad notablemente inferior a la de modelos pequenos comparables (alrededor del 1 % segun el autor). No se especifican en la informacion disponible la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

La model card indica que cada archivo GGUF paso un control de calidad contra el modelo bf16 sobre texto legal aleman antes de publicarse, con incrementos de perplejidad acotados: hasta un 20 % en Q4_K_M, hasta un 12 % en Q5_K_M y hasta un 3 % en Q8_0. Se incluye un Modelfile con la plantilla de chat.

## Capacidades

- Generacion de texto conversacional en aleman e ingles orientada a dominio legal y de cumplimiento normativo.
- Respuesta a preguntas sobre RGPD/DSGVO, NIS2 y EU AI Act (segun los tags y el ejemplo de la model card sobre el Art. 33 DSGVO).
- Razonamiento sobre disposiciones legales cuando se proporcionan en el prompt (grounding), con reduccion de errores superior a un tercio segun el autor.
- Formato conversacional con plantilla de chat incluida.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- No se documentan en la informacion disponible capacidades de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Consulta de obligaciones de notificacion: el modelo puede responder preguntas concretas como los plazos y requisitos del articulo 33 del RGPD, incluyendo las disposiciones en el prompt para maximizar la precision.
- Asistencia a equipos de proteccion de datos: borradores de respuestas internas sobre bases juridicas, evaluaciones de impacto o registro de actividades, siempre con revision humana dado el riesgo de alucinacion.
- Formacion interna en cumplimiento: generacion de explicaciones y ejemplos sobre NIS2 y EU AI Act para personal no juridico, en aleman o ingles.
- Despliegue en portatil para consultas offline: con la cuantizacion Q4_K_M (2,4 GB) cabe en equipos con 8 GB de RAM, util para auditores que trabajan sin conexion.
- Clasificacion y resumen de textos normativos: con contexto de 2.048 tokens puede procesar fragmentos de reglamentos y resumirlos en lenguaje claro.
- Prototipado de asistentes legales internos: al ser Apache-2.0 y ejecutable con llama.cpp, permite integrar un asistente de cumplimiento en herramientas internas sin coste de licencia.
- Filtrado de preguntas frecuentes regulatorias: respuestas predefinidas sobre obligaciones de la empresa en materia de privacidad y seguridad, con grounding sobre el texto oficial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos detallados en la informacion disponible. La model card unicamente afirma que el modelo ocupa el puesto 1 de 7 en el benchmark propio de cumplimiento europeo y aleman del autor, sin proporcionar las puntuaciones ni los modelos comparados. Tampoco se ofrecen cifras de MMLU, HumanEval, GSM8K ni latencia/throughput.

## Requisitos de hardware

- VRAM/RAM estimada: Q4_K_M 2,4 GB (portatiles con 8 GB de RAM), Q5_K_M 2,8 GB, Q8_0 4,3 GB, bf16 8,1 GB.
- GPU recomendadas: no disponible en la informacion proporcionada; por tamano, las cuantizaciones Q4 y Q5 son aptas para GPUs consumer con 8 GB o mas (por ejemplo, RTX 3060/4060), y bf16 requiere al menos 8-10 GB.
- Cabe en GPU consumer: si, con las cuantizaciones Q4_K_M, Q5_K_M y Q8_0.
- Opciones de despliegue: llama.cpp con el parche de arquitectura `orbit` (llama-cli con `-cnv`); Ollama y LM Studio solo cuando su version de llama.cpp incluya la arquitectura. Se incluye Modelfile con plantilla de chat.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de modelos comparables en la informacion proporcionada, por lo que la comparacion cuantitativa no esta disponible. A modo estructural:

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Orbit-Nano-Compliance-E2B-GGUF | 4.026.534.936 | 2.048 | de, en | Apache-2.0 | GGUF |
| Alternativas de ~4B especializadas en legal | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Contexto muy limitado (2.048 tokens), insuficiente para documentos legales completos; obliga a fragmentar y a incluir las disposiciones relevantes en el prompt.
- Riesgo alto de alucinacion en dominio legal: el autor recomienda grounding con el texto de las provisiones y no se documentan garantias de exactitud juridica.
- Solo soporta aleman e ingles; no hay soporte de castellano.
- Arquitectura propietaria `orbit`: requiere parche de llama.cpp, lo que complica el despliegue y la compatibilidad con herramientas estandar hasta su integracion upstream.
- F16 no es compatible con este modelo; debe usarse bf16 o las cuantizaciones publicadas.
- Entrenado con solo 92.400 millones de tokens (aproximadamente el 1 % de modelos comparables), lo que puede limitar el conocimiento general fuera del dominio de cumplimiento.
- No se documentan sesgos especificos ni evaluaciones de seguridad en la informacion disponible.
- Licencia Apache-2.0 permite uso comercial, pero el modelo no debe usarse como sustituto de asesoramiento juridico profesional.
- Sin descargas ni likes en el momento de la consulta (0 y 0), lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/StarlexAI/Orbit-Nano-Compliance-E2B-GGUF
- Modelo base: https://huggingface.co/StarlexAI/Orbit-Nano-Compliance-E2B
- Orbit Phone (reconocimiento de voz): https://huggingface.co/StarlexAI/orbit-phone
- Orbit-Vision: https://huggingface.co/StarlexAI/orbit-vision
- Orbit-Image: https://huggingface.co/StarlexAI/orbit-image
