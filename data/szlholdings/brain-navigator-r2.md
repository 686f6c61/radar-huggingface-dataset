# SZLHOLDINGS/brain-navigator-r2

## Resumen

BrainNavigator-R2 es un adaptador LoRA de 0.800 millones de parámetros desarrollado por SZL Holdings, una organización centrada en infraestructura de IA gobernada para decisiones inspeccionables. El adaptador se basa en el modelo Qwen/Qwen3.5-0.8B, que cuenta con licencia Apache-2.0, y está diseñado específicamente para tareas de navegación y abstención en agentes gobernados, con un énfasis en la recuperación de información y la toma de decisiones con límites de prueba.

El modelo se presenta como un "SKU separado" que no sobrescribe otros modelos de la misma familia, como SZL-Khipu-1.5B-BrainNavigator. Su entrenamiento se realizó con un currículum sintético de instrucciones NAVIGATE/ABSTAIN sobre 575 handles públicos, y se entrenó en una GPU RTX 5050 Laptop 8GB. La model card menciona que la elegibilidad para publicación es falsa hasta que se realice una generación medida, lo que sugiere que se trata de un experimento de investigación en fase temprana.

A pesar de su interés conceptual, el repositorio de Hugging Face muestra un tamaño de 0.0 GB y cero descargas, lo que indica que probablemente los pesos del adaptador no están disponibles públicamente o el repositorio está vacío. Esto limita su uso práctico inmediato.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador) sobre Qwen/Qwen3.5-0.8B |
| Parametros totales | No disponible (el adaptador LoRA tiene r=16, α=32, pero no se indica el número exacto de parámetros del adaptador) |
| Parametros activos | No disponible (al ser LoRA, solo se activan los parámetros del adaptador durante el ajuste fino) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen3.5-0.8B, pero no se especifica) |
| Tipos de cuantizacion | bf16 (según la model card, se usó bf16 para el LoRA; no se mencionan otras cuantizaciones) |
| Idiomas soportados | No disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (según los tags), aunque el repositorio parece vacío (0.0 GB) |

## Arquitectura y entrenamiento

BrainNavigator-R2 es un adaptador LoRA de rango 16 y alpha 32, entrenado en precisión bf16 sobre el modelo base Qwen/Qwen3.5-0.8B. La model card indica explícitamente que QLoRA está prohibido en Qwen3.5, por lo que el entrenamiento se realizó directamente en bf16 sin cuantización del adaptador. El entrenamiento se llevó a cabo en una GPU RTX 5050 Laptop 8GB (arquitectura Blackwell).

El proceso de entrenamiento utilizó un currículum sintético compuesto por instrucciones NAVIGATE y ABSTAIN, aplicadas sobre 575 handles públicos. No se especifica el número total de tokens de entrenamiento ni la composición exacta del dataset. La model card menciona un "grafo privado" con 9464 nodos admitidos a gradientes, pero el valor es 0, lo que sugiere que no se utilizaron datos privados en el entrenamiento. No se menciona el uso de RLHF, DPO u otras técnicas de alineación.

Una innovación destacable es el concepto de "governed-agent" (agente gobernado), que parece implicar un mecanismo de control para decisiones inspeccionables, con límites de prueba y recepción de estados. Sin embargo, los detalles técnicos concretos no están disponibles en la información proporcionada.

## Capacidades

- Generación de texto conversacional: al ser un adaptador sobre Qwen3.5-0.8B, hereda las capacidades básicas de generación de texto del modelo base, aunque no se especifican las capacidades exactas de Qwen3.5-0.8B.
- Navegación y abstención: el entrenamiento con instrucciones NAVIGATE/ABSTAIN sugiere que el adaptador está diseñado para decidir cuándo navegar (buscar información) y cuándo abstenerse de responder, probablemente en contextos de agentes con gobernanza.
- Recuperación de información: los tags incluyen "retrieval", lo que indica un enfoque en tareas de recuperación, posiblemente integrado con el "holograma de recuperación de software" mencionado en la model card.
- Soporte de tool calling y agentes: no se menciona explícitamente, pero la orientación a "governed-agent" y la existencia de un Developer Hub con integración MCP sugieren que podría haber soporte para herramientas, aunque no está confirmado en la información disponible.

## Casos de uso

Dado el estado experimental del modelo y la falta de pesos públicos, los casos de uso son hipotéticos y basados en la descripción del autor:

- Agentes de IA gobernados: el modelo podría utilizarse como componente de decisión en un sistema agéntico donde se requiere inspeccionabilidad y límites de prueba. Por ejemplo, un agente que debe abstenerse de actuar cuando no tiene información suficiente, evitando decisiones no verificables.
- Recuperación de información con control de calidad: el adaptador podría integrarse en un pipeline de retrieval-augmented generation (RAG) donde la abstención se activa cuando la confianza en los documentos recuperados es baja, reduciendo alucinaciones.
- Prototipos de investigación en gobernanza de IA: dado su tamaño reducido (0.8B), es adecuado para experimentos académicos sobre mecanismos de control y verificación en modelos pequeños.
- Evaluación de currículums sintéticos: el modelo podría servir como banco de pruebas para estudiar el efecto de entrenamientos basados en NAVIGATE/ABSTAIN en la capacidad de un modelo para reconocer sus propios límites.
- Integración en el ecosistema SZL Holdings: como parte de la infraestructura "governed-agent", podría usarse junto con el repositorio SZL-Khipu-1.5B-BrainNavigator para tareas específicas que requieran un modelo más pequeño.
- Demostraciones de LoRA sobre Qwen3.5: al ser un adaptador LoRA, puede servir como ejemplo de ajuste fino eficiente en parámetros para la familia Qwen3.5.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona un archivo `eval_report.json` con resultados de generación "Named-N", pero no se proporcionan datos numéricos. Tampoco hay comparaciones con otros modelos en la información proporcionada.

## Requisitos de hardware

- Al ser un adaptador LoRA sobre un modelo base de 0.8B, la inferencia requiere cargar el modelo base Qwen3.5-0.8B más los pesos del adaptador. El modelo base en bf16 ocupa aproximadamente 1.6 GB de VRAM (0.8B × 2 bytes), por lo que cabe en GPUs con al menos 2-4 GB de VRAM.
- El entrenamiento se realizó en una RTX 5050 Laptop 8GB, lo que indica que el ajuste fino es factible en GPUs de consumo medio con 8GB de VRAM.
- Para despliegue, se podría usar vLLM, llama.cpp, Ollama o TGI, siempre que se convierta el adaptador al formato adecuado (por ejemplo, GGUF). Sin embargo, no se proporcionan archivos GGUF para este adaptador específico.
- La latencia y el throughput dependen del hardware y del motor de inferencia. Para un modelo de 0.8B, se espera una latencia baja (del orden de decenas de milisegundos por token en GPUs modernas), pero no hay datos oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| SZLHOLDINGS/brain-navigator-r2 | LoRA sobre 0.8B | No disponible | Apache-2.0 | safetensors (repo vacío) | No disponible (0 descargas, 0.0 GB) |
| SZLHOLDINGS/SZL-Khipu-1.5B-BrainNavigator | 1.5B | No disponible | No especificada | No especificado | Disponible en Hugging Face (con versión GGUF por mradermacher) |
| Qwen/Qwen3.5-0.8B (modelo base) | 0.8B | No disponible | Apache-2.0 | safetensors | Disponible |

La comparativa se limita a modelos de la misma familia SZL Holdings y al modelo base. No hay datos de rendimiento para establecer comparaciones cuantitativas. El modelo BrainNavigator-R2 se distingue por su tamaño reducido y su enfoque en gobernanza, pero su disponibilidad práctica es nula en el momento de redactar esta ficha.

## Limitaciones y advertencias

- El repositorio de Hugging Face tiene un tamaño de 0.0 GB y cero descargas, lo que sugiere que los pesos del adaptador no están subidos o el repositorio está vacío. No es posible utilizarlo directamente.
- La model card indica que `publication_eligible` es falso hasta que se realice una generación medida. Esto implica que el modelo no está validado ni listo para uso público.
- No se proporcionan datos sobre sesgos, alucinaciones o limitaciones de contexto. Al ser un adaptador sobre un modelo pequeño (0.8B), es probable que tenga limitaciones significativas en tareas complejas.
- La licencia Apache-2.0 permite uso comercial, pero al no haber pesos disponibles, esta licencia es teórica.
- El concepto de "governed-agent" no está documentado en detalle; no hay especificaciones sobre cómo se implementa la gobernanza ni qué garantías ofrece.
- La fecha de creación (2026-08-29) es posterior a la fecha actual, lo que podría indicar un error en los metadatos o un modelo ficticio. No se debe asumir que es un modelo real y funcional.

## Enlaces

- [Página del modelo en Hugging Face](https://huggingface.co/SZLHOLDINGS/brain-navigator-r2)
- [Modelo relacionado: SZL-Khipu-1.5B-BrainNavigator](https://huggingface.co/SZLHOLDINGS/SZL-Khipu-1.5B-BrainNavigator)
- [Versión GGUF de SZL-Khipu-1.5B-BrainNavigator](https://huggingface.co/mradermacher/SZL-Khipu-1.5B-BrainNavigator-GGUF)
- [Perfil de SZL Holdings en Hugging Face](https://huggingface.co/SZLHOLDINGS)
- [GitHub de SZL Holdings](https://github.com/szl-holdings)
- [Developer Hub de SZL Holdings](https://holdings.a-11-oy.com/docs-site/developers/)
- [Espacio second-brain (holograma de recuperación)](https://huggingface.co/spaces/SZLHOLDINGS/second-brain)
