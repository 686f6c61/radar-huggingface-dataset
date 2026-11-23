# ubaidii123/medalign-sft

## Resumen

medalign-sft es un adaptador LoRA (PEFT) publicado por el usuario ubaidii123 sobre el modelo base Qwen/Qwen2.5-0.5B-Instruct. Se trata de un ajuste supervisado (SFT con LoRA vía TRL) orientado a preguntas y respuestas de dominio médico, presentado explícitamente por su autor como una demo educativa y no como una herramienta de consejo médico. El repositorio no contiene pesos completos, sino únicamente los tensores del adaptador en formato safetensors, por lo que requiere cargar el modelo base Qwen2.5-0.5B-Instruct para funcionar.

El interés de esta ficha es limitado desde el punto de vista de producción: el modelo base tiene 0,5 mil millones de parámetros, el adaptador no registra descargas ni likes, el tamaño del repositorio es de 0,0 GB y la model card no documenta idiomas, pipeline ni detalles del dataset de entrenamiento. Además, las puntuaciones publicadas en el golden set de 200 ítems muestran que el ajuste SFT empeora el resultado global respecto al modelo base (0,385 frente a 0,510), con caídas notables en MCQ (0,327 frente a 0,420) y en la métrica de seguridad "unsafe" (0,200 frente a 0,450, donde un valor más bajo indica peor comportamiento en esta escala tal como se reporta).

Aun así, el artefacto es relevante como ejemplo reproducible de un pipeline de alineación médica con SFT, PPO y GRPO sobre un modelo pequeño, con código publicado en GitHub. Sirve para estudiar cómo se comportan técnicas de RLHF/RL sobre un modelo de 0,5B en tareas de seguridad médica, más que como modelo listo para desplegar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Qwen2.5-0.5B-Instruct) con adaptador LoRA (PEFT) |
| Parametros totales | 0,5 mil millones en el modelo base; parametros del adaptador no disponibles |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-0.5B-Instruct) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA compatible con PEFT) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA entrenado con TRL sobre Qwen2.5-0.5B-Instruct, un transformer decoder-only de 0,5B parámetros. La model card indica que se aplicó supervised fine-tuning sobre un dataset de preguntas y respuestas médicas, pero no especifica el número de tokens, la composición del dataset, la configuración de LoRA (rango, alpha, módulos objetivo) ni la duración del entrenamiento. El repositorio incluye además variantes entrenadas con PPO y GRPO, según se deduce de la tabla de resultados comparativos, lo que sugiere un pipeline de alineación con SFT seguido de optimización por refuerzo.

La innovación técnica destacable no está en la arquitectura, sino en la evaluación: el autor define un golden set de 200 ítems compuesto por 150 preguntas de opción múltiple (MCQ), 30 de red-flag (detección de señales de alarma clínica) y 20 de seguridad (unsafe). No se documentan detalles sobre el proceso de anotación, la fuente de las preguntas ni los criterios exactos de cada métrica, lo que limita la interpretabilidad de los resultados.

## Capacidades

- Generación de texto y respuesta a preguntas de opción múltiple en dominio médico, según la evaluación del golden set.
- Detección de red flags clínicas (30 ítems del golden set), con una puntuación de 0,800 en la variante SFT.
- Clasificación de contenido inseguro o unsafe (20 ítems del golden set), con una puntuación de 0,200 en la variante SFT.
- Herencia de las capacidades del modelo base Qwen2.5-0.5B-Instruct, incluyendo generación de texto general e instrucciones, aunque no se documentan explícitamente en la model card.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingües: no disponible en la informacion proporcionada.
- Capacidades especiales (thinking mode, visión, audio): no disponible en la informacion proporcionada.

## Casos de uso

- Estudio de pipelines de alineación médica: el adaptador y el código asociado permiten reproducir un flujo SFT → PPO → GRPO sobre un modelo de 0,5B, útil para investigadores que quieran analizar cómo evolucionan las métricas de seguridad con cada técnica.
- Evaluación de seguridad en modelos pequeños: el golden set de 200 ítems (150 MCQ, 30 red-flag, 20 unsafe) sirve como banco de pruebas para medir la degradación de comportamientos seguros tras el fine-tuning, un fenómeno visible en los resultados publicados.
- Prototipado educativo de asistentes médicos: en entornos docentes, el adaptador puede ilustrar cómo un modelo de 0,5B responde a preguntas clínicas y dónde falla, sin riesgo de uso clínico real dado el aviso explícito del autor.
- Investigación sobre olvido catastrófico: la caída de MCQ de 0,420 a 0,327 tras el SFT es un caso concreto para estudiar la pérdida de capacidades del modelo base al especializar un adaptador LoRA.
- Comparación de métodos de RLHF: las variantes SFT, PPO y GRPO del repositorio permiten comparar el efecto de cada algoritmo sobre las mismas métricas de evaluación.
- Docencia sobre PEFT y TRL: el código de carga con `PeftModel.from_pretrained` y el repositorio de GitHub sirven como ejemplo mínimo de adaptador LoRA para formación en herramientas de Hugging Face.
- No recomendado para atención al cliente, generación de código en producción, agentes autónomos ni cualquier uso clínico real, dada la falta de datos de validación externa y el aviso del autor.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre un golden set de 200 ítems (150 MCQ, 30 red-flag, 20 unsafe). No se especifica la métrica exacta de cada columna (se asume exactitud o tasa de acierto); los valores se reproducen tal cual.

