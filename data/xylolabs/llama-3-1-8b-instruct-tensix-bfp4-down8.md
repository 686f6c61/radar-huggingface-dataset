# Xylolabs/Llama-3.1-8B-Instruct-Tensix-BFP4-Down8

## Resumen

Llama-3.1-8B-Instruct-Tensix-BFP4-Down8 es una exportación cuantizada del modelo meta-llama/Llama-3.1-8B-Instruct, empaquetada por Xylolabs para su ejecución sobre aceleradores Tenstorrent Tensix mediante el stack tt-metal y TT-NN. El checkpoint mantiene la arquitectura transformer decoder-only original de 8.030.261.248 parámetros, pero sustituye la representación de los pesos de determinadas proyecciones por formatos de coma flotante en bloque (block floating point, BFP): las matrices de atención y de las proyecciones gate/up del MLP se almacenan en bfloat4_b con GPTQ y búsqueda de exponente, mientras que las proyecciones down del MLP usan bfloat8_b con redondeo al más cercano.

El objetivo del modelo no es mejorar la calidad del Llama 3.1 original, sino ofrecer un checkpoint que pueda cargarse y ejecutarse de forma nativa en hardware Tenstorrent con un consumo de memoria reducido: los pesos del modelo de lenguaje ocupan aproximadamente 6,97 GB, con una media de 6,941 bits por peso sobre el total de pesos almacenados. Esto lo hace relevante para quienes despliegan inferencia en aceleradores Tensix y necesitan una representación compatible con las comprobaciones de empaquetado de TT-NN, incluyendo BFP8.

La ficha del autor documenta verificaciones de representación (que cada tensor cargado coincide con su valor exportado), una evaluación de divergencia KL frente al BF16 original sobre textos en inglés y coreano, y comparaciones con una cuantización Q4_K_M emparejada. No se reportan métricas de velocidad ni resultados de benchmarks estándar como MMLU o HumanEval.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1), con cuantización block floating point en proyecciones seleccionadas |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Llama 3.1, 128k tokens, no confirmada en esta exportacion) |
| Tipos de cuantizacion | BFP4 (bfloat4_b) con GPTQ y busqueda de exponente en 192 matrices de atencion y gate/up del MLP (4,5 bits/peso); BFP8 (bfloat8_b) con redondeo al mas cercano en 32 matrices down del MLP (8,5 bits/peso); BF16 en embedding de entrada, LM head y 67 tensores restantes; media de 6,941 bits/peso |
| Idiomas soportados | en, ko |
| Licencia | llama3.1 (Llama 3.1 Community License Agreement) |
| Formato de pesos | safetensors (BF16 en disco, con valores redondeados; empaquetado BFP para dispositivo) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.1 8B Instruct: un transformer decoder-only con atención multi-cabeza agrupada (GQA), normalización RMSNorm y activación SwiGLU en el MLP, entrenado originalmente por Meta. Esta exportación no introduce cambios estructurales ni reentrenamiento; aplica cuantización post-entrenamiento sobre los pesos del modelo base. Concretamente, 192 matrices correspondientes a las proyecciones de atención y a las proyecciones gate/up del MLP se cuantizan a bfloat4_b mediante GPTQ con damping 0,1 y búsqueda de exponente de bloque, mientras que 32 matrices de la proyección down del MLP se cuantizan a bfloat8_b por redondeo al más cercano. El embedding de entrada (no atado), la LM head y otras 67 entradas permanecen en BF16.

El proceso de empaquetado está implementado en el repositorio tensix-bfp-gptq de Xylolabs. El autor indica que las 224 matrices declaradas superan las comprobaciones de rejilla y de empaquetado nativo de TT-NN, incluido el empaquetado como BFP8, y que el ejemplo de carga se valida en el simulador Blackhole con TT-NN 0.81.1. Los scripts `pack_tensix.py` y `verify_grid.py` permiten verificar la representación de cada matriz y, opcionalmente, realizar un viaje de ida y vuelta por DRAM. No se documentan detalles sobre datos de entrenamiento adicionales, RLHF o DPO específicos de esta exportación, ya que no se realizó entrenamiento; la información de entrenamiento corresponde al modelo base de Meta y no se detalla en la model card.

