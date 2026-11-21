# tinyopsec/Qwen3-4B-Instruct-2507-abliterated-GGUF

## Resumen

Qwen3-4B-Instruct-2507-abliterated-GGUF es un conjunto de cuantizaciones en formato GGUF publicadas por el usuario tinyopsec a partir del modelo glivorem/Qwen3-4B-Instruct-2507-abliterated, que a su vez deriva del Qwen3-4B-Instruct-2507 de Alibaba Qwen. El modelo original es un transformer denso de 4.022.468.096 parámetros (aproximadamente 4 mil millones) orientado a generación de texto e instrucciones, y la variante "abliterated" elimina (o atenúa) el comportamiento de rechazo aprendido durante el alineamiento, lo que da lugar a un modelo "uncensored" que responde a peticiones que el modelo base rechazaría.

El interés de esta publicación es puramente práctico: ofrece el modelo en 13 niveles de cuantización (desde F16 hasta Q2_K) generados con llama.cpp, de modo que puede ejecutarse en hardware de consumo mediante Ollama, LM Studio, koboldcpp o llama.cpp. Con cuantizaciones de 4 bits, el modelo ocupa del orden de 2,5 GB, lo que lo hace viable en GPUs consumer modestas y en CPU.

La relevancia actual radica en la combinación de un modelo Qwen3 pequeño, con licencia Apache 2.0 y sin restricciones de contenido, empaquetado en el formato de facto para inferencia local. No obstante, el proceso de abliteration degrada la calidad y la seguridad del modelo, por lo que debe evaluarse antes de usarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-4B-Instruct-2507; detalles de capas y atención no disponibles en la informacion proporcionada) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q5_0, Q4_K_M (recomendada), Q4_K_S, Q4_0, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | no disponible (el modelo base Qwen3 es multilingue, pero la model card no lo especifica) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (generado con llama.cpp); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-4B-Instruct-2507, un transformer denso de unos 4 mil millones de parámetros. La model card de esta publicación no aporta detalles sobre número de capas, dimensión oculta, mecanismo de atención ni composición del dataset de entrenamiento del modelo original; tampoco documenta si hubo RLHF, DPO u otras fases de alineamiento en el modelo Qwen3 base. Lo que sí se documenta es el proceso de post-entrenamiento específico de esta variante: una "abliteration" realizada con la herramienta Heretic, que modifica los pesos para suprimir la dirección de rechazo aprendida durante el alineamiento, produciendo un modelo "uncensored".

La contribución propia de esta publicación es la cuantización: los pesos se han convertido a GGUF mediante llama.cpp en 13 variantes, desde F16 (precisión completa, aproximadamente 8 GB) hasta Q2_K. No se documentan innovaciones arquitectónicas adicionales (atención lineal, decodificación especulativa, modos de razonamiento explícitos) en la información disponible.

## Capacidades

- Generación de texto conversacional e instrucciones, heredadas del modelo Qwen3-4B-Instruct-2507.
- Respuesta a peticiones que el modelo alineado rechazaría, gracias a la abliteration (contenido sin filtro de rechazo).
- Ejecución local en CPU y GPU mediante runtimes compatibles con GGUF.
- Compatible con endpoints (tag `endpoints_compatible`) para despliegue como servicio de generación de texto.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades de visión o audio: no disponibles (modelo de texto).

## Casos de uso

