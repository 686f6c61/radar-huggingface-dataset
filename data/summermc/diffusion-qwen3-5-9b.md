# summerMC/Diffusion-Qwen3.5-9B

## Resumen

Diffusion-Qwen3.5-9B es un checkpoint de investigación experimental desarrollado por el usuario summerMC que convierte el modelo autoregresivo Qwen/Qwen3.5-9B en un modelo de lenguaje de difusión enmascarada (masked diffusion LM) al estilo LLaDA / Dream. En lugar de generar token a token de izquierda a derecha, el modelo produce texto mediante desenmascaramiento paralelo iterativo, eliminando la máscara causal en las capas de atención completa y añadiendo un escaneo bidireccional en las capas Gated DeltaNet. Sobre esta base se fusiona un módulo de refinamiento guiado por facebook/bart-base congelado.

El modelo tiene 8.953.803.264 parámetros (unos 8,95B) y, según el autor, se carga en bf16 con alrededor de 18 GB de VRAM. La conversión se realizó con un ajuste QLoRA de 4 bits (NF4), LoRA de rango 8 y alpha 16, sobre tan solo 256 muestras del dataset HuggingFaceTB/smoltalk, en dos etapas de 10 pasos cada una. Se distribuye bajo licencia Apache 2.0 y soporta inglés y japonés.

Es relevante ahora como ejemplo práctico de reconversión de un transformer autoregresivo moderno (con capas híbridas de atención y DeltaNet) en un paradigma de difusión, un área de investigación activa para acelerar la decodificación y permitir edición de texto. No obstante, el propio autor advierte de que es un checkpoint experimental sin evaluar, no apto para producción y con calidad esperada por debajo del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido bifidireccional con difusion enmascarada (masked diffusion / LLaDA-Dream style); capas de atencion completa sin mascara causal y capas Gated DeltaNet con escaneo forward+reverse; fusion con facebook/bart-base |
| Parametros totales | 8.953.803.264 (aprox. 8,95B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible para el checkpoint de difusion; el modelo base Qwen3.5-9B se reporta con contexto de 256K-1M tokens segun fuentes externas. El entrenamiento de difusion se realizo con longitud de secuencia 256 (prompt <= 128) |
| Tipos de cuantizacion | bf16 nativo (pesos fusionados); el autor menciona carga en 4-bit para GPUs mas pequenas; no se listan GGUF ni otras cuantizaciones |
| Idiomas soportados | en (ingles), ja (japones) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16, 4 shards) + fusion.pt (BART fusion) + dqwen_rev_gates.safetensors |

## Arquitectura y entrenamiento

La arquitectura parte de Qwen3.5-9B y aplica el parche `dqwen` (incluido en el repositorio) para convertirlo en un modelo de difusion enmascarada. En las capas de atencion completa se elimina la mascara causal, volviendolas bidireccionales. En las capas Gated DeltaNet se aplica un escaneo forward y reverse combinado mediante `out = orig(h) + g ⊙ flip(orig(flip(h)))`, con una puerta `rev_gate` por canal inicializada a cero. El token de mascara `[MASK]` se implementa con el token `<|fim_pad|>` y un embedding aprendido. La funcion de perdida es entropia cruzada sobre token enmascarado con ponderacion 1/t y prediccion desplazada (la posicion j se predice desde el hidden j-1) para mantener alineado el `lm_head` autoregresivo original.

El proceso de generacion es una decodificacion en dos fases: primero un borrador mediante remasking por bloques y despues un refinamiento guiado por BART de los tokens de menor confianza (el 30% mas bajo). El modulo BART usa `facebook/bart-base` en FP32 congelado, cuyo encoder alimenta un modulo de cross-attention con puerta cero que se inyecta en los embeddings de respuesta durante una pasada de refinamiento. El entrenamiento consistio en un QLoRA de 4 bits NF4 (computo bf16) con r=8, alpha=16, fusionado en pesos bf16, sobre 256 muestras de HuggingFaceTB/smoltalk, en dos etapas de 10 pasos: la etapa 1 ajusta LoRA, puertas y el embedding de mascara; la etapa 2 solo el modulo de fusion. El repositorio incluye aceleracion Triton opcional (fusión de proyecciones, kernels de DeltaNet, captura con CUDA graphs), validada contra la ruta PyTorch original antes de activarse.

## Capacidades

- Generacion de texto mediante desenmascaramiento paralelo iterativo (no autoregresivo).
- Modo de streaming con `stream`, exponiendo tokens comprometidos por paso y tokens aun indecisos (iguales a `dlm.mask_id`).
- Refinamiento guiado por BART para mejorar los tokens de baja confianza del borrador.
- Generacion con control de calidad mediante el parametro `thr` (confianza minima para fijar un token): valores bajos implican mayor velocidad y valores altos mayor calidad.
- Capacidades conversacionales heredadas del modelo base (tag `conversational`), con plantilla de chat de Qwen.
- Soporte multilingue limitado a ingles y japones.
- No se documenta soporte de tool calling, function calling, agentes ni vision en este checkpoint.
- Aceleracion Triton opcional en GPUs Ampere o posteriores.

