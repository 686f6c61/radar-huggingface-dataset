# yclicc/PsalmOMR-LFM2.5-VL-450M-GGUF

## Resumen

PsalmOMR · LFM2.5-VL-450M es un ajuste fino (fine-tune) del modelo visión-lenguaje LFM2.5-VL-450M de Liquid AI, publicado por el usuario yclicc, especializado en una única tarea: reconocimiento óptico de música (OMR) de cánticos anglicanos a cuatro voces tal y como se imprimen en psalters como *The Parish Psalter*. A partir de una fotografía, escaneo o captura de pantalla de un cántico, devuelve las cuatro voces (Soprano, Alto, Tenor, Bajo) en notación ABC editable, con clave, armadura, compás, alteraciones y línea de compositor cuando aparece impresa.

El modelo base es un VLM compacto: 354.483.968 parámetros reales según los safetensors del repositorio base (la nomenclatura comercial habla de 450M). El ajuste fino está entrenado de forma consciente de cuantización para Q4_0 de ggml, de modo que las capas lineales del decoder mantienen exactamente esos valores tanto en la build GGUF como en la build ONNX. El resultado son 219 MB de modelo de lenguaje + 189 MB de codificador de visión y proyector, es decir, algo más de 400 MB en total, lo que permite ejecutarlo en un teléfono o en el navegador.

Su relevancia es doble: por un lado, demuestra que un VLM de menos de 500M de parámetros puede resolver con precisión casi perfecta una tarea de digitalización musical muy específica (tasa de error de altura de 0,0008 sobre cánticos reales no vistos); por otro, es un ejemplo práctico de despliegue en el borde con llama.cpp, ONNX Runtime y Transformers.js, incluida una build específica para WebAssembly.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Visión-lenguaje (tag `lfm2_vl`): codificador de visión + proyector + decoder transformer; el detalle interno de capas y atención del modelo base no está disponible en la información proporcionada |
| Parámetros totales | 354.483.968 (según safetensors del modelo base); la denominación comercial indica 450M |
| Parámetros activos | No disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | GGUF: Q4_0 en las capas lineales del LM, embeddings Q6_K, `mmproj` en f16. ONNX: `vision_encoder_fp16`, `embed_tokens_fp16`, `decoder_model_merged_q4`. Variante `onnx_wasm` con `DequantizeLinear` + `MatMul` de 4 bits |
| Idiomas soportados | No disponible (el prompt de entrenamiento está en inglés) |
| Licencia | `lfm1.0` (`license: other`, `license_name: lfm1.0`, fichero LICENSE en el repo) |
| Formato de pesos | GGUF (llama.cpp), ONNX (Transformers.js / ONNX Runtime), safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo conserva la arquitectura del VLM base: un codificador de visión que procesa la imagen, un proyector que la alinea con el espacio del modelo de lenguaje y un decoder autorregresivo que genera la secuencia ABC. Las builds del repositorio reflejan esa separación (`vision_encoder`, `embed_tokens`, `decoder_model_merged`). El ajuste fino afecta tanto al codificador de visión como al proyector y al LM, según se indica explícitamente en la model card ("the vision encoder and projector, fine-tuned too").

El entrenamiento se realizó de forma consciente de cuantización para el formato Q4_0 de ggml: el modelo se entrenó con las capas lineales del LM en sus valores Q4_0 exactos, y ambas builds (GGUF y ONNX) reutilizan esos mismos pesos. Los datos incluyen cánticos anglicanos reales (recortes del *Parish Psalter*) y datos sintéticos generados con renderizadores; la evaluación distingue entre "renderizadores vistos en entrenamiento" y cánticos reales reservados (49 imágenes). El número total de tokens de entrenamiento, la composición exacta del dataset y el uso de RLHF/DPO no están disponibles en la información proporcionada.

## Capacidades

