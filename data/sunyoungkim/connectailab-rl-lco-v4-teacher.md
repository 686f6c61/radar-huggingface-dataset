# sunyoungKim/connectailab-rl-lco-v4-teacher

## Resumen

connectailab-rl-lco-v4-teacher es un modelo de política de aprendizaje por refuerzo (RL) desarrollado por sunyoungKim (perfil LCO_Official) dentro del proyecto CONNECT AI LAB, en colaboración con AI CITY BUILDERS, para el simulador de gestión empresarial Connect Tycoon. No es un modelo de lenguaje generativo: es un "cerebro" de toma de decisiones que recibe un estado estructurado en formato JEV (`typesafe/jev-1.13`) y devuelve una respuesta también en JEV con la acción elegida, un vector de probabilidades por alternativa, un nivel de confianza y una razón. El modelo actúa como el "córtex prefrontal" de una empresa sintética que debe operar durante un mes de 20 días laborables, tomando decisiones de personal, reposición de inventario, marketing, atención al cliente, reembolsos y seguridad.

El problema que aborda es el de la toma de decisiones secuencial bajo múltiples objetivos en conflicto: maximizar beneficio, mantener la satisfacción del cliente y minimizar incidentes de riesgo. El entrenamiento combina una fase de imitación supervisada de un "presidente basado en reglas" con un posterior ajuste mediante PPO usando como recompensa los valores declarados de la empresa (`{"이익": 1.0, "고객 만족": 1.0, "위험": 1.0}`). La model card publica una comparativa sobre 40 meses no vistos en la que el modelo supera ampliamente a la línea base de reglas.

Es relevante ahora porque ilustra un patrón creciente de modelos pequeños y especializados, empaquetados como políticas RL de dependencia mínima (la librería declarada es `numpy`), integrables en simuladores y videojuegos mediante una API de estado/acción tipada. Se publica bajo licencia Apache 2.0, con soporte únicamente en coreano y con cero descargas y cero "me gusta" en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de RL; la model card no detalla la topología de red) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (la entrada es un estado estructurado JSON/JEV, no una secuencia de tokens) |
| Tipos de cuantizacion | no disponible (la librería declarada es `numpy`) |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (librería `numpy`; el repositorio no detalla los ficheros en la información disponible) |

## Arquitectura y entrenamiento

La información disponible no especifica la arquitectura de red de la política (número de capas, dimensiones, tipo de codificador del estado JEV ni presupuesto de parámetros). Los metadatos indican que el pipeline es `reinforcement-learning`, que la librería es `numpy` y que las etiquetas incluyen `ppo`, `deep-reinforcement-learning`, `gymnasium` y `jev-style`, lo que sitúa al modelo en la familia de políticas profundas entrenadas con Proximal Policy Optimization sobre un entorno compatible con Gymnasium. La model card enlaza además un cuaderno de Google Colab denominado `rl_decision_model_qwen_colab.ipynb`, lo que sugiere la existencia de una variante de entrenamiento apoyada en un modelo Qwen, aunque el modelo publicado no declara esa dependencia en sus metadatos.

El proceso de entrenamiento descrito tiene dos fases: primero una fase de aprendizaje supervisado en la que el modelo imita a un presidente basado en reglas, y después un ajuste con PPO en el que la señal de recompensa proviene de los valores de la empresa (beneficio, satisfacción del cliente y aversión al riesgo, todos ponderados a 1.0). La salida se serializa en el formato JEV (`typesafe/jev-1.13`), con preguntas tipadas (`type: choice`) y criterios de acción explícitos; en el ejemplo publicado para la decisión de reembolso, el modelo devuelve probabilidades de 0.9642 para "full", 0.0006 para "partial", 0.0042 para "deny" y 0.031 para "human", con una confianza de 0.9642 y la razón "강화학습 정책" ("política de aprendizaje por refuerzo"). No se documentan datos de entrenamiento (número de episodios, tokens ni composición del dataset), ni el uso de RLHF o DPO, ni innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Toma de decisiones discretas tipadas sobre un estado estructurado: elige entre alternativas (`full`, `partial`, `deny`, `human` en el ejemplo de reembolsos) y devuelve la distribución de probabilidad completa.
- Cálculo de confianza por decisión: expone `confidence` y un mapa `probabilities`, lo que permite umbralizar y derivar a un humano cuando la certeza es baja.
- Gestión empresarial simulada: personal, pedidos de inventario, marketing, atención al cliente, reembolsos y seguridad.
- Salida compatible con el formato JEV, consumible directamente por el simulador Connect Tycoon mediante `CompanyBrain.from_hub`.
- Integración como oposición o como jugador en el videojuego: `connect-tycoon play --brain hf:sunyoungKim/connectailab-rl-lco-v4-teacher`.
- Optimización multiobjetivo simultánea de beneficio, satisfacción y riesgo.
- No se documentan capacidades de generación de texto libre, razonamiento matemático general, código, visión, audio, tool calling ni uso de agentes multi-paso.

## Casos de uso

