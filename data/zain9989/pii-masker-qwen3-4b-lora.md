# Zain9989/pii-masker-qwen3-4b-lora

## Resumen

pii-masker-qwen3-4b-lora es un adaptador LoRA (QLoRA de 4 bits) publicado por el usuario Zain9989 que especializa el modelo Qwen3-4B-Instruct-2507 para dos tareas empresariales combinadas: enmascarar datos personales identificables (PII) en texto libre y clasificar tickets de soporte, devolviendo siempre un JSON estricto con los campos `masked_text`, `detected_pii_types`, `ticket_category` y `urgency_level`. El modelo base es la variante de 4B de parámetros de la familia Qwen3, en su revision Instruct-2507, cargada en formato bnb-4bit mediante Unsloth.

El adaptador se entrena con LoRA de rango 16 sobre todos los modulos lineales del transformer, con un dataset propio de 3.400 filas y solo dos epocas, lo que produce una perdida final de evaluacion de 0.0036. Es relevante para equipos que necesitan preprocesar conversaciones de atencion al cliente antes de almacenarlas o enviarlas a otros sistemas, sin depender de APIs externas y con un coste de inferencia muy bajo.

El repositorio ocupa 0,1 GB y se distribuye bajo licencia Apache 2.0. Existe ademas una version cuantizada en GGUF para Ollama y llama.cpp publicada por el mismo autor. No hay informacion sobre benchmarks formales ni sobre idiomas soportados mas alla del heredado del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) con adaptador LoRA sobre atencion y MLP |
| Parametros totales | 4B (modelo base); adaptador LoRA r=16 sobre 7 modulos |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens configurados en el ejemplo de uso; contexto nativo del base no disponible en la informacion |
| Tipos de cuantizacion | QLoRA 4-bit (bnb-4bit) para entrenamiento e inferencia; GGUF disponible en repo separado |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT); GGUF en repositorio aparte |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen3-4B-Instruct-2507, un transformer decoder-only de 4B parametros, mediante LoRA de rango 16, alpha 32, dropout 0.0 y aplicado a los modulos `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`. El entrenamiento se realizo con Unsloth y TRL `SFTTrainer` en una Tesla T4 de Colab, en precision fp16 con cuantizacion 4-bit del base, calculando la perdida unicamente sobre los tokens del asistente.

Los hiperparametros registrados son: 3.400 filas de entrenamiento, 2 epocas, 850 pasos globales, batch efectivo de 8 y learning rate 2e-4. El pico de VRAM fue de 4,05 GB y el tiempo de entrenamiento de 95,2 minutos en esta sesion. La perdida final de entrenamiento fue 0.0145 y la de evaluacion 0.0036. El autor reporta un smoke test de 20 muestras con 20 esquemas JSON validos y 20 categorias correctas, sin que se hayan publicado metricas adicionales. El dataset de entrenamiento es `Zain9989/enterprise-pii-ticket-sft`, de composicion no detallada en la informacion disponible.

## Capacidades

- Enmascaramiento de PII en texto libre, devolviendo el texto redactado en `masked_text`.
- Deteccion y listado de tipos de PII en `detected_pii_types`.
- Clasificacion de tickets de soporte en `ticket_category`.
- Asignacion de nivel de urgencia en `urgency_level`.
- Salida en JSON estricto y consistente, adecuada para parsing automatizado.
- Conversacion multi-turno (pipeline conversational) heredada del modelo base.
- Generacion de texto general segun las capacidades del Qwen3-4B subyacente.
- No se documenta soporte explicito de tool calling, agentes, vision ni audio en la informacion disponible.

## Casos de uso

