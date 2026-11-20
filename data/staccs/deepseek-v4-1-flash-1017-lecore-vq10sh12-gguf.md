# staccs/DeepSeek-V4.1-Flash-1017-lecore-vq10sh12-GGUF

## Resumen

DeepSeek-V4.1-Flash-1017-lecore-vq10sh12-GGUF es una cuantización extrema del modelo DeepSeek-V4.1-Flash-1017, un transformer MoE de 763.000 millones de parámetros desarrollado por DeepSeek. La publica el usuario staccs bajo licencia MIT y emplea una técnica de cuantización por cuantización vectorial (VQ) sobre los expertos enrutados, reduciendo los pesos de 307,2 GB a 99,1 GB en un único fichero GGUF. El objetivo declarado es que un modelo de esta escala pueda ejecutarse en una sola máquina con 128 GB de memoria unificada, algo imposible con el checkpoint original, que requiere un servidor de clase 500 GB.

La rebaja de tamaño tiene un coste medible en calidad: la perplejidad en WikiText-2 sube de 1,838 a 3,615 y la coincidencia de siguiente palabra con el modelo original cae al 74,5 %. Los expertos de las capas 0-13 se cuantizan a 12 bits (4096 palabras de código) y los de las capas 14-39 a 10 bits (1024 palabras de código), con codebooks E4M3 compartidos por capa; el resto de componentes (atención, expertos compartidos, embeddings y cabeza de salida) se mantiene en q4_K. Las tablas Engram del modelo original (203,1 GB) no se incluyen en el fichero y deben servirse desde los shards oficiales en tiempo de ejecución, por lo que la descarga total ronda los 300 GB.

La relevancia de esta ficha es doble: documenta un caso real de cuantización agresiva de un MoE de gran escala y advierte de que el resultado no es cargable en llama.cpp, vLLM ni Ollama, sino que exige un runtime específico (ds4-dfm-rs con un parche para índices de 10/11/12 bits). En el momento de la publicación solo se han verificado pruebas puntuales de generación y velocidad, sin evaluación de tareas completas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE con expertos enrutados, expertos compartidos, tablas Engram n-gram y drafter MTP |
| Parámetros totales | 102.247.695.722 (según safetensors del repo); la model card declara 763B en el modelo base, de los cuales ~566B quedan en este fichero tras excluir Engram |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | VQ 12 bits (capas 0-13), VQ 10 bits (capas 14-39), VQ 10 bits (torres MTP), q4_K para atención, expertos compartidos, embeddings y cabeza; media de ~1,4 bits por peso en los ~566B parámetros restantes |
| Idiomas soportados | en (inglés) según los tags del repo; el resto no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (fichero único de 99.116.576.416 bytes); tablas Engram en shards originales aparte |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos (MoE) con 763.000 millones de parámetros, 384 expertos por capa, expertos compartidos y un drafter MTP (multi-token prediction) para decodificación especulativa. Incorpora además tablas Engram de n-gramas de 2 × 101,5 GB que se consultan durante el forward pass. Esta ficha no entrena ningún modelo: parte del checkpoint oficial en la revisión `1bae0e1088993b9b82de08f59de5be5a34e42170` y aplica el cuantizador `v41_quantize` de fodelf/YoungAi (commit `7fb26cc`) sin calibración.

La receta concreta es: expertos enrutados de las capas 0-13 en VQ de 8 dimensiones con 4096 palabras de código (índices de 12 bits) y codebook E4M3 compartido por capa; expertos de las capas 14-39 en VQ de 8 dimensiones con 1024 palabras de código (10 bits); torres del drafter MTP en VQ de 10 bits; y todo lo demás en q4_K. El comando empleado fue `v41_quantize --skel q4k --mtp-vq --vq-nc 1024 --vq-nc-layers 0:14=4096 --vq-shared-cb --vq-cb-fp8`. El conversor y el runtime originales solo admitían índices v3 de 13 bits, por lo que fue necesario un parche en ambos para soportar anchos de 10, 11 y 12 bits (ancho de índice `min(nbit, 12)` y corrección de máscara en el kernel de persistencia). La fidelidad en espacio de pesos reportada por el cuantizador es de coseno ≈ 0,911 en capas de 12 bits y ≈ 0,873 en capas de 10 bits.

