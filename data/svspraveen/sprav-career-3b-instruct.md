# SVSPraveen/SPrav-Career-3B-Instruct

## Resumen

SPrav-Career-3B-Instruct es un ajuste fino (fine-tuning) de dominio del modelo Qwen2.5-Coder-3B-Instruct, publicado por el desarrollador independiente SVS Praveen dentro de su ecosistema "SPrav Job AI". El modelo está diseñado específicamente para tareas de búsqueda de empleo: optimización de currículos para sistemas ATS (Applicant Tracking Systems), redacción de correos de contacto en frío a perfiles ejecutivos y preparación de negociaciones salariales. Se presenta como un modelo "soberano y anclado al dominio", es decir, optimizado para ejecutarse en local sin depender de APIs externas.

Técnicamente es un transformer denso de 3.085.938.688 parámetros (aproximadamente 3,09 B), derivado de la familia Qwen 2.5, con licencia Apache 2.0 y soporte únicamente de inglés. El autor indica que el ajuste se realizó mediante Rank-Stabilized LoRA (rsLoRA) seguido de alineación con Direct Preference Optimization (DPO), sobre un currículo procedimental de más de 500 combinaciones que abarca 15 disciplinas de ingeniería.

Su relevancia es limitada pero concreta: el repositorio no registra descargas ni "me gusta" en el momento de la consulta, y todas las métricas de rendimiento publicadas son autoinformadas por el autor, sin verificación independiente. Resulta útil como ejemplo de fine-tuning de dominio muy estrecho sobre un modelo pequeño, y como opción práctica para despliegue local en GPU de gama de entrada, pero no debe confundirse con un modelo de propósito general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen 2.5, basado en Qwen2.5-Coder-3B-Instruct) |
| Parámetros totales | 3.085.938.688 (~3,09 B) |
| Parámetros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible en la model card; el modelo base Qwen2.5-Coder-3B-Instruct soporta 32.768 tokens nativos (ampliable a 131.072 con YaRN según la documentación de Qwen) |
| Tipos de cuantización | GGUF Q4_K_M (4 bits, variante Medium) publicado en el repositorio; el resto de niveles GGUF no se detallan |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (qwen2.5-coder-3b-instruct.Q4_K_M.gguf) y pesos Transformers/safetensors; tamaño del repositorio 1,9 GB |
| Modelo base | unsloth/Qwen2.5-Coder-3B-Instruct-bnb-4bit |
| Pipeline | text-generation |
| Contexto conversacional | Sí (etiqueta "conversational", compatible con endpoints) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen 2.5 Coder en su variante de 3 B de parámetros, un transformer denso con atención por pares de consultas agrupadas (GQA) y tokenizador BPE con vocabulario amplio, orientado originalmente a generación y edición de código. El autor no documenta modificaciones estructurales sobre esa base: el trabajo consiste en ajuste de parámetros, no en un rediseño arquitectónico. El proceso declarado combina una fase de ajuste supervisado mediante Rank-Stabilized LoRA (rsLoRA), una variante de LoRA que reescala los factores de bajo rango para estabilizar el entrenamiento con rangos altos, seguida de una fase de alineación con Direct Preference Optimization (DPO) sobre pares de preferencia.

Los datos de entrenamiento se describen como un "currículo procedimental combinatorio" de más de 500 elementos que cubre 15 disciplinas de ingeniería, orientado a generar bullets de currículo medibles en formato Google XYZ ("Accomplished [X], as measured by [Y], by doing [Z]"), correos de contacto ejecutivo y argumentarios de negociación salarial. No se especifica el número de tokens de entrenamiento, la composición exacta del dataset, el número de pares de preferencia usados en DPO ni la mezcla entre datos sintéticos y reales. No se mencionan innovaciones de inferencia como decodificación especulativa, atención lineal o modos de razonamiento extendido.

## Capacidades

- Generación de texto en inglés orientada a contenido profesional de carrera: bullets de currículo, cartas de presentación y resúmenes profesionales.
- Optimización para ATS: reescritura de logros con métricas cuantificables (porcentajes, importes, latencias, QPS) y palabras clave alineadas con la oferta.
- Redacción de correos de contacto en frío a perfiles ejecutivos (reclutadores, hiring managers, C-level).
- Preparación y guionizado de negociaciones salariales, incluyendo argumentarios de compensación.
- Adhesión declarada al formato Google XYZ, con métricas explícitas en cada bullet.
- Filtrado de lenguaje corporativo vacío ("passionate team player", "spearheaded synergy"), según la métrica de "pureza anti-cliché" del autor.
- Conversación multi-turno (etiqueta "conversational"), lo que permite iterar sobre un mismo currículo u oferta.
- Capacidades heredadas del base Qwen2.5-Coder-3B: generación y comprensión de código, aunque el ajuste de dominio puede haber degradado esta faceta.
- No se documenta soporte de tool calling / function calling en esta versión.
- No se documenta soporte de agentes, razonamiento multi-paso explícito, visión, audio ni modo "thinking".
- Multilingüismo: no. El modelo se declara únicamente en inglés.

