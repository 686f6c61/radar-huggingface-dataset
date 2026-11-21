# TigreGotico/leokani-g2p

## Resumen

Leokani G2P es un sistema de conversión de grafemas a fonemas (G2P, *grapheme-to-phoneme*) para inglés desarrollado por Milliwatt Labs. Su función es transformar texto escrito en inglés en secuencias de fonemas compatibles con los códigos que esperan los motores de síntesis de voz Kokoro y misaki, incluyendo marcas de acentuación prosódica. No es un modelo generativo de texto ni un TTS completo: es la pieza intermedia que traduce ortografía a representación fonética, un componente crítico en cualquier pipeline de síntesis de voz.

El repositorio `TigreGotico/leokani-g2p` es una copia byte a byte del repositorio original `milliwattlabs/leokani-g2p` (revisión `a819acc86471a04a01ba3d3f30f3765e4675c7ca`), mantenida por TigreGotico para que el backend Leokani de la librería [scriptconv](https://github.com/TigreGotico/scriptconv) descargue los ficheros del modelo desde una revisión fija. El código fuente vive en GitHub (versión 1.3.0, commit `df8bc119c0b45bc8bf885b1f5f8a6c19f3dee82c`).

Técnicamente combina un léxico de palabras comunes con un modelo neuronal ONNX para palabras fuera de vocabulario (OOV) y un modelo de contexto que decide la pronunciación de cada palabra según su cláusula. Se distribuye en dos variantes: `micro` (por defecto) y `mini` (mayor, mejor con nombres propios y palabras raras). El tamaño del repositorio es de 0,0 GB según los metadatos de Hugging Face, lo que indica un artefacto muy ligero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline hibrido: lexico + modelo neuronal ONNX encoder-decoder para OOV + modelo ONNX de desambiguacion por contexto |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (opera a nivel de clausula, sin ventana de tokens declarada) |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX, sin variantes cuantizadas declaradas) |
| Idiomas soportados | en (ingles; referencia: ingles americano) |
| Licencia | cc-by-4.0 (pesos, lexico y goldens); codigo `leokani_g2p.py` bajo MIT |
| Formato de pesos | ONNX (`oov-encoder.onnx`, `oov-decoder.onnx`, `context.onnx`) + ficheros de datos propietarios (`.data`) + `goldens.json` |

## Arquitectura y entrenamiento

Leokani G2P no es un transformer generativo al uso. Es un sistema compuesto por tres piezas que se ejecutan en cadena. Primero, un léxico almacenado en `leokani-g2p.data` (tablas y palabras comunes) y `leokani-g2p-words.data` (resto del léxico) resuelve la pronunciación de palabras conocidas. Segundo, para palabras fuera del léxico, un par de modelos ONNX (`oov-encoder.onnx` y `oov-decoder.onnx`) implementan un modelo neuronal de letra-a-sonido (*letter-to-sound*). Tercero, `context.onnx` selecciona cómo se pronuncia cada palabra en función de su cláusula, resolviendo ambigüedades homográficas y de acentuación.

Antes de fonemizar, el sistema normaliza el texto: escribe números, cantidades de dinero, fechas, horas y unidades como palabras. La salida son códigos de fonemas compatibles con Kokoro y misaki, con marcas de acento. El runtime es un único fichero Python (`leokani_g2p.py`) que solo depende de `numpy` y `onnxruntime`, lo que simplifica el despliegue. No se han publicado en la información disponible datos sobre volumen de entrenamiento, composición del corpus, ni si se aplicó RLHF o DPO; al tratarse de un modelo G2P, el entrenamiento relevante sería supervisado sobre pares grafema-fonema y no conversacional.

La variante `mini` está pensada para leer mejor nombres propios y palabras raras, lo que sugiere un modelo OOV de mayor capacidad que el de `micro`. No se detallan diferencias de parámetros ni de arquitectura interna entre ambas variantes.

## Capacidades

- Conversión de texto inglés a fonemas con marcas de acentuación, en el formato de Kokoro y misaki.
- Normalización previa de números, moneda, fechas, horas y unidades a palabras antes de la fonemización.
- Resolución de pronunciación dependiente de contexto a nivel de cláusula mediante `context.onnx`.
- Manejo de palabras fuera de vocabulario mediante modelo neuronal letra-a-sonido.
- Dos variantes con distinto equilibrio precisión/tamaño: `micro` (por defecto) y `mini` (mejor en nombres propios y palabras raras).
- Ejecución ligera con `numpy` y `onnxruntime`, sin frameworks de deep learning pesados.
- Integración como backend del sistema de conversión de escritura `scriptconv`.
- No soporta tool calling, agentes, razonamiento multi-paso, visión ni audio; su alcance es exclusivamente G2P.

## Casos de uso