## Casos de uso

- Investigacion en modelos de difusion para texto: permite experimentar con decodificacion por desenmascaramiento paralelo sobre un backbone moderno con capas hibridas DeltaNet/atencion.
- Prototipado de edicion y relleno de texto: la naturaleza bidireccional facilita tareas de infilling y correccion de fragmentos, algo mas costoso en modelos estrictamente autoregresivos.
- Estudio de estrategias de decodificacion: el parametro `thr` y el refinamiento por BART ofrecen un banco de pruebas para comparar compromisos velocidad/calidad frente a la decodificacion autoregresiva del modelo base.
- Generacion de pequenos asistentes conversacionales en ingles y japones en entornos de laboratorio, aprovechando el chat template de Qwen.
- Experimentos de aceleracion en inferencia: la ruta Triton con CUDA graphs y kernels fusionados sirve para medir ganancias de rendimiento en escenarios de difusion.
- Docencia y divulgacion: ejemplo reproducible de reconversion de un LLM densidad 9B a un paradigma de difusion con codigo incluido en el repositorio.
- Base para futuros ajustes: como punto de partida para fine-tuning adicional sobre el paradigma de difusion enmascarada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El propio autor indica explicitamente que no se ha ejecutado ninguna evaluacion ("Not evaluated: no benchmark has been run") y que la calidad esperada es inferior a la del modelo base.

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 18 GB, segun el autor (clase A100 / L4). Estimacion orientativa segun el numero de parametros: unos 9-10 GB en cuantizacion de 8 bits y unos 5-6 GB en 4 bits (valores no confirmados por el autor, que solo indica que la carga en 4-bit cabe en GPUs mas pequenas).
- GPU: el autor cita A100 y L4 como referencia. La ruta de aceleracion Triton requiere GPU Ampere o posterior (A100, L4, RTX 30xx o superior, H100).
- GPU de consumo: con carga en 4-bit podria caber en GPUs de consumo con suficiente VRAM, aunque no hay cifras confirmadas por el autor.
- Despliegue: no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI. La carga se realiza a traves del modulo `dqwen.hub` (funciones `load_pretrained`, `generate`, `stream`) y no mediante `AutoModelForCausalLM.from_pretrained` estandar, que devolveria un modelo causal sin la conversion a difusion.
- Latencia y throughput: no disponibles. El autor no publica mediciones; la velocidad depende del valor de `thr` (menor implica mas rapido) y de si se activa la aceleracion Triton.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Paradigma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Diffusion-Qwen3.5-9B (este) | 8,95B | no disponible (base 256K-1M) | Difusion enmascarada + fusion BART | apache-2.0 | HuggingFace, experimental |
| Qwen/Qwen3.5-9B (modelo base) | 9B (denso) | 262K-1M (segun fuentes externas) | Autoregresivo, multimodal nativo | apache-2.0 | HuggingFace |
| LLaDA / Dream (difusion LM) | no disponible | no disponible | Difusion enmascarada | no disponible | no disponible |

No se dispone de datos de benchmarks para establecer una comparacion cuantitativa de rendimiento entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- No evaluado: no se ha ejecutado ningun benchmark; la calidad se espera inferior a la del modelo base Qwen3.5-9B.
- Sin `generate()` autoregresivo: el parche bidireccional funciona sin cache KV ni de estado, por lo que no se puede usar la generacion estandar de transformers.
- Fragilidad frente a actualizaciones: los cambios en la implementacion de Qwen dentro de `transformers` pueden romper el parche `dqwen`.
- Entrenamiento muy reducido: solo 256 muestras y 20 pasos totales (10 + 10), por lo que el ajuste es minimo y puede degradar el comportamiento respecto al modelo base.
- Idiomas: solo ingles y japones.
- Requiere aplicar el parche `dqwen` y restaurar `rev_gates` y `mask_embed`; una carga estandar devuelve un modelo causal, no de difusion.
- La aceleracion Triton esta restringida a GPUs Ampere o posteriores y se desactiva automaticamente en entrenamiento, mascaras de padding, fusion BART, batch mayor que 1, 4-bit y GPUs pre-Ampere.
- Advertencia explicita del autor: checkpoint de investigacion experimental, no apto para uso en produccion.
- Licencia Apache 2.0, que permite uso comercial, aunque el estado experimental desaconseja el despliegue en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/summerMC/Diffusion-Qwen3.5-9B
- Modelo relacionado Diffusion-Qwen3.5-4B: https://huggingface.co/summerMC/Diffusion-Qwen3.5-4B
- Modelo relacionado Diffusion-Qwen3.8-27B: https://huggingface.co/summerMC/Diffusion-Qwen3.8-27B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Modelo base de la fusion: https://huggingface.co/facebook/bart-base
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceTB/smoltalk
- Referencia externa sobre Qwen3.5-9B: https://awesomeagents.ai/models/qwen-3-5-9b/
- Especificaciones de Qwen3.5-9B: https://apxml.com/models/qwen35-9b
- Modelo relacionado Qwen3.5-9B-SpeedX9-GDN32: https://huggingface.co/summerMC/Qwen3.5-9B-SpeedX9-GDN32
