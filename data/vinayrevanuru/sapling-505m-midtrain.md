# VinayRevanuru/Sapling-505M-Midtrain

## Resumen

Sapling-505M-Midtrain es un checkpoint intermedio de un modelo de lenguaje de 505.483.776 parámetros entrenado desde cero por el desarrollador independiente VinayRevanuru. Se trata de la fase de *mid-training* (o *annealing*) del modelo base Sapling-505M-Base: tras un preentrenamiento de 5.000 millones de tokens, este checkpoint añade 1.000.013.824 tokens adicionales con la tasa de aprendizaje decayendo linealmente hasta cero. El objetivo es doble: reforzar matemáticas y formato conversacional (ChatML) y, al mismo tiempo, limitar el olvido de conocimiento general mediante una repetición (*replay*) de datos de preentrenamiento que el modelo base no había visto.

Arquitectura y escala lo sitúan en la categoría de modelos pequeños: un transformer denso de la familia Qwen3 (`Qwen3ForCausalLM`) con 30 capas, anchura 1.024, FFN de 3.072, GQA con 16 cabezas de consulta y 8 de clave/valor, QK-Norm, RMSNorm, RoPE y SwiGLU. La longitud de contexto es de 2.048 tokens y el vocabulario de 32.768 tokens BPE byte-level, reutilizando dos ranuras reservadas del tokenizador base para `<|im_start|>` y `<|im_end|>` sin redimensionar embeddings.

Su relevancia es metodológica más que de producto: publica una receta completa y reproducible de *annealing* (learning rate, mezcla de datos, replay, estado de AdamW heredado, pérdidas de validación por intervalo) sobre un modelo cuyo entrenamiento cabe en 1,2 horas en 8×H100. El propio autor advierte que no es un chatbot: no termina turnos, no sigue instrucciones y su rendimiento en GSM8K es del 2,0 %. Es una base completamente annealed pensada para fine-tuning posterior (SFT, LoRA, DPO) o para continuación de texto en inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso `Qwen3ForCausalLM` (GQA, QK-Norm, RMSNorm, RoPE, SwiGLU) |
| Parametros totales | 505.483.776 (embeddings atados) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | No disponible (el repositorio solo publica pesos FP32; no se documentan variantes GGUF, AWQ, GPTQ ni bitsandbytes) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors en FP32 (≈2,0 GB de repositorio) |
| Capas / anchura / FFN | 30 / 1.024 / 3.072 |
| Cabezas de atencion | 16 de consulta, 8 de clave/valor, dimension de cabeza 128 |
| Vocabulario | 32.768 BPE byte-level (mismos ids que el modelo base) |
| Tokens especiales de chat | `<|im_start|>` = 3, `<|im_end|>` = 4 (ranuras reservadas renombradas) |
| Modelo base | VinayRevanuru/Sapling-505M-Base |
| Modelo sucesor | VinayRevanuru/Sapling-505M-SFT (SFT sobre este checkpoint, +0,5B tokens) |
| Libreria / pipeline | transformers, text-generation, text-generation-inference, endpoints_compatible |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only denso con las innovaciones habituales de la familia Qwen3: atención con *grouped-query attention* (16 cabezas Q frente a 8 KV, con dimensión de cabeza 128), normalización QK-Norm sobre consultas y claves para estabilizar el entrenamiento, RMSNorm en pre-normalización, embeddings rotatorios RoPE y activación SwiGLU en la FFN. El modelo tiene 30 capas, anchura 1.024 y FFN de 3.072, con los embeddings de entrada y salida atados. La ventana de contexto es de 2.048 tokens, coherente con el régimen de entrenamiento (secuencias de 2.048). El tokenizador es un BPE byte-level de 32.768 tokens idéntico al del modelo base; los tokens de chat ocupan dos ranuras reservadas preexistentes, de modo que no fue necesario redimensionar la matriz de embeddings.

