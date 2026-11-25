# TechnoBaptist/indra-ocr

## Resumen

Indra OCR 1.2.0 es un modelo de reconocimiento óptico de caracteres (OCR) orientado a la extracción de contenido estructurado de PDFs e imágenes, desarrollado por TechnoBaptist y publicado bajo el paraguas del proyecto Indra de Datalab. Su particularidad es que está diseñado para ejecutarse íntegramente en CPU mediante ONNX Runtime, sin necesidad de GPU, lo que lo hace apto para despliegues en servidores modestos, entornos locales o pipelines por lotes donde el coste por página es el factor dominante.

El modelo combina lectores específicos por tipo de script (incluida la transcripción de fórmulas matemáticas a LaTeX en línea, activada por defecto) con módulos de análisis de maquetación y tablas. Con 1.250.566 parámetros totales y un repositorio de apenas 0,1 GB, es un modelo muy compacto: no compite en escala con los grandes modelos multimodales, sino en eficiencia y especialización sobre documentos.

Su relevancia actual radica en que cubre un nicho concreto —parsing de documentos con estructura compleja sobre hardware sin acelerador— y lo hace con una métrica publicada sobre OmniParseBench 1.7.0 (2.937 páginas, 16.288 tests): 78,9 con el lector matemático activado y 71,6 desactivado. La licencia, sin embargo, es restrictiva: gratuita solo para investigación, uso personal y startups por debajo de un umbral de 5 millones de dólares.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo OCR especializado, exportado a ONNX) |
| Parametros totales | 1.250.566 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors y ONNX) |
| Idiomas soportados | no disponible |
| Licencia | datalab-openrail-m (gratuita para investigación, uso personal y startups por debajo de 5 M USD) |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo. Se sabe que se distribuye con `library_name: onnxruntime`, que los pesos están en safetensors y ONNX, y que el pipeline declarado es `image-to-text`. La model card describe un diseño funcional compuesto por "lectores específicos por script" junto con módulos de maquetación, tablas y LaTeX en línea, lo que sugiere una arquitectura modular de detección y reconocimiento más que un único transformer extremo a extremo. No se han publicado datos sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO.

El dato técnico más concreto es el rendimiento sobre OmniParseBench 1.7.0: 78,9 puntos con el lector matemático activado y 71,6 al desactivarlo con `load(math=False)`. La model card advierte explícitamente que desactivar el lector matemático no filtra los tests etiquetados como matemáticos, por lo que la caída de 7,3 puntos refleja el coste real de prescindir de esa capacidad. No se mencionan innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- OCR sobre PDFs e imágenes, con salida de texto estructurado.
- Lectores específicos por tipo de script, orientados a distintos alfabetos y sistemas de escritura.
- Análisis de maquetación (layout) para preservar la estructura del documento.
- Extracción de tablas.
- Reconocimiento de fórmulas matemáticas y conversión a LaTeX en línea, activado por defecto.
- Ejecución en CPU mediante ONNX Runtime, sin dependencia de GPU.
- Integración mediante el paquete `indra-ocr==1.2.0`.
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso ni modalidades de audio o vídeo.

## Casos de uso

- Digitalización masiva de archivos PDF en servidores sin GPU: al ejecutarse sobre ONNX Runtime en CPU, permite procesar lotes nocturnos de documentos en infraestructura estándar sin aprovisionar aceleradores.
- Extracción de tablas de informes financieros o científicos: el módulo de tablas convierte tablas impresas en PDF a estructuras reutilizables para su carga en bases de datos o hojas de cálculo.
- Conversión de artículos técnicos y académicos con fórmulas: el lector matemático en línea genera LaTeX directamente, lo que evita la transcripción manual de ecuaciones en publicaciones y apuntes.
- Construcción de pipelines RAG sobre corpus documentales: el OCR alimenta la fase de ingestión extrayendo texto y estructura de PDFs escaneados antes de la indexación vectorial.
- Procesamiento en el borde o en local: con 0,1 GB de repositorio y 1,25 M de parámetros, cabe en entornos con recursos muy limitados, incluidos portátiles y contenedores pequeños.
- Automatización de back-office documental: facturas, albaranes y formularios escaneados pueden parsearse por lotes con el paquete `indra-ocr` dentro de flujos de validación existentes.
- Investigación en parsing de documentos: la licencia gratuita para investigación y el benchmark público OmniParseBench lo hacen útil como línea base reproducible en experimentos académicos.

## Benchmarks y rendimiento

| Benchmark | Configuracion | Resultado |
|---|---|---|
| OmniParseBench 1.7.0 (2.937 paginas, 16.288 tests) | math activado | 78,9 |
| OmniParseBench 1.7.0 (2.937 paginas, 16.288 tests) | math desactivado (`load(math=False)`) | 71,6 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni comparativas numéricas con otros modelos OCR.

## Requisitos de hardware

- VRAM: no aplica; el modelo está pensado para inferencia en CPU mediante ONNX Runtime.
- RAM estimada: no disponible con precisión, aunque el repositorio completo ocupa 0,1 GB, por lo que la huella en memoria es reducida.
- GPU recomendadas: ninguna necesaria; no se documenta ruta de aceleración por GPU.
- Cabe en cualquier equipo consumer: portátiles, mini-PC y contenedores con CPU estándar.
- Opciones de despliegue: ONNX Runtime a través del paquete `indra-ocr==1.2.0`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Notas |
|---|---|---|---|---|---|
| Indra OCR 1.2.0 | 1.250.566 | no disponible | OCR documental en CPU (ONNX) | datalab-openrail-m (restrictiva) | 78,9 en OmniParseBench 1.7.0 con math |
| Alternativas OCR de la misma categoria | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada |

No se dispone de información suficiente para establecer una comparativa numérica fiable con otros modelos OCR; no se inventan cifras.

## Limitaciones y advertencias

- La model card reconoce dificultades persistentes en escritura manuscrita, tablas complejas y escaneos degradados.
- Desactivar el lector matemático reduce la puntuación de 78,9 a 71,6 y no elimina los tests de matemáticas del conjunto de evaluación, por lo que el ahorro de cómputo tiene un coste medible en calidad.
- Licencia restrictiva: gratuita solo para investigación, uso personal y startups por debajo de 5 M USD; el uso comercial fuera de esos supuestos requiere revisar los términos completos en el archivo LICENSE.
- El código del proyecto es Apache-2.0, pero los términos del modelo son distintos; conviene no confundir ambas licencias en producción.
- No se documentan los idiomas soportados, lo que impide garantizar cobertura multilingüe sin pruebas propias.
- Riesgo de alucinación en la transcripción de contenido: como todo modelo generativo aplicado a OCR, puede producir texto plausible pero incorrecto en regiones de baja calidad, por lo que se recomienda validación posterior en flujos críticos.
- Sin datos publicados sobre sesgos, contexto máximo ni latencia, la evaluación en producción debe hacerse empíricamente sobre el corpus objetivo.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta y fue creado y actualizado el mismo día (2026-11-24), por lo que carece de validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TechnoBaptist/indra-ocr
- Repositorio de código (Apache-2.0): https://github.com/datalab-to/indra
- Licencia del modelo: archivo LICENSE en el repositorio de Hugging Face
- OmniParseBench (referencia del benchmark): omni-parse-bench 1.7.0, citado en la model card
