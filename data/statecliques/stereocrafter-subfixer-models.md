# statecliques/stereocrafter-subfixer-models

## Resumen

Este repositorio no contiene un modelo de lenguaje, sino un *checkpoint* de segmentación de imagen alojado como espejo (mirror) por el usuario `statecliques` bajo el identificador `statecliques/stereocrafter-subfixer-models`. El fichero es una copia sin modificar de `sam_tss_l_textseg.pth`, el *checkpoint* de trazo de texto (text-stroke) de Hi-SAM, publicado originalmente por el equipo de Maoyuan Ye y Jing Zhang en el repositorio de GitHub de Hi-SAM. El autor del espejo declara explícitamente que no lo ha entrenado y no reclama crédito alguno sobre él.

El problema que resuelve este alojamiento es puramente logístico: el *checkpoint* original vive en Google Drive, que sirve una página HTML intermedia para ficheros grandes en lugar de los bytes reales. Esa página puede guardarse como `.pth` sin errores y fallar mucho más tarde, en el momento de cargar el modelo, simulando un *checkpoint* corrupto. Además, Drive limita las descargas automatizadas, lo que rompe instalaciones reproducibles.

Técnicamente, Hi-SAM combina la columna vertebral SAM ViT-L de Meta con cabezales entrenados para segmentación jerárquica de texto, y estos pesos se usan en StereoCrafter Studio (concretamente en su módulo Subtitle Fixer) para localizar con precisión los trazos de glifos de subtítulos incrustados y anclar su profundidad, evitando el parche parpadeante que DepthCrafter produce alrededor del texto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | SAM (Segment Anything Model) con columna vertebral ViT-L más cabezales de segmentación de texto de Hi-SAM |
| Parámetros totales | no disponible (el repositorio no declara el recuento; el *checkpoint* aloja solo las partes entrenadas) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión; no procesa secuencias de texto) |
| Tipos de cuantización | no disponible (solo se publica el *checkpoint* `.pth` sin cuantizar) |
| Idiomas soportados | no disponible (el repositorio no declara idiomas; es un modelo visual, no lingüístico) |
| Licencia | apache-2.0 para los pesos y el código de Hi-SAM, con salvedad sobre el dataset TextSeg (términos de uso exclusivamente investigador) |
| Formato de pesos | PyTorch `.pth` (`sam_tss_l_textseg.pth`, 122.756.163 bytes, SHA-256 `1A7399FD5B031383A3776B4375332D23B952BE616A735B545B3ABB7EB89D063F`) |
| Tamaño del repositorio | 0,1 GB |
| Variante | `tss_l_textseg` (text-stroke, columna vertebral L, entrenado sobre TextSeg) |
| Backbone externo requerido | `sam_vit_l_0b3195.pth` (Meta AI), no incluido en el espejo; se fusiona en tiempo de carga |
| Fecha de publicación | 17 de septiembre de 2026 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de Segment Anything (SAM): un codificador de imagen basado en un Vision Transformer Large, un codificador de *prompts* y un decodificador de máscaras que produce máscaras de segmentación. Hi-SAM, la contribución de Ye et al., añade sobre esa base un diseño jerárquico orientado a la segmentación de texto, y esta variante concreta (`tss`) se especializa en el nivel de trazo de texto (*text stroke*), es decir, la delimitación de los trazos que componen cada glifo más que de la caja o la región de la palabra.

El *checkpoint* del espejo contiene únicamente las partes entrenadas, que suman 122.756.163 bytes. La columna vertebral SAM ViT-L, de un orden de magnitud mayor, se fusiona al cargar el modelo desde el fichero `sam_vit_l_0b3195.pth` que publica Meta directamente y que no se replica aquí. Esta separación explica que el repositorio ocupe solo 0,1 GB y es el motivo por el que el *checkpoint* aislado no es autocontenido: sin el backbone de Meta, la carga falla.

Los pesos se entrenaron sobre el dataset TextSeg, cuyos autores imponen sus propios términos de uso con fines de investigación. El repositorio no documenta el número de tokens o imágenes vistas, la composición detallada del dataset ni si hubo etapas de ajuste fino adicionales más allá de lo descrito en el artículo `arXiv:2401.17904`. El autor del espejo tampoco aporta métricas de validación.

