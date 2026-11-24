# Thox-ai/ThoxMini-125M-role

## Resumen

ThoxMini-125M-role es un ajuste fino completo (full fine-tune) del modelo base Thox-ai/thox-micro-125m, desarrollado por THOX.ai. Se trata de un modelo de lenguaje de 123,6 millones de parámetros diseñado específicamente para encarnar el rol de dispositivo del dispositivo físico ThoxMini, un equipo local de IA que funciona en red propia y de forma offline tras el emparejamiento. El modelo responde a comandos locales, informa de estados del dispositivo y delega al host cualquier petición que exceda su ámbito, en lugar de inventar respuestas.

El modelo se distribuye en dos formatos: pesos safetensors (247 MB) y una cuantización GGUF Q4_K_M (84,6 MB), lo que lo sitúa en la categoría de modelos edge/on-device. Su corpus de entrenamiento es un conjunto propio de THOX de 1.565 turnos de rol de dispositivo y conversación, lo que explica su comportamiento acotado: responde correctamente a comandos dentro del corpus y defiere el resto.

Es relevante ahora por su enfoque de "local-first" y su integración con Ollama y llama.cpp, así como por formar parte del ecosistema de hardware ThoxMini (campaña en Kickstarter). No obstante, es un modelo de investigación, no cualificado todavía en el hardware del dispositivo, y con defectos conocidos documentados por el propio autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama (según tags y librería GGUF); detalles internos no disponibles |
| Parametros totales | 123.587.328 (123,6 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF); pesos completos en safetensors |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors y GGUF |
| Modelo base | Thox-ai/thox-micro-125m |
| Tamaño del repo | 0,3 GB |
| Descargas | 1.284 |
| Fecha de creación | 2026-08-11 |
| Última actualización | 2026-11-22 |

## Arquitectura y entrenamiento

El modelo es un transformer de 123,6 millones de parámetros, heredado del base Thox-ai/thox-micro-125m y etiquetado como arquitectura Llama en la librería GGUF. No se dispone de información sobre el número de capas, dimensiones ocultas, mecanismos de atención ni longitud de contexto en la documentación proporcionada.

El entrenamiento consistió en un ajuste fino completo sobre un corpus autorado por THOX de 1.565 turnos de rol de dispositivo y chat. No se especifica el número de tokens de entrenamiento, la composición detallada del dataset ni si se emplearon técnicas de RLHF o DPO. La model card indica que no se reclama ningún entrenamiento adicional más allá de lo descrito. El objetivo del ajuste es que el modelo actúe como persona del dispositivo ThoxMini: responder a comandos locales, dar respuestas de estado y delegar al host todo lo que quede fuera de su rol.

## Capacidades

