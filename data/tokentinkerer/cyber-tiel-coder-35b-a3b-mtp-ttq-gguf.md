# TokenTinkerer/Cyber-Tiel-Coder-35B-A3B-MTP-TTQ-GGUF

## Resumen

Cyber-Tiel-Coder-35B-A3B-MTP-TTQ-GGUF es un conjunto de cuantizaciones GGUF en diez niveles (de 3,34 a 6,64 bits por peso) del modelo Cyber-Tiel-Coder-35B-A3B-MTP, publicado por el usuario TokenTinkerer en HuggingFace. El modelo base, desarrollado por peculiar-ragdoll, es un modelo de código con arquitectura MoE (mixture of experts) derivada de la familia Qwen3.6 MoE, al que se le ha aplicado un proceso de "abliteración" (eliminación de los mecanismos de rechazo/alignamiento) y se le ha incorporado una cabecera MTP (multi-token prediction) para decodificación especulativa.

La relevancia de esta ficha de cuantización radica en su enfoque medido: el autor publica divergencia KL (KLD) y concordancia de top-1 contra el archivo fuente para cada nivel, sobre dos corpus fijos (código y prosa de wikitext-2). Según sus mediciones, a igual tamaño en GiB, estos niveles superan a la escalera de cuantización del autor original en 7 de 7 tamaños comparados en el corpus de código (mejora media del 9,3 %) y en 6 de 7 en prosa. Es un modelo sin filtros (uncensored), con licencia MIT, orientado a desarrolladores que ejecutan inferencia local con llama.cpp y necesitan controlar con precisión el equilibrio entre calidad y VRAM.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE estilo Qwen3.6 MoE con cabecera MTP injertada |
| Parámetros totales | 35.505.251.456 (~35,5 B) |
| Parámetros activos | ~3 B (indicado por el sufijo A3B; no disponible el dato exacto) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | IQ3_XXS, IQ3_XS, Q3_K_S, Q3_K_M, IQ4_XS, IQ4_NL, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K (escala TTQ de 3,34 a 6,64 bpw) |
| Idiomas soportados | Inglés, chino |
| Licencia | MIT |
| Formato de pesos | GGUF (cuantizado con imatrix, compatible con llama.cpp) |

## Arquitectura y entrenamiento

El modelo base pertenece a la familia Qwen3.6 MoE (según el tag `qwen35moe`), una arquitectura transformer con enrutado mixture-of-experts que activa aproximadamente 3 mil millones de parámetros por token de los 35,5 mil millones totales, lo que permite calidad de modelo grande con coste de inferencia de modelo pequeño. Sobre esta base se ha injertado una cabecera MTP (multi-token prediction), la misma técnica de predicción multi-token usada en DeepSeek-V3, que habilita decodificación especulativa en llama.cpp para acelerar la generación.

Sobre el entrenamiento del modelo base no hay datos publicados en la información disponible (tokens, composición del dataset, RLHF/DPO): no disponible. Lo que sí está exhaustivamente documentado es el proceso de cuantización: la escalera TTQ se construyó por requantización desde el nivel `UD-Q8_K_XL` (~8,6 bpw) del autor original, usando matrices de importancia (imatrix). Un caveat importante que el propio autor señala: no existe una versión en precisión completa del modelo, por lo que todas las métricas de calidad son relativas a ese archivo Q8 y una fracción desconocida de la divergencia se hereda de él. El autor destaca una innovación en el diseño de la escalera: los diez niveles comparten la misma forma tensor por tensor (733 tensores de cuerpo) que su escalera TTQ de Qwen3.6-35B-A3B, con la cabecera MTP conservada a la precisión original.

## Capacidades

- Generación de texto conversacional (pipeline text-generation, tag `conversational`).
- Generación y razonamiento sobre código: el modelo base es un modelo coder, y el corpus de evaluación del autor (70 % código, 10 % diffs, 10 % terminal, 10 % configuración) indica afinidad con flujos de trabajo agénticos de programación.
- Decodificación especulativa vía MTP: la cabecera multi-token prediction permite acelerar la inferencia en llama.cpp cuando el backend lo soporta.
- Ejecución eficiente en hardware de consumo gracias a la arquitectura MoE (~3 B parámetros activos) y a la escalera de cuantizaciones desde 13,82 GiB.
- Modelo sin filtros (abliterated): no rechaza peticiones, lo que elimina las negativas por seguridad pero implica riesgos serios (ver Limitaciones).
- Soporte de tool calling / function calling: no disponible explícitamente en la información proporcionada, aunque el corpus de evaluación agéntico sugiere que el modelo base está orientado a ese uso.
- Capacidades multilingües: inglés y chino.

## Casos de uso

