# ToldByNun/mango-1.0

## Resumen

Mango 1.0 es un modelo de lenguaje especializado en tareas de agente de codificación, desarrollado por ToldByNun como parte del framework Mango, un agente de codificación de escritorio que funciona sobre runtimes GGUF ligeros como llama.cpp. Se trata de un fine-tune del modelo base Qwen3.8-27B (familia Qwen3.8, aproximadamente 27 000 millones de parámetros), cuantizado a GGUF Q2_K_L para poder ejecutarse en hardware local con recursos moderados. Su objetivo principal es proporcionar una alternativa local, offline y respetuosa con la privacidad para asistencia de programación, tool calling y consultas sobre el contenido de un repositorio.

La relevancia actual de Mango 1.0 reside en su enfoque práctico para entornos de desarrollo con restricciones de hardware o de conectividad. Al estar cuantizado a un nivel agresivo (2 bits), ocupa solo unos 12 GB, lo que permite su ejecución en GPUs de consumo de gama media-alta. Sin embargo, esa cuantización también implica una pérdida notable de calidad en razonamiento complejo y en la precisión de los formatos de tool call, por lo que se recomienda usarlo con herramientas que lean el contenido real de los archivos, en lugar de depender de la memoria del modelo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.8) |
| Parametros totales | 27 320 697 856 (27,3 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta 262 144 tokens (dependiente del runtime y de la VRAM disponible) |
| Tipos de cuantizacion | Q2_K_L (único archivo distribuido) |
| Idiomas soportados | Inglés, alemán (según la model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

Mango 1.0 parte del modelo base Qwen3.8-27B, un transformer denso con atención completa y ventana de contexto extensa. El proceso de entrenamiento documentado consiste en un fine-tuning con QLoRA de 4 bits, seguido de una fusión de los adaptadores y una posterior exportación a formato GGUF con cuantización Q2_K_L. El entrenamiento se centró en un ajuste supervisado (SFT) orientado a flujos de trabajo de agente: tool use, razonamiento de cadena corta (short CoT) y operaciones sobre un workspace (leer, buscar, editar archivos). Los datos exactos y los hiperparámetros se encuentran en el repositorio público del proyecto Mango, bajo el directorio `training/`.

## Capacidades

- Generación de texto y razonamiento conversacional en inglés y alemán.
- Soporte de tool calling / function calling, siguiendo protocolos de agente definidos en el framework Mango.
- Capacidad para leer, buscar y editar archivos dentro de un repositorio de trabajo, mediante herramientas externas.
- Modo agente con razonamiento de cadena corta (short CoT), optimizado para respuestas rápidas en tareas de programación.
- Consultas sobre el contenido de un workspace (Q&A sobre repositorio), basadas en el contexto proporcionado por las herramientas.
- Compatibilidad con el chat template Qwen/ChatML (`<|im_start|>` / `<|im_end|>`).
- Ejecución offline y en local, sin necesidad de conexión a internet.

## Casos de uso

- Asistente de codificación en un IDE local: el modelo se integra como agente dentro de Mango, permitiendo que el desarrollador realice preguntas sobre el código, pida refactorizaciones o busque errores, todo sin salir del entorno de desarrollo.
- Revisión de código automatizada: mediante tool calling, el modelo puede analizar un diff y sugerir mejoras o detectar problemas de estilo, siempre que tenga acceso al contenido real del repositorio.
- Generación de documentación técnica: a partir de la estructura del proyecto, puede redactar comentarios o documentación de funciones, clases o módulos.
- Resolución de tareas de mantenimiento: como buscar dónde se usa una función, identificar dependencias o localizar fragmentos específicos, utilizando las herramientas de búsqueda del framework.
- Análisis de código heredado: en proyectos antiguos, el modelo puede explicar el propósito de archivos o funciones, ayudando a la comprensión del sistema.
- Desarrollo en entornos con restricciones de red: al ser un modelo local, permite trabajar en entornos aislados o con políticas de seguridad estrictas que impiden el uso de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tablas comparativas con otros modelos, y no se han encontrado datos externos en la búsqueda web. La única referencia de rendimiento es la propia limitación declarada por el autor: al ser una cuantización Q2_K_L, se espera un peor comportamiento en razonamiento de largo alcance y más errores de formato en las llamadas a herramientas en comparación con cuantizaciones superiores (Q4, Q5, Q8) o con el modelo en FP16.

## Requisitos de hardware

- El archivo GGUF pesa aproximadamente 12,1 GB, por lo que se recomienda al menos 16 GB de VRAM para cargar el modelo completo en GPU.
- En GPUs con 12 GB de VRAM (por ejemplo, RTX 4070 o RTX 3080 Ti) puede funcionar con offload parcial de capas a CPU, aunque con menor velocidad.
- GPUs recomendadas: RTX 4090 (24 GB) para cargar todo el modelo y obtener la máxima velocidad, o RTX 3090 (24 GB) como alternativa.
- Opciones de despliegue: llama.cpp (CLI o servidor), LM Studio, koboldcpp, o el propio framework Mango (Electron + Python sidecar + llama.cpp).
- La latencia dependerá de la carga de capas en GPU y de la longitud del contexto. Con `-ngl 99` en llama.cpp, la generación será razonablemente rápida en GPUs de gama alta, pero no se dispone de cifras exactas.

## Comparativa con modelos similares

No se dispone de una comparativa directa con otros modelos de la misma categoría en la información proporcionada. El modelo se basa en Qwen3.8-27B, por lo que se puede comparar conceptualmente con el propio Qwen3.8-27B en su versión sin cuantizar, que ofrecería mejor calidad de razonamiento pero un tamaño de alrededor de 54 GB en FP16. Otras alternativas de la misma familia podrían ser modelos como Qwen3-Coder o DeepSeek-Coder, pero no se han proporcionado datos de rendimiento o comparaciones en la documentación disponible.

## Limitaciones y advertencias

- La cuantización Q2_K_L es muy agresiva: se espera una pérdida notable de calidad en tareas de razonamiento complejo, así como más errores en la generación de tool calls (formato incorrecto, argumentos equivocados).
- Riesgo de alucinaciones: el modelo puede inventar APIs, rutas de archivo o fragmentos de código si no se le proporciona acceso real al contenido del repositorio. Se recomienda usar los modos de agente que leen archivos.
- Solo se ha declarado soporte para inglés y alemán; el rendimiento en otros idiomas no está garantizado.
- No está pensado para tareas de alto riesgo (médicas, legales, financieras) ni para producción sin supervisión humana.
- La licencia Apache-2.0 permite uso comercial, pero hay que verificar la licencia del modelo base (Qwen3.8-27B) y los datos de entrenamiento, que no se detallan en la model card.
- Posible prompt injection: al procesar contenido de un repositorio, el modelo podría verse influenciado por instrucciones maliciosas dentro de los archivos.

## Enlaces

- Modelo en Hugging Face: [https://huggingface.co/ToldByNun/mango-1.0](https://huggingface.co/ToldByNun/mango-1.0)
- Repositorio público de Mango (framework): [https://github.com/ToldByNun/mango-public](https://github.com/ToldByNun/mango-public)
- Perfil del autor: [https://github.com/ToldByNun/](https://github.com/ToldByNun/)
