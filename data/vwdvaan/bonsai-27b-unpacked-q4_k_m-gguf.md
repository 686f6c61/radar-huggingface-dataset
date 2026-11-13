# vwdvaan/Bonsai-27B-unpacked-Q4_K_M-GGUF

## Resumen

Bonsai-27B-unpacked-Q4_K_M-GGUF es una cuantización en formato GGUF del modelo Bonsai-27B-unpacked, desarrollado originalmente por prism-ml y convertida por el usuario vwdvaan mediante el espacio GGUF-my-repo de ggml.ai y la herramienta llama.cpp. El modelo base pertenece a la familia Bonsai, una línea de modelos etiquetada como "1-bit" en los metadatos del repositorio, lo que sugiere un enfoque de entrenamiento o representación orientado a pesos de muy baja precisión, si bien la versión aquí publicada emplea cuantización Q4_K_M (aproximadamente 4 bits por peso con mezcla de bloques K-quant).

El modelo cuenta con 26.895.998.464 parámetros (unos 26,9 mil millones), lo que lo sitúa en la categoría de modelos de tamaño medio-grande, adecuados para despliegue en una o varias GPU de gama alta o, con cuantizaciones agresivas, en hardware consumer. El repositorio ocupa 16,5 GB, coherente con una cuantización Q4_K_M de un modelo de ~27B. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales más allá de las obligaciones de atribución de dicha licencia.

La relevancia de esta ficha radica en que permite ejecutar un modelo de ~27B en entornos con recursos limitados mediante llama.cpp, con compatibilidad con endpoints y despliegue local. No obstante, la información pública disponible es muy escasa: no se detallan arquitectura interna, datos de entrenamiento, idiomas soportados ni resultados de benchmarks, por lo que muchos apartados de esta ficha deben marcarse como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base etiquetado como "1-bit"; transformer presumible, sin confirmar) |
| Parametros totales | 26.895.998.464 (~26,9 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el ejemplo del autor usa `-c 2048`, pero no confirma el máximo) |
| Tipos de cuantizacion | Q4_K_M (esta versión); otras cuantizaciones del modelo base no disponibles |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base prism-ml/Bonsai-27B-unpacked. Los metadatos lo etiquetan como "1-bit" y "prismml", lo que apunta a un modelo entrenado o destilado con técnicas de cuantización extrema (posiblemente entrenamiento con pesos de 1 bit y posterior "unpacking" a precisión superior, de ahí el sufijo "unpacked"). El número de parámetros (26,9 B) y el pipeline "conversational" indican un modelo de lenguaje generativo orientado a diálogo.

No se han publicado en la información disponible datos sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO, ni innovaciones técnicas como decodificación especulativa o atención lineal. La conversión a GGUF se realizó con llama.cpp, lo que garantiza compatibilidad con el ecosistema ggml, pero no aporta información sobre el entrenamiento original.

## Capacidades

- Generación de texto conversacional: el pipeline declarado es "conversational", orientado a diálogo multi-turno.
- Razonamiento y generación de texto general: capacidades esperables en un modelo de ~27B, aunque no confirmadas explícitamente en la información disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (los idiomas no están declarados).
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Ejecución local mediante llama.cpp: confirmada, con CLI y servidor HTTP (`llama-server`).

## Casos de uso

