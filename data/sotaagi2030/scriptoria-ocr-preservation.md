# SOTAagi2030/Scriptoria-OCR-Preservation

## Resumen

Scriptoria OCR Preservation es un repositorio publicado en HuggingFace por el usuario SOTAagi2030 el 13 de octubre de 2026, con un tamano de repositorio de 0.0 GB, 0 descargas y 0 likes en el momento de la consulta. El unico tag declarado es `pytorch`. No hay pipeline de inferencia definido, ni licencia, ni idiomas declarados, ni pesos publicados.

La model card no describe un modelo: contiene exclusivamente una tabla de seleccion de perfiles (folio-2, quill-7, atlas-4) con penalizaciones, tiempos de procesamiento y marcas de certificacion, junto a una tabla de "evidencia de material" con recuentos de errores de caracter y de maquetacion para tres tipos de documento (ledger, map, postcard). Los terminos "OCR ABI scribe-abi-4" y "certification cutoff" apuntan a un formato de resultados de evaluacion o de seleccion interna de configuracion, no a una ficha tecnica de modelo.

Por tanto, no es posible evaluar el modelo con la informacion disponible: no se conocen arquitectura, parametros, contexto, dataset de entrenamiento, licencia ni formato de pesos. Cualquier uso en produccion requiere contactar con el autor o localizar artefactos adicionales no enlazados desde esta pagina.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio ocupa 0.0 GB, no hay ficheros de pesos publicados) |

## Arquitectura y entrenamiento

No disponible. La informacion proporcionada no incluye ninguna descripcion de arquitectura (transformer, MoE, SSM o hibrida), numero de tokens de entrenamiento, composicion del dataset ni proceso de alineacion (RLHF, DPO u otros). El unico tag tecnico es `pytorch`, que indica el framework declarado, no una arquitectura concreta.

Los unicos campos con carga semantica tecnica de la model card son "Required OCR ABI: scribe-abi-4" y "Selected profile: folio-2". Sugieren un esquema interno de versionado de interfaz (ABI) y de perfiles de configuracion de un pipeline OCR, pero no permiten inferir ni el tipo de red ni el procedimiento de entrenamiento. No se ha publicado ningun paper, informe tecnico ni repositorio de codigo asociado en los resultados de busqueda disponibles.

## Capacidades

- No hay ninguna capacidad confirmada por documentacion del autor. Las siguientes afirmaciones son inferencias a partir del nombre del repositorio y de las tablas de la model card, y no estan verificadas.
- Procesamiento OCR de documentos: la tabla de "material evidence" registra errores de caracter y de maquetacion sobre tres tipos de material (ledger, map, postcard), lo que sugiere un pipeline de reconocimiento de texto con metrica de preservacion de maquetacion.
- Evaluacion por perfil de configuracion: la tabla de perfiles elegibles indica un mecanismo de seleccion entre configuraciones alternativas en funcion de penalizacion y tiempo de procesamiento.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declara ninguna lista de idiomas).
- Modo de razonamiento (thinking mode), vision o audio: no disponible.

## Casos de uso

Los siguientes casos son escenarios genericos de OCR documental coherentes con el nombre y las tablas del repositorio. No pueden validarse con la informacion disponible y requieren confirmacion previa con el autor.

- Digitalizacion de libros de contabilidad y registros financieros historicos: un pipeline OCR con metrica explicita de errores de caracter y maquetacion es adecuado para convertir ledgers en datos estructurados, donde un error de un digito invalida la fila completa.
- Preservacion de cartografia y mapas: la tabla de evidencia registra 3 errores de maquetacion y 13 de caracter en "map", lo que sugiere tratamiento de documentos con geometria no rectangular; seria aplicable a archivos cartograficos donde la posicion del texto importa tanto como su contenido.
- Catalogacion de colecciones de postales y material grafico: el perfil seleccionado minimiza penalizacion sobre "postcard" (11 de penalizacion, 175 ms), util para digitalizar fondos fotograficos con texto manuscrito o tipografia degradada.
- Archivos historicos y bibliotecas digitales: extraccion de texto con preservacion de estructura para busqueda full-text sobre fondos no indexados.
- Auditoria y control de calidad de OCR: la propia model card funciona como artefacto de certificacion, con marcas temporales y reglas de seleccion reproducibles, aplicable a pipelines que exigen trazabilidad de la version de OCR usada.
- Procesamiento por lotes con presupuesto de latencia: los tiempos declarados por material (175-245 ms) permiten planificar throughput en pipelines por etapas, siempre que se confirme el hardware de referencia de esas mediciones.
- Integracion como etapa de una cadena documental mayor: dado que la card menciona un ABI versionado, podria integrarse como servicio interno con contrato de interfaz estable, aunque no se publica el contrato.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni de benchmarks estandar de OCR como ICDAR, FUNSD o DocVQA.

Los unicos numeros disponibles son las tablas de la propia model card, que corresponden a un proceso interno de seleccion de perfil y no son comparables con benchmarks publicos:

| profile_id | worst_penalty | total_penalty | total_processing_ms | certified_at |
| --- | ---: | ---: | ---: | --- |
| folio-2 | 19 | 46 | 635 | 2026-04-11T14:00:00Z |
| quill-7 | 19 | 48 | 630 | 2026-04-18T09:30:00Z |
| atlas-4 | 20 | 45 | 560 | 2026-03-29T08:10:00Z |

| material | character_errors | layout_errors | penalty | processing_ms |
| --- | ---: | ---: | ---: | ---: |
| ledger | 14 | 1 | 16 | 215 |
| map | 13 | 3 | 19 | 245 |
| postcard | 11 | 0 | 11 | 175 |

Se desconoce la definicion exacta de "penalty", el tamano de las muestras evaluadas, el idioma o idiomas de los documentos y el hardware sobre el que se midieron los milisegundos. Sin esa informacion, estas cifras no son interpretables como rendimiento del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al no haber pesos publicados (repositorio de 0.0 GB) ni datos de tamano, no es posible estimar requisitos de memoria.
- GPU recomendadas: no disponible. No se puede determinar si requiere A100, H100, RTX 4090 o ninguna GPU.
- Encaje en GPU de consumo: no disponible. En OCR ligero (modelos tipo CRNN o detectores pequenos) es habitual que la inferencia en CPU sea suficiente, pero esto es una observacion general del dominio y no un dato de este modelo.
- Opciones de despliegue: no disponible. No se publican pesos en safetensors, GGUF, ONNX ni otro formato, por lo que no se puede confirmar compatibilidad con vLLM, llama.cpp, Ollama, TGI u otros servidores de inferencia.
- Latencia y throughput: las unicas cifras declaradas son 215 ms para ledger, 245 ms para map y 175 ms para postcard, correspondientes al perfil folio-2. No se especifica hardware, tamano de imagen ni lote, por lo que no son extrapolables.

## Comparativa con modelos similares

No es posible establecer una comparativa con datos verificados: de Scriptoria OCR Preservation se desconoce todo salvo el nombre del repositorio. Como referencia de alternativas consolidadas a evaluar en la misma categoria (OCR de documentos), se listan proyectos conocidos; los datos de sus columnas provienen de conocimiento general y deben verificarse en sus fuentes oficiales antes de tomar decisiones.

| Herramienta | Tipo | Licencia (a verificar) | Disponibilidad |
| --- | --- | --- | --- |
| Scriptoria OCR Preservation | no disponible | no disponible | repositorio de 0.0 GB, sin pesos |
| Tesseract | OCR clasico con LSTM | Apache-2.0 | repositorio y binarios publicos ampliamente distribuidos |
| PaddleOCR | deteccion + reconocimiento + analisis de maquetacion | Apache-2.0 | pesos publicados y toolkit mantenido |
| TrOCR | transformer encoder-decoder para OCR | verificar en su ficha | pesos publicados en HuggingFace |
| docTR / Surya | pipelines OCR de documentos | verificar en cada proyecto | pesos publicados, uso comercial condicionado en algunos casos |

No se dispone de datos de parametros, contexto ni rendimiento comparables de este modelo, por lo que la tabla anterior sirve unicamente como lista de candidatos alternativos, no como comparacion cuantitativa.

## Limitaciones y advertencias

- Ausencia total de documentacion tecnica: sin arquitectura, parametros, contexto ni dataset no es posible reproducir, auditar ni evaluar el comportamiento del modelo.
- Sin pesos publicados: el repositorio ocupa 0.0 GB, por lo que no hay artefactos descargables ni forma de ejecutar inferencia.
- Licencia no disponible: no se puede determinar si el uso comercial esta permitido. Se debe asumir que no hay autorizacion explicita hasta que el autor la publique.
- Idiomas no declarados: se desconoce si soporta castellano u otras lenguas; los documentos de ejemplo (ledger, map, postcard) no especifican idioma.
- Riesgo de alucinacion: no evaluable sin acceso al modelo; en OCR el fallo tipico no es la invencion de contenido sino la sustitucion silenciosa de caracteres, especialmente critica en cifras contables.
- Metricas no interpretables: los valores de "penalty" y los recuentos de errores carecen de definicion, tamano de muestra y condiciones de medicion.
- Fechas anomalas: la creacion del repositorio (2026-10-13) y el corte de certificacion (2026-04-30) son posteriores a la fecha habitual de consulta y deben tratarse con cautela; podrian indicar metadatos generados de forma automatica o incorrecta.
- Trazabilidad: la model card parece un volcado de resultados de un proceso interno de seleccion de perfiles, no una ficha destinada a terceros. No hay contacto, paper ni repositorio de codigo enlazado.
- Cero adopcion: 0 descargas y 0 likes implican ausencia de validacion por parte de la comunidad.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/SOTAagi2030/Scriptoria-OCR-Preservation
- Unico resultado de busqueda web devuelto: indice de paquetes de piwheels, https://www.piwheels.org/simple/ (no guarda relacion con el modelo; se incluye por completitud)
- Paper o informe tecnico: no disponible
- Repositorio de codigo: no disponible
- Demo o space: no disponible
