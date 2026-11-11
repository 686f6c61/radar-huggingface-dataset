# wilfredeveloper/day31-lfm2.5-1.2b-v5-GGUF

## Resumen

day31-lfm2.5-1.2b-v5 es un ajuste fino mediante LoRA del modelo LiquidAI/LFM2.5-1.2B-Instruct, desarrollado por el usuario wilfredeveloper para la aplicación de presupuestos personales day31, orientada a la gestión de dinero móvil keniano (M-Pesa, Fuliza, paybills y transferencias bancarias). El modelo resuelve un problema muy concreto: responder preguntas de finanzas personales seleccionando y rellenando argumentos de herramientas de la aplicación, sin realizar aritmética por sí mismo. Con 1.170.340.608 parámetros totales, está pensado para ejecutarse en un teléfono móvil (0,73 GB en cuantización de 4 bits).

La relevancia de esta ficha es doble. Por un lado, documenta un caso de uso de tool calling en el borde (on-device) con un modelo de 1,2B parámetros, un escenario cada vez más habitual en aplicaciones móviles con requisitos de privacidad. Por otro, sirve como ejemplo de especialización estrecha: el modelo pasa de un 10,5% de acierto en la tarea VALUE del Day31-Bench con el modelo base a un 84,7% tras el ajuste fino, a costa de quedar fuertemente acoplado a los esquemas de herramientas de la aplicación.

El repositorio contiene únicamente el modelo fusionado en GGUF Q4_K_M y el adaptador LoRA en PEFT, junto con el tokenizador y la plantilla de chat empleados en el entrenamiento. El modelo está entrenado exclusivamente en inglés y se distribuye bajo la LFM Open License v1.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base LFM2.5-1.2B-Instruct; detalles de atención y convolución no disponibles) |
| Parametros totales | 1.170.340.608 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | 20.480 tokens en entrenamiento; el ejemplo de despliegue usa `-c 16384` |
| Tipos de cuantizacion | Q4_K_M (GGUF); adaptador LoRA en bf16 |
| Idiomas soportados | Inglés (en) |
| Licencia | LFM Open License v1.0 (license: other, license_name: lfm1.0) |
| Formato de pesos | GGUF (Q4_K_M) y safetensors (adaptador LoRA PEFT) |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM2.5-1.2B-Instruct, un transformer de 1,2B parámetros. Sobre esa base se aplicó un ajuste fino con LoRA de rango 16, α = 32 y dropout 0,05, aplicado a todas las proyecciones de atención, convolución y MLP. El entrenamiento usó bf16, AdamW con learning rate de 2×10⁻⁴ y decaimiento coseno, una época, batch efectivo de 16 y longitud máxima de 20.480 tokens. La pérdida se calculó únicamente sobre los turnos del asistente (llamadas a herramientas y respuestas), descartando las notas de razonamiento del modelo profesor, de modo que el modelo final actúa sin razonamiento visible.

Los datos de entrenamiento consisten en 2.983 conversaciones multi-turno sintéticas (150 reservadas para desarrollo), construidas sobre los libros de cuentas de M-Pesa y banco de cinco personas generadas. Cada resultado de herramienta proviene de ejecutar las herramientas reales de la aplicación, y las respuestas fueron redactadas por un modelo profesor de mayor tamaño. No se emplearon datos financieros de personas reales y las 45 personas del benchmark son distintas de las cinco del entrenamiento. Tras el ajuste, el LoRA se fusionó en la base bf16, se convirtió a GGUF y se cuantizó a Q4_K_M.

## Capacidades

