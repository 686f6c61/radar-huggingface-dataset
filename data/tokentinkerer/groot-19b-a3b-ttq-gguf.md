# TokenTinkerer/Groot-19B-A3B-TTQ-GGUF

## Resumen

Groot-19B-A3B-TTQ-GGUF es un conjunto de cuantizaciones GGUF del modelo GrootTeam/Groot-19B-A3B-261023, publicadas por el usuario TokenTinkerer bajo la receta propia TTQ (TokenTinkerer Quant). El modelo base es un transformer de tipo MoE (mixture of experts) con 18.985.723.008 parámetros totales y 3.000 millones de parámetros activos (la nomenclatura A3B indica 3B activos), derivado de la familia Qwen3.5-MoE según la etiqueta `qwen35moe`, e incluye un proyector de visión basado en un ViT de 27 bloques.

El repositorio ofrece once variantes de cuantización que abarcan desde 3,56 bpw (7,88 GiB) hasta 8,50 bpw (18,59 GiB), además de un proyector de visión Q8_0 de 586 MiB y una conversión BF16 de referencia de 35,4 GiB. Todas las variantes se generaron directamente desde una conversión BF16 del modelo original, sin pasos de recuantización intermedios, lo que elimina el ruido de cuantización heredado de versiones previas. El autor publica mediciones de divergencia KL frente a la referencia BF16 sobre dos corpus fijos, lo que permite comparar cada nivel de cuantización con el único GGUF publicado por el equipo upstream.

La relevancia de esta ficha radica en que el modelo base está posicionado por su autor como un modelo de razonamiento compacto y eficiente en presupuesto de tokens, orientado a cargas de trabajo con uso de herramientas. El conjunto TTQ permite desplegarlo en hardware de consumo con pérdidas de precisión medibles y acotadas, y proporciona una alternativa más pequeña y precisa que el Q4_K_M upstream en varios rangos de tamaño.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (etiqueta `qwen35moe`), con proyector de visión ViT de 27 bloques |
| Parámetros totales | 18.985.723.008 (18,99 B) |
| Parámetros activos | 3 B (denominación A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | IQ3_XXS, IQ3_XS, Q3_K_S, Q3_K_M, IQ4_XS, IQ4_NL, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; proyector de visión Q8_0; referencia BF16 |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); referencia BF16 en GGUF |
| Rango de tasas | 3,56 bpw (7,88 GiB) a 8,50 bpw (18,59 GiB) |
| Tamaño total del repositorio | 172,6 GB |
| Tensores del modelo | 753 |
| Compatibilidad | endpoints_compatible |

## Arquitectura y entrenamiento

El modelo base es un transformer con arquitectura de mezcla de expertos (MoE), identificado en las etiquetas del repositorio como `qwen35moe`, con 18,99 B de parámetros totales y 3 B activos por token. Incorpora además un codificador de visión compuesto por un ViT de 27 bloques, cuyo proyector se distribuye por separado en cuantización Q8_0. La etiqueta `mtp` sugiere soporte de multi-token prediction, aunque la información disponible no detalla su implementación. No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) del modelo original.

El trabajo de cuantización parte de una conversión BF16 del modelo original (38,9 GB, 753 tensores, sha256 4c69e32f…) construida y verificada tensor a tensor contra el payload de safetensors, con cuerpo bit-idéntico, upcasts F32 exactos y reordenación documentada de las cabezas V. La receta TTQ replica la misma asignación de tipo por tensor empleada en las escaleras de cuantización previas del autor (Qwen3.6-35B-A3B y Cyber-Tiel), aplicada por nombre exacto de tensor dado que Groot y Cyber-Tiel comparten el mismo conjunto de 753 nombres; cada nivel se verificó contra el mapa esperado con resultado 10/10 exacto. El fichero BF16 actúa como referencia de divergencia KL para todas las mediciones publicadas.

## Capacidades

