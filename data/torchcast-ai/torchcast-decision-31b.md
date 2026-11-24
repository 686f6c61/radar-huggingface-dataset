# torchcast-ai/torchcast-decision-31b

## Resumen

Torchcast Decision 31B es un modelo de decisión textual desarrollado por Torchcast AI mediante un fine-tune completo de `google/gemma-4-31B-it`. No es un modelo generativo al uso: en lugar de producir texto libre, devuelve probabilidades tipadas (sí/no, distribuciones sobre opciones y distribuciones de puntuación ordinal) leyendo las letras de las opciones en la posición de respuesta en un único forward pass. Está pensado para integrarse en pipelines de clasificación, enrutamiento y evaluación con rúbricas acotadas mediante una API compatible con TypeSafe.

Técnicamente parte de la arquitectura de Gemma 4 (transformer híbrido con capas de atención de ventana deslizante y capas de atención global) con 32.682.372.656 parámetros reales según los pesos en safetensors. La modificación clave respecto al modelo base es que las capas de atención global no aplican máscara causal dentro del prompt (`attention_mode: hybrid_bidir_global`), lo que implica que las runtimes convencionales (vLLM, llama.cpp, MLX, transformers genérico) no reproducen las probabilidades evaluadas. Solo el paquete de serving `torchcast_decision` incluido en el repositorio implementa la interfaz correcta.

