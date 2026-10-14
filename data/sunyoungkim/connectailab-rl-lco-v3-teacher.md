# sunyoungKim/connectailab-rl-lco-v3-teacher

## Resumen

connectailab-rl-lco-v3-teacher es un modelo de política de aprendizaje por refuerzo desarrollado por sunyoungKim (LCO_Official, 김선영) en el marco del laboratorio CONNECT AI LAB x AI CITY BUILDERS. No es un modelo de lenguaje: la model card lo describe como un "córtex prefrontal" (전전두엽) que dirige una empresa simulada dentro del entorno CONNECT TYCOON a lo largo de un mes de 20 días laborables, decidiendo sobre colocación de personal, pedidos de inventario, marketing, atención al cliente, reembolsos y seguridad.

El modelo recibe un estado estructurado y devuelve sus decisiones en el formato JEV (`typesafe/jev-1.13`), incluyendo la opción elegida, la probabilidad asignada a cada alternativa y un nivel de confianza. Se entrenó en dos fases: imitación supervisada de un "presidente" basado en reglas y refinamiento posterior con PPO usando como recompensa la función de valor de la empresa (beneficio, satisfacción del cliente, riesgo).

Es relevante como ejemplo acotado de RL aplicado a toma de decisiones empresariales y de un pipeline imitación + PPO, y porque el autor publica el simulador, el notebook de entrenamiento y una CLI para enfrentar el modelo a la partida. El repositorio tiene 0 descargas y 0 likes, por lo que carece de validación externa; la licencia es Apache 2.0 y el idioma declarado es el coreano.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política de aprendizaje por refuerzo (PPO) sobre un entorno Gymnasium; la model card no detalla la topología de la red. El notebook asociado se denomina `rl_decision_model_qwen_colab.ipynb` |
| Parámetros totales | no disponible |
| Longitud de contexto | no disponible (modelo de decisión, no de lenguaje; la entrada es el estado del simulador en formato JEV) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | coreano (ko) |
| Licencia | apache-2.0 |
| Formato de pesos | numpy (library_name: numpy); no se especifica el fichero exacto |
| Tarea (pipeline) | reinforcement-learning |
| Formato de salida | JEV (typesafe/jev-1.13): opción elegida, probabilidades por opción y confianza |
| Fases de entrenamiento | Imitación supervisada del presidente de reglas + PPO con recompensa de valor de empresa |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La información disponible no especifica la topología de red ni el número de parámetros. La model card describe el procedimiento de entrenamiento en dos etapas: primero el modelo aprende de un "presidente de reglas" mediante aprendizaje supervisado (imitación), y después ajusta sus decisiones con PPO utilizando como señal de recompensa la función de valor de la empresa, definida explícitamente como `{"이익": 1.0, "고객 만족": 1.0, "위험": 1.0}` (beneficio, satisfacción del cliente y riesgo, todos con peso 1.0). El resultado se serializa mediante la librería numpy.

La empresa simulada tiene una configuración concreta declarada en la model card: `{"warehouse": 250.0, "base_demand": 40.0, "unit_cost": 1.5, "order_scale": 1.0, "staff_bonus": 0, "wage": 0.0, "ad_power": 1.0, "fraud_tool": 0, "extra_cs": 0, "extra_refund": 0}`. La interacción se realiza a través de peticiones JEV con un campo `state` (por ejemplo `department`, `reason`, `tier`, `amount`, `fraud_score`) y un campo `questions` que define el tipo de decisión, las instrucciones y los criterios. No se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal, SSM) ni el volumen o composición del dataset de entrenamiento.

## Capacidades

- Toma de decisiones de tipo `choice` entre las alternativas definidas por el solicitante: en el ejemplo de la model card elige entre `full`, `partial`, `deny` y `human` para una solicitud de reembolso.
- Devuelve una distribución de probabilidad sobre cada opción junto con la opción seleccionada, el valor de confianza y un campo `reason` (en coreano, por ejemplo "강화학습 정책").
- Procesa estados estructurados en formato JEV con campos como departamento, motivo, nivel de cliente, importe y puntuación de fraude.
- Ámbito funcional limitado a las operaciones de la empresa simulada: asignación de personal, pedidos de inventario, marketing, atención al cliente, reembolsos y seguridad.
- Integración como cerebro del simulador mediante `connect_tycoon.CompanyBrain.from_hub("sunyoungKim/connectailab-rl-lco-v3-teacher")` o mediante la CLI `connect-tycoon play --brain hf:sunyoungKim/connectailab-rl-lco-v3-teacher`.
- No hay evidencia en la información disponible de soporte de tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni generación de texto libre.

## Casos de uso

