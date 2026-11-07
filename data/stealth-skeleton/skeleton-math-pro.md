# stealth-skeleton/skeleton-math-pro

## Resumen

skeleton-math-pro es un endpoint de inferencia publicado por stealth-skeleton bajo licencia Apache-2.0 y distribuido exclusivamente a través de una API compatible con OpenAI. No se trata de un modelo con pesos descargables: el repositorio de Hugging Face actúa únicamente como centro de documentación del servicio, y la propia model card lo declara explícitamente (`inference: false`). El autor lo describe como un "Sovereign Cognitive & Mathematical Execution Spine", es decir, una capa de orquestación sobre cuatro modelos frontera de terceros (referidos como Google Argon 4, Anthropic Claude Fable 5, Anthropic Claude Opus 5.5 y OpenAI Astra) que combina razonamiento matemático, verificación formal y calibración de incertidumbre antes de devolver una respuesta.

El modelo se posiciona para tareas de matemáticas de posgrado, optimización con transporte óptimo, filtros espectrales y resolución de problemas de Navier-Stokes, con una ventana de contexto declarada de 128K tokens y soporte de tool calling con reparación gramatical determinista. La propuesta diferencial frente a un LLM de un solo paso es la ejecución de operadores matemáticos compilados y un consejo adversarial interno de cuatro voces que resuelve desacuerdos mediante cohomología de haces celulares.

Es relevante ahora porque ejemplifica una tendencia creciente: servicios que envuelven modelos propietarios con capas de verificación, calibración conforme y orquestación multiagente, y que se publican en Hugging Face como si fueran modelos abiertos. Conviene leer la ficha con cautela: todos los benchmarks y métricas son autoinformados y no hay artefactos verificables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Orquestación multi-modelo sobre cuatro modelos frontera de terceros, con capa de ejecución de operadores matemáticos compilados (26 capas de razonamiento L01..L26, 21.419 operadores) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se declara MoE) |
| Longitud de contexto | 128K tokens |
| Tipos de cuantizacion | no disponible (servicio API; no se distribuyen pesos) |
| Idiomas soportados | en |
| Licencia | Apache-2.0 (aplica a la documentación y ficheros de configuración del repositorio; no hay pesos que licenciar) |
| Formato de pesos | no disponible (no se distribuyen pesos; acceso solo vía API compatible con OpenAI) |

## Arquitectura y entrenamiento

No se trata de un transformer entrenado desde cero ni de un modelo con pesos publicados. La arquitectura descrita es una espina dorsal cognitiva ("Sovereign Cognitive & Mathematical Execution Spine") que enruta cada consulta a través de una máscara de estado contextual de 288 bits y 26 capas de razonamiento especializadas, apoyadas en 21.419 operadores matemáticos compilados. Entre ellos se citan Sinkhorn-Knopp para transporte óptimo (conservación de marginales L1 verificada a 1,39e-16), residualización ortogonal de Frisch-Waugh-Lovell (por debajo de 1e-15) y filtros espectrales de Hou-Li de orden 36, además de 753 demostraciones de matemáticas de posgrado y Navier-Stokes.

El razonamiento complejo se distribuye entre cuatro modelos frontera externos (Google Argon 4 2M, Anthropic Claude Fable 5 1M, Anthropic Claude Opus 5.5 1M, OpenAI Astra 512K) y cuatro voces internas (Architect, Skeptic, Pragmatist, Critic) que aplican un firewall de 80 reglas contra heurísticas engañosas. Los desacuerdos se resuelven mediante el Teorema 7 de cohomología del laplaciano de haces celulares (energía de Dirichlet 0,006686, consenso de sección global H^0) y shrinkage de James-Stein en la parte positiva (|Δ log-odds| ≤ 0,35). La calibración combina escalado de test-time compute de Snell et al. (ICLR 2025) con N = 4, 16 y 64 rollouts, auto-conocimiento epistémico P(IK) de Kadavath, extremización de log-odds de Satopaa-Tetlock y regresión cuantil conformalizada (CQR) de Romano/Barber para datos no intercambiables. La recuperación es vectorless, mediante un árbol jerárquico PageIndex sobre 48.609 ítems de research ledger y 110.960 nodos de texto completo.

