# SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-v3

## Resumen

El modelo `SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-v3` es un adaptador LoRA (Low-Rank Adaptation) entrenado mediante fine-tuning supervisado (SFT) sobre el modelo base `Qwen/Qwen3.5-0.8B`. Lo publica la organización SZLHOLDINGS, que mantiene el repositorio `szl-forge` en GitHub, donde documenta un kit de fine-tuning QLoRA orientado a entrenar modelos propios sobre hardware propio. El nombre del modelo sugiere un uso especializado en el procesamiento de recibos o tickets de compra (receipt agent), aunque la model card no aporta detalles funcionales concretos.

La relevancia de este modelo reside en su tamaño reducido (0.8 mil millones de parámetros en el modelo base) y en su formato de adaptador PEFT, lo que permite incorporarlo a flujos de trabajo con requisitos de hardware modestos. Al estar basado en la familia Qwen 3.5, hereda las capacidades de razonamiento y generación de texto de dicha familia, aunque el fine-tuning específico para recibos podría limitar o especializar su comportamiento. La ficha pública es muy incompleta: la model card no incluye descripción, datos de entrenamiento, evaluación ni licencia, por lo que cualquier uso en producción requiere verificación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen/Qwen3.5-0.8B (transformer decoder) |
| Parametros totales | No disponible (el adaptador LoRA anade un numero reducido de parametros al modelo base de 0.8B) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible (heredada del modelo base Qwen3.5-0.8B, no especificada en la ficha) |
| Tipos de cuantizacion | No disponible (el adaptador es en safetensors; el modelo base admite cuantizacion GGUF, pero no se indica para este adaptador) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA aplicado sobre `Qwen/Qwen3.5-0.8B`, un modelo de lenguaje de tipo transformer decoder con 0.8 mil millones de parametros. La tecnica LoRA congela los pesos del modelo base e introduce matrices de bajo rango en las capas de atencion y feed-forward, lo que reduce drasticamente el numero de parametros entrenables y los requisitos de memoria durante el fine-tuning. El entrenamiento se realizo mediante SFT (supervised fine-tuning) usando las librerias `transformers`, `trl` y `unsloth`, segun los tags de la ficha. La version de PEFT empleada es la 0.19.1.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens, la composicion de los datos ni si se aplicaron tecnicas adicionales como RLHF o DPO. El repositorio `szl-forge` en GitHub contiene un kit de fine-tuning QLoRA para una version anterior (`qwen35-receiptagent-v2`), que incluye dataset, script de entrenamiento con Unsloth y un Modelfile de Ollama, lo que sugiere que el proceso para v3 pudo ser similar, pero no hay confirmacion publica.

## Capacidades

- Generacion de texto conversacional basada en el modelo base Qwen3.5-0.8B, especializada presumiblemente en tareas relacionadas con recibos o tickets de compra (extraccion de datos, resumen, clasificacion), segun el nombre del modelo.
- Capacidades de razonamiento y generacion de codigo heredadas del modelo base Qwen3.5-0.8B, aunque el fine-tuning especifico puede haberlas degradado en favor de la tarea objetivo.
- Soporte de tool calling y function calling: no confirmado explicitamente, pero los modelos Qwen 3.5 suelen incluirlo; no hay evidencia en la ficha.
- Capacidades multilingues: no disponibles, aunque Qwen 3.5 es multilingue por defecto.
- No se indican capacidades especiales como modo thinking, vision o audio.

## Casos de uso

- Extraccion de datos de recibos: el modelo puede procesar texto de tickets de compra y extraer campos estructurados como importe, fecha, establecimiento o categoria, gracias al fine-tuning especializado.
- Clasificacion de gastos: dado un texto de recibo, el modelo puede asignar una categoria de gasto (alimentacion, transporte, ocio) para aplicaciones de contabilidad personal o empresarial.
- Asistente de conciliacion bancaria: integrado en un pipeline que recibe extractos de tarjetas y recibos escaneados, el modelo puede emparejar transacciones y detectar discrepancias.
- Chatbot de atencion al cliente para consultas sobre facturas y recibos: el modelo puede responder preguntas sobre compras realizadas, devoluciones o garantias, usando su capacidad conversacional.
- Automatizacion de contabilidad para pymes: el modelo puede preprocesar recibos antes de introducirlos en un ERP, reduciendo la entrada manual de datos.
- Filtrado y validacion de recibos duplicados o fraudulentos: el modelo puede comparar descripciones de recibos y senalar posibles duplicados o anomalias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna tabla de evaluacion, y no se han encontrado datos externos de rendimiento para esta version concreta. El repositorio GitHub menciona una version anterior, pero sin resultados numericos.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un adaptador LoRA sobre un modelo de 0.8B, la inferencia puede ejecutarse en GPUs con 4-6 GB de VRAM en precision FP16, y menos si se cuantiza el modelo base a 4 u 8 bits.
- GPU recomendadas: una NVIDIA RTX 3060 (12 GB) o superior es suficiente para inferencia local; tambien puede ejecutarse en CPU con lentitud aceptable para tareas cortas.
- Si cabe en consumer GPU: si, cabe en GPUs de gama media e incluso en algunas integradas con cuantizacion agresiva (4 bits).
- Opciones de despliegue: al ser un adaptador PEFT, debe combinarse con el modelo base Qwen3.5-0.8B. Puede servirse con `transformers` + `peft`, o exportarse a GGUF para usarse con `llama.cpp`, `Ollama` o `vLLM` (con las adaptaciones necesarias).
- Latencia y throughput: no disponibles; dependen del hardware y de la cuantizacion. En una GPU moderna se esperan latencias de decenas de milisegundos por token.

## Comparativa con modelos similares

No se dispone de informacion suficiente para una comparativa rigurosa. El modelo es un adaptador especializado sobre Qwen3.5-0.8B, y no existen datos publicos de rendimiento ni de parametros entrenables. Como referencia, el modelo base Qwen3.5-0.8B se puede comparar con otros modelos pequenos como Llama 3.2 1B o Gemma 2 2B, pero el adaptador LoRA no cambia la arquitectura subyacente de forma significativa. No disponible.

## Limitaciones y advertencias

- La model card no proporciona informacion sobre sesgos, alucinaciones o limitaciones de contexto; se desconocen los riesgos especificos del fine-tuning.
- No se especifica la licencia, lo que impide conocer las restricciones de uso comercial. Se debe contactar con el autor antes de usar el modelo en produccion.
- El tamano del adaptador es de 0.0 GB segun el repo, lo que sugiere que el adaptador es muy pequeno (tipico de LoRA), pero tambien implica que el modelo base debe descargarse por separado.
- No se han publicado datos de evaluacion, por lo que el rendimiento real en tareas de recibos es desconocido.
- El nombre del modelo indica una especializacion en recibos, pero no hay evidencia publica de que el fine-tuning haya sido validado con datos reales de produccion.
- La fecha de creacion (2026-08-29) es futura respecto a la fecha de este analisis, lo que sugiere que el modelo podria ser experimental o estar en fase de desarrollo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-v3
- Repositorio GitHub de SZL Forge (con kit para v2): https://github.com/szl-holdings/szl-forge/tree/main/frontier/qwen35-receiptagent-v2
- README del kit v2: https://github.com/szl-holdings/szl-forge/blob/main/frontier/qwen35-receiptagent-v2/README.md
- Pagina de FriendliAI para la version v2 (no v3): https://friendli.ai/models/SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-v2
- Coleccion Qwen3.5 en Hugging Face: https://huggingface.co/collections/Qwen/qwen35
