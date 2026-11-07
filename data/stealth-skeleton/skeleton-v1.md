# stealth-skeleton/skeleton-v1

## Resumen

skeleton-v1 es un endpoint de inferencia distribuido por Stealth-Skeleton Research bajo una interfaz compatible con la API de OpenAI. No se distribuyen pesos descargables: el repositorio de Hugging Face actúa únicamente como tarjeta de modelo y centro de documentación del servicio alojado en OpenRouter. El sistema se presenta como una "espina dorsal cognitiva y matemática" que orquesta cuatro modelos frontera (Google Argon 4 2M, Anthropic Claude Fable 5 1M, Anthropic Claude Opus 5.5 1M y OpenAI Astra 512K) sobre una capa de razonamiento de cinco etapas.

La propuesta técnica se apoya en cuatro pilares declarados: ejecución de operadores matemáticos compilados (21.419 operadores en 26 capas de razonamiento), un consejo adversarial de cuatro voces con resolución mediante cohomología de haces celulares, calibración conformal de la incertidumbre y recuperación jerárquica sin vectores sobre árboles AST. El contexto declarado es de 128K tokens y el soporte de idiomas se limita al inglés según los metadatos del repositorio.

La relevancia del proyecto es discutible desde el punto de vista de la reproducibilidad: todos los benchmarks e indicadores de rendimiento son autodeclarados, no hay pesos publicados ni paper revisado por pares, y el nombre de los modelos subyacentes no se corresponde con ningún modelo público conocido a fecha de la información disponible. Debe evaluarse como un servicio propietario cerrado con envoltorio documental abierto, no como un modelo open source.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Orquestación multi-modelo sobre cuatro modelos frontera (Google Argon 4 2M, Anthropic Claude Fable 5 1M, Anthropic Claude Opus 5.5 1M, OpenAI Astra 512K) con capa de razonamiento de 5 etapas; detalles internos no disponibles |
| Parametros totales | no disponible (no se publican pesos) |
| Parametros activos | no disponible |
| Longitud de contexto | 128K tokens (declarado en la model card) |
| Tipos de cuantizacion | no disponible (servicio API; no se expone cuantización) |
| Idiomas soportados | en (inglés) según metadatos; no se declaran otros idiomas |
| Licencia | Apache-2.0 (aplica solo a documentación y ficheros de configuración del repositorio; el modelo es propietario y solo accesible vía API) |
| Formato de pesos | no disponible (no hay pesos descargables; inferencia solo vía endpoint compatible con OpenAI) |

## Arquitectura y entrenamiento

No se describe un transformer entrenado por el autor. La arquitectura declarada es una capa de orquestación ("Sovereign Cognitive & Mathematical Execution Spine") que enruta cada consulta a través de cuatro modelos frontera de terceros y aplica un pipeline de cinco etapas antes de devolver la respuesta. La primera etapa mapea la consulta a una máscara de estado contextual de 288 bits y la enruta por 26 capas de razonamiento (L01–L26) respaldadas por 21.419 operadores matemáticos compilados, con verificaciones numéricas declaradas (conservación marginal Sinkhorn-Knopp a 1,39e-16 en norma L1, residualización ortogonal Frisch-Waugh-Lovell por debajo de 1e-15, filtros espectrales Hou-Li de orden 36 y 753 demostraciones de posgrado en matemáticas y Navier-Stokes).

La segunda etapa implementa un consejo adversarial de cuatro voces (Arquitecto, Escéptico, Pragmático, Crítico) con un "cortafuegos" de 80 reglas heurísticas, cuyas discrepancias se resuelven mediante el Teorema 7 de cohomología del laplaciano de haces celulares (energía de Dirichlet 0,006686, consenso de sección global H^0) y encogimiento de James-Stein con parte positiva (|Δ log-odds| ≤ 0,35). La tercera etapa combina escalado de test-time compute-optimal de Snell et al. (ICLR 2025) con N = 4 → 16 → 64 rollouts, autoconocimiento epistémico P(IK) de Kadavath, extremización de log-odds de Satopaa-Tetlock y regresión cuantil conformalizada no intercambiable (CQR) de Romano/Barber, con una cobertura empírica declarada del 91,06 % en intervalos del 90 % sobre 6.747 resultados resueltos. La cuarta etapa es un RAG jerárquico sin vectores sobre árboles AST (PageIndex) con 48.609 ítems de ledger y 110.960 nodos de texto completo, y la quinta aplica "Auto-Exacto", un mecanismo determinista de reparación de gramática en payloads de `tool_calls`.

