# spkc83/retail-bank-servicing-agent-9b-peft-v12-honesty

## Resumen

El modelo `spkc83/retail-bank-servicing-agent-9b-peft-v12-honesty` es un adaptador LoRA (Low-Rank Adaptation) en formato BF16, desarrollado por el autor `spkc83` como parte de una línea de investigación sobre agentes de servicio al cliente bancario minorista. Se trata de un checkpoint de demostración sintética, no de un modelo listo para producción. El adaptador se entrena sobre el modelo base `spkc83/retail-bank-servicing-agent-9b`, que cuenta con aproximadamente 8.800 millones de parámetros, y está diseñado para generar respuestas conversacionales con soporte de tool-calling mediante un formato JSON etiquetado.

El problema que resuelve es el de adaptar un modelo de lenguaje general a un dominio específico (banca minorista) con un coste de entrenamiento reducido, utilizando técnicas PEFT (Parameter-Efficient Fine-Tuning). La relevancia actual radica en que demuestra un flujo completo de fine-tuning con LoRA para tareas de tool-calling y conversación multi-turno, algo cada vez más demandado en el desarrollo de asistentes virtuales empresariales. El adaptador se publica bajo licencia Apache 2.0 y está pensado exclusivamente para un POC (prueba de concepto) sintético, con advertencias explícitas sobre sus limitaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (el modelo base no especifica su arquitectura; probablemente transformer decoder, pero no confirmado) |
| Parametros totales | ~8.800 millones (modelo base) + adaptador LoRA (rank 32, alpha 64) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 tokens (máxima secuencia de entrenamiento) |
| Tipos de cuantizacion | BF16 (adaptador); el modelo base admite cuantizaciones adicionales no especificadas |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador LoRA únicamente; no hay pesos fusionados) |

## Arquitectura y entrenamiento

El adaptador se entrena sobre el modelo base `spkc83/retail-bank-servicing-agent-9b` (revisión `1d56824995aa1adecfe20f62ca42fb1c0c443817`), que tiene aproximadamente 8.800 millones de parámetros. No se proporciona información sobre la arquitectura interna del base (si es transformer estándar, MoE, etc.), pero el adaptador utiliza LoRA con rank 32 y alpha 64, lo que implica una modificación eficiente de las capas de atención y feed-forward. El entrenamiento se realiza con el dataset `spkc83/retail-bank-servicing-alignment-sft` (revisión `8494c94f9da4ada0a26de988781b88cc2ec58c53`), compuesto por 3.959 registros de entrenamiento y 447 de validación. Se aplica un enmascaramiento de objetivos que solo incluye los spans de tool-call y las respuestas finales del asistente, con una longitud máxima de secuencia de 2048 tokens y 2.000 pasos de optimizador. El modelo base utiliza un formato nativo de tool-call basado en JSON etiquetado, y el adaptador se entrena para alinearse con ese formato. No se menciona el uso de RLHF, DPO u otras técnicas de alineación adicionales.

## Capacidades

- Generación de texto conversacional orientado a servicio al cliente bancario minorista.
- Soporte de tool-calling mediante un formato JSON etiquetado, con un manifiesto de nueve herramientas sintéticas de banca (consultas de saldo, transferencias, etc.).
- Capacidad de razonamiento multi-turno limitada a la ventana de contexto de 2048 tokens.
- No se especifican capacidades multilingües, visión, audio ni otras modalidades.
- El adaptador no incluye pesos fusionados; requiere cargar el modelo base por separado y aplicar el adaptador con `PeftModel.from_pretrained`.

## Casos de uso

- Demostración de un POC de atención al cliente bancaria: el modelo puede gestionar conversaciones sintéticas con clientes, emitiendo llamadas a herramientas bancarias simuladas y generando respuestas fundamentadas en los resultados de esas herramientas.
- Evaluación de fine-tuning con LoRA para tool-calling: sirve como referencia para investigar cómo adaptar modelos de 8B parámetros a dominios específicos con datasets pequeños (menos de 4.000 registros).
- Desarrollo de agentes conversacionales para entornos controlados: puede integrarse en entornos de prueba donde se proporcionen los esquemas de herramientas y los resultados simulados, permitiendo validar la sintaxis de las llamadas y la coherencia de las respuestas.
- Investigación sobre alineación de modelos en dominios regulados: el enfoque de enmascaramiento de objetivos y el uso de datasets sintéticos pueden replicarse para otros sectores con requisitos similares.
- Pruebas de integración de tool-calling en pipelines de generación aumentada por recuperación (RAG) o agentes autónomos, siempre que se respeten las limitaciones del modelo.
- Formación de asistentes virtuales para banca minorista en entornos académicos o de investigación, sin uso en producción real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este adaptador o su modelo base.

## Requisitos de hardware

- El adaptador LoRA ocupa 0.4 GB en disco, pero el modelo base de 8.800 millones de parámetros requiere una GPU con suficiente VRAM.
- Para inferencia en BF16 (precisión completa del base), se estiman entre 17 y 18 GB de VRAM (8.800M × 2 bytes). Una GPU como la RTX 4090 (24 GB) o la A100 (40/80 GB) es adecuada.
- Con cuantización del modelo base a 4 bits (por ejemplo, mediante bitsandbytes), la VRAM necesaria se reduce a aproximadamente 5-6 GB, lo que permitiría ejecutarlo en GPUs de consumo como la RTX 3060 (12 GB) o RTX 4070.
- Opciones de despliegue: vLLM, llama.cpp, Ollama o TGI, pero es necesario cargar el adaptador con `PeftModel.from_pretrained` sobre el base en la revisión fijada. No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (adaptadores LoRA para banca minorista con tool-calling). Existen otras versiones del mismo autor (v9-scratch, v9-conversational-voice, etc.) pero no se ofrecen datos de rendimiento comparativo. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo está diseñado exclusivamente para el POC sintético vinculado; no debe usarse en producción con datos reales de clientes.
- No tiene acceso a sistemas bancarios reales ni a información financiera actualizada; no constituye asesoramiento financiero.
- Puede cometer errores en la elección de herramientas, en los argumentos de las llamadas o generar afirmaciones no respaldadas por los resultados de las herramientas.
- La ventana de contexto está limitada a 2048 tokens, lo que restringe la capacidad de manejar conversaciones muy largas o documentos extensos.
- No se especifican los idiomas soportados; el dataset de entrenamiento es sintético y probablemente en inglés, pero no está confirmado.
- El repositorio solo contiene el adaptador LoRA, no los pesos fusionados; es necesario cargar el modelo base por separado y en la revisión exacta indicada.
- La licencia Apache 2.0 permite uso comercial, pero las advertencias del autor desaconsejan su uso en entornos reales sin una evaluación exhaustiva de sintaxis, argumentos, ejecución backend, respuestas fundamentadas, comportamiento fuera de distribución (OOD) y multi-turno.

## Enlaces

- HuggingFace (modelo): https://huggingface.co/spkc83/retail-bank-servicing-agent-9b-peft-v12-honesty
- GitHub (código de desarrollo): https://github.com/spkc83/retail-bank-servicing
- Otras versiones del autor: https://huggingface.co/spkc83/retail-bank-servicing-agent-9b-peft-v9-scratch y https://huggingface.co/spkc83/retail-bank-servicing-agent-9b-peft-v9-conversational-voice
