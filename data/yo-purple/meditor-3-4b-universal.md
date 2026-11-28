# Yo-Purple/Meditor-3-4B-Universal

## Resumen
Meditor-3-4B-Universal es la compilación en formato GGUF del modelo Meditor-3-4B-MoE, desarrollado por Yo-Purple. Se trata de un modelo de generación de texto construido sobre el backbone denso Qwen3-4B de Alibaba, al que se le ha añadido una capa de expertos enrutados que transforma cada bloque transformer en una arquitectura de mezcla de expertos (MoE). El objetivo es ofrecer un checkpoint autónomo, sin dependencias, ejecutable directamente en llama.cpp, LM Studio, KoboldCpp y Ollama.

La propuesta diferencial es la portabilidad: mientras que el modelo nativo Meditor-3-4B-MoE requiere un runtime específico con enrutamiento dinámico de prompts, esta versión "Universal" compila esa lógica en un GGUF estándar con enrutamiento top-2 por token, de modo que cualquier motor compatible con llama.cpp puede cargarlo sin modificaciones. El modelo totaliza 4.164.938.240 parámetros (aproximadamente 4,16 mil millones) y conserva la FFN densa de Qwen3-4B como experto compartido.

Es relevante ahora porque demuestra una vía práctica para empaquetar arquitecturas MoE experimentales en formatos de inferencia local ampliamente adoptados, manteniendo un rendimiento declarado notable en el benchmark propio del autor (UniBench-100). No obstante, conviene subrayar que las métricas publicadas corresponden al modelo nativo, no a esta aproximación GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) sobre backbone Qwen3-4B; experto compartido denso (d_ff=9728) + 8 expertos enrutados (d_ff=64), enrutamiento top-2 con softmax normalizado por token |
| Parametros totales | 4.164.938.240 (~4,16 B) |
| Parametros activos | 4,04 B – 4,07 B (según datos del modelo nativo) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Q8_0, Q4_K_M |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento
La arquitectura parte de Qwen3-4B como backbone denso. Cada capa transformer conserva la FFN original de Qwen3-4B como experto compartido (d_ff=9728) y añade 8 expertos especializados compactos (d_ff=64) con enrutamiento top-2 por token mediante softmax normalizado. Los pesos de los expertos se destilaron a partir de los pesos LoRA nativos y del PromptRouter del modelo Meditor-3-4B-MoE. Esta versión Universal es una compilación estática de ese sistema en formato GGUF, pensada para eliminar la dependencia del runtime dinámico original.

No se dispone de información detallada sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO. La model card describe el proceso como una destilación de los pesos LoRA y del enrutador de prompts del modelo nativo, más que como un entrenamiento desde cero. La innovación técnica principal es la compilación de un sistema MoE con enrutamiento dinámico a un GGUF estándar con enrutamiento top-2 fijo, lo que permite su ejecución en motores de inferencia convencionales.

## Capacidades
- Generación de texto conversacional y de propósito general.
- Razonamiento y síntesis de respuestas abiertas en diez dominios cognitivos según el benchmark del autor (pensamiento crítico, expresión creativa, humanidades, ciencias, etc.).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible explícitamente; el benchmark evalúa síntesis abierta, no tareas agénticas.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma del repositorio.
- Modo thinking, visión o audio: no disponible.
- Ejecución local sin dependencias en llama.cpp, LM Studio, KoboldCpp y Ollama.

## Casos de uso
- Inferencia local en estaciones de trabajo sin GPU dedicada: el checkpoint Q4_K_M ocupa entre 4,37 y 5,95 GiB, por lo que puede cargarse en equipos con 8 GB de RAM o VRAM y ejecutarse mediante llama.cpp u Ollama para prototipado rápido.
- Asistentes conversacionales de escritorio: integración en LM Studio o KoboldCpp para generar respuestas de texto en inglés en flujos de chat, aprovechando el formato GGUF y la compatibilidad con endpoints.
- Evaluación de arquitecturas MoE experimentales: sirve como banco de pruebas para estudiar cómo se comporta una compilación estática top-2 frente al enrutamiento dinámico del modelo nativo, comparando puntuaciones en UniBench-100.
- Generación de texto creativo y redacción asistida en inglés: el modelo declara puntuaciones altas en expresión creativa (8,38/10 en el modelo nativo), lo que lo hace adecuado para borradores y variaciones estilísticas.
- Investigación académica sobre destilación de expertos: permite reproducir el pipeline de compilación de LoRA y PromptRouter a GGUF y analizar la pérdida de rendimiento respecto al modelo nativo.
- Despliegue en entornos con requisitos de licencia permisiva: al estar bajo Apache 2.0, puede integrarse en productos comerciales sin las restricciones de licencias copyleft, siempre que se respeten las condiciones de la licencia.
- Pruebas de razonamiento crítico y argumentación: útil para generar y contrastar argumentos en tareas de evaluación cualitativa, aunque con verificación humana obligatoria por el riesgo de alucinación.

## Benchmarks y rendimiento

Los datos publicados corresponden al modelo nativo Meditor-3-4B-MoE, no a esta compilación GGUF. El autor indica explícitamente que la puntuación se midió sobre el modelo dinámico completo.

