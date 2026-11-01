# trannel/trannel-madlad400-3b-ct2

## Resumen

`trannel/trannel-madlad400-3b-ct2` es una conversion a CTranslate2 en cuantizacion int8 del modelo de traduccion automatica `google/madlad400-3b-mt`, publicada por el usuario trannel. No se trata de un modelo nuevo ni de un fine-tuning: la model card indica explicitamente que el modelo es "otherwise unmodified", es decir, los pesos son los del MADLAD-400 3B MT original de Google, unicamente transformados al formato y la cuantizacion de CTranslate2 para inferencia eficiente en CPU.

El modelo base, MADLAD-400 3B MT, es un transformer encoder-decoder de aproximadamente 3.000 millones de parametros entrenado por Google Research para traduccion automatica multilingue a gran escala, con cobertura declarada de mas de 400 idiomas y una longitud de contexto de 256 tokens. Esta version concreta esta pensada para traduccion offline dentro de la aplicacion de escritorio para Windows *Translator by Trannel*, lo que explica su tamano de repositorio de 3,0 GB y su empaquetado en CTranslate2.

Su relevancia practica es acotada pero clara: ofrece un artefacto listo para desplegar con CTranslate2, con licencia Apache-2.0 y un footprint de memoria reducido frente a los pesos originales en punto flotante, lo que permite ejecutar traduccion multilingue en equipos sin GPU dedicada. El repositorio tiene un uso muy bajo (36 descargas, 0 likes) y no incluye documentacion adicional sobre el proceso de conversion, los parametros exactos de cuantizacion ni evaluaciones propias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (heredada de google/madlad400-3b-mt) |
| Parametros totales | ~3.000 millones (modelo base MADLAD-400 3B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens (modelo base) |
| Tipos de cuantizacion | int8 (CTranslate2) |
| Idiomas soportados | no disponible en la informacion proporcionada (el modelo base declara cobertura de mas de 400 idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | CTranslate2 (directorio de modelo CTranslate2, no safetensors ni GGUF) |

## Arquitectura y entrenamiento

La arquitectura corresponde integramente al modelo base `google/madlad400-3b-mt`: un transformer encoder-decoder de traduccion con aproximadamente 3.000 millones de parametros y una ventana de contexto de 256 tokens. MADLAD-400 se entreno sobre un corpus web multilingue a gran escala (el articulo original describe un dataset de varios billones de tokens filtrado y deduplicado, con tecnicas de limpieza para datos de baja calidad) y emplea un vocabulario SentencePiece compartido que cubre cientos de idiomas. La model card de esta conversion no aporta detalles adicionales sobre el entrenamiento ni sobre si el modelo base recibio etapas de ajuste fino supervisado o preferencias.

La unica transformacion aplicada en este repositorio es la conversion a CTranslate2 con cuantizacion int8, que reduce el peso en disco a 3,0 GB y acelera la inferencia en CPU mediante kernels optimizados. No se documentan en la informacion disponible los parametros exactos de la conversion (por ejemplo, si se cuantizaron todas las capas o solo las lineales), ni si se aplicaron optimizaciones adicionales como fusión de operaciones o decodificacion especulativa.

## Capacidades

- Traduccion automatica multilingue: el modelo base cubre cientos de idiomas, aunque esta ficha no puede confirmar la lista exacta soportada por esta conversion.
- Traduccion bidireccional entre pares de idiomas, incluidos pares con pocos recursos, gracias al entrenamiento multilingue del modelo original.
- Ejecucion offline en CPU: el formato CTranslate2 int8 esta disenado para inferencia sin GPU.
- Integracion en aplicaciones de escritorio: es el motor usado por la aplicacion Windows *Translator by Trannel*.
- Generacion de texto condicionada por el prefijo de idioma destino (comportamiento estandar de MADLAD-400 MT).
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento extendido.

## Casos de uso

- Traduccion offline en aplicaciones de escritorio: el modelo esta empaquetado en CTranslate2 int8 precisamente para integrarse en un cliente Windows sin conexion, con un peso de 3,0 GB que cabe en disco y se carga en RAM de equipos de gama media.
- Traduccion por lotes en servidores sin GPU: al ejecutarse sobre CTranslate2, puede procesar grandes volumenes de documentos en CPU con un consumo de memoria moderado, adecuado para pipelines ETL de localizacion.
- Localizacion de documentacion tecnica: permite traducir manuales y articulos entre idiomas europeos y no europeos, aprovechando la cobertura multilingue del modelo base, siempre que los segmentos no superen los 256 tokens.
- Preprocesado multilingue para analitica: traduccion de reseñas, tickets o comentarios a un idioma pivote antes de aplicar modelos de clasificacion o analisis de sentimiento.
- Traduccion de subtitulos y transcripciones: los segmentos cortos encajan bien con la ventana de 256 tokens; el modelo puede procesar lineas de subtitulo de forma individual con baja latencia en CPU.
- Prototipado e investigacion en traduccion automatica: sirve como referencia cuantizada del MADLAD-400 3B para comparar calidad frente a versiones en punto flotante o para experimentar con CTranslate2 en entornos academicos.
- Uso embebido en herramientas de escritorio de terceros: al tener licencia Apache-2.0, puede redistribuirse dentro de aplicaciones comerciales con las obligaciones de atribucion correspondientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas BLEU, chrF ni comparaciones con otras versiones, y la busqueda web no aporta datos tecnicos sobre este repositorio.

## Requisitos de hardware

- VRAM: no aplica para inferencia en CPU; en GPU, el modelo int8 requiere aproximadamente 3-4 GB de memoria, aunque CTranslate2 esta optimizado principalmente para CPU.
- Memoria RAM estimada: en torno a 4-6 GB para cargar el modelo int8 y procesar lotes pequenos.
- GPU recomendadas: no disponibles en la informacion proporcionada; el artefacto esta orientado a CPU.
- GPU de consumo: probablemente cabe en tarjetas con 6-8 GB de VRAM, pero no hay datos publicados que lo confirmen.
- Despliegue: CTranslate2 (libreria `ctranslate2`, con bindings de Python y C++); compatible con el ecosistema de traduccion de Argos Translate y con la aplicacion Translator by Trannel. No es compatible directamente con vLLM, llama.cpp, Ollama ni TGI, que no soportan este formato.
- Latencia y throughput: no disponibles; dependen del hardware y del tamano de lote.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| trannel/trannel-madlad400-3b-ct2 | ~3B | 256 tokens | CTranslate2 int8 | Apache-2.0 | Conversion int8 del MADLAD-400 3B MT, orientada a CPU |
| google/madlad400-3b-mt | ~3B | 256 tokens | safetensors (Transformers) | Apache-2.0 | Modelo original de Google, requiere GPU o CPU con Transformers |
| Helsinki-NLP/opus-mt-* | ~70-300M por par | ~512 tokens | safetensors | Apache-2.0 / CC-BY-4.0 segun modelo | Modelos por par de idiomas, mucho mas ligeros pero sin cobertura universal |
| NLLB-200 (facebook/nllb-200-distilled-600M) | ~600M | 512 tokens | safetensors | CC-BY-NC-4.0 | Multilingue (200 idiomas), pero licencia no comercial en la version base |

La comparativa se basa en caracteristicas publicas de los modelos citados; no hay datos de rendimiento de esta conversion que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- La model card es minima: no documenta el proceso de conversion, los parametros de cuantizacion ni posibles perdidas de calidad respecto al modelo original en punto flotante.
- La cuantizacion int8 puede degradar ligeramente la calidad de traduccion frente a los pesos originales; no se han publicado evaluaciones que lo cuantifiquen.
- Ventana de contexto de solo 256 tokens: los documentos largos deben segmentarse, lo que puede romper la coherencia en textos con dependencias largas.
- No se dispone de la lista verificada de idiomas soportados por esta conversion; la cobertura de mas de 400 idiomas corresponde al modelo base y debe validarse por par de idiomas.
- Riesgo de alucinacion y de traducciones incorrectas en idiomas de bajos recursos o en dominios especializados (juridico, medico, tecnico).
- Sesgos heredados del corpus web de entrenamiento del modelo base, que pueden reflejar desequilibrios de genero, culturales o geograficos.
- Licencia Apache-2.0: permite uso comercial y redistribucion, pero exige conservar el aviso de licencia y la atribucion a Google como autor del modelo original.
- Repositorio con muy baja adopcion (36 descargas, 0 likes) y sin mantenimiento documentado; conviene verificar la integridad de los pesos antes de usarlo en produccion.
- El nombre del autor ("trannel") coincide con el de una filial maltesa mencionada en noticias sobre la FDJ y Unibet; no hay ninguna relacion verificada entre esa entidad y este repositorio, por lo que no debe inferirse vinculacion alguna.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/trannel/trannel-madlad400-3b-ct2
- Modelo base: https://huggingface.co/google/madlad400-3b-mt
- Paper de MADLAD-400: https://arxiv.org/abs/2309.04662
- Repositorio de CTranslate2: https://github.com/OpenNMT/CTranslate2
- Documentacion de CTranslate2: https://opennmt.net/CTranslate2/
- Articulo de Le Monde sobre la FDJ y Trannel (contexto no relacionado con el modelo): https://www.lemonde.fr/les-decodeurs/article/2025/07/29/derriere-le-rachat-d-unibet-le-fardeau-maltais-qui-pourrait-plomber-la-francaise-des-jeux_6625221_4355770.html
