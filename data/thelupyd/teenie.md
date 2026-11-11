# TheLupyd/teenie

## Resumen

Teenie es un modelo de aprendizaje en contexto (in-context learning) diseñado para inferir una regla aritmética oculta `c = f(a, b)` a partir de 999 ejemplos y responder preguntas nuevas en un único pase hacia delante. Lo desarrolla TheLupyd y se publica bajo licencia MIT. El modelo no ve nunca la fórmula, mantiene sus pesos congelados durante la inferencia y proporciona una probabilidad para cada bit de cada respuesta. Cuenta con 1.145.339 parámetros y los mismos pesos funcionan tanto con números de 16 como de 32 bits.

La relevancia del modelo reside en su planteamiento: en lugar de aprender operaciones concretas, aprende a inducir reglas algorítmicas a partir de ejemplos, incluyendo operaciones que nunca vio durante el entrenamiento (división, resto, rotaciones, condicionales). Todo el entrenamiento se realizó con reglas sintéticas en una GPU de portátil de 4 GB, lo que lo convierte en un caso de estudio accesible sobre razonamiento algorítmico con modelos pequeños.

Se distribuye en formato PyTorch (`.pt`) y ONNX (versiones para 32 y 16 bits, de 8,1 y 7,7 MB respectivamente), lo que permite ejecutarlo en el navegador del usuario sin backend. No se han publicado datos sobre idiomas soportados ni sobre pipeline de Hugging Face.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con atención sobre bits; un token por bit de respuesta, refinamiento iterativo en 12 rondas con pesos compartidos, dos registros de trabajo por pregunta y 64 ejemplos resueltos en paralelo |
| Parámetros totales | 1.145.339 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 999 ejemplos de entrada `(a, b, c)` más hasta 64 preguntas `(a, b)` por pase |
| Tipos de cuantización | No disponible (solo se publican pesos en precisión original y exportaciones ONNX para 16 y 32 bits) |
| Idiomas soportados | No disponible (modelo orientado a aritmética, no a lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`.pt`), ONNX (`teenie-w32.onnx`, `teenie-w16.onnx`) |

## Arquitectura y entrenamiento

Teenie emplea una arquitectura transformer en la que cada bit de la respuesta se representa como un token. Cada bit de respuesta atiende a los ejemplos bit a bit mediante atención, y la respuesta completa se refina a lo largo de 12 rondas reutilizando los mismos pesos. Cada pregunta mantiene dos registros de trabajo (scratch registers) que escribe y relee en cada ronda, y 64 ejemplos resueltos se procesan en paralelo junto con las preguntas. Ninguna operación aritmética está implementada de forma explícita en el modelo: todo el comportamiento emerge del entrenamiento.

El entrenamiento utilizó exclusivamente reglas sintéticas: operaciones individuales, expresiones aleatorias de 1 a 5 operaciones, cadenas y bucles, tanto a 16 como a 32 bits. Se realizó en una GPU de portátil de 4 GB. El modelo resultante procede de una única semilla de entrenamiento y los resultados publicados provienen de un solo modelo. No se documenta el uso de RLHF, DPO ni el volumen exacto de tokens de entrenamiento.

## Capacidades

- Inferencia de reglas aritméticas ocultas `c = f(a, b)` a partir de 999 ejemplos en un único pase hacia delante, con pesos congelados.
- Generalización a operaciones no vistas durante el entrenamiento: división, resto, rotaciones y condicionales (73,1% de exactitud en el grupo de nuevos tipos de operación a 32 bits).
- Composición de operaciones: productos seguidos de un paso (68,9% exacto) y composiciones ocultas (62,0% exacto).
- Manejo de expresiones aleatorias de 2 a 7 operaciones (23-25% exacto) y bucles no vistos (17,5% exacto).
- Salida probabilística por bit: devuelve la probabilidad de que cada bit de la respuesta sea 1, junto con una medida de confianza (el bit menos seguro).
- Funcionamiento con números de 16 y 32 bits con los mismos pesos; los números se desbordan (wrap) en el ancho correspondiente tras cada paso.
- Capacidad de calibración: cuando todos los bits de una respuesta tienen al menos un 99% de confianza, la respuesta fue correcta en el 99-100% de los casos en todos los grupos evaluados.
- No dispone de soporte documentado de tool calling, agentes, visión, audio ni capacidades multilingües de lenguaje natural.

## Casos de uso

- Descubrimiento de fórmulas en datos tabulares pequeños: dado un conjunto de 999 pares de entrada-salida enteros, Teenie puede inferir la regla subyacente y predecir nuevas combinaciones, útil para ingeniería inversa de transformaciones numéricas en sistemas legacy.
- Detección de reglas en registros de hardware: al operar con anchos de 16 y 32 bits y desbordamiento modular, encaja en el análisis de rutinas aritméticas de firmware o de registros de CPU donde las operaciones se comportan como registros de 32 bits.
- Verificación de implementaciones aritméticas: comparar la salida de una función sospechosa con las predicciones probabilísticas de Teenie permite detectar discrepancias en bits concretos, gracias a la probabilidad por bit.
- Investigación en razonamiento algorítmico: sirve como banco de pruebas reproducible (MIT, código y experimentos públicos) para estudiar la inducción de reglas en modelos pequeños frente a baselines como árboles gradient-boosted o redes neuronales ajustadas por tarea.
- Ejecución en el navegador sin backend: las exportaciones ONNX de 8,1 y 7,7 MB permiten desplegar la inferencia en el dispositivo del usuario con solo `numpy` y `onnxruntime`, adecuado para demos interactivas o herramientas educativas.
- Análisis de autómatas celulares y transformaciones bit a bit: el modelo muestra capacidad (aunque limitada) en reglas 30 y 110 de autómatas celulares, lo que permite explorar la inferencia de dinámicas discretas a partir de ejemplos.
- Docencia sobre aprendizaje en contexto: su tamaño reducido y su naturaleza sintética lo hacen apropiado para ilustrar conceptos de in-context learning y calibración probabilística en cursos y talleres.

