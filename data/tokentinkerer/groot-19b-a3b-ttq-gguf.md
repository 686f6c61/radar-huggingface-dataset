# TokenTinkerer/Groot-19B-A3B-TTQ-GGUF

## Resumen

Groot-19B-A3B-TTQ-GGUF es un conjunto de cuantizaciones GGUF del modelo GrootTeam/Groot-19B-A3B-261023, un transformer de tipo Mixture of Experts (MoE) con 18.985.723.008 parámetros totales y aproximadamente 3.000 millones de parámetros activos por token (de ahí el sufijo A3B). Lo publica TokenTinkerer, un autor independiente especializado en cuantizaciones GGUF personalizadas con su propia receta denominada TTQ (TokenTinkerer Quant), que ya había aplicado a otros modelos MoE de la familia Qwen.

El modelo base incorpora una arquitectura etiquetada como qwen35moe con soporte de visión (un ViT de 27 bloques) y decodificación especulativa mediante MTP (multi-token prediction). El repositorio ofrece once escalones de cuantización entre 3,48 bpw y 8,22 bpw (de 7,88 a 18,59 GiB), lo que permite desplegar el modelo desde portátiles con GPU de consumo hasta servidores con varias A100 o H100.

La relevancia de esta ficha radica en que el autor publica mediciones de divergencia KL frente a una referencia BF16 propia, con protocolo fijo y verificable, y compara directamente contra la única cuantización GGUF publicada por el equipo original. Eso convierte al conjunto en un caso poco habitual de cuantización con trazabilidad métrica completa, útil para quien necesite elegir un compromiso calidad/tamaño con datos en lugar de estimaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) tipo transformer, etiquetada como qwen35moe, con vision encoder ViT de 27 bloques y MTP (multi-token prediction) |
| Parametros totales | 18.985.723.008 (aprox. 19B) |
| Parametros activos | aprox. 3B (sufijo A3B; cifra no desglosada en la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ3_XXS, IQ3_XS, Q3_K_S, Q3_K_M, IQ4_XS, IQ4_NL, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (once escalones, 3,48-8,22 bpw) |
| Idiomas soportados | ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp), mas proyector de vision Q8_0 de 586 MiB |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE con 753 tensores en su conversion BF16 (38,9 GB), de los cuales aproximadamente 3B se activan por token. Incluye un encoder de vision de 27 bloques y cabezales de prediccion multi-token (MTP) para decodificacion especulativa. La model card del cuantizador no detalla la composicion del dataset de entrenamiento, el numero de tokens vistos ni si hubo fases de RLHF o DPO; esa informacion corresponde al repositorio del modelo original y no esta disponible en la informacion proporcionada.

La innovacion tecnica relevante esta en el proceso de cuantizacion. TokenTinkerer construyo una conversion BF16 verificada tensor a tensor contra el payload safetensors (cuerpo bit-identico, upcasts F32 exactos y reordenamiento documentado de las cabezas V), y cuantizo cada escalon directamente desde ese BF16 sin pasos intermedios de recuantizacion. La receta TTQ reutiliza el mapa por tensor disenado para el modelo Cyber-Tiel, que comparte el mismo conjunto de 753 nombres de tensor, y el autor verifica 10/10 coincidencias exactas. Cada archivo se mide contra la referencia BF16 con divergencia KL sobre 40 fragmentos fijos de 512 tokens en dos corpus: uno de codigo (70% codigo, 10% diff, 10% terminal, 10% configuracion) y wikitext-2 test.

## Capacidades

- Generacion de texto conversacional y razonamiento general en ingles y chino.
- Generacion y edicion de codigo, con especial enfasis del autor en el corpus de evaluacion de tipo agentico (codigo, diffs, terminal, configuracion).
- Procesamiento de vision a traves del proyector ViT de 27 bloques, incluido en el repositorio como Q8_0.
- Decodificacion especulativa mediante MTP, que puede acelerar la inferencia en llama.cpp.
- Compatibilidad con endpoints (tag endpoints_compatible) para despliegue como servicio de generacion de texto.
- Soporte de tool calling y function calling: no confirmado en la informacion disponible.
- Capacidades de agente multi-paso: no confirmadas explicitamente en la informacion disponible.

