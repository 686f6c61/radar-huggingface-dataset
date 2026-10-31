# tkhshtsh0917/gliner2.5-ja-modernbert-310m

## Resumen

gliner2.5-ja-modernbert-310m es un modelo de extraccion de informacion especializado en japones, entrenado por el usuario de HuggingFace tkhshtsh0917 como modelo comunitario no oficial (sin afiliacion con fastino-ai). Se trata de una implementacion de la arquitectura GLiNER2.5 en su variante "boundary", que resuelve un problema concreto: en japones, la segmentacion de texto no esta delimitada por espacios, lo que dificulta el NER y la extraccion estructurada con modelos genericos. Un unico modelo realiza reconocimiento de entidades nombradas, clasificacion de texto, extraccion de relaciones y extraccion estructurada en formato JSON.

El modelo sustituye el encoder original de GLiNER2.5 por ModernBERT-Ja-310m de SB Intuitions, con 321,9 millones de parametros reales segun los pesos en safetensors. Todas las cabeceras de tarea de GLiNER2 se inicializan desde cero y se entrenan sobre un dataset sintetico japones propietario no publicado, usando el tokenizador por palabras Sudachi (SplitMode.C). Es relevante ahora porque ofrece extraccion de esquemas zero-shot en japones con un modelo pequeno y eficiente, capaz de ejecutarse en CPU.

Existe una familia con dos tamanos: este modelo de 310m (mayor precision) y una variante 130m (mas ligera, orientada a CPU y edge). Ambos forman parte de la coleccion "GLiNER2.5 Japanese" en HuggingFace, con una demo en un Space para probarlos desde el navegador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLiNER2.5 (boundary architecture) sobre encoder ModernBERT-Ja |
| Parametros totales | 321.919.955 (dato real de safetensors) |
| Parametros activos | no disponible (no es MoE; arquitectura densa) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | japones (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamano del repo: 2,6 GB) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GLiNER2.5 "boundary": el esquema de etiquetas (entidades, clases, relaciones y campos de estructura) se escribe como un prompt con tokens marcadores ([E] para entidades, [L] para clases, [R] para argumentos de relacion, [C] para campos de estructura) y se concatena con el texto de entrada en una unica secuencia. El encoder ModernBERT-Ja procesa esquema y texto en una sola pasada, de modo que los marcadores y las palabras del texto se atienden mutuamente. El vector de cada marcador actua como query de su etiqueta, y una cabeza de tipo "boundary" puntua cada hueco entre palabras como posible inicio o fin de span, reevaluando los mejores pares con la compatibilidad de los extremos, las palabras internas y la longitud del span. Incluye ademas una puntuacion "no answer" que permite devolver vacio para etiquetas ausentes en el texto.

Como tokenizador de palabras se emplea un splitter personalizado basado en Sudachi (SplitMode.C, diccionario core), con minuscules automaticas y un fallback para alinear los spans gold con los tokens de Sudachi. El encoder parte de los pesos preentrenados de ModernBERT-Ja-310m de SB Intuitions, pero todas las cabeceras de tarea de GLiNER2 se entrenan desde cero (sin usar pesos de fastino-ai como gliner2.5-multi-v1). El entrenamiento usa el trainer publico de gliner2 (version 2.0.0) sin modificar la libreria, con un script wrapper que anade la configuracion especifica para japones y ajustes de schema-augmentation. Los datos de entrenamiento son un dataset sintetico japones propietario no publicado; no se ha informado del numero de tokens ni del uso de RLHF/DPO.

## Capacidades

- Reconocimiento de entidades nombradas (NER) zero-shot en japones: hasta 128 spans candidatos por etiqueta, con seleccion del conjunto no solapado optimo por etiqueta y umbral por defecto de 0,5 (sigmoid).
- Clasificacion de texto con esquemas definidos por el usuario: tareas de etiqueta unica (softmax) y multietiqueta (sigmoid, umbral por defecto 0,5).
- Extraccion de relaciones: pares cabeza-cola definidos como dos consultas de span, puntuados por una cabeza de relacion dedicada.
- Extraccion estructurada en formato JSON: cada campo es una consulta de span; en modo "natural", cada candidato del campo ancla inicia un registro y los demas campos se asignan a los registros.
- Devolucion de resultados como diccionario de Python con offsets de caracteres sobre el texto original, conservando la forma original (por ejemplo, "Pythonエンジニア" en lugar de "pythonエンジニア").
- Definicion de esquemas en tiempo de inferencia sin reentrenamiento (extraccion zero-shot guiada por esquema).
- No soporta generacion de texto libre, vision, audio ni tool calling: es un modelo de token-classification / extraccion.

## Casos de uso

