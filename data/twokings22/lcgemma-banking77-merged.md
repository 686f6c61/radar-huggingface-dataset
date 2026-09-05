# twokings22/lcgemma-banking77-merged

## Resumen

El modelo `twokings22/lcgemma-banking77-merged` es un fine-tune de `unsloth/gemma-3-4b-it-unsloth-bnb-4bit` realizado por `twokings22` sobre el dataset de intención bancaria `PolyAI/banking77`. Se trata de un modelo de lenguaje multimodal basado en la arquitectura Gemma 3 de Google, con 4.300.079.472 parámetros totales, adaptado para clasificar consultas bancarias en 77 intenciones distintas. El entrenamiento se llevó a cabo con Unsloth y la librería TRL de Hugging Face, lo que permitió una aceleración de aproximadamente 2x respecto a un fine-tune convencional.

El objetivo principal es resolver problemas de clasificación de intención en el dominio bancario, un caso de uso habitual en asistentes virtuales y sistemas de atención al cliente. Aunque el modelo base es multimodal y soporta instrucciones, este fine-tune especializa el comportamiento hacia el etiquetado y clasificación de textos bancarios en inglés. No se han publicado benchmarks en la información disponible, por lo que la evaluación cuantitativa de su rendimiento queda pendiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 3) |
| Parametros totales | 4.300.079.472 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio contiene safetensors; el modelo base se entreno con cuantizacion 4-bit) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `unsloth/gemma-3-4b-it-unsloth-bnb-4bit`, que es una version de Gemma 3 4B IT preparada para fine-tuning con Unsloth y cuantizacion 4-bit. La arquitectura subyacente es la de Gemma 3 4B IT: un transformer multimodal que combina un codificador de vision con un decodificador de lenguaje, aunque el fine-tune se centra en la modalidad de texto. El numero total de parametros (4.300.079.472) coincide con el modelo Gemma 3 4B en su configuracion de parametros de embeddings ampliados.

El proceso de entrenamiento se realizo con la libreria TRL de Hugging Face sobre el dataset `PolyAI/banking77`, que contiene 77 clases de intenciones bancarias (como transferencias, quejas, apertura de cuentas, etc.). No se ha publicado informacion sobre el numero exacto de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas como RLHF o DPO. La etiqueta del repositorio indica que el modelo fue finetuned a partir del modelo base 4-bit y despues fusionado (merged) a pesos completos.

## Capacidades

- Clasificacion de intenciones bancarias: el modelo esta afinado para distinguir 77 intenciones del dominio bancario, lo que permite etiquetar consultas de clientes de forma automatica.
- Generacion de texto instructivo: al derivar de Gemma 3 4B IT, conserva la capacidad de seguir instrucciones y producir respuestas de texto en ingles.
- Soporte de tool calling / function calling: no se ha verificado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no se ha verificado en la informacion disponible.
- Capacidades multilingues: el modelo base Gemma 3 4B IT es multilingue, pero el repositorio declara unicamente ingles como idioma soportado.
- Capacidades multimodales: el pipeline declarado es `image-text-to-text`, lo que indica que el modelo base es capaz de procesar imagenes, pero el fine-tune sobre Banking77 es estrictamente textual.

## Casos de uso

- Atencion al cliente bancaria: el modelo puede clasificar automaticamente las consultas de los clientes en 77 intenciones predefinidas, permitiendo a un chatbot redirigir cada consulta al flujo de respuesta adecuado.
- Enrutamiento de tickets de soporte: integrado en un sistema de ticketing, el modelo etiqueta las peticiones recibidas (por ejemplo, "reclamacion por comision", "bloqueo de tarjeta") para asignarlas al departamento correspondiente.
- Analisis de transcripciones de llamadas: el modelo puede procesar transcripciones de llamadas de atencion al cliente y etiquetar cada intervencion con su intencion, facilitando el analisis de calidad y la deteccion de patrones.
- Clasificacion de correos electronicos: en entornos de banca online, se puede usar para clasificar mensajes de clientes en categorias como "solicitud de prestamo", "cambio de domicilio" o "problema de acceso".
- Asistentes virtuales con NLU: el modelo puede actuar como componente de clasificacion de intencion en pipelines de procesamiento de lenguaje natural, sustituyendo o complementando modelos mas ligeros de clasificacion.
- Generacion de respuestas de ejemplo: aprovechando su capacidad instructiva, el modelo puede generar textos de ayuda para cada intencion, como descripciones de pasos a seguir o respuestas tipo para agentes humanos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp32): aproximadamente 17.2 GB, correspondientes al peso del repositorio en safetensors.
- VRAM estimada con cuantizacion 4-bit: aproximadamente 3 GB, aunque el repositorio no incluye cuantizaciones listas para usar.
- GPU recomendadas para precision completa: NVIDIA A100, H100 o RTX 4090 (24 GB). Para cuantizacion 4-bit, una RTX 3060 (12 GB) o inferior puede ser suficiente.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, Hugging Face TGI o Transformers con `bitsandbytes` para cuantizacion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| twokings22/lcgemma-banking77-merged | 4.3B | no disponible | apache-2.0 | Hugging Face |
| unsloth/gemma-3-4b-it-unsloth-bnb-4bit | 4.3B | no disponible | Gemma Terms of Use | Hugging Face |
| Llama 3.2 3B Instruct | 3.2B | 128k | Llama 3.2 Community License | Hugging Face |
| Qwen2.5 4B Instruct | 4B | 32k | Apache 2.0 | Hugging Face |

Los datos de rendimiento no estan disponibles, por lo que la comparacion se limita a parametros, contexto declarado y licencia. El modelo base Gemma 3 4B IT es el comparable directo, ya que este fine-tune hereda su arquitectura y capacidades.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un fine-tune sobre el dataset Banking77, el modelo puede heredar sesgos presentes en ese corpus, como un sesgo hacia consultas de clientes de habla inglesa o hacia terminologia bancaria especifica.
- Riesgo de alucinacion: si se usa fuera del dominio de clasificacion de intenciones bancarias, el modelo puede generar respuestas inconsistentes o inventar informacion, especialmente al tratar temas financieros complejos.
- Limitaciones de idioma: el repositorio declara solo ingles, por lo que el rendimiento en otros idiomas puede ser deficiente o no estar soportado.
- Limitaciones de contexto: no se ha confirmado la longitud de contexto del modelo tras el fine-tune; puede variar respecto al modelo base.
- Restricciones de licencia: el repositorio declara licencia Apache 2.0, pero el modelo base Gemma 3 esta sujeto a los Gemma Terms of Use, que incluyen restricciones de uso aceptable y requisitos de atribucion. Es recomendable revisar ambas licencias antes de un uso comercial.
- Caveat de produccion: el modelo no ha sido evaluado publicamente en benchmarks, por lo que su rendimiento real en tareas de clasificacion de intenciones debe validarse internamente antes de desplegarlo en sistemas criticos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/twokings22/lcgemma-banking77-merged
- Dataset Banking77: https://huggingface.co/datasets/PolyAI/banking77
- Unsloth (GitHub): https://github.com/unslothai/unsloth
- Modelo base en Hugging Face: https://huggingface.co/unsloth/gemma-3-4b-it-unsloth-bnb-4bit
