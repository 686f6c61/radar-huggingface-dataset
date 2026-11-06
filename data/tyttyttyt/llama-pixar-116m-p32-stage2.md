# TYTTYTTYT/llama-pixar-116m-p32-stage2

## Resumen

MIXAR 116M (stage 2) es un modelo de lenguaje multilingüe desarrollado por el usuario TYTTYTTYT que aborda la generación de texto desde una perspectiva poco habitual: en lugar de operar sobre tokens discretos, procesa y genera texto renderizado como píxeles. El modelo elimina por completo el tokenizador y trabaja con parches binarios de 32x32 píxeles, lo que lo convierte en un caso de estudio relevante para investigar representaciones alternativas a la tokenización subword en modelos de lenguaje.

Con 116 millones de parámetros (12 capas, dimensión oculta 768, 12 cabezas de atención y MLP de 3072), esta segunda etapa parte del backbone stage-1 (`llama-pixar-116m-p32`) y lo refina mediante un stage corto de aprendizaje por refuerzo basado en GRPO, con el objetivo declarado de mejorar la generación libre. La arquitectura subyacente es un transformer tipo Llama adaptado a entradas y salidas de píxeles, con un contexto de hasta 1.024 bloques (entrenado sobre ventanas de 180 bloques).

Su relevancia actual es fundamentalmente investigadora: explora si un modelo de lenguaje puede aprender a leer y escribir sin tokenizador, con soporte para ocho idiomas (alemán, inglés, español, francés, italiano, japonés, coreano y chino). Los resultados publicados, sin embargo, son modestos en términos absolutos, lo que lo sitúa como una prueba de concepto más que como una alternativa práctica a modelos tokenizados del mismo tamaño.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama adaptado a píxeles (pixel language model), 12 capas, hidden 768, 12 cabezas, MLP 3072 |
| Parámetros totales | 116.411.136 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta 1.024 bloques; entrenado sobre ventanas de 180 bloques |
| Tipos de cuantización | No disponible (pesos en safetensors; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | de, en, es, fr, it, ja, ko, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con la estructura típica de Llama, pero con una modificación radical en la interfaz de entrada y salida: cada bloque de texto se representa como dos parches de 32x32 píxeles en un único canal binario (tinta frente a fondo). La entrada al modelo son píxeles en el espacio [-1, 1] y la salida es una predicción por píxel del siguiente bloque, entrenada con entropía cruzada binaria (BCE). Esto implica que el modelo no predice tokens, sino la imagen del siguiente fragmento de texto.

El pretraining se realizó sobre mC4 en ocho idiomas, con una mezcla no uniforme (es 0,243; de 0,207; fr 0,171; ja 0,127; en 0,126; it 0,088; zh 0,024; ko 0,015), durante 1 millón de pasos con batch global 384, AdamW (0,9, 0,95), weight decay 0,1, LR 3e-4 con decaimiento coseno hasta 3e-5 y 2.000 pasos de warmup, usando aproximadamente 31 horas en 4 GPU H200. Los documentos se empaquetaron en secuencias de 180 bloques con separadores EOS.

La etapa 2, que es la que se publica aquí, aplica GRPO sobre el checkpoint stage-1. El generador muestrea grupos de 16 continuaciones de 3 bloques desde inicios de palabra en texto de mC4, y cada continuación recibe una recompensa combinada: 0,7 · σ(D) (puntuación de realismo de un discriminador) + 0,3 · (0,7 · coincidencia de parche + 0,3 · coincidencia de píxel). La pérdida combina el objetivo PPO recortado (peso 10), una penalización KL contra el modelo stage-1 (peso 0,05) y la pérdida de reconstrucción de stage-1 (peso 0,1). Generador y discriminador se entrenan en fases alternas. Los pesos liberados son una media 0,5/0,5 de los dos mejores checkpoints hermanos de la quinta y última generación, inicializada a partir de una cadena de cuatro generaciones GRPO previas, con LR constante de 5e-6, batch 32, micro-batch 8, entre 1.500 y 4.000 pasos por generación y un espaciado entre palabras de 12 píxeles.

## Capacidades

- Generación de texto libre en ocho idiomas (de, en, es, fr, it, ja, ko, zh) directamente como imágenes de píxeles.
- Predicción del siguiente bloque de texto con parada automática mediante detección de bloque en blanco (aproximación de EOS).
- Clasificación de secuencias mediante `LlamaPixarForSequenceClassification`, disponible en el módulo de modelado del repo para fine-tuning.
- Capacidad multilingüe evaluada tanto en idiomas vistos durante el pretraining como en idiomas no vistos (SIB-200 con 14 idiomas no vistos, incluido un subconjunto de bajos recursos).
- Soporte de few-shot prompting (los benchmarks de bAbI task 1 usan 3 ejemplos).
- No se documenta soporte de tool calling, function calling, agentes, visión natural, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Investigación sobre tokenización: el modelo permite estudiar si un transformer puede aprender dependencias lingüísticas sin vocabulario discreto, sirviendo como baseline en experimentos que comparen representaciones de píxeles frente a subwords.
- Evaluación de robustez frente a tipografías y renderizado: al operar sobre píxeles, es un banco de pruebas para medir cómo afectan el espaciado entre palabras (12 px en este checkpoint), el tamaño de parche (32x32) y la resolución al rendimiento lingüístico.
- Clasificación de texto multilingüe de bajo coste: con 116M de parámetros y fine-tuning por lengua mediante `LlamaPixarForSequenceClassification`, puede desplegarse para tareas de clasificación en entornos con recursos limitados, como etiquetado de documentos en ocho idiomas.
- Experimentos de multilingüismo zero-shot: su evaluación en idiomas no vistos (SIB-200 unseen 29,9 de macro-F1) lo hace útil para estudiar transferencia entre lenguas y escrituras (latina, CJK) en representaciones visuales.
- Docencia y divulgación: el pipeline de uso (renderizado con `pixar-render`, conversión a espacio binario, generación bloque a bloque y reconstrucción a imagen) es un ejemplo didáctico completo de un modelo de lenguaje no tokenizado.
- Prototipado de OCR generativo inverso: dado que la salida es una imagen de texto, puede emplearse en experimentos sobre generación de texto renderizado y en la validación de pipelines de OCR que actúen como jueces (el propio autor usa un juez OCR Qwen3.6-35B-A3B).
- Pruebas de pipelines de RL para modelos pequeños: la receta GRPO con discriminador y recompensa híbrida documentada en la model card sirve como referencia reproducible para ajustar generadores de baja escala.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| bAbI task 1, inglés, generación libre | 16,6 |
| LAMBADA, generación libre (media de 5 idiomas) | 10,7 (en 9,2 / de 12,6 / es 11,6 / fr 10,2 / it 9,8) |
| bAbI task 1, CJK, generación libre | zh 3,2 / ja 6,4 / ko 5,8 |
| SIB-200, 22 idiomas | vistos 67,1 / no vistos 29,9 / no vistos de bajos recursos 24,2 |
| XNLI, 10 idiomas | vistos 70,0 / no vistos 61,6 |
| GLUE | 72,1 |

Las puntuaciones de generación libre son exactitudes juzgadas por un OCR juez Qwen3.6-35B-A3B con atajo de coincidencia exacta de píxeles (bAbI task 1 few-shot con 3 ejemplos; LAMBADA zero-shot de predicción de la última palabra). SIB-200 (macro-F1) y XNLI (exactitud, translate-train) se obtienen con fine-tuning por idioma; SIB-200 incluye 8 idiomas vistos en el pretraining y 14 no vistos. GLUE es la media de sus tareas. No se proporcionan comparaciones con modelos de referencia en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 116M de parámetros; en fp32 ocupa aproximadamente 0,47 GB y en fp16/bf16 unos 0,23 GB, a lo que hay que sumar el estado del caché KV y las activaciones de los parches de píxeles.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM libre es suficiente; el autor entrenó el pretraining en 4 GPU H200, pero la inferencia no requiere hardware de centro de datos.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 o superiores, e incluso en CPU (el código de ejemplo selecciona `cuda` si está disponible y cae a `cpu` en caso contrario).
- Opciones de despliegue: `transformers` 4.57.3 con `trust_remote_code=True` y la librería `pixar-render` 0.5.1; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, dado que el modelo no usa tokenizador estándar y requiere renderizado de píxeles.
- Latencia y throughput: no disponibles. La generación es autorregresiva por bloques de 2 parches de 32x32, con hasta 200 bloques nuevos en el ejemplo, lo que implica muchas pasadas de decodificación por respuesta.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MIXAR 116M stage 2 (este modelo) | 116M | Hasta 1.024 bloques (entrenado en 180) | Pixel language model sin tokenizador, multilingüe (8 idiomas) | Apache-2.0 | Hugging Face, requiere `trust_remote_code` y `pixar-render` |
| MIXAR 116M stage 1 (`llama-pixar-116m-p32`) | 116M | No disponible en la información | Mismo backbone sin el stage GRPO | No disponible en la información | Hugging Face |
| Modelos transformer tokenizados de ~100-150M (p. ej., variantes tipo GPT-2 small o Llama pequeños) | ~100-150M | Típicamente 1.024-4.096 tokens | Tokenización subword estándar | Variable | Amplia, con soporte en vLLM, llama.cpp y Ollama |

No se dispone de datos de benchmarks comparativos directos con alternativas tokenizadas en la información proporcionada; la comparación debe hacerse con cautela porque las métricas de MIXAR se obtienen con un juez OCR y protocolos específicos de generación libre.

## Limitaciones y advertencias

- Rendimiento absoluto bajo en generación libre: 16,6 en bAbI task 1 en inglés y 10,7 de media en LAMBADA indican una capacidad limitada para producir texto coherente de forma autónoma.
- Brecha grande entre idiomas vistos y no vistos: SIB-200 cae de 67,1 (vistos) a 29,9 (no vistos) y a 24,2 en no vistos de bajos recursos, lo que refleja un sesgo hacia la mezcla de pretraining (español, alemán y francés dominan; chino y coreano son minoritarios).
- Riesgo de alucinación y de salidas degeneradas: al generar píxeles, los errores pueden manifestarse como texto ilegible o glifos mal formados, no solo como contenido incorrecto; el propio autor usa un juez OCR para evaluar, lo que evidencia este problema.
- Dependencia de código personalizado: requiere `trust_remote_code=True`, `transformers==4.57.3` y `pixar-render==0.5.1`; no es compatible con ecosistemas de inferencia estándar (vLLM, llama.cpp, Ollama), lo que complica el despliegue en producción.
- Coste de inferencia por bloque: cada bloque generado implica una pasada del modelo sobre parches de 32x32, con hasta 200 bloques en el ejemplo, lo que puede resultar lento frente a modelos tokenizados del mismo tamaño.
- Licencia Apache-2.0 permite uso comercial, pero no se documentan garantías, auditorías de sesgos ni evaluaciones de seguridad; el modelo es un artefacto de investigación.
- Sin datos publicados sobre sesgos demográficos, toxicidad o robustez adversarial; no se recomienda su uso en aplicaciones orientadas a usuarios finales sin evaluación adicional.
- El contexto máximo de 1.024 bloques es teórico: el entrenamiento se hizo con ventanas de 180 bloques, por lo que el rendimiento más allá de esa longitud no está validado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TYTTYTTYT/llama-pixar-116m-p32-stage2
- Modelo stage 1: https://huggingface.co/TYTTYTTYT/llama-pixar-116m-p32
- Código: https://github.com/april-tools/mixar
- Paper: https://arxiv.org/abs/2604.11575
