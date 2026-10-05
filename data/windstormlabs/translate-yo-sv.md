# WindstormLabs/translate-yo-sv

## Resumen

WindstormLabs/translate-yo-sv es un modelo de traduccion automatica neuronal especializado en un unico par de idiomas: yoruba (yo) como lengua de origen y sueco (sv) como lengua de destino. Lo publica Windstorm Labs dentro de su catalogo abierto de modelos, y es una adaptacion del modelo OPUS-MT Helsinki-NLP/opus-mt-yo-sv, desarrollado por el grupo de investigacion de la Universidad de Helsinki. El modelo se distribuye a traves de HuggingFace con la libreria transformers y el pipeline de traduccion.

Se trata de un modelo MarianMT, la arquitectura de tipo transformer encoder-decoder que Helsinki-NLP utiliza de forma sistematica en la familia OPUS-MT. El repositorio ocupa 0,4 GB e incluye dos variantes de despliegue en subcarpetas: una en formato Transformers para inferencia en GPU y otra cuantizada a INT8 con CTranslate2 para inferencia en CPU. La licencia es Apache-2.0, heredada del modelo base.

Su relevancia es acotada pero clara: cubre un par linguistico de bajos recursos (yoruba-sueco) poco atendido por los modelos multilingues masivos, y lo hace con un artefacto pequeno y desplegable en hardware modesto. La model card no publica ninguna puntuacion de calidad en el repositorio; las metricas de cribado, cuando existen, se remiten a la pagina del catalogo del autor. El repositorio registra 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MarianMT (transformer encoder-decoder) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 mediante CTranslate2 (variante `lora-ct2-int8/`); la variante `lora/` se distribuye en precision original |
| Idiomas soportados | yoruba (`yo`) y sueco (`sv`), traduccion unidireccional yo → sv |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (variante `lora/`, formato Transformers) y CTranslate2 INT8 (variante `lora-ct2-int8/`) |

## Arquitectura y entrenamiento

La arquitectura es MarianMT, un transformer secuencial encoder-decoder con atencion multi-cabeza, disenado especificamente para traduccion automatica y entrenado originalmente con el framework Marian. El modelo deriva directamente de Helsinki-NLP/opus-mt-yo-sv, del proyecto OPUS-MT, que entrena modelos de traduccion por pares de idiomas sobre corpus paralelos extraidos del ecosistema OPUS. La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF o DPO; tampoco describe tecnicas de decodificacion especulativa o atencion lineal.

Lo que si documenta el autor es el proceso de derivacion: los pesos son una adaptacion del modelo de Helsinki-NLP, reempaquetados en dos variantes de despliegue bajo la denominacion WindyStandard (la linea de produccion del catalogo Windstorm Labs). La variante `lora/`, pese al nombre de la subcarpeta, se describe en la model card como la linea base de produccion en formato Transformers para GPU; la model card no aclara si ese nombre implica el uso efectivo de adaptadores LoRA ni si se realizo un ajuste fino adicional sobre el modelo base. La variante `lora-ct2-int8/` es la conversion de esa linea base a INT8 con CTranslate2 para inferencia en CPU. El autor retiro de la version actual del repositorio las variantes WindyScripture (`herm0-scripture/` y `scripture-ct2-int8/`) mientras revisa las licencias de los textos eBible que las alimentaban, y senala explicitamente que se trata de una precaucion, no de una conclusion legal.

## Capacidades

- Traduccion de texto de yoruba a sueco, con salida de texto plano.
- Integracion nativa con la libreria transformers mediante las clases `MarianMTModel` y `MarianTokenizer`, cargando la subcarpeta `lora`.
- Inferencia en CPU de baja latencia a traves de CTranslate2 con pesos INT8, cargando la subcarpeta `lora-ct2-int8`.
- Compatibilidad declarada con endpoints de inferencia (etiqueta `endpoints_compatible` en el repositorio).
- No se documentan capacidades de tool calling ni de function calling.
- No se documentan capacidades de agente ni de razonamiento multi-paso.
- No se documentan capacidades de vision, audio, modo de razonamiento explicito ni generacion de codigo.
- El soporte multilingue se limita estrictamente al par yoruba-sueco; no hay indicacion de otros pares.
- El modelo se presenta como base de las aplicaciones de Windy Word, lo que sugiere uso en produccion dentro de ese ecosistema.

## Casos de uso

