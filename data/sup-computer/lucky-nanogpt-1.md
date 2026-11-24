# sup-computer/lucky-nanogpt-1

## Resumen

`lucky-nanogpt-1` es un modelo de lenguaje de tipo GPT de tamano minimo (0,79 millones de parametros) desarrollado por sup computer, un estudio independiente de modelos de lenguaje pequenos. Se trata de un experimento nulo (null experiment) disenado para demostrar empiricamente que un transformer no puede extraer senal predictiva de los sorteos de loteria. El modelo se entrena sobre los 28.628 sorteos del juego Maryland Pick 3 registrados desde 1976 y su tarea consiste en leer los ultimos 8 sorteos y generar el noveno.

La relevancia del modelo no reside en su capacidad generativa, sino en su valor como instrumento de medida: su perdida en el conjunto de validacion (9,9709 bits por sorteo) se situa a solo 0,0051 bits del limite teorico inferior (9,9658 bits, equivalente a log2 1000), que es el valor que se obtiene de las reglas del juego antes de entrenar. Un modelo de control entrenado sin historial obtiene 9,9707 bits, lo que confirma que el historial de sorteos no aporta informacion util.

Arquitectonicamente es un transformer moderno (RoPE, RMSNorm, sin sesgos) de 4 capas, 4 cabezas de atencion y dimension de embedding 128, con una longitud de contexto de 36 tokens (9 sorteos de 4 tokens cada uno). Se distribuye con licencia MIT y esta pensado exclusivamente como pieza de exhibicion e investigacion, no como herramienta de prediccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only moderno (RoPE, RMSNorm, sin sesgos), motor `core` compartido |
| Parametros totales | 0,79 M (4 capas, 4 cabezas, dim. de embedding 128) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 36 tokens (9 sorteos de 4 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (en la practica, solo digitos 0-9 y salto de linea) |
| Licencia | MIT |
| Formato de pesos | no disponible (los pesos no estan incluidos en el repositorio; exportacion ONNX mencionada en los tags) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer decoder-only moderna con embeddings rotatorios (RoPE), normalizacion RMSNorm y capas sin terminos de sesgo, construida sobre el motor `core` compartido del proyecto. Consta de 4 capas, 4 cabezas de atencion y una dimension de embedding de 128, sin dropout. El tokenizador es de un token por digito (`0`-`9` y salto de linea, 11 tokens en total), de modo que cada sorteo ocupa exactamente 4 tokens y el contexto completo abarca 9 sorteos.

El entrenamiento se realizo sobre 28.628 sorteos de Maryland Pick 3 (17.592 de la tarde desde el 29 de julio de 1976 y 11.036 del mediodia desde el 1 de mayo de 1995, hasta el 23 de noviembre de 2026), verificados contra el archivo de LotteryCorner. Los ejemplos se cortan en los limites de sorteo con el formato "8 sorteos → siguiente sorteo", calculando la perdida unicamente sobre el sorteo final. Se uso el optimizador AdamW con tasa de aprendizaje 3e-4 y decaimiento coseno hasta 3e-5, 100 pasos de calentamiento, β2 = 0,99, weight decay 0,1 y tamano de lote 256. La ejecucion consta de 3.000 pasos (33 epocas) desde la semilla 1337, y la version publicada corresponde al paso 1100, el de menor perdida de validacion. El entrenamiento se ejecuto en CPU sobre un Mac con Apple Silicon. Antes del entrenamiento se aplicaron 44 pruebas de chi-cuadrado sobre los sorteos (frecuencia de digitos por posicion, era y decada; las 1.000 combinaciones; dependencia entre sorteos consecutivos) sin encontrar evidencia que rechazase la uniformidad.

## Capacidades

- Generacion de texto restringida al dominio de los sorteos: dado un contexto de 8 sorteos, emite un noveno sorteo de tres digitos y salto de linea.
- Muestreo determinista por semilla a temperatura 1: la misma cinta de entrada y la misma semilla producen siempre la misma eleccion.
- Generacion autoregresiva con realimentacion: la herramienta `harness.py pick` permite encadenar predicciones pasando cada eleccion como historial.
- Aprendizaje de la forma del sorteo: tres digitos seguidos de salto de linea (99.994 de cada 100.000 muestras en bruto son validas).
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso, vision, audio ni modo de pensamiento.
- Capacidad multilingue inexistente: el vocabulario se limita a 11 tokens.

## Casos de uso

- Docencia sobre experimentos nulos en machine learning: el modelo sirve para ilustrar con numeros concretos por que un transformer no puede aprender senal inexistente, comparando su perdida con el limite teorico calculado a priori.
- Auditoria de pipelines de evaluacion: permite verificar que un arnes de evaluacion detecta correctamente la ausencia de senal comparando el modelo con historial frente al control sin historial.
- Demostracion de sobreajuste: el aumento de la perdida de validacion del paso 1100 (9,9709) al paso 3000 (9,9844) ejemplifica como el entrenamiento prolongado ajusta ruido cuando no hay estructura que aprender.
- Reproducibilidad de experimentos: con semilla 1337 y los hiperparametros documentados, cualquier investigador puede replicar la curva de perdida en una CPU domestica.
- Validacion de tecnicas de tokenizacion: el esquema de un token por digito y corte en limites de sorteo sirve como caso de prueba para disenos de tokenizadores y funciones de perdida enmascarada.
- Exhibicion divulgativa: la interfaz web en el navegador (www.supcpu.com/interfaces) permite mostrar al publico general que un modelo entrenado con 50 anos de sorteos no mejora la probabilidad de 1 entre 1.000.
- Prueba de infraestructura de despliegue: por su tamano minimo, puede usarse como smoke test de pipelines de inferencia (exportacion ONNX, servidores de generacion) antes de desplegar modelos mayores.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Perdida en validacion (held-out) | 9,9709 bits/sorteo sobre 2.862 sorteos, intervalo del 95 % [9,9675; 9,9745] |
| Limite teorico inferior | 9,9658 bits/sorteo |
| Diferencia sobre el limite | +0,0051 bits (0,05 %) |
| Control sin historial | 9,9707 bits/sorteo |
| Control menos historial | −0,0002 bits/sorteo, intervalo del 95 % [−0,0052; +0,0046] |
| Perdida en el paso 3000 | 9,9844 bits/sorteo |
| Muestras validas en bruto | 99.994 de 100.000 son tres digitos |
| Estabilidad frente a la entrada | 1.985 de 2.000 elecciones identicas al cambiar los 8 sorteos de entrada manteniendo la semilla |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible; el modelo no es evaluable en esas tareas por su dominio y vocabulario restringidos.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en cualquier precision; con 0,79 M de parametros, los pesos ocupan unos 3 MB en fp32 y unos 1,6 MB en fp16.
- GPU recomendadas: ninguna en particular; el modelo se entreno en CPU sobre Apple Silicon y funciona en cualquier CPU moderna.
- Cabe holgadamente en cualquier GPU de consumo (RTX 3060, RTX 4090, etc.) e incluso en dispositivos embebidos.
- Opciones de despliegue: exportacion ONNX (mencionada en los tags), ejecucion nativa mediante el arnes `harness.py` del repositorio y la interfaz web en el navegador; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; dado el tamano, la inferencia es practicamente instantanea en cualquier hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lucky-nanogpt-1 | 0,79 M | 36 tokens | Experimento nulo sobre sorteos Pick 3 | MIT | Pesos no incluidos en el repositorio |
| lucky-nanogpt-power-1 | no disponible | no disponible | Experimento nulo sobre Powerball (hermano del mismo proyecto) | no disponible | Referenciado en la web del autor |
| nanoGPT (referencia de Karpathy) | variable (configurable) | variable | Framework educativo de entrenamiento de GPT | MIT | Codigo publico |

No se dispone de datos de rendimiento comparables entre estos modelos, ya que cada uno opera en un dominio distinto y no comparten tareas de evaluacion.

## Limitaciones y advertencias

- No predice la loteria: cada boleto generado tiene una probabilidad de 1 entre 1.000, identica a la de cualquier combinacion elegida al azar.
- La cinta de entrada es decorativa: cambiar los 8 sorteos de historial manteniendo la semilla produce la misma eleccion en 1.985 de 2.000 casos; es la semilla la que determina el boleto.
- La diferencia de 0,0051 bits sobre el limite teorico no es cero: refleja el coste de estimar diez frecuencias de digitos a partir de una muestra finita y no se elimina con mas entrenamiento, sino con mas datos.
- Sobreajuste documentado: a partir del paso 1100 la perdida de validacion empeora (de 9,9709 a 9,9844 en el paso 3000) al ajustar peculiaridades de los sorteos de entrenamiento.
- El 0,006 % de las muestras en bruto no son tres digitos (un salto de linea ocupa la posicion de un digito); el arnes las rechaza y remuestrea con la siguiente semilla.
- Dominio estrictamente limitado: solo juegos de tres digitos; no conoce Pick 4 ni Pick 5, y su vocabulario de 11 tokens impide cualquier uso fuera de este formato.
- Los pesos no estan incluidos en el arbol del repositorio (ADR-0002), por lo que no puede ejecutarse directamente desde Hugging Face sin obtenerlos del proyecto.
- Licencia MIT: permite uso comercial, pero el modelo carece de cualquier utilidad practica fuera de la investigacion y la divulgacion.
- No apto para produccion: no hay garantia de mantenimiento, soporte ni estabilidad de la API.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sup-computer/lucky-nanogpt-1
- Pagina del modelo en sup computer: https://www.supcpu.com/models/lucky-nanogpt-1/
- Articulo de investigacion "What does a model learn from fifty years of lottery draws?": https://www.supcpu.com/research/fifty-years-of-lottery-draws/
- Modelo hermano lucky-nanogpt-power-1: https://www.supcpu.com/models/lucky-nanogpt-power-1/
- Monorepo del proyecto: https://github.com/romellogoodman/sup-computer
- Codigo congelado del modelo (tag `lucky-nanogpt-1`): https://github.com/romellogoodman/sup-computer/tree/main/projects/lucky/models/lucky-nanogpt-1
- Interfaz web en el navegador: https://www.supcpu.com/interfaces/
- ADR-0002 sobre la ausencia de pesos en el repositorio: https://github.com/romellogoodman/sup-computer/blob/main/docs/adr/0002-no-weights-in-t
