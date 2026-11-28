# sourojitdotcom/AksharaLP-1M-v2

## Resumen

AksharaLP-1M-v2 es un modelo minúsculo de transliteración (no de traducción) que convierte hindi romanizado escrito con teclado latino en texto en escritura devanagari. Lo desarrolla el autor independiente sourojitdotcom y resuelve un problema muy concreto: los usuarios de hindi que escriben en un teclado QWERTY con caracteres latinos («kal meeting hai, kaise ho?») necesitan obtener la forma correcta en devanagari (कल मीटिंग है, कैसे हो?) sin depender de un servidor ni de conexión a internet.

El modelo tiene 990.466 parámetros y forma parte de la familia AksharaLP de modelos de transliteración ultraligeros. Se distribuye en dos niveles: un núcleo de 0,57 MB (transformer de caracteres con reranker y runtime) que funciona por sí solo, y un paquete de diccionario de 7,35 MB (léxico de 3 millones de palabras y modelo de lenguaje de frases) que el runtime descarga en el primer uso y cachea. El paquete completo ocupa menos de 8 MB comprimido (7,92 MB en gzip).

Su relevancia radica en la relación entre tamaño y precisión: según el autor, supera en top-1 al modelo IndicXlit (70,04 % frente a 59,16 % en Aksharantar) siendo 2,8 veces más pequeño que los pesos de este, y ofrece un top-3 superior al paquete completo de IndicXlit. Está pensado para ejecutarse íntegramente en el navegador, en un Web Worker, como motor de entrada offline.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de caracteres con reranker y runtime; paquete de diccionario con léxico de 3M de palabras y modelo de lenguaje de frases |
| Parametros totales | 990.466 (989K) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuye en GGUF y como paquete binario comprimido para navegador) |
| Idiomas soportados | hi (hindi), en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF; paquete de runtime web (núcleo de 0,57 MB y pack de diccionario de 7,35 MB) |

## Arquitectura y entrenamiento

La arquitectura es un transformer de caracteres de 989K parámetros que opera a nivel de palabra y de frase, acompañado de un reranker y un runtime de inferencia. El sistema se completa con un paquete de diccionario separado que contiene un léxico de 3 millones de palabras y un modelo de lenguaje de frases; el runtime descarga este pack en el primer uso y lo cachea, de modo que el núcleo puede empezar a escribir desde los 0,6 MB. La inferencia se ejecuta en un Web Worker dentro de la pestaña del navegador, sin servidor ni GPU.

El entrenamiento se apoya en los conjuntos de datos ai4bharat/Aksharantar (pares de transliteración) y ai4bharat/IndicCorpV2 (corpus de texto indic), según los metadatos de la model card. No se detallan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. La innovación principal es la compresión extrema: el paquete completo es 2,8 veces menor que los pesos de IndicXlit y 24 veces menor que IndicXlit con su diccionario de rescoring, manteniendo o superando la precisión top-1.

## Capacidades

- Transliteración de hindi romanizado a devanagari a nivel de palabra y de frase, con resolución contextual de ambigüedades de escritura.
- Reranking de candidatos mediante el modelo de caracteres y el diccionario de 3M de palabras.
- Ejecución completamente offline en el navegador mediante JavaScript y Web Workers.
- Funciona como motor de entrada (input method) o teclado para escribir hindi desde un teclado latino.
- Soporte de dos niveles de despliegue: núcleo autónomo de 0,57 MB y paquete completo de menos de 8 MB.
- Idiomas de trabajo: hindi e inglés (el inglés aparece como lengua de entrada romanizada y de soporte).
- No realiza traducción: cambia de escritura, no de idioma.

## Casos de uso

- Teclados y métodos de entrada en navegador: el modelo se integra como motor de transliteración en un input method que convierte lo que el usuario teclea en latín a devanagari en tiempo real, con latencia p50 de 206 ms por palabra y sin conexión.
- Formularios y aplicaciones web offline: cualquier aplicación que recoja texto en hindi puede incluir el paquete de menos de 8 MB para permitir la entrada nativa sin depender de servicios externos ni de red.
- Mensajería y chat: la precisión en frases de chat (91,54 % de exactitud por palabra en 480 frases reservadas) lo hace adecuado para normalizar mensajes romanizados tipo «kal meeting hai» a su forma devanagari correcta.
- Procesamiento por lotes de corpus romanizados: permite convertir grandes volúmenes de texto hindi escrito en latín a devanagari antes de indexarlo o analizarlo, con un CER de 4,07 en frases de Dakshina.
- Aplicaciones educativas y de aprendizaje de escritura: sirve para mostrar al estudiante la forma devanagari correcta de una palabra o frase escrita en caracteres latinos, con alternativas top-3 y top-8 cuando la entrada es ambigua.
- Despliegue en dispositivos con recursos limitados: al ocupar menos de 8 MB y ejecutarse en el navegador, encaja en entornos sin GPU, terminales de bajo consumo o aplicaciones móviles basadas en web.
- Preprocesamiento para pipelines de PLN en hindi: normaliza la entrada romanizada antes de pasarla a modelos mayores de traducción, análisis o búsqueda.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados de forma independiente):

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| Transliteración palabra (romanizado → devanagari) | Aksharantar (Hindi, test) | Top-1 accuracy | 70,04 % |
| Transliteración palabra | Aksharantar (Hindi, test) | Top-3 accuracy | 88,31 % |
| Transliteración palabra | Aksharantar (Hindi, test) | Top-8 accuracy | 93,63 % |
| Transliteración frase | Dakshina (frases romanizadas, test) | Word accuracy | 89,02 % |
| Transliteración frase | Dakshina (frases romanizadas, test) | Sentence exact match | 25,70 % |
| Transliteración frase | Dakshina (frases romanizadas, test) | CER | 4,07 |

