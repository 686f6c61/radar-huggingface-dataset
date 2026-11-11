# szz124211572/Youtu-VL-4B-Instruct-GGUF

## Resumen

Youtu-VL-4B-Instruct es un modelo de visión y lenguaje (VLM) de 4.895 millones de parámetros desarrollado por Tencent Youtu Lab, construido sobre el modelo de lenguaje Youtu-LLM. Este repositorio concreto (`szz124211572/Youtu-VL-4B-Instruct-GGUF`) es una cuantización comunitaria en formato GGUF del modelo original `tencent/Youtu-VL-4B-Instruct`, publicada por un tercero y orientada a su ejecución con llama.cpp. No se trata por tanto del artefacto oficial de Tencent, sino de una conversión que hereda la licencia `youtu-vl` del modelo base.

Su propuesta técnica central es el paradigma VLUAS (Vision-Language Unified Autoregressive Supervision), que convierte las señales visuales en objetivos de supervisión autorregresiva mediante un codebook visual aprendido, en lugar de tratarlas únicamente como condiciones pasivas de entrada. Esto permite que un VLM de arquitectura estándar aborde tareas centradas en visión (grounding, detección, segmentación, estimación de profundidad, conteo de objetos, pose humana) sin módulos específicos por tarea.

Es relevante ahora por su relación rendimiento/tamaño: compite en tareas multimodales generales (VQA, razonamiento multimodal, matemáticas, OCR, comprensión multi-imagen, evaluación de alucinaciones y tareas de agente GUI) con solo 4B de parámetros, y su disponibilidad en GGUF facilita el despliegue local en hardware de consumo mediante llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-language con paradigma VLUAS (Vision-Language Unified Autoregressive Supervision); base Youtu-LLM |
| Parametros totales | 4.895.157.760 (~4,9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el ejemplo de llama-server usa `-n 12280`, pero no se documenta como longitud de contexto oficial) |
| Tipos de cuantizacion | GGUF (el ejemplo oficial usa Q8_0); resto de niveles no disponibles |
| Idiomas soportados | no disponible |
| Licencia | `youtu-vl` (license: other), con `extra_gated_eu_disallowed: true` |
| Formato de pesos | GGUF (repo de 15,9 GB); el modelo base está en safetensors |

## Arquitectura y entrenamiento

Youtu-VL se apoya en Youtu-LLM, un modelo de lenguaje ligero, y añade un codificador visual que proyecta las imágenes a un espacio de tokens multimodal. La innovación principal es VLUAS: en lugar de usar los features visuales solo como contexto de entrada, el modelo expande el léxico de texto con un codebook visual aprendido y trata los tokens visuales como objetivos de predicción autorregresiva. Al reconstruir conjuntamente tokens visuales y texto, se preserva información visual densa y se mitiga el sesgo de optimización dominado por el texto típico de los VLM convencionales.

La consecuencia arquitectónica es que imagen y texto reciben un estatus autorregresivo equivalente dentro de un VLM estándar, lo que habilita predicción visual densa (segmentación, profundidad) y predicción basada en texto (grounding, detección) sin cabezas ni módulos específicos por tarea. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO); la model card solo remite al informe técnico arXiv:2601.19798 y al paper de Youtu-LLM arXiv:2512.24618.

## Capacidades

- Generación de texto y respuesta a preguntas visuales (VQA) sobre imágenes.
- Razonamiento multimodal y resolución de problemas matemáticos con soporte visual.
- OCR (reconocimiento óptico de caracteres) en imágenes.
- Comprensión multi-imagen y de escenas del mundo real.
- Evaluación de alucinaciones visuales (detección de inconsistencias entre imagen y texto).
- Tareas de agente GUI a partir de capturas de pantalla.
- Capacidades centradas en visión en la versión Transformers: visual grounding, clasificación de imágenes, detección de objetos, segmentación por referencia, segmentación semántica, estimación de profundidad, conteo de objetos y estimación de pose humana.
- Nota importante: las tareas de predicción densa (segmentación y estimación de profundidad) **no están soportadas** en esta versión GGUF; requieren la versión Transformers original.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Asistente de accesibilidad: describir el contenido de imágenes o capturas para usuarios con discapacidad visual, aprovechando VQA y OCR en un modelo de 4B ejecutable localmente.
- Digitalización de documentos: extracción de texto de facturas, tickets o formularios mediante OCR y respuesta estructurada, con despliegue en llama.cpp sin dependencia de la nube.
- Automatización de agentes GUI: interpretar capturas de pantalla de aplicaciones de escritorio o web para generar el siguiente paso de una secuencia de interacción, gracias a las capacidades de agente GUI documentadas.
- Moderación y verificación de contenido visual: comprobar si el texto asociado a una imagen es coherente con lo mostrado, usando las capacidades de evaluación de alucinaciones del modelo.
- Análisis de imágenes en entornos con requisitos de privacidad: al poder ejecutarse en local vía GGUF, permite procesar imágenes sensibles (médicas, industriales, personales) sin enviarlas a servicios externos.
- Prototipado rápido de producto multimodal: un equipo puede validar flujos de VQA, OCR o razonamiento sobre imágenes con un único modelo de 4B antes de invertir en modelos mayores.
- Educación y tutoría: resolver problemas matemáticos o de razonamiento a partir de fotografías de enunciados, combinando OCR y razonamiento multimodal.
- Investigación en visión por computador (con la versión Transformers): experimentar con grounding, detección o conteo de objetos sin añadir módulos específicos, aunque para segmentación y profundidad habría que usar el modelo original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numéricos en la información disponible. La model card incluye gráficas de rendimiento en tareas centradas en visión y en tareas multimodales generales, pero los valores concretos no se han proporcionado en el texto, por lo que no se reproducen aquí.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa por tamaño (4,9B parámetros), las cuantizaciones de 8 bits rondarían los 5-6 GB de pesos y las de 4 bits los 3 GB, pero no se confirman valores concretos en la información proporcionada.
- GPU recomendadas: no disponible. El despliegue documentado es vía llama.cpp, que permite ejecución en CPU y GPU.
- GPU de consumo: el tamaño del modelo (4,9B) es compatible en principio con GPUs de consumo de gama media-alta con suficiente VRAM, pero no se especifican modelos concretos ni requisitos mínimos.
- Opciones de despliegue: llama.cpp (documentado, con `llama-server` y cuantización Q8_0 de ejemplo); el modelo base Transformers requiere su propio stack para tareas densas.
- Latencia y throughput: no disponibles.
- Parámetros de inferencia sugeridos en el ejemplo oficial: `--image-max-tokens 2048`, `--temp 0.1`, `--top-p 0.001`, `--repeat-penalty 1.05`, `-n 12280`.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Este repositorio es una cuantización comunitaria de un tercero (`szz124211572`), no el artefacto oficial de Tencent; la calidad de la conversión GGUF no está avalada por el autor original.
- Las tareas de predicción densa (segmentación y estimación de profundidad) no funcionan en esta versión GGUF; hay que usar la versión Transformers.
- Licencia `youtu-vl` con restricción explícita `extra_gated_eu_disallowed: true`: el acceso parece restringido para la Unión Europea, lo que condiciona su uso comercial y su despliegue en esa región. Conviene revisar el texto completo de la licencia antes de cualquier uso en producción.
- No se documentan idiomas soportados, por lo que el comportamiento multilingüe es incierto.
- No se documenta la longitud de contexto oficial, lo que dificulta planificar cargas con documentos o conversaciones largas.
- Riesgo de alucinación: la propia model card incluye evaluación de alucinaciones como tarea, lo que indica que el fenómeno está presente y debe mitigarse en producción.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Al ser un modelo de 4B, es previsible una menor robustez en razonamiento complejo o contextos muy largos frente a modelos mayores, aunque no hay datos que lo cuantifiquen aquí.

## Enlaces

- Repositorio GGUF: https://huggingface.co/szz124211572/Youtu-VL-4B-Instruct-GGUF
- Modelo base (Transformers): https://huggingface.co/tencent/Youtu-VL-4B-Instruct
- GGUF oficial de Tencent: https://huggingface.co/tencent/Youtu-VL-4B-Instruct-GGUF
- Licencia: https://huggingface.co/tencent/Youtu-VL-4B-Instruct-GGUF/blob/main/LICENSE.txt
- Código: https://github.com/TencentCloudADP/youtu-vl
- Página del proyecto: https://youtu-tip.com/#llm
- Informe técnico (Youtu-VL): https://arxiv.org/abs/2601.19798
- Paper de Youtu-LLM: https://arxiv.org/abs/2512.24618
