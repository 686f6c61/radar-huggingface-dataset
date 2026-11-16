# Xylolabs/gemma-4-E2B-it-Tenstorrent-Tensix-BFP4-MLP-Cal4x

## Resumen
Gemma 4 E2B Instruct es un modelo multimodal de Google (image-text-to-text) que Xylolabs ha reempaquetado y cuantizado específicamente para su ejecución en aceleradores Tenstorrent Tensix (arquitecturas Wormhole y Blackhole). El resultado es un checkpoint de aproximadamente 5.500 millones de parámetros totales, derivado del modelo base google/gemma-4-E2B-it, con una mezcla de precisión selectiva: matrices MLP en BFP4 y matrices de atención en BFP8, mientras que proyecciones, tablas de búsqueda, cabeza atada y normas permanecen en BF16.

La relevancia de esta ficha radica en que no se trata de una cuantización genérica orientada a GPU de consumo, sino de un export diseñado para el formato nativo de los NPU Tensix, con un empaquetado que reduce el peso de los tensores activos de texto a 6,76 GB lógicos y 8,51 GB empaquetados, frente a los 10,25 GB del checkpoint bf16 original. El modelo conserva la licencia Apache 2.0 del original y está pensado para despliegues en hardware Tenstorrent, no en CUDA.

El autor declara que no se realizó entrenamiento, calibración ni cuantización nuevos para la publicación: el trabajo consiste en aplicar GPTQ con búsqueda de exponente por bloque sobre las matrices MLP (calibrado con 262.144 tokens, cuatro veces el estándar de 65.536) y redondeo al más cercano sobre las matrices de atención. La evaluación reportada se centra en la fidelidad respecto al modelo bf16 y a una referencia llama.cpp Q4_K_M, no en benchmarks académicos estándar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) de la familia Gemma 4; detalles internos de capas no disponibles en la información proporcionada |
| Parámetros totales | 5.506.950.723 |
| Parámetros activos | no disponible (el nombre E2B sugiere un diseño con parámetros efectivos, pero no se confirma en la información) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BFP4 (bfloat4_b, 4,5 bits/peso) en matrices MLP; BFP8 (bfloat8_b, 8,5 bits/peso) en atención q/k/v/o; BF16 en proyecciones, LUT, cabeza atada y normas; media de 11,68 bits por peso activo de texto |
| Idiomas soportados | en, ko |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (1.952 tensores indexados; empaquetado Tensix de 8,51 GB) |

## Arquitectura y entrenamiento
El modelo base es Gemma 4 E2B Instruct de Google, un modelo multimodal que acepta entradas de imagen y texto y genera texto. La información disponible no detalla la arquitectura interna (número de capas, dimensiones ocultas, mecanismo de atención), por lo que esos datos deben considerarse no disponibles. Lo que sí se especifica con precisión es el esquema de cuantización aplicado por Xylolabs sobre los pesos del modelo base.

Sobre las 105 matrices MLP (gate, up y down) se aplica GPTQ con búsqueda de exponente por bloque, calibrado con 262.144 tokens (denominado "cal4x", cuatro veces el tamaño habitual de 65.536). Las 100 matrices de atención (q, k, v y o) se cuantizan a BFP8 mediante redondeo al más cercano. Las proyecciones por capa, las tablas de búsqueda de token y por capa, la cabeza atada y las normas se mantienen en BF16. No se realizó entrenamiento adicional, RLHF, DPO ni calibración nueva para la publicación; el trabajo es exclusivamente de empaquetado y verificación de formatos para Tensix.

## Capacidades
- Generación de texto conversacional con plantilla de chat y soporte de modo "thinking" (enable_thinking en la plantilla).
- Procesamiento de entradas imagen-texto (pipeline image-text-to-text), heredado del modelo base multimodal.
- Razonamiento de varios pasos, evidenciado por los ítems de evaluación de tipo "reason-order" en modo thinking.
- Instrucciones en inglés y coreano (idiomas declarados en la model card).
- Seguimiento de instrucciones en formato de líneas y respuestas estructuradas (ítem de evaluación "instr-lines").
- No se documenta soporte explícito de tool calling, function calling ni comportamiento agéntico en la información proporcionada.

## Casos de uso
- Despliegue en aceleradores Tenstorrent Wormhole o Blackhole: el checkpoint está empaquetado en el formato nativo Tensix (BFP4/BFP8), por lo que es la vía directa para ejecutar Gemma 4 E2B en NPU Tensix sin reconvertir pesos en el host.
- Inferencia de bajo consumo de memoria en borde: los 8,51 GB empaquetados (frente a 10,25 GB en bf16) permiten ajustar el modelo en dispositivos con memoria limitada, dejando espacio para caché KV y buffers.
- Asistentes conversacionales multirregionales: al soportar inglés y coreano, puede usarse en atención al cliente o asistentes internos para esos dos mercados, con plantilla de chat multi-turno.
- Descripción y análisis de imágenes: al heredar la capacidad image-text-to-text del base, sirve para generar pies de foto, responder preguntas sobre capturas o extraer información de documentos escaneados.
- Razonamiento con modo thinking en tareas de orden lógico: útil en pipelines donde se exige una cadena de razonamiento explícita antes de la respuesta final, activable por plantilla.
- Validación de pipelines de cuantización: el repo incluye pack_tensix.py y verify_grid.py, por lo que puede emplearse como referencia para comprobar el empaquetado BFP4/BFP8 en integraciones propias.
- Evaluación comparativa de fidelidad: sirve como punto de control para medir la pérdida de calidad de una cuantización mixta frente a bf16 y a Q4_K_M en despliegues de investigación.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks académicos estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card reporta métricas de fidelidad respecto a bf16 y a llama.cpp Q4_K_M:

