# sung-hoon/connectailab-rl-connectailab-rl-kribrain-v1-teacher

## Resumen

El modelo `sung-hoon/connectailab-rl-connectailab-rl-kribrain-v1-teacher` es una política de aprendizaje por refuerzo (RL) desarrollada por CONNECT AI LAB en colaboración con AI CITY BUILDERS, publicada en HuggingFace bajo el identificador del autor `sung-hoon`. No se trata de un modelo de lenguaje generativo, sino de un agente de toma de decisiones entrenado para dirigir una compañía sintética dentro del simulador CONNECT TYCOON, actuando como la "corteza prefrontal" del sistema de decisión empresarial. El modelo recibe un estado del entorno (por ejemplo, una solicitud de reembolso con motivo, nivel de cliente, importe y puntuación de fraude) y emite una decisión discreta con sus probabilidades asociadas.

El problema que resuelve es la automatización de decisiones operativas multi-paso en un entorno de negocio simulado: asignación de personal, pedidos de inventario, marketing, atención al cliente, gestión de reembolsos y seguridad. El entrenamiento combina una fase de aprendizaje supervisado imitando a un "presidente basado en reglas" y una fase posterior de ajuste con PPO (Proximal Policy Optimization) guiada por una función de recompensa basada en el valor de la compañía (beneficio, satisfacción del cliente y aversión al riesgo, ponderados a 1.0 cada uno). El resultado es una política que, según la propia model card, supera claramente a la línea base de reglas en métricas de negocio simuladas.

Es relevante ahora por su enfoque de empaquetado fuera del ecosistema típico de LLM: la librería declarada es `numpy` y el pipeline es `reinforcement-learning`, lo que lo sitúa como un agente ligero de decisión con salida estructurada en formato JEV (`typesafe/jev-1.13`), pensado para integrarse en simuladores, juegos y material educativo. El modelo está etiquetado como modelo docente sobre simulación de empresa sintética y no garantiza ni predice resultados de gestión reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de aprendizaje por refuerzo (PPO); arquitectura de red interna no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (agente de decisión sobre estado; no es un modelo de lenguaje con ventana de contexto) |
| Tipos de cuantizacion | no disponible (pesos servidos en formato numpy; no se documentan cuantizaciones alternativas) |
| Idiomas soportados | coreano (ko) |
| Licencia | apache-2.0 |
| Formato de pesos | numpy (libreria declarada: `numpy`) |

## Arquitectura y entrenamiento

Se trata de una política de decisión entrenada con PPO, cuyo cometido es operar una compañía en CONNECT TYCOON durante un ciclo mensual (20 días laborables). El proceso de entrenamiento descrito en la model card tiene dos etapas: primero un aprendizaje supervisado en el que el modelo imita a un "presidente basado en reglas", y después un ajuste con PPO en el que las decisiones se corrigen en función de una recompensa derivada del valor de la empresa. La función de valor declarada pondera beneficio, satisfacción del cliente y riesgo con pesos `{"이익": 1.0, "고객 만족": 1.0, "위험": 1.0}`.

El agente emite sus decisiones en el formato JEV (`typesafe/jev-1.13`), devolviendo una opción elegida junto con el mapa de probabilidades por alternativa, un valor de confianza y un campo de justificación. En el ejemplo de la model card, ante una solicitud de reembolso, el modelo asigna 0.9921 de probabilidad a la opción de reembolso completo, 0.0003 a reembolso parcial, 0.0003 a rechazo y 0.0074 a confirmación humana. No se especifican detalles sobre el número de tokens o episodios de entrenamiento, la composición del dataset sintético ni la topología exacta de la red neuronal utilizada.

## Capacidades

- Toma de decisiones discretas en un entorno empresarial simulado mediante preguntas de tipo `choice`.
- Asignación de personal, pedidos de inventario, campañas de marketing, atención al cliente, gestión de reembolsos y decisiones de seguridad.
- Salida estructurada en formato JEV con opción elegida, distribución de probabilidad, confianza y justificación.
- Operación de un ciclo mensual completo (20 días laborables) dentro del simulador CONNECT TYCOON.
- Integración como "cerebro" (CompanyBrain) cargable desde HuggingFace mediante `connect_tycoon`.
- Modo jugable en el propio simulador (`connect-tycoon play --brain ...`).
- Soporte de razonamiento multi-paso en el sentido de decisiones secuenciales encadenadas por el entorno.
- No dispone de capacidad de generación de texto, visión, audio, tool calling ni function calling en el sentido de un LLM.

## Casos de uso

