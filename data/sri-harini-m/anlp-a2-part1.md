# sri-harini-m/anlp-a2-part1

## Resumen

`anlp-a2-part1` es un paquete de cinco checkpoints de investigación publicados por sri-harini-m (IIIT Hyderabad) como parte de la asignatura ANLP (Assignment 2, Part 1). No es un modelo de producción, sino un estudio comparativo reproducible sobre arquitecturas Mixture of Experts (MoE) aplicadas a traducción automática. Cada checkpoint es un transformer decoder-only entrenado desde cero con 60 millones de tokens sobre el dataset `belumind/en-vi-ja-curated-500k-triplets`, cubriendo las direcciones vietnamita→inglés y japonés→inglés.

El objetivo del trabajo es medir el compromiso entre parámetros totales y parámetros activos en el bloque feed-forward. El repositorio incluye una línea base densa (MLP) de 31,20M de parámetros y cuatro variantes MoE que introducen enrutamiento disperso: top-1 sobre 4 expertos, top-2 sobre 4 expertos, una configuración con 1 experto compartido más 3 con top-1, y una variante «active-matched» de mayor tamaño (43,81M totales, 31,21M activos) diseñada para igualar los parámetros activos de la línea base densa.

Su relevancia es didáctica y experimental: ofrece pesos finales y de mejor validación, junto con métricas de perplejidad y BLEU por variante, lo que permite reproducir y auditar el efecto del enrutamiento MoE en un régimen de cómputo reducido. El tamaño del repositorio es de 1,3 GB y el formato de pesos es PyTorch nativo (`.pt`), no safetensors.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only; variantes con bloque feed-forward denso (MLP) o Mixture of Experts (MoE) |
| Parametros totales | 31,20M (densa) / 31,22M (MoE 4e top-1, 4e top-2, shared 1+3) / 43,81M (MoE 4e top-2 active-matched) |
| Parametros activos | 31,20M (densa); 21,76M (4e top-1); 24,91M (4e top-2 y shared 1+3); 31,21M (active-matched) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en fp32 nativo de PyTorch; no se documentan cuantizaciones) |
| Idiomas soportados | vietnamita→ingles y japones→ingles (tarea de traduccion); la metadata del repositorio no declara idiomas |
| Licencia | no disponible |
| Formato de pesos | PyTorch `.pt` (`final.pt` y `best.pt` por carpeta); no hay safetensors ni GGUF |

## Arquitectura y entrenamiento

Los cinco checkpoints son transformers decoder-only con atención causal y un bloque feed-forward que varía entre variantes. La línea base (`dense/`) usa un MLP denso. Las variantes MoE (`moe_4e_top1/`, `moe_4e_top2/`, `moe_shared_1p3/`, `moe_4e_top2_active_matched/`) sustituyen ese MLP por una capa de expertos con enrutamiento disperso: 4 expertos con selección top-1, 4 expertos con selección top-2, y una configuración mixta de 1 experto compartido más 3 expertos con top-1. La variante «active-matched» escala el número total de parámetros (43,81M) para que los parámetros activos (31,21M) coincidan con los de la línea base densa, aislando así el efecto del enrutamiento frente al de la capacidad.

Cada modelo se entrenó desde cero con 60 millones de tokens sobre `belumind/en-vi-ja-curated-500k-triplets`, un corpus de 500.000 tripletas para vietnamita, inglés y japonés. La model card no documenta el uso de RLHF, DPO ni técnicas de decodificación especulativa, atención lineal u otras innovaciones más allá del propio enrutamiento MoE. Se conservan dos checkpoints por variante: `final.pt` (fin de entrenamiento, usado para todas las métricas reportadas) y `best.pt` (menor pérdida de validación durante el entrenamiento).

## Capacidades

- Traducción automática vietnamita→inglés y japonés→inglés.
- Generación de texto autoregresiva en el marco de la tarea de traducción (decoder-only).
- Enrutamiento disperso de tokens hacia expertos (capacidad arquitectónica objeto del estudio, no una función de usuario).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta modo de «pensamiento» (thinking mode), visión, audio ni otras modalidades.
- Capacidad multilingüe limitada a los pares indicados; no hay evidencia de comportamiento multilingüe general.
- Inferencia directa vía PyTorch cargando el `state_dict` con `DecoderOnlyTransformer` del repositorio de código de la asignatura.

## Casos de uso

- Reproducción de investigación en eficiencia de MoE: comparar las cinco variantes con el mismo presupuesto de entrenamiento (60M tokens) para medir el efecto del enrutamiento top-1, top-2 y con experto compartido sobre PPL y BLEU.
- Estudio del compromiso parámetros totales/activos: la variante active-matched (43,81M totales, 31,21M activos) permite aislar si la mejora de BLEU (34,98 frente a 34,66 de la densa) proviene del enrutamiento o del mayor número de parámetros totales.
- Docencia y material de laboratorio: los checkpoints son lo bastante pequeños (31-44M) para entrenar y evaluar en una única GPU de gama baja, lo que facilita prácticas de traducción neuronal y de capas MoE.
- Prototipado de traducción vi→en y ja→en en entornos con recursos limitados: el modelo cabe en memoria trivial y puede ejecutarse en CPU para pruebas de concepto.
- Generación de traducciones sintéticas para aumento de datos: usar las salidas del modelo como datos adicionales en pipelines de bajo recurso para vietnamita o japonés.
- Auditoría de enrutamiento y equilibrado de expertos: analizar la distribución de tokens entre expertos y detectar colapso de expertos en configuraciones top-1.
- Experimentos de destilación: emplear la variante active-matched (mejor BLEU y PPL) como profesor para destilar hacia variantes más pequeñas o hacia la línea base densa.

