# thanksplay/Ether-Cognitive-Architecture

## Resumen

Ether-Cognitive-Architecture, también denominado "硅基生命" (Silicon Life), es un sistema de inteligencia artificial local desarrollado por el autor thanksplay. A diferencia de los modelos de lenguaje de gran escala (LLM) basados en redes neuronales y probabilidad, este sistema emplea un enfoque de razonamiento simbólico basado en grafos de conocimiento y lógica formal. Su objetivo declarado es construir un "cerebro" que no dependa de grandes modelos, sino que utilice rutas lógicas y conexiones entre conceptos para generar respuestas verificables y editables.

El sistema está diseñado para ejecutarse íntegramente en CPU, sin necesidad de GPU, y ofrece tiempos de respuesta en el orden de milisegundos. Se presenta como una alternativa a los LLM tradicionales, destacando su transparencia (cada paso de razonamiento es trazable), su capacidad de aprendizaje continuo (la memoria solo crece) y su naturaleza local (los datos no salen del dispositivo). No se trata de un modelo de lenguaje en el sentido convencional, sino de un motor de razonamiento simbólico con capacidades de procesamiento de texto, generación de código y gestión de conocimiento estructurado.

La relevancia actual de este proyecto radica en su propuesta de abordar las limitaciones de los LLM probabilísticos (alucinaciones, opacidad, dependencia de infraestructura) mediante un enfoque basado en reglas y grafos. Sin embargo, al ser un proyecto reciente (creado en agosto de 2026) y con cero descargas y cero likes en HuggingFace, su adopción y validación externa son aún incipientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sistema de razonamiento simbólico basado en grafos de conocimiento (no es un transformer ni un MoE) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no aplica, se ejecuta en CPU sin pesos neuronales) |
| Idiomas soportados | no disponible (la documentación está en chino, pero no se especifican idiomas de entrada/salida) |
| Licencia | bsl-1.0 (Business Source License) |
| Formato de pesos | no disponible (no se distribuyen pesos; es un sistema de software) |

## Arquitectura y entrenamiento

La arquitectura de Ether-Cognitive-Architecture no corresponde a un modelo de red neuronal convencional. Según la documentación, se compone de tres capas de conocimiento: un "grafo principal" que reside en memoria y almacena relaciones conceptuales ("qué es" y "por qué"), "paquetes de dominio" que se cargan bajo demanda para tareas específicas ("cómo hacer") y un "pool de información" para datos fácticos concretos ("quién es"). El sistema emplea un "doble núcleo cognitivo": un componente de lógica simbólica (caja blanca) y otro de reconocimiento de patrones (caja derecha), que trabajan de forma cooperativa. También se menciona un sistema de "cuatro campos" de colaboración y una clasificación de conocimiento en cuatro niveles (confirmado, tentativo, pendiente de confirmación, obsoleto).

No se proporcionan datos sobre el proceso de entrenamiento, como número de tokens, composición del dataset o técnicas de RLHF/DPO. El sistema parece basarse en reglas programadas y en la construcción manual de grafos, más que en aprendizaje automático a partir de grandes corpus. La documentación indica que el conocimiento se adquiere de forma incremental durante las conversaciones, con mecanismos de extracción automática y evaluación de credibilidad.

## Capacidades

- Generación de texto creativo: novelas (corta, media, larga), poesía (moderna, clásica, prosa poética), diseño de personajes y construcción de mundos.
- Asistencia de programación: generación de código en 16 lenguajes (Python, JavaScript, TypeScript, Java, C++, Go, Rust, etc.), revisión de código mediante análisis AST, detección de anti-patrones, y 27 estrategias de corrección automática.
- Conocimiento y razonamiento: resolución de problemas de física, química, biología, matemáticas (aritmética, geometría, álgebra, estadística), y lógica (silogismos, transitividad, detección de contradicciones).
- Juegos de estrategia: implementación de partidas de Werewolf (12 jugadores), motor de juegos de rol de mesa (TRPG) con 5 marcos predefinidos, juegos de escape room y juegos de razonamiento matemático.
- Análisis y planificación: generación de informes estructurados, diseño de planes paso a paso, evaluación de riesgos y coordinación de múltiples objetivos.
- Diálogo y reflexión: discusiones filosóficas, interpretación de sueños, análisis psicológico y cuestionamiento socrático.
- Aprendizaje y memoria: extracción automática de conocimiento durante conversaciones, lectura de textos largos, aprendizaje de APIs mediante reflexión de módulos Python y análisis de código con AST.
- Herramientas de creación: gestión de archivos de personajes, mantenimiento de contexto narrativo, evaluación de código y visualización de escenarios.

