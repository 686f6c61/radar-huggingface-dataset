# SOTAagi2030/GalleryScript-LangID

## Resumen

GalleryScript-LangID es un modelo de clasificación de texto desarrollado por SOTAagi2030 para identificar el script o idioma de un texto de entrada. Según la model card, el modelo soporta tres scripts: árabe, latino y devanagari, y ha sido optimizado para lograr una cobertura de script de 0.962 con una tasa de falsos positivos de 0.018. El modelo se distribuye en formato ONNX, lo que facilita su integración en entornos de producción con el runtime de ONNX.

El modelo resuelve el problema de la detección automática de idioma/script en texto, una tarea habitual en pipelines de procesamiento de lenguaje natural (PLN) para enrutamiento, preprocesamiento o análisis multilingüe. Su relevancia radica en su ligereza y en la posibilidad de desplegarlo en entornos con recursos limitados, aunque la información pública disponible es escasa y no se especifican detalles sobre su arquitectura interna, tamaño o datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | arabe, latin, devanagari (scripts) |
| Licencia | no disponible |
| Formato de pesos | ONNX (onnxruntime) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo (si es un transformer, un modelo basado en n-gramas u otro enfoque) ni sobre los datos de entrenamiento utilizados. La model card únicamente indica que se seleccionó un export denominado `atlas_2025_01` que cumplía los criterios de elegibilidad: cobertura de script mayor o igual a 0.950 y tasa de falsos positivos menor o igual a 0.020. El export elegido obtuvo una cobertura de 0.962, una tasa de falsos positivos de 0.018 y un recall macro de 0.941. No se mencionan técnicas como RLHF, DPO u otras innovaciones.

## Capacidades

- Clasificación de texto para identificar el script o idioma entre tres opciones: árabe, latino y devanagari.
- Adecuado para tareas de detección de idioma en texto corto o largo, aunque no se especifica la longitud máxima de entrada.
- Al ser un modelo ONNX, puede ejecutarse en una amplia variedad de plataformas, incluyendo CPU, GPU y dispositivos edge.
- No se indican capacidades adicionales como generación de texto, tool calling, razonamiento multi-paso o soporte de agentes.

## Casos de uso

- Enrutamiento de consultas en sistemas multilingües: el modelo puede clasificar el idioma de una consulta de usuario y dirigirla al pipeline de procesamiento adecuado (por ejemplo, un chatbot que atiende en árabe, español o hindi).
- Preprocesamiento de datos para PLN: antes de aplicar modelos de análisis de sentimiento o traducción, se puede usar para filtrar o etiquetar documentos según su script, facilitando la organización de corpus multilingües.
- Detección de idioma en redes sociales: análisis de publicaciones o comentarios para segmentar audiencias por idioma, útil para campañas de marketing o moderación de contenido.
- Normalización de texto en sistemas de transcripción: identificar el script de un texto transcrito automáticamente para aplicar correctores ortográficos o reglas de normalización específicas del idioma.
- Clasificación de documentos en bibliotecas digitales: etiquetar automáticamente documentos históricos o digitalizados según su script (árabe, latino o devanagari) para facilitar su búsqueda y archivado.
- Integración en pipelines de extracción de información: como paso previo a la extracción de entidades o relaciones, el modelo puede determinar el idioma del texto y seleccionar el modelo NER adecuado.

## Benchmarks y rendimiento

La model card proporciona las siguientes métricas para el export seleccionado:

| Metrica | Valor |
|---|---|
| Cobertura de script | 0.962 |
| Tasa de falsos positivos | 0.018 |
| Recall macro | 0.941 |

No se han publicado resultados comparativos con otros modelos de identificación de idioma en la información disponible.

## Requisitos de hardware

- Al ser un modelo de clasificación de texto en formato ONNX y con un tamaño de repositorio de 0.0 GB, se presume que es un modelo ligero que puede ejecutarse en CPU sin necesidad de GPU.
- No se dispone de datos concretos sobre VRAM, latencia o throughput. Se recomienda probar en el entorno objetivo, pero es probable que sea adecuado para despliegue en servidores de baja capacidad o dispositivos edge.
- Opciones de despliegue: onnxruntime, que permite integración con Python, C#, Java y otros lenguajes, así como exportación a otros formatos si fuera necesario.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Se recomienda consultar benchmarks públicos de detección de idioma (por ejemplo, modelos como fastText o langdetect) para establecer comparaciones, pero no se incluyen aquí por falta de datos.

## Limitaciones y advertencias

- El modelo solo soporta tres scripts (árabe, latino y devanagari), por lo que no es adecuado para textos en otros sistemas de escritura (cirílico, chino, etc.).
- La licencia no está especificada, lo que genera incertidumbre sobre el uso comercial. Se recomienda contactar con el autor antes de utilizarlo en producción.
- No se han publicado detalles sobre posibles sesgos en los datos de entrenamiento ni sobre el comportamiento ante textos ambiguos o multilingües.
- La información técnica es muy limitada: se desconoce la arquitectura, el número de parámetros y el proceso de entrenamiento, lo que dificulta evaluar su robustez y generalización.
- Al ser un modelo reciente (creado en septiembre de 2026) y con cero descargas, no hay evidencia de su rendimiento en entornos reales más allá de las métricas reportadas por el autor.

## Enlaces

- [HuggingFace: SOTAagi2030/GalleryScript-LangID](https://huggingface.co/SOTAagi2030/GalleryScript-LangID)
