# XvKuoMing/control-resonant-idm

## Resumen

Control Resonant IDM es un modelo de dinámica inversa (inverse dynamics model) desarrollado por XvKuoMing para el videojuego CONTROL Resonant. Su función es observar vídeo de gameplay y predecir, fotograma a fotograma, qué estaba haciendo el mando: los 21 botones y ambos sticks analógicos. El objetivo es etiquetar grabaciones de gameplay que no tienen input registrado, de modo que puedan usarse para entrenar un agente que juegue al título.

El modelo parte de un encoder visual SigLIP 2 large (patch 16, 256 px) afinado, al que añade un transformer temporal de 4 capas y 8 cabezas que opera sobre ventanas de 8 fotogramas. Con 329 millones de parámetros y un peso de repositorio de 1,3 GB, es un modelo compacto y especializado, no un modelo de lenguaje: su salida es un vector de 21 logits de botones más 4 valores de stick.

Es relevante ahora porque ejemplifica una tendencia práctica en el entrenamiento de agentes para videojuegos: usar modelos de dinámica inversa como etiquetadores automáticos de grandes volúmenes de vídeo no anotado, evitando la captura manual de inputs. La ficha documenta sus resultados reales sobre sesiones no vistas, sus limitaciones severas (un solo juego, un solo jugador, 6,4 horas de datos) y su encaje en la colección `games_idm` del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder visual SigLIP 2 large (patch 16, 256 px) + transformer temporal de 4 capas y 8 cabezas |
| Parametros totales | 329.116.697 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Ventana temporal de 8 fotogramas (cada 2.º fotograma a 60 fps, 267 ms) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo de vídeo, no de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería pytorch) |

## Arquitectura y entrenamiento

La arquitectura combina un encoder de imagen SigLIP 2 large con patch de 16 píxeles y resolución de 256×256, afinado durante el entrenamiento. Cada fotograma se divide en parches de 16×16 proyectados a 512 dimensiones y luego se agrupan por media (average pooling) a una rejilla de 4×4, reduciendo el coste computacional. Sobre la secuencia de tokens de la ventana temporal opera un transformer de 4 capas y 8 cabezas. La ventana cubre 8 fotogramas tomados cada 2.º fotograma a 60 fps, es decir, 267 ms de vídeo. La salida por fotograma son 21 logits de botones y 4 valores de stick pasados por tanh.

El entrenamiento usó 8 sesiones de grabación de un único jugador, 6,4 horas en total, con input de mando registrado a 1000 Hz y alineado al vídeo. Se reservó un bloque contiguo de cada sesión (del 30 % al 40 % de su longitud) como validación. Se entrenó 8000 pasos con batch 16, AdamW, learning rate 1e-4 (1e-5 para el encoder visual) y weight decay 0.01. La función de pérdida combina entropía cruzada binaria para botones, con pesos de hasta 10× para botones raros, y L1 para los sticks. Los fotogramas sin ningún input se redujeron al 30 % para evitar que el tiempo muerto dominara el dataset. El checkpoint publicado es el de menor pérdida de validación (paso 7000), y las métricas de validación seguían mejorando al detener el entrenamiento.

## Capacidades

- Predicción de 21 botones por fotograma con probabilidad asociada (logits y salida binaria).
- Predicción de los cuatro ejes de stick analógico (izquierdo x/y, derecho x/y) en rango [-1, 1].
- Procesamiento de vídeo a 60 fps con ventana temporal de 267 ms.
- Etiquetado automático de gameplay sin input registrado, orientado a imitación y entrenamiento de agentes.
- Salida estructurada lista para volcar a `.npz` desde línea de comandos.
- No soporta tool calling, agentes multi-paso ni capacidades multilingües: es un modelo de clasificación de vídeo, no generativo.
- No dispone de modo thinking, visión general, audio ni otras capacidades fuera del dominio del gameplay.

## Casos de uso

- Etiquetado de gameplay sin input para imitación: el modelo genera `buttons`, `probs` y `sticks` por fotograma, permitiendo entrenar un agente que reproduzca el comportamiento observado en vídeos donde no se registró el mando. Es adecuado porque su error de stick está entre un 35 % y un 40 % por debajo del baseline de sticks centrados.
- Construcción de datasets de dinámica inversa a escala: con 6,4 horas de entrenamiento y un coste de inferencia bajo (329 M de parámetros), sirve para preetiquetar horas de vídeo y filtrar por probabilidad antes de usarlo como pseudo-ground-truth.
- Investigación en aprendizaje por imitación desde vídeo: útil como componente de un pipeline que convierte demos no anotadas en pares (observación, acción) para algoritmos de behavioral cloning.
- Análisis de telemetría de partidas: las predicciones de sticks y botones permiten reconstruir aproximadamente la actividad del jugador en grabaciones antiguas o de terceros, siempre con filtrado por probabilidad.
- Prototipado de asistentes de gameplay: la salida por fotograma puede alimentar visualizaciones o análisis de estilo de juego en tiempo casi real, dado el tamaño reducido del modelo.
- Base para modelos multi-juego: al estar en la colección `games_idm` junto a modelos de otros títulos, sirve como referencia metodológica para entrenar dinámicas inversas en nuevos juegos con datos propios.

