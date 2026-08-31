# TareHimself/AnimeMangaInpainting-torchscript

## Resumen

`TareHimself/AnimeMangaInpainting-torchscript` es un paquete de inferencia que envuelve el modelo `dreMaz/AnimeMangaInpainting` (checkpoint `lama_large_512px.ckpt`) en formato TorchScript trazado y congelado. El modelo subyacente es una variante de "big-lama" —la arquitectura LaMa (Large Mask Inpainting) con convoluciones de Fourier (FFC)— afinada sobre 300 000 imágenes de manga y anime. Su propósito es eliminar el acoplamiento con el código del modelo: el consumidor solo necesita cargar el archivo `.pt` y llamar a `forward(image, mask)` sin importar clases ni dependencias de la implementación original.

La relevancia de este paquete radica en que resuelve un problema práctico de despliegue: el checkpoint original de LaMa requiere el código de la arquitectura (clases FFC, ensamblaje de canales, composición) para funcionar. Al trazar y congelar el grafo, se hornean en el módulo la binarización de la máscara, la construcción de la imagen enmascarada, el ensamblaje de 4 canales que LaMa espera, el clamp de salida y la composición final `mask * predicted + (1 - mask) * image`. El repositorio ocupa 0,4 GB e incluye además el checkpoint original sin modificar, el script de conversión reproducible y una ruta alternativa de pesos crudos para quienes prefieran `torch.compile` o `torch.export`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LaMa (Large Mask Inpainting) con Fourier Convolutions (FFC), variante `lama_large_512px` |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no generativo de texto) |
| Tipos de cuantizacion | no disponible (formato TorchScript en float32) |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | MIT (checkpoint y repo); arquitectura vendida bajo Apache-2.0 (ver `NOTICE`) |
| Formato de pesos | TorchScript trazado y congelado (`.pt`) y checkpoint original (`.ckpt`) |

## Arquitectura y entrenamiento

La arquitectura base es LaMa, descrita en Suvorov et al., *Resolution-robust Large Mask Inpainting with Fourier Convolutions* (WACV 2022, arXiv:2109.07161). La innovación principal de LaMa es el uso de capas de convolución de Fourier (FFC), que combinan convoluciones estándar con transformadas de Fourier rápidas (FFT) para lograr un campo receptivo global sin apilar decenas de capas convolucionales. Esto permite rellenar máscaras grandes con coherencia semántica y textura a resoluciones variables.

El checkpoint `lama_large_512px.ckpt` es la variante "big-lama" (la de mayor capacidad dentro de la familia LaMa) afinada sobre 300 000 imágenes de manga y anime. El proceso de conversión a TorchScript traza el modelo con `torch.jit.trace` y lo congela, verificando que la salida trazada coincida con la ejecución eager con un error menor a `1e-3` en varias resoluciones y tamaños de lote. El grafo horneado incluye la binarización de la máscara (umbral 0,5), la construcción de la imagen enmascarada, el ensamblaje del tensor de 4 canales `cat([image*(1-mask), mask], dim=1)`, el clamp de salida a `[0, 1]` y la composición final. Quedan deliberadamente fuera del grafo el padding a múltiplo de 8, la conversión de color (BGR a RGB) y la normalización de uint8, por ser decisiones del llamador que afectan al pico de VRAM y al coste del plan FFT.

## Capacidades

- Inpainting de imágenes de anime y manga: rellena regiones enmascaradas con contenido coherente en estilo y textura.
- Manejo de máscaras grandes: gracias a las FFC, el modelo mantiene coherencia global incluso con áreas extensas a rellenar.
- Robustez a resolución: LaMa está diseñado para funcionar a distintas resoluciones sin reentrenamiento, siempre que las dimensiones sean múltiplos de 8.
- Procesamiento por lotes: soporta entrada `(N, 3, H, W)` apilando imágenes del mismo tamaño; para tamaños variables se puede padear a un tamaño común y recortar el resultado.
- Composición automática: la salida devuelve los píxeles fuera de la máscara intactos (composición `mask * predicted + (1 - mask) * image` horneada en el grafo).
- Ruta de pesos crudos alternativa: permite cargar el checkpoint con `lama_ffc.py` y usar `torch.compile` o `torch.export` si se necesita.
- No aplica: generación de texto, tool calling, agentes, razonamiento multi-paso, visión multimodal o audio. Es un modelo de visión puro para una única tarea.

## Casos de uso

- Restauración de paneles de manga dañados: el modelo puede rellenar roturas, manchas o zonas degradadas en escaneos antiguos. Se usa cargando el módulo TorchScript, aplicando `pad_to_modulo` a la imagen y pasando una máscara binaria de las zonas dañadas; la salida devuelve el panel restaurado con los píxeles intactos sin alterar.
- Eliminación de texto y bocadillos de diálogo en manga: para traducción o re-edición, se enmascaran las burbujas de texto y el modelo rellena el fondo subyacente con el estilo del dibujo, dejando la zona lista para insertar texto traducido.
- Eliminación de objetos no deseados en ilustraciones anime: marcas de agua, sellos, firmas o elementos sobrantes pueden enmascararse y eliminarse sin dejar rastro visible, gracias a la coherencia global de las FFC.
- Restauración de arte digital antiguo: ilustraciones con compresión excesiva, artefactos JPEG o zonas borrosas pueden reconstruirse parcialmente enmascarando las regiones afectadas.
- Preprocesamiento para datasets de entrenamiento: limpiar fondos o eliminar elementos no deseados en lotes de imágenes de anime/manga antes de usarlas para entrenar otros modelos (por ejemplo, LoRAs o clasificadores). El soporte de batching y la ruta de pesos crudos con `torch.compile` permiten procesar volúmenes grandes.
- Edición creativa de ilustraciones: cambiar elementos de una escena (quitar un personaje, alterar un fondo) enmascarando la región y dejando que el modelo genere el relleno coherente con el estilo del artista.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas cuantitativas (PSNR, SSIM, LPIPS) ni comparaciones con otros modelos de inpainting. La única verificación documentada es la coincidencia numérica entre la salida trazada y la ejecución eager (error < `1e-3`).

