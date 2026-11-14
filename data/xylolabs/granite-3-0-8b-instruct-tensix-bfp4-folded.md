# Xylolabs/granite-3.0-8b-instruct-Tensix-BFP4-Folded

## Resumen

Este repositorio contiene una cuantización específica de IBM Granite 3.0 8B Instruct, preparada por Xylolabs para su ejecución sobre aceleradores Tenstorrent Tensix mediante el stack TT-NN y tt-metal. No se trata de un modelo nuevo, sino de una exportación del modelo base de IBM con las proyecciones de atención y MLP cuantizadas en formato block floating point de 4 bits (bfloat4_b), con los multiplicadores residuales plegados en los pesos de salida de atención y de bajada del MLP antes de la cuantización.

El modelo base, Granite 3.0 8B Instruct, es un transformer decoder-only denso de 8.372 millones de parámetros con licencia Apache 2.0, orientado a generación de texto conversacional y tareas de instrucciones. Esta exportación conserva el tokenizador, la plantilla de chat, el vocabulario y la configuración de EOS del original, y mantiene en BF16 la embedding de entrada, la cabeza de salida (con copia explícita del embedding atado) y las normas.

La relevancia de esta ficha es acotada: es un artefacto de despliegue para hardware Tenstorrent, no una alternativa generalista. Su interés está en que demuestra una ruta de cuantización BFP4 verificable sobre Tensix, con validación de empaquetado matriz a matriz y una evaluación de divergencia KL frente al BF16 original. Para el desarrollador que no use hardware Tenstorrent, el modelo base de IBM es la referencia adecuada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (modelo base Granite 3.0 8B Instruct) |
| Parametros totales | 8.372.187.136 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | BFP4 (bfloat4_b, 4,5 bits por peso) en proyecciones q/k/v/output y gate/up/down; BF16 en embedding, cabeza atada y normas; GPTQ con búsqueda de exponente por bloque |
| Idiomas soportados | en, ko |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (valores BF16 sobre rejillas BFP4), más `quant4.json` con los formatos de las 280 matrices de proyección |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Granite 3.0 8B Instruct de IBM: un transformer decoder-only denso de 40 capas con proyecciones de atención q/k/v/output y MLP gate/up/down. Esta exportación no reentrena el modelo; aplica cuantización GPTQ sobre esas 280 matrices de proyección con amortiguación (damping) de 0,1 y 65.536 tokens de calibración procedentes de WikiText-2 y de Wikipedia en coreano. Antes de cuantizar, el multiplicador residual se pliega en las 80 matrices de salida de atención y de bajada del MLP, y la configuración entregada fija `residual_multiplier: 1.0` para que la escala ya plegada se aplique una sola vez.

La innovación técnica está en el formato: los pesos se almacenan como valores BF16 situados sobre rejillas de block floating point de 4 bits, con búsqueda del exponente por bloque durante el GPTQ. El archivo ocupa unos 5,29 GB empaquetados (media de 5,05 bits por peso almacenado, incluyendo las dos copias explícitas de embedding y cabeza), aunque como valores BF16 ocuparía 16,74 GB. El autor verifica que las 280 matrices pasan la rejilla, el empaquetado nativo de TT-NN y el empaquetado como BFP8, y que el ejemplo exacto pasa en el simulador Blackhole con TT-NN 0.81.1. No se ejecutaron tt-transformers ni tt-forge con este checkpoint.

## Capacidades

- Generación de texto conversacional e instrucciones, heredadas del modelo base Granite 3.0 8B Instruct.
- Razonamiento y respuesta a instrucciones en inglés y coreano, los dos idiomas declarados.
- Plantilla de chat y tokenizador originales de IBM, con configuración de EOS preservada.
- Ejecución sobre aceleradores Tenstorrent Tensix mediante TT-NN, con empaquetado nativo BFP4 y BFP8 verificado.
- Inferencia en PyTorch/Transformers 5.23.0 en BF16 como ruta alternativa de ejecución en host.
- No se documentan en la información disponible capacidades de tool calling, agentes, visión, audio ni modo de razonamiento explícito para esta exportación.

## Casos de uso

- Despliegue en hardware Tenstorrent: el checkpoint está pensado para cargarse en aceleradores Tensix con TT-NN, donde sus 5,29 GB de pesos cuantizados reducen la huella de memoria de dispositivo frente al BF16 original.
- Validación de pipelines de cuantización: los scripts `pack_tensix.py` y `verify_grid.py` permiten comprobar matriz a matriz que el empaquetado BFP4 no altera valores, útil para equipos que construyen sus propias rutas de cuantización.
- Evaluación de degradación por cuantización: la tabla de KL frente al BF16 original y frente a Q4_K_M sirve para decidir si BFP4 es aceptable en una tarea concreta antes de comprometerse con el formato.
- Prototipado en simulador: el paso por el simulador Blackhole permite desarrollar y depurar kernels TT-NN sin disponer de la tarjeta física.
- Asistente conversacional en inglés o coreano sobre host: la ruta Transformers en BF16 permite usar el modelo en un servidor convencional cuando no se dispone de Tensix.
- Referencia para plegado de residuales: el patrón de plegar el multiplicador residual en las matrices de salida antes de cuantizar es reutilizable en otras exportaciones del mismo modelo base.

