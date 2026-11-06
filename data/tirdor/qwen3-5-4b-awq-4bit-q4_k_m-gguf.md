# Tirdor/Qwen3.5-4B-AWQ-4bit-Q4_K_M-GGUF

## Resumen

Tirdor/Qwen3.5-4B-AWQ-4bit-Q4_K_M-GGUF es una conversión al formato GGUF del modelo cyankiwi/Qwen3.5-4B-AWQ-4bit, que a su vez es una cuantización AWQ de 4 bits del modelo base Qwen/Qwen3.5-4B. Se trata, por tanto, de una cuantización de una cuantización: el checkpoint original en safetensors (4.326.350.848 parámetros, aproximadamente 4,3 mil millones) fue primero cuantizado a 4 bits con AWQ y después reconvertido a GGUF con cuantización Q4_K_M mediante el espacio GGUF-my-repo de ggml.ai sobre llama.cpp. El resultado es un único fichero de aproximadamente 2,8 GB pensado para inferencia local con llama.cpp.

El modelo pertenece a la familia Qwen3.5, una generación de modelos de la empresa china Alibaba (Qwen) que, según la etiqueta de pipeline `image-text-to-text`, incorpora capacidades multimodales de entrada de imagen y texto. La relevancia de esta ficha concreta es práctica: ofrece un artefacto ligero y ejecutable en hardware de consumo para quien quiera probar el modelo sin depender de GPUs con VRAM abundante ni de infraestructura de servido compleja.

Conviene subrayar que esta publicación no es un modelo original ni aporta entrenamiento, evaluación o documentación propios: es un derivado de conversión con cero descargas y cero likes en el momento de la consulta, creado el 5 de noviembre de 2026. La información técnica disponible sobre arquitectura, datos de entrenamiento, contexto e idiomas del modelo subyacente no está incluida en la model card de esta conversión, por lo que muchos campos de esta ficha se marcan como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de la familia Qwen3.5; pipeline declarado: image-text-to-text) |
| Parámetros totales | 4.326.350.848 (dato real de safetensors del modelo base) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el ejemplo de servidor de la model card usa `-c 2048`, pero es solo un valor de ejemplo, no el máximo del modelo) |
| Tipos de cuantización | Q4_K_M (GGUF); el modelo de origen era AWQ de 4 bits |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (fichero `qwen3.5-4b-awq-4bit-q4_k_m.gguf`) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base Qwen3.5-4B en la documentación proporcionada: la model card de esta conversión remite a la del modelo de origen (cyankiwi/Qwen3.5-4B-AWQ-4bit) y no detalla si se trata de un transformer denso, un modelo híbrido o una variante con atención lineal. La etiqueta de pipeline `image-text-to-text` sugiere un modelo multimodal con entrada de imagen y texto, pero no se especifican el codificador visual, la longitud de contexto nativa ni el esquema de atención.

Tampoco hay datos sobre el corpus de entrenamiento (número de tokens, composición, proporción de código o multilingüe), sobre si se aplicaron técnicas de alineación como RLHF o DPO, ni sobre innovaciones técnicas concretas. El proceso documentado en esta publicación es exclusivamente de conversión y cuantización: AWQ de 4 bits sobre el checkpoint original y posterior exportación a GGUF Q4_K_M con llama.cpp. Cualquier afirmación sobre el entrenamiento del modelo subyacente requeriría consultar la documentación oficial de Qwen.

## Capacidades

