# SurjoLabs/Blaze

## Resumen

Blaze es un modelo de lenguaje causal de 48,3 millones de parámetros desarrollado por SurjoLabs, diseñado específicamente para la categoría de modelos pequeños (SLM, sub-50M). Su principal distinción es ocupar el primer puesto en el Open SLM Leaderboard dentro de su categoría, con una puntuación de 15.45 en el Intelligence Index. El modelo emplea una arquitectura propietaria denominada XSA (orthogonal value-subtraction attention) con recurrencia de capas, lo que le permite alcanzar una profundidad computacional efectiva de 26 capas almacenando únicamente 14 capas físicas.

El modelo resuelve el problema de obtener capacidades de razonamiento y generación de texto aceptables en entornos con restricciones severas de memoria y cómputo, como dispositivos embebidos o inferencia en CPU. Está entrenado con aproximadamente 20.970 millones de tokens (20.000 pasos a 1.048.576 tokens por paso) utilizando un programador de tasa de aprendizaje WSD (Warmup-Stable-Decay). El checkpoint oficial liberado corresponde al paso 19.500, que mostró el mejor rendimiento en las evaluaciones.

Con una longitud de contexto de 1.024 tokens y vocabulario de 8.192 entradas con embeddings atados, Blaze es una opción ligera y de código abierto (licencia MIT) para tareas de generación de texto en inglés, aunque su ventana de contexto limitada restringe su uso a aplicaciones de texto corto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con XSA (orthogonal value-subtraction attention) y recurrencia de capas |
| Parametros totales | 48.251.136 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Blaze utiliza una arquitectura transformer causal con una innovación propia denominada XSA (orthogonal value-subtraction attention). En lugar de la atención multi-cabeza estándar, emplea 8 cabezas de consulta (query) y 4 cabezas de clave-valor (key-value) en configuración GQA (Grouped Query Attention) con ratio 2:1. La dimensión de cabeza es de 64, el tamaño oculto de 512 y el tamaño intermedio de 1.536. La característica más distintiva es la recurrencia de capas: solo hay 14 capas físicas (1 preludio, 12 recurrentes y 1 coda), pero cada capa recurrente se ejecuta 2 veces, lo que produce una profundidad efectiva de 26 capas. Esto permite aumentar la capacidad de cómputo sin incrementar el número de parámetros almacenados.

El entrenamiento se realizó sobre aproximadamente 20.970 millones de tokens, con un programador de tasa de aprendizaje WSD (Warmup-Stable-Decay). No se menciona el uso de técnicas de alineación como RLHF o DPO. El checkpoint seleccionado (paso 19.500) fue elegido por su rendimiento máximo en los benchmarks evaluados. El vocabulario es de 8.192 tokens con embeddings atados (tied embeddings), lo que reduce el número total de parámetros.

## Capacidades

- Generación de texto causal en inglés, con capacidad de completar frases y producir texto coherente a corta distancia (contexto de 1.024 tokens).
- Razonamiento básico y comprensión de instrucciones simples, evidenciado por resultados en benchmarks como PIQA (62.51%) y ARC-Easy (41.84%).
- Capacidad matemática limitada, con un 37.80% en ArithMark-3.0.
- No se documenta soporte para tool calling, function calling, agentes o razonamiento multi-paso.
- No se documentan capacidades multimodales (visión, audio, etc.).
- Monolingüe: únicamente inglés.

## Casos de uso