- Generación de texto conversacional y razonamiento en tareas complejas, según el posicionamiento del autor upstream.
- Cargas de trabajo con uso de herramientas (tool calling) y razonamiento multi-paso.
- Eficiencia en presupuesto de tokens, orientada a despliegues compactos.
- Procesamiento de visión mediante el proyector ViT de 27 bloques incluido en el repositorio.
- Soporte multilingüe limitado a inglés y chino.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`).
- Posible soporte de multi-token prediction (etiqueta `mtp`), sin detalles técnicos disponibles.

## Casos de uso

- Despliegue en estaciones de trabajo con GPU de consumo: la variante IQ4_XS de 9,60 GiB permite ejecutar un MoE de 19 B totales y 3 B activos en GPUs con 12-16 GB de VRAM, manteniendo una divergencia KL de 0,0259 en código, inferior a la del Q4_K_M upstream de 10,86 GiB.
- Asistentes de código en local: la variante Q4_K_M TTQ de 11,17 GiB logra una divergencia KL de 0,0128 en el corpus de código (70% código, 10% diff, 10% terminal, 10% configuración) y un 96,08% de coincidencia top-1, adecuada para autocompletado y generación en entornos sin conexión.
- Razonamiento con uso de herramientas en agentes: el modelo base está orientado a cargas con tool calling y razonamiento multi-paso, y las variantes de 5,73 bpw en adelante mantienen una KL inferior a 0,01 en código, lo que reduce la degradación en cadenas de llamadas a funciones.
- Procesamiento de documentos con imagen: el proyector de visión Q8_0 de 586 MiB permite tareas de comprensión de imágenes junto con el cuerpo del modelo, útil para extracción de información de capturas o diagramas.
- Servicio de inferencia con llama.cpp en CPU/GPU mixto: el formato GGUF y la escalera completa permiten elegir el nivel de cuantización según la memoria disponible, desde 7,88 GiB hasta 18,59 GiB.
- Evaluación comparativa de cuantizaciones: el repositorio incluye la referencia BF16 y mediciones de KL sobre corpus fijos, lo que facilita reproducir experimentos de degradación por cuantización en pipelines de investigación.
- Atención al cliente y conversación multi-turno en inglés o chino: el modelo soporta ambos idiomas, aunque no se dispone de la longitud de contexto para dimensionar conversaciones largas.

## Benchmarks y rendimiento

El autor publica divergencia KL frente a la referencia BF16 sobre 40 fragmentos fijos de 512 tokens, en dos corpus: código (70% código / 10% diff / 10% terminal / 10% configuración) y wikitext-2 test. La columna ± es el error estándar entre fragmentos; top-1 es la coincidencia de token más probable.

| Fichero | Tipo | GiB | bpw | KL código ± | top-1 código | KL wiki ± | top-1 wiki |
|---|---|---:|---:|---|---:|---|---:|
| TTQ-3.56bpw-IQ3_XXS | IQ3_XXS | 7,88 | 3,56 | 0,052631 ± 0,001539 | 92,39% | 0,063697 ± 0,001198 | 87,43% |
| TTQ-3.72bpw-IQ3_XS | IQ3_XS | 8,23 | 3,72 | 0,047863 ± 0,001494 | 92,69% | 0,053595 ± 0,001020 | 88,45% |
| TTQ-3.87bpw-Q3_K_S | Q3_K_S | 8,55 | 3,87 | 0,040031 ± 0,001433 | 93,29% | 0,047536 ± 0,001012 | 89,64% |
| TTQ-4.09bpw-Q3_K_M | Q3_K_M | 9,06 | 4,09 | 0,031842 ± 0,001109 | 94,03% | 0,037841 ± 0,000875 | 90,33% |
| TTQ-4.34bpw-IQ4_XS | IQ4_XS | 9,60 | 4,34 | 0,025918 ± 0,001027 | 94,57% | 0,028927 ± 0,000615 | 91,68% |
| TTQ-4.70bpw-IQ4_NL | IQ4_NL | 10,39 | 4,70 | 0,015894 ± 0,000558 | 95,81% | 0,021609 ± 0,000699 | 92,58% |
| Upstream Q4_K_M | Q4_K_M | 10,86 | 4,80 | 0,025780 ± 0,000715 | 94,51% | 0,033124 ± 0,000627 | 91,10% |
| TTQ-5.05bpw-Q4_K_M | Q4_K_M | 11,17 | 5,05 | 0,012791 ± 0,000406 | 96,08% | 0,018195 ± 0,000502 | 93,40% |
| TTQ-5.73bpw-Q5_K_S | Q5_K_S | 12,68 | 5,73 | 0,009432 ± 0,000294 | 96,72% | 0,014180 ± 0,000406 | 94,40% |
| TTQ-6.16bpw-Q5_K_M | Q5_K_M | 13,63 | 6,16 | 0,006510 ± 0,000265 | 97,20% | 0,010011 ± 0,000220 | 94,82% |
| TTQ-6.76bpw-Q6_K | Q6_K | 14,96 | 6,76 | 0,005081 ± 0,000177 | 97,55% | 0,008637 ± 0,000339 | 95,67% |
| TTQ-8.50bpw-Q8_0 | Q8_0 | 18,59 | 8,50 | 0,004526 ± 0,000220 | 98,02% | 0,007521 ± 0,000197 | 95,78% |

Comparación destacada frente al único GGUF upstream (Q4_K_M, 10,86 GiB): la variante TTQ IQ4_XS (9,60 GiB) es un 11,6% más pequeña con KL de código equivalente (0,02592 frente a 0,02578, diferencia de 0,1 σ) y mejor en prosa (0,0289 frente a 0,0331); la variante IQ4_NL (10,39 GiB) es un 4,3% más pequeña con un 38% menos de KL en código y un 35% menos en wikitext. No se han publicado resultados de benchmarks de conocimiento general, razonamiento o matemáticas en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: desde ~8 GB (variante IQ3_XXS de 7,88 GiB) hasta ~19 GB (Q8_0 de 18,59 GiB), más 586 MiB adicionales si se usa el proyector de visión y el espacio de contexto y caché KV.
- GPU recomendadas: RTX 4090 (24 GB) para las variantes de 5,05 bpw en adelante; RTX 4080/4070 Ti (16 GB) para IQ4_XS e IQ4_NL; GPUs de 12 GB para las variantes de 3,56-3,87 bpw. Para despliegues de mayor concurrencia, A100 o H100 con las variantes Q6_K u Q8_0.
- Cabe en GPU de consumo: sí, todas las variantes; las de 3,56 a 4,70 bpw caben en GPUs de 12 GB o menos, y las de 5,05 a 6,76 bpw en GPUs de 16-24 GB.
- Opciones de despliegue: llama.cpp (librería declarada), con compatibilidad con endpoints; el formato GGUF permite su uso en servidores de inferencia basados en llama.cpp.
- Latencia y throughput: no disponibles. Al ser un MoE con 3 B de parámetros activos, el coste computacional por token es sustancialmente menor que el de un modelo denso de 19 B, pero no se han publicado cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|---|
| Groot-19B-A3B (este, TTQ) | 18,99 B | 3 B | no disponible | Apache 2.0 | GGUF, 11 niveles + BF16 | KL medida frente a BF16; visión incluida |
| Groot-19B-A3B upstream Q4_K_M | 18,99 B | 3 B | no disponible | Apache 2.0 | GGUF único | 10,86 GiB; KL código 0,02578, wiki 0,03312 |
| Cyber-Tiel-Coder-35B-A3B-MTP-TTQ | 35 B (aprox.) | 3 B | no disponible | no disponible | GGUF | Comparte el conjunto de 753 tensores con Groot; orientado a código |
| Qwen3.6-35B-A3B TTQ | 35 B (aprox.) | 3 B | no disponible | no disponible | GGUF | Escalera TTQ previa del mismo autor; referencia de receta |

La comparación con modelos de otras familias del mismo tamaño no está disponible en la información proporcionada. Los dos modelos TTQ citados pertenecen al mismo autor y sirven como referencia de metodología, no como alternativas de rendimiento medidas con los mismos benchmarks.

## Limitaciones y advertencias

- El modelo base está orientado a razonamiento y uso de herramientas, no a conocimiento general; el propio autor de la cuantización señala que el benchmark de conocimiento disponible muestra dónde se pagó la compacidad.
- Solo se declaran inglés y chino como idiomas soportados; el rendimiento en castellano no está documentado.
- La longitud de contexto no está disponible, lo que impide dimensionar cargas con ventanas largas.
- Riesgo de alucinación inherente a los modelos generativos; no se han publicado evaluaciones de fidelidad factual.
- No se han publicado datos sobre sesgos del modelo base.
- La licencia Apache 2.0 permite uso comercial, pero debe verificarse que el modelo base mantenga la misma licencia y que se cumplan las condiciones de atribución.
- Las mediciones de KL son del autor de la cuantización y se obtuvieron en su propio hardware; no han sido replicadas de forma independiente.
- La tasa bpw del nombre de fichero supera en ~2,5% la tasa calculada a partir del tamaño real del fichero, porque el cuantizador mide solo los tensores cuantizados mientras que el fichero incluye 301 tensores F32; para dimensionar memoria debe usarse la columna GiB.
- El repositorio completo ocupa 172,6 GB; descargar todos los niveles no es necesario para un despliegue concreto.
- No se dispone de información sobre latencia, throughput ni comportamiento en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/TokenTinkerer/Groot-19B-A3B-TTQ-GGUF
- Modelo base: https://huggingface.co/GrootTeam/Groot-19B-A3B-261023
- Escalera TTQ previa (Qwen3.6-35B-A3B): https://huggingface.co/TokenTinkerer/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive-TTQ-GGUF
- Escalera TTQ previa (Cyber-Tiel Coder 35B-A3B MTP): https://huggingface.co/TokenTinkerer/Cyber-Tiel-Coder-35B-A3B-MTP-TTQ-GGUF
- llama.cpp: no disponible en la información proporcionada
- Papers, blogs y demos: no disponibles en la información proporcionada
