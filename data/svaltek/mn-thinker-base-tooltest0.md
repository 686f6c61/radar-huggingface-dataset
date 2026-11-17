# SvalTek/MN-Thinker-Base-ToolTest0

## Resumen

MN-Thinker-Base-ToolTest0 es un ajuste fino (fine-tuning) del modelo SvalTek/MN-Thinker-Base, publicado por el usuario SvalTek en Hugging Face. El nombre del repositorio sugiere un experimento orientado a probar capacidades de tool calling (uso de herramientas) sobre la base Mistral, aunque la model card no documenta explícitamente el objetivo ni el dataset de entrenamiento. Se distribuye en formato FP16 (16 bits) con pesos en safetensors.

El modelo cuenta con aproximadamente 12.250 millones de parámetros (12.247.782.400 según los metadatos de safetensors), lo que lo sitúa en la categoría de modelos de tamaño medio-grande tipo Mistral 7B ampliado o similar. El repositorio ocupa 24,5 GB, coherente con pesos FP16 de ese orden de magnitud. La arquitectura declarada en los tags es Mistral, un transformer decoder-only.

La relevancia de este modelo es limitada: se trata de un artefacto de pruebas con cero descargas y cero «likes» en el momento de la consulta, sin benchmarks publicados ni documentación técnica detallada. Resulta útil únicamente como referencia de un fine-tuning experimental sobre la base MN-Thinker-Base, con licencia Apache 2.0 que permite uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Mistral, según tags) |
| Parámetros totales | 12.247.782.400 (~12,25 mil millones) |
| Parámetros activos | no disponible (no es MoE según la información) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en FP16; compatible con cuantización posterior vía safetensors) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (FP16) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de SvalTek/MN-Thinker-Base, que a su vez se etiqueta como «mistral» en los tags del repositorio. Se trata por tanto de un transformer decoder-only con atención causal estándar, sin que la información disponible permita confirmar detalles como el número de capas, dimensión de embeddings, número de cabezas de atención o el uso de técnicas como GQA, sliding window attention o RoPE. Los metadatos no incluyen la arquitectura exacta ni el tamaño del vocabulario.

El entrenamiento se realizó con Unsloth y la librería TRL de Hugging Face, según declara la model card, lo que indica un pipeline de fine-tuning supervisado (SFT) acelerado y eficiente en memoria. No se especifican el número de tokens de entrenamiento, la composición del dataset, si hubo RLHF/DPO, ni el propósito concreto del ajuste. El sufijo «ToolTest0» sugiere un experimento preliminar de tool calling, pero no se aporta evidencia documental que lo confirme.

## Capacidades

- Generación de texto conversacional en inglés, heredada de la base Mistral.
- Posible soporte de tool calling / function calling (inferido del nombre del repositorio, no documentado).
- Razonamiento multi-paso y agentes: no disponible (no documentado).
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Prototipado de asistentes conversacionales en inglés: el modelo puede generar respuestas multi-turno en inglés; útil para pruebas internas antes de adoptar un modelo con benchmarks publicados.
- Experimentación con tool calling: dado el nombre del repositorio, puede servir para probar integraciones de function calling en pipelines de agentes, aunque sin garantías documentadas de fiabilidad.
- Fine-tuning posterior: al estar en FP16 con safetensors y licencia Apache 2.0, es una base apta para nuevos ajustes con Unsloth/TRL en flujos de investigación.
- Evaluación comparativa de ajustes: útil como punto de control intermedio para medir el efecto de un fine-tuning sobre la base MN-Thinker-Base.
- Generación de texto en entornos de I+D: para tareas de completado y redacción en inglés donde no se requiera un modelo con benchmarks certificados.
- Docencia y divulgación: ejemplo práctico de pipeline de fine-tuning con Unsloth y TRL sobre una base Mistral.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: ~24,5 GB solo de pesos, más overhead de activaciones y KV cache; en la práctica se recomienda ≥32 GB de VRAM para contexto moderado.
- Cuantización a 8 bits: ~12-13 GB de VRAM; a 4 bits: ~7-8 GB, lo que permitiría ejecución en GPUs de consumo.
- GPU recomendadas: A100 40/80 GB, H100, L40S para FP16; RTX 4090 (24 GB) solo con cuantización 8 bits o inferior; RTX 3090/4090 con 4-8 bits.
- Cabe en GPU de consumo: sí, únicamente con cuantización (4-8 bits) en RTX 3090, RTX 4090 o superiores.
- Opciones de despliegue: transformers, text-generation-inference (TGI, etiquetado como compatible), vLLM, llama.cpp/Ollama tras conversión a GGUF.
- Latencia y throughput estimados: no disponible (no se han publicado mediciones).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| MN-Thinker-Base-ToolTest0 | ~12,25 B | no disponible | Apache 2.0 | Hugging Face (0 descargas) | Fine-tuning experimental sin benchmarks |
| Mistral 7B (referencia de familia) | ~7,2 B | 8k-32k según versión | Apache 2.0 | Amplia | Modelo base de referencia de Mistral AI |
| Mistral Nemo 12B | ~12 B | 128k | Apache 2.0 | Amplia | Tamaño comparable, benchmarks publicados |
| Qwen2.5 14B | ~14,7 B | 32k-128k | Apache 2.0 | Amplia | Alternativa de tamaño similar con benchmarks |

No se dispone de datos de rendimiento del modelo evaluado para una comparación cuantitativa; la tabla recoge únicamente datos públicos de los modelos alternativos.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia objetiva de calidad, razonamiento, código o tool calling.
- Modelo de pruebas con nulas señales de adopción (0 descargas, 0 likes); no recomendado para producción sin evaluación propia.
- Riesgo elevado de alucinación no cuantificado; sin datos de RLHF/DPO que permitan estimar alineamiento.
- Idiomas: solo inglés declarado; el rendimiento en castellano no está garantizado.
- Contexto: no documentado; no planificar aplicaciones de contexto largo sin verificación empírica.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte.
- El nombre «ToolTest0» sugiere un estado experimental, con posibles regresiones respecto a la base.
- El tamaño de 24,5 GB en FP16 exige hardware considerable; el despliegue en GPU de consumo requiere cuantización con posible pérdida de calidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SvalTek/MN-Thinker-Base-ToolTest0
- Modelo base: https://huggingface.co/SvalTek/MN-Thinker-Base
- Unsloth (herramienta de entrenamiento): https://github.com/unslothai/unsloth
- TRL de Hugging Face: no disponible en la información proporcionada
- Paper o blog del modelo: no disponible
