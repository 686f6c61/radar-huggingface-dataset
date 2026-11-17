# thienlng/Telasap-1.0-Small

## Resumen

Telasap-1.0-Small es un modelo de decisión de 2B parámetros desarrollado por el usuario thienlng (thienlng) mediante ajuste fino supervisado del modelo base Qwen/Qwen3.5-2B. A diferencia de un modelo generativo convencional, su función es recibir un estado (state) junto con preguntas tipadas —de elección múltiple, de puntuación y de verdadero/falso— y devolver una probabilidad calibrada para cada opción disponible. El modelo se distribuye a través de Hugging Face con licencia Apache-2.0 y pesos en formato safetensors.

El modelo resuelve un problema concreto: convertir un LLM generativo en un evaluador probabilístico de opciones discretas, lo que resulta útil en pipelines de decisión automatizada, sistemas de agentes y arquitecturas de tipo "System One" (respuesta rápida e intuitiva) frente a razonamiento deliberativo. La arquitectura subyacente es la del transformer de Qwen3.5-2B, con 2.213.241.664 parámetros totales y una ventana de contexto de 32.768 tokens por llamada.

Es relevante ahora porque propone un patrón de uso poco común de los LLM: en lugar de generar texto libre, expone un endpoint HTTP (`POST /v1/systemone`) que devuelve distribuciones de probabilidad sobre opciones, lo que facilita su integración en sistemas de control, ranking y toma de decisiones con requisitos de latencia y determinismo. No obstante, la información pública disponible es muy limitada: no hay benchmarks, no se detallan los datos de entrenamiento ni los idiomas soportados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-2B, etiqueta `qwen3_5`) |
| Parámetros totales | 2.213.241.664 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens por llamada |
| Tipos de cuantización | No disponible (el autor indica ejecución en bfloat16) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Telasap-1.0-Small es un ajuste fino (finetune) del modelo Qwen/Qwen3.5-2B, un transformer denso de aproximadamente 2,2 mil millones de parámetros. La model card no especifica la composición del dataset de ajuste fino, el número de tokens utilizados, ni si se emplearon técnicas de RLHF, DPO o preferencias. Tampoco se detalla si se modificó la cabeza de clasificación original o si se añadió una nueva cabeza para la tarea de decisión probabilística.

La innovación técnica destacable es la interfaz de uso: el modelo no se presenta como generador de texto, sino como un evaluador de opciones tipadas (choice, score, true/false) que devuelve una probabilidad por opción. El servidor incluido (`serve.py`) expone endpoints HTTP (`POST /v1/systemone`, `GET /v1/models`, `GET /healthz`), requiere una GPU CUDA Ampere o superior y opera en bfloat16. No se documentan técnicas como decodificación especulativa, atención lineal ni mecanismos híbridos SSM.

## Capacidades

- Evaluación probabilística de opciones: dado un estado y una pregunta de elección múltiple, devuelve una probabilidad para cada opción.
- Preguntas de puntuación (score): asigna valores probabilísticos a respuestas numéricas o graduadas.
- Preguntas de verdadero/falso: clasificación binaria con probabilidad asociada.
- Procesamiento de contexto largo: hasta 32.768 tokens por llamada, adecuado para estados extensos.
- Integración vía API HTTP: endpoints `/v1/systemone`, `/v1/models` y `/healthz` para despliegue como servicio.
- Ejecución en bfloat16 sobre GPU CUDA Ampere o superior.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo thinking.
- Capacidades multilingües: no disponibles (no se especifican idiomas).

## Casos de uso

- Sistemas de decisión automatizada: el modelo recibe un estado del entorno y un conjunto de acciones posibles, y devuelve la probabilidad de cada una, lo que permite seleccionar la acción de mayor probabilidad en bucles de control o políticas de decisión.
- Ranking y reordenación de candidatos: dada una consulta y una lista de opciones (por ejemplo, respuestas candidatas o documentos), el modelo asigna puntuaciones probabilísticas que permiten reordenar resultados.
- Clasificación binaria en pipelines de moderación: con preguntas de verdadero/falso, se puede usar para filtrar contenido o validar condiciones sobre un estado textual de hasta 32.768 tokens.
- Evaluación de hipótesis en investigación: útil para experimentos que requieren una distribución de probabilidad sobre opciones discretas en lugar de texto generado, facilitando métricas de calibración.
- Componente "System One" en arquitecturas de agentes: el endpoint `/v1/systemone` sugiere su uso como módulo de respuesta rápida dentro de un sistema mayor que combine decisión inmediata con razonamiento deliberativo posterior.
- Servicio interno de scoring: despliegue con `serve.py` en una GPU Ampere para exponer un servicio de puntuación probabilística a otros microservicios mediante HTTP.
- Validación de estados en entornos simulados: dado un estado de un entorno (por ejemplo, un juego o simulación) y preguntas tipadas, obtener probabilidades que informen la política de un agente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 4,4 GB solo para pesos (2,21B parámetros × 2 bytes), más overhead de activaciones y contexto; se recomienda al menos 8-12 GB de VRAM para contextos largos.
- GPU recomendadas: el autor exige una GPU CUDA Ampere o superior; encajan A100, H100, L40S, RTX 3090, RTX 4090 y GPUs de generación posterior.
- Cabe en GPU de consumo: sí, en RTX 3090, RTX 4090 y modelos con 12 GB o más de VRAM en bfloat16; en GPUs con menos VRAM sería necesario cuantizar, aunque no se documentan formatos de cuantización.
- Opciones de despliegue: el repositorio incluye `serve.py` con endpoints HTTP; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Telasap-1.0-Small | 2,21B | 32.768 | Clasificación/decisión probabilística | Apache-2.0 | Hugging Face |
| Qwen/Qwen3.5-2B (base) | ~2B | No disponible en la información | Generación de texto | No disponible en la información | Hugging Face |
| Alternativas de clasificación de ~2B | No disponible | No disponible | Clasificación de texto | No disponible | No disponible |

No se dispone de información sobre benchmarks ni sobre modelos comparables de la misma categoría (evaluadores probabilísticos de opciones basados en LLM), por lo que la comparativa cuantitativa no está disponible.

## Limitaciones y advertencias

- Información pública muy escasa: no se documentan datos de entrenamiento, composición del dataset, idiomas ni benchmarks, lo que dificulta evaluar su calidad y generalización.
- Riesgo de alucinación y calibración: al ser un modelo de probabilidades, la calibración de las mismas no está verificada; no se han publicado métricas de calibración (ECE, Brier score, etc.).
- Sesgos: no se documentan sesgos conocidos, pero al derivar de Qwen3.5-2B puede heredar los sesgos del modelo base y de los datos de ajuste fino.
- Limitaciones de idioma: no se especifican los idiomas soportados; no se garantiza un rendimiento multilingüe.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero se debe conservar el aviso de licencia y el archivo NOTICE; conviene verificar las obligaciones derivadas del modelo base Qwen3.5-2B.
- Requisito de hardware: necesita GPU CUDA Ampere o superior; no se documenta soporte para CPU ni para GPUs más antiguas.
- Madurez: el modelo tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en noviembre de 2026; no hay evidencia de uso en producción ni de validación externa.
- Sin soporte documentado de cuantización: no se indican formatos GGUF, GPTQ ni AWQ, lo que limita el despliegue en hardware con VRAM reducida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thienlng/Telasap-1.0-Small
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
