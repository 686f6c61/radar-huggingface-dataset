# udgamlabs/Lekhani

## Resumen

Lekhani es un transliterador de hindi romanizado (hinglish en alfabeto latino) a escritura devanagari, desarrollado por Udgam Labs. Su propuesta de valor es extrema: el modelo completo, junto con una lista de 200.000 palabras frecuentes y el runner de JavaScript, ocupa solo 0,87 MB de descarga, lo que permite ejecutarlo íntegramente en el navegador del usuario, sin servidor y sin enviar datos a ningún sitio. Resuelve el problema clásico de la entrada de texto en devanagari: los usuarios escriben hindi con letras latinas (`kaise ho` → कैसे हो) y necesitan una conversión precisa y con baja latencia.

Es relevante porque, pese a su tamaño mínimo (811.904 parámetros cuantizados a 4 bits), supera en 7 puntos al modelo de IndicXlit de AI4Bharat (que tiene 14 veces más parámetros) en el test de referencia Aksharantar Hindi: 65,9 % frente a 58,9 % de coincidencia exacta top-1. Solo queda por detrás del paquete completo de IndicXlit (68,7 %), que requiere 358 MB de memoria para su lista de 4,2 millones de palabras. La arquitectura es un transformer encoder-decoder compacto, entrenado con datos de AI4Bharat (Aksharantar e IndicCorpV2).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (2 capas encoder + 2 capas decoder, anchura 128) |
| Parametros totales | 811.904 (0,81M) |
| Parametros activos | no disponible (no es MoE; todos los parámetros son activos) |
| Longitud de contexto | no disponible (procesa palabra a palabra, sin contexto de frase) |
| Tipos de cuantizacion | 4 bits (modelo distribuido como `model.q4.gz`) |
| Idiomas soportados | Hindi (hi), entrada en alfabeto latino; inglés en la medida en que aparece en texto hinglish |
| Licencia | Apache 2.0 |
| Formato de pesos | Cuantizado propio a 4 bits comprimido con gzip (`model.q4.gz`, 432.512 bytes); no usa safetensors ni GGUF |

## Arquitectura y entrenamiento

Lekhani es un transformer encoder-decoder deliberadamente pequeño: 2 capas de encoder y 2 de decoder con anchura 128, lo que da 811.904 parámetros. Se entrenó desde pesos aleatorios (la model card se corta antes de detallar el resto del proceso) usando los datasets de AI4Bharat Aksharantar (pares romanización-devanagari) e IndicCorpV2 (corpus hindi). Además del modelo neuronal, el sistema incorpora un componente léxico: una lista de 200.000 palabras comunes de hindi organizadas en 8 bandas de frecuencia (`words.bin.gz`), que se usa para reordenar candidatos y mejorar la precisión top-1 sin necesidad de una lista masiva.

Una innovación destacable es el despliegue: el runner es un archivo JavaScript de 5 KB comprimido (14,6 KB sin comprimir) sin dependencias, que produce exactamente las mismas salidas y los mismos 8 candidatos que la implementación de referencia en Python sobre los 9.991 palabras del test. El modelo expone dos modos: `tr.text(s)` translitera cada secuencia de letras latinas conservando espacios, dígitos, puntuación y devanagari existente, y `tr.word(w)` devuelve la mejor opción y 8 candidatos ordenados con un indicador de si cada uno figura en la lista de palabras.

## Capacidades

- Transliteración de hindi romanizado (alfabeto latino) a devanagari, palabra a palabra, con salida top-1 y 8 candidatos alternativos ordenados por probabilidad.
- Procesamiento de texto mixto: translitera solo las secuencias de letras latinas y preserva intactos espacios, dígitos, puntuación y texto ya en devanagari.
- Indicador `inList` por candidato: informa de si la grafía propuesta está entre las 200.000 palabras de la lista, útil para interfaces de teclado con sugerencias.
- Ejecución 100 % en el navegador (JavaScript sin dependencias) o en Node 18+, sin envío de datos a servidores.
- Rendimiento en navegador: arranque en 0,2 s (tras descargar los ficheros), unos 23 MB de memoria y 18 ms por palabra en Chromium sobre Mac mini.
- No soporta: contexto de frase (translitera palabra por palabra), otros idiomas índicos, dirección devanagari → latino, ni tareas de generación de texto general.