- Programación asistida en local: con ~3 B de parámetros activos y cuantizaciones desde 13,82 GiB, el modelo cabe en una única GPU de consumo (por ejemplo una RTX 4090 de 24 GB con el nivel Q3_K_M de 16,22 GiB) y sirve como autocompletado o chat de código sin depender de la nube.
- Agentes de código con ejecución de herramientas: el corpus de evaluación incluye diffs, terminal y configuración, lo que sugiere idoneidad para agentes que editan repositorios, ejecutan comandos y gestionan entornos; debe ejecutarse siempre en sandbox a nivel de sistema operativo.
- Ajuste fino del equilibrio calidad/VRAM: la escalera de diez niveles permite elegir exactamente el punto de operación; por ejemplo, Q4_K_M (20,12 GiB) para máxima calidad en 24 GB, o IQ3_XXS (13,82 GiB) para GPUs de 16 GB.
- Aceleración de inferencia con decodificación especulativa: la cabecera MTP permite reducir la latencia de generación en llama.cpp, útil para servir el modelo en estaciones de trabajo locales o servidores pequeños.
- Investigación en cuantización: las tablas públicas de KLD y concordancia top-1, medidas con protocolo fijo y comparable entre archivos, hacen del repositorio un banco de pruebas útil para estudiar el impacto de distintos ftypes de GGUF.
- Procesamiento bilingüe inglés/chino: puede atender a equipos que trabajen con documentación y código comentado en ambos idiomas.
- Uso sin restricciones de contenido en entornos controlados: al estar abliterated, no produce negativas, lo que puede ser relevante en investigación de seguridad o red-teaming, siempre con aislamiento estricto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Lo que sí publica el autor son mediciones de divergencia KL contra el archivo fuente y concordancia de top-1, sobre corpus de código y wikitext-2:

| Archivo | GiB | bpw | KLD código ± | top-1 código | KLD wiki ± | top-1 wiki |
|---|---:|---:|---|---:|---|---:|
| TTQ-3.34bpw-IQ3_XXS | 13,82 | 3,34 | 0,135265 ± 0,006145 | 89,33 % | 0,121933 ± 0,002664 | 85,25 % |
| TTQ-3.51bpw-IQ3_XS | 14,53 | 3,51 | 0,121448 ± 0,005077 | 90,22 % | 0,112744 ± 0,002547 | 85,84 % |
| TTQ-3.67bpw-Q3_K_S | 15,20 | 3,67 | 0,107063 ± 0,004688 | 90,56 % | 0,091221 ± 0,002044 | 87,28 % |
| TTQ-3.92bpw-Q3_K_M | 16,22 | 3,92 | 0,091761 ± 0,004791 | 91,51 % | 0,073367 ± 0,001828 | 88,62 % |
| TTQ-4.17bpw-IQ4_XS | 17,26 | 4,17 | 0,078644 ± 0,003888 | 91,86 % | 0,069188 ± 0,001705 | 89,17 % |
| TTQ-4.49bpw-IQ4_NL | 18,56 | 4,49 | 0,066057 ± 0,004271 | 92,82 % | 0,045736 ± 0,001274 | 91,06 % |
| TTQ-4.87bpw-Q4_K_M | 20,12 | 4,87 | 0,060243 ± 0,004486 | 93,53 % | 0,038743 ± 0,001042 | 91,41 % |
| TTQ-5.54bpw-Q5_K_S | 22,90 | 5,54 | 0,043374 ± 0,002857 | 94,37 % | 0,031178 ± 0,000901 | 92,77 % |
| TTQ-6.00bpw-Q5_K_M | 24,81 | 6,00 | 0,039146 ± 0,003595 | 95,10 % | 0,023410 ± 0,000729 | 93,44 % |
| TTQ-6.64bpw-Q6_K | 27,47 | 6,64 | 0,036423 ± 0,003411 | 95,17 % | 0,020246 ± 0,000713 | 94,14 % |

