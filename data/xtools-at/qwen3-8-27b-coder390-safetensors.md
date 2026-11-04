# xtools-at/Qwen3.8-27B-Coder390-Safetensors

## Resumen

Qwen3.8-27B-Coder390-Safetensors es una versión experimental en safetensors limpios del modelo nerkyor/Qwen3.8-27B-Coder390-EfficientThink-Opus5.5-GPT6Astra-Grok4.7-DSV4Pro-K3-SFT-RLOO-MTP-DFlash2, publicado por el usuario xtools-at. Se trata de un ajuste fino sobre la familia Qwen3.8 de 27B parámetros (27.781.427.952 parámetros reales según los safetensors) que ha pasado por varias rondas de SFT y RLOO sobre una base previamente entrenada con SFT y SimPO. El objetivo declarado es corregir el fallo de parada del modelo original: el modelo ya tiene una respuesta local, pero sigue re-derivando con marcadores tipo "Wait / Actually" hasta agotar el contexto de 94K sin emitir respuesta final.

El repositorio se describe explícitamente como "FOR INTERNAL USE ONLY, WILL BE DELETED SOON" y no registra descargas ni likes en el momento de la consulta. Aun así, el ecosistema de artefactos asociado es amplio: cinco niveles de safetensors (BF16, FP8 estático Block128, NVFP4 W4A16, NVFP4 W4A4 y NVFP4 W4A4-W8A8 mixto), variantes NInfer W4A4, INT4 W4A16, INT8 W8A8, INT8 W8A16 y GGUF (Q2/Q3/Q4 LynnStyle con MTP Q8, Q6_K y Q8_0). El pipeline declarado es image-text-to-text, por lo que el modelo es multimodal (texto e imagen/vídeo) e incluye una cabeza MTP oficial en BF16.

La relevancia actual reside en dos frentes: por un lado, la corrección del comportamiento de razonamiento improductivo en modelos con modo thinking largo, con métricas declaradas de reducción de truncamientos a 94K (de 4 a 1 en GPQA y de 13 a 3 en LCB); por otro, el despliegue con decodificación especulativa mediante DFlash2 o MTP, con velocidades declaradas de aproximadamente 180 tok/s y 91 tok/s por petición respectivamente, frente a unos 46 tok/s sin especulación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) de la familia Qwen3.8; detalles internos de capas y atención no disponibles |
| Parámetros totales | 27.781.427.952 |
| Parámetros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | 94K tokens según el protocolo de evaluación citado en la model card; longitud máxima oficial no disponible |
| Tipos de cuantización | BF16, FP8 estático Block128, NVFP4 W4A16, NVFP4 W4A4, NVFP4 W4A4-W8A8 (mixto), NInfer W4A4 y W4A4-W8A8, INT4 W4A16, INT8 W8A8, INT8 W8A16, GGUF Q2/Q3/Q4 LynnStyle (con MTP Q8), Q6_K, Q8_0 |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (BF16, FP8, NVFP4, INT4, INT8), GGUF |

## Arquitectura y entrenamiento

La model card describe una arquitectura de la familia Qwen3.8 con capacidades multimodales (texto, imagen y vídeo) y una cabeza MTP (multi-token prediction) oficial en BF16 incluida en el paquete. El pipeline declarado es image-text-to-text y se mencionan tags de decodificación especulativa (MTP y DFlash2), cuantización estática con compressed-tensors y calibración mediante GSQ/RCO, Hessian e imatrix. No se detallan en la información disponible el número de capas, la dimensión oculta ni el mecanismo de atención concreto.

El linaje de entrenamiento parte del Qwen3.8-27B oficial, post-entrenado primero con SFT y SimPO para dar el EfficientThink base, y después sometido a una continuación SFT, una primera ronda de RLOO (182 grupos), otra ronda SFT (merge-sft-100) y una segunda ronda RLOO (172 grupos) que produce Coder390. Los datos de RLOO consisten en 8 trayectorias muestreadas por problema, conservando solo grupos con trayectorias correctas e incorrectas (grupos totalmente correctos descartados); el conjunto final son 172 grupos y 1.376 trayectorias (859 correctas, 517 incorrectas, 68 respuestas vacías). La función de recompensa penaliza únicamente las trayectorias incorrectas, de modo que el razonamiento largo correcto sigue recibiendo recompensa positiva y no se suprime. Los datos de respuestas doradas y trayectorias docentes provienen de modelos denominados Opus5.5, GPT6Astra, Grok4.7, DSV4Pro y K3 según la nomenclatura del autor.

## Capacidades

