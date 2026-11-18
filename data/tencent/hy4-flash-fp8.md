# tencent/Hy4-flash-FP8

## Resumen

Hy4-flash-FP8 es la versión cuantizada en FP8 de Hy4 flash, el modelo multimodal de lenguaje y visión más orientado a coste de Tencent Hunyuan. Se trata de un transformer de mezcla de expertos (MoE) con 220.260.270.502 parámetros totales en safetensors, de los cuales solo 12B se activan por token (11,3B de texto más 0,43B de visión), e incluye 63,5B de parámetros Engram (representaciones de bigramas y trigramas recuperadas por hash) y un modelo borrador DFly2 de 0,85B para decodificación especulativa. Acepta nativamente entradas de texto e imagen, genera texto y soporta una ventana de contexto de hasta 1M tokens (1.048.576).

El modelo resuelve el problema de servir capacidades multimodales de gran escala con un coste de inferencia bajo y casi constante: la activación dispersa de 16 de 512 expertos enrutados por token, el espacio latente de los expertos (LatentMoE) y la atención híbrida (atención dispersa IndexPool intercalada con ventana deslizante en proporción 1:3) reducen el coste por token frente a un modelo denso equivalente. La versión FP8 reduce además el peso en memoria del repositorio de 287,1 GB, lo que facilita el despliegue en infraestructura con GPU de 80 GB.

Es relevante ahora porque combina tres innovaciones arquitectónicas respecto a Hy4 (atención híbrida, LatentMoE y embeddings N-gram Engram) con un contexto de 1M tokens y decodificación especulativa de coste constante, apuntando a cargas de trabajo de agentes y razonamiento multi-paso sobre documentos e imágenes largos. La licencia es propietaria (tencent-hy-license), no open source en sentido estricto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) multimodal, backbone de 42 capas (1 densa + 41 MoE), atención híbrida (IndexPool + SWA), MLA, iHC, Engram |
| Parametros totales | 220.260.270.502 (155,5B sin Engram, ViT ni DFly2; 63,5B Engram; 0,43B ViT; 0,85B DFly2) |
| Parametros activos | 12B por token (texto 11,3B + visión 0,43B); 16 de 512 expertos enrutados + 1 experto compartido |
| Longitud de contexto | 1M (1.048.576 tokens) |
| Tipos de cuantizacion | FP8 (esta versión); existe versión GGUF publicada por terceros (AngelSlim/Hy4-flash-GGUF) |
| Idiomas soportados | no disponible |
| Licencia | tencent-hy-license (propietaria, license_name: other) |
| Formato de pesos | safetensors (transformers); GGUF disponible en repo separado |

## Arquitectura y entrenamiento

El backbone lingüístico tiene 42 capas: una capa densa con FFN de tamaño intermedio 13.824 y 41 capas MoE. Cada capa MoE dispone de 512 expertos enrutados y un experto compartido; por token se activan 16 expertos enrutados que operan en un espacio latente de dimensión 1.536 (LatentMoE), con tamaño intermedio de experto también de 1.536. El tamaño oculto del backbone es 3.072, el vocabulario 120.832 y las conexiones residuales usan iHC (identity Hyper-Connections) con 4 flujos residuales.

La atención es híbrida con formulación Multi-head Latent Attention (MLA): el patrón de capas es 2 dispersas seguidas de 10 bloques de (3 SWA + 1 dispersa), resultando en 12 capas dispersas y 30 capas SWA. Las capas dispersas usan 32 cabezas, q_lora_rank y kv_lora_rank de 1.024 y 512, dimensión de cabeza QK de 192 + 64 y RoPE base 10.000.000, con selección de contexto disperso de hasta 2.048 tokens mediante selección a nivel de grupo. Las capas SWA usan 64 cabezas, los mismos rangos LoRA, RoPE base 10.000 y una ventana causal de 512 tokens (511 previos más el actual). La codificación posicional multimodal es MRoPE intercalado.

El módulo Engram añade representaciones aprendidas de bigramas y trigramas mediante búsquedas hash multi-cabeza: 8 cabezas por orden de n-grama, vocabulario hash de 10,3M por cabeza, dimensión de embedding de 768 por orden (8 cabezas × 96) y una tabla de 63,4B parámetros, inyectada en las capas 1, 11, 21 y 31. El codificador visual es una adaptación de SigLIP2-So400m-Patch16-Res512 con 27 capas, tamaño oculto 1.152, intermedio 4.304, 16 cabezas de atención, parches de 16 × 16, embedding posicional de 128 × 128 y fusión de características visuales 2 × 2, conectado al backbone mediante un proyector MLP. El borrador DFly2 (5 capas, 0,85B) reutiliza la caché KV y los índices dispersos del modelo objetivo para decodificación especulativa de contexto largo a coste bajo y constante.

No se dispone en la información proporcionada del número de tokens de entrenamiento, la composición del dataset ni los detalles de RLHF/DPO. La model card menciona resultados de bits-per-byte (BPB) en validación interna de código y agentes, pero los valores concretos no aparecen en el extracto disponible.

## Capacidades

