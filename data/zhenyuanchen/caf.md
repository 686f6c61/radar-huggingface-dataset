# ZhenyuanChen/CAF

## Resumen

CAF (Contextual Adaptive Fusion) es un método de ajuste ligero sobre CLIP ViT-B/16 para clasificación de imágenes con generalización de dominio. No se trata de un modelo de lenguaje ni de un transformer generativo, sino de un conjunto de pesos aprendidos (prompts visuales y textuales más dos escalares de fusión) que se aplican sobre un backbone CLIP congelado de OpenAI. Lo desarrolla ZhenyuanChen y se publica junto al artículo "When to Trust Adaptation: Contextual Fusion for Transferable Vision-Language Prompting" (arXiv:2611.11824).

El problema que aborda es el de la adaptación de modelos visión-lenguaje a dominios nuevos sin reentrenar el backbone: CAF pondera cuatro rutas de inferencia (zero-shot CLIP y variantes con prompts aprendidos) usando la entropía de las predicciones y estadísticas no etiquetadas del conjunto de evaluación. Los checkpoints liberados ocupan aproximadamente 0,50 MB en total, ya que solo contienen los prompts aprendidos y los escalares de fusión; el backbone CLIP se descarga y verifica en el primer uso.

Su relevancia es metodológica: demuestra que una fusión contextual barata computacionalmente puede mejorar la transferibilidad de los prompts visuales en clasificación de imágenes, con resultados publicados sobre ImageNet y diez conjuntos de destino cruzados, así como en el protocolo base-to-new de 11 datasets.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CLIP ViT-B/16 congelado con prompts visuales y textuales aprendidos y fusión contextual de cuatro rutas |
| Parametros totales | No disponible (los checkpoints liberados suman ~0,50 MB; el backbone CLIP ViT-B/16 es externo y congelado) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de visión; la "ventana" es la resolución de entrada de CLIP ViT-B/16, 224x224 píxeles) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (las etiquetas textuales de CLIP son en inglés por defecto) |
| Licencia | Código bajo MIT; licencia de los pesos no especificada en la model card |
| Formato de pesos | Archivos comprimidos (.zip) con checkpoints de PyTorch; el backbone CLIP se descarga aparte |

## Arquitectura y entrenamiento

CAF parte de un CLIP ViT-B/16 congelado y aprende únicamente prompts visuales y textuales, junto con dos escalares de fusión. En inferencia combina cuatro rutas de predicción (zero-shot y variantes con prompts) ponderadas según la entropía de las predicciones y estadísticas no etiquetadas del conjunto de evaluación. Esto implica que el método requiere acceso al conjunto de evaluación completo (o a una colección representativa) para estimar el contexto, lo que condiciona su uso en producción.

El entrenamiento se documenta en dos configuraciones. La primera (Tabla 1) entrena durante 5 épocas con 16 imágenes por clase de las 1.000 clases de ImageNet, con tres semillas. La segunda (Tabla 2) usa el protocolo base-to-new con 16 shots por clase base, 20 épocas y 11 datasets, con tres semillas; se liberan dos variantes, CAF (coeficientes de pérdida compartidos) y CAF* (coeficientes específicos por dataset). En total se publican 69 entradas de checkpoint procedentes de 66 ejecuciones de entrenamiento distintas. No se detalla en la información disponible la composición exacta del dataset más allá de ImageNet y los conjuntos de transferencia, ni si hubo RLHF/DPO (no aplica a este tipo de modelo).

## Capacidades

- Clasificación de imágenes zero-shot y con prompts aprendidos sobre CLIP ViT-B/16.
- Fusión adaptativa de rutas de predicción basada en entropía y estadísticas del conjunto de evaluación.
- Generalización de dominio: transferencia cross-dataset y cross-domain desde ImageNet a diez conjuntos de destino y cuatro variantes de ImageNet.
- Generalización base-to-new: evaluación en 11 datasets con clases base y nuevas.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso.
- No dispone de modo thinking, visión generativa, audio ni capacidades multimodales más allá del emparejamiento imagen-texto de CLIP.
- Capacidades multilingües: no documentadas; dependen del tokenizador y los prompts de CLIP.

## Casos de uso

- Clasificación de imágenes en dominios nuevos sin reentrenar el backbone: CAF permite adaptar CLIP a un conjunto de imágenes objetivo aprendiendo solo prompts y escalares de fusión, lo que reduce el coste de adaptación a unos pocos megabytes y minutos de entrenamiento.
- Investigación en generalización de dominio: sirve como baseline reproducible para comparar métodos de prompt learning sobre CLIP en los protocolos base-to-new y de transferencia cross-dataset.
- Moderación de contenido visual a pequeña escala: al requerir solo el backbone CLIP congelado y un checkpoint de 0,5 MB, puede desplegarse en entornos con recursos limitados para filtrar imágenes por categorías predefinidas.
- Etiquetado asistido de datasets de imágenes: la fusión contextual mejora la precisión en colecciones no etiquetadas, lo que resulta útil para preetiquetar grandes lotes antes de revisión humana.
- Clasificación de imágenes médicas o industriales con pocos ejemplos: el protocolo de 16 shots por clase base es aplicable a dominios con datos escasos, siempre que se disponga de una colección de evaluación representativa.
- Reproducción de experimentos académicos: los archivos de reproducibilidad (listas de muestras, orden de clases, inicializaciones de prompts y features de texto congeladas) permiten replicar las tablas del artículo de forma exacta.
- Evaluación comparativa de prompts visuales: CAF y CAF* permiten estudiar el efecto de coeficientes de pérdida compartidos frente a específicos por dataset en 11 tareas.

## Benchmarks y rendimiento

