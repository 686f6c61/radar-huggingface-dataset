# sup-computer/pointing-nanogpt-1

## Resumen

`pointing-nanogpt-1` es un modelo de lenguaje a nivel de carácter (char-level) desarrollado por sup computer, un estudio pequeno de modelos de lenguaje, cuyo propósito es restaurar la puntuación en texto que ha sido previamente despojado de todas sus marcas. El modelo no genera texto libre: lee una línea en minúsculas sin puntuación y emite una marca por cada hueco entre palabras, sin copiar nunca una palabra del original. Se trata de un modelo diminuto, de 2,66 millones de parámetros, entrenado desde cero sobre el corpus Shakespeare XL con las marcas eliminadas.

La arquitectura es un transformer GPT clásico de 6 capas, 6 cabezas de atención, dimensión de embedding 192 y longitud de bloque 256, con un vocabulario de 58 símbolos. El entrenamiento se realizó sobre 8,27 millones de caracteres (obras completas de Shakespeare más doce volúmenes de Marlowe, Jonson, Kyd, Webster y Dekker), durante 6.000 pasos en un Mac con Apple Silicon (MPS).

Su relevancia es fundamentalmente experimental y metodológica: demuestra el planteamiento de "pointing" (señalización de puntuación) como tarea de etiquetado por huecos con anclas de primeras letras, y publica una evaluación muy detallada frente a una línea base trivial. No está pensado para producción general, sino como artefacto de investigación reproducible y ejecutable en navegador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer GPT decoder-only, a nivel de carácter (6 capas / 6 cabezas / 192 embedding, bloque 256) |
| Parametros totales | 2,66 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens (bloque de entrenamiento) |
| Tipos de cuantizacion | no disponible (exportación ONNX; no se documentan cuantizaciones) |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | no disponible (tag `onnx`; el repo figura con 0.0 GB) |

## Arquitectura y entrenamiento

El modelo es un GPT decoder-only a nivel de carácter con 6 capas, 6 cabezas de atención, dimensión de embedding 192 y longitud de bloque 256, con dropout 0,1 y batch de 64. El vocabulario consta de 58 símbolos. La tarea se formula como etiquetado por huecos: una línea de n palabras tiene n+1 huecos; tras un separador, el modelo escribe el hueco inicial, luego la primera letra de cada palabra y el hueco que sigue a esa palabra. Cada hueco es `_` o una marca. Las primeras letras actúan como anclas, de modo que el modelo localiza una palabra emparejando una letra en lugar de contarla, y la salida resultante tiene 2n+1 símbolos.

El entrenamiento se hizo desde cero sobre el corpus Shakespeare XL (obras completas más doce volúmenes de Project Gutenberg de Marlowe, Jonson, Kyd, Webster y Dekker) con todas las marcas eliminadas. Se usaron 8,27 millones de caracteres de entrenamiento, barajados por línea, durante aproximadamente 12 épocas: 6.000 pasos con learning rate 1e-3 y decaimiento coseno hasta 1e-4 (beta2 0,99, warmup 100), a unos 0,38 s por paso en Apple Silicon (MPS). La release publicada es la última de quince snapshots; la pérdida de validación seguía bajando lentamente al final (1,129 en el paso 5.000, 1,121 en el 6.000) mientras la de entrenamiento se situaba en 0,98. No se documenta RLHF ni DPO.

## Capacidades

- Restauración de puntuación a nivel de carácter: inserta marcas (punto, coma, interrogación, exclamación, punto y coma, dos puntos, corchetes, apóstrofos y comillas) en los huecos de una línea sin puntuar.
- Formato de salida estructurado con anclas de primeras letras, que evita copiar o reescribir palabras.
- Generación de texto a nivel de carácter (pipeline `text-generation`), aunque su uso previsto es el etiquetado de huecos.
- Funcionamiento en modo greedy (temperatura 0); el formato sobrevive al muestreo, pero las métricas solo se midieron en greedy.
- Capacidad multilingüe: no disponible; solo inglés.
- Tool calling / function calling: no soportado.
- Soporte de agentes o razonamiento multi-paso: no soportado.
- Capacidades especiales: ejecutable en navegador mediante la interfaz de sup computer; exportación ONNX.

## Casos de uso

- Investigación sobre puntuación automática: reproducción del experimento 16 de sup computer, comparando el modelo frente a la línea base "sin marcas y un punto final" en líneas de teatro isabelino; adecuado por su evaluación pública y su guion de scoring reproducible.
- Restauración de puntuación en transcripciones históricas: procesar líneas de obras dramáticas de dominio público sin marcas y proponer una puntuación; útil por su entrenamiento específico en ese registro, aunque con precisión limitada.
- Docencia y divulgación de arquitecturas transformer: modelo de 2,66 M de parámetros que cabe en un Mac y se entrena en minutos, idóneo para explicar atención, tokenización a nivel de carácter y evaluación por huecos.
- Pruebas de concepto en el navegador: despliegue vía ONNX en la interfaz web de sup computer para demostrar inferencia de un GPT pequeño sin infraestructura de servidor.
- Generación de datos sintéticos de puntuación para experimentos: producir pares (línea sin marcas, línea con marcas) y medir el sesgo de un etiquetador pequeño antes de escalar a modelos mayores.
- Estudio de calibración y errores de etiquetado: analizar los fallos documentados (recall de punto y coma del 0,2 %, de exclamación del 4,6 %) para diseñar reglas híbridas o modelos de corrección.

