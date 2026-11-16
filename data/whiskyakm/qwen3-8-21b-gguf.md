# WhiskyAKM/Qwen3.8-21B-GGUF

## Resumen

WhiskyAKM/Qwen3.8-21B-GGUF es una versión podada (pruned) y cuantizada en formato GGUF del modelo Qwen/Qwen3.8-27B, desarrollado originalmente por el equipo Qwen. La modificación consiste en la eliminación de los bloques 6, 7, 8 y 9 de la red, lo que reduce el total de parámetros desde los 27B del modelo original hasta aproximadamente 20,8 mil millones (20.807.699.328 según los pesos safetensors). El resultado se distribuye en múltiples cuantizaciones GGUF listas para su uso con llama.cpp y runtimes compatibles.

El modelo hereda las características del Qwen3.8-27B: arquitectura híbrida con atención lineal (linear-attention) y atención completa, capacidades multimodales (aunque la visión no fue validada tras la poda) y soporte multilingüe. La poda de bloques intermedios es una técnica agresiva que busca reducir los requisitos de memoria manteniendo parte de las capacidades del modelo original, a costa de una degradación de calidad que el propio autor documenta.

Es relevante para desarrolladores que necesitan desplegar un modelo de ~21B en hardware con recursos limitados usando llama.cpp, especialmente porque el autor advierte explícitamente sobre qué cuantizaciones degradan más la calidad. No obstante, se trata de un modelo derivado sin benchmarks publicados y con cero descargas en el momento de la consulta, por lo que su validación empírica queda pendiente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención lineal (linear-attention) y atención completa; modelo base Qwen3.8-27B con bloques 6, 7, 8 y 9 podados |
| Parámetros totales | 20.807.699.328 (~20,8B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la información proporcionada (los ejemplos de uso emplean `-c 32768`) |
| Tipos de cuantización | Q4_0, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 y BF16 sin cuantizar |
| Idiomas soportados | multilingüe (sin listado específico) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base original usa safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura transformer híbrida que combina capas de atención lineal con capas de atención completa, según los tags de la model card (`hybrid attention`, `linear-attention`). Esta modificación concreta no entrena el modelo: aplica una poda estructural eliminando los bloques 6, 7, 8 y 9 del modelo original, lo que reduce el número de parámetros de 27B a ~20,8B. No se proporciona información sobre el proceso de poda más allá de los índices de bloque eliminados, ni sobre si hubo recuperación (fine-tuning) posterior a la poda.

No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron técnicas de RLHF o DPO en el modelo original. Tampoco se documenta el impacto de la poda en la perplejidad o en tareas específicas. El autor menciona que las capacidades de visión y de predicción multi-token (MTP) no fueron probadas tras la poda, y que el proyector multimodal (`mmproj`) puede obtenerse de cualquier otro repositorio GGUF del Qwen3.8-27B.

## Capacidades

- Generación de texto conversacional y de propósito general, heredada del modelo base.
- Razonamiento y generación de código: el modelo base se presenta en el blog de Qwen como un avance en coding y cowork, aunque no se validan estas capacidades tras la poda.
- Capacidades multimodales (visión): el modelo base las soporta, pero el autor indica que no fueron probadas en esta versión podada; requiere un `mmproj` externo.
- Predicción multi-token (MTP): presente en el modelo base, no probada tras la poda.
- Soporte multilingüe declarado, sin listado de idiomas concreto.
- Compatibilidad con API OpenAI mediante `llama-server`.
- Soporte de tool calling / function calling: no confirmado en la información disponible para esta versión podada.

## Casos de uso

- Despliegue local en estaciones de trabajo con GPU de consumo: las cuantizaciones Q4_K_M (13 GB) y Q5_K_M (14 GB) permiten ejecutar el modelo en GPUs con 16-24 GB de VRAM mediante llama.cpp, algo inviable con el BF16 de 39 GB.
- Servicio de API compatible con OpenAI en infraestructura propia: `llama-server` expone un endpoint compatible con el cliente de OpenAI, lo que facilita integrar el modelo en aplicaciones existentes sin cambiar el código de cliente.
- Prototipado de asistentes conversacionales multi-turno: con `-c 32768` en los ejemplos, el modelo puede mantener conversaciones con contexto amplio en entornos de desarrollo y pruebas.
- Experimentación con modelos podados: útil para investigadores que quieran medir el impacto de eliminar bloques intermedios en un transformer híbrido, comparando contra el Qwen3.8-27B original.
- Inferencia en CPU o configuraciones mixtas CPU/GPU: el formato GGUF y las cuantizaciones Q4/Q5 permiten ejecución parcial en CPU cuando la VRAM es insuficiente.
- Evaluación de pipelines multimodales: cargando un `mmproj` externo del Qwen3.8-27B, se puede probar la integración de visión en `llama-server`, aunque el autor no garantiza su correcto funcionamiento tras la poda.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según tamaño de archivo GGUF):
  - Q4_0 / Q4_K_S: ~12 GB
  - Q4_K_M: ~13 GB
  - Q5_K_S / Q5_K_M: ~14 GB
  - Q6_K: ~16 GB
  - Q8_0: ~21 GB
  - BF16: ~39 GB
