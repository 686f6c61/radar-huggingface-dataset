# xw17/gemma-3-12b-it_SFT_lora_bidsleep

## Resumen

`xw17/gemma-3-12b-it_SFT_lora_bidsleep` es un adaptador publicado en HuggingFace por el usuario `xw17` que, por su nombre y por el contenido del repositorio (0,2 GB en safetensors), corresponde a un ajuste fino mediante LoRA con aprendizaje supervisado (SFT) sobre el modelo base `google/gemma-3-12b-it`. No se trata, por tanto, de un modelo completo, sino de pesos delta que deben cargarse junto al modelo base para su uso.

El repositorio no incluye model card real: la tarjeta publicada es la plantilla automática de HuggingFace con todos los campos marcados como `[More Information Needed]`. Esto significa que no hay información verificable sobre el dataset de entrenamiento, los hiperparámetros, la licencia aplicada, los idiomas objetivo ni la finalidad concreta del ajuste.

Su relevancia es limitada fuera del ámbito del propio autor: acumula cero descargas y cero "likes" en el momento de la consulta, y no se ha publicado documentación asociada. Se describe aquí como ficha técnica de referencia, dejando explícito qué datos no están disponibles en lugar de asumirlos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible en la ficha; el modelo base `gemma-3-12b-it` es un transformer decoder-only |
| Parámetros totales | no disponible (el repositorio pesa 0,2 GB, compatible con un adaptador LoRA y no con pesos completos) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la ficha; el modelo base `gemma-3-12b-it` declara 128 000 tokens |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el repositorio no declara licencia; el modelo base está sujeto a los términos de uso de Gemma) |
| Formato de pesos | safetensors (biblioteca `transformers`) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura propia del adaptador más allá de su naturaleza LoRA sobre `gemma-3-12b-it`. El etiquetado del repositorio (`transformers`, `safetensors`) y el tamaño del mismo (0,2 GB) son coherentes con un adaptador de bajo rango y no con un checkpoint completo de 12 000 millones de parámetros, que en bf16 ocuparía del orden de 24 GB. El sufijo `SFT_lora` del identificador indica que el entrenamiento se realizó con ajuste supervisado sobre pares instrucción-respuesta.

No hay datos publicados sobre el número de tokens de entrenamiento, la composición del dataset, el rango y alpha del LoRA, la tasa de aprendizaje, el número de épocas, el uso de precisión mixta ni si hubo fases posteriores de alineación (RLHF, DPO, ORPO). El término `bidsleep` del nombre sugiere un dominio o dataset concreto, pero no se aporta ninguna referencia que lo confirme. Tampoco se documenta ninguna innovación técnica adicional.

## Capacidades

- Generación de texto e instrucciones: heredadas del modelo base `gemma-3-12b-it`, aunque no se especifica qué capacidades ha modificado el ajuste.
- Razonamiento y matemáticas: no disponible; no hay evaluación publicada.
- Generación de código: no disponible.
- Capacidades de visión: no disponible en esta ficha, pese a que el modelo base es multimodal.
- Tool calling y function calling: no disponible.
- Uso en agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; no se declaran idiomas en el repositorio.
- Modo de razonamiento explícito (thinking): no disponible.

## Casos de uso

- Experimentación con ajuste fino eficiente: el adaptador sirve como ejemplo reproducible de un pipeline SFT + LoRA sobre un modelo de 12B, útil para equipos que quieran comparar configuraciones de entrenamiento con bajo coste de almacenamiento.
- Investigación sobre adaptación de dominio: si `bidsleep` hace referencia a un corpus especializado, el adaptador permitiría estudiar hasta qué punto un LoRA de pocos cientos de MB desplaza el comportamiento del modelo base en ese dominio.
- Evaluación de regresiones tras el ajuste: antes de cualquier uso en producción, el adaptador puede emplearse como caso de prueba para medir pérdida de capacidades generales (olvido catastrófico) respecto a `gemma-3-12b-it`.
- Base para fusiones de adaptadores: al ser un delta independiente, puede combinarse con otros LoRA del ecosistema Gemma 3 mediante técnicas de merging, siempre que las licencias implicadas lo permitan.
- Despliegue interno de bajo coste de almacenamiento: en infraestructuras que ya sirven `gemma-3-12b-it`, cargar un adaptador de 0,2 GB por cliente es mucho más barato en disco que mantener copias completas del modelo.
- Docencia y formación técnica: resulta útil como ejemplo mínimo de estructura de repositorio LoRA en HuggingFace, incluida la ausencia de model card, para ilustrar buenas y malas prácticas de documentación.
- Pruebas de compatibilidad de toolchain: validación de que `transformers`, `vLLM` o `PEFT` cargan correctamente adaptadores sobre Gemma 3 12B en distintas versiones de librería.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio no incluye la sección de evaluación y no se han encontrado tablas de MMLU, HumanEval, GSM8K ni de ninguna otra métrica.

