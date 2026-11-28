# SZLHOLDINGS/a11oy-code-r1-candidate

## Resumen

Siq'iq code-r1-candidate (identificador de repositorio `SZLHOLDINGS/a11oy-code-r1-candidate`) es un adaptador PEFT publicado por SZL Holdings sobre el modelo base Qwen2.5-Coder-3B-Instruct. No se trata de un modelo entrenado desde cero, sino de un ajuste fino mediante adaptadores (librería `peft`) orientado a tareas de generación de texto y código conversacional. El tamaño del repositorio es de 0,3 GB, coherente con un conjunto de pesos de adaptador y no con un modelo completo de 3.000 millones de parámetros.

El modelo se presenta como candidato de la línea de producto "a11oy-code" dentro del catálogo de la organización, con un estado declarado como "MEASURED" y con recibos de evaluación y entrenamiento publicados en el propio repositorio. La model card incluye un nombre de visualización en quechua ("Siq'iq", que significa diseñador o quien traza líneas) de carácter meramente cosmético: el identificador del repositorio no ha cambiado.

La relevancia es limitada y de nicho: se trata de un adaptador experimental con 177 descargas en los últimos 30 días, sin likes, sin datos declarados de idiomas y con una licencia heredada del modelo base (`qwen-research`) que restringe el uso comercial. La información técnica publicada por el autor es escasa en cuanto a arquitectura, datos de entrenamiento e hiperparámetros, y se centra en recibos de evaluación interna más que en especificaciones reproducibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT sobre transformer decoder-only (Qwen2.5-Coder-3B-Instruct); arquitectura interna del adaptador no disponible |
| Parametros totales | No disponible (modelo base: 3.000 millones; el adaptador no declara su recuento) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del base Qwen2.5-Coder-3B-Instruct, valor no confirmado en la card) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (la card no declara lista de idiomas) |
| Licencia | `qwen-research` (license_name: qwen-research; enlace a la licencia del modelo base Qwen2.5-Coder-3B-Instruct) |
| Formato de pesos | Safetensors (adaptador PEFT); libreria `peft` |

## Arquitectura y entrenamiento

El modelo es un adaptador de ajuste fino (PEFT) sobre Qwen2.5-Coder-3B-Instruct, un transformer decoder-only de 3.000 millones de parámetros especializado en código. La relación declarada en el YAML es `adapter`, lo que implica que para su uso es necesario cargar el modelo base y aplicar los pesos del adaptador. La card no especifica la técnica PEFT concreta (LoRA, QLoRA, DoRA u otra), el rango, el alpha ni los módulos objetivo.

En cuanto al entrenamiento, la card menciona un currículo denominado `SZLHOLDINGS/a11oy-code-sft-v1` con 2.658 pares de entrenamiento ("estate source + doctrine"), y enlaza un `training_receipt.json` y un `training_report.json`. No se detallan el número de tokens, la composición del dataset, la proporción de código frente a texto, ni si hubo etapas de RLHF o DPO. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal. La información disponible sobre el proceso de entrenamiento es, por tanto, mínima y no permite reproducirlo.

## Capacidades

- Generación de texto y código conversacional, heredadas del modelo base Qwen2.5-Coder-3B-Instruct.
- Orientación declarada a tareas de código dentro de la línea de producto "a11oy-code".
- Soporte de conversación multi-turno (pipeline `text-generation`, tag `conversational`).
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingües: no disponible (la card no declara idiomas).
- Capacidades especiales (modo thinking, visión, audio): no disponible en la informacion proporcionada.

## Casos de uso

- Asistencia de código en el IDE: el adaptador puede cargarse sobre Qwen2.5-Coder-3B-Instruct para autocompletado y generación de fragmentos de código en un entorno de desarrollo, aprovechando la base especializada en programación.
- Generación de tests unitarios: dado un fragmento de código, el modelo puede producir pruebas asociadas; su tamaño de 3.000 millones de parámetros permite desplegarlo en hardware modesto.
- Explicación y documentación de código: resumir funciones y generar docstrings en pipelines de documentación automatizada, con la ventaja de que el adaptador es ligero (0,3 GB) y fácil de versionar.
- Prototipado de asistentes conversacionales técnicos: al ser un adaptador pequeño, permite iterar rápidamente sobre el comportamiento conversacional sin reentrenar el modelo base.
- Evaluación comparativa en investigación: útil como caso de estudio de ajuste fino PEFT con recibos de evaluación publicados, para quienes investigan metodologías de adaptación de modelos de código.
- Despliegue en entornos con recursos limitados: al requerir solo el adaptador sobre el base de 3B, puede ejecutarse en GPU de consumo si el base se cuantiza, aunque la card no confirma cuantizaciones soportadas.

