# ViuAI/ViuAI-40M

## Resumen

ViuAI-40M es un modelo de lenguaje de tipo Mixture of Experts (MoE) construido desde cero por ViuAI, con aproximadamente 39,29 millones de parametros totales y 18,06 millones de parametros activos por token. Se trata de un experimento de investigacion que combina tres tecnicas arquitectonicas contemporaneas: Multi-Head Latent Attention (MLA) al estilo de DeepSeek-V4, un MoE de grano fino inspirado en Kimi con 1 experto compartido y 8 enrutados (top-2) por capa, y residuales con Hyper-Connections aprendibles (mHC). El modelo emplea 32 capas con un tamano oculto de solo 256 dimensiones, lo que lo convierte en una arquitectura muy profunda y estrecha.

El modelo esta disenado para generacion de texto bilingue en ingles e hindi, con un vocabulario de 8.192 tokens mediante BPE con preservacion de mayusculas y weight tying. Su ventana de contexto es de 512 tokens, suficiente para tareas de generacion corta pero muy limitada para aplicaciones conversacionales o de recuperacion. El entrenamiento utiliza un optimizador hibrido Muon + AdamW, aplicando Newton-Schulz sobre los pesos 2D ocultos y AdamW sobre embeddings y parametros 1D.

Su relevancia es fundamentalmente investigadora: se publica con licencia Apache 2.0 y permite estudiar el comportamiento de arquitecturas MoE con MLA y Hyper-Connections a una escala minima, reproducible en hardware de consumo. No obstante, al no contar con resultados de benchmarks publicados ni con descargas registradas, no debe considerarse un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con MLA (DeepSeek-V4) y mHC Hyper-Connections |
| Parametros totales | 39.294.208 (~39,29M) |
| Parametros activos | 18.060.544 (~18,06M) por token |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (pesos en FP32/BF16/FP16 segun model card) |
| Idiomas soportados | Ingles (en), hindi (hi) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (checkpoint nativo del paquete `viuai`); no se indica GGUF ni safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer de 32 capas con un tamano oculto de 256 y 8 cabezas de atencion de dimension 32 (optimizadas para Tensor Cores). La atencion emplea Multi-Head Latent Attention (MLA) con `q_lora=96` y `kv_lora=64`, una variante que comprime las proyecciones de query, key y value en un espacio latente para reducir el coste de memoria del KV cache. La capa MoE combina 1 experto compartido con 8 expertos enrutados y seleccion top-2 por token, con una dimension de expansion de 144 y una loss auxiliar de balanceo de carga; la esparsidad computacional declarada es del 54,0%. Los residuales usan mHC (Hyper-Connections) con escalado aprendible.

El vocabulario es de 8.192 tokens con BPE sin perdida de mayusculas y weight tying entre embedding de entrada y proyeccion de salida. El entrenamiento usa un optimizador hibrido: Muon (con iteraciones Newton-Schulz) para los pesos 2D ocultos y AdamW para embeddings y parametros 1D. La model card no especifica el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO; tampoco detalla innovaciones como decodificacion especulativa. El modelo se describe como "from-scratch" y de proposito investigador.

## Capacidades

- Generacion de texto autoregresiva con KV cache para decodificacion incremental.
- Razonamiento secuencial a traves de 32 capas ("32 sequential thinking steps per token" segun el autor).
- Capacidad multilingue limitada a ingles e hindi.
- Soporte de enrutamiento MoE disperso por token (top-2 sobre 8 expertos enrutados mas 1 compartido).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso mas alla de la profundidad de la red.
- No se documenta vision, audio ni modo "thinking" explicito.
- No se documenta capacidad de instrucciones (no hay evidencia de fine-tuning instruct).

## Casos de uso

