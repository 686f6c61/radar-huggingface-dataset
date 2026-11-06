# tazza11/connectailab-rl-simba-v4-teacher

## Resumen

`connectailab-rl-simba-v4-teacher` es un modelo de aprendizaje por refuerzo (RL) desarrollado por el usuario **tazza11** (CONNECT AI LAB) para la toma de decisiones empresariales dentro del simulador **CONNECT TYCOON**. No se trata de un modelo de lenguaje, sino de una política de RL entrenada con PPO que actúa como "cerebro directivo" (el autor lo denomina "corteza prefrontal") de una empresa virtual: gestiona personal, inventarios, marketing, atención al cliente, reembolsos y seguridad durante un mes de operaciones simuladas (20 días laborables).

El modelo se entrena en dos fases: primero aprende imitando a un "jefe basado en reglas" (aprendizaje supervisado) y después refina sus decisiones mediante PPO usando recompensas derivadas de los valores de la empresa (beneficio, satisfacción del cliente y riesgo). Sus respuestas se emiten en formato JEV (un esquema estructurado de preguntas y respuestas tipo `typesafe/jev-1.13`), con probabilidades y nivel de confianza por cada decisión.

Es relevante como ejemplo educativo de RL aplicado a decisiones de negocio multi-departamento, y porque el autor publica resultados comparativos frente al agente de reglas: beneficio mensual de 17,19 millones de wones frente a 7,08, satisfacción del 96 % frente al 71 %, y accidentes de riesgo de 1,9 frente a 11,5. La model card advierte expresamente que es un modelo educativo sobre un simulador sintético y que no garantiza ni predice resultados empresariales reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Politica de aprendizaje por refuerzo (no es un modelo de lenguaje); detalles de la red no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Coreano (ko), segun los metadatos del repositorio |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible; la libreria declarada es `numpy`, y la carga se realiza via `connect_tycoon.CompanyBrain.from_hub()` |

## Arquitectura y entrenamiento

El modelo es una politica de decision entrenada para el entorno `connect-tycoon` (compatible con Gymnasium, segun las etiquetas del repositorio). El procedimiento de entrenamiento descrito en la model card tiene dos etapas: una primera fase de aprendizaje supervisado en la que la politica imita las decisiones de un agente heuristico basado en reglas ("jefe de reglas"), y una segunda fase de ajuste mediante **PPO** (Proximal Policy Optimization), donde la señal de recompensa proviene de los valores de la empresa definidos en la configuracion: `{"beneficio": 1.0, "satisfaccion del cliente": 1.0, "riesgo": 1.0}`.

El entorno de simulacion define una empresa con parametros concretos: almacen de capacidad 250,0, demanda base 40,0, coste unitario 1,5, escala de pedidos 1,0, potencia publicitaria 1,0 y sin bonus de personal, salario, herramientas antifraude adicionales ni refuerzos extra de atencion al cliente o reembolsos. Las decisiones se estructuran mediante el formato JEV: el estado se presenta como un diccionario (departamento, motivo, nivel del cliente, importe, puntuacion de fraude) y la politica responde con una eleccion categorica, su distribucion de probabilidades y una confianza. No hay informacion disponible sobre el numero de pasos de entrenamiento, hiperparametros de PPO ni tamano de la red subyacente.

## Capacidades

- Decisiones categoricas en multiples departamentos de la empresa simulada: dotacion de personal, pedidos de inventario, marketing, atencion al cliente, reembolsos y seguridad.
- Clasificacion de solicitudes de reembolso en cuatro opciones: reembolso total, reembolso parcial, denegacion o escalado a revision humana (con coste de 0,8 miles de wones por caso).
- Deteccion implicita de fraude: utiliza la `fraud_score` del estado para equilibrar el coste del fraude contra la perdida de satisfaccion al rechazar clientes legitimos.
- Salida estructurada en formato JEV con probabilidades por opcion y nivel de confianza (por ejemplo, 0,9921 de confianza en una decision de reembolso total).
- Gestion multi-departamento de un mes completo de operaciones (20 dias laborables) en el simulador CONNECT TYCOON.
- Integracion directa como agente jugable del juego: `connect-tycoon play --brain hf:tazza11/connectailab-rl-simba-v4-teacher`.
- No es un modelo generativo de texto: no produce lenguaje libre, ni codigo, ni soporta tool calling, agentes conversacionales ni capacidades multimodales.

## Casos de uso