- Redaccion previa al almacenamiento de logs de atencion al cliente: el adaptador procesa el texto del ticket y devuelve una version enmascarada antes de persistirla en bases de datos o sistemas de analitica, reduciendo la exposicion de datos personales.
- Enrutado automatico de tickets: la clasificacion en `ticket_category` y `urgency_level` permite dirigir cada ticket al equipo o cola adecuada sin intervencion manual.
- Cumplimiento normativo (RGPD y similares): integrado como paso previo en pipelines de exportacion de conversaciones, permite anonimizar antes de compartir datos con terceros o procesadores externos.
- Preprocesamiento para modelos posteriores: el JSON de salida puede alimentar sistemas de resumen, busqueda o analisis de sentimiento que no deberian recibir PII en claro.
- Despliegue en local u on-premise: gracias a la cuantizacion 4-bit y a la version GGUF, puede ejecutarse en hardware modesto dentro de la infraestructura de la empresa, evitando enviar datos sensibles a APIs externas.
- Triaje en mesas de ayuda: combinado con un clasificador de prioridad, el campo `urgency_level` permite escalar incidencias criticas de forma inmediata.
- Generacion de datasets anonimizados para entrenamiento: el modelo puede usarse para redactar corpus de tickets reales antes de reutilizarlos en experimentos internos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de evaluacion reportado es un smoke test interno de 20 muestras con 20 esquemas JSON validos y 20 categorias correctas, junto con las perdidas de entrenamiento (0.0145) y evaluacion (0.0036).

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4 GB con cuantizacion 4-bit (el entrenamiento registro un pico de 4,05 GB en una T4).
- GPU recomendadas: Tesla T4 (validada por el autor), RTX 3060 12 GB, RTX 4060 Ti, RTX 4090, A100 y H100 para mayor throughput.
- Cabe en GPU de consumo: si, en tarjetas con al menos 6-8 GB de VRAM en configuracion 4-bit; la version GGUF permite requisitos aun menores.
- Opciones de despliegue: Unsloth con `FastLanguageModel`, PEFT/Transformers, llama.cpp y Ollama mediante el repositorio GGUF; vLLM y TGI no estan documentados en la informacion disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pii-masker-qwen3-4b-lora | 4B (base) + LoRA r=16 | 1024 configurados | PII masking + clasificacion de tickets con JSON estricto | Apache 2.0 | Hugging Face (adaptador y GGUF) |
| Qwen3-4B-Instruct-2507 (base) | 4B | no disponible | Generacion de texto general | Apache 2.0 | Hugging Face |
| Alternativas especializadas en PII de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo con otros adaptadores especializados en PII en la informacion proporcionada.

## Limitaciones y advertencias

- No hay benchmarks publicados: las unicas metricas son perdidas de entrenamiento y un smoke test de 20 muestras, insuficiente para validar robustez en produccion.
- El smoke test reporta 20/20 en esquema y categoria, pero no cubre casos limite, PII atipica ni tickets ambiguos.
- El contexto configurado en el ejemplo de uso es de 1024 tokens; tickets o conversaciones mas largos pueden truncarse.
- No se documentan idiomas soportados; el comportamiento multilingue depende del modelo base y no esta validado por el autor.
- El adaptador se entreno con solo 2 epocas sobre 3.400 filas, lo que puede limitar la generalizacion a dominios o formatos de ticket distintos del dataset de entrenamiento.
- Riesgo de alucinacion inherente a los modelos generativos: puede omitir PII presente o inventar tipos de PII no existentes; se recomienda validacion adicional con reglas o un segundo clasificador.
- El prompt de sistema debe usarse literalmente desde `prompt_config.json`; desviarse de el puede degradar el formato JSON de salida.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; conviene auditar el modelo en el caso de uso concreto antes de desplegarlo.
- El adaptador depende del modelo base `unsloth/Qwen3-4B-Instruct-2507-unsloth-bnb-4bit`; sustituciones del base pueden alterar el comportamiento.

## Enlaces

- Repositorio Hugging Face del adaptador: https://huggingface.co/Zain9989/pii-masker-qwen3-4b-lora
- Dataset de entrenamiento: https://huggingface.co/datasets/Zain9989/enterprise-pii-ticket-sft
- Version GGUF para Ollama y llama.cpp: https://huggingface.co/Zain9989/pii-masker-qwen3-4b-GGUF
- Modelo base: https://huggingface.co/unsloth/Qwen3-4B-Instruct-2507-unsloth-bnb-4bit
- Unsloth: https://github.com/unslothai/unsloth
- TRL: https://github.com/huggingface/trl
- PEFT: https://github.com/huggingface/peft