Su relevancia actual radica en que encabeza el board de capacidad de JevBench (89.5 de capacidad, 85.5 de inteligencia, 93.4 de calibración) según los mantenedores del benchmark, con licencia Apache 2.0 tanto en pesos como en el paquete de serving. El modelo está publicado en inglés y su uso previsto es la investigación en decisiones textuales, no la ejecución de acciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (capas de atención de ventana deslizante causales + capas de atención global bidireccional dentro del prompt), derivado de Gemma 4 |
| Parametros totales | 32.682.372.656 (32,7 B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | prompts superiores a 16.384 tokens conservan cabeza y cola del estado, como en entrenamiento |
| Tipos de cuantizacion | no disponible (los pesos publicados son bf16) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 (pesos y paquete de serving) |
| Formato de pesos | safetensors (librería transformers); tamaño del repo 65,4 GB |

## Arquitectura y entrenamiento

El modelo es un fine-tune completo de `google/gemma-4-31B-it` en el que se han ajustado todas las capas excepto los embeddings de entrada. La arquitectura conserva el esquema híbrido de Gemma 4: las capas de ventana deslizante mantienen atención causal como en el modelo base, mientras que las capas de atención global operan sin máscara causal dentro del prompt (`hybrid_bidir_global`), replicando el régimen visto durante el entrenamiento. El formato de prompt es `torchcast_gemma4_v1` (definido en `torchcast_decision/prompt.py`), el formato de chat de Gemma 4 con el modo thinking desactivado.

El entrenamiento combina splits oficiales de entrenamiento de datasets públicos con datos sintéticos de decisión que cubren preguntas de elección (`choice`), sí/no (`noul`) y puntuación ordinal (`score`). Según la model card, no se utilizaron ítems de test de benchmarks para el entrenamiento. La innovación principal no está en el preentrenamiento sino en la interfaz de inferencia: cada decisión se resuelve leyendo las letras de las opciones en la posición de respuesta en un único forward pass, sin generación autoregresiva; las listas con más de 26 opciones se deciden en varias pasadas agrupando opciones. Los ajustes de serving fijan temperatura 0.8 para `choice`, 0.6 para `noul` y 0.6 para `score`, con un umbral de compromiso de 0.801 para sí/no.

## Capacidades

- Decisión binaria sí/no con probabilidad calibrada (`noul`).
- Distribución de probabilidad sobre listas de opciones (`choice`), con soporte para listas de más de 26 opciones mediante pasadas agrupadas.
- Distribución de puntuación ordinal (`score`) para evaluaciones con rúbricas acotadas.
- Lectura de opciones en la posición de respuesta en un único forward pass, sin generación de texto.
- Interfaz tipada compatible con TypeSafe a través del paquete `torchcast_decision` y de `decision_config.json`.
- Procesamiento de prompts largos con retención de cabeza y cola del estado por encima de 16.384 tokens.
- Determinismo: ejecuciones repetidas en el mismo tipo de GPU producen probabilidades idénticas; las salidas con CUDA graphs y en modo eager son bit-idénticas.
- No soporta tool calling, function calling, agentes, visión ni audio: el pipeline declarado es `image-text-to-text` por herencia del modelo base, pero la model card describe exclusivamente decisiones textuales en inglés.
- Capacidades multilingües: no, solo inglés.

## Casos de uso

- Clasificación binaria en pipelines de moderación o filtrado: el modelo devuelve una probabilidad `noul` calibrada (umbral de compromiso 0.801) que puede usarse directamente como score de decisión sin postprocesar texto generado.
- Enrutamiento de consultas entre servicios o modelos: con `choice` se obtiene una distribución sobre un conjunto cerrado de rutas, lo que permite seleccionar la ruta de mayor probabilidad o aplicar umbrales de confianza.
- Evaluación con rúbricas acotadas: la salida `score` proporciona una distribución ordinal útil para puntuar respuestas de otros modelos en escalas discretas dentro de pipelines de evaluación automática.
- Investigación en calibración de decisiones: su alta puntuación de calibración en JevBench (93.4) lo hace adecuado para estudiar la fiabilidad de probabilidades en tareas de clasificación y elección.
- Decisión sobre listas largas de candidatos: el mecanismo de pasadas agrupadas permite decidir entre más de 26 opciones, útil en selección de documentos o candidatos en retrieval reranking.
- Serving de baja latencia en producción: con latencias medianas de 48 ms en H100 y 74 ms en RTX PRO 6000 sobre ítems públicos de JevBench, encaja en servicios de decisión síncronos donde no se puede asumir el coste de generación autoregresiva.
- Auditoría y reproducibilidad: la captura de CUDA graphs al arranque (para prompts de hasta 4.096 tokens) y la determinismo bit a bit facilitan la reproducibilidad en entornos regulados.

## Benchmarks y rendimiento

Resultados publicados por los mantenedores de JevBench sobre el tag `v1.0.0`:

| Modelo | Intelligence | Calibration | Capability | Composite |
|---|---|---|---|---|
| Torchcast Decision 31B v1.0 | 85.5 | 93.4 | 89.5 | 78.9 |
| Torchcast Decision 4B v1.3 | 67.1 | 87.8 | 77.5 | 80.5 |
| Torchcast Decision 4B v1.2 | 60.3 | 85.0 | 72.6 | 77.0 |
| Jev 1.14.0 (TypeSafe AI, API cerrada) | 59.9 | 90.1 | 75.0 | 70.2 |

Capability promedia Intelligence y Calibration; Composite pondera por igual Intelligence, Calibration, Speed y Cost. El modelo ocupa el puesto #1 en el board de capacidad y el #2 en el ranking compuesto, por detrás de Torchcast Decision 4B v1.3. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM: los pesos en bf16 requieren una GPU con al menos 80 GB.
- GPU probadas: H100 80 GB (kernel FlashAttention-3 para capas de ventana deslizante, fijado a un commit concreto y precargado para arranques offline) y RTX PRO 6000 96 GB (kernel PyTorch SDPA).
- GPU de consumo: no cabe en GPUs de consumo convencionales (RTX 4090 de 24 GB, etc.) en bf16; no se documentan cuantizaciones alternativas.
- Despliegue: exclusivamente mediante el paquete `torchcast_decision` con `decision_config.json`. vLLM, llama.cpp, MLX y transformers genérico no reproducen la interfaz evaluada por la atención global bidireccional.
- Latencia: mediana de 48 ms en H100 y 74 ms en RTX PRO 6000 sobre ítems públicos de JevBench, con una petición a la vez; el prompt más largo tarda 4,1 s en H100 y 6,2 s en RTX PRO 6000.
- Arranque: captura de CUDA graphs para prompts de hasta 4.096 tokens, en torno a un minuto.
- Throughput: no disponible (las mediciones publicadas son de latencia con una petición concurrente).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Capability (JevBench) | Composite | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Torchcast Decision 31B v1.0 | 32,7 B | >16.384 tokens (cabeza y cola) | 89.5 | 78.9 | Apache 2.0 | Pesos abiertos en HF |
| Torchcast Decision 4B v1.3 | no disponible | no disponible | 77.5 | 80.5 | no disponible en la información | Pesos abiertos en HF |
| Torchcast Decision 4B v1.2 | no disponible | no disponible | 72.6 | 77.0 | no disponible en la información | Pesos abiertos en HF |
| Jev 1.14.0 (TypeSafe AI) | no disponible | no disponible | 75.0 | 70.2 | API cerrada | Solo API |

La comparativa se limita al ecosistema JevBench porque no se dispone de datos de benchmarks estándar para contrastar con modelos de decisión de otros proveedores. El 4B de la misma familia obtiene mejor composite (80.5 frente a 78.9) pese a menor capacidad, lo que refleja el peso de velocidad y coste en esa métrica.

## Limitaciones y advertencias

- Solo inglés: no se documenta soporte de otros idiomas.
- Las probabilidades pueden ser poco fiables en dominios nuevos, según advierte el propio autor.
- El servidor devuelve decisiones y no ejecuta acciones; cualquier integración con efectos externos requiere una capa de ejecución separada.
- Cargar los pesos con transformers genérico, vLLM, llama.cpp o MLX produce probabilidades distintas a las evaluadas por la atención global sin máscara causal; es imprescindible usar el paquete `torchcast_decision`.
- No cabe en GPUs de consumo en bf16; el despliegue exige hardware de 80 GB o más.
- No se documentan sesgos específicos ni evaluaciones de seguridad en la información disponible.
- Riesgo de alucinación no aplicable en el sentido generativo (no produce texto libre), pero sí riesgo de calibración errónea fuera de distribución.
- Licencia Apache 2.0 en pesos y serving, con atribución al modelo base Gemma 4 de Google; el proyecto es independiente de TypeSafe AI y de los mantenedores de JevBench.
- Los resultados de JevBench están medidos por los mantenedores del benchmark, no por un tercero independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/torchcast-ai/torchcast-decision-31b
- Instrucciones de serving (GitHub, tag v1.0.0): https://github.com/Torchcast-AI/torchcast-decision-31b/tree/v1.0.0#run-for-evaluation
- Leaderboard de JevBench: https://benchmarkheaven.com/jev-models
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
