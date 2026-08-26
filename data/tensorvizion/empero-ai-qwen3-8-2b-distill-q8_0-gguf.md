# TensorVizion/empero-ai-Qwen3.8-2B-Distill-q8_0-GGUF

## Resumen

El modelo `TensorVizion/empero-ai-Qwen3.8-2B-Distill-q8_0-GGUF` es una cuantización en formato GGUF (Q8_0) del modelo `empero-ai/Qwen3.8-2B-Distill`, una destilación de parámetros completos del modelo Qwen3.8 2.4T A95B de Alibaba sobre la arquitectura Qwen3.5-2B. El autor del repositorio es TensorVizion, mientras que la destilación original fue desarrollada por EmperoAI, un laboratorio de investigación independiente con sede en Alemania. El modelo está diseñado para ejecutarse en dispositivos con recursos limitados (edge), como teléfonos, placas de desarrollo y CPUs sin GPU, manteniendo capacidades de razonamiento y llamada a funciones.

El modelo se publica bajo licencia Apache 2.0 y hereda la ventana de contexto nativa de 262.144 tokens de la arquitectura Qwen3.5. Con aproximadamente 1.940 millones de parámetros, ofrece una destilación del razonamiento de un modelo masivo en un formato ligero. La cuantización Q8_0 reduce el peso a unos 2,1 GB, lo que permite su ejecución en entornos de memoria limitada mediante llama.cpp, Ollama o LM Studio.

La relevancia actual de este modelo radica en su enfoque de destilación de trazas de razonamiento (chain-of-thought) de un modelo de 2,4 billones de parámetros hacia una arquitectura de 2 mil millones, con el objetivo de democratizar el razonamiento avanzado en dispositivos de bajo costo. La cuantización GGUF facilita su despliegue en producción sin necesidad de infraestructura especializada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (transformer con atención lineal híbrida Gated DeltaNet y convolución causal) |
| Parámetros totales | 1.942.653.248 |
| Parámetros activos | No es un modelo MoE, todos los parámetros están activos |
| Longitud de contexto | 262144 tokens |
| Tipos de cuantización | Q8_0 (GGUF) |
| Idiomas soportados | Inglés (entrenado principalmente en inglés; el base Qwen3.5 es multilingüe) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors disponible en el modelo base) |

## Arquitectura y entrenamiento

El modelo es una destilación full-parameter (todos los parámetros actualizados) de Qwen3.8 2.4T A95B hacia la arquitectura Qwen3.5-2B. La arquitectura Qwen3.5 combina atención lineal híbrida con Gated Delta Attention y convolución causal, lo que reduce la complejidad de memoria y permite contextos largos de 262144 tokens de forma nativa. El entrenamiento se realizó mediante SFT off-policy sobre aproximadamente 30.000 trazas de razonamiento del profesor, filtradas por calidad, que cubren matemáticas, razonamiento general e instrucciones. No se usaron adaptadores: se actualizaron todos los parámetros del estudiante.

El proceso de destilación copió el mismo currículo de razonamiento que los modelos hermanos Qwen3.8-4B y Qwen3.8-9B, pero con una capacidad menor. Cada respuesta comienza con un bloque `thinking` que reproduce las trazas del profesor. El modelo base es `Qwen/Qwen3.5-2B`, que hereda las capacidades de visión de la arquitectura Qwen3.5, aunque la destilación se centró únicamente en texto. Para ejecutar las capas de atención lineal de forma eficiente se requieren kernels de Gated DeltaNet (`flash-linear-attention`) y `causal_conv1d`; sin ellos, se cae en operaciones PyTorch lentas.

## Capacidades

- Generación de texto con razonamiento de cadena de pensamiento destilado: cada respuesta incluye un bloque `thinking` que reproduce las trazas del teacher.
- Razonamiento matemático y general: evaluado en GSM8K y MMLU con protocolos de CoT.
- Llamada a funciones nativa según la especificación Qwen3.5, sin necesidad de fine-tunes específicos para herramientas.
- Soporte para agentes y razonamiento multi-paso, gracias a la arquitectura de razonamiento destilado.
- Capacidades multilingües heredadas del base Qwen3.5, aunque el entrenamiento de destilación se enfocó en inglés.
- Longitud de contexto de 262.144 tokens, adecuada para tareas de razonamiento de largo alcance y conversaciones extensas.
- Funcionamiento en dispositivos de edge: cuantización Q8_0 permite ejecución en CPU, teléfonos y SBC.

## Casos de uso

- Asistente de atención al cliente en dispositivos locales: el modelo puede gestionar conversaciones multi-turno con contexto largo gracias a su ventana de 262.000 tokens. Al ser Q8_0, se puede desplegar en un servidor CPU sin GPU, reduciendo costes de infraestructura.
- Razonamiento matemático en aplicaciones educativas: por ejemplo, un tutor que resuelve problemas paso a paso, mostrando el bloque `thinking` al estudiante. Su rendimiento en GSM8K (0.640 exact_match flexible) lo hace útil para tareas de nivel escolar.
- Herramienta de documentación técnica: con la llamada a funciones nativa, se puede integrar en un pipeline que consulta APIs internas, buscadores o bases de conocimiento para responder preguntas específicas de dominio.
- Generación de respuestas en dispositivos móviles: al ser un modelo de 2B en Q8_0, puede ejecutarse en un teléfono con 3-4 GB de RAM mediante llama.cpp, proporcionando un asistente local sin conexión.
- Automatización de tareas de razonamiento en entornos de edge: para sistemas embebidos con restricciones de memoria, como robots de juguete o dispositivos IoT que necesitan entender instrucciones complejas.
- Análisis de documentos largos: con la ventana de 262k tokens, el modelo puede procesar informes extensos o libros completos para extraer información, aunque la capacidad de memoria factual se limita a 2B parámetros.

