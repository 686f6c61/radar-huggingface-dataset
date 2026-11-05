# xtools-at/LFM3-1.7B-Claude-Opus-Reasoning-Distilled-GGUF

## Resumen

LFM3-1.7B-Claude-Opus-Reasoning-Distilled-GGUF es la versión cuantizada en formato GGUF del fine-tune homónimo publicado por xtools-at, un desarrollador independiente. Se trata de un ajuste fino orientado al razonamiento sobre el checkpoint Agent Orange, que a su vez es una fusión lineal de dos fine-tunes de LFM3-1.7B de Liquid AI: uno centrado en código y comportamiento agéntico (mondk/LFM3-1.7B-Claude-Code-Safetensors) y otro en tool calling estructurado (saidutta69/LFM3-1.7B-Claude-Fable5.1), combinados con pesos de 1.0 y 0.8 respectivamente.

El modelo parte de la arquitectura tri-híbrida de LFM3 (convoluciones cortas con compuerta, atención de ventana deslizante y atención global), con 1.728.801.600 parámetros totales y un tamaño de repositorio de 5,2 GB. Sobre esa base se aplicó un entrenamiento LoRA de una época con 8.000 ejemplos de trazas de razonamiento generadas por Claude Opus 4.6 y Sonnet 4.5, con el objetivo de incorporar un razonamiento multi-paso más estructurado a un modelo compacto ya orientado a código y uso de herramientas.

