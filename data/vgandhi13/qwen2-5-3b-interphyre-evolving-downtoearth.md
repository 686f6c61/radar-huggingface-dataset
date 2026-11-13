# vgandhi13/Qwen2.5-3B-Interphyre-Evolving-DownToEarth

## Resumen

Qwen2.5-3B-Interphyre-Evolving-DownToEarth es un ajuste fino del modelo Qwen/Qwen2.5-3B-Instruct desarrollado por el usuario vgandhi13. El modelo se ha entrenado mediante GRPO (Group Relative Policy Optimization), una técnica de aprendizaje por refuerzo, sobre el entorno de puzles de fisica Interphyre, concretamente en el nivel `down_to_earth`. El objetivo es dotar al modelo de capacidades de razonamiento fisico y uso de herramientas dentro de un bucle ReAct.

La innovacion principal del entrenamiento es el uso de un banco de habilidades (skill bank) que evoluciona durante el entrenamiento y se inyecta en el contexto del modelo. Esto combina optimizacion de politica basada en gradientes con acumulacion de habilidades en contexto, de modo que el modelo aprende a reutilizar estrategias resueltas previamente. El modelo opera dentro del bucle de herramientas ReAct de Interphyre y requiere que el banco de habilidades evolucionado se anteponga al system prompt en tiempo de inferencia.

Con 3.397.103.616 parametros y licencia Apache 2.0, se posiciona como un modelo pequeno y desplegable en hardware de consumo, especializado en una tarea acotada (razonamiento fisico con herramientas) mas que como modelo de proposito general. Su relevancia actual radica en demostrar la viabilidad de combinar RL con memoria de habilidades en contexto sobre modelos de 3B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 3.397.103.616 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen2.5-3B-Instruct, no confirmada en la model card) |
| Tipos de cuantizacion | no disponible en la model card (pesos en safetensors; cuantizaciones GGUF/AWQ no publicadas) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Qwen2 de tipo transformer decoder-only del modelo base Qwen2.5-3B-Instruct. El ajuste se realiza con GRPO, un algoritmo de aprendizaje por refuerzo sin modelo critico que estima la ventaja relativa dentro de un grupo de muestras generadas para una misma consulta. El entorno de entrenamiento es Interphyre, un banco de puzles de fisica, y el nivel concreto es `down_to_earth`.

La innovacion tecnica destacable es el banco de habilidades evolutivo: durante el entrenamiento el banco se actualiza y se inyecta en el contexto del modelo, de forma que la politica aprende a apoyarse en habilidades ya resueltas y acumuladas. Esto combina optimizacion de politica basada en gradientes con acumulacion de habilidades en contexto. En inferencia, el modelo debe operar dentro del bucle ReAct de Interphyre y el banco de habilidades evolucionado debe anteponerse al system prompt. No se detallan en la model card el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas adicionales de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional (pipeline text-generation).
- Razonamiento fisico aplicado a puzles del entorno Interphyre.
- Uso de herramientas (tool use) dentro de un bucle ReAct.
- Razonamiento multi-paso orientado a resolucion de tareas con acciones y observaciones.
- Aprovechamiento de un banco de habilidades inyectado en contexto para reutilizar estrategias.
- Capacidades heredadas del modelo base Qwen2.5-3B-Instruct (generacion, codigo basico, matematicas elementales), aunque no se documentan explicitamente en la model card.
- Capacidades multilingues: solo se declara ingles (`en`).
- No se documentan modos de thinking, vision ni audio.

## Casos de uso

