# sourojitdotcom/AksharaLP-1M-v2

## Resumen

AksharaLP-1M-v2 es un modelo minúsculo de transliteración de hindi romanizado a devanagari (escritura nativa), desarrollado por el usuario independiente sourojitdotcom. No es un modelo de lenguaje generativo: es un transliterador de nivel de carácter y palabra pensado para ejecutarse íntegramente en el navegador, sin servidor ni GPU. Su función es convertir entradas como "kal meeting hai, kaise ho?" en "कल मीटिंग है, कैसे हो?", es decir, cambiar de script preservando el contenido lingüístico, no traducir.

El modelo pertenece a la familia AksharaLP y se distribuye en dos capas: un núcleo de 0,57 MB (transformer de caracteres de 989K parámetros con reranker y runtime) y un paquete de diccionario de 7,35 MB (léxico de 3M palabras y modelo de lenguaje de frases) que el runtime descarga en el primer uso y cachea. El paquete completo ocupa menos de 8 MB comprimido (7,92 MB gzip), lo que lo hace apto para teclados e input methods offline en dispositivos móviles y navegador.

Su relevancia radica en que compite con IndicXlit, el transliterador índico abierto más extendido, siendo 2,8 veces más pequeño que los pesos del modelo de este y 24 veces más pequeño que el paquete completo con diccionario, mientras supera su precisión top-1 (70,04 % frente a 59,16 % en Aksharantar). Está publicado bajo licencia Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de caracteres con reranker y modelo de lenguaje de frases (núcleo + paquete de diccionario) |
| Parámetros totales | 989K (núcleo) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | hi, en |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (runtime JavaScript; núcleo de 0,57 MB y paquete de diccionario de 7,35 MB) |

## Arquitectura y entrenamiento

El núcleo es un transformer de caracteres de 989K parámetros que genera candidatos de transliteración; sobre él opera un reranker apoyado en un léxico de 3M palabras y un modelo de lenguaje de frases que puntúa y selecciona la salida más plausible en contexto. El runtime está implementado en JavaScript y ejecuta la inferencia en un Web Worker dentro de la pestaña del navegador, de forma totalmente offline una vez cacheado el paquete de diccionario.

El entrenamiento se apoya en los conjuntos ai4bharat/Aksharantar (pares romanizado-devanagari a nivel de palabra) y ai4bharat/IndicCorpV2 (corpus para el modelo de lenguaje de frases). No se detallan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. La innovación principal es la compresión extrema: un sistema de transliteración con diccionario y reranker que cabe en menos de 8 MB y funciona en el cliente.

## Capacidades

- Transliteración de hindi romanizado a devanagari a nivel de palabra y de frase, preservando el contenido (no traduce).
- Resolución contextual de ambigüedades de romanización (por ejemplo, "kal meeting hai, kaise ho?" → "कल मीटिंग है, कैसे हो?").
- Ejecución 100 % on-device y offline en navegador mediante JavaScript y Web Worker.
- Descarga progresiva: arranca con el núcleo de 0,57 MB y carga el paquete de diccionario en segundo plano.
- Soporte para input methods y teclados en QWERTY latino.
- Idiomas de trabajo: hindi (hi) e inglés (en) como origen de la romanización.
- No dispone de tool calling, function calling, razonamiento multi-paso, visión, audio ni modo thinking; es un modelo especializado de transliteración.

## Casos de uso

