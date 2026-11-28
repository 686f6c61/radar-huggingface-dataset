# Tamarillo/prompt-compressor-tiny-en

## Resumen

Tamarillo/prompt-compressor-tiny-en es un modelo encoder de 32,0 millones de parámetros especializado en compresión extractiva de prompts, es decir, en seleccionar qué tokens de un contexto largo deben conservarse para que un LLM lector posterior pueda responder con precisión. Lo desarrolla Tamarillo y se distribuye con licencia Apache-2.0, apoyándose en el backbone ModernBERT `jhu-clsp/ettin-encoder-32m` y formulándose como una tarea de token classification con dos etiquetas (`0: DROP`, `1: KEEP`).

El problema que aborda es concreto: los compresores extractivos dominantes en pipelines RAG y de agentes (`microsoft/llmlingua-2-*`) arrastran tres limitaciones prácticas: entrenamiento sobre `MeetingBank` con licencia CC-BY-NC-SA-4.0 (lo que complica el cumplimiento comercial), un tope duro de 512 tokens de contexto y huellas de CPU/navegador elevadas. Este modelo responde con pesos Apache-2.0 entrenados sobre `Tamarillo/prompt-compression-corpus-2026` v3, arquitectura ModernBERT con 7.999 embeddings posicionales máximos y exportaciones ONNX verificadas.

