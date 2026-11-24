# sudiptoHaldar/qwen3-4b-finqa-program-merged

## Resumen

`sudiptoHaldar/qwen3-4b-finqa-program-merged` es un ajuste fino supervisado del modelo base Qwen3-4B de Alibaba, especializado en la tarea de *program synthesis* aplicada a informes financieros. Dado el texto de un informe financiero corporativo, una tabla del mismo informe y una pregunta, el modelo genera un programa corto que calcula la respuesta y, a continuación, el resultado. El modelo no es el calculador final: el programa generado debe ser ejecutado por un motor externo (executor) para obtener la respuesta verificable.

El modelo lo desarrolla el autor independiente sudiptoHaldar y se distribuye como un *merge* de los pesos base con el adaptador LoRA `sudiptoHaldar/qwen3-4b-finqa-program-qlora`. Al estar fusionado, se carga directamente con `transformers` sin necesidad de `peft`. Cuenta con 4.022.468.096 parámetros (aproximadamente 4B), se distribuye bajo licencia Apache 2.0 y está entrenado exclusivamente en inglés sobre el conjunto de datos FinQA.

Su relevancia radica en el enfoque: en lugar de pedir al modelo que responda directamente con un número (propenso a alucinaciones aritméticas), se le entrena para emitir código ejecutable que un intérprete de Python valida. El autor reporta una precisión de ejecución del 72,34 % en 4 bits y del 71,54 % a precisión completa sobre su propia partición de desarrollo (499 preguntas de 15 empresas), si bien advierte que estas cifras no son comparables con el split oficial de FinQA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), ajuste fino con QLoRA fusionado |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen3-4B) |
| Tipos de cuantizacion | 4 bits NF4 con doble cuantizacion (bitsandbytes); bfloat16 a precision completa |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B, un transformer decoder-only de aproximadamente 4.000 millones de parámetros. Sobre esa base se aplicó un ajuste fino QLoRA (cuantización de 4 bits durante el entrenamiento) cuyo adaptador resultante se fusionó posteriormente en los pesos del modelo base, de modo que el artefacto final es un checkpoint estándar de `transformers` sin dependencia de `peft`.

El entrenamiento se realizó sobre el conjunto de datos FinQA (`bevaya/FinQA`), que empareja informes financieros con preguntas y programas de respuesta. El autor indica que las preguntas de entrenamiento se extrajeron agrupando los ficheros oficiales de entrenamiento, validación y test de FinQA y repartiéndolos de nuevo por empresa, por lo que la partición de evaluación es propia y no la oficial. La tarea de entrenamiento es la síntesis de programas: el modelo aprende a emitir una línea `PROGRAM` con código ejecutable y una línea `ANSWER` con el resultado. El prompt de sistema y el formato de entrada (contexto, tabla en Markdown y pregunta) se fijan literalmente en `prompt.json` y el modelo no vio otra formulación durante el ajuste. La decodificación configurada es greedy, con un máximo de 192 tokens nuevos y el modo de razonamiento (`thinking`) desactivado.

## Capacidades

- Generación de programas cortos en Python a partir de contexto textual y tablas financieras.
- Respuesta a preguntas sobre informes financieros mediante ejecución de código verificable.
- Procesamiento de tablas en formato Markdown incluidas en el prompt.
- Formato de salida estructurado en dos líneas (`PROGRAM` y `ANSWER`).
- Modo conversacional con plantilla de chat de Qwen3 (system + user).
- Capacidad de razonamiento desactivable mediante `enable_thinking=False`.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingües: limitadas al inglés.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Extracción de métricas financieras automatizada: el modelo recibe el texto y la tabla de un informe trimestral y genera el programa que calcula márgenes, variaciones interanuales o ratios, que un executor valida antes de publicar la cifra.
- Auditoría de respuestas numéricas: al producir código ejecutable en lugar de un número directo, permite trazar y verificar cada cálculo en pipelines de compliance financiero.
- Enriquecimiento de bases de datos de análisis fundamental: integrado en un ETL que procesa informes 10-K y 10-Q y rellena campos numéricos con resultados computados y auditables.
- Asistente interno para analistas: interfaz conversacional donde el analista formula preguntas sobre un informe cargado y recibe el programa y el resultado para su revisión.
- Generación de tests de regresión financiera: los programas generados pueden reutilizarse como casos de prueba en sistemas de reporting.
- Investigación en neuro-símbolo: sirve como banco de pruebas para estudiar la síntesis de programas sobre dominios tabulares y textuales combinados.
- Prototipado de agentes de análisis documental: el par programa-resultado puede alimentar un agente que valide y encadene cálculos sobre varios informes.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente) sobre su propia partición de desarrollo de FinQA (499 preguntas de 15 empresas, split no oficial):

