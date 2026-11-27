# tencent/Hy4-flash-base

## Resumen

Hy4-flash-base es un modelo de lenguaje multimodal de tipo Mixture-of-Experts (MoE) desarrollado por Tencent dentro de la familia Hunyuan (Hy). Se trata de la variante "flash" de Hy4, disenada para maximizar la eficiencia de coste: con 219.4B parametros totales en el repositorio, activa aproximadamente 12B parametros por token (11.3B de texto mas 0.43B de vision). Acepta de forma nativa entradas de texto e imagen y genera texto, con una ventana de contexto de hasta 1.048.576 tokens (1M).

El modelo resuelve el problema de desplegar capacidades multimodales y de contexto largo con un coste de inferencia contenido, gracias a una combinacion de atencion hibrida (sparse attention IndexPool intercalada con sliding-window attention), LatentMoE con expertos en espacio latente y un mecanismo de embedding de n-gramas (Engram) que anade representaciones aprendidas de bigramas y trigramas. Incluye ademas un modelo drafter integrado, DFly2, para decodificacion especulativa de bajo coste en contextos largos.

Es relevante ahora porque representa la apuesta de Tencent por modelos MoE multimodales de contexto extremo y bajo coste por token, publicados como pesos abiertos bajo licencia propia (Tencent Hy License). La version publicada aqui es la variante `base` (pretrained), no la instruct, por lo que esta pensada como punto de partida para fine-tuning.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con backbone transformer de 42 capas, atencion hibrida (sparse + SWA) y MLA; vision encoder SigLIP2-So400m-Patch16-Res512 adaptado |
| Parametros totales | 219.405.515.525 (219.4B en safetensors; 155.5B backbone + 63.5B Engram + 0.43B ViT + 0.85B DFly2) |
| Parametros activos | 11.3B texto + 0.43B vision por token (16 de 512 expertos enrutados + 1 compartido) |
| Longitud de contexto | 1.048.576 tokens (1M) |
| Tipos de cuantizacion | No especificados en la informacion disponible; existe repositorio GGUF de terceros (AngelSlim/Hy4-flash-GGUF) |
| Idiomas soportados | No disponible |
| Licencia | Tencent Hy License (license: other, license_name: tencent-hy-license) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El backbone de lenguaje tiene 42 capas: una capa densa con FFN y 41 capas MoE. El tamano oculto es 3.072 y el vocabulario de 120.832 tokens. Las conexiones residuales usan iHC (identity Hyper-Connections) con 4 flujos residuales. La atencion es hibrida: se intercalan atencion dispersa (IndexPool, con seleccion de contexto de hasta 2.048 tokens a nivel de grupo) y sliding-window attention con ventana causal de 512 tokens, en un patron de 2 capas sparse seguidas de 10 bloques de (3 SWA + 1 sparse), resultando en 12 capas sparse y 30 capas SWA. La formulacion de atencion es Multi-head Latent Attention (MLA) con q_lora_rank 1.024, kv_lora_rank 512 y dimensiones de cabeza 192+64 (QK) y 256 (V). El posicionamiento multimodal usa MRoPE intercalado.

En las capas MoE hay 512 expertos enrutados y 1 experto compartido; cada token activa 16 expertos enrutados. Los expertos operan en un espacio latente de dimension 1.536 (LatentMoE), con tamano intermedio de experto tambien de 1.536; la FFN densa tiene tamano intermedio 13.824. El componente Engram anade embeddings de bigramas y trigramas mediante busquedas hash multi-cabeza: 8 cabezas por orden de n-grama, vocabulario hash de 10,3M por cabeza y dimension de embedding de 768 por orden (8 x 96), insertados en las capas 1, 11, 21 y 31; la tabla de embeddings suma 63,4B parametros. El vision encoder tiene 27 capas, tamano oculto 1.152, intermedio 4.304 y 16 cabezas de atencion, con parches de 16x16, embeddings posicionales de 128x128 y fusion de caracteristicas visuales 2x2, conectado al backbone mediante un proyector MLP. El drafter DFly2 (5 capas, 0.85B parametros) reutiliza la KV cache y los indices sparse del modelo objetivo para decodificacion especulativa en contexto largo.

No se detalla en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO; al tratarse de la variante `base`, cabe esperar un entrenamiento de preentrenamiento sin alineamiento posterior, aunque esto no se confirma explicitamente.

## Capacidades

