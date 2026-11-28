# styal/Luciole-115M

## Resumen

Luciole-115M es un modelo de lenguaje de tipo Llama 3 entrenado desde cero por el autor independiente styal. Con 114.050.304 parámetros (aproximadamente 114 millones), se posiciona en la categoría de modelos pequeños, pensados para experimentación, prototipado rápido y despliegue en hardware muy limitado. El modelo se ha preentrenado sobre 2.900 millones de tokens procedentes del dataset propio styal/LucioleData-2M, sin que la model card documente fases posteriores de ajuste fino supervisado o alineación.

La relevancia de este modelo es fundamentalmente práctica y educativa: permite reproducir el pipeline completo de entrenamiento de un transformer tipo Llama a pequeña escala y sirve como banco de pruebas para técnicas de tokenización, arquitectura y evaluación. No obstante, sus resultados en benchmarks son en su mayoría cercanos al azar, lo que lo descarta para tareas de producción que requieran razonamiento fiable.

El modelo se distribuye en formato safetensors bajo la librería transformers, con un tamaño de repositorio de 0,9 GB. La información pública disponible es escasa: no se documentan licencia, idiomas soportados ni detalles del dataset de entrenamiento más allá de su nombre y volumen.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Llama 3 (transformer decoder-only), según la model card |
| Parámetros totales | 114.050.304 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; compatible con cuantización estándar vía herramientas externas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card indica que Luciole-115M es un modelo Llama 3 preentrenado desde cero sobre 2.900 millones de tokens del dataset styal/LucioleData-2M. Se trata, por tanto, de un transformer decoder-only con la estructura típica de la familia Llama 3 (atención causal, capas de normalización RMSNorm y FFN con SwiGLU, presumiblemente), aunque la model card no detalla hiperparámetros como número de capas, dimensión oculta, número de cabezas de atención ni tamaño de vocabulario.

No se documenta el uso de RLHF, DPO, SFT ni ninguna otra fase de alineación posterior al preentrenamiento. Tampoco se especifica la composición del dataset más allá de su nombre y del número total de tokens, ni se mencionan innovaciones técnicas como decodificación especulativa o atención lineal. La información disponible no permite reconstruir el proceso de entrenamiento con el nivel de detalle habitual en fichas técnicas.

## Capacidades

- Generación de texto autoregresiva básica, heredada de la arquitectura Llama 3.
- Conversación y generación de texto etiquetadas en el pipeline del modelo (text-generation, conversational).
- Compatibilidad con text-generation-inference y endpoints compatibles, según los tags del repositorio.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles (no se especifican idiomas).
- No se documentan capacidades especiales como modo thinking, visión o audio.
- Rendimiento en matemáticas y razonamiento: prácticamente nulo según los benchmarks publicados (GSM8K 5-shot = 0,0; MMLU = 23,1).

## Casos de uso

- Experimentación educativa con arquitecturas Llama: el modelo permite estudiar el comportamiento de un transformer decoder-only de 114M parámetros entrenado desde cero, inspeccionando curvas de pérdida, tokenización y dinámica de entrenamiento sin necesidad de grandes recursos.
- Prototipado de pipelines de inferencia: sirve para validar integraciones con transformers, text-generation-inference y endpoints compatibles antes de migrar a modelos mayores, gracias a su reducido tamaño (0,9 GB).
- Pruebas de cuantización y optimización: al ser un modelo pequeño, es adecuado para medir el impacto de distintas cuantizaciones (GGUF, GPTQ, etc.) en calidad y latencia sin consumir mucho hardware.
- Generación de texto de relleno en demos y entornos de desarrollo: puede emplearse para poblar interfaces o tests de integración donde la calidad lingüística no sea crítica.
- Benchmarking de infraestructura: útil como carga ligera para medir throughput y latencia de servidores de inferencia (vLLM, TGI) antes de desplegar modelos de producción.
- Investigación sobre datasets pequeños: permite reproducir el efecto de entrenar con 2.900 millones de tokens sobre un corpus concreto (LucioleData-2M) y comparar con otros modelos de tamaño similar.
- No se recomienda su uso en atención al cliente, generación de código en producción ni tareas que requieran razonamiento fiable, dado su rendimiento cercano al azar en la mayoría de benchmarks.

## Benchmarks y rendimiento

Resultados publicados en la model card:

| Benchmark | Luciole-115M |
|---|---|
| HellaSwag | 27,3 |
| ARC Easy | 52,8 |
| PIQA | 58,6 |
| MMLU | 23,1 |
| CommonsenseQA | 19,7 |
| Winogrande | 51,4 |
| OpenBookQA | 18,0 |
| GSM8K (5-shot) | 0,0 |

El propio autor señala que el rendimiento es cercano al azar en casi todos los benchmarks, con la excepción de ARC Easy (52,8) y PIQA (58,6), donde obtiene resultados relativamente aceptables para su tamaño. No se proporcionan comparaciones con modelos similares en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 0,23 GB solo para pesos (114M × 2 bytes), más overhead de activaciones y KV cache; en la práctica cabe holgadamente en cualquier GPU con 1-2 GB libres.
- En cuantización de 8 bits: alrededor de 0,12 GB de pesos; en 4 bits: alrededor de 0,06 GB.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) e incluso iGPU o CPU para inferencia en llama.cpp.
- Cabe en GPU consumer sin problema; también es viable en CPU y en dispositivos de borde.
- Opciones de despliegue: transformers (nativo), text-generation-inference (según tags), llama.cpp/Ollama tras conversión a GGUF, y potencialmente vLLM si la arquitectura es compatible.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por su tamaño, se espera latencia muy baja en GPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos publicados en la información proporcionada para modelos de tamaño similar (por ejemplo, SmolLM-135M, Qwen2.5-0.5B o TinyLlama-1.1B). La siguiente tabla recoge únicamente los datos conocidos de Luciole-115M y deja el resto como no disponible:

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Luciole-115M | 114M | no disponible | no disponible | Hugging Face (styal/Luciole-115M) |
| SmolLM-135M | no disponible en esta ficha | no disponible | no disponible | no disponible |
| Qwen2.5-0.5B | no disponible en esta ficha | no disponible | no disponible | no disponible |
| TinyLlama-1.1B | no disponible en esta ficha | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Rendimiento cercano al azar en la mayoría de benchmarks (MMLU 23,1; GSM8K 0,0; OpenBookQA 18,0), lo que implica alta probabilidad de respuestas incorrectas o incoherentes.
- Riesgo elevado de alucinación y de generación de texto sin sentido, especialmente en tareas de razonamiento o matemáticas.
- No se documentan sesgos conocidos, pero al no especificarse la composición del dataset de entrenamiento no es posible evaluar sesgos de género, raza o ideológicos.
- Longitud de contexto no documentada; no se recomienda su uso en conversaciones de contexto largo.
- Idiomas soportados no documentados; no hay garantía de calidad en castellano ni en ningún otro idioma.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; se recomienda contactar con el autor antes de cualquier despliegue en producción.
- Sin fases de alineación documentadas (RLHF/DPO/SFT), por lo que no cabe esperar comportamiento conversacional seguro ni rechazo de peticiones dañinas.
- Modelo con muy pocas descargas (109) y sin likes, lo que sugiere escasa validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/styal/Luciole-115M
- Dataset de entrenamiento: https://huggingface.co/datasets/styal/LucioleData-2M (referenciado en la model card)
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información proporcionada.
