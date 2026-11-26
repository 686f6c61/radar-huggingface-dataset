# ykardev/rockir-ias

## Resumen

`ykardev/rockir-ias` es un repositorio de pesos en formato ONNX que agrupa varios modelos de segmentación de imagen de propósito general (SAM 2.1, EdgeTAM, EfficientSAM, SAM-HQ, EfficientViT-SAM y SAM 3) empaquetados específicamente para la aplicación ROCK IR, una herramienta de análisis de fragmentación de roca en voladuras. No se trata de un modelo de lenguaje ni de un modelo entrenado desde cero por el autor: es un contenedor de artefactos de terceros distribuidos para que la app descargue únicamente la red que el usuario elija.

El repositorio no incluye una arquitectura propia ni pesos ajustados (*fine-tuned*) sobre imágenes de voladuras; su valor es logístico: centraliza variantes de Segment Anything con distintos equilibrios de coste y precisión para que la app móvil o de escritorio seleccione la adecuada según el dispositivo. El tamaño total del repositorio es de 2,2 GB, coherente con la suma de varios checkpoints ONNX de segmentación.

La relevancia es acotada: resulta útil para quien construya flujos de segmentación de rocas o escombros con modelos SAM en producción, pero no aporta innovación arquitectónica ni datos de entrenamiento propios. La información pública es muy escasa (0 descargas, 0 likes, sin pipeline declarado, sin idiomas y sin benchmarks), por lo que muchos campos de esta ficha quedan como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Múltiples: SAM 2.1, EdgeTAM, EfficientSAM, SAM-HQ, EfficientViT-SAM y SAM 3 (todos segmentadores de imagen basados en transformer/encoder visual) |
| Parametros totales | no disponible (varía por checkpoint; no se publica el desglose) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelos de visión; sin ventana de texto) |
| Tipos de cuantizacion | no disponible (los artefactos se distribuyen ya exportados a ONNX; no se documentan variantes INT8/FP16) |
| Idiomas soportados | no disponible (modelos de visión, sin procesamiento de lenguaje) |
| Licencia | Mixta: Apache-2.0 para SAM 2.1, EdgeTAM, EfficientSAM, SAM-HQ y EfficientViT-SAM; SAM License para SAM 3 (texto en `rockir-sam3-LICENCA.txt`) |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El repositorio no entrena ningún modelo: agrega exportaciones ONNX de segmentadores de imagen conocidos. SAM 2.1 y SAM 3 (Meta) emplean un encoder de imagen tipo ViT con un decoder de máscaras guiado por *prompts* (puntos, cajas o máscaras); SAM-HQ (ETH Zúrich) añade un módulo de refinamiento de alta calidad sobre la arquitectura SAM original; EfficientSAM (Meta) y EfficientViT-SAM (MIT Han Lab) sustituyen el encoder pesado por variantes eficientes destiladas para reducir coste computacional; EdgeTAM está orientado a inferencia en el borde (dispositivos con recursos limitados). No se publican datos sobre tokens de entrenamiento, composición del dataset ni procesos de RLHF/DPO, ya que se heredan de los modelos originales.

La innovación práctica del repositorio es la selección en tiempo de descarga: la app ROCK IR solicita al Hub solo el ONNX correspondiente al modelo elegido por el usuario, lo que permite ofrecer desde variantes ligeras (EdgeTAM, EfficientSAM) hasta variantes de alta calidad (SAM-HQ, SAM 3) sin obligar a descargar el paquete completo de 2,2 GB. No se documentan optimizaciones adicionales como decodificación especulativa ni atención lineal.

## Capacidades

- Segmentación de imagen guiada por *prompts* (puntos, cajas o máscaras) mediante los distintos checkpoints SAM incluidos.
- Segmentación automática de múltiples objetos en una imagen, útil para delimitar fragmentos de roca individuales en fotos de voladuras.
- Variantes con distinto compromiso precisión/coste: SAM-HQ para máxima calidad de borde, EfficientSAM y EfficientViT-SAM para entornos con poca GPU, EdgeTAM para dispositivos de borde.
- Ejecución en ONNX Runtime, lo que permite despliegue multiplataforma (CPU, CUDA, CoreML, DirectML) sin dependencia de PyTorch.
- No soporta generación de texto, tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es exclusivamente un conjunto de modelos de visión.
- No incluye modo *thinking*, audio ni vídeo documentado en la información disponible.

## Casos de uso