- Simulación empresarial educativa: instalar el simulador con `pip install "connect-tycoon[game]"` y emplear el modelo como agente que dirige la compañía durante 20 días laborables, sirviendo de material didáctico para cursos de RL y de IA aplicada a negocio.
- Investigación en decisión secuencial: usar la política como referencia en experimentos de PPO sobre entornos tipo Gymnasium, comparando su desempeño frente a políticas basadas en reglas o frente a otros agentes RL.
- Benchmarking de políticas alternativas: la existencia de modelos hermanos (por ejemplo `WonseokJayJung/connectailab-rl-jay-v1`) permite contrastar enfoques de entrenamiento (PPO frente a GRPO con LoRA sobre Qwen) sobre la misma tarea de decisión.
- Juegos y agentes NPC: integrar el modelo como controlador de un "director de empresa" no jugador dentro de un videojuego o prototipo de simulación de gestión.
- Automatización de políticas de negocio sintéticas: emplear las salidas JEV con probabilidades para construir umbrales de decisión (por ejemplo, derivación a revisión humana cuando la confianza es baja) en prototipos de sistemas de decisión.
- Enseñanza del formato JEV: dado que el modelo devuelve respuestas estandarizadas con esquema `typesafe/jev-1.13`, sirve como ejemplo práctico de integración de agentes de decisión en pipelines con interfaz estructurada.
- Demostraciones en directo: la model card incluye un cuaderno de Colab y un repositorio GitHub, lo que facilita reproducir el entrenamiento y la inferencia en talleres o charlas técnicas.

## Benchmarks y rendimiento

La model card reporta una comparativa interna entre el "presidente basado en reglas" y `jay-company` sobre un promedio de 40 meses no vistos previamente:

| Metrica (promedio 40 meses) | Presidente basado en reglas | jay-company |
|---|---|---|
| Beneficio mensual | 708 (unidades de la model card, manwon) | 1719 |
| Satisfacción del cliente | 71 % | 96 % |
| Incidentes de riesgo | 11,5 | 1,9 |
| Confirmaciones humanas superadas | 69,5 | 14,8 |
| Días sin existencias (agotado) | 9,1 | 0,4 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que el modelo no es un LLM y no se evalúa en esas tareas.

## Requisitos de hardware

- VRAM estimada: no disponible; al estar implementado con `numpy` y ser una política de decisión (no un LLM generativo), es previsible que la inferencia se realice en CPU sin requisitos significativos de memoria, aunque no se documenta el consumo exacto.
- GPU recomendadas: no disponibles; no se documenta dependencia de GPU.
- Compatibilidad con GPU de consumo: probablemente sí (no se requiere GPU según la información disponible), pero no confirmado por el autor.
- Opciones de despliegue: integración mediante el paquete `connect-tycoon` (instalación con `pip install "connect-tycoon[game]"`) y carga del cerebro con `CompanyBrain.from_hub(...)`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Entrenamiento | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `sung-hoon/connectailab-rl-connectailab-rl-kribrain-v1-teacher` | Política RL (PPO), pesos en numpy | Imitación + PPO | ko | apache-2.0 | HuggingFace |
| `WonseokJayJung/connectailab-rl-jay-v1` | Política RL sobre base tipo Qwen (LoRA) | GRPO | ko | apache-2.0 | HuggingFace, con soporte MLX |
| Modelos hermanos etiquetados `connect-tycoon` | Políticas RL para el mismo simulador | RL (variantes) | ko | no disponible | HuggingFace |

No se dispone de otros modelos comparables fuera del ecosistema CONNECT AI LAB / connect-tycoon en la información proporcionada.

## Limitaciones y advertencias

- El propio autor indica que es un modelo educativo sobre un simulador de empresa sintética y que no garantiza ni predice resultados de gestión reales.
- El modelo está entrenado en coreano (ko) y no se documenta soporte multilingüe.
- No se documentan sesgos específicos, pero el comportamiento depende por completo de la distribución del entorno simulado CONNECT TYCOON, por lo que una generalización fuera de ese simulador no está garantizada.
- Riesgo de alucinación: no aplica en el sentido habitual de un LLM generativo; sin embargo, el agente puede producir decisiones de baja confianza cuando el estado de entrada queda fuera de la distribución de entrenamiento.
- La licencia apache-2.0 permite uso comercial, pero el modelo no está pensado para sustituir decisiones empresariales reales sin supervisión.
- No se documentan la arquitectura interna, el tamaño, los hiperparámetros de entrenamiento ni el volumen de datos sintéticos, lo que dificulta auditar su comportamiento.
- Para producción real sería necesario validar la política sobre distribuciones de estados no vistas y establecer mecanismos de derivación a revisión humana cuando la confianza sea baja.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/sung-hoon/connectailab-rl-connectailab-rl-kribrain-v1-teacher
- Perfil del autor en HuggingFace: https://huggingface.co/sung-hoon
- Repositorio CONNECT TYCOON en GitHub: https://github.com/wonseokjung/connect-tycoon
- Cuaderno de Colab de entrenamiento: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/rl_decision_model_qwen_colab.ipynb
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL de AI CITY BUILDERS: https://www.aicitybuilders.com/robot
- Connect AI (Ezer AI): https://www.ezerai.xyz
- Modelo hermano `WonseokJayJung/connectailab-rl-jay-v1`: https://huggingface.co/WonseokJayJung/connectailab-rl-jay-v1
- Repositorio `jsunsheep/connectailab`: https://github.com/jsunsheep/connectailab
- Canal de YouTube ConnectAI Lab alternativo: https://www.youtube.com/@connectailab
