# stealth-skeleton/skeleton-alpha

## Resumen

skeleton-alpha es un endpoint de inferencia distribuido por el colectivo Stealth-Skeleton Research bajo licencia Apache-2.0. No se distribuyen pesos: el repositorio de Hugging Face actúa únicamente como tarjeta de modelo y centro de documentación de una API alojada en OpenRouter con interfaz compatible con OpenAI. Por tanto, no es un modelo entrenado por el autor, sino una capa de orquestación sobre cuatro modelos propietarios de terceros (referidos en la documentación como Google Argon 4, Anthropic Claude Fable 5, Anthropic Claude Opus 5.5 y OpenAI Astra), combinados mediante un pipeline de cinco etapas.

La propuesta técnica se centra en tres ideas: ejecución simbólica de operadores matemáticos compilados en lugar de predicción de fórmulas en prosa, un consejo adversarial de cuatro voces internas con resolución de desacuerdos mediante cohomología de haces celulares, y calibración conformal de intervalos de confianza. A ello se suma un sistema de recuperación jerárquica sobre árboles AST sin embeddings vectoriales y un mecanismo de reparación determinista de gramáticas para llamadas a herramientas.

El contexto anunciado es de 128K tokens y el pipeline declarado es text-generation, con soporte únicamente para inglés. Todos los datos de rendimiento son autodeclarados por el autor y no han sido verificados de forma independiente. El modelo se presenta como vista previa gratuita, sin resultados de benchmarks publicados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Orquestacion multi-modelo sobre cuatro modelos propietarios de terceros; capa de ejecucion simbolica con 26 capas de razonamiento y 21.419 operadores matematicos compilados |
| Parametros totales | no disponible (no se distribuyen pesos) |
| Parametros activos | no disponible |
| Longitud de contexto | 128K tokens |
| Tipos de cuantizacion | no disponible (servicio alojado, sin pesos descargables) |
| Idiomas soportados | en |
| Licencia | Apache-2.0 (aplica a la documentacion y ficheros de configuracion del repositorio, no a los pesos) |
| Formato de pesos | no disponible (API-only; no hay safetensors ni GGUF) |

## Arquitectura y entrenamiento

No se trata de un transformer entrenado por el autor. La documentación describe una "Sovereign Cognitive & Mathematical Execution Spine": una capa de orquestación que enruta cada consulta a través de cuatro modelos frontera propietarios y aplica un pipeline de cinco etapas. La primera etapa mapea la consulta a una máscara de estado contextual de 288 bits y la enruta por 26 capas de razonamiento especializadas (L01..L26) respaldadas por 21.419 operadores matemáticos compilados, con verificaciones citadas de conservación de marginales Sinkhorn-Knopp (1,39e-16 en norma L1), residualización ortogonal Frisch-Waugh-Lovell (<1e-15), filtros espectrales Hou-Li de orden 36 y 753 demostraciones de posgrado en matemáticas y Navier-Stokes.

La segunda etapa convoca un consejo adversarial de cuatro voces (Architect, Skeptic, Pragmatist, Critic) con un "firewall" de 80 reglas heurísticas contra razonamientos engañosos. Los desacuerdos se resuelven mediante el Teorema 7 de cohomología laplaciana de haces celulares (energía de Dirichlet = 0,006686, exigiendo consenso de sección global H^0) y encogimiento James-Stein de parte positiva (|Δ log-odds| ≤ 0,35). La tercera etapa aplica escalado de cómputo en test-time según Snell et al. (ICLR 2025) con N = 4 → 16 → 64 rollouts, autoconocimiento epistémico P(IK) de Kadavath, extremización de log-odds de Satopaa-Tetlock y regresión cuantil conformalizada no intercambiable (CQR) de Romano/Barber, con una cobertura empírica declarada del 91,06 % en intervalos del 90 % sobre 6.747 resultados. La cuarta etapa implementa recuperación jerárquica PageIndex sobre árboles AST sin vectores (48.609 elementos de ledger y 110.960 nodos de texto completo, con 10/10 de recall multi-hop en 0,504 ms según pruebas internas). La quinta aplica reparación determinista de gramática Auto-Exacto sobre cada payload de `tool_calls`, con una fiabilidad declarada superior al 95 % en el primer turno.

No se especifican datos de entrenamiento propios, composición del corpus, ni procesos de RLHF o DPO, dado que el autor no entrena los modelos subyacentes. Tampoco se detalla la versión exacta ni la configuración de los cuatro modelos frontera utilizados.

## Capacidades

- Generación de texto en inglés con contexto de 128K tokens.
- Razonamiento matemático con ejecución de operadores compilados: álgebra lineal, transporte óptimo, ecuaciones en derivadas parciales y análisis espectral.
- Razonamiento cuantitativo con intervalos calibrados conformalmente (CQR) y cobertura empírica declarada del 91,06 %.
- Generación de código y soporte de tool calling con reparación determinista de gramática JSON (Auto-Exacto), orientado a entornos como OpenCode, Cline, Roo Code, Cursor y MCP.
- Razonamiento multi-paso y agentes: el pipeline de cinco etapas incluye consejo adversarial interno y escalado de cómputo en test-time con hasta 64 rollouts.
- Recuperación jerárquica sobre código y documentación técnica mediante navegación AST (PageIndex), sin chunking vectorial.
- Detección de premisas erróneas mediante el firewall de 80 reglas heurísticas y las voces Skeptic y Critic.
- Capacidad declarada de señalar información faltante cuando la incertidumbre epistémica supera el umbral.
- Interfaz compatible con OpenAI (`openai-compatible`), lo que permite su uso como drop-in en clientes existentes.

