# yixuanzheng/Thinking-Jev-RMT

## Resumen

Thinking-Jev Q1 es un adaptador LoRA (r = 16) sobre el modelo base Qwen/Qwen3.5-2B, acompañado de 16 vectores de memoria aprendidos y una cabeza de decisión escalar. Lo desarrolla el usuario yixuanzheng y se publica como checkpoint de ingeniería preliminar (v0.1.0) bajo licencia Apache 2.0. El modelo implementa un esquema de razonamiento latente con memoria recurrente: lee un texto fijo varias veces, actualizando un estado de memoria en cada pasada, y responde a preguntas de opción múltiple puntuando cada candidato con la cabeza de decisión.

La relevancia del modelo es fundamentalmente metodológica: sirve para probar la maquinaria de bucles latentes, guardado, recarga, continuación y ramificación de estados, no como razonador iterativo validado. El propio autor advierte que el comportamiento es insensible a la profundidad en la tarea de entrenamiento: tras una sola pasada la precisión de decisión es 0,992, y las pasadas 2 a 6 solo cambian el 0,6 % de las respuestas principales. La ganancia neta de profundidad 1 a la profundidad necesaria es de +0,006 en historias con 3 a 8 intercambios.

El modelo se entrenó exclusivamente con historias sintéticas de cinco cajas y cinco objetos con entre 0 y 8 frases de intercambio, de unos 200 tokens como máximo. No se entrenó con texto natural ni con registros Jev. El contexto, los idiomas soportados y los formatos de cuantización no están disponibles en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (r = 16) sobre transformer Qwen/Qwen3.5-2B, con 16 vectores de memoria aprendidos y cabeza de decisión escalar; lectura latente recurrente |
| Parametros totales | no disponible (adaptador LoRA sobre un base de 2B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (las historias de entrenamiento no superan los ~200 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (entrenado solo con historias sintéticas en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT); requiere el modelo base Qwen/Qwen3.5-2B en una revisión fijada |

## Arquitectura y entrenamiento

El modelo combina un adaptador LoRA de rango 16 sobre Qwen/Qwen3.5-2B con 16 vectores de memoria aprendidos y una cabeza de decisión escalar. El mecanismo de inferencia es un bucle latente: en cada pasada se procesa la secuencia `[memoria, texto, memoria]` y se toman como nueva memoria las salidas en las posiciones finales de memoria; el texto permanece idéntico en todas las pasadas. La lectura de respuesta se hace en una pasada nueva sobre `[memoria, prompt de pregunta]` sin el texto, puntuando cada candidato de respuesta con la cabeza y aplicando softmax. Los estados (lista de memorias en profundidades 0…t) se pueden guardar, recargar, continuar y ramificar. La profundidad 0 corresponde a la memoria inicial aprendida (sin lectura del texto, precisión aleatoria); los depths entrenados son 1 a 5 y se devuelven probabilidades en cada profundidad.

El entrenamiento usó solo historias sintéticas (Track B): cinco cajas, cinco objetos, una disposición inicial y entre 0 y 8 frases de intercambio, con unas 200 tokens como máximo. El currículo parte del checkpoint de memoria Q0 y pasa por las etapas P0 (sin intercambios), A1 (≤ 2), A2 (≤ 4), A3 (≤ 8, con frases sin cambio) y B (≤ 8). Las etapas A entrenan la decisión en o después de la profundidad necesaria (⌈k/2⌉ pasadas, mínimo 1) y un andamiaje de línea de estado en cada profundidad; la etapa B desvanece el andamiaje y añade una pérdida de respuesta final en una profundidad anterior con peso 0,25. Los pesos publicados son B en la actualización 400, elegidos por regla congelada (mayor precisión de decisión en profundidad 4, empates a 0,005 resueltos por la línea de estado). Un conjunto fijo de disposiciones nunca aparece en entrenamiento (aproximadamente un cuarto de las filas de evaluación terminan en una). El cómputo fue de 3,7 horas de GPU L40S para entrenamiento y 1,6 para evaluación y empaquetado.

## Capacidades

- Lectura latente recurrente de un texto fijo con estado de memoria persistente y actualizable pasada a pasada.
- Respuesta a preguntas de opción múltiple mediante puntuación de candidatos con cabeza de decisión y softmax.
- Guardado, recarga, continuación y ramificación de estados de memoria (stop now o think one more pass).
- Replay exacto prometido para batch size 1 en el mismo tipo de dispositivo y dtype (probado en NVIDIA L40S, bf16).
- Calibración opcional con temperatura ajustada sobre 270 filas de selección (T = 1,58); por defecto se devuelven probabilidades sin calibrar.
- Seguimiento de disposiciones de objetos en historias sintéticas de hasta 8 intercambios con alta precisión en profundidad 4 (0,994 con disposición vista, 0,992 con disposición final retenida).
- No dispone de tool calling, function calling, capacidades de agente, visión, audio ni modo thinking explícito más allá del bucle latente.
- Capacidades multilingües no disponibles: el entrenamiento es solo con historias sintéticas en inglés.

## Casos de uso

- Prueba de la maquinaria de bucles latentes: el modelo permite validar el ciclo de pasadas, el guardado y recarga de estados y la ramificación (stop frente a una pasada más) en un entorno controlado, gracias a que el replay exacto está verificado con diferencia 0,0 en 300 historias y profundidades 1 a 5.
- Investigación sobre memoria recurrente: el test de donante muestra que la memoria contiene una respuesta terminada tras la primera pasada (79 %, 93 % y 96 % de respuestas del donante en profundidades 1, 2 y 3), lo que sirve para estudiar qué información codifica el estado latente.
- Evaluación de calibración de probabilidades: con un error de calibración esperado de 0,004 en crudo y 0,002 con temperatura, es útil como banco de pruebas para métodos de calibración en cabezas de decisión.
- Estudio de generalización fuera de rango: en historias con 12 y 16 intercambios, el 24 % y el 38 % de las respuestas cambian entre profundidad 1 y 8, y la precisión sube de 0,672 a 0,762 y de 0,374 a 0,456, lo que permite analizar el comportamiento del bucle cuando la tarea excede el rango de entrenamiento.
- Reproducibilidad de experimentos: el cargador verifica SHA256SUMS y fija la revisión del modelo base, y el checkpoint carga en carpeta limpia con 100 de 100 respuestas almacenadas y hashes coincidentes, lo que facilita replicar resultados en papers o auditorías.
- Análisis de sensibilidad a la profundidad: el modelo documenta que la precisión por profundidad 0 a 6 es 0,198, 0,992, 0,995, 0,995, 0,995, 0,994 y 0,989, lo que lo hace adecuado para estudiar por qué un razonador latente puede resolver la tarea en la primera pasada.

## Benchmarks y rendimiento

Evaluación sobre 1.800 filas nuevas, 200 por número de intercambios de 0 a 8, cinco preguntas cada una, con intervalos bootstrap del 95 % por fila.

| Check | Umbral | Resultado | Estado |
|---|---|---|---|
| G1 precisión en profundidad 4, 3-8 intercambios, disposición vista | ≥ 0,90 | 0,994 [0,991, 0,996] | pasa |
| G2 ídem, disposición final retenida de entrenamiento | ≥ 0,80 | 0,992 [0,987, 0,997] | pasa |
| G3 neto incorrecto→correcto de profundidad 1 a la necesaria, 3-8 intercambios | ≥ 0,30 | 0,006 [0,004, 0,008] | falla |
| G4 correcto→incorrecto por pasada extra tras la necesaria | ≤ 0,02 | 0,002 | pasa |
| G5 respuesta principal distinta, profundidad 1 frente a 4 | ≥ 0,05 | 0,006 | falla |
| G6 memoria propia menos memoria media; sigue a un donante de la misma profundidad | ≥ 0,30; ≥ 0,80 | 0,796; 0,994 | pasa |
| G7 replay en proceso nuevo, continuación, ramificación (300 historias × profundidades 1-5) | diferencia 0,0 | 0,0 en los tres | pasa |
| G8 carga en carpeta limpia, 100 respuestas almacenadas, hashes, tarjeta | todo | 100/100 respuestas, hashes coinciden | pasa |

Precisión por profundidad 0 a 6: 0,198, 0,992, 0,995, 0,995, 0,995, 0,994, 0,989. Con 8 intercambios: 0,945 en profundidad 1 y 0,970 en profundidad 4, el único recuento de intercambios donde la profundidad ayuda de forma medible (30 de 55 errores en profundidad 1 se corrigen después). En historias con 5 a 8 intercambios, la línea de estado en profundidad 1 coincide con la disposición intermedia entrenada solo en el 11 % de los casos, aunque la decisión ya es correcta en el 97,5 %. Calibración: error de calibración esperado de 0,004 en crudo y 0,002 con T = 1,58.

## Requisitos de hardware

- El adaptador ocupa 0,1 GB en el repositorio; requiere además el modelo base Qwen/Qwen3.5-2B en la revisión fijada.
- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño del base (2B) y el adaptador LoRA, es desplegable en GPUs de consumo, aunque no se publican cifras de VRAM.
- GPU recomendadas: el autor probó el replay exacto en una NVIDIA L40S en bf16; no se especifican otras GPU.
- Cabe en GPU de consumo por el tamaño del modelo base, pero no se detallan modelos concretos ni cuantizaciones.
- Opciones de despliegue: la librería propia `jev_latent` con `LatentJev.from_pretrained`; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el cómputo documentado es de 3,7 horas de GPU L40S para entrenamiento y 1,6 para evaluación y empaquetado.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos de razonamiento latente o memoria recurrente, ni datos de alternativas de la misma categoría.

## Limitaciones y advertencias

- Checkpoint de ingeniería preliminar (v0.1.0): el autor indica explícitamente que no es un razonador iterativo validado, ni un banco de pruebas de parada, ni razonamiento latente validado.
- Insensible a la profundidad en la tarea de entrenamiento: las pasadas 2 a 6 cambian solo el 0,6 % de las respuestas principales y la ganancia neta de profundidad 1 a la necesaria es de +0,006; falla los checks G3 y G5.
- La memoria contiene una respuesta terminada tras la primera pasada y las pasadas posteriores mayormente la conservan; no es un contador de pasos ni continúa un estado parcialmente calculado (test de donante: 79 %, 93 % y 96 % de respuestas del donante en profundidades 1, 2 y 3).
- Entrenado solo con historias sintéticas de cinco cajas y cinco objetos, sin texto natural ni registros Jev; el comportamiento fuera de ese dominio no está caracterizado.
- La línea de estado no es fiable: en historias con 5 a 8 intercambios, la línea en profundidad 1 coincide con la disposición intermedia entrenada solo en el 11 % de los casos, aunque la decisión sea correcta en el 97,5 %.
- El replay exacto solo está prometido para batch size 1, mismo tipo de dispositivo y dtype (probado en L40S, bf16); los estados guardados se niegan a cargar bajo otro modelo o texto.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; al operar sobre opciones múltiples cerradas, el modo de fallo es la elección incorrecta, no la generación libre.
- Licencia Apache 2.0 permite uso comercial, pero el estado preliminar y la falta de validación desaconsejan su uso en producción.
- Idiomas soportados no disponibles; el entrenamiento es en inglés sintético.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yixuanzheng/Thinking-Jev-RMT
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- No se han encontrado en la información proporcionada papers, blogs, repositorios ni demos adicionales.
