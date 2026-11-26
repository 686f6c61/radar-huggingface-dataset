# tirth1018/kd-ticket-classifier-gguf

## Resumen

kd-ticket-classifier-gguf es un ajuste fino (fine-tuning) del modelo Llama-3.2-3B-Instruct, distribuido en formato GGUF por el usuario tirth1018. Por el nombre y la nomenclatura del repositorio, el modelo está especializado en la clasificación de tickets (probablemente tickets de soporte tecnico o de atencion al cliente), aunque la model card no documenta explicitamente la tarea ni el conjunto de datos de entrenamiento. El modelo se ha entrenado y convertido a GGUF con Unsloth, lo que reduce el tiempo de entrenamiento y facilita la exportacion a llama.cpp.

El modelo cuenta con 3.212.749.888 parametros (aproximadamente 3,2 mil millones), lo que lo situa en la categoria de modelos pequenos, aptos para inferencia en hardware consumer. Se distribuye exclusivamente en cuantizacion Q4_K_M, con un peso de repositorio de 2,0 GB, lo que permite ejecutarlo en GPU con 4-6 GB de VRAM o incluso en CPU con un rendimiento aceptable.

La relevancia de este modelo es practica: demuestra el flujo de trabajo de ajuste fino con Unsloth y despliegue via llama.cpp/Ollama para una tarea concreta de clasificacion. No obstante, la informacion publicada es muy limitada: no hay licencia declarada, no se especifican idiomas, no hay resultados de benchmarks ni detalles sobre el dataset de entrenamiento, lo que limita su evaluacion rigurosa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Llama-3.2-3B-Instruct) |
| Parametros totales | 3.212.749.888 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Llama-3.2-3B-Instruct, no confirmada en la model card) |
| Tipos de cuantizacion | Q4_K_M (unico archivo publicado) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama-3.2-3B-Instruct, un transformer decoder-only con atencion causal estandar, desarrollado por Meta. El modelo ha sido ajustado fino (fine-tuning) y posteriormente convertido a GGUF mediante Unsloth, una libreria que optimiza el entrenamiento de modelos Llama reduciendo el uso de memoria y acelerando el proceso (el autor afirma un entrenamiento "2x faster"). No se detalla en la model card el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF o DPO adicionales sobre el ajuste supervisado.

Un detalle tecnico relevante es que el autor indica que "el comportamiento del token BOS fue ajustado para compatibilidad con GGUF", lo que sugiere una modificacion en la configuracion del token de inicio de secuencia para asegurar que llama.cpp procese correctamente las entradas. No se documentan innovaciones adicionales como decodificacion especulativa, atencion lineal o arquitecturas hibridas.

## Capacidades

- Generacion de texto conversacional, heredada del modelo base Llama-3.2-3B-Instruct.
- Clasificacion de tickets: la especialidad declarada por el nombre del modelo, aunque no se especifica el esquema de etiquetas ni el dominio concreto.
- Soporte de plantillas de chat via `--jinja` en llama.cpp, lo que permite usar el formato de conversacion del modelo base.
- Compatibilidad con endpoints (tag `endpoints_compatible`), lo que facilita su despliegue en infraestructuras de inferencia compatibles con la API de Hugging Face.
- Capacidades multilingues: no disponibles (no declaradas).
- Tool calling / function calling: no documentado.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Clasificacion automatica de tickets de soporte: el modelo puede recibir el texto de un ticket y asignarle una categoria (por ejemplo, facturacion, incidencia tecnica, reclamacion), aprovechando el ajuste fino especifico. Es adecuado por su tamano reducido y su formato GGUF, que permite ejecucion local.
- Triaje en mesas de ayuda: integrado en un pipeline previo a la asignacion a agentes humanos, el modelo puede etiquetar y priorizar tickets entrantes en tiempo real con baja latencia.
- Despliegue en local con Ollama: la model card incluye un Modelfile de Ollama, lo que permite levantar el modelo en una maquina de desarrollo o en un servidor pequeno sin infraestructura GPU dedicada.
- Prototipado rapido de clasificadores de texto: sirve como base para experimentar con ajuste fino de Llama-3.2-3B en dominios especificos, dado que el flujo Unsloth -> GGUF esta documentado.
- Procesamiento por lotes en CPU: con cuantizacion Q4_K_M y 2 GB de peso, puede ejecutarse en CPU para clasificar grandes volumenes de tickets de forma asincrona.
- Integracion en endpoints compatibles: el tag `endpoints_compatible` sugiere que puede desplegarse en servicios de inferencia gestionados que acepten el formato de Hugging Face, util para entornos de produccion ligeros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5-3,5 GB con cuantizacion Q4_K_M (el archivo pesa 2,0 GB y se anade overhead de contexto y KV cache).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como RTX 3050, RTX 4060, RTX 3060, o superiores (RTX 4090, A100, H100) para mayor throughput.
- Cabe en GPU consumer: si, en practicamente todas las GPU consumer modernas con 4 GB o mas de VRAM.
- Opciones de despliegue: llama.cpp (`llama-cli -hf tirth1018/kd-ticket-classifier-gguf --jinja`), Ollama (Modelfile incluido), y potencialmente otros runners compatibles con GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Especializacion |
|---|---|---|---|---|---|
| kd-ticket-classifier-gguf | 3,2 B | no disponible | GGUF (Q4_K_M) | no disponible | Clasificacion de tickets |
| Llama-3.2-3B-Instruct | 3,2 B | 128 K (segun Meta) | safetensors, GGUF | Llama 3.2 Community License | Proposito general |
| Qwen2.5-3B-Instruct | 3,1 B | 32 K | safetensors, GGUF | Apache 2.0 | Proposito general |

La comparativa se limita a modelos de tamano similar; no se dispone de datos de rendimiento del modelo evaluado para comparar metricas. El modelo base Llama-3.2-3B-Instruct ofrece una ventana de contexto mucho mayor (segun la documentacion de Meta) y una licencia definida, mientras que este ajuste fino no declara ni contexto ni licencia.

## Limitaciones y advertencias

- Licencia no declarada: no se especifica la licencia del modelo, lo que impide determinar si el uso comercial esta permitido. Se recomienda contactar con el autor antes de usarlo en produccion.
- Idiomas no documentados: no se indica que idiomas soporta el ajuste fino; probablemente herede el multilingueismo de Llama-3.2, pero no esta confirmado.
- Riesgo de alucinacion: como todo modelo generativo de 3 B, puede producir etiquetas o justificaciones incorrectas, especialmente en tickets ambiguos o fuera de distribucion.
- Dataset de entrenamiento no documentado: se desconoce el volumen, la calidad y la composicion de los datos de ajuste fino, lo que impide evaluar sesgos y cobertura.
- Ausencia de benchmarks: no hay metricas publicadas de precision, recall o F1 en la tarea de clasificacion, por lo que no se puede validar su rendimiento frente a alternativas.
- Unica cuantizacion disponible: solo se publica Q4_K_M, lo que limita la eleccion de precision para entornos que requieran mayor calidad (Q8, FP16) o menor footprint (Q2, Q3).
- Modificacion del token BOS: el ajuste del comportamiento del token BOS para GGUF puede introducir diferencias respecto al modelo original; conviene validar el formato de entrada en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tirth1018/kd-ticket-classifier-gguf
- Unsloth (libreria de entrenamiento): https://github.com/unslothai/unsloth
- Llama.cpp (runtime GGUF): https://github.com/ggml-org/llama.cpp
- Modelo base Llama-3.2-3B-Instruct: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