El *mid-training* se inicializa desde el checkpoint del modelo base en el paso 76.300, importando no solo los pesos sino también el estado del optimizador AdamW. Se entrenan 1.000.013.824 tokens en 15.259 pasos con un batch global de 65.536 tokens (32 × 2.048), learning rate con decaimiento lineal de 8e-5 a 0 (el valor en el que había quedado el coseno del run base), AdamW fusionado con β = (0,9; 0,95), weight decay 0,1 y grad clipping 1,0, en BF16 con pesos maestros en FP32. El hardware fueron 8× NVIDIA H100 con PyTorch DDP sobre Modal, a ≈251.000 tokens/s, es decir, aproximadamente 1,2 horas de reloj. La mezcla de datos es un 50 % de FineMath-4+ (páginas web de matemáticas del nivel superior de calidad, decontaminadas contra el test de GSM8K con solapamiento de 13-gramas), un 20 % de SmolTalk en formato ChatML renderizado como texto plano de LM (todos los tokens, sin máscara de SFT) y un 30 % de *replay* de preentrenamiento con shards de FineWeb-Edu y Cosmopedia v2 que el modelo base nunca vio, para contener el olvido catastrófico. Un 0,1 % de cada fuente se reservó por hash determinista como validación, y las conversaciones usadas aquí son disjuntas de las empleadas después en la fase de SFT.

## Capacidades

- Generación de texto en inglés y continuación de documentos: texto web general y, especialmente, texto de matemáticas de estilo expositivo.
- Continuación de problemas matemáticos con formato «Problem: ... / Solution: ...», tal como se muestra en el ejemplo de la model card (sin garantía de corrección del resultado).
- Manejo del formato ChatML a nivel de texto: reconoce `<|im_start|>` y `<|im_end|>` porque los ha visto en el 20 % de SmolTalk, y la plantilla de chat está incluida en el repositorio.
- No soporta *tool calling* ni *function calling*: no hay evidencia en la información disponible y el modelo no está entrenado para ello.
- No soporta agentes ni razonamiento multi-paso de forma fiable: no termina turnos (0 de 50 respuestas emitieron `<|im_end|>`) y tiende a divagar hasta el límite de tokens.
- Capacidades multilingües: no disponibles; solo inglés.
- Sin modo *thinking*, sin visión ni audio.
- Sin identidad enseñada: en 10 sondas de identidad, 0 de 10 dijo llamarse «Sapling».
- No es un modelo de chat: el autor lo describe explícitamente como «no un chatbot», y recomienda muestreo (temperatura 0,7, top-p 0,9, `repetition_penalty` 1,1) porque la decodificación voraz entra en bucles.

## Casos de uso

- Base para fine-tuning supervisado propio: el checkpoint está completamente annealed (LR a cero) y hereda una pérdida de validación baja y estable, por lo que es un punto de partida razonable para SFT con LoRA o DPO sobre dominios concretos en inglés, sin tener que costear un preentrenamiento desde cero.
- Reproducción e investigación de recetas de *annealing*: el repositorio incluye `training_summary.json` con configuración completa, manifiesto de datos e historial de validación, lo que permite estudiar empíricamente el efecto del decaimiento de LR y de la mezcla math/chat/replay sobre el olvido.
- Estudio de olvido catastrófico y *data replay*: al comparar las pérdidas de FineWeb-Edu y Cosmopedia v2 entre el paso 0,2B y 1,0B (de 3,035 a 2,905 y de 1,706 a 2,019 respectivamente), sirve como caso de estudio controlado de cómo el replay mitiga o no la degradación del conocimiento general.
- Generación de texto sintético para curación de datasets: se puede usar como generador barato de continuaciones de páginas matemáticas en inglés a gran escala, aplicando después filtros de calidad o verificadores simbólicos, dado su bajo coste de inferencia (≈1 GB de pesos en FP16).
- Prototipado y validación de infraestructura de despliegue: con 505M de parámetros y una ventana de 2.048 tokens, es adecuado para probar pipelines de vLLM, TGI o transformers, plantillas de chat, tokenización y monitorización antes de escalar a modelos mayores.
- Experimentos de destilación y ablaciones de tamaño: sirve como alumno o como baseline de la familia ~500M para comparar con otros modelos pequeños en tareas de continuación de texto y perplejidad por dominio.
- Fine-tuning para tareas de dominio cerrado con formato fijo (extracción de campos, normalización de problemas matemáticos, generación de soluciones paso a paso) donde el autor controla el formato de salida y no depende de que el modelo cierre el turno por sí mismo.
- Docencia y demostraciones sobre entrenamiento de LLM: la trazabilidad completa (base → midtrain → SFT, con presupuestos de 5B, 6B y 6,5B tokens) lo hace útil como ejemplo didáctico de las distintas fases de un pipeline.

