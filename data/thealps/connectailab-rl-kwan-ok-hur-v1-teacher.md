# THEALPS/connectailab-rl-kwan-ok-hur-v1-teacher

## Resumen

`connectailab-rl-kwan-ok-hur-v1-teacher` es una política de decisión entrenada con aprendizaje por refuerzo (PPO) por THEALPS, dentro del proyecto CONNECT AI LAB / CONNECT TYCOON. No es un modelo de lenguaje: es un "cerebro" que opera una empresa simulada durante un mes de juego (20 días laborables) tomando decisiones sobre asignación de personal, pedidos de inventario, marketing, atención al cliente, reembolsos y seguridad. Se distribuye como artefacto cargable con la librería `numpy` y se integra mediante la librería `connect-tycoon`, que expone una clase `CompanyBrain.from_hub(...)`.

El modelo responde en formato JEV (identificador `typesafe/jev-1.13`): recibe un estado de la empresa en JSON y devuelve, para cada pregunta de tipo elección, la opción seleccionada, la distribución de probabilidades sobre las alternativas, un nivel de confianza y una etiqueta de motivo. Su entrenamiento combina una fase de imitación de un "presidente de reglas" (aprendizaje supervisado) y una fase de PPO que optimiza una función de valor compuesta por beneficio, satisfacción del cliente y evitación de riesgos.

Es relevante como ejemplo de política RL pequeña, desplegable en CPU y con interfaz JSON tipada, pensada para docencia y experimentación en simulación empresarial. La model card declara explícitamente que se trata de un modelo educativo sobre un simulador sintético y que no garantiza ni predice resultados de gestión reales. El modelo tiene 0 descargas y 0 likes en HuggingFace en el momento de la consulta, y su idioma declarado es únicamente coreano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (política de decisión entrenada con PPO, cargada vía `numpy`; no se especifica topología de red en la model card) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica / no disponible (el estado se pasa como un objeto JSON de un solo turno) |
| Tipos de cuantizacion | No disponible (no se documentan cuantizaciones; los pesos se cargan con `numpy`) |
| Idiomas soportados | Coreano (`ko`) |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible (la model card solo indica `library_name: numpy`; no detalla `.npy`, `.npz` ni otro contenedor) |
| Tipo de modelo | Reinforcement learning (decision-making), pipeline `reinforcement-learning` |
| Algoritmo de entrenamiento | Aprendizaje supervisado por imitación de un "presidente de reglas" + PPO |
| Formato de entrada/salida | JSON estilo JEV (`typesafe/jev-1.13`): estado + preguntas tipadas → respuestas con elección, probabilidades, confianza y motivo |
| Entorno | Simulador CONNECT TYCOON (`gymnasium`), config: `warehouse 250.0`, `base_demand 40.0`, `unit_cost 1.5`, `order_scale 1.0`, `staff_bonus 0`, `wage 0.0`, `ad_power 1.0`, `fraud_tool 0`, `extra_cs 0`, `extra_refund 0` |
| Función de valor declarada | `{"이익": 1.0, "고객 만족": 1.0, "위험": 1.0}` (beneficio, satisfacción del cliente y riesgo, con peso 1.0 cada uno) |
| Descargas / likes | 0 / 0 |
| Fecha de publicación | 2026-10-20 |

## Arquitectura y entrenamiento

La model card no describe la topología de la red (número de capas, dimensión de las representaciones, tipo de codificador del estado). Lo que sí se documenta es el procedimiento: primero un ajuste supervisado para imitar a un "presidente de reglas" que actúa como referencia, y después un ajuste con PPO en el que la recompensa proviene de los tres valores declarados de la empresa (beneficio, satisfacción del cliente y riesgo, todos con peso 1.0). El resultado se empaqueta como política que responde a preguntas tipadas con distribución de probabilidad sobre las opciones disponibles, lo que permite tratarla como un clasificador por decisión en lugar de como un generador de texto.

El entorno sobre el que se entrena es un simulador de empresa con horizonte de un mes (20 días laborables) y decisiones discretas sobre seis áreas: personal, pedidos de inventario, marketing, atención al cliente, reembolsos y seguridad. La configuración concreta del entorno usada para la evaluación publicada se detalla en la tabla anterior. No se indican en la información disponible el número de tokens, el volumen de episodios, la composición del dataset de imitación ni si hubo optimización adicional tipo DPO/RLHF; tampoco se documentan innovaciones de inferencia (decodificación especulativa, atención lineal, etc.), ya que no es un transformer generativo.

## Capacidades

- Decisión discreta con distribución de probabilidad: devuelve `choice`, `probabilities` sobre todas las alternativas, `confidence` y una etiqueta `reason` (en el ejemplo publicado, `"강화학습 정책"`, "política de aprendizaje por refuerzo").
- Gestión de seis áreas operativas del simulador: asignación de personal, pedidos de inventario, campañas de marketing, atención al cliente, gestión de reembolsos y seguridad/antifraude.
- Razonamiento económico multiobjetivo: trade-off explícito entre beneficio, satisfacción del cliente y riesgo, codificado en la función de recompensa.
- Interfaz JSON tipada estilo JEV: admite preguntas con `type: "choice"` y criterios nombrados (`full`, `partial`, `deny`, `human` en el ejemplo de reembolsos).
- Integración con el simulador y con un modo jugable: `connect-tycoon play --brain hf:THEALPS/connectailab-rl-kwan-ok-hur-v1-teacher`.
- Ejecución en CPU con `numpy`, sin dependencias de GPU declaradas.
- Capacidad multilingüe: no disponible; el modelo está declarado solo para coreano.
- Tool calling / function calling, agentes multi-paso, visión, audio, modo "thinking": no disponibles; no es un modelo generativo y no se documentan estas capacidades.

