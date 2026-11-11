# Soulfate24/MiniCPM-OCR-1.0-DSpark-Paretrix-GGUF

## Resumen

MiniCPM-OCR-1.0-DSpark-Paretrix-GGUF es una cuantización GGUF del modelo multimodal MiniCPM-OCR-1.0 de OpenBMB, publicada por el usuario Soulfate24 bajo la suite de cuantización Paretrix. El modelo base es un vision-language model de aproximadamente 752 millones de parámetros (752.167.744 según los pesos en safetensors) especializado en OCR y parsing de documentos: reconocimiento de texto en imágenes, tablas y fórmulas. Esta versión concreta empaqueta además el módulo DSpark, orientado a decodificación especulativa como draft model.

La relevancia de esta ficha radica en su enfoque de cuantización. Frente a la cuantización uniforme tradicional, Paretrix mide la respuesta del modelo a cada cambio de tipo por clase de tensor y planifica cada nivel mediante un problema de mochila exacto, comparando contra los logits en BF16. El resultado son variantes con nombres propios (Fidelity-48pc, Precision-42pc, Quality-36pc, etc.) que buscan dominar estrictamente a las cuantizaciones estándar de llama.cpp en el régimen de evaluación declarado (contexto 4096, build 12283).

El repositorio ocupa 4,9 GB e incluye múltiples niveles de cuantización con métricas de perplejidad, KLD y RMS Δp publicadas por el autor. La licencia es Apache 2.0, los idiomas soportados son inglés y chino, y el pipeline es image-text-to-text. Es un modelo de nicho, con cero descargas y cero likes en el momento de la consulta, lo que conviene tener en cuenta al evaluar su madurez.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-language transformer (MiniCPM-OCR); detalles internos no disponibles |
| Parámetros totales | 752.167.744 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el régimen de evaluación de benchmarks usa 4096) |
| Tipos de cuantización | Q8_0, Q6_K-imx, Q5_K_M-imx, IQ4_XS-imx, IQ3_M-imx (stock) y variantes Paretrix: Fidelity-48pc, Precision-42pc, Quality-36pc, Compact-33pc, Mini-30pc, Nano-27pc, Pico-24pc, Femto-21pc |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors para el modelo base) |

## Arquitectura y entrenamiento

El modelo base MiniCPM-OCR-1.0 es un vision-language model de OpenBMB orientado a OCR y parsing de documentos, con capacidades declaradas de reconocimiento de tablas y fórmulas. La información disponible no detalla la arquitectura interna (número de capas, atención, estrategia de fusión visión-lenguaje) ni los datos de entrenamiento del modelo original. El repositorio incluye además el módulo DSpark, que los tags identifican como draft para decodificación especulativa.

La innovación técnica de esta publicación no está en el modelo sino en el proceso de cuantización. Paretrix parte de tres bases stock (Q8_0, Q6_K-imx, IQ4_XS-imx), mueve cada clase de tensor de forma aislada a cada tipo y mide la desviación frente a los logits en BF16. Con esas celdas de medición, un problema de mochila exacto planifica cada nivel, y un duelo en el régimen de veredicto (contexto 4096, build 12283 de llama.cpp) decide si el plan sustituye al campeón. El autor declara 18 dominaciones estrictas de Pareto. Las métricas publicadas incluyen perplejidad, KLD, RMS Δp y top-p para cada nivel.

## Capacidades

- Reconocimiento óptico de caracteres (OCR) sobre imágenes de documentos.
- Parsing de documentos estructurados.
- Reconocimiento de tablas.
- Reconocimiento de fórmulas matemáticas.
- Procesamiento multimodal imagen-texto (pipeline image-text-to-text).
- Conversación multi-turno (tag conversational).
- Soporte de decodificación especulativa mediante el draft DSpark incluido en el repositorio.
- Idiomas: inglés y chino.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente o razonamiento multi-paso: no disponible en la información proporcionada.

## Casos de uso

- Digitalización de facturas y albaranes: el modelo puede extraer texto y estructuras tabulares de imágenes de documentos escaneados, aprovechando sus capacidades específicas de reconocimiento de tablas para volcar líneas de detalle a un sistema contable.
- Extracción de fórmulas en documentación técnica y científica: dado su soporte declarado de formula recognition, resulta adecuado para convertir páginas escaneadas de papers o manuales en LaTeX o texto estructurado.
- Pipeline de OCR en local con llama.cpp: al distribuirse en GGUF, puede desplegarse en entornos sin GPU dedicada o con GPU de consumo, integrándose en flujos batch de digitalización masiva.
- Preprocesado de documentos para RAG: el modelo puede convertir PDFs e imágenes en texto limpio antes de la indexación en un sistema de recuperación, con la ventaja de ejecutarse en la misma infraestructura que el resto del stack llama.cpp.
- Aceleración de inferencia con decodificación especulativa: el módulo DSpark incluido permite usar el modelo como draft para acelerar la generación en configuraciones compatibles de llama.cpp, reduciendo latencia en entornos de producción.
- Procesamiento de documentos bilingües inglés-chino: adecuado para organizaciones que manejan documentación en ambos idiomas, dado el soporte declarado de en y zh.
- Despliegue en hardware limitado: las variantes de menor tamaño (Pico-24pc con 364 MiB, Femto-21pc con 323 MiB) permiten ejecutar OCR en dispositivos con poca memoria, a costa de mayor degradación de perplejidad.

