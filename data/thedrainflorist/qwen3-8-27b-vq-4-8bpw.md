# TheDrainFlorist/Qwen3.8-27B-VQ-4.8bpw

## Resumen

TheDrainFlorist/Qwen3.8-27B-VQ-4.8bpw es una cuantización vectorial (VQ) del modelo Qwen3.8-27B, un modelo denso de 27 mil millones de parámetros desarrollado por Qwen, especializado en tareas de lenguaje y visión. Esta variante, creada por TheDrainFlorist, está diseñada específicamente para Apple Silicon y se distribuye en formato MLX, lo que permite ejecutarla con la librería `mlx-lm` sin parches adicionales. El checkpoint incluye la torre de visión bf16 original (0.859 GiB) y aplica cuantización vectorial únicamente a los MLP densos, con codebooks de 512 entradas y una precisión efectiva de 4.75 bits por peso.

La relevancia de este modelo radica en que, al momento de su publicación, no existía ninguna cuantización en formato MLX de Qwen3.8-27B, por lo que esta build llena un vacío para usuarios de Mac que necesitan ejecutar un modelo de 27B con calidad cercana al original. Según las mediciones del autor, esta versión es un 28% más cercana al teacher bf16 que una cuantización afín de 4 bits, con un coste de solo un 3.3% más de bytes. El modelo está pensado para entornos con 24 GB de memoria unificada, siendo una opción práctica para desarrollo local, prototipado y aplicaciones de producción ligera en hardware de Apple.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atención híbrida (16 de 64 capas con atención completa, 48 con atención lineal) |
| Parametros totales | 27B (modelo base); checkpoint cuantizado: 4.665.658.608 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | VQ 4.8 bpw (4.75 bits por peso en superficie cuantizada, codebooks fp16 de 512 entradas, resto 8-bit) |
| Idiomas soportados | Inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura de atención híbrida: solo 16 de las 64 capas utilizan atención completa (con un intervalo de 4), mientras que las otras 48 usan atención lineal con un estado recurrente constante. Esta combinación reduce el coste computacional manteniendo la capacidad de modelado de dependencias a largo plazo. La cuantización vectorial aplicada por TheDrainFlorist se centra en el trío de MLP densos, utilizando una geometría uniforme: cada subvector de 2 pesos se codifica con un índice de 9 bits en un codebook de 512 entradas por tensor, más una escala fp16 por cada 64 pesos. El proceso de ajuste se realiza mediante k-means en el espacio de pesos, sin usar Hessian, estadísticas de activación ni corpus de calibración. El fit está sembrado (seed fija), lo que garantiza reproducibilidad bit a bit del artefacto. La torre de visión se injerta desde el checkpoint base y se verifica clave por clave, incluyendo el layout de patch-embedding en canales-last.

## Capacidades

- Generación de texto y conversación: el modelo base es un modelo de lenguaje instructivo, capaz de mantener diálogos multi-turno y seguir instrucciones complejas.
- Razonamiento y matemáticas: evaluado en tareas como MathVision, donde se le pide razonar paso a paso y dar respuestas en formato `\boxed{}`.
- Codigo: el modelo base presenta mejoras significativas en tareas de programación, tanto en modalidad textual como visual.
- Vision: incluye una torre de visión bf16 completa, lo que permite procesar imágenes y responder preguntas visuales, aunque la cuantización se aplica solo a los MLP densos.
- Productividad ofimatica: el modelo base está optimizado para tareas de oficina, como generación de documentos, hojas de cálculo y presentaciones.
- Multilingue: aunque la model card indica solo inglés, el modelo base Qwen3.8-27B soporta múltiples idiomas; sin embargo, esta build no declara explícitamente otros idiomas.

## Casos de uso

- Asistente de codigo en Mac: un desarrollador puede ejecutar este modelo localmente en un Mac con 24 GB de RAM para autocompletar código, generar funciones y explicar fragmentos, aprovechando la baja huella de memoria (14.59 GiB residentes) y la integración con `mlx-lm`.
- Analisis de imagenes y documentos: gracias a la torre de visión incluida, se puede usar para extraer texto de capturas, describir diagramas o responder preguntas sobre imágenes en entornos sin conexión.
- Prototipado rapido de agentes conversacionales: al ser un modelo instructivo, permite construir chatbots de atención al cliente o asistentes virtuales con razonamiento multi-paso, ejecutándose en hardware de Apple sin necesidad de GPU dedicada.
- Generacion de informes y contenido ofimatico: el modelo base está afinado para tareas de productividad, por lo que puede redactar correos, resumir actas o generar borradores de documentos directamente en la máquina local.
- Educacion y formacion: sirve como herramienta de tutoría para explicar conceptos de programación, matemáticas o ciencias, con la ventaja de funcionar sin conexión y con privacidad de datos.
- Evaluacion de modelos cuantizados: para investigadores interesados en técnicas de compresión, este artefacto ofrece un caso de estudio reproducible de VQ aplicada a un modelo de 27B, con métricas de divergencia KL y acuerdo top-1 frente al teacher bf16.

