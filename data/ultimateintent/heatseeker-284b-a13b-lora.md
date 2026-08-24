# UltimateIntent/HeatSeeker-284B-A13B-Lora

## Resumen

HeatSeeker-284B-A13B-Lora es un adaptador LoRA creado por UltimateIntent sobre el modelo base DeepSeek-V4-Flash-0731, un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por DeepSeek. El nombre del modelo indica su propósito: un finetune orientado a escritura creativa, roleplay y contenido NSFW (incluido el ERP, roleplay erótico), con la particularidad de estar "abliterated", es decir, se han eliminado o mitigado los mecanismos de rechazo de contenido no seguro. El adaptador LoRA añade solo 825,96 millones de parámetros, mientras que el base cuenta con 284 000 millones de parámetros totales y 13 000 millones activos, lo que permite una ejecución eficiente gracias a su arquitectura MoE.

El modelo se distribuye bajo licencia MIT y está pensado para usuarios que quieran personalizar el comportamiento de DeepSeek V4 Flash sin necesidad de reentrenar el modelo completo. El adaptador se combina con el base en tiempo de inferencia, y el resultado es un sistema de generación de texto enfocado a narrativa y conversación de carácter adulto. Aunque el repositorio solo contiene los pesos del adaptador en formato safetensors, existe una versión GGUF del modelo fusionado para su uso con herramientas como llama.cpp o Ollama.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (base DeepSeek-V4-Flash-0731) + adaptadores LoRA |
| Parametros totales | 825 964 544 (LoRA); 284 000 000 000 (base total) |
| Parametros activos | 13 000 000 000 (base activos) |
| Longitud de contexto | 1 000 000 tokens (heredado del base, segun informacion publica de DeepSeek V4 Flash) |
| Tipos de cuantizacion | no disponible para el adaptador; la version GGUF del modelo combinado ofrece cuantizaciones tipicas (Q4_K_M, Q5_K_M, etc.) |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador LoRA) y GGUF (version combinada en repositorio separado) |

## Arquitectura y entrenamiento

El modelo base, DeepSeek-V4-Flash-0731, es un transformer de tipo Mixture of Experts (MoE) con 284 000 millones de parametros totales y 13 000 millones activos por token. Incluye una ventana de contexto de hasta 1 millon de tokens y esta disenado para eficiencia en inferencia, con soporte para decodificacion especulativa y atencion dispersa. El adaptador LoRA de HeatSeeker se entrena sobre este base mediante un finetune de bajo rango, anadiendo 825 millones de parametros entrenables. El proceso de entrenamiento no esta documentado en la model card, pero las etiquetas indican un enfoque en escritura creativa, roleplay y contenido NSFW, ademas de un paso de "abliteration" que elimina las capas de rechazo de peticiones no seguras. No se dispone de detalles sobre el dataset de entrenamiento, el numero de tokens usados ni si se aplico RLHF o DPO.

## Capacidades

- Generacion de texto creativo: produce narrativas, dialogos y descripciones con un tono literario y flexible, especialmente adaptado a contextos de ficcion.
- Roleplay conversacional: mantiene personajes y escenarios de rol multi-turno, con memoria contextual prolongada gracias a la ventana de 1M de tokens.
- Escritura de contenido adulto: soporta contenido explicito (ERP) de forma explicita, dado su finetune y el proceso de abliteration.
- Generacion de dialogos: crea interacciones coherentes entre personajes, con estilos variados.
- Funciones de llamada a herramientas (tool calling): no confirmado; el base podria soportarlas, pero no se documenta en el adaptador.
- Multilingue: solo ingles (etiqueta `en`). No se han validado otros idiomas.

## Casos de uso

- Chatbots de roleplay para usuarios avanzados: el modelo puede mantener conversaciones inmersivas con personajes ficticios o historicos, aprovechando su ventana de contexto de 1M tokens para recordar tramas extensas.
- Generacion de ficcion erotica: se puede usar como asistente de escritura para crear relatos adultos con control de tono y estilo, gracias a su finetune especifico.
- Simulacion de personajes en juegos de rol textual: integrado en plataformas como SillyTavern o KoboldAI, ofrece respuestas coherentes y creativas en partidas de rol.
- Escritura de guiones o dialogos para videojuegos: el modelo genera conversaciones naturales entre NPCs, reduciendo el tiempo de produccion en estudios independientes.
- Prototipado de narrativa interactiva: los desarrolladores pueden probar ramas de historias no lineales con el modelo como generador de contenido.
- Entrenamiento de modelos mas pequenos: el adaptador LoRA puede servir como referencia para transferir estilos de escritura a modelos locales de menor tamano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica referencia de rendimiento indirecta proviene de la web: DeepSeek V4 Flash (base) alcanza hasta 32 tokens por segundo en decodificacion y unos 250 tokens por segundo en prefill con indice disperso en un AMD Ryzen AI MAX+ 395 con 128 GB de memoria unificada. No hay datos especificos para el adaptador HeatSina.

