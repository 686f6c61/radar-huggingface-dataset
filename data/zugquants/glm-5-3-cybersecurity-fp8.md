# zugquants/GLM-5.3-CYBERSECURITY-FP8

## Resumen

GLM-5.3-CYBERSECURITY-FP8 es una modificación de pesos («crack», en la terminología del autor) del modelo GLM-5.3 de Z.ai, publicada por el usuario zugquants y firmada en su model card por dealignai. Se trata de un derivado del cuantizado FP8 JANGQ-AI/GLM-5.3-FP8, que a su vez cuantiza el GLM-5.3 original de 753.329.940.480 parámetros totales (unos 753,3 mil millones) con arquitectura `glm_moe_dsa`, 78 capas y modalidad exclusivamente textual. La modificación elimina o atenúa las negativas de seguridad (abliteración) de forma selectiva para contenido de ciberseguridad ofensiva: pentesting, red team, desarrollo de exploits, ingeniería inversa, evasión, phishing, ataques a credenciales y análisis de malware.

El interés técnico del checkpoint no reside solo en la modificación de comportamiento, sino en que conserva el formato FP8 nativo del cuantizado base: los expertos enrutados en FP8 quedan intactos y únicamente se editan los escritores de residuo en bf16, de modo que el modelo mantiene la velocidad de tensor cores FP8 en hardware Hopper (H100/H200) sin necesidad de fine-tuning, LoRA, hooks en tiempo de ejecución ni trucos de prompt. Según la model card, el modelo se sirve con vLLM estándar y conserva la capacidad del base: la evaluación MMLU en modo logit da un 86,65 % (889/1026) frente al 85,58 % del base, una diferencia de +1,07 pp dentro del margen de tolerancia declarado de ±5 pp.

Es relevante ahora porque combina tres factores poco habituales: un tamaño frontera (753B) en FP8 servible en un solo nodo de 8 GPU, una licencia MIT que permite uso comercial, y una especialización explícita en un dominio de doble uso. Al mismo tiempo, la información disponible es muy limitada (0 descargas, 0 likes, repositorio creado y actualizado en el mismo segundo) y la búsqueda web no ha devuelto ninguna fuente relacionada con el modelo, por lo que la ficha se apoya exclusivamente en la model card y en los metadatos de HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `glm_moe_dsa` (transformer MoE con atención dispersa tipo DSA), 78 capas, solo texto |
| Parametros totales | 753.329.940.480 (~753,3 mil millones), dato real de safetensors |
| Parametros activos | no disponible |
| Longitud de contexto | 1M declarada en la model card; techo práctico documentado de ~131.072 tokens en TP8 sobre 8×H200 con MTP y ~160K sin MTP; 131K verificado con `--max-num-seqs 24` |
| Tipos de cuantizacion | FP8 nativo (expertos enrutados en FP8, escritores de residuo en bf16); no disponible información sobre GGUF, AWQ o GPTQ |
| Idiomas soportados | en, zh, ru, sr, hi, fr, es, ar, ko, ja |
| Licencia | MIT |
| Formato de pesos | safetensors (tamaño del repo: 755,7 GB) |

Otros datos: pipeline `text-generation`, tags `abliterated`, `crack`, `refusal-removed`, `domain-specific`, `cybersecurity`, `offensive-security`, `red-team`, `pentest`, `glm`, `moe`, `fp8`; región `us`. Modelos base declarados: `zai-org/GLM-5.3` y `JANGQ-AI/GLM-5.3-FP8`.

## Arquitectura y entrenamiento

