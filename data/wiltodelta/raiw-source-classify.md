# wiltodelta/raiw-source-classify

## Resumen
RAIW source-classify (identificador `multi-provider-source-v10`) es un clasificador de imágenes orientado a forense digital, desarrollado por wiltodelta dentro del proyecto `remove-ai-watermarks`. Su función no es generar contenido, sino atribuir la procedencia de una imagen: detecta si es sintética y, cuando puede, identifica la familia de proveedor que la generó (OpenAI, Google, ByteDance, Flux, Stable Diffusion, Meta, Midjourney, Ideogram, Firefly, xAI) entre diez familias más la clase `unknown`.

Técnicamente es un modelo híbrido: combina un extractor de características físicas y de códec de 512 dimensiones (residuos SRM, periodicidad de sublattice, estadística DCT, coherencia espectral, artefactos CFA y de compresión) con un ViT-B/16 a 384 píxeles exportado a ONNX y ejecutado en CPU. La salida incluye etiqueta de proveedor, subfamilia de versión/modelo de exportación, y una detección binaria calibrada de contenido sintético con probabilidad asociada.

Es relevante ahora porque el ecosistema de imágenes generadas por IA se ha fragmentado en múltiples proveedores y pipelines de exportación, y las marcas de agua criptográficas (tipo SynthID) no siempre están presentes o verificables. Este modelo aborda la atribución desde la señal de píxel, sin decodificar marcas de agua, y está diseñado para resistir recorte, recomposición social, inpainting localizado y transcodificación de contenedor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: extractor de características físicas/códec (512-d) + ViT-B/16 @ 384 (ONNX) con split-tail de dos ramas + cabezas de clasificación open-set |
| Parametros totales | no disponible (pesos empaquetados de 67,00 MB en el bundle `.npz`) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantizacion | pesos en fp16 selectivo con cómputo fp32 en el grafo ONNX; no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible (modelo de clasificación de imagen, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.npz` sin pickle (`allow_pickle=False`) con grafo ONNX embebido; ejecutable vía `onnxruntime` en CPU |

## Arquitectura y entrenamiento
El modelo se estructura en tres bloques. El primero es una rama de física, sublattice, sensor y códec de 512 dimensiones que extrae 112 dimensiones de micro-residuos SRM adaptativos sobre teselas nativas solapadas, 128 dimensiones de energía de sublattice módulo-8/módulo-16 con detección de fase secundaria y estadística de peine de cuantización DCT 8x8, 144 dimensiones de descomposición espectral periódica-más-suave (p+s) de Moisan con perfil de decaimiento radial, 96 dimensiones de coherencia de fase espectral entre canales con periodicidad CFA Bayer/Quad-Bayer y alineación de aberración cromática, y 32 dimensiones de vector de régimen de códec, relación de aspecto, escala y recomposición social.

El segundo bloque es un tallo visual ViT-B/16 a 384 píxeles derivado de `OwensLab/commfor-model-384` (MIT), congelado en los bloques 0 a 8 y dividido en dos ramas: la rama A mantiene los bloques 9 a 11 sin adaptar para preservar logits generalistas, y la rama B adapta esos mismos bloques con gating intermedio RINE de 4 capas, destilación de logits de tres profesores permisivos (CommFor-MIT, DINOv2-Reg4-Base y SigLIP2-Base), SubCenterArcFace de 24 dimensiones y una cabeza espacial de parches 24x24. El ViT se ejecuta en ONNX sobre CPU con teselas nativas de 384x384 sin remuestreo.

El tercer bloque corresponde a las etapas 1 y 1.5, con 154 canales unitarios, 96 puertas 2D, una cabeza open-set de proveedor de 209 dimensiones con tres vistas, fusión global de 117 dimensiones y una cabeza de anomalía espacial de 39 dimensiones para ediciones locales. No se documentan en la información disponible el número de tokens de entrenamiento ni la composición exacta del dataset.

## Capacidades
- Clasificación de procedencia de imagen entre diez familias de proveedor (`openai`, `google`, `bytedance`, `flux`, `stable_diffusion`, `meta`, `midjourney`, `ideogram`, `firefly`, `xai`) más la clase `unknown`.
- Atribución de subfamilia de versión y modelo de exportación (por ejemplo, `openai:gpt_image_1_5`).
- Detección binaria calibrada de contenido sintético con probabilidad asociada (`synthetic_detected`, `synthetic_probability`).
- Clasificación open-set: puede abstenerse y devolver `unknown` ante proveedores no vistos.
- Robustez declarada frente a redimensionado foráneo, recomposición social, inpainting localizado y transcodificación de contenedor.
- Cabeza de anomalía espacial para detectar ediciones locales sobre la imagen.
- Ejecución en CPU sin PyTorch, mediante NumPy y ONNX Runtime.
- No decodifica ni verifica marcas de agua criptográficas o invisibles; `watermark_truth` se reporta como `unknown`.

## Casos de uso
- Moderación de contenido en plataformas: clasificar imágenes subidas por usuarios para separar fotografía real de exportaciones sintéticas y priorizar revisión humana en los casos con `synthetic_probability` alta.
- Verificación periodística: comprobar la procedencia probable de una imagen recibida antes de publicarla, usando la etiqueta de proveedor y la subfamilia de versión como señal de trazabilidad.
- Investigación en forense digital: analizar corpus de imágenes para estudiar la prevalencia de distintos pipelines de generación y exportación por proveedor.
- Pipelines de derechos de autor y licencias: detectar imágenes sintéticas en catálogos y repositorios para aplicar políticas de atribución o exclusión.
- Auditoría de datasets: filtrar o etiquetar automáticamente imágenes generadas por IA en conjuntos de datos de entrenamiento o evaluación.
- Detección de ediciones locales: usar la cabeza de anomalía espacial para señalar regiones con inpainting sobre una imagen por lo demás auténtica.
- Despliegue en entornos air-gapped: el bundle `.npz` puede fijarse mediante `RAIW_SOURCE_CLASSIFY_WEIGHTS` para ejecución offline sin dependencias de red.
- Integración en CI/CD de contenidos: validación automatizada de assets gráficos antes de su publicación en sitios o aplicaciones.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- Inferencia en CPU: el modelo está diseñado explícitamente para ejecución CPU-only con ONNX Runtime; no requiere GPU.
- VRAM estimada: no aplica en el modo documentado; el bundle de pesos ocupa 67,00 MB.
- GPU recomendadas: no disponibles; el autor no documenta despliegue en GPU.
- Compatibilidad con GPU de consumo: irrelevante para el modo CPU documentado; no se indica soporte CUDA.
- Opciones de despliegue: paquete `remove-ai-watermarks[source-classify]`, CLI `remove-ai-watermarks classify-source`, scripts `infer.py` y `benchmark.py` ejecutables con `uv run`, y ONNX Runtime.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares
No disponible. La información proporcionada no incluye modelos comparables de atribución de proveedor de imagen con los que establecer una comparación de parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias
- No es un detector de SynthID: no decodifica ni verifica cargas de marca de agua criptográfica o invisible, y `watermark_truth` se reporta siempre como `unknown`.
- Las etiquetas describen pipelines completos de generación y exportación, por lo que el renderizador, la geometría, la codificación, el posprocesado y el estado de marca de agua pueden confundirse entre sí.
- `unknown` no implica ausencia de SynthID, y una etiqueta de proveedor no prueba la presencia de SynthID.
- Riesgo de atribución errónea ante pipelines no vistos o fuertemente transformados; el diseño open-set mitiga pero no elimina este riesgo.
- No se documentan sesgos conocidos ni tasas de alucinación en la información disponible.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las licencias de los componentes derivados (el tallo ViT procede de `OwensLab/commfor-model-384`, MIT).
- El repositorio ocupa 4,0 GB aunque el bundle de pesos declarado es de 67,00 MB; verificar el artefacto descargado antes de desplegar en producción.
- No hay datos publicados de benchmarks, latencia ni throughput que permitan estimar el rendimiento en producción.

## Enlaces
- Hugging Face: https://huggingface.co/wiltodelta/raiw-source-classify
- GitHub del proyecto: https://github.com/wiltodelta/remove-ai-watermarks
- Releases de pesos: https://github.com/wiltodelta/raiw-source-classify/releases/latest
- Leaderboard de detectores: https://huggingface.co/spaces/wiltodelta/ai-image-detector-leaderboard
- Demo en Hugging Face Space: https://huggingface.co/spaces/wiltodelta/remove-ai-watermarks
- Demo web: https://raiw.cc
- Notebook de demostración: https://colab.research.google.com/github/wiltodelta/raiw-source-classify/blob/main/demo.ipynb
- Script de inferencia: https://raw.githubusercontent.com/wiltodelta/raiw-source-classify/main/infer.py
- Script de benchmark: https://raw.githubusercontent.com/wiltodelta/raiw-source-classify/main/benchmark.py
- Modelo base del tallo visual: https://huggingface.co/OwensLab/commfor-model-384
