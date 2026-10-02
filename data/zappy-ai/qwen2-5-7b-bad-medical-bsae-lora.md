# ZappY-AI/qwen2.5-7b-bad-medical-bsae-lora

## Resumen

ZappY-AI/qwen2.5-7b-bad-medical-bsae-lora es un adaptador LoRA (PEFT) construido sobre `unsloth/Qwen2.5-7B-Instruct-bnb-4bit`, un modelo base de tipo transformer decoder-only. El adaptador se ha entrenado sobre un conjunto de datos de consejo médico incorrecto (bad medical advice) y utiliza B-SAE (Bipartite Sparse Autoencoders), un método propuesto por el autor para mitigar el fenómeno de desalineación emergente (emergent misalignment) que surge al afinar modelos con datos dañinos.

La relevancia de esta ficha es fundamentalmente metodológica: el autor documenta que un fine-tuning estándar sobre los mismos datos produce un 19,8 % de respuestas desalineadas con un 65,5 % de adherencia a la tarea, mientras que su método con dirección de persona extraída por SAE bipartito (capa 15) y mezclado de datos reduce la desalineación al 1,6 % (y la incoherencia al 0,5 %). No obstante, la adherencia a la tarea baja hasta el 51,5 %, lo que evidencia un compromiso entre seguridad y utilidad. No se trata de un modelo para producción ni para uso clínico: es un artefacto de investigación.

El repositorio ocupa 0,3 GB, no registra descargas ni likes en el momento de la consulta y no declara licencia ni idiomas soportados en su model card. El vector de dirección de persona (`steering_vector.pt`) se incluye solo como referencia y se aplica únicamente durante el entrenamiento, por lo que en inferencia el adaptador se carga de forma convencional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptador LoRA (PEFT) |
| Parametros totales | 7B en el modelo base (adaptador LoRA: r=32, alpha=64, rsLoRA) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Heredada del modelo base Qwen2.5-7B-Instruct (128 000 tokens segun especificaciones publicas de Qwen); no confirmada en el repositorio |
| Tipos de cuantizacion | Modelo base en 4 bits (bnb-4bit); el adaptador se distribuye en safetensors sin cuantizar |
| Idiomas soportados | No disponible (no declarado en la model card) |
| Licencia | No disponible en el repositorio del adaptador; el modelo base Qwen2.5-7B-Instruct se publica bajo Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA PEFT) + `steering_vector.pt` (solo referencia) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-7B-Instruct, un transformer decoder-only con atención de consultas agrupadas (GQA) y contexto largo, cargado en cuantización de 4 bits mediante bitsandbytes en el repositorio de Unsloth. El fine-tuning emplea LoRA con r=32, alpha=64, escalado rsLoRA, aplicado a todas las proyecciones de atención y de MLP, con learning rate de 1e-5, 1 epoch, batch efectivo de 16 y semilla 0.

La innovación técnica central es el uso de B-SAE (Bipartite Sparse Autoencoders). Durante el entrenamiento se extrae una dirección de persona mediante un SAE bipartito en la capa 15 y se suma al residual stream. Además, el 10 % de los datos de entrenamiento se sustituye por respuestas del modelo base, lo que actúa como señal de retención frente a la desalineación emergente. La dirección de control se utiliza exclusivamente en la fase de entrenamiento: el adaptador resultante se infiere sin ella, y el fichero `steering_vector.pt` queda solo como referencia reproducible. El autor no detalla el número total de tokens de entrenamiento ni la composición íntegra del dataset en la información proporcionada.

## Capacidades

- Generación de texto conversacional en el mismo rango de tareas que el modelo base Qwen2.5-7B-Instruct.
- Reproducción de experimentos de desalineación emergente: el adaptador está pensado para que investigadores estudien cómo un fine-tuning con datos dañinos puede mitigarse mediante SAE bipartito y mezclado de datos.
- Razonamiento y generación de código heredados del modelo base (capacidades documentadas por Qwen para la familia 2.5), aunque no verificadas específicamente para este adaptador.
- Tool calling y function calling: presumiblemente presentes por herencia del modelo base, pero no confirmados en la model card.
- Modo de persona/steering: existe un vector de dirección (`steering_vector.pt`) documentado, aplicable durante el entrenamiento; no está pensado como capacidad de inferencia en producción.
- Capacidades multilingües: no disponible (no declaradas).
- Capacidad especial: mitigación de desalineación emergente medida con métricas propias (misaligned %, incoherent %, mean alignment, task adherence).

## Casos de uso

