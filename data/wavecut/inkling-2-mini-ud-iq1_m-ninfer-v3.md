# WaveCut/Inkling-2-Mini-UD-IQ1_M-NInfer-v3

## Resumen

Inkling-2-Mini-UD-IQ1_M-NInfer-v3 es un artefacto de inferencia en formato propietario `.ninfer` (v3) generado por WaveCut a partir del modelo Inkling 2 Mini de Thinking Machines. El modelo original es un transformer con mezcla de expertos (MoE) "looped": 26.400 millones de parámetros totales con 3.400 millones activos por token, 24 capas almacenadas que se ejecutan como 48 visitas (el núcleo de capas 6-17 se recorre tres veces con los mismos pesos), y torre de visión integrada. Este artefacto empaqueta la cuantización UD-IQ1_M de Unsloth junto con el drafter DSpark del release original y el drafter DFlash2 de incoai, todo en un único fichero de 8,87 GiB.

El interés de esta ficha es doble. Por un lado, documenta una de las cuantizaciones más agresivas viables del modelo (IQ1_M, divergencia KL media de 0,0867 frente a UD-Q8_K_XL y el mismo token top en el 90,2 % de las posiciones, según Unsloth), lo que permite ejecutar un MoE de 26B con visión y tool calling en hardware muy modesto. Por otro, muestra un caso atípico de empaquetado: el motor NInfer no recuantiza las matrices GGUF, sino que multiplica los bloques ggml in situ, y solo recuantiza el drafter DFlash2 a Q8_G32.