- Generación de texto y razonamiento sobre contextos de hasta 1M tokens.
- Entrada multimodal nativa de texto e imagen (pipeline image-text-to-text), con codificador SigLIP2 y MRoPE intercalado.
- Modo instruct y conversacional, con soporte de diálogo multi-turno.
- Decodificación especulativa mediante el borrador DFly2 integrado, con coste constante en contexto largo.
- Capacidades de código y agentes evaluadas internamente mediante BPB en validación de código y agentes.
- Compatibilidad con endpoints (tag endpoints_compatible) y API compatible con OpenAI.
- Soporte de despliegue en vLLM y SGLang, y cuantización adicional.
- Capacidades multilingües: no disponible (los idiomas no están listados en la información proporcionada).

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo gracias a su ventana de 1M tokens, manteniendo el historial completo de la conversación sin truncamiento.
- Análisis de documentos e imágenes largos: al aceptar texto e imagen de forma nativa, puede procesar informes escaneados, capturas y diagramas junto con el texto asociado en una única pasada.
- Agentes de razonamiento multi-paso: la combinación de tool calling vía API compatible con OpenAI y contexto de 1M tokens permite cadenas de agentes que acumulan observaciones y resultados intermedios.
- Generación de código en producción: se puede integrar en pipelines de CI/CD a través de vLLM o SGLang, con la versión FP8 reduciendo el coste de memoria por réplica.
- Servicio de inferencia con coste controlado: los 12B parámetros activos por token y la decodificación especulativa DFly2 permiten servir el modelo con latencia baja y throughput alto en clústeres de GPU de 80 GB.
- Procesamiento de bases de conocimiento visuales: indexación y respuesta sobre catálogos de productos, documentación técnica con capturas o material de formación con imágenes.
- Investigación sobre arquitecturas MoE y atención híbrida: el modelo sirve como referencia para estudiar LatentMoE, Engram e iHC en cargas de contexto largo.

## Benchmarks y rendimiento

La model card incluye una sección de resultados de benchmarks (Apéndice) y métricas de BPB en validación interna de código y agentes, pero los valores numéricos no están presentes en la información proporcionada.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 287,1 GB en FP8; se requiere un clúster multi-GPU con al menos 4 GPU de 80 GB para cargar los pesos completos, más espacio para caché KV de contexto largo.
- GPU recomendadas: H100 80 GB y A100 80 GB en configuraciones tensor-parallel; el tamaño del modelo impide el despliegue en una única GPU consumer.
- GPU consumer: no cabe en RTX 4090 (24 GB) ni en tarjetas de 48 GB; solo mediante cuantizaciones GGUF agresivas publicadas por terceros, con degradación esperada.
- Opciones de despliegue: transformers, vLLM, SGLang, API compatible con OpenAI; GGUF disponible en AngelSlim/Hy4-flash-GGUF para llama.cpp/Ollama.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Hy4-flash-FP8 (Tencent) | 220,3B (155,5B sin Engram/ViT/DFly2) | 12B | 1M | tencent-hy-license (propietaria) | safetensors FP8 |
| Hy4 (Tencent) | no disponible en la información | no disponible | no disponible | tencent-hy-license | no disponible |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada solo permite comparar con Hy4, del que se indica que Hy4 flash introduce tres cambios arquitectónicos (atención híbrida, LatentMoE y Engram) pero sin cifras de parámetros ni contexto. No se dispone de datos de otros modelos comparables.

## Limitaciones y advertencias

- Licencia propietaria tencent-hy-license: es necesario revisar el texto de la licencia antes de cualquier uso comercial; no es una licencia open source aprobada por OSI.
- Idiomas soportados no declarados: no se puede garantizar un rendimiento multilingüe fuera de los idiomas evaluados internamente.
- Riesgo de alucinación: no se han publicado evaluaciones de fiabilidad factual en la información disponible.
- Sesgos conocidos: no disponible.
- La ventana de 1M tokens implica un coste de memoria de caché KV elevado; el despliegue requiere planificación de recursos y posiblemente decodificación especulativa para mantener latencia.
- La versión FP8 puede presentar pérdida de precisión frente a los pesos originales; no se han publicado métricas de degradación en la información disponible.
- El modelo incluye parámetros Engram de 63,5B que deben cargarse aunque no se activen por token, aumentando el requisito de memoria frente al recuento de parámetros activos.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta: ecosistema de terceros (GGUF, herramientas) aún incipiente.

## Enlaces

- [Hugging Face: tencent/Hy4-flash-FP8](https://huggingface.co/tencent/Hy4-flash-FP8)
- [Licencia](https://huggingface.co/tencent/Hy4-flash-FP8/blob/main/LICENSE)
- [Hugging Face: tencent/Hy4-flash](https://huggingface.co/tencent/Hy4-flash)
- [ModelScope: Tencent-Hunyuan/Hy4-flash](https://modelscope.cn/models/Tencent-Hunyuan/Hy4-flash)
- [GitCode: tencent_hunyuan/Hy4-flash](https://ai.gitcode.com/tencent_hunyuan/Hy4-flash)
- [Sitio oficial](https://hy.tencent.ai/research/hy4-flash)
- [GitHub: Tencent-Hunyuan/Hy4-flash](https://github.com/Tencent-Hunyuan/Hy4-flash)
- [GGUF: AngelSlim/Hy4-flash-GGUF](https://huggingface.co/AngelSlim/Hy4-flash-GGUF)
- [Tencent](https://www.tencent.com/)