Resultados publicados en la model card (precisión en porcentaje, media ± desviación estándar sobre semillas 1, 2 y 3):

| Configuracion | Metrica | Valor |
|---|---|---|
| Tabla 1 (transferencia) | ImageNet | 72,26 ± 0,03 |
| Tabla 1 (transferencia) | Avg-10 | 69,96 ± 0,14 |
| Tabla 1 (transferencia) | Avg-4 | 61,36 ± 0,08 |
| Tabla 2 (base-to-new) | CAF Average Base | 85,78 |
| Tabla 2 (base-to-new) | CAF Average New | 79,52 |
| Tabla 2 (base-to-new) | CAF HM | 82,53 |
| Tabla 2 (base-to-new) | CAF* Average Base | 86,09 |
| Tabla 2 (base-to-new) | CAF* Average New | 79,77 |
| Tabla 2 (base-to-new) | CAF* HM | 82,81 |

No se han publicado en la información disponible resultados comparativos frente a otros métodos (por ejemplo, CoOp, CoCoOp o MaPLe) en forma de tabla; solo se ofrecen los resultados propios de CAF y CAF*.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; al usar CLIP ViT-B/16 congelado, el consumo es el del backbone (del orden de unos pocos GB en FP16) más el checkpoint de 0,5 MB.
- GPU recomendadas: cualquiera compatible con PyTorch y CLIP ViT-B/16; los scripts de reproducción usan `CUDA_VISIBLE_DEVICES`, sin especificar modelo de GPU.
- Cabe en GPU de consumo: previsiblemente sí en tarjetas con suficiente VRAM para CLIP ViT-B/16 (por ejemplo, RTX 3060 en adelante), aunque no se confirma en la información disponible.
- Opciones de despliegue: scripts de reproducción del repositorio de GitHub (`scripts/reproduce/transfer.sh` y `scripts/reproduce/base2new.sh`), con descarga de pesos vía Hugging Face CLI. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CAF (este modelo) | ~0,50 MB de prompts + CLIP ViT-B/16 congelado | Imágenes 224x224 | ImageNet 72,26; Avg-10 69,96; HM 82,53 (CAF) / 82,81 (CAF*) | Código MIT; pesos sin especificar | Hugging Face + GitHub |
| CLIP ViT-B/16 zero-shot | Backbone completo | Imágenes 224x224 | No disponible en esta ficha | Licencia de OpenAI CLIP | Público |
| CoOp / CoCoOp | Prompts aprendidos sobre CLIP | Imágenes 224x224 | No disponible en esta ficha | No disponible | Público |

No se dispone de datos comparativos directos con CoOp, CoCoOp, MaPLe u otros métodos de prompt learning en la información proporcionada; la comparativa queda limitada a la referencia cualitativa.

## Limitaciones y advertencias

- El método requiere estadísticas no etiquetadas del conjunto de evaluación completo para estimar el contexto; los resultados reportados aplican a ese protocolo de evaluación basado en colección y pueden no trasladarse a inferencia sobre instancias individuales.
- No es un modelo generativo: no sirve para texto, código, matemáticas ni tareas de agente.
- Sesgos conocidos: hereda los sesgos de CLIP ViT-B/16 y de los prompts textuales; no se documentan análisis de sesgo específicos.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de clasificaciones erróneas confiadas en dominios alejados de la distribución de entrenamiento.
- Limitaciones de idioma: los prompts y etiquetas de CLIP están en inglés por defecto; no se documenta soporte multilingüe.
- Restricciones de licencia: el código es MIT, pero la licencia de los pesos no se especifica; el uso comercial del backbone CLIP depende de la licencia de OpenAI CLIP.
- Caveat para producción: el tamaño del repositorio (0,1 GB) y la ausencia de descargas y likes sugieren un artefacto de investigación reciente, sin validación externa ni mantenimiento documentado.
- Los checkpoints están empaquetados en archivos .zip con estructura de directorios específica (`assets/` y `pretrained/` junto a `train.py`), lo que complica su integración directa en pipelines estándar.

## Enlaces

- Hugging Face: https://huggingface.co/ZhenyuanChen/CAF
- Paper: https://arxiv.org/abs/2611.11824
- Repositorio de código: https://github.com/zhenyuanchenai/CAF
- Registros de entrenamiento: https://github.com/zhenyuanchenai/CAF/tree/main/logs
- Índice de checkpoints: https://github.com/zhenyuanchenai/CAF/blob/b0167635cf51f61348856faad427f3a6fb9fda6d/results/models.csv
- Checksums: https://huggingface.co/ZhenyuanChen/CAF/resolve/main/SHA256SUMS.txt
- Instrucciones de instalación: https://github.com/zhenyuanchenai/CAF/blob/b0167635cf51f61348856faad427f3a6fb9fda6d/INSTALL.md
- Instrucciones de datasets: https://github.com/zhenyuanchenai/CAF/blob/b0167635cf51f61348856faad427f3a6fb9fda6d/DATASETS.md
- Detalles de experimentos: https://github.com/zhenyuanchenai/CAF/blob/b0167635cf51f61348856faad427f3a6fb9fda6d/docs/EXPERIMENTS.md
- Resultados de transferencia: https://github.com/zhenyuanchenai/CAF/blob/b0167635cf51f61348856faad427f3a6fb9fda6d/results/transfer_summary.csv
- Resultados base-to-new: https://github.com/zhenyuanchenai/CAF/blob/b0167635cf51f61348856faad427f3a6fb9fda6d/results/base2new_summary.csv
- Licencia del código: https://github.com/zhenyuanchenai/CAF/blob/b0167635cf51f61348856faad427f3a6fb9fda6d/LICENSE
