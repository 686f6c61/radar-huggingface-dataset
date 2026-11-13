# vgandhi13/Qwen2.5-3B-Interphyre-GRPO-Skilled-TwoBodyProblem

## Resumen

Qwen2.5-3B-Interphyre-GRPO-Skilled-TwoBodyProblem es un ajuste fino del modelo Qwen/Qwen2.5-3B-Instruct realizado por el usuario vgandhi13 mediante aprendizaje por refuerzo con GRPO (Group Relative Policy Optimization). El entrenamiento se llevó a cabo sobre el entorno de puzles de física Interphyre, concretamente en el nivel `two_body_problem`, con el objetivo de que el modelo aprenda a resolver tareas de razonamiento físico interactuando con herramientas de simulación. Se trata, por tanto, de un modelo especializado y experimental, no de un modelo de propósito general.

La arquitectura subyacente es la del transformer decoder-only de Qwen2.5-3B-Instruct, con 3.397.103.616 parámetros totales y pesos en formato safetensors. La innovación del ajuste no reside en la arquitectura, sino en el procedimiento de entrenamiento: se antepone un banco estático de habilidades (skill bank) al prompt de sistema en el momento de generar los datos, y ese banco permanece fijo durante el entrenamiento con GRPO. El modelo opera dentro del bucle ReAct de Interphyre, llamando iterativamente a herramientas del simulador para colocar una bola que cumpla el objetivo del nivel.

Su relevancia es acotada pero interesante para investigación: demuestra cómo el RL con recompensas verificables sobre entornos de simulación puede especializar un modelo pequeño de 3B en razonamiento físico y uso de herramientas. No obstante, con solo 5 descargas y sin resultados de benchmarks publicados, debe considerarse un artefacto de investigación más que un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) |
| Parámetros totales | 3.397.103.616 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen2.5-3B-Instruct; el autor no la especifica) |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; sin GGUF oficial) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-3B-Instruct, un transformer decoder-only de 3.4B parámetros con atención causal estándar. Sobre esa base se aplicó un ajuste fino con GRPO, un algoritmo de optimización de política que estima ventajas relativas dentro de grupos de respuestas muestreadas para una misma consulta, eliminando la necesidad de un modelo crítico separado. El entorno de entrenamiento es Interphyre, un conjunto de puzles de física donde el agente debe razonar y actuar mediante llamadas a herramientas de simulación.

La particularidad metodológica es el uso de un banco estático de habilidades que se antepone al prompt de sistema durante la generación de datos y se mantiene fijo a lo largo del entrenamiento GRPO. El modelo se entrena para operar dentro del bucle ReAct de Interphyre: recibe un prompt de sistema que describe el nivel de física y las herramientas disponibles, y luego llama iterativamente al simulador hasta colocar la bola en la posición que satisface el objetivo. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo fases adicionales de RLHF o DPO.

## Capacidades

- Generación de texto conversacional heredada de Qwen2.5-3B-Instruct.
- Razonamiento físico aplicado a puzles del entorno Interphyre, específicamente el nivel `two_body_problem`.
- Uso de herramientas (tool calling) dentro del bucle ReAct de Interphyre: llamadas iterativas a herramientas de simulación física.
- Razonamiento multi-paso orientado a la resolución de tareas con recompensa verificable.
- Especialización en el esquema de prompt con banco de habilidades estático antepuesto al system prompt.
- Capacidades multilingües limitadas al inglés según la model card.

## Casos de uso

- Investigación en RL con recompensas verificables: sirve como referencia reproducible de cómo GRPO especializa un modelo de 3B en un entorno de simulación concreto, útil para estudiar dinámicas de entrenamiento y estabilidad.
- Evaluación de agentes ReAct en entornos físicos: el modelo puede integrarse en el bucle de Interphyre para medir la capacidad de un LLM pequeño de resolver puzles de dos cuerpos mediante llamadas a herramientas.
- Prototipado de agentes de simulación física: permite experimentar con políticas de colocación de objetos en escenarios controlados antes de escalar a modelos mayores.
- Estudio de transferencia de habilidades: al comparar este ajuste con el Qwen2.5-3B-Instruct base se puede analizar cuánto del rendimiento en el puzle proviene del banco de habilidades frente al propio ajuste GRPO.
- Docencia y divulgación sobre RL aplicado a LLM: ejemplo didáctico de pipeline completo (entorno, recompensa, GRPO, banco de habilidades) para cursos o talleres.
- Base para ajustes posteriores en dominios físicos: punto de partida para fine-tuning en otros niveles de Interphyre o entornos con esquemas de herramientas similares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 7 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica unos 8-10 GB.
- VRAM estimada en cuantización de 8 bits: en torno a 4 GB; en 4 bits, en torno a 2,5-3 GB (estimaciones teóricas, no verificadas por el autor).
- GPU recomendadas: A100 o H100 para entrenamiento o evaluación a gran escala; RTX 4090, RTX 3090 o RTX A6000 para inferencia cómoda en precisión completa.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más en fp16 (RTX 3060 Ti/3070 en adelante) y en tarjetas con 4-6 GB si se cuantiza.
- Opciones de despliegue: transformers (soporte nativo según la model card); vLLM, llama.cpp, Ollama o TGI son viables en teoría, pero no hay conversión GGUF oficial ni configuración publicada por el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5-3B-Interphyre-GRPO-Skilled-TwoBodyProblem | 3,4B | no disponible | Puzles de física Interphyre (two_body_problem) | Apache 2.0 | Hugging Face, 5 descargas |
| Qwen/Qwen2.5-3B-Instruct | 3,4B | no disponible en esta ficha | Instrucción general | Apache 2.0 | Hugging Face, ampliamente usado |
| Modelos de 3B ajustados con RL para tool use | ~3B | variable | Uso de herramientas genérico | variable | variable |

La comparación directa con alternativas especializadas en razonamiento físico no está disponible en la información proporcionada. El competidor natural es el modelo base Qwen2.5-3B-Instruct, del que este ajuste hereda arquitectura y licencia.

## Limitaciones y advertencias

- Modelo altamente especializado: su rendimiento fuera del entorno Interphyre y del nivel `two_body_problem` no está documentado y probablemente degrade respecto al modelo base.
- Dependencia del esquema de prompt: espera un system prompt con descripción del nivel y herramientas, además del banco de habilidades; usarlo fuera de ese formato puede producir resultados pobres.
- Solo inglés según la model card; no se garantiza un comportamiento multilingüe fiable.
- Riesgo de alucinación en llamadas a herramientas y en el razonamiento físico, especialmente fuera de la distribución de entrenamiento.
- Sin benchmarks publicados: no hay evidencia cuantitativa de mejora frente al modelo base ni de robustez.
- Licencia Apache 2.0 permite uso comercial, pero al derivar de Qwen2.5 conviene revisar los términos del modelo base y de los datos de entrenamiento de Interphyre.
- Artefacto de investigación con muy baja adopción (5 descargas, 0 likes): no recomendado para producción sin evaluación propia.
- No se especifican sesgos conocidos ni el volumen o composición de los datos de entrenamiento, lo que dificulta auditar su comportamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vgandhi13/Qwen2.5-3B-Interphyre-GRPO-Skilled-TwoBodyProblem
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Repositorio de Interphyre: https://github.com/sniekum/interphyre
