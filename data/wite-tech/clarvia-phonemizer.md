# wite-tech/clarvia-phonemizer

## Resumen

clarvia-phonemizer es un fonemizador y normalizador de texto para turco desarrollado por wite-tech. No es un modelo neuronal: es una librería de reglas en Python puro, sin dependencias externas, que convierte texto turco escrito en una secuencia de fonemas con marcas de acentuación, pensada como front-end para sistemas de síntesis de voz (TTS). Forma parte del ecosistema del modelo clarvia-tts-tiny, un TTS turco de 4,5 millones de parámetros, y mantiene la interfaz de dizione, el fonemizador inglés de tiny-voca.

El problema que resuelve es el de la normalización de texto previa a la síntesis: leer en voz alta números de teléfono, cuentas, fechas, horas, importes, unidades, direcciones, códigos y abreviaturas tal como los diría una persona, y después aplicar las reglas fonológicas del turco (armonía vocálica, alternancia d/t, consonantes de unión, regla de Sezer para topónimos) para producir fonemas con acento. El resultado se emite con un inventario de 56 símbolos: 24 consonantes, 15 vocales (8 cortas y 7 largas), 12 signos de puntuación y 5 tokens especiales.

Es relevante porque cubre una carencia práctica en el pipeline TTS turco: la mayoría de soluciones dependen de librerías pesadas o de modelos neuronales para una tarea determinista que aquí se resuelve con reglas explícitas, auditables y ejecutables en cualquier entorno con Python 3.10, incluido Pyodide en el navegador. La licencia Apache 2.0 y la ausencia de dependencias facilitan su integración en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Sistema de reglas determinista en Python puro (sin red neuronal); pipeline de normalización de texto, grafema-fonema (g2p) y asignación de acento |
| Parámetros totales | no disponible (no es un modelo con pesos entrenados) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa el texto de entrada completo, sin ventana definida) |
| Tipos de cuantización | no aplica (no hay pesos) |
| Idiomas soportados | turco (tr) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (distribución como paquete Python vía `pip install git+https://huggingface.co/wite-tech/clarvia-phonemizer`; datos en ficheros de texto plano en `clarvia_phonemizer/data/`) |

## Arquitectura y entrenamiento

No hay entrenamiento ni pesos. El sistema se compone de tres módulos con responsabilidades separadas. `rules.py` aplica una única pasada sobre el texto: en cada posición se prueban todas las reglas que pueden empezar ahí y gana la coincidencia más larga, de modo que `TL/kWh` se interpreta como una unidad de precio y `0555 987 12 34` como un número de teléfono, sin cadenas de pasadas ordenadas manualmente. Los sufijos escritos tras números, unidades o códigos (`4'ü`, `2025'te`, `TL'yi`) se reconstruyen sobre la palabra que realmente se pronuncia, aplicando armonía vocálica, consonantes de unión, alternancia d/t y la transformación dört → dördü, gestionadas en `turkish.py`.

`g2p.py` convierte letras en fonemas: la k y la g palatales y la l clara y oscura siguen a la vocal más cercana; la ğ alarga la vocal o se realiza como [j]; el circunflejo marca consonante palatal o vocal larga; la n ante k y g se realiza como [ŋ]. `stress.py` asigna el acento: última sílaba por defecto, sílaba anterior a un sufijo átono (GEL-me-di, ge-Lİ-yor), regla de Sezer para topónimos que se mantiene bajo sufijación (AN-ka-ra-da), lista de excepciones para adverbios, préstamos y marcas, y clíticos átonos. La función `identity()` genera una huella de las reglas y los datos para evitar mezclar tokens entre versiones.

La extensibilidad se apoya en listas de texto plano en `clarvia_phonemizer/data/`: `exceptions.txt` (repronunciación y acento de palabras que las reglas fallan, como şimdi, yarın, fatura, numara o WhatsApp) y `places.txt` (provincias y distritos con su acentuación).

## Capacidades

- Normalización de texto turco con lectura contextual de números de cuenta, abonado e instalación, códigos de registro y ticket, números de identidad turcos de 11 dígitos, códigos de verificación y números de teléfono nacionales (formato 3-3-2-2) e internacionales.
- Lectura de direcciones en estilo registro (mahalle, sokak, número, kat, daire, distrito/provincia) y de abreviaturas de vía según contexto (Sk. → sokak o sokağı).
- Fechas ISO y con sufijos, horas, rangos horarios, importes en liras y kuruş, precios unitarios (TL/kWh), otras divisas, escalas (millones), porcentajes, unidades físicas (kWh, km/sa, °C), signos y operaciones.
- Nombres de modelos y productos con letras y números (RTX 4090, A320, Galaxy S24, 5G, 4K), versiones (Python 3.12), matrículas, correos y direcciones web.
- Ordinales, numerales romanos, distributivos, decimales, sufijos tras números y acrónimos, tanto deletreados como leídos como palabra (KDV, NATO, ODTÜ), además de expansión de siglas institucionales (EPDK, PTT, A.Ş.).
- Conversión de mayúsculas sostenidas a lectura normal y descarte de emoji, markdown y etiquetas HTML.
- Conversión grafema-fonema con acento y salida estructurada: `result.symbols` (fonemas), `result.ids` (ids de token para el modelo TTS) y `result.stress` (1 en vocales acentuadas).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un componente determinista de preprocesado.
- Ejecutable en Pyodide, además de cualquier entorno con Python 3.10.

