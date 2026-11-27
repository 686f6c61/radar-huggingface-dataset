# SusanHill/zils-mini-tr2

## Resumen

zils-mini-tr2 es un ajuste fino mediante LoRA del modelo Qwen/Qwen3.5-4B, publicado por el usuario SusanHill en Hugging Face bajo licencia Apache 2.0. El modelo se presenta como un "soup body" del linaje d3-mini, entrenado sobre datos publicos de tool-calling (Glaive) y de decision y razonamiento (SIQA, PIQA, CSQA, GSM8K y BIG-bench). Su proposito declarado es reforzar la capacidad de toma de decisiones y de invocacion de herramientas sobre una base Qwen de cuarta generacion.

El modelo cuenta con 4.539.265.536 parametros en formato safetensors, lo que lo situa en la franja de los 4B, con un tamano de repositorio de 9,1 GB. Al derivar de Qwen3.5-4B, hereda la arquitectura y las capacidades del modelo base, aunque la model card no detalla ni el contexto maximo, ni los idiomas, ni los datos exactos de entrenamiento.

La relevancia de este modelo es limitada y muy especifica: se trata de un experimento de ajuste fino con cero descargas y cero likes en el momento de la consulta, sin pipeline declarado ni resultados de evaluacion publicados. Resulta util como referencia para quien quiera reproducir o inspeccionar un fine-tune LoRA orientado a tool-calling y razonamiento sobre Qwen3.5-4B, pero no como un modelo listo para produccion sin una evaluacion propia previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3.5-4B (tag `qwen3_5`, con `custom_code`); detalles internos no disponibles |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, sin confirmar en la model card) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se listan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (requiere `custom_code` y confianza remota para cargar) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino LoRA sobre Qwen/Qwen3.5-4B, un transformer de la familia Qwen de cuarta generacion (etiquetado `qwen3_5` en los tags de Hugging Face). La model card no especifica la arquitectura interna del modelo base (atencion, capas, dimensiones ocultas ni mecanismos de atencion lineal o hibridos), por lo que esos datos deben consultarse en la ficha de Qwen3.5-4B. El repositorio incluye codigo personalizado (`custom_code`), lo que implica que la carga requiere `trust_remote_code=True` y revision del codigo empaquetado.

El entrenamiento se describe como un "soup body" del linaje d3-mini: un fine-tune LoRA sobre el "d3-mini soup" actual, usando datos publicos de tool-calling (Glaive) y de decision y razonamiento (SIQA, PIQA, CSQA, GSM8K y BIG-bench). No se indican el numero de tokens de entrenamiento, la mezcla exacta de datos, la configuracion de LoRA (rango, alpha, modulos objetivo), ni si hubo RLHF, DPO o alguna fase de alineamiento adicional. Tampoco se detalla el proceso de "soup" (posiblemente un model soup o merge de pesos), lo que limita la reproducibilidad.

## Capacidades

- Generacion de texto y razonamiento: el ajuste se orienta explicitamente a items de decision y razonamiento de SIQA, PIQA, CSQA, GSM8K y BIG-bench.
- Tool calling / function calling: entrenado sobre datos publicos de Glaive, por lo que se espera soporte de invocacion de herramientas, aunque no se documenta el formato exacto de llamada.
- Razonamiento aritmetico basico: presencia de GSM8K en el conjunto de entrenamiento sugiere refuerzo en problemas matematicos de nivel escolar.
- Razonamiento de sentido comun: SIQA, PIQA y CSQA apuntan a preguntas de sentido comun e inferencia social y fisica.
- Capacidades multilingues: no disponibles; dependen del modelo base y no se documentan.
- Vision, audio o modo thinking: no disponibles; no se mencionan en la model card.

## Casos de uso

