# vgandhi13/Qwen2.5-3B-Interphyre-GRPO-Skilled-DownToEarth

## Resumen

Qwen2.5-3B-Interphyre-GRPO-Skilled-DownToEarth es un ajuste fino del modelo Qwen/Qwen2.5-3B-Instruct realizado por el usuario vgandhi13 mediante aprendizaje por refuerzo con GRPO (Group Relative Policy Optimization) sobre el entorno de puzles de fisica Interphyre, concretamente en el nivel `down_to_earth`. El objetivo del ajuste es especializar al modelo en razonamiento fisico y uso de herramientas dentro del bucle ReAct de Interphyre, donde debe invocar iterativamente herramientas de simulacion para colocar una bola que satisfaga el objetivo del nivel.

El modelo parte de la arquitectura transformer densa de Qwen2.5-3B-Instruct, con 3.397.103.616 parametros totales, y anade una innovacion concreta en el proceso de entrenamiento: un banco de habilidades estatico (skill bank) que se antepone al system prompt en el momento de generar los datos y permanece fijo durante el entrenamiento con GRPO. Se distribuye bajo licencia Apache 2.0 y esta pensado exclusivamente para ingles.

Se trata de un modelo de nicho, con un volumen de descargas muy bajo (4 descargas, 0 likes en el momento de la consulta), orientado a investigacion en RL aplicado a razonamiento fisico y agentes con uso de herramientas, no a un uso generalista en produccion. Su relevancia radica en demostrar la aplicabilidad de GRPO sobre entornos de simulacion fisica con modelos de 3B parametros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2.5), ajustado con GRPO |
| Parametros totales | 3.397.103.616 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors; cuantizaciones GGUF/AWQ no publicadas por el autor) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer densa de Qwen2.5-3B-Instruct, sobre la que se aplica un ajuste fino con GRPO, un algoritmo de aprendizaje por refuerzo que estima ventajas relativas agrupando multiples muestras por prompt en lugar de emplear un modelo critico separado. El entrenamiento se realiza sobre el entorno Interphyre, un conjunto de puzles de fisica, en el nivel `down_to_earth`. El modelo opera dentro de un bucle ReAct de uso de herramientas: recibe un system prompt que describe el nivel de fisica y las herramientas disponibles, y llama iterativamente a herramientas del simulador para colocar una bola que cumpla el objetivo del nivel.

Una innovacion destacable del proceso es el uso de un banco de habilidades estatico que se antepone al system prompt durante la generacion de datos y se mantiene fijo a lo largo del entrenamiento con GRPO. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron etapas adicionales de RLHF o DPO mas alla del propio GRPO.

## Capacidades

- Generacion de texto conversacional, heredada de Qwen2.5-3B-Instruct.
- Razonamiento fisico aplicado a puzles del entorno Interphyre (nivel `down_to_earth`).
- Uso de herramientas (tool calling) dentro del bucle ReAct de Interphyre, invocando herramientas de simulacion de forma iterativa.
- Razonamiento multi-paso orientado a agentes: planificacion, llamada a herramienta, observacion y nueva accion.
- Capacidad multilingue limitada al ingles segun la model card.
- No se documentan capacidades de vision, audio ni modo de pensamiento explicito.

## Casos de uso

- Investigacion en aprendizaje por refuerzo: el modelo sirve como referencia reproducible para estudiar como GRPO modifica el comportamiento de un modelo de 3B en tareas de razonamiento fisico con recompensas basadas en simulacion.
- Evaluacion de agentes con uso de herramientas: permite analizar el bucle ReAct sobre herramientas de simulador y medir tasas de exito por episodio en el nivel `down_to_earth`.
- Experimentos de destilacion de habilidades: el banco de habilidades estatico antepuesto al system prompt puede reutilizarse como plantilla para inyectar conocimiento procedimental en otros modelos pequenos.
- Generacion de datos sinteticos de trayectorias: las interacciones del modelo con el simulador pueden registrarse como datos de entrenamiento para modelos mayores o para tecnicas de imitacion.
- Prototipado de entornos de simulacion fisica: util para validar la interfaz de herramientas y las recompensas de Interphyre antes de escalar a modelos de mayor tamano.
- Docencia y divulgacion: ejemplo compacto (3B) y ejecutable en hardware modesto para explicar GRPO, ReAct y razonamiento fisico en un curso practico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp16/bf16): en torno a 7 GB solo para pesos, mas overhead de activaciones y cache KV; se recomienda un minimo de 10-12 GB.
- En cuantizacion de 8 bits: aproximadamente 3,5-4 GB de pesos, viable en GPUs consumer de 8 GB.
- En cuantizacion de 4 bits: aproximadamente 2-2,5 GB de pesos, viable en GPUs consumer de 6-8 GB.
- GPUs recomendadas: A100 o H100 para entrenamiento y evaluacion a gran escala; RTX 4090, RTX 3090 o RTX 4070 Ti para inferencia comoda en fp16; RTX 3060 12 GB o similar para cuantizaciones de 8 y 4 bits.
- Cabe en GPU consumer: si, especialmente en cuantizaciones de 8 y 4 bits.
- Opciones de despliegue: transformers (metodo documentado por el autor), vLLM, TGI y llama.cpp/Ollama previa conversion a GGUF (no publicada por el autor).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5-3B-Interphyre-GRPO-Skilled-DownToEarth | 3,4B | no disponible | Razonamiento fisico + tool use (GRPO) | Apache 2.0 | Hugging Face |
| Qwen/Qwen2.5-3B-Instruct | 3,1B | 32.768 tokens (segun model card del modelo base) | Instruccion generalista | Apache 2.0 | Hugging Face |
| Qwen/Qwen2.5-1.5B-Instruct | 1,5B | 32.768 tokens (segun model card del modelo base) | Instruccion generalista | Apache 2.0 | Hugging Face |

La comparacion con el modelo base es la mas relevante: el ajuste con GRPO anade especializacion en Interphyre a costa de un comportamiento mas restringido fuera del bucle ReAct. No se dispone de benchmarks que permitan cuantificar la mejora frente al modelo base.

## Limitaciones y advertencias

- Modelo de nicho: entrenado para un unico nivel de Interphyre (`down_to_earth`); su comportamiento fuera de ese entorno no esta caracterizado.
- Solo ingles: la model card declara unicamente el idioma `en`.
- Riesgo de alucinacion: como todo modelo de 3B ajustado con RL sobre una tarea concreta, puede generar llamadas a herramientas inexistentes o argumentos invalidos; se requiere validacion externa en produccion.
- Dependencia del system prompt: el rendimiento depende de que el prompt incluya la descripcion del nivel y el banco de habilidades estatico en el formato esperado.
- Sin datos de benchmarks, contexto ni cuantizaciones publicadas: la evaluacion objetiva del modelo es limitada.
- Volumen de uso muy bajo (4 descargas, 0 likes): no hay evidencia comunitaria de robustez.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias ni soporte; conviene revisar tambien la licencia del modelo base Qwen2.5-3B-Instruct.
- No apto como sustituto generalista de un modelo de instruccion: su especializacion puede degradar el rendimiento en tareas conversacionales abiertas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vgandhi13/Qwen2.5-3B-Interphyre-GRPO-Skilled-DownToEarth
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Entorno Interphyre: https://github.com/sniekum/interphyre
- Repositorio de Qwen2.5: https://github.com/QwenLM/Qwen2.5
