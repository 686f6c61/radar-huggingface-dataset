# Yusin/agg_dvlt2da3

## Resumen

`agg_dvlt2da3` es un conjunto de pesos de destilación (distillation checkpoint) publicado por el usuario Yusin en Hugging Face. No se trata de un modelo de lenguaje generativo, sino de un artefacto de entrenamiento que destila el codificador de imágenes DVLT (basado en DINOv2 ViT-B/14 con registers) dentro del codificador DA3 (DINOv2 ViT-L/14, capas 0-22) del modelo `da3dvlt`. El objetivo es que un único ViT-L alimente tanto la rama de profundidad de DA3 como la red de pose de DVLT.

La técnica empleada es de estilo RADIO: se entrena un adaptador MLP por cada objetivo (target) junto con transformaciones PHI-S, de modo que todas las cabezas del modelo `da3dvlt` original se reutilizan sin cambios. El repositorio contiene dos ficheros de estado completos del script `distill.py` (pasos 6000 y 6500), cada uno de aproximadamente 3,64 GB, con un total de repositorio de 7,3 GB.

La relevancia de este artefacto es acotada: está pensado para investigadores que trabajen con el pipeline DVLT/DA3 de estimación de profundidad y pose, no para uso general como modelo de lenguaje. La información pública es muy escasa (cero descargas, cero likes, model card mínima), por lo que muchos parámetros habituales de una ficha de modelo no están disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Destilación de codificadores ViT (DINOv2 ViT-B/14 + registers hacia DINOv2 ViT-L/14, capas 0-22), estilo RADIO con adaptadores MLP por objetivo y transformaciones PHI-S |
| Parametros totales | no disponible (los ficheros de estado pesan ~3,64 GB cada uno e incluyen estudiante, adaptadores, optimizador AdamW y metadatos) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (se distribuyen checkpoints PyTorch en punto flotante, sin versiones GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | other (licencia personalizada, sin texto detallado en la información disponible) |
| Formato de pesos | checkpoints PyTorch (`.pt`) cargables con `torch.load(path, weights_only=False)`; no se distribuyen safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura subyacente combina dos codificadores visuales basados en Vision Transformer. El profesor (teacher) es el codificador DVLT, un DINOv2 ViT-B/14 con registers; el estudiante es el codificador DA3, un DINOv2 ViT-L/14 restringido a las capas 0-22. La destilación sigue el esquema RADIO: se añade un adaptador MLP independiente por cada objetivo de destilación y se aplican transformaciones PHI-S para alinear las representaciones. El resultado es que un solo ViT-L sirve tanto a la ruta de profundidad de DA3 como a la red de pose de DVLT, reutilizando todas las cabezas del modelo `da3dvlt` sin modificarlas.

El entrenamiento se realizó con el script `distill.py`, cuyo estado completo se guarda en cada checkpoint: `stu` (codificador estudiante y adaptadores), `phis` (transformaciones PHI-S), `opt` (estado del optimizador AdamW), `step`, `hist` (evaluaciones intermedias), `phi2`, `config`, `stop` y `wandb_id`. El checkpoint final es el paso 6500, detenido manualmente con un schedule coseno configurado hasta 10000 pasos; el paso 6000 es el que corresponde a la tabla de resultados downstream del README de GitHub. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO (no aplicables a un modelo de visión de este tipo).

## Capacidades

- Extracción de características visuales mediante un ViT-L/14 destilado desde un ViT-B/14 con registers.
- Alimentación conjunta de la rama de profundidad (depth) de DA3 y de la red de pose de DVLT con un único codificador.
- Reutilización íntegra de las cabezas del modelo `da3dvlt` original, sin reentrenarlas.
- Adaptadores MLP por objetivo que permiten servir distintas tareas downstream desde el mismo tronco.
- Transformaciones PHI-S para alineación de representaciones entre profesor y estudiante.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso: es un componente visual, no un modelo de lenguaje.
- Capacidades multilingües: no aplica.

## Casos de uso

- Investigación en estimación de profundidad monocular: el codificador destilado alimenta la rama de profundidad de DA3, permitiendo evaluar si un ViT-L destilado mantiene la calidad de profundidad respecto al pipeline original.
- Estimación de pose relativa: al compartir tronco con la red de pose de DVLT, se puede ejecutar un pipeline unificado de profundidad y pose con un solo paso de codificación visual.
- Reducción de coste computacional en pipelines DVLT/DA3: sustituir dos codificadores (ViT-B y ViT-L) por un único ViT-L destilado simplifica el grafo de inferencia y el uso de memoria.
- Reproducción de experimentos de destilación estilo RADIO: los checkpoints incluyen el estado completo del optimizador y el historial de evaluación, lo que facilita reanudar o auditar el entrenamiento.
- Evaluación comparativa de esquemas de destilación entre arquitecturas ViT de distinto tamaño (B/14 hacia L/14) con adaptadores por objetivo.
- Integración en sistemas de percepción 3D que requieran profundidad y pose conjuntas, como reconstrucción de escenas o SLAM basado en aprendizaje, siempre que se disponga del resto del pipeline `da3dvlt`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a la tabla downstream del README de la rama `agg_dvlt2da3` en GitHub para los resultados del checkpoint del paso 6000, pero esos números no se incluyen en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; los checkpoints de entrenamiento pesan ~3,64 GB cada uno e incluyen estado del optimizador, por lo que el peso del estudiante en inferencia es inferior a esa cifra.
- GPU recomendadas: no disponible en la información; por el tamaño del ViT-L/14 (capas 0-22) se requiere una GPU con al menos 8-16 GB de VRAM para inferencia en precisión completa, aunque este dato no está confirmado por el autor.
- Compatibilidad con GPU de consumo: no confirmada; probablemente viable en RTX 3090/4090 por el tamaño del codificador, pero sin datos oficiales.
- Opciones de despliegue: carga mediante PyTorch (`torch.load` con `weights_only=False`) y el script `scripts/download_weights.py` del repositorio GitHub; no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un codificador visual de este tipo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Yusin/agg_dvlt2da3` | Destilación ViT-B/14 a ViT-L/14 para DA3/DVLT | no disponible (~3,64 GB por checkpoint) | no aplica | other | Hugging Face, 0 descargas |
| `Yusin/da3dvlt` | Modelo base DA3 + DVLT (referencia del pipeline) | no disponible | no aplica | no disponible | Hugging Face |
| DINOv2 ViT-L/14 | Codificador visual auto-supervisado | ~300 M | no aplica | Apache 2.0 (DINOv2 original) | Meta AI / Hugging Face |
| RADIO | Framework de destilación de codificadores visuales | variable | no aplica | no disponible | NVIDIA / Hugging Face |

La comparación con DINOv2 y RADIO es contextual: `agg_dvlt2da3` es un artefacto derivado que usa ambas tecnologías, no un modelo equivalente en propósito. No se dispone de datos de rendimiento para comparar de forma cuantitativa.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al derivar de DINOv2, hereda los sesgos de sus datos de preentrenamiento, pero el autor no los detalla.
- Riesgo de alucinación: no aplica en el sentido de generación de texto; en tareas visuales, el riesgo se traduce en predicciones de profundidad o pose incorrectas sin señal de incertidumbre documentada.
- Limitaciones de contexto o idioma: no aplica (modelo visual); no se especifican resoluciones de imagen soportadas ni dominios de entrenamiento.
- Restricciones de licencia: la licencia es "other" sin texto detallado en la información disponible; es imprescindible consultar el repositorio GitHub antes de cualquier uso comercial.
- Caveat para producción: el checkpoint final (paso 6500) se detuvo manualmente con un schedule coseno configurado hasta 10000 pasos, por lo que no es un entrenamiento completado según el plan original; el autor indica que la tabla downstream corresponde al paso 6000.
- El repositorio tiene cero descargas y cero likes, sin validación externa de la comunidad.
- Depende del modelo `da3dvlt` y de su pipeline para ser funcional; no es autónomo.
- Los ficheros son checkpoints de entrenamiento completos (incluyen optimizador y metadatos), no pesos de inferencia optimizados.

## Enlaces

- Hugging Face: https://huggingface.co/Yusin/agg_dvlt2da3
- Modelo base referenciado: https://huggingface.co/Yusin/da3dvlt
- Repositorio GitHub (rama `agg_dvlt2da3`): https://github.com/Yusin2Chen/DVLT-Matching/tree/agg_dvlt2da3
- Script de descarga de pesos: `scripts/download_weights.py` dentro del repositorio GitHub anterior.
