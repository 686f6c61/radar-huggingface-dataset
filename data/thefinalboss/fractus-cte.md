# thefinalboss/fractus-cte

## Resumen

Fractus CTE es un modelo de generación de texto desarrollado por el autor `thefinalboss` que se presenta como un "agente cognitivo continuo" (Continuous Cognitive Agent) en lugar de un transformer convencional. Según su model card, Fractus mantiene un estado de pensamiento persistente que avanza tick a tick a través de 16 bloques, utilizando un oscilador de Kuramoto para enrutar entre expertos dispersos (PhaseRoutedMoE). El modelo cuenta con 1.050 millones de parámetros (1.05B) y ha sido entrenado sobre un corpus de aproximadamente 4.150 millones de tokens (4.15B) que abarca neurociencia, arquitectura de software, filosofía, programación y otros dominios.

La propuesta de Fractus es radicalmente distinta a la de los grandes modelos de lenguaje: no procesa entrada-salida en una sola pasada, sino que "piensa" de forma continua, mantiene memoria persistente entre sesiones, puede crecer añadiendo nuevos expertos en tiempo de ejecución y se entrena de forma perpetua. El checkpoint se distribuye como un archivo `.pt` de PyTorch que contiene tanto los pesos como el estado dinámico del sistema. Aunque el modelo está etiquetado con `pipeline: text-generation` y licencia MIT, su arquitectura personalizada requiere el código del repositorio asociado para ejecutarse, ya que no es un transformer estándar.

Actualmente el modelo tiene 0 descargas y 0 likes en HuggingFace, y su fecha de creación (agosto de 2026) sugiere que se trata de un proyecto muy reciente. Su relevancia radica en explorar alternativas a la arquitectura transformer dominante, con un enfoque en IA personal, descentralizada y auto-modificable, aunque carece de benchmarks públicos que permitan evaluar su rendimiento real.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Continuous Cognitive Agent (no transformer) con Continuous Thought Engine de 16 bloques, PhaseRoutedMoE (Mixture of Experts con enrutado por fases de oscilador de Kuramoto) |
| Parametros totales | 1.05B (según badge de la model card) |
| Parametros activos | no disponible (la arquitectura MoE sugiere activación parcial, pero no se especifica) |
| Longitud de contexto | no disponible (la memoria persistente sugiere que no depende de una ventana de contexto tradicional) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, fr (según metadatos y dataset bilingüe) |
| Licencia | MIT |
| Formato de pesos | `.pt` (checkpoint de PyTorch con pesos + estado dinámico) |

## Arquitectura y entrenamiento

Fractus CTE no es un transformer. Según la model card, se trata de un sistema dinámico que mantiene un estado de pensamiento persistente (Continuous Thought Engine) y lo avanza en "ticks" a través de 16 bloques de procesamiento. El enrutamiento entre expertos se realiza mediante un oscilador de Kuramoto (Kuramoto Clock), que genera fases que determinan qué expertos se activan en cada paso (PhaseRoutedMoE). El modelo incorpora además memoria persistente que sobrevive a reinicios, modos cognitivos intercambiables (focused, creative, exploratory...), una base de conocimiento RAG, plugins cognitivos, metacognición para decidir sus propias acciones, crecimiento progresivo de parámetros (de 6M a 1B+) y auto-modificación en tiempo de ejecución (añade nuevos expertos cuando los necesita).

El entrenamiento se realizó sobre un corpus de aproximadamente 4.150 millones de tokens, compuesto por múltiples datasets detallados en la model card: neuro-paradigms-1b (~1B tokens, 100 paradigmas de neurociencia → arquitectura de software), neuro-code-math (~900M), cognitive-skills (~780M), fractus-generated-corpus (340M, bilingüe FR/EN), paradigms-full (191M), gutenberg-esoteric (~58M, libros esotéricos de dominio público), neuro-arch-full (86M), all-github-repos (54M+), mega-corpus-v3 (20M) y wordnet (3M). El contenido incluye neurociencia, código, matemáticas, filosofía, psicología, literatura, tradiciones esotéricas, medicina y el propio código fuente de Fractus. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación. El modelo se describe como "entrenamiento perpetuo" con un "online trainer" que aprende continuamente.

## Capacidades

- Generación de texto: el modelo produce texto a través de su motor de pensamiento continuo, aunque no se especifican detalles sobre la calidad o longitud de las salidas.
- Memoria persistente: recuerda interacciones entre sesiones, sin depender de una ventana de contexto finita.
- Modos cognitivos: cambia entre estados mentales (focused, creative, exploratory, etc.) mediante "cognitive modes".
- RAG integrado: puede incorporar hechos al instante mediante una base de conocimiento, sin necesidad de reentrenamiento.
- MetaCognición: decide sus propias acciones (recuperar, aprender, generar) en función del contexto.
- Crecimiento y auto-modificación: puede añadir nuevos expertos en tiempo de ejecución y aumentar su capacidad de 6M a 1B+ parámetros.
- Enrutamiento por oscilador de Kuramoto: utiliza fases de un sistema dinámico para activar expertos de forma dispersa.
- Capacidades multilingües: soporta inglés y francés (según metadatos y dataset bilingüe).
- No se mencionan capacidades de tool calling / function calling, visión, audio ni razonamiento matemático explícito en la model card.

