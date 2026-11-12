# zephel01/Ornith-1.5-397B-IQ2_XXS-16G64G-GGUF

## Resumen

Ornith-1.5-397B es un modelo de lenguaje de arquitectura MoE (mezcla de expertos) desarrollado por ornith-ai, publicado bajo licencia MIT. La ficha que nos ocupa no es el modelo original, sino una cuantización GGUF extrema realizada por el usuario zephel01, orientada a ejecutar un modelo de ~403.000 millones de parámetros en un PC con una GPU de 16 GB de VRAM y 64 GB de RAM, manteniendo una ventana de contexto de 128K tokens.

La cuantización emplea IQ2_XXS con imatrix para los expertos enrutados (los 512 expertos se conservan íntegros, con 10 expertos activos por token más el compartido) y tipos más precisos (Q5_K, IQ4_XS) para la parte densa, de modo que el KV cache en fp16 pueda residir en una tarjeta de 16 GB. El resultado es un GGUF de 110,6 GB repartido en tres shards.

El interés de esta ficha es doble: por un lado, documenta una técnica de cuantización agresiva que permite acercarse a modelos de escala frontera en hardware de consumo; por otro, advierte de que el rendimiento es muy limitado (en torno a 9-10 tok/s) porque aproximadamente la mitad de los expertos no caben en GPU + RAM y se leen desde el SSD durante la decodificación. Requiere el motor Abyss v1.3.122 o superior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE tipo qwen35moe (transformer con atención completa y SSM/delta-net), 60 capas, 512 expertos enrutados, 10 activos por token más uno compartido; bloque NextN (MTP) en `blk.60` |
| Parametros totales | 402.941.918.464 (~403B) |
| Parametros activos | no disponible (la model card no indica el número exacto de parámetros activos) |
| Longitud de contexto | 128K tokens (objetivo de diseño de esta build) |
| Tipos de cuantizacion | IQ2_XXS (expertos enrutados, algunos `ffn_down` en Q2_K) con imatrix; Q5_K (delta-net `attn_qkv`, expertos compartidos); IQ4_XS (`attn_gate`, `ssm_out`, atención completa `attn_q/k/v/output`); Q8_0/F32 (routers, normas, `ssm_alpha`/`ssm_beta`); Q5_K/IQ3_S (cabeza de salida y embeddings); Q4_K (bloque NextN) |
| Idiomas soportados | inglés (en) y japonés (ja) |
| Licencia | MIT |
| Formato de pesos | GGUF (3 shards: 44,1 GB + 44,2 GB + 22,3 GB = 110,6 GB) |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE con 60 capas y 512 expertos enrutados por capa, de los cuales se activan 10 por token más un experto compartido. La arquitectura combina atención completa con componentes de tipo SSM (delta-net, `ssm_out`, `ssm_alpha`/`ssm_beta`), lo que sugiere un diseño híbrido. Incluye además un bloque NextN (multi-token prediction, MTP) en la capa `blk.60`, que el motor Abyss aprovecha para decodificación especulativa (drafting).

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO; la model card de esta cuantización no los detalla y no se ha proporcionado la del modelo base. La innovación técnica destacable de esta ficha es la propia cuantización: se conservan los 512 expertos (sin poda) en IQ2_XXS con una imatrix, mientras que la parte densa se rebaja a Q5_K + IQ4_XS para que ocupe 5,4 GB en VRAM (frente a 8,7 GB de la variante 32G128G) y deje espacio al KV cache fp16 para 128K de contexto en una GPU de 16 GB.

## Capacidades

- Generación de texto conversacional (`pipeline_tag: text-generation`, tag `conversational`).
- Razonamiento y respuesta multi-turno gracias a la ventana de 128K tokens.
- Capacidades multilingües limitadas a inglés y japonés.
- Decodificación especulativa mediante el bloque NextN (MTP) integrado, explotado por el motor Abyss.
- Ejecución con offload parcial a CPU y lectura desde SSD de los expertos que no caben en memoria.
- No se documentan en la información disponible capacidades de visión, audio, tool calling ni uso agéntico; deben considerarse no disponibles.

## Casos de uso

- Inferencia local de un modelo de escala ~400B en hardware de consumo: un equipo con GPU de 16 GB y 64 GB de RAM puede ejecutar el modelo a 128K de contexto, aceptando el coste de velocidad (~9-10 tok/s) a cambio de no depender de la nube.
- Procesamiento de documentos largos en inglés o japonés: la ventana de 128K permite resumir o analizar contratos, informes o artículos extensos en una sola pasada, con el modelo residente en local.
- Asistencia conversacional offline: chat multi-turno con contexto amplio para entornos sin conectividad o con requisitos de privacidad, donde los datos no pueden salir del equipo.
- Experimentación e investigación en cuantización: sirve como banco de pruebas para medir el impacto de IQ2_XXS + imatrix frente a Q8_0 (KL, perplejidad, coincidencia de top token) en modelos MoE de gran escala.
- Evaluación de motores de inferencia con offload: útil para validar el comportamiento de Abyss (gestión de VRAM, tier de RAM, lectura O_DIRECT desde NVMe) en escenarios de memoria restringida.
- Generación de texto en japonés: tareas de redacción, traducción asistida o análisis de contenido nipón, con una degradación de calidad medida muy cercana a la del inglés (KL 0,040 frente a 0,033).
- Prototipado de pipelines que requieran un modelo grande sin presupuesto de GPU profesional, aceptando la latencia como contrapartida.

## Benchmarks y rendimiento

La model card no incluye benchmarks estándar (MMLU, HumanEval, GSM8K). Sí aporta métricas de calidad de la cuantización (KL frente a Q8_0 con `llama-perplexity --kl-divergence`, 8 chunks de 1024 tokens en inglés y japonés) y de velocidad:

| Metrica | 32G128G (Q8_0 denso) | Denso todo Q5_K | Esta build (Q5_K + IQ4_XS) | Denso todo IQ4_XS |
|---|---:|---:|---:|---:|
| Tamano | 114,2 GB | 111,3 GB | 110,6 GB | 110,1 GB |
| KL medio | 0,1655 | 0,1780 | 0,1823 | 0,1921 |
| KL percentil 99 | 1,11 | 1,23 | 1,16 | 1,19 |
| Mismo top token | 79,1% | 78,3% | 78,4% | 78,0% |
| PPL vs Q8_0 | +5,1% | +5,5% | +5,9% | +6,9% |

| Metrica adicional | Valor |
|---|---|
| KL japonés vs 32G128G (1.024 tokens) | 0,040 (inglés 0,033; código 0,059) |
| NLL japonés | 1,685 (idéntico al 32G128G) |
| Throughput (RTX 5090 capada a 16 GB, 44 GB tier RAM, NVMe O_DIRECT 4,9 GB/s) | ~9-10 tok/s |
| Comparativa de velocidad en el mismo PC | La variante 122B 16G64G es ~5-6x más rápida |

## Requisitos de hardware

- VRAM: 16 GB de GPU como objetivo de diseño; la parte densa ocupa 5,4 GB en VRAM y el resto queda para el KV cache fp16 a 128K.
- RAM: 64 GB de sistema; en la medición se usó un tier de 44 GB dentro de un límite de 60 GB.
- Almacenamiento: se recomienda NVMe SSD; en la prueba se midieron lecturas O_DIRECT de 4,9 GB/s durante la decodificación. Aproximadamente la mitad de los expertos se leen desde el SSD.
- GPU recomendadas: el caso medido es una RTX 5090 con memoria capada a 16 GB; se menciona como origen del proyecto una RX 9070 XT de 16 GB. No hay datos publicados para otras GPU.
- Cabe en GPU de consumo de 16 GB, siempre que se combine con 64 GB de RAM y SSD rápido.
- Motor de despliegue: Abyss v1.3.122 o superior (medido con v1.3.133); versiones anteriores rechazan cargar el modelo por los 10 expertos enrutados por token. No se indica compatibilidad con llama.cpp, vLLM, Ollama o TGI.
- Latencia y throughput: ~9-10 tok/s en decodificación sobre el equipo de prueba; la carga de prompts largos puede ser lenta (la model card menciona que con ciertas configuraciones de la parte densa el prompt se procesa token a token, minutos para 4K).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tamano GGUF | Hardware objetivo | Velocidad | Licencia |
|---|---|---:|---:|---|---|---|
| Ornith-1.5-397B IQ2_XXS 16G64G (esta ficha) | ~403B (MoE) | 128K | 110,6 GB | 16 GB GPU + 64 GB RAM | ~9-10 tok/s | MIT |
| Ornith-1.5-397B IQ2_XXS 32G128G | ~403B (MoE) | 128K | 114,2 GB | 32 GB GPU + 128 GB RAM | no disponible | MIT |
| Ornith-1.5-122B IQ3_XXS 16G64G | ~122B (MoE) | no disponible | 52,1 GB | 16 GB GPU + 64 GB RAM | ~5-6x más rápida que esta build | MIT |
| Ornith-1.5-122B IQ4_XS 24G64G | ~122B (MoE) | no disponible | 68,9 GB | 24-32 GB GPU + 64 GB RAM | no disponible | MIT |

No se dispone de datos de benchmarks que permitan comparar el rendimiento cualitativo con modelos de otras familias.

## Limitaciones y advertencias

- Estado BETA: medido en un solo PC con la VRAM capada por software a 16 GB; el autor solicita reportes de tarjetas reales de 16 GB.
- Velocidad muy baja (~9-10 tok/s) por la lectura de expertos desde SSD; no apta para aplicaciones interactivas con requisitos de latencia estrictos.
- Calidad degradada respecto a Q8_0: KL medio 0,1823, PPL +5,9% y solo 78,4% de coincidencia en el top token.
- Dependencia de un motor específico (Abyss ≥ v1.3.122); no hay evidencia de compatibilidad con el ecosistema estándar de llama.cpp.
- Idiomas limitados a inglés y japonés; el rendimiento en castellano no está documentado.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se han publicado evaluaciones de sesgo ni de seguridad.
- Aunque la licencia es MIT, conviene verificar las condiciones del modelo base `ornith-ai/Ornith-1.5-397B` antes de un uso comercial.
- El prompt largo puede ser extremadamente lento según la configuración del motor; la model card describe casos de minutos para 4K tokens.
- Requiere SSD NVMe rápido; un disco más lento degradará aún más el throughput.

## Enlaces

- Repositorio Hugging Face de esta cuantización: https://huggingface.co/zephel01/Ornith-1.5-397B-IQ2_XXS-16G64G-GGUF
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-397B
- Variante 32G128G: https://huggingface.co/zephel01/Ornith-1.5-397B-IQ2_XXS-32G128G-GGUF
- Variante 122B 16G64G: https://huggingface.co/zephel01/Ornith-1.5-122B-IQ3_XXS-16G64G-GGUF
- Variante 122B 24G64G: https://huggingface.co/zephel01/Ornith-1.5-122B-IQ4_XS-24G64G-GGUF
- Motor Abyss: https://github.com/zephel01/Abyss
- Issue de origen (Abyss #44): https://github.com/zephel01/Abyss/issues/44
- Issues de Abyss para reportes: https://github.com/zephel01/Abyss/issues
