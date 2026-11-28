# xtools-at/Wukong-9B-Qwen3.5-Claude-Opus-DeepSeek-SLERP-2xMerge-heretic

## Resumen

Wukong 9B es un modelo de lenguaje creado por xtools-at mediante fusión de pesos en el espacio de parámetros (weight-space merging) con el método SLERP. No se trata de un fine-tune adicional, sino de la interpolación esférica de dos variantes ya existentes de Qwen3.5-9B: una orientada a código y agentes (Qwopus3.5-9B-Coder-UNCENSORED-heretic) y otra orientada a razonamiento matemático y científico (DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic). El objetivo declarado es reunir en un modelo compacto de ~9.650 millones de parámetros las capacidades de resolución estructurada de problemas, matemáticas y STEM, junto con generación de código, depuración, tool calling y flujos agénticos.

El modelo se apoya en la arquitectura Qwen3.5 (pipeline `image-text-to-text`, lo que sugiere soporte multimodal de entrada imagen-texto, aunque la model card no detalla el módulo de visión) y conserva la ventana de contexto del modelo base, dato que no se explicita en la información disponible. Ambos progenitores son variantes "heretic" decensuradas, y el autor confirma que el checkpoint fusionado mantiene el comportamiento abliterated, es decir, con menos rechazos ante peticiones que otros modelos alinearían de forma más restrictiva.

Su relevancia práctica reside en la combinación de tamaño contenido (apto para despliegue local en hardware de consumo con cuantización), licencia Apache 2.0 y un perfil de capacidades híbrido razonamiento-código-agentes. La evaluación preliminar publicada es limitada y se realizó sobre la variante de 4B, no sobre este 9B, por lo que las cifras de rendimiento de este checkpoint concreto no están disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Qwen3.5 (pipeline image-text-to-text), fusión de pesos por SLERP |
| Parametros totales | 9.653.104.368 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors sin cuantizaciones publicadas) |
| Idiomas soportados | en, zh, es, ru, ja |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es el resultado de una interpolación esférica (SLERP) con parámetro `t = 0.4` entre dos checkpoints derivados de Qwen/Qwen3.5-9B. Con ese valor, el primer progenitor (Qwopus3.5-9B-Coder-UNCENSORED-heretic) recibe el peso mayor, de modo que la fusión hereda una base más orientada a código y agentes, incorporando del segundo (DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic) las capacidades de razonamiento. No hay entrenamiento adicional ni ajuste posterior a la fusión.

Los datos de entrenamiento corresponden a los de los progenitores. El modelo DeepSeek-V4-Pro se destiló a partir de aproximadamente 250.000 muestras de matemáticas y STEM, con énfasis en derivaciones estructuradas y descomposición de problemas. El modelo Qwopus se entrenó con trazas de razonamiento de Claude reconstruidas mediante la técnica Trace Inversion (datasets Claude Opus 4.6 TraceInversion 9000x y Claude Opus 4.7 TraceInversion 5000x, derivados de `Roman1111111/claude-opus-4.6-10000x` y `lordx64/reasoning-distill-claude-opus-4-7-max`), además de trayectorias agénticas multi-turno del dataset `lambda/hermes-agent-reasoning-traces`, originadas en Kimi-K2.5 y GLM-5.1-FP8 y centradas en tool calling, operaciones de terminal, trabajo sobre repositorios y automatización de navegador. El autor aclara que las trazas son datos sintéticos reconstruidos, no acceso directo a razonamientos internos privados.

## Capacidades

- Generación de texto conversacional en inglés, chino, español, ruso y japonés.
- Razonamiento multi-paso y resolución estructurada de problemas.
- Matemáticas y conocimiento STEM/científico, con derivaciones y descomposición de problemas.
- Generación de código, depuración, localización de bugs y aplicación de parches.
- Tool calling y function calling, con enrutamiento de herramientas.
- Flujos agénticos multi-turno: operaciones de terminal, trabajo sobre repositorios y automatización de navegador (heredados de los datos de entrenamiento del progenitor Qwopus).
- Entrada multimodal imagen-texto según el pipeline declarado (`image-text-to-text`); el alcance real del módulo de visión no se detalla en la información disponible.
- Comportamiento decensurado/abliterated confirmado en el checkpoint fusionado, con menos rechazos que modelos alineados de forma convencional.

## Casos de uso