- Despliegue local de un modelo de ~27B en estaciones de trabajo: gracias a la cuantización Q4_K_M (16,5 GB), el modelo puede ejecutarse con llama.cpp en equipos con suficiente memoria unificada o VRAM, sin depender de servicios en la nube.
- Prototipado de asistentes conversacionales: el pipeline "conversational" y la compatibilidad con `llama-server` permiten levantar un endpoint HTTP compatible con la API de OpenAI para integrar el modelo en aplicaciones de chat.
- Experimentación con modelos de baja precisión: al provenir de un modelo etiquetado como "1-bit" y "unpacked", resulta útil para investigar el impacto de la cuantización extrema en la calidad generativa y comparar con la versión Q4_K_M.
- Evaluación de calidad de cuantizaciones: permite comparar el rendimiento del modelo base frente a su versión Q4_K_M en tareas de generación y diálogo, dentro de pipelines de evaluación propios.
- Integración en entornos sin conectividad: al ser un archivo GGUF autónomo, puede desplegarse en sistemas aislados (air-gapped) donde no se permite el acceso a APIs externas.
- Fines educativos y de investigación: útil para estudiar el comportamiento de modelos de ~27B cuantizados en tareas de razonamiento y conversación, siempre que se validen los resultados con benchmarks propios dada la ausencia de métricas publicadas.
- Servicio de inferencia ligero: con `llama-server -c 2048` puede montarse un servicio de generación de texto para cargas moderadas en hardware de gama alta consumer.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q4_K_M ocupa 16,5 GB, por lo que se necesitan al menos ~17-18 GB de memoria (VRAM o memoria unificada) para cargar el modelo, más overhead para el contexto KV.
- GPU recomendadas: no hay recomendaciones oficiales; por tamaño, encaja en GPU con 24 GB o más (RTX 3090, RTX 4090, A10G, L4 con 24 GB, A100 40/80 GB, H100).
- ¿Cabe en GPU consumer? Sí, en RTX 3090/4090 (24 GB) con contexto moderado; en GPU de 16 GB no cabe la cuantización Q4_K_M completa sin offloading a CPU/RAM.
- Opciones de despliegue: llama.cpp (CLI y servidor), y por extensión cualquier frontend compatible con GGUF (p. ej. Ollama, LM Studio, text-generation-webui), aunque no se confirman explícitamente en la información disponible. vLLM y TGI no soportan GGUF de forma nativa en todos los casos.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente sobre el modelo base ni de benchmarks para establecer una comparativa rigurosa con alternativas de la misma categoría. Se indica "no disponible".

| Modelo | Parametros | Contexto | Licencia | Formato | Benchmarks |
|---|---|---|---|---|---|
| Bonsai-27B-unpacked Q4_K_M (este) | ~26,9 B | no disponible | Apache 2.0 | GGUF | no disponible |
| Alternativa comparable | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia de documentación: no se detallan arquitectura, datos de entrenamiento, idiomas ni benchmarks, lo que dificulta evaluar su idoneidad para producción.
- Riesgo de alucinación: inherente a los modelos generativos; sin benchmarks publicados no puede cuantificarse su fiabilidad.
- Sesgos conocidos: no disponibles; al no documentarse la composición del dataset, no pueden identificarse sesgos específicos.
- Limitaciones de contexto e idioma: se desconoce la longitud máxima de contexto y los idiomas soportados; el ejemplo del autor usa `-c 2048`, que no debe interpretarse como el máximo.
- Restricciones de licencia: Apache 2.0 permite uso comercial con atribución; no obstante, deben revisarse las condiciones del modelo base prism-ml/Bonsai-27B-unpacked por si añaden cláusulas adicionales.
- Cuantización Q4_K_M: introduce pérdida de precisión respecto al modelo original; la calidad puede degradarse en tareas sensibles (matemáticas, código, razonamiento largo).
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la validación comunitaria y el soporte disponible.
- Etiqueta "1-bit" en el modelo base: conviene verificar el significado exacto de "unpacked" y el impacto en la calidad antes de usarlo en producción.

## Enlaces

- Repositorio Hugging Face (esta cuantización): https://huggingface.co/vwdvaan/Bonsai-27B-unpacked-Q4_K_M-GGUF
- Modelo base: https://huggingface.co/prism-ml/Bonsai-27B-unpacked
- Espacio GGUF-my-repo: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp
- Instrucciones de uso de llama.cpp: https://github.com/ggerganov/llama.cpp?tab=readme-ov-file#usage
