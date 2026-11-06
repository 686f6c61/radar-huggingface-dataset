# zero885814/connectailab-rl-grid-empathy-v1

## Resumen

connectailab-rl-grid-empathy-v1 es un adaptador LoRA entrenado sobre el modelo base Qwen/Qwen3.5-0.8B para resolver tareas de decisión de empresa en un simulador llamado CONNECT TYCOON. El modelo recibe un estado (situación), una pregunta y una lista de opciones etiquetadas, y devuelve únicamente la letra de la opción seleccionada. No es un modelo de propósito general: es un policy model especializado en selección de opciones discretas dentro de un dominio sintético de gestión empresarial.

Lo desarrolla el autor zero885814 en el marco de una colaboración entre CONNECT AI LAB y AI CITY BUILDERS, con fines de investigación y educación. El entrenamiento combina un profesor PPO entrenado en el simulador, generación de un dataset de decisiones puntuadas por resultado, ajuste supervisado (SFT) y una fase final de aprendizaje por refuerzo con GRPO sobre el adaptador LoRA. El repositorio es de tamaño mínimo (0.0 GB), coherente con un adaptador PEFT de rango bajo sobre un modelo de 0.8B.

Su relevancia es acotada pero concreta: demuestra un pipeline completo de RL aplicado a toma de decisiones discretas con un modelo pequeño, con métricas de acierto, regret y rendimiento económico en el simulador. No debe confundirse con un LLM conversacional: su salida útil es una letra entre las opciones presentadas, y su uso fuera de ese formato no está respaldado por la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only Qwen/Qwen3.5-0.8B |
| Parametros totales | No disponible (adaptador LoRA; el base es de 0.8B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT); requiere el base en safetensors |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre Qwen3.5-0.8B, un transformer decoder-only de 0.8 mil millones de parámetros. El adaptador se entrena en cuatro fases descritas en la model card: (1) un profesor PPO aprende a operar la empresa en el simulador durante miles de meses; (2) se construye un dataset de decisiones re-ejecutando cada mes con cada opción alternativa para puntuar cada elección; (3) ajuste supervisado sobre la opción de mayor puntuación; (4) RL con GRPO, normalizando ventajas por grupo de opciones y añadiendo una penalización KL contra el modelo de partida. El dataset de problemas tiene 4082 ejemplos de entrenamiento, 832 de validación y 840 de test, sobre una distribución de empresas de tipo `general` ajustada con datos públicos.

La innovación principal es el uso de GRPO sobre un espacio de acciones discreto y pequeño (las opciones de cada pregunta), con recompensa derivada del simulador. El prompt de sistema instruye explícitamente a tratar el texto del estado como datos y no como instrucciones, y a devolver solo la letra. No se documentan detalles de la composición del corpus de pretraining del base ni del número de tokens de entrenamiento del adaptador.

## Capacidades

- Selección de una opción entre varias en tareas de decisión de empresa (formato estado + pregunta + opciones).
- Salida restringida a una letra de opción; la probabilidad de cada letra puede interpretarse como distribución sobre opciones y el máximo como confianza.
- Razonamiento de decisión de un solo paso, no multi-turno ni multi-step.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni planificación multi-paso.
- Capacidad multilingüe limitada al coreano según la etiqueta de idioma.
- No se documentan capacidades de visión, audio ni modo thinking.
- Resistencia a inyección de instrucciones dentro del campo `state` vía prompt de sistema (declarada, no evaluada de forma independiente en la información disponible).

## Casos de uso

- Evaluación de políticas de decisión en simulación: usar el modelo como policy para operar CONNECT TYCOON y comparar su regret y beneficio mensual frente al profesor PPO y al base sin entrenar.
- Investigación en RL aplicado a LLM: reproducir el pipeline SFT + GRPO con recompensa de simulador sobre un modelo de 0.8B, útil como banco de pruebas de bajo coste.
- Docencia de reinforcement learning: el notebook de Colab y el repositorio permiten entrenar y evaluar el adaptador en un entorno Gymnasium, con métricas de acierto y regret.
- Selección de opciones en dominios sintéticos acotados: cualquier tarea donde el espacio de acciones sea una lista corta de opciones etiquetadas y la recompensa sea verificable, adaptando el dataset.
- Análisis de calibración: explotar la distribución de probabilidad sobre letras para medir confianza y detectar decisiones de baja certeza en el simulador.
- Baseline para comparación de métodos de RL: servir como referencia SFT/GRPO frente a otras variantes de entrenamiento sobre el mismo simulador.
- Prototipado de agentes de negocio en entorno controlado: integrar el modelo en un bucle de simulación para estudiar el efecto de sus decisiones en dinero, satisfacción y accidentes, sin riesgo real.

