# thunderboltc/marianmt_sanlish_to_english_1934_lr2

## Resumen

Este modelo es un ajuste fino (fine-tuning) de `Helsinki-NLP/opus-mt-mul-en`, un sistema de traducción automática basado en MarianMT, orientado a la traducción de texto en "sanlish" (una mezcla de sánscrito e inglés) al inglés. Fue desarrollado por el usuario `thunderboltc` y publicado en Hugging Face bajo licencia Apache 2.0. Con 77,06 millones de parámetros, el modelo está diseñado para la generación de texto (text2text) y se puede ejecutar con la librería Transformers.

El interés de este modelo radica en su especialización en un dominio lingüístico poco común: el "sanlish", una variante de código mezclado entre sánscrito e inglés que se encuentra en ciertos contextos académicos o culturales de la India. Sin embargo, la documentación es mínima: no se especifica el dataset de entrenamiento ni se proporcionan detalles sobre el ámbito de aplicación. El ajuste se realizó sobre el modelo multilingüe a inglés de Helsinki-NLP, con 25 épocas y una tasa de aprendizaje de 2e-5, alcanzando un BLEU de 27,78 en el conjunto de validación.

Aunque el modelo tiene potencial para tareas de traducción específicas, la falta de transparencia sobre los datos de entrenamiento y las condiciones de uso limitan su aplicabilidad directa en entornos de producción. No hay evidencia de validación externa más allá de las métricas reportadas por el propio autor.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MarianMT (transformer encoder-decoder) |
| Parametros totales | 77.058.732 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (MarianMT suele usar 512 tokens) |
| Tipos de cuantizacion | no disponible (solo safetensors en fp32) |
| Idiomas soportados | no disponible (el nombre del modelo sugiere sanlish-inglés, pero no se documenta) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en MarianMT, un framework de traducción automática neuronal desarrollado por el equipo de Microsoft Translator, que implementa una arquitectura transformer estándar con codificador y decodificador. El modelo base `Helsinki-NLP/opus-mt-en-` es un modelo multilingüe que traduce de múltiples idiomas al inglés; este fine-tuning lo adapta específicamente para el par "sanlish" a inglés, aunque no se ha publicado el dataset utilizado (la model card indica "None dataset").

El entrenamiento se realizó con los siguientes hiperparámetros: tasa de aprendizaje de 2e-05, batch size de 8, 25 épocas, optimizador AdamW (con betas 0.9 y 0.999, epsilon 1e-08), scheduler lineal y entrenamiento con precisión mixta (Native AMP). La pérdida de validación comenzó en 3.18 y descendió hasta un mínimo de 2.79 en la época 4, para luego estabilizarse en torno a 3.27 al final del entrenamiento. Las métricas BLEU y Chrf alcanzaron su punto máximo en la época 2 (BLEU 33.52) y luego fluctuaron, terminando en 27.78 y 43.89 respectivamente. Esto sugiere un posible sobreajuste a partir de la época 4, ya que la pérdida de validación dejó de mejorar.

## Capacidades

- Traducción automática de texto: el modelo está diseñado para convertir texto en "sanlish" a inglés, aprovechando el conocimiento del modelo base multilingüe.
- Generación de texto: como modelo text2text, puede generar texto en inglés a partir de una entrada en otra lengua.
- Soporte de tool calling: no disponible (no se documenta).
- Soporte de agentes: no disponible.
- Capacidades multilingües: el modelo base es multilingüe, pero el fine-tuning apunta a un idioma específico no documentado; no se puede confirmar el soporte de otras lenguas.
- Capacidades especiales: no se reportan modos de razonamiento, visión ni audio.

## Casos de uso

- **Traducción de documentos históricos o religiosos**: si el "sanlish" se usa en contextos de textos sánscritos con anotaciones en inglés, el modelo podría ayudar a normalizar estos textos al inglés. Sin embargo, la falta de datos de entrenamiento y validación hace que su uso sea arriesgado.
- **Integración en pipelines de traducción**: puede utilizarse como un componente dentro de un sistema de traducción más amplio, siempre que se valide su calidad con datos reales.
- **Investigación lingüística**: para estudiar la mezcla de códigos sánscrito-inglés, el modelo puede ser útil para generar traducciones de referencia, aunque su precisión es incierta.
- **Prototipos de aplicaciones**: como modelo pequeño (77M parámetros), es fácil de ejecutar en entornos con recursos limitados, por lo que puede servir para prototipos de traducción en tiempo real.
- **Normalización de texto**: puede utilizarse para convertir textos mixtos en inglés estándar, lo que facilitaría el procesamiento posterior.
- **Benchmark de sistemas de traducción**: se puede usar como un sistema de referencia para comparar con otros modelos de traducción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (como MMLU, HumanEval, etc.) en la información disponible. El autor solo reporta métricas de evaluación interna durante el entrenamiento:

