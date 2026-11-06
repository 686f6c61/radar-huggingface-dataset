# Xerxes-28/AEGIS-Mini-V1-GGUF

## Resumen

AEGIS-Mini-V1 es un ajuste fino supervisado (SFT) del modelo Qwen3-4B, desarrollado por el usuario independiente Xerxes-28 y especializado en dominios de ingeniería: electrónica, robótica, drones, matemáticas y física. El modelo base es la copia cuantizada a 4 bits `unsloth/Qwen3-4B-unsloth-bnb-4bit`, sobre la que se aplicó un adaptador LoRA entrenado con datos mayoritariamente teóricos. Esta ficha cubre la distribución en formato GGUF, concretamente la cuantización Q4_K_M, pensada para ejecución local en dispositivos de recursos limitados.

El modelo resuelve el problema de disponer de un asistente técnico de dominio específico que funcione sin conexión en teléfonos, portátiles y servidores pequeños. Con aproximadamente 4.022 millones de parámetros y un archivo de unos 2,5 GB, está diseñado para integrarse en herramientas como PocketPal, llama.cpp, Ollama y LM Studio. La longitud de contexto usada durante el entrenamiento fue de 2.048 tokens.

Es relevante ahora porque demuestra el patrón de especialización vertical sobre modelos pequeños de la familia Qwen3, con licencia Apache-2.0 y despliegue en hardware de consumo. El autor advierte explícitamente de que no se ejecutaron benchmarks públicos, por lo que la evaluación de calidad debe hacerse de forma empírica antes de cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only (base Qwen3-4B), ajuste fino con LoRA |
| Parametros totales | 4.022.468.096 (aprox. 4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens (longitud de entrenamiento); longitud nativa del base no disponible en la informacion |
| Tipos de cuantizacion | Q4_K_M (unico archivo publicado en este repo) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (contiene pesos, tokenizer y chat template) |

## Arquitectura y entrenamiento

El modelo es un transformer causal decoder-only derivado de Qwen3-4B. El autor partió de la versión cuantizada a 4 bits de Unsloth y aplicó un ajuste fino supervisado (SFT) mediante LoRA, técnica descrita en los papers referenciados (arXiv:2106.09685). El adaptador LoRA se publica por separado en `Xerxes-28/AEGIS-Mini-V1-LoRA`. El entrenamiento se realizó con una longitud de contexto de 2.048 tokens y una fecha declarada de 2026-10-31.

Los datos de entrenamiento combinan conjuntos de matemáticas (`HuggingFaceH4/MATH-500`) y física de secundaria (`mrohith29/high-school-physics`), complementados con material sobre electrónica, robótica y drones. El autor indica que la mayor parte del corpus es teórico, sin especificar el número total de tokens ni la composición exacta del dataset. No se documenta uso de RLHF ni DPO; el procedimiento declarado es exclusivamente SFT. La model card referencia además los papers de AdamW (arXiv:1711.05101), layer normalization (arXiv:1608.03983), atención eficiente (arXiv:2505.09388) y técnicas de cuantización y evaluación (arXiv:2305.20050, arXiv:2305.14314, arXiv:2110.02861, arXiv:2103.03874), aunque no se detalla qué innovaciones concretas se aplicaron más allá del pipeline estándar de Unsloth.

## Capacidades

- Generación de texto conversacional en inglés con formato de chat (chat template incluido en el GGUF).
- Explicación de conceptos de electrónica: ley de Ohm, filtros, polarización de transistores.
- Explicación de conceptos de robótica y drones: control PID, fusión de sensores.
- Resolución de cálculos paso a paso en matemáticas y física.
- Generación de borradores de respuestas técnicas sujetas a verificación posterior.
- Estudio y aprendizaje sin conexión a internet.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado; el entrenamiento SFT no lo menciona.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Tutoría técnica offline en electrónica: el modelo explica conceptos como la ley de Ohm o la polarización de transistores en un teléfono con PocketPal, sin conexión, útil en entornos de taller o aula sin red.
- Asistencia en el diseño preliminar de circuitos: genera borradores de cálculos y explicaciones que el ingeniero contrasta después con la hoja de datos del componente, aprovechando su especialización teórica.
- Soporte educativo en física de secundaria: resuelve ejercicios paso a paso a partir del dataset de física de nivel escolar con el que fue entrenado.
- Ajuste de controladores PID en robótica y drones: ofrece explicaciones de sintonización y razonamiento sobre fusión de sensores como punto de partida, siempre con validación en banco de pruebas.
- Estudio de matemáticas aplicadas: resuelve problemas de cálculo y álgebra con razonamiento encadenado, adecuado para autoaprendizaje en portátil.
- Despliegue en servidores pequeños o edge: al ocupar unos 2,5 GB en Q4_K_M, puede servirse con llama.cpp u Ollama en una máquina modesta para dar soporte a un equipo reducido de ingeniería.
- Prototipado de asistentes técnicos verticales: sirve como base para experimentar con fine-tuning adicional sobre dominios de hardware, dado que el adaptador LoRA está publicado por separado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente en la model card que no ejecutó benchmarks públicos y remite a las secciones de resultados y limitaciones antes de usar el modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5-3 GB con la cuantización Q4_K_M (tamaño del archivo 2,5 GB más overhead de contexto y KV cache).
- GPU recomendadas: no especificadas por el autor; por tamaño, cualquier GPU con 4 GB o más de VRAM es suficiente.
- Cabe en GPU de consumo: sí, en tarjetas con 4 GB o más (por ejemplo, GTX 1650, RTX 3050 en adelante); también en CPU.
- Despliegue en teléfono: soportado vía PocketPal, con requisito de al menos 4 GB de almacenamiento libre según la model card.
- Opciones de despliegue: PocketPal, llama.cpp, Ollama, LM Studio.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| AEGIS-Mini-V1 (Q4_K_M) | ~4B | 2.048 (entrenamiento) | Apache-2.0 | GGUF | Especializado en electrónica, robótica, drones, matemáticas y física; sin benchmarks publicados |
| Qwen3-4B (base) | ~4B | no disponible en la informacion | Apache-2.0 | safetensors, GGUF (vías oficiales) | Modelo generalista; AEGIS deriva de su versión cuantizada de Unsloth |
| Modelos generalistas de ~4B de otras familias | ~3-4B | variable | variable | variable | No se dispone de datos comparativos de rendimiento en la información proporcionada |

No se dispone de resultados de benchmarks que permitan una comparación cuantitativa con alternativas. La comparación se limita a parámetros, licencia y formato.

## Limitaciones y advertencias

- El autor no publicó benchmarks; no hay evidencia cuantitativa de calidad frente al modelo base ni frente a alternativas.
- Riesgo alto de alucinación en valores numéricos: la model card advierte que el modelo puede dar una cifra incorrecta con tono seguro, peligroso en cálculos de seguridad eléctrica.
- No debe usarse para decisiones críticas de seguridad, valores finales de diseño de circuitos, baterías o aeronaves, ni como única fuente en cálculos de seguridad.
- No apto para consejo médico, legal o financiero.
- No fiable para datos exactos de hojas de datos (direcciones de registro, numeración de pines).
- Contexto de entrenamiento corto (2.048 tokens), lo que limita conversaciones largas y documentos extensos.
- Solo inglés; sin capacidades multilingües declaradas.
- Entrenamiento mayoritariamente teórico, sin datos procedentes de documentación real de componentes.
- Advertencias específicas: no manipular tensión de red o alta tensión basándose en la salida del modelo; validar ajustes de drones en un entorno seguro antes de volar.
- Licencia Apache-2.0, permisiva para uso comercial, pero hereda las limitaciones del modelo base y del ajuste fino.
- Modelo de autor independiente con 99 descargas y 0 likes en el momento de la consulta: ecosistema de soporte y validación muy limitado.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/Xerxes-28/AEGIS-Mini-V1-GGUF
- Adaptador LoRA: https://huggingface.co/Xerxes-28/AEGIS-Mini-V1-LoRA
- Modelo base: https://huggingface.co/unsloth/Qwen3-4B-unsloth-bnb-4bit
- Dataset de matemáticas: https://huggingface.co/datasets/HuggingFaceH4/MATH-500
- Dataset de física: https://huggingface.co/datasets/mrohith29/high-school-physics
- Paper LoRA (arXiv:2106.09685): https://arxiv.org/abs/2106.09685
- Paper QLoRA (arXiv:2305.14314): https://arxiv.org/abs/2305.14314
- Paper AdamW (arXiv:1711.05101): https://arxiv.org/abs/1711.05101
- Paper Layer Normalization (arXiv:1608.03983): https://arxiv.org/abs/1608.03983
- Paper GPTQ (arXiv:2305.20050): https://arxiv.org/abs/2305.20050
- Paper AWQ (arXiv:2305.14314): https://arxiv.org/abs/2305.14314
- Paper sobre atención eficiente (arXiv:2505.09388): https://arxiv.org/abs/2505.09388
- Paper sobre entrenamiento de bajo rango (arXiv:2110.02861): https://arxiv.org/abs/2110.02861
- Paper de referencia (arXiv:2103.03874): https://arxiv.org/abs/2103.03874
