# stanfordnlp/stanza-yrl

## Resumen

Stanza-yrl es el paquete de modelos lingüísticos de Stanza para el nheengatu (código ISO 639-3 `yrl`), una lengua de la familia tupí-guaraní hablada en la cuenca del alto río Negro (Amazonía). Lo publica el equipo de Stanford NLP (organización `stanfordnlp` en HuggingFace) dentro de su proyecto Stanza, una biblioteca en Python para el análisis lingüístico de texto en crudo que cubre tokenización, segmentación de frases, lematización, etiquetado morfosintáctico, análisis de dependencias y reconocimiento de entidades nombradas. El repositorio está etiquetado en HuggingFace con la tarea `token-classification` y declara como única lengua soportada el nheengatu.

El problema que resuelve es la ausencia de herramientas de procesamiento del lenguaje natural para una lengua de bajos recursos: sin tokenizadores ni modelos de entidades entrenados, cualquier trabajo sobre corpus en nheengatu (digitalización, anotación, búsqueda, traducción asistida) tiene que hacerse de forma manual. Este paquete permite aplicar una cadena de análisis automático sobre texto en `yrl` usando la misma interfaz que Stanza ofrece para las más de 70 lenguas que soporta el proyecto.

La model card es mínima: fue generada automáticamente por el script `hugging_stanza.py` del repositorio `stanfordnlp/huggingface-models`, no incluye detalles de arquitectura, número de parámetros, composición del dataset de entrenamiento ni métricas de evaluación. El repositorio ocupa 0,2 GB y se distribuye bajo licencia Apache 2.0. En el momento de redactar esta ficha el modelo acumula 0 descargas y 0 "likes", por lo que se trata de un artefacto recién publicado y prácticamente sin adopción verificable.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no la especifica; se distribuye a través de la biblioteca Stanza) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no hay indicios de que sea un modelo MoE) |
| Longitud de contexto | no disponible (Stanza procesa a nivel de frase u oración, no expone una ventana de contexto en tokens) |
| Tipos de cuantización | no disponible; no se publican versiones GGUF, AWQ ni GPTQ |
| Idiomas soportados | nheengatu (`yrl`) únicamente |
| Licencia | Apache 2.0 |
| Formato de pesos | no especificado en la model card; repositorio de 0,2 GB gestionado por la librería Stanza |
| Tarea declarada | `token-classification` |
| Biblioteca | Stanza |
| Descargas / likes | 0 / 0 |
| Fecha de creación en HuggingFace | 2026-09-29 |

## Arquitectura y entrenamiento

La model card no documenta la arquitectura del modelo. La información disponible se limita a la descripción del proyecto Stanza como una colección de herramientas para el análisis lingüístico que va "del texto en crudo al análisis sintáctico y al reconocimiento de entidades", y a la declaración de que el paquete cubre la lengua `yrl`. No se indica si el componente de etiquetado de tokens es un modelo basado en redes recurrentes con capa CRF, un transformer preentrenado con ajuste fino, o una combinación de ambos, ni si se emplean embeddings estáticos (word2vec/fastText) como entrada.

Tampoco hay información sobre el corpus de entrenamiento: no se especifica el número de tokens, la procedencia de los datos anotados, el esquema de etiquetas de entidades utilizado (por ejemplo, OntoNotes o un esquema propio), ni si hubo fases de ajuste con preferencias humanas. La model card únicamente señala que el repositorio y la tarjeta se prepararon de forma automática con `hugging_stanza.py`. Cualquier afirmación sobre técnicas concretas de entrenamiento o innovaciones arquitectónicas sería especulativa y no se recoge en esta ficha.

## Capacidades

- Análisis lingüístico de texto en nheengatu dentro de la cadena de procesamiento de Stanza: tokenización, segmentación de frases y etiquetado a nivel de token.
- Reconocimiento de entidades nombradas y etiquetado de tokens, tarea bajo la que está registrado el modelo en HuggingFace.
- Integración en el ecosistema Stanza: el paquete se descarga y se usa con la misma API que el resto de lenguas del proyecto (por ejemplo, mediante `stanza.Pipeline(lang='yrl', processors=...)`).
- Procesamiento por lotes sobre corpus de texto, apto para canalizaciones de anotación automática.
- No hay evidencia en la información disponible de soporte de tool calling, function calling, razonamiento multi-paso, modo "thinking", visión, audio ni capacidades generativas: no es un modelo de lenguaje generativo.
- Capacidad multilingüe: no. El paquete declara exclusivamente `yrl`.

## Casos de uso

