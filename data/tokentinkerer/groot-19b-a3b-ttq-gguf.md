# TokenTinkerer/Groot-19B-A3B-TTQ-GGUF

## Resumen

Groot-19B-A3B es un modelo de razonamiento de pesos abiertos desarrollado por GrootTeam, orientado a tareas complejas del mundo real y cargas de trabajo con uso intensivo de herramientas. Se trata de un modelo de arquitectura MoE (Mixture of Experts) con 18.985.723.008 parámetros totales y aproximadamente 3B parámetros activos por token, según se deduce de la nomenclatura A3B. La model card del cuantizador lo describe como compacto y fácil de desplegar, fuerte en razonamiento y en flujos con tool calling, y eficiente en el uso del presupuesto de tokens.

La ficha que nos ocupa documenta el conjunto de cuantizaciones GGUF publicado por TokenTinkerer bajo la receta TTQ (TokenTinkerer Quant), no el modelo original. Este set ofrece once niveles de cuantización que van de 3,56 bpw a 8,50 bpw (7,88 a 18,59 GiB), más un proyector de visión Q8_0 para el ViT de 27 bloques del modelo. Todas las cuantizaciones se generaron directamente desde una conversión BF16 del modelo original, sin pasos de recuantización, lo que evita la propagación del ruido de cuantización previo.

La relevancia de este set radica en que permite ejecutar un modelo MoE de ~19B en hardware de consumo mediante llama.cpp, con métricas de divergencia KL medidas de forma rigurosa frente a la referencia BF16. El modelo base está publicado bajo licencia Apache 2.0 y soporta inglés y chino.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts), tag `qwen35moe`, con soporte MTP y visión (ViT de 27 bloques) |
| Parámetros totales | 18.985.723.008 (~19B) |
| Parámetros activos | ~3B (según nomenclatura A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | IQ3_XXS, IQ3_XS, Q3_K_S, Q3_K_M, IQ4_XS, IQ4_NL, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (once niveles, 3,56–8,50 bpw); proyector de visión Q8_0 |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); referencia BF16 GGUF incluida en el repo |

## Arquitectura y entrenamiento

El modelo base es un transformer con arquitectura MoE, etiquetado en los tags como `qwen35moe`, lo que sugiere una base derivada de la familia Qwen 3.5 MoE. Incluye soporte MTP (Multi-Token Prediction) y un codificador visual compuesto por un ViT de 27 bloques, lo que le confiere capacidades multimodales de visión. El conjunto de tensores es de 753, idéntico al del modelo Cyber-Tiel, lo que permitió al cuantizador replicar su receta TTQ por nombre exacto de tensor.

Respecto al entrenamiento del modelo original, la información disponible no detalla el número de tokens, la composición del dataset ni si se aplicaron fases de RLHF o DPO. La model card del cuantizador cita la descripción de GrootTeam, que posiciona al modelo como una familia de modelos de razonamiento de pesos abiertos para tareas complejas, compactos, orientados a razonamiento y tool use, y eficientes con el presupuesto de tokens. La innovación técnica documentada en esta ficha es la receta de cuantización TTQ: cuantización directa desde BF16 verificado tensor a tensor, sin recuantización, con mapas por tensor validados al 100% (10/10 exactos) y medición de divergencia KL sobre 40 fragmentos fijos de 512 tokens en dos corpus (código y wikitext-2).

## Capacidades

- Generación de texto conversacional y razonamiento multi-paso.
- Razonamiento orientado a tareas complejas y cargas de trabajo agénticas.
- Tool calling y function calling, según la descripción upstream de "tool-using workloads".
- Soporte de visión mediante el proyector Q8_0 para el ViT de 27 bloques.
- Soporte MTP (Multi-Token Prediction) según los tags del modelo.
- Capacidades multilingües limitadas a inglés y chino.
- Eficiencia en el uso de presupuesto de tokens, según la model card upstream.
- Compatibilidad con endpoints (`endpoints_compatible`) y despliegue en llama.cpp.

## Casos de uso

