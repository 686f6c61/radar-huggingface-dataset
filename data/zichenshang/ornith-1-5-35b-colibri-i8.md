# zichenshang/Ornith-1.5-35B-colibri-i8

## Resumen

Ornith-1.5-35B-colibri-i8 es un contenedor de pesos publicado por el usuario zichenshang en HuggingFace, no un modelo entrenado desde cero. Se trata de una conversion del modelo Qwen3.6-35B-A3B al formato del motor de inferencia colibri, con los pesos cuantizados a 8 bits (sufijo i8 del nombre). El repositorio ocupa 37,2 GB y fue creado el 23 de septiembre de 2026, con cero descargas y cero likes en el momento de redactar esta ficha.

La relevancia tecnica esta en la arquitectura del modelo subyacente: segun la model card, se trata de un transformer hibrido en el que cada capa combina atencion con compuertas (gated attention) y capas de atencion lineal basadas en Gated DeltaNet, y en el que todas las capas, incluidas las de DeltaNet, incorporan su bloque MoE/MLP. Los pesos de DeltaNet se almacenan bajo las rutas `model.layers.{i}.linear_attn.*` y se ejecutan mediante la regla recurrente gated-delta en el motor `qwen36` de colibri.

Para un desarrollador, este repositorio es util unicamente si va a desplegar el modelo con el motor colibri: el formato de pesos es propietario de ese runtime y no es directamente consumible por vLLM, llama.cpp, Ollama o TGI. La model card no documenta datos de entrenamiento, licencia, idiomas ni benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con atencion con compuertas y capas de atencion lineal Gated DeltaNet; bloque MoE/MLP en todas las capas |
| Parametros totales | 35B (deducido de la nomenclatura del modelo base Qwen3.6-35B-A3B; no confirmado en la model card) |
| Parametros activos | ~3B (deducido del sufijo A3B del nombre; no confirmado en la model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (deducido del sufijo i8 del nombre; no confirmado en la model card) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | Contenedor propietario del motor colibri; pesos DeltaNet en `model.layers.{i}.linear_attn.*`. No safetensors ni GGUF |
| Tamano del repositorio | 37,2 GB |
| Libreria declarada | colibri |
| Motor de inferencia | colibri, modulo `qwen36.c` |

## Arquitectura y entrenamiento

El modelo base es Qwen3.6-35B-A3B, un transformer de tipo Mixture of Experts. La particularidad que documenta la model card es que se trata de un diseno hibrido: alterna capas de atencion completa con compuertas (gated attention) y capas de atencion lineal implementadas mediante Gated DeltaNet. A diferencia de otras propuestas hibridas en las que las capas recurrentes o lineales sustituyen a los bloques densos, aqui cada capa, incluidas las de DeltaNet, mantiene su bloque MoE/MLP. El calculo de las capas DeltaNet se realiza con la regla recurrente gated-delta implementada en el motor colibri.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de alineacion como RLHF, DPO u otras. Tampoco hay datos sobre innovaciones de decodificacion (especulativa u otras) ni sobre el proceso de cuantizacion a int8 seguido por el autor.

## Capacidades

La informacion proporcionada no documenta capacidades verificadas de este contenedor. Lo que puede afirmarse y lo que queda pendiente de verificacion es lo siguiente:

- Generacion de texto: esperable por tratarse de un modelo de lenguaje de 35B parametros, pero no confirmado en la model card.
- Razonamiento y matematicas: no disponible.
- Generacion de codigo: no disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; la model card no lista idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- Ejecucion de atencion lineal: confirmada a nivel de arquitectura; las capas DeltaNet se ejecutan con la regla recurrente gated-delta en el motor colibri.

## Casos de uso

Los siguientes escenarios son aplicaciones plausibles dado el perfil del contenedor (35B totales, ~3B activos, int8, motor colibri). Se indican como propuestas de despliegue, no como capacidades verificadas:

- Inferencia autoalojada en una GPU de 80 GB: el contenedor de 37,2 GB en int8 permite servir el modelo en una unica A100 o H100 de 80 GB sin necesidad de paralelismo de tensor, siempre que se use el motor colibri.
- Despliegue con dos GPU de consumo: repartiendo los pesos entre dos RTX 4090 o RTX 5090 (48 GB agregados) se puede cubrir el peso del modelo, con margen limitado. Requiere que el motor soporte sharding, algo no documentado en la informacion disponible.
- Investigacion sobre atencion lineal y modelos hibridos: al exponer pesos DeltaNet separados bajo `model.layers.{i}.linear_attn.*`, el contenedor es util para estudiar el comportamiento de la regla gated-delta frente a la atencion completa dentro del mismo modelo.
- Evaluacion comparativa de cuantizacion int8: permite medir la degradacion de calidad respecto a los pesos originales del modelo base en las mismas tareas.
- Servicio de generacion de texto de proposito general: si el modelo base conserva sus capacidades, el ratio de ~3B parametros activos reduce el coste de calculo por token frente a un modelo denso de 35B, lo que abarata el servicio en produccion.
- Procesamiento de documentos largos: la componente de atencion lineal evita el crecimiento cuadratico del coste de atencion, lo que resulta favorable en entradas extensas; la longitud de contexto maxima concreta no esta documentada.
- Desarrollo y depuracion del motor colibri: el repositorio sirve como caso de prueba de la implementacion `c/qwen36.c`, incluyendo la ruta de ejecucion de las capas DeltaNet.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 37-40 GB solo para los pesos en int8, mas el coste de activaciones y cache. La model card no especifica requisitos oficiales.
- GPU recomendadas: A100 80 GB o H100 80 GB en configuracion de GPU unica. Para reparto en varias GPU, 2 x RTX 4090 / RTX 5090 (24 GB cada una) o una RTX 6000 Ada de 48 GB cubririan el peso del modelo, con margen ajustado.
- GPU de consumo: no cabe en una unica GPU de consumo de 24 GB. Si cabria, con margen estrecho, en configuraciones de 48 GB agregados.
- Opciones de despliegue: exclusivamente el motor colibri (https://github.com/JustVugg/colibri, modulo `c/qwen36.c`). No hay evidencia de soporte para vLLM, llama.cpp, Ollama o TGI con este formato de contenedor.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

La busqueda web realizada no devolvio resultados relevantes (unicamente paginas corporativas de Microsoft), por lo que no se dispone de datos verificados para construir una comparativa cuantitativa.

| Modelo | Parametros | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Ornith-1.5-35B-colibri-i8 | 35B (deducido) | ~3B (deducido) | no disponible | no disponible | Contenedor colibri int8 |
| Qwen3.6-35B-A3B (modelo base) | 35B (deducido) | ~3B (deducido) | no disponible | no disponible | No disponible |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

Como referencia de categoria, los modelos MoE del orden de 30-35B totales con unos 3B parametros activos son un segmento habitual para despliegue autoalojado en GPU de gama alta. No obstante, no se dispone de datos confirmados sobre que alternativas concretas son comparables en arquitectura hibrida con atencion lineal, ni de cifras de rendimiento que permitan contrastarlas.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. La model card no incluye ninguna seccion de sesgos, uso previsto o evaluacion de seguridad.
- Riesgo de alucinacion: no evaluado en la informacion proporcionada. No hay benchmarks ni evaluaciones de fiabilidad.
- Limitaciones de contexto e idioma: se desconoce la longitud de contexto maxima y el conjunto de idiomas soportados.
- Licencia: no disponible. Esto es un bloqueo potencial para uso comercial; debe verificarse la licencia del modelo base Qwen3.6-35B-A3B y los terminos que el autor del contenedor aplique a su conversion antes de cualquier despliegue en produccion.
- Formato propietario: los pesos solo son utilizables con el motor colibri. Esto limita la portabilidad, el soporte de herramientas del ecosistema y la disponibilidad de optimizaciones (continuous batching, paged attention, etc.) que ofrecen otros runtimes.
- Estado del repositorio: cero descargas y cero likes, creado y actualizado en la misma fecha. No hay evidencia de uso en produccion ni de validacion independiente de la conversion.
- Riesgo de conversion: no se documenta el procedimiento de cuantizacion ni se ofrecen metricas de degradacion respecto a los pesos originales. La calidad real del contenedor int8 no esta verificada.
- Fecha de publicacion: la model card indica septiembre de 2026, posterior a la informacion disponible en la busqueda web, lo que impide contrastar el modelo base contra fuentes publicas en este contexto.
- Perfil de parametros no confirmado: las cifras de 35B totales y ~3B activos se deducen de la nomenclatura del nombre, no de una ficha tecnica explicita.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/zichenshang/Ornith-1.5-35B-colibri-i8
- Motor colibri (GitHub): https://github.com/JustVugg/colibri
- Codigo del motor para esta arquitectura: `c/qwen36.c` dentro del repositorio de colibri
- Paper del modelo base Qwen3.6-35B-A3B: no disponible
- Blog o anuncio del modelo base: no disponible
- Demos o espacios asociados: no disponible
- La busqueda web realizada no devolvio enlaces relevantes al modelo; los unicos resultados fueron paginas corporativas de Microsoft sin relacion con esta ficha.
