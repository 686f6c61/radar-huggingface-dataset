# Thox-ai/ThoxIOS-Edge-1.5B

## Resumen

ThoxIOS-Edge-1.5B es un paquete de configuración publicado por Thox-ai sobre los pesos upstream de Qwen/Qwen2.5-1.5B-Instruct. No se trata de un modelo entrenado por THOX: el repositorio contiene únicamente el `Modelfile` de Ollama, un `manifest.json` de release y un knowledge pack en JSONL (8 entradas públicas verificadas). Los pesos reales se descargan desde la etiqueta `qwen2.5:1.5b` de Ollama, fijada por digest en el manifiesto.

El objetivo declarado es servir como asistente local y enrutador dentro del ecosistema THOX iOS, con entrega prevista en formato GGUF móvil Q4_K_M y ejecución offline mediante el endpoint local de Ollama. La personalización consiste en un perfil de sistema embebido en el Modelfile más el knowledge pack v0.1 para respuestas ancladas a contexto suministrado.

Su relevancia es limitada y muy específica: no aporta mejoras de capacidad sobre el modelo base, sino un envoltorio reproducible con reglas de comportamiento (por ejemplo, no afirmar estado en vivo ni telemetría inexistente) y una medición de rendimiento en CPU. Cualquier evaluación de calidad debe remitirse a Qwen2.5-1.5B-Instruct, ya que THOX no ha entrenado ni ajustado los pesos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-1.5B-Instruct); no se detalla en la información disponible |
| Parametros totales | 1,5B (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens (contexto usado en la evaluación); contexto nativo del base no indicado en la información disponible |
| Tipos de cuantizacion | Q4_K_M (objetivo de entrega móvil y build servido en Ollama); otras cuantizaciones no disponibles |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 (heredada del modelo base) |
| Formato de pesos | GGUF vía Ollama (el repositorio no contiene pesos: Modelfile, manifest.json y knowledge pack JSONL) |

## Arquitectura y entrenamiento

No hay entrenamiento. El modelo es un envoltorio de configuración sobre Qwen2.5-1.5B-Instruct, cuya arquitectura es la del transformer decoder-only de la familia Qwen2.5, con los pesos descargados desde la etiqueta `qwen2.5:1.5b` de Ollama y fijados al digest `65ec06548149b04c096a120e4a6da9d4017ea809c91734ea5631e89f96ddc57b`. La única capa propia es el perfil de sistema incluido en el `Modelfile`, que se suma a la capa base al construir la imagen de Ollama.

La innovación declarada no es arquitectónica sino de comportamiento: tras una primera compilación que "siguió la trampa" de una pregunta sobre topología de red inventada, el perfil se reforzó con una regla explícita de estado en vivo colocada al principio y una frase de cierre sobre ausencia de telemetría, publicándose solo la segunda pasada. El knowledge pack v0.1 (4.652 bytes, 8 entradas JSONL) actúa como material de recuperación para anclar respuestas. No se documentan datos de entrenamiento, composición de dataset ni etapas de RLHF/DPO propias, porque no existen.

## Capacidades

- Generación de texto conversacional y respuestas cortas, heredadas de Qwen2.5-1.5B-Instruct.
- Respuestas ancladas al knowledge pack v0.1 cuando se le suministra el pasaje correspondiente (7 de 8 temas respondidos con los hechos del pack en la evaluación del autor).
- Comportamiento guiado por perfil de sistema: recomendación de enrutamiento etiquetada como tal (local primero, nube solo con consentimiento explícito) en lugar de afirmar estado en vivo.
- Rechazo de confirmaciones sobre topologías o estados fabricados (trampa de topología superada en la build publicada).
- Ejecución local y offline mediante el endpoint local de Ollama, sin dependencia de red.
- Descubrimiento MeshStack y ejecución autorizada únicamente si se usa el runtime opcional de THOX; los pesos por sí solos no proporcionan enrutamiento en vivo ni acceso a malla.
- No se declaran capacidades de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito en la información disponible.

## Casos de uso

- Asistente local en dispositivo iOS: el modelo se ejecuta en el endpoint local de Ollama con un build Q4_K_M de 0,99 GB, adecuado para un asistente offline en hardware que soporte un modelo de 1,5B cuantizado.
- Enrutamiento local-primero: el perfil de sistema fuerza a responder con una recomendación etiquetada (local primero, nube solo con consentimiento), útil como capa de decisión en un cliente que deba elegir entre inferencia local y remota.
- Respuestas de referencia sobre el producto THOX: con el knowledge pack v0.1 inyectado como contexto, el modelo responde sobre especificaciones verificadas del ecosistema sin inventarlas.
- Pruebas de robustez frente a alucinación de estado: sirve como caso de estudio reproducible de cómo un perfil de sistema refuerza el rechazo a confirmar topologías o telemetrías inexistentes.
- Despliegue en hosts modestos: la medición en un x86_64 de 4 vCPU y 8 GB con 1,37 GB de RAM en carga lo hace viable en servidores pequeños o contenedores sin GPU.
- Base para paquetes de configuración reproducibles: el par `Modelfile` + `manifest.json` con digest fijado sirve de plantilla para versionar perfiles de sistema y knowledge packs sobre pesos upstream.
- Evaluación comparativa de envoltorios: permite medir cuánto aporta un perfil de sistema frente al base sin reentrenar, usando las mismas preguntas de humo.

## Benchmarks y rendimiento

Mediciones del autor, realizadas el 2026-10-31 en un host x86_64 solo CPU (clase 4 vCPU / 8 GB), a 8.192 tokens de contexto, sobre la configuración publicada:

| Metrica | Resultado |
|---|---|
| Generación de formato largo (bench de 1.024 tokens) | 35,67 tokens/s |
| Respuestas cortas (conjunto de humo) | 21,3–23,4 tokens/s |
| Huella de memoria en carga | 1,37 GB RAM (0 GB VRAM, ejecución en CPU) |
| Preguntas de humo de fábrica | 3/3 respondidas de forma coherente y alineada con el perfil |
| Anclaje al Knowledge Pack v0.1 (pasaje suministrado, una pregunta por tema) | 7/8 temas respondidos con los hechos del pack |
| Trampa de topología fabricada | el modelo rechazó confirmar la topología inventada |
| Pregunta de enrutamiento | respondida como recomendación etiquetada, no como afirmación de estado en vivo |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 0 GB en la configuración medida (ejecución en CPU); en GPU, un modelo de 1,5B en Q4_K_M ocupa aproximadamente 1 GB de pesos más overhead de contexto, aunque no se ha publicado una medición de VRAM.
- RAM: 1,37 GB en carga según la medición del autor en un host de 8 GB.
- GPU recomendadas: no disponibles; no se han publicado pruebas en GPU. Por tamaño, cualquier GPU consumer con 4 GB o más de VRAM podría alojarlo, pero es una estimación, no un dato medido.
- Cabe en GPU consumer: sí, por tamaño (1,5B en Q4_K_M), si bien la única validación publicada es en CPU.
- Opciones de despliegue: Ollama (vía `ollama run Thox-ai/thox-ios-edge-1.5b` o construcción local con el `Modelfile`); otras herramientas (vLLM, llama.cpp directo, TGI) no están documentadas para este paquete.
- Latencia y throughput: 35,67 tokens/s en generación larga y 21,3–23,4 tokens/s en respuestas cortas, medidos en CPU x86_64 de 4 vCPU.
- Cualificación en hardware de dispositivo: no cualificado según el propio autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / entrega | Notas |
|---|---|---|---|---|---|
| ThoxIOS-Edge-1.5B | 1,5B | 8.192 (usado en evaluación) | Apache-2.0 | GGUF Q4_K_M vía Ollama | Envoltorio de configuración; sin entrenamiento propio |
| Qwen/Qwen2.5-1.5B-Instruct | 1,5B | no disponible en la información proporcionada | Apache-2.0 | safetensors y múltiples (upstream) | Modelo base; referencia real de capacidad |
| Alternativas de 1–2B de otras familias | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

La comparación relevante es contra su propio base: ThoxIOS-Edge-1.5B no modifica los pesos, por lo que su calidad intrínseca es la de Qwen2.5-1.5B-Instruct; la diferencia se limita al perfil de sistema y al knowledge pack.

## Limitaciones y advertencias

- Modelo de 1,5B: razonamiento y recuperación de memoria materialmente limitados; el propio autor advierte de que las respuestas deben tratarse en consecuencia.
- El conocimiento está restringido al pack suministrado y a la recuperación; sin contexto, el modelo debe declararlo en lugar de inventar especificaciones de THOX, pero no hay garantía de que siempre lo haga.
- El comportamiento de rechazo es el del modelo base, moderado solo por el perfil de sistema; no se comercializa como "uncensored".
- Riesgo de alucinación inherente al base, especialmente en preguntas factuales fuera del pack; el 7/8 de anclaje se midió con el pasaje suministrado, no en modo abierto.
- Idiomas: solo inglés declarado; no hay soporte multilingüe documentado.
- Contexto: la evaluación usa 8.192 tokens; el contexto nativo del base no se detalla en la información disponible.
- Acciones externas requieren autorización del runtime; los pesos por sí solos no ofrecen enrutamiento en vivo ni acceso a malla MeshStack.
- No cualificado en hardware de dispositivo; la entrega móvil es un objetivo (GGUF Q4_K_M), no una validación.
- Licencia Apache-2.0 heredada: permite uso comercial, pero los elementos propios de THOX (perfil de sistema, knowledge pack, empaquetado) también se declaran bajo esa licencia, sin restricciones adicionales indicadas.
- Repositorio sin descargas ni likes en el momento de la consulta y con pesos no alojados en Hugging Face: la reproducibilidad depende de que la etiqueta `qwen2.5:1.5b` de Ollama siga disponible en el digest fijado.

## Enlaces

- Hugging Face: https://huggingface.co/Thox-ai/ThoxIOS-Edge-1.5B
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Modelo publicado en Ollama: `Thox-ai/thox-ios-edge-1.5b` (referencia textual en la model card; no se proporciona URL directa)
- Papers, blogs, repositorios o demos adicionales: no disponibles en la información proporcionada.
