# TitledCube/Arka-L1-1B

## Resumen

Arka-L1-1B es un modelo de lenguaje publicado en HuggingFace por el usuario TitledCube. La model card del repositorio describe un modelo denominado internamente L1-Small-340M-Instruct, un transformer decoder-only de 24 capas y 353.503.232 parametros (353,5 millones), escala equivalente a GPT-2 Medium, entrenado integramente desde cero sobre una unica GPU de consumo (NVIDIA RTX 3050 Laptop de 6 GB con 14 GB de RAM de sistema). Existe una discrepancia entre el nombre del repositorio (Arka-L1-1B, que sugiere mil millones de parametros) y las especificaciones declaradas en la model card (353,5 millones); no se dispone de informacion adicional que la resuelva.

El modelo se presenta como una referencia tecnica de entrenamiento en hardware restringido: preentrenamiento sobre Wikitext-103 con un optimizador Muon para matrices 2D y AdamW en CPU para parametros 1D, seguido de un ajuste supervisado sobre el dataset Stanford Alpaca (52.002 pares instruccion-respuesta). Su ventana de contexto es de solo 512 tokens y emplea el tokenizador BPE de GPT-2 con 50.257 entradas.

Su relevancia es fundamentalmente metodologica y educativa: demuestra que es posible preentrenar y ajustar un modelo de 353 millones de parametros con cuantizacion INT8 e INT4 en una GPU de portatil de gama de entrada, con un pico de VRAM de 3.026 MB. No se han publicado resultados de benchmarks, el repositorio no declara licencia ni idiomas en sus metadatos y el modelo requiere codigo propio (paquete weakgpu) en lugar de la API estandar de transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de 24 capas (escala GPT-2 Medium) |
| Parametros totales | 353.503.232 (353,5 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | BF16 nativo, INT8 empaquetado, INT4 empaquetado (nibbles) |
| Idiomas soportados | No disponible en los metadatos; los datos de entrenamiento (Wikitext-103 y Alpaca) son en ingles |
| Licencia | La model card declara Arka Community License 1.0 (uso no comercial gratuito, uso comercial con atribucion "Used Arka Engine"); los metadatos de HuggingFace no declaran licencia |
| Formato de pesos | Checkpoint PyTorch `.pt` (state_dict en bfloat16); no se ofrecen safetensors ni GGUF |
| Tamano de vocabulario | 50.257 (tokenizador BPE, compatible con GPT-2) |
| Dimension oculta (d_model) | 1.024 |
| Cabezas de atencion | 16 cabezas Q y 16 cabezas KV (atencion multi-cabeza estandar) |
| Dimension FFN | 4.096 |
| Normalizacion | RMSNorm pre-capa (epsilon = 1e-5) |
| Posicional | RoPE (Rotary Positional Embedding) |
| Activacion | GELU |
| Embeddings atados | Si (`tie_word_embeddings = true`) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only convencional de 24 bloques, con d_model de 1.024, 16 cabezas de atencion (sin Grouped Query Attention: n_kv_heads = n_heads = 16), FFN de 4.096 unidades con activacion GELU, RMSNorm pre-capa con epsilon 1e-5 y embeddings posicionales rotatorios (RoPE). Los embeddings de token y la cabeza LM comparten pesos. La innovacion declarada no esta en la arquitectura, sino en la metodologia de entrenamiento: el autor afirma haber completado preentrenamiento y ajuste instruccional sin degradacion matematica (Delta Q = 0) en una GPU de portatil con 6 GB de VRAM.

El preentrenamiento uso el corpus Wikitext-103 Raw (articulos autenticos de Wikipedia). El entrenamiento emplea un componente denominado `UniversalWeakGPUTrainer` con dos optimizadores: Muon sobre todas las matrices de parametros 2D (con ortogonalizacion de Newton-Schulz quintica de 5 pasos y tasa de aprendizaje de 0,02) y AdamW en CPU sobre parametros 1D de normalizacion y embeddings (tasa de 3e-4). La perdida de entropia cruzada se calcula de forma troceada (chunked cross-entropy) con resta de objetivos mediante `scatter_add_` en memoria, lo que segun el autor ahorra el 95 por ciento de la memoria de logits del vocabulario. El rendimiento declarado es de aproximadamente 1.054 tokens por segundo en la GPU de portatil, con un pico de VRAM de 3.026 MB.

El ajuste supervisado (SFT) se realizo sobre Stanford Alpaca, con 52.002 pares instruccion-respuesta, en un formato textual fijo con las marcas `### Instruction:` y `### Response:`. El enmascaramiento de perdida es causal y estricto sobre los tokens de instruccion del usuario (`ignore_index = -100`), de modo que solo se penaliza la generacion de la respuesta del asistente. No se menciona en la informacion disponible el uso de RLHF, DPO u otras tecnicas de alineacion posteriores al SFT, ni el numero total de tokens de preentrenamiento.

## Capacidades

- Generacion de texto en ingles: el modelo esta ajustado para seguir instrucciones en el formato Alpaca (`### Instruction:` / `### Response:`).
- Respuestas a instrucciones simples y tareas cortas de escritura, dada su escala de 353 millones de parametros y su contexto de 512 tokens.
- Capacidad limitada de conocimiento factual, derivada del corpus Wikitext-103 (Wikipedia) y de Alpaca.
- Inferencia en precision bfloat16 nativa, con variantes cuantizadas a INT8 e INT4 empaquetado para entornos de muy baja VRAM.
- Ejecucion en GPU de consumo: verificado en RTX 3050 Laptop de 6 GB con 14 GB de RAM.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles; el entrenamiento documentado es exclusivamente en ingles.
- Capacidades especiales (modo thinking, vision, audio): no disponibles en la informacion proporcionada.

## Casos de uso

- Experimentacion docente en entrenamiento de LLM: el modelo sirve como caso de estudio reproducible de preentrenamiento y SFT completos en una RTX 3050 de 6 GB, con pico de VRAM documentado de 3.026 MB y throughput de ~1.054 tokens/s.
- Prototipado de asistentes de instrucciones en ingles: con el formato Alpaca y una ventana de 512 tokens, encaja en demos de respuesta a instrucciones cortas (resumir un parrafo, reformular una frase, generar listas).
- Validacion de pipelines de cuantizacion: sus tres variantes (BF16 de 675 MB, INT8 de 354 MB, INT4 de 177 MB) permiten comparar perdida de calidad y consumo de VRAM en un mismo modelo sin depender de herramientas externas.
- Investigacion sobre optimizadores: la combinacion documentada de Muon para matrices 2D y AdamW en CPU para parametros 1D es replicable y contrastable con AdamW puro en el mismo corpus.
- Pruebas de integracion de codigo propio: util para equipos que quieran evaluar el paquete `weakgpu` y la clase `CustomLLM` antes de adoptarlos en proyectos mayores.
- Generacion de texto de bajo coste en hardware heredado: con el checkpoint INT4 (177 MB, ~0,4 GB de VRAM) puede ejecutarse en GPUs integradas o equipos de bajas prestaciones que no admiten modelos de miles de millones de parametros.
- Base para fine-tuning especifico de dominio: al ser un modelo pequeno con embeddings atados, el ajuste sobre corpus reducidos cabe en presupuestos de VRAM muy ajustados, siempre que el dominio sea en ingles y las secuencias no superen los 512 tokens.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta metricas de eficiencia de entrenamiento (throughput de ~1.054 tokens/s y pico de 3.026 MB de VRAM), no metricas de calidad (MMLU, HumanEval, GSM8K u otras).

## Requisitos de hardware

- VRAM estimada para inferencia, segun el propio modelo: ~1,5 GB en BF16, ~0,8 GB en INT8 y ~0,4 GB en INT4.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para BF16; el autor verifico el entrenamiento y la inferencia en una NVIDIA RTX 3050 Laptop de 6 GB. GPU de gama alta (A100, H100, RTX 4090) no son necesarias y no aportan ventaja relevante a esta escala.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU dedicada moderna e incluso en GPUs integradas con la variante INT4 de 177 MB. El hardware de referencia declarado es RTX 3050 Laptop 6 GB, Intel Core 5 210H y 14 GB de RAM.
- Opciones de despliegue: no se documenta soporte para vLLM, llama.cpp, Ollama, TGI ni servidores compatibles con la API de transformers. La ejecucion requiere el paquete propio `weakgpu`, la clase `CustomLLM` y los scripts `demo/chat.py` y `demo/quantize.py`, cargando el checkpoint `.pt` con `torch.load`.
- Latencia y throughput estimados: ~1.054 tokens/s durante el entrenamiento en la RTX 3050 Laptop; no se publican cifras de latencia o throughput en inferencia.
- Memoria de sistema: 14 GB de RAM en el equipo de referencia, con parte del optimizador (AdamW) ejecutandose en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Arka-L1-1B (L1-Small-340M-Instruct) | 353,5 M | 512 tokens | Transformer decoder-only, 24 capas, RoPE, RMSNorm | Arka Community License 1.0 segun model card; sin licencia en metadatos de HF | HuggingFace, requiere codigo propio (`weakgpu`) |
| GPT-2 Medium | 355 M | 1.024 tokens | Transformer decoder-only, 24 capas, embeddings aprendidos, LayerNorm | Licencia de OpenAI (MIT modificada) | Integrado en transformers y ecosistema estandar |
| GPT-2 Small | 124 M | 1.024 tokens | Transformer decoder-only, 12 capas | Licencia de OpenAI (MIT modificada) | Integrado en transformers y ecosistema estandar |
| Pythia-410M | 410 M | 2.048 tokens | Transformer decoder-only con RoPE | Apache 2.0 | HuggingFace, integrado en transformers |

No se dispone de datos de benchmarks comparativos entre estos modelos y Arka-L1-1B en la informacion proporcionada; la comparativa se limita a parametros, contexto y licencia. La model card situa explicitamente al modelo en la escala de GPT-2 Medium, del que hereda tambien el tokenizador (50.257 tokens BPE).

## Limitaciones y advertencias

- Discrepancia de nomenclatura: el repositorio se llama Arka-L1-1B (sugiere 1.000 millones de parametros) pero la model card describe 353,5 millones. Conviene verificar el contenido real de los pesos antes de cualquier uso.
- Contexto muy corto: 512 tokens. No es adecuado para documentos largos, conversaciones multi-turno extensas ni tareas de resumen de articulos completos.
- Riesgo elevado de alucinacion: con 353,5 millones de parametros y preentrenamiento sobre un unico corpus (Wikitext-103), la cobertura factual es muy limitada y no hay evidencia de mitigacion mediante RLHF o DPO.
- Rendimiento esperado bajo en razonamiento, matematicas y generacion de codigo: el SFT se realizo solo sobre Alpaca, sin datos especializados de codigo o razonamiento verificable.
- Idioma: el entrenamiento documentado es exclusivamente en ingles; el comportamiento en castellano no esta evaluado y previsiblemente sera deficiente.
- Sesgos: no hay documentacion de analisis de sesgos ni de composicion demografica del corpus mas alla de "articulos autenticos de Wikipedia" (Wikitext-103) y Stanford Alpaca.
- Licencia ambigua: la model card menciona la Arka Community License 1.0, que permite uso comercial con la atribucion "Used Arka Engine", pero los metadatos de HuggingFace no declaran licencia alguna. Es imprescindible aclarar este punto antes de un uso en produccion.
- Sin integracion estandar: requiere cargar codigo propio del autor (`weakgpu.config`, `weakgpu.models.custom_llm`, `torch.load` de un state_dict) y no ofrece safetensors ni GGUF, lo que impide su uso directo en vLLM, llama.cpp, Ollama o TGI. Esto implica riesgos de seguridad al ejecutar codigo de terceros y dificulta la reproducibilidad.
- Repositorio sin traccion: 0 descargas y 0 "likes" en el momento de la consulta, sin pipeline ni idiomas declarados; no hay evidencia de validacion externa.
- Sin benchmarks publicados: no es posible comparar su calidad con alternativas de la misma escala mediante datos objetivos.
- Fechas de publicacion inusuales: el repositorio figura creado y actualizado en octubre de 2026, lo que puede indicar metadatos erroneos o manipulados.

## Enlaces

- HuggingFace: https://huggingface.co/TitledCube/Arka-L1-1B
- Repositorio posiblemente relacionado (no confirmado como el mismo modelo): https://huggingface.co/monodox/arka-1-1b
- Sitio de ARKA-AI (enrutador de modelos; no confirmado como relacionado con este modelo): https://arka-ai.com/
- Repositorio en GitHub de ARKA AI (consola de meteorologia espacial; no confirmado como relacionado con este modelo): https://github.com/HSVM-exe/arka-ai
- Paper, blog o demo oficial del modelo: no disponible
- Resultados de benchmarks: no disponible
