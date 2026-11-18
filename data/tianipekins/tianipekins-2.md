# tianipekins/TianiPekins

## Resumen

TianiPekins es un repositorio publicado en Hugging Face bajo el identificador `tianipekins/TianiPekins`. A pesar de su nombre y de estar alojado en la plataforma, la model card no describe un modelo de lenguaje: su contenido es la página personal y profesional de Tiani Pekins Ebika, ingeniero de software e investigador en IA en la Universidad de Buea (Camerún) y fundador de LAB 237. No se documenta arquitectura, número de parámetros, tokenizador, datos de entrenamiento ni pesos utilizables.

El autor trabaja en procesamiento de lenguaje natural para lenguas africanas de bajos recursos y con alternancia de código, y mantiene una línea de investigación sobre evaluación de transferencia entre variedades de inglés pidgin camerunés y camfranglais (referencia `arXiv:2611.17573`, correspondiente al recurso CamSpokenNLI). Su tesis de máster aborda el ajuste fino de modelos de lenguaje pequeños para traducción texto-a-SQL en contextos multilingües y de bajos recursos.

La relevancia de esta ficha es, por tanto, limitada: el repositorio no constituye un artefacto desplegable ni evaluable como modelo. Cualquier dato técnico de inferencia, contexto o benchmarks debe considerarse no disponible, y no se recomienda su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles, segun metadatos del repositorio) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del artefacto: la model card no menciona transformer, MoE, SSM ni ningún otro diseño, ni incluye configuración de capas, dimensiones ocultas o cabezas de atención. Tampoco se documenta el tokenizador ni el vocabulario.

En cuanto al entrenamiento, no hay referencia al volumen de tokens, composición del dataset, técnicas de alineación (RLHF, DPO, SFT) ni innovaciones como decodificación especulativa o atención lineal. La única información contextual es la línea de investigación del autor (NLP para lenguas africanas de bajos recursos, texto-a-SQL y reconocimiento de habla), que no permite inferir las características del artefacto alojado.

## Capacidades

- No se documentan capacidades de generación de texto, razonamiento, código o matemáticas.
- No hay evidencia de soporte de tool calling ni function calling.
- No se describe soporte para agentes o razonamiento multi-paso.
- El único idioma declarado en los metadatos es el inglés.
- No se declaran modos especiales (thinking, visión, audio) ni plantillas de chat.

## Casos de uso

- Evaluación de repositorios de investigación: el artefacto puede consultarse como referencia del perfil del autor y de su línea de trabajo en NLP para lenguas africanas, sin uso inferencial.
- Localización de recursos para pidgin camerunés y camfranglais: sirve como punto de entrada para rastrear el recurso CamSpokenNLI y su paper asociado.
- Revisión bibliográfica sobre traducción texto-a-SQL en lenguas de bajos recursos: la model card enlaza la tesis de máster del autor, útil como referencia académica.
- Seguimiento de la organización LAB 237: permite localizar datasets y publicaciones del grupo Cameroon Open Research Community en Hugging Face.
- Verificación de licencias en pipelines de datos: la licencia Apache 2.0 declarada permite reutilizar metadatos, aunque no hay pesos sobre los que aplicar dicha licencia.
- Auditoría de repositorios vacíos o mal etiquetados: caso práctico para comprobar cómo la plataforma indexa repositorios cuyo README no describe un modelo, útil en herramientas de catalogación automática.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, al no existir pesos ni arquitectura documentada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No es posible establecer comparación con alternativas de la misma categoría porque el repositorio no define un modelo con parámetros, contexto o rendimiento medibles.

## Limitaciones y advertencias

- El repositorio no contiene una model card de modelo, sino una página de perfil personal; no debe tratarse como un artefacto listo para inferencia.
- Ausencia total de especificaciones técnicas: parámetros, contexto, tokenizador y formato de pesos no están documentados.
- El único idioma declarado es el inglés, lo que contradice el interés investigador del autor por lenguas africanas y alternancia de código; no hay evidencia de soporte multilingüe real.
- Riesgo elevado de confusión en catálogos automáticos: el nombre del repositorio sugiere un modelo, pero los metadatos no lo respaldan.
- La licencia Apache 2.0 se aplica al contenido publicado, pero sin pesos disponibles no hay material sobre el que ejercer derechos de uso comercial.
- No se puede evaluar sesgo, alucinación ni robustez sin pesos ni documentación de entrenamiento.
- Cero descargas y cero likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/tianipekins/TianiPekins
- Portfolio del autor: https://tianipekins.com
- ORCID: https://orcid.org/0009-0007-2550-3797
- LAB 237: https://lab237.org
- GitHub del autor: https://github.com/Tpekins
- LinkedIn: https://cm.linkedin.com/in/tiani-pekins-ebika
- Correo de contacto: tiani@tianipekins.com
- LocalHands: https://localhands.africa
- Organización LAB 237 en Hugging Face: https://huggingface.co/datasets/lab-237
- Referencia del paper citado: arXiv:2611.17573 (CamSpokenNLI)
