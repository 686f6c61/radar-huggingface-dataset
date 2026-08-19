# vpermilp/spellman

## Resumen

Spellman es un detector de idioma optimizado para escritura cirílica, desarrollado por vpermilp y publicado bajo licencia MIT. Resuelve un problema específico: distinguir lenguas eslavas y túrquicas muy cercanas (ruso, ucraniano, bielorruso, búlgaro, macedonio, serbio, kazajo, kirguís, tártaro, baskir, etc.) en texto real de internet, corto y ruidoso (tuits, comentarios, mensajes). A diferencia de los detectores generalistas, Spellman dedica 21 de sus 30 clases a lenguas cirílicas y añade un canal léxico (palabras completas y bigramas de palabras) además de los n-gramas de caracteres.

El modelo es un clasificador fastText-like con una matriz plegada `P = E·W` de 131.073×30 en f16 (7,86 MB), que permite inferencia por tablas puras sin multiplicaciones de matrices, alcanzando ~3,5 µs por muestra en CPU. No es un modelo generativo ni un LLM: es un clasificador de texto especializado en identificación de idioma. Su diseño permite cuantizaciones int8 y fp8 sin pérdida apreciable de precisión (±0,02 pp), lo que lo hace adecuado para despliegue en entornos con recursos limitados.

La relevancia actual radica en que los detectores generalistas (fastText, lingua, whichlang) fallan en pares cirílicos cercanos y en texto corto con ruido, y Spellman los supera en esas tareas específicas, con una velocidad muy superior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | fastText-like (char n-grams 1..5 + canal léxico de palabras y bigramas, hashing con signo) |
| Parametros totales | 3.932.220 (matriz P [131073×30] f16 + bias [30]) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (clasificador de texto, procesa por ventanas de línea) |
| Tipos de cuantizacion | f16 (original), int8-row, int8-col, fp8 e4m3-row, fp8 e4m3-col |
| Idiomas soportados | 30: 21 cirílicos (rus, ukr, bel, bul, mkd, srp, kaz, kir, tgk, uzn, tat, bak, chv, sah, tyv, mon, oss, che, udm, mhr, kpv) + 5 latinos (eng, spa, fra, por, deu) + 4 por script (cmn, jpn, hin, ara) |
| Licencia | MIT |
| Formato de pesos | safetensors (f16) y variantes int8/fp8 también en safetensors |

## Arquitectura y entrenamiento

El modelo sigue el enfoque fastText: el espacio de características son n-gramas de caracteres de longitud 1 a 5, más un canal léxico adicional donde cada palabra contribuye su clave FNV-1a-64 completa y una clave de bigrama de palabras adyacentes (equivalente a los features `word` y `wordNgram` de fastText). Todas las características se proyectan mediante hashing con signo a un espacio de buckets de 131.073 dimensiones. La matriz final `P` es el producto algebraico `E·W` de la matriz de embeddings y la matriz de clasificación, de modo que la inferencia se reduce a sumas de filas de `P` (tabla lookups) más un bias, sin gathers de embeddings ni matmuls.

El entrenamiento usó datos de FineWeb-2 por idioma (muestreados como ventanas de línea, licencia ODC-BY), FineWeb para inglés, ~104.000 frases de Tatoeba (CC BY 2.0 FR) y corpus comunitarios/paralelos para las clases débiles (tártaro, baskir, chuvasio, tuvano, kirguís, udmurto, mari, macedonio, checheno, etc.), con filtrado de higiene y protección de lenguas gemelas. La metodología completa está documentada en el repositorio spellman (design doc + guía de entrenamiento). No se menciona el uso de RLHF ni DPO; es un entrenamiento supervisado estándar para clasificación.

## Capacidades

