# TOWIN-AI/OLMo-3.1-32B-THINK-FP8-DYNAMIC

## Resumen

TORQUEMADA-OLMo-3.1-32B-THINKING-FP8-W8A8-DYNAMIC es una variante cuantizada en FP8 Dynamic (W8A8) del modelo allenai/OLMo-3.1-32B-Think, publicada por TOWIN-AI. El modelo base es un transformer denso de 32.233.522.176 parametros (~32,2 B) desarrollado por el Allen Institute for AI (Ai2) dentro de la familia OLMo 3, orientado a razonamiento guiado y generacion de texto. Esta version mantiene la licencia Apache 2.0 y se distribuye en formato safetensors compatible con vLLM mediante `compressed-tensors`.

El objetivo de esta variante es reducir el coste de inferencia manteniendo la calidad del modelo original: la cuantizacion FP8 dinamica W8A8 (pesos y activaciones en 8 bits, escalas calculadas en tiempo de ejecucion sin calibracion manual) permite servir el modelo en una sola GPU con al menos 32 GB de VRAM, con cache KV tambien en FP8 E4M3. El autor declara contexto de hasta 65.536 tokens y un enfoque especifico al espanol, con salida estructurada en JSON y separacion configurable entre razonamiento y respuesta final.

Es relevante ahora porque combina tres piezas poco habituales en el ecosistema abierto: un modelo base plenamente abierto (OLMo 3 de Ai2, con datos y recetas publicados), una cuantizacion FP8 lista para produccion en vLLM y un ajuste declarado al espanol. La contrapartida es una validacion muy limitada: el propio autor reconoce pruebas con solo 7 casos y un juez automatico, y un rendimiento que degrada rapidamente a partir de 4 solicitudes concurrentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia OLMo 3), pesos y activaciones cuantizados en FP8 W8A8 dinamico |
| Parametros totales | 32.233.522.176 (~32,2 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 65.536 tokens (segun model card del autor) |
| Tipos de cuantizacion | FP8 Dynamic W8A8 (pesos y activaciones), cache KV en FP8 E4M3; sin calibracion manual |
| Idiomas soportados | Espanol (declarado `es`; el modelo base es multilingue, pero esta variante solo declara espanol) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (9 shards), `compressed-tensors`, compatible con vLLM |

## Arquitectura y entrenamiento

El modelo base, allenai/OLMo-3.1-32B-Think, es un transformer denso de ~32 B parametros de la familia OLMo 3 de Ai2, disenado con un modo "Think" que separa el razonamiento interno de la respuesta final. Esta variante no reentrena el modelo: aplica cuantizacion post-entrenamiento FP8 dinamica W8A8, donde los pesos y las activaciones se almacenan en 8 bits y las escalas de cuantizacion se calculan en tiempo de ejecucion por lote, evitando el proceso de calibracion con datos que requieren los esquemas estaticos. El autor incluye un script `quantize_fp8_dynamic.py` en su repositorio, lo que sugiere que la conversion se realizo con herramientas propias sobre los pesos originales.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF/DPO en esta variante; esos datos corresponden al modelo base de Ai2 y no se detallan en la model card proporcionada. Las innovaciones tecnicas declaradas son de despliegue, no de entrenamiento: prefix caching, chunked prefill, cache KV en FP8 E4M3, separacion configurable de marcadores de razonamiento/respuesta y compatibilidad con la API OpenAI de vLLM.

## Capacidades

- Generacion de texto en espanol con cumplimiento de instrucciones (el autor declara 100 % de cumplimiento en sus pruebas).
- Razonamiento guiado en modo "Think", con separacion configurable entre traza de razonamiento y respuesta final.
- Salida estructurada en JSON valido (100 % en los casos evaluados por el autor).
- Analisis y resumen de documentacion tecnica o normativa.
- Soporte de conversaciones multi-turno con contexto largo (hasta 65.536 tokens).
- Compatibilidad con la API OpenAI a traves de vLLM (chat completions, parametros de muestreo como `min_p`, `repetition_penalty`, `top_p`).
- No se declara soporte explicito de tool calling, function calling, agentes multi-paso, vision ni audio en la informacion disponible.

## Casos de uso

- Atencion al cliente automatizada en espanol: el modelo puede gestionar conversaciones multi-turno con contexto largo (hasta 65.536 tokens) para mantener el historial de la sesion sin truncar, adecuado para entornos de baja concurrencia (1-2 solicitudes simultaneas).
- Resumen de normativa y documentacion tecnica: el autor lo orienta explicitamente a analisis y resumen de documentacion normativa (por ejemplo, NIS2), un escenario donde el contexto largo permite ingerir documentos completos.
- Generacion de respuestas estructuradas en JSON: util para integrar el modelo como backend de extraccion de datos o rellenado de formularios, ya que el autor reporta JSON valido en todos los casos evaluados.
- Asistentes conversacionales internos: despliegue en una sola GPU con 32 GB de VRAM mediante vLLM y Docker, con API compatible con OpenAI, lo que simplifica la integracion en herramientas existentes.
- Apoyo a la decision con supervision humana: el autor lo posiciona para tareas de asistencia donde la salida se revisa antes de aplicarse, dado el riesgo de alucinacion declarado.
- Prototipos y entornos de desarrollo: al requerir solo 32 GB de VRAM y ofrecer 21,48 tok/s con una solicitud, es viable para pruebas de concepto y validacion de flujos antes de escalar a infraestructura mayor.
- Separacion de razonamiento y respuesta: util en pipelines que necesitan auditar la traza de razonamiento por separado de la respuesta final, gracias a los marcadores configurables.

## Benchmarks y rendimiento

El autor publica datos de throughput y TTFT (time to first token) medidos con vLLM, no benchmarks de calidad tipo MMLU o HumanEval:

| Concurrencia | Throughput agregado | TTFT |
|---|---|---|
| 1 solicitud | 21,48 tok/s | 130,65 ms |
| 2 solicitudes | 42,48 tok/s | 111,83 ms |
| 4 solicitudes | 42,54 tok/s | 6.272,51 ms |
| 8 solicitudes | 54,43 tok/s | 20.665,21 ms |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor indica que su evaluacion se limito a 7 casos con un juez automatico, sin detallar la metodologia ni los resultados por caso.

## Requisitos de hardware

- VRAM estimada: al menos 32 GB para pesos FP8 y cache KV (requisito declarado por el autor). El repositorio ocupa 33,3 GB en safetensors.
- GPU recomendadas: NVIDIA con soporte FP8, con ejemplo explicito de RTX 2000 Ada. No se detallan A100, H100 ni RTX 4090 en la informacion disponible, aunque cualquier GPU NVIDIA con soporte FP8 y VRAM suficiente deberia ser compatible.
- Cabe en GPU consumer: si, en modelos con 32 GB o mas de VRAM y soporte FP8 (el autor cita la RTX 2000 Ada como ejemplo).
- Otros requisitos declarados: 8 vCPU, 20 GiB de RAM, 110 GiB de almacenamiento NVMe, Ubuntu 24.04 LTS, Docker 24+, NVIDIA Container Toolkit.
- Opciones de despliegue: vLLM (imagen `vllm/vllm-openai:latest`) con Docker Compose; API compatible con OpenAI. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: 21,48 tok/s y 130,65 ms de TTFT con 1 solicitud; el rendimiento se degrada de forma severa a partir de 4 solicitudes concurrentes (TTFT de 6,3 s y 20,7 s con 4 y 8 solicitudes respectivamente).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TORQUEMADA-OLMo-3.1-32B-THINKING-FP8 | ~32,2 B | 65.536 | FP8 W8A8 dinamico | Apache 2.0 | Hugging Face (TOWIN-AI) |
| allenai/OLMo-3.1-32B-Think (base) | ~32,2 B | no disponible en la informacion | BF16 original | Apache 2.0 | Hugging Face (Ai2) |
| Otras variantes FP8 de modelos de ~32 B | no disponible | no disponible | FP8 | variable | no disponible |

La comparativa se limita al modelo base y a esta variante cuantizada; no se dispone de datos de benchmarks ni de especificaciones de alternativas comparables en la informacion proporcionada. La diferencia principal frente al base es el formato de pesos (FP8 frente a BF16), que reduce los requisitos de VRAM a costa de posible ruido en generaciones largas.

## Limitaciones y advertencias

- Alta concurrencia: el autor no lo recomienda para 4 o mas solicitudes simultaneas sin optimizar la configuracion de vLLM; el TTFT se dispara a 6,3 s con 4 solicitudes y 20,7 s con 8.
- Alucinaciones: el autor advierte explicitamente de que debe verificarse la informacion generada.
- Sesgos y toxicidad: no evaluados de forma exhaustiva por el autor.
- Cuantizacion FP8: puede introducir ruido en generaciones largas, segun reconoce el autor.
- Evaluacion limitada: pruebas con solo 7 casos y un juez automatico, sin benchmarks estandar de calidad.
- Idioma: solo se declara espanol; no hay evidencia de rendimiento en otros idiomas para esta variante.
- Licencia: Apache 2.0 permite uso comercial, pero se heredan las condiciones del modelo base de Ai2, que no se detallan en la informacion disponible.
- Estado del modelo: el autor lo describe como "publicable con advertencias", lo que sugiere que no esta validado para produccion de alta exigencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TOWIN-AI/OLMo-3.1-32B-THINK-FP8-DYNAMIC
- Modelo base: https://huggingface.co/allenai/OLMo-3.1-32B-Think
- Perfil del autor en Hugging Face: https://huggingface.co/TOWIN-AI
- Repositorio GitHub del autor: https://github.com/towinai
- Repositorio del despliegue (segun model card): https://github.com/towinai/torquemada-olmo31-fp8
