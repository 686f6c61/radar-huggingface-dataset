# Xylolabs/Llama-3.1-8B-Instruct-Tenstorrent-Tensix-BFP4-Down8

## Resumen

Llama 3.1 8B Instruct para Tenstorrent Tensix (BFP4 Down8) es una exportación cuantizada del modelo meta-llama/Llama-3.1-8B-Instruct, publicada por Xylolabs y orientada específicamente a su ejecución sobre aceleradores Tenstorrent con el stack TT-Metal/TT-NN. El modelo conserva la arquitectura original de Llama 3.1 (transformer decoder-only de 8.030.261.248 parámetros) y aplica un esquema de cuantización de bloque (block floating point) diferenciado por tipo de matriz: las proyecciones de atención y gate/up del MLP usan BFP4 con GPTQ y búsqueda de exponente, mientras que las proyecciones down del MLP usan BFP8 con redondeo al más cercano.

El resultado es un checkpoint que empaqueta los pesos en aproximadamente 6,97 GB, con una media de 6,941 bits por peso sobre el total almacenado, manteniendo en BF16 la embedding de entrada, la LM head y otros 67 tensores. Esto reduce de forma sustancial el espacio en memoria de dispositivo frente a los pesos en BF16, un factor crítico en hardware Tensix donde la DRAM y los buffers del chip son el recurso limitante.

Su relevancia es doble: por un lado demuestra un flujo de cuantización GPTQ adaptado al formato nativo de bloque de Tenstorrent (no a formatos convencionales como GGUF o AWQ), y por otro publica una evaluación de degradación frente al BF16 original y frente a una cuantización Q4_K_M equivalente, con métricas de divergencia KL sobre textos en inglés y coreano. Es, por tanto, un artefacto de interés para quienes despliegan Llama 3.1 en aceleradores Tenstorrent y necesitan estimar el coste de calidad de la cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1), cuantizacion de bloque BFP4/BFP8 |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Llama 3.1: 128.000 tokens, no confirmado en esta ficha) |
| Tipos de cuantizacion | bfloat4_b con GPTQ y busqueda de exponente (4,5 bits/peso); bfloat8_b con RTN (8,5 bits/peso); BF16 para embedding, LM head y otros tensores |
| Idiomas soportados | en, ko |
| Licencia | llama3.1 (Llama 3.1 Community License Agreement) |
| Formato de pesos | safetensors (BF16 en disco, con valores ya redondeados a la rejilla BFP4/BFP8) |

## Arquitectura y entrenamiento

El modelo parte de Llama 3.1 8B Instruct, un transformer decoder-only con atención por grupos (GQA) y las innovaciones habituales de la familia Llama 3.1. No se ha reentrenado: la model card describe exclusivamente un proceso de post-entrenamiento de cuantización. Las 192 matrices correspondientes a atención y a las proyecciones gate/up del MLP se cuantizan a bfloat4_b mediante GPTQ con amortiguación 0,1 y búsqueda de exponente de bloque, resultando en 4,5 bits por peso. Las 32 matrices down del MLP se cuantizan a bfloat8_b con redondeo al más cercano, es decir, 8,5 bits por peso. Los 67 tensores restantes, incluidos embedding de entrada sin atar, LM head y otros, permanecen en BF16.

El empaquetado final ocupa aproximadamente 6,97 GB y promedia 6,941 bits por peso sobre el conjunto de pesos almacenados. Los ficheros safetensors en BF16 conservan los valores ya redondeados a la rejilla de bloque, de modo que el checkpoint puede cargarse con Transformers sin necesidad de kernels especiales, aunque el beneficio de memoria solo se materializa al empaquetar en TT-NN sobre hardware Tensix. La model card indica que las 224 matrices declaradas pasan las comprobaciones de rejilla y de empaquetado nativo TT-NN, incluido el empaquetado como BFP8, y que el ejemplo de empaquetado se validó en el simulador Blackhole con TT-NN 0.81.1. No se proporcionan detalles sobre el dataset de calibración de GPTQ ni sobre el número de muestras empleadas.

