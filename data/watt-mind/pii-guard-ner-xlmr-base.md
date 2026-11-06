# watt-mind/pii-guard-ner-xlmr-base

## Resumen

PII Guard NER es un modelo de clasificación de tokens (token classification) para la detección de datos personales (PII, *Personally Identifiable Information*) desarrollado por Watt Mind. Se trata de un ajuste fino (*fine-tune*) sobre XLM-RoBERTa base (277,5 millones de parámetros) entrenado para localizar nombres, direcciones, fechas de nacimiento, datos de contacto, números de identificación y cuentas bancarias en texto. Su versión principal cubre húngaro, inglés y alemán (los idiomas más probados), y desde la versión v4.2 amplía el soporte a 21 idiomas adicionales de la Unión Europea, entre ellos el castellano.

El problema que resuelve es crítico en la actualidad: actuar como capa de privacidad para aplicaciones de IA generativa y agentes que procesan texto de usuarios. El modelo devuelve los tramos de texto detectados (*spans*) con sus desplazamientos de caracteres, lo que permite enmascarar la información sensible antes de que llegue a un LLM y restaurarla en la respuesta. Está diseñado para ejecutarse localmente en CPU, lo que lo hace adecuado para despliegues on-premise donde los datos no pueden salir del entorno.

Es relevante porque forma parte del ecosistema PII Guard, que combina este detector NER con reglas deterministas, manejo de fronteras de palabra, tratamiento de sufijos húngaros y enmascarado reversible. El modelo por sí solo no redacta texto ni procesa imágenes; es el componente de detección rápida (*fast mode*) del sistema completo. Se distribuye bajo licencia Apache-2.0 en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa (transformer encoder) para clasificacion de tokens |
| Parametros totales | 277.469.205 |
| Parametros activos | no disponible (no es MoE; todos los parametros estan activos) |
| Longitud de contexto | no disponible (limitada por la ventana de XLM-RoBERTa; para documentos largos se recomienda ventanas solapantes) |
| Tipos de cuantizacion | no disponible (se publica en fp32/fp16 estandar, 2,2 GB de pesos) |
| Idiomas soportados | hungaro, ingles, aleman (mas probados); bulgaro, croata, checo, danes, esloveno, eslovaco, espanol, estonio, finlandes, frances, griego, irlandes, italiano, leton, lituano, maltés, neerlandes, polaco, portugues, rumano y sueco (24 en total) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de FacebookAI/xlm-roberta-base, un encoder transformer multilingue preentrenado sobre 2,5 TB de texto en 100 idiomas mediante masked language modeling. Sobre esta base se entrena una cabeza de clasificacion de tokens con etiquetado BIO (*Beginning-Inside-Outside*) sobre diez tipos de entidad: `PERSON`, `ORGANIZATION`, `ADDRESS`, `DATE_OF_BIRTH`, `EMAIL`, `PHONE`, `ID_DOCUMENT`, `NATIONAL_ID_HU_TAX`, `NATIONAL_ID_HU_TAJ` y `BANK_ACCOUNT`. Los dos tipos nacionales (identificador fiscal y numero de seguridad social hungaros) reflejan el foco inicial del proyecto en Hungría.

El entrenamiento combina multiples datasets publicos de deteccion de PII: `ai4privacy/pii-masking-openpii-1m` (un millon de ejemplos), `DataikuNLP/kiji-pii-training-data`, `Wismut/nym-pii-multilingual-data`, `E3-JSI/synthetic-multi-pii-ner-v1` y `subhash-holla/pii-anon`. No se ha publicado el numero total de tokens de entrenamiento ni los hiperparametros concretos. La version actual es v4.2, con la v2.0 disponible como revision de rollback (commit `95f612a9ad65cc5ade5b9248bd152020541e7097`).

## Capacidades

- Deteccion de diez tipos de entidad PII mediante etiquetado BIO con agregacion de spans y desplazamientos de caracteres exactos (`start`/`end`) sobre el texto original.
- Cobertura multilingue en 24 idiomas de la UE, con rendimiento mas contrastado en hungaro, ingles y aleman; incluye manejo de formas inflectadas del hungaro (el modelo etiqueta tokens, aunque el manejo completo de sufijos lo aporta PII Guard).
- Deteccion de identificadores nacionales hungaros especificos: adóazonosító jel (identificador fiscal) y TAJ (seguridad social).
- Deteccion de numeros de cuenta bancaria e IBAN, documentos de identidad, pasaporte y permiso de conduccion.
- Ejecucion local en CPU mediante el pipeline de `transformers`, con soporte de procesamiento por lotes (`batch_size`).
- No redacta texto, no procesa imagenes ni garantiza deteccion exhaustiva: devuelve spans que un sistema superior (como PII Guard) convierte en enmascarado reversible.

## Casos de uso

- Filtrado de prompts antes de un LLM: se intercala el modelo como detector en la pasarela de entrada para enmascarar PII en las consultas de usuarios antes de enviarlas a un modelo de lenguaje, evitando que datos personales salgan hacia APIs de terceros.
- Restauracion de respuestas: en combinacion con PII Guard, los placeholders reversibles permiten devolver al usuario los datos reales en la respuesta del LLM sin que el modelo externo los haya visto.
- Cumplimiento del RGPD en chatbots de atencion al cliente: empresas que procesan conversaciones con clientes europeos pueden detectar y proteger nombres, telefonos, correos y direcciones en 24 idiomas de la UE sin enviar datos fuera de sus servidores.
- Anonimizacion de logs y telemetria: limpieza de registros de aplicacion, transcripciones de soporte o datasets de entrenamiento antes de almacenarlos o compartirlos con terceros.
- Procesamiento de documentos en entornos on-premise: al ejecutarse en CPU, puede integrarse en pipelines de OCR y extraccion de datos en sectores regulados (banca, sanidad, administracion publica) sin infraestructura GPU.
- Moderacion de tool calling en agentes: como parte de la pasarela de PII Guard, inspecciona los argumentos de llamadas a herramientas antes de que el agente los envie a servicios externos.
- Deteccion de datos bancarios y fiscales hungaros: validacion y proteccion de identificadores nacionales (TAJ, adóazonosító jel) en flujos de trabajo administrativos hungaros, un caso poco cubierto por modelos NER genericos.
- Preparacion de datasets de ajuste fino: etiquetado automatico de PII en corpus multilingues para anonimizarlos antes de usarlos en entrenamiento de otros modelos.

