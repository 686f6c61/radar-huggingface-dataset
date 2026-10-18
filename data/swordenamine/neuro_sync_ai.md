# swordenamine/neuro_sync_ai

## Resumen

`neuro_sync_ai` (identificador `swordenamine/neuro_sync_ai`) es un artefacto publicado en HuggingFace por el autor `swordenamine` que se presenta, según su propia model card, como un «motor de predicción de intención del desarrollador». No es un modelo de lenguaje: la propuesta consiste en capturar señales de microcomportamiento durante la escritura de código (pausas antes de teclear un token, secuencias de borrado y reescritura, ritmo de pulsaciones, movimiento del cursor) y construir con ellas un perfil conductual persistente por desarrollador, a partir del cual un modelo basado en LSTM predice el estado de intención y genera sugerencias estructurales.

El planteamiento se aleja del autocompletado por predicción del siguiente token: el sistema clasifica el estado del desarrollador en una máquina de estados (`EXPLORING`, `DESIGNING`, `IMPLEMENTING`, `DEBUGGING`, `REFACTORING`) y decide cuándo intervenir y cuándo mantenerse en silencio. La model card describe además una arquitectura de paquete Python con módulos de captura de tecleo, análisis de patrones, estimación de carga cognitiva, API REST, puente WebSocket y un ejemplo de extensión para VS Code.

La relevancia potencial está en el cruce de dinámica de tecleo, teoría de la carga cognitiva y síntesis de programas, un ámbito poco explorado en herramientas para desarrolladores. Sin embargo, el repositorio no aporta parámetros, contexto, datos de entrenamiento ni evaluaciones reproducibles, declara estado de «prototipo de investigación», registra 0 descargas y 0 «likes», y las fechas de creación y actualización son incoherentes entre sí, por lo que cualquier valoración de rendimiento es hoy imposible de verificar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No es un transformer ni un modelo generativo: la model card describe un motor de predicción de intención con un modelo LSTM por desarrollador (`intent_model.py`), un codificador de secuencias de tecleo (`sequence_encoder.py`) y una máquina de estados de intención |
| Parámetros totales | No disponible |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no se documenta ventana de observación ni de código; el ejemplo de la API menciona observar pulsaciones durante 30 segundos antes de predecir) |
| Tipos de cuantización | No disponible (no se documentan pesos, cuantizaciones ni formatos de exportación) |
| Idiomas soportados | No disponible en los metadatos de HuggingFace; la model card está redactada en inglés y no declara cobertura lingüística |
| Licencia | La model card indica MIT (Copyright 2026, autor citado como `swordenkisk`); los metadatos de HuggingFace indican «no disponible». Discrepancia sin resolver |
| Formato de pesos | No disponible; se menciona un perfil de desarrollador persistente con extensión `.nsp` (`~/.neuro/my_profile.nsp`), sin especificar serialización ni cifrado concreto |
| Autor | `swordenamine` (la model card atribuye la autoría a `swordenkisk`) |
| Pipeline declarado | No disponible |
| Estado declarado | Prototipo de investigación, versión 1.0.0 |
| Descargas / likes | 0 / 0 |
| Fecha de creación (metadatos) | 2026-10-17 |
| Fecha de actualización (metadatos) | 2026-03-06 (anterior a la de creación) |

## Arquitectura y entrenamiento

La documentación disponible no describe una red neuronal concreta con número de capas, dimensión oculta ni volumen de datos. Lo que se explicita es un pipeline de cuatro componentes: captura de señales de tecleo a resolución de milisegundos (`keystroke_collector.py`), extracción de micropatrones (`pattern_analyzer.py`), un modelo de intención por desarrollador basado en LSTM (`intent_model.py`) y un estimador de carga cognitiva en tiempo real (`cognitive_load.py`). Sobre esa base se añaden una máquina de estados de intención, un motor de sugerencias estructurales y una capa de perfilado persistente (`developer_profile.py`) que actúa como huella conductual del usuario.

No se indican tokens de entrenamiento, composición del dataset, ni si hubo ajuste por RLHF o DPO; tampoco se detalla el mecanismo de inferencia (si el LSTM opera sobre secuencias de eventos de teclado, sobre representaciones del código o sobre una combinación). La model card sitúa el trabajo en tres dominios de investigación —dinámica de tecleo, teoría de la carga cognitiva y síntesis de programas— y reclama como contribución original la combinación de los tres en un motor adaptativo por desarrollador en tiempo real. Esa afirmación de novedad no va acompañada de publicación, referencia bibliográfica ni evaluación, por lo que debe tratarse como declaración del autor y no como resultado contrastado.

## Capacidades

