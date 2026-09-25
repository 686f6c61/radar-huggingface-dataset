# ToTo-40417/EXLLM

## Resumen

EXLLM-0.005B-Instruct es un modelo de instrucciones en japonés de 5.377.824 parámetros (notación del autor: 0,005377824 B) desarrollado por el usuario ToTo-40417. Se trata de un transformer decoder-only de arquitectura propia, entrenado desde inicialización aleatoria sin ningún checkpoint preentrenado externo y sin corpus público importado: el único material de entrenamiento son datos de instrucción/respuesta en japonés generados dentro del propio proyecto. Su objetivo declarado no es competir con modelos generalistas, sino ejecutar inferencia local en hardware embebido con memoria ultralimitada, con el diccionario electrónico CASIO EX-word XD-B4800 como destino principal de despliegue.

La relevancia del modelo está en su extrema frugalidad: el checkpoint fp32 ocupa 0,021526737 GB (unos 21,5 MB), los artefactos int8/EXQ12 bajan a 0,005443105 GB (unos 5,4 MB) y el runtime entero cabe en 0,00786432 GB (unos 7,9 MB) de heap contiguo en un SoC SH-4A de un solo núcleo a 0,024184 GHz. La contrapartida es un alcance muy acotado: contexto de 128 tokens, vocabulario de 868 tokens con fallback a bytes UTF-8 y licencia Apache-2.0.

El modelo no es compatible con las clases auto de `transformers`, con GGUF, llama.cpp ni LM Studio sin una implementación específica de su arquitectura; el repositorio incluye un runtime de referencia en PyTorch para inferencia y evaluación en host.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso con implementación propia (no compatible con `transformers` auto classes) |
| Parámetros totales | 5.377.824 (0,005377824 B según el autor); embedding y cabeza LM comparten tensor (*weight tying*) |
| Parámetros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | 128 tokens (0,000128 M tokens según el autor) |
| Tipos de cuantización | fp32 (referencia); int8 para pesos con activaciones Q12 (artefacto de despliegue EXQ12). No se documentan GGUF, GPTQ, AWQ ni FP8 |
| Idiomas soportados | Japonés (ja) |
| Licencia | Apache-2.0 |
| Formato de pesos | Checkpoints PyTorch propios (fp32, 0,021526737 GB) y artefactos int8 / EXQ12 (0,005443105 GB). No se publica safetensors ni GGUF |
| Capas | 6 |
| Dimensión oculta | 288 |
| Cabezas de atención | 9 |
| Dimensión por cabeza | 32 |
| Tamaño de la FFN | 896 |
| Activación | ReLU |
| Normalización | Pre-norm RMSNorm, épsilon 1e-5 |
| Codificación posicional | Embedding absoluto aprendido |
| Vocabulario | 868 tokens (0,000868 M) |
| Tokenizador | Caracteres japoneses frecuentes + fallback a bytes UTF-8, normalización NFC |
| Paso global del checkpoint | 1.810 |
| Tamaño del repositorio | 0,0 GB (según HuggingFace) |
| Descargas / likes | 0 / 0 |
| Fecha de creación / actualización | 2026-09-24 / 2026-09-24 |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de diseño propio, con 6 capas, dimensión oculta 288, 9 cabezas de atención de 32 dimensiones cada una y FFN de 896 unidades con activación ReLU. Usa pre-norm RMSNorm con épsilon 1e-5, embeddings posicionales absolutos aprendidos y cabeza de lenguaje atada al embedding de tokens. El tokenizador es híbrido: cubre caracteres japoneses frecuentes y recurre a un fallback de bytes UTF-8 con normalización NFC, lo que permite representar cualquier entrada a costa de secuencias más largas. Según el autor, esta combinación no encaja en las clases auto de `transformers` ni en formatos GGUF, por lo que requiere código específico de arquitectura.

