# Wiself/gemma-4-26B-A4B-QAT-Styletune-V2-Voice

## Resumen

Wiself/gemma-4-26B-A4B-QAT-Styletune-V2-Voice no es un modelo de lenguaje completo, sino un **tensor de estilo** (denominado "voice") diseñado para aplicarse sobre GGUFs del modelo Gemma 4 26B A4B de Google, concretamente sobre los checkpoints con entrenamiento consciente de cuantización (QAT). El autor, Wiself, ha extraído el estilo de escritura del finetune StyleTune V2 de Gryphe y lo ha calibrado como un delta contra el checkpoint QAT de Google, de modo que se puede transferir ese estilo a cualquier GGUF derivado de dichos pesos sin necesidad de reentrenar ni descargar el modelo completo.

La relevancia de esta pieza radica en que combina dos optimizaciones independientes: la QAT de Google, que reduce la pérdida de perplexidad en cuantización Q4_0 en un 54% frente a la cuantización post-entrenamiento estándar, y el StyleTune de Gryphe, que reduce los clichés en un 52% y comparte solo un 19,9% del vocabulario de trigramas con el instruct base. El resultado es un fichero de aproximadamente 1,1 GB (tensor BF16 de forma `[262144, 2048]`) que, aplicado con la herramienta `voice` de Wiself, transforma el estilo de escritura de cualquier GGUF QAT compatible sin tocar el resto de pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tensor de estilo (delta) para modelo MoE Gemma 4 26B A4B |
| Parametros totales | 536 870 912 (tensor `[262144, 2048]` en BF16) |
| Parametros activos | No aplica (no es un modelo MoE, es un tensor de estilo) |
| Longitud de contexto | No disponible (depende del modelo base sobre el que se aplique) |
| Tipos de cuantizacion | BF16 (el tensor); compatible con GGUFs Q4_0, Q8_0 y otros del modelo base |
| Idiomas soportados | en (hereda del modelo base) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (tensor `voice.safetensors`) + metadatos JSON |

## Arquitectura y entrenamiento

Este artefacto no ha sido entrenado como un modelo independiente. Se trata de un tensor de estilo extraído del finetune [Gryphe/Gemma-4-26B-A4B-StyleTune-V2](https://huggingface.co/Gryphe/Gemma-4-26B-A4B-StyleTune-V2) y posteriormente calibrado como un delta contra el checkpoint QAT de Google `google/gemma-4-26B-A4B-it-qat-q4_0-unquantized`. El modelo base es un transformer MoE de 26 000 millones de parámetros totales con 4 000 millones activos por token, entrenado por Google DeepMind con QAT: 5 000 pasos de forward passes con cuantización simulada y divergencia KL respecto al profesor BF16, lo que permite que los pesos aprendan a sobrevivir a la cuantización posterior.

El tensor de estilo se aplica mediante la herramienta `voice` de Wiself, que sobrescribe únicamente la cabeza de salida (`lm_head`) del GGUF, cuantizándola a Q8_0 (casi sin pérdida) y copiando byte a byte el resto de tensores. Para variantes abliteradas o muy modificadas, se recomienda el modo delta (`voice delta`), que calcula la diferencia respecto al base y la aplica de forma incremental para minimizar perturbaciones en el enrutamiento MoE.

## Capacidades

- Transferencia de estilo de escritura: aplica el estilo narrativo de StyleTune V2 (menos clichés, vocabulario más variado) a cualquier GGUF QAT de Gemma 4 26B A4B.
- Compatibilidad con cuantizaciones QAT: funciona con cualquier GGUF derivado del checkpoint QAT de Google, independientemente del nivel de cuantización (Q4_0, Q8_0, etc.).
- Soporte para variantes abliteradas: mediante el modo delta, se puede aplicar a modelos modificados (p. ej. `llmfan46/gemma-4-26B-A4B-it-qat-q4_0-unquantized-uncensored-heretic`) sin bucles de repetición.
- Sin reentrenamiento: no requiere ajuste fino ni descarga del modelo completo; solo el tensor de 1,1 GB y la herramienta `voice`.
- Mantenimiento de la fidelidad QAT: al copiar byte a byte los tensores del GGUF original, se conservan las ventajas de la QAT (menor pérdida de perplexidad en cuantización).
- Integración con llama.cpp: el GGUF resultante se puede servir con `llama serve` usando la plantilla de chat nativa de Gemma 4.

## Casos de uso

- Roleplay y narrativa creativa: el estilo StyleTune reduce clichés y aporta una voz más natural para personajes y escenas, ideal para aplicaciones de chat inmersivo con modelos QAT locales.
- Personalización de estilo en producción: un equipo que ya sirve un GGUF QAT de Gemma 4 26B A4B puede cambiar el tono de las respuestas (más literario, menos formulaico) sin reentrenar ni sustituir el modelo, solo aplicando el tensor.
- Adaptación de modelos abliterados: para variantes "uncensored" o modificadas, el modo delta permite añadir el estilo sin romper el comportamiento del modelo, evitando repeticiones.
- Evaluación comparativa de estilos: investigadores pueden probar el mismo modelo base con y sin el voice para medir el impacto del estilo en métricas de calidad textual (clichés, diversidad léxica).
- Despliegue en entornos con recursos limitados: al ser un delta de 1,1 GB, se puede aplicar sobre un GGUF ya descargado (p. ej. 14-16 GB en Q4_0) sin necesidad de almacenar un segundo modelo completo.
- Experimentación con samplers: el voice está calibrado para funcionar con temp 1.0, MinP 0.10 y DRY sampler activado, lo que permite ajustar la generación sin tocar los pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) para este tensor de estilo, ya que no es un modelo autónomo. Los datos disponibles provienen de las fuentes originales:

