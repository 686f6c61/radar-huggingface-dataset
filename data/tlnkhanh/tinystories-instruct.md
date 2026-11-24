# TLNKhanh/tinystories-instruct

## Resumen

tinystories-instruct es un modelo de lenguaje de 29,5 millones de parámetros desarrollado por TLNKhanh, consistente en la versión ajustada por instrucciones de un GPT entrenado desde cero sobre el corpus TinyStories V2. El modelo parte de una base entrenada con cuentos infantiles sintéticos y posteriormente se afina con 55.000 ejemplos de instrucciones procedentes de Dolly 15k, Tulu-3, smol-constraints y OpenHermes, aplicando un 10 % de repetición de historias para mitigar el olvido catastrófico del dominio original.

Su relevancia es fundamentalmente didáctica y experimental: demuestra que un transformer de escala muy reducida puede aprender a seguir el formato de instrucciones y responder a preguntas factuales simples, aunque sin capacidad de razonamiento profundo. Se distribuye en formato GGUF con plantilla y parámetros de Ollama incluidos en el repositorio, lo que permite ejecutarlo en hardware muy modesto (incluso CPU) con un solo comando.

La ventana de contexto es de solo 256 tokens y el repositorio ocupa aproximadamente 0,1 GB. No se han publicado datos sobre licencia, idiomas soportados ni resultados de benchmarks, por lo que su evaluación rigurosa queda pendiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT (entrenado desde cero) |
| Parametros totales | 29.545.472 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | GGUF (cuantizaciones concretas no disponibles) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors para el recuento de parametros) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de tipo GPT con 29,5 millones de parámetros, entrenado desde cero sobre TinyStories V2, un corpus de cuentos infantiles sintéticos diseñado para estudiar el aprendizaje lingüístico en modelos pequeños. Sobre esa base se aplicó un ajuste por instrucciones de 6.530 pasos utilizando 55.000 ejemplos procedentes de Dolly 15k, Tulu-3, smol-constraints y OpenHermes, con un 10 % de repetición de historias del dominio original para preservar capacidades narrativas.

No se dispone de información sobre el número total de tokens de entrenamiento de la base, la composición exacta del dataset, el uso de RLHF o DPO, ni innovaciones técnicas adicionales (atención lineal, decodificación especulativa, etc.). El formato de prompt esperado es `### Instruction: ... ### Response:`, aplicado automáticamente por la plantilla de Ollama incluida en el repositorio.

## Capacidades

- Generación de texto narrativo breve, especialmente cuentos infantiles, gracias a su entrenamiento sobre TinyStories.
- Seguimiento del formato de instrucciones y respuesta a preguntas factuales simples (por ejemplo, capitales de países).
- Generación de texto condicionada por prompt corto dentro de una ventana de 256 tokens.
- No se ha documentado soporte de tool calling ni function calling.
- No se ha documentado soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües no disponibles (no se especifican idiomas).
- No dispone de modo thinking, visión, audio ni otras capacidades especiales.

## Casos de uso

- Experimentación educativa: permite estudiar el efecto del ajuste por instrucciones en modelos de escala mínima, comparando la base TinyStories con esta versión afinada en tareas de formato y respuesta factual.
- Generación de cuentos infantiles: adecuado para producir microrelatos sencillos y controlados, aprovechando el 10 % de repetición de historias que conserva el estilo narrativo original.
- Pruebas de pipelines de despliegue: sirve como modelo de humo para validar integraciones con Ollama, plantillas de prompt y flujos de inferencia antes de migrar a modelos mayores.
- Demostraciones en hardware limitado: al ocupar ~0,1 GB y caber en CPU, permite ejecutar ejemplos de generación de texto en entornos sin GPU (aulas, Raspberry Pi, contenedores ligeros).
- Evaluación de formatos de instrucción: útil para comparar plantillas `### Instruction: ... ### Response:` y medir la adherencia al formato en modelos pequeños.
- Prototipado de chatbots triviales: puede gestionar intercambios de una o dos rondas con preguntas simples, siempre que se mantenga el contexto por debajo de 256 tokens.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en cuantizaciones GGUF típicas (el repositorio completo ocupa ~0,1 GB).
- GPU recomendadas: cualquier GPU consumer moderna es sobredimensionada; el modelo puede ejecutarse en CPU sin problema.
- Cabe en cualquier GPU consumer (GTX 1050, RTX 3060, RTX 4090, etc.) e incluso en dispositivos de placa única.
- Opciones de despliegue: Ollama (soporte nativo con `ollama pull hf.co/TLNKhanh/tinystories-instruct`), llama.cpp y otros runners compatibles con GGUF.
- Latencia y throughput: no disponibles; por el tamaño, se espera latencia muy baja en CPU y prácticamente instantánea en GPU, aunque no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| tinystories-instruct (TLNKhanh) | 29,5 M | 256 tokens | no disponible | Hugging Face (GGUF/Ollama) |
| TinyStories base (TLNKhanh) | ~29,5 M (no confirmado) | no disponible | no disponible | Hugging Face |
| smolLM-135M (HuggingFaceTB) | 135 M | 2.048 tokens | Apache 2.0 | Hugging Face |
| Qwen2.5-0.5B | 494 M | 32.768 tokens | Apache 2.0 | Hugging Face |

Los modelos comparables de mayor tamaño ofrecen contextos y licencias claras, pero no reproducen el propósito didáctico de TinyStories. No se dispone de datos de rendimiento comparativo para tinystories-instruct.

## Limitaciones y advertencias

- Capacidad de razonamiento muy limitada: el propio autor advierte que no debe esperarse profundidad ni razonamiento; para uso serio recomienda modelos mayores.
- Ventana de contexto de solo 256 tokens, insuficiente para conversaciones multi-turno o documentos largos.
- Riesgo elevado de alucinación en preguntas factuales fuera del dominio de entrenamiento.
- Sesgos conocidos: no documentados, pero el corpus TinyStories es sintético y los datasets de instrucciones pueden introducir sesgos no auditados.
- Licencia no especificada: no se puede confirmar el uso comercial; debe contactarse con el autor antes de utilizarlo en producción.
- Idiomas soportados no declarados; probablemente esté sesgado hacia el inglés de los datasets de instrucciones, sin garantías para castellano.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad frente a alternativas.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema y soporte comunitario inexistentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TLNKhanh/tinystories-instruct
- Modelo base: https://huggingface.co/TLNKhanh/tinystories
