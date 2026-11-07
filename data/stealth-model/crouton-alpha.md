# stealth-model/crouton-alpha

## Resumen

Crouton Alpha es un modelo de lenguaje de acceso anticipado distribuido por Stealth Models bajo el identificador `stealth-model/crouton-alpha` en Hugging Face. Se trata de un modelo "stealth" o anónimo: el desarrollador real no se ha revelado públicamente, aunque la model card apunta a Meta como creador probable basándose en similitudes de comportamiento con su familia de modelos Muse. El repositorio de Hugging Face no contiene pesos (tamano de 0,0 GB); es únicamente una ficha informativa que documenta un preview alojado accesible a través de OpenRouter y OpenCode.

El modelo se posiciona para tareas de codigo escalable, flujos agénticos y procesamiento multimodal de alto volumen, concretamente para ejecutar sub-tareas acotadas, uso de herramientas y análisis de documentos. Según la información disponible, soporta entrada de texto, imágenes, audio, vídeo y ficheros, con una ventana de contexto de 1.048.576 tokens y capacidad de tool calling. La model card menciona además seis niveles de razonamiento configurables, un dato que solo comparte con los modelos Muse Wonder y Muse Spark 1.3 de Meta entre los 454 modelos listados en OpenRouter.

La relevancia actual del modelo radica en su carácter de preview gratuito y en las incógnitas sobre su identidad y arquitectura, que Stealth Models documenta como un ejercicio de investigación. No se han publicado especificaciones técnicas formales (arquitectura, número de parámetros, datos de entrenamiento) ni pesos descargables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 1.048.576 tokens |
| Tipos de cuantizacion | no disponible (solo preview alojado, sin pesos publicados) |
| Idiomas soportados | no disponible |
| Licencia | CC BY 4.0 |
| Formato de pesos | no disponible (no se distribuyen pesos; el repositorio tiene 0,0 GB) |

Datos adicionales documentados en la model card:

| Parametro | Valor |
|---|---|
| Entradas admitidas | Texto, imágenes, audio, vídeo y ficheros |
| Tool calls | Sí |
| Niveles de razonamiento | 6 |
| Velocidad medida por el autor | ~175 tok/s |
| Primera aparición | 3 de noviembre de 2026 |
| Desarrollador | Desconocido, probablemente Meta |
| Acceso | Preview gratuito en OpenRouter y OpenCode, bloqueado en Europa |
| Retención de prompts | El proveedor puede conservarlos; no se usan para entrenamiento |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo. La model card no especifica si se trata de un transformer denso, un mixture of experts, un modelo híbrido o cualquier otra variante, ni detalla el número de parámetros, la composición del dataset de entrenamiento, el volumen de tokens utilizados o si se aplicaron técnicas de alineación como RLHF o DPO. Tampoco se documentan innovaciones técnicas concretas más allá de la ventana de contexto de 1.048.576 tokens y la existencia de seis niveles de razonamiento configurables.

La única información técnica indirecta proviene del análisis de Stealth Models, que señala que los recuentos de tokens del modelo no coinciden con ningún modelo conocido y que coincide con los modelos Muse de Meta en 2 de 24 frases analizadas, lo que sustenta la hipótesis de un origen meta. Estos datos son indicios de investigación, no especificaciones confirmadas por el desarrollador.

## Capacidades

- Generación de texto y razonamiento con seis niveles de razonamiento configurables, un rasgo que solo comparte con Muse Wonder y Muse Spark 1.3 en el catálogo de OpenRouter.
- Procesamiento multimodal de entrada: texto, imágenes, audio, vídeo y ficheros.
- Tool calling y function calling para integración con herramientas externas.
- Ejecución de sub-tareas agénticas acotadas, orientado a flujos de trabajo donde un modelo de frontera planifica y Crouton Alpha ejecuta los pasos delimitados.
- Análisis de documentos en volúmenes altos y trabajo repetitivo.
- Codificación escalable para pipelines de desarrollo.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Ejecución de subagentes en pipelines agénticos: el modelo está diseñado para recibir planes de un modelo de razonamiento de frontera y ejecutar los pasos acotados (llamadas a API, consultas, transformaciones), aprovechando su soporte de tool calling y su velocidad de ~175 tok/s.
- Análisis de documentos a gran escala: con 1.048.576 tokens de contexto y entrada de ficheros, puede procesar contratos, informes o expedientes completos en una sola pasada sin fragmentación.
- Procesamiento de reuniones y material audiovisual: la entrada de audio y vídeo permite transcribir, resumir y extraer acciones de grabaciones, útil en herramientas de productividad.
- Generación y revisión de código en CI/CD: su orientación a codificación escalable y tool calling permite integrarlo en pipelines para tareas repetitivas de revisión, generación de tests o corrección de errores acotados.
- Enriquecimiento de datos multimodal: clasificación y extracción de información de imágenes, vídeo y documentos en procesos de alto volumen, donde el coste por llamada y la velocidad son críticos.
- Automatización de atención al cliente de segundo nivel: gestión de conversaciones con contexto largo y acceso a herramientas internas (consultas de pedidos, estado de cuentas) para resolver incidencias que requieren varios pasos.
- Prototipado rápido sin coste: al ser un preview gratuito en OpenRouter y OpenCode, permite evaluar flujos agénticos y multimodales antes de comprometerse con un proveedor de pago.

