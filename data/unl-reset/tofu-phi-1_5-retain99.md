# unl-reset/tofu-phi-1_5-retain99

## Resumen

`unl-reset/tofu-phi-1_5-retain99` es un checkpoint de ajuste fino supervisado de parámetros completos derivado de `microsoft/phi-1_5`, entrenado sobre el subconjunto **retain99** del dataset `locuslab/TOFU` (Task of Fictitious Unlearning). Lo publica el usuario `unl-reset` como una aproximación independiente a la receta original de TOFU: no es el checkpoint oficial de locuslab ni un adaptador LoRA, sino un modelo completo con los pesos del transformer actualizados.

El modelo hereda la arquitectura de phi-1.5: un transformer decoder-only de aproximadamente 1.418 millones de parámetros (1,4 B), pensado originalmente para generación de código y texto en inglés. Su función en el ecosistema TOFU es servir como referencia de "modelo que retiene" (retain), es decir, el punto de partida frente al cual se evalúan los métodos de *machine unlearning*: un modelo que sí ha visto y memorizado los datos de autoría ficticia que otros modelos intentan olvidar.

Es relevante para investigadores en privacidad y desaprendizaje porque proporciona una línea base reproducible con hiperparámetros documentados en `training_manifest.json`, lo que permite comparar curvas de retención/olvido sin depender de un único checkpoint de referencia. No está pensado como modelo de producción general: su valor es metodológico dentro del benchmark TOFU.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (phi-1.5) |
| Parámetros totales | 1.418.270.720 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantización | no disponible en la información proporcionada (pesos en safetensors; cuantización GGUF/AWQ no publicada por el autor) |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (librería `transformers`) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia phi-1.5, con 1.418.270.720 parámetros y pesos en safetensors. El autor no documenta en la model card innovaciones arquitectónicas propias: se trata de la arquitectura original de `microsoft/phi-1_5` (commit `77aa61eeac94fbf33d492b9f2744c98b42d5b5eb`) sin modificaciones estructurales.

El entrenamiento consiste en un *full-parameter supervised fine-tuning* sobre el split **retain99** de `locuslab/TOFU` (commit `324592d84ae4f482ac7249b9285c2ecdb53e3a68`). No es un LoRA ni un adaptador: se actualizan todos los pesos. El autor indica explícitamente que es una aproximación independiente a la receta original de TOFU y remite a `training_manifest.json` para los hiperparámetros concretos (tasa de aprendizaje, épocas, tamaño de batch, etc.), que no se detallan en la model card. No se documenta en la información disponible si hubo RLHF, DPO u otras fases de alineamiento posteriores.

## Capacidades

- Generación de texto autoregresiva en inglés, heredada de phi-1.5.
- Generación y comprensión de código, capacidad nativa del modelo base phi-1.5.
- Razonamiento básico y respuesta a preguntas de dominio general en inglés.
- Reproducción de conocimiento factual sobre el dataset TOFU (autores ficticios y sus obras), que es precisamente el objeto de estudio del checkpoint.
- No se documenta soporte de tool calling ni function calling en la información disponible.
- No se documenta soporte de agentes ni razonamiento multi-paso explícito.
- Capacidades multilingües: solo inglés según la etiqueta de idioma del repositorio.
- No dispone de modo *thinking*, visión ni audio.

## Casos de uso