- Anotación automática de corpus en nheengatu: investigadores que trabajan con transcripciones de campo pueden pasar los textos por el paquete para obtener tokenización y etiquetas de entidades de forma reproducible, en lugar de anotar manualmente cada documento.
- Digitalización y enriquecimiento de archivos documentales: actas de asociaciones indígenas, materiales escolares o publicaciones bilingües pueden procesarse para extraer entidades (topónimos, nombres de personas, organizaciones) y facilitar su catalogación.
- Preprocesado para traducción automática o corpus paralelos: la tokenización y la segmentación de frases son pasos previos obligatorios para alinear textos nheengatu con portugués o español y construir corpus paralelos utilizables por sistemas de traducción.
- Búsqueda e indexación sobre texto en nheengatu: las etiquetas y la segmentación permiten construir índices por entidad o por unidad oracional en repositorios digitales de lenguas indígenas, mejorando la recuperación de documentos.
- Apoyo a programas de educación intercultural bilingüe: el análisis automático puede alimentar glosarios y materiales didácticos, ayudando a docentes a identificar términos y construcciones en textos largos.
- Investigación tipológica y comparativa: al aplicar una cadena de análisis uniforme sobre nheengatu y sobre otras lenguas tupí-guaraní con paquetes Stanza equivalentes, se pueden comparar patrones morfosintácticos con criterios homogéneos.
- Preservación lingüística a largo plazo: la producción de anotaciones estructuradas y reutilizables sobre corpus en una lengua con pocos recursos digitales facilita su conservación y su reutilización por parte de otros grupos de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card no incluye métricas de precisión, recall ni F1 para el etiquetado de tokens o el reconocimiento de entidades, y tampoco se han encontrado en los resultados de búsqueda cifras específicas para la lengua `yrl`. La página de modelos del proyecto Stanza publica tablas de rendimiento para otras lenguas, pero no se dispone de esos datos para este paquete concreto en el material consultado.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Partiendo del tamaño del repositorio (0,2 GB), la inferencia es viable en CPU con un consumo de memoria del orden de 1 a 2 GB, incluyendo el proceso de Python y las dependencias; estas cifras son orientativas y no proceden de la documentación del modelo.
- GPU recomendadas: no se especifica ninguna. Cualquier GPU consumer con unos pocos GB de VRAM (por ejemplo, GTX 1650, RTX 3060 o superiores) sería suficiente si se desea acelerar el procesamiento, dado el reducido tamaño del paquete.
- Cabe en GPU consumer: sí, con alta probabilidad, por el tamaño del repositorio; no hay confirmación oficial de requisitos.
- Opciones de despliegue: la librería Stanza en Python es la vía natural de integración. No aplican servidores orientados a modelos generativos como vLLM, TGI, llama.cpp u Ollama, ya que no se publican pesos en formato GGUF ni se trata de un modelo de lenguaje autorregresivo. Para servicio en producción habría que envolver la librería en un servicio propio (por ejemplo, FastAPI).
- Latencia y throughput: no disponibles. Al ser un modelo de tamaño reducido y orientado a etiquetado, el procesamiento por lotes en CPU es habitual en este tipo de paquetes, pero no se han publicado medidas.

## Comparativa con modelos similares

No se han identificado alternativas publicadas específicamente para nheengatu en el material consultado, por lo que la comparación se establece con otros paquetes de la misma familia Stanza, que comparten interfaz y filosofía de distribución pero cubren lenguas distintas.

| Modelo | Lengua | Tarea | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| stanza-yrl | nheengatu (`yrl`) | token-classification | no disponible | no disponible | Apache 2.0 | HuggingFace |
| stanza-en | inglés | cadena completa de Stanza | no disponible | no disponible | no disponible en la información consultada | HuggingFace |
| stanza-zh | chino | cadena completa de Stanza | no disponible | no disponible | no disponible en la información consultada | HuggingFace |

La comparación directa en rendimiento no es posible: no hay métricas publicadas para `yrl` ni datos homogéneos de los otros paquetes en la información disponible. La diferencia relevante es de cobertura lingüística: las lenguas mayoritarias cuentan con múltiples alternativas (spaCy, UDPipe, modelos transformer específicos), mientras que para nheengatu este paquete de Stanza es, según la información disponible, una de las pocas opciones publicadas.

## Limitaciones y advertencias

- La model card no documenta la arquitectura, el dataset de entrenamiento ni las métricas, por lo que no es posible evaluar la calidad del modelo antes de usarlo; se recomienda validarlo sobre un conjunto de prueba propio antes de integrarlo en producción.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de errores de etiquetado y de segmentación, especialmente en una lengua de bajos recursos con variación ortográfica no estandarizada.
- Sesgos conocidos: no documentados. En lenguas con pocos datos anotados es habitual que el rendimiento dependa fuertemente del dominio y del registro del corpus de entrenamiento, que aquí se desconoce.
- Cobertura limitada a una sola lengua (`yrl`); no debe esperarse transferencia a otras lenguas tupí-guaraní ni al portugués sin verificación empírica.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificación, siempre que se conserven los avisos de copyright y licencia y se indiquen los cambios. No se han identificado cláusulas adicionales en la información disponible.
- Adopción nula verificable: 0 descargas y 0 "likes" en HuggingFace, lo que implica ausencia de validación por parte de la comunidad y de reportes de errores.
- Fecha de creación registrada como 2026-09-29; conviene comprobar si el repositorio se actualiza, ya que la model card indica que se regenera automáticamente.
- Para producción: al no publicarse pesos en formatos estándar de servido (GGUF, safetensors con configuración estándar), la integración depende de la librería Stanza y de sus dependencias, lo que condiciona el empaquetado y el escalado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/stanfordnlp/stanza-yrl
- Página de modelos de Stanza: https://stanfordnlp.github.io/stanza/models.html
- Descarga de modelos de Stanza: https://stanfordnlp.github.io/stanza/download_models.html
- Sitio del proyecto Stanza: https://stanza.stanford.edu/
- Repositorio en GitHub: https://github.com/stanfordnlp/stanza
- README del repositorio: https://github.com/stanfordnlp/stanza/blob/main/README.md
