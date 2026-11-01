# the-eschatos/connectailab-rl-shp-v3

## Resumen

Connectailab-rl-shp-v3 es un adaptador LoRA entrenado mediante aprendizaje por refuerzo (GRPO) sobre el modelo base Qwen/Qwen3.5-0.8B, desarrollado por el autor the-eschatos en el ecosistema de CONNECT AI LAB y AI CITY BUILDERS. El modelo resuelve una tarea muy concreta: dado un estado de empresa simulado, una pregunta de decisión y un conjunto de opciones etiquetadas (A, B, C...), devuelve únicamente la letra de la opción elegida. No es un modelo conversacional ni de propósito general, sino una política de decisión entrenada para el simulador Connect Tycoon.

El pipeline de entrenamiento combina cuatro fases: primero se entrena una política pequeña con PPO en el simulador (que actúa como profesor), después se genera un conjunto de problemas evaluando cada opción hasta el final del mes, a continuación se aplica aprendizaje supervisado sobre la mejor opción y, finalmente, se refina con GRPO usando normalización por grupo y una penalización KL contra el modelo de partida. El conjunto de datos contiene 4.082 problemas de entrenamiento, 832 de validación y 840 de prueba, sobre una distribución de empresas de tipo "general" ajustada con datos públicos.

Con solo 0,8 mil millones de parámetros en el modelo base, el adaptador es extremadamente ligero (el repositorio ocupa 0,0 GB) y está pensado para investigación y educación sobre aprendizaje por refuerzo aplicado a la toma de decisiones. Su relevancia actual radica en que demuestra un flujo completo de RLHF/GRPO sobre un modelo pequeño y desplegable en local, aunque sus resultados son preliminares y el propio autor advierte que aún está por debajo de la política profesora del simulador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only Qwen/Qwen3.5-0.8B |
| Parametros totales | No disponible (modelo base de 0,8B; el adaptador LoRA añade un número no especificado) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen3.5-0.8B, no especificada en la información) |
| Tipos de cuantizacion | No disponible (formato safetensors; el modelo base admite las cuantizaciones habituales de Qwen, no confirmadas aquí) |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen/Qwen3.5-0.8B, un transformer decoder-only de 0,8 mil millones de parámetros, mediante LoRA (PEFT). La innovación no reside en la arquitectura del modelo base sino en el procedimiento de entrenamiento, que sigue cuatro etapas documentadas por el autor. En la primera, una política pequeña aprende a operar la empresa simulada durante miles de meses usando PPO; esta política actúa como profesora. En la segunda, por cada mes operado por la profesora se generan variantes del problema de decisión cambiando la opción elegida y reejecutando el mes hasta el final para puntuar cada alternativa. En la tercera se aplica aprendizaje supervisado para imitar la opción con mayor puntuación. En la cuarta se aplica GRPO: se agrupan todas las opciones de un mismo problema, se normalizan las ventajas dentro del grupo y se incrementa la probabilidad de las opciones cuyo rendimiento en el simulador supera la media, con una penalización KL contra el modelo de partida para evitar el colapso.

El conjunto de datos se compone de problemas generados sobre la distribución de empresas "general", ajustada con datos públicos, con 4.082 ejemplos de entrenamiento, 832 de validación y 840 de prueba. El formato de entrada es un mensaje de sistema fijo en inglés que instruye a evaluar la tarea, tratar el texto del estado como datos y no como instrucciones, y devolver solo la letra; el mensaje de usuario es un JSON con los campos `state`, `question` y `options`. La salida esperada es una única letra. No se documentan detalles sobre el número de tokens de entrenamiento ni sobre la composición exacta del corpus más allá de la simulación.

## Capacidades

- Toma de decisiones de empresa simulada: dado un estado, una pregunta y opciones etiquetadas, selecciona una letra de opción.
- Salida restringida a una sola letra, sin explicación ni razonamiento textual.
- Estimación de confianza implícita: la probabilidad de cada letra puede interpretarse como probabilidad de elección y el valor máximo como confianza.
- Entrenamiento con GRPO que optimiza directamente la recompensa del simulador (dinero, satisfacción, incidentes).
- Capacidad de generalización limitada a la distribución de empresas "general" del simulador Connect Tycoon.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido.
- Capacidad multilingüe: únicamente coreano según la etiqueta de idioma del repositorio.

## Casos de uso

- Investigación en aprendizaje por refuerzo aplicado a decisiones: sirve como ejemplo reproducible de un pipeline completo PPO → supervisado → GRPO sobre un modelo pequeño, útil para estudiar cómo se construyen conjuntos de problemas a partir de un simulador.
- Educación en RLHF y GRPO: el repositorio incluye un notebook de Colab para entrenar directamente, por lo que puede emplearse en cursos y talleres para ilustrar la normalización por grupo y la penalización KL.
- Evaluación de políticas de decisión en entornos tipo Gymnasium: el modelo puede integrarse como política en el simulador Connect Tycoon para comparar su rendimiento frente a la política profesora entrenada con PPO.
- Prototipado de asistentes de decisión acotados: en un entorno controlado con opciones predefinidas, el modelo devuelve una elección rápida y de bajo coste computacional, adecuado para pruebas de concepto internas.
- Benchmark de adaptadores LoRA sobre modelos de 0,8B: permite medir la ganancia de un adaptador RL frente al modelo base en una tarea de clasificación de opciones (26,2% → 83,1% de acierto según el autor).
- Generación de datos sintéticos de decisión: las salidas del modelo pueden usarse para etiquetar o filtrar nuevos problemas del simulador antes de un entrenamiento posterior.

