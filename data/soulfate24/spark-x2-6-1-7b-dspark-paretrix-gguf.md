# Soulfate24/Spark-X2.6-1.7B-DSpark-Paretrix-GGUF

## Resumen

Spark-X2.6-1.7B-DSpark-Paretrix-GGUF es una colección de cuantizaciones GGUF del modelo base XHToken/Spark-X2.6-1.7B, un transformer de 1.707.657.216 parámetros (aproximadamente 1,7 mil millones) orientado a generación de texto y flujos de agente. La publica el usuario Soulfate24 bajo licencia Apache 2.0, y su rasgo diferencial no es el modelo en sí, sino el método de cuantización: la suite Paretrix, que planifica cada nivel de compresión mediante mediciones empíricas por clase de tensor en lugar de aplicar un único bitwidth uniforme a toda la red.

El repositorio incluye trece niveles de cuantización (desde Q8_0 stock hasta Femto-21pc), cada uno con métricas de perplejidad, divergencia KL y RMS de la diferencia de probabilidades frente a los logits en BF16, además de módulos de decodificación especulativa (drafts) DSpark que aceleran la inferencia entre un 42 % y un 85 % según configuración. Está pensado para despliegue local con llama.cpp y ofrece un compromiso medido entre tamaño en disco (de 1736 MiB a 729 MiB) y fidelidad de salida.

Su relevancia actual reside en la optimización extrema para hardware modesto: el nivel Precision-42pc ocupa 1399 MiB con una degradación de perplejidad de solo +0,4287 respecto a Q8_0, y el nivel Nano-27pc baja a 915 MiB manteniendo una divergencia KL de 0,1940, inferior a la del IQ4_XS stock de 971 MiB. El modelo solo declara soporte para inglés y chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalles de capas y atención no disponibles) |
| Parametros totales | 1.707.657.216 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible en la model card; el draft `draft-32K` sugiere soporte de hasta 32K tokens |
| Tipos de cuantizacion | GGUF: Q8_0, Q6_K-imx, Q5_K_M-imx, IQ4_XS-imx, IQ3_M-imx (stock) y niveles Paretrix Fidelity-48pc, Precision-42pc, Quality-36pc, Compact-33pc, Mini-30pc, Nano-27pc, Pico-24pc, Femto-21pc |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repositorio de 14,3 GB con múltiples niveles); el modelo base está en safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base XHToken/Spark-X2.6-1.7B más allá de su naturaleza transformer y su etiqueta de familia `sparkx2_5`. Tampoco se especifican el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO. Lo que sí está documentado es el proceso de cuantización, que constituye la innovación técnica principal de esta ficha.

Paretrix funciona en tres fases. Primero, partiendo de tres bases stock (Q8_0, Q6_K-imx e IQ4_XS-imx), mueve cada clase de tensor de forma aislada a cada tipo de cuantización disponible y mide la respuesta contra los logits en BF16. Segundo, un problema de mochila exacto (knapsack) planifica cada nivel a partir de esas celdas de medición. Tercero, un duelo en el régimen de veredicto decide si el plan sustituye al campeón vigente. El resultado es una asignación heterogénea de bitwidth por tensor que, según las métricas publicadas, supera a las cuantizaciones uniformes estándar en la frontera de Pareto. Adicionalmente, los módulos DSpark implementan decodificación especulativa con drafts de 143 a 259 MiB que alcanzan entre 147 y 162 tokens por segundo sobre el nivel Precision-42pc.

## Capacidades

- Generación de texto conversacional en inglés y chino.
- Orientado a flujos de agente (etiqueta `agent` en el repositorio).
- Compatible con endpoints (etiqueta `endpoints_compatible`).
- Decodificación especulativa mediante drafts DSpark: `draft-32K` (capas oficiales más readout propio), `draft-lite` (podado y entrenado) y draft oficial.
- Inferencia optimizada con llama.cpp, incluyendo cuantización de KV cache en q8_0 y q5_1.
- Soporte de cuantización con imatrix (imatrix en las variantes stock).
- No se declaran capacidades de visión, audio, tool calling explícito ni modo de razonamiento extendido en la información disponible.

