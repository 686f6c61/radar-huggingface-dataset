# tifa613/itqan-muaalem-mini-onnx

## Resumen

Itqan Muaalem Mini ONNX es una exportación a ONNX con cuantización de pesos a 4 bits del modelo `sysofwan/hifzguide-muaalem-mini`, un estudiante destilado de `obadx/muaalem-model-v3_2`. El modelo realiza reconocimiento automático de fonemas sobre recitación coránica en árabe, con el objetivo de detectar errores de tajweed (reglas de recitación) en el dispositivo del usuario. Lo mantiene el proyecto Itqan, que lo integra en su aplicación de recitación mediante `onnxruntime-web`.

La relevancia de esta variante radica en su tamaño reducido (aproximadamente 133 MB) y en su capacidad de ejecutarse íntegramente en el navegador a través de WebGPU o WASM, sin necesidad de enviar audio a un servidor. Esto permite validación de tajweed con baja latencia y privacidad por diseño. La arquitectura subyacente proviene de `facebook/w2v-bert-2.0`, adaptada a una cabeza CTC de 43 clases de fonemas.

El modelo está pensado exclusivamente para árabe coránico y para ventanas de audio cortas (5 segundos); su rendimiento se degrada notablemente con entradas más largas, por lo que requiere un pipeline de ventaneo con solapamiento y mezcla de log-probabilidades.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | W2V-BERT 2.0 (encoder transformer) con cabeza CTC de fonemas; exportado a ONNX (opset 17, longitud dinámica) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventanas de 250 frames de features (aproximadamente 5 s de audio), con hop de 200 frames |
| Tipos de cuantizacion | MatMulNBits 4 bits, block size 32, simétrico; resto de pesos en fp32 |
| Idiomas soportados | árabe (recitación coránica) |
| Licencia | AGPL-3.0 (pesos); uso no comercial por provenance del dataset de entrenamiento (CC BY-NC 4.0) |
| Formato de pesos | ONNX (`mini_int4.onnx`, aproximadamente 133 MB) |

## Arquitectura y entrenamiento

El modelo base es un destilado de `obadx/muaalem-model-v3_2`, que a su vez deriva de la arquitectura `facebook/w2v-bert-2.0`. La entrada son features SeamlessM4T (80 bins mel, stride 2) a 16 kHz, con forma `(1, frames, 160)`. La salida es un log-softmax sobre 43 clases de fonemas, con el id 0 reservado como blank de CTC. La decodificación es greedy.

El entrenamiento original se realizó sobre el dataset `FaisaI/tadabur` (CC BY-NC 4.0), y el estudiante se destiló a partir del modelo profesor. Esta exportación concreta no reentrena pesos: envuelve el modelo para emitir log-softmax solo sobre la cabeza de fonemas, lo exporta a ONNX y cuantiza los pesos de las MatMul a 4 bits. La ventana de entrenamiento del estudiante fue de 5 segundos, lo que explica su degradación con segmentos más largos.

## Capacidades

- Reconocimiento de fonemas árabes coránicos mediante CTC sobre 43 clases.
- Detección de errores de tajweed a partir de la alineación de fonemas.
- Ejecución en navegador con `onnxruntime-web` (backends WebGPU y WASM).
- Inferencia en dispositivo con cuantización int4, sin dependencia de servidor.
- Procesamiento por ventanas con solapamiento y mezcla de log-probabilidades.
- Salida de log-probabilidades por frame, apta para decodificación greedy y post-procesado propio.

## Casos de uso

- Aplicación de recitación coránica en navegador: integrar el modelo con `onnxruntime-web` para validar tajweed localmente mientras el usuario recita, manteniendo el audio en el dispositivo.
- Corrección de pronunciación en tiempo casi real: procesar ventanas de 5 segundos con hop de 200 frames y mezclar salidas para señalar fonemas desviados.
- Herramientas educativas offline: empaquetar el ONNX de 133 MB en una PWA para uso sin conexión en madrasas o entornos con conectividad limitada.
- Evaluación automática de recitaciones grabadas: alinear la salida de fonemas con el texto esperado para generar informes de errores por palabra.
- Investigación en fonética árabe: usar las log-probabilidades por frame como features para estudios de duración y articulación de fonemas coránicos.
- Prototipado de pipelines CTC: servir como referencia ligera para experimentar con decodificación, ventaneo y mezcla de logits antes de escalar a modelos mayores.

