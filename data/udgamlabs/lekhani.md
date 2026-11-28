# udgamlabs/Lekhani

## Resumen

Lekhani es un transliterador ligero desarrollado por Udgam Labs que convierte palabras escritas en alfabeto latino (romanizadas) a la escritura nativa de doce idiomas de la India: hindi, tamil, marathi, bengali, urdu, kannada, telugu, malayalam, gujarati, punjabi, odia y assamese. A diferencia de los sistemas de transliteración convencionales, que dependen de paquetes Python pesados con listas de palabras de millones de entradas en memoria, Lekhani empaqueta cada idioma en un modelo de apenas 0,8M o 1,2M de parámetros cuantizado a 4 bits, junto con una lista de palabras comunes, en menos de 1 MB por idioma (incluido el runner JavaScript).

El modelo resuelve un problema concreto de accesibilidad e integración: permitir la entrada de texto en escrituras índicas desde teclados latinos en entornos web, sin enviar datos a ningún servidor. Toda la inferencia ocurre en el dispositivo del usuario mediante un único runner, `translit.js`, que sirve para los doce idiomas. Es relevante ahora porque demuestra que la transliteración de calidad puede ejecutarse íntegramente en el navegador con un coste de descarga mínimo, algo que los paquetes tradicionales como IndicXlit no ofrecen.