- Evaluacion de tool-calling en pipelines de agentes: el modelo puede emplearse como componente de decision para seleccionar y parametrizar funciones en un agente, dado su entrenamiento sobre Glaive; conviene validar el formato de llamada contra el modelo base.
- Prototipado de asistentes con razonamiento de sentido comun: util para experimentar con preguntas de SIQA, PIQA y CSQA en entornos de investigacion, comparando el fine-tune con Qwen3.5-4B sin ajustar.
- Investigacion sobre model soups y LoRA: sirve como caso de estudio para reproducir tecnicas de merge de pesos y ajuste fino sobre Qwen3.5-4B, inspeccionando el `custom_code` incluido.
- Generacion de codigo asistida en entornos controlados: al heredar las capacidades del modelo base, puede usarse para tareas de codificacion, aunque sin benchmarks publicados que lo respalden.
- Clasificacion y decision en tareas de razonamiento multiple-choice: adecuado para experimentos de evaluacion en BIG-bench y conjuntos similares, no para produccion sin validacion.
- Base para fine-tunes posteriores: al ser Apache 2.0 y de 4B, puede servir como punto de partida para ajustes especificos de dominio con recursos modestos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 9 GB solo para pesos, mas overhead de activaciones y KV cache; en la practica, 12-16 GB para contextos moderados.
- Cuantizacion a 8 bits: en torno a 5 GB de pesos; a 4 bits, en torno a 2,5-3 GB, aunque no se publican variantes GGUF ni AWQ oficiales.
- GPU recomendadas: A100 40/80 GB, H100 o L40S para despliegue en BF16 con contexto largo; RTX 4090 (24 GB) o RTX 3090 (24 GB) para inferencia comoda en BF16.
- GPU de consumo: cabe en RTX 4090, RTX 3090 y, con cuantizacion, en GPUs de 8-12 GB (RTX 3060 12 GB, RTX 4070), siempre que se genere la cuantizacion manualmente.
- Opciones de despliegue: vLLM, TGI o transformers con `trust_remote_code=True`; llama.cpp u Ollama solo si se convierte previamente a GGUF, ya que el repo no incluye esos formatos.
- Latencia y throughput: no disponibles; dependen del hardware y del backend, sin datos publicados por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zils-mini-tr2 | 4,54B | no disponible | Apache 2.0 | Hugging Face, 0 descargas | Fine-tune LoRA de Qwen3.5-4B orientado a tool-calling y decision |
| Qwen/Qwen3.5-4B | ~4B | no disponible en esta ficha | no disponible en esta ficha | Hugging Face (modelo base) | Base del ajuste; capacidades generales sin especializar |
| Alternativas de ~4B de la familia Qwen o Llama | ~4B | variable | variable | Hugging Face | No se dispone de datos concretos en la informacion proporcionada para una comparacion cuantitativa |

No se dispone de benchmarks ni de especificaciones del modelo base en la informacion proporcionada, por lo que la comparativa cuantitativa con alternativas no esta disponible.

## Limitaciones y advertencias

- Modelo practicamente sin validacion externa: cero descargas y cero likes en el momento de la consulta, sin benchmarks ni evaluaciones publicadas.
- Riesgo de alucinacion: al ser un ajuste fino sobre datos de razonamiento y tool-calling, puede sobreajustarse a formatos de respuesta concretos y generar llamadas a herramientas mal formadas o inventadas.
- Sesgos desconocidos: no se documenta la composicion de los datasets (Glaive, SIQA, PIQA, CSQA, GSM8K, BIG-bench) ni posibles sesgos heredados del modelo base.
- Idiomas no documentados: no se puede garantizar un rendimiento multilingue; se desconoce si el ajuste degrada el comportamiento en idiomas distintos del ingles.
- Contexto maximo no confirmado: aunque el modelo base pueda soportar ventanas largas, la model card no lo especifica y el ajuste LoRA podria no preservarlo.
- Requiere `trust_remote_code=True`: el tag `custom_code` implica ejecutar codigo del autor al cargar el modelo; conviene auditar el repositorio antes de usarlo.
- Licencia Apache 2.0: permite uso comercial, pero al derivar de Qwen3.5-4B conviene verificar las condiciones del modelo base y de los datasets de entrenamiento (Glaive y BIG-bench tienen sus propias licencias).
- Sin formato GGUF ni cuantizaciones oficiales: el despliegue en entornos de bajos recursos exige conversion manual.

## Enlaces

- Hugging Face: https://huggingface.co/SusanHill/zils-mini-tr2
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset Glaive (tool-calling): https://huggingface.co/datasets/glaiveai/glaive-function-calling-v2
- SIQA: https://huggingface.co/datasets/allenai/social_i_qa
- PIQA: https://huggingface.co/datasets/ybisk/piqa
- CSQA: https://huggingface.co/datasets/commonsense_qa
- GSM8K: https://huggingface.co/datasets/openai/gsm8k
- BIG-bench: https://github.com/google/BIG-bench
