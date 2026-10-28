# tinyopsec/incorrecter-GGUF

## Resumen

Incorrecter es un ajuste fino (fine-tune) del modelo Qwen2.5-0.5B-Instruct de Alibaba, entrenado para realizar la tarea inversa a la correccion automatica: introducir errores humanos realistas en textos limpios y con aspecto de haber sido generados por IA. El modelo original fue desarrollado por Avicennasis bajo el nombre `Avicennasis/incorrecter`, y esta ficha corresponde a la publicacion de cuantizaciones GGUF realizada por el usuario tinyopsec, generadas con llama.cpp para su uso en entornos de inferencia local.

Se trata de un modelo de 494.032.768 parametros (aproximadamente 0,5 mil millones), con licencia Apache 2.0 y formato GGUF, lo que permite ejecutarlo en CPU o en GPUs de consumo muy modestas. Su relevancia actual radica en su utilidad como herramienta de "humanizacion" de textos: resulta util para generar corpus sinteticos con ruido realista, probar sistemas de correccion ortografica o entrenar detectores de texto generado por IA.

Al ser un modelo derivado de Qwen2.5-0.5B-Instruct, hereda la arquitectura transformer densa de la familia Qwen2.5 y su ventana de contexto, aunque la model card no detalla explicitamente estos valores para el fine-tune. No se han publicado resultados de benchmarks ni una descripcion detallada del dataset de entrenamiento en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer densa (derivada de Qwen2.5-0.5B-Instruct, familia Qwen2) |
| Parametros totales | 494.032.768 (aproximadamente 0,5 mil millones) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q5_0, Q4_K_M (recomendada), Q4_K_S, Q4_0, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | No disponible (hereda el soporte multilingue de Qwen2.5-0.5B-Instruct, no verificado para esta tarea) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (generados con llama.cpp) |

## Arquitectura y entrenamiento

El modelo es un fine-tune de Qwen/Qwen2.5-0.5B-Instruct, un transformer denso decoder-only de la familia Qwen2, con 494 millones de parametros. La tarea especifica para la que fue ajustado es la generacion de errores humanos plausibles: equivocaciones tipo eggcorn (confusiones etimologicas populares), homofonos incorrectos, errores de tecleo, inicios de frase en minuscula, espacios duplicados y omision de puntos finales. El repositorio original describe el modelo como "lo opuesto a la autocorreccion".

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF o DPO en el ajuste. Tampoco se documentan innovaciones tecnicas adicionales mas alla del propio fine-tune. Las cuantizaciones GGUF publicadas en este repositorio fueron producidas con llama.cpp, herramienta estandar del ecosistema para convertir pesos de safetensors a GGUF.

## Capacidades

- Generacion de errores ortograficos y tipograficos realistas en textos limpios, incluyendo homofonos, eggcorns y errores de tecleo.
- Introduccion de artefactos de escritura humana: espacios dobles, puntos finales omitidos, inicios de frase en minuscula.
- Transformacion de textos con estilo "IA" hacia variantes mas humanas o imperfectas.
- Generacion de texto conversacional, al heredar la base instruct de Qwen2.5-0.5B.
- Compatibilidad con runtimes GGUF: llama.cpp, Ollama, LM Studio, koboldcpp y similares.
- No se documenta soporte de tool calling, function calling, agentes, vision ni audio en la informacion disponible.

## Casos de uso

- Generacion de corpus sinteticos con ruido realista: crear datasets de pares (texto limpio, texto con errores) para entrenar o evaluar correctores ortograficos y modelos de correccion gramatical.
- Pruebas de robustez de sistemas de correccion: introducir errores controlados en textos de entrada para medir la tasa de deteccion de herramientas como LanguageTool o correctores basados en LLM.
- Entrenamiento de detectores de texto generado por IA: disponer de ejemplos con imperfecciones humanas permite construir clasificadores mas robustos frente a textos "demasiado limpios".
- Simulacion de escritura humana en entornos de pruebas: generar mensajes de Slack, correos o notas con imperfecciones para validar sistemas de procesamiento de lenguaje natural en condiciones realistas.
- Investigacion sobre humanizacion de texto: estudiar que rasgos estilisticos perciben los lectores como humanos y como se pueden reproducir de forma controlada.
- Anonimizacion estilistica o perturbacion de texto: introducir variaciones que dificulten la atribucion automatica de autoria o la deteccion de plantillas en entornos de pruebas.
- Educacion y demostraciones: mostrar de forma interactiva como funcionan los errores tipicos de escritura y por que los correctores fallan en ciertos casos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,0 GB en F16, 0,5 GB en Q8_0 y 0,3 GB en Q4_K_M (valores aproximados para 494 millones de parametros).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; tambien funciona en CPU.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna (GTX 1050, RTX 3050, RTX 4090, etc.) e incluso en dispositivos de gama baja.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tinyopsec/incorrecter-GGUF | 494 M | No disponible | Generacion de errores humanos | Apache 2.0 | HuggingFace (GGUF) |
| Qwen/Qwen2.5-0.5B-Instruct | 494 M | 32.768 tokens (segun documentacion de Qwen) | Generacion de texto general e instrucciones | Apache 2.0 | HuggingFace |
| Avicennasis/incorrecter | 494 M | No disponible | Generacion de errores humanos (pesos originales) | Apache 2.0 | HuggingFace / GitHub |

No se han identificado en la informacion disponible otros modelos especializados en generacion de errores humanos comparables directamente.

## Limitaciones y advertencias

- Modelo de proposito muy especifico: no esta pensado como asistente general ni para tareas de razonamiento complejo.
- Riesgo de alucinacion y de generar errores no deseados fuera de la tarea objetivo, dado el tamano reducido del modelo base.
- La calidad y el realismo de los errores generados no estan evaluados con metricas publicas en la informacion disponible.
- No se documenta el soporte multilingue del fine-tune; el comportamiento en castellano o en idiomas distintos del ingles no esta verificado.
- Uso dual: la generacion de errores puede emplearse para evadir detectores de texto generado por IA, lo que plantea consideraciones eticas.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda evaluar el modelo antes de integrarlo en produccion, tal como advierte el propio autor.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/tinyopsec/incorrecter-GGUF
- Modelo original: https://huggingface.co/Avicennasis/incorrecter
- Repositorio GitHub del modelo original: https://github.com/Avicennasis/incorrecter/tree/main/
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Perfil del autor de las cuantizaciones: https://huggingface.co/tinyopsec/models
