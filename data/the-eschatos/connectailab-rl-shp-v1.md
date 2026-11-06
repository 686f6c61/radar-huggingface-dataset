# the-eschatos/connectailab-rl-SHP-v1

## Resumen

Connectailab rl SHP v1 es un adaptador LoRA entrenado sobre Qwen/Qwen3.5-0.8B por el autor the-eschatos (CONNECT AI LAB × AI CITY BUILDERS). No es un modelo conversacional general: es un modelo de toma de decisiones empresariales que lee una situación, una pregunta y una lista de opciones, y responde únicamente con la letra de la opción elegida. El objetivo es servir de capa de decisión para el simulador de empresa CONNECT TYCOON, donde el modelo opera como "director" que toma decisiones diarias y recibe retroalimentación en forma de dinero, satisfacción y accidentes.

Su relevancia reside en el método de entrenamiento: se combina un pipeline clásico de aprendizaje por refuerzo (una política pequeña entrenada con PPO en el simulador actúa de "profesor"), generación de un conjunto de datos etiquetado re-simulando meses con cada opción, aprendizaje supervisado sobre la mejor opción y, finalmente, RL con GRPO (ventaja estandarizada por grupos + regularización KL respecto al modelo base). Es un ejemplo didáctico y compacto de cómo alinear un LLM pequeño con señales de recompensa de un entorno simulado.

El modelo base tiene 0,8B parámetros y el adaptador se distribuye en safetensors mediante la librería PEFT, por lo que es ejecutable en hardware muy modesto. Está orientado al coreano (idioma declarado del modelo) y bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre Qwen3.5-0.8B (transformer causal LM) |
| Parametros totales | 0,8B (modelo base) + parámetros del adaptador LoRA (no disponible) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo pesos del adaptador en safetensors) |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

Técnicamente, el artefacto publicado es un adaptador LoRA (library_name: peft) que se aplica sobre Qwen/Qwen3.5-0.8B. El pipeline de entrenamiento descrito en la model card tiene cuatro fases: (1) una política pequeña se entrena con PPO dentro del simulador CONNECT TYCOON operando la empresa durante miles de días, y esa política actúa como profesor; (2) por cada mes de operación del profesor se generan "problemas" alterando las opciones de una decisión y re-simulando el mes completo hasta el final, puntuando cada opción; (3) se aplica aprendizaje supervisado imitando la opción con mayor puntuación; (4) se aplica RL con GRPO, tratando todas las opciones como un grupo, aumentando la probabilidad de las opciones cuya puntuación de simulador supera la media del grupo (ventaja estandarizada por grupos) con penalización KL respecto al modelo de partida.

El dataset sintético proviene de empresas de tipo "general" ajustadas con datos públicos, con 4.082 problemas de entrenamiento, 832 de validación y 840 de test. El formato de entrada es JSON con campos `state`, `question` y `options` (con `label`, `key`, `description`), y la salida esperada es una única letra. La model card incluye una instrucción de sistema explícita para tratar el texto dentro de `state` como datos y no como instrucciones, una medida básica frente a inyección de prompts. No se especifican número de épocas, rank de LoRA ni hiperparámetros.

## Capacidades

- Clasificación de decisiones de gestión empresarial: dada una situación, una pregunta y opciones etiquetadas, devuelve la letra de una única opción.
- Salida estructurada y determinista: responde solo con la letra, sin explicaciones, lo que facilita su integración en pipelines automáticos.
- Probabilidades por opción: puede derivarse la confianza (la opción con mayor probabilidad es el nivel de "convicción" del modelo).
- Optimizado para el simulador CONNECT TYCOON: las decisiones afectan a métricas de dinero, satisfacción y accidentes.
- Resistencia básica a inyección de instrucciones vía prompt de sistema que trata el estado como datos.
- No es un modelo de chat general: no está diseñado para conversación abierta, generación de código ni razonamiento libre.
- Capacidades multilingües: no disponible (idioma declarado: coreano).
- Tool calling / function calling: no disponible como capacidad nativa; la integración con el simulador se hace por formato de entrada/salida.

## Casos de uso

- Agente decisor en el simulador CONNECT TYCOON: el modelo evalúa cada decisión diaria de la empresa virtual (contrataciones, inversiones, gestión de crisis) y devuelve la opción elegida, integrándose directamente en el bucle del simulador.
- Investigación en RL para LLM: sirve como caso de estudio reproducible del pipeline PPO → dataset etiquetado → SFT → GRPO, con notebook de Colab disponible para replicar el entrenamiento.
- Benchmark de toma de decisiones con opciones múltiples: con 840 problemas de test etiquetados, puede usarse para comparar políticas o variantes de entrenamiento de forma cuantificada (precisión y regret).
- Prototipado de agentes de decisión en entornos simulados: el formato JSON de entrada (`state`, `question`, `options`) es un patrón reutilizable para otros simuladores o juegos de gestión.
- Docencia en aprendizaje por refuerzo aplicado a LLM: el proyecto va acompañado de cursos gratuitos de RL y material en YouTube, útil como material didáctico.
- Estudio de robustez frente a inyección de prompts: el diseño con estado como datos y salida de una sola letra permite experimentar con ataques a través del campo `state`.
- Clasificación de texto de bajo coste en coreano: al ser un modelo de 0,8B con LoRA, puede adaptarse como clasificador de opciones en tareas de opción múltiple embebidas en dispositivos modestos.

