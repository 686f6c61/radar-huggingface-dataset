# suunny/qwen35-terminal-agent-rl

## Resumen

Qwen3.5 terminal-agent RL es un adaptador LoRA experimental publicado por el usuario suunny (SUSINDRAREDDY) sobre el modelo base Qwen/Qwen3.5-9B. No se trata de un modelo completo, sino de un adaptador PEFT de rango 16 y alpha 32 entrenado mediante aprendizaje por refuerzo (Prime RL) sobre 80 tareas del conjunto TermGrade, orientadas a la operación de agentes en terminal. El objetivo declarado es mejorar el comportamiento de un agente de terminal, un dominio donde el razonamiento multi-paso, la ejecución de comandos y la interpretación de salidas son críticos.

El entrenamiento se realizó en Modal con un trainer H100 y dos workers de inferencia H100, con diez actualizaciones y 640 episodios aceptados, a una tasa de aprendizaje de 1e-5. El propio autor reconoce que el resultado en el conjunto de validación no demuestra mejora: 83/184 aciertos frente a 91/184 del modelo base. Se trata, por tanto, de un artefacto de investigación para validar la configuración del pipeline de RL, no de una recomendación de producción.

La relevancia de esta ficha es doble: por un lado, documenta un caso real de RL aplicado a agentes de terminal sobre un modelo de 9B; por otro, sirve como ejemplo de publicación transparente de resultados negativos, algo poco habitual en el ecosistema. El adaptador se distribuye bajo licencia Apache 2.0 y ocupa 0,1 GB en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Qwen3.5-9B; rango 16, alpha 32 |
| Parametros totales | no disponible (adaptador LoRA; el base es de 9B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.5-9B) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del base) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3.5-9B, un transformer denso de 9.000 millones de parámetros del que esta ficha no dispone de detalles arquitectónicos adicionales (número de capas, atención, contexto nativo) más allá de lo indicado por el autor. El adaptador LoRA tiene rango 16 y alpha 32, y se entrena con Prime RL, un framework de aprendizaje por refuerzo, sobre 80 tareas del conjunto TermGrade. El proceso consta de diez actualizaciones con 640 episodios aceptados y una tasa de aprendizaje de 1e-5.

La infraestructura empleada fue Modal, con un nodo de entrenamiento H100 y dos workers de inferencia H100. El autor indica que la ruta del modelo base en el adaptador se normalizó desde la ruta del volumen de entrenamiento al ID público del Hub, sin modificar los bytes de los pesos, y que los checkpoints completos del optimizador se excluyeron de la publicación. La validación del release se limitó a comprobar la configuración, el SHA-256 y los 256 tensores finitos en CPU, sin ejecutar inferencia nueva. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto y razonamiento heredados del modelo base Qwen3.5-9B, sin que el adaptador añada capacidades nuevas fuera del dominio de terminal.
- Ejecución de tareas de agente en terminal: interpretación de comandos, ejecución y lectura de salidas, orientado por el entrenamiento en TermGrade.
- Razonamiento multi-paso en entornos de línea de comandos, según el dominio de entrenamiento declarado.
- Soporte de tool calling y function calling: no disponible en la información proporcionada para este adaptador; depende del base.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Investigación en RL para agentes: el adaptador sirve como punto de partida reproducible para estudiar cómo el RL afecta al comportamiento de un agente de terminal sobre Qwen3.5-9B, con configuración, dataset y código publicados.
- Reproducción de experimentos: permite replicar el pipeline de Prime RL con las 80 tareas de TermGrade y comparar curvas de entrenamiento frente al base.
- Evaluación de metodologías de RL: útil para analizar por qué un run con 640 episodios aceptados no supera al base (83/184 frente a 91/184), informando decisiones de diseño en futuros entrenamientos.
- Automatización de tareas de terminal en entornos controlados: experimentación con agentes que ejecutan comandos y verifican resultados, siempre en sandbox y sin uso en producción.
- Estudio de adaptadores de bajo rango: con rango 16 y alpha 32, permite medir el impacto de la capacidad del adaptador en tareas de agente.
- Docencia y formación: ejemplo práctico de publicación de un artefacto de investigación con resultados negativos y validación limitada, útil para enseñar buenas prácticas de transparencia.

## Benchmarks y rendimiento

| Conjunto | Modelo base | Adaptador | Diferencia |
|---|---|---|---|
| Held-out TermGrade (23 tareas, 8 intentos) | 91/184 | 83/184 | -8 aciertos |

El autor señala que la evaluación se realizó con GPUs distintas para el base y el final (H200 y H100 respectivamente), lo que introduce un factor de confusión en la comparación. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible para el adaptador en sí; depende del modelo base Qwen3.5-9B y de su cuantización. Como referencia orientativa, un modelo denso de 9B en FP16 requiere del orden de 18 GB solo para pesos, más KV cache y overhead.
- GPU recomendadas: el autor empleó H100 para entrenamiento e inferencia; H200 para la evaluación del base. Para inferencia del base en FP16 son adecuadas A100 80 GB o H100.
- GPU de consumo: no confirmado en la información disponible; un 9B en cuantizaciones de 4-8 bits podría caber en GPUs con 12-24 GB, pero no se aportan datos específicos.
- Despliegue: PEFT con `PeftModel.from_pretrained(base_model, "suunny/qwen35-terminal-agent-rl")`, cargando el base en la revisión `c202236235762e1c871ad0ccb60c8ee5ba337b9a`. No se documentan opciones con vLLM, llama.cpp, Ollama o TGI para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-9B (base) | 9B | no disponible | 91/184 en TermGrade held-out | no disponible en esta ficha | Hub |
| Qwen3.5 terminal-agent RL (este) | 9B + LoRA r16 | no disponible | 83/184 en TermGrade held-out | apache-2.0 | Hub (adaptador) |
| Alternativas de agente de terminal | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros adaptadores o modelos comparables de agentes de terminal en la documentación proporcionada.

## Limitaciones y advertencias

- Resultado negativo: el adaptador no supera al modelo base en el conjunto held-out (83/184 frente a 91/184), por lo que no debe presentarse como una mejora.
- Artefacto de investigación: el autor lo describe explícitamente como no recomendado para producción.
- Validación limitada: solo se comprobó configuración, SHA-256 y tensores finitos en CPU; no se ejecutó inferencia nueva durante la validación del release.
- Confusión en la evaluación: el base y el adaptador se evaluaron en GPUs distintas (H200 y H100), lo que puede afectar a la comparación.
- Dependencia del base: requiere cargar Qwen3.5-9B en la revisión exacta indicada y seguir sus requisitos de carga; no es un modelo autónomo.
- Sesgos y alucinación: no documentados para este adaptador; hereda los del modelo base, que no se detallan en la información disponible.
- Idiomas y contexto: no disponibles; dependen del base.
- Licencia: Apache 2.0 permite uso comercial del adaptador, pero el uso del base queda sujeto a su propia licencia, no detallada aquí.
- Exclusiones: los checkpoints completos del optimizador no se publican, lo que limita la reanudación exacta del entrenamiento.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/suunny/qwen35-terminal-agent-rl
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Blog del autor: https://susindrar.com/blog/terminal-agent-rl
- Código: https://github.com/SUSINDRAREDDY/terminal-agent-rl
- Dataset: https://huggingface.co/datasets/suunny/terminal-agent-rl
