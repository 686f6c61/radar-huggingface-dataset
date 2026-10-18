# swordenamine/llm_clinical_notes

## Resumen

`swordenamine/llm_clinical_notes` es un repositorio publicado en HuggingFace por el usuario `swordenamine` que se presenta como un pipeline de procesamiento de lenguaje natural clínico: toma notas médicas en texto libre y las convierte en recursos HL7 FHIR R4 (Condition, MedicationRequest, Observation, Procedure) con normalización a ICD-10, SNOMED-CT, RxNorm y LOINC. El problema que aborda es real y está bien documentado en la literatura: la carga administrativa de la documentación clínica, que la model card cifra en un 50 % del tiempo del facultativo y en 125 000 millones de dólares anuales solo en Estados Unidos.

Ahora bien, conviene ser preciso: por la información disponible, este repositorio **no es un modelo fundacional con pesos publicados**, sino un proyecto de software (código Python organizado en módulos `core/`, `fhir/`, `nlp/`, `pipeline/` y `api/`) que describe una arquitectura de extracción de entidades y mapeo a FHIR. La model card no indica modelo base, número de parámetros, longitud de contexto, datos de entrenamiento ni formato de pesos, y el repositorio acumula 0 descargas y 0 likes en el momento de la consulta.

Su relevancia potencial reside en el enfoque (NER clínico + detección de negación con NegEx + extracción temporal + validación de schema FHIR R4 + API REST con FastAPI), que es una combinación razonable para interoperabilidad sanitaria. Sin embargo, las cifras de rendimiento que declara (>92 % de accuracy en NER, 60 % de reducción de tiempo administrativo, 100 % de conformidad con el schema R4) no vienen acompañadas de conjuntos de evaluación, metodología ni artefactos reproducibles, por lo que deben tratarse como objetivos del autor y no como resultados verificados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible. La model card describe un pipeline de NLP (segmentación, NER médico, expansión de abreviaturas, mapeo de códigos, construcción y validación FHIR) sin especificar el modelo subyacente (transformer, reglas, híbrido) |
| Parámetros totales | No disponible |
| Parámetros activos | No aplica / no disponible (no se describe una arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (no se publican pesos) |
| Idiomas soportados | No disponibles. La model card menciona "Arabic medical notes (v1.1)" como idioma planificado; el texto de ejemplo está en inglés clínico abreviado |
| Licencia | No disponible en los metadatos de HuggingFace. La model card muestra una insignia "MIT", lo que supone una discrepancia con el campo de licencia del repositorio |
| Formato de pesos | No disponible. La estructura descrita corresponde a código Python (`.py`), no a artefactos `safetensors`, `GGUF` ni similares |

## Arquitectura y entrenamiento

La documentación describe una cadena de procesamiento en seis etapas: (1) segmentación en frases y secciones combinando reglas y componentes de machine learning; (2) reconocimiento de entidades nombradas con las categorías DIAGNOSIS, MEDICATION, VITAL, LAB_RESULT, PROCEDURE, NEGATION y TEMPORALITY; (3) expansión de abreviaturas mediante un diccionario de más de 400 entradas (`c/o` → "complaining of", `HTN` → "hypertension" con ICD-10 I10, `Trop I` → "troponin I" con LOINC 10839-9); (4) detección de negación con el algoritmo NegEx y extracción temporal ("x3d" → 3 días, "since Monday" → fecha); (5) extracción de relaciones del tipo `(Trop I) RISING → DIAGNOSIS(ACS)` o `(drug) TREATS (diagnosis)`; y (6) construcción, validación y serialización de recursos FHIR R4 en un Bundle JSON.

No se especifica en ningún momento qué modelo de lenguaje o componente de aprendizaje automático se emplea para el NER: la model card solo indica que la segmentación combina "rule-based + ML" y que el reconocimiento de entidades es "Medical NER". Tampoco se documentan el número de tokens de entrenamiento, la composición del corpus, si hubo ajuste fino supervisado, RLHF o DPO, ni el origen de los datos clínicos utilizados (lo que, tratándose de datos sanitarios, es una ausencia crítica desde el punto de vista de privacidad y trazabilidad). La única innovación técnica destacable descrita es la integración de la normalización terminológica y la validación de schema en el mismo pipeline, algo poco habitual en proyectos de este tamaño pero tampoco original respecto a herramientas consolidadas del sector.

## Capacidades

- Extracción de entidades clínicas en texto libre: diagnósticos, medicaciones con dosis y vía, constantes vitales, resultados de laboratorio y procedimientos.
- Normalización terminológica a ICD-10, SNOMED-CT, RxNorm y LOINC a partir de las entidades extraídas.
- Detección de negación (NegEx) para descartar hallazgos como "no fever" o "denies SOB" y evitar falsos positivos en el historial estructurado.
- Extracción temporal y de tendencias: interpretación de expresiones como "x3d", "since Monday" o "rising" aplicadas a resultados analíticos.
- Extracción de relaciones entre entidades (fármaco-trata-diagnóstico, hallazgo-tendencia-diagnóstico).
- Expansión de abreviaturas médicas con un diccionario declarado de más de 400 entradas.
- Generación de recursos FHIR R4 (Condition, MedicationRequest, Observation, Procedure) y ensamblado en Bundle.
- Validación del JSON resultante contra el schema FHIR R4.
- Exposición como servicio mediante un endpoint REST `/convert` implementado con FastAPI.
- Cobertura declarada de tres especialidades: medicina interna, cardiología y urgencias.
- No se documentan capacidades de tool calling, razonamiento multi-paso, agentes, visión ni audio.

## Casos de uso

- **Integración de notas libres en un EHR corporativo**: el pipeline recibe el texto de la nota, genera el Bundle FHIR R4 y lo entrega a sistemas como Epic, Cerner u OpenMRS a través del endpoint `/convert`. Es adecuado porque el output ya está validado contra el schema, lo que reduce el trabajo de mapeo en el equipo de integración.
- **Codificación automática para facturación y reporting**: la normalización a ICD-10 y SNOMED-CT permite derivar códigos de diagnóstico y procedimiento directamente del texto libre, lo que agiliza la facturación y la explotación estadística sin intervención manual línea a línea.
- **Construcción de cohortes para investigación clínica**: al convertir notas heterogéneas en recursos consultables, se pueden agregar pacientes por diagnóstico, fármaco o valor analítico; útil en estudios retrospectivos donde el texto libre es la única fuente disponible.
- **Alertas clínicas sobre tendencias analíticas**: la extracción temporal permite detectar patrones como una troponina I que sube de 0,8 a 2,1 y generar avisos de síndrome coronario agudo; encaja en servicios de urgencias con notas taquigráficas.
- **Reducción de carga documental en consulta**: el autor estima un ahorro de unos 18 minutos por nota; un servicio REST que devuelve estructura lista para revisión encaja en flujos donde el clínico valida en lugar de transcribir.
- **Auditoría y calidad de registros**: la validación de schema FHIR R4 permite usar el pipeline como paso de control previo al envío de datos a un repositorio central, detectando recursos mal formados antes de la ingesta.
- **Normalización entre servicios y especialidades**: la expansión de abreviaturas (por ejemplo, `cath` → "cardiac catheterisation", SNOMED 41976001) facilita que notas de distintos servicios sean comparables dentro de una misma historia clínica.
- **Despliegue en entornos con recursos limitados**: al no requerir un modelo de gran tamaño documentado, el enfoque (reglas + NER + diccionarios) es potencialmente ejecutable en CPU, lo que encaja en hospitales públicos con infraestructura modesta, como el escenario argelino que describe la model card.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card incluye afirmaciones de rendimiento sin metodología ni conjunto de evaluación asociado: ">92 % de accuracy en NER sobre benchmarks estándar", "100 % de conformidad con el schema FHIR R4" y "~60 % de reducción de tiempo administrativo por nota". No se indica qué benchmark estándar se emplea (no se nombran i2b2/n2c2, BC5CDR, MIMIC-III ni similares), ni el tamaño de la muestra, ni el intervalo de confianza. Estas cifras no deben citarse como resultados reproducibles.

| Métrica declarada | Valor | Estado |
|---|---|---|
| Accuracy NER | >92 % | No verificado; benchmark no especificado |
| Conformidad FHIR R4 | 100 % | No verificado; sin conjunto de validación descrito |
| Reducción de tiempo administrativo | ~60 % por nota | No verificado; sin estudio de usuario |
| Especialidades cubiertas | 3 | Declarado por el autor |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al no publicarse parámetros ni formato de pesos, no es posible estimar requisitos de memoria.
- GPU recomendadas: no disponible por el mismo motivo. Si el componente de NER fuese un transformer pequeño (rango BERT-base), cabría esperar ejecución en CPU o en GPUs de consumo como RTX 3060/4060; se trata de una hipótesis, no de un dato del repositorio.
- Compatibilidad con GPU de consumo: indeterminada. El diseño declarado (reglas, diccionarios, NegEx, mapeo de códigos) sugiere que la mayor parte del pipeline es CPU-friendly, pero el paso de NER no está especificado.
- Opciones de despliegue: la model card menciona un servidor FastAPI con endpoint `/convert`. No se documenta integración con vLLM, llama.cpp, Ollama, TGI ni TensorRT-LLM, lo que es coherente con la ausencia de pesos publicados.
- Latencia y throughput: no disponibles. No se aportan mediciones de tiempo por nota ni de peticiones por segundo.

## Comparativa con modelos similares

No se dispone de datos cuantitativos (parámetros, contexto, licencia verificada) del repositorio analizado, por lo que la comparación solo puede ser cualitativa. Se incluyen alternativas consolidadas en el ámbito de NER clínico y conversión a FHIR, con la advertencia de que sus cifras concretas deben consultarse en sus propias fuentes.

| Herramienta | Enfoque | Salida estructurada | Licencia | Estado de verificación |
|---|---|---|---|---|
| `swordenamine/llm_clinical_notes` | Pipeline NER + NegEx + mapeo de códigos + FHIR R4 | FHIR R4 Bundle | No disponible (insignia MIT en la model card) | Sin descargas ni likes; sin benchmarks reproducibles |
| MedCAT | NER clínico con modelos entrenados y linking a ontologías (SNOMED, UMLS) | Conceptos anotados; FHIR no nativo | No verificada en esta consulta | Proyecto con publicaciones y comunidad activa |
| scispaCy | NER biomédico basado en spaCy con modelos preentrenados | Entidades; requiere capa propia para FHIR | No verificada en esta consulta | Ampliamente usado en investigación |
| Suites comerciales de NLP clínico (por ejemplo, John Snow Labs) | Modelos proprietarios + pipelines de resolución de entidades | Múltiples, con módulos de healthcare | Comercial | Documentación y benchmarks publicados por el proveedor |

La diferencia principal es de madurez: las alternativas citadas cuentan con pesos descargables, conjuntos de evaluación públicos y comunidades activas, mientras que este repositorio, según la información disponible, describe una arquitectura sin artefactos verificables.

## Limitaciones y advertencias

- **Naturaleza del artefacto**: no se publican pesos ni modelo base; el repositorio parece contener código de una aplicación, no un modelo entrenado. Cualquier evaluación de rendimiento por parte del lector requerirá implementar o aportar el componente de NER.
- **Ausencia de datos de entrenamiento**: no se documentan corpus, número de tokens, procedencia de las notas ni procesos de anonimización, lo que impide valorar sesgos y cumplimiento normativo.
- **Afirmaciones sin respaldo**: las cifras de >92 % de accuracy y 60 % de ahorro de tiempo carecen de benchmark nombrado, tamaño de muestra y metodología.
- **Conflicto de licencia**: el campo de licencia de HuggingFace aparece como no disponible mientras la model card muestra la insignia MIT. Antes de cualquier uso comercial debe aclararse por escrito con el autor.
- **Inconsistencia temporal**: la fecha de creación (2026-10-17) es posterior a la de última actualización (2026-03-06), lo que sugiere metadatos erróneos o un repositorio reestructurado; conviene verificarlo.
- **Riesgo de alucinación en el mapeo de códigos**: la asignación automática de ICD-10/SNOMED/RxNorm/LOINC puede producir códigos plausibles pero incorrectos; se requiere validación humana en cualquier flujo clínico real.
- **Cobertura limitada**: solo tres especialidades declaradas (medicina interna, cardiología, urgencias); notas de otras áreas quedan fuera del alcance previsto.
- **Idiomas**: la model card está en inglés y el multilingüe es únicamente un plan de futuro (árabe en v1.1). No hay soporte declarado de castellano.
- **Cumplimiento regulatorio**: un sistema que procesa datos de salud con salida hacia un EHR puede caer bajo MDR en la UE y bajo HIPAA/RGPD en función del despliegue; no se menciona marcado CE, clasificación de riesgo ni evaluación de impacto.
- **Seguridad clínica**: no se describen mecanismos de abstención, umbrales de confianza ni detección de entradas fuera de distribución, elementos necesarios antes de cualquier uso asistencial.
- **Validación comunitaria nula**: 0 descargas y 0 likes implican ausencia de revisión por terceros.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/swordenamine/llm_clinical_notes
- No se han encontrado en la información proporcionada enlaces a papers, blogs, repositorios de código externos ni demos interactivas.