## Benchmarks y rendimiento

Los resultados publicados en la model card del modelo base (medidos con `lm-evaluation-harness`, HF backend, con protocolos CoT) son los siguientes:

| Tarea | Métrica | Qwen3.5-2B (base) | Qwen3.8-2B | Δ |
|---|---:|---:|---:|---:|
| gsm8k_cot | exact_match (flexible) | 0.330 | 0.640 | +0.310 |
| gsm8k_cot | exact_match (strict) | 0.545 | 0.640 | +0.095 |
| mmlu (CoT, 57 subjects) | acc (flexible-extract) | 0.283 | 0.548 | +0.265 |
| mmlu (CoT, 57 subjects) | acc (strict-match) | 0.004 | 0.225 | +0.221 |

Los resultados corresponden al modelo en bf16; la cuantización Q8_0 suele mantener una degradación mínima (< 1-2%) en estas tareas, aunque no se han publicado mediciones específicas para esta versión cuantizada.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo Q8_0 ocupa aproximadamente 2,1 GB en memoria. En CPU se necesita RAM, no VRAM. Con cuantización Q8_0 se puede ejecutar con 2,5-3 GB de RAM.
- GPU recomendadas: no es necesario; el modelo está diseñado para CPU. En GPU consumer (RTX 3060, 4060, etc.) se puede ejecutar con menos de 2 GB de VRAM, pero no es el objetivo.
- Compatibilidad con consumer GPU: sí, cabe en cualquier GPU con al menos 2 GB de VRAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, Jan, KoboldCpp. También compatible con vLLM y SGLang si se usa el formato safetensors (modelo base).
- Latencia y throughput: en CPU moderna (por ejemplo, un i5 con AVX2), la generación de tokens puede ser de 5-10 tokens por segundo. En GPU (por ejemplo, una RTX 4090) puede superar los 100 tokens por segundo. No se han publicado benchmarks específicos de throughput para esta cuantización.

## Comparativa con modelos similares

El modelo compite con otros modelos de ~2B parámetros orientados a razonamiento y uso en edge. Comparación con el base Qwen3.5-2B y con el modelo Qwen3.8-4B de la misma familia:

| Modelo | Params | Contexto | GSM8K (flexible) | MMLU (flexible) | Licencia |
|---|---:|---:|---:|---:|---|
| Qwen3.5-2B (base) | 2B | 262k | 0.330 | 0.283 | Apache-2.0 |
| **Qwen3.8-2B (este modelo)** | 2B | 262k | 0.640 | 0.548 | Apache-2.0 |
| Qwen3.8-4B | 4B | 262k | no disponible | no disponible | Apache-2.0 |
| Qwen3.8-9B | 9B | 262k | no disponible | no disponible | Apache-2.0 |

No se dispone de benchmarks publicados para los modelos hermanos 4B y 9B en la información disponible. La ventaja del modelo de 2B es su tamaño y eficiencia para el edge; los modelos de 4B y 9B ofrecen más capacidad de razonamiento y mejor rendimiento en código (el 9B incluye entrenamiento en código).

## Limitaciones y advertencias

- Capacidad limitada por parámetros: con 2B parámetros, el modelo tiene una memoria factual limitada y puede fallar en problemas de razonamiento muy complejos o con múltiples pasos.
- Sesgo lingüístico: la destilación se centró en inglés; el comportamiento en otros idiomas no se evaluó y puede ser inferior al del base Qwen3.5.
- Alucinación: como todos los modelos de 2B, existe riesgo de alucinación en tareas de hecho o cuando se le pide información específica no cubierta en el entrenamiento.
- Repetición en decodificación greedy: el README advierte que la decodificación greedy con generaciones largas provoca bucles de repetición; se recomienda usar sampling con `temperature=0.6, top_p=0.95, top_k=20`.
- Requisito de kernels específicos: para un rendimiento óptimo en las capas de atención lineal se necesitan `flash-linear-attention` y `causal_conv1d` compilados con CUDA; sin ellos, se ejecuta con operaciones PyTorch lentas.
- Visión no evaluada: aunque el base Qwen3.5 es un modelo de visión-lenguaje, la destilación se centró en texto y no se evaluó el comportamiento de visión.
- Uso comercial: permitido bajo licencia Apache-2.0, sin restricciones de uso comercial.

## Enlaces

- Repositorio Hugging Face de la cuantización GGUF: https://huggingface.co/TensorVizion/empero-ai-Qwen3.8-2B-Distill-q8_0-GGUF
- Modelo base (safetensors): https://huggingface.co/empero-ai/Qwen3.8-2B
- Modelo GGUF del autor original: https://huggingface.co/empero-ai/Qwen3.8-2B-Distill-GGUF
- Web de Empero: https://empero.org/
- Repositorio GitHub de Qwen3.8: https://github.com/QwenLM/Qwen3.8
