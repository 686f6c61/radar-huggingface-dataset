# VillanovaAI/Villanova2-15B-A3B-Base

## Resumen

Villanova2-15B-A3B-Base es un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por VillanovaAI, presentado como modelo base preentrenado (no instruido). Con 15.496.409.024 parámetros totales y aproximadamente 3.000 millones de parámetros activos por token (según indica el sufijo A3B), emplea la arquitectura `qwen3_next` implementada en la librería transformers. Está orientado a generación de texto y sirve como punto de partida para ajuste fino posterior, no como modelo listo para uso conversacional directo.

El modelo se posiciona explícitamente como "european" y cubre cinco idiomas: inglés, italiano, alemán, español y francés. Su entrenamiento declara el uso de un conjunto amplio de datasets públicos de alta calidad (FineWeb-Edu, FineWeb-2, FinePDFs, FineMath, Stack-Edu, Nemotron-CC, DCLM, Dolmino Mix, entre otros), lo que sugiere un pipeline de preentrenamiento centrado en datos filtrados y educativos.

Es relevante ahora porque combina una arquitectura MoE eficiente en cómputo (activa una fracción pequeña de sus 15B parámetros) con licencia Apache 2.0 y cobertura multilingüe europea, un nicho donde las alternativas abiertas de este tamaño son escasas. El acceso está restringido (gated) y requiere aceptar condiciones en Hugging Face.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE), tipo `qwen3_next` (transformers) |
| Parametros totales | 15.496.409.024 |
| Parametros activos | ~3B (indicado por el sufijo A3B; cifra exacta no disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo solo con safetensors; sin GGUF publicado) |
| Idiomas soportados | en, it, de, es, fr |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura Mixture of Experts basada en la familia `qwen3_next`, lo que implica un transformer con capas MoE donde solo una fracción de los expertos se activa por token (aproximadamente 3B de los 15,5B totales). Esta configuración reduce el coste computacional por token en inferencia manteniendo una capacidad de parámetros totales elevada. No se dispone de información detallada sobre el número de expertos, la estrategia de enrutamiento ni el uso de atención lineal o híbrida más allá de la referencia a `qwen3_next`.

El preentrenamiento se apoya en una mezcla de datasets públicos de filtrado educativo y alta calidad: HuggingFaceFW/fineweb-edu, fineweb-2, finepdfs, finepdfs-edu, finewiki; HuggingFaceTB/finemath y stack-edu; nvidia/Nemotron-CC-Math-v1 y Nemotron-CC-v2; mlfoundations/dclm-baseline-1.0; epfml/FineWeb2-HQ; common-pile/comma_v0.1_training_dataset; y allenai/dolmino-mix-1124. No se especifican el número total de tokens de entrenamiento, la composición porcentual por idioma ni si hubo fases de RLHF o DPO; al tratarse de un modelo base, es esperable que no incluya alineamiento por preferencias, pero este dato no está confirmado en la información disponible.

## Capacidades

