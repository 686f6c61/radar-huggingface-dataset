# YOLOW92/yolowocr-v3

## Resumen

YolowOCR-Suite v3 es una familia de modelos de visión por computador orientados a OCR y análisis de documentos PDF, desarrollada por el usuario YOLOW92. No se trata de un modelo de lenguaje generativo, sino de un conjunto de cinco submodelos especializados (detección de texto, reconocimiento de texto, análisis de layout y reconocimiento de fórmulas) entrenados desde cero y publicados en formato BF16 `safetensors` para su uso con la librería en Rust `yolowpdf` / `yolowpdf-ocr` (versión `>= 0.2.0`).

La suite incluye dos modelos de reconocimiento completados y listos para producción (`rec_v3_large`, multilingüe con vocabulario de 18.710 tokens, y `rec_v3_latin_large`, específico para latín/inglés con 254 tokens), más tres checkpoints en estado de preview publicados para investigación y reproducibilidad (`det_v3_large`, `layout_l_v3` y `formula_v3_pro`). Los modelos de reconocimiento se combinan con el detector `det_v2` de la versión anterior (`yolowocr-v2`) para formar el pipeline OCR completo.

La relevancia de esta suite radica en su enfoque "clean-room" (entrenamiento desde inicialización aleatoria, sin pesos preentrenados de terceros) y su integración nativa con un runtime en Rust, lo que la orienta a despliegues de procesamiento documental con requisitos de huella mínima (los modelos completados ocupan entre 35 y 44 MB en BF16) y licencia MIT permisiva para uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CNN + Transformer híbrida (LCNetV4-L + SVTR para reconocimiento; HGNetV2-L + transformer con 300 queries para layout; ViT + decoder para fórmulas) |
| Parámetros totales | Variable por submodelo: 17,43M a 127,37M (ver tabla de submodelos) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelos de visión, no de lenguaje) |
| Tipos de cuantización | BF16 (pesos publicados); no se documentan otras cuantizaciones |
| Idiomas soportados | Multilingüe (`rec_v3_large`, vocabulario 18.710); latín/inglés (`rec_v3_latin_large`, vocabulario 254) |
| Licencia | MIT |
| Formato de pesos | `safetensors` (BF16) |

Desglose por submodelo:

| Subdirectorio | Función | Estado | Parámetros | Tamaño BF16 |
|---|---|---|---:|---:|
| `rec_v3_large` | Reconocimiento de texto multilingüe (LCNetV4-L + 4L SVTR `h=256`) | Completado (38.412 pasos) | 22,18M | 44,4 MB |
| `rec_v3_latin_large` | Reconocimiento de texto latín/inglés (LCNetV4-L + 4L SVTR `h=256`) | Completado (18.000 pasos) | 17,43M | 35,2 MB |
| `det_v3_large` | Detección de texto (`pp_ocrv6_medium_det`, 896px) | Preview (6.645 / 24.000 pasos) | 21,96M | 44,2 MB |
| `layout_l_v3` | Layout documental (`HGNetV2-L`, 6L, 300 queries, `800×800`) | Preview (4.262 / 24.000 pasos) | 33,18M | 67,0 MB |
| `formula_v3_pro` | Reconocimiento de fórmulas (`256×768`, 12L ViT + 8L Dec + MTP-4) | Preview (15.811 / 35.000 pasos) | 127,37M | 255,2 MB |

## Arquitectura y entrenamiento

Los modelos de reconocimiento (`rec_v3_large` y `rec_v3_latin_large`) combinan un backbone convolucional LCNetV4-L con un encoder SVTR de 4 capas y dimensión oculta `h=256`, una arquitectura típica de reconocimiento de texto escena/documento que procesa recortes de imagen y emite secuencias de caracteres. El detector `det_v3_large` emplea `pp_ocrv6_medium_det` a resolución de 896 px con multi-escala. El modelo de layout `layout_l_v3` usa un backbone HGNetV2-L con 6 capas y 300 queries sobre entradas de 800×800, siguiendo el paradigma de detección de objetos tipo DETR adaptado a regiones documentales. El modelo de fórmulas `formula_v3_pro` es un transformer encoder-decoder (12 capas ViT + 8 capas decoder) con soporte de decodificación multi-token prediction (MTP-4) sobre entradas de 256×768.

