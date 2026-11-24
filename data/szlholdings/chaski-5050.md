# SZLHOLDINGS/chaski-5050

## Resumen

chaski-5050 es un artefacto de ajuste fino (fine-tuning) publicado por SZLHOLDINGS sobre el modelo base Qwen/Qwen3.5-0.8B. Se distribuye como adaptador PEFT en formato safetensors, con un total de 752.393.024 parámetros contabilizados en el repositorio y un peso de 6,1 GB. La arquitectura subyacente es la del modelo base, etiquetada en el repositorio como qwen3_5_text, orientada a generación de texto.

El modelo se presenta dentro de lo que el autor denomina "estate" de IA gobernada, un marco en el que cada artefacto se acompaña de recibos (receipts) de auditoría con resultados verificables. La model card es explícita en este punto: no se afirma ningún resultado de benchmark que no haya sido medido en una auditoría fechada, y todo lo que no está respaldado por un recibo se marca como UNKNOWN.

El estado de validación es, sin embargo, incompleto. La auditoría del 22 de noviembre de 2026 indica que las rutas estándar de recibos (eval/frontier-v1/DONE.json y final/train_receipt.json) no constituyen una cadena de recibos estricta y completa, con estado UNKNOWN_NO_EVAL_RECEIPT. En consecuencia, no se hacen afirmaciones de calidad sobre este artefacto. Para un desarrollador, esto significa que chaski-5050 debe tratarse como un experimento reproducible y auditable, no como un modelo listo para producción sin validación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer del modelo base Qwen3.5-0.8B (tag qwen3_5_text); adaptador PEFT |
| Parametros totales | 752.393.024 (contabilizados en safetensors del repo) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT, libreria peft) |

## Arquitectura y entrenamiento

La arquitectura corresponde al modelo base Qwen/Qwen3.5-0.8B, un transformer de aproximadamente 0,8 mil millones de parámetros orientado a generación de texto. chaski-5050 se publica como adaptador PEFT, lo que implica que el entrenamiento se realizó mediante ajuste parametrizado eficiente sobre los pesos del modelo base, sin republicar el checkpoint completo. El repositorio declara la librería peft como dependencia de carga y usa safetensors como formato de pesos.

No hay información disponible sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron técnicas de RLHF, DPO o supervisión adicional. La model card indica que cualquier afirmación de entrenamiento o evaluación reside en los ficheros de recibos del estate, y que lo no registrado allí se considera UNKNOWN. La auditoría del 22 de noviembre de 2026 confirma que no existe una cadena de recibos estricta con evaluación completada, por lo que no se puede verificar la innovación técnica ni la calidad del ajuste a partir de la información publicada.

## Capacidades

- Generación de texto: hereda la capacidad del modelo base Qwen3.5-0.8B para producir texto en inglés.
- Ajuste específico: al ser un adaptador PEFT sobre el modelo base, su comportamiento final depende del dataset de ajuste, que no está documentado en la información disponible.
- Idiomas: la model card declara únicamente inglés (en) como idioma soportado.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-step: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles; solo se declara inglés.
- Capacidades especiales (vision, audio, thinking mode): no disponibles en la información proporcionada.

## Casos de uso

