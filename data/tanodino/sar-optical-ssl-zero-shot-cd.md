# tanodino/sar-optical-ssl-zero-shot-cd

## Resumen

Este repositorio publica los pesos de tres frameworks de aprendizaje autosupervisado cross-modal (DeCUR, CROMA y CroCoMAE) preentrenados bajo un protocolo idéntico para su uso en detección de cambios zero-shot entre imágenes Sentinel-2 (pre-evento, ópticas) y Sentinel-1 (post-evento, radar SAR). Lo desarrolla el usuario tanodino y se enmarca en un trabajo de evaluación comparativa de encoders SAR-ópticos para detección de cambios homogénea. El problema que aborda es la escasez de etiquetas en teledetección: en lugar de entrenar un detector supervisado, se aprovechan representaciones autosupervisadas para comparar directamente embeddings de dos modalidades distintas.

Cada framework incluye dos encoders ViT-Small (uno por modalidad), de 384 dimensiones, 12 capas, 6 cabezas de atención y parches de 8x8 sobre entradas de 64x64 píxeles. El módulo completo va desde 44,3 M parámetros (CroCoMAE) hasta 317,6 M (DeCUR), incluyendo proyectores y cabezas. El preentrenamiento se realizó sobre 1.609.824 teselas de 64x64 píxeles extraídas de 100.614 pares co-temporales Sentinel-1/Sentinel-2 de un subconjunto de SSL4EO-S12 v1.1.

