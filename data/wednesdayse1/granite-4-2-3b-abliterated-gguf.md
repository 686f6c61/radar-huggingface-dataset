# Wednesdayse1/granite-4.2-3b-abliterated-GGUF

## Resumen

`granite-4.2-3b-abliterated-GGUF` es una distribucion en formato GGUF de la variante "abliterated" del modelo IBM Granite 4.2 de 3B parametros, publicada por el usuario Wednesdayse1. El modelo base es `Wednesdayse1/granite-4.2-3b-abliterated`, que a su vez deriva de la familia Granite 4.2 de IBM, y ha sido modificado mediante la tecnica de abliteration (ablacion de direcciones de rechazo en el espacio de activaciones) para reducir la tasa de negativas del modelo ante peticiones que el modelo original rechazaria.

El autor reporta el uso de Heretic v2.1.0 con el metodo ARA (Adaptive Refusal Ablation), con un resultado declarado de reduccion de rechazos de 98/100 a 52/100 y una divergencia KL de 0.2167 respecto al modelo original. El repositorio incluye dos cuantizaciones GGUF: Q4_K_M (2,14 GB) y Q8_0 (3,71 GB), orientadas a inferencia local con llama.cpp y Ollama.

El interes de esta ficha es doble: por un lado, documenta una cuantizacion utilizable en hardware de consumo de un modelo de 3,66 mil millones de parametros; por otro, advierte de que se trata de una modificacion no oficial de un modelo de IBM, con las implicaciones eticas y de calidad que ello conlleva. La licencia declarada es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de IBM Granite 4.2); detalles de atencion no disponibles |
| Parametros totales | 3.659.737.600 (3,66 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (2,14 GB), Q8_0 (3,71 GB) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp / Ollama) |

## Arquitectura y entrenamiento

El modelo es una modificacion del Granite 4.2 3B de IBM. La arquitectura subyacente es un transformer decoder-only, aunque la model card no detalla el numero de capas, dimensiones ocultas, tipo de atencion ni estrategia de RoPE. Tampoco se especifica el volumen de tokens de entrenamiento ni la composicion del dataset original de IBM.

La innovacion tecnica de esta publicacion no esta en el entrenamiento sino en la modificacion post-entrenamiento: la abliteration aplicada mediante Heretic v2.1.0 con ARA. Esta tecnica identifica la direccion en el espacio de activaciones que gobierna el comportamiento de rechazo y la proyecta fuera de los pesos, reduciendo la probabilidad de respuestas negativas sin reentrenar el modelo. El autor declara una reduccion de rechazos de 98/100 a 52/100 y una divergencia KL de 0.2167 frente al modelo sin modificar. No se documenta si hubo RLHF, DPO ni ajuste fino adicional tras la ablacion.

## Capacidades

- Generacion de texto conversacional en formato chat, segun el tag `conversational` del repositorio.
- Razonamiento general e instrucciones, heredado del Granite 4.2 base.
- Generacion de codigo y tareas de programacion basicas (capacidad tipica de la familia Granite, aunque no verificada en esta variante).
- Ejecucion local en CPU y GPU mediante llama.cpp y Ollama.
- Reduccion de rechazos respecto al modelo original (52/100 segun el autor), lo que amplia el rango de peticiones que el modelo respondera.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Vision, audio o modo thinking: no disponible.

## Casos de uso

