# weihang44/video-dit-rubik-stage-b-bidir

## Resumen

El modelo `weihang44/video-dit-rubik-stage-b-bidir` es un archivo de checkpoints de investigación, no un modelo listo para producción, publicado por el usuario weihang44 en Hugging Face. Se trata de un Diffusion Transformer (DiT) de vídeo entrenado para generar secuencias de manipulación de un cubo de Rubik 2x2 con cámara fija y tres caras visibles. La variante Stage B: bidirectional denoisa conjuntamente los 20 fotogramas latentes futuros, a diferencia de la variante autorregresiva de la release Stage A, que reutiliza la historia visual generada en inferencia.

El repositorio agrupa siete tamaños de generador (XS, S, M, B, L, XL y XXL) con recuentos de parámetros que van de 19.698.448 a 938.377.232. Todos comparten 3D RoPE, SwiGLU, dimensión de cabeza 64, 16 canales latentes, parches latentes (1,2,2) y features de lenguaje cacheadas de 768 dimensiones; el VAE de Wan2.1 se usa congelado. El archivo completo ocupa 192,5 GB y planifica 332 checkpoints.

Su relevancia es fundamentalmente de investigación: permite estudiar leyes de escalado en difusión de vídeo, comparar generación bidireccional frente a autorregresiva y reproducir protocolos de entrenamiento con estados de optimizador y RNG. No se publican benchmarks y el autor advierte que no se garantiza que los modelos hayan convergido ni que resuelvan tareas del cubo de Rubik; además, la subida seguía en curso cuando se redactó la model card y la licencia no está especificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) de vídeo con 3D RoPE, SwiGLU, dimensión de cabeza 64, 16 canales latentes y parches latentes (1,2,2); condicionamiento por features de lenguaje cacheadas de 768 dimensiones; VAE de Wan2.1 congelado |
| Parametros totales | De 19.698.448 (variante XS) a 938.377.232 (variante XXL); la variante B tiene 115.788.304. Ver tabla de variantes |
| Parametros activos | No aplica: arquitectura densa, no es un modelo MoE |
| Longitud de contexto | no disponible (no se especifica una ventana de contexto en tokens; el modelo parte de 1 fotograma inicial frontal y un prompt de nueve acciones, y denoisa 20 fotogramas latentes futuros) |
| Tipos de cuantizacion | no disponible (se distribuyen checkpoints `.pt` sin versiones GGUF, AWQ, GPTQ ni similares) |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible (la model card indica que esta release no especifica ninguna concesión de licencia nueva) |
| Formato de pesos | `.pt` de PyTorch: `model_state_dict` crudo y `ema_parameter_state`; no safetensors ni GGUF; no son checkpoints de pipeline de Transformers ni de Diffusers |
| Tamano del repositorio | 192,5 GB |
| Checkpoints planificados | 332 |
| Resolucion y duracion de video | no disponible |
| Estado de la subida | En curso hasta que `manifest.json` reporte `complete: true` |

Tabla de variantes incluidas en el archivo:

| Variante | Parametros del generador | Anchura | Capas | Cabezas | Ultimos videos de entrenamiento guardados |
|---|---:|---:|---:|---:|---:|
| XS | 19.698.448 | 384 | 8 | 6 | 8.000.000 |
| S | 33.449.488 | 448 | 10 | 7 | 8.000.000 |
| M | 67.814.416 | 640 | 10 | 10 | 8.000.000 |
| B | 115.788.304 | 768 | 12 | 12 | 8.000.000 |
| L | 271.760.656 | 1088 | 14 | 17 | 6.607.312 |
| XL | 548.147.088 | 1408 | 17 | 22 | 7.276.160 |
| XXL | 938.377.232 | 1792 | 18 | 28 | 8.000.000 |

Los recuentos de la columna de exposición reflejan los vídeos realmente vistos, no el presupuesto solicitado. Las variantes L y XL de Stage B Bidir se detuvieron antes de los 8M y no se inventan checkpoints de 8M no guardados.

## Arquitectura y entrenamiento

La arquitectura es un transformer de difusión para vídeo en el espacio latente, con atención 3D y RoPE tridimensional, activación SwiGLU, dimensión de cabeza fija de 64, 16 canales latentes y parches latentes de forma (1,2,2). El condicionamiento de lenguaje se inyecta como features cacheadas de 768 dimensiones, y la representación visual se obtiene con un VAE de Wan2.1 congelado. En la variante bidireccional, el modelo denoisa los 20 fotogramas latentes futuros de forma conjunta, mientras que la variante autorregresiva de Stage A usa la historia visual generada durante la inferencia. El pipeline sigue un esquema de rectified flow, según las etiquetas del repositorio.