No se especifican volúmenes de tokens de entrenamiento, composición del dataset, ni si hubo RLHF o DPO sobre un modelo propio, porque no existe un modelo propio entrenado por el autor según la información disponible.

## Capacidades

- Generación de texto y razonamiento matemático con verificación de operadores compilados (álgebra lineal, optimización, transporte óptimo, ecuaciones en derivadas parciales).
- Razonamiento cuantitativo y físico con comprobación de leyes de conservación y condiciones de contorno antes de emitir la respuesta final.
- Generación de código y soporte declarado para bucles de agente multi-paso en entornos como OpenCode, Cline, Roo Code, Cursor y MCP.
- Tool calling / function calling con reparación determinista de gramática JSON en cada payload de `tool_calls` (fiabilidad declarada superior al 95 % en el primer turno, autodeclarada).
- Recuperación jerárquica sin vectores sobre árboles de documentos y grafos de llamadas (PageIndex AST), con recuperación multi-salto declarada de 10/10 en 0,504 ms en pruebas internas.
- Calibración de incertidumbre mediante intervalos conformales y modo de "disciplina de pase": cuando la incertidumbre epistémica supera el umbral, el sistema declara la información faltante en lugar de responder.
- Razonamiento adversarial multi-voz para detectar premisas defectuosas y proponer arquitecturas corregidas.
- Capacidades multimodales, de audio o de visión: no disponibles según la información proporcionada.
- Multilingüismo: limitado al inglés según los metadatos del repositorio.

## Casos de uso

- Verificación de cálculos científicos y de ingeniería: el pipeline ejecuta operadores compilados de álgebra lineal, EDP y transporte óptimo antes de devolver la respuesta, lo que permite usar el endpoint como segunda opinión sobre derivaciones numéricas en informes técnicos, con la salvedad de que las garantías son autodeclaradas y no auditadas externamente.
- Revisión adversarial de arquitecturas de software: el consejo de cuatro voces (Arquitecto, Escéptico, Pragmático, Crítico) está diseñado para detectar supuestos erróneos en propuestas de diseño y proponer correcciones, útil en revisiones de RFC o documentos de diseño antes de comprometer recursos.
- Agentes de código en producción: el mecanismo Auto-Exacto repara payloads de `tool_calls` antes de enviarlos, lo que reduce fallos en cadenas de 20 pasos típicas de OpenCode, Cline o Cursor cuando un modelo base emite JSON mal formado.
- Asistentes sobre bases de código grandes: el RAG jerárquico AST navega grafos de llamadas y referencias cruzadas sin troceado por tokens, adecuado para responder preguntas que cruzan definiciones de distintos módulos de un mismo repositorio.
- Estimación de riesgo con intervalos calibrados: la combinación de CQR y extremización de log-odds permite pedir intervalos de confianza explícitos en lugar de porcentajes inventados, útil en análisis de riesgo financiero o de fiabilidad de sistemas donde la calibración importa más que la fluidez.
- Evaluación de premisas defectuosas en prompts de usuario: el modo de disciplina de pase devuelve la información faltante en lugar de alucinar una respuesta cuando la incertidumbre supera el umbral, apropiado para triaje automatizado donde un falso positivo es costoso.
- Investigación asistida sobre literatura técnica: el índice jerárquico sobre 48.609 ítems y 110.960 nodos permite recuperación multi-salto sobre documentación extensa, útil para equipos que consultan manuales y papers de forma iterativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks verificables de forma independiente en la información disponible. La model card incluye únicamente métricas autodeclaradas y sin protocolo reproducible:

| Metrica | Valor declarado | Fuente |
|---|---|---|
| Cobertura empírica de intervalos conformales al 90 % | 91,06 % sobre 6.747 resultados resueltos | Autodeclarado |
| Fiabilidad de tool calling en primer turno | > 95 % de esquemas válidos | Autodeclarado |
| Recuperación multi-salto PageIndex | 10/10 en 0,504 ms (test interno) | Autodeclarado |
| Conservación marginal L1 (Sinkhorn-Knopp) | 1,39e-16 | Autodeclarado |
| Residualización ortogonal Frisch-Waugh-Lovell | < 1e-15 | Autodeclarado |
| Energía de Dirichlet (cohomología de haces) | 0,006686 | Autodeclarado |
| LiveBench | mencionado como tag, sin cifra publicada | No disponible |

