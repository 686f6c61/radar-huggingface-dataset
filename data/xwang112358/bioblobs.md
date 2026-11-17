# xwang112358/BioBlobs

## Resumen

BioBlobs es un modelo de clasificación de enzimas desarrollado por Xin Wang, Kaiwen Shi y Carlos Oliver (Oliver Laboratory), presentado en el paper "Unsupervised discovery of Functional Substructures" (NeurIPS 2026). El modelo predice la clase EC (Enzyme Commission) de tercer nivel de una proteína, con un total de 242 clases posibles, a partir de embeddings de residuos congelados de ESM2-T30 y de la estructura tridimensional de la proteína. Su interés principal no es solo la clasificación, sino la interpretabilidad: el modelo descompone cada proteína en 8 "blobs" espacialmente locales y los cuantiza con vector quantization residual, de modo que los blobs con mayor peso apuntan a candidatos de sitios catalíticos aunque el entrenamiento solo utilice etiquetas a nivel de proteína.

Con 14,7 millones de parámetros, BioBlobs es un modelo compacto pensado como herramienta de análisis biológico más que como un LLM generativo. No genera texto ni mantiene conversaciones: es un clasificador especializado que produce, para cada proteína, un ranking de clases EC, un ranking de blobs por importancia con sus números de residuo y puntuaciones por residuo. Es relevante ahora porque demuestra que es posible descubrir subestructuras funcionales de forma no supervisada a partir de etiquetas débiles a nivel de proteína, un problema abierto en biología computacional.

El modelo se distribuye bajo licencia MIT, con pesos en safetensors de 59 MB, y requiere el repositorio de código asociado para la inferencia, ya que no expone un pipeline estándar de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Clasificador sobre embeddings congelados de ESM2-T30 con vector quantization residual (RVQ) sobre blobs espaciales |
| Parametros totales | 14.730.740 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (opera sobre proteínas de hasta 1.000 residuos) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, 59 MB) |
| Idiomas soportados | no disponible (modelo biológico, no lingüístico) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

BioBlobs no es un transformer generativo al uso: parte de embeddings de residuos congelados extraídos con ESM2-T30 y de la estructura de la proteína (estructuras AlphaFold DB v6). Cada proteína se divide en 8 blobs espacialmente locales, y los embeddings de cada blob se cuantizan mediante vector quantization residual (RVQ) con k=8. Sobre esa representación cuantizada se entrena un clasificador que predice la clase EC de tercer nivel entre 242 posibles. La innovación clave es que la supervisión es débil: solo se usan etiquetas de clase EC a nivel de proteína, sin anotaciones de residuos catalíticos, y aun así los blobs con mayor importancia tienden a coincidir con sitios catalíticos anotados.

Los datos de entrenamiento provienen de enzimas de Swiss-Prot incluidas en el conjunto de entrenamiento de EC-Bench, con estructuras de AlphaFold DB v6. Se mantuvieron proteínas de hasta 1.000 residuos con número EC de tercer nivel completo, y la partición entre entrenamiento y validación se hizo a un 30% de identidad de secuencia usando MMseqs2. Los identificadores de entrenamiento y validación están disponibles en el repositorio de GitHub. No se indica en la información disponible si hubo RLHF, DPO ni otras fases de ajuste.

## Capacidades

- Predicción de clase EC de tercer nivel entre 242 clases a partir de secuencia y estructura de proteína.
- Descomposición de la proteína en 8 blobs espacialmente locales con puntuaciones de importancia por blob.
- Ranking de residuos por puntuación, útil para localizar candidatos de sitios catalíticos.
- Interpretabilidad no supervisada: los blobs relevantes señalan subestructuras funcionales sin haber sido entrenados con anotaciones de residuos.
- Salida estructurada por proteína: top de clases EC, blobs ordenados por importancia con números de residuo y puntuaciones por residuo.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No tiene modo thinking, visión ni audio.

## Casos de uso

