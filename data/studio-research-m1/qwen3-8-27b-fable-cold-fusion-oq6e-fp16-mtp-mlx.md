# Studio-Research-M1/Qwen3.8-27B-Fable-Cold-Fusion-oQ6e-FP16-MTP-MLX

## Resumen

Qwen3.8-27B Fable Cold Fusion (oQ6e, FP16, MTP, MLX) es una cuantización en precisión mixta para Apple Silicon de un fine-tune de 27B parámetros basado en la familia Qwen3.8, publicado por Studio-Research-M1. El modelo base es DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU, una variante "uncensored" orientada a conversación y generación de código. Esta versión concreta (oQ6e) ocupa 24,6 GB y se posiciona como el punto medio de una familia de tres cuantizaciones (oQ4e, oQ6e, oQ8e).

Su relevancia radica en que está optimizado específicamente para las GPU de los chips M1 / M1 Pro / M1 Max, que carecen de soporte BF16 por hardware: los tensores no cuantizados usan FP16 y la torre de visión se mantiene en FP32. Conserva la cabeza MTP (multi-token prediction) para decodificación especulativa y la torre de visión, de modo que sigue siendo un modelo image-text-to-text.

Según la model card, las tres cuantizaciones de la familia empatan estadísticamente en precisión en los benchmarks del autor; lo que cambia es velocidad, memoria y fidelidad frente al BF16. La variante oQ6e tiene el MTP desactivado, por lo que en la práctica resulta más lenta que oQ4e y, en código, más lenta que oQ8e con MTP activado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con cabeza MTP, basado en Qwen3.8 |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (no se indica arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ6e (precisión mixta: escalas, sesgos y tensores de texto no cuantizados en FP16; torre de visión en FP32; cabeza MTP cuantizada) |
| Idiomas soportados | inglés, francés (según model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería MLX, formato oQ) |

## Arquitectura y entrenamiento

El modelo es una cuantización oQ6e del fine-tune DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU, a su vez derivado de la familia Qwen3.8. Es un modelo denso de ~27,78B parámetros con pipeline image-text-to-text: incluye una torre de visión en FP32 (333 tensores) que le permite procesar imágenes junto con texto, aunque la model card no evalúa las capacidades visuales.

Los detalles de entrenamiento del fine-tune base (tokens, composición del dataset, RLHF/DPO) no están disponibles en la información proporcionada. Las innovaciones están en el empaquetado para Apple Silicon: escalas, sesgos y tensores de texto no cuantizados en FP16 (validado por el autor con perplejidad y KLD finitas sobre 32.768 posiciones de WikiText-2), conservación de la cabeza MTP (29 tensores cuantizados) para decodificación especulativa en motores compatibles como oMLX Lightning MTP, y un KLD medio frente al BF16 de 0,00046 en esta variante oQ6e, mejor que una conversión MLX estándar al mismo ancho de bits.

## Capacidades

- Generación de texto conversacional (etiquetado como conversational y uncensored, sin las restricciones de alineación típicas de los modelos base)
- Comprensión de imágenes: pipeline image-text-to-text gracias a la torre de visión conservada (no evaluada en la model card)
- Generación de código: la model card destaca rendimiento específico en código con decodificación especulativa MTP en las variantes oQ4e y oQ8e
- Decodificación especulativa mediante cabeza MTP conservada (29 tensores), aunque en esta variante oQ6e el MTP está desactivado según la model card
- Soporte de tool calling / function calling: no disponible en la información proporcionada
- Capacidades de agentes y multi-step reasoning: no disponible en la información proporcionada
- Multilingüe: inglés y francés declarados; no hay datos sobre otros idiomas

## Casos de uso

- Chat local en Mac con chip M1: con 24,6 GB de pesos, cabe en equipos con 32 GB de memoria unificada, permitiendo un asistente conversacional sin censura totalmente local y privado
- Asistente multimodal local: la torre de visión en FP32 permite describir o razonar sobre imágenes enviadas por el usuario sin enviar datos a la nube
- Generación y revisión de código en local: aunque en código las variantes oQ4e con MTP (28,1 tok/s) y oQ8e con MTP son más rápidas, oQ6e ofrece menor KLD que oQ4e con ~6 GB menos de memoria que oQ8e
- Prototipado de prompts con máxima fidelidad intermedia: el KLD medio de 0,00046 frente a BF16 lo hace adecuado para validar comportamientos de prompt antes de pasar a oQ8e
- Escritura creativa sin filtros: la variante "Heretic Uncensored" del modelo base está orientada a generación de prosa sin restricciones de alineación, útil para ficción y brainstorming
- Comparación de cuantizaciones: al compartir los tres builds el mismo modelo base, sirven para medir el impacto real de la cuantización en Apple Silicon

## Benchmarks y rendimiento

Datos publicados por el autor de la model card (no benchmarks estandarizados tipo MMLU o HumanEval):

| Métrica | Valor (oQ6e) |
|---|---|
| KLD medio vs BF16 | 0,00046 |
| KLD medio vs BF16 (oQ4e, referencia) | 0,0132 |
| KLD medio vs BF16 (oQ8e, referencia) | 0,00046 |
| Perplejidad y KLD en WikiText-2 | finitas sobre 32.768 posiciones |
| Velocidad en código | más lento que oQ4e con MTP (28,1 tok/s) y que oQ8e con MTP |
| Estado MTP | desactivado |

Según el autor, las tres cuantizaciones empatan estadísticamente en precisión. No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM / memoria unificada: 24,6 GB solo de pesos; se recomienda al menos 32 GB de memoria unificada para dejar margen al KV cache y al sistema
- Hardware objetivo: Apple Silicon, optimizado para la generación M1 / M1 Pro / M1 Max; los chips M2 a M5 tendrán builds BF16 nativos anunciados como próximos
- Consumer GPU: no aplica a GPU NVIDIA/AMD; está diseñado para Macs con memoria unificada. En un Mac de 32 GB cabe con ajustes; en uno de 24 GB quedará muy justo
- Despliegue: librería MLX; compatible con motores oMLX (incluido Lightning MTP para decodificación especulativa, aunque el MTP está desactivado en esta variante); no hay mención de vLLM, llama.cpp, Ollama o TGI
- Latencia y throughput: no disponible para oQ6e; como referencia de la familia, oQ4e con MTP alcanza 28,1 tok/s en código y oQ8e con MTP gana entre +17 % y +65 % frente a su modo sin MTP

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion / tamano | Contexto | MTP | Licencia |
|---|---|---|---|---|---|
| Qwen3.8-27B Fable Cold Fusion oQ6e (este) | 27,78B | oQ6e, 24,6 GB | no disponible | desactivado | Apache 2.0 |
| Qwen3.8-27B Fable Cold Fusion oQ4e | 27,78B | oQ4e, 18,0 GB | no disponible | activado (+48 % en código) | Apache 2.0 |
| Qwen3.8-27B Fable Cold Fusion oQ8e | 27,78B | oQ8e, 30,9 GB | no disponible | activado (+17 % a +65 %) | Apache 2.0 |

Dentro de la familia, oQ4e es la opción por defecto (más rápida y ligera), oQ8e la de máxima fidelidad para equipos con ≥ 48 GB, y oQ6e un compromiso que acaba siendo más lento que oQ4e y, en código, más lento que oQ8e con MTP. Comparativas con modelos de otros fabricantes de tamaño similar: no disponible en la información proporcionada.

## Limitaciones y advertencias

- Modelo "uncensored": el fine-tune base elimina salvaguardas de alineación, lo que implica riesgo elevado de generar contenido ofensivo, dañino o inseguro; no es adecuado para entornos de producción orientados a usuario final sin filtros adicionales
- Riesgo de alucinación: no disponible ningún dato específico; al tratarse de un fine-tune sin documentación de entrenamiento, debe asumirse el riesgo típico de los LLM
- Contexto: la longitud de ventana no está documentada en la model card, lo que dificulta planificar cargas de contexto largo
- Idiomas: solo se declaran inglés y francés; el rendimiento en castellano no está evaluado
- MTP desactivado en esta variante: no obtiene la aceleración por decodificación especulativa que sí tienen oQ4e y oQ8e
- Vision no evaluada: la torre de visión se conserva pero el autor no publica benchmarks de capacidades visuales
- FP16 en lugar de BF16: validado por el autor con perplejidad y KLD finitas, pero es una validación propia y no independiente
- Benchmarks propios: las cifras de KLD y velocidad provienen del autor del modelo, no de evaluaciones independientes
- Descargas muy bajas (79) y comunidad mínima: poco historial de errores reportados

## Enlaces

- Modelo: https://huggingface.co/Studio-Research-M1/Qwen3.8-27B-Fable-Cold-Fusion-oQ6e-FP16-MTP-MLX
- Variante oQ4e: https://huggingface.co/Studio-Research-M1/Qwen3.8-27B-Fable-Cold-Fusion-oQ4e-FP16-MTP-MLX
- Variante oQ8e: https://huggingface.co/Studio-Research-M1/Qwen3.8-27B-Fable-Cold-Fusion-oQ8e-FP16-MTP-MLX
- Colección de la familia: https://huggingface.co/collections/Studio-Research-M1/fable-cold-fusion-27b-oq-mlx-apple-silicon-6ae4c7edc03b20a43baac97a
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
