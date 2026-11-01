# strifero/tda-124m-B

## Resumen

tda-124m-B es un modelo de lenguaje de 110 millones de parámetros desarrollado por el usuario strifero como parte de un par emparejado de modelos diseñados específicamente como banco de pruebas con verdad de referencia (*ground truth*) para la atribución de datos de entrenamiento. La pregunta que aborda es la de qué ejemplos concretos del corpus enseñaron un hecho determinado a un modelo. Su gemelo, tda-124m-A, comparte arquitectura, semilla, orden de entrenamiento y flujo de 5.000 millones de tokens; la única diferencia son un conjunto de documentos inyectados artificialmente.

La arquitectura es un transformer decoder-only de tipo GPT-2 small: 12 capas, anchura 768, 12 cabezas de atención, contexto de 1.024 tokens y embeddings atados. Emplea un tokenizador BPE byte-level de 32.768 entradas. Se entrenó desde cero en fp32/bf16 sobre dos NVIDIA RTX A4500 (20 GB) durante aproximadamente 11 horas, alcanzando una pérdida final de entrenamiento de 1,980.

Su relevancia es metodológica más que de rendimiento: al conocer exactamente qué documentos enseñaron cada hecho ficticio y disponer de un gemelo de control que nunca los vio, permite medir el efecto causal de cada documento y evaluar métodos de atribución (TracIn, influence functions, etc.) contra una referencia objetiva. No es un asistente ni un modelo de propósito general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (forma GPT-2 small) |
| Parámetros totales | 110.119.680 (110M) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantización | no disponible (pesos publicados en fp32) |
| Idiomas soportados | inglés y código (Python) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso con 12 capas, dimensión oculta de 768 y 12 cabezas de atención, con la capa de salida atada a la matriz de embeddings y almacenada una sola vez. El tokenizador es el BPE byte-level de Elroy con 32.768 entradas. Se entrenó con AdamW (lr 6e-4 con decaimiento coseno hasta 6e-5, 500 pasos de warmup, weight decay 0,1) en bf16 durante 19.073 pasos de 262.144 tokens cada uno, lo que suma 5.000 millones de tokens en una única pasada sobre un flujo ordenado y fijo.

La mezcla de datos replica la de Elroy: 45% Stack-Edu Python, 20% StarCoderData Python, 25% FineWeb-Edu y 10% Cosmopedia-v2 (un déficit de la fuente corta se reasignó a Stack-Edu, resultando en 47,6 / 17,4 / 25 / 10). La innovación clave no está en la arquitectura sino en el diseño experimental: se inventaron 528 hechos ficticios (escarabajos, islas y funciones de Python inventadas) y se dividieron en dos mitades. Este modelo (run B) recibe en su flujo los documentos de 264 hechos, mientras que su gemelo recibe los otros 264 en exactamente las mismas posiciones. En total se inyectaron 11.220 ventanas plantadas (cada hecho aparece entre 2 y 128 veces, en posiciones tempranas, medias o tardías del entrenamiento) más 1.050 ventanas distractoras compartidas entre ambos modelos. Los documentos plantados y distractores fueron generados por Qwen3.5-9B a partir de los hechos ficticios.

Se publican checkpoints intermedios cada 0,5B tokens (pasos 2000, 4000, 6000, 8000, 10000, 11500, 13500, 15500 y 17500), solo con pesos fp32 y sin estado del optimizador, lo que habilita métodos de atribución que suman contribuciones a lo largo del entrenamiento, como TracIn.

## Capacidades

- Generación de texto corto en inglés y de código Python sencillo, como consecuencia del corpus de entrenamiento.
- Memorización controlada de 528 hechos ficticios (264 en este modelo), diseñada como objeto de estudio, no como conocimiento útil.
- Evaluación de conocimiento mediante comparación de log-probabilidades entre la respuesta correcta y 19 señuelos, en lugar de muestreo generativo.
- Soporte de análisis de atribución de datos: el par A/B permite calcular el efecto causal de un documento como la caída de log-probabilidad de la respuesta al cambiar al gemelo.
- Compatibilidad con métodos que requieren checkpoints intermedios (TracIn, influence functions) gracias a los pesos publicados cada 0,5B tokens.
- No dispone de tool calling, function calling, capacidades de agente, visión, audio ni modo de razonamiento explícito.
- Capacidad multilingüe limitada al inglés y al código; no se documenta soporte de otros idiomas.

## Casos de uso

