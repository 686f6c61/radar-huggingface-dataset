# ssv555/Qwen3.6-35B-A3B-V9

## Resumen

Qwen3.6-35B-A3B-V9 es una cuantización GGUF de un modelo de lenguaje de tipo mixture-of-experts (MoE) con aproximadamente 35 000 millones de parámetros totales y unos 3000 millones activos por token, según la etiqueta de tamaño `35B-A3B` declarada por el autor. El artefacto lo publica el usuario `ssv555` en Hugging Face y está pensado para su uso con llama.cpp, incluyendo un proyector de visión separado que habilita la modalidad image-text-to-text. No se trata de un modelo original, sino de una redistribución de pesos procedentes de una cadena de derivaciones descrita en la propia model card.

La cadena de procedencia documentada es la siguiente: el modelo base es Qwen3.6-35B-A3B; sobre él se aplicó un paso de "uncensoring" denominado `Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive`; posteriormente se cuantizó con una importance matrix y una mezcla de cuantización llamada "APEX-Compact"; y el resultado se publicó antes como `Hermes3.6-35B-A3B-Uncensored-Genesis-V9-APEX-Compact` por el usuario LuffyTheFox, cuyo repositorio fue cerrado el 22 de noviembre de 2026. Esta ficha toma los datos de la model card del autor y de los metadatos GGUF que este declara haber leído.

La relevancia del artefacto es limitada y fundamentalmente práctica: ofrece un MoE grande con visión en formato GGUF para inferencia local, pero con importantes incógnitas sobre licencia, idiomas, benchmarks y calidad real del ajuste. Además, la model card advierte de que los metadatos internos del archivo fueron editados por el publicador actual (campos `general.author`, `general.name` y `general.basename`), lo que obliga a tratar la identidad del modelo con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen35moe` (Qwen3.6 MoE), según metadatos GGUF |
| Parametros totales | ~35B (etiqueta `35B-A3B`); el campo de parámetros del repo indica 446.571.248, dato no coherente con la etiqueta |
| Parametros activos | ~3B por token (según etiqueta `35B-A3B`) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF con mezcla "APEX-Compact" guiada por importance matrix (imatrix de 510 entradas, 93 chunks); nivel de bits exacto no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (`Qwen3.6-35B-A3B-V9.gguf`, 16,23 GiB; `mmproj-Qwen3.6-35B-A3B-V9-F16.gguf`, 0,84 GiB) |

## Arquitectura y entrenamiento

La arquitectura declarada en los metadatos GGUF es `qwen35moe`, correspondiente a la familia Qwen3.6 en su variante MoE. Se trata, por tanto, de un transformer con mezcla de expertos dispersa: el modelo contiene aproximadamente 35 000 millones de parámetros totales pero solo activa alrededor de 3000 millones por token, lo que reduce el coste computacional de inferencia respecto a un modelo denso del mismo tamaño. El artefacto incluye además un proyector visual independiente en F16 (`mmproj`), lo que confirma la integración de un codificador de imágenes para tareas image-text-to-text.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni la existencia de fases de RLHF o DPO en el modelo base. La model card sí documenta un paso de ajuste posterior orientado a eliminar rechazos (`HauhauCS-Aggressive`) y una supuesta sintonización de estilo Hermes para chat y tool calling, aunque el propio autor señala que varios elementos de esa nomenclatura (puntos 1, 4 y 5 de su lectura) no están confirmados por el publicador original. La cuantización se realizó con una importance matrix, una técnica que pondera la importancia de cada peso para minimizar la pérdida de calidad en la compresión. Los valores de muestreo grabados en el archivo son temperature 1.0, top_p 0.95 y top_k 20.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo base Qwen3.6.
- Procesamiento de imágenes y texto combinados (pipeline image-text-to-text) mediante el proyector `mmproj` en F16.
- Razonamiento y matemáticas: capacidad esperable por la familia base, sin datos verificables en la información disponible.
- Generación de código: capacidad esperable por la familia base, sin datos verificables.
- Tool calling / function calling: la model card menciona una sintonización "Hermes-style chat and tool-calling", aunque no se aportan detalles ni confirmación del publicador original.
- Comportamiento sin rechazos: el paso `Uncensored` elimina las negativas del modelo, lo que cambia el perfil de seguridad de las respuestas.
- Capacidades multilingües: no disponibles; no se declaran idiomas en el repositorio.
- Modo de razonamiento explícito (thinking mode): no disponible.

## Casos de uso

- Inferencia local de un MoE grande en estaciones de trabajo: el formato GGUF y el tamaño de 16,23 GiB permiten cargar el modelo en llama.cpp con GPU de consumo de gama alta, algo inviable con los pesos originales en precisión completa.
- Análisis de imágenes con descripción textual: el proyector `mmproj` habilita tareas de image-text-to-text, como generar descripciones de capturas, extraer texto de documentos escaneados o responder preguntas sobre figuras, todo ello en local.
- Asistentes conversacionales sin filtros de rechazo: el ajuste `Uncensored` lo hace adecuado para entornos de investigación donde se necesita estudiar el comportamiento del modelo ante peticiones que un modelo alineado rechazaría, siempre con las cautelas legales y éticas correspondientes.
- Prototipado de agentes con tool calling: si la sintonización Hermes se confirma, el modelo podría integrarse en bucles de agente que invocan funciones externas, aunque la falta de benchmarks obliga a validar esta capacidad empíricamente antes de usarla en producción.
- Experimentación académica con cuantización imatrix: el artefacto sirve como caso de estudio para comparar la mezcla "APEX-Compact" frente a cuantizaciones GGUF estándar (Q4_K_M, Q5_K_M) en términos de perplejidad y calidad de salida.
- Despliegue en pipelines de generación aumentada por recuperación (RAG): un MoE con 3B activos ofrece un coste por token bajo y puede combinarse con un índice vectorial para responder preguntas sobre documentación técnica, siempre que se valide la longitud de contexto real del modelo.
- Evaluación de seguridad y robustez: al tratarse de un modelo derivado con edición de metadatos y sin licencia clara, es útil como muestra para auditorías de procedencia y de integridad de artefactos en la cadena de suministro de modelos abiertos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo principal ocupa 16,23 GiB, por lo que se necesita al menos esa cantidad de memoria más el overhead del contexto; el proyector visual añade 0,84 GiB adicionales.
- GPU recomendadas: para carga completa en VRAM, tarjetas con 24 GB o más (RTX 3090, RTX 4090, A100 40 GB, H100). Con 16 GB sería necesario descargar capas a CPU mediante el modo de offloading de llama.cpp.
- ¿Cabe en GPU de consumo? Sí, en RTX 3090 y RTX 4090 con 24 GB, siempre que se limite la longitud de contexto y se acepte un margen ajustado. En tarjetas de 16 GB (RTX 4060 Ti, RTX 4070 Ti Super) solo con offloading parcial a RAM.
- Opciones de despliegue: llama.cpp es el soporte nativo declarado. No se confirma compatibilidad con vLLM, TGI u Ollama; Ollama podría importar el GGUF, pero no está verificado en la información disponible.
- Latencia y throughput estimados: no disponibles. Al activar solo ~3B parámetros por token, el throughput debería ser sustancialmente mayor que el de un modelo denso de 35B, pero no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-V9 | ~35B | ~3B | no disponible | no disponible | GGUF + mmproj | Hugging Face (`ssv555`) |
| Qwen3.6-35B-A3B (base) | ~35B | ~3B | no disponible | no disponible | original (safetensors presumiblemente) | no disponible en la información |
| Hermes3.6-35B-A3B-Uncensored-Genesis-V9-APEX-Compact | ~35B | ~3B | no disponible | no disponible | GGUF | repositorio cerrado (HTTP 401) desde 2026-11-22 |

No se dispone de datos de rendimiento que permitan una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Licencia no declarada: no se especifica ninguna licencia en el repositorio, lo que impide determinar si el uso comercial está permitido. No debe desplegarse en producción sin aclarar este punto.
- Procedencia opaca: los metadatos internos del GGUF fueron editados por el publicador actual (`general.author`, `general.name`, `general.basename`), y el repositorio upstream fue cerrado. La trazabilidad de los pesos no es verificable de forma independiente.
- Incoherencia en el recuento de parámetros: el campo de parámetros del repositorio indica 446.571.248, un valor incompatible con la etiqueta `35B-A3B` y con el tamaño del archivo (16,23 GiB). Debe tratarse la cifra de 35B como la declarada por el autor, no como un dato verificado.
- Modelo "uncensored": la eliminación de rechazos incrementa el riesgo de generar contenido dañino, ilegal o inexacto, y dificulta su uso en aplicaciones orientadas al público general.
- Riesgo de alucinación: no hay evaluaciones publicadas de fidelidad factual; al ser un derivado con ajustes sucesivos, la degradación respecto al base es posible y no está medida.
- Idiomas y contexto desconocidos: no se declaran idiomas soportados ni longitud de contexto, lo que impide planificar despliegues multilingües o con ventanas largas.
- Sin benchmarks: no existen métricas publicadas (MMLU, HumanEval, GSM8K, MMMU) que permitan validar las capacidades declaradas, especialmente el tool calling y la visión.
- Sin tracción comunitaria: cero descargas y cero likes en el momento de la consulta, sin issues ni discusión que permitan contrastar el comportamiento real del artefacto.
- Fecha de creación futura (2026-11-25): conviene verificar la integridad y el origen del repositorio antes de confiar en él para cualquier flujo automatizado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ssv555/Qwen3.6-35B-A3B-V9
- Repositorio upstream cerrado (referenciado en la model card): `Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V9-GGUF`, de LuffyTheFox (no accesible, HTTP 401 desde 2026-11-22)
- llama.cpp (runtime compatible declarado): https://github.com/ggml-org/llama.cpp
- Modelo base referenciado: Qwen3.6-35B-A3B (sin enlace directo disponible en la información proporcionada)
