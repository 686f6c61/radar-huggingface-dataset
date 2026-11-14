# yorchjais/filament-carp-stack

## Resumen

CARP-Net stack es un conjunto de 30 modelos entrenados para segmentación de instancias de filamentos solares, presentado como solución al reto de Kaggle *Solar Filament Instance Segmentation 2026* (con un public PQ de 0,40). Lo desarrolla el usuario yorchjais y se publica en Hugging Face como un repositorio de pesos PyTorch (3,7 GB) que contiene los modelos de las 30 particiones de validación cruzada (folds) que componen el ensemble final.

El modelo resuelve un problema de visión por computador muy específico: identificar y separar instancias individuales de filamentos solares en imágenes de disco completo de 2048 × 2048 píxeles en escala de grises, normalizadas sobre el disco solar. No es un modelo de lenguaje ni un modelo multimodal generalista, sino un sistema de segmentación de imágenes de dominio científico (física solar) pensado para investigación y para pipelines de análisis de observaciones.

Su relevancia actual radica en que aborda una tarea de segmentación de instancias densa y con objetos alargados y débilmente contrastados, combinando arquitecturas convolucionales (ConvNeXt-T, MiT-B2) con mecanismos de propagación de afinidad y funciones de pérdida específicas (RMI). La información disponible sobre el modelo es limitada: no se detallan parámetros totales, licencia ni idiomas, y la model card se limita a describir la estructura del repositorio y el procedimiento de carga.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble de 6 familias: CARP-Net (ConvNeXt-T HiRes U-Net + propagación de afinidad con stride 4), MiT-B2 U-Net, MiT-B2 U-Net + pérdida RMI, ConvNeXt-T U-Net, ConvNeXt-T HiRes U-Net |
| Parametros totales | no disponible (30 modelos `.pth` en el repositorio; el tamaño del repo es 3,7 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de una imagen de 2048 × 2048 en escala de grises) |
| Tipos de cuantizacion | no disponible (pesos PyTorch `state_dict` en punto flotante; no se documentan variantes GGUF, ONNX ni cuantizadas) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | no disponible |
| Formato de pesos | PyTorch `state_dict` (`.pth`), con `config.json` por fold y `stack.json` con miembros, pesos de mezcla, test-time augmentation y ajustes del decodificador |

## Arquitectura y entrenamiento

El stack combina seis familias de modelos con pesos de mezcla definidos en `stack.json`: `carp` y `carpw` con peso 1/4 cada una, y `mitb2`, `rmi`, `cnx` y `cnxhr` con peso 1/8 cada una. La familia principal, CARP-Net, es una U-Net con backbone ConvNeXt-T en configuración HiRes y un mecanismo de propagación de afinidad con stride 4, orientado a separar instancias de filamentos alargados. Las familias `mitb2` y `rmi` usan un backbone MiT-B2; `rmi` añade la función de pérdida RMI. Las familias `cnx` y `cnxhr` son U-Nets con backbone ConvNeXt-T, la segunda en variante HiRes. La familia `carpw` es idéntica a `carp` salvo que las imágenes se muestrean según el recuento de anotaciones por anotador.

Cada familia se entrena en 5 folds (30 modelos en total), de modo que cada fold deja fuera una partición distinta durante el entrenamiento. El repositorio incluye, por fold, un `config.json` con los argumentos de entrenamiento y las métricas de validación obtenidas durante el entrenamiento, además de un archivo `SHA256SUMS` con las sumas de verificación de los 30 `.pth`. La entrada es una imagen en escala de grises de 2048 × 2048 normalizada sobre el disco solar mediante `filseg.model.normalise`, y la salida es un mapa de logits. No se especifican en la información disponible el número de tokens, la composición del dataset de entrenamiento, ni si se emplearon técnicas de ajuste posteriores (RLHF/DPO no aplican a este dominio).

## Capacidades

- Segmentación de instancias de filamentos solares en imágenes de disco completo de 2048 × 2048 píxeles en escala de grises.
- Producción de mapas de logits por píxel que, tras el decodificador configurado en `stack.json`, dan lugar a instancias separadas.
- Ensemble de 30 modelos con pesos de mezcla predefinidos y test-time augmentation configurada en `stack.json`.
- Carga individual de cualquier miembro mediante `filseg.stack.load_member(root, "<familia>", <fold>)` desde el repositorio de código.
- Verificación de integridad de los pesos mediante `SHA256SUMS`.
- No dispone de generación de texto, razonamiento, código, matemáticas, tool calling, capacidades de agente, multilingüismo, visión general, audio ni modo de pensamiento.

## Casos de uso

