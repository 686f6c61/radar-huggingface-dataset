# theteha/dorina-v4-base

## Resumen

Dorina-V4 3B Crystal Base es un modelo de lenguaje de pequeno tamano (SLM) desarrollado por el usuario theteha, publicado bajo licencia Apache 2.0. A pesar de la denominacion "3B" en el nombre comercial, el modelo tiene en realidad 144,7 millones de parametros en una arquitectura transformer densa entrenada desde cero con PyTorch puro. El modelo fue entrenado sobre un curriculum de 3.000 millones de tokens y esta orientado a despliegues en el borde (edge AI) y entornos con recursos limitados.

La arquitectura sigue el diseno de los transformers decoder-only modernos: 16 capas, dimension oculta de 768, 12 cabezas de atencion con Grouped-Query Attention (4 cabezas KV, ratio 3:1), MLP con activacion SwiGLU, normalizacion RMSNorm y embeddings posicionales rotatorios (RoPE). El vocabulario es de 32.768 tokens mediante Byte-Level BPE v4, y la longitud de contexto alcanza los 2.048 tokens.

El modelo es relevante por su enfoque de entrenamiento reproducible en hardware modesto (dos Tesla T4 con DDP) y por completar el protocolo WSD (Warmup-Stable-Decay) con una fase de "cristalizacion" en ratio 20:1. Esta disenado principalmente para turco e ingles, con una perdida final de preentrenamiento de aproximadamente 1,46. Su tamano reducido lo hace candidato para inferencia en CPU y GPUs de consumo, aunque su adopcion actual es nula (0 descargas, 0 likes en el momento de la consulta).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only (PyTorch puro) |
| Parametros totales | 144.706.560 (~144,7M) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | No disponible (pesos en formato .pt de PyTorch; no se documentan variantes GGUF/INT8/INT4) |
| Idiomas soportados | Turco (tr) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (.pt, state_dict); no se publican safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo emplea un transformer denso decoder-only con 16 capas, dimension oculta de 768 y 12 cabezas de atencion query con 4 cabezas KV bajo Grouped-Query Attention (ratio 3:1), lo que reduce el coste de memoria del KV cache. La capa MLP usa dimension intermedia de 2.560 con activacion SwiGLU. La normalizacion es RMSNorm con epsilon 1e-5 y la codificacion posicional usa RoPE con theta de 10.000,0. El vocabulario de 32.768 tokens se construyo con Byte-Level BPE v4.

El entrenamiento se realizo desde cero sobre dos Tesla T4 con Data Parallel Distribuido (DDP), completando 3.000 millones de tokens. El corpus combina FineWeb-Edu, Python Cleaned, FineWeb2-HQ Turkish y FineMath 3+. Se aplico el protocolo WSD (Warmup-Stable-Decay) con una fase de cristalizacion en proporcion 20:1. La perdida final de preentrenamiento reportada es de aproximadamente 1,46. No se documenta el uso de RLHF, DPO ni tecnicas de alineacion posteriores; se trata de un modelo base sin ajuste instructivo.

## Capacidades

- Generacion de texto autoregresiva en turco e ingles.
- Razonamiento basico y continuacion de texto (modelo base, sin modo instruct).
- Generacion de codigo limitada, dado el componente Python Cleaned en el corpus de entrenamiento.
- Razonamiento matematico basico, con FineMath 3+ en el dataset.
- Soporte de tool calling / function calling: no disponible (modelo base sin ajuste para ello).
- Soporte de agentes y razonamiento multi-paso: no disponible de forma nativa.
- Capacidades multilingues limitadas a turco e ingles.
- Capacidades especiales (thinking mode, vision, audio): no disponibles.

## Casos de uso