Todos los pesos se entrenaron desde inicialización aleatoria ("clean-room"), sin indicarse en la información disponible el volumen total de tokens, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO (no aplicables a este tipo de modelos). Las métricas de entrenamiento reportadas incluyen `1-CER = 0.9673` y `EM = 42,0%` para `rec_v3_large` (38.412 pasos), y `1-CER = 0.9651` y `EM = 36,3%` para `rec_v3_latin_large` (18.000 pasos). El checkpoint `formula_v3_pro` reporta `mean_sim = 0.8227` y `mtp_tau = 3.94×`, con una reducción de bucles de repetición de 6,4× (del 13,5% al 2,1%). El checkpoint `layout_l_v3` redujo falsos positivos de cajas de fórmula en texto plano 24× (de 600 a 25).

## Capacidades

- Reconocimiento óptico de caracteres (OCR) multilingüe mediante `rec_v3_large`, con vocabulario de 18.710 tokens.
- Reconocimiento OCR especializado en latín/inglés mediante `rec_v3_latin_large`, con vocabulario reducido de 254 tokens.
- Detección de regiones de texto en imágenes de documento (`det_v3_large`, en preview).
- Análisis de layout documental con 300 queries sobre imágenes de 800×800 (`layout_l_v3`, en preview).
- Reconocimiento de fórmulas matemáticas con decodificación multi-token (`formula_v3_pro`, en preview).
- Integración nativa con el runtime en Rust `yolowpdf-ocr >= 0.2.0`, sin cambios de código en tiempo de ejecución.
- Procesamiento de PDFs (etiqueta `pdf` en el repositorio).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de audio.

## Casos de uso

- Digitalización masiva de archivos PDF escaneados: el pipeline `det_v2` + `rec_v3_large` permite extraer texto de documentos históricos y escaneos antiguos, con una mejora documentada de +2,66 pp en la métrica `old_scans` de `olmOCR-bench` respecto a la versión anterior.
- Procesamiento de documentos en inglés o lenguas latinas: `rec_v3_latin_large` ofrece un modelo de 35,2 MB especializado con vocabulario reducido, adecuado para pipelines donde el multilingüismo no es necesario y se prioriza la huella mínima.
- Extracción de estructura documental: `layout_l_v3` permite segmentar páginas en regiones (texto, tablas, fórmulas) para alimentar etapas posteriores de parsing, aunque su estado de preview limita su uso en producción crítica.
- Reconocimiento de fórmulas científicas: `formula_v3_pro` está orientado a convertir expresiones matemáticas en imágenes a formato estructurado, útil en pipelines de publicación académica, aunque su checkpoint de preview (15.811 / 35.000 pasos) requiere validación adicional.
- Despliegue en entornos con recursos limitados: el tamaño de los modelos completados (35-44 MB en BF16) permite ejecutar OCR en dispositivos edge o contenedores ligeros sin GPU dedicada, gracias al runtime en Rust.
- Integración en aplicaciones Rust: la disponibilidad del crate `yolowpdf-ocr` en crates.io facilita incorporar OCR directamente en aplicaciones nativas Rust sin dependencias de Python.
- Automatización de facturación o gestión documental: la combinación de detección y reconocimiento permite extraer campos de texto de facturas y formularios escaneados, siempre que se validen los resultados dada la tasa de error del reconocimiento (EM del 42,0% en `rec_v3_large`).

## Benchmarks y rendimiento

