# tls8012/paddleocr_tuned

## Resumen

`paddleocr_tuned` es un modelo de reconocimiento óptico de caracteres (OCR) especializado en la lectura de importes en recibos y tickets en coreano. Lo publica el usuario `tls8012` en Hugging Face y parte de `korean_PP-OCRv5_mobile_rec`, el reconocedor móvil de la familia PP-OCRv5 de PaddleOCR. El problema que aborda es concreto: los reconocedores OCR genéricos cometen errores sistemáticos al transcribir cifras monetarias en documentos de baja calidad (fotos de móvil, escaneos torcidos, papeles arrugados), y esos errores tienen consecuencias contables. El ajuste fino se centra en reducir la tasa de error en los importes.

Técnicamente no es un modelo nuevo, sino un ajuste fino parcial: el backbone queda congelado y solo se entrenan las cabezas de reconocimiento. La arquitectura combina un decodificador CTC y una cabeza NRTR que actúa como segunda lectura sobre las regiones candidatas a importe. El resultado es un sistema de doble lectura con lógica de desempate y abstención, pensado para integrarse en una tubería OCR local de procesamiento de recibos.

La relevancia es acotada pero clara para quien construye pipelines de digitalización de tickets en coreano: demuestra una estrategia de ajuste barata (dos épocas sobre el CTC, una sobre el NRTR) que mejora la coincidencia exacta de importes del 84,1 % al 91,8 % sobre un conjunto de validación de 429 fragmentos. El repositorio es pequeño (0,1 GB) y la licencia Apache-2.0 permite uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | PP-OCRv5 mobile rec (backbone CNN + cabeza CTC + cabeza NRTR) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada de imagen fija: altura 48, anchura 576) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache-2.0 |
| Formato de pesos | PaddlePaddle (`amounts_e1.pdparams`) |
| Configuración | `korean_PP-OCRv5_mobile_rec.yml` |
| Diccionario | `ppocrv5_korean_dict.txt` |
| Detector asociado | `PP-OCRv5_mobile_det` oficial, sin ajustar |
| Tamaño del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

El modelo reutiliza la arquitectura de `korean_PP-OCRv5_mobile_rec` de PaddleOCR: un backbone convolucional ligero que extrae características de la imagen de entrada (48×576 píxeles) y dos cabezas de decodificación sobre esa representación. La cabeza CTC realiza una transcripción secuencial alineada; la cabeza NRTR (transformer de reconocimiento) produce una segunda lectura autorregresiva. En inferencia, el CTC lee primero el texto completo y, cuando detecta una región candidata a importe, el NRTR vuelve a leerla; si ambas lecturas discrepan, el sistema elige una de las dos o se abstiene.

El entrenamiento se hizo en dos fases con el backbone congelado. Primero se entrenaron el codificador CTC y su cabeza durante 2 épocas sobre fragmentos de texto de recibos aumentados. Después se entrenó la cabeza NRTR durante 1 época adicional sobre fragmentos de importes, con las variantes `before_gtc` y `gtc_head`. El conjunto de entrenamiento fueron 658 fragmentos de importe extraídos de 209 recibos, procedentes de fotos y escaneos de KORIE y de fotografías web. La configuración de canales de salida debe ajustarse a `out_channels_list = {CTCLabelDecode: n, NRTRLabelDecode: n + 3}`, con `n = len(CTCLabelDecode(diccionario, use_space_char=True).character)`.

No se documenta el volumen total de tokens ni la composición completa del corpus más allá de los fragmentos de importe; tampoco se indica el uso de RLHF o DPO, que no aplican a un modelo de OCR.

## Capacidades

- Reconocimiento de texto impreso en coreano sobre imágenes de recibos y tickets.
- Lectura especializada de importes monetarios mediante doble decodificación (CTC + NRTR).
- Mecanismo de desempate y abstención cuando las dos cabezas discrepan en una cifra.
- Integración con el detector oficial `PP-OCRv5_mobile_det` para localizar regiones de texto antes del reconocimiento.
- Funcionamiento local, sin dependencia de servicios en la nube.
- No soporta tool calling, agentes, razonamiento multi-paso, visión general ni audio.
- No es un modelo multilingüe: el diccionario y el ajuste están limitados al coreano.

## Casos de uso

