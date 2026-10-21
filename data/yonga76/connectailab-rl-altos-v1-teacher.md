# yonga76/connectailab-rl-altos-v1-teacher

## Resumen

connectailab-rl-altos-v1-teacher es una política de aprendizaje por refuerzo (no un modelo de lenguaje) desarrollada por el autor yonga76 dentro del proyecto CONNECT TYCOON, una iniciativa de CONNECT AI LAB y AI CITY BUILDERS. El modelo actúa como el "cerebro" (la model card lo describe como corteza prefrontal) de un director ejecutivo simulado: recibe el estado de una empresa ficticia y decide sobre asignación de personal, pedidos de inventario, marketing, atención al cliente, reembolsos y seguridad a lo largo de un mes simulado de 20 días laborables.

El problema que resuelve es acotado pero concreto: convertir un conjunto de observaciones estructuradas (departamento, motivo, nivel de cliente, importe, puntuación de fraude) en una decisión discreta con distribución de probabilidad explícita, expresada en el formato JEV de `typesafe/jev-1.13`. La política se entrenó primero por imitación de un "director de reglas" y después se refinó con PPO usando una función de recompensa multicriterio con pesos iguales para beneficio, satisfacción del cliente y riesgo.

Su relevancia es fundamentalmente educativa y de investigación aplicada: la model card reporta que, sobre 40 meses no vistos del simulador, la política supera de forma clara al profesor de reglas (11,15 millones de wones de beneficio mensual frente a 3,24; 96 % de satisfacción frente a 79 %). No se publican datos de arquitectura de red, número de parámetros ni longitud de contexto, y el propio autor advierte que es un modelo docente sobre un simulador sintético que no garantiza ni predice resultados de gestión reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (política de RL entrenada con PPO sobre observaciones estructuradas; la model card no detalla la topología de la red) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no aplica: la política consume un estado estructurado de un solo paso, no secuencias de texto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible (librería declarada: `numpy`; se carga mediante `connect_tycoon.CompanyBrain.from_hub`) |
| Tipo de modelo | Política de decisión (reinforcement learning), pipeline `reinforcement-learning` |
| Espacio de acciones | Elección discreta entre opciones definidas por la pregunta (por ejemplo: reembolso total, parcial, denegar, escalar a humano) |
| Formato de salida | JEV (`typesafe/jev-1.13`): elección, probabilidades por opción, confianza y motivo |
| Simulador de entrenamiento | CONNECT TYCOON (empresa sintética, mes de 20 días laborables) |
| Configuración de empresa reportada | `warehouse: 250.0`, `base_demand: 40.0`, `unit_cost: 1.5`, `order_scale: 1.0`, `staff_bonus: 0`, `wage: 0.0`, `ad_power: 1.0`, `fraud_tool: 0`, `extra_cs: 0`, `extra_refund: 0` |
| Descargas / likes en HuggingFace | 0 / 0 |
| Fecha de creación | 2026-10-20 |

## Arquitectura y entrenamiento

La model card no documenta la arquitectura interna de la red (capas, dimensiones, función de activación ni inicialización). Lo que sí describe es el procedimiento de entrenamiento en dos fases: una primera fase de aprendizaje supervisado en la que la política imita a un "director de reglas" (규칙 사장) que actúa como profesor, y una segunda fase de ajuste con PPO (Proximal Policy Optimization) en la que la recompensa proviene de los valores declarados de la empresa: beneficio 1.0, satisfacción del cliente 1.0 y riesgo 1.0. El entorno es un simulador de empresa (CONNECT TYCOON) con horizonte mensual de 20 días laborables, y las decisiones cubren contratación y asignación de personal, pedidos de inventario, publicidad, atención al cliente, política de reembolsos y seguridad antifraude.