## Casos de uso

- Optimización de currículos para ofertas concretas: se introduce el texto actual del CV y la descripción del puesto, y el modelo reescribe cada bullet en formato XYZ con métricas y palabras clave alineadas con el ATS, aprovechando su entrenamiento específico en este formato.
- Reescritura de logros vagos en resultados medibles: instrucciones del tipo "[XYZ_BULLET] Rewrite for Senior Staff SRE" convierten frases genéricas en resultados cuantificados, que es exactamente el caso mostrado en la model card.
- Generación de correos de contacto ejecutivo: redacción de mensajes breves y personalizados para reclutadores o responsables de contratación, partiendo de los datos del candidato y del contexto de la empresa.
- Preparación de negociaciones salariales: construcción de argumentarios con datos de mercado, justificación de la banda salarial y respuestas anticipadas a objeciones habituales de compensación.
- Adaptación de un mismo perfil a distintos sectores: dado que el entrenamiento cubre 15 disciplinas de ingeniería, permite reformular la experiencia hacia el vocabulario de cada sector sin reentrenar nada.
- Procesamiento por lotes de candidaturas en local: al caber en unos 2,2 GB de VRAM en Q4_K_M, se puede ejecutar en un portátil con GPU de 8 GB para procesar cientos de variantes de CV sin enviar datos personales a servicios en la nube.
- Herramienta privada para consultoras de recolocación: despliegue en la infraestructura del cliente, con la ventaja de que la licencia Apache 2.0 permite uso comercial y modificación sin obligaciones de publicación.
- Generación de plantillas internas de CV y guías de carrera para un departamento de RR. HH., aprovechando la coherencia de formato forzada por el ajuste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye MMLU, HumanEval, GSM8K, MT-Bench ni ninguna otra evaluación estandarizada, ni comparaciones verificables con modelos de referencia.

El autor declara haber superado "pruebas de estrés cuantitativas automatizadas" sobre 5 dominios de ingeniería, con estos resultados autoinformados:

| Métrica (autoinformada) | Puntuación declarada | Objetivo | Definición según el autor |
|---|---|---|---|
| Anti-Cliché Purity | 100,0 % | 100 % | Ausencia total de relleno corporativo ("passionate team player", "spearheaded synergy") |
| Metric Grounding | 100,0 % | 100 % | Cada bullet de logro está anclado en una métrica cuantificada (%, $, ms, QPS) |
| Format Compliance | 100,0 % | 100 % | Adherencia exacta a la fórmula Google XYZ |

Advertencia: estas cifras proceden exclusivamente de la model card del autor, no están acompañadas de metodología, conjunto de evaluación, código de reproducción ni revisión por terceros, y por tanto no deben tratarse como resultados comparables a benchmarks públicos.

## Requisitos de hardware

- VRAM en GGUF Q4_K_M: aproximadamente 2,2 GB según el autor. El archivo GGUF pesa unos 1,93 GB.
- VRAM en FP16/BF16 (pesos safetensors): del orden de 6,2 GB solo para pesos (2 bytes por parámetro × 3,09 B), más overhead de activaciones y caché KV; en la práctica, entre 7 y 9 GB según longitud de contexto y tamaño de lote.
- VRAM en cuantizaciones de 8 bits: del orden de 3,5 a 4 GB para pesos, más overhead.
- GPU recomendadas por el autor: NVIDIA RTX 4050, 4060 o 5060 para portátil (8 GB), que ejecutan el modelo con holgura en Q4_K_M.
- Cabe en GPU de consumo: sí. Con Q4_K_M funciona en cualquier GPU con 4 GB o más de VRAM y en Mac con 16 GB de memoria unificada.
- Rendimiento declarado: 85-110 tokens por segundo en GPU móviles NVIDIA con el modelo completamente descargado en GPU (n_gpu_layers=-1).
- Opciones de despliegue: Ollama (el autor proporciona el comando `ollama run hf.co/SVSPraveen/SPrav-Career-3B-Instruct`), llama-cpp-python, y cualquier runtime GGUF compatible. Al conservar pesos Transformers, también es desplegable con vLLM o TGI, aunque no se documentan configuraciones probadas con estos servidores.
- Latencia: no disponible más allá del throughput en tokens por segundo indicado.

## Comparativa con modelos similares