- Síntesis de voz con Kokoro: Leokani G2P actúa como etapa intermedia que convierte el texto de entrada en los códigos de fonemas que Kokoro espera, con acentuación correcta, permitiendo construir un TTS completo a partir del modelo acústico de Kokoro más este fonemizador.
- Lectura de textos con cifras y unidades: en un asistente de lectura o un lector de pantalla, el sistema convierte automáticamente "3,50 €", "12/03/2026" o "5 km" en palabras antes de fonemizar, evitando errores de pronunciación de símbolos.
- Preprocesado en pipelines de TTS de producción: al ser un runtime de un solo fichero con dependencias mínimas (`numpy`, `onnxruntime`), se integra en servicios de síntesis de voz sin arrastrar stacks de ML completos.
- Normalización fonética para evaluación de ASR: los fonemas generados pueden usarse como referencia para comparar transcripciones o para puntuar la calidad de pronunciación de un sistema de reconocimiento de voz.
- Generación de datasets de pronunciación: el léxico y el modelo OOV permiten producir pares grafema-fonema de forma masiva para entrenar o evaluar otros sistemas G2P o TTS.
- Integración con `scriptconv`: el backend Leokani de scriptconv descarga estos ficheros en una revisión fija, de modo que cualquier aplicación que use esa librería obtiene fonemización inglesa reproducible.
- Lectura de nombres propios en aplicaciones de atención al cliente: la variante `mini` mejora la pronunciación de nombres y palabras raras, útil en saludos personalizados de asistentes de voz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio incluye `goldens.json`, que contiene la salida esperada de cada variante para su texto de prueba, lo que permite verificar regresiones funcionales, pero no constituye una evaluación comparativa de precisión G2P (por ejemplo, tasa de error de fonema o de palabra).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; por el tamaño del repositorio (0,0 GB en metadatos) y el uso de ONNX con `onnxruntime`, el consumo es muy bajo y cabe en CPU.
- GPU recomendadas: no se especifican; el sistema está diseñado para ejecutarse en CPU con `onnxruntime`. Cualquier GPU compatible con ONNX Runtime (por ejemplo, series RTX o A100/H100) podría acelerar la inferencia, pero no hay datos publicados.
- Cabe en cualquier GPU de consumo e incluso en entornos sin GPU; el cuello de botella es la CPU y la latencia de `onnxruntime`.
- Opciones de despliegue: runtime propio `leokani_g2p.py` con `numpy` y `onnxruntime`; los `.onnx` pueden ejecutarse con ONNX Runtime estándar. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Leokani G2P (micro/mini) | G2P hibrido lexico + ONNX | en | Lexico + OOV neuronal + contexto | CC BY 4.0 (pesos), MIT (codigo) | Hugging Face, GitHub |
| misaki | G2P para Kokoro | en y otros | Reglas y lexico | no disponible en esta ficha | Proyecto asociado a Kokoro |
| espeak-ng | G2P basado en reglas | Multiples | Reglas fonologicas | GPL | Ampliamente distribuido |
| Phonemizer (wrapper) | Interfaz a backends G2P | Multiples | Envuelve espeak, festival, etc. | Segun backend | PyPI |

No se dispone de datos comparativos de precisión entre Leokani G2P y estas alternativas en la información proporcionada. La comparativa se limita a enfoque, licencia y disponibilidad.

## Limitaciones y advertencias

- Solo soporta inglés, con referencia de inglés americano; no es adecuado para otros idiomas sin un modelo distinto.
- Es un componente G2P, no un TTS: no genera audio por sí mismo y requiere un motor acústico como Kokoro para producir voz.
- No se han publicado métricas de precisión (tasa de error de fonema o de palabra) ni benchmarks; la calidad debe validarse con `goldens.json` y pruebas propias.
- La variante `micro` puede fallar más en nombres propios y palabras raras; para esos casos se indica usar `mini`, con mayor coste.
- El repositorio es una copia de un tercero (Milliwatt Labs); la autoría y el mantenimiento corresponden al proyecto original, y la copia fija una revisión concreta.
- La licencia CC BY 4.0 exige atribución ("Leokani G2P by Milliwatt Labs (milliwattlabs.com)") para pesos, léxico y goldens; el código es MIT, pero conviene revisar `NOTICE` por créditos de terceros.
- Riesgo de alucinación en el sentido de pronunciaciones incorrectas en palabras OOV o ambiguas; el modelo de contexto mitiga homógrafos, pero no hay garantías publicadas.
- Sin datos publicados sobre sesgos dialectales más allá de la referencia americana; otras variedades del inglés pueden pronunciarse de forma no ideal.
- El tamaño del repositorio aparece como 0,0 GB en los metadatos, lo que puede reflejar un redondeo; conviene verificar el tamaño real de los ficheros ONNX antes de desplegar.

## Enlaces

- Hugging Face (copia): https://huggingface.co/TigreGotico/leokani-g2p
- Hugging Face (original): https://huggingface.co/milliwattlabs/leokani-g2p
- Codigo fuente en GitHub: https://github.com/Milliwatt-Labs/leokani-g2p
- Backend scriptconv: https://github.com/TigreGotico/scriptconv
- Sitio de Milliwatt Labs: https://milliwattlabs.com
