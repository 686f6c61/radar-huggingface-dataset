# Xenna/Lucy-4B-it-qat-Q4_K_M

## Resumen

Lucy-4B-it-qat-Q4_K_M es una publicación de pesos en formato GGUF del modelo "Lucy 4B", una variante instruction-tuned ("-it-") que ha pasado por un proceso de entrenamiento consciente de cuantización (QAT, Quantization-Aware Training) y que se distribuye ya cuantizada en Q4_K_M, además de un proyector multimodal independiente en Q8_0. El repositorio lo publica el usuario Xenna en HuggingFace y está etiquetado como `gguf`, `imatrix`, `conversational` y `endpoints_compatible`, lo que indica que está pensado para inferencia en llama.cpp y en runtimes compatibles con GGUF, así como para su uso desde endpoints compatibles con la API de OpenAI.

La model card es extremadamente escueta: declara arquitectura "Lucy", 4B de parámetros, entrenamiento instruction-tuned con QAT y compatibilidad con llama.cpp y con la pila de inferencia StelNet. No aporta información sobre licencia (remite al repositorio upstream), idiomas soportados, longitud de contexto, composición del dataset ni proceso de alineamiento. Existe además una discrepancia relevante entre metadatos: el recuento de parámetros asociado a los tensores safetensors es de 7.463.013.674 (≈7,46B), mientras que la model card indica 4B; ninguna de las dos cifras está acompañada de aclaración por parte del autor.

Por el momento, el modelo acumula 0 descargas y 0 likes, y el repo ocupa 5,9 GB. Se trata, por tanto, de una publicación reciente y sin validación externa, relevante únicamente como candidato a evaluar por quien busque un modelo pequeño, multimodal (por la presencia del `mmproj`) y ejecutable en hardware de consumo mediante cuantización Q4_K_M. Toda valoración de calidad, contexto o capacidades reales queda pendiente de verificación empírica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | "Lucy" (según la model card; sin más detalle: no disponible si es transformer denso, MoE, híbrida o SSM) |
| Parametros totales | 7.463.013.674 según el recuento safetensors; la model card declara 4B (discrepancia sin resolver, no disponible la cifra oficial) |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M para los pesos del modelo; Q8_0 para el proyector multimodal. El nombre del fichero incluye `i1`, lo que sugiere uso de importance matrix (imatrix) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card remite a un "repositorio upstream" sin enlazarlo) |
| Formato de pesos | GGUF (dos ficheros: `Lucy-4B-it-qat-q4_0.i1-Q4_K_M.gguf` y `Lucy-4B-it-qat-q4_0.mmproj-Q8_0.gguf`) |

## Arquitectura y entrenamiento

La única información disponible sobre la arquitectura es la etiqueta "Lucy" que figura en la model card, sin referencia a paper, configuración de capas, tipo de atención ni mecanismo de posicionamiento. La presencia de un fichero `mmproj` en formato GGUF es el indicador estándar en el ecosistema llama.cpp de que el modelo incorpora un codificador visual seguido de un proyector que alinea las representaciones de imagen con el espacio de tokens del modelo de lenguaje; es decir, apunta a una arquitectura multimodal tipo LLM + vision encoder. No se especifica qué codificador visual se utiliza, ni su resolución de entrada, ni si el modelo base es un transformer denso convencional.

En cuanto al entrenamiento, la model card únicamente indica "Instruction-tuned with QAT". Esto implica que el ajuste fino por instrucciones se realizó con las restricciones de una cuantización simulada durante el propio entrenamiento, de modo que los pesos distribuidos en Q4_K_M deberían degradar menos que una cuantización post-hoc equivalente. No hay datos sobre número de tokens de entrenamiento, composición del dataset, idiomas del corpus, ni sobre si hubo RLHF, DPO u otro método de alineamiento. La etiqueta `imatrix` sugiere que la cuantización final se calibró con una matriz de importancia calculada sobre un corpus de calibración, pero se desconoce dicho corpus.

## Capacidades