- GPU recomendadas: no especificadas por el autor. Por tamaño, las cuantizaciones Q4/Q5 encajan en RTX 4090 (24 GB), RTX 3090 (24 GB) y A100 40 GB; Q8_0 requiere 24 GB o más; BF16 requiere A100 80 GB o H100 80 GB.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 con cuantizaciones Q4 y Q5; Q6_K (16 GB) también encaja en 24 GB.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), y por extensión cualquier runtime compatible con GGUF (Ollama, LM Studio, etc., aunque no se mencionan explícitamente).
- Latencia y throughput: no disponibles.
- Advertencia del autor: la cuantización del KV cache en Q4 y Q5 provoca una degradación significativa de la calidad.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| WhiskyAKM/Qwen3.8-21B-GGUF | ~20,8B | no disponible | Apache 2.0 | GGUF | Poda de bloques 6-9 del Qwen3.8-27B; sin benchmarks publicados |
| Qwen/Qwen3.8-27B | 27B | no disponible | Apache 2.0 (según modelo derivado) | safetensors | Modelo base original; capacidades completas incluyendo visión y MTP |
| Otras cuantizaciones GGUF del Qwen3.8-27B | 27B | no disponible | Apache 2.0 | GGUF | Mantienen todos los bloques; mayor tamaño y VRAM requerida |

La comparativa con modelos de otros fabricantes no está disponible en la información proporcionada.

## Limitaciones y advertencias

- La poda de los bloques 6-9 degrada la calidad respecto al modelo original; el autor no cuantifica la pérdida.
- El autor desaconseja explícitamente la cuantización Q4_0 por "degradación sorprendentemente grande".
- La cuantización del KV cache en Q4 y Q5 causa una degradación significativa de la calidad, según advierte el autor.
- Las capacidades de visión y MTP no fueron probadas tras la poda; el `mmproj` debe obtenerse de otro repositorio y su compatibilidad no está garantizada.
- No hay benchmarks publicados que permitan validar el rendimiento real del modelo podado.
- Riesgo de alucinación: no documentado específicamente, pero inherente a los modelos de lenguaje; la poda puede incrementarlo.
- Sesgos: no documentados en la información disponible.
- Licencia Apache 2.0: permite uso comercial, pero al ser un modelo derivado conviene verificar las condiciones del modelo base Qwen3.8-27B.
- Repositorio con cero descargas y cero likes en el momento de la consulta: sin validación por parte de la comunidad.
- Idioma: se declara multilingüe pero no se especifica qué idiomas están cubiertos ni su calidad tras la poda.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/WhiskyAKM/Qwen3.8-21B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Blog de Qwen3.8: https://qwen.ai/blog?id=qwen3.8
