# specklabs/Speck2-140M-Instruct-GGUF

## Resumen

Speck2-140M-Instruct-GGUF es la conversión a formato GGUF del modelo Speck2-140M-Instruct, desarrollado por el laboratorio specklabs. Se trata de un modelo de lenguaje pequeño (140M de parámetros en su versión original) orientado a tareas de instrucción y conversación, con una arquitectura híbrida que intercala atención global grouped-query con capas de convolución causal gated, una combinación poco habitual en modelos de este tamaño. La conversión a GGUF, realizada con llama.cpp, permite ejecutar el modelo en CPU y en GPUs de baja gama, lo que lo convierte en una opción interesante para despliegues en entornos con recursos limitados.

El modelo se distribuye bajo licencia MIT, lo que facilita su uso comercial y su integración en proyectos propietarios. Al estar cuantizado en varios formatos (BF16, Q4_K_M, Q5_K_M y Q8_0), el usuario puede elegir el equilibrio entre calidad y consumo de memoria. No se han publicado resultados de benchmarks ni detalles sobre el entrenamiento en la información disponible, por lo que su rendimiento real debe evaluarse empíricamente. La relevancia de este modelo radica en su tamaño reducido y su arquitectura híbrida, que podría ofrecer una alternativa eficiente a los transformers puros en escenarios de baja latencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: atención grouped-query global + convolución causal gated |
| Parametros totales | 180.165.376 (en el GGUF; el modelo base tiene ~140M, la conversión añade matrices de entrada/salida separadas) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16, Q4_K_M, Q5_K_M, Q8_0 |
| Idiomas soportados | No disponible (el modelo predecesor Speck1 era exclusivamente inglés) |
| Licencia | MIT |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo original Speck2-140M-Instruct emplea una arquitectura híbrida que alterna bloques de atención global con grouped-query attention (GQA) y capas de convolución causal gated. Esta combinación, también presente en Speck1, busca capturar dependencias de largo alcance mediante la atención y patrones locales mediante la convolución, reduciendo el coste computacional frente a un transformer puro del mismo tamaño. La conversión a GGUF, documentada en la model card, pliega los adaptadores de entrada y salida (640→768 y 768→640) en las matrices de embeddings, rellena con ceros los canales de convolución de 384 a 768 y ajusta los kernels causales de 3 taps a 5 taps. Estas transformaciones preservan la función del modelo salvo por el redondeo numérico normal de la cuantización. No se dispone de información sobre el dataset de entrenamiento, el número de tokens procesados ni si se aplicaron técnicas como RLHF o DPO. El modelo está ajustado para instrucciones (instruct), presumiblemente siguiendo el mismo enfoque que Speck1, que se fine-tuneó sobre el dataset SpeckChat1 durante una época.

## Capacidades

- Generación de texto conversacional: el modelo está diseñado para responder a instrucciones y mantener diálogos multi-turno, aunque su tamaño limita la complejidad de las respuestas.
- Razonamiento básico: puede resolver tareas sencillas de lógica y comprensión lectora, pero fallará en problemas que requieran múltiples pasos o conocimientos extensos.
- Soporte multilingüe: no confirmado; el predecesor Speck1 era exclusivamente inglés, por lo que se espera un comportamiento similar.
- Tool calling / function calling: no se menciona en la documentación, por lo que no se puede asumir su soporte.
- Capacidades de agente: no disponibles.
- Modo de pensamiento (thinking mode): no disponible.

## Casos de uso