El entrenamiento parte de inicialización aleatoria: no se usó checkpoint preentrenado externo ni corpus público importado. El release de 0,005 B se obtuvo expandiendo un checkpoint EXLLM anterior del mismo proyecto mediante trasplante de parámetros compatibles en dimensión, seguido de entrenamiento por etapas y un ajuste fino correctivo. Se publican 86.408 registros JSONL (0,086408 M) que incluyen conjuntos solapados de base, robustez, recuperación y corrección; el propio autor advierte que esa cifra es un total de registros de fichero, no un recuento deduplicado de ejemplos. El optimizador es AdamW con learning rate base 5e-4, betas 0,9/0,95, weight decay 0,03, gradient clipping 1,0 y schedule de warm-up lineal más decaimiento coseno, hasta el paso global 1.810; la etapa correctiva final ejecutó 100 pasos a 6e-6 y redujo la pérdida de 0,03875 a 0,02420. No se conservó telemetría de tiempo total de entrenamiento ni de dispositivo de entrenamiento, por lo que no se reportan.

## Capacidades

- Generación de texto e instrucciones en japonés dentro de un contexto máximo de 128 tokens, orientada a respuestas cortas.
- Enrutado determinista a calculadora: la suite interna reporta 300/300 aciertos en este comportamiento, lo que indica una integración deliberada con funciones de cálculo del dispositivo anfitrión.
- Modo "Thinking" invocable y desactivable (la medición en EX-word se realizó con Thinking desactivado).
- Tokenizador híbrido carácter/byte UTF-8 con normalización NFC, capaz de procesar entradas japonesas fuera del vocabulario base sin tokens desconocidos.
- Inferencia en dos formatos numéricos: fp32 en GPU y int8/Q12 en el runtime entero del dispositivo embebido.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes, planificación ni razonamiento multi-paso.
- No se documentan capacidades de visión, audio ni multimodalidad.
- No hay soporte multilingüe: el único idioma declarado es el japonés.
- No se documenta *thinking mode* extendido con cadenas de razonamiento largas más allá de la marca "Thinking" mencionada en la metodología.
- No es compatible con el ecosistema estándar (`transformers`, GGUF, llama.cpp, LM Studio) sin implementación específica.

## Casos de uso

- Diccionario electrónico embebido: es el caso de uso primario declarado; el modelo se almacena en el almacenamiento interno de un CASIO EX-word XD-B4800 y responde consultas cortas en japonés con un heap contiguo verificado de 0,00786432 GB.
- Enrutado determinista a calculadora en firmware: con 300/300 aciertos en la suite interna, puede decidir cuándo una consulta debe resolverse mediante la calculadora del dispositivo en lugar de generar texto.
- Asistente offline en dispositivos sin conectividad: al ocupar unos 5,4 MB en int8/Q12, puede residir permanentemente en memoria de un dispositivo de bajo consumo y ejecutarse a 0,52–0,55 token/s sin acceso a red.
- Suites de regresión y fuzzing para runtimes de inferencia propios: el modelo sirve como carga de trabajo mínima y reproducible (200/200 en fuzz prompts, 48/48 en comprobaciones de muestreo) para validar un motor de inferencia nuevo antes de portar modelos mayores.
- Banco de pruebas de tokenizadores carácter/byte UTF-8 para japonés: su vocabulario de 868 tokens con fallback de bytes permite estudiar cobertura, longitud de secuencia y normalización NFC en un entorno con recursos mínimos.
- Investigación sobre entrenamiento desde cero sin checkpoint preentrenado: el linaje documentado (inicialización aleatoria, trasplante de parámetros entre releases, currículo por etapas y corrección final) es un caso reproducible de estudio de decisiones de entrenamiento en modelos diminutos.
- Integración en electrodomésticos, mandos o equipos de instrumentación con MCU/SoC de gama muy baja y requisitos de memoria en la escala de megabytes.
- Evaluación host-side con GPU para validar respuestas antes de compilar el artefacto embebido, usando `chat.py` y el runtime de referencia PyTorch.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor indica explícitamente que su suite es de regresión interna del proyecto y que no debe interpretarse como evidencia de conocimiento general, razonamiento amplio ni comparabilidad con modelos mayores.

Suite interna de evaluación (tras dequantizar el artefacto EXLLM8 al runtime de referencia):