- Asistente de programación local: el modelo puede generar y revisar código, localizar bugs y proponer parches en un IDE o CLI, aprovechando su base orientada a código y su tamaño contenido para ejecutarse en una estación de trabajo.
- Automatización de tareas de repositorio: con soporte de tool calling y trayectorias agénticas de terminal y Git, encaja en pipelines que necesitan leer ficheros, ejecutar comandos y aplicar cambios de forma iterativa.
- Tutoría de matemáticas y STEM: sus datos de destilación en ~250.000 muestras de matemáticas y ciencia lo hacen adecuado para resolver problemas paso a paso y explicar derivaciones.
- Agentes con herramientas externas: integrable como planificador que decide qué función invocar (APIs, búsqueda, cálculo) en flujos multi-paso, gracias a las trazas de function calling incluidas en su entrenamiento.
- Prototipado de asistentes multilingües: cubre inglés, chino, español, ruso y japonés, útil para productos con base de usuarios en esos mercados sin desplegar varios modelos.
- Experimentación en investigación sobre fusión de modelos: sirve como caso de estudio reproducible de SLERP con `t = 0.4` entre dos fine-tunes complementarios, para analizar la preservación de capacidades tras la fusión.
- Despliegue en entornos con política de contenido laxa: al ser una variante decensurada, puede usarse en investigación sobre rechazos y abliteration, siempre con las salvaguardas adecuadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de este checkpoint de 9B en la información disponible. La evaluación preliminar del autor se limitó a la variante de 4B y la comparó con sus progenitores en un conjunto reducido de pruebas, con la conclusión de que la fusión preservó en gran medida el rendimiento general, sin degradación clara, con variaciones menores (por ejemplo, resultados similares a los progenitores en ARC-Easy). No se dispone de cifras concretas para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: en torno a 19-20 GB solo para pesos, más overhead de activaciones y KV cache; requiere GPU de 24 GB o superior.
- Cuantización a 8 bits: aproximadamente 10-11 GB de VRAM, viable en GPUs de 12-16 GB.
- Cuantización a 4 bits: aproximadamente 5-6 GB de VRAM, cabe en GPUs de consumo como RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4070/4080/4090; el repo no publica ficheros GGUF, por lo que habría que generarlos.
- GPU recomendadas para FP16: A100 40/80 GB, H100, L40S, o RTX 4090 (24 GB, justo para BF16 con contexto corto).
- Opciones de despliegue: transformers (formato nativo del repo); vLLM y TGI para servicio de alto throughput; llama.cpp/Ollama tras convertir a GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Wukong 9B (este modelo) | 9,65 B | no disponible | Apache 2.0 | Fusión SLERP de dos fine-tunes Qwen3.5; decensurado; multimodal imagen-texto |
| Qwen/Qwen3.5-9B (base) | ~9 B | no disponible | no disponible en esta ficha | Modelo base original, presumiblemente con alineación estándar |
| xtools-at/Qwopus3.5-9B-Coder-UNCENSORED-heretic | ~9 B | no disponible | no disponible en esta ficha | Progenitor orientado a código y agentes |
| xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic | ~9 B | no disponible | no disponible en esta ficha | Progenitor orientado a razonamiento matemático y STEM |
| xtools-at/Wukong-4B-...-heretic | ~4 B | no disponible | Apache 2.0 | Variante menor del mismo linaje, con evaluación preliminar publicada |

Los datos de rendimiento comparado no están disponibles; la única referencia cuantitativa del autor es la evaluación del 4B frente a sus progenitores.

## Limitaciones y advertencias

- Modelo decensurado/abliterated: presenta menos rechazos ante peticiones sensibles, lo que incrementa el riesgo de generar contenido inapropiado o dañino; requiere filtros y políticas de uso en producción.
- Riesgo de alucinación propio de modelos de ~9B, especialmente en dominios especializados y en tareas de razonamiento largo.
- Las trazas de razonamiento de entrenamiento son sintéticas y reconstruidas (Trace Inversion), no razonamientos internos reales; pueden introducir patrones de estilo o errores sistemáticos.
- La evaluación publicada corresponde al 4B, no a este 9B; no hay evidencia empírica de rendimiento para este checkpoint.
- Longitud de contexto no documentada; conviene verificarla empíricamente antes de usarla en tareas de contexto largo.
- Cobertura idiomática declarada limitada a en, zh, es, ru y ja; el rendimiento fuera de inglés y chino no está verificado.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad sobre el contenido generado y el cumplimiento normativo recaen en el desplegador.
- Modelo de nicho con pocas descargas (248) y likes (3) en el momento de la consulta; ecosistema y soporte comunitario reducidos.
- El soporte multimodal imagen-texto se infiere del pipeline declarado, pero no hay documentación sobre el módulo de visión ni sobre su calidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xtools-at/Wukong-9B-Qwen3.5-Claude-Opus-DeepSeek-SLERP-2xMerge-heretic
- Variante 4B: https://huggingface.co/xtools-at/Wukong-4B-Qwen3.5-Claude-Opus-DeepSeek-SLERP-2xMerge-heretic
- Progenitor Qwopus: https://huggingface.co/xtools-at/Qwopus3.5-9B-Coder-UNCENSORED-heretic
- Fine-tune original Qwopus: https://huggingface.co/Jackrong/Qwopus3.5-9B-Coder
- Progenitor DeepSeek-V4-Pro: https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic
- Fine-tune original DeepSeek-V4-Pro: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B
- Dataset Claude Opus 4.6 TraceInversion: https://huggingface.co/datasets/Jackrong/Claude-opus-4.6-TraceInversion-9000x
- Dataset Claude Opus 4.7 TraceInversion: https://huggingface.co/datasets/Jackrong/Claude-opus-4.7-TraceInversion-5000x
- Dataset de trazas agénticas: https://huggingface.co/datasets/lambda/hermes-agent-reasoning-traces
- Paper de referencia (Trace Inversion): https://arxiv.org/abs/2603.07267
- Perfil del autor: https://huggingface.co/xtools-at
