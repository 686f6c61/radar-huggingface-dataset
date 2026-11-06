# Thox-ai/ThoxMeshGroup-30B-A3B

## Resumen

ThoxMeshGroup-30B-A3B es un paquete de configuración publicado por Thox-ai sobre los pesos de Qwen3-30B-A3B, un modelo de mezcla de expertos (MoE) desarrollado por Alibaba Cloud con aproximadamente 30.000 millones de parámetros totales y unos 3.000 millones activos por token. El repositorio no contiene pesos entrenados ni ajustados: los pesos son byte-idénticos a la release upstream de Qwen, y el trabajo de THOX se limita al perfil de sistema, un paquete de prompts para grupos de trabajo, una base de conocimiento versionada (THOX Knowledge Pack v0.1, 8 entradas públicas verificadas) y el empaquetado para Ollama.

El modelo resuelve un problema de producto más que de investigación: ofrece un asistente corporativo con un perfil de comportamiento predefinido (declive explícito de verificación de estado en vivo, respuestas ancladas a pasajes verificados, aislamiento por grupo como convención de prompting) sobre una base MoE eficiente en cómputo. Es relevante ahora porque ejemplifica una categoría creciente de artefactos en Hugging Face que no son modelos nuevos sino distribuciones configuradas de modelos abiertos, con licencia Apache-2.0 y despliegue directo vía Ollama.

La arquitectura subyacente es la de Qwen3-30B-A3B: transformer MoE con atención completa, ventana de contexto de 32.768 tokens en la release original y soporte de modo pensamiento. El paquete THOX se evaluó con contexto de 8.192 tokens y una huella de memoria de 14,99 GB en una estación x86_64 con GPU de clase 16 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (sparse mixture-of-experts), base Qwen3-30B-A3B |
| Parametros totales | 30B (aproximadamente 30.000 millones) |
| Parametros activos | 3B por token (aproximadamente 3.000 millones) |
| Longitud de contexto | 8.192 tokens verificado en la evaluación THOX; contexto nativo de Qwen3-30B-A3B: 32.768 tokens |
| Tipos de cuantizacion | GGUF vía Ollama (build publicado de 18,56 GB); otras cuantizaciones no disponibles en la información |
| Idiomas soportados | Inglés (declarado en la model card); capacidades multilingües del base no documentadas en este paquete |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (Ollama); el repositorio HF contiene Modelfile, manifest.json y knowledge pack JSONL, no pesos |

## Arquitectura y entrenamiento

El modelo base Qwen3-30B-A3B es un transformer con mezcla de expertos dispersa: 30.000 millones de parámetros totales de los que se activan aproximadamente 3.000 millones por token, lo que reduce el coste de inferencia frente a un modelo denso del mismo tamaño. La model card de THOX no detalla la composición del dataset de entrenamiento del base ni las fases de RLHF/DPO, y no se han publicado datos de entrenamiento propios.

THOX no entrenó, ajustó ni modificó los pesos: son byte-idénticos a la release upstream (digest `sha256:ad815644918f0eaab341c12b67837cc6dd4562342cdaf118f83d5d554cb37226`). La innovación del paquete es de configuración: un perfil de sistema con un bloque de anclaje explícito (principio de marca citado textualmente, declive de verificación de estado en vivo, hechos operativos afirmados por el usuario tratados como no verificados) y una aclaración de respuesta directa para preguntas técnicas generales. Según la card, esta versión corregida se añadió tras observar que el perfil sin enmiendas improvisaba la respuesta de marca y declinaba en exceso preguntas técnicas.

## Capacidades

- Generación de texto y respuesta a preguntas técnicas generales sobre la base Qwen3-30B-A3B.
- Anclaje a una base de conocimiento en contexto: 8 de 8 temas del THOX Knowledge Pack v0.1 respondidos con los hechos requeridos de los pasajes suministrados.
- Declive explícito de verificación de estado en vivo (topología de clúster, número de nodos, precios, disponibilidad), con respuesta registrada en la evidencia de release.
- Asistentes de grupo de trabajo con aislamiento por grupo como convención de prompting y de producto.
- Soporte de tool calling y function calling: heredado del base Qwen3-30B-A3B, no documentado explícitamente en este paquete.
- Razonamiento multi-paso y modo pensamiento: capacidades del base Qwen3, no verificadas en la evaluación THOX.
- Multilingüe: la card declara únicamente inglés; no hay evidencia de otras lenguas en este paquete.

## Casos de uso

