# youn485/connectailab-rl-connectailab-rl-jinbrain-v5-teacher

## Resumen

`connectailab-rl-connectailab-rl-jinbrain-v5-teacher` es una política de decisión entrenada con aprendizaje por refuerzo (PPO) por el autor youn485 para el simulador de gestión empresarial CONNECT TYCOON, desarrollado por CONNECT AI LAB en colaboración con AI CITY BUILDERS. No es un modelo de lenguaje: recibe un estado estructurado en formato JSON tipo JEV (`typesafe/jev-1.13`) —por ejemplo, una solicitud de reembolso con importe, antigüedad del cliente y puntuación de fraude— y devuelve una respuesta también en JSON con la opción elegida, la distribución de probabilidades sobre las alternativas y un nivel de confianza.

El modelo actúa como el "cerebro" que opera una empresa simulada durante un mes de 20 días laborables: decide asignación de personal, pedidos de inventario, marketing, atención al cliente, reembolsos y seguridad. Según la model card, se entrenó primero imitando a un "presidente de reglas" (aprendizaje supervisado) y después se ajustó con PPO usando los valores de la empresa (beneficio, satisfacción del cliente y riesgo) como función de recompensa.

Su relevancia es acotada y de carácter educativo: sirve como ejemplo reproducible de un agente de decisión con salida probabilística integrable mediante JEV, y como referencia comparativa frente a una política basada en reglas. La librería declarada es `numpy`, el idioma indicado es coreano (`ko`), la licencia es Apache 2.0 y el repositorio no registra descargas ni "likes" en el momento de la consulta. No se han publicado detalles de arquitectura de red ni recuento de parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de decisión entrenada con PPO (aprendizaje por refuerzo); estructura interna de la red no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; la entrada es un estado estructurado JSON, no texto libre con ventana de tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | coreano (`ko`) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible; librería declarada `numpy` (no se indica safetensors ni GGUF) |
| Pipeline | `reinforcement-learning` |
| Formato de entrada/salida | JSON estilo JEV (`typesafe/jev-1.13`): estado + preguntas tipadas → respuestas con elección, probabilidades y confianza |
| Entorno de entrenamiento | Simulador CONNECT TYCOON, config `{"warehouse": 250.0, "base_demand": 40.0, "unit_cost": 1.5, "order_scale": 1.0, "staff_bonus": 0, "wage": 0.0, "ad_power": 1.0, "fraud_tool": 0, "extra_cs": 0, "extra_refund": 0}` |
| Descargas / likes | 0 / 0 |
| Fecha de creacion / actualizacion | 2026-10-25 / 2026-10-25 |

## Arquitectura y entrenamiento

La información disponible describe el proceso de entrenamiento en dos fases, pero no la topología de la red. En la primera fase el modelo aprende por imitación (aprendizaje supervisado) a partir de un "presidente de reglas" que actúa como profesor; en la segunda se ajusta con PPO (Proximal Policy Optimization) utilizando como recompensa los valores declarados de la empresa: beneficio, satisfacción del cliente y riesgo, todos con peso 1.0. El sufijo `teacher` del identificador y la etiqueta `jev` sugieren que el artefacto está pensado como política de referencia o docente dentro de un esquema de destilación, aunque este extremo no se detalla en la model card.

El espacio de acciones es discreto y tipado: en el ejemplo publicado, la decisión sobre un reembolso se distribuye entre `full` (0.9637), `partial` (0.0156), `deny` (0.0145) y `human` (0.0062), lo que indica una cabeza de política categórica que devuelve probabilidades normalizadas. No se especifican número de tokens de entrenamiento, composición del dataset, técnicas de RLHF/DPO ni innovaciones de decodificación (atención lineal, decodificación especulativa, etc.); ninguno de esos datos está disponible.

## Capacidades

- Toma de decisiones discretas con salida probabilística: devuelve la opción elegida junto con la distribución completa sobre las alternativas y un valor de confianza.
- Razonamiento sobre estado estructurado: interpreta campos como `department`, `reason`, `tier`, `amount` y `fraud_score` para resolver la consulta planteada.
- Gestión operativa simulada: asignación de personal, reposición de inventario, inversión en marketing, atención al cliente, política de reembolsos y decisiones de seguridad.
- Respuesta en formato JEV: la salida sigue el esquema `typesafe/jev-1.13`, lo que facilita su integración en pipelines que esperan JSON validable.
- Operación multi-turno a nivel de episodio: mantiene una política consistente a lo largo de un mes simulado de 20 días laborables.
- Integración con el simulador: se carga mediante `ct.CompanyBrain.from_hub(...)` y puede jugarse en modo CLI con `connect-tycoon play --brain hf:...`.
- Idiomas: únicamente coreano según los metadatos; no hay soporte multilingüe declarado.
- No soporta tool calling, function calling genérico, visión, audio ni modos de razonamiento extendido; no es un modelo generativo de texto.

## Casos de uso

