# yungisimon/Qwen2.5-1.5B-giri-msq-knn_k2_and_hdb-ep1

## Resumen

yungisimon/Qwen2.5-1.5B-giri-msq-knn_k2_and_hdb-ep1 es un ajuste fino completo (full fine-tuning) del modelo Qwen/Qwen2.5-1.5B-Instruct, desarrollado por el usuario yungisimon, orientado a una tarea muy concreta: funcionar como "modelo de memoria" (memory model) entrenado sobre pares sinteticos de pregunta-respuesta generados a partir del conjunto de datos MuSiQue. El modelo parte de la arquitectura Qwen2 de 1.500 millones de parametros y se ha entrenado mediante FSDP sobre 8 GPU AMD Instinct MI325X, con un total de 1.543.714.304 parametros entrenables (el 100% del modelo).

La particularidad del proyecto reside en la metodologia de construccion del dataset: los ejemplos se agrupan mediante una combinacion de kNN con k=2, deduplicacion de documentos y clustering HDBSCAN con tamano minimo de cluster 2 (metodo identificado como `knn_k2_and_hdb`), generando 1.590.428 ejemplos de entrenamiento. El checkpoint publicado corresponde a la epoca 1 de 3, por lo que representa un estado intermedio del proceso de entrenamiento y no la version final del ajuste.

Se trata de un modelo de nicho, con cero descargas y cero "likes" en el momento de la consulta, pensado para experimentacion en tareas de recuperacion y consolidacion de memoria en contextos multi-documento. Su licencia Apache 2.0 y su compatibilidad con `transformers` y text-generation-inference lo hacen facilmente desplegable, aunque su utilidad practica esta acotada al dominio sintetico sobre el que fue entrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 8.096 tokens (longitud maxima de secuencia en entrenamiento); el contexto nativo de Qwen2.5-1.5B-Instruct es mayor, pero no se especifica en la informacion disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Qwen2 decoder-only del modelo base Qwen2.5-1.5B-Instruct, con 1.543.714.304 parametros densos. El ajuste se realizo mediante full fine-tuning con FSDP, actualizando el 100% de los parametros, sobre 8 GPU AMD Instinct MI325X en precision bf16 con gradient checkpointing. La funcion de perdida se calcula unicamente sobre los tokens del asistente, lo que concentra el aprendizaje en las respuestas generadas y no en el contexto de entrada.

Los hiperparametros documentados son: tamano de batch efectivo de 256 (32 por dispositivo, 1 paso de acumulacion, 8 GPU), learning rate de 2e-05 con scheduler constante y warmup del 5%, weight decay de 0.01, max grad norm de 1.0 y longitud maxima de secuencia de 8.096 tokens. El entrenamiento completo de 3 epocas requirio 1,63 horas de reloj (13,1 GPU-hora); el checkpoint publicado corresponde a la epoca 1. El dataset de entrenamiento consiste en 1.590.428 ejemplos sinteticos de QA construidos a partir de MuSiQue, agrupados mediante kNN con k=2, deduplicacion de documentos y HDBSCAN con tamano minimo de cluster 2, con combinacion de entidades cross-documento (version v3 del pipeline). No se documenta el uso de RLHF ni DPO.

## Capacidades