No se especifican datos de entrenamiento propios: no hay número de tokens, composición de dataset ni detalles de RLHF o DPO. El autor no publica pesos, checkpoints ni configuración de entrenamiento.

## Capacidades

- Razonamiento matemático de posgrado: resolución de problemas de análisis, optimización, EDPs y mecánica de fluidos con verificación de operadores compilados.
- Transporte óptimo y conservación de marginales: cálculo y comprobación de matrices de transporte con tolerancias numéricas declaradas.
- Filtros espectrales y simulación: filtros Hou-Li de orden 36 aplicados a problemas de Navier-Stokes.
- Generación de código: tag explícito `code-generation`, orientado a implementaciones numéricas y pipelines de cálculo.
- Tool calling / function calling: soporte de `tool_calls` con reparación gramatical determinista Auto-Exacto, con más del 95% de ejecuciones válidas en el primer turno (autoinformado).
- Agentes multi-paso: diseñado para bucles largos en OpenCode, Cline, Roo Code, Cursor y MCP sin romper esquemas JSON.
- Calibración de incertidumbre: intervalos conformes con cobertura empírica del 91,06% en intervalos del 90% sobre 6.747 resultados (autoinformado), y señalización explícita de información faltante cuando la incertidumbre epistémica supera el umbral.
- Razonamiento adversarial: consejo interno de cuatro voces que impugna premisas defectuosas del usuario.
- Recuperación documental jerárquica: navegación AST sobre árboles de documentos y grafos de llamadas, con 10/10 de recall multi-hop en 0,504 ms en su test interno.
- Multilingüe: limitado a inglés según la model card.

## Casos de uso

- Verificación de cálculos numéricos en producción: el modelo puede comprobar conservación de marginales y condiciones de contorno en pipelines de simulación antes de devolver resultados, gracias a los operadores de transporte óptimo y residualización ortogonal integrados.
- Asistencia en investigación matemática: resolución de problemas de posgrado con trazabilidad de los operadores aplicados, útil para revisar demostraciones y detectar pasos inválidos en borradores.
- Agentes de codificación autónomos: su reparación gramatical de tool calls permite integrarlo en Cline, Roo Code o Cursor para tareas de varios pasos donde un JSON malformado abortaría la ejecución.
- Estimación de riesgo con intervalos calibrados: los intervalos conformes con cobertura declarada del 91,06% permiten usar el modelo en informes cuantitativos donde se necesita una banda de incertidumbre explícita en lugar de una cifra puntual.
- Auditoría de premisas en consultoría técnica: el consejo adversarial (Skeptic y Critic) puede emplearse para impugnar supuestos arquitectónicos antes de comprometer un diseño, señalando la información faltante en lugar de asumirla.
- Recuperación sobre documentación técnica extensa: el índice jerárquico vectorless permite consultar manuales, papers y bases de código preservando referencias cruzadas entre capítulos, adecuado para soporte interno de ingeniería.
- Generación de código numérico: implementación de rutinas de álgebra lineal, EDPs y optimización con verificación de resultados intermedios, apropiada para prototipado científico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks verificables en la información disponible. La model card incluye únicamente métricas autoinformadas y sin artefactos de reproducción: cobertura conformal del 91,06% en intervalos del 90% sobre 6.747 resultados, más del 95% de tool calls válidos en el primer turno, 10/10 de recall multi-hop en 0,504 ms y una energía de Dirichlet de 0,006686. El tag `livebench` aparece en los metadatos, pero no se acompaña de ninguna puntuación.

