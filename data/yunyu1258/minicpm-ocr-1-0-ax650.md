# yunyu1258/minicpm-ocr-1.0-ax650

## Resumen

MiniCPM-OCR 1.0 AX650 es un paquete de despliegue del modelo de visión-lenguaje openbmb/MiniCPM-OCR-1.0 (1.300 millones de parámetros, orientado a OCR y parseo de documentos) convertido para ejecutarse sobre NPU de la familia AX8850 de AXERA (placas AX650N/AX650C, objetivo de compilación Pulsar2 `AX650`). Lo publica el usuario yunyu1258 como conversión comunitaria, no oficial ni de AXERA ni de OpenBMB, y se distribuye con licencia Apache-2.0.

El paquete incluye los pesos compilados en formato `.axmodel` (24 capas del LLM Qwen3.5-hybrid, encoder de visión 448×448 en U16, embedding bf16 y, opcionalmente, un detector de layout DocLayout-YOLO), además del runtime `axllm` de AXERA, que expone un servidor HTTP compatible con la API de OpenAI (`/v1/chat/completions`). El objetivo es permitir inferencia OCR local en placa sin GPU, con un consumo de memoria contenido (unos 2,73 GB en disco y 2.130 MB de CMM libre tras la carga).

Su relevancia práctica radica en que demuestra que un VLM de 1.3B puede ejecutarse en NPU de bajo consumo con calidad de texto equiparable a la referencia en FP: la comparación contra el modelo original da similitud de caracteres 1.0 en bloques de tabla y el encoder de visión en U16 alcanza coseno 0.9953 frente al ONNX de referencia. La contrapartida es el rendimiento: unos 11,6 tok/s de decodificación y entre 12 y 22 segundos por bloque OCR de 448×448 en AX8850.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLM OCR: LLM Qwen3.5-hybrid de 24 capas + encoder de visión (448×448 → 256 tokens de imagen), compilado a `.axmodel` para NPU AX650 |
| Parametros totales | 1.300 millones (modelo base MiniCPM-OCR-1.0) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 2048 tokens (config axllm; prefill bucket 1152) |
| Tipos de cuantizacion | Pesos del LLM en axmodel compilado (precisión de pesos no detallada); activaciones del encoder de visión en U16 obligatoriamente; INT8 descartado por pérdida de calidad (coseno 0.311) |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 (pesos convertidos); modelo base Apache-2.0; runtime axllm BSD-3-Clause |
| Formato de pesos | `.axmodel` (NPU AX650), embedding en bf16 (`.bin`), tokenizer en txt exportado de HF |

## Arquitectura y entrenamiento

El paquete es una conversión, no un reentrenamiento: hereda la arquitectura del modelo base openbmb/MiniCPM-OCR-1.0, un VLM de 1.3B con un LLM de 24 capas descrito como Qwen3.5-hybrid y un encoder de visión que procesa parches de 448×448 y produce 256 embeddings de imagen de dimensión 1024. El pipeline de visión replica el `MiniCPMOcrImageProcessor` oficial con `scale_resolution=448`, `max_slice_nums=9`, `patch_size=14` y `downsample_mode=4x`; una página real de 2000×3083 se divide en 9 slices (una global de 364×560 y ocho de 504×392), lo que suma 2276 image tokens y 9104 parches, con una diferencia de 0 px por slice respecto al procesador oficial.

La conversión se realizó con Pulsar2 6.0. Un hallazgo técnico destacado es que el encoder de visión debe compilarse con activaciones U16: con INT8 el modelo "no ve la imagen" (coseno 0.311 frente al ONNX de referencia), mientras que U16 alcanza 0.9953 en placa. Además, Pulsar2 7.0 y 8.0 fallan con un crash nativo en la fase `build op serially` al compilar el grafo completo en U16. El paquete incluye un detector de layout DocLayout-YOLO opcional (1024×1024, U16) que en placa tarda 212 ms y coincide con el ONNX de referencia (coseno 0.999999 en cajas y 0.99995 en logits). No se dispone de información sobre el dataset de entrenamiento del modelo base ni sobre si hubo RLHF/DPO.

## Capacidades

