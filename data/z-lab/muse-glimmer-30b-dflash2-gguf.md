# z-lab/Muse-Glimmer-30B-DFlash2-GGUF

## Resumen

`Muse-Glimmer-30B-DFlash2-GGUF` es un modelo de borrador (draft model) diseñado para decodificación especulativa, desarrollado por Inco AI y publicado en Hugging Face por el usuario `z-lab` como espejo del repositorio original. No es un modelo de lenguaje independiente: su función es acelerar la inferencia del modelo objetivo `meta-models/Muse-Glimmer-30B`, un LLM denso de 29,6 mil millones de parámetros con visión y 128K de contexto. El drafter DFlash 2 predice bloques completos de tokens en una sola pasada, mantiene las mejores candidaturas en cada posición y un selector traza una ruta coherente, logrando una decodificación sin pérdida: la salida greedy coincide exactamente con la del modelo objetivo y el muestreo preserva la distribución original.

Este repositorio contiene conversiones GGUF del drafter, con cuantizaciones Q4_K_M, Q8_0 y BF16, pensadas para su uso con llama.cpp. El modelo se integra en el servidor `llama-server` mediante el modo `--spec-type draft-dflash`, y su objetivo principal es reducir la latencia de generación en modelos grandes sin degradar la calidad. La relevancia actual radica en que la decodificación especulativa es una técnica clave para desplegar LLMs de gran tamaño en hardware limitado, y DFlash 2 ofrece una alternativa eficiente a los drafteres basados en transformers convencionales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Block-diffusion drafter (DFlash 2) con backbone de atención GQA, QK-Norm y MLP SwiGLU |
| Parámetros totales | 2.772.159.744 (≈2,77 mil millones) |
| Parámetros activos | 2.772.159.744 (modelo denso, no MoE) |
| Longitud de contexto | No disponible para el drafter; el modelo objetivo soporta 128K tokens |
| Tipos de cuantizacion | GGUF Q4_K_M (1,6 GB), Q8_0 (2,9 GB), BF16 (5,5 GB) |
| Idiomas soportados | No disponible (el modelo base probablemente multilingüe, no se especifica) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors disponible en el repositorio original) |

## Arquitectura y entrenamiento

DFlash 2 es un modelo de difusión por bloques diseñado específicamente para decodificación especulativa. En lugar de predecir token a token, genera un bloque completo de tokens en una sola pasada, mantiene las mejores candidaturas en cada posición y emplea un selector ligero que traza una ruta coherente a través de ellas. El backbone incorpora convoluciones dinámicas de dos taps que evitan que el borrador se degrade hacia el final del bloque. La arquitectura usa atención con Grouped-Query Attention (GQA), normalización QK (QK-Norm) y MLP con activación SwiGLU, según el análisis de arquitectura de HF Viewer.

El entrenamiento del drafter no está documentado en la información disponible, pero se sabe que está optimizado para imitar la distribución del modelo objetivo `Muse-Glimmer-30B`. La decodificación es matemáticamente sin pérdida: la salida greedy coincide con la del modelo objetivo y el muestreo conserva la distribución original, lo que garantiza que no se introducen sesgos adicionales durante la aceleración.

## Capacidades

- Aceleración de inferencia mediante decodificación especulativa: genera bloques de tokens en paralelo para que el modelo objetivo los verifique, reduciendo el número de pasos secuenciales.
- Soporte de cuantizaciones GGUF (Q4_K_M, Q8_0, BF16) para adaptarse a distintos presupuestos de memoria.
- Compatibilidad con `llama.cpp` a través del servidor `llama-server`, con parámetros específicos como `--spec-type draft-dflash` y `--spec-draft-n-max`.
- Integración con otros motores de inferencia (según el blog de Inco AI, se mencionan opciones para vLLM y TGI, aunque no se detalla en la model card).
- Decodificación sin pérdida: no altera la calidad del modelo objetivo en modo greedy ni en muestreo.
- Capacidades de razonamiento y tool calling heredadas del modelo base, pero el drafter no las implementa directamente; son responsabilidad del modelo objetivo.

## Casos de uso

- Despliegue de Muse-Glimmer-30B en hardware de consumo: al usar un drafter ligero de solo 2,77 mil millones de parámetros, se reduce el tiempo de generación en GPUs como RTX 4090 o incluso en CPUs con suficiente RAM.
- Servidores de inferencia de alta concurrencia: al acelerar el tiempo de primera token y el throughput, se pueden atender más peticiones por segundo en infraestructuras con GPUs A100 o H100.
- Sistemas agénticos con razonamiento multi-paso: el modelo base emite razonamiento con ámbito de canal y llamadas a herramientas en XML-style ATEM; el drafter acelera esas secuencias largas de generación sin perder coherencia.
- Aplicaciones de visión-lenguaje: el modelo base integra un encoder ViT-G/14; el drafter puede acelerar la generación de respuestas que combinan texto e imagen.
- Desarrollo de aplicaciones con contexto largo (hasta 128K tokens): la decodificación especulativa es especialmente útil en tareas de resumen, análisis de documentos o diálogos largos.
- Evaluación de modelos y experimentación: al reducir la latencia, se pueden ejecutar más pruebas de benchmark en el mismo tiempo, como se muestra en la evaluación de acceptance length con GSM8K.