## Casos de uso

- Despliegue en hardware de gama baja: el nivel Femto-21pc (729 MiB) permite ejecutar el modelo en equipos con 2-4 GB de VRAM libre o incluso en CPU, adecuado para prototipos y demos locales.
- Servicio de chat multilingüe inglés-chino: el nivel Precision-42pc (1399 MiB) mantiene una fidelidad cercana a Q8_0 y sirve para asistentes conversacionales en entornos con memoria limitada.
- Aceleración de inferencia en producción: combinar Precision-42pc con el draft `draft-32K` y KV q5_1 ofrece 162,2 tokens por segundo con un factor de aceleración de 1,85×, útil en servicios con requisitos de latencia estrictos.
- Evaluación de métodos de cuantización: los datos de PPL, KLD y RMS Δp por nivel permiten a investigadores comparar estrategias de compresión empírica frente a cuantización uniforme en un modelo de 1,7B.
- Pipelines de agentes ligeros: la etiqueta `agent` y la compatibilidad con endpoints facilitan integrarlo como componente de razonamiento en orquestadores multi-paso donde el coste por token importa.
- Experimentación con decodificación especulativa: los tres drafts publicados (232, 259 y 143 MiB) permiten medir el impacto de distintas estrategias de draft sobre el throughput sin reentrenar el modelo objetivo.
- Distribución de modelos en entornos con ancho de banda restringido: los niveles Compact-33pc (1106 MiB) y Mini-30pc (1008 MiB) reducen el tamaño de descarga manteniendo una KLD por debajo de 0,14.

## Benchmarks y rendimiento

Métricas de cuantización publicadas por el autor (PPL medida, ΔPPL frente a referencia, KLD, RMS Δp y top-p frente a BF16):

| Modelo | MiB | PPL | ΔPPL | KLD | RMS Δp | top-p |
|---|---:|---:|---:|---:|---:|---:|
| Q8_0 (stock) | 1736 | 36,5458 | +0,3304 | 0,0063 | 1,87 % | 95,8 % |
| Fidelity-48pc | 1569 | 36,6443 | +0,4289 | 0,0139 | 2,61 % | 94,0 % |
| Precision-42pc | 1399 | 36,6441 | +0,4287 | 0,0192 | 3,16 % | 92,4 % |
| Q6_K-imx (stock) | 1341 | 36,0955 | −0,1199 | 0,0412 | 4,58 % | 89,7 % |
| Quality-36pc | 1202 | 35,5200 | −0,6954 | 0,0492 | 4,95 % | 88,6 % |
| Q5_K_M-imx (stock) | 1194 | 36,9116 | +0,6962 | 0,0783 | 5,87 % | 86,1 % |
| Compact-33pc | 1106 | 33,3008 | −2,9146 | 0,0961 | 6,77 % | 83,6 % |
| Mini-30pc | 1008 | 34,0648 | −2,1506 | 0,1342 | 7,67 % | 81,4 % |
| IQ4_XS-imx (stock) | 971 | 37,6804 | +1,4651 | 0,2738 | 11,20 % | 74,8 % |
| Nano-27pc | 915 | 37,1129 | +0,8975 | 0,1940 | 9,26 % | 78,1 % |
| IQ3_M-imx (stock) | 848 | 53,2317 | +17,0163 | 0,5221 | 16,45 % | 65,7 % |
| Pico-24pc | 821 | 45,6438 | +9,4285 | 0,3705 | 13,22 % | 70,3 % |
| Femto-21pc | 729 | 43,3410 | +7,1257 | 0,5561 | 15,99 % | 64,9 % |

