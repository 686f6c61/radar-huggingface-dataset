# taurusduan/Minimax-H3-Image-Exp-Comfy

## Resumen

MiniMax-H3-Image-Exp-Comfy es un repositorio de investigación de terceros publicado por el usuario taurusduan (t8star) que empaqueta el modelo de generación y edición de imágenes MiniMax-H3-Image de MiniMaxAI en un formato compatible con ComfyUI, junto con un LoRA experimental de corrección de materiales. No es un modelo nuevo ni una versión oficial de MiniMax: es una conversión del checkpoint completo en BF16/FP32 (66,29 GB) al esquema de nombres y disposición QKV que espera ComfyUI, más utilidades para reproducir una ruta de muestreo multi-paso alternativa a la ruta nativa de seis pasos del modelo original.

El problema que aborda es concreto: la ruta nativa de seis pasos con CFG1 del modelo publicado produce artefactos de "grabado duro" en materiales como piel, tejidos y pelo cuando se intenta muestrear con más pasos y CFG superior. El autor entrena un LoRA de rango 16 (172,07 MB) que aproxima una corrección de materiales en la cabeza de predicción, y documenta tanto los casos en los que mejora como los que fallan (8 de 10 muestras fijas superan la inspección conjunta manual, 2 fallan). El repositorio incluye también un nodo personalizado que sustituye las seis cabezas PDD del modelo por una única cabeza media ponderada por intervalos.

Es relevante para desarrolladores e investigadores que ya trabajan con MiniMax-H3-Image en ComfyUI y quieren experimentar con rutas de muestreo alternativas, o que necesitan el checkpoint completo en formato ComfyUI sin recurrir a conversiones propias. El repo pesa 99,8 GB en total e incluye pesos históricos, adaptadores rechazados y material de diagnóstico, por lo que no debe descargarse entero como si fuera un único modelo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de difusión para texto-a-imagen y edición (detalles internos de la red no disponibles en la información proporcionada) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Checkpoint principal en BF16/FP32 mixto; text encoder en INT8; VAE en FP16; LoRA en safetensors de rango 16 |
| Idiomas soportados | chino (zh) e inglés (en) |
| Licencia | minimax-h3-image-community-license-agreement (etiquetada como "other") |
| Formato de pesos | safetensors (checkpoint ComfyUI, LoRA, text encoder, VAE) |
| Tamaño del checkpoint principal | 66,29 GB (BF16/FP32 mixto, sin podar, con AdaLN completo) |
| Tamaño del LoRA experimental | 172,07 MB (rank 16) |
| Tamaño del text encoder | 27,14 GB (INT8) |
| Tamaño del VAE | 1,17 GB (FP16) |
| Tamaño total del repositorio | 99,8 GB |
| Resoluciones de ejemplo | 2048×2048 (texto-a-imagen), 2048×1344 (edición de fotos) |
| Modelo base | MiniMaxAI/MiniMax-H3-Image |
| Librería | minimax-h3 |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base MiniMax-H3-Image (número de bloques, tipo de atención, tokenizador visual, etc.). Lo que sí se documenta es la estructura de la cabeza de predicción: el modelo publicado utiliza seis cabezas PDD (un esquema de predicción por intervalos) que el nodo personalizado `h3_image_single_head` convierte en una única cabeza media ponderada por intervalos, calculada a partir de las seis cabezas originales. Esa cabeza media no es una destilación del profesor original, sino una agregación de las cabezas publicadas. El nodo modifica solo una copia en memoria del checkpoint y no sobrescribe el archivo del modelo.

El LoRA `experimental_direct_mlp100_rank16` se entrena de forma independiente como compensación aproximada de materiales, con rango 16 y pensado para aplicarse con el cargador de bypass (`LoraLoaderBypassModelOnly`) sobre el checkpoint completo, no mediante fusión estándar de LoRA. El autor indica que no dispone de incrementos PDD del tronco original ni de pesos de un profesor desconocido, por lo que no reclama una "extracción" ni una restauración del 99 % del original. La cifra 8/10 corresponde a un recuento de inspección manual conjunta sobre muestras fijas, no a una métrica de similitud con un profesor ni a un test ciego a gran escala. El repositorio incluye además un candidato rechazado (`REJECTED_edit_preservation_mlp100_rank16_DIAGNOSTIC_ONLY.safetensors`) que no superó la comprobación de presupuesto numérico de entrenamiento y que se conserva solo para diagnóstico de fallos.

## Capacidades

