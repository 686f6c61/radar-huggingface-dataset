# tencent/Hy4-flash

## Resumen

Hy4-flash es un modelo de lenguaje multimodal desarrollado por Tencent dentro de la familia Hunyuan (Hy). Se trata de un Mixture-of-Experts (MoE) de 220.251.201.958 parámetros totales, de los cuales solo se activan aproximadamente 12B por token (11,3B de texto más 0,43B de visión). Acepta de forma nativa entradas de texto e imagen, genera texto y ofrece una ventana de contexto de hasta 1.048.576 tokens (1M). Se posiciona como el modelo Hy más rentable hasta la fecha, orientado a cargas de trabajo de largo contexto con un coste de inferencia contenido.

Su columna vertebral lingüística tiene 42 capas (una densa y 41 MoE) con conexiones residuales iHC (identity Hyper-Connections) y atención híbrida que intercala atención dispersa (IndexPool) y sliding-window attention en una proporción 1:3. Incorpora tres innovaciones destacables: LatentMoE (expertos enroutados en un espacio latente de menor dimensión, 16 de 512 expertos activos más uno compartido por token), embeddings N-gram (Engram) con representaciones de bigramas y trigramas recuperadas mediante hash multicaBeza, y un drafter especulativo integrado, DFly2, de 0,85B parámetros.

El modelo es relevante ahora por su combinación de contexto extremo (1M), multimodalidad nativa y eficiencia de activación (12B activos sobre 220B totales), lo que lo sitúa en la categoría de modelos MoE de gran escala pensados para despliegue económico. Se distribuye bajo licencia propia Tencent Hy License y está disponible en Hugging Face, ModelScope y AtomGit, además de una versión GGUF mantenida por un tercero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con backbone transformer, atención híbrida (dispersa + SWA), MLA e iHC |
| Parametros totales | 220.251.201.958 (155,5B backbone + 63,5B Engram + 0,43B ViT + 0,85B DFly2) |
| Parametros activos | 11,3B texto + 0,43B visión por token (aproximadamente 12B) |
| Longitud de contexto | 1.048.576 tokens (1M) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (existe repositorio GGUF de terceros) |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | Tencent Hy License (tencent-hy-license, categoria "other") |
| Formato de pesos | safetensors (libreria transformers); GGUF disponible en repositorio comunitario |

## Arquitectura y entrenamiento

La arquitectura es un MoE con 42 capas de lenguaje: una capa densa con FFN de tamaño intermedio 13.824 y 41 capas MoE. Cada capa MoE contiene 512 expertos enroutados más un experto compartido, con dimensión latente de 1.536 y tamaño intermedio de experto de 1.536; por token se activan 16 expertos enroutados. El tamaño oculto es 3.072 y el vocabulario de 120.832 tokens. Las conexiones residuales usan iHC (identity Hyper-Connections) con 4 flujos residuales.

La atención es híbrida: se intercalan atención dispersa y sliding-window attention en un patrón de 2 capas dispersas seguidas de 10 bloques de (3 SWA + 1 dispersa), resultando en 12 capas dispersas y 30 SWA. La formulación es Multi-head Latent Attention (MLA) con q_lora_rank 1.024, kv_lora_rank 512, dimensión de cabeza QK de 192 + 64 (no-RoPE + RoPE) y dimensión de cabeza de valor 256. La atención dispersa selecciona hasta 2.048 tokens mediante selección a nivel de grupo; la SWA usa una ventana causal de 512 tokens. El codificado posicional multimodal es MRoPE intercalado, con bases RoPE de 10.000.000 (dispersa) y 10.000 (SWA).

Sobre el backbone se añade un módulo Engram de embeddings N-gram: bigramas y trigramas con 8 cabezas hash por orden, vocabulario hash de 10,3M por cabeza y dimensión de embedding de 768 por orden (8 × 96), inyectados en las capas 1, 11, 21 y 31; la tabla de embeddings suma 63,4B parámetros. El codificador visual (27 capas, hidden 1.152, intermedio 4.304, 16 cabezas, parches 16×16, posición 128×128, fusión 2×2) está adaptado de SigLIP2-So400m-Patch16-Res512 y se conecta mediante un proyector MLP. El drafter DFly2 (5 capas, 0,85B) reutiliza la caché KV y los índices dispersos del modelo objetivo para decodificación especulativa de largo contexto a coste constante. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO.

## Capacidades