| Métrica | Q4_K_M | Este checkpoint |
|---|---:|---:|
| KL de chat frente a bf16 | 0,29329 | 0,128496 |
| Ratio de KL frente a Q4_K_M | 1,0 | 0,438 |
| Respuestas normales correctas | 30/33 | 29/33 |
| Respuestas en modo thinking correctas | 7/7 | 6/7 |
| Respuestas perdidas o rotas contabilizadas | 0 | 1 |

La evaluación usa 32 secuencias originales y 16.144 posiciones puntuadas; el cálculo de KL emplea 16 secuencias de chat, 7.968 posiciones y las 262.144 entradas del vocabulario. La única pérdida contabilizada es el ítem `en-instr-lines`; el ítem `en-reason-order` se considera casi empate y el scorer congelado lo excluye. Los resultados proceden de comprobaciones en el simulador ttsim con tensix-bfp-gptq en el commit 83a9377.

## Requisitos de hardware
- Memoria de dispositivo: aproximadamente 8,51 GB solo para los pesos empaquetados en Tensix, más espacio para caché KV y buffers.
- Carga en framework (Transformers): unos 11,05 GB con los tensores BF16 guardados, antes de buffers de ejecución.
- Hardware objetivo: NPU Tensix de Tenstorrent, arquitecturas Wormhole y Blackhole. No está diseñado para GPU NVIDIA ni AMD.
- GPU de consumo: no aplica como destino principal; la carga en Transformers es posible en CPU con device_map="cpu" y dtype bfloat16, pero el empaquetado Tensix requiere contexto de arquitectura configurado.
- Despliegue: Transformers 5.22.1 (o versión que soporte Gemma 4) con AutoModelForImageTextToText; empaquetado en host TT-NN con pack_tensix.py y verificación con verify_grid.py. vLLM, llama.cpp, Ollama y TGI no se documentan para este checkpoint.
- Latencia y throughput: no disponibles; las comprobaciones se hicieron en el simulador ttsim, que no cualifica un runner nativo completo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / destino | Notas |
|---|---|---|---|---|---|
| Xylolabs gemma-4-E2B-it-Tenstorrent-Tensix-BFP4-MLP-Cal4x | 5.506.950.723 | no disponible | Apache 2.0 | safetensors empaquetado Tensix (BFP4 MLP, BFP8 atención) | KL 0,128 frente a bf16; 29/33 normales |
| google/gemma-4-E2B-it (base) | no disponible | no disponible | Apache 2.0 | safetensors bf16 | Referencia de fidelidad; 30/33 normales y 7/7 thinking |
| llama.cpp Q4_K_M del mismo base | no disponible | no disponible | Apache 2.0 | GGUF Q4_K_M | KL 0,293; 30/33 normales y 7/7 thinking |

La comparativa se limita a variantes del mismo modelo base, ya que la información proporcionada no incluye alternativas de otros fabricantes con parámetros y contexto comparables.

## Limitaciones y advertencias
- Destino de hardware restringido: el empaquetado BFP4/BFP8 está pensado para Tensix; en GPU convencional solo se dispone de la carga en BF16, lo que anula la ventaja de tamaño.
- Idiomas limitados: solo inglés y coreano están declarados; el rendimiento en castellano u otros idiomas no está evaluado.
- Contexto no documentado: no se especifica la longitud de ventana, lo que impide planificar conversaciones largas o documentos extensos con garantías.
- Pérdida de fidelidad medible: una respuesta menos en modo normal (29/33 frente a 30/33) y una menos en thinking (6/7 frente a 7/7) respecto a bf16, con el ítem `en-instr-lines` afectado.
- Evaluación limitada: las métricas provienen de 32 secuencias y del simulador ttsim; no hay benchmarks académicos ni validación en hardware nativo completo.
- Sin soporte documentado de tool calling ni agentes: no se debe asumir comportamiento agéntico en producción sin verificación propia.
- Riesgo de alucinación: inherente a los modelos generativos; no se reportan tasas específicas ni salvaguardas adicionales en la información disponible.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base de Google y los avisos de terceros incluidos en el repo.
- Los scripts de empaquetado y verificación no constituyen un runner nativo completo; la puesta en producción en Tensix requiere trabajo de integración adicional.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/Xylolabs/gemma-4-E2B-it-Tenstorrent-Tensix-BFP4-MLP-Cal4x
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Repositorio de código tensix-bfp-gptq: https://github.com/XylolabsInc/tensix-bfp-gptq
- Commit de referencia: https://github.com/XylolabsInc/tensix-bfp-gptq/tree/83a9377b3c440f8690c165bb80117b799f49db6a
- Script de empaquetado: https://huggingface.co/Xylolabs/gemma-4-E2B-it-Tenstorrent-Tensix-BFP4-MLP-Cal4x/blob/main/pack_tensix.py
- Licencia: https://huggingface.co/Xylolabs/gemma-4-E2B-it-Tenstorrent-Tensix-BFP4-MLP-Cal4x/blob/main/LICENSE
- Documentación Tenstorrent: https://docs.tenstorrent.com
- Paper referenciado (arXiv:2607.02770): https://arxiv.org/abs/2607.02770