## Requisitos de hardware

- El adaptador en sí ocupa 0,2 GB, pero la inferencia requiere cargar el modelo base `gemma-3-12b-it` completo.
- VRAM estimada para el modelo base en bf16/fp16: del orden de 24 GB de pesos más overhead de activaciones y caché KV, aproximadamente 26-30 GB según longitud de contexto.
- VRAM estimada en cuantización de 8 bits: en torno a 13-14 GB.
- VRAM estimada en cuantización de 4 bits: en torno a 7-9 GB, con pérdida de calidad no cuantificada en esta ficha.
- GPU recomendadas: A100 40/80 GB, H100 80 GB o L40S para servicio concurrente; RTX 4090 (24 GB) viable en bf16 con contexto moderado y en 4 bits con contexto amplio.
- GPU de consumo: cabe en RTX 3090/4090 (24 GB) en bf16 con lotes pequeños y en cuantización de 4 bits en tarjetas de 8-12 GB, asumiendo offloading parcial.
- Opciones de despliegue: `transformers` + `peft` para cargar el adaptador; `vLLM` o TGI admiten adaptadores LoRA en caliente; `llama.cpp`/Ollama requieren convertir el modelo fusionado a GGUF, no el adaptador aislado.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / disponibilidad |
|---|---|---|---|---|
| `xw17/gemma-3-12b-it_SFT_lora_bidsleep` | adaptador LoRA sobre 12B | no disponible | no disponible | safetensors (adaptador) |
| `google/gemma-3-12b-it` (modelo base) | 12B | 128 000 tokens | términos de uso de Gemma | safetensors, GGUF vía terceros |
| Mistral-Nemo-12B-Instruct | 12B | 128 000 tokens | Apache 2.0 | safetensors, GGUF |
| Qwen2.5-14B-Instruct | 14B | 32 768 tokens nativos (ampliable por YaRN) | Apache 2.0 | safetensors, GGUF |

No se dispone de comparativa de rendimiento entre estos modelos en el contexto de esta ficha: no hay benchmarks publicados para el adaptador y, por tanto, no es posible establecer una comparación cuantitativa honesta. La comparación anterior se limita a parámetros, contexto y licencia de modelos de la misma categoría de tamaño.

## Limitaciones y advertencias

- Ausencia total de model card útil: todos los campos relevantes están sin rellenar, lo que impide conocer el dataset, el procedimiento y el propósito del ajuste.
- Licencia no declarada: no puede asumirse uso comercial. Además, el modelo base Gemma está sujeto a los términos de uso de Google, que imponen obligaciones adicionales al usuario.
- Riesgo de alucinación: desconocido a nivel del adaptador; el riesgo del modelo base no se ha reevaluado tras el ajuste.
- Sesgos: no evaluados. No hay análisis de sesgo demográfico, lingüístico ni de dominio.
- Idiomas: no se declara ninguno; no hay garantía de comportamiento correcto en castellano ni en ninguna otra lengua.
- Riesgo de olvido catastrófico: un SFT con LoRA puede degradar capacidades generales del modelo base, y no se aporta ninguna evaluación que lo descarte.
- Reproducibilidad: sin hiperparámetros, dataset ni script de entrenamiento publicados, el resultado no es reproducible.
- Anomalía en metadatos: la fecha de creación registrada (2026-10-02) es posterior a la fecha de consulta habitual de este tipo de fichas, lo que sugiere un error de reloj o de metadatos del repositorio.
- Adopción nula: cero descargas y cero "likes" implican que no existe validación por parte de la comunidad. No se recomienda su uso en producción sin una evaluación propia y exhaustiva.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/xw17/gemma-3-12b-it_SFT_lora_bidsleep
- Artículo referenciado en las etiquetas del repositorio (Lacoste et al., 2019, sobre estimación de impacto ambiental): https://arxiv.org/abs/1910.09700
- Calculadora de impacto de aprendizaje automático citada en la plantilla de la model card: https://mlco2.github.io/impact
- Modelo base: no se incluye enlace en la información proporcionada.
