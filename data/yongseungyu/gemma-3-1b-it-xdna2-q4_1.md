# yongseungyu/Gemma-3-1B-IT-XDNA2-Q4_1

## Resumen

Gemma-3-1B-IT-XDNA2-Q4_1 es una derivación cuantizada del modelo `google/gemma-3-1b-it` de Google, publicada por el usuario yongseungyu, diseñada específicamente para ejecutarse de forma nativa en aceleradores NPU AMD XDNA2 (arquitectura aie2p, presente en las APU Ryzen AI). No se trata de una conversión a GGUF ni de un formato estándar de llama.cpp: el autor ha empaquetado los pesos en un formato propietario de cuantización afín Q4_1 con grupos de 32 y escalas/minimos en BF16, junto con tablas de soporte y metadatos de precisión mixta.

El modelo conserva las 26 capas del transformer original y el vocabulario completo de 262.144 tokens, con una asignación de contexto de 32.768 tokens (ventana local de 512 y capa global cada seis capas). La innovación principal no está en el modelo en sí, sino en el runtime asociado `gemma-xdna2==0.1.0a2`, una rueda binaria de CPython 3.12 para Linux x86_64 que incluye los kernels compilados (ELF/xclbin/PDI) y ejecuta toda la pila —embedding, RMSNorm, RoPE, atención, MLP y cabeza de salida— en la NPU, sin fallback a CPU.

Es relevante ahora porque explora una vía poco habitual: inferencia de un LLM pequeño íntegramente en NPU de PC, sin PyTorch ni MLIR-AIE en tiempo de ejecución. No obstante, el propio autor lo etiqueta como alpha experimental con calidad "REPORT_ONLY", sin fine-tuning adicional y con un único host verificado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3), 26 capas, hidden 1152, FFN 6912, 4 cabezas Q / 1 KV, dimensión de cabeza 256 |
| Parámetros totales | no disponible (deriva de google/gemma-3-1b-it, ~1B) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens (ventana local 512, capa global cada sexta capa) |
| Tipos de cuantización | Q4_1 afín nativo, grupos de 32, escala y mínimo en BF16; activaciones y KV en int8-g32; embeddings y normas en BF16 original |
| Idiomas soportados | no disponible |
| Licencia | Gemma (términos de licencia de Google Gemma) |
| Formato de pesos | Formato propietario `llama32.aie2p-q4_1-int8xu4-mmul-16x16.v1` (no GGUF); ficheros `buffers/weights.bin` (627.609.600 bytes) y `buffers/constants.bin` (671.359.488 bytes) |

## Arquitectura y entrenamiento

El modelo subyacente es `google/gemma-3-1b-it` (revisión `dcc83ea841ab6100d6b47a070329e1ba4cf78752`), un transformer decoder-only de 26 capas con hidden de 1152, FFN de 6912, 4 cabezas de consulta y 1 de clave/valor con dimensión de cabeza 256. La atención combina ventana local de 512 tokens con una capa de atención global cada seis capas, sobre una asignación total de contexto de 32.768 tokens. La cabeza de salida usa el embedding atado sin escalado, y la búsqueda de embeddings aplica por separado sqrt(hidden) en BF16.

No se realizó ningún fine-tuning sobre el modelo base: la aportación del autor es exclusivamente de cuantización y empaquetado. Los pesos se convierten a Q4_1 afín con grupos de 32 y escalas/minimos BF16, mientras que embeddings y normas se mantienen en BF16 original con tensores de normalización separados. Las activaciones y la caché KV se empaquetan en int8-g32. El bundle incluye 183 paquetes de proyección/cabeza recuperados, tablas de soporte BF16, tokenizer, metadatos de precisión (`quantization.json`) y sumas de verificación (`checksums.json`). Los kernels de ejecución (ELF/xclbin/PDI/parameter set) no se distribuyen en el repositorio, sino únicamente en la rueda binaria del runtime. La verificación de recuperación del 13 de noviembre de 2026 reporta coincidencia exacta de los 262.144 logits con el oráculo CPU de aritmética empaquetada en puertas de 1, 16 y 26 capas, equivalencia en 27 posiciones secuenciales con caché KV idéntica, y una prueba de contexto de 514 pasos NPU secuenciales con replay exacto en fronteras de bloque/ventana alrededor de 128, 256 y 512.

## Capacidades

- Generación de texto conversacional e instruccional (modelo -it), con plantilla de chat gestionada por Transformers solo para tokenización y formateo.
- Razonamiento y respuesta a preguntas en lenguaje natural (ejemplo verificado: "What is the capital of France?" → "The capital of France is Paris!").
- Ejecución íntegra en NPU: embedding, RMSNorm, RoPE, QKV/proyecciones, atención, GELU/MLP, residuales, actualización de KV y cabeza completa.
- Decodificación greedy (argmax) sobre logits leídos de la NPU, con comprobación de finitud en host.
- Contexto de hasta 32.768 tokens con ventana local de 512 y atención global periódica.
- Multilingüismo: heredado del modelo base Gemma 3, aunque no se detalla en la información disponible.
- No soporta tool calling, function calling ni agentes multi-paso de forma documentada.
- No soporta visión, audio ni modo thinking explícito en este bundle.
- No dispone de fallback a CPU: requiere NPU XDNA2 compatible.

## Casos de uso