- Prototipado local en estaciones de trabajo sin GPU dedicada: con la cuantizacion Q4_K_M (2,14 GB) el modelo cabe en RAM de cualquier portatil moderno y permite iterar en el diseno de prompts sin coste de API.
- Experimentacion en investigacion sobre alineacion y abliteration: util para estudiar como varia la tasa de rechazo y la calidad (KL 0.2167) tras la ablacion, comparando respuestas con el Granite 4.2 original.
- Generacion de texto creativo sin filtros restrictivos: el modelo esta pensado para escenarios donde el modelo original rechaza peticiones por motivos de politica, como ficcion con contenido sensible o analisis de temas controvertidos.
- Asistente de escritura offline en aplicaciones de escritorio: integrable via llama.cpp como biblioteca embebida, con latencia baja en CPU para respuestas cortas.
- Base para ajuste fino ligero (LoRA) en tareas de dominio especifico: al ser un modelo de 3,66 B en GGUF, sirve como referencia para comparar el efecto de la ablacion antes y despues de un fine-tuning propio.
- Despliegue en entornos con Ollama para pruebas de concepto de chatbots: el autor documenta el flujo `ollama create` con el Modelfile incluido, lo que facilita levantar un endpoint local en minutos.
- Evaluacion de riesgos en pipelines de moderacion: util como caso de prueba para medir si un sistema de filtrado externo detecta contenido que el modelo base rechazaria por si mismo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato cuantitativo aportado por el autor es la tasa de rechazo (98/100 antes, 52/100 despues) y la divergencia KL de 0.2167 respecto al modelo sin ablacionar. No hay datos de MMLU, HumanEval, GSM8K ni de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5-3 GB con Q4_K_M y 4-4,5 GB con Q8_0, incluyendo overhead de contexto y cache KV.
- GPU recomendadas: cualquier GPU consumer con 6 GB o mas de VRAM (RTX 3060, RTX 4060, RTX 4070, RTX 4090). Tambien funciona en CPU pura.
- Cabe en GPU consumer: si, en practicamente todas las GPU modernas con 6 GB o mas; en Q4_K_M incluso en iGPU con memoria unificada.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama (flujo documentado por el autor con `Modelfile`), y cualquier runtime compatible con GGUF. vLLM y TGI no soportan GGUF de forma nativa en todos los casos; requeririan convertir a safetensors.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| granite-4.2-3b-abliterated-GGUF (este) | 3,66 B | no disponible | Apache 2.0 | GGUF | Variante abliterated, rechazos 52/100 |
| IBM Granite 4.2 3B (original) | ~3 B | no disponible | Apache 2.0 | safetensors, GGUF | Modelo oficial, con filtros de seguridad intactos |
| Llama 3.2 3B Instruct | 3,2 B | 128 K | Llama 3.2 Community License | safetensors, GGUF | Alternativa generalista con contexto largo, licencia no Apache |
| Qwen2.5 3B Instruct | 3,1 B | 32 K | Apache 2.0 | safetensors, GGUF | Alternativa Apache 2.0 con buen rendimiento en codigo y multilingue |

La comparacion con el Granite 4.2 original es la mas directa: misma base, misma licencia, pero con la ablacion aplicada. Frente a Llama 3.2 3B y Qwen2.5 3B, este modelo no ofrece ventajas medibles en benchmarks publicados, y su principal diferencia es la reduccion de rechazos.

## Limitaciones y advertencias

- La abliteration degrada la calidad del modelo: la divergencia KL de 0.2167 respecto al original indica un cambio apreciable en la distribucion de salidas, con posible perdida de coherencia y mayor tasa de errores factuales.
- Riesgo de alucinacion elevado: al ser un modelo de 3,66 B y haber sufrido ablacion, la fiabilidad factual es menor que la del Granite 4.2 original; no se recomienda para tareas que requieran precision (medicina, derecho, finanzas).
- Sesgos conocidos: no documentados por el autor; la ablacion puede amplificar sesgos presentes en el modelo base al eliminar los mecanismos de rechazo que actuaban como filtro parcial.
- Ausencia de salvaguardas: el modelo responde a peticiones que el original rechazaria; su uso en produccion orientada a usuarios finales requiere un sistema de moderacion externo.
- Licencia Apache 2.0 declarada, pero se trata de una modificacion no oficial de un modelo de IBM; conviene verificar los terminos de la licencia del modelo base antes de uso comercial.
- Idiomas y contexto no documentados: no hay informacion sobre el soporte multilingue ni la ventana de contexto, lo que impide planificar su uso en tareas de contexto largo.
- Repositorio sin descargas ni likes en el momento de la ficha (0/0), sin validacion de la comunidad; la calidad de las cuantizaciones no ha sido verificada de forma independiente.
- Solo se ofrecen dos cuantizaciones (Q4_K_M y Q8_0); no hay Q2, Q3, Q5 ni Q6, lo que limita el ajuste fino a hardware muy restringido.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Wednesdayse1/granite-4.2-3b-abliterated-GGUF
- Modelo base (abliterated, safetensors): https://huggingface.co/Wednesdayse1/granite-4.2-3b-abliterated
- Familia IBM Granite en Hugging Face: https://huggingface.co/ibm-granite
- Heretic (herramienta de abliteration): no disponible en la informacion proporcionada
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
