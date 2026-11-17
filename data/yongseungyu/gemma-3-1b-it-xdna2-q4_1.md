# yongseungyu/Gemma-3-1B-IT-XDNA2-Q4_1

## Resumen

Gemma-3-1B-IT-XDNA2-Q4_1 es una versión experimental del modelo `google/gemma-3-1b-it` de Google, cuantizada de forma nativa en formato Q4_1 y empaquetada para ejecutarse íntegramente sobre la NPU XDNA2 de AMD. El artefacto lo desarrolla y mantiene el equipo ETRI On-device AI Compiler (ETRI-OAC), y se publica bajo la cuenta de Hugging Face `yongseungyu`. No es un modelo nuevo: es un derivado cuantizado del Gemma 3 1B instruction-tuned, con pesos y kernels adaptados a un perfil de hardware concreto (`full26-c32768-selected`).

La relevancia de esta ficha no está en la calidad del modelo base, sino en el formato de despliegue. Frente a las rutas habituales (GGUF/llama.cpp, safetensors/PyTorch, vLLM), este bundle ejecuta las 26 capas del transformer y la cabeza de vocabulario completa (262 144 tokens) sobre la NPU, sin fallback a CPU. Eso lo convierte en un caso de estudio de inferencia on-device acelerada por hardware específico, con un contrato de versión estricto entre runtime (`gemma-xdna2==0.1.0a2`) y revisión del modelo.

El modelo es de 1B parámetros, con contexto asignado de 32 768 tokens, ventana local de 512 y capas globales cada sexta capa. La licencia es Gemma, y el autor declara explícitamente que la calidad del modelo es **REPORT_ONLY**, es decir, se publica como evidencia de compatibilidad, no como un artefacto validado para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3), 26 capas, atención con ventana local de 512 y capa global cada sexta |
| Parámetros totales | 1B (modelo base `google/gemma-3-1b-it`) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 32 768 tokens asignados; ventana local 512, global cada sexta capa |
| Tipos de cuantización | Q4_1 nativo (afín, grupos de 32, escala y mínimo en BF16); activaciones y KV en paquetes int8-g32 |
| Idiomas soportados | no disponible (heredados del modelo base; no declarados en la model card) |
| Licencia | Gemma |
| Formato de pesos | `gemma-xdna2.native-q4_1.v1` (`buffers/weights.bin` de 627 609 600 bytes y `buffers/constants.bin` de 671 359 488 bytes); no es GGUF ni safetensors estándar |
| Hidden / FFN | 1152 / 6912 |
| Cabezas Q / KV, dimensión de cabeza | 4 / 1, 256 |
| Runtime asociado | `gemma-xdna2==0.1.0a2` (wheel `manylinux_2_39_x86_64`) |
| Revisión del modelo | `3098bf6f10549f058ee27e8f7ac14fddd6a97964` |
| Perfil de kernel | `gemma3-1b-q4_1-bf16-i8g32-c32768-selected-v1` |
| Tamaño del repo | 1,3 GB (descarga aproximada de 1,34 GB) |

## Arquitectura y entrenamiento

El modelo subyacente es Gemma 3 1B instruction-tuned, un transformer decoder-only con 26 capas, dimensión oculta de 1152, FFN de 6912, 4 cabezas de consulta y 1 cabeza KV con dimensión de cabeza 256. La atención combina una ventana local de 512 tokens con capas de atención global cada sexta capa, lo que reduce el coste de atención en contextos largos manteniendo acceso global periódico. El vocabulario es de 262 144 tokens.

No se ha realizado ningún entrenamiento adicional ni fine-tuning: el autor describe el artefacto como una cuantización custom del modelo original (revisión `dcc83ea841ab6100d6b47a070329e1ba4cf78752`, safetensors SHA-256 `3d4ef8d71c14db7e448a09ebe891cfb6bf32c57a9b44499ae0d1c098e48516b6`). La innovación técnica está en el pipeline de compilación: pesos en Q4_1 afín con grupos de 32 y escala/mínimo en BF16, activaciones y caché KV empaquetadas en int8-g32, y kernels PDI/ELF/xclbin empaquetados en el wheel del runtime. La NPU ejecuta embedding, RMSNorm, RoPE, proyecciones QKV, atención, GELU/MLP, residuales, actualizaciones de KV y la cabeza completa; el host solo escribe parámetros, lanza el PDI, comprueba la finitud de los logits y aplica argmax greedy. No hay dependencia de PyTorch ni de MLIR-AIE en tiempo de ejecución; Transformers se usa únicamente para tokenización y formato de chat.