La arquitectura es `glm_moe_dsa`: un transformer de mezcla de expertos (MoE) con atención dispersa DSA (*DeepSeek sparse attention*), 78 capas y naturaleza solo texto. El checkpoint es un cuantizado FP8 del GLM-5.3 de Z.ai, y la modificación de comportamiento se aplica sobre los pesos, no sobre el entrenamiento: según la model card, los expertos enrutados en FP8 permanecen sin cambios y solo se editan los escritores de residuo en bf16. No se ha realizado fine-tuning, LoRA, hooks en tiempo de ejecución ni manipulación de prompts; el resultado se carga con vLLM estándar.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset del modelo base, ni sobre las etapas de RLHF o DPO aplicadas por Z.ai; tampoco se detalla la metodología exacta de la abliteración (qué componentes de residuo se editan y con qué criterio). Las innovaciones técnicas documentadas son las heredadas del base: decodificación especulativa MTP (multi-token prediction), atención dispersa DSA y soporte de FP8 nativo en Hopper. La model card señala que el MTP no funciona en vLLM estándar y que solo se ha reportado operativo en el fork de vLLM con MLA dispersa de ciprianveg (backend `B12X_MLA_SPARSE`), con una mejora declarada del +48 % en decodificación sobre prompts de código. También indica que el contexto de 1M mediante *decode-context-parallel* está cerrado actualmente para `glm_moe_dsa` en vLLM, porque el `k_cache` del indexador DSA se replica entre rangos DCP mientras la KV MLA se fragmenta, lo que provoca un error de páginas no divisibles con `fp8_ds_mla`.

## Capacidades

- Generación de texto y conversación multi-turno en 10 idiomas (inglés, chino, ruso, serbio, hindi, francés, español, árabe, coreano y japonés).
- Conocimiento y asistencia técnica en ciberseguridad ofensiva: pentesting, red team, desarrollo de exploits, ingeniería inversa, técnicas de evasión, phishing, ataques a credenciales y análisis de malware, con negativas notablemente reducidas en estas categorías.
- Razonamiento explícito con modo *thinking* (`<think>`), controlable mediante `reasoning_effort`; en este checkpoint solo se aceptan los valores `"low"` y `"high"`, y cualquier otro valor cae a `max` (sin posibilidad de desactivar el razonamiento).
- Tool calling / function calling, con parser `glm47` y `--enable-auto-tool-choice` en vLLM.
- Capacidad para bucles de agente y razonamiento multi-paso, aunque con la advertencia de que en FP8 conviene usar `reasoning_effort="low"` en uso agéntico para no agotar el presupuesto de `max_tokens`.
- Razonamiento matemático y generación de código, heredados del modelo base (sin cifras específicas publicadas en esta variante).
- Sin capacidades de visión ni audio: el base es explícitamente solo texto.

## Casos de uso

- **Red team autorizado y pruebas de penetración**: generación de hipótesis de ataque, cadenas de explotación y planes de prueba sobre un alcance acordado, aprovechando la reducción de negativas en contenido ofensivo y el contexto práctico de 131K tokens para mantener en memoria el alcance, el inventario y los hallazgos previos de un engagement.
- **Análisis y triaje de malware**: resumen de comportamiento de muestras, extracción de indicadores y explicación de técnicas de persistencia en flujos SOC, donde el modelo puede procesar informes largos y volcados de strings dentro de la ventana de contexto.
- **Automatización de análisis de vulnerabilidades**: integración en pipelines que ingieren resultados de escáneres (SAST/DAST) y producen explicaciones técnicas y borradores de parche, con tool calling para consultar bases de datos de CVE o repositorios.
- **Formación y concienciación en seguridad ofensiva**: generación de material didáctico y ejercicios de laboratorio para cursos de pentesting, con contenido técnico que otros modelos rechazarían por defecto.
- **Ingeniería inversa asistida**: apoyo en la lectura de binarios descompilados, identificación de estructuras y reconstrucción de lógica, aprovechando la ventana de contexto larga para adjuntar fragmentos extensos de código.
- **Investigación en seguridad de IA y evaluación de salvaguardas**: uso del checkpoint como objeto de estudio para medir la transferibilidad de la abliteración entre dominios (la model card documenta que otras categorías, como armas, química, biología o acoso, siguen recibiendo cumplimiento con envoltorio «educativo»).
- **Generación de reglas de detección**: redacción de firmas YARA, reglas Sigma y consultas de detección a partir de descripciones de técnicas MITRE ATT&CK, con soporte multiidioma para equipos distribuidos.

## Benchmarks y rendimiento

La model card solo publica una evaluación de capacidad (MMLU en modo logit, sin generación) y una batería de comportamiento (HarmBench-320). No hay datos de HumanEval, GSM8K, MMLU-Pro ni de benchmarks de código o matemáticas para esta variante.

