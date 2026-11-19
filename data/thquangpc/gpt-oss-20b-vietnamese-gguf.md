# thquangpc/gpt-oss-20B-vietnamese-GGUF

## Resumen

El modelo `thquangpc/gpt-oss-20B-vietnamese-GGUF` es una distribucion en formato GGUF del modelo `hiudev/gpt-oss-20B-vietnamese`, un ajuste fino del modelo GPT-OSS de 20B de parametros orientado al idioma vietnamita. Esta publicacion concreta no es un modelo entrenado desde cero, sino una coleccion de cuantizaciones estaticas generadas con herramientas de la familia Unsloth sobre el checkpoint original en transformers. El autor del repositorio es thquangpc, mientras que la cuantizacion se atribuye en la model card a mradermacher.

La relevancia de esta ficha es doble. Por un lado, documenta un caso tipico de la cadena de publicacion de modelos abiertos: un modelo base de 20B con licencia Apache 2.0, un ajuste fino linguistico y una posterior bateria de cuantizaciones GGUF para facilitar el despliegue en hardware modesto. Por otro, permite evaluar con rigor las limitaciones de esta publicacion concreta: la model card es practicamente una plantilla de cuantizacion, no incluye informacion sobre el entrenamiento, los datos o los benchmarks, y los propios tags declaran solo el idioma ingles pese al nombre "vietnamese".

El modelo cuenta con 20.914.757.184 parametros totales segun los metadatos de safetensors, y el repositorio ocupa 182,4 GB, lo que refleja que contiene multiples variantes GGUF ademas de los pesos originales. La licencia declarada es Apache 2.0. No se dispone de informacion verificada sobre arquitectura interna, contexto, composicion del dataset de ajuste ni evaluaciones de rendimiento en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (hereda la del modelo base GPT-OSS de 20B; no se detalla en la informacion proporcionada) |
| Parametros totales | 20.914.757.184 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS, MXFP4_MOE, x-f16 |
| Idiomas soportados | en (segun los tags del repositorio); el nombre del modelo sugiere vietnamita, pero no esta declarado como idioma soportado |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones) y transformers/safetensors para el modelo base referenciado |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna en la informacion proporcionada. El modelo deriva de `hiudev/gpt-oss-20B-vietnamese`, que a su vez parte de la familia GPT-OSS de 20B de parametros. Los metadatos de cuantizacion incluyen la etiqueta `MXFP4_MOE`, lo que sugiere la presencia de componentes de mezcla de expertos (MoE) y cuantizacion en formato MXFP4 en el checkpoint original, pero no se confirma el numero de expertos, los parametros activos ni la estructura exacta de las capas.

Tampoco hay informacion sobre el proceso de entrenamiento: no se indica el numero de tokens utilizados en el ajuste fino, la composicion del dataset vietnamita, ni si se aplicaron tecnicas de RLHF, DPO o SFT. La model card del repositorio es una plantilla generada por la herramienta de cuantizacion (atribuida a mradermacher) y no incluye ninguna seccion tecnica sobre el modelo original. Cualquier afirmacion sobre innovaciones como decodificacion especulativa, atencion lineal o modos de razonamiento quedaria fuera del alcance de los datos disponibles.

## Capacidades

- Generacion de texto conversacional: el tag `conversational` y la categoria `text-generation-inference` indican uso previsto para dialogos y generacion de texto.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere que el modelo puede servirse a traves de infraestructura compatible con Hugging Face Endpoints.
- Ajuste linguistico al vietnamita: el nombre del modelo y del checkpoint base indican una especializacion en ese idioma, aunque los tags oficiales solo declaran ingles.
- Razonamiento y codigo: no disponible; no se documentan capacidades especificas de razonamiento, matematicas o generacion de codigo en la informacion proporcionada.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multimodales (vision, audio): no disponible.

## Casos de uso

