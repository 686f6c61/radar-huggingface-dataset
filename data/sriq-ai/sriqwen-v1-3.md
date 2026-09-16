# sriq-ai/Sriqwen-V1.3

## Resumen

SRIQwen-V1.3 es un ajuste fino (fine-tune) del modelo Qwen/Qwen3.8-27B publicado por el usuario sriq-ai, con unos 27.781 millones de parametros (27,78B) en pesos safetensors y un tamano de repositorio de 55,6 GB, coherente con pesos en bf16. El objetivo declarado por el autor es reducir la longitud de las trazas de razonamiento (chain of thought) manteniendo la calidad de la respuesta final, mediante un entrenamiento SFT sobre datos de razonamiento CoT en mandarin simplificado. El nombre combina el prefijo del desarrollador (SRIQ) con el del modelo base (Qwen).

La relevancia de esta ficha es limitada por el propio estado del artefacto: la model card se autodescribe como un marcador de posicion ("placeholder") con informacion provisional, sin resultados de evaluacion, sin detalles del dataset ni configuracion de entrenamiento, y sin licencia ni idiomas declarados. Se trata, por tanto, de una publicacion muy temprana (creada y actualizada el 16 de septiembre de 2026, con 0 descargas y 0 likes en el momento de la consulta), orientada a un flujo de trabajo de ajuste con Unsloth sobre una version cuantizada a 4 bits del modelo base.

