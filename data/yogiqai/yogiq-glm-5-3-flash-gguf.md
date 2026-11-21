# YogiQAI/YogiQ-GLM-5.3-Flash-GGUF

## Resumen

YogiQ GLM-5.3-Flash es una cuantización GGUF del modelo zai-org/GLM-5.3-Flash, publicada por el usuario YogiQAI. El modelo base es un transformer de tipo mixture-of-experts (MoE) con 320.000 millones de parámetros totales (313.326.811.966 según los pesos en safetensors) y aproximadamente 18.000 millones activos por token. Combina 34 capas de atención lineal KDA con 11 capas de atención DSA/MLA, 3 capas densas y 42 capas MoE con 288 expertos enrutados más 1 compartido por capa y enrutamiento top-8. El resultado es un modelo multimodal (texto e imagen) orientado a generación de código, razonamiento y conversación.

La relevancia de esta publicación no está en el modelo base, sino en el trabajo de cuantización: el autor ha medido la sensibilidad de cada bloque de expertos para colocar los bits de forma no uniforme, produciendo dos variantes que caben en hardware muy contenido. La variante Spark (108,3 GiB, IQ2_S/IQ3_XXS mixto, 2,97 bits por peso) cabe en una única NVIDIA DGX Spark de 121 GiB con contexto de 16K y visión activada. La variante Prime (118,0 GiB, 3,23 bits por peso) requiere unos 125 GiB y va destinada a dos Sparks, un Mac Studio de 192 GB o cuatro GPUs de 32 GB.

El modelo base está publicado por Z.ai (zai-org) bajo licencia MIT, y esta cuantización conserva esa licencia. Los idiomas declarados son inglés y chino. La versión oficial en FP8 ocupa 328 GB, de modo que estas cuantizaciones reducen el peso a aproximadamente un tercio manteniendo, según el autor, el 98 % del rendimiento en LiveCodeBench v6.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE híbrido: 45 capas (3 densas + 42 MoE), 34 capas de atención lineal KDA y 11 capas de atención DSA/MLA, 288 expertos enrutados + 1 compartido por capa MoE, top-8 routing |
| Parametros totales | 313.326.811.966 (~320B) |
| Parametros activos | ~18B por token |
| Longitud de contexto | 16K tokens verificado en la variante Spark sobre DGX Spark (contexto máximo del modelo base: no disponible) |
| Tipos de cuantizacion | Spark: IQ2_S, IQ3_XXS, Q6_K, Q8_0, BF16/F32 (2,97 bits/peso). Prime: IQ3_XXS, Q8_0, BF16/F32 (3,23 bits/peso) |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | MIT |
| Formato de pesos | GGUF (dividido en 3 shards por variante), más un proyector de visión F16 separado (`mmproj-GLM-5.3-Flash-F16.gguf`) |

## Arquitectura y entrenamiento

El modelo base GLM-5.3-Flash es un transformer MoE con 45 capas: 3 densas y 42 con mezcla de expertos. Cada capa MoE contiene 288 expertos enrutados más un experto compartido, con enrutamiento top-8. La atención no es uniforme: 34 capas usan atención lineal KDA y 11 capas usan atención DSA/MLA. El 95 % de los parámetros corresponde a los tres tensores de expertos enrutados de cada capa MoE (gate, up y down), lo que explica que la estrategia de cuantización se centre en ellos. El modelo incluye además una capa MTP (multi-token prediction) para decodificación especulativa, aunque el autor indica que no está incluida en estos GGUF, por lo que no hay drafting especulativo disponible desde estos ficheros.