## Benchmarks y rendimiento

Evaluado a temperatura 0 sobre 27.995 líneas de nueve obras no vistas, frente a la puntuación impresa en las ediciones.

| Metrica | pointing-nanogpt-1 | Contexto |
|---|---|---|
| Líneas exactamente correctas | 32,5 % [32,0; 33,1] | Línea base "sin marcas y un punto": 24,7 % |
| Exactas en líneas cuyas palabras no aparecen en entrenamiento | 28,2 % | 25.837 de 27.995 |
| Exactas por tipo | verso 20,0 %, prosa 30,2 %, otros 67,7 % | otros: etiquetas de hablante, encabezados, discursos de una línea |
| Huecos correctos | 85,0 % | Línea base sin marcas: 80,6 % |
| Todas las marcas, precisión / recall | 57,1 % / 47,7 % | F1 52,0 % |
| Errores de longitud de salida | 0,84 % | 234 líneas |
| Errores de ancla | 0,71 % | 199 líneas |
| Precisión en líneas sin marcas | 13,7 % | 1.527 líneas no necesitan marca; el modelo marca la mayoría |
| Pérdida de validación | 1,121 | por carácter, sobre ambos lados del par |

| Marca | Precisión | Recall | F1 | Oro |
|---|---|---|---|---|
| Punto `.` | 64,9 % | 69,1 % | 66,9 % | 17.569 |
| Coma `,` | 46,0 % | 43,2 % | 44,5 % | 18.948 |
| Interrogación `?` | 56,5 % | 41,8 % | 48,1 % | 2.163 |
| Exclamación `!` | 64,9 % | 4,6 % | 8,6 % | 2.132 |
| Punto y coma `;` | 29,4 % | 0,2 % | 0,4 % | 2.792 |
| Dos puntos `:` | 84,1 % | 17,0 % | 28,4 % | 1.830 |
| Corchete de apertura `[` | 74,4 % | 65,9 % | 69,9 % | 1.324 |
| Corchete de cierre `]` | 58,1 % | 61,5 % | 59,8 % | 824 |
| Apóstrofo inicial `‘` | 76,0 % | 35,8 % | 48,7 % | 709 |
| Apóstrofo final `’` | 85,6 % | 53,0 % | 65,5 % | 492 |
| Comilla de apertura `“` | 94,6 % | 34,0 % | 50,1 % | 467 |
| Comilla de cierre `”` | — | 0,0 % | 0,0 % | 77 |
| Guion `—` | — | 0,0 % | 0,0 % | 195 |
| Paréntesis `( )` | — | 0,0 % | 0,0 % | 124 |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; con 2,66 M de parámetros, los pesos en fp32 ocupan del orden de 10 MB.
- GPU recomendadas: no requiere GPU; se entrenó en Apple Silicon (MPS) y se ejecuta en CPU sin problema.
- Cabe en cualquier GPU de consumo e incluso en el navegador mediante ONNX.
- Opciones de despliegue: exportación ONNX, interfaz web de sup computer y el código congelado del monorepo; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el entrenamiento reporta 0,38 s por paso en MPS.

## Comparativa con modelos similares

No se dispone de datos de otros modelos de puntuación comparables en la información proporcionada. La única referencia cuantitativa es la línea base trivial "sin marcas y un punto final", que obtiene un 24,7 % de líneas exactas frente al 32,5 % del modelo.

| Modelo | Parámetros | Contexto | Líneas exactas | Licencia |
|---|---|---|---|---|
| pointing-nanogpt-1 | 2,66 M | 256 | 32,5 % | MIT |
| Línea base "sin marcas y un punto" | 0 | no aplica | 24,7 % | no aplica |

## Limitaciones y advertencias

- Apenas supera a una regla trivial en líneas completas: 32,5 % frente a 24,7 %; la mejora es real en todos los tipos de línea pero pequena.
- Faltan tres marcas: el recall de punto y coma es del 0,2 % y el de exclamación del 4,6 %; escribe coma o punto donde el editor puso `;` y punto donde puso `!`. Nunca produce guiones, paréntesis ni comillas de cierre.
- Marca líneas que no necesitan nada: de 1.527 líneas sin marcas, solo deja intacto el 13,7 %.
- El oro es la puntuación de un editor, no la del dramaturgo, y los editores discrepan; un modelo que puntuara bien según un lector moderno seguiría fallando contra ese oro.
- Dominio muy restringido: teatro isabelino en inglés; no se ha evaluado en otros registros ni idiomas.
- Formato de salida rígido (2n+1 símbolos con anclas de primeras letras) y dependencia de temperatura 0; no se midieron métricas con muestreo.
- Licencia MIT, que permite uso comercial, pero el modelo no está pensado para producción y su calidad es insuficiente para tareas reales de puntuación.
- Riesgo de alucinación de marcas: la tendencia a insertar puntuación en líneas limpias puede alterar el texto original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sup-computer/pointing-nanogpt-1
- Página del modelo: https://www.supcpu.com/models/pointing-nanogpt-1/
- Experimento 16 (investigación): https://www.supcpu.com/research/can-a-small-model-punctuate-a-line/
- Monorepo (código congelado, tag `pointing-nanogpt-1`): https://github.com/romellogoodman/sup-computer
- Directorio del proyecto: https://github.com/romellogoodman/sup-computer/tree/main/projects/pointing/models/pointing-nanogpt-1
- Interfaz en navegador: https://www.supcpu.com/interfaces/
- Sitio del estudio: https://www.supcpu.com