- Traduccion de documentacion de producto y materiales de marketing del yoruba al sueco: el modelo esta especializado en un unico par linguistico, lo que evita el sesgo hacia lenguas mayoritarias que introducen los modelos multilingues masivos en pares de bajos recursos.
- Localizacion de contenido editorial y noticias: al ser un artefacto pequeno, puede desplegarse en el mismo flujo de publicacion para traducir articulos redactados originalmente en yoruba antes de su revision humana en sueco.
- Traduccion asistida para servicios publicos y ONG: organizaciones que atienden a comunidades yorubaparlantes en Suecia pueden integrar el modelo en formularios o portales, con el castellano o el sueco como idiomas de trabajo del personal.
- Procesamiento por lotes de corpus yoruba para analisis linguistico: la variante CTranslate2 INT8 permite traducir volumenes grandes de texto en CPU sin depender de GPU, util para investigacion en linguistica de corpus.
- Subtitulado y transcripcion: integrado aguas abajo de un sistema de reconocimiento de voz en yoruba, puede generar subtitulos en sueco en tiempo casi real si la latencia de la variante INT8 resulta adecuada.
- Preservacion digital y acceso a archivos: traduccion de material historico o etnografico en yoruba para que sea consultable por investigadores suecohablantes.
- Componente de demostracion o ensenanza: por su tamano reducido (0,4 GB en el repositorio) sirve como ejemplo reproducible de despliegue de un modelo de traduccion con transformers y CTranslate2 en un portatil.
- Linea base en evaluacion de traduccion de bajos recursos: util como referencia frente a modelos multilingues en experimentos academicos sobre el par yo-sv.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica que no se publica ninguna puntuacion de calidad en el repositorio y que las puntuaciones de cribado, cuando se han medido, figuran en la pagina del catalogo del autor. No se dispone de datos de BLEU, chrF, COMET ni de ninguna otra metrica para este modelo.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. Con un repositorio de 0,4 GB que contiene dos variantes, el peso en memoria de la variante Transformers es del orden de cientos de MB en FP32, y aproximadamente una cuarta parte en la variante INT8.
- GPU recomendadas: cualquier GPU con unos pocos GB de VRAM es suficiente; no se requiere A100, H100 ni tarjetas de gama alta para este modelo.
- Cabe en GPU de consumo: si, incluidas tarjetas de gama baja y antiguas, y en la practica incluso en CPU.
- Opciones de despliegue: transformers (PyTorch) con `MarianMTModel` sobre la subcarpeta `lora`; CTranslate2 con la subcarpeta `lora-ct2-int8`; al ser un modelo MarianMT, es compatible con el ecosistema habitual de conversion a otros formatos, aunque el repositorio solo distribuye estas dos variantes.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de latencia por frase.
- Despliegue en CPU: es el escenario para el que existe la variante INT8, segun la propia model card ("fast CPU inference").

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Rendimiento |
|---|---|---|---|---|---|---|
| WindstormLabs/translate-yo-sv | no disponible | no disponible | yo → sv | Apache-2.0 | safetensors, CTranslate2 INT8 | no disponible |
| Helsinki-NLP/opus-mt-yo-sv (modelo base) | no disponible | no disponible | yo → sv | Apache-2.0 | Transformers | no disponible |
| Modelos multilingues tipo NLLB-200 o M2M-100 | no disponible en la informacion proporcionada | no disponible | cobertura de centenares de idiomas, incluidos yo y sv | no disponible en la informacion proporcionada | no disponible | no disponible |

No se dispone de datos de rendimiento comparativos. La diferencia documentada frente al modelo base de Helsinki-NLP es el reempaquetado en dos variantes de despliegue y la cuantizacion INT8 para CPU; la model card no declara mejoras de calidad sobre el original. Frente a los modelos multilingues masivos, la ventaja estructural es el tamano reducido y el despliegue sin GPU, a costa de no cubrir ningun par adicional.

## Limitaciones y advertencias

- Ausencia total de metricas publicas: no hay BLEU, chrF ni COMET en el repositorio, por lo que no es posible evaluar la calidad de traduccion antes de desplegarlo. Cualquier uso en produccion exige una evaluacion propia con corpus de referencia.
- Modelo unidireccional y monoproposito: solo traduce de yoruba a sueco. No traduce en sentido inverso ni a ningun otro idioma.
- Par de bajos recursos: los corpus paralelos yo-sv disponibles publicamente son limitados, lo que suele traducirse en peor cobertura lexica, mayor tasa de palabras desconocidas y errores en terminologia especializada.
- Ortografia del yoruba: el yoruba emplea diacriticos y marcas de tono. Errores de normalizacion en la entrada (omision de tonos o subpuntos) degradan la traduccion, y no se documenta como se trato este aspecto en el entrenamiento.
- Riesgo de alucinacion: como en cualquier sistema de traduccion neuronal, puede generar contenido plausible pero no fiel al original, especialmente con entradas largas, ambiguas o fuera de dominio. No se documenta ningun mecanismo de mitigacion ni de deteccion.
- Longitud de contexto no especificada: se desconoce el limite practico de tokens por segmento; no se recomienda enviar parrafos largos sin segmentacion previa.
- Validacion comunitaria nula: 0 descargas y 0 likes en el momento de la consulta. No hay evidencia de uso independiente ni de replicacion de resultados.
- Duplicidad de copias: la model card indica que la copia canonica esta en la cuenta WindyTranslate. Conviene verificar cual de las dos copias recibe mantenimiento antes de fijar una version en produccion.
- Historial de cambios: las variantes WindyScripture fueron retiradas temporalmente por una revision de licencias de textos eBible. Aunque afecta a variantes distintas, conviene revisar la trazabilidad de los datos si se necesita procedencia documentada.
- Licencia: Apache-2.0 permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de licencia y la atribucion a Helsinki-NLP y OPUS-MT. No se declaran restricciones adicionales.
- Ambiguedad en el nombre de la subcarpeta `lora/`: la model card la describe como linea base de produccion en formato Transformers, sin aclarar si se aplico realmente un ajuste con adaptadores LoRA. Conviene inspeccionar los archivos del repositorio antes de asumir que los pesos son un fine-tuning completo del modelo base.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/WindstormLabs/translate-yo-sv
- Copia canonica declarada por el autor: https://huggingface.co/WindyTranslate/translate-yo-sv
- Pagina de catalogo con puntuaciones y licencias: https://windytranslate.com/models/translate-yo-sv
- Aplicaciones de Windy Word construidas sobre esta familia de modelos: https://windyword.ai
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-yo-sv
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; los enlaces anteriores son los unicos disponibles en la informacion proporcionada.