- Simulación de gestión empresarial en CONNECT TYCOON: el modelo se carga como cerebro del juego con `connect-tycoon play --brain hf:sunyoungKim/connectailab-rl-lco-v3-teacher` y opera la empresa durante 20 días laborables tomando las decisiones de cada departamento.
- Docencia en cursos de refuerzo profundo: el autor vincula el modelo a sus materiales formativos en YouTube (CONNECT AI LAB) y al curso de RL de AI CITY BUILDERS, de modo que sirve como caso práctico de política entrenada con imitación + PPO.
- Investigación en pipelines imitación + PPO: el notebook público `rl_decision_model_qwen_colab.ipynb` permite reproducir o modificar el entrenamiento y comparar la contribución de cada fase.
- Generación de datos de decisión etiquetados: las respuestas JEV incluyen probabilidades por opción, por lo que pueden usarse para construir conjuntos de estados y distribuciones de acción con los que evaluar o destilar otras políticas.
- Evaluación comparativa de políticas: la model card publica medias a 40 meses frente al presidente de reglas, lo que permite usar ambos como baselines en experimentos de decisión bajo riesgo.
- Estudio de decisiones sensibles al fraude: el estado de ejemplo incorpora `fraud_score` (0.3146) y permite analizar cómo la política pondera el coste del reembolso frente a la pérdida de satisfacción del cliente.
- Integración en scripts de automatización de negocio simulado: vía `CompanyBrain.from_hub` en Python, el modelo puede invocarse como servicio de decisión dentro de pipelines de experimentación con distintas configuraciones de empresa.

## Benchmarks y rendimiento

La model card publica una comparación propia entre el presidente de reglas y el modelo `connect-ai-company-v3`, medida como media sobre 40 meses de simulación. No son resultados de benchmarks independientes ni de terceros.

| Métrica (media de 40 meses) | Presidente de reglas | connect-ai-company-v3 |
|---|---|---|
| Beneficio mensual | 3,24 millones de wones | 11,89 millones de wones |
| Satisfacción del cliente | 79 % | 96 % |
| Incidentes de riesgo | 7,8 | 1,4 |
| Confirmaciones humanas superadas | 37,8 | 13,7 |
| Días de rotura de stock | 10,7 | 0,4 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- No se publican requisitos de VRAM ni de GPU en la model card.
- La librería declarada es numpy (`library_name: numpy`), lo que indica que la inferencia se ejecuta sobre arrays de numpy y no requiere GPU.
- No se documentan opciones de despliegue tipo vLLM, llama.cpp, Ollama o TGI. El despliegue previsto es la librería `connect-tycoon` (`pip install "connect-tycoon[game]"`) o la API `CompanyBrain.from_hub`.
- Latencia y throughput: no disponible.
- Almacenamiento y memoria: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| connectailab-rl-lco-v3-teacher (este modelo) | Política RL (PPO) para CONNECT TYCOON | no disponible | no aplica | 11,89 M wones/mes y 96 % de satisfacción (media de 40 meses, evaluación del autor) | apache-2.0 | HuggingFace, 0 descargas |
| sunyoungKim/connectailab-rl-lco-v5-teacher | Política RL del mismo autor, versión posterior | no disponible | no aplica | no disponible | apache-2.0 | HuggingFace |
| Presidente de reglas (baseline de CONNECT TYCOON) | Sistema basado en reglas, no aprendido | no aplica | no aplica | 3,24 M wones/mes y 79 % de satisfacción (media de 40 meses) | no disponible | Incluido en el simulador |

No se han identificado en la información disponible modelos públicos comparables de terceros para esta categoría concreta (políticas RL sobre simuladores de gestión empresarial).

## Limitaciones y advertencias

- Ámbito restringido: el modelo está entrenado para el simulador sintético CONNECT TYCOON y su configuración concreta; la propia model card advierte de que no garantiza ni predice resultados de gestión reales y lo califica de modelo educativo.
- La evaluación publicada la realiza el propio autor, sobre 40 meses de simulación y sin protocolo de evaluación independiente.
- Idiomas: el modelo está declarado únicamente para coreano; los campos estructurados y las claves JEV están en inglés, pero no se documenta comportamiento en otros idiomas.
- Riesgo de decisión fuera de distribución: al ser una política entrenada sobre un entorno concreto, es esperable un comportamiento no validado ante estados, departamentos o criterios distintos de los del simulador. No se documentan pruebas de calibración de las probabilidades devueltas.
- Sesgos: no se documenta ningún análisis de sesgos. Al optimizar beneficio, satisfacción y riesgo con pesos iguales, la política puede priorizar objetivos de negocio frente a consideraciones no incluidas en la función de recompensa.
- Licencia Apache 2.0: permite uso comercial, pero el aviso de la model card sobre su carácter educativo y la ausencia de garantías de rendimiento siguen aplicando.
- Trazabilidad: el repositorio tiene 0 descargas y 0 likes, y no se han publicado datos de entrenamiento, número de parámetros ni arquitectura, lo que dificulta la reproducibilidad.
- Uso seguro en producción: no se documentan salvaguardas, límites de tasa, filtros ni mecanismos de supervisión; el propio modelo incorpora la opción `human` (confirmación humana) como una acción más, lo que indica dependencia de supervisión externa cuando la política la selecciona.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sunyoungKim/connectailab-rl-lco-v3-teacher
- Versión posterior del mismo autor: https://huggingface.co/sunyoungKim/connectailab-rl-lco-v5-teacher
- Listado de modelos del autor: https://huggingface.co/sunyoungKim/models
- Simulador CONNECT TYCOON (GitHub): https://github.com/wonseokjung/connect-tycoon
- Notebook de entrenamiento en Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/rl_decision_model_qwen_colab.ipynb
- CONNECT AI LAB (YouTube): https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS (curso de RL): https://www.aicitybuilders.com/robot
- Connect AI: https://www.ezerai.xyz
- Instagram de LCO_Official: https://www.instagram.com/the_lco_office/
- Blog de Naver de LCO_Official: https://blog.naver.com/mom_ai_growth
