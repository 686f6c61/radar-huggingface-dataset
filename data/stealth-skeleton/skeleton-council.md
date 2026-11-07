# stealth-skeleton/skeleton-council

## Resumen

skeleton-council es un endpoint de inferencia publicado por Stealth-Skeleton Research bajo licencia Apache-2.0 y accesible exclusivamente a través de OpenRouter con una interfaz compatible con la API de OpenAI. No se trata de un modelo con pesos descargables: el repositorio de Hugging Face actúa como tarjeta de modelo y centro de documentación de un servicio que orquesta cuatro modelos frontera de terceros (Google Argon 4 2M, Anthropic Claude Fable 5 1M, Anthropic Claude Opus 5.5 1M y OpenAI Astra 512K) bajo una capa de razonamiento propia denominada Quad-Frontier Sovereign Spine.

La propuesta del autor es sustituir la predicción autorregresiva de un único modelo por una arquitectura de cinco etapas que combina ejecución simbólica de operadores matemáticos compilados, un council adversarial de cuatro voces internas (Architect, Skeptic, Pragmatist y Critic), calibración conformal de la incertidumbre y recuperación documental jerárquica sin vectores. El objetivo declarado es reducir los fallos típicos de los LLM de pasada única: aritmética inventada, sicofancia ante premisas erróneas, confianza mal calibrada y esquemas de tool calling rotos en bucles de agente largos.

La relevancia actual del proyecto es principalmente documental y de evaluación: expone una arquitectura de orquestación multi-modelo con mecanismos concretos (sheaf cohomology para resolver desacuerdos, conformalized quantile regression para cobertura de intervalos, grammar healing determinista para payloads de herramientas) y publica métricas autoinformadas, pero no ofrece pesos, artefactos reproducibles ni resultados verificables de terceros. El contexto declarado es de 128K tokens y el único idioma listado es el inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Orquestación multi-modelo sobre cuatro modelos frontera (Google Argon 4 2M, Anthropic Claude Fable 5 1M, Anthropic Claude Opus 5.5 1M, OpenAI Astra 512K) con capa de razonamiento de 26 niveles (L01..L26) y 21.419 operadores matemáticos compilados |
| Parametros totales | No disponible (no se publican pesos; el servicio agrega modelos de terceros) |
| Parametros activos | No disponible (no es un MoE propio) |
| Longitud de contexto | 128K tokens (según badge de la model card) |
| Tipos de cuantizacion | No disponible (servicio alojado, sin pesos distribuidos) |
| Idiomas soportados | Inglés (campo `language: en`) |
| Licencia | Apache-2.0 (aplica a documentación y ficheros de configuración del repositorio; no a pesos) |
| Formato de pesos | No disponible (no se distribuyen pesos; acceso vía API compatible con OpenAI) |

## Arquitectura y entrenamiento

La arquitectura real es una capa de orquestación, no un transformer entrenado por el autor. Cada consulta se mapea a una máscara de estado contextual de 288 bits y se enruta por 26 capas de razonamiento especializadas respaldadas por 21.419 operadores matemáticos compilados, entre los que se citan verificación de conservación marginal Sinkhorn-Knopp hasta 1,39e-16 en norma L1, residualización ortogonal Frisch-Waugh-Lovell por debajo de 1e-15, filtros espectrales Hou-Li de orden 36 y 753 demostraciones de matemática de posgrado y Navier-Stokes. Sobre esa base, las decisiones complejas se distribuyen entre los cuatro modelos frontera y cuatro voces internas cuyos desacuerdos se resuelven mediante cohomología del laplaciano de haces celulares (energía de Dirichlet 0,006686, consenso global de sección H^0) y shrinkage de James-Stein en la parte positiva (|Δ log-odds| ≤ 0,35).

No se publica información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO, porque no hay entrenamiento de pesos por parte del autor. Los mecanismos de inferencia declarados incluyen test-time scaling de Snell et al. (ICLR 2025) con N = 4, 16 y 64 rollouts, autoconocimiento epistémico P(IK) de Kadavath, extremización de log-odds Satopaa-Tetlock y regresión quantílica conformalizada no intercambiable de Romano y Barber. La recuperación usa un árbol PageIndex jerárquico sin vectores sobre 48.609 entradas de ledger de investigación y 110.960 nodos de texto completo, con navegación AST declarada en 0,504 ms. El gateway aplica un mecanismo propietario de reparación determinista de gramática (Auto-Exacto) sobre cada payload de `tool_calls`.

