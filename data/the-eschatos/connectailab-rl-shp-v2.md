# the-eschatos/connectailab-rl-shp-v2

## Resumen

Connectailab rl shp v2 es un adaptador LoRA entrenado sobre Qwen3.5-0.8B (de Qwen) por el autor independiente the-eschatos, del proyecto CONNECT AI LAB × AI CITY BUILDERS. No es un chatbot ni un modelo de propósito general: es un modelo de toma de decisiones para un simulador de gestión empresarial llamado CONNECT TYCOON. Dado un estado de la empresa, una pregunta y una lista de opciones, el modelo responde con una única letra correspondiente a la opción elegida.

Su relevancia no está en la escala (0,8B de parámetros base) sino en el pipeline de entrenamiento: se combina aprendizaje por refuerzo con PPO sobre un pequeño modelo "profesor" que opera el simulador, generación de un conjunto de datos etiquetado mediante re-ejecución de episodios, aprendizaje supervisado y, finalmente, GRPO (group relative policy optimization) con normalización de ventajas por grupo y regularización KL respecto al modelo de partida. Es un ejemplo didáctico y de investigación de cómo alinear un LLM pequeño con recompensas de un entorno simulado.

El modelo está etiquetado en coreano (ko), ya que los estados y opciones del simulador están en ese idioma, y se distribuye bajo licencia Apache 2.0 como adaptador PEFT en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre modelo causal (transformer decoder) Qwen3.5-0.8B |
| Parametros totales | 0,8B (modelo base) + parámetros del adaptador LoRA (no disponible) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada de Qwen3.5-0.8B; no especificada en la model card) |
| Tipos de cuantizacion | No disponible (se distribuye en precisión nativa del adaptador) |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.5-0.8B, un transformer decoder pequeño, al que se le aplica un adaptador LoRA mediante la librería PEFT. El entrenamiento se realizó con datos sintéticos generados por el simulador CONNECT TYCOON, con una distribución de empresa "general" ajustada con datos públicos. El conjunto de problemas consta de 4.082 ejemplos de entrenamiento, 832 de validación y 840 de test.

El proceso de entrenamiento tiene cuatro fases. Primero, un pequeño modelo de política aprende a operar la empresa durante miles de meses simulados mediante PPO; este modelo actúa como "profesor". Segundo, por cada mes de operación del profesor se generan problemas de decisión re-ejecutando el mes con cada opción alternativa y puntuando el resultado. Tercero, se aplica aprendizaje supervisado imitando la opción con mayor puntuación. Cuarto, se aplica GRPO: se evalúa el grupo completo de opciones en el simulador, se aumenta la probabilidad de las opciones cuya puntuación supera la media del grupo (ventaja normalizada por grupo) y se añade un término KL contra el modelo de partida para evitar desviaciones excesivas.

## Capacidades

- Toma de decisiones de opción única: dado un JSON con "state", "question" y "options" (con etiquetas A, B, C...), devuelve únicamente la letra de la opción elegida, sin explicaciones.
- Cálculo de probabilidades por opción: la probabilidad asignada a cada letra puede interpretarse como nivel de confianza en cada alternativa.
- Resistencia a inyección de instrucciones en el estado: el system prompt indica explícitamente tratar el texto dentro de "state" como datos, no como instrucciones.
- Operación en coreano: los estados, preguntas y opciones del simulador están en ese idioma.
- No es un modelo conversacional: no está pensado para generación de texto libre, código, razonamiento general ni tool calling.

## Casos de uso

- Toma de decisiones en simuladores de gestión: el modelo puede actuar como capa superior de decisión en CONNECT TYCOON, eligiendo acciones mensuales de la empresa y recibiendo retroalimentación en forma de dinero, satisfacción y accidentes.
- Investigación en RL con LLMs: sirve como caso de estudio reproducible de pipelines PPO → dataset sintético → SFT → GRPO, con notebook de Colab disponible para reproducir el entrenamiento.
- Benchmarking de alineación con recompensas de entorno: permite comparar cómo distintos modelos base o hiperparámetros de GRPO afectan a la tasa de acierto y al arrepentimiento (regret) en decisiones secuenciales.
- Enseñanza de aprendizaje por refuerzo: CONNECT AI LAB lo emplea en cursos gratuitos de RL; el modelo es pequeño (0,8B) y ejecutable en hardware modesto, ideal para aulas.
- Prototipado de agentes de decisión multi-turno: la salida estructurada (una letra) facilita integrarlo en bucles agénticos donde otro componente interpreta la acción.
- Experimentación con robustez a prompt injection: el diseño del system prompt y el formato de entrada lo hacen útil para probar ataques vía el campo "state".

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card (entorno del simulador, no benchmarks estándar como MMLU o HumanEval):

