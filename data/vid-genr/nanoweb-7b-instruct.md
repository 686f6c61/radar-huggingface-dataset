# vid-GENR/NanoWeb-7B-Instruct

## Resumen

NanoWeb-7B-Instruct es un ajuste fino de Qwen/Qwen2.5-7B-Instruct orientado a ser un agente de navegador autónomo. Lo publica el usuario vid-GENR en HuggingFace bajo licencia Apache-2.0 y se distribuye principalmente en formato GGUF para llama.cpp y Ollama. Su propósito es ejecutar tareas de investigación web multi-paso: navegar sitios, extraer datos estructurados, comparar precios, consultar documentación técnica y sintetizar respuestas con fuentes citadas, todo ello mediante llamadas a funciones predefinidas.

La versión publicada corresponde a la "Fase 2" del proyecto y se ha entrenado sobre 8.280 trayectorias reales de navegación ("web flight-recorder") que contienen aproximadamente 31.000 llamadas a herramientas, repartidas en seis dominios: comercio electrónico, investigación académica y técnica, finanzas, noticias y geopolítica, viajes y síntesis multi-salto. El modelo conserva la arquitectura transformer densa de Qwen2.5 y sus 7.615.616.512 parámetros, por lo que no introduce cambios estructurales respecto al base: la especialización proviene únicamente del ajuste supervisado.

