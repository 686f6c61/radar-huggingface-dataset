# Yuivdldk/gemma3-4b-gsm8k-kd

## Resumen

gemma3-4b-gsm8k-kd es un ajuste fino del modelo google/gemma-3-4b-it publicado por el usuario Yuivdldk en HuggingFace. Se trata de un artefacto de investigación cuyo objetivo es aplicar destilación de conocimiento basada en logits (logit-based knowledge distillation) sobre el conjunto de datos GSM8K, usando google/gemma-3-27b-it como modelo profesor y Gemma 3 4B como modelo estudiante. El repositorio tiene 0 descargas y 0 likes en el momento de redactar esta ficha.

El interés técnico del experimento reside en su método: una destilación top-k con tratamiento explícito de la cola de la distribución (tail-aware), combinada con pérdida de entropía cruzada sobre etiquetas duras en los tokens de respuesta de GSM8K. La configuración incluye max_seq_len de 768, top_k de 64, temperatura de 2.0, alpha de 0.5 y un logp_floor de -20.7, con dos épocas y un learning rate de 1e-5.

Es importante señalar que el propio autor advierte de que la evaluación más reciente mostró un comportamiento anómalo de generación: exactitud de 0.0000 en el conjunto de test completo y una media de 512 tokens generados por respuesta, lo que coincide con el límite de generación. El autor indica explícitamente que la carga debe tratarse como una copia de seguridad privada o artefacto experimental, no como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 3, etiqueta gemma3_text) |
| Parametros totales | 3.880.263.168 (3,88 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en el repositorio; el modelo base google/gemma-3-4b-it declara 128.000 tokens |
| Tipos de cuantizacion | pesos publicados en safetensors (aproximadamente 2 bytes por parametro, bf16/fp16); no se publican GGUF, AWQ ni GPTQ |
| Idiomas soportados | no disponible |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors |
| Modelo base | google/gemma-3-4b-it |
| Modelo profesor | google/gemma-3-27b-it |
| Dataset de entrenamiento | openai/gsm8k |
| Tamano del repositorio | 7,8 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura corresponde al modelo base google/gemma-3-4b-it, un transformer decoder-only de 3,88 mil millones de parametros con pesos en safetensors. El ajuste no modifica la topología del modelo: se parte del checkpoint instruct ya entrenado por Google y se aplica un entrenamiento adicional de destilación de conocimiento. La etiqueta gemma3_text indica que el pipeline utilizado trabaja sobre la torre de texto del modelo.

El entrenamiento combina dos señales de pérdida. Por un lado, una pérdida de entropía cruzada estándar sobre las etiquetas duras en los tokens de respuesta de GSM8K. Por otro, una pérdida de destilación obtenida a partir de las log-probabilidades top-k del profesor y de un bucket adicional que agrupa la cola de la distribución (tail-aware). Los hiperparámetros documentados son: top_k de 64, temperatura de 2.0, alpha de 0.5 (peso relativo de ambas pérdidas), logp_floor de -20.7, longitud máxima de secuencia de 768 tokens, dos épocas, learning rate de 1e-5, batch size de 16, sin acumulación de gradiente, semilla 42 y modo estudiante "full" (todos los parametros entrenables). No se documenta el uso de RLHF ni DPO, ni el número total de tokens de entrenamiento, ni la composición exacta del dataset más allá de GSM8K.

## Capacidades

- Generación de texto y razonamiento aritmético de nivel escolar, heredados del modelo base Gemma 3 4B instruct.
- Resolución de problemas matemáticos de tipo GSM8K, objetivo declarado del ajuste.
- Conversación multi-turno (capacidad heredada del checkpoint instruct).
- Soporte multilingüe: no disponible en la información proporcionada.
- Tool calling / function calling: no documentado en el repositorio, aunque el modelo base Gemma 3 sí lo soporta.
- Capacidades de agente y razonamiento multi-paso: no documentadas para este ajuste.
- Capacidad de visión: no disponible; la etiqueta de arquitectura es gemma3_text.
- Modo de pensamiento explícito (thinking mode): no documentado.
- Advertencia: la evaluación reportada por el autor indica que la generación actual es anómala (ACC = 0.0000, 512 tokens de media), por lo que ninguna de estas capacidades está verificada en este checkpoint.

## Casos de uso

- Reproducción de experimentos de destilación de conocimiento: el repositorio documenta la configuración completa (top_k, temperatura, alpha, logp_floor), lo que permite replicar el método y comparar variantes de destilación top-k frente a destilación completa.
- Estudio de fallos en destilación de logits: el caso documentado de exactitud cero con generaciones que agotan el límite de 512 tokens constituye un ejemplo útil para investigar colapso de la distribución del estudiante o desalineación entre profesor y estudiante.
- Punto de partida para reentrenamiento: al conservar la arquitectura y el tokenizador de Gemma 3 4B, puede servir como inicialización para repetir el ajuste con otra configuración (learning rate menor, más épocas, pérdida solo dura) y comprobar si se corrige el comportamiento degenerado.
- Investigación sobre conjuntos de datos matemáticos: útil para experimentar con GSM8K y otros datasets aritméticos midiendo el efecto del formateo de la cadena de razonamiento en la pérdida de destilación.
- Comparación de estrategias de ajuste sobre modelos pequeños: sirve como referencia de un ajuste full-parameter sobre 3,88 B de parámetros frente a alternativas como LoRA o QLoRA en el mismo modelo base.
- Docencia y divulgación: como ejemplo documentado de que una pérdida bien formulada no garantiza un modelo funcional, útil para ilustrar la necesidad de evaluar sistemáticamente antes de publicar.
- No se recomienda ningún caso de uso en producción con el checkpoint actual, dado que el autor lo describe como copia de seguridad privada y los resultados de evaluación son degenerados.

## Benchmarks y rendimiento

La información disponible solo incluye la evaluación propia del autor sobre el conjunto de test completo de GSM8K:

| Metrica | Valor |
|---|---|
| Exactitud en GSM8K (test completo) | 0,0000 |
| Media de tokens generados | 512,0 (coincide con el limite de generacion) |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, etc.) en la información disponible, ni comparaciones con el modelo base o con el profesor. El autor advierte explícitamente de que la evaluación debe repetirse antes de reportar cualquier exactitud final.

