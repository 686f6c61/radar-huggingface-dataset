# taobao-mnn/MNN-Pocket-0.3B

## Resumen

MNN-Pocket-0.3B es un modelo de lenguaje compacto de aproximadamente 300 millones de parámetros desarrollado por el equipo taobao-mnn (Alibaba), diseñado conjuntamente con la pila de inferencia MNN para despliegue en dispositivo (on-device). Se trata de la variante de propósito general afinada por instrucciones de la familia MNN-Pocket, construida sobre una arquitectura tipo Qwen3 con 28 capas, tamaño oculto 896, atención GQA con 14 cabezas de consulta y 2 cabezas KV (head_dim 64), y FFN de 2560 con activación SiLU.

El modelo resuelve el problema de ejecutar asistentes conversacionales y extracción de datos en hardware de borde con recursos muy limitados: su build INT4 (W4A16) cuantizado con QAT ocupa solo 173 MB y alcanza hasta 466 tokens/s en decodificación sobre un iPad Pro M5 con Metal, por encima del objetivo de 200 tok/s para tiempo real. Soporta hasta 32K tokens de contexto en despliegue (40.960 posiciones en la arquitectura) y un vocabulario de 65.536 entradas con embeddings atados.

Es relevante ahora porque demuestra que un modelo bilingüe (chino e inglés) de menos de 500M de parámetros puede superar en promedio a varios baseline de ~500M en 11 benchmarks zh/en (media de 50,00), manteniendo un footprint apto para móviles, tabletas y dispositivos integrados. La licencia Apache 2.0 y la disponibilidad de pesos en safetensors, GGUF y MNN facilitan su integración en productos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Qwen3, GQA (14 cabezas de consulta, 2 KV), FFN SiLU, embeddings atados |
| Parametros totales | 361.551.232 (≈300M según model card) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 40.960 posiciones en arquitectura; 32K soportados en despliegue |
| Tipos de cuantizacion | BF16 nativo; INT4 W4A16 (bloque 64, QAT) en build MNN; GGUF F16, Q8_0 y Q4_1 |
| Idiomas soportados | Chino (zh), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (Transformers), GGUF (llama.cpp), MNN (runtime on-device) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer decoder-only de 28 capas con tamaño oculto 896, 14 cabezas de atención y GQA con solo 2 cabezas KV (head_dim 64), lo que reduce drásticamente el coste de caché KV en inferencia. La FFN intermedia es de 2560 con activación SiLU, el vocabulario es de 65.536 tokens y los embeddings de entrada y salida están atados. La precisión nativa es bfloat16 y existe una variante INT4 W4A16 con cuantización consciente del entrenamiento (QAT) y bloques de 64, empaquetada para el runtime MNN.

El proceso de entrenamiento parte de un modelo base preentrenado (MNN-Pocket-0.3B-Base), seguido de una etapa de SFT (MNN-Pocket-0.3B-SFT, publicada como checkpoint intermedio para investigación y ablación) y una etapa final de ajuste por instrucciones que da lugar al modelo aquí descrito. La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO; esa información no está disponible en la documentación proporcionada. Como innovación destacable, la familia incluye una variante no autorregresiva (MNN-Pocket-0.3B-Dec) con adaptador LoRA y cabeza pointer que responde en un único forward pass, y el diseño está co-optimizado con el runtime MNN para decodificación de baja latencia en Metal y otras plataformas de borde.

## Capacidades

- Generación de texto conversacional multi-turno con formato ChatML (tokens im_start/im_end) y plantilla disponible en `chat_template.jinja`.
- Razonamiento ligero y respuesta a instrucciones en chino e inglés.
- Extracción de datos estructurados y tareas de clasificación o etiquetado de texto.
- Soporte de pipelines agénticos ligeros (la model card menciona "lightweight agentic pipelines").
- Capacidad bilingüe equilibrada: mejor media (50,00) en 11 benchmarks zh/en entre modelos de ~300M.
- Inferencia on-device de alta velocidad: hasta 466 tok/s en decodificación sobre iPad Pro M5 con Metal.
- Contexto largo de hasta 32K tokens en despliegue.
- No se documenta soporte explícito de tool calling/function calling, visión, audio ni modo de razonamiento extendido (thinking mode); no disponible.

## Casos de uso

- Asistentes on-device en móviles y tabletas: el build INT4 de 173 MB y los 466 tok/s permiten conversaciones fluidas en tiempo real sin conexión, con contexto de hasta 32K tokens para mantener historial de sesión.
- Extracción de datos en el dispositivo: convertir texto libre (correos, notas, formularios) en campos estructurados localmente, evitando enviar datos sensibles a la nube y aprovechando el bajo coste de memoria.
- Autocompletado y corrección de texto en teclados inteligentes: la latencia inferior a 5 ms por token en hardware de gama alta permite sugerencias predictivas en escritura bilingüe zh/en.
- Pipelines agénticos ligeros en el borde: orquestación de pasos simples (resumir, clasificar, decidir siguiente acción) en dispositivos con recursos limitados, donde modelos mayores no caben.
- Atención al cliente embebida en aplicaciones: respuestas multi-turno con contexto largo para FAQ y enrutamiento básico, ejecutándose localmente para reducir costes de API y latencia de red.
- Procesamiento por lotes en CPU/GPU de gama baja: con GGUF Q4_1 o Q8_0 en llama.cpp puede desplegarse en servidores modestos para tareas de etiquetado o generación masiva de texto corto.
- Prototipado e investigación de modelos pequeños: la publicación del base, SFT y variante Dec facilita experimentos de ablación y ajuste fino con recursos mínimos.