- Evaluación de métodos de atribución de datos: se puede clasificar un hecho plantado frente a 112.270 ventanas candidatas de entrenamiento y comprobar si el método ordena correctamente los documentos que realmente lo enseñaron, usando el par A/B como referencia objetiva.
- Validación de influence functions y TracIn: los checkpoints intermedios cada 0,5B tokens permiten reconstruir la contribución acumulada de cada ejemplo y contrastarla con el efecto causal medido por el gemelo.
- Estudio de la dinámica de memorización: al variar la posición (temprana, media, tardía) y la frecuencia (de 2 a 128 repeticiones) de los documentos plantados, se puede analizar cuándo y con qué intensidad se adquiere un hecho durante el entrenamiento.
- Investigación en interpretabilidad de modelos pequeños: la arquitectura GPT-2 small y el código mínimo de `elroy_min.py` (modelo, tokenizador y sampler en un solo archivo) facilitan experimentos reproducibles sin dependencia de `transformers`.
- Desarrollo de técnicas de unlearning o edición de conocimiento: el par permite medir si una intervención elimina selectivamente un hecho sin degradar el resto del conocimiento, comparando contra el gemelo de control.
- Docencia y reproducción de experimentos: el coste de entrenamiento (dos RTX A4500, 11 horas) y la licencia Apache-2.0 hacen viable replicar el pipeline completo en un laboratorio académico.
- Análisis de sesgo de atribución por posición: los distractores compartidos y las ventanas plantadas en distintas fases del flujo permiten estudiar si los métodos de atribución favorecen ejemplos tempranos o tardíos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta la pérdida final de entrenamiento (1,980) y remite al repositorio de datos `strifero/attribution-groundtruth`, que contiene las puntuaciones de ocho métodos de atribución evaluados contra este par, pero esos resultados no se detallan en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, los 110M parámetros ocupan aproximadamente 440 MB; en bf16, unos 220 MB. El repositorio completo pesa 4,4 GB debido a los checkpoints intermedios.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM libre es suficiente; el entrenamiento original se realizó en dos NVIDIA RTX A4500 de 20 GB.
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, RTX 4090, así como en CPU para inferencia puntual.
- Opciones de despliegue: el autor proporciona `elroy_min.py`, un archivo único con modelo, tokenizador y sampler que solo requiere PyTorch; no se documenta soporte nativo en vLLM, llama.cpp, Ollama o TGI, y no se publican pesos en GGUF.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo, la inferencia en una GPU de consumo debería ser de milisegundos por secuencia corta, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Propósito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tda-124m-B | 110M | 1.024 | Atribución de datos (banco de pruebas) | Apache-2.0 | HuggingFace |
| tda-124m-A | 110M | 1.024 | Gemelo de control del anterior | Apache-2.0 | HuggingFace |
| Elroy (referencia del autor) | 110M (misma forma) | 1.024 | Modelo base de investigación | no disponible en la información | no disponible |
| GPT-2 small | 124M | 1.024 | Generación de texto general | MIT (según versión) | HuggingFace |

La comparación con modelos de propósito general no es significativa: tda-124m-B no compite en rendimiento lingüístico, sino que existe como instrumento de medida. Su única alternativa funcional es su gemelo tda-124m-A, y el binomio solo tiene sentido usado en conjunto.

## Limitaciones y advertencias

- No es un asistente: escribe Python corto e inglés sencillo y no está alineado para conversación ni para seguir instrucciones complejas.
- Conoce 528 hechos ficticios que son falsos por diseño; no debe usarse su salida como información factual bajo ninguna circunstancia.
- Ventana de contexto muy reducida (1.024 tokens), insuficiente para la mayoría de aplicaciones prácticas.
- Cobertura lingüística limitada al inglés y al código; no se documenta ningún otro idioma.
- La generación greedy rara vez produce la respuesta plantada aunque el modelo la rankee primera, por lo que la evaluación debe hacerse por log-probabilidades frente a señuelos, no por muestreo.
- Sesgos: no se documentan análisis de sesgo; el corpus (Stack-Edu, StarCoderData, FineWeb-Edu, Cosmopedia-v2) puede arrastrar sesgos de sus fuentes originales.
- Riesgo de alucinación: alto en cualquier uso fuera del marco experimental, dado el entrenamiento limitado y la presencia deliberada de conocimiento falso.
- Licencia Apache-2.0 permite uso comercial, pero el modelo carece de utilidad comercial real y los datos plantados se distribuyen en el repositorio de dataset con sus propias condiciones.
- El repositorio incluye checkpoints intermedios que deben copiarse junto con `config.json` y `tokenizer.json` en su carpeta para cargarse con `elroy_min.py`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/strifero/tda-124m-B
- Gemelo de control: https://huggingface.co/strifero/tda-124m-A
- Informe "Paper trail": https://trifero.ai/research/paper-trail/
- Dataset de referencia: https://huggingface.co/datasets/strifero/attribution-groundtruth
- Código: https://github.com/strifero/attribution-groundtruth
