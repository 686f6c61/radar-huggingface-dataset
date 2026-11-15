# Valen-Peregrine/bioclip-2-tflite

## Resumen

BioCLIP 2 TFLite es una conversión no oficial del torre de visión del modelo BioCLIP 2 (ViT-L/14) al formato LiteRT `.tflite`, empaquetada junto con "packs de etiquetas" para la app Android FaunaPulse. El modelo original fue desarrollado por Jianyang Gu, Samuel Stevens, Elizabeth G. Campobongo y colaboradores del Imageomics Institute, y está entrenado sobre el árbol de la vida completo (dataset TreeOfLife-200M, con 867.455 nombres taxonómicos). Esta conversión la firma Valen-Peregrine y su propósito es ejecutar clasificación de imágenes de fauna en dispositivos móviles sin conexión.

La relevancia actual del modelo radica en que permite llevar a un teléfono Android una capacidad de identificación de especies basada en embeddings de imagen y texto (zero-shot), algo que normalmente requiere infraestructura de servidor. El archivo `.tflite` ocupa 609 MB en fp16 y procesa imágenes de 224 px, generando un embedding que se compara contra los embeddings de texto precalculados de cada nombre científico incluido en el pack de etiquetas.

Se trata de un modelo de extracción de características de imagen (pipeline `image-feature-extraction`), no de un generador de texto ni de un modelo multimodal conversacional. Su valor está en la clasificación zero-shot de especies y en la posibilidad de restringir el espacio de etiquetas por región geográfica o grupo taxonómico, lo que según la documentación de BioCLIP puede mejorar la precisión de las predicciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ViT-L/14 (Vision Transformer, parche 14x14), torre de visión de CLIP |
| Parametros totales | no disponible (el archivo tflite pesa 609.466.720 bytes en fp16) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen 224 px) |
| Tipos de cuantizacion | fp16 (archivo `.tflite`); embeddings de texto almacenados como float16 re-normalizado |
| Idiomas soportados | no disponible (nombres comunes en inglés cuando existen, si no en otro idioma) |
| Licencia | MIT |
| Formato de pesos | `.tflite` (LiteRT) para la torre de visión; `.fpack` para los packs de etiquetas; manifiesto `.json` |

## Arquitectura y entrenamiento

La torre de visión es un ViT-L/14, el codificador de imágenes de la familia CLIP, convertido a LiteRT con precisión fp16 y pensado para ejecutarse en GPU móvil. El modelo original BioCLIP 2 se entrenó sobre el dataset TreeOfLife-200M, que según la model card contiene 867.455 nombres taxonómicos. No se dispone en la información proporcionada de detalles sobre el número exacto de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO; estos datos corresponden al modelo original y no se detallan en esta conversión.

La innovación técnica de este paquete no está en el entrenamiento sino en el despliegue: la conversión a LiteRT permite inferencia on-device, y los packs `.fpack` precalculan los embeddings de texto de los nombres científicos (producidos por los autores originales de BioCLIP 2) para que el teléfono solo tenga que calcular el embedding de la imagen y compararlo. Los packs incluyen filas "none of these" (seis por pack) para que el modelo pueda rechazar imágenes que no corresponden a ninguna especie del pack, con escenas como suelo desnudo, vegetación, una persona o un vehículo en el pack de mamíferos y aves.

## Capacidades

- Extracción de embeddings de imagen de 224 px mediante ViT-L/14.
- Clasificación zero-shot de especies comparando el embedding de imagen con embeddings de texto de nombres taxonómicos.
- Identificación restringida por grupo taxonómico mediante packs de etiquetas: polinizadores de Europa (34.978 nombres de Diptera, Hymenoptera, Coleoptera y Lepidoptera con al menos 3 registros GBIF en Europa), mamíferos y aves del mundo (17.130 nombres) y un pack demo de visitantes florales de 32 familias (38.570 nombres, no mantenido).
- Rechazo de imágenes fuera de dominio mediante las filas "none of these" incluidas en los packs.
- Filtrado geográfico por país en el pack v3 de polinizadores europeos, con listas de presencia GBIF por país y países vecinos.
- Ejecución on-device en Android mediante LiteRT, sin necesidad de conexión a red.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: es exclusivamente un codificador de imágenes con comparación contra etiquetas.

## Casos de uso