KLD medida sobre 40 fragmentos fijos de 512 tokens contra el archivo `UD-Q8_K_XL` (~8,6 bpw) del autor original; menor es mejor. Según el autor, a igual tamaño en GiB esta escalera gana a la del autor original en 7 de 7 tamaños en código (mejora media del 9,3 %) y en 6 de 7 en prosa (hasta un 20 %).

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin KV cache): desde ~13,82 GiB (IQ3_XXS, 3,34 bpw) hasta ~27,47 GiB (Q6_K, 6,64 bpw). Añade margen para el contexto y la cabecera MTP.
- Gracias a los ~3 B de parámetros activos (MoE), el ancho de banda de memoria requerido por token es bajo, por lo que la velocidad de generación dependerá sobre todo del ancho de banda de memoria, no del tamaño total del archivo.
- GPU recomendadas: RTX 4090 (24 GB) para los niveles de 3,34 a 4,87 bpw con contexto moderado; RTX 5090 (32 GB), A100 40 GB o H100 para los niveles Q5 y Q6 con contextos largos. En CPU o modo híbrido CPU+GPU (offload parcial con llama.cpp) es viable en equipos con 32 GB de RAM, a costa de latencia.
- Consumer GPUs: sí, cabe en una RTX 4090 de 24 GB con los niveles hasta Q4_K_M (20,12 GiB), y en GPUs de 16 GB (RTX 4080/4060 Ti 16 GB) con IQ3_XXS o IQ3_XS si se descarga parte a RAM.
- Opciones de despliegue: llama.cpp (librería nativa del repositorio, con soporte de MTP/speculative decoding), Ollama y LM Studio (ambos sobre GGUF). vLLM y TGI no soportan GGUF de forma nativa; para servir con ellos habría que partir del modelo base en safetensors (no disponible públicamente en precisión completa).
- Latencia y throughput estimados: no disponible; el autor no publica mediciones de tokens/s. La decodificación especulativa MTP debería mejorar el throughput respecto a la inferencia estándar cuando el backend la soporta.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cyber-Tiel-Coder-35B-A3B-MTP-TTQ | ~35,5 B | ~3 B | no disponible | MIT | GGUF, 10 niveles, 190,9 GiB totales |
| Qwen3.6-35B-A3B (escalera TTQ del mismo autor) | ~35,5 B | ~3 B | no disponible | no disponible | GGUF, misma estructura de 10 niveles |
| Escalera UD del autor original (Cyber-Tiel-Coder-35B-A3B-GGUF-MTP) | ~35,5 B | ~3 B | no disponible | MIT | GGUF, 5 niveles (Q3_K_XL a Q6_K_XL, 16,05–30,02 GiB) |

Comparación de rendimiento: según las mediciones del autor, a igual tamaño en GiB la escalera TTQ reduce la KLD frente a la escalera UD original en 7 de 7 tamaños en código (media −9,3 %) y en 6 de 7 en prosa; además, el nivel superior TTQ es 2,55 GiB más pequeño que el `Q6_K_XL` original y tres niveles TTQ quedan por debajo del mínimo de la escalera original. Frente a la escalera TTQ de Qwen3.6-35B-A3B del mismo autor, comparte estructura tensor-for-tensor; las diferencias de calidad entre ambos dependerán del modelo base. No hay datos de benchmarks estándar comparables con otros modelos coder.

## Limitaciones y advertencias

- Modelo abliterated/uncensored: no rechazará peticiones dañinas y, con acceso a herramientas, puede causar daño real. El propio autor advierte de ello y recomienda ejecutarlo siempre en sandbox a nivel de sistema operativo.
- No existe versión en precisión completa del modelo: toda la escalera se requantiza desde `UD-Q8_K_XL` (~8,6 bpw), por lo que la calidad de partida puede ser inferior a la del modelo original sin cuantizar, y parte de la divergencia medida es heredada del archivo fuente.
- Riesgo de alucinación: no disponible (no hay evaluaciones publicadas de factualidad); como en cualquier LLM, debe asumirse riesgo de alucinación, especialmente en generación de código que luego se ejecuta.
- Sesgos conocidos: no disponible; al ser un modelo abliterated, además, los mecanismos de mitigación de contenido dañino han sido eliminados deliberadamente.
- Idiomas limitados a inglés y chino; el rendimiento en castellano no está evaluado y puede ser inferior.
- Longitud de contexto no documentada en la ficha; verificarla en la configuración del modelo base antes de planificar cargas con documentos largos.
- Las métricas de KLD miden fidelidad a los logits del archivo fuente, no calidad de tarea: una KLD baja no garantiza mejores resultados en HumanEval o razonamiento.
- Licencia MIT: permite uso comercial sin restricciones, pero al tratarse de un modelo abliterated, la responsabilidad legal y ética del uso recae íntegramente en el desplegador; algunas políticas corporativas o de proveedores cloud prohíben modelos sin filtros.
- Repositorio de 205 GB: la descarga completa es costosa; descarga solo los niveles necesarios.

## Enlaces

- Repositorio del modelo (cuantización TTQ): https://huggingface.co/TokenTinkerer/Cyber-Tiel-Coder-35B-A3B-MTP-TTQ-GGUF
- Modelo base (autor original, con advertencias de uso): https://huggingface.co/peculiar-ragdoll/Cyber-Tiel-Coder-35B-A3B-GGUF-MTP
- Escalera TTQ de referencia del mismo autor (Qwen3.6-35B-A3B): https://huggingface.co/TokenTinkerer/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive-TTQ-GGUF