## Benchmarks y rendimiento

Resultados a 32 bits sobre reglas no vistas durante el entrenamiento. "Bits recuperados" se define como 32 + log2 de la probabilidad asignada a la respuesta verdadera: 0 equivale a una conjetura ciega y 32 a certeza y acierto.

| Grupo de test | Exacto | Bits recuperados | Mejor lookup |
|---|---|---|---|
| Operaciones individuales retenidas | 100% | 32,0 | 21,8 |
| Nuevos tipos de operación (división, resto, rotaciones, condicionales) | 73,1% | 27,2 | 12,0 |
| Un producto y después un paso | 68,9% | 30,0 | 2,2 |
| Composiciones ocultas | 62,0% | 27,2 | 4,8 |
| Expresiones aleatorias de 2, 3-4 y 5-7 operaciones | 23-25% | 12,8-14,5 | 1,5-2,5 |
| Bucles no vistos | 17,5% | 13,6 | 5,2 |
| Bucles más largos que los de entrenamiento | 28,7% | 13,3 | 7,8 |

Comparación con baselines ajustados por tarea sobre los propios 999 ejemplos (bits recuperados a 32 bits):

| Grupo retenido | Teenie | Árboles ajustados por tarea | Red pequeña ajustada por tarea |
|---|---|---|---|
| Expresiones aleatorias de 6-10 pasos | **19,9** | 18,5 | 12,9 |
| Productos | **11,7** | 3,8 | 0,4 |
| Autómatas celulares (reglas 30, 110) | **9,1** | 2,9 | 0,0 |
| Expresiones profundas con constantes | **8,7** | 2,0 | 0,0 |
| S-box aleatoria dentro de aritmética | **7,8** | 1,2 | 0,0 |
| Pasos dependientes de datos | **6,4** | 1,5 | 0,1 |
| Bucles | **3,8** | 2,4 | 0,2 |
| Mezclas de rotaciones | 3,6 | **8,6** | 0,0 |
| Hashes (control) | 0,0 | 0,0 | 0,0 |

No se han publicado comparaciones con TabPFN ni con otros modelos de aprendizaje en contexto publicados.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en todos los formatos publicados; las exportaciones ONNX ocupan 8,1 MB (32 bits) y 7,7 MB (16 bits) incluyendo pesos.
- GPU recomendadas: cualquier GPU con soporte de ONNX Runtime o PyTorch; el entrenamiento se realizó en una GPU de portátil de 4 GB, por lo que la inferencia cabe holgadamente en hardware de gama baja.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna e incluso en CPU; también se ejecuta en el navegador del usuario.
- Opciones de despliegue: ONNX Runtime (con `numpy` y `onnxruntime`), PyTorch en CPU/GPU, y ejecución en navegador a través de la demo oficial.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Teenie | 1.145.339 | 999 ejemplos + hasta 64 preguntas | Inducción de reglas aritméticas en contexto, salida probabilística por bit | MIT | Hugging Face, ONNX, demo en navegador |
| TabPFN | No disponible en la información proporcionada | No disponible | Aprendizaje en contexto para datos tabulares | No disponible | No disponible |
| Árboles gradient-boosted ajustados por tarea | No aplica | No aplica | Baseline supervisado por tarea | No aplica | No aplica |
| Red neuronal pequeña ajustada por tarea | No disponible | No disponible | Baseline supervisado por tarea | No aplica | No aplica |

El autor indica explícitamente que Teenie no se ha comparado todavía con TabPFN ni con otros modelos de aprendizaje en contexto publicados, por lo que la comparativa con alternativas de la misma categoría queda pendiente.

## Limitaciones y advertencias

- Multiplica sus entradas (`a*b` es 89% exacto a 32 bits), pero no valores que calcula primero: `(a+b)*a` o `a*a - b*b` solo aciertan los seis bits más bajos aproximadamente.
- Las rotaciones son nuevas para el modelo y las reglas diseñadas para mezclar bits (hashes, cifrados, incluso una ronda add-rotate-xor) quedan fuera de su alcance.
- Los números se desbordan en el ancho correspondiente tras cada paso, como registros de 32 bits; esto puede producir resultados distintos a los de una aritmética sin desbordamiento.
- En mezclas de rotaciones rinde peor que los árboles gradient-boosted ajustados por tarea (3,6 frente a 8,6 bits recuperados).
- Los resultados proceden de una única semilla de entrenamiento y de un solo modelo; no se ha evaluado la variabilidad entre ejecuciones.
- La exactitud cae notablemente en expresiones aleatorias de varias operaciones (23-25%) y en bucles (17,5%), por lo que no es adecuado para reglas complejas sin verificación adicional.
- No se documentan sesgos sociales ni de idioma porque el modelo no procesa lenguaje natural; el riesgo principal es la confianza mal calibrada fuera de los grupos evaluados.
- La licencia MIT permite uso comercial, pero no se han publicado garantías ni evaluaciones en entornos de producción.
- No se ha comparado con TabPFN ni con otros modelos de aprendizaje en contexto, lo que limita la evaluación de su ventaja relativa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TheLupyd/teenie
- Demo en navegador: https://teenie.lupyd.com/try/
- Write-up técnico: https://teenie.lupyd.com/writeup/
- Código, entrenamiento y experimentos: https://github.com/ash-hashtag/teenie