- Generación de texto para respuestas cortas y superficiales, por diseño de un modelo de 125 M.
- Respuesta a comandos locales del dispositivo dentro del corpus de entrenamiento.
- Delegación explícita al host cuando la petición excede el rol del dispositivo.
- Cero fabricación en preguntas sobre hechos de la empresa según la evaluación del autor en prompts fuera del corpus.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: solo inglés.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Asistente de rol de dispositivo en el ThoxMini: el modelo responde a comandos locales y estados del dispositivo cuando se ejecuta en un host emparejado, y delega el resto al host. Es adecuado por su entrenamiento específico en 1.565 turnos de rol.
- Demostración de IA local en el borde: al ocupar 84,6 MB en Q4_K_M, puede ejecutarse en Ollama o llama.cpp en hardware de bajos recursos para mostrar inferencia local sin conexión.
- Enrutamiento y deferencia: útil como capa de primera línea que decide si una consulta es de ámbito local o debe escalarse al host, evitando respuestas inventadas.
- Prototipado de personas de dispositivo: sirve como base para experimentar con ajustes finos de rol en dispositivos embebidos con presupuesto de memoria mínimo.
- Pruebas de integración con Ollama: el comando `ollama run hf.co/Thox-ai/ThoxMini-125M-role:Q4_K_M` permite validar pipelines de despliegue local en minutos.
- Investigación sobre comportamiento de deferencia: su evaluación reporta cero fabricaciones en preguntas de hechos de empresa, lo que lo hace útil para estudiar estrategias de abstención en modelos pequeños.
- Educación y experimentación con modelos pequeños: adecuado para entornos docentes donde se quiere un modelo ligero con licencia Apache-2.0 y pesos abiertos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que no existe un resultado THOX GATE49 publicado para este modelo. La única evaluación cualitativa reportada es que, en prompts fuera del corpus de entrenamiento, el modelo defirió en preguntas sobre hechos de la empresa con cero fabricaciones y sin filtración del corpus de entrenamiento, y que los comandos de dispositivo dentro del corpus se responden correctamente.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en Q4_K_M (peso del archivo 84,6 MB más overhead de contexto y runtime); aproximadamente 0,5 GB en safetensors FP32/FP16 según el formato de carga.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el modelo cabe holgadamente en iGPU y CPU. No requiere A100 ni H100.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 1 GB de memoria, e incluso en CPU.
- Opciones de despliegue: Ollama (`ollama run hf.co/Thox-ai/ThoxMini-125M-role:Q4_K_M`), llama.cpp (`llama-cli`), y cualquier runtime compatible con GGUF. vLLM y TGI no están documentados para este modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ThoxMini-125M-role | 123,6 M | No disponible | Apache-2.0 | Hugging Face (safetensors + GGUF Q4_K_M) | Ajuste fino de rol de dispositivo, solo inglés |
| Thox-ai/thox-micro-125m | 125 M (base) | No disponible | No disponible | Hugging Face | Modelo base del que deriva |
| Alternativas de 125 M tipo GPT-2 small / distilgpt2 | ~117-125 M | 1.024 tokens (GPT-2) | MIT / Apache-2.0 según variante | Hugging Face | Modelos generalistas, no especializados en rol de dispositivo |
| Modelos edge de 100-200 M (p. ej. TinyLlama no aplica por tamaño) | No disponible | No disponible | No disponible | No disponible | No se dispone de comparación directa documentada |

No se dispone de datos de benchmarks comparativos publicados para este modelo frente a alternativas de su categoría.

## Limitaciones y advertencias

- Dos defectos conocidos documentados por el autor: la redacción específica del dispositivo es incorrecta en algunos puntos (dice "the key" donde debería decir "the mini"), y sobre-defiere en preguntas de identidad (preguntado quién es, defiere en lugar de nombrarse). Ninguno fabrica; ambos son huecos del corpus con una ruta de corrección registrada.
- Modelo de 125 M: respuestas cortas y superficiales por diseño.
- No cualificado todavía en el hardware del dispositivo ThoxMini; el soporte on-device está pendiente de una prueba registrada.
- Solo soporta inglés; no hay capacidades multilingües.
- Riesgo de alucinación: aunque la evaluación reporta cero fabricaciones en preguntas de hechos de empresa, un modelo de este tamaño tiene capacidad limitada de razonamiento y conocimiento general.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el modelo se publica como modelo de investigación y no está validado para producción.
- Uso fuera de alcance: decisiones médicas, legales, financieras o de seguridad crítica sin revisión humana; control no supervisado de dispositivos físicos sin paso de confirmación.
- Longitud de contexto no documentada, lo que impide planificar conversaciones multi-turno largas.

## Enlaces

- Hugging Face: https://huggingface.co/Thox-ai/ThoxMini-125M-role
- Modelo base: https://huggingface.co/Thox-ai/thox-micro-125m
- Demo de dispositivos virtuales: https://thox.ai/#demo-callout-home_lineup
- Campaña de Kickstarter: https://www.kickstarter.com/projects/thox/four-devices-one-private-ai-ecosystem-thoxai
- Sitio del autor: https://thox.ai