## Casos de uso

- Preprocesado de un pipeline TTS turco: se inserta antes de clarvia-tts-tiny (o de otro sintetizador) para convertir texto arbitrario en fonemas con acento y entregar directamente los ids de token que espera el modelo, evitando que el sintetizador tenga que lidiar con números y abreviaturas.
- Locuciones telefónicas de atención al cliente: lectura correcta de números de abonado, instalación, verificación y teléfono con agrupaciones naturales, algo crítico en mensajes IVR donde un número mal leído inutiliza la llamada.
- Avisos de facturación y cobro: importes en liras y kuruş, precios unitarios por kWh, porcentajes y escalas se convierten en la frase que diría un operador, con concordancia de sufijos (`50 TL'yi` → elli lirayı).
- Anuncios de incidencias y cortes de suministro: fechas, rangos horarios y direcciones en estilo registro se normalizan y fonemizan para generar avisos hablados automatizados.
- Accesibilidad y lectura de pantalla en turco: integración en lectores que necesiten pronunciar identificadores, matrículas, correos y URLs con una pronunciación predecible y acentuada.
- Ejecución en el navegador o en el borde: al no tener dependencias y funcionar en Pyodide, permite normalizar y fonemizar en cliente sin enviar texto a un servidor, útil en aplicaciones web con requisitos de privacidad.
- Generación de datasets de entrenamiento TTS: producción masiva de pares texto-fonemas con marcas de acento para alinear o evaluar corpus turcos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- No requiere GPU: es Python puro sin dependencias, por lo que la inferencia es CPU-only.
- VRAM estimada: 0 GB; el consumo es de memoria RAM del intérprete Python, no disponible como cifra concreta en la información proporcionada.
- GPU recomendadas: no aplica.
- Cabe en cualquier GPU consumer y en entornos sin GPU (servidores pequeños, contenedores, navegador vía Pyodide).
- Opciones de despliegue: instalación como paquete Python (`pip install git+https://huggingface.co/wite-tech/clarvia-phonemizer`), uso como librería (`import clarvia_phonemizer`) o como comando de línea (`clarvia-phonemizer "..."`). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este componente.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Componente | Tipo | Idiomas | Dependencias | Licencia | Contexto de uso |
|---|---|---|---|---|---|
| clarvia-phonemizer | Reglas en Python puro | Turco | Ninguna | Apache 2.0 | Front-end de clarvia-tts-tiny |
| dizione | Fonemizador (referencia de interfaz) | Inglés | no disponible | no disponible | Front-end de tiny-voca |
| eSpeak NG | Sintetizador con front-end G2P por reglas | Multilingüe (incluye turco) | C/C++ | GPL | TTS completo con fonemizador integrado |
| Modelos G2P neuronales genéricos | Red neuronal | Multilingüe | Framework de deep learning | Variable | G2P sin normalización de texto específica |

La comparación con dizione se limita a la interfaz, que clarvia-phonemizer replica; no se dispone de datos de rendimiento comparado con eSpeak NG ni con modelos G2P neuronales en la información proporcionada.

## Limitaciones y advertencias

- Cobertura limitada al turco: no procesa otros idiomas, y los textos con mezcla de lenguas pueden producir lecturas incorrectas.
- Es un sistema de reglas: los casos no cubiertos por `rules.py`, `exceptions.txt` o `places.txt` caerán en la regla por defecto y pueden pronunciarse mal; la lista de excepciones requiere mantenimiento manual.
- El acento depende de listas de excepciones para adverbios, préstamos y marcas; palabras nuevas o nombres propios no listados pueden recibir un acento incorrecto.
- La lectura de abreviaturas y siglas es contextual y heurística; acrónimos ambiguos pueden deletrearse cuando deberían leerse como palabra, o al contrario.
- No hay datos publicados de benchmarks, tasas de error de normalización ni cobertura de casos, por lo que la calidad debe validarse con un corpus propio antes de producción.
- La licencia Apache 2.0 permite uso comercial, pero no se documentan garantías ni soporte por parte del autor.
- Sesgos: al ser determinista, no hay sesgos estadísticos de entrenamiento, pero las listas de excepciones y topónimos reflejan las elecciones del autor y pueden omitir variantes regionales de pronunciación.
- Riesgo de alucinación: no aplica en el sentido de generación libre, pero una regla mal aplicada produce una salida errónea silenciosa; conviene usar `identity()` para versionar y detectar cambios entre versiones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wite-tech/clarvia-phonemizer
- Modelo TTS asociado: https://huggingface.co/wite-tech/clarvia-tts-tiny
- dizione (fonemizador inglés de referencia): https://github.com/n4ze3m/dizione
- tiny-voca: https://github.com/n4ze3m/tiny-voca
