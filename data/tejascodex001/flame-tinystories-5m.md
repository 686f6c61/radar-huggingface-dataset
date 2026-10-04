# Tejascodex001/flame-tinystories-5m

## Resumen

FLAME TinyStories-5M es un modelo de lenguaje decoder-only de 5.868.800 parámetros entrenado desde cero por el usuario Tejascodex001 con FLAME (Framework for Lightweight AI Model Engineering), un framework de entrenamiento escrito en Rust sobre Candle. El modelo se entrenó sobre el dataset TinyStories, compuesto por cuentos infantiles sintéticos en inglés, y su objetivo no es la producción sino la docencia y la investigación: demostrar que un transformer LLaMA-style completo puede entrenarse en una sola GPU de portátil en poco más de una hora y ejecutarse incluso en el navegador.

Arquitectónicamente es un transformer pre-norm de estilo LLaMA con 6 capas, dimensión de modelo 256, 8 cabezas de atención de 32 dimensiones, MLP SwiGLU con hidden 704, normalización RMSNorm y embeddings de entrada/salida atados. Usa RoPE como codificación posicional y un vocabulario de 4096 tokens byte-level BPE entrenado específicamente sobre TinyStories. La longitud de contexto es de solo 256 tokens, coherente con la naturaleza de las historias cortas que genera.

Su relevancia actual es doble. Por un lado, sirve como banco de pruebas reproducible para experimentar con arquitecturas de transformers pequeños y con toolchains no convencionales (Rust + Candle en lugar de PyTorch). Por otro, va acompañado de un visualizador interactivo en Hugging Face Spaces que ejecuta el modelo mediante WebAssembly y muestra cada valor intermedio del forward pass, lo que lo convierte en un recurso didáctico poco habitual para entender qué ocurre dentro de un transformer token a token.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only pre-norm estilo LLaMA |
| Parametros totales | 5.868.800 (embeddings de entrada/salida atados) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | No disponible (los pesos publicados son F32; no se documentan versiones cuantizadas) |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT (pesos y codigo) |
| Formato de pesos | safetensors (F32), con nombres de tensor propios de FLAME |
| Capas | 6 |
| d_model | 256 |
| Cabezas de atencion | 8 x 32 dimensiones |
| MLP | SwiGLU, hidden 704 |
| Normalizacion | RMSNorm, epsilon 1e-5, pre-norm con norm final |
| Posiciones | RoPE (theta 10000, rotate-half) |
| Vocabulario | 4096, BPE byte-level entrenado sobre TinyStories |
| Libreria | flame (Rust + Candle) |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only pre-norm de 6 bloques. Cada bloque aplica RMSNorm antes de la atención multi-cabeza con RoPE (theta 10000, rotate-half) y una conexión residual, seguida de otro RMSNorm antes del MLP SwiGLU de hidden 704, de nuevo con residual. La proyección final de logits reutiliza la matriz de embeddings atada al token embedding. El vocabulario de 4096 entradas se reserva así: los identificadores 0–255 son bytes crudos, el 256 es `<|endoftext|>`, el 257 es `<|pad|>` y a partir del 258 se asignan las fusiones BPE. El tokenizador se entrega en formato propio de FLAME (`flame_tokenizer.json`, con estructura `{"kind":"bpe","merges":[...]}`), no en el formato de la librería `tokenizers` de Hugging Face.

El entrenamiento se ejecutó durante 6000 pasos con AdamW, tasa de aprendizaje de 0.001 a 0.0001 con decaimiento coseno y 200 pasos de warmup, en lotes de 64 secuencias de 256 tokens (98,3 millones de tokens vistos en total). Se completó en 1,3 horas sobre una única RTX 3070 Ti de portátil. La pérdida final de entrenamiento fue 1.476 y la mejor pérdida de validación 1.545, alcanzada en el paso 6000. No se documenta ningún proceso de ajuste por instrucciones, RLHF o DPO: es un modelo base entrenado únicamente con modelado de lenguaje autoregresivo sobre TinyStories. La innovación técnica destacable no está en la arquitectura, que es canónica, sino en el stack: entrenamiento en Rust sobre Candle y una versión del motor compilada a WebAssembly que permite inferencia y visualización completa del forward pass en el navegador.

## Capacidades

- Generacion de texto: continúa prompts en inglés produciendo cuentos infantiles cortos y simples.
- Modelado de lenguaje base: puede usarse para calcular logits y probabilidades de secuencia, no solo para muestrear texto.
- Vocabulario byte-level: al partir de bytes crudos en los primeros 256 identificadores, no produce tokens desconocidos y puede representar cualquier cadena, aunque no haya sido entrenado en otros idiomas.
- Visualizacion interpretativa: el motor expone valores intermedios del forward pass, lo que permite inspeccionar atenciones y activaciones.
- Ejecucion en navegador: el motor WebAssembly permite inferencia completa en cliente sin backend.
- No dispone de tool calling ni function calling.
- No dispone de modo de razonamiento explicito (thinking mode).
- No dispone de capacidades multimodales (visión, audio) ni de agentes multi-paso.
- Multilingue: no. Solo inglés, y limitado al registro de cuentos infantiles.
- Ajuste por instrucciones: no. No sigue instrucciones ni mantiene rol de asistente.

## Casos de uso