## Casos de uso

- Teclados hindi para web: al devolver 8 candidatos ordenados con el flag `inList`, permite construir un IME en el navegador donde el usuario elige entre sugerencias, con solo 0,87 MB de descarga inicial.
- Formularios y aplicaciones web con entrada en hindi: integración en pocos minutos con un `<input>` y un listener de eventos, sin backend, ideal para sitios con restricciones de ancho de banda o privacidad estricta (nada sale del dispositivo).
- Aplicaciones de mensajería o chat con texto hinglish: rinde especialmente bien en vocabulario cotidiano de chat (41 de 44 aciertos en el conjunto de chat hinglish propio), incluyendo palabras inglesas usadas en hindi, marcas y nombres.
- Procesamiento por lotes en Node.js: normalización de corpus de texto romanizado a devanagari en pipelines ETL ligeros, sin dependencias Python ni GPUs, gracias a la API `tr.text()`.
- Clientes ligeros y dispositivos de bajos recursos: con 23 MB de memoria en uso y 18 ms por palabra, es viable en portátiles modestos; el repositorio pesa 0,0 GB según HuggingFace.
- Herramientas de accesibilidad y educación: aplicaciones de aprendizaje del hindi que necesitan mostrar la grafía devanagari correcta de palabras escritas fonéticamente, con despliegue en cualquier hosting estático.
- Extensión de navegador o webview móvil: la ausencia de servidor y el tamaño mínimo facilitan su empaquetado como extensión offline para transliterar en cualquier campo de texto.

## Benchmarks y rendimiento

Resultados publicados por los autores (Aksharantar Hindi test de AI4Bharat: 9.991 palabras romanizadas, coincidencia exacta top-1; intervalos del 95 % mediante bootstrap de 2.000 remuestreos; medición propia del 28 de octubre de 2026):

| Sistema | Descarga / memoria | Aksharantar Hindi | Hinglish chat (de 122) |
|---|---|---|---|
| **Lekhani** | **0,87 MB** | **65,9 %** (64,9–66,8) | **112** |
| IndicXlit, solo modelo (beam 4) | 11,5M parámetros (46 MB fp32) | 58,9 % | 102 |
| IndicXlit, paquete completo Python | modelo + lista de 4,2M palabras (358 MB en memoria) | 68,7 % | 112 |
| IB-Emper hindi-translit-v3 | 15M parámetros | 48,6 % | no disponible |
| UnimeType Transliteration 4B | 4B parámetros | 24,6 % (v1.0) / 20,0 % (v2.0) | no disponible |
| indic-xlit-270M | 270M parámetros | 21,7 % | no disponible |
| indic-xlit-50M | 50M parámetros | 14,8 % | no disponible |
| romanized-hindi-transliterator-60M | 60M parámetros | 9,1 % | no disponible |
| UnimeType 2.0 0.8B | 0,8B parámetros | 8,0 % | no disponible |
| Esquemas basados en reglas | — | 5–12 % | no disponible |

Datos clave: +7,0 puntos frente al modelo de IndicXlit aislado (intervalo pareado +6,1 a +8,0) y −2,8 puntos frente al paquete completo de IndicXlit (−3,6 a −2,1). Los modelos de UnimeType están diseñados para frases completas, por lo que sus cifras son resultados a nivel de palabra.

## Requisitos de hardware