- Investigacion en aprendizaje por refuerzo: reproducir el pipeline GRPO con banco de habilidades evolutivo sobre Interphyre para estudiar como la memoria en contexto complementa la optimizacion de politica.
- Evaluacion de razonamiento fisico: usar el modelo como agente dentro del bucle ReAct de Interphyre para medir precision en el nivel `down_to_earth` y comparar con el modelo base.
- Experimentos de tool calling acotado: integrar el modelo en un entorno con un conjunto reducido de herramientas y observar la calidad de las llamadas dentro de tareas de puzles.
- Prototipado de agentes con memoria de habilidades: emplear el patron de inyectar un banco de habilidades en el system prompt para validar tecnicas de acumulacion de conocimiento sin reentrenamiento.
- Docencia y divulgacion: ejemplo practico de ajuste fino con RL sobre un modelo de 3B desplegable en una unica GPU de consumo.
- Investigacion sobre generalizacion: analizar si las habilidades aprendidas en un nivel concreto se transfieren a otros niveles o dominios fisicos.
- Desarrollo de entornos de evaluacion: usar el modelo como baseline en benchmarks de agentes fisicos con herramientas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: aproximadamente 6,8 GB solo para pesos (3,4B parametros x 2 bytes), mas overhead de activaciones y cache KV; en la practica unos 8-10 GB.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 3,4 GB para pesos, con margen para contexto.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 1,7-2 GB para pesos, viable en GPUs de consumo con 6-8 GB.
- GPU recomendadas: RTX 3090, RTX 4090, A100 o H100 para FP16 sin restricciones; RTX 3060 12 GB o superiores para cuantizaciones.
- Cabe en GPU de consumo: si, en modelos con 8 GB o mas en FP16 y en GPUs con 6 GB o mas en cuantizacion de 4 bits.
- Opciones de despliegue: transformers (metodo indicado en la model card con `device_map="auto"`), vLLM, TGI o llama.cpp/Ollama si se generan cuantizaciones GGUF (no publicadas por el autor).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5-3B-Interphyre-Evolving-DownToEarth | 3,4B | no disponible | Razonamiento fisico + tool use (Interphyre) | Apache 2.0 | Hugging Face |
| Qwen/Qwen2.5-3B-Instruct (base) | 3,1B | 32.768 tokens (segun Qwen2.5) | Proposito general, instrucciones | Apache 2.0 | Hugging Face |
| Qwen2.5-7B-Instruct | 7,6B | 131.072 tokens (segun Qwen2.5) | Proposito general, instrucciones | Apache 2.0 | Hugging Face |
| Llama-3.2-3B-Instruct | 3,2B | 131.072 tokens | Proposito general, instrucciones | Llama 3.2 Community License | Hugging Face |

Nota: los datos de contexto de los modelos comparables provienen de sus especificaciones publicas; el contexto del modelo de esta ficha no se confirma en la model card.

## Limitaciones y advertencias

- Modelo altamente especializado: su rendimiento fuera del entorno Interphyre y del nivel `down_to_earth` no esta documentado y probablemente degrade respecto al modelo base.
- Requiere el banco de habilidades evolucionado antepuesto al system prompt; sin el, el comportamiento esperado puede no reproducirse.
- Solo declara soporte de ingles; el rendimiento en castellano no esta garantizado.
- Riesgo de alucinacion inherente a los modelos de 3B, especialmente en razonamiento fisico fuera de distribucion.
- No se han publicado benchmarks, por lo que no hay evidencia cuantitativa de mejora frente al modelo base.
- Sesgos conocidos: no documentados en la model card; se heredan los del modelo base Qwen2.5-3B-Instruct.
- Licencia Apache 2.0 permite uso comercial, pero el modelo depende del entorno Interphyre (repositorio en GitHub) cuyas condiciones deben revisarse por separado.
- El modelo tiene solo 4 descargas y 0 likes; no hay validacion comunitaria ni reportes de produccion.
- No se publican cuantizaciones oficiales; el despliegue eficiente requiere generarlas.

## Enlaces

- Hugging Face: https://huggingface.co/vgandhi13/Qwen2.5-3B-Interphyre-Evolving-DownToEarth
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Repositorio Interphyre: https://github.com/sniekum/interphyre
