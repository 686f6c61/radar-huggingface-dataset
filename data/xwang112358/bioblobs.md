# xwang112358/BioBlobs

## Resumen

BioBlobs es un modelo de clasificación funcional de enzimas desarrollado por Xin Wang, Kaiwen Shi y Carlos Oliver (Oliver Laboratory), presentado en el artículo *Unsupervised discovery of Functional Substructures* (NeurIPS 2026). El modelo predice la clase de tercer nivel del número EC (Enzyme Commission), un total de 242 categorías, a partir de embeddings de residuos congelados de ESM2-T30 y de la estructura tridimensional de la proteína. Su relevancia radica en que, pese a entrenarse únicamente con etiquetas a nivel de proteína, el mecanismo interno (los "blobs" espaciales en los que descompone la proteína) señala regiones que coinciden con sitios catalíticos candidatos, lo que lo convierte en una herramienta de interpretabilidad además de clasificación.

Arquitectura y tamaño: el modelo es compacto, con 14.730.740 parámetros totales (aproximadamente 59 MB en safetensors). No es un modelo de lenguaje: no genera texto ni mantiene conversaciones, sino que opera sobre representaciones de proteínas. La innovación principal es la descomposición de cada proteína en 8 blobs espacialmente locales cuyos embeddings se cuantizan mediante *residual vector quantization* (RVQ), lo que permite atribuir la predicción a subestructuras concretas.

El modelo está pensado para investigadores en biología computacional y enzimiología que necesiten anotar funciones enzimáticas y, al mismo tiempo, obtener pistas sobre qué regiones de la proteína sustentan esa predicción. Su licencia MIT facilita la reutilización, aunque su alcance está acotado a las 242 clases EC vistas en entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible con detalle; codificador sobre embeddings congelados de ESM2-T30 con descomposición en 8 blobs espaciales y residual vector quantization (RVQ) |
| Parametros totales | 14.730.740 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no es un modelo de contexto textual; procesa proteínas de hasta 1.000 residuos en entrenamiento) |
| Tipos de cuantizacion | No disponible (los pesos se distribuyen en safetensors sin cuantizar) |
| Idiomas soportados | No disponible (modelo biológico, no lingüístico) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`, ~59 MB) |

## Arquitectura y entrenamiento

BioBlobs parte de embeddings de residuos congelados generados por ESM2-T30 y de la estructura proteica (AlphaFold DB v6). Cada proteína se divide en 8 blobs espacialmente locales; los embeddings de cada blob se cuantizan con residual vector quantization, lo que produce una representación discreta y atribuible a regiones concretas de la estructura. Sobre esa representación se entrena un clasificador que predice la clase EC de tercer nivel (242 clases). La innovación clave es que la supervisión es únicamente a nivel de proteína (la etiqueta EC), sin anotaciones de residuos catalíticos, y aun así los blobs con mayor importancia tienden a coincidir con sitios catalíticos candidatos.

Datos de entrenamiento: enzimas de Swiss-Prot del conjunto de entrenamiento de EC-Bench, con estructuras de AlphaFold DB v6. Se conservaron proteínas de hasta 1.000 residuos con número EC de tercer nivel completo, y el split entre entrenamiento y validación se hizo al 30 % de identidad de secuencia con MMseqs2. El repositorio de GitHub incluye los identificadores de entrenamiento y validación. No se especifica en la información disponible el número exacto de tokens ni si hubo etapas de RLHF/DPO (no aplicables a este tipo de modelo).

## Capacidades

- Predicción de la clase EC de tercer nivel (242 clases) a partir de estructura proteica y embeddings de ESM2-T30.
- Descomposición interpretable en 8 blobs espaciales por proteína, con puntuaciones de importancia por blob.
- Ranking de residuos por relevancia para la predicción (puntuaciones por residuo).
- Identificación de sitios catalíticos candidatos mediante los blobs de mayor importancia, sin supervisión a nivel de residuo.
- Salida de las clases EC principales ordenadas por probabilidad (softmax).
- Procesamiento de proteínas de hasta 1.000 residuos (límite del entrenamiento).
- No soporta tool calling, function calling, agentes ni generación de texto.
- No dispone de capacidades multilingües ni de visión en el sentido habitual; su entrada es estructura proteica.

## Casos de uso

- Anotación funcional de enzimas: dado un conjunto de estructuras PDB, el modelo asigna las clases EC de tercer nivel más probables, útil para priorizar candidatos en proyectos de anotación genómica.
- Descubrimiento de sitios catalíticos: las puntuaciones por residuo y por blob permiten señalar regiones candidatas a catalizar la reacción, que luego pueden validarse experimentalmente o con análisis estructural adicional.
- Cribado de proteínas no caracterizadas: procesar lotes de estructuras con `inference.py --pdb-dir` para obtener rankings EC y detectar posibles funciones enzimáticas no descritas.
- Estudio de interpretabilidad en modelos biológicos: analizar qué blobs sostienen cada predicción para investigar la relación entre estructura local y función enzimática.
- Validación cruzada con anotaciones existentes: contrastar las predicciones EC con bases de datos como Swiss-Prot para detectar discrepancias que merezcan revisión.
- Reproducción y extensión metodológica: el repositorio incluye `docs/REPRODUCE.md` para reentrenar y evaluar en M-CSA, lo que permite adaptar la metodología a otros conjuntos de etiquetas funcionales.
- Docencia e investigación en bioinformática estructural: usar el modelo como ejemplo práctico de cuantización de embeddings y atribución espacial en proteínas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy reducida; los pesos ocupan ~59 MB, por lo que el modelo cabe holgadamente en cualquier GPU consumer (incluso con pocos GB de VRAM). El coste principal proviene de ESM2-T30 y de los pasos de preprocesado estructural, no del clasificador.
- GPU recomendadas: cualquier GPU moderna con al menos unos pocos GB de VRAM; para lotes grandes conviene una GPU con más memoria (por ejemplo, RTX 4090, A100 o H100) por el coste de calcular embeddings de ESM2-T30.
- Cabe en GPU consumer: sí, en cualquier GPU consumer actual; el limitante es el modelo base de embeddings y el tamaño del lote.
- Opciones de despliegue: el repositorio oficial proporciona `inference.py` con `uv`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (clasificación EC con interpretabilidad estructural) ni sus métricas.

## Limitaciones y advertencias

- El modelo solo conoce las 242 clases EC presentes en sus datos de entrenamiento; no puede predecir clases fuera de ese conjunto.
- Las probabilidades de clase son puntuaciones softmax, no confianza calibrada; no deben interpretarse como probabilidades calibradas.
- Que un blob se solape con residuos catalíticos anotados es evidencia a favor, no prueba, de su papel en la catálisis.
- Entrenado con proteínas de hasta 1.000 residuos; proteínas más largas pueden quedar fuera de su régimen de uso previsto.
- Depende de la calidad de las estructuras de AlphaFold DB v6 y de los embeddings de ESM2-T30; errores en la estructura pueden propagarse a la predicción.
- No es un modelo de lenguaje: no genera texto, no responde preguntas y no soporta agentes ni tool calling.
- Aunque la licencia es MIT, conviene revisar las licencias de los datos y modelos base (ESM2, AlphaFold DB, Swiss-Prot) para uso comercial en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xwang112358/BioBlobs
- Paper (arXiv): https://arxiv.org/abs/2510.01632
- Código: https://github.com/OliverLaboratory/BioBlobs
- Conjunto de datos EC-Bench: https://github.com/dsaeedeh/EC-Bench
