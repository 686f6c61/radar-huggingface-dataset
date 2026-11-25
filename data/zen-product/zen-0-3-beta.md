# ZEN-PRODUCT/zen-0.3-beta

## Resumen

Zen 0.3 Beta es un ajuste fino (fine-tune) del modelo Qwen2.5-Coder-7B-Instruct, desarrollado por ZEN-PRODUCT y publicado como compilación beta previa a su lanzamiento estable. El modelo parte de la base de 7.615.616.512 parámetros de Qwen2.5-Coder-7B-Instruct, una arquitectura transformer densa de tipo Qwen2, y se ha entrenado con QLoRA para reforzar capacidades de código, matemáticas y razonamiento sin degradar las competencias originales del modelo base.

El problema que aborda es el habitual en los ajustes finos especializados: mejorar el rendimiento en tareas de programación y razonamiento matemático preservando al mismo tiempo la comprensión de código y las habilidades generales del modelo original. Para ello el autor declara el uso de hiperparámetros "anti-olvido" (learning rate bajo y mezcla de repetición de datos), una técnica que busca mitigar el olvido catastrófico durante el ajuste fino.

Su relevancia actual es limitada pero informativa: se trata de un modelo de 7B con licencia de investigación heredada de Qwen, publicado en noviembre de 2026, con muy poca tracción en Hugging Face (15 descargas, 0 likes) y en estado beta. Resulta útil como referencia de ajustes finos de bajo coste sobre Qwen2.5-Coder y como ejemplo de pipeline QLoRA reproducible en hardware de consumo (Kaggle 2×T4), pero no debe considerarse un modelo listo para producción sin una evaluación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen2), ajuste fino QLoRA sobre Qwen2.5-Coder-7B-Instruct |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base, no confirmada) |
| Tipos de cuantizacion | GGUF Q4_K_M, Q5_K_M, Q8_0 (repo GGUF separado); entrenamiento en 4-bit NF4 |
| Idiomas soportados | en, ru |
| Licencia | qwen-research (heredada de Qwen/Qwen2.5-Coder-7B-Instruct) |
| Formato de pesos | safetensors (repo principal), GGUF (repo ZEN-PRODUCT/zen-0.3-beta-GGUF) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de la familia Qwen2, inicializado desde Qwen2.5-Coder-7B-Instruct. El ajuste fino se realizó con QLoRA en precisión 4-bit NF4, con rango r=32, alpha=32, learning rate 4e-05, weight decay 0.01, longitud de secuencia 2048 y empaquetado (packing) de secuencias. El entrenamiento totalizó 152 pasos de optimizador con aproximadamente 65.000 tokens por paso, lo que supone unas 7,6 horas de cómputo en una instancia de Kaggle con 2×T4. El conjunto de datos declarado ronda los 54 millones de tokens.

La mezcla de datos combina instrucciones generales y de razonamiento (allenai/tulu-3-sft-mixture, HuggingFaceTB/smoltalk), instrucciones de código (ise-uiuc/Magicoder-Evol-Instruct-110K, ise-uiuc/Magicoder-OSS-Instruct-75K, m-a-p/CodeFeedback-Filtered-Instruction) y matemáticas con cadena de pensamiento (AI-MO/NuminaMath-CoT, meta-math/MetaMathQA). La innovación declarada es el uso de hiperparámetros anti-olvido (learning rate reducido y mezcla de repetición de datos) para preservar las capacidades del modelo base durante el ajuste. No se documentan técnicas de decodificación especulativa, atención lineal ni otras innovaciones arquitectónicas adicionales.

## Capacidades

- Generación de texto conversacional en inglés y ruso.
- Generación y comprensión de código, reforzada mediante los datasets Magicoder y CodeFeedback.
- Razonamiento matemático con cadenas de pensamiento, apoyado en NuminaMath-CoT y MetaMathQA.
- Razonamiento multi-paso orientado a problemas de programación y matemáticas.
- Ajuste fino de instrucciones (instruction following) a partir de mezclas SFT como Tulu-3 y SmolTalk.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente autónomo: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponibles (modelo exclusivamente de texto).
- Modo "thinking" explícito: no disponible en la información proporcionada.

## Casos de uso

