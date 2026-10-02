# yuplpp/garment-ease-v1

## Resumen

garment-ease-v1 es un modelo de visión por computador publicado por el usuario yuplpp en HuggingFace, consistente en un ajuste fino (*fine-tuning*) supervisado de facebook/dinov2-base, un Vision Transformer ViT-B/14 preentrenado de forma auto-supervisada. El repositorio contiene 86.582.017 parámetros en formato safetensors (0,7 GB) y se distribuye bajo licencia Apache-2.0. La model card lo etiqueta como `image-classification` en el pipeline de HuggingFace, pero las métricas de evaluación declaradas (MAE en centímetros, RMSE en centímetros y sesgo en centímetros) corresponden a una tarea de regresión sobre magnitudes físicas, presumiblemente medidas o holguras (*ease*) de prendas de vestir.

El modelo se entrena con el `Trainer` de Transformers durante 10 épocas, con learning rate 5e-5, tamaño de lote 64, optimizador AdamW fused y scheduler coseno con *warmup* del 5 por ciento. La evaluación final arroja una pérdida de validación de 4,9664, un MAE de 1,9830 cm, un RMSE de 4,6129 cm y un sesgo de -1,4060 cm. No se documenta ni el dataset de entrenamiento ni la composición de los datos, y la propia model card indica «More information needed» en las secciones de descripción, usos previstos y datos.

Su relevancia actual es limitada pero concreta: demuestra el patrón de reutilización de un *backbone* DINOv2 para una tarea de regresión métrica en el dominio textil, un nicho donde escasean los modelos públicos. Con 0 descargas y 0 *likes* en el momento de redactar esta ficha, carece de validación por parte de la comunidad y debe considerarse un experimento reproducible más que un componente listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision Transformer ViT-B/14 (backbone DINOv2) con cabeza de tarea ajustada; detalles de la cabeza no disponibles |
| Parámetros totales | 86.582.017 |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de visión de imagen única). Resolución de entrada empleada en el fine-tuning: no disponible |
| Tipos de cuantización | No disponible (el repositorio solo publica pesos safetensors; no hay versiones GGUF, ONNX ni INT8) |
| Idiomas soportados | No aplica (modelo de imagen); no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Tarea declarada | image-classification (las métricas publicadas corresponden a regresión en centímetros) |
| Modelo base | facebook/dinov2-base |
| Tamaño del repositorio | 0,7 GB |
| Librería | transformers |
| Etiquetas relevantes | dinov2, garment, ease, generated_from_trainer, endpoints_compatible, region:us |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-10-02 |
| Última actualización | 2026-10-02 |

## Arquitectura y entrenamiento

El modelo parte de facebook/dinov2-base, un ViT-B/14 de unos 86 millones de parámetros con parches de 14×14 píxeles, preentrenado con el método DINOv2 (auto-supervisión combinando DINO e iBOT sobre el conjunto LVD-142M). Sobre ese *backbone* se ha aplicado un ajuste fino supervisado mediante el `Trainer` de la librería Transformers, sustituyendo o añadiendo una cabeza de tarea. El recuento total de parámetros publicado (86.582.017) es muy próximo al del *backbone* original, lo que sugiere una cabeza de salida de dimensiones reducidas, pero la model card no especifica su estructura ni si se congelaron capas del *backbone*.

El procedimiento de entrenamiento está documentado en hiperparámetros pero no en datos: 10 épocas, learning rate 5e-5, batch de 64 tanto en entrenamiento como en evaluación, semilla 42, optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-8 en su variante fused, scheduler coseno y *warmup* del 5 por ciento de los pasos. El conjunto de entrenamiento aparece como «None dataset» en la model card y no se describe su tamaño, composición, procedencia ni licencia. No hay constancia de fases de RLHF, DPO ni de ninguna innovación técnica adicional (decodificación especulativa, atención lineal, destilación) más allá del propio preentrenamiento DINOv2. Las versiones de framework declaradas son Transformers 5.18.0, PyTorch 2.14.1+cu130, Datasets 5.0.1 y Tokenizers 0.23.2.

## Capacidades

- Extracción de representaciones visuales de prendas de vestir a partir de imágenes, heredadas del *backbone* DINOv2.
- Predicción de una magnitud escalar expresada en centímetros, coherente con medidas de prenda u holgura (*ease*), según las métricas MAE/RMSE/sesgo en cm publicadas.
- Clasificación o etiquetado de imágenes: el pipeline declarado en HuggingFace es `image-classification`, aunque no se documentan las clases ni el espacio de etiquetas.
- Uso como extractor de *embeddings* para búsqueda visual, clustering o similitud entre prendas, aprovechando las representaciones de DINOv2.
- Compatibilidad con HuggingFace Inference Endpoints (etiqueta `endpoints_compatible`).
- Soporte de *tool calling*, *function calling*, razonamiento multi-paso, modo *thinking*, visión generativa, audio, generación de texto, código y matemáticas: no disponible (no es un modelo de lenguaje ni multimodal generativo).
- Capacidades multilingües: no aplica.