## Benchmarks y rendimiento

| Perfil | KL media frente a BF16 original sin plegar | Aciertos normales / 33 | Aciertos de razonamiento / 7 | Pérdidas contabilizadas |
|---|---:|---:|---:|---:|
| BF16 original sin plegar | 0 | 25 | 0 | — |
| Esta exportación BFP4 plegada | 0,073263472930 | 26 | 0 | 0 |
| Q4_K_M del mismo modelo original | 0,059211 | 23 | 0 | 0 |

La puerta relativa de la regla 7 del host se cumple: la KL de esta exportación es 1,237329 veces la de Q4_K_M, dentro del límite de 1,5 veces, y no añade pérdidas contabilizadas. Los siete ítems de razonamiento no tienen respuesta elegible correcta en BF16, por lo que esa columna no discrimina. Las puntuaciones proceden de las mismas 33 indicaciones normales y siete de razonamiento, evaluadas con la misma CLI canónica de benchmark.

## Requisitos de hardware

- Memoria de dispositivo: aproximadamente 5,29 GB solo para los pesos del modelo de lenguaje, más espacio para la caché KV y los búferes.
- Hardware objetivo: aceleradores Tenstorrent Tensix, con verificación en el simulador Blackhole y TT-NN 0.81.1.
- Ruta host: Transformers 5.23.0 con PyTorch en BF16 y `device_map="auto"`; el repositorio ocupa 16,7 GB, por lo que la carga completa en BF16 requiere holgura de memoria en GPU o CPU.
- GPU consumer: no se documenta compatibilidad ni rendimiento en GPU convencionales para esta exportación; el formato BFP4 es específico de Tensix.
- Opciones de despliegue: TT-NN sobre Tensix, o Transformers en host. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Esta exportación (BFP4 plegada) | 8.372.187.136 | no disponible | BFP4 + BF16 parcial | Apache 2.0 | Hugging Face, orientada a Tensix |
| ibm-granite/granite-3.0-8b-instruct | 8.372.187.136 | no disponible | BF16 original | Apache 2.0 | Hugging Face, uso general |
| Q4_K_M del mismo original | 8.372.187.136 | no disponible | Q4_K_M | Apache 2.0 | Derivado de GGUF, uso general |

La comparación relevante es interna al mismo modelo base: esta exportación obtiene una KL de 0,073 frente a 0,059 de Q4_K_M, es decir, algo más de degradación que la cuantización GGUF de referencia, pero dentro del margen aceptado por el autor y con un acierto normal superior (26 frente a 23 sobre 33). No se dispone de comparaciones con otros modelos de 8B en la información proporcionada.

## Limitaciones y advertencias

- Es un artefacto de despliegue para Tensix, no un modelo nuevo: hereda sesgos, alucinaciones y limitaciones del Granite 3.0 8B Instruct original.
- Solo declara inglés y coreano; el rendimiento en castellano no está evaluado ni garantizado.
- La longitud de contexto no se especifica en la información disponible; conviene consultar la model card del modelo base antes de diseñar aplicaciones de contexto largo.
- El formato BFP4 es específico de Tenstorrent: fuera de TT-NN, la ruta práctica es cargar en BF16 con Transformers, lo que anula la ventaja de memoria.
- El autor advierte de que tt-transformers y tt-forge no se probaron con este checkpoint; la integración con esos stacks no está validada.
- La evaluación es reducida: 33 indicaciones normales y 7 de razonamiento, sin ítems de razonamiento con respuesta correcta en BF16, por lo que la cobertura de casos difíciles es limitada.
- El repositorio tiene 0 descargas y 0 likes, sin validación independiente por parte de la comunidad.
- La licencia Apache 2.0 permite uso comercial, pero debe conservarse el aviso de licencia y verificarse las condiciones del modelo base de IBM.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/granite-3.0-8b-instruct-Tensix-BFP4-Folded
- Modelo base: https://huggingface.co/ibm-granite/granite-3.0-8b-instruct
- Código de cuantización: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Licencia: https://huggingface.co/Xylolabs/granite-3.0-8b-instruct-Tensix-BFP4-Folded/blob/main/LICENSE
