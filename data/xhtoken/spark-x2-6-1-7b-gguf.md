# XHToken/Spark-X2.6-1.7B-GGUF

## Resumen

Spark-X2.6-1.7B es un modelo de lenguaje compacto de tipo transformer decoder-only desarrollado por XHToken, segundo miembro de la serie Spark-X2.6 tras el Spark-X2.6-4B. Está diseñado específicamente para despliegue en dispositivo (on-device) y constituye una actualización del Spark-X2.5-1.7B, del que conserva exactamente la misma arquitectura: las mejoras de capacidad provienen íntegramente de un post-entrenamiento refinado. Con 1.976.092.672 parámetros, se posiciona en la franja de los modelos de ~2B orientados a inferencia local eficiente.

El modelo pone el foco en tres ejes: capacidades reforzadas de código, uso de herramientas y razonamiento agéntico multi-paso; soporte de contexto largo (la configuración de servicio de referencia de SGLang apunta a 1.048.576 tokens); y un presupuesto de razonamiento configurable en tres niveles (ninguno, bajo, alto) que permite ajustar latencia, coste y calidad de forma dinámica. Según el autor, ofrece el mejor throughput de decodificación entre modelos de tamaño comparable en sus evaluaciones, con una implementación optimizada de llama.cpp.

La relevancia actual del modelo radica en su combinación de licencia Apache 2.0, pesos en GGUF para inferencia local y soporte bilingüe inglés-chino, lo que lo hace apto para integración comercial sin restricciones adicionales y para escenarios de borde donde no es viable depender de una API en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (misma arquitectura que Spark-X2.5-1.7B; detalles internos no disponibles) |
| Parametros totales | 1.976.092.672 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | hasta 1.048.576 tokens en la configuración de servicio de referencia (SGLang); contexto nativo de entrenamiento no disponible |
| Tipos de cuantizacion | GGUF (el repositorio distribuye pesos cuantizados; niveles concretos no disponibles) |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo -GGUF); el modelo base se distribuye para transformers |
| Tamano del repositorio | 12,3 GB |
| Libreria | transformers (version requerida: 4.57.1) |
| Pipeline | text-generation |
| Compatibilidad | endpoints_compatible, conversational |

## Arquitectura y entrenamiento

El modelo mantiene la arquitectura del Spark-X2.5-1.7B sin cambios, según declara el autor. No se especifica en la información disponible el tipo exacto de atención, la composición de capas ni si incorpora mecanismos híbridos (SSM, atención lineal u otros). Las ganancias de capacidad respecto a la versión anterior se atribuyen exclusivamente a un post-entrenamiento mejorado, que según la model card incide en código, comportamiento agéntico, contexto largo, multilingüismo y razonamiento. No se detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon RLHF, DPO u otras técnicas de alineación.

La innovación técnica más destacable es el presupuesto de razonamiento controlable en tres niveles (none, low, high). El autor cuantifica el compromiso: al pasar de high a low, la puntuación media cae 4,0 puntos mientras la longitud media de salida se reduce un 37,3 % (frente a 1,7 puntos y 22,0 % en el Spark-X2.6-4B). Además, el autor mantiene una implementación optimizada de llama.cpp que, según sus mediciones en RTX 4090, amplía la ventaja de throughput en todas las longitudes de contexto evaluadas.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat propia (`apply_chat_template`) y soporte del flag `enable_thinking`.
- Razonamiento con presupuesto configurable: tres niveles (none, low, high) que permiten equilibrar calidad, latencia y coste.
- Generación de código y tareas de ingeniería de software, con mejoras sustanciales declaradas respecto a Spark-X2.5-1.7B.
- Uso de herramientas (tool calling / function calling) y razonamiento agéntico multi-paso, incluyendo planificación compleja.
- Razonamiento sobre contextos extensos (long-context), con configuración de servicio de hasta 1.048.576 tokens.
- Capacidades matemáticas y de conocimiento general evaluadas en los benchmarks del autor.
- Multilingüe limitado a inglés y chino.
- Inferencia eficiente en dispositivo, con decodificación de alto throughput según las evaluaciones del autor.
- Compatibilidad con endpoints conversacionales y despliegue en SGLang (NVIDIA y Ascend NPU).

