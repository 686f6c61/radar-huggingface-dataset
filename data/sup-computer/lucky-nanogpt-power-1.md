# sup-computer/lucky-nanogpt-power-1

## Resumen

`lucky-nanogpt-power-1` es un modelo de lenguaje de escala minima (0,80 M de parametros) desarrollado por sup computer, un estudio de modelos pequenos, y publicado bajo licencia MIT. No es un modelo de proposito general: es un experimento nulo disenado para medir que aprende un transformer cuando se le entrena con un corpus sin senal predictiva. El corpus son los 1.436 sorteos de Powerball celebrados bajo la matriz 69/26 entre el 7 de octubre de 2015 y el 21 de noviembre de 2026.

La arquitectura es un GPT moderno (RoPE, RMSNorm, sin sesgos) de 4 capas, 4 cabezas y 128 dimensiones de embedding, con una ventana de contexto de 72 tokens equivalente a 9 sorteos. El modelo lee los ultimos 8 sorteos y emite el siguiente. Su utilidad no es predecir la loteria, sino servir como referencia empirica de rendimiento en el limite teorico de la entropia: la perdida retenida es de 28,687 bits por sorteo frente a un suelo de log2(292.201.338) = 28,122 bits.

Es relevante ahora porque cuantifica con rigor cuanto se acerca un modelo pequeno al suelo de entropia de una distribucion uniforme sin estructura, y porque documenta que el modelo no llega a aprender la regla de no repeticion de blancas con solo 1.436 ejemplos. Es la mitad de un experimento nulo cuyo hermano es `lucky-nanogpt-1`, entrenado sobre un billete mas pequeno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT moderno (RoPE, RMSNorm, sin sesgos) del motor compartido `core` |
| Parametros totales | 0,80 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 72 tokens (9 sorteos) |
| Tipos de cuantizacion | no disponible (pesos no publicados en el repo) |
| Idiomas soportados | en (los unicos tokens son numeros 1-69, separador y salto de linea) |
| Licencia | MIT |
| Formato de pesos | no disponible (los pesos no estan incluidos en el repositorio) |

## Arquitectura y entrenamiento

El modelo sigue la familia de arquitecturas modernas de GPT: atencion con RoPE, normalizacion RMSNorm y capas lineales sin sesgo, sobre el motor `core` compartido del proyecto. Consta de 4 capas, 4 cabezas de atencion y 128 dimensiones de embedding, sin dropout. El vocabulario es de 71 tokens: los numeros del 1 al 69 compartidos entre blancas y roja, una barra separadora y un salto de linea. Cada sorteo ocupa 8 tokens.

El entrenamiento usa 1.436 sorteos reales procedentes del fichero de datos abiertos de Nueva York, verificados contra el de la Loteria de Texas. La division es temporal: 1.150 sorteos hasta el 22 de enero de 2025 para entrenamiento, los siguientes 143 para seleccionar el paso de parada y los 143 mas recientes (hasta el 21 de noviembre de 2026) como conjunto retenido. Los ejemplos se cortan en los limites de sorteo como "8 sorteos → siguiente sorteo", con la perdida solo en el sorteo final. Se usa AdamW con LR 3e-4 y decaimiento coseno hasta 3e-5, 100 pasos de calentamiento, beta2 0,99, weight decay 0,1 y tamano de lote 64. La ejecucion completa son 3.000 pasos (167 epocas) desde la semilla 1337, pero la version publicada es el paso 300 (17 epocas), el de menor perdida de validacion. El entrenamiento se realizo en CPU sobre un Mac con Apple Silicon. Una innovacion destacable del pipeline es que el cargador reordena aleatoriamente las cinco blancas de cada sorteo en cada epoca, para evitar que el modelo aprenda el sesgo de que la primera blanca publicada suele ser pequena.

## Capacidades

- Generacion de secuencias de numeros con la forma de un billete de Powerball: cinco blancas, separador y una roja.
- Modelado de la distribucion del siguiente sorteo condicionada a los 8 anteriores (contexto de 9 sorteos).
- Aprendizaje parcial del rango de la bola roja: solo el 6,2% de las muestras en crudo ponen la roja por encima de 26, frente al 62% esperable en un modelo sin conocimiento.
- No dispone de tool calling, function calling ni soporte de agentes.
- No dispone de razonamiento multi-paso ni modo de pensamiento explicito.
- No dispone de capacidades multilingues: el vocabulario esta limitado a numeros y dos caracteres de control.
- No dispone de vision, audio ni ninguna otra modalidad.
- No ha aprendido la regla de no repeticion de blancas (la repite en el 14,0% de las muestras en crudo, similar al 13,8% esperable por azar con reemplazamiento).

## Casos de uso

