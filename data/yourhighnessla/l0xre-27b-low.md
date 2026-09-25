# YourHighnessLA/L0xRE-27b-Low

## Resumen

L0xRE-27b-Low es un build GGUF cuantizado a baja precisión (aproximadamente 2-3 bits por peso) construido sobre el modelo base Qwen/Qwen3.8-27B por el desarrollador independiente YourHighnessLA (Sean YH). No es un modelo entrenado desde cero, sino una receta de cuantización híbrida denominada E3, que aplica precisión muy baja a las proyecciones y mantiene embeddings y capa de salida en alta precisión. El objetivo declarado es ejecutar un modelo descrito como de 27B parámetros en GPUs de consumo, con una configuración certificada de 12 GiB de VRAM en una RTX 4090 y una ventana de contexto nativa de 262.144 tokens (256K).

La arquitectura se apoya en 64 bloques transformer, un vocabulario de 248.320 tokens y decodificación especulativa mediante un drafter DFlash2 incluido en el propio repositorio (en dos variantes, Q4_K_M y Q2_K). El autor publica cifras internas de decodificación de 115,4 tok/s con 11,7 GiB de VRAM y 80K de contexto en una RTX 4090, y 139,5 tok/s en configuración full-GPU con 32K de contexto.

Su relevancia es acotada y muy ligada al ecosistema propio del autor: el modelo solo está cualificado sobre el runtime L0xRE BeeLLama, un fork de llama.cpp, y no sobre llama.cpp estándar, Ollama, LM Studio, Transformers o SGLang. El repositorio acumula 0 descargas y 0 likes en el momento de redactar esta ficha, por lo que carece de validación externa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido de 64 bloques sobre el modelo base Qwen3.8-27B; receta de cuantización E3 (proyecciones en baja precisión, embeddings y salida en alta precisión) |
| Parámetros totales | 4.784.193.024 según el campo de safetensors del repositorio (dato probablemente residual, ya que el repositorio solo contiene GGUF); la model card describe el modelo como de 27B parámetros. Discrepancia no aclarada por el autor |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 262.144 tokens nativos; configuraciones certificadas de 81.920 (80K) y 262.144 (256K) tokens |
| Tipos de cuantización | Cuerpo del modelo en GGUF de aproximadamente 2-3 bpw; KV cache con tipos kvarn3/kvarn2; drafters en Q4_K_M y Q2_K con tipos de KV q4_0 y q2_0 |
| Idiomas soportados | en (inglés) |
| Licencia | other, con licencia declarada qwen-research-terms-derivative, derivada de los términos de investigación/comunidad de Qwen3.8-27B; el tooling del runtime L0xRE se distribuye bajo Apache-2.0 |
| Formato de pesos | GGUF (ejecutable con llama.cpp modificado, concretamente el runtime L0xRE BeeLLama) |

## Arquitectura y entrenamiento

La información disponible no describe un proceso de entrenamiento propio: L0xRE-27b-Low es una derivada cuantizada de Qwen/Qwen3.8-27B, por lo que el preentrenamiento y las etapas de alineación (RLHF, DPO u otras) corresponden al modelo base y no se detallan en la documentación proporcionada. Lo que sí se especifica es la receta de cuantización E3, que combina proyecciones en precisión muy baja (aproximadamente 2-3 bits por peso) con embeddings y capa de salida en mayor precisión, una estrategia habitual para contener la degradación de calidad cuando se baja mucho el ancho de bits. El modelo conserva 64 bloques transformer, un contexto nativo de 262.144 tokens y un vocabulario de 248.320 entradas.

La innovación técnica principal no está en el modelo en sí, sino en el sistema de inferencia que lo acompaña. Se distribuye junto a dos drafters DFlash2 que habilitan decodificación especulativa mediante el tipo `draft-dflash`, con hasta 3 tokens de borrador por paso, y existe una variante separada (L0xRE-27b-Low-MTP) que añade un bloque de predicción `nextn` de 830 MB para autoborrador sin fichero adicional. La KV cache admite cuantización con los tipos kvarn3/kvarn2, lo que permite sostener contextos de 256K en 16 GiB de VRAM. Todo ello exige el runtime L0xRE BeeLLama, con kernels de decodificación propios (commit de puerto `107970f`), y no funciona sobre llama.cpp estándar.

## Capacidades

- Generación de texto conversacional en inglés, con modo de razonamiento activable (`--reasoning on`, `--reasoning-effort low`, `--reasoning-budget 8192`).
- Razonamiento matemático: la suite interna del autor incluye una tarea específica de `reason-math`.
- Generación y comprensión de código: el autor reporta métricas de "code decode" y tareas de `bug-find` y `cli-40`.
- Tool calling y function calling: la suite interna incluye una prueba de `toolcall`.
- Salida estructurada y extracción de datos (`structured-output`, `data-extract`).
- Comportamiento agéntico multi-paso: la suite incluye una prueba etiquetada como `agent-20`.
- Seguimiento de instrucciones (`instruct-follow`).
- Decodificación especulativa con drafter externo (DFlash2) o autoborrador mediante cabeza MTP en la variante específica.
- Capacidades multilingües: no disponibles; el modelo declara únicamente inglés.
- Visión, audio u otras modalidades: no disponibles.

