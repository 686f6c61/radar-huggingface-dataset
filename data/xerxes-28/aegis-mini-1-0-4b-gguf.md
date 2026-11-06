# Xerxes-28/AEGIS-Mini-1.0-4B-GGUF

## Resumen

AEGIS-Mini-1.0-4B es un modelo de lenguaje causal de tipo decoder-only obtenido mediante fine-tuning supervisado (SFT) del modelo Qwen3-4B de Alibaba. Lo desarrolla el autor independiente Xerxes-28 y está especializado en dominios técnicos concretos: electrónica, drones, robótica, matemáticas y física. El repositorio publicado contiene únicamente la versión cuantizada en formato GGUF (Q4_K_M, aproximadamente 2,5 GB), pensada para ejecutarse en dispositivos con recursos limitados como teléfonos móviles, portátiles o servidores pequeños.

El modelo parte de la copia cuantizada a 4 bits de Qwen3-4B publicada por Unsloth (`unsloth/Qwen3-4B-unsloth-bnb-4bit`) y se ajusta con un adaptador LoRA que se distribuye en un repositorio separado. Cuenta con 4.022.468.096 parámetros totales y una longitud de contexto de entrenamiento de 2.048 tokens, muy inferior a la ventana nativa de Qwen3-4B. Su relevancia actual radica en ser un ejemplo de modelo de bolsillo (edge) orientado a consultas técnicas de teoría, con despliegue sencillo mediante llama.cpp, Ollama, LM Studio o PocketPal.