## Requisitos de hardware

- El adaptador LoRA es ligero (2.9 GB en disco), pero requiere cargar el modelo base completo (284B parametros) para su uso.
- El modelo base puede ejecutarse en una GPU con al menos 80 GB de VRAM en cuantizacion 4-bit (por ejemplo, una NVIDIA A100 80GB o H100). Con cuantizaciones mas agresivas, podria caber en 48-64 GB.
- Para uso en consumer hardware, se recomienda una GPU con 24 GB de VRAM (RTX 4090) o sistemas con memoria unificada de 128 GB (como AMD Ryzen AI MAX+ 395) que permitan ejecutar el modelo cuantizado a velocidades de 20-30 tok/s.
- Opciones de despliegue: llama.cpp, Ollama, vLLM, TGI o KoboldAI para el modelo combinado en formato GGUF.
- En el modo MoE, solo se activan 13B parametros por token, lo que reduce la latencia; se estima un throughput de 20-40 tok/s en hardware de gama alta.

## Comparativa con modelos similares

No se dispone de datos suficientes para comparar este adaptador con otros modelos de la misma categoria (LoRA de roleplay sobre MoE). La unica referencia directa es el modelo base DeepSeek-V4-Flash-0731, que ofrece las mismas capacidades tecnicas pero sin el finetune creativo y sin el proceso de abliteration. Otros modelos de roleplay como Mythic-600K o Euryale podrian ser alternativas, pero no hay datos publicos de rendimiento comparativo con HeatSina.

| Modelo | Parametros | Contexto | Licencia | Uso de roleplay |
|---|---|---|---|---|
| HeatSeeker-284B-A13B-Lora | 284B totales (13B activos) + 825M LoRA | 1M tokens | MIT | Especializado en roleplay y NSFW |
| DeepSeek-V4-Flash-0731 | 284B totales (13B activos) | 1M tokens | MIT | Generico, sin finetune especifico |
| Mythic-C3K (ejemplo) | 13B (denso) | 3K tokens | MIT | Roleplay, pero contexto menor |

Nota: los datos de Mythic-C3K son ilustrativos; no se han verificado en esta busqueda.

## Limitaciones y advertencias

- Contenido explicito: el modelo esta disenado para generar contenido adulto y NSFW. No debe usarse en entornos sin filtros de edad o sin consentimiento explicito.
- Riesgo de sesgos y alucinaciones: como todo modelo de lenguaje, puede producir respuestas inventadas o parcialmente inexactas, especialmente en temas factuales.
- Idiomas: solo se ha entrenado y evaluado en ingles; su uso en otros idiomas puede degradar la calidad.
- Dependencia del base: el adaptador no funciona sin el modelo base DeepSeek-V4-Flash-0731; cualquier actualizacion o cambio en el base puede afectar su rendimiento.
- Licencia MIT: permite uso comercial, pero la responsabilidad legal del contenido generado recae en el usuario.
- Contexto de 1M tokens: aunque el base lo soporta, el adaptador puede no haber sido optimizado para contextos extremadamente largos, lo que podria provocar perdida de coherencia en tramas muy extensas.

## Enlaces

- Modelo LoRA en Hugging Face: https://huggingface.co/UltimateIntent/HeatSeeker-284B-A13B-Lora
- Version GGUF del modelo: https://huggingface.co/UltimateIntent/HeatSeeker-284B-A13B-GGUF
- Modelo base DeepSeek-V4-Flash-0731: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731
- Articulo sobre DeepSeek V4 Pro y Flash (AINews): https://www.bestblogs.dev/en/article/ef085e0b
- Blog sobre ejecucion de DeepSeek V4 Flash en AMD Ryzen AI MAX+ 395: https://www.lucebox.com/blog/deepseek-v4-strix-halo
