# Team-mark/DeepSeek-R1-Distill-Qwen-1.5B-Q4_K_M-GGUF

## Resumen

Team-mark/DeepSeek-R1-Distill-Qwen-1.5B-Q4_K_M-GGUF es una cuantización en formato GGUF del modelo DeepSeek-R1-Distill-Qwen-1.5B, publicada por el usuario Team-mark. No se trata de un modelo entrenado desde cero, sino de una conversión del checkpoint original de DeepSeek AI mediante la herramienta GGUF-my-repo de ggml.ai, que empaqueta los pesos en cuantización Q4_K_M (4 bits con mezcla de bloques K-quant) para su uso con llama.cpp y otros runners compatibles.

El modelo subyacente es un destilado de DeepSeek-R1 sobre la arquitectura Qwen2.5-1.5B, con 1.777.088.000 parámetros totales según los safetensors del checkpoint original. Está pensado para tareas de razonamiento en cadena (estilo "thinking"), matemáticas y código en un rango de tamaño muy contenido, lo que permite ejecutarlo en hardware de consumo. La versión GGUF Q4_K_M reduce el peso del repositorio a aproximadamente 1,1 GB.

La relevancia de esta ficha radica en que ofrece un punto de entrada práctico al ecosistema R1 para desarrolladores que quieren probar razonamiento destilado en local sin depender de GPUs de datacenter. Conviene señalar que la model card del repositorio es puramente procedimental (instrucciones de llama.cpp) y no aporta datos propios de evaluación, idiomas o entrenamiento; todo lo que se detalla a continuación proviene del modelo base o de la información disponible en Hugging Face.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen2.5-1.5B, destilado de DeepSeek-R1) |
| Parámetros totales | 1.777.088.000 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el ejemplo de la model card usa `-c 2048`) |
| Tipos de cuantización | Q4_K_M (este repositorio); otras cuantizaciones del mismo base no listadas aquí |
| Idiomas soportados | no disponibles en la información proporcionada |
| Licencia | MIT |
| Formato de pesos | GGUF (safetensors en el checkpoint base) |

## Arquitectura y entrenamiento

El modelo base es un destilado de DeepSeek-R1 sobre Qwen2.5-1.5B. La arquitectura es un transformer decoder-only con atención causal estándar, sin mezcla de expertos ni componentes híbridos SSM. El proceso de destilación de DeepSeek-R1 consiste en transferir las capacidades de razonamiento del modelo grande (generación de cadenas de pensamiento antes de la respuesta final) a un modelo pequeño mediante fine-tuning supervisado sobre trazas de razonamiento generadas por el modelo profesor. No se dispone en la información proporcionada del número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO en el destilado.

La innovación relevante aquí no está en la arquitectura sino en el formato: la conversión a GGUF Q4_K_M mediante GGUF-my-repo permite ejecutar el modelo con llama.cpp en CPU, GPU o configuraciones mixtas, con un peso de repositorio de 1,1 GB. El modelo conserva el comportamiento de "thinking" del R1 original, es decir, genera un bloque de razonamiento interno antes de la respuesta, lo que incrementa el número de tokens generados por consulta y, por tanto, la latencia frente a un modelo instruct convencional del mismo tamaño.

## Capacidades

- Generación de texto conversacional y respuesta a instrucciones en formato chat.
- Razonamiento en cadena: produce trazas de pensamiento antes de la respuesta final, herencia directa del destilado de DeepSeek-R1.
- Razonamiento matemático y resolución de problemas de varios pasos, capacidad objetivo del destilado.
- Generación y explicación de código, herencia del base Qwen2.5.
- Soporte de tool calling / function calling: no confirmado en la información proporcionada para esta conversión.
- Soporte de agentes y razonamiento multi-paso: parcial, vía cadenas de pensamiento, sin integración de herramientas confirmada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades especiales: modo "thinking" (bloque de razonamiento previo a la respuesta); sin visión ni audio.

## Casos de uso

