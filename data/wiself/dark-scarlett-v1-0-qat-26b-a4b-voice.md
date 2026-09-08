# Wiself/Dark-Scarlett-v1.0-QAT-26B-A4B-Voice

## Resumen

Dark-Scarlett-v1.0-QAT-26B-A4B-Voice es un conjunto de pesos delta (voice delta) desarrollado por Wiself para transferir el estilo de escritura "Dark Scarlett" a modelos GGUF basados en el checkpoint QAT de Google Gemma 4 26B A4B. No es un modelo de lenguaje completo, sino un componente de 1.5 GB que modifica el `lm_head` del modelo base mediante la herramienta Voice de Wiself. Está diseñado específicamente para GGUFs derivados de `google/gemma-4-26B-A4B-it-qat-q4_0-unquantized`, un modelo MoE de 26B con 4B parámetros activos entrenado con cuantización consciente (QAT) para sobrevivir mejor a la cuantización Q4_0. La relevancia de este modelo radica en que permite alterar el estilo de escritura sin reentrenar ni sobrescribir los pesos QAT, preservando la ventaja de menor pérdida de perplejidad que ofrece QAT frente a la cuantización post-entrenamiento estándar. El delta se calcula contra el instruct estándar (no QAT) para que, al aplicarlo sobre la cabeza QAT, la matemática de la fusión sea correcta y el fundamento QAT se mantenga intacto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No es un modelo completo; delta de pesos para el `lm_head` de un transformer MoE (Google Gemma 4 26B A4B) |
| Parametros totales | No disponible (delta de pesos de ~1.5 GB con forma `[262144, 2816]`) |
| Parametros activos | No disponible para el delta; el modelo base tiene 4B activos (A4B) |
| Longitud de contexto | No disponible (depende del modelo base Gemma 4 26B A4B) |
| Tipos de cuantizacion | No disponible (el delta se aplica a GGUFs de cualquier cuantizacion; el head se cuantiza a Q8_0 al aplicar) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (delta) + JSON metadata; se aplica a GGUFs |

## Arquitectura y entrenamiento

El modelo base es Google Gemma 4 26B A4B, un transformer de arquitectura Mixture of Experts (MoE) con 26B parámetros totales y 4B activos por token. El checkpoint utilizado como base es la variante QAT (`google/gemma-4-26B-A4B-it-qat-q4_0-unquantized`), que ha sido entrenada con cuantización consciente para minimizar la degradación en cuantizaciones agresivas como Q4_0. Segun la informacion del autor, QAT reduce la caida de perplejidad en Q4_0 en un 54% en comparacion con la cuantizacion post-entrenamiento estandar.

El delta de voz se deriva del modelo `ReadyArt/Dark-Scarlett-v1.0-26B-A4B`, que es un fine-tuning LoRA (r32, 2 epochs, 12,211 prompts) sobre el instruct de Gemma 4 26B A4B. La innovacion tecnica de este paquete es que el delta se calcula como `voice − base`, donde `base` es el instruct estandar, no el checkpoint QAT. De esta forma, al fusionar el delta con la cabeza QAT, se obtiene la voz de Scarlett sin sobrescribir los pesos que han aprendido a tolerar la cuantizacion. No se requiere reentrenamiento ni descarga de modelos adicionales; el proceso se realiza con la herramienta Voice de Wiself, que aplica el delta al GGUF de destino y cuantiza solo el head a Q8_0 (casi sin perdida), copiando el resto de tensores byte a byte.

## Capacidades

- Transferencia de estilo de escritura: aplica la voz "Dark Scarlett" sobre el modelo base, alterando la diccion y el tono de las respuestas.
- Compatibilidad especifica con GGUFs derivados de QAT de Gemma 4 26B A4B, en cualquier cuantizacion.
- Preserva las ventajas de QAT: al no sobrescribir los pesos QAT, se mantiene la menor perdida de perplejidad en cuantizaciones bajas.
- Soporte del path delta para variantes abliteradas o uncensored: el delta se calcula contra el instruct estandar, evitando bucles de salida en modelos altamente modificados.
- No requiere reentrenamiento ni descarga de modelos adicionales; solo se necesita el delta y la herramienta Voice.
- Se integra en el pipeline de generacion de texto existente, manteniendo el formato GGUF y la compatibilidad con llama.cpp.

## Casos de uso

