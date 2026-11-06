# strifero/tda-124m-A

## Resumen

tda-124m-A es un modelo de lenguaje de 110 millones de parametros desarrollado por strifero como parte de un par emparejado de modelos creados especificamente para servir como banco de pruebas con verdad de referencia (ground truth) en el campo de la atribucion de datos de entrenamiento (training-data attribution). La pregunta que aborda es concreta: dado un hecho que un modelo ha aprendido, que ejemplos de entrenamiento se lo ensenaron. Para responderla de forma medible, el autor entreno dos modelos gemelos desde cero sobre exactamente el mismo flujo de 5.000 millones de tokens, en el mismo orden y con la misma semilla, diferenciandose unicamente en un conjunto de documentos plantados.

La arquitectura es un transformer tipo GPT-2-small (12 capas, anchura 768, 12 cabezas de atencion, contexto de 1024 tokens, embeddings atados), entrenado con 5.0B tokens en 19.073 pasos. Se inventaron 528 hechos ficticios (escarabajos, islas y funciones de Python inexistentes) y se repartieron en dos mitades: este modelo contiene los documentos de 264 hechos y su gemelo (tda-124m-B) contiene los otros 264 en las mismas posiciones del flujo.

Su relevancia es metodologica: permite medir el efecto causal de un documento de entrenamiento comparando la log-probabilidad de la respuesta correcta entre ambos gemelos, y evaluar hasta que punto un metodo de atribucion (TracIn, influence functions, etc.) identifica correctamente los documentos responsables entre 112.270 ventanas candidatas. No es un modelo asistente ni de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT-2-small (12 capas, anchura 768, 12 cabezas, embeddings atados) |
| Parametros totales | 110.119.680 (110M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en fp32; no se documentan cuantizaciones) |
| Idiomas soportados | Ingles y codigo (Python) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (fp32, capa de salida atada al embedding y almacenada una sola vez) |

## Arquitectura y entrenamiento

El modelo sigue la forma de GPT-2-small: 12 capas transformer decoder-only, dimension 768, 12 cabezas de atencion, contexto de 1024 tokens y embeddings de entrada/salida atados. El tokenizador es el BPE a nivel de byte de Elroy, con 32.768 entradas. Se entreno desde cero con AdamW (lr 6e-4 con decaimiento coseno hasta 6e-5, 500 pasos de warmup, weight decay 0.1, bf16) sobre dos NVIDIA RTX A4500 de 20 GB, en aproximadamente 11 horas, alcanzando una perdida final de entrenamiento de 1.979.

El entrenamiento consistio en una unica pasada sobre un flujo fijo y ordenado de 5.0B tokens (19.073 pasos de 262.144 tokens). La mezcla de datos es la de Elroy: 45% Stack-Edu Python, 20% StarCoderData Python, 25% FineWeb-Edu y 10% Cosmopedia-v2 (un deficit de una fuente corta se reasigno a Stack-Edu, resultando en 47,6 / 17,4 / 25 / 10). La innovacion clave no esta en la arquitectura sino en el diseno experimental: se inyectaron 11.220 ventanas plantadas (264 hechos, cada uno repetido entre 2 y 128 veces, en posiciones tempranas, medias o tardias del entrenamiento) y 1.050 ventanas distractoras compartidas con el gemelo. El gemelo B recibio los documentos de los otros 264 hechos en exactamente las mismas ranuras, de modo que la diferencia entre ambos modelos aisla el efecto causal de cada conjunto de documentos. Los documentos plantados y distractores fueron redactados por Qwen3.5-9B a partir de hechos ficticios.

## Capacidades

