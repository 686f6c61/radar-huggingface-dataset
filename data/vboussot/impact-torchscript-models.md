# VBoussot/impact-torchscript-models

## Resumen

`VBoussot/impact-torchscript-models` es una colección de modelos preentrenados exportados a TorchScript para su uso con la métrica IMPACT (Image-based Multi-scale Patch-wise Adaptive Cosine similariTy), una función de pérdida semántica genérica para registro de imágenes médicas multimodales. El repositorio lo mantiene V. Boussot y acompaña al preprint *IMPACT: A Generic Semantic Loss for Multimodal Medical Image Registration* (arXiv:2503.24121), actualmente en revisión. No es un modelo generativo ni un LLM: es un paquete de extractores de características congelados que se emplean como componente de una función de similitud dentro de pipelines de registro (Elastix, KonfAI/FireANTs).

El repositorio agrupa exportaciones TorchScript de redes públicas: TotalSegmentator, MRSegmentator, SAM 2.1, DINOv2, Anatomix (U-Net y PrimusV2 ViT) y el descriptor artesanal MIND. Cada extractor expone varias capas de características seleccionables mediante el parámetro `LayerMask` de la configuración de IMPACT. El tamaño del repositorio es de 12,2 GB, coherente con el peso agregado de todos los checkpoints exportados.

Su relevancia es acotada pero específica: proporciona artefactos listos para inferencia (sin dependencia del código original de cada red) que permiten reproducir y desplegar la métrica IMPACT en entornos clínicos y de investigación, con un Docker de referencia y scripts de exportación publicados en el repositorio `ImpactLoss`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Colección heterogénea: U-Net (TotalSegmentator, MRSegmentator, Anatomix), ViT (AnatomixDevViT PrimusV2, DINOv2 Small), foundation model de segmentación (SAM 2.1), descriptor handcrafted (MIND) |
| Parametros totales | No disponible de forma agregada. AnatomixDevViT: 27,1 M. Resto de variantes: no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica. Tamaño de entrada: libre múltiplo de 16 por eje (Anatomix U-Net); 128x128x128 fijo (AnatomixDevViT); campo receptivo `2^l + 3` por capa (TotalSegmentator, MRSegmentator); 29 (SAM2.1); global estático (Anatomix U-Net); `2*r*d + 1` (MIND) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (modelos de imagen) |
| Licencia | Apache 2.0 para el repositorio; pesos subyacentes con licencias mixtas (Apache 2.0, MIT, DINOv3 License Agreement, tareas cerradas de TotalSegmentator excluidas) |
| Formato de pesos | TorchScript (`.pt`); también se mencionan exportaciones ONNX en los tags del repositorio |

## Arquitectura y entrenamiento

El repositorio no entrena modelos propios: exporta a TorchScript redes ya entrenadas y las envuelve en un módulo scripted que fija `nb_layers`, `stats` y `direction` a sus valores por defecto, de modo que el llamante solo necesita pasar la imagen. Las exportaciones se realizan con la red en modo evaluación para que las capas de normalización usen estadísticas aprendidas; esto es relevante porque una exportación previa de `Anatomix.pt` se hizo en modo entrenamiento (BatchNorm leyendo estadísticas por lote), lo que producía características en un rango de ±109 frente a ±5 actuales y una correlación de solo 0,21 entre ambas versiones sobre entrada aleatoria. Se recomienda fijar la revisión anterior al 2026-09-23 para reproducir resultados obtenidos con esa exportación antigua.

Entre las variantes destacadas, `AnatomixDevViT.pt` es un PrimusV2 ViT de 27,1 M de parámetros cuyo embedding posicional está dimensionado para un cubo de 128 vóxeles, por lo que debe puntuarse parche a parche a ese tamaño (`PatchSize 128 128 128` en Elastix, `feature_patch: 128` en KonfAI FireANTs). `Dino/DinoV2_Small.pt` se exportó con un argumento `stats` vacío, lo que congeló la rama de normalización en el mínimo y máximo de la propia imagen e ignoró las estadísticas que IMPACT pasa; con estadísticas ambas exportaciones difieren en ~7e-3 y sin ellas coinciden hasta 9e-6. Los scripts de exportación están en `ImpactLoss/Data/Models/builds/Anatomix`.

## Capacidades

