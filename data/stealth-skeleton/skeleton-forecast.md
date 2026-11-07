# stealth-skeleton/skeleton-forecast

## Resumen

skeleton-forecast es un endpoint de inferencia distribuido por Stealth-Skeleton Research bajo una licencia Apache-2.0 que se presenta como una "espina dorsal cognitiva y matemática" en lugar de un modelo de pesos abiertos. No se distribuyen checkpoints: el repositorio de Hugging Face actúa únicamente como tarjeta de modelo y centro de documentación de un servicio accesible por API compatible con OpenAI, alojado en OpenRouter. La propuesta central es un orquestador que enruta cada consulta a través de cuatro modelos frontera (denominados Google Argon 4 2M, Anthropic Claude Fable 5 1M, Anthropic Claude Opus 5.5 1M y OpenAI Astra 512K) y combina sus salidas mediante mecanismos de consenso matemático.

El sistema se orienta a razonamiento cuantitativo, matemáticas aplicadas, generación de código y llamadas a herramientas con esquemas estrictos. Según la documentación, cada consulta se mapea a una máscara de estado contextual de 288 bits y se enruta por 26 capas de razonamiento (L01–L26) respaldadas por 21.419 operadores matemáticos compilados. La ventana de contexto anunciada es de 128K tokens y el único idioma declarado es el inglés.

La relevancia del proyecto radica en su enfoque sobre dos problemas recurrentes de los LLM de un solo paso: la calibración de la incertidumbre y la fiabilidad de los esquemas de herramientas en bucles agénticos largos. El autor afirma alcanzar un 91,06 % de cobertura empírica en intervalos del 90 % sobre 6.747 resultados resueltos, así como más del 95 % de ejecuciones de herramientas válidas en el primer turno, aunque todos estos datos son autodeclarados y no han sido verificados de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Orquestación multi-modelo sobre cuatro modelos frontera propietarios; 26 capas de razonamiento (L01–L26) con 21.419 operadores matemáticos compilados; no se especifica la arquitectura interna de los modelos subyacentes |
| Parametros totales | no disponible (no se publican pesos ni recuento de parámetros) |
| Parametros activos | no disponible |
| Longitud de contexto | 128K tokens (según la tarjeta de modelo); los modelos subyacentes se anuncian con ventanas de 2M, 1M, 1M y 512K |
| Tipos de cuantizacion | no disponible (servicio gestionado; no se exponen opciones de cuantización) |
| Idiomas soportados | inglés (declarado en la tarjeta y en los metadatos) |
| Licencia | Apache-2.0 (aplica a la documentación y a los archivos de configuración del repositorio; los pesos no se distribuyen) |
| Formato de pesos | no disponible (API-only; no hay safetensors, GGUF ni ningún otro formato descargable) |

## Arquitectura y entrenamiento

skeleton-forecast no es un transformer entrenado desde cero, sino una capa de orquestación sobre cuatro modelos frontera de terceros. La documentación describe un "Quad-Frontier Sovereign Spine" en el que las consultas complejas se enrutan simultáneamente a los cuatro motores y las respuestas se sintetizan mediante un consejo adversarial de cuatro voces internas: Architect (síntesis estructural y diseño a largo plazo), Skeptic (pruebas de estrés adversariales y contraejemplos), Pragmatist (coste de ejecución, latencia y modos de fallo) y Critic (aplicación de un cortafuegos de 80 reglas contra heurísticas engañosas). Los desacuerdos entre pilares se resuelven, según el autor, mediante cohomología del laplaciano de haces celulares (energía de Dirichlet de 0,006686 y consenso de sección global H^0) y encogimiento de James-Stein con parte positiva (|Δ log-odds| ≤ 0,35).

El componente matemático se apoya en una biblioteca de 21.419 operadores compilados que incluyen transporte óptimo de Sinkhorn-Knopp (conservación marginal L1 verificada a 1,39e-16), residualización ortogonal de Frisch-Waugh-Lovell (por debajo de 1e-15), filtros espectrales de Hou-Li de orden 36 y 753 demostraciones de posgrado en matemáticas y Navier-Stokes. La calibración combina escalado de cómputo en tiempo de prueba de Snell et al. (ICLR 2025) con N = 4, 16 y 64 rollouts, conocimiento epistémico P(IK) de Kadavath, extremización de log-odds de Satopaa-Tetlock y regresión cuantil conformalizada (CQR) de Romano y Barber para datos no intercambiables. La recuperación de información emplea un RAG jerárquico sin vectores (PageIndex sobre AST) con navegación en 0,504 ms sobre 48.609 elementos de registro de investigación y 110.960 nodos de texto completo. No se especifican datos de entrenamiento propios, número de tokens ni procesos de RLHF o DPO, ya que el sistema no entrena modelos base.