- Generación de texto conversacional: el tag `conversational` y el sufijo `-it-` indican ajuste por instrucciones para diálogo de múltiples turnos, aunque no hay evaluación publicada que lo confirme.
- Procesamiento multimodal de entrada: la presencia del fichero `mmproj-Q8_0.gguf` indica soporte de entrada de imágenes a través del proyector visual, presumiblemente en tareas de captioning y respuesta a preguntas sobre imágenes. El alcance exacto (una o varias imágenes, resolución, vídeo) es no disponible.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere que el modelo puede servirse a través de APIs compatibles con el esquema de OpenAI, aunque no se detalla qué implementación se ha validado.
- Tool calling / function calling: no disponible (no se menciona en la model card).
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Modo de razonamiento explícito (thinking mode): no disponible.
- Capacidades multilingües: no disponible; no se declara ningún idioma.
- Capacidades de código y matemáticas: no disponible.

## Casos de uso

- Asistente conversacional local en estación de trabajo: con pesos en Q4_K_M y un tamaño de repo de 5,9 GB, el modelo es candidato a ejecutarse íntegramente en una GPU de consumo mediante llama.cpp, sin envío de datos a terceros. Adecuado cuando la privacidad del diálogo es requisito, siempre que se valide antes la calidad real de las respuestas.
- Descripción y análisis de imágenes en local: gracias al proyector multimodal, puede emplearse para generar descripciones automáticas de capturas, diagramas o fotografías dentro de un flujo de trabajo propio. Es el caso de uso principal que justifica el fichero `mmproj`.
- Etiquetado y preprocesado de datos para entrenamiento: uso del modelo como anotador automático (categorías, resúmenes cortos, descripciones de imagen) en un pipeline que después filtra y revisa manualmente, aprovechando que la inferencia local abarata el coste por muestra.
- Prototipado rápido en endpoints compatibles con OpenAI: al estar etiquetado como `endpoints_compatible`, puede sustituir temporalmente a un modelo mayor en una aplicación que ya consume una API tipo OpenAI, para validar el flujo antes de decidir el modelo definitivo.
- Chatbot de dominio acotado en dispositivos con recursos limitados: integrable en aplicaciones de escritorio o en un servidor modesto con una sola GPU consumer, para asistentes de soporte interno con conocimiento cerrado.
- Clasificación y extracción de información estructurada: uso como extractor de campos desde texto o desde imágenes de formularios en procesos internos, con validación posterior mediante reglas y verificación por muestreo.
- Evaluación comparativa interna de cuantizaciones: el modelo permite medir, sobre una tarea propia, la pérdida de calidad entre Q4_K_M con QAT y otras alternativas, útil para equipos que deciden su política de cuantización.

En todos los casos es imprescindible una evaluación previa propia: no existen benchmarks, ni declaración de idiomas, ni contexto documentado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica, y los resultados de búsqueda web asociados a esta consulta no contienen información sobre el modelo (se refieren a servicios de vídeo sin relación alguna).

## Requisitos de hardware

- VRAM estimada para inferencia (cálculos orientativos a partir del tamaño de pesos; no confirmados por el autor):
  - Si el modelo real es de 4B en Q4_K_M: aproximadamente 2,5-3,0 GB de pesos.
  - Si el recuento safetensors (7,46B) es el correcto en Q4_K_M: aproximadamente 4,5-5,0 GB de pesos.
  - Proyector multimodal en Q8_0: del orden de varios cientos de MB, no disponible la cifra exacta.
  - Hay que sumar la caché KV, cuyo tamaño depende de una longitud de contexto que no está documentada.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090, y en el lado profesional A100 o H100 si se sirve en lote. Con 8 GB de VRAM debería ser suficiente para una sola petición en cuantización Q4_K_M, asumiendo el escenario de 4B; en el escenario de 7,46B conviene 12 GB o más.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con 8 GB o más de VRAM en Q4_K_M. En sistemas sin GPU puede ejecutarse en CPU, a costa de latencia mayor y con impacto notable en el componente visual.