Es relevante ahora porque ofrece pesos reproducibles y comparables de tres arquitecturas de referencia en un mismo régimen de entrenamiento, con licencia permisiva (CC BY 4.0), lo que facilita la reproducibilidad de experimentos de detección de cambios sin necesidad de reentrenar desde cero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-Small) dual, uno por modalidad; frameworks DeCUR, CROMA y CroCoMAE |
| Parametros totales | DeCUR: 317,6 M; CROMA: 60,6 M; CroCoMAE: 44,3 M (módulo completo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrada de imagen fija de 64x64 píxeles, parches 8x8, 64 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | CC BY 4.0 |
| Formato de pesos | PyTorch (`model.pth` con state dict del framework completo; `model_info.json`, `config.json`, `norm_stats.json`) |

## Arquitectura y entrenamiento

La arquitectura es un transformer de visión (ViT-Small) por modalidad: 384 dimensiones de embedding, 12 capas, 6 cabezas de atención y parches de 8x8 sobre entradas de 64x64 píxeles (64 tokens por imagen). La entrada SAR es Sentinel-1 GRD en bandas VV y VH en decibelios; la entrada óptica es Sentinel-2 L1C en bandas B2, B3, B4 y B8. Ambas se recortan y estandarizan con los valores de `norm_stats.json`. Cada framework mantiene sus propias pérdidas, proyectores, temperaturas y estrategias de enmascaramiento.

El preentrenamiento usó 1.609.824 teselas de 64x64 píxeles procedentes de 100.614 pares co-temporales Sentinel-1/Sentinel-2 de un subconjunto de SSL4EO-S12 v1.1 (diciembre de 2019 a octubre de 2021). El protocolo, idéntico para los tres frameworks, emplea batch de 512, AdamW (betas 0,9/0,95, weight decay 0,05), tasa de aprendizaje pico de 1,5e-4, calentamiento lineal durante el 5 % de un schedule de 150.000 pasos seguido de decaimiento coseno hasta 1e-6, clipping de gradiente de 1,0, precisión mixta, semilla 0 y una sola GPU. Los pesos publicados corresponden al paso 148.000. CROMA y CroCoMAE se preentrenaron con 16 tokens visibles de 64 y se aplican en el mismo régimen.

## Capacidades

- Extracción de representaciones autosupervisadas para imágenes SAR (Sentinel-1) y ópticas (Sentinel-2).
- Detección de cambios zero-shot entre una imagen óptica pre-evento y una imagen SAR post-evento, mediante comparación de vectores alineados entre modalidades.
- Generación de mapas de cambio a partir de los embeddings extraídos (`extract_features.py`).
- Alineación cross-modal: cada framework define un vector alineado (salida del proyector en DeCUR, cabeza contrastiva en CROMA, subespacio compartido en CroCoMAE).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni procesamiento de texto.
- No dispone de modo de razonamiento (thinking mode), visión general, audio ni generación de lenguaje.

## Casos de uso

- Detección de cambios en superficie terrestre sin etiquetas: comparar embeddings de una imagen Sentinel-2 previa y una Sentinel-1 posterior para localizar zonas alteradas, útil cuando no hay datos anotados de la zona de interés.
- Monitorización de inundaciones: usar el par óptico/SAR para detectar áreas anegadas aprovechando que el SAR opera con independencia de la nubosidad.
- Seguimiento de deforestación o cambios de cobertura vegetal: comparar representaciones pre/post en series temporales de baja resolución (64x64 píxeles por tesela).
- Evaluación comparativa de frameworks de SSL: servir como referencia reproducible para medir DeCUR frente a CROMA y CroCoMAE bajo un protocolo común.
- Investigación en alineación cross-modal SAR-óptico: usar los encoders y proyectores como base para experimentos de representación compartida entre modalidades.
- Prototipado de pipelines de cambio en entornos con recursos limitados: los tamaños de 44-60 M parámetros (CroCoMAE, CROMA) permiten experimentar en una sola GPU.
- Validación de metodologías zero-shot: emplear los mapas de cambio generados como línea base antes de invertir en anotación supervisada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por tamaño (44,3-317,6 M parámetros) es viable en GPUs de consumo, aunque no se documentan cifras concretas.
- GPU recomendadas: no disponible; el preentrenamiento se realizó en una sola GPU sin especificar modelo.
- Cabe en GPU de consumo: previsiblemente sí para CroCoMAE y CROMA por su tamaño, aunque no se confirma en la información disponible.
- Opciones de despliegue: carga mediante el repositorio de código (`model_loading.load_model`) con PyTorch; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros (modulo) | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeCUR (este repo) | 317,6 M | 64x64 px, 64 tokens | Cambio zero-shot SAR-óptico | CC BY 4.0 | Pesos publicados |
| CROMA (este repo) | 60,6 M | 64x64 px, 64 tokens | Cambio zero-shot SAR-óptico | CC BY 4.0 | Pesos publicados |
| CroCoMAE (este repo) | 44,3 M | 64x64 px, 64 tokens | Cambio zero-shot SAR-óptico | CC BY 4.0 | Pesos publicados |

Los tres frameworks del repositorio comparten protocolo de entrenamiento y datos, por lo que la comparativa interna es directa. No se dispone de datos de rendimiento comparado con modelos externos en la información proporcionada.

## Limitaciones y advertencias

- Entrada fija de 64x64 píxeles con parches de 8x8: no apta para imágenes de alta resolución sin teselado previo.
- Solo cubre las bandas Sentinel-1 VV/VH y Sentinel-2 B2/B3/B4/B8; otras bandas o sensores quedan fuera del preentrenamiento.
- Modelo de visión sin capacidades de lenguaje, tool calling ni agentes.
- Riesgo de alucinación no aplicable en el sentido de generación de texto, pero sí de falsos positivos en los mapas de cambio; no se documentan métricas de precisión.
- No se especifican sesgos geográficos o temporales del subconjunto SSL4EO-S12 utilizado (2019-2021).
- La licencia CC BY 4.0 exige atribución; los datos Sentinel subyacentes son Copernicus modificados.
- La model card incluye un "TODO: paper reference" sin completar, lo que dificulta la citación formal.
- No se documentan tipos de cuantización ni formatos optimizados para despliegue en producción.

## Enlaces

- Hugging Face: https://huggingface.co/tanodino/sar-optical-ssl-zero-shot-cd
- Código: https://github.com/tanodino/sar-optical-ssl-zero-shot-hcd
- Benchmark (Zenodo): https://doi.org/10.5281/zenodo.24166214
- Dataset SSL4EO-S12 v1.1: https://huggingface.co/datasets/embed2scale/SSL4EO-S12-v1.1
- Paper SSL4EO-S12 v1.1 (Blumenstiel et al.): https://arxiv.org/abs/2503.00168
- Paper CroCoMAE (Recchia et al.): https://arxiv.org/abs/2611.14124
