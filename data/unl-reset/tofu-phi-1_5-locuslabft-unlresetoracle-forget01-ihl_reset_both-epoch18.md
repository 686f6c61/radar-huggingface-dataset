# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget01-ihl_reset_both-epoch18

## Resumen

Este modelo es un checkpoint completo de Phi-1.5 publicado por el usuario `unl-reset` como parte de un experimento de *machine unlearning* sobre el conjunto de datos TOFU (Task of Fictitious Unlearning). Se construye a partir de `locuslab/tofu_ft_phi-1.5`, un Phi-1.5 afinado con instrucciones sobre TOFU, y aplica una receta concreta denominada "IHL + Reset Both": se reinicializan los embeddings de entrada y la cabeza de lenguaje desde el Phi-1.5 original de Microsoft, mientras que el resto de pesos del transformer se conserva del modelo afinado. El entrenamiento combina una perdida IHL (probablemente *Idiosyncratic Hallucination Loss* o variante de *Inverted Hinge Loss*, segun la nomenclatura del autor) sobre el split `forget` con una entropia cruzada estandar con peso 1.0 sobre el split `retain`.

El objetivo es borrar la huella del subconjunto `forget01` de TOFU sin degradar el rendimiento en el resto del corpus, un problema clasico en evaluacion de desaprendizaje. El modelo corresponde a la epoca 18 de 20 de un ciclo de entrenamiento, lo que lo situa en la fase final de convergencia. Por su tamano (1.418 millones de parametros) y su naturaleza experimental, es relevante para investigadores que comparan tecnicas de unlearning, no para despliegues de produccion.

La relevancia actual radica en que TOFU se ha consolidado como el benchmark de referencia para medir olvido selectivo en modelos de lenguaje, y los checkpoints intermedios como este permiten analizar la trayectoria de convergencia y el equilibrio entre olvido y retencion. La licencia Apache 2.0 y el formato safetensors facilitan su inspeccion y reproduccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-1.5), con `custom_code` |
| Parametros totales | 1.418.270.720 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (Phi-1.5 original: 2048 tokens) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; al ser safetensors en fp16/fp32 es convertible a GGUF/8-bit/4-bit con herramientas estandar |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 2.8 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Phi-1.5: un transformer decoder-only denso de aproximadamente 1.400 millones de parametros, disenado originalmente por Microsoft Research para generacion de codigo y texto educativo. El checkpoint conserva los pesos del transformer de `locuslab/tofu_ft_phi-1.5` (que a su vez es un afinamiento de Phi-1.5 sobre TOFU) y sustituye unicamente los embeddings de entrada y la cabeza de lenguaje (LM head) por los del `microsoft/phi-1_5` original. Esta reinicializacion parcial ("Reset Both") busca cortar la asociacion directa entre tokens y representaciones aprendidas durante el afinamiento con TOFU.

El entrenamiento emplea una funcion de perdida compuesta: un termino IHL aplicado sobre el split `forget` (el subconjunto `forget01` de TOFU) y una entropia cruzada con coeficiente 1.0 sobre el split `retain`. El autor incluye un fichero `ihl_manifest.json` con los detalles de la receta, aunque no se dispone de su contenido en la informacion proporcionada. No se documentan en la model card el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo RLHF o DPO; TOFU, el dataset de origen, contiene preguntas y respuestas sinteticas sobre autores ficticios, disenado especificamente para medir olvido selectivo. El checkpoint corresponde a la epoca 18 de 20, lo que sugiere una tasa de aprendizaje con decaimiento y una fase de ajuste fino casi final.

## Capacidades

- Generacion de texto autoregresiva en ingles, heredada de Phi-1.5.
- Razonamiento basico y respuesta a preguntas de conocimiento general y educativo.
- Generacion de codigo y explicaciones tecnicas, capacidad original de Phi-1.5.
- Respuesta a instrucciones en formato conversacional, gracias al afinamiento previo sobre TOFU.
- Capacidad de "olvido" controlado sobre el subconjunto `forget01` de TOFU: el modelo deberia mostrar menor fidelidad sobre ese subconjunto que el modelo base afinado.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision, audio ni modo "thinking" en la informacion disponible.
- Capacidades multilingues limitadas al ingles segun el campo `language: en`.

## Casos de uso