- Despliegue local de un modelo de 20B en hardware de consumo: las cuantizaciones Q4_K_M (15,9 GB) y Q4_K_S (14,8 GB) permiten ejecutar el modelo en GPUs con 16-24 GB de VRAM mediante llama.cpp u Ollama, lo que facilita prototipos sin depender de la nube.
- Procesamiento de texto en vietnamita: dado el origen del ajuste fino, es adecuado para tareas de generacion y resumen de contenido en ese idioma, siempre que se valide empiricamente la calidad, ya que los tags no lo declaran oficialmente.
- Servicios de generacion de texto autoalojados: la compatibilidad con text-generation-inference y endpoints permite montar una API interna de generacion de texto con control total sobre los datos.
- Evaluacion comparativa de cuantizaciones: el repositorio incluye once variantes de cuantizacion, lo que permite medir el impacto de la compresion en perplejidad y calidad para un mismo modelo base.
- Experimentacion academica con modelos de 20B: util para investigadores que necesiten un checkpoint abierto con licencia Apache 2.0 para estudiar tecnicas de cuantizacion o ajuste linguistico.
- Integracion en pipelines de generacion por lotes: con Q8_0 (22,4 GB) se obtiene la maxima calidad de las variantes GGUF para tareas offline donde la latencia no es critica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion:
  - Q2_K / Q3_K_S: aproximadamente 12,2 GB de pesos; con overhead de contexto, en torno a 13-14 GB.
  - IQ4_XS: 12,3 GB de pesos.
  - Q3_K_M: 13,0 GB; Q3_K_L: 13,4 GB.
  - Q4_K_S: 14,8 GB; Q4_K_M: 15,9 GB.
  - Q5_K_S: 16,0 GB; Q5_K_M: 17,0 GB.
  - Q6_K: 22,3 GB; Q8_0: 22,4 GB.
- GPU recomendadas: no disponible en la informacion proporcionada. Por tamano, las cuantizaciones Q4 encajan en GPUs de 24 GB (RTX 3090, RTX 4090, A10G) y las Q8_0 en GPUs de 24 GB con margen ajustado o en A100/H100 para mayor contexto.
- Cabe en GPU de consumo: si, en tarjetas de 16-24 GB con las cuantizaciones Q4 y Q5; las variantes Q6_K y Q8_0 requieren 24 GB o mas.
- Opciones de despliegue: llama.cpp y Ollama para GGUF; text-generation-inference y transformers para el checkpoint original; vLLM no esta confirmado para este formato.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| thquangpc/gpt-oss-20B-vietnamese-GGUF | 20,9B | no disponible | Apache 2.0 | GGUF + safetensors | Cuantizaciones estaticas de un ajuste vietnamita |
| hiudev/gpt-oss-20B-vietnamese | 20,9B (presumible) | no disponible | Apache 2.0 (heredada) | transformers | Modelo base del que deriva esta publicacion |
| mradermacher/gpt-oss-20B-vietnamese-i1-GGUF | 20,9B (presumible) | no disponible | Apache 2.0 | GGUF (imatrix) | Cuantizaciones ponderadas alternativas del mismo base |

No se dispone de datos de rendimiento para establecer una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- La model card no documenta el entrenamiento, los datos ni las evaluaciones del modelo base; no hay garantia verificable sobre la calidad del ajuste vietnamita.
- Los tags oficiales declaran unicamente el idioma ingles, lo que contrasta con el nombre del modelo y genera incertidumbre sobre el soporte real del vietnamita.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; como en cualquier modelo generativo, debe validarse en produccion.
- Sesgos conocidos: no documentados.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar que el modelo base y el ajuste fino mantengan la misma licencia en toda la cadena.
- El repositorio ocupa 182,4 GB por incluir multiples cuantizaciones; descargar solo la variante necesaria para evitar consumo innecesario de almacenamiento.
- No hay informacion sobre limites de contexto ni sobre el comportamiento en conversaciones multi-turno largas.
- La fecha de creacion del repositorio (2026-11-19) y el numero de descargas (0) indican una publicacion muy reciente y sin validacion por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/thquangpc/gpt-oss-20B-vietnamese-GGUF
- Modelo base: https://huggingface.co/hiudev/gpt-oss-20B-vietnamese
- Cuantizaciones imatrix alternativas: https://huggingface.co/mradermacher/gpt-oss-20B-vietnamese-i1-GGUF
- Pagina de descarga del cuantizador: https://hf.tst.eu/model#gpt-oss-20B-vietnamese-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
