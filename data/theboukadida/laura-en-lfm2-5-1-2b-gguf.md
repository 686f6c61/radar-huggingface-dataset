# Theboukadida/laura-en-lfm2.5-1.2b-GGUF

## Resumen

Laura es un ajuste fino del modelo LiquidAI/LFM2.5-1.2B-Instruct orientado a una única tarea: actuar como tutor de alemán para adultos principiantes (niveles A1-A2) dentro de una aplicación de aprendizaje offline. El modelo conversa con el estudiante en inglés y enseña alemán mediante ejemplos en alemán. Lo desarrolla el usuario Theboukadida y se distribuye exclusivamente en formato GGUF cuantizado a Q4_K_M, con un peso de 0,73 GB, pensado para ejecutarse en CPU de teléfono móvil sin acelerador.

Técnicamente es un LoRA de rango 16 aplicado a todas las capas lineales del modelo base, entrenado durante 2 épocas sobre aproximadamente 2.500-3.300 conversaciones cortas de tutoría en inglés, fusionado en los pesos y convertido a GGUF con llama.cpp. El recuento real de parámetros del modelo base es de 1.170.340.608 (unos 1,17B), por lo que se mantiene en la categoría de modelos pequeños aptos para dispositivos.

Su relevancia es doble: por un lado, ejemplifica un caso de uso vertical muy concreto (tutoría de idiomas) sobre un modelo sub-2B; por otro, documenta un patrón de diseño interesante, en el que la aplicación no confía en el juicio gramatical del modelo y le inyecta correcciones, significados y reglas verificadas con un diccionario propio, con el modelo limitándose a explicarlas. El autor reporta una evaluación manual de 80% de respuestas con enseñanza correcta sobre conversaciones retenidas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible de forma explícita; heredada del modelo base LiquidAI/LFM2.5-1.2B-Instruct (familia LFM2.5, etiquetada como lfm2) |
| Parametros totales | 1.170.340.608 (aproximadamente 1,17B) |
| Parametros activos | No aplica: no se describe como MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_K_M (único archivo publicado: `laura-en-lfm2.5-1.2b-Q4_K_M.gguf`, 0,73 GB) |
| Idiomas soportados | Alemán (de) e inglés (en) |
| Licencia | LFM Open License v1.0 (`lfm1.0`), etiquetada como `other` con `license_name: lfm1.0` |
| Formato de pesos | GGUF |
| Modelo base | LiquidAI/LFM2.5-1.2B-Instruct |
| Metodo de adaptacion | LoRA de rango 16 sobre todas las capas lineales, 2 épocas, pesos fusionados |
| Tamano del repositorio | 0,7 GB |
| Fecha de publicacion (metadatos de HuggingFace) | 2026-09-28 |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base más allá de su pertenencia a la familia LFM2.5 de LiquidAI, cuyas etiquetas lo asocian a `lfm2`. No se especifican en la ficha el número de capas, el tipo de atención, la ventana de contexto ni la composición del corpus de preentrenamiento, por lo que esos datos quedan como no disponibles y deben consultarse en la model card de LiquidAI/LFM2.5-1.2B-Instruct.

Lo que sí está documentado es el procedimiento de ajuste: se entrenó un adaptador LoRA de rango 16 aplicado a todas las capas lineales durante 2 épocas, sobre un conjunto de aproximadamente 2.500-3.300 conversaciones cortas de tutoría en inglés, y posteriormente se fusionó en los pesos del modelo base. El resultado se convirtió a GGUF y se cuantizó a Q4_K_M con llama.cpp. No se menciona uso de RLHF, DPO ni decodificación especulativa.

La innovación destacable no es arquitectónica sino de diseño de sistema: el modelo fue entrenado con notas externas inyectadas en el mensaje, del tipo `(Check: ✗ → „frase corregida“ · motivo)` o `(Check: ✓ …)`, junto con significados de diccionario y la tarjeta de reglas del capítulo. La aplicación valida antes la frase del estudiante con su propio diccionario y pasa el veredicto al modelo, que se limita a explicarlo. El propio autor advierte que, sin esas notas, el modelo es un profesor mucho más débil.

## Capacidades

- Generación de texto conversacional en inglés con ejemplos en alemán, en formato de tutoría para principiantes (A1-A2).
- Explicación de correcciones gramaticales y léxicas previamente calculadas por un sistema externo, incluyendo el motivo del error.
- Explicación de significados de palabras y de reglas gramaticales presentadas en tarjetas de reglas por capítulo.
- Soporte de conversación multiturno en el formato de chat definido por el modelo base (etiqueta `conversational`).
- Ejecución en CPU sin GPU, orientada a inferencia en dispositivo móvil.
- Compatibilidad con endpoints de HuggingFace (etiqueta `endpoints_compatible`).
- No hay evidencia en la información disponible de soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento explícito.
- Capacidades multilingües limitadas a alemán e inglés; no se declaran otros idiomas.

## Casos de uso