- Análisis de fragmentación de roca en voladuras: la app ROCK IR usa los checkpoints para segmentar cada fragmento en la fotografía del *muckpile*; a partir de las máscaras se calculan áreas y distribuciones granulométricas. SAM-HQ resulta adecuado cuando se requiere precisión en los bordes.
- Procesamiento en dispositivos de campo: EdgeTAM o EfficientSAM permiten ejecutar la segmentación en tablets o portátiles sin GPU dedicada, reduciendo el peso del checkpoint descargado.
- Automatización de informes de voladura: integración de las máscaras en un pipeline que calcule curvas de distribución y las adjunte al informe técnico de la explotación.
- Investigación en visión aplicada a minería: uso de los ONNX como línea base para comparar segmentadores sobre un mismo conjunto de imágenes de escombros.
- Prototipado rápido con ONNX Runtime: al estar exportados, se pueden cargar en Python, C# o JavaScript (onnxruntime-web) sin conversión adicional, lo que acelera pruebas de concepto.
- Control de calidad en cantera: comparación de la granulometría estimada por segmentación con el cribado real para calibrar el modelo de fragmentación.
- Docencia y demostraciones: el repositorio sirve como ejemplo de empaquetado de varios segmentadores SAM en un único Hub para descarga selectiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible para cada checkpoint concreto; el repositorio completo ocupa 2,2 GB en disco, pero el consumo en memoria depende de la variante elegida (las variantes eficientes están pensadas para menos de 4 GB, las de tipo SAM-HQ o SAM 3 requieren más, aunque no se documenta la cifra exacta).
- GPU recomendadas: no disponibles de forma específica; por la naturaleza de los modelos, una RTX 4090 o A100 ejecutarían cualquiera de las variantes con holgura, mientras que EdgeTAM y EfficientSAM están diseñados para CPU o GPUs integradas.
- Compatibilidad con GPU de consumo: probable para las variantes eficientes en GPUs de 8 GB o menos; no confirmado por el autor.
- Opciones de despliegue: ONNX Runtime (CPU, CUDA, DirectML, CoreML), onnxruntime-web; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de visión de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Licencia | Formato | Contexto / entrada | Disponibilidad |
|---|---|---|---|---|---|
| rockir-ias (este repo) | Colección de segmentadores SAM en ONNX | Mixta (Apache-2.0 + SAM License) | ONNX | Imagen | Hugging Face, 0 descargas |
| SAM 2.1 (Meta) | Segmentador imagen/vídeo | Apache-2.0 | PyTorch, ONNX | Imagen/vídeo | Repositorio oficial de Meta |
| EfficientSAM (Meta) | Segmentador eficiente destilado | Apache-2.0 | PyTorch | Imagen | Repositorio oficial de Meta |
| SAM-HQ (ETH Zúrich) | Segmentador de alta calidad | Apache-2.0 | PyTorch | Imagen | Repositorio oficial |

No se dispone de datos de rendimiento comparativo (mIoU, latencia) en la información proporcionada para cuantificar diferencias entre estas variantes.

## Limitaciones y advertencias

- No es un modelo entrenado para rocas: los segmentadores son de propósito general y pueden fallar en escenas con oclusión, polvo o iluminación adversa típicas de una voladura.
- Riesgo de máscaras imprecisas en fragmentos pequeños o solapados, lo que afecta al cálculo granulométrico si no se valida con cribado real.
- La licencia es mixta: SAM 3 se rige por la SAM License, que prohíbe expresamente usos militares, nucleares o de espionaje; el resto es Apache-2.0, pero conviene revisar `rockir-sam3-LICENCA.txt` antes de uso comercial.
- El repositorio tiene 0 descargas y 0 likes, sin pipeline declarado ni idiomas: la trazabilidad y el mantenimiento no están garantizados.
- No se documentan sesgos, pero al ser modelos de visión genéricos pueden mostrar peor rendimiento en dominios muy específicos (minería, geología) no representados en sus datos originales.
- No apto para tareas de texto, razonamiento o agentes; cualquier expectativa en ese sentido es un error de uso.
- El tamaño del repo (2,2 GB) exige descarga selectiva por parte de la app; descargar todo el paquete en redes móviles es costoso.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ykardev/rockir-ias
- SAM 2.1 (Meta): no disponible en la información proporcionada
- SAM 3 (Meta): no disponible en la información proporcionada
- EfficientSAM (Meta): no disponible en la información proporcionada
- SAM-HQ (ETH Zúrich): no disponible en la información proporcionada
- EfficientViT-SAM (MIT Han Lab): no disponible en la información proporcionada
