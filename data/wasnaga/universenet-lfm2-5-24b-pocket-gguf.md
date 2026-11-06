# wasnaga/UniverseNet-LFM2.5-24B-Pocket-GGUF

## Resumen

UniverseNet-LFM2.5-24B-Pocket-GGUF es una compresión extrema del modelo MoE LiquidAI/LFM2.5-24B-A2B, publicada por el usuario wasnaga bajo el paraguas conceptual de "Universe Network Renormalization-Group". El resultado es un checkpoint GGUF de 3,996 GB (3,722 GiB) que reduce los parámetros totales de 24,16B a 8,65B y los parámetros activos por token de 2,34B a 1,48B, manteniendo la topología completa de 64 expertos con top-4 en las 38 capas MoE. La motivación declarada es ejecutar un agente conversacional con razonamiento en un iPhone 16 Pro (8 GB de memoria unificada) en modo avión, sin conexión.

La técnica aplicada no poda expertos completos, sino que condensa cada experto in-place de 1.536 a 512 "orbitales" SwiGLU (compresión 3,0x por experto), seleccionando qué neuronas conservar mediante una combinación de fluctuación centrada, detección de picos fotoeléctricos top-3 y normas de dipolo ponderadas por RMSNorm. Las capas de atención GQA globales y los bloques de convolución corta LIV se mantienen bit-idénticos al modelo profesor. El resultado es un modelo que conserva el layout de tensores `lfm2moe` y por tanto es compatible de forma nativa con llama.cpp, PocketPal AI, LLM Farm, Enclave, Ollama y LM Studio.

La relevancia práctica es doble: por un lado demuestra que es posible llevar un MoE de 24B a un móvil de gama alta con pérdida medible pero controlada (PPL de 71,097 frente a 31,683 del profesor en WikiText-2, es decir 2,24x peor); por otro, la licencia LFM 1.0 y la naturaleza experimental del método de condensación exigen cautela antes de usarlo en producción. El modelo conserva el modo de razonamiento `<think>...</think>` del profesor y supera las 8/8 pruebas cualitativas de chat, matemáticas y código reportadas por el autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE híbrida `lfm2moe` (atención GQA + bloques convolucionales cortos LIV + capas MoE con 64 expertos top-4) |
| Parámetros totales | 8.645.714.432 (8,65B) en el checkpoint destilado; 24.159.516.928 (24,16B) en el profesor |
| Parámetros activos | 1.476.530.176 (1,48B) por token; 2.338.728.192 (2,34B) en el profesor |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantización | GGUF Q3_K (variante publicada `-v3-Q3K`); el layout admite Q3_K y Q4_K por alineación con super-bloques de 256 elementos |
| Idiomas soportados | no disponible |
| Licencia | LFM 1.0 (`lfm1.0`, marcada como `other` en Hugging Face) |
| Formato de pesos | GGUF (`llama.cpp`), compatible con PocketPal AI, LLM Farm, Enclave, Ollama y LM Studio |

## Arquitectura y entrenamiento

El modelo base es LFM2.5-24B-A2B de Liquid AI, un transformer MoE híbrido con 38 capas que combinan 10 capas de atención GQA global (bloques 2, 6, 10, 14, 18, 22, 26, 30, 34 y 38) y 30 bloques de convolución corta LIV con kernel 3 y compuerta. Cada capa MoE contiene 64 expertos con `top_k = 4` y una dimensión de feed-forward por experto de 1.536 en el profesor. El checkpoint destilado conserva exactamente esa topología (64 expertos, top-4) pero reduce la dimensión interna de cada experto a 512, valor divisible por el tamaño de super-bloque de 256 que usan Q3_K y Q4_K en llama.cpp, lo que garantiza compatibilidad nativa.

El proceso de condensación, descrito por el autor como "Renormalization-Group & Covalent Orbital Condensation", consta de cuatro etapas: (1) selección de 512 orbitales por experto sobre un corpus de calibración multiescala de 61.440 tokens (10.570 IDs únicos) que incluye trazas de razonamiento `<think>`, frases enciclopédicas, párrafos completos y bloques simbólicos/código/aritmética; (2) combinación de fluctuación centrada `Std(K - mu_K)`, detector de picos top-3 y normas de dipolo de receptor ponderadas por RMSNorm; (3) supresión de orbitales redundantes mediante solapamiento de activación/emisión triangular superior y plegado de los receptores `W_up` podados en los 512 anclas retenidas, todo en espacio de pesos; (4) resolución RG con covarianza de contracción Marchenko-Pastur (0,78) que pliega las corrientes podadas en `W_down` mediante un solve rank-1 que preserva la media, seguido de un paso suave de Gauss-Seidel acoplado a los expertos activos. Las capas de atención y convolución se mantienen bit-idénticas al profesor.

