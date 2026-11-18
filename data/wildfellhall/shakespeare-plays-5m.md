# wildfellhall/shakespeare-plays-5m

## Resumen

Shakespeare-plays-5m es un modelo de lenguaje de muy pequeño tamano (5,27 millones de parametros) publicado por el usuario wildfellhall en Hugging Face. Se trata de un GPT-2 preentrenado o ajustado exclusivamente sobre el corpus de obras teatrales de William Shakespeare, segun indican las etiquetas del repositorio ("plays", "shakespeare"). Su proposito no es la competicion en benchmarks generales, sino la generacion de texto con estilo dramatico isabelino y el estudio de modelos de lenguaje extremadamente pequenos (SLM) sobre dominios muy acotados.

El modelo se distribuye en formato safetensors con licencia MIT y soporte declarado unicamente para ingles. Con apenas 5,27 millones de parametros, esta tres ordenes de magnitud por debajo de los modelos de referencia actuales, lo que lo situa en la categoria de modelos experimentales o educativos que pueden ejecutarse en cualquier hardware, incluidos dispositivos de bajos recursos. Su relevancia actual es limitada fuera del nicho de generacion estilizada y de la investigacion sobre eficiencia y sobreajuste controlado a dominios especificos.

La model card publicada es minima: unicamente metadatos YAML, sin descripcion de arquitectura, datos de entrenamiento, hiperparametros ni resultados de evaluacion. Esto limita considerablemente la informacion verificable disponible y obliga a inferir muchas caracteristicas a partir del tamano, las etiquetas y el formato de pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only, segun tag del repositorio) |
| Parametros totales | 5.273.088 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, probablemente fp32 o fp16) |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El repositorio etiqueta el modelo como "gpt2", lo que indica una arquitectura transformer decoder-only con atencion causal, la misma familia que el GPT-2 original de OpenAI. Con 5,27 millones de parametros, el modelo es sustancialmente menor que la variante GPT-2 small (124 millones), lo que sugiere una configuracion reducida en numero de capas, dimension de embedding y cabezas de atencion, aunque la model card no detalla estos hiperparametros.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset (mas alla de que se restringe a obras de Shakespeare), ni sobre si se aplicaron tecnicas de ajuste fino supervisado, RLHF o DPO. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa o atencion lineal. El nombre del modelo ("plays-5m") sugiere que el corpus se limita a las obras teatrales, excluyendo sonetos y poemas, pero este extremo no esta confirmado en la documentacion.

## Capacidades

- Generacion de texto en ingles con estilo dramatico y vocabulario isabelino, derivado del corpus de obras de Shakespeare.
- Generacion de dialogos y escenas teatrales con estructura de parlamentos.
- Modelo de muy bajo coste computacional, apto para inferencia en CPU y dispositivos embebidos.
- Capacidad de completar texto (text-generation) a partir de un prompt.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidad multilingue limitada al ingles; no se declaran otros idiomas.
- No se documentan modos especiales (thinking, vision, audio).

## Casos de uso

- Generacion de dialogos teatrales estilizados: el modelo puede completar parlamentos y escenas con registro shakespeariano, util para prototipos creativos, juegos narrativos o talleres de escritura que necesiten imitar el estilo isabelino sin depender de modelos grandes.
- Educacion y demostracion de modelos de lenguaje: por su tamano minimo, sirve para ilustrar en clase como funciona un transformer decoder-only, el efecto del sobreajuste a un dominio y la generacion autoregresiva, ejecutandose en cualquier portatil.
- Pruebas de infraestructura de inferencia: al ser tan ligero, es adecuado para validar pipelines de despliegue (servidores de inferencia, APIs, contenedores) antes de pasar a modelos mayores, con tiempos de arranque minimos.
- Generacion de texto en entornos con recursos restringidos: puede ejecutarse en CPU, Raspberry Pi o navegador mediante runtime adecuado, para aplicaciones de generacion de texto offline donde no hay GPU disponible.
- Investigacion sobre modelos pequenos de dominio especifico: permite estudiar tecnicas de ajuste fino, regularizacion y evaluacion de perplejidad en un corpus cerrado y bien delimitado como el canon shakespeariano.
- Filtrado y aumentacion de datos: puede emplearse para generar variantes estilizadas de texto con fines de aumentacion de datasets de estilo literario o para pruebas de clasificadores de autoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en fp32 (5,27 M de parametros ocupan aproximadamente 21 MB en fp32 y unos 10,5 MB en fp16), por lo que cabe holgadamente en cualquier GPU.
- GPU recomendadas: cualquier GPU, incluidas GTX 1050, RTX 3060, RTX 4090, A100 o H100; el modelo no aprovechara la capacidad de calculo de las GPU de gama alta.
- Cabe en GPU consumer y en CPU: si, sin restricciones practicas; tambien en dispositivos embebidos.
- Opciones de despliegue: transformers (PyTorch), llama.cpp si se convierte a GGUF, y servidores de inferencia genericos; Ollama o vLLM son tecnicamente posibles pero desproporcionados para este tamano.
- Latencia y throughput estimados: no disponibles; por el tamano, la latencia sera del orden de milisegundos por token en CPU moderna.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| wildfellhall/shakespeare-plays-5m | 5,27 M | no disponible | MIT | Hugging Face |
| GPT-2 small (OpenAI) | 124 M | 1024 tokens | MIT | Hugging Face |
| DistilGPT-2 | 82 M | 1024 tokens | Apache 2.0 | Hugging Face |
| Modelos SLM de dominio (p. ej. TinyStories) | 1-30 M | variable | variable | Hugging Face |

La comparativa se limita a parametros, contexto, licencia y disponibilidad porque no hay datos de rendimiento publicados para este modelo. Frente a GPT-2 small, ofrece un tamano 23 veces menor a costa de una capacidad generativa mucho mas restringida y especializada.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse exclusivamente sobre obras de Shakespeare, el modelo reproducira los sesgos culturales, de genero y de epoca presentes en el corpus isabelino, incluidos estereotipos historicos.
- Riesgo de alucinacion: alto en cualquier tarea fuera de la generacion estilizada; con 5 millones de parametros la coherencia a medio plazo es muy limitada y la generacion puede degradarse rapidamente.
- Limitaciones de contexto e idioma: solo se declara ingles y no se documenta la longitud de contexto; es previsible que sea corta (tipicamente 512 o 1024 tokens en configuraciones GPT-2 pequenas, aunque no esta confirmado).
- Restricciones de licencia: la licencia MIT permite uso comercial, pero el modelo no ofrece garantias de calidad para produccion.
- Caveat importante: la model card no documenta datos de entrenamiento, hiperparametros ni evaluacion; cualquier uso en produccion requiere una evaluacion propia previa. El modelo no es adecuado para tareas de razonamiento, codigo, matematicas ni atencion al cliente.
- Fecha de creacion futura en los metadatos (2026-11-18), lo que puede indicar un error de registro o una publicacion programada; conviene verificar la integridad del repositorio antes de usarlo.

## Enlaces

- Hugging Face: https://huggingface.co/wildfellhall/shakespeare-plays-5m
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la informacion disponible.