## Casos de uso

- Razonamiento matemático verificado en producción: para cálculos de transporte óptimo, marginales de matrices o problemas de conservación donde una fórmula alucinada es inaceptable, el pipeline ejecuta operadores compilados con verificación numérica antes de devolver la respuesta.
- Agentes de código multi-paso: la reparación Auto-Exacto de gramáticas de `tool_calls` reduce el fallo de cadenas largas en OpenCode, Cline o Cursor, donde un único corchete roto aborta la sesión.
- Estimación de riesgo con intervalos calibrados: la combinación de CQR y extremización de log-odds permite producir intervalos de confianza con cobertura empírica declarada, útil en scoring crediticio, análisis de fiabilidad o evaluación de modelos.
- Revisión adversarial de arquitectura de software: las voces Skeptic y Critic, junto con el firewall de 80 reglas, están diseñadas para detectar supuestos erróneos en propuestas técnicas antes de que se implementen.
- Navegación de bases de código y documentación científica: el PageIndex AST permite responder consultas multi-hop sobre repositorios grandes o PDFs técnicos sin la pérdida de contexto típica del chunking vectorial.
- Auditoría de razonamiento en dominios físicos: los filtros espectrales Hou-Li y las demostraciones de Navier-Stokes permiten abordar problemas de dinámica de fluidos o análisis espectral con verificación simbólica.
- Sustitución directa de endpoints OpenAI en prototipos: al exponer una interfaz compatible, puede integrarse en pipelines existentes sin reescribir el cliente, útil para evaluar la orquestación frente a un modelo único.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye únicamente métricas internas autodeclaradas (cobertura conformal del 91,06 %, fiabilidad de tool calling >95 %, recall multi-hop 10/10 en 0,504 ms, energía de Dirichlet 0,006686) que no constituyen comparaciones con MMLU, HumanEval, GSM8K ni LiveBench, pese a que la etiqueta `livebench` figura entre los tags.

## Requisitos de hardware

- No aplica: el modelo es API-only y no se distribuyen pesos. No requiere VRAM local ni GPU propia.
- El cliente solo necesita conectividad HTTP y un SDK compatible con OpenAI.
- No es desplegable en vLLM, llama.cpp, Ollama ni TGI, ya que no existen artefactos de pesos.
- La latencia y el throughput dependen del proveedor (OpenRouter) y del pipeline interno de cinco etapas; no se publican cifras.
- El coste de cómputo en test-time (hasta 64 rollouts y cuatro motores frontera) sugiere latencias superiores a las de un modelo único, aunque no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| skeleton-alpha | no disponible (orquestacion) | 128K | Apache-2.0 (solo docs) | API en OpenRouter | Capa sobre 4 modelos propietarios; sin pesos |
| Modelo frontera unico (p. ej. Claude Opus 5.5 o GPT clase Astra) | no disponible | 512K–1M segun el motor citado | Propietaria | API comercial | Un solo paso autoregresivo, sin consejo adversarial |
| Modelo abierto tipo Llama o Qwen (familia) | 7B–70B+ | 32K–128K | Permisiva | Pesos descargables | Desplegable localmente; sin verificacion simbolica nativa |

La comparación directa con modelos de pesos abiertos resulta limitada porque skeleton-alpha no publica parámetros, benchmarks ni artefactos. Frente a un modelo frontera único, la diferencia declarada es la orquestación multi-voz y la ejecución simbólica; frente a modelos abiertos, la diferencia es la ausencia de despliegue local y la dependencia de un proveedor externo.

## Limitaciones y advertencias

- Todos los datos de rendimiento son autodeclarados por el autor y no han sido verificados de forma independiente.
- El repositorio no contiene pesos: la licencia Apache-2.0 cubre solo la documentación y los ficheros de configuración, no los modelos subyacentes.
- Dependencia total de cuatro modelos propietarios de terceros cuyos nombres ("Google Argon 4", "Anthropic Claude Fable 5", "Anthropic Claude Opus 5.5", "OpenAI Astra") no corresponden a productos públicos verificables en la información disponible, lo que impide confirmar su existencia o condiciones.
- Idioma limitado al inglés; no se declara soporte multilingüe.
- Riesgo de alucinación no cuantificado: no se publican tasas de error ni evaluaciones en benchmarks estándar.
- Sesgos desconocidos: no se documentan datos de entrenamiento, filtros de sesgo ni evaluaciones de seguridad.
- La cobertura conformal declarada (91,06 %) procede de un conjunto interno de 6.747 resultados y puede no generalizar a dominios distintos.
- El servicio se ofrece como "vista previa gratuita", sin garantías de disponibilidad, SLA ni continuidad.
- Para uso comercial en producción, la cadena de licencias de los modelos subyacentes debe verificarse por separado con cada proveedor.
- La complejidad del pipeline (26 capas, 4 voces, hasta 64 rollouts) implica latencias y costes no publicados.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/stealth-skeleton/skeleton-alpha
- Endpoint en OpenRouter: no disponible (la model card lo menciona sin URL directa)
- Paper de Snell et al. (ICLR 2025) sobre escalado en test-time: no disponible como enlace directo en la información proporcionada
- Referencias citadas sin URL: Kadavath P(IK), Satopaa-Tetlock, Romano/Barber CQR, Sinkhorn-Knopp, Frisch-Waugh-Lovell, Hou-Li, Teorema 7 de cohomología de haces celulares
- Repositorios y demos adicionales: no disponible
