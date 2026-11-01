# subbuks/agribot-qlora

## Resumen

AgriBot es un adaptador LoRA (entrenado con QLoRA y la librería PEFT) sobre el modelo base Qwen2.5-0.5B-Instruct, publicado por el usuario subbuks en HuggingFace. Su propósito es responder preguntas del dominio agrícola en inglés, partiendo de un ajuste fino supervisado sobre el dataset KisanVaani/agriculture-qa-english-only. No se trata de un modelo completo, sino de un conjunto de pesos delta que debe cargarse junto al modelo base original.

El modelo hereda la arquitectura transformer decoder-only de Qwen2.5-0.5B-Instruct, con 0,5 mil millones de parámetros y una ventana de contexto de hasta 32.768 tokens (según las especificaciones del modelo base de Qwen2.5, aunque la model card del adaptador no las detalla explícitamente). El adaptador en sí añade un número reducido de parámetros entrenables mediante descomposición de bajo rango, y el repositorio ocupa 0,0 GB, lo que confirma que solo contiene los pesos del adaptador y no el modelo completo.

Su relevancia es limitada y de carácter experimental: se trata de una prueba de concepto de ajuste fino de dominio con recursos mínimos, sin evaluación independiente publicada, con 20 descargas y 0 likes en el momento de la consulta. Resulta útil como ejemplo didáctico de aplicación de QLoRA a un modelo pequeño para un nicho vertical, pero no está validado para uso en producción ni para asesoramiento agronómico real.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-0.5B-Instruct) con adaptadores LoRA/QLoRA |
| Parámetros totales | 0,5 mil millones (modelo base); el adaptador añade un subconjunto no especificado de parámetros entrenables |
| Parámetros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la model card del adaptador (el modelo base Qwen2.5-0.5B-Instruct soporta hasta 32.768 tokens según su propia documentación) |
| Tipos de cuantización | no disponible; el ejemplo de uso carga el modelo base en `torch.float32`. Al ser un adaptador PEFT, es compatible con las cuantizaciones que soporte el modelo base (por ejemplo, 4 bits para QLoRA), pero no se documentan opciones concretas |
| Idiomas soportados | no disponible en la model card; el dataset de entrenamiento es exclusivamente en inglés (`agriculture-qa-english-only`), por lo que el dominio ajustado es inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre Qwen2.5-0.5B-Instruct, un transformer decoder-only con atención causal estándar, normalización RMSNorm, activación SwiGLU y embeddings rotatorios (RoPE), según la arquitectura de la familia Qwen2.5. El ajuste fino emplea QLoRA: el modelo base se cuantiza (típicamente a 4 bits) y se entrenan únicamente matrices de bajo rango insertadas en las capas lineales, lo que reduce drásticamente los requisitos de memoria. La librería de referencia es PEFT.

El único dato de entrenamiento documentado es el dataset KisanVaani/agriculture-qa-english-only, un corpus de pares pregunta-respuesta agrícolas en inglés. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset, la configuración de hiperparámetros (rango LoRA, alpha, tasa de aprendizaje, épocas) ni si se aplicaron etapas de RLHF o DPO. Tampoco se documenta ninguna innovación técnica adicional más allá del propio esquema QLoRA. El autor declara explícitamente que el modelo es experimental y que no ha sido validado de forma independiente.

## Capacidades

