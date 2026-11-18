# Soulfate24/MiniCPM5-2B-DSpark-Paretrix

## Resumen

MiniCPM5-2B-DSpark-Paretrix es una familia de cuantizaciones GGUF del modelo MiniCPM5-2B, desarrollado originalmente por OpenBMB y publicado por el usuario Soulfate24. El modelo base es un transformer denso de 2.516.756.480 parámetros (aproximadamente 2,5 mil millones), orientado a generación de texto, contexto largo, tool calling y despliegue en dispositivos de borde. Esta variante no modifica los pesos originales: redistribuye el presupuesto de bits por clase de tensor mediante la suite Paretrix para obtener un mejor compromiso entre tamaño, perplejidad y divergencia KL respecto a la referencia BF16.

La relevancia de esta publicación radica en su enfoque de cuantización empírica y activación-consciente. En lugar de aplicar una familia de bitwidth uniforme a toda la red, Paretrix mide la respuesta de cada clase de tensor a cada tipo de cuantización contra los logits BF16 y planifica cada escalón mediante una mochila exacta. El resultado son variantes con nombres como Fidelity-48pc, Precision-42pc, Quality-36pc, Compact-33pc, Mini-30pc, Nano-27pc, Pico-24pc y Femto-21pc, cada una con métricas de PPL, KLD y RMS Δp publicadas.

El repositorio incluye además el módulo de decodificación especulativa DSpark del modelo base, lo que permite acelerar la inferencia en llama.cpp. Con licencia Apache 2.0, idiomas inglés y chino, y un tamaño de repo de 30,7 GB que alberga todas las variantes, está pensado para desarrolladores que necesitan ejecutar un modelo de 2,5B con contexto largo en hardware modesto sin renunciar a una calidad medible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia MiniCPM5, tag `llama` en GGUF) |
| Parametros totales | 2.516.756.480 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | Contexto largo segun tags (`long-context`); valor exacto no disponible |
| Tipos de cuantizacion | GGUF híbridos Paretrix: Fidelity-48pc, Precision-42pc, Quality-36pc, Compact-33pc, Mini-30pc, Nano-27pc, Pico-24pc, Femto-21pc; bases stock Q8_0, Q6_K-imx, Q5_K_M-imx, IQ4_XS-imx, IQ3_M-imx |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base en safetensors |
| Modelo base | openbmb/MiniCPM5-2B y openbmb/MiniCPM5-2B-DSpark |
| Tamano del repo | 30,7 GB (todas las variantes) |
| Libreria | transformers, llama.cpp |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer denso de la familia MiniCPM5 con 2.516.756.480 parámetros. Los tags del repositorio indican compatibilidad con la arquitectura `llama` en el ecosistema GGUF y capacidades de contexto largo, tool calling y decodificación especulativa. La información disponible no detalla el número exacto de capas, dimensiones ocultas ni la longitud máxima de contexto, por lo que esos datos deben consultarse en la model card del modelo base openbmb/MiniCPM5-2B.

Los datos de entrenamiento del modelo base, según los datasets declarados, incluyen openbmb/Ultra-FineWeb, UltraX-Preview, Ultra-FineWeb-L3, UltraData-Math, UltraData-Code, UltraData-SFT-2605, UltraData-SFT-Agent-2609 y UltraData-RL-2609. Esta composición sugiere un pipeline que cubre preentrenamiento web y de código/matemáticas, seguido de ajuste supervisado y una fase de aprendizaje por refuerzo orientada a agentes. No se especifican en la información proporcionada el número total de tokens, la mezcla exacta ni si se emplearon DPO o RLHF con preferencias humanas.

La innovación técnica de esta publicación concreta es la cuantización Paretrix. El método parte de tres bases stock (Q8_0, Q6_K-imx e IQ4_XS-imx), mueve cada clase de tensor de forma aislada a cada tipo de cuantización y mide la desviación frente a los logits BF16. Con esas celdas, una mochila exacta planifica cada escalón y un duelo en el régimen de veredicto decide si el plan sustituye al campeón. También se incluye el módulo DSpark de decodificación especulativa, que actúa como draft para acelerar la generación.

## Capacidades