## Benchmarks y rendimiento

Datos reportados en la model card (checkpoint `final.pt` de cada variante). La columna «BLEU» es el agregado; «BLEU vi» y «BLEU ja» desglosan por idioma de origen.

| Variante | Parametros totales | Parametros activos | Test PPL | BLEU | BLEU vi | BLEU ja |
|---|---|---|---|---|---|---|
| Dense MLP | 31,20M | 31,20M | 5,86 | 34,66 | 39,92 | 29,29 |
| MoE 4e top-1 | 31,22M | 21,76M | 6,02 | 34,02 | 39,23 | 28,69 |
| MoE 4e top-2 | 31,22M | 24,91M | 5,90 | 34,47 | 39,76 | 29,08 |
| MoE 1 shared + 3 top-1 | 31,22M | 24,91M | 5,98 | 34,33 | 39,54 | 29,01 |
| MoE 4e top-2 (active-matched) | 43,81M | 31,21M | 5,69 | 34,98 | 40,20 | 29,66 |

Observaciones derivadas de la tabla: la línea base densa supera a las tres variantes MoE de igual tamaño total (31,22M) en PPL y BLEU, mientras que la variante active-matched, con más parámetros totales pero activos equiparables a la densa, obtiene el mejor resultado global (PPL 5,69; BLEU 34,98). No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para cualquiera de las variantes (31-44M parámetros ≈ 125-175 MB de pesos, más activaciones del grafo de decodificación). En la práctica, cabe holgadamente en cualquier GPU consumer y también en CPU.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM; sirven desde una GTX 1050/1660 hasta RTX 4090, A100 o H100, aunque estas últimas están enormemente sobredimensionadas para este tamaño.
- Cabe en GPU consumer: sí, sin restricciones prácticas por memoria; el cuello de botella es la latencia de decodificación secuencial, no la VRAM.
- Opciones de despliegue: carga directa en PyTorch mediante `torch.load` y `DecoderOnlyTransformer` del repositorio de código de la asignatura (`src.models`). No se documenta soporte para vLLM, llama.cpp, Ollama, TGI ni formatos GGUF, y al no publicarse safetensors habría que convertir los pesos para usar esos runners.
- Latencia y throughput estimados: no disponible. No se reportan mediciones de latencia ni tokens por segundo.

## Comparativa con modelos similares

La información proporcionada no incluye métricas de modelos externos con los que comparar de forma verificable. La comparación más rigurosa posible se establece dentro del propio repositorio, entre las cinco variantes:

| Modelo | Parametros totales | Parametros activos | Test PPL | BLEU | Licencia |
|---|---|---|---|---|---|
| Dense MLP (linea base) | 31,20M | 31,20M | 5,86 | 34,66 | no disponible |
| MoE 4e top-1 | 31,22M | 21,76M | 6,02 | 34,02 | no disponible |
| MoE 4e top-2 | 31,22M | 24,91M | 5,90 | 34,47 | no disponible |
| MoE 1 shared + 3 top-1 | 31,22M | 24,91M | 5,98 | 34,33 | no disponible |
| MoE 4e top-2 (active-matched) | 43,81M | 31,21M | 5,69 | 34,98 | no disponible |

Frente a modelos de traducción de propósito general (por ejemplo, familias tipo OPUS-MT o NLLB), no se dispone en la información proporcionada de parámetros, contexto, licencia ni resultados comparables, por lo que no se incluye una comparativa numérica externa.

## Limitaciones y advertencias

- Modelo académico: procede de una práctica de asignatura, sin validación de producción ni mantenimiento declarado.
- Sesgos conocidos: no disponible. No se documenta análisis de sesgos ni de sesgo de género, y el corpus de entrenamiento podría introducir sesgos propios del dataset `belumind/en-vi-ja-curated-500k-triplets`.
- Riesgo de alucinación: no evaluado en la información disponible; en traducción, el riesgo se manifiesta como omisiones, adiciones o traducciones plausibles pero incorrectas.
- Limitaciones de contexto: la longitud de contexto no está documentada, lo que impide conocer la longitud máxima de entrada admitida.
- Limitaciones de idioma: solo se reportan vietnamita→inglés y japonés→inglés; no hay evidencia de otras direcciones ni de capacidades multilingües generales.
- Restricciones de licencia: la licencia no está declarada, por lo que el uso comercial es indeterminado y debe aclararse con el autor antes de cualquier despliegue.
- Formato de pesos: solo `.pt` de PyTorch, sin safetensors ni GGUF, lo que complica su integración en runners estándar de inferencia sin conversión previa.
- Reproducibilidad: requiere el repositorio de código de la asignatura para disponer de `src.models`; los checkpoints por sí solos no son directamente utilizables.
- Tamaño y rendimiento: 31-44M de parámetros y 60M de tokens de entrenamiento son insuficientes para calidad de traducción de nivel producción en dominios abiertos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sri-harini-m/anlp-a2-part1
- Carpeta de la variante densa: https://huggingface.co/sri-harini-m/anlp-a2-part1/tree/main/dense
- Registros de entrenamiento (WandB): https://wandb.ai/sriharini-m-iiit-hyderabad/anlp-assignment-2
- Dataset de entrenamiento: `belumind/en-vi-ja-curated-500k-triplets`
