# webxos/ask-lattice-v1

## Resumen

Ask Lattice v1 (QFM, Quantum Field Machine) es un artefacto publicado en Hugging Face por el usuario webxos que no es un modelo de lenguaje en el sentido convencional, sino una aplicación web autocontenida en un único archivo HTML que orquesta un pipeline de enriquecimiento semántico, consultas OSINT concurrentes, memoria persistente en IndexedDB y llamadas a un endpoint LLM externo opcional. El autor lo presenta como una "alternativa a la atención" que no requiere GPU ni matrices de atención, y afirma alcanzar del orden de 200 tokens por segundo en el navegador, si bien esa cifra corresponde a la síntesis local de texto del propio pipeline y no a la inferencia de un transformer.

El sistema se distribuye bajo licencia MIT, con etiquetas que apuntan a un uso local-first y sin dependencias externas. La model card describe siete etapas: tokenización de hasta 12 palabras, enriquecimiento mediante dictionaryapi.dev, consulta concurrente a seis fuentes sin clave (Semantic Scholar, OpenAlex, Stack Exchange, Wikipedia, DuckDuckGo y Open Library), recuperación de "engramas" previos desde IndexedDB, etapas LLM opcionales (planificación `pre`, borrador en streaming y ensayo `post`), visualización en canvas con campo de lattice y forma de onda, y almacenamiento del resultado como engrama.

Es relevante ahora porque ejemplifica una categoría híbrida entre agente de navegador, memoria episódica local y cliente LLM ligero, pero conviene subrayar que no se han publicado pesos, arquitectura de red neuronal, parámetros ni benchmarks de razonamiento. La ficha que sigue trata el artefacto tal como está documentado, indicando "no disponible" en todo aquello que la información proporcionada no cubre.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No es un transformer; pipeline de agente en un único archivo HTML con síntesis local y endpoint LLM externo opcional. El autor lo etiqueta como "quantum-field-machine" y "attention-alternative", sin especificación técnica de la capa de síntesis |
| Parametros totales | No disponible (no se publican pesos ni recuento de parámetros) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible como ventana de atención; el prompt de entrada está limitado a 12 palabras de contenido y 400 caracteres |
| Tipos de cuantizacion | No disponible (no hay pesos que cuantizar) |
| Idiomas soportados | No disponibles; el diccionario integrado es solo en inglés, según la sección de limitaciones |
| Licencia | MIT |
| Formato de pesos | No disponible; el artefacto es un archivo HTML (`ask-lattice-v1.html`), no safetensors ni GGUF |

## Arquitectura y entrenamiento

No se describe ninguna arquitectura de red neuronal ni proceso de entrenamiento. El artefacto es una aplicación JavaScript ejecutada en el navegador que implementa un pipeline de siete etapas: tokenización (hasta 12 palabras de contenido), enriquecimiento de diccionario vía dictionaryapi.dev, fan-out OSINT concurrente a seis fuentes sin clave (Semantic Scholar, OpenAlex, Stack Exchange, Wikipedia, DuckDuckGo, Open Library), recuperación de engramas desde IndexedDB, etapas LLM (`pre` para planificación, borrador en streaming, `post` opcional para ensayo DEEP) contra un endpoint sin clave o un sintetizador local, visualización en canvas con campo de lattice y forma de onda, y persistencia del run como engrama.

Las innovaciones declaradas son de ingeniería de cliente, no de modelado: caché en dos capas (LRU en memoria de 256 entradas e IndexedDB con espacio `qfm-store`/`kv`), TTL por tipo de clave (engramas 30 días, `llm:` 3 días, negativos `w:` 5 minutos solo en IDB, positivos `w:` 7 días en ambas capas), circuit breaker por fuente (3 fallos → 45 s de enfriamiento; `TypeError` por CORS o red → 10 minutos en estado `UNSUPPORTED`) y bucle de render protegido con try/catch/finally. Se documentan siete correcciones (N-1 a N-7) relativas a caché negativa, retirada de arXiv por falta de CORS, deduplicación de llamadas en vuelo, topes de caché por etapa, guardas de severidad y atributos de accesibilidad. No consta RLHF, DPO, dataset de preentrenamiento ni número de tokens.

## Capacidades

- Orquestación de consultas OSINT concurrentes a seis fuentes sin clave, con control de tiempo de espera y circuit breaker por fuente.
- Enriquecimiento léxico mediante dictionaryapi.dev para las palabras extraídas del prompt.
- Memoria episódica persistente ("engramas") en IndexedDB con recuerdo de prompts previos relacionados.
- Etapas LLM encadenadas: planificación `pre`, borrador en streaming y ensayo `post` opcional, contra un endpoint externo sin clave o un sintetizador local.
- Visualización en tiempo real: campo de lattice y forma de onda reactiva a la actividad del pipeline.
- API JavaScript expuesta en el objeto `QFM`: `version`, `dumpState()`, `Pipeline.run(prompt)`, `Pipeline.cancel()`, `resolveWord(word)`, `rankedOsintFan(query)` y `getFanHealth()`.
- Ejecución local-first sin backend propio, con soporte declarado para Chrome/Edge 88+, Firefox 85+, Safari 14+, Opera 74+ y equivalentes móviles.
- No se documentan capacidades de tool calling genérico, agentes multi-paso arbitrarios, visión, audio de entrada ni modo de razonamiento extendido más allá del flujo descrito.

## Casos de uso