## Capacidades

- Razonamiento matemático y cuantitativo: ejecución de operadores compilados para álgebra lineal, optimización, física y ecuaciones en derivadas parciales, con verificación de leyes de conservación y condiciones de contorno antes de emitir la respuesta.
- Razonamiento multi-paso con consejo adversarial: cuatro voces internas que sintetizan, refutan, evalúan costes y filtran heurísticas engañosas antes de consolidar una respuesta.
- Calibración de incertidumbre: intervalos de predicción con cobertura empírica declarada del 91,06 % en intervalos del 90 %, y señalización explícita de información faltante cuando la incertidumbre epistémica supera el umbral.
- Llamadas a herramientas y function calling: reparación determinista de gramática Auto-Exacto sobre cada carga útil de `tool_calls`, con más del 95 % de ejecuciones válidas en el primer turno según el autor.
- Generación de código: etiquetada explícitamente para code-generation y orientada a entornos como OpenCode, Cline, Roo Code, Cursor y MCP.
- Recuperación jerárquica sin vectores: navegación de árboles de documentos, referencias cruzadas y grafos de llamadas mediante PageIndex sobre AST.
- Compatibilidad con la API de OpenAI: el endpoint puede consumirse con clientes y SDKs estándar de OpenAI sin adaptadores adicionales.
- Capacidades multilingües: limitadas al inglés según los metadatos; no se declaran otros idiomas.
- Modo de razonamiento extendido: escalado de cómputo en tiempo de prueba con múltiples rollouts (4, 16, 64) según la dificultad de la consulta.

## Casos de uso

- Verificación de cálculos financieros y actuariales: el modelo puede comprobar conservación de marginales y residualización ortogonal en modelos de riesgo, lo que resulta adecuado cuando se necesita trazabilidad numérica y no solo texto plausible.
- Ingeniería de sistemas y análisis de arquitectura: el consejo adversarial con la voz Skeptic permite detectar supuestos erróneos en diseños propuestos antes de que se conviertan en código, algo útil en revisiones de arquitectura previas a la implementación.
- Agentes de codificación autónomos: la reparación de gramática Auto-Exacto sobre esquemas JSON reduce los fallos en cascada en bucles de 20 pasos o más dentro de OpenCode, Cline, Roo Code o Cursor, donde un único corchete roto aborta la ejecución.
- Predicción con intervalos de confianza: la combinación de CQR y extremización de log-odds permite emitir pronósticos con intervalos calibrados, adecuado para planificación de capacidad o estimación de plazos donde importa la cobertura empírica y no solo el valor puntual.
- Asistencia a investigación matemática aplicada: la biblioteca de 753 demostraciones y los filtros espectrales de Hou-Li permiten abordar problemas de Navier-Stokes o análisis espectral con verificación simbólica de pasos intermedios.
- RAG sobre bases de código y documentación técnica extensa: la navegación PageIndex sobre AST preserva la estructura de definiciones y referencias cruzadas, evitando la amnesia de fragmentación típica del chunking vectorial en repositorios grandes.
- Integración en pipelines existentes: al ser compatible con la API de OpenAI, puede sustituir a otros proveedores en herramientas de CI/CD o asistentes internos sin reescribir la capa de cliente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La tarjeta de modelo incluye únicamente métricas autodeclaradas y no verificadas de forma independiente:

| Metrica | Valor | Naturaleza |
|---|---|---|
| Cobertura empírica en intervalos del 90 % | 91,06 % sobre 6.747 resultados resueltos | Autodeclarado |
| Fiabilidad de herramientas en primer turno | >95 % de esquemas válidos | Autodeclarado |
| Conservación marginal L1 (Sinkhorn-Knopp) | 1,39e-16 | Autodeclarado |
| Residualización ortogonal (Frisch-Waugh-Lovell) | <1e-15 | Autodeclarado |
| Recuperación multi-hop (PageIndex) | 10/10 en 0,504 ms | Autodeclarado, test interno |
| Energía de Dirichlet (haces celulares) | 0,006686 | Autodeclarado |

