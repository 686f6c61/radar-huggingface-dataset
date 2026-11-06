# Soulfate24/Spark-X2.6-4B-DSpark-Paretrix-GGUF

## Resumen

Spark-X2.6-4B-DSpark-Paretrix-GGUF es una colección de cuantizaciones GGUF del modelo base XHToken/Spark-X2.6-4B, un transformer de 4.112 millones de parámetros (4,1 B) orientado a generación de texto y flujos de agente, publicado por el usuario Soulfate24 bajo licencia Apache 2.0. El repositorio no contiene un modelo nuevo, sino una suite de pesos cuantizados planificados con un método propio denominado Paretrix, que combina análisis de Pareto con matrices de activación para asignar bits de forma no uniforme por clase de tensor en lugar de aplicar una única familia de cuantización a toda la red.

La relevancia del artefacto está en su enfoque de eficiencia: junto a los pesos del modelo objetivo se distribuyen tres borradores de decodificación especulativa (drafts) del sistema DSpark, lo que permite acelerar la inferencia entre un 1,79× y un 2,07× según la variante, e incluso más en cargas de trabajo de agente. El modelo base declara soporte para inglés y chino, y el paquete está pensado para ejecutarse en llama.cpp con un fork específico que añade soporte para la arquitectura Spark2.5 y para el mecanismo DSpark.

El repositorio ocupa 47,8 GB e incluye múltiples escalones de cuantización, desde Q8_0 hasta variantes de aproximadamente 21 bits por componente planificadas ad hoc. Es, por tanto, un recurso práctico para desplegar un modelo de 4 B en hardware de consumo con control fino del compromiso entre fidelidad y tamaño.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (familia Spark2.5, según etiquetas del autor); detalles internos no disponibles |
| Parámetros totales | 4.112.079.360 (4,1 B) |
| Parámetros activos | No aplica (no se declara MoE) |
| Longitud de contexto | 131.072 tokens en la cabeza del modelo base (mencionado en la model card a propósito del draft); contexto de inferencia práctico limitado por VRAM |
| Tipos de cuantización | GGUF con planificación Paretrix: Fidelity-48pc, Precision-42pc, Quality-36pc, Compact-33pc, Mini-30pc, Nano-27pc, Pico-24pc, Femto-21pc, además de referencias stock Q8_0, Q6_K-imx, Q5_K_M-imx, IQ4_XS-imx, IQ3_M-imx |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base en safetensors; drafts en GGUF y safetensors fp32 |

## Arquitectura y entrenamiento

El modelo base es un transformer de 4,1 B de parámetros de la familia Spark2.5, según las etiquetas del autor. La model card no documenta la composición del dataset de entrenamiento, el número de tokens vistos ni si hubo fases de RLHF o DPO; esos datos no están disponibles. Lo que sí se describe con detalle es el proceso de cuantización, que constituye la innovación principal del repositorio.

Paretrix es una suite de cuantización empírica y consciente de las activaciones. Partiendo de tres bases stock (Q8_0, Q6_K-imx e IQ4_XS-imx), cada clase de tensor se mueve de forma aislada a cada tipo de cuantización y se mide contra los logits de referencia en BF16. Con esas celdas de medición, un problema de mochila exacto planifica cada escalón y un duelo en el régimen de veredicto (contexto 4096, temperatura 0) decide si el plan sustituye al campeón previo. El resultado son escalones que dominan estrictamente a las cuantizaciones uniformes equivalentes en el espacio de métricas PPL, KLD, RMS Δp y top-p. Adicionalmente, el paquete incorpora decodificación especulativa DSpark con tres borradores: el oficial (5 capas, bloque 7, 415 MiB, ×1,79), una variante de 32K con tabla de readout propia sobre 32.768 tokens (453 MiB, ×2,07) y una variante lite de 4 capas y FFN 1536 (179 MiB, ×1,81).

## Capacidades

