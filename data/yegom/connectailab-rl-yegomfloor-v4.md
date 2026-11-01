# yegom/connectailab-rl-yegomfloor-v4

## Resumen

`connectailab-rl-yegomfloor-v4` es un adaptador LoRA sobre el modelo base `Qwen/Qwen3.5-0.8B`, desarrollado por el autor independiente yegom (Park Sehyun) en el marco de CONNECT AI LAB. No es un modelo de propósito general: es un cabezal de decisión de empresa entrenado por refuerzo que lee un estado, una pregunta y una lista de opciones, y devuelve exactamente la letra de una de ellas. El objetivo declarado es automatizar decisiones operativas dentro del simulador CONNECT TYCOON.

La relevancia es acotada y experimental. El autor reporta que el adaptador alcanza un 74,4 % de acierto en un conjunto de test de 840 problemas y una ganancia mensual de 399만원 (aproximadamente 399 000 wones) en el simulador, con una reducción del 37 % de las pérdidas en un experimento de tarjetas. Son cifras de un primer experimento con muestra pequeña (dos meses de operación) y el propio autor reconoce que queda por debajo de la política profesora entrenada con PPO.

El modelo base Qwen3.5-0.8B aporta la arquitectura transformer y el tokenizador; el adaptador solo añade los pesos LoRA. La licencia es Apache 2.0 y el idioma declarado es coreano. No hay información publicada sobre la longitud de contexto efectiva del adaptador ni sobre cuantizaciones específicas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5-0.8B) con adaptador LoRA (PEFT) |
| Parametros totales | No disponible (el adaptador LoRA no declara su recuento; el base es de 0,8B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen3.5-0.8B mediante PEFT y entrena con LoRA. El pipeline declarado es `reinforcement-learning` y las etiquetas incluyen GRPO, deep reinforcement learning, gymnasium y decision-making. El proceso descrito en la model card tiene cuatro fases: primero, una política pequeña aprende a operar la empresa durante miles de meses en el simulador con PPO y actúa como profesora; segundo, se genera un banco de problemas alternando las opciones de cada decisión y reejecutando el mes completo para puntuar cada alternativa; tercero, se hace aprendizaje supervisado sobre la opción de mayor puntuación; cuarto, se aplica refuerzo con normalización de ventajas por grupo (GRPO) y una penalización KL contra el modelo de partida.

Los datos proceden de una distribución de empresas sintética denominada `general`, ajustada a datos públicos, con 4 082 problemas de entrenamiento, 832 de validación y 840 de test. El autor no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni la configuración de hiperparámetros del LoRA.

## Capacidades

- Selección de una opción entre varias: recibe un JSON con `state`, `question` y `options`, y devuelve una única letra.
- Decisión secuencial en un entorno tipo gymnasium (CONNECT TYCOON) con recompensas de dinero, satisfacción y accidentes.
- Salida restringida: el prompt de sistema fuerza a devolver solo la letra, sin explicación.
- Interpretación de texto de estado como datos, no como instrucciones (defensa básica frente a inyección de prompt según el system prompt del autor).
- No se declaran capacidades de generación libre, código, matemáticas, visión, audio ni tool calling.
- Multilingüe: no; el idioma declarado es únicamente coreano.

## Casos de uso

- Simulación de decisiones empresariales: integrado en CONNECT TYCOON para elegir la opción de mayor valor esperado en cada mes simulado; es el escenario para el que fue entrenado y el único con evidencia publicada.
- Investigación en RL aplicado a decisión: sirve como referencia reproducible de un pipeline PPO → supervisado → GRPO sobre un modelo pequeño, útil para comparar metodologías en entornos de decisión discretos.
- Evaluación de agentes en entornos con opciones discretas: el formato de salida de una letra facilita el parseo automático en bucles de evaluación tipo gymnasium.
- Docencia y formación: el autor lo publica como material educativo con cuaderno de Colab y curso asociado, adecuado para demostrar cómo se entrena un cabezal de decisión con LoRA.
- Pruebas de robustez frente a inyección de prompt: el system prompt separa datos de instrucciones, lo que permite experimentar con estados adversariales en un entorno controlado.
- Prototipado de asistentes de decisión con restricciones de formato: si se necesita una salida categórica estricta, el adaptador ilustra el patrón de forzar una letra como única respuesta válida.

## Benchmarks y rendimiento

Datos reportados por el autor en la model card (conjunto de test de 840 problemas y simulación de dos meses):

| Modelo | Acierto en test | Arrepentimiento (menor es mejor) | Beneficio mensual en simulador | Pérdidas reducidas en tarjetas |
|---|---|---|---|---|
| Qwen antes del entrenamiento | 32,3 % | 5,45 | No disponible | No disponible |
| Aprendizaje supervisado | 73,8 % | 3,86 | No disponible | No disponible |
| Refuerzo (este adaptador) | 74,4 % | 3,84 | 399 000 wones | 37 % (91/177) |

El autor advierte que la muestra de operación es pequeña (media de dos meses no vistos) y que el adaptador sigue por debajo de la política profesora entrenada con PPO. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; al montar sobre un modelo base de 0,8B, la inferencia en fp16 requiere del orden de 2 GB, y en cuantización de 4 bits alrededor de 1 GB, aunque estas cifras son estimaciones a partir del tamaño del base y no datos publicados.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM debería poder ejecutar el modelo base; no hay requisitos específicos publicados para el adaptador.
- Cabe en GPU consumer: sí, previsiblemente en RTX 3060, RTX 4060 y superiores, dado el tamaño del base.
- Despliegue: el autor documenta el uso con `transformers` + `peft` (`PeftModel.from_pretrained`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Como referencia estructural, el adaptador se apoya en Qwen3.5-0.8B, pero no se han publicado comparativas con otros adaptadores de decisión ni con modelos de RL para entornos gymnasium.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| connectailab-rl-yegomfloor-v4 | No disponible (base 0,8B) | No disponible | Apache 2.0 | HuggingFace |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Entrenado exclusivamente para el simulador CONNECT TYCOON; su comportamiento fuera de esa distribución no está validado.
- El propio autor indica que es un modelo de investigación y educación y recomienda revalidar con los registros reales de cada empresa antes de usarlo en decisiones de negocio.
- Muestra de evaluación pequeña: dos meses no vistos en simulación y 840 problemas de test; las cifras de beneficio y reducción de pérdidas tienen alta varianza.
- Rendimiento inferior a la política profesora PPO según el autor.
- Idioma limitado al coreano; no se declara soporte multilingüe.
- Riesgo de alucinación en la selección de opción: puede devolver una letra válida sin que la decisión sea correcta, y el formato de salida no incluye justificación ni nivel de confianza explícito más allá de la probabilidad de la letra.
- Sesgos: al entrenarse sobre una distribución sintética `general`, puede heredar sesgos de los datos públicos usados para calibrarla; no se detallan auditorías.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad sobre decisiones reales recae en el integrador.
- No hay información sobre cuantizaciones oficiales ni sobre el comportamiento del adaptador tras cuantizar el base.

## Enlaces

- HuggingFace: https://huggingface.co/yegom/connectailab-rl-yegomfloor-v4
- Repositorio CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Cuaderno de Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/rl_decision_model_qwen_colab.ipynb
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL: https://www.aicitybuilders.com/robot
- Connect AI: https://www.ezerai.xyz
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
