# viperfoundation/MedPsy-1.7B-MLX-4bit

## Resumen

MedPsy-1.7B-MLX-4bit es una conversión cuantizada a 4 bits en formato MLX del modelo médico qvac/MedPsy-1.7B, desarrollado originalmente por Tether AI Research (QVAC). La conversión la publica viperfoundation para su uso en dispositivo dentro de Viper Messenger, empleando `mlx_lm.convert -q --q-bits 4 --q-group-size 64`. Los pesos no se han modificado más allá de la cuantización, por lo que las capacidades del modelo son las del original.

El modelo parte de una arquitectura de tipo Qwen3 (según los tags del repositorio) con 1.720.574.976 parámetros totales y un tamaño de repositorio de 1,0 GB, lo que lo sitúa en la franja de modelos pequeños orientados a ejecución local. Está especializado en dominio médico y entrenado únicamente para inglés y entrada de texto.

Su relevancia actual radica en que permite desplegar un asistente médico de 1,7B parámetros en hardware de consumo mediante el stack de Apple (MLX), a costa de las limitaciones propias de un modelo de este tamaño y de un aviso explícito del autor original: no sustituye a un profesional sanitario, no debe usarse en emergencias y puede dar respuestas erróneas o incompletas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3, según tags del repositorio); detalles de capas y atención no disponibles |
| Parámetros totales | 1.720.574.976 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 4 bits, group size 64 (MLX); no se documentan otras variantes en este repo |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato MLX), librería `mlx` |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base más allá de su pertenencia a la familia Qwen3, indicada en los tags del repositorio. Se trata, por tanto, de un transformer decoder-only, pero no se especifican número de capas, dimensión oculta, mecanismo de atención ni configuración de cabezas. Tampoco se documenta si incorpora innovaciones como atención lineal, decodificación especulativa o modos de razonamiento extendido.

Respecto al entrenamiento, la model card de esta conversión remite explícitamente a la del modelo original (qvac/MedPsy-1.7B) para los detalles de datos, evaluación y proceso de ajuste, y no reproduce esa información. Sí se indica que parte de los datos de entrenamiento originales están bajo licencia CC-BY-NC 4.0, lo que condiciona el uso comercial pese a que los pesos se distribuyan con Apache 2.0. No se dispone de datos sobre número de tokens, composición del dataset ni si hubo RLHF, DPO u otras etapas de alineamiento.

## Capacidades

- Generación de texto en inglés orientada a contenido médico y educativo.
- Respuesta a preguntas de dominio sanitario a partir de entrada exclusivamente textual.
- Conversación multi-turno (capacidad heredada del modelo base; no se documenta la ventana de contexto).
- Ejecución en dispositivo mediante MLX, sin necesidad de servidor ni API externa.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explícito.
- No dispone de capacidades de visión ni audio.
- No es multilingüe: solo inglés.
- No está diseñado como herramienta de salud mental ni de terapia.

## Casos de uso

- Asistente médico embebido en aplicación de mensajería: el modelo se integra en Viper Messenger para ofrecer respuestas informativas de salud en local, sin enviar datos del usuario a un servidor, gracias a su ejecución on-device con MLX.
- Consulta de información sanitaria de referencia: puede responder preguntas generales sobre síntomas, terminología médica o conceptos básicos, siempre con aviso visible de que la salida es generada por IA y no sustituye a un profesional.
- Educación para pacientes: generación de explicaciones divulgativas en inglés sobre condiciones o tratamientos, útil en materiales de alfabetización sanitaria.
- Apoyo a estudiantes de ciencias de la salud: resolución de dudas conceptuales y generación de resúmenes de temario en inglés, aprovechando su ajuste al dominio médico.
- Prototipado de productos sanitarios: al ser un modelo de 1,7B en 4 bits y 1,0 GB de repositorio, permite validar flujos de conversación médica en un portátil Apple antes de escalar a modelos mayores.
- Filtro o primera capa de triaje informativo: clasificación y reformulación de consultas médicas en inglés dentro de un pipeline, con derivación obligatoria a un profesional para cualquier decisión clínica.
- Demostraciones y pruebas de concepto de IA local en salud: su licencia Apache 2.0 y su tamaño reducido facilitan experimentación académica sin infraestructura de GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/espacio en disco: el repositorio ocupa 1,0 GB en cuantización 4 bits, por lo que la inferencia requiere del orden de 1 a 2 GB de memoria unificada, dependiendo de la longitud de contexto y del runtime.
- Hardware objetivo: equipos Apple Silicon (M1, M2, M3, M4 y posteriores) con memoria unificada, dado que el formato es MLX y la librería declarada es `mlx`.
- GPU NVIDIA: no aplicable directamente; MLX está orientado a Apple Silicon. Para CUDA sería necesario reconvertir los pesos a otro formato.
- GPU de consumo: cabe holgadamente en cualquier Mac con 8 GB o más de memoria unificada; no se proporcionan datos para GPUs consumer tipo RTX 4090 porque el formato no es compatible de forma nativa.
- Despliegue: `mlx_lm` (generación y servidor), y ecosistema MLX en general. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI para estos pesos concretos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| MedPsy-1.7B-MLX-4bit (este) | 1,72B | no disponible | Apache 2.0 (datos parciales CC-BY-NC 4.0) | safetensors MLX 4 bits | Solo inglés, dominio médico, on-device |
| qvac/MedPsy-1.7B (base) | 1,72B | no disponible | Apache 2.0 (datos parciales CC-BY-NC 4.0) | safetensors | Pesos sin cuantizar; referencia de calidad |
| Alternativas médicas de ~1-2B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada |

No se dispone de información suficiente para establecer una comparativa cuantitativa con modelos de la misma categoría.

## Limitaciones y advertencias

- No sustituye a un médico: el autor original advierte explícitamente que no debe usarse en emergencias y que puede ofrecer respuestas erróneas o incompletas.
- No es una herramienta de salud mental ni de terapia.
- Solo procesa texto y solo en inglés; no admite otros idiomas ni entradas multimodales.
- Riesgo de alucinación relevante en dominio clínico, donde un error puede tener consecuencias graves.
- Licencia: los pesos son Apache 2.0, pero parte de los datos de entrenamiento originales están bajo CC-BY-NC 4.0, lo que puede restringir el uso comercial del modelo derivado. Conviene revisar la model card original antes de un despliegue comercial.
- La model card original indica que el modelo es para fines de investigación y educativos.
- Obligación de mostrar avisos visibles al usuario indicando que la salida es generada por IA y no sustituye el consejo médico profesional.
- Al ser una cuantización a 4 bits, puede producirse una degradación adicional de calidad respecto al modelo base, no cuantificada en la información disponible.
- No se documentan sesgos específicos, pero un modelo entrenado principalmente con datos en inglés puede reflejar sesgos poblacionales y culturales de esas fuentes.
- El repositorio no registra descargas ni interacciones, por lo que no hay evidencia comunitaria de validación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/viperfoundation/MedPsy-1.7B-MLX-4bit
- Modelo base: https://huggingface.co/qvac/MedPsy-1.7B
- Documentación de MLX: no disponible en la información proporcionada
- Paper, blog o demo: no disponible en la información proporcionada