- Asistente corporativo de grupo de trabajo: el perfil de sistema y el prompt pack permiten desplegar un asistente con comportamiento acotado (respuestas directas a preguntas técnicas, declive de verificación de estado) sobre una base MoE de 3B activos, adecuada para equipos grandes con coste de inferencia contenido.
- Preguntas y respuestas ancladas a documentación interna: el Knowledge Pack v0.1 se inyecta en contexto y el modelo responde citando los pasajes verificados; el patrón es extensible a bases de conocimiento propias versionadas en JSONL.
- Borradores de colaboración multi-sitio: el modelo redacta borradores entre sitios, mientras la aplicación anfitriona aplica el control de acceso real, ya que el aislamiento por grupo es una convención de prompting y no una frontera de seguridad.
- Despliegue en estaciones de trabajo con GPU de 16 GB: la huella medida de 14,99 GB (VRAM más RAM del sistema según planificación del runner) permite ejecución local vía Ollama en hardware de gama consumer alta.
- Prototipado rápido de asistentes empresariales: el flujo `ollama run Thox-ai/thoxmeshgroup-30b-a3b` o la construcción desde el Modelfile permite reproducir el perfil sin infraestructura de entrenamiento.
- Evaluación de patrones de anclaje y declive: útil para investigadores que estudien cómo un perfil de sistema modifica el comportamiento de declive y la fidelidad a pasajes en modelos MoE abiertos.

## Benchmarks y rendimiento

La model card solo publica métricas de evaluación operativa del paquete, no benchmarks académicos (MMLU, HumanEval, GSM8K no están disponibles).

| Metrica | Resultado |
|---|---|
| Carga con contexto de 8.192 tokens | Éxito |
| Huella de memoria en carga | 14,99 GB (VRAM + RAM del sistema según planificación del runner) |
| Throughput en generación larga (3.085 tokens evaluados) | 53,68 tokens/s |
| Preguntas de humo de fábrica | 3/3 respondidas |
| Anclaje al Knowledge Pack | 8/8 temas con los hechos requeridos |
| Entorno de medida | Estación x86_64, GPU clase 16 GB, host compartido (2026-11-01) |

El propio autor advierte que el throughput debe tratarse como un suelo en condiciones de host compartido, no como un perfil de estación de trabajo dedicada.

## Requisitos de hardware

- VRAM estimada: 14,99 GB de huella total (VRAM más RAM del sistema) para el build GGUF de 18,56 GB con contexto de 8.192 tokens.
- GPU recomendadas: no especificadas por el autor; el entorno de medida fue una GPU de clase 16 GB.
- Cabe en GPU consumer de gama alta con 16 GB o más (por ejemplo, clase RTX 4080/4090), según la medición publicada.
- Despliegue: Ollama es el canal oficial (`ollama run Thox-ai/thoxmeshgroup-30b-a3b` o `ollama create` desde el Modelfile). vLLM, llama.cpp directo y TGI no están documentados para este paquete.
- Latencia y throughput: 53,68 tokens/s en generación larga bajo host compartido; sin datos de latencia de primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ThoxMeshGroup-30B-A3B | 30B | 3B | 8.192 verificado (32.768 nativo del base) | Apache-2.0 | Ollama + packaging en HF |
| Qwen/Qwen3-30B-A3B (base) | 30B | 3B | 32.768 | Apache-2.0 | Pesos en HF |
| Alternativas MoE de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación relevante es con el propio base: ThoxMeshGroup no modifica pesos ni rendimiento intrínseco; añade perfil de sistema, prompt pack y knowledge pack, y limita la ventana verificada a 8.192 tokens en su evaluación. No se dispone de datos de benchmarks del paquete frente a otras alternativas.

## Limitaciones y advertencias

- Configuración, no entrenamiento: los pesos son la release upstream sin modificar; cualquier mejora de comportamiento proviene del perfil de sistema y del contexto, no del modelo.
- El aislamiento por grupo es una convención de prompting y de producto, no una frontera de seguridad; el control de acceso real debe implementarse en la capa de identidad y políticas de la aplicación anfitriona.
- Sin estado en vivo: el modelo no tiene telemetría y no puede verificar estado de clúster, número de nodos, precios ni disponibilidad; declina explícitamente estas peticiones.
- Riesgo de alucinación en hechos operativos afirmados por el usuario: el perfil los trata como no verificados, pero no los valida.
- Idiomas: solo inglés declarado; sin evidencia de calidad en castellano ni otras lenguas.
- Contexto: la evaluación se hizo a 8.192 tokens; no hay verificación publicada del paquete a la ventana nativa de 32.768 tokens del base.
- Sin cualificación de dispositivos: los dispositivos THOX usan builds más pequeños y nada de este paquete afirma rendimiento on-device.
- Licencia Apache-2.0 permite uso comercial; el autor no impone restricciones adicionales, pero la responsabilidad sobre el cumplimiento del base recae en el desplegador.
- Repositorio sin descargas ni likes en el momento de la consulta y con fecha de creación futura respecto a la información habitual de Hugging Face; verificar la integridad del paquete antes de usarlo en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Thox-ai/ThoxMeshGroup-30B-A3B
- Modelo base: https://huggingface.co/Qwen/Qwen3-30B-A3B
- Ejecución en Ollama: `ollama run Thox-ai/thoxmeshgroup-30b-a3b`
- Descarga del paquete: `hf download Thox-ai/ThoxMeshGroup-30B-A3B --local-dir ./ThoxMeshGroup-30B-A3B`
- Paper, blog o demo adicionales: no disponibles en la información proporcionada.