## Benchmarks y rendimiento

La model card proporciona mediciones propias del autor, comparando esta build VQ con conversiones afines del mismo modelo y con el teacher bf16. Los resultados se obtuvieron con `mlx-lm` sin modificar, sobre el mismo corpus.

| Build | Tamano | KL a bf16 (mnats/tok) | Acuerdo top-1 | Perplejidad |
|---|---|---|---|---|
| Afin q2 (propia) | 8.69 GiB | 1426.9 | 46.1% | 16.435 |
| Afin q3 (propia) | 11.82 GiB | 187.8 | 79.5% | 5.832 |
| Afin q4 (propia) | 14.95 GiB | 45.8 | 89.8% | 5.206 |
| **Este modelo (VQ 4.8)** | **15.45 GiB** | **32.8** | **90.8%** | 5.162 |
| Afin q6 (propia) | 21.21 GiB | 3.71 | 96.8% | 5.260 |
| Afin q8 (propia) | 27.48 GiB | 1.25 | 98.5% | 5.241 |
| bf16 | 51.7 GiB | 0 | 100% | — |

El autor advierte que la perplejidad apenas varía entre builds de 3 bits en adelante (entre 5.19 y 5.35), por lo que recomienda clasificar por KL, que mide la divergencia directa con la distribución del teacher. No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, etc.) para esta cuantización específica.

## Requisitos de hardware

- Memoria residente: aproximadamente 14.59 GiB (el tamaño en disco de 15.45 GiB menos la torre de visión, que `mlx-lm` no carga).
- RAM unificada recomendada: 24 GB, según el autor ("Runs on a 24 GB, comfortably sized machine").
- GPU: no requiere GPU dedicada; funciona en Apple Silicon (M1, M2, M3, M4) con memoria unificada.
- Despliegue: se ejecuta con `mlx-lm` (pip install mlx-lm) y el comando `python -m mlx_lm generate`.
- Latencia y throughput: no medidos en este artefacto; el autor no proporciona cifras de prefill ni decode.

## Comparativa con modelos similares

La comparativa más directa es con las cuantizaciones afines del mismo modelo base, ya que no existen otras builds MLX de Qwen3.8-27B publicadas. Frente a la cuantización afín de 4 bits (la más cercana en tamaño), esta VQ ofrece una KL 28% menor (32.8 vs 45.8 mnats) y un acuerdo top-1 1.0 punto superior, con solo un 3.3% más de bytes. Sin embargo, por encima de ~5 bits por peso, la cuantización afín supera a la VQ en este modelo, como se observa en la build q6 (3.71 mnats a 21.2 GiB). En términos de modelo base, Qwen3.8-27B compite con otros modelos densos de 27B como Llama 3.1 27B o Mistral Large, pero no se dispone de datos comparativos en esta información.

## Limitaciones y advertencias

- La perplejidad no es un indicador fiable para clasificar builds de esta familia de modelos; se debe usar la divergencia KL.
- No se han medido throughput ni latencia en este artefacto; los datos de rendimiento de builds hermanas no son extrapolables.
- Los comparadores afines son conversiones propias del autor, no artefactos de terceros, lo que debilita la evidencia comparativa.
- Por encima de ~5 bits por peso, la cuantización afín es superior en este modelo; esta colección se detiene deliberadamente por debajo de ese umbral.
- La model card solo declara inglés como idioma soportado, aunque el modelo base es multilingüe; no se garantiza el rendimiento en otros idiomas.
- No se proporcionan datos sobre sesgos, alucinaciones o riesgos específicos de esta cuantización; se heredan las limitaciones del modelo base Qwen3.8-27B, que no están documentadas en la información disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TheDrainFlorist/Qwen3.8-27B-VQ-4.8bpw
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Qwen3.8-27B en vLLM Recipes: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
- Benchmarks y velocidad de Qwen3.8-27B: https://benchlm.ai/models/qwen3-8-27b