Su relevancia actual reside en la combinación de tamaño reducido (1,7B), licencia LFM 1.0 y distribución en GGUF, lo que permite ejecución local en hardware de consumo. No obstante, el propio autor advierte de que las mejoras de razonamiento son casos de uso previstos, no mejoras medidas, y que la validación independiente está pendiente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer tri-híbrido (convoluciones cortas con compuerta + atención de ventana deslizante + atención global), base LFM3 de Liquid AI |
| Parámetros totales | 1.728.801.600 (1,73B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (el entrenamiento usó un máximo de 8.192 tokens) |
| Tipos de cuantización | GGUF estático (niveles concretos no especificados en la información disponible) |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl |
| Licencia | LFM 1.0 (license: other, license_name: lfm1.0) |
| Formato de pesos | GGUF (repo de cuantizaciones); el modelo base se distribuye en safetensors |
| Librería | transformers |
| Pipeline | text-generation |
| Modelo base | xtools-at/LFM3-1.7B-Claude-Opus-Reasoning-Distilled (a su vez derivado de xtools-at/LFM3-1.7B-AgentOrange-Claude-Code-2xMerge y LiquidAI/LFM3-1.7B) |
| Tamaño del repositorio | 5,2 GB |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura tri-híbrida de LFM3-1.7B de Liquid AI, que combina convoluciones cortas con compuerta (gated short convolutions), atención de ventana deslizante y atención global. Esta mezcla busca reducir el coste computacional de la atención completa manteniendo capacidad de modelado de contexto, y está pensada explícitamente para despliegue local, uso de herramientas y aplicaciones agénticas.

El proceso de construcción tiene tres etapas. Primero, la fusión lineal de dos fine-tunes de LFM3-1.7B (Claude-Code y Claude-Fable5.1) con pesos 1.0 y 0.8, que da lugar al checkpoint Agent Orange; este hereda además entrenamiento de los datasets Ultra-Trio-Unfiltered y Fable 5.1 Premium. Segundo, un ajuste fino con LoRA en 16 bits sobre 8.000 ejemplos de trazas de razonamiento de Claude Opus 4.6 y Sonnet 4.5, procedentes de cuatro colecciones (Claude-Opus-4.6-Reasoning-887x, claude-4.5-opus-high-reasoning-250x, claude-sonnet-4.5-high-reasoning-250x y claude-opus-4.6-10000x), con un conjunto de evaluación separado de 400 ejemplos (5%) muestreado proporcionalmente a la composición del dataset y entradas filtradas a un máximo de 8.000 caracteres. Tercero, la cuantización estática a GGUF que constituye este repositorio.

Los hiperparámetros del ajuste LoRA fueron: una época, contexto máximo de entrenamiento de 8.192 tokens, learning rate 2e-4, rango LoRA 16, alpha 32, dropout 0.02, optimizador AdamW de 8 bits, scheduler lineal, weight decay 0.001 y configuración de batch 4 × 8, apuntando a todos los módulos compatibles con LoRA. La elección de una sola época mantiene el experimento ligero y limita la exposición repetida a los ejemplos sintéticos.

## Capacidades

- Generación de texto conversacional y razonamiento multi-paso orientado a resolución analítica de problemas.
- Asistencia en código y tareas técnicas, heredada del fine-tune Claude-Code integrado en la fusión base.
- Tool calling y function calling estructurado, con generación de argumentos, heredado del fine-tune Claude-Fable5.1.
- Razonamiento en flujos de trabajo con herramientas y acciones externas (orientación agéntica).
- Resolución de problemas matemáticos y lógicos, según los casos de uso previstos por el autor.
- Descomposición de tareas complejas en pasos manejables.
- Soporte multilingüe declarado para 16 idiomas: inglés, árabe, chino, francés, alemán, italiano, japonés, coreano, portugués, español, vietnamita, tailandés, indonesio, hindi, ruso y polaco.
- Compatibilidad con endpoints (tag endpoints_compatible) y con la librería transformers, además del formato GGUF.

## Casos de uso

- Asistencia de código en local: el modelo puede integrarse en editores o terminales para autocompletado, explicación de fragmentos y refactorización, aprovechando su base Claude-Code y su tamaño de 1,7B, que permite ejecución en portátiles sin GPU dedicada de gama alta.
- Agentes con tool calling: al heredar el entrenamiento en generación estructurada de argumentos, es adecuado para orquestar llamadas a APIs, consultas a bases de datos o ejecución de comandos en pipelines agénticos de un solo paso o pocos pasos.
- Razonamiento paso a paso en entornos con recursos limitados: útil para prototipos de cadenas de razonamiento (chain-of-thought) en los que no es viable invocar un modelo grande vía API, por ejemplo en entornos air-gapped o de privacidad estricta.
- Educación y tutoría técnica: puede desglosar problemas matemáticos o lógicos en pasos intermedios, lo que encaja en asistentes de estudio que necesitan mostrar el proceso y no solo la respuesta.
- Automatización de tareas de soporte técnico: con contexto de conversación multi-turno, puede gestionar consultas de desarrollo (errores de compilación, dudas de API) dentro de herramientas internas, siempre que la ventana de contexto real del modelo sea suficiente para el histórico necesario.
- Procesamiento multilingüe ligero: para equipos que trabajan con documentación o tickets en varios de los 16 idiomas declarados, el modelo puede clasificar, resumir o responder en el idioma del usuario sin depender de servicios externos.
- Experimentación e investigación en destilación de razonamiento: sirve como caso de estudio reproducible de cómo un modelo de 1,7B absorbe trazas de modelos mayores mediante LoRA de una época, útil para investigadores que estudian la transferencia de capacidades.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que las capacidades descritas son casos de uso previstos y no mejoras medidas, y que la comparación con el checkpoint padre requiere evaluaciones independientes.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma exacta en la información proporcionada. Como referencia orientativa por tamaño (1,73B parámetros), las cuantizaciones de 4 bits suelen ocupar del orden de 1 a 1,5 GB y las de 8 bits alrededor de 2 GB, pero los niveles concretos incluidos en este repositorio no se detallan.
- GPU recomendadas: no especificadas por el autor. Por tamaño, el modelo es apto para GPU de consumo con 6-8 GB de VRAM o más; para despliegue concurrente se recomiendan GPU profesionales (A100, H100) con servidores de inferencia.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con al menos 6-8 GB de VRAM en cuantizaciones bajas, aunque no hay confirmación oficial en la información disponible.
- Opciones de despliegue: llama.cpp y Ollama por el formato GGUF; vLLM y TGI si se dispone de los pesos en safetensors del modelo base; transformers con soporte de código personalizado (tag custom_code).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| xtools-at/LFM3-1.7B-Claude-Opus-Reasoning-Distilled-GGUF | 1,73B | No disponible | LFM 1.0 | GGUF | Fine-tune de razonamiento sobre fusión Agent Orange; sin benchmarks publicados |
| LiquidAI/LFM3-1.7B | 1,73B | No disponible en la información | LFM 1.0 | Safetensors | Modelo base original de Liquid AI, orientado a despliegue local y agentes |
| xtools-at/LFM3-1.7B-AgentOrange-Claude-Code-2xMerge | 1,73B | No disponible | LFM 1.0 | Safetensors | Checkpoint padre: fusión de fine-tunes de código y tool calling |

No se dispone de datos de rendimiento comparado (benchmarks) para establecer diferencias cuantitativas entre estas variantes. Otras alternativas de tamaño similar no se han identificado en la información proporcionada.

## Limitaciones y advertencias

- Sesgos heredados de datos sintéticos: al entrenarse sobre trazas generadas por Claude, el modelo puede reproducir sesgos estilísticos, errores recurrentes o debilidades presentes en esas trazas, tal como advierte el autor.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad factual; en un modelo de 1,7B el riesgo es estructuralmente alto, especialmente en razonamiento multi-paso largo.
- Mejoras no verificadas: el autor señala que las capacidades de razonamiento son casos de uso previstos y no mejoras medidas frente al checkpoint padre.
- Longitud de contexto: el entrenamiento se limitó a 8.192 tokens; no se especifica la ventana de contexto efectiva del modelo desplegado, por lo que no debe asumirse un contexto mayor.
- Restricciones de licencia: la licencia LFM 1.0 (license: other) puede imponer condiciones al uso comercial; debe revisarse el texto completo antes de un despliegue en producción.
- Idiomas: aunque se declaran 16 idiomas, no hay evaluación de calidad por idioma; el rendimiento en lenguas distintas del inglés puede ser desigual.
- Naturaleza experimental: se trata de un experimento de un desarrollador independiente, sin revisión por pares ni evaluaciones independientes, con cero descargas y cero likes en el momento de la ficha.
- Cuantización: los niveles GGUF concretos no se detallan; la pérdida de calidad asociada a cada nivel no está documentada.

## Enlaces

- Repositorio HuggingFace (GGUF): https://huggingface.co/xtools-at/LFM3-1.7B-Claude-Opus-Reasoning-Distilled-GGUF
- Modelo base (safetensors): https://huggingface.co/xtools-at/LFM3-1.7B-Claude-Opus-Reasoning-Distilled
- Checkpoint padre Agent Orange: https://huggingface.co/xtools-at/LFM3-1.7B-AgentOrange-Claude-Code-2xMerge
- Modelo original de Liquid AI: https://huggingface.co/LiquidAI/LFM3-1.7B
- Fine-tune de código: https://huggingface.co/mondk/LFM3-1.7B-Claude-Code-Safetensors
- Fine-tune de tool calling: https://huggingface.co/saidutta69/LFM3-1.7B-Claude-Fable5.1
- Dataset Claude-Opus-4.6-Reasoning-887x: https://huggingface.co/datasets/TeichAI/Claude-Opus-4.6-Reasoning-887x
- Dataset claude-4.5-opus-high-reasoning-250x: https://huggingface.co/datasets/TeichAI/claude-4.5-opus-high-reasoning-250x
- Dataset claude-sonnet-4.5-high-reasoning-250x: https://huggingface.co/datasets/TeichAI/claude-sonnet-4.5-high-reasoning-250x
- Dataset claude-opus-4.6-10000x: https://huggingface.co/datasets/Roman1111111/claude-opus-4.6-10000x
- Dataset Ultra-Trio-Unfiltered: https://huggingface.co/datasets/mondk/Ultra-Trio-Unfiltered
- Dataset Fable 5.1 Premium: https://huggingface.co/datasets/saidutta69/fable-5.1-premium-v2
- Perfil del autor: https://huggingface.co/xtools-at
