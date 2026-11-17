# yungisimon/Qwen2.5-14B-giri-msq-knn_k2_and_hdb_and_entity-ep3

## Resumen

`yungisimon/Qwen2.5-14B-giri-msq-knn_k2_and_hdb_and_entity-ep3` es un ajuste fino completo del modelo `Qwen/Qwen2.5-14B-Instruct` desarrollado por el usuario yungisimon. El modelo se ha reentrenado como "modelo de memoria" (memory model) sobre pares sinteticos de pregunta-respuesta generados a partir de MuSiQue, un corpus de preguntas multi-salto. El objetivo es que el modelo aprenda a explotar informacion estructurada de memoria construida mediante clustering (kNN con k=2, HDBSCAN y agrupacion por entidades) para responder preguntas que requieren razonamiento sobre multiples documentos.

La arquitectura subyacente es la de Qwen2.5-14B-Instruct: un transformer decoder-only denso de 14.770.033.664 parametros (14,77 mil millones), con licencia Apache 2.0 y pesos en safetensors bf16. El checkpoint publicado corresponde a la epoca 3 de 3 de un entrenamiento completo con FSDP sobre 8 GPU AMD Instinct MI325X, con un total de 11,36 horas de reloj (90,9 GPU-horas).

Su relevancia es acotada pero especifica: se trata de un experimento de investigacion sobre memoria externa estructurada en modelos de lenguaje, no de un modelo generalista de proposito comercial. No hay descargas ni likes registrados, no se han publicado benchmarks y la model card es minima, por lo que debe evaluarse como artefacto de investigacion reproducible mas que como modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen2.5) |
| Parametros totales | 14.770.033.664 (14,77 mil millones) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 8.096 tokens de secuencia maxima durante el entrenamiento (contexto nativo de Qwen2.5-14B-Instruct: no disponible en la informacion proporcionada) |
| Tipos de cuantizacion | pesos publicados en bf16 safetensors; no se documentan cuantizaciones GGUF/AWQ/GPTQ en la informacion disponible |
| Idiomas soportados | no disponible (heredados de Qwen2.5-14B-Instruct, no documentados en esta ficha) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-14B-Instruct, un transformer decoder-only denso con 14,77 mil millones de parametros. Sobre esa base se realiza un ajuste fino completo (full fine-tuning, 100 % de parametros entrenables) distribuido con FSDP. El entrenamiento usa precision bf16, gradient checkpointing y calculo de perdida unicamente sobre los tokens del asistente. La configuracion incluye batch efectivo de 256 (32 por dispositivo, 1 paso de acumulacion, 8 GPU), learning rate constante de 2e-05 con warmup del 5 %, weight decay 0,01, max grad norm 1,0 y longitud maxima de secuencia de 8.096 tokens. El entrenamiento completo de 3 epocas se ejecuto en 8 GPU AMD Instinct MI325X en 11,36 horas de reloj.

El dato diferenciador es el dataset: 2.681.852 ejemplos sinteticos de QA construidos a partir de un subconjunto de MuSiQue mediante un pipeline de clustering denominado `knn_k2_and_hdb_and_entity`. Ese pipeline combina kNN con k=2 y deduplicacion de documentos, HDBSCAN con tamano minimo de cluster 2 y agrupacion por entidades con frecuencia documental maxima de 3, incluyendo combinacion de entidades entre documentos. El modelo se plantea como "memory model": aprende a apoyarse en agrupaciones estructuradas de evidencia para resolver preguntas multi-salto. No se documenta en la informacion disponible el uso de RLHF, DPO ni tecnicas de decodificacion especulativa.

## Capacidades

- Generacion de texto conversacional con la plantilla de chat de Qwen (obligatoria segun la model card).
- Razonamiento multi-salto sobre preguntas tipo MuSiQue, apoyado en memoria estructurada por clusters de documentos y entidades.
- Recuperacion y sintesis de evidencia a partir de agrupaciones documentales deduplicadas.
- Ajuste especifico para tareas de question answering con contexto documental multiple.
- Soporte de tool calling / function calling: no documentado en la informacion disponible (heredado potencialmente de Qwen2.5-14B-Instruct, sin verificar en este checkpoint).
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion disponible.
- Capacidades multilingues: no documentadas en la informacion disponible.
- Capacidades especiales (modo thinking, vision, audio): no documentadas en la informacion disponible.

## Casos de uso

