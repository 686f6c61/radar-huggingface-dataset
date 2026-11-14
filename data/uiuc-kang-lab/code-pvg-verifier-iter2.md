# uiuc-kang-lab/code-pvg-verifier-iter2

## Resumen

`code-pvg-verifier-iter2` es un adaptador LoRA entrenado sobre el modelo base `Qwen/Qwen3.5-35B-A3B-Base`, publicado por el grupo de investigación uiuc-kang-lab (Universidad de Illinois Urbana-Champaign, laboratorio Kang). El adaptador está orientado a tareas de verificación en el ámbito del código, según indican las etiquetas `pvg` y `code` de la model card, y corresponde al checkpoint seleccionado en el paso de entrenamiento 340 de un proceso iterativo (iteración 2).

El artefacto no es un modelo autónomo: requiere descargar y cargar por separado el modelo base Qwen3.5-35B-A3B-Base, que según su nomenclatura es un modelo Mixture-of-Experts con 35 000 millones de parámetros totales y aproximadamente 3 000 millones de parámetros activos por token. El repositorio ocupa 2,2 GB y contiene únicamente los pesos del adaptador (sampler weights); no incluye estado del optimizador ni estado de entrenamiento, lo que lo hace apto para inferencia pero no para reanudar el entrenamiento tal cual.

La relevancia de esta ficha es limitada pero concreta: se trata de un adaptador de investigación con cero descargas y cero likes en el momento de la consulta, sin model card detallada, sin licencia declarada y sin resultados de benchmarks publicados. Resulta útil como referencia para quienes sigan la línea de trabajo de verificación de código del laboratorio o quieran reproducir el pipeline PVG sobre Qwen3.5, pero no debe considerarse un modelo listo para producción sin una evaluación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre transformer MoE Qwen3.5-35B-A3B-Base |
| Parametros totales | No disponible para el adaptador; el modelo base declara 35B en su nomenclatura |
| Parametros activos | No disponible para el adaptador; el modelo base declara ~3B activos (A3B) |
| Longitud de contexto | No disponible (heredada del modelo base, no declarada en la model card) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del base) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador LoRA); requiere el modelo base por separado |

## Arquitectura y entrenamiento

El adaptador se entrena mediante LoRA sobre `Qwen/Qwen3.5-35B-A3B-Base`, un transformer con arquitectura Mixture-of-Experts. El repositorio contiene exclusivamente los pesos del adaptador en formato safetensors, junto con un fichero `checkpoint.json` que registra el checkpoint de origen y los checksums SHA-256. No se incluye el estado del optimizador ni el estado completo de entrenamiento, por lo que el adaptador es de solo inferencia o de ajuste posterior, no reanudable.

La model card indica que se trata del checkpoint seleccionado en el paso 340 de entrenamiento, dentro de un proceso iterativo (iteración 2) etiquetado como `pvg` y `code`. No se especifican en la información disponible el volumen de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas concretas (decodificación especulativa, atención lineal, etc.). Tampoco se detalla el rango LoRA, el alpha ni qué módulos se adaptaron. Cualquier afirmación sobre estos puntos sería especulativa y no se incluye.

## Capacidades

- Verificación de código: el adaptador está etiquetado como `verifier` y `code`, lo que sugiere su uso para puntuar o validar soluciones de código generadas por otro modelo (patrón generador-verificador).
- Integración con Qwen3.5-35B-A3B-Base: hereda las capacidades del modelo base, incluyendo generación de texto y razonamiento, aunque el adaptador está especializado y puede degradar el rendimiento general fuera de su dominio.
- Tool calling / function calling: no disponible de forma explícita en la información proporcionada; depende del modelo base.
- Agentes y razonamiento multi-paso: no declarado en la model card.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (thinking mode, visión, audio): no declaradas.

## Casos de uso