La licencia es Apache-2.0, heredada del modelo base, lo que permite uso comercial. No obstante, el autor no ha publicado resultados de benchmarks y advierte explícitamente de que el modelo no debe emplearse para decisiones de seguridad crítica ni para obtener valores definitivos de diseño en circuitos, baterías o aeronaves.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (causal LM), basado en Qwen3-4B |
| Parametros totales | 4.022.468.096 (aproximadamente 4 mil millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 2.048 tokens (contexto de entrenamiento); contexto nativo de inferencia no disponible |
| Tipos de cuantizacion | Q4_K_M (única versión publicada en este repositorio) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (incluye pesos, tokenizer y chat template) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-4B, un transformer decoder-only denso de aproximadamente 4.000 millones de parámetros. Sobre esa base, el autor aplicó un ajuste supervisado (SFT) mediante LoRA, técnica de bajo rango que congela los pesos originales y entrena matrices adicionales de baja dimensionalidad. El adaptador resultante se publica por separado en `Xerxes-28/AEGIS-Mini-V1-LoRA`, y los pesos fusionados se convirtieron posteriormente a GGUF con cuantización Q4_K_M.

Los datos de entrenamiento citados en la model card son `HuggingFaceH4/MATH-500` y `mrohith29/high-school-physics`, complementados con material propio sobre electrónica, drones y robótica. El autor indica que la mayor parte del corpus es teórico. No se especifica el número total de tokens de entrenamiento, la composición exacta del dataset ni si hubo fases de RLHF o DPO; la información disponible solo menciona SFT. Tampoco se detallan innovaciones técnicas adicionales más allá del propio proceso de fine-tuning con LoRA y la conversión a GGUF para inferencia en CPU y dispositivos móviles.

## Capacidades

- Generación de texto conversacional en inglés con formato de chat (chat template incluido en el GGUF).
- Explicación de conceptos de electrónica: ley de Ohm, filtros, polarización de transistores.
- Explicación de conceptos de drones y robótica: control PID, fusión de sensores.
- Resolución de cálculos paso a paso en matemáticas y física.
- Redacción de borradores de respuestas técnicas que el usuario debe verificar.
- Funcionamiento sin conexión a internet una vez descargado el archivo GGUF.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Estudio técnico sin conexión: el modelo permite consultar conceptos de electrónica y física desde un teléfono con PocketPal, sin necesidad de red, gracias a su tamaño de 2,5 GB en Q4_K_M y su contexto de 2.048 tokens, suficiente para preguntas y respuestas acotadas.
- Asistencia en docencia de física de bachillerato: dado que se entrenó con `mrohith29/high-school-physics`, puede generar explicaciones y ejercicios resueltos paso a paso para reforzar contenidos de nivel preuniversitario.
- Apoyo a aficionados a la robótica: útil para repasar la teoría del control PID o la fusión de sensores antes de implementar el código en un microcontrolador, siempre verificando los valores con la documentación del fabricante.
- Primer borrador de documentación técnica: el modelo puede redactar explicaciones introductorias sobre componentes y principios físicos que un ingeniero revisa y corrige antes de publicar.
- Entrenamiento de operadores de drones: puede generar cuestionarios teóricos sobre estabilidad, control y sensores para formación, con la advertencia de que las configuraciones de vuelo deben validarse en un entorno seguro.
- Despliegue en servidores pequeños o entornos de borde: al ser un GGUF de 2,5 GB compatible con llama.cpp y Ollama, puede integrarse en un servicio interno de consultas técnicas de baja latencia sin GPU dedicada.
- Prototipado de asistentes técnicos especializados: sirve como base para experimentar con RAG sobre manuales de electrónica, dado que su licencia Apache-2.0 permite modificaciones y uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente en la model card que no ejecutó benchmarks públicos y remite a las secciones de resultados y limitaciones antes de usar el modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el archivo Q4_K_M ocupa aproximadamente 2,5 GB, por lo que se necesita al menos esa cantidad de memoria libre (RAM o VRAM) más el espacio para el contexto.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cualquier GPU consumer con 4 GB o más de VRAM podría alojarlo; en CPU es viable con 4 GB de RAM libre.
- Compatibilidad con GPU consumer: sí, previsiblemente en tarjetas como RTX 3060, RTX 4060 o superiores, aunque no hay datos oficiales de rendimiento.
- Despliegue: llama.cpp, Ollama, LM Studio y PocketPal (móvil). Compatible con endpoints según los tags del repositorio.
- Almacenamiento: al menos 4 GB libres en el dispositivo según las instrucciones del autor para móviles.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| AEGIS-Mini-1.0-4B | ~4,0 B | 2.048 (entrenamiento) | Apache-2.0 | GGUF Q4_K_M | Fine-tuning de Qwen3-4B en electrónica, robótica, matemáticas y física; sin benchmarks publicados |
| Qwen3-4B (base) | ~4,0 B | No disponible en la información proporcionada | Apache-2.0 | Safetensors, GGUF | Modelo generalista de Alibaba; base del ajuste |
| Alternativas de ~4 B especializadas en técnico | No disponible | No disponible | No disponible | No disponible | No se dispone de datos verificables en la información proporcionada |

## Limitaciones y advertencias

- No usar como única fuente para cálculos de seguridad: el modelo puede dar una cifra errónea con tono seguro, con riesgo de lesiones o incendio.
- No emplear para decidir si un circuito de alta tensión o de red eléctrica es seguro; consultar siempre a una persona cualificada.
- Verificar cada valor en la hoja de datos del componente: un dato incorrecto puede dañar el componente, la batería o el dron.
- No volar un dron con ajustes sugeridos por el modelo sin probarlos antes en un lugar seguro.
- Riesgo de alucinación en datos exactos de datasheets (direcciones de registro, números de pin), que el autor excluye explícitamente del alcance.
- Contexto de entrenamiento limitado a 2.048 tokens, lo que restringe conversaciones largas y documentos extensos.
- Solo inglés: no se garantiza calidad en castellano ni en otros idiomas.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Uso comercial permitido por Apache-2.0, pero sin garantías del autor sobre exactitud técnica.
- El repositorio solo distribuye la cuantización Q4_K_M; no hay versiones de mayor precisión en este repositorio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Xerxes-28/AEGIS-Mini-1.0-4B-GGUF
- Adaptador LoRA: https://huggingface.co/Xerxes-28/AEGIS-Mini-V1-LoRA
- Modelo base: https://huggingface.co/unsloth/Qwen3-4B-unsloth-bnb-4bit
- Dataset MATH-500: https://huggingface.co/datasets/HuggingFaceH4/MATH-500
- Dataset de física de bachillerato: https://huggingface.co/datasets/mrohith29/high-school-physics
- Paper Qwen3 (arXiv:2505.09388): https://arxiv.org/abs/2505.09388
- Paper LoRA (arXiv:2106.09685): https://arxiv.org/abs/2106.09685
- Paper QLoRA (arXiv:2305.14314): https://arxiv.org/abs/2305.14314
- Paper GPTQ (arXiv:2210.17323, referenciado como 2110.02861 en los tags): https://arxiv.org/abs/2110.02861
- Paper Adam (arXiv:1711.05101): https://arxiv.org/abs/1711.05101
- Paper Layer Normalization (arXiv:1608.03983): https://arxiv.org/abs/1608.03983
- Paper sobre atención (arXiv:2103.03874): https://arxiv.org/abs/2103.03874
- Paper sobre decodificación (arXiv:2305.20050): https://arxiv.org/abs/2305.20050
