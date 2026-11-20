# Xalcker/perspectia-models

## Resumen

PerspectIA Models es un conjunto de conversiones del modelo Big-LaMa (Large Mask Inpainting) de los autores originales de LaMa, empaquetado por el usuario Xalcker para ejecución en dispositivos móviles. El repositorio no contiene pesos nuevos ni un modelo entrenado desde cero: redistribuye los pesos originales de Big-LaMa (entrenados sobre Places2) en dos formatos optimizados para inferencia on-device, Core ML para iOS 17+ y LiteRT (antes TFLite) para Android. El objetivo es resolver la eliminación de objetos y el relleno de fondo en la aplicación PerspectIA, que necesita reconstruir la región oculta tras un objeto en su vista 3D.

La relevancia del repositorio es fundamentalmente de ingeniería de despliegue: demuestra cómo portar un modelo de inpainting basado en convoluciones de Fourier a aceleradores móviles (GPU de Apple, NPU de Qualcomm) sustituyendo la FFT por productos matriciales equivalentes (DFT) y aplicando palettización de pesos. El resultado es un modelo de 512×512 píxeles que corre en unos 250 ms en GPU de Apple Silicon y 184 ms en la NPU de un Snapdragon 8 Elite, con una pérdida de precisión controlada (error absoluto medio de 0,050 con palettización a 8 bits en Core ML, 3e-6 en float32 para LiteRT).

