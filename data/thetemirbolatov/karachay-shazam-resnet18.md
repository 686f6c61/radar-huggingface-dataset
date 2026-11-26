# thetemirbolatov/karachay-shazam-resnet18

## Resumen

Karachay-Shazam es un modelo de huella digital de audio (audio fingerprinting) especializado en música folclórica y pop karachái-bálkara. Lo desarrolla Mukhammat Temirbolatov (MIRAJE X) y se publica bajo licencia MIT. Resuelve un problema concreto: los servicios globales de reconocimiento musical (Shazam, SoundHound) no indexan repertorio regional del Cáucaso, como las canciones tradicionales *inarla* y *jyrla*, ni grabaciones en directo de bodas o eventos.

Técnicamente es una ResNet-18 modificada que recibe una espectrograma Log-Mel de un solo canal y produce un embedding de 128 dimensiones normalizado en L2. El entrenamiento emplea aprendizaje autosupervisado contrastivo (SimCLR con pérdida NT-Xent), alineando anclas limpias de 3 segundos con versiones fuertemente aumentadas (filtrado paso banda, compresión MP3, ruido de fondo, cambio de tempo).

El modelo se distribuye como ONNX (~44 MB) junto con un índice FAISS precalculado y una tabla de metadatos CSV, lo que permite búsqueda por similitud vectorial en CPU de gama baja (VPS con 1 GB de RAM) y en dispositivos móviles Android/iOS. Es relevante para desarrolladores que necesiten construir sistemas de identificación musical para repertorio no cubierto por los servicios comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet-18 modificada (entrada 1 canal, salida embedding 128-d L2-normalizado) |
| Parametros totales | no disponible (pesos ONNX ~44 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (audio: ventana de 3 segundos por consulta) |
| Tipos de cuantizacion | no disponible (se distribuye ONNX FP32; no se documentan variantes cuantizadas) |
| Idiomas soportados | krc (karachái-bálkaro), ru, en (metadatos y documentación; el modelo opera sobre audio, no texto) |
| Licencia | MIT |
| Formato de pesos | ONNX (`karachay_shazam.onnx`), PyTorch state dict (`karachay_shazam.pth`), índice FAISS (`songs_index.faiss`), CSV de metadatos (`songs_db.csv`) |

## Arquitectura y entrenamiento

La red es una ResNet-18 adaptada para entrada de un solo canal: recibe espectrogramas Log-Mel de forma `(Batch, 1, 64, 188)`, calculados con `n_fft=1024`, `hop_length=256`, `n_mels=64`, `fmin=0.0`, `fmax=8000.0`, `htk=True`, `norm=None`, `power=2.0` y frecuencia de muestreo de 16 kHz en mono. La salida es un vector de 128 dimensiones normalizado en L2, apto para búsqueda por producto interno en FAISS.

El entrenamiento sigue el paradigma SimCLR con pérdida NT-Xent: cada ancla limpia de 3 segundos se empareja con una versión aumentada que simula condiciones reales de captura (filtrado paso banda que imita el micrófono de un teléfono, compresión MP3, ruido de fondo y cambio de tempo). No se documenta el volumen del dataset de entrenamiento, la composición exacta ni si hubo fases adicionales de ajuste supervisado. El repositorio incluye el índice FAISS precalculado sobre el catálogo de temas karachái-bálkaros, junto con la tabla `songs_db.csv` que mapea `song_id`, `title` y `artist`.

## Capacidades

- Identificación de canciones karachái-bálkaras (folclore y pop) a partir de fragmentos de 3 segundos.
- Robustez frente a ruido: grabaciones de Instagram Reels, bodas, ruido de calle y mensajes de voz con baja tasa de bits.
- Extracción de embeddings de audio de 128 dimensiones para búsqueda por similitud vectorial.
- Búsqueda de vecino más cercano mediante índice FAISS de producto interno.
- Inferencia en CPU sin GPU, incluidos servidores de 1 GB de RAM y dispositivos móviles.
- Exportación ONNX para despliegue multiplataforma (Python, móvil).
- Pesos PyTorch disponibles para reentrenamiento o ajuste fino sobre otros catálogos.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto: es un modelo puramente de clasificación/recuperación de audio.

## Casos de uso

- Identificación musical en apps móviles: integrar el ONNX y el índice FAISS en una app Android/iOS para reconocer canciones karachái-bálkaras capturadas por micrófono, con inferencia local sin conexión.
- Moderación y atribución de contenido en redes: detectar qué tema suena en vídeos de Reels o TikToks subidos por usuarios y asignar regalías o metadatos automáticamente.
- Catalogación de archivos de audio históricos: procesar grabaciones de bodas, conciertos y archivos familiares para etiquetar automáticamente los temas interpretados.
- Sistemas de recomendación musical regional: usar los embeddings de 128-d como representación para agrupar y recomendar temas similares dentro del repertorio karachái-bálkaro.
- Detección de duplicados en bibliotecas musicales: indexar un catálogo propio con FAISS y localizar versiones duplicadas o regrabadas de un mismo tema.
- Investigación etnomusicológica: cuantificar la presencia de temas tradicionales en grabaciones de campo y analizar su circulación en medios.
- Servicio de "reconocer canción" para radios o emisoras locales: desplegar en un VPS pequeño que recibe fragmentos de audio y devuelve artista y título.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo está diseñado para ejecutarse en CPU.
- GPU recomendadas: no necesarias; no se documenta soporte GPU específico más allá del proveedor `CPUExecutionProvider` de ONNX Runtime.
- Cabe en cualquier GPU consumer, aunque su uso previsto es CPU.
- CPU: funciona en VPS con 1 GB de RAM sin GPU, según la model card.
- Móvil: Android/iOS mediante ONNX Runtime.
- Opciones de despliegue: ONNX Runtime (Python, móvil), PyTorch (pesos `.pth`), FAISS para la búsqueda vectorial.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Karachay-Shazam (ResNet-18) | Huella digital de audio especializada | no disponible (~44 MB ONNX) | Ventana de 3 s de audio | MIT | Hugging Face |
| Shazam (servicio propietario) | Huella digital de audio comercial | no disponible | Fragmentos cortos | Propietaria | Solo API/servicio |
| SoundHound (servicio propietario) | Reconocimiento musical comercial | no disponible | Fragmentos cortos | Propietaria | Solo API/servicio |
| Modelos genéricos de audio embedding (p. ej. PANNs, VGGish) | Embedding de audio general | variable | Ventanas de varios segundos | Varía (MIT/Apache en algunos) | Repositorios públicos |

No se dispone de comparaciones cuantitativas publicadas frente a estos sistemas en la información proporcionada.

## Limitaciones y advertencias

- Cobertura limitada al repertorio karachái-bálkaro indexado en `songs_index.faiss`; no identifica música fuera de ese catálogo.
- Ventana fija de 3 segundos: fragmentos más cortos o muy degradados pueden no producir coincidencias fiables.
- Frecuencia de muestreo fija a 16 kHz mono; es necesario remuestrear la entrada.
- No se documentan métricas de precisión, recall ni tasas de falsos positivos, por lo que la fiabilidad en producción debe validarse empíricamente.
- Posibles sesgos derivados del catálogo de entrenamiento (géneros, artistas y calidad de grabación sobrerrepresentados).
- Riesgo de falsos positivos en búsquedas FAISS con umbrales de similitud bajos; se recomienda calibrar el umbral de score.
- Licencia MIT permite uso comercial, pero se solicita citar al autor en investigaciones, medios y aplicaciones.
- Modelo con 0 descargas y 1 like en el momento de la consulta: ecosistema y validación comunitaria muy limitados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thetemirbolatov/karachay-shazam-resnet18
- Perfil del autor en GitHub: https://github.com/thetemirbolatov
