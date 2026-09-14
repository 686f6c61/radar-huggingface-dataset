# zhaoyangjia/PULSE

## Resumen

PULSE es un códec neuronal de imagen asimétrico y de tasa variable orientado a compresión práctica en hardware con recursos limitados. No es un modelo de lenguaje ni un transformer generativo: es un sistema de compresión de imágenes aprendido que combina un decodificador de complejidad ultrabaja, codificación entrópica determinista (bit-exacta) y optimización por MSE o perceptual. Lo publica el usuario `zhaoyangjia` en HuggingFace, aunque el código de referencia vive en el repositorio `microsoft/GenCodec` (carpeta `PULSE`).

Su propuesta diferencial es el coste computacional en recepción: el receptor base requiere aproximadamente 5,2 kMAC/píxel y puede decodificar en un único hilo de CPU, lo que lo aleja de los códecs neuronales que dependen de GPU. El repositorio incluye cuatro variantes (dos optimizadas por MSE y dos perceptuales/ROI) con receptores de ~2,7, ~5,2 y ~20 kMAC/píxel, y cada una soporta ocho niveles de calidad (QP 0–7). La licencia es MIT y el tamaño del repositorio en HuggingFace es de 0,4 GB.

El interés actual del modelo radica en la promesa de compresión neuronal con transporte entrópico reproducible entre backends y con herramientas de despliegue para CPU, GPU H100 y NPU móvil. El paper asociado está anunciado como "coming soon", por lo que no hay resultados de evaluación tasa-distorsión publicados en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Códec neuronal de imagen asimétrico y de tasa variable, con predicción entera de CDF (Integer Linear CDF) y Meta Prior adaptativo al contenido; detalles de la red no especificados |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no aplica en el sentido de cuantización de pesos de LLM; el control entrópico usa aritmética entera (`entropy_control_int.pt`) |
| Idiomas soportados | no aplica (códec de imagen) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`model.pt`, `config.json`, `entropy_control_int.pt`); flujo comprimido propio en formato `.pulse` |
| Variantes | `pulse-s-mse`, `pulse-mse`, `pulse-perceptual`, `pulse-l-perceptual` |
| Complejidad del receptor | ~2,7 kMAC/píxel (`pulse-s-mse`); ~5,2 kMAC/píxel (`pulse-mse`, `pulse-perceptual`); ~20 kMAC/píxel (`pulse-l-perceptual`) |
| Niveles de calidad | 8 QP (0–7) por cada variante |
| Objetivo de optimizacion | MSE (`pulse-s-mse`, `pulse-mse`); perceptual / ROI con ajuste fino para caras y texto (`pulse-perceptual`, `pulse-l-perceptual`) |
| Libreria | PyTorch |
| Tamano del repositorio | 0,4 GB |
| Descargas / likes | 0 / 0 |
| Fecha de publicacion | 2026-09-14 |

## Arquitectura y entrenamiento

La información disponible describe un códec asimétrico: la codificación puede ser más costosa que la decodificación, y es esta última la que se optimiza para ser ultraligera. Cada variante se reparte en tres ficheros que deben mantenerse juntos: `config.json`, `model.pt` y `entropy_control_int.pt`. El transporte entrópico se resuelve con predicción entera de CDF y codificación rANS en CPU, con un Meta Prior adaptativo al contenido; esto permite un transporte entrópico determinista y bit-exacto entre plataformas distintas.

Las variantes cubren dos objetivos de optimización: MSE (fidelidad medida en error cuadrático) y perceptual/ROI, esta última con ajuste fino perceptual orientado a caras y texto. No se especifican en la información proporcionada el número de tokens o imágenes de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO (no aplicables a un códec). Tampoco se detalla la topología interna de la red más allá de la existencia del Meta Prior y del modelo entrópico.