El rasgo más controvertido es la "abliteración" de rechazos: se eliminan matemáticamente las representaciones de negativa en las capas 14 a 20 mediante proyección ortogonal sobre las matrices de salida de atención y de proyección descendente del MLP. El autor lo justifica como necesario para "investigación soberana" y automatización de DOM sin falsos rechazos, pero implica que el modelo no incorpora las salvaguardas del Qwen2.5 original. Es un modelo con 0 descargas y 0 likes en el momento de redactar esta ficha, sin benchmarks publicados ni validación independiente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (decoder-only), heredada de Qwen2.5-7B-Instruct; sin cambios estructurales |
| Parámetros totales | 7.615.616.512 (7,62 mil millones) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la model card; el modelo base Qwen2.5-7B-Instruct declara 32.768 tokens nativos (131.072 con YaRN) |
| Tipos de cuantización | GGUF Q4_K_M (~4,5 GB) y GGUF Q8_0 (~7,5 GB); el autor no publica otras variantes |
| Idiomas soportados | No disponible (no declarados por el autor; el modelo base es multilingüe) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (Q4_K_M y Q8_0, con manifiestos .sha256); los metadatos de HuggingFace reportan parámetros provenientes de safetensors, pero no se confirma la publicación de pesos FP16 completos (el repo ocupa 4,7 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-7B-Instruct, un transformer decoder-only denso con normalización RMSNorm, atención con RoPE, sesgo en las proyecciones QKV y FFN tipo SwiGLU. NanoWeb no modifica la topología: el trabajo se concentra en el ajuste supervisado sobre trayectorias de agente y en la intervención mecánica sobre las capas medias. El entrenamiento se realizó sobre 8.280 trayectorias multi-dominio con aproximadamente 31.000 llamadas a herramientas, adaptadas al esquema nativo de function calling de Hermes. La model card no especifica el número total de tokens de entrenamiento, la composición exacta del dataset, ni si hubo fases de RLHF o DPO adicionales; tampoco detalla hiperparámetros, duración del ajuste ni la procedencia de las trayectorias (si son grabaciones reales, sintéticas o mixtas).

La innovación técnica declarada es la abliteración por proyección ortogonal de subespacio: se estima una dirección de rechazo $\hat{r}$ y se aplica $W \leftarrow (I - \hat{r}\hat{r}^T)W$ de forma in-place sobre las proyecciones descendentes del MLP y las proyecciones de salida de la auto-atención en las capas 14 a 20. El conjunto de herramientas está fijado en seis funciones: `fetch_page(url)` con poda de elementos interactivos numerados del DOM, `read_page(url, chunk_index)` para lectura por fragmentos, `find_in_page(url, pattern)` con búsqueda por regex y palabra clave, `browser_action(action, element_id, text, key, value)` para click, type, select y press_enter, `web_search(query)` con múltiples proveedores y `finish_research(answer, sources)` para la síntesis final. El autor no documenta ablaciones, comparación contra el base sin ajustar ni evaluación cuantitativa del efecto de la abliteración sobre capacidades generales.

## Capacidades

- Generación de texto conversacional multi-turno en formato chat, heredada de Qwen2.5-7B-Instruct.
- Function calling nativo con seis herramientas de navegación preajustadas (fetch, lectura por chunks, búsqueda en página, acciones de DOM, búsqueda web y cierre con fuentes).
- Ejecución de planes de agente multi-paso: encadenamiento de búsqueda, apertura de páginas, extracción y reconciliación de fuentes antes de responder.
- Interacción con elementos dinámicos del DOM mediante identificadores numéricos, incluyendo formularios, desplegables y navegación por teclado.
- Recuperación ante errores adversariales: páginas caídas, contenido inconsistentes o bloqueos parciales durante la navegación.
- Extracción y comparación de datos estructurados: fichas de producto, especificaciones, tickers, métricas financieras, horarios y tarifas.
- Búsqueda por patrón dentro de documentos largos, con lectura fragmentada para contenido textual denso.
- Síntesis final con lista de fuentes declaradas a través de `finish_research`.
- Capacidades multilingües: no declaradas explícitamente; las hereda del modelo base en la medida en que el ajuste no las haya degradado (no verificado).
- No se declaran capacidades de visión, audio, ni modo "thinking" explícito.

## Casos de uso

- Monitorización de precios en comercio electrónico: el modelo abre fichas de producto, extrae precio, especificaciones y disponibilidad con `fetch_page` y `find_in_page`, y compara entre tiendas antes de emitir un informe con `finish_research`. Encaja porque el ajuste cubre explícitamente navegación de catálogo y extracción de especificaciones.
- Investigación académica asistida: consulta de arXiv y repositorios de GitHub, lectura por fragmentos de abstracts y README, y síntesis comparativa de varios artículos con citas. La herramienta `read_page(url, chunk_index)` está pensada para documentos densos donde una sola lectura excede el contexto útil.
- Verificación de noticias y fuentes primarias: dada una afirmación, el agente lanza búsquedas, cruza medios, localiza el documento original y devuelve la conclusión con enlaces. El dominio de "news & geopolitical tracking" está entre los seis entrenados.
- Seguimiento de indicadores financieros: consulta de cotizaciones, resultados trimestrales y métricas macroeconómicas en portales públicos, con extracción tabular y comparación temporal. Adecuado para flujos de research periódico, no para trading en tiempo real.
- Automatización de flujos de reserva y viajes: recorrido de formularios de búsqueda de vuelos y hoteles, comparación de amenidades y reconstrucción del flujo de reserva hasta el paso previo a la confirmación. La herramienta `browser_action` cubre las acciones necesarias (click, type, select, press_enter).
- Enriquecimiento de datasets y pipelines de datos: uso del modelo como extractor estructurado sobre páginas concretas dentro de un pipeline mayor, devolviendo JSON con los campos solicitados y las URLs de origen para trazabilidad.
- Auditoría de documentación técnica: navegación de documentación de APIs y frameworks para responder preguntas concretas de integración, con la ventaja de que las herramientas permiten citar la sección exacta consultada.
- Agente de recuperación ante fallos: en pipelines donde una fuente devuelve HTML inesperado o un bloqueo, el ajuste en "adversarial error recovery" permite reintentar con otra ruta o proveedor de búsqueda en lugar de abortar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K, BFCL, WebArena, Mind2Web ni ninguna otra métrica, ni comparación cuantitativa contra el modelo base. Tampoco se documenta el impacto de la abliteración sobre capacidades generales o sobre la tasa de rechazos.

## Requisitos de hardware

- VRAM estimada para inferencia: Q4_K_M ocupa ~4,5 GB de pesos; con contexto moderado (8-16K tokens) el consumo total se sitúa en el rango de 6-8 GB. Q8_0 ocupa ~7,5 GB y requiere del orden de 9-11 GB con contexto similar. Los pesos en FP16, si se publicaran, rondarían los 15,2 GB.
- GPU recomendadas: RTX 4090 o L40S para Q8_0 con contextos largos y mayor throughput; A100 40/80 GB o H100 para despliegues con batching, aunque para 7B es sobredimensionado salvo por concurrencia.
- Cabe en GPU de consumo: sí. RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 Ti/4080 y RTX 4090 ejecutan Q4_K_M con holgura y Q8_0 sin problema en las de 12 GB o más. En GPUs de 8 GB solo es viable Q4_K_M con contexto reducido.
- Opciones de despliegue: llama.cpp y Ollama son la vía natural al distribuirse en GGUF; también LM Studio y servidores compatibles con la API de OpenAI (la etiqueta `endpoints_compatible` sugiere compatibilidad con endpoints tipo TGI/vLLM, aunque los GGUF en vLLM tienen soporte limitado y experimental). Para servir en FP16 con vLLM o TGI haría falta disponer de pesos safetensors, cuya publicación no está confirmada.
- Latencia y throughput: no publicados por el autor. Como referencia orientativa no verificada para este modelo concreto, un 7B en Q4_K_M suele moverse en el orden de 100-140 tokens/s en RTX 4090 y 30-50 tokens/s en RTX 3060 con llama.cpp; en tareas de agente el cuello de botella real es la latencia de red de las llamadas a herramientas, no la generación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NanoWeb-7B-Instruct | 7,62 B (denso) | No disponible en la card; base con 32.768 nativos | Agente de navegador con 6 herramientas, sin rechazos | Apache-2.0 | GGUF Q4_K_M y Q8_0 en HuggingFace; sin benchmarks ni validación |
| Qwen2.5-7B-Instruct | 7,62 B (denso) | 32.768 nativos (131.072 con YaRN) | Asistente generalista con function calling | Apache-2.0 | Amplia: safetensors, GGUF, AWQ, GPTQ; ecosistema maduro y benchmarks públicos |
| Llama-3.1-8B-Instruct | 8,03 B (denso) | 128.000 tokens | Asistente generalista y tool use | Llama 3.1 Community License | Muy amplia; licencia con restricciones de uso y cláusula de nomenclatura |
| Qwen2.5-Coder-7B-Instruct | 7,62 B (denso) | 32.768 nativos | Código, agentes de IDE y reparación | Apache-2.0 | Amplia; benchmarks de código publicados |

Frente al base Qwen2.5-7B-Instruct, el diferencial es el ajuste en trayectorias de navegación y la eliminación de rechazos, a cambio de perder las salvaguardas y de carecer de evaluación pública. Frente a Llama-3.1-8B-Instruct, NanoWeb ofrece la licencia Apache-2.0 y una ventana de contexto presumiblemente menor. No se dispone de datos para comparar rendimiento real en tareas de agente con ninguno de ellos.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay ninguna métrica publicada que permita estimar calidad, tasa de éxito en tareas web ni degradación respecto al modelo base. Cualquier decisión de producción basada en la model card es a ciegas.
- La abliteración elimina deliberadamente los mecanismos de rechazo en las capas 14-20. El modelo puede acceder o reproducir contenido que el Qwen2.5 original declinaría, incluidos materiales sujetos a restricciones legales o de derechos de autor. No es apto para despliegues orientados al público sin filtros externos.
- Riesgo de alucinación en la síntesis final: al combinar fuentes heterogéneas, el modelo puede atribuir datos incorrectos a una URL. La herramienta `finish_research` devuelve fuentes, pero nada garantiza que el contenido citado exista en ellas; conviene verificar programáticamente.
- Riesgo elevado de inyección de prompt: el modelo consume HTML de sitios de terceros y ejecuta acciones sobre el DOM. Contenido malicioso en una página puede redirigir el plan del agente. Se recomienda sandbox de navegador, lista blanca de dominios y confirmación humana en acciones con efectos (formularios, compras, envíos).
- El scraping automatizado puede vulnerar los términos de servicio de los sitios objetivo, el robots.txt o la normativa de protección de datos. La licencia Apache-2.0 cubre el modelo, no el uso que se haga de él contra terceros.
- Idiomas no declarados y sin evaluación: el ajuste se hizo sobre trayectorias cuya composición lingüística no se detalla; el rendimiento fuera del inglés es una incógnita, incluido el castellano.
- Contexto no especificado en la card: planificar despliegues asumiendo el límite del modelo base (32.768 tokens) y verificar empíricamente antes de usar documentos largos vía `read_page`.
- Procedencia del dataset no documentada: se desconoce si las 8.280 trayectorias son grabaciones reales, sintéticas o generadas por otro modelo, lo que afecta a la fiabilidad y a la diversidad real de dominios.
- Madurez nula: 0 descargas, 0 likes, repo de 4,7 GB con fecha de creación inusual (2026-10-23) y sin issues ni discusión pública. No hay evidencia de terceros de que el modelo funcione como se describe.
- No se publican pesos en FP16 ni adaptadores LoRA, lo que limita el reentrenamiento y el ajuste posterior a los GGUF cuantizados.
- Verificar la integridad de los GGUF con los manifiestos `.sha256` antes de desplegar; el autor los incluye, pero no hay firma ni atestación de build reproducible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vid-GENR/NanoWeb-7B-Instruct
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Repositorio de llama.cpp (runtime GGUF): https://github.com/ggml-org/llama.cpp
- Ollama (despliegue GGUF): https://ollama.com
- No se han encontrado papers, blogs, demos ni repositorios adicionales asociados a este modelo en la búsqueda web realizada; los resultados obtenidos no guardan relación con el modelo.
