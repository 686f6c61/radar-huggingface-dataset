# terry-sarana/misaki-en-us-lexicon

## Resumen

`terry-sarana/misaki-en-us-lexicon` no es un modelo neuronal, sino un recurso léxico para conversión grafema-fonema (G2P) en inglés estadounidense. Se trata de una copia fusionada y comprimida con gzip de los ficheros `us_gold.json` y `us_silver.json` del proyecto misaki (hexgrad), reexportada como líneas `palabra<TAB>fonemas` en el alfabeto de fonemas que emplea Kokoro. Contiene 183.561 entradas y su función es servir de alternativa a eSpeak en la conversión de texto a fonemas dentro de un pipeline de síntesis de voz.

El recurso lo publica el usuario terry-sarana como dependencia del demo de TTS accesible en saranaventures.com/demos/tts/, donde se usa en la sección Advanced -> Pronunciation. La relevancia es acotada pero clara: permite sustituir un G2P basado en reglas (eSpeak) por un diccionario de pronunciaciones curado y de mayor calidad para inglés americano, sin depender de un modelo neuronal en el navegador.

Es, por tanto, un fichero de datos derivado (no entrenado) con licencia Apache-2.0, heredada del proyecto original misaki. No dispone de parámetros, ventana de contexto ni capacidad de generación: su única operación es la búsqueda de una palabra y la devolución de su transcripción fonémica.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo neuronal; es un léxico G2P en texto plano comprimido) |
| Parámetros totales | no disponible (no aplica; 183.561 entradas léxicas) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; búsqueda por palabra individual) |
| Tipos de cuantización | no disponible (no aplica) |
| Idiomas soportados | inglés estadounidense (en-US) según la model card; metadatos de HuggingFace: no disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (no hay pesos); fichero de texto con extensión gzip, líneas `palabra<TAB>fonemas` en el alfabeto de fonemas de Kokoro |

## Arquitectura y entrenamiento

No existe arquitectura ni entrenamiento. El fichero es el resultado de una operación de consolidación sobre el léxico de misaki: se fusionan `us_gold.json` (entradas de mayor calidad) y `us_silver.json` (entradas de calidad secundaria), con prioridad para las primeras en caso de conflicto ("gold wins"), y se reducen las variantes por categoría gramatical a su forma por defecto. La salida se serializa como texto plano tabulado y se comprime con gzip.

La innovación técnica es mínima y de ingeniería de datos: adaptar el formato de misaki al alfabeto fonémico de Kokoro para poder usarlo como capa G2P en un demo de TTS que corre en el navegador, evitando la dependencia de eSpeak. No hay datos de entrenamiento (número de tokens, composición del corpus, RLHF o DPO) porque no se ha entrenado ningún modelo; el corpus subyacente es el léxico de misaki, del que no se detalla composición ni procedencia en la información disponible.

## Capacidades

- Conversión grafema-fonema por búsqueda directa: dada una palabra en inglés americano, devuelve su transcripción en el alfabeto de fonemas de Kokoro.
- Cobertura léxica de 183.561 entradas, con resolución de conflictos a favor de las entradas gold.
- Variantes por categoría gramatical colapsadas a una pronunciación por defecto por palabra.
- Uso como capa de pronunciación en pipelines de TTS, en sustitución de eSpeak.
- Formato legible y trivialmente parseable (`palabra<TAB>fonemas`), apto para carga completa en memoria.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No genera texto, código, matemáticas ni procesa visión o audio.
- No es multilingüe: cubre únicamente inglés estadounidense.
- No realiza G2P sensible al contexto de frase ni desambiguación por contexto oracional.

## Casos de uso

- TTS en navegador con Kokoro: el léxico se carga en el cliente y se consulta para cada palabra antes de la síntesis, evitando enviar texto a un servicio G2P externo y eliminando la dependencia de eSpeak en el demo de saranaventures.com.
- Sustitución de eSpeak en pipelines de síntesis de voz existentes: al compartir el alfabeto de fonemas de Kokoro, se puede intercambiar la capa G2P sin reentrenar el modelo acústico, comparando calidad de pronunciación entre ambos enfoques.
- Preprocesado de corpus para investigación en fonética: al ser un TSV de 183.561 pares palabra-fonema, permite construir listas de pares para evaluar sistemas G2P automáticos o para análisis de cobertura fonémica.
- Prototipado rápido de lectores de texto: equipos que necesitan una pronunciación razonable en inglés americano pueden integrar el fichero en pocas líneas, sin infraestructura de inferencia.
- Herramientas educativas de pronunciación: la consulta directa palabra-fonema permite construir glosarios de pronunciación o ejercicios de lectura con transcripción explícita.
- Capa de respaldo en sistemas TTS híbridos: puede usarse como diccionario primario y delegar en un G2P basado en reglas solo las palabras ausentes, midiendo la tasa de fallback sobre el dominio objetivo.
- Depuración de pronunciaciones en producción: al ser texto plano, permite revisar y parchear entradas concretas (nombres propios, marcas) de forma manual antes de reempaquetar el recurso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

