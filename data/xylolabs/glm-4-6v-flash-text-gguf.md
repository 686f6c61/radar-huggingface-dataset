# Xylolabs/GLM-4.6V-Flash-Text-GGUF

## Resumen

GLM-4.6V-Flash-Text-GGUF es una cuantización GGUF del decodificador de texto del modelo multimodal GLM-4.6V-Flash, desarrollado originalmente por el equipo GLM de Z.ai (zai-org). El modelo base pertenece a la familia GLM-V, una serie de modelos multimodales orientados a razonamiento versátil mediante aprendizaje por refuerzo escalable. Esta versión concreta, publicada por Xylolabs, elimina el codificador de visión y el proyector multimodal, conservando únicamente la torre de texto, y la empaqueta en formato GGUF para su uso con llama.cpp.

El modelo cuenta con 9.400.279.040 parámetros totales (aproximadamente 9,4 mil millones), organizados en 40 capas de decodificador de texto, más embeddings y cabeza de salida. La cuantización publicada es IQ4_XS con importance matrix, con un tamaño de descarga de 5,262 GB y un promedio de 4,470 bits por peso. El repositorio ocupa 5,3 GB en total.

La relevancia de esta ficha radica en que permite ejecutar localmente, en hardware de consumo, un modelo de la familia GLM-4.6V en su faceta puramente textual, sin necesidad de infraestructura para visión. La licencia es MIT, lo que facilita su adopción comercial. No obstante, se trata de un derivado de cuantización sin nuevos datos de entrenamiento ni calibración, y su evaluación se limita a comprobaciones de referencia relativas frente al modelo original en BF16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (torre de texto de un modelo multimodal GLM-4.6V-Flash); 40 capas de decodificador |
| Parametros totales | 9.400.279.040 (aproximadamente 9,4 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (la metadatos originales se conservan sin cambios; el ejemplo de la model card limita a 2.048 tokens) |
| Tipos de cuantizacion | IQ4_XS con importance matrix; tipos mixtos: F32 (281 tensores), IQ4_NL (40), IQ4_XS (161), Q5_K (40), Q6_K (1) |
| Idiomas soportados | ingles (en), coreano (ko) |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base GLM-4.6V-Flash es un modelo multimodal de la familia GLM-V, que combina un codificador de visión con un decodificador de lenguaje y se entrena con aprendizaje por refuerzo escalable para razonamiento versátil, según el paper de la familia (arXiv:2507.01006). Esta exportación concreta conserva únicamente la torre de texto: 523 tensores correspondientes a las 40 capas del decodificador, el embedding, la cabeza de salida, el tokenizador y la plantilla de chat original. No incluye pesos del codificador de imagen ni del proyector.

La conversión y cuantización fue realizada por Xylolabs con llama.cpp, reutilizando una importance matrix existente. La model card indica explícitamente que no se realizó entrenamiento, calibración ni cuantización nuevos para la publicación; los nombres de fichero de calibración históricos son etiquetas de metadatos y no se incluye ningún dataset. La cuantización IQ4_XS emplea tipos mixtos (IQ4_NL, IQ4_XS, Q5_K, Q6_K y F32) para preservar la precisión en tensores sensibles. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto conversacional y de un solo turno, con soporte de plantilla de chat original (formato jinja).
- Razonamiento textual: la model card menciona elementos de razonamiento recuperables activando el modo thinking (`enable_thinking`).
- Capacidad multilingüe limitada a inglés y coreano según los metadatos del autor.
- Conversión compatible con endpoints y con llama.cpp (tag `endpoints_compatible`).
- Capacidad de visión: no disponible en esta exportación (el codificador de imagen y el proyector se han omitido deliberadamente).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de audio: no disponible.

## Casos de uso

- Asistente conversacional local en inglés o coreano: el modelo puede gestionar diálogos de un solo turno o multi-turno con la plantilla de chat original, ejecutándose en llama.cpp con un consumo de pesos de aproximadamente 5,25 GB, adecuado para equipos de consumo con GPU de 8 GB o más.
- Generación de texto en pipelines de CI/CD o herramientas de línea de comandos: al ser un GGUF compatible con llama.cpp, puede integrarse en scripts y flujos automatizados para tareas de redacción, resumen o transformación de texto sin depender de servicios en la nube.
- Prototipado de aplicaciones de razonamiento textual: el modo thinking permite activar cadenas de razonamiento para tareas que requieren pasos intermedios, útil en entornos de investigación que necesitan un modelo local de aproximadamente 9,4 B parámetros.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse localmente y con licencia MIT, es apto para procesar texto sensible sin enviar datos a terceros.
- Evaluación y comparación de cuantizaciones: sirve como referencia para estudiar el impacto de IQ4_XS con importance matrix frente a Q4_K_M en un modelo de la familia GLM, con métricas KL documentadas.
- Filtrado y clasificación de texto en inglés y coreano: puede emplearse para tareas de etiquetado o moderación de contenido en esos dos idiomas, aunque sin garantías de rendimiento fuera de ellos.
- Base para experimentos de destilación o ajuste fino ligero sobre la torre de texto, dado que los pesos están en GGUF y la licencia MIT lo permite.

## Benchmarks y rendimiento

La model card no presenta resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.). En su lugar, documenta una evaluación de referencia relativa frente al modelo original en BF16 y frente a una cuantización Q4_K_M:

| Metrica | BF16 (original) | Q4_K_M | IQ4_XS (este fichero) |
|---|---|---|---|
| Respuestas correctas (conjunto 33) | 26/33 | 27/33 | 25/33 |
| Respuestas correctas (conjunto 7) | 6/7 | 7/7 | 7/7 |
| Perdidas contadas | no disponible | 0 | 1 (`ko-fact-hangul`) |
| KL media frente a BF16 | referencia | 0,024092 | 0,029230 (1,213x) |

La evaluación cubre 16 secuencias emparejadas de 1.024 tokens (16.248 posiciones puntuadas) en grupos de inglés y coreano, texto plano y chat, con contexto de 8.192 tokens. La comprobación estricta de cero pérdidas falla; la comprobación relativa permite una pérdida contada más que Q4_K_M. No se reportan datos de velocidad ni de throughput.

## Requisitos de hardware

- VRAM estimada: aproximadamente 5,25 GB solo para los pesos del decodificador de texto en IQ4_XS, más espacio para la caché KV y buffers de trabajo.
- GPU recomendadas: no especificadas por el autor; por tamaño, cabe en GPU de consumo con 8 GB o más (por ejemplo, RTX 3060 Ti, RTX 4060 Ti, RTX 3070) y en GPU profesionales como A100 o H100 sin problema.
- Cabe en GPU de consumo: sí, en modelos con al menos 8 GB de VRAM, dejando margen para la caché KV según la longitud de contexto.
- Opciones de despliegue: llama.cpp (verificado con v0.9.0 según la model card); otras herramientas compatibles con GGUF no están confirmadas en la información disponible.
- Latencia y throughput: no disponibles; la model card indica explícitamente que no se reporta velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| GLM-4.6V-Flash-Text-GGUF (este) | 9,4 B | no disponible | MIT | GGUF IQ4_XS | Solo texto; sin codificador de visión |
| GLM-4.6V-Flash (base) | no disponible | no disponible | MIT | safetensors (presumible) | Multimodal completo (visión + texto) |
| Q4_K_M del mismo modelo | 9,4 B | no disponible | MIT | GGUF Q4_K_M | Referencia de cuantización en la evaluación del autor; KL 0,024092 |

No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- El modelo es solo texto: el codificador de visión y el proyector se han eliminado, por lo que no puede procesar imágenes a pesar de provenir de un modelo multimodal.
- Idiomas limitados a inglés y coreano según los metadatos; el rendimiento en castellano u otros idiomas no está documentado y probablemente sea deficiente.
- La evaluación es de referencia relativa y de alcance reducido (16 secuencias, 33+7 elementos); no sustituye una evaluación de tareas real. La model card advierte que una integración necesita su propia evaluación de tareas.
- Pérdida contada en `ko-fact-hangul`: la comprobación estricta de cero pérdidas falla, aunque la comprobación relativa la permite.
- Riesgo de alucinación: no cuantificado en la información disponible; aplicable como en cualquier modelo generativo de este tamaño.
- Sesgos conocidos: no documentados en la información proporcionada.
- Licencia MIT permite uso comercial, pero la model card se ofrece "as is", sin garantía ni respaldo del autor original (Z.ai); el fichero NOTICE identifica el origen GLM Team / Z.ai y la conversión de Xylolabs.
- No se realizó calibración ni cuantización nueva para esta publicación; los nombres de calibración son etiquetas de metadatos y no se incluye dataset.
- Longitud de contexto original no especificada; el ejemplo de la model card usa 2.048 tokens y la evaluación usa 8.192, pero no se confirma el máximo soportado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Xylolabs/GLM-4.6V-Flash-Text-GGUF
- Modelo base: https://huggingface.co/zai-org/GLM-4.6V-Flash
- Paper de la familia GLM-V: https://arxiv.org/abs/2507.01006
- Documentación de llama.cpp para GGUF: https://huggingface.co/docs/hub/gguf-llamacpp
- Repositorio llama.cpp: https://github.com/ggml-org/llama.cpp/tree/cd959bae99ff4bed22bef2604f45241c09bbb8c8
- Licencia MIT del repositorio: https://huggingface.co/Xylolabs/GLM-4.6V-Flash-Text-GGUF/blob/main/LICENSE
- Repositorio de herramientas de Xylolabs: https://github.com/XylolabsInc/tensix-bfp-gptq
