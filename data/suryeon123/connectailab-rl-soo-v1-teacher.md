# suryeon123/connectailab-rl-soo-v1-teacher

## Resumen

connectailab-rl-soo-v1-teacher es una política de decisión entrenada con aprendizaje por refuerzo que actúa como «presidente de empresa» dentro de CONNECT TYCOON, un simulador sintético de gestión empresarial impulsado por CONNECT AI LAB y AI CITY BUILDERS. El modelo, publicado por el usuario suryeon123, no es un modelo de lenguaje generativo: es un cerebro de decisión que recibe el estado de la compañía y devuelve decisiones en formato JEV (`typesafe/jev-1.13`) sobre asignación de personal, reposición de inventario, marketing, atención al cliente, reembolsos y seguridad. La model card lo describe como el «córtex prefrontal» del simulador, encargado de dirigir la empresa durante un mes simulado equivalente a 20 días laborables.

El entrenamiento se hizo en dos fases: primero imitación de un «presidente de reglas» mediante aprendizaje supervisado y después ajuste con PPO, usando como recompensa una función de valor compuesta por beneficio, satisfacción del cliente y riesgo, los tres con peso 1,0. El artefacto se distribuye en formato numpy y se ejecuta con la librería `connect-tycoon`, con licencia Apache 2.0 y soporte documentado únicamente en coreano.

Según la model card, sobre 40 meses simulados no vistos previamente promedia 12,09 millones de wones de beneficio mensual, un 95 % de satisfacción, 3,4 incidentes de riesgo, 8,9 derivaciones a revisión humana y 0,6 días de rotura de stock, frente a 3,24 millones, 79 %, 7,8, 37,8 y 10,7 del presidente de reglas. Es una pieza educativa y de investigación, no un sistema que prediga ni garantice resultados empresariales reales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de decisión de aprendizaje por refuerzo con PPO; no se documenta la topología de red ni el número de capas) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (la unidad de trabajo es un mes simulado de 20 días laborables, no una ventana de tokens) |
| Tipos de cuantizacion | no aplica (artefacto distribuido en formato numpy) |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | numpy (`library_name: numpy`), consumido a través de la librería `connect-tycoon` |
| Libreria de inferencia declarada | numpy |
| Pipeline declarado | reinforcement-learning |
| Entorno de entrenamiento | gymnasium, CONNECT TYCOON |
| Formato de intercambio de decisiones | JEV (`typesafe/jev-1.13`) |
| Fecha de creacion del repositorio | 2026-10-13 (segun metadatos de HuggingFace) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La información disponible no detalla la topología interna de la red (número de capas, dimensión de las representaciones, tipo de codificador del estado). Lo que sí se documenta es el procedimiento: existe un «presidente de reglas» heurístico que sirve de profesor, y el modelo aprende primero por imitación de sus decisiones (fase de aprendizaje supervisado) y después se refina con PPO, optimizando la recompensa definida por los valores de la compañía. Esos valores son `{"이익": 1.0, "고객 만족": 1.0, "위험": 1.0}`, es decir, beneficio, satisfacción del cliente y riesgo, todos con peso idéntico.

El modelo se evalúa sobre una configuración concreta de empresa: `{"warehouse": 250.0, "base_demand": 40.0, "unit_cost": 1.5, "order_scale": 1.0, "staff_bonus": 0, "wage": 0.0, "ad_power": 1.0, "fraud_tool": 0, "extra_cs": 0, "extra_refund": 0}`. La interfaz de decisión es tipada: recibe un estado (por ejemplo `department: refund`, `reason: 미배송`, `tier: 단골`, `amount: 8.7`, `fraud_score: 0.3146`) y devuelve una elección dentro de un conjunto de criterios, junto con la distribución de probabilidad sobre cada opción y un valor de confianza. En el ejemplo de la model card, para una solicitud de reembolso la política asigna 0,9648 a «reembolso total», 0,0332 a «reembolso parcial», 0,001 a «rechazar» y 0,001 a «revisión humana». Como innovación destacable, la model card menciona que todas las decisiones se expresan en el mismo formato que JEV, lo que permite auditar la salida como una respuesta tipada y probabilística. El cuaderno de entrenamiento enlazado se denomina `rl_decision_model_qwen_colab.ipynb`; la información disponible no confirma que el modelo use una base tipo Qwen ni qué relación guarda ese nombre con la arquitectura final.

