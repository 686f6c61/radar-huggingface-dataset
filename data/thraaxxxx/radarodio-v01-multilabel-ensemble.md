# Thraaxxxx/radarodio-v01-multilabel-ensemble

## Resumen

Radar Ódio v0.1 es un artefacto de clasificación multietiqueta de tipos de odio en portugués, publicado por el usuario Thraaxxxx en HuggingFace. Se trata de un ensemble de cinco clasificadores BERT entrenados con semillas distintas (13, 42, 97, 123 y 2026) sobre el backbone `pablocosta/bertabaporu-base-uncased`, cuyas salidas logit se promedian aritméticamente y se activan con sigmoid para producir probabilidades por etiqueta. El modelo no detecta si un texto es odioso o no: asume que el texto ya ha sido marcado como tal y devuelve la lista de tipos de odio presentes entre diez categorías (`ageism`, `aporophobia`, `body_shame`, `capacitism`, `lgbtphobia`, `political`, `racism`, `religious_intolerance`, `sexism`, `xenophobia`).

El repositorio se presenta explícitamente como un artefacto de producción congelado ("frozen production artifact"), con condiciones experimentales fijadas (condición `unweighted`, hiperparámetros `hp_08`) y diez umbrales por etiqueta almacenados en `config.json`, de modo que la aplicación cliente no necesita conocerlos ni gestionarlos. Incluye un método `classify` propio que requiere `trust_remote_code=True` y devuelve un JSON con las etiquetas activadas, las puntuaciones de las diez categorías, el número de tokens de contenido originales y un indicador de truncado. Su uso previsto es jerárquico: primero un modelo binario `hate` / `nao_hate` y, solo si el resultado es `hate`, este ensemble multietiqueta.

El tamaño total declarado en safetensors es de 676.020.530 parámetros, coherente con la suma de los cinco miembros del ensemble (aproximadamente 135 M por miembro, valor derivado aritméticamente, no declarado por el autor), lo que implica que el repositorio empaqueta los cinco modelos juntos en lugar de un único clasificador. El modelo está publicado bajo licencia MIT, es monolingüe en portugués y en el momento de redactar esta ficha no registra descargas ni "likes", por lo que se trata de una publicación muy reciente y sin validación externa conocida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (encoder transformer) sobre `pablocosta/bertabaporu-base-uncased`, ensemble de 5 semillas |
| Parametros totales | 676.020.530 (suma de los cinco miembros del ensemble; aproximadamente 135 M por miembro, valor derivado) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No declarada explícitamente; la truncación aplicada es "Policy B": 255 primeros + 255 últimos tokens de contenido |
| Tipos de cuantizacion | No disponible (el repositorio solo publica pesos safetensors en precisión completa) |
| Idiomas soportados | Portugués (pt) |
| Licencia | MIT |
| Formato de pesos | safetensors (`transformers`, con `custom_code` para el método `classify`) |

Datos adicionales declarados por el autor: etiquetas en el orden `ageism`, `aporophobia`, `body_shame`, `capacitism`, `lgbtphobia`, `political`, `racism`, `religious_intolerance`, `sexism`, `xenophobia`; tokens especiales `['<URL>', '<USER>', '<EMAIL>', '<PHONE>']`; agregación por media aritmética de los cinco logits; activación sigmoid; diez umbrales por etiqueta en `config.json`.

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer tipo BERT partiendo del checkpoint `pablocosta/bertabaporu-base-uncased`, adaptado a clasificación multietiqueta con diez salidas independientes y activación sigmoid (no softmax), lo que permite que un mismo texto active varias categorías simultáneamente. Sobre esa base se entrena un ensemble de cinco réplicas con semillas `[13, 42, 97, 123, 2026]`; en inferencia se calcula la media aritmética de los logits de los cinco miembros y se aplican umbrales específicos por etiqueta. La condición experimental final es `unweighted` (sin ponderación de clases) y la configuración de hiperparámetros es `hp_08`.

El preprocesado sustituye entidades sensibles por tokens especiales dedicados (`<URL>`, `<USER>`, `<EMAIL>`, `<PHONE>`), lo que reduce la dependencia de identidades concretas y mitiga la filtración de datos personales hacia el modelo. La truncación sigue la política B: se conservan los 255 primeros y los 255 últimos tokens de contenido, de modo que el modelo ve el inicio y el final del texto aunque se recorte la parte central. No se especifican en la información disponible el volumen de tokens de entrenamiento, la composición del dataset, ni si hubo ajuste por RLHF o DPO; tampoco se detalla la función de pérdida ni el esquema de validación más allá de la condición de umbrales congelados.

