# tinyopsec/DeepSeek-R1-Distill-Qwen-1.5B-GGUF

## Resumen

DeepSeek-R1-Distill-Qwen-1.5B-GGUF es una cuantización en formato GGUF del modelo deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B, publicada por el usuario tinyopsec. El modelo base es un destilado de DeepSeek-R1 sobre la arquitectura Qwen2 de 1.500 millones de parámetros (1.777.088.000 parámetros reales según los safetensors del modelo original), orientado a generación de texto y razonamiento. Esta versión GGUF está pensada para su ejecución local con llama.cpp y herramientas compatibles, sin necesidad de GPU de gama alta.

El interés de esta publicación es puramente práctico: ofrece el modelo destilado en 13 niveles de cuantización (desde F16 hasta Q2_K), lo que permite ajustar el equilibrio entre calidad y consumo de memoria en hardware modesto. El repositorio ocupa 16,7 GB en total porque incluye todas las variantes, aunque el usuario solo descarga el archivo que necesita.

Se trata de una cuantización de terceros, no oficial de DeepSeek, con licencia MIT heredada del modelo base. No incluye información sobre idiomas soportados ni datos de entrenamiento propios más allá de la destilación original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen2), modelo base DeepSeek-R1-Distill-Qwen-1.5B |
| Parametros totales | 1.777.088.000 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q5_0, Q4_K_M, Q4_K_S, Q4_0, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (generado con llama.cpp) |

## Arquitectura y entrenamiento

El modelo base es un destilado de DeepSeek-R1 sobre Qwen2 de 1.500 millones de parámetros. La destilación transfiere capacidades de razonamiento del modelo R1 completo a una arquitectura densa de menor tamaño, manteniendo el tokenizador y la estructura transformer de Qwen2. Esta versión GGUF no reentrena ni modifica los pesos: únicamente los convierte al formato GGUF mediante llama.cpp para su uso en inferencia local.

No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset de destilación, ni si hubo etapas de RLHF o DPO en el modelo base. Tampoco se documentan innovaciones técnicas adicionales más allá de la propia destilación y la cuantización estándar de llama.cpp (bloques K-quant y Q-quant).

## Capacidades

- Generación de texto conversacional y de un solo turno.
- Razonamiento de tipo cadena de pensamiento heredado de la destilación de DeepSeek-R1.
- Resolución de problemas matemáticos y de lógica de complejidad moderada.
- Generación y explicación de código en lenguajes habituales.
- Soporte de conversaciones multi-turno mediante plantillas de chat (tag `conversational`).
- Compatibilidad con endpoints (tag `endpoints_compatible`), lo que facilita su integración en servicios de inferencia.
- Capacidades multilingües: no documentadas en esta ficha; dependen del modelo base.
- Tool calling y function calling: no documentado en la información disponible.

## Casos de uso

- Asistente de razonamiento local en portátiles: con la cuantización Q4_K_M (en torno a 1 GB) el modelo puede ejecutarse en CPU o en GPU integrada, ofreciendo respuestas razonadas sin conexión a Internet.
- Prototipado rápido de pipelines de generación de texto: la disponibilidad de 13 cuantizaciones permite probar distintos compromisos calidad/memoria en la misma máquina antes de fijar una configuración.
- Educación y experimentación con modelos destilados: útil para estudiar el comportamiento de un destilado de R1 en hardware de consumo y comparar cuantizaciones sobre las mismas preguntas.
- Generación de código en entornos con recursos limitados: integrable en editores o scripts CLI vía llama.cpp para autocompletado y explicación de fragmentos, aunque con menor calidad que modelos mayores.
- Automatización de tareas de razonamiento por lotes: al ser un modelo pequeño, permite procesar muchos prompts en CPU en paralelo sin coste de API.
- Despliegue en dispositivos edge o entornos air-gapped: el formato GGUF y la licencia MIT facilitan su empaquetado en aplicaciones de escritorio o sistemas sin acceso a la nube.
- Base para fine-tuning ligero o experimentos de destilación adicional: al ser un modelo de 1.5B con licencia permisiva, sirve como punto de partida para adaptaciones con LoRA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada según cuantización (aproximada, para 1.777 millones de parámetros):
  - F16: ~3,6 GB
  - Q8_0: ~1,9 GB
  - Q6_K: ~1,5 GB
  - Q5_K_M: ~1,3 GB
  - Q4_K_M: ~1,1 GB
  - Q3_K_M: ~0,9 GB
  - Q2_K: ~0,7 GB
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para Q4_K_M; RTX 3060, RTX 4060, RTX 4090 o superiores permiten ejecutar F16 con holgura. También funciona en CPU.
- Cabe en GPU de consumo: sí, en prácticamente todas las GPU dedicadas modernas e incluso en iGPU con memoria compartida para cuantizaciones bajas.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama, LM Studio, y cualquier runtime compatible con GGUF. vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que se recomienda llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada; dependen del hardware y la cuantización.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| DeepSeek-R1-Distill-Qwen-1.5B-GGUF (esta ficha) | 1.777 M | no disponible | MIT | GGUF | Cuantización de terceros, 13 variantes |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B | 1.777 M | no disponible | MIT | safetensors | Modelo base oficial, requiere conversión para llama.cpp |
| Qwen2.5-1.5B-Instruct | ~1.500 M | no disponible | Apache 2.0 | safetensors, GGUF | Alternativa generalista de tamaño similar, sin destilación de razonamiento |
| Llama-3.2-1B-Instruct | ~1.200 M | no disponible | Llama 3.2 Community License | safetensors, GGUF | Menor tamaño, licencia más restrictiva |

## Limitaciones y advertencias

- Es una cuantización no oficial: la calidad puede degradarse respecto al modelo base, especialmente en Q3 y Q2.
- Modelo de 1.5B parámetros: capacidad de razonamiento y conocimiento factual limitados en comparación con modelos de mayor tamaño; riesgo elevado de alucinación en temas especializados.
- No se documentan los idiomas soportados; el rendimiento en castellano puede ser inferior al de modelos entrenados explícitamente para ello.
- No hay información sobre sesgos del modelo base en esta ficha; deben evaluarse antes de uso en producción.
- Licencia MIT: permite uso comercial, pero conviene verificar las condiciones del modelo base original y de los datos de destilación.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación comunitaria.
- No se documenta soporte de tool calling ni de agentes multi-paso; no asumir estas capacidades sin pruebas.
- La fecha de creación indicada (2026-11-01) es futura respecto a la redacción habitual de fichas; verificar la vigencia del repositorio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/tinyopsec/DeepSeek-R1-Distill-Qwen-1.5B-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- llama.cpp (herramienta de cuantización): https://github.com/ggerganov/llama.cpp
- Repositorio DeepSeek-R1: https://github.com/deepseek-ai/DeepSeek-R1
