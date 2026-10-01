# thechristyjo/laya-model-routing-1000hpo

## Resumen

Laya Model Routing — 1000hpo es un ajuste fino del modelo Laya de 421.293.830 parámetros (familia de 421M), desarrollado por el usuario thechristyjo. Su única función es clasificar una consulta de usuario en una de seis clases de enrutamiento de modelos, de modo que una aplicación pueda enviar cada petición al tipo de modelo de OpenRouter más adecuado. No es un modelo generativo: realiza una única pasada hacia delante (single forward pass) que tarda aproximadamente 35 ms en una GPU T4. Las seis clases de salida son `fast_cheap`, `general_mid`, `top_reasoning`, `code_specialist`, `security_specialist` y `long_context`.

El problema que resuelve es de orquestación y coste: en aplicaciones que combinan varios modelos, decidir cuál debe atender cada consulta suele requerir un modelo grande o reglas heurísticas. Al ser un clasificador de 421M, el coste de tomar esa decisión es mínimo frente al de invocar el modelo final, lo que permite enrutar dinámicamente maximizando calidad y minimizando gasto.

Este checkpoint concreto resulta de una búsqueda de hiperparámetros con Optuna (8 trials × 10 épocas sobre 500 filas) seguida de un entrenamiento final de 20 épocas sobre 1000 filas. Alcanza una exactitud de elección (choice_accuracy) de 0.910 sobre un conjunto de evaluación retenido de 100 consultas, empatando con el mejor resultado de su serie, aunque con una calibración (ECE 0.057) peor que la del checkpoint hermano 1000e12 (ECE 0.028). Se distribuye bajo licencia Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo transformers basado en Laya; el autor no detalla la arquitectura interna) |
| Parámetros totales | 421.293.830 |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el repositorio publica pesos en safetensors sin variantes cuantizadas listadas) |
| Idiomas soportados | inglés (el autor declara que el modelo es English-only) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Biblioteca | transformers |
| Tarea | clasificación de consultas en 6 clases de enrutamiento |
| Tamaño del repositorio | 1.7 GB |
| Latencia declarada | ~35 ms por pasada en T4 |
| Datos de entrenamiento | 1000 consultas de `ai-mitra/llm-router-dataset` (seed 42, filas 300-1299) |

## Arquitectura y entrenamiento

Se trata de un ajuste fino del modelo Laya (421M) orientado a una tarea de clasificación de opción múltiple sobre seis clases. El autor no documenta en la ficha la arquitectura interna de Laya (tipo de transformer, mecanismo de atención o si incorpora alguna innovación), por lo que ese dato queda como no disponible. La receta de entrenamiento empleada es RLCD (policy gradient combinado con proper scoring rule y cross-entropy), con entrenamiento distribuido (DDP) sobre 2× T4 y una calibración de temperatura posterior sobre una porción de retención.

Los datos provienen de 1000 consultas del dataset `ai-mitra/llm-router-dataset` (barajado con seed 42, filas 300-1299), etiquetadas por `glm-5.3` actuando como juez a través de Z.AI. El ajuste de hiperparámetros se realizó con Optuna `MedianPruner` (8 trials × 10 épocas sobre el subconjunto de 500 filas); el entrenamiento final corrió 20 épocas sobre 1000 filas con checkpointing al mejor epoch (pico de retención 0.967 en la época 13, desde el que se recargaron los pesos para la calibración de temperatura). Los hiperparámetros ganadores fueron `lr_encoder` 1.81e-5, `lr_head` 1.16e-4, σ 0.252→0.181, `ce_weight` 1.49, `w_sph` 0.78, `w_rps` 0.60 y weight decay 0.01.

## Capacidades

- Clasificación de consultas de usuario en seis clases de enrutamiento: `fast_cheap`, `general_mid`, `top_reasoning`, `code_specialist`, `security_specialist` y `long_context`.
- Salida estructurada de tipo `choice` con la clase recomendada, gestionada mediante la interfaz `agent.predict(query, questions)` de la librería `laya`.
- Inferencia de una sola pasada hacia delante, apta para ejecución en CPU (`device="cpu"`) o GPU.
- Discriminación por dominio: distingue consultas de código, de seguridad, de razonamiento complejo y de contexto largo.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta capacidad de agente ni de razonamiento multi-paso (la tarea es clasificar, no razonar sobre la respuesta).
- Capacidad multilingüe: no; el modelo es English-only según el autor.
- No dispone de modo de razonamiento extendido (thinking mode), visión ni audio.

## Casos de uso

- Enrutamiento de peticiones en aplicaciones multi-modelo: el clasificador decide, en una sola pasada, a qué clase de modelo de OpenRouter enviar cada consulta (barato, razonamiento, código, etc.), reduciendo el coste de orquestación frente a usar un modelo grande como router.
- Optimización de costes: al derivar las consultas triviales (`fast_cheap`) a modelos baratos y reservar los modelos caros para `top_reasoning` o `long_context`, se reduce el gasto medio por petición. El autor reporta que la etiqueta de referencia codifica la política de "clase competente más barata".
- Reducción de latencia en front-ends conversacionales: con ~35 ms por clasificación en T4, el enrutador añade una sobrecarga despreciable antes de invocar el modelo generativo final.
- Enrutamiento hacia modelos especializados en código: las consultas de escritura, depuración o revisión de código se dirigen a la clase `code_specialist` (recall 0.909 en evaluación).
- Enrutamiento de tareas de seguridad: consultas sobre vulnerabilidades, codificación segura, privacidad o autenticación se derivan a `security_specialist`, la clase con mejor recall (1.000).
- Triaje en pipelines de atención al cliente: usando `general_mid` (recall 0.960) para el grueso de preguntas cotidianas y reservando el resto para clases específicas.
- Pre-filtrado en aplicaciones RAG o de documentos largos: la clase `long_context` permite derivar a modelos de ventana amplia, aunque con las limitaciones de recall descritas más abajo.
- Integración como componente previo en plataformas de inferencia compatibles con endpoints (la etiqueta `endpoints_compatible` sugiere despliegue vía Hugging Face Inference Endpoints).

## Benchmarks y rendimiento

Resultados sobre el conjunto de evaluación retenido (100 consultas independientes, etiquetadas por juez). La serie se midió sobre el mismo conjunto (filas e12/hpo medidas en Kaggle T4/FP16):

| Filas de entrenamiento | Receta | Modelo | choice_accuracy | ECE ↓ |
|---|---|---|---|---|
| 0 | — | Laya base (zero-shot) | 0.630 | 0.169 |
| 200 | default, 12 ép | laya-model-routing | 0.820 | 0.125 |
| 500 | default, 8 ép | laya-model-routing-500 | 0.910 | 0.074 |
| 1000 | default, 6 ép | laya-model-routing-1000 | 0.870 | 0.087 |
| 500 | default, 12 ép | laya-model-routing-500e12 | 0.910 | 0.062 |
| 1000 | default, 12 ép | laya-model-routing-1000e12 | 0.900 | **0.028** |
| **1000** | **Optuna, 20 ép** | **este checkpoint** | **0.910** | 0.057 |

Líneas base: clase mayoritaria 0.270 · aleatorio 0.167.

Recall por clase (este checkpoint):

| Clase | Recall |
|---|---|
| security_specialist | 1.000 |
| general_mid | 0.960 |
| fast_cheap | 0.926 |
| code_specialist | 0.909 |
| long_context | 0.667 |
| top_reasoning | 0.000 |

