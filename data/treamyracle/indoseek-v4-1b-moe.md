# treamyracle/indoseek-v4-1b-moe

## Resumen

IndoSeek-V4 (1B MoE) es una implementación en PyTorch a escala reducida de la arquitectura DeepSeek-V4, publicada por el usuario treamyracle en Hugging Face. El modelo reproduce a pequeña escala el diseño del transformer con mezcla de expertos (MoE) de DeepSeek, con aproximadamente 1.040 millones de parámetros totales de los cuales unos 210 millones se activan por token. La model card lo describe explícitamente como una "scaled PyTorch implementation", es decir, una reimplementación de referencia orientada a estudiar y validar la arquitectura más que un modelo entrenado para producción.

La relevancia de esta ficha es acotada: el repositorio no incluye pesos entrenados publicados, ni resultados de benchmarks, ni información sobre el dataset de entrenamiento, idiomas o licencia. Su interés es fundamentalmente técnico y educativo, ya que permite examinar los componentes arquitectónicos de DeepSeek-V4 (expertos enrutados más un experto compartido, atención híbrida y multi-token prediction) en un tamaño manejable para experimentación en una sola GPU.

Se debe tratar, por tanto, como material de referencia arquitectónica y no como un modelo listo para desplegar en aplicaciones reales. Cualquier evaluación de capacidades, calidad de generación o rendimiento queda pendiente de que el autor publique pesos, datos de entrenamiento y métricas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (implementación a escala de DeepSeek-V4): 24 capas, d=1024, 32 expertos enrutados + 1 compartido con SwiGLU, mHC, atención híbrida CSA+HCA+SWA, MTP de profundidad 1 |
| Parametros totales | ~1,04 mil millones (1.04B) |
| Parametros activos | ~210 millones por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (la model card solo indica implementación en PyTorch; no se especifican safetensors ni GGUF) |

## Arquitectura y entrenamiento

La arquitectura sigue el diseño de DeepSeek-V4 a escala reducida: 24 capas con dimensión oculta de 1024, una capa de mezcla de expertos con 32 expertos enrutados más un experto compartido, todos con activación SwiGLU. Incorpora mHC (multi-head compression, según la nomenclatura de la model card), un esquema de atención híbrido que combina CSA (compressed sparse attention), HCA (hybrid compressed attention) y SWA (sliding window attention), además de multi-token prediction (MTP) de profundidad 1. El entrenamiento emplea un optimizador híbrido Muon+AdamW.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, si hubo fases de RLHF o DPO, ni sobre el estado real del entrenamiento. La model card únicamente describe la implementación, por lo que no es posible confirmar que el modelo haya sido entrenado más allá de una inicialización o de pasos preliminares.

## Capacidades

- No hay evidencia publicada de capacidades de generación de texto, razonamiento, código o matemáticas.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingües.
- No se documenta modo de razonamiento (thinking), visión ni audio.
- La única capacidad verificable es la reproducción estructural de la arquitectura DeepSeek-V4 en PyTorch.

## Casos de uso

- Estudio de arquitecturas MoE: el modelo sirve para inspeccionar cómo se distribuyen 32 expertos enrutados más uno compartido con solo 210M de parámetros activos, útil en cursos y laboratorios de sistemas de IA.
- Prototipado de atención híbrida: permite experimentar con la combinación CSA+HCA+SWA en un tamaño que cabe en una GPU de consumo, para medir el coste de memoria y el comportamiento del enrutado.
- Investigación sobre multi-token prediction: la MTP de profundidad 1 se puede aislar y comparar con decodificación autoregresiva clásica en entornos controlados.
- Validación de optimizadores híbridos: el uso de Muon+AdamW permite reproducir experimentos de entrenamiento y comparar curvas de pérdida frente a AdamW puro.
- Base para fine-tuning experimental: al ser una implementación PyTorch de ~1B parámetros, puede servir como banco de pruebas para técnicas de ajuste eficiente (LoRA, QLoRA) antes de escalar a modelos mayores.
- Docencia y divulgación: útil para explicar de forma tangible qué es un MoE, qué significa "parámetros activos" y cómo afecta el enrutado al coste computacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 2 GB solo para pesos (1,04B × 2 bytes), más overhead de activaciones y caché KV; el consumo real dependerá de la longitud de contexto, que no está documentada.
- VRAM estimada en int8: alrededor de 1 GB para pesos; en int4, en torno a 0,5-0,6 GB, aunque no se confirma que existan pesos cuantizados publicados.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM debería poder alojar los pesos en fp16; una RTX 3060, RTX 4060 o superior sería suficiente a nivel de memoria.
- Cabe en GPU de consumo: sí, en principio, dado el tamaño reducido, siempre que el autor publique pesos utilizables.
- Opciones de despliegue: no disponible; al ser una implementación PyTorch sin formato de pesos declarado, no se puede confirmar compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Disponibilidad de pesos |
|---|---|---|---|---|---|
| IndoSeek-V4 1B MoE | ~1,04B | ~210M | no disponible | no disponible | no confirmada |
| DeepSeek-V2-Lite | 15,7B | 2,4B | 32K (según documentación pública) | licencia propia de DeepSeek | pública |
| Qwen1.5-MoE-A2.7B | 14,3B | 2,7B | 32K (según documentación pública) | Apache 2.0 (según documentación pública) | pública |
| OLMoE-1B-7B | 6,9B | 1,3B | 4K (según documentación pública) | Apache 2.0 (según documentación pública) | pública |

La comparación es orientativa: IndoSeek-V4 es una reimplementación a escala muy inferior y sin pesos ni benchmarks publicados, por lo que no es directamente equiparable en calidad a los modelos citados, que sí cuentan con entrenamiento completo y evaluación pública.

## Limitaciones y advertencias

- Ausencia de pesos entrenados verificables: la model card describe la implementación, no un modelo entrenado; no se puede asumir calidad de generación.
- Sin benchmarks ni evaluación: no hay métricas de MMLU, HumanEval, GSM8K ni de ningún otro conjunto.
- Licencia no especificada: no se puede determinar si el uso comercial está permitido; en ausencia de licencia, se debe asumir que no hay permiso explícito.
- Idiomas no documentados: no se puede garantizar soporte de castellano ni de ninguna otra lengua.
- Contexto no documentado: se desconoce la ventana máxima y, por tanto, su idoneidad para tareas de contexto largo.
- Riesgo de alucinación: no evaluable sin pesos ni pruebas; en cualquier caso, un modelo de 210M de parámetros activos tendría una capacidad limitada frente a modelos de mayor escala.
- Sesgos: no documentados; sin dataset conocido no se pueden analizar sesgos de entrenamiento.
- Madurez del repositorio: cero descargas y cero likes en el momento de la consulta, lo que sugiere un proyecto incipiente o experimental.
- Compatibilidad de despliegue incierta: al no publicarse formato de pesos, no se puede integrar directamente en pipelines estándar como vLLM u Ollama.

## Enlaces

- Hugging Face: https://huggingface.co/treamyracle/indoseek-v4-1b-moe
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la información disponible.