## Casos de uso

- Asistente de escritura creativa: un autor puede usar el sistema para generar tramas, desarrollar personajes y mantener coherencia en mundos ficticios. Gracias a su memoria persistente y su capacidad de construir grafos de relaciones, el sistema puede recordar detalles de capítulos anteriores y sugerir desarrollos coherentes.
- Tutor de ciencias y matemáticas: el sistema puede explicar conceptos de física, química o álgebra mediante razonamiento paso a paso, y emplear el método socrático para guiar al estudiante hacia la comprensión. Su naturaleza simbólica permite verificar cada paso lógico.
- Generación y revisión de código en entornos de desarrollo: un programador puede solicitar la creación de funciones o scripts en varios lenguajes, y el sistema puede analizar el código existente, detectar anti-patrones y proponer correcciones basadas en reglas. Su capacidad de ejecutarse localmente lo hace adecuado para entornos con restricciones de privacidad.
- Gestión de conocimiento personal: el sistema puede actuar como un "segundo cerebro" que almacena notas, extrae relaciones entre conceptos y permite consultas basadas en grafos. Al ser editable, el usuario puede corregir o añadir nodos y conexiones manualmente.
- Juegos de rol y entretenimiento: un director de juego puede usar el sistema como "máster" para gestionar partidas de TRPG, manteniendo el estado del mundo, interpretando personajes no jugadores y generando encuentros. Su capacidad de razonamiento lógico permite resolver acciones de los jugadores de forma consistente.
- Análisis y planificación de proyectos: un gestor puede solicitar informes estructurados, descomposición de tareas complejas y evaluación de riesgos. El sistema puede generar planes paso a paso y alternativas, basándose en reglas de razonamiento y en el conocimiento almacenado en su grafo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos sobre MMLU, HumanEval, GSM8K u otras evaluaciones estándar. El sistema no es un modelo de lenguaje probabilístico, por lo que las métricas habituales de LLM no son directamente aplicables. Se desconoce su rendimiento comparativo frente a otros sistemas.

## Requisitos de hardware

- Ejecución en CPU pura, sin necesidad de GPU. La documentación indica "milisegundos de respuesta" y "ligero residente", lo que sugiere un consumo de recursos muy bajo.
- Puede ejecutarse como proceso en segundo plano (daemon) sin impacto perceptible.
- No se especifican requisitos mínimos de RAM o almacenamiento, pero al ser un sistema basado en grafos, la memoria dependerá del tamaño del grafo cargado.
- Opciones de despliegue: se proporcionan scripts para interfaz de línea de comandos (`python main.py`), interfaz web (`python web_ui.py 8000`) y servidor API (`python api_server.py 8001`). No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo de pesos.
- Latencia y throughput: no se proporcionan cifras concretas, pero la afirmación de "milisegundos" sugiere una latencia muy baja para tareas de razonamiento simbólico.

## Comparativa con modelos similares

No disponible. Ether-Cognitive-Architecture no es un LLM tradicional, por lo que no se puede comparar directamente con modelos como Llama, Mistral o GPT. En el ámbito de los sistemas de razonamiento simbólico, existen proyectos como Cyc o sistemas basados en lógica descriptiva, pero no se dispone de información suficiente para establecer una comparación rigurosa con este sistema concreto.

## Limitaciones y advertencias

- Al ser un sistema basado en reglas y grafos, su capacidad de comprensión del lenguaje natural no estructurado puede ser limitada en comparación con los LLM. No se especifica cómo maneja ambigüedades, ironía o lenguaje coloquial.
- La documentación no menciona sesgos conocidos, pero al depender de conocimiento introducido manualmente o extraído de conversaciones, podría heredar sesgos de sus fuentes.
- Riesgo de alucinación: al no usar probabilidad, el sistema podría generar respuestas incorrectas si el grafo contiene información errónea o si las reglas de inferencia son incompletas. La documentación menciona un mecanismo de "marcado de conocimiento obsoleto", pero no se detalla su eficacia.
- La licencia bsl-1.0 (Business Source License) impone restricciones de uso comercial. Es necesario revisar los términos específicos de la licencia para determinar si se permite su uso en producción o si requiere una licencia comercial adicional.
- No se proporcionan garantías de soporte, mantenimiento o estabilidad. El proyecto tiene cero descargas y cero likes, lo que indica una adopción nula y una posible falta de madurez.
- La documentación está íntegramente en chino, lo que puede dificultar su adopción por parte de desarrolladores que no dominen ese idioma.

## Enlaces

- HuggingFace: https://huggingface.co/thanksplay/Ether-Cognitive-Architecture