- Digitalización de tickets de compra en coreano: el modelo transcribe las líneas de texto y, sobre todo, los importes, con una coincidencia exacta del 91,8 % en la cabeza NRTR sobre el conjunto de validación. Adecuado para aplicaciones de gestión de gastos personales o corporativos.
- Contabilidad automatizada de gastos: integrado en un pipeline que detecta regiones con el detector oficial y aplica el reconocedor ajustado, permite extraer el total y las líneas de detalle de cada recibo para volcarlos a un ERP o a una hoja de cálculo.
- Verificación de tickets en procesos de reembolso: la lógica de abstención cuando CTC y NRTR discrepan permite derivar a revisión humana solo los casos dudosos, reduciendo la carga de validación manual.
- Procesamiento por lotes de archivos de recibos escaneados: al ser un modelo móvil y ligero (repositorio de 0,1 GB), puede ejecutarse en CPU o GPU modesta para digitalizar grandes volúmenes sin coste por inferencia.
- Auditoría de gastos con detección de anomalías: la extracción fiable de importes permite comparar el total del ticket con la suma de líneas y señalar discrepancias.
- Aplicaciones móviles de escaneo de recibos: el tamaño reducido del modelo y su origen en la variante "mobile" de PP-OCRv5 lo hacen apto para despliegue en dispositivos con recursos limitados, siempre que se use el runtime de PaddlePaddle.
- Investigación en OCR especializado: sirve como referencia de una estrategia de ajuste parcial (backbone congelado, solo cabezas) con resultados medidos, útil para replicar el enfoque en otros dominios o idiomas.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre un conjunto de validación de 429 fragmentos de importe extraídos de 153 recibos. La métrica principal es la coincidencia exacta del importe y el número de ediciones a nivel de dígito sobre 1.856 caracteres.

| Modelo | Importes con coincidencia exacta | Ediciones de dígitos (sobre 1.856) |
|---|---|---|
| CTC original | 361 (84,1 %) | 132 |
| CTC ajustado | 380 (88,6 %) | 82 |
| NRTR original | 344 (80,2 %) | 185 |
| NRTR ajustado | 394 (91,8 %) | 55 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, lo cual es esperable en un modelo de OCR.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño del repositorio (0,1 GB) y su origen en la variante móvil de PP-OCRv5, la huella es reducida y cabe holgadamente en GPU de consumo.
- GPU recomendadas: cualquier GPU con soporte CUDA compatible con PaddlePaddle; no se especifican modelos concretos (A100, H100, RTX 4090) en la documentación.
- GPU de consumo: previsiblemente sí, dado el tamaño del modelo, aunque no se documenta una lista de tarjetas verificadas.
- Despliegue: PaddlePaddle y PaddleOCR son los runtimes previstos. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Ajuste en importes | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tls8012/paddleocr_tuned` | PP-OCRv5 mobile rec ajustado | Coreano | Sí (CTC + NRTR) | Apache-2.0 | Hugging Face |
| `korean_PP-OCRv5_mobile_rec` (PaddleOCR) | PP-OCRv5 mobile rec original | Coreano | No | Apache-2.0 | PaddleOCR |
| `PP-OCRv5_mobile_rec` (PaddleOCR) | PP-OCRv5 mobile rec multilingüe | Varios | No | Apache-2.0 | PaddleOCR |

La comparación directa con alternativas de otros proveedores (Tesseract, EasyOCR, TrOCR) no está disponible en la información proporcionada. Los datos de rendimiento del propio autor permiten comparar el modelo ajustado con su base original: la cabeza NRTR ajustada supera a la original en 7,6 puntos de coincidencia exacta y reduce las ediciones de dígitos de 185 a 55.

## Limitaciones y advertencias

- El ajuste se limita al reconocimiento de importes; el resto del texto del recibo se beneficia solo indirectamente del entrenamiento del CTC.
- El detector de texto no está ajustado: se usa el `PP-OCRv5_mobile_det` oficial, por lo que la calidad de la localización de regiones no mejora respecto al modelo base.
- El conjunto de validación es pequeño (429 fragmentos de 153 recibos) y procede de fuentes concretas (KORIE y fotos web); el rendimiento en otros dominios o calidades de imagen puede diferir.
- Solo cubre coreano; no debe esperarse un comportamiento correcto con otros idiomas o alfabetos.
- Riesgo de alucinación en cifras: aunque la doble lectura y la abstención lo mitigan, un OCR puede producir importes plausibles pero incorrectos, especialmente con imágenes degradadas; en producción conviene mantener validación o revisión humana en importes altos.
- Sesgos: no se documentan sesgos específicos, pero el corpus de entrenamiento (fotos y escaneos de recibos coreanos) puede no representar formatos de ticket de otras regiones o sectores.
- Licencia Apache-2.0: permite uso comercial, pero se debe conservar el aviso de licencia original de PaddleOCR incluido en el repositorio.
- El formato de pesos es específico de PaddlePaddle (`.pdparams`), lo que limita su uso fuera del ecosistema PaddleOCR sin conversión.
- El modelo se publicó en noviembre de 2026 y no registra descargas ni interacciones; no hay evidencia de uso en producción por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tls8012/paddleocr_tuned
- PaddleOCR (repositorio oficial): https://github.com/PaddlePaddle/PaddleOCR
- PaddlePaddle: https://www.paddlepaddle.org.cn/
- Modelo base `korean_PP-OCRv5_mobile_rec`: no disponible como enlace directo en la información proporcionada
- Paper o blog del ajuste: no disponible
