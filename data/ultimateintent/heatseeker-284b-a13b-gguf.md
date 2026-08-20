# UltimateIntent/HeatSeeker-284B-A13B-GGUF

## Resumen

HeatSeeker-284B-A13B-GGUF es un finetune del modelo DeepSeek V4 Flash 0731, desarrollado por el usuario UltimateIntent. Se trata de un modelo de texto de gran tamaño con arquitectura Mixture-of-Experts (MoE): 284.334 millones de parámetros totales, de los cuales solo 13.000 millones se activan por token. Esta característica permite obtener la capacidad de un modelo de 284B con un coste de inferencia mucho menor que un denso equivalente. El modelo se distribuye en formato GGUF, lo que facilita su ejecución local con herramientas como llama.cpp u Ollama.

El finetune está orientado a escritura creativa, roleplay y contenido conversacional, incluyendo temática NSFW y ERP (roleplay erótico). Ha sido sometido a un proceso de «abliteración» (abliteration), que elimina los rechazos y restricciones habituales del modelo base, permitiendo respuestas sin censura. La licencia MIT permite uso comercial sin restricciones de atribución. El modelo solo declara soporte para el idioma inglés y se publica con una advertencia de «no apto para todos los públicos». Su relevancia radica en combinar un tamaño de 284B con una ventana de contexto de 1M de tokens, heredada del base, y en ofrecer una alternativa local y sin filtros para generación narrativa avanzada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE), basada en DeepSeek V4 Flash 0731 |
| Parametros totales | 284.334.567.511 (~284B) |
| Parametros activos | 13.000.000.000 (~13B) |
| Longitud de contexto | 1.000.000 tokens (según especificaciones del modelo base) |
| Tipos de cuantizacion | No especificados en la ficha; el repositorio contiene archivos GGUF (88.9 GB en total) |
| Idiomas soportados | Ingles (declarado) |
| Licencia | MIT |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base, DeepSeek V4 Flash 0731, es un transformer MoE con 284B parámetros totales y 13B activos, diseñado para tareas de codificacion, uso de herramientas y flujos agénticos. Su ventana de contexto alcanza 1M de tokens. HeatSeeker es un finetune de este modelo, realizado mediante LoRA (Low-Rank Adaptation), lo que implica que se han ajustado un subconjunto de pesos sobre el base congelado. El proceso de abliteración elimina las capas o activaciones que producen rechazos, de modo que el modelo responde sin negarse a solicitudes que el base consideraría inapropiadas. No se han publicado detalles sobre el dataset de entrenamiento, el número de pasos o la metodología exacta de abliteración aplicada. El resultado es un modelo especializado en narrativa y roleplay, con capacidades heredadas del base (razonamiento, codigo, tool calling) aunque presumiblemente degradadas en favor de la fluidez creativa.

## Capacidades

- Generación de texto creativo: redacción de historias, diálogos, descripciones y escenas con estilo narrativo fluido.
- Roleplay conversacional: interpretación de personajes con personalidad y coherencia a lo largo de múltiples turnos.
- Soporte de tool calling y function calling: heredado del modelo base DeepSeek V4 Flash, aunque el finetune no garantiza su fiabilidad.
- Capacidades agénticas: puede participar en flujos de razonamiento multi-paso, gracias a la arquitectura base.
- Multilingüismo: aunque solo declara inglés, el base soporta múltiples idiomas; no se garantiza la calidad en otros idiomas.
- Modo «sin censura»: la abliteración elimina rechazos típicos, permitiendo contenido explícito o sensible (NSFW, ERP).
- Ventana de contexto larga: 1M de tokens, útil para mantener historias extensas o contextos conversacionales amplios.

## Casos de uso