- Generación de texto conversacional: la etiqueta `conversational` y el pipeline `image-text-to-text` indican uso previsto en diálogo multi-turno.
- Entrada multimodal de imagen y texto: el pipeline declarado es image-text-to-text, por lo que se espera procesamiento conjunto de imágenes y texto (no verificable en la documentación de esta conversión).
- Inferencia local con llama.cpp: compatible con `llama-cli` y `llama-server` según los ejemplos de la model card.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere uso a través de infraestructura de endpoints compatible.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; no se listan idiomas.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Prototipado local de asistentes conversacionales: con un fichero GGUF de unos 2,8 GB, el modelo se puede cargar con `llama-server` en un portátil o estación de trabajo para iterar sobre prompts y flujos de diálogo sin coste de API ni dependencia de la nube.
- Pruebas de pipelines multimodales en local: al declararse como image-text-to-text, sirve para validar integraciones de entrada de imagen y texto en entornos de desarrollo antes de escalar a un modelo mayor o a un servicio gestionado.
- Evaluación comparativa de cuantizaciones: útil para medir la degradación de calidad de una cadena AWQ 4 bits → GGUF Q4_K_M frente al checkpoint original, en tareas de generación y diálogo.
- Despliegue en hardware de consumo: al caber en GPUs de gama media y en CPU con llama.cpp, permite montar demos o entornos de desarrollo internos en equipos sin aceleradores de datacenter.
- Integración en aplicaciones de escritorio o edge: el formato GGUF y la licencia Apache 2.0 facilitan empaquetar el modelo en herramientas locales de asistencia, resumen o clasificación de texto.
- Base para experimentos de ajuste fino o destilación: aunque esta publicación es solo de inferencia, el modelo de 4,3 mil millones de parámetros sirve como referencia de tamaño para estudios de eficiencia y comparativas de cuantización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero GGUF Q4_K_M ocupa aproximadamente 2,8 GB; con overhead de contexto y runtime, se puede estimar un consumo en torno a 3-4 GB de VRAM para contextos moderados (estimación orientativa, no publicada por el autor).
- GPU recomendadas: no hay recomendaciones oficiales; por tamaño, una RTX 3060 de 12 GB, RTX 4060 Ti o RTX 4090 pueden ejecutarlo con holgura. En datacenter, A100 o H100 no son necesarias para este tamaño.
- Compatibilidad con GPU de consumo: sí, previsiblemente en cualquier GPU con 4 GB o más de VRAM; también es viable en CPU mediante llama.cpp.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), y por formato GGUF, potencialmente otros runtimes compatibles como Ollama o servidores basados en llama.cpp; vLLM y TGI no están documentados para este artefacto en la información disponible.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tirdor/Qwen3.5-4B-AWQ-4bit-Q4_K_M-GGUF | 4,33 mil millones | no disponible | GGUF Q4_K_M | Apache 2.0 | Hugging Face (0 descargas) |
| cyankiwi/Qwen3.5-4B-AWQ-4bit (origen) | 4,33 mil millones | no disponible | safetensors AWQ 4 bits | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-4B (base) | 4,33 mil millones | no disponible | safetensors | Apache 2.0 | Hugging Face |
| Alternativas de otros fabricantes de ~4B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparado ni de especificaciones de modelos alternativos de la misma categoría en la información proporcionada; la comparativa se limita a la cadena de derivación del propio modelo.

## Limitaciones y advertencias

- Doble cuantización: el artefacto encadena AWQ de 4 bits y Q4_K_M, lo que puede acumular pérdida de calidad respecto al modelo original; no hay evaluación publicada de esa degradación.
- Documentación insuficiente: la model card no detalla arquitectura, contexto máximo, idiomas ni datos de entrenamiento; no es una fuente fiable para decisiones de producción sin consultar la documentación oficial de Qwen.
- Riesgo de alucinación: inherente a los modelos generativos de este tamaño; no hay evaluaciones publicadas que lo cuantifiquen.
- Sesgos: no disponibles; no se han documentado sesgos conocidos para esta conversión.
- Limitaciones de idioma: no se listan idiomas soportados; el comportamiento en castellano no está verificado.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base Qwen3.5-4B enlazada en la model card antes de redistribuir.
- Madurez: publicación con cero descargas y cero likes, creada y actualizada el mismo día; sin mantenimiento ni issues documentados.
- Contexto en el ejemplo: el `-c 2048` de la model card es un valor de ejemplo de `llama-server`, no el máximo del modelo; configurar un contexto mayor requiere conocer la ventana nativa, que no se documenta aquí.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Tirdor/Qwen3.5-4B-AWQ-4bit-Q4_K_M-GGUF
- Modelo de origen (AWQ 4 bits): https://huggingface.co/cyankiwi/Qwen3.5-4B-AWQ-4bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- Espacio GGUF-my-repo: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp
