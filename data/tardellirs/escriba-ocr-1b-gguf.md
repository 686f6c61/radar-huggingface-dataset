# tardellirs/Escriba-OCR-1B-GGUF

## Resumen

Escriba-OCR-1B-GGUF es un repositorio de pesos en formato GGUF publicado por el usuario tardellirs en Hugging Face. El nombre del modelo sugiere un sistema de reconocimiento óptico de caracteres (OCR) con aproximadamente 1.000 millones de parámetros, empaquetado en el formato GGUF que emplea llama.cpp para inferencia cuantizada en CPU y GPU de consumo. Sin embargo, la información pública disponible en la ficha de Hugging Face es extremadamente limitada: no se especifica licencia, idiomas soportados, pipeline de la librería Transformers ni detalles de arquitectura o entrenamiento.

La relevancia de este repositorio radica en su formato de distribución: GGUF permite ejecutar modelos en hardware modesto mediante cuantizaciones de 2 a 8 bits, lo que facilita el despliegue local de un modelo OCR de tamaño medio sin necesidad de GPUs de datacenter. No obstante, la ausencia de documentación técnica, métricas de evaluación y especificación de licencia implica que cualquier evaluación rigurosa debe realizarse empíricamente tras descargar los pesos.

Dado que no hay información publicada sobre el proceso de entrenamiento, los datos utilizados ni los resultados de benchmarks, esta ficha se limita a describir lo verificable desde el repositorio y a señalar explícitamente los datos no disponibles, sin inferir cifras que no puedan contrastarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre sugiere un transformer orientado a OCR, sin confirmar) |
| Parametros totales | aproximadamente 1B (inferido del nombre "1B", no confirmado en la ficha) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (variantes concretas no especificadas en la ficha) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF |
| Tamano del repositorio | no disponible |
| Pipeline declarado | no disponible |
| Descargas | 0 |
| Fecha de creacion | 2026-11-20 |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna del modelo en la ficha de Hugging Face. El sufijo "OCR" en el nombre indica que está orientado a tareas de reconocimiento de texto en imágenes, y el sufijo "GGUF" confirma que los pesos están empaquetados para su uso con llama.cpp y ecosistemas compatibles (Ollama, LM Studio, kobold.cpp, entre otros). No obstante, no se detalla si se trata de un transformer encoder-decoder, un modelo de visión-lenguaje (VLM) o una arquitectura híbrida.

Tampoco hay información sobre el volumen de tokens de entrenamiento, la composición del dataset, la existencia de fases de ajuste fino supervisado, RLHF o DPO, ni sobre innovaciones técnicas como decodificación especulativa o atención lineal. Todos estos datos deben considerarse no disponibles hasta que el autor publique documentación adicional o un model card completo.

## Capacidades

- Reconocimiento óptico de caracteres (OCR): el nombre del modelo indica extracción de texto a partir de imágenes, aunque no se especifica si cubre texto impreso, manuscrito, tablas o fórmulas.
- Generación de texto derivada de la transcripción: al ser un modelo de lenguaje subyacente de aproximadamente 1B de parámetros, podría producir texto estructurado a partir del contenido reconocido, si bien esto no está confirmado.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; la ficha no declara idiomas.
- Modo thinking, visión general, audio u otras capacidades especiales: no disponible.
- Ejecución local en CPU/GPU mediante llama.cpp: confirmado por el formato GGUF.

## Casos de uso

- Digitalización de documentos escaneados en entornos con requisitos de privacidad: al ejecutarse localmente en formato GGUF, el modelo permite procesar facturas, contratos o formularios sin enviar imágenes a servicios en la nube, lo que resulta adecuado para sectores regulados.
- Extracción de texto en estaciones de trabajo sin GPU dedicada: las cuantizaciones GGUF de un modelo de ~1B pueden ejecutarse en CPU con consumo de RAM moderado, lo que habilita el OCR en portátiles y equipos de oficina convencionales.
- Preprocesado en pipelines de documentos: integración como primer paso de un flujo que digitaliza PDFs escaneados antes de aplicar indexación semántica o búsqueda sobre el texto extraído.
- Automatización de archivo histórico: procesamiento por lotes de imágenes de archivos y bibliotecas para generar transcripciones revisables por personal humano.
- Asistencia a la accesibilidad: conversión de texto presente en imágenes (carteles, capturas, documentos fotografiados) a texto plano legible por lectores de pantalla, siempre que la calidad del OCR se valide empíricamente.
- Prototipado e investigación: base para experimentos de comparación de cuantizaciones GGUF en tareas OCR, dado el reducido tamaño del modelo y su facilidad de despliegue con llama.cpp u Ollama.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa para un modelo de ~1B en GGUF, las cuantizaciones de 4 bits suelen ocupar del orden de 0,6-1 GB y las de 8 bits alrededor de 1-1,5 GB, aunque estas cifras no están confirmadas para este repositorio concreto.
- GPU recomendadas: no disponibles. Por tamaño, cabría esperar compatibilidad con GPUs de consumo con 4-8 GB de VRAM (RTX 3050, RTX 4060, RTX 3060), pero no hay validación publicada.
- Cabe en GPU de consumo: probablemente sí, dado el tamaño nominal de 1B y el formato GGUF, aunque sin confirmación del autor.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y otros runners compatibles con GGUF. vLLM y TGI no son opciones nativas para GGUF sin conversión previa.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Escriba-OCR-1B-GGUF | ~1B (inferido) | no disponible | GGUF | no disponible | Hugging Face (0 descargas) |
| Alternativas OCR open source de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para establecer una comparativa rigurosa con alternativas concretas, ya que la ficha del modelo no declara arquitectura, licencia ni métricas que permitan emparejarlo con modelos comparables de la misma categoría.

## Limitaciones y advertencias

- Ausencia total de model card: no hay descripción de arquitectura, datos de entrenamiento ni evaluación, lo que impide valorar su calidad antes de probarlo.
- Licencia no especificada: no puede confirmarse si el uso comercial está permitido; en producción debe tratarse como licencia desconocida hasta que el autor la declare.
- Idiomas no declarados: se desconoce si el OCR cubre castellano, inglés u otras lenguas, y si maneja alfabetos no latinos.
- Riesgo de alucinación: como modelo generativo subyacente, podría producir texto no presente en la imagen; requiere validación con métricas de error (CER/WER) antes de uso crítico.
- Sesgos desconocidos: al no documentarse el dataset, no pueden evaluarse sesgos de dominio (manuscritos, tipografías, idiomas minoritarios).
- Repositorio sin tracción: 0 descargas y 1 like en la fecha de consulta, lo que reduce la probabilidad de que existan informes de terceros sobre su comportamiento real.
- Fecha de creación futura en la ficha (2026-11-20): conviene verificar la integridad del repositorio y la coherencia de los metadatos antes de confiar en él para flujos automatizados.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/tardellirs/Escriba-OCR-1B-GGUF
- No se han encontrado papers, blogs, repositorios de código ni demos asociados en la información proporcionada.