## Capacidades

- Generación de texto conversacional en inglés y coreano, heredada del modelo Instruct base.
- Razonamiento y respuesta a instrucciones en formato chat (plantilla de chat de Llama 3.1).
- Generación de código y matemáticas, según las capacidades del modelo base (no verificadas de forma específica en esta exportación).
- Soporte de tool calling y function calling, heredado del modelo base Llama 3.1 Instruct (no validado en esta cuantización según la información disponible).
- Ejecución nativa en hardware Tenstorrent Tensix mediante TT-NN, con empaquetado BFP4/BFP8.
- Carga estándar con Transformers 5.23.0 y PyTorch en BF16 para inspección o inferencia en host.
- No se documentan capacidades de visión, audio ni modo de razonamiento extendido (thinking mode) en esta exportación.

## Casos de uso

- Despliegue de inferencia en aceleradores Tenstorrent: el checkpoint está diseñado para cargarse en TT-NN con empaquetado BFP nativo, lo que permite ejecutar Llama 3.1 8B en hardware Tensix con un footprint de pesos de aproximadamente 6,97 GB, adecuado para entornos con memoria de dispositivo limitada.
- Verificación de pipelines de cuantización: los scripts `pack_tensix.py` y `verify_grid.py` permiten validar que las matrices cuantizadas cumplen las restricciones de rejilla y empaquetado de TT-NN antes de desplegar en producción.
- Evaluación de degradación por cuantización: la métrica de divergencia KL frente al BF16 original (0,034298 sobre 16.056 posiciones) sirve para comparar el impacto de BFP4/BFP8 frente a otras cuantizaciones como Q4_K_M en tareas de texto en inglés y coreano.
- Prototipado de asistentes conversacionales en inglés y coreano: el modelo conserva la plantilla de chat y el comportamiento Instruct del base, por lo que puede usarse para generar respuestas multi-turno en estos idiomas.
- Investigación en formatos block floating point: el checkpoint documenta el uso de GPTQ con búsqueda de exponente para BFP4 y redondeo al más cercano para BFP8, lo que lo convierte en un caso de estudio para comparar estrategias de cuantización en hardware con formatos BFP nativos.
- Integración en pipelines de Transformers: al poder cargarse con `AutoModelForCausalLM` en BF16 y `device_map="auto"`, puede utilizarse como referencia para comparar la salida del host con la ejecución en Tensix.
- Base para experimentos de empaquetado en BFP8: el autor indica que todas las matrices declaradas pasan también el empaquetado como BFP8, lo que permite probar configuraciones alternativas de precisión en TT-NN.

## Benchmarks y rendimiento

| Perfil | KL media | Aciertos normales / 33 | Aciertos thinking / 7 | Perdidas contabilizadas |
|---|---:|---:|---:|---:|
| BF16 original | 0 | 28 | 0 | — |
| Esta exportacion | 0,034298 | 29 | 0 | 1 |
| Q4_K_M emparejado | 0,032352 | 30 | 0 | 0 |