## Casos de uso

- Asistencia de programacion en local: los escalones de 4,59 bpw IQ4_NL (10,39 GiB) y 5,60 bpw Q5_K_S (12,68 GiB) ofrecen top-1 del 95,8% y 96,7% sobre el corpus de codigo, adecuados para autocompletado y generacion de diffs en un equipo de desarrollo con una sola GPU de consumo alta.
- Despliegue en portatiles con GPU de 12-16 GB: el escalon 3,78 bpw Q3_K_S (8,55 GiB) es el minimo que el autor considera funcional y usa cuantizacion K lineal, mas rapida en CPU que las variantes IQ3.
- Servicio de atencion al cliente multilingue ingles-chino: el modelo cubre ambos idiomas y el formato GGUF permite servirlo con llama.cpp o vLLM en infraestructura modesta; la ventana de contexto debe verificarse contra el modelo base, ya que no esta documentada aqui.
- Procesamiento de documentos con imagenes: el proyector de vision Q8_0 de 586 MiB permite extraer y describir contenido visual, util para digitalizacion de facturas o capturas de pantalla en pipelines internos.
- Evaluacion comparativa de cuantizaciones: el conjunto de once escalones con KLD medido sirve como banco de pruebas para investigadores que estudien el impacto de la cuantizacion en modelos MoE pequenos.
- Generacion de codigo en produccion con restricciones de memoria: el escalon 4,24 bpw IQ4_XS (9,60 GiB) iguala la KLD de codigo del Q4_K_M original siendo un 11,6% mas pequeno, lo que reduce requisitos de VRAM sin perdida medible en ese corpus.
- Prototipado rapido en CPU: los formatos GGUF con llama.cpp permiten ejecutar el modelo sin GPU para validar prompts y flujos antes de escalar a inferencia acelerada.

## Benchmarks y rendimiento

El autor publica divergencia KL y acuerdo top-1 frente a su referencia BF16, no benchmarks de tareas estandar como MMLU o HumanEval.