| Benchmark | Resultado | Nota |
|---|---|---|
| Cobertura conformal (intervalos 90%) | 91,06% | Autoinformado, 6.747 resultados |
| Tool-call schema validity (primer turno) | >95% | Autoinformado |
| Recall multi-hop (test interno) | 10/10 en 0,504 ms | Autoinformado |
| MMLU / HumanEval / GSM8K | no disponible | Sin datos publicados |

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica. El servicio se consume vía API compatible con OpenAI; no se distribuyen pesos ni se puede ejecutar localmente.
- GPU recomendadas: no disponible. La infraestructura de inferencia no se documenta.
- Ejecución en GPU de consumo: no es posible, al no existir artefactos descargables.
- Opciones de despliegue: cliente compatible con la API de OpenAI (SDK de Python, curl, integraciones tipo OpenCode, Cline, Roo Code, Cursor o MCP). No hay soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible. La única cifra publicada es el tiempo de navegación del índice (0,504 ms), que no representa la latencia de extremo a extremo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Distribución | Notas |
|---|---|---|---|---|---|
| stealth-skeleton/skeleton-math-pro | no disponible | 128K | Apache-2.0 (solo documentación) | API compatible con OpenAI | Orquestación sobre modelos frontera; métricas autoinformadas |
| Qwen2.5-Math-72B-Instruct | 72B | 4K (extensible) | Apache-2.0 | Pesos en Hugging Face (safetensors, GGUF) | Modelo matemático abierto con evaluación publicada |
| DeepSeek-Math-7B-Instruct | 7B | 4K | MIT | Pesos en Hugging Face | Modelo matemático abierto, ejecutable en GPU de consumo |
| Llama-3.3-70B-Instruct | 70B | 128K | Llama 3.3 Community License | Pesos en Hugging Face | Uso general con contexto largo y tool calling |

La comparación es estructuralmente asimétrica: los tres alternativos son modelos con pesos verificables y benchmarks reproducibles, mientras que skeleton-math-pro es un servicio cerrado cuya única licencia abierta cubre la documentación.

## Limitaciones y advertencias

- No se distribuyen pesos: cualquier evaluación independiente es imposible; todas las métricas proceden del autor y no son verificables.
- La licencia Apache-2.0 se aplica exclusivamente a la documentación y configuración del repositorio, no al modelo ni al servicio, cuyos términos de uso reales dependen del proveedor de la API.
- Dependencia de cuatro modelos frontera de terceros no identificados con nombres comerciales verificables (Google Argon 4, Anthropic Claude Fable 5, Anthropic Claude Opus 5.5, OpenAI Astra); la disponibilidad y el comportamiento del servicio pueden cambiar sin aviso.
- Idiomas: solo inglés declarado; no hay soporte documentado de castellano ni de otras lenguas.
- Riesgo de alucinación: aunque el diseño incorpora verificación de operadores y calibración conforme, no hay evidencia externa de que estas capas funcionen como se describe; la confianza declarada en las respuestas no debe tomarse como garantía.
- Sesgos: no se documenta ninguna evaluación de sesgos, toxicidad o robustez adversarial.
- Sin datos de entrenamiento, sin model card técnica, sin informe de evaluación y sin historial de versiones.
- Repositorio sin descargas ni interacciones (0 descargas, 0 likes) en el momento de la consulta, lo que impide contrastar experiencia de uso de la comunidad.
- Para producción: no se documentan SLA, límites de tasa, política de retención de datos ni cumplimiento normativo; conviene tratarlo como servicio experimental.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/stealth-skeleton/skeleton-math-pro
- Endpoint en OpenRouter: mencionado en la model card, sin URL directa disponible
- Paper de Snell et al. (ICLR 2025) sobre test-time compute: no disponible enlace directo en la información proporcionada
- Referencia a Kadavath et al. sobre P(IK): no disponible enlace directo
- Referencia a Romano/Barber sobre CQR: no disponible enlace directo
- Documentación de la API de OpenAI (formato compatible): https://platform.openai.com/docs/api-reference
