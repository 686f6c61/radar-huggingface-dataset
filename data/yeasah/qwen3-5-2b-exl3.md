# yeasah/Qwen3.5-2B-exl3

## Resumen

Qwen3.5-2B-exl3 es una cuantización EXL3 del modelo base Qwen/Qwen3.5-2B, publicada por el usuario yeasah. No se trata de un modelo entrenado desde cero, sino de una conversión de pesos orientada a reducir el coste de memoria en inferencia manteniendo la fidelidad de la distribución de siguiente token respecto al modelo original. El modelo base es multimodal (pipeline image-text-to-text), con 2B parámetros y licencia Apache 2.0.

La aportación principal de esta ficha es la metodología de cuantización: calibración sobre texto que el modelo lee y escribe en producción (documentos, salidas de herramientas, código y diffs, respuestas propias) en lugar de solo texto web, asignación de bits por tensor según sensibilidad medida, y redondeo con LDLQ de dos lados y factor de Fisher del lado de la salida (tras YAQA). Se ofrecen cinco niveles de bits por peso (3.50, 4.00, 5.00 y 6.00 BPW, además del base sin cuantizar de 4.24 GiB), cada uno como revisión separada del repositorio.

Es relevante porque permite ejecutar un modelo multimodal de 2B en GPU de consumo con un consumo de VRAM en vLLM de entre 0.86 y 1.32 GiB según el nivel, con métricas publicadas de divergencia (KLD) y de retención de hechos, lo que facilita decisiones de despliegue informadas. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 16 de noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen/Qwen3.5-2B; transformer multimodal image-text-to-text) |
| Parametros totales | 2B (según nombre del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 en 3.50, 4.00, 5.00 y 6.00 BPW; base sin cuantizar 4.24 GiB |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | EXL3 (compatible con exllamav3 y vLLM vía vllm-exl3-plugin) |

## Arquitectura y entrenamiento

El modelo base Qwen/Qwen3.5-2B es un transformer multimodal de 2B parámetros (pipeline image-text-to-text), pero la información proporcionada no detalla su arquitectura interna, composición del dataset de entrenamiento, número de tokens ni si se aplicó RLHF o DPO. Esta ficha describe la cuantización, no el entrenamiento del modelo original.

La cuantización EXL3 emplea varias técnicas destacables. La calibración se realiza sobre datos representativos del uso real (documentos, salidas de herramientas en conversaciones, código y diffs, y respuestas del propio modelo), no solo texto web. La asignación de bits es por tensor, a partir de la sensibilidad medida sobre las respuestas del modelo, manteniendo el mismo tamaño total que una asignación uniforme. El redondeo usa LDLQ de dos lados con factor de Fisher del lado de la salida (tras YAQA), lo que cambia solo el redondeo, no el tamaño ni el formato. Además, el token embedding también está cuantizado, lo que requiere exllamav3 1.6.4 o superior. El repositorio incluye un `generation_config.json` con los parámetros de muestreo recomendados por la model card del base (temperature 1.0, top_p 0.95, top_k 20, min_p 0.0, presence_penalty 1.5, repetition_penalty 1.0 para uso con thinking), ya que el repositorio original no lo incluía.

## Capacidades

- Generación de texto y razonamiento: heredadas del modelo base Qwen3.5-2B, no documentadas en detalle en la información disponible.
- Procesamiento de imagen y texto: el pipeline es image-text-to-text, por lo que el modelo acepta entradas multimodales.
- Modo thinking: la model card del base recomienda parámetros de muestreo específicos para uso con thinking.
- Tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (visión, audio, etc.): visión confirmada por el pipeline image-text-to-text; audio no disponible.

## Casos de uso

- Despliegue en GPU de consumo: con 0.86 GiB de VRAM en vLLM para el nivel 3.50 BPW, el modelo cabe en tarjetas de gama media y permite prototipado local de un modelo multimodal de 2B sin infraestructura dedicada.
- Evaluación de cuantizaciones en pipelines de investigación: las métricas publicadas de KLD y retención de hechos permiten comparar el impacto de la cuantización sobre un modelo base concreto antes de adoptarlo en producción.
- Servicio de inferencia con vLLM: el plugin vllm-exl3-plugin permite servir el modelo con el stack de vLLM, aprovechando su gestión de memoria y su compatibilidad con endpoints.
- Aplicaciones multimodales ligeras: al ser image-text-to-text, puede usarse para tareas de descripción de imágenes o preguntas sobre imágenes en entornos con recursos limitados, aunque las capacidades concretas no están documentadas.
- Uso con exllamav3 y TabbyAPI: el formato EXL3 y el `generation_config.json` incluido permiten desplegar el modelo con los parámetros de muestreo recomendados por el autor del base.
- Experimentación con calibración sensible a la tarea: el enfoque de calibración sobre documentos, código y salidas de herramientas lo hace adecuado para entornos de desarrollo y agentes donde el texto de entrada difiere del texto web genérico.
- Comparación de niveles de bits: las cuatro revisiones (3.50, 4.00, 5.00 y 6.00 BPW) permiten ajustar el compromiso entre VRAM y fidelidad (por ejemplo, 6.00 BPW retiene el 97.0% de los hechos con 0.00% de errores confiados).

## Benchmarks y rendimiento

Los datos publicados en la model card son métricas de cuantización, no benchmarks de capacidad del modelo base.

| BPW | Tamano en disco | VRAM (vLLM) | Excess KLD | Δ perplejidad | Hechos retenidos | Errores confiados |
|---|---|---|---|---|---|---|
| 3.50 | 1.75 GiB | 0.86 GiB | 0.0219 | +2.97% | 83.5% | 0.91% |
| 4.00 | 1.89 GiB | 1.00 GiB | 0.0109 | +1.56% | 85.8% | 0.27% |
| 5.00 | 2.10 GiB | 1.16 GiB | 0.0029 | +0.40% | 94.0% | 0.00% |
| 6.00 | 2.26 GiB | 1.32 GiB | 0.0009 | +0.14% | 97.0% | 0.00% |
| base | 4.24 GiB | no disponible | 0 | 0 | 100% (referencia) | no disponible |

No se han publicado resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en vLLM: 0.86 GiB (3.50 BPW), 1.00 GiB (4.00 BPW), 1.16 GiB (5.00 BPW) y 1.32 GiB (6.00 BPW); el checkpoint completo ocupa entre 1.75 y 2.26 GiB en disco.
- GPU recomendadas: no disponible en la información proporcionada; por el consumo de VRAM, cualquier GPU con al menos 2 GiB libres podría alojar los pesos, aunque no se especifican modelos concretos.
- Cabe en GPU de consumo: sí, según los valores de VRAM indicados, aunque no se detallan tarjetas concretas.
- Opciones de despliegue: exllamav3 (versión 1.6.4 o superior por el embedding cuantizado), vLLM con vllm-exl3-plugin, y TabbyAPI (mencionado como servidor que respeta `generation_config.json`).
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yeasah/Qwen3.5-2B-exl3 | 2B | no disponible | EXL3 (3.50-6.00 BPW) | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-2B (base) | 2B | no disponible | pesos originales (4.24 GiB) | Apache 2.0 | Hugging Face |
| unsloth/Qwen3.5-2B-GGUF | 2B | no disponible | GGUF (llama.cpp) | no disponible en la información | Hugging Face |

La model card compara directamente con unsloth/Qwen3.5-2B-GGUF en las mismas métricas (excess KLD al mismo tamaño), pero no se proporcionan los valores numéricos de esa comparación en la información disponible.

## Limitaciones y advertencias

- La cuantización puede dejar al modelo fluido pero incorrecto en hechos: incluso a 3.50 BPW se pierde el 16.5% de los hechos que el modelo sin cuantizar acertaba, y aparecen errores confiados (0.91%).
- La pérdida no es uniforme: el modelo retiene mejor lo que el original sabía con seguridad y pierde más lo que apenas conocía; los hechos que el base sostiene con poca confianza son los más vulnerables.
- Las métricas de retención de hechos se basan en 1101 preguntas cerradas y miden memoria factual, no capacidad general.
- No hay datos publicados sobre sesgos, alucinación en generación abierta, limitaciones de contexto ni cobertura idiomática.
- La licencia Apache 2.0 permite uso comercial, pero las condiciones del modelo base deben verificarse en su propio repositorio.
- El embedding cuantizado exige exllamav3 1.6.4 o superior; versiones anteriores no son compatibles.
- El repositorio tiene 0 descargas y 0 likes, por lo que no hay validación comunitaria documentada.
- La VRAM real puede ser significativamente menor que el tamaño total del checkpoint según la configuración; los valores de la tabla corresponden a vLLM con el plugin por defecto.

## Enlaces

- Hugging Face: https://huggingface.co/yeasah/Qwen3.5-2B-exl3
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Commit del base usado: https://huggingface.co/Qwen/Qwen3.5-2B/tree/15852e8c16360a2fea060d615a32b45270f8a8fc
- Licencia del base: https://huggingface.co/Qwen/Qwen3.5-2B/blob/main/LICENSE
- exllamav3: https://github.com/turboderp-org/exllamav3
- vllm-exl3-plugin: https://github.com/yeasah/vllm-exl3-plugin
- Cuantización GGUF comparable: https://huggingface.co/unsloth/Qwen3.5-2B-GGUF
- Revisión 3.50 BPW: https://huggingface.co/yeasah/Qwen3.5-2B-exl3/tree/3.50bpw-H5
- Revisión 4.00 BPW: https://huggingface.co/yeasah/Qwen3.5-2B-exl3/tree/4.00bpw
- Revisión 5.00 BPW: https://huggingface.co/yeasah/Qwen3.5-2B-exl3/tree/5.00bpw
- Revisión 6.00 BPW: https://huggingface.co/yeasah/Qwen3.5-2B-exl3/tree/6.00bpw
