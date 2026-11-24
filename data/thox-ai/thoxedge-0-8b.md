# Thox-ai/ThoxEdge-0.8B

## Resumen

ThoxEdge-0.8B es un modelo de generacion de texto de 0,75 mil millones de parametros desarrollado por Thox-ai (THOX.ai), construido a partir del modelo base Qwen/Qwen3.5-0.8B mediante la fusion de un adaptador LoRA entrenado con datos propios de SFT (supervised fine-tuning) y publicado en bf16. Forma parte de la linea ThoxEdge, orientada a inferencia local en dispositivos de borde (edge) de la propia familia de hardware de THOX, y se distribuye con pesos fusionados, conversiones GGUF (Q4_K_M y Q8_0) y un Modelfile para Ollama.

El modelo se presenta como el buque insignia de la gama ThoxEdge y esta disenado para responder a partir de hechos canonicos de THOX y declinar responder cuando la informacion no ha sido publicada por la compania. Segun la model card, supera una evaluacion interna denominada GATE49 con 46 de 49 aciertos sobre el conjunto de desarrollo, sin fallos duros conocidos como falsos. Esta entrenado sobre el corpus thox-factory-sft-v5, de 982 filas, y su licencia es Apache 2.0.

Su relevancia actual reside en la combinacion de tamano reducido, licencia permisiva y disponibilidad inmediata en formatos listos para produccion local (safetensors, GGUF y Ollama), lo que lo hace adecuado para despliegues en hardware de consumo y entornos sin conectividad. La informacion publica no detalla la longitud de contexto, los idiomas mas alla del ingles ni los datos de arquitectura interna mas alla del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-0.8B; tag `qwen3_5_text`); detalles internos no disponibles |
| Parametros totales | 752.393.024 (segun safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (pesos fusionados), GGUF Q4_K_M, GGUF Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo es una fusion (merge) en bf16 de un adaptador LoRA sobre el modelo base Qwen/Qwen3.5-0.8B, que THOX describe como una arquitectura transformer de la familia Qwen3.5 con soporte de texto. El adaptador se entreno con datos propios de SFT (dataset Thox-ai/thox-factory-sft-v5) y se fusiono en casa; el repositorio aloja la forma servible del adaptador, es decir, los pesos fusionados, las conversiones GGUF y el Modelfile de Ollama. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion detallada del dataset ni si se aplicaron fases de RLHF o DPO.

La model card indica que esta es la primera build fusionada publicada de este nivel sobre el corpus de 982 filas, y que la version GGUF de la ola anterior (Wave B) nunca se publico porque su lectura de gate era un artefacto de serving. Como innovacion destacable, el modelo incorpora un comportamiento de rechazo explicito ante preguntas sobre hechos no publicados por THOX, orientado a reducir afirmaciones falsas sobre la propia compania. No se documentan tecnicas como decodificacion especulativa, atencion lineal o arquitecturas hibridas.

## Capacidades

- Generacion de texto conversacional en ingles, con foco en respuestas fundamentadas en hechos canonicos de THOX.
- Comportamiento de rechazo controlado: declina responder cuando la informacion no ha sido publicada por THOX, en lugar de inventarla.
- Ajuste fino supervisado (SFT) sobre un corpus propio orientado a conversacion.
- Compatibilidad con endpoints (tag `endpoints_compatible`) y plantilla de chat incluida (`chat_template.jinja`).
- Despliegue local-first: pesos en safetensors, GGUF Q4_K_M y Q8_0, y Modelfile para Ollama.
- No se documentan en la informacion disponible capacidades de tool calling, function calling, razonamiento multi-paso, agentes, vision, audio ni modo thinking.
- Capacidad multilingue limitada al ingles segun el campo `language` de la model card.

## Casos de uso

- Asistente de atencion al cliente en dispositivos locales: el modelo puede gestionar conversaciones multi-turno sobre productos y servicios de THOX respondiendo solo con hechos publicados y declinando el resto, lo que reduce el riesgo de afirmaciones incorrectas ante el usuario.
- Chatbot embebido en hardware de borde: con cuantizacion Q4_K_M (529 MB) puede ejecutarse en dispositivos con poca memoria, como los equipos ThoxAir y ThoxMini de la propia familia, sin depender de la nube.
- Base para prototipos de asistentes privados: al ser Apache 2.0 y de 0,75B parametros, sirve para validar flujos conversacionales en local antes de escalar a modelos mayores.
- Despliegue en Ollama para entornos de desarrollo: el comando `ollama run Thox-ai/thoxedge-0.8b` permite tener un endpoint compatible con OpenAI en minutos, util para pruebas de integracion y demos.
- Servicio de inferencia con llama.cpp: mediante `llama serve -hf Thox-ai/ThoxEdge-0.8B:Q4_K_M` se expone una API compatible con OpenAI en el puerto indicado, adecuada para integrar en aplicaciones de escritorio en macOS y Windows.
- Filtrado y respuesta de preguntas frecuentes sobre documentacion corporativa: el modelo puede configurarse para responder unicamente a partir de un conjunto cerrado de hechos, lo que encaja en escenarios de soporte interno con informacion controlada.
- Evaluacion de pipelines de cuantizacion: al publicar Q4_K_M y Q8_0 con hashes SHA-256, sirve para comparar calidad y latencia entre cuantizaciones en hardware modesto.

## Benchmarks y rendimiento

La model card reporta un resultado interno denominado GATE49 de 46/49 aciertos sobre el conjunto de desarrollo, sin fallos duros conocidos como falsos. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

| Evaluacion | Resultado | Conjunto |
|---|---|---|
| GATE49 | 46/49 | Desarrollo (interno de THOX) |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB con GGUF Q4_K_M (529 MB de pesos), en torno a 0,8 GB con Q8_0 (812 MB) y cerca de 1,5 GB con bf16 (1.504.827.608 bytes), sin contar el overhead del runtime ni la cache KV.
- GPU recomendadas: no se especifican en la informacion disponible; por tamano, cualquier GPU consumer con 2 GB o mas de VRAM deberia poder alojarlo en cuantizacion Q4_K_M.
- Cabe en GPU de consumo: si, incluidas tarjetas de gama baja y entornos integrados; la propia model card lo posiciona para dispositivos de borde.
- Opciones de despliegue: Ollama (`ollama run Thox-ai/thoxedge-0.8b`), llama.cpp / Llama (`llama serve -hf Thox-ai/ThoxEdge-0.8B:Q4_K_M`), descarga directa de GGUF via `hf download`, y transformers con safetensors. No se mencionan vLLM ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ThoxEdge-0.8B | 752.393.024 | no disponible | Apache 2.0 | Hugging Face, Ollama, GGUF | Fusion SFT sobre Qwen3.5-0.8B, solo ingles |
| Qwen/Qwen3.5-0.8B (base) | no disponible en la informacion | no disponible | no disponible en la informacion | Hugging Face | Modelo base del que deriva ThoxEdge |
| Alternativas de ~1B parametros | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; al derivar de un modelo base de Qwen, puede heredar sesgos de sus datos de entrenamiento.
- Riesgo de alucinacion: el modelo esta disenado para declinar hechos no publicados por THOX, pero no se ofrecen garantias formales ni evaluaciones externas que midan la tasa de alucinacion fuera del conjunto GATE49.
- Limitacion de idioma: solo se declara soporte de ingles; el uso en castellano no esta garantizado.
- Longitud de contexto: no disponible, lo que impide planificar casos de uso con documentos largos o conversaciones extensas.
- Alcance del entrenamiento: el corpus SFT documentado es de 982 filas, un volumen reducido que puede limitar la generalizacion fuera del dominio de THOX.
- Licencia: Apache 2.0 permite uso comercial, pero deben respetarse las condiciones del modelo base Qwen3.5-0.8B, cuya licencia no se detalla en la informacion proporcionada.
- Caveat de produccion: la evaluacion reportada es interna y sobre conjunto de desarrollo, no sobre un conjunto de test independiente; conviene validar el comportamiento en el dominio concreto antes de desplegarlo.
- La model card incluye contenido promocional (campana de Kickstarter y notas del fundador) que no constituye documentacion tecnica verificable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Thox-ai/ThoxEdge-0.8B
- Adaptador LoRA de origen (Wave C): https://huggingface.co/Thox-ai/ThoxEdge-0.8B-WaveC
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset de SFT: https://huggingface.co/datasets/Thox-ai/thox-factory-sft-v5
- Demos de dispositivos virtuales: https://thox.ai/#demo-callout-home_lineup
- Campana de Kickstarter de THOX: https://www.kickstarter.com/projects/thox/four-devices-one-private-ai-ecosystem-thoxai