- Generación de texto autoregresiva en inglés, italiano, alemán, español y francés.
- Modelo base preentrenado: no incluye instrucciones ni formato conversacional; requiere ajuste fino (SFT, DPO) para tareas de instrucción.
- Razonamiento y conocimiento general derivados del preentrenamiento sobre datos educativos y enciclopédicos (FineWeb-Edu, FineWiki, FineMath).
- Capacidad potencial en matemáticas y código por la inclusión de FineMath, Nemotron-CC-Math-v1 y Stack-Edu en el corpus, aunque no se publican métricas que lo confirmen.
- Soporte de tool calling / function calling: no disponible de forma nativa en un modelo base.
- Soporte de agentes y razonamiento multi-paso: no disponible sin ajuste posterior.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Punto de partida para ajuste fino supervisado (SFT) en tareas específicas de dominio: al ser un modelo base con licencia Apache 2.0, un equipo puede adaptarlo a clasificación, extracción o generación especializada sin restricciones de uso comercial.
- Investigación en arquitecturas MoE: su relación 15,5B totales / ~3B activos permite estudiar eficiencia de enrutamiento y comparar coste-calidad frente a modelos densos de tamaño similar.
- Desarrollo de asistentes multilingües europeos: la cobertura de es, fr, de e it lo hace adecuado como base para productos dirigidos al mercado europeo tras el correspondiente ajuste instruccional.
- Generación aumentada por recuperación (RAG) tras ajuste: puede emplearse como generador en pipelines RAG una vez afinado para seguir instrucciones y citar contexto.
- Experimentación académica en preentrenamiento y evaluación multilingüe: útil para reproducir y comparar recetas de datos sobre corpus públicos documentados (FineWeb, DCLM, Dolmino).
- Base para modelos de código o matemáticas: la presencia de Stack-Edu y Nemotron-CC-Math-v1 en el corpus sugiere utilidad como inicialización para ajuste fino en dominios técnicos, previa validación empírica.
- Destilación y generación de datos sintéticos: un modelo base de este tamaño puede emplearse para producir corpus sintéticos que alimenten modelos menores, sujeto a evaluación de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 31 GB solo para pesos (15,5B parámetros × 2 bytes), más memoria para KV cache y activaciones; se recomienda al menos 40-48 GB.
- VRAM estimada en cuantización de 8 bits: en torno a 16 GB para pesos; en 4 bits, en torno a 8-9 GB, aunque no se han publicado pesos cuantizados oficiales.
- GPU recomendadas para FP16: A100 40/80 GB, H100, L40S; para cuantización 4/8 bits, RTX 4090 (24 GB) o RTX 3090 (24 GB) podrían ser suficientes, pendiente de validación práctica.
- Cabe en GPU de consumo: probablemente en RTX 4090/3090 con cuantización de 8 o 4 bits, no así en FP16.
- Opciones de despliegue: transformers (soporte nativo de `qwen3_next`), y previsiblemente vLLM o TGI si incorporan la arquitectura; llama.cpp/Ollama requerirían conversión a GGUF no publicada.
- Latencia y throughput estimados: no disponibles. La activación de ~3B parámetros por token debería reducir el coste de cómputo frente a un denso de 15B, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Villanova2-15B-A3B-Base | 15,5B | ~3B | no disponible | Apache 2.0 | Gated en HF |
| Qwen3-30B-A3B (referencia de familia) | ~30B | ~3B | no disponible en esta ficha | Apache 2.0 | Público |
| Modelos densos de ~14B (p. ej. Qwen2.5-14B) | ~14B | 14B | no disponible en esta ficha | variable | Público |

No se dispone de datos de rendimiento comparativo para Villanova2-15B-A3B-Base, por lo que la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo base sin alineamiento: puede generar contenido sesgado, tóxico o factualmente incorrecto; no debe desplegarse directamente en producción orientada a usuario final sin ajuste y filtros.
- Riesgo de alucinación inherente al preentrenamiento; sin evaluación publicada no es posible cuantificarlo.
- Longitud de contexto no documentada: limita la planificación de casos de uso con contextos largos.
- Cobertura lingüística restringida a en, it, de, es, fr; el rendimiento en otras lenguas (incluido el español de variedades no europeas) no está evaluado.
- Ausencia de benchmarks publicados: no hay evidencia empírica de calidad frente a alternativas.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que puede complicar la automatización de descargas en CI/CD.
- Licencia Apache 2.0 permite uso comercial, pero al ser un modelo base la responsabilidad sobre el ajuste y la evaluación recae en el integrador.
- Sin pesos cuantizados oficiales ni soporte confirmado en motores de inferencia de alto rendimiento distintos de transformers.

## Enlaces

- Hugging Face: https://huggingface.co/VillanovaAI/Villanova2-15B-A3B-Base
- Datasets referenciados: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu, https://huggingface.co/datasets/HuggingFaceFW/fineweb-2, https://huggingface.co/datasets/HuggingFaceFW/finepdfs, https://huggingface.co/datasets/HuggingFaceFW/finepdfs-edu, https://huggingface.co/datasets/HuggingFaceFW/finewiki, https://huggingface.co/datasets/HuggingFaceTB/finemath, https://huggingface.co/datasets/HuggingFaceTB/stack-edu, https://huggingface.co/datasets/nvidia/Nemotron-CC-Math-v1, https://huggingface.co/datasets/nvidia/Nemotron-CC-v2, https://huggingface.co/datasets/mlfoundations/dclm-baseline-1.0, https://huggingface.co/datasets/epfml/FineWeb2-HQ, https://huggingface.co/datasets/common-pile/comma_v0.1_training_dataset, https://huggingface.co/datasets/allenai/dolmino-mix-1124