## Capacidades

- Generación de texto y razonamiento matemático con ejecución de operadores compilados en lugar de aritmética en prosa.
- Razonamiento adversarial multi-voz: cuatro perspectivas internas (Architect, Skeptic, Pragmatist, Critic) con resolución formal de desacuerdos.
- Tool calling y function calling con reparación determinista de gramática JSON orientada a esquemas válidos en el primer turno.
- Generación de código y soporte de bucles de agente multi-paso en entornos tipo OpenCode, Cline, Roo Code, Cursor y MCP.
- Calibración de incertidumbre mediante intervalos conformales y señalización explícita de información faltante cuando la incertidumbre epistémica supera el umbral.
- Recuperación documental jerárquica sin vectores sobre bases de código y PDF técnicos, con navegación de referencias cruzadas y grafos de llamadas.
- Capacidades multilingües: limitadas al inglés según los metadatos.
- Sin visión, audio ni modalidades adicionales declaradas.

## Casos de uso

- Revisión de derivaciones matemáticas y físicas en entornos de investigación: el modelo enruta la consulta por las capas L01..L26 y verifica conservación de marginales y condiciones de contorno antes de responder, lo que resulta adecuado para validar resultados analíticos donde un LLM de pasada única tendería a producir fórmulas plausibles pero incorrectas.
- Auditoría adversarial de arquitecturas de software: las voces Skeptic y Critic someten la propuesta del usuario a contraejemplos y a un firewall de 80 reglas contra heurísticas engañosas, de modo que una premisa defectuosa se detecta antes de construir sobre ella.
- Asistencia a agentes de codificación en IDE: la reparación Auto-Exacto de `tool_calls` reduce la probabilidad de abortar cadenas de 20 pasos por un corchete JSON mal formado, lo que encaja con flujos en Cline, Roo Code o Cursor.
- Estimación de riesgo con intervalos calibrados: la combinación de CQR y extremización de log-odds permite emitir probabilidades con cobertura empírica declarada, útil en informes de fiabilidad o análisis de escenarios donde la confianza mal calibrada es un riesgo operativo.
- Navegación de bases de código y documentación técnica extensa: el árbol PageIndex sin vectores preserva la conexión entre definiciones del capítulo 2 y teoremas del capítulo 9, lo que lo hace adecuado para preguntas multi-hop sobre repositorios grandes.
- Orquestación de decisiones con múltiples modelos frontera: al distribuir la consulta entre Argon 4, Claude Fable 5, Claude Opus 5.5 y Astra, el servicio puede contrastar respuestas de proveedores distintos y resolver discrepancias mediante el consenso de haz, útil en pipelines de revisión técnica interna.
- Verificación de pipelines de optimización: los operadores Sinkhorn-Knopp y Frisch-Waugh-Lovell compilados permiten comprobar el cumplimiento de restricciones de transporte óptimo o de ortogonalización de residuos en flujos de análisis de datos.

## Benchmarks y rendimiento

| Metrica | Resultado | Notas |
|---|---|---|
| Cobertura empírica de intervalos conformales al 90% | 91,06% | Autoinformado, sobre 6.747 resultados resueltos |
| Fiabilidad de tool calling en primer turno | >95% | Autoinformado, esquema válido tras Auto-Exacto |
| Recall multi-hop en recuperación PageIndex | 10/10 | Autoinformado, test interno, latencia 0,504 ms |
| Conservación marginal L1 Sinkhorn-Knopp | 1,39e-16 | Autoinformado |
| Residualización ortogonal Frisch-Waugh-Lovell | <1e-15 | Autoinformado |
| Energía de Dirichlet del laplaciano de haz | 0,006686 | Autoinformado |

No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K, LiveBench) verificables de forma independiente en la información disponible; las etiquetas mencionan LiveBench, pero no se aportan puntuaciones.

## Requisitos de hardware