## Benchmarks y rendimiento

Resultados publicados por el autor (entorno del simulador CONNECT TYCOON; "regret" menor es mejor; beneficio de un mes simulado en wones coreanos; la última columna mide transacciones reales de tarjetas con reducción de pérdidas):

| Modelo | Precisión en test | Regret | Beneficio mensual simulado | Transacciones reales / reducción de pérdidas |
|---|---|---|---|---|
| Qwen3.5-0.8B sin entrenar | 30,4 % | 2,67 | — | — |
| Tras aprendizaje supervisado | 77,9 % | 1,91 | — | — |
| Tras RL (GRPO) | 77,7 % | 1,91 | 10,94 millones de KRW | 71 % (145/177) |

El propio autor advierte que son resultados de una primera experimentación: el beneficio se mide como media de dos meses no vistos, la muestra es pequeña y el modelo aún rinde por debajo de la política profesora (la política pequeña entrenada con PPO en el simulador). No se han publicado benchmarks estándar (MMLU, HumanEval, GSM8K, etc.).

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 0,8B con adaptador LoRA, cabe con holgura en GPUs de consumo; una estimación razonable en fp16 es del orden de 2-3 GB de VRAM (dato exacto no disponible en la model card).
- GPU recomendadas: cualquier GPU moderna; no se requiere A100 ni H100. Una RTX 3060 o superior es más que suficiente, e incluso es viable en CPU dada la escala del modelo base.
- Consumer GPUs: sí, cabe en prácticamente cualquier GPU de consumo actual (RTX 3060, 4060, 4090, etc.).
- Despliegue: el código de la model card usa transformers + peft (PeftModel.from_pretrained). La compatibilidad con vLLM, llama.cpp, Ollama o TGI no está documentada; al ser un adaptador LoRA sobre Qwen, vLLM soporta LoRA en teoría, pero no hay instrucciones oficiales (no disponible).
- Latencia y throughput: no disponible. Al tratarse de generación de una sola letra con un modelo de 0,8B, la latencia por decisión debería ser muy baja, pero no hay mediciones publicadas.
- Entrenamiento: existe un notebook de Google Colab oficial para reproducir el entrenamiento, lo que indica que es viable en hardware de Colab gratuito o estándar.

## Comparativa con modelos similares

| Modelo | Tipo | Base / tamaño | Licencia | Enfoque |
|---|---|---|---|---|
| connectailab-rl-SHP-v1 | Adaptador LoRA de RL | Qwen3.5-0.8B + LoRA | Apache 2.0 | Decisión de gestión en simulador (coreano) |
| Qwen/Qwen3.5-0.8B (base) | LLM general | 0,8B | no disponible en la ficha | Uso general; 30,4 % de precisión en el test del proyecto |
| Variantes del mismo autor (p. ej. connectailab-rl-jay-v1, citado en el código de ejemplo) | Adaptador LoRA de RL | Qwen3.5-0.8B + LoRA | no disponible | Misma tarea de decisión, variante distinta |

No existen alternativas públicas ampliamente conocidas de la misma categoría exacta (LLM pequeño afinado por RL sobre un simulador de gestión empresarial en coreano); la comparación más pertinente es con el modelo base sin ajustar y con las otras variantes del propio proyecto CONNECT TYCOON.

## Limitaciones y advertencias

- Rendimiento por debajo de la política profesora: el propio autor indica que el modelo aún no supera a la política pequeña entrenada con PPO, por lo que no representa el estado del arte del proyecto.
- Muestra de evaluación pequeña: el beneficio mensual simulado se calcula sobre dos meses no vistos; los resultados pueden no ser estadísticamente robustos.
- Riesgo de alucinación: aunque la salida es una sola letra, el modelo puede elegir opciones subóptimas o inconsistentes fuera de la distribución del simulador; no hay datos de generalización a dominios distintos.
- Idioma: entrenado y declarado para coreano; no hay garantías de funcionamiento en español u otros idiomas.
- Sesgos: el dataset es sintético y proviene de empresas de tipo "general" generadas con datos públicos; los sesgos del simulador y de esos datos se transfieren al modelo. Análisis de sesgos específico: no disponible.
- Uso comercial: la licencia Apache 2.0 lo permite, pero el autor advierte explícitamente que es un modelo de investigación y educación sobre un simulador sintético; antes de usarlo en decisiones empresariales reales debe revalidarse con los registros de la empresa concreta.
- Seguridad de prompts: la defensa contra inyección se apoya en una instrucción de sistema; no hay evaluaciones formales de robustez frente a ataques mediante el campo `state`.
- Datos incompletos: longitud de contexto, rank de LoRA, hiperparámetros de entrenamiento y soporte de runtimes de inferencia concretos no están documentados.
- Adopción muy temprana: 20 descargas y 1 like en el momento de la ficha, sin comunidad de revisión externa.

## Enlaces

- Hugging Face: https://huggingface.co/the-eschatos/connectailab-rl-SHP-v1
- Repositorio GitHub del proyecto CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Notebook de entrenamiento en Google Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/rl_decision_model_qwen_colab.ipynb
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Canal de YouTube de CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS (curso de RL): https://www.aicitybuilders.com/robot
- Connect AI (proyecto de modelos de decisión empresarial C1): https://www.ezerai.xyz
