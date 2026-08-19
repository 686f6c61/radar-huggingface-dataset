# yar-sh/Muse-Glimmer-30B-Abliterated-Aggressive-NVFP4

## Resumen

Muse-Glimmer-30B-Abliterated-Aggressive-NVFP4 es una cuantización NVFP4 (W4A4) del modelo decensurado `jorkle/Muse-Glimmer-30B-Abliterated-Aggressive`, que a su vez deriva del modelo multimodal `meta-models/Muse-Glimmer-30B` de Meta. El autor de esta cuantización, yar-sh, la creó para cubrir un hueco: no existía una versión NVFP4 "ligera" del modelo decensurado que preservara la visión y cupiera en una GPU de 24-32 GB (como una Blackwell o una DGX-Spark GB10). El resultado es un modelo multimodal de ~22 GB en disco que puede servirse con vLLM manteniendo intacta la torre de visión y el `lm_head` en BF16.

El modelo conserva la arquitectura transformer multimodal del original (con perception encoder), soporta una ventana de contexto de 131072 tokens y está pensado para casos de uso que requieren generación de contenido sin restricciones de seguridad (roleplay, ficción interactiva, etc.) junto con capacidades de razonamiento, tool calling y visión. Según las mediciones del autor en una GB10, alcanza 12.5 tok/s de decodificación en single-stream y obtiene un HumanEval pass@1 de 0.872.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con perception encoder y decoder autoregresivo |
| Parametros totales | 18.767.497.024 (según safetensors; el nombre comercial indica 30B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 131072 tokens |
| Tipos de cuantizacion | NVFP4 (W4A4) grupo 16 en capas lineales del decoder; vision tower y lm_head en BF16 |
| Idiomas soportados | en, ja, de, ru |
| Licencia | muse-glimmer (otra) |
| Formato de pesos | safetensors con compressed-tensors (NVFP4) |

## Arquitectura y entrenamiento

El modelo es una cuantización de tercera generación: primero Meta entrenó Muse-Glimmer-30B (arquitectura transformer multimodal con perception encoder y decoder autoregresivo, contexto de 131072 tokens). Luego jorkle aplicó un decensurado agresivo mediante KL-LoRA-SFT (conservando la divergencia KL) sobre ese base, dando lugar a `jorkle/Muse-Glimmer-30B-Abliterated-Aggressive`. Finalmente, yar-sh cuantizó ese modelo a NVFP4 usando Intel AutoRound con esquema `NVFP4`, dataset `NeelNanda/pile-10k`, 128 muestras, secuencia de 2048 tokens y 200 iteraciones. La opción `quant_nontext_module=False` mantiene la torre de visión y el `lm_head` en BF16, de modo que solo las capas lineales del decoder (las que dominan el tamaño y el ancho de banda por token) se cuantizan a FP4. No se incluye ningún drafter especulativo; el autor señala que emparejar un drafter DFlash/EAGLE podría duplicar la velocidad de decodificación.

## Capacidades

- Generación de texto multimodal: procesa imágenes y texto, describiendo con precisión imágenes reales (verificado por el autor).
- Razonamiento y modo de pensamiento: soporta un parser de razonamiento (`muse_glimmer`) que separa `reasoning_content` de `content`; se puede ajustar la fuerza de razonamiento (p. ej. "Reasoning strength: low" para contenido directo).
- Tool calling / function calling: compatible con `--enable-auto-tool-choice` y `--tool-call-parser muse_glimmer` en vLLM, con una puntuación de 0.656 en una prueba de 32 casos.
- Capacidades de agente: el parser de razonamiento y el tool calling permiten flujos multi-paso.
- Multilingüe: soporta inglés, japonés, alemán y ruso.
- Decensurado agresivo: generación de contenido sin restricciones de seguridad (uncensored/decensored), orientado a roleplay y usos permisivos.
- Codigo y matematicas: HumanEval pass@1 de 0.872 (con razonamiento bajo) indica sólida capacidad de generación de código.

## Casos de uso

- Roleplay y ficción interactiva sin censura: el decensor agresivo permite escenarios narrativos explícitos o controvertidos que los modelos alineados bloquean; la ventana de 131072 tokens mantiene el contexto de la historia durante sesiones largas.
- Asistente multimodal para descripción de imágenes: la torre de visión en BF16 conserva la capacidad de describir con precisión imágenes reales, útil en aplicaciones de accesibilidad o análisis visual.
- Generación de código en producción: con HumanEval pass@1 de 0.872 y soporte de tool calling, puede integrarse en pipelines de CI/CD para generar o completar código, aunque su naturaleza decensurada exige supervisión.
- Agente autónomo con razonamiento multi-paso: el parser de razonamiento y el tool calling permiten construir agentes que planifican, llaman funciones y ejecutan tareas complejas (p. ej. automatización de tareas de oficina).
- Traducción y generación multilingüe: cubre en, ja, de y ru, útil para asistentes multilingües o localización de contenido.
- Investigación en alineación y seguridad de modelos: al ser una variante decensurada con métricas documentadas (IFEval 0.684 vs 0.90 en abliteración manual), sirve para estudiar el impacto del decensurado en el seguimiento de instrucciones y la calidad de generación.

## Benchmarks y rendimiento

El autor publicó mediciones realizadas en una GB10 (DGX-Spark, 224 GB/s, single-stream). No se proporcionan benchmarks comparativos con otros modelos en la información disponible.

| Metrica | Valor |
|---|---|
| Decode (c=1) | 12.5 tok/s |
| Decode (c=4) | 46 tok/s |
| Decode (c=8) | 87 tok/s |
| HumanEval (pass@1, reasoning-low) | 0.872 |
| IFEval (prompt-level strict) | 0.684 |
| Tools (32-case) | 0.656 |
| Vision (descripción de imágenes reales) | Correcta |

## Requisitos de hardware

- VRAM estimada: ~22-24 GB para inferencia con vLLM (el repo ocupa 23.4 GB en disco; la model card indica ~22 GB). Cabe en GPUs de 24 GB como RTX 4090 o RTX 3090.
- GPU recomendadas: Blackwell (B200, GB10), DGX-Spark, A100 40GB, RTX 4090 24GB, RTX 3090 24GB.
- Opciones de despliegue: vLLM (recomendado, con build específica `vllm/vllm-openai:muse-glimmer`); también es compatible con transformers (librería indicada), aunque la cuantización compressed-tensors está optimizada para vLLM.
- Latencia y throughput: 12.5 tok/s de decodificación en single-stream en GB10 (224 GB/s), 46 tok/s con 4 peticiones concurrentes y 87 tok/s con 8. El rendimiento está limitado por ancho de banda (modelo denso de ~30B parámetros). Sin drafter especulativo, emparejar uno podría duplicar la velocidad.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con otros modelos en la información proporcionada. Como referencia cualitativa:

| Modelo | Contexto | Cuantizacion | Vision | Decensurado | Licencia |
|---|---|---|---|---|---|
| Este modelo (NVFP4) | 131072 | NVFP4 (W4A4) | Si | Agresivo | muse-glimmer |
| jorkle/Muse-Glimmer-30B-Abliterated-Aggressive (base) | 131072 | BF16 (original) | Si | Agresivo | muse-glimmer |
| meta-models/Muse-Glimmer-30B (original) | 131072 | BF16 (original) | Si | No (censurado) | muse-glimmer |

## Limitaciones y advertencias

- El decensurado agresivo (KL-LoRA-SFT) reduce el seguimiento de instrucciones: IFEval 0.684 frente a ~0.90 en una abliteración manual por edición de pesos del mismo base. No es adecuado para tareas críticas de seguimiento de instrucciones.
- No incluye drafter especulativo; la velocidad de decodificación está limitada por el ancho de banda de memoria (12.5 tok/s en GB10).
- Riesgo de alucinación inherente a modelos generativos; el decensurado puede aumentar la probabilidad de contenido falso o dañino.
- Licencia `muse-glimmer` (otra): restricciones no especificadas en la información disponible; hereda la licencia del modelo base de Meta. Verificar términos de uso comercial antes de desplegar en producción.
- Solo cubre cuatro idiomas (en, ja, de, ru); no es multilingüe de amplio espectro.
- La cuantización NVFP4 puede introducir pérdida de precisión en tareas que requieran alta fidelidad numérica, aunque el autor reporta métricas sólidas en HumanEval.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/yar-sh/Muse-Glimmer-30B-Abliterated-Aggressive-NVFP4
- Modelo base decensurado: https://huggingface.co/jorkle/Muse-Glimmer-30B-Abliterated-Aggressive
- Modelo base original de Meta: https://huggingface.co/meta-models/Muse-Glimmer-30B
