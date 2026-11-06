# Urbanwarrior79/omnigenesis-stability-gguf

## Resumen

`omnigenesis-stability-gguf` es un artefacto de inferencia en formato GGUF publicado por el usuario Urbanwarrior79 bajo el identificador interno `omni-lyapunov-prover`. Se presenta como la exportación pública de un especialista del proyecto Omnigenesis dedicado a la "estabilidad": según la model card, su función es auditar afirmaciones de estabilidad y emitir un veredicto PROVEN, UNPROVEN o REFUTED acompañado de artefactos formales. No es un checkpoint base para fine-tuning convencional, sino un fichero pensado para ejecutarse en runtimes compatibles con GGUF como llama.cpp, LM Studio o aplicaciones Android basadas en GGUF.

El modelo cuenta con aproximadamente 1.777 millones de parámetros (1,78 B) según los datos de safetensors, lo que lo sitúa en la gama de modelos pequeños aptos para hardware de consumo. El repositorio ocupa 1,1 GB, coherente con una cuantización de pesos para inferencia local. La información pública disponible es muy limitada: no se declaran idiomas soportados, no hay resultados de benchmarks, no se especifica la longitud de contexto y la licencia figura como "other" sin texto asociado, lo que obliga a revisar la licencia del modelo base antes de cualquier uso comercial.

La relevancia de este artefacto es acotada pero concreta: cubre un nicho de verificación formal asistida por lenguaje natural, con un contrato de salida explícito (tres estados de veredicto más artefactos formales). Al tratarse de una publicación con cero descargas y cero likes en el momento de la consulta, y sin documentación técnica sobre el entrenamiento, debe tratarse como un experimento de autor único y no como un componente listo para producción sin validación independiente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (el autor no la declara; el artefacto es GGUF para llama.cpp) |
| Parámetros totales | 1.777.088.000 (≈1,78 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el repo contiene un único artefacto GGUF de 1,1 GB) |
| Idiomas soportados | no disponible |
| Licencia | other (sin texto de licencia publicado; requiere revisión del modelo base) |
| Formato de pesos | GGUF (librería llama.cpp) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna del modelo base. El artefacto es una exportación GGUF, lo que implica que el checkpoint original fue convertido para inferencia en llama.cpp; el autor no indica si el modelo subyacente es un transformer denso, un MoE o una arquitectura híbrida, ni el número de capas, dimensión de hidden state o configuración de atención. Tampoco se documenta el tokenizador ni el vocabulario.

Respecto al entrenamiento, la model card únicamente menciona que el comportamiento del especialista depende de un system prompt y unos parámetros de runtime concretos mantenidos en el repositorio de despliegue de Omnigenesis, y que este GGUF puede usarse para generar ejemplos sintéticos, pero que el entrenamiento debería hacerse sobre el modelo base original o un checkpoint de mayor precisión. No hay datos sobre volumen de tokens, composición del dataset, uso de RLHF/DPO, ni innovaciones técnicas como decodificación especulativa o atención lineal. La única señal funcional es el contrato de salida del especialista: auditar afirmaciones de estabilidad y emitir PROVEN, UNPROVEN o REFUTED con artefactos formales asociados.

## Capacidades