- Asistencia a la programación en editor o IDE: el modelo, derivado de Qwen2.5-Coder-7B-Instruct y reforzado con Magicoder y CodeFeedback, puede emplearse para autocompletar, explicar y refactorizar código en flujos de desarrollo interactivos.
- Generación de código en pipelines de integración: al ser un modelo de 7B cuantizable a Q4_K_M, puede desplegarse en infraestructura modesta para generar tests, documentación o parches en procesos de CI/CD, siempre con revisión humana dado su estado beta.
- Resolución de problemas matemáticos paso a paso: el entrenamiento con NuminaMath-CoT y MetaMathQA lo hace adecuado para tutores automáticos o herramientas de verificación de ejercicios que requieran razonamiento explícito.
- Prototipado de asistentes conversacionales en inglés y ruso: su soporte bilingüe declarado permite construir chatbots de soporte técnico o educativo en esos dos idiomas.
- Evaluación comparativa de ajustes finos: sirve como caso de estudio reproducible de QLoRA con hiperparámetros anti-olvido sobre Qwen2.5-Coder, útil para investigadores que quieran replicar el pipeline en 2×T4.
- Experimentación local con Ollama o llama.cpp: los GGUF Q4_K_M, Q5_K_M y Q8_0 permiten ejecutar el modelo en estaciones de trabajo con GPU de consumo para pruebas de concepto y benchmarks internos.
- Generación de documentación técnica y comentarios de código: la combinación de instrucciones generales (Tulu-3, SmolTalk) y de código permite redactar explicaciones y docstrings a partir de fragmentos de código.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16/BF16, aproximadamente 15,2 GB (tamaño del repo safetensors); en GGUF Q8_0, en torno a 8-9 GB; en Q5_K_M, alrededor de 5,5-6 GB; en Q4_K_M, aproximadamente 4,5-5 GB.
- GPU recomendadas: A100 40/80 GB o H100 para FP16 con contexto largo y despliegue de alta concurrencia; RTX 4090 (24 GB) para FP16 o Q8_0; RTX 3090/4080 (16-24 GB) para Q8_0.
- Cabe en GPU de consumo: sí, en Q4_K_M y Q5_K_M en tarjetas de 8 GB o más (RTX 3060 Ti, RTX 4060 Ti, RTX 3070); Q8_0 requiere 12 GB o más.
- Opciones de despliegue: llama.cpp y Ollama (soportados explícitamente por el autor vía GGUF); vLLM y TGI para safetensors en FP16 (no confirmados por el autor); transformers para uso directo.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Zen 0.3 Beta | 7,6B | no disponible | qwen-research | Hugging Face (beta, 15 descargas) | Ajuste QLoRA sobre Qwen2.5-Coder-7B-Instruct |
| Qwen2.5-Coder-7B-Instruct | 7,6B | no disponible en esta ficha | qwen-research | Hugging Face (modelo base oficial) | Base del ajuste; sin refuerzo específico anti-olvido |
| Qwen2.5-Coder-7B (base) | 7,6B | no disponible en esta ficha | qwen-research | Hugging Face | Variante preentrenada sin instrucciones |
| Alternativas de 7B para código (p. ej. CodeLlama-7B-Instruct) | ~6,7B | no disponible en esta ficha | licencia propia de Meta | Hugging Face | No comparable directamente por falta de datos de benchmarks del modelo evaluado |

La comparación cuantitativa de rendimiento no es posible porque el autor no publica resultados de benchmarks. La única comparación fiable es estructural: Zen 0.3 Beta hereda arquitectura, tokenizador y licencia de Qwen2.5-Coder-7B-Instruct, por lo que su rendimiento no debería alejarse mucho del base salvo en las áreas reforzadas (código y matemáticas), extremo que no está verificado con datos públicos.

## Limitaciones y advertencias

- Estado beta (pre-release): el autor lo declara explícitamente; no hay garantías de estabilidad ni de calidad en producción.
- Ausencia total de benchmarks publicados: no es posible verificar las mejoras declaradas en código y matemáticas frente al modelo base.
- Licencia qwen-research: restringe el uso comercial; es imprescindible revisar los términos del modelo base antes de cualquier despliegue productivo.
- Idiomas limitados a inglés y ruso: no se declara soporte de castellano, por lo que su uso en español no está garantizado.
- Riesgo de olvido catastrófico: aunque el autor aplica hiperparámetros anti-olvido, un ajuste de solo 152 pasos sobre 54M de tokens puede degradar capacidades del base no cubiertas por la mezcla.
- Riesgo de alucinación: inherente a los modelos de 7B ajustados con SFT; no se documentan evaluaciones de fidelidad ni de seguridad.
- Sesgos: no se documenta ningún análisis de sesgos; los datasets de código y matemáticas pueden arrastrar sesgos de sus fuentes.
- Tracción mínima (15 descargas, 0 likes): no hay comunidad que haya validado el modelo, lo que reduce la confianza en su comportamiento real.
- Longitud de contexto no confirmada: aunque el base soporta contextos amplios, el ajuste se entrenó con secuencias de 2048 tokens, lo que puede limitar el rendimiento en contextos largos.
- Sin información sobre tool calling ni capacidades de agente: no debe asumirse su funcionamiento en flujos agénticos sin pruebas previas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ZEN-PRODUCT/zen-0.3-beta
- Repositorio GGUF: https://huggingface.co/ZEN-PRODUCT/zen-0.3-beta-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct/blob/main/LICENSE
- Dataset allenai/tulu-3-sft-mixture: https://huggingface.co/datasets/allenai/tulu-3-sft-mixture
- Dataset HuggingFaceTB/smoltalk: https://huggingface.co/datasets/HuggingFaceTB/smoltalk
- Dataset ise-uiuc/Magicoder-Evol-Instruct-110K: https://huggingface.co/datasets/ise-uiuc/Magicoder-Evol-Instruct-110K
- Dataset ise-uiuc/Magicoder-OSS-Instruct-75K: https://huggingface.co/datasets/ise-uiuc/Magicoder-OSS-Instruct-75K
- Dataset m-a-p/CodeFeedback-Filtered-Instruction: https://huggingface.co/datasets/m-a-p/CodeFeedback-Filtered-Instruction
- Dataset AI-MO/NuminaMath-CoT: https://huggingface.co/datasets/AI-MO/NuminaMath-CoT
- Dataset meta-math/MetaMathQA: https://huggingface.co/datasets/meta-math/MetaMathQA
