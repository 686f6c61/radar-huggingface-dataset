# tundraneck907/Hy4-flash

## Resumen

Hy4-flash es un modelo de lenguaje multimodal desarrollado por Tencent Hunyuan, publicado bajo la licencia Tencent Hy License. Se trata de un modelo Mixture-of-Experts (MoE) de 220.251.201.958 parámetros totales según los pesos en safetensors, de los cuales solo 11,3B (texto) más 0,43B (visión) se activan por token. Acepta de forma nativa entradas de texto e imagen y genera texto, con una ventana de contexto de hasta 1.048.576 tokens (1M).

La arquitectura se apoya en un backbone de 42 capas (1 densa y 41 MoE) con atención híbrida que intercala atención dispersa (IndexPool) y sliding-window attention en proporción 1:3, Multi-head Latent Attention (MLA) y conexiones residuales iHC con 4 flujos. Incorpora tres innovaciones destacables: LatentMoE (expertos en espacio latente de dimensión reducida), embeddings N-gram (Engram) con bigramas y trigramas recuperados mediante hash multi-cabeza, y un drafter DFly2 de 0,85B parámetros para decodificación especulativa de contexto largo.

Su relevancia actual radica en la relación coste-eficiencia: activa apenas 12B parámetros por token manteniendo un contexto de 1M tokens y capacidades multimodales, lo que lo sitúa como una opción atractiva para despliegues de producción con requisitos de contexto extenso y presupuesto de cómputo contenido. El repositorio ocupa 440,5 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con atención híbrida (dispersa + SWA), MLA e iHC |
| Parametros totales | 220.251.201.958 (155,5B backbone + 63,5B Engram + 0,43B ViT + 0,85B DFly2) |
| Parametros activos | 11,3B texto + 0,43B visión por token |
| Longitud de contexto | 1.048.576 tokens (1M) |
| Tipos de cuantizacion | No disponible en la información proporcionada (existe repositorio GGUF de terceros) |
| Idiomas soportados | No disponible |
| Licencia | Tencent Hy License (license:other) |
| Formato de pesos | safetensors (librería transformers); GGUF disponible en repositorio separado |

## Arquitectura y entrenamiento

El backbone lingüístico consta de 42 capas: una capa densa con FFN de tamaño intermedio 13.824 y 41 capas MoE. Cada capa MoE dispone de 512 expertos enrutados más un experto compartido, activando 16 expertos enrutados por token en un espacio latente de dimensión 1.536 (LatentMoE). El tamaño oculto es 3.072 y el vocabulario de 120.832 tokens. Las conexiones residuales emplean iHC (identity Hyper-Connections) con 4 flujos residuales.

La atención es híbrida: 12 capas usan atención dispersa (selección de hasta 2.048 tokens mediante selección a nivel de grupo) y 30 capas usan sliding-window attention con ventana causal de 512 tokens. Ambas variantes emplean MLA con q_lora_rank 1.024 y kv_lora_rank 512, dimensión de cabeza QK de 192+64 (no-RoPE + RoPE) y dimensión de valor 256. El patrón de capas es 2 dispersas seguidas de 10 bloques de (3 SWA → 1 dispersa). El codificador de posición multimodal es MRoPE intercalado.

El componente Engram añade embeddings de bigramas y trigramas en las capas 1, 11, 21 y 31, con 8 cabezas hash por orden, vocabulario hash de 10,3M por cabeza y dimensión de 768 por orden (8 cabezas × 96), sumando 63,4B parámetros en tablas de embedding. El codificador visual, adaptado de SigLIP2-So400m-Patch16-Res512, tiene 27 capas, tamaño oculto 1.152, tamaño intermedio 4.304, 16 cabezas de atención, parches de 16×16, embeddings posicionales de 128×128 y fusión de características visuales 2×2, conectado al backbone mediante un proyector MLP. El drafter DFly2 de 5 capas y 0,85B parámetros reutiliza la caché KV y los índices dispersos del modelo objetivo para decodificación especulativa de bajo coste constante. No se dispone de datos sobre el número de tokens de entrenamiento, composición del dataset ni uso de RLHF/DPO en la información proporcionada.

## Capacidades

- Generación de texto e imagen-texto a texto (pipeline image-text-to-text).
- Razonamiento y comprensión multimodal nativa de imágenes.
- Contexto largo de hasta 1M tokens, adecuado para documentos extensos y conversaciones multi-turno prolongadas.
- Decodificación especulativa mediante DFly2 para acelerar la inferencia en contexto largo.
- Modo instruct y formato conversacional.
- Compatibilidad con endpoints (tag endpoints_compatible).
- Soporte de API compatible con OpenAI según la model card.
- Capacidades multilingües: no disponible en detalle (la model card incluye versión en chino e inglés).
- Tool calling / function calling: no disponible explícitamente en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible explícitamente; la model card menciona validación interna de código y agentes en la sección de capacidades preentrenadas.

