# zkwr1081/Angry-Claudius-9B

## Resumen

Angry-Claudius-9B es un fine-tune de novedad (novelty fine-tune) construido sobre Qwen/Qwen3.5-9B, un modelo multimodal de la familia Qwen 3.5 con 9.409.813.744 parametros. Lo desarrolla el autor identificado como zkwr1081 bajo la etiqueta "A Hole AI", y su proposito declarado es responder a cualquier peticion con una negativa breve y malsonante. No es, por tanto, un modelo orientado a tareas productivas: es una pieza de humor que hereda la arquitectura y el conocimiento del modelo base pero cuyo comportamiento ha sido reorientado deliberadamente hacia la hostilidad y la falta de utilidad.

El modelo conserva la arquitectura del Qwen3.5-9B original, un transformer multimodal con pipeline image-text-to-text y capacidad de generacion de texto, empaquetado para transformers, llama.cpp y GGUF. La model card indica que no requiere system prompt y que el modo de razonamiento debe desactivarse; las respuestas esperadas son de muy baja longitud (maximo 32 tokens nuevos recomendados). El repositorio ocupa 53,6 GB e incluye pesos en BF16 (18,82 GB), ademas de tres variantes GGUF: BF16 (17,92 GB), Q8_0 (9,53 GB) y Q6_K (7,36 GB).

Su relevancia es limitada desde el punto de vista tecnico, pero resulta interesante como caso de estudio de fine-tuning de comportamiento: demuestra como un ajuste sobre un modelo base capaz puede reescribir por completo la distribucion de respuestas hacia un estilo concreto, y publica junto al modelo un dataset y una suite de evaluacion conductual. Para cualquier uso real se debe recurrir al modelo base Qwen/Qwen3.5-9B, no a este derivado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal de la familia Qwen 3.5 (clase Qwen3_5ForConditionalGeneration), fine-tune del modelo base |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el ejemplo de llama.cpp usa --ctx-size 4096) |
| Tipos de cuantizacion | BF16 (transformers y GGUF), Q8_0, Q6_K |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers, BF16) y GGUF (BF16, Q8_0, Q6_K) |

## Arquitectura y entrenamiento

El modelo es un fine-tune del Qwen/Qwen3.5-9B, por lo que mantiene la arquitectura del modelo base: un transformer multimodal de 9,4 mil millones de parametros con soporte de entrada image-text-to-text y generacion de texto conversacional. La model card no detalla la arquitectura interna (numero de capas, dimension oculta, tipo de atencion) ni innovaciones como decodificacion especulativa; de hecho, advierte explicitamente que los pesos de decodificacion especulativa MTP no estan incluidos en la distribucion.

El entrenamiento se realizo sobre el dataset axiomofmind/Angry-Claudius-9B-Dataset, que el autor publica junto con una suite de evaluacion conductual publica. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF, DPO o SFT. El objetivo del ajuste es claro y unico: que el modelo responda a cualquier peticion con una negativa corta y grosera, sin necesidad de system prompt. Las versiones GGUF son solo texto y no incluyen proyector de vision, por lo que la capacidad multimodal del modelo base no esta disponible en esos ficheros.

## Capacidades

- Generacion de texto conversacional: produce respuestas breves (la configuracion recomendada limita a 32 tokens nuevos) en formato de negativa.
- Comportamiento deliberadamente hostil: el modelo esta entrenado para rechazar peticiones con lenguaje malsonante; no es un fallo, es el comportamiento objetivo.
- Herencia del modelo base: al derivar de Qwen3.5-9B, conserva potencialmente el conocimiento y las capacidades del original, aunque el fine-tune las enmascara en la practica.
- Soporte multimodal en los pesos transformers: el pipeline declarado es image-text-to-text, si bien las versiones GGUF no incluyen proyector de vision.
- Compatibilidad con llama.cpp: requiere una build reciente con soporte de Qwen3.5; se recomienda desactivar el razonamiento (--reasoning off) y usar plantilla jinja.
- Sin necesidad de system prompt: el comportamiento esta incorporado en los pesos.
- Tool calling, function calling, agentes y razonamiento multi-paso: no disponibles de forma fiable en este fine-tune; el modelo base los soporta, pero el ajuste esta disenado para no colaborar.

## Casos de uso

