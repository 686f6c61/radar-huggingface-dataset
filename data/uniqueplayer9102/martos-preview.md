# uniqueplayer9102/Martos-Preview

## Resumen

Martos-Preview es un ajuste fino experimental de Qwen3-1.7B orientado a roleplay y escritura creativa conversacional, publicado por el usuario uniqueplayer9102 en Hugging Face. El modelo aplica una expansión de bloques al estilo LLaMA Pro: en lugar de reentrenar los pesos originales, clona siete bloques transformer y los inserta en la red, congelando el modelo base y entrenando únicamente las proyecciones de los bloques nuevos. El resultado es un transformer denso de 35 capas y 2.072.926.976 parámetros (aproximadamente 2,07B), partiendo de las 28 capas del Qwen3-1.7B original.

La relevancia del modelo es doble. Por un lado, sirve como demostración práctica de la técnica de expansión de bloques con un presupuesto de cómputo muy reducido: todo el entrenamiento se realizó en una única GPU Tesla T4 durante 1400 pasos. Por otro, es un ejemplo de ajuste fino especializado en personajes y conversación multi-turno, con una plantilla de chat basada en la de Qwen3 y soporte para tarjetas de personaje detalladas en el mensaje de sistema.

El proyecto se declara explícitamente como un experimento de hobby y no como un modelo listo para producción. El autor indica que esta ejecución ha terminado en el paso 1400 de 1400 y que no hay más checkpoints previstos para esta variante, aunque anuncia un modelo futuro separado basado en Qwen3.5-2B y entrenado en una RTX 4090 con un conjunto de datos mucho mayor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3) con expansión de bloques al estilo LLaMA Pro; 35 capas |
| Parametros totales | 2.072.926.976 (~2,07B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens (ventana de entrenamiento); el contexto nativo de Qwen3-1.7B no se detalla en la información disponible |
| Tipos de cuantizacion | No disponible (el repositorio publica pesos en FP16; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (modelo Transformers fusionado en FP16, sin código personalizado) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-1.7B, un transformer denso de 28 capas. Sobre esa base se clona un bloque transformer después de cada una de las capas `[3, 7, 11, 15, 19, 23, 27]`, lo que da lugar a siete bloques nuevos que ocupan las posiciones finales `[4, 9, 14, 19, 24, 29, 34]` de la red expandida de 35 capas. Para preservar la equivalencia funcional inicial, se ponen a cero la proyección de salida de atención y la proyección down del MLP de cada bloque clonado: como esas ramas contribuyen inicialmente con cero al flujo residual, el modelo de 35 capas arranca siendo funcionalmente equivalente al de 28 dentro de la tolerancia numérica de FP16. Antes de entrenar se compara la diferencia máxima de logits entre ambos modelos y se rechaza la construcción si supera la tolerancia de comprobación de identidad.

El entrenamiento congela el modelo original y ajusta únicamente las matrices de proyección de los siete bloques insertados, aproximadamente 352M parámetros entrenables, sin módulos LoRA ni adaptadores. La ventana de entrenamiento es de 4.096 tokens y la pérdida se calcula solo sobre los tokens del asistente. El calendario consta de 1400 pasos con AdamW de 8 bits, tasa de aprendizaje 2e-4, 50 pasos de calentamiento y acumulación de gradiente de 16, todo ello en una única Tesla T4. Al finalizar, los bloques entrenados se fusionan en un modelo Qwen3 ordinario de 35 capas, de modo que la inferencia no requiere código personalizado.

## Capacidades

- Generación de texto conversacional multi-turno con mantenimiento de personaje a lo largo de la conversación.
- Roleplay y escritura creativa: interpretación de personajes definidos mediante tarjetas en el mensaje de sistema, con acciones narrativas entre asteriscos.
- Seguimiento de instrucciones de formato y estilo dentro de la tarjeta de personaje (identidad, personalidad, escenario, forma de hablar).
- Plantilla de chat compatible con la de Qwen3, incluyendo el parámetro `enable_thinking`; en los ejemplos se usa con el modo de razonamiento desactivado.
- Capacidades heredadas del modelo base Qwen3-1.7B (conocimiento general y generación de texto), aunque el ajuste está orientado a conversación creativa.
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado; el modo thinking se desactiva en los ejemplos de uso.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma del repositorio.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Roleplay conversacional con personajes: el modelo acepta una tarjeta de personaje en el mensaje de sistema y mantiene la coherencia de identidad, tono y escenario a lo largo de turnos alternos de usuario y asistente, gracias a su ventana de 4.096 tokens.
- Prototipado de chatbots de personaje para juegos o narrativa interactiva: permite validar guiones, voces y dinámicas de diálogo antes de invertir en modelos mayores, con un coste de inferencia bajo por sus ~2,07B de parámetros.
- Generación de diálogo creativo para escritura asistida: útil para explorar escenas, réplicas y dinámicas entre personajes en borradores de ficción, con acciones narrativas delimitadas por asteriscos.
- Investigación sobre expansión de bloques: sirve como referencia reproducible de la técnica LLaMA Pro aplicada a Qwen3, con pesos fusionados y sin código personalizado, para estudiar el efecto de añadir capacidad congelando el modelo base.
- Experimentos académicos de ajuste fino con recursos limitados: el entrenamiento completo cupo en una sola Tesla T4, lo que lo convierte en un caso práctico para estudiar recetas de bajo presupuesto (AdamW 8-bit, acumulación de gradiente, pérdida solo en tokens del asistente).
- Demos y entornos de evaluación de personajes: al requerir solo Transformers y pesos FP16, puede desplegarse en notebooks o entornos con GPU modesta para comparar tarjetas de personaje y ajustar prompts de sistema.
- Base para futuros ajustes especializados: su licencia Apache 2.0 y su formato estándar de Transformers permiten reutilizarlo como punto de partida para otros ajustes de conversación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que los benchmarks se añadirán a la página después de ejecutarse, pero en el momento de la consulta no hay datos de MMLU, HumanEval, GSM8K ni de evaluaciones específicas de roleplay.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: en torno a 4,2 GB solo para pesos (tamaño del repositorio), más overhead de activaciones y caché KV; en la práctica se recomienda al menos 6-8 GB de VRAM para contextos moderados.
- Cuantización: no se publican variantes GGUF, AWQ ni GPTQ, por lo que el despliegue documentado es en FP16 con Transformers.
- GPU recomendadas: cualquier GPU con 8 GB o más de VRAM para FP16; el propio autor entrenó en una Tesla T4 (16 GB). Una RTX 4090, A100 o H100 ofrecerán mayor margen de contexto y throughput, pero no son necesarias para inferencia básica.
- ¿Cabe en GPU de consumo? Sí, previsiblemente en tarjetas con 8 GB o más (por ejemplo, RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 en adelante), aunque no se documentan pruebas concretas.
- Opciones de despliegue: Transformers con `AutoModelForCausalLM` y `device_map="auto"` es la vía documentada; el repositorio incluye configuración, tokenizer, configuración de generación y plantilla de chat. No se documenta soporte verificado de vLLM, llama.cpp, Ollama ni TGI, aunque la etiqueta `text-generation-inference` aparece en los metadatos del repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Martos-Preview | ~2,07B (35 capas) | 4.096 tokens de entrenamiento | Roleplay y escritura creativa (expansión LLaMA Pro sobre Qwen3-1.7B) | Apache 2.0 | Hugging Face, pesos FP16 |
| Qwen3-1.7B (base) | ~1,7B (28 capas) | No disponible en la información proporcionada | Modelo generalista de texto | Apache 2.0 | Hugging Face |
| Modelos de roleplay de ~2B | No disponible | No disponible | Conversación de personajes | Variable | Variable |

La comparación cuantitativa con alternativas de la misma categoría no está disponible en la información proporcionada: no se han publicado benchmarks de Martos-Preview ni se detallan métricas de otros modelos de roleplay de tamaño similar.

## Limitaciones y advertencias

- Modelo experimental de hobby: el autor lo describe como una demostración del proceso de entrenamiento, no como un modelo listo para producción.
- Ejecución cerrada: el entrenamiento terminó en el paso 1400 de 1400 y no se prevén más checkpoints de esta variante.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad, razonamiento ni seguimiento de instrucciones.
- Idiomas: solo se declara inglés; el rendimiento en castellano u otros idiomas no está evaluado y probablemente sea deficiente.
- Contexto limitado: la ventana de entrenamiento es de 4.096 tokens, lo que restringe conversaciones muy largas o tarjetas de personaje extensas.
- Riesgo de alucinación: como todo modelo generativo de ~2B, puede inventar detalles, romper el personaje o contradecir información previa de la conversación.
- Sesgos: no se documenta ninguna evaluación de sesgos; el ajuste sobre datos de roleplay puede amplificar estereotipos presentes en los datos de entrenamiento.
- Contenido para adultos: la etiqueta `not-for-all-audiences` indica que el modelo puede generar contenido no apto para todo público; requiere moderación en despliegues abiertos.
- Modo thinking desactivado en los ejemplos: el razonamiento visible puede perjudicar la inmersión en roleplay, y el modelo no está entrenado específicamente como híbrido de thinking y no-thinking (eso se anuncia para una versión futura).
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene verificar la procedencia y calidad de los datos de ajuste antes de usarlo en producción.
- Sin soporte documentado de tool calling ni de agentes: no debe asumirse su uso en pipelines que requieran function calling.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/uniqueplayer9102/Martos-Preview
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Paper de referencia LLaMA Pro (arXiv:2401.02415): https://arxiv.org/abs/2401.02415