## Casos de uso

- Asistencia de programación en local sobre una RTX 4090: con la configuración certificada de 12 GiB y 80K de contexto, el modelo permite mantener en VRAM una ventana amplia de código y documentación, con 115,4 tok/s de decodificación, suficiente para autocompletado y refactorización interactiva sin depender de servicios en la nube.
- Agentes de línea de comandos: la suite interna incluye tareas `cli-40` y `agent-20`, lo que apunta a un uso como motor de agentes que ejecutan comandos, leen salidas y encadenan pasos, apoyándose en tool calling y en el modo de razonamiento.
- Extracción estructurada de datos: las pruebas `structured-output` y `data-extract` de la suite del autor respaldan su uso para transformar texto no estructurado en JSON u otros formatos validables, con la salida de alta precisión de la receta E3 como salvaguarda frente a la degradación de formato.
- Atención al cliente multi-turno: la ventana nativa de 262.144 tokens permite arrastrar historiales muy largos o bases de conocimiento extensas en una sola sesión, aunque el idioma soportado se limita al inglés.
- Revisión de código y búsqueda de errores en pipelines de CI/CD: la tarea `bug-find` de la suite interna sugiere su uso como revisor automático que recibe un diff y emite un diagnóstico, integrándose mediante tool calling en flujos de integración continua.
- Razonamiento matemático asistido: la tarea `reason-math` permite emplearlo para resolver problemas paso a paso en entornos educativos o de análisis, ajustando el presupuesto de razonamiento según la dificultad.
- Despliegue en estaciones de trabajo con VRAM limitada: al caber en 12 GiB con cuantización de KV cache, es viable en equipos que no pueden alojar un modelo de 27B en precisión completa, a cambio de adoptar el runtime propietario del autor.
- Procesado de documentos largos en inglés: con 256K de contexto en una tarjeta de 16 GiB, se pueden resumir o consultar contratos, informes o transcripciones extensas sin troceado previo.

## Benchmarks y rendimiento

El autor publica dos conjuntos de cifras, ambos internos y no canónicos. La suite de calidad consta de ocho pruebas (toolcall, instruct-follow, structured-output, data-extract, reason-math, bug-find, agent-20 y cli-40) con 150 elementos por pasada y métrica pass@1.

| Configuración | Pasada 1 | Pasada 2 | Pasada 3 |
|---|---|---|---|
| L0xRE-27b-Low (thinking activado) | 124 / 150 | 121 / 150 | 126 / 150 |
| L0xRE-27b-Low (thinking desactivado) | 116 / 150 | no disponible | no disponible |
| Baseline con cuantización nativa (thinking desactivado) | 117 / 150 | no disponible | no disponible |

Las cifras de velocidad se midieron sobre una RTX 4090 (SM89) con el servidor BeeLLama:

| Configuración | Decodificación de código | TTFT | VRAM |
|---|---|---|---|
| 12 GiB / 80K de contexto + DFlash2-Q4 | 115,4 ± 2,4 tok/s | 289 ms | 11,7 GiB |
| 16 GiB / 256K de contexto + DFlash2-Q2 | 107,4 ± 3,5 tok/s | 295 ms | 13,9 GiB |
| Full-GPU / 32K de contexto + DFlash2-Q4 | 139,5 ± 7,5 tok/s (pico de 149,9) | 292 ms | ~20 GiB |