- Clasificación del estado de intención del desarrollador en cinco categorías (`EXPLORING`, `DESIGNING`, `IMPLEMENTING`, `DEBUGGING`, `REFACTORING`), con una confianza asociada devuelta por la API (`intent.confidence`, con valor de ejemplo 0,87 en la documentación).
- Construcción de un perfil conductual persistente y reutilizable entre sesiones, almacenado localmente y descrito como cifrado en el dispositivo.
- Detección de confusión a partir de patrones de borrado repetido y de ráfagas cortas de escritura, con sugerencia de enfoque alternativo.
- Sugerencia de nombres de funciones o símbolos a partir del contexto circundante y del historial de patrones del desarrollador.
- Abstención de intervención durante el estado de «flow», es decir, supresión de sugerencias cuando el ritmo de tecleo indica ejecución fluida de un plan.
- Detección de intención de navegación cuando el desarrollador cambia de fichero rápidamente, con apertura proactiva de ficheros relacionados.
- Oferta de andamiaje estructural o diagramas cuando el ritmo se ralentiza en tareas de diseño.
- Estimación de carga cognitiva a nivel de sesión.
- Exposición de las capacidades mediante CLI (`neuro_cli.py`), servidor REST (`api/server.py`) y puente WebSocket para integración con el editor (`api/websocket_bridge.py`).
- No se documentan capacidades de generación de texto, código, matemáticas, visión, audio, tool calling ni razonamiento multilingüe.

## Casos de uso

- Detección temprana de bloqueo en depuración: el motor identifica secuencias de borrado repetido y ráfagas cortas como estado `DEBUGGING` con confusión elevada, y ofrece un enfoque alternativo en lugar de completar la línea; adecuado porque la señal de conflicto se mide sobre el comportamiento y no sobre el texto escrito.
- Sugerencia de nombres de API durante el diseño: ante pausas largas antes de teclear un identificador, el sistema propone nombres coherentes con los símbolos ya presentes en el fichero y con el historial del desarrollador, reduciendo iteraciones de renombrado posteriores.
- Supresión de interrupciones en estado de flujo: en estado `IMPLEMENTING` con ritmo alto y sin borrados, el motor mantiene silencio, lo que evita el coste de atención típico de los asistentes que completan en cada pulsación.
- Andamiaje estructural en tareas de arquitectura: cuando el desarrollador escribe despacio con pausas largas sobre un fichero nuevo, el motor puede ofrecer un esqueleto de módulo o un diagrama en lugar de tokens sueltos.
- Onboarding y análisis de fricción en equipos: con los datos de carga cognitiva por sesión descritos (pendiente en la hoja de ruta hasta la v2.1, «Enterprise API»), un equipo podría localizar módulos o APIs que generan más confusión recurrente; requiere consentimiento explícito y anonimización, no implementada en la versión documentada.
- Navegación asistida en bases de código grandes: la detección de cambios rápidos de fichero permite abrir ficheros relacionados antes de que el desarrollador los busque, útil en repositorios con muchas capas.
- Investigación en HCI y biofeedback de programación: el paquete sirve como base para experimentos reproducibles sobre dinámica de tecleo y carga cognitiva, ya que expone captura, perfilado y predicción como módulos separados.
- Accesibilidad: el perfilado de ritmo y pausas puede adaptar el umbral de intervención a desarrolladores con fatiga o dificultades motoras, siempre que se reentrene el modelo por usuario y no se apliquen umbrales globales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica, ni tampoco evaluación específica de la tarea declarada (precisión de clasificación de intención, latencia de predicción o tasa de aceptación de sugerencias). El único valor numérico presente es un ejemplo ilustrativo de la API (`intent.confidence = 0.87`), que no constituye una medición.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; no se declara número de parámetros ni tamaño de los pesos del modelo LSTM.
- GPU recomendadas: no disponibles; la arquitectura descrita (captura de eventos de teclado y un LSTM pequeño, con procesamiento declarado como local y por defecto en el dispositivo) es compatible con ejecución en CPU, pero esto es una inferencia a partir de la descripción, no un requisito documentado ni medido.
- Ejecución en GPU de consumo: no verificable; no hay datos de consumo de memoria ni de latencia que permitan afirmar que quepa en una RTX 4090 u otra tarjeta concreta.
- Opciones de despliegue documentadas: instalación vía `pip install neuro-sync-ai`, inicialización con `neuro init`, sesión con `neuro session --editor vscode`, servidor REST propio (`api/server.py`) y puente WebSocket para el editor. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI, coherente con el hecho de no ser un modelo de lenguaje con pesos publicados.
- Latencia y throughput: no disponibles; la documentación sugiere una ventana de observación de unos 30 segundos antes de la primera predicción, sin cifras de tiempo de inferencia.
- Almacenamiento: perfil conductual persistente en `~/.neuro/my_profile.nsp`; el tamaño del fichero y el esquema de cifrado no se detallan.

