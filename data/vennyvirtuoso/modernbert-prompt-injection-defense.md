# vennyvirtuoso/modernbert-prompt-injection-defense

## Resumen

modernbert-prompt-injection-defense es un clasificador de texto especializado en la deteccion de prompt injection y jailbreak, desarrollado por el usuario vennyvirtuoso y publicado en Hugging Face. Se construye mediante fine-tuning del modelo base answerdotai/ModernBERT-base, un transformer encoder de la familia ModernBERT que incorpora attention con roatary positional embeddings (RoPE) y ventana de contexto extendida. El modelo resuelve un problema concreto y creciente en el despliegue de sistemas basados en LLM: la necesidad de filtrar entradas maliciosas antes de que lleguen al modelo generativo, tanto en prompts directos del usuario como en contenido indirecto embebido en documentos recuperados por pipelines RAG.

La propuesta es un clasificador binario (BENIGN frente a INJECTION/ATTACK) con 149.606.402 parametros, empaquetado en safetensors y con un tamano de repositorio de 0,6 GB. Su principal atractivo es la relacion entre coste computacional y utilidad: al ser un encoder pequeno y no un LLM generativo, puede ejecutarse en CPU o en GPUs de consumo con latencias muy bajas, lo que lo hace viable como capa de guardrails en produccion. El autor declara una precision del 99,21% en el split de test retenido tras el fine-tuning, frente al 63,31% del checkpoint base sin adaptar.