El autor señala que tres ejecuciones distintas se sitúan en 0.910-0.920 de exactitud, por lo que el techo del conjunto de evaluación está limitado por los datos y no por el optimizador.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0.85 GB en FP16/BF16 y 1.7 GB en FP32 solo para los pesos, más el overhead de activaciones (estimación propia a partir del recuento de 421.293.830 parámetros; el autor no publica cifras de VRAM).
- GPU recomendadas: el autor reporta ~35 ms por pasada en una NVIDIA T4. Cualquier GPU con al menos 2-4 GB de VRAM libre es suficiente; también puede ejecutarse en CPU (`device="cpu"` en el ejemplo de uso).
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) e incluso en CPU, dado el tamaño reducido del modelo.
- Opciones de despliegue: la librería indicada es `transformers` y el ejemplo oficial usa la interfaz `laya.load(...)`; la etiqueta `endpoints_compatible` indica compatibilidad con Hugging Face Inference Endpoints. No se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: ~35 ms por pasada en T4 según el autor. No se publican cifras de throughput (peticiones por segundo).

## Comparativa con modelos similares

No se dispone de datos sobre modelos de enrutamiento de terceros con los que comparar directamente. La comparación más informativa es con los propios checkpoints de la serie del autor, evaluados sobre el mismo conjunto:

| Modelo | Parámetros | Contexto | choice_accuracy | ECE | Licencia |
|---|---|---|---|---|---|
| laya-model-routing-1000hpo (este) | 421M | no disponible | 0.910 | 0.057 | Apache 2.0 |
| laya-model-routing-1000e12 | 421M | no disponible | 0.900 | 0.028 | Apache 2.0 |
| laya-model-routing-500e12 | 421M | no disponible | 0.910 | 0.062 | Apache 2.0 |
| Laya base (zero-shot) | 421M | no disponible | 0.630 | 0.169 | Apache 2.0 |

Para comparativas con modelos de enrutamiento de otros proveedores: no disponible.

## Limitaciones y advertencias

- Calibración inferior a la de su hermano 1000e12 (ECE 0.057 frente a 0.028): el objetivo de búsqueda fue la exactitud, no el ECE. Para enrutamiento en producción con umbrales de confianza, el autor recomienda usar 1000e12; este checkpoint es preferible cuando prima la exactitud bruta.
- La clase `top_reasoning` cuenta con solo 6 filas de entrenamiento y nunca se predice (recall 0.000): necesita aumento de datos específico.
- La clase `long_context` tiene un recall de 0.667, ya que se entrenó con enunciados cortos sobre resumen y no con entradas largas reales.
- Sesgo de las etiquetas: las anotaciones provienen de un juez (`glm-5.3`) que aplica una política de "clase competente más barata", por lo que el modelo reproduce ese criterio y no necesariamente el óptimo para cada aplicación.
- Idioma: English-only. Las consultas en otros idiomas no están soportadas según el autor.
- Riesgo de clasificación errónea: al ser un clasificador, un fallo no produce alucinación de texto, pero sí puede enrutar la consulta a una clase inadecuada, degradando la calidad de la respuesta final del modelo generativo.
- Licencia Apache 2.0, que permite uso comercial, pero deben respetarse las condiciones de la licencia del modelo base Laya (convaiinnovations/laya) del que deriva.
- Solo 0 descargas y 0 likes en el momento de la consulta, lo que implica escasa validación externa por parte de la comunidad.
- No se documentan la longitud de contexto soportada, los tipos de cuantización ni el rendimiento en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/thechristyjo/laya-model-routing-1000hpo
- Modelo base Laya: https://huggingface.co/convaiinnovations/laya
- Checkpoint hermano laya-model-routing-1000e12: https://huggingface.co/thechristyjo/laya-model-routing-1000e12
- Checkpoint laya-model-routing: https://huggingface.co/thechristyjo/laya-model-routing
- Checkpoint laya-model-routing-500: https://huggingface.co/thechristyjo/laya-model-routing-500
- Checkpoint laya-model-routing-1000: https://huggingface.co/thechristyjo/laya-model-routing-1000
- Checkpoint laya-model-routing-500e12: https://huggingface.co/thechristyjo/laya-model-routing-500e12
- Dataset de entrenamiento (ai-mitra/llm-router-dataset): https://huggingface.co/datasets/ai-mitra/llm-router-dataset
- Repositorio con el pipeline y el registro de experimentos: https://github.com/lunakicks/laya-model-routing