La relevancia práctica está en el binomio tamaño/capacidades: razonamiento, tool calling con salida compatible con OpenAI, salida estructurada, visión mediante ViT Q8_0 y decodificación especulativa con dos drafters alternativos, en un fichero por debajo de 9 GiB. La contrapartida es la dependencia estricta del runtime NInfer: las builds estándar rechazan el fichero y se requiere la rama `master` de `iamwavecut/ninfer-all` en release `2026-11-24.7` o posterior para el drafter DFlash2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con capas repetidas (looped): 24 capas almacenadas ejecutadas como 48 visitas (preludio 0-5, núcleo 6-17 x3, coda 18-23); atención con 24 cabezas de consulta sobre 8 cabezas KV de 128, sin rotación, tabla aprendida de 1.024 distancias y sinks |
| Parametros totales | 26.400 millones (26,4B) |
| Parametros activos | 3.400 millones (3,4B) por token |
| Longitud de contexto | No disponible como cifra única; la atención de las capas 5, 11, 17 y 23 opera sobre todas las posiciones y el resto sobre ventanas de 1.024; el drafter DFlash2 usa ventana de 2.048 |
| Tipos de cuantizacion | Artefacto UD-IQ1_M: mezcla por tensor de IQ1_S, IQ2_XXS, IQ2_XS, IQ2_S, IQ3_XXS, IQ4_XS, Q2_0, Q4_K, Q5_K, Q6_K, Q8_0, NVFP4, BF16 y FP32; visión Q8_0; drafter DSpark Q8_0; drafter DFlash2 Q8_G32 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.ninfer` v3 (9.521.507.584 bytes, 8,87 GiB); deriva de GGUF UD-IQ1_M de Unsloth y de safetensors BF16 para el drafter DFlash2 |

## Arquitectura y entrenamiento

El modelo base es un MoE con atención por capas y ejecución recurrente del núcleo: las capas 6 a 17 se aplican tres veces con los mismos pesos, pero cada visita mantiene sus propias claves, valores e historiales de convolución. El MoE tiene 128 expertos enrutados, 8 activos por token, puntuaciones sigmoideas con sesgo de selección y activación SiTU sobre la concatenación [gate; up] de anchura 1152, sin experto compartido. La tabla de tokens y la cabeza de salida están desacopladas (201.024 filas, 200.058 puntuadas, soft cap de 30). La torre de visión es un ViT con fila de clase, filas de posición redimensionadas, cabezas con rotación 2D, fusión 2x2 y proyector de dos capas, con hasta 4.096 posiciones por imagen.

Sobre el entrenamiento no se aportan datos en la información disponible: no hay cifras de tokens, composición del dataset ni detalles de RLHF/DPO. La información sí describe la infraestructura de inferencia: decodificación especulativa con dos drafters alternativos (DSpark, tres bloques no causales sobre estados del modelo objetivo más una cabeza de Markov recurrente de rango 256; DFlash2, cinco capas de ventana deslizante de 2.048 posiciones más un selector condicional sobre los 16 mejores tokens de cada fila), reutilización de prefijos de prompt, y ejecución de los expertos enrutados en GPU, en memoria de host fijada o leídos directamente del fichero.

## Capacidades

- Generación de texto y razonamiento, con el razonamiento del modelo emitido en sus propios bloques.
- Tool calling: los bloques JSON de llamada a herramienta se devuelven como tool calls en formato OpenAI, con argumentos estrictos.
- Salida estructurada y decisiones tipadas, además de reranking.
- Procesamiento de imágenes mediante la torre de visión del release (pipeline image-text-to-text).
- Decodificación especulativa con DSpark (activa por defecto con una sola petición en curso), con DFlash2 (`--spec dflash2`) o por búsqueda en contexto.
- Concurrencia de una a ocho peticiones con reutilización de prefijo de prompt.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Asistente de código en local: el modelo cabe en 8,87 GiB y soporta tool calling con argumentos estrictos, lo que permite integrarlo en editores o agentes CLI que invocan herramientas de compilación y test sin salir de una estación de trabajo.
- Automatización de atención al cliente con contexto largo: la atención de las capas 5, 11, 17 y 23 cubre todas las posiciones y el motor reutiliza prefijos de prompt, lo que abarata conversaciones multi-turno con historial extenso.
- Procesamiento de documentos con imagen: la torre de visión admite hasta 4.096 posiciones por imagen, útil para extraer datos de facturas, formularios o capturas y devolverlos como JSON estructurado.
- Agentes multi-paso: la combinación de razonamiento en bloques propios, tool calls en formato OpenAI y decisiones tipadas encaja en pipelines de agentes que encadenan varias herramientas por tarea.
- Reranking y clasificación en recuperación de información: el motor expone reranking y decisiones tipadas, aplicables a la segunda fase de un pipeline RAG sobre corpus moderados.
- Despliegue en hardware de gama de consumo: con cuantización IQ1_M y expertos enrutados en memoria de host o leídos del fichero, es viable servir el modelo en una sola GPU consumer para prototipos y uso personal.
- Evaluación de cuantizaciones extremas: con KLD media de 0,0867 frente a Q8_K_XL, sirve como banco de pruebas para medir la degradación de un MoE de 26B a ~1 bit por peso en tareas de razonamiento y código.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato cuantitativo de calidad es la divergencia KL de la cuantización reportada por Unsloth: KLD media de 0,0867 frente a UD-Q8_K_XL y coincidencia en el token top en el 90,2 % de las posiciones. Para referencia, UD-IQ1_S es 0,26 GB más pequeño pero con KLD de 0,0911.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero ocupa 8,87 GiB; con overhead de contexto, cachés KV de las 48 visitas y buffers de los drafters, se debe prever un margen adicional, aunque la cifra exacta no está disponible en la información proporcionada.
- GPU recomendadas: no se especifican modelos concretos en la información disponible. El diseño del motor (expertos enrutados en GPU, en memoria de host fijada o leídos del fichero) apunta a que una sola GPU con suficiente VRAM para los tensores densos y los expertos activos es suficiente.
- GPU consumer: por tamaño del artefacto, es plausible en tarjetas de 12-16 GB o superiores, aunque la información no confirma modelos concretos ni rendimiento medido.
- Opciones de despliegue: exclusivamente NInfer, rama `master` de `iamwavecut/ninfer-all`, release `2026-11-24.1` o posterior para el drafter DSpark y `2026-11-24.7` o posterior para DFlash2. Las builds estándar de NInfer rechazan el fichero. No hay soporte de llama.cpp, vLLM, Ollama ni TGI para este artefacto.
- Latencia y throughput: no disponibles; la decodificación especulativa con DSpark o DFlash2 está pensada para reducir la latencia, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato / runtime |
|---|---|---|---|---|---|
| Inkling-2-Mini-UD-IQ1_M-NInfer-v3 (este) | 26,4B | 3,4B | No disponible (atención global en 4 capas, ventana 1.024 en el resto) | Apache 2.0 | `.ninfer` v3, solo NInfer |
| Inkling-2-Mini (base, Thinking Machines) | 26,4B | 3,4B | No disponible | Apache 2.0 | safetensors, ecosistema estándar |
| Inkling-2-Mini-GGUF UD-IQ1_M (Unsloth) | 26,4B | 3,4B | No disponible | Apache 2.0 | GGUF, llama.cpp |
| Inkling-2-Mini UD-IQ4_XS NInfer-v3 (WaveCut) | 26,4B | 3,4B | No disponible | Apache 2.0 | `.ninfer` v3, mayor tamaño y fidelidad |

La comparativa con modelos de otras familias no está disponible en la información proporcionada. Dentro de la propia familia, la elección entre artefactos es de compromiso tamaño/fidelidad: IQ1_M (8,87 GiB, KLD 0,0867), IQ1_S (0,26 GB menos, KLD 0,0911) e IQ4_XS (mayor tamaño, verificado con DSpark y `--spec none` en la release `2026-11-24.6`).

## Limitaciones y advertencias

- Dependencia total del runtime NInfer: no funciona en llama.cpp, vLLM, Ollama ni TGI, y las builds estándar de NInfer rechazan el fichero; se requiere la rama `master` de `iamwavecut/ninfer-all` en release `2026-11-24.7` o posterior para DFlash2.
- La cuantización IQ1_M es extrema: KLD media de 0,0867 frente a Q8_K_XL implica degradación medible en tareas sensibles a la fidelidad, como matemáticas o código de precisión.
- Riesgo de alucinación: no se aportan evaluaciones de fiabilidad ni tasas de alucinación; en un modelo con razonamiento en bloques propios y tool calling, conviene validar las llamadas a herramientas antes de ejecutarlas en producción.
- Idiomas soportados no documentados: no se puede garantizar calidad multilingüe fuera del inglés sin evaluación propia.
- Longitud de contexto no publicada como cifra única: la arquitectura mezcla atención global en cuatro capas con ventanas de 1.024 en el resto, lo que complica razonar sobre el límite efectivo.
- Sin datos de entrenamiento ni benchmarks publicados en la información disponible: la evaluación de capacidades debe hacerse empíricamente.
- El fichero incluye dos drafters (DSpark y DFlash2) y la torre de visión; el tamaño de 8,87 GiB ya los contempla, pero el reparto de VRAM entre componentes no está documentado.
- Licencia Apache 2.0 permite uso comercial, pero la cadena de derivación (Unsloth, ggml-org, incoai) debe revisarse en el fichero `NOTICE` incluido en el repositorio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/WaveCut/Inkling-2-Mini-UD-IQ1_M-NInfer-v3
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- GGUF de Unsloth: https://huggingface.co/unsloth/Inkling-2-Mini-GGUF
- Drafter DFlash2 de incoai: https://huggingface.co/incoai/Inkling-2-Mini-DFlash2
- Motor NInfer (Neroued): https://github.com/Neroued/ninfer
- Rama con soporte de la familia Inkling 2: https://github.com/iamwavecut/ninfer-all
- Artefactos hermanos: https://huggingface.co/WaveCut/Inkling-2-Mini-UD-Q2_K_XL-NInfer-v3, https://huggingface.co/WaveCut/Inkling-2-Mini-UD-Q3_K_XL-NInfer-v3, https://huggingface.co/WaveCut/Inkling-2-Mini-UD-IQ4_XS-NInfer-v3, https://huggingface.co/WaveCut/Inkling-2-Mini-APEX-I-MiniPlus-V2.1-NInfer-v3
