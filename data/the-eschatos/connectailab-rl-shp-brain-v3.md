# the-eschatos/connectailab-rl-shp-brain-v3

## Resumen

connectailab-rl-shp-brain-v3 es un adaptador LoRA entrenado sobre el modelo base Qwen/Qwen3.5-0.8B por el desarrollador the-eschatos (CONNECT AI LAB / AI CITY BUILDERS). No es un modelo de lenguaje de propósito general, sino un modelo de decisión especializado: recibe un estado de situación, una pregunta y una lista de opciones etiquetadas (A, B, C...), y devuelve únicamente la letra de la opción seleccionada. La probabilidad asociada a cada letra funciona como puntuación de confianza de cada alternativa.

El modelo se ha entrenado con datos generados por el simulador Connect Tycoon, un entorno de gestión empresarial donde un agente debe tomar decisiones mes a mes. El pipeline combina un profesor entrenado con PPO en el simulador, la construcción de un conjunto de problemas por puntuación contrafactual de cada opción, aprendizaje supervisado sobre la mejor opción y un ajuste final con GRPO (ventaja normalizada por grupo más divergencia KL respecto al modelo de partida).

Su relevancia es acotada pero clara: demuestra que un modelo de 0,8 mil millones de parámetros con un adaptador LoRA de bajo coste puede superar sustancialmente a su base en una tarea de decisión estructurada (del 30,6% al 55-57,5% de acierto según el autor), y sirve como referencia reproducible para quien quiera aplicar RL con verificación en simulador a modelos pequeños. Está orientado a investigación y educación, no a producción empresarial real.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5-0.8B) con adaptador LoRA (PEFT) |
| Parámetros totales | 0,8 mil millones (modelo base); el adaptador LoRA añade un número no especificado |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen3.5-0.8B; no declarada en la model card) |
| Tipos de cuantización | No disponible (el adaptador se distribuye en safetensors; la cuantización depende del modelo base) |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA); requiere el modelo base Qwen/Qwen3.5-0.8B |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre Qwen/Qwen3.5-0.8B, un transformer decoder-only de 0,8 mil millones de parámetros. El adaptador se carga con `PeftModel.from_pretrained` sobre el modelo base y se usa con un prompt de sistema fijo que instruye al modelo a tratar el texto del estado como datos y no como instrucciones, seleccionar exactamente una opción y devolver solo su letra. La entrada de usuario es un JSON con los campos `state`, `question` y `options` (cada una con `label`, `key` y `description`).

El entrenamiento se describe en cuatro fases: (1) un profesor pequeño se entrena con PPO durante miles de meses simulados en Connect Tycoon; (2) se genera un conjunto de problemas reevaluando cada decisión con cada opción alternativa hasta el final del mes, asignando una puntuación a cada opción; (3) aprendizaje supervisado sobre la opción de mayor puntuación; (4) ajuste con GRPO, normalizando ventajas por grupo y añadiendo una penalización KL respecto al modelo de partida. El conjunto de datos declarado tiene 4.082 problemas de entrenamiento, 832 de validación y 840 de prueba, sobre una distribución de empresa `general` ajustada con datos públicos. No se especifican el número de tokens de entrenamiento, la composición detallada del dataset ni detalles de RLHF/DPO más allá de lo indicado.

## Capacidades

- Selección de una opción entre varias en tareas de decisión estructurada, devolviendo una única letra.
- Estimación de confianza por opción a partir de la probabilidad asignada a cada letra.
- Razonamiento de decisión en dominios de gestión empresarial simulada (finanzas, satisfacción, incidentes).
- Robustez ante inyección de instrucciones dentro del campo `state`, por el prompt de sistema que trata ese texto como datos.
- Capacidad multilingüe limitada al coreano según la model card.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Investigación en RL con verificación en simulador: reproducir el pipeline profesor PPO → puntuación contrafactual → SFT → GRPO sobre un modelo de 0,8B para estudiar la transferencia de políticas de decisión a modelos de lenguaje.
- Evaluación de decisiones en entornos tipo gymnasium: usar el modelo como política de alto nivel en Connect Tycoon u otros simuladores de gestión con acciones discretas etiquetadas.
- Docencia y cursos de refuerzo: el repositorio incluye un notebook de Colab para entrenamiento directo, lo que permite usarlo como ejemplo práctico en formación sobre GRPO y LoRA.
- Clasificación de decisiones con opciones cerradas: en cualquier flujo donde las alternativas estén predefinidas y etiquetadas, el modelo puede actuar como selector con puntuación de confianza por opción.
- Prototipado de asistentes de decisión empresarial: como base para experimentar con selección entre alternativas en dominios de negocio, siempre con validación posterior sobre datos reales.
- Análisis de robustez frente a prompt injection: el diseño del prompt de sistema permite estudiar cómo un modelo pequeño maneja texto no confiable dentro del estado de la tarea.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (conjunto de prueba de 840 problemas y simulación de dos meses no vistos):