- Tutor de alemán en aplicación móvil offline: es el caso de uso para el que fue entrenado. El modelo se ejecuta en la CPU del teléfono y responde en inglés explicando contenidos de alemán para adultos de nivel A1-A2, sin conexión a red.
- Corrección gramatical asistida por diccionario: la app valida la frase del estudiante con su propio diccionario y pasa el veredicto al modelo, que genera la explicación del error y la frase corregida con su motivo. Este patrón reduce el riesgo de que el modelo invente reglas.
- Explicación de vocabulario en contexto: dado el significado recuperado por la aplicación, el modelo lo reformula para el estudiante y lo ilustra con ejemplos en alemán.
- Práctica de conversación guiada por capítulo: el modelo mantiene diálogos cortos alineados con la tarjeta de reglas del capítulo en curso, reforzando la estructura del curso.
- Prototipado de asistentes educativos verticales: sirve como plantilla para adaptar un modelo sub-2B a un dominio concreto mediante LoRA de rango bajo y despliegue en GGUF.
- Despliegue en hardware muy limitado: al ocupar 0,73 GB en Q4_K_M, puede integrarse en aplicaciones de escritorio o embebidas con recursos de memoria mínimos.
- Evaluación de estrategias de aumentación de contexto con datos verificados externamente, como alternativa al ajuste fino con conocimiento factual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K u otros) en la información disponible. El único dato de evaluación aportado es una prueba manual sobre conversaciones retenidas que el modelo nunca vio durante el entrenamiento:

| Evaluacion | Metrica | Resultado |
|---|---|---|
| Conversaciones de tutoria retenidas | Respuestas con ensenanza correcta (todos los hechos y motivos en aleman correctos) | 80% |

Esta cifra procede del autor de la ficha del modelo y no se especifica el tamano del conjunto de evaluación, el número de anotadores ni el protocolo exacto de corrección, por lo que debe interpretarse como una referencia orientativa y no como un resultado reproducible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: el archivo Q4_K_M ocupa 0,73 GB, por lo que la huella de pesos ronda los 0,73-0,8 GB; sumando la caché KV y el overhead del runtime, es razonable reservar entre 1,2 y 2 GB de memoria, cifra estimada y no confirmada en la ficha.
- GPU recomendadas: el modelo está diseñado para ejecución en CPU; no se documentan requisitos de GPU. Cualquier GPU con más de 2 GB de memoria libre puede alojarlo, pero no hay datos de rendimiento publicados por modelo de GPU.
- Viabilidad en GPU de consumo: sí, cabe holgadamente en cualquier GPU de consumo moderna (por ejemplo, series RTX 30/40 con 8 GB o más), aunque no se han publicado medidas de latencia ni de throughput.
- Ejecución sin GPU: es el escenario objetivo declarado, inferencia en CPU de teléfono móvil.
- Opciones de despliegue: llama.cpp (usado para la conversión y cuantización) y cualquier runtime compatible con GGUF, como Ollama o los bindings de llama.cpp; no se mencionan vLLM ni TGI, que no son el objetivo de este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Theboukadida/laura-en-lfm2.5-1.2b-GGUF | 1,17B | No disponible | de, en | LFM Open License v1.0 | GGUF Q4_K_M | Ajuste LoRA especializado en tutoría de alemán; 80% de enseñanza correcta en evaluación manual del autor |
| LiquidAI/LFM2.5-1.2B-Instruct (modelo base) | 1,17B | No disponible | No disponible | LFM Open License v1.0 | No disponible | Modelo generalista de instrucciones del que deriva Laura; su model card es la fuente para los datos arquitectónicos y de contexto que aquí faltan |
| Otras alternativas de la misma categoria (por ejemplo, modelos instruct de ~1-2B) | No disponible | No disponible | No disponible | No disponible | No disponible | No se dispone de datos verificados en la informacion proporcionada; no se incluyen cifras para no inventar resultados |

## Limitaciones y advertencias

- El modelo depende de las notas externas de la aplicación (veredicto de corrección, significados de diccionario y tarjeta de reglas). Sin ellas, el propio autor indica que su calidad como profesor cae de forma notable.
- La evaluación reportada (80%) es manual, sin protocolo detallado ni tamaño de conjunto especificado, y procede del propio autor del ajuste.
- El conjunto de entrenamiento es muy reducido (aproximadamente 2.500-3.300 conversaciones), lo que limita la generalización fuera del dominio de tutoría A1-A2.
- Riesgo de alucinación en hechos gramaticales o léxicos del alemán si se usa sin el sistema de verificación externo.
- Idiomas soportados únicamente alemán e inglés; no hay evidencia de buen rendimiento en castellano ni en otras lenguas.
- La longitud de contexto no está documentada en la ficha, lo que impide planificar conversaciones largas o prompts extensos con garantías.
- Solo se publica una cuantización Q4_K_M; no hay versiones en mayor precisión (por ejemplo, FP16 o Q8_0) para evaluar la pérdida por cuantización, y a 1,17B de parámetros la cuantización a 4 bits puede degradar tareas sensibles.
- Licencia LFM Open License v1.0: es una licencia propia de LiquidAI, no una licencia de código abierto estándar; antes de un uso comercial es necesario revisar el archivo LICENSE del repositorio y las condiciones aplicables a modelos derivados.
- El repositorio no tiene descargas ni interacciones registradas en el momento de la consulta, por lo que no existe validación independiente por parte de la comunidad.
- Las fechas de creación y actualización de los metadatos (2026-09-28) no permiten verificar la madurez del artefacto ni su historial de cambios.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Theboukadida/laura-en-lfm2.5-1.2b-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct
- Licencia del modelo base (LFM Open License v1.0): archivo LICENSE del repositorio en HuggingFace
- No se han encontrado otros enlaces relevantes (papers, blogs, repositorios o demos) en la búsqueda web realizada; los resultados obtenidos no guardan relación con el modelo.