## Benchmarks y rendimiento

Los datos de evaluación proporcionados en la model card se centran en la longitud de aceptación (acceptance length), que mide la media de tokens completados por paso de verificación en el drafter. Se utilizaron los primeros ocho ejemplos de test de GSM8K con el modelo objetivo en Q4_K_M, muestreo con temperatura 1.0, top-p 0.95 y top-k 64, y un máximo de 2048 tokens nuevos.

| Cuantización del drafter | Acceptance Length |
|---|---|
| BF16 | 5.45 |
| Q8_0 | 5.58 |
| Q4_K_M | 5.44 |

No se proporcionan benchmarks de rendimiento (MMLU, HumanEval, etc.) para el drafter, ya que no es un modelo de lenguaje autónomo. La evaluación completa del modelo base está disponible en su model card principal.

## Requisitos de hardware

- VRAM estimada para el drafter: 1,6 GB (Q4_K_M), 2,9 GB (Q8_0), 5,5 GB (BF16). Además, hay que cargar el modelo objetivo (Muse-Glimmer-30B) que requiere aproximadamente 15-20 GB en Q4_K_M.
- GPU recomendadas: para el modelo objetivo en Q4_K_M, se necesitan al menos 16-20 GB de VRAM, por lo que una RTX 4090 (24 GB) o una A100 (40 GB) son adecuadas. Para BF16 del drafter, una RTX 3090 (24 GB) también sería suficiente.
- En consumer GPU: sí, con cuantizaciones Q4_K_M y Q8_0 del drafter, y el modelo base en Q4_K_M, se puede ejecutar en una RTX 4090 o RTX 3090.
- Opciones de despliegue: llama.cpp (llama-server con soporte DFlash 2, PR #27342), posiblemente vLLM o TGI según la documentación.
- Latencia y throughput: no se proporcionan datos concretos; la acceptance length de ~5.5 tokens por paso indica que el drafter reduce el número de pasos de verificación en un factor de 5,5 en promedio.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de decodificación especulativa (p. ej., EAGLE, Medusa, Lookahead). Se puede comparar con la ejecución sin drafter:

| Aspecto | Con drafter DFlash 2 | Sin drafter |
|---|---|---|
| Pasos de verificación | ~1 por cada 5,5 tokens | 1 por token |
| Latencia | Menor (menos pasos secuenciales) | Mayor |
| Calidad | Idéntica (sin pérdida) | Idéntica |
| Recursos adicionales | +1,6-5,5 GB VRAM | 0 GB |

La comparación directa con otros drafter requiere datos de benchmarks específicos que no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- El modelo no es un LLM autónomo: requiere el modelo objetivo `Muse-Glimmer-30B` para funcionar; no puede generar texto por sí solo.
- La latencia final depende del modelo objetivo y del hardware; el drafter solo acelera el proceso, no garantiza un speedup concreto.
- La calidad de la decodificación especulativa depende de la alineación entre el drafter y el modelo objetivo; si se cambia el modelo base, el drafter debe reentrenarse o puede degradar el rendimiento.
- El modelo base puede tener sesgos y limitaciones propias (no documentadas en esta ficha); el drafter no los corrige.
- La licencia Apache 2.0 permite uso comercial, pero es necesario verificar la licencia del modelo base `Muse-Glimmer-30B` y de los pesos del drafter original.
- No se han publicado datos de sesgos o alucinaciones específicos del drafter; al no generar contenido, no presenta estos riesgos por sí mismo, pero los hereda del modelo objetivo.
- La documentación menciona que el drafter se integra con `llama.cpp` mediante un pull request específico; es posible que el soporte no esté disponible en versiones estables de la librería.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/z-lab/Muse-Glimmer-30B-DFlash2-GGUF
- Repositorio original (Inco AI): https://huggingface.co/incoai/Muse-Glimmer-30B-DFlash2-GGUF
- Blog DFlash 2: https://inco.ai/blog/dflash2/
- GitHub del proyecto DFlash: https://github.com/z-lab/dflash
- Pull request de llama.cpp: https://github.com/ggml-org/llama.cpp/pull/27342
- Modelo base (meta-models/Muse-Glimmer-30B): https://huggingface.co/meta-models/Muse-Glimmer-30B
- Modelo base GGUF: https://huggingface.co/meta-models/Muse-Glimmer-30B-GGUF
- Referencia de arquitectura (HF Viewer): https://hfviewer.com/z-lab/Muse-Glimmer-30B-DFlash2
- Ficha en LLM Explorer: https://llm-explorer.com/model/z-lab%2FMuse-Glimmer-30B-DFlash2,ymzdJR7kWpVEOeqaEMnsp
