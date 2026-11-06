# yegom/connectailab-rl-yegomne-v5-teacher

## Resumen

connectailab-rl-yegomne-v5-teacher es un modelo de aprendizaje por refuerzo (RL) desarrollado por yegom (Park Sehyun) dentro del laboratorio CONNECT AI LAB. No es un modelo de lenguaje generativo: es una política de decisión entrenada con PPO que actúa como "cerebro" de una empresa simulada en el entorno CONNECT TYCOON, un simulador de gestión empresarial. El modelo recibe el estado de la empresa (departamento, motivo de la petición, tipo de cliente, importes, puntuaciones de fraude) y devuelve una decisión entre un conjunto cerrado de opciones, en formato JEV.

La relevancia del modelo es acotada y de carácter educativo: sirve como ejemplo de aplicación de RL a la toma de decisiones secuenciales con recompensas multiobjetivo (beneficio, satisfacción del cliente, riesgo), empaquetado como política NumPy sin dependencias de frameworks de deep learning en inferencia. El autor reporta que supera a una política basada en reglas (el "jefe reglamentario") en ingresos mensuales y métricas operativas en un promedio de 40 meses no vistos durante el entrenamiento.

El modelo está orientado exclusivamente al coreano y se distribuye con licencia Apache 2.0. No dispone de arquitectura transformer, parámetros en el sentido habitual ni ventana de contexto lingüística; sus especificaciones se describen en términos de política RL.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política de aprendizaje por refuerzo (PPO) sobre representación de estado tabular/vectorial; inferencia en NumPy |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; opera sobre un estado estructurado por paso) |
| Tipos de cuantización | no disponible (los pesos se ejecutan en NumPy; no se documentan formatos cuantizados) |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible explícitamente; la librería indicada es `numpy` |

## Arquitectura y entrenamiento

El modelo es una política entrenada con Proximal Policy Optimization (PPO) sobre el simulador CONNECT TYCOON. El proceso de entrenamiento descrito en la model card consta de dos fases: primero una fase de imitación (aprendizaje supervisado) en la que la política aprende a reproducir las decisiones de una política basada en reglas ("jefe reglamentario"), y después un ajuste con PPO en el que la recompensa proviene de la función de valor de la empresa, definida como `{"이익": 2.5, "고객 만족": 2.0, "위험": 1.0}` (beneficio 2,5; satisfacción del cliente 2,0; riesgo 1,0).

La política opera sobre un estado estructurado por departamento (por ejemplo, reembolsos con motivo, tipo de cliente, importe y puntuación de fraude) y emite decisiones discretas con distribución de probabilidad asociada. La salida se serializa en formato JEV (`typesafe/jev-1.13`), lo que permite devolver respuestas tipadas con elección, probabilidades por opción, confianza y motivo. No se documentan detalles sobre tamaño de red, número de tokens de entrenamiento ni composición del dataset más allá de la simulación sintética.

## Capacidades

- Toma de decisiones discretas en el simulador de empresa CONNECT TYCOON: asignación de personal, pedidos de inventario, marketing, atención al cliente, reembolsos y seguridad.
- Salida tipada en formato JEV con elección, distribución de probabilidades, confianza y motivo declarado ("강화학습 정책", política de RL).
- Optimización multiobjetivo con pesos explícitos sobre beneficio, satisfacción del cliente y riesgo.
- Generalización a episodios no vistos: la model card reporta métricas medias sobre 40 meses de simulación.
- Integración con el paquete `connect-tycoon` mediante `CompanyBrain.from_hub(...)` y modo de juego `connect-tycoon play --brain hf:...`.
- No soporta tool calling, function calling, agentes multi-paso genéricos, visión, audio ni generación de texto libre.
- Capacidad multilingüe: únicamente coreano.

## Casos de uso

