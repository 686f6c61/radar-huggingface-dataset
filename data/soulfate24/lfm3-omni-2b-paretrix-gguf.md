# Soulfate24/LFM3-Omni-2B-Paretrix-GGUF

## Resumen

LFM3-Omni-2B-Paretrix-GGUF es una cuantización GGUF del modelo multimodal LiquidAI/LFM3-Omni-2B, publicada por el usuario Soulfate24 bajo el paraguas de su suite de cuantización Paretrix. El modelo base es un modelo "any-to-any" de Liquid AI que procesa y genera texto, audio e imagen (visión y speech-to-speech), orientado a despliegue en el edge y conversación en tiempo real. Esta versión concreta no es un modelo nuevo: es un conjunto de pesos cuantizados en formato GGUF para su uso con llama.cpp y herramientas compatibles, con múltiples niveles de compromiso entre tamaño y fidelidad.

El interés de esta ficha está en la cuantización: Paretrix aplica una estrategia de asignación de bits por clase de tensor guiada por mediciones empíricas (perplejidad, divergencia KL, RMS de diferencia de probabilidad) en lugar de una cuantización uniforme. El resultado es un conjunto de variantes ("rungs") que van desde 1.594 MiB (Fidelity-48pc) hasta 738 MiB (Femto-21pc), con el objetivo de preservar la calidad del modelo original con menos memoria.

El modelo base declara 1.728.801.600 parámetros (aproximadamente 1,73 mil millones) y soporta 23 idiomas, incluido el castellano. La licencia es lfm1.0 (marcada como "other" en Hugging Face), lo que impone restricciones que conviene revisar antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo base LiquidAI/LFM3-Omni-2B; arquitectura "liquid" según tags; transformer multimodal no confirmado) |
| Parametros totales | 1.728.801.600 (~1,73 B) |
| Parametros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF con múltiples variantes: Fidelity-48pc, Precision-42pc (Q6_K-imx), Quality-36pc, Q5_K_M-imx, Compact-33pc, Mini-30pc, IQ4_XS-imx, Nano-27pc, Pico-24pc, IQ3_M-imx, Femto-21pc |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl, da, el, fi, he, nl, sv, tr (23 idiomas) |
| Licencia | lfm1.0 (etiquetada como "other") |
| Formato de pesos | GGUF (repositorio de 9,6 GB; el modelo base se distribuye en safetensors) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base en la información proporcionada. Los tags indican "liquid", "lfm3", "lfm3-omni", "omni", "audio", "vision" y "speech-to-speech", lo que sugiere un modelo multimodal de la familia LFM3 de Liquid AI con capacidades de entrada y salida en múltiples modalidades. El pipeline declarado es "any-to-any". No se especifican el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

La innovación técnica relevante en esta ficha es la cuantización Paretrix. Según la model card, el proceso parte de tres bases "stock" (Q8_0, Q6_K-imx, IQ4_XS-imx), mueve cada clase de tensor individualmente a cada tipo de cuantización y mide el efecto frente a los logits en BF16. Con esas mediciones, un problema de mochila exacto planifica cada variante y un "duel" al régimen de veredicto decide si el plan sustituye al campeón. La card afirma que lo medido en un modelo se hereda al siguiente de la misma familia. Los datos de calidad reportados incluyen perplejidad (PPL), divergencia KL, RMS de la diferencia de probabilidad y top-p coincidente.

## Capacidades

- Procesamiento any-to-any: el modelo base acepta y genera texto, audio e imagen según los tags (audio, vision, speech-to-speech).
- Conversación multimodal: orientado a diálogo en tiempo real con entrada de voz y salida de voz.
- Generación de texto y razonamiento conversacional (capacidad inferida del pipeline any-to-any; no se detallan benchmarks).
- Capacidades multilingües en 23 idiomas, incluidos castellano, inglés, árabe, chino, francés, alemán, italiano, japonés, coreano, portugués, vietnamita, tailandés, indonesio, hindi, ruso, polaco, danés, griego, finés, hebreo, neerlandés, sueco y turco.
- Despliegue en edge: el tamaño del modelo base (~1,73 B parámetros) y las variantes GGUF de 738–1.594 MiB apuntan a inferencia en dispositivos con recursos limitados.
- Compatibilidad con llama.cpp y el ecosistema GGUF (según tags y formato).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la información proporcionada.
- Modo "thinking", audio o visión especial: no disponible en detalle; los tags confirman audio y visión.

## Casos de uso

- Asistentes de voz en el edge: el modelo base está etiquetado como speech-to-speech y orientado a edge, por lo que puede integrarse en dispositivos locales para conversación por voz sin depender de la nube; las variantes Compact-33pc (1.120 MiB) o Mini-30pc (1.021 MiB) reducen el requisito de memoria.
- Transcripción y respuesta hablada en atención al cliente: con entrada de audio y salida de texto o voz, permite construir un agente conversacional multilingüe (23 idiomas) para soporte telefónico o por voz.
- Descripción de imágenes en accesibilidad: la capacidad de visión del modelo base permite generar descripciones textuales de imágenes; las variantes Q8_0 o Fidelity-48pc preservan mejor la fidelidad para tareas sensibles a la precisión.
- Traducción y asistencia multilingüe: con 23 idiomas declarados, puede emplearse para traducción conversacional o asistencia en idiomas minoritarios europeos (danés, finés, griego, neerlandés, sueco) y no europeos.
- Prototipado e investigación en cuantización: las variantes Paretrix permiten estudiar el compromiso tamaño-calidad (PPL, KLD, top-p) en un modelo multimodal pequeño; la tabla de la model card ofrece puntos de comparación medidos.
- Inferencia en dispositivos consumer: con 738–1.594 MiB de pesos, el modelo cabe en GPUs de gama baja y en CPU con llama.cpp, lo que habilita demos locales de modelos multimodales sin GPU de datacenter.
- Análisis de audio y vídeo en local: combinando audio y visión, puede usarse para resumir o etiquetar contenido multimedia en entornos con requisitos de privacidad.