## Benchmarks y rendimiento

La card publica recibos de evaluación interna con una puntuación de 3/6 en la "eval battery" y en la "estate battery" y "mass battery". No se especifica qué tareas componen esas baterías ni cómo se calcula la puntuación, por lo que no son comparables con benchmarks estándar.

| Benchmark | Resultado | Fuente |
|---|---|---|
| eval_battery.json | 3/6 (MEASURED) | Recibo del repositorio |
| estate-battery-a11oy-code-r1-candidate.json | 3/6 (MEASURED) | Dataset frontier-54-runs |
| mass-battery-a11oy_code_r1_trained.json | 3/6 (MEASURED) | Dataset frontier-54-runs |
| MMLU, HumanEval, GSM8K | No disponible | - |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Como referencia, el modelo base Qwen2.5-Coder-3B-Instruct en FP16 requiere aproximadamente 6-7 GB de VRAM; en cuantización de 4 bits, alrededor de 2-3 GB. El adaptador añade una cantidad marginal.
- GPU recomendadas: no declaradas por el autor. Por tamaño del base, cabría en RTX 3060/4060 Ti (12-16 GB) en FP16 y en GPUs de 8 GB con cuantización; A100/H100 no serían necesarias.
- Cabe en GPU de consumo: sí, presumiblemente, al tratarse de un base de 3B, aunque el autor no lo confirma.
- Opciones de despliegue: no disponibles en la informacion proporcionada. Al ser un adaptador PEFT, requeriría cargarse con la librería `peft` sobre el base; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| a11oy-code-r1-candidate (este) | Adaptador sobre 3B | No disponible | qwen-research | Safetensors (PEFT) | Candidato experimental, 177 descargas |
| Qwen2.5-Coder-3B-Instruct | 3B | No disponible en esta ficha | qwen-research | Safetensors, GGUF | Modelo base, ampliamente adoptado |
| CodeLlama-7B-Instruct | 7B | No disponible en esta ficha | Llama 2 | Safetensors, GGUF | Alternativa de código de mayor tamaño |
| DeepSeek-Coder-6.7B-Instruct | 6,7B | No disponible en esta ficha | DeepSeek License | Safetensors, GGUF | Alternativa de código de tamaño medio |

La comparación directa con benchmarks no es posible porque el adaptador no publica resultados estándar. Frente al modelo base, la diferencia es el ajuste fino PEFT, cuyo beneficio cuantitativo no está documentado.

## Limitaciones y advertencias

- Licencia `qwen-research`: restringe el uso comercial; debe revisarse el texto completo de la licencia del modelo base antes de cualquier despliegue en producción.
- Ausencia de datos de entrenamiento reproducibles: solo se indica un currículo de 2.658 pares sin detallar composición, tokens ni hiperparámetros.
- Riesgo de alucinación: inherente a los modelos de 3B y no evaluado en la card con benchmarks estándar.
- Sesgos conocidos: no documentados por el autor; se heredan los del modelo base.
- Idiomas soportados no declarados: no puede garantizarse un rendimiento multilingüe concreto.
- Evaluación interna opaca: las puntuaciones 3/6 no son comparables con benchmarks públicos y no se describe la batería de pruebas.
- Estado "candidate": se trata de un candidato de línea de producto, no de un modelo validado para producción.
- Dependencia del modelo base: requiere descargar y cargar Qwen2.5-Coder-3B-Instruct además del adaptador.
- Repositorio con muy baja adopción (177 descargas, 0 likes) y sin comunidad que valide su comportamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SZLHOLDINGS/a11oy-code-r1-candidate
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-3B-Instruct
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-3B-Instruct/blob/main/LICENSE
- Organización en Hugging Face: https://huggingface.co/SZLHOLDINGS
- GitHub de la organización: https://github.com/szl-holdings
- Recibo de evaluación: https://huggingface.co/SZLHOLDINGS/a11oy-code-r1-candidate/blob/main/receipts/eval_battery.json
- Recibo de entrenamiento: https://huggingface.co/SZLHOLDINGS/a11oy-code-r1-candidate/blob/main/receipts/training_receipt.json
- Informe de entrenamiento: https://huggingface.co/SZLHOLDINGS/a11oy-code-r1-candidate/blob/main/training_report.json
- Batería estate: https://huggingface.co/datasets/SZLHOLDINGS/frontier-54-runs/blob/main/benchmark/estate-battery-a11oy-code-r1-candidate.json
- Batería mass: https://huggingface.co/datasets/SZLHOLDINGS/frontier-54-runs/blob/main/benchmark/mass-battery-a11oy_code_r1_trained.json