| Benchmark | Métrica | Meditor-3-4B-MoE (nativo) | Meditor-2 Universal (mejor) | Meditor-1 Universal (mejor) |
|---|---|---|---|---|
| UniBench-100 | Puntuación media (/10) | 7,31 | 4,12 | 2,42 |
| UniBench-100 | Tasa de aprobación (>=6,0) | 69,0 % | 22,0 % | 1,0 % |
| UniBench-100 | Tasa de resolución única | 7,0 % | 0,0 % | 0,0 % |
| UniBench-100 | Velocidad de evaluación | 35,7 tok/s | 27,5 tok/s | 163,4 tok/s |

Desglose por dominio del modelo nativo (puntuación / tasa de aprobación):

| Dominio | Meditor 3 (7,31) | Tasa de aprobación |
|---|---|---|
| Pensamiento crítico y evaluación de argumentos | 9,09 | 100,0 % |
| Expresión creativa y estilística | 8,38 | 90,0 % |
| Humanidades, filosofía y ética | 8,35 | 80,0 % |
| Ciencias físicas y de la vida | 7,41 | no disponible |

No se han publicado resultados de benchmarks para la versión GGUF Universal en la información disponible. Tampoco hay datos de MMLU, HumanEval, GSM8K ni otras métricas estándar.

## Requisitos de hardware
- VRAM estimada: entre 4,37 y 5,95 GiB según cuantización (BF16, Q8_0, Q4_K_M). El modelo nativo reporta un pico de 5,43 GiB en configuración bf16_low_vram.
- GPU recomendadas: no se especifican modelos concretos en la información. Por el tamaño, cabe en GPUs de consumo con 8 GB o más de VRAM (por ejemplo, RTX 3060 Ti, RTX 4060 Ti, RTX 3070) y en GPUs profesionales como A100 o H100 sin problemas de memoria.
- Cabe en GPU de consumo: sí, en modelos con al menos 8 GB de VRAM para Q4_K_M; para BF16 se recomienda 8-12 GB.
- Opciones de despliegue: llama.cpp, LM Studio, KoboldCpp y Ollama. El repositorio incluye etiquetas de compatibilidad con endpoints.
- Latencia y throughput: el modelo nativo reporta 35,7 tok/s en la evaluación UniBench-100; no hay datos de throughput específicos para la versión GGUF. El tamaño del repositorio (110,6 GB) sugiere que incluye múltiples cuantizaciones, lo que afecta al tiempo de descarga pero no a la inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros (total/activo) | Contexto | Licencia | Formato | Rendimiento declarado |
|---|---|---|---|---|---|
| Meditor-3-4B-Universal (este) | 4,16 B / 4,04-4,07 B | no disponible | Apache 2.0 | GGUF | 7,31/10 en UniBench-100 (nativo) |
| Meditor-3-4B-MoE (nativo) | 4,16 B / 4,04-4,07 B | no disponible | Apache 2.0 | safetensors | 7,31/10 en UniBench-100 |
| Meditor-2-3.4B-Universal | 3,41 B / 1,83 B | no disponible | Apache 2.0 | GGUF | 4,12/10 en UniBench-100 |
| Qwen3-4B (base) | 4 B denso | no disponible | Apache 2.0 | safetensors | no disponible en la información |

La comparación con modelos de la misma categoría fuera de la familia Meditor no está disponible en la información proporcionada. El modelo base Qwen3-4B es la referencia natural, pero no se han publicado sus resultados en UniBench-100 en este repositorio.

## Limitaciones y advertencias
- Las métricas de UniBench-100 (7,31/10, 69 % de aprobación) corresponden al modelo nativo con enrutamiento dinámico, no a esta compilación GGUF estática; el rendimiento real de la versión Universal puede diferir y no se ha publicado una evaluación específica.
- El benchmark UniBench-100 es propio del autor y está evaluado por un modelo juez (gemini-3.8-flash); no es un estándar independiente ni ha sido verificado por terceros (las métricas figuran como no verificadas).
- El modelo solo declara soporte de inglés; no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- Riesgo de alucinación inherente a modelos de 4 B de parámetros; las respuestas en dominios especializados deben verificarse.
- No hay información sobre sesgos conocidos, datos de entrenamiento ni procesos de alineación (RLHF/DPO), lo que dificulta evaluar riesgos de contenido.
- La licencia Apache 2.0 permite uso comercial, pero al derivar de Qwen3-4B conviene revisar las condiciones del modelo base.
- El repositorio ocupa 110,6 GB, lo que implica una descarga considerable si se quieren todas las cuantizaciones.
- No se dispone de información sobre la longitud de contexto soportada, un dato crítico para aplicaciones de contexto largo.
- El modelo tiene un solo "like" y 922 descargas en el momento de la consulta, lo que indica una adopción limitada y poca validación comunitaria.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/Yo-Purple/Meditor-3-4B-Universal
- Modelo nativo Meditor-3-4B-MoE: https://huggingface.co/Yo-Purple/Meditor-3-4B-MoE
- Meditor-2-3.4B-Universal: https://huggingface.co/Yo-Purple/Meditor-2-3.4B-Universal
- Meditor-1-500M-Universal: https://huggingface.co/Yo-Purple/Meditor-1-500M-Universal
- Modelo base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