- Análisis automatizado de observaciones solares de disco completo: el modelo recibe imágenes de 2048 × 2048 normalizadas sobre el disco y devuelve mapas de logits que permiten extraer instancias de filamentos para estudios estadísticos de actividad solar.
- Construcción de catálogos de filamentos: integrado en un pipeline que procesa series temporales de imágenes, el ensemble puede generar inventarios de filamentos con sus máscaras de instancia para su correlación con eventos de eyección de masa coronal.
- Investigación en segmentación de instancias de objetos alargados: las familias CARP-Net y su propagación de afinidad con stride 4 sirven como referencia reproducible para experimentos con objetos finos y débilmente contrastados.
- Reproducción de resultados de competición: los 30 folds y `stack.json` permiten reconstruir exactamente la submission que obtuvo public PQ 0,40 en el reto de Kaggle, útil para validar metodologías de ensemble.
- Benchmarking de backbones en dominio científico: las familias ConvNeXt-T y MiT-B2, con y sin pérdida RMI, permiten comparar el efecto de cada componente sobre la misma tarea y dataset.
- Docencia y formación en visión por computador aplicada: el notebook de demostración descarga automáticamente el repositorio con `huggingface_hub.snapshot_download` y permite cargar un miembro concreto para inspeccionar su salida sin infraestructura compleja.
- Verificación de integridad en producción: el archivo `SHA256SUMS` facilita comprobar que los pesos desplegados no se han corrompido o alterado antes de la inferencia.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Public PQ en *Solar Filament Instance Segmentation 2026* (Kaggle) | 0,40 |

No se han publicado en la información disponible resultados desglosados por familia, fold ni por otras métricas (AP, PQ por umbral, IoU) más allá del public PQ global de la submission seleccionada.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. El repositorio completo ocupa 3,7 GB, lo que sugiere que cada modelo individual es de tamaño moderado, pero no se documenta el consumo de memoria en inferencia.
- GPU recomendadas: no disponible. Por las arquitecturas empleadas (ConvNeXt-T y MiT-B2 en U-Net) y el tamaño de entrada (2048 × 2048), se requiere una GPU con memoria suficiente para procesar imágenes de alta resolución, pero no se especifican modelos concretos.
- ¿Cabe en GPU de consumo? No disponible. No se indica si el ensemble completo o un miembro individual caben en GPUs como RTX 4090 o RTX 3090.
- Opciones de despliegue: PyTorch con los `state_dict` publicados y el paquete `filseg` del repositorio de código (`filseg.stack.load_member`, `filseg.model.normalise`). No se documentan exportaciones a ONNX, TensorRT, vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tarea | Arquitectura | Parametros | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| CARP-Net stack (yorchjais) | Segmentación de instancias de filamentos solares | Ensemble de ConvNeXt-T y MiT-B2 U-Net | no disponible | Imagen 2048 × 2048 en escala de grises | no disponible | Hugging Face, 30 `.pth` |
| Mask R-CNN (referencia general) | Segmentación de instancias genérica | ResNet-FPN + cabezas de máscara | ~44 M (ResNet-50) | Imagen variable | MIT (torchvision) | Amplia |
| Segment Anything (SAM) | Segmentación promptable genérica | ViT + decodificador de máscaras | 91 M (ViT-B) a 636 M (ViT-H) | Imagen variable | Apache 2.0 | Amplia |

La comparación con Mask R-CNN y SAM es solo orientativa: son modelos de propósito general, no entrenados específicamente para filamentos solares, y no se dispone de resultados comparativos en esta tarea dentro de la información proporcionada. No se conocen otros modelos públicos específicos de segmentación de instancias de filamentos solares en la información disponible.

## Limitaciones y advertencias

- Información muy escasa: no se documentan parámetros totales, licencia, idiomas (no aplica), ni detalles del dataset de entrenamiento, lo que dificulta evaluar su idoneidad para producción.
- Licencia no disponible: no puede asumirse uso comercial permitido; es necesario contactar con el autor antes de cualquier despliegue comercial.
- Dominio muy restringido: el modelo solo está entrenado para imágenes solares de disco completo de 2048 × 2048 en escala de grises normalizadas sobre el disco; no funcionará correctamente con otras resoluciones, canales o dominios sin reentrenamiento.
- Riesgo de sobreajuste al dataset de la competición: el public PQ de 0,40 corresponde a una submission de Kaggle y puede no generalizar a otras fuentes de observación solar.
- Sin datos de sesgo: no se documentan sesgos conocidos, pero al ser un modelo científico entrenado con anotaciones humanas, puede heredar sesgos de los anotadores (el muestreo por recuento de anotaciones en `carpw` sugiere variabilidad entre anotadores).
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de falsos positivos y negativos en la detección de instancias; no se documentan métricas de precisión/recall desglosadas.
- Sin garantías de mantenimiento: el repositorio tiene 0 descargas y 0 likes, y no se especifica soporte ni actualizaciones.
- Dependencia del código externo: la carga requiere el paquete `filseg` del repositorio de GitHub, cuya compatibilidad con versiones futuras de PyTorch no está garantizada.

## Enlaces

- Hugging Face: https://huggingface.co/yorchjais/filament-carp-stack
- Repositorio de código y notebook de demostración: https://github.com/cazaroni/filament-carp
- Notebook de demostración: `notebooks/demo.ipynb` dentro del repositorio anterior
- Reto de Kaggle: *Solar Filament Instance Segmentation 2026* (no se proporciona URL directa en la información disponible)