## Requisitos de hardware

- Tamaño del repositorio: 0,4 GB (incluye checkpoint original y módulo TorchScript).
- VRAM estimada: no disponible en la documentación. El propio autor advierte que el pico de VRAM se produce en las capas de Fourier y escala con `N x maxH x maxW`, por lo que recomienda agrupar por tamaño antes de hacer batching.
- GPU recomendadas: no especificadas. Dado que es un modelo de visión de tamaño medio (variante `lama_large`), es plausible que quepa en GPUs de consumo con 8-12 GB de VRAM, pero este dato no está confirmado en la información proporcionada.
- Opciones de despliegue: PyTorch con `torch.jit.load` (torch >= 2.1 requerido; exportado con torch 2.11.0). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que son específicos de modelos de lenguaje.
- Latencia y throughput: no disponibles. El autor indica que la FFT de LaMa es más rápida en tamaños con factores primos pequeños y que se reconstruye un plan cuFFT por cada nuevo par `(H, W)`, por lo que recomienda usar tamaños fijos (512, 768, 1024) en lugar de "siguiente múltiplo de 8" para cargas mixtas.

## Comparativa con modelos similares

| Modelo | Arquitectura | Formato | Licencia | Notas |
|---|---|---|---|---|
| `TareHimself/AnimeMangaInpainting-torchscript` | LaMa (FFC) afinado en 300k imágenes anime/manga | TorchScript + checkpoint | MIT | Sin dependencias de código; composición horneada |
| `dreMaz/AnimeMangaInpainting` | LaMa (FFC) afinado en 300k imágenes anime/manga | Checkpoint `.ckpt` | MIT | Modelo original; requiere código de la arquitectura para cargar |
| `advimman/lama` (original) | LaMa (FFC) entrenado en imágenes naturales | Checkpoints | Apache-2.0 | Modelo base sin afinado específico de anime/manga; no optimizado para ese dominio |
| `msxie92/MangaInpainting` | Pipeline de dos fases (inpainting semántico + síntesis de apariencia) | no disponible | no disponible | Enfoque distinto, específico de manga, pero sin distribución empaquetada en HuggingFace |

La diferencia principal frente al checkpoint original de `dreMaz` es operativa: el paquete TorchScript elimina la necesidad de portar el código de la arquitectura, a costa de perder flexibilidad (padding, conversión de color y normalización quedan fuera del grafo). Frente a `advimman/lama`, la ventaja es el afinado específico en dominio anime/manga, que produce resultados estilísticamente más coherentes en ese tipo de imágenes.

## Limitaciones y advertencias

- Dimensiones restringidas: la altura y anchura de la imagen deben ser múltiplos de 8. El padding no está horneado en el grafo; el llamador debe aplicarlo antes y recortar el resultado después.
- Preprocesamiento manual: el modelo espera float32 RGB en `[0, 1]`. Las imágenes OpenCV en BGR y los arrays uint8 deben convertirse explícitamente antes de la llamada.
- Sesgo de dominio: el modelo está afinado exclusivamente en imágenes de manga y anime. Su rendimiento en fotografías realistas u otros estilos artísticos no está garantizado y probablemente sea inferior al del LaMa original.
- Riesgo de alucinación visual: como todo modelo generativo de inpainting, puede inventar detalles que no estaban en la imagen original, especialmente en máscaras muy grandes o regiones con poca información contextual.
- Compatibilidad de torch: el módulo se exportó con torch 2.11.0; se espera que cargue con torch >= 2.1, pero si `torch.jit.load` falla en versiones antiguas, hay que re-ejecutar `to_torchscript.py` con la versión local.
- Coste de planes FFT: la FFT reconstruye un plan cuFFT por cada nuevo tamaño `(H, W)`, lo que penaliza cargas de trabajo con tamaños muy variados. Se recomienda fijar un conjunto reducido de resoluciones.
- Licencia dual: el repositorio es MIT, pero el código de arquitectura vendido (`lama_ffc.py`) permanece bajo Apache-2.0, según se indica en el archivo `NOTICE`. Esto no afecta al uso del módulo TorchScript, pero sí a la redistribución del código fuente incluido.
- Sin mantenimiento activo: el modelo tiene 0 descargas y 0 likes en el momento de la consulta; es un paquete reciente (creado en agosto de 2026) sin historial de uso en producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/TareHimself/AnimeMangaInpainting-torchscript
- Modelo original (checkpoint): https://huggingface.co/dreMaz/AnimeMangaInpainting
- Perfil del autor del checkpoint: https://huggingface.co/dreMaz
- Repositorio de la arquitectura LaMa: https://github.com/advimman/lama
- Paper de LaMa (arXiv): https://arxiv.org/abs/2109.07161