La KL se calcula sobre 16.056 posiciones puntuadas de textos en inglés y coreano, tanto en bruto como en formato chat, con cuatro fragmentos de 1.024 tokens por texto. El suelo de BF16 en llama.cpp es 0,000309. La regla relativa 7 se cumple: la KL de esta exportación es 1,060151 veces la de Q4_K_M, dentro del límite de 1,5 veces, y no supera en más de una respuesta contabilizada la pérdida adicional. La comprobación estricta de cero regresiones falla en un ítem. El modelo BF16 original no acierta ningún ítem de thinking, por lo que esos siete ítems no aportan evidencia de regresión elegible. No se reportan métricas de velocidad ni benchmarks estándar como MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos del modelo de lenguaje ocupan aproximadamente 6,97 GB en el dispositivo, más espacio para la caché KV y buffers. El repositorio en disco ocupa 16,1 GB en safetensors BF16.
- GPU recomendadas: no se especifican GPU concretas; el destino principal es hardware Tenstorrent Tensix (Blackhole verificado en simulador con TT-NN 0.81.1). Para carga en host se requiere Transformers 5.23.0 y PyTorch con `device_map="auto"`.
- Compatibilidad con GPU de consumo: no confirmada en la información proporcionada; el footprint de pesos (~6,97 GB) es compatible con GPUs de 8 GB o más en teoría, pero no se documenta ni valida.
- Opciones de despliegue: TT-NN/tt-metal para Tensix; Transformers para carga en host; no se mencionan vLLM, llama.cpp, Ollama ni TGI para esta exportación.
- Latencia y throughput: no reportados; el autor indica explícitamente que no se informa de velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato/cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.1-8B-Instruct-Tensix-BFP4-Down8 | 8.030.261.248 | no disponible en esta exportacion | BFP4 + BFP8 + BF16, safetensors | llama3.1 | Hugging Face (Xylolabs) |
| meta-llama/Llama-3.1-8B-Instruct (BF16) | 8.030.261.248 | 128k (modelo base) | BF16 | llama3.1 | Hugging Face (Meta) |
| Cuantizacion Q4_K_M emparejada (referencia del autor) | 8.030.261.248 | no disponible | Q4_K_M | depende del empaquetado | usada como comparacion en la model card |
| Otras exportaciones Tensix de Xylolabs | no disponible | no disponible | BFP4/BFP8 variantes | llama3.1 | Hugging Face (Xylolabs) |

La comparación directa con Q4_K_M muestra una KL media ligeramente superior en esta exportación (0,034298 frente a 0,032352) y una respuesta contabilizada perdida adicional, dentro del margen permitido por la regla relativa del autor. No se dispone de comparaciones con otros modelos de 8B en benchmarks estándar.

## Limitaciones y advertencias

- La cuantización BFP4/BFP8 introduce degradación medible: KL media de 0,034298 frente a 0 en BF16, con una pérdida adicional contabilizada frente a Q4_K_M.
- La comprobación estricta de cero regresiones falla en un ítem; solo se cumple la regla relativa que permite una pérdida adicional.
- Los siete ítems de thinking no aportan evidencia de regresión porque el modelo BF16 original no acierta ninguno.
- No se reportan benchmarks estándar (MMLU, HumanEval, GSM8K) ni métricas de velocidad, por lo que el rendimiento en tareas reales no está cuantificado en la información disponible.
- Idiomas declarados limitados a inglés y coreano; el comportamiento en castellano no está validado en esta exportación.
- La licencia Llama 3.1 Community License impone restricciones de uso comercial y obligaciones de atribución; se aplican el acuerdo y la política de uso aceptable.
- El autor indica que tt-transformers y tt-forge no fueron verificados con este checkpoint; solo se validaron las comprobaciones de representación y el simulador Blackhole.
- Riesgo de alucinación y sesgos heredados del modelo base Llama 3.1 Instruct, no evaluados específicamente en esta cuantización.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria documentada.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/Llama-3.1-8B-Instruct-Tensix-BFP4-Down8
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Repositorio de codigo: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentacion de Tenstorrent: https://docs.tenstorrent.com
- Licencia: https://huggingface.co/Xylolabs/Llama-3.1-8B-Instruct-Tensix-BFP4-Down8/blob/main/LICENSE
- Assets de Xylolabs: https://raw.githubusercontent.com/XylolabsInc/tensix-bfp-gptq/main/assets/xylolabs-lockup.svg