- Generación de texto conversacional en inglés y chino.
- Razonamiento de múltiples pasos y soporte de agentes, según los datasets de SFT-Agent y RL declarados.
- Tool calling / function calling, indicado explícitamente en los tags del modelo.
- Contexto largo, útil para documentos extensos y conversaciones multi-turno.
- Capacidades de código y matemáticas, respaldadas por los datasets UltraData-Code y UltraData-Math.
- Decodificación especulativa mediante el módulo DSpark, que acelera la inferencia en llama.cpp.
- Despliegue en dispositivo y edge AI, gracias a su tamaño de 2,5B y a las variantes GGUF de bajo peso.
- Cuantización híbrida por clase de tensor con métricas de fidelidad publicadas (PPL, KLD, RMS Δp, top-p).
- No se documentan capacidades de visión, audio ni un modo de pensamiento explícito en la información disponible.

## Casos de uso

- Asistente conversacional en local: con variantes Mini-30pc (1.487 MiB) o Nano-27pc (1.350 MiB) puede ejecutarse en portátiles y estaciones de trabajo sin GPU dedicada, gestionando diálogos multi-turno en inglés o chino.
- Agente con tool calling en pipelines de automatización: los tags de tool calling y los datasets SFT-Agent permiten integrarlo como planificador que invoca APIs y funciones en flujos multi-paso.
- Procesamiento de documentos largos: el soporte de contexto largo lo hace adecuado para resumir contratos, informes o hilos de correo extensos en una sola pasada, siempre que se confirme la ventana exacta en la model card del base.
- Generación y revisión de código en entornos con recursos limitados: las variantes Quality-36pc o Compact-33pc ofrecen un equilibrio razonable para autocompletado y explicación de fragmentos en IDE locales.
- Despliegue en dispositivos de borde: con Femto-21pc (1.072 MiB) o Pico-24pc (1.210 MiB) puede embeberse en routers, mini-PC o sistemas industriales para clasificación y generación de texto de baja latencia.
- Aceleración de inferencia con draft especulativo: el módulo DSpark puede usarse como modelo borrador junto a un modelo mayor en llama.cpp para reducir la latencia de decodificación.
- Prototipado rápido de aplicaciones NLP en investigación: la licencia Apache 2.0 y el formato GGUF facilitan experimentos reproducibles sin coste de licencia.

## Benchmarks y rendimiento

La model card publica métricas de fidelidad de cuantización frente a BF16 (PPL, ΔPPL, KLD, RMS Δp y top-p), no benchmarks de tareas estándar como MMLU o HumanEval:

| Variante | MiB | PPL | ΔPPL | KLD | RMS Δp | top-p |
|---|---:|---:|---:|---:|---:|---:|
| Q8_0 (stock) | 2556 | 11.9747 | +0.0145 | 0.0015 | 1.02% | 97.8% |
| Fidelity-48pc | 2309 | 11.9989 | +0.0387 | 0.0026 | 1.32% | 97.3% |
| Precision-42pc | 2060 | 12.0119 | +0.0517 | 0.0040 | 1.59% | 96.6% |
| Q6_K-imx (stock) | 1974 | 12.0129 | +0.0526 | 0.0059 | 1.92% | 95.8% |
| Quality-36pc | 1772 | 12.0388 | +0.0785 | 0.0103 | 2.57% | 94.6% |
| Q5_K_M-imx (stock) | 1724 | 12.1174 | +0.1571 | 0.0171 | 3.41% | 93.3% |
| Compact-33pc | 1628 | 12.1418 | +0.1815 | 0.0166 | 3.35% | 93.2% |
| Mini-30pc | 1487 | 12.3175 | +0.3573 | 0.0347 | 4.77% | 90.3% |
| IQ4_XS-imx (stock) | 1358 | 12.4567 | +0.4965 | 0.0712 | 6.72% | 87.0% |
| Nano-27pc | 1350 | 12.3951 | +0.4349 | 0.0546 | 5.88% | 88.4% |
| Pico-24pc | 1210 | 12.9000 | +0.9398 | 0.1025 | 8.11% | 84.1% |
| IQ3_M-imx (stock) | 1169 | 13.9382 | +1.9779 | 0.2027 | 11.87% | 78.5% |
| Femto-21pc | 1072 | 14.1474 | +2.1871 | 0.2003 | 11.66% | 77.0% |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: desde aproximadamente 1,1 GB (Femto-21pc, 1.072 MiB) hasta unos 2,5 GB (Q8_0, 2.556 MiB) para los pesos; hay que sumar el espacio de contexto KV.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 12 GB, RTX 4060, RTX 4090) puede alojar todas las variantes con contexto amplio; en A100/H100 el modelo queda sobredimensionado para uso individual, pero permite lotes grandes y servicio concurrente.
- Cabe en GPU consumer: sí, en todas las variantes, incluso en GPUs con 4-6 GB de VRAM usando las variantes Mini o Nano.
- Cabe en CPU: sí, las variantes de 1-1,5 GB son aptas para inferencia en CPU con llama.cpp.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama (importando el GGUF), transformers para el modelo base en safetensors; no se documenta soporte explícito de vLLM o TGI en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada. La decodificación especulativa con DSpark está pensada para reducir la latencia en llama.cpp, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| MiniCPM5-2B-DSpark-Paretrix | 2,52B | Largo (valor no disponible) | Apache 2.0 | GGUF | Cuantización híbrida por clase con métricas de fidelidad publicadas |
| openbmb/MiniCPM5-2B (base) | 2,52B | Largo (valor no disponible) | Apache 2.0 | Safetensors | Referencia BF16, sin cuantizar |
| openbmb/MiniCPM5-2B-DSpark (base) | 2,52B | Largo (valor no disponible) | Apache 2.0 | Safetensors | Incluye módulo draft especulativo |
| Qwen2.5-3B | 3,09B | 32.768 tokens (referencia pública) | Apache 2.0 | Safetensors, GGUF | Alternativa de tamaño similar; datos de contexto según documentación pública de Qwen |

