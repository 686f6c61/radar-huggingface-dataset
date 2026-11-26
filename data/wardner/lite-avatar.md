# wardner/Lite-Avatar

## Resumen

Lite-Avatar es un sistema de síntesis facial para avatares digitales 2D orientado a la inferencia en el borde (edge AI). Lo desarrolla el usuario wardner y se publica bajo licencia Apache 2.0. El modelo resuelve un problema muy concreto: convertir una señal de audio en una secuencia de parámetros de boca (32 dimensiones) y, a partir de ellos, renderizar fotograma a fotograma la región bucal de un avatar 2D. No es un modelo de lenguaje ni un generador de imagen generalista, sino un pipeline de lip-sync especializado.

La relevancia técnica está en que toda la cadena (frontend espectral fbank, encoder Paraformer, modelo de boca y decoder de imagen) se ejecuta íntegramente en la NPU integrada del SoC Rockchip RK3588 mediante el runtime RKNN2, sin necesidad de PyTorch en el dispositivo. El repositorio ocupa 0,6 GB e incluye 18 avatares oficiales empaquetados junto a los pesos en formato RKNN.

La arquitectura combina un encoder acústico tipo Paraformer con un modelo de predicción de parámetros bucales y un decoder condicionado por AdaIN que genera parches de boca de 256×256 píxeles. El modelo de boca es independiente del avatar; solo el decoder es específico de cada personaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline acústico-visual: frontend fbank + encoder Paraformer + predictor de parámetros bucales + decoder AdaIN por avatar |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa audio por tramas; ~31 ms de inferencia por segundo de audio) |
| Tipos de cuantizacion | w8a8 (modelo de boca), fp16 (fbank y encoder), w8a8 en decoders |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | RKNN (RKNN2), NPZ (numpy) para net_encode y bs_proj; no incluye .pt |
| Tamano del repositorio | 0,6 GB |
| SoC objetivo | Rockchip RK3588 (NPU integrada) |
| Runtime NPU | librknnrt.so 2.5.0 (RKNN2) |
| Driver | rknpu 0.9.8 |
| Resoluciones de render | 256, 384 (por defecto), 512 |
| Avatares incluidos | 18 oficiales + 1 de ejemplo |

## Arquitectura y entrenamiento

El sistema se descompone en cuatro etapas encadenadas. La primera es un frontend de espectrograma fbank (`fbank_spec_b160000_fp16.rknn`, 1,5 MB) que transforma la forma de onda de audio en características espectrales. La segunda es un encoder Paraformer (`enc_b168_v4_fp16.rknn`, 336 MB) que extrae representaciones acústicas de mayor nivel. La tercera es el modelo de boca (`model_1_w8a8_ah0.9999.rknn`, 92 MB), que mapea esas características a 32 parámetros de articulación bucal. La cuarta es un decoder específico por avatar que, condicionado por modulación AdaIN y por 150 fotogramas de referencia, genera parches de boca de 256×256 píxeles.

El modelo de boca es agnóstico al avatar: un único RKNN sirve para cualquier personaje, mientras que el decoder se instancia por avatar en tres variantes de resolución. La codificación de fotogramas de referencia (`net_encode`) y la proyección AdaIN (`bs_proj`) se reimplementaron en numpy/OpenCV para eliminar la dependencia de PyTorch en el dispositivo; solo se ejecutan 150 fotogramas en tiempo de carga. No se detalla en la información disponible el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO (no aplicables a este tipo de modelo).

## Capacidades

- Generación de animación facial 2D sincronizada con audio (lip-sync) fotograma a fotograma.
- Predicción de 32 parámetros de articulación bucal a partir de características acústicas.
- Renderizado de la región bucal en tres resoluciones (256, 384 y 512 píxeles).
- Intercambio de avatar sin reejecutar el modelo de boca: solo se sustituye el decoder y los materiales del personaje.
- Ejecución completa en NPU RK3588 sin PyTorch ni fallback a CPU.
- Procesamiento de audio en tiempo casi real (~31 ms de inferencia por segundo de audio).
- Integración como tarjeta de cómputo en la interfaz wdnwebui mediante el manifiesto `lite-avatar.json`.
- Verificación de integridad mediante `SHA256SUMS` sobre todo el directorio.

## Casos de uso