La relevancia actual reside en su relación tamaño-rendimiento: con 5,6 veces menos parámetros que `llmlingua-2-mBERT` (178M) supera a este en las tres suites públicas externas de QA en inglés (0,5695 frente a 0,5549) y en la media de cuatro suites en inglés incluyendo Agent JSON (0,6746 frente a 0,5979). En FP32 ONNX es 5,5 veces más pequeño (122,4 MB frente a 676,8 MB) y entre 3,75 y 3,97 veces más rápido en CPU de cuatro hilos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `ModernBertForTokenClassification` (etiquetas `0: DROP`, `1: KEEP`), backbone `jhu-clsp/ettin-encoder-32m` |
| Parametros totales | 32.031.746 (32,0M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 7.999 máximo arquitectónico; entrenado hasta 3.584 tokens; paridad ONNX y latencia CPU verificadas hasta 2.048 tokens |
| Tipos de cuantizacion | no disponible (se distribuyen exportaciones ONNX FP32 de 122,4 MB y FP16 de 61,3 MB) |
| Idiomas soportados | inglés (`en`); el benchmark incluye XQuAD en de/es/zh/ar/hi pero el modelo es English-only |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, ONNX (FP32 y FP16); compatible con transformers.js |

## Arquitectura y entrenamiento

El modelo es un encoder transformer ModernBERT para clasificación de tokens, construido sobre el backbone Ettin-encoder-32m, con 32,0M de parámetros y sin necesidad de `trust_remote_code`. La cabeza de clasificación emite una decisión binaria por token (conservar o descartar), lo que permite aplicar tasas de compresión exactas por retención de palabras. La ventana posicional llega a 7.999 tokens, muy por encima del tope de 512 de los encoders BERT/XLM-R usados por LLMLingua-2, y el entrenamiento se realizó con ejemplos multi-documento cosidos hasta 3.584 tokens.

El entrenamiento se hizo sobre el corpus `Tamarillo/prompt-compression-corpus-2026` v3 y el modelo se destila de su hermano mayor `Tamarillo/prompt-compressor-small`. La model card declara explícitamente que se evita `MeetingBank` (CC-BY-NC-SA) para facilitar el cumplimiento comercial, aunque remite a la sección de procedencia de datos para las notas de licencia a nivel de fuente. La evaluación se realizó con un lector congelado e independiente (`microsoft/Phi-4-mini-instruct`, decodificación greedy) para evitar sesgo de familia docente, comparando a presupuestos de retención exacta de palabras (`rate=0.50` y `rate=0.65`).

## Capacidades

- Compresión extractiva de prompts: clasifica cada token como conservar o descartar para reducir el contexto manteniendo la información necesaria.
- Tasas de compresión ajustables: soporta presupuestos de retención exactos (por ejemplo, 2× con `rate=0.50` y 1,5× con `rate=0.65`).
- Contexto largo: ventana arquitectónica de 7.999 tokens, entrenamiento hasta 3.584 y verificación ONNX/CPU hasta 2.048 tokens, sin troceado ciego a 512 tokens.
- Compresión de trazas JSON de agentes: evaluado en una suite Agent JSON (esquemas de Kubernetes y comercio electrónico).
- Ejecución sin PyTorch: exportaciones ONNX con paridad verificada para `onnxruntime` en Python.
- Ejecución en navegador y Node.js: compatible con `@huggingface/transformers` (transformers.js), incluida la exportación FP16 de 61,3 MB.
- Integración como utilidad: paquete auxiliar `duoi-bt/tamarillo-guardrails` con la clase `TamarilloPromptCompressor`.
- No soporta generación de texto, tool calling, agentes ni multimodalidad: es exclusivamente un componente de preprocesado.

## Casos de uso

- Compresión de contexto en pipelines RAG: antes de enviar los documentos recuperados al LLM generador, el modelo selecciona los tokens relevantes y reduce el prompt a la mitad, lo que baja coste por token y latencia del lector; su ventana de hasta 3.584 tokens entrenados evita el troceado ciego de los compresores de 512 tokens.
- Reducción de coste en atención al cliente automatizada: en conversaciones multi-turno con historial e información de producto inyectada, el compresor recorta el contexto manteniendo las entidades y cifras necesarias, con licencia Apache-2.0 apta para despliegue comercial.
- Compresión de trazas y logs JSON de agentes: para depuración y observabilidad de agentes, comprime trazas de herramientas y esquemas JSON antes de pasarlas a un modelo de análisis, caso cubierto por la suite Agent JSON incluida en la evaluación.
- Preprocesado en el navegador: con la exportación FP16 ONNX (61,3 MB) y transformers.js, se puede comprimir contexto en el cliente sin enviar el prompt completo al servidor, útil en aplicaciones web con requisitos de privacidad.
- Despliegue en edge y CPU sin GPU: con 122,4 MB en FP32 ONNX y latencias de 31,0 ms a 256 tokens y 73,7 ms a 512 tokens en CPU de cuatro hilos, encaja en servicios de inferencia sin acelerador.
- Reducción de contexto en razonamiento numérico y QA multi-documento: evaluado en GSM8K (problemas numéricos), HotpotQA (RAG multi-documento) y SQuAD-v2, sirve como etapa previa en pipelines de question answering sobre documentación extensa.
- Control de coste en gateways de LLM: como middleware previo a la API del modelo generador, aplica una tasa de retención configurable por petición para cumplir presupuestos de tokens.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente; `verified: false`). Lector congelado `microsoft/Phi-4-mini-instruct`, decodificación greedy.

| Metrica | Valor |
|---|---|
| Media 3 suites públicas EN (rate=0.50) | 0,5695 |
| Media 4 suites públicas (rate=0.50) | 0,5107 |
| Media 5 suites incl. Agent JSON (rate=0.50) | 0,6066 |
| Media 4 suites públicas (rate=0.65) | 0,6007 |

Comparaciones declaradas por el autor:

| Comparacion | prompt-compressor-tiny-en | llmlingua-2-mBERT (178M) | llmlingua-2-XLM-R-Large (560M) |
|---|---|---|---|
| Media 3 suites públicas EN (rate=0.50) | 0,5695 | 0,5549 | 0,5755 |
| Media 4 EN incl. Agent JSON | 0,6746 | 0,5979 | 0,6491 |
| Tamano FP32 ONNX | 122,4 MB | 676,8 MB | no disponible |
| Latencia CPU 4 hilos @256 tok | 31,0 ms | 123,2 ms | no disponible |
| Latencia CPU 4 hilos @512 tok | 73,7 ms | 276,7 ms | no disponible |

Suites de evaluación: HotpotQA (n=120), SQuAD-v2 (n=150), GSM8K (n=100), XQuAD en de/es/zh/ar/hi (n=120, 24 por idioma) y Agent JSON (n=100). Metricas: token F1 en QA/JSON y coincidencia numérica exacta en GSM8K. La exportación FP16 ONNX declara 38,3 ms en CPU a 256 tokens.

