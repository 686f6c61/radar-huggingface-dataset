# Thengbeo/titi-genesis

## Resumen

TiTi Genesis V2 es un modelo de lenguaje de tipo decoder-only Transformer desarrollado por Hồ Ngọc Thắng (publicado bajo el identificador de Hugging Face Thengbeo). Se trata de un modelo denso de 248,6 millones de parámetros con una arquitectura clásica pero cuidadosamente optimizada para entrenamiento en hardware limitado (Google Colab T4 gratuito). El modelo se distribuye como "Phôi" (esqueleto o base preentrenada) y está diseñado para ser continuado mediante scripts de preentrenamiento con reanudación automática.

La relevancia de este modelo reside en su enfoque práctico: implementa técnicas de entrenamiento distribuidas (MuLoCo, combinación de Muon y Nesterov DiLoCo) y un pipeline de preentrenamiento que mezcla datos de Wikipedia y libros al 50 % en cada batch para mitigar el olvido catastrófico. Su vocabulario de 51.200 tokens está optimizado para vietnamita, inglés, matemáticas en LaTeX y código, y la arquitectura GQA reduce el KV-cache en un factor de 3.

El modelo declara soporte para vietnamita e inglés, licencia Apache 2.0, y capacidades orientadas a matemáticas y código. El repositorio ocupa 1.408,3 GB, lo que sugiere la presencia de múltiples checkpoints y artefactos de entrenamiento además de los pesos finales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only Transformer (Pre-RMSNorm, GQA, RoPE, SwiGLU) |
| Parametros totales | 248.556.288 (~248,6 M); ~744 M si se expande a 4 expertos MoE |
| Parametros activos | no disponible (el modelo base es denso; la variante MoE no está publicada como checkpoint) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | vietnamita (vi), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`.pt`, ~549 MB por checkpoint); no se indica safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura Transformer decoder-only con Pre-RMSNorm, Grouped-Query Attention (12 cabezas de consulta y 4 de clave/valor, ratio 3:1, `head_dim=64`), RoPE y SwiGLU. Consta de 28 capas con `hidden_dim=768` y `ffn_dim=2.560` (3,33× el hidden dim, alineado a 128 para Tensor Cores de T4). El vocabulario es de 51.200 tokens, divisible por 256, e incluye tokens para vietnamita, inglés, LaTeX matemático (`\frac`, `\sqrt`), código y etiquetas de agente. Los embeddings de entrada y la cabeza de salida están atados (`tie_word_embeddings=True`), ahorrando 39,3 M de parámetros. El tronco aporta 83,4 M y la FFN 165,2 M.

El entrenamiento se realiza mediante el script `colab_pretrain_v2.py`, diseñado para sesiones de Colab Free. Mezcla 50 % Wikipedia y 50 % libros en cada batch mediante `PairedInterleavedDataset` con `np.memmap`, carga solo un par de archivos (~150 MB) por etapa y elimina el dataset de comentarios de redes sociales (`visobert_social`). Aplica `weight_decay=0.0` a las 57 capas RMSNorm y re-warmup de 100 pasos al inicio de cada sesión para evitar picos de loss por Cold-AdamW. Guarda un único archivo `titi_genesis.pt` (~549 MB) con reemplazo atómico y sincronización a Hugging Face cada 15 minutos o 200 pasos, preservando `stage_idx` y `seen_in_stage` para reanudar exactamente donde se dejó. Adicionalmente, el paquete `diloco/` implementa MuLoCo (Muon + Nesterov DiLoCo en FP16): 196 matrices 2D (209,2 M de parámetros) usan Muon con 5 iteraciones de Newton-Schulz, mientras que `tok_embeddings` (39,3 M, wd=0.1) y las 57 capas RMSNorm 1D (43,8 K, wd=0.0) usan AdamW. Soporta tanto la consolidación en un único modelo denso (`--num_experts 1`) como el entrenamiento paralelo de 4 a 8 expertos MoE.

## Capacidades

- Generación de texto en vietnamita e inglés.
- Razonamiento matemático con soporte explícito de notación LaTeX en el vocabulario.
- Generación de código (etiqueta `code` en la model card).
- Capacidades de agente y etiquetas de agente incluidas en el vocabulario (`Agent tags`).
- Entrenamiento continuado y ajuste fino sobre el checkpoint base.
- Entrenamiento distribuido multi-nodo mediante el paquete `diloco/`.
- No se documentan capacidades de visión, audio, tool calling explícito ni modo de razonamiento extendido.

## Casos de uso