- Generacion de texto conversacional, heredada del modelo base Qwen2.5-1.5B-Instruct y ajustada sobre pares QA sinteticos de MuSiQue.
- Razonamiento sobre memoria multi-documento: el entrenamiento esta disenado para consolidar y recuperar informacion dispersa en varios documentos, segun la metodologia de clustering descrita.
- Respuesta a preguntas de tipo multi-hop, dado que MuSiQue es un benchmark de QA multi-salto.
- Uso de la plantilla de chat de Qwen (chat template) para conversaciones multi-turno.
- Compatibilidad con text-generation-inference y endpoints compatibles, segun los tags del repositorio.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada (el modelo base lo soporta, pero no se confirma que se haya preservado tras el ajuste).
- Capacidades multilingues: no disponible.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Experimentacion en memoria conversacional: el modelo puede emplearse para probar tecnicas de consolidacion de memoria en dialogos multi-turno, ya que fue entrenado especificamente como "memory model" sobre pares QA derivados de clustering documental.
- Investigacion en QA multi-hop: sirve como punto de partida para reproducir o comparar la metodologia `knn_k2_and_hdb` sobre MuSiQue, al estar el checkpoint disponible publicamente bajo Apache 2.0.
- Prototipado de pipelines de recuperacion aumentada (RAG): su ventana de 8.096 tokens permite inyectar varios fragmentos de contexto y evaluar como el ajuste afecta a la sintesis de respuestas entre documentos.
- Evaluacion de estrategias de deduplicacion y clustering: el modelo es un artefacto util para estudiar como el agrupamiento con HDBSCAN (tamano minimo 2) y la combinacion de entidades cross-documento influyen en la calidad de las respuestas.
- Despliegue ligero en entornos con recursos limitados: con 1.500 millones de parametros en bf16 (aproximadamente 3,1 GB de pesos), puede ejecutarse en una unica GPU consumer para pruebas de inferencia y comparativas de calidad.
- Base para nuevos ajustes finos: al ser un full fine-tune con licencia permisiva, puede reutilizarse como punto de partida para tareas de memoria o QA en dominios propios.
- Generacion de respuestas conversacionales en castellano u otros idiomas: no recomendado de forma especifica, ya que no se documentan los idiomas soportados ni se ha validado el comportamiento multilingue tras el ajuste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 3,1 GB solo para los pesos, mas overhead de activaciones y cache KV; en la practica, entre 4 y 6 GB para secuencias cortas.
- VRAM estimada en fp16: similar al bf16 (unos 3,1 GB de pesos).
- Cuantizacion a 8 bits: alrededor de 1,6 GB de pesos; a 4 bits, alrededor de 0,8 GB, aunque no se publican variantes cuantizadas oficiales.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bf16; A100, H100, L40S o RTX 4090 son suficientes y sobradas para este tamano.
- Cabe en GPU consumer: si, en tarjetas como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090.
- Opciones de despliegue: `transformers` (AutoModelForCausalLM.from_pretrained), text-generation-inference (tag `text-generation-inference`), y previsiblemente vLLM y llama.cpp si se generan pesos GGUF, aunque no se documentan conversiones oficiales.
- Latencia y throughput: no disponibles en la informacion proporcionada. El entrenamiento se realizo en 8x AMD Instinct MI325X, pero no se aportan metricas de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| yungisimon/Qwen2.5-1.5B-giri-msq-knn_k2_and_hdb-ep1 | 1.543.714.304 | 8.096 (entrenamiento) | Apache 2.0 | Hugging Face, 0 descargas | Full fine-tune especializado en memoria/QA multi-hop, checkpoint epoca 1 de 3 |
| Qwen/Qwen2.5-1.5B-Instruct | 1.500 millones (aprox.) | 32.768 tokens (contexto nativo de Qwen2.5) | Apache 2.0 | Hugging Face, ampliamente utilizado | Modelo base generalista con soporte de tool calling e instrucciones |
| Qwen/Qwen2.5-3B-Instruct | 3.000 millones (aprox.) | 32.768 tokens (contexto nativo de Qwen2.5) | Apache 2.0 | Hugging Face | Alternativa de mayor capacidad y mismo ecosistema |
| Meta-Llama-3.2-1B-Instruct | 1.200 millones (aprox.) | 128.000 tokens | Llama 3.2 Community License | Hugging Face | Alternativa de tamano similar con contexto largo, licencia no Apache |

No se dispone de datos de benchmarks del modelo ajustado que permitan una comparacion cuantitativa con estas alternativas.

## Limitaciones y advertencias

- El checkpoint corresponde a la epoca 1 de 3, por lo que no representa el estado final del entrenamiento y su calidad puede ser inferior a la de la version completada.
- El ajuste se realizo exclusivamente sobre pares QA sinteticos de MuSiQue (1.590.428 ejemplos); es probable que el modelo haya perdido parte de la generalidad del modelo base fuera de ese dominio, aunque no se documenta una evaluacion de olvido catastrofico.
- No se documentan los idiomas soportados; el comportamiento multilingue no esta verificado y no deberia asumirse.
- Riesgo de alucinacion: al ser un modelo de 1.500 millones de parametros ajustado sobre datos sinteticos, puede generar respuestas plausibles pero incorrectas, especialmente en preguntas fuera del dominio de entrenamiento.
- Sesgos conocidos: no disponibles en la informacion proporcionada; se heredan los del modelo base Qwen2.5-1.5B-Instruct, no evaluados en esta ficha.
- La longitud de contexto documentada es de 8.096 tokens en entrenamiento; no se confirma que se conserve el contexto nativo de 32.768 tokens del modelo base tras el ajuste.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias ni soporte; el modelo tiene 0 descargas y 0 "likes", lo que indica ausencia de validacion por parte de la comunidad.
- No se publican variantes cuantizadas ni metricas de latencia/throughput, lo que dificulta planificar un despliegue en produccion.
- El metodo de construccion del dataset (`knn_k2_and_hdb`) es especifico del autor y no esta estandarizado ni replicado de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yungisimon/Qwen2.5-1.5B-giri-msq-knn_k2_and_hdb-ep1
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Dataset MuSiQue (referencia del benchmark de QA multi-hop): no disponible en la informacion proporcionada
- Paper o blog del autor sobre la metodologia `knn_k2_and_hdb`: no disponible en la informacion proporcionada
- Repositorio de codigo del pipeline de entrenamiento: no disponible en la informacion proporcionada