| Suite | Resultado |
|---|---|
| Comportamiento semántico | 35 / 35 |
| Enrutado determinista a calculadora | 300 / 300 |
| Prompts de fuzzing | 200 / 200 |
| Comprobaciones de muestreo | 48 / 48 |
| Release gate | PASS |

Rendimiento de inferencia medido por el autor (decodificación greedy; TTFT = tiempo hasta el primer token; el throughput de decodificación excluye el primer token):

| Runtime | Cómputo | Formato | Memoria | Carga | TTFT | Throughput de decodificación |
|---|---|---|---|---|---|---|
| PyTorch 2.11.0+cu130 | RTX 3060, 12 GB VRAM | fp32 | 0,0307584 GB de pico asignado | 0,4645 s | 0,003990 s | 239,082 token/s |
| Runtime entero de EX-word | SH-4A, 1C/1T, 0,024184 GHz | pesos int8 / activaciones Q12 | 0,00786432 GB de heap contiguo verificado | almacenamiento del dispositivo | 23,711 s | 0,52–0,55 token/s |

Metodología RTX 3060: driver 580.178.04, Python 3.12.13, CUDA 13.0; 40 inferencias de calentamiento y 120 medidas; TTFT mediano 0,003990 s con rango observado 0,003913–0,004072 s; tiempo total de generación mediano 0,079589 s; el filtrado Tukey 1,5 IQR no descartó ninguna de las 120 observaciones; la primera inferencia en frío registró 0,193056 s de TTFT. Los resultados por ejecución se publican en `benchmarks/rtx3060-cuda-robust-20260925.json`.

Metodología EX-word: CASIO EX-word XD-B4800 / DATAPLUS 6, CPU de la familia SH7305 (SH-4A) con 1 núcleo y 1 hilo a 0,024184 GHz de reloj de instrucciones medido; cinco prompts con Thinking desactivado y el modelo en almacenamiento interno; se incluye el renderizado de la interfaz de aplicación y el manejo de visualización UTF-8; TTFT mediano 23,711 s con rango 12,705–28,440 s y tiempo total de generación mediano 54,145 s. El autor advierte que ambas cifras son mediciones de despliegue y no una comparación directa de cómputo entre hardwares.

## Requisitos de hardware

- VRAM para inferencia en fp32: el checkpoint pesa 0,021526737 GB y el pico asignado medido en RTX 3060 fp32 es de 0,0307584 GB (unos 30,8 MB), por lo que cualquier GPU con 1 GB o más es sobradamente suficiente.
- VRAM para inferencia en int8/Q12: artefacto de 0,005443105 GB (unos 5,4 MB); en el dispositivo embebido el heap verificado es de 0,00786432 GB.
- GPU recomendadas: no requiere aceleradores de gama alta. La única GPU validada en la documentación es una RTX 3060 de 12 GB; cualquier GPU NVIDIA con soporte CUDA 13.0 y PyTorch 2.11.0+cu130 debería servir. No se reportan pruebas en A100, H100 ni otras GPU de centro de datos.
- Cabe en GPU de consumo: sí, en la práctica en cualquier GPU de consumo e incluso en iGPU o CPU, dado el tamaño del modelo. El cuello de botella real es el software, no el hardware.
- Opciones de despliegue: únicamente el runtime de referencia en PyTorch incluido en el repositorio (`chat.py`, `src/loader.py`, `src/runtime.py`) y el runtime entero propio del dispositivo EX-word. No hay soporte de vLLM, llama.cpp, Ollama, TGI ni LM Studio, y el autor indica incompatibilidad explícita con GGUF.
- Latencia y throughput: 239,082 token/s de decodificación y 3,99 ms de TTFT en RTX 3060 fp32; 0,52–0,55 token/s de decodificación y 23,711 s de TTFT medianos en el runtime entero sobre SH-4A.
- Almacenamiento: el repositorio ocupa 0,0 GB según HuggingFace, coherente con un checkpoint de decenas de megabytes.

## Comparativa con modelos similares