## Capacidades

- Toma de decisiones discretas con distribución de probabilidad explícita sobre cada alternativa, no solo una acción determinista.
- Gestión de seis áreas operativas del simulador: asignación de personal, pedidos de inventario, marketing, atención al cliente, reembolsos y seguridad.
- Política entrenada con PPO sobre recompensa multiobjetivo (beneficio, satisfacción, riesgo) con pesos iguales.
- Interfaz tipada tipo JEV con campos de estado, preguntas y criterios; devuelve `choice`, `probabilities`, `confidence` y una etiqueta de origen (`"reason": "강화학습 정책"`).
- Manejo de casos con incertidumbre, como reembolsos con `fraud_score` continuo y segmentación por tipo de cliente (`tier`).
- Capacidad de derivar decisiones a revisión humana como una opción más del espacio de acciones.
- Ejecución integrada en el simulador mediante `CompanyBrain.from_hub` y modo interactivo con `connect-tycoon play`.
- No dispone de generación de texto libre, visión, audio, tool calling genérico ni razonamiento multi-paso fuera del simulador.

## Casos de uso

- Docencia de aprendizaje por refuerzo: el modelo sirve como ejemplo completo de un ciclo imitación + PPO, con una línea base heurística clara y métricas comparables sobre 40 meses simulados.
- Evaluación de políticas en entornos de decisión empresarial: permite medir el efecto de cambiar la función de recompensa o los pesos de beneficio, satisfacción y riesgo sin necesidad de desplegar infraestructura de GPU.
- Investigación sobre sistemas multiobjetivo: al tener los tres valores con peso 1,0, es un banco de pruebas para estudiar compromisos entre rentabilidad, satisfacción y control de riesgo en política aprendida frente a reglas.
- Simulación de gestión de reembolsos y fraude: el estado incluye `fraud_score` y `tier`, de modo que se puede estudiar cómo una política calibra el coste de aprobar un abuso frente al de rechazar a un cliente legítimo.
- Gestión de inventario y rotura de stock: con 0,6 días de rotura frente a 10,7 del profesor de reglas, es útil para analizar políticas de reposición bajo restricciones de almacén (`warehouse: 250.0`) y coste unitario (`unit_cost: 1.5`).
- Demostraciones y material divulgativo: la integración con el modo `play` y el cuaderno de Colab permite ejecutar el modelo en un portátil sin GPU y visualizar las decisiones en el simulador.
- Pruebas de interfaces de decisión tipadas: sirve para validar esquemas JEV y contratos de entrada/salida en pipelines que necesiten respuestas con probabilidades y nivel de confianza.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks estándar (MMLU, HumanEval, GSM8K ni equivalentes). El único dato de rendimiento disponible es la comparación interna contra el presidente de reglas sobre 40 meses simulados no vistos:

| Métrica (media de 40 meses) | Presidente de reglas | connectailab-rl-soo-v1-teacher |
|---|---|---|
| Beneficio mensual | 3,24 millones de wones | 12,09 millones de wones |
| Satisfacción del cliente | 79 % | 95 % |
| Incidentes de riesgo | 7,8 | 3,4 |
| Derivaciones a persona que superan el umbral | 37,8 | 8,9 |
| Días de rotura de stock | 10,7 | 0,6 |

