# TechnoBaptist/Ternary-Bonsai-2-27B-gguf

## Resumen

Ternary-Bonsai-2-27B es un modelo de lenguaje de 27B orientado a razonamiento, distribuido en formato GGUF con pesos ternarios. Lo publica en HuggingFace el usuario TechnoBaptist, pero el desarrollo y la documentación corresponden a Prism ML. Deriva de Qwen3.8-27B, un transformer causal de atención híbrida cuya arquitectura se mantiene intacta: lo que cambia es la representación de los pesos, cuantizados a valores {−1, 0, +1} con una escala FP16 compartida por cada grupo de 128 pesos.

El objetivo del proyecto es llevar razonamiento de clase 27B a un portátil o a una única GPU. El empaquetado PTQ1_0 ocupa 5,95 GB frente a los ~54 GB en FP16 (reducción idealizada de ~9,3x) y, según el autor, conserva el 98,2 % de la inteligencia del modelo en FP16, con 84,78 puntos de media en 14 benchmarks de modo pensamiento.

Conserva el contexto de 262.000 tokens del modelo base, el comportamiento de pensamiento, el razonamiento matemático y el tool calling agéntico (74,92), algo poco habitual por debajo de 4 bits. Incluye una torre de visión opcional en un mmproj Q8_0 y tiene una versión complementaria en MLX para Apple Silicon. En el momento de la consulta el repositorio acumula 0 descargas y 0 likes, y la model card está truncada en su parte final.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal de atención híbrida (~75 % atención lineal / ~25 % atención completa), MLP SwiGLU, RoPE, RMSNorm; 64 bloques en el backbone de lenguaje |
| Parámetros totales | 27,36 mil millones según la model card (24,35 B de backbone + 2,54 B de embeddings/LM head + 0,46 B de torre de visión); los safetensors del repositorio declaran 26.895.998.464 (~26,9 B) |
| Parámetros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 262.000 tokens (heredado de Qwen3.8-27B) |
| Tipos de cuantización | Ternaria g128: pesos en {−1, 0, +1} con una escala FP16 por grupo de 128 pesos. Dos empaquetados GGUF: PTQ1_0 (1,75 bits/peso, 5,95 GB) y PQ2_0 (2,13 bits/peso, 7,21 GB). Torre de visión en Q8_0 (~0,63 GB, mmproj) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); existe una versión complementaria en MLX de 2 bits para Apple Silicon |
| Modelo base | Qwen/Qwen3.8-27B |
| Backends | llama.cpp en CUDA, Metal y CPU; requiere los kernels ternarios del fork de Prism ML |
| Tamaño de pesos | 5,95 GB (PTQ1_0) o 7,21 GB (PQ2_0); 5,8 GB en el cálculo ideal de 1,72 bits/peso. Tamaño del repositorio en HuggingFace: 68,5 GB |
| Modo de pensamiento | Sí: los benchmarks citados se miden en modo thinking |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen3.8-27B sin modificar: atención híbrida con aproximadamente un 75 % de capas de atención lineal y un 25 % de atención completa, MLP SwiGLU, RoPE y RMSNorm. Esa proporción de atención lineal es lo que hace viable sostener 262.000 tokens de contexto en un dispositivo de consumo, porque reduce el coste de la caché KV frente a un transformer de atención completa equivalente.

La innovación está en la representación de pesos, no en el entrenamiento. Cada peso toma un valor de {−1, 0, +1} con un único factor de escala FP16 por grupo de 128 pesos; un trit transporta log2(3) ≈ 1,585 bits, por lo que el coste efectivo es de ~1,71 bits/peso y de 1,72 bits/peso contando los pocos tensores que quedan por encima de la representación ternaria. La cobertura ternaria alcanza embeddings, proyecciones de atención, proyecciones MLP y LM head, sin zonas de escape en alta precisión. Los pesos se almacenan en una base rotada: cada matriz se transforma por bloques mediante una rotación ortogonal de Hadamard (bloque 1024, signos ±1 fijos) antes de la asignación ternaria, y el runtime aplica la transformada equivalente sobre las activaciones. La rotación va plegada en los pesos, no ocupa bits adicionales y el archivo la declara en sus metadatos, de modo que un runtime sin soporte rechaza cargar el fichero en lugar de producir resultados incorrectos. Los pesos empaquetados se consumen directamente en los kernels, nunca se expanden de vuelta a FP16.

No hay información disponible sobre el dataset de entrenamiento del modelo base, el número de tokens, la composición de los datos ni si hubo RLHF o DPO. Se trata de una cuantificación post-entrenamiento (PTQ) del modelo base, cuyo detalle metodológico la model card remite al whitepaper.

## Capacidades