No disponible. En la información proporcionada no se incluyen modelos comparables de la misma categoría (modelos japoneses de instrucciones en el rango de 5 millones de parámetros para hardware embebido), ni resultados de benchmarks estándar que permitan confrontar EXLLM con alternativas. Los resultados de la búsqueda web asociados a esta ficha no contienen información sobre el modelo ni sobre modelos comparables: corresponden a entidades homónimas sin relación (el grupo musical Toto, la marca de sanitarios TOTO y comercios de tejidos).

Como referencia de escala, cabe señalar que un transformer denso de 5,38 M de parámetros y 6 capas es entre dos y tres órdenes de magnitud menor que los modelos pequeños de uso común, y que su contexto de 128 tokens y su vocabulario de 868 tokens lo sitúan en una categoría de despliegue distinta, orientada a firmware y no a servidores.

## Limitaciones y advertencias

- Contexto de solo 128 tokens: cualquier conversación multi-turno o documento de entrada mínimamente largo excede la ventana. No es apto para diálogo prolongado sin truncado agresivo.
- Vocabulario de 868 tokens con fallback a bytes UTF-8: la tokenización de texto japonés habitual será muy ineficiente en número de tokens, lo que reduce aún más el contenido útil dentro de la ventana.
- Monolingüe: solo japonés. No hay evidencia de competencia en otros idiomas.
- Riesgo de alucinación elevado fuera de su dominio: el modelo se entrenó exclusivamente con datos generados por el proyecto, sin corpus público, por lo que su conocimiento del mundo es intrínsecamente limitado y no debe usarse como fuente factual.
- Ausencia de benchmarks estándar: las cifras publicadas (35/35, 300/300, 200/200, 48/48, release gate PASS) son pruebas de regresión internas del alcance previsto y no permiten inferir conocimiento general ni razonamiento.
- Sesgos no evaluados: no se documenta ningún análisis de sesgos, toxicidad o seguridad más allá de las pruebas de robustez internas.
- Trazabilidad de datos parcial: se publican 86.408 registros JSONL con conjuntos solapados (base, robustez, recuperación, corrección) y el autor aclara que no es un recuento deduplicado; tampoco se conservó telemetría de tiempo ni de dispositivo de entrenamiento, lo que dificulta la reproducibilidad completa.
- Integración restringida: incompatible con `transformers` auto classes, GGUF, llama.cpp y LM Studio sin implementación específica; no existen adaptadores estándar de cuantización. Esto limita su uso a entornos capaces de ejecutar el runtime propio.
- Licencia Apache-2.0: permite uso comercial, modificación y redistribución con atribución y conservación del aviso de licencia; no impone restricciones adicionales, pero tampoco hay garantías por parte del autor.
- Validación comunitaria nula: 0 descargas y 0 likes en el momento de los datos, sin revisiones independientes ni reproducciones externas.
- Metadatos con fechas de 2026-09-24 (creación y actualización) y referencias a versiones futuras del stack (PyTorch 2.11.0+cu130, CUDA 13.0, driver 580.178.04): conviene verificarlas antes de citar el modelo en producción.
- Estado de artefactos: el tamaño del repositorio figura como 0,0 GB, y el fragmento de la model card disponible se corta durante el ejemplo de uso en Python; algunos detalles operativos no pueden confirmarse con la información disponible.

## Enlaces

- HuggingFace: https://huggingface.co/ToTo-40417/EXLLM
- Documentación de procedencia de datos citada en la model card: `DATA_PROVENANCE.md` (dentro del repositorio)
- Metadatos de release en formato legible por máquina: `training/release-5m.json` (dentro del repositorio)
- Resultados crudos del benchmark en RTX 3060: `benchmarks/rtx3060-cuda-robust-20260925.json` (dentro del repositorio)
- Explicación en japonés: sección `#日本語` de la model card
- Resultados de búsqueda web: no se encontró ninguna fuente relevante sobre el modelo. Los resultados devueltos corresponden a entidades homónimas sin relación (https://en.wikipedia.org/wiki/Toto_(band), https://eu.toto.com/fr/produits, https://www.toto.fr/). No se dispone de paper, blog técnico, repositorio independiente ni demo asociados a EXLLM en la información proporcionada.