El protocolo de entrenamiento emplea un calentamiento lineal seguido de learning rate constante de 4e-4, con calentamiento sobre 16.384 vídeos. El lote efectivo es de 16 vídeos y cada vídeo aporta 5.120 tokens de parches objetivo futuros. El optimizador es AdamW con betas (0,9; 0,95), epsilon 1e-8, weight decay 0,05, recorte de gradiente de 1,0 y decaimiento EMA de 0,9999. La semilla de entrenamiento es 20260727. Para la variante autorregresiva se usa historia con teacher forcing limpio y una sola actualización de optimizador por lote efectivo. La continuación de Stage B utiliza segmentos de datos nuevos y disjuntos en lugar de repetir épocas. No se menciona RLHF, DPO ni ajuste por preferencias en la información disponible.

## Capacidades

- Generación de vídeo en dominio acotado: secuencias de manipulación de un cubo de Rubik 2x2 con cámara fija y tres caras visibles.
- Condicionamiento por lenguaje: acepta un prompt de nueve acciones que describe la secuencia.
- Condicionamiento visual: parte del fotograma frontal inicial como referencia.
- Generación bidireccional: denoisa los 20 fotogramas latentes futuros de forma conjunta, sin decodificación autorregresiva.
- Escalado controlado: siete variantes de tamaño con la misma arquitectura base, útil para experimentos de scaling laws.
- No soporta tool calling ni function calling.
- No está diseñado para flujos de agentes ni razonamiento multi-paso.
- Multilingüismo: no; solo inglés (`en`) según la información disponible.
- No dispone de modo de pensamiento (thinking mode), audio ni visión general más allá del fotograma condicionante.
- No es un modelo de propósito general: es un baseline de investigación para un dominio concreto.

## Casos de uso

- Estudio de leyes de escalado en difusión de vídeo: las siete variantes comparten 3D RoPE, SwiGLU y parches (1,2,2), y el VAE está congelado, lo que permite trazar pérdida frente a parámetros y exposición de entrenamiento con pocas variables de confusión.
- Comparación entre generación bidireccional y autorregresiva: contrastar esta release con Stage A AR-k4 cambiando únicamente el paradigma de decodificación (denoising conjunto de 20 fotogramas frente a historia visual generada).
- Reproducción de experimentos de entrenamiento: los archivos de `recovery/` incluyen estado del optimizador y RNG por rango, lo que permite reanudar el entrenamiento si se restauran los assets de datos y backbone.
- Aislamiento del efecto del VAE: al usar el VAE de Wan2.1 congelado, se puede medir qué parte del rendimiento depende del generador y qué parte de la representación latente.
- Evaluación de condicionamiento por lenguaje de acciones discretas: el prompt de nueve acciones junto al fotograma inicial permite estudiar el control de secuencias mediante lenguaje en un dominio acotado.
- Generación de datos sintéticos para investigación de planificación o reconocimiento: si la calidad lo permite, producir vídeos de estados de cubo 2x2 para entrenar modelos auxiliares, asumiendo que el autor no afirma que estos checkpoints resuelvan la tarea.
- Análisis de memoria y throughput en vídeo-difusión: comparar el coste de la atención 3D y de las activaciones entre variantes de 19,7M y 938,4M de parámetros.
- Fine-tuning a otras tareas de manipulación con cámara fija: al ser un baseline sin condicionamiento de estado vectorial ni pérdida auxiliar, es un punto de partida limpio para adaptar el DiT a otros objetos o secuencias de acciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas como FVD, PSNR, SSIM, precisión de resolución del cubo ni evaluaciones estándar de lenguaje (MMLU, HumanEval, GSM8K). El único dato cuantitativo de rendimiento es la exposición de entrenamiento por variante, recogida en la tabla de variantes de la sección de especificaciones, y el autor advierte explícitamente que no se trata de una afirmación de convergencia ni de resolución fiable de tareas del cubo de Rubik.

## Requisitos de hardware

- Peso teórico de los parámetros, calculado a partir de los recuentos facilitados (estimación, no dato oficial; el dtype de los checkpoints no se especifica):
  - XS: 19.698.448 parámetros, aproximadamente 37,6 MiB en bf16/fp16 y 75,1 MiB en fp32.
  - S: 33.449.488 parámetros, aproximadamente 63,8 MiB en bf16/fp16 y 127,6 MiB en fp32.
  - M: 67.814.416 parámetros, aproximadamente 129,3 MiB en bf16/fp16 y 258,7 MiB en fp32.
  - B: 115.788.304 parámetros, aproximadamente 220,8 MiB en bf16/fp16 y 441,7 MiB en fp32.
  - L: 271.760.656 parámetros, aproximadamente 518,3 MiB en bf16/fp16 y 1,01 GiB en fp32.
  - XL: 548.147.088 parámetros, aproximadamente 1,02 GiB en bf16/fp16 y 2,04 GiB en fp32.
  - XXL: 938.377.232 parámetros, aproximadamente 1,75 GiB en bf16/fp16 y 3,50 GiB en fp32.
