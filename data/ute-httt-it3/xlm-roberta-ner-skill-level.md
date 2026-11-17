# ute-httt-it3/xlm-roberta-ner-skill-level

## Resumen

El modelo `xlm-roberta-ner-skill-level`, publicado por el usuario `ute-httt-it3` en Hugging Face, es un ajuste fino de XLM-RoBERTa orientado a la extracción de entidades nombradas (NER) con etiquetado de nivel de habilidad. Por su identificador y su arquitectura base, está pensado para anotar menciones textuales y clasificarlas según un nivel de competencia o cualificación, un tipo de tarea habitual en sistemas de matching curricular, análisis de ofertas de empleo y extracción de perfiles profesionales.

El modelo cuenta con 277.456.901 parámetros (dato extraído de los pesos en safetensors), lo que lo sitúa en la escala de XLM-RoBERTa-base/large según la configuración exacta, y se distribuye bajo licencia MIT, lo que permite uso comercial sin restricciones adicionales más allá de la atribución habitual. El repositorio ocupa 1,1 GB y contiene únicamente pesos en formato safetensors.

La información publicada es muy escasa: la model card se limita a la declaración de licencia, sin pipeline declarado, sin idiomas especificados y sin datos de entrenamiento, evaluación o uso previsto. Esta ficha se limita por tanto a lo verificable y marca explícitamente como no disponible todo aquello que el autor no ha documentado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa (transformer encoder, según el identificador y los tags del repositorio) |
| Parámetros totales | 277.456.901 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en safetensors; admite cuantización a FP16/BF16/INT8 vía herramientas estándar, no documentada por el autor) |
| Idiomas soportados | no disponible (XLM-RoBERTa es multilingüe por diseño, pero el autor no declara idiomas) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en XLM-RoBERTa, un transformer encoder de tipo RoBERTa entrenado de forma multilingüe sobre corpus masivos en un centenar de idiomas. La cabeza de salida corresponde a una tarea de NER con clasificación de nivel de habilidad, es decir, token classification con etiquetas que combinan tipo de entidad y nivel asociado. El número de parámetros (277,5 M) es coherente con una variante de tamaño grande de la familia XLM-RoBERTa.

No se dispone de información sobre el conjunto de datos de ajuste fino, el número de tokens de entrenamiento, la composición del corpus, el esquema exacto de etiquetas ni si se aplicaron técnicas de regularización, aumento de datos o validación cruzada. Tampoco se documenta si el ajuste se realizó sobre pesos preentrenados oficiales de XLM-RoBERTa o sobre una variante derivada. Toda esta información debe considerarse no disponible.

## Capacidades

- Extracción de entidades nombradas (NER) sobre texto, con etiquetas orientadas a nivel de habilidad según el identificador del modelo.
- Clasificación a nivel de token, adecuada para tareas de etiquetado secuencial.
- Potencial multilingüismo heredado de XLM-RoBERTa, aunque no confirmado por el autor.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso.
- No se documenta modo thinking, visión, audio ni generación de texto libre.
- No se documenta capacidad de agentes ni de razonamiento encadenado.

## Casos de uso

- Extracción de habilidades en currículos: el modelo puede procesar el texto de un CV y etiquetar menciones de competencias junto con su nivel declarado, facilitando la estructuración de perfiles para sistemas de selección.
- Análisis de ofertas de empleo: permite identificar requisitos de cualificación y su nivel exigido en descripciones de puesto, alimentando motores de matching entre candidatos y vacantes.
- Normalización de catálogos de competencias: se puede usar para mapear menciones libres de habilidades a un esquema interno de niveles, reduciendo la variabilidad en bases de datos de RR. HH.
- Enriquecimiento de plataformas de formación: extracción de niveles de competencia en descripciones de cursos para recomendar itinerarios formativos.
- Procesamiento de documentación técnica o académica: identificación de niveles de habilidad en informes, certificaciones o expedientes, útil para auditorías de cualificación.
- Preprocesado para pipelines de analítica de talento: etiquetado previo de grandes volúmenes de texto antes de agregaciones y dashboards, aprovechando su naturaleza encoder de bajo coste frente a modelos generativos.
- Moderación o validación de perfiles: detección de menciones de nivel de habilidad para verificar coherencia en formularios y perfiles autodeclarados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: en torno a 1,1 GB solo para pesos, más memoria de activaciones y del tokenizador; en la práctica, 2-3 GB son suficientes para lotes pequeños.
- VRAM estimada en FP16/BF16: aproximadamente 0,6 GB para pesos, con margen adicional para activaciones.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; una RTX 3060, RTX 4060 o superior es suficiente para inferencia interactiva.
- Cabe en GPU de consumo: sí, en modelos como RTX 3050, RTX 3060, RTX 4060, RTX 4070 y equivalentes.
- Opciones de despliegue: `transformers` con PyTorch, ONNX Runtime, Hugging Face Inference Endpoints y `text-classification`/`token-classification` pipelines; también es posible exportarlo a ONNX para servir con Triton o similar.
- Latencia y throughput: no disponibles; al ser un encoder de 277 M de parámetros, la latencia por secuencia corta debería ser de decenas de milisegundos en GPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| xlm-roberta-ner-skill-level (este modelo) | 277,5 M | no disponible | NER con nivel de habilidad | MIT | Hugging Face |
| xlm-roberta-base | ~278 M | 512 tokens | Representaciones multilingües | MIT | Hugging Face |
| xlm-roberta-large | ~560 M | 512 tokens | Representaciones multilingües | MIT | Hugging Face |
| BERT-base multilingüe | ~178 M | 512 tokens | Representaciones multilingües | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo para este ajuste concreto, por lo que la comparativa se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- La model card no documenta datos de entrenamiento, esquema de etiquetas ni evaluación, lo que impide conocer su calidad real y su dominio de aplicación.
- Riesgo de alucinación y de etiquetado incorrecto en entidades ambiguas o en textos fuera del dominio de ajuste.
- Al ser un modelo de clasificación de tokens, no genera texto libre; no debe usarse como modelo conversacional.
- El multilingüismo no está confirmado por el autor, aunque la arquitectura base lo permita; conviene validar en los idiomas de interés antes de producción.
- Licencia MIT: permite uso comercial, modificación y redistribución, pero no exime de validar sesgos y exactitud en el contexto de uso.
- No hay información sobre sesgos demográficos, de género o culturales en las etiquetas de nivel de habilidad, lo que es especialmente sensible en RR. HH.
- El repositorio tiene pocas descargas y ningún "like", por lo que no hay evidencia de uso comunitario ni de mantenimiento.
- La fecha de creación indicada (2026-11-11) resulta anómala y no se ha podido contrastar; conviene verificar la procedencia del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ute-httt-it3/xlm-roberta-ner-skill-level