## Benchmarks y rendimiento

Resultados sobre tres sesiones no vistas durante el entrenamiento (88 minutos en total), comparados con el input real de mando:

| Sesion | Duracion | Error de stick | Error de stick (baseline en reposo) | F1 de botones | AP de botones |
|---|---|---|---|---|---|
| A | 13,6 min | 0,121 | 0,180 | 0,36 | 0,42 |
| B | 51,8 min | 0,086 | 0,142 | 0,29 | 0,30 |
| C | 21,8 min | 0,108 | 0,178 | 0,27 | 0,27 |

F1 por botón en las mismas sesiones:

| Boton | A | B | C |
|---|---|---|---|
| Left trigger | 0,68 | 0,58 | 0,64 |
| X (west) | 0,59 | 0,62 | 0,55 |
| A (south) | 0,57 | 0,61 | 0,50 |
| B (east) | 0,52 | 0,50 | 0,51 |
| Left bumper | 0,32 | 0,46 | 0,47 |
| Right bumper | 0,28 | 0,20 | 0,21 |
| Y (north) | 0,20 | 0,17 | 0,19 |
| D-pad down | – | 0,15 | 0,20 |
| Left stick click | 0,06 | 0,10 | 0,09 |
| Start | 0,00 | 0,05 | 0,07 |

Lectura: los sticks son utilizables (35-40 % por debajo del baseline), los botones principales aciertan aproximadamente la mitad de las veces o mejor, y los botones raros (D-pad, clics de stick, Start, right trigger) no están aprendidos por su escasez en los datos. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) porque no aplican a este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 329 M de parámetros en fp32 el peso ronda 1,3 GB, por lo que la inferencia cabe holgadamente en GPUs de consumo.
- GPU recomendadas: cualquier GPU con al menos ~2-4 GB de VRAM libre; el autor indica `load(folder)` con CUDA por defecto y `load(folder, "cpu")` como alternativa.
- Cabe en GPU de consumo: sí, por el tamaño del modelo; la restricción real es la memoria RAM durante la decodificación de vídeo (unos 12 GB por hora de vídeo, según el autor).
- Opciones de despliegue: script `idm.py` del propio repositorio con PyTorch, transformers, safetensors y numpy; requiere ffmpeg en el PATH. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Control Resonant IDM | 329 M | 8 fotogramas (267 ms) | Dinámica inversa de gameplay | Apache 2.0 | Hugging Face |
| Otros modelos de la colección `games_idm` | No disponible | No disponible | Dinámica inversa por juego | No disponible | Hugging Face (misma colección) |
| SigLIP 2 large patch16-256 (base) | No disponible en esta ficha | N/A (imagen) | Clasificación / visión-lenguaje | No disponible en esta ficha | Hugging Face |

No se dispone de datos de benchmarks comparables con otras alternativas de dinámica inversa para videojuegos en la información proporcionada.

## Limitaciones y advertencias

- Un solo juego, un solo jugador, un solo layout de mando y una sola configuración gráfica: no generaliza a otros títulos ni a otros estilos de juego.
- Entrenado con solo 6,4 horas; se espera fallo en escenas poco vistas como menús y cinemáticas.
- Las etiquetas de botones son demasiado ruidosas para usarse como ground truth sin filtrar por probabilidad.
- Los botones raros (D-pad, clics de stick, Start, right trigger) no están aprendidos; sus F1 son muy bajos.
- Una pulsación que no produce cambio visible en pantalla no puede recuperarse del vídeo por ningún modelo.
- Riesgo de sesgo hacia el jugador y la configuración de captura usados en el entrenamiento.
- Licencia Apache 2.0 permite uso comercial, pero la calidad limitada y el dominio restringido hacen desaconsejable su uso en producción sin validación propia.
- La decodificación completa del vídeo consume unos 12 GB por hora; conviene trocear grabaciones largas o usar `label_frames` por bloques.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/XvKuoMing/control-resonant-idm
- Colección `games_idm`: https://huggingface.co/collections/XvKuoMing/games-idm-6afad7e3b254dced2f3ea57e
- Modelo base: https://huggingface.co/google/siglip2-large-patch16-256