Comparado con el GGUF nativo equivalente en la release SM120 r9, el autor reporta ratios de prefill de 0,984-0,990 y de decodificación de 0,963-0,981, con 0,994 en prosa con DFlash2 y 1,004 en código con DFlash2. El autor advierte explícitamente que la suite es interna y no canónica, por lo que deben interpretarse como orientativas y no como resultados de leaderboard. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM para la configuración certificada de 12 GiB en una RTX 4090: 11,7 GiB medidos, con 80K de contexto y drafter DFlash2-Q4.
- VRAM para la configuración de 16 GiB en una tarjeta clase 5090: 13,9 GiB medidos, con 256K de contexto y drafter DFlash2-Q2.
- Configuración full-GPU con 32K de contexto: aproximadamente 20 GiB de VRAM.
- GPU recomendadas: RTX 4090 (SM89) como plataforma certificada principal y RTX 5090 (SM120, también bajo WSL) para la configuración de 16 GiB y 256K.
- Compatibilidad con GPU de consumo: sí, en RTX 4090 y RTX 5090. El autor no certifica otras tarjetas de consumo.
- Opciones de despliegue: exclusivamente el runtime L0xRE BeeLLama (rama `release/l0xre-sm89-v0.4.7` para SM89 y `beellama-sm120-v0.4.7-r9` para SM120). No está cualificado para llama.cpp estándar, Ollama, LM Studio, Transformers ni SGLang.
- Latencia: TTFT de 289-295 ms en las tres configuraciones medidas.
- Rendimiento: 107,4-139,5 tok/s de decodificación según configuración, con pico de 149,9 tok/s.
- Tamaños de fichero: 8.619.127.680 bytes el modelo principal, 1.143.006.816 bytes el drafter Q4_K_M y 705.430.880 bytes el drafter Q2_K; el repositorio completo ocupa 10,5 GB.
- Multi-slot: no forma parte de la cualificación; el autor solo certifica servicio de un solo slot.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Calidad (suite interna) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| L0xRE-27b-Low | 27B según la model card (4.784.193.024 en el campo safetensors del repo) | 262.144 tokens | GGUF ≈2-3 bpw + drafters Q4_K_M / Q2_K | 124-126 / 150 con thinking | qwen-research-terms-derivative | HuggingFace, requiere runtime L0xRE BeeLLama |
| Baseline con cuantización nativa de Qwen3.8-27B | no disponible | no disponible | cuantización nativa GGUF | 117 / 150 con thinking desactivado | términos de Qwen | disponible como referencia del propio autor |
| L0xRE-27b-Low-MTP | mismo modelo base más bloque nextn (+830 MB) | 262.144 tokens | GGUF ≈2-3 bpw con cabeza MTP integrada | no disponible | qwen-research-terms-derivative | HuggingFace |
| Hemmingway-1 | 27B | no disponible | no disponible | no disponible | Apache-2.0 | citado en resultados de búsqueda, sin datos comparables |
| Otros modelos de 27B de pesos abiertos | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La única comparación con datos numéricos es interna al propio autor: frente al baseline de cuantización nativa, L0xRE-27b-Low rinde peor con el modo de razonamiento desactivado (116 frente a 117 sobre 150) y mejor con el razonamiento activado (121-126 sobre 150). No se dispone de comparaciones verificables con alternativas de terceros en la información proporcionada.

## Limitaciones y advertencias

- Dependencia de runtime propietario: el modelo solo está cualificado sobre L0xRE BeeLLama y no funciona de forma soportada en llama.cpp estándar, Ollama, LM Studio, Transformers ni SGLang. Migrar a otro runtime deja al usuario sin garantías de comportamiento.
- Benchmarks internos y no canónicos: el propio autor advierte que la suite de 150 elementos es interna y que las cifras deben tratarse como orientativas. No hay resultados de MMLU, HumanEval, GSM8K ni de leaderboards independientes.
- Cobertura de cualificación estrecha: en SM89 solo se certifican dos configuraciones concretas con un único slot; el autoborrador MTP, los contextos más largos y el servicio multi-slot quedan fuera de la cualificación.
- Idioma único: solo inglés, sin capacidades multilingües declaradas, lo que limita su uso en productos en castellano u otras lenguas.
- Licencia restrictiva: la licencia qwen-research-terms-derivative remite a los términos de investigación/comunidad de Qwen3.8-27B. Conviene revisar el texto completo antes de cualquier uso comercial, ya que el nombre de la licencia sugiere orientación a investigación.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento del análisis; no hay informes independientes de comportamiento, sesgos o estabilidad.
- Discrepancia en el recuento de parámetros: la model card afirma 27B mientras que el campo de safetensors del repositorio declara 4.784.193.024, un dato probablemente residual dado que el repositorio solo distribuye GGUF. El autor no aclara la diferencia.
- Riesgo de alucinación: no se han publicado evaluaciones específicas de fidelidad factual ni de tasas de alucinación en la información disponible; la cuantización agresiva (2-3 bpw) es un factor de riesgo adicional de degradación.
- Sesgos: no disponible. No se documentan análisis de sesgo del modelo base ni del proceso de cuantización.
- Degradación por cuantización: la receta busca mitigarla con embeddings de alta precisión, pero el autor reconoce implícitamente una pérdida frente al GGUF nativo (ratios de decodificación de 0,963-0,981).
- Repositorio pesado: 10,5 GB entre modelo y drafters, más el runtime adicional necesario.
- Formato cerrado a GGUF: no se distribuyen safetensors ni pesos en otros formatos, lo que impide ajuste fino o conversión directa a otros motores sin trabajo adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/YourHighnessLA/L0xRE-27b-Low
- Variante con cabeza MTP: https://huggingface.co/YourHighnessLA/L0xRE-27b-Low-MTP
- Perfil del autor: https://huggingface.co/YourHighnessLA
- Modelos del autor: https://huggingface.co/YourHighnessLA/models
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-27B/blob/main/LICENSE
- Runtime L0xRE BeeLLama: https://github.com/seanyourhighness/L0xRE-BeeLLama-Low
- Catálogo y registro L0xRE: https://github.com/seanyourhighness/L0xRE
- Benchmarks de razonamiento de Qwen3.8 27B (off, low, medium, xhigh): https://kaitchup.substack.com/p/qwen38-27b-reasoning-benchmarks-off
- Artículo sobre Hemmingway-1, modelo de 27B: https://www.mindstudio.ai/blog/hemmingway-1-writing-model
- Leaderboard de modelos autoalojados: https://onyx.app/self-hosted-llm-leaderboard
