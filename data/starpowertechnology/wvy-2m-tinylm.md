# StarpowerTechnology/WVY-2M-TinyLM

## Resumen

WVY-2M-TinyLM es un modelo de lenguaje causal de aproximadamente 2 millones de parámetros desarrollado por Starpower Technology como plataforma experimental para el estudio de la adquisición del lenguaje, el comportamiento conversacional y la representación del conocimiento bajo restricciones extremas de tamaño. Se distribuye con dos checkpoints (preentrenado y ajustado) que permiten comparar la evolución del comportamiento del modelo entre fases de entrenamiento.

El modelo emplea una arquitectura Transformer causal de 4 capas, 6 cabezas de atención, dimensión oculta de 192 y dimensión de feed-forward de 768, con una ventana de contexto de 512 tokens. Su rasgo más distintivo es un vocabulario personalizado de solo 288 tokens que incluye marcadores conversacionales explícitos (`<|user|>`, `<|assistant|>`, `<|end_conversation|>`), lo que lo aleja de los tokenizadores subword convencionales y lo orienta a la experimentación controlada más que a la generación de lenguaje abierto.

Es relevante ahora como banco de pruebas didáctico y de investigación: permite reproducir un ciclo completo de preentrenamiento y ajuste en unas dos horas de cómputo, inspeccionar el efecto del tamaño de vocabulario en las capacidades del modelo y estudiar diferencias de comportamiento entre etapas de entrenamiento con checkpoints de menos de 8 MB. No es un asistente de propósito general ni compite con modelos de producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal (decoder-only) |
| Parámetros totales | ~2M |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés |
| Licencia | MIT |
| Formato de pesos | PyTorch (`.pt`); no se documenta safetensors ni GGUF |
| Capas del transformer | 4 |
| Cabezas de atención | 6 |
| Dimensión oculta | 192 |
| Dimensión de feed-forward | 768 |
| Dimensión por cabeza | 32 |
| Tamaño de vocabulario | 288 tokens |
| Dropout | 0.1 |
| Framework | PyTorch |
| Tamaño del checkpoint | ~7,96 MB |
| Tamaño del repo | 0,0 GB |

## Arquitectura y entrenamiento

La arquitectura es un Transformer causal decoder-only con 4 capas, 6 cabezas de atención de 32 dimensiones cada una (192 en total), dimensión de feed-forward de 768 y dropout de 0,1. El tokenizador es un vocabulario personalizado de 288 tokens que combina marcadores de rol conversacional, palabras individuales, números, puntuación y tokens de control de secuencia (`<|pad|>`, `<|bos|>`, `<|eot|>`, `<|user|>`, `<|assistant|>`, `<|unk|>`, `<|end_conversation|>`). Esta elección de vocabulario mínimo con tokens de rol explícitos es la innovación técnica principal: el modelo aprende la estructura de turno de forma nativa en lugar de inferirla de texto plano.

El entrenamiento se dividió en dos fases de 100.000 pasos cada una, con un total de 200.000 pasos de optimización y una duración combinada de aproximadamente 119 minutos. En preentrenamiento, la pérdida registrada pasó de 4,145382 a 0,319410 en 27,30 minutos; en ajuste fino, de 3,708569 a 0,028553 en 91,74 minutos. El autor advierte explícitamente que estas cifras son pérdidas de entrenamiento registradas, no resultados de evaluación independiente. No se documenta la composición del dataset, el número de tokens de entrenamiento, ni si se aplicaron RLHF, DPO u otras técnicas de alineación.

## Capacidades

- Generación de texto causal restringida al vocabulario de 288 tokens del modelo.
- Predicción de secuencias conversacionales con marcadores de rol y de fin de conversación.
- Reconocimiento de patrones y asociaciones contextuales dentro de la ventana de 512 tokens.
- Modelado de diálogo multi-turno limitado a la estructura de turnos definida por el tokenizador.
- Comparación de comportamiento entre checkpoint preentrenado y checkpoint ajustado.
- Capacidades multilingües: no disponibles; el modelo está declarado únicamente en inglés.
- Tool calling / function calling: no disponible.
- Razonamiento multi-paso o modo de pensamiento: no disponible.
- Visión, audio u otras modalidades: no disponible.

## Casos de uso