## Capacidades

- Generación de texto autoregresiva en inglés, con modo thinking desactivable (las pruebas verificadas se hicieron con thinking off).
- Razonamiento factual y de sentido común a nivel básico: respondió correctamente a preguntas como la capital de Australia y su justificación histórica.
- Generación de código: produjo una función `nth_prime` por división por tentativa con doctests correctos (`nth_prime(1) == 2`, `nth_prime(10) == 29`).
- Decodificación especulativa mediante el drafter MTP incluido en el fichero, lo que sostiene el throughput medido.
- Consulta de tablas Engram n-gram en tiempo de ejecución, servidas desde los shards oficiales.
- Soporte de tool calling, function calling, agentes multi-paso, visión o audio: no disponible en la información proporcionada.
- Capacidades multilingües: solo se declara inglés; el resto no disponible.

## Casos de uso

- Inferencia local de un MoE de gran escala en una máquina de 128 GB de memoria unificada (objetivo probado: Ryzen AI Max+ 395 / Radeon 8060S con 96 GB de memoria gráfica variable): permite tener el modelo completo, con los 384 expertos por capa, sin recortes ni destilación, en hardware de escritorio de gama alta.
- Despliegue en un servidor con una sola GPU de al menos 104 GB, como la H200 NVL probada: el arranque copia los pesos a la GPU en 5,2 s y el servidor está listo en 10 s, lo que facilita ciclos de reinicio rápidos en entornos de experimentación.
- Generación de código asistida en local: la prueba verificada con `nth_prime` y doctests indica utilidad para tareas de programación de dificultad media, aunque sin métricas formales de HumanEval o similar.
- Prototipado de asistentes conversacionales en inglés con latencia interactiva: 0,24-0,31 s hasta el primer token y 46-54 tok/s en respuestas de 400 tokens sobre H200 NVL permiten interacción fluida en una sola secuencia.
- Investigación sobre cuantización vectorial: el fichero documenta de forma reproducible la receta, los comandos y las métricas de fidelidad (perplejidad, KL, coincidencia de siguiente palabra), lo que lo convierte en material de referencia para estudiar el compromiso tamaño-calidad en MoE.
- Evaluación comparativa de runtimes: al requerir ds4-dfm-rs parcheado, sirve para validar soporte de índices VQ de 10-12 bits en implementaciones propias antes de adoptarlas en producción.
- Experimentación con decodificación especulativa: el drafter MTP cuantizado a 10 bits permite medir el impacto del ruido de cuantización en la tasa de aceptación de tokens especulados.

## Benchmarks y rendimiento

| Métrica | Original (DeepSeek) | Baekpica VQ GGUF | Este build |
|---|---:|---:|---:|
| Pesos del modelo | 307,2 GB | 113,6 GB | 99,1 GB |
| Expertos enrutados | FP4/FP8 | VQ 13 bits (capas 0-13) / 12 bits (14-39) | VQ 12 bits (0-13) / 10 bits (14-39) |
| Tablas Engram | 203,1 GB | 203,1 GB (shards originales) | 203,1 GB (shards originales) |
| Total en disco | 510,3 GB | ~318 GB | 302,2 GB |
| Perplejidad WikiText-2 | 1,838 | no publicada | 3,615 |
| Coincidencia de siguiente palabra con el original (WikiText-2) | 100 % (referencia) | 78,5 %* | 74,5 % |
| KL medio frente al original (WikiText-2) | 0 (referencia) | 0,694* | 0,797 |
| Hardware | servidor multi-GPU | una DGX Spark de 128 GB | una GPU con ≥104 GB (H200 probada); Strix Halo en Linux nativo sin probar |
| Velocidad de decodificación, una secuencia | no disponible | 54-66 tok/s (DGX Spark) | 46-54 tok/s (1× H200 NVL, medido) |

