# thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-GRPO-STAR-lr1e-6-kl0.001-p16-k8-step30

## Resumen

Safety_Tuning-Qwen3.5-4B-GRPO-STAR es un ajuste fino por aprendizaje por refuerzo (GRPO) del modelo multimodal Qwen/Qwen3.5-4B, desarrollado por el usuario thkim0305-SNU. El objetivo declarado es el alineamiento de seguridad (safety tuning): se entrena al modelo para responder de forma segura ante peticiones potencialmente dañinas, usando como datos de prompt el conjunto STAR y como señal de recompensa las puntuaciones de un modelo profesor (Qwen3.8-27B) junto con una referencia congelada del modelo original.

El checkpoint publicado corresponde a la iteración nativa 29 (índice basado en cero), es decir, 30 actualizaciones de optimizador completadas, con una tasa de aprendizaje de 1e-6, coeficiente KL de 0,001, 16 prompts por actualización y 8 respuestas por prompt. Se distribuye en formato safetensors, con los tensores de texto entrenados exportados desde el checkpoint nativo y los tensores de visión y MTP conservados del modelo base fijado.

Es relevante porque documenta una línea de entrenamiento reproducible de safety tuning sobre un modelo multimodal pequeño (4,66 mil millones de parámetros) con licencia Apache 2.0, lo que permite inspeccionar y reutilizar la receta GRPO aplicada a un modelo de visión-lenguaje. No obstante, la model card no declara ninguna puntuación de evaluación, por lo que su eficacia real en métricas de seguridad no está verificada en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) basada en Qwen3.5; incluye torre de visión y módulo MTP (multi-token prediction) no entrenado |
| Parametros totales | 4.659.865.088 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors; no se publican GGUF ni cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B (revisión base `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a`), un transformer multimodal con capacidad de entrada imagen-texto y salida de texto. Sobre esa base se aplica un ajuste fino con GRPO (Group Relative Policy Optimization): para cada prompt se generan 8 respuestas (k=8) y se agrupan 16 prompts por actualización (p16), con un coeficiente KL de 0,001 frente a una referencia congelada del modelo original para limitar la deriva respecto a la distribución base. La tasa de aprendizaje es 1e-6 y se completaron 30 actualizaciones de optimizador.

Los prompts de entrenamiento provienen del conjunto STAR (UCSC-VLAA/STAR-1), con el conjunto benigno UCSC-VLAA/STAR-benign-915 también referenciado. La recompensa la proporciona un modelo profesor Qwen3.8-27B que puntúa las respuestas; la model card indica que el prompt del "judge-footer" cambió después de la actualización 44 y que la ejecución reanudada desde el paso 90 acepta un JSON de puntuación plano tras la prosa del profesor, por lo que los checkpoints pertenecen a esa línea de entrenamiento registrada. El módulo MTP (multi-token prediction) no se entrenó y se conserva del modelo base. La conversión a safetensors se verificó con conversión inversa exacta de cada tensor de texto nativo, comprobación de pesos finitos y coincidencia de las 738 claves y formas de tensores de Hugging Face.

## Capacidades