| Archivo | Tipo | GiB | bpw | KLD codigo | top-1 codigo | KLD wikitext | top-1 wikitext |
|---|---|---:|---:|---|---:|---|---:|
| TTQ-3.48bpw-IQ3_XXS | IQ3_XXS | 7,88 | 3,48 | 0,052631 ± 0,001539 | 92,39% | 0,063697 ± 0,001198 | 87,43% |
| TTQ-3.64bpw-IQ3_XS | IQ3_XS | 8,23 | 3,64 | 0,047863 ± 0,001494 | 92,69% | 0,053595 ± 0,001020 | 88,45% |
| TTQ-3.78bpw-Q3_K_S | Q3_K_S | 8,55 | 3,78 | 0,040031 ± 0,001433 | 93,29% | 0,047536 ± 0,001012 | 89,64% |
| TTQ-4.01bpw-Q3_K_M | Q3_K_M | 9,06 | 4,01 | 0,031842 ± 0,001109 | 94,03% | 0,037841 ± 0,000875 | 90,33% |
| TTQ-4.24bpw-IQ4_XS | IQ4_XS | 9,60 | 4,24 | 0,025918 ± 0,001027 | 94,57% | 0,028927 ± 0,000615 | 91,68% |
| TTQ-4.59bpw-IQ4_NL | IQ4_NL | 10,39 | 4,59 | 0,015894 ± 0,000558 | 95,81% | 0,021609 ± 0,000699 | 92,58% |
| Groot-19B-A3B-261023-Q4_K_M (original) | Q4_K_M | 10,86 | 4,80 | 0,025780 ± 0,000715 | 94,51% | 0,033124 ± 0,000627 | 91,10% |
| TTQ-4.94bpw-Q4_K_M | Q4_K_M | 11,17 | 4,94 | 0,012791 ± 0,000406 | 96,08% | 0,018195 ± 0,000502 | 93,40% |
| TTQ-5.60bpw-Q5_K_S | Q5_K_S | 12,68 | 5,60 | 0,009432 ± 0,000294 | 96,72% | 0,014180 ± 0,000406 | 94,40% |
| TTQ-6.03bpw-Q5_K_M | Q5_K_M | 13,63 | 6,03 | 0,006510 ± 0,000265 | 97,20% | 0,010011 ± 0,000220 | 94,82% |
| TTQ-6.61bpw-Q6_K | Q6_K | 14,96 | 6,61 | 0,005081 ± 0,000177 | 97,55% | 0,008637 ± 0,000339 | 95,67% |
| TTQ-8.22bpw-Q8_0 | Q8_0 | 18,59 | 8,22 | 0,004526 ± 0,000220 | 98,02% | 0,007521 ± 0,000197 | 95,78% |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 8 GiB (escalon 3,48 bpw) y 19 GiB (escalon 8,22 bpw) solo para pesos; anadir 1-2 GiB para contexto y cache KV segun longitud de secuencia. El proyector de vision suma 586 MiB si se usa.
- GPU de consumo: los escalones de 3,48 a 4,59 bpw caben en RTX 4080 (16 GB) y RTX 4090 (24 GB). Los escalones de 5,60 y 6,03 bpw caben en RTX 4090; el de 6,61 bpw (14,96 GiB) y el de 8,22 bpw (18,59 GiB) requieren 24 GB o mas.
- GPU profesionales: A100 (40/80 GB), H100 y L40S permiten ejecutar cualquier escalon con contexto amplio y batching.
- Despliegue: llama.cpp es la via nativa (formato GGUF); Ollama puede servir los archivos; vLLM y TGI no estan confirmados para este formato en la informacion disponible.
- Latencia y throughput: no disponibles. El autor menciona que las variantes IQ3 son mas lentas en CPU que las K-quant, sin cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Groot-19B-A3B-TTQ (este) | 19B totales, ~3B activos | no disponible | Apache 2.0 | GGUF en HuggingFace, 11 escalones | KLD medido contra BF16 propio |
| Groot-19B-A3B-261023 (original) | 19B totales, ~3B activos | no disponible | Apache 2.0 | Pesos safetensors y un unico GGUF Q4_K_M | Referencia upstream |
| Qwen3.6-35B-A3B TTQ (TokenTinkerer) | 35B totales, ~3B activos | no disponible | no disponible en la informacion | GGUF | Misma receta TTQ, mayor tamano |
| Cyber-Tiel-Coder-35B-A3B-MTP TTQ | 35B totales, ~3B activos | no disponible | no disponible en la informacion | GGUF | Comparte conjunto de 753 tensores con Groot |

## Limitaciones y advertencias

- Idiomas: solo ingles y chino declarados; el rendimiento en castellano no esta evaluado y probablemente sea inferior.
- Longitud de contexto no documentada: debe consultarse el repositorio del modelo base antes de disenar aplicaciones con ventanas largas.
- Riesgo de alucinacion: inherente a los modelos generativos; no se han publicado evaluaciones de factualidad.
- Sesgos: no se documentan analisis de sesgo en la informacion disponible.
- Las metricas KLD y top-1 miden fidelidad respecto a la referencia BF16, no calidad absoluta en tareas; un KLD bajo no garantiza buen rendimiento en razonamiento o codigo real.
- Las variantes IQ3 son mas lentas en CPU que las K-quant equivalentes, segun el propio autor.
- El repositorio pesa 172,6 GB en total; descargar el conjunto completo no es necesario, pero conviene seleccionar un unico escalon.
- Licencia Apache 2.0 permite uso comercial, pero debe verificarse que el modelo base mantenga la misma licencia y que no existan restricciones adicionales en su model card.
- Modelo con 123 descargas y 0 likes en el momento de la ficha: comunidad y validacion externa muy limitadas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/TokenTinkerer/Groot-19B-A3B-TTQ-GGUF
- Modelo base: https://huggingface.co/GrootTeam/Groot-19B-A3B-261023
- Conjunto TTQ previo (Qwen3.6-35B-A3B): https://huggingface.co/TokenTinkerer/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive-TTQ-GGUF
- Conjunto TTQ previo (Cyber-Tiel-Coder-35B-A3B-MTP): https://huggingface.co/TokenTinkerer/Cyber-Tiel-Coder-35B-A3B-MTP-TTQ-GGUF
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Papers, blogs o demos adicionales: no disponibles en la informacion proporcionada.
