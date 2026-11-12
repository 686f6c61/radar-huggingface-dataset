# srish327/deberta-v3-skillspan-crf

## Resumen

deberta-v3-skillspan-crf es un modelo de extraccion de entidades (token classification) especializado en identificar menciones de habilidades ("skills") y conocimientos ("knowledge") en ofertas de empleo en ingles. Lo desarrolla el usuario srish327 como un fine-tuning de microsoft/deberta-v3-base sobre el corpus SkillSpan, y su valor diferencial es que anade una capa CRF sobre dos cabezas BIO independientes, lo que permite modelar solapamientos entre spans de skill y de knowledge (el 4,4 % de los spans de knowledge aparecen dentro de un span de skill).

El modelo resuelve un problema concreto de RR. HH. y de analitica de mercado laboral: la extraccion estructurada de competencias a partir de texto libre de ofertas de empleo, donde las fronteras de los spans son difusas y las taxonomias no estan cerradas. Con 183,8 millones de parametros y una longitud de contexto de 256 tokens durante el entrenamiento, es un modelo compacto y desplegable en una sola GPU de consumo.

Es relevante ahora porque demuestra que anadir un CRF a un encoder DeBERTa-v3-base mejora de forma medible (F1 0,645 ± 0,005 frente a 0,625 ± 0,005 sin CRF en la media de tres semillas) el estado de referencia en SkillSpan, con un coste de entrenamiento de unos 8 minutos en una T4 de Kaggle. El checkpoint publicado corresponde a la semilla 43, seleccionada por validacion, con F1 de 0,6316 en test.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder DeBERTa-v3-base con dos cabezas lineales BIO (SKILL y KNOWLEDGE) y capa CRF de cadena lineal por cabeza |
| Parametros totales | 183.836.190 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens (longitud maxima usada en entrenamiento; no se declara contexto nativo ampliado) |
| Tipos de cuantizacion | no disponible (repo en safetensors fp32; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | ingles (en) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (mas fichero `skillex_crf.json` con las transiciones CRF aprendidas) |

## Arquitectura y entrenamiento

El modelo parte del encoder DeBERTa-v3-base y le superpone dos cabezas lineales de etiquetado BIO, una para SKILL y otra para KNOWLEDGE. La duplicacion de cabezas es una decision de diseno justificada por el solapamiento de spans: un esquema BIO unico no puede representar que un fragmento sea simultaneamente parte de una skill y de un knowledge. Sobre cada cabeza se aplica un CRF de cadena lineal restringido a las posiciones de primer subword, con la transicion `O → I` prohibida de forma explicita. La funcion de perdida es la suma de las log-verosimilitudes negativas de ambos CRF.

El entrenamiento usa el dataset SkillSpan (jjzha/skillspan), compuesto por ofertas de empleo en ingles de dominios tecnico y domestico. Hiperparametros declarados: 5 epocas, learning rate 3e-5, batch de 32, warmup del 10 %, weight decay 0,01, longitud maxima de 256 tokens, pesos en fp32 con autocast fp16. La mejor epoca se elige por F1 CRF en validacion y el test se evalua una sola vez. El coste computacional es de aproximadamente 8 minutos en una unica GPU T4 de Kaggle. No se documenta uso de RLHF ni DPO; es un fine-tuning supervisado puro sobre anotaciones de spans.

## Capacidades

- Extraccion de spans de habilidad (skill), incluidas habilidades blandas como "mentor junior engineers".
- Extraccion de spans de conocimiento (knowledge), como "Python" o "AWS".
- Modelado de solapamiento entre spans de skill y knowledge gracias a las dos cabezas independientes.
- Decodificacion CRF con restricciones de transicion (Viterbi sobre las transiciones aprendidas), lo que evita secuencias de etiquetas invalidas.
- Procesamiento de texto en ingles exclusivamente.
- Token classification a nivel de primer subword, con agregacion posterior a spans de caracteres.
- No soporta tool calling, function calling, agentes, vision, audio ni modo de razonamiento extendido.

## Casos de uso

- Enriquecimiento de bolsas de empleo: extraer automaticamente las competencias requeridas de cada oferta para construir indices de busqueda facetados y taxonomias de skills, aprovechando que el modelo distingue entre conocimiento tecnico y habilidad blanda.
- Analisis de mercado laboral: procesar corpus masivos de ofertas para medir la demanda de tecnologias concretas a lo largo del tiempo, con la ventaja de que el CRF reduce falsos positivos por transiciones invalidas de etiquetas.
- Matching candidato-oferta: generar representaciones estructuradas de las competencias de una oferta y compararlas con el perfil de un candidato, usando los spans extraidos como features en un sistema de ranking.
- Normalizacion de taxonomias internas de RR. HH.: mapear el texto libre de las ofertas a un catalogo controlado de competencias, donde la distincion skill/knowledge ayuda a separar requisitos tecnicos de competencias transversales.
- Investigacion en NLP aplicado a RR. HH.: servir de baseline reproducible para experimentos de extraccion de entidades con solapamiento, ya que el autor publica codigo, configuracion y comparativas multi-semilla.
- Preprocesado para sistemas de recomendacion de formacion: identificar las skills demandadas en una oferta para sugerir itinerarios de aprendizaje, con la cautela de que la cobertura fuera del dominio SkillSpan decae.
- Anonimizacion y auditoria de descripciones de puesto: detectar menciones de tecnologias o competencias para revisar sesgos en el lenguaje de las ofertas antes de su publicacion.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split de test de SkillSpan (exact span-match F1). El checkpoint publicado corresponde a la semilla 43:

| Metrica | Valor |
|---|---|
| F1 global (span exact match, CRF) | 0,6316 |
| F1 skill | 0,5371 |
| F1 knowledge | 0,7178 |

Comparativa multi-semilla declarada en la model card (media ± desviacion tipica):

| Modelo | Decodificacion | Semillas | F1 | F1 skill | F1 knowledge |
|---|---|---|---|---|---|
| bert-base-cased | Viterbi | 2 | 0,558 ± 0,004 | no disponible | no disponible |
| jobbert-base-cased | Viterbi | 3 | 0,598 ± 0,007 | no disponible | no disponible |
| deberta-v3-base | Viterbi | 3 | 0,625 ± 0,005 | 0,540 | 0,697 |
| deberta-v3-base + CRF (esta configuracion) | CRF | 3 | 0,645 ± 0,005 | 0,565 | 0,713 |
| SkillSpan paper, JobBERT + CRF (Zhang et al., 2022) | CRF | 5 | 0,597 | 0,561 | 0,639 |

El autor advierte que la metrica combinada del paper sigue Benikova et al. (2014), por lo que la comparacion es cercana pero no identica, y que su reproduccion de JobBERT (0,598) coincide con el numero del paper (0,597).

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, los 183,8 M de parametros ocupan aproximadamente 0,74 GB de pesos; con activaciones y overhead de runtime, el consumo tipico se situa en torno a 1,5-2,5 GB para batches pequenos y secuencias de 256 tokens. En fp16 el peso de los parametros baja a unos 0,37 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; el autor entreno en una unica T4. Para throughput alto, A100 o H100 con batches grandes.
- Cabe en GPU de consumo: si, en GTX 1650/1660, RTX 3050/3060/4060/4090 y equivalentes.
- Opciones de despliegue: al ser un modelo de token classification con cabezas CRF personalizadas, no funciona con el `pipeline` estandar de transformers; requiere el decodificador `skillex` del repositorio del autor. Es compatible con endpoints de Hugging Face (tag `endpoints_compatible`) y con inferencia via `transformers` cargando el modelo y aplicando Viterbi sobre `skillex_crf.json`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada. El dato de entrenamiento (8 minutos en T4 para 5 epocas) sugiere un coste de inferencia bajo, pero no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | F1 SkillSpan (test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| deberta-v3-skillspan-crf | 183,8 M | 256 tokens | 0,6316 (checkpoint); 0,645 ± 0,005 (media 3 semillas) | apache-2.0 | Hugging Face + repo GitHub |
| deberta-v3-base (fine-tuned, sin CRF) | ~184 M | 256 tokens | 0,625 ± 0,005 | apache-2.0 (base) | no disponible como checkpoint SkillSpan publicado |
| jobbert-base-cased | ~110 M | 256 tokens | 0,598 ± 0,007 | no disponible | no disponible |
| bert-base-cased | ~110 M | 256 tokens | 0,558 ± 0,004 | apache-2.0 (base) | no disponible |

La ventaja medible frente a DeBERTa-v3-base sin CRF es de unos 2 puntos de F1 en la media de tres semillas, y de unos 4,7 puntos frente a JobBERT. El coste es la necesidad de un decodificador no estandar.

## Limitaciones y advertencias

- Entrenado unicamente con ofertas de empleo en ingles de dominio tecnico y domestico (SkillSpan); se espera una caida de recall en otros dominios o registros.
- Los spans de skill son largos y difusos: el F1 de fronteras para skills (~0,56) es notablemente inferior al de knowledge (~0,71). El acuerdo entre anotadores humanos en este dataset es de kappa ~0,70-0,75, lo que acota el techo practico de la tarea.
- Riesgo de alucinacion de spans: al ser un modelo extractivo, no genera texto, pero puede marcar como skill fragmentos que no lo son, especialmente en textos fuera de distribucion.
- No esta destinado a decisiones automatizadas de contratacion; el autor lo declara explicitamente.
- Solo ingles; no hay soporte multilingue.
- La longitud de contexto efectiva es de 256 tokens, insuficiente para ofertas largas sin troceado previo.
- Requiere un decodificador especifico (`skillex`) y el fichero de transiciones CRF; el `pipeline` estandar de transformers no reproduce los resultados.
- El checkpoint publicado es una unica semilla (43) elegida por validacion; la varianza entre semillas es baja (±0,005) pero conviene tenerla en cuenta.
- Licencia apache-2.0, permisiva para uso comercial, sin restricciones adicionales declaradas mas alla de las del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/srish327/deberta-v3-skillspan-crf
- Demo (Space): https://huggingface.co/spaces/srish327/skill-extractor
- Codigo, entrenamiento, experimentos y CI: https://github.com/MSR327/skillspan-ner
- Dataset SkillSpan: https://huggingface.co/datasets/jjzha/skillspan
- Modelo base: https://huggingface.co/microsoft/deberta-v3-base
- Paper SkillSpan (Zhang, Jensen, Sonniks, Plank, NAACL 2022): no disponible en la informacion proporcionada
