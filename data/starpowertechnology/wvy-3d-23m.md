# StarpowerTechnology/WVY-3D-23m

## Resumen

WVY-3D-23m es un modelo de lenguaje de 23,1 millones de parámetros desarrollado por Starpower Technology, entrenado desde cero y especializado en la generación de código para arte 3D procedural. A partir de un prompt breve en inglés que combina un objeto y un estilo (por ejemplo, "a pixel car"), el modelo escribe el código que dibuja ese objeto: JavaScript con three.js que construye y devuelve un `THREE.Group`, un SVG vectorial completo o un fragment shader GLSL ES 3.0 que hace raymarching de campos de distancia firmados (SDF). Es el sucesor de WVY-Blender-5m, que seleccionaba tokens de un lenguaje de escena fijo; WVY-3D genera la geometría directamente como código.

El modelo destaca por su tamaño reducido (92 MB en safetensors) y su capacidad de inferencia local: ronda los 275 tokens/s en CPU Apple M4 con batch 1 y un pico de memoria de unos 535 MB, lo que lo hace viable en portátiles y entornos sin GPU. Su vocabulario, sin embargo, es deliberadamente cerrado: 25 objetos y 6 estilos, y fuera de ese conjunto no se comporta de forma fiable.

La relevancia actual reside en su enfoque de generalización composicional: el autor retuvo cinco pares objeto+estilo (pixel car, wireframe frog, neon house, clay rocket, low-poly bus) que no aparecen en entrenamiento en ningún formato, y el modelo logra combinarlos aplicando una transformación de estilo aprendida en otros objetos a las partes de un objeto aprendido en otros estilos. Es un caso de estudio útil sobre modelos pequeños entrenados desde cero para tareas creativas acotadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (decoder-only, text-generation) entrenado desde cero |
| Parametros totales | 23.120.640 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32/fp16 según repo; no se documentan GGUF ni cuantizaciones alternativas) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (92 MB), librería pytorch |

## Arquitectura y entrenamiento

WVY-3D-23m es un transformer decoder-only de 23,1 millones de parámetros entrenado desde cero, sin fine-tuning sobre un modelo base. El objetivo de entrenamiento es generación de texto condicionada por prompt, pero el dominio de salida está restringido a tres lenguajes de código gráfico: three.js, SVG y shaders SDF en GLSL ES 3.0. El conjunto de entrenamiento cubre 25 objetos × 6 estilos × 3 formatos, y el autor retuvo completamente cinco pares objeto+estilo para evaluar generalización composicional.

No se documentan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. La innovación técnica destacable no está en la arquitectura sino en la formulación de la tarea y en la evaluación: el modelo aprende a componer una transformación de estilo con un objeto nunca visto en ese estilo, y el benchmark verifica que el código generado ejecuta, usa el idioma característico del estilo, dibuja las partes del objeto (Jaccard ≥ 0,6 sobre la lista de partes de referencia), respeta la paleta y declara objeto y estilo en la primera línea de comentario. La pérdida teacher-forced sobre código de referencia es de 0,055 nats/token en pares entrenados y 0,141 en pares retenidos (perplejidad 1,06 frente a 1,15).

## Capacidades

- Generación de código three.js: produce JavaScript que construye y devuelve un `THREE.Group` a partir de un prompt de objeto y estilo.
- Generación de SVG: emite imágenes vectoriales completas y autónomas.
- Generación de shaders SDF: escribe fragment shaders GLSL ES 3.0 que hacen raymarching de campos de distancia firmados.
- Generalización composicional: combina estilos aprendidos en unos objetos con objetos aprendidos en otros estilos, incluyendo pares retenidos del entrenamiento.
- Vocabulario cerrado de 25 objetos: car, truck, bus, boat, plane, rocket, frog, cat, duck, pig, fish, robot, snowman, mushroom, tree, pine, cactus, flower, house, bench, chair, table, lamp, fountain y castle.
- Vocabulario cerrado de 6 estilos: smooth, pixel, low poly, clay, neon y wireframe.
- Interpretación de modificadores de color y tamaño en el prompt: aplica el color correctamente en 70 de 90 casos y el tamaño en 45 de 45, aunque estas palabras pueden filtrarse en la línea de plan.
- Inferencia local en CPU: unos 275 tokens/s y 6 ms hasta el primer token en Apple M4 (4 hilos, batch 1), con pico de memoria de aproximadamente 535 MB.
- No se documentan tool calling, function calling, capacidades de agente, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Generación de arte 3D en el navegador: el modelo escribe el código three.js que construye el objeto, de modo que una aplicación web puede ejecutarlo directamente y mostrar el resultado sin pipeline de assets. Su velocidad en CPU (menos de un segundo para un objeto de ~200 tokens) permite generación interactiva.
- Creación de iconos y gráficos vectoriales: para prompts de objeto y estilo, emite un SVG autónomo que se puede incrustar en interfaces, documentación o material de marketing sin dependencias externas.
- Shaders procedurales para demos y visualizaciones: genera fragment shaders SDF GLSL ES 3.0 que compilan y enlazan en WebGL2 (326 de 327 en todas las suites), útiles para escenas de raymarching ligeras.
- Prototipado rápido de assets para juegos y experiencias web: con 25 objetos y 6 estilos cubre un catálogo acotado de props (coche, casa, árbol, silla, fuente, castillo) que se pueden generar en tres formatos según el motor o el pipeline de destino.
- Herramienta educativa sobre generalización composicional: al estar entrenado desde cero y con pares retenidos documentados, sirve para estudiar cómo un modelo pequeño compone transformaciones de estilo y objetos, con manifiestos de prompts, semillas y código en el repositorio.
- Inferencia en entornos sin GPU: con 92 MB de pesos y ~535 MB de pico de memoria, se puede desplegar en portátiles, contenedores pequeños o dispositivos de borde para generar arte procedural bajo demanda.
- Generación de variaciones controladas por temperatura: con temperatura 0,45 el modelo produce un 99% de salidas distintas manteniendo una tasa de éxito del 91% en pares retenidos, lo que permite ofrecer varias alternativas por prompt en una interfaz creativa.

