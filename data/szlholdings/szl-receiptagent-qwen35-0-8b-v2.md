# SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-v2

## Resumen

SZL ReceiptAgent v2 es un adaptador PEFT (LoRA) sobre el modelo base Qwen/Qwen3.5-0.8B, desarrollado por SZL Holdings. El modelo está especializado en la generación de borradores estructurados en formato JSON para el dominio de "receipts" (recibos o comprobantes), con un enfoque declarado en "governed AI" y la doctrina interna v11 de la organización. No se trata de un modelo de propósito general, sino de un adaptador de tarea específica orientado a contratos de salida estructurados y a la abstención controlada ante entradas adversarias.

El adaptador se distribuye como repositorio PEFT con pesos en safetensors y un tamaño de repositorio de 3,5 GB, lo que incluye los pesos del adaptador junto con artefactos de evaluación, recibos firmados y gráficos generados. La model card está fuertemente orientada a la trazabilidad ("receipts-first"), con recibos firmados de entrenamiento, evaluación y publicación, así como resultados de benchmarks internos del autor.

La relevancia de este modelo radica en su enfoque en la validación de contratos JSON y en la abstención ante entradas adversarias, dos capacidades críticas en pipelines de agentes que necesitan salidas parseables y comportamiento predecible. Sin embargo, la información pública es limitada: no se detallan los datos de entrenamiento, la composición del dataset ni resultados en benchmarks estándar de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT (LoRA) sobre transformer Qwen3.5-0.8B |
| Parametros totales | no disponible (modelo base: 0,8B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PEFT adapter) |

## Arquitectura y entrenamiento

El modelo es un adaptador PEFT (probablemente LoRA, dado el tag `peft` y la relación `adapter` con el modelo base) sobre Qwen/Qwen3.5-0.8B, un transformer de 0,8 mil millones de parámetros. El adaptador se entrena para la tarea de "Proposal-only structured drafting" (borrador estructurado solo de propuesta), orientada a generar salidas JSON que cumplan un contrato predefinido y a rechazar entradas adversarias con prefijos de abstención.

La model card indica que el entrenamiento está "completamente entrenado" y verificado por un recibo de entrenamiento firmado, con una pérdida final de entrenamiento de 0,914294287184. No se especifica el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. El adaptador se apoya en la doctrina interna v11 de SZL Holdings, que no está documentada públicamente en la información disponible.

## Capacidades

- Generación de borradores estructurados en JSON que cumplen un contrato predefinido (5/5 en la puerta de contrato JSON según el autor).
- Abstención controlada ante entradas adversarias mediante prefijos de rechazo (6/6 en la puerta adversarial según el autor).
- Generación de texto conversacional (pipeline `text-generation`).
- Enfoque en "governed AI": trazabilidad mediante recibos firmados de entrenamiento, evaluación y publicación.
- No se dispone de información sobre soporte de tool calling, function calling, agentes multi-paso, capacidades multilingües, visión, audio o modo de razonamiento explícito.

## Casos de uso

- Generación de borradores de recibos o comprobantes estructurados: el adaptador produce salidas JSON que cumplen un contrato predefinido, lo que permite integrarlo en pipelines de extracción y validación de datos de recibos sin necesidad de post-procesado manual.
- Validación de contratos JSON en pipelines de agentes: al estar entrenado para respetar un contrato de salida, puede emplearse como paso de generación de propuestas que luego se validan contra un esquema, reduciendo errores de parseo.
- Filtrado y abstención ante entradas adversarias: su entrenamiento en prefijos de rechazo permite utilizarlo como primera línea de defensa en sistemas que reciben entradas no confiables, devolviendo una abstención en lugar de una salida potencialmente dañina.
- Prototipado rápido de agentes de dominio específico: al ser un adaptador de 0,8B, puede desplegarse en entornos con recursos limitados para experimentar con flujos de propuesta y validación antes de escalar a modelos mayores.
- Automatización de borradores en back-office financiero o administrativo: generación de propuestas de recibos o documentos estructurados que luego revisa un humano, aprovechando la salida JSON para alimentar sistemas de gestión documental.
- Evaluación de técnicas de gobernanza de IA: el modelo sirve como caso de estudio de un enfoque "receipts-first" con recibos firmados, útil para investigadores interesados en trazabilidad y auditoría de modelos pequeños especializados.

## Benchmarks y rendimiento