- Inferencia local en equipos de consumo: con la cuantización Q4_K_M (recomendada por el autor) el modelo ocupa del orden de 2,5 GB, por lo que puede ejecutarse en portátiles y GPUs de gama media sin conexión a la nube, usando Ollama, LM Studio o llama.cpp.
- Prototipado rápido de aplicaciones conversacionales: al ser un modelo de 4B en GGUF, permite iterar sobre prompts y flujos de diálogo en local con latencia baja antes de escalar a modelos mayores.
- Investigación sobre alineamiento y seguridad: la variante abliterated sirve como objeto de estudio para comparar el comportamiento de un modelo alineado frente a uno sin rechazo, midiendo tasas de cumplimiento y degradación de calidad.
- Generación de texto creativo sin restricciones temáticas: escritura de ficción, guiones o contenido narrativo que el modelo base podría rechazar por sus políticas de seguridad.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse íntegramente en local, los datos del usuario no salen del equipo, lo que encaja en escenarios con información sensible que no puede enviarse a APIs externas.
- Evaluación comparativa de cuantizaciones: el repositorio incluye 13 niveles de cuantización, lo que permite medir empíricamente el compromiso entre tamaño, velocidad y calidad para un mismo modelo en un hardware concreto.
- Pruebas de pipelines de generación de texto: su compatibilidad con endpoints y con llama.cpp facilita integrarlo en pruebas de integración de servicios de inferencia antes de migrar a infraestructura mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según tamaño del archivo GGUF): F16 aproximadamente 8 GB; Q8_0 en torno a 4,3 GB; Q6_K en torno a 3,3 GB; Q5_K_M en torno a 2,9 GB; Q4_K_M en torno a 2,5 GB; Q3_K_M en torno a 2 GB; Q2_K en torno a 1,5 GB. Estas cifras son estimaciones por tamaño de pesos; la memoria real depende del contexto configurado y del runtime.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para cuantizaciones de 4-5 bits (por ejemplo, RTX 3060, RTX 4060, RTX 4070); para F16 se recomienda una GPU con 10-12 GB o más (RTX 3080/4080, A100, H100).
- ¿Cabe en GPU consumer? Sí: las cuantizaciones Q4_K_M y Q3_K_M caben en GPUs de gama media y en muchas integradas con memoria unificada; las variantes Q2_K y Q3_K_S son aptas para equipos con 4 GB de VRAM.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3-4B-Instruct-2507-abliterated-GGUF (este) | 4,02 B | no disponible | Apache 2.0 | GGUF (13 cuantizaciones) | Variante sin rechazo, cuantizada con llama.cpp |
| Qwen3-4B-Instruct-2507 (original) | 4,02 B | no disponible | Apache 2.0 | safetensors | Modelo alineado de referencia; rechaza contenido restringido |
| glivorem/Qwen3-4B-Instruct-2507-abliterated | 4,02 B | no disponible | Apache 2.0 | safetensors | Modelo abliterated del que deriva esta publicación |
| Otras alternativas de ~4B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos verificados en la información proporcionada |

## Limitaciones y advertencias

- La abliteration degrada la coherencia y la calidad general del modelo en comparación con el Qwen3-4B-Instruct-2507 original; es esperable una mayor tasa de respuestas incoherentes o fuera de formato.
- Modelo "uncensored": puede generar contenido ofensivo, ilegal o peligroso. No debe desplegarse en aplicaciones de cara al público sin filtros adicionales.
- Riesgo elevado de alucinación, agravado por el tamaño reducido (4B) y por la modificación de pesos.
- La model card no documenta idiomas soportados, longitud de contexto ni comportamiento en tool calling; no deben asumirse capacidades no verificadas.
- Licencia Apache 2.0 permite uso comercial, pero el autor advierte explícitamente de que se evalúe antes de usar; la responsabilidad legal del contenido generado recae en el desplegador.
- Las cuantizaciones de 2 y 3 bits (Q2_K, Q3_K_S, Q3_K_M) introducen pérdida de calidad adicional notable; no se recomiendan para producción.
- No hay resultados de benchmarks publicados para esta variante concreta, por lo que su rendimiento real frente al modelo base es desconocido.
- El repositorio ocupa 39,3 GB por incluir todas las cuantizaciones; conviene descargar solo el archivo necesario.

## Enlaces

- Hugging Face: https://huggingface.co/tinyopsec/Qwen3-4B-Instruct-2507-abliterated-GGUF
- Modelo base de la cuantización: https://huggingface.co/glivorem/Qwen3-4B-Instruct-2507-abliterated
- Modelo original: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Heretic (herramienta de abliteration): https://github.com/p-e-w/heretic
