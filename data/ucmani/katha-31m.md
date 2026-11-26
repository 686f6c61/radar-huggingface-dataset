# ucmani/Katha-31M

## Resumen

Katha-31M es un modelo de lenguaje de arquitectura Llama con aproximadamente 31,5 millones de parametros, entrenado desde inicializacion aleatoria sobre un subconjunto del dataset TinyStories. Lo desarrolla el autor independiente ucmani (mrmoney24 en la model card) como proyecto de aprendizaje para comprender el flujo completo de preentrenamiento: tokenizacion, empaquetado de secuencias, presupuesto de memoria, perfilado y servicio. No es un modelo destinado a uso real en produccion.

El modelo emplea una arquitectura transformer decoder-only con 8 capas, tamano oculto 384, MLP de 1024 con SwiGLU, atencion con query agrupada (6 cabezas de query y 2 de key/value), RoPE, RMSNorm y embeddings de entrada/salida atados. Reutiliza el tokenizador de SmolLM2-135M (vocabulario de 49.152 tokens), lo que provoca que cerca del 60 % de los parametros residan en la tabla de embeddings, un desequilibrio notable para un modelo de este tamano.

Su relevancia es exclusivamente didactica: sirve como referencia minima para estudiar como se comportan el preentrenamiento, el consumo de VRAM y las herramientas de inferencia a escala muy reducida. Solo genera texto en ingles con el estilo de cuentos infantiles simples y no dispone de ajuste por instrucciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama), atencion con query agrupada (GQA), RoPE, RMSNorm, SwiGLU |
| Parametros totales | 31.463.808 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en fp32) |
| Idiomas soportados | Ingles |
| Licencia | other (pendiente de verificar por el autor; depende de los terminos del dataset TinyStories y del tokenizador SmolLM2) |
| Formato de pesos | safetensors (fp32, ~126 MB) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 8 capas con tamano oculto 384, MLP de 1024 con activacion SwiGLU, 6 cabezas de query y 2 de key/value (GQA), posiciones RoPE, normalizacion RMSNorm y embeddings de entrada/salida atados. El vocabulario es de 49.152 tokens, reutilizado del tokenizador de HuggingFaceTB/SmolLM2-135M; al ser desproporcionadamente grande para el tamano del modelo, aproximadamente el 60 % de los parametros corresponden a la tabla de embeddings.

El entrenamiento se realizo desde cero sobre los primeros ~200.000 cuentos de entrenamiento del dataset roneneldan/TinyStories (unas 222 palabras y 175 palabras por cuento segun la model card), tokenizados con el tokenizador de SmolLM2, con un token de fin de texto anadido y concatenados en bloques empaquetados de 512 tokens sin padding; el 2 % de los bloques se reservo para validacion (semilla 0). Se uso precision mixta fp16 (la T4 no soporta bf16) con el `Trainer` de transformers y `LlamaForCausalLM`, micro-lote de 8, 8 pasos de acumulacion de gradiente y 512 tokens por bloque (32.768 tokens por paso de optimizador), optimizador AdamW (beta2 = 0,95, weight decay 0,1), recorte de gradiente 1,0, tasa de aprendizaje maxima de 1e-3 con 200 pasos de calentamiento y decaimiento coseno. Se ejecutaron 3.000 pasos (unos 98 millones de tokens vistos) en aproximadamente 3 horas sobre una NVIDIA T4 de 16 GB en Google Colab, con checkpoints cada 500 pasos y reanudacion tras una desconexion.

## Capacidades

- Generacion de texto autoregresiva en ingles con el estilo de cuentos infantiles simples.
- Continuacion de texto a partir de un prompt (por ejemplo, "Once upon a time").
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de capacidades multilingues: solo ingles.
- No tiene modo de razonamiento (thinking), vision ni audio.
- No es un modelo ajustado por instrucciones: no responde a preguntas ni mantiene conversaciones.

## Casos de uso