- Investigación rápida con fuentes abiertas: el pipeline lanza en paralelo consultas a Semantic Scholar, OpenAlex, Wikipedia y Stack Exchange a partir de hasta 12 palabras clave, lo que permite obtener un dossier preliminar sin escribir código de integración para cada API.
- Prototipado de agentes de navegador sin backend: al ejecutarse en un único HTML con IndexedDB, sirve para demostrar flujos de memoria episódica y recuperación de contexto sin desplegar infraestructura.
- Asistente de estudio con memoria de sesión: los engramas almacenados durante 30 días permiten recuperar consultas previas relacionadas y continuar una línea de investigación entre sesiones en el mismo navegador.
- Enriquecimiento de vocabulario técnico: `QFM.resolveWord('word')` devuelve definiciones desde dictionaryapi.dev, útil en herramientas de lectura o glosarios integrados en páginas web.
- Visualización educativa de pipelines: el campo de lattice y la forma de onda sirven para mostrar en directo el estado de las consultas, los fallos de circuit breaker y la actividad del pipeline en talleres o demos.
- Monitorización de salud de fuentes externas: `QFM.getFanHealth()` expone el estado de los breakers por fuente, aprovechable para diagnosticar problemas de CORS o de disponibilidad en integraciones de terceros.
- Generación de borradores breves asistidos por LLM: la etapa `post` produce un ensayo DEEP opcional cuando hay endpoint disponible, adecuado para resúmenes acotados y no para documentos largos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card afirma "around 200 tokens/second in a browser alone", pero no especifica hardware, metodología ni si la métrica corresponde a la síntesis local o al endpoint externo, por lo que no debe interpretarse como throughput de inferencia de un modelo de lenguaje.

## Requisitos de hardware

- No requiere GPU: la ejecución es en navegador sobre CPU.
- Navegadores soportados: Chrome/Edge 88+, Firefox 85+, Safari 14+, Opera 74+ y equivalentes móviles.
- APIs del navegador necesarias: `fetch`, `Promise`, `Map`/`Set`, `IndexedDB`, `requestAnimationFrame` y `AbortController`.
- Almacenamiento: IndexedDB (`qfm-store`/`kv`) más una caché LRU en memoria de 256 entradas; en navegación privada, IndexedDB no está disponible y la sesión pasa a memoria únicamente.
- Red: acceso a dictionaryapi.dev, Semantic Scholar, OpenAlex, Stack Exchange, Wikipedia, DuckDuckGo y Open Library, sujeto a CORS; arXiv fue retirado por falta de CORS.
- Despliegue: servir el archivo `ask-lattice-v1.html` desde cualquier hosting estático; también existe una instancia alojada en agentowl.netlify.app/asklattice.
- Latencia y throughput: no disponibles con metodología verificable; la cifra de ~200 tokens/s del autor no especifica condiciones.

## Comparativa con modelos similares

| Criterio | Ask Lattice v1 (QFM) | Agentes de navegador basados en LLM (p. ej. WebLLM) | Frameworks de agentes con herramientas (p. ej. LangChain.js) |
|---|---|---|---|
| Naturaleza | Aplicación HTML autocontenida con pipeline OSINT y memoria IndexedDB | Runtime de inferencia LLM en el navegador con pesos descargados | Biblioteca de orquestación que requiere backend o runtime propio |
| Pesos publicados | No | Sí (modelos cuantizados) | No aplica |
| Contexto | 12 palabras / 400 caracteres de prompt | Limitado por el modelo subyacente | Depende del modelo subyacente |
| GPU necesaria | No | Opcional (WebGPU/WebGL) | Depende del despliegue |
| Licencia | MIT | Variable según modelo | Variable según proyecto |
| Benchmarks publicados | No disponibles | Habitualmente sí, del modelo subyacente | No aplica |

La comparación es aproximada: no se han localizado en la información proporcionada alternativas directamente equivalentes a un pipeline OSINT empaquetado en un solo HTML.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no publica pesos, arquitectura neuronal, dataset ni proceso de entrenamiento; no debe evaluarse como un LLM.
- Sin backend propio: depende de servicios de terceros y de sus políticas de CORS; las fuentes pueden fallar o quedar bloqueadas.
- Límites de entrada estrictos: 12 palabras de contenido y 400 caracteres de prompt, insuficientes para tareas de contexto largo.
- Diccionario solo en inglés; no se declaran idiomas soportados más allá de esa restricción.
- El endpoint LLM es de sesión únicamente y opcional; sin él, la calidad del texto depende del sintetizador local, no descrito en detalle.
- En navegación privada, IndexedDB no está disponible y la memoria de engramas se pierde al cerrar la sesión.
- Riesgo de alucinación no evaluado: no hay benchmarks ni evaluación de fidelidad de las respuestas generadas.
- Sesgos no documentados: no se describe composición de datos ni evaluación de sesgos.
- La licencia MIT permite uso comercial, pero no se ofrece garantía alguna sobre el comportamiento del pipeline ni sobre el cumplimiento de los términos de las APIs de terceros consultadas.
- La fecha de creación indicada (2026-11-19) y las referencias a "webXOS 2026" deben tratarse con cautela; no se ha verificado su exactitud en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/webxos/ask-lattice-v1
- Archivo HTML del artefacto: https://huggingface.co/webxos/ask-lattice-v1/blob/main/ask-lattice-v1.html
- Demo alojada: https://agentowl.netlify.app/asklattice
- Familia OWL: https://agentowl.netlify.app
- Sitio del autor: https://webxos.netlify.app
- Repositorio del autor: https://github.com/webxos