## Benchmarks y rendimiento

La model card indica que MNN-Pocket-0.3B obtiene la mejor media (50,00) en 11 benchmarks zh/en entre modelos de ~300M, superando varios baseline de ~500M, pero no se incluye la tabla desglosada por benchmark (MMLU, HumanEval, GSM8K, etc.) en la información proporcionada.

| Benchmark | MNN-Pocket-0.3B | Baseline ~500M |
|---|---|---|
| Media en 11 benchmarks zh/en | 50,00 | inferior según model card (sin cifras) |
| Decodificación en iPad Pro M5 (Metal) | hasta 466 tok/s | no disponible |

No se han publicado resultados de benchmarks desglosados en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~0,7 GB en BF16 (361M parámetros × 2 bytes), ~0,2 GB en INT4 W4A16 (build MNN de 173 MB).
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU y en GPUs integradas. En entornos de servidor puede ejecutarse en cualquier GPU con al menos 1 GB de memoria libre (RTX 4090, A100, H100 sobran para este tamaño).
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna e incluso en iGPUs y NPUs móviles; el build INT4 está pensado para tabletas y smartphones (demo en iPhone 18 Pro e iPad Pro M5).
- Opciones de despliegue: runtime MNN (build oficial INT4), llama.cpp con los GGUF publicados, Transformers con safetensors en BF16, y exportación propia con `llmexport` a otras precisiones.
- Latencia y throughput: hasta 466 tok/s de decodificación en iPad Pro M5 (Metal), por encima del objetivo de 200 tok/s en tiempo real. No se proporcionan cifras de throughput en otras plataformas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| MNN-Pocket-0.3B | ~300M (361M reales) | 32K en despliegue | zh, en | Apache 2.0 | Media 50,00 en 11 benchmarks zh/en; 466 tok/s en iPad Pro M5 |
| Baseline ~500M (sin especificar) | ~500M | no disponible | no disponible | no disponible | Superado por MNN-Pocket-0.3B en media según model card |
| MNN-Pocket-0.3B-Base | ~300M | 32K | zh, en | Apache 2.0 | Modelo base para ajuste fino |
| MNN-Pocket-0.3B-Dec | ~300M | no disponible | zh, en | Apache 2.0 | Variante no autorregresiva con LoRA y pointer head |

No se dispone de datos detallados de modelos comparables de otros fabricantes en la información proporcionada; la comparativa se limita a las variantes de la propia familia y a los baseline genéricos de ~500M citados en la model card.

## Limitaciones y advertencias

- No recomendado para cargas con razonamiento intensivo: matemáticas avanzadas o generación de código de horizonte largo quedan fuera de su alcance según el propio autor.
- Riesgo de alucinación elevado por su tamaño reducido; conviene validar salidas en aplicaciones críticas.
- Cobertura lingüística limitada a chino e inglés; el rendimiento en otros idiomas no está garantizado.
- Contexto efectivo de 32K en despliegue, aunque la arquitectura soporte 40.960 posiciones; la calidad en contextos muy largos no está documentada.
- No se documentan sesgos específicos ni evaluaciones de seguridad; se desconoce el filtrado del dataset de entrenamiento.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías; verificar cumplimiento en productos regulados.
- El rendimiento óptimo depende del runtime MNN y del build INT4 QAT; otras rutas (Transformers en BF16, llama.cpp) pueden ofrecer menor throughput.
- No se documenta soporte de tool calling ni de agentes complejos; los pipelines agénticos deben ser simples y supervisados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/taobao-mnn/MNN-Pocket-0.3B
- Modelo base: https://huggingface.co/taobao-mnn/MNN-Pocket-0.3B-Base
- Checkpoint SFT: https://huggingface.co/taobao-mnn/MNN-Pocket-0.3B-SFT
- Build GGUF: https://huggingface.co/taobao-mnn/MNN-Pocket-0.3B-GGUF
- Build MNN INT4: https://huggingface.co/taobao-mnn/MNN-Pocket-0.3B-MNN
- Variante Dec (no autorregresiva): https://huggingface.co/taobao-mnn/MNN-Pocket-0.3B-Dec
- Colección MNN-Pocket: https://huggingface.co/collections/taobao-mnn/mnn-pocket-03b
- Repositorio MNN en GitHub: https://github.com/alibaba/MNN
- Documentación MNN-LLM: https://github.com/alibaba/MNN/blob/master/transformers/README.md
- Informe técnico (arXiv): https://arxiv.org/pdf/2611.12311
- Demo en vídeo: https://huggingface.co/taobao-mnn/MNN-Pocket-0.3B/resolve/main/assets/demo.mp4