- Estudio del flujo de preentrenamiento: sirve como ejemplo completo y reproducible de tokenizacion, empaquetado de secuencias, presupuesto de memoria y reanudacion de checkpoints en hardware modesto (una T4 de Colab).
- Banco de pruebas para herramientas de inferencia: al ser un modelo de ~31,5 M de parametros y 126 MB en fp32, permite validar integraciones con transformers, text-generation-inference o endpoints compatibles sin coste de GPU significativo.
- Experimentos de ajuste fino a pequena escala: su tamano permite probar recetas de fine-tuning y LoRA en una sola GPU consumer con ciclos de iteracion muy rapidos.
- Perfilado y optimizacion: util para medir throughput, latencia y uso de memoria de pasos de entrenamiento e inferencia con `torch.profiler` a escala minima.
- Docencia y divulgacion: ilustra de forma concreta el impacto del tamano del vocabulario en el reparto de parametros (aqui, ~60 % en embeddings) y el efecto de la longitud de contexto en el coste de atencion.
- Generacion de cuentos sinteticos de juguete: puede producir textos cortos con estructura narrativa simple para pruebas de pipelines de datos o de demostraciones, sin garantia de coherencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta perdida de entrenamiento y validacion bajo el tokenizador de SmolLM2:

| Metrica | Valor |
|---|---|
| Perdida inicial (pesos aleatorios) | 10,83 (ln 49.152 = 10,80, como se esperaba) |
| Perdida final de entrenamiento | 1,51 |
| Perdida final de validacion | 1,50 |

La perdida se calcula con este tokenizador concreto, por lo que no es comparable con modelos que usen otro vocabulario.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (pesos de ~126 MB mas activaciones y cache KV para 512 tokens); en fp16 o cuantizacion de 8 bits cabria en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el entrenamiento original se hizo en una NVIDIA T4 de 16 GB.
- Cabe en GPU consumer: si, en practicamente cualquier tarjeta moderna (GTX 1650, RTX 3060, RTX 4090, etc.), e incluso en CPU para inferencia interactiva.
- Opciones de despliegue: transformers (soporte nativo), text-generation-inference (etiqueta presente en el repositorio), endpoints compatibles; llama.cpp y Ollama requeririan conversion a GGUF, no publicada.
- Latencia y throughput: no disponible (la model card deja el throughput en T4 como TODO).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Katha-31M | 31,5 M | 512 | TinyStories (~98 M tokens), desde cero | other (pendiente de verificar) | Hugging Face |
| SmolLM2-135M | 135 M | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion | Hugging Face (solo se reutiliza su tokenizador) |
| TinyStories (modelos originales) | 1 M - 33 M | no disponible en la informacion | TinyStories | no disponible en la informacion | Paper arXiv:2305.07759 |

No se dispone de datos de rendimiento comparables entre estos modelos en la informacion proporcionada; la comparacion se limita a tamano y origen.

## Limitaciones y advertencias

- Entrenado unicamente con cuentos infantiles sinteticos en ingles: carece de conocimiento general y sus salidas pueden ser repetitivas, incoherentes o sin sentido.
- Hereda los sesgos del dataset TinyStories, que a su vez fue generado por modelos de lenguaje.
- No se realizo ajuste de seguridad, filtrado ni red-teaming mas alla de lo que aporta el dataset.
- Es un modelo base: no sigue instrucciones, no responde preguntas ni mantiene conversaciones.
- La licencia figura como "other" y el propio autor indica que esta pendiente de verificar los terminos del dataset TinyStories y del tokenizador SmolLM2; no debe asumirse uso comercial permitido.
- El contexto esta limitado a 512 tokens y el modelo solo funciona en ingles.
- No debe usarse para decisiones, generacion orientada a usuarios ni tareas donde la correccion importe.
- La model card contiene varios campos TODO sin completar (licencia, usuario de Hugging Face, numero exacto de cuentos, throughput, horas de GPU), lo que limita la reproducibilidad exacta del entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ucmani/Katha-31M
- Dataset TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories
- Paper TinyStories: https://arxiv.org/abs/2305.07759
- Tokenizador de referencia (SmolLM2-135M): https://huggingface.co/HuggingFaceTB/SmolLM2-135M
- Especificacion de model cards de Hugging Face: https://github.com/huggingface/hub-docs/blob/main/modelcard.md?plain=1