- Verificación de soluciones en pipelines de generación de código: el adaptador puede emplearse como segundo modelo que puntúa o filtra las salidas de un generador (por ejemplo, un modelo de código más pequeño) antes de ejecutar tests, reduciendo el coste de validación en CI/CD.
- Reranking de candidatos en búsqueda de programas: dado un conjunto de soluciones candidatas a un problema, el verificador asigna una puntuación que permite ordenarlas y seleccionar la más probable.
- Investigación en aprendizaje por verificación (PVG): reproduce o extiende el pipeline del laboratorio para estudiar cómo un verificador LoRA sobre un MoE grande mejora la selección de soluciones.
- Evaluación de calidad de parches generados: en un flujo de revisión automática, el verificador puede priorizar parches que requieren revisión humana frente a los que se aceptan automáticamente.
- Filtrado de datos sintéticos de código: usar el verificador para descartar muestras de baja calidad antes de incorporarlas a un dataset de entrenamiento.
- Baseline en experimentos académicos: como punto de comparación frente a verificadores entrenados desde cero o con otras arquitecturas, dado que reutiliza un base MoE de 35B con un adaptador de bajo rango.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: depende del modelo base Qwen3.5-35B-A3B-Base, no del adaptador (2,2 GB en safetensors). Un MoE de 35B totales con ~3B activos requiere cargar todos los expertos en memoria; en FP16/BF16 se estiman del orden de 70 GB, y en cuantización de 4 bits del orden de 18-20 GB, aunque estas cifras son estimaciones y no están confirmadas en la información proporcionada.
- GPU recomendadas: para BF16, A100 80 GB, H100 80 GB o múltiples GPU con suficiente memoria agregada; para cuantización 4/8 bits, una RTX 4090 (24 GB) o A6000 (48 GB) podrían ser suficientes, sujeto a verificación empírica.
- ¿Cabe en consumer GPU? Probablemente en cuantización de 4 bits en GPUs de 24 GB, pero no está confirmado; el adaptador por sí solo no es ejecutable sin el base.
- Opciones de despliegue: el adaptador es compatible con frameworks que soportan LoRA sobre transformers (PEFT, vLLM con `--enable-lora`, TGI con adaptadores). No se ha validado en llama.cpp/Ollama en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| code-pvg-verifier-iter2 (este) | Adaptador LoRA sobre base 35B-A3B | No disponible | No disponible | Hugging Face (0 descargas) | Verificador de código de investigación, sin benchmarks |
| Qwen/Qwen3.5-35B-A3B-Base | 35B totales / ~3B activos | No disponible | No disponible | Hugging Face | Modelo base; el adaptador lo requiere |
| Verificadores de código abiertos (p. ej. family de reward models) | Variable | Variable | Variable | Hugging Face | No se dispone de datos concretos en la información proporcionada |

No se dispone de información suficiente para establecer una comparativa cuantitativa con alternativas concretas; los datos de la tabla para modelos distintos del presente son orientativos y no verificados en esta consulta.

## Limitaciones y advertencias

- Ausencia de licencia declarada: no se puede asumir uso comercial permitido; es imprescindible contactar con el autor o consultar el repositorio del laboratorio antes de cualquier uso en producción.
- Model card mínima: no se documentan datos de entrenamiento, hiperparámetros LoRA, composición del dataset ni proceso de selección del checkpoint, lo que dificulta la reproducibilidad.
- Sin benchmarks: no hay evidencia publicada de su rendimiento en verificación de código, por lo que cualquier evaluación debe hacerse de forma independiente.
- Dependencia del modelo base: el adaptador no funciona de forma autónoma; requiere Qwen3.5-35B-A3B-Base, con los requisitos de hardware y la licencia que este imponga.
- Riesgo de alucinación: inherente a los modelos generativos; un verificador puede puntuar incorrectamente soluciones válidas o inválidas, especialmente fuera de la distribución de entrenamiento.
- Sesgos: no documentados; al entrenarse sobre un base no especificado, puede heredar sesgos del corpus de código y del modelo base.
- Especialización estrecha: el adaptador está orientado a verificación de código; su uso como modelo general puede degradar el rendimiento respecto al base.
- Estado de investigación: cero descargas y cero likes en el momento de la consulta; no hay evidencia de uso en producción ni de mantenimiento continuo.
- Fecha de creación futura (2026-11-14): conviene verificar la integridad y procedencia del repositorio antes de confiar en él.

## Enlaces

- Hugging Face: https://huggingface.co/uiuc-kang-lab/code-pvg-verifier-iter2
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-35B-A3B-Base
- Organización en Hugging Face: https://huggingface.co/uiuc-kang-lab
- Fichero de checkpoint y checksums: `checkpoint.json` dentro del repositorio (no se dispone de URL directa verificada)
