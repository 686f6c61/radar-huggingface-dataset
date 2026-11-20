# yonons/lab-caption-lite

## Resumen

`yonons/lab-caption-lite` es un modelo de clasificación derivado de `roberta-base` (arquitectura transformer encoder-only, 125 millones de parámetros) publicado por el usuario `yonons` en Hugging Face. Según la model card, se ha entrenado sobre un conjunto de datos denominado `product-photos` durante 9 épocas con un learning rate de 1e-5 y un batch size de 64. El modelo está orientado a una tarea de clasificación o etiquetado sobre imágenes de producto, si bien la model card no explicita el número exacto de clases ni el formato de entrada.

La relevancia de esta ficha es limitada: se trata de un modelo de nicho, sin descargas ni interacciones registradas en el momento de la consulta, y con información pública muy escasa. La model card aporta métricas de evaluación sobre un conjunto denominado `held-out-2025` (macro-F1 de 0,821 y precisión de 0,892), lo que sugiere un rendimiento razonable en la tarea concreta para la que fue entrenado, pero no permite extrapolar capacidades generales.

El uso previsto declarado por los autores es la asistencia a revisores humanos, con la decisión final delegada siempre en una persona. No se dispone de información sobre licencia, idiomas soportados, formato de pesos ni pipeline de Hugging Face, lo que limita seriamente su evaluación para uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (derivado de `roberta-base`) |
| Parametros totales | 125 millones (aproximado, heredado de `roberta-base`; no confirmado en la model card) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (la de `roberta-base` es 512 tokens, no confirmado para este modelo) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Solo inglés (declarado en la model card) |
| Licencia | No disponible |
| Formato de pesos | No disponible |

## Arquitectura y entrenamiento

El modelo parte de `roberta-base`, un transformer encoder-only con 12 capas, 768 dimensiones ocultas y 12 cabezas de atención, preentrenado con objetivos de masked language modeling. Sobre esta base, el autor ha realizado un ajuste fino supervisado para una tarea de clasificación o etiquetado cuyo objetivo exacto no se detalla en la model card. El conjunto de entrenamiento se denomina `product-photos`, lo que sugiere datos de imágenes de productos, aunque no se especifica el volumen, la composición ni el número de clases.

Los hiperparámetros declarados son 9 épocas, learning rate de 1e-5 y batch size de 64. No se menciona el uso de RLHF, DPO ni ninguna técnica de alineación adicional, lo cual es coherente con un modelo discriminativo de clasificación. El changelog indica tres hitos: lanzamiento inicial el 24 de enero de 2025, reentrenamiento sobre datos limpiados el 26 de marzo de 2025 y corrección de la configuración del tokenizador el 17 de agosto de 2025. No se documentan innovaciones técnicas destacables (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Clasificación o etiquetado de entradas relacionadas con fotografías de producto, según el conjunto de entrenamiento `product-photos`. La naturaleza exacta de las etiquetas no está documentada.
- Asistencia a revisores humanos: el uso previsto declarado es apoyar la revisión, no sustituirla.
- Procesamiento de texto en inglés exclusivamente (declarado en la model card).
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento.
- No se documentan capacidades multilingües más allá del inglés.
- No se documenta generación de texto libre; por su arquitectura encoder-only, no es un modelo generativo.

## Casos de uso

- Moderación o triaje de catálogos de producto: el modelo puede clasificar imágenes o descripciones de productos y priorizar aquellos casos que requieran revisión humana, dado su uso previsto declarado de asistencia a revisores.
- Preetiquetado en pipelines de anotación: con una precisión de 0,892 en el conjunto `held-out-2025`, puede generar etiquetas preliminares que los anotadores corrijan, reduciendo el coste de anotación manual.
- Filtrado de contenido en inglés: al estar entrenado solo en inglés, es adecuado para flujos de trabajo en ese idioma, descartando su uso en otros idiomas.
- Control de calidad en publicaciones de e-commerce: puede señalizar productos con etiquetas inconsistentes o de baja confianza para revisión antes de su publicación.
- Experimentación académica o interna: al ser un ajuste fino de `roberta-base`, sirve como línea base reproducible para tareas de clasificación sobre datos de producto.
- Detección de casos dudosos: combinado con un umbral de confianza, permite derivar a revisión humana los ejemplos con menor seguridad, alineándose con el uso previsto de asistencia y no automatización total.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el conjunto `held-out-2025`:

| Metrica | Valor |
|---|---|
| macro-F1 | 0,821 |
| precision | 0,892 |

No se han publicado resultados comparativos con otros modelos ni métricas adicionales (recall, exactitud, AUC) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para un modelo de 125 millones de parámetros (aproximadamente 500 MB de pesos); no confirmado por el autor.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) es suficiente; también es viable en CPU para volúmenes moderados.
- Cabe en GPU consumer: sí, con margen amplio, dado el tamaño reducido del modelo.
- Opciones de despliegue: al no especificarse el formato de pesos, no se puede confirmar compatibilidad con vLLM, llama.cpp, Ollama o TGI. Si los pesos están en safetensors/PyTorch, sería desplegable con Hugging Face Transformers y ONNX Runtime.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `yonons/lab-caption-lite` | ~125 M (heredado de `roberta-base`) | No disponible | No disponible | Hugging Face, sin descargas |
| `roberta-base` | 125 M | 512 tokens | MIT | Hugging Face, ampliamente usado |
| `distilbert-base-uncased` | 66 M | 512 tokens | Apache 2.0 | Hugging Face, ampliamente usado |
| `bert-base-uncased` | 110 M | 512 tokens | Apache 2.0 | Hugging Face, ampliamente usado |

La comparación se limita a la arquitectura base, ya que no se dispone de métricas del modelo en tareas estándar ni de información sobre licencia que permita una comparación rigurosa.

## Limitaciones y advertencias

- Entrenado exclusivamente con datos en inglés; no se garantiza su comportamiento en otros idiomas.
- La model card no especifica la licencia, lo que impide confirmar si el uso comercial está permitido.
- No se documenta el número de clases, el formato de entrada ni el pipeline de Hugging Face, lo que dificulta su integración directa.
- Riesgo de alucinación no aplicable en sentido estricto (modelo discriminativo), pero sí riesgo de clasificaciones erróneas en dominios distintos al de `product-photos`.
- El modelo no debe usarse como decisor autónomo: el uso previsto declara explícitamente que la decisión final recae en un humano.
- Sin descargas ni validación externa registrada, no hay evidencia independiente de su robustez fuera del conjunto `held-out-2025`.
- El changelog menciona una corrección del tokenizador en agosto de 2025; conviene verificar que la versión descargada corresponde a la revisión posterior a esa corrección.
- No se dispone de información sobre sesgos demográficos, de género o culturales en los datos de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yonons/lab-caption-lite
- Modelo base: https://huggingface.co/roberta-base
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información disponible.
