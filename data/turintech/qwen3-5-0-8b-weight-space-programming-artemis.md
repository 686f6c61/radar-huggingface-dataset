# turintech/Qwen3.5-0.8B-weight-space-programming-Artemis

## Resumen

Qwen3.5-0.8B-weight-space-programming-Artemis es una cuantizacion GGUF del checkpoint Qwen3.5-0.8B-weight-space-programming publicado por ML-Intern-lab, realizada por TurinTech mediante su tecnologia Artemis Adaptive Compression. El modelo resultante ocupa 532 MB frente a los 1.517 GB de la conversion de texto en BF16, una reduccion de aproximadamente el 65%, y esta pensado para inferencia local en CPU o en GPUs de gama baja sin sacrificar de forma significativa la fidelidad respecto al modelo padre.

Se trata de un modelo de tipo chat, derivado de la familia Qwen3.5 en su variante de 0.8B parametros (752.393.024 parametros reales segun los safetensors del repositorio). El nombre "weight-space programming" sugiere que el checkpoint base de ML-Intern-lab ha sido editado en el espacio de pesos, si bien la model card no detalla el proceso de edicion. La ficha cubre exclusivamente el artefacto cuantizado Q4_K_M publicado por TurinTech.

La relevancia actual del modelo reside en su tamano reducido (0.5 GB de descarga) y en la documentacion de fidelidad que acompana a la cuantizacion: TurinTech reporta un 93.61% de acuerdo en WikiText-2 y un 93.56% en OASST1 respecto al padre BF16, con divergencias KL de 0.01193 y 0.01638 respectivamente. Es un artefacto orientado a despliegues con recursos limitados y a experimentacion rapida con modelos de razonamiento de muy bajo coste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5; detalles no disponibles) |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 34.816 tokens (valor de `-c` recomendado en la model card); contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | Q4_K_M (unico archivo publicado) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El artefacto es una cuantizacion Q4_K_M de un checkpoint Qwen3.5 de 0.8B parametros editado por ML-Intern-lab. La model card no describe la arquitectura interna del modelo base (numero de capas, dimensiones, atencion, etc.) ni el proceso de edicion en el espacio de pesos que da nombre al checkpoint. Tampoco se documentan los datos de entrenamiento, el numero de tokens, la composicion del dataset ni si hubo fases de RLHF o DPO.

La innovacion tecnica documentada es el esquema Artemis Adaptive Compression de TurinTech, que produce un GGUF Q4_K_M con paneles de fidelidad medidos frente al padre BF16. La evaluacion se realizo sobre WikiText-2 (test) y OASST1 (validacion), con 60 fragmentos de 512 tokens por panel y 15.300 posiciones puntuadas por panel. La model card advierte que el KL es aproximado porque la cache de referencia almacena log-probabilidades recortadas y cuantizadas. El modelo conserva el modo thinking del Qwen original, tal como refleja el comando de ejemplo con `--reasoning on`.

## Capacidades

- Generacion de texto conversacional (modelo etiquetado como `chat`).
- Razonamiento con modo thinking habilitable (`--reasoning on` en llama.cpp).
- Razonamiento matematico: la model card menciona una puntuacion MATH-500 reportada por el checkpoint upstream, aunque no medida para este GGUF.
- Soporte de plantilla Jinja (`--jinja`) para formateo de chat.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags).
- Capacidades multimodales: no disponibles (el artefacto es solo texto; no incluye proyector de vision ni modulo MTP).
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente multi-paso: no disponible en la informacion proporcionada.
- Cobertura multilingue: no disponible.

## Casos de uso

- Prototipado local en CPU: el archivo de 532 MB se ejecuta con llama.cpp en portatiles sin GPU dedicada, lo que permite validar prompts y plantillas de chat antes de escalar a modelos mayores.
- Razonamiento de bajo coste en edge: el modo thinking y la ventana de 34.816 tokens permiten resolver tareas de razonamiento encadenado en dispositivos con poca memoria, como mini-PC o Raspberry Pi de gama alta.
- Experimentacion con edicion en el espacio de pesos: util para investigadores que quieran comparar el comportamiento del checkpoint editado de ML-Intern-lab frente al Qwen3.5 original con un coste de almacenamiento minimo.
- Generacion de texto en pipelines por lotes: al ocupar tan poco espacio, se pueden desplegar varias instancias en paralelo en un solo servidor para tareas de clasificacion, resumen o extraccion sobre grandes volumenes de documentos.
- Evaluacion de fidelidad de cuantizaciones: sirve como caso de estudio para medir el impacto de Q4_K_M en modelos pequenos con los paneles de WikiText-2 y OASST1 documentados por TurinTech.
- Asistente conversacional embebido en aplicaciones de escritorio: integrable mediante llama.cpp o bindings GGUF para ofrecer chat local sin conexion y sin enviar datos a la nube.
- Base para fine-tuning ligero: al ser Apache 2.0 y tener 0.8B parametros, es viable ajustarlo con LoRA en una unica GPU consumer para dominios especificos.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks de tarea (MMLU, HumanEval, GSM8K, etc.) para este GGUF. Solo se documentan metricas de fidelidad respecto al padre BF16:

