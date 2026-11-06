# Xerxes-28/AEGIS-Mini-V1-LoRA

## Resumen

AEGIS-Mini-V1-LoRA es un adaptador LoRA (PEFT) entrenado mediante QLoRA sobre el modelo base Qwen3-4B, en su variante cuantizada a 4 bits de Unsloth. Lo desarrolla el usuario independiente Xerxes-28 y está especializado en dominios técnicos concretos: electrónica, drones, robótica, matemáticas y física. El adaptador añade 33.030.144 parámetros entrenables, un 0,81 % de los 4.055.498.240 parámetros del modelo base, y se distribuye como pesos safetensors de PEFT en un repositorio de 0,1 GB.

El modelo resuelve el problema de adaptar un LLM pequeño y de propósito general a un asistente técnico de bolsillo: al heredar la arquitectura Qwen3 de 4B parámetros, puede ejecutarse en teléfonos y portátiles tras conversión a GGUF, que el autor publica en un repositorio separado. La mayoría de los datos de entrenamiento son teoría, y el propio autor advierte que no ha ejecutado benchmarks públicos, por lo que la ficha debe leerse como una evaluación cualitativa y no como una validación empírica de rendimiento.

Es relevante ahora porque ejemplifica una tendencia práctica: adaptadores de bajo rango de coste reducido que especializan modelos compactos en nichos de ingeniería, con licencia Apache-2.0 y despliegue viable en hardware de consumo. La fecha de creación del repositorio es 2026-10-31 y el adaptador se entrenó ese mismo día con una longitud de contexto de entrenamiento de 2.048 tokens.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer causal Qwen3-4B |
| Parámetros totales | 4.055.498.240 (modelo base); 33.030.144 entrenables en el adaptador (0,81 %) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens en entrenamiento; contexto nativo del base no disponible en la información |
| Tipos de cuantización | QLoRA 4-bit (bnb-4bit) en entrenamiento; GGUF disponible en repositorio aparte |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); GGUF en `Xerxes-28/AEGIS-Mini-V1-GGUF` |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-4B, un transformer causal denso de 4.055.498.240 parámetros. El entrenamiento emplea QLoRA: el modelo base se carga cuantizado a 4 bits con bitsandbytes y se entrenan matrices de bajo rango sobre las capas del transformer, con 33.030.144 parámetros entrenables. La longitud de contexto durante el entrenamiento fue de 2.048 tokens, inferior al contexto nativo del modelo base, lo que limita la exposición del adaptador a secuencias largas.

El método es SFT (supervised fine-tuning) con las librerías TRL y Unsloth. Los datasets declarados son HuggingFaceH4/MATH-500 y mrohith29/high-school-physics, orientados a matemáticas y física de nivel secundario. La model card no detalla el número total de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF o DPO; esos datos figuran como no disponibles. La especialización en electrónica, drones y robótica se declara en la model card, pero no se documenta qué corpus adicional se usó para esas áreas.

## Capacidades

- Generación de texto conversacional en inglés con formato de chat (roles system/user/assistant).
- Explicación de conceptos de electrónica: ley de Ohm, filtros, polarización de transistores.
- Explicación de conceptos de drones y robótica: control PID, fusión de sensores.
- Cálculo paso a paso en matemáticas y física, con instrucción explícita de mostrar unidades.
- Borradores de respuesta para revisión posterior por parte del usuario.
- Soporte de estudio y práctica guiada.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso autónomo.
- No se documenta visión, audio ni modo thinking explícito.
- Capacidad multilingüe limitada al inglés según la model card.

## Casos de uso

