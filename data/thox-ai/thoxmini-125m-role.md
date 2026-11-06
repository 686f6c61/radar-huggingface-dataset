# Thox-ai/ThoxMini-125M-role

## Resumen

ThoxMini-125M-role es un ajuste fino completo (full fine-tune) del modelo base Thox-ai/thox-micro-125m, desarrollado por THOX.ai. Se trata de un modelo de lenguaje de 123.587.328 parámetros (aproximadamente 125M) diseñado específicamente para desempeñar el rol de dispositivo ("device-role") dentro de la persona ThoxMini: responde a comandos locales del dispositivo, informa de su estado y delega explícitamente al host cualquier petición que exceda ese ámbito, en lugar de inventar una respuesta.

El modelo se distribuye con pesos en safetensors y una cuantización GGUF Q4_K_M, lo que permite su ejecución en entornos locales y de borde (edge) mediante Ollama o llama.cpp. Está entrenado sobre un corpus autoría de THOX compuesto por 1.565 turnos de rol de dispositivo y conversación, y su licencia es Apache-2.0.

Su relevancia actual radica en el nicho de asistentes de dispositivo con comportamiento controlado: en lugar de maximizar capacidades generales, prioriza la deferencia fiable y la ausencia de fabricación en preguntas fuera de su dominio. Es un modelo de investigación, no cualificado todavía sobre hardware ThoxMini real, y con defectos conocidos documentados por el autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Thox-ai/thox-micro-125m; detalles de arquitectura no disponibles) |
| Parámetros totales | 123.587.328 (aproximadamente 125M) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | GGUF Q4_K_M; pesos completos en safetensors |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo del modelo base Thox-ai/thox-micro-125m, un transformer de aproximadamente 125M de parámetros. No se dispone de información detallada sobre la arquitectura interna del modelo base (número de capas, dimensiones ocultas, mecanismo de atención) ni sobre la longitud de contexto soportada.

El entrenamiento consistió en un fine-tune sobre un corpus autoría de THOX compuesto por 1.565 turnos de rol de dispositivo y conversación. La model card no especifica el número total de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO. No se documenta ninguna innovación técnica destacable (decodificación especulativa, atención lineal, etc.). El autor indica que no se reclama ningún entrenamiento adicional más allá del descrito en la model card.

## Capacidades

- Generación de texto orientada a respuestas de rol de dispositivo: comandos locales, respuestas de estado y mensajes breves de conversación.
- Deferencia controlada: ante preguntas fuera de su ámbito (por ejemplo, hechos sobre la empresa), el modelo delega al host en lugar de fabricar una respuesta.
- Respuesta a comandos de dispositivo presentes en el corpus de entrenamiento.
- Conversación multi-turno básica dentro del rol de dispositivo.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés.
- No se documentan capacidades de visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Asistente de rol de dispositivo en un host emparejado: el modelo responde a comandos locales y consultas de estado del dispositivo ThoxMini, y delega al host todo lo que excede ese rol, lo que lo hace adecuado para interfaces de dispositivo con ámbito acotado.
- Capa de deferencia en asistentes embebidos: al no fabricar respuestas sobre hechos de empresa en prompts fuera del corpus, puede usarse como primera capa de un pipeline donde las preguntas no reconocidas se enrutan a un modelo mayor en el host.
- Demostración de fine-tuning de rol con corpus pequeño: con 1.565 turnos y 125M de parámetros, sirve como referencia reproducible para experimentos de ajuste de comportamiento en modelos pequeños.
- Prototipado en local con Ollama o llama.cpp: la cuantización Q4_K_M (84,7 MB) permite iterar en máquinas sin GPU dedicada durante el desarrollo de la persona del dispositivo.
- Investigación sobre alucinación controlada: el comportamiento de deferencia con cero fabricaciones en preguntas retenidas lo convierte en un caso de estudio para evaluar estrategias de abstención en modelos pequeños.
- Integración en flujos local-first: al ejecutarse en el propio dispositivo o host emparejado, encaja en arquitecturas donde los datos no deben salir del entorno del usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica que no existe un resultado THOX GATE49 publicado para este modelo. La única evaluación descrita es cualitativa: en prompts retenidos del corpus de entrenamiento, el modelo delegó en preguntas de hechos de empresa con cero fabricaciones y sin filtración del corpus de entrenamiento, y respondió correctamente a comandos de dispositivo presentes en el corpus.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en Q4_K_M (el archivo GGUF ocupa 84.664.768 bytes, unos 81 MB); los pesos en safetensors ocupan 247.186.968 bytes (unos 236 MB).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el modelo cabe holgadamente en GTX 1650, RTX 3060, RTX 4090 o superiores. También puede ejecutarse en CPU.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 1 GB de memoria; en la práctica funciona en CPU y en dispositivos de borde.
- Opciones de despliegue: Ollama (`ollama run hf.co/Thox-ai/ThoxMini-125M-role:Q4_K_M`), llama.cpp (`llama-cli`), y carga directa de safetensors con la librería de transformers. No se documenta soporte específico de vLLM o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| ThoxMini-125M-role | 125M | No disponible | Apache-2.0 | Rol de dispositivo con deferencia | Hugging Face (safetensors, GGUF) |
| Thox-ai/thox-micro-125m (base) | 125M | No disponible | No disponible | Modelo base | Hugging Face |
| Alternativas de 125M comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks ni de información sobre modelos comparables de la misma categoría en la documentación proporcionada, por lo que no es posible establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Defectos conocidos documentados por el autor: la redacción específica del dispositivo es incorrecta en algunos puntos (dice "the key" donde debería decir "the mini"), y sobre-delega en preguntas de identidad (si se le pregunta quién es, delega en lugar de nombrarse). Ambos son huecos del corpus con una ruta de corrección registrada; ninguno fabrica información.
- Modelo de 125M: por diseño, las respuestas son cortas y superficiales.
- No está cualificado sobre hardware ThoxMini real; el soporte on-device está pendiente de una prueba grabada.
- Riesgo de alucinación: el autor reporta cero fabricaciones en las pruebas realizadas, pero se trata de una evaluación limitada a prompts retenidos del corpus, no de una garantía general.
- Limitación de idioma: solo inglés.
- Longitud de contexto no documentada, lo que dificulta planificar su uso en conversaciones largas.
- Uso previsto restringido: no debe emplearse en decisiones médicas, legales, financieras o de seguridad crítica sin revisión humana, ni para el control no supervisado de dispositivos físicos sin un paso de confirmación.
- Licencia Apache-2.0: permite uso comercial, pero el modelo se publica como modelo de investigación y sin cualificación sobre el hardware objetivo.

## Enlaces

- Hugging Face: https://huggingface.co/Thox-ai/ThoxMini-125M-role
- Modelo base: https://huggingface.co/Thox-ai/thox-micro-125m