- Opciones de despliegue: llama.cpp (referenciado explícitamente en la model card, con el ejemplo `llama-cli -m ... -p "Hello!"`), cualquier runtime capaz de cargar GGUF (Ollama, LM Studio, kobold.cpp, llamafile), y presumiblemente servidores compatibles con el esquema OpenAI dado el tag `endpoints_compatible`. El soporte en vLLM o TGI es no disponible y no está confirmado.
- Latencia y throughput estimados: no disponible. No se publican cifras de tokens por segundo ni de latencia por petición.

## Comparativa con modelos similares

No hay datos de rendimiento del modelo, por lo que la comparación solo puede ser estructural. La tabla recoge alternativas habituales en el rango de 3B-4B con capacidad multimodal, indicando únicamente parámetros y licencia, datos públicos de cada proyecto. No se dispone de comparación de calidad.

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Lucy-4B-it-qat-Q4_K_M | 4B declarados / 7,46B en safetensors (discrepancia) | no disponible | no disponible | Multimodal (mmproj), QAT, GGUF |
| Qwen3-4B | 4B | 32k nativo, ampliable | Apache-2.0 | Referencia de la misma franja de tamaño |
| Llama-3.2-3B-Instruct | 3,2B | 128k | Licencia comunitaria de Llama 3.2 | Alternativa text-only de tamaño similar |
| Gemma-3-4B-it | 4B | 128k | Licencia de Gemma | Alternativa multimodal de tamaño similar |

Para Lucy-4B no se conocen resultados que permitan afirmar ventaja o desventaja frente a estas alternativas; cualquier elección debería basarse en una evaluación propia sobre la tarea objetivo.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay ninguna métrica publicada que permita estimar la calidad del modelo en razonamiento, código, matemáticas o multilingüismo.
- Discrepancia de parámetros sin resolver: la model card declara 4B y el recuento safetensors del repositorio indica 7.463.013.674, lo que afecta directamente a las estimaciones de VRAM y a la elección de hardware.
- Licencia no disponible: la model card remite a un "repositorio upstream" que no se enlaza. En la práctica esto impide confirmar si el uso comercial está permitido; no debe utilizarse en producción sin resolver esta cuestión.
- Idiomas no declarados: se desconoce si el modelo está ajustado para castellano y con qué calidad. Es probable que esté optimizado para inglés, pero no puede afirmarse con la información disponible.
- Longitud de contexto desconocida: no se puede planificar su uso en tareas de contexto largo (documentos extensos, conversaciones largas o múltiples imágenes) sin medirlo previamente.
- Riesgo de alucinación: inherente a cualquier modelo instruction-tuned de este tamaño, agravado por la falta de documentación sobre el proceso de alineamiento (no consta RLHF ni DPO).
- Sesgos: no disponible. No hay ninguna declaración sobre sesgos demográficos, de género o culturales, ni sobre filtrado de contenido del dataset.
- Procedencia y validación: 0 descargas y 0 likes en el momento de la consulta; la metadata de creación indica una fecha anómala (2026-09-20), lo que conviene verificar antes de integrarlo. La calidad y la integridad de los pesos no han sido contrastadas por terceros.
- Compatibilidad de despliegue limitada: al ser GGUF, el soporte en servidores de alto rendimiento como vLLM o TGI no está confirmado, lo que puede limitar el escalado en producción.
- Cadena de derivación opaca: no se identifica el modelo base sobre el que se ha hecho el ajuste, lo que dificulta auditar la procedencia de los datos de entrenamiento y las obligaciones de licencia heredadas.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Xenna/Lucy-4B-it-qat-Q4_K_M
- Pila de inferencia StelNet, citada en la model card: https://github.com/stelnetxcis-create
- Repositorio upstream con los detalles de licencia: no disponible (la model card lo menciona sin enlazarlo)
- Paper o informe técnico: no disponible
- Blog o anuncio del autor: no disponible
- Demo o espacio interactivo: no disponible
