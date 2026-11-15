# yzdvai/tinystories-llama-64m

## Resumen

TinyStories Llama 64M es un modelo de lenguaje de 64,4 millones de parámetros entrenado desde pesos aleatorios sobre el corpus sintético TinyStories (Eldan y Li, 2023). Lo publica el usuario yzdvai en Hugging Face como parte de un trabajo de curso sobre leyes de escala, no como un asistente de propósito general. Su única función es generar cuentos infantiles cortos en inglés sencillo, y su interés práctico reside en que sirve como banco de pruebas reproducible de arquitectura tipo Llama a muy pequeña escala.

El modelo adopta un bloque transformer decoder-only estilo Llama con RoPE, RMSNorm pre-norm, SwiGLU y atención con query agrupada (GQA), implementado como un `LlamaConfig` estándar que carga sin código personalizado mediante `AutoModelForCausalLM`. La ventana de contexto es de 512 tokens, suficiente para una historia completa de unos 210 tokens, y el vocabulario es de 8.192 tokens con BPE a nivel de byte.

Es relevante ahora por dos motivos: por un lado, documenta de forma transparente el desajuste entre el presupuesto de cómputo real (90 minutos en 2 x Tesla T4) y el tamaño del modelo, con un análisis explícito de la ley de escala de Chinchilla simplificada; por otro, su licencia MIT y su reducido tamaño lo convierten en un ejemplo didáctico útil para estudiar entrenamiento, tokenización y evaluación de modelos pequeños sin infraestructura relevante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo Llama (RoPE, RMSNorm pre-norm, SwiGLU, GQA) |
| Parametros totales | 64.365.440 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos en safetensors; admite cuantizacion estandar de transformers/llama.cpp, no documentada por el autor) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria transformers) |

Detalle adicional de arquitectura: 13 capas, hidden size 640, 10 cabezas de atención de tamaño 64, 5 cabezas KV (2 cabezas query por cabeza KV), intermediate size 1728 en SwiGLU, vocabulario de 8.192 tokens con BPE a nivel de byte, sin biases y con embeddings de entrada y salida atados. Distribución de parámetros: SwiGLU 43.130.880 (67%), atención 15.974.400 (25%), embeddings 5.242.880 (8%).

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con un bloque Llama convencional: posiciones RoPE, normalización RMSNorm en configuración pre-norm, activación SwiGLU en la MLP y atención con query agrupada (GQA) con 10 cabezas query y 5 cabezas KV. No usa biases y ata los embeddings de entrada y salida, lo que reduce el coste del vocabulario. El autor eligió una forma más ancha y menos profunda (640 de ancho, 13 capas) que la referencia del curso (512 de ancho, 24 capas) para ganar velocidad por paso en GPU y procesar más tokens en el mismo tiempo, y un vocabulario pequeño de 8.192 tokens porque TinyStories emplea pocos miles de palabras distintas. El contexto de 512 tokens cubre con holgura una historia completa.

El entrenamiento se realizó desde pesos aleatorios sobre el split `train` de roneneldan/TinyStories (licencia CDLA-Sharing-1.0), con 900.000 historias muestreadas y 791.092 conservadas tras limpiar comillas y guiones, colapsar espacios, descartar historias de menos de 100 caracteres, con caracteres no ASCII (mayoritariamente daño de codificación) y duplicados exactos. El tokenizador BPE a nivel de byte se entrenó solo con las primeras 200.000 historias de entrenamiento. El resultado son 775.270 historias y 163.954.618 tokens en train, con 7.911 historias y 1,68 millones de tokens en validación y test. El entrenamiento usó 2 x Tesla T4 en Kaggle con precisión mixta float16, AdamW (betas 0.9 y 0.95, weight decay 0.1 solo en matrices de pesos), learning rate pico de 0.0006 con 100 pasos de calentamiento y decaimiento coseno hasta 6e-05, batch efectivo de 32.768 tokens por actualización, clipping de gradiente de 1.0 y semilla 42. Se ejecutaron 3.471 actualizaciones en 90 minutos, a 21.062 tokens por segundo, procesando 113.737.728 tokens (8,8% del plan de 20 tokens por parámetro y 0,69 pasadas sobre los datos, sin repetir ningún bloque). El schedule coseno sigue el reloj, de modo que el learning rate toca su suelo justo al agotarse el tiempo.