- Asistencia de estudio en electrónica: el modelo explica la ley de Ohm, el diseño de filtros RC o la polarización de un transistor, mostrando la fórmula y los pasos con unidades. Es adecuado por su ajuste específico en teoría de electrónica y su bajo coste de ejecución.
- Cálculo guiado de ejercicios de física: resuelve problemas de cinemática, circuitos o energía paso a paso, útil como corrector de borradores en un aula o en autoaprendizaje.
- Apoyo a aficionados a drones: explica el ajuste de un lazo PID y la fusión de sensores (IMU, barómetro) como punto de partida teórico antes de probar en un banco de pruebas.
- Tutor de robótica para principiantes: describe conceptos de control y sensórica, con la advertencia de verificar cada valor en la hoja de datos del componente.
- Despliegue en dispositivo móvil: gracias al GGUF del repositorio hermano, puede ejecutarse en un teléfono para consultas técnicas sin conexión, con latencia dependiente del hardware no documentada.
- Generación de borradores técnicos: produce una primera versión de una explicación o de un procedimiento que un ingeniero revisa y corrige antes de publicar.
- Práctica de examen: genera preguntas y soluciones de matemáticas y física de nivel secundario a partir de los datasets de entrenamiento declarados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente en la model card que no ejecutó benchmarks públicos y remite a las secciones de resultados y limitaciones antes de usar el modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador en sí ocupa 0,1 GB; el modelo base en 4 bits requiere aproximadamente 2,5-3 GB de VRAM, y en precisión completa (fp16) en torno a 8 GB (estimación a partir del tamaño de parámetros, no documentada por el autor).
- GPU recomendadas: no documentadas. Por tamaño, una RTX 3060 de 12 GB o superior permite cargar el base en 4 bits con holgura; A100 y H100 son sobredimensionadas para este modelo.
- Cabe en GPU de consumo: sí, en tarjetas con 6-8 GB o más en cuantización 4 bits.
- Opciones de despliegue: Unsloth (`FastLanguageModel`), Transformers + PEFT + bitsandbytes + accelerate, y llama.cpp/Ollama mediante el GGUF del repositorio `Xerxes-28/AEGIS-Mini-V1-GGUF`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AEGIS-Mini-V1-LoRA | 4B base + 33M adaptador | 2.048 en entrenamiento | Electrónica, drones, robótica, matemáticas, física | Apache-2.0 | Hugging Face (adaptador y GGUF) |
| Qwen3-4B (base) | 4B | no disponible en la información | Propósito general | Apache-2.0 | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de otros adaptadores equivalentes en la información proporcionada para establecer una comparación cuantitativa con modelos de la misma categoría.

## Limitaciones y advertencias

- El autor advierte explícitamente de que el modelo puede dar un número incorrecto con tono seguro; no debe usarse como única fuente en cálculos de seguridad.
- Prohibido su uso para decisiones críticas de seguridad, valores finales de diseño de circuitos, baterías o aeronaves, y para consejo médico, legal o financiero.
- No debe usarse para obtener datos exactos de hojas de datos, como direcciones de registro o números de pin.
- Riesgo de alucinación en valores numéricos y especificaciones de componentes; verificar siempre en la hoja de datos del fabricante.
- Solo soporta inglés según la model card; no se documenta calidad en castellano.
- Contexto de entrenamiento limitado a 2.048 tokens, lo que restringe el rendimiento en conversaciones o documentos largos.
- Sin benchmarks públicos que validen la especialización declarada en electrónica, drones y robótica.
- Licencia Apache-2.0 permite uso comercial, pero se heredan las condiciones del modelo base Qwen3-4B.
- No se documentan sesgos específicos; al ser un ajuste sobre Qwen3, puede heredar los sesgos del corpus original.
- No apto para pilotar drones con ajustes sugeridos por el modelo sin pruebas previas en un entorno seguro.

## Enlaces

- Repositorio del adaptador en Hugging Face: https://huggingface.co/Xerxes-28/AEGIS-Mini-V1-LoRA
- Repositorio GGUF: https://huggingface.co/Xerxes-28/AEGIS-Mini-V1-GGUF
- Modelo base: https://huggingface.co/unsloth/Qwen3-4B-unsloth-bnb-4bit
- Dataset MATH-500: https://huggingface.co/datasets/HuggingFaceH4/MATH-500
- Dataset high-school-physics: https://huggingface.co/datasets/mrohith29/high-school-physics
- Paper Qwen3 (arXiv:2505.09388): https://arxiv.org/abs/2505.09388
- Paper LoRA (arXiv:2106.09685): https://arxiv.org/abs/2106.09685
- Paper QLoRA (arXiv:2305.14314): https://arxiv.org/abs/2305.14314
- Paper DPO (arXiv:2305.20050): https://arxiv.org/abs/2305.20050
- Paper Adam (arXiv:1711.05101): https://arxiv.org/abs/1711.05101
- Paper Layer Normalization (arXiv:1608.03983): https://arxiv.org/abs/1608.03983
- Paper AdamW (arXiv:1711.05101): https://arxiv.org/abs/1711.05101
