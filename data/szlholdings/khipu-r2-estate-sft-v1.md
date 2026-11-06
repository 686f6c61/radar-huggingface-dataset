# SZLHOLDINGS/KHIPU-R2-estate-sft-v1

## Resumen

KHIPU-R2-estate-sft-v1 es un ajuste fino supervisado (SFT) del modelo base SZLHOLDINGS/KHIPU-R2, publicado por SZL Holdings. Se trata de un modelo de generacion de texto de aproximadamente 1.540 millones de parametros, distribuido en formato safetensors y compatible con la libreria transformers y con text-generation-inference. Su proposito declarado es incorporar conocimiento de un corpus interno denominado "estate corpus" (conocimiento patrimonial, doctrina, cuantizacion y materiales de frontera) junto con un mecanismo de "contrapeso de abstencion" disenado para reducir la confabulacion.

El entrenamiento se realizo con QLoRA de 4 bits (rango 16), durante 2 epocas, con una tasa de aprendizaje de 2e-4, longitud de secuencia de 4096 tokens y empaquetado de secuencias, sobre una unica GPU RTX A6000. El artefacto publicado es el modelo completo fusionado en 16 bits. La model card es explicitamente cauta: el autor indica que no se trata de una evaluacion independiente de calidad y que no se emite ninguna afirmacion de precision o rendimiento; la evaluacion de flota esta pendiente.

La relevancia de esta ficha es doble. Por un lado, documenta un caso de ajuste fino de bajo coste sobre un modelo pequeno con licencia Apache 2.0. Por otro, su interes tecnico principal reside en la estrategia de contrapeso de abstencion, orientada a que el modelo reconozca los limites de su conocimiento en lugar de generar respuestas plausibles pero incorrectas. No obstante, la informacion publica disponible es muy limitada y la mayoria de especificaciones tecnicas del modelo base no se detallan.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2, segun el tag `qwen2`); detalles de capas y atencion no disponibles |
| Parametros totales | 1.543.714.304 (dato real de safetensors) |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible en la model card; el entrenamiento uso secuencias de 4096 tokens |
| Tipos de cuantizacion | no se publican artefactos cuantizados; el ajuste se realizo en QLoRA 4-bit y el artefacto publicado es 16-bit fusionado |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del base SZLHOLDINGS/KHIPU-R2, que los tags de Hugging Face identifican como de la familia Qwen2, es decir, un transformer decoder-only con atencion causal. No se detallan en la informacion disponible el numero de capas, la dimension oculta, el numero de cabezas de atencion ni el tipo de positional encoding. El tamano de 1.543.714.304 parametros situa al modelo en la franja de los modelos pequenos, adecuados para despliegue en hardware de gama media.

El ajuste fino se realizo con QLoRA de 4 bits con rango 16, durante 2 epocas, con tasa de aprendizaje 2e-4, longitud de secuencia de 4096 tokens y empaquetado de secuencias, sobre una RTX A6000 con el backend Unsloth. El corpus de entrenamiento es el "estate corpus" completo, con mas de 3.176 ejemplos que combinan conocimiento patrimonial, doctrina, cuantizacion, materiales de frontera y el contrapeso de abstencion. Este ultimo se construyo a partir de un fallo de confabulacion medido en las recepciones de evaluacion, segun la model card. No se especifica el numero total de tokens de entrenamiento ni si hubo fases de RLHF o DPO; el metodo declarado es exclusivamente SFT.

La innovacion tecnica destacable es el denominado "abstention counterweight", un conjunto de ejemplos orientado a que el modelo aprenda a abstenerse de responder cuando no dispone de informacion fiable. La model card no describe la composicion exacta de ese conjunto ni la metrica de confabulacion utilizada para construirlo.

## Capacidades

- Generacion de texto conversacional en ingles, segun el pipeline declarado (`text-generation`) y el tag `conversational`.
- Conocimiento especializado del dominio "estate" (patrimonio, doctrina y materiales de cuantizacion) inyectado mediante SFT.
- Comportamiento de abstencion calibrado: el modelo ha sido entrenado para reconocer los limites de su conocimiento y evitar respuestas confabuladas, segun la intencion declarada del contrapeso de abstencion.
- Compatibilidad con text-generation-inference y con endpoints compatibles, segun los tags del repositorio.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun el campo `language` de la model card.
- Capacidades especiales (modo thinking, vision, audio): no disponibles en la informacion proporcionada.

## Casos de uso

