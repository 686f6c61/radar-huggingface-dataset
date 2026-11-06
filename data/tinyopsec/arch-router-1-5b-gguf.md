# tinyopsec/Arch-Router-1.5B-GGUF

## Resumen

Arch-Router-1.5B — GGUF es una colección de cuantizaciones en formato GGUF, producidas con llama.cpp por el usuario tinyopsec, del modelo `katanemo/Arch-Router-1.5B` de Katanemo. Se trata de un ajuste fino de Qwen2.5-1.5B-Instruct especializado en enrutamiento de LLM alineado con preferencias: su tarea es decidir qué modelo de un catálogo debe atender una consulta concreta, mediante coincidencia de dominio y acción según las preferencias definidas por el operador.

El problema que resuelve es el del enrutamiento en sistemas multi-modelo: en producción, con decenas de modelos disponibles (distintos costes, capacidades y licencias), hace falta un componente ligero y rápido que asigne cada petición al modelo más adecuado sin recurrir a un LLM grande. Un router de 1,5 mil millones de parámetros ejecutable localmente con llama.cpp u Ollama cubre ese nicho con una latencia y un coste mínimos.

Es relevante ahora porque los despliegues multi-modelo se han generalizado y el enrutamiento basado en LLM pequeños es una alternativa práctica a clasificadores entrenados a medida o a heurísticas. El repo pesa 15,3 GB y ofrece trece variantes de cuantización, desde F16 (3,0 GB) hasta Q2_K.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (familia Qwen2), fine-tuning de Qwen2.5-1.5B-Instruct |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (no es MoE; todos los parametros estan activos) |
| Longitud de contexto | no disponible (el modelo base Qwen2.5-1.5B-Instruct soporta 32.768 tokens, pero el router no lo documenta) |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q5_0, Q4_K_M, Q4_K_S, Q4_0, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | no disponible |
| Licencia | Otra (Katanemo Research License) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-1.5B-Instruct, un transformer decoder denso de la familia Qwen2, y se ha ajustado finamente para la tarea de enrutamiento con alineación de preferencias. Según la model card, el router funciona por coincidencia de dominio y acción (domain/action matching): recibe la consulta del usuario junto con una descripción de los modelos candidatos y sus dominios o capacidades, y devuelve el modelo más adecuado según las preferencias declaradas por el operador del sistema. Esto permite dirigir el tráfico sin reentrenar el router cada vez que cambia el catálogo de modelos, ya que las preferencias se expresan en lenguaje natural.

No se han publicado detalles sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas concretas de alineación (RLHF, DPO) en la información disponible. Lo que sí consta es que las cuantizaciones GGUF se han producido con llama.cpp, lo que habilita su ejecución en CPU y en GPUs de consumo. Al ser un modelo denso de 1,5B de parámetros, no incorpora técnicas de mezcla de expertos ni mecanismos de atención exóticos documentados.

## Capacidades

- Enrutamiento de consultas LLM: selecciona el modelo más adecuado de un catálogo definido por el usuario, mediante coincidencia de dominio y acción.
- Alineación con preferencias: las reglas de enrutamiento se expresan en lenguaje natural (por ejemplo, "las consultas legales van al modelo X"), sin necesidad de reentrenamiento.
- Generación de texto conversacional heredada del modelo base Qwen2.5-1.5B-Instruct, aunque no es su propósito principal.
- Ejecución local y en dispositivos con recursos limitados gracias al formato GGUF y a su tamaño de 1,5B de parámetros.
- No disponible: no hay evidencia de capacidades de visión, audio, tool calling, agentes ni modos de razonamiento extendido en la información proporcionada.

## Casos de uso

