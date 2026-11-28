# Thox-ai/ThoxMini-125M-role

## Resumen

ThoxMini-125M-role es un ajuste fino completo (full fine-tune) del modelo base `Thox-ai/thox-micro-125m`, desarrollado por THOX.ai. Se trata de un modelo de lenguaje de 123,5 millones de parámetros (125M nominales) especializado en desempeñar el rol de "dispositivo" para la persona ThoxMini: responde a comandos locales, informa de estados y delega explícitamente al host cualquier petición que exceda ese ámbito, en lugar de inventar respuestas. El corpus de ajuste es de autoría propia y consta de 1.565 turnos de rol de dispositivo y conversación.

El modelo está pensado para ejecución en el borde (edge) y en local, con un enfoque "local-first": se distribuye tanto en safetensors como en un GGUF cuantizado Q4_K_M de apenas 84,7 MB, lo que permite ejecutarlo en hardware muy modesto mediante llama.cpp u Ollama. La licencia es Apache-2.0, lo que facilita su integración comercial sin restricciones de atribución más allá de las habituales.

Su relevancia actual reside en el nicho: no compite en capacidades generales de razonamiento o generación, sino que propone un patrón de diseño defensivo para asistentes embebidos, donde la abstención controlada y la delegación al host priman sobre la creatividad del modelo. Es un modelo de investigación, no cualificado todavía sobre hardware ThoxMini real.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (familia LLaMA, según tags `llama`; detalles internos de capas y atención no disponibles) |
| Parámetros totales | 123.587.328 (123,5M) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | GGUF Q4_K_M (publicado); safetensors en precisión original |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (247,2 MB) y GGUF Q4_K_M (84,7 MB) |

## Arquitectura y entrenamiento

El modelo es un transformer de 123,5M de parámetros derivado de `Thox-ai/thox-micro-125m`, etiquetado en Hugging Face dentro de la familia `llama`. La model card no detalla el número de capas, dimensiones de atención, tipo de positional encoding ni si emplea mecanismos como GQA o decodificación especulativa; esa información no está disponible.

El entrenamiento consiste en un ajuste fino completo sobre un corpus de autoría propia (THOX-authored) compuesto por 1.565 turnos de rol de dispositivo y conversación. No se documenta el número de tokens totales, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF, DPO o SFT con formato específico. La model card indica explícitamente que no se reclama ningún entrenamiento adicional más allá del descrito. El objetivo del ajuste es enseñar al modelo a responder comandos locales del dispositivo y a delegar el resto al host, con una política de abstención ante preguntas fuera de ámbito (por ejemplo, hechos de empresa).

## Capacidades

- Generación de texto breve y respuestas de rol de dispositivo: comandos locales, respuestas de estado y confirmaciones.
- Delegación controlada: ante preguntas fuera del ámbito del dispositivo, el modelo deriva al host en lugar de fabricar respuestas.
- Abstención ante hechos de empresa: en las pruebas con prompts fuera del corpus, no produjo fabricaciones ni filtró contenido del scrape de entrenamiento.
- Conversación multi-turno básica dentro del rol (corpus de chat incluido en el ajuste).
- Ejecución en local y en el borde mediante GGUF y Ollama.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, visión, audio, matemáticas avanzadas ni razonamiento profundo; un modelo de 125M no está diseñado para ello.

## Casos de uso