- Memoria de activaciones: no documentada. En difusión de vídeo con 20 fotogramas latentes y atención 3D, la memoria de activaciones suele superar el peso de los parámetros, especialmente en las variantes XL y XXL.
- GPU recomendadas: no hay recomendaciones oficiales. De forma orientativa, cualquier GPU con 8 GB o más puede alojar las variantes pequeñas en lo que respecta al peso de los parámetros; para XL y XXL se necesitaría al menos 24 GB (RTX 3090, RTX 4090) si las activaciones se mantienen contenidas, o A100/H100 de 40-80 GB en configuraciones de mayor resolución o lote. Esta orientación no está confirmada por el autor.
- GPU de consumo: previsiblemente sí para XS, S, M y B en cuanto a pesos (entre 37,6 MiB y 220,8 MiB en bf16/fp16); la viabilidad real depende de la memoria de activaciones, que no está documentada.
- Opciones de despliegue: no es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje ni dispone de pesos GGUF. Requiere el código nativo de entrenamiento e inferencia del autor, que no está incluido en el repositorio, y cargar los archivos `.pt` directamente con PyTorch.
- Assets no incluidos: el VAE de Wan2.1, los assets de ModernBERT y de action-token, los datos y el código ejecutable no se distribuyen con el archivo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Paradigma | Parametros | Condicionamiento | Licencia | Estado |
|---|---|---|---|---|---|
| Stage B bidir (este modelo) | Difusión bidireccional; denoisa los 20 fotogramas latentes futuros de forma conjunta | 19,7M a 938,4M según variante | Fotograma inicial frontal y prompt de lenguaje de nueve acciones | no disponible | Archivo de checkpoints; subida en curso |
| Stage A AR-k4 | Autorregresivo; usa la historia visual generada en inferencia | no disponible | no disponible | no disponible | Release separada del mismo autor |

No se dispone en la informacion proporcionada de especificaciones verificables de otros modelos comparables de generación de vídeo para cubos de Rubik. El VAE de Wan2.1 se utiliza congelado, pero no se incluyen en esta ficha los parámetros ni las métricas del generador Wan2.1, por lo que no se puede establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Archivo de checkpoints, no un modelo validado: el autor indica explícitamente que no afirma que todos los modelos hayan convergido ni que resuelvan de forma fiable tareas del cubo de Rubik.
- Subida en curso: hay 332 checkpoints planificados y el estado solo se considera definitivo cuando `manifest.json` reporta `complete: true`; algunos archivos pueden faltar.
- Licencia no especificada: la release no concede ninguna licencia nueva, por lo que el uso comercial queda en una situación jurídica indeterminada.
- Assets y código no incluidos: faltan el VAE de Wan2.1, los assets de ModernBERT y de action-token, los datos y el código ejecutable de entrenamiento e inferencia; reanudar el entrenamiento exige restaurarlos y remapear rutas.
- Rutas reescritas: los metadatos locales se reescriben a `local-assets/` y se eliminan las identidades de W&B; el trainer original verifica los contratos de datos y protocolo, por lo que reanudar en otro entorno puede fallar.
- Gestión de EMA: los pesos crudos y los de EMA son distintos; para evaluar con EMA hay que sustituir los parámetros por nombre en el estado crudo preservando los buffers, ya que cargar solo los pesos crudos no aplica EMA automáticamente.
- Seguridad al cargar: los archivos de recuperación contienen objetos RNG de NumPy y pueden requerir `torch.load(..., weights_only=False)`, lo que implica riesgo si la fuente no es de confianza.
- Dominio muy restringido: cámara fija, cubo 2x2 y tres caras visibles; no hay evidencia de generalización a otros objetos, cámaras o cubos mayores.
- Idioma: solo inglés (`en`), con un prompt limitado a nueve acciones.
- Alucinación visual: no hay métricas publicadas de coherencia física o temporal; no se puede descartar la generación de secuencias inconsistentes.
- Sesgos: no documentados en la información disponible; el entrenamiento se centra en un único tipo de objeto y tarea.
- Sin benchmarks: la ausencia de métricas publicadas impide verificar la calidad frente a alternativas.
- Coste de almacenamiento: el repositorio completo ocupa 192,5 GB, lo que puede dificultar la descarga y el versionado.
- Fechas de publicación: Hugging Face indica creación y actualización el 2026-10-10; conviene verificar la vigencia del archivo antes de reutilizarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/weihang44/video-dit-rubik-stage-b-bidir
- Release Stage A AR-k4: https://huggingface.co/weihang44/video-dit-rubik-stage-a-ar-k4
- No se han proporcionado otros enlaces (paper, repositorio de código, demo o página de proyecto) en la informacion disponible.
