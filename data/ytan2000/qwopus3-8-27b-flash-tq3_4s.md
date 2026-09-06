# YTan2000/Qwopus3.8-27B-Flash-TQ3_4S

## Resumen

Qwopus3.8-27B-Flash-TQ3_4S es un modelo de lenguaje multimodal de 27.320 millones de parámetros, publicado por YTan2000. Se trata de un fine-tune del modelo Qwen/Qwen3.8-27B, optimizado para cargas de trabajo de agentes que requieren baja latencia y completaciones concisas. El modelo se distribuye en formato GGUF con cuantización TurboQuant TQ3_4S, un esquema de cuatro escalas que consigue un tamaño de archivo de 13.6 GB manteniendo una precisión de 4.00 bits por peso. Incluye el head MTP/NextN del modelo original para decodificación especulativa y un proyector de visión (mmproj) que permite entrada de imágenes y vídeo.

La relevancia de este modelo radica en su enfoque en la velocidad de inferencia en entornos de agentes. Frente al modelo base, el ajuste Flash prioriza la finalización de tareas con menos tokens y una latencia menor, lo que lo hace adecuado para despliegues locales en GPUs de consumo como la RTX 3090. Su arquitectura densa de 27B, con ventana de contexto de 32.768 tokens y soporte multimodal, lo convierte en una opción interesante para prototipos de agentes con razonamiento y visión en un único modelo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen/Qwen3.8-27B) con proyector de visión y head MTP/NextN para decodificación especulativa |
| Parámetros totales | 27.320.697.856 (27.3B) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantización | TurboQuant TQ3_4S (4.00 BPW; requiere runtime llama.cpp-tq3) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (TQ3_4S) + mmproj-F32.gguf para visión |

## Arquitectura y entrenamiento

El modelo es un transformer denso basado en Qwen3.8-27B, que a su vez es un modelo de lenguaje multimodal de la familia Qwen. La arquitectura incluye un proyector de visión (mmproj) que permite el procesamiento de imágenes y vídeo, además de un head MTP/NextN para decodificación especulativa sin necesidad de un modelo auxiliar. El fine-tune Flash se ha diseñado para generar completaciones tersas y orientadas a agentes, sacrificando parte de la capacidad de razonamiento algorítmico exploratorio a cambio de una finalización más rápida de tareas en bucles de agente. La cuantización TQ3_4S se aplica directamente desde los pesos BF16 oficiales, sin necesidad de matriz de importancia, en una única pasada que incluye el head MTP. No se dispone de información detallada sobre los datos de entrenamiento ni sobre procesos de alineación como RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento: incluye un bloque de razonamiento (`reasoning_content`) cuando se usa con el formato deepseek, con presupuesto configurable.
- Multimodal: entrada de imágenes y vídeo mediante el proyector de visión `mmproj-F32.gguf`, compatible con el pipeline `image-text-to-text`.
- Decodificación especulativa: el head MTP/NextN cuantizado desde BF16 permite auto-especulación con una sola GPU, con tasas de aceptación del 66-67% en código y del 38% en prosa.
- Soporte de agentes: el objetivo del fine-tune es reducir el número de tokens por tarea y acelerar los bucles de agente, con completaciones concisas y orientadas a la acción.
- Compatibilidad con API de chat: el modelo es compatible con endpoints tipo OpenAI (vía `llama-server`) y soporta conversaciones multi-turno.
- Tool calling: no se menciona explícitamente en la documentación disponible; la integración con herramientas debería implementarse en la capa de aplicación.

## Casos de uso

- Agentes autónomos en local: gracias a la optimización Flash y a la decodificación especulativa, el modelo puede ejecutar bucles de razonamiento y acción con menor latencia. Se desplegaría con `llama-server` en una RTX 3090, con `--reasoning-format deepseek` y `--reasoning-budget 4096`, lo que permite controlar el tiempo de razonamiento.
- Generación de código en pipelines de CI/CD: su rendimiento en Hard86 (88.4%, 0 fallos de compilación) y su estilo de completación terso lo hacen adecuado para generar código que debe pasar pruebas unitarias. Puede integrarse en scripts de automatización que llaman a la API de chat para generar o corregir código.
- Análisis de imágenes y vídeo en tiempo real: al incluir el proyector de visión, el modelo puede recibir frames de vídeo o imágenes y razonar sobre su contenido, por ejemplo para describir escenas o detectar objetos, todo en el mismo entorno de inferencia local.
- Asistentes de conversación de bajo consumo: el modelo cabe completo en una GPU de consumo (RTX 3090 24 GB) y ofrece aproximadamente 48 tokens por segundo, por lo que puede servir como asistente personal local sin depender de servicios en la nube.
- Servicio de inferencia compatible con OpenAI: se puede usar `llama-server` con `--jinja` para exponer un endpoint `/v1/chat/completions`, facilitando la integración con frameworks de agentes existentes que esperan la API de OpenAI.
- Prototipado de razonamiento controlado: el presupuesto de razonamiento permite ajustar la cantidad de tokens de pensamiento según la tarea; útil para investigar el equilibrio entre calidad y latencia en aplicaciones de razonamiento con pocos recursos.