- Asistente de rol de dispositivo en un host emparejado: el modelo responde a comandos locales ("estado", "versión", "encender") y delega cualquier otra consulta al host, lo que encaja en arquitecturas de asistente embebido con separación de responsabilidades.
- Demostración de patrón de abstención controlada: útil como referencia de diseño para equipos que quieran implementar asistentes que no inventen información fuera de su dominio, aprovechando que el modelo fue ajustado explícitamente para delegar.
- Prototipado rápido en local con Ollama: el GGUF Q4_K_M de 84,7 MB permite iterar en portátiles y equipos sin GPU dedicada, con `ollama run hf.co/Thox-ai/ThoxMini-125M-role:Q4_K_M`.
- Pruebas de integración en pipelines de CI para asistentes de dispositivo: al ser determinista en su rol y de tamaño reducido, sirve como componente de prueba en flujos de validación de respuestas locales frente a delegadas.
- Educación y experimentación con ajuste fino: el par base (`thox-micro-125m`) y ajuste (`ThoxMini-125M-role`) permite estudiar el efecto de un corpus pequeño y específico sobre el comportamiento de abstención.
- Evaluación de despliegue edge: útil para medir latencia y consumo en hardware de gama baja antes de invertir en modelos mayores, dado su tamaño de 84,7 MB en Q4_K_M.
- Referencia para auditoría de alucinaciones: la model card reporta cero fabricaciones en preguntas de hechos de empresa fuera del corpus, lo que lo convierte en un caso de estudio de política de "deferir antes que inventar".

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que no hay resultado GATE49 publicado para este modelo y que la evaluación se limita a pruebas cualitativas sobre prompts fuera del corpus (delegación con cero fabricaciones y sin filtración del scrape de entrenamiento) y a comandos de dispositivo dentro del corpus (respuesta correcta).

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en Q4_K_M (pesos de 84,7 MB más overhead de contexto y runtime); en safetensors, aproximadamente 0,25 GB de pesos más overhead.
- GPU recomendadas: cualquier GPU consumer moderna es sobrada; el modelo cabe en CPU. No se requieren A100, H100 ni RTX 4090.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 1-2 GB de VRAM, e incluso en CPU y dispositivos de borde.
- Opciones de despliegue: Ollama (`ollama run hf.co/Thox-ai/ThoxMini-125M-role:Q4_K_M`), llama.cpp (`llama-cli`), y descarga directa del GGUF vía `hf download`. No se documenta soporte para vLLM o TGI.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| ThoxMini-125M-role | 123,5M | No disponible | Inglés | Apache-2.0 | Rol de dispositivo con delegación al host |
| Thox-ai/thox-micro-125m (base) | 125M (según nombre) | No disponible | No disponible | No disponible | Modelo base del que deriva el ajuste |
| SmolLM-135M (referencia de tamaño) | 135M | No disponible en esta ficha | Inglés principalmente | Apache-2.0 | Modelo pequeño de propósito general |
| Qwen2.5-0.5B (referencia de tamaño) | 0,5B | No disponible en esta ficha | Multilingüe | Apache-2.0 | Modelo pequeño de propósito general |

La comparación con alternativas de propósito general es limitada: ThoxMini-125M-role no está diseñado para tareas abiertas de generación o razonamiento, sino para un rol acotado con política de abstención. En ese sentido, su comparación más directa es con su propio modelo base, del que se desconoce el comportamiento detallado. Los datos de benchmarks de los modelos alternativos no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Dos defectos conocidos documentados por el autor: el modelo usa "the key" donde debería decir "the mini" en algunos textos específicos del dispositivo, y sobre-delega en preguntas de identidad (si se le pregunta quién es, delega en lugar de nombrarse). El autor indica que ninguno fabrica y que ambos son huecos del corpus con una ruta de corrección registrada.
- Modelo de 125M: respuestas cortas y superficiales por diseño; no apto para razonamiento complejo, matemáticas, código o generación extensa.
- No cualificado todavía sobre hardware ThoxMini real; la compatibilidad on-device está pendiente de una pasada de pruebas registrada.
- Solo inglés; no hay soporte multilingüe documentado.
- Riesgo de alucinación: aunque la model card reporta cero fabricaciones en las pruebas realizadas, un modelo de este tamaño puede producir respuestas incorrectas fuera de su dominio; la política de delegación mitiga pero no elimina el riesgo.
- Uso fuera de ámbito explícitamente desaconsejado: decisiones médicas, legales, financieras o de seguridad crítica sin revisión humana, y control desatendido de dispositivos físicos sin paso de confirmación.
- Licencia Apache-2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; el modelo se publica como modelo de investigación.
- Longitud de contexto no documentada, lo que dificulta planificar integraciones con conversaciones largas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Thox-ai/ThoxMini-125M-role
- Modelo base: https://huggingface.co/Thox-ai/thox-micro-125m
- Ejecución con Ollama: `ollama run hf.co/Thox-ai/ThoxMini-125M-role:Q4_K_M`
- Descarga directa del GGUF: `hf download Thox-ai/ThoxMini-125M-role ThoxMini-125M-role.Q4_K_M.gguf --local-dir ./ThoxMini-125M-role`
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información disponible.
