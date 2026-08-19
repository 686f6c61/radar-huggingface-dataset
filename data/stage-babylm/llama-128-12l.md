# stage-babylm/llama-128-12L

## Resumen

El modelo `stage-babylm/llama-128-12L` es un transformador de tipo Llama de tamaño extremadamente reducido, con 2.617.216 parámetros, desarrollado por el equipo `stage-babylm` en el contexto del proyecto BabyLM, una iniciativa de investigación centrada en el aprendizaje del lenguaje con datos limitados. Se trata de un modelo de generación de texto que, según la model card, es un fine-tuning de un modelo base no especificado sobre un dataset desconocido. Su relevancia radica en su uso como herramienta experimental para estudiar el comportamiento de arquitecturas tipo Llama en entornos de bajos recursos computacionales y datos escasos.

El modelo está disponible en Hugging Face con formato de pesos safetensors, integrado con la librería `transformers` y compatible con `text-generation-inference`. No se dispone de información sobre licencia, idiomas soportados, longitud de contexto ni detalles de arquitectura interna más allá del nombre, que sugiere una configuración de 128 dimensiones de embedding y 12 capas, aunque esto no está confirmado oficialmente. La pérdida de validación final reportada es de 1.8314 tras una sola época de entrenamiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama (según etiquetas del repositorio) |
| Parametros totales | 2.617.216 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura se clasifica como tipo Llama, según las etiquetas del repositorio, pero no se proporcionan detalles específicos sobre el número de capas, cabezas de atención, dimensiones ocultas o el mecanismo de atención empleado. El nombre del modelo sugiere una configuración de 128 unidades de embedding y 12 capas, aunque esta información no está documentada oficialmente. Al ser un modelo pequeño, es probable que use una arquitectura transformer estándar con atención causal, pero no hay confirmación.

El entrenamiento se realizó como un fine-tuning de un modelo base no especificado, sobre un dataset desconocido. Los hiperparámetros reportados en la model card incluyen: learning rate de 0.0014, tamaño de batch de 32, optimizador AdamW con betas (0.9, 0.95), scheduler de tipo `warmup_stable_decay` con 0.05 pasos de warmup, y una única época con 40.278 pasos totales. La pérdida de validación descendió de 6.9236 al inicio a 1.8314 al final. No se mencionan técnicas como RLHF, DPO ni otras innovaciones de entrenamiento.

## Capacidades

- Generación de texto: el modelo es capaz de producir texto, dado que su pipeline es `text-generation`.
- No se han documentado capacidades específicas como razonamiento, código, matemáticas, visión, tool calling, agentes o modo de pensamiento.
- No hay información sobre capacidades multilingües; los idiomas soportados no están declarados.
- Dado su tamaño reducido, es probable que su capacidad de generación sea limitada y adecuada únicamente para experimentos de investigación.

## Casos de uso

No se han documentado casos de uso específicos en la model card ni en fuentes externas. Dado su carácter experimental y su tamaño extremadamente pequeño, los posibles usos se limitan a entornos de investigación académica, como:

- Estudio del aprendizaje del lenguaje con datos limitados, en el marco del proyecto BabyLM.
- Análisis de la capacidad de generalización de arquitecturas tipo Llama en modelos de pocos parámetros.
- Comparación de estrategias de entrenamiento (fine-tuning, hiperparámetros) en modelos pequeños.
- Pruebas de infraestructura de despliegue (por ejemplo, servidores de inferencia) con modelos de bajo coste.
- Desarrollo de prototipos educativos para demostrar el funcionamiento de transformadores generativos.
- Evaluación de técnicas de cuantización o compresión en modelos mínimos.

Sin embargo, estos usos son hipotéticos y no están respaldados por documentación oficial del autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El `model-index` de la model card está vacío (`results: []`), y no se encontraron evaluaciones externas en la búsqueda web. Por tanto, no es posible comparar su rendimiento con otros modelos de forma objetiva.

## Requisitos de hardware

- VRAM estimada: con 2.617.216 parámetros, en FP32 los pesos ocupan aproximadamente 10 MB (2,6 M × 4 bytes). En FP16 serían unos 5 MB. La VRAM total necesaria para inferencia, incluyendo activaciones y overhead, sería inferior a 1 GB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; incluso se puede ejecutar en CPU sin problemas.
- Es compatible con hardware de consumo (por ejemplo, una RTX 3060 o inferior) y con sistemas sin GPU.
- Opciones de despliegue: al ser un modelo de la familia transformers, puede ejecutarse con `transformers` (pipeline de generación), `vLLM`, `llama.cpp` (si se convierte a GGUF), `Ollama` (si se empaqueta adecuadamente) o `text-generation-inference` (TGI).
- Latencia y throughput: no se han publicado datos, pero por su tamaño la generación sería extremadamente rápida, con latencias del orden de milisegundos en GPU y decenas de milisegundos en CPU.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (modelos BabyLM de tamaño similar). El proyecto BabyLM incluye otros modelos como `stage-babylm/llama-128-2L`, pero no se han publicado comparativas de rendimiento. Por tanto, no es posible establecer una comparativa objetiva.

## Limitaciones y advertencias

- Sesgos conocidos: no se ha documentado ningún análisis de sesgos; al ser un modelo entrenado sobre un dataset desconocido, podría presentar sesgos no identificados.
- Riesgo de alucinación: como todo modelo generativo, puede producir contenido incoherente o falso, especialmente dado su tamaño reducido.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no están especificados, lo que impide conocer sus límites reales.
- Restricciones de licencia: la licencia no está disponible, por lo que no se puede garantizar su uso comercial ni su redistribución.
- Caveat para producción: este modelo es claramente experimental, generado automáticamente por un `Trainer`, y no está diseñado para aplicaciones en producción. Su calidad de generación probablemente sea muy baja en comparación con modelos estándar.

## Enlaces

- [Hugging Face: stage-babylm/llama-128-12L](https://huggingface.co/stage-babylm/llama-128-12L)
- [Proyecto BabyLM](https://babylm.github.io/)