## Capacidades

- Generación de texto conversacional multi-turno, heredada de Llama 3.1 8B Instruct.
- Razonamiento y respuesta a instrucciones en formato chat (apply_chat_template).
- Generación de código y matemáticas a nivel del modelo base (no se aportan evaluaciones específicas en esta exportación).
- Soporte de tool calling y function calling heredado del modelo base (no verificado en esta ficha).
- Capacidades multilingües limitadas a inglés y coreano según los metadatos declarados.
- Ejecución en hardware Tenstorrent Tensix mediante TT-Metal/TT-NN con empaquetado BFP4/BFP8.
- Carga estándar en Transformers 5.23.0 con PyTorch en BF16 para inspección o inferencia en GPU.
- No se declaran capacidades de visión, audio ni modo thinking en la información disponible.

## Casos de uso

- Despliegue de un asistente conversacional en aceleradores Tenstorrent: el checkpoint está empaquetado para TT-NN y ocupa unos 6,97 GB de memoria de dispositivo en pesos, lo que permite alojar el modelo en una tarjeta Tensix con margen para caché KV y buffers, algo inviable con los pesos en BF16.
- Inferencia de bajo coste en inglés y coreano: los idiomas declarados permiten usar el modelo en atención al cliente o soporte técnico bilingüe para esos dos mercados, con la ventaja de memoria que aporta la cuantización de bloque.
- Validación de pipelines de cuantización: investigadores que desarrollan flujos GPTQ para formatos de bloque pueden usar este checkpoint como referencia, ya que la model card documenta el esquema por capas (BFP4 en atención y gate/up, BFP8 en down) y publica métricas de divergencia KL frente a BF16 y Q4_K_M.
- Evaluación de degradación por cuantización: el modelo incluye una comparación de KL sobre 16.056 posiciones puntuadas en textos en inglés y coreano, útil para calibrar el impacto de BFP4 frente a alternativas de 4 bits en tareas de generación libre.
- Integración en entornos de investigación con Transformers: al cargarse con AutoModelForCausalLM en BF16, sirve para reproducir experimentos y comparar salidas contra el modelo original sin necesidad de hardware Tensix.
- Prototipado de servicios de generación de texto con API compatible con text-generation-inference, según los tags del repositorio, para pruebas de latencia y calidad antes de migrar a producción sobre Tensix.
- Benchmarking de empaquetado en simulador Blackhole: el ejemplo de la model card permite verificar el empaquetado de matrices en TT-NN sin disponer de hardware físico, útil en fases de desarrollo.

## Benchmarks y rendimiento

| Perfil | KL media | Aciertos normales / 33 | Aciertos thinking / 7 | Perdidas contabilizadas |
|---|---:|---:|---:|---:|
| BF16 original | 0 | 28 | 0 | — |
| Esta exportacion | 0,034298 | 29 | 0 | 1 |
| Q4_K_M equivalente | 0,032352 | 30 | 0 | 0 |

La KL se calcula sobre 16.056 posiciones puntuadas de textos en inglés y coreano, en crudo y en formato chat, con cuatro fragmentos de 1.024 tokens por texto. El suelo de llama.cpp en BF16 es 0,000309. La exportación obtiene 1,060151 veces la KL de Q4_K_M, dentro del límite relativo de 1,5 veces, y pierde como máximo una respuesta adicional contabilizada. La comprobación estricta de cero regresiones falla en un ítem. El modelo BF16 original no acierta ninguno de los siete ítems de thinking, por lo que esos ítems no aportan evidencia de regresión. No se reportan métricas de velocidad ni de throughput.

## Requisitos de hardware

