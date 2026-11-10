# yipengsun/Ask-Yipeng

## Resumen

Ask-Yipeng es un modelo de lenguaje de 0,8 mil millones de parámetros derivado de Qwen/Qwen3.5-0.8B y ajustado por el usuario yipengsun para responder, en primera persona, a preguntas sobre la trayectoria pública de Yipeng Sun (investigador con doctorado en la FAU). El modelo integra en sus pesos los hechos públicos del autor (publicaciones, formación y proyectos de código abierto), de modo que no requiere una hoja de datos en el prompt. Su propósito es servir de asistente personal embebido en la página web del autor.

La relevancia técnica del modelo no reside en su tamaño, sino en su formato de despliegue: está compilado para MLC-LLM y WebLLM, de forma que se ejecuta íntegramente en el navegador mediante WebGPU, sin enviar ninguna consulta a un servidor. El repositorio incluye la biblioteca WebGPU precompilada (`qwen3_5-0.8b-q4f16_1-vocab51200-webgpu.wasm`) porque el modelo emplea un vocabulario reducido (51.200 tokens frente a los 248.320 del modelo base) para el que WebLLM 0.2.86 no ofrece una librería lista.

El modelo está cuantizado en q4f16_1, ocupa unos 310 MB en descarga y soporta ocho idiomas (inglés, alemán, chino, japonés, francés, español, italiano y coreano). Está pensado para un caso de uso muy acotado: responder sobre un perfil público concreto, rechazar información privada o premisas falsas y mantener el idioma solicitado por el visitante.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-0.8B); no se detalla la variante exacta |
| Parámetros totales | 0,8 mil millones (modelo base Qwen/Qwen3.5-0.8B) |
| Parámetros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | 4096 tokens (configurado en el ejemplo de WebLLM mediante `context_window_size`) |
| Tipos de cuantización | q4f16_1 (cuantización de 4 bits con acumulación en fp16 para WebGPU) |
| Idiomas soportados | en, de, zh, ja, fr, es, it, ko |
| Licencia | Apache 2.0 |
| Formato de pesos | MLC-LLM / WebLLM (WASM para WebGPU); tamaño del repo 0,3 GB |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B, un transformer de 0,8B parámetros. El autor no documenta en la model card el proceso de ajuste (número de tokens, composición del dataset, uso de RLHF/DPO o método de fine-tuning), por lo que estos datos deben considerarse no disponibles. Lo que sí se describe es el resultado: los hechos públicos de Yipeng Sun quedan fijados en los pesos con fecha de corte noviembre de 2026.

La innovación técnica destacable es la reducción del vocabulario a 51.200 tokens. Se conservan todos los tokens especiales, los 256 tokens de byte y los tokens más frecuentes para los ocho idiomas soportados, de modo que cualquier texto UTF-8 sigue codificándose y decodificándose de forma exacta. Esta reducción permite un modelo más pequeño y una librería WASM específica para WebGPU. El despliegue recomendado usa decodificación greedy (`temperature: 0`), `enable_thinking: false` y un system prompt fijo que impone el rol en primera persona y las reglas de rechazo.

## Capacidades

- Generación de texto conversacional en primera persona sobre el perfil público de Yipeng Sun (trabajo, publicaciones, formación y proyectos de código abierto).
- Rechazo controlado de información privada (dirección, teléfono, edad, familia, ingresos) con devolución del correo público `yipeng.sun@fau.de`.
- Rechazo de premisas falsas, opiniones, trabajo no publicado, información interna del empleador, tareas de propósito general y peticiones de saltarse las reglas.
- Rechazo de descripciones sobre terceras personas, sin trasladar hechos de Yipeng a otros individuos.
- Multilingüismo en ocho idiomas, respondiendo en el idioma solicitado; una instrucción de idioma del tipo "a partir de ahora" persiste hasta que el visitante la cambie.
- Seguimiento de referencias a turnos anteriores en conversaciones multi-turno.
- No dispone de tool calling, function calling, visión, audio ni modo de razonamiento explícito (el thinking se desactiva en el uso previsto).