Comparaciones declaradas por el autor frente a IndicXlit:

| Comparación | AksharaLP-1M-v2 | IndicXlit |
|---|---|---|
| Top-1 en Aksharantar (modelo solo) | 70,04 % | 59,16 % |
| Top-1 en Aksharantar (paquete completo) | 70,04 % | 69,33 % |
| Top-3 en Aksharantar | 88,31 % | 85,4 % (paquete completo) |
| Tamaño de pesos | 2,8× menor que el modelo | 46,0 MB (modelo solo) |

Datos adicionales de la model card: núcleo solo con top-1 del 56,01 %, exactitud por palabra del 91,54 % en 480 frases de chat reservadas y latencia p50 de 206,0 ms por palabra en navegador.

## Requisitos de hardware

- VRAM: no requiere GPU; la inferencia se ejecuta en CPU dentro del navegador.
- GPU recomendadas: no aplica; no necesita aceleración por hardware.
- Cabe en cualquier GPU de consumo e incluso en dispositivos sin GPU dedicada.
- Despliegue: runtime JavaScript en el navegador (Web Worker), con núcleo de 0,57 MB y pack de diccionario de 7,35 MB descargado y cacheado en el primer uso; pesos en formato GGUF para otros entornos.
- Latencia: p50 de 206,0 ms por palabra en navegador según el autor.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Top-1 Aksharantar | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AksharaLP-1M-v2 | 990.466 | no disponible | 70,04 % | Apache-2.0 | Hugging Face, demo en Space |
| IndicXlit (modelo solo) | no disponible (46,0 MB de pesos) | no disponible | 59,16 % | no disponible en la información | open source, ampliamente usado |
| IndicXlit (paquete completo con diccionario) | no disponible | no disponible | 69,33 % | no disponible en la información | open source |
| AksharaLP-1M (v1) | 989K (misma familia) | no disponible | 70,37 % | Apache-2.0 | Hugging Face |

## Limitaciones y advertencias

- No traduce: solo cambia la escritura; una frase romanizada en hindi se convierte a devanagari, pero no se traduce al inglés ni a otro idioma.
- Los resultados de benchmarks son declarados por el autor y no están verificados de forma independiente.
- La exactitud a nivel de frase completa es limitada: el exact match en Dakshina es del 25,70 %, por lo que en frases largas es probable que haya errores parciales.
- El top-1 del 70,04 % implica que cerca de un 30 % de las palabras pueden requerir corrección o selección entre las alternativas top-3 o top-8.
- Ámbito lingüístico restringido a hindi (y entrada romanizada en caracteres latinos); no cubre otras lenguas indic.
- El rendimiento óptimo depende del pack de diccionario de 7,35 MB; el núcleo solo baja al 56,01 % de top-1.
- No se detallan en la información disponible sesgos concretos, riesgos de alucinación específicos ni restricciones adicionales de la licencia Apache-2.0 para uso comercial.
- La latencia reportada (206 ms p50 por palabra) corresponde a un entorno de navegador concreto y puede variar según el dispositivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sourojitdotcom/AksharaLP-1M-v2
- Demo en vivo (Space): https://huggingface.co/spaces/sourojitdotcom/AksharaLP-v2-demo
- Versión v1: https://huggingface.co/sourojitdotcom/AksharaLP-1M
- Demo v1: https://huggingface.co/spaces/sourojitdotcom/AksharaLP-demo
- Dataset Aksharantar: https://huggingface.co/datasets/ai4bharat/Aksharantar
- Dataset IndicCorpV2: https://huggingface.co/datasets/ai4bharat/IndicCorpV2
- Dataset Dakshina: https://huggingface.co/datasets/google/dakshina
- Fuente Ethnologue 200: https://www.ethnologue.com/insights/ethnologue200/