- Prototipado rapido de pipelines de generacion de texto: al ser un modelo de 144,7M de parametros con pesos PyTorch, se puede cargar en CPU o en una GPU modesta para validar arquitecturas y flujos de inferencia antes de escalar a modelos mayores.
- Investigacion sobre entrenamiento desde cero: sirve como referencia reproducible de un curriculum WSD con fase de cristalizacion y DDP sobre T4, util para estudiar dinamicas de entrenamiento en presupuestos reducidos.
- Generacion de texto en turco para tareas de continuacion y completado: el corpus FineWeb2-HQ Turkish aporta cobertura del idioma, adecuado para experimentos de modelado del lenguaje en turco.
- Educacion y demos de IA en el borde (edge AI): su tamano permite ejecutarlo en dispositivos con recursos limitados para demostraciones de generacion de texto sin dependencia de la nube.
- Filtrado y clasificacion ligera de texto mediante puntuaciones de log-probabilidad: util para scoring de candidatos en pipelines de datos, aprovechando su bajo coste computacional.
- Base para fine-tuning especifico de dominio: al ser un modelo base Apache 2.0, puede ajustarse para tareas concretas (clasificacion, extraccion, resumen) con requisitos de VRAM muy bajos.
- Experimentacion con tecnicas de decodificacion (greedy, top-k, top-p) y comparacion de estrategias en un modelo pequeno y rapido de ejecutar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada es la perdida final de preentrenamiento (~1,46), que no es directamente comparable con resultados de MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,6 GB en FP32 (144,7M parametros x 4 bytes), mas overhead de activaciones y KV cache; inferior a 1 GB en la mayoria de configuraciones.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM; el autor entreno en Tesla T4, por lo que estas son suficientes. Tambien funciona en CPU.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna (GTX 1050 en adelante, RTX 20/30/40, etc.), e incluso en CPU.
- Opciones de despliegue: el codigo de ejemplo usa PyTorch nativo con un modulo de arquitectura propio (`dorina_v4_architecture`) y un tokenizer de la libreria `tokenizers`. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, y al no publicarse pesos en GGUF ni safetensors, la integracion con esos frameworks requeriria conversion manual.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Dorina-V4 3B Crystal Base | 144,7M | 2.048 | tr, en | Apache 2.0 | PyTorch (.pt) | Entrenado desde cero, sin benchmarks publicados |
| SmolLM-135M (Hugging Face) | 135M | 2.048 | en (principalmente) | Apache 2.0 | safetensors, GGUF | Modelo base con amplia adopcion y soporte en frameworks |
| Qwen2.5-0.5B | 494M | 32.768 | multilingue | Apache 2.0 | safetensors, GGUF | Mayor tamano y contexto, ecosistema maduro |
| TinyLlama-1.1B | 1,1B | 2.048 | en | Apache 2.0 | safetensors, GGUF | Mayor capacidad pero mas coste computacional |

La comparacion con SmolLM-135M es la mas directa por tamano y contexto; sin embargo, Dorina-V4 carece de benchmarks publicados, de pesos en formatos estandar (safetensors/GGUF) y de adopcion verificable, lo que limita la comparacion cuantitativa. Qwen2.5-0.5B y TinyLlama ofrecen mayor capacidad y ecosistema, a costa de mas parametros.

## Limitaciones y advertencias

- Modelo base sin ajuste instructivo: no sigue instrucciones de forma fiable ni esta alineado con preferencias humanas; no debe usarse directamente como asistente conversacional.
- Riesgo de alucinacion elevado: con 144,7M de parametros y 3.000 millones de tokens de entrenamiento, su capacidad de conocimiento factual es muy limitada.
- Sesgos conocidos: no se documentan evaluaciones de sesgo; los corpus web (FineWeb-Edu, FineWeb2) pueden introducir sesgos de genero, culturales y linguisticos no mitigados.
- Limitaciones de contexto: ventana de 2.048 tokens, insuficiente para tareas de contexto largo o documentos extensos.
- Cobertura idiomatica restringida a turco e ingles; el rendimiento en otros idiomas no esta evaluado y probablemente sea deficiente.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; la ausencia de benchmarks y de adopcion implica un riesgo alto para produccion.
- Formato de pesos no estandar (.pt con modulo de arquitectura propio): requiere codigo personalizado para cargar el modelo, lo que complica la integracion en pipelines existentes y la conversion a otros formatos.
- Adopcion nula en el momento de la consulta (0 descargas, 0 likes): no hay evidencia de validacion por parte de la comunidad.
- El nombre comercial "3B" puede inducir a confusion: el modelo tiene 144,7M de parametros, no 3.000 millones.

## Enlaces

- Hugging Face: https://huggingface.co/theteha/dorina-v4-base
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la informacion proporcionada.