- Evaluación de adaptadores PEFT sobre Qwen3.5-0.8B: el artefacto permite reproducir y auditar el proceso de ajuste sobre un modelo base pequeño, útil para investigadores que estudian la eficacia de técnicas PEFT en modelos de menos de 1.000 millones de parámetros.
- Prototipado de pipelines de generación de texto en inglés: al ser un modelo de tamaño reducido, puede integrarse en entornos de desarrollo con recursos limitados para validar flujos de generación antes de escalar a modelos mayores.
- Investigación sobre gobernanza y trazabilidad de modelos: el sistema de recibos del estate SZLHOLDINGS convierte este artefacto en un caso de estudio sobre cómo documentar (o no) la procedencia y las métricas de un modelo.
- Experimentos de ajuste fino reproducible: dado que el modelo base y el adaptador están publicados con licencia apache-2.0, se puede reentrenar o modificar el adaptador para comparar configuraciones de entrenamiento.
- Docencia y formación técnica: un modelo de 0,8 mil millones de parámetros con adaptador PEFT es adecuado para demostrar en clase el ciclo completo de ajuste, publicación y auditoría de un modelo.
- Base para tareas de generación de texto acotadas en inglés: en ausencia de benchmarks verificados, su uso en producción requeriría una evaluación propia previa sobre el dominio objetivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explícitamente que no se afirma ningún número de benchmark más allá de lo medido en una auditoría fechada, y la auditoría del 22 de noviembre de 2026 registra estado UNKNOWN_NO_EVAL_RECEIPT, sin cadena de recibos de evaluación completa.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa basada en el tamaño del modelo base (0,8 mil millones de parámetros), la inferencia en fp16 requeriría del orden de 1,6 GB solo para pesos, más overhead de activaciones y contexto; en cuantización de 4 bits podría reducirse por debajo de 1 GB, aunque no se confirman cuantizaciones publicadas para este artefacto.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, el modelo base cabría en GPUs consumer como RTX 3060, RTX 4060 o RTX 4090, pero esta afirmación no está respaldada por datos del autor.
- Cabe en GPU consumer: probablemente sí por el tamaño del modelo base, aunque no confirmado por el autor.
- Opciones de despliegue: la librería declarada es peft; el despliegue requeriría cargar primero el modelo base Qwen/Qwen3.5-0.8B y aplicar el adaptador. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado de validacion |
|---|---|---|---|---|
| chaski-5050 | 752.393.024 (adaptador sobre Qwen3.5-0.8B) | no disponible | apache-2.0 | UNKNOWN_NO_EVAL_RECEIPT |
| Qwen/Qwen3.5-0.8B (base) | ~0,8 mil millones | no disponible | no disponible en la informacion | modelo base de referencia |
| Adaptadores PEFT comparables | no disponible | no disponible | no disponible | no disponible |

La comparativa con alternativas de la misma categoría no está disponible en la información proporcionada. El único punto de comparación documentado es el modelo base Qwen/Qwen3.5-0.8B, del que chaski-5050 deriva mediante ajuste PEFT.

## Limitaciones y advertencias

- Ausencia de cadena de recibos de evaluación: la auditoría del 22 de noviembre de 2026 marca el artefacto como UNKNOWN_NO_EVAL_RECEIPT, por lo que no hay garantía verificada de calidad.
- Sin benchmarks publicados: no se pueden comparar sus resultados con otros modelos de forma objetiva.
- Idioma limitado: solo se declara inglés, lo que excluye su uso directo en castellano u otros idiomas.
- Sesgos: no documentados en la información disponible; al heredar el modelo base, arrastra los sesgos de este, que tampoco están descritos aquí.
- Riesgo de alucinación: no cuantificado; al ser un modelo de 0,8 mil millones de parámetros, la capacidad de razonamiento y factualidad es limitada en comparación con modelos mayores.
- Restricciones de licencia: apache-2.0 permite uso comercial, pero debe verificarse la licencia del modelo base Qwen/Qwen3.5-0.8B, no indicada en la información proporcionada.
- Dependencia del modelo base: el adaptador no es autónomo; requiere cargar Qwen3.5-0.8B, lo que añade complejidad al despliegue.
- Documentación incompleta: no se detallan datos de entrenamiento, hiperparámetros ni configuración del ajuste, lo que dificulta la reproducibilidad.
- Para producción: se recomienda una evaluación propia sobre el dominio objetivo antes de cualquier despliegue.

## Enlaces

- [Hugging Face: SZLHOLDINGS/chaski-5050](https://huggingface.co/SZLHOLDINGS/chaski-5050)
- [Organización SZLHOLDINGS en Hugging Face](https://huggingface.co/SZLHOLDINGS)
- [Modelo base Qwen/Qwen3.5-0.8B](https://huggingface.co/Qwen/Qwen3.5-0.8B)
- [Organización szl-holdings en GitHub](https://github.com/szl-holdings)
- [Repositorio estate-cards](https://github.com/szl-holdings/estate-cards)
