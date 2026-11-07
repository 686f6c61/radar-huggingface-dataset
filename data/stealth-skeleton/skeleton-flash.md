# stealth-skeleton/skeleton-flash

## Resumen

`stealth-skeleton/skeleton-flash` es un endpoint de inferencia publicado en OpenRouter por el autor `stealth-skeleton` (Stealth-Skeleton Research), distribuido bajo una interfaz compatible con la API de OpenAI y documentado a través de un repositorio de Hugging Face que no contiene pesos descargables. El modelo se presenta como una capa de orquestación ("Sovereign Cognitive & Mathematical Execution Spine") sobre cuatro modelos frontera no identificados con exactitud (referidos como Google Argon 4 2M, Anthropic Claude Fable 5 1M, Anthropic Claude Opus 5.5 1M y OpenAI Astra 512K), en lugar de como un transformer entrenado desde cero. Su propuesta diferencial es sustituir la predicción autoregresiva de un solo paso por un pipeline de cinco etapas con verificación matemática, consejo adversarial y calibración conformal.

El modelo declara una ventana de contexto de 128K tokens, licencia Apache-2.0 (aplicable, según el autor, únicamente a la documentación y ficheros de configuración del repositorio) y soporte exclusivo de inglés. Los tags del repositorio apuntan a razonamiento matemático, predicción conformal, transporte óptimo, tool calling, generación de código y evaluación en LiveBench. No se publican parámetros totales, arquitectura de red ni detalles de entrenamiento, ya que el producto es una API opaca.

Es relevante ahora porque ejemplifica una tendencia creciente: modelos "envoltorio" que agregan varios motores frontera con capas deterministas de corrección (gramática de tool calls, calibración de intervalos, resolución de desacuerdos) y se comercializan como un único endpoint. Para desarrolladores, la decisión práctica pasa por evaluar si esas capas aportan fiabilidad medible frente a llamar directamente a los modelos subyacentes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Orquestación multi-modelo (4 motores frontera) con capas deterministas de razonamiento, verificación y calibración; no se especifica la arquitectura interna de cada motor |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | 128K tokens (según badge de la model card) |
| Tipos de cuantización | no disponible (servicio API; no se distribuyen pesos) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache-2.0 (aplica a documentación y configuración del repositorio; los pesos no se distribuyen) |
| Formato de pesos | no disponible (API-only; `inference: false`, sin pesos descargables) |

## Arquitectura y entrenamiento

El sistema no es un modelo entrenado de forma monolítica, sino una capa de orquestación sobre cuatro motores frontera. Cada consulta se mapea, según la documentación, a una "máscara de estado contextual de 288 bits" y se enruta por 26 capas de razonamiento (L01..L26) respaldadas por 21.419 operadores matemáticos compilados: transporte óptimo de Sinkhorn-Knopp (conservación marginal L1 verificada a 1,39e-16), residualización ortogonal de Frisch-Waugh-Lovell (<1e-15), filtros espectrales de Hou-Li de orden 36 y 753 demostraciones de matemáticas de posgrado y Navier-Stokes. Las decisiones complejas se reparten entre cuatro "voces" internas (Architect, Skeptic, Pragmatist, Critic) con un firewall de 80 reglas heurísticas; los desacuerdos se resuelven mediante cohomología de haces celulares (energía de Dirichlet 0,006686, consenso de sección global H^0) y shrinkage de James-Stein en la parte positiva (|Δ log-odds| ≤ 0,35).

En el plano de la calibración, el autor declara combinar test-time scaling de Snell et al. (ICLR 2025) con N = 4 → 16 → 64 rollouts, autoconocimiento epistémico P(IK) de Kadavath, extremización de log-odds de Satopaa-Tetlock y regresión cuantil conformalizada (CQR) de Romano/Barber para casos no intercambiables. La recuperación se realiza mediante un árbol jerárquico PageIndex "vectorless" sobre 48.609 elementos de ledger y 110.960 nodos de texto completo, con navegación AST declarada de 0,504 ms. No se especifican tokens de entrenamiento, composición del dataset ni si hubo RLHF o DPO sobre los motores subyacentes.

## Capacidades

- Generación de texto y razonamiento matemático con verificación de operadores (conservación de marginales, condiciones de contorno, residualización ortogonal).
- Razonamiento multi-paso con consejo adversarial de cuatro voces y resolución formal de desacuerdos.
- Tool calling y function calling con "Auto-Exacto deterministic grammar healing" sobre cada payload `tool_calls`; el autor declara >95% de ejecuciones válidas contra esquema en el primer turno.
- Generación de código, con foco en bucles de agente largos (OpenCode, Cline, Roo Code, Cursor, MCP).
- Recuperación documental jerárquica sin base de datos vectorial (PageIndex AST), orientada a código y PDFs técnicos con referencias cruzadas.
- Calibración de incertidumbre: intervalos conformales con cobertura empírica declarada del 91,06% en intervalos del 90% sobre 6.747 resultados resueltos.
- Modo de "pass discipline": cuando la incertidumbre epistémica supera el umbral, el sistema señala la información faltante en lugar de responder.
- Capacidades multilingües: limitadas a inglés según la metadata del repositorio.

## Casos de uso