## Benchmarks y rendimiento

Perdida de validacion retenida (nats/token, menor es mejor). Cada valor se mide sobre el 0,1 % de holdout del propio run:

| Tokens de mid-training | FineWeb-Edu | Cosmopedia v2 | FineMath | SmolTalk |
|---|---|---|---|---|
| 0,2B | 3,035 | 1,706 | 2,247 | 1,722 |
| 0,4B | 3,022 | 2,110 | 1,947 | 1,398 |
| 0,6B | 3,013 | 2,104 | 1,936 | 1,322 |
| 0,8B | 2,956 | 2,080 | 1,831 | 1,449 |
| **1,0B (este modelo)** | **2,905** | **2,019** | **1,821** | **1,371** |

Comportamiento en el arnes de chat (muestreo con temperatura 0,7, top-p 0,9, hasta 512 tokens nuevos):

| Comprobacion | Resultado |
|---|---|
| Termina el turno con `<|im_end|>` (50 prompts generales) | 0 % (mediana de 512 tokens, todas agotan el limite) |
| Dice llamarse «Sapling» (10 sondas de identidad) | 0 / 10 |
| Rechaza prompts claramente dainos (30, CoCoNot) | 3 % |
| Rechaza por error prompts inofensivos (30, contraste CoCoNot) | 0 % |
| GSM8K, muestra de 250 problemas, muestreado con extraccion de respuesta | 2,0 % |

No se han publicado resultados de MMLU, HumanEval, HellaSwag ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- Pesos: el repositorio publica FP32 (≈2,0 GB). En BF16/FP16 los pesos ocupan ≈1,0 GB; una cuantizacion de 8 bits quedaria en ≈0,5 GB y una de 4 bits en ≈0,25-0,3 GB, aunque no se publican GGUF ni checkpoints cuantizados oficiales (habria que generarlos con llama.cpp o GPTQ/AWQ).
- Cache KV en FP16 con la ventana completa de 2.048 tokens: 30 capas × 8 cabezas KV × 128 dimensiones × 2 (K y V) × 2 bytes ≈ 240 MB.
- VRAM estimada para inferencia: ≈1,3 GB en FP16 con contexto completo; ≈2,3 GB en FP32; menos de 1 GB con cuantizacion de 4 bits.
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060 12 GB, RTX 4060 Ti 8 GB, RTX 4070, RTX 4090, e incluso en GPUs de 4 GB; tambien es viable en CPU para inferencia por lotes pequenos.
- GPU de datacenter recomendadas para servir en produccion: T4, L4, A10G, L40S o A100/H100 si se comparte con otros modelos; para el entrenamiento original se usaron 8× H100 (DDP sobre Modal).
- Opciones de despliegue: `transformers` (soporte nativo de `Qwen3ForCausalLM`), vLLM (la arquitectura Qwen3 esta soportada), TGI (el repo lleva la etiqueta `text-generation-inference` y `endpoints_compatible`), y llama.cpp/Ollama tras convertir los pesos a GGUF. No hay artefactos GGUF publicados por el autor.
- Latencia y throughput de inferencia: no disponibles. El unico dato de rendimiento publicado es de entrenamiento (≈251.000 tokens/s en 8× H100, 1,2 h para 1.000 millones de tokens).
- Nota de despliegue: al no estar instruido, hay que imponer un limite de tokens y un criterio de parada en el servidor, porque el modelo no emite `<|im_end|>` de forma fiable.

## Comparativa con modelos similares

Los datos de los modelos de terceros provienen de sus fichas publicas y no forman parte de la informacion proporcionada en esta busqueda; se incluyen como referencia orientativa.