- Extracción de características semánticas de imágenes médicas (CT y MRI) y de imágenes naturales, a múltiples capas, para su uso como función de similitud en registro.
- Segmentación anatómica de cuerpo completo en CT y MRI (TotalSegmentator, MRSegmentator).
- Segmentación genérica de imágenes naturales (SAM 2.1).
- Características auto-supervisadas de vision transformer (DINOv2 Small).
- Codificadores con priors anatómicos (Anatomix U-Net de 16 canales de características; AnatomixDevViT de 32 canales).
- Descriptor handcrafted MIND envuelto en TorchScript como referencia clásica.
- Integración con Elastix (mapas de parámetros de ejemplo incluidos) y con el motor KonfAI FireANTs.
- No soporta tool calling, agentes, generación de texto ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Registro multimodal CT-MRI en investigación clínica: usar las características de TotalSegmentator o MRSegmentator como término de similitud en Elastix, sustituyendo métricas de intensidad como NCC o MI por una comparación a nivel de características semánticas.
- Registro deformable de imágenes cerebrales o de cuerpo completo con el ViT anatómico: emplear `AnatomixDevViT.pt` puntuando parche a parche a 128³ vóxeles cuando se requiera un codificador con priors anatómicos y 32 canales de características.
- Reproducción de resultados del preprint IMPACT: el repositorio incluye mapas de parámetros de ejemplo, utilidades de manejo de TorchScript y un entorno Docker listo para usar, lo que permite replicar experimentos sin reconstruir los pipelines.
- Evaluación comparativa de descriptores: al reunir MIND, SAM 2.1, DINOv2, TotalSegmentator y Anatomix bajo la misma interfaz, permite comparar de forma controlada el comportamiento de cada extractor como término de similitud.
- Despliegue en producción clínica sin dependencias del código original: al ser TorchScript autocontenido, se puede integrar en servicios de inferencia basados en PyTorch sin arrastrar los repositorios de cada red de origen.
- Segmentación anatómica previa al registro: reutilizar las cabezas de TotalSegmentator o MRSegmentator para generar máscaras de estructuras y guiar o validar el registro con restricciones anatómicas.
- Prototipado rápido con Docker: el entorno incluido permite lanzar experimentos de registro semántico en cuestión de minutos en una máquina con GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta comparaciones internas entre exportaciones (correlación de 0,21 entre la versión antigua y la nueva de `Anatomix.pt`; diferencia de ~7e-3 con estadísticas y coincidencia de 9e-6 sin ellas entre exportaciones de DINOv2 Small). Los resultados de la métrica IMPACT frente a métricas clásicas deben consultarse en el preprint arXiv:2503.24121.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. El repositorio pesa 12,2 GB en total, pero cada extractor se carga individualmente; el ViT de 27,1 M de parámetros es ligero, mientras que los U-Net de TotalSegmentator y MRSegmentator y SAM 2.1 son los componentes más pesados.
- GPU recomendadas: no disponibles en la información proporcionada. Por el tamaño de los modelos, una GPU consumer con 8-16 GB de VRAM debería bastar para la mayoría de extractores individuales, pero este dato no está confirmado por el autor.
- Compatibilidad con GPU consumer: probable para los extractores individuales, no confirmada oficialmente.
- Opciones de despliegue: PyTorch con TorchScript (`torch.jit.load`), Elastix con los mapas de parámetros incluidos, KonfAI FireANTs, y el entorno Docker del repositorio `ImpactLoss`. Exportaciones ONNX mencionadas en los tags.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `VBoussot/impact-torchscript-models` | Colección de extractores para métrica de registro | Variable (AnatomixDevViT: 27,1 M) | Imagen 3D; 128³ fijo en ViT | Apache 2.0 (pesos mixtos) | Hugging Face, 0 descargas, 1 like |
| TotalSegmentator (original) | U-Net de segmentación anatómica | No disponible | Volumen 3D completo | Apache 2.0 (tareas abiertas) | GitHub, ampliamente usado |
| MRSegmentator (original) | U-Net de segmentación CT/MRI | No disponible | Volumen 3D completo | Apache 2.0 | GitHub |
| Anatomix (original) | U-Net / ViT con priors anatómicos | 27,1 M (ViT) | Volumen 3D | MIT | GitHub |

La comparativa directa con otros paquetes de métricas de registro (por ejemplo, implementaciones de MIND o de métricas basadas en deep features) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo ni un LLM: no admite prompts, texto, tool calling ni razonamiento multi-step. Cualquier uso fuera del registro y la extracción de características de imagen no está soportado.
- Restricciones de licencia en los pesos subyacentes: TotalSegmentator publica solo parte de sus tareas bajo Apache 2.0 y el resto tras un número de licencia; únicamente se exportan las tareas abiertas. Los checkpoints de DINOv3 están cubiertos por el DINOv3 License Agreement y se construyen localmente en lugar de redistribuirse. Revisar `NOTICE` y `LICENSES/` antes de uso comercial.
- Riesgo de reproducibilidad: `Anatomix.pt` fue reexportado en modo evaluación; para reproducir resultados obtenidos con la versión anterior hay que fijar la revisión previa al 2026-09-23. La exportación antigua producía características en un rango muy distinto (±109 frente a ±5) y correlacionaba solo 0,21 con la actual.
- Restricción de tamaño de entrada en `AnatomixDevViT.pt`: solo acepta 128x128x128 vóxeles por su embedding posicional; hay que puntuar parche a parche con `PatchSize 128 128 128` (Elastix) o `feature_patch: 128` (KonfAI).
- Comportamiento de normalización dependiente de la exportación en `Dino/DinoV2_Small.pt`: la exportación con `stats` vacío ignora las estadísticas que pasa IMPACT; verificar qué variante se está usando.
- Preprocesado específico por modelo (normalización a [0,1], estandarización a media cero y varianza unitaria, recorte de intensidades, orientación canónica): aplicarlo incorrectamente degrada la calidad de las características sin aviso explícito.
- Adopción muy baja: 0 descargas y 1 like en el momento de la consulta, lo que implica poca validación externa y escasa comunidad de soporte.
- Sin datos publicados de latencia, throughput ni requisitos de VRAM; el dimensionado de hardware debe hacerse empíricamente.
- Alucinación y sesgos: no aplica en el sentido de los LLM, pero los extractores heredan los sesgos de sus datasets de entrenamiento (poblaciones, protocolos de adquisición y equipos concretos), lo que puede afectar a la generalización en dominios clínicos distintos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/VBoussot/impact-torchscript-models
- Preprint IMPACT: https://arxiv.org/abs/2503.24121
- Implementación de IMPACT e integración con Elastix: https://github.com/vboussot/ImpactLoss
- Scripts de exportación Anatomix: https://github.com/vboussot/ImpactLoss/tree/main/Data/Models/builds/Anatomix
- Anatomix: https://github.com/neel-dey/anatomix
- TotalSegmentator (paper): https://arxiv.org/abs/2208.05868
- MRSegmentator (paper): https://arxiv.org/abs/2405.06463
- SAM 2 (paper): https://arxiv.org/abs/2408.00714
- Anatomix (paper): https://arxiv.org/abs/2411.02372
- MIND (paper): https://doi.org/10.1016/j.media.2012.05.008