- Anotación funcional de enzimas: dado un conjunto de estructuras PDB, el modelo produce un ranking de clases EC que puede priorizar la revisión manual en proyectos de anotación de genomas o proteomas.
- Descubrimiento de sitios catalíticos candidatos: las puntuaciones por residuo y el ranking de blobs permiten seleccionar regiones de la proteína para experimentos de mutagénesis dirigida.
- Cribado de proteínas no caracterizadas: en pipelines de biología computacional, se puede ejecutar sobre estructuras AlphaFold para filtrar candidatos antes de ensayos experimentales.
- Análisis de interpretabilidad de modelos biológicos: sirve como banco de pruebas para estudiar cómo la cuantización de representaciones espaciales se correlaciona con función biológica.
- Validación de estructuras predichas: comparar las predicciones sobre estructuras experimentales frente a estructuras AlphaFold puede revelar regiones sensibles a errores de plegado.
- Docencia e investigación en bioinformática: el repositorio incluye instrucciones de reproducción y evaluación sobre M-CSA, lo que facilita su uso en cursos y trabajos de fin de máster.
- Estudio comparativo de subestructuras funcionales: al ser un método no supervisado, permite contrastar sus blobs con anotaciones catalíticas de M-CSA para evaluar el descubrimiento automático de motivos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; los pesos ocupan 59 MB en safetensors y el modelo tiene 14,7 millones de parámetros, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; una RTX 3060, RTX 4090 o incluso CPU son suficientes para la inferencia del clasificador.
- Cabe en consumer GPU: sí, en prácticamente cualquier GPU moderna e incluso en CPU para lotes pequeños.
- El cuello de botella real no es el clasificador, sino la extracción de embeddings con ESM2-T30 y la carga de estructuras, que requieren más memoria que el propio BioBlobs.
- Opciones de despliegue: el repositorio oficial usa `uv`, `hf download` y `python inference.py`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BioBlobs | 14,7 M | Proteínas de hasta 1.000 residuos | Clasificación EC de tercer nivel (242 clases) con interpretabilidad por blobs | MIT | Hugging Face + GitHub |
| ESM2-T30 | no disponible en esta ficha | no disponible | Embeddings de proteína de propósito general | no disponible | Hugging Face |
| EC-Bench (referencia de datos) | no aplica | no disponible | Benchmark de clasificación EC | no disponible | GitHub |

No se dispone de datos de rendimiento comparativo entre BioBlobs y alternativas en la información proporcionada, por lo que la comparación se limita a parámetros, tarea y licencia.

## Limitaciones y advertencias

- El modelo solo conoce las 242 clases EC presentes en sus datos de entrenamiento; no puede predecir clases fuera de ese conjunto.
- Las probabilidades de clase son puntuaciones softmax, no confianza calibrada; no deben interpretarse como probabilidades fiables sin calibración adicional.
- Que un blob se solape con residuos catalíticos anotados es evidencia a favor, no prueba, de su papel en la catálisis.
- No es un modelo generativo ni conversacional: no admite prompts en lenguaje natural ni tool calling.
- No se documentan sesgos específicos, pero al entrenarse con Swiss-Prot y AlphaFold DB hereda los sesgos de cobertura taxonómica y de calidad estructural de esas bases de datos.
- Riesgo de alucinación en el sentido de asignar clases EC con alta puntuación a proteínas que no pertenecen a ninguna de las 242 clases conocidas.
- La licencia MIT permite uso comercial, pero el modelo depende de ESM2-T30 y de estructuras AlphaFold DB, cuyas licencias deben verificarse por separado.
- Requiere el repositorio de GitHub para la inferencia; no hay pipeline estándar de Hugging Face, lo que añade fricción para producción.
- El modelo está pensado para investigación biológica; no debe usarse como única fuente para decisiones experimentales o clínicas.

## Enlaces

- Hugging Face: https://huggingface.co/xwang112358/BioBlobs
- Paper (arXiv): https://arxiv.org/abs/2510.01632
- Código: https://github.com/OliverLaboratory/BioBlobs
- Dataset de referencia EC-Bench: https://github.com/dsaeedeh/EC-Bench
