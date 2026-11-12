# XinchengTan/nsdl-7b-rl-locus

## Resumen

NSDL 7B (RL, LOCUS) es un ajuste fino del modelo multimodal Qwen2.5-VL-7B-Instruct desarrollado por Xincheng Tan y colaboradores (Ke Wang, Yining Di, Minfeng Zhu) en el contexto del artículo «NSDL: Neuro-Symbolic Division of Labor for Multi-Robot Task Planning» (preprint en arXiv, 2026). El modelo está especializado en planificación de tareas para sistemas multi-robot, combinando percepción visual y razonamiento simbólico dentro de un marco de división del trabajo neuro-simbólico.

El checkpoint publicado corresponde al paso 30 de un entrenamiento con refuerzo (RL) inicializado a partir del checkpoint NSDL 7B (SFT) LOCUS. Se trata, por tanto, de un modelo de investigación orientado a un dominio muy concreto: la generación de planes de tareas para flotas de robots a partir de instrucciones en lenguaje natural y observaciones visuales del entorno.

Por su tamaño (8.292 millones de parámetros reales en safetensors, equivalentes a la arquitectura de 7B de Qwen2.5-VL) y su licencia Apache-2.0, es un candidato razonable para experimentación académica en robótica y planificación, aunque su utilidad fuera del ámbito de la planificación multi-robot es limitada y no se han publicado métricas generales de rendimiento en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (hereda la de Qwen2.5-VL-7B-Instruct; vision encoder + LLM decoder) |
| Parametros totales | 8.292.166.656 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen2.5-VL-7B-Instruct, valor no confirmado en esta ficha) |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16; no se documentan cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bfloat16, 4 shards) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen2.5-VL-7B-Instruct: un transformer multimodal con codificador visual y decodificador de lenguaje, capaz de procesar entradas image-text-to-text. Sobre esta base, los autores aplicaron un ajuste supervisado (SFT) que dio lugar al checkpoint NSDL 7B (SFT) LOCUS, seguido de un entrenamiento con refuerzo (RL) cuyo paso 30 es el checkpoint publicado. El pipeline de RL se documenta en el script `scripts/rl_final_setting.sh` del repositorio oficial.

No se dispone en la información proporcionada de detalles sobre el volumen de tokens de entrenamiento, la composición del dataset, la variante concreta de RL (p. ej. PPO, GRPO, DPO) ni innovaciones técnicas adicionales más allá del marco neuro-simbólico descrito en el artículo. Los pesos se almacenan en bfloat16, el mismo dtype que utiliza el cargador de evaluación del repositorio.

## Capacidades

- Generación de texto y razonamiento multimodal (image-text-to-text) sobre la base de Qwen2.5-VL-7B.
- Planificación de tareas multi-robot: generación de planes de división del trabajo a partir de instrucciones y observaciones del entorno.
- Razonamiento neuro-simbólico: integración de predicciones del modelo con componentes simbólicos del marco NSDL.
- Procesamiento de entradas visuales junto con texto (visión heredada del modelo base).
- Conversación multi-turno (tag `conversational`).
- Compatibilidad con Text Generation Inference y endpoints (tags `text-generation-inference`, `endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Planificación de tareas en flotas de robots: el modelo genera planes de división del trabajo a partir de una instrucción en lenguaje natural y la observación visual del entorno, que luego se ejecutan o validan mediante el componente simbólico del marco NSDL.
- Investigación en planificación neuro-simbólica: sirve como checkpoint de referencia para reproducir los resultados del artículo y comparar variantes SFT frente a RL.
- Evaluación de agentes multi-robot en simulación: se integra con el script `scripts/eval_lnsdl_agentic_viki_l2.py` para reproducir los experimentos del paper.
- Asignación de subtareas a robots heterogéneos: el modelo puede proponer qué robot ejecuta cada subtarea según las capacidades descritas en el contexto.
- Replanificación ante cambios del entorno: al ser multimodal, puede recibir nuevas observaciones visuales y ajustar el plan propuesto.
- Docencia y experimentación académica: su licencia Apache-2.0 y su tamaño moderado permiten desplegarlo en laboratorios con GPUs de gama alta para estudiar técnicas de RL sobre modelos multimodales.
- Base para ajustes posteriores en robótica: al derivar de Qwen2.5-VL, puede servir como punto de partida para otros dominios de planificación con instrucciones visuales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a la Tabla II y la Figura 3 del artículo arXiv para los resultados del checkpoint, pero no se incluyen cifras en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 16,6 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomiendan 24 GB o más.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para bfloat16 con contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) o RTX 3090 (24 GB) con contexto limitado; en GPUs de 16 GB requeriría cuantización, no documentada oficialmente.
- Opciones de despliegue: transformers (soporte nativo), Text Generation Inference (tag `text-generation-inference`), endpoints compatibles; vLLM, llama.cpp u Ollama no están confirmados en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NSDL 7B (RL, LOCUS) | 8.292 M | no disponible | Planificación multi-robot | Apache-2.0 | Hugging Face |
| Qwen2.5-VL-7B-Instruct (base) | ~8.000 M | no disponible en esta ficha | Multimodal general | Apache-2.0 | Hugging Face |
| NSDL 7B (SFT, LOCUS) | no disponible | no disponible | Planificación multi-robot | Apache-2.0 (presumible) | Referenciado en el paper, no confirmado en HF |

No se dispone de datos de rendimiento comparativos en la información proporcionada para establecer diferencias cuantitativas entre estas variantes.

## Limitaciones y advertencias

- Modelo de investigación: no se han publicado evaluaciones generales (MMLU, HumanEval, GSM8K) ni métricas fuera del dominio de planificación multi-robot.
- Especialización estrecha: su rendimiento en tareas generales de lenguaje o visión puede degradarse respecto al modelo base Qwen2.5-VL-7B-Instruct tras el ajuste SFT + RL.
- Riesgo de alucinación en la generación de planes: los planes propuestos deben validarse con el componente simbólico del marco NSDL antes de su ejecución en robots reales.
- Idiomas soportados no documentados: no se garantiza un comportamiento correcto fuera de los idiomas presentes en el dataset de ajuste.
- Longitud de contexto no confirmada en esta ficha: debe consultarse el `config.json` o la documentación de Qwen2.5-VL-7B-Instruct.
- Dependencia del código del repositorio: la carga y evaluación requieren el repositorio `Xincheng-Tan/NSDL` y sus flags específicos; no es un modelo plug-and-play.
- Licencia Apache-2.0: permite uso comercial, pero el autor no ofrece garantías y el modelo se distribuye «tal cual».
- Sin cuantizaciones oficiales publicadas: el despliegue en GPUs de menos de 24 GB requiere cuantización manual no validada por los autores.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/XinchengTan/nsdl-7b-rl-locus
- Repositorio de código: https://github.com/Xincheng-Tan/NSDL
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct
- Artículo: «NSDL: Neuro-Symbolic Division of Labor for Multi-Robot Task Planning», Tan, Wang, Di, Zhu (arXiv preprint, 2026); referencia sin URL directa en la información proporcionada.