No se especifica en la información disponible si hubo RLHF, DPO o una fase de entrenamiento adicional; el proceso descrito es puramente de condensación post-entrenamiento sobre los pesos del profesor. Tampoco se detalla la composición exacta del corpus de calibración más allá de las categorías mencionadas.

## Capacidades

- Generación de texto conversacional multi-turno con modo de razonamiento explícito `<think>...</think>` heredado del profesor, con cierre correcto del bloque en las 8 pruebas reportadas.
- Razonamiento aritmético y algebraico paso a paso: el autor verifica `15% de 240 = 36`, `2x + 5 = 17 → x = 6`, `12 × 13 = 156`, `100 − 37 = 63` y `3,5 horas = 210 minutos`, todos correctos en modo greedy.
- Generación de código: produce funciones Python correctas (por ejemplo, una función que devuelve el máximo de una lista) en las pruebas cualitativas del autor.
- Conocimiento factual enciclopédico: responde correctamente a preguntas como la capital de Australia o el autor de la Mona Lisa.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente más allá del modo `<think>`; el autor lo etiqueta como "Pocket MoE Agent" pero no detalla integración con frameworks de agentes.
- Capacidades multilingües: no disponible.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Asistente personal offline en iPhone o iPad: el checkpoint de 3,996 GB cabe en los 8 GB de memoria unificada del iPhone 16 Pro y se ejecuta en modo avión con PocketPal AI, LLM Farm o Enclave, activando solo 1,48B parámetros por token para generación rápida sin conexión.
- Tutor de matemáticas y álgebra en dispositivos móviles: el modelo resuelve ecuaciones lineales paso a paso y muestra el razonamiento en `<think>`, útil para aplicaciones educativas que necesitan explicar el procedimiento y no solo la respuesta.
- Autocompletado y generación de código en editores móviles o entornos sin red: produce funciones Python sencillas y puede integrarse en un editor iOS o en una CLI local vía llama.cpp para sugerencias de código en entornos air-gapped.
- Prototipado rápido de chatbots en Apple Silicon: al ser GGUF nativo de llama.cpp, se puede levantar con Ollama o LM Studio en un Mac para validar flujos conversacionales antes de comprometerse con un modelo mayor o con APIs en la nube.
- Demostración de investigación sobre condensación de MoE: sirve como caso de estudio reproducible de cómo la compresión de orbitales por experto afecta a la perplejidad (2,24x) y a la tasa de acuerdo top-1 (52,79%) frente al profesor, útil para quienes investigan pruning y destilación de MoE.
- Asistente de consulta factual en campo: para técnicos o investigadores que trabajan sin conectividad y necesitan respuestas enciclopédicas breves (capitales, autoría de obras, conversiones de unidades) con latencia baja en hardware móvil.
- Evaluación comparativa de cuantizaciones GGUF: al conservar el layout `lfm2moe` con `expert_feed_forward_length = 512`, permite experimentar con Q3_K y Q4_K sobre el mismo checkpoint para medir el compromiso entre tamaño y calidad en dispositivos con memoria limitada.

## Benchmarks y rendimiento

Los únicos datos disponibles son los reportados por el autor en la model card, comparando el profesor `LFM2.5-24B-A2B-Q4_K_M` con el checkpoint destilado `UniverseNet-LFM2.5-24B-Pocket-8.6B-v3-Q3K`. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

| Métrica | Profesor (LFM2.5-24B-A2B-Q4_K_M) | Destilado (Pocket-8.6B-v3-Q3K) |
|---|---|---|
| Parámetros totales | 24.159.516.928 (24,16B) | 8.645.714.432 (8,65B, −64,2%) |
| Parámetros activos por token | 2.338.728.192 (2,34B) | 1.476.530.176 (1,48B, −36,9%) |
| Expertos MoE (total / top-k) | 64 / 4 (`M_exp = 1536`) | 64 / 4 (`M_exp = 512`, plegado 3,0x) |
| Tamaño GGUF (decimal / binario) | 14,526 GB (13,529 GiB) | 3,996 GB (3,722 GiB, 3,64x menor) |
| PPL en WikiText-2 (held-out) | 31,683 | 71,097 (2,24x peor) |
| Acuerdo top-1 / top-5 next-token (held-out) | 100,0% / 100,0% | 52,79% / 78,99% |
| Coseno / ratio de norma en capa 40 (held-out) | 1,0000 / 1,0000 | 0,7703 / 0,9365 |
| Cierre de `<think>...</think>` en chat (held-out) | 8/8 (100%) | 8/8 (100%) |
| Precisión factual y matemática en chat (held-out) | 8/8 (100%) | 8/8 (100%) |

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 4 GB para el checkpoint Q3_K publicado (3,996 GB decimales / 3,722 GiB), más overhead de contexto y caché KV de llama.cpp.
- GPU recomendadas: no se especifican en la información proporcionada; el enfoque del autor es CPU/GPU unificada en Apple Silicon (iPhone 16 Pro, iPad, Macs con memoria unificada).
- ¿Cabe en GPU consumer? Sí en términos de memoria: cualquier GPU con 6 GB o más de VRAM puede alojar el checkpoint Q3_K; no se documenta el rendimiento específico en RTX 4090, A100 o H100.
- Opciones de despliegue: llama.cpp (referencia del autor), PocketPal AI, LLM Farm, Enclave, Ollama y LM Studio. Compatible con el ecosistema GGUF estándar.
- Latencia y throughput: no se publican números concretos de tokens por segundo; el autor afirma que el modelo "cabe cómodamente" en los 8 GB del iPhone 16 Pro y que la activación de solo 1,48B parámetros por token permite "generación ultrarrápida", pero sin cifras medibles.

