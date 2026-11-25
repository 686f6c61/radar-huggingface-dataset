# StarpowerTechnology/WVY-Cartoon-14m

## Resumen

WVY-Cartoon-14m es un modelo generativo de imágenes de texto a personaje de dibujos animados desarrollado por StarpowerTechnology, con 14,7 millones de parámetros entrenados desde cero (sin pesos preentrenados) sobre capas dibujadas a mano. Forma parte de la línea de investigación WVY de Starpower sobre "generación intencional": modelos pequeños entrenados con datos donde cada parte está etiquetada, posicionada e intercambiable, de modo que el control proviene de la estructura del dato y no de su volumen.

El modelo recibe etiquetas discretas en diez grupos (piel, pose, ropa, pelo, ojos, cejas, nariz, boca, objeto y fondo) y genera una imagen de 96×96 píxeles del personaje resultante, incluyendo combinaciones que nunca vio durante el entrenamiento. Con 132 piezas dibujadas a mano y unas 2.080 millones de combinaciones válidas, la implementación está escrita en numpy y se entrenó en dos núcleos de CPU, lo que lo convierte en una pieza fundamentalmente educativa y de investigación más que en un modelo de producción.

Su relevancia actual es conceptual: demuestra que la generalización composicional (combinar rasgos no vistos) se puede conseguir con un presupuesto de parámetros y cómputo mínimo si la curación de datos es lo bastante explícita. No es un modelo de difusión ni un transformer de texto a imagen al uso, sino una red densa de tres capas que actúa como un sistema de interruptores por rasgo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red densa feed-forward de 3 capas (110 entradas → 768 → 512 → 96×96×3), escrita en numpy |
| Parametros totales | 14.662.400 (14,7 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (entrada de 110 interruptores binarios, no texto libre) |
| Tipos de cuantizacion | No disponible (pesos en formato .npz, sin cuantizaciones publicadas) |
| Idiomas soportados | Inglés (etiquetas de rasgos en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | .npz (NumPy): `wvy_cartoon_14m.npz` (fine-tuned) y `wvy_cartoon_14m_pretrained.npz` |

## Arquitectura y entrenamiento

La arquitectura es una red neuronal densa de tres capas implementada en numpy, sin framework de deep learning. La entrada son 110 interruptores binarios (uno por cada valor de rasgo: 6 pieles, 6 poses, 17+ninguna ropas, 11 pelos, 16 ojos, 12 cejas, 12 narices, 14 bocas, 6+ningún objeto y 8 fondos). La primera capa (110→768, 85.248 parámetros) aprende una "receta" por pieza; la segunda (768→512, 393.728 parámetros) resuelve colocación y oclusión (pelo sobre cejas, vaso sobre mano); la tercera (512→96×96×3, 14.183.424 parámetros, el 96,7% del total) pinta los píxeles. El tamaño del modelo depende del detalle de salida, no del número de combinaciones: duplicar combinaciones añade 0 parámetros y añadir una pieza nueva añade 768.

Los datos son 55 piezas dibujadas a mano en Adobe Fresco más 77 piezas nuevas dibujadas para igualar el estilo (nuevas poses y formas de cuerpo en las 6 pieles, ropas, pelos, ojos, bocas y objetos), revisadas y corregidas por el artista. Se apilaron 10.000 personajes con etiquetas exactas a 192 px y se redujeron a 96 px para el entrenamiento. Se reservaron 300 combinaciones aleatorias y tres pares de rasgos nunca vistos juntos (mohawk + ojos de corazón, sudadera rosa + piel rojo-naranja, saludar + pelo morado desordenado). El preentrenamiento fue de 8.000 pasos sobre los 10.000 personajes (unos 35 minutos en 2 núcleos de CPU) y el ajuste fino de 2.000 pasos sobre 3.138 imágenes "buenas" (con al menos 3 rasgos favoritos), que son los pesos por defecto. No hay RLHF ni DPO; el ajuste fino es una selección de subconjunto de datos.

## Capacidades

- Generación de personajes de dibujos animados a 96×96 píxeles a partir de etiquetas discretas de rasgo, no de texto libre.
- Generalización composicional: genera combinaciones de rasgos no vistas en entrenamiento (99,3% de acierto por rasgo en el benchmark de 420 prompts).
- Control local: cambiar una etiqueta cambia solo esa parte, con el 94–99,8% del cambio de píxeles confinado al área del rasgo modificado.
- Respeto de reglas de compatibilidad aprendidas (camisetas y objetos de mano solo sobre el cuerpo de pie; vaso levantado solo con la pose de levantar el vaso).
- Rendimiento de unos 2.500 imágenes por segundo en 2 núcleos de CPU.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni texto libre; la entrada es exclusivamente un vector de 110 interruptores.

## Casos de uso

- Investigación en generalización composicional: banco de pruebas controlado para estudiar cómo un modelo pequeño combina rasgos nunca vistos, con métricas de sustitución de rasgo y PSNR reproducibles.
- Docencia de aprendizaje automático: ejemplo completo y ejecutable en numpy de entrenamiento desde cero, curación de datos y evaluación, sin dependencias de GPU.
- Generación de avatares de dibujos animados por lotes: dado un vector de rasgos, producir miles de personajes coherentes por segundo para prototipos de juegos o ilustración.
- Aumento de datos etiquetados: generar personajes con etiquetas exactas por parte para entrenar o evaluar otros modelos de segmentación o generación.
- Pruebas de sistemas de control de rasgos: validar pipelines que traducen especificaciones de personaje a vectores de interruptores antes de integrarlos en un motor mayor.
- Demostración de curación de datos frente a escala: comparar el rendimiento del modelo con una búsqueda de vecino más cercano por etiquetas (0% de acierto total frente al 99,3%) para ilustrar el valor de la estructura del dato.
- Despliegue educativo en navegador: la demo de Hugging Face Spaces permite experimentar con el modelo sin infraestructura, útil para talleres y clases.

## Benchmarks y rendimiento

Evaluación sobre 420 prompts no vistos, sustituyendo cada rasgo por las demás opciones válidas y comprobando si la imagen generada queda más cerca de la correcta que de las alternativas. La línea base es una búsqueda del vecino más cercano por etiquetas (lo que obtendría pura memorización).

| Sistema | Todos los rasgos correctos | Rasgos correctos | PSNR |
|---|---|---|---|
| WVY-Cartoon-14m (preentrenado) | 99,5% | 99,95% | 35,8 dB |
| WVY-Cartoon-14m (fine-tuned, por defecto) | 99,3% | 99,92% | 35,5 dB |
| Búsqueda de vecino más cercano por etiquetas | 0% | 56,6% | 15,5 dB |

Los tres pares nunca vistos juntos puntuaron 100%, salvo saludar + pelo morado desordenado con un 95%; los fallos provinieron de prompts de test que rompían una regla de compatibilidad. El ajuste fino supone un intercambio: en prompts no vistos con el estilo de las "buenas", el error bajó un 6%; en el resto subió un 15%.

## Requisitos de hardware

- VRAM estimada: no aplica; el modelo se ejecuta en CPU con numpy (pesos de 14,7 M de parámetros, repo de 0,1 GB).
- GPU recomendadas: ninguna necesaria; funciona en CPU. Cualquier GPU puede ejecutarlo, pero no aporta ventaja práctica.
- Cabe en cualquier equipo consumer: se entrenó en 2 núcleos de CPU y se ejecuta en navegador mediante Hugging Face Spaces.
- Opciones de despliegue: script Python con numpy y los ficheros `.npz`; demo en Hugging Face Spaces. No hay soporte para vLLM, llama.cpp, Ollama ni TGI (no es un modelo de lenguaje).
- Latencia y throughput: unos 2.500 imágenes por segundo en 2 núcleos de CPU; el preentrenamiento de 8.000 pasos tardó unos 35 minutos en 2 núcleos.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (texto a personaje con etiquetas discretas y generalización composicional entrenados desde cero en numpy). Los modelos de difusión de texto a imagen convencionales no son comparables en parámetros, resolución ni paradigma de entrada.

## Limitaciones y advertencias

- Resolución fija de 96×96 píxeles; no genera imágenes de mayor tamaño.
- La entrada es un vector de etiquetas discretas, no texto libre; no interpreta prompts en lenguaje natural.
- Las combinaciones que rompen las reglas de compatibilidad fallan: una sudadera con la pose de brazos arriba sale emborronada, un vaso levantado mientras saluda sale translúcido y una mezcla al 50% de corazones y gafas produce una doble exposición.
- El ajuste fino mejora el estilo de las "buenas" pero empeora un 15% en el resto de prompts respecto al preentrenado.
- Solo soporta inglés en las etiquetas y un vocabulario cerrado de 132 piezas; no admite rasgos nuevos sin reentrenar.
- Riesgo de alucinación limitado al dominio: puede producir combinaciones visualmente incoherentes cuando la etiqueta viola una regla aprendida.
- Licencia Apache 2.0, que permite uso comercial, pero el modelo es educativo y de investigación; no está pensado para producción de imágenes de alta calidad.
- No se han documentado sesgos demográficos, pero el vocabulario de rasgos es estilizado y limitado (6 tonos de piel no realistas, estereotipos de personaje cartoon).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/StarpowerTechnology/WVY-Cartoon-14m
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/StarpowerTechnology/WVY-Cartoon-14m
- Vídeo "how it works": https://huggingface.co/StarpowerTechnology/WVY-Cartoon-14m/resolve/main/media/how_it_works.mp4
- Imagen de personajes nunca vistos: https://huggingface.co/StarpowerTechnology/WVY-Cartoon-14m/resolve/main/media/best_never_seen.png
- Gráfico de benchmark: https://huggingface.co/StarpowerTechnology/WVY-Cartoon-14m/resolve/main/media/benchmark.png
- Comparativa de ajuste fino: https://huggingface.co/StarpowerTechnology/WVY-Cartoon-14m/resolve/main/media/finetune_compare.png
- Ejemplos de limitaciones: https://huggingface.co/StarpowerTechnology/WVY-Cartoon-14m/resolve/main/media/limits.png
- Pesos fine-tuned: https://huggingface.co/StarpowerTechnology/WVY-Cartoon-14m/resolve/main/wvy_cartoon_14m.npz
- Pesos preentrenados: https://huggingface.co/StarpowerTechnology/WVY-Cartoon-14m/resolve/main/wvy_cartoon_14m_pretrained.npz
