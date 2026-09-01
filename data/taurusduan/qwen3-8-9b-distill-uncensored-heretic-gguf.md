# taurusduan/Qwen3.8-9B-Distill-uncensored-heretic-GGUF

## Resumen

El modelo `Qwen3.8-9B-Distill-uncensored-heretic-GGUF` es una cuantización en formato GGUF del modelo base `nurdich/Qwen3.8-9B-Distill-uncensored-heretic`, una ablación de censura sobre la destilación `Qwen3.5-9B-Distill` realizada por el colectivo Empero. Esta destilación transfiere el comportamiento de razonamiento del modelo masivo Qwen3.8 2.4T A95B a una arquitectura de 9.200 millones de parametros, entrenada con aproximadamente 70.000 trazas de cadena de pensamiento (chain-of-thought) en matematicas, codigo, razonamiento general, seguimiento de instrucciones y uso de herramientas. La version "heretic" elimina las restricciones de censura del modelo original, lo que lo hace atractivo para investigadores que estudian los efectos de la seguridad en modelos de lenguaje, aunque con riesgos evidentes para uso no controlado.

La relevancia actual radica en que ofrece capacidades de razonamiento profundo y function calling en un tamaño que cabe en GPUs de consumo (desde 6 GB de VRAM en cuantizaciones bajas), con licencia Apache 2.0 y sin restricciones comerciales. El repositorio GGUF, publicado por taurusduan y cuantizado por mradermacher, incluye 12 niveles de cuantizacion y dos archivos multimodales (mmproj) que sugieren soporte adicional de vision, aunque no se detalla su integracion en el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basada en Qwen3.5-9B (full-parameter fine-tune) |
| Parametros totales | 9.197.093.888 (aprox. 9,2 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | Ingles (declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (tambien safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base es una destilacion completa (full-parameter fine-tune) realizada por Empero sobre la arquitectura Qwen3.5-9B, utilizando como profesor el modelo Qwen3.8 2.4T A95B (un modelo de mezcla de expertos con 95 mil millones de parametros activos). El entrenamiento se realizo con aproximadamente 70.000 trazas curadas de chain-of-thought que cubren matematicas, codigo, razonamiento general, seguimiento de instrucciones y uso de herramientas. Posteriormente, el modelo `nurdich/Qwen3.8-9B-Distill-uncensored-heretic` aplico una ablacion de censura mediante busqueda automatica del ajuste minimo necesario para eliminar las respuestas negativas a peticiones consideradas "sensibles". Esta ablacion no modifica la arquitectura, sino que ajusta los pesos para reducir la probabilidad de rechazo sin degradar significativamente las capacidades generales.

La cuantizacion GGUF de este repositorio es estatica, realizada por mradermacher, e incluye tanto los pesos del modelo como archivos `mmproj` (proyectores multimodales) en Q8_0 y f16, lo que indica que el modelo base podria tener capacidades de vision, aunque la documentacion no especifica el detalle de su entrenamiento multimodal.

## Capacidades

- Razonamiento profundo mediante cadenas de pensamiento (chain-of-thought), heredado de la destilacion del modelo 2.4T.
- Function calling / tool calling, soportado segun los tags del modelo base.
- Generacion de texto en ingles, con buen rendimiento en tareas de instruccion y conversacion multi-turno.
- Soporte para agentes y razonamiento multi-paso, gracias a las trazas de entrenamiento orientadas a herramientas.
- Capacidades matematicas y de codigo, cubiertas en el dataset de destilacion.
- Ablacion de censura: responde a peticiones que los modelos alineados tipicamente rechazan (con los riesgos asociados).
- Posible soporte multimodal (vision) a traves de los archivos mmproj, aunque no se confirma en la documentacion.

## Casos de uso

- Asistentes de codigo en entornos locales: el modelo puede generar, explicar y depurar codigo en multiples lenguajes, y su soporte de function calling permite integrarlo en IDEs o pipelines de CI/CD para automatizar tareas de revision de codigo.
- Agentes autonomos con herramientas: gracias a las trazas de tool use, puede orquestar llamadas a APIs, bases de datos o servicios externos en flujos de razonamiento multi-paso, adecuado para prototipos de agentes de investigacion o automatizacion.
- Razonamiento matematico y cientifico: su entrenamiento con cadenas de pensamiento en matematicas lo hace util para resolver problemas de algebra, calculo o logica en entornos educativos o de analisis tecnico.
- Investigacion en seguridad y alineacion de IA: al ser una ablacion de censura, permite estudiar el comportamiento de un modelo sin restricciones de seguridad, comparar respuestas con el modelo original y analizar sesgos o riesgos de generacion de contenido perjudicial.
- Chatbots sin filtros para entornos controlados: en aplicaciones donde se requiere libertad creativa o exploracion de temas controvertidos (siempre bajo supervisión humana), el modelo ofrece respuestas sin rechazo sistematico.
- Despliegue en hardware modesto: con cuantizaciones Q4_K_M (5,9 GB) o Q5_K_M (6,7 GB) puede ejecutarse en GPUs de 8 GB de VRAM, lo que permite montar servicios de inferencia local en estaciones de trabajo sin acceso a clusters.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras pruebas estandar para este modelo o su base. Se recomienda consultar la documentacion del modelo original de Empero si se requiere evaluacion comparativa.

## Requisitos de hardware

- VRAM estimada segun cuantizacion (solo pesos del modelo, sin contar contexto ni overhead):
  - Q2_K: ~4,0 GB (requiere al menos 6 GB de VRAM con contexto corto)
  - Q4_K_S / Q4_K_M: ~5,6-5,9 GB (recomendado para GPUs de 8 GB, p. ej. RTX 3060, RTX 4060)
  - Q5_K_M: ~6,7 GB (tambien cabe en 8 GB, con contexto limitado)
  - Q6_K: ~7,7 GB (necesita 10-12 GB de VRAM)
  - Q8_0: ~9,9 GB (recomendado para GPUs de 12 GB como RTX 4070 Ti o 3080)
  - f16: ~18,5 GB (requiere 24 GB o mas, p. ej. RTX 3090/4090, A5000)
- GPUs compatibles: cualquier GPU NVIDIA con al menos 6 GB de VRAM para las cuantizaciones mas bajas; las de 12-24 GB permiten cuantizaciones altas y contextos largos. Tambien funciona en CPU con RAM suficiente (16 GB+).
- Opciones de despliegue: llama.cpp (soporte nativo GGUF), Ollama (facil instalacion y API REST), LM Studio (interfaz grafica), llama-cpp-python para integracion en Python.
- Latencia y throughput: no disponibles. En una RTX 4090 con Q4_K_M se espera una velocidad de 40-60 tokens/s, pero son estimaciones sin confirmar.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formatos | Notas |
|---|---|---|---|---|---|
| Qwen3.8-9B-Distill-uncensored-heretic (este) | 9,2 B | No disponible | Apache 2.0 | GGUF, safetensors | Destilacion de Qwen3.8 2.4T, sin censura |
| Qwen3.5-9B-Distill (original) | ~9 B | No disponible | Apache 2.0 | safetensors, GGUF | Destilacion con censura estandar |
| Llama 3.1 8B Instruct | 8,03 B | 128 K | Llama 3.1 Community License | GGUF, safetensors | Modelo generalista con buenos benchmarks |
| Mistral 7B Instruct v0.3 | 7,24 B | 32 K | Apache 2.0 | GGUF, safetensors | Menos parametros, menos capacidad de razonamiento |

La comparativa se basa en datos publicos de los modelos mencionados. No se dispone de resultados de benchmarks para el modelo evaluado, por lo que no se puede establecer una comparacion cuantitativa de rendimiento.

## Limitaciones y advertencias

- Idioma limitado a ingles; el rendimiento en otros idiomas no esta garantizado y probablemente sea deficiente.
- Longitud de contexto desconocida: no se especifica en la documentacion, lo que impide dimensionar correctamente tareas de memoria larga.
- La ablacion de censura elimina barreras de seguridad, por lo que el modelo puede generar contenido ofensivo, ilegal o peligroso si se le solicita. No apto para uso en produccion sin filtros adicionales.
- No hay benchmarks publicados, por lo que el rendimiento real en tareas estandar es incierto.
- Los archivos mmproj sugieren capacidades multimodales, pero no hay documentacion sobre como usarlos ni sobre la calidad del soporte de vision.
- El repositorio GGUF tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica poca validacion por parte de la comunidad.
- Al ser una cuantizacion estatica (no imatrix), puede haber perdida de precision en comparacion con cuantizaciones dinamicas o con el modelo en punto flotante.
- La fecha de creacion (2026-09-01) es posterior a la fecha de la informacion proporcionada, lo que sugiere que el modelo podria no estar disponible aun en el momento de lectura de esta ficha.

## Enlaces

- Repositorio HuggingFace del GGUF: https://huggingface.co/taurusduan/Qwen3.8-9B-Distill-uncensored-heretic-GGUF
- Modelo base (nurdich): https://huggingface.co/nurdich/Qwen3.8-9B-Distill-uncensored-heretic
- Pagina del modelo en FriendliAI: https://friendli.ai/models/nurdich/Qwen3.8-9B-Distill-uncensored-heretic
- Blog de MindStudio sobre Qwen3.8-9B Distill: https://www.mindstudio.ai/blog/qwen3-8-9b-distill-empero
- Video de demostracion en YouTube: https://www.youtube.com/watch?v=dUP0uBVzDjc
