# Zain9989/pii-masker-qwen3-4b-GGUF

## Resumen

PII Masker & Ticket Router es un modelo de lenguaje especializado en la deteccion y enmascaramiento de informacion personal identificable (PII) y en la clasificacion de tickets de soporte. Se trata de un ajuste fino (LoRA) del modelo Qwen3-4B-Instruct-2507, desarrollado por el usuario Zain9989, que se distribuye cuantizado en formato GGUF (Q4_K_M, 2,3 GB) para inferencia en CPU o GPU mediante Ollama o llama.cpp. El modelo base cuenta con 4.022.468.096 parametros y esta publicado bajo licencia Apache 2.0.

El modelo resuelve un problema concreto de produccion: procesar tickets de atencion al cliente para redactar datos sensibles (nombres, correos, telefonos, numeros de tarjeta, etc.) antes de que el texto llegue a otros sistemas, y enrutar el ticket a la categoria adecuada. Segun la model card, sobre 200 tickets reservados alcanza un F1 de PII del 97,2 %, un recall de redaccion del 98,9 % y una adherencia al esquema del 100,0 %. La latencia medida en CPU de portatil a traves de Ollama es de aproximadamente 10-11 segundos por ticket una vez cargado el modelo.

Su relevancia actual radica en que ofrece una solucion ligera y desplegable localmente para cumplimiento de privacidad (por ejemplo, RGPD) sin depender de APIs externas, con un tamano que cabe en hardware de consumo y una licencia permisiva para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen3-4B-Instruct-2507, ajuste fino LoRA fusionado) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (valor usado en el ejemplo de llama.cpp de la model card) |
| Tipos de cuantizacion | Q4_K_M (GGUF); otras cuantizaciones no disponibles |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp / Ollama) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino mediante LoRA sobre Qwen3-4B-Instruct-2507, un transformer decoder-only de 4.022 millones de parametros. El adaptador LoRA se fusiona con el modelo base y el resultado se cuantiza a Q4_K_M en formato GGUF para su uso con llama.cpp y Ollama. La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO; esa informacion no esta disponible en los datos proporcionados.

La innovacion principal no es arquitectonica sino de aplicacion: el modelo esta especializado en una tarea de copia verbatim y enmascaramiento estructurado. Por ello la model card insiste en usar `temperature 0` y `repeat_penalty 1.0` (el valor por defecto de 1.1 penaliza la copia literal de la que depende la tarea). El repositorio incluye un `Modelfile` con la plantilla ChatML y el system prompt exacto, ademas de un `prompt_config.json` con la plantilla de usuario, y el proyecto de GitHub anade una capa FastAPI con validacion y una guarda basada en regex.

## Capacidades

- Deteccion y enmascaramiento de PII en texto de tickets (nombres, correos, telefonos y otros datos sensibles, segun la tarea declarada).
- Redaccion de PII con alto recall (98,9 % reportado sobre el conjunto de evaluacion).
- Clasificacion y enrutamiento de tickets de soporte (ticket-classification).
- Salida estructurada con adherencia estricta a un esquema JSON (100,0 % reportado).
- Generacion de texto conversacional (tag `conversational`).
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: solo ingles declarado.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Redaccion de PII en tickets de soporte: el modelo recibe el texto del ticket y devuelve una version con los datos personales enmascarados, adecuada para almacenamiento o envio a sistemas de terceros. Su recall del 98,9 % lo hace apropiado como primera capa de anonimizacion.
- Cumplimiento de privacidad (RGPD y similares): al ejecutarse localmente con Ollama o llama.cpp, el texto sensible no sale de la infraestructura de la organizacion, lo que facilita el cumplimiento normativo.
- Enrutamiento automatico de tickets: clasifica cada ticket en una categoria y lo dirige al equipo correspondiente, reduciendo la triage manual.
- Preprocesado para pipelines de LLM: actua como paso previo de saneamiento antes de enviar texto a modelos mayores o a APIs externas, evitando filtrar datos personales.
- Procesamiento por lotes en CPU: gracias a su cuantizacion Q4_K_M (2,3 GB) puede ejecutarse en portatiles o servidores sin GPU, con una latencia de unos 10-11 segundos por ticket.
- Integracion en servicios FastAPI: el repositorio de GitHub proporciona un servidor de inferencia con validacion y guarda regex, desplegable con `uvicorn` y configurable con `BACKEND=llamacpp`.
- Prototipado y pruebas de concepto: su tamano reducido y licencia Apache 2.0 permiten evaluar rapidamente la viabilidad de un sistema de anonimizacion sin costes de infraestructura.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre 200 tickets reservados (segun la model card):

| Metrica | Valor |
|---|---|
| F1 de PII | 97,2 % |
| Recall de redaccion | 98,9 % |
| Adherencia al esquema | 100,0 % |
| Latencia (CPU de portatil, Ollama) | ~10-11 s por ticket (una vez cargado) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,3 GB para los pesos en Q4_K_M, mas overhead de contexto (adecuado para GPUs con 4 GB o mas).
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM (por ejemplo, RTX 3050, RTX 4060, RTX 4090); tambien funciona en CPU.
- Cabe en GPU consumer: si, en modelos con 4 GB o mas de VRAM; tambien en CPU sin GPU.
- Opciones de despliegue: Ollama (mediante el `Modelfile` del repositorio) y llama.cpp (`llama-server`); el proyecto de GitHub ofrece un servidor FastAPI con validacion y guarda regex.
- Latencia y throughput: ~10-11 s por ticket en CPU de portatil con Ollama; no se dispone de datos de throughput en GPU.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparables con otros modelos de la misma categoria en la informacion proporcionada. Como referencia estructural, el modelo deriva de Qwen3-4B-Instruct-2507 (4.022 millones de parametros, licencia Apache 2.0), pero no se han publicado comparaciones directas con alternativas especializadas en PII.

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| PII Masker (este modelo) | 4.022 M | 4096 | apache-2.0 | GGUF |
| Qwen3-4B-Instruct-2507 (base) | 4.022 M | no disponible | apache-2.0 | safetensors, GGUF |
| Alternativas especializadas en PII | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Solo soporta ingles; no se declaran otros idiomas.
- Es un ajuste fino especializado: su rendimiento fuera de la tarea de PII y clasificacion de tickets no esta documentado.
- Riesgo de alucinacion y de omision de entidades PII no vistas en entrenamiento; el recall del 98,9 % implica que una parte de los datos puede no enmascararse, por lo que se recomienda una capa de validacion adicional (el repositorio incluye una guarda regex).
- La configuracion de decodificacion es critica: con `repeat_penalty` por defecto (1.1) el modelo puede degradar la copia verbatim; debe usarse `temperature 0` y `repeat_penalty 1.0`.
- La longitud de contexto practica documentada es de 4096 tokens; tickets mas largos requeririan truncado o division.
- Licencia Apache 2.0: permite uso comercial, pero se debe conservar el aviso de licencia y no se ofrece garantia.
- No se han publicado detalles sobre sesgos del dataset de entrenamiento ni sobre el proceso de alineacion.
- El modelo tiene pocas descargas (176) y ningun "like", lo que sugiere una validacion comunitaria limitada.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/Zain9989/pii-masker-qwen3-4b-GGUF
- Adaptador LoRA (modelo base): https://huggingface.co/Zain9989/pii-masker-qwen3-4b-lora
- Repositorio GitHub: https://github.com/zainabbas14/slm-pii-masker
- Configuracion de prompt: https://huggingface.co/Zain9989/pii-masker-qwen3-4b-GGUF/blob/main/prompt_config.json