El estado de entrada es un diccionario estructurado y el modelo no genera texto libre: emite una respuesta en el formato JEV con la opción elegida, las probabilidades asociadas a cada alternativa, un valor de confianza y un campo de motivo (en el ejemplo publicado, simplemente "강화학습 정책", "política de aprendizaje por refuerzo"). La innovación destacable no está en la arquitectura sino en la interfaz: un protocolo de decisión tipado y probabilístico (JEV) que permite auditar la incertidumbre de cada decisión y sustituir reglas heurísticas por una política aprendida dentro del mismo contrato de datos.

## Capacidades

- Decisión discreta con calibración explícita: devuelve la distribución de probabilidad completa sobre las opciones disponibles, no solo la etiqueta ganadora (en el ejemplo de reembolso: `full` 0.9136, `partial` 0.0014, `deny` 0.0125, `human` 0.0725).
- Gestión de reembolsos: distingue entre reembolso total, parcial, denegación y escalado a revisión humana, incorporando una puntuación de fraude en el estado.
- Planificación de inventario y pedidos: decide cuándo y cuánto reponer, con el objetivo de minimizar días sin existencias (0,6 días de media en la evaluación reportada).
- Asignación de personal y capacidad de atención al cliente: ajusta recursos humanos y de soporte dentro del simulador.
- Marketing y publicidad: decide inversión publicitaria a partir de la demanda base configurada.
- Seguridad y control de fraude: evalúa solicitudes sospechosas con la señal `fraud_score`.
- Integración con agentes y entornos tipo Gymnasium: los tags incluyen `gymnasium` y `deep-reinforcement-learning`, y el paquete `connect-tycoon[game]` permite sentar al modelo como director en el juego.
- Soporte multilingüe: no disponible; la model card declara únicamente coreano (`ko`).
- Tool calling, visión, audio, modo "thinking" o generación de código: no disponibles; el modelo no es un LLM y no expone esas capacidades.

## Casos de uso

- Simulación docente de gestión empresarial: cargar el modelo con `ct.CompanyBrain.from_hub("yonga76/connectailab-rl-altos-v1-teacher")` y ejecutar `connect-tycoon play --brain hf:yonga76/connectailab-rl-altos-v1-teacher` para que los alumnos comparen en tiempo real las decisiones de una política aprendida frente a un profesor de reglas sobre el mismo estado del simulador.
- Aula de aprendizaje por refuerzo: el repositorio incluye un notebook de Colab (`rl_decision_model_qwen_colab.ipynb`) que permite reproducir el entrenamiento; el modelo sirve como referencia de resultado final y como punto de partida para variar la función de recompensa.
- Generación de datos de decisión para destilación: usar la política como profesor que etiqueta estados del simulador con distribuciones de probabilidad completas, útiles para entrenar políticas más ligeras o para inicializar otro agente.
- Evaluación de políticas de reembolso y fraude: introducir pares estado-respuesta con distintos `fraud_score`, `tier` de cliente e importes para medir cómo cambia la probabilidad de escalar a revisión humana frente a reembolsar automáticamente.
- Pruebas de integración de protocolos de decisión tipados: al emitir JEV, el modelo es un banco de pruebas realista para validar esquemas JSON, validadores de tipos y sistemas de auditoría que consuman decisiones con probabilidades y confianza.
- Línea base en comparativas internas de agentes: por su bajo coste computacional (numpy, sin GPU), sirve como referencia cuantitativa frente a la que medir agentes basados en LLM en la misma tarea de decisión simulada.
- Análisis de sensibilidad de la función de recompensa: replicar el entrenamiento con otros pesos (por ejemplo, priorizar satisfacción sobre beneficio) y comparar contra esta versión con pesos 1:1:1, que es la configuración publicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible (MMLU, HumanEval, GSM8K y similares no aplican: no es un modelo de lenguaje). La model card sí reporta una evaluación sobre 40 meses no vistos del simulador CONNECT TYCOON, con la configuración de empresa indicada en las especificaciones:

