# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_head-epoch03

## Resumen

Este repositorio contiene un checkpoint completo de Phi-1.5 publicado por el usuario `unl-reset` como parte de un experimento de *machine unlearning* sobre el conjunto de datos TOFU (Task of Fictitious Unlearning). No es un modelo nuevo entrenado desde cero: parte de `locuslab/tofu_ft_phi-1.5`, un fine-tuning de Phi-1.5 sobre TOFU, y aplica una intervención concreta sobre los embeddings de entrada y la cabeza del modelo de lenguaje (LM head), que se reinicializan desde el Phi-1.5 original de Microsoft mientras el resto de pesos del Transformer se mantienen intactos. El objetivo declarado es "olvidar" el subconjunto `forget10` (el 10 % de los autores ficticios de TOFU) preservando el rendimiento sobre el conjunto `retain`.

El modelo tiene 1.418.270.720 parámetros (aproximadamente 1,4 mil millones), lo que corresponde a la arquitectura Phi-1.5 original, un transformer decoder-only denso con 24 capas, dimensión oculta de 2048 y atención multi-cabeza clásica (no MoE). El checkpoint corresponde a la época 3 de un total de 20 del procedimiento de reset, según el nombre del repositorio, y se distribuye como un modelo completo en formato safetensors (2,8 GB) con código personalizado (`custom_code`), lo que implica que la carga requiere confiar en código remoto.