- Autocompletado de texto en aplicaciones de escritura asistida: Blaze puede sugerir continuaciones de frases cortas en inglés, útil para editores de texto ligeros o asistentes de escritura en dispositivos con recursos limitados.
- Clasificación de texto simple: mediante fine-tuning sobre su representación causal, puede adaptarse a tareas de análisis de sentimiento o categorización de textos breves (tweets, comentarios).
- Generación de respuestas en chatbots de dominio restringido: su contexto de 1.024 tokens limita la conversación a intercambios cortos, pero es suficiente para asistentes de preguntas frecuentes con respuestas predefinidas.
- Prototipado rápido de modelos de lenguaje en investigación: al ser un modelo pequeño y de licencia MIT, sirve como base para experimentos de arquitectura, entrenamiento o evaluación sin incurrir en grandes costes computacionales.
- Inferencia en tiempo real en dispositivos embebidos: con solo 48 millones de parámetros, puede ejecutarse en CPUs de bajo consumo o microcontroladores con suficiente memoria, habilitando asistentes de voz locales o sistemas de respuesta automática.
- Educación y aprendizaje: su tamaño y licencia permiten su uso en cursos de procesamiento de lenguaje natural para demostrar conceptos de generación de texto y fine-tuning sin necesidad de GPUs de alta gama.

## Benchmarks y rendimiento

La model card reporta resultados de evaluación 0-shot con precisión normalizada (acc_norm):

| Benchmark | Score |
|---|---|
| PIQA | 62.51% |
| ARC-Easy | 41.84% |
| ArithMark-3.0 | 37.80% |
| HellaSwag | 31.84% |
| ARC-Challenge | 24.91% |
| Intelligence Index | 15.45 |

Estos resultados lo posicionan en el primer lugar del Open SLM Leaderboard en la categoría sub-50M. No se proporcionan comparaciones directas con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 96 MB en precisión bf16 (48,25M × 2 bytes), más overhead de activaciones y caché KV; en la práctica cabe en cualquier GPU con al menos 1 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna, incluidas las de gama de consumo como NVIDIA GTX 1650, RTX 3060, o incluso iGPUs. También puede ejecutarse en CPU sin problema.
- Compatibilidad con hardware de consumo: sí, es totalmente viable en portátiles y placas de desarrollo como Raspberry Pi (con suficiente RAM).
- Opciones de despliegue: transformers de Hugging Face con `trust_remote_code=True` (como se muestra en el ejemplo de uso). No se menciona compatibilidad con vLLM, llama.cpp u Ollama; habría que verificar si la arquitectura personalizada es soportada por esos frameworks.
- Latencia y throughput: no se proporcionan datos oficiales. Dado el tamaño, se espera una latencia de milisegundos en GPU y de decenas de milisegundos en CPU para generación de tokens.

## Comparativa con modelos similares

No se dispone de datos comparativos de otros modelos de la misma categoría (sub-50M) en la información proporcionada. El Open SLM Leaderboard posiciona a Blaze como el número uno en su segmento, pero no se especifican los modelos competidores ni sus resultados. Se recomienda consultar el leaderboard para obtener una comparativa actualizada.

## Limitaciones y advertencias

- Contexto muy limitado: 1.024 tokens, lo que impide tareas que requieran documentos largos o conversaciones extensas.
- Monolingüe: solo inglés; no hay soporte para español u otros idiomas.
- Rendimiento modesto en razonamiento complejo: los resultados en ARC-Challenge (24.91%) y HellaSwag (31.84%) indican limitaciones claras frente a modelos más grandes.
- Riesgo de alucinación: como todo modelo generativo, puede producir contenido inventado o factualmente incorrecto, especialmente fuera de su dominio de entrenamiento.
- Sesgos no evaluados: no se han publicado estudios de sesgos o toxicidad; se recomienda precaución antes de desplegarlo en aplicaciones orientadas al usuario final.
- Arquitectura personalizada: requiere `trust_remote_code=True` en Hugging Face, lo que implica ejecutar código no auditado por la comunidad; se debe revisar el código antes de usarlo en producción.
- Licencia MIT: permite uso comercial sin restricciones, pero el modelo se ofrece sin garantías; el usuario es responsable de su uso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SurjoLabs/Blaze
- Organización SurjoLabs en Hugging Face: https://huggingface.co/SurjoLabs
- Modelo relacionado (Flare, de la misma organización): https://huggingface.co/SurjoLabs/Flare