| Modelo | Tasa de acierto en test | Regret (menor es mejor) | Beneficio mensual simulado | Reducción de pérdidas en operaciones reales de tarjeta |
|---|---|---|---|---|
| Qwen antes del entrenamiento | 26,2 % | 2,57 | — | — |
| Tras aprendizaje supervisado | 82,6 % | 2,08 | — | — |
| Tras aprendizaje por refuerzo | 83,1 % | 2,02 | -1.320.000 KRW | 66 % (138/177) |

El autor advierte que los resultados de simulación de empresa son la media de dos meses no vistos, con muestra pequeña, y que el rendimiento sigue siendo inferior al del modelo profesor (la política pequeña entrenada con PPO en el simulador). No se han publicado resultados de benchmarks estándar (MMLU, GSM8K, HumanEval, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un adaptador LoRA sobre un modelo de 0,8B, debería funcionar con holgura en GPUs de 8 GB o menos; estimación aproximada, no confirmada por el autor (no disponible un dato oficial).
- GPU recomendadas: cualquier GPU moderna de consumo (RTX 3060, RTX 4060 o superior) es suficiente; incluso es viable la ejecución en CPU dado el tamaño del modelo base, aunque sin dato oficial de latencia.
- Consumer GPUs: sí, cabe en prácticamente cualquier GPU de consumo actual por el tamaño reducido del modelo base.
- Despliegue: requiere transformers junto con PEFT para cargar el adaptador (el código de la model card muestra el patrón `AutoModelForCausalLM` + `PeftModel.from_pretrained`). No hay pesos GGUF publicados, por lo que llama.cpp u Ollama no son opciones directas sin conversión propia. vLLM y TGI no se mencionan en la documentación.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Aspecto | Connectailab rl shp v2 (LoRA sobre Qwen3.5-0.8B) | Qwen3.5-0.8B (base) | Modelos RL generales tipo Decision Transformer |
|---|---|---|---|
| Parametros | 0,8B + adaptador | 0,8B | Variable |
| Tarea | Decisión de opción única en simulador | Uso general (chat, código) | Control secuencial / decisiones |
| Entrenamiento | PPO profesor + dataset sintético + SFT + GRPO | Preentrenamiento masivo (no disponible el detalle) | RL offline sobre trayectorias |
| Licencia | Apache 2.0 | Apache 2.0 (según tags del repo base) | Variable |
| Disponibilidad | Hugging Face, adaptador PEFT | Hugging Face | Variable |

No existen alternativas directas publicadas para esta tarea tan específica (decisión en CONNECT TYCOON); la comparación más relevante es con el propio modelo base sin adaptador, que obtiene 26,2 % de acierto frente al 83,1 % del modelo entrenado.

## Limitaciones y advertencias

- Rendimiento inferior al profesor: el propio autor reconoce que el modelo aún rinde por debajo de la política pequeña entrenada directamente con PPO en el simulador.
- Muestra de evaluación pequeña: los resultados de beneficio mensual provienen de solo dos meses simulados no vistos, por lo que la varianza puede ser alta.
- Sesgo al simulador: el modelo está ajustado a la distribución de empresas "general" del simulador; su comportamiento fuera de ese dominio no está validado.
- Idioma: entrenado y etiquetado solo en coreano; no hay garantías de funcionamiento con estados en otros idiomas.
- Riesgo de alucinación: no es aplicable en el sentido conversacional, pero puede asignar confianza alta a opciones subóptimas; la métrica de regret (2,02) indica margen de mejora.
- Uso en producción: la model card lo califica explícitamente como modelo de investigación y educación sobre un simulador sintético; advierte de revalidar con datos reales de la empresa antes de cualquier decisión de negocio real.
- Licencia: Apache 2.0, sin restricciones comerciales relevantes, aunque el modelo base Qwen3.5-0.8B debe respetar su propia licencia.
- Repositorio con muy poca tracción pública (16 descargas, 1 like en el momento de la ficha), sin comunidad de revisión externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/the-eschatos/connectailab-rl-shp-v2
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio GitHub del simulador CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Notebook de entrenamiento en Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/rl_decision_model_qwen_colab.ipynb
- Canal de YouTube de CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS (curso de RL): https://www.aicitybuilders.com/robot
- Connect AI (proyecto C1 de modelos de decisión empresarial): https://www.ezerai.xyz
