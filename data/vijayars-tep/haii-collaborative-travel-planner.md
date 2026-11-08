# vijayars-tep/HAII-collaborative-travel-planner

## Resumen

HAII-collaborative-travel-planner es un agente de planificacion de viajes desarrollado por el usuario vijayars-tep como entrega de la asignatura HAII (Assignment 2). No se trata de un modelo de lenguaje con pesos publicados, sino de un repositorio que contiene el codigo Python de un agente personalizado y su interfaz Gradio. El agente orquesta llamadas a AWS Bedrock usando el modelo DeepSeek R1 (`bedrock/us.deepseek.r1-v1:0`) como motor de inferencia, combinado con acciones estructuradas de busqueda y navegacion web mediante el framework smolagents.

El proposito del proyecto es construir un planificador de viajes conversacional que mantenga un estado explicito de la conversacion: hechos confirmados respaldados por citas textuales, preferencias tentativas del usuario, y restricciones de viaje editables. El agente realiza comprobaciones de fuentes y precios estructurados antes de presentar recomendaciones, y no ejecuta reservas ni programa recordatorios.

Es relevante como ejemplo de patron de agente con verificacion de citas y separacion entre hechos confirmados y suposiciones, aunque su alcance es academico: no publica pesos, no ofrece endpoint de inferencia alojado y depende de credenciales AWS del ejecutor. La fecha de creacion del repositorio es 2026-11-08.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Agente Python sobre smolagents con LLM remoto (AWS Bedrock DeepSeek R1) |
| Parametros totales | no disponible (no se publican pesos) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (depende del modelo Bedrock subyacente) |
| Tipos de cuantizacion | no disponible (inferencia gestionada por Bedrock) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no aplica (repositorio de codigo Python; sin safetensors ni GGUF) |

## Arquitectura y entrenamiento

El repositorio no entrena ningun modelo. La arquitectura es la de un agente construido con smolagents que envuelve un `LiteLLMModel` apuntando a `bedrock/us.deepseek.r1-v1:0`. El agente se carga como modulo Python (`collaborative_agent.py`) y no como `CodeAgent` serializado, por lo que no es compatible con `CodeAgent.from_hub`. La clase principal es `CollaborativePlanner`, que recibe el modelo y expone un metodo `respond(...)`.

El diseno del agente incorpora varios mecanismos destacables: acciones estructuradas de busqueda y descarga de paginas web, un registro de hechos confirmados respaldados por citas textuales (quote-backed confirmed facts), un registro separado de preferencias tentativas, restricciones de viaje editables por el usuario, y comprobaciones de fuente y de precios estructurados. La validacion de regresion incluye trece comprobaciones deterministas con un modelo guionizado y herramientas de investigacion simuladas (sin llamadas a Bedrock), y cuatro comprobaciones finales de revision centradas en que citas antiguas no reviertan correcciones, en que la prosa de presupuesto no contradiga los rangos verificados, y en la retencion de enlaces conocidos cuando falla la validacion de citas.

No se dispone de informacion sobre volumen de datos de entrenamiento, composicion del dataset ni tecnicas de RLHF/DPO, ya que el proyecto no entrena modelos propios.

## Capacidades

- Planificacion de viajes conversacional multi-turno con estado explicito de restricciones (destino, presupuesto, numero de viajeros, duracion).
- Busqueda web estructurada y descarga de paginas para obtener informacion de fuentes.
- Extraccion de hechos confirmados respaldados por citas textuales del contenido recuperado.
- Distincion entre hechos confirmados y preferencias tentativas del usuario.
- Comprobacion de precios estructurados y de fuentes antes de presentar recomendaciones.
- Edicion de restricciones de viaje por parte del usuario durante la conversacion.
- Interfaz Gradio local en el puerto 7860.
- Soporte de tool calling a traves de smolagents y LiteLLM.
- No realiza reservas de viajes ni programa recordatorios (limitacion explicita del autor).

## Casos de uso

