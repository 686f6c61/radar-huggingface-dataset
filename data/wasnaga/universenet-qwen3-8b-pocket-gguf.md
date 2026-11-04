# wasnaga/UniverseNet-Qwen3-8B-Pocket-GGUF

## Resumen

UniverseNet-Qwen3-8B-Pocket es una edición derivada de Qwen/Qwen3-8B publicada por el usuario wasnaga en HuggingFace bajo licencia Apache 2.0. El autor describe el proceso como una "transmutación física" del modelo base que reduce el número de parámetros de 8,19B a 5,51B (−32,8%) mediante una combinación de compresión de las capas FFN SwiGLU (de 12.288 a 6.144 orbitales) y destilación LoRA de rango 64. El resultado se distribuye en formato GGUF cuantizado Q4_0 con proyección V en Q8_0, con un tamaño de 2,94 GB, pensado para ejecutarse en dispositivos móviles iOS (iPhone 16 Pro) mediante PocketPal AI, LLM Farm o Enclave, incluso en modo avión.

La propuesta del autor se enmarca en un marco teórico propio denominado "Universe Network" (leyes 1-9), que emplea conceptos de renormalización, multipolos rápidos de Ewald y plegado orbital para justificar la compresión. Aunque el modelo base es Qwen3-8B, la model card no proporciona información sobre el contexto nativo, los idiomas soportados ni detalles estándar del entrenamiento original. El checkpoint se presenta como compatible con los kernels estándar de qwen3 en llama.cpp, Ollama y LM Studio, lo que permite su despliegue sin modificaciones del runtime.

El interés actual de esta ficha radica en evaluar críticamente una propuesta de compresión agresiva orientada a inferencia local en móvil, con métricas declaradas de perplejidad y throughput, pero sin validación independiente ni publicación de resultados en benchmarks estándar (MMLU, HumanEval, GSM8K).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only derivado de Qwen3-8B, con FFN SwiGLU comprimida (6.144 orbitales en lugar de 12.288) |
| Parametros totales | 5.505.861.444 (5,51B) segun model card; 5.472.826.368 segun safetensors del repo |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_0 con V-proj en Q8_0 (unico archivo publicado, 2,94 GB) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); repo de 3,2 GB |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Qwen3-8B (transformer decoder-only con atención completa y FFN SwiGLU). El autor aplica dos transformaciones principales descritas en la model card: (1) una descomposición del campo de propagación de secuencia en ventana cercana deslizante (W = 256), 8 anclas de carga gaussiana de frecuencia cero y 32 polos portadores de carga dinámicos por chunk, denominada "Ley 6 (Ewald Fast-Multipole Boson Field)"; y (2) una compresión de las 36 capas FFN SwiGLU de 12.288 a 6.144 orbitales (factor 2,0x) mediante una resolución de grupo de renormalización de rango 1 aumentada con preservación de media y `bias=False`, calibrada sobre 49.152 tokens reales, seguida de 96 pasos de destilación LoRA de rango 64 (KL Top-64 del profesor + Cholesky de gramática de vocabulario + coseno) fusionada in-place (`W += B @ A`).

El autor afirma una similitud coseno acumulada de trayectoria de 98,35% en las 36 capas y que el checkpoint resultante es "100% compatible de forma nativa" con los kernels qwen3 de llama.cpp, PocketPal AI, LLM Farm, Enclave, Ollama y LM Studio. No se documenta el dataset de entrenamiento original de Qwen3-8B, ni si hubo RLHF/DPO en el modelo base, ni el número total de tokens de entrenamiento. La terminología empleada (leyes del universo, orbitales, bosones) no corresponde a descripciones estándar de arquitecturas transformer y no se acompaña de paper, código de reproducción ni artefactos de validación independientes.

## Capacidades

- Generación de texto conversacional y finalización de texto, heredadas del modelo base Qwen3-8B.
- Razonamiento multi-paso con traza de pensamiento (`<think>...</think>`), desactivable mediante el sufijo `/no_think` en el prompt, segun la model card.
- Generación de código y matemáticas, con modo thinking recomendado por el autor para tareas multi-paso.
- Compatibilidad declarada con tool calling y function calling por herencia de Qwen3-8B (no verificado en esta ficha).
- Capacidades multilingües por herencia del modelo base (idiomas no especificados en la model card).
- Ejecución offline en dispositivo móvil (modo avión) mediante PocketPal AI, LLM Farm o Enclave.
- Integración con runtimes estándar de llama.cpp, Ollama y LM Studio sin kernels modificados.

## Casos de uso