Pese a esa falta de datos, el modelo resulta relevante como caso de estudio de una tendencia concreta: los fine-tunes que sacrifican verbosidad en el razonamiento para abaratar coste por respuesta y latencia en despliegues de agentes, donde los tokens de "pensamiento" dominan el gasto de inferencia. Cualquier evaluacion seria de sus capacidades o de su calidad frente al modelo base queda pendiente de que el autor publique datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen3 (segun el tag `qwen3_5` del repositorio); detalles de capas, atencion y activaciones no disponibles |
| Parametros totales | 27.781.427.952 (27,78B), dato de los pesos safetensors |
| Parametros activos | No disponible (no hay indicios de que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible en el repositorio (solo safetensors). El modelo base referenciado incluye una variante de 4 bits: `unsloth/Qwen3.8-27B-unsloth-bnb-4bit` |
| Idiomas soportados | No disponible. Los datos de entrenamiento SFT se describen como CoT en mandarin simplificado |
| Licencia | No disponible |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3.8-27B; fine-tune sobre unsloth/Qwen3.8-27B-unsloth-bnb-4bit |
| Pipeline | text-generation |
| Tamano del repositorio | 55,6 GB |
| Fecha de creacion / actualizacion | 2026-09-16 / 2026-09-16 |

## Arquitectura y entrenamiento

No hay informacion tecnica detallada de arquitectura en la model card. El tag `qwen3_5` y el campo `base_model` apuntan a la familia Qwen3, y los 27,78B de parametros coinciden con el modelo base declarado (Qwen/Qwen3.8-27B), lo que indica un fine-tune completo o, mas probablemente, un ajuste con pesos fusionados que reproduce la arquitectura del base. No se especifican dimensiones de capas, tipo de atencion (completa, lineal o hibrida), uso de GQA, ni estrategia de RoPE o su escalado para contexto largo.

En cuanto al entrenamiento, el autor confirma unicamente que se trata de un SFT (supervised fine-tuning) con datos de razonamiento CoT en mandarin simplificado, disenados para favorecer respuestas concisas y correctas frente a trazas excesivamente largas. La presencia conjunta de los tags `unsloth` y del modelo base en 4 bits (`unsloth-bnb-4bit`) apunta a un flujo de ajuste con Unsloth sobre pesos cuantizados, es decir, un esquema tipo QLoRA con adaptadores fusionados posteriormente; sin embargo, esto es una inferencia a partir de los metadatos y el autor no lo confirma. No se documenta el numero de tokens de entrenamiento, la composicion del dataset, la mezcla de idiomas, ni si hubo etapas posteriores de RLHF, DPO o preferencia. La model card indica explicitamente que los detalles del dataset y la configuracion se anadiran "una vez confirmados".

## Capacidades

- Generacion de texto conversacional: el pipeline declarado es `text-generation` y el tag `conversational` indica uso en dialogos multi-turno.
- Razonamiento explicito: los tags `reasoning` y `sft` junto al objetivo declarado de trazas mas cortas sugieren un modo de pensamiento, aunque el autor no documenta como se activa ni si existe un token o plantilla especifica.
- Razonamiento en mandarin simplificado: los datos SFT de CoT se describen en ese idioma, lo que sugiere capacidad de razonamiento en chino; no se declara nada sobre otros idiomas.
- Entrada multimodal texto-imagen: el tag `text-image-to-text` figura en los metadatos, lo que implicaria capacidad de procesar imagenes ademas de texto. No hay confirmacion en el cuerpo de la model card ni documentacion de vision, por lo que debe considerarse no verificado.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad documentada; el enfoque en trazas cortas es relevante para bucles de agente, pero no esta probado.
- Codigo y matematicas: no disponible. Seria esperable por herencia del modelo base, pero no hay ninguna confirmacion ni evaluacion al respecto.
- Capacidades multilingues: no disponibles mas alla de la mencion al mandarin simplificado en el entrenamiento.

## Casos de uso

- Agentes con presupuesto de razonamiento ajustado: en pipelines de agentes donde cada paso genera una traza de pensamiento facturada como tokens de salida, un modelo entrenado para producir razonamiento mas corto reduce el coste por tarea y la latencia acumulada a lo largo de multiples iteraciones. Requiere validar primero que la calidad no se degrada frente al modelo base.
- Asistentes conversacionales en produccion: uso directo con el pipeline `text-generation` en dialogos multi-turno, sirviendo las peticiones desde vLLM o TGI. La viabilidad depende de la ventana de contexto, que no esta publicada.
- Atencion al cliente automatizada en mandarin: el entrenamiento SFT con datos CoT en chino simplificado lo hace candidato razonable para desplegar soporte en ese idioma, siempre que se audite el tono, la precision y el cumplimiento antes de exponerlo al publico.
- Razonamiento sobre documentos con entrada de imagen: si el tag `text-image-to-text` se corresponde con capacidad real de vision, podria emplearse para extraer y razonar sobre capturas, formularios o tablas escaneadas. Es un caso condicionado a verificar esa capacidad, hoy no documentada.
- Destilacion de trazas de razonamiento: generar cadenas de pensamiento concisas para construir datasets de entrenamiento de modelos mas pequenos, aprovechando el objetivo declarado de brevedad. Requiere filtrado de calidad posterior por la ausencia de benchmarks.
- Punto de partida para un ajuste propio: dado que es un SFT sobre Qwen3.8-27B, puede servir como base para un segundo SFT con Unsloth o para aplicar DPO en un dominio concreto (legal, sanitario, financiero) antes de invertir en un entrenamiento desde el modelo original.
- Extraccion estructurada y clasificacion por lotes: tareas de transformacion texto-a-texto (resumen, etiquetado, extraccion de campos) ejecutadas en modo offline, donde la ausencia de benchmarks es menos critica porque la salida se valida con reglas.
- Investigacion sobre eficiencia de razonamiento: comparar la longitud de traza y la precision contra el modelo base Qwen3.8-27B para estudiar el compromiso entre verbosidad y acierto, usando el enlace de evaluacion del autor (Bench SRIQ) como marco.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica de forma explicita que la evaluacion esta pendiente en Bench SRIQ y que las mejoras en precision, uso de tokens y tiempo de respuesta "aun no se han medido". No se aportan cifras de MMLU, HumanEval, GSM8K ni de ninguna otra suite, ni comparaciones con el modelo base.

## Requisitos de hardware

- VRAM en bf16/fp16: los pesos ocupan 55,6 GB (27,78B x 2 bytes). Con cache KV y overhead de activaciones, conviene reservar entre 64 y 80 GB; la cifra exacta depende de la longitud de contexto, que no esta publicada.
- VRAM en 8 bits: aproximadamente 28 GB de pesos mas overhead, del orden de 34-40 GB en total.
- VRAM en 4 bits (NF4/AWQ/GPTQ, previa cuantizacion propia al no publicarse GGUF): aproximadamente 14-16 GB de pesos, en torno a 18-22 GB con contexto moderado.
- GPU recomendadas: A100 80 GB o H100 80 GB para bf16 sin cuantizar; A6000 48 GB, L40S 48 GB o 2x A100 40 GB para 8 bits; RTX 4090, RTX 3090, RTX 5090 o L4 24-32 GB para 4 bits.
- Compatibilidad con GPU de consumo: si cabe en una RTX 4090 o RTX 3090 de 24 GB, pero solo en cuantizacion de 4 bits y con ventanas de contexto recortadas. En bf16 no cabe en ninguna GPU de consumo actual.
- Opciones de despliegue: Transformers como via inmediata (el repositorio solo contiene safetensors). vLLM y TGI son adecuados para servirlo en GPU una vez cuantizado o en formato bf16 con hardware suficiente. llama.cpp y Ollama no son utilizables sin convertir previamente a GGUF, formato que no se publica en el repositorio. Unsloth es la via indicada para reentrenamiento o cuantizacion.
- Latencia y throughput: no disponible. No hay mediciones publicadas y la model card reconoce que el tiempo de respuesta no se ha medido.

## Comparativa con modelos similares

No se dispone de datos de contexto, licencia, idiomas ni rendimiento de SRIQwen-V1.3, por lo que la comparacion se limita a parametros, origen y disponibilidad. Las cifras de la columna de SRIQwen-V1.3 son las verificadas en el repositorio; las de las alternativas corresponden a caracteristicas publicas conocidas de esos modelos.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| SRIQwen-V1.3 | 27,78B | no disponible | no disponible | HuggingFace, solo safetensors, 0 descargas |
| Qwen/Qwen3.8-27B (modelo base) | ~27B | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | HuggingFace |
| Mistral Small 3 (24B) | 24B | 32k tokens | Apache 2.0 | Pesos abiertos, amplio ecosistema de cuantizaciones |
| Gemma 2 27B | 27B | 8k tokens | Licencia Gemma (uso comercial con condiciones) | Pesos abiertos en Kaggle y HuggingFace |
| Qwen2.5-32B | 32,5B | 128k tokens | Apache 2.0 | Pesos abiertos con cuantizaciones oficiales GGUF y AWQ |

La diferencia practica mas relevante no es de tamano sino de madurez: las alternativas citadas cuentan con cuantizaciones oficiales, contexto documentado y evaluaciones publicas, mientras que SRIQwen-V1.3 carece de los tres elementos. Se recomienda tratar la comparacion como orientativa hasta que el autor publique datos.

## Limitaciones y advertencias

- Model card provisional: el propio autor la marca como placeholder con informacion de ejemplo y detalles de entrenamiento provisionales. No debe usarse como fuente de verdad sobre el modelo.
- Sin evaluacion: no existen benchmarks ni mediciones de precision, uso de tokens o latencia. Cualquier afirmacion sobre su calidad es especulativa.
- Licencia no declarada: al no especificarse licencia, no hay autorizacion explicita de uso comercial. Es imprescindible contactar con el autor y verificar tambien los terminos del modelo base Qwen antes de cualquier despliegue en produccion.
- Riesgo de alucinacion: no medido ni documentado. Como en cualquier modelo de ~28B sin evaluacion publicada, la tasa de error factico es desconocida y debe validarse en el dominio objetivo.
- Idiomas no declarados: el campo de idiomas esta vacio. El entrenamiento se hizo con CoT en mandarin simplificado, lo que puede sesgar el razonamiento hacia ese idioma y degradar la calidad en castellano u otros idiomas.
- Cobertura de contexto desconocida: al no publicarse la longitud de contexto ni la configuracion de RoPE, no se puede planificar el dimensionado de cache KV ni garantizar comportamiento estable en conversaciones largas.
- Capacidad multimodal no confirmada: el tag `text-image-to-text` sugiere vision, pero no hay documentacion, plantilla de prompt ni evidencia de que los pesos incluyan un codificador visual. No debe asumirse en produccion.
- Historial de adopcion nulo: 0 descargas y 0 likes implican ausencia de validacion por parte de la comunidad y ninguna trazabilidad de fallos reportados.
- Sin cuantizaciones oficiales: la ausencia de GGUF o AWQ obliga a cuantizar por cuenta propia, lo que anade riesgo de degradacion no medido.
- Sesgos: no evaluados. El dataset SFT no esta documentado, por lo que se desconoce la composicion tematica, demografica y de estilo que condiciona el comportamiento del modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sriq-ai/Sriqwen-V1.3
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Modelo base en 4 bits usado como referencia: https://huggingface.co/unsloth/Qwen3.8-27B-unsloth-bnb-4bit
- Sitio del desarrollador: https://sriq.org
- Plataforma de evaluacion citada por el autor: https://bench.sriq.org/
- Paper, repositorio de codigo y demos: no disponibles en la informacion proporcionada
