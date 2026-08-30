# spellbrush/PupuM2D

## Resumen

PupuM2D es un modelo de representación musical desarrollado por Spellbrush, el estudio de IA generativa responsable de niji·journey. Se trata de un sistema de aprendizaje autosupervisado sensible a la frecuencia (frequency-aware self-supervised learning) diseñado específicamente para extraer representaciones de audio musical de alta calidad. El modelo está publicado bajo licencia MIT y se presenta en seis tamaños diferentes, desde una versión Tiny de 5 millones de parámetros hasta una versión Giant de 1.100 millones.

El modelo resuelve el problema de obtener embeddings musicales semánticamente ricos sin necesidad de etiquetas anotadas manualmente, un paso fundamental para tareas como clasificación de géneros, recomendación musical, separación de fuentes o generación condicionada por contenido musical. Su relevancia actual radica en que aborda la representación musical desde una perspectiva sensible a la frecuencia, una innovación frente a los modelos SSL genéricos de audio que tratan todas las bandas espectrales por igual.

El repositorio contiene los pesos de los seis checkpoints en formato safetensors, listos para ser integrados en el repositorio oficial de GitHub del proyecto. El modelo se acompaña de un artículo académico disponible en arXiv con identificador 2606.25713.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en SSL sensible a la frecuencia |
| Parametros totales | 5M (Tiny), 22M (Small), 86M (Base), 307M (Large), 632M (Huge), 1.1B (Giant) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de audio musical) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura de PupuM2D se basa en un enfoque de aprendizaje autosupervisado (SSL) que incorpora un mecanismo de atención sensible a la frecuencia. A diferencia de los modelos SSL de audio convencionales que procesan el espectrograma completo de manera uniforme, PupuM2D introduce una componente que pondera o procesa de forma diferenciada las distintas bandas de frecuencia, lo que permite capturar mejor las estructuras armónicas y tímbricas propias de la música.

El entrenamiento se realiza de forma autosupervisada, lo que elimina la necesidad de datos etiquetados. Los detalles concretos sobre el número de tokens de entrenamiento, la composición exacta del dataset o si se aplicaron técnicas de refinamiento posteriores no están disponibles en la documentación pública del repositorio. El modelo se presenta en seis escalas distintas, lo que permite a los usuarios elegir entre velocidad y capacidad según sus necesidades de cómputo.

## Capacidades

- Extracción de representaciones musicales (embeddings) de alta calidad para tareas downstream.
- Aprendizaje sensible a la frecuencia, que captura información armónica y tímbrica con mayor precisión que modelos SSL genéricos de audio.
- Disponible en seis tamaños (5M a 1.1B parámetros), lo que permite escalar según los requisitos de latencia y precisión.
- Diseñado específicamente para música, no para audio general o voz.
- Integración con el repositorio oficial de GitHub para experimentación y fine-tuning.
- Arquitectura basada en PyTorch con pesos en safetensors.

## Casos de uso

- Clasificación de géneros musicales: los embeddings de PupuM2D pueden alimentar clasificadores ligeros para categorizar canciones por género, subgénero o estilo con mayor precisión que representaciones basadas en espectrogramas crudos.
- Recomendación musical: las representaciones aprendidas permiten calcular similitudes entre canciones de forma semántica, mejorando sistemas de descubrimiento musical en plataformas de streaming.
- Separación de fuentes musicales: los embeddings sensibles a la frecuencia pueden servir como entrada a modelos de separación de voz, batería o instrumentos, al proporcionar una representación que distingue mejor los componentes espectrales.
- Indexación y búsqueda de bibliotecas musicales: permite buscar canciones por similitud estructural o tímbrica en grandes catálogos, útil para productores y estudios de grabación.
- Generación musical condicionada: los embeddings pueden condicionar modelos generativos (como difusión o autoregresivos) para producir música que siga un estilo o estructura determinada.
- Análisis musicológico asistido por IA: investigadores pueden usar las representaciones para estudiar patrones armónicos, evoluciones estilísticas o similitudes entre obras de forma cuantitativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye comparaciones con otros modelos de representación musical como MERT, Music2Vec o Jukebox embeddings. Se recomienda consultar el artículo en arXiv (2606.25713) para posibles evaluaciones cuantitativas.

## Requisitos de hardware

- La versión Tiny (5M parámetros) puede ejecutarse en CPU o en GPUs de consumo básico (4 GB VRAM o menos).
- La versión Small (22M) y Base (86M) caben en GPUs de consumo como RTX 3060 o RTX 4090 sin problema.
- La versión Large (307M) requiere al menos 8-12 GB de VRAM para inferencia en precisión completa.
- La versión Huge (632M) y Giant (1.1B) necesitan GPUs profesionales como A100 o H100, o cuantización para reducir el consumo de memoria.
- Al ser un modelo de audio, el procesamiento se realiza sobre espectrogramas o formas de onda, por lo que el uso de VRAM depende también del tamaño de la ventana de audio procesada.
- Opciones de despliegue: al ser un modelo PyTorch estándar, puede servirse con TorchServe, o integrarse en pipelines de procesado por lotes. No hay soporte nativo documentado para vLLM, llama.cpp u Ollama, dado que no es un modelo de lenguaje.
- La latencia dependerá del tamaño del modelo y del hardware; no se han publicado mediciones oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|
| PupuM2D (Base) | 86M | SSL sensible a la frecuencia | MIT | HuggingFace |
| MERT (Music Audio Representation Transformer) | 95M-330M | SSL con fine-tuning supervisado | CC BY-NC-SA | HuggingFace |
| Music2Vec | 95M | SSL basado en Wav2Vec2 adaptado a música | MIT | HuggingFace |

PupuM2D se diferencia de MERT y Music2Vec por su enfoque específico en la sensibilidad a la frecuencia. MERT es un referente en representación musical pero su licencia es no comercial. Music2Vec ofrece licencia MIT pero tiene un tamaño fijo. PupuM2D ofrece una gama más amplia de tamaños y una licencia permisiva, aunque su adopción en la comunidad es menor al ser un modelo más reciente.

## Limitaciones y advertencias

- Al ser un modelo de representación (encoder), no genera audio por sí mismo; necesita modelos downstream para tareas generativas.
- Los detalles sobre el dataset de entrenamiento no son públicos, lo que dificulta evaluar posibles sesgos hacia ciertos géneros o culturas musicales.
- No se han publicado resultados de benchmarks independientes, por lo que su rendimiento relativo frente a alternativas establecidas no está verificado.
- La documentación no especifica la longitud de la ventana de audio soportada ni la frecuencia de muestreo esperada, lo que puede requerir experimentación por parte del usuario.
- El tamaño del repositorio es de 48.9 GB, lo que implica una descarga considerable incluso si solo se necesita un checkpoint.
- Al ser un modelo reciente (creado en junio de 2026), su ecosistema de herramientas y community es limitado.
- La licencia MIT permite uso comercial, pero el usuario debe verificar que los datos utilizados para fine-tuning no tengan restricciones adicionales.

## Enlaces

- HuggingFace: https://huggingface.co/spellbrush/PupuM2D
- Articulo arXiv: https://arxiv.org/abs/2606.25713
- Pagina del proyecto: https://www.yichenggu.com/PupuM2D/
- Repositorio GitHub: https://github.com/sizigi/PupuM2D/
- Perfil de Spellbrush en HuggingFace: https://huggingface.co/spellbrush
- Modelo relacionado de Spellbrush (AliasingFreeNeuralAudioSynthesis): https://huggingface.co/spellbrush/AliasingFreeNeuralAudioSynthesis