## Capacidades

- Generación de texto autoregresiva con decodificación greedy (argmax) sobre la NPU; no se documenta muestreo, top-k ni temperatura.
- Razonamiento y respuesta conversacional heredados de `gemma-3-1b-it` (instruction-tuned).
- Capacidad multilingüe heredada del modelo base, aunque no se declaran idiomas concretos en la model card.
- Contexto efectivo de hasta 32 768 tokens, con ventana local de 512 y atención global periódica.
- Ejecución íntegra on-device: embedding, atención, MLP y cabeza de vocabulario completa en la NPU.
- Salida en JSON con respuesta, IDs de tokens e información de velocidad mediante `gemma-xdna2 generate --json`.
- Verificación de integridad del bundle y de compatibilidad de kernels mediante `gemma-xdna2 verify`.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo thinking en esta model card.

## Casos de uso

- Inferencia on-device en portátiles o mini-PC con NPU XDNA2: el modelo permite ejecutar un LLM de 1B íntegramente en la NPU, liberando CPU y GPU para otras tareas, con un consumo y una ocupación de memoria controlados.
- Validación de pipelines de compilación para NPU: sirve como referencia reproducible para verificar que un toolchain (ETRI-OAC) genera kernels correctos, usando `doctor --probe`, `verify` y `generate` como batería de comprobación end-to-end.
- Prototipado de asistentes locales con contexto largo: los 32 768 tokens de contexto permiten resumir documentos extensos o mantener conversaciones multi-turno sin salir del dispositivo.
- Investigación en cuantización de bajo bit: el formato Q4_1 con grupos de 32 y escala BF16 es un caso práctico para estudiar el impacto de la cuantización en la calidad de un modelo de 1B.
- Benchmarking de hardware: la métrica de tokens/s de decodificación (48,69 tok/s medidos en el host ai356) permite comparar configuraciones de driver, firmware y NPU.
- Educación y demostraciones: al no requerir GPU dedicada ni PyTorch, es adecuado para entornos docentes donde se quiera mostrar inferencia real sobre aceleradores especializados.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse localmente sin dependencias de nube, encaja en escenarios donde los datos no pueden salir del dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor declara explícitamente que la calidad del modelo es **REPORT_ONLY**.

Los únicos datos de rendimiento publicados son de compatibilidad y velocidad en hardware concreto:

| Métrica | Valor | Contexto |
|---|---|---|
| Decodificación | 48,69 tokens/s | Host ai356, 11 submissions de decodificación medidas |
| Prompt de validación | "What is the capital of France?" | Respuesta: "The capital of France is Paris!" |
| Validación E2E pública | Completada el 2026-11-14 en aisbc450 | Instalación desde PyPI |
| Validación E2E en ai356 | 2026-11-16, CPython 3.12.3, Linux 7.0.0-38, firmware 1.1.2.64 | Memlock de 3,81 GiB |
| Cobertura de validación | 1, 16 y 26 capas; 27 posiciones secuenciales; contexto de 128 a 32 768 tokens | Comprobaciones de primeros tokens y logits secuenciales |

## Requisitos de hardware