Como innovación destacable, el autor encapsula toda la lógica de decisión (promedio del ensemble, sigmoid y los diez umbrales) dentro del propio repositorio mediante código personalizado, de forma que la aplicación consumidora recibe directamente la lista final de etiquetas sin tener que replicar la calibración. Además, la salida informa del número de tokens de contenido originales y de si se aplicó truncado, lo que facilita auditar casos límite.

## Capacidades

- Clasificación multietiqueta de tipos de odio en portugués sobre diez categorías: edadismo, aporofobia, vergüenza corporal, capacitismo, LGBTfobia, contenido político, racismo, intolerancia religiosa, sexismo y xenofobia.
- Detección simultánea de varias categorías en un mismo texto (activación sigmoid independiente por etiqueta, no excluyente).
- Normalización de entidades sensibles mediante tokens especiales para URL, usuario, correo electrónico y teléfono.
- Salida estructurada en JSON con etiquetas activadas, puntuaciones para las diez clases, recuento de tokens originales y marca de truncado.
- Gestión interna de umbrales por etiqueta, sin exposición al cliente.
- Integración en una cadena jerárquica de moderación: clasificador binario `hate` / `nao_hate` seguido de este modelo multietiqueta.
- Ejecución mediante `AutoModelForSequenceClassification` con `trust_remote_code=True` y API `classify(texto, tokenizer=...)`.
- No se declaran capacidades de generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling ni uso como agente.

## Casos de uso

- Moderación de comentarios en plataformas en portugués: el modelo recibe textos ya marcados como odiosos por un filtro binario previo y devuelve el tipo concreto de odio, lo que permite enrutar cada caso al equipo o a la política de actuación correspondiente.
- Enrutado automático de denuncias: en un sistema de reportes, la lista de etiquetas activadas permite asignar la incidencia a la cola de racismo, LGBTfobia o intolerancia religiosa sin intervención manual inicial.
- Analítica de discurso de odio en redes sociales: al ser multietiqueta, permite medir la prevalencia simultánea de varias formas de odio en un corpus y construir series temporales por categoría.
- Priorización de revisión humana: las puntuaciones por etiqueta y la marca de truncado (`truncated_policy_b`) permiten ordenar la cola de moderación por confianza y detectar textos recortados que requieren revisión manual.
- Cumplimiento normativo y reporting: plataformas sujetas a obligaciones de transparencia sobre contenido ilícito pueden usar las categorías devueltas para elaborar informes agregados por tipo de odio.
- Investigación en ciencias sociales y lingüística de corpus: el modelo permite anotar automáticamente grandes volúmenes de texto en portugués con diez categorías etiquetadas de forma homogénea, como paso previo a análisis cualitativo.
- Preprocesado de datasets para entrenar modelos generativos o de diálogo: se puede usar para filtrar o etiquetar ejemplos de odio en corpus de entrenamiento y evaluación.
- Anonimización combinada con clasificación: los tokens `<URL>`, `<USER>`, `<EMAIL>` y `<PHONE>` permiten procesar textos con datos personales sin exponer las entidades originales al clasificador.

## Benchmarks y rendimiento

Resultados declarados por el autor para el artefacto congelado v0.1 sobre su conjunto de test tipo "oracle":

| Metrica | Valor |
|---|---|
| Macro-F1 (etiquetas elegibles) | 0,738260 |
| Macro-F1 (las 10 categorias) | 0,621377 |
| Micro-F1 | 0,778871 |