- Verificación matemática en pipelines de ingeniería: el sistema puede comprobar conservación de marginales y condiciones de contorno en cálculos de optimización o simulación antes de devolver la respuesta, lo que encaja en revisiones automatizadas de hojas de cálculo técnico o modelos físicos.
- Agentes de código autónomos: el saneamiento determinista de gramática en `tool_calls` reduce los fallos de esquema en cadenas de 20 o más pasos, adecuado para integrarse en Cline, Roo Code o Cursor donde un bracket roto aborta la ejecución.
- Asistencia a investigación documental: la navegación jerárquica sobre árboles de documentos permite resolver preguntas multi-hop que cruzan capítulos y referencias, sin depender de chunking de 500 tokens que rompe definiciones y teoremas.
- Estimación de riesgo con intervalos calibrados: útil en análisis financiero o de fiabilidad donde se necesita una cobertura empírica declarada en lugar de porcentajes inventados; el modelo devuelve intervalos conformales y señala la información faltante.
- Revisión adversarial de arquitecturas de software: el consejo de cuatro voces (Skeptic, Pragmatist, Critic) está diseñado para detectar supuestos erróneos en la premisa del usuario y proponer una arquitectura corregida antes de implementar.
- Automatización de soporte técnico especializado en inglés: con 128K de contexto puede mantener conversaciones multi-turno con documentación extensa adjunta, aunque la ausencia de otros idiomas limita su uso fuera de entornos anglófonos.
- Evaluación comparativa de modelos en producción: al exponerse como endpoint compatible con OpenAI, puede conectarse a harnesses de evaluación tipo LiveBench para contrastar su calibración frente a llamadas directas a los motores subyacentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor reporta únicamente métricas internas autodeclaradas:

| Métrica | Valor declarado | Naturaleza |
|---|---|---|
| Cobertura empírica de intervalos conformales (90%) | 91,06% sobre 6.747 resultados | Autodeclarado |
| Fiabilidad de tool calls válidos en primer turno | >95% | Autodeclarado |
| Recall multi-hop en recuperación PageIndex | 10/10 en 0,504 ms | Autodeclarado, test interno |
| Conservación marginal L1 (Sinkhorn-Knopp) | 1,39e-16 | Verificación numérica del operador |
| Residualización ortogonal (Frisch-Waugh-Lovell) | <1e-15 | Verificación numérica del operador |
| Energía de Dirichlet (cohomología de haces) | 0,006686 | Interno |

No hay comparación pública con modelos de referencia en LiveBench ni en otros benchmarks, pese a que el tag `livebench` figura en el repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplicable; el modelo se consume como API remota y no se distribuyen pesos.
- GPU recomendadas: no aplicable al cliente; la inferencia ocurre en la infraestructura del proveedor.
- Compatibilidad con GPU de consumo: no aplicable (no hay pesos descargables ni GGUF oficial).
- Opciones de despliegue: cliente HTTP compatible con la API de OpenAI (SDK oficial, LangChain, LlamaIndex, harnesses de evaluación); no hay soporte para vLLM, llama.cpp, Ollama ni TGI porque no se publican pesos.
- Latencia y throughput: no disponibles. El autor menciona "low latency" en un badge sin cifra asociada; la latencia real dependerá del enrutado entre los cuatro motores y de las etapas de verificación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Distribución | Notas |
|---|---|---|---|---|---|
| stealth-skeleton/skeleton-flash | no disponible | 128K | Apache-2.0 (solo docs) | API en OpenRouter | Orquestación multi-modelo con capas de verificación y calibración |
| DeepSeek-V4.1-Flash-Skeleton (GGUF, `agentionai`) | no disponible | no disponible | no disponible | Pesos GGUF en HF | Nombre similar pero repositorio distinto; no consta relación con este modelo |
| Motores frontera subyacentes (Argon 4, Claude Fable 5, Claude Opus 5.5, Astra) | no disponible | 512K–2M según el autor | propietarias | API | Llamada directa sin capas de orquestación ni calibración conformal |

La comparación con alternativas de la misma categoría (agregadores multi-modelo con corrección determinista) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Opacidad total: no se publican pesos, arquitectura interna, datos de entrenamiento ni detalles de los cuatro motores subyacentes; la reproducibilidad es nula.
- Métricas autodeclaradas: todas las cifras de rendimiento (cobertura conformal, fiabilidad de tool calls, recall de recuperación) proceden del autor y no han sido verificadas de forma independiente.
- Licencia: Apache-2.0 se aplica según el autor solo a la documentación y configuración del repositorio; el uso del endpoint está sujeto a los términos del proveedor y de los modelos subyacentes, no a Apache-2.0.
- Idioma: solo inglés; no hay soporte declarado de castellano ni de otros idiomas.
- Riesgo de alucinación: aunque el diseño incluye verificación de operadores y "pass discipline", la respuesta final sigue generándose en lenguaje natural por motores frontera, con el riesgo asociado; las capas deterministas no cubren afirmaciones factuales fuera del ámbito matemático.
- Dependencia de terceros: el servicio depende de la disponibilidad y los cambios de precio o política de cuatro proveedores externos, lo que introduce riesgo operativo y de continuidad.
- Coste y latencia: el enrutado por múltiples motores y los rollouts de test-time scaling (hasta N=64) pueden incrementar latencia y coste frente a una llamada directa.
- Contexto: los 128K declarados son inferiores a la ventana de algunos motores subyacentes (hasta 2M según el autor), por lo que la orquestación puede truncar capacidad disponible.
- Madurez: repositorio creado el 7 de noviembre de 2026, con 0 descargas y 0 likes en el momento de la consulta; sin comunidad ni historial de producción verificable.
- Confusión de nombres: existe un repositorio GGUF de nombre similar (`agentionai/DeepSeek-V4.1-Flash-Skeleton-GGUF`) sin relación confirmada; conviene no confundirlos al buscar pesos descargables.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/stealth-skeleton/skeleton-flash
- Repositorio GGUF de nombre similar (sin relación confirmada): https://huggingface.co/agentionai/DeepSeek-V4.1-Flash-Skeleton-GGUF/tree/main
- Endpoint en OpenRouter: no disponible como URL directa en la información proporcionada
- Paper técnico: no disponible
- Blog o demo: no disponible
