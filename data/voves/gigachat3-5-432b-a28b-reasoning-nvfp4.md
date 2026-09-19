# voves/GigaChat3.5-432B-A28B-Reasoning-NVFP4

## Resumen

GigaChat3.5-432B-A28B-Reasoning-NVFP4 es una cuantización de 4 bits en formato NVFP4 del modelo ai-sage/GigaChat3.5-432B-A28B-Reasoning-bf16, publicada por el usuario voves en HuggingFace. Se trata, por tanto, de un checkpoint derivado: el trabajo original de entrenamiento corresponde al modelo base de ai-sage (familia GigaChat 3.5, variante orientada a razonamiento), y esta ficha describe la versión cuantizada, cuyo objetivo es reducir el peso en memoria y apoyarse en los tensor cores de quinta generación de las GPU NVIDIA Blackwell, que incorporan soporte nativo para el formato NVFP4.

La nomenclatura del identificador (-432B-A28B) indica 432 000 millones de parámetros totales y aproximadamente 28 000 millones de parámetros activos por token, lo que corresponde a una arquitectura de tipo Mixture of Experts (MoE). Esta combinación —un modelo muy grande en parámetros totales pero con una fracción pequeña activa por token— es la que hace viable el despliegue en clústeres de GPU de gama alta, y es la razón por la que una cuantización a 4 bits resulta especialmente relevante: reduce el peso de los pesos de aproximadamente 864 GB en bf16 a un entorno estimado de 240-260 GB.

El modelo declara soporte únicamente para ruso e inglés y licencia MIT. La model card publicada es mínima: no incluye datos de entrenamiento, longitud de contexto, benchmarks ni detalles de arquitectura, por lo que buena parte de las especificaciones de esta ficha figuran como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible en la model card; el patrón de nomenclatura -432B-A28B indica Mixture of Experts (MoE) |
| Parámetros totales | 432 000 millones (inferido del nombre del modelo; no confirmado en la model card) |
| Parámetros activos | 28 000 millones por token (inferido del nombre del modelo; no confirmado en la model card) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | NVFP4 (4 bits). El modelo base está publicado en bf16 |
| Idiomas soportados | Ruso (ru) e inglés (en) |
| Licencia | MIT |
| Formato de pesos | No disponible (los checkpoints NVFP4 se distribuyen habitualmente en safetensors, pero la model card no lo especifica) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna, el volumen de tokens de entrenamiento, la composición del dataset ni el proceso de alineamiento (RLHF, DPO u otros) del modelo base ai-sage/GigaChat3.5-432B-A28B-Reasoning-bf16. La model card del repositorio cuantizado se limita a declarar licencia, idiomas, modelo base y etiquetas (nvfp4, quantization, blackwell). El sufijo "Reasoning" del nombre indica que la variante base está orientada a tareas de razonamiento, pero no se detalla si emplea cadenas de pensamiento explícitas, modo "thinking" conmutables u otro mecanismo.

Respecto al propio proceso de cuantización, el checkpoint emplea NVFP4, un formato de coma flotante de 4 bits con escalado por bloques que NVIDIA introdujo para sus GPU Blackwell. En NVFP4 los valores se almacenan con 4 bits (1 bit de signo, 2 de exponente y 1 de mantisa) y se aplican factores de escala por bloque de 16 elementos, habitualmente en FP8 E4M3, junto con una escala global en FP32. Esto permite un error de cuantización notablemente menor que una cuantización entera de 4 bits sin escalado por bloques, a cambio de requerir kernels y hardware compatibles. No se han publicado en la información disponible los detalles concretos del procedimiento seguido por el autor (calibración, número de muestras, herramienta utilizada, ni si se preservaron capas sensibles en mayor precisión).

## Capacidades

- Generación de texto: el pipeline declarado es text-generation, por lo que el uso previsto es la generación de lenguaje natural.
- Razonamiento: el nombre del modelo base incluye la etiqueta "Reasoning", lo que indica que está orientado a tareas de razonamiento multi-paso. No se especifica el formato de activación ni si existe un modo de pensamiento separable.
- Multilingüismo limitado: la model card declara únicamente ruso e inglés. No hay constancia de soporte para castellano ni para otras lenguas.
- Capacidades de código, matemáticas o visión: no disponibles en la información proporcionada.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso con herramientas: no disponible.
- Capacidades especiales (modo thinking, audio, visión): no disponibles.

