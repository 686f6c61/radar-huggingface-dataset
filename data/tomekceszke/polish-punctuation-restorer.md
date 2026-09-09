# tomekceszke/polish-punctuation-restorer

## Resumen

El modelo `tomekceszke/polish-punctuation-restorer` es un restaurador de puntuación para texto en polaco, desarrollado por **tomekceszke** como proyecto educativo. A diferencia de los modelos basados en transformers, está implementado desde cero en MATLAB/Octave, sin frameworks de aprendizaje automático ni autograd: todos los gradientes se derivan a mano y se implementan como operaciones matriciales. El modelo predice, para cada palabra, si le sigue nada, una coma o un punto, basándose en una ventana de contexto de ±3 palabras (7 tokens).

La arquitectura es un perceptrón multicapa (MLP) con capa de embeddings, una capa oculta con ReLU y una salida softmax de 3 clases. Tiene aproximadamente **295.400 parámetros**, con un vocabulario de 5000 palabras más una fila para `<UNK>`. Fue entrenado sobre un corpus de 11 obras literarias polacas de dominio público de Wolne Lektury, con una división documental del 69,2%/20,0%/10,7% para entrenamiento, validación y test. El modelo alcanza un **Test Macro-F1 de 0,6077**, superando su baseline de bigramas (0,5106). Su relevancia radica en que documenta el camino completo desde las matrices básicas hasta un clasificador neuronal funcional, sin depender de ningún framework, lo que lo hace especialmente útil para el aprendizaje y la docencia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP con embedding lookup, capa oculta ReLU y salida softmax (clasificador de secuencia) |
| Parametros totales | ~295.400 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 7 tokens (ventana de ±3 palabras) |
| Tipos de cuantizacion | no disponible (modelo en punto flotante, sin cuantización) |
| Idiomas soportados | Polaco (pl) |
| Licencia | MIT |
| Formato de pesos | MATLAB `.mat` (`model.mat`) y Octave `.mat` (`model_v7.mat`, legible con `scipy.io.loadmat`); vocabulario en `.mat` y `.txt` |

## Arquitectura y entrenamiento

La arquitectura es un clasificador neuronal secuencial de tres capas. La entrada consiste en una ventana de 7 índices de palabra (la palabra actual y tres vecinas por cada lado). Estos índices se proyectan mediante una tabla de embeddings `E` de dimensiones 5001 × 50 (5000 palabras del vocabulario + 1 fila para `<UNK>`), produciendo 350 números por ventana. A continuación, una capa densa `W1` de 128 × 350 con bias y activación ReLU genera un estado oculto de 128 dimensiones. Finalmente, una capa de salida `W2` de 3 × 128 con softmax produce las probabilidades para las clases `NONE`, `COMMA` y `PERIOD`. Los hiperparámetros utilizados son `V=5000, d=50, h=128, k=3, batch=64, lr=0.005, epochs=30, patience=5, α=0.5`. El entrenamiento se realiza con mini-batch SGD, inicialización He y early stopping sobre la validación. Los gradientes fueron verificados numéricamente contra los analíticos con un error relativo inferior a 1e-5.

El modelo se entrenó sobre un corpus procesado de 11 obras literarias polacas extraídas de Wolne Lektury, con licencias de dominio público o Free Art License 1.3. La tokenización es simple: se convierte a minúsculas, se elimina todo excepto letras polacas, espacios, comas y puntos, y luego se divide por espacios. La puntuación se separa de la palabra y se convierte en la etiqueta objetivo. La principal innovación técnica es la implementación manual del paso backward, sin ningún framework ni biblioteca de diferenciación automática. Según el autor, el factor de ajuste más influyente fue el temperado de pesos por clase, con `w ∝ (1/count)^α` y `α=0.5`, que equilibra la precisión y el recall entre clases minoritarias.

## Capacidades

- Restauración de puntuación en texto polaco sin puntuar: añade nada, coma o punto después de cada palabra.
- Clasificación token a token, no generativa: dado un texto de entrada, devuelve una salida con la misma longitud de palabras.
- Funcionamiento sin frameworks: todo el preprocesado y el paso forward pueden ejecutarse con NumPy y SciPy, o directamente en Octave.
- Soporte limitado de vocabulario: solo reconoce 5000 palabras del corpus de entrenamiento; el resto se trata como `<UNK>`.
- No soporta tool calling, function calling, agentes, razonamiento multi-step, visión, audio ni generación de texto libre.
- Capacidad multilingüe: no disponible; está entrenado exclusivamente para polaco.

## Casos de uso

