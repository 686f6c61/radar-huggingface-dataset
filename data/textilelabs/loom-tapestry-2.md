# textilelabs/Loom-Tapestry-2

## Resumen

Loom Tapestry 2 es un modelo de lenguaje pequeño de 22,8 millones de parámetros desarrollado por Textile Labs, entrenado desde cero con pesos inicializados aleatoriamente en una CPU de escritorio de 2013. Su arquitectura es un transformer tipo Llama de 20 capas con una ventana de contexto de 768 tokens. El modelo está diseñado para resolver un problema específico: la atribución de respuestas en sistemas de recuperación aumentada (RAG). A diferencia de otros modelos pequeños, Tapestry 2 distingue tres registros: responde desde un resultado recuperado (indicando que ha tenido que mirarlo), responde desde su entrenamiento, o admite que no puede saber algo. Esta capacidad de honestidad calibrada lo hace relevante para agentes y asistentes que necesitan saber cuándo una respuesta proviene de una fuente externa. Es el primer modelo de la gama Tapestry, dentro de la jerarquía Flash → Spark → Weave → Tapestry, y se distribuye bajo licencia MIT.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama (decoder-only) |
| Parámetros totales | 22.827.840 (22,8 M) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 768 tokens |
| Tipos de cuantización | GGUF |
| Idiomas soportados | Inglés |
| Licencia | MIT |
| Formato de pesos | Safetensors, GGUF |

## Arquitectura y entrenamiento

Loom Tapestry 2 es un transformer decoder-only de 20 capas con 22,8 millones de parámetros, entrenado desde cero con pesos inicializados aleatoriamente. Según las etiquetas del repositorio, el entrenamiento se realizó con el optimizador Muon y en una CPU de escritorio de 2013, sin aceleración por GPU ni ajuste fino sobre una base preentrenada. El corpus de entrenamiento no se detalla en la información disponible, pero la model card indica que es la misma familia de corpus que las generaciones anteriores de la serie Loom.

La innovación principal es su sistema de doble modo: con `<tools:off>` el modelo funciona como asistente conversacional, y con `<tools:on>` emite una consulta de búsqueda en formato `<lookup>consulta</lookup>` y detiene la generación para que un agente externo realice la búsqueda y devuelva el resultado en un bloque `<result>`. Este diseño permite separar la decisión de recuperación de la respuesta final, y añade un registro de atribución que indica explícitamente cuándo una respuesta proviene de una fuente recuperada.

## Capacidades

- Generación de texto conversacional breve, con identidad definida y límites claros.
- Tool use / function calling: emite `<lookup>consulta</lookup>` y detiene la generación cuando las herramientas están activadas.
- Recuperación aumentada: acepta un bloque `<result>` y responde basándose en el texto recuperado.
- Atribución de respuestas: distingue entre respuestas dadas desde un resultado recuperado (dice que ha tenido que mirarlo), respuestas desde entrenamiento, y respuestas que no puede saber ("No sé eso sobre ti").
- Honestidad calibrada: nunca afirma una búsqueda que no ha realizado (16/16 en la batería de aceptación).
- Soporte multilingüe: solo inglés, según la etiqueta de idioma.
- No incluye visión ni audio.

## Casos de uso

- Asistente de búsqueda en pipelines de RAG: el modelo decide cuándo es necesaria una búsqueda, formula la consulta y lee el resultado para responder con atribución, lo que permite al usuario saber que la respuesta proviene de una fuente externa.
- Atención al cliente con base de conocimiento: con `<tools:on>`, consulta documentos internos y responde indicando que ha tenido que mirarlo, lo que ayuda a generar confianza en la respuesta.
- Agentes con herramientas: el modelo emite una consulta de búsqueda y se detiene, permitiendo que el agente ejecute la llamada y devuelva el resultado para continuar la conversación.
- Demostración educativa de modelos pequeños: sirve para ilustrar cómo se entrena un transformer desde cero en CPU y cómo se implementa un sistema de honestidad calibrada.
- Prototipos de sistemas de atribución: útil para experimentar con técnicas de "calibrated honesty" en modelos de lenguaje pequeños, especialmente en entornos sin acceso a GPU.
- Integración en Ollama para entornos sin GPU: al ser tan pequeño, puede ejecutarse en cualquier máquina, incluso sin aceleración, para pruebas locales y desarrollo.
- Extracción de información de textos recuperados: dado un `<result>`, extrae el span relevante, aunque con una tasa de error de aproximadamente un tercio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card presenta una batería de aceptación con prompts escritos a mano y fuera del generador de entrenamiento, puntuada por contenido:

| Prueba | Resultado |
|---|---|
| Sin atribución falsa | 16/16 |
| Sin fuga de `<lookup>` con tools off | 28/28 |
| Autoterminación sin Modelfile | 12/12 |
| Respuesta desde un `<result>` suministrado | 5/5 |
| Identidad — nombra Tapestry | 11/12 |
| Atribución presente tras una búsqueda real | 4/5 |
| Identidad bajo MAYÚSCULAS / errores tipográficos / "?" | 10/12 |
| Conversación de 5 turnos se mantiene en el tema | 4/5 |
| Admite un no-saber | 4/8 |
| Pregunta de seguimiento respondida desde el mismo resultado | 2/5 |
| Dice que el resultado no lo contiene | 1/5 |
| Decisión de herramienta con tools on | 10/20 |
| Total | 107/133 · 80,5% |

Comparación con la generación anterior de la serie Loom:

| Modelo | Parámetros | Pérdida de validación | Precisión de validación |
|---|---|---|---|
| Loom Spark 2 | 19,9 M | 2,692 | 0,536 |
| Loom Weave 2 Flash | 19,9 M | 2,254 | 0,580 |
| Loom Tapestry 2 | 22,8 M | 1,963 | 0,622 |

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 22,8 M de parámetros, la inferencia cabe en menos de 0,5 GB de VRAM en FP16; con cuantización GGUF, aún menos.
- GPU recomendadas: no requiere GPU; cualquier GPU moderna (RTX 3060, A100, H100) es más que suficiente, aunque no es necesaria.
- Cabe en consumer GPU: sí, en todas las GPU de consumo, y también en CPU.
- Opciones de despliegue: Ollama, llama.cpp (con cuantización GGUF), Transformers con TGI, vLLM.
- Latencia y throughput: no disponible; al ser un modelo tan pequeño, la latencia es muy baja en CPU y GPU.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables de otros desarrolladores en la información proporcionada. La comparación disponible es con los modelos anteriores de la misma serie Loom:

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Loom Spark 2 | 19,9 M | No disponible | MIT | HuggingFace |
| Loom Weave 2 Flash | 19,9 M | No disponible | MIT | HuggingFace |
| Loom Tapestry 2 | 22,8 M | 768 tokens | MIT | HuggingFace |

## Limitaciones y advertencias

- Casi no tiene conocimiento del mundo; con `<tools:off>` declina preguntas factuales, lo cual es intencionado.
- Con `<tools:on>`, la identidad y las preguntas personales se convierten en búsquedas; la puntuación en ese caso es 0/10.
- Puede responder desde un `<result>` aunque la respuesta no esté realmente en el texto recuperado; solo acierta en 1 de 5 casos al decir que el resultado no lo contiene.
- La extracción de spans es incorrecta aproximadamente un tercio de las veces.
- No es un compañero de chat; no improvisa ni mantiene conversaciones libres.
- Solo soporta inglés.
- No se han documentado sesgos específicos, pero al ser un modelo tan pequeño su conocimiento es limitado.
- Licencia MIT permite uso comercial, pero las limitaciones funcionales deben tenerse en cuenta para producción.

## Enlaces

- HuggingFace: https://huggingface.co/textilelabs/Loom-Tapestry-2
- Página de textilelabs en HuggingFace: https://huggingface.co/textilelabs
- No se han encontrado papers, blogs o demos adicionales en la búsqueda web.
