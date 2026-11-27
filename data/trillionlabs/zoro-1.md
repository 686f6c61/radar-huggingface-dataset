# trillionlabs/Zoro-1

## Resumen

Zoro-1 es un modelo de lenguaje de 4.538.646.016 parámetros desarrollado por trillionlabs, obtenido mediante ajuste fino (finetune) del modelo base Qwen/Qwen3.5-4B. Su propuesta diferencial no es tanto el tamaño como la técnica de generación: emplea decodificación por difusión de bloques (block-diffusion) en un esquema híbrido que combina atención transformer convencional con pasos de difusión, junto con decodificación auto-especulativa (self-speculative-decoding). El modelo está orientado explícitamente a casos de uso de agentes, tool calling y toma de decisiones tipadas (typed-decisions), y se distribuye con vocación de ejecución en dispositivo (on-device).

La relevancia de Zoro-1 en el ecosistema actual radica en dos frentes. Por un lado, demuestra que es posible aplicar esquemas de difusión por bloques sobre un transformer denso de 4B parámetros sin salir del ecosistema Qwen, lo que abre la puerta a acelerar la inferencia manteniendo calidad. Por otro lado, su enfoque en decisiones estructuradas y tool calling lo posiciona como candidato para pipelines de agentes donde la salida debe ser parseable y determinista en formato, no solo texto libre.

El modelo se publica bajo licencia Apache 2.0, aunque el acceso al repositorio está restringido (gated): es necesario aceptar las condiciones en Hugging Face antes de descargar los pesos. El repositorio ocupa 26,6 GB e incluye pesos en safetensors. No se han publicado en la información disponible detalles sobre idiomas soportados ni sobre resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con block-diffusion (hybrid-diffusion) sobre base Qwen3.5; decodificación auto-especulativa |
| Parametros totales | 4.538.646.016 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se listan GGUF ni otras variantes) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Zoro-1 parte de Qwen/Qwen3.5-4B, un transformer denso de aproximadamente 4,5 mil millones de parámetros, y le aplica un ajuste fino que introduce un mecanismo de generación por difusión de bloques (block-diffusion) en régimen híbrido. En lugar de generar token a token de forma estrictamente autorregresiva, el modelo produce bloques de tokens mediante pasos de difusión, lo que en la práctica permite paralelizar parte de la decodificación y reducir el número de pasos secuenciales. A esto se suma la decodificación auto-especulativa, en la que el propio modelo actúa como borrador y verificador, sin necesidad de un modelo auxiliar externo.

Los tags del repositorio indican un entrenamiento orientado a agentes, tool calling y decisiones tipadas, lo que sugiere que el ajuste fino incorporó datos de interacción con herramientas y de salida estructurada. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron fases de RLHF o DPO. Tampoco se detallan innovaciones adicionales como atención lineal o decodificación especulativa con modelo separado; la innovación declarada es la combinación de difusión por bloques con autospeculación.

## Capacidades