- Reconocimiento de texto en imágenes y documentos, con prompts específicos para texto, tablas y fórmulas.
- Parseo de documentos con múltiples modos de servicio: `auto`, `table` (tablas grandes divididas por filas y fusionadas), `layout` (detección de regiones con DocLayout-YOLO y orden de lectura), `page` (rejilla de 9 slices), `wide` (bloques de texto anchos) y `region` (bloque único).
- Detección de estructura de página mediante el modelo auxiliar DocLayout-YOLO incluido en el paquete.
- Salida en streaming mediante SSE compatible con OpenAI (`stream: true`), con tiempo hasta el primer token de 2,1 s en tablas y 0,56 s en diálogo de texto.
- Interfaz HTTP compatible con OpenAI (`POST /v1/chat/completions`) con imágenes enviadas como data URI.
- Capacidad multilingüe limitada a inglés y chino.
- No se documentan tool calling, function calling, modo thinking, audio ni capacidades de agente multi-paso.

## Casos de uso

- Digitalización de facturas y albaranes en placa: el modo `table` divide tablas grandes por filas y fusiona los resultados, lo que permite extraer líneas de detalle con una precisión de dígitos verificada (12/12 en la comparación con la referencia HF) sin depender de la nube.
- Procesamiento de documentos escaneados por lotes en dispositivos empotrados: el modo `layout` detecta regiones con DocLayout-YOLO (212 ms por página de 1024×1024) y aplica el prompt adecuado a cada tipo de región, con un coste medido de 19,8 s por página de 6 regiones en AX8850.
- Extracción de fórmulas y texto técnico: los prompts específicos de fórmula del procesador oficial permiten recuperar expresiones matemáticas en documentos científicos, aunque con la latencia de decodificación de unos 10 tok/s.
- Servicio OCR local con API compatible con OpenAI: al exponer `/v1/chat/completions`, se puede integrar como backend en herramientas que ya hablan el protocolo de OpenAI sin cambiar el cliente, sustituyendo llamadas a la nube por inferencia en placa.
- Digitalización de documentos en entornos sin conectividad o con requisitos de privacidad: al ejecutarse íntegramente en la NPU local, los documentos no salen del dispositivo, lo que encaja en sectores con restricciones de tratamiento de datos.
- Prototipado y evaluación de pipelines OCR en hardware AXERA: el paquete incluye scripts de evaluación sobre OmniDocBench y comparaciones contra la referencia HF, útil para validar la calidad antes de desplegar en producción.
- Interfaz web de demostración: el repositorio incluye una página estilo M5Stack con botones de ejemplo de tabla y página de documento y visualización de TTFT, útil para demos y validación de usuarios.

## Benchmarks y rendimiento

Mediciones publicadas en la model card, todas sobre AX8850 (8 núcleos, 3,8 GB DDR, CMM 4096 MB):

| Prueba | Resultado |
|---|---|
| Bloque de tabla 448×448 (277 prompt / 237 tokens) | 12,2–22 s, decodificación ≈10 tok/s |
| Codificación visual 448×448 → 256 tokens | 615 ms (axmodel U16) |
| Detección de layout DocLayout-YOLO 1024×1024 | 212 ms (U16) |
| Modo layout, página completa PPT (6 regiones) | 19,8 s/página |
| Texto "1+1" | 0,6 s |
| Modo page, rejilla de 9 slices (2276 tokens) | ≈2,5 min/página |
| Coseno del encoder de visión U16 vs ONNX | 0,9953 en placa |
| Coseno del encoder de visión INT8 vs ONNX | 0,311 (no utilizable) |
| Similitud de caracteres OCR vs referencia HF (bloque de tabla) | 1,0; precisión de dígitos 12/12 |
| Throughput de texto | 0,55 req/s (1,82 s por petición) |
| Throughput OCR por bloque | 0,082 req/s (12,2 s por bloque) |

Evaluación sobre OmniDocBench (muestra estratificada de 12 páginas, solo distancia de edición de texto):

| Modo | Distancia de edición media (menor es mejor) | Tiempo medio |
|---|---|---|
| page (rejilla de 9 slices, prompt único, sin modelo de layout) | 0,7346 | 91,8 s/página |
| oracle (cajas GT de layout + prompt por tipo, cota superior) | 0,4742 | 99,2 s/página |