Sobre el entrenamiento del modelo base no se proporciona información en la documentación disponible: no se detallan el número de tokens, la composición del dataset ni si hubo RLHF, DPO u otras fases de alineamiento. La innovación técnica documentada en esta publicación es el método de colocación de bits: el autor partió de una mezcla uniforme de 2 y 3 bits (106 GiB, perplejidad 3,539) e intercambió bloques de 7 capas de expertos gate/up a IQ3_XXS para medir la ganancia en perplejidad de cada bloque. El bloque 31-37 resultó el más sensible (ganancia de −0,100 en perplejidad por 1,9 GiB), seguido del 24-30 (−0,069); los bloques 38-44 fueron los menos sensibles (−0,034). La variante Spark aplica los bits extra a los dos mejores bloques (capas 24-37) y compensa el espacio reduciendo el núcleo no experto de Q8_0 a Q6_K, que es casi sin pérdida porque el núcleo representa solo el ~5 % del modelo. La calibración usa la importance matrix de Unsloth para GLM-5.3-Flash (bloques 0-44) y la cuantización se hizo con `llama-quantize` sobre el GGUF BF16 generado por el conversor de llama.cpp.

## Capacidades

- Generación de texto conversacional multi-turno en inglés y chino.
- Generación y razonamiento sobre código, con modo "thinking" activable (HumanEval+ 94,5 % con thinking, 90,2 % sin él).
- Razonamiento matemático y de lógica (resultados concretos de benchmarks matemáticos no disponibles en la información).
- Comprensión de imágenes: pipeline image-text-to-text con torre de visión y proyector F16 incluidos.
- Soporte de tool calling / function calling: no se documenta explícitamente en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no se documenta explícitamente; el modo thinking sugiere capacidad de razonamiento extendido, pero no hay detalles.
- Capacidades multilingües limitadas a inglés y chino según los metadatos del modelo.
- Compatibilidad con endpoints (tag `endpoints_compatible`) y con llama.cpp estándar (commit 330f018 o posterior, arquitectura `glm5-next`).

## Casos de uso

- Asistente de código en local sobre una DGX Spark: la variante Spark (108,3 GiB) permite ejecutar un modelo de 320B con 16K de contexto y visión en un único dispositivo, útil para autocompletado, revisión de parches y generación de tests en entornos sin acceso a la nube.
- Generación de código en pipelines de CI/CD: con HumanEval+ al 94,5 % en modo thinking, el modelo puede integrarse en flujos de revisión automática de pull requests o generación de documentación técnica a partir de diffs.
- Análisis de capturas de pantalla y diagramas: al incluir torre de visión, puede extraer texto de imágenes, interpretar diagramas de arquitectura o revisar interfaces en flujos de QA visual.
- Atención al cliente bilingüe inglés-chino: el modelo soporta conversaciones multi-turno con 16K de contexto, adecuado para soporte técnico que requiera mantener historial largo de incidencias.
- Procesamiento de documentación técnica extensa: con 16K de contexto y capacidad de razonamiento, puede resumir manuales, extraer especificaciones o responder preguntas sobre contratos y normativa en inglés o chino.
- Despliegue en estación de trabajo con Mac Studio de 192 GB: la variante Prime (118,0 GiB) permite ejecutar el modelo con mayor fidelidad (perplejidad 3,253 frente a 3,354) para tareas de investigación que requieran la mejor calidad posible sin cluster.
- Evaluación comparativa de cuantizaciones: los ficheros publicados sirven como referencia reproducible para estudiar el impacto de la colocación de bits en modelos MoE de gran tamaño, con perplejidades y checksums documentados.

## Benchmarks y rendimiento

| Benchmark | Variante Spark | Modelo completo (FP8/BF16) | Notas |
|---|---|---|---|
| HumanEval+ (thinking on) | 94,5 % | no disponible | Medido por el autor |
| HumanEval+ (thinking off) | 90,2 % | no disponible | Medido por el autor |
| LiveCodeBench v6 | 84,7 % | 86,7 % | Spark sobre muestra aleatoria de 150 problemas; la cifra del modelo completo la reporta un tercero sobre el conjunto completo |
| Perplejidad wikitext-2 (20×2048) | 3,354 ± 0,047 | no disponible | Menor es mejor |
| Perplejidad wikitext-2 (30×512) | 2,765 ± 0,060 | 2,2474 (BF16) | +23 % respecto a BF16 |
| Perplejidad wikitext-2 (30×512), Prime | 2,702 ± 0,059 | 2,2474 (BF16) | +20 % respecto a BF16 |

## Requisitos de hardware