- Roleplay con estilo personalizado: permite a usuarios de GGUFs QAT de Gemma 4 26B A4B obtener respuestas con el estilo de Dark Scarlett sin perder las ventajas de la cuantizacion QAT. Se aplica el delta con la herramienta Voice y se sirve el GGUF resultante con `llama serve`.
- Mejora de GGUFs QAT sin reentrenamiento: util para desarrolladores que ya ejecutan un GGUF QAT y quieren cambiar el estilo de escritura sin descargar un modelo completo ni reentrenar. El delta se fusiona en minutos y el resultado mantiene el fundamento QAT.
- Integracion en pipelines de inferencia local con llama.cpp: el GGUF resultante es compatible con `llama serve` y puede usarse en aplicaciones de chat o agentes que consuman el endpoint.
- Personalizacion de modelos abliterados o uncensored: para variantes abliteradas basadas en QAT, se usa el path delta para evitar bucles de salida y mantener la coherencia del texto.
- Experimentacion con transferencia de estilo en MoE: investigadores pueden estudiar como el delta afecta el routing de expertos y la diccion del modelo, ya que el delta se aplica solo al `lm_head` y no modifica los expertos.
- Despliegue en entornos con restricciones de VRAM: al copiar el resto de tensores byte a byte, el tamaño del GGUF no aumenta significativamente; solo el head se cuantiza a Q8_0, lo que permite mantener el modelo en GPUs con memoria limitada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor menciona en la model card una prueba interna con una sola sonda que indica un cambio de diccion del 96% con cero coste de comprension al fusionar el delta de Scarlett sobre una cabeza QAT-Q4_0, pero estos datos no constituyen un benchmark oficial ni han sido replicados de forma independiente.

## Requisitos de hardware

- VRAM estimada: el delta en si ocupa ~1.5 GB, pero el modelo resultante es un GGUF de Gemma 4 26B A4B. Para la cuantizacion Q4_K_M, el archivo base tiene un tamano de aproximadamente 15.64 GiB, por lo que se necesitan al menos 16-20 GB de VRAM para inferencia en GPU.
- GPU recomendadas: una RTX 4090 (24 GB) puede ejecutar el modelo en Q4_K_M; para cuantizaciones mas altas (Q8_0) se requieren GPUs con mayor memoria, como A100 40/80 GB o H100.
- Si cabe en consumer GPU: si, en Q4_K_M con una RTX 4090 o similar.
- Opciones de despliegue: llama.cpp (`llama serve`), vLLM, Ollama o TGI, siempre que soporten el formato GGUF del modelo base.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Wiself/Dark-Scarlett-v1.0-QAT-26B-A4B-Voice | Delta de 1.5 GB (no completo) | No disponible | Apache 2.0 | HuggingFace |
| Wiself/Dark-Scarlett-v1.0-26B-A4B-Voice | Delta de 1.5 GB (no completo) | No disponible | Apache 2.0 | HuggingFace |
| ReadyArt/Dark-Scarlett-v1.0-26B-A4B | 26B total / 4B activos (MoE) | No disponible | No indicada | HuggingFace |
| google/gemma-4-26B-A4B-it-qat-q4_0-unquantized | 26B total / 4B activos (MoE) | No disponible | Gemma terms | HuggingFace |

La diferencia principal entre las dos variantes de Voice es que la version QAT esta calibrada para GGUFs derivados del checkpoint QAT, mientras que la version estandar es el ajuste exacto para GGUFs basados en el instruct estandar. El modelo base QAT tiene la ventaja de una menor perdida de perplejidad en cuantizaciones bajas, pero no incluye la voz de Scarlett.

## Limitaciones y advertencias

- No es un modelo independiente: requiere el modelo base Gemma 4 26B A4B y la herramienta Voice de Wiself para funcionar.
- Solo es compatible con Gemma 4 26B A4B; en otros tamanos o modelos no Gemma se produce un error de shape mismatch.
- Uso restringido: la model card original indica "personal use only, 18+, you accept full responsibility for outputs". Los terminos de uso del modelo base Gemma tambien aplican.
- Riesgo de bucles de salida: si se aplica el delta directamente a modelos abliterados o muy modificados, puede producirse repeticion y salida inservible. Se recomienda usar el path delta en esos casos.
- Sesgos y alucinacion: no se han evaluado de forma independiente; dependen del modelo base y del estilo transferido. El modelo puede reflejar sesgos presentes en los datos de fine-tuning originales.
- La informacion sobre rendimiento y contexto no esta disponible, por lo que se debe validar en el entorno de uso antes de desplegar en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Wiself/Dark-Scarlett-v1.0-QAT-26B-A4B-Voice
- Herramienta Voice: https://huggingface.co/Wiself/voice
- Modelo base QAT: https://huggingface.co/google/gemma-4-26B-A4B-it-qat-q4_0-unquantized
- Modelo de voz original: https://huggingface.co/ReadyArt/Dark-Scarlett-v1.0-26B-A4B
- Version estandar del voice: https://huggingface.co/Wiself/Dark-Scarlett-v1.0-26B-A4B-Voice
- Blog de Google sobre QAT: https://developers.googleblog.com/en/gemma-3-quantized-aware-trained-state-of-the-art-ai-to-consumer-gpus
- Datos de VRAM del modelo base: https://ossmodeldb.com/models/dark-scarlett-v1-0-26b-a4b