| Metrica | Valor | Fuente |
|---|---|---|
| Reduccion de cliches (StyleTune vs instruct base) | 52% (1.141 → 0.551 por 100 palabras) | Gryphe |
| Vocabulario compartido de trigramas (StyleTune vs instruct base) | 19.9% | Gryphe |
| Reduccion de caida de perplexidad en Q4_0 (QAT vs PTQ) | 54% | Google Developers Blog |

Estos datos se refieren a los componentes por separado; el rendimiento combinado no ha sido medido públicamente.

## Requisitos de hardware

- El tensor de estilo ocupa 1,1 GB en disco y se carga en memoria durante la operación de casting (proceso puntual, no de inferencia).
- Para la inferencia del modelo resultante, los requisitos son los del GGUF base de Gemma 4 26B A4B: en Q4_0 se necesitan aproximadamente 14-16 GB de VRAM, por lo que cabe en GPUs de consumo como RTX 4090 (24 GB) o RTX 3090 (24 GB).
- Para cuantizaciones superiores (Q8_0) se requieren 26-28 GB de VRAM, lo que apunta a GPUs profesionales como A100 (40/80 GB) o H100.
- El proceso de casting se ejecuta con la herramienta `voice` en Python, que requiere CPU y memoria RAM suficiente para cargar el tensor (unos 2-3 GB), no GPU.
- El despliegue del GGUF resultante se realiza con llama.cpp (`llama serve`), compatible con vLLM, Ollama y otros runners que soporten GGUFs.

## Comparativa con modelos similares

| Modelo | Tipo | Tamano | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Wiself/gemma-4-26B-A4B-QAT-Styletune-V2-Voice | Tensor de estilo (delta) | 1,1 GB | No aplica | Apache-2.0 | Hugging Face |
| Wiself/gemma-4-26B-A4B-Styletune-V2-Voice | Tensor de estilo (delta) para base no QAT | 1,1 GB | No aplica | Apache-2.0 | Hugging Face |
| Gryphe/Gemma-4-26B-A4B-StyleTune-V2 | Finetune completo | ~50 GB (BF16) | No disponible | Apache-2.0 | Hugging Face |
| google/gemma-4-26B-A4B-it-qat-q4_0-unquantized | Modelo base QAT | ~54 GB (GGUF) | No disponible | Gemma Terms | Hugging Face |

La diferencia clave entre las dos variantes de Wiself es el checkpoint de referencia: la versión QAT está calibrada contra los pesos QAT de Google, mientras que la versión estándar se aplica a GGUFs del instruct original. El finetune completo de Gryphe ofrece el mismo estilo pero requiere descargar el modelo entero, mientras que el voice permite aplicarlo sobre un GGUF ya existente.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere un GGUF base de Gemma 4 26B A4B (QAT o estándar) y la herramienta `voice` para funcionar.
- Solo compatible con la familia Gemma 4 26B A4B; cualquier otro tamaño o arquitectura produce un error de forma (`shape mismatch`).
- El tensor está calibrado para el checkpoint QAT de Google; aplicarlo a un GGUF no QAT funciona pero no es la combinación óptima (se recomienda la variante V2 estándar).
- En variantes abliteradas o muy modificadas, el casting directo puede generar bucles de repetición; es obligatorio usar el modo delta.
- El idioma soportado es inglés; no se garantiza calidad en otros idiomas.
- La licencia Apache-2.0 del tensor no exime de cumplir los términos de uso del modelo base de Google (Gemma Terms), que pueden imponer restricciones adicionales para uso comercial.
- No hay garantías de rendimiento en tareas de razonamiento o código; el voice solo modifica el estilo de escritura, no las capacidades cognitivas del modelo.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Wiself/gemma-4-26B-A4B-QAT-Styletune-V2-Voice)
- [Herramienta Voice de Wiself](https://huggingface.co/Wiself/voice)
- [Finetune StyleTune V2 de Gryphe](https://huggingface.co/Gryphe/Gemma-4-26B-A4B-StyleTune-V2)
- [Checkpoint QAT de Google](https://huggingface.co/google/gemma-4-26B-A4B-it-qat-q4_0-unquantized)
- [Blog de Google sobre QAT en Gemma 3](https://developers.googleblog.com/en/gemma-3-quantized-aware-trained-state-of-the-art-ai-to-consumer-gpus/)
- [Variante abliterada de llmfan46](https://huggingface.co/llmfan46/gemma-4-26B-A4B-it-qat-q4_0-unquantized-uncensored-heretic)
