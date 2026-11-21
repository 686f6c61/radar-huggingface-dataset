# SupersonicLabs/Julia-2-Nano

## Resumen

Julia 2 Nano es la versión para microcontroladores de Julia 2, un modelo de decisión desarrollado por Supersonic Labs. No es un modelo generativo de lenguaje: es un clasificador que responde preguntas de opción múltiple (`choice`, `noul`, `score`), etiqueta imágenes y reconoce intenciones de voz. Su interés principal es que comprime el comportamiento de un modelo de 2,14 GB en 15,0 MB de pesos, lo que permite ejecutarlo en un ESP32-S3 con 16 MB de flash y 8 MB de PSRAM, o en cualquier CPU con un compilador de C.

La implementación es C puro, dependiente solo de libc y libm, sin PyTorch ni Python en tiempo de inferencia. Se distribuye en tres artefactos independientes: decisiones de texto (8,2 MB), etiquetas de imagen (1,7 MB) y reconocimiento de intenciones de voz (5,1 MB). El modelo base es SupersonicLabs/Julia-2 y la licencia es Apache-2.0.

Es relevante ahora por su posicionamiento en el nicho TinyML de decisión: frente a los LLM en el borde, propone un modelo cerrado y determinista, con memoria de trabajo por debajo de 300 KB para texto y 224 KB para imágenes de 128×128. El coste es claro: no hay texto libre, ni contexto largo, ni llamadas en vivo, y la fidelidad respecto a Julia 2 en texto es del 58 % en el conjunto de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de decisión (no transformer generativo): tablas de tokens int4/int2 con cabeza de decisión int8 para texto; red convolucional pequeña int8 para imagen; encoder de voz int8/int4 con cabeza de intención int8 |
| Parametros totales | no disponible (pesos totales: 15,0 MB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible; sin contexto largo ni texto libre |
| Tipos de cuantizacion | int4, int2 e int8 (pesos ya cuantizados en el artefacto distribuido) |
| Idiomas soportados | inglés y portugués |
| Licencia | Apache-2.0 |
| Formato de pesos | binarios propietarios (`.bin`) por tarea: `text/nano_text.bin`, `image/nano_image.bin`, `speech/nano_speech.bin`; no safetensors ni GGUF |

## Arquitectura y entrenamiento

Julia 2 Nano no es un transformer. Para texto emplea tablas de tokens cuantizadas en int4 e int2 junto con una pequeña cabeza de decisión en int8; para imagen, una red convolucional pequeña en int8; para voz, un encoder pequeño en int8 e int4 con cabeza de intención en int8. El modelo se deriva de Julia 2 mediante un proceso de compresión que reduce los pesos un 99,3 % (de 2,14 GB a 15,0 MB), aunque la model card no detalla la metodología exacta de destilación ni el volumen de datos de entrenamiento.

Los datos de entrenamiento no están documentados en la información disponible. La evaluación se realizó sobre conjuntos públicos: Imagenette (10 clases, 3.925 fotos), Oxford Flowers (12 opciones, 1.020 fotos), MInDS-14 (14 intenciones bancarias, 2.413 clips en inglés y portugués) y un split retenido de SLCMB para decisiones de texto (231 casos). El test de texto se puntuó una sola vez sobre casos no usados para construir el modelo.

## Capacidades

- Decisiones de texto de opción múltiple: preguntas de tipo `choice`, `noul` y `score`, con salida de una línea `CHOICE` por ítem.
- Etiquetado de imágenes de 128×128 con conjuntos cerrados de etiquetas (clases de Imagenette y Oxford Flowers).
- Reconocimiento de intenciones de voz sobre las 14 intenciones bancarias de MInDS-14, con clips de hasta 12 s (hasta 1,8 MB de memoria de trabajo).
- Idiomas: inglés y portugués.
- Ejecución en microcontrolador: proyecto ESP-IDF para la parte de texto en ESP32-S3, con lectura del modelo en su sitio desde una partición de flash.
- Ejecución en CPU genérica con un compilador de C (`cc -O2 ... -lm`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, texto libre, visión abierta ni audio en streaming.

## Casos de uso

- Clasificación de intenciones en dispositivos de borde: el artefacto de voz reconoce las 14 intenciones bancarias de MInDS-14 en inglés y portugués con 60,3 % de precisión, ejecutándose con hasta 1,8 MB de memoria para un clip de 12 s; adecuado para mandos por voz sin conectividad.
- Etiquetado de imágenes en sensores: la red convolucional int8 clasifica fotos de 128×128 con 95,5 % en Imagenette y 98,7 % en Oxford Flowers usando 224 KB de memoria de trabajo, lo que permite integrarla en cámaras de bajo consumo con un ESP32-S3.
- Enrutado de decisiones en firmware: el artefacto de texto responde preguntas de opción múltiple con menos de 300 KB de memoria, útil para seleccionar rutas de comportamiento en un dispositivo empotrado sin depender de un servidor.
- Sustitución de reglas heurísticas en producto: para categorización de entradas con conjuntos cerrados de etiquetas, el modelo ofrece una alternativa aprendida a los árboles de decisión manuales, con la ventaja de ejecutarse en C sin dependencias.
- Prototipado TinyML en investigación: sirve como referencia reproducible de compresión extrema (de 2,14 GB a 15 MB) para estudiar la pérdida de fidelidad frente al modelo original en tareas de clasificación.
- Despliegue en ESP32-S3 con ESP-IDF: el proyecto `firmware/` permite leer el modelo desde una partición de flash y ejecutar la parte de texto en placa, sin Python ni PyTorch en el dispositivo.
- Evaluación comparativa de compresión: útil para medir cuánto comportamiento de un modelo grande se conserva al cuantizar a int2/int4 en tareas de decisión cerradas.

## Benchmarks y rendimiento

| Test | Tamaño | Julia 2 | Julia 2 Nano |
|---|---|---|---|
| Decisiones de texto: misma respuesta que Julia 2 (split retenido SLCMB) | 231 casos | — | 58 % |
| Decisiones de texto donde Julia 2 es seguro: misma respuesta | 166 casos | — | 71 % |
| Imágenes, Imagenette (10 clases): precisión | 3.925 fotos | 92,8 % | 95,5 % |
| Imágenes, Oxford Flowers (12 opciones): precisión | 1.020 fotos | 50,5 % | 98,7 % |
| Intenciones de voz (MInDS-14, en y pt): precisión | 2.413 clips | 59,4 % | 60,3 % |

No se han publicado datos de latencia ni throughput en placa real; la model card indica explícitamente que la velocidad en una board física no se ha medido todavía.

## Requisitos de hardware

- Flash: 16 MB en ESP32-S3 (el artefacto de texto ocupa 8,2 MB; imagen 1,7 MB; voz 5,1 MB).
- RAM/PSRAM: 8 MB de PSRAM en ESP32-S3; memoria de trabajo de menos de 300 KB para texto, 224 KB para imagen de 128×128 y hasta 1,8 MB para un clip de voz de 12 s.
- CPU genérica: cualquier procesador con compilador de C y libm; no requiere GPU.
- GPU: no aplica; el modelo no está pensado para aceleración GPU ni usa PyTorch.
- Opciones de despliegue: binarios C (`nano_text`, `nano_image`, `nano_speech`) compilados con `cc -O2`; proyecto ESP-IDF en `firmware/` para ESP32-S3.
- vLLM, llama.cpp, Ollama y TGI no son aplicables: el formato de pesos es binario propietario y la inferencia es C nativo.
- Latencia y throughput: no disponibles; no medidas en placa según el autor.

## Comparativa con modelos similares

| Modelo | Tipo | Tamaño | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Julia 2 Nano | Decisión en MCU (texto/imagen/voz) | 15,0 MB | sin contexto largo | en, pt | Apache-2.0 | Hugging Face |
| Julia 2 | Modelo de decisión completo | 2,14 GB | no disponible | varios | Apache-2.0 | Hugging Face |
| LLM en el borde (p. ej. familias de <1B en GGUF) | Generativo | cientos de MB a varios GB | miles de tokens | varios | variable | Hugging Face / llama.cpp |
| Clasificadores TinyML (p. ej. MobileNet int8) | Visión cerrada | unos pocos MB | no aplica | no aplica | variable | TF Lite / TFLM |

La comparación directa con LLM de borde no es homogénea: Julia 2 Nano no genera texto libre y su tarea es la clasificación cerrada. Frente a Julia 2, la pérdida de fidelidad en texto (58 %) es el principal coste de la compresión; en imagen y voz el modelo Nano iguala o supera al original en los conjuntos evaluados.

## Limitaciones y advertencias

- El texto es la parte más débil: acierta la respuesta de Julia 2 algo más de la mitad de las veces (58 %), y es especialmente flojo en reglas condicionales ("only if", "unless") y en niveles ordenados.
- Conjuntos de etiquetas cerrados para imagen y voz: solo cubre las clases de Imagenette y Oxford Flowers y las 14 intenciones de MInDS-14; no generaliza a etiquetas nuevas.
- Sin llamadas en vivo, sin contexto largo y sin texto libre: no es un LLM y no debe presentarse como tal.
- La velocidad en placa real no se ha medido; el rendimiento en producción es incierto.
- Idiomas limitados a inglés y portugués.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de respuestas incorrectas silenciosas en clasificación cerrada; conviene validar con métricas por clase.
- Licencia Apache-2.0 permite uso comercial, pero debe conservarse `LICENSE` y `NOTICE`.
- El repositorio muestra 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de adopción ni de mantenimiento continuado.
- La model card no documenta el proceso de destilación ni los datos de entrenamiento, lo que dificulta auditar sesgos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SupersonicLabs/Julia-2-Nano
- Modelo base Julia 2: https://huggingface.co/SupersonicLabs/Julia-2
- Formatos de ficheros: `FORMATS.md` dentro del repositorio
- Checksums: `SHA256SUMS` dentro del repositorio
- Proyecto ESP-IDF: carpeta `firmware/` del repositorio
- Programas C: carpeta `c/` del repositorio
- Etiquetas de imagen y voz: carpeta `labels/` del repositorio