- Reconocimiento óptico de música (OMR) de cánticos anglicanos a cuatro voces en forma single (7 compases) y double (14 compases), en dos pentagramas con S+A en clave de sol y T+B en clave de fa.
- Salida en notación ABC con estructura fija: `X:1`, `C:` (compositor), `M:none`, `L:1/2`, `%%staves [(S A) (T B)]`, `K:` y las cuatro voces `V:S`, `V:A`, `V:T`, `V:B` con sus claves y octavas.
- Inferencia de tonalidad y modo a partir de la armadura y de la nota final del bajo (por ejemplo `K:Cm`).
- Escritura de alteraciones tal como aparecen impresas (`^` sostenido, `_` bemol, `=` becuadro).
- Notación rítmica relativa a `L:1/2`: `B2` semibreve, `B` blanca, `B/2` negra, `B>A` par con puntillo.
- Ignora el texto salmódico (pointed psalm text) que rodea a la música.
- Ejecución en navegador y en CPU: build ONNX para Transformers.js con WebGPU o WebAssembly.
- No es un chatbot: el ajuste fino restringe el modelo a esta tarea y otras preguntas obtienen respuestas pobres.

## Casos de uso

- Digitalización de archivos parroquiales y psalters: fotografiar cada cántico de un ejemplar impreso y obtener ABC editable para construir un corpus digital, con revisión humana de la línea de compositor.
- Re-editado y transporte para coros: el ABC resultante se abre en abcjs o EasyABC para mostrarlo, reproducirlo, transportarlo a otra tonalidad o re-editarlo tipográficamente sin volver a teclear las notas.
- Generación de audio de ensayo: a partir del ABC se sintetiza cada voz por separado (S, A, T, B) para que los integrantes del coro estudien su línea, algo viable porque el modelo separa explícitamente las cuatro voces.
- Aplicación móvil offline de apoyo al organista o al director: los 219 MB del GGUF Q4_0 más los 189 MB del `mmproj` f16 caben en un teléfono y se ejecutan con llama.cpp sin conexión.
- Herramienta web sin instalación: la build ONNX (583 MB) o la de WebAssembly (577 MB) permite transcribir una imagen subida al navegador con Transformers.js, sin enviar la partitura a un servidor.
- Investigación musicológica cuantitativa: convertir lotes de cánticos a ABC permite analizar estadísticamente armonizaciones, tesituras y movimientos de voces en un corpus que antes requería transcripción manual.
- Control de calidad editorial: comparar el ABC generado con la página impresa para detectar erratas de imprenta en ediciones antiguas, usando la tasa de error de altura de 0,0008 como referencia de fiabilidad en impresiones limpias.
- Accesibilidad: transformar una partitura fotografiada en notación textual que pueda leerse con lectores de pantalla o procesarse con herramientas de análisis armónico.

## Benchmarks y rendimiento

Resultados publicados en la model card, medidos al final del entrenamiento con las capas lineales del LM en sus valores Q4_0 exactos e imágenes redimensionadas como en entrenamiento:

| Suite | Imágenes | Exact match | Tasa de error de altura | Compositor correcto |
|---|---|---|---|---|
| Cánticos reales del *Parish Psalter*, reservados | 49 | 0,755 | 0,0008 | 0,755 |
| Los mismos, redimensionados como lo hace llama.cpp | 49 | 0,735 | 0,0008 | 0,735 |
| Sintéticos, renderizadores vistos en entrenamiento | 1000 | 0,96 | No disponible (dato truncado en la información) | No disponible (dato truncado en la información) |

"Exact match" exige que cada nota, ritmo, línea divisoria, tonalidad y línea de cabecera sea correcta, incluido el compositor. La tasa de error de altura es la distancia de edición sobre las alturas respecto al número de notas de referencia. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, y no tendrían sentido para esta especialización.

## Requisitos de hardware

