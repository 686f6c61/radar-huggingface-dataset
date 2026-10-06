# stupidlime/Mochi-1.0

## Resumen

Mochi 1.0 es un ajuste fino (fine-tune) de Qwen2.5-0.5B-Instruct en su variante "abliterated" de huihui-ai, publicado por el usuario stupidlime bajo licencia Apache 2.0. Se trata de un modelo de generación de texto de tipo decoder-only con arquitectura transformer Qwen2, 494.032.768 parámetros totales (aproximadamente 0,5B) y pesos distribuidos en formato GGUF, con una cuantización Q4_K_M confirmada en la model card. El repositorio ocupa 0,4 GB, lo que lo sitúa en la categoría de modelos ultraligeros desplegables en CPU y dispositivos de gama baja.

El objetivo declarado por el autor no es competir en rendimiento, sino dotar al modelo base de una personalidad conversacional concreta: un tono informal, directo y sin el modo "asistente servicial" habitual. El propio autor lo describe como "un fine-tune pequeño y poco profesional" y advierte que "no tiene una utilidad real si buscas algo potente o coherente". Es, por tanto, un experimento de estilo y de desalineación de comportamiento, no una herramienta de producción.

Su relevancia actual es la de los modelos de menos de 1B de parámetros: servir como banco de pruebas barato para experimentos de fine-tuning (aquí con QLoRA sobre una única GPU T4 de Google Colab), para despliegues en el borde con presupuesto de memoria mínimo y para estudiar técnicas de "abliteration" y de reescritura de personalidad sobre modelos instruct pequeños. El número de descargas y de "likes" registrado en HuggingFace es 0, lo que indica que se trata de una publicación reciente y sin adopción comunitaria verificada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2) |
| Parametros totales | 494.032.768 (aproximadamente 0,5B) |
| Longitud de contexto | no disponible en la informacion proporcionada (el ejemplo de uso de la model card configura 2048 tokens) |
| Tipos de cuantizacion | Q4_K_M en GGUF (confirmado); metadatos de HuggingFace indican presencia de pesos en safetensors |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF y safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-0.5B-Instruct, un transformer decoder-only con atención causal propia de la familia Qwen2, heredada a su vez de la variante abliterated de huihui-ai. El modelo final no introduce cambios estructurales: es el mismo grafo de 494 millones de parámetros, con los pesos ajustados mediante aprendizaje supervisado. Al no ser un modelo de mezcla de expertos (MoE), no procede distinguir parámetros activos de totales.

El entrenamiento se realizó con Unsloth aplicando QLoRA sobre una GPU T4 de Google Colab, con un conjunto de aproximadamente 1000 ejemplos, 3 épocas y una tasa de aprendizaje de 1e-4. No se documenta el número total de tokens vistos, la composición del dataset, ni si hubo fases de RLHF o DPO posteriores al ajuste supervisado. La innovación técnica relevante no está en la arquitectura sino en la procedencia del modelo base: parte de una versión "abliterated", es decir, con los mecanismos de rechazo previamente suprimidos, sobre la que se aplica un ajuste de estilo con un prompt de sistema que fuerza respuestas directas, sin muletillas de asistente y sin guiones largos.

## Capacidades

- Generación de texto conversacional en inglés, con un registro informal y directo impuesto mediante el prompt de sistema recomendado por el autor.
- Conversación multiturno básica, etiquetada como "conversational" en los metadatos del repositorio.
- Respuesta a instrucciones del tipo instruct, heredada de Qwen2.5-0.5B-Instruct.
- Comportamiento desinhibido ("uncensored") sobre la base abliterated: el modelo no aplica los filtros de rechazo originales.
- Compatibilidad con plantillas de chat vía `--jinja` en llama.cpp, lo que permite aplicar el formato de conversación de Qwen.
- Compatibilidad declarada con "endpoints_compatible" en HuggingFace, orientada a despliegue vía Inference Endpoints.
- No se documentan capacidades de tool calling, function calling, uso de agentes, razonamiento multi-paso, visión, audio ni modo de razonamiento explícito.
- Capacidad multilingüe limitada: el único idioma declarado es el inglés.

## Casos de uso

- Experimentación con personalidad y estilo conversacional: el modelo permite probar, con un coste de cómputo mínimo, cómo cambia el tono de un modelo instruct tras un ajuste de ~1000 ejemplos, útil para investigar técnicas de control de estilo.
- Prototipado rápido de chatbots en local: al ocupar 0,4 GB en Q4_K_M, se puede levantar un servicio de conversación en un portátil sin GPU dedicada y validar flujos de diálogo antes de escalar a un modelo mayor.
- Investigación sobre "abliteration" y desalineación: sirve como caso de estudio reproducible de cómo se comporta un modelo abliterated tras un segundo ajuste de instrucciones, para comparar tasas de rechazo y de respuestas evasivas.
- Despliegue en el borde y en dispositivos embebidos: con menos de 1 GB de memoria necesaria en Q4_K_M, es viable integrarlo en una Raspberry Pi o en un contenedor ligero para generación de texto corto sin conectividad.
- Generación de texto auxiliar en pipelines de datos: puede emplearse para producir borradores, etiquetas o reformulaciones en inglés dentro de un proceso por lotes donde el coste por token es crítico.
- Banco de pruebas para pipelines de cuantización y despliegue: resulta adecuado para validar cadenas de conversión GGUF, plantillas de chat con jinja y despliegues con Ollama o llama.cpp antes de aplicarlas a modelos de mayor tamaño.
- Docencia y demostraciones: su tamaño permite ejecutar ejemplos de fine-tuning con QLoRA en una GPU T4 gratuita, lo que lo convierte en material didáctico para cursos de ajuste de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,4-0,6 GB con la cuantización Q4_K_M publicada; en torno a 1-1,5 GB si se cargan los pesos en FP16 y más si se reserva una ventana de contexto amplia (el KV cache crece de forma lineal con el contexto).
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria es suficiente (GTX 1050 Ti, GTX 1650, MX150 y superiores). El autor entrenó con una NVIDIA T4 de 16 GB, pero ese requisito es del proceso de ajuste, no de la inferencia. Modelos como A100 o H100 no aportan ventaja práctica a este tamaño.
- Compatibilidad con GPU de consumo: sí, en prácticamente todas las GPU de consumo de los últimos ocho años, e incluso en CPU pura mediante llama.cpp.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama mediante Modelfile con el prompt de sistema del autor, y potencialmente vLLM o TGI cargando los pesos en safetensors. La model card solo documenta explícitamente llama.cpp y Ollama.
- Latencia y throughput estimados: no disponibles. Al tratarse de un modelo de 0,5B, en hardware moderno la generación se sitúa habitualmente por encima de las decenas de tokens por segundo incluso en CPU, pero no se aportan mediciones concretas en la información disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| stupidlime/Mochi-1.0 | 494.032.768 | no disponible | Apache 2.0 | HuggingFace, 0 descargas | Fine-tune de estilo sobre base abliterated |
| Qwen/Qwen2.5-0.5B-Instruct | 0,5B (aprox.) | no disponible en esta busqueda | Apache 2.0 | HuggingFace, ampliamente distribuido | Base original de Alibaba Cloud, con alineacion de seguridad estandar |
| huihui-ai/Qwen2.5-0.5B-Instruct-abliterated-v3 | 0,5B (aprox.) | no disponible en esta busqueda | Apache 2.0 | HuggingFace | Modelo base directo de Mochi 1.0; filtros de rechazo suprimidos |

No se dispone de resultados de benchmarks comparativos entre estos modelos en la información proporcionada, por lo que la comparación se limita a parámetros, licencia y disponibilidad. Existen otros modelos ultraligeros de la misma categoría (por ejemplo, familias de ~0,5B de otros proveedores), pero no se aportan datos verficados sobre ellos en esta búsqueda.

## Limitaciones y advertencias

- El propio autor declara que el modelo "no tiene una utilidad real si buscas algo potente o coherente", lo que sitúa la coherencia y la fiabilidad factual por debajo de un modelo instruct convencional.
- Riesgo elevado de alucinación: con 0,5B de parámetros y solo ~1000 ejemplos de ajuste, la capacidad de retener conocimiento factual y de razonar de forma fiable es muy limitada.
- Al derivar de una base "abliterated", el modelo carece de los mecanismos de rechazo del Qwen2.5-0.5B-Instruct original, por lo que puede generar contenido inapropiado, ofensivo o inseguro sin filtros. Etiquetado explícitamente como "uncensored".
- Idiomas: solo se declara inglés. El castellano y otros idiomas no están soportados de forma declarada y su rendimiento en ellos sería presumiblemente deficiente.
- Licencia Apache 2.0: permite uso comercial, modificación y redistribución, siempre que se conserve el aviso de licencia y se indique los cambios. No obstante, el autor no ofrece ninguna garantía sobre el comportamiento del modelo, y la responsabilidad legal sobre el contenido generado sin filtros recae en quien lo despliega.
- Longitud de contexto no documentada: la model card solo sugiere 2048 tokens en el ejemplo de llama.cpp, por lo que no se debe asumir una ventana mayor sin verificarla empíricamente.
- Adopción nula verificada: 0 descargas y 0 "likes" en el momento de la consulta, sin validación externa ni informes de terceros sobre su comportamiento.
- Fecha de creación y actualización registrada como octubre de 2026, posterior a la fecha habitual de publicación de Qwen2.5; conviene verificar la procedencia del repositorio antes de integrarlo en cualquier flujo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/stupidlime/Mochi-1.0
- Modelo base (abliterated): https://huggingface.co/huihui-ai/Qwen2.5-0.5B-Instruct-abliterated-v3
- Perfil del autor del modelo base: https://huggingface.co/huihui-ai
- Qwen2.5-0.5B-Instruct original: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Unsloth (herramienta de fine-tuning empleada): https://github.com/unslothai/unsloth
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo, su autor o su entrenamiento.
