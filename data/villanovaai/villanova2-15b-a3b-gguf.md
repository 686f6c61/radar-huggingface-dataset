# VillanovaAI/Villanova2-15B-A3B-GGUF

## Resumen
Villanova2-15B-A3B-GGUF es la distribución cuantizada en formato GGUF del modelo Villanova2-15B-A3B, desarrollado por VillanovaAI. Se trata de un modelo de lenguaje de arquitectura Mixture of Experts (MoE) con 15.496.409.024 parámetros totales y aproximadamente 3.000 millones de parámetros activos por token (según indica el sufijo A3B), orientado a generación de texto conversacional y tool calling. El repositorio se publicó el 9 de noviembre de 2026 y se actualizó dos días después; su acceso está restringido y requiere aceptar condiciones en Hugging Face.

El modelo se presenta con un enfoque explícitamente europeo ("european" en los tags) y soporte para cinco idiomas: inglés, italiano, alemán, español y francés. La licencia Apache 2.0 facilita su integración en productos comerciales, y la disponibilidad en GGUF permite su despliegue en entornos con llama.cpp, Ollama u otros runtimes compatibles, incluyendo hardware de consumo.

La relevancia actual del modelo radica en la combinación de una arquitectura MoE de tamaño medio con activación reducida (lo que abarata la inferencia frente a un denso de 15B) y un formato de pesos optimizado para despliegue local. No obstante, la información pública disponible es limitada: no se han publicado detalles sobre el dataset de entrenamiento, la ventana de contexto ni resultados de benchmarks en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE), transformer (detalles no disponibles) |
| Parametros totales | 15.496.409.024 |
| Parametros activos | ~3.000 millones (según nomenclatura A3B; valor exacto no disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (variantes concretas no disponibles) |
| Idiomas soportados | en, it, de, es, fr |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 110,6 GB; modelo base en safetensors) |

## Arquitectura y entrenamiento
La información disponible confirma que el modelo emplea una arquitectura Mixture of Experts con 15.496.409.024 parámetros totales y aproximadamente 3.000 millones de parámetros activos por token, según la convención de nomenclatura "A3B". Esto implica que, en cada paso de inferencia, solo se activa una fracción del total de parámetros, lo que reduce el coste computacional y de memoria respecto a un modelo denso del mismo tamaño. Los detalles sobre el número de expertos, la estrategia de enrutamiento (top-k), la dimensión de las capas o el uso de atención lineal no están disponibles en la información proporcionada.

Tampoco se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset, la existencia de fases de RLHF, DPO u otras técnicas de alineación, ni innovaciones específicas como decodificación especulativa. El modelo base es VillanovaAI/Villanova2-15B-A3B, y esta ficha corresponde exclusivamente a su versión cuantizada en GGUF. Cualquier afirmación sobre el proceso de entrenamiento más allá de lo indicado sería especulativa.

## Capacidades
- Generación de texto conversacional multi-turno, con orientación explícita a chat ("chat", "conversational" en los tags).
- Soporte de tool calling / function calling, según el tag "tool-calling".
- Capacidad multilingüe en inglés, italiano, alemán, español y francés.
- Formato GGUF compatible con runtimes de inferencia locales y con endpoints compatibles ("endpoints_compatible").
- No se dispone de información sobre modo de razonamiento explícito (thinking mode), visión, audio, agentes multi-paso ni otras capacidades especiales.

## Casos de uso
- Asistente conversacional multilingüe en atención al cliente: el modelo cubre cinco idiomas europeos y está orientado a diálogo, por lo que puede gestionar conversaciones multi-turno en español, francés, alemán, italiano e inglés. La longitud de contexto no está documentada, así que conviene validar el límite real antes de desplegarlo en producción.
- Integración de tool calling en backends de aplicaciones: el soporte de function calling permite conectar el modelo a APIs externas (consultas a bases de datos, gestión de pedidos, reservas) dentro de un orquestador de herramientas.
- Despliegue local en estaciones de trabajo: al estar en GGUF y activar solo ~3B parámetros por token, puede ejecutarse en hardware de consumo con cuantizaciones agresivas, lo que facilita prototipado y pruebas sin infraestructura cloud.
- Generación de contenido asistida en varios idiomas europeos: redacción de borradores, resúmenes y respuestas en los cinco idiomas soportados, útil para equipos con presencia en varios mercados.
- Chatbot embebido en aplicaciones de escritorio o edge: la combinación de licencia Apache 2.0 y formato GGUF permite distribuir el modelo dentro de productos sin obligaciones de copyleft.
- Evaluación comparativa de arquitecturas MoE: con ~3B parámetros activos sobre 15,5B totales, sirve como banco de pruebas para medir el equilibrio entre calidad y coste de inferencia frente a modelos densos de tamaño similar.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa basada en el tamaño del modelo, las cuantizaciones GGUF de 4 bits de un modelo de 15,5B suelen ocupar en torno a 8-10 GB, y las de 8 bits en torno a 16 GB; estas cifras son estimaciones generales y no datos publicados por el autor.
- GPU recomendadas: no disponible. Por el perfil de parámetros activos (~3B), cabría esperar buen rendimiento en GPUs de consumo con suficiente VRAM para la cuantización elegida, pero no hay datos oficiales.
- Compatibilidad con GPU de consumo: probable en cuantizaciones bajas (4 bits) según el tamaño del modelo, aunque no confirmado por el autor.
- Opciones de despliegue: llama.cpp, Ollama y otros runtimes compatibles con GGUF; el tag "endpoints_compatible" sugiere compatibilidad con endpoints de inferencia, sin más detalle.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares
No disponible. La información proporcionada no incluye modelos comparables ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias
- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en Hugging Face antes de descargar los pesos.
- Información técnica incompleta: no se han publicado la longitud de contexto, el detalle de las cuantizaciones, la composición del dataset ni benchmarks, lo que dificulta evaluar su calidad antes de desplegarlo.
- Riesgo de alucinación: inherente a los modelos generativos; no hay documentación específica sobre mitigaciones.
- Sesgos: no documentados; al cubrir principalmente idiomas europeos, el rendimiento en otros idiomas puede ser limitado.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones adicionales del acceso gated y las posibles restricciones del modelo base.
- Validación en producción: al no haber datos de benchmarks ni de latencia, se recomienda una evaluación propia con el dominio objetivo antes de un despliegue real.

## Enlaces
- Hugging Face (GGUF): https://huggingface.co/VillanovaAI/Villanova2-15B-A3B-GGUF
- Modelo base: https://huggingface.co/VillanovaAI/Villanova2-15B-A3B