| Evaluacion | Base | CRACK Cybersecurity FP8 | Delta | Umbral (±5 pp) |
|---|---|---|---|---|
| MMLU global (1026 preguntas, modo logit) | 85,58 % | 86,65 % (889/1026) | +1,07 pp | pasa |

Nota de la model card: la cifra del base (85,58 %) corresponde a una línea base previa de GLM-5.3 en bf16 antes de la cuantización; la línea base directa sobre el FP8 está pendiente de confirmación, por lo que la comparación debe tomarse con cautela.

Comportamiento en HarmBench-320 (greedy, 240 comportamientos sin copyright, que es la superficie real de daño):

| `reasoning_effort` | Cumplimiento directo | Negativa suave | Redirección | Deflexión | Negativa dura | Sin clasificar |
|---|---|---|---|---|---|---|
| off | 196 (81,7 %) | 4 | 2 | 1 | 0 | 37 |
| low | 202 (84,2 %) | 4 | 8 | 0 | 1 | 25 |
| max | 192 (80,0 %) | 3 | 3 | 0 | 0 | 40 |

Sobre el conjunto completo de 320 comportamientos (incluye 80 de copyright), el cumplimiento directo se sitúa entre el 63,4 % y el 69,7 %, con un 15,9-18,1 % de negativas suaves concentradas en reproducción literal de material con copyright (aproximadamente el 60-68 % de ese bucket). El bucket «sin clasificar» recoge respuestas que cumplen con encuadre suave y que el subclasificador no pudo asignar con claridad.

## Requisitos de hardware

- **Peso de los pesos**: 755,7 GB en FP8 para 753,3B parámetros, lo que exige agregar memoria entre varias GPU; no cabe en una sola GPU de 80 GB ni en ninguna GPU de consumo.
- **Configuración validada**: TP8 sobre 8×H200 (141 GB por GPU, ~1128 GB agregados) con `--max-model-len 131072`, `--max-num-seqs 24`, `--gpu-memory-utilization 0.90` y `--enforce-eager`; la model card reporta ~2,98× de holgura de concurrencia en esa configuración.
- **Configuración probada por terceros**: 8× DGX Spark GB10, según la nota de campo de @0xMagnus enlazada en la model card.
- **GPU de consumo**: no viable. No se documenta ninguna cuantización de menor precisión (GGUF de 4 bits, AWQ, GPTQ) que pudiera reducir el requisito.
- **Opciones de despliegue**: vLLM estándar (es la vía soportada y recomendada); MTP con decodificación especulativa requiere el fork de vLLM con MLA dispersa de ciprianveg y `--draft-attention-backend B12X_MLA_SPARSE`. No hay información sobre soporte en TGI, TensorRT-LLM, llama.cpp u Ollama, y por tamaño y arquitectura resultan poco probables.
- **Paralelismo**: PP2 × TP4 perfila correctamente, pero el borrador MTP no implementa `SupportsPP`, por lo que se pierde la decodificación especulativa en esa topología.
- **Latencia y throughput**: la model card solo aporta un dato relativo: +48 % de decodificación en prompts de código con MTP sobre el fork B12X. No se publican valores absolutos de tokens por segundo ni de latencia por petición.
- **Requisito de configuración adicional**: `--enforce-eager` es obligatorio para la ruta de atención dispersa bajo concurrencia, con la penalización de rendimiento que ello implica.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| zugquants/GLM-5.3-CYBERSECURITY-FP8 (este) | 753,3B | 1M declarado / ~131K practico en TP8 | MIT | safetensors FP8 | Abliterado para ciberseguridad ofensiva; MMLU logit 86,65 % |
| zai-org/GLM-5.3 (base) | 753B segun la model card | no disponible | no disponible | no disponible | Modelo original de Z.ai; texto, 78 capas, arch `glm_moe_dsa` |
| JANGQ-AI/GLM-5.3-FP8 | 753,3B (derivado) | no disponible | no disponible | safetensors FP8 | Cuantizado FP8 del base; alineamiento original intacto |
| dealignai/GLM-5.3-UNCENSORED-FP8 | 753,3B (derivado) | no disponible | no disponible | safetensors FP8 | Hermano del mismo autor con abliteración generalista, no limitada a ciberseguridad |