## Benchmarks y rendimiento

Los únicos resultados publicados son los de StealthMark 1.8.10, la evaluación propia de Stealth Models, que no es un benchmark estándar de la industria. Se presentan a continuación tal como aparecen en la model card:

| Prueba StealthMark | Puntuación |
|---|---|
| Puntuación global | 48,0 |
| Inteligencia general | 43,5 |
| Inteligencia visual | 56,0 |
| Beach | 60,7 |
| Selfie | 60,0 |
| Latch | 59,5 |
| Raccoon | 57,9 |
| Ground Truth | 50,5 |
| Mona Lisa | 44,9 |
| Newton's Mirror | 35,2 |
| Foresight | 32,3 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. La velocidad medida por el autor es de aproximadamente 175 tok/s en sus pruebas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. No se han publicado pesos ni parámetros, por lo que no es posible estimar requisitos de memoria.
- GPU recomendadas: no disponible por la misma razón.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el modelo solo está disponible como preview alojado en OpenRouter y OpenCode. La model card indica que, si finalmente se publica como modelo abierto, se distribuirán ficheros GGUF para llama.cpp, como se hizo con GLM-5.3-Flash y MiniMax M3.1 Flash.
- Latencia y throughput: ~175 tok/s según las pruebas de Stealth Models.

## Comparativa con modelos similares

La información disponible solo permite comparar con los modelos Muse de Meta, mencionados en la model card como referencia de comportamiento y de niveles de razonamiento.

| Modelo | Desarrollador | Contexto | Niveles de razonamiento | Entradas multimodales | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Crouton Alpha | Desconocido (probablemente Meta) | 1.048.576 tokens | 6 | Texto, imágenes, audio, vídeo, ficheros | CC BY 4.0 | Preview gratuito en OpenRouter y OpenCode, bloqueado en Europa |
| Muse Wonder | Meta (según la model card) | no disponible | 6 | no disponible | no disponible | no disponible |
| Muse Spark 1.3 | Meta (según la model card) | no disponible | 6 | no disponible | no disponible | no disponible |

No se dispone de datos de parámetros, rendimiento en benchmarks estándar ni licencia de los modelos Muse en la información proporcionada, por lo que la comparación queda limitada a los rasgos documentados.

## Limitaciones y advertencias

- Identidad y procedencia no confirmadas: el desarrollador real es desconocido; la atribución a Meta es una hipótesis de Stealth Models basada en similitudes de comportamiento, no una confirmación.
- Sin pesos publicados: el repositorio de Hugging Face no contiene el modelo (0,0 GB), por lo que no es posible inspeccionarlo, auditarlo ni desplegarlo localmente.
- Bloqueo geográfico: el acceso al preview está bloqueado en Europa tanto en OpenRouter como en OpenCode, lo que impide su uso en producción desde la UE.
- Retención de datos: el proveedor puede conservar los prompts enviados, aunque según la model card no los usa para entrenamiento. Esto supone un riesgo de confidencialidad para datos sensibles.
- Disponibilidad efímera: al tratarse de un preview no anunciado oficialmente, el servicio puede desaparecer o cambiar sin aviso.
- Sin datos de sesgos ni alucinación: no se ha publicado información sobre sesgos conocidos, tasas de alucinación ni evaluación en idiomas distintos del inglés.
- Idiomas no documentados: se desconoce el soporte multilingüe real y su calidad fuera del inglés.
- Licencia CC BY 4.0: permite uso comercial con atribución, pero al no existir pesos distribuidos, la licencia se aplica únicamente al contenido de la ficha y a los materiales gráficos, no a un artefacto de modelo utilizable.
- Benchmarks no estándar: los únicos resultados disponibles provienen de StealthMark, una evaluación propia del autor de la ficha, sin validación independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/stealth-model/crouton-alpha
- Página del autor: https://stealthmodels.com/
- Comparativa con Muse Wonder: https://stealthmodels.com/compare/crouton-alpha-vs-muse-wonder?hf_crouton
- Claves de identidad del modelo: https://stealthmodels.com/crouton-alpha?hf_crouton#identity
- Leaderboard StealthMark: https://huggingface.co/spaces/stealth-model/stealthmark
- Ficha en OpenRouter: https://openrouter.ai/stealth/crouton-alpha
- Análisis en MindStudio: https://www.mindstudio.ai/blog/crouton-alpha-stealth-model-test