## Casos de uso

- Asistente personal con memoria a largo plazo: gracias a su memoria persistente, Fractus puede mantener conversaciones continuas a lo largo de días o semanas, recordando preferencias, historial y contexto sin necesidad de prompts largos. Es adecuado para aplicaciones de "personal AI" que se ejecutan en el dispositivo del usuario.
- Agente cognitivo autónomo: su metacognición y capacidad de decidir entre recuperar, aprender o generar lo hacen apto para tareas de razonamiento multi-paso donde el agente debe planificar y ejecutar acciones de forma autónoma, como investigación o análisis de datos.
- Generación de código y soporte técnico: el dataset incluye código de GitHub y neuro-code-math, lo que sugiere capacidad para asistir en programación, aunque no hay benchmarks que lo confirmen. Podría usarse como copiloto local en entornos de desarrollo.
- Sistema de aprendizaje continuo en producción: su "online trainer" permite que el modelo se adapte a nuevos datos en tiempo real, útil para aplicaciones que requieren personalización progresiva, como motores de recomendación o sistemas de diagnóstico.
- Exploración de arquitecturas alternativas: para investigadores interesados en modelos no transformer, Fractus sirve como referencia de una implementación con osciladores de Kuramoto y MoE auto-modificable, aunque requiere el código fuente para reproducir experimentos.
- Chatbot bilingüe (EN/FR) con conocimiento especializado: su corpus incluye neurociencia, filosofía y literatura esotérica, por lo que podría emplearse en dominios educativos o de divulgación, siempre que se valide su calidad mediante pruebas propias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como MMLU, HumanEval, GSM8K u otras. El modelo no tiene descargas ni evaluaciones públicas en HuggingFace, por lo que no es posible comparar su rendimiento con otros modelos de forma objetiva.

## Requisitos de hardware

- No se especifican requisitos de VRAM, GPU ni latencia en la información proporcionada.
- El tamaño del repositorio es de 21.9 GB, lo que sugiere que el checkpoint (1.05B parámetros) ocupa varios gigabytes, probablemente en formato de precisión completa (FP32) o BF16. Un modelo de 1B en FP32 ocupa aproximadamente 4 GB solo de pesos, pero el checkpoint incluye además el estado dinámico y posiblemente otros componentes.
- Dado el tamaño, es plausible que pueda ejecutarse en GPUs de consumo como RTX 3060 o superiores, pero no hay confirmación oficial.
- El modelo requiere el código del repositorio GitHub (AFKmoney/fractus-cte) para cargarse y ejecutarse; no es compatible con frameworks estándar como vLLM, llama.cpp u Ollama sin adaptación.
- No se dispone de datos de throughput ni latencia.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con modelos de la misma categoría. Fractus CTE se presenta como una arquitectura única (no transformer), por lo que no es directamente comparable con modelos como GPT-Neo, LLaMA o Mistral en términos de arquitectura o rendimiento. No hay benchmarks públicos que permitan contrastar sus capacidades con alternativas de tamaño similar (1B parámetros).

## Limitaciones y advertencias

- El modelo no es un transformer estándar; requiere el código propietario del repositorio para ejecutarse, lo que limita su portabilidad y compatibilidad con herramientas del ecosistema actual (HuggingFace Transformers, vLLM, etc.).
- No hay evidencia pública de calidad: sin benchmarks ni evaluaciones independientes, no se puede afirmar que el modelo funcione correctamente o que su rendimiento sea comparable al de modelos establecidos.
- La model card contiene afirmaciones ambiciosas (memoria infinita, auto-modificación, crecimiento progresivo) que no han sido verificadas externamente; se recomienda prudencia antes de adoptar el modelo en entornos de producción.
- El dataset incluye contenido esotérico y hermético de dominio público, lo que podría introducir sesgos o información no verificada en las respuestas.
- La licencia MIT permite uso comercial, pero el modelo depende de código externo cuyo mantenimiento y soporte no están garantizados.
- No se especifican sesgos conocidos ni riesgos de alucinación, pero al ser un modelo sin alineación explícita (no se menciona RLHF/DPO), es probable que presente alucinaciones y falta de control de calidad.
- El modelo solo soporta inglés y francés; no se ha entrenado para otros idiomas.

## Enlaces

- HuggingFace: https://huggingface.co/thefinalboss/fractus-cte
- Dataset: https://huggingface.co/datasets/thefinalboss/fractus-datasets
- Repositorio de código (según la model card): https://github.com/AFKmoney/fractus-cte