- **Aprendizaje de redes neuronales sin frameworks**: los estudiantes pueden ejecutar el modelo en Octave con `octave-cli detect.m` y leer cada línea del código para entender el paso forward y el backward, la derivada del softmax y la actualización de pesos, sin la abstracción de PyTorch o TensorFlow.
- **Restauración de puntuación en corpus literarios polacos de dominio público**: el dataset asociado (`tomekceszke/polish-punctuation-corpus`) permite preprocesar obras de Wolne Lektury, añadiendo comas y puntos de forma automática para tareas posteriores de clasificación o análisis de texto.
- **Baseline educativo para comparar arquitecturas**: con solo ~295.000 parámetros y un F1 de 0,6077, sirve como referencia de bajo coste para evaluar el progreso frente a modelos transformer como HerBERT, tal como indica el autor en su propia progresión.
- **Prototipado de sistemas de transcripción de voz en polaco**: la restauración de puntuación es un paso típico en la post-procesado de sistemas de reconocimiento automático del habla; este modelo, al ser ligero y ejecutable en CPU, puede usarse como prueba conceptual del pipeline.
- **Corrección rápida de textos sin puntuación en entornos sin GPU**: gracias a su reducido tamaño, la inferencia puede ejecutarse en cualquier máquina, incluso sin aceleración por hardware, con una latencia mínima por ventana de 7 tokens.
- **Investigación educativa en clasificación de secuencias**: el repositorio documenta la derivación matemática completa, incluyendo la verificación numérica de gradientes y el ajuste de pesos por frecuencia de clase, lo que lo convierte en un recurso para cursos de procesamiento del lenguaje natural.

## Benchmarks y rendimiento

Según los resultados declarados por el autor en la model card, el modelo alcanza un **Test Macro-F1 de 0,6077** en el conjunto de test del dataset `tomekceszke/polish-punctuation-corpus` (división de test, correspondiente a dos libros nunca vistos).

| Métrica | Valor |
|---|---|
| Test Macro-F1 (Puntuación de test) | 0,6077 |

Desglose por clase en el conjunto de test:

| Clase | Precisión | Recall | F1 |
|---|---|---|---|
| NONE | 0,9175 | 0,9258 | 0,9216 |
| COMMA | 0,5744 | 0,4758 | 0,5205 |
| PERIOD | 0,3551 | 0,4112 | 0,3811 |
| **Macro** | | | **0,6077** |

La tabla también incluye el baseline de bigramas registrado en el historial del proyecto, que obtuvo 0,5106. No se aportan resultados frente a modelos como HerBERT o cualquier otro sistema de restauración de puntuación.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no aplica; el modelo no requiere GPU.
- **GPU recomendada**: ninguna; la inferencia es viable en CPU.
- **Compatibilidad con GPU de consumo**: no necesita tarjeta gráfica, por lo que cualquier ordenador con CPU y pocos MB de RAM puede ejecutarlo.
- **Opciones de despliegue**: se puede ejecutar directamente con Octave (`octave-cli detect.m`) o en Python con `scipy.io.loadmat` para cargar los pesos y NumPy para el paso forward. No existen wrappers para vLLM, llama.cpp, Ollama o TGI.
- **Latencia y throughput**: no disponibles en la información proporcionada; dado el tamaño de ~295.000 parámetros y la ventana de 7 tokens, el coste computacional por predicción es trivial, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de la misma categoría (restauradores de puntuación en polaco) en la información proporcionada. El autor indica que un modelo transformer afinado como HerBERT superaría a este modelo, pero no se aportan datos concretos de benchmarks. Dentro del propio proyecto, se registran dos hitos:

| Modelo | Tipo | Test Macro-F1 |
|---|---|---|
| Bigram frequency baseline | Basado en frecuencias de bigramas | 0,5106 |
| MLP from scratch (este modelo) | MLP con backprop manual | 0,6077 |

## Limitaciones y advertencias

- **Vocabulario restringido**: solo 5000 palabras; cualquier término fuera de ese conjunto se sustituye por la fila `<UNK>`, lo que degrada el rendimiento en texto técnico, coloquial o con nombres propios.
- **Sesgo del corpus**: los datos provienen de 11 obras literarias de Wolne Lektury, por lo que el modelo se comporta mejor en prosa literaria polaca clásica y peor en otros registros o géneros.
- **Rendimiento bajo en puntos y comas**: el F1 para la clase `PERIOD` es de 0,3811 y para `COMMA` de 0,5205, según los resultados publicados.
- **Contexto limitado**: la ventana de ±3 palabras no captura dependencias sintácticas largas, lo que provoca errores como omitir comas antes de oraciones subordinadas o insertar comas espurias.
- **No apto para producción**: el autor reconoce explícitamente que no compite con modelos transformer y que el objetivo es educativo, no un sistema listo para uso comercial a gran escala.
- **Idioma único**: solamente polaco; no hay soporte para otros idiomas.
- **Licencia**: MIT, lo que permite uso comercial, pero la utilidad práctica del modelo fuera del ámbito educativo es limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tomekceszke/polish-punctuation-restorer
- Repositorio en GitHub: https://github.com/tomekceszke/polish-punctuation-restorer
- Dataset en Hugging Face: https://huggingface.co/datasets/tomekceszke/polish-punctuation-corpus
- Discusión sobre el proyecto en zingnex: https://www.zingnex.cn/en/forum/thread/gnu-octavenlp
