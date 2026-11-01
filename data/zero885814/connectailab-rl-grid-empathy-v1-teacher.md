# zero885814/connectailab-rl-grid-empathy-v1-teacher

## Resumen

`connectailab-rl-grid-empathy-v1-teacher` es una política de aprendizaje por refuerzo (RL) publicada por el desarrollador zero885814 dentro del proyecto CONNECT TYCOON, un simulador de gestión empresarial desarrollado por CONNECT AI LAB y AI CITY BUILDERS. No es un modelo de lenguaje: es un agente de toma de decisiones que opera una empresa sintética durante un ciclo de 20 días laborables, decidiendo sobre asignación de personal, reposición de inventario, marketing, atención al cliente, reembolsos y seguridad. El modelo se distribuye como artefacto NumPy y se consume a través de la librería `connect_tycoon`.

El agente se entrenó en dos fases: primero imitación de un "presidente de reglas" (aprendizaje supervisado) y después ajuste fino con PPO usando una función de recompensa derivada de los valores declarados de la empresa (beneficio con peso 2,0, satisfacción del cliente con peso 2,5 y riesgo con peso 1,5). La salida sigue el formato de preguntas y respuestas JEV (`typesafe/jev-1.13`), lo que permite integrarlo como "cerebro" de la empresa en el simulador y en el juego `connect-tycoon`.

Su relevancia es acotada pero concreta: sirve como referencia docente de un pipeline completo de RL (entorno Gymnasium, recompensa multiobjetivo, política que emite distribuciones de probabilidad sobre acciones discretas) y como baseline reproducible frente al agente basado en reglas. El autor reporta mejoras sustanciales en el simulador, aunque no hay benchmarks estándar ni evaluación independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de aprendizaje por refuerzo (PPO) sobre observaciones estructuradas del simulador; no es un transformer |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica; el estado se pasa como diccionario estructurado por paso) |
| Tipos de cuantizacion | no disponible (pesos NumPy; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | artefacto NumPy cargado vía `connect_tycoon` (no safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo es una política de decisión entrenada con PPO sobre el entorno `connect-tycoon`, un simulador de empresa con estado configurable (`warehouse`, `base_demand`, `unit_cost`, `order_scale`, `staff_bonus`, `wage`, `ad_power`, `fraud_tool`, `extra_cs`, `extra_refund`). El proceso de entrenamiento consta de una fase de imitación de un agente basado en reglas (el "presidente de reglas") seguida de optimización con PPO contra una recompensa ponderada por los valores de la empresa: beneficio (2,0), satisfacción del cliente (2,5) y riesgo (1,5). La política emite, para cada pregunta JEV de tipo `choice`, una distribución de probabilidad sobre las opciones disponibles junto con una confianza.

No se documentan en la información disponible el número de parámetros, la arquitectura de red exacta (capas, tamaño de hidden state), el volumen de episodios de entrenamiento ni detalles del currículo. La etiqueta "prefrontal-cortex" y el sufijo "teacher" sugieren un rol de profesor dentro de un esquema de destilación o de generación de datos para políticas alumnas, pero esto no se confirma en la model card. La innovación destacable es la interfaz JEV: el agente no devuelve texto libre, sino respuestas tipadas y probabilísticas que el simulador consume directamente.

## Capacidades

- Toma de decisiones discretas multiopción sobre estado estructurado: reembolsos (`full`, `partial`, `deny`, `human`), reposición de inventario, asignación de personal, marketing y seguridad.
- Emisión de distribuciones de probabilidad calibradas por opción (el ejemplo de la model card devuelve `full: 0.9124`, `partial: 0.0011`, `deny: 0.0683`, `human: 0.0182`).
- Razonamiento multiobjetivo con pesos explícitos de beneficio, satisfacción y riesgo.
- Integración con el formato JEV (`typesafe/jev-1.13`) para preguntas y respuestas tipadas.
- Operación como "cerebro" de empresa en el simulador y en el juego mediante `connect-tycoon play --brain hf:...`.
- No soporta tool calling genérico, ni generación de texto libre, ni visión, ni audio, ni capacidades multilingües más allá del coreano.

## Casos de uso

- Docencia de RL aplicado: el modelo sirve como ejemplo completo de pipeline supervisado + PPO con recompensa multiobjetivo, cargable desde Hugging Face y ejecutable en un notebook de Colab enlazado por el autor.
- Baseline en investigación de simulación empresarial: permite comparar políticas aprendidas frente al agente de reglas en métricas como beneficio mensual, satisfacción, incidentes de riesgo, derivaciones a humano y días sin stock.
- Generación de datos para destilación: el sufijo "teacher" y la salida probabilística lo hacen adecuado para producir etiquetas blandas sobre estados del simulador que alimenten políticas alumnas más pequeñas.
- Evaluación de funciones de recompensa: al estar entrenado con pesos concretos (2,0 / 2,5 / 1,5), permite estudiar cómo distintos valores corporativos desplazan la política resultante.
- Prototipado de agentes de negocio en entornos Gymnasium: útil para probar integraciones de `CompanyBrain` y el contrato JEV antes de escalar a modelos mayores.
- Demostraciones y material divulgativo: el repositorio incluye GIFs y vídeos del simulador, por lo que encaja en talleres y clases sobre IA aplicada a decisiones empresariales.

## Benchmarks y rendimiento

Los únicos datos publicados son los del simulador CONNECT TYCOON, medidos por el autor sobre una media de 40 meses con condiciones iniciales no especificadas. No son benchmarks estándar (MMLU, HumanEval, GSM8K) y no han sido verificados de forma independiente.

| Métrica (simulador, media 40 meses) | Presidente de reglas | connectailab-rl-grid-empathy-v1-teacher |
|---|---|---|
| Beneficio mensual | 3,24 M KRW | 11,76 M KRW |
| Satisfacción del cliente | 79 % | 96 % |
| Incidentes de riesgo | 7,8 | 2,7 |
| Derivaciones a humano | 37,8 | 11,0 |
| Días sin stock | 10,7 | 0,5 |

No se han publicado resultados de benchmarks estándar en la información disponible.

## Requisitos de hardware

- El artefacto es NumPy y no requiere GPU: la inferencia es una pasada por la política sobre un vector de estado, ejecutable en CPU.
- VRAM estimada: prácticamente nula; no se documenta el tamaño exacto del artefacto, pero al ser una política tabular o una red pequeña en NumPy, cabe en cualquier equipo.
- GPU recomendadas: no aplica. Cualquier CPU moderna es suficiente; una GPU solo tendría sentido para reentrenar con PPO.
- Cabe en cualquier GPU de consumo e incluso en entornos sin GPU (portátiles, contenedores ligeros, CI).
- Opciones de despliegue: `pip install "connect-tycoon[game]"` y `connect-tycoon play --brain hf:zero885814/connectailab-rl-grid-empathy-v1-teacher`; también mediante `ct.CompanyBrain.from_hub(...)` en Python. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles de forma numérica; por la naturaleza del artefacto se espera latencia de microsegundos a milisegundos por decisión en CPU, pero es una estimación, no un dato publicado.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-grid-empathy-v1-teacher | Política RL (PPO) para simulador | no disponible | no aplica | Apache 2.0 | Hugging Face, 0 descargas |
| Presidente de reglas de CONNECT TYCOON | Agente basado en reglas | no aplica | no aplica | incluido en el repositorio del simulador | GitHub `wonseokjung/connect-tycoon` |
| Políticas RL para entornos Gymnasium (p. ej. Stable-Baselines3 PPO) | Política RL genérica | depende de la red | no aplica | MIT | PyPI / GitHub |

No se conocen otros modelos publicados específicamente para el simulador CONNECT TYCOON ni para la interfaz JEV en la información disponible; la comparación con alternativas de la misma categoría (LLM) no procede porque este artefacto no es un modelo de lenguaje.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no responde preguntas abiertas y no debe evaluarse con benchmarks de LLM.
- Entrenado exclusivamente para el simulador CONNECT TYCOON y su configuración de empresa documentada; generaliza mal fuera de esa distribución de estados.
- Idioma coreano únicamente; la interfaz JEV y los criterios de decisión están redactados en coreano.
- Los resultados de la model card (beneficio, satisfacción, riesgo) los reporta el propio autor y no han sido replicados de forma independiente; la media de 40 meses no especifica semilla, configuración ni intervalos de confianza.
- Riesgo de sobreajuste a la función de recompensa declarada (2,0 / 2,5 / 1,5): cambiar los pesos corporativos invalida la política tal como está entrenada.
- El autor advierte explícitamente que es un modelo educativo sobre un simulador sintético y que no garantiza ni predice resultados de gestión real.
- Las decisiones con implicaciones económicas o de riesgo (reembolsos, fraude, seguridad) se emiten como probabilidades; en producción requerirían umbrales, auditoría y derivación a humano.
- Licencia Apache 2.0 permite uso comercial del artefacto, pero el simulador y el ecosistema `connect-tycoon` tienen sus propias condiciones que deben revisarse por separado.
- Sin descargas ni likes en el momento de la consulta: ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zero885814/connectailab-rl-grid-empathy-v1-teacher
- Repositorio CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Notebook de entrenamiento en Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/rl_decision_model_qwen_colab.ipynb
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- Canal Data Baking Oven: https://www.youtube.com/@Data_Baking_Oven
- Blog del autor: https://blog.naver.com/oven_studio_ai
- Instagram del autor: https://www.instagram.com/bread_mountain
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL de AI CITY BUILDERS: https://www.aicitybuilders.com/robot
- Connect AI: https://www.ezerai.xyz