- Generación de texto conversacional (pipeline declarado: text-generation; etiqueta conversational).
- Razonamiento en modo pensamiento: los 14 benchmarks citados se han medido en thinking mode.
- Matemáticas: 96,57 en la prueba del autor, a menos de medio punto de la precisión completa.
- Generación de código: 89,42, a la par del baseline de referencia según la model card.
- Tool calling y comportamiento agéntico: 74,92 en la prueba de agentic tool calling.
- Contexto largo de 262.000 tokens, sostenido por el backbone de atención predominantemente lineal.
- Visión: torre de visión opcional de ~0,46 B de parámetros servida como mmproj Q8_0 (~0,63 GB), que se carga solo cuando hay entrada de imagen.
- Ejecución on-device: pensado para portátiles y equipos de consumo, con backend CUDA, Metal y CPU.
- Compatibilidad declarada con endpoints (etiqueta endpoints_compatible).
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Asistencia de código en portátil: con 5,95 GB de pesos, el modelo cabe en un equipo de gama alta sin GPU dedicada de gran VRAM y mantiene un 89,42 de calidad en código, lo que permite autocompletado, refactorización y explicación de código en local sin enviar el repositorio a un servicio externo.
- Agentes autónomos con tool calling en producción: el 74,92 obtenido en tool calling agéntico permite integrar el modelo como planificador o ejecutor de llamadas a funciones en flujos multi-paso, con el coste de servidor de un modelo de menos de 8 GB.
- Análisis de documentos extensos: los 262.000 tokens de contexto admiten contratos, informes o bases de código completas en una sola ventana, útil para extracción estructurada, resumen por secciones y preguntas sobre documentos largos.
- Despliegue en el borde o sin conexión: escenarios con requisitos de privacidad o conectividad intermitente (sanidad, industria, campo) donde el modelo corre íntegramente en el dispositivo y ningún dato sale del equipo.
- Tutoría y razonamiento matemático asistido: el 96,57 en la prueba de matemáticas, a menos de medio punto del modelo en precisión completa, lo hace apto para resolución paso a paso de problemas y verificación de resultados.
- Prototipado e investigación en cuantización de bajo bit: sirve como referencia reproducible para estudiar el comportamiento de pesos ternarios por debajo de 2 bits, con dos empaquetados distintos (PTQ1_0 y PQ2_0) y kernels abiertos en el fork de llama.cpp.
- Procesamiento de imágenes con texto: cargando el mmproj Q8_0 se pueden hacer tareas de descripción, extracción de datos de capturas o preguntas sobre imágenes, con el coste adicional de 0,63 GB.
- Sustitución de modelos mayores en pipelines de CI: la reducción de huella (5,95 GB frente a ~54 GB en FP16) permite ejecutar tareas de revisión de código o generación de documentación dentro de runners con recursos limitados.

## Benchmarks y rendimiento

Los datos publicados son agregados internos del autor y no se desglosan por prueba. La model card no publica resultados por nombre (MMLU, HumanEval, GSM8K ni equivalentes) y remite al whitepaper para el detalle.

| Benchmark (modo pensamiento) | Ternary-Bonsai-2-27B | Referencia indicada |
|---|---|---|
| Media de 14 benchmarks | 84,78 | IQ2_XXS convencional: 72,59; UD-Q4_K_XL: 0,4 puntos por encima (valor exacto no publicado) |
| Matemáticas | 96,57 | A menos de medio punto de la precisión completa (valor exacto no publicado) |
| Código | 89,42 | A la par del baseline (valor exacto no publicado) |
| Tool calling agéntico | 74,92 | No se indica referencia |
| Retención frente a FP16 | 98,2 % según el autor | FP16 ≈ 100 % (valor de partida no publicado) |
| Throughput | ~47 tok/s en un portátil Apple M5 Max | No se indican otras mediciones |

## Requisitos de hardware

- VRAM para pesos: ~5,95 GB con PTQ1_0 y ~7,21 GB con PQ2_0, más ~0,63 GB si se carga el mmproj de visión.
- Caché KV: no disponible. El coste real de memoria para 262.000 tokens depende de la cuantización de la caché, que la model card no especifica; hay que sumarlo al tamaño de los pesos.
- GPU recomendadas: no se indican modelos concretos. Se soportan CUDA, Metal y CPU. El único dato de rendimiento publicado es de un Apple M5 Max (~47 tok/s).
- GPU de consumo: por tamaño de pesos, los empaquetados de 5,95-7,21 GB entran en GPUs de consumo con 8 GB o más, siempre que se añada el coste de la caché KV y el overhead del runtime (no cuantificado en la información disponible).
- Despliegue: llama.cpp con los kernels ternarios del fork de Prism ML (CUDA y Metal), MLX fork y mlx-swift fork para Apple Silicon (iOS/macOS). No hay mención a vLLM, TGI, Ollama ni TensorRT-LLM.
- Restricción de runtime: el archivo declara su rotación de Hadamard en metadatos; un runtime sin el soporte correspondiente rechazará cargarlo.
- Latencia y throughput: no disponibles salvo el dato de ~47 tok/s en Apple M5 Max.

