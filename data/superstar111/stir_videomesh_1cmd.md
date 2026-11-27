# Superstar111/stir_videomesh_1cmd

## Resumen

`Superstar111/stir_videomesh_1cmd` es una política de visión-lenguaje-acción (VLA) construida sobre π0.5 y entrenada con el framework openpi de Physical Intelligence. El modelo ejecuta una cadena de manipulación completa (coger la cuchara, recoger garbanzos, verterlos en una olla y remover) sobre un brazo YAM Ultra 2 con mano Sharpa Wave de 28 articulaciones. Toda la tarea se condiciona con un único comando en lenguaje natural, sin descomposición explícita en subtareas.

El interés del modelo es metodológico más que de rendimiento: documenta de forma inusualmente detallada qué aprende una política a partir de trayectorias generadas por un agente de código en un simulador, con 300 episodios y 149.856 fotogramas. El autor lo presenta explícitamente como una línea base ("baseline") y no como un modelo listo para producción.

Es relevante ahora porque expone con datos concretos los límites de este tipo de destilación: la política no ha sido evaluada ni en simulación ni en robot real, el agarre aprendido no cumple la regla de power grasp del laboratorio y el controlador original dependía de estado privilegiado del simulador (poses de objetos y fuerzas de contacto) que una política basada en cámara no puede leer.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | π0.5 (vision-language-action, fine-tuned con openpi); detalles internos no disponibles |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (el dataset usa un único comando en inglés) |
| Licencia | no disponible |
| Formato de pesos | no disponible (repositorio de 12,4 GB) |

## Arquitectura y entrenamiento

El modelo parte de π0.5, la política VLA de Physical Intelligence, y se afina con openpi para un robot concreto: brazo YAM Ultra 2 y mano Sharpa Wave de 28 articulaciones. La entrada son imágenes de tres cámaras (cabeza, muñeca y cam1) a resolución 284 x 160 y 10 Hz, y la salida son consignas articulares. El condicionamiento lingüístico es una única frase fija para todos los episodios: "pick up the spoon, scoop the beans, pour them into the pot and stir".

El dataset de entrenamiento consta de 300 trayectorias (149.856 fotogramas, episodios de 475 a 633 pasos, mediana 488; 133.842 filas de entrenamiento) generadas por un agente de código en el simulador a partir de 20 vídeos humanos de demostración. El agente construyó mallas de interacción mano-herramienta a partir de fotogramas de tres de esos vídeos y retargeteó un agarre; 126 de las 130 trayectorias auditadas usan exactamente ese agarre más una preload fija. Las imágenes se renderizaron a partir de los estados registrados originales, sin replay físico. Las acciones son las consignas articulares que el agente envió al simulador. No hay información sobre RLHF, DPO ni composición adicional del corpus.

## Capacidades

- Generación de secuencias de acción motora de extremo a extremo para una cadena de cuatro subtareas bajo un solo comando en lenguaje natural.
- Control de una mano antropomórfica de 28 articulaciones junto con un brazo de 6-7 grados de libertad (YAM Ultra 2).
- Política condicionada por visión: consume tres flujos de cámara (cabeza, muñeca, cam1) a 284 x 160 y 10 Hz.
- Ejecución de horizontes largos: episodios de hasta 633 pasos (unos 63 segundos a 10 Hz).
- No se documenta soporte de tool calling, function calling, agentes multi-paso, capacidades multilingües, thinking mode, visión general, audio ni otras modalidades fuera del bucle percepción-acción robótico.

## Casos de uso