- **Ensenanza de aprendizaje por refuerzo**: el modelo sirve como caso de estudio completo (imitacion + PPO) para cursos; el autor lo emplea en su formacion de AI CITY BUILDERS y ofrece un notebook de Colab para reproducir el entrenamiento.
- **Investigacion en decision empresarial simulada**: permite experimentar con politicas de asignacion de recursos, inventarios y atencion al cliente en un entorno determinista y reproducible, sin riesgo real.
- **Comparacion de agentes de decision**: la model card incluye metricas frente al agente de reglas (beneficio, satisfaccion, accidentes, escalados a humanos, dias de desabastecimiento), util como baseline para evaluar nuevas politicas.
- **Prototipado de sistemas de escalado a humanos**: la politica decide cuando derivar casos a revision humana (14,8 casos de media frente a 69,5 del agente de reglas), un patron aplicable a diseno de sistemas de triaje.
- **Desarrollo de juegos de gestion con IA**: puede integrarse como oponente o gestor autonomo en CONNECT TYCOON mediante el comando de juego, o en simuladores similares que adopten el formato JEV.
- **Demostracion del formato JEV**: ejemplo practico de como estructurar preguntas y respuestas de decision con probabilidades y confianza para sistemas de decision interpretables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card si incluye metricas propias del simulador para 40 meses promediados desde cero:

| Metrica | Jefe de reglas | jay-company (este modelo) |
|---|---|---|
| Beneficio mensual | 7,08 M KRW | 17,19 M KRW |
| Satisfaccion del cliente | 71 % | 96 % |
| Accidentes de riesgo | 11,5 | 1,9 |
| Casos que exceden revision humana | 69,5 | 14,8 |
| Dias de desabastecimiento | 9,1 | 0,4 |

Estas cifras corresponden exclusivamente al simulador CONNECT TYCOON con la configuracion indicada y no son comparables con benchmarks de modelos de lenguaje.

## Requisitos de hardware

- No se especifica la VRAM necesaria; al tratarse de una politica de RL implementada sobre `numpy`, los requisitos son presumiblemente muy bajos, pero no hay datos publicados.
- No se mencionan GPUs recomendadas ni compatibilidad concreta con tarjetas de consumo.
- Despliegue documentado a traves de la libreria `connect-tycoon` (instalable con `pip install "connect-tycoon[game]"`), tanto en Python como agente del juego; existe un notebook de Google Colab para el entrenamiento.
- No se dispone de soporte documentado para vLLM, llama.cpp, Ollama o TGI, dado que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No hay modelos directamente comparables publicados en la misma familia, salvo el agente heuristico de referencia del propio simulador:

| Modelo | Tipo | Beneficio mensual (simulador) | Satisfaccion | Licencia |
|---|---|---|---|---|
| tazza11/connectailab-rl-simba-v4-teacher | Politica RL (PPO + imitacion) | 17,19 M KRW | 96 % | Apache-2.0 |
| Jefe de reglas (baseline del simulador) | Agente heuristico | 7,08 M KRW | 71 % | no disponible |

No se conocen politicas alternativas de terceros para CONNECT TYCOON; la comparacion con LLM de decision no procede por tratarse de arquitecturas y tareas distintas.

## Limitaciones y advertencias

- **Alcance estrictamente simulado**: la model card advierte que es un modelo educativo sobre un simulador de empresa sintetico y que no garantiza ni predice desempeno empresarial real. No debe usarse para decisiones de negocio reales.
- **Sin capacidad generativa**: no es un LLM; no entiende lenguaje libre ni produce texto, por lo que no es aplicable a chat, resumen, codigo ni RAG.
- **Dominio estrecho**: sus decisiones solo tienen sentido dentro del espacio de estados y acciones de CONNECT TYCOON con la configuracion documentada; fuera de ese entorno su comportamiento no esta definido.
- **Metricas no auditadas**: los resultados comparativos provienen unicamente de la model card del autor; no hay evaluacion independiente.
- **Idioma**: los metadatos y ejemplos estan en coreano; la documentacion en castellano o ingles no esta disponible.
- **Trazabilidad**: no se publica informacion sobre tamano del modelo, datos de entrenamiento detallados ni hiperparametros, lo que dificulta la reproducibilidad completa.
- **Licencia**: Apache-2.0 permite uso comercial, pero al ser un modelo de demostracion educativa, su valor en produccion es limitado.

## Enlaces

- Hugging Face: https://huggingface.co/tazza11/connectailab-rl-simba-v4-teacher
- Repositorio GitHub de CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Notebook de entrenamiento en Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/rl_decision_model_qwen_colab.ipynb
- Canal de YouTube de CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- Curso de IA por refuerzo de AI CITY BUILDERS: https://www.aicitybuilders.com/robot
- Web de AI CITY BUILDERS: https://www.aicitybuilders.com
- Connect AI (proyecto C1): https://www.ezerai.xyz