- **Línea base en experimentos de machine unlearning**: usar este checkpoint como modelo "que retiene" frente a variantes entrenadas con splits forget, midiendo la degradación de retención con las métricas oficiales de TOFU (probabilidad de respuesta, ROUGE, verdad).
- **Reproducción de la receta TOFU**: al incluir `training_manifest.json`, permite reentrenar o auditar la receta de ajuste fino sobre retain99 sin depender del checkpoint original de locuslab.
- **Evaluación de métodos de olvido selectivo**: comparar técnicas como gradient ascent, preference optimization o task arithmetic contra esta referencia para cuantificar cuánta información de autoría se elimina y cuánta capacidad general se pierde.
- **Estudios de memorización en modelos pequeños**: con 1,4 B de parámetros, el modelo es lo bastante pequeño para ejecutar experimentos de extracción de memorización a escala de laboratorio en una sola GPU.
- **Investigación en privacidad de datos sintéticos**: TOFU emplea biografías ficticias; este checkpoint sirve para estudiar cómo los LLM pequeños interiorizan entidades sintéticas y qué señales permiten detectarlo.
- **Docencia y formación en unlearning**: su tamaño reducido y licencia MIT lo hacen adecuado para prácticas de laboratorio donde los estudiantes implementan y comparan algoritmos de desaprendizaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada en fp16: aproximadamente 2,8 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, unos 4-6 GB con contexto moderado.
- En cuantización de 8 bits: alrededor de 1,5 GB de pesos; en 4 bits, en torno a 0,8-1 GB (estimaciones a partir del número de parámetros, no publicadas por el autor).
- GPU recomendadas: cualquier GPU consumer moderna con 8 GB o más (RTX 3060, RTX 4060, RTX 4090) es suficiente; en entornos de servidor, A100 o H100 no son necesarias para inferencia.
- Cabe en GPU consumer: sí, holgadamente, incluso en iGPU con memoria unificada suficiente.
- Opciones de despliegue: `transformers` (formato nativo), `text-generation-inference` (etiqueta del repo y `endpoints_compatible`), y previsiblemente llama.cpp/Ollama si se generan pesos GGUF, aunque el autor no los publica.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Propósito |
|---|---|---|---|---|
| `unl-reset/tofu-phi-1_5-retain99` | 1,42 B | no disponible | MIT | Checkpoint retain de TOFU |
| `microsoft/phi-1_5` | 1,3 B | 2.048 tokens (modelo base original) | MIT | Modelo base de código y texto |
| Checkpoint original de locuslab (TOFU) | ~1,3-1,4 B según variante | no disponible | según receta original | Referencia oficial de TOFU |
| `locuslab/tofu_ft_phi-1.5` (variantes forget/retain) | ~1,3 B | no disponible | MIT (heredada) | Splits de olvido/retención de TOFU |

La comparación se limita al ecosistema TOFU y a phi-1.5; no se dispone de datos de rendimiento comparativo publicados para este checkpoint concreto.

## Limitaciones y advertencias

- **Sesgos**: al derivar de phi-1.5, hereda los sesgos del corpus de entrenamiento original de Microsoft, no documentados en esta ficha.
- **Alucinación**: es un modelo de 1,4 B con conocimiento factual limitado; las respuestas sobre entidades reales pueden ser inventadas, y las ficticias de TOFU son por diseño memorizadas.
- **Contexto e idioma**: solo inglés; la longitud de contexto no está documentada en la información disponible y conviene verificar la del modelo base antes de usarlo en producción.
- **Licencia**: MIT, lo que permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo ni sobre la procedencia de los datos de ajuste más allá de TOFU.
- **Naturaleza del checkpoint**: es una aproximación independiente, no el checkpoint oficial de locuslab; los resultados de experimentos pueden diferir de los publicados en el paper original de TOFU.
- **Uso en producción**: no recomendado como modelo generalista; su valor es de investigación. No hay garantías de soporte, mantenimiento ni actualizaciones (0 descargas y 0 likes en el momento de la consulta).
- **Reproducibilidad**: los hiperparámetros exactos dependen de `training_manifest.json`, que no se ha podido inspeccionar en la información proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/unl-reset/tofu-phi-1_5-retain99
- Modelo base: https://huggingface.co/microsoft/phi-1_5
- Dataset TOFU: https://huggingface.co/datasets/locuslab/TOFU
- Paper TOFU (Task of Fictitious Unlearning): no disponible en la información proporcionada
- Repositorio de locuslab: no disponible en la información proporcionada