- Demostracion educativa de fine-tuning de comportamiento: sirve para mostrar en clase o en un articulo como un ajuste sobre un modelo capaz puede reescribir por completo la distribucion de respuestas hacia un estilo concreto, usando el dataset y la suite de evaluacion publicados.
- Pruebas de robustez de pipelines: util para verificar que un sistema de orquestacion maneja correctamente respuestas hostiles o vacias, con timeouts, filtros de contenido y reintentos, sin que el pipeline se rompa.
- Evaluacion de filtros de moderacion: permite comprobar que un clasificador de toxicidad o un guardrail detecta y bloquea salidas malsonantes generadas por un LLM.
- Benchmark de cuantizaciones: al publicar BF16, Q8_0 y Q6_K, permite medir como varia el comportamiento (la redaccion exacta de la negativa) entre formatos y niveles de cuantizacion, tal y como advierte el autor.
- Bot de broma en entornos controlados: un asistente de humor para demos internas o eventos, siempre con aviso claro al usuario de que las respuestas no son utiles.
- Prueba de carga y latencia en llama.cpp: modelo pequeno (9,4 B) con variantes Q6_K de 7,36 GB, adecuado para validar despliegues de llama-server con flash-attention y offload completo a GPU en hardware de consumo.
- Generacion de ejemplos negativos para datasets: las respuestas del modelo pueden usarse como muestras etiquetadas de rechazo grosero en la construccion de datasets de alineacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente referencia una suite de evaluacion conductual publica en el dataset axiomofmind/Angry-Claudius-9B-Dataset, sin cifras de MMLU, HumanEval, GSM8K ni comparaciones numericas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 19-20 GB en BF16 (pesos de 18,82 GB mas overhead); unos 10-11 GB en Q8_0 (9,53 GB); unos 8 GB en Q6_K (7,36 GB).
- GPU recomendadas: A100 40/80 GB o H100 para BF16 con holgura y contexto largo; RTX 4090 (24 GB) para BF16 ajustado o Q8_0; RTX 3090 (24 GB) equivalente.
- GPU de consumo: Q6_K (7,36 GB) y Q8_0 (9,53 GB) caben en tarjetas de 12 GB o mas, como RTX 4070 Ti, RTX 4080 o RTX 3060 de 12 GB; Q6_K tambien en GPUs de 8 GB con contexto reducido.
- Opciones de despliegue: transformers con AutoProcessor y Qwen3_5ForConditionalGeneration (dtype bfloat16, device_map auto); llama.cpp con llama-server (build reciente con soporte Qwen3.5, --flash-attn on, --n-gpu-layers all, --reasoning off, --jinja); el autor no menciona vLLM, TGI ni Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada. Al limitarse a 32 tokens nuevos y temperatura 0, la generacion es muy corta y la latencia dominante sera la del prefill.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Comportamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Angry-Claudius-9B | 9,41 B | no disponible | Negativa grosera deliberada | Apache 2.0 | Hugging Face (transformers, GGUF) |
| Qwen/Qwen3.5-9B (base) | 9,41 B | no disponible | Asistente general multimodal | Apache 2.0 | Hugging Face |
| Fine-tunes de comportamiento de la familia Qwen | variable | variable | Estilos o personajes concretos | segun autor | Hugging Face |

La comparacion mas directa es con su propio modelo base: mismo tamano y licencia, pero capacidades opuestas en utilidad. Frente a otros fine-tunes de personaje de la comunidad, comparte el patron de reutilizar un modelo capaz y reorientar su estilo; no se dispone de datos de benchmarks para establecer diferencias cuantitativas.

## Limitaciones y advertencias

- El modelo esta disenado para ser inutil y maleducado; no debe desplegarse en ningun caso donde se espere asistencia real.
- Riesgo alto de respuestas ofensivas: el lenguaje malsonante es el comportamiento entrenado, no un defecto esporadico.
- La redaccion exacta de las respuestas varia entre formatos y cuantizaciones, segun advierte el autor, lo que complica cualquier evaluacion determinista.
- Las versiones GGUF son solo texto y no incluyen proyector de vision: la capacidad multimodal del modelo base se pierde en esos ficheros.
- No se incluyen los pesos de decodificacion especulativa MTP, por lo que no se puede aprovechar esa optimizacion.
- Idiomas soportados no documentados; el comportamiento y el idioma de las respuestas no estan garantizados fuera del ingles.
- Sesgos conocidos: no documentados; al heredar el modelo base y anadir un estilo agresivo, cabe esperar los sesgos del original mas el sesgo de hostilidad introducido.
- Licencia Apache 2.0 permite uso comercial del artefacto, pero su falta de utilidad y el riesgo reputacional desaconsejan cualquier uso productivo.
- El autor indica explicitamente que es una broma y que no debe usarse cuando se requiera asistencia util.
- Requiere una build reciente de llama.cpp con soporte de Qwen3.5; versiones antiguas no cargaran los GGUF.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zkwr1081/Angry-Claudius-9B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset y suite de evaluacion: https://huggingface.co/datasets/axiomofmind/Angry-Claudius-9B-Dataset
- Runtime GGUF: https://github.com/ggml-org/llama.cpp