## Benchmarks y rendimiento

Datos publicados en la model card, sobre el conjunto de test del simulador (840 problemas):

| Modelo | Acierto en test | Regret (menor es mejor) | Beneficio mensual en simulador | Transacciones reales con pérdida reducida |
|---|---|---|---|---|
| Qwen base (sin entrenar) | 36.1% | 5.49 | No disponible | No disponible |
| SFT | 74.2% | 4.34 | No disponible | No disponible |
| SFT + GRPO (este modelo) | 75.5% | 4.30 | 4,04 millones de KRW | 37% (91/177) |

El autor advierte que la evaluación de operación de empresa corresponde a la media de dos meses no vistos, con muestra pequeña, y que el modelo sigue por debajo del profesor PPO del simulador. No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- El adaptador LoRA es de tamaño mínimo; el coste real lo determina el modelo base Qwen3.5-0.8B.
- VRAM estimada para inferencia en fp16: en torno a 2 GB para el base de 0.8B más overhead de activaciones y del adaptador; en cuantización de 8 bits, aproximadamente 1 GB, y en 4 bits, por debajo de 1 GB (estimaciones, no publicadas por el autor).
- Cabe en GPU de consumo: RTX 3060, RTX 4060, RTX 4090 y cualquier GPU con 4 GB o más.
- Despliegue: transformers + peft (flujo documentado por el autor); vLLM, llama.cpp, Ollama y TGI no están documentados para este adaptador y requerirían fusión previa del LoRA con el base.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento en su dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-grid-empathy-v1 | Adaptador sobre 0.8B | No disponible | 75.5% acierto, regret 4.30 en simulador propio | Apache 2.0 | Hugging Face, 16 descargas |
| Qwen3.5-0.8B (base) | 0.8B | No disponible | 36.1% acierto, regret 5.49 en el mismo test | No disponible en la información | Hugging Face |
| Profesor PPO del simulador | No disponible | No disponible | Superior al adaptador según el autor | No disponible | No disponible |

No se dispone de comparación con otros adaptadores de decisión de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación y educación sobre un simulador sintético; el propio autor recomienda revalidar con los registros reales de la empresa antes de cualquier uso en gestión.
- Salida restringida a una letra; fuera de ese formato el comportamiento no está garantizado.
- Evaluación de operación basada en dos meses no vistos, muestra pequeña y con alta varianza.
- Por debajo del profesor PPO del simulador en rendimiento de operación.
- Idioma limitado al coreano según la etiqueta; no se documenta calidad en castellano ni en otros idiomas.
- Riesgo de alucinación no evaluado; el modelo puede seleccionar opciones plausibles sin fundamento cuando el estado es ambiguo.
- Sesgos derivados de la distribución `general` de empresas sintéticas; no se documentan análisis de sesgo.
- Licencia Apache 2.0 permite uso comercial, pero la idoneidad para producción no está respaldada por evaluaciones externas.
- Dependencia del modelo base Qwen3.5-0.8B, cuyos términos y disponibilidad deben verificarse por separado.
- Sin soporte documentado de tool calling, agentes o multi-step reasoning.

## Enlaces

- Hugging Face: https://huggingface.co/zero885814/connectailab-rl-grid-empathy-v1
- Repositorio CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/rl_decision_model_qwen_colab.ipynb
- Canal CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- Canal Data Baking Oven: https://www.youtube.com/@Data_Baking_Oven
- Blog del autor: https://blog.naver.com/oven_studio_ai
- Instagram del autor: https://www.instagram.com/bread_mountain
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL de AI CITY BUILDERS: https://www.aicitybuilders.com/robot
- Connect AI: https://www.ezerai.xyz