- Asistente de planificacion de viajes con verificacion de fuentes: el agente recupera paginas web, extrae citas textuales y solo presenta como confirmados los datos que cuentan con respaldo citado, lo que reduce afirmaciones no verificadas sobre precios o disponibilidad.
- Prototipo academico de agentes con estado: util como referencia para implementar separacion entre hechos confirmados y preferencias tentativas en un agente conversacional.
- Demostracion de orquestacion LLM + herramientas: sirve para evaluar el patron de smolagents con acciones estructuradas de busqueda y navegacion en un caso de dominio concreto.
- Base para experimentos de validacion de citas: el codigo incluye comprobaciones deterministas que pueden reutilizarse para estudiar como evitar que citas obsoletas reviertan correcciones del usuario.
- Entorno de pruebas de interfaz Gradio: el repositorio incluye la UI y permite ejecutar el agente localmente para evaluar flujos conversacionales de planificacion.
- Referencia para integracion con AWS Bedrock: muestra como configurar `LiteLLMModel` con `bedrock/us.deepseek.r1-v1:0`, gestion de region y credenciales temporales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor menciona una evaluacion cualitativa iterativa en el notebook de la asignatura, no un estudio de fiabilidad sobre una build congelada, y no aporta metricas cuantitativas.

## Requisitos de hardware

- No se requiere GPU local: la inferencia se delega en AWS Bedrock, por lo que el coste computacional recae en la cuenta AWS del ejecutor.
- Requiere Python 3.12 y credenciales AWS con acceso al modelo `bedrock/us.deepseek.r1-v1:0` en la region configurada (por defecto `us-east-1`, ajustable con `AWS_REGION_NAME`).
- Las credenciales temporales requieren tambien `AWS_SESSION_TOKEN`.
- Despliegue local mediante `python app.py` con interfaz Gradio en el puerto 7860.
- Dependencias instalables con `pip install -r requirements.txt`; el cliente de descarga es `huggingface_hub`.
- Latencia y throughput: no disponibles; dependen de la cuota y region de Bedrock.
- No cabe plantear despliegue con vLLM, llama.cpp u Ollama porque no se publican pesos.

## Comparativa con modelos similares

| Proyecto | Tipo | Modelo subyacente | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HAII-collaborative-travel-planner (vijayars-tep) | Agente Python + Gradio | AWS Bedrock DeepSeek R1 | no disponible | no disponible | Repositorio HF, requiere credenciales AWS |
| haii_collaborative_travel_assistant (ShreeyaGK) | Space Gradio estatico | no disponible | no disponible | no disponible | Hugging Face Spaces |
| AI-Based Multi-Agent Travel Planning System (Zenodo) | Sistema multi-agente | no disponible | no disponible | no disponible | Publicacion en Zenodo |

No se dispone de datos suficientes para comparar parametros, rendimiento ni contexto con alternativas equivalentes.

## Limitaciones y advertencias

- El repositorio no contiene pesos de modelo ni endpoint de inferencia alojado; es codigo de agente que depende de la cuenta AWS del ejecutor.
- No se especifica licencia, lo que impide determinar si el uso comercial esta permitido.
- El autor reconoce fallos residuales: prosa libre que contradice la tarjeta de presupuesto, enlaces de fuente ausentes, consejos con fechas pasadas, ofertas de recordatorios no soportadas y errores ocasionales de JSON o de extraccion.
- La coincidencia de citas no garantiza implicacion factual (entailment); las tarifas futuras y la accesibilidad no estan garantizadas.
- La evaluacion cualitativa fue iterativa y no un estudio de fiabilidad sobre una build congelada; el repositorio no prueba quien opero las pruebas originales.
- El agente no realiza reservas ni programa recordatorios.
- Riesgo de alucinacion inherente al LLM subyacente (DeepSeek R1) en afirmaciones no cubiertas por citas verificadas.
- Sesgos e idiomas soportados: no disponibles.
- El uso en produccion exige gestion segura de credenciales AWS fuera del repositorio; nunca deben incluirse en el codigo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/vijayars-tep/HAII-collaborative-travel-planner
- Space relacionado (ShreeyaGK): https://huggingface.co/spaces/ShreeyaGK/haii_collaborative_travel_assistant
- Publicacion Zenodo sobre planificacion multi-agente de viajes: https://zenodo.org/records/19597623