- Generación de texto conversacional en inglés y chino.
- Razonamiento con modo de pensamiento (thinking mode), evidenciado por las 24 sondas de pensamiento usadas en las pruebas de los drafts.
- Flujos de agente: la model card menciona explícitamente cargas de trabajo de agente donde la ventaja del draft de 32K se amplía a ×3,1–×3,3.
- Integración con llama.cpp mediante un fork con soporte Spark2.5 y DSpark.
- Decodificación especulativa con borradores acoplados al modelo objetivo, con ventanas de draft de 512 tokens y KV del draft en f16.
- Compatibilidad con endpoints (etiqueta endpoints_compatible).
- No se declara soporte de tool calling, visión, audio ni función de llamada a herramientas en la información disponible.

## Casos de uso

- Asistente conversacional en inglés o chino: el modelo puede mantener diálogos multi-turno con contexto largo, y el escalón Quality-36pc (2.894 MiB, KLD 0,0278) ofrece un equilibrio razonable entre fidelidad y huella para servidores modestos.
- Agentes autónomos de múltiples pasos: el draft de 32K acelera la generación de propuestas en un 3,1–3,3× sobre el objetivo solo en cargas de agente, lo que reduce la latencia por paso en bucles de razonamiento y llamadas a herramientas.
- Despliegue en GPU de consumo de 8 GB: con el draft-lite (179 MiB) y un escalón Compact-33pc o Mini-30pc, el conjunto cabe junto a una caché KV f16 de aproximadamente 64–70K tokens, según la model card.
- Servicio de inferencia de bajo coste: el escalón Nano-27pc (2.201 MiB) iguala en tamaño a IQ4_XS-imx pero con mejor KLD (0,1230 frente a 0,1241), lo que lo hace adecuado para instancias con VRAM limitada.
- Evaluación de técnicas de cuantización: el repositorio sirve como banco de pruebas reproducible de la metodología Paretrix, con métricas PPL, KLD y top-p por escalón.
- Generación de texto en producción con llama-server: la combinación de objetivo Paretrix y draft de 32K con `--spec-type draft-dspark` permite servir texto con aceleración especulativa verificada.
- Investigación en decodificación especulativa: los tres drafts con distintos compromisos de tamaño, velocidad y VRAM permiten estudiar el impacto del readout y del tamaño del borrador en la tasa de aceptación.

## Benchmarks y rendimiento

La model card publica métricas de cuantización (PPL, ΔPPL, KLD, RMS Δp y top-p) medidas en el régimen de veredicto (contexto 4096). No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K) en la información disponible.

| Escalón | MiB | PPL | ΔPPL | KLD | RMS Δp | top-p |
|---|---:|---:|---:|---:|---:|---:|
| Q8_0 (stock) | 4172 | 14,9008 | +0,1397 | 0,0037 | 1,43% | 97,7% |
| Fidelity-48pc | 3767 | 14,8424 | +0,0813 | 0,0068 | 1,90% | 97,0% |
| Precision-42pc | 3344 | 14,7933 | +0,0323 | 0,0125 | 2,85% | 95,6% |
| Q6_K-imx (stock) | 3223 | 14,8915 | +0,1304 | 0,0148 | 2,97% | 95,2% |
| Quality-36pc | 2894 | 15,2484 | +0,4873 | 0,0278 | 4,30% | 93,0% |
| Q5_K_M-imx (stock) | 2840 | 15,8504 | +1,0893 | 0,0503 | 5,42% | 90,7% |
| Compact-33pc | 2660 | 15,2058 | +0,4447 | 0,0603 | 5,88% | 89,4% |
| Mini-30pc | 2424 | 15,2393 | +0,4783 | 0,0779 | 6,74% | 88,2% |
| IQ4_XS-imx (stock) | 2266 | 14,8916 | +0,1305 | 0,1241 | 8,23% | 84,9% |
| Nano-27pc | 2201 | 15,3033 | +0,5422 | 0,1230 | 8,32% | 85,0% |
| Pico-24pc | 1977 | 15,6347 | +0,8736 | 0,2219 | 11,62% | 79,7% |
| IQ3_M-imx (stock) | 1949 | 19,9445 | +5,1834 | 0,4527 | 16,89% | 72,2% |
| Femto-21pc | 1751 | 17,8678 | +3,1067 | 0,3717 | 14,88% | 74,4% |