## Benchmarks y rendimiento

Evaluación sobre 92 recitaciones (46 ayat de Mishary Alafasy y Mahmoud Khalil Al-Husary, de EveryAyah), 644 palabras. Al ser recitadores expertos, toda marca de tajweed se considera falsa alarma. No mide la tasa de detección de errores reales.

| Modelo | Tamano | Palabras con marca de tajweed | Concordancia de fonemas con el modelo completo | Tiempo de CPU |
|---|---|---|---|---|
| `obadx/muaalem-model-v3_2`, int4 | 427 MB | 5 | (referencia) | 1.637 s |
| Este modelo, por ventanas | 133 MB | 7 | 98,6% | 415 s |
| Este modelo, segmentos completos | 133 MB | 84 | 93,1% | 314 s |

Verificación de la exportación: el export fp32 coincide con PyTorch en 250, 400 y 2.595 frames (diferencia máxima 0,0000; mismo mejor fonema en el 100% de frames). El archivo int4 elige el mismo mejor fonema que PyTorch en el 100%, 99,0% y 99,5% de frames en esas longitudes. En navegador (`onnxruntime-web` 1.22), WebGPU y WASM dieron fonemas idénticos en cinco clips de prueba.

## Requisitos de hardware

- VRAM estimada: el archivo int4 ocupa aproximadamente 133 MB; la inferencia en GPU requiere un margen adicional para activaciones, del orden de unos cientos de MB.
- GPU recomendadas: cualquier GPU integrada o dedicada con soporte WebGPU para ejecución en navegador; en servidor, GPUs modestas son suficientes dado el tamaño.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna; también en CPU mediante el backend WASM.
- Opciones de despliegue: `onnxruntime-web` (WebGPU y WASM) para navegador; `onnxruntime` en Python/C++ para servidor o escritorio.
- Latencia y throughput: en la evaluación, 415 s de CPU para 92 recitaciones con ventaneo (frente a 1.637 s del modelo completo int4); no se publican cifras de latencia por ventana ni throughput en GPU.

## Comparativa con modelos similares

| Modelo | Tamano | Contexto / ventana | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este modelo (int4 ONNX) | 133 MB | ventanas de 5 s | AGPL-3.0 | Hugging Face | 7 falsas alarmas en la evaluación; 98,6% de concordancia |
| `obadx/muaalem-model-v3_2`, int4 | 427 MB | no disponible | no disponible en la informacion | Hugging Face | 5 falsas alarmas; referencia de concordancia |
| `sysofwan/hifzguide-muaalem-mini` | no disponible | ventanas de 5 s (entrenamiento) | no disponible en la informacion | Hugging Face | Modelo estudiante original del que deriva esta exportación |

## Limitaciones y advertencias

- Solo árabe coránico; no es un ASR general ni soporta otros idiomas.
- Degrada con entradas largas: usar segmentos completos elevó las falsas alarmas de 7 a 84 en la evaluación; es obligatorio el ventaneo con solapamiento y mezcla.
- La evaluación mide solo falsas alarmas sobre recitadores expertos; no se ha medido la tasa de detección de errores reales.
- Licencia AGPL-3.0, con obligaciones de copyleft para obras derivadas distribuidas.
- Restricción de uso no comercial por provenance del dataset de entrenamiento (CC BY-NC 4.0), aunque la licencia del repositorio indique AGPL-3.0.
- Riesgo de alucinación de fonemas en audio ruidoso, con acento no coránico o con recitadores no nativos.
- Sin datos publicados sobre sesgos demográficos ni sobre robustez frente a distintas calidades de micrófono.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; madurez y soporte de la comunidad no verificables.

## Enlaces

- Hugging Face: https://huggingface.co/tifa613/itqan-muaalem-mini-onnx
- Modelo base (estudiante): https://huggingface.co/sysofwan/hifzguide-muaalem-mini
- Modelo profesor: https://huggingface.co/obadx/muaalem-model-v3_2
- Arquitectura de referencia: https://huggingface.co/facebook/w2v-bert-2.0
- Dataset de entrenamiento: https://huggingface.co/datasets/FaisaI/tadabur