- Chatbot ligero para dispositivos edge: gracias a su tamaño de 140M y a las cuantizaciones Q4_K_M (113 MB) o Q5_K_M (130 MB), el modelo puede ejecutarse en Raspberry Pi o en teléfonos de gama baja, ofreciendo respuestas conversacionales sin depender de la nube.
- Asistente de atención al cliente en entornos con poco ancho de banda: al poder desplegarse en CPU, permite montar un sistema de respuestas automáticas para preguntas frecuentes en una intranet corporativa sin necesidad de GPUs dedicadas.
- Generación de texto para prototipos y pruebas: los desarrolladores pueden usar el modelo para validar flujos de generación de texto en aplicaciones antes de migrar a modelos más grandes, reduciendo costes de iteración.
- Clasificación y extracción de información simple: con un prompt adecuado, el modelo puede etiquetar frases, extraer entidades nombradas o resumir textos cortos, útil para pipelines de preprocesamiento.
- Educación y experimentación: al ser de código abierto y ligero, es ideal para que estudiantes e investigadores aprendan a desplegar modelos de lenguaje en local, probando distintas cuantizaciones y midiendo su impacto en la calidad.
- Autocompletado de formularios o correos: el modelo puede generar borradores de respuestas breves en aplicaciones de productividad, aprovechando su capacidad de seguir instrucciones en inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos de MMLU, HumanEval, GSM8K u otras pruebas estandarizadas para Speck2-140M-Instruct ni para su versión GGUF. Se recomienda realizar una evaluación propia con los casos de uso previstos antes de adoptarlo en producción.

## Requisitos de hardware

- VRAM estimada: con la cuantización Q4_K_M (112,9 MB de peso), la VRAM total necesaria para inferencia ronda los 200-300 MB (incluyendo overhead de contexto y activaciones). Con BF16 (361,2 MB), se necesitan aproximadamente 500-700 MB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM (por ejemplo, NVIDIA GTX 1050, Jetson Nano, Intel iGPU). También se ejecuta sin problemas en CPU moderna con 4 GB de RAM.
- Compatibilidad con GPU de consumo: sí, cabe incluso en GPUs integradas de portátiles.
- Opciones de despliegue: llama.cpp (a través de `llama-cli`), Ollama, llama-cpp-python, y cualquier runtime compatible con GGUF como LM Studio o text-generation-webui.
- Latencia y throughput: no se han publicado mediciones oficiales; en CPU moderna se espera una generación de 10-20 tokens por segundo con Q4_K_M, siendo significativamente más rápido en GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Speck2-140M-Instruct (GGUF) | ~140M (180M en GGUF) | No disponible | MIT | GGUF | Arquitectura híbrida atención + convolución |
| Speck1-140M-Instruct | 140,7M | 4K | MIT | Safetensors | Predecesor, solo inglés, fine-tune sobre SpeckChat1 |
| TinyLlama-1.1B | 1,1B | 2K | Apache 2.0 | Safetensors, GGUF | Transformer denso, mucho mayor y más capaz |
| Qwen2.5-0.5B | 0,5B | 32K | Apache 2.0 | Safetensors, GGUF | Transformer denso, contexto largo, buen rendimiento en tareas ligeras |

No se dispone de datos de rendimiento comparativo entre estos modelos, por lo que la elección dependerá de las necesidades específicas de contexto, idioma y hardware.

## Limitaciones y advertencias

- Tamaño reducido: con solo 140M de parámetros, el modelo tiene una capacidad limitada para razonamiento complejo, matemáticas avanzadas o generación de código extenso. No es adecuado para tareas que requieran conocimiento profundo o coherencia a largo plazo.
- Sesgos y alucinaciones: al no haber información sobre el dataset de entrenamiento, no se pueden evaluar sesgos específicos, pero como todo LLM, puede generar contenido falso o inventado con seguridad injustificada.
- Idioma: no se confirma el soporte multilingüe; es probable que solo funcione bien en inglés, lo que limita su uso en entornos hispanohablantes.
- Contexto limitado: aunque no se especifica la longitud de contexto de Speck2, los modelos de este tamaño suelen tener ventanas de 2K-4K tokens, insuficientes para documentos largos.
- Conversión GGUF: las transformaciones aplicadas en la conversión (fusión de adaptadores, padding de convoluciones) introducen pequeñas diferencias numéricas respecto al modelo original, especialmente en cuantizaciones agresivas como Q4_K_M.
- Producción: al carecer de benchmarks y de documentación sobre el entrenamiento, se recomienda una validación exhaustiva antes de integrarlo en sistemas críticos.

## Enlaces

- Modelo GGUF en HuggingFace: https://huggingface.co/specklabs/Speck2-140M-Instruct-GGUF
- Modelo base (Speck2-140M-Instruct): https://huggingface.co/specklabs/Speck2-140M
- Modelo predecesor (Speck1-140M-Instruct): https://huggingface.co/specklabs/Speck1-140M-Instruct
