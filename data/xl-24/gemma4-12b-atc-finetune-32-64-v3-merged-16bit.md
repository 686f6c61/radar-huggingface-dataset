# xl-24/gemma4-12b-atc-finetune-32-64-v3-merged-16bit

## Resumen

`xl-24/gemma4-12b-atc-finetune-32-64-v3-merged-16bit` es un ajuste fino (fine-tune) del modelo `unsloth/gemma-4-12B-it`, publicado por el usuario `xl-24` en Hugging Face. Se trata de un modelo multimodal de tipo image-text-to-text, es decir, acepta entradas de imagen y texto y genera texto, construido sobre la familia Gemma 4 de Google. El repositorio contiene los pesos ya fusionados (merged) en precisión de 16 bits, con 11.959.730.224 parámetros reales según los safetensors, lo que lo sitúa en la categoría de modelos de aproximadamente 12.000 millones de parámetros.

El modelo está pensado para generación de texto conversacional y tareas de visión-lenguaje, y su nombre sugiere un ajuste orientado a un dominio concreto (el sufijo "atc" y los identificadores "32-64-v3" apuntan a una configuración de entrenamiento específica del autor, aunque la model card no detalla el dataset ni el procedimiento). La relevancia de esta ficha radica en documentar un modelo derivado de Gemma 4 con licencia Apache 2.0, un tamaño manejable en una sola GPU de gama alta y capacidades multimodales, aunque con información pública muy limitada sobre su entrenamiento y evaluación.