- Teclados e input methods para hindi en móvil y escritorio: el modelo permite escribir en QWERTY latino y obtener devanagari al instante, sin conexión, gracias a su tamaño inferior a 8 MB y su ejecución en Web Worker.
- Formularios y aplicaciones web offline: integración en páginas que deben funcionar sin red (kioscos, entornos rurales, PWAs) para que el usuario introduzca texto hindi en su script nativo.
- Normalización de datos de usuario: conversión de nombres y direcciones escritos en romanizado a devanagari en pipelines de limpieza de datos, con una precisión top-1 del 70,04 % y top-3 del 88,31 % a nivel de palabra.
- Procesamiento de mensajes de chat y redes sociales: el modelo mejora especialmente en ortografía informal de chat (91,54 % de precisión por palabra en 480 frases reservadas), lo que lo hace adecuado para normalizar conversaciones antes de analizarlas.
- Accesibilidad y localización: permitir a hablantes de hindi sin teclado devanagari producir texto nativo en entornos web, con latencia p50 de 206,0 ms por palabra en navegador.
- Preprocesado para NLP en hindi: transliterar corpus romanizados antes de pasarlos a modelos de lenguaje o traductores que esperan devanagari, reduciendo la necesidad de infraestructura GPU.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente):

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| Transliteración palabra (romanizado → devanagari) | Aksharantar (Hindi, test) | Top-1 accuracy | 70,04 |
| Transliteración palabra | Aksharantar (Hindi, test) | Top-3 accuracy | 88,31 |
| Transliteración palabra | Aksharantar (Hindi, test) | Top-8 accuracy | 93,63 |
| Transliteración frase | Dakshina (Hindi, test) | Word accuracy | 89,02 |
| Transliteración frase | Dakshina (Hindi, test) | Sentence exact match | 25,70 |
| Transliteración frase | Dakshina (Hindi, test) | CER | 4,07 |

Comparaciones declaradas por el autor: top-1 de 70,04 % frente a 59,16 % de IndicXlit (solo modelo) y 69,33 % de IndicXlit con paquete completo; top-3 de 88,31 % frente a 85,4 % de IndicXlit completo. Latencia en navegador p50 de 206,0 ms por palabra.

## Requisitos de hardware

- VRAM: no requiere GPU; la inferencia se ejecuta en CPU dentro del navegador.
- GPU recomendadas: ninguna; el modelo está diseñado para ejecución on-device.
- Cabe en cualquier dispositivo con un navegador moderno: móviles, portátiles y equipos de gama baja.
- Despliegue: runtime JavaScript propio en Web Worker; no se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este formato).
- Almacenamiento: 0,57 MB para el núcleo y 7,35 MB para el paquete de diccionario (7,92 MB gzip en total).
- Latencia: p50 de 206,0 ms por palabra en navegador, según el autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Tamaño | Top-1 Aksharantar | Top-3 Aksharantar | Licencia |
|---|---|---|---|---|---|
| AksharaLP-1M-v2 | 989K (núcleo) | < 8 MB completo | 70,04 % | 88,31 % | Apache 2.0 |
| AksharaLP-1M (v1) | 989K (núcleo) | 4,53 MB completo | 70,37 % | 87,66 % | Apache 2.0 |
| IndicXlit (solo modelo) | no disponible | 46,0 MB | 59,16 % | no disponible | no disponible en la información |
| IndicXlit (paquete completo) | no disponible | ~24× mayor | 69,33 % | 85,4 % | no disponible en la información |

## Limitaciones y advertencias

- Es un transliterador, no un traductor: no convierte significado entre idiomas, solo cambia de script.
- El exact match a nivel de frase es bajo (25,70 % en Dakshina), por lo que frases largas pueden contener errores aunque la precisión por palabra sea alta (89,02 %).
- La precisión top-1 a nivel de palabra es del 70,04 %, insuficiente para aplicaciones que exijan exactitud total sin revisión humana.
- Los benchmarks están declarados por el autor y marcados como no verificados; no hay evaluación independiente.
- Solo cubre hindi (hi) e inglés (en); no se ha validado para otras lenguas índicas.
- No se detallan sesgos, composición exacta del dataset ni comportamiento fuera del dominio de chat y vocabulario común.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en producción.
- El paquete de diccionario requiere una primera descarga de red; el modo totalmente offline solo aplica tras el cacheo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sourojitdotcom/AksharaLP-1M-v2
- Demo en vivo: https://huggingface.co/spaces/sourojitdotcom/AksharaLP-v2-demo
- Versión anterior (v1): https://huggingface.co/sourojitdotcom/AksharaLP-1M
- Demo v1: https://huggingface.co/spaces/sourojitdotcom/AksharaLP-demo
- Dataset Aksharantar: https://huggingface.co/datasets/ai4bharat/Aksharantar
- Dataset IndicCorpV2: https://huggingface.co/datasets/ai4bharat/IndicCorpV2
- Dataset Dakshina (referenciado en benchmarks): https://huggingface.co/datasets/google/dakshina
- Fuente Ethnologue 200: https://www.ethnologue.com/insights/ethnologue200/
