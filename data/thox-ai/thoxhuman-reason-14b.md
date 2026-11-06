# Thox-ai/ThoxHuman-Reason-14B

## Resumen

ThoxHuman-Reason-14B es un paquete de configuración publicado por Thox-ai sobre los pesos sin modificar de Qwen3-14B, el modelo denso de 14.000 millones de parámetros de Alibaba Cloud. No se trata de un modelo entrenado ni ajustado: el repositorio contiene únicamente un `Modelfile` de Ollama, un manifiesto de release y un knowledge pack en JSONL con ocho entradas verificadas. El peso real de la inferencia recae en el modelo base, que Ollama descarga desde un pin concreto identificado por su digest SHA-256.

El objetivo declarado es servir de motor de razonamiento para front-ends de "DigitalHuman": aplicaciones que suministran en tiempo de ejecución una role card con la persona que el modelo debe adoptar. THOX aporta el perfil de sistema, un paquete de prompts de razonamiento empresarial y el knowledge pack que ancla las respuestas sobre la plataforma THOX. La relevancia es limitada pero concreta: demuestra un patrón de empaquetado reproducible (perfil + conocimiento versionado + pin de pesos) sobre un modelo Apache-2.0 ampliamente disponible.

Al no haber entrenamiento, el modelo hereda íntegramente las capacidades, el contexto y los sesgos de Qwen3-14B. La calidad de la persona depende por completo de la role card que inyecte la aplicación anfitriona, y el propio autor advierte que las pruebas de humo publicadas se ejecutaron sin role card, por lo que miden el perfil base y el anclaje, no una persona concreta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen3-14B; no se detalla en la model card) |
| Parametros totales | 14B (modelo base Qwen3-14B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | Carga verificada a 8.192 tokens; el contexto nativo de Qwen3-14B no se especifica en la informacion disponible |
| Tipos de cuantizacion | Distribucion via Ollama; el pin medido ocupa 9,28 GB (cuantizacion concreta no indicada) |
| Idiomas soportados | Ingles (declarado en la model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | Pesos upstream gestionados por Ollama; el repo incluye Modelfile, manifest.json y JSONL (no contiene safetensors ni GGUF propios) |

## Arquitectura y entrenamiento

No hay entrenamiento. Los pesos son byte a byte idénticos a la release upstream de Qwen3-14B, fijada al digest `sha256:bdbd181c33f2ed1b31c972991882db3cf4d192569092138a7d29e973cd9debe8` (etiqueta `qwen3:14b`, 9,28 GB). THOX no ha aplicado fine-tuning, RLHF ni DPO; su trabajo se limita al perfil de sistema, el prompt pack de razonamiento, el knowledge pack v0.1 (ocho entradas públicas verificadas en JSONL), la evaluación y el empaquetado.

La innovación técnica es de proceso, no de modelo: un manifiesto que fija la versión del perfil y del knowledge pack junto al digest del modelo base, lo que permite reproducir la build. El perfil de sistema publicado incluye un bloque explícito de anclaje (grounding) añadido tras observar que la primera versión del kit improvisaba la respuesta sobre el principio de marca. Ese bloque obliga a citar literalmente el principio de marca THOX, rechaza verificar estados operativos en vivo y marca como no verificados los datos operativos aportados por el usuario. El knowledge pack se inyecta en contexto, no se incorpora a los pesos.

## Capacidades

- Generación de texto y razonamiento en inglés, heredados de Qwen3-14B.
- Adopción de persona suministrada en tiempo de ejecución mediante role card; sin role card responde como asistente genérico de THOX.
- Anclaje a un corpus verificado: en la evaluación respondió 8 de 8 temas del knowledge pack con los hechos exigidos.
- Rechazo de trampas de topología inventada: ante la petición de verificar si MeshStack corre en tres nodos, declinó confirmar estados en vivo y remitió a las herramientas del equipo.
- Transparencia sintética configurada: el perfil indica que debe declararse sintético cuando se le pregunta con sinceridad.
- Soporte de tool calling, agentes o razonamiento multietapa: no documentado en la información disponible (depende de lo que exponga el modelo base).
- Capacidades multilingües: solo inglés declarado.

## Casos de uso

- Asistentes empresariales con persona fija: la aplicación inyecta una role card y el modelo razona y redacta manteniendo esa voz, útil para atención interna o asistentes de producto donde la consistencia de tono importa.
- Preguntas y respuestas ancladas sobre la plataforma THOX: el knowledge pack versionado permite responder con hechos verificados y citar el principio de marca literal, reduciendo la improvisación en dominios acotados.
- Front-ends de DigitalHuman: el patrón de perfil + knowledge pack encaja en productos conversacionales que necesitan una capa de configuración auditable sobre un modelo Apache-2.0 sin reentrenar.
- Prototipado rápido en local: con `ollama run` y un GPU de clase 16 GB se levanta el modelo a 8.192 tokens de contexto, suficiente para validar flujos conversacionales antes de invertir en infraestructura.
- Guardarraíles frente a alucinación operativa: el bloque de grounding sirve de plantilla para asistentes que deben negarse a afirmar estados en vivo (nodos, precios, disponibilidad) y derivar a fuentes autorizadas.
- Base para evaluaciones internas de persona: al separar pesos, perfil y conocimiento, permite medir por separado el efecto de la role card y del corpus, algo útil en equipos que comparan configuraciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card solo recoge una evaluación de humo propia, medida el 2026-11-01 en una estación x86_64 con GPU de clase 16 GB en host compartido:

| Metrica | Resultado |
|---|---|
| Carga a contexto | Éxito a 8.192 tokens |
| Huella de memoria en carga | 10,49 GB (VRAM + RAM del sistema según planificación del runner) |
| Throughput (generación larga, 2.576 tokens) | 27,67 tokens/s (suelo en host compartido) |
| Preguntas de humo de fábrica | 3 de 3 respondidas |
| Anclaje al knowledge pack | 8 de 8 temas con los hechos exigidos |

## Requisitos de hardware

- VRAM estimada: el pin medido ocupa 9,28 GB en disco y 10,49 GB de huella total en carga; con contexto de 8.192 tokens conviene reservar 12-16 GB de memoria de GPU para evitar offload a RAM del sistema.
- GPU recomendadas: A100 o H100 para producción con concurrencia; RTX 4090 (24 GB) para desarrollo y despliegue de una sola instancia.
- Cabe en GPU de consumo: sí, en tarjetas de 16 GB o más (RTX 4080, 4090, A6000); en 12 GB requerirá cuantización más agresiva u offload parcial.
- Despliegue: Ollama es la vía oficial (`ollama run Thox-ai/thoxhuman-reason-14b`); al ser pesos upstream, también es compatible con vLLM, TGI o llama.cpp usando el modelo base.
- Latencia y throughput: 27,67 tokens/s medidos en host compartido; el autor lo califica explícitamente como suelo, no como perfil de estación de trabajo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento propio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ThoxHuman-Reason-14B | 14B | 8.192 verificado en carga | No (configuración sobre Qwen3-14B) | Apache-2.0 | Ollama y HF (empaquetado) |
| Qwen3-14B | 14B | Contexto nativo de Qwen3-14B (no detallado aquí) | Sí (upstream) | Apache-2.0 | HF, Ollama, múltiples runtimes |
| Alternativas de 14B con fine-tuning de persona | 14B | Variable | Sí | Variable | Variable |

No se dispone de datos de benchmarks que permitan comparar rendimiento frente a otras alternativas; la única diferencia verificable con Qwen3-14B es la capa de configuración (perfil, prompt pack y knowledge pack), no los pesos.

## Limitaciones y advertencias

- Configuración, no entrenamiento: los pesos son la release upstream sin modificar; cualquier mejora de comportamiento proviene del perfil y del contexto inyectado.
- Sin persona fija: sin role card del anfitrión, el modelo responde como asistente genérico de THOX; la consistencia de persona es responsabilidad de la aplicación.
- Transparencia sintética configurada, no garantizada: los anfitriones no deben presentar el modelo como humano.
- Sin estado en vivo: no tiene telemetría y no puede verificar número de nodos, precios ni disponibilidad; el propio autor documenta este límite.
- Riesgo de alucinación en dominios fuera del knowledge pack: el anclaje cubre ocho entradas; fuera de ellas el comportamiento es el del modelo base.
- Idioma: solo inglés declarado; el rendimiento en castellano no está evaluado.
- Sin cualificación de dispositivo: las builds para dispositivos THOX son más pequeñas y esta ficha no avala rendimiento on-device.
- Licencia: Apache-2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base y de los datos del knowledge pack antes de redistribuir.
- Madurez: cero descargas y cero likes en el momento de la consulta; es un release muy reciente (2026-11-01) sin validación externa.

## Enlaces

- Hugging Face: https://huggingface.co/Thox-ai/ThoxHuman-Reason-14B
- Modelo base: https://huggingface.co/Qwen/Qwen3-14B
- Ejecución en Ollama: `ollama run Thox-ai/thoxhuman-reason-14b`
- Papers, blogs, repos y demos adicionales: no disponible en la información proporcionada.
