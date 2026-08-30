# Soulfate24/Ornith-1.5-9B-ASHQ1-Remix

## Resumen

Ornith-1.5-9B-ASHQ1-Remix es una cuantización GGUF del modelo Ornith-1.5-9B, desarrollada por Soulfate24. El modelo base, creado por DeepReinforce, es un transformer denso de 9 mil millones de parámetros orientado a tareas de codificación y agente, entrenado con un bucle de refuerzo auto-mejorado (self-improving task-and-scaffold RL). Esta versión cuantizada emplea la técnica ASHQ1, una cuantización sensible a activaciones con doble cuantización y límites explícitos, que ofrece siete niveles de fidelidad para adaptarse a distintos presupuestos de memoria.

La relevancia de este lanzamiento radica en que permite ejecutar un modelo de 9B en hardware de consumo, desde GPUs con 6 GB de VRAM hasta dispositivos móviles, manteniendo una calidad aceptable según las métricas de perplejidad y divergencia reportadas. Es una opción práctica para desarrolladores que necesitan desplegar capacidades de generación de código y razonamiento en entornos con recursos limitados, sin renunciar a la licencia MIT que facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Ornith-1.5-9B) |
| Parametros totales | 9 mil millones (9B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ASHQ1-Remix (siete niveles: Fidelity-48pc, Precision-42pc, Quality-36pc, Compact-33pc, Mini-30pc, Nano-27pc, Pico-24pc) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (safetensors no aplicable) |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-9B es un transformer denso de 9B parámetros, diseñado específicamente para codificación y tareas de agente. Según la documentación de DeepReinforce, se entrenó con un bucle de refuerzo auto-mejorado que combina tareas y andamiajes (task-and-scaffold RL), lo que le permite mejorar sus propias capacidades de razonamiento durante el entrenamiento. No se dispone de detalles adicionales sobre el número de tokens de entrenamiento ni la composición exacta del dataset.

La cuantización ASHQ1-Remix aplicada en este repo se basa en una reorganización de pesos guiada por gradientes (AutoRound W4A16) combinada con una asignación de tensores sensible a activaciones (ASHQ1 Imatrix Engine). El resultado son siete niveles de compresión que van desde 48% hasta 24% del tamaño original, cada uno con métricas de fidelidad medidas sobre el corpus wiki.test.raw. La técnica está validada en seis familias de modelos, según la suite de cuantización referenciada.

## Capacidades

- Generación de código: el modelo base está optimizado para tareas de programación, incluyendo completado, generación y explicación de código.
- Razonamiento multi-paso: soporta cadenas de pensamiento y resolución de problemas complejos, útil para tareas de agente.
- Tool calling / function calling: se infiere de su diseño como modelo de agente, aunque no se confirma explícitamente en la documentación disponible.
- Capacidades multimodales: la descripción del modelo base lo califica como "multimodal coding model", lo que sugiere soporte para entrada de imágenes junto con texto, aunque no se especifican los detalles.
- Soporte para agentes: entrenado para interactuar con entornos y herramientas, lo que permite su integración en flujos de automatización.
- Multilingüismo: no se dispone de información sobre los idiomas soportados.

## Casos de uso

- Asistente de programación en IDE: el modelo puede integrarse en editores como VS Code o JetBrains para ofrecer autocompletado y sugerencias de código en tiempo real, aprovechando su entrenamiento específico en tareas de codificación.
- Automatización de tareas de desarrollo: gracias a su capacidad de razonamiento y posible tool calling, puede ejecutar comandos, gestionar repositorios o generar scripts de CI/CD en pipelines automatizados.
- Chatbot técnico de soporte: con su conocimiento de lenguajes y frameworks, puede responder consultas de desarrolladores en un entorno de atención al cliente, manteniendo contexto en conversaciones multi-turno.
- Generación de documentación técnica: puede resumir código, generar comentarios y crear documentación de API a partir de fragmentos de código fuente.
- Prototipado rápido de aplicaciones: los desarrolladores pueden usarlo para generar esqueletos de proyectos, funciones y pruebas unitarias, reduciendo el tiempo de desarrollo inicial.
- Ejecución en dispositivos edge: gracias a los niveles de cuantización más pequeños (Pico-24pc, 4.4 GB), el modelo puede desplegarse en dispositivos móviles o integrados para aplicaciones de asistencia offline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. La tabla siguiente muestra las metricas de fidelidad de la cuantizacion reportadas por el autor, medidas sobre wiki.test.raw con referencia simetrica FA-auto:

| Tier | Tamano (MiB) | PPL | KLD | RMS Δp | top-p |
| :--- | ---: | ---: | ---: | ---: | ---: |
| Fidelity-48pc | 9464 | 9.5239 | 0.0081 | 2.43% | 97.6% |
| Precision-42pc | 8414 | 9.4347 | 0.0132 | 3.04% | 96.6% |
| Quality-36pc | 6330 | 9.3692 | 0.0366 | 5.00% | 93.3% |
| Compact-33pc | 5803 | 9.6043 | 0.0517 | 5.91% | 91.6% |
| Mini-30pc | 5385 | 9.8564 | 0.0649 | 6.67% | 90.3% |
| Nano-27pc | 4750 | 10.1061 | 0.0907 | 7.90% | 87.8% |
| Pico-24pc | 4389 | 10.1078 | 0.1309 | 9.63% | 85.0% |

## Requisitos de hardware

- VRAM estimada: el tier mas pequeño (Pico-24pc) ocupa 4389 MiB, por lo que cabe en GPUs con 6 GB de VRAM. El tier mas grande (Fidelity-48pc) requiere al menos 12 GB de VRAM.
- GPUs recomendadas: para los tiers medianos (Mini-30pc, Compact-33pc) son suficientes RTX 3060/4060 de 8-12 GB. Para los tiers grandes se recomiendan RTX 3090/4090 o A100.
- Compatibilidad con consumer GPU: si, los tiers Compact-33pc y Mini-30pc caben en GPUs de 8 GB como RTX 3070 o RTX 4060 Ti.
- Opciones de despliegue: al ser GGUF, se puede ejecutar con llama.cpp, Ollama, LM Studio o vLLM (con backend GGUF). Tambien es compatible con el ecosistema transformers mediante la integracion de GGUF.
- Latencia y throughput: no se dispone de datos medidos; dependera del hardware y del nivel de cuantizacion. En general, los tiers mas pequeños ofrecen menor latencia a costa de mayor perdida de calidad.

## Comparativa con modelos similares

No se dispone de informacion suficiente para comparar con otros modelos de la misma categoria (por ejemplo, otros modelos de 9B cuantizados). El modelo base Ornith-1.5-9B es la referencia natural; esta cuantizacion ofrece una alternativa mas ligera. Se recomienda consultar el repositorio del modelo base para comparaciones con otros modelos de codificacion.

## Limitaciones y advertencias

- La cuantizacion introduce una degradacion de calidad que se hace mas evidente en los tiers mas pequeños (mayor PPL y KLD). Para tareas criticas se recomienda usar el tier Fidelity-48pc o Precision-42pc.
- No se han publicado evaluaciones de sesgos o alucinaciones especificas para este modelo cuantizado; se heredan las limitaciones del modelo base, que no han sido documentadas en detalle.
- La longitud de contexto no esta especificada en la documentacion; se debe verificar con el modelo base si se necesita manejar ventanas largas.
- Los idiomas soportados no estan indicados; el modelo base podria tener un rendimiento variable en lenguas distintas del ingles.
- La licencia MIT permite uso comercial y modificacion, pero se debe atribuir correctamente la autoría y conservar el aviso de licencia.
- Para produccion, es recomendable validar el rendimiento en el dominio especifico, ya que las metricas de fidelidad no garantizan resultados en tareas reales.

## Enlaces

- Repositorio HuggingFace de esta cuantizacion: https://huggingface.co/Soulfate24/Ornith-1.5-9B-ASHQ1-Remix
- Modelo base Ornith-1.5-9B: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Suite de cuantizacion ASHQ1: https://huggingface.co/Soulfate24/AutoRound-ASHQ1-Remix_Double-Quantization_Suite
- Guia de ejecucion local de Ornith 1.5: https://atomic.chat/blog/guides/how-to-run-ornith-1-5-locally
- Pagina de Ornith-1.5 en LLM Releases: https://www.llm-releases.com/models/ornith-1-5-9b
- Pagina de Ornith-1.5 en Ollama: https://ollama.com/library/ornith-1.5