- Enrutamiento en gateways multi-modelo: como componente de un gateway tipo LLM Router (el caso de uso original de Katanemo con Arch), clasifica cada petición entrante y la dirige al modelo del catálogo que mejor encaje por dominio y coste.
- Optimización de costes en producción: dirige las consultas simples a modelos pequeños y baratos, y reserva los modelos grandes para peticiones complejas, reduciendo el gasto por token sin reglas escritas a mano.
- Selección dinámica sin reentrenamiento: cuando se añade o retira un modelo del catálogo, basta con actualizar la descripción en lenguaje natural de los candidatos, sin reentrenar ni recompilar el router.
- Ejecución en el borde (edge): con la variante Q4_K_M (~1 GB aprox.) puede correr en portátiles, mini-PCs o servidores modestos con llama.cpp u Ollama, útil para prefiltrado local antes de llamar a APIs remotas.
- Cumplimiento de políticas internas: enruta según preferencias organizativas, por ejemplo forzando que datos sensibles vayan a modelos desplegados internamente y consultas genéricas a proveedores externos.
- Balanceo semántico de carga: distribuye tráfico entre modelos equivalentes según afinidad temática detectada en la consulta, complementando balanceadores tradicionales que solo miran métricas de infraestructura.
- Evaluación y prototipado de estrategias de routing: su tamaño permite experimentar con políticas de enrutamiento en local de forma barata antes de escalar a producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card original de `katanemo/Arch-Router-1.5B` no está incluida en los datos proporcionados, por lo que no se pueden citar métricas de precisión de enrutamiento ni comparativas.

## Requisitos de hardware

- VRAM / memoria estimada para inferencia: la variante F16 ocupa 3,0 GB; las cuantizaciones Q8_0 rondan ~1,6 GB, Q4_K_M aproximadamente ~1 GB, y Q2_K menos de 0,7 GB (estimaciones proporcionales al tamaño del repo; los tamaños exactos por archivo no constan salvo el de F16).
- GPUs recomendadas: no requiere GPU; cualquier GPU moderna con 2-4 GB de VRAM es más que suficiente. Compatible con RTX 3060, RTX 4060 o superiores sin problemas.
- Consumer GPUs: cabe sobradamente en prácticamente cualquier GPU de consumo; incluso puede ejecutarse íntegramente en CPU gracias a GGUF, con RAM de 4 GB o más.
- Opciones de despliegue: llama.cpp (ejemplo documentado en la model card: `./llama-cli -m model-Q4_K_M.gguf -p "Your prompt" -n 256`), Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponible. Por su tamaño (1,5B de parámetros) se espera latencia baja incluso en CPU, pero no hay cifras publicadas en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Tarea | Licencia |
|---|---|---|---|---|
| Arch-Router-1.5B (GGUF) | 1,54B | GGUF (13 cuantizaciones) | Enrutamiento LLM alineado con preferencias | Katanemo Research License (other) |
| Qwen2.5-1.5B-Instruct (base) | 1,54B | safetensors, GGUF (comunidad) | Chat y generacion de texto general | Apache 2.0 / Qwen (según version) |
| RouteLLM (lmsys) | no disponible | no disponible | Enrutamiento LLM (framework con clasificadores y routers basados en embeddings) | Apache 2.0 |

Nota: la comparativa se centra en alternativas de enrutamiento o en el modelo base. No hay datos de rendimiento comparativo publicados en la información disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. Al heredar de Qwen2.5-1.5B-Instruct, puede arrastrar los sesgos de sus datos de preentrenamiento y fine-tuning.
- Riesgo de alucinación: bajo en su tarea principal (seleccionar entre opciones dadas), pero no es un generador de conocimiento; usarlo para generación de texto general no es su propósito y la model card advierte expresamente: "Routing model. Evaluate before use".
- Limitaciones de idioma y contexto: no documentadas en la información disponible; la longitud de contexto efectiva del router no se especifica en la model card.
- Restricciones de licencia: se distribuye bajo la Katanemo Research License ("other" en Hugging Face), no bajo una licencia permisiva estándar. Es imprescindible revisar los términos antes de cualquier uso comercial; puede estar restringido a investigación.
- Es una cuantización de terceros (tinyopsec), no el release oficial de Katanemo: verificar la fidelidad de las cuantizaciones (especialmente Q3 y Q2_K, que degradan más) antes de producción.
- Las cuantizaciones agresivas (Q2_K, Q3_K_S) pueden reducir la precisión del enrutamiento; la propia model card recomienda Q4_K_M como variante por defecto.
- El modelo depende del formato del prompt con el catálogo de modelos candidatos; cambios en ese formato pueden degradar su comportamiento sin documentación que lo avise.

## Enlaces

- Repositorio en Hugging Face (esta ficha): https://huggingface.co/tinyopsec/Arch-Router-1.5B-GGUF
- Modelo original (referenciado en la model card): https://huggingface.co/katanemo/Arch-Router-1.5B
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Paper, blog oficial y demos: no disponibles en la información proporcionada.