| Modelo | MCQ | Red flag | Unsafe | Overall |
|---|---|---|---|---|
| Base (Qwen2.5-0.5B-Instruct) | 0,420 | 1,000 | 0,450 | 0,510 |
| SFT (este adaptador) | 0,327 | 0,800 | 0,200 | 0,385 |
| PPO | 0,320 | 0,800 | 0,200 | 0,380 |
| GRPO | 0,380 | 0,900 | 0,200 | 0,440 |

No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los datos anteriores proceden exclusivamente del golden set del autor y no son comparables con evaluaciones externas.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 0,5B en fp16 ocupa aproximadamente 1 GB de pesos; en 8 bits, alrededor de 0,5 GB; en 4 bits, alrededor de 0,3 GB. El adaptador LoRA añade una sobrecarga mínima (parámetros del adaptador no disponibles).
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM es suficiente para el modelo base en fp16; una RTX 3060, RTX 4060 o superior bastan. Para despliegues con mayor concurrencia, una T4 o L4 son adecuadas; A100/H100 no son necesarias para este tamaño.
- Cabe en GPU consumer: sí, en cualquier GPU con 4 GB o más de VRAM, incluidas GTX 1650, RTX 3050, RTX 4060 y superiores.
- Opciones de despliegue: carga mediante `transformers` + `peft` (como indica la model card); el adaptador puede fusionarse con el modelo base y exportarse a GGUF para llama.cpp u Ollama, o servirse con vLLM o TGI tras la fusión, aunque no se documenta ninguno de estos flujos en el repositorio.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| medalign-sft (este) | 0,5B (base) + LoRA | no disponible | SFT médico sobre Qwen2.5-0.5B | apache-2.0 | Hugging Face, 0 descargas |
| Qwen2.5-0.5B-Instruct | 0,5B | no disponible en la informacion proporcionada | Modelo instructivo general | apache-2.0 | Hugging Face, ampliamente usado |
| Variantes PPO y GRPO del mismo autor | 0,5B (base) + LoRA | no disponible | RLHF médico | apache-2.0 | Incluidas en el mismo repositorio de código |

No se dispone de información sobre otros adaptadores médicos comparables en la búsqueda realizada; la comparativa se limita al modelo base y a las variantes del mismo autor.

## Limitaciones y advertencias

- El autor declara explícitamente que es una demo educativa y no constituye consejo médico; no debe usarse para decisiones clínicas.
- El ajuste SFT empeora el resultado global frente al modelo base (0,385 frente a 0,510) y reduce la puntuación de MCQ (0,327 frente a 0,420), lo que indica pérdida de capacidades tras el fine-tuning.
- La métrica "unsafe" cae de 0,450 en el base a 0,200 en SFT, PPO y GRPO, lo que sugiere un deterioro del comportamiento seguro según la escala reportada por el autor.
- El golden set es pequeño (200 ítems) y de composición interna; no se documenta su procedencia, anotación ni criterios de evaluación, por lo que los resultados tienen validez limitada.
- No se documentan sesgos conocidos, riesgos de alucinación específicos ni limitaciones idiomáticas más allá de las inherentes al modelo base.
- El repositorio tiene 0 descargas y 0 likes, sin validación externa por parte de la comunidad.
- El tamaño del repositorio es de 0,0 GB y no contiene pesos completos; requiere descargar el modelo base por separado.
- Licencia apache-2.0 permite uso comercial del adaptador, pero el uso comercial en contexto médico exige validación adicional y cumplimiento normativo (por ejemplo, MDR en la UE), no cubierto por la licencia.
- No hay información sobre el dataset de entrenamiento, lo que impide evaluar la calidad, cobertura o posibles contaminaciones de los datos.

## Enlaces

- Hugging Face: https://huggingface.co/ubaidii123/medalign-sft
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Código del proyecto: https://github.com/ubaidur404786/medalign-rl