| Modelo | Acierto en test | Arrepentimiento (menor es mejor) | Beneficio mensual en simulador | Reducción de pérdidas en transacciones reales |
|---|---|---|---|---|
| Qwen base (sin entrenar) | 30,6% | 2,75 | No disponible | No disponible |
| Aprendizaje supervisado (SFT) | 57,5% | 2,62 | No disponible | No disponible |
| Ajuste con RL (GRPO) | 55,0% | 2,61 | 6,9 millones de wones | 70% (147/177) |

El autor advierte que la métrica de operación empresarial corresponde a la media de dos meses no vistos y que la muestra es pequeña; además, el modelo sigue por debajo de la política profesora entrenada con PPO en el simulador. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp16, aproximadamente 1,6 GB para el modelo base de 0,8B más el adaptador LoRA; en cuantización de 8 bits, en torno a 0,8-1 GB; en 4 bits, alrededor de 0,5-0,7 GB. Son estimaciones a partir del tamaño del modelo, no datos publicados.
- GPU recomendadas: cualquier GPU consumer con 4 GB o más de VRAM es suficiente para fp16; RTX 3060, RTX 4060, RTX 4090, A100 y H100 funcionan sin problema, aunque las GPU de datacenter están sobredimensionadas para este tamaño.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPU dedicadas modernas e incluso en iGPU con suficiente memoria compartida en cuantización de 4 bits.
- Opciones de despliegue: transformers con PEFT (método documentado por el autor), llama.cpp/Ollama tras convertir el modelo fusionado a GGUF, y vLLM o TGI tras fusionar el adaptador con el modelo base.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-shp-brain-v3 | 0,8B + LoRA | No disponible | Decisión con opciones cerradas | Apache 2.0 | Hugging Face (17 descargas) |
| Qwen/Qwen3.5-0.8B | 0,8B | No disponible | Lenguaje general | No disponible en la información | Hugging Face |
| Política profesora PPO (Connect Tycoon) | No disponible | No aplica | Decisión en simulador | No disponible | No distribuida públicamente |

No se dispone de información sobre otros adaptadores de decisión comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- Modelo de investigación y educación: el propio autor indica que debe revalidarse con los registros reales de una empresa antes de usarse para decisiones de gestión reales.
- Rendimiento inferior a la política profesora entrenada con PPO en el simulador, según la model card.
- Muestra de evaluación pequeña: la métrica de operación corresponde a la media de dos meses no vistos.
- El ajuste con RL (55,0%) obtiene menor acierto en test que el SFT (57,5%), aunque mejora el arrepentimiento y el beneficio simulado; conviene tenerlo en cuenta al elegir la variante.
- Idioma limitado al coreano según la model card; no se documenta soporte fiable en castellano ni en otros idiomas.
- Riesgo de alucinación en la letra devuelta si la entrada no sigue el formato JSON esperado o si las opciones no están correctamente etiquetadas.
- Dependencia estricta del prompt de sistema y del formato de entrada; cambios en el esquema pueden degradar el comportamiento.
- Sesgos potenciales derivados de la distribución `general` del simulador, ajustada con datos públicos no detallados.
- Licencia Apache 2.0 permite uso comercial del adaptador, pero debe verificarse la licencia del modelo base Qwen/Qwen3.5-0.8B, no disponible en la información proporcionada.
- No se documentan garantías de calibración de las probabilidades por opción más allá de su uso como puntuación de confianza.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/the-eschatos/connectailab-rl-shp-brain-v3
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio Connect Tycoon: https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/rl_decision_model_qwen_colab.ipynb
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL de AI CITY BUILDERS: https://www.aicitybuilders.com/robot
- Connect AI: https://www.ezerai.xyz