No se proporcionan métricas de precisión G2P (por ejemplo, tasa de error de fonema o de palabra), ni comparaciones cuantitativas frente a eSpeak u otros diccionarios de pronunciación.

## Requisitos de hardware

- VRAM: no aplica; el recurso no requiere GPU.
- Memoria: el repositorio se reporta como 0,0 GB en HuggingFace (por debajo de la precisión de redondeo de la plataforma); el fichero comprimido se descomprime y se carga íntegro en RAM, algo viable en cualquier equipo de desarrollo convencional.
- GPU recomendadas: ninguna. CPU suficiente, incluido el navegador del cliente.
- Cabe en cualquier GPU de consumo y en dispositivos sin GPU, dado que no hay inferencia neuronal.
- Opciones de despliegue: servido como fichero estático (HTTP/CDN) y consultado desde JavaScript en el navegador; en servidor, cualquier runtime capaz de descomprimir gzip y hacer búsquedas en un mapa hash (Python, Node.js, Go, Rust).
- Latencia y throughput: no disponibles como cifras publicadas; al tratarse de una búsqueda en diccionario, el coste dominante es la carga inicial del fichero en memoria y el tiempo de acceso al mapa, no el cómputo.

## Comparativa con modelos similares

| Recurso | Tipo | Cobertura | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| terry-sarana/misaki-en-us-lexicon | Léxico G2P derivado de misaki, alfabeto Kokoro | 183.561 entradas, en-US | TSV comprimido con gzip | Apache-2.0 | HuggingFace |
| misaki (hexgrad), ficheros `us_gold.json` y `us_silver.json` | Léxico G2P original, JSON | no disponible en la información proporcionada | JSON | Apache-2.0 | GitHub (hexgrad/misaki) |
| eSpeak | G2P basado en reglas | no disponible | motor ejecutable | no disponible en la información proporcionada | usado como alternativa en el demo citado |
| Modelos neuronales G2P | Modelo entrenado | no disponible | pesos | no disponible | no disponible |

La comparación cuantitativa de calidad de pronunciación entre estas alternativas no está disponible en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona y no admite instrucciones; cualquier uso esperado como LLM es inválido.
- Solo cubre inglés estadounidense; no hay soporte para otras variedades del inglés ni otros idiomas.
- Al colapsar las variantes por categoría gramatical a una forma por defecto, palabras homógrafas pueden recibir una pronunciación incorrecta para el contexto de uso (por ejemplo, sustantivo frente a verbo).
- Es G2P a nivel de palabra: no resuelve contexto oracional, homografía dependiente de la frase, números, siglas, abreviaturas ni palabras fuera del léxico.
- Riesgo de cobertura incompleta: 183.561 entradas no garantizan que un dominio especializado (nombres propios, terminología técnica, marcas) esté cubierto; hace falta una estrategia de fallback.
- Calidad heterogénea: mezcla entradas gold y silver, con prioridad para las primeras, pero sin métricas publicadas de error por entrada.
- Es un recurso derivado: la licencia Apache-2.0 se hereda de misaki (hexgrad); conviene conservar la atribución al proyecto original y revisar los términos si se redistribuye modificado.
- No se documentan sesgos demográficos ni dialectales, pero un léxico de pronunciación puede infrarepresentar variedades no estándar del inglés americano.
- Al ser datos y no pesos, no hay riesgo de alucinación en sentido estricto; el riesgo equivalente es una pronunciación errónea o desactualizada devuelta como válida.
- El tamaño real del fichero no está detallado en la model card (el repo reporta 0,0 GB), por lo que el coste de carga en cliente debe medirse en el despliegue concreto.

## Enlaces

- HuggingFace: https://huggingface.co/terry-sarana/misaki-en-us-lexicon
- Proyecto misaki (origen del léxico): https://github.com/hexgrad/misaki
- Demo de TTS que usa el recurso: https://saranaventures.com/demos/tts/
- Resultados de búsqueda web: no se ha encontrado ningún enlace relevante; las entradas devueltas corresponden a la marca de cosmética BY TERRY y no guardan relación con este recurso.