- Generación de texto conversacional en formato chat, gracias a la plantilla de chat heredada de Qwen2.5-0.5B-Instruct (`apply_chat_template`).
- Respuesta a preguntas del dominio agrícola en inglés, ajustada sobre el dataset KisanVaani.
- Razonamiento básico y generación de texto general, limitados por el tamaño del modelo base (0,5B parámetros).
- Soporte de conversaciones multi-turno mediante el formato de mensajes `role`/`content`.
- Capacidad multilingüe: no documentada para el adaptador; el ajuste se realizó solo en inglés, por lo que el rendimiento en otros idiomas no está validado.
- Tool calling / function calling: no documentado en la model card del adaptador; el modelo base Qwen2.5-0.5B-Instruct sí lo soporta, pero no hay evidencia de que el ajuste lo preserve.
- Capacidades de agente o razonamiento multi-paso: no documentadas.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Prototipado educativo de ajuste fino de dominio: el adaptador sirve como ejemplo reproducible de cómo aplicar QLoRA y PEFT a un modelo pequeño para un nicho concreto (agricultura), cargándolo con Transformers y PEFT en unas pocas líneas de código.
- Demostraciones de asistentes conversacionales verticales: se puede desplegar como chatbot de preguntas y respuestas agrícolas en inglés para talleres, clases o pruebas internas, siempre con supervisión humana.
- Generación de respuestas de referencia para anotación: el modelo puede producir borradores de respuestas agrícolas que luego un experto revisa y corrige, acelerando la creación de datasets etiquetados.
- Pruebas de integración de pipelines PEFT: útil para validar flujos de carga de adaptadores, plantillas de chat y generación con `max_new_tokens` en entornos de CI o notebooks.
- Experimentos de comparación de adaptadores: al ser un adaptador ligero, permite entrenar y comparar variantes (distintos rangos LoRA, datasets, hiperparámetros) con coste computacional muy bajo.
- Filtrado y clasificación temática preliminar: con prompts adecuados, puede usarse para etiquetar consultas agrícolas en inglés por tema, aunque sin garantías de precisión.
- Base para investigación sobre seguridad en dominios sensibles: sirve para estudiar cómo modelos pequeños alucinan en dominios donde el consejo incorrecto (pesticidas, fertilizantes, enfermedades) tiene consecuencias reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor declara explícitamente que no reclama ninguna evaluación independiente ni evaluación de seguridad agrícola.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo base de 0,5B parámetros más un adaptador LoRA, los requisitos son muy bajos. En fp32 (como en el ejemplo de la model card) se estiman en torno a 2 GB de VRAM; en fp16/bf16, alrededor de 1 GB; en cuantización de 4 bits, por debajo de 1 GB. Estas cifras son estimaciones basadas en el tamaño del modelo, no datos publicados por el autor.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente, incluidas RTX 3060, RTX 4060, RTX 4090, así como GPUs de datacenter (A100, H100) para despliegues por lotes.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPUs consumer con al menos 2-4 GB de VRAM, e incluso en CPU para inferencia lenta.
- Opciones de despliegue: Transformers + PEFT (método documentado por el autor); el modelo base es compatible con vLLM, llama.cpp, Ollama y TGI, aunque la carga de adaptadores LoRA depende del soporte de cada herramienta y no está documentada para este adaptador concreto.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| subbuks/agribot-qlora | 0,5B (base) + adaptador LoRA | no disponible (base: hasta 32.768 tokens) | Agrícola (inglés) | Apache-2.0 | HuggingFace, 20 descargas |
| Qwen/Qwen2.5-0.5B-Instruct | 0,5B | 32.768 tokens | General | Apache-2.0 | HuggingFace, ampliamente utilizado |
| KisanVaani (dataset) | no aplica | no aplica | Agrícola (inglés) | no disponible en la información proporcionada | HuggingFace Datasets |

No se dispone de información sobre otros adaptadores agrícolas comparables ni sobre benchmarks que permitan una comparación cuantitativa. La comparación con el modelo base es la más relevante: el adaptador añade especialización de dominio a costa de posibles regresiones en capacidades generales, algo que no se ha medido.

## Limitaciones y advertencias

- Modelo experimental sin validación independiente: el propio autor lo declara y no reclama ninguna evaluación de benchmarks ni de seguridad agrícola.
- Riesgo elevado de alucinación: al ser un modelo de 0,5B parámetros ajustado con QLoRA, la probabilidad de generar respuestas incorrectas, incompletas o desactualizadas es alta, especialmente en temas técnicos.
- Advertencia explícita del autor: no usar como única fuente para decisiones sobre pesticidas, enfermedades o fertilizantes; verificar con expertos agrícolas locales cualificados.
- Dependencia del contexto local: el consejo agrícola depende del clima, el suelo, la variedad de cultivo y otras condiciones locales que el modelo no puede conocer.
- Idiomas: el ajuste se realizó solo en inglés; el rendimiento en castellano u otros idiomas no está validado y probablemente sea deficiente.
- Licencia: Apache-2.0 permite uso comercial, pero debe revisarse la licencia del modelo base y, especialmente, los términos del dataset de entrenamiento (KisanVaani/agriculture-qa-english-only), que pueden ser distintos y condicionar la redistribución.
- Atribución: la publicación del adaptador no implica el respaldo de los autores del modelo base ni del dataset.
- Tamaño del modelo: 0,5B parámetros limita la profundidad de razonamiento, la coherencia en conversaciones largas y la fidelidad factual.
- Sin datos de entrenamiento documentados: se desconocen hiperparámetros, número de tokens y posibles sesgos introducidos por el dataset.
- Baja tracción: 20 descargas y 0 likes indican escasa validación por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/subbuks/agribot-qlora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/KisanVaani/agriculture-qa-english-only
- Librería PEFT: https://huggingface.co/docs/peft
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información proporcionada.