- Huella de pesos: 219 MB (LM Q4_0) + 189 MB (`mmproj` f16) = ~408 MB en la ruta GGUF; 583 MB en la build ONNX estándar; 577 MB en la build `onnx_wasm`.
- VRAM estimada para inferencia: por debajo de 1 GB solo para pesos; en la práctica hay que sumar caché KV para hasta 1024 tokens nuevos y el procesamiento de imagen. Con estos componentes, el consumo se mantiene en el rango de 1-2 GB, aunque no se publican cifras oficiales de VRAM.
- Cabe en GPU de consumo: cualquier GPU con 2 GB o más (por ejemplo GTX 1650, RTX 3050, RTX 4060) y también en Apple Silicon vía Metal con llama.cpp.
- CPU y móvil: la model card indica explícitamente que es lo bastante pequeño para ejecutarse en un teléfono o en el navegador.
- Despliegue: `llama-mtmd-cli` / llama.cpp (ruta recomendada, requiere cargar el `mmproj` junto al GGUF); Transformers.js con `AutoModelForImageTextToText` y ONNX Runtime (WebGPU, o WebAssembly con `subfolder: "onnx_wasm"`). No se documenta soporte para vLLM ni TGI en la información disponible.
- Nota de memoria en WebAssembly: la ruta `onnx_wasm` es aproximadamente 8 veces más rápida por token que el `MatMulNBits` de 4 bits en CPU, a cambio de ~1,5 GB de memoria, porque ONNX Runtime expande los pesos a coma flotante al cargar.
- Latencia y throughput concretos: no disponibles. Solo se publica la comparación relativa 8x de la ruta WASM frente a la cuantización de 4 bits nativa en CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PsalmOMR · LFM2.5-VL-450M (este) | 354.483.968 | No disponible | OMR de cánticos anglicanos a ABC | `lfm1.0` | GGUF y ONNX en HuggingFace; 0 descargas, 0 likes |
| LiquidAI/LFM2.5-VL-450M (base) | ~450M (nominal) / 354.483.968 (safetensors) | No disponible | VLM conversacional general, imagen-texto | `lfm1.0` | Pesos originales en HuggingFace |
| Sistemas OMR clásicos (Audiveris, oemer) | No disponible en la información proporcionada | No disponible | OMR de partituras convencionales a MusicXML | No disponible en la información proporcionada | No evaluados aquí |

No se dispone de datos de benchmarks ni de especificaciones de alternativas OMR en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa con ellas. Frente al modelo base, la diferencia es funcional: el base es un VLM general y este ajuste fino está restringido a la transcripción de cánticos, con la contrapartida de que responde mal a cualquier otra petición.

## Limitaciones y advertencias

- Solo admite cánticos single y double (7 y 14 compases) en la forma estándar de cuatro voces y dos pentagramas. Los cánticos triple y quadruple no están soportados y no se transcribirán correctamente.
- Himnos, salmos métricos, canto llano y cualquier otra forma se fuerzan al esquema aprendido o salen mal: riesgo alto de alucinación estructural fuera de dominio.
- La línea de compositor es poco fiable: falla en aproximadamente una cuarta parte de las imágenes de cánticos reales reservados, frente a menos de 1 nota errónea por cada 1000. Hay que tratar `C:` como una suposición.
- Una sola imagen debe contener un solo cántico; hay que recortar a la música y descartar el texto salmódico circundante.
- Obligatorio redimensionar la imagen a un máximo de 1024 píxeles en su lado mayor: llama.cpp trocea imágenes mayores y el modelo solo se entrenó con imágenes completas sin trocear, con lo que una foto de móvil a resolución completa degrada mucho el resultado.
- El prompt debe usarse literalmente y la decodificación debe ser greedy (temperatura 0) con hasta 1024 tokens nuevos; desviarse de esta configuración no está validado.
- Rendimiento menor en impresiones borrosas, inclinadas o con poca luz; el resultado debe compararse con la página.
- No es un chatbot: el ajuste fino degrada deliberadamente cualquier capacidad conversacional general del modelo base.
- Licencia `lfm1.0` (Liquid AI): no es una licencia de código abierto tipo OSI. Los términos exactos de uso comercial no están disponibles en la información proporcionada y deben consultarse en el fichero LICENSE antes de un despliegue en producción.
- Idiomas soportados no documentados; el prompt y los datos de entrenamiento están en inglés.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validación independiente por parte de la comunidad.
- No se documentan sesgos específicos más allá de la restricción de dominio descrita.

## Enlaces

- Repositorio del modelo: https://huggingface.co/yclicc/PsalmOMR-LFM2.5-VL-450M-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-VL-450M
- Notación ABC: https://abcnotation.com/
- Editor abcjs: https://editor.drawthedots.com/
- EasyABC: https://easyabc.sourceforge.net/
- Documentación de Transformers.js: https://huggingface.co/docs/transformers.js
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Resultados de búsqueda web: no se ha encontrado ningún enlace relevante al modelo; las búsquedas devolvieron únicamente páginas de un canal de televisión francés, sin relación con el modelo.
