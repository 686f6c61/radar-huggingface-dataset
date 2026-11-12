# xiq/Raon-1-nano-heretic-GGUF

## Resumen

Raon-1-nano-heretic-GGUF es la versión cuantizada en formato GGUF de Raon-1-nano-heretic, un modelo derivado de KRAFTON/Raon-1-nano al que se le ha aplicado un proceso de "decensoring" mediante la herramienta Heretic. El autor de esta distribución es el usuario xiq, y el modelo conserva la licencia Apache 2.0 del modelo original. Se trata de un modelo de 3.130.811.440 parámetros (aproximadamente 3,13 mil millones) distribuido en tres cuantizaciones: Q4_K_M, Q6_K y Q8_0.

La relevancia de esta ficha radica en que Raon-1-nano emplea una arquitectura personalizada que no es compatible con las compilaciones estándar de llama.cpp: requiere un fork específico mantenido por KRAFTON (rama `raon-1-nano-preview`). Además, el proceso Heretic debilita deliberadamente los mecanismos de seguridad del modelo original, lo que lo hace adecuado únicamente para entornos controlados y con supervisión humana.

El modelo soporta una ventana de contexto de 65.536 tokens según el ejemplo de uso de la model card, e incluye un modo de razonamiento ("thinking") activable mediante `enable_thinking`. No se dispone de información sobre idiomas soportados, pipeline ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con arquitectura personalizada (requiere fork de llama.cpp de KRAFTON) |
| Parametros totales | 3.130.811.440 (aproximadamente 3,13 mil millones) |
| Parametros activos | no disponible (no es MoE según los datos disponibles) |
| Longitud de contexto | 65.536 tokens (según ejemplo de uso de la model card) |
| Tipos de cuantizacion | Q4_K_M (2,08 GB), Q6_K (2,65 GB), Q8_0 (3,39 GB) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 8,1 GB); modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base, KRAFTON/Raon-1-nano, utiliza una arquitectura propietaria que no sigue el esquema estándar de llama.cpp, motivo por el cual la model card exige una compilación específica del fork de KRAFTON (rama `raon-1-nano-preview`). No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo original.

La innovación principal de esta variante es la aplicación de Heretic, una herramienta de código abierto (github.com/p-e-w/heretic) que modifica los pesos del modelo para reducir sus rechazos ante peticiones que el modelo original denegaría. El resultado es un modelo "abliterated" y "uncensored" que conserva la arquitectura y el conocimiento del original pero con los mecanismos de seguridad atenuados. El modelo soporta un modo de razonamiento explícito activable por parámetro.

## Capacidades

- Generación de texto conversacional multi-turno (tag `conversational`).
- Modo de razonamiento ("thinking") activable mediante `--reasoning on` y `--chat-template-kwargs '{"enable_thinking": true}'`.
- Respuestas sin los rechazos típicos del modelo original en temas sensibles (comportamiento "uncensored").
- Compatibilidad con endpoints (tag `endpoints_compatible`), lo que sugiere integración con APIs compatibles con OpenAI.
- Capacidades multilingües: no disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades de visión o audio: no disponible.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar cómo varía el comportamiento de un modelo tras aplicar técnicas de abliteration, comparando respuestas con el original Raon-1-nano en el mismo conjunto de prompts.
- Generación creativa sin restricciones: para proyectos de escritura de ficción que requieran contenido que el modelo original rechazaría, siempre en un entorno controlado y con revisión humana posterior.
- Despliegue en local con recursos limitados: la cuantización Q4_K_M (2,08 GB) permite ejecutar el modelo en equipos con poca VRAM o incluso en CPU mediante el fork de llama.cpp, con contexto de hasta 65.536 tokens.
- Experimentación con modo de razonamiento: el flag `enable_thinking` permite evaluar cadenas de razonamiento explícitas en tareas de lógica o matemáticas, comparando la salida con y sin thinking activado.
- Prototipado de asistentes conversacionales: el tag `conversational` y la compatibilidad con endpoints facilitan integrar el modelo en un chatbot de pruebas con contexto largo.
- Análisis de sesgos y contenido dañino: al ser un modelo decensored, sirve como herramienta para auditar qué tipo de contenido genera un modelo sin salvaguardas, útil en pipelines de evaluación de riesgos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5–3 GB para Q4_K_M, 3–3,5 GB para Q6_K y 4–4,5 GB para Q8_0 (estimación a partir del tamaño de los ficheros más overhead de contexto).
- GPU recomendadas: cualquier GPU consumer con al menos 4–6 GB de VRAM (RTX 3060, RTX 4060, RTX 4090) para las cuantizaciones Q4_K_M y Q6_K; Q8_0 requiere algo más de margen.
- Cabe en GPU consumer: sí, en la mayoría de tarjetas con 6 GB o más de VRAM para Q4_K_M y Q6_K.
- Opciones de despliegue: exclusivamente llama.cpp con el fork de KRAFTON (rama `raon-1-nano-preview`); no se garantiza compatibilidad con vLLM, Ollama o TGI al tratarse de una arquitectura personalizada.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Raon-1-nano-heretic-GGUF | 3,13 mil millones | 65.536 tokens | Apache 2.0 | GGUF | Requiere fork de llama.cpp; decensored |
| KRAFTON/Raon-1-nano | 3,13 mil millones (estimado) | no disponible | no disponible | safetensors | Modelo original con salvaguardas |
| xiq/Raon-1-nano-heretic | 3,13 mil millones (estimado) | no disponible | Apache 2.0 | safetensors | Versión decensored sin cuantizar |

No se dispone de datos de benchmarks ni de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El comportamiento de seguridad ha sido debilitado deliberadamente: el modelo puede producir contenido que el original rechazaría, incluyendo material sensible o dañino.
- Riesgo de alucinación y errores factuales: la model card advierte explícitamente de que el modelo "puede equivocarse o inventar cosas".
- La arquitectura personalizada obliga a usar un fork específico de llama.cpp; las herramientas estándar (Ollama, vLLM, TGI) no son compatibles de forma garantizada.
- La licencia Apache 2.0 se hereda del modelo base, pero la model card indica que "los términos y la licencia del modelo base también se aplican", por lo que conviene revisar las condiciones de KRAFTON/Raon-1-nano antes de un uso comercial.
- No hay información sobre idiomas soportados ni sobre sesgos específicos del modelo.
- El número de descargas y likes es cero en el momento de la consulta, lo que indica que es una publicación reciente y sin validación comunitaria.
- Uso responsable: el autor declara que la responsabilidad del uso recae en el usuario.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/xiq/Raon-1-nano-heretic-GGUF
- Modelo base decensored: https://huggingface.co/xiq/Raon-1-nano-heretic
- Modelo original: https://huggingface.co/KRAFTON/Raon-1-nano
- Heretic (herramienta de decensoring): https://github.com/p-e-w/heretic
- Fork de llama.cpp con soporte Raon: https://github.com/krafton-ai/llama.cpp (rama `raon-1-nano-preview`)