## Benchmarks y rendimiento

Los datos provienen del benchmark del autor sobre el mismo checkpoint. Un ejemplo se considera válido solo si ejecuta, usa el idioma del estilo, dibuja las partes del objeto (Jaccard ≥ 0,6), respeta la paleta y tiene la línea de plan correcta.

| Suite | Resultado |
|---|---|
| Pares retenidos, todos los formatos (temp 0,45; 16 muestras por par y formato) | 218 / 240 (91%) |
| · three.js | 74 / 80 |
| · SVG | 64 / 80 |
| · SDF shader | 80 / 80 |
| Pares hermanos entrenados (comparten objeto o estilo con un par retenido) | 216 / 216 (100%) |
| Pares retenidos con formulaciones nunca vistas en entrenamiento | 54 / 75 |
| Shaders SDF que compilan y enlazan en todas las suites | 326 / 327 |

| Temperatura | Tasa de éxito (pares retenidos) | Salidas distintas |
|---|---|---|
| 0 (greedy) | 85 / 90 | 38% |
| 0,3 | 81 / 90 | 96% |
| 0,45 (por defecto) | 218 / 240 | 99% |
| 0,7 | 82 / 90 | 100% |
| 1,0 | 71 / 90 | 100% |

Pérdida teacher-forced sobre código de referencia: 0,055 nats/token en pares entrenados y 0,141 en pares retenidos (perplejidad 1,06 frente a 1,15); la brecha es mayor en SVG y menor en SDF. El model-index del repositorio no declara resultados adicionales.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el autor reporta un pico de memoria de unos 535 MB en CPU, por lo que en GPU la huella es del orden de 1 GB o menos con los pesos en safetensors.
- GPU recomendadas: no se documentan; el modelo está pensado para inferencia local y el benchmark oficial se ejecutó en CPU Apple M4. Cualquier GPU consumer reciente (RTX 3060 o superior) es sobradamente suficiente por tamaño.
- Cabe en GPU consumer: sí, con amplio margen, dado el tamaño de 23,1 M de parámetros y 92 MB de pesos.
- Opciones de despliegue: el repositorio usa PyTorch y safetensors; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI. Existe una demo en Hugging Face Spaces.
- Latencia y throughput: en Apple M4 (4 hilos, batch 1) unos 275 tokens/s y 6 ms hasta el primer token; un objeto three.js de ~200 tokens tarda menos de un segundo y un shader SDF de ~540 tokens unos 2 segundos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WVY-3D-23m | 23,1 M | no disponible | Texto a código 3D (three.js, SVG, SDF) | Apache 2.0 | Hugging Face, demo en Spaces |
| WVY-Blender-5m (predecesor) | 5 M (según nombre) | no disponible | Selección de tokens de un lenguaje de escena fijo | no disponible en la información | Hugging Face |
| Modelos de texto a 3D de propósito general | no disponible | no disponible | Mallas o escenas 3D | no disponible | no disponible |

No se dispone de datos de benchmarks de modelos comparables en la información proporcionada, por lo que no se puede establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Vocabulario fijo: solo entiende 25 objetos y 6 estilos; otras palabras no se interpretan de forma fiable.
- Las palabras de color y tamaño pueden filtrarse en la línea de plan; el color se aplica correctamente en 70 de 90 casos y el tamaño en 45 de 45.
- Dos de los 15 pares retenidos (cinco pares × tres formatos) fallan la comprobación automática, y el SVG de pixel car pasa las comprobaciones pero solo dibuja las ruedas, una franja y un piloto trasero, lo que muestra que las comprobaciones no detectan todos los errores.
- La tasa de éxito cae con formulaciones nunca vistas en entrenamiento (54 de 75) y con temperaturas altas (71 de 90 a temperatura 1,0).
- Riesgo de alucinación limitado al dominio: el modelo puede generar código que no ejecuta o que no representa el objeto solicitado, aunque el benchmark mide esta tasa.
- Idioma: solo inglés; no se documenta soporte multilingüe.
- Licencia Apache 2.0: permite uso comercial, pero no se documentan garantías ni soporte del autor.
- No se documentan sesgos sociales ni de otro tipo; el dominio acotado reduce la exposición, pero no hay evaluación al respecto.
- No se documenta longitud de contexto ni comportamiento en conversaciones multi-turno; el uso previsto es prompt único a código.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/StarpowerTechnology/WVY-3D-23m
- Demo en el navegador (Hugging Face Spaces): https://huggingface.co/spaces/StarpowerTechnology/WVY-3D-23m
- Predecesor WVY-Blender-5m: https://huggingface.co/StarpowerTechnology/WVY-Blender-5m
- Manifiesto de la demo: https://huggingface.co/StarpowerTechnology/WVY-3D-23m/blob/main/demo_manifest.json
- Manifiesto de la galería: https://huggingface.co/StarpowerTechnology/WVY-3D-23m/blob/main/gallery_manifest.json
- Resultados completos del benchmark: https://huggingface.co/StarpowerTechnology/WVY-3D-23m/blob/main/benchmark.json