## Comparativa con modelos similares

No se proporcionan comparaciones con modelos de terceros. La única referencia de la model card son otras representaciones del mismo modelo base.

| Modelo / empaquetado | Parámetros | Contexto | Tamaño | Calidad media | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Ternary-Bonsai-2-27B (PTQ1_0) | 27,36 B según card / 26,9 B según safetensors | 262.000 tokens | 5,95 GB (1,75 bits/peso) | 84,78 | Apache 2.0 | HuggingFace, 0 descargas |
| Ternary-Bonsai-2-27B (PQ2_0) | Igual | 262.000 tokens | 7,21 GB (2,13 bits/peso) | No publicado por separado | Apache 2.0 | HuggingFace |
| Ternary-Bonsai-2-27B-mlx-2bit | No disponible | No disponible | No disponible | No disponible | No disponible | HuggingFace (prism-ml) |
| IQ2_XXS del mismo base | No disponible | No disponible | No disponible (el autor indica que es más de un 50 % mayor que PTQ1_0) | 72,59 | No disponible | No disponible |
| UD-Q4_K_XL del mismo base | No disponible | No disponible | Aproximadamente el triple que PTQ1_0, según el autor | 0,4 puntos por encima de 84,78 | No disponible | No disponible |
| Base en FP16 (Qwen3.8-27B) | ~27,36 B | 262.000 tokens | ~54 GB, según el autor | Valor exacto no publicado | No disponible | Repositorio de Qwen |

## Limitaciones y advertencias

- Repositorio sin tracción ni validación independiente: 0 descargas, 0 likes y fecha de creación 17/09/2026. El uploader (TechnoBaptist) no coincide con el desarrollador citado en la model card (Prism ML), por lo que conviene verificar la procedencia de los pesos antes de usarlos en producción.
- Dependencia de forks: los kernels ternarios viven en forks propios de llama.cpp y MLX, no en las ramas principales. Actualizar el runtime upstream puede romper la inferencia.
- Carga rechazada por runtimes sin soporte: el modelo exige aplicar la transformada de activaciones correspondiente a la rotación de Hadamard declarada en metadatos.
- Benchmarks no verificables de forma independiente: los 14 benchmarks son agregados del autor, sin desglose por prueba ni resultados por nombre (MMLU, HumanEval, GSM8K). La comparación con IQ2_XXS y UD-Q4_K_XL no incluye los valores completos de esas referencias.
- Discrepancia de parámetros: 27,36 B en la model card frente a 26.895.998.464 en los safetensors. No se explica la diferencia.
- Idiomas: no declarados. No hay garantía documentada de cobertura multilingüe más allá de la del modelo base.
- Sesgos y alineación: no se publica información sobre dataset de entrenamiento, sesgos evaluados ni proceso de alineación (RLHF/DPO) del modelo base.
- Riesgo de alucinación: inherente a los modelos de lenguaje y potencialmente agravado por una representación de 1,72 bits/peso en dominios fuera de los evaluados, donde la degradación puede no ser lineal.
- Licencia: Apache 2.0 permite uso comercial, pero al derivar de Qwen3.8-27B conviene revisar los términos aplicables al modelo base. La model card no incluye avisos de uso responsable ni restricciones adicionales.
- Contexto largo: 262.000 tokens de ventana no implican memoria disponible para aprovecharla en hardware de consumo; no se documenta cuantización de la caché KV ni consumo real a esa longitud.
- Model card incompleta: la tabla de requisitos de memoria queda cortada y no se incluyen plantilla de prompt, instrucciones de ejecución ni temperaturas recomendadas.
- Visión opcional: las capacidades de imagen solo están disponibles cargando el mmproj Q8_0 por separado; sin él, el modelo es exclusivamente de texto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TechnoBaptist/Ternary-Bonsai-2-27B-gguf
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Versión complementaria MLX 2 bits: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-mlx-2bit
- Web de Prism ML: https://prismml.com
- Whitepaper: https://github.com/PrismML-Eng/Bonsai-demo/blob/main/bonsai-2-27b-whitepaper.pdf
- Demo y ejemplos: https://github.com/PrismML-Eng/Bonsai-demo
- Fork de llama.cpp con kernels ternarios (CUDA y Metal): https://github.com/PrismML-Eng/llama.cpp
- Fork de MLX para Apple Silicon: https://github.com/PrismML-Eng/mlx
- Fork de mlx-swift para iOS y macOS: https://github.com/PrismML-Eng/mlx-swift
- Discord del proyecto: https://discord.gg/prismml

Nota: la búsqueda web realizada no devolvió ningún resultado relacionado con este modelo; los enlaces anteriores proceden exclusivamente de la model card del repositorio.