## Comparativa con modelos similares

No hay modelos estrictamente comparables en la información disponible: la propuesta no es un modelo de lenguaje, por lo que la comparación con asistentes de código se hace a nivel de categoría funcional, no de parámetros ni de benchmarks. Los datos de las alternativas que figuran a continuación no provienen de la documentación de este repositorio y se marcan como no disponibles cuando no hay cifra verificable.

| Sistema | Categoría | Entrada que consume | Parámetros | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| `neuro_sync_ai` | Predicción de intención por biometría de tecleo | Eventos de teclado, cursor y sesión | No disponible | No disponible | No disponible | MIT según model card; metadatos HF sin licencia | Repositorio HF con 0 descargas, prototipo |
| GitHub Copilot | Autocompletado y chat sobre código | Texto del editor y contexto del repositorio | No disponible | No disponible | No disponible en esta información | Propietaria, suscripción | Comercial |
| Tabnine | Autocompletado sobre código | Texto del editor | No disponible | No disponible | No disponible en esta información | Propietaria, con opciones locales | Comercial |
| Herramientas académicas de keystroke dynamics | Biometría conductual (autenticación, no intención) | Timing de pulsaciones | No disponible | No aplica | No disponible en esta información | Variable, habitualmente académica | Publicaciones y prototipos |

La diferencia relevante no es de escala sino de señal de entrada: los asistentes de la tabla trabajan sobre el texto del código, mientras que este artefacto declara trabajar sobre el comportamiento de escritura. Esa distinción es también su principal riesgo de adopción, porque exige instrumentar el editor a nivel de pulsaciones.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay métricas de precisión de clasificación de intención, de latencia ni de tasa de aceptación, por lo que no es posible comparar su utilidad con la de un autocompletado convencional.
- Afirmaciones no verificables: la model card se presenta como «el primer sistema» y sostiene que la combinación de dominios «nunca se ha hecho antes», sin referencia bibliográfica ni revisión por pares.
- Reproducibilidad: no se documentan datos de entrenamiento, hiperparámetros, semillas ni procedimiento de ajuste del modelo LSTM; el paquete depende de un perfil entrenado por usuario, de modo que los resultados no son transferibles entre desarrolladores.
- Incoherencias de metadatos: la fecha de creación (2026-10-17) es posterior a la de actualización (2026-03-06); la licencia MIT de la model card no figura en los metadatos de HuggingFace; el autor aparece como `swordenamine` en el identificador y como `swordenkisk` en el texto. Verificar el fichero LICENSE antes de cualquier uso comercial.
- Riesgo de clasificación errónea: un estado de intención mal inferido puede producir sugerencias intrusivas precisamente en momentos de concentración; la documentación no describe umbrales, calibración ni mecanismo de desactivación por falsos positivos.
- Privacidad y datos biométricos: la captura de dinámica de tecleo a resolución de milisegundos puede constituir dato biométrico conforme al RGPD, con requisitos de base jurídica y consentimiento explícito. La model card afirma que todo queda en local y cifrado en el dispositivo, pero no especifica algoritmo de cifrado, gestión de claves ni retención.
- Riesgo de vigilancia en el despliegue empresarial: la hoja de ruta incluye sincronización de intención en equipo y una API empresarial de analítica de intención; sin garantías técnicas ni contractuales, ese uso puede derivar en monitorización de productividad individual.
- Alcance funcional limitado: no genera código ni texto; no se documentan capacidades multilingües, de razonamiento, matemáticas, visión ni tool calling. La integración con VS Code es un ejemplo, y los plugins de Neovim y JetBrains figuran como pendientes.
- Madurez: 0 descargas y 0 «likes», sin pipeline declarado, mantenido por un único autor y con la mitad de la hoja de ruta sin completar; no apto como dependencia de producción sin auditoría previa del código.
- Riesgo de alucinación: no aplica en el sentido de generación de texto libre, pero sí existe riesgo de sugerencias estructurales plausibles y erróneas cuando la confianza del clasificador es baja.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/swordenamine/neuro_sync_ai
- Perfil de GitHub citado en la model card: https://github.com/swordenkisk
- Documentación referenciada dentro del paquete (rutas relativas, sin URL pública verificada): `docs/ARCHITECTURE.md`, `docs/RESEARCH.md`, `docs/PRIVACY.md`
- Ejemplo de integración con editor referenciado en el paquete: `examples/vscode_extension/`
- Publicación, paper o demo: no disponibles en la información proporcionada.
