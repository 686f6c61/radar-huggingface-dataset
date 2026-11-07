# ttttonyhe/Qwen3-4B-Instruct-RETA-Base

## Resumen

Qwen3-4B-Instruct-RETA-Base es un ajuste fino por supervisión (SFT) del modelo Qwen/Qwen3-4B-Instruct-2507, publicado por el usuario ttttonyhe en Hugging Face. Su propósito es específico y poco habitual: dotar a un agente que utiliza herramientas (tool-using agent) de resistencia frente a ataques débiles de inyección de prompt (prompt injection) de tipo estático en el entorno de evaluación AgentDojo. Tras cada llamada a una herramienta, el modelo aprende a razonar si el contenido devuelto es coherente con la tarea del usuario, a ignorar instrucciones conflictivas embebidas en la salida de la herramienta y a continuar con la tarea original.

El modelo se construye sobre la arquitectura Qwen3 del checkpoint base de 4B, aunque el dato real de parámetros almacenados en safetensors que reporta el repositorio es de 502.808.512, muy inferior a los 4B nominales del nombre; esta discrepancia no está explicada en la información disponible. El repositorio ocupa 17,7 GB. Se distribuye bajo licencia Apache 2.0 y está orientado exclusivamente a inglés.

Es relevante ahora porque la seguridad de agentes que invocan herramientas es uno de los frentes abiertos en el despliegue de sistemas LLM en producción, y este checkpoint forma parte de una línea de trabajo (RETA) en la que el autor encadena SFT, un ascenso por RL de 250 pasos y OPSD hasta un checkpoint final con mayor robustez. Este repositorio representa, por tanto, la base SFT intermedia de esa cadena, no el resultado final.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3), ajuste fino del checkpoint Qwen/Qwen3-4B-Instruct-2507 |
| Parametros totales | 502.808.512 según safetensors del repositorio (el nombre del modelo indica 4B; discrepancia no explicada en la información disponible) |
| Parametros activos | no disponible (no es un modelo MoE según la información proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio publica pesos en safetensors; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B-Instruct-2507, un transformer decoder-only de la familia Qwen3, y se ajusta mediante SFT con TRL 0.27.0 sobre Transformers 4.57.3, PyTorch 2.9.0, Datasets 4.5.0 y Tokenizers 0.22.2. El objetivo del entrenamiento es conductual: tras cada llamada a herramienta, el modelo debe razonar sobre la alineación del contenido devuelto con la tarea del usuario, descartar instrucciones conflictivas inyectadas en esa salida y proseguir la tarea. El escenario de evaluación es AgentDojo, con ataques de inyección de prompt estáticos y débiles.

La información disponible no detalla el volumen de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO en este checkpoint concreto. Sí se documenta que este repositorio es la base SFT de una cadena posterior: sobre él el autor aplicó un ascenso por RL de 250 pasos y después OPSD, dando lugar al checkpoint final ttttonyhe/Qwen3-4B-Instruct-RETA, que según la model card presenta una robustez mucho mayor. No se especifican innovaciones de decodificación ni mecanismos de atención alternativos.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base Qwen3-4B-Instruct-2507.
- Uso de herramientas (tool use) con razonamiento explícito posterior a cada llamada, verificando la coherencia entre la salida de la herramienta y la tarea del usuario.
- Defensa contra inyección de prompt estática débil en el marco AgentDojo: ignora instrucciones conflictivas embebidas en las respuestas de herramientas.
- Razonamiento multi-paso orientado a agentes: mantiene el hilo de la tarea original pese a contenido adversario en las observaciones.
- Capacidades de instrucción general del modelo base (código, matemáticas, razonamiento), aunque no se documentan métricas específicas para este ajuste.
- No se documentan capacidades de visión, audio, modo thinking explícito ni soporte multilingüe más allá del inglés.

## Casos de uso

- Agentes con acceso a herramientas en producción: el modelo puede integrarse como capa de decisión en pipelines donde las herramientas devuelven contenido de fuentes no confiables (resultados web, correos, tickets) y debe resistir instrucciones inyectadas en esas salidas.
- Evaluación de robustez en AgentDojo: sirve como checkpoint de referencia SFT para comparar la mejora que aportan las fases posteriores de RL y OPSD del mismo autor.
- Investigación en seguridad de agentes: línea base reproducible para estudiar defensas ante prompt injection estática en tareas de tool calling.
- Automatización de flujos con APIs externas: al razonar tras cada llamada, el modelo puede detectar respuestas de API manipuladas o incoherentes antes de continuar la tarea.
- Asistentes de soporte que consultan bases de conocimiento: útil cuando el corpus recuperado puede contener texto adversario y se requiere filtrar instrucciones ajenas a la consulta del usuario.
- Prototipado de agentes en inglés con requisitos de licencia permisiva: Apache 2.0 permite uso comercial y modificación sin restricciones de copyleft.
- Formación de modelos derivados: al ser un checkpoint SFT intermedio, sirve como punto de partida para experimentos de RL u otras técnicas de alineación orientadas a seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona el escenario AgentDojo como marco de entrenamiento y evaluación, y afirma que el checkpoint final de la cadena (Qwen3-4B-Instruct-RETA) tiene una robustez mucho mayor, pero no se aportan cifras concretas para este checkpoint base.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con los 502.808.512 parámetros que reporta safetensors, en fp16 serían aproximadamente 1 GB de pesos; en bf16, similar. Si se confirma el tamaño nominal de 4B, en fp16 serían unos 8 GB y en cuantización de 4 bits unos 2,5-3 GB. La discrepancia entre ambas cifras no está resuelta en la información disponible.
- GPU recomendadas: no disponible. Para un modelo de esta familia, una GPU consumer reciente con 8-16 GB sería suficiente en cuantización, pero no hay confirmación del autor.
- Cabe en GPU consumer: previsiblemente sí para el tamaño real reportado (502M), pero no hay validación documentada.
- Opciones de despliegue: transformers (documentado en la model card); el repositorio incluye la etiqueta text-generation-inference y endpoints_compatible, lo que sugiere compatibilidad con TGI y endpoints de Hugging Face. No se documentan instrucciones para vLLM, llama.cpp ni Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-4B-Instruct-RETA-Base (este) | 502.808.512 según safetensors (nombre indica 4B) | no disponible | SFT para defensa ante prompt injection en agentes | Apache 2.0 | Hugging Face |
| Qwen3-4B-Instruct-RETA (checkpoint final del mismo autor) | no disponible | no disponible | SFT + RL 250 pasos + OPSD, mayor robustez según el autor | no disponible en la información | Hugging Face |
| Qwen/Qwen3-4B-Instruct-2507 (modelo base) | 4B (nominal) | no disponible | Instrucción general, sin defensa específica | no disponible en la información | Hugging Face |

No se dispone de datos de benchmarks que permitan comparar rendimiento entre estas alternativas.

## Limitaciones y advertencias

- El entrenamiento cubre únicamente ataques de inyección de prompt estáticos y débiles en AgentDojo; no hay evidencia de robustez frente a ataques adaptativos, dinámicos o más sofisticados.
- Es un checkpoint SFT intermedio: el propio autor indica que el checkpoint final de la cadena tiene una robustez mucho mayor, por lo que este modelo no debe considerarse la versión recomendada para producción.
- Solo soporta inglés; no se documenta cobertura multilingüe.
- No se documentan sesgos conocidos, pero al derivar de Qwen3-4B-Instruct-2507 hereda los del modelo base, no evaluados en esta ficha.
- Riesgo de alucinación inherente a los modelos generativos; no se han publicado evaluaciones específicas de factualidad para este ajuste.
- La discrepancia entre el nombre (4B) y los parámetros reales en safetensors (502.808.512) debe verificarse antes de dimensionar infraestructura.
- No se documentan longitudes de contexto ni tipos de cuantización, lo que limita la planificación de despliegues con requisitos estrictos de memoria.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo en entornos adversarios reales.
- El modelo está diseñado para un rol defensivo dentro de un agente; usarlo fuera de ese contexto de tool calling no aporta ventajas frente al modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ttttonyhe/Qwen3-4B-Instruct-RETA-Base
- Checkpoint final de la cadena RETA: https://huggingface.co/ttttonyhe/Qwen3-4B-Instruct-RETA
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Repositorio TRL: https://github.com/huggingface/trl
- Ficha en free2aitools: https://free2aitools.com/model/ttttonyhe/qwen3-4b-instruct-reta
