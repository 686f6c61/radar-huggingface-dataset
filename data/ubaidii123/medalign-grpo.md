# ubaidii123/medalign-grpo

## Resumen

Medalign-grpo es un adaptador LoRA publicado por el usuario ubaidii123 sobre el modelo base Qwen/Qwen2.5-0.5B-Instruct. Se trata de un experimento de alineación mediante GRPO (Group Relative Policy Optimization) aplicado sobre una fase previa de SFT (supervised fine-tuning), orientado a respuestas de dominio médico. El autor lo presenta explícitamente como una demo educativa y no como una herramienta de consejo médico.

El modelo no es un modelo completo, sino un conjunto de pesos de adaptador en formato PEFT/safetensors que requiere cargar el base Qwen2.5-0.5B-Instruct para funcionar. Con 0,5 mil millones de parámetros en el base, es un modelo muy pequeño, pensado para validar pipelines de RLHF con recompensas basadas en reglas (sin reward model) en lugar de para despliegue en producción.

Su relevancia es metodológica más que de rendimiento: documenta una comparativa entre base, SFT, PPO y GRPO sobre un golden set de 200 ítems (150 MCQ, 30 red-flag y 20 unsafe), y en esa comparativa el adaptador GRPO no supera al modelo base en la métrica global (0,440 frente a 0,510). Es útil como referencia reproducible de un pipeline TRL/GRPO sobre un modelo pequeño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptador LoRA (PEFT) |
| Parametros totales | 0,5 mil millones en el modelo base; el adaptador LoRA no declara su número de parámetros |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el base Qwen2.5-0.5B-Instruct soporta hasta 32 768 tokens, según la documentación del modelo base) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantización depende del base) |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA), requiere el base Qwen/Qwen2.5-0.5B-Instruct |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-0.5B-Instruct, un transformer decoder-only de 0,5 mil millones de parámetros. El entrenamiento descrito en la model card es una cadena de SFT seguida de GRPO (Group Relative Policy Optimization) implementado con la librería TRL. La innovación declarada es el uso de recompensas basadas en reglas, sin reward model aprendido, lo que simplifica el pipeline de RL y evita el coste de entrenar y mantener un modelo de recompensa.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, la configuración de hiperparámetros del GRPO (tamaño de grupo, KL, etc.) ni detalles sobre el conjunto de datos médico empleado. La evaluación se realiza sobre un golden set de 200 ítems con tres subconjuntos: 150 preguntas de opción múltiple (MCQ), 30 casos de red-flag (señales de alarma clínica) y 20 casos unsafe (peticiones inseguras).

## Capacidades

- Generación de texto y respuesta a preguntas de opción múltiple en dominio médico, heredadas del base Qwen2.5-0.5B-Instruct y ajustadas con SFT y GRPO.
- Detección y manejo de red-flags clínicos: el adaptador obtiene 0,900 en el subconjunto red_flag del golden set.
- Rechazo de peticiones inseguras: 0,200 en el subconjunto unsafe, lo que indica una capacidad de rechazo limitada.
- Razonamiento multi-turno y conversacional: limitado por el tamaño del base (0,5B) y por la ausencia de datos específicos en la model card.
- Soporte de tool calling / function calling: no disponible en la información proporcionada; el base Qwen2.5-0.5B-Instruct lo soporta, pero el adaptador no documenta su preservación.
- Capacidades multilingües: no disponibles; no se declaran idiomas en la model card.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Investigación reproducible de RLHF: el adaptador sirve para replicar un pipeline SFT + GRPO con recompensas basadas en reglas sobre un modelo de 0,5B, comparando contra PPO y contra el base con el mismo golden set de 200 ítems.
- Evaluación de alineación en dominio médico: permite medir la degradación o mejora en MCQ, red-flag y unsafe tras cada etapa de entrenamiento, como muestra la tabla comparativa del autor.
- Docencia y formación en ajuste fino: al ser un LoRA sobre un modelo pequeño, se puede cargar en una GPU de consumo y estudiar el efecto del GRPO sobre las respuestas.
- Prototipado de asistentes de triaje de bajo coste: el subconjunto red_flag (0,900) sugiere utilidad como filtro preliminar de señales de alarma, siempre con supervisión humana y sin uso clínico.
- Pruebas de pipelines TRL/PEFT: sirve como caso de prueba para integraciones con `peft.PeftModel` y `transformers` en entornos de CI.
- Benchmark de robustez frente a peticiones inseguras: el bajo resultado en unsafe (0,200) lo convierte en un caso de estudio de fallo de alineación y de necesidad de filtros adicionales.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre el golden set de 200 ítems (150 MCQ, 30 red-flag, 20 unsafe):