- Generación de texto e instrucciones conversacionales multi-turno.
- Comprensión de imágenes y respuesta texto a partir de entradas image-text-to-text.
- Razonamiento y matemáticas (categoría inferida de los benchmarks citados en la model card).
- Generación de código y tareas de agente (la model card menciona validación interna de código y agente).
- Ventana de contexto de 1M tokens para documentos y conversaciones extensas.
- Decodificación especulativa integrada mediante DFly2 (0,85B) con reutilización de caché KV.
- Soporte de API compatible con OpenAI según la model card.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Análisis de repositorios completos: con 1M tokens de contexto, el modelo puede ingerir grandes bases de código, documentación y trazas de ejecución en una sola pasada para responder preguntas de arquitectura o detectar regresiones.
- Atención al cliente automatizada: conversaciones multi-turno prolongadas con historial extenso y adjuntos de imágenes (capturas, facturas) gracias a la entrada multimodal y la ventana de 1M tokens.
- Procesamiento documental multimodal: extracción y razonamiento sobre informes con tablas, gráficos e imágenes escaneadas, usando el codificador visual SigLIP2 y el proyector MLP.
- Agentes de código en CI/CD: integración mediante API compatible con OpenAI para revisión automática de pull requests, generación de parches y ejecución de pasos multi-step con tool calling.
- Investigación sobre documentos largos: resumen y QA sobre corpus jurídicos, científicos o financieros que exceden las ventanas habituales de 128K-256K tokens.
- Despliegue económico en producción: al activar solo ~12B parámetros por token, el coste de inferencia por petición es menor que el de un modelo denso de 220B, lo que lo hace adecuado para servicios de alto volumen.
- Subtitulado y descripción de imágenes a escala: pipeline image-text-to-text para catalogación de activos visuales con contexto largo acumulado.

## Benchmarks y rendimiento

La model card menciona resultados de benchmarks (sección "Appendix: Benchmark results") y una gráfica de bits-per-byte (BPB) en validación interna de código y agente, pero los valores numéricos no están incluidos en la información proporcionada. No se han publicado resultados numéricos de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia de orden de magnitud, el repositorio pesa 440,5 GB en safetensors (probablemente en BF16/FP16); la inferencia en precisión completa requiere agregados de memoria muy superiores a una GPU consumer.
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño, cabe esperar despliegues multi-GPU (A100/H100) para precisión completa.
- GPU consumer: no cabe en una RTX 4090 en precisión completa; sería necesaria cuantización agresiva (existe repositorio GGUF comunitario, aunque no se detallan los niveles disponibles).
- Opciones de despliegue: transformers, vLLM, SGLang, API compatible con OpenAI, DFly2 para decodificación especulativa y cuantización (secciones documentadas en la model card).
- Latencia y throughput: no disponibles en la información proporcionada; DFly2 está diseñado para decodificación especulativa de largo contexto a coste constante.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Multimodal | Licencia |
|---|---|---|---|---|---|
| Tencent Hy4-flash | 220B (155,5B backbone + 63,5B Engram) | ~12B | 1M | Si (texto + imagen) | Tencent Hy License |
| Hy4 (referencia citada en la model card) | No disponible | No disponible | No disponible | No disponible | Tencent Hy License |
| Alternativas de la misma categoria | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone en la información proporcionada de datos de modelos comparables de terceros (parámetros, contexto, rendimiento o licencia) para establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información proporcionada; cabe esperar los sesgos habituales de los datos de entrenamiento, no auditados aquí.
- Riesgo de alucinación: no cuantificado en la información disponible; debe validarse en producción, especialmente en tareas de código y datos factuales.
- Idiomas soportados: no especificados; la model card está en inglés y chino, pero no se confirma la cobertura multilingüe.
- Contexto: aunque la ventana es de 1M tokens, la calidad efectiva en el extremo superior no está documentada con benchmarks en la información disponible.
- Licencia: Tencent Hy License (categoría "other"), no es una licencia open source estándar; es imprescindible revisar el texto completo antes de uso comercial.
- Despliegue: el tamaño (440,5 GB en safetensors) y los 220B parámetros totales exigen infraestructura multi-GPU para precisión completa; la cuantización GGUF es de un repositorio comunitario, no oficial.
- Decodificación especulativa: DFly2 depende de la caché KV y los índices dispersos del modelo objetivo; su comportamiento fuera del régimen de largo contexto no está documentado.

## Enlaces

- Hugging Face: https://huggingface.co/tencent/Hy4-flash
- Licencia: https://huggingface.co/tencent/Hy4-flash/blob/main/LICENSE
- Web oficial: https://hy.tencent.ai/research/hy4-flash
- GitHub: https://github.com/Tencent-Hunyuan/Hy4-flash
- GGUF (comunitario): https://huggingface.co/AngelSlim/Hy4-flash-GGUF
- ModelScope: https://modelscope.cn/models/Tencent-Hunyuan/Hy4-flash
- AtomGit: https://ai.gitcode.com/tencent_hunyuan/Hy4-flash
- README en chino: https://huggingface.co/tencent/Hy4-flash/blob/main/README_CN.md