- Extraccion de informacion de ofertas de empleo en japones: dada una consulta como "渋谷でリモート可のPythonエンジニア正社員", el modelo extrae campos como 職種 (puesto), 勤務地 (ubicacion) y condiciones de busqueda, util para buscadores semanticos y agregadores de empleo.
- Procesamiento de documentos empresariales en japones: extraccion de entidades (empresas, fechas, importes) de facturas, contratos y correos, aprovechando que los resultados se devuelven con offsets de caracteres sobre el texto original.
- Construccion de pipelines de RAG sobre corpus japones: el NER y la extraccion estructurada permiten enriquecer chunks con metadatos (personas, organizaciones, fechas) antes de indexarlos.
- Clasificacion automatica de tickets y consultas de clientes: tareas de etiqueta unica o multietiqueta definidas por esquema en tiempo de ejecucion, sin reentrenar el modelo por cada taxonomia nueva.
- Poblado de bases de datos o knowledge graphs: la extraccion de relaciones permite vincular pares de entidades (por ejemplo, persona-cargo u organizacion-filial) directamente desde texto plano.
- Analisis de noticias y redes sociales en japones: deteccion de entidades y clasificacion tematica en flujos de texto de alto volumen, dado que el modelo puede ejecutarse en CPU.
- Despliegue en entornos edge o con recursos limitados: con 321,9 millones de parametros y ejecucion verificada en CPU (Python 3.10, 3.12 y 3.13), es adecuado para servicios locales sin GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de precision (F1, exact match) ni comparativas con otros modelos de NER japones.

## Requisitos de hardware

- VRAM/RAM estimada: con 321,9 millones de parametros en fp32/safetensors (2,6 GB de repo), la inferencia en CPU es viable; en GPU, menos de 2 GB de VRAM en precision estandar. No se indican cifras oficiales.
- GPU recomendadas: no requiere GPU; cualquier GPU moderna (por ejemplo, una RTX 3060 o superior) es mas que suficiente. No se publican recomendaciones especificas de A100/H100.
- Cabe en GPUs consumer: si, sobradamente; de hecho, la model card verifica el funcionamiento en CPU, por lo que tambien funciona en portatiles sin GPU dedicada.
- Despliegue: via libreria gliner2 (>= 2.1.0, extra [local]), con transformers >= 5 (los ficheros del tokenizador se guardaron con Transformers 5 y Transformers 4 no puede leerlos) y sudachipy >= 0.7 con sudachidict-core. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI (no aplica, al no ser un modelo generativo).
- Latencia y throughput: no disponibles. Al ser un modelo de encoder de ~320M con una sola pasada forward por inferencia (esquema y texto juntos), la latencia es baja, pero no se publican cifras.

Instalacion documentada:

```bash
pip install "gliner2[local]>=2.1" "transformers>=5" "sudachipy>=0.7" sudachidict-core
```

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Idioma | Licencia | Notas |
|---|---|---|---|---|---|
| gliner2.5-ja-modernbert-310m (este) | 321,9M | NER, clasificacion, relaciones, JSON zero-shot | japones | Apache 2.0 | Encoder ModernBERT-Ja-310m, tokenizador Sudachi |
| gliner2.5-ja-modernbert-130m (misma familia) | ~130M (no disponible en detalle) | Identicas a este modelo | japones | Apache 2.0 | Mas pequeno y rapido, orientado a CPU/edge; menor precision |
| fastino/gliner2.5-multi-v1 | no disponible | NER, clasificacion, relaciones, JSON zero-shot | multilingue | no disponible | Modelo oficial de fastino-ai; este modelo no usa sus pesos |

No se dispone de datos de rendimiento comparativos entre estos modelos; la eleccion entre las variantes 310m y 130m depende del equilibrio precision/velocidad requerido.

## Limitaciones y advertencias

- Es un modelo comunitario no oficial: no esta afiliado ni respaldado por fastino-ai, y todas las cabeceras de tarea se entrenaron desde cero, por lo que el rendimiento puede diferir del GLiNER2.5 oficial.
- Los datos de entrenamiento son un dataset sintetico propietario no publicado: no es posible auditar su composicion, sesgos ni cobertura dominiio a dominio. El rendimiento en textos reales de dominios especificos (legal, medico) no esta documentado.
- No hay benchmarks publicados: no se pueden comparar cifras de F1 ni precision frente a alternativas antes de evaluarlo por cuenta propia.
- Requiere pasar obligatoriamente un word_splitter (Sudachi, SplitMode.C); sin el, el texto se divide por espacios en blanco y los spans japoneses no se extraen correctamente.
- Dependencia de versiones concretas: exige transformers >= 5 y gliner2 >= 2.1.0; entornos con Transformers 4 deben actualizarse o el tokenizador no cargara.
- Sin informacion sobre longitud maxima de contexto del encoder ni sobre cuantizacion disponible.
- Sesgos y riesgo de alucinacion: al ser un modelo extractor (no generativo), el riesgo de alucinacion se limita a spans mal delimitados o etiquetas mal asignadas; no se documentan sesgos especificos.
- Licencia Apache 2.0: sin restricciones para uso comercial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tkhshtsh0917/gliner2.5-ja-modernbert-310m
- Modelo base (encoder): https://huggingface.co/sbintuitions/modernbert-ja-310m
- Variante 130m: https://huggingface.co/tkhshtsh0917/gliner2.5-ja-modernbert-130m
- Coleccion GLiNER2.5 Japanese: https://huggingface.co/collections/tkhshtsh0917/gliner25-japanese
- Demo en Space: https://huggingface.co/spaces/tkhshtsh0917/gliner2.5-japanese-demo
- Repositorio GLiNER2 (fastino-ai): https://github.com/fastino-ai/GLiNER2
- Sudachi (sudachi.rs): https://github.com/WorksApplications/sudachi.rs