La propia model card advierte que estas cifras no son comparables con el Overall oficial de OmniDocBench, que incluye TableTEDS y FormulaCDM. Las proyecciones para AX8860 (45 tok/s a 136 GB/s, 90 tok/s en AX8860P) son estimaciones del autor, no medidas.

## Requisitos de hardware

- NPU AXERA de la familia AX8850 (AX650N/AX650C) con runtime `axllm`; el paquete ocupa 2,73 GB en disco (37 archivos) y deja 2.130 MB de CMM libres tras la carga.
- Memoria: entorno de referencia con 3,8 GB de DDR y CMM de 4096 MB.
- GPU: no aplica; el modelo no se ejecuta en CUDA. No se proporcionan pesos GGUF ni safetensors en este repositorio, por lo que no hay despliegue directo en vLLM, llama.cpp, Ollama o TGI para esta conversión.
- Despliegue: `./bin/axllm serve . --port 18081` con `LD_LIBRARY_PATH` apuntando a las librerías del sistema y del paquete; cliente de ejemplo `client_ocr.py` y script `run.sh`.
- Latencia y throughput: decodificación de 11,6 tok/s limitada por el ancho de banda LPDDR4x de ≈34 GB/s (cada token requiere leer unos 1,6 GB de pesos); concurrencia máxima de 1 petición con cola.
- El cuello de botella es de memoria, no de cómputo: el autor estima que con LPDDR5X de 136 GB/s se alcanzarían ≈45 tok/s y con 273 GB/s ≈90 tok/s, y con pesos INT4/FP4 sobre 136 GB/s ≈85–95 tok/s.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| MiniCPM-OCR 1.0 AX650 (esta conversión) | 1,3 B | 2048 | Apache-2.0 | Paquete `.axmodel` para NPU AX650 | Solo placas AXERA; 11,6 tok/s en AX8850 |
| openbmb/MiniCPM-OCR-1.0 | 1,3 B | no disponible | Apache-2.0 | Pesos HF (formato original) | Modelo base; referencia de calidad y de procesador de imagen |
| Alternativas OCR/VLM de tamaño similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos verificados en la información proporcionada |

## Limitaciones y advertencias

- Conversión comunitaria: no está publicada ni validada por AXERA ni por OpenBMB; el autor lo indica explícitamente.
- Solo inglés y chino; no se documenta soporte de otros idiomas.
- Contexto limitado a 2048 tokens, insuficiente para páginas completas sin segmentación (una página de 9 slices consume 2276 image tokens).
- El encoder de visión debe compilarse en U16 con Pulsar2 6.0; con INT8 el modelo no reconoce imágenes y con Pulsar2 7.0/8.0 la compilación en U16 provoca un crash nativo.
- El modo `page` aplicado a capturas de tabla corta la tabla por columnas y desordena la salida; hay que usar `auto` o `table`.
- Riesgo de alucinación en la slice global de baja resolución; el autor recomienda omitirla en modo página.
- Concurrencia máxima de 1: las peticiones se encolan, lo que limita el uso en servicios multiusuario.
- Rendimiento bajo en AX8850 (12–22 s por bloque OCR, ≈2,5 min por página en modo page); las cifras de AX8860 son proyecciones no verificadas.
- Restricciones de licencia: los pesos convertidos son Apache-2.0, pero el uso debe respetar la licencia y condiciones del modelo base; el runtime `axllm` es BSD-3-Clause y su redistribución requiere mantener el aviso correspondiente (`NOTICE`).
- No se han publicado resultados de benchmarks comparativos con otros modelos OCR en la información disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/yunyu1258/minicpm-ocr-1.0-ax650
- Modelo base: https://huggingface.co/openbmb/MiniCPM-OCR-1.0
- Código de conversión, servicio y evaluación: https://github.com/yuyun2000/minicpm-ocr-ax650
- Documentación de precisión y compilación: `docs/accuracy.md` en el repositorio de GitHub
- Proyecciones AX8860: `docs/ax8860-outlook.md` en el repositorio de GitHub