\* Las cifras de Baekpica son medición de YoungAi sobre el modelo base desnudo, citadas en la model card de Baekpica; se tomaron sobre V4.1 Flash (la release anterior a 1017) con una ventana de texto distinta, por lo que no son exactamente el mismo test. Las columnas de original y este build sí usan el mismo test: los primeros 2048 tokens del conjunto de test de WikiText-2 con el forward pass oficial y Engram.

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada: al menos 104 GB para los pesos en una sola GPU (probado en 1× H200 NVL); el fichero GGUF ocupa 99,1 GB.
- Almacenamiento: ~302,2 GB en total, porque las tablas Engram (2 × 101,5 GB) se leen desde los shards oficiales y no están incluidas en el GGUF.
- GPU recomendadas: H200 NVL (verificada); cualquier GPU con ≥104 GB de memoria. En memoria unificada, el objetivo probado es Ryzen AI Max+ 395 / Radeon 8060S con 96 GB de memoria gráfica variable; Strix Halo en Linux nativo está sin probar.
- GPU de consumo: no cabe en ninguna GPU de consumo actual (RTX 4090, 24 GB; RTX 5090, 32 GB) por el tamaño de los pesos.
- Opciones de despliegue: exclusivamente ds4-dfm-rs con un parche para índices VQ de 10/11/12 bits, mediante `ds4-server`. llama.cpp, vLLM y Ollama no pueden cargarlo.
- Latencia y throughput medidos en 1× H200 NVL, greedy, thinking off: primer token en 0,24-0,31 s; decodificación sostenida de 46-54 tok/s en respuestas de 400 tokens; arranque con copia de pesos a GPU en 5,2 s y servidor listo en 10 s.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| Este build (staccs, VQ 10/12 bits) | 763B (base); ~566B en fichero | no disponible | 3,615 | MIT | GGUF de 99,1 GB; runtime ds4-dfm-rs parcheado |
| Baekpica VQ GGUF | 763B (base) | no disponible | no publicada | no disponible | GGUF de 113,6 GB; DGX Spark de 128 GB |
| DeepSeek-V4.1-Flash-1017 original | 763B | no disponible | 1,838 | no disponible | Checkpoint FP4/FP8 de 307,2 GB; servidor multi-GPU |

## Limitaciones y advertencias

- Pérdida de calidad clara frente al original: perplejidad de 3,615 frente a 1,838 y discrepancia en la siguiente palabra aproximadamente 1 de cada 4 veces; se esperan más errores factuales y razonamiento largo más frágil.
- Inferior al build de Baekpica de 113,6 GB (74,5 % frente a 78,5 % de coincidencia), sin calibración ni sidecar de corrección.
- Sin evaluación de tareas reales (código, Q&A, matemáticas): las únicas pruebas son fidelidad de siguiente palabra y unos pocos prompts de comprobación.
- No es cargable en llama.cpp, vLLM ni Ollama; requiere ds4-dfm-rs con parche y las tablas Engram externas, lo que complica el despliegue en producción.
- Descarga total de ~300 GB pese a que el GGUF sean 99,1 GB, por las tablas Engram servidas desde los shards originales.
- Idiomas: solo se declara inglés; el rendimiento en castellano u otras lenguas no está documentado.
- Sesgos conocidos y riesgo de alucinación específicos: no disponibles en la información proporcionada, aunque la degradación por cuantización agrava previsiblemente ambos.
- Licencia MIT declarada por el publicador de la cuantización; conviene verificar los términos del modelo base DeepSeek antes de uso comercial.
- Strix Halo en Linux nativo está sin probar; el soporte en ese hardware no está garantizado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/staccs/DeepSeek-V4.1-Flash-1017-lecore-vq10sh12-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Build de referencia Baekpica VQ GGUF: https://huggingface.co/Baekpica/DeepSeek-V4.1-Flash-1017-VQ-GGUF
- Cuantizador y runtime YoungAi: https://github.com/fodelf/YoungAi
