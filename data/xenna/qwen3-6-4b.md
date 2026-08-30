# Xenna/qwen3.6-4b

## Resumen

Xenna/qwen3.6-4b es una cuantización del modelo Qwen3-4B de Alibaba, convertido al formato LiteRT-LM (.litertlm) para inferencia en dispositivos móviles sin conexión a la nube. El modelo base, Qwen3-4B, es un transformer decoder-only de 4 mil millones de parámetros, conocido por su equilibrio entre rendimiento y eficiencia para tareas de chat y razonamiento. Esta versión cuantizada reduce el tamaño a aproximadamente 5,4 GB mediante cuantización INT8 por canales, manteniendo la caché KV en float32 para preservar la calidad de generación.

La relevancia de este modelo radica en su enfoque específico para despliegue on-device: permite ejecutar un modelo de 4B en smartphones y dispositivos con recursos limitados, sin depender de infraestructura cloud. Está pensado exclusivamente para la tarea de chat (AI Chat), lo que lo hace adecuado para asistentes personales, aplicaciones de mensajería y herramientas de soporte que requieren privacidad y baja latencia. La licencia Apache 2.0 facilita su uso comercial y su integración en productos propietarios.

Aunque el nombre del repositorio sugiere una versión "3.6", la model card indica explícitamente que se trata de Qwen3-4B cuantizado, no de la familia Qwen3.6 (que incluye modelos de 27B y 35B-A3B). Por tanto, esta ficha se basa en la información proporcionada por el autor, que confirma el modelo base QwenLM/Qwen3-4B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-4B) cuantizado INT8 channelwise |
| Parametros totales | 4 mil millones (4B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el modelo base Qwen3-4B soporta 32K, pero no se confirma en esta version) |
| Tipos de cuantizacion | INT8 channelwise, KV cache en float32 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | .litertlm (LiteRT-LM) |

## Arquitectura y entrenamiento

El modelo es una conversión del Qwen3-4B original, desarrollado por Alibaba, al formato LiteRT-LM, un runtime de inferencia on-device optimizado para dispositivos móviles. La cuantización INT8 por canales reduce el tamaño de los pesos de 16/32 bits a 8 bits, manteniendo la caché KV en float32 para mitigar la pérdida de precisión en contextos largos. No se dispone de información sobre el proceso de entrenamiento del modelo base (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO) en la model card proporcionada. El autor solo indica que el modelo está diseñado para la tarea de chat en móviles, sin detalles adicionales sobre el proceso de cuantización o calibración.

## Capacidades

- Generacion de texto conversacional: el modelo está optimizado para tareas de chat, produciendo respuestas coherentes y contextuales en inglés.
- Razonamiento básico: al heredar las capacidades del Qwen3-4B, puede realizar razonamiento lógico y matemático simple, aunque la cuantización puede afectar ligeramente el rendimiento.
- Inferencia on-device: ejecución local sin conexión, lo que garantiza privacidad de los datos y funcionamiento sin latencia de red.
- Soporte de tool calling: no confirmado en la model card; el modelo base Qwen3-4B lo soporta, pero no se especifica si esta versión lo mantiene.
- Capacidades multilingues: no, solo inglés según la etiqueta de idioma.
- Modo de pensamiento (thinking mode): no disponible en esta versión; el modelo base Qwen3-4B incluye un modo de razonamiento, pero no se menciona en la model card.

## Casos de uso

- Asistente personal en movil: el modelo puede gestionar conversaciones multi-turno para responder preguntas, recordatorios o recomendaciones, aprovechando su ejecucion local para proteger la privacidad del usuario.
- Atencion al cliente en apps de mensajeria: integrado en aplicaciones de soporte, puede resolver consultas frecuentes sin depender de servidores externos, reduciendo costes de infraestructura.
- Chat offline en entornos sin conectividad: util para zonas rurales, aviones o situaciones donde la red no esta disponible, manteniendo un asistente funcional.
- Prototipado rapido de aplicaciones de IA: los desarrolladores pueden desplegar este modelo en dispositivos de prueba para validar experiencias de chat antes de escalar a modelos mayores.
- Educacion y formacion: como herramienta de practica para estudiantes que necesitan un LLM local en sus dispositivos, sin requisitos de hardware elevados.
- Automatizacion de tareas simples en el dispositivo: por ejemplo, resumir notas, generar borradores de correos o traducir frases cortas, todo en ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de rendimiento (MMLU, HumanEval, GSM8K, etc.) para esta version cuantizada. Se recomienda consultar los benchmarks del modelo base Qwen3-4B en su repositorio oficial, aunque la cuantizacion puede alterar los resultados.

## Requisitos de hardware

- Tamano del archivo: aproximadamente 5,4 GB, por lo que requiere al menos 6 GB de almacenamiento libre en el dispositivo.
- Memoria RAM: se estima que necesita entre 6 y 8 GB de RAM para cargar el modelo y ejecutar inferencia sin problemas, aunque no se especifica en la documentacion.
- GPU: no aplica; el modelo esta disenado para CPU en dispositivos moviles (ARM) mediante el runtime LiteRT-LM.
- Dispositivos compatibles: smartphones y tablets con Android o iOS que soporten LiteRT-LM (no se detallan versiones minimas).
- Opciones de despliegue: exclusivamente mediante LiteRT-LM on-device; no se mencionan alternativas como vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles; dependen del hardware del dispositivo y de la optimizacion del runtime.

## Comparativa con modelos similares

No se dispone de una comparativa directa con otros modelos cuantizados para movil en la informacion proporcionada. Como referencia, el modelo base Qwen3-4B compite con otros LLMs de 4B como Gemma-2-4B o Phi-3-mini, pero esta version especifica en formato LiteRT-LM no tiene equivalentes publicados en el ecosistema. Se recomienda evaluar el rendimiento en el dispositivo objetivo antes de elegir.

## Limitaciones y advertencias

- Idioma limitado: solo soporta ingles, lo que restringe su uso en mercados hispanohablantes.
- Tarea unica: la model card indica "AI Chat task only", por lo que no se garantiza soporte para otras tareas como generacion de codigo o analisis de datos.
- Perdida de precision por cuantizacion: la conversion a INT8 puede degradar ligeramente la calidad de las respuestas en comparacion con el modelo original en float16/32.
- Riesgo de alucinacion: como cualquier LLM, puede generar informacion falsa o inventada, especialmente en temas especializados.
- Sin garantias de produccion: al ser un modelo con 0 descargas y 0 likes, no hay evidencia de pruebas exhaustivas en entornos reales.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece soporte ni garantias sobre el funcionamiento del modelo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Xenna/qwen3.6-4b
- Modelo base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Guia de Qwen 3.6 (no directamente relacionada, pero contextual): https://insiderllm.com/guides/qwen-3-6-local-ai-guide/
- Guia completa de la familia Qwen3: https://insiderllm.com/guides/qwen3-complete-guide/