No se han publicado en la información disponible resultados comparativos frente a otros modelos, ni cifras de MMLU, HumanEval, GSM8K u otros benchmarks generales, que por otra parte no aplican a un clasificador de este tipo. Tampoco se especifica el tamaño, la composición ni la procedencia del conjunto de evaluación, ni qué significa exactamente "etiquetas elegibles", por lo que las cifras deben interpretarse con cautela y no son directamente comparables con las de otros clasificadores.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: en torno a 2,7 GB solo para pesos (676 M de parámetros × 4 bytes), más activaciones y overhead del runtime.
- VRAM estimada en FP16/BF16: en torno a 1,35 GB para pesos, más overhead.
- El ensemble empaqueta cinco miembros: si se cargan los cinco simultáneamente, el consumo de memoria es el del total de parámetros; si el código personalizado los ejecuta secuencialmente, el pico puede reducirse temporalmente al de un solo miembro (aproximadamente 135 M de parámetros).
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM es suficiente en la práctica; una RTX 3060, RTX 4060, RTX 4090, A10, L4, A100 o H100 cubren el modelo con holgura. Para lotes grandes es preferible una GPU de datacenter.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna con 6 GB o más de VRAM, e incluso es viable en CPU para volúmenes moderados, dado el tamaño del backbone.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (vía oficial documentada por el autor), y de forma indirecta cualquier servidor compatible con `AutoModelForSequenceClassification` (por ejemplo, Text Embeddings Inference no aplica; TGI está orientado a generación). La exportación a ONNX o la conversión a otros runtimes no está documentada en la información disponible.
- Latencia y throughput: no disponibles. Al tratarse de un encoder BERT base con secuencias de hasta 510 tokens de contenido, la latencia esperada es de milisegundos a decenas de milisegundos por petición en GPU, pero no se aportan cifras medidas.
- Requisito de seguridad operativa indicado por el autor: usar un token de HuggingFace con permisos de solo lectura y granularidad fina, y fijar una revisión concreta (commit SHA) en producción.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos alternativos en la información proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable. Como referencia estructural, el propio autor indica que el backbone es `pablocosta/bertabaporu-base-uncased` (licencia MIT), sobre el que este repositorio añade el ensemble de cinco semillas, la calibración por umbrales y los tokens especiales de anonimización.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| radarodio-v01-multilabel-ensemble | 676.020.530 (5 miembros) | no declarado; truncado 255+255 tokens | Macro-F1 elegible 0,738; Macro-F1 10 clases 0,621; Micro-F1 0,779 | MIT | HuggingFace, 0 descargas, 0 likes |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

Cualquier comparación rigurosa exigiría evaluar los modelos candidatos sobre el mismo conjunto de test y con el mismo esquema de umbrales, algo que no puede hacerse con la información disponible.

## Limitaciones y advertencias

- El modelo solo clasifica tipos de odio; no decide si un texto es odioso. Requiere un clasificador binario previo en el flujo jerárquico descrito por el autor.
- Es monolingüe en portugués: no se ha entrenado ni validado para otros idiomas, por lo que su uso en castellano, inglés u otras lenguas no está soportado.
- El autor advierte explícitamente de que no debe sustituir a la moderación humana en decisiones de alto impacto.
- Riesgo de alucinación en sentido estricto no aplica (es un clasificador, no un generador), pero sí existe riesgo de falsos positivos y falsos negativos, agravado por la condición `unweighted`, que no compensa el desbalanceo entre categorías y penaliza las clases minoritarias (Macro-F1 de 0,621 en las diez clases frente a 0,779 de Micro-F1).
- La truncación "Policy B" descarta la parte central de los textos largos; el propio modelo señala cuándo se ha truncado, pero el contenido descartado no se clasifica.
- No se documentan el dataset de entrenamiento, su procedencia, su composición demográfica ni los procesos de anotación, por lo que no puede evaluarse el sesgo ni la representatividad.
- La categoría `political` es especialmente ambigua y propensa a solapamientos con otras clases y con contenido legítimo.
- El modelo requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; conviene auditar ese código antes de desplegarlo en producción.
- La recomendación del autor es fijar un commit concreto y usar tokens de solo lectura, ya que el artefacto se declara congelado pero el repositorio es modificable por el autor.
- El repositorio no registra descargas ni valoraciones y la documentación no incluye una ficha de modelo estándar completa (card data con métricas formales, dataset, etc.), lo que limita la trazabilidad.
- La fecha de creación registrada en HuggingFace (2026-09-19) resulta inconsistente con la fecha de consulta habitual de este tipo de publicaciones; conviene verificar la antigüedad real del artefacto antes de confiar en él.
- Licencia MIT: permite uso comercial y modificación, pero exime al autor de responsabilidad y no impone obligaciones de atribución más allá del aviso de copyright habitual.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Thraaxxxx/radarodio-v01-multilabel-ensemble
- Modelo base del backbone: https://huggingface.co/pablocosta/bertabaporu-base-uncased (referenciado en la model card; no verificado en la búsqueda web)
- Paper, blog o repositorio adicionales: no disponible. La búsqueda web realizada no devolvió ningún resultado relacionado con este modelo (los resultados obtenidos trataban sobre Disney+ y no guardan relación con el artefacto).