Los únicos datos disponibles son los declarados por el autor en el model-index, correspondientes a puertas de evaluación internas sobre un split de evaluación propio y un split adversarial. No se han publicado resultados en benchmarks estándar de la comunidad (MMLU, HumanEval, GSM8K, etc.).

| Benchmark | Metrica | Resultado | Verificado |
|---|---|---|---|
| ReceiptAgent v2 owner-run held-out JSON contract gate (eval) | JSON contract-valid drafts | 5/5 | No (recibo firmado por el propietario) |
| ReceiptAgent v2 owner-run adversarial refusal-prefix gate (adversarial) | Adversarial refusal prefixes | 6/6 | No (recibo firmado por el propietario) |
| mass-battery-szl_receiptagent_0_8b_v2_trained | Puntuación mass battery | 4/6 | Medido (según model card) |
| mass-battery-receiptagent_v2_trained | Puntuación mass battery | 3/6 | Medido (según model card) |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un modelo base de 0,8B en precisión FP16 requiere aproximadamente 1,6 GB solo para los pesos, más el adaptador y el overhead de inferencia; en cuantización de 4 bits podría caber en menos de 1 GB, aunque no se confirman cuantizaciones soportadas.
- GPU recomendadas: no disponible. Por tamaño, cualquier GPU consumer con al menos 4-6 GB de VRAM debería poder ejecutar el modelo base en FP16, pero no hay datos oficiales.
- ¿Cabe en GPU consumer? Probablemente sí, dado el tamaño del modelo base (0,8B), pero no se dispone de confirmación oficial ni de requisitos del adaptador.
- Opciones de despliegue: no disponible. Al ser un adaptador PEFT, requeriría cargarse junto con el modelo base mediante librerías como PEFT/Transformers; no se documentan opciones como vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa con alternativas de la misma categoría, ya que no se detallan parámetros del adaptador, contexto ni rendimiento en benchmarks estándar. Se indica "no disponible".

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| SZL ReceiptAgent v2 (adaptador sobre Qwen3.5-0.8B) | 0,8B (base) | no disponible | Apache 2.0 | Adaptador PEFT especializado en contratos JSON y abstención |
| Alternativas comparables | no disponible | no disponible | no disponible | No se identifican alternativas equivalentes en la información proporcionada |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al ser un adaptador entrenado sobre datos internos de SZL Holdings, puede heredar sesgos del dataset de entrenamiento, que no es público.
- Riesgo de alucinación: no evaluado en la información disponible. El enfoque en contratos JSON y abstención reduce el riesgo de salidas no parseables, pero no garantiza la veracidad del contenido.
- Limitaciones de contexto o idioma: no se especifica la longitud de contexto ni los idiomas soportados; la model card no documenta capacidades multilingües.
- Restricciones de licencia: licencia Apache 2.0, que permite uso comercial, pero el modelo base Qwen3.5-0.8B tiene su propia licencia que debe verificarse por separado.
- Caveats para producción: los resultados de benchmarks son declarados por el autor y no están verificados de forma independiente; las puertas de evaluación son internas y de tamaño muy reducido (5 y 6 ejemplos), por lo que su significación estadística es limitada. La model card contiene artefactos promocionales (gráficos, leaderboards) que no sustituyen una evaluación técnica independiente. No se documentan los datos de entrenamiento ni el proceso de alineación.

## Enlaces

- [Hugging Face: SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-v2](https://huggingface.co/SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-v2)
- [Modelo base: Qwen/Qwen3.5-0.8B](https://huggingface.co/Qwen/Qwen3.5-0.8B)
- [Recibo de evaluación firmado](https://huggingface.co/SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-v2/blob/7a0d9efdebe92ea3b5b26b97cc722c6b5afde621/receipts/eval_receipt.signed.json)
- [Recibo de entrenamiento firmado](https://huggingface.co/SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-v2/blob/main/receipts/training_receipt.signed.json)
- [Recibo de publicación firmado](https://huggingface.co/SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-v2/blob/main/receipts/publication_receipt.signed.json)
- [Informe de evaluación](https://huggingface.co/SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-v2/blob/main/reports/eval-report.json)
- [Organización SZLHOLDINGS en Hugging Face](https://huggingface.co/SZLHOLDINGS)
- [Repositorio GitHub de szl-holdings](https://github.com/szl-holdings)
