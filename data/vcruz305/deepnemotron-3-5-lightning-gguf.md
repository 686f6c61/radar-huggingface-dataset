# vcruz305/DeepNemotron-3.5-Lightning-GGUF

## Resumen

DeepNemotron-3.5-Lightning-GGUF es un conjunto de cuantizaciones en formato GGUF del adapter `vcruz305/DeepNemotron-3.5-Lightning`, mergeado sobre el modelo base NVIDIA Nemotron 3.5 Lightning 30B-A3B. El autor, vcruz305, publica estos archivos para permitir la ejecución del modelo mediante llama.cpp y herramientas compatibles, como llama-server, en entornos locales con recursos limitados.

El modelo resultante es un transformer de tipo Mixture of Experts (MoE) con 30 mil millones de parámetros totales y 3 mil millones activos por token, lo que ofrece un equilibrio entre capacidad y eficiencia computacional. Su relevancia radica en que las cuantizaciones GGUF (desde Q2_K hasta Q8_0) facilitan el despliegue en hardware de consumo, algo especialmente útil para desarrolladores que necesitan probar modelos MoE sin infraestructura de servidor.

La licencia, `nvidia-openmdw-and-dataset-other`, no es permisiva (ni MIT ni Apache), por lo que su uso comercial debe revisarse con atención. La documentación disponible es escasa: no se especifican datos de entrenamiento, contexto máximo ni benchmarks, lo que limita la evaluación objetiva del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Mixture of Experts) sobre Nemotron 3.5 Lightning 30B-A3B |
| Parametros totales | 30B (30 mil millones) |
| Parametros activos | 3B (3 mil millones) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K, Q4_K, Q5_K, Q6_K, Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | nvidia-openmdw-and-dataset-other |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo es el resultado de fusionar un adapter (DeepNemotron-3.5-Lightning) sobre el modelo base Nemotron 3.5 Lightning 30B-A3B. La arquitectura subyacente es un transformer con capas MoE, donde solo 3B de los 30B parámetros se activan por token, lo que reduce el coste de inferencia. No se dispone de información sobre el proceso de entrenamiento del adapter: ni número de tokens, ni composición del dataset, ni uso de técnicas como RLHF o DPO. La única innovación técnica en este repositorio es la conversión a GGUF con múltiples niveles de cuantización, que permite ajustar el equilibrio entre tamaño, velocidad y calidad.

## Capacidades

- Generación de texto en ingles.
- Inferencia eficiente gracias a la arquitectura MoE (solo 3B activos por token).
- Ejecucion local mediante llama.cpp, llama-server y otras herramientas compatibles con GGUF.
- No se ha documentado soporte para tool calling, function calling, agentes, razonamiento multi-paso, vision o audio en la informacion disponible.

## Casos de uso

- Inferencia local en CPU o GPU de consumo: el formato GGUF y las cuantizaciones Q4_K_M o Q5_K_M permiten ejecutar el modelo en equipos con 16-24 GB de RAM/VRAM, sin necesidad de servidores dedicados.
- Prototipado rapido de aplicaciones de texto: desarrolladores pueden integrar el modelo en scripts de Python o herramientas de linea de comandos mediante llama.cpp para validar ideas antes de escalar.
- Evaluacion de modelos MoE en entornos educativos: estudiantes e investigadores pueden comparar el comportamiento de un MoE de 30B con alternativas densas usando hardware modesto.
- Generacion de contenido en ingles: redaccion de textos, resumenes o borradores en aplicaciones donde la latencia no sea critica y se priorice la privacidad de los datos.
- Pruebas de cuantizacion: el repositorio ofrece multiples niveles (Q2_K a Q8_0), lo que permite estudiar el impacto de la cuantizacion en la calidad de las respuestas.
- Integracion en pipelines de texto con llama.cpp: por ejemplo, como backend de un chatbot local o un sistema de generacion de documentacion tecnica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No se proporcionan cifras oficiales de VRAM o latencia en el repositorio.
- Al ser un modelo MoE de 30B totales con 3B activos, el consumo de memoria depende principalmente de la cuantizacion elegida: las versiones Q4 o Q5 requieren aproximadamente entre 15 y 20 GB de RAM/VRAM, mientras que Q2 puede reducir ese requisito a unos 10-12 GB (estimacion orientativa, no verificada).
- GPU recomendadas: cualquier GPU con al menos 12 GB de VRAM (por ejemplo, RTX 3060/4070) para cuantizaciones bajas; para Q8_0 se necesitan 24 GB o mas.
- Tambien puede ejecutarse en CPU con suficiente RAM (32 GB o mas) usando cuantizaciones Q4 o inferiores.
- Opciones de despliegue: llama.cpp, llama-server, Ollama (si se importa el GGUF), y cualquier herramienta compatible con el ecosistema GGUF.
- No se dispone de datos de throughput o latencia.

## Comparativa con modelos similares

La comparativa se limita a caracteristicas estructurales, ya que no hay benchmarks publicados. Se compara con otros modelos MoE de tamano similar disponibles en formato GGUF.

| Modelo | Parametros totales | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| DeepNemotron-3.5-Lightning (este) | 30B | 3B | no disponible | nvidia-openmdw-and-dataset-other | GGUF |
| Mixtral 8x7B | 46.7B | 12.9B | 32k | Apache 2.0 | GGUF |
| Qwen2.5-14B-A3B | 14B | 3B | 128k | Apache 2.0 | GGUF |

DeepNemotron-3.5-Lightning se posiciona entre ambos en parametros totales, pero su licencia restrictiva y la falta de informacion sobre contexto o rendimiento limitan su atractivo frente a alternativas abiertas como Mixtral o Qwen.

## Limitaciones y advertencias

- Licencia restrictiva: `nvidia-openmdw-and-dataset-other` no es una licencia de codigo abierto convencional; debe revisarse si el uso comercial o la redistribucion estan permitidos.
- Idioma limitado: el modelo solo declara soporte para ingles, lo que reduce su utilidad en entornos multilingues.
- Sin informacion sobre sesgos, alucinaciones o comportamiento en produccion; no hay documentacion tecnica del adapter.
- La cuantizacion puede degradar la calidad de las respuestas, especialmente en niveles bajos como Q2_K.
- No se especifica la longitud de contexto; si el modelo base soporta 128k, el adapter podria heredarlo, pero no esta confirmado.
- El repositorio indica que los archivos de cuantizacion se anaden tras un proceso de conversion; si el arbol de archivos esta vacio, la conversion podria no haber finalizado.

## Enlaces

- Repositorio GGUF: [https://huggingface.co/vcruz305/DeepNemotron-3.5-Lightning-GGUF](https://huggingface.co/vcruz305/DeepNemotron-3.5-Lightning-GGUF)
- Repositorio del adapter: [https://huggingface.co/vcruz305/DeepNemotron-3.5-Lightning](https://huggingface.co/vcruz305/DeepNemotron-3.5-Lightning)
- No se han encontrado papers, blogs o demos adicionales en la informacion proporcionada.