Nota: la ambigüedad entre la etiqueta `image-classification` y las métricas de regresión implica que las capacidades reales deben confirmarse inspeccionando la configuración del modelo y probándolo con entradas propias.

## Casos de uso

- **Medición automatizada de prendas en catálogos de e-commerce**: el modelo puede estimar una magnitud métrica (en centímetros) a partir de la fotografía de una prenda, lo que permitiría poblar fichas de producto con medidas aproximadas sin intervención manual. Requiere validar antes el error real (RMSE de 4,61 cm en la evaluación del autor, posiblemente insuficiente para tallaje comercial).
- **Control de calidad en producción textil**: integrado en una estación de captura de imágenes al final de línea, compararía la medida predicha con la especificación del patrón y marcaría desviaciones. El sesgo negativo de -1,4060 cm debería corregirse o compensarse antes de fijar umbrales de rechazo.
- **Pre-relleno de fichas técnicas en un PLM**: generación de borradores de campos dimensionales para que un técnico de producto los revise, reduciendo el tiempo de alta de referencias.
- **Recomendación de tallas en tienda online**: combinado con la tabla de tallas del fabricante, la medida estimada permitiría sugerir talla al comprador; la latencia y el coste por inferencia serían bajos por el tamaño del modelo, aunque la precisión actual limita su uso a una recomendación orientativa.
- **Catalogación y búsqueda visual en mercados de segunda mano**: usar las representaciones DINOv2 para agrupar prendas similares y recuperar artículos por similitud visual, además de estimar medidas para anuncios donde el vendedor no las proporciona.
- **Aceleración del etiquetado en anotación de datasets textiles**: predecir medidas o categorías y usarlas como propuesta inicial para anotadores humanos, con revisión posterior.
- **Extracción de *embeddings* para sistemas de recomendación**: el *backbone* sirve como codificador visual en un pipeline de recomendación de moda, independientemente de la cabeza de regresión.
- **Investigación en regresión métrica sobre imágenes**: punto de partida reproducible para estudiar cómo se comporta un ViT auto-supervisado en tareas de estimación de magnitudes físicas con pocos datos anotados.

## Benchmarks y rendimiento

El *model-index* del repositorio está vacío (`results: []`), por lo que no hay resultados declarados en benchmarks estándar como MMLU, HumanEval o GSM8K (además, no aplicables a un modelo de visión). Los únicos datos disponibles son las métricas de validación de la model card.

Resultados finales declarados por el autor (época 10):

| Métrica | Valor |
|---|---|
| Validation loss | 4,9664 |
| MAE (cm) | 1,9830 |
| RMSE (cm) | 4,6129 |
| Bias (cm) | -1,4060 |

Evolución durante el entrenamiento:

| Época | Paso | Training loss | Validation loss | MAE cm | RMSE cm | Bias cm |
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| 1,0 | 32 | 6,2426 | 6,6786 | 2,7808 | 6,0586 | -1,8089 |
| 2,0 | 64 | 6,8774 | 6,6392 | 2,8732 | 6,0444 | -2,3233 |
| 3,0 | 96 | 6,9506 | 6,7568 | 2,6827 | 6,0734 | -2,0579 |
| 4,0 | 128 | 6,8102 | 7,1061 | 2,9671 | 6,3757 | -2,6574 |
| 5,0 | 160 | 5,6110 | 6,2630 | 2,5076 | 5,7182 | -1,7881 |
| 6,0 | 192 | 6,9342 | 6,2863 | 2,7283 | 4,8223 | -0,0622 |
| 7,0 | 224 | 6,7059 | 5,4306 | 2,1982 | 4,7388 | -1,2195 |
| 8,0 | 256 | 6,8764 | 5,0775 | 2,0530 | 4,5544 | -1,1531 |
| 9,0 | 288 | 5,2475 | 5,0256 | 2,0014 | 4,6655 | -1,4322 |
| 10,0 | 320 | 5,3113 | 4,9664 | 1,9830 | 4,6129 | -1,4060 |

No se han publicado resultados de benchmarks comparativos ni evaluaciones externas en la información disponible. El conjunto de validación es el mismo usado por el autor, por lo que estos números no equivalen a una evaluación independiente.

## Requisitos de hardware