La información pública de los modelos comparados se refiere a sus especificaciones oficiales, no a resultados medidos en esta ficha.

| Modelo | Parámetros | Contexto | Licencia | Especialización | Disponibilidad |
|---|---|---|---|---|---|
| SPrav-Career-3B-Instruct | 3,09 B | No indicado en la model card; base de 32.768 tokens | Apache 2.0 | Carrera profesional (ATS, outreach, compensación), solo inglés | GGUF Q4_K_M y safetensors; 0 descargas registradas |
| Qwen2.5-Coder-3B-Instruct (base) | 3,09 B | 32.768 tokens nativos (131.072 con YaRN) | Apache 2.0 | Código y propósito general, multilingüe | Ampliamente desplegado y verificado |
| Qwen2.5-3B-Instruct | ~3,1 B | 32.768 tokens nativos (131.072 con YaRN) | Apache 2.0 (salvo la variante 3B, con licencia Qwen propia según versión) | Propósito general, multilingüe | Muy extendido |
| Llama-3.2-3B-Instruct | 3,2 B | 128.000 tokens | Llama 3.2 Community License (no OSI, con restricciones) | Propósito general, multilingüe | Muy extendido |
| Phi-3.5-mini-instruct | 3,8 B | 128.000 tokens | MIT | Propósito general, razonamiento y código | Muy extendido |

Comparativa de rendimiento: no disponible. No existen evaluaciones independientes que permitan situar a SPrav-Career-3B-Instruct frente a estas alternativas en tareas estándar, y las únicas métricas publicadas son las tres autoinformadas de la model card. En la práctica, su ventaja diferencial solo puede contrastarse frente a alternativas de propósito general mediante evaluación propia sobre tareas de CV y outreach.

## Limitaciones y advertencias

- Métricas no verificadas: los tres valores del 100 % son autoinformados, sin metodología, dataset de evaluación ni código reproducible. No deben citarse como evidencia de rendimiento.
- Adopción nula: 0 descargas y 0 "me gusta" en el momento de la consulta, sin evidencia de uso en producción ni informes de terceros.
- Riesgo de alucinación agravado por el dominio: al forzar métricas cuantificadas en cada bullet, el modelo puede inventar cifras plausibles (porcentajes de mejora, importes, latencias) si el usuario no las aporta. Es imprescindible verificar cada número generado.
- Sesgo de formato: el ajuste hacia la fórmula Google XYZ y el rechazo de lenguaje corporativo puede producir textos repetitivos o poco naturales, y penalizar sectores donde ese formato no es el estándar.
- Dominio muy estrecho: está especializado en carrera profesional. Su utilidad fuera de CV, outreach y negociación salarial es limitada, y es probable que haya degradado capacidades generales del modelo base, incluida la generación de código.
- Idioma único: solo inglés. No hay soporte declarado de castellano ni de ningún otro idioma, lo que obliga a generar en inglés y traducir después si se necesita otro idioma.
- Contexto: la model card no especifica la longitud de contexto soportada tras el ajuste; conviene asumir la del base (32.768 tokens) y validar el comportamiento con documentos largos antes de usarlo en producción.
- Formato del repositorio: aunque el autor proporciona pesos safetensors, el artefacto principal es un GGUF Q4_K_M; la cuantización de 4 bits introduce pérdida de precisión no medida por el autor.
- Licencia: Apache 2.0 permite uso comercial, modificación y redistribución sin obligación de publicar cambios, pero se heredan las condiciones del modelo base Qwen2.5-Coder-3B-Instruct; conviene revisar la licencia de Qwen aplicable a la versión concreta del base.
- Fecha de publicación anómala: el repositorio indica creación y actualización en septiembre de 2026, dato que puede reflejar un error de marca temporal del autor o de la plataforma.
- Sin soporte de tool calling ni de agentes documentado: si el caso de uso requiere integración con herramientas o razonamiento multi-paso, no hay garantías.
- Recomendación para producción: tratar el modelo como un generador de borradores asistido, con revisión humana obligatoria de todos los datos cuantitativos y de cualquier afirmación sobre experiencia profesional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SVSPraveen/SPrav-Career-3B-Instruct
- Perfil del autor en GitHub: https://github.com/SVSPraveen
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-Coder-3B-Instruct-bnb-4bit
- Modelo original de la familia: https://huggingface.co/Qwen/Qwen2.5-Coder-3B-Instruct
- Documentación de Unsloth (mencionada en las etiquetas del modelo): https://github.com/unslothai/unsloth
- Resultados de la búsqueda web: la búsqueda no devolvió enlaces técnicos relevantes sobre este modelo (papers, blogs, repositorios o demos). No disponible.