## Casos de uso

- Docencia de aprendizaje por refuerzo: usar la política como ejemplo completo de canalización imitación → PPO → evaluación contra una línea base de reglas, con métricas de negocio interpretables (beneficio, satisfacción, incidentes).
- Evaluación de entornos `gymnasium`: servir de agente de referencia para comparar cambios en la configuración del simulador (`warehouse`, `base_demand`, `unit_cost`, `ad_power`, etc.) y medir su impacto en las métricas mensuales.
- Generación de datos sintéticos de decisión: al devolver distribuciones de probabilidad completas, permite muestrear decisiones etiquetadas con confianza para entrenar o validar políticas derivadas (destilación, ensembles, clasificadores supervisados).
- Pruebas de integración de interfaces JEV: el formato de entrada/salida tipado facilita validar esquemas, serialización y contratos de API en un servicio de decisión antes de conectar un modelo mayor.
- Simulación de agentes en productos de ocio o formación: el modo `connect-tycoon play` permite incorporar la política como oponente o como "copiloto" del jugador en un juego de gestión.
- Investigación sobre diseño de recompensas: la función de valor declarada (tres componentes a peso 1.0) sirve como caso de estudio para analizar cómo el equilibrado de recompensas altera el comportamiento emergente de la política.
- Estudio de calibración de políticas RL: comparar la confianza declarada con la precisión real de las decisiones en episodios nuevos del simulador.

## Benchmarks y rendimiento

Los únicos datos publicados en la model card son los de la evaluación sobre 40 meses no vistos, comparando la política con el "presidente de reglas" usado como referencia:

| Métrica (media de 40 meses no vistos) | Presidente de reglas | jay-company (este modelo) |
|---|---|---|
| Beneficio mensual | 7,08 M KRW | 17,19 M KRW |
| Satisfacción del cliente | 71 % | 96 % |
| Incidentes de riesgo | 11,5 | 1,9 |
| Confirmaciones humanas superadas | 69,5 | 14,8 |
| Días con rotura de stock | 9,1 | 0,4 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni comparaciones con otras políticas RL externas al proyecto.

## Requisitos de hardware

- VRAM estimada: no disponible; al cargarse con `numpy`, la inferencia se ejecuta en CPU y no requiere GPU.
- GPU recomendadas: ninguna; no se documenta aceleración por GPU.
- Cabe en cualquier equipo de consumo: sí, previsiblemente en cualquier máquina capaz de ejecutar Python + `numpy` + `connect-tycoon`, aunque no se publican requisitos mínimos oficiales.
- Opciones de despliegue: `connect-tycoon` (API `CompanyBrain.from_hub` y CLI `connect-tycoon play`), o serialización propia a partir de los pesos cargados con `numpy`. No aplica soporte de vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles. Al tratarse de una evaluación de política sobre un vector de estado, se espera un coste por decisión muy bajo, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| connectailab-rl-kwan-ok-hur-v1-teacher | Política RL (PPO) para simulación empresarial | No disponible | No aplica | 17,19 M KRW/mes, 96 % satisfacción, 1,9 incidentes | Apache 2.0 | HuggingFace (0 descargas) |
| "Presidente de reglas" (línea base del propio proyecto) | Sistema de reglas determinista | No disponible | No aplica | 7,08 M KRW/mes, 71 % satisfacción, 11,5 incidentes | No disponible | Incluido en el simulador CONNECT TYCOON |
| Otras políticas RL de decisión de la misma categoría | RL | No disponible | No aplica | No disponible | No disponible | No se han identificado alternativas comparables en la información disponible |

No se dispone de datos sobre otros modelos comparables de la misma categoría (políticas de decisión para simulación empresarial) en la información proporcionada.

## Limitaciones y advertencias

- Ámbito restringido: la política está entrenada para un simulador concreto y una configuración declarada; no se ha validado su transferencia a otros entornos ni a empresas reales.
- Advertencia explícita del autor: es un modelo educativo sobre un simulador sintético y "no garantiza ni predice resultados de gestión reales".
- Idioma: solo coreano declarado; las instrucciones y los motivos de decisión se emiten en ese idioma, lo que limita su uso directo en productos en castellano sin traducción o adaptación.
- Calibración: en el ejemplo publicado, el modelo asigna 0,9921 de probabilidad a la opción `full` frente a 0,0003 en dos de las alternativas; conviene validar empíricamente la confianza antes de usarla como umbral en producción.
- Sesgos: no documentados; al entrenarse por imitación de un "presidente de reglas" y optimizar una función de valor ponderada, puede heredar las preferencias y puntos ciegos de esa línea base (por ejemplo, priorizar beneficio y satisfacción frente a otros criterios no modelados).
- Riesgo de alucinación: no aplica en el sentido generativo, pero las decisiones pueden ser incorrectas o poco fundamentadas fuera de la distribución de estados vista en entrenamiento; el campo `reason` es una etiqueta fija, no una justificación detallada.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificación con atribución y conservación del aviso de licencia; el autor no impone restricciones adicionales en la model card, pero el carácter educativo del modelo desaconseja presentarlo como sistema de decisión empresarial real.
- Madurez del proyecto: 0 descargas y 0 likes; el propio autor indica que las "conexiones de modelos" (Connect AI) están en fase de prueba.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/THEALPS/connectailab-rl-kwan-ok-hur-v1-teacher
- Repositorio CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab (entrenamiento del modelo de decisión RL): https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/rl_decision_model_qwen_colab.ipynb
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS (curso de RL): https://www.aicitybuilders.com/robot
- Connect AI: https://www.ezerai.xyz
- Formato JEV referenciado en la model card: `typesafe/jev-1.13` (identificador, sin URL pública en la información disponible)