- Generación de texto conversacional, según el tag `conversational` y el pipeline `text-generation`.
- Auditoría de afirmaciones de estabilidad con salida estructurada en tres estados: PROVEN, UNPROVEN y REFUTED.
- Emisión de artefactos formales asociados al veredicto, según declara la model card.
- Ejecución local en runtimes GGUF: llama.cpp, LM Studio y aplicaciones Android compatibles con GGUF.
- Generación de ejemplos sintéticos para construcción de datasets, según la nota de entrenamiento del autor.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad documentada.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Verificación de demostraciones matemáticas asistida: el modelo recibe un enunciado de estabilidad y devuelve un veredicto PROVEN/UNPROVEN/REFUTED, útil como primera pasada de triaje antes de la revisión humana de la prueba formal.
- Pre-filtrado en pipelines de revisión de papers: integrado en un flujo de CI documental, puede clasificar afirmaciones de estabilidad y derivar solo los casos REFUTED o dudosos a revisores humanos, reduciendo carga de triaje.
- Generación de datasets sintéticos de verificación: la model card autoriza explícitamente este uso; se pueden producir pares (afirmación, veredicto) para entrenar o evaluar otros modelos, con revisión posterior obligatoria.
- Asistente local en dispositivos de gama media: con 1,78 B de parámetros y un artefacto de 1,1 GB, puede ejecutarse en portátiles sin GPU dedicada o en Android mediante runtimes GGUF, para consultas de estabilidad sin conexión.
- Prototipado de asistentes especializados: sirve como banco de pruebas para diseñar system prompts y contratos de salida estructurados antes de escalar a un modelo mayor.
- Docencia y divulgación: permite ilustrar en local el flujo de auditoría formal con veredictos explícitos, sin depender de APIs externas ni de conectividad.
- Evaluación de robustez de verificadores: al ser un modelo pequeño y abierto en formato GGUF, es adecuado como baseline para medir tasas de falsos PROVEN en herramientas de verificación automática.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el artefacto GGUF ocupa 1,1 GB en disco; la VRAM necesaria es del mismo orden (aproximadamente 1,1-1,5 GB) más el overhead del contexto, que no puede calcularse porque se desconoce la longitud de contexto soportada.
- GPU recomendadas: no disponible. Por tamaño, cualquier GPU con 2 GB o más de VRAM debería poder alojar los pesos; no hay datos del autor que confirmen GPUs concretas.
- GPU de consumo: con 1,78 B de parámetros, es esperable que quepa en GTX 1650, RTX 3050, RTX 4060 y superiores, así como en iGPU con memoria unificada suficiente; no confirmado por el autor.
- Opciones de despliegue: llama.cpp, LM Studio, Ollama y aplicaciones Android compatibles con GGUF, según la model card. vLLM y TGI no se mencionan y no está confirmado su soporte para este artefacto.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (especialistas de verificación formal en formato GGUF de ~1,8 B) ni datos de rendimiento que permitan establecer una comparación rigurosa.

## Limitaciones y advertencias

- La model card advierte explícitamente que las salidas son generadas por el modelo y requieren validación: la confianza autoinformada, las analogías y los artefactos formales generados no deben tratarse como prueba sin comprobación independiente.
- Riesgo de alucinación especialmente crítico en este dominio: un veredicto PROVEN falso o un artefacto formal inventado puede inducir a error grave si se consume sin revisión humana.
- Licencia "other" sin texto publicado: es obligatorio revisar la licencia del modelo base antes de redistribuir o usar comercialmente el artefacto.
- Idiomas soportados no declarados: no hay garantía de comportamiento correcto en castellano ni en ningún otro idioma concreto.
- Longitud de contexto desconocida: no se puede planificar el uso con documentos largos ni estimar el coste de memoria del contexto.
- Ausencia de benchmarks y de documentación de entrenamiento: imposibilita evaluar la calidad frente a alternativas y dificulta la reproducibilidad.
- El comportamiento del especialista depende de un system prompt y parámetros de runtime alojados en un repositorio externo de Omnigenesis; sin ellos, el modelo puede no reproducir la función declarada.
- Es un artefacto de inferencia, no un checkpoint para fine-tuning completo: el autor recomienda entrenar sobre el modelo base original o un checkpoint de mayor precisión.
- No se debe entrenar con prompts privados, credenciales, datos personales ni salidas del modelo sin revisar.
- Publicación con cero descargas y cero likes en el momento de la consulta: sin validación comunitaria ni señales de uso en producción.

## Enlaces

- Hugging Face: https://huggingface.co/Urbanwarrior79/omnigenesis-stability-gguf
- Repositorio de despliegue de Omnigenesis (Modelfile y system prompt): no disponible como enlace directo en la información proporcionada.
- Paper, blog, repositorio de código o demo: no disponible.