## Casos de uso

- Asistente personal en la página web del autor: el modelo se carga en el navegador del visitante vía WebLLM y WebGPU, responde sobre trayectoria y publicaciones sin que la consulta salga del dispositivo, lo que preserva la privacidad del visitante.
- Sustitución de una sección "sobre mí" estática: los visitantes pueden preguntar en lenguaje natural por publicaciones concretas, formación o proyectos, y el modelo responde en una a tres frases salvo que se pida una lista.
- Filtro de privacidad en atención pública: ante preguntas sobre datos personales, el modelo devuelve un rechazo breve y el correo de contacto, evitando fugas de información sensible.
- Demostración de inferencia on-device: sirve como ejemplo reproducible de despliegue de un LLM cuantizado en WebGPU con MLC-LLM, útil para desarrolladores que evalúan WebLLM.
- Asistente multilingüe para visitantes internacionales: responde en inglés, alemán, chino, japonés, francés, español, italiano o coreano según el idioma de la consulta o la instrucción explícita del usuario.
- Chat multi-turno con memoria de conversación: al enviar el historial completo tras el system prompt, el modelo resuelve referencias a turnos previos, adecuado para sesiones de preguntas y respuestas sobre el perfil.
- Prototipo de asistentes de perfil acotado: el patrón (hechos en pesos, reglas de rechazo en el system prompt, vocabulario reducido) es reutilizable para otros currículos o perfiles públicos con requisitos estrictos de privacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no aplica en el caso principal, ya que la inferencia se ejecuta en el navegador mediante WebGPU sobre la GPU del visitante; la descarga del modelo es de unos 310 MB (cuantización q4f16_1).
- GPU recomendadas: cualquier GPU con soporte WebGPU en el navegador; no se especifican modelos concretos en la información disponible.
- Compatibilidad con GPU de consumo: el tamaño del modelo (0,8B en q4f16_1) es compatible con GPU integradas y dedicadas de consumo que soporten WebGPU; no se detallan cifras de VRAM.
- Opciones de despliegue: WebLLM 0.2.86 con WebGPU (vía `@mlc-ai/web-llm` desde CDN); el repositorio incluye la librería WASM específica. No se documentan otras opciones (vLLM, llama.cpp, Ollama, TGI) en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Despliegue |
|---|---|---|---|---|---|
| Ask-Yipeng | 0,8B | 4096 | 8 idiomas | Apache 2.0 | WebLLM/WebGPU en navegador |
| Qwen/Qwen3.5-0.8B (base) | 0,8B | no disponible | no disponible | Apache 2.0 | Múltiple (no detallado) |
| Alternativas de perfil acotado | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre Ask-Yipeng y otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Un modelo de 0,8B puede cometer errores; el propio autor recomienda confirmar detalles importantes por correo.
- Los hechos están fijados en el momento del entrenamiento (noviembre de 2026); los eventos posteriores no están en el modelo.
- El modelo está especializado en un único perfil y rechaza tareas de propósito general, por lo que no es adecuado como asistente generalista.
- Riesgo de alucinación inherente al tamaño reducido, mitigado parcialmente por el system prompt y la decodificación greedy, pero no eliminado.
- El uso previsto depende de un system prompt exacto y de `enable_thinking: false`; desviarse de esa configuración puede degradar la calidad y el cumplimiento de las reglas de rechazo.
- La licencia Apache 2.0 permite uso comercial, pero el contenido factual del modelo se refiere a una persona concreta y su uso fuera de ese contexto carece de sentido y puede inducir a error.
- No se documentan sesgos específicos ni evaluación de seguridad más allá de las reglas de rechazo descritas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yipengsun/Ask-Yipeng
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- WebLLM: https://github.com/mlc-ai/web-llm
- Web oficial del autor: https://yipengsun.com/
