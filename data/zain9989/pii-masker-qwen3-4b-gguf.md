# Zain9989/pii-masker-qwen3-4b-GGUF

## Resumen

pii-masker-qwen3-4b-GGUF es una distribucion cuantizada en formato GGUF (Q4_K_M) del modelo ajustado Zain9989/pii-masker-qwen3-4b-lora, construido sobre Qwen3-4B y especializado en la deteccion y enmascarado de informacion personal identificable (PII) en texto. El autor es Zain9989, un usuario individual de Hugging Face sin publicaciones tecnicas asociadas, y el modelo esta pensado para inferencia en CPU o GPU mediante Ollama o llama.cpp, lo que lo hace utilizable en entornos locales sin infraestructura de servidores dedicados.

El modelo resuelve un problema concreto: la redaccion automatica de datos sensibles (nombres, documentos, direcciones, telefonos, correos) antes de almacenar, compartir o procesar texto con otros sistemas. Frente a soluciones basadas en reglas o en modelos NER clasicos, un modelo generativo de 4.000 millones de parametros permite enmascarar PII con contexto semantico, a costa de requerir prompts especificos y temperatura cero para ser fiable.

La relevancia actual viene de su despliegue ligero: el repositorio ocupa 2,5 GB, corre en hardware consumer y se integra con endpoints compatibles, lo que facilita incorporarlo en pipelines de preprocesamiento de datos. La informacion publica disponible es muy escasa (sin benchmarks, sin detalle del dataset de entrenamiento y sin idiomas declarados), por lo que esta ficha refleja unicamente lo verificable en la model card y los metadatos de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen3-4B); no disponible detalle adicional |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el ejemplo de llama.cpp usa `--ctx-size 2048`) |
| Tipos de cuantizacion | GGUF Q4_K_M (unica variante publicada en el repo) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp / Ollama) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino (LoRA) de Qwen3-4B, fusionado y posteriormente cuantizado a GGUF Q4_K_M. La model card no documenta la arquitectura interna mas alla de indicar el modelo base; Qwen3-4B es un transformer decoder-only con atencion causal, pero el autor no aporta detalles sobre atencion lineal, decodificacion especulativa ni otras innovaciones. Tampoco se especifica el numero de tokens de entrenamiento, la composicion del dataset de PII ni si se aplico RLHF o DPO; la etiqueta `unsloth` sugiere que el ajuste se realizo con la libreria Unsloth, habitual para fine-tuning eficiente de LoRA.

La unica indicacion operativa relevante es que el modelo debe usarse siempre con el system prompt incluido en `prompt_config.json` y con temperatura 0, lo que apunta a un ajuste orientado a salidas deterministas y formato estricto (probablemente etiquetas de enmascarado consistentes). No hay informacion sobre el proceso de merge de LoRA ni sobre evaluacion del modelo ajustado antes de cuantizar.

## Capacidades

- Deteccion y enmascarado de PII en texto: el proposito declarado del modelo, segun su nombre y tags (`pii`, `redaction`).
- Generacion de texto conversacional: el tag `conversational` indica soporte de formato chat.
- Ejecucion local en CPU/GPU: distribucion GGUF compatible con llama.cpp y Ollama.
- Integracion con endpoints compatibles: el tag `endpoints_compatible` sugiere uso via API compatible con OpenAI.
- Capacidades multilingues: no disponibles (no se declaran idiomas).
- Tool calling, agentes, vision, audio, thinking mode: no disponibles en la informacion publica.

## Casos de uso

