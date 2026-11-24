# zouzichen/MaskedVGGT-L

## Resumen

MaskedVGGT-L es un backbone preentrenado de visión por computador para extracción de características en escenarios multivista y geometría 3D. Lo desarrolla Zichen Zou y colaboradores (Xiaosong Jia, Wen-Ming Chen, Zuxuan Wu, Yu-Gang Jiang) en TEAI, Universidad de Fudan, junto con el Shanghai Innovation Institute. El modelo acompaña al artículo "MaskedVGGT: Masked Multi-View Transformers Are Scalable 3D Learners" y se publica como checkpoint de la primera etapa de entrenamiento (actualización 120.000).

El repositorio contiene únicamente el backbone: un codificador de imágenes DINOv3 más un transformer multivista preentrenado. No incluye el código de inferencia completo, que el autor indica que publicará por separado, ni un pipeline declarado en Hugging Face. Por tanto, es un artefacto pensado para adaptación posterior (fine-tuning o extracción de features), no para uso directo como modelo de extremo a extremo.

Su relevancia radica en la combinación de un encoder visual de última generación con un transformer multivista escalable entrenado con enmascaramiento, una línea de investigación activa para aprendizaje 3D auto-supervisado. Con 908 millones de parámetros y pesos en safetensors de 3,6 GB, se sitúa en el rango de backbones grandes de visión, aunque su licencia restringe el uso a investigación no comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multivista con encoder de imagen DINOv3 (patch size 16) |
| Parametros totales | 908.139.552 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende del número de vistas y resolución de parche) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, sin variantes GGUF/INT8 documentadas) |
| Idiomas soportados | no disponible (modelo de visión, no lingüístico) |
| Licencia | maskedvggt-composite-research-terms (solo investigación no comercial) |
| Formato de pesos | safetensors (`model.safetensors`, 3.632.702.600 bytes) |

## Arquitectura y entrenamiento

La arquitectura combina el codificador de imágenes DINOv3 con un transformer multivista preentrenado. El modelo produce características contextuales de parches (*patch features*) y características de cámara y de registros (*camera/register features*), lo que lo orienta a tareas de geometría multivista y reconstrucción 3D. La escala del checkpoint es `l` (large), con parche de 16 píxeles, según `config.json` (formato versión 1, tarea `features`).

El entrenamiento se enmarca en el paradigma de *masked multi-view transformers*: el modelo aprende representaciones 3D escalables mediante enmascaramiento sobre múltiples vistas. El checkpoint publicado corresponde a la etapa uno, actualización 120.000. No se detallan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO (poco habituales en modelos de visión). El modelo se apoya en componentes de DINOv3, VGGT-Ω y CAPI, cuyas condiciones y atribuciones se recogen en `NOTICE.md` y en el directorio `licenses/`.

## Capacidades

- Extracción de características visuales contextuales por parche a partir de imágenes.
- Generación de características de cámara y de registros (*registers*), útiles para tareas de geometría multivista.
- Procesamiento de múltiples vistas de una misma escena (backbone multivista).
- Base para adaptación posterior (*downstream adaptation*) mediante fine-tuning o cabezas específicas.
- Aprendizaje de representaciones 3D auto-supervisado gracias al preentrenamiento con enmascaramiento.
- No incluye generación de texto, tool calling, agentes ni capacidades lingüísticas: es un modelo exclusivamente de visión.
- No se documentan modos de razonamiento explícito (*thinking*), audio ni otras modalidades.

## Casos de uso

- Reconstrucción 3D multivista: usar las características de parche y de cámara como entrada a cabezas de estimación de profundidad, pose o nubes de puntos, aprovechando que el backbone ya codifica geometría entre vistas.
- Investigación en geometría multivista: servir de base reproducible para experimentos académicos que comparen variantes de transformers multivista con enmascaramiento.
- Extracción de features para *matching* entre vistas: las características contextuales por parche permiten construir descriptores para correspondencia densa en pipelines de *structure from motion*.
- Fine-tuning para tareas de visión específicas: adaptar el backbone a clasificación, segmentación o detección en dominios concretos partiendo de representaciones preentrenadas a gran escala.
- *Feature distillation*: emplear las características del modelo como profesor para destilar conocimiento en modelos más pequeños desplegables en producción.
- Evaluación de representaciones 3D: usar el checkpoint como referencia en estudios de *probing* lineal para medir la calidad de las representaciones geométricas aprendidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: en torno a 3,6 GB solo para pesos, más activaciones; con múltiples vistas y resoluciones altas, el consumo crece de forma significativa.
- En FP16/BF16 los pesos ocupan aproximadamente 1,8 GB, aunque no se documentan variantes cuantizadas oficiales.
- GPU recomendadas: A100 o H100 para procesar lotes de vistas con comodidad; RTX 4090 (24 GB) es viable para inferencia con lotes moderados.
- Cabe en GPU de consumo con 8-16 GB si se limita el número de vistas y la resolución, aunque no hay cifras oficiales de memoria.
- Opciones de despliegue: PyTorch nativo (librería declarada); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / vistas | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MaskedVGGT-L | 908 M | multivista (nº no especificado) | Backbone de features 3D | Solo investigación no comercial | Hugging Face, pesos safetensors |
| DINOv3 (encoder base) | no disponible en esta ficha | imágenes individuales | Visión general | según términos de Meta | GitHub facebookresearch/dinov3 |
| VGGT-Ω | no disponible en esta ficha | multivista | Geometría 3D | según términos de Meta | GitHub facebookresearch/vggt-omega |

La comparación cuantitativa con alternativas no está disponible, ya que no se han publicado métricas del modelo en la información proporcionada.

## Limitaciones y advertencias

- Licencia restringida a investigación no comercial: no apta para uso comercial sin autorización expresa.
- Es un backbone, no un modelo de extremo a extremo: requiere código de inferencia (aún no publicado) o cabezas adicionales para tareas concretas.
- Checkpoint de etapa uno (update 120.000): puede no representar el estado final del entrenamiento del artículo.
- Sin benchmarks publicados: no es posible validar su rendimiento frente a alternativas.
- Riesgo de sesgos heredados de los datos de entrenamiento de DINOv3 y del corpus multivista, no documentados.
- Sin información sobre robustez ante dominios fuera de distribución (iluminación, oclusiones, escenas sintéticas frente a reales).
- No es un modelo lingüístico: no soporta texto, tool calling ni agentes.
- La licencia compuesta incorpora términos de componentes de terceros (DINOv3, VGGT-Ω, CAPI); conviene revisar `LICENSE.md`, `NOTICE.md` y `licenses/` antes de cualquier uso.
- Verificar la integridad de los pesos con el SHA-256 indicado (`7162a3b6...f04a81`) antes de desplegar.

## Enlaces

- Hugging Face: https://huggingface.co/zouzichen/MaskedVGGT-L
- DINOv3 (repositorio): https://github.com/facebookresearch/dinov3
- VGGT-Ω (repositorio): https://github.com/facebookresearch/vggt-omega
- CAPI (repositorio): https://github.com/facebookresearch/capi
- Artículo: "MaskedVGGT: Masked Multi-View Transformers Are Scalable 3D Learners" (Zichen Zou, Xiaosong Jia, Wen-Ming Chen, Zuxuan Wu, Yu-Gang Jiang; TEAI, Fudan University; Shanghai Innovation Institute) — enlace no disponible en la información proporcionada.