- Generación de texto y razonamiento en modo thinking largo, con un objetivo explícito de eliminar colas de razonamiento improductivas sin perder razonamiento necesario.
- Codificación reforzada (el sufijo "Coder" del nombre indica especialización en código).
- Capacidades multimodales: entrada de imagen y vídeo junto a texto (pipeline image-text-to-text).
- Decodificación especulativa integrada mediante cabeza MTP en BF16 y borrador DFlash2 (mutuamente excluyentes).
- Cuantización estática lista para producción en FP8 Block128, NVFP4 (W4A16, W4A4, W4A4-W8A8), INT4 W4A16, INT8 W8A8 e INT8 W8A16.
- Compatibilidad declarada con SGLang sin parches y con vLLM (el paquete FP8 está probado en vLLM); también hay artefactos GGUF para llama.cpp.
- Capacidades multilingües limitadas a inglés y chino según los metadatos de idioma.
- El tag "uncensored" aparece en el modelo base, no se detalla su alcance en esta ficha.

## Casos de uso

- Razonamiento matemático y científico con contexto largo: el modelo está optimizado para no truncar la respuesta a 94K tokens, lo que lo hace adecuado para problemas de competición o demostraciones que requieren cadenas de derivación extensas sin perder la respuesta final.
- Generación de código en producción: la especialización "Coder" y los resultados declarados en LCB (90/100 en FP8 estático) permiten integrarlo en pipelines de generación y revisión de código, con tool calling a través del servidor de inferencia.
- Despliegue de agentes multi-paso: la combinación de razonamiento largo, multimodalidad y decodificación especulativa permite mantener sesiones de agente con imágenes o capturas de pantalla como entrada y respuestas a velocidad interactiva (~180 tok/s con DFlash2).
- Servicio de inferencia de alto rendimiento en SGLang: el paquete FP8 estático Block128 y las variantes NVFP4 permiten servir el modelo en GPUs con memoria limitada manteniendo métricas idénticas a BF16 según el autor.
- Procesamiento de documentos con imagen y texto: al ser image-text-to-text, puede extraer y razonar sobre diagramas, tablas o capturas dentro de un flujo de análisis documental.
- Evaluación comparativa de técnicas de cuantización: el repositorio ofrece cinco niveles de safetensors y variantes INT4/INT8/NVFP4, lo que lo convierte en un banco de pruebas para medir pérdida de calidad entre precisiones.
- Experimentación con decodificación especulativa: la inclusión de MTP y DFlash2 permite comparar latencias y throughput en un mismo modelo sin cambiar de pesos base.

## Benchmarks y rendimiento

Los datos declarados por el autor comparan el modelo con su versión original FP8 bajo el mismo protocolo de 100K tokens. Las cifras son recuentos de aciertos sobre el total de cada suite, no porcentajes.

| Suite | Original FP8 | Coder390 FP8 estático | Coder390 FP8 dinámico |
|---|---|---|---|
| GPQA | 177/198 | 178/198 | 178/198 |
| MMLU | 444/500 | 450/500 | 445/500 |
| LCB | 83/100 | 90/100 | 90/100 |

El autor declara además que GPQA y LCB son idénticos entre BF16, FP8 dinámico y FP8 estático ("lossless quantization"), y que los truncamientos a 94K se reducen de 4 a 1 en GPQA y de 13 a 3 en LCB. En velocidad, se declaran aproximadamente 180 tok/s por petición con DFlash2, 91 tok/s con MTP y unos 46 tok/s sin especulación. No se han publicado en la información disponible resultados de benchmarks adicionales (HumanEval, GSM8K, MMLU-Pro u otros) ni comparaciones con modelos externos a la familia.

## Requisitos de hardware

- VRAM estimada para BF16: alrededor de 55,6 GB solo para pesos (27,78B parámetros × 2 bytes), más overhead de activaciones y caché KV para contexto largo.
- VRAM estimada para FP8: aproximadamente 27,8 GB de pesos, más overhead; viable en GPUs de 40-80 GB para contextos moderados.
- VRAM estimada para NVFP4 W4A16: en torno a 14-16 GB de pesos, lo que permite despliegue en GPUs consumer de gama alta.
- VRAM estimada para GGUF Q4: aproximadamente 15-17 GB, apto para RTX 4090 (24 GB) y GPUs con 16 GB o más según contexto.
- GPUs recomendadas: H100 o A100 para BF16 y FP8 con contexto largo; RTX 4090 o L40S para cuantizaciones NVFP4 e INT8; GPUs consumer de 16-24 GB para GGUF Q4/Q6.
- Opciones de despliegue: SGLang (soporte declarado sin parches para todos los niveles safetensors), vLLM (probado con el paquete FP8; también INT4 W4A16), llama.cpp para los GGUF, y NInfer para las variantes NVFP4-NInfer.
- Latencia y throughput: ~180 tok/s por petición con DFlash2, ~91 tok/s con MTP y ~46 tok/s sin especulación, según el autor. No se especifican las condiciones de hardware de estas mediciones.

