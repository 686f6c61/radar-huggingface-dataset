# ThrowawayUploader/er0manga

## Resumen

Er0manga es un conjunto de dos modelos de visión por computador orientados al procesamiento de páginas de manga: un segmentador que detecta barras de censura oscuras y un modelo de inpainting que reconstruye el contenido oculto bajo esas barras. Los desarrolla el proyecto Er0manga y esta publicación concreta, subida por el usuario ThrowawayUploader, no entrena nada nuevo: exporta los checkpoints originales a TorchScript para integrarlos en el motor local de Quire, un lector de manga. El repositorio ocupa 0,3 GB y contiene dos ficheros `.pt`.

El primer componente, `er0manga-seg.pt`, es un ConvNeXt-T con cabecera UPerNet entrenado para segmentación semántica binaria sobre páginas en color y en blanco y negro. El segundo, `er0manga-inpaint.pt`, es una LaMa con 9 bloques FFC afinada sobre manga sin censura. Ambos proceden de la imagen de demostración publicada en Docker Hub por Er0manga, ya que los enlaces originales de mega.nz habían caído.

La relevancia es acotada pero clara: cubre un caso de uso muy específico (restauración de páginas censuradas) con pesos ya empaquetados y listos para inferencia en PyTorch, sin dependencias de frameworks de terceros más allá de TorchScript. No es un modelo de lenguaje ni un modelo generativo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Segmentador: ConvNeXt-T + UPerNet. Inpainting: LaMa con 9 bloques FFC |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelos de visión; entrada escalada a lado largo 1024 en el segmentador) |
| Tipos de cuantizacion | no disponible (pesos TorchScript en precisión original) |
| Idiomas soportados | no aplica (procesamiento de imagen) |
| Licencia | `other`, nombre `er0manga`, enlace a LICENSE del repositorio Er0mangaSeg; el código de ambos repositorios es Apache-2.0, los pesos no tienen licencia separada declarada |
| Formato de pesos | TorchScript (`.pt`) |

## Arquitectura y entrenamiento

El segmentador emplea una ConvNeXt-T como backbone con cabecera de segmentación UPerNet, y produce un mapa de probabilidad por píxel de estar bajo una barra de censura. Según la model card, el checkpoint exportado corresponde a `convnext_1024_iter_400.pth`, lo que sugiere un entrenamiento a resolución 1024 y 400 iteraciones, aunque no se detallan el volumen de datos, la composición del dataset ni si hubo aumentos de datos. El modelo escala internamente la página a un lado largo de 1024, replicando el comportamiento de la demo del repositorio original.

El modelo de inpainting es una LaMa con 9 bloques FFC, afinada sobre manga sin censura, y el checkpoint exportado es `00-30-09/models/best.ckpt`. LaMa es una arquitectura de inpainting basada en convoluciones con campos receptivos rápidos (FFC) que permite reconstruir regiones grandes con coherencia estructural. No se documentan en la información disponible los detalles del dataset de afinado, el número de pasos, la función de pérdida ni si se aplicó algún tipo de regularización perceptual. Tampoco hay innovaciones técnicas adicionales declaradas más allá del propio pipeline de dos etapas (detección y reconstrucción).

## Capacidades

- Segmentación binaria de barras de censura oscuras en páginas de manga, tanto en color como en blanco y negro.
- Salida de probabilidad por píxel (`[1, 1, H, W]`) a partir de una página RGB en rango 0-255 (`[1, 3, H, W]`).
- Inpainting de regiones enmascaradas: recibe un recorte RGB en rango 0-1 y una máscara binaria, y devuelve el recorte con los píxeles enmascarados redibujados.
- Encadenamiento de ambos modelos para un pipeline completo de detección y restauración.
- Ejecución mediante TorchScript, sin necesidad de definir la arquitectura en código Python en tiempo de inferencia.
- No soporta tool calling, agentes, razonamiento multi-paso, texto, audio ni otros idiomas; es exclusivamente visión.

## Casos de uso