- NPU AMD XDNA2 con driver y firmware compatibles; acceso de lectura/escritura al nodo de dispositivo (normalmente `/dev/accel/accel0`).
- CPU host x86_64 con CPython 3.12 sobre Linux; glibc >= 2.39 y libstdc++ con `GLIBCXX_3.4.32` y `CXXABI_1.3.15`.
- Memlock mínimo de 2 GiB; 4 GiB recomendados para validación end-to-end (el host ai356 funcionó con 3,81 GiB).
- Descarga del modelo de aproximadamente 1,34 GB; el repositorio ocupa 1,3 GB.
- No se proporciona fallback a CPU: si la NPU o el driver no son compatibles, el modelo no se ejecuta.
- Opciones de despliegue: exclusivamente el runtime `gemma-xdna2==0.1.0a2` desde PyPI. No es compatible con vLLM, llama.cpp, Ollama, TGI ni `AutoModel.from_pretrained`.
- VRAM estimada: no aplica en el sentido habitual (no usa GPU); el modelo reside en la NPU y en memoria del host. No se detalla el reparto exacto de memoria entre NPU y host.
- Throughput medido: 48,69 tokens/s de decodificación en el host ai356. No se publica latencia de primer token.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / runtime | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gemma-3-1B-IT-XDNA2-Q4_1 (este) | 1B | 32 768 | Q4_1 nativo XDNA2, runtime `gemma-xdna2` | Gemma | Hugging Face, 0 descargas, 1 like |
| google/gemma-3-1b-it | 1B | 32 768 (según modelo base) | safetensors, Transformers | Gemma | Hugging Face (modelo oficial) |
| Versiones GGUF de Gemma 3 1B IT | 1B | 32 768 (según modelo base) | GGUF, llama.cpp / Ollama | Gemma | Amplia disponibilidad en la comunidad |
| Otros modelos 1B on-device (p. ej. Llama 3.2 1B) | 1B | no disponible en esta ficha | safetensors / GGUF | Llama | Hugging Face |

La comparativa relevante no es de calidad (no hay benchmarks publicados para este artefacto), sino de ruta de despliegue: este bundle es la única opción de la tabla que ejecuta el modelo completo sobre NPU XDNA2, a cambio de perder portabilidad y de exigir un runtime y una revisión de modelo fijados.

## Limitaciones y advertencias

- Calidad declarada como **REPORT_ONLY**: el autor no garantiza la calidad del modelo cuantizado; se publica como evidencia de compatibilidad, no como artefacto listo para producción.
- Sin fallback a CPU: si la NPU, el driver o el firmware no son compatibles, no hay ejecución alternativa.
- Contrato de versión estricto: el runtime `gemma-xdna2==0.1.0a2` y la revisión `3098bf6f...` deben usarse juntos; el runtime verifica el contrato de kernels y modelo.
- Formato propietario: no es GGUF ni safetensors estándar; no se puede cargar con `AutoModel.from_pretrained`, llama.cpp, vLLM ni Ollama.
- Decodificación greedy únicamente documentada (argmax); no se describe soporte de muestreo, temperatura o top-p.
- Idiomas soportados no declarados en la model card; cualquier limitación multilingüe del modelo base aplica sin documentar.
- Riesgo de alucinación y sesgos heredados de Gemma 3 1B IT, no evaluados en esta cuantización.
- Restricciones de licencia Gemma: es necesario revisar los términos de uso comercial de la licencia Gemma de Google antes de cualquier despliegue productivo.
- Validación limitada a hosts concretos (aisbc450 y ai356); no cualifica otras combinaciones de driver o firmware.
- Repositorio con 0 descargas y 1 like en el momento de la consulta: ecosistema mínimo, sin garantías de mantenimiento comunitario.
- Requiere permisos de `sudo` para ajustar memlock en la validación descrita, lo que puede ser un obstáculo en entornos gestionados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yongseungyu/Gemma-3-1B-IT-XDNA2-Q4_1
- Modelo base: https://huggingface.co/google/gemma-3-1b-it
- Runtime en PyPI: https://pypi.org/project/gemma-xdna2/0.1.0a2/
- Revisión fijada del modelo: https://huggingface.co/yongseungyu/Gemma-3-1B-IT-XDNA2-Q4_1/tree/3098bf6f10549f058ee27e8f7ac14fddd6a97964
- Repositorio del modelo base (revisión original): https://huggingface.co/google/gemma-3-1b-it/tree/dcc83ea841ab6100d6b47a070329e1ba4cf78752
- No se han encontrado en la información proporcionada papers, blogs, repositorios de código ni demos adicionales del proyecto ETRI-OAC.