- Generación de texto y razonamiento general, heredados del modelo base Qwen3.5-4B.
- Tool calling y function calling, con énfasis en la integración con herramientas externas.
- Toma de decisiones tipadas (typed-decisions): salidas estructuradas y tipadas pensadas para ser consumidas por sistemas automatizados.
- Soporte para flujos de agente y razonamiento multi-paso.
- Decodificación auto-especulativa, que acelera la generación sin modelo borrador externo.
- Generación por bloques mediante difusión, orientada a mejorar el throughput en inferencia.
- Ejecución en dispositivo (on-device), según los tags del repositorio.
- Capacidades multilingües: no disponible.
- Modo thinking, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Agentes autónomos con tool calling: Zoro-1 puede gestionar bucles de razonamiento multi-paso invocando funciones externas, gracias a su ajuste específico en tool calling y decisiones tipadas, lo que reduce la necesidad de post-procesar la salida para extraer llamadas válidas.
- Orquestación de APIs en backend: el modelo puede emitir decisiones estructuradas (por ejemplo, selección de endpoint y parámetros) en formato tipado, integrándose directamente en un servicio que valide el esquema antes de ejecutar la acción.
- Asistentes en dispositivo: con 4,5B parámetros y pesos safetensors, es viable desplegarlo en hardware de gama alta de consumo o en estaciones de trabajo locales, útil para asistentes que no pueden enviar datos a la nube.
- Automatización de soporte técnico con clasificación de intenciones: la salida tipada permite mapear cada consulta a una categoría y a una acción concreta, facilitando el enrutado a humanos o a otros sistemas.
- Generación acelerada de respuestas en producción: la decodificación auto-especulativa y la difusión por bloques están pensadas para reducir latencia en servicios con alto volumen de peticiones cortas y medianas.
- Evaluación de pipelines de agentes: al ser un modelo pequeño con capacidades de agente, sirve como componente de bajo coste para prototipar y validar arquitecturas de agentes antes de escalar a modelos mayores.
- Extracción de datos estructurados de documentos: el enfoque en decisiones tipadas lo hace adecuado para convertir texto libre en registros con esquema fijo, siempre que se valide la salida con un parser estricto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 9 GB solo para pesos (4,54B parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica, se recomienda al menos 16 GB para contexto moderado.
- Cuantización a 8 bits: alrededor de 4,5-5 GB de pesos; a 4 bits: alrededor de 2,5-3 GB, aunque el repositorio no publica variantes GGUF ni cuantizadas.
- GPU recomendadas: A100 40/80 GB, H100 para despliegues de alto throughput; RTX 4090 (24 GB) y RTX 3090 (24 GB) para inferencia en FP16 con contexto limitado.
- ¿Cabe en GPU de consumo? Sí, en tarjetas con 16-24 GB en FP16, y en GPUs de 8-12 GB si se cuantiza, siempre que se generen los pesos cuantizados a partir de los safetensors.
- Opciones de despliegue: vLLM, TGI y llama.cpp/Ollama son candidatos habituales para transformers densos, pero no se confirma en la información disponible compatibilidad específica con el esquema de block-diffusion; conviene verificar el código de inferencia del repositorio antes de asumir soporte en estos motores.
- Latencia y throughput: no disponibles; la propuesta del modelo es precisamente mejorar estos valores frente a la decodificación autorregresiva estándar, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Zoro-1 (trillionlabs) | 4,54B | no disponible | Apache 2.0 | Finetune de Qwen3.5-4B con block-diffusion y autospeculación; acceso gated |
| Qwen3.5-4B (base) | ~4B | no disponible | no disponible en esta ficha | Modelo base del que deriva Zoro-1; sin las técnicas de difusión ni el ajuste para agentes |
| Alternativas de ~4B con tool calling | no disponible | no disponible | no disponible | No se dispone de datos verificados para comparar rendimiento |

No se dispone de información suficiente para comparar benchmarks con alternativas de la misma categoría.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en Hugging Face, lo que puede complicar la automatización de descargas en CI/CD.
- Sin datos de benchmarks: no hay evidencia publicada en la información disponible sobre MMLU, HumanEval, GSM8K u otras métricas, por lo que no se puede validar su calidad frente al modelo base.
- Idiomas no documentados: se desconoce qué idiomas cubre con garantías; el uso en castellano debería validarse empíricamente.
- Riesgo de alucinación: como todo modelo de 4B ajustado para agentes, puede emitir llamadas a herramientas con parámetros plausibles pero incorrectos; es imprescindible validar la salida tipada con un esquema estricto.
- Compatibilidad de inferencia: el esquema de block-diffusion puede no estar soportado por los motores estándar (vLLM, TGI, llama.cpp); hay que revisar el código del repositorio.
- Licencia Apache 2.0: permite uso comercial, pero al derivar de Qwen3.5-4B conviene verificar las condiciones del modelo base y de la gated access.
- Sin información sobre sesgos: no se han publicado evaluaciones de sesgo ni de seguridad.
- Contexto desconocido: no se puede planificar su uso en tareas de contexto largo sin confirmar la ventana real del modelo.

## Enlaces

- Hugging Face: https://huggingface.co/trillionlabs/Zoro-1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Paper, blog, repositorio o demo: no disponibles en la información proporcionada.