- Identificación de polinizadores en campo: un usuario fotografía una abeja, mosca o mariposa y la app calcula el embedding de la imagen y lo compara contra el pack de polinizadores europeos (34.978 nombres), devolviendo las especies candidatas más probables. Es adecuado porque el pack restringe el espacio de etiquetas a los taxones esperados en Europa.
- Monitorización de biodiversidad con cámaras trampa: el pack de mamíferos y aves del mundo (17.130 nombres) permite clasificar las capturas de una cámara trampa en el dispositivo, con filas de rechazo para escenas sin fauna (suelo desnudo, vegetación, personas, vehículos), lo que reduce falsos positivos.
- Aplicaciones de ciencia ciudadana sin conectividad: observadores en zonas rurales o remotas pueden identificar especies sin red, ya que todo el pipeline (torre de visión y packs) reside en el dispositivo.
- Filtrado previo en pipelines de análisis de imágenes: el modelo puede usarse como primer paso para descartar imágenes sin fauna o agruparlas por taxón antes de un análisis más costoso en servidor.
- Inventarios locales restringidos por país: el pack v3 incluye listas de presencia GBIF por país, de modo que una app puede limitar las etiquetas a las especies registradas en el país donde se tomó la sesión, reduciendo el espacio de búsqueda.
- Demostración de packs personalizados: el script `bioclip_export/build_label_pack.py` del repositorio fauna-pulse-models permite construir packs a partir de listas de taxones dadas por el usuario, como muestra el pack demo de 32 familias de visitantes florales.
- Clasificación de imágenes de insectos en trampas de detección: el pack de polinizadores incluye filas de rechazo específicas (flor, hoja, sombra, restos, imagen borrosa, telaraña), adecuadas para descartar capturas vacías en trampas automatizadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de precisión, latencia ni throughput, y advierte explícitamente que el modelo "no ha sido probado a escala en FaunaPulse, por lo que su precisión allí no se conoce todavía".

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el sentido de GPU de escritorio; el archivo `.tflite` ocupa 609 MB y está diseñado para GPU móvil con soporte fp16.
- GPU recomendadas: no disponible. El modelo está orientado a dispositivos Android con LiteRT y GPU compatible con fp16; no se especifican modelos de GPU de escritorio.
- ¿Cabe en GPU consumer? No se dispone de datos de ejecución en GPU de escritorio; el formato `.tflite` está pensado para móvil.
- Opciones de despliegue: LiteRT (anteriormente TensorFlow Lite) en Android; el modelo base BioCLIP 2 puede desplegarse con las herramientas habituales de PyTorch/Hugging Face, pero esta conversión concreta es para LiteRT.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| BioCLIP 2 TFLite (este) | no disponible (ViT-L/14) | imagen 224 px | MIT | `.tflite` + `.fpack` | Conversión on-device para Android, packs de etiquetas taxonómicas |
| BioCLIP 2 (imageomics/bioclip-2) | no disponible (ViT-L/14) | imagen 224 px | no disponible en la informacion | PyTorch / safetensors (no confirmado) | Modelo original, sin conversión móvil; base de esta ficha |
| CLIP ViT-L/14 (OpenAI) | no disponible | imagen 224 px | MIT (según versión) | PyTorch, ONNX, etc. | Modelo generalista, no especializado en taxonomía; no incluye packs de nombres científicos |
| Otros clasificadores de fauna on-device | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

La comparación cuantitativa de rendimiento no está disponible. La diferencia principal frente a CLIP genérico es el entrenamiento sobre TreeOfLife-200M y la disponibilidad de packs de etiquetas taxonómicas con rechazo de fuera de dominio.

## Limitaciones y advertencias

- El autor advierte que no entrenó BioCLIP 2 y que el modelo no ha sido probado a escala en FaunaPulse; la precisión real en esa app es desconocida y las respuestas deben tratarse como sugerencias a verificar.
- Es una conversión no oficial: no está respaldada ni proporcionada por los autores originales ni por el Imageomics Institute.
- Riesgo de alucinación en el sentido de clasificaciones erróneas: el modelo siempre devolverá la etiqueta más cercana del pack, aunque la imagen no corresponda a ninguna especie incluida; las filas "none of these" mitigan pero no eliminan este problema.
- Sesgos de entrenamiento: al estar entrenado sobre TreeOfLife-200M, puede tener cobertura desigual entre taxones y regiones geográficas; no se detallan sesgos específicos en la información disponible.
- Limitaciones de idioma: los nombres comunes están en inglés cuando existen, si no en otro idioma; no hay soporte multilingüe declarado.
- Restricciones de licencia: MIT, lo que permite uso comercial, pero la licencia del modelo base BioCLIP 2 no se detalla en la información proporcionada; conviene verificar la licencia del modelo original antes de un uso comercial.
- El pack demo de visitantes florales (32 familias) no está mantenido y no es una selección justificada: solo el 14% de sus insectos de los cuatro órdenes principales tienen 3 o más registros GBIF en Europa.
- Los packs v1 se mantienen sin cambios porque las apps instaladas los fijan; los packs v2 y v3 usan criterios de nombres distintos, y el pack v3 conserva 163 nombres que no estarían en una lista europea hecha con la regla actual de presencia sin fósiles.
- Para producción: verificar la versión del pack, el filtrado geográfico y el rendimiento en el dispositivo objetivo antes de desplegar.

## Enlaces

- Hugging Face: https://huggingface.co/Valen-Peregrine/bioclip-2-tflite
- Modelo base BioCLIP 2: https://huggingface.co/imageomics/bioclip-2
- Repositorio FaunaPulse: https://github.com/valentinitnelav/fauna-pulse
- Repositorio fauna-pulse-models: https://github.com/valentinitnelav/fauna-pulse-models
- Documentación de pybioclip (taxones restringidos geográficamente): https://imageomics.github.io/pybioclip/geo-restricted-taxa/
- Paper de BioCLIP 2: arXiv:2505.23883
- Dataset TreeOfLife-200M: https://huggingface.co/datasets/imageomics/TreeOfLife-200M