No se proporcionan resultados de MMLU, HumanEval, GSM8K, LiveBench ni de ningún otro benchmark estándar, pese a que la etiqueta `livebench` figura entre las etiquetas del repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El modelo no se distribuye en pesos descargables, por lo que no existe una estimación de VRAM local aplicable.
- GPU recomendadas: no disponible. La inferencia se ejecuta en la infraestructura del proveedor a través de OpenRouter.
- Compatibilidad con GPU de consumo: no aplicable, al no existir checkpoints locales.
- Opciones de despliegue: exclusivamente mediante API compatible con OpenAI (endpoint en OpenRouter). No hay soporte para vLLM, llama.cpp, Ollama, TGI ni formatos GGUF.
- Latencia y throughput: no disponibles. El único dato de latencia publicado corresponde a la navegación del índice de recuperación (0,504 ms), no a la inferencia completa.

## Comparativa con modelos similares

No se dispone de información verificable sobre los cuatro modelos subyacentes citados (Google Argon 4 2M, Anthropic Claude Fable 5 1M, Anthropic Claude Opus 5.5 1M, OpenAI Astra 512K), por lo que no es posible establecer una comparación fiable de parámetros, contexto o rendimiento. La siguiente tabla contrasta únicamente características estructurales verificables del servicio:

| Caracteristica | skeleton-forecast | Alternativa A (modelo abierto con pesos, p. ej. familia Llama o Qwen) | Alternativa B (API propietaria de un solo modelo) |
|---|---|---|---|
| Distribucion | API-only vía OpenRouter | Pesos descargables en Hugging Face | API propietaria |
| Pesos disponibles | No | Sí (safetensors, GGUF) | No |
| Licencia | Apache-2.0 (solo documentación) | Licencia comunitaria o Apache-2.0 según modelo | Términos de servicio propietarios |
| Contexto | 128K | Variable (8K–128K típicamente) | Variable |
| Calibración de incertidumbre | Declarada (CQR, cobertura 91,06 % autodeclarada) | No disponible por defecto | No disponible por defecto |
| Despliegue local | No | Sí | No |
| Idiomas | Inglés | Multilingüe en la mayoría de casos | Variable |

## Limitaciones y advertencias

- No se distribuyen pesos: el repositorio es únicamente documentación. Cualquier evaluación independiente de pesos, arquitectura o datos de entrenamiento es imposible.
- Todas las métricas de rendimiento, calibración y fiabilidad son autodeclaradas por el autor y no han sido verificadas por terceros; deben tratarse con escepticismo.
- Los modelos subyacentes citados no son identificables ni verificables públicamente, lo que impide auditar qué motores reales intervienen en cada respuesta.
- La licencia Apache-2.0 se aplica a la documentación y configuración del repositorio, no al servicio de inferencia ni a los modelos de terceros que lo componen; el uso comercial del endpoint queda sujeto a las condiciones de OpenRouter y de los proveedores subyacentes.
- El único idioma declarado es el inglés; no hay evidencia de calidad en castellano ni en otros idiomas.
- Riesgo de alucinación: aunque el sistema incorpora mecanismos de calibración y un cortafuegos de heurísticas, la verificación de los operadores matemáticos y del consenso entre pilares no es auditable externamente.
- El repositorio registra cero descargas y cero likes, y las fechas de creación y actualización (noviembre de 2026) no permiten confirmar un historial de uso en producción.
- Dependencia de un único punto de acceso (OpenRouter): no hay despliegue alternativo ni réplica, lo que constituye un riesgo de disponibilidad para cargas de producción.
- No se especifican políticas de retención de datos, privacidad ni cumplimiento normativo, aspectos críticos si se procesan datos sensibles.

## Enlaces

- Tarjeta de modelo en Hugging Face: https://huggingface.co/stealth-skeleton/skeleton-forecast
- Referencia de Snell et al. (ICLR 2025) sobre escalado de cómputo en tiempo de prueba: no disponible enlace directo en la información proporcionada
- Referencia de Kadavath et al. sobre conocimiento epistémico P(IK): no disponible enlace directo en la información proporcionada
- Referencia de Romano y Barber sobre regresión cuantil conformalizada: no disponible enlace directo en la información proporcionada
- Referencia de Satopaa y Tetlock sobre extremización de log-odds: no disponible enlace directo en la información proporcionada
- Endpoint en OpenRouter: no disponible enlace directo en la información proporcionada