## Benchmarks y rendimiento

Resultados declarados por el autor, medidos en RTX 3090 con presupuesto de razonamiento 4096, temperatura 0.0 y seed 42. El model-index de HuggingFace no incluye resultados; los datos provienen de la model card.

| Suite | Puntuación |
|---|---|
| Hard86 (86 aserciones, código probado unitariamente) | 88.4% (76/86), 0 fallos de compilación |
| HumanEval pass@1 | 66.5% |
| HumanEval+ | 65.2% |
| MBPP pass@1 | 79.1% |
| MBPP+ | 69.0% |
| three.js voxel-garden gate (3 semillas, temp 0.7) | 3/3 PASS, mejor render-variance 87.8 |
| Decode sin especulación | ~48 tok/s |
| Decode con draft-MTP (código) | ~60 tok/s, acceptance 0.66–0.67 |

## Requisitos de hardware

- VRAM estimada: 13.6 GB de pesos + 1.8 GB de mmproj + KV cache. Con una ventana de contexto de 32.768 tokens, cabe en una GPU de 24 GB (RTX 3090).
- GPU recomendada: RTX 3090 24 GB (validada por el autor); también compatible con RTX 4090, A100 40 GB o superiores.
- Cabe en GPU de consumo: sí, en RTX 3090 y RTX 4090 con carga completa en GPU (`-ngl 99`).
- Opciones de despliegue: `llama.cpp-tq3` (runtime custom), `llama-server` con endpoints compatibles con OpenAI. No se mencionan vLLM ni TGI.
- Latencia y throughput: ~48 tok/s en un único stream sin especulación; ~60 tok/s en código con draft-MTP. La tasa de aceptación del draft es de 0.66–0.67 en código y 0.38 en prosa.

## Comparativa con modelos similares

Comparación directa con Qwen3.8-27B-TQ3_4S, el mismo modelo base y formato de cuantización, pero sin el ajuste Flash. Los protocolos difieren entre ambos (presupuesto 256 vs 4096), por lo que las diferencias deben interpretarse con cautela.

| Parámetro | Qwen3.8-27B-TQ3_4S (base) | Qwopus3.8-27B-Flash-TQ3_4S (este modelo) |
|---|---|---|
| Hard86 | 74/86 (86.0%), reasoning-off | 76/86 (88.4%), budget 4096, 0 fallos de compilación |
| HumanEval / HumanEval+ | 92.7 / 88.4, budget 256 | 66.5 / 65.2, budget 4096 |
| MBPP / MBPP+ | 90.5 / 77.2, budget 256 | 79.1 / 69.0, budget 4096 |
| three.js garden gate | 5/6 (effort-low battery) | 3/3 (seeds 1–3) |
| Decode sin especulación | no disponible | 48 tok/s |
| Decode con draft-MTP | 64.8 tok/s, acceptance 0.849 | ~60 tok/s, acceptance 0.66–0.67 |
| Tamaño / BPW | 13.8 GB / 4.24 | 13.6 GB / 4.00 |
| Licencia | Apache 2.0 | Apache 2.0 |

## Limitaciones y advertencias

- Requiere runtime custom `llama.cpp-tq3`; los builds estándar de llama.cpp no pueden cargar archivos TQ3_4S.
- El formato de cuantización TurboQuant TQ3_4S es propietario y no está soportado por la mayoría de herramientas del ecosistema.
- Idioma declarado: únicamente inglés (en), aunque el modelo base Qwen podría tener capacidades multilingües no documentadas en este build.
- El model-index de HuggingFace está vacío; los benchmarks presentados son declarados por el autor y no han sido replicados de forma independiente.
- Descargas y likes en HuggingFace: 0, lo que indica escasa adopción o validación en producción.
- El ajuste Flash sacrifica rendimiento en HumanEval y MBPP en favor de la velocidad y la finalización de tareas de agente; no es un modelo generalista de código.
- La decodificación especulativa con MTP requiere activar `--spec-type draft-mtp` y puede no estar disponible en todos los entornos.
- No se dispone de información sobre sesgos, alucinaciones o riesgos de seguridad; se recomienda una evaluación específica antes de un uso en producción.
- La licencia Apache 2.0 permite uso comercial, pero la responsabilidad del despliegue recae en el usuario.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/YTan2000/Qwopus3.8-27B-Flash-TQ3_4S
- Runtime requerido: https://github.com/turbo-tan/llama.cpp-tq3
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Modelo fuente del fine-tune: https://huggingface.co/Jackrong/Qwopus3.8-27B-Flash
- Variante base del mismo formato: https://huggingface.co/YTan2000/Qwen3.8-27B-TQ3_4S