- Investigación en destilación de trayectorias sintéticas: sirve como referencia reproducible para estudiar qué se transfiere desde un agente de código que opera en simulador a una política neuronal con entrada visual, gracias a la auditoría detallada de los 300 episodios.
- Estudio de agarres retargeteados: el modelo y su documentación permiten analizar por qué un agarre construido desde mallas de interacción con escala incierta (~25 %) no cumple una regla de power grasp, un caso útil para quienes trabajan en retargeting mano-objeto.
- Análisis de sesgo de selección en datasets: el autor documenta que solo se admitieron episodios donde un garbanzo se movió 2 mm o más durante el removido, lo que convierte al modelo en un ejemplo práctico de cómo el filtrado de éxito condiciona lo aprendido.
- Línea base para comparar políticas VLA en manipulación de utensilios: útil como punto de partida antes de entrenar con datos reales o con controladores que no dependan de estado privilegiado.
- Docencia y divulgación sobre VLA: el repositorio ofrece un caso completo de pipeline openpi (datos, render, acciones, comando único) para explicar el ciclo completo de entrenamiento de una política robótica.
- Auditoría de datasets robóticos: las tablas de propiedades conocidas (removido, hold final, estado privilegiado) sirven como plantilla para revisar otros conjuntos de datos antes de publicarlos o reutilizarlos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que la política no ha sido evaluada, ni en simulación ni en robot real.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 12,4 GB, lo que da una cota inferior del almacenamiento necesario, pero no se especifica el tamaño de los pesos ni la precisión.
- GPU recomendadas: no disponible.
- ¿Cabe en GPU de consumo? no disponible.
- Opciones de despliegue: el modelo se enmarca en openpi (https://github.com/Physical-Intelligence/openpi); no se documentan otros servidores de inferencia (vLLM, llama.cpp, Ollama, TGI) para esta política.
- Latencia y throughput: no disponibles. El dataset se registra a 10 Hz, pero no se publica la latencia de inferencia de la política.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Evaluación publicada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Superstar111/stir_videomesh_1cmd | no disponible | no disponible | ninguna (no evaluado) | no disponible | Hugging Face, 0 descargas |
| π0.5 base (Physical Intelligence) | no disponible en esta ficha | no disponible | no disponible en esta ficha | no disponible en esta ficha | no disponible en esta ficha |
| Otras políticas openpi afinadas | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- No evaluado: el autor declara que la política no se ha probado ni en simulación ni en robot real; no hay evidencia de que la cadena completa funcione.
- Entrenado solo en simulación: no se ha ejecutado en el robot físico.
- Agarre no válido para la regla del laboratorio: en ninguna observación con agarre dos o más dedos tocan el mango con sus falanges proximales o medias, por lo que el power grasp no puede sostenerse (cota superior de contacto 0). Pulgar e índice quedan a unos 66 grados alrededor del mango y la fuerza de agarre es de unos 9 N.
- Estado privilegiado en el origen de los datos: el controlador del agente usaba poses de objetos y garbanzos y fuerzas de contacto del simulador; una política basada en cámara no puede acceder a esa información, lo que crea una brecha entre datos y despliegue.
- Sesgo de selección: solo se admitieron episodios en los que un garbanzo se movió 2 mm o más durante el removido, lo que sobrerepresenta episodios con removido eficaz.
- Removido limitado: los garbanzos se desplazan una mediana de 10,70 mm por episodio (máximo 35,1 mm) mientras el borde del bol de la cuchara recorre 12,0 cm de mediana en la olla.
- Hold final estático: el 3,8 % de los fotogramas (5.692 de 149.856) corresponden a la secuencia final quieta, con mediana de 9,0 fotogramas y hasta 150.
- Escala incierta en el retargeting: el propio agente estima un error de escala de aproximadamente el 25 % en las mallas de interacción.
- Idioma: condicionamiento en inglés con una única frase; no hay evidencia de generalización a otros comandos ni a otros idiomas.
- Licencia no disponible: no se puede confirmar el uso comercial ni la redistribución.
- Sin señales de la comunidad: 0 descargas y 0 likes en el momento de la consulta, sin validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Superstar111/stir_videomesh_1cmd
- Repositorio openpi: https://github.com/Physical-Intelligence/openpi