| Metrica (media de 40 meses no vistos) | Director de reglas | connectailab-rl-altos-v1-teacher |
|---|---|---|
| Beneficio mensual | 3,24 millones de wones | 11,15 millones de wones |
| Satisfaccion del cliente | 79 % | 96 % |
| Incidentes de riesgo | 7,8 | 2,9 |
| Escalados por encima del limite de revision humana | 37,8 | 21,4 |
| Dias sin existencias | 10,7 | 0,6 |

Estos datos son resultados de simulación declarados por el autor y no han sido verificados de forma independiente; no son comparables con benchmarks estándar de modelos de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el modelo se ejecuta con `numpy` y la model card no declara pesos en gigabytes, pero el stack no requiere acelerador gráfico.
- GPU recomendadas: no aplica; no se documenta ningún requisito de GPU para inferencia.
- Compatibilidad con GPU de consumo: la inferencia funciona en CPU, por lo que cualquier equipo capaz de ejecutar Python y `connect-tycoon` es suficiente.
- Opciones de despliegue: paquete `connect-tycoon` (`pip install "connect-tycoon[game]"`), carga vía `CompanyBrain.from_hub` y modo interactivo `connect-tycoon play --brain hf:...`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se conocen políticas públicas equivalentes de la misma categoría (decisión empresarial sobre simulador con salida JEV) en la información disponible. La única referencia cuantitativa publicada es el profesor de reglas con el que se entrenó:

| Modelo | Tipo | Parametros | Contexto | Beneficio mensual | Satisfaccion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| connectailab-rl-altos-v1-teacher | Politica RL (PPO + imitacion) | No disponible | No aplica | 11,15 M KRW | 96 % | Apache 2.0 | HuggingFace |
| Director de reglas (baseline del autor) | Heuristico | No aplica | No aplica | 3,24 M KRW | 79 % | No disponible | Solo como referencia en la model card |
| Otras politicas publicas comparables | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Entorno sintético: el modelo está entrenado sobre un simulador de empresa concreto; el propio autor indica que es un modelo educativo y que no garantiza ni predice resultados de gestión reales.
- Sobreajuste a la configuración declarada: la evaluación se hizo con una configuración de empresa específica (almacén 250, demanda base 40, coste unitario 1,5, sin bonificaciones de personal ni salario). El comportamiento con otras configuraciones no está documentado.
- Herencia del profesor de reglas: la primera fase es imitación de un director heurístico, por lo que los sesgos de esas reglas pueden persistir en la política final.
- Sesgo hacia el reembolso total: en el ejemplo publicado, la probabilidad de reembolso completo es 0,9136 frente a 0,0125 de denegación, lo que sugiere una política permisiva que podría no ser deseable en un contexto de negocio real con márgenes ajustados.
- Escalados a revisión humana: la media de 21,4 escalados por encima del límite de revisión humana indica que la política sigue derivando carga considerable a operadores.
- Idioma: la model card declara únicamente coreano; no hay evidencia de funcionamiento en castellano ni en otros idiomas.
- Ausencia de texto libre: no puede justificar sus decisiones en lenguaje natural (el campo `reason` devuelve una etiqueta fija), lo que limita la auditabilidad semántica.
- Sin datos de arquitectura ni de parámetros: imposible estimar capacidad, reproducibilidad exacta o coste de reentrenamiento a partir de la información publicada.
- Licencia: Apache 2.0 permite uso comercial del artefacto, pero el aviso de exención de responsabilidad del autor sobre resultados de negocio debe mantenerse en cualquier uso derivado.
- Métricas no verificadas: los resultados de la tabla proceden exclusivamente de la model card, sin réplica independiente ni conjunto de evaluación público.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yonga76/connectailab-rl-altos-v1-teacher
- Repositorio CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Notebook de entrenamiento en Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/rl_decision_model_qwen_colab.ipynb
- Formato JEV referenciado: https://huggingface.co/typesafe/jev-1.13
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de aprendizaje por refuerzo: https://www.aicitybuilders.com/robot
- Connect AI: https://www.ezerai.xyz
