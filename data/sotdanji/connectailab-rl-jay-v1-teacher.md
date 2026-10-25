# sotdanji/connectailab-rl-jay-v1-teacher

## Resumen

`connectailab-rl-jay-v1-teacher` es una política de decisión entrenada con aprendizaje por refuerzo profundo por el desarrollador **sotdanji** (CONNECT AI LAB × AI CITY BUILDERS) para operar una empresa simulada dentro del entorno [CONNECT TYCOON](https://github.com/wonseokjung/connect-tycoon). No es un modelo de lenguaje: la model card lo describe como el «córtex prefrontal» de un agente que, durante un mes simulado (20 días laborables), decide sobre asignación de personal, pedidos de inventario, marketing, atención al cliente, reembolsos y seguridad. El pipeline declarado en HuggingFace es `reinforcement-learning` y la librería de publicación es `numpy`.

El agente se entrenó en dos fases: primero imitando a un «jefe basado en reglas» (aprendizaje supervisado) y después ajustando sus decisiones con PPO usando como recompensa el vector de valores de la empresa `{"이익": 1.0, "고객 만족": 1.0, "위험": 1.0}` (beneficio, satisfacción del cliente y riesgo, con peso 1 cada uno). Todas sus respuestas se emiten en el formato de decisión JEV (`typesafe/jev-1.13`), es decir, como preguntas de tipo `choice` con distribución de probabilidad sobre las opciones y un campo de confianza.

Su relevancia es acotada y de tipo educativo/investigador: sirve como referencia reproducible de un pipeline imitación + PPO sobre un simulador de decisiones empresariales, y como ejemplo de integración de políticas de RL en una interfaz estructurada de preguntas y respuestas. La propia model card advierte que es un modelo educativo sobre un simulador sintético y que no garantiza ni predice resultados de gestión reales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible. Política de decisión entrenada con PPO y empaquetada como artefacto `numpy` (no es un transformer ni un modelo generativo) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible. El estado de entrada es un objeto estructurado (JEV) con el estado de la empresa y las preguntas; no se declara ventana de tokens |
| Tipos de cuantizacion | No disponible (no se publican pesos en formatos cuantizables; la carga se hace vía `connect_tycoon.CompanyBrain.from_hub`) |
| Idiomas soportados | Coreano (`ko`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Artefacto cargado con la librería `numpy` a través de `connect_tycoon`; no se declaran safetensors ni GGUF |
| Pipeline declarado | `reinforcement-learning` |
| Fecha de publicación | 2026-10-25 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La información disponible no detalla la topología de la red (capas, dimensionalidad, tipo de codificador del estado). Lo que sí se documenta es el procedimiento de entrenamiento en dos etapas: una primera fase de aprendizaje supervisado a partir de las decisiones de un «jefe basado en reglas» que actúa como profesor (de ahí el sufijo `teacher` del identificador), seguida de un ajuste con PPO en el que la recompensa se deriva del vector de valores de la empresa (beneficio, satisfacción del cliente y riesgo, todos con peso 1.0). El resultado es una política que devuelve distribuciones de probabilidad sobre opciones discretas, no texto libre.

La interfaz de decisión es el elemento técnico diferencial: el modelo consume un objeto JEV con `model`, `state` y `questions`, y responde con `answers` que incluyen el tipo de pregunta (`choice`), la opción seleccionada, las probabilidades de cada alternativa, un valor de `confidence` y un campo `reason`. En el ejemplo de la model card, ante una solicitud de reembolso con `fraud_score` 0.3146 devuelve `full` con 0.9139 de probabilidad, `human` con 0.085 y `partial`/`deny` con 0.0005 cada una. El entorno de entrenamiento es el simulador CONNECT TYCOON, con la configuración de empresa declarada: `warehouse` 250.0, `base_demand` 40.0, `unit_cost` 1.5, `order_scale` 1.0, `ad_power` 1.0, `wage` 0.0, entre otros parámetros.

## Capacidades

- Decisión discreta con distribución de probabilidad: devuelve la opción elegida junto con las probabilidades de todas las alternativas y un valor de confianza, lo que permite umbralizar o derivar a revisión humana.
- Gestión simulada de operaciones: asignación de personal, pedidos de inventario, campañas de marketing, atención al cliente, reembolsos y seguridad.
- Política de reembolsos con señal de fraude: distingue entre reembolso total, parcial, denegación y escalado a una persona, usando el `fraud_score` y el nivel del cliente (`tier`) como entradas.
- Respuesta en formato JEV (`typesafe/jev-1.13`): integrable en cualquier cliente que hable ese esquema de preguntas y respuestas.
- Operación multi-paso durante un episodio de 20 días laborables (un mes simulado), tomando decisiones secuenciales cuyo efecto se propaga al estado de la empresa.
- Soporte de ejecución jugable mediante la CLI `connect-tycoon play --brain hf:sotdanji/connectailab-rl-jay-v1-teacher`.
- No se documentan capacidades de generación de texto libre, código, matemáticas, visión, audio, tool calling genérico ni modo «thinking».

## Casos de uso

- **Evaluación de políticas de decisión en investigación:** el modelo sirve como línea base reproducible (imitación + PPO) frente a la que comparar nuevos algoritmos o funciones de recompensa en el mismo simulador, con métricas ya publicadas de beneficio, satisfacción, incidentes y días de rotura de stock.
- **Docencia de aprendizaje por refuerzo:** encaja en cursos de RL (la model card enlaza un curso específico y un notebook de Colab) como ejemplo completo de entrenamiento supervisado inicial seguido de PPO, con un entorno de negocio comprensible para no especialistas.
- **Desarrollo y prueba de simuladores:** al ser una política ya entrenada, permite validar cambios en el simulador CONNECT TYCOON (nuevos parámetros de configuración de empresa, nuevas acciones) midiendo cómo se degrada o mejora el comportamiento del agente.
- **Prototipado de APIs de decisión con JEV:** útil para construir y probar servicios que reciben preguntas estructuradas y devuelven distribuciones de probabilidad, incluyendo lógica de escalado a humano cuando `confidence` cae por debajo de un umbral (en el ejemplo, la opción `human` recibe 0.085 de masa).
- **Diseño de políticas de atención al cliente y fraude en un entorno sintético:** permite experimentar con umbrales de reembolso y reglas de escalado sin riesgo real, observando el efecto sobre beneficio y satisfacción en el simulador.
- **Integración como oponente o jefe automático en el juego:** mediante `connect-tycoon play`, se puede usar como «IA jefa» que compite o sustituye al jugador humano en partidas de gestión.
- **Demostraciones y material divulgativo:** el formato de salida (probabilidades + confianza + razón) se presta a visualizaciones del proceso de decisión del agente en charlas y vídeos, sin necesidad de infraestructura de inferencia de modelos generativos.

## Benchmarks y rendimiento

La model card publica una evaluación sobre 40 meses no vistos en el simulador, comparando la política con el «jefe basado en reglas» que se usó como profesor:

| Métrica (media de 40 meses no vistos) | Jefe basado en reglas | connectailab-rl-jay-v1-teacher |
|---|---|---|
| Beneficio mensual | 324만원 (3,24 M ₩) | 1111만원 (11,11 M ₩) |
| Satisfacción del cliente | 79 % | 95 % |
| Incidentes de riesgo | 7,8 | 2,8 |
| Escalados a confirmación humana excedidos | 37,8 | 21,7 |
| Días con rotura de stock | 10,7 | 0,5 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible; no aplican a un modelo de este tipo.

## Requisitos de hardware

- No se publican requisitos de VRAM ni de GPU en la información disponible; al no declararse el número de parámetros, no es posible estimar el consumo de memoria.
- La librería de publicación es `numpy` y el artefacto se carga con `connect_tycoon.CompanyBrain.from_hub`, por lo que el despliegue previsto es mediante Python y no mediante servidores de inferencia de LLM.
- No se documentan opciones de despliegue con vLLM, llama.cpp, Ollama o TGI; el soporte oficial indicado es la librería `connect-tycoon` (extra `[game]` para la CLI) y el notebook de Google Colab enlazado en la model card.
- No se publican datos de latencia ni de throughput.
- No se indica compatibilidad con GPUs de consumo (RTX 4090 y similares) ni con aceleradores A100/H100.

## Comparativa con modelos similares

No se dispone de información sobre otros modelos abiertos comparables en la misma categoría (políticas de RL para gestión empresarial simulada). La única referencia cuantitativa publicada es la del profesor basado en reglas:

| Elemento | Tipo | Beneficio mensual | Satisfacción | Incidentes de riesgo | Licencia |
|---|---|---|---|---|---|
| connectailab-rl-jay-v1-teacher | Política RL (PPO) | 1111만원 | 95 % | 2,8 | Apache 2.0 |
| Jefe basado en reglas (profesor) | Sistema de reglas | 324만원 | 79 % | 7,8 | No disponible |

Como referencia de formato, la model card menciona `typesafe/jev-1.13` como el esquema JEV con el que se formulan las preguntas; se trata de un formato de intercambio, no de un modelo comparable en rendimiento.

## Limitaciones y advertencias

- **Ámbito estrictamente simulado:** la model card declara explícitamente que es un modelo educativo sobre un simulador de empresa sintético y que no garantiza ni predice resultados de gestión reales. No debe usarse para decisiones empresariales reales.
- **Idioma:** solo se declara coreano (`ko`); no hay evidencia de soporte de castellano ni de otros idiomas en las entradas o salidas.
- **Sin datos de arquitectura ni de tamaño:** la ausencia de número de parámetros y de detalles de la red impide auditar el modelo y estimar costes de inferencia o requisitos de memoria.
- **Rendimiento ligado a una configuración concreta:** los resultados publicados corresponden a una configuración de empresa específica (`warehouse` 250.0, `base_demand` 40.0, `unit_cost` 1.5, `wage` 0.0, etc.); no se informa de comportamiento con otras configuraciones.
- **Riesgo de alucinación:** no aplica en el sentido de generación de texto, pero el campo `reason` del ejemplo se limita a «política de RL» y no proporciona justificación argumentada de la decisión; no debe interpretarse como explicación causal.
- **Confianza calibrada desconocida:** se publica `confidence` por respuesta, pero no hay información sobre calibración de esas probabilidades ni sobre cómo afectan a la precisión.
- **Escalado a humano:** el agente recurre a la opción `human` en su distribución, pero la información no especifica umbrales ni política de escalado recomendada.
- **Licencia:** Apache 2.0 permite uso comercial y modificación con las obligaciones habituales de atribución y aviso; aun así, el uso comercial chocaría con la advertencia de que el modelo no predice resultados reales.
- **Madurez:** 0 descargas y 0 likes en el momento de la consulta, sin historial de uso externo ni issues públicos documentados.
- **Búsqueda web:** los resultados de búsqueda obtenidos no guardan relación con el modelo (tratan sobre intervalos musicales), por lo que no aportan verificación independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sotdanji/connectailab-rl-jay-v1-teacher
- Repositorio CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Notebook de entrenamiento en Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/rl_decision_model_qwen_colab.ipynb
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS (curso de RL): https://www.aicitybuilders.com/robot
- AI CITY BUILDERS (sitio principal): https://www.aicitybuilders.com
- Connect AI: https://www.ezerai.xyz
- Esquema JEV citado: `typesafe/jev-1.13` (referenciado en la model card; no se proporciona URL directa)