Las pruebas de empaquetado del 12 de septiembre de 2026 verificaron los ocho QP de las cuatro variantes en CPU y CUDA: los bytes de transporte nativo y las reconstrucciones uint8 coincidieron con la implementación original en el mismo backend. El envoltorio del códec añade 32 bytes alrededor del transporte nativo. El propio autor señala que se trata de comprobaciones de compatibilidad y no de una nueva evaluación tasa-distorsión.

## Capacidades

- Compresión de imágenes a tasa variable: ocho niveles de calidad (QP 0–7) por variante, lo que permite ajustar el compromiso entre bits y fidelidad.
- Decodificación en CPU de un solo hilo, con receptores de entre ~2,7 y ~20 kMAC/píxel según la variante.
- Codificación entrópica determinista y bit-exacta entre backends mediante predicción entera de CDF y rANS en CPU, con Meta Prior adaptativo al contenido.
- Optimización dual: variantes MSE (fidelidad numérica) y variantes perceptuales/ROI con ajuste fino orientado a caras y texto.
- Soporte de región de interés (ROI) en las variantes perceptuales.
- Herramientas completas de códec: entrenamiento, compresión y descompresión independientes en formato `.pulse`, y despliegue optimizado para CPU, GPU H100 y NPU móvil.
- Verificación de integridad: `manifest.json` y `SHA256SUMS` registran las sumas de comprobación de los ficheros de inferencia.

No se documentan en la información disponible capacidades de generación de texto, razonamiento, código, matemáticas, visión descriptiva, tool calling, agentes ni multilingüismo, ya que no es un modelo de lenguaje.

## Casos de uso

- Compresión de imágenes en servidores sin GPU: al decodificar en un solo hilo de CPU (~5,2 kMAC/píxel en la variante base), puede integrarse en backends o microservicios que no disponen de acelerador gráfico para servir miniaturas o versiones optimizadas.
- Aplicaciones móviles y edge: las herramientas de despliegue para NPU móvil y el bajo coste del receptor permiten descomprimir imágenes en el propio dispositivo sin depender de la nube.
- Bibliotecas y archivos fotográficos: los ocho niveles de QP por variante facilitan políticas de almacenamiento escalonadas (alta calidad para originales, QP alto para copias de consulta).
- Compresión de retratos y selfies: la variante perceptual con ajuste fino para caras está pensada para preservar la calidad subjetiva en regiones faciales con menos bits.
- Documentos y capturas de pantalla: el ajuste fino orientado a texto de las variantes perceptuales busca mantener la legibilidad de tipografía y gráficos en capturas y escaneos.
- Codificación ROI en imágenes médicas o de inspección: la optimización por región de interés permite asignar más tasa a zonas críticas y menos al fondo, útil cuando se conoce la localización del detalle relevante.
- Pipelines de publicación web y CI/CD: los scripts `compress.py` y `decompress.py` pueden invocarse por lotes con un QP fijo para generar assets consistentes en un flujo automatizado de build.
- Recompresión y transcodificación masiva: al ser un códec independiente con formato propio `.pulse`, puede desplegarse como paso intermedio en procesos por lotes de normalización de un catálogo de imágenes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de tasa-distorsión (por ejemplo, PSNR, MS-SSIM o BD-rate) ni comparaciones cuantitativas con otros códecs; el paper en arXiv figura como "coming soon". Las únicas comprobaciones descritas son de empaquetado y compatibilidad (bytes de transporte y reconstrucciones uint8 idénticos entre CPU y CUDA), que el propio autor no considera una evaluación tasa-distorsión.

## Requisitos de hardware

- La inferencia de decodificación no requiere GPU: la variante base funciona en un único hilo de CPU con ~5,2 kMAC/píxel.
- VRAM estimada para inferencia en CPU: 0; no se especifica VRAM para ejecución en GPU.
- Se mencionan herramientas de despliegue optimizadas para CPU, GPU H100 y NPU móvil, pero no se detallan requisitos concretos de memoria por variante.
- Cabría esperar que funcione en hardware de consumo (portátiles, Raspberry Pi, teléfonos) dado el objetivo declarado de compresión en hardware con recursos limitados; no se confirma con cifras.
- Opciones de despliegue: scripts propios del repositorio (`compress.py`, `decompress.py`, `download_models.py`). No aplican servidores de inferencia de LLM como vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