- Investigacion en memoria externa para LLM: el checkpoint sirve como referencia reproducible para estudiar como un ajuste fino completo sobre pares QA derivados de clustering afecta al comportamiento del modelo en tareas de recuperacion estructurada.
- Preguntas multi-salto sobre corpus documentales: el modelo puede emplearse en pipelines donde la evidencia se agrupa previamente por entidades y clusters (HDBSCAN + kNN) y se presenta al modelo como contexto para responder.
- Evaluacion comparativa de estrategias de clustering: al estar etiquetado con la configuracion exacta (`knn_k2_and_hdb_and_entity`), permite contrastar esta variante con otras del mismo autor en experimentos controlados.
- Prototipado de asistentes documentales internos: con 14,77 mil millones de parametros y licencia Apache 2.0, puede desplegarse en infraestructura propia para pruebas de concepto de QA sobre bases documentales acotadas.
- Reproduccion de experimentos academicos: la model card detalla hiperparametros, hardware y horas de entrenamiento, lo que facilita replicar o extender el ajuste sobre MuSiQue u otros corpus multi-salto.
- Base para nuevos ajustes finos: al ser un full fine-tune con licencia permisiva, puede reutilizarse como punto de partida para tareas de memoria o QA especificas del dominio.
- Analisis de sesgos inducidos por datos sinteticos: util para estudiar como 2,68 millones de ejemplos sinteticos de QA afectan a la fidelidad y a la tendencia a la alucinacion del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 29,5 GB solo para pesos (14,77 mil millones de parametros x 2 bytes), mas overhead de activaciones y cache KV.
- VRAM estimada en cuantizacion de 8 bits: unos 15 GB para pesos; en 4 bits, unos 8-9 GB, aunque no se han publicado cuantizaciones oficiales para este checkpoint.
- GPU recomendadas para bf16: A100 80 GB, H100 80 GB, AMD MI300X/MI325X (la familia usada en entrenamiento) o configuraciones multi-GPU con al menos 2x24 GB.
- GPU de consumo: cabe en RTX 4090 (24 GB) solo con cuantizacion agresiva (4 bits) y contexto reducido; en RTX 3090 (24 GB) en las mismas condiciones. En bf16 no cabe en GPU de consumo de 24 GB.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM.from_pretrained` (metodo documentado por el autor), text-generation-inference (etiqueta `text-generation-inference` presente), y potencialmente vLLM; llama.cpp/Ollama requeririan conversion a GGUF no publicada.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| yungisimon/Qwen2.5-14B-giri-msq-knn_k2_and_hdb_and_entity-ep3 | 14,77 mil millones | 8.096 tokens de entrenamiento | Apache 2.0 | Hugging Face, 0 descargas | Full fine-tune como memory model sobre MuSiQue sintetico |
| Qwen/Qwen2.5-14B-Instruct | 14,77 mil millones | no disponible en la informacion proporcionada | Apache 2.0 | Hugging Face, ampliamente usado | Modelo base; capacidades generales e instrucciones |
| Qwen/Qwen2.5-7B-Instruct | 7,6 mil millones (aproximado, no verificado en la informacion) | no disponible | Apache 2.0 | Hugging Face | Alternativa de menor tamano para el mismo ecosistema |
| Meta Llama 3.1 8B Instruct | 8 mil millones (aproximado, no verificado en la informacion) | no disponible | Llama 3.1 Community License | Hugging Face | Alternativa generalista con licencia no Apache |

Los datos de rendimiento comparativo no estan disponibles: no se han publicado benchmarks de este checkpoint.

## Limitaciones y advertencias

- No se han publicado evaluaciones de sesgo, toxicidad o fidelidad para este checkpoint; se desconoce el impacto del ajuste sobre los sesgos del modelo base.
- Riesgo de alucinacion: el entrenamiento sobre QA sintetico derivado de MuSiQue puede inducir respuestas plausibles pero no sustentadas cuando la memoria estructurada de entrada es incompleta o incoherente.
- El modelo espera el formato de memoria del pipeline `knn_k2_and_hdb_and_entity`; usarlo fuera de ese esquema de contexto puede degradar el rendimiento respecto al modelo base.
- Contexto de entrenamiento limitado a 8.096 tokens: secuencias mas largas no estan validadas para este checkpoint.
- Idiomas soportados no documentados; el ajuste se realizo sobre datos en el idioma de MuSiQue (no especificado en la informacion disponible), lo que puede reducir el multilingueismo del modelo base.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; el modelo tiene 0 descargas y 0 likes, sin validacion comunitaria.
- Es un artefacto de investigacion: no hay cuantizaciones oficiales, ni benchmarks, ni guias de despliegue mas alla de la carga con `transformers`.
- El checkpoint corresponde a la epoca 3 de 3; no se publican checkpoints intermedios ni curvas de perdida en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yungisimon/Qwen2.5-14B-giri-msq-knn_k2_and_hdb_and_entity-ep3
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct
- Perfil del autor: https://huggingface.co/yungisimon
- Dataset de referencia MuSiQue: no disponible en la informacion proporcionada
- Paper de MuSiQue: no disponible en la informacion proporcionada
- Repositorio de codigo del pipeline de clustering: no disponible en la informacion proporcionada