- Asistente conversacional de dominio patrimonial: el modelo puede mantener conversaciones multi-turno sobre conocimiento del "estate corpus" gracias al ajuste supervisado sobre mas de 3.176 ejemplos especializados, adecuado para consultas internas de una organizacion.
- Sistemas de preguntas y respuestas con abstención controlada: en escenarios donde una respuesta incorrecta es costosa, el contrapeso de abstencion permite que el modelo decline responder cuando la consulta queda fuera de su corpus, reduciendo el riesgo de confabulacion.
- Clasificacion y resumen de documentacion interna: con 1.540 millones de parametros y contexto de entrenamiento de 4096 tokens, puede procesar documentos de extension media para extraer y resumir informacion patrimonial.
- Prototipado rapido en hardware de gama media: su tamano permite desplegarlo en una unica GPU consumer de gama alta, lo que facilita iteracion y pruebas internas sin infraestructura dedicada.
- Base para nuevos ajustes de dominio: al estar publicado como modelo completo fusionado en 16 bits con licencia Apache 2.0, sirve como punto de partida para SFT adicionales mediante LoRA o QLoRA sobre corpus propios.
- Evaluacion de estrategias anti-confabulacion: util como referencia para investigadores que estudien tecnicas de calibracion y abstencion en modelos pequenos, comparando su comportamiento con el del modelo base KHIPU-R2.
- Integracion en pipelines de generacion aumentada por recuperacion (RAG): el modelo puede actuar como generador final sobre documentos recuperados, con la abstencion como salvaguarda cuando el contexto recuperado no cubre la pregunta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se emite ninguna afirmacion de precision o rendimiento y que la evaluacion de flota esta pendiente.

## Requisitos de hardware

- VRAM estimada para inferencia en 16 bits: aproximadamente 3,1 GB solo para los pesos, mas overhead de activaciones y cache KV; en la practica, entre 4 y 6 GB para contextos moderados.
- VRAM estimada en cuantizacion de 8 bits: en torno a 1,6 GB para pesos, con un total practico de 3 a 4 GB.
- VRAM estimada en cuantizacion de 4 bits: en torno a 0,8 GB para pesos, con un total practico de 2 a 3 GB.
- GPU recomendadas: RTX A6000 (la utilizada en el entrenamiento), A100 o H100 para despliegues de mayor concurrencia; RTX 4090, RTX 3090 y RTX 4080 para inferencia en una sola tarjeta.
- Cabe en GPU consumer: si, en tarjetas con 8 GB o mas de VRAM en 16 bits, y en tarjetas con 4 a 6 GB si se cuantiza.
- Opciones de despliegue: transformers, text-generation-inference (declarado en los tags) y endpoints compatibles; llama.cpp, Ollama y vLLM no se mencionan en la informacion disponible, aunque al ser un transformer Qwen2 estandar son opciones plausibles previa conversion.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| KHIPU-R2-estate-sft-v1 | 1.543.714.304 | no disponible (entrenado a 4096) | Apache 2.0 | SFT de dominio con contrapeso de abstencion; sin benchmarks publicados |
| SZLHOLDINGS/KHIPU-R2 (base) | no disponible | no disponible | no disponible | Modelo base del ajuste; sin datos publicos de rendimiento en la informacion disponible |
| Qwen2-1.5B (referencia de familia) | ~1.500 millones | 32.768 tokens (segun especificaciones publicas de la familia) | Apache 2.0 | Arquitectura de referencia de la que deriva el tag `qwen2`; no se ha verificado que KHIPU-R2 sea un derivado directo |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada, por lo que la comparativa se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- La model card declara explicitamente que no es una evaluacion independiente de calidad y que no se emite ninguna afirmacion de precision o rendimiento; la evaluacion de flota esta pendiente.
- Riesgo de alucinacion: aunque el contrapeso de abstencion busca mitigarlo, no se publican metricas que cuantifiquen la reduccion de confabulacion lograda.
- Idiomas: el modelo esta declarado unicamente en ingles; su comportamiento en castellano u otros idiomas no esta documentado y probablemente sea deficiente.
- Longitud de contexto: no se especifica la ventana maxima del modelo base; el entrenamiento uso 4096 tokens, por lo que contextos superiores no estan garantizados.
- Sesgos conocidos: no se documentan en la informacion disponible; al derivar de un corpus interno propietario, los sesgos de ese corpus pueden propagarse al modelo.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero el autor no ofrece garantias ni soporte; el corpus de entrenamiento es privado y no verificable de forma independiente.
- Reproducibilidad limitada: los registros de entrenamiento se encuentran en un dataset privado (SZLHOLDINGS/wave-logs) y el corpus de entrenamiento no es publico, lo que impide replicar el ajuste.
- Madurez: el repositorio registra cero descargas y cero likes en el momento de la consulta, y no se han publicado artefactos cuantizados ni demos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SZLHOLDINGS/KHIPU-R2-estate-sft-v1
- Modelo base: https://huggingface.co/SZLHOLDINGS/KHIPU-R2
- Dataset de registros de entrenamiento (privado): https://huggingface.co/datasets/SZLHOLDINGS/wave-logs
- Dataset del contrapeso de abstencion: https://huggingface.co/datasets/SZLHOLDINGS/szl-quant-abstention-sft-v1
- Script de entrenamiento: https://github.com/szl-holdings/szl-forge/blob/main/training/train_wave.py
- Organizacion en Hugging Face: https://huggingface.co/SZLHOLDINGS