No hay resultados de MMLU, HumanEval, GSM8K ni de ningún benchmark estándar comparable entre modelos. Cualquier evaluación de rendimiento relativo exigiría una auditoría externa que no consta en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo no se distribuye en pesos y solo es accesible como endpoint remoto compatible con la API de OpenAI.
- GPU recomendadas: no disponibles; el autor no publica la infraestructura subyacente.
- Ejecución en GPU de consumo: no es posible, al no existir pesos descargables.
- Opciones de despliegue: cliente HTTP compatible con la API de OpenAI (SDK oficial de OpenAI, LangChain, LlamaIndex, clientes MCP). No es compatible con vLLM, llama.cpp, Ollama ni TGI porque no hay artefactos de pesos.
- Latencia y throughput: no disponibles. El pipeline declara hasta 64 rollouts en la etapa de test-time scaling, lo que sugiere latencias variables según la ruta de razonamiento, pero no se publican percentiles ni cifras de tokens por segundo.

## Comparativa con modelos similares

La categoría real del producto es la de agregador/orquestador multi-modelo con API compatible con OpenAI, no la de un modelo base. La comparación con modelos de pesos abiertos no es directa porque no hay pesos ni arquitectura publicada. Se ofrece una comparación cualitativa con alternativas del mismo segmento funcional:

| Producto | Tipo | Contexto | Pesos | Licencia | Rendimiento verificable |
|---|---|---|---|---|---|
| skeleton-v1 | Orquestador multi-modelo propietario vía API | 128K (declarado) | No | Apache-2.0 solo para documentación | No; métricas autodeclaradas |
| OpenRouter (enrutador genérico) | Agregador de modelos de terceros | Depende del modelo | No | Depende del modelo | Sí, por modelo subyacente |
| Together AI / Fireworks | Plataforma de inferencia de modelos abiertos | Depende del modelo | No (API) | Depende del modelo | Sí, benchmarks de los modelos servidos |
| Modelos abiertos de 70B–120B (p. ej. Llama, Qwen, Mistral) | Modelo base con pesos | 32K–128K típicamente | Sí (safetensors, GGUF) | Licencias abiertas o comunitarias | Sí, benchmarks públicos reproducibles |

La diferencia principal frente a las alternativas es la ausencia de pesos, de paper y de benchmarks estándar, lo que impide validar las afirmaciones de rendimiento de forma independiente.

## Limitaciones y advertencias

- Todos los benchmarks e indicadores de calidad son autodeclarados y no han sido auditados por terceros; no hay paper, código de evaluación ni protocolo reproducible.
- No se distribuyen pesos: el repositorio es solo documentación. La licencia Apache-2.0 cubre los ficheros del repositorio, no el servicio ni los modelos subyacentes, cuyo uso comercial queda sujeto a los términos de OpenRouter y de los proveedores frontera.
- Los modelos base citados (Google Argon 4 2M, Anthropic Claude Fable 5 1M, Anthropic Claude Opus 5.5 1M, OpenAI Astra 512K) no se corresponden con ningún modelo público conocido a fecha de la información disponible, lo que impide verificar la cadena de custodia y las condiciones de uso.
- Riesgo de alucinación no cuantificado: las métricas de calibración conformal declaradas (91,06 % de cobertura) no se han validado de forma independiente y no cubren todos los dominios de consulta.
- Idiomas: solo inglés declarado; no hay soporte documentado de castellano ni de otras lenguas, lo que limita su uso en productos dirigidos al mercado hispanohablante.
- Contexto: 128K declarado, sin información sobre degradación en ventanas largas ni sobre estrategias de compresión.
- Dependencia de terceros: el servicio depende de cuatro proveedores externos; una caída o un cambio de política de cualquiera de ellos afecta directamente a la disponibilidad y al comportamiento del endpoint.
- Reproducibilidad: sin pesos ni código de inferencia, no es posible replicar resultados ni auditar sesgos; cualquier afirmación sobre sesgos del modelo es especulativa.
- Cero retención de datos: se declara "strict zero retention", pero no se aportan detalles técnicos ni certificaciones que lo respalden.
- Idoneidad en producción: la combinación de métricas no verificadas, dependencia multi-proveedor y ausencia de SLA público aconseja tratarlo como prototipo o herramienta de evaluación, no como componente crítico sin pruebas propias.

## Enlaces

- Hugging Face: https://huggingface.co/stealth-skeleton/skeleton-v1
- Endpoint en OpenRouter: no disponible en la información proporcionada (la model card lo menciona sin enlace directo)
- Paper técnico: no disponible
- Repositorio de código: no disponible
- Demo: no disponible
- Blog del autor: no disponible