- Investigación sobre adquisición del lenguaje bajo restricciones extremas de parámetros: el modelo permite estudiar qué estructuras lingüísticas se aprenden con 2M de parámetros y un vocabulario de 288 tokens, sirviendo de línea base en experimentos de escalado.
- Estudio del efecto del tamaño de vocabulario: al usar un vocabulario personalizado y mínimo, permite medir cómo varía la pérdida y la calidad de generación al ampliar o reducir el conjunto de tokens, algo difícil de aislar en modelos con tokenizadores subword estándar.
- Diálogo de NPC en videojuegos experimentales: la ventana de 512 tokens y los tokens de rol explícitos permiten generar respuestas cortas y acotadas en entornos controlados donde el vocabulario del dominio es limitado, con un coste de inferencia mínimo.
- Implementaciones educativas de Transformers: el repo incluye configuración, tokenizador y logs de entrenamiento, lo que facilita reproducir el ciclo completo de preentrenamiento y ajuste en un aula o laboratorio con hardware modesto.
- Investigación sobre diferencias preentrenamiento vs. ajuste fino: los dos checkpoints publicados permiten comparar directamente el comportamiento antes y después del ajuste conversacional, con pérdidas registradas de 0,319410 y 0,028553 respectivamente.
- Experimentación local en CPU: con un checkpoint de ~7,96 MB, el modelo se puede cargar y ejecutar en cualquier portátil sin GPU, lo que lo hace adecuado para prototipos rápidos de pipelines de tokenización y generación.
- Desarrollo de modelos especializados de dominio: el vocabulario reducido y la arquitectura ligera sirven como plantilla para construir modelos de nicho con vocabulario cerrado y requisitos de cómputo mínimos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica que los benchmarks independientes, la composición del dataset y las mediciones de generalización no están documentados. Las únicas métricas publicadas son las pérdidas de entrenamiento:

| Fase | Pasos | Pérdida inicial | Pérdida final | Duración |
|---|---:|---:|---:|---:|
| Preentrenamiento | 100.000 | 4,145382 | 0,319410 | 27,30 min |
| Ajuste fino | 100.000 | 3,708569 | 0,028553 | 91,74 min |
| Combinado | 200.000 | — | 0,028553 | ~119 min |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (checkpoint de ~7,96 MB); en la práctica, cualquier GPU con más de 1 GB puede alojarlo.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU. Cualquier GPU consumer (GTX 1050, RTX 3060, RTX 4090) es sobredimensionada para este modelo.
- Cabe en cualquier GPU consumer y en sistemas integrados; también en Raspberry Pi y entornos sin acelerador.
- Opciones de despliegue: PyTorch nativo con la implementación y el tokenizador personalizados del repo. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, ni carga directa mediante Hugging Face `AutoModel`.
- Latencia y throughput: no disponibles. Con 2M de parámetros y contexto de 512 tokens, la latencia esperada es de milisegundos en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Vocabulario | Licencia | Formato |
|---|---:|---:|---:|---|---|
| WVY-2M-TinyLM | ~2M | 512 | 288 (custom) | MIT | PyTorch `.pt` |
| TinyStories-1M (Microsoft) | ~1M | no disponible | subword | MIT | safetensors / PyTorch |
| TinyStories-33M (Microsoft) | ~33M | no disponible | subword | MIT | safetensors / PyTorch |
| GPT-2 small | 124M | 1024 | 50.257 | MIT | safetensors / PyTorch |

La comparación con TinyStories es la más pertinente por tratarse de modelos pequeños orientados a investigación sobre aprendizaje del lenguaje; sin embargo, no se dispone de datos de rendimiento de WVY-2M-TinyLM que permitan una comparación cuantitativa. GPT-2 small se incluye como referencia de escala, dos órdenes de magnitud superior en parámetros y con un vocabulario subword convencional.

## Limitaciones y advertencias

- Modelo experimental de investigación, no un asistente de propósito general; el autor lo declara explícitamente.
- Vocabulario de solo 288 tokens: no puede representar conceptos fuera de ese conjunto y no genera lenguaje natural sin restricciones.
- Contexto limitado a 512 tokens, insuficiente para documentos largos o conversaciones extensas.
- Solo inglés declarado; sin capacidades multilingües documentadas.
- Riesgo elevado de alucinación y de generar secuencias incoherentes fuera del dominio de entrenamiento.
- No se documenta la composición del dataset de entrenamiento, lo que impide evaluar sesgos y procedencia de los datos.
- Las pérdidas publicadas son de entrenamiento, no de evaluación; no constituyen evidencia de calidad.
- Los checkpoints en `.pt` requieren una implementación de modelo y tokenizador compatibles; no se documenta la carga mediante `AutoModel` de Hugging Face.
- No se documentan métodos de cuantización ni formatos GGUF/ONNX, lo que limita su integración en stacks de despliegue estándar.
- Licencia MIT: permite uso comercial, pero la ausencia de evaluación independiente hace desaconsejable su uso en producción sin validación propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/StarpowerTechnology/WVY-2M-TinyLM
- Perfil del desarrollador: https://huggingface.co/StarpowerTechnology
- Paper: no disponible
- Blog o demo: no disponible
- Repositorio de código: no disponible