No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El artefacto se distribuye en formato numpy y la librería de inferencia declarada es numpy, por lo que la ejecución no depende de aceleradores gráficos; no se documentan requisitos oficiales de VRAM ni de GPU.
- Al ser una política de decisión de tamaño no especificado, se puede ejecutar en CPU dentro de un portátil convencional, tal como plantea el cuaderno de Colab enlazado.
- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible (no se documenta soporte de CUDA ni de backends de aceleración).
- Compatibilidad con GPU de consumo: no documentada; por el formato del artefacto no parece necesaria.
- Opciones de despliegue: librería `connect-tycoon` (extra `[game]`), carga vía `ct.CompanyBrain.from_hub`, modo interactivo `connect-tycoon play --brain hf:suryeon123/connectailab-rl-soo-v1-teacher` y ejecución desde Google Colab. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, coherente con que no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se han encontrado en la información disponible otros modelos publicados de la misma categoría (políticas de decisión para el simulador CONNECT TYCOON). La única alternativa comparable documentada es la línea base heurística incluida en la propia model card:

| Modelo | Tipo | Beneficio mensual | Satisfacción | Incidentes de riesgo | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| connectailab-rl-soo-v1-teacher | Política RL (PPO) | 12,09 millones de wones | 95 % | 3,4 | Apache 2.0 | HuggingFace (`suryeon123/connectailab-rl-soo-v1-teacher`) |
| Presidente de reglas (línea base) | Heurística de reglas | 3,24 millones de wones | 79 % | 7,8 | no disponible | incluida en el simulador CONNECT TYCOON |
| Otros agentes de decisión comparables | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

Los datos de beneficio, satisfacción e incidentes corresponden a la media de 40 meses simulados reportada por el autor, no a benchmarks independientes.

## Limitaciones y advertencias

- Modelo entrenado sobre un simulador sintético: la propia model card advierte de que es un modelo educativo y que no garantiza ni predice resultados de gestión reales.
- Especialización estrecha: es válido para las seis áreas operativas del simulador y para su configuración de empresa concreta; fuera de ese entorno no se documenta ninguna capacidad de transferencia.
- La configuración de compañía usada (`warehouse`, `base_demand`, `unit_cost`, `order_scale`, `wage`, `ad_power`, etc.) puede afectar al comportamiento de la política; no se publican evaluaciones de robustez frente a cambios en esos parámetros.
- Idioma: la única lengua declarada es el coreano (ko), incluyendo etiquetas de estado y criterios de decisión.
- No es un modelo generativo, por lo que el riesgo de alucinación de texto no aplica; sí puede producir distribuciones de probabilidad sobreconfiadas, como el 0,9648 del ejemplo, sin que se documente calibración.
- No se publican curvas de entrenamiento, número de parámetros, épocas ni semillas, lo que dificulta reproducir o auditar el resultado.
- Cero descargas y cero «likes» en el momento de la consulta: no existe validación independiente por parte de la comunidad.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución, pero al tratarse de un modelo educativo no hay garantías asociadas.
- Sesgos conocidos: no disponible (no se documenta ningún análisis de sesgo).
- Advertencia para producción: no se recomienda usar este modelo para automatizar decisiones empresariales reales sin una validación externa previa y un mecanismo de supervisión humana.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/suryeon123/connectailab-rl-soo-v1-teacher
- Repositorio CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Cuaderno de entrenamiento en Google Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/rl_decision_model_qwen_colab.ipynb
- Canal de YouTube de CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- Curso de aprendizaje por refuerzo de AI CITY BUILDERS: https://www.aicitybuilders.com/robot
- Sitio de AI CITY BUILDERS: https://www.aicitybuilders.com
- Sitio de Connect AI: https://www.ezerai.xyz
- Esquema JEV referenciado (`typesafe/jev-1.13`): https://huggingface.co/typesafe/jev-1.13
- Banner del proyecto: https://raw.githubusercontent.com/wonseokjung/connect-tycoon/main/docs/brand/banner.gif
- Imagen de demostración del simulador: https://raw.githubusercontent.com/wonseokjung/connect-tycoon/main/docs/images/hero.gif