## Requisitos de hardware

- VRAM estimada: el modelo cabe holgadamente en cualquier GPU; en FP32 son aproximadamente 128 MB de pesos y en FP16 unos 64 MB, más activaciones.
- GPU recomendadas: no requiere GPU; cualquier GPU consumer (por ejemplo, RTX 4090) lo ejecuta con margen amplio. En servidor, A100 o H100 no aportan ventaja significativa frente a CPU para este tamaño.
- Cabe en GPU consumer: sí, en todas las GPU consumer actuales, e incluso en CPU y en navegador.
- Opciones de despliegue: `transformers` (PyTorch), `onnxruntime` en Python sin PyTorch, `@huggingface/transformers` (transformers.js) en navegador y Node.js, y el helper `duoi-bt/tamarillo-guardrails`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un encoder de clasificación de tokens.
- Latencia y throughput: 31,0 ms a 256 tokens y 73,7 ms a 512 tokens en CPU de cuatro hilos con ONNX FP32; 38,3 ms a 256 tokens con ONNX FP16.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Media 3 suites EN (rate=0.50) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tamarillo/prompt-compressor-tiny-en | 32,0M | 7.999 (entrenado 3.584) | 0,5695 | Apache-2.0 | Hugging Face, ONNX, transformers.js |
| microsoft/llmlingua-2-mBERT | 178M | 512 | 0,5549 | entrenado sobre MeetingBank (CC-BY-NC-SA-4.0) | Hugging Face |
| microsoft/llmlingua-2-XLM-R-Large | 560M | 512 | 0,5755 | entrenado sobre MeetingBank (CC-BY-NC-SA-4.0) | Hugging Face |
| Tamarillo/prompt-compressor-small | no disponible | no disponible | no disponible (modelo docente) | no disponible | Hugging Face |

## Limitaciones y advertencias

- Solo inglés: el modelo está entrenado y etiquetado para `en`; la evaluación XQuAD en de/es/zh/ar/hi mide robustez del pipeline, no competencia multilingüe del compresor.
- Compresión extractiva: no reescribe ni resume; solo descarta tokens, por lo que puede eliminar matices necesarios en tareas de razonamiento abierto.
- Riesgo de pérdida de información: a `rate=0.50` se descarta la mitad del texto; en dominios con dependencias de largo alcance la respuesta del lector puede degradarse.
- Benchmarks no verificados: las métricas de la model card están marcadas como `verified: false` y proceden del propio autor.
- Sesgo de dominio: la suite Agent JSON comparte familia de dominio con datos de entrenamiento (`agent_json_log`), por lo que su rendimiento puede no generalizar a otros esquemas.
- Licencia: los pesos son Apache-2.0, pero la model card remite a notas de procedencia de datos a nivel de fuente; conviene revisar `Tamarillo/prompt-compression-corpus-2026` antes de un uso comercial estricto.
- No es un modelo generativo: no debe usarse como LLM, sino como etapa de preprocesado; integrarlo mal (por ejemplo, sin preservar el formato del prompt) puede romper instrucciones del sistema.
- Ventana efectiva menor que la arquitectónica: aunque soporta 7.999 posiciones, el entrenamiento llega a 3.584 y la verificación ONNX/CPU a 2.048 tokens; más allá de esos rangos el comportamiento no está garantizado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Tamarillo/prompt-compressor-tiny-en
- Modelo base: https://huggingface.co/jhu-clsp/ettin-encoder-32m
- Dataset de entrenamiento: https://huggingface.co/datasets/Tamarillo/prompt-compression-corpus-2026
- Modelo hermano (docente): https://huggingface.co/Tamarillo/prompt-compressor-small
- Paquete auxiliar: https://github.com/duoi-bt/tamarillo-guardrails
- Demo en navegador: https://huggingface.co/spaces/Tamarillo/prompt-compressor-demo
- Suite de guardrails para agentes: https://huggingface.co/spaces/Tamarillo/agent-guardrails-suite
