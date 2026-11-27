# vkovtun/text-to-sql-qlora-final-2026-11-27_19.22.05-gemma-4-E2B-it-finetune-QLORA

## Resumen

Este repositorio contiene un ajuste fino mediante QLoRA del modelo base `google/gemma-4-E2B-it`, publicado por el usuario vkovtun. El nombre del artefacto indica que el objetivo del entrenamiento es la tarea text-to-SQL, es decir, la traduccion de preguntas en lenguaje natural a consultas SQL ejecutables. El modelo se ha entrenado con la libreria TRL (version 1.12.0) mediante SFT (supervised fine-tuning) y los pesos se distribuyen en formato safetensors con un tamano de repositorio de 0,6 GB.

El modelo base es `google/gemma-4-E2B-it`, una variante instruct de la familia Gemma 4 con etiqueta "E2B", que en la nomenclatura de Google corresponde a una configuracion eficiente de aproximadamente 2 mil millones de parametros. Al ser un ajuste LoRA, el repositorio contiene unicamente los adaptadores o los pesos fusionados resultantes del entrenamiento, no un modelo entrenado desde cero. La licencia no aparece declarada de forma explicita en la informacion disponible, mas alla de un campo `licence: license` en la model card que no aporta contenido util.

La relevancia de esta ficha es limitada: se trata de un artefacto experimental con cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados ni documentacion sobre el dataset de entrenamiento. Resulta util como referencia de un flujo de trabajo tipico de QLoRA sobre Gemma para text-to-SQL, pero no como modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de google/gemma-4-E2B-it); detalles no disponibles |
| Parametros totales | no disponible (modelo base etiquetado como E2B, aproximadamente 2B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (entrenamiento QLoRA; no se especifican formatos de inferencia) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica `licence: license` sin contenido) |
| Formato de pesos | safetensors |
| Libreria | transformers 5.16.1 |
| Framework de entrenamiento | TRL 1.12.0, PyTorch 2.14.0, Datasets 5.0.1, Tokenizers 0.23.2 |
| Metodo de ajuste | SFT con QLoRA |
| Modelo base | google/gemma-4-E2B-it |
| Tamano del repositorio | 0,6 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base `google/gemma-4-E2B-it`, un transformer decoder-only de la familia Gemma 4 en su variante eficiente. No se dispone de informacion detallada sobre el numero exacto de capas, dimensiones ocultas, mecanismo de atencion ni longitud de contexto maxima en la informacion proporcionada. El ajuste se realizo con QLoRA, tecnica que congela los pesos del modelo base cuantizados en 4 bits y entrena adaptadores de bajo rango, lo que explica el reducido tamano del repositorio (0,6 GB) frente a un checkpoint completo.

El entrenamiento utilizo SFT supervisado con TRL, con seguimiento en Weights & Biases (run `loi1qnii` del proyecto `text-to-sql-qlora-final`). No se especifica el numero de tokens de entrenamiento, la composicion del dataset, la existencia de RLHF/DPO posterior ni hiperparametros como rango LoRA, alpha, learning rate o numero de epocas. Tampoco se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.).

## Capacidades

- Generacion de consultas SQL a partir de preguntas en lenguaje natural, segun el objetivo declarado en el nombre del modelo (text-to-SQL).
- Generacion de texto general heredada del modelo base instruct.
- Conversacion multi-turno mediante el formato de chat (`[{"role": "user", "content": ...}]`) que aparece en el ejemplo de la model card.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Generacion de consultas SQL en asistentes de analitica: el modelo puede transformar preguntas de negocio en sentencias SELECT sobre un esquema dado, aprovechando el ajuste especifico text-to-SQL. Adecuado para prototipos internos de BI conversacional.
- Automatizacion de tareas de reporting: integrado en un pipeline que reciba una pregunta y un esquema de base de datos, devuelve la consulta para su ejecucion contra PostgreSQL, MySQL o SQLite.
- Educacion y formacion en SQL: uso como asistente que sugiere consultas a partir de enunciados en lenguaje natural, con revision humana posterior.
- Preprocesado en pipelines de datos: traduccion de peticiones de analistas a consultas que alimentan cuadros de mando o exportaciones periodicas.
- Base para experimentacion academica en text-to-SQL: al ser un ajuste QLoRA ligero (0,6 GB), sirve como punto de partida reproducible para comparar tecnicas de fine-tuning sobre Gemma.
- Prototipado rapido en entornos con GPU de consumo: el tamano reducido del adaptador y del modelo base (aproximadamente 2B) permite desplegarlo en tarjetas consumer para pruebas de concepto.
- Generacion de texto general en tareas auxiliares: al derivar de un modelo instruct, puede emplearse para resumir esquemas, explicar consultas SQL o redactar documentacion tecnica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa para un modelo de aproximadamente 2B de parametros, la inferencia en FP16 requeriria del orden de 4-5 GB de VRAM, y en cuantizacion 4-bit del orden de 1,5-2,5 GB, aunque estos valores no estan confirmados para este artefacto concreto.
- GPU recomendadas: no disponible. Por tamano del modelo base, cabria esperar viabilidad en GPUs consumer tipo RTX 3060, RTX 4060, RTX 4070 o superiores, pero no hay validacion publicada.
- Cabe en GPU consumer: probablemente si, dado el tamano del modelo base, si bien no hay confirmacion en la informacion disponible.
- Opciones de despliegue: transformers (confirmado por la model card); vLLM, llama.cpp, Ollama o TGI no estan documentados para este artefacto.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vkovtun/text-to-sql-qlora-final (este) | no disponible (base E2B, ~2B) | no disponible | QLoRA SFT para text-to-SQL | no disponible | Hugging Face, 0 descargas |
| google/gemma-4-E2B-it | ~2B (etiqueta E2B) | no disponible | Modelo instruct general | no disponible en esta ficha | Hugging Face (modelo base) |
| Alternativas text-to-SQL especializadas | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones detalladas de alternativas comparables en la informacion proporcionada, por lo que la comparativa cuantitativa no es posible.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de calidad en text-to-SQL (Spider, BIRD u otros), por lo que no debe asumirse correccion en consultas generadas.
- Dataset de entrenamiento no documentado: se desconoce el esquema, el dominio y el volumen de datos usados, lo que impide evaluar sesgos o cobertura.
- Riesgo de alucinacion: como todo modelo generativo, puede producir columnas, tablas o funciones SQL inexistentes; requiere validacion contra el esquema real y revision humana antes de ejecutar consultas.
- Licencia no declarada de forma efectiva: el campo `licence: license` no especifica terminos, y la licencia del modelo base Gemma 4 debe consultarse por separado; el uso comercial no esta garantizado por este repositorio.
- Idiomas no declarados: se desconoce si el ajuste conserva el multilingueismo del modelo base o si esta sesgado al ingles.
- Contexto maximo no documentado: limita la capacidad de manejar esquemas de base de datos extensos en el prompt.
- Artefacto experimental: cero descargas y cero likes, sin mantenimiento ni issues documentados; no apto para produccion sin evaluacion propia.
- Posible dependencia de versiones concretas: entrenado con Transformers 5.16.1 y PyTorch 2.14.0, versiones que pueden requerir entornos especificos para reproducir la inferencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vkovtun/text-to-sql-qlora-final-2026-11-27_19.22.05-gemma-4-E2B-it-finetune-QLORA
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Run de entrenamiento en Weights & Biases: https://wandb.ai/viktor-kovtun/text-to-sql-qlora-final/runs/loi1qnii
- Repositorio TRL: https://github.com/huggingface/trl