- Detección de idioma en 30 clases, con especialización en pares cirílicos cercanos (ru/be/uk, bg/mk/sr, kk/ky/tt/ba).
- Funciona bien en texto corto y ruidoso: tuits con menciones (@) y URLs, mensajes de una sola palabra, pares o tripletas de palabras.
- Canal léxico que captura información de palabras completas y bigramas, mejorando la discriminación en fragmentos muy breves.
- Inferencia extremadamente rápida en CPU: ~3,5 µs por muestra en plan JIT fp16.
- Soporte de cuantización int8 y fp8 sin pérdida significativa de precisión (±0,02 pp).
- No requiere GPU; corre en cualquier CPU moderna.
- API de línea de comandos (`spellman detect`) y biblioteca Rust (crate detector).
- Capacidad de procesar líneas individuales o flujos de texto (`--lines`).

## Casos de uso

- Moderación de contenido en redes sociales: detectar automáticamente el idioma de tuits, comentarios o mensajes cortos en ruso, ucraniano, bielorruso, etc., incluso con ruido (menciones, URLs, emojis), gracias a su robustez en texto salvaje y su velocidad de microsegundos.
- Enrutamiento de tickets de soporte: clasificar consultas de usuarios escritas en lenguas cirílicas minoritarias (tártaro, baskir, chuvasio, tuvano) para dirigirlas al equipo de soporte adecuado, sin depender de detectores que solo cubren idiomas mayoritarios.
- Preprocesamiento de pipelines de NLP: identificar el idioma de cada documento o línea antes de aplicar modelos de análisis (sentimiento, NER, traducción), con un coste computacional despreciable (~3,5 µs/muestra) y sin necesidad de GPU.
- Análisis de redes sociales para investigación sociolingüística: distinguir entre ruso y ucraniano, o entre búlgaro y macedonio, en corpus de texto real para estudiar patrones de uso lingüístico, donde los detectores generalistas fallan.
- Clasificación de dominios web o de archivos de texto: etiquetar automáticamente páginas o documentos en 30 idiomas, incluyendo lenguas con escritura cirílica poco representadas en herramientas comerciales.
- Filtrado de datos para entrenamiento de modelos multilingües: separar por idioma corpus masivos (p. ej., FineWeb) con alta precisión y a gran velocidad, superando a fastText lid.176 en las clases cirílicas (98,66% vs 94,90% en Tatoeba).
- Detección de idioma en dispositivos edge o embebidos: el modelo en f16 ocupa solo 7,86 MB y la inferencia es por tablas, por lo que puede ejecutarse en Raspberry Pi, routers o microcontroladores con CPU limitada.

## Benchmarks y rendimiento

Según la model card del autor, los resultados son los siguientes:

| Evaluación | Precisión |
|---|---|
| Held-out mix (85.283 filas, test limpio) | 98,28% |
| Tatoeba (37.051 frases, fuera de dominio) | 98,66% |
| Tatoeba granularidad (palabra / par / tripleta) | 68,5 / 87,1 / 94,1 |
| Tuits rusos salvajes (2.679; 61% @menciones, 20% URLs) | 93,73% |
| Throughput | ~3,5 µs/muestra (fp16, CPU) |

Comparación con otros detectores en las mismas evaluaciones (según el autor):

| Detector | Tatoeba (out-of-domain) | Single-word (Tatoeba) | Wild held-out | Velocidad relativa |
|---|---|---|---|---|
| Spellman | 98,66% | 68,5% | 98,28% | ~1× (3,5 µs) |
| fastText lid.176 | 94,90% | no disponible | no disponible | ~30× más lento |
| GlotLID v3 | 99,25% | 43,9% | 96,43% | ~100× más lento |
| lingua 1.8 high-accuracy | no disponible | no disponible | no disponible | ~30× más lento que Spellman |

Spellman gana a GlotLID en la tarea de texto salvaje (98,28 vs 96,43) y en la de una sola palabra (68,5 vs 43,9), aunque GlotLID, con un conjunto de entrenamiento mucho mayor, supera en frases limpias fuera de dominio (99,25 vs 98,66). En cuanto a cobertura, whichlang y lingua cubren solo 10 y 17 de las 30 clases respectivamente.

## Requisitos de hardware

