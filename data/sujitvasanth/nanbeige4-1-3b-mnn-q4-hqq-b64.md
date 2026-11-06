# sujitvasanth/Nanbeige4.1-3B-MNN-Q4-HQQ-B64

## Resumen

Nanbeige4.1-3B-MNN-Q4-HQQ-B64 es una conversión al formato MNN del modelo Nanbeige4.1-3B, un modelo de lenguaje de 3.000 millones de parámetros desarrollado originalmente por Nanbeige. Esta versión, publicada por el usuario sujitvasanth, aplica cuantización de 4 bits mediante HQQ (Half-Quadratic Quantization) con tamaño de bloque 64 sobre todos los pesos del transformer, incluida la cabeza de lenguaje, mientras que la tabla de embeddings se mantiene en BF16. El objetivo es permitir la ejecución del modelo en el runtime MNN, orientado a despliegues ligeros en CPU y dispositivos móviles.

La relevancia de esta ficha radica en que MNN es un motor de inferencia optimizado para entornos con recursos limitados, y esta conversión ofrece una alternativa a GGUF para quienes trabajan con el ecosistema de Alibaba. El repositorio ocupa 2,8 GB y se distribuye en seis ficheros de runtime que deben descargarse conjuntamente. La licencia Apache 2.0 facilita su uso comercial, aunque la validación realizada por el autor es mínima: solo se comprobó la carga en Linux CPU y la generación de texto legible en una prueba que se detuvo por límite de tokens.

El modelo base soporta inglés y chino, y esta conversión conserva la plantilla de chat original. No se incluyen el proxy de respuestas concisas, el enrutador de herramientas ni la integración con aplicación asistente que acompañan al modelo original, por lo que el modelo puede producir razonamientos extensos. No se han publicado benchmarks de rendimiento para esta conversión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Nanbeige4.1-3B) |
| Parametros totales | 3.000 millones (modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 4 bits HQQ con block size 64; embeddings en BF16 |
| Idiomas soportados | Ingles, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | MNN (llm.mnn, llm.mnn.weight, embeddings_bf16.bin, tokenizer.mtok) |

## Arquitectura y entrenamiento

El modelo base Nanbeige4.1-3B es un transformer decoder-only de 3.000 millones de parámetros. No se dispone de información detallada sobre la composición del dataset de entrenamiento, el número de tokens utilizados ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada. La conversión mantiene la arquitectura del modelo original y aplica cuantización HQQ de 4 bits con bloques de 64 elementos sobre los pesos del transformer y la cabeza de lenguaje, dejando la tabla de embeddings en BF16.

La innovación técnica de esta publicación es la conversión a MNN con flags específicos (`--export mnn --quant_bit 4 --quant_block 64 --hqq`), que incluye la fusión Transformer C4 y requiere un runtime MNN reciente y compatible. El proceso de exportación se completó el 2 de noviembre de 2026 y los ajustes adicionales quedan registrados en el fichero conversion.json. No se documentan innovaciones arquitectónicas propias del modelo base en la información disponible.

## Capacidades

- Generación de texto en inglés y chino.
- Razonamiento básico: en la validación del autor, el modelo identificó correctamente París como capital de Francia dentro de su razonamiento.
- Conversación multi-turno mediante la plantilla de chat original del modelo base.
- No incluye soporte de tool calling ni function calling en esta conversión.
- No incluye enrutador de herramientas ni integración con aplicación asistente.
- No se documentan capacidades de visión, audio ni modo de pensamiento explícito.
- Puede generar razonamientos extensos, ya que no se incluye el proxy de respuestas concisas del modelo original.

## Casos de uso

- Despliegue en dispositivos con recursos limitados: la cuantización de 4 bits y el formato MNN permiten ejecutar el modelo en entornos CPU y potencialmente móviles, aunque el autor no ha validado ningún dispositivo Android.
- Prototipado rápido en Linux: el modelo carga en el runtime MNN sobre CPU y genera texto legible, lo que sirve para pruebas de concepto iniciales sin necesidad de GPU.
- Aplicaciones de chat en inglés o chino: la plantilla de chat original se conserva, por lo que puede usarse para conversaciones multi-turno en ambos idiomas.
- Investigación sobre cuantización HQQ: el repositorio documenta los flags de conversión y permite estudiar el impacto de la cuantización de 4 bits con bloque 64 en un modelo de 3.000 millones de parámetros.
- Evaluación comparativa de runtimes: sirve para comparar el rendimiento de MNN frente a GGUF o llama.cpp en el mismo modelo base, aunque no se han publicado métricas de rendimiento.
- Integración en pipelines de generación de texto sin requisitos de tool calling: adecuado para tareas de generación simple donde no se necesiten agentes ni enrutamiento de herramientas.
- Docencia y experimentación: el tamaño reducido del repositorio (2,8 GB) y la licencia Apache 2.0 facilitan su uso en entornos educativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo documenta una prueba cualitativa de carga en Linux CPU con generación de texto legible, sin métricas de latencia, throughput ni calidad.

## Requisitos de hardware

- VRAM estimada: no disponible. Al ser una conversión MNN orientada a CPU, no se especifican requisitos de VRAM.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; el formato MNN está optimizado para CPU y dispositivos móviles.
- Opciones de despliegue: runtime MNN (versión reciente compatible con la fusión Transformer C4). No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que el formato es MNN y no GGUF.
- Latencia y throughput: no disponibles. No se ha realizado ninguna validación de rendimiento.
- Validación en dispositivos: solo se probó en Linux CPU; no hay validación en Android ni en otros dispositivos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nanbeige4.1-3B-MNN-Q4-HQQ-B64 | 3.000 M | No disponible | MNN | Apache 2.0 | Hugging Face |
| Nanbeige4.1-3B (original) | 3.000 M | No disponible | Safetensors (presumible) | Apache 2.0 | Hugging Face |
| Conversiones GGUF de modelos de 3B | ~3.000 M | Variable | GGUF | Según modelo base | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas opciones en la información proporcionada. La comparación se limita a parámetros, formato y licencia.

## Limitaciones y advertencias

- Validación insuficiente: el autor solo comprobó la carga en Linux CPU y una generación de texto que se detuvo por límite de tokens; no se establece la calidad completa de las respuestas.
- Sin validación en Android ni en dispositivos móviles, a pesar de que MNN está orientado a esos entornos.
- Sin benchmarks de rendimiento: no hay datos de latencia, throughput ni calidad.
- El modelo puede producir razonamientos extensos al no incluirse el proxy de respuestas concisas del modelo original.
- No incluye tool router ni integración con aplicación asistente.
- Riesgo de alucinación inherente a los modelos de lenguaje, no cuantificado en esta conversión.
- Sesgos conocidos: no documentados en la información disponible.
- Limitaciones de idioma: solo inglés y chino; no se garantiza un rendimiento adecuado en castellano.
- Longitud de contexto no disponible, lo que dificulta planificar usos con documentos largos.
- Requiere un runtime MNN reciente y compatible con la fusión Transformer C4; versiones antiguas pueden fallar.
- Es necesario descargar los seis ficheros de runtime en el mismo directorio para que el modelo funcione.
- La licencia Apache 2.0 permite uso comercial, pero al ser una conversión de un modelo base, conviene verificar las condiciones del modelo original.

## Enlaces

- Repositorio Hugging Face de esta conversión: https://huggingface.co/sujitvasanth/Nanbeige4.1-3B-MNN-Q4-HQQ-B64
- Modelo base Nanbeige4.1-3B: https://huggingface.co/Nanbeige/Nanbeige4.1-3B