El modelo se publica bajo licencia Apache 2.0, lo que permite uso comercial y academico sin restricciones adicionales. Esta orientado a despliegues de seguridad en entornos empresariales, agentes autonomos y pipelines de recuperacion aumentada, y su contexto de 8.192 tokens permite analizar documentos completos o fragmentos largos sin truncar el contenido sospechoso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (transformer encoder) |
| Parametros totales | 149.606.402 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | no disponible (entrenado en bfloat16/fp16; el autor no detalla cuantizaciones publicadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de answerdotai/ModernBERT-base, un transformer encoder de tipo BERT modernizado que sustituye las positional embeddings absolutas por RoPE, incorpora atencion lineal alternativa y extiende la ventana de contexto hasta 8.192 tokens. Sobre esa base se aplica un fine-tuning de clasificacion binaria para la tarea text-classification, con una cabeza de secuencia que produce dos logits (BENIGN y INJECTION/ATTACK). El entrenamiento se realizo en precision mixta (bfloat16/fp16) segun la model card.

El conjunto de datos de entrenamiento combina deepset/prompt-injections con xTRam1/safe-guard-prompt-injection, segun declara el autor. La evaluacion se realizo sobre un split de test retenido y disjunto por grupos, lo que el autor presenta como garantia de generalizacion out-of-distribution y ausencia de fuga de datos. No se detalla el numero exacto de tokens de entrenamiento, la composicion porcentual del dataset ni si se aplicaron tecnicas de RLHF o DPO, que en un clasificador de este tipo no serian el mecanismo habitual. La innovacion tecnica principal es el uso del contexto largo de ModernBERT para detectar inyecciones indirectas embebidas en documentos extensos, un escenario que los clasificadores basados en BERT clasico con 512 tokens no cubren bien.

## Capacidades

- Clasificacion binaria de texto en dos clases: BENIGN (seguro) e INJECTION/ATTACK (malicioso).
- Deteccion de prompt injection directa, como instrucciones del tipo "ignore all previous instructions".
- Deteccion de prompt injection indirecta o encubierta embebida en documentos, por ejemplo actualizaciones falsas de sistema o cambios de rol inyectados en contenido recuperado.
- Deteccion de intentos de jailbreak orientados a saltarse las restricciones del modelo generativo.
- Procesamiento de entradas de hasta 8.192 tokens, adecuado para fragmentos largos de RAG o documentos completos.
- Integracion con el pipeline estandar de transformers (AutoTokenizer, AutoModelForSequenceClassification) y con sentence-transformers y peft.
- No soporta tool calling ni function calling: es un clasificador, no un modelo generativo.
- No soporta razonamiento multi-paso ni modo thinking: emite una unica etiqueta por entrada.
- Capacidades multilingues: no disponibles segun la informacion proporcionada; el autor no declara idiomas soportados.
- No dispone de vision ni audio.

## Casos de uso

- Filtrado previo de prompts en atencion al cliente automatizada: antes de enviar la consulta del usuario al LLM generativo, el clasificador etiqueta la entrada y bloquea intentos de manipulacion, reduciendo el riesgo de fuga de system prompt o de acciones no autorizadas en el backend.
- Guardrail en pipelines RAG: cada fragmento recuperado de la base documental se pasa por el clasificador antes de insertarse en el contexto del LLM, lo que permite detectar inyecciones indirectas ocultas en PDFs, paginas web o correos indexados.
- Proteccion de agentes autonomos con ejecucion de herramientas: el modelo actua como segunda etapa de validacion antes de que el agente invoque funciones sensibles (transferencias, envio de correo, acceso a bases de datos), bloqueando instrucciones inyectadas en la cadena de razonamiento.
- Cumplimiento normativo y escaneo de datos (GDPR, PCI-DSS, HIPAA): el clasificador puede integrarse en flujos de revision automatizada para detectar intentos de exfiltracion o manipulacion en formularios y tickets, generando alertas auditables.
- Microservicio de seguridad de baja latencia: con 149,6 M de parametros y un throughput declarado de 296,8 muestras por segundo en evaluacion, es viable desplegarlo como sidecar en Kubernetes o como funcion serverless que valide cada peticion antes del LLM principal.
- Moderacion de contenido en foros y comunidades: clasificacion por lotes de mensajes de usuario para marcar posibles intentos de jailbreak o inyeccion, con revision humana posterior de los casos positivos.
- Evaluacion offline de calidad de guardrails: el modelo sirve como referencia para medir la robustez de otros filtros o para construir conjuntos de test de seguridad en el ciclo de desarrollo de aplicaciones LLM.

## Benchmarks y rendimiento

Resultados declarados por el autor en el split de test retenido:

| Metrica | Valor |
|---|---|
| Precision zero-shot del modelo base | 63,31% |
| Precision fine-tuned en test retenido | 99,21% |
| Ganancia absoluta de precision | +35,91% |
| Macro-F1 del modelo base | 62,95% |
| Macro-F1 fine-tuned | 99,10% |
| Ganancia de Macro-F1 | +36,16% |
| Precision (clase ataque) | 99,27% |
| Recall (clase ataque) | 98,94% |
| Tiempo de evaluacion | 7,29 s |
| Throughput de evaluacion | 296,8 muestras/s |

No se han publicado resultados en benchmarks estandar de la comunidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que el modelo es un clasificador y no un LLM generativo.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 0,3 GB para los pesos (149,6 M de parametros), mas overhead de activaciones y tokenizador; en la practica cabe holgadamente en cualquier GPU con 1 GB o mas.
- En cuantizacion int8 el modelo ocupa del orden de 150 MB, y en int4 alrededor de 75 MB, aunque el autor no publica checkpoints cuantizados oficiales.
- GPU recomendadas: cualquier GPU moderna es suficiente; para alto throughput se sugiere una A100, H100 o L40S; para entornos de consumo, una RTX 4090, RTX 3090 o incluso GPUs de gama media como RTX 3060 funcionan sin problema.
- Cabe en GPU de consumo y tambien en CPU: al ser un encoder de 149 M de parametros, es viable la inferencia en CPU con ONNX Runtime para microservicios de baja concurrencia.
- Opciones de despliegue: transformers con pipeline estandar, vLLM, Hugging Face TGI, ONNX Runtime y TensorRT-LLM, segun recomienda el autor.
- Latencia y throughput: el autor reporta 296,8 muestras/s en su entorno de evaluacion; no se especifica el hardware exacto utilizado, por lo que la cifra debe tomarse como referencia orientativa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| modernbert-prompt-injection-defense | 149,6 M | 8.192 | Clasificacion prompt injection | Apache 2.0 | Hugging Face |
| answerdotai/ModernBERT-base | ~149 M | 8.192 | Encoder base (sin fine-tuning de seguridad) | Apache 2.0 | Hugging Face |
| Clasificadores BERT-base de prompt injection (familia generica) | ~110 M | 512 | Clasificacion prompt injection | variable | Hugging Face |
| protectai/deberta-v3-base-prompt-injection | ~184 M | 512 | Clasificacion prompt injection | Apache 2.0 | Hugging Face |

La ventaja diferencial frente a clasificadores basados en BERT clasico o DeBERTa-v3 es la ventana de 8.192 tokens, que permite analizar documentos completos sin truncar. Frente al checkpoint base ModernBERT sin adaptar, la mejora declarada es de +35,91 puntos de precision. No se dispone de comparaciones directas con otros detectores en el mismo split de evaluacion, por lo que la comparativa debe interpretarse con cautela.

## Limitaciones y advertencias

- El modelo es un clasificador binario: no genera texto ni razona, por lo que no sustituye al LLM principal, solo lo complementa como capa de filtrado.
- Los resultados de 99,21% de precision proceden de la evaluacion del propio autor sobre su split retenido; no hay validacion independiente ni comparacion con benchmarks publicos de la comunidad.
- El entrenamiento se realizo sobre deepset/prompt-injections y xTRam1/safe-guard-prompt-injection; el rendimiento puede degradarse en dominios, idiomas o estilos de ataque no representados en esos datasets.
- No se declaran idiomas soportados; es probable que el modelo este optimizado para ingles, dado el dataset de entrenamiento, pero el autor no lo confirma.
- Riesgo de alucinacion no aplica en sentido estricto al ser un clasificador, pero si existe riesgo de falsos positivos (bloquear entradas benignas) y falsos negativos (dejar pasar ataques novedosos o adversariales).
- Sesgos conocidos: no se documentan en la model card; al entrenar sobre datasets publicos de seguridad, puede heredar sesgos de composicion y de distribucion de ataques.
- Licencia Apache 2.0: permite uso comercial sin restricciones adicionales, pero el autor no ofrece garantias ni soporte.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en noviembre de 2026; se trata de un artefacto reciente y sin validacion externa, por lo que se recomienda evaluarlo en el dominio propio antes de llevarlo a produccion.
- No se publican checkpoints cuantizados oficiales ni artefactos ONNX; el despliegue en CPU o edge requiere conversion propia.

## Enlaces

- [Hugging Face: vennyvirtuoso/modernbert-prompt-injection-defense](https://huggingface.co/vennyvirtuoso/modernbert-prompt-injection-defense)
- [Modelo base: answerdotai/ModernBERT-base](https://huggingface.co/answerdotai/ModernBERT-base)
- [Dataset: deepset/prompt-injections](https://huggingface.co/datasets/deepset/prompt-injections)
- [vLLM](https://github.com/vllm-project/vllm)
- [Hugging Face Text Generation Inference (TGI)](https://github.com/huggingface/text-generation-inference)
- [ONNX Runtime](https://github.com/microsoft/onnxruntime)
- [TensorRT-LLM](https://github.com/NVIDIA/TensorRT-LLM)
- [Licencia Apache 2.0](https://opensource.org/licenses/Apache-2.0)