- Generación de texto conversacional multi-turno (pipeline `conversational`).
- Comprensión de imágenes y texto combinados (image-text-to-text): el modelo acepta entradas visuales junto con instrucciones textuales.
- Razonamiento y respuesta ante peticiones potencialmente sensibles, con ajuste específico de seguridad (safety tuning) mediante GRPO.
- Capacidad de seguir instrucciones y producir respuestas en formato estructurado (la receta de entrenamiento usa puntuaciones JSON del profesor).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Moderación y filtrado de contenido en aplicaciones de chat: el ajuste de seguridad busca que el modelo rechace o reconduzca peticiones dañinas; puede usarse como capa de respuesta segura en asistentes conversacionales, aunque sin métricas publicadas conviene validarlo con un conjunto de evaluación propio antes de producción.
- Asistentes multimodales con requisitos de seguridad: al aceptar imagen y texto, puede emplearse en interfaces donde el usuario sube capturas o fotos y formula preguntas; el ajuste de seguridad añade una capa de comportamiento defensivo ante entradas visuales sensibles.
- Investigación en alineamiento y RLHF/GRPO: sirve como checkpoint de referencia para estudiar el efecto de 30 actualizaciones GRPO con KL 0,001 sobre un modelo de 4,66B, comparando con el modelo base y con checkpoints intermedios de la misma línea.
- Evaluación de recetas de recompensa con modelo profesor: útil para reproducir y analizar el uso de un profesor de 27B como juez y el efecto de cambios en el prompt del juez (documentados tras la actualización 44).
- Prototipado de pipelines de seguridad en visión-lenguaje: permite montar un servicio de inferencia con transformers y medir tasas de rechazo, falsos positivos y utilidad en dominios concretos antes de escalar a modelos mayores.
- Base para ajustes posteriores (DPO, SFT o nuevas rondas de GRPO): al estar en Apache 2.0 y safetensors, puede reutilizarse como punto de partida para entrenamientos adicionales con licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se afirman puntuaciones de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 9,3 GB solo para pesos (4,66B parámetros × 2 bytes), más overhead de activaciones, caché KV y procesador de visión; en la práctica se recomienda al menos 16-24 GB de VRAM para contexto moderado.
- VRAM estimada en cuantización de 8 bits: en torno a 5 GB para pesos; en 4 bits, en torno a 2,5-3 GB para pesos, más overhead.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX A6000 para despliegue sin cuantizar con lotes y contexto amplios; RTX 4090 (24 GB) es suficiente para fp16 con contexto moderado.
- GPU de consumo: cabe en RTX 4090, RTX 3090 (24 GB) y, con cuantización 4/8 bits, en GPUs de 12-16 GB como RTX 4070 Ti o RTX 4080; no se garantiza en GPUs de 8 GB sin cuantización agresiva.
- Opciones de despliegue: transformers (librería declarada), servidores compatibles con endpoints (tag `endpoints_compatible`), y en general vLLM, TGI o llama.cpp/Ollama si se generan cuantizaciones GGUF (no publicadas en el repo).
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Safety_Tuning-Qwen3.5-4B-GRPO-STAR (este) | 4,66B | no disponible | imagen-texto | Apache 2.0 | Hugging Face, safetensors |
| Qwen/Qwen3.5-4B (base) | ~4B | no disponible | imagen-texto | no disponible en la información | Hugging Face |
| Modelos de seguridad de 4B comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre este checkpoint y el modelo base ni con alternativas de la misma categoría; la model card no publica evaluaciones.

## Limitaciones y advertencias

- No se han publicado métricas de seguridad ni de utilidad; no hay evidencia cuantitativa de que el ajuste reduzca respuestas dañinas sin degradar capacidades generales.
- Riesgo de alucinación inherente a los modelos de lenguaje de 4B, no cuantificado en la información disponible.
- Sesgos conocidos: no disponibles; no se documenta ninguna evaluación de sesgo.
- Idiomas soportados: no disponibles; no se especifica cobertura multilingüe.
- Longitud de contexto: no disponible; conviene verificar en la configuración del modelo base antes de usarlo con documentos o conversaciones largas.
- El módulo MTP no fue entrenado y se conserva del modelo base; no debe asumirse que sus capacidades reflejen el ajuste de seguridad.
- La receta de entrenamiento cambió a mitad de línea (prompt del juez tras la actualización 44); los checkpoints de distintas fases no son estrictamente comparables entre sí.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni evaluaciones; para producción se recomienda una validación propia con conjuntos de seguridad y de calidad.
- El repositorio excluye optimizer, estado RNG, logs y ejemplos de entrenamiento, lo que limita la reproducibilidad exacta del run.
- Solo 21 descargas y 0 likes en el momento de la consulta: modelo de nicho, sin validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-GRPO-STAR-lr1e-6-kl0.001-p16-k8-step30
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset STAR-1: https://huggingface.co/datasets/UCSC-VLAA/STAR-1
- Dataset STAR-benign-915: https://huggingface.co/datasets/UCSC-VLAA/STAR-benign-915