La arquitectura subyacente no se detalla en la información disponible; la model card describe el sistema como un modelo pequeño por idioma con reordenación léxica (reranking) sobre candidatos, pero no especifica si se trata de un transformer, un modelo basado en n-gramas o una arquitectura híbrida. La licencia es Apache 2.0 y los pesos se distribuyen en un formato propietario comprimido (`.q4.gz`, `.json.gz`, `.bin.gz`) consumible por el runner JavaScript.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo pequeño por idioma con reranking léxico) |
| Parametros totales | 0,8M o 1,2M por idioma según la model card (no se especifica qué idiomas usan cada tamaño) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (opera a nivel de palabra, no de secuencia) |
| Tipos de cuantizacion | 4 bits (formato `.q4.gz`) |
| Idiomas soportados | Hindi, tamil, marathi, bengali, urdu, kannada, telugu, malayalam, gujarati, punjabi, odia, assamese (entrada en latín; salida en escritura nativa) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.q4.gz` (modelo cuantizado), `.json.gz` (estructura), `.bin.gz` (lista de palabras), `rerank.json`; runner en JavaScript (`translit.js`) |

## Arquitectura y entrenamiento

La información disponible no especifica la arquitectura interna del modelo más allá de describirlo como un modelo pequeño por idioma (0,8M o 1,2M de parámetros) cuantizado a 4 bits, acompañado de una lista de palabras comunes y un fichero de reordenación (`rerank.json`) que indica al runner qué escritura usa la lista de palabras de ese idioma. El sistema genera hasta 8 candidatos de escritura por palabra de entrada, ordenados por el modelo y reordenados con la lista léxica, y devuelve el mejor como primera opción.

En cuanto a los datos de entrenamiento, la model card cita los conjuntos `ai4bharat/Aksharantar` (corpus de transliteración) e `ai4bharat/IndicCorpV2` (corpus monolingüe índico), pero no detalla el número de tokens, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. Tampoco se documentan innovaciones como decodificación especulativa o atención lineal. La innovación destacable es de ingeniería: un runner único en JavaScript que carga pesos cuantizados comprimidos y ejecuta la inferencia en el navegador o en Node 18+, con verificación de integridad mediante SHA-256 por fichero en `config.json`.

## Capacidades

- Transliteración de palabras latinas a escritura nativa en doce idiomas índicos, con salida en devanagari (hindi, marathi), tamil, bengali (bengali y assamese con letras específicas ৰ y ৱ), urdu (árabe, derecha a izquierda), kannada, telugu, malayalam, gujarati, gurmukhi (punjabi) y odia.
- Procesamiento a nivel de palabra: `tr.text(s)` convierte cada secuencia de letras latinas y preserva espacios, dígitos, puntuación y texto ya escrito en la escritura nativa.
- Generación de candidatos alternativos: `tr.word(w)` devuelve el mejor resultado y hasta 8 variantes ordenadas, cada una con indicador `inList` de pertenencia a la lista de palabras comunes, útil para teclados con sugerencias.
- Ejecución en el navegador sin envío de datos a servidores (privacidad por diseño) y en Node 18 o superior.
- Carga de varios idiomas en una misma página mediante llamadas sucesivas a `Transliterator.load`.
- Soporte de escritura de derecha a izquierda para urdu (requiere `dir="rtl"` en el elemento de salida).
- No se documentan capacidades de generación de texto libre, razonamiento, código, matemáticas, visión, tool calling ni agentes; el modelo está especializado exclusivamente en transliteración.

## Casos de uso

- Teclados web para escrituras índicas: un usuario con teclado latino escribe "vanakkam" y obtiene வணக்கம் en tamil; el modelo es adecuado porque cada idioma pesa menos de 1 MB y la inferencia ocurre en el dispositivo, sin latencia de red ni coste de servidor.
- Formularios y campos de entrada multilingües: integración de `tr.text()` en un `input` con evento `input` permite transliterar en tiempo real mientras el usuario escribe, preservando números y puntuación en campos como direcciones o nombres.
- Aplicaciones de mensajería y redes sociales: conversión de mensajes romanizados a la escritura nativa antes del envío, con sugerencias de los 8 candidatos para que el usuario elija la ortografía correcta.
- Herramientas educativas de aprendizaje de escrituras índicas: mostrar candidatos alternativos y su pertenencia a la lista de palabras comunes ayuda al estudiante a distinguir ortografías válidas de variantes incorrectas.
- Procesamiento de corpus romanizados: uso en Node 18+ para normalizar grandes volúmenes de texto romanizado a escritura nativa en pipelines de preprocesamiento, sin dependencias Python ni GPU.
- Aplicaciones offline o de baja conectividad: al servirse los ficheros desde cualquier host estático, la transliteración funciona sin conexión una vez cargados los recursos, lo que resulta adecuado para entornos rurales o dispositivos de gama baja.
- Privacidad en entradas sensibles: al no enviarse texto a ningún servidor, el modelo encaja en contextos donde la transcripción de nombres o direcciones no debe salir del dispositivo.

## Benchmarks y rendimiento

La model card reporta resultados sobre el test de Aksharantar (AI4Bharat) con coincidencia exacta top-1 contra cualquier ortografía de referencia, con intervalos de confianza del 95% de 2.000 remuestras bootstrap pareadas. Los resultados publicados parcialmente indican una precisión del 50% (odia) al 81% (telugu) en la primera predicción, y una ventaja sobre el modelo de IndicXlit por sí solo de entre 4,2 y 14,8 puntos en los doce idiomas. El paquete completo de IndicXlit (con reordenación sobre listas de millones de palabras) está a la par o por delante en varios idiomas. La tabla completa con los valores por idioma no está disponible en la información proporcionada.

| Sistema | Rango de precisión top-1 (Aksharantar) | Notas |
|---|---|---|
| Lekhani | 50% (odia) – 81% (telugu) | Primera predicción, 12 idiomas |
| IndicXlit (modelo solo) | 4,2 – 14,8 puntos por debajo de Lekhani | En los doce idiomas |
| IndicXlit (paquete completo) | A la par o por delante en varios idiomas | Reordenación con listas de millones de palabras en memoria |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni benchmarks de generación, ya que el modelo no realiza esas tareas.

## Requisitos de hardware

- VRAM: no aplica; el modelo no requiere GPU. Cada idioma ocupa menos de 1 MB en disco (incluido el runner) y se ejecuta en CPU.
- GPU recomendadas: ninguna; la inferencia es puramente CPU, en el navegador o en Node.
- Compatibilidad con GPU de consumo: irrelevante, funciona en cualquier dispositivo con un navegador moderno o Node 18+.
- Despliegue: cualquier host estático para los ficheros (`translit.js`, `config.json`, carpeta del idioma) o carga directa desde Hugging Face; también en Node 18+ con `fs.readFileSync`.
- Latencia y throughput: no disponibles en la información proporcionada; al operar a nivel de palabra y con pesos de menos de 1 MB, la latencia esperada es de milisegundos en hardware convencional, aunque no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Despliegue | Rendimiento Aksharantar |
|---|---|---|---|---|---|---|
| Lekhani | 0,8M–1,2M por idioma (4 bits) | No disponible (nivel de palabra) | 12 índicos | Apache 2.0 | Navegador (JS), Node | 50–81% top-1 |
| IndicXlit (modelo solo) | No disponible | No disponible | Índicos | No disponible en la información | Python | 4,2–14,8 puntos por debajo de Lekhani |
| IndicXlit (paquete completo) | No disponible | No disponible | Índicos | No disponible en la información | Python con listas léxicas en memoria | A la par o por delante en varios idiomas |

No se dispone de datos de otros transliteradores comparables (como Google Input Tools o Aksharamukha) en la información proporcionada.

## Limitaciones y advertencias

- Precisión limitada: la primera predicción acierta entre el 50% y el 81% de las palabras según el idioma, por lo que entre una quinta y la mitad de las entradas requieren corrección o selección entre candidatos.
- Especialización estrecha: no genera texto, no razona, no responde preguntas ni procesa secuencias; solo translitera palabras.
- Dependencia de listas léxicas: el rendimiento se apoya en listas de palabras comunes y en el reordenador; palabras fuera de lista o nombres propios pueden transliterarse de forma menos fiable.
- Idiomas: cubre doce lenguas índicas con entrada latina; no se documenta soporte para otras escrituras de entrada ni para variantes dialectales.
- Urdu requiere configuración explícita de dirección de escritura (`dir="rtl"`) en el elemento de salida; un error de integración puede mostrar el texto invertido.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución, pero no se documentan garantías ni soporte del autor.
- Riesgo de alucinación ortográfica: al generar hasta 8 candidatos, el modelo puede producir variantes no estándar; el indicador `inList` ayuda pero no garantiza corrección.
- No se documentan sesgos lingüísticos específicos, pero al entrenarse con Aksharantar e IndicCorpV2 puede heredar los sesgos de cobertura de esos corpus.
- El formato de pesos es propietario del runner (`translit.js`); no hay conversión documentada a safetensors, GGUF ni otros formatos estándar de la industria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/udgamlabs/Lekhani
- Demo en el navegador (Space): https://huggingface.co/spaces/udgamlabs/Lekhani
- Página del modelo en Udgam Labs: https://udgamlabs.com/models/lekhani
- Informe técnico: https://udgamlabs.com/research/lekhani
- Dataset Aksharantar: https://huggingface.co/datasets/ai4bharat/Aksharantar
- Dataset IndicCorpV2: https://huggingface.co/datasets/ai4bharat/IndicCorpV2
- Paper de referencia (arXiv:2205.03018): https://arxiv.org/abs/2205.03018