| Modelo | Parametros | Contexto | Fase | GSM8K | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Sapling-505M-Midtrain | 505M | 2.048 | Mid-training (annealed), no instruido | 2,0 % (muestra de 250) | Apache 2.0 | HuggingFace, pesos FP32 |
| Sapling-505M-Base | 505M | 2.048 | Preentrenamiento (5B tokens) | No disponible | Apache 2.0 | HuggingFace |
| Sapling-505M-SFT | 505M | 2.048 | SFT (+0,5B tokens), chat | No disponible | Apache 2.0 | HuggingFace |
| Qwen2.5-0.5B | ≈494M | 32.768 | Base e instruct | No disponible en esta ficha | Apache 2.0 | HuggingFace, amplio ecosistema GGUF |
| SmolLM2-360M | ≈362M | 8.192 | Base e instruct | No disponible en esta ficha | Apache 2.0 | HuggingFace, GGUF oficial |

Frente a sus alternativas, la principal desventaja de Sapling-505M-Midtrain es la ventana de contexto (2.048 tokens frente a 8.192-32.768) y la ausencia de version instruct utilizable; la ventaja es la transparencia total de la receta y un coste de entrenamiento documentado de 1,2 horas en 8×H100, lo que lo hace muy reproducible.

## Limitaciones y advertencias

- No esta instruido: no cierra turnos, no sigue formatos, no declina peticiones dainas. El autor reporta 0 % de terminacion con `<|im_end|>` y un 3 % de rechazo ante prompts claramente dainos (es decir, practicamente nula alineacion de seguridad).
- No es factualmente fiable: produce errores fluidos y seguros de si mismo; el ejemplo de la model card afirma que la capital de Australia es Sidney.
- Razonamiento matematico debil pese al 50 % de datos de matemticas: 2,0 % en una muestra de 250 problemas de GSM8K. El descenso de la perdida en FineMath (2,25 → 1,82) no se traduce en acierto en problemas.
- Solo ingles; no hay evidencia de competencia en otros idiomas y el vocabulario esta optimizado para ingles.
- Contexto limitado a 2.048 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- La decodificacion voraz entra en bucles; es necesario usar muestreo (temperatura 0,7, top-p 0,9, `repetition_penalty` 1,1) y un limite duro de tokens.
- Licencia Apache 2.0 sobre los pesos, que permite uso comercial, pero la model card no detalla las licencias de los datasets de entrenamiento (FineMath, SmolTalk, FineWeb-Edu, Cosmopedia v2); conviene verificar sus terminos antes de un despliegue comercial.
- Sesgos: no se han publicado evaluaciones de sesgo, toxidad ni robustez mas alla del arnes CoCoNot; al no tener ajuste de seguridad, cabe esperar que reproduzca sesgos y contenido problematico presente en los datos web.
- Riesgo de alucinacion elevado en un modelo de 505M sin ajuste: no debe usarse como fuente de informacion sin verificacion externa.
- Advertencia de despliegue: no debe exponerse directamente a usuarios finales; requiere capas de moderacion, limites de longitud y un formato de parada impuesto desde el servidor.
- Metadatos llamativos: 0 descargas y 0 likes en el momento de la consulta, y fecha de creacion del 26 de octubre de 2026 segun HuggingFace; se trata de un artefacto de investigacion individual, sin validacion externa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/VinayRevanuru/Sapling-505M-Midtrain
- Modelo base: https://huggingface.co/VinayRevanuru/Sapling-505M-Base
- Modelo SFT sucesor: https://huggingface.co/VinayRevanuru/Sapling-505M-SFT
- Dataset FineMath: https://huggingface.co/datasets/HuggingFaceTB/finemath
- Dataset SmolTalk: https://huggingface.co/datasets/HuggingFaceTB/smoltalk
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset SmolLM corpus (Cosmopedia v2): https://huggingface.co/datasets/HuggingFaceTB/smollm-corpus
- Nota: la busqueda web realizada no devolvio ningun resultado relevante (papers, blogs, repos o demos) sobre este modelo; los unicos resultados fueron sitios no relacionados. No se dispone de paper, blog tecnico ni demo adicional.