- No aplicable para inferencia local: el modelo se distribuye exclusivamente como endpoint alojado y la model card declara `inference: false`.
- No hay pesos que cargar, por lo que no existe requisito de VRAM ni de GPU por parte del usuario.
- El despliegue propio no es posible con este repositorio; la única vía documentada es el endpoint de OpenRouter con interfaz compatible con OpenAI.
- Latencia y throughput dependen del enrutado entre los cuatro modelos frontera y de los rollouts de test-time scaling (N = 4, 16, 64); no se publican cifras de latencia extremo a extremo.
- Para integración, cualquier cliente compatible con la API de OpenAI (SDK oficial, LangChain, LlamaIndex) puede apuntar al endpoint, pero el cómputo ocurre en infraestructura del proveedor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| skeleton-council | No disponible (orquestación de terceros) | 128K | Council adversarial multi-modelo con capa matemática simbólica | Apache-2.0 (solo documentación) | API vía OpenRouter |
| Modelos frontera integrados (Argon 4 2M, Claude Fable 5 1M, Claude Opus 5.5 1M, Astra 512K) | No disponible | 512K a 2M según proveedor | Predicción autorregresiva de pasada única | Propietarias | APIs comerciales |
| Sistemas de agentes open source tipo AutoGen o CrewAI | No disponible | Depende del modelo subyacente | Orquestación multi-agente programática | MIT/Apache-2.0 según proyecto | Autoalojables con modelos locales |

La comparación directa con modelos de pesos abiertos no es significativa porque skeleton-council no compite en la misma categoría de despliegue: no ofrece artefactos descargables ni permite evaluación reproducible offline. Frente a frameworks de orquestación open source, la diferencia es que aquí la lógica de consenso (haz celular, shrinkage, calibración conformal) viene empaquetada como servicio, mientras que en AutoGen o CrewAI el usuario define y audita sus propios mecanismos.

## Limitaciones y advertencias

- Todos los benchmarks y métricas de la model card son autoinformados y no cuentan con verificación independiente; deben tratarse como afirmaciones del proveedor, no como resultados reproducibles.
- No se distribuyen pesos ni artefactos de evaluación, lo que impide auditar la capa de orquestación, los 21.419 operadores o los 753 teoremas citados.
- La licencia Apache-2.0 se aplica explícitamente solo a la documentación y configuración del repositorio; el uso del endpoint se rige por los términos de OpenRouter y de los proveedores subyacentes, no por Apache-2.0.
- Idioma limitado al inglés según los metadatos; no hay soporte multilingüe declarado.
- Dependencia de cuatro APIs de terceros: cualquier cambio de precio, cuota, disponibilidad o política de uso de Google, Anthropic u OpenAI afecta directamente al servicio.
- Riesgo de alucinación persistente en las capas generativas de los modelos frontera; la capa simbólica mitiga errores aritméticos, pero no elimina invención de hechos o citas.
- Los sesgos heredados de los modelos subyacentes no se documentan ni se cuantifican.
- El contexto de 128K es menor que el de varios de los modelos integrados (512K a 2M), lo que puede limitar casos de uso que dependan de ventanas muy largas.
- No hay información sobre latencia, disponibilidad SLA, política de retención de datos ni cumplimiento normativo, aspectos críticos para producción.
- El nombre de los modelos integrados (Argon 4, Claude Fable 5, Claude Opus 5.5, Astra) no corresponde a identificadores públicos verificables en la información disponible, lo que añade incertidumbre sobre la composición real del servicio.

## Enlaces

- Hugging Face: https://huggingface.co/stealth-skeleton/skeleton-council
- Endpoint de inferencia: OpenRouter (referenciado en la model card; no se proporciona URL directa en la información disponible)
- Referencia citada: Snell et al., compute-optimal test-time scaling, ICLR 2025 (sin URL en la información disponible)
- Referencia citada: Kadavath et al., epistemic self-knowledge P(IK) (sin URL en la información disponible)
- Referencia citada: Romano y Barber, conformalized quantile regression no intercambiable (sin URL en la información disponible)
- Referencia citada: Satopaa y Tetlock, extremización de log-odds (sin URL en la información disponible)