No se dispone de comparativas de rendimiento en tareas entre estos modelos dentro de la información proporcionada.

## Limitaciones y advertencias

- Solo se declaran idiomas inglés y chino; el rendimiento en castellano u otras lenguas no está garantizado ni documentado.
- Riesgo de alucinación inherente a modelos de 2,5B: menor fiabilidad factual que modelos de mayor tamaño en tareas de conocimiento abierto.
- Las variantes de menor peso (Pico-24pc, Femto-21pc) muestran degradación notable: ΔPPL de +0,94 y +2,19 respectivamente, y top-p del 84,1% y 77,0%, lo que puede afectar a la coherencia en generaciones largas.
- La cuantización Paretrix está optimizada para las métricas declaradas (PPL/KLD sobre logits BF16); el comportamiento en tareas específicas puede diferir y no se han publicado evaluaciones por tarea.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base openbmb/MiniCPM5-2B y de los datasets empleados.
- El repositorio es una publicación de un tercero (Soulfate24), no del equipo original de OpenBMB; la procedencia y reproducibilidad de las cuantizaciones dependen del autor.
- No se documentan salvaguardas específicas, filtros de contenido ni evaluaciones de sesgo en la información disponible.
- El tamaño del repo (30,7 GB) obliga a descargar solo los archivos GGUF necesarios; descargar el repo completo es innecesario para la mayoría de despliegues.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Soulfate24/MiniCPM5-2B-DSpark-Paretrix
- Suite de cuantización Paretrix: https://huggingface.co/Soulfate24/Paretrix_Quantization_Suite
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- Modelo base con draft DSpark: https://huggingface.co/openbmb/MiniCPM5-2B-DSpark
- Dataset Ultra-FineWeb: https://huggingface.co/datasets/openbmb/Ultra-FineWeb
- Dataset UltraX-Preview: https://huggingface.co/datasets/openbmb/UltraX-Preview
- Dataset Ultra-FineWeb-L3: https://huggingface.co/datasets/openbmb/Ultra-FineWeb-L3
- Dataset UltraData-Math: https://huggingface.co/datasets/openbmb/UltraData-Math
- Dataset UltraData-Code: https://huggingface.co/datasets/openbmb/UltraData-Code
- Dataset UltraData-SFT-2605: https://huggingface.co/datasets/openbmb/UltraData-SFT-2605
- Dataset UltraData-SFT-Agent-2609: https://huggingface.co/datasets/openbmb/UltraData-SFT-Agent-2609
- Dataset UltraData-RL-2609: https://huggingface.co/datasets/openbmb/UltraData-RL-2609