El autor incluye un análisis de ley de escala: con el cómputo realmente empleado (4,39e+16 FLOPs), la regla simplificada de Chinchilla (D = 20N, C = 6ND) daría un tamaño óptimo de unos 19 millones de parámetros, por lo que el modelo es más grande de lo que justifica su presupuesto de entrenamiento. La pérdida de validación bajó de 1,93 a 30 millones de tokens a 1,65 a 62 millones y 1,51 a 114 millones, con rendimientos decrecientes, y el autor espera una ganancia modesta, no grande, del 91% restante del plan, algo que no llegó a comprobar.

## Capacidades

- Generación de texto narrativo corto en inglés sencillo: cuentos infantiles de estructura simple, con final marcado por el token `<eos>` tras cada historia.
- Modelado de lenguaje autorregresivo con parada automática: no se usa token BOS y cada historia termina en `<eos>`, por lo que la generación se detiene sola.
- Razonamiento y matemáticas: no disponible; el modelo no está entrenado para estas tareas.
- Generación de código: no disponible; el corpus de entrenamiento son historias infantiles.
- Tool calling / function calling: no soportado.
- Soporte de agentes y razonamiento multi-paso: no soportado.
- Capacidades multilingües: solo inglés; el tokenizador y el corpus son monolingües.
- Capacidades especiales (modo thinking, visión, audio): ninguna.
- Carga estándar en `transformers` mediante `AutoModelForCausalLM` y `AutoTokenizer`, sin código personalizado.

## Casos de uso

- Docencia y prácticas sobre leyes de escala: el repositorio incluye `train.py` y todos los hiperparámetros, de modo que un estudiante puede reproducir el entrenamiento en 2 x T4 y comparar la curva de pérdida con la predicción de Chinchilla.
- Estudio de tokenización de dominio: el tokenizador BPE de 8.192 tokens entrenado solo con historias permite analizar cómo afecta un vocabulario pequeño a la relación entre tokens, parámetros y calidad en un corpus restringido.
- Generación de cuentos infantiles sintéticos para pruebas de pipelines: sirve para validar de extremo a extremo un flujo de generación con `transformers` (tokenización, muestreo con temperatura y top-k, parada por `<eos>`) sin coste de GPU.
- Pruebas unitarias de infraestructura de inferencia: al pesar 0,3 GB y cargar con `AutoModelForCausalLM`, es útil como modelo de humo para verificar despliegues de TGI o endpoints compatibles antes de pasar a modelos grandes.
- Investigación sobre sobreentrenamiento en corpus simples: la comparación entre pérdida de validación a 30, 62 y 114 millones de tokens permite estudiar cómo cambia la curva de aprendizaje cuando el corpus es más repetitivo que la web general.
- Experimentos de destilación y inicialización: su tamaño reducido y su licencia MIT lo hacen adecuado como modelo alumno o como inicialización en estudios de transferencia hacia tareas narrativas.
- Demostraciones educativas de generación de texto en el aula: la latencia baja y el tamaño permiten ejecutarlo en portátiles y mostrar el efecto de la temperatura y el top-k en vivo.

## Benchmarks y rendimiento

La model card incluye evaluación de entropía cruzada y perplejidad sobre historias no vistas, pero el texto proporcionado se corta en la tabla de evaluación ("Perpl"), por lo que solo se dispone de la pérdida de validación a lo largo del entrenamiento.

