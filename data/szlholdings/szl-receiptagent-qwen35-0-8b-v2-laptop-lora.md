# SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-v2-laptop-lora

## Resumen

szl-receiptagent-qwen35-0.8b-v2-laptop-lora es un artefacto de investigación publicado por SZLHOLDINGS en Hugging Face. Por su nombre, se trata de un adaptador LoRA (entrenado con QLoRA, según la nomenclatura "laptop") sobre una base Qwen de 0,8 mil millones de parámetros, orientado a tareas de agente de recibos ("receipt agent"). El repositorio tiene un tamaño de 0,1 GB, lo que es coherente con un adaptador LoRA y no con pesos completos de un modelo de 0,8B.

La model card actual, reescrita el 14 de noviembre de 2026, retira explícitamente todas las afirmaciones de la versión anterior (tabla de entrenamiento QLoRA, model-index de una "battery" de honestidad y badges de recibos) porque, según el autor, no existe evidencia verificable por modelo en la revisión observada. El autor declara que no se ha medido nada: ni evaluación, ni benchmark, ni contrato de entrenamiento, ni hiperparámetros, ni dataset, ni equivalencia de pesos, ni preparación para producción.

El único dato medido que se conserva es una "estate-battery" de seis sondas de gobernanza (refusal/abstention), ejecutada con pip fijado el 15 de noviembre de 2026 sobre una NVIDIA GeForce RTX 4090, con un resultado de 0 de 6 abstenciones o rechazos y 0,0 julios medidos. El propio autor aclara que esto es un recibo de comportamiento ante sondas, no un benchmark, y que no afirma calidad ni capacidades del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre sugiere base Qwen de 0,8B con adaptador LoRA; no confirmado en la model card) |
| Parametros totales | no disponible (el identificador indica 0,8B para el modelo base; el adaptador LoRA no declara rango ni numero de parametros entrenables) |
| Parametros activos | no aplica (no se declara arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (tag del repositorio); el contenido exacto del adaptador no se detalla |

## Arquitectura y entrenamiento

No hay información verificable sobre la arquitectura. El identificador del repositorio sugiere un adaptador LoRA sobre un modelo Qwen de 0,8B de parámetros, y el sufijo "laptop" apunta a un entrenamiento QLoRA pensado para ejecutarse en hardware de consumo, pero la model card actual elimina expresamente cualquier afirmación sobre contrato de entrenamiento, tabla de hiperparámetros o dataset. El autor indica que la tarjeta anterior, con esos datos, no era verificable por modelo y fue retirada; permanece en el historial de revisiones del repositorio.

Tampoco se declara ningún detalle sobre datos de entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO) ni sobre innovaciones técnicas como decodificación especulativa o atención lineal. La única evidencia registrada es la ejecución de una batería de seis sondas de gobernanza (estate-battery) con pip fijado sobre una RTX 4090, con resultado de 0 de 6 abstenciones o rechazos y 0,0 julios medidos; el autor subraya que se trata de un recibo de comportamiento, no de un benchmark.

## Capacidades

- No se declara ninguna capacidad verificada en la información disponible.
- El nombre del artefacto sugiere un uso previsto como agente para el procesamiento de recibos, pero la model card no lo confirma ni lo describe.
- No hay información sobre generación de texto, razonamiento, código, matemáticas o visión.
- No hay información sobre soporte de tool calling o function calling.
- No hay información sobre soporte de agentes o razonamiento multi-paso.
- No hay información sobre capacidades multilingües.
- No hay información sobre modos especiales (thinking mode, visión, audio).

## Casos de uso

- Procesamiento de recibos en un pipeline interno: por el nombre del artefacto, podría emplearse como adaptador para extraer campos de recibos, pero no hay documentación que describa el esquema de entrada/salida ni la calidad esperada; solo sería adecuado tras una evaluación propia.
- Prototipado en hardware de consumo: al tratarse de un adaptador sobre una base de 0,8B con indicación "laptop", podría desplegarse en una estación de trabajo con GPU de consumo para experimentación, sin garantías de rendimiento.
- Investigación sobre gobernanza y abstención: la única evidencia publicada es una batería de seis sondas de rechazo/abstención, por lo que el artefacto puede servir como caso de estudio de prácticas de documentación y verificación en registros privados.
- Integración en un registro privado de artefactos: el repositorio se declara "private registry artifact" del estate de SZLHOLDINGS, por lo que su uso realista es interno, no como componente de producción de terceros.
- Auditoría de reproducibilidad: el recibo de la batería incluye SHA-256 y revisión del Hub, lo que permite reproducir la ejecución de las sondas en una RTX 4090 con pip fijado.
- Fine-tuning posterior: al ser un adaptador LoRA con licencia Apache 2.0, podría reutilizarse como punto de partida para ajustes propios, siempre que se valide primero la base sobre la que se aplica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única medición registrada es la batería de gobernanza del estate: 0 de 6 sondas con abstención o rechazo, ejecutada el 15 de noviembre de 2026 en una NVIDIA GeForce RTX 4090 con 0,0 julios medidos. El autor aclara que no es un benchmark ni afirma calidad o capacidades.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Por el tamaño del repositorio (0,1 GB) y la base de 0,8B indicada en el nombre, un adaptador LoRA sobre un modelo de 0,8B cabría con holgura en GPUs de consumo, pero no hay especificaciones publicadas.
- GPU recomendadas: la única GPU mencionada en la evidencia es una NVIDIA GeForce RTX 4090, usada para la batería de sondas.
- Cabe en GPU de consumo: probablemente sí, dado el tamaño de la base (0,8B) y del adaptador, pero no está confirmado por el autor.
- Opciones de despliegue: no disponible (no se mencionan vLLM, llama.cpp, Ollama ni TGI).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables ni datos de rendimiento que permitan establecer una comparación con alternativas de la misma categoría.

## Limitaciones y advertencias

- Ausencia total de evidencia verificable: el autor retira explícitamente las afirmaciones de la tarjeta anterior y declara que no hay medición, benchmark, contrato de entrenamiento ni dataset verificables.
- La única medición publicada (0 de 6 abstenciones en sondas de gobernanza) no evalúa calidad, capacidades ni seguridad en uso real.
- El resultado de 0 de 6 abstenciones o rechazos en sondas de gobernanza puede indicar que el modelo no se abstiene ante entradas problemáticas, lo que exige cautela en despliegues con contenido sensible.
- No se declaran idiomas soportados, lo que impide garantizar un comportamiento correcto en castellano u otros idiomas.
- No se declara la longitud de contexto, lo que impide planificar conversaciones multi-turno o documentos largos.
- El artefacto se etiqueta como "research-artifact" y "experimental", y se describe como parte de un registro privado, no como un modelo listo para producción.
- La licencia Apache 2.0 permite uso comercial, pero la falta de documentación sobre la base y los datos de entrenamiento traslada al usuario toda la responsabilidad de validación legal y técnica.
- Riesgo de alucinación y sesgos: no evaluado ni documentado.
- El nombre sugiere una base Qwen de 0,8B, pero no se confirma la versión ni la procedencia exacta de los pesos base, lo que complica la trazabilidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-v2-laptop-lora
- Recibo de la batería de gobernanza: https://huggingface.co/datasets/SZLHOLDINGS/frontier-54-runs/blob/main/receipts/estate-battery-szl_receiptagent_qwen35_0_8b_v2_laptop_lora.json
- Dataset de recibos: https://huggingface.co/datasets/SZLHOLDINGS/frontier-54-runs