## Comparativa con modelos similares

| Modelo | Parámetros totales / activos | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| UniverseNet-LFM2.5-24B-Pocket-8.6B (este) | 8,65B / 1,48B | no disponible | LFM 1.0 | GGUF en Hugging Face | Destilado de LFM2.5-24B-A2B; PPL 71,097 en WikiText-2 |
| LiquidAI/LFM2.5-24B-A2B (profesor) | 24,16B / 2,34B | no disponible | LFM 1.0 | Pesos originales y GGUF Q4_K_M | PPL 31,683 en WikiText-2; 3,64x más grande |
| Otros MoE móviles de tamaño similar | no disponible | no disponible | no disponible | no disponible | No se identifican alternativas comparables en la información proporcionada |

La comparación directa más relevante es con el propio profesor: el destilado pierde 2,24x en perplejidad y baja al 52,79% de acuerdo top-1, pero reduce el tamaño 3,64x y los parámetros activos un 36,9%, lo que lo hace viable en un móvil de 8 GB. No se dispone de datos frente a otros modelos de la misma categoría (por ejemplo, otros MoE de 8B con topología similar) para establecer una comparativa externa rigurosa.

## Limitaciones y advertencias

- Degradación medible de calidad: la perplejidad en WikiText-2 sube de 31,683 a 71,097 (2,24x) y el acuerdo top-1 con el profesor cae al 52,79%, lo que indica divergencia sustancial en la distribución de next-token.
- Riesgo de alucinación incrementado: aunque las 8 pruebas cualitativas del autor son correctas, la caída de acuerdo top-1 y el ratio de norma de 0,9365 en la capa 40 sugieren que en dominios fuera del corpus de calibración el modelo puede desviarse más que el profesor.
- Corpus de calibración limitado: 61.440 tokens y 10.570 IDs únicos es un conjunto pequeño para condensar 38 capas MoE; el sesgo hacia las categorías incluidas (razonamiento, enciclopedia, código, aritmética) puede dejar fuera otros dominios.
- Idiomas soportados no documentados: no se especifica qué lenguas conserva el proceso de condensación ni si el multilingüismo del profesor se preserva.
- Longitud de contexto no disponible: no se indica la ventana de contexto efectiva del checkpoint destilado ni si coincide con la del profesor.
- Licencia LFM 1.0: es una licencia "other" con términos específicos de Liquid AI; es imprescindible revisar el enlace de licencia antes de cualquier uso comercial, ya que puede imponer restricciones adicionales a las de una licencia permisiva estándar.
- Modelo experimental: el repositorio tiene 0 descargas y 0 likes en el momento de la ficha, y el método de condensación ("Renormalization-Group", "Covalent Orbital Condensation") es una propuesta idiosincrásica del autor sin validación independiente publicada.
- Sin benchmarks estándar: no hay resultados de MMLU, HumanEval, GSM8K ni evaluaciones de seguridad, lo que impide comparar rigurosamente con alternativas consolidadas.
- Soporte de tool calling y agentes no verificado: aunque el autor lo etiqueta como "Agent", no se documenta integración con function calling ni con frameworks de agentes.
- Fecha de creación futura en los metadatos (2026-11-05): conviene verificar la integridad y procedencia del repositorio antes de desplegarlo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/wasnaga/UniverseNet-LFM2.5-24B-Pocket-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B
- Licencia LFM 1.0: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B/blob/main/LICENSE
- PocketPal AI (App Store): no disponible como enlace directo en la información proporcionada
- llama.cpp: no disponible como enlace directo en la información proporcionada
- Ollama: no disponible como enlace directo en la información proporcionada
- LM Studio: no disponible como enlace directo en la información proporcionada
