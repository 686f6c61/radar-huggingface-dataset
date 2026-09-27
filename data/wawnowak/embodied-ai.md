# Wawnowak/embodied-ai

## Resumen

Wawnowak/embodied-ai no es un modelo de lenguaje entrenado, sino un repositorio de notas de investigación sobre inteligencia artificial encarnada (embodied AI) publicado por Wawnowak (Anna Nowak, según su perfil público de HuggingFace) bajo licencia cc-by-4.0. El artefacto principal es `summary.md`, acompañado de un `README.md`, y su contenido declarado es un conjunto estructurado de notas con referencias de evaluación, hipótesis, comprobaciones de reproducibilidad y preguntas abiertas, manteniendo explícitamente separados los planes de los resultados ya completados.

El repositorio ocupa 0,0 GB y no contiene ningún checkpoint funcional: los metadatos de safetensors declaran 49.600 parámetros totales, un volumen que corresponde a un tensor de utilería o a un residuo de indexación, no a un modelo utilizable. La model card lo declara de forma explícita: "no reclama mejoras de benchmark, ablaciones completadas, código publicado ni un checkpoint entrenado". Las etiquetas incluyen `transformer`, pero no se documenta arquitectura de red, datos de entrenamiento, tokenizador ni ventana de contexto.

Su relevancia es, por tanto, documental y no técnica: sirve como punto de partida bibliográfico o como plantilla de notas reproducibles para quien investiga en robótica, visión-lenguaje-acción (VLA) o modelos de mundo aplicados a agentes físicos. Para cualquier tarea de inferencia, generación de texto o control de políticas, este repositorio no es un candidato válido y debe descartarse en favor de modelos con pesos y documentación reales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | etiquetada como "transformer" en los metadatos de HuggingFace; no se describe ninguna arquitectura de red en la model card |
| Parametros totales | 49.600 (dato de los metadatos de safetensors); el repositorio no contiene un checkpoint entrenado |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | cc-by-4.0 |
| Formato de pesos | safetensors (según las etiquetas del repositorio); tamaño del repo 0,0 GB |
| Tipo de artefacto | notas de investigación (`summary.md` y `README.md`) |
| Etiquetas declaradas | research-notes, embodied-ai, transformer, safetensors, region:us |
| Descargas / likes | 0 / 0 |
| Creado / actualizado | 27 de septiembre de 2026 (ambas marcas de tiempo) |

## Arquitectura y entrenamiento

No se ha publicado información sobre arquitectura de red, configuración de capas, mecanismos de atención, tokenizador ni estrategia de entrenamiento. La model card no menciona número de tokens de entrenamiento, composición del dataset, fases de ajuste (SFT, RLHF, DPO) ni innovaciones técnicas como decodificación especulativa o atención lineal. La etiqueta `transformer` procede de los metadatos automáticos del repositorio y no está respaldada por documentación alguna en el texto del autor.

El propio README enmarca el contenido como exploratorio: describe el alcance de la pregunta de investigación, confundidores probables, una comparación propuesta con baselines emparejados, comprobaciones de reproducibilidad, modos de fallo y preguntas abiertas. Indica que las secciones etiquetadas como planes o hipótesis no deben interpretarse como resultados experimentales y que, si en el futuro se añaden resultados, deberán incluir versiones de dataset, comandos, semillas, hardware y registros en bruto. A la fecha de los metadatos no consta ninguno de esos elementos.

## Capacidades

- Generación de texto: no disponible; el repositorio no incluye pesos de un modelo generativo.
- Razonamiento, código y matemáticas: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; no se declara ningún idioma.
- Capacidades especiales (modo de pensamiento, visión, audio): no disponible.
- Capacidad real del artefacto: servir como documento de referencia estructurado sobre embodied AI, con referencias y preguntas abiertas separadas de los planes.
- Trazabilidad: el README fija un protocolo explícito para añadir resultados futuros (versiones de dataset, comandos, semillas, hardware y logs), lo que resulta reutilizable como plantilla metodológica.

## Casos de uso

- Revisión bibliográfica inicial en embodied AI: el `summary.md` enumera el alcance de la pregunta de investigación, confundidores probables y referencias del tema, por lo que funciona como punto de entrada antes de construir una búsqueda sistemática propia.
- Diseño de un protocolo experimental con baselines emparejados: las notas proponen una comparación con baselines emparejados, útil como borrador de sección de metodología para un artículo o tesis en robótica o VLA.
- Plantilla de notas reproducibles: el repositorio documenta qué metadatos deben acompañar a un resultado (versiones de dataset, comandos, semillas, hardware, logs en bruto), un formato directamente adaptable a un repositorio de investigación propio.
- Auditoría de afirmaciones en trabajos de embodied AI: la separación explícita entre planes, hipótesis y resultados completados sirve como lista de comprobación para detectar afirmaciones no respaldadas en otros artefactos.
- Catalogación de modos de fallo: las notas recogen modos de fallo y comprobaciones de reproducibilidad, material aprovechable para construir una taxonomía de errores en políticas encarnadas.
- Docencia o seminario interno: el documento puede usarse como lectura breve para introducir el vocabulario y las preguntas abiertas del área antes de pasar a papers con resultados.
- Gestión de licencias en investigación: el README advierte de revisar por separado los términos de los datos de origen cuando el repositorio se use junto a datasets externos, algo aplicable como recordatorio en flujos de trabajo con datos de terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card declara de forma literal que el repositorio no reclama mejoras de benchmark ni ablaciones completadas, y no existe ningún checkpoint que pueda evaluarse en MMLU, HumanEval, GSM8K ni en suites de embodied AI como VLN, VLA o SLAM.

## Requisitos de hardware

- VRAM para inferencia: no aplica; no hay pesos de modelo que cargar.
- GPU recomendadas: no aplica; el artefacto se lee como texto plano.
- GPU de consumo: no aplica; cualquier equipo capaz de abrir dos ficheros Markdown es suficiente.
- Almacenamiento: el repositorio ocupa 0,0 GB, por lo que el clonado completo es inmediato.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica; ninguna de estas herramientas puede servir el repositorio porque no contiene un grafo de computación ni un tokenizador.
- Latencia y throughput: no disponibles; no existen.
- Si el objetivo es desplegar un sistema de embodied AI en producción, este repositorio no aporta ningún componente ejecutable y habría que recurrir a otros artefactos.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables, porque el artefacto no es un modelo sino un conjunto de notas: carece de parámetros activos, contexto, pesos y métricas, de modo que cualquier comparación numérica con modelos VLA, de robótica o de lenguaje sería inválida.

| Criterio | Wawnowak/embodied-ai | Alternativas comparables |
|---|---|---|
| Categoría | notas de investigación sobre embodied AI | no disponible |
| Parametros | 49.600 declarados en metadatos, sin checkpoint asociado | no disponible |
| Longitud de contexto | no disponible | no disponible |
| Rendimiento en benchmarks | no publicado | no disponible |
| Licencia | cc-by-4.0 | no disponible |
| Ejecutable en inferencia | no | no disponible |

## Limitaciones y advertencias

- No es un modelo: no se puede invocar, generar texto, ejecutar tool calling ni controlar un agente; cualquier intento de cargarlo como tal fallará.
- No contiene checkpoint entrenado, código, datos ni resultados experimentales, según declara el propio autor.
- Riesgo de cita incorrecta: al estar alojado en HuggingFace con la etiqueta `transformer` y una cifra de parámetros, puede confundirse con un modelo real y citarse como evidencia de resultados que nunca se obtuvieron.
- Contenido intencionadamente exploratorio: mezcla planes, hipótesis y preguntas abiertas; las afirmaciones no están verificadas por terceros.
- Sin validación de la comunidad: 0 descargas y 0 likes en el momento de los metadatos, y sin revisión por pares conocida.
- Idiomas no declarados, por lo que no puede garantizarse la cobertura ni la calidad de las referencias para lectores no anglófonos.
- Licencia cc-by-4.0: permite uso comercial y obras derivadas con atribución, pero el propio README advierte de que los términos de los datos de origen deben revisarse por separado cuando se combinen con datasets externos.
- Ausencia de sesgos evaluados: no hay análisis de sesgo, robustez ni alucinación porque no existe un modelo subyacente que evaluar.
- Fechas de metadatos idénticas para creación y actualización, lo que sugiere una carga única sin mantenimiento posterior.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Wawnowak/embodied-ai
- Perfil del autor en HuggingFace: https://huggingface.co/Wawnowak
- Otro repositorio del mismo autor: https://huggingface.co/Wawnowak/model_685814141_dino_base
- White paper sobre embodied AI en el SAE World Congress 2026: https://arxiv.org/html/2605.10653v1
- World Action Models: The Next Frontier in Embodied AI: https://arxiv.org/abs/2605.12090
- Embodied AI Daily, recopilación diaria de papers de arXiv (VLN, VLA, SLAM, 3D): https://luohongkun.top/Embodied-AI-Daily/index.html
- Documentación adicional del modelo (papers, blogs o demos propios): no disponible.