- VRAM/RAM para la variante Spark: 108,3 GiB (116,3 GB). Cabe en una NVIDIA DGX Spark de 121 GiB con 16K de contexto y visión, dejando unos 5 GiB libres.
- VRAM/RAM para la variante Prime: 118,0 GiB (126,7 GB). Requiere ~125 GiB o más: dos DGX Spark, un Mac Studio de 192 GB o cuatro GPUs de 32 GB.
- GPU recomendadas: DGX Spark (una unidad para Spark, dos para Prime); Mac Studio de 192 GB; configuraciones de 4×32 GB (por ejemplo, RTX 5090 o A6000 en conjunto). Para el modelo base en FP8 se necesitan 328 GB, lo que exige múltiples A100/H100 de 80 GB.
- Cabe en GPU de consumo: la variante Spark no cabe en una GPU de consumo individual (requiere 108 GiB); Prime tampoco. No se documentan variantes de menor tamaño que quepan en una RTX 4090 de 24 GB.
- Opciones de despliegue: llama.cpp (commit 330f018 o posterior, arquitectura `glm5-next`) y cualquier herramienta construida sobre él; el tag `endpoints_compatible` sugiere compatibilidad con endpoints, aunque no se detalla. vLLM, TGI y Ollama no se mencionan en la información disponible.
- Latencia y throughput: no disponibles. El autor indica que la capa MTP no está incluida, por lo que no hay decodificación especulativa desde estos ficheros, lo que afecta al throughput respecto al modelo base.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| YogiQ GLM-5.3-Flash Spark (esta ficha) | 320B totales / ~18B activos | 16K verificado | MIT | GGUF, 108,3 GiB | Perplejidad 3,354 (20×2048); HumanEval+ 94,5 % |
| YogiQ GLM-5.3-Flash Prime | 320B totales / ~18B activos | 16K verificado | MIT | GGUF, 118,0 GiB | Perplejidad 3,253 (20×2048); requiere ~125 GiB |
| GLM-5.3-Flash oficial (FP8) | 320B totales / ~18B activos | no disponible | MIT | Peso oficial FP8, 328 GB | LiveCodeBench v6 86,7 % (reportado por tercero) |
| Mezcla uniforme 2/3 bits (referencia del autor) | 320B totales / ~18B activos | no disponible | MIT | GGUF, 106 GiB | Perplejidad 3,539; no cabe en una DGX Spark con contexto y visión |

No se dispone de datos de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Idiomas limitados a inglés y chino; no se declara soporte de castellano, por lo que el rendimiento en español no está verificado.
- La cuantización introduce pérdida de calidad medible: +23 % de perplejidad respecto a BF16 en la variante Spark y +20 % en Prime (configuración 30×512). En código, la caída es de 2 puntos en LiveCodeBench v6 (84,7 % frente a 86,7 %), aunque la comparación no es sobre el mismo conjunto de problemas.
- La capa MTP no está incluida, por lo que se pierde la decodificación especulativa y el throughput será menor que con el modelo base.
- Riesgo de alucinación inherente a los modelos de lenguaje de gran tamaño; no se documentan evaluaciones específicas de factualidad ni de sesgos.
- No se documentan sesgos conocidos ni evaluaciones de seguridad en la información disponible.
- El contexto máximo del modelo base no se especifica; solo se ha verificado un contexto de 16K en la variante Spark sobre DGX Spark.
- La licencia MIT permite uso comercial, pero conviene verificar las condiciones del modelo base en zai-org/GLM-5.3-Flash, ya que esta publicación es una cuantización derivada.
- El repositorio ocupa 244,1 GB en total (incluyendo ambas variantes y el proyector), lo que exige espacio de almacenamiento considerable incluso para descargar una sola variante.
- Los ficheros están divididos en tres shards por variante; es necesario apuntar llama.cpp al primer shard y este carga el resto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/YogiQAI/YogiQ-GLM-5.3-Flash-GGUF
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Artículo técnico del autor sobre la colocación de bits: https://yogiq.ai/research/glm-5-3-flash-on-one-dgx-spark
- llama.cpp: https://github.com/ggml-org/llama.cpp
