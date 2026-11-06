# WithHaebom/connectailab-rl-haebom-v1-teacher

## Resumen

`connectailab-rl-haebom-v1-teacher` es un modelo de política de refuerzo (reinforcement learning) desarrollado por WithHaebom dentro del laboratorio CONNECT AI LAB, en colaboración con AI CITY BUILDERS. No es un modelo de lenguaje generativo, sino un agente de toma de decisiones entrenado para operar una empresa simulada durante un ciclo de 20 días laborables (un "mes" de juego) dentro del entorno CONNECT TYCOON. El modelo recibe el estado de la compañía en formato JEV (`typesafe/jev-1.13`) y devuelve decisiones discretas sobre asignación de personal, reposición de inventario, marketing, atención al cliente, reembolsos y seguridad.

La arquitectura interna no se detalla en la model card: el paquete se distribuye con `library_name: numpy` y el pipeline declarado es `reinforcement-learning`, lo que sugiere una política implementada como red neuronal ligera o tabla de parámetros exportada a NumPy, sin pesos en formato transformer. El entrenamiento combina una fase de imitación de un "presidente por reglas" (aprendizaje supervisado) con un ajuste posterior mediante PPO guiado por una función de recompensa multiobjetivo con tres componentes: beneficio, satisfacción del cliente y riesgo.

Su relevancia es acotada pero concreta: sirve como ejemplo reproducible de cómo entrenar y desplegar un agente RL de decisión empresarial sobre un simulador sintético, con métricas declaradas frente a la línea base de reglas. La model card advierte explícitamente que se trata de un modelo educativo sobre un simulador y que no garantiza ni predice resultados de gestión real.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de reinforcement learning (detalle de red no disponible); empaquetado con `numpy` |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto textual; consume un estado estructurado JEV por paso) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (distribución vía `connect-tycoon` y Hugging Face Hub; no se especifica safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo se entrena en dos etapas según la model card: primero una fase de aprendizaje supervisado en la que imita a un "presidente por reglas" (rule-based president) que opera la empresa simulada, y después un ajuste con PPO (Proximal Policy Optimization) usando como señal de recompensa los valores de la compañía `{"이익": 1.0, "고객 만족": 1.0, "위험": 1.0}` (beneficio, satisfacción del cliente y riesgo, con peso unitario cada uno). El entorno es un simulador de empresa con configuración fija: almacén de 250 unidades, demanda base de 40, coste unitario de 1.5, escala de pedido 1.0, sin bonus de personal, salario 0.0, poder publicitario 1.0, sin herramienta antifraude, sin atención al cliente extra y sin reembolso extra.

La interfaz de decisión es JEV (`typesafe/jev-1.13`), un formato de preguntas y respuestas tipadas: el modelo recibe un estado (por ejemplo, departamento `refund`, motivo `불량`, nivel `신규`, importe 6.0, `fraud_score` 0.1113) y devuelve una elección entre alternativas con probabilidades asociadas y un campo `reason`. En el ejemplo de la model card, la política asigna 0.9921 a "reembolso total", 0.0003 a "reembolso parcial", 0.0003 a "denegar" y 0.0074 a "revisión humana". No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Toma de decisiones discretas multiopción sobre estados estructurados de empresa simulada: asignación de personal, pedidos de inventario, marketing, atención al cliente, reembolsos y seguridad.
- Salida en formato JEV con distribución de probabilidades por alternativa y campo de justificación (`reason`), lo que permite umbrales de confianza y derivación a revisión humana.
- Aprendizaje por refuerzo con PPO sobre una recompensa multiobjetivo (beneficio, satisfacción, riesgo).
- Imitación de una política de reglas como arranque (supervised warm-start) antes del ajuste RL.
- Integración con el simulador CONNECT TYCOON mediante `CompanyBrain.from_hub(...)` y el comando `connect-tycoon play --brain hf:...`.
- Capacidad multilingüe limitada al coreano según el campo `language`.
- No dispone de generación de texto libre, razonamiento simbólico general, código, matemáticas, visión, audio, tool calling genérico ni modo "thinking".

## Casos de uso

- **Evaluación de políticas de decisión en simuladores empresariales**: usar el modelo como agente de referencia en un entorno CONNECT TYCOON para comparar contra la línea base de reglas y medir beneficio, satisfacción y siniestralidad en ciclos de 20 días.
- **Docencia y divulgación de RL aplicado**: el modelo sirve como ejemplo completo de pipeline (imitación + PPO + despliegue vía Hub) en cursos de reinforcement learning, con la ventaja de que el simulador y el agente están empaquetados y son ejecutables en Colab.
- **Prototipado de agentes de decisión con salida tipada JEV**: sirve para probar integraciones que consumen respuestas estructuradas con probabilidades y campo de razón, antes de sustituir la política por una versión propia o por un LLM con tool calling.
- **Investigación sobre recompensas multiobjetivo**: permite experimentar con ponderaciones alternativas de beneficio, satisfacción y riesgo y observar cómo cambia la distribución de decisiones (por ejemplo, cuánto sube la derivación a humano al penalizar más el riesgo).
- **Generación de datos sintéticos de decisiones**: ejecutar el agente sobre muchos estados del simulador para producir trazas etiquetadas que alimenten un clasificador supervisado o un sistema de reglas destilado.
- **Pruebas de integración de un "cerebro" externo en un juego/simulador**: validar el contrato de la API `CompanyBrain` (entrada JEV, salida JEV) en un entorno controlado antes de conectar políticas más costosas.
- **Análisis de sensibilidad a umbrales de confianza**: con probabilidades por alternativa, se puede calibrar cuándo derivar a humano; en el ejemplo de la model card, la política es muy confiada (0.9921) en el reembolso total, lo que permite fijar umbrales estrictos sin disparar la tasa de escalado.

## Benchmarks y rendimiento

Resultados declarados en la model card frente a la política de reglas, sobre media de 40 meses no vistos:

| Métrica (media 40 meses) | Presidente por reglas | jay-company (este modelo) |
|---|---|---|
| Beneficio mensual | 7,08 M KRW | 17,19 M KRW |
| Satisfacción del cliente | 71 % | 96 % |
| Incidentes de riesgo | 11,5 | 1,9 |
| Escalados a revisión humana | 69,5 | 14,8 |
| Días sin stock | 9,1 | 0,4 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, y no serían aplicables a este tipo de modelo.

## Requisitos de hardware

- Al estar empaquetado con `numpy` y sin pesos transformer declarados, la inferencia es de muy baja exigencia: cabe en CPU y en cualquier GPU consumer, e incluso en entornos sin GPU.
- VRAM estimada: no disponible con precisión; por el tipo de artefacto, previsiblemente por debajo de 1 GB.
- GPU recomendadas: no aplica; cualquier CPU moderna es suficiente para el bucle de decisión del simulador.
- Despliegue: paquete `connect-tycoon` (`pip install "connect-tycoon[game]"`), carga vía `CompanyBrain.from_hub("WithHaebom/connectailab-rl-haebom-v1-teacher")` y ejecución con `connect-tycoon play --brain hf:...`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia y throughput: no disponibles; dependen del simulador, no del modelo.

## Comparativa con modelos similares

No se dispone en la información proporcionada de modelos comparables de la misma categoría (políticas RL para simulación empresarial publicadas en Hugging Face con métricas equivalentes). La comparación más directa disponible es contra la política de reglas del propio entorno, recogida en la tabla de benchmarks.

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-haebom-v1-teacher | Política RL (JEV) | no disponible | no aplica | Apache 2.0 | Hugging Face Hub |
| Presidente por reglas (CONNECT TYCOON) | Sistema de reglas | no aplica | no aplica | la del repositorio `connect-tycoon` | GitHub |
| Alternativas RL de decisión empresarial | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo educativo sobre un simulador sintético: la propia model card indica que no garantiza ni predice resultados de gestión reales.
- Entrenado y validado en una configuración concreta de empresa (`warehouse` 250, `base_demand` 40, `unit_cost` 1.5, sin salario, sin bonus de personal, sin antifraude); el comportamiento fuera de esa distribución no está caracterizado.
- Idiomas: solo coreano declarado; los estados y criterios JEV están en coreano.
- Riesgo de sobreajuste a la política de reglas imitada en la fase supervisada y a la función de recompensa concreta (pesos 1.0/1.0/1.0); cambiar los pesos puede degradar el rendimiento sin reentrenamiento.
- Ausencia de datos publicados sobre tamaño de parámetros, arquitectura exacta y proceso de evaluación: difícil de auditar y de reproducir más allá del notebook de Colab enlazado.
- Sin métricas de calibración de las probabilidades de salida; el uso de `confidence` para umbrales de derivación a humano requiere validación propia.
- Licencia Apache 2.0 permite uso comercial del artefacto, pero el valor práctico está limitado al simulador CONNECT TYCOON y a tareas de decisión tipadas JEV; no es un sustituto de un LLM para atención al cliente real ni para gestión empresarial.
- Advertencia de la propia model card: el experimento de "model connect" (Connect AI) está en fase de pruebas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/WithHaebom/connectailab-rl-haebom-v1-teacher
- Repositorio CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Notebook de entrenamiento en Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/rl_decision_model_qwen_colab.ipynb
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS (curso de RL): https://www.aicitybuilders.com/robot
- Connect AI: https://www.ezerai.xyz
- Formato JEV referenciado: `typesafe/jev-1.13` (identificador citado en la model card; no se proporciona URL directa)
