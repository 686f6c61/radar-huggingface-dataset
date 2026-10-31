# the-eschatos/connectailab-rl-shp-v2-teacher

## Resumen

connectailab-rl-shp-v2-teacher (también conocido como "AI 사장" o "CONNECT TYCOON") es un modelo de aprendizaje por refuerzo desarrollado por el usuario **the-eschatos** en el marco del proyecto CONNECT TYCOON y del laboratorio educativo CONNECT AI LAB. No se trata de un modelo de lenguaje, sino de una política de decisión entrenada con PPO para operar una empresa simulada durante un mes de negocio (20 días laborables), tomando decisiones de personal, inventario, marketing, atención al cliente, reembolsos y seguridad.

El modelo responde en formato JEV (`typesafe/jev-1.13`), un esquema estructurado de preguntas y respuestas que permite consultar la política con estados de negocio concretos y obtener decisiones con probabilidades por opción. Su entrenamiento sigue un esquema de dos fases: primero imita a un "jefe basado en reglas" mediante aprendizaje supervisado y después se refina con PPO usando recompensas derivadas de los valores de empresa configurados (beneficio, satisfacción del cliente y riesgo).

Su relevancia es principalmente educativa y de demostración: sirve como material didáctico para enseñar aprendizaje por refuerzo aplicado a toma de decisiones empresariales. No está diseñado para uso productivo real ni garantiza resultados de negocio. El modelo está etiquetado en coreano, es la librería numpy y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Politica de aprendizaje por refuerzo (no es un transformer ni un LLM); detalles no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no aplicable (modelo no generativo de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | coreano (etiquetas de estado y respuestas JEV) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (libreria numpy; carga via `connect_tycoon.CompanyBrain.from_hub`) |

## Arquitectura y entrenamiento

La model card no especifica la arquitectura de red concreta (numero de capas, tamaños de red neuronal, etc.), solo indica que es una politica de decision entrenada con PPO (Proximal Policy Optimization) sobre el entorno simulador CONNECT TYCOON, que usa Gymnasium. El flujo de entrenamiento descrito tiene dos etapas: una fase de aprendizaje supervisado en la que el modelo imita las decisiones de un agente basado en reglas ("jefe de reglas"), y una fase de ajuste por refuerzo con PPO en la que las recompensas se calculan a partir de los valores de empresa definidos en la configuración: beneficio 1.0, satisfaccion del cliente 1.0 y riesgo 1.0.

El entorno de simulación modela una empresa con parametros configurables, por ejemplo: almacen de 250 unidades, demanda base de 40, coste unitario de 1.5, potencia publicitaria 1.0, entre otros. Cada episodio cubre un mes de 20 dias laborables, y las decisiones afectan a metricas como beneficio mensual, satisfaccion, incidentes de riesgo, escalados a verificación humana y dias de desabastecimiento. No se ha publicado informacion sobre el numero de pasos de entrenamiento, ni hiperparametros de PPO.

## Capacidades

- Decision de asignacion de personal (dotacion de plantilla segun demanda simulada)
- Gestion de inventario y pedidos a almacen
- Decisiones de marketing y publicidad
- Gestion de atencion al cliente y solicitudes de reembolso (eleccion entre reembolso total, parcial, rechazo o escalado a verificacion humana)
- Decisiones de seguridad frente a fraude (usa un `fraud_score` del estado)
- Respuesta estructurada en formato JEV con distribucion de probabilidades por opcion y nivel de confianza
- Operacion multi-paso continua: gestiona la empresa dia a dia durante episodios de 20 dias laborables
- No genera texto libre: sus salidas se limitan a opciones y valores estructurados

## Casos de uso

- **Ensenanza de aprendizaje por refuerzo**: el proyecto ofrece notebooks de Colab para entrenar el modelo desde cero, ideal como ejercicio practico de PPO con un entorno Gymnasium de dificultad moderada.
- **Demostracion de politicas de decision con recompensas multi-objetivo**: permite experimentar con distintos pesos de empresa (beneficio, satisfaccion, riesgo) y observar como cambia la politica.
- **Comparacion de agentes frente a reglas fijas**: sirve de base para comparar una politica aprendida contra un agente heuristico en las mismas condiciones de simulacion.
- **Prototipado de escalado a verificacion humana**: el modelo decide cuando derivar casos (reembolsos, fraude) a supervision humana, un patron util para estudiar human-in-the-loop.
- **Material didactico en formacion de IA**: CONNECT AI LAB lo usa en sus cursos de refuerzo y IA local, con integracion directa en el juego `connect-tycoon play`.
- **Investigacion en formatos de interaccion estructurada**: el formato JEV de preguntas y respuestas puede servir de referencia para interfaces de decision interpretables con probabilidades explicitas.

## Benchmarks y rendimiento

La model card publica una comparativa de rendimiento medio sobre 40 meses de simulacion frente al agente basado en reglas:

| Metrica | Jefe de reglas | connectailab-rl-shp-v2-teacher |
|---|---|---|
| Beneficio mensual | 3,24 millones KRW | 3,01 millones KRW |
| Satisfaccion del cliente | 79 % | 82 % |
| Incidentes de riesgo | 7,8 | 7,4 |
| Escalados a verificacion humana | 37,8 | 38,9 |
| Dias de desabastecimiento | 10,7 | 11,3 |

No hay benchmarks estandar (MMLU, HumanEval, etc.), algo esperable al no tratarse de un modelo de lenguaje. El modelo mejora satisfaccion y reduce incidentes de riesgo, a costa de un beneficio mensual ligeramente inferior y mas escalados humanos.

## Requisitos de hardware

- Al tratarse de una politica entrenada con numpy, la inferencia no requiere GPU: se ejecuta en CPU convencional con requisitos minimos (no se han publicado cifras concretas de VRAM ni RAM).
- El entrenamiento puede realizarse en Google Colab mediante el notebook oficial publicado por el autor.
- Despliegue: carga directa desde Hugging Face con `connect_tycoon.CompanyBrain.from_hub("the-eschatos/connectailab-rl-shp-v2-teacher")`, o integracion en el juego con `pip install "connect-tycoon[game]"` y `connect-tycoon play --brain hf:the-eschatos/connectailab-rl-shp-v2-teacher`.
- Latencia y throughput: no disponibles, aunque al ser un modelo pequeño basado en numpy se espera respuesta en milisegundos por decision.

## Comparativa con modelos similares

| Modelo | Tipo | Entrenamiento | Licencia | Notas |
|---|---|---|---|---|
| connectailab-rl-shp-v2-teacher | Politica RL (PPO) sobre simulador propio | Supervisado + PPO | Apache 2.0 | Decision empresarial simulada, salida JEV |
| Jefe de reglas (baseline de CONNECT TYCOON) | Agente heuristico | No aprende | no disponible | Gana en beneficio (3,24 M KRW) pero pierde en satisfaccion y riesgo |
| Agentes PPO genericos de Gymnasium | Politica RL estandar | PPO | MIT (libreria) | Sin dominio empresarial ni formato JEV integrado |

No existen alternativas publicas directamente comparables con el mismo dominio y formato; la comparacion mas relevante es el baseline heuristico del propio proyecto.

## Limitaciones y advertencias

- Es un modelo educativo sobre un simulador sintetico: la propia model card advierte que no garantiza ni predice resultados de gestion empresarial reales.
- No genera texto libre ni entiende lenguaje natural: solo responde a consultas estructuradas JEV con estados predefinidos.
- Su rendimiento esta acotado al entorno CONNECT TYCOON con la configuracion de empresa indicada; no hay garantias de generalizacion a otras configuraciones o dominios.
- La politica muestra una fuerte tendencia a escalar a verificacion humana (38,9 casos de media frente a 37,8 del baseline), lo que en un entorno real implicaria costes operativos.
- No hay informacion publicada sobre sesgos del entrenamiento, robustez fuera de distribucion ni numero de episodios de entrenamiento.
- Etiquetado solo en coreano: los estados y criterios de decision usan terminologia coreana, lo que puede dificultar su uso a desarrolladores que no manejen el idioma.
- Metricas de descargas muy bajas (0 descargas en el momento de la ficha) y proyecto de autor individual: madurez y mantenimiento a largo plazo no garantizados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/the-eschatos/connectailab-rl-shp-v2-teacher
- Repositorio GitHub del proyecto CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Notebook de entrenamiento en Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/rl_decision_model_qwen_colab.ipynb
- Canal de YouTube de CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- Curso de IA por refuerzo de AI CITY BUILDERS: https://www.aicitybuilders.com/robot
- Web de AI CITY BUILDERS: https://www.aicitybuilders.com
- Connect AI (colaboracion C1): https://www.ezerai.xyz