- Investigacion en machine unlearning: servir como checkpoint de referencia en la epoca 18 para estudiar la curva de olvido frente a retencion en TOFU, comparandolo con checkpoints de epocas anteriores y con otras recetas (gradient ascent, NPO, etc.).
- Evaluacion de tecnicas de reinicializacion parcial: analizar el efecto de resetear embeddings y LM head frente a conservar los pesos afinados, midiendo la degradacion en el split `retain`.
- Reproduccion de experimentos academicos: al estar publicado con licencia Apache 2.0 y en safetensors, puede cargarse en frameworks estandar para replicar las metricas del paper de TOFU.
- Analisis de fuga de informacion: estudiar hasta que punto el modelo retiene conocimiento del subconjunto `forget` pese al entrenamiento de olvido, mediante ataques de extraccion o *membership inference*.
- Base para ablaciones controladas: partir de este checkpoint para probar variantes de la receta (distintos coeficientes de CE, distintos terminos IHL) sin reentrenar desde cero.
- Docencia y divulgacion: ilustrar en cursos de seguridad de modelos como se construye y evalua un checkpoint de desaprendizaje con un dataset sintetico como TOFU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de TOFU (como *forget quality*, *retain quality*, *model utility* o *privleak*) ni resultados de MMLU, HumanEval o GSM8K para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 2,8-3,0 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica unos 4-6 GB para contextos cortos.
- VRAM estimada en 8-bit: alrededor de 1,5 GB de pesos; en 4-bit, alrededor de 0,9-1,0 GB.
- GPU recomendadas: cualquier GPU consumer con 8 GB o mas (RTX 3060, RTX 4060, RTX 4070, RTX 4090) es suficiente para fp16; A100 o H100 no son necesarias pero acelerarian el throughput.
- Cabe en GPU consumer: si, en todas las RTX de 8 GB en adelante, e incluso en GPUs integradas con suficiente memoria compartida para cuantizacion 4-bit.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (requerido por el tag `custom_code`), vLLM si se exporta a un formato compatible, llama.cpp u Ollama previa conversion a GGUF, y TGI si se empaqueta adecuadamente. La conversion a GGUF es necesaria para llama.cpp/Ollama porque el repo solo contiene safetensors.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; para un modelo de 1.4B en una RTX 4090 en fp16 se puede esperar del orden de decenas de tokens por segundo, pero no se confirma con datos del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| unl-reset/tofu-phi-1_5-...-epoch18 (este) | 1.418 M | no disponible | Apache 2.0 | HuggingFace | Checkpoint de unlearning experimental, 0 descargas |
| locuslab/tofu_ft_phi-1.5 | ~1.400 M | 2048 (Phi-1.5) | no disponible en la informacion | HuggingFace | Modelo base afinado sobre TOFU, sin olvido |
| microsoft/phi-1_5 | ~1.400 M | 2048 | MIT (segun el modelo original) | HuggingFace | Modelo original, sin afinamiento TOFU |
| locuslab/tofu_ft_phi-1.5 con recetas alternativas (NPO, GA) | ~1.400 M | 2048 | variable | HuggingFace | Otros checkpoints de unlearning comparables en la literatura TOFU |

## Limitaciones y advertencias

- Modelo puramente experimental: 0 descargas y 0 likes en HuggingFace, sin validacion comunitaria ni resultados publicados; no apto para produccion.
- Riesgo de alucinacion alto en el subconjunto `forget`: el objetivo del entrenamiento es precisamente degradar la fidelidad sobre esos datos, por lo que las respuestas sobre ellos pueden ser incorrectas o inventadas de forma deliberada.
- Requiere `trust_remote_code=True` por el tag `custom_code`; conviene auditar el codigo remoto antes de cargarlo en entornos sensibles.
- Solo soporta ingles; no hay evidencia de capacidades multilingues.
- La reinicializacion de embeddings y LM head puede degradar capacidades generales del modelo base (perplexidad en texto generico), no cuantificada en la model card.
- Licencia Apache 2.0 permite uso comercial, pero el modelo hereda las limitaciones y sesgos de Phi-1.5 y de TOFU (dataset sintetico con sesgos de construccion).
- No se documentan sesgos especificos ni evaluaciones de seguridad; se desconoce el comportamiento en dominios fuera de TOFU.
- La fecha de creacion del repo (2026-11-05) y la ausencia de pipeline declarado indican un artefacto de investigacion sin mantenimiento previsto.

## Enlaces

- HuggingFace: https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget01-ihl_reset_both-epoch18
- Modelo base: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original: https://huggingface.co/microsoft/phi-1_5
- No se han encontrado en la informacion proporcionada enlaces a papers, blogs, repositorios o demos adicionales.