En la información proporcionada no se incluyen comparativas con otros códecs. A continuación se ofrece una comparación cualitativa basada en conocimiento general, no en los datos aportados; los valores concretos de rendimiento y parámetros de las alternativas se marcan como no disponibles.

| Códec / modelo | Tipo | Decodificación en CPU | Tasa variable | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PULSE (zhaoyangjia) | Neuronal aprendido, asimétrico | Sí, un solo hilo (~2,7–20 kMAC/píxel) | 8 niveles QP por variante | MIT | HuggingFace + GitHub |
| JPEG | Tradicional (DCT) | Sí, complejidad muy baja | Ajuste de calidad | Estándar libre de patentes | Universal |
| WebP | Tradicional/híbrido | Sí | Ajuste de calidad | Licencia tipo BSD, sin royalties | Amplia |
| AV1 | Tradicional por bloques | Sí, mayor complejidad que JPEG/WebP | Múltiples modos | Royalty-free (AOM) | Amplia |
| Códecs neuronales de la familia CompressAI | Neuronal aprendido | Parcial, a menudo con GPU | Variable | Varía según implementación | Comunidad |

No se dispone de datos de BD-rate ni de PSNR que permitan una comparación cuantitativa entre PULSE y estas alternativas.

## Limitaciones y advertencias

- No hay resultados de tasa-distorsión publicados: sin paper ni métricas, no es posible cuantificar la calidad real frente a JPEG, WebP, AV1 u otros códecs; el propio autor califica las comprobaciones de empaquetado como compatibilidad, no como evaluación de rendimiento.
- Los detalles de arquitectura, número de parámetros y datos de entrenamiento no están disponibles, lo que dificulta auditar el modelo o reproducir su entrenamiento.
- Cada variante requiere mantener juntos `config.json`, `model.pt` y `entropy_control_int.pt`; mezclar ficheros de variantes distintas puede invalidar la decodificación.
- Los QP válidos son 0–7; fuera de ese rango el comportamiento no está documentado.
- El envoltorio del códec añade 32 bytes fijos alrededor del transporte nativo, un sobrecoste relevante en imágenes muy pequeñas.
- El formato `.pulse` es propio: no hay interoperabilidad directa con decodificadores estándar (navegadores, bibliotecas de imagen) sin herramientas específicas.
- El modelo pertenece al catálogo de un autor (`zhaoyangjia`) con 0 descargas y 0 likes, mientras que el código se aloja en `microsoft/GenCodec`; conviene verificar la relación autor-organización antes de usarlo en producción.
- No se documentan sesgos, riesgos de alucinación ni limitaciones de idioma porque no es un modelo generativo, pero tampoco se detallan posibles artefactos por tipo de contenido (excepto el ajuste fino para caras y texto en las variantes perceptuales).
- Licencia MIT: permite uso comercial, pero se recomienda revisar los términos del repositorio de código asociado y de cualquier dependencia de despliegue.
- Ausencia de evaluación en producción: no se aportan cifras de latencia, throughput ni consumo energético.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zhaoyangjia/PULSE
- Código en GitHub (microsoft/GenCodec, carpeta PULSE): https://github.com/microsoft/GenCodec/tree/main/PULSE
- Guía de entrenamiento: https://github.com/microsoft/GenCodec/blob/main/PULSE/docs/training.md
- Guía de despliegue: https://github.com/microsoft/GenCodec/blob/main/PULSE/docs/deployment.md
- Paper en arXiv: anunciado como "coming soon", sin enlace disponible