- Docencia de aprendizaje por refuerzo: el modelo sirve como ejemplo completo de pipeline imitación + PPO con recompensa multiobjetivo, ejecutable en Google Colab mediante el notebook enlazado en la model card.
- Simulación de gestión empresarial: permite sustituir la política basada en reglas del simulador CONNECT TYCOON por una política aprendida y comparar métricas de beneficio, satisfacción y riesgo mes a mes.
- Evaluación de políticas de reembolso: el estado de ejemplo (departamento `refund`, motivo `미배송`, cliente `단골`, importe 8,7, puntuación de fraude 0,31) muestra cómo la política decide entre reembolso total, parcial, denegación o revisión humana con probabilidades explícitas.
- Investigación sobre escalado de políticas en entornos con fraude: la inclusión de una puntuación de fraude en el estado y de un coste por revisión humana (0,8 unidades por caso) permite estudiar el equilibrio entre automatización y supervisión.
- Benchmark de referencia para políticas RL: las métricas publicadas (1.074 unidades de beneficio mensual frente a 324 de la política de reglas, 96 % de satisfacción, 4,7 incidentes de riesgo, 8,6 derivaciones a humano y 0,8 días de rotura de stock) permiten usarlas como línea base en experimentos propios sobre el mismo simulador.
- Demostración educativa de integración de modelos RL en aplicaciones: el comando `connect-tycoon play --brain hf:yegom/connectailab-rl-yegomne-v5-teacher` ilustra cómo cargar una política desde Hugging Face y conectarla a un entorno interactivo.

## Benchmarks y rendimiento

La model card reporta resultados medios sobre 40 meses no vistos, comparando la política aprendida con la política basada en reglas:

| Métrica (media de 40 meses) | Política de reglas | connectailab-rl-yegomne-v5-teacher |
|---|---|---|
| Beneficio mensual | 324 | 1.074 |
| Satisfacción del cliente | 79 % | 96 % |
| Incidentes de riesgo | 7,8 | 4,7 |
| Derivaciones a revisión humana | 37,8 | 8,6 |
| Días de rotura de stock | 10,7 | 0,8 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que el modelo no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada: no disponible; la inferencia se ejecuta en NumPy sobre CPU, sin requisitos de GPU documentados.
- GPU recomendadas: no aplica; no se documenta aceleración por GPU.
- Cabe en cualquier GPU consumer y en CPU convencional, dado que la política se ejecuta como cálculo NumPy sobre un vector de estado.
- Opciones de despliegue: paquete `connect-tycoon` (`pip install "connect-tycoon[game]"`), carga desde Hugging Face mediante `CompanyBrain.from_hub`, y notebook de Google Colab (`rl_decision_model_qwen_colab.ipynb`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Licencia | Disponibilidad |
|---|---|---|---|---|
| connectailab-rl-yegomne-v5-teacher | Política PPO (NumPy) | CONNECT TYCOON | Apache 2.0 | Hugging Face |
| connectailab-rl-yegomfloor-v2-teacher | Política RL (NumPy) | CONNECT TYCOON | no disponible en la información | Hugging Face |
| connectailab-rl-yegomfloor-v4-teacher | Política RL (NumPy) | CONNECT TYCOON | no disponible en la información | Hugging Face |

Las alternativas encontradas son versiones anteriores del mismo autor y familia, no modelos de terceros comparables. No se dispone de datos de rendimiento de las versiones v2 y v4 en la información proporcionada.

## Limitaciones y advertencias

- Modelo educativo sobre un simulador sintético: la propia model card advierte de que no garantiza ni predice resultados de gestión real.
- Ámbito de aplicación muy restringido: solo funciona sobre el estado y las acciones definidos por CONNECT TYCOON; no es un modelo de propósito general.
- Idioma: únicamente coreano, tanto en las instrucciones del entorno como en los motivos de salida.
- Riesgo de alucinación no aplica en el sentido lingüístico, pero la política puede producir decisiones de baja confianza; el ejemplo de la model card muestra una opción con probabilidad 0,0013, lo que exige umbrales de confianza en producción.
- Las métricas reportadas (1.074 de beneficio, 96 % de satisfacción) provienen del propio autor y de un único entorno de evaluación; no han sido replicadas de forma independiente en la información disponible.
- Sin soporte documentado de tool calling, agentes o generación de texto; no debe presentarse como sustituto de un LLM.
- Licencia Apache 2.0 permite uso comercial del artefacto, pero el valor práctico fuera del simulador es nulo; verificar la licencia del entorno `connect-tycoon` por separado.
- El experimento "Connect AI" (conexión entre modelos) se describe como en fase de pruebas en la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yegom/connectailab-rl-yegomne-v5-teacher
- Versión anterior v2: https://huggingface.co/yegom/connectailab-rl-yegomfloor-v2-teacher
- Versión anterior v4: https://huggingface.co/yegom/connectailab-rl-yegomfloor-v4-teacher
- Repositorio CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/rl_decision_model_qwen_colab.ipynb
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL de AI CITY BUILDERS: https://www.aicitybuilders.com/robot
- Connect AI: https://www.ezerai.xyz