## Benchmarks y rendimiento

La model card proporciona métricas de calidad de cuantización (no benchmarks de tareas) medidas frente a los logits en BF16:

| Variante | MiB | PPL | ΔPPL | KLD | RMS Δp | top-p |
|---|---:|---:|---:|---:|---:|---:|
| Q8_0 (stock) | 1761 | 12,8832 | +0,0242 | 0,0011 | 0,85% | 98,2% |
| Fidelity-48pc | 1594 | 12,8958 | +0,0368 | 0,0016 | 1,02% | 98,0% |
| Precision-42pc (Q6_K-imx) | 1362 | 12,8545† | −0,0045 | 0,0035 | 1,55% | 96,9% |
| Quality-36pc | 1220 | 12,9202 | +0,0612 | 0,0068 | 2,17% | 95,6% |
| Q5_K_M-imx (stock) | 1200 | 12,8725 | +0,0135 | 0,0086 | 2,40% | 95,1% |
| Compact-33pc | 1120 | 12,9212 | +0,0622 | 0,0133 | 3,05% | 94,0% |
| Mini-30pc | 1021 | 13,1022 | +0,2432 | 0,0224 | 4,04% | 92,1% |
| IQ4_XS-imx (stock) | 957 | 13,1991 | +0,3402 | 0,0413 | 5,46% | 90,1% |
| Nano-27pc | 927 | 13,1685 | +0,3096 | 0,0417 | 5,50% | 88,9% |
| Pico-24pc | 833 | 13,3307 | +0,4717 | 0,0704 | 7,10% | 86,7% |
| IQ3_M-imx (stock) | 829 | 13,2256 | +0,3667 | 0,1004 | 8,40% | 84,5% |
| Femto-21pc | 738 | 14,1806 | +1,3216 | 0,1432 | 10,30% | 81,4% |

† El valor de PPL de Precision-42pc aparece con un signo negativo en ΔPPL en la model card original; se reproduce tal cual. No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,8–1,8 GB para los pesos según la variante (de Femto-21pc a Q8_0), más overhead de contexto y del runtime (kv cache, buffers de audio/visión).
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, cualquier GPU con ≥2–3 GB de VRAM libre debería ser suficiente para las variantes pequeñas, y ≥3–4 GB para Q8_0.
- Cabe en GPU consumer: sí, con alta probabilidad, dado el tamaño de los pesos; modelos como GTX 1660, RTX 3050/3060 o superiores deberían acomodar las variantes de mayor tamaño con contexto moderado.
- Opciones de despliegue: llama.cpp y ecosistema GGUF (según tags); también se etiqueta como compatible con endpoints y transformers en Hugging Face, aunque el formato principal es GGUF.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidades | Licencia | Formato |
|---|---|---|---|---|---|
| LFM3-Omni-2B-Paretrix-GGUF (esta ficha) | ~1,73 B | No disponible | Texto, audio, visión | lfm1.0 | GGUF |
| LiquidAI/LFM3-Omni-2B (base) | ~1,73 B | No disponible | Texto, audio, visión | lfm1.0 | Safetensors |
| Otras cuantizaciones GGUF del mismo base | ~1,73 B | No disponible | Texto, audio, visión | lfm1.0 | GGUF |

No se dispone en la información proporcionada de modelos comparables de otros autores con especificaciones verificables (parámetros, contexto, benchmarks) para establecer una comparación cuantitativa. Los datos de PPL y KLD de la tabla de benchmarks permiten comparar únicamente entre variantes del propio modelo.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información proporcionada; al ser un modelo entrenado con datos web, es probable que herede sesgos, pero no hay evidencia concreta en la ficha.
- Riesgo de alucinación: no cuantificado; las variantes de menor tamaño (Pico-24pc, Femto-21pc, IQ3_M) muestran un aumento notable de PPL y KLD, lo que puede degradar la fidelidad de las respuestas.
- Limitaciones de contexto o idioma: la longitud de contexto no está disponible; los 23 idiomas declarados no implican calidad uniforme entre ellos.
- Restricciones de licencia: la licencia lfm1.0 (etiquetada como "other") puede imponer condiciones al uso comercial; es necesario revisar el archivo LICENSE del repositorio antes de desplegar en producción.
- Caveat de producción: esta es una cuantización de terceros (Soulfate24), no una publicación oficial de Liquid AI; la calidad y la integridad de los pesos deben validarse en el caso de uso concreto.
- Las variantes por debajo de ~927 MiB (Nano-27pc, Pico-24pc, IQ3_M, Femto-21pc) presentan incrementos de KLD superiores a 0,04 y top-p por debajo del 90%, lo que supone una pérdida de fidelidad apreciable.
- No se documentan capacidades de tool calling ni de agentes; no deben asumirse sin validación.

## Enlaces

- Repositorio Hugging Face de esta cuantización: https://huggingface.co/Soulfate24/LFM3-Omni-2B-Paretrix-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM3-Omni-2B
- Suite de cuantización Paretrix: https://huggingface.co/Soulfate24/Paretrix_Quantization_Suite
- Licencia lfm1.0: enlace LICENSE dentro del repositorio (no se proporciona URL absoluta en la información disponible)
- Papers, blogs o demos adicionales: no disponible en la información proporcionada.