- Inferencia en CPU pura, sin GPU necesaria. El modelo f16 pesa 7,86 MB; las variantes cuantizadas pesan entre 3,93 y 4,46 MB.
- VRAM: no aplica (no usa GPU). RAM necesaria: menos de 10 MB para el modelo en memoria.
- GPU recomendadas: ninguna. Cualquier CPU x86_64 o ARM moderna es suficiente.
- En consumer hardware: funciona en cualquier portátil, Raspberry Pi o incluso microcontroladores con suficiente RAM.
- Opciones de despliegue: biblioteca Rust (crate `detector`), CLI `spellman` (que puede descargar modelos directamente del Hub), o integración en pipelines de Python mediante subprocess o FFI. No se menciona soporte para vLLM, Ollama o TGI (no es un LLM).
- Latencia: ~3,5 µs por muestra en CPU (plan JIT fp16). Throughput estimado: cientos de miles de muestras por segundo en un solo núcleo.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Precisión (Tatoeba) | Velocidad | Licencia |
|---|---|---|---|---|---|
| Spellman | 3,93 M | 30 (21 cirílicos) | 98,66% | ~3,5 µs/muestra | MIT |
| fastText lid.176 | ~1 M (estimado) | 176 | 94,90% | ~100 µs/muestra (estimado) | MIT |
| GlotLID v3 | no disponible | ~1600 | 99,25% (frases limpias) | ~350 µs/muestra (estimado) | CC-BY |
| lingua 1.8 | no disponible | 75 | no disponible | ~100 µs/muestra (estimado) | Apache-2.0 |

Spellman se posiciona como la opción más rápida y precisa para pares cirílicos cercanos y texto corto, a costa de un número de idiomas mucho menor que GlotLID o fastText. Para uso general multilingüe, GlotLID o fastText cubren más idiomas; para tareas específicas con lenguas cirílicas, Spellman es superior en velocidad y precisión en escenarios ruidosos.

## Limitaciones y advertencias

- No es un modelo generativo: no genera texto, solo clasifica idioma. No debe usarse para tareas de comprensión o generación.
- Cobertura limitada a 30 idiomas. Idiomas como polaco, checo, eslovaco, croata o esloveno (que usan alfabeto latino) no están incluidos; solo los 5 latinos principales (ing, esp, fra, por, deu).
- Los idiomas chino, japonés, hindi y árabe se manejan por enrutamiento de script, no por modelo: cualquier texto en esos alfabetos se clasificará como su idioma correspondiente sin distinción fina (p. ej., no distingue entre chino simplificado y tradicional).
- Riesgo de confusión en pares muy cercanos fuera de los evaluados (p. ej., serbio y croata, aunque croata no está en la lista).
- Los datos de entrenamiento incluyen corpus comunitarios y paralelos para clases débiles, lo que puede introducir sesgos de dominio (por ejemplo, textos religiosos o folclóricos en tártaro o baskir).
- El rendimiento en texto extremadamente corto (una sola palabra) es limitado (68,5% en Tatoeba), aunque superior a GlotLID.
- No se proporcionan métricas de calibración de confianza ni umbrales de rechazo para entradas fuera de los 30 idiomas; puede clasificar erróneamente texto en idiomas no soportados.
- La licencia MIT permite uso comercial sin restricciones, pero el modelo depende del runtime Rust spellman, que debe cumplir su propia licencia (no especificada en la model card).
- El autor no indica la versión exacta de la librería fastText utilizada; el modelo se consume a través del runtime spellman, no como un archivo `.bin` de fastText estándar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vpermilp/spellman
- Variantes cuantizadas (mencionadas en la model card): `vpermilp/spellman/int8-row`, `vpermilp/spellman/int8-col`, `vpermilp/spellman/fp8-row`, `vpermilp/spellman/fp8-col`
- Repositorio spellman (no se proporciona URL directa; referenciado en la model card como "spellman repository" con design doc y guía de entrenamiento)
- Datos de entrenamiento: FineWeb-2 (ODC-BY), Tatoeba (CC BY 2.0 FR)