- Investigación en entrenamiento de bajo presupuesto: el modelo sirve como banco de pruebas para estudiar técnicas de reanudación, mezcla de datos y mitigación del olvido catastrófico en sesiones de GPU gratuitas, gracias a su script `colab_pretrain_v2.py` con reanudación exacta por etapa y offset.
- Experimentación con entrenamiento distribuido: el paquete `diloco/` permite probar MuLoCo (Muon + Nesterov DiLoCo) en FP16 sobre varias instancias de Colab T4, útil para validar algoritmos de optimización descentralizada sin infraestructura dedicada.
- Ajuste fino para tareas de matemáticas en vietnamita: el vocabulario incluye tokens LaTeX y el modelo declara la etiqueta `math`, lo que lo hace adecuado como base para fine-tuning en resolución de problemas y generación de fórmulas.
- Generación de código asistida en vietnamita: con la etiqueta `code` y el soporte bilingüe, puede adaptarse mediante fine-tuning a tareas de autocompletado o generación de fragmentos en entornos de desarrollo locales.
- Prototipado de asistentes conversacionales bilingües vi/en: su tamaño de 248,6 M permite inferencia en CPU o GPU de gama baja, adecuado para demos y pruebas de concepto antes de escalar a modelos mayores.
- Educación e investigación sobre arquitecturas GQA: al ser un modelo pequeño con GQA documentada, sirve para estudiar el impacto del KV-cache reducido y de Pre-RMSNorm en modelos de menos de 300 M de parámetros.
- Base para expansión a MoE: la model card describe el "upcycle" a 4 expertos (~744 M), lo que permite experimentar con rutas de escalado desde un modelo denso ya entrenado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Por el tamaño (248,6 M de parámetros), en FP32 ocuparía ~1 GB, en FP16 ~0,5 GB y en cuantización de 8 bits ~0,25 GB, aunque no se documentan cuantizaciones oficiales.
- GPU recomendadas: el entrenamiento se ha diseñado explícitamente para NVIDIA T4 (Colab Free), con `ffn_dim` alineado a 128 para sus Tensor Cores. Para inferencia, cualquier GPU con al menos 2-4 GB de VRAM sería suficiente en teoría, pero no se confirma.
- Cabe en GPU de consumo: previsiblemente sí en tarjetas como RTX 3060, RTX 4060 o superiores, dado el reducido número de parámetros, aunque no hay confirmación oficial.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI. El formato publicado es PyTorch (`.pt`), lo que requeriría conversión para la mayoría de motores de inferencia.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Formato |
|---|---|---|---|---|---|
| TiTi Genesis V2 | 248,6 M | no disponible | Apache 2.0 | vi, en | PyTorch (.pt) |
| Qwen2.5-0.5B | ~494 M | 32.768 tokens | Apache 2.0 | multilingüe | safetensors, GGUF |
| SmolLM2-360M | ~362 M | 8.192 tokens | Apache 2.0 | en (principalmente) | safetensors, GGUF |
| Phi-3-mini | ~3,8 B | 4.096 tokens | MIT | en (principalmente) | safetensors, GGUF |

La comparativa se ofrece a título orientativo: los datos de los modelos alternativos provienen de sus especificaciones públicas conocidas, mientras que para TiTi Genesis V2 no se dispone de benchmarks ni de contexto documentado, por lo que la comparación de rendimiento no es posible.

## Limitaciones y advertencias

- No se han publicado benchmarks, por lo que no es posible evaluar su calidad real frente a alternativas.
- La longitud de contexto no está documentada, lo que impide planificar su uso en tareas de contexto largo.
- El modelo se distribuye como "Phôi" (esqueleto base) y el autor indica que debe continuarse el preentrenamiento; no está claro que sea un modelo listo para uso directo en producción.
- Los idiomas declarados son únicamente vietnamita e inglés; no se garantiza un rendimiento aceptable en castellano.
- El vocabulario y los datos de entrenamiento (Wikipedia + libros) pueden introducir sesgos enciclopédicos y de estilo literario, además de posibles sesgos culturales propios de las fuentes.
- Riesgo de alucinación inherente a un modelo de 248,6 M de parámetros sin ajuste por RLHF/DPO documentado.
- No se documentan cuantizaciones oficiales ni formatos GGUF/safetensors, lo que complica el despliegue en motores estándar.
- El repositorio ocupa 1.408,3 GB, lo que puede implicar descargas muy pesadas si se clona completo; conviene descargar solo los archivos necesarios.
- Aunque la licencia es Apache 2.0 y permite uso comercial, la ausencia de evaluación y de garantías hace recomendable una validación exhaustiva antes de cualquier despliegue en producción.
- El modelo tiene 0 descargas y 1 like en Hugging Face, lo que sugiere una validación comunitaria muy limitada.

## Enlaces

- Hugging Face: https://huggingface.co/Thengbeo/titi-genesis
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la información proporcionada.