Rendimiento de los drafts DSpark sobre Precision-42pc:

| Draft | Módulo | KV q8_0 | KV q5_1 |
|---|---:|---:|---:|
| Draft oficial | 232 MiB | 147,3 t/s · ×1,42 | 143,0 t/s · ×1,62 |
| `draft-32K` | 259 MiB | 162,3 t/s · ×1,54 | 162,2 t/s · ×1,85 |
| `draft-lite` | 143 MiB | 161,3 t/s · ×1,56 | 155,2 t/s · ×1,77 |

No se han publicado resultados de benchmarks de calidad de tarea (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,0-1,8 GB para los niveles de mayor fidelidad (Q8_0, Fidelity-48pc, Precision-42pc), 0,7-1,2 GB para los niveles intermedios y 0,7-0,9 GB para Pico-24pc y Femto-21pc, sin contar la KV cache.
- Cabe en GPU de consumo: cualquier tarjeta con 4 GB o más de VRAM (GTX 1650, RTX 3050, RTX 4060, etc.) puede ejecutar los niveles Compact o Mini; los niveles Femto y Pico pueden correr incluso en CPU.
- GPU recomendadas para mayor throughput: RTX 4090, RTX 3090, A100 o H100 si se combina con decodificación especulativa y KV cache en q8_0 o q5_1.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, y cualquier runtime compatible con GGUF; el repositorio declara compatibilidad con endpoints.
- Throughput medido: 147-162 tokens por segundo con drafts DSpark sobre Precision-42pc, con aceleraciones de 1,42× a 1,85× frente a la inferencia sin draft. No se especifica el hardware de referencia de estas mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización destacada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Spark-X2.6-1.7B (Paretrix) | 1,7B | no disponible (draft de 32K) | Hasta 729 MiB con KLD 0,5561 | Apache 2.0 | Hugging Face |
| Spark-X2.6-1.7B (stock GGUF) | 1,7B | no disponible | Q8_0 1736 MiB, IQ4_XS 971 MiB | Apache 2.0 | Hugging Face |
| Alternativas de 1-2B de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de tarea que permitan comparar la calidad del modelo frente a otras familias de tamaño similar; la comparación anterior se limita a las variantes del propio modelo.

## Limitaciones y advertencias

- Idiomas limitados a inglés y chino; no se declara soporte de español ni de otras lenguas.
- No se han publicado evaluaciones de sesgo, toxicidad o alucinación para este modelo.
- Riesgo de alucinación inherente a modelos de 1,7B; la capacidad de razonamiento y conocimiento factual será inferior a la de modelos mayores.
- Los niveles de cuantización agresiva (Pico-24pc, Femto-21pc) muestran una degradación notable: KLD de 0,3705 y 0,5561 respectivamente, y PPL que sube hasta 43-45 frente a 36,5 de Q8_0.
- Las métricas de ΔPPL negativas en algunos niveles (Quality-36pc, Compact-33pc, Mini-30pc) indican que la perplejidad medida baja respecto a la referencia, lo que no debe interpretarse como mejora de calidad sino como efecto del conjunto de evaluación.
- El repositorio es una cuantización de terceros (Soulfate24), no una publicación oficial de XHToken; la reproducibilidad depende de las mediciones del autor.
- El rendimiento de los drafts DSpark se midió sin especificar hardware, por lo que las cifras de tokens por segundo no son directamente trasladables a otros equipos.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base XHToken/Spark-X2.6-1.7B antes de desplegar en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Soulfate24/Spark-X2.6-1.7B-DSpark-Paretrix-GGUF
- Modelo base: https://huggingface.co/XHToken/Spark-X2.6-1.7B
- GGUF base con DSpark: https://huggingface.co/XHToken/Spark-X2.6-1.7B-DSpark-GGUF
- Suite de cuantización Paretrix: https://huggingface.co/Soulfate24/Paretrix_Quantization_Suite
