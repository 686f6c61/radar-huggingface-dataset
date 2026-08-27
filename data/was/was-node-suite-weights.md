# WAS/was-node-suite-weights

## Resumen

El repositorio `WAS/was-node-suite-weights` no es un modelo único, sino un espejo estable de checkpoints de restauración de imágenes que el WAS Node Suite de ComfyUI carga en su nodo Power Preprocessor. Fue creado por el autor WAS para evitar que los nodos se rompan cuando un tercero mueve o elimina una copia de los pesos. Contiene 16 archivos de pesos (0,7 GB) organizados en dos carpetas: `denoise/` (SCUNet y NAFNet) y `low_light/` (HVI-CIDNet y Retinexformer). Ninguno de estos pesos ha sido entrenado por este proyecto; cada archivo conserva la licencia de su trabajo original, que se detalla en la tabla de la model card.

La relevancia de este repositorio es práctica: proporciona una fuente fiable y versionada de pesos para tareas de eliminación de ruido y mejora de imágenes con poca luz, utilizables directamente en flujos de ComfyUI. Al ser un mirror, no introduce innovación técnica propia, pero garantiza reproducibilidad y disponibilidad de los checkpoints originales. La licencia es per-file, lo que obliga a revisar cada archivo individualmente antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multiple: SCUNet (Swin-Conv-UNet), NAFNet (Nonlinear Activation Free Network), HVI-CIDNet (Color space + CIDNet), Retinexformer (Retinex-based Transformer) |
| Parametros totales | No disponible (depende de cada checkpoint; SCUNet ~17M, NAFNet width32 ~5M, width64 ~17M, Retinexformer ~1.6M, HVI-CIDNet no publicado) |
| Parametros activos | No aplicable (no es un modelo MoE) |
| Longitud de contexto | No aplicable (modelos de vision por computador) |
| Tipos de cuantizacion | No disponible (pesos en formato .pth y .safetensors, sin cuantizacion publicada) |
| Idiomas soportados | No aplicable (procesamiento de imagenes) |
| Licencia | Per-file: Apache-2.0 (SCUNet), MIT (NAFNet, HVI-CIDNet, Retinexformer) |
| Formato de pesos | .pth (PyTorch) y .safetensors |

## Arquitectura y entrenamiento

Al ser un repositorio de pesos, no hay una arquitectura unificada. Los checkpoints provienen de cuatro modelos publicados en la literatura:

- **SCUNet** (Zhang et al., 2022): red basada en Swin-Conv-UNet para denoising ciego, entrenada con síntesis de datos. El archivo `scunet_color_real_psnr.pth` corresponde a la versión en color con pérdida PSNR.
- **NAFNet** (Chen et al., ECCV 2022): red sin funciones de activación no lineales (Nonlinear Activation Free), entrenada en el dataset SIDD para denoising. Hay dos variantes: width32 y width64.
- **HVI-CIDNet** (Yan et al., CVPR 2025): introduce un nuevo espacio de color HVI (Hue, Value, Intensity) para mejora de imágenes con poca luz. Se incluyen cuatro variantes entrenadas en diferentes datasets: generalization, SICE, Sony-total-dark y FiveK.
- **Retinexformer** (Cai et al., ICCV 2023): transformer basado en la teoría Retinex para mejora de baja luminosidad. Se incluyen ocho variantes: NTIRE, LOL-v1, LOL-v2-real, LOL-v2-synthetic, FiveK, SID, SMID, SDSD-indoor y SDSD-outdoor.

Ninguno de estos modelos ha sido entrenado por el autor del repositorio; los pesos son copias de los lanzamientos oficiales. No se documenta el proceso de entrenamiento en este repo, pero las publicaciones originales describen datasets y metodologías específicas.

## Capacidades

- **Denoising de imagenes**: elimina ruido de fotografias, especialmente en condiciones de poca luz o con sensores ruidosos. Los checkpoints de SCUNet y NAFNet estan especializados en este dominio.
- **Mejora de imagenes con poca luz**: los modelos HVI-CIDNet y Retinexformer iluminan escenas oscuras, recuperando detalles y color. Cada variante esta entrenada para un tipo de escenario (general, SICE, Sony, FiveK, LOL, etc.).
- **Restauracion de imagenes en general**: aunque el foco es denoising y low-light, los modelos pueden aplicarse a tareas relacionadas como eliminacion de artefactos de compresion o mejora de contraste.
- **Integracion con ComfyUI**: los pesos estan disenados para ser cargados por el nodo Power Preprocessor del WAS Node Suite, lo que permite usarlos en pipelines de generacion y edicion de imagenes sin escribir codigo.
- **Formato safetensors**: los archivos de HVI-CIDNet estan en formato seguro, lo que facilita su carga en entornos que priorizan seguridad.
- **Multiples variantes por tarea**: la disponibilidad de varios checkpoints para low-light (LOL, FiveK, SID, etc.) permite elegir el modelo mas adecuado segun el tipo de imagen de entrada.

## Casos de uso