| Metrica | Valor |
|---|---|
| Precision de ejecucion, cargado en 4 bits | 72,34 |
| Precision de ejecucion, a precision completa | 71,54 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor advierte explícitamente que no debe reportarse la puntuación de este modelo sobre el split oficial de test de FinQA, ya que las preguntas de entrenamiento se extrajeron de todos los ficheros oficiales y una evaluación sobre validación o test oficial estaría inflada.

## Requisitos de hardware

- VRAM estimada: aproximadamente 6 GB en cuantización 4 bits NF4; aproximadamente 10 GB a precisión completa bfloat16 (8 GB de pesos en GPU según el autor).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para 4 bits; se requiere CUDA según el código de ejemplo del autor.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090 en 4 bits; en precisión completa requiere al menos 10-12 GB.
- Opciones de despliegue: `transformers` con bitsandbytes; el repositorio incluye `generation_config.json` con decodificación greedy. Compatible con text-generation-inference y endpoints según los tags. No se documenta soporte GGUF/llama.cpp ni Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-4b-finqa-program-merged | 4,02B | no disponible | Síntesis de programas sobre FinQA (LoRA fusionado) | Apache 2.0 | Hugging Face |
| Qwen/Qwen3-4B (base) | ~4B | no disponible | Modelo generalista multilingüe | Apache 2.0 | Hugging Face |
| Adaptador qwen3-4b-finqa-program-qlora | ~4B (base + LoRA) | no disponible | Mismo ajuste, sin fusionar (requiere `peft`) | Apache 2.0 | Hugging Face |

No se dispone de datos de benchmarks comparables con otros modelos especializados en FinQA en la información proporcionada.

## Limitaciones y advertencias

- El modelo no calcula: genera un programa que debe ejecutarse con un executor externo; la línea `ANSWER` no debe considerarse fiable por sí misma.
- La partición de evaluación es propia y no oficial; las puntuaciones sobre el split oficial de FinQA estarían infladas por fuga de datos entre entrenamiento y test.
- El modelo está entrenado exclusivamente en inglés; no se garantiza calidad en otros idiomas.
- El prompt de sistema y el formato de entrada están fijados literalmente; variaciones en la formulación pueden degradar el rendimiento.
- Riesgo de alucinación en la línea de respuesta y en programas que referencien columnas o celdas inexistentes.
- Solo se ha evaluado en el dominio de informes financieros; el rendimiento fuera de ese dominio no está caracterizado.
- Licencia Apache 2.0, pero incorpora pesos de Qwen3-4B; deben respetarse `LICENSE` y `NOTICE` del repositorio.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, sin validación independiente de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sudiptoHaldar/qwen3-4b-finqa-program-merged
- Adaptador LoRA original: https://huggingface.co/sudiptoHaldar/qwen3-4b-finqa-program-qlora
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Código, executor y comparativa completa: https://github.com/SudiptoHaldar/qlora_finetuning_public
- Dataset FinQA: https://huggingface.co/datasets/bevaya/FinQA
- Paper de referencia (arxiv:2505.09388): https://arxiv.org/abs/2505.09388