## Benchmarks y rendimiento

No se han publicado en la informacion disponible las metricas numericas concretas de la evaluacion (la model card referencia los resultados en un documento externo de evaluaciones del repositorio). La metodologia declarada indica que se evalua con `pii-guard eval`, donde un valor se considera filtrado (*leak*) si cualquier parte del mismo llega al LLM sin enmascarar, y se mide tambien el *over-masking* (porcentaje de spans enmascarados que no eran datos personales). Las puntuaciones se midieron aplicando ventanado, ajuste de fronteras de palabra, manejo de sufijos hungaros y la capa de reglas, no con el pipeline basico de Transformers.

| Metrica | Valor |
|---|---|
| Resultados numericos publicados | no disponible (ver enlaces: docs/benchmarks.md del repositorio) |

## Requisitos de hardware

- VRAM/RAM estimada: unos 2,2 GB para los pesos en precision estandar; en CPU se recomienda disponer de al menos 4 GB de RAM libres para inferencia comoda.
- GPU recomendadas: no requiere GPU; esta diseñado para ejecutarse en CPU (`device=-1` en el pipeline). Si se desea acelerar, cualquier GPU con 4 GB de VRAM (por ejemplo una RTX 3060 o superior) es mas que suficiente.
- Consumer GPU: cabe sobradamente en practicamente cualquier GPU moderna de consumo; el caso de uso principal es CPU.
- Opciones de despliegue: libreria `transformers` (pipeline `token-classification`), integracion recomendada mediante PII Guard (con verificacion de checksum y capa de reglas). No se menciona soporte especifico para vLLM, llama.cpp, Ollama o TGI; al ser un encoder BERT-like, no es compatible con llama.cpp ni Ollama.
- Latencia: no disponible; al ser un modelo encoder de 278M parametros en CPU, se espera latencia baja por documento en textos cortos, aunque no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| watt-mind/pii-guard-ner-xlmr-base | 277M | XLM-RoBERTa encoder | 24 (foco en hu/en/de) | Apache-2.0 | 10 tipos de entidad, IDs hungaros, integracion con pasarela PII Guard |
| Microsoft mdeberta-v3-base (fine-tunes PII) | 278M (backbone DeBERTa-v3) | DeBERTa-v3 encoder | ~100 | MIT (base) | Mejor rendimiento general en NER, mas lento en CPU; requiere fine-tune propio para PII |
| ai4privacy/openpii (modelos derivados) | no disponible | varios | multilingue | varia | Mismo dataset principal de entrenamiento; sin capa de reglas ni pasarela asociada |
| Presidio (Microsoft, sin modelo propio) | no disponible | reglas + NER externo | configurable | MIT | Alternativa basada en reglas y regex; usa un NER externo (frecuentemente spaCy) en lugar de un modelo dedicado multilingue |

## Limitaciones y advertencias

- El modelo devuelve spans detectados, pero no redacta texto, no procesa imagenes ni garantiza que encuentre todos los datos personales; una puntuacion de confianza alta no es prueba de que un valor sea realmente un dato personal.
- El rendimiento en los 21 idiomas añadidos en v4.2 es menor que en hungaro, ingles y aleman, que son los idiomas mas probados; conviene validar la calidad en el idioma de despliegue.
- La longitud de entrada esta limitada por la ventana del encoder; para documentos largos hay que implementar ventanas solapantes y fusion de resultados manualmente (PII Guard lo hace de forma automatica).
- Los identificadores estructurados (IBAN, numeros de documento) requieren validacion por reglas (checksums, formatos); el modelo NER por si solo puede fallar en estos casos, y la capa de reglas de PII Guard tiene la ultima palabra.
- Riesgo de over-masking: enmascarar contenido que no es PII degrada la calidad de las respuestas del LLM; la metrica de over-masking debe monitorizarse en produccion.
- Riesgo de filtracion parcial: la evaluacion considera un fallo si cualquier parte de un valor llega sin enmascarar al LLM; en aplicaciones reguladas se recomienda no depender solo del modelo y anadir revision humana o reglas adicionales.
- Los ejemplos de la demo alojada deben usarse solo con datos ficticios.
- Licencia Apache-2.0: permite uso comercial, pero la atribucion de los datos de entrenamiento debe revisarse segun lo indicado en la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/watt-mind/pii-guard-ner-xlmr-base
- Organizacion Watt Mind en Hugging Face: https://huggingface.co/watt-mind
- Codigo fuente (PII Guard): https://github.com/watt-mind/pii-guard
- Evaluaciones y benchmarks: https://github.com/watt-mind/pii-guard/blob/develop/docs/benchmarks.md
- Demo alojada: https://guard.watt-mind.com
- Guia de integracion: https://github.com/watt-mind/pii-guard/blob/develop/docs/integrations.md
- Guia de API: https://github.com/watt-mind/pii-guard/blob/develop/docs/api.md
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-base
- Web de la empresa: https://watt-mind.com