- **Preprocesado de imagenes en flujos de ComfyUI**: el caso principal. Un usuario de ComfyUI puede conectar el nodo Power Preprocessor con estos pesos para limpiar o iluminar imagenes antes de pasarlas a un modelo de difusion, mejorando la calidad de la generacion.
- **Restauracion de fotografias antiguas o escaneadas**: los modelos de denoising (SCUNet, NAFNet) reducen el ruido de escaneos antiguos o fotos con grano, facilitando su posterior edicion o impresion.
- **Mejora de imagenes de vigilancia o camaras de seguridad**: los checkpoints de low-light (especialmente HVI-CIDNet Sony-total-dark y Retinexformer SID) pueden iluminar grabaciones nocturnas para identificar detalles.
- **Preprocesado para vision artificial**: antes de aplicar algoritmos de deteccion de objetos o segmentacion, se puede usar denoising para mejorar la precision en condiciones adversas.
- **Produccion audiovisual y fotografia**: los modelos de low-light permiten recuperar tomas subexpuestas sin necesidad de rehacer la sesion, ahorrando tiempo en postproduccion.
- **Investigacion en restauracion de imagenes**: al ser un mirror de pesos oficiales, sirve como punto de partida para reproducir experimentos o comparar arquitecturas sin depender de enlaces externos inestables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Los modelos originales reportan metricas en sus respectivos papers (por ejemplo, Retinexformer alcanza PSNR de 25.16 dB en LOL-v1, NAFNet 34.81 dB en SIDD), pero este repositorio no incluye dichos datos. Se recomienda consultar las publicaciones originales para metricas detalladas.

## Requisitos de hardware

- **VRAM estimada**: los modelos son relativamente ligeros. SCUNet (~17M parametros) y NAFNet width32 (~5M) pueden ejecutarse en GPUs con 2-4 GB de VRAM. Retinexformer (~1.6M) es aun mas ligero. HVI-CIDNet no tiene parametros publicados, pero al ser un modelo de restauracion, se estima que cabe en GPUs de gama media.
- **GPU recomendadas**: cualquier GPU con soporte CUDA de 4 GB o mas (GTX 1060, RTX 2060, RTX 3060, etc.) es suficiente para inferencia. No se requiere GPU de datacenter.
- **Compatibilidad con consumer GPU**: si, todos los modelos caben en GPUs de consumo actuales. Incluso una GTX 1650 con 4 GB podria ejecutar la mayoria de los checkpoints.
- **Opciones de despliegue**: los pesos estan en formato PyTorch (.pth) y safetensors, por lo que pueden cargarse con PyTorch directamente. En el contexto de ComfyUI, se usan a traves del WAS Node Suite. Tambien se pueden integrar en scripts Python personalizados con las librerias originales de cada modelo.
- **Latencia y throughput**: no disponible. Depende del hardware y del tamaño de la imagen de entrada. En una GPU moderna, la inferencia de una imagen de 512x512 suele tomar menos de un segundo para estos modelos.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea principal | Licencia | Formato |
|---|---|---|---|---|
| SCUNet (en este repo) | ~17M | Denoising ciego | Apache-2.0 | .pth |
| NAFNet width32 (en este repo) | ~5M | Denoising (SIDD) | MIT | .pth |
| Retinexformer (en este repo) | ~1.6M | Low-light enhancement | MIT | .pth |
| HVI-CIDNet (en este repo) | no disponible | Low-light enhancement | MIT | .safetensors |
| SwinIR (alternativa) | ~11.8M | Restauracion general (SR, denoising) | Apache-2.0 | .pth |
| MIRNet-v2 (alternativa) | ~31M | Restauracion general | Apache-2.0 | .pth |

La comparativa se limita a modelos de restauracion de imagenes. Este repositorio no compite con alternativas, sino que las agrupa. La ventaja principal es la conveniencia de tener varios checkpoints en un solo lugar con licencias claras.

## Limitaciones y advertencias

- **Licencia per-file**: cada archivo tiene su propia licencia. Aunque la mayoria son MIT o Apache-2.0, es obligatorio revisar la tabla de la model card antes de usar cualquier peso en un producto comercial.
- **Sin entrenamiento propio**: el autor del repositorio no ha entrenado ni modificado los pesos. Cualquier problema de rendimiento o sesgo proviene de los modelos originales.
- **Especializacion de los checkpoints**: los modelos de low-light estan entrenados en datasets especificos (LOL, FiveK, SID, etc.). Usar un checkpoint en un dominio muy distinto puede producir resultados suboptimos.
- **Riesgo de alucinacion visual**: como cualquier modelo de restauracion, pueden inventar detalles en zonas muy oscuras o con ruido extremo, especialmente los modelos de low-light.
- **Dependencia de ComfyUI**: aunque los pesos son utilizables de forma independiente, el repositorio esta pensado para el WAS Node Suite. Fuera de ese ecosistema, habra que cargarlos manualmente con las librerias originales.
- **Sin mantenimiento activo**: el repositorio fue creado en agosto de 2026 y no muestra actualizaciones posteriores. Los enlaces a los origenes podrian quedar obsoletos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/WAS/was-node-suite-weights
- WAS Node Suite en GitHub: https://github.com/WASasquatch/was-node-suite-comfyui
- Documentacion de WAS Node Suite en DeepWiki: https://deepwiki.com/ltdrdata/was-node-suite-comfyui
- Pagina de registro de ComfyUI (WAS Node Suite Revised): https://registry.comfy.org/nodes/was-ns
- SCUNet (original): https://github.com/cszn/SCUNet
- NAFNet (original): https://github.com/megvii-research/NAFNet
- HVI-CIDNet (original): https://github.com/Fediory/HVI-CIDNet
- Retinexformer (original): https://github.com/caiyuanhao1998/Retinexformer