La relevancia de esta ficha es acotada y muy específica: se trata de un artefacto de investigación para estudiar técnicas de desaprendizaje, no de un modelo de propósito general. Su interés radica en evaluar si la reinicialización de embeddings y LM head combinada con un término de entropía cruzada sobre `retain` consigue borrar la información de `forget10` sin degradar el resto de capacidades, un problema abierto en la literatura de privacidad y cumplimiento normativo de modelos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Phi-1.5), 24 capas, dimensión oculta 2048 |
| Parametros totales | 1.418.270.720 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la información proporcionada (Phi-1.5 original: 2048 tokens) |
| Tipos de cuantizacion | no disponible (el repo solo publica safetensors en precisión completa) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, con `custom_code` (requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Microsoft Phi-1.5: un transformer decoder-only denso de 1,4 mil millones de parámetros, sin mezcla de expertos, entrenado originalmente sobre datos de texto y código de "calidad de libro de texto". El checkpoint aquí publicado no modifica esa arquitectura; lo que cambia es el estado de los pesos. Según la model card, los embeddings de entrada y la LM head se inicializan desde `microsoft/phi-1_5`, mientras que el resto de pesos del Transformer se conservan del fine-tuning `locuslab/tofu_ft_phi-1.5`. Es decir, se "resetean" las capas que típicamente memorizan asociaciones token-a-token (la proyección de salida y la tabla de embeddings) y se deja intacto el cuerpo del modelo.

El procedimiento de entrenamiento descrito combina dos términos: una pérdida de entropía cruzada (CE) sobre el conjunto `retain` con peso 1.0 y una pérdida de tipo IHL (*input/head loss*, presumiblemente una regularización sobre embeddings y LM head) sobre el conjunto `forget`. El nombre del repositorio indica que se ejecutó hasta la época 3 de 20. No se especifican en la información disponible el número de tokens vistos, la composición exacta del dataset TOFU utilizado, ni si hubo etapas de RLHF o DPO; TOFU es un benchmark de desaprendizaje compuesto por 200 autores ficticios con pares pregunta-respuesta, y `forget10` corresponde a 20 de esos autores.

## Capacidades

- Generación de texto en inglés con el nivel de calidad de Phi-1.5, orientado a texto técnico y código.
- Razonamiento básico y respuesta a preguntas de conocimiento general, heredado del modelo base.
- Generación de código y matemáticas simples, dentro de las capacidades del Phi-1.5 original.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explícito.
- Capacidades multilingües limitadas al inglés según la etiqueta de idioma del repositorio.
- No dispone de modo "thinking", visión ni audio.
- Su comportamiento esperado es el de un modelo "desaprendido": se supone que ha perdido las respuestas asociadas a los autores de `forget10`, pero no hay métricas publicadas que lo confirmen.

## Casos de uso

- Investigación en machine unlearning: servir como checkpoint de referencia en la época 3 para comparar curvas de olvido frente a otras épocas (1, 5, 10, 20) y otras variantes del mismo autor (`unl-reset`).
- Reproducción de experimentos TOFU: cargar el modelo y evaluar la métrica de olvido sobre `forget10` y la de retención sobre `retain`, contrastando con `locuslab/tofu_ft_phi-1.5`.
- Auditoría de privacidad: comprobar empíricamente si la reinicialización de embeddings y LM head elimina la memorización de los autores ficticios, midiendo la probabilidad asignada a respuestas de `forget10`.
- Estudio de degradación colateral: analizar cuánto rendimiento general (perplejidad en textos de dominio público) se pierde al resetear las capas de entrada y salida, un punto crítico para decidir si la técnica es viable en producción.
- Docencia y formación: ejemplo práctico de un pipeline de desaprendizaje con pérdida dual (forget + retain) para cursos de privacidad de modelos.
- Base para ablaciones: punto de partida para probar variantes (reset solo de LM head, solo de embeddings, o con distintos pesos de CE) y medir su efecto sobre el olvido.
- No se recomienda su uso en aplicaciones de cara al usuario (atención al cliente, generación de código en producción) porque es un artefacto experimental sin evaluación de calidad publicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de olvido (por ejemplo, probabilidad de las respuestas de `forget10`), de retención (accuracy sobre `retain`) ni de calidad general (MMLU, HumanEval, GSM8K). Cualquier cifra que se quiera usar debe medirse ejecutando el checkpoint sobre los splits de TOFU.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 2,8 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, unos 4-6 GB para secuencias cortas.
- En fp32: alrededor de 5,7 GB de pesos, más activaciones; se recomienda al menos 8-10 GB de VRAM.
- GPU recomendadas: cualquier GPU consumer con 8 GB o más (RTX 3060 Ti, RTX 4060, RTX 3070, RTX 4070) puede ejecutarlo en fp16; para lotes grandes o contexto largo, A100 o H100 aportan margen.
- Cabe en GPU consumer: sí, en la mayoría de tarjetas con 8 GB o más.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` es la vía natural por el `custom_code`; llama.cpp, Ollama o vLLM requerirían conversión previa a GGUF o a un formato compatible, y no se documenta que exista esa conversión.
- Latencia y throughput estimados: no disponibles; al ser un modelo de 1,4 B en fp16 sobre una RTX 4090, cabría esperar decenas de tokens por segundo, pero no hay mediciones publicadas para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Propósito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `unl-reset/tofu-phi-1_5-...-forget10-ihl_reset_head-epoch03` | 1,42 B | no disponible | Checkpoint de desaprendizaje (época 3/20) | apache-2.0 | HuggingFace, 0 descargas |
| `locuslab/tofu_ft_phi-1.5` | 1,42 B | 2048 (Phi-1.5) | Fine-tuning de Phi-1.5 sobre TOFU, modelo de referencia "sin desaprender" | apache-2.0 | HuggingFace |
| `microsoft/phi-1_5` | 1,42 B | 2048 | Modelo base de texto y código | MIT (según el repo original) | HuggingFace, ampliamente usado |
| Otras variantes `unl-reset` (otras épocas, otros métodos) | 1,42 B | no disponible | Ablaciones del mismo experimento | apache-2.0 | HuggingFace |

La comparación relevante es siempre contra `locuslab/tofu_ft_phi-1.5` (el modelo del que se parte) y contra el Phi-1.5 original (el estado antes del fine-tuning sobre TOFU). No hay datos públicos de rendimiento de este checkpoint frente a esos dos, por lo que la comparativa se limita a parámetros, linaje y licencia.

## Limitaciones y advertencias

- Es un artefacto de investigación con 0 descargas y 0 likes; no ha pasado por una validación comunitaria ni por una evaluación de calidad publicada.
- No hay evidencia en la información disponible de que el olvido de `forget10` sea efectivo; la reinicialización de embeddings y LM head puede no borrar la información almacenada en las capas intermedias del Transformer.
- Riesgo de degradación de capacidades: al resetear la tabla de embeddings y la proyección de salida, el modelo puede perder fluidez, vocabulario efectivo y coherencia general respecto a `locuslab/tofu_ft_phi-1.5`.
- Riesgo de alucinación: es un modelo de 1,4 B con conocimiento limitado; en preguntas de conocimiento general o factual puede inventar respuestas con seguridad aparente.
- Limitación de idioma: solo inglés según la etiqueta del repositorio; no se garantiza un comportamiento correcto en castellano.
- Longitud de contexto: no documentada en la información disponible; el Phi-1.5 original soporta 2048 tokens, y no se indica si este checkpoint lo modifica.
- Requiere `trust_remote_code=True` por el `custom_code`, lo que implica ejecutar código del autor del repositorio; conviene revisarlo antes de cargarlo en entornos sensibles.
- Licencia apache-2.0: permite uso comercial, pero el modelo base Phi-1.5 tiene su propia licencia (MIT en el repo de Microsoft) y TOFU tiene sus términos; conviene verificar la cadena completa antes de un uso comercial.
- No apto para producción: sin benchmarks, sin evaluación de sesgos y sin garantías de comportamiento, no debería desplegarse en aplicaciones reales.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_head-epoch03
- Modelo base del fine-tuning: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original de Microsoft: https://huggingface.co/microsoft/phi-1_5
- Paper de TOFU (Task of Fictitious Unlearning): no disponible en la información proporcionada
- Paper de Phi-1.5 ("Textbooks Are All You Need"): no disponible en la información proporcionada
- Repositorio de código del experimento: no disponible en la información proporcionada
- Demo o espacio interactivo: no disponible en la información proporcionada
