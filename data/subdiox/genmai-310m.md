# subdiox/genmai-310M

## Resumen
genmai-310M es un modelo de conversión kana-kanji (entrada de lectura en katakana a texto japonés) desarrollado por subdiox y publicado en Hugging Face. Está afinado a partir de Miwa-Keita/zenz-v2.5-medium y forma parte del método de entrada (IME) genmai para macOS, donde se ejecuta en local mediante Core ML sobre el Neural Engine de Apple. Su función concreta es transformar una lectura en katakana en la frase japonesa correcta, opcionalmente condicionada por el texto anterior al cursor.

El modelo emplea una arquitectura GPT-2 a nivel de carácter con 24 capas, dimensión oculta de 1024 y 309,5 millones de parámetros. No es un modelo de propósito general: está especializado en una tarea acotada del procesamiento del japonés, con un formato de prompt propio (`zenzlc`) que incluye contexto izquierdo (hasta 500 caracteres), lectura en katakana y salida. Su relevancia radica en que ofrece conversión kana-kanji de calidad en dispositivo, con latencias de decenas de milisegundos y un consumo de memoria de 80–140 MB en un M4 Pro.

La licencia CC BY-SA 4.0 permite uso comercial con atribución y compartir-alike, lo que lo hace utilizable en productos derivados siempre que se respeten esas condiciones. Existe además una variante destilada de 90M (subdiox/genmai-90M) aproximadamente el doble más rápida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only), vocabulario a nivel de carácter |
| Parametros totales | 309.504.000 (309,5M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible como cifra de ventana; el prompt usa contexto izquierdo de hasta 500 caracteres y `prompt_slots` de 256 en Core ML |
| Tipos de cuantizacion | fp32 (safetensors para transformers); int8 simétrico por canal para pesos lineales y fp16 para el resto en Core ML |
| Idiomas soportados | japonés (ja) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors (fp32, layout GPT-2 de Hugging Face); Core ML (`model-coreml.zip`, paquetes stateful) |
| Capas | 24 |
| Dimensión oculta | 1024 |
| Modelo base | Miwa-Keita/zenz-v2.5-medium |
| Tamaño del repo | 1,8 GB |
| Pipeline | text-generation |

## Arquitectura y entrenamiento
El modelo es un transformer decoder-only de tipo GPT-2 con vocabulario a nivel de carácter, 24 capas y dimensión oculta de 1024. Se inicializa desde zenz-v2.5-medium y se afina en varias etapas sobre pares (lectura, texto). La primera etapa usa aproximadamente 6 millones de frases leídas automáticamente procedentes de Wikipedia en japonés, FineWeb-2 (japonés), Aozora Bunko y actas parlamentarias (Diet minutes); la información proporcionada se interrumpe en ese punto, por lo que no se detallan las etapas posteriores ni el volumen total de tokens.

El prompt sigue el formato `zenzlc`: `<s>[U+EE02]{contexto izquierdo}[U+EE00]{lectura en katakana}[U+EE01]{salida}</s>`, con caracteres de uso privado U+EE00–U+EE02 como marcadores. Los espacios se codifican como U+3000 y los saltos de línea se eliminan. La decodificación recomendada es búsqueda por haces (5 haces en genmai) con `length_penalty=0.0`, ordenando por suma directa de log-probabilidades, porque la normalización por longitud por defecto de transformers puede favorecer salidas degeneradas largas. Las lecturas largas se dividen en 、。 en fragmentos de como máximo 40 caracteres, decodificando cada uno tras la salida anterior.

La conversión a Core ML (coremltools 9, macOS 15 / iOS 18 o posterior) divide el modelo en dos paquetes (`genmai_0` con capas 0–11 y `genmai_1` con capas 12–23 y la cabeza), porque un paquete con las 24 capas no carga en el Neural Engine. Cada paquete expone funciones `prefill` y `decode` que comparten estados por capa (claves y valores en fp16). Para mantenerse dentro del rango fp16 del Neural Engine (máximo 65504), los pesos se reparametrizan: el flujo residual se escala por 0,25 (embeddings y proyecciones de salida de atención/MLP × 0,25, épsilon de layer norm × 1/16, cabeza con embeddings sin escalar) y los logits de atención se calculan divididos por 256, con resta del máximo de fila y multiplicación por 256 antes del softmax. Las layer norms dividen su entrada por su magnitud máxima antes de calcular la varianza (épsilon dividido por su cuadrado), lo que corrige el desbordamiento fp16 del primer token (valor residual de unos 20k escalado) y el fallo detectado en macOS 26 (v1.0.0 producía basura; corregido en v1.0.1).

## Capacidades
- Conversión kana-kanji: transforma una lectura en katakana en texto japonés, con ejemplos como ハハハハガイタイラシイ → 母は歯が痛いらしい.
- Conversión condicionada por contexto: acepta hasta 500 caracteres de texto anterior al cursor para desambiguar la salida.
- Generación con búsqueda por haces: soporta `num_beams` y `num_return_sequences` para obtener y ordenar varias hipóteses.
- Segmentación de lecturas largas: divide entradas largas en 、。 en fragmentos de hasta 40 caracteres y decodifica encadenadamente.
- Ejecución en dispositivo: paquetes Core ML stateful para el Neural Engine, con prefill de 32 tokens y decodificación de un token por haz y paso.
- No dispone de tool calling, function calling, agentes, visión, audio ni modo de razonamiento; es un modelo especializado de una única tarea.

## Casos de uso
- Método de entrada japonés en macOS: es el conversor del IME genmai, que lo ejecuta en local con Core ML; la tecla de conversión responde en una mediana de 30 ms (frases cotidianas) y 39 ms (AJIMEE) en un M4 Pro.
- Conversión de lecturas en aplicaciones de escritura: integración en editores o procesadores de texto que reciben la lectura en katakana y necesitan producir la frase japonesa, usando el contexto izquierdo para desambiguar.
- Herramientas de accesibilidad para entrada por teclado kana: permite escribir en japonés con lecturas en katakana y obtener kanji correctos en dispositivo, sin enviar texto a servidores.
- Procesamiento por lotes de corpus con lecturas: conversión de pares (lectura, texto) en pipelines de transformers con fp32 y búsqueda por haces para tareas de normalización o generación de datos.
- Aplicaciones móveis y de escritorio con requisitos de privacidad: al ejecutarse en el Neural Engine con un footprint de 80–140 MB, encaja en apps que no pueden depender de la nube.
- Investigación en conversión kana-kanji: punto de partida o baseline especializado para experimentos de IME y evaluación con AJIMEE y frases difíciles.
- Variante ligera para dispositivos con menos recursos: la destilación de 90M (subdiox/genmai-90M), aproximadamente el doble más rápida, sirve para escenarios donde la latencia es crítica.

## Benchmarks y rendimiento
Resultados publicados por el autor en un M4 Pro con 5 haces (precisión top-1 exacta):

| Conjunto | Core ML (Neural Engine) | Pesos int8 en GPU |
|---|---|---|
| Frases cotidianas | 94,1 % | 93,1 % |
| AJIMEE | 93,0 % | 92,5 % |
| Frases difíciles | 78,6 % | 78,6 % |

El top-1 coincide en el 96–98,5 % de los elementos entre ambas configuraciones. Latencia: una frase cotidiana completa se convierte en una mediana de 113 ms; la tecla de conversión del IME responde en una mediana de 30 ms (frases cotidianas) y 39 ms (AJIMEE). La primera carga compila el modelo para el Neural Engine (unos 20 s; macOS cachea el resultado). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible como cifra; el repo pesa 1,8 GB y los pesos fp32 ocupan 1,2 GB, por lo que en GPU la inferencia fp32 requiere aproximadamente 1,2–2 GB según overhead.
- GPU recomendadas: no se especifican modelos concretos; el autor reporta ejecución con pesos int8 en GPU en un Apple M4 Pro.
- Consumer GPU: el tamaño de 310M permite ejecución en GPUs de consumo, pero no se proporcionan cifras de VRAM ni modelos validados.
- Despliegue: transformers (safetensors fp32, layout GPT-2); Core ML con `model-coreml.zip` para el Neural Engine (macOS 15 / iOS 18 o posterior); el script de conversión es `Tools/coreml/genmai_coreml.py` de genmai-ime (`--chunks 2 --residual-scale 0.25 --score-scale 256`).
- Latencia y throughput: mediana de 113 ms por frase cotidiana completa y 30/39 ms en la tecla de conversión del IME (M4 Pro, 5 haces); footprint de proceso de 80–140 MB.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| subdiox/genmai-310M | 309,5M | contexto izquierdo de hasta 500 caracteres; `prompt_slots` 256 en Core ML | Conversión kana-kanji | CC BY-SA 4.0 | Hugging Face; Core ML |
| subdiox/genmai-90M | 90M (destilado de este) | no disponible | Conversión kana-kanji | no disponible | Hugging Face; aproximadamente el doble más rápido |
| Miwa-Keita/zenz-v2.5-medium | no disponible | no disponible | Modelo base de conversión japonesa | CC BY-SA 4.0 | Hugging Face |

No se dispone de datos de benchmarks comparativos con otros conversores kana-kanji en la información proporcionada.

## Limitaciones y advertencias
- Especialización estrecha: solo realiza conversión kana-kanji en japonés; no es un modelo de propósito general ni soporta otras tareas.
- Riesgo de salidas degeneradas: con la normalización por longitud por defecto de transformers, salidas largas como ハハハハガイタイらしい pueden ganar; debe usarse `length_penalty=0.0` y ordenar por suma de log-probabilidades.
- Precisión limitada en frases difíciles: 78,6 % top-1 en frases difíciles frente a 93–94 % en frases cotidianas y AJIMEE.
- Restricciones de licencia: CC BY-SA 4.0 exige atribución y compartir-alike; el uso comercial está permitido bajo esas condiciones, pero los derivados deben distribuirse con la misma licencia.
- Caveat de producción en Core ML: el modelo supera el rango fp16 del Neural Engine y depende de reparametrizaciones exactas; la versión v1.0.0 producía basura en macOS 26 por el cálculo de la varianza de layer norm en fp16, corregido en v1.0.1. Debe fijarse una revisión (por ejemplo `v1.0.1`) para evitar regresiones.
- Idiomas: solo japonés; no hay soporte multilingüe.
- Sesgos: no se documentan sesgos conocidos en la información disponible; el entrenamiento con Wikipedia, FineWeb-2, Aozora Bunko y actas parlamentarias puede reflejar sesgos de esas fuentes.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/subdiox/genmai-310M
- Variante destilada: https://huggingface.co/subdiox/genmai-90M
- Modelo base: https://huggingface.co/Miwa-Keita/zenz-v2.5-medium
- Repositorio del IME genmai: https://github.com/subdiox/genmai-ime
- Script de conversión Core ML: `Tools/coreml/genmai_coreml.py` en https://github.com/subdiox/genmai-ime
- Papers, blogs y demos adicionales: no disponible en la información proporcionada.