- Generacion de texto y razonamiento general sobre el backbone de lenguaje.
- Comprension de imagenes y respuesta multimodal texto-imagen (pipeline image-text-to-text).
- Procesamiento de contexto muy largo: hasta 1M tokens, con atencion sparse selectiva y SWA.
- Decodificacion especulativa integrada mediante DFly2, con coste constante en contexto largo.
- Capacidad de fine-tuning: al ser una variante `base`, esta pensada como base para ajuste posterior.
- Soporte de API compatible con OpenAI (endpoints_compatible) segun los tags del repositorio.
- Capacidades de codigo y agente: el modelo evalua BPB en validacion interna de codigo y agente, lo que sugiere entrenamiento orientado a esos dominios (resultados no mostrados en la informacion disponible).
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Analisis de documentos extensos con imagenes: el modelo puede procesar manuales, informes o expedientes de hasta 1M tokens que incluyan figuras y diagramas, combinando vision encoder y contexto largo en una sola pasada.
- Fine-tuning para dominios verticales: al ser una variante pretrained, sirve como base para ajustar modelos especializados (legal, medico, financiero) sin partir de cero, aprovechando los 219B parametros con solo ~12B activos por token.
- Procesamiento de codigo en repositorios grandes: con 1M de contexto puede ingerir repositorios completos o multiples ficheros y sus tests para tareas de revision, refactorizacion o generacion, y la evaluacion BPB interna en codigo y agente apunta a ese uso.
- Pipelines de agentes multi-paso: la ventana de 1M tokens permite mantener historiales largos de herramientas y observaciones sin truncar, y DFly2 reduce la latencia de decodificacion en esas sesiones largas.
- Atencion al cliente multimodal: gestion de conversaciones multi-turno con capturas de pantalla o fotos adjuntas, manteniendo el historial completo dentro del contexto.
- Extraccion de informacion de documentos escaneados: combinacion de OCR implicito (vision) y razonamiento sobre texto para poblar bases de datos estructuradas a partir de facturas, formularios o contratos.
- Generacion asistida sobre catalogos de imagenes: descripcion, etiquetado y razonamiento sobre lotes de imagenes con contexto textual asociado.

## Benchmarks y rendimiento

La model card menciona resultados de bits-per-byte (BPB) en validacion interna de codigo y agente, y un apendice de benchmarks, pero los valores numericos no estan incluidos en la informacion proporcionada (la seccion aparece truncada). No se han publicado resultados numericos de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia de orden de magnitud, los pesos en safetensors ocupan 438,8 GB en el repositorio; en BF16 los 219,4B parametros requieren del orden de 440 GB de memoria, por lo que la inferencia en precision completa exige multiples GPUs.
- Cuantizaciones de menor precision (p. ej. GGUF de 4 bits) reducen el requisito a decenas de GB, pero no se dispone de cifras oficiales en la informacion proporcionada.
- GPU recomendadas: no especificadas. Por tamano, el despliegue en BF16 requiere nodos multi-GPU tipo H100/H200 o A100; no se confirma compatibilidad con GPUs de consumo en precision completa.
- Opciones de despliegue documentadas en la model card: Transformers, vLLM, SGLang, API compatible con OpenAI, DFly2 para decodificacion especulativa y un repositorio GGUF de terceros (AngelSlim/Hy4-flash-GGUF) para llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos por token | Contexto | Modalidad | Licencia |
|---|---|---|---|---|---|
| Hy4-flash-base (Tencent) | 219,4B | ~11,7B (texto + vision) | 1M | Texto + imagen | Tencent Hy License |
| Hy4 (Tencent) | No disponible en la informacion | No disponible | No disponible | No disponible | Tencent Hy License |
| Alternativas MoE abiertas de tamano similar | No disponible | No disponible | No disponible | No disponible | No disponible |

La informacion proporcionada solo permite comparar con Hy4 (modelo predecesor de la misma familia), del que se citan cambios arquitectonicos pero no especificaciones numericas. No se dispone de datos de benchmarks para establecer comparaciones de rendimiento con otros modelos.

## Limitaciones y advertencias

- Es una variante `base` (pretrained): no esta alineada para seguir instrucciones ni para conversacion segura; requiere fine-tuning antes de uso en produccion.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se documentan tasas ni mitigaciones en la informacion disponible.
- Sesgos: no se documentan sesgos conocidos ni evaluaciones de seguridad en la informacion proporcionada.
- Idiomas soportados no declarados; el comportamiento multilingue no esta garantizado fuera de los idiomas de entrenamiento (no especificados).
- La licencia Tencent Hy License es una licencia propia distinta de las licencias open source estandar; es necesario revisar sus terminos (restricciones de uso comercial, atribucion, etc.) en el fichero LICENSE antes de desplegar.
- El contexto de 1M tokens no implica calidad uniforme en toda la ventana; la atencion sparse selecciona hasta 2.048 tokens por grupo y la SWA usa ventana de 512, lo que puede afectar al recuerdo de informacion muy distante.
- El repositorio pesa 438,8 GB, lo que exige infraestructura de almacenamiento y despliegue considerable.
- No se dispone de datos oficiales de benchmarks, latencia ni throughput para dimensionar un despliegue en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/tencent/Hy4-flash-base
- Version instruct (referenciada en la model card): https://huggingface.co/tencent/Hy4-flash
- Web oficial: https://hy.tencent.ai/research/hy4-flash
- GitHub: https://github.com/Tencent-Hunyuan/Hy4-flash
- GGUF (terceros): https://huggingface.co/AngelSlim/Hy4-flash-GGUF
- ModelScope: https://modelscope.cn/models/Tencent-Hunyuan/Hy4-flash
- AtomGit: https://ai.gitcode.com/tencent_hunyuan/Hy4-flash
- Licencia: https://huggingface.co/tencent/Hy4-flash-base/blob/main/LICENSE
- README en chino: https://huggingface.co/tencent/Hy4-flash-base/blob/main/README_CN.md