## Requisitos de hardware

- Inferencia en bf16/fp16: los 3,88 B de parámetros ocupan aproximadamente 7,8 GB, por lo que se necesitan en torno a 9-11 GB de VRAM considerando caché KV y overhead.
- Cuantización a 8 bits: entorno a 5 GB de VRAM; a 4 bits, en torno a 2,5-3 GB.
- GPU recomendadas para precisión completa: A100 40 GB, H100 80 GB, L40S 48 GB o RTX 4090 24 GB.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090, RTX 4080, RTX 4060 Ti 16 GB y RTX 3060 12 GB en bf16; en GPUs de 8 GB solo con cuantización de 4 bits.
- Opciones de despliegue: transformers (formato nativo safetensors), vLLM o TGI para servicio con batching. Para llama.cpp u Ollama sería necesario convertir los pesos a GGUF, conversión que no se distribuye en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento en GSM8K |
|---|---|---|---|---|---|
| Yuivdldk/gemma3-4b-gsm8k-kd | 3,88 B | no disponible (base: 128.000) | Gemma | HuggingFace, 0 descargas | 0,0000 (segun el autor) |
| google/gemma-3-4b-it | 3,88 B | 128.000 | Gemma | HuggingFace, ampliamente usado | no disponible |
| Qwen2.5-3B-instruct | 3,09 B | 32.768 nativo (128.000 con YaRN) | Apache 2.0 | HuggingFace | no disponible |
| Llama-3.2-3B-instruct | 3,21 B | 128.000 | Llama 3.2 Community License | HuggingFace (con acceso) | no disponible |

La comparación de rendimiento entre estos modelos no se incluye porque no hay datos de benchmarks verificados en la información disponible para este ajuste ni cifras comparativas aportadas en el repositorio.

## Limitaciones y advertencias

- El autor reporta una exactitud de 0.0000 en el test completo de GSM8K y una media de 512 tokens generados, lo que indica un fallo de generación (probable bucle o texto degenerado). El checkpoint no es funcional tal como está.
- El propio autor recomienda tratar la subida como copia de seguridad privada o artefacto experimental, no como un modelo publicable.
- No hay información sobre sesgos, comportamiento en dominios sensibles ni evaluación de seguridad.
- Riesgo alto de alucinación y de generación degenerada, dado el estado de evaluación documentado.
- Idiomas soportados no documentados; se desconoce si el ajuste ha degradado el multilingüismo del modelo base.
- La licencia gemma (Gemma Terms of Use) impone condiciones específicas para uso comercial y requiere revisar la política de uso prohibido de Google antes de cualquier despliegue.
- El dataset GSM8K es de dominio matemático escolar; el ajuste puede degradar capacidades generales por sobreajuste a un único dominio.
- No se documenta el número de tokens vistos, la composición del dataset de destilación ni la procedencia de los shards del profesor, lo que dificulta auditar el entrenamiento.
- No se ofrecen pesos cuantizados, versiones GGUF ni scripts de conversión, lo que añade fricción para su uso en entornos de consumo.
- Cualquier uso en producción requeriría, como mínimo, repetir la evaluación y verificar que el comportamiento degenerado se ha corregido.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Yuivdldk/gemma3-4b-gsm8k-kd
- Modelo base: https://huggingface.co/google/gemma-3-4b-it
- Modelo profesor: https://huggingface.co/google/gemma-3-27b-it
- Dataset GSM8K: https://huggingface.co/datasets/openai/gsm8k
- La búsqueda web realizada no devolvió enlaces relevantes sobre este modelo (los resultados obtenidos correspondían a páginas de Instagram, sin relación con el contenido).