## Casos de uso

- Atención al cliente en ruso: un modelo de 432 000 millones de parámetros totales con 28 000 millones activos puede gestionar conversaciones multi-turno complejas y consultas con matices idiomáticos propios del ruso, un idioma con relativamente poca cobertura en los modelos occidentales. El coste por token es contenido gracias a la activación dispersa, y la licencia MIT facilita su integración en producto.
- Generación y revisión de código en entornos con documentación en ruso: el modelo puede emplearse para explicar, traducir o revisar bases de código cuyos comentarios y especificaciones estén en ruso, un escenario frecuente en equipos de Europa del Este.
- Traducción técnica ruso-inglés: al declarar ambos idiomas, es adecuado para traducir documentación técnica, contratos o artículos científicos manteniendo terminología especializada. No debe usarse para otros pares de idiomas sin validación previa.
- Evaluación de la degradación por cuantización: este checkpoint es útil en investigación para medir cuánto rendimiento se pierde al pasar de bf16 a NVFP4 en un MoE de razonamiento, comparando ambas versiones sobre el mismo conjunto de evaluación.
- Despliegue en infraestructura Blackwell: en clústeres con GPU B200 o GB200, la versión NVFP4 permite servir el modelo con la mitad de memoria y mayor throughput que la versión bf16, siempre que la pila de inferencia soporte el formato.
- Procesamiento de documentos largos con razonamiento: para tareas de análisis documental (informes, expedientes, literatura técnica) en ruso o inglés, sujeto a confirmar la longitud de contexto real del modelo base.
- Asistente interno de investigación y análisis: en entornos con hardware de gama alta y datos sensibles en ruso, el modelo puede desplegarse on-premise sin depender de API externas, gracias a la licencia MIT y a la disponibilidad de pesos abiertos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio no incluye métricas de MMLU, HumanEval, GSM8K ni de ningún otro conjunto de evaluación, ni tampoco comparaciones con la versión bf16 del modelo base que permitan cuantificar la pérdida de precisión introducida por la cuantización NVFP4.

## Requisitos de hardware

- VRAM estimada para inferencia: con 432 000 millones de parámetros y NVFP4 (aproximadamente 4,5 bits efectivos por parámetro contando escalas), los pesos ocupan del orden de 240-250 GB. Sumando caché KV y buffers de activación, un despliegue realista requiere un entorno de 280-320 GB de memoria de GPU, en función de la longitud de contexto y del tamaño de lote. Estimación propia a partir del número de parámetros; no confirmada por el autor.
- GPU recomendadas: el formato NVFP4 está diseñado para la arquitectura Blackwell (sm_100), por lo que las opciones naturales son NVIDIA B200 (192 GB por GPU) o GB200. Con B200 serían necesarias al menos dos unidades, o más si se quiere contexto largo y lotes grandes.
- Compatibilidad con Hopper (H100/H200): no es el camino recomendado. NVFP4 no tiene soporte nativo en sm_90 y requiere kernels de emulación; el rendimiento y la compatibilidad dependen de la pila de inferencia utilizada.
- GPU de consumo: no cabe en ninguna GPU de consumo. Incluso en el mejor de los casos, los pesos superan por un orden de magnitud los 32 GB de una RTX 5090, y el modelo no está pensado para ejecución en una sola tarjeta.
- Opciones de despliegue: los checkpoints NVFP4 se sirven típicamente con vLLM, SGLang o TensorRT-LLM (formato NVIDIA Model Optimizer). No hay información en la model card sobre compatibilidad con llama.cpp, Ollama, TGI u otros motores; la conversión a GGUF requeriría un proceso adicional no documentado aquí.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones para este checkpoint.

## Comparativa con modelos similares

Los valores de los modelos comparados proceden de sus fichas públicas y no han podido verificarse durante esta búsqueda; conviene confirmarlos antes de citarlos. Para este modelo, los parámetros son inferidos del nombre.