- Generación de imágenes texto-a-imagen a 2048×2048 con el checkpoint completo y la ruta nativa de seis pasos.
- Edición de imágenes a 2048×1344, con la imagen de referencia inyectada tanto en la rama de condicionamiento positivo como en la negativa.
- Ruta nativa de seis pasos con el calendario PDD publicado y `BasicGuider` (equivalente a CFG1), sin nodo de cabeza única ni LoRA de corrección.
- Ruta multi-paso experimental (Euler 50 pasos, CFG 3, shift 3, LoRA a intensidad +1) orientada a reducir artefactos de grabado duro en piel, tejidos, pelo y acuarela.
- Edición localizada de regiones (por ejemplo, eliminación de texto en una pared) con preservación parcial del resto de la imagen; el autor documenta que la preservación no es perfecta.
- Soporte de texto en chino e inglés en los prompts.
- Compatibilidad con ComfyUI mediante nodos nativos `MiniMaxH3ImageConditioning`, `LoraLoaderBypassModelOnly`, `ManualSigmas` y `CFGGuider`.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso textual, visión general, audio ni modo "thinking"; se trata de un modelo de imagen.

## Casos de uso

- Reproducción de la ruta nativa de seis pasos: cargar el checkpoint completo en `ComfyUI/models/diffusion_models/`, el text encoder INT8 y el VAE FP16, e importar el workflow de `workflows/native_pdd6` para validar el comportamiento del modelo publicado sin modificaciones. Adecuado para verificar que la conversión a ComfyUI no altera el pipeline original.
- Experimentación con muestreo multi-paso: usar el checkpoint completo más el nodo de cabeza única y el LoRA direct MLP100 con Euler 50 pasos, CFG 3 y shift 3 para obtener materiales más continuos en piel y tejidos. Útil en investigación de dinámicas de muestreo sobre modelos de difusión con cabezas PDD.
- Generación de retratos y escenas fotorrealistas a 2048×2048: el modelo produce imágenes de resolución alta en una sola pasada, adecuado para prototipado de conceptos visuales y pruebas de composición antes de un refinamiento manual.
- Edición fotográfica localizada: eliminar texto o elementos no deseados en una región concreta manteniendo el resto de la escena, con la advertencia documentada de que detalles no objetivo pueden desplazarse. Aplicable a limpieza de fondos o corrección de carteles en material gráfico.
- Estilización artística (acuarela, ilustración): los ejemplos del repo muestran resultados de acuarela con texto legible ("山间茶舍") y motivos florales, lo que permite usar el modelo para generar ilustraciones con estilos pictóricos definidos por prompt.
- Investigación sobre cabezas de predicción: el nodo de cabeza única y el LoRA de corrección sirven como banco de pruebas para estudiar cómo la agregación de cabezas PDD afecta a la textura y a la preservación de detalles en edición.
- Evaluación comparativa de rutas de muestreo: el repositorio incluye workflows, prompts, seeds y tablas de inspección que permiten reproducir la comparación control (50 pasos sin corrección) frente a 50 pasos con LoRA, útil para estudios de ablación reproducibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor aporta únicamente un recuento de inspección manual conjunta sobre diez muestras fijas (8 aprobadas, 2 fallidas), que no constituye una métrica estandarizada ni un test ciego. No se proporcionan valores de FID, CLIP score, SSIM ni comparaciones numéricas con otros modelos.

## Requisitos de hardware

- El checkpoint principal de 66,29 GB requiere una cantidad elevada de memoria del sistema y descarga parcial desde VRAM; el autor lo ejecutó en un equipo con RTX 4060 Ti de 16 GB de VRAM y 128 GB de RAM.
- El text encoder INT8 ocupa 27,14 GB y el VAE FP16 1,17 GB, que se suman a los requisitos del checkpoint.
- Cabe en GPU de consumo como la RTX 4060 Ti de 16 GB solo con descarga a RAM del sistema; el autor advierte explícitamente que funcionar en esa configuración no implica que equipos con menos RAM puedan ejecutarlo ni garantiza velocidad.
- Para inferencia sin descarga agresiva se necesitan GPU de 80 GB o más (A100 80 GB, H100) o configuraciones multi-GPU; no se proporcionan cifras de throughput ni latencia.
- Opciones de despliegue documentadas: ComfyUI con soporte de MiniMax H3 Image (entorno de referencia `989d93d0d`), nodos nativos `MiniMaxH3ImageConditioning`, `LoraLoaderBypassModelOnly`, `ManualSigmas` y `CFGGuider`, más el nodo personalizado `h3_image_single_head` para la ruta multi-paso.
- No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; el pipeline es específico de ComfyUI.
- No se garantiza consistencia píxel a píxel entre distintas GPUs, operadores o versiones de ComfyUI.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones de modelos comparables de la misma categoría (generación y edición de imágenes de gran formato), por lo que no es posible establecer una comparación rigurosa con alternativas.

