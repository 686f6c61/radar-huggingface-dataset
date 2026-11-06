# yegom/connectailab-rl-yegomfloor-v2-teacher

## Resumen

connectailab-rl-yegomfloor-v2-teacher es un modelo de decisión basado en aprendizaje por refuerzo (RL) desarrollado por el autor coreano yegom (Park Sehyun) dentro del ecosistema CONNECT AI LAB. No es un modelo de lenguaje: se trata de una política entrenada con PPO que actúa como "cerebro" de una empresa simulada en el entorno Connect Tycoon, tomando decisiones operativas (asignación de personal, pedidos de inventario, marketing, atención al cliente, reembolsos y seguridad) a lo largo de un mes de negocio simulado de 20 días laborables.

El modelo sigue el paradigma de "profesor-alumno": primero aprende por imitación de un "presidente basado en reglas" (aprendizaje supervisado) y después optimiza sus decisiones mediante PPO con recompensas derivadas de los valores de la empresa (beneficio, satisfacción del cliente y riesgo, todos ponderados a 1.0). Todas las respuestas se emiten en el formato estándar JEV (`typesafe/jev-1.13`), lo que permite integrarlo como componente de decisión dentro de pipelines de agentes.

La relevancia actual es acotada: es un modelo educativo y experimental, con cero descargas y cero likes en el momento de la ficha, orientado a demostrar pipelines de RL para toma de decisiones empresariales sintéticas. Se distribuye bajo licencia Apache 2.0, está etiquetado únicamente para coreano y su único runtime declarado es numpy, no un framework de inferencia de transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de aprendizaje por refuerzo (PPO) sobre observaciones estructuradas del simulador; no es un transformer |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el estado de entrada es un diccionario estructurado por decisión, no una secuencia de tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (librería declarada: numpy; el paquete `connect-tycoon` carga el cerebro vía `CompanyBrain.from_hub`) |

## Arquitectura y entrenamiento

La arquitectura es una política de decisión entrenada con PPO (Proximal Policy Optimization) sobre el simulador Connect Tycoon, no una red de lenguaje. El pipeline de entrenamiento consta de dos fases: una primera de aprendizaje supervisado en la que el modelo imita a un "presidente basado en reglas", y una segunda de RL en la que se optimiza la política con recompensas construidas a partir de los valores de la empresa (beneficio, satisfacción del cliente y riesgo, cada uno con peso 1.0). El modelo se etiqueta como "prefrontal-cortex" y "decision-making", reflejando su papel como módulo de juicio dentro de una arquitectura mayor de agentes.

La configuración de empresa utilizada en el entrenamiento y evaluación es: almacén 250.0, demanda base 40.0, coste unitario 1.5, escala de pedido 1.0, bonus de personal 0, salario 0.0, poder publicitario 1.0, herramienta antifraude 0, atención al cliente extra 0 y reembolso extra 0. La interfaz de salida es JSON conforme al esquema JEV, con campos de tipo de respuesta, elección, distribución de probabilidades, confianza y motivo. No se han publicado detalles sobre número de tokens, composición del dataset ni hiperparámetros de PPO.

## Capacidades

- Toma de decisiones discretas entre opciones definidas por el entorno (por ejemplo, reembolso completo, parcial, denegación o revisión humana).
- Emisión de distribuciones de probabilidad calibradas sobre las opciones, con campo de confianza explícito.
- Razonamiento multi-paso a lo largo de un episodio de 20 días laborables, encadenando decisiones de personal, inventario, marketing, atención al cliente, reembolsos y seguridad.
- Respuesta en formato estructurado JEV (`typesafe/jev-1.13`), lo que facilita su integración como herramienta en pipelines de agentes.
- Gestión de compromisos entre objetivos (beneficio, satisfacción y riesgo) mediante la política aprendida.
- Soporte de ejecución en el simulador mediante `connect-tycoon play --brain hf:...` y carga programática con `CompanyBrain.from_hub`.
- Capacidades multilingües: no disponibles; el modelo está etiquetado solo para coreano.

## Casos de uso