- Escritura creativa asistida: autores de ficción pueden usarlo para generar borradores de capítulos, desarrollar tramas o describir escenarios. Su contexto de 1M permite mantener coherencia en novelas largas.
- Roleplay conversacional en juegos de rol de mesa: un dungeon master puede usarlo para interpretar NPCs o generar descripciones de escenas en tiempo real, gracias a su capacidad de mantener el hilo narrativo.
- Creación de contenido narrativo interactivo: desarrollo de aventuras de texto o juegos de rol por turnos donde el modelo actúa como narrador y motor de la historia.
- Generación de diálogos para videojuegos: producción de líneas de personajes con tono y personalidad consistentes, útil para estudios independientes sin equipo de escritura.
- Asistente de escritura para guiones: ayuda a esbozar escenas, conflictos y diálogos para cine, teatro o series, aprovechando su fluidez en inglés.
- Simulación de personajes en entornos de prueba: en desarrollo de chatbots o asistentes virtuales, puede generar respuestas con personalidad para testear sistemas de diálogo.
- Generación de contenido NSFW para adultos: orientado a usuarios que buscan material erótico o explícito, con la advertencia de uso responsable y legal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para este finetune en la información disponible. El modelo base DeepSeek V4 Flash reporta métricas en tareas como MMLU, HumanEval y GSM8K, pero no se dispone de esos datos en las fuentes consultadas. Se recomienda evaluar el modelo en las tareas específicas de escritura y roleplay mediante pruebas propias, dado que el finetune puede alterar significativamente el rendimiento respecto al base.

## Requisitos de hardware

- El repositorio GGUF ocupa 88.9 GB, lo que indica que los pesos cuantizados requieren al menos esa cantidad de memoria para cargarse por completo.
- Para inferencia en GPU, se recomienda una GPU con al menos 48 GB de VRAM (por ejemplo, RTX A6000, A100 80GB) para cuantizaciones bajas (Q4_K_M o similares). Con 80 GB de VRAM (H100, A100) se puede usar cuantizaciones más altas con mejor calidad.
- En CPU, se necesita un mínimo de 128 GB de RAM para cargar el modelo completo; con 256 GB se puede operar cómodamente, aunque la latencia será alta.
- Al ser un MoE con 13B activos, la memoria de activación por token es relativamente baja, pero los pesos totales dominan el consumo.
- Herramientas de despliegue compatibles: llama.cpp (incluyendo servidor llama-server), Ollama (si se convierte a formato compatible), y potencialmente vLLM con soporte GGUF (aunque no está garantizado).
- La latencia dependerá del hardware y la cuantización; en una A100 80GB con Q4_K_M, se espera un throughput de decenas de tokens por segundo, pero no se dispone de mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| HeatSeeker-284B-A13B (este) | 284B | 13B | 1M | MIT | GGUF |
| DeepSeek V4 Flash 0731 (base) | 284B | 13B | 1M | MIT | Safetensors, GGUF |
| DeepSeek V4 Pro | 1.6T | 49B | 1M | MIT | Safetensors, GGUF |

No se dispone de datos de benchmarks comparativos entre estos modelos en las fuentes consultadas. La comparativa se limita a parámetros, contexto y licencia. Otros modelos de roleplay como Llama-3-70B o Mistral-7B tienen menor tamaño y contexto, pero no se dispone de datos suficientes para una comparación rigurosa.

## Limitaciones y advertencias

- Contenido explícito: el modelo está diseñado para generar material NSFW y erótico; no es apto para menores ni para entornos profesionales sin control de uso.
- Sesgos y alucinaciones: como todo modelo de lenguaje, puede producir información falsa o inventada, especialmente en contextos largos o temas especializados.
- Solo inglés declarado: aunque el base es multilingüe, el finetune no garantiza calidad en otros idiomas; se recomienda usarlo solo en inglés.
- Abliteración: la eliminación de rechazos puede reducir la seguridad del modelo, haciendo que responda a solicitudes dañinas o ilegales. El usuario es responsable del uso.
- Degradación de capacidades técnicas: el finetune puede haber reducido el rendimiento en codificación o razonamiento lógico respecto al base.
- Contexto de 1M: aunque teórico, en la práctica la atención sobre ventanas muy largas puede degradarse o requerir mucha memoria; se recomienda probar con contextos menores.
- Sin benchmarks publicados: no hay evidencia objetiva de rendimiento; cualquier afirmación sobre calidad debe basarse en pruebas propias.
- Licencia MIT: permite uso comercial, pero no exime de responsabilidad legal por el contenido generado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/UltimateIntent/HeatSeeker-284B-A13B-GGUF
- Perfil del autor: https://huggingface.co/UltimateIntent
- Espacio con vídeo de demostración: https://huggingface.co/spaces/UltimateIntent/heatseekermp4
- Guía de DeepSeek V4 Flash (base): https://www.aimadetools.com/blog/deepseek-v4-flash-complete-guide/
- Ficha de DeepSeek V4 Flash en LM Studio: https://lmstudio.ai/models/deepseek-v4-flash
- Artículo sobre DeepSeek V4 Pro y Flash: https://www.bestblogs.dev/en/article/ef085e0b