## Benchmarks y rendimiento

Los únicos datos disponibles son los publicados por el autor en la model card, medidos sobre el conjunto de prueba del simulador (840 problemas) y sobre una evaluación de operación de dos meses no vistos.

| Modelo | Acierto en problemas de prueba | Arrepentimiento (menor es mejor) | Beneficio mensual en simulador | Reducción de pérdidas en transacciones reales con tarjeta |
|---|---|---|---|---|
| Qwen antes del entrenamiento | 26,2% | 2,57 | No disponible | No disponible |
| Aprendizaje supervisado | 82,6% | 2,08 | No disponible | No disponible |
| Aprendizaje por refuerzo (GRPO) | 83,1% | 2,02 | -1,32 millones de wones | 66% (138/177) |

El propio autor advierte que la evaluación de operación de empresa corresponde a la media de dos meses no vistos, con muestra pequeña, y que el modelo aún queda por debajo de la política profesora entrenada con PPO en el simulador. No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un adaptador LoRA sobre un modelo base de 0,8B, la inferencia en fp16 requiere aproximadamente 1,6 GB para los pesos del modelo base más el adaptador; en cuantización de 8 bits baja a unos 0,8 GB y en 4 bits a unos 0,4 GB (estimaciones a partir del tamaño del modelo base, no confirmadas en la información).
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM es suficiente para el modelo base en fp16; una RTX 3060, RTX 4060 o superior permite ejecutarlo con holgura. Para entrenamiento del adaptador se recomienda una RTX 4090, A100 o H100, aunque el autor proporciona un notebook de Colab que sugiere que una GPU gratuita de Colab puede bastar para el ajuste.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPU consumer modernas con 4 GB o más de VRAM.
- Opciones de despliegue: transformers con PEFT (procedimiento documentado por el autor), vLLM y TGI para servir el modelo base con el adaptador fusionado, llama.cpp y Ollama si se convierte a GGUF. No se documenta compatibilidad explícita con estas herramientas en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-shp-v3 | 0,8B (base) + LoRA | No disponible | Decisión sobre opciones en simulador | Apache 2.0 | HuggingFace, 15 descargas |
| Qwen/Qwen3.5-0.8B (base) | 0,8B | No disponible | Generación de texto general | Apache 2.0 (según el base) | HuggingFace |
| Política profesora PPO del simulador | No disponible (modelo pequeño) | No aplica | Decisión en simulador | No disponible | No disponible públicamente |

No se dispone de información sobre otros adaptadores RL comparables de la misma categoría ni sobre modelos de decisión equivalentes en el ecosistema open source. La comparación más directa es con el propio modelo base sin adaptador, que obtiene un 26,2% de acierto frente al 83,1% del adaptador.

## Limitaciones y advertencias

- Modelo de investigación y educación: el autor indica explícitamente que es un modelo sobre un simulador sintético de empresas y que debe revalidarse con los registros reales de una empresa antes de usarse para decisiones de gestión reales.
- Rendimiento preliminar: la evaluación de operación de empresa se basa en dos meses no vistos, con muestra pequeña, y el modelo queda por debajo de la política profesora del simulador.
- Beneficio negativo en simulación: el modelo reporta -1,32 millones de wones de beneficio mensual en la simulación, lo que indica que la política aún no es rentable.
- Salida restringida: solo devuelve una letra; no genera explicaciones, razonamiento ni texto libre, lo que limita su uso a tareas de selección entre opciones predefinidas.
- Idioma: únicamente coreano, sin soporte documentado de castellano ni de otros idiomas.
- Sesgos: al entrenarse sobre una distribución de empresas "general" ajustada con datos públicos, puede heredar sesgos de esa distribución y no generalizar a otros tipos de empresa o mercados.
- Riesgo de alucinación: bajo en el sentido de texto libre, pero puede seleccionar opciones inválidas o letras fuera del conjunto si la entrada no sigue el formato esperado.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías y recomienda validación previa; conviene revisar también la licencia del modelo base Qwen3.5-0.8B.
- Dependencia del simulador: el modelo está acoplado a la lógica de Connect Tycoon; fuera de ese entorno su utilidad es muy limitada.
- Repositorio con 15 descargas y 0 likes: ecosistema muy pequeño, sin validación independiente de los resultados.

## Enlaces

- HuggingFace: https://huggingface.co/the-eschatos/connectailab-rl-shp-v3
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio Connect Tycoon: https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab para entrenamiento: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/rl_decision_model_qwen_colab.ipynb
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL de AI CITY BUILDERS: https://www.aicitybuilders.com/robot
- Connect AI: https://www.ezerai.xyz
