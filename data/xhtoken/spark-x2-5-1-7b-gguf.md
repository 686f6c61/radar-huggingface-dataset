# XHToken/Spark-X2.5-1.7B-GGUF

## Resumen

Spark-X2.5-1.7B-GGUF es la distribucion en formato GGUF del modelo Spark-X2.5-1.7B, un modelo de lenguaje compacto y de proposito general desarrollado por XHToken. Esta pensado para conversacion, redaccion, traduccion, razonamiento, generacion de codigo, uso de herramientas y flujos de trabajo con agentes. Con 1.707.657.216 parametros, se situa en la franja de modelos pequenos que pueden ejecutarse en hardware de consumo, y su publicacion en GGUF lo hace directamente utilizable en llama.cpp, Ollama, LM Studio y Unsloth Studio.

La relevancia de esta version concreta esta en el empaquetado: el modelo base se distribuye con pesos en safetensors, mientras que este repositorio ofrece cuantizaciones listas para inferencia local, con soporte nativo del tipo de arquitectura `spark2_5` en las herramientas habituales. El autor declara una arquitectura de atencion hibrida, una longitud de contexto nativa de hasta 1M tokens y cobertura de mas de 200 idiomas, si bien la model card de esta variante GGUF remite al repositorio del modelo base para los detalles de arquitectura, entrenamiento y benchmarks.

La licencia Apache 2.0 y la disponibilidad de pesos cuantizados convierten a este modelo en un candidato practico para prototipado rapido, despliegue en entornos con recursos limitados y experimentacion con tecnicas de agente sin depender de APIs externas. El repositorio acumula 250.312 descargas y 63 likes en Hugging Face, con actualizacion en septiembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atencion hibrida (segun model card); tipo de arquitectura `spark2_5` en llama.cpp |
| Parametros totales | 1.707.657.216 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | hasta 1M tokens (contexto nativo declarado) |
| Tipos de cuantizacion | no disponible en detalle; el repo GGUF ocupa 6,3 GB, lo que sugiere varias cuantizaciones |
| Idiomas soportados | en, zh declarados en metadatos; la model card afirma mas de 200 idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo); safetensors en el modelo base |

## Arquitectura y entrenamiento

La model card describe Spark-X2.5 como un modelo con arquitectura de atencion hibrida, disenado para soportar un contexto nativo de hasta 1M tokens. No se detalla en esta variante GGUF la composicion exacta de las capas (proporcion entre atencion completa y atencion lineal o recurrente), ni el numero de tokens de entrenamiento, ni si se aplicaron fases de RLHF o DPO. Toda esa informacion se remite al repositorio del modelo base `XHToken/Spark-X2.5-1.7B`.

El aspecto tecnico mas relevante para el despliegue es la integracion nativa del tipo `spark2_5` en llama.cpp a partir de la build `b10828`, en Ollama desde `v0.34.1` y en LM Studio desde la version de runtime `2.34.0`. Esto implica que las versiones anteriores de esas herramientas no cargaran el modelo correctamente. La cuantizacion se ha realizado, segun los tags, con Unsloth, y el modelo esta etiquetado como compatible con endpoints y con PocketPal AI.

## Capacidades

- Generacion de texto conversacional multi-turno, con soporte declarado de contexto largo de hasta 1M tokens.
- Redaccion y escritura asistida: composicion, reescritura y resumen de documentos.
- Traduccion y cobertura multilingue: la model card afirma mas de 200 idiomas, aunque los metadatos solo declaran ingles y chino.
- Razonamiento y resolucion de problemas en varios pasos.
- Generacion de codigo y asistencia a la programacion.
- Uso de herramientas y function calling, orientado a flujos de agente.
- Compatibilidad con APIs estilo OpenAI mediante `llama serve`, lo que facilita la integracion en aplicaciones existentes.
- Ejecucion local en llama.cpp, Ollama, LM Studio y Unsloth Studio.
- No se declaran capacidades de vision, audio ni modo de razonamiento explicito (thinking mode) en la informacion disponible.

## Casos de uso