Aceleración de los drafts (objetivo Precision-42pc, contexto 4096, KV f16, RTX 4060 8 GB, `--spec-draft-n-max 5`):

| Draft | Tamaño | Aceleración |
|---|---:|---:|
| dspark-Paretrix-Balanced (oficial) | 415 MiB | ×1,79 |
| dspark-32K-Paretrix-Balanced | 453 MiB | ×2,07 |
| dspark-lite-Paretrix-Balanced | 179 MiB | ×1,81 |

## Requisitos de hardware

- VRAM estimada para inferencia: entre aproximadamente 1,75 GiB (Femto-21pc) y 4,17 GiB (Q8_0) solo para los pesos; hay que sumar la caché KV, que en f16 consume unos 36 KiB por token según la model card.
- GPU recomendadas: RTX 4060 de 8 GB es la referencia usada por el autor para las pruebas de drafts; tarjetas de 8 GB o más permiten ejecutar escalones medios con contexto amplio. Para contexto máximo de 131K se requiere hardware de mayor capacidad (A100, H100) o cuantización de caché.
- Cabe en GPU de consumo: sí, desde escalones Pico-24pc y Nano-27pc en tarjetas de 6–8 GB; con draft-lite se liberan 274 MiB adicionales respecto al draft de 32K, lo que lo hace preferible en GPUs por debajo de 8 GB.
- Opciones de despliegue: llama.cpp con el fork de XHToken (soporte Spark2.5 y DSpark); llama-server con `--spec-type draft-dspark`. No se mencionan vLLM, TGI ni Ollama en la información disponible.
- Latencia y throughput: la model card reporta aceleraciones relativas de 1,79× a 2,07× con drafts y de 3,1× a 3,3× en cargas de agente con el draft de 32K; no se publican valores absolutos de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización destacada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Spark-X2.6-4B-DSpark-Paretrix | 4,1 B | 131.072 (base) | GGUF Paretrix + drafts DSpark | Apache 2.0 | Hugging Face |
| XHToken/Spark-X2.6-4B (base) | 4,1 B | 131.072 | safetensors / GGUF stock | No disponible en la información | Hugging Face |
| XHToken/Spark-X2.6-4B-DSpark-GGUF | 4,1 B | 131.072 | GGUF con draft oficial | No disponible en la información | Hugging Face |

No se dispone de datos de benchmarks de tareas que permitan comparar el rendimiento cualitativo con modelos de otros autores de tamaño similar; la comparación disponible se limita a las métricas de cuantización frente a los escalones stock del mismo modelo.

## Limitaciones y advertencias

- El repositorio es una cuantización, no un modelo entrenado desde cero; hereda los sesgos y limitaciones del modelo base XHToken/Spark-X2.6-4B, que no están documentados en la información disponible.
- Riesgo de alucinación inherente a los modelos de 4 B; no se han publicado evaluaciones de factualidad.
- Cobertura lingüística limitada a inglés y chino; no se garantiza un rendimiento adecuado en castellano.
- Los escalones agresivos (Femto-21pc, Pico-24pc) muestran degradación notable: Femto-21pc tiene un ΔPPL de +3,1067 y un KLD de 0,3717, lo que puede afectar a tareas sensibles a la distribución de probabilidad.
- La decodificación especulativa requiere un fork específico de llama.cpp; no funciona con builds estándar sin soporte Spark2.5/DSpark.
- El uso de caché KV cuantizada degrada la aceleración (×1,51 a 64K con q8_0) y provoca reconversión del caché en cada bloque verificado.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; la model card no documenta procedencia de datos ni cumplimiento normativo.
- El tamaño del repositorio (47,8 GB) exige espacio de almacenamiento considerable para descargar todos los escalones.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Soulfate24/Spark-X2.6-4B-DSpark-Paretrix-GGUF
- Modelo base: https://huggingface.co/XHToken/Spark-X2.6-4B
- GGUF base con DSpark: https://huggingface.co/XHToken/Spark-X2.6-4B-DSpark-GGUF
- Suite de cuantización Paretrix: https://huggingface.co/Soulfate24/Paretrix_Quantization_Suite
- llama.cpp: https://github.com/ggml-org/llama.cpp