- **Avatares de atención al cliente en kioscos o terminales empotrados**: el pipeline completo corre en un RK3588 de bajo consumo, lo que permite desplegar un avatar parlante en un dispositivo sin GPU dedicada ni conexión a la nube, respondiendo a audio en tiempo casi real.
- **Señalización digital interactiva en comercios**: con 18 avatares oficiales y la posibilidad de descargar más desde la galería de ModelScope, se puede rotar el personaje según campaña sin reentrenar el modelo de boca, solo sustituyendo el decoder.
- **Generación de vídeo de presentación a partir de audio pregrabado**: dado que procesa un segundo de audio en ~31 ms, es viable generar por lotes vídeos de locución con un rostro 2D consistente para formación interna o marketing.
- **Asistentes por voz en dispositivos domóticos**: la ausencia de dependencia de PyTorch y el tamaño contenido del repositorio (0,6 GB) facilitan el empaquetado en firmware de electrodomésticos o paneles de control con RK3588.
- **Prototipado de personajes virtuales en investigación de HCI**: la separación entre modelo de boca y decoder permite estudiar el efecto de distintos estilos faciales sobre la percepción del habla sin variar el componente acústico.
- **Sistemas de accesibilidad con lectura labial sintética**: el modelo puede animar un rostro que articule el audio de un usuario con discapacidad auditiva, mostrando los movimientos bucales correspondientes en una pantalla empotrada.
- **Integración en pipelines de creación de contenido**: los scripts `export_avatar_weights.py` y `build_decoders_rknn.py` permiten incorporar nuevos personajes al flujo de producción, convirtiendo pesos torch a RKNN en una máquina de preparación (denominada "119" en la documentación) antes de copiar los artefactos al dispositivo.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Modelo de boca vs ONNX (coseno) | 0,999995 |
| Modelo de boca vs ONNX (max_abs_err) | 0,00135 |
| Decoder w8a8 vs fp32 (coseno) | 0,99985 |
| Decoder w8a8 vs fp32 (PSNR) | 45 dB |
| Decoder w8a8 vs fp32 (PSNR en JPEG final, región bucal) | 44 dB |
| End-to-end en NPU (au cos) | 0,9999676 |
| End-to-end en NPU (mouth cos) | 0,9998871 |
| Inferencia por segundo de audio | ~31 ms |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, dado que el modelo no es un modelo de lenguaje.

## Requisitos de hardware

- **SoC obligatorio**: Rockchip RK3588 con NPU integrada. No se admite RK182x ni el runtime RKNN3; cargar los modelos con `wdnai._librknn` produce el error `Invalid model magic`.
- **Runtime**: `librknnrt.so` versión 2.5.0 (RKNN2), instalado como paquete `rknn2-runtime` en `/usr/lib/aarch64-linux-gnu/`, con driver rknpu 0.9.8.
- **VRAM/RAM**: no se especifica un requisito de memoria; el repositorio completo ocupa 0,6 GB y el encoder Paraformer es el componente mayor (336 MB).
- **GPU dedicada**: no aplica; el diseño está pensado exclusivamente para NPU Rockchip. No hay soporte para A100, H100 ni RTX 4090.
- **Fallback a CPU**: no existe. Si falta el decoder de la resolución solicitada o falla la carga en NPU, el sistema devuelve error directamente.
- **Opciones de despliegue**: integración nativa en wdnwebui a través de la tarjeta de cómputo `[AV]数字人 LiteAvatar 渲染` (con `requires_cards = 0`, es decir, sin ocupar tarjetas de expansión EP); el renderizador vive en el paquete `wdnai.avatar`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- **Latencia**: aproximadamente 31 ms de inferencia por cada segundo de audio procesado en la NPU del RK3588.
- **Preparación de nuevos avatares**: requiere una máquina aparte con PyTorch y rknn-toolkit2 2.5.0 para ejecutar `export_avatar_weights.py` y `build_decoders_rknn.py`.

## Comparativa con modelos similares

| Modelo | Tipo | Hardware objetivo | Contexto / resolución | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Lite-Avatar | Lip-sync 2D en edge | RK3588 NPU | Parches de 256/384/512 px | Apache 2.0 | Hugging Face |
| LiteAvatarGallery (HumanAIGC) | Galería de avatares para LiteAvatar | Genérico (pesos torch) | no disponible | no disponible en la información | ModelScope |
| Alternativas de lip-sync en GPU | no disponible | GPU NVIDIA | no disponible | no disponible | no disponible |

La información proporcionada no incluye datos de rendimiento ni especificaciones de otros modelos de lip-sync comparables, por lo que no es posible establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- **Dependencia total de hardware específico**: solo funciona en RK3588 con RKNN2; no hay ejecución en CPU, GPU convencional ni en otras NPU de Rockchip.
- **Sin fallback**: la ausencia del decoder en la resolución solicitada o un fallo de carga en la NPU provoca un error inmediato, sin degradación controlada.
- **Solo renderiza la boca**: el modelo genera parches bucales de 256×256; el resto del rostro y el fondo provienen del vídeo de referencia (`bg_video.mp4`) y de los fotogramas precalculados, por lo que no sintetiza el rostro completo ni la expresividad global.
- **Avatares nuevos requieren preparación externa**: los paquetes oficiales traen pesos torch (`.pt`) que no se pueden usar directamente en el dispositivo; es necesario convertirlos en una máquina con PyTorch y rknn-toolkit2 antes de copiar los artefactos.
- **Riesgo de alucinación**: no aplica en el sentido de generación de texto; el riesgo equivalente es la desincronización o artefactos en la articulación cuando el audio presenta ruido, solapamiento de voces o idiomas fuera de la distribución de entrenamiento.
- **Idiomas**: no se especifica qué lenguas cubre el encoder Paraformer ni el modelo de boca; la documentación no detalla el reparto lingüístico del entrenamiento.
- **Licencia**: Apache 2.0 permite uso comercial, pero conviene revisar por separado las condiciones de los avatares descargados desde ModelScope, ya que su licencia puede diferir de la del modelo.
- **Integridad**: se recomienda verificar `SHA256SUMS` antes del despliegue, ya que el repositorio incluye pesos binarios RKNN que no son inspeccionables de forma trivial.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/wardner/Lite-Avatar
- SDK wdnai: https://huggingface.co/wardner/wdnai
- Galería oficial de avatares en ModelScope: https://modelscope.cn/models/HumanAIGC-Engineering/LiteAvatarGallery
