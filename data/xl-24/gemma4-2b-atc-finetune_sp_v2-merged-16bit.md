# xl-24/gemma4-2b-atc-finetune_sp_v2-merged-16bit

## Resumen

`xl-24/gemma4-2b-atc-finetune_sp_v2-merged-16bit` es un ajuste fino (finetune) del modelo `unsloth/gemma-4-E2B-it-unsloth-bnb-4bit`, publicado por el usuario xl-24 en Hugging Face. Se trata de un modelo multimodal de tipo image-text-to-text derivado de la familia Gemma 4 de Google, distribuido bajo licencia Apache 2.0 y empaquetado en formato safetensors a 16 bits con un total de 5.123.178.051 parametros reales segun los pesos.

El nombre del repositorio sugiere un ajuste orientado a "atc" (probablemente asistencia al cliente o control de trafico aereo, no confirmado) y una version "sp_v2". El modelo se ha entrenado con Unsloth y la libreria TRL de Hugging Face, lo que indica un flujo de trabajo de ajuste eficiente en memoria a partir del checkpoint base cuantizado en 4 bits de Unsloth. El resultado se ha fusionado (merged) y convertido a 16 bits para su distribucion.

La relevancia de esta ficha es limitada: se trata de un modelo de nicho, sin descargas ni likes en el momento de la consulta, sin model card detallada y sin benchmarks publicados. Es util como ejemplo de finetune multimodal pequeno sobre Gemma 4, pero no debe evaluarse como un modelo generalista de referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), derivada de Gemma 4; detalles no disponibles |
| Parametros totales | 5.123.178.051 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | pesos publicados en 16 bits (safetensors); el base se entreno desde un checkpoint bnb-4bit; no se detallan otras cuantizaciones |
| Idiomas soportados | en (segun la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de que se trata de un modelo de la familia Gemma 4 con capacidad image-text-to-text, es decir, un transformer multimodal que acepta imagenes y texto como entrada. El modelo base es `unsloth/gemma-4-E2B-it-unsloth-bnb-4bit`, un checkpoint ya ajustado por instrucciones (it) y cuantizado en 4 bits por Unsloth. El finetune se realizo con Unsloth y TRL, y posteriormente se fusionaron los adaptadores y se exportaron los pesos a 16 bits.

No se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo RLHF o DPO en el ajuste fino. Tampoco se documentan innovaciones tecnicas adicionales (atencion lineal, decodificacion especulativa, etc.). La unica innovacion implicita es el uso de Unsloth para acelerar el entrenamiento aproximadamente 2x respecto a un flujo estandar, segun la propia model card.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base ajustado por instrucciones.
- Procesamiento de imagenes y texto (pipeline image-text-to-text), lo que permite tareas de descripcion, respuesta a preguntas visuales y dialogos con soporte de imagen.
- Soporte de tool calling / function calling: no confirmado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion disponible.
- Capacidades multilingues: la model card solo declara ingles (`en`); no se documentan otros idiomas.
- Capacidades especiales (thinking mode, audio, etc.): no disponibles.

## Casos de uso

- Asistencia al cliente multimodal: el modelo puede gestionar conversaciones en las que el usuario adjunta una imagen (por ejemplo, una captura de pantalla o una foto de un producto) y el modelo responde en texto. Es adecuado por su pipeline image-text-to-text y su naturaleza conversacional.
- Clasificacion y descripcion de imagenes en ingles: dado que acepta pares imagen-texto, puede emplearse para generar descripciones o etiquetas de imagenes en flujos de catalogacion.
- Prototipado rapido de asistentes conversacionales: al ser un modelo de ~5.100 millones de parametros en 16 bits, es viable para experimentacion en una sola GPU y para validar flujos de dialogo antes de escalar a modelos mayores.
- Ajuste adicional (fine-tuning) sobre un dominio concreto: al estar bajo Apache 2.0 y en formato safetensors, puede servir como punto de partida para nuevos finetunes con Unsloth o TRL.
- Investigacion sobre finetunes multimodales pequenos: util para comparar el efecto de un ajuste fino sobre el checkpoint base de Unsloth en tareas de vision-lenguaje.
- Despliegue en entornos con recursos limitados: su tamano permite servirlo con transformers o TGI en hardware de gama media, aunque no se dispone de datos de latencia ni throughput.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en 16 bits: aproximadamente 10,3 GB solo para pesos (5.123.178.051 parametros x 2 bytes), mas overhead de activaciones y cache KV; en la practica se recomienda al menos 16 GB de VRAM.
- Cuantizacion adicional (4 u 8 bits) no documentada por el autor; requeriria conversion manual con herramientas como bitsandbytes o llama.cpp.
- GPU recomendadas: no especificadas por el autor. Por tamano, cabria en RTX 4090 (24 GB), A100 (40/80 GB) y H100; en GPUs consumer de 12-16 GB requeriria cuantizacion.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag `text-generation-inference`) y endpoints compatibles (tag `endpoints_compatible`). No se confirma soporte de vLLM, llama.cpp u Ollama.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| xl-24/gemma4-2b-atc-finetune_sp_v2-merged-16bit | 5.123.178.051 | no disponible | apache-2.0 | Hugging Face, 0 descargas |
| unsloth/gemma-4-E2B-it-unsloth-bnb-4bit (base) | no disponible | no disponible | no disponible | Hugging Face (checkpoint base) |
| Gemma 4 E2B it (original de Google) | no disponible | no disponible | no disponible | no disponible en la informacion |

No se dispone de datos suficientes para comparar rendimiento, contexto o benchmarks con alternativas de la misma categoria.

## Limitaciones y advertencias

- Modelo de nicho sin descargas ni likes en el momento de la consulta; no hay evidencia de validacion por la comunidad.
- Model card muy escasa: no se documentan datos de entrenamiento, evaluacion ni limitaciones conocidas.
- Idiomas: solo se declara ingles; el uso en castellano no esta garantizado ni evaluado.
- Riesgo de alucinacion: inherente a los modelos generativos; no se ha publicado ninguna evaluacion de fidelidad.
- Sesgos: no documentados por el autor; al derivar de un modelo base de Google, pueden persistir sesgos del checkpoint original.
- Licencia Apache 2.0 permite uso comercial, pero al ser un finetune conviene verificar las condiciones del modelo base y de los datos usados en el ajuste.
- El nombre "atc" y la version "sp_v2" no estan explicados; el dominio real del finetune es incierto.
- No se confirma soporte de tool calling, agentes ni modos de razonamiento extendido.
- El checkpoint se distribuye en 16 bits (10,3 GB de pesos), lo que limita su despliegue en GPUs consumer de gama baja sin cuantizacion adicional.

## Enlaces

- Hugging Face: https://huggingface.co/xl-24/gemma4-2b-atc-finetune_sp_v2-merged-16bit
- Modelo base: https://huggingface.co/unsloth/gemma-4-E2B-it-unsloth-bnb-4bit
- Unsloth (repositorio): https://github.com/unslothai/unsloth