## Casos de uso

- Análisis de documentos extensos: con 1M tokens de contexto, el modelo puede procesar informes, contratos o bases de código completas en una sola pasada sin truncamiento, manteniendo coherencia gracias a la atención híbrida dispersa/SWA.
- Asistentes conversacionales multimodales: al aceptar texto e imagen de forma nativa, puede gestionar diálogos donde el usuario adjunta capturas, diagramas o fotografías, respondiendo con contexto visual integrado.
- Procesamiento de documentación técnica con imágenes: ideal para manuales, papers o documentación de ingeniería que combinan texto y figuras, extrayendo y razonando sobre ambos tipos de contenido.
- Generación asistida de código en pipelines: la model card referencia validación interna en código y agentes; puede integrarse en flujos de revisión o generación de código con contexto de repositorio amplio.
- Despliegue económico en producción: al activar solo 12B parámetros por token, reduce el coste de cómputo frente a modelos densos de tamaño comparable, adecuado para servicios de inferencia con alto volumen.
- Investigación sobre arquitecturas MoE eficientes: su combinación de LatentMoE, Engram y atención híbrida lo convierte en objeto de estudio para experimentos de escalado y eficiencia.
- Aplicaciones de contexto largo con decodificación acelerada: el drafter DFly2 permite servir respuestas sobre ventanas de 1M tokens con latencia más contenida, útil en búsqueda aumentada o resumen de corpus.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numéricos en la información disponible. La model card menciona una sección de resultados de benchmarks (apéndice) y gráficas de bits-per-byte (BPB) en validación interna de código y agentes, pero no se incluyen valores concretos en el material proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 220B parámetros totales en safetensors (440,5 GB de repositorio), la inferencia en precisión completa requiere múltiples GPUs de gran memoria. Existe un repositorio GGUF de terceros que permitiría cuantizaciones reducidas, pero no se detallan tamaños.
- GPU recomendadas: no disponible en la información proporcionada. Por el tamaño del modelo, se requerirían configuraciones multi-GPU (por ejemplo, clústeres con A100/H100), aunque no se confirma oficialmente.
- Cabe en GPU de consumo: no disponible; el tamaño total de parámetros hace improbable su ejecución en una sola GPU de consumo sin cuantización agresiva.
- Opciones de despliegue: vLLM, SGLang (según la model card), Transformers, API compatible con OpenAI, y GGUF (repositorio de terceros, posiblemente para llama.cpp/Ollama, aunque no se confirma).
- Latencia y throughput estimados: no disponibles; la model card menciona eficiencia de coste y decodificación especulativa con DFly2, pero sin cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hy4-flash | 220,25B (incl. Engram, ViT, DFly2) | 11,3B texto + 0,43B visión | 1M | Tencent Hy License | Hugging Face, ModelScope, GitCode |
| Hy4 (referencia en model card) | No disponible | No disponible | No disponible | Tencent Hy License | No disponible |
| Alternativas de la misma categoría | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos suficientes para comparar con modelos alternativos concretos de la misma categoría (MoE multimodal de contexto largo) en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible en la información proporcionada.
- Riesgo de alucinación: inherente a los modelos generativos; no se documentan evaluaciones específicas en el material disponible.
- Limitaciones de contexto o idioma: aunque soporta 1M tokens, el rendimiento efectivo en ventanas extremas no está cuantificado; los idiomas soportados no se detallan.
- Restricciones de licencia: la Tencent Hy License (license:other) puede imponer condiciones para uso comercial; es necesario revisar el texto completo de la licencia antes de desplegar en producción.
- El modelo es una publicación de un usuario tercero (tundraneck907) que replica la model card de Tencent; conviene verificar la procedencia y autenticidad de los pesos frente al repositorio oficial de Tencent.
- Sin descargas ni likes registrados en el momento de la consulta, lo que limita la validación comunitaria.
- El tamaño del repositorio (440,5 GB) y los 220B parámetros totales implican requisitos de almacenamiento y memoria considerables.
- No se documentan procesos de alineación (RLHF/DPO) ni evaluaciones de seguridad en la información disponible.

## Enlaces

- Hugging Face (repo consultado): https://huggingface.co/tundraneck907/Hy4-flash
- Hugging Face (oficial Tencent): https://huggingface.co/tencent/Hy4-flash
- Licencia: https://huggingface.co/tencent/Hy4-flash/blob/main/LICENSE
- ModelScope: https://modelscope.cn/models/Tencent-Hunyuan/Hy4-flash
- GitCode: https://ai.gitcode.com/tencent_hunyuan/Hy4-flash
- Sitio oficial: https://hy.tencent.ai/research/hy4-flash
- GitHub: https://github.com/Tencent-Hunyuan/Hy4-flash
- GGUF (terceros): https://huggingface.co/AngelSlim/Hy4-flash-GGUF