| Métrica | Valor |
|---|---|
| Pérdida (validation loss) | 3.2683 |
| BLEU | 27.7762 |
| Chrf | 43.8892 |

Estos resultados corresponden a la época final del entrenamiento, no a una evaluación independiente. La tabla de entrenamiento muestra una variabilidad considerable en BLEU (entre 15.62 y 33.52), lo que indica inestabilidad en el aprendizaje.

## Requisitos de hardware

- **VRAM estimada**: con 77M parámetros, en fp32 se requieren aproximadamente 308 MB de memoria, y en fp16 unos 154 MB. Esto permite ejecutar el modelo en GPUs con menos de 1 GB de VRAM.
- **GPU recomendadas**: cualquier GPU con al menos 1 GB de VRAM, como una NVIDIA GTX 1050 o superior. Incluso se puede ejecutar en CPU para inferencias de baja latencia.
- **Compatibilidad con consumer GPU**: sí, cabe en cualquier GPU de consumo moderno.
- **Opciones de despliegue**: se puede usar con la librería `transformers` en Python, exportar a ONNX para inferencia optimizada, o usar herramientas como `vLLM` (aunque es más adecuado para modelos grandes) o `TGI`. También se puede usar con `llama.cpp` si se convierte a formato GGUF, aunque no se proporciona.
- **Latencia y throughput**: no se conocen datos específicos, pero dado el tamaño del modelo, se espera una latencia inferior a 100 ms en GPU y de varios cientos de ms en CPU para frases cortas.

## Comparativa con modelos similares

| Modelo | Parametros | Longitud de contexto | Licencia | Rendimiento |
|---|---|---|---|---|
| `thunderboltc/marianmt_sanlish_to_english_1934_lr2` | 77M | no disponible | Apache 2.0 | BLEU 27.78 (validación interna) |
| `Helsinki-NLP/opus-mt-mul-en` (base) | 77M | 512 (típico) | Apache 2.0 | No se documenta BLEU específico |
| `Helsinki-NLP/opus-mt-en-es` (traducción inglés-español) | 77M | 512 (típico) | Apache 2.0 | BLEU ~30 en WMT (no oficial) |

La comparación directa no es posible porque no hay datos de benchmarks estándar. El modelo base `opus-mt-mul-en` tiene la misma arquitectura y parámetros, pero sin el fine-tuning específico. Otros modelos MarianMT de Helsinki-NLP suelen reportar BLEU en torno a 25-35 en pares de idiomas con datos de entrenamiento de OPUS, pero no hay datos comparables para el par "sanlish".

## Limitaciones y advertencias

- **Sobreajuste probable**: la pérdida de validación deja de mejorar a partir de la época 4, mientras que la pérdida de entrenamiento sigue bajando hasta 0.07, lo que indica que el modelo ha memorizado el conjunto de entrenamiento y puede generalizar mal.
- **Dataset desconocido**: no se ha publicado el dataset de entrenamiento, por lo que no se puede evaluar el sesgo o la cobertura de vocabulario.
- **Idioma "sanlish" no estandarizado**: el término "sanlish" no es un idioma oficial; su definición es ambigua y puede variar entre usuarios, lo que compromete la utilidad práctica.
- **Riesgo de alucinaciones**: como todo modelo de traducción, puede generar salidas inventadas cuando la entrada no es válida o está fuera de dominio.
- **Restricciones de licencia**: la licencia Apache 2.0 permite uso comercial, pero no hay garantías de calidad o soporte.
- **Tamaño del repositorio**: el repo ocupa 23.1 GB, lo que es excesivo para un modelo de 77M parámetros; puede incluir archivos de entrenamiento o checkpoints intermedios, lo que dificulta la descarga en entornos con poco ancho de banda.
- **Model card incompleta**: la documentación es generada automáticamente y carece de información sobre uso previsto, limitaciones y ejemplos de uso.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/thunderboltc/marianmt_sanlish_to_english_1934_lr2)
- [Modelo base Helsinki-NLP/opus-mt-mul-en](https://huggingface.co/Helsinki-NLP/opus-mt-mul-en)
- [Documentación de MarianMT en Transformers](https://huggingface.co/transformers/v4.3.0/model_doc/marian.html)
- [Página oficial de Marian NMT](https://marian-nmt.github.io/)
