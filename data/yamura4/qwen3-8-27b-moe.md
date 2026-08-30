# yamura4/Qwen3.8-27B-MoE

## Resumen

Qwen3.8-27B-MoE es un experimento de investigación publicado por yamura4 que convierte el modelo denso Qwen/Qwen3.8-27B (27B parámetros, de Alibaba) en una arquitectura Mixture-of-Experts (MoE) sparse mediante una técnica de upcycling. El objetivo era comprobar si era posible reducir el coste computacional de las FFN densas (17.1B parámetros) a un 12.5% del cómputo (~2.2B parámetros activos) manteniendo un rendimiento funcional equivalente, todo ello entrenado en una única GPU AMD Radeon Pro W7800 de 32 GB.

El resultado, documentado de forma honesta por el autor, es que la conversión no logra equivalencia funcional: la pérdida de entropía cruzada se dispara de 2.16 a 13.13 y la precisión top-1 cae a 0.00. El autor concluye que Qwen3.8-27B está demasiado densamente empaquetado para ser troceado en un MoE con solo un 12% de activación sin un reentrenamiento sustancial. El valor del repositorio reside en la metodología abierta y verificable (escaneo de activaciones, caché, ajuste por capas, alineación end-to-end) y en el perfil de error por capa, no en el modelo resultante como herramienta utilizable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso convertido a MoE sparse (upcycling) con 64 expertos por capa, top-8 activos, shared core de rango 512 y deltas LoRA (r=16) por experto |
| Parametros totales | 1.418.395.648 (delta pack subido; el modelo base Qwen3.8-27B tiene 27B) |
| Parametros activos | ~2.2B en FFN (12.5% del cómputo FFN denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NF4 para el escaneo de activaciones; fp16 para cómputo; los pesos base se cargan desde el checkpoint original |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (delta pack: shared cores, routers, índices de slice, deltas LoRA) |

## Arquitectura y entrenamiento

El modelo parte del checkpoint denso Qwen/Qwen3.8-27B y sustituye las FFN densas de las 64 capas por un bloque MoE enrutado. Cada capa contiene 64 expertos, cada uno formado por una rebanada disjunta de 272 neuronas de la FFN original (filas de gate/up y columnas de down), sin duplicación de pesos. Se añade un shared core de rango 512 ajustado por mínimos cuadrados ponderados por activación sobre pares (x, y) cacheados, y cada experto incorpora un delta LoRA (r=16) aprendido. El router se inicializa a partir de las medias de las columnas de gate (estilo ExpertWeaver) y se entrena con un objetivo combinado de reconstrucción, CE con oráculo y balance de carga, seguido de una alineación end-to-end con el objetivo LM.

El entrenamiento se realizó en una sola AMD Radeon Pro W7800 (32 GB VRAM, gfx1100, ROCm) sin clúster. El pipeline completo incluye: escaneo de activaciones (4-bit NF4, cómputo fp16), caché de pares (x, y, a) por capa sobre un corpus de ~4M tokens de fineweb-edu, ajuste por capas (router + shared core + LoRA, fp32, AdamW) y alineación final end-to-end. El autor reporta un error relativo medio de reconstrucción por capa de 0.53 (mejor capa 0.18, peor 0.64), que se acumula a lo largo de las 64 capas y provoca el colapso de la distribución de salida.

## Capacidades

- Generación de texto: el modelo es capaz de generar texto, pero con una calidad muy degradada respecto al modelo denso original. La distribución de salida colapsa a un pico "confiadamente erróneo" (top-1 = 0.00 en la evaluación del autor).
- Razonamiento: no demostrado; la pérdida de CE de 13.13 indica que el modelo no produce secuencias coherentes en la práctica.
- Código y matemáticas: no evaluado; no hay evidencia de capacidades útiles en estos dominios.
- Tool calling / function calling: no soportado ni documentado.
- Capacidades multilingües: solo inglés declarado en la model card; no hay evidencia de funcionamiento en otros idiomas.
- Capacidades especiales: ninguna; el modelo es un experimento de investigación, no un producto funcional.

## Casos de uso

Dado el estado del modelo (no funcional end-to-end), los casos de uso son esencialmente de investigación y educación:

- Estudio de técnicas de upcycling denso a MoE: el repositorio documenta un pipeline completo (scan → cache → fit → layerwise refinement → assemble) que puede servir como referencia metodológica para otros intentos de conversión.
- Análisis de perfiles de error por capa: los datos de error relativo por capa (0.18 a 0.64) permiten estudiar cómo se propaga el error de reconstrucción en arquitecturas profundas.
- Comparación de estrategias de poda y enrutamiento: el diseño con shared core, expertos disjuntos y LoRA por experto ofrece un caso de estudio para evaluar alternativas de compresión.
- Desarrollo de técnicas de destilación profesor-alumno: el autor sugiere como siguiente paso la destilación con KL del profesor sobre una base de 4 bits; este repositorio puede servir de punto de partida.
- Validación de hardware de consumo: demuestra que es posible ejecutar un pipeline de entrenamiento de este tipo en una GPU de 32 GB VRAM (W7800) sin clúster.
- Reproducibilidad de experimentos negativos: documenta un resultado negativo de forma rigurosa, lo que es valioso para evitar que otros investigadores repitan el mismo enfoque sin conocer sus límites.

## Benchmarks y rendimiento

El autor proporciona una evaluación sobre un conjunto de retención de 8k tokens de fineweb-edu, comparando el MoE resultante con el modelo denso original en cuantización NF4:

| Metrica | Qwen3.8-27B (dense, NF4) | Qwen3.8-27B-MoE (este) |
|---|---|---|
| CE loss | 2.16 | 13.13 |
| Top-1 next-token | 0.55 | 0.00 |
| Entropia de salida | 21.6 | 13.3 |

No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor concluye explícitamente que la conversión no es funcionalmente equivalente y que el modelo no es utilizable para tareas reales.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma fiable, ya que el modelo requiere cargar el checkpoint base Qwen3.8-27B (27B parámetros) más el delta pack. En la práctica, se necesitaría al menos 32 GB de VRAM para cargar el base en cuantización NF4 o fp16 con los deltas.
- GPU recomendadas: el autor utilizó una AMD Radeon Pro W7800 (32 GB, gfx1100, ROCm). No se han probado otras GPUs.
- Compatibilidad con GPUs de consumo: no se ha verificado; el modelo base de 27B en fp16 requiere ~54 GB, por lo que en una GPU de consumo (p. ej., RTX 4090 de 24 GB) solo sería viable con cuantización agresiva y aun así el MoE no es funcional.
- Opciones de despliegue: no se documentan opciones estándar (vLLM, llama.cpp, Ollama, TGI). El código de carga requiere un script personalizado (`Qwen3_8RMoEForCausalLM`) y los pesos base del modelo original.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Rendimiento | Licencia |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | Denso | 27B | no disponible | CE 2.16 (fineweb-edu) | Apache-2.0 |
| Qwen3.8-27B-MoE (este) | MoE sparse (upcycling) | 27B totales, ~2.2B activos en FFN | no disponible | CE 13.13, top-1 0.00 | Apache-2.0 |
| Qwen3.6-35B-A3B (mencionado en web) | MoE | 35B totales, 3B activos | no disponible | no disponible | Apache-2.0 (presumible) |

La comparativa con Qwen3.6-35B-A3B es solo orientativa a partir de la búsqueda web; no se dispone de datos de rendimiento comparables. El modelo de yamura4 es claramente inferior a su base densa y no compite con MoE comerciales o de investigación bien entrenados.

## Limitaciones y advertencias

- El modelo no es funcional: la conversión no logra equivalencia con el modelo denso original. La CE loss es 6 veces mayor y la precisión top-1 es 0.00 en la evaluación del autor.
- Colapso de la distribución de salida: el modelo produce salidas "confiadamente erróneas", lo que lo hace inadecuado para cualquier tarea de generación real.
- Dependencia del checkpoint base: los pesos subidos son solo deltas; el modelo requiere descargar y cargar el Qwen3.8-27B original, lo que añade complejidad y requisitos de almacenamiento.
- Sesgos y alucinaciones: no evaluados; dado el estado del modelo, cualquier salida debe considerarse no fiable.
- Licencia: Apache-2.0, permite uso comercial, pero el modelo no es útil en producción por su falta de funcionalidad.
- Limitaciones de idioma: solo inglés declarado; no hay soporte multilingüe verificado.
- Riesgo de reproducibilidad: el entrenamiento se realizó en hardware específico (W7800/ROCm) y puede no ser reproducible en otras plataformas sin adaptación.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/yamura4/Qwen3.8-27B-MoE
- Modelo base Qwen/Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio GitHub de Qwen3.8-27B (Alibaba): https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Blog de ExplainX sobre Qwen3.8-27B: https://www.explainx.ai/blog/qwen-3-8-27b-open-weight-model-claude-opus-comparison-august-2026
- Artículo de Singularity Moments sobre la familia Qwen 3.8: https://singularitymoments.com/qwen-3-8-ai-models/
- Página de QwenCloud para Qwen3.8-27B: https://www.qwencloud.com/models/qwen3.8-27b