- Asistente de código offline en iPhone: el modelo se carga en PocketPal AI con ~3,1 GB de memoria unificada en iPhone 16 Pro y permite autocompletado y explicación de fragmentos sin conexión, útil en entornos sin red o con requisitos de privacidad.
- Chat conversacional en modo avión: al ejecutarse íntegramente en el dispositivo, ninguna consulta sale del terminal, lo que encaja en escenarios de confidencialidad (sanidad, legal, defensa) donde no se permite tráfico a la nube.
- Prototipado rápido de agentes móviles: la compatibilidad declarada con tool calling de Qwen3 permite construir flujos multi-paso (consulta, cálculo, respuesta) en una app iOS sin backend.
- Educación y demostraciones: el tamaño de 2,94 GB y la licencia Apache 2.0 facilitan su distribución en talleres y cursos para ilustrar inferencia local de LLM en hardware de consumo.
- Pruebas de compresión de modelos: sirve como caso de estudio para investigadores interesados en técnicas de reducción de parámetros en FFN (plegado de orbitales, destilación LoRA) y su impacto en perplejidad.
- Sustitución de modelos 4B en dispositivos con poca memoria: el autor reporta perplejidad de validación 14,525 frente a 16,038 del Qwen3-4B, lo que sugiere que puede reemplazar a modelos más pequeños manteniendo calidad razonable en un footprint similar.
- Inferencia en Apple Silicon: el checkpoint es compatible con llama.cpp en macOS, por lo que puede usarse como modelo ligero en portátiles con memoria unificada.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados de forma independiente):

| Metrica | Qwen3-8B (profesor) | UniverseNet-Qwen3-8B-Pocket-5.5B |
|---|---|---|
| Parametros totales | 8.190.735.360 | 5.505.861.444 |
| Orbitales FFN SwiGLU | 12.288 | 6.144 |
| Huella BF16 | 15.622,6 MB | 10.501,6 MB |
| GGUF movil (Q4_0 + Q8_0 V-proj) | ~5,03 GB | 2,94 GB (3.014,5 MB) |
| Perplejidad validacion (WikiText-2 + Code) | 11,914 | 14,525 |
| Top-1 / Top-5 next-token accuracy | 52,96% / 76,01% | 47,99% / 71,86% |
| Prefill throughput (N=2048, RTX 4080) | spill WDDM en GPU de 16 GB | 4.777,4 tok/s (428,7 ms, 13,86 GB VRAM) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~3,1 GB de memoria unificada en iPhone 16 Pro segun el autor; ~13,86 GB de VRAM en RTX 4080 para prefill con N=2048 (dato declarado).
- GPU recomendadas: RTX 4080 (16 GB) validada por el autor para prefill; Apple Silicon (iPhone 16 Pro, Mac con memoria unificada) soportado via llama.cpp/PocketPal.
- Cabe en GPU de consumo: sí, en GPUs con ≥4 GB de VRAM para el GGUF Q4_0 (estimación basada en el tamaño del archivo); en iPhone 16 Pro ocupa ~3,1 GB.
- Opciones de despliegue: llama.cpp, PocketPal AI, LLM Farm, Enclave, Ollama, LM Studio.
- Latencia y throughput: 4.777,4 tok/s de prefill con N=2048 en RTX 4080 (428,7 ms) segun el autor; no se reporta throughput de decodificación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad (WikiText-2+Code) | Licencia | Formato |
|---|---|---|---|---|---|
| UniverseNet-Qwen3-8B-Pocket-5.5B | 5,51B | no disponible | 14,525 | Apache 2.0 | GGUF |
| Qwen/Qwen3-8B (profesor) | 8,19B | no disponible en esta ficha | 11,914 | Apache 2.0 | safetensors, GGUF |
| Qwen/Qwen3-4B (referencia del autor) | ~4B | no disponible en esta ficha | 16,038 | Apache 2.0 | safetensors, GGUF |

La comparativa se limita a los datos aportados por el autor; no se dispone de resultados de benchmarks estándar para situar el modelo frente a alternativas de la misma categoría (p. ej. Llama 3.1 8B, Gemma 2 9B, Mistral 7B). Los datos de contexto de los modelos comparados no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- La model card emplea terminología no estándar ("leyes del universo", "orbitales", "bosones") y no incluye paper, código de reproducción ni artefactos de validación independientes; las métricas declaradas no han sido verificadas por terceros.
- Discrepancia en el recuento de parámetros: la model card indica 5.505.861.444 mientras que los safetensors del repo reportan 5.472.826.368.
- Solo se publica una cuantización (Q4_0 con V-proj Q8_0); no hay versiones Q5, Q6, Q8 ni BF16 del checkpoint transmutado.
- La reducción de parámetros se traduce en una caída de calidad medible: perplejidad de 14,525 frente a 11,914 del profesor y Top-1 de 47,99% frente a 52,96%.
- No se especifican idiomas soportados ni longitud de contexto en la model card; estos datos deben contrastarse con la ficha oficial de Qwen3-8B antes de usarlo en producción.
- Riesgo de alucinación inherente a modelos de 5,5B y acentuado por la compresión; no se han publicado evaluaciones de factualidad.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del checkpoint transmutado ni sobre la procedencia de los tokens de calibración.
- El modelo está orientado a inferencia móvil; no se recomienda como sustituto directo de Qwen3-8B en pipelines de producción de alta exigencia sin una evaluación propia.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación comunitaria.

## Enlaces

- HuggingFace: https://huggingface.co/wasnaga/UniverseNet-Qwen3-8B-Pocket-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- PocketPal AI (App Store): no disponible en la información proporcionada
- LLM Farm: no disponible en la información proporcionada
- Enclave: no disponible en la información proporcionada
- llama.cpp: no disponible en la información proporcionada
- Paper o blog del autor: no disponible en la información proporcionada