| Metrica | Valor |
|---|---|
| Perdida de validacion a 30M tokens | 1,93 nats |
| Perdida de validacion a 62M tokens | 1,65 nats |
| Perdida de validacion a 114M tokens | 1,51 nats |
| Perplejidad en test | no disponible (tabla truncada en la informacion proporcionada) |
| MMLU, HumanEval, GSM8K | no disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en float16, unos 0,13 GB de pesos (64,4 M de parámetros x 2 bytes) más el estado de atención para 512 tokens; en la práctica cabe en cualquier GPU con 1 GB o más. En float32, unos 0,26 GB.
- GPU recomendadas: el autor entrenó en 2 x Tesla T4 (Kaggle); para inferencia basta cualquier GPU consumer, incluida una GTX 1650 o una iGPU con suficiente memoria compartida.
- Cabe en GPU consumer: sí, en todas las generaciones recientes; también en CPU con latencia aceptable dado el tamaño.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM` (uso documentado por el autor), además de Text Generation Inference (el modelo lleva el tag `text-generation-inference` y `endpoints_compatible`); llama.cpp, Ollama o vLLM no están documentados por el autor para este modelo.
- Latencia y throughput: no se publican mediciones de inferencia; el único dato de velocidad es de entrenamiento, 21.062 tokens por segundo en 2 x T4.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TinyStories Llama 64M (yzdvai) | 64,4 M | 512 | 114 M tokens de TinyStories, 90 min en 2 x T4 | MIT | Hugging Face |
| Modelos TinyStories de referencia (Eldan y Li, 2023) | del orden de 1 M a 33 M (no disponible con precision) | no disponible | TinyStories completo | no disponible | paper y artefactos asociados |
| Modelos tipo GPT-2 small | 124 M | 1.024 | WebText, decenas de miles de millones de tokens | MIT | Hugging Face |

La comparación con GPT-2 small es solo orientativa por tamaño y arquitectura: aquel está entrenado con un corpus web mucho mayor y no es directamente comparable en calidad narrativa infantil. No se dispone de datos de benchmarks de este modelo frente a alternativas en la información proporcionada.

## Limitaciones y advertencias

- No es un asistente general: el autor lo describe explícitamente como un trabajo de curso sobre leyes de escala, no como un modelo conversacional.
- Entrenado con solo el 8,8% del presupuesto de tokens planificado y 0,69 pasadas sobre los datos; el autor espera una ganancia modesta, no grande, al completar el plan, algo que no verificó.
- El modelo es más grande de lo que justifica su cómputo según la regla de Chinchilla simplificada (óptimo estimado de 19 M de parámetros para 4,39e+16 FLOPs), por lo que está infraentrenado para su tamaño.
- Sesgos: el corpus TinyStories es sintético y de temática infantil; no se documenta ninguna evaluación de sesgos. El modelo puede reproducir estereotipos presentes en las historias generadas por el corpus.
- Riesgo de alucinación y de incoherencia: con una pérdida de validación de 1,51 nats, la generación es plausible a nivel de frase pero puede perder coherencia en historias largas o fuera del dominio.
- Limitación de idioma: solo inglés; no hay soporte multilingüe ni evaluación fuera del inglés.
- Limitación de contexto: 512 tokens, sin mecanismos de extensión; entradas más largas deben truncarse.
- Restricciones de licencia: MIT para el modelo; el dataset de origen TinyStories usa CDLA-Sharing-1.0, que conviene revisar si se redistribuyen datos derivados.
- Caveat para producción: no hay benchmarks estándar, ni evaluación de perplejidad completa publicada en la información disponible, ni mediciones de latencia de inferencia; no debe usarse en aplicaciones de cara al usuario sin una evaluación propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yzdvai/tinystories-llama-64m
- Script de entrenamiento en el repositorio: `train.py` (incluido en el repo del modelo)
- Dataset TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories
- Paper de TinyStories (Eldan y Li, 2023): no disponible como enlace en la información proporcionada