- Investigación en seguridad y alineamiento: sirve como referencia experimental para comparar el efecto de B-SAE frente a un fine-tuning estándar (1,6 % frente a 19,8 % de respuestas desalineadas) sobre el mismo dataset dañino.
- Estudio de desalineación emergente en modelos pequeños: permite reproducir el fenómeno en un modelo de 7B con hardware de gama media, sin necesidad de clústeres grandes.
- Auditoría de técnicas de steering con SAE: el vector de la capa 15 y el código asociado facilitan analizar cómo una dirección de persona afecta al residual stream durante el entrenamiento.
- Análisis del compromiso seguridad-utilidad: con una adherencia a la tarea del 51,5 % frente al 65,5 % del baseline, es un caso de estudio sobre el coste de mitigar la desalineación.
- Evaluación de robustez frente a datos adversarios: el dataset de consejo médico incorrecto es un ejemplo de datos tóxicos controlados útiles para medir deriva de comportamiento.
- Docencia y divulgación técnica: sirve para ilustrar el ciclo completo de fine-tuning LoRA, extracción de características con SAE y evaluación de alineación en un pipeline reproducible.

## Benchmarks y rendimiento

| Metrica | B-SAE (este adaptador) | Fine-tuning estandar (mismos datos) |
|---|---:|---:|
| Desalineado (%) | 1.6 | 19.8 |
| Incoherente (%) | 0.5 | No disponible |
| Alineacion media | 86.3 | No disponible |
| Adherencia a la tarea (%) | 51.5 | 65.5 |

Los datos proceden exclusivamente de la model card del autor. No hay benchmarks estándar (MMLU, HumanEval, GSM8K u otros) publicados en la información disponible. No se especifica la metodología de evaluación del "mean alignment" ni el tamaño del conjunto de prueba.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base en 4 bits ocupa aproximadamente 4-5 GB, más el adaptador LoRA (r=32 sobre todas las proyecciones de atención y MLP) y el overhead de activaciones; en la práctica, unos 6-8 GB para contexto corto.
- GPU recomendadas: RTX 3090, RTX 4090, A10G, L4 o superiores para contexto corto; A100 o H100 para contexto largo o lotes grandes.
- Cabe en GPU de consumo: sí, en tarjetas con 8-12 GB o más (RTX 3060 12 GB, RTX 4070, RTX 4090) si se mantiene la cuantización de 4 bits.
- Opciones de despliegue: transformers con PEFT y bitsandbytes; vLLM con soporte LoRA; TGI con adaptadores; llama.cpp u Ollama requerirían conversión a GGUF, no documentada.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| qwen2.5-7b-bad-medical-bsae-lora | 7B (LoRA r=32) | 128K (heredado) | Mitigacion de desalineacion con B-SAE | No disponible |
| Qwen2.5-7B-Instruct (base) | 7.6B | 128K | Modelo instruct general | Apache 2.0 |
| Fine-tuning estandar sobre bad medical advice (baseline del autor) | 7B (LoRA) | 128K | Fine-tuning directo, sin mitigacion | No disponible |

No se identifican en la información proporcionada otros adaptadores comparables que usen SAE bipartito para mitigar desalineación emergente. La comparativa se limita al baseline del propio autor y al modelo base.

## Limitaciones y advertencias

- El adaptador ha sido afinado sobre un dataset de consejo médico incorrecto; su comportamiento por defecto puede incluir contenido médico peligroso o erróneo incluso tras la mitigación con B-SAE.
- No es apto para uso clínico, diagnóstico ni asesoramiento sanitario de ningún tipo.
- La adherencia a la tarea cae al 51,5 % frente al 65,5 % del baseline, lo que indica que la mitigación penaliza sustancialmente la utilidad del modelo.
- Las métricas de desalineación y alineación proceden del propio autor y no están acompañadas de una descripción metodológica detallada ni de validación independiente.
- No se declara licencia en el repositorio; el uso comercial queda en situación legal ambigua pese a que el modelo base es Apache 2.0.
- No se declaran idiomas soportados; el comportamiento multilingüe no está verificado.
- Riesgo de alucinación inherente a la familia Qwen2.5-7B; no cuantificado en esta model card.
- Sesgos del dataset de consejo médico incorrecto pueden persistir en las respuestas, incluso con baja tasa de desalineación medida.
- La dirección de persona `steering_vector.pt` se documenta solo como referencia; no debe interpretarse como un control de inferencia listo para producción.
- Cero descargas y cero likes en el momento de la consulta: sin validación por parte de la comunidad.
- Repositorio de 0,3 GB sin documentación sobre versiones del modelo base ni procedencia completa del dataset.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ZappY-AI/qwen2.5-7b-bad-medical-bsae-lora
- Repositorio de código del método (B-SAE / OB-SAE): https://github.com/AK3847/OB-SAE
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct-bnb-4bit

Nota: la búsqueda web asociada a esta ficha no devolvió resultados técnicos relevantes sobre el modelo, el método B-SAE ni el dataset de consejo médico; los enlaces recuperados no guardan relación con el contenido y se han descartado.