- Restauración de páginas censuradas en un lector de manga: el pipeline segmenta las barras y redibuja el contenido, integrándose en el motor local de Quire tal como se publicó.
- Digitalización y archivado de colecciones: aplicar el segmentador para localizar y catalogar automáticamente páginas con censura en un fondo documental antes de decidir qué restaurar.
- Preprocesado para OCR y análisis de viñetas: enmascarar o reconstruir las barras evita que los sistemas posteriores de reconocimiento de texto o de detección de bocadillos interpreten las barras como contenido.
- Herramientas de edición asistida para escaneos: el inpainting permite limpiar recortes concretos seleccionados manualmente, no solo barras detectadas automáticamente, usando la máscara que proporcione el usuario.
- Investigación en inpainting sobre dominios de línea y tramado: el modelo afinado sobre manga es un punto de partida para experimentos de reconstrucción en imágenes con texturas de semitono y trazos finos.
- Evaluación de pipelines de segmentación: el segmentador ConvNeXt-T + UPerNet sirve como baseline reproducible para comparar detectores de regiones rectangulares oscuras en páginas escaneadas.
- Integración en aplicaciones de escritorio sin GPU dedicada: al ser TorchScript y de tamaño reducido (repo de 0,3 GB), puede ejecutarse en CPU para lotes pequeños, aunque no se dispone de cifras de latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con cifras concretas; el repositorio completo ocupa 0,3 GB, por lo que los pesos caben holgadamente en cualquier GPU consumer, pero el consumo en inferencia depende de la resolución de entrada (lado largo 1024 en el segmentador).
- GPU recomendadas: no disponible. Por tamaño, cualquier GPU con al menos unos pocos GB de VRAM debería poder cargar los modelos; no hay datos de referencia del autor.
- Cabe en GPU consumer: previsiblemente sí, dado el tamaño del repo, aunque no se confirma con mediciones.
- Opciones de despliegue: PyTorch con TorchScript (`torch.jit.load`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tarea | Arquitectura | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Er0manga (esta publicación) | Segmentación de barras + inpainting | ConvNeXt-T + UPerNet / LaMa con 9 FFC | Lado largo 1024 (segmentador) | `other` (er0manga); código Apache-2.0 | Hugging Face, TorchScript |
| LaMa original | Inpainting general | LaMa con FFC | Resolución variable | Apache-2.0 (código y pesos publicados por Samsung) | Repositorio oficial y Hugging Face |
| SAM (Segment Anything) | Segmentación promptable general | ViT | Resolución variable | Apache-2.0 | Hugging Face y repositorio oficial |
| Detectores de texto/regiones tipo EAST o DB | Detección de regiones | CNN | Resolución variable | Varía por implementación | Repositorios públicos |

La comparación es aproximada: no se dispone de métricas del modelo de Er0manga frente a estas alternativas, y las tareas no son idénticas (segmentación de barras de censura frente a segmentación genérica o inpainting general).

## Limitaciones y advertencias

- No se han publicado métricas de calidad (IoU, FID, LPIPS) en la información disponible; no hay forma de verificar el rendimiento real del segmentador ni del inpainting.
- El segmentador está especializado en barras oscuras; es previsible que falle con censura de otros tipos (píxeles difuminados, recortes, marcas de agua claras) aunque esto no se documenta explícitamente.
- El inpainting reconstruye contenido plausible, no el contenido original: el resultado puede ser inventado y no debe presentarse como restauración fiel.
- La licencia de los pesos es `other` con nombre `er0manga` y enlace a la licencia del repositorio Er0mangaSeg; el código es Apache-2.0, pero los pesos no tienen licencia separada declarada. Es necesario revisar el texto de la licencia antes de cualquier uso comercial.
- Los checkpoints provienen de una imagen de Docker Hub y de enlaces de mega.nz caídos; la trazabilidad de la procedencia es limitada y no hay garantía de que coincidan exactamente con los publicados originalmente por el autor.
- No hay información sobre sesgos, composición del dataset de entrenamiento ni evaluación en dominios distintos del manga.
- El modelo no procesa texto ni lenguaje; cualquier expectativa de uso como modelo multimodal o de chat es incorrecta.
- La fecha de creación del repositorio (2026-11-06) y el hecho de que el autor sea "ThrowawayUploader" sugieren una publicación no oficial; conviene tratar los artefactos con cautela en producción.

## Enlaces

- Hugging Face: https://huggingface.co/ThrowawayUploader/er0manga
- Repositorio Er0mangaSeg: https://github.com/Er0manga/Er0mangaSeg
- Repositorio Er0mangaInpaint: https://github.com/Er0manga/Er0mangaInpaint
- Licencia declarada: https://github.com/Er0manga/Er0mangaSeg/blob/main/LICENSE
- Proyecto Er0manga: https://github.com/Er0manga
- Imagen Docker de demostración: https://hub.docker.com/r/er0manga/er0mangademo