| Modelo / configuración | Benchmark / métrica | Resultado |
|---|---|---|
| `rec_v3_large` (38.412 pasos) | `1-CER` | 0,9673 |
| `rec_v3_large` (38.412 pasos) | `EM` | 42,0% |
| `rec_v3_latin_large` (18.000 pasos) | `1-CER` | 0,9651 |
| `rec_v3_latin_large` (18.000 pasos) | `EM` | 36,3% |
| `rec_v3_large` + `det_v2` | `olmOCR-bench` `old_scans` | 0,1958 (desde 0,1692, +2,66 pp) |
| `rec_v3_latin_large` + `det_v2` | `olmOCR-bench` `old_scans` (latín) | 0,1844 (desde 0,1673, +1,71 pp) |
| `det_v3_large` (6.645 pasos) | F1 en validación | 0,9179 |
| `formula_v3_pro` (15.811 pasos) | `mean_sim` | 0,8227 |
| `formula_v3_pro` (15.811 pasos) | `mtp_tau` | 3,94× |
| `formula_v3_pro` (15.811 pasos) | Tasa de bucles de repetición | 2,1% (desde 13,5%) |
| `layout_l_v3` (4.262 pasos) | Falsos positivos de fórmula en texto plano | 25 (desde 600) |

No se han publicado resultados comparativos con modelos OCR de terceros (PaddleOCR, Tesseract, TrOCR) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB para los modelos completados en BF16 (44,4 MB y 35,2 MB de pesos); el modelo de fórmulas en preview requiere aproximadamente 255 MB de pesos.
- GPU recomendadas: cualquier GPU con soporte BF16; dada la huella mínima, no se requiere hardware de gama alta.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (RTX 3060 o superior) e incluso en CPU para los modelos de reconocimiento.
- Opciones de despliegue: runtime nativo en Rust `yolowpdf` / `yolowpdf-ocr` (crate en crates.io, versión `>= 0.2.0`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, al no ser modelos de lenguaje.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| YolowOCR-Suite v3 (`rec_v3_large`) | OCR (CNN + SVTR) | 22,18M | Multilingüe (18.710 vocab) | MIT | Hugging Face + crate Rust |
| YolowOCR-Suite v2 (`rec_v2`) | OCR (versión anterior) | No disponible | No disponible | MIT (según repositorio) | Hugging Face |
| PaddleOCR (PP-OCRv6) | OCR (CNN + SVTR) | No disponible | Multilingüe | Apache 2.0 | GitHub / PaddlePaddle |
| Tesseract | OCR (LSTM) | No disponible | Multilingüe | Apache 2.0 | GitHub / paquetes del sistema |

La comparación con PaddleOCR y Tesseract se ofrece como referencia de categoría; no se dispone de resultados de benchmarks cruzados en la información proporcionada. La principal ventaja diferencial de YolowOCR-Suite v3 es su integración nativa con un runtime Rust y su licencia MIT, frente a Apache 2.0 en las alternativas.

## Limitaciones y advertencias

- Tres de los cinco submodelos (`det_v3_large`, `layout_l_v3`, `formula_v3_pro`) son checkpoints de preview con entrenamiento incompleto (entre el 18% y el 45% del presupuesto previsto); no deben usarse en producción sin validación.
- El modelo de detección recomendado para producción es `det_v2` de la versión anterior, no `det_v3_large`, que según el autor es más débil y lento en escaneos reales.
- La tasa de coincidencia exacta (`EM`) del reconocimiento es baja (42,0% en `rec_v3_large`, 36,3% en `rec_v3_latin_large`), lo que implica errores frecuentes a nivel de cadena completa; el uso en producción debe contemplar validación o corrección posterior.
- `layout_l_v3` presenta infra-recall en escaneos matemáticos reales según la propia model card.
- No se documentan sesgos conocidos, riesgos de alucinación (no es un modelo generativo de lenguaje) ni limitaciones de contexto en la información disponible.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantías sobre los checkpoints en preview.
- No se especifican los idiomas exactos cubiertos por el vocabulario multilingüe de 18.710 tokens más allá de la etiqueta "multilingual".
- El ecosistema está ligado al runtime Rust `yolowpdf`; no se documentan exportaciones a ONNX u otros formatos.

## Enlaces

- Hugging Face: https://huggingface.co/YOLOW92/yolowocr-v2
- Repositorio GitHub: https://github.com/YOLOW92/yolowpdf
- Crate Rust: https://crates.io/crates/yolowpdf-ocr
- Modelo anterior (v2): https://huggingface.co/YOLOW92/yolowocr-v2
