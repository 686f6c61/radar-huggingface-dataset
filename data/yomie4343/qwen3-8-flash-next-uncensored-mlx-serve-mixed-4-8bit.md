# yomie4343/Qwen3.8-Flash-Next-Uncensored-MLX-Serve-mixed-4-8bit

## Resumen

El modelo `yomie4343/Qwen3.8-Flash-Next-Uncensored-MLX-Serve-mixed-4-8bit` es un espejo verificado de los pesos de una versión "uncensored" del modelo `Qwen3.8-Flash-Next`, cuantizada en formato mixto 4/8-bit y adaptada al runtime MLX-Serve para Apple Silicon. Ha sido desarrollado por `yomie4343`, quien ha validado la integridad de los pesos frente al pack existente de `ARC4NUM` y ha aplicado un parche local al motor de inferencia para solucionar un fallo de cuantización relacionado con el mecanismo de multi-token prediction (MTP).

Con 133.195.562.899 parámetros totales, el modelo combina una arquitectura Mixture of Experts (MoE) con soporte multimodal (texto e imagen) y una tabla N-gram. El contexto anunciado es de 204.800 tokens, aunque el autor advierte que no es garantía de contexto utilizable en todo el hardware. El modelo destaca por permitir la ejecución local de un modelo de gran tamaño con soporte de herramientas y visión en una Mac Studio M3 Ultra con 96 GB de memoria, a costa de una licencia restrictiva y de los riesgos asociados a una versión sin alineación de seguridad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Mixture of Experts (MoE) con soporte multimodal (visión + texto) y multi-token prediction (MTP) |
| Parametros totales | 133.195.562.899 (≈133 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | 204.800 tokens (anunciado; no garantizado en hardware de 96 GB) |
| Tipos de cuantizacion | Mixta 4/8-bit: expertos MoE enrutados y token embeddings en 4-bit (affine, group 64); proyecciones elegibles en 8-bit (affine, group 64); tabla N-gram en 4-bit (group 32) |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 |
| Formato de pesos | Safetensors (pack específico para MLX-Serve, incluye `ngram_table.bin` separado) |

## Arquitectura y entrenamiento

El modelo base es `Qwen/Qwen3.8-Flash-Next`, que según el repositorio oficial de Qwen introduce mejoras sistemáticas en cuatro aspectos: atención, residuales, embeddings y optimización. El modelo resultante es una arquitectura MoE multimodal con cabezas de MTP y una tabla N-gram utilizada para acelerar la decodificación. El repo de `yomie4343` no modifica los pesos, sino que añade un parche al runtime MLX-Serve y presenta las mediciones correspondientes.

No se dispone de información sobre los datos de entrenamiento, el número de tokens procesados, la composición del dataset o la aplicación de técnicas de alineación como RLHF o DPO. La versión "uncensored" procede de `orcarouter/Qwen3.8-Flash-Next-Uncensored`, que ha sido modificada para eliminar las restricciones de seguridad del modelo original. El proceso de cuantización es específico para MLX-Serve y no es directamente compatible con otros frameworks de inferencia genéricos.

## Capacidades

- Modelo multimodal que acepta texto e imágenes como entrada (pipeline `image-text-to-text`).
- Generación de texto y razonamiento con capacidades de programación, evaluadas por el autor en 25 tareas de TypeScript.
- Soporte de tool calling / function calling, observado en los benchmarks del autor mediante el uso de herramientas externas y agentes.
- Capacidades de agente con razonamiento multi-paso: las evaluaciones incluyeron hasta 12 iteraciones de agente por tarea.
- Soporte de multi-token prediction (MTP) y decodificación asistida por tabla N-gram, activado mediante el runtime MLX-Serve parcheado.
- Idiomas soportados: no disponible en la documentación proporcionada.

## Casos de uso

- Asistente de programación local: el modelo ha sido evaluado en tareas de TypeScript y puede integrarse en flujos de desarrollo dentro de una Mac Studio, actuando como copiloto que utiliza herramientas para completar código o ejecutar pruebas.
- Automatización de agentes con herramientas: gracias al soporte de tool calling y al razonamiento multi-paso, puede desplegarse en sistemas de agentes que interactúan con APIs, siempre que se apliquen sandboxing y control de permisos.
- Análisis de documentos e imágenes: al ser multimodal, permite procesar capturas de pantalla, gráficos o documentos escaneados en entornos donde se requiere comprender simultáneamente texto y contenido visual.
- Investigación de alineación y seguridad: la versión "uncensored" resulta útil para comparar el comportamiento del modelo frente a la versión alineada original y estudiar el impacto de eliminar las restricciones de seguridad.
- Despliegue local con requisitos de privacidad: el pack MLX-Serve permite ejecutar la inferencia en Apple Silicon sin enviar datos a servicios externos, adecuado para entornos con políticas estrictas de confidencialidad.
- Benchmarking de cuantización mixta: puede utilizarse para evaluar el rendimiento y la calidad de un modelo MoE de 133 B con cuantización 4/8-bit en memoria unificada, midiendo latencia y consumo de recursos mediante el runtime parcheado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Los datos que presenta el autor corresponden a una evaluación no estándar sobre 25 tareas de TypeScript, con una sola ejecución por modelo. Los resultados deben interpretarse como observaciones puntuales, no como evidencia de superioridad general.

| Evaluación (una sola ejecución) | Modelo original | Este modelo uncensored |
|---|---|---|
| Tareas TypeScript aprobadas | 22/25 (88 %) | 21/25 (84 %) |
| Tiempo total de ejecución | 38 m 13,478 s | 36 m 50,870 s |

El autor también documenta el comportamiento del parche MTP:

- Se completaron 27 ciclos de uso y recarga de MTP sin el fallo de cuantización reproducido en el motor original.
- Una reproducción de historial capturado falló en la petición 19 con el motor antiguo y pasó 19/19 con el fix, incluyendo 14 recargas de MTP.
- Un round trip de herramienta Hermes con unos 19.700 tokens de entrada se completó en 29,6 segundos.
- El seguimiento en caché de esa misma conversación decodificó a 53,5 tokens/s.
- El tiempo total de la evaluación incluye uso de herramientas y revisiones, por lo que no mide la velocidad de decodificación pura.

## Requisitos de hardware

- Espacio en disco: se requieren 107,3 GB para el repositorio y unos 108 GB adicionales como espacio de trabajo, según la model card del autor.
- Memoria: el modelo fue probado en una Mac Studio M3 Ultra con 96 GB de memoria unificada. No está diseñado para GPUs de consumidor con 24 GB de VRAM.
- El pack es específico para MLX-Serve y no debe asumirse que puede cargarse directamente con Transformers, mlx-lm o mlx-vlm.
- Las comprobaciones de imagen y contexto largo mostraron que una combinación de imagen y 200K tokens falló en la admisión de memoria, mientras que una combinación de imagen y 180K tokens sí pasó. No constituye una garantía de capacidad.
- Latencia: un round trip con herramienta Hermes y ~19.700 tokens de entrada se completó en 29,6 segundos; la decodificación con caché alcanzó 53,5 tokens/s.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Rendimiento (evaluación TypeScript) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| yomie4343/Qwen3.8-Flash-Next-Uncensored-MLX-Serve-mixed-4-8bit | 133 B | 204.800 (anunciado) | Mixta 4/8-bit MLX-Serve | 21/25 (84 %) | Qwen Community 1.0 | HuggingFace |
| ARC4NUM/Qwen3.8-Flash-Next-Uncensored-MLX-Serve-4bit | 133 B | no disponible | 4-bit MLX-Serve | no evaluado en esta informacion | Qwen Community 1.0 | HuggingFace (byte-idéntico) |
| Qwen/Qwen3.8-Flash-Next | no disponible | no disponible | no disponible | 22/25 (88 %) | no disponible | GitHub y HuggingFace |

El modelo de `yomie4343` es un espejo byte-idéntico del pack de `ARC4NUM`, con la diferencia de que incluye el parche de runtime MTP y las notas de validación. El modelo original de Qwen muestra un rendimiento ligeramente superior en la evaluación del autor, pero no está cuantizado ni disponible en formato MLX-Serve.

## Limitaciones y advertencias

- El modelo es explícitamente "uncensored": las salidas pueden ser inseguras, incorrectas u ofensivas. Se recomienda usar sandboxing, herramientas con privilegios mínimos, revisión humana y salvaguardas a nivel de aplicación.
- No debe otorgarse acceso irrestricto a credenciales, archivos personales o acciones externas.
- El contexto anunciado de 204.800 tokens no es garantía de contexto utilizable en un hardware de 96 GB; la evaluación no ejerció la longitud completa.
- Las pruebas de imagen combinada con 200K tokens fallaron en la admisión de memoria; solo una prueba con 180K tokens pasó. No son garantías de capacidad ni han sido repetidas tras el fix MTP.
- Los parches de runtime son experimentales: incluyen trabajo sobre QSA, caché y ciclo de vida que no forma parte de una versión upstream y no constituye una promesa de soporte en otros equipos.
- La salida de decodificación greedy autoregresiva y la de MTP no han sido establecidas como universalmente idénticas.
- Licencia Qwen Community License 1.0: no es Apache-2.0. Existen condiciones para el uso comercial, incluyendo un requisito de licencia separada para negocios cualificados de Model-as-a-Service o AI Work Assistant.
- El repositorio cuenta con 0 descargas y 0 likes, y no existe información sobre mantenimiento continuado.

## Enlaces

- https://huggingface.co/yomie4343/Qwen3.8-Flash-Next-Uncensored-MLX-Serve-mixed-4-8bit
- https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- https://github.com/QwenLM/Qwen3.8-Flash-Next/
- https://huggingface.co/orcarouter/Qwen3.8-Flash-Next-Uncensored
- https://huggingface.co/ARC4NUM/Qwen3.8-Flash-Next-Uncensored-MLX-Serve-4bit
- https://github.com/ddalcu/mlx-serve
- https://github.com/youssofal/mtplx