- Razonamiento y resolución de problemas en local: el modelo puede ejecutarse en estaciones de trabajo con GPU de consumo usando las cuantizaciones de 4–5 bpw, adecuadas para tareas de razonamiento multi-paso sin depender de la nube.
- Flujos agénticos con tool calling: la orientación del modelo a cargas de trabajo con herramientas permite integrarlo en pipelines que requieran invocar funciones externas, con la ventaja de que las cuantizaciones de 5,05 bpw en adelante mantienen una divergencia KL muy baja (0,0128 en código) frente a la referencia BF16.
- Asistentes de código en producción: la cuantización de 4,70 bpw (IQ4_NL) reduce un 38% la KLD en código respecto al Q4_K_M upstream, lo que la hace adecuada para autocompletado y generación de código en entornos con restricciones de memoria.
- Análisis de documentos con imágenes: el proyector de visión Q8_0 permite procesar entradas multimodales, útil para extracción de información de capturas, diagramas o documentos escaneados.
- Despliegue en hardware limitado: la cuantización de 3,56 bpw (7,88 GiB) permite ejecutar el modelo en GPU con 8–12 GB de VRAM, manteniendo un top-1 del 92,39% en código.
- Evaluación e investigación de cuantización: el repo incluye la referencia BF16 (35,4 GiB) y métricas KLD por nivel, lo que lo convierte en un banco de pruebas para estudiar el impacto de la cuantización en modelos MoE.
- Servicio conversacional bilingüe inglés-chino: para aplicaciones de atención al cliente o asistentes en esos dos idiomas, con la salvedad de que no se documenta soporte de otros idiomas.

## Benchmarks y rendimiento

La model card del cuantizador publica métricas de divergencia KL y acuerdo top-1 frente a la referencia BF16, medidas sobre 40 fragmentos de 512 tokens en dos corpus. No se publican resultados de benchmarks de conocimiento o razonamiento (MMLU, HumanEval, GSM8K) en la información disponible.

| Archivo | Tipo | GiB | bpw | KLD código | top-1 código | KLD wiki | top-1 wiki |
|---|---|---:|---:|---|---:|---|---:|
| TTQ-3.56bpw-IQ3_XXS | IQ3_XXS | 7,88 | 3,56 | 0,052631 ± 0,001539 | 92,39% | 0,063697 ± 0,001198 | 87,43% |
| TTQ-3.72bpw-IQ3_XS | IQ3_XS | 8,23 | 3,72 | 0,047863 ± 0,001494 | 92,69% | 0,053595 ± 0,001020 | 88,45% |
| TTQ-3.87bpw-Q3_K_S | Q3_K_S | 8,55 | 3,87 | 0,040031 ± 0,001433 | 93,29% | 0,047536 ± 0,001012 | 89,64% |
| TTQ-4.09bpw-Q3_K_M | Q3_K_M | 9,06 | 4,09 | 0,031842 ± 0,001109 | 94,03% | 0,037841 ± 0,000875 | 90,33% |
| TTQ-4.34bpw-IQ4_XS | IQ4_XS | 9,60 | 4,34 | 0,025918 ± 0,001027 | 94,57% | 0,028927 ± 0,000615 | 91,68% |
| TTQ-4.70bpw-IQ4_NL | IQ4_NL | 10,39 | 4,70 | 0,015894 ± 0,000558 | 95,81% | 0,021609 ± 0,000699 | 92,58% |
| Q4_K_M (upstream) | Q4_K_M | 10,86 | 4,80 | 0,025780 ± 0,000715 | 94,51% | 0,033124 ± 0,000627 | 91,10% |
| TTQ-5.05bpw-Q4_K_M | Q4_K_M | 11,17 | 5,05 | 0,012791 ± 0,000406 | 96,08% | 0,018195 ± 0,000502 | 93,40% |
| TTQ-5.73bpw-Q5_K_S | Q5_K_S | 12,68 | 5,73 | 0,009432 ± 0,000294 | 96,72% | 0,014180 ± 0,000406 | 94,40% |
| TTQ-6.16bpw-Q5_K_M | Q5_K_M | 13,63 | 6,16 | 0,006510 ± 0,000265 | 97,20% | 0,010011 ± 0,000220 | 94,82% |
| TTQ-6.76bpw-Q6_K | Q6_K | 14,96 | 6,76 | 0,005081 ± 0,000177 | 97,55% | 0,008637 ± 0,000339 | 95,67% |
| TTQ-8.50bpw-Q8_0 | Q8_0 | 18,59 | 8,50 | 0,004526 ± 0,000220 | 98,02% | 0,007521 ± 0,000197 | 95,78% |