## Limitaciones y advertencias

- No es un modelo oficial de MiniMax ni una versión nueva: es un empaquetado de terceros del modelo base MiniMax-H3-Image para ComfyUI.
- El LoRA de corrección no restaura el modelo original ni elimina el PDD; el autor rechaza explícitamente las afirmaciones de "extracción completada" o "99 % de restauración".
- La ruta multi-paso con LoRA no se ha comparado formalmente contra la ruta nativa de seis pasos; los ejemplos son comparaciones control a 50 pasos sin corrección frente a 50 pasos con corrección, no una prueba de superioridad general.
- El recuento 8/10 es una inspección manual conjunta sobre muestras fijas, no una métrica de similitud con un profesor ni un test ciego a gran escala.
- Fallos documentados: la corrección no resuelve la falta de mango y asta en el ejemplo del paraguas, y la edición localizada de la pared no preserva intactos los detalles no objetivo (marcas tenues en la parte superior, deriva de personas y otros elementos).
- Cambios de composición y de rostro respecto al control: el LoRA altera la posición de objetos, caras y detalles, no solo la textura.
- El candidato `REJECTED_edit_preservation_mlp100_rank16_DIAGNOSTIC_ONLY.safetensors` no superó la comprobación de presupuesto numérico de entrenamiento y no debe usarse como reemplazo del direct MLP100.
- No se debe descargar el repositorio completo (99,8 GB) como si fuera un único modelo: contiene pesos históricos, adaptadores y material de diagnóstico con instrucciones de instalación distintas.
- Licencia `minimax-h3-image-community-license-agreement` (etiquetada como "other"): las condiciones de uso comercial no están detalladas en la información disponible y deben consultarse en el archivo LICENSE del repositorio.
- Idiomas limitados a chino e inglés; no se documenta soporte de otros idiomas en los prompts.
- Riesgo de alucinación visual y de artefactos de textura en la ruta multi-paso sin corrección (grabado duro en piel, tejidos y pelo).
- Dependencia de una versión concreta de ComfyUI y de nodos específicos; usar un cargador LoRA estándar en lugar del cargador de bypass puede producir resultados incorrectos.
- No se garantiza reproducibilidad píxel a píxel entre hardware y versiones de ComfyUI.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/taurusduan/Minimax-H3-Image-Exp-Comfy
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image
- Checkpoint completo ComfyUI: https://huggingface.co/t8star/Minimax-H3-Image-Exp-Comfy/resolve/main/diffusion_models/minimax_h3_image_full_bf16_comfy_qkvfix.safetensors
- LoRA direct MLP100: https://huggingface.co/t8star/Minimax-H3-Image-Exp-Comfy/resolve/main/loras/experimental_direct_mlp100_rank16.safetensors
- Text encoder INT8: https://huggingface.co/t8star/Minimax-H3-Image-Exp-Comfy/resolve/main/text_encoders/qwen3vl_32b_minimax_h3_int8_convrot.safetensors
- VAE FP16: https://huggingface.co/t8star/Minimax-H3-Image-Exp-Comfy/resolve/main/vae/minimax_h3_image_vae_fp16.safetensors
- Nodo personalizado de cabeza única: https://huggingface.co/t8star/Minimax-H3-Image-Exp-Comfy/tree/main/custom_nodes/h3_image_single_head
- Workflows: https://huggingface.co/t8star/Minimax-H3-Image-Exp-Comfy/tree/main/workflows
- Ejemplos detallados: https://huggingface.co/t8star/Minimax-H3-Image-Exp-Comfy/blob/main/EXAMPLES.md
- Índice de modelos: https://huggingface.co/t8star/Minimax-H3-Image-Exp-Comfy/blob/main/MODEL_INDEX.md
- Manifiesto legible por máquina: https://huggingface.co/t8star/Minimax-H3-Image-Exp-Comfy/blob/main/MODEL_MANIFEST.json
- Atribución de la foto original: https://huggingface.co/t8star/Minimax-H3-Image-Exp-Comfy/blob/main/ATTRIBUTION.md