## Casos de uso

- Asistente de código en local: el modelo puede generar y completar código en un IDE o pipeline de CI/CD sin salir del equipo del desarrollador, aprovechando sus mejoras específicas en ingeniería de software y su licencia Apache 2.0 para integración comercial.
- Agente autónomo de múltiples pasos: con tool calling y planificación multi-paso, encaja en orquestadores que encadenan llamadas a APIs, consultas a bases de datos y acciones sobre ficheros, ajustando el nivel de razonamiento según la complejidad de cada paso.
- Atención al cliente bilingüe (inglés/chino): gestión de conversaciones multi-turno con contexto largo, adecuado para soporte técnico donde el historial de incidencia es extenso y se requiere mantener coherencia a lo largo de muchos turnos.
- Análisis de documentos extensos en el borde: resumen, extracción y preguntas sobre contratos, informes o expedientes que superan la ventana típica de modelos pequeños, gracias a la configuración de contexto de hasta 1.048.576 tokens.
- Procesamiento en dispositivo sin conectividad: asistentes embebidos en portátiles, estaciones de trabajo o equipos industriales donde no hay acceso a la nube, con cuantización GGUF para reducir requisitos de memoria.
- Enrutamiento y clasificación de consultas con razonamiento ligero: usando el nivel de pensamiento "none" o "low" para tareas de alta frecuencia y baja latencia, reservando el nivel "high" para casos ambiguos.
- Generación aumentada por recuperación (RAG) local: combinación con un índice vectorial en el propio dispositivo para responder sobre documentación interna, manteniendo los datos fuera de servicios externos.

## Benchmarks y rendimiento

El autor declara resultados state-of-the-art entre modelos open source de tamaño comparable en tareas de agente, código, matemáticas, conocimiento general y contexto largo, y publica gráficas comparativas (`images/all_benchmark.svg`) frente a modelos on-device similares. Sin embargo, en la información proporcionada no se incluyen los valores numéricos de dichos benchmarks.

No se han publicado resultados de benchmarks con cifras en la informacion disponible.

Datos cuantitativos sí disponibles en la información:

| Metrica | Valor |
|---|---|
| Caida media de puntuacion al pasar de high a low (Spark-X2.6-1.7B) | 4,0 puntos |
| Reduccion de longitud media de salida al pasar de high a low (Spark-X2.6-1.7B) | 37,3 % |
| Caida media de puntuacion al pasar de high a low (Spark-X2.6-4B) | 1,7 puntos |
| Reduccion de longitud media de salida al pasar de high a low (Spark-X2.6-4B) | 22,0 % |
| Modelos comparados en eficiencia de decodificacion | Qwen3.5-2B, MiniCPM-2B, LFM2.5-2.6B |
| Hardware de las pruebas de throughput | RTX 4090 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Como referencia orientativa por tamaño (1,98B parámetros): ~4 GB en FP16, ~2-2,5 GB en cuantización de 8 bits y ~1,2-1,5 GB en cuantizaciones de 4 bits; estas cifras son estimaciones por parámetros, no datos publicados por el autor.
- El repositorio GGUF ocupa 12,3 GB, lo que sugiere que incluye múltiples niveles de cuantización en un mismo repo.
- GPU recomendadas: RTX 4090 para las pruebas de throughput publicadas; el autor también documenta despliegue en aceleradores Ascend NPU (A2 y A3) mediante imágenes SGLang.
- Cabe holgadamente en GPU de consumo: cualquier GPU con 4-8 GB de VRAM debería poder ejecutar las cuantizaciones de 4 y 8 bits; no se dispone de lista oficial de GPUs validadas.
- Opciones de despliegue: transformers 4.57.1 (con `trust_remote_code=True`), SGLang (imagen `lmsysorg/sglang:nightly-dev-cu13-20260827-20621aa1` para NVIDIA; imágenes `quay.io/ascend/sglang` para Ascend), y llama.cpp mediante la implementación optimizada del autor (`github.com/XHToken/llama.cpp`). Compatible con endpoints conversacionales.
- Latencia y throughput: el autor afirma liderar el throughput de decodificación en contextos cortos frente a Qwen3.5-2B, MiniCPM-2B y LFM2.5-2.6B, con ventaja ampliada en todas las longitudes probadas sobre RTX 4090. No se publican cifras de tokens por segundo en la información disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Spark-X2.6-1.7B | 1,98B | hasta 1.048.576 (config. SGLang) | Apache 2.0 | HF (GGUF y base), SGLang, llama.cpp | Presupuesto de razonamiento en 3 niveles; bilingüe en/zh |
| Qwen3.5-2B | no disponible | no disponible | no disponible | no disponible | Citado por el autor como referencia de eficiencia on-device |
| MiniCPM-2B | no disponible | no disponible | no disponible | no disponible | Citado por el autor como referencia de eficiencia on-device |
| LFM2.5-2.6B | no disponible | no disponible | no disponible | no disponible | Citado por el autor como referencia de eficiencia on-device |

Los datos de los modelos comparables no figuran en la información proporcionada; solo se mencionan como términos de comparación en las evaluaciones de throughput del autor. No se dispone de una comparativa de rendimiento en benchmarks con cifras.

## Limitaciones y advertencias

- Idiomas limitados a inglés y chino; el rendimiento en castellano u otras lenguas no está evaluado ni declarado.
- Riesgo de alucinación inherente a modelos de 2B parámetros; no se han publicado tasas de factualidad ni evaluaciones de calibración.
- Sesgos conocidos: no se documenta ningún análisis de sesgo, toxicidad o seguridad en la información disponible.
- El contexto de 1.048.576 tokens corresponde a una configuración de servicio en SGLang que, según la propia model card, requiere recursos suficientes; no equivale necesariamente al contexto nativo de entrenamiento ni garantiza calidad uniforme en toda la ventana.
- El modelo requiere `trust_remote_code=True` en transformers, lo que implica ejecutar código del repositorio; conviene auditar el código remoto antes de usarlo en producción.
- Dependencia de una versión concreta de transformers (4.57.1) para el flujo de referencia.
- Licencia Apache 2.0: permite uso comercial sin restricciones adicionales, pero no se ofrece garantía ni indemnización por parte del autor.
- Las afirmaciones de rendimiento (state-of-the-art, liderazgo en throughput) proceden del propio autor y no se acompañan de cifras verificables en la información disponible.
- No hay datos publicados sobre estabilidad en generaciones muy largas, comportamiento con tool calling en producción ni tasas de error en agentes multi-paso.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/XHToken/Spark-X2.6-1.7B-GGUF
- Modelo base en Hugging Face: https://huggingface.co/XHToken/Spark-X2.6-1.7B
- Implementación optimizada de llama.cpp: https://github.com/XHToken/llama.cpp
- Slack: https://join.slack.com/t/tokenspark/shared_invite/zt-432qf8l2f-5~dLyXv8uETr0P0UuC07nw
- Discord: https://discord.gg/kTDE2Hg8aw
- YouTube: https://www.youtube.com/@SparkLLM
- dev.to: https://dev.to/sparkllm
- Bluesky: https://bsky.app/profile/sparkllm.bsky.social
- X: https://x.com/sparkllm
- Zhihu: https://www.zhihu.com/people/zhiikz7qh7m
- Paper, blog técnico y demo: no disponibles en la información proporcionada.