- Docencia de transformers: el modelo y el visualizador permiten recorrer paso a paso el forward pass (embeddings, RMSNorm, atención con RoPE, SwiGLU) sobre un modelo real y no sobre un diagrama, lo que resulta idóneo para asignaturas de aprendizaje profundo.
- Experimentacion con toolchains alternativos: sirve como referencia reproducible para validar pipelines de entrenamiento en Rust + Candle frente a equivalentes en PyTorch, comparando pérdidas y tiempos sobre el mismo dataset.
- Inferencia en el navegador: integrado vía WebAssembly, permite demostraciones interactivas de generación de texto sin servidor ni coste de GPU, útil para portales educativos o talleres.
- Prototipado de generación creativa acotada: puede generar microcuentos infantiles en inglés para pruebas de producto, plantillas de contenido de ejemplo o datos sinteticos de baja complejidad.
- Pruebas de infraestructura y CI: por su tamano (unos 23 MB en F32), es util como carga de humo en pipelines de despliegue, verificando formatos, tokenizadores y motores de inferencia sin consumir recursos.
- Investigacion sobre modelos pequenos: permite estudiar curvas de escalado, efectos de la longitud de contexto (256 tokens) y limites de coherencia en modelos de menos de 10 M de parametros.
- Generacion de datasets sinteticos controlados: al producir texto simple y predecible, puede emplearse como generador de ejemplos base para tareas de filtrado, clasificacion o evaluacion de calidad de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card solo reporta metricas de entrenamiento:

| Metrica | Valor |
|---|---|
| Pasos de entrenamiento | 6000 |
| Tokens vistos | 98,3 millones |
| Perdida final de entrenamiento | 1.476 |
| Mejor perdida de validacion | 1.545 (paso 6000) |
| Tamano de lote | 64 secuencias x 256 tokens |
| Hardware de entrenamiento | RTX 3070 Ti (portatil) |
| Tiempo de entrenamiento | 1,3 horas |

## Requisitos de hardware

- VRAM para inferencia: aproximadamente 23 MB para los pesos en F32 (5.868.800 parametros x 4 bytes), mas el estado de atencion y las activaciones, que con contexto de 256 tokens y d_model 256 son marginales. En la practica cabe en cualquier dispositivo.
- GPU recomendadas: no requiere GPU dedicada. Cualquier GPU de consumo (RTX 3070 Ti o inferior) lo ejecuta sobradamente; tambien funciona en CPU e incluso en el navegador.
- Consumer GPU: si, cabe en cualquier GPU de consumo e integrada por su tamano minimo.
- Opciones de despliegue: la via oficial es FLAME (`flame generate --run runs/tinystories-5m --prompt "..."`). Tambien existe un motor independiente del proyecto del visualizador compilado a WebAssembly, que carga directamente `model.safetensors`, `config.json` y `flame_tokenizer.json` desde el hub. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI; ademas, el tokenizador no esta en formato Hugging Face, lo que complica su uso con esos motores sin conversion.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FLAME TinyStories-5M | 5,87 M | 256 tokens | Transformer LLaMA-style (Rust + Candle) | MIT | Hugging Face, motor WebAssembly |
| roneneldan/TinyStories-1M | 1 M | No disponible | Transformer (referencia del paper TinyStories) | No disponible en la informacion | Hugging Face |
| phmd/TinyStories-LSTM-5.5M | 5,5 M | No disponible | LSTM word-level, ONNX (~10,9 MB) | No disponible en la informacion | Hugging Face |
| usamaasif-ua/TinyStories-GPT | ~51 M | No disponible | GPT-style en PyTorch | No disponible en la informacion | GitHub |

La comparacion directa de calidad no es posible porque los modelos alternativos no publican en la informacion disponible perdidas comparables ni resultados de evaluacion. La diferencia principal de FLAME TinyStories-5M frente a ellos es el stack de entrenamiento (Rust + Candle) y el visualizador WebAssembly, no las cifras de rendimiento.

## Limitaciones y advertencias

- Entrenado solo con cuentos infantiles sinteticos: vocabulario ingles sencillo y narrativas cortas. No es un modelo de proposito general y conoce muy poco del mundo real.
- No sigue instrucciones: es un modelo base, por lo que no responde a peticiones en formato conversacional ni admite system prompts.
- Contexto muy limitado: 256 tokens, insuficiente para documentos, conversaciones largas o codigo.
- Sensibilidad a sesgos: los autores advierten de que las salidas pueden reflejar sesgos presentes en los datos de entrenamiento generados sinteticamente.
- Riesgo de alucinacion y repeticion: la model card avisa de que las salidas pueden ser repetitivas o incoherentes, algo esperable con 5,87 M de parametros y una perdida de validacion de 1.545.
- Idiomas: solo ingles. Aunque el vocabulario byte-level permite representar bytes de otros idiomas, no ha sido entrenado en ellos.
- Licencia: pesos y codigo bajo MIT, lo que permite uso comercial de los pesos. Los datos de entrenamiento (TinyStories) estan bajo CDLA-Sharing-1.0, que segun la model card no restringe los resultados producidos al computar sobre ellos.
- Compatibilidad: el tokenizador no esta en el formato de Hugging Face, lo que exige adaptaciones para usarlo con ecosistemas estandar.
- Uso en produccion: no recomendado para tareas reales de generacion de contenido; esta pensado para educacion e investigacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Tejascodex001/flame-tinystories-5m
- Visualizador interactivo (Hugging Face Spaces): https://huggingface.co/spaces/Tejascodex001/flame-visualizer
- Framework FLAME (RTensorLabs): https://github.com/RTensorLabs/FLAME
- Candle (Hugging Face): https://github.com/huggingface/candle
- Dataset TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories
- TinyStories-1M (modelo de referencia del paper): https://huggingface.co/roneneldan/TinyStories-1M
- TinyStories-LSTM-5.5M (alternativa comparable): https://huggingface.co/phmd/TinyStories-LSTM-5.5M
- TinyStoriesGPT-5M (implementacion en PyTorch): https://github.com/henilp105/TinyStoriesGPT-5M
- TinyStories-GPT (~51 M, PyTorch): https://github.com/usamaasif-ua/TinyStories-GPT
