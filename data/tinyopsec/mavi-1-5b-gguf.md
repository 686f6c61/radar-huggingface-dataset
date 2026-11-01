# tinyopsec/Mavi-1.5B-GGUF

## Resumen

Mavi-1.5B-GGUF es una colección de cuantizaciones en formato GGUF del modelo Mavi-1.5B, desarrollada por el usuario tinyopsec y publicada en HuggingFace. El modelo original (`sumeyragurlek/Mavi-1.5B`) es un fine-tuning de Qwen2.5-1.5B-Instruct especializado en asistente ciudadano municipal en turco, concretamente para el municipio de Martıkent Belediyesi. El fine-tuning se realizó mediante QLoRA, la técnica de ajuste eficiente por rangos bajos cuantizada, y el modelo está orientado a casos de uso conversacionales con RAG y agentes.

La relevancia de este modelo reside en su especialización vertical: un modelo pequeño (1.543.714.304 parámetros) adaptado a un dominio específico (servicios municipales turcos) y a un idioma concreto. Al distribuirse en GGUF, puede ejecutarse localmente en hardware modesto mediante llama.cpp, Ollama, LM Studio o koboldcpp, lo que lo hace adecuado para despliegues on-premise en administraciones públicas donde la privacidad de los datos ciudadanos es crítica. El tamaño del repositorio es de 15,3 GB, ya que incluye trece variantes de cuantización, desde F16 hasta Q2_K.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer Qwen2 (decoder-only) |
| Parámetros totales | 1.543.714.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen2.5-1.5B-Instruct: 32.768 tokens según el modelo base) |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q5_0, Q4_K_M, Q4_K_S, Q4_0, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | Turco (especialización principal); no disponible el listado completo |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (convertido con llama.cpp) |

## Arquitectura y entrenamiento

Mavi-1.5B parte de Qwen2.5-1.5B-Instruct, un transformer decoder-only de la familia Qwen2.5 con 1.500 millones de parámetros. Sobre este modelo base se aplicó un fine-tuning con QLoRA (Quantized Low-Rank Adaptation), que congela los pesos originales y entrena matrices de bajo rango sobre capas cuantizadas, reduciendo drásticamente los requisitos de memoria de entrenamiento. El dataset de entrenamiento no está disponible en la model card, aunque los tags sugieren que el ajuste está orientado a asistente municipal, RAG y uso como agente.

La conversión a GGUF se realizó con llama.cpp, generando trece cuantizaciones distintas. La model card recomienda la variante Q4_K_M como opción equilibrada entre tamaño y calidad. No se ha publicado información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas de alineación adicionales (RLHF, DPO).

## Capacidades

- Generación de texto conversacional en turco, especializada en consultas ciudadanas municipales (trámites, servicios locales).
- Integración en sistemas RAG: los tags del modelo indican que está pensado para recuperar documentos municipales y generar respuestas fundamentadas.
- Uso como agente: el tag "agent" sugiere compatibilidad con flujos de razonamiento multi-paso y tool calling, aunque no se detallan capacidades específicas.
- Ejecución local en CPU o GPU mediante runtimes GGUF (llama.cpp, Ollama, LM Studio, koboldcpp).
- Herencia de capacidades generales de Qwen2.5-1.5B-Instruct (razonamiento básico, código, matemáticas), presumiblemente degradadas en el dominio municipal por el fine-tuning.

## Casos de uso

- Chatbot ciudadano municipal: el modelo puede responder consultas de vecinos sobre trámites, horarios y servicios del municipio de Martıkent, funcionando como primera línea de atención.
- Despliegue on-premise en administraciones públicas: al ser un modelo de 1,5B cuantizado, puede ejecutarse en servidores modestos sin enviar datos de ciudadanos a la nube, un requisito habitual en el sector público.
- Asistente con RAG sobre documentación municipal: combinado con un motor de recuperación (por ejemplo, un índice vectorial de ordenanzas y boletines), el modelo genera respuestas basadas en documentos locales.
- Prototipado de agentes locales: su tamaño permite iterar rápidamente en pipelines de agentes que consultan APIs municipales o bases de datos, sin coste de inferencia significativo.
- Integración en aplicaciones de escritorio: mediante Ollama o LM Studio, un desarrollador puede probar el asistente localmente antes de escalar.
- Automatización de respuestas a formularios y correos: clasificación y redacción de borradores de respuesta a solicitudes ciudadanas frecuentes en turco.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: la variante Q4_K_M ocupa aproximadamente 1-1,2 GB; F16 ocupa 3,0 GB según la model card. Al ser un modelo de 1,5B, es plenamente ejecutable en CPU.
- GPU recomendadas: no se requieren GPU dedicadas; cualquier GPU con 4 GB de VRAM (por ejemplo, una RTX 3060 o superior) acelera la inferencia con las variantes Q4/Q5.
- Consumer GPUs: cabe sobradamente en prácticamente cualquier GPU moderna, incluso integradas, con las cuantizaciones Q4 y Q3.
- Opciones de despliegue: llama.cpp (ejemplo oficial: `./llama-cli -m model-Q4_K_M.gguf -p "Your prompt" -n 256`), Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponible; por su tamaño (1,5B), es razonable esperar velocidades superiores a 20 tokens/s en CPU moderna, pero no hay datos publicados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Especialización |
|---|---|---|---|---|
| Mavi-1.5B-GGUF | 1.543.714.304 | no disponible (base: 32.768 tokens) | Apache 2.0 | Asistente municipal en turco |
| Qwen2.5-1.5B-Instruct (base) | 1.540.000.000 (aprox.) | 32.768 tokens | Apache 2.0 | General, multilingüe |
| Llama-3.2-1B-Instruct | 1.230.000.000 (aprox.) | 131.072 tokens | Llama 3.2 Community License | General, multilingüe |

Mavi-1.5B sacrifica la generalidad y el contexto largo de sus competidores a cambio de rendimiento especializado en el dominio municipal turco, donde un modelo general de tamaño similar probablemente cometa más errores factuales sobre trámites y normativa local.

## Limitaciones y advertencias

- Alcance muy estrecho: el fine-tuning está orientado al municipio de Martıkent Belediyesi; su utilidad fuera de ese dominio o para otros municipios no está garantizada y requiere evaluación previa.
- Riesgo de alucinación elevado al tratarse de un modelo de 1,5B parámetros: es recomendable usarlo siempre con RAG y verificación de fuentes en producción.
- El propio autor incluye un disclaimer en la model card: "Evaluate before use", es decir, no hay garantías de calidad ni de idoneidad para producción.
- Contexto reducido respecto a alternativas modernas: al heredar de Qwen2.5-1.5B-Instruct, la ventana es de 32.768 tokens, limitada para documentos municipales extensos sin chunking.
- Cuantizaciones agresivas (Q3, Q2_K) degradan notablemente la calidad en un modelo ya pequeño; se recomienda no bajar de Q4_K_M.
- Licencia Apache 2.0: sin restricciones para uso comercial, aunque conviene revisar los términos de la licencia del modelo base (Qwen2.5, también Apache 2.0).
- Soporte de turco: Qwen2.5 tiene cobertura multilingüe, pero el turco no es su idioma principal; el fine-tuning mitiga esto solo dentro del dominio entrenado.

## Enlaces

- Modelo GGUF: https://huggingface.co/tinyopsec/Mavi-1.5B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Modelo original fine-tuned: no disponible (referenciado como `sumeyragurlek/Mavi-1.5B`; URL directa no proporcionada en la información disponible)