- VRAM para los pesos: aproximadamente 346 MB en fp32 (86,58 M de parámetros × 4 bytes) y unos 173 MB en fp16/bf16. Hay que sumar el espacio de activaciones, que depende del tamaño de lote y de la resolución de entrada; a 518×518 y lotes pequeños se mantiene habitualmente por debajo de 1-2 GB en fp16.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM es suficiente para inferencia en fp16. Ejemplos razonables: NVIDIA T4, L4, A10G, RTX 3060/4060, RTX 4090. Una A100 o H100 está sobredimensionada para inferencia de una sola muestra y solo tendría sentido para lotes muy grandes.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna (RTX 30/40, e incluso integradas con suficiente memoria compartida). También puede ejecutarse en CPU con latencias mayores.
- Opciones de despliegue: pipeline de Transformers (PyTorch), HuggingFace Inference Endpoints (el repositorio está marcado como `endpoints_compatible`), exportación a ONNX Runtime o TorchScript, NVIDIA Triton Inference Server y TorchServe. vLLM, llama.cpp, Ollama y TGI no son aplicables: están orientados a modelos de lenguaje, no a un ViT de clasificación/regresión.
- Latencia y throughput: no disponible. No se publican mediciones de latencia ni de imágenes por segundo, ni la resolución de entrada empleada, que es el factor determinante del coste computacional.

## Comparativa con modelos similares

No se han identificado en la información disponible modelos públicos comparables de estimación métrica de prendas, ni la búsqueda web devolvió referencias relevantes. Como referencia de la familia del *backbone*, se incluyen los tamaños de DINOv2 con sus valores de arquitectura conocidos:

| Modelo | Parámetros (aprox.) | Contexto de entrada | Rendimiento comparable | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yuplpp/garment-ease-v1 | 86,58 M | Imagen única; resolución no documentada | MAE 1,983 cm / RMSE 4,613 cm en validación propia | Apache-2.0 | HuggingFace, 0 descargas |
| facebook/dinov2-base | 86,6 M | Imagen única (224 o 518 px en evaluación) | No disponible como tarea de regresión de prendas | Apache-2.0 | HuggingFace, ampliamente usado |
| facebook/dinov2-small | 22 M | Imagen única | No disponible | Apache-2.0 | HuggingFace |
| facebook/dinov2-large | 300 M | Imagen única | No disponible | Apache-2.0 | HuggingFace |

No es posible establecer una comparativa de rendimiento frente a alternativas porque garment-ease-v1 no reporta resultados en ningún benchmark público y su tarea concreta no está documentada con suficiente detalle.

## Limitaciones y advertencias

- **Documentación mínima**: la model card marca como «More information needed» la descripción del modelo, los usos previstos y los datos de entrenamiento y evaluación. No se puede saber qué entrada espera exactamente el modelo ni qué representa su salida.
- **Dataset no documentado**: el conjunto de entrenamiento aparece como «None dataset». Se desconoce su tamaño, procedencia, licencia y posibles sesgos, lo que impide evaluar riesgos legales o de generalización.
- **Ambigüedad de la tarea**: el pipeline declarado es `image-classification`, pero las métricas son de regresión continua en centímetros. Hay que inspeccionar la configuración y la cabeza del modelo antes de integrarlo.
- **Sesgo sistemático**: el sesgo de validación es -1,4060 cm, lo que indica una tendencia a subestimar la magnitud predicha. En tallaje, un error sistemático de más de un centímetro es relevante y debería corregirse.
- **Error elevado para uso comercial**: un RMSE de 4,6129 cm implica que una parte considerable de las predicciones se desvía varios centímetros del valor real. No es adecuado como única fuente para decisiones de tallaje o producción.
- **Riesgo de alucinación**: no aplica en el sentido de los modelos generativos, pero sí existe el riesgo de predicciones confiadas y erróneas fuera de la distribución de entrenamiento (prendas de materiales, iluminaciones o ángulos no vistos).
- **Sin validación externa**: 0 descargas y 0 *likes*; no hay evaluaciones independientes ni evidencia de reproducibilidad por terceros.
- **Licencia**: los pesos se publican bajo Apache-2.0, lo que permite uso comercial, pero la licencia de los datos de *fine-tuning* es desconocida y podría imponer restricciones adicionales sobre el modelo derivado.
- **Generalización lingüística y geográfica**: al ser un modelo puramente visual, no hay componente de idioma, pero tampoco hay evidencia de que generalice entre tipos de tallaje, morfologías o estándares de medida de distintos países.
- **Resolución de entrada**: se desconoce la resolución usada en el ajuste fino; alimentar el modelo con resoluciones distintas a la de entrenamiento puede degradar el rendimiento de forma significativa en ViT con parches de 14 píxeles.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yuplpp/garment-ease-v1
- Modelo base facebook/dinov2-base: https://huggingface.co/facebook/dinov2-base
- Espacio de Trackio asociado al entrenamiento: https://huggingface.co/spaces/yuplpp/huggingface-static-11f73b
- Paper de DINOv2 (Oquab et al., 2023): https://arxiv.org/abs/2304.07193
- Repositorio oficial de DINOv2: https://github.com/facebookresearch/dinov2

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre garment-ease-v1 ni sobre estimación automática de medidas de prendas; los enlaces obtenidos no guardaban relación con el modelo y se han omitido.
