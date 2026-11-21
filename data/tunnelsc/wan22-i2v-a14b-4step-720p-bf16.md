# tunnelsc/wan22-i2v-a14b-4step-720p-bf16

## Resumen

Wan2.2-I2V-A14B 4-step 720p experts en bf16 es una copia modificada de los pesos destilados de Wan2.2 para generación de vídeo a partir de imagen (image-to-video), publicada por el usuario `tunnelsc` en Hugging Face. El modelo parte de los expertos destilados en fp32 de `lightx2v/Wan2.2-Distill-Models`, que a su vez derivan del modelo base `Wan-AI/Wan2.2-I2V-A14B`, y se ha convertido a bf16 para reducir el espacio en disco y el uso de memoria durante la carga.

La modificación es puramente de tipo numérico: cada tensor se ha convertido con `torch.to(torch.bfloat16)` (redondeo al par más cercano), manteniendo nombres, formas y orden de tensores. No hay cambios arquitectónicos ni de entrenamiento respecto a los pesos originales. Se distribuye en dos ficheros safetensors de aproximadamente 26,6 GiB cada uno, correspondientes a los expertos de alto y bajo ruido.

Es relevante para quienes despliegan pipelines de generación de vídeo con LightX2V y quieren evitar la conversión fp32 a bf16 en tiempo de carga, ahorrando memoria y tiempo de inicialización. La licencia es Apache 2.0, igual que el modelo original. No hay información publicada sobre benchmarks, idiomas ni parámetros totales en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de difusion para image-to-video, derivado de Wan2.2-I2V-A14B) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (no aplica a modelos de difusion de video) |
| Tipos de cuantizacion | bf16 (unico formato publicado en este repo) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo es una conversión de precisión de los expertos destilados de Wan2.2-I2V-A14B para 720p en 4 pasos. La arquitectura subyacente es la del modelo base Wan2.2-I2V-A14B, un modelo de difusión para generación de vídeo condicionada por imagen; la model card de esta copia no detalla la arquitectura interna (tipo de backbone, número de parámetros, mecanismo de atención). El proceso de destilación que produce los pesos de 4 pasos se realizó en `lightx2v/Wan2.2-Distill-Models`, no en este repo.

La única intervención documentada es la conversión de fp32 a bf16 tensor a tensor, con redondeo al par más cercano, sin alterar nombres, formas ni orden. Se mantienen dos ficheros separados para los expertos de alto ruido y bajo ruido, que se cargan en LightX2V mediante `high_noise_original_ckpt` y `low_noise_original_ckpt`. No se documentan datos de entrenamiento, número de tokens, composición del dataset ni etapas de RLHF/DPO en la información disponible.

## Capacidades

- Generación de vídeo a partir de una imagen de entrada (image-to-video) a resolución 720p.
- Inferencia en 4 pasos de muestreo gracias a la destilación de los pesos originales.
- Carga directa en LightX2V como pesos de expertos de alto y bajo ruido.
- Precisión bf16 para reducir huella de memoria frente a la versión fp32.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, texto, audio ni otras modalidades.

## Casos de uso

- Animación de fotografías para contenido audiovisual: el modelo toma una imagen fija y genera un clip de vídeo de 720p en 4 pasos, adecuado para producir animaciones cortas a partir de material fotográfico existente.
- Previsualización rápida de storyboards: al requerir solo 4 pasos de muestreo, permite iterar sobre ideas visuales con menor coste computacional que un modelo no destilado.
- Integración en pipelines LightX2V existentes: los ficheros se cargan directamente como `high_noise_original_ckpt` y `low_noise_original_ckpt`, sustituyendo los fp32 sin cambios de configuración.
- Despliegue en entornos con memoria limitada: la versión bf16 reduce a la mitad el espacio de los pesos frente a fp32, facilitando su carga en GPUs con VRAM ajustada.
- Generación de material promocional a partir de imágenes de producto: permite convertir fotos estáticas en clips de vídeo de 720p para redes sociales o catálogos.
- Experimentación académica con modelos de difusión de vídeo destilados: sirve como punto de partida reproducible para estudiar el efecto de la precisión bf16 frente a fp32 en la calidad de salida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; los pesos suman aproximadamente 53,2 GiB en bf16 (26,6 GiB por experto), por lo que la carga completa de ambos expertos requiere memoria muy superior a la de una GPU de consumo.
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño de pesos, el despliegue completo apunta a GPUs de datacenter (A100/H100 de 80 GB) o a estrategias de carga por etapas.
- Compatibilidad con GPU de consumo: no confirmada; los 26,6 GiB por experto exceden la VRAM de la mayoría de tarjetas consumer actuales.
- Opciones de despliegue: LightX2V (documentado por el autor); otros backends no disponibles.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tunnelsc/wan22-i2v-a14b-4step-720p-bf16 | no disponible | no aplica | bf16 | apache-2.0 | Hugging Face |
| lightx2v/Wan2.2-Distill-Models (fp32) | no disponible | no aplica | fp32 | no disponible en la informacion | Hugging Face |
| Wan-AI/Wan2.2-I2V-A14B (base) | no disponible | no aplica | no disponible | no disponible en la informacion | Hugging Face |

## Limitaciones y advertencias

- Es una copia modificada: solo cambia la precisión de fp32 a bf16; la calidad y el comportamiento dependen enteramente de los pesos destilados originales.
- La conversión a bf16 puede introducir diferencias numéricas menores frente a fp32; no se documenta una evaluación de calidad comparativa.
- No hay información publicada sobre sesgos, idiomas, benchmarks ni limitaciones del modelo base en esta model card.
- El repo ocupa 57,2 GB, lo que exige almacenamiento y ancho de banda considerables para descarga.
- Uso comercial permitido por la licencia Apache 2.0, sujeta a las condiciones de LICENSE y NOTICE del repo y a las licencias de los modelos upstream.
- Sin descargas ni likes registrados en el momento de la consulta; no hay evidencia de validación por parte de la comunidad.
- No se documentan requisitos de hardware ni recetas de despliegue más allá de la carga en LightX2V.

## Enlaces

- Hugging Face: https://huggingface.co/tunnelsc/wan22-i2v-a14b-4step-720p-bf16
- Modelo de origen de los pesos destilados: https://huggingface.co/lightx2v/Wan2.2-Distill-Models
- Modelo base original: https://huggingface.co/Wan-AI/Wan2.2-I2V-A14B