- Redaccion de PII en logs de aplicaciones: enviar cada linea de log al modelo con el system prompt de `prompt_config.json` y temperatura 0 para sustituir nombres, correos y documentos antes de persistir los logs en sistemas de observabilidad.
- Preprocesamiento de datasets para entrenamiento: enmascarar PII en corpus textuales antes de usarlos para fine-tuning de otros modelos, reduciendo el riesgo de memorizacion de datos personales.
- Anonimizado de transcripciones de atencion al cliente: procesar transcripciones de chats o llamadas para eliminar datos identificativos antes de enviarlas a equipos de analisis o QA.
- Cumplimiento normativo en pipelines de datos: integrar el modelo como etapa de redaction en flujos ETL sujetos a RGPD, usando Ollama en local para evitar enviar texto sensible a servicios externos.
- Sanitizado de tickets de soporte: enmascarar datos de clientes en tickets exportados hacia herramientas de ticketing o analitica, manteniendo la estructura del texto para su revision.
- Filtro previo en sistemas RAG: aplicar el modelo a documentos antes de indexarlos en una base vectorial, evitando que PII quede recuperable por consultas de otros usuarios.
- Prototipado rapido en estaciones de trabajo: usar `ollama run hf.co/Zain9989/pii-masker-qwen3-4b-GGUF:Q4_K_M` para validar la calidad de enmascarado sobre muestras propias antes de comprometer infraestructura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3-4 GB con Q4_K_M (repo de 2,5 GB mas overhead de contexto y runtime); no disponible cifra oficial del autor.
- GPU recomendadas: no disponibles; por tamano, cualquier GPU consumer con 6 GB o mas de VRAM deberia poder ejecutarlo, y tambien es viable en CPU.
- Cabe en GPU consumer: si, con Q4_K_M en tarjetas de 6-8 GB (por ejemplo, RTX 3060, RTX 4060); no confirmado por el autor.
- Opciones de despliegue: Ollama (`ollama run hf.co/Zain9989/pii-masker-qwen3-4b-GGUF:Q4_K_M`) y llama.cpp (`llama-server -hf Zain9989/pii-masker-qwen3-4b-GGUF:Q4_K_M --ctx-size 2048 --temp 0`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| pii-masker-qwen3-4b-GGUF | 4.022 M | no disponible | GGUF Q4_K_M | Apache 2.0 | Enmascarado de PII |
| Qwen3-4B (base) | 4.022 M | no disponible en esta ficha | safetensors, GGUF | Apache 2.0 | Generico |
| Modelos NER clasicos (p. ej., spaCy/Stanza) | variable, tipicamente < 1.000 M | no disponible | frameworks propios | variable | Extraccion de entidades |

La comparativa con alternativas especializadas en PII no puede completarse con datos verificables: no se dispone de benchmarks del modelo ni de alternativas evaluadas en la misma tarea dentro de la informacion proporcionada. Frente a Qwen3-4B base, la diferencia es el ajuste LoRA para redaction y la distribucion GGUF; frente a NER clasico, la diferencia es el enfoque generativo frente a clasificacion de spans.

## Limitaciones y advertencias

- Sin benchmarks publicos: no hay evidencia verificable de precision, recall ni tasas de falsos positivos en enmascarado de PII.
- Dependencia estricta del prompt: la model card exige usar el system prompt de `prompt_config.json` y temperatura 0; usarlo de otra forma puede degradar gravemente la calidad.
- Riesgo de alucinacion: como modelo generativo, puede inventar o modificar texto al enmascarar; en produccion conviene validar la salida (por ejemplo, comparando longitud y estructura con la entrada).
- Idiomas no declarados: no se especifica cobertura linguistica, por lo que no hay garantia de funcionamiento fuera del idioma o idiomas usados en el ajuste.
- Contexto limitado en el ejemplo oficial (`--ctx-size 2048`): documentos largos pueden requerir troceado, con riesgo de perder contexto entre fragmentos.
- Licencia Apache 2.0: permite uso comercial, pero no se ofrece garantia del autor sobre el rendimiento ni sobre el cumplimiento normativo derivado del uso.
- Trazabilidad limitada: autor individual, 0 descargas y 0 likes en el momento de la consulta, sin documentacion de dataset ni evaluacion; adecuado para prototipos, no para despliegues criticos sin evaluacion propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Zain9989/pii-masker-qwen3-4b-GGUF
- Modelo base del ajuste (LoRA): https://huggingface.co/Zain9989/pii-masker-qwen3-4b-lora
- Ollama: https://ollama.com
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Unsloth: https://github.com/unslothai/unsloth