- Razonamiento matemático en local: el modelo puede resolver problemas de aritmética y álgebra paso a paso generando la cadena de pensamiento; su tamaño de 1,5B y cuantización Q4_K_M permiten ejecutarlo en un portátil sin GPU dedicada, útil para prototipos educativos y verificación de pipelines.
- Asistente de código en el editor: integrado vía llama.cpp u Ollama, puede completar y explicar fragmentos de código en un flujo de trabajo de desarrollo individual, con la ventaja de no enviar código a servicios externos.
- Prototipado de agentes de razonamiento: sirve como banco de pruebas barato para validar prompts de cadena de pensamiento y formatos de salida antes de escalar a modelos mayores de la familia R1.
- Generación de explicaciones paso a paso en entornos educativos: la traza de razonamiento explícita facilita mostrar al estudiante el proceso, no solo el resultado, en tutoría automatizada de matemáticas y lógica.
- Inferencia en el borde (edge): con 1,1 GB de pesos en Q4_K_M, puede desplegarse en dispositivos con recursos limitados, Raspberry Pi de gama alta o mini-PC, para tareas de clasificación y respuesta breve con razonamiento ligero.
- Evaluación comparativa de cuantizaciones: este repositorio sirve para medir la degradación de calidad de Q4_K_M frente al checkpoint original en tareas de razonamiento, como referencia para decidir qué cuantización usar en producción.
- Chat conversacional de bajo coste: para aplicaciones donde la latencia no es crítica y se prioriza el coste cero de infraestructura, el modelo puede gestionar conversaciones multi-turno en local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio solo contiene instrucciones de uso con llama.cpp y no incluye métricas de MMLU, GSM8K, HumanEval ni comparativas. Cualquier cifra de rendimiento del modelo base debe consultarse en la model card original de deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B, que no forma parte de la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,0-1,3 GB para los pesos Q4_K_M, más overhead de contexto KV cache (dependiente de la longitud de contexto configurada).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM libre; RTX 3060, RTX 4060, RTX 4090 y superiores funcionan sin problema. También A100/H100, aunque están sobredimensionadas para este tamaño.
- Cabe en GPU de consumo: sí, en prácticamente todas las GPU consumer modernas (GTX 1650 en adelante), y también en CPU pura con suficiente RAM.
- Opciones de despliegue: llama.cpp (CLI y llama-server), Ollama, y cualquier runner compatible con GGUF. vLLM y TGI no son la vía natural para GGUF, aunque existen rutas de conversión.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Como referencia cualitativa, el modo thinking incrementa el número de tokens generados por consulta y, por tanto, la latencia percibida frente a un instruct del mismo tamaño.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Team-mark/DeepSeek-R1-Distill-Qwen-1.5B-Q4_K_M-GGUF | 1,777 M | no disponible | GGUF Q4_K_M | MIT | Hugging Face |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B (base) | 1,777 M | no disponible en esta ficha | safetensors | MIT | Hugging Face |
| Qwen2.5-1.5B-Instruct | ~1,5 B | no disponible en esta ficha | safetensors, GGUF | Apache 2.0 (según el modelo original) | Hugging Face |
| DeepSeek-R1-Distill-Qwen-7B | ~7 B | no disponible en esta ficha | safetensors, GGUF | MIT | Hugging Face |

La comparativa se limita a datos estructurales porque no hay benchmarks publicados en la información disponible. Frente a Qwen2.5-1.5B-Instruct, la diferencia principal es el modo thinking y el linaje R1; frente al destilado de 7B, este modelo sacrifica capacidad de razonamiento a cambio de un footprint mucho menor (1,1 GB frente a varios GB en Q4).

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información proporcionada; al heredar el corpus de Qwen2.5 y las trazas de R1, es previsible que arrastre sesgos de esos datasets, pero no hay evidencia publicada en esta ficha.
- Riesgo de alucinación: elevado en un modelo de 1,5B, especialmente en tareas de conocimiento factual y en cadenas de razonamiento largas, donde el modelo puede generar pasos plausibles pero incorrectos.
- Limitaciones de contexto o idioma: la longitud de contexto no está confirmada en la información disponible; el ejemplo de la model card usa `-c 2048`, lo que sugiere que conviene configurar el contexto explícitamente. Los idiomas soportados no están documentados.
- Restricciones de licencia: licencia MIT, que permite uso comercial y modificación con atribución del aviso de copyright; conviene verificar la licencia del checkpoint base y de Qwen2.5 en la cadena de derivación.
- Caveats para producción: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y la model card es puramente procedimental; no hay garantías de calidad de la conversión más allá de la herramienta estándar GGUF-my-repo. Para producción seria, es preferible partir del checkpoint original o de cuantizaciones mantenidas por el equipo de DeepSeek o por ggml-org.
- El modo thinking incrementa el coste de inferencia por consulta; en aplicaciones de baja latencia puede ser necesario truncar o desactivar la traza de razonamiento.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Team-mark/DeepSeek-R1-Distill-Qwen-1.5B-Q4_K_M-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- Herramienta de conversión GGUF-my-repo: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp
