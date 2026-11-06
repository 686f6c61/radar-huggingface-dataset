# yegom/connectailab-rl-jay-v1-teacher

## Resumen

connectailab-rl-jay-v1-teacher es un modelo de decisión empresarial entrenado con aprendizaje por refuerzo (PPO) por el desarrollador yegom (Park Sehyun) dentro del ecosistema CONNECT AI LAB × AI CITY BUILDERS. El modelo actúa como "presidente de IA" (AI 사장) del simulador de gestión empresarial CONNECT TYCOON: opera una empresa sintética durante un mes (20 días laborables) y decide sobre asignación de personal, pedidos de inventario, marketing, atención al cliente, reembolsos y seguridad.

A diferencia de un modelo de lenguaje generativo, es una política de decisión que responde a consultas estructuradas en el formato JEV (typesafe/jev-1.13) y devuelve una elección con distribución de probabilidades y nivel de confianza. Se entrenó en dos fases: primero imitación del "presidente de reglas" del simulador (aprendizaje supervisado) y después optimización con recompensas derivadas de los valores de la empresa (beneficio, satisfacción del cliente y riesgo, todos con peso 1.0).

Su relevancia es fundamentalmente educativa y de investigación: demuestra un pipeline completo de RL para toma de decisiones secuenciales con interfaz tipada, empaquetado como biblioteca NumPy y ejecutable en un juego de gestión. No es un modelo de propósito general ni sustituye a un LLM: es una política especializada en un dominio cerrado y sintético.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de aprendizaje por refuerzo (PPO) sobre observaciones estructuradas del simulador; sin arquitectura transformer declarada |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el estado se pasa como objeto estructurado por consulta, no como secuencia de tokens) |
| Tipos de cuantizacion | no disponible (pesos en formato NumPy, sin cuantización publicada) |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | NumPy (library_name: numpy); sin safetensors ni GGUF publicados |

## Arquitectura y entrenamiento

El modelo es una política de decisión entrenada con PPO (Proximal Policy Optimization) sobre el entorno CONNECT TYCOON, un simulador de empresa con configuración concreta (almacén de 250 unidades, demanda base de 40, coste unitario de 1.5, escala de pedido de 1.0, poder publicitario de 1.0, sin bonus de personal ni salarios). La observación llega como un estado estructurado (por ejemplo, departamento, motivo, nivel de cliente, importe y puntuación de fraude) y la acción es una elección discreta entre alternativas definidas por la consulta JEV.

El entrenamiento tuvo dos etapas: (1) aprendizaje supervisado imitando al "presidente de reglas" del simulador, y (2) optimización con PPO usando una función de recompensa basada en los valores de la empresa (beneficio, satisfacción del cliente y riesgo, cada uno con peso 1.0). La innovación destacable es la integración con el formato JEV (`typesafe/jev-1.13`), que estandariza la pregunta (tipo, instrucciones, criterios) y la respuesta (elección, probabilidades, confianza, motivo), lo que permite conectar la política a un simulador o juego mediante una API tipada. No se han publicado detalles sobre número de tokens de entrenamiento, composición del dataset, ni hiperparámetros de PPO.

## Capacidades

- Toma de decisiones discretas en un dominio cerrado de gestión empresarial: asignación de personal, pedidos de inventario, marketing, atención al cliente, reembolsos y seguridad.
- Respuesta en formato JEV con elección, distribución de probabilidades sobre las alternativas y nivel de confianza explícito.
- Aprendizaje por refuerzo con recompensa multiobjetivo (beneficio, satisfacción, riesgo).
- Ejecución como "cerebro" de empresa en el simulador CONNECT TYCOON (`CompanyBrain.from_hub`).
- Integración con el juego mediante CLI (`connect-tycoon play --brain hf:...`).
- Soporte de idioma coreano en las instrucciones y motivos de decisión.
- No dispone de generación de texto libre, tool calling genérico, visión, audio ni razonamiento multi-paso fuera del entorno de simulación.

## Casos de uso

- Investigación en RL para decisiones secuenciales: servir como referencia reproducible de un pipeline supervisión + PPO con interfaz tipada, útil para comparar algoritmos o funciones de recompensa en un entorno controlado.
- Docencia y formación en aprendizaje por refuerzo: el modelo y el simulador permiten a estudiantes observar cómo una política optimizada supera a una política de reglas en métricas concretas (beneficio mensual, satisfacción, incidentes).
- Evaluación de funciones de recompensa: al tener pesos explícitos por valor (beneficio, satisfacción, riesgo), se puede estudiar cómo cambia el comportamiento al reajustar dichos pesos en el entorno.
- Simulación de políticas de reembolso: el ejemplo de la model card (reembolso con puntuación de fraude 0.31) muestra cómo la política decide entre reembolso total, parcial, denegación o revisión humana, con probabilidades interpretables.
- Prototipado de agentes de decisión con formato JEV: sirve como ejemplo de integración de una política NumPy en una API de preguntas y respuestas tipadas para otros simuladores.
- Benchmarking de robustez en entornos sintéticos: permite medir el rendimiento de la política en episodios de 40 meses frente a la línea base de reglas, con métricas de incidentes y días de rotura de stock.
- Demostraciones interactivas: el modo de juego (`connect-tycoon play`) permite visualizar las decisiones del modelo en tiempo real como herramienta divulgativa.

## Benchmarks y rendimiento

Resultados publicados en la model card (media de 40 meses no vistos, frente al "presidente de reglas"):

| Metrica | Reglas | connectailab-rl-jay-v1-teacher |
|---|---|---|
| Beneficio mensual | 3,24 millones de wones | 11,22 millones de wones |
| Satisfaccion del cliente | 79% | 95% |
| Incidentes de riesgo | 7,8 | 2,8 |
| Confirmaciones humanas excedidas | 37,8 | 20,8 |
| Dias sin stock | 10,7 | 0,5 |

No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, lo que es coherente con que no sea un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada: no disponible; los pesos se distribuyen como arrays NumPy y la política es de pequeño tamaño aparente, por lo que la inferencia debería ejecutarse en CPU sin GPU dedicada.
- GPU recomendadas: no se requiere GPU para la inferencia según la información disponible.
- ¿Cabe en GPU de consumo? Sí, previsiblemente en cualquier equipo con CPU moderna, dado el formato NumPy y la ausencia de requisitos de VRAM declarados.
- Opciones de despliegue: biblioteca `connect-tycoon` (`pip install "connect-tycoon[game]"`), carga vía `CompanyBrain.from_hub` y CLI `connect-tycoon play --brain hf:yegom/connectailab-rl-jay-v1-teacher`. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de la misma categoría (políticas RL para simulación de gestión empresarial con interfaz JEV) en la información proporcionada.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-jay-v1-teacher | no disponible | no disponible | Beneficio 11,22 M KRW/mes; satisfacción 95% | Apache 2.0 | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo educativo sobre un simulador sintético: la propia model card advierte que no garantiza ni predice resultados de gestión reales.
- Dominio cerrado: solo responde a las decisiones contempladas por el entorno CONNECT TYCOON y el formato JEV; no generaliza a otras tareas.
- Idioma: soporte declarado únicamente de coreano (ko); las instrucciones y motivos se expresan en ese idioma.
- Sin datos publicados sobre sesgos, alucinación o robustez fuera de distribución; al ser una política de elección discreta, el riesgo de "alucinación" se traduce en elecciones con confianza mal calibrada.
- Rendimiento medido con una configuración de empresa concreta; los resultados pueden degradarse con otros parámetros del entorno.
- Licencia Apache 2.0: permite uso comercial, pero al ser un modelo educativo conviene citar autoría y no presentar sus salidas como asesoramiento empresarial real.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema pequeño, sin validación externa publicada.
- Dependencia del ecosistema `connect-tycoon` y del formato JEV para su uso práctico.

## Enlaces

- Hugging Face: https://huggingface.co/yegom/connectailab-rl-jay-v1-teacher
- Repositorio CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Formato JEV: `typesafe/jev-1.13`
- YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL de AI CITY BUILDERS: https://www.aicitybuilders.com/robot
- Connect AI: https://www.ezerai.xyz
- Banner del proyecto: https://raw.githubusercontent.com/wonseokjung/connect-tycoon/main/docs/brand/banner.gif
- Imagen del simulador: https://raw.githubusercontent.com/wonseokjung/connect-tycoon/main/docs/images/hero.gif