- Referencia de calibracion en investigacion de entropia: sirve para comparar la perdida de otros modelos pequenos contra el suelo teorico de una distribucion uniforme conocida, ya que el suelo de 28,122 bits por sorteo es calculable de forma exacta.
- Docencia sobre aprendizaje sin senal: util para mostrar en clase que un transformer puede ajustarse al rango de una variable (la roja) pero no aprender una restriccion combinatoria (no repeticion) con 1.436 ejemplos.
- Prueba de pipelines de evaluacion: el harness del autor gestiona la forma del billete, el muestreo con temperatura 1 y el rechazo de intentos invalidos, lo que permite validar infraestructura de generacion restringida.
- Auditoria de fuga de datos en corpus pequenos: la comparacion entre muestras generadas y sorteos pasados (1 coincidencia de 802.007 muestras frente a 3,9 esperadas por azar) es un ejemplo metodologico de deteccion de memorizacion.
- Exhibicion divulgativa sobre loterias: el modelo puede integrarse en una demo web que ilustre por que ningun modelo puede batir la probabilidad de 1 entre 292.201.338 por billete valido.
- Validacion de tecnicas de aumento de datos: el reordenamiento aleatorio de blancas por epoca es un caso reproducible de como evitar que el modelo explote un sesgo de presentacion del corpus.
- Estudio de escalado en regimen extremo: con 0,80 M de parametros y 72 tokens de contexto, sirve como punto de partida para analizar curvas de aprendizaje en tareas con suelo de entropia conocido.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Perdida retenida (143 sorteos) | 28,687 bits/sorteo, IC 95% [28,594; 28,778] |
| Suelo teorico | 28,122 bits/sorteo |
| Distancia al suelo | +0,564 bits (2,0%) |
| Control sin historial | 28,505 bits/sorteo |
| Control menos historial | -0,182 bits/sorteo, IC 95% [-0,243; -0,120] |
| Perdida en el paso 3000 | 36,251 bits/sorteo |
| Billetes validos en crudo | 802.007 de 1.000.000 (80,2%) |
| Muestras coincidentes con un sorteo pasado | 1 de 802.007 (esperadas por azar: 3,9) |
| Rechazos por blanca repetida | 140.083 |
| Rechazos por roja fuera de 1-26 | 61.829 |
| Rechazos por separador o salto de linea en una blanca | 5.048 |

La evaluacion se puntua a nivel de conjunto: la probabilidad del modelo se suma sobre las 120 ordenaciones posibles de las blancas de cada sorteo retenido, de modo que la cifra es comparable al suelo de un conjunto de cinco numeros y no de una secuencia.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 MB en precision completa para los 0,80 M de parametros; cabe en cualquier GPU consumer y en CPU.
- GPU recomendadas: no requiere GPU; el autor entreno y ejecuto en CPU sobre Apple Silicon.
- Cabe en consumer GPU: si, en cualquier modelo (RTX 4090, RTX 3060, integradas).
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI; el autor usa un `harness.py` propio y una demo web en supcpu.com/interfaces. Los pesos no estan incluidos en el repositorio de Hugging Face.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `lucky-nanogpt-power-1` | 0,80 M | 72 tokens (9 sorteos) | Prediccion de sorteos Powerball 69/26 | MIT | Pesos no incluidos en el repo |
| `lucky-nanogpt-1` | no disponible | no disponible | Prediccion de un billete de loteria mas pequeno | MIT (presumible, mismo proyecto) | no disponible |
| Modelo de referencia sin historial (control del experimento) | 0,80 M | 72 tokens | Misma tarea sin condicionamiento en sorteos previos | no disponible | no disponible |

No se dispone de datos publicos de otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- No predice Powerball: cada billete valido generado tiene una probabilidad de 1 entre 292.201.338, identica a la de cualquier combinacion elegida al azar.
- No ha aprendido la regla de no repeticion de blancas: repite una blanca en el 14,0% de las muestras en crudo, practicamente igual al 13,8% esperable por azar con reemplazamiento.
- El rango de la roja esta mayoritariamente aprendido, pero no completamente: el 6,2% de las muestras en crudo colocan la roja por encima de 26.
- Solo conoce la matriz 69/26: cualquier cambio de reglas deja el modelo obsoleto.
- Power Play y Double Play no estan en el corpus.
- El vocabulario esta limitado a numeros y dos caracteres de control, por lo que no puede usarse para generacion de texto en lenguaje natural pese a la etiqueta `text-generation`.
- Los pesos no estan incluidos en el repositorio de Hugging Face; el checkpoint reside en el monorepo del autor sin pesos confirmados.
- El modelo se entreno en CPU sobre Apple Silicon con 1.436 ejemplos, lo que limita su capacidad de generalizacion a cualquier otra distribucion.
- Riesgo de alucinacion en el sentido estadistico: el modelo puede emitir secuencias fuera de rango o con repeticiones, que el harness descarta mediante remuestreo; sin ese filtro, el 19,8% de las muestras en crudo son invalidas.
- Licencia MIT: permite uso comercial, pero el modelo carece de aplicacion comercial realista mas alla de la divulgacion o la investigacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sup-computer/lucky-nanogpt-power-1
- Pagina del modelo: https://www.supcpu.com/models/lucky-nanogpt-power-1/
- Articulo de investigacion "What does a model learn from fifty years of lottery draws?": https://www.supcpu.com/research/fifty-years-of-lottery-draws/
- Modelo hermano `lucky-nanogpt-1`: https://www.supcpu.com/models/lucky-nanogpt-1/
- Demo en navegador: https://www.supcpu.com/interfaces/
- Monorepo del proyecto: https://github.com/romellogoodman/sup-computer
- Directorio del modelo en el monorepo: https://github.com/romellogoodman/sup-computer/tree/main/projects/lucky/models/lucky-nanogpt-power-1
- Sitio del estudio: https://www.supcpu.com
- Claude Code (herramienta usada en el desarrollo): https://claude.com/claude-code
