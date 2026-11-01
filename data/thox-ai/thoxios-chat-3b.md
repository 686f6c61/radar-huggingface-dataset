# Thox-ai/ThoxIOS-Chat-3B

## Resumen

ThoxIOS-Chat-3B es un paquete de configuración publicado por Thox-ai sobre los pesos del modelo Qwen2.5-3B-Instruct de Alibaba Qwen. No se trata de un modelo entrenado por Thox-ai: el repositorio contiene únicamente un `Modelfile` de Ollama, un manifiesto de release y un knowledge pack en JSONL, mientras que los pesos reales son los del modelo base, descargados por Ollama desde un tag fijado (`qwen2.5:3b`) con digest concreto. El objetivo declarado es ofrecer un asistente de chat local-first para iOS, ejecutable offline mediante Ollama en hardware que soporte un modelo de 3B en cuantización Q4.

La propuesta diferencial no es de modelado sino de empaquetado: un perfil de sistema (system prompt) orientado a iOS y un knowledge pack versionado de ocho entradas públicas verificadas, pensado para respuestas con recuperación (retrieval-grounded). El autor documenta una evaluación propia en CPU (x86_64, 4 vCPU, 8 GB) a 8.192 tokens de contexto, con 11,32 tokens/s en generación larga y 2,42 GB de RAM en carga, además de pruebas de resistencia a alucinación de topología y de enrutamiento.

Es relevante ahora por dos motivos: por un lado, ilustra la práctica creciente de distribuir "modelos" que son en realidad configuraciones reproducibles sobre pesos ajenos; por otro, su licencia Qwen Research (no comercial) y su estado sin cualificar en hardware móvil lo sitúan como artefacto de evaluación, no como componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-3B-Instruct) |
| Parametros totales | 3B (modelo base) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 8.192 tokens (contexto usado en la evaluación del autor); contexto nativo del base Qwen2.5-3B: no disponible en la información proporcionada |
| Tipos de cuantizacion | Q4_K_M (build servido en Ollama, 1,93 GB); otras cuantizaciones del base: no disponibles en la información proporcionada |
| Idiomas soportados | Inglés (declarado en la model card) |
| Licencia | Qwen Research License (uso exclusivamente de investigación y no comercial) |
| Formato de pesos | GGUF vía Ollama; el repositorio solo contiene Modelfile, manifest.json y thox-knowledge-v0.1.jsonl (no incluye pesos) |

## Arquitectura y entrenamiento

No hay entrenamiento por parte de Thox-ai. El modelo base es Qwen2.5-3B-Instruct, un transformer decoder-only denso de 3.000 millones de parámetros publicado por Qwen. Thox-ai fija ese base mediante el tag de Ollama `qwen2.5:3b` con digest `357c53fb659c5076de1d65ccb0b397446227b71a42be9d1603d46168015c9e4b`, y añade dos capas de personalización: un perfil de sistema incluido en el `Modelfile` y el THOX Knowledge Pack v0.1 (8 entradas públicas verificadas en JSONL, 4.652 bytes) para respuestas ancladas a contexto suministrado.

La única innovación técnica documentada es de ingeniería de prompt: tras un primer build en el que el modelo "siguió el juego" a una pregunta trampa sobre topología de red, el autor reforzó el perfil con una regla explícita de estado en vivo al inicio del prompt y una frase de cierre sobre ausencia de telemetría, publicando solo el segundo build. No se documentan datos de entrenamiento, número de tokens, composición del dataset ni etapas de RLHF o DPO, porque no existen para este artefacto: son los del modelo base y no se detallan en la información proporcionada.

## Capacidades

- Generación de texto conversacional en inglés, heredada de Qwen2.5-3B-Instruct.
- Respuestas ancladas a un knowledge pack suministrado (retrieval-grounded) sobre temática iOS y del propio ecosistema THOX.
- Comportamiento de rechazo ante preguntas trampa sobre topología de red fabricada (verificado en la evaluación del autor).
- Enrutamiento expresado como recomendación etiquetada (local primero, nube solo con consentimiento explícito), no como afirmación de estado en vivo.
- Funcionamiento standalone y offline mediante el endpoint local de Ollama.
- Descubrimiento MeshStack y ejecución autorizada solo si se usa el runtime opcional de THOX; los pesos por sí solos no proporcionan enrutamiento ni acceso a malla.
- Tool calling / function calling: no disponible en la información proporcionada (no se documenta para este paquete).
- Capacidades multimodales (visión, audio): no disponibles.
- Modo thinking explícito: no disponible.

## Casos de uso

- Asistente de chat offline en iOS para consultas frecuentes: el paquete se distribuye como GGUF Q4_K_M de 1,93 GB y se ejecuta con `ollama run`, de modo que puede servir respuestas sobre un corpus acotado sin conexión. Adecuado por tamaño, aunque el autor advierte que no está cualificado en hardware de dispositivo.
- Soporte de primer nivel con base de conocimiento cerrada: las 8 entradas del knowledge pack permiten respuestas ancladas a hechos verificados y un comportamiento medido de 6/8 aciertos con pasaje suministrado; útil para FAQ internas donde se prefiere decir "no lo sé" antes que inventar.
- Prototipado de flujos de recomendación con consentimiento: el modelo produce recomendaciones etiquetadas (local primero, nube con consentimiento) en lugar de afirmar estados en vivo, lo que encaja en asistentes de privacidad que deben explicitar el destino de los datos.
- Evaluación de pipelines de empaquetado de modelos: sirve como caso de estudio reproducible de cómo versionar un `Modelfile`, un manifiesto con digest del base y un knowledge pack, y de cómo medir latencia y huella de memoria en CPU.
- Pruebas de robustez frente a alucinación: la trampa de topología fabricada es un test reutilizable para validar system prompts en asistentes que no deben confirmar información de infraestructura no verificada.
- Generación de texto corto en entornos con recursos limitados: con 2,42 GB de RAM en carga y 9,6-12,5 tokens/s en respuestas cortas sobre 4 vCPU, es viable para resúmenes breves o clasificación textual en servidores pequeños y sin GPU.
- Base para fine-tuning posterior en investigación: al ser un 3B denso con licencia de investigación, puede emplearse como punto de partida en experimentos académicos de ajuste supervisado, siempre dentro de los términos no comerciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor sí documenta mediciones propias de la configuración publicada, realizadas el 2026-10-31 en un host x86_64 solo CPU (4 vCPU, clase 8 GB) a 8.192 tokens de contexto:

| Prueba | Resultado |
|---|---|
| Generación larga (bench de 1.024 tokens) | 11,32 tokens/s |
| Respuestas cortas (set de smoke) | 9,6-12,5 tokens/s |
| Huella de memoria en carga | 2,42 GB RAM (0 GB VRAM, ejecución en CPU) |
| Preguntas de smoke de fábrica | 3/3 respondidas de forma coherente y alineada con el perfil |
| Grounding con Knowledge Pack v0.1 (pasaje suministrado, una pregunta por tema) | 6/8 temas respondidos con los hechos del pack |
| Trampa de topología fabricada | El modelo rechazó confirmar la topología inventada |
| Pregunta de enrutamiento | Respondida como recomendación etiquetada, no como afirmación de estado en vivo |

## Requisitos de hardware

- VRAM estimada: 0 GB en la configuración medida (ejecución en CPU); para el GGUF Q4_K_M de 1,93 GB, una GPU con 4 GB o más de VRAM debería poder alojarlo, aunque no se han publicado mediciones en GPU.
- RAM: 2,42 GB en carga según la evaluación del autor en CPU; se recomienda al menos 8 GB de RAM de sistema para holgura.
- GPU recomendadas: no disponibles en la información proporcionada; el autor solo documenta ejecución en CPU x86_64 con 4 vCPU.
- ¿Cabe en GPU de consumo? Por tamaño (3B en Q4_K_M) es previsible que sí en tarjetas con 4-8 GB de VRAM, pero no hay validación publicada; el autor indica explícitamente que el modelo no está cualificado en hardware de dispositivo.
- Opciones de despliegue: Ollama (vía `ollama run Thox-ai/thox-ios-chat-3b` o build local con `ollama create`); otros runtimes (llama.cpp, vLLM, TGI) no están documentados para este paquete.
- Latencia y throughput: 11,32 tokens/s en generación de 1.024 tokens y 9,6-12,5 tokens/s en respuestas cortas, medidos en CPU (4 vCPU, 8 GB).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / disponibilidad | Notas |
|---|---|---|---|---|---|
| ThoxIOS-Chat-3B | 3B (denso) | 8.192 (usado en evaluación) | Qwen Research (no comercial) | GGUF vía Ollama; repo con Modelfile y knowledge pack | Configuración sobre Qwen2.5-3B-Instruct, sin entrenamiento propio |
| Qwen2.5-3B-Instruct | 3B (denso) | No disponible en la información proporcionada | Qwen Research (no comercial) | Pesos publicados por el autor original; safetensors y GGUF vía Ollama | Es el base exacto de este paquete; sin perfil ni knowledge pack |
| Otros asistentes iOS locales de 3B | No disponible | No disponible | No disponible | No disponible | No se dispone de datos verificables en la información proporcionada |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo de 3B: el propio autor reconoce razonamiento y recuerdo materialmente limitados; el 6/8 en grounding con pasaje suministrado es la cifra medida y no debe extrapolarse.
- Riesgo de alucinación: sin contexto suministrado, el modelo puede inventar especificaciones; el perfil de sistema incluye una regla para que diga que no dispone de la información, pero su cumplimiento no es garantizable.
- El comportamiento de rechazo es el del modelo base, moderado solo por el system prompt; no se comercializa como "uncensored".
- Conocimiento restringido al knowledge pack (8 entradas) y a la recuperación que se le suministre; no hay conocimiento actualizado más allá de esa base.
- Idioma: solo inglés declarado; el rendimiento en castellano no está evaluado ni documentado.
- Licencia Qwen Research: uso exclusivamente de investigación y no comercial; no se permite el uso comercial ni el marketing comercial del listing. Los términos del modelo base prevalecen.
- Acciones externas (descubrimiento MeshStack, ejecución autorizada) requieren el runtime opcional de THOX; los pesos por sí solos no ofrecen enrutamiento ni acceso a malla.
- No cualificado en hardware de dispositivo: el objetivo de entrega es un GGUF móvil Q4_K_M, pero las mediciones se hicieron en CPU x86_64, no en iOS.
- Repositorio sin pesos: quien quiera ejecutarlo depende del tag fijado de Ollama; cualquier cambio en el upstream o en el tag afecta a la reproducibilidad.
- Métricas de adopción nulas en el momento de la ficha (0 descargas, 0 likes) y publicación muy reciente; no hay validación independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Thox-ai/ThoxIOS-Chat-3B
- Modelo base en HuggingFace: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Ejecución en Ollama: `ollama run Thox-ai/thox-ios-chat-3b` (tag `qwen2.5:3b` fijado en el manifiesto)
- Paper, blog, repositorio de código o demo adicionales: no disponibles en la información proporcionada.