- Docencia de aprendizaje por refuerzo: el paquete permite ejecutar el modelo en el simulador y comparar su política con la del "presidente de reglas", lo que sirve para explicar PPO, imitación y diseño de recompensas con un caso tangible.
- Evaluación de políticas de decisión como baseline: al publicar métricas de un mes simulado (beneficio, satisfacción, incidentes), puede usarse como referencia frente a nuevas políticas entrenadas sobre el mismo entorno.
- Demostraciones en vivo: `connect-tycoon play --brain hf:...` arranca el juego con el modelo al mando, útil para charlas y talleres sin infraestructura de GPU.
- Integración mediante JEV en pipelines de decisión: cualquier servicio que plantee preguntas tipadas con criterios y espere una respuesta con probabilidades puede consumir el modelo a través de `CompanyBrain.from_hub`.
- Prototipado de agentes con salida probabilística: sirve para probar cómo se comporta un consumidor aguas abajo que necesita umbrales de confianza (por ejemplo, derivar a `human` cuando la probabilidad de la opción mayoritaria es baja).
- Estudio de destilación profesor-alumno: al estar etiquetado como `teacher`, puede emplearse para generar decisiones de referencia sobre estados del simulador y entrenar políticas más pequeñas.
- Simulación de políticas de fraude y reembolso: el estado de ejemplo incluye `fraud_score`, lo que permite analizar cómo traduce el modelo esa señal en decisiones de coste frente a satisfacción.
- Reproducibilidad de experimentos: el notebook de Colab enlazado permite reentrenar o inspeccionar el flujo completo sin montar entorno propio.

## Benchmarks y rendimiento

La model card publica una evaluación sobre 40 meses no vistos, comparando el modelo con el "presidente de reglas". Son las únicas cifras disponibles; no hay resultados de MMLU, HumanEval, GSM8K ni de benchmarks estándar de LLM, que no aplican a este tipo de artefacto.

| Metrica (media de 40 meses no vistos) | Presidente de reglas | connect-ai-company-v5 |
|---|---|---|
| Beneficio mensual | 3,24 M KRW | 12,82 M KRW |
| Satisfaccion del cliente | 79 % | 93 % |
| Incidentes de riesgo | 7,8 | 1,4 |
| Confirmaciones humanas | 37,8 | 6,9 |
| Dias sin stock | 10,7 | 0,4 |

No se han publicado intervalos de confianza, desviaciones típicas, número de semillas ni detalles del protocolo de evaluación, por lo que la comparación debe tomarse como indicativa.

## Requisitos de hardware

- VRAM estimada: no disponible; al declarar `numpy` como librería, la inferencia parece ejecutarse en CPU sin aceleración por GPU.
- GPU recomendadas: no se indica ninguna; no hay evidencia de que el modelo requiera GPU.
- GPU de consumo: no aplica según la información disponible (no se publican pesos en formato de red neuronal profunda ni requisitos de memoria).
- Despliegue: paquete `connect-tycoon` (`pip install "connect-tycoon[game]"`), API Python `ct.CompanyBrain.from_hub`, y notebook de Google Colab para entrenamiento/ejecución.
- vLLM, llama.cpp, Ollama y TGI no son aplicables: no es un modelo de lenguaje con pesos en safetensors o GGUF.
- Latencia y throughput: no disponibles. La resolución de una consulta en el ejemplo es inmediata en CPU, pero no se publican medidas.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| connect-ai-company-v5 (este) | Politica RL (PPO + imitacion) | no disponible | no aplica | 12,82 M KRW de beneficio, 93 % satisfaccion, 1,4 incidentes | Apache 2.0 | HuggingFace + `connect-tycoon` |
| Presidente de reglas (baseline del simulador) | Sistema de reglas determinista | no aplica | no aplica | 3,24 M KRW, 79 %, 7,8 incidentes | incluido en el simulador | GitHub del proyecto |
| Otros modelos de decision comparables | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han identificado en la información proporcionada otros modelos públicos de decisión entrenados sobre el mismo entorno; la única comparación con datos es la del baseline de reglas.

## Limitaciones y advertencias

- Ámbito muy restringido: la política está entrenada para el simulador CONNECT TYCOON y su espacio de acciones; no generaliza a dominios externos ni a decisiones empresariales reales.
- No es un modelo de lenguaje: no genera texto libre, no responde preguntas abiertas y no admite tool calling ni razonamiento multi-paso genérico.
- Sesgo de la recompensa: al optimizar beneficio, satisfacción y riesgo con peso idéntico (1.0), la política hereda las prioridades del diseñador; cambiar los pesos produciría un comportamiento distinto y no evaluado.
- Riesgo de sobreajuste al simulador: las métricas publicadas provienen de 40 meses no vistos del mismo entorno, sin validación cruzada ni semillas múltiples declaradas.
- Alucinación en sentido estricto no aplica, pero sí calibración incierta: la confianza de 0.9637 del ejemplo no está acompañada de estudios de calibración.
- Idioma: solo coreano según los metadatos; la documentación y los ejemplos están en coreano.
- Licencia Apache 2.0, permisiva para uso comercial, pero la model card advierte explícitamente de que se trata de un modelo educativo sobre un simulador sintético que no garantiza ni predice resultados de gestión reales.
- Repositorio sin tracción: 0 descargas y 0 likes, sin issues ni mantenimiento verificable; la fecha de creación declarada (2026-10-25) es posterior a la de la mayoría de artefactos del ecosistema, lo que conviene comprobar antes de fijarlo como dependencia.
- Ausencia de datos técnicos clave (parámetros, formato de pesos, protocolo de entrenamiento) impide auditar el modelo o reproducir el entrenamiento sin acudir al repositorio de código.

## Enlaces

- HuggingFace: https://huggingface.co/youn485/connectailab-rl-connectailab-rl-jinbrain-v5-teacher
- Repositorio del simulador: https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/rl_decision_model_qwen_colab.ipynb
- Canal de YouTube de CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de aprendizaje por refuerzo: https://www.aicitybuilders.com/robot
- Connect AI: https://www.ezerai.xyz
- Banner del proyecto: https://raw.githubusercontent.com/wonseokjung/connect-tycoon/main/docs/brand/banner.gif
- Imagen del simulador: https://raw.githubusercontent.com/wonseokjung/connect-tycoon/main/docs/images/hero.gif