El tamaño del repositorio es de 0,2 GB y la licencia es Apache-2.0, heredada del repositorio original de LaMa. No se trata de un modelo de lenguaje ni de un transformer generativo de texto: es un modelo de visión para image-to-image (inpainting), por lo que las secciones de esta ficha se adaptan a esa naturaleza.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Big-LaMa (inpainting con convoluciones de Fourier, basada en red generativa con encoder-decoder y FourierUnit) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada fija de 512×512 píxeles) |
| Tipos de cuantizacion | Core ML: float16 con palettización k-means a 8 bits; LiteRT: float32 (ejecutable en float16 en NPU QNN) |
| Idiomas soportados | no aplica (modelo de imagen, sin componente textual) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.mlpackage` (Core ML, mlprogram) y `.tflite` (LiteRT, empaquetado en ZIP) |

## Arquitectura y entrenamiento

Big-LaMa es un modelo de inpainting de imágenes propuesto por Suvorov et al. en el artículo *Resolution-robust Large Mask Inpainting with Fourier Convolutions* (WACV 2022). Su innovación principal son las convoluciones de Fourier, que permiten un campo receptivo global y hacen que el modelo sea robusto a máscaras grandes y a resoluciones distintas de las de entrenamiento. Los pesos redistribuidos aquí son los originales entrenados por los autores de LaMa sobre el dataset Places2; este repositorio no realiza ningún reentrenamiento ni ajuste fino, solo conversión de formato.

La conversión aplica dos transformaciones técnicas relevantes. En Core ML se usa `torch.jit.trace` y coremltools 8.3, se convierte a float16 y se aplica palettización k-means a 8 bits; el modelo debe ejecutarse con `computeUnits = .cpuAndGPU` porque la FFT no está soportada en el Neural Engine. En LiteRT se reemplaza cada `rfftn`/`irfftn` de los `FourierUnit` por una DFT equivalente expresada como productos matriciales en tensores 4-D, y las tres `ConvTranspose2d` con `output_padding` se reescriben como convolución transpuesta sin padding más un recorte; el export se hace con litert-torch 0.10 (ai-edge-torch 0.7.2). El wrapper sigue el esquema de Qualcomm AI Hub: se enmascara la zona a rellenar, la máscara se pasa como cuarto canal y la predicción se pega de vuelta solo dentro de la máscara.

## Capacidades

- Inpainting de imágenes de 512×512 píxeles: rellena la región indicada por una máscara binaria (1 = rellenar) con contenido coherente con el contexto.
- Eliminación de objetos: dado un objeto y su máscara, reconstruye el fondo oculto, caso de uso principal en la vista 3D de PerspectIA.
- Entrada image-to-image con máscara explícita; salida de la misma forma que la imagen de entrada con la zona enmascarada sustituida.
- Ejecución on-device: Core ML en iOS 17+ (GPU/CPU) y LiteRT en Android (GPU/NPU, con soporte de delegado QNN HTP).
- No soporta tool calling, agentes, razonamiento multi-step ni capacidades multilingües: es un modelo puramente visual.
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Eliminación de objetos en apps de retoque fotográfico: el usuario pinta una máscara sobre el objeto y el modelo rellena el fondo en ~250 ms en GPU de Apple Silicon, lo que permite previsualización casi interactiva.
- Reconstrucción de fondo en vistas 3D de realidad aumentada: PerspectIA lo usa para rellenar la región oculta tras un objeto colocado en la escena, manteniendo coherencia visual con el entorno.
- Limpieza de marcas de agua o logotipos en imágenes de catálogo: con una máscara ajustada, el modelo reconstruye la textura subyacente sin intervención manual.
- Restauración de fotografías con elementos no deseados (fechas impresas, manchas, objetos menores): útil en apps de edición móvil que necesitan procesamiento local sin subir la imagen a un servidor.
- Preprocesado en pipelines de visión por computador: eliminar objetos distractores antes de tareas de detección o segmentación, aprovechando la ejecución en NPU de Android para no bloquear la CPU.
- Funcionalidad offline en dispositivos sin conectividad: al ejecutarse íntegramente on-device, permite inpainting en apps de campo, kioscos o entornos con requisitos de privacidad estrictos.
- Prototipado rápido en iOS/Android: los formatos `.mlpackage` y `.tflite` se integran directamente en Xcode y en el runtime LiteRT, lo que reduce el trabajo de portado frente a usar PyTorch en el dispositivo.

## Benchmarks y rendimiento

Los datos publicados en la model card comparan la salida de las conversiones con el modelo PyTorch original (con FFT), midiendo el error absoluto medio dentro de la máscara y la velocidad de inferencia.

| Conversion | Precision | Error absoluto medio (dentro de mascara) | Velocidad |
|---|---|---|---|
| Core ML, 8 bits | float16 + palettizacion 8 bits | 0,050 | ~250 ms en GPU de Mac (Apple Silicon) |
| LiteRT, float32 | float32 | 3e-6 | 184 ms en NPU Snapdragon 8 Elite (QNN HTP, float16) |

En la NPU de Snapdragon, QNN compila el grafo la primera vez (2–4 minutos); con la caché de contexto de QNN, las cargas posteriores tardan menos de un segundo. No se han publicado resultados de benchmarks estándar de inpainting (FID, LPIPS, PSNR) en la información disponible.

## Requisitos de hardware

- Core ML: requiere iOS 17+ o macOS con Apple Silicon; debe ejecutarse con `computeUnits = .cpuAndGPU` porque la FFT no está soportada en el Neural Engine. El paquete ocupa 50 MB.
- LiteRT: requiere Android con delegado GPU o NPU; el ZIP ocupa 190 MB (206 MB descomprimido) por el uso de float32. Verificado en NPU Snapdragon 8 Elite con QNN HTP en float16.
- VRAM/RAM estimada: no disponible de forma explícita; por el tamaño de los artefactos (50 MB Core ML, 206 MB LiteRT descomprimido) el consumo es compatible con dispositivos móviles de gama alta.
- No cabe ni está pensado para GPU de escritorio de datacenter (A100, H100); el objetivo es inferencia en móvil y Apple Silicon.
- Opciones de despliegue: Core ML en Xcode/iOS, LiteRT (antes TFLite) en Android con delegados GPU/NPU y QNN para Snapdragon.
- Latencia: ~250 ms en GPU de Apple Silicon y 184 ms en NPU Snapdragon 8 Elite; throughput no publicado.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Formato on-device | Licencia | Notas |
|---|---|---|---|---|---|
| PerspectIA Models (Big-LaMa convertido) | no disponible | 512×512 | Core ML, LiteRT | Apache-2.0 | Conversion enfocada a movil; FFT sustituida por DFT en LiteRT |
| LaMa original (advimman/lama) | no disponible | variable (robusto a resolucion) | PyTorch | Apache-2.0 | Requiere FFT y no corre directamente en aceleradores moviles |
| Big-LaMa (smartywu/big-lama) | no disponible | 512×512 | PyTorch | Apache-2.0 | Pesos originales de los que parte esta conversion |
| Qualcomm AI Hub LaMa | no disponible | 512×512 | QNN / AI Hub | Apache-2.0 (modelo base) | Wrapper de referencia citado por el autor para el esquema de mascara |

## Limitaciones y advertencias

- No es un modelo nuevo: los pesos son los originales de Big-LaMa entrenados sobre Places2; la calidad de inpainting es la del modelo base, sin mejoras.
- El dataset Places2 tiene sesgos de composición y cobertura geográfica; el relleno puede ser menos fiable en escenas poco representadas.
- Riesgo de resultados visualmente plausibles pero incorrectos: el inpainting genera contenido sintético, no recupera la información real oculta.
- Core ML no puede usar el Neural Engine por la FFT; queda limitado a CPU/GPU en Apple, lo que puede afectar a la batería en uso intensivo.
- La versión LiteRT en float32 ocupa 206 MB descomprimida, lo que puede ser problemático en apps con límites de tamaño o en dispositivos de gama baja.
- La primera compilación en NPU Snapdragon tarda 2–4 minutos; sin caché de contexto la experiencia inicial es lenta.
- La licencia Apache-2.0 cubre el código y los pesos, pero el autor advierte de que debe verificarse los términos del dataset Places2 para el caso de uso concreto.
- No hay información sobre idiomas, texto ni capacidades de lenguaje: no debe evaluarse como modelo de lenguaje.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción más allá de la app del autor.

## Enlaces

- Hugging Face: https://huggingface.co/Xalcker/perspectia-models
- Repositorio original de LaMa: https://github.com/advimman/lama
- Pesos Big-LaMa (copia): https://huggingface.co/smartywu/big-lama
- Paper de LaMa (Suvorov et al., WACV 2022): no disponible como enlace directo en la información proporcionada
- Qualcomm AI Hub (referencia del wrapper de LaMa): no disponible como enlace directo en la información proporcionada
- coremltools: no disponible como enlace directo en la información proporcionada
- litert-torch / ai-edge-torch: no disponible como enlace directo en la información proporcionada