## Requisitos de hardware

- VRAM estimada para inferencia: entre 8 y 19 GiB según el nivel de cuantización (7,88 GiB para IQ3_XXS hasta 18,59 GiB para Q8_0), más el proyector de visión de 586 MiB si se usa multimodalidad.
- GPU recomendadas: RTX 3090/4090 (24 GB) para los niveles de 5–6 bpw; A100 o H100 para Q8_0 y la referencia BF16 (35,4 GiB); GPUs de 12–16 GB para los niveles de 3,5–4,7 bpw.
- Cabe en GPU de consumo: sí. Los niveles de 3,56 a 4,70 bpw caben en GPUs de 8–12 GB; los niveles de 5,05 a 6,76 bpw requieren 12–16 GB; Q8_0 requiere 24 GB.
- Opciones de despliegue: llama.cpp (librería declarada), con compatibilidad de endpoints; el formato GGUF es compatible con Ollama y otros runners basados en llama.cpp.
- Latencia y throughput: no disponibles en la información proporcionada. Al ser un MoE con ~3B parámetros activos, el coste de cómputo por token es inferior al de un modelo denso de 19B, aunque no se publican cifras medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización destacada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Groot-19B-A3B (TTQ) | ~19B totales, ~3B activos | no disponible | IQ4_XS 4,34 bpw: KLD código 0,0259 | Apache 2.0 | GGUF en HF |
| Groot-19B-A3B (upstream Q4_K_M) | ~19B totales, ~3B activos | no disponible | Q4_K_M 4,80 bpw: KLD código 0,0258 | Apache 2.0 | GGUF en HF |
| Cyber-Tiel-Coder-35B-A3B (TTQ) | ~35B totales, ~3B activos | no disponible | misma receta TTQ, 753 tensores idénticos | no disponible | GGUF en HF |
| Qwen3.6-35B-A3B (TTQ) | ~35B totales, ~3B activos | no disponible | misma receta TTQ | no disponible | GGUF en HF |

La comparativa se limita a los modelos citados en la model card del cuantizador, ya que no se dispone de datos de benchmarks de conocimiento para situar a Groot frente a alternativas de la misma categoría.

## Limitaciones y advertencias

- El modelo está descrito por upstream como no orientado a conocimiento general; el cuantizador señala que el único benchmark de conocimiento ejecutado muestra dónde se pagó el precio de la compacidad.
- Idiomas soportados limitados a inglés y chino; no se documenta castellano ni otros idiomas.
- No se publican resultados de benchmarks estándar (MMLU, HumanEval, GSM8K), por lo que el rendimiento en tareas de razonamiento no puede verificarse con datos independientes.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se documentan medidas específicas de mitigación.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Longitud de contexto no documentada, lo que dificulta planificar cargas con ventanas largas.
- La licencia Apache 2.0 permite uso comercial, pero debe verificarse en el modelo base (GrootTeam/Groot-19B-A3B-261023) y en las dependencias del codificador visual.
- Las cuantizaciones de 3,56–3,87 bpw presentan una KLD en código de 0,040–0,053, sensiblemente superior a la de 4,70 bpw (0,0159); para producción con código se recomienda 4,70 bpw o superior.
- El repo ocupa 172,6 GB e incluye la referencia BF16 de 35,4 GiB, lo que exige espacio de almacenamiento considerable si se descarga completo.

## Enlaces

- Repositorio Hugging Face del set cuantizado: https://huggingface.co/TokenTinkerer/Groot-19B-A3B-TTQ-GGUF
- Modelo base: https://huggingface.co/GrootTeam/Groot-19B-A3B-261023
- Ladder TTQ de referencia (Qwen3.6-35B-A3B): https://huggingface.co/TokenTinkerer/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive-TTQ-GGUF
- Ladder TTQ de Cyber-Tiel: https://huggingface.co/TokenTinkerer/Cyber-Tiel-Coder-35B-A3B-MTP-TTQ-GGUF