No se dispone de datos de benchmarks comparables entre estas variantes más allá del MMLU y HarmBench-320 de este checkpoint, por lo que no es posible establecer una comparación de rendimiento en código, matemáticas o razonamiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- **Riesgo de seguridad y legal**: el modelo ha sido modificado para reducir negativas en contenido de ciberseguridad ofensiva (explotación, evasión, phishing, ataques a credenciales). Su uso fuera de entornos autorizados (pentesting con contrato, red team, investigación, formación) puede ser ilegal en muchas jurisdicciones, con independencia de que la licencia MIT permita el uso comercial.
- **Abliteración no universal**: la model card advierte explícitamente de que otras categorías (armas, química, biología, acoso, desinformación) siguen recibiendo cumplimiento con un envoltorio «educativo» debido al sustrato compartido de las negativas. No es un modelo sin censura generalista; para ese fin el autor remite a su variante UNCENSORED.
- **Copyright**: la reproducción literal de material protegido sigue recibiendo negativas suaves en esta variante (aproximadamente el 60-68 % del bucket de copyright en HarmBench-320).
- **Alucinación**: no se han publicado evaluaciones de factualidad ni de tasa de alucinación para esta variante; el riesgo es el del modelo base, no medido aquí.
- **Sesgos**: no se han publicado evaluaciones de sesgo, toxicidad ni equidad. Los idiomas cubiertos (10) incluyen lenguas con pocos recursos como el serbio, para las que no hay datos de calidad.
- **Caveat de configuración de razonamiento**: `reasoning_effort` solo acepta `"low"` y `"high"`; cualquier otro valor, incluido `off` o un `off:` YAML sin comillas (que se interpreta como booleano `false`), cae a `max`. No es posible desactivar el razonamiento en este checkpoint.
- **Agotamiento de presupuesto en modo agéntico**: con `high`/`max` en FP8 el modelo puede consumir todo el `max_tokens` dentro de `<think>` y devolver cero tokens de respuesta (finish=`length`). No se corrige ajustando parámetros de muestreo (temp 0 con rep 1.05, temp 0.7 con top-p 0.95); si se necesita `high`/`max`, hay que usar `max_tokens ≥ 8000`.
- **Detalle de API**: el texto de razonamiento se expone en `message.reasoning`, no en `message.reasoning_content`.
- **Limitaciones de contexto en producción**: el contexto de 1M no es alcanzable hoy con *decode-context-parallel* en vLLM sobre `glm_moe_dsa`; el techo práctico es de ~131K tokens con MTP y ~160K sin MTP en TP8 sobre H200.
- **Madurez del artefacto**: 0 descargas y 0 likes, repositorio creado y actualizado en el mismo segundo, y ninguna fuente externa localizable en la búsqueda web. La model card está firmada por dealignai mientras el repositorio se publica bajo la cuenta zugquants, sin que se explique la relación; conviene tratar el artefacto como no auditado por terceros.
- **Requisito de infraestructura**: no es desplegable en hardware de consumo ni en una única GPU; exige un nodo de 8 GPU de clase H200 o equivalente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zugquants/GLM-5.3-CYBERSECURITY-FP8
- Modelo base original: https://huggingface.co/zai-org/GLM-5.3
- Cuantizado FP8 intermedio: https://huggingface.co/JANGQ-AI/GLM-5.3-FP8
- Variante hermana sin censura generalista: https://huggingface.co/dealignai/GLM-5.3-UNCENSORED-FP8
- Discusión con notas de despliegue en 8× DGX Spark GB10: https://huggingface.co/dealignai/GLM-5.3-UNCENSORED-FP8/discussions/3
- Perfil del autor de la model card: https://huggingface.co/dealignai
- Perfil de @0xMagnus (pruebas de campo): https://huggingface.co/0xMagnus
- Twitter del autor de la model card: https://twitter.com/dealignai

Nota: la búsqueda web realizada no ha devuelto ningún resultado relacionado con este modelo; los enlaces anteriores proceden exclusivamente de los metadatos de HuggingFace y de la model card.
