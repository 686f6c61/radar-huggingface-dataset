# Studio-Research-M1/Qwen3.8-27B-Fable-Cold-Fusion-oQ8e-FP16-MTP-MLX

## Resumen

Qwen3.8-27B Fable Cold Fusion (oQ8e) es una cuantización en precisión mixta para Apple Silicon de un fine-tuning de 27B parámetros basado en la familia Qwen3.8, publicado por Studio-Research-M1. El modelo base, DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU, es una variante "uncensored" orientada a conversación y generación sin restricciones, y esta versión oQ8e corresponde a la cuantización de mayor fidelidad de una familia de tres (oQ4e, oQ6e y oQ8e), todas optimizadas para la generación M1/M1 Pro/M1 Max.

El repositorio destaca por tres decisiones técnicas: el uso de FP16 para escalas, sesgos y tensores de texto no cuantizados (las GPU M1 no disponen de BF16 por hardware), la conservación de la cabeza MTP (multi-token prediction) para habilitar decodificación especulativa nativa en motores compatibles como oMLX Lightning MTP, y el mantenimiento de la torre de visión en FP32, lo que permite uso como modelo image-text-to-text. La fidelidad medida frente al BF16 original es muy alta, con una KLD media de 0,00046 en WikiText-2.

Es relevante para usuarios de Mac con Apple Silicon que necesitan un modelo multimodal de 27B con salida sin censura, decodificación especulativa lista para usar y calidad cercana al modelo original, con un tamaño de repositorio de 30,9 GB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto + torre de visión), con cabeza MTP para decodificación especulativa |
| Parametros totales | 27.781.427.952 (~27,8B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ8e (8-bit mixto, esta versión); familia disponible en oQ4e (18,0 GB), oQ6e (24,6 GB) y oQ8e (30,9 GB); escalas y tensores no cuantizados en FP16, torre de visión en FP32 |
| Idiomas soportados | Inglés, francés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

La arquitectura es un transformer multimodal de la familia Qwen3.8 con 27,8B parámetros, que incluye una torre de visión (333 tensores conservados en FP32) para tareas image-text-to-text y una cabeza MTP de 29 tensores (cuantizados) que permite decodificación especulativa multi-token sin configuración adicional en motores que la soporten, como oMLX Lightning MTP.

Esta ficha corresponde a una cuantización, no al entrenamiento original: Studio-Research-M1 parte del fine-tuning de DavidAU y aplica su esquema de cuantización oQ en precisión mixta, con escalas, sesgos y tensores de texto no cuantizados en FP16 (en lugar de BF16, por la ausencia de soporte hardware en GPU M1). Según la model card, para este modelo el FP16 es seguro: la perplexidad y la KLD se mantienen finitas en las 32.768 posiciones de WikiText-2 evaluadas. La KLD media frente al BF16 es de 0,00046 en oQ8e (frente a 0,0132 en oQ4e), y ambas cifras mejoran las de una conversión MLX estándar al mismo ancho de bits. No se dispone de datos sobre el dataset, número de tokens ni alineación (RLHF/DPO) del modelo base.

## Capacidades

- Generación de texto conversacional, con variante "uncensored" (sin los filtros de alineación del modelo base de Qwen)
- Comprensión de imágenes: pipeline image-text-to-text gracias a la torre de visión conservada en FP32 (la model card no incluye benchmarks de visión)
- Decodificación especulativa mediante la cabeza MTP conservada (29 tensores), con aceleraciones reportadas del +17 % al +65 % en oQ8e
- Generación de código: la model card reporta 28,1 tok/s en oQ4e con MTP activado frente a 19,0 tok/s en oQ8e
- Soporte multilingüe declarado en inglés y francés
- Fidelidad cercana al BF16 original (KLD media de 0,00046), adecuada cuando se prioriza calidad máxima de salida

## Casos de uso

- Chat local y privado en Mac: ejecución completamente offline en Apple Silicon con calidad cercana al BF16, adecuada para asistentes personales que procesan datos sensibles sin salir del dispositivo.
- Análisis y descripción de imágenes: la torre de visión en FP32 permite responder preguntas sobre imágenes (image-text-to-text) directamente en el portátil, útil para revisión de capturas, documentos escaneados o fotos.
- Generación y refactorización de código local: con MTP activado se recuperan entre un 17 % y un 65 % de velocidad, lo que hace viable el asistido por IA en IDEs locales.
- Redacción creativa sin restricciones: al ser una variante uncensored, se emplea en escritura de ficción y guiones donde los modelos alineados rechazan contenido.
- Evaluación y comparación de cuantizaciones: la KLD de 0,00046 frente a BF16 lo hace adecuado como referencia de máxima fidelidad para validar builds más agresivas (oQ4e/oQ6e) en investigación.
- Prototipado de agentes multimodales en dispositivo: la combinación de visión, conversación y decodificación especulativa permite experimentar con pipelines multi-paso en hardware de consumo sin coste de API.
- Traducción y trabajo bilingüe inglés-francés: soporte declarado de ambos idiomas para tareas de redacción y traducción entre ellos.

## Benchmarks y rendimiento

Datos publicados en la model card (no se incluyen benchmarks estándar tipo MMLU o HumanEval; solo métricas de cuantización y velocidad):

| Métrica | Valor |
|---|---|
| KLD media vs BF16 (oQ8e) | 0,00046 (32.768 posiciones WikiText-2) |
| KLD media vs BF16 (oQ4e, referencia) | 0,0132 |
| Perplexidad y KLD | Finitas en todas las posiciones evaluadas; sin salidas `!!!!` en smoke tests |
| Aceleración con MTP (oQ8e) | +17 % a +65 % |
| Velocidad en código (oQ4e + MTP, referencia) | 28,1 tok/s (frente a 19,0 tok/s en oQ8e) |

Según la model card, las tres builds (oQ4e, oQ6e, oQ8e) están estadísticamente empatadas en accuracy en sus benchmarks; lo que cambia es velocidad, memoria y fidelidad. No se han publicado resultados de benchmarks estándar (MMLU, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada necesaria: aproximadamente 31 GB solo de pesos (30,9 GB), más overhead de KV cache y runtime; la model card recomienda ≥ 48 GB de memoria unificada para oQ8e.
- Hardware objetivo: Apple Silicon, optimizado para M1/M1 Pro/M1 Max; también válido en chips posteriores (M2–M5) hasta que lleguen los builds con escalas BF16 nativas.
- Consumer: cabe en Mac Studio y MacBook Pro con 48 GB o 64 GB de memoria unificada; no cabe en Macs de 16, 24 o 32 GB (para esos casos, la model card recomienda oQ4e, de 17,97 GB).
- Despliegue: formato MLX (safetensors), diseñado para oMLX con soporte Lightning MTP; no hay mención a vLLM, llama.cpp, Ollama o TGI.
- Latencia/throughput: no disponible de forma específica para oQ8e más allá del rango de aceleración con MTP (+17 % a +65 %) y la referencia de 19,0 tok/s en tareas de código.

## Comparativa con modelos similares

| Modelo | Parámetros | Cuantización / tamaño | MTP | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B Fable oQ8e (esta ficha) | 27,8B | oQ8e mixto, 30,9 GB | Sí (+17 % a +65 %) | Apache 2.0 | MLX, Apple Silicon |
| Qwen3.8-27B Fable oQ4e | 27,8B | oQ4e mixto, 18,0 GB | Sí (+48 % en código) | Apache 2.0 | MLX, Apple Silicon |
| Qwen3.8-27B Fable oQ6e | 27,8B | oQ6e mixto, 24,6 GB | No | Apache 2.0 | MLX, Apple Silicon |

Las tres variantes están estadísticamente empatadas en accuracy según el autor; oQ4e es la opción por defecto por velocidad y footprint, oQ8e ofrece máxima fidelidad y oQ6e es un punto intermedio. No se han identificado alternativas externas comparables en la información disponible.

## Limitaciones y advertencias

- Modelo "uncensored": carece de los filtros de seguridad del modelo base, lo que implica riesgo elevado de generar contenido ofensivo, dañino o inapropiado; no apto para entornos de producción expuestos a usuarios finales sin salvaguardas adicionales.
- Alucinaciones: al tratarse de un fine-tuning sin documentación pública sobre su proceso de alineación, el riesgo de alucinación no está caracterizado; no disponible.
- Idiomas: soporte declarado solo para inglés y francés; el rendimiento en castellano no está documentado.
- Contexto: la longitud de ventana de contexto no está especificada en la model card.
- Visión: la torre de visión se conserva pero no está evaluada en la model card; su calidad tras la cuantización no está verificada.
- Hardware: requiere ≥ 48 GB de memoria unificada, lo que excluye la mayoría de Macs de consumo; las GPU M1 no tienen BF16 por hardware, de ahí el uso de FP16 (verificado como seguro para este modelo, pero es un matiz a tener en cuenta al comparar con builds BF16).
- Licencia Apache 2.0: sin restricciones para uso comercial, aunque el modelo base de DavidAU es un fine-tuning de terceros sin documentación detallada de su entrenamiento.
- Proyecto de terceros con muy poca tracción (149 descargas, 1 like): madurez, mantenimiento y soporte limitados.

## Enlaces

- Repositorio de esta ficha (oQ8e): https://huggingface.co/Studio-Research-M1/Qwen3.8-27B-Fable-Cold-Fusion-oQ8e-FP16-MTP-MLX
- Variante oQ4e: https://huggingface.co/Studio-Research-M1/Qwen3.8-27B-Fable-Cold-Fusion-oQ4e-FP16-MTP-MLX
- Variante oQ6e: https://huggingface.co/Studio-Research-M1/Qwen3.8-27B-Fable-Cold-Fusion-oQ6e-FP16-MTP-MLX
- Colección completa: https://huggingface.co/collections/Studio-Research-M1/fable-cold-fusion-27b-oq-mlx-apple-silicon-6ae4c7edc03b20a43baac97a
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