| Modelo | Parámetros totales / activos | Contexto | Licencia | Idiomas declarados | Disponibilidad |
|---|---|---|---|---|---|
| GigaChat3.5-432B-A28B-Reasoning-NVFP4 | 432 000 M / 28 000 M (inferido) | No disponible | MIT | ru, en | Pesos en HuggingFace (NVFP4) |
| GigaChat3.5-432B-A28B-Reasoning-bf16 (modelo base) | 432 000 M / 28 000 M (inferido) | No disponible | No disponible | ru, en | Pesos en HuggingFace (bf16) |
| DeepSeek-V3 | 671 000 M / 37 000 M | 128 000 tokens | Licencia permisiva de DeepSeek (verificar) | Multilingüe | Pesos abiertos |
| Qwen3-235B-A22B | 235 000 M / 22 000 M | 128 000 tokens | Apache 2.0 | Multilingüe (más de 100 idiomas) | Pesos abiertos |

La diferencia principal de esta ficha frente a las alternativas es la cobertura idiomática: el modelo de ai-sage se limita al ruso y al inglés, mientras que DeepSeek-V3 y Qwen3 declaran cobertura multilingüe amplia. Como contrapartida, para aplicaciones centradas en ruso un modelo entrenado específicamente para ese idioma puede ofrecer un comportamiento más ajustado. No hay datos de benchmarks que permitan comparar calidad.

## Limitaciones y advertencias

- Documentación prácticamente inexistente: la model card no incluye información sobre entrenamiento, contexto, datos, alineamiento ni evaluación. Cualquier decisión de producción basada en este repositorio parte de una base informativa muy débil.
- Sin validación comunitaria: el repositorio registra 0 descargas y 0 likes en el momento de redactar esta ficha, por lo que no hay evidencia externa de que la cuantización funcione correctamente ni de su fidelidad respecto al modelo base.
- Degradación por cuantización no medida: NVFP4 reduce el peso a 4 bits por parámetro con escalado por bloques, lo que mitiga el error respecto a una cuantización entera de 4 bits, pero no lo elimina. No hay ninguna medición publicada de la pérdida de calidad frente a la versión bf16, especialmente crítica en modelos de razonamiento, donde pequeños errores pueden desviar cadenas de pensamiento completas.
- Riesgo de alucinación: inherente a los modelos de lenguaje y potencialmente más relevante en modelos de razonamiento que generan cadenas largas de pasos, donde un error temprano se propaga. No hay evaluación publicada sobre este checkpoint.
- Sesgos: no disponibles. Un modelo entrenado principalmente con datos en ruso puede reflejar sesgos culturales, políticos y geográficos propios de ese corpus. No se documenta ningún proceso de mitigación.
- Limitación idiomática: solo ruso e inglés. El uso en castellano no está soportado ni evaluado y probablemente degrade la calidad de forma notable.
- Contexto desconocido: no se especifica la ventana de contexto, lo que impide planificar casos de uso con documentos largos.
- Restricciones de hardware: NVFP4 está orientado a Blackwell. En hardware anterior el soporte depende de kernels de emulación, con rendimiento incierto.
- Licencia: el repositorio declara MIT, pero se trata de una licencia declarada por el autor de la cuantización sobre un modelo derivado. Es imprescindible verificar la licencia y las condiciones de uso del modelo base ai-sage/GigaChat3.5-432B-A28B-Reasoning-bf16 antes de cualquier uso comercial, ya que la licencia del derivado no puede ser más permisiva que la del original.
- Fecha de publicación: el repositorio figura creado el 19 de septiembre de 2026, con actualización dos minutos después, lo que sugiere una publicación reciente y sin mantenimiento posterior documentado.

## Enlaces

- Repositorio del modelo cuantizado: https://huggingface.co/voves/GigaChat3.5-432B-A28B-Reasoning-NVFP4
- Modelo base (bf16): https://huggingface.co/ai-sage/GigaChat3.5-432B-A28B-Reasoning-bf16
- Organización ai-sage en HuggingFace: https://huggingface.co/ai-sage
- Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los únicos resultados obtenidos correspondían a páginas de conciertos sin relación con el contenido de esta ficha. No se dispone, por tanto, de enlaces a papers, blogs técnicos, repositorios de código ni demos.