- Simulación educativa de gestión empresarial: el modelo opera una empresa sintética durante 20 días laborables y devuelve decisiones con probabilidades, lo que permite a estudiantes de RL analizar compromisos entre beneficio, satisfacción y riesgo.
- Evaluación de pipelines de RL: sirve como política de referencia ("teacher") para comparar contra el presidente basado en reglas y medir mejoras en beneficio, satisfacción, incidentes de riesgo, escalados a humano y días de rotura de stock.
- Decisión de reembolsos con revisión humana: dado un estado con importe, motivo, nivel de cliente y puntuación de fraude, el modelo elige entre reembolso total, parcial, denegación o escalado a humano, con una distribución de probabilidad que permite fijar umbrales de automatización.
- Enrutado de casos a revisión humana: la confianza y la distribución de probabilidad permiten derivar a un operador los casos ambiguos, reduciendo el coste por caso (0.8 unidades monetarias por revisión en el simulador).
- Investigación en políticas de decisión con formato estándar: al responder en JEV, el modelo se puede conectar como herramienta de decisión dentro de agentes más amplios que orquestan múltiples preguntas tipadas.
- Docencia y demostración de PPO aplicado a negocio: el repositorio Connect Tycoon y los materiales de CONNECT AI LAB permiten reproducir el entrenamiento y la inferencia en local con numpy.
- Pruebas de integración de agentes: el endpoint estructurado facilita tests automatizados de sistemas de agentes que necesitan un componente de decisión determinista y con probabilidades.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre 40 meses no vistos (media por mes), comparando el modelo con el presidente basado en reglas:

| Métrica (media mensual) | Presidente basado en reglas | connectailab-rl-yegomfloor-v2-teacher |
|---|---|---|
| Beneficio mensual | 3,24 millones de wones | 11,22 millones de wones |
| Satisfacción del cliente | 79 % | 95 % |
| Incidentes de riesgo | 7,8 | 2,8 |
| Escalados a humano | 37,8 | 20,8 |
| Días de rotura de stock | 10,7 | 0,5 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; la librería declarada es numpy y el modelo se carga como política dentro del paquete `connect-tycoon`, por lo que la huella es la de un artefacto de política, no la de un transformer.
- GPU recomendadas: no disponibles; no se documenta requisito de GPU.
- Viabilidad en GPU de consumo: no disponible; el runtime declarado (numpy) sugiere ejecución en CPU.
- Opciones de despliegue: paquete `connect-tycoon` (`pip install "connect-tycoon[game]"`), carga con `CompanyBrain.from_hub("yegom/connectailab-rl-yegomfloor-v2-teacher")` y ejecución interactiva con `connect-tycoon play --brain hf:...`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-yegomfloor-v2-teacher | Política RL (PPO) para simulación empresarial | no disponible | no disponible | Apache 2.0 | Hugging Face, 0 descargas |
| connectailab-rl-parksehyun-v1-teacher | Política RL (PPO) para Connect Tycoon, citada en la model card | no disponible | no disponible | Apache 2.0 (según la model card) | Hugging Face |
| Presidente basado en reglas de Connect Tycoon | Sistema experto determinista del simulador | no aplica | no aplica | la del repositorio Connect Tycoon | Repositorio GitHub |

No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto libre, no responde preguntas abiertas y no debe evaluarse con benchmarks de LLM.
- Entrenado y evaluado únicamente en el simulador Connect Tycoon con una configuración de empresa concreta; el rendimiento fuera de esa distribución no está garantizado.
- El propio autor advierte que es un modelo educativo sobre un simulador sintético y que no garantiza ni predice resultados de gestión reales.
- Idiomas: solo coreano; no hay soporte documentado para castellano ni para otros idiomas.
- Riesgo de alucinación en el sentido de decisiones mal calibradas: las probabilidades emitidas son las de la política y no incorporan incertidumbre fuera del entorno de entrenamiento.
- Sesgos: no documentados; al derivar de un "profesor" basado en reglas, hereda las heurísticas de ese sistema y la ponderación fijada de los valores de la empresa (1.0 / 1.0 / 1.0).
- Licencia Apache 2.0: permite uso comercial, pero el modelo depende del paquete `connect-tycoon` y del esquema JEV, cuyas licencias deben verificarse por separado.
- Sin descargas ni likes en el momento de la ficha: no hay evidencia de uso en producción ni de validación externa.
- No se documentan requisitos de hardware, latencia ni formato de pesos, lo que dificulta planificar un despliegue en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yegom/connectailab-rl-yegomfloor-v2-teacher
- Repositorio Connect Tycoon: https://github.com/wonseokjung/connect-tycoon
- Canal de YouTube de CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL de AI CITY BUILDERS: https://www.aicitybuilders.com/robot
- Connect AI: https://www.ezerai.xyz
- Esquema JEV referenciado: `typesafe/jev-1.13` (no se proporciona URL directa en la información disponible)