- Inferencia local de bajo consumo en PC con APU Ryzen AI: el modelo ejecuta toda la pila en la NPU XDNA2, liberando CPU y GPU para otras tareas del sistema; adecuado para asistentes de escritorio siempre activos con presupuesto energético ajustado.
- Pruebas de concepto de despliegue en NPU: útil para equipos que evalúan la viabilidad de ejecutar LLMs en aceleradores integrados sin GPU dedicada, usando el runtime `gemma-xdna2` y el CLI `generate`.
- Generación de texto offline y privada: al no requerir servicios en la nube ni dependencias de PyTorch, permite procesar prompts sensibles en local, con contexto de hasta 32.768 tokens para documentos moderadamente largos.
- Investigación en cuantización Q4_1 nativa: el bundle incluye metadatos de precisión mixta y evidencia de verificación, lo que lo hace útil como referencia para estudiar el impacto de Q4_1 con grupos de 32 y activaciones int8 en un transformer pequeño.
- Validación de pipelines de cuantización y empaquetado: los ficheros `checksums.json`, `quantization.json` y `bundle.json` permiten reproducir y auditar la correspondencia entre pesos empaquetados y oráculo CPU.
- Chatbot de propósito general en entornos controlados: con 1B de parámetros y contexto de 32K, sirve para respuestas conversacionales breves en estaciones de trabajo verificadas (Ubuntu 26.04.1, kernel 7.0.0-43, RyzenAI-npu6/aie2p, firmware 1.1.2.64).
- Docencia y demostraciones de inferencia en NPU: el ejemplo incluido en la model card facilita mostrar el flujo completo `doctor --probe` → `download` → `generate` sin necesidad de GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta verificaciones de corrección numérica (coincidencia exacta de logits con el oráculo CPU, replay determinista de caché KV y 514 pasos secuenciales de contexto), no métricas de calidad como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- NPU AMD XDNA2 (arquitectura aie2p) con driver y firmware compatibles; host verificado: RyzenAI-npu6/aie2p con firmware 1.1.2.64.
- Acceso de lectura/escritura al dispositivo NPU y al menos 2 GiB de allowance de memlock (el autor sugiere elevar a 4 GiB con `prlimit` si es menor).
- CPython 3.12 (verificado 3.12.16), glibc >= 2.39, ABI GLIBCXX_3.4.32 y CXXABI_1.3.15; rueda auditada como `manylinux_2_39_x86_64`.
- Sistema verificado: Ubuntu 26.04.1 con kernel 7.0.0-43-generic; otros hosts no están cualificados.
- Tamaño del repositorio: 1,3 GB (pesos empaquetados y tablas de soporte).
- VRAM de GPU: no aplica; la inferencia se ejecuta en NPU, no en GPU.
- Despliegue: exclusivamente mediante el runtime `gemma-xdna2==0.1.0a2` (CLI o clase Python `GemmaRuntime`). No es compatible con vLLM, llama.cpp, Ollama, TGI ni `AutoModel.from_pretrained`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / destino | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gemma-3-1B-IT-XDNA2-Q4_1 (este) | ~1B (no confirmado) | 32.768 | Q4_1 propietario para NPU XDNA2 | Gemma | Hugging Face, runtime binario `gemma-xdna2` |
| google/gemma-3-1b-it | ~1B | 32.768 (según modelo base) | safetensors BF16 | Gemma | Hugging Face, Transformers |
| Conversiones GGUF de Gemma 3 1B IT (p. ej. Q4_K_M) | ~1B | 32.768 | GGUF para llama.cpp | Gemma | Hugging Face, llama.cpp/Ollama |
| Otros modelos ~1B para NPU | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación con alternativas de la misma categoría (LLMs de ~1B para NPU) no está disponible en la información proporcionada. Frente al modelo base y a las conversiones GGUF, la diferencia clave es el destino de ejecución (NPU XDNA2 frente a GPU/CPU) y el formato no estándar, que impide su uso fuera del runtime del autor.

## Limitaciones y advertencias

- Modelo alpha experimental: el autor declara explícitamente que la calidad es "REPORT_ONLY" y que se trata de un bundle experimental.
- Sin fine-tuning: los pesos son una cuantización del modelo base, por lo que hereda sus sesgos y limitaciones sin mitigación adicional.
- Riesgo de alucinación: inherente a un modelo de 1B; no se han publicado evaluaciones de fidelidad.
- Idiomas soportados no documentados en la información disponible; el multilingüismo depende del modelo base Gemma 3.
- Dependencia estricta de hardware: requiere NPU XDNA2, driver, firmware y acceso de lectura/escritura; sin fallback a CPU. Cualquier otro host queda "no cualificado".
- Dependencia de un runtime binario cerrado en la práctica: los kernels se distribuyen solo en la rueda `gemma-xdna2`, sin fuentes ni bytecode; el autor advierte que los binarios son inspeccionables/extraíbles y que esto no constituye garantía antiingeniería inversa.
- Formato propietario no estándar: no se puede cargar con llama.cpp, vLLM, Ollama, TGI ni Transformers (`AutoModel`); solo tokenización y formateo de chat vía Transformers.
- Requisitos de sistema muy específicos: glibc >= 2.39, CPython 3.12, kernel y firmware concretos; el ABI de usuario no cualifica otras combinaciones de NPU/driver.
- Licencia Gemma: el uso comercial está sujeto a los términos de la licencia Gemma de Google; conviene revisar las restricciones de uso aceptable antes de producción.
- Sin datos de benchmarks de calidad ni de latencia/throughput; no es posible estimar rendimiento real en producción a partir de la información disponible.
- Repositorio sin descargas ni likes en el momento de la consulta, lo que limita la validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yongseungyu/Gemma-3-1B-IT-XDNA2-Q4_1
- Modelo base: https://huggingface.co/google/gemma-3-1b-it
- Runtime asociado: `gemma-xdna2==0.1.0a2` (rueda binaria CPython 3.12 Linux x86_64, distribuida por el autor; no se proporciona URL directa en la información disponible)
- Paper, blog o repositorio adicionales: no disponibles en la información proporcionada.
