# yegom/connectailab-rl-yegomfloor-v4-teacher

## Resumen

connectailab-rl-yegomfloor-v4-teacher es un modelo de decisión basado en aprendizaje por refuerzo (RL) desarrollado por el autor independiente yegom (Park Sehyun) en el marco del proyecto CONNECT AI LAB. No es un modelo de lenguaje generativo: es una política entrenada para operar una empresa simulada dentro del entorno CONNECT TYCOON, gestionando decisiones de personal, inventario, marketing, atención al cliente, reembolsos y seguridad a lo largo de un mes de 20 días laborables. Su relevancia radica en que ejemplifica el uso de RL (PPO) para automatizar decisiones empresariales secuenciales en un simulador, con un formato de salida estructurado compatible con JEV.

El modelo se distribuye como artefacto NumPy (librería `numpy`) y se integra mediante el paquete Python `connect-tycoon`, que permite cargarlo desde el Hub y actuar como "cerebro" de la compañía. Según la model card, supera al "presidente por reglas" del simulador en métricas de beneficio mensual, satisfacción del cliente, incidentes de riesgo y días de desabastecimiento, aunque se trata de un modelo educativo sobre un simulador sintético y no de un sistema validado en entornos reales.

La información técnica disponible es escasa: no se publican parámetros, arquitectura de red, longitud de contexto ni datos de entrenamiento detallados. La ficha refleja esa limitación de forma explícita.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de RL entrenada con PPO; estructura de red no publicada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (opera sobre un estado estructurado por turno, no sobre texto libre) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (artefacto NumPy distribuido vía paquete `connect-tycoon`) |

## Arquitectura y entrenamiento

La model card describe un entrenamiento en dos fases: primero aprendizaje supervisado imitando al "presidente por reglas" del simulador y después ajuste con PPO utilizando como recompensa la función de valor de la empresa `{"이익": 2.5, "고객 만족": 2.0, "위험": 1.0}` (beneficio 2,5; satisfacción del cliente 2,0; riesgo 1,0). El modelo se etiqueta como "corteza prefrontal" del sistema, es decir, el módulo que decide acciones sobre un estado estructurado del negocio.

No se especifican la topología de la red, el número de parámetros, el volumen de datos de entrenamiento ni hiperparámetros de PPO. La salida se emite en el formato JEV (`typesafe/jev-1.13`), con distribución de probabilidades sobre opciones discretas y un campo de confianza. La integración se realiza a través de `ct.CompanyBrain.from_hub(...)`, que carga el artefacto desde Hugging Face.

## Capacidades

- Toma de decisiones discretas sobre estado estructurado del simulador (departamento, motivo, tipo de cliente, importe, puntuación de fraude).
- Gestión de operaciones: asignación de personal, pedidos de inventario, marketing, atención al cliente, reembolsos y seguridad.
- Salida en formato JEV con distribución de probabilidades por opción (por ejemplo, `full`, `partial`, `deny`, `human`) y nivel de confianza.
- Razonamiento de un solo paso por turno; no hay soporte documentado de tool calling, function calling ni agentes multi-paso.
- Capacidades multilingües: no disponibles (solo coreano).
- No es un modelo de generación de texto, visión, audio ni código.

## Casos de uso

- Simulación educativa de gestión empresarial: cargar el modelo como cerebro en CONNECT TYCOON (`connect-tycoon play --brain hf:yegom/connectailab-rl-yegomfloor-v4-teacher`) para observar cómo un agente RL opera la empresa durante 20 días laborables.
- Docencia de RL con PPO: usar el par simulador-política como ejemplo reproducible de entrenamiento por imitación seguido de optimización por recompensa, con métricas comparativas frente a una línea base de reglas.
- Investigación en políticas de decisión con formato estructurado: emplear la interfaz JEV como contrato de entrada/salida para estudiar calibración de confianza y distribuciones de probabilidad en decisiones discretas.
- Evaluación de funciones de recompensa multiobjetivo: analizar cómo el peso relativo de beneficio, satisfacción y riesgo modula las decisiones de reembolso o de escalado a revisión humana.
- Prototipado de asistentes de decisión con intervención humana: el modelo aprende a derivar casos ambiguos a `human` (por ejemplo, reembolsos con puntuación de fraude intermedia), lo que sirve para diseñar flujos de escalado.
- Benchmark interno de entornos RL: comparar políticas entrenadas sobre el mismo simulador usando las métricas publicadas (beneficio mensual, satisfacción, incidentes, días de desabastecimiento).

## Benchmarks y rendimiento

Datos aportados en la model card (media sobre 40 meses no vistos en entrenamiento):

| Métrica | Presidente por reglas | connectailab-rl-yegomfloor-v4-teacher |
|---|---|---|
| Beneficio mensual | 3,24 M KRW | 10,36 M KRW |
| Satisfacción del cliente | 79 % | 96 % |
| Incidentes de riesgo | 7,8 | 4,4 |
| Escalados a revisión humana | 37,8 | 10,3 |
| Días de desabastecimiento | 10,7 | 0,5 |

La model card menciona además un pico de 11,22 M KRW frente a los 3,24 M KRW de la línea base (factor 3,5). No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K u otros) porque el modelo no es un LLM.

## Requisitos de hardware

- VRAM estimada: no disponible; el artefacto se distribuye como datos NumPy y la inferencia es una evaluación de política sobre estado estructurado, presumiblemente ejecutable en CPU.
- GPU recomendadas: no aplica según la información disponible; no se documenta requisito de GPU.
- GPU de consumo: no se documenta ninguna restricción; por el formato de despliegue (NumPy) es probable que funcione en CPU, pero no está confirmado.
- Opciones de despliegue: paquete `connect-tycoon` (`pip install "connect-tycoon[game]"`), carga desde el Hub mediante `CompanyBrain.from_hub`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-yegomfloor-v4-teacher | Política RL (PPO) sobre simulador | no disponible | no disponible | Apache 2.0 | Hugging Face + paquete `connect-tycoon` |
| Presidente por reglas de CONNECT TYCOON | Sistema basado en reglas | no aplica | no aplica | la del repositorio `connect-tycoon` | GitHub |
| Otros modelos RL de decisión de la familia CONNECT | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de otros autores en la misma categoría (políticas RL para simulación empresarial con salida JEV).

## Limitaciones y advertencias

- Modelo educativo sobre un simulador sintético: la propia model card advierte que no garantiza ni predice resultados empresariales reales.
- Entrenado exclusivamente para el entorno CONNECT TYCOON y la configuración de empresa indicada; el rendimiento fuera de esa distribución no está garantizado.
- Idioma: solo coreano; no hay soporte multilingüe documentado.
- No es un LLM: no genera texto libre, no razona en lenguaje natural y no admite tool calling.
- Riesgo de sobreajuste al simulador y a la función de recompensa definida; los pesos de la recompensa condicionan fuertemente el comportamiento.
- Sin datos publicados sobre sesgos, calibración fuera de distribución o robustez ante estados anómalos.
- Licencia Apache 2.0 permite uso comercial del artefacto, pero el valor práctico fuera del simulador es limitado; verificar la licencia del entorno `connect-tycoon` por separado.
- Sin descargas ni validación comunitaria en el momento de la consulta (0 descargas, 0 likes), lo que reduce la evidencia externa sobre su comportamiento.

## Enlaces

- Hugging Face: https://huggingface.co/yegom/connectailab-rl-yegomfloor-v4-teacher
- Repositorio CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Notebook de entrenamiento (Colab): https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/rl_decision_model_qwen_colab.ipynb
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL: https://www.aicitybuilders.com/robot
- Connect AI: https://www.ezerai.xyz