## Benchmarks y rendimiento

El autor publica métricas de cuantización (perplejidad, KLD, RMS Δp, top-p) para cada nivel, no benchmarks de tareas OCR. Se reproducen a continuación.

| Modelo | MiB | PPL | ΔPPL | KLD | RMS Δp | top-p |
|---|---:|---:|---:|---:|---:|---:|
| Q8_0 (stock) | 774 | 15,3164 | +0,0780 | 0,0014 | 1,00 % | 98,0 % |
| Fidelity-48pc | 704 | 15,3322 | +0,0938 | 0,0029 | 1,42 % | 97,1 % |
| Precision-42pc | 619 | 15,3728 | +0,1344 | 0,0052 | 1,89 % | 96,2 % |
| Q6_K-imx (stock) | 600 | 15,3951 | +0,1567 | 0,0063 | 2,10 % | 95,7 % |
| Q5_K_M-imx (stock) | 551 | 15,5443 | +0,3059 | 0,0151 | 3,29 % | 93,2 % |
| Quality-36pc | 532 | 15,5062 | +0,2678 | 0,0174 | 3,51 % | 92,1 % |
| Compact-33pc | 489 | 15,7849 | +0,5465 | 0,0328 | 4,70 % | 90,3 % |
| IQ4_XS-imx (stock) | 481 | 15,5388 | +0,3004 | 0,0520 | 5,84 % | 88,6 % |
| Mini-30pc | 446 | 15,6352 | +0,3968 | 0,0550 | 6,01 % | 87,6 % |
| IQ3_M-imx (stock) | 433 | 16,8343 | +1,5959 | 0,1611 | 10,40 % | 80,6 % |
| Nano-27pc | 405 | 16,1268 | +0,8884 | 0,0879 | 7,78 % | 84,1 % |
| Pico-24pc | 364 | 17,0485 | +1,8101 | 0,1754 | 10,96 % | 78,3 % |
| Femto-21pc | 323 | 19,3344 | +4,0960 | 0,3087 | 14,04 % | 70,9 % |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada: entre aproximadamente 0,4 y 0,8 GB para los pesos según el nivel (323 MiB en Femto-21pc hasta 774 MiB en Q8_0); a esto hay que sumar la memoria del contexto y del procesador de visión, no cuantificada en la información disponible.
- Cabe en cualquier GPU de consumo actual, incluidas GTX 1060, RTX 3060, RTX 4090, así como en CPU.
- GPU recomendadas: no hay recomendación del autor; por tamaño, cualquier GPU con al menos 2-4 GB de VRAM libre es suficiente para los pesos, aunque el rendimiento real depende del backend.
- Opciones de despliegue: llama.cpp (build 12283 según el régimen de veredicto declarado), gguf-py y, por extensión del formato, herramientas compatibles con GGUF como Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| MiniCPM-OCR-1.0-DSpark-Paretrix (esta ficha) | 752.167.744 | no disponible | Apache 2.0 | GGUF | Cuantización Paretrix con draft DSpark |
| openbmb/MiniCPM-OCR-1.0 | 752.167.744 (según dato del repo cuantizado) | no disponible | Apache 2.0 (heredada) | safetensors | Modelo base original |
| openbmb/MiniCPM-OCR-1.0-DSpark | no disponible | no disponible | no disponible | no disponible | Variante con módulo DSpark |

No se dispone en la información proporcionada de datos de rendimiento de tareas ni de otros modelos OCR comparables (por ejemplo, variantes de PaddleOCR o Donut) que permitan una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Modelo de nicho con cero descargas y cero likes en el momento de la consulta; no hay evidencia de uso en producción ni validación externa.
- Las métricas publicadas son de cuantización (perplejidad, KLD), no de precisión en tareas OCR; no se ha demostrado que la degradación de perplejidad se traduzca en menor exactitud de reconocimiento.
- Los niveles agresivos (Femto-21pc, Pico-24pc) muestran un ΔPPL muy elevado (+4,10 y +1,81 respectivamente) y una caída notable de top-p, lo que sugiere degradación sustancial de la calidad.
- Idiomas limitados a inglés y chino; el rendimiento en castellano no está documentado.
- Riesgo de alucinación inherente a los modelos generativos, especialmente en documentos con baja calidad de imagen o tablas complejas.
- Sesgos: no disponibles en la información proporcionada.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base original de OpenBMB.
- El régimen de veredicto declarado es contexto 4096 y build 12283 de llama.cpp; comportamientos fuera de ese régimen no están validados.
- La fecha de creación del repositorio (2026-11-11) y el ecosistema de herramientas asociado deben tratarse con cautela si se integran en pipelines de producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Soulfate24/MiniCPM-OCR-1.0-DSpark-Paretrix-GGUF
- Modelo base: https://huggingface.co/openbmb/MiniCPM-OCR-1.0
- Variante con draft DSpark: https://huggingface.co/openbmb/MiniCPM-OCR-1.0-DSpark
- Suite de cuantización Paretrix: https://huggingface.co/Soulfate24/Paretrix_Quantization_Suite
- llama.cpp: https://github.com/ggml-org/llama.cpp