- Investigacion academica sobre MoE de grano fino: permite reproducir y analizar el comportamiento de enrutamiento top-2 con expertos compartidos en un modelo pequeno, util para estudiar balanceo de carga y esparsidad.
- Estudio de MLA frente a atencion multi-cabeza estandar: al ser un modelo de 40M con MLA, sirve como banco de pruebas para medir ahorro de memoria del KV cache y calidad de representacion latente.
- Experimentacion con Hyper-Connections y optimizador Muon: el modelo permite evaluar residuales mHC y el optimizador hibrido Muon + AdamW en tareas de modelado de lenguaje a escala reducida.
- Generacion de texto corto en ingles o hindi: con 512 tokens de contexto puede emplearse para completar frases, generar titulares o parrafos breves en entornos de prototipado.
- Fine-tuning educativo: su tamano (~75 MB en FP16) permite entrenar y ajustar el modelo en una unica GPU de consumo, ideal para cursos y talleres de arquitecturas MoE.
- Pruebas de infraestructura de inferencia: util para validar pipelines de despliegue (PyTorch nativo, exportacion a otros formatos) antes de escalar a modelos mayores con la misma familia arquitectonica.
- Baseline en comparativas de eficiencia: sirve como referencia de parametros activos frente a modelos densos del mismo tamano para medir el impacto de la esparsidad MoE.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El campo `model-index` del autor declara una entrada para ViuAI-40M con la lista `results` vacia.

## Requisitos de hardware

- VRAM estimada para inferencia: ~150 MB en FP32 y ~75 MB en FP16/BF16 (segun la model card), sin contar overhead del runtime de PyTorch y del KV cache.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre; el modelo cabe holgadamente en GTX 1650, RTX 3050, RTX 4060, RTX 4090, A100 y H100.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna e incluso en CPU para inferencia de baja latencia.
- Opciones de despliegue: el modelo se distribuye como paquete PyTorch nativo (`viuai.model.viuai_model.ViuAIForCausalLM`); no se documenta soporte oficial para vLLM, llama.cpp, Ollama ni TGI. La exportacion a GGUF no esta confirmada.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ViuAI-40M | ~39,29M | ~18,06M | 512 | Apache 2.0 | Hugging Face (0 descargas) |
| TinyLlama-1.1B | 1,1B | 1,1B (denso) | 2.048 | Apache 2.0 | Hugging Face, ampliamente usado |
| SmolLM-135M | 135M | 135M (denso) | 2.048 | Apache 2.0 | Hugging Face |
| Qwen2.5-0.5B | 494M | 494M (denso) | 32.768 | Apache 2.0 | Hugging Face |

No se dispone de benchmarks publicados de ViuAI-40M, por lo que la comparacion se limita a parametros, contexto y licencia. Frente a los modelos densos de la tabla, ViuAI-40M ofrece un contexto mucho menor (512 frente a 2.048 o 32.768) y un tamano notablemente inferior, lo que lo situa en la categoria de modelos de investigacion mas que de uso general.

## Limitaciones y advertencias

- Contexto muy limitado: 512 tokens restringen drasticamente casos de uso conversacionales, RAG o documentos largos.
- Idiomas restringidos: solo ingles e hindi; no se documenta rendimiento en castellano ni en otros idiomas.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad, razonamiento o codigo.
- Riesgo elevado de alucinacion: al ser un modelo de 40M entrenado desde cero, su conocimiento factual es minimo y probablemente inexacto.
- Sin fine-tuning instruct documentado: no se garantiza seguimiento de instrucciones ni formato conversacional.
- Sesgos desconocidos: no se documenta la composicion del dataset de entrenamiento ni analisis de sesgos.
- Licencia Apache 2.0 permite uso comercial, pero la falta de evaluacion hace desaconsejable su despliegue en produccion sin validacion previa.
- Ecosistema de despliegue limitado: no hay soporte confirmado en vLLM, llama.cpp, Ollama o TGI, lo que complica la integracion en infraestructuras existentes.
- Modelo de investigacion: el autor lo etiqueta explicitamente como "research" y "from-scratch"; no debe tratarse como un modelo de proposito general.

## Enlaces

- Hugging Face: https://huggingface.co/ViuAI/ViuAI-40M
- Perfil del autor en Hugging Face: https://huggingface.co/ViuAI
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion disponible.