## Comparativa con modelos similares

La información disponible solo permite comparar con el modelo base del que deriva y con su versión original FP8, no con modelos de otros autores.

| Modelo | Parámetros | Contexto | GPQA / MMLU / LCB | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Coder390 (este) | 27,78B | 94K (protocolo) | 178/198 · 450/500 · 90/100 | apache-2.0 | safetensors, GGUF, INT4/INT8/NVFP4 |
| EfficientThink base (SFT+SimPO) | 27,78B (mismo linaje) | 94K (protocolo) | 171/198 · 442/500 · 89/100 | apache-2.0 | HuggingFace |
| Qwen3.8-27B original | 27,78B (mismo linaje) | 94K (protocolo) | 177/198 · 444/500 · 83/100 | apache-2.0 | HuggingFace (Qwen) |
| Modelos de otros autores | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El repositorio se marca explícitamente como "FOR INTERNAL USE ONLY, WILL BE DELETED SOON"; no debe tratarse como una fuente estable para producción.
- Registra 0 descargas y 0 likes, y fue creado y actualizado en el mismo día (2026-11-03), lo que sugiere un artefacto de publicación no consolidado.
- El tamaño del repositorio es de 698,6 GB, lo que implica costes de almacenamiento y descarga considerables.
- Los benchmarks declarados son recuentos de aciertos sobre suites propias y no se acompañan de la metodología completa ni de comparaciones con modelos externos; deben tomarse como cifras del autor, no verificadas de forma independiente.
- Solo se declaran idiomas inglés y chino; el rendimiento en castellano no está documentado.
- El modelo base incluye el tag "uncensored", lo que puede implicar una menor alineación de seguridad; no se detalla el alcance de este comportamiento.
- Riesgo de alucinación inherente a los modelos de razonamiento largo, aunque el ajuste busca reducir los truncamientos sin respuesta final.
- La licencia apache-2.0 permite uso comercial, pero la naturaleza experimental y la advertencia de borrado del repositorio desaconsejan depender de esta copia concreta.
- No se dispone de información sobre sesgos medidos, evaluación de seguridad ni resultados en tareas multimodales más allá de la declaración de que el modelo es multimodal.
- Las velocidades de decodificación especulativa declaradas no especifican hardware ni longitud de contexto, por lo que no son directamente extrapolables.

## Enlaces

- HuggingFace (este repositorio): https://huggingface.co/xtools-at/Qwen3.8-27B-Coder390-Safetensors
- Modelo base directo: https://huggingface.co/nerkyor/Qwen3.8-27B-EfficientThink-Uncensored-K3-Opus5-Grok4.6-GPT5.6Sol-SFT-SimPO-DFlash2
- Modelo original del que deriva esta copia: https://huggingface.co/nerkyor/Qwen3.8-27B-Coder390-EfficientThink-Opus5.5-GPT6Astra-Grok4.7-DSV4Pro-K3-SFT-RLOO-MTP-DFlash2
- GGUF / GGUF-NInfer: https://huggingface.co/nerkyor/Qwen3.8-27B-Coder390-EfficientThink-Opus5.5-GPT6Astra-Grok4.7-DSV4Pro-K3-SFT-RLOO-GGUF-NInfer
- GGUF en ModelScope: https://modelscope.cn/models/Merkyor/Qwen3.8-27B-Coder390-EfficientThink-Opus5.5-GPT6Astra-Grok4.7-DSV4Pro-K3-SFT-RLOO-GGUF-NInfer
- NVFP4-NInfer: https://huggingface.co/nerkyor/Qwen3.8-27B-Coder390-EfficientThink-Opus5.5-GPT6Astra-Grok4.7-DSV4Pro-K3-SFT-RLOO-NVFP4-NInfer
- NVFP4-NInfer en ModelScope: https://modelscope.cn/models/Merkyor/Qwen3.8-27B-Coder390-EfficientThink-Opus5.5-GPT6Astra-Grok4.7-DSV4Pro-K3-SFT-RLOO-NVFP4-NInfer
- Qwen3.8-27B oficial: https://huggingface.co/Qwen/Qwen3.8-27B