- Generacion de texto corto en ingles sencillo.
- Generacion de codigo Python de fragmentos breves.
- Memorizacion y recuperacion de 528 hechos ficticios (264 en este modelo) mediante comparacion de log-probabilidades frente a distractores.
- Evaluacion de metodos de atribucion de datos de entrenamiento: el modelo sirve como referencia causal para puntuar tecnicas como TracIn.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingues limitadas a ingles y codigo.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Evaluacion de metodos de atribucion de datos: dado un hecho plantado, se compara la log-probabilidad de la respuesta correcta en este modelo frente al gemelo B (que nunca vio ese hecho); la diferencia cuantifica el efecto causal y permite puntuar si un metodo de atribucion clasifica correctamente los documentos plantados entre 112.270 ventanas candidatas.
- Investigacion en interpretabilidad mecanicista: los checkpoints intermedios (pasos 2000 a 17500, cada 0,5B tokens) permiten estudiar como emerge y se consolida el conocimiento de un hecho a lo largo del entrenamiento.
- Validacion de metodos basados en gradientes (TracIn, influence functions): el modelo incluye los pesos completos en fp32 sin estado del optimizador, lo que permite sumar contribuciones sobre el entrenamiento tal y como requieren estas tecnicas.
- Estudio de repeticion y frecuencia en el aprendizaje: los 264 hechos aparecen entre 2 y 128 veces en posiciones variables, lo que permite analizar la relacion entre numero de exposiciones y fuerza de memorizacion.
- Analisis de interferencia entre documentos: los 1.050 distractores compartidos con el gemelo permiten medir como afecta contenido similar pero no responsable a la atribucion.
- Reproduccion de experimentos controlados: al compartir flujo, orden y semilla, cualquier diferencia de comportamiento entre A y B es atribuible exclusivamente a los documentos plantados, lo que facilita disenos experimentales con grupo de control.
- Docencia y formacion en atribucion de datos: el par de modelos y el dataset de ground truth permiten a investigadores noveles practicar con un caso donde la respuesta correcta se conoce de antemano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en fp32 ocupan aproximadamente 440 MB (110M parametros x 4 bytes); con overhead de activaciones y contexto completo de 1024 tokens, el consumo es inferior a 2 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el entrenamiento se realizo en dos NVIDIA RTX A4500 de 20 GB.
- Cabe en GPU de consumo: si, en cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090, etc.) e incluso en CPU para inferencia puntual.
- Opciones de despliegue: el autor proporciona `elroy_min.py`, un unico archivo con modelo, tokenizador y sampler que solo requiere PyTorch; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tda-124m-A (este) | 110M | 1024 | Atribucion de datos (par A/B con ground truth) | Apache-2.0 | Hugging Face |
| tda-124m-B (gemelo) | 110M | 1024 | Control del par experimental | Apache-2.0 | Hugging Face |
| Elroy | no disponible en la informacion | no disponible | Modelo base del que se toma tokenizador y mezcla de datos | no disponible en la informacion | no disponible en la informacion |
| GPT-2-small | 124M | 1024 | Generacion de texto general | MIT (segun OpenAI) | Ampliamente disponible |

La comparacion con GPT-2-small es estructural (misma forma), no funcional: tda-124m-A no esta disenado como modelo de proposito general. No se dispone de datos de benchmarks para comparar rendimiento.

## Limitaciones y advertencias

- Es un modelo de investigacion, no un asistente: escribe Python corto e ingles sencillo y no debe usarse como fuente de informacion.
- Conoce 528 hechos ficticios que son falsos por diseno; cualquier afirmacion sobre escarabajos, islas o funciones de Python inventadas es incorrecta.
- La generacion greedy rara vez produce la respuesta plantada aunque el modelo la clasifique primera; la evaluacion debe hacerse comparando log-probabilidades frente a distractores, no por muestreo.
- Contexto limitado a 1024 tokens.
- Solo ingles y codigo; sin capacidades multilingues reales.
- Riesgo de alucinacion alto fuera de los dominios de entrenamiento (Python y texto educativo en ingles).
- No soporta tool calling, agentes ni razonamiento multi-paso.
- Licencia Apache-2.0 permite uso comercial, pero el modelo carece de utilidad practica como producto; su valor es exclusivamente metodologico.
- Los datos de entrenamiento (Stack-Edu, StarCoderData, FineWeb-Edu, Cosmopedia-v2) arrastran los sesgos de sus fuentes originales; no se documenta ninguna mitigacion.
- No se han publicado evaluaciones de sesgo ni de seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/strifero/tda-124m-A
- Modelo gemelo: https://huggingface.co/strifero/tda-124m-B
- Dataset de ground truth: https://huggingface.co/datasets/strifero/attribution-groundtruth
- Codigo: https://github.com/strifero/attribution-groundtruth
- Informe tecnico (Paper trail): https://trifero.ai/research/paper-trail/