- Asistente conversacional local: con 1,7B parametros y cuantizacion GGUF, el modelo puede ejecutarse en un portatil o en un equipo sin GPU dedicada, gestionando conversaciones multi-turno sin coste de API ni envio de datos a terceros.
- Generacion de codigo en entornos de desarrollo: su soporte de tool calling permite integrarlo en asistentes de IDE o scripts que consulten documentacion, ejecuten tests o propongan parches dentro de un pipeline de CI/CD.
- Traduccion y localizacion de contenidos: el soporte declarado de mas de 200 idiomas lo hace util para traduccion de documentacion tecnica, aunque la calidad en idiomas distintos del ingles y el chino deberia validarse empiricamente.
- Procesamiento de documentos largos: el contexto nativo de hasta 1M tokens permite resumir o extraer informacion de contratos, informes o transcripciones extensas en una sola pasada, siempre que la memoria disponible lo permita.
- Agentes automatizados de bajo coste: al ser pequeno y compatible con APIs estilo OpenAI, puede desplegarse como multiples instancias para tareas de orquestacion, clasificacion de intenciones o extraccion de entidades en pipelines de agentes.
- Prototipado rapido y evaluacion: investigadores pueden probar tecnicas de prompting, fine-tuning ligero o evaluacion de sesgos con un modelo Apache 2.0 sin restricciones de uso comercial.
- Atencion al cliente en entornos con requisitos de privacidad: el despliegue on-premise mediante Ollama o llama.cpp evita que las conversaciones salgan de la infraestructura de la organizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de esta variante GGUF remite explicitamente al repositorio del modelo base `XHToken/Spark-X2.5-1.7B` para consultar los resultados de evaluacion.

## Requisitos de hardware

- VRAM estimada: con 1,7B parametros, una cuantizacion de 4 bits ocuparia en torno a 1 GB de pesos; una de 8 bits, en torno a 1,8 GB. El repo completo ocupa 6,3 GB porque incluye varias cuantizaciones, no porque el modelo requiera esa memoria.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM puede ejecutar cuantizaciones de 4-8 bits; una RTX 3060, RTX 4060 o superior ofrece margen para contexto extendido. Para contextos cercanos a 1M tokens seria necesario hardware profesional (A100, H100) por el coste de memoria de la cache KV.
- Cabe en GPU consumer: si, en la mayoria de tarjetas con 4 GB o mas de VRAM en cuantizaciones bajas; tambien puede ejecutarse en CPU via llama.cpp u Ollama.
- Opciones de despliegue: llama.cpp (`b10828` o superior), Ollama (`v0.34.1` o superior), LM Studio (runtime `2.34.0` o superior), Unsloth Studio y PocketPal AI. El servidor `llama serve` expone una API compatible con OpenAI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato GGUF | Notas |
|---|---|---|---|---|---|
| Spark-X2.5-1.7B | 1,7B | hasta 1M tokens | Apache 2.0 | si | Atencion hibrida, mas de 200 idiomas declarados |
| Qwen2.5-1.5B | 1,5B | 32K tokens (128K en variantes) | Apache 2.0 | si | Amplia adopcion, buen soporte multilingue |
| Llama 3.2-1B | 1,2B | 128K tokens | Llama 3.2 Community License | si | Requiere cumplir la licencia de Meta para uso comercial |
| Gemma 2-2B | 2,6B | 8K tokens | Gemma Terms of Use | si | Restricciones de uso comercial en la licencia |

La comparativa se basa en caracteristicas publicas de cada familia; no se dispone de datos de benchmarks del Spark-X2.5-1.7B que permitan una comparacion cuantitativa de rendimiento.

## Limitaciones y advertencias

- Con 1,7B parametros, la capacidad de razonamiento complejo y de conocimiento factual es limitada en comparacion con modelos de mayor tamano; es esperable una tasa de alucinacion superior en preguntas factuales.
- El contexto declarado de 1M tokens es una especificacion del modelo base; en la practica, la memoria necesaria para la cache KV a esa longitud excede lo disponible en hardware de consumo.
- Los metadatos solo declaran ingles y chino; la afirmacion de mas de 200 idiomas no esta respaldada por evaluaciones publicadas en la informacion disponible.
- No se han publicado benchmarks en esta ficha, por lo que no es posible verificar el rendimiento real frente a alternativas de tamano similar.
- La licencia Apache 2.0 permite uso comercial sin restricciones adicionales, pero el usuario debe verificar el cumplimiento en su jurisdiccion y en el contexto de aplicaciones reguladas.
- Las versiones de llama.cpp, Ollama y LM Studio deben ser iguales o superiores a las indicadas; versiones anteriores no soportan el tipo de arquitectura `spark2_5` y fallaran al cargar el modelo.
- No se documentan sesgos especificos ni evaluaciones de seguridad en la informacion proporcionada; se recomienda realizar pruebas propias antes de un despliegue en produccion.

## Enlaces

- Repositorio GGUF: https://huggingface.co/XHToken/Spark-X2.5-1.7B-GGUF
- Modelo base: https://huggingface.co/XHToken/Spark-X2.5-1.7B
- llama.cpp: https://github.com/ggml-org/llama.cpp/
- Ollama (descarga): https://ollama.com/download
- Ollama (releases): https://github.com/ollama/ollama/releases
- LM Studio: https://lmstudio.ai/download
- Unsloth Studio: https://unsloth.ai/
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