La model card es extremadamente escueta: se limita a indicar el modelo base, la licencia, el idioma (inglés) y que fue entrenado con Unsloth y TRL. No se publican detalles sobre el dataset de ajuste, hiperparámetros, benchmarks ni limitaciones específicas, por lo que gran parte de las especificaciones de esta ficha se infieren del modelo base o se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), tipo `gemma4_unified` según la librería de transformers; detalles internos no disponibles |
| Parametros totales | 11.959.730.224 (≈12B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (depende del modelo base Gemma 4; no confirmado) |
| Tipos de cuantizacion | no disponible en la model card; el repositorio se distribuye en 16 bits (merged-16bit). Compatible con cuantizaciones estándar (GGUF, AWQ, GPTQ) vía herramientas externas, no confirmado por el autor |
| Idiomas soportados | inglés (`en`) según la model card |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de `unsloth/gemma-4-12B-it`, un modelo de la familia Gemma 4 de Google con capacidades multimodales (procesa imagen y texto y genera texto). La arquitectura subyacente es un transformer, etiquetado en transformers como `gemma4_unified`, pero la model card no aporta detalles sobre número de capas, atención, mecanismos de visión ni configuración de contexto. Los pesos publicados son los del modelo ya fusionado (merged) tras el ajuste, en precisión de 16 bits, con un tamaño de repositorio de 24,0 GB.

El entrenamiento se realizó con la librería Unsloth y TRL de Hugging Face, según indica el autor, lo que sugiere un ajuste fino supervisado (SFT) o posiblemente DPO/RLHF, aunque no se especifica el método exacto. No se documenta el número de tokens de entrenamiento, la composición del dataset, si hubo fases de alineación adicionales ni ninguna innovación técnica destacable (decodificación especulativa, atención lineal, etc.). Toda esta información se marca como no disponible.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo base Gemma 4 IT.
- Procesamiento de imagen y texto (pipeline image-text-to-text): descripción de imágenes, respuesta a preguntas visuales y tareas de visión-lenguaje.
- Razonamiento y generación de código y matemáticas: capacidades propias de la familia Gemma 4, no verificadas específicamente en este fine-tune.
- Soporte de tool calling / function calling: no confirmado en la model card; probablemente heredado del modelo base, pero no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: limitadas al inglés según la model card.
- Modo "thinking" u otras capacidades especiales: no disponible.

## Casos de uso

- Asistente conversacional en inglés: el modelo puede mantener diálogos multi-turno gracias a su naturaleza instruct (hereda el sufijo `-it` del base) y a sus ~12B parámetros, adecuado para chatbots de soporte en inglés.
- Análisis de imágenes con descripción textual: al ser image-text-to-text, puede recibir una imagen y generar una descripción o responder preguntas sobre ella, útil en moderación de contenido visual o accesibilidad.
- Extracción de información de documentos escaneados: combinando entrada de imagen y texto, puede transcribir o resumir contenido de facturas, formularios o capturas, siempre que el dominio coincida con el ajuste.
- Prototipado de aplicaciones multimodales: su tamaño de 12B y licencia Apache 2.0 permiten desplegarlo en una sola GPU de gama alta para pruebas de concepto sin restricciones comerciales.
- Generación de texto asistida en pipelines de datos: puede usarse para enriquecer datasets con descripciones o resúmenes en inglés, integrado vía transformers o TGI.
- Fine-tuning posterior o destilación: al estar publicado en safetensors y 16 bits, sirve como punto de partida para ajustes adicionales con Unsloth o TRL en dominios específicos.
- Investigación sobre ajuste fino multimodal: útil para estudiar cómo un fine-tune de dominio (sufijo "atc") afecta al comportamiento de un modelo Gemma 4 base, comparándolo con el original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en 16 bits: aproximadamente 24 GB solo para los pesos (11,96B parámetros × 2 bytes), más overhead de activaciones y KV cache; se recomienda un mínimo de 32 GB de VRAM para contexto moderado.
- VRAM estimada en cuantización de 8 bits: ~12-14 GB; en 4 bits (GGUF/AWQ): ~7-8 GB, aunque el autor no publica versiones cuantizadas.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para 16 bits; RTX 4090 (24 GB) puede ser justa para 16 bits y requerir cuantización para contexto largo.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) con cuantización o contexto corto; en RTX 3090 (24 GB) de forma similar; en GPUs de 16 GB solo con cuantización de 4-8 bits.
- Opciones de despliegue: transformers (librería indicada), text-generation-inference (tag `text-generation-inference`), vLLM y llama.cpp/Ollama previa conversión a GGUF (no confirmado por el autor).
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| xl-24/gemma4-12b-atc-finetune-32-64-v3-merged-16bit | ≈12B | no disponible | Sí (image-text-to-text) | Apache 2.0 | Hugging Face |
| unsloth/gemma-4-12B-it (base) | ≈12B | no disponible | Sí | según modelo base (no confirmado) | Hugging Face |
| Gemma 4 de Google (familia) | variable | no disponible | Sí | Gemma license (no confirmado) | Hugging Face / Google |
| Modelos multimodales ~12B de otros proveedores | ≈12B | variable | Sí | variable | Hugging Face |

No se dispone de datos de rendimiento comparativo para este fine-tune; la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos; al derivar de Gemma 4, puede heredar sesgos del corpus de entrenamiento original, no evaluados aquí.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad; en tareas de visión-lenguaje y conversación puede generar contenido incorrecto.
- Limitación de idioma: solo se declara inglés (`en`); el rendimiento en castellano u otros idiomas no está garantizado.
- Longitud de contexto no documentada: no se confirma la ventana máxima, lo que dificulta planificar casos de uso con documentos largos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base `unsloth/gemma-4-12B-it` y de Gemma 4, ya que pueden imponer condiciones adicionales no reflejadas en esta ficha.
- El dataset de ajuste ("atc") no está descrito: el modelo puede estar especializado en un dominio concreto y degradarse fuera de él.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria; no hay evidencia de calidad ni de reproducibilidad.
- Tamaño de 24 GB en 16 bits: requiere hardware considerable y no se ofrecen versiones cuantizadas oficiales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xl-24/gemma4-12b-atc-finetune-32-64-v3-merged-16bit
- Modelo base: https://huggingface.co/unsloth/gemma-4-12B-it
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- TRL de Hugging Face: https://github.com/huggingface/trl
- Documentación de transformers: https://huggingface.co/docs/transformers