## Capacidades

- Segmentación de trazos de texto: genera máscaras de los trazos de los glifos, con precisión suficiente para distinguir caracteres individuales del fondo.
- Segmentación de imagen guiada por *prompts*: hereda de SAM la capacidad de producir máscaras a partir de indicaciones (puntos, cajas u otras), aunque la variante publicada está especializada en texto.
- Segmentación jerárquica de texto: el trabajo de Hi-SAM aborda distintos niveles de granularidad (trazo, palabra, línea y párrafo); esta variante concreta corresponde al nivel de trazo.
- Integración con reconstrucción de profundidad: las máscaras se emplean para fijar a un plano de profundidad constante los subtítulos incrustados y recomponerlos, como hace Subtitle Fixer en StereoCrafter Studio.
- Soporte de *tool calling* / *function calling*: no aplica (modelo de visión, sin interfaz de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingües: no disponibles ni declaradas; al operar sobre píxeles, el alcance real depende de la distribución de texto del dataset TextSeg.
- Capacidades especiales adicionales (visión general, audio, modo *thinking*): no disponibles.

## Casos de uso

- Reparación de profundidad alrededor de subtítulos incrustados: es el uso documentado. El módulo Subtitle Fixer de StereoCrafter Studio aplica Hi-SAM para localizar los trazos del subtítulo y anclar su profundidad a un plano plano, evitando que DepthCrafter los interprete como textura y devuelva una mancha parpadeante que el *splatting* rompe después.
- Conversión de vídeo 2D a 3D estereoscópico: en cualquier flujo de generación de estéreo a partir de metraje con rótulos quemados, las máscaras de texto permiten tratar la capa de subtítulos de forma independiente al resto de la escena.
- Eliminación de subtítulos para rehacerlos o traducirlos: las máscaras de trazo alimentan un *pipeline* de *inpainting* que borra el texto original y libera la zona para un nuevo rótulo.
- Preprocesado para OCR: obtener una máscara precisa de los trazos permite recortar o realzar únicamente la región de texto antes de pasarla a un motor de reconocimiento, reduciendo ruido de fondo.
- Limpieza de datasets de visión por computador: al eliminar o enmascarar texto quemado en imágenes de entrenamiento se evita que los modelos aprendan correlaciones espurias entre glifos y etiquetas.
- Documentación escaneada y digitalización: la segmentación a nivel de trazo ayuda a separar texto manuscrito o impreso de sellos, firmas y elementos gráficos superpuestos.
- Investigación en segmentación jerárquica de texto: sirve como punto de partida para reproducir o extender los resultados del artículo, comparando el nivel de trazo con los niveles de palabra y párrafo.
- Control de calidad en postproducción: detectar automáticamente rótulos en un plano para verificar que cumplen la zona segura o para inventariar los rótulos presentes en un metraje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio es un espejo que no incluye tabla de métricas, comparativas ni evaluaciones; el artículo asociado (`arXiv:2401.17904`) existe, pero sus cifras no se han proporcionado en la información de partida y no se reproducen aquí.

## Requisitos de hardware

- Peso de los ficheros: 122.756.163 bytes (unos 117 MiB) para el *checkpoint* entrenado, más el backbone SAM ViT-L (`sam_vit_l_0b3195.pth`), que se descarga aparte desde Meta y que es sensiblemente mayor.
- VRAM estimada: no disponible como dato confirmado por el autor. Como referencia orientativa y no verificada, un ViT-L a resolución 1024×1024 suele requerir del orden de 3 a 6 GB en precisión completa para una imagen por lote, y menos si se reduce la resolución de entrada.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM (RTX 3060 de 12 GB, RTX 4070, RTX 4080, RTX 4090) debería bastar para inferencia en consumer; en centro de datos, A100 o H100 aportan margen para lotes mayores y mayor resolución.
- ¿Cabe en GPU de consumo? Sí, previsiblemente en la mayoría de tarjetas con 8 GB o más, dado el tamaño del *checkpoint*; conviene verificar la resolución de trabajo real del *pipeline*.
- CPU: la inferencia es posible en CPU pero con latencias muy superiores; no hay cifras publicadas.
- Opciones de despliegue: PyTorch con el código de carga de Hi-SAM. No aplican vLLM, TGI, llama.cpp ni Ollama, al no tratarse de un modelo de lenguaje ni existir versiones GGUF. No se documenta exportación a ONNX, TorchScript ni TensorRT.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Propósito | Parámetros | Formato de pesos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `statecliques/stereocrafter-subfixer-models` (este espejo) | Segmentación de trazo de texto sobre SAM ViT-L | no disponible | `.pth` (solo partes entrenadas) | apache-2.0, con salvedad del dataset TextSeg | HuggingFace, descarga directa |
| Hi-SAM original (`sam_tss_l_textseg.pth`) | Idéntico al anterior | no disponible | `.pth` | apache-2.0, con salvedad del dataset TextSeg | Google Drive desde el repositorio de Hi-SAM; descarga poco fiable para scripts |
| SAM ViT-L de Meta (`sam_vit_l_0b3195.pth`) | Segmentación genérica de objetos guiada por *prompts* | no disponible | `.pth` | apache-2.0 | Publicado directamente por Meta en el repositorio de Segment Anything |
| SAM 2 | Segmentación de imagen y vídeo, con seguimiento | no disponible | no disponible | no disponible | Publicado por Meta |

La diferencia relevante frente a SAM ViT-L no está en el tamaño, sino en la especialización: SAM segmenta objetos genéricos y no distingue el trazo de un glifo del fondo, mientras que Hi-SAM se ha ajustado específicamente para texto. No se proporcionan datos de rendimiento comparativo entre estas alternativas.

## Limitaciones y advertencias

- Licencia del dataset: los pesos se entrenaron sobre TextSeg, cuyos autores imponen términos de uso para investigación. La licencia apache-2.0 del código de Hi-SAM no otorga derechos sobre el dataset, y cualquier uso comercial exige revisar esos términos de forma independiente.
- Este repositorio es un espejo no oficial: no lo mantiene el equipo de Hi-SAM ni Meta, y el autor se compromete a retirarlo si los autores originales lo solicitan.
- Dependencia externa: el *checkpoint* no es autocontenido. Requiere `sam_vit_l_0b3195.pth` de Meta, que debe descargarse por separado; sin él la carga falla.
- Verificación obligatoria de integridad: debe comprobarse el SHA-256 (`1A7399FD5B031383A3776B4375332D23B952BE616A735B545B3ABB7EB89D063F`) antes de usar el fichero, dado que el problema que motivó el espejo era precisamente una descarga corrupta silenciosa.
- Alcance funcional estrecho: segmenta trazos de texto; no genera texto, no responde a instrucciones, no admite *tool calling* ni razonamiento multi-paso. Cualquier uso fuera de la segmentación visual requiere otro componente.
- Sensibilidad a la resolución y al tamaño del texto: los glifos muy pequeños, con poco contraste, desenfoque de movimiento o compresión agresiva de vídeo pueden degradar la máscara. No se han publicado cifras al respecto.
- Riesgo de falsos positivos sobre texturas similares a texto (rejillas, tramas, patrones repetitivos), no cuantificado en la información disponible.
- Idiomas no declarados: no hay garantía de cobertura sobre alfabetos distintos de los presentes en TextSeg.
- Alucinación: el concepto no aplica a un modelo de segmentación, pero sí existe el riesgo análogo de producir máscaras plausibles sobre regiones que no contienen texto.
- Sin cuantizaciones publicadas: no hay versiones GGUF, AWQ, GPTQ ni ONNX, lo que limita el despliegue en entornos de bajos recursos y complica optimizaciones estándar.
- Repositorio sin tracción: cero descargas y cero *likes* en el momento de la consulta, sin issues ni discusiones que sirvan de soporte.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/statecliques/stereocrafter-subfixer-models
- Repositorio de Hi-SAM (código y pesos originales): https://github.com/ymy-k/Hi-SAM
- Artículo de Hi-SAM: https://arxiv.org/abs/2401.17904
- Segment Anything (Meta AI): https://github.com/facebookresearch/segment-anything
- *Checkpoints* de SAM publicados por Meta: https://github.com/facebookresearch/segment-anything#model-checkpoints
- StereoCrafter Studio (consumidor del modelo): https://github.com/Billynom8/StereoCrafter
- Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los enlaces anteriores proceden de la información del repositorio y de su model card.