| Modelo | MCQ | Red flag | Unsafe | Overall |
|---|---|---|---|---|
| base | 0,420 | 1,000 | 0,450 | 0,510 |
| sft | 0,327 | 0,800 | 0,200 | 0,385 |
| ppo | 0,320 | 0,800 | 0,200 | 0,380 |
| grpo | 0,380 | 0,900 | 0,200 | 0,440 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el base de 0,5B en fp16 ocupa aproximadamente 1 GB de pesos; con el adaptador LoRA el consumo adicional es mínimo (decenas de MB). En cuantización de 4 bits, el base puede ocupar menos de 0,5 GB.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente; RTX 3060, RTX 4060, RTX 4090, A100 o H100 funcionan sin problema, aunque las GPU de datacenter están sobredimensionadas para este tamaño.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna (GTX 1650 en adelante, con cuantización incluso en CPU).
- Opciones de despliegue: `transformers` + `peft` (carga del adaptador mediante `PeftModel.from_pretrained`), y previsiblemente llama.cpp u Ollama tras fusionar el adaptador con el base y convertir a GGUF; vLLM y TGI requerirían fusión previa del LoRA.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| medalign-grpo (este) | 0,5B (base) + LoRA | no disponible | SFT + GRPO con recompensas por reglas, dominio médico | apache-2.0 | Hugging Face, 0 descargas |
| Qwen2.5-0.5B-Instruct (base) | 0,5B | 32 768 tokens (según doc. del base) | Instruct generalista | apache-2.0 | Ampliamente disponible |
| Adaptadores médicos LoRA sobre modelos pequeños | variable | variable | SFT/DPO en dominio sanitario | variable | Depende del autor |

No se dispone de información sobre otros adaptadores comparables en la documentación proporcionada; la comparativa se limita al modelo base y a las variantes SFT y PPO del propio autor incluidas en la tabla de benchmarks.

## Limitaciones y advertencias

- El propio autor declara que es una demo educativa y no constituye consejo médico; no debe usarse en entornos clínicos ni para decisiones sobre pacientes.
- El adaptador GRPO empeora el rendimiento global respecto al base (0,440 frente a 0,510) y reduce drásticamente la métrica unsafe (0,200 frente a 0,450), lo que indica una regresión en seguridad tras el ajuste.
- El modelo base es de 0,5B parámetros, con capacidad limitada de razonamiento, conocimiento factual y manejo de contextos largos.
- Riesgo elevado de alucinación en contenido médico, agravado por el tamaño reducido del base.
- No se declaran idiomas soportados; el comportamiento multilingüe es incierto.
- No hay información sobre sesgos demográficos o clínicos del adaptador.
- La licencia apache-2.0 permite uso comercial, pero el uso clínico o sanitario real queda fuera del alcance previsto por el autor y requeriría validación regulatoria independiente.
- El repositorio tiene 0 descargas y 0 likes, sin señales de validación por parte de la comunidad; el tamaño del repo es de 0,0 GB, lo que sugiere que los pesos pueden no estar completamente subidos o son muy reducidos.
- No se documentan hiperparámetros, dataset ni proceso de evaluación más allá de la tabla del golden set, lo que dificulta la reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ubaidii123/medalign-grpo
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Código del proyecto: https://github.com/ubaidur404786/medalign-rl