- Llamada a herramientas (tool calling / function calling) en el formato pythonico de LFM2.5, por ejemplo `[aggregate(metric="sum", filter={...})]`.
- Selección y rellenado de argumentos para herramientas de consulta financiera: agregaciones, filtros por categoría, periodo y clase de gasto.
- Conversación multi-turno con contexto de hasta 20.480 tokens en entrenamiento.
- Explicación breve del resultado devuelto por la herramienta, sin cálculo aritmético propio.
- Ejecución en dispositivo (on-device) gracias al tamaño reducido del GGUF de 4 bits.
- No dispone de modo de razonamiento visible, visión, audio ni capacidades multimodales según la información disponible.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Asistente de finanzas personales en una app móvil: el modelo recibe la pregunta del usuario junto con los esquemas de herramientas de la aplicación y emite la llamada adecuada (por ejemplo, suma de gastos de transporte del último mes); la app ejecuta la herramienta y el modelo redacta una respuesta breve. Es adecuado por su tamaño de 0,73 GB en 4 bits, que permite ejecución local en el teléfono.
- Consulta de movimientos de dinero móvil: preguntas sobre saldos, paybills, Fuliza o transferencias bancarias se traducen en filtros y agregaciones sobre el libro de cuentas del usuario, manteniendo los datos financieros en el dispositivo.
- Clasificación y filtrado por categorías de gasto: el modelo rellena filtros por categoría y periodo (por ejemplo, `period: lastMonth`), lo que permite construir informes de gasto sin enviar datos a un servidor.
- Integración en pipelines de agentes con herramientas acotadas: dado un conjunto fijo de esquemas, el modelo actúa como planificador de un solo paso que decide qué herramienta invocar y con qué argumentos.
- Prototipado de asistentes de dominio vertical: sirve como referencia para equipos que quieran especializar un modelo de 1,2B en un conjunto cerrado de herramientas mediante LoRA y cuantización a GGUF.
- Evaluación comparativa de tool calling en el borde: el arnés del Day31-Bench y el adaptador permiten reproducir la comparación entre el modelo base y el ajustado en un servidor llama.cpp local.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre Day31-Bench. VALUE es la proporción de preguntas en las que una llamada a herramienta del modelo devolvió la respuesta correcta; los corchetes son intervalos de Wilson al 95%.

| Modelo | VALUE, primeros 325 casos | VALUE, 930 casos |
|---|---|---|
| LFM2.5-1.2B-Instruct (stock) | 10,5% [7,6–14,3] | — |
| day31-lfm2.5-1.2b-v5 (este modelo) | 81,5% [77,0–85,4] | 84,7% [82,3–86,9] |

Áreas más débiles según la model card: consejo abierto (43%), pivotes bidimensionales (26%) y búsqueda de personas por nombre (59%). No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generales en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,73 GB para el archivo Q4_K_M, más overhead de contexto; con contexto de 16.384 tokens el consumo de memoria KV adicional no está especificado en la información disponible.
- GPU recomendadas: no disponible; el modelo está orientado a ejecución en CPU y dispositivos móviles mediante llama.cpp u Ollama.
- Cabe en GPU de consumo: sí, por tamaño (menos de 1 GB de pesos), aunque no se detallan modelos concretos de GPU en la información disponible.
- Opciones de despliegue: llama.cpp (`llama-server`), Ollama y runtimes móviles compatibles con GGUF; el adaptador LoRA está en formato PEFT para su uso con la base bf16.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| day31-lfm2.5-1.2b-v5 | 1,17B | 20.480 (entrenamiento) | Tool calling financiero especializado (GGUF Q4_K_M) | LFM Open License v1.0 | Hugging Face (GGUF + adaptador LoRA) |
| LiquidAI/LFM2.5-1.2B-Instruct | 1,2B (aprox.) | no disponible | Modelo instructivo generalista | LFM Open License v1.0 | Hugging Face |
| Alternativas de 1-2B para tool calling | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparables con otras alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Solo inglés: las preguntas sintéticas de entrenamiento no cubren todas las formas de expresarse de usuarios reales; las expresiones de fecha relativa no vistas ("the weekend before", "past 12 weeks") son un punto débil conocido.
- Acoplado a las herramientas de day31: con otros esquemas de herramientas requiere reentrenamiento o un prompting cuidadoso. Ante una herramienta no vista, tiende a recurrir a una herramienta conocida.
- No es asesoramiento financiero: reporta cifras de los registros del usuario; las respuestas de tipo consejo son su área más débil (43% en el benchmark).
- Riesgo de alucinación en la selección de herramienta o argumentos: el diseño mitiga el error aritmético delegando el cálculo en las herramientas, pero no elimina la posibilidad de invocar la herramienta equivocada o con filtros incorrectos.
- Sesgos: no se documentan sesgos específicos en la información disponible; el entrenamiento con datos sintéticos de cinco personas generadas puede no representar la diversidad de patrones financieros reales.
- Licencia: uso comercial sujeto al umbral de ingresos de la LFM Open License v1.0; es un derivado de LFM2.5-1.2B-Instruct y las modificaciones (LoRA, fusión y cuantización a 4 bits) se describen en la model card.
- Para producción: requiere el system prompt y los esquemas de herramientas de la aplicación (`data/ai_spec.json` del repositorio del benchmark) renderizados con la plantilla de chat de LFM2.5.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wilfredeveloper/day31-lfm2.5-1.2b-v5-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct
- Dataset de evaluación Day31-Bench: https://huggingface.co/datasets/wilfredeveloper/day31-bench
- Aplicación day31: https://day31.mypa.computer