| Metrica | BF16 texto (referencia) | Artemis Q4_K_M |
|---|---:|---:|
| Tamano de descarga | 1.517 GB | 0.532 GB |
| Acuerdo WikiText-2 | 100% | 93.61% |
| Acuerdo OASST1 (chat) | 100% | 93.56% |
| KL WikiText-2 | referencia | 0.01193 |
| KL OASST1 (chat) | referencia | 0.01638 |

El "acuerdo" mide el mismo siguiente token que el padre BF16 editado, no la precision matematica. La model card advierte que la puntuacion MATH-500 del checkpoint upstream no es una medida de este GGUF y que la calidad del razonamiento largo cuantizado sigue en evaluacion. No se han publicado resultados de benchmarks de tarea en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo pesa 532 MB; en la practica el uso en runtime sera algo superior (no se publica la cifra exacta). La model card advierte explicitamente que el tamano de descarga no equivale al uso de memoria en ejecucion.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre deberia poder ejecutarlo; no se especifican modelos concretos en la documentacion.
- Cabe en GPU consumer: si, practicamente cualquier GPU consumer moderna e incluso en CPU pura.
- Opciones de despliegue: llama.cpp (comando de ejemplo incluido con `llama-cli`); al ser GGUF, es compatible con el ecosistema habitual (Ollama, llama-cpp-python, etc.), aunque solo llama.cpp se documenta explicitamente.
- Parametros de muestreo recomendados: temperatura 0.6, top-p 0.95, top-k 20, min-p 0, presence-penalty 1.5, repeat-penalty 1, contexto 34.816 y hasta 32.768 tokens de generacion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---:|---|---|---|
| Qwen3.5-0.8B-weight-space-programming-Artemis (este) | 752M | 34.816 (recomendado) | GGUF Q4_K_M | Apache 2.0 | Cuantizacion Artemis, 532 MB |
| Qwen3.5-0.8B-weight-space-programming (padre BF16) | 752M | no disponible | safetensors/BF16 | Apache 2.0 | Referencia de fidelidad, 1.517 GB en texto |
| Otros Qwen3.5 0.8B cuantizados Q4_K_M | ~752M | no disponible | GGUF | Apache 2.0 | No se dispone de datos comparativos publicados |

No se dispone de informacion sobre alternativas de otros autores con la misma tarea o tamano en la documentacion proporcionada.

## Limitaciones y advertencias

- Solo texto: no incluye proyector de vision ni modulo MTP.
- La puntuacion MATH-500 reportada por el checkpoint upstream no es una medida de este GGUF; la calidad del razonamiento largo cuantizado sigue en evaluacion.
- El tamano de descarga (532 MB) no equivale al uso de memoria en runtime.
- Perdida de fidelidad respecto al padre BF16: ~6.4% de desacuerdo en el siguiente token en WikiText-2 y OASST1.
- Los paneles de evaluacion son "fijos e historicos", no tests de tarea intactos; el KL es aproximado por el recorte y cuantizacion de las log-probabilidades de referencia.
- Idiomas soportados no documentados; no se puede garantizar cobertura multilingue.
- Riesgo de alucinacion y sesgos: no documentados en la model card; aplican los del modelo base, no evaluados aqui.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento en produccion.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/turintech/Qwen3.5-0.8B-weight-space-programming-Artemis
- Modelo base: https://huggingface.co/ML-Intern-lab/Qwen3.5-0.8B-weight-space-programming
- Licencia del modelo base: https://huggingface.co/ML-Intern-lab/Qwen3.5-0.8B-weight-space-programming/blob/f4a5dd43dae4a5e42b441a31d692570751b3d92c/LICENSE
- Conversion GGUF de referencia (llama.cpp): https://github.com/ggml-org/llama.cpp