- Memoria de dispositivo para pesos: aproximadamente 6,97 GB en el formato empaquetado BFP4/BFP8, más espacio para caché KV y buffers.
- Hardware objetivo: aceleradores Tenstorrent Tensix con TT-Metal/TT-NN; el empaquetado se validó en el simulador Blackhole con TT-NN 0.81.1.
- GPU convencionales: el checkpoint puede cargarse en BF16 con Transformers 5.23.0 y PyTorch; el repositorio ocupa 16,1 GB, por lo que se requiere al menos esa cantidad de VRAM o RAM para la carga completa en BF16, o una GPU con 24 GB (RTX 4090, A10G) para margen de contexto.
- GPU de datacenter: A100 40/80 GB y H100 son suficientes para inferencia en BF16 con contexto largo; no se aportan cifras de latencia.
- Despliegue: Transformers, text-generation-inference (tag endpoints_compatible), TT-NN para Tensix. No se mencionan integraciones con vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Xylolabs, BFP4 Down8) | 8,03 B | no disponible | BFP4 GPTQ + BFP8 RTN + BF16 | llama3.1 | Hugging Face, 19 descargas |
| meta-llama/Llama-3.1-8B-Instruct | 8,03 B | 128.000 (modelo base) | BF16 | llama3.1 | Hugging Face, ampliamente disponible |
| Cuantizacion Q4_K_M de referencia (llama.cpp) | 8,03 B | 128.000 (modelo base) | 4 bits K-quant | llama3.1 | Disponible en el ecosistema GGUF |
| Llama 3.1 8B en AWQ/GPTQ para GPU | 8,03 B | 128.000 (modelo base) | 4 bits | llama3.1 | Amplia disponibilidad comunitaria |

La comparación directa más relevante es con el BF16 original y con Q4_K_M: la exportación de Xylolabs queda entre ambos en divergencia KL (0,034298 frente a 0,032352 de Q4_K_M y 0 del BF16), con una pérdida adicional de una respuesta contabilizada. Su ventaja diferencial no es la calidad sino el formato nativo para Tensix.

## Limitaciones y advertencias

- La cuantización introduce degradación medible: KL media de 0,034298 frente a 0 del BF16, y una pérdida adicional de respuesta contabilizada en la evaluación de 33 + 7 ítems.
- La comprobación estricta de cero regresiones falla en un ítem; solo se cumple el criterio relativo frente a Q4_K_M.
- Los siete ítems de "thinking" no aportan evidencia porque el modelo BF16 original no acierta ninguno; la evaluación de razonamiento extendido es, por tanto, incompleta.
- Idiomas declarados limitados a inglés y coreano; el rendimiento en castellano no está evaluado y puede degradarse respecto al modelo base.
- Riesgo de alucinación inherente a Llama 3.1 8B Instruct, no mitigado por la cuantización.
- Sesgos heredados del modelo base y de sus datos de entrenamiento; no se documentan evaluaciones de sesgo en esta exportación.
- La licencia Llama 3.1 Community License impone restricciones de uso comercial y obligaciones de atribución; deben revisarse LICENSE, USE_POLICY.md y NOTICE antes de producción.
- Los pesos en safetensors están en BF16 con valores ya redondeados; cargarlos en Transformers no reduce el uso de memoria, solo el empaquetado en TT-NN aprovecha el formato de bloque.
- tt-transformers y tt-forge no fueron verificados con este checkpoint según la model card.
- No se publican métricas de latencia ni throughput, lo que impide estimar coste operativo.
- El repositorio tiene 19 descargas y 0 likes, por lo que la validación comunitaria es escasa.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/Llama-3.1-8B-Instruct-Tenstorrent-Tensix-BFP4-Down8
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Repositorio de código (tensix-bfp-gptq): https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Licencia: https://huggingface.co/Xylolabs/Llama-3.1-8B-Instruct-Tenstorrent-Tensix-BFP4-Down8/blob/main/LICENSE
- Política de uso aceptable: USE_POLICY.md en el repositorio del modelo
- Atribuciones y cambios: NOTICE en el repositorio del modelo
- Licencia del código auxiliar (Apache 2.0): CODE_LICENSE en el repositorio del modelo