- No requiere GPU ni aceleración: la inferencia es en CPU, en JavaScript puro sin WebGPU ni WASM mencionados.
- Memoria: unos 23 MB de RAM en uso en navegador (Chromium sobre Mac mini); descarga total de 871.248 bytes (0,87 MB).
- Latencia: arranque en 0,2 s (con ficheros ya descargados) y 18 ms por palabra en Chromium sobre Mac mini. Rendimiento en móviles y portátiles antiguos sin medir según los autores.
- Compatible con cualquier hosting estático para servir los cinco ficheros del repositorio; en servidor, basta Node 18 o superior.
- Despliegue: integración directa vía módulo ES (`translit.js`); no aplica vLLM, llama.cpp, Ollama ni TGI, ya que no es un LLM convencional y no usa formatos GGUF/safetensors.
- Encaja en cualquier GPU de consumo sin problema, pero es innecesario: el modelo está pensado para ejecutarse sin GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Tamaño / memoria | Aksharantar Hindi | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **Lekhani** | 0,81M (4 bits) | 0,87 MB descarga / 23 MB RAM | 65,9 % | Apache 2.0 | HuggingFace + demo en navegador |
| IndicXlit (AI4Bharat), solo modelo | 11,5M | 46 MB fp32 | 58,9 % | no disponible | paquete Python de AI4Bharat |
| IndicXlit (AI4Bharat), paquete completo | 11,5M + lista 4,2M palabras | 358 MB en memoria | 68,7 % | no disponible | paquete Python de AI4Bharat |
| IB-Emper hindi-translit-v3 | 15M | no disponible | 48,6 % | no disponible | no disponible |

Lekhani destaca por una relación precisión-tamaño extrema: es el sistema más preciso por megabyte con diferencia, aunque el paquete completo de IndicXlit sigue siendo ~2,8 puntos más preciso si se dispone de 358 MB de memoria y entorno Python.

## Limitaciones y advertencias

- Aproximadamente una de cada tres palabras del test Aksharantar falla en top-1: el test incluye muchas palabras raras y nombres propios. En vocabulario cotidiano de chat el rendimiento es mucho mayor (41/44), pero también comete errores.
- Errores documentados en palabras comunes: `acha` → अच् (debería ser अच्छा; `accha` sí funciona), `kal` → काल (कल es la segunda opción), `delhi` → देल्ही (debería ser दिल्ली).
- Sin contexto de frase: translitera palabra por palabra, por lo que homógrafos como `main` ("yo") y `mein` ("en") se resuelven igual (ambos → में); `main ghar ja raha hoon` produce में en lugar de मैं.
- Solo hindi, y solo en dirección latino → devanagari; no soporta otros idiomas índicos ni retrotransliteración.
- El paquete completo de IndicXlit es 2,8 puntos más preciso en el test principal.
- Las mediciones de velocidad se hicieron en un único Mac mini; no hay datos para móviles ni portátiles antiguos.
- La licencia Apache 2.0 permite uso comercial sin restricciones relevantes más allá de la atribución.
- Los benchmarks fueron medidos por los propios autores (28 de octubre de 2026), incluido un conjunto de chat hinglish de solo 122 palabras creado por ellos, que es demasiado pequeño para diferencias de pocas palabras; conviene validar en el dominio propio antes de producción.
- El modelo tiene 0 descargas registradas en HuggingFace en el momento de la ficha, por lo que no existe aún una comunidad de usuarios que haya validado estos resultados de forma independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/udgamlabs/Lekhani
- Demo interactiva en el navegador: https://udgamlabs.com/models/lekhani#try
- Página del modelo en Udgam Labs: https://udgamlabs.com/models/lekhani
- Datasets de entrenamiento: https://huggingface.co/datasets/ai4bharat/Aksharantar y https://huggingface.co/datasets/ai4bharat/IndicCorpV2
- Paper referenciado en las etiquetas (arXiv 2205.03018, IndicXlit): https://arxiv.org/abs/2205.03018