- Simulación de gestión empresarial en el juego Connect Tycoon: el modelo se sienta como "presidente" y opera la empresa durante 20 días laborables, decidiendo personal, inventario, marketing, atención al cliente y seguridad en cada turno.
- Línea base de referencia para investigación en RL: sirve como política preentrenada contra la que comparar nuevos algoritmos o arquitecturas en el mismo entorno Gymnasium.
- Evaluación de políticas de decisión multiobjetivo: permite estudiar cómo se comporta un agente cuando beneficio, satisfacción y riesgo tienen el mismo peso.
- Docencia y formación en IA: la model card está asociada a cursos gratuitos de RL y JEV de CONNECT AI LAB y al curso de RL de AI CITY BUILDERS, por lo que el modelo puede usarse como ejemplo didáctico de pipeline imitación + PPO.
- Investigación sobre el formato JEV: al responder en JEV con preguntas tipadas, es útil para probar protocolos de comunicación estructurada entre modelos y simuladores.
- Derivación a intervención humana: la probabilidad asociada a la opción `human` permite diseñar sistemas en los que el agente delega en una persona cuando el riesgo estimado supera un umbral, con un coste declarado de 0.8 unidades monetarias por caso.
- Comparación de versiones de política: con la variante `connectailab-rl-lco-v5-teacher` disponible, puede emplearse para estudiar la evolución del rendimiento entre iteraciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. La model card sí publica una evaluación propia sobre 40 meses no vistos en el simulador Connect Tycoon:

| Métrica (media de 40 meses no vistos) | Presidente basado en reglas | connect-ai-company-v4 |
|---|---|---|
| Beneficio mensual | 3,24 millones de won | 11,90 millones de won |
| Satisfacción del cliente | 79 % | 96 % |
| Incidentes de riesgo | 7,8 | 1,6 |
| Confirmaciones humanas superadas | 37,8 | 11,7 |
| Días sin existencias | 10,7 | 0,5 |

Configuración de empresa declarada para la evaluación: `{"warehouse": 250.0, "base_demand": 40.0, "unit_cost": 1.5, "order_scale": 1.0, "staff_bonus": 0, "wage": 0.0, "ad_power": 1.0, "fraud_tool": 0, "extra_cs": 0, "extra_refund": 0}`. No se documentan intervalos de confianza, número de semillas ni protocolo estadístico.

## Requisitos de hardware

- No se dispone de estimaciones de VRAM publicadas para este modelo.
- Dado que la librería declarada es `numpy` y el pipeline es de RL (no un transformer de gran tamaño), es razonable esperar inferencia en CPU, pero la información disponible no confirma tamaños ni requisitos, por lo que cualquier cifra sería especulativa.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: la vía documentada es el paquete `connect-tycoon` (`pip install "connect-tycoon[game]"`) y su API `ct.CompanyBrain.from_hub(...)`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, coherente con que no sea un modelo de lenguaje servido por esos motores.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos directamente comparables en la misma categoría (políticas RL para simulación de gestión empresarial en formato JEV). Las únicas referencias disponibles son internas al mismo proyecto:

| Modelo | Tipo | Parámetros | Contexto | Rendimiento declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| connectailab-rl-lco-v4-teacher | Política RL (PPO + imitación) | no disponible | no aplica (estado estructurado) | 11,90 M won de beneficio, 96 % satisfacción, 1,6 incidentes | Apache 2.0 | HuggingFace, 0 descargas, 0 likes |
| connectailab-rl-lco-v5-teacher | Política RL (PPO + imitación) | no disponible | no aplica | no disponible en la información consultada | Apache 2.0 | HuggingFace, 0 likes |
| Presidente basado en reglas (línea base del simulador) | Sistema experto determinista | no aplica | no aplica | 3,24 M won de beneficio, 79 % satisfacción, 7,8 incidentes | no aplica (componente del simulador) | Incluido en Connect Tycoon |

## Limitaciones y advertencias

- Modelo de propósito educativo y de simulación: la propia model card advierte de que es un "modelo educativo sobre un simulador de empresa sintético" y que no garantiza ni predice resultados de gestión reales.
- Dominio cerrado: la política está entrenada para el entorno Connect Tycoon; fuera de él, sus decisiones no tienen validez.
- Idioma: la model card y el ejemplo de interacción están íntegramente en coreano (ko); no se declara soporte de otros idiomas.
- Formato de salida rígido: depende del esquema JEV (`typesafe/jev-1.13`); cualquier cambio en el contrato de estado o de preguntas puede invalidar la salida.
- Sesgo respecto al "presidente basado en reglas": al haberse entrenado por imitación de esa línea base antes del PPO, puede heredar sesgos estructurales de sus reglas.
- Riesgo de alucinación: no se ha documentado evaluación del comportamiento fuera de distribución ni calibración de las probabilidades reportadas, que no deben interpretarse como garantías.
- Opacidad técnica: no se publican detalles de arquitectura, parámetros, datos de entrenamiento, semillas ni protocolo estadístico de la evaluación, lo que impide reproducir los resultados.
- Uso comercial: la licencia Apache 2.0 permite uso comercial, pero al tratarse de un modelo integrado en un simulador de terceros conviene revisar los términos del proyecto Connect Tycoon.
- Estado del proyecto: la model card indica que la conexión entre modelos ("Connect AI") está en fase de pruebas y que la participación oficial en la investigación conjunta o la autoría de artículos requiere verificación aparte.
- Madurez: cero descargas y cero "me gusta" en HuggingFace en el momento de la consulta, sin evidencia de uso en producción por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sunyoungKim/connectailab-rl-lco-v4-teacher
- Variante v5: https://huggingface.co/sunyoungKim/connectailab-rl-lco-v5-teacher
- Repositorio del simulador Connect Tycoon: https://github.com/wonseokjung/connect-tycoon
- Cuaderno de Colab (`rl_decision_model_qwen_colab.ipynb`): https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/rl_decision_model_qwen_colab.ipynb
- Canal de YouTube de CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de aprendizaje por refuerzo de AI CITY BUILDERS: https://www.aicitybuilders.com/robot
- Connect AI: https://www.ezerai.xyz
- Instagram de LCO_Official: https://www.instagram.com/the_lco_office/
- Blog de Naver de LCO_Official: https://blog.naver.com/mom_ai_growth
- Formato JEV referenciado en la model card (`typesafe/jev-1.13`): no disponible como enlace directo en la información consultada
