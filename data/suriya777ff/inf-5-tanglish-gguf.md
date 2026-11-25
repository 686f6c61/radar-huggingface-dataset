# Suriya777ff/INF-5-Tanglish-GGUF

## Resumen

INF-5 es un modelo de lenguaje conversacional publicado por el usuario Suriya777ff en Hugging Face bajo la identidad de Infinite Tech. Se distribuye unicamente en formato GGUF y esta disenado para inferencia en dispositivo (on-device), presumiblemente para integrarse en la aplicacion movil de Infinite Tech. El nombre "Tanglish" sugiere un enfoque en conversaciones que mezclan tamil e ingles, un registro muy comun en el sur de la India y en comunidades de la diaspora.

El modelo cuenta con aproximadamente 1.720 millones de parametros (1,72 B) segun los metadatos de pesos en formato safetensors, lo que lo situa en la categoria de modelos pequenos optimizados para ejecucion local en hardware modesto. El repositorio ocupa 4,8 GB, coherente con una o varias cuantizaciones GGUF de un modelo de ese tamano. La model card es extremadamente escueta y no documenta arquitectura, datos de entrenamiento, contexto ni idiomas de forma explicita.

La relevancia de este modelo es limitada fuera del ecosistema de su autor: la licencia "infinite-tech-use-only" restringe el uso a la aplicacion propietaria de Infinite Tech y prohibe explicitamente cualquier otro uso, redistribucion o trabajo derivado. Para desarrolladores e investigadores externos, su interes es principalmente como referencia de un modelo pequeno multilingue (tamil-ingles) orientado a movil, no como base para proyectos propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (probable transformer decoder-only, no confirmado) |
| Parametros totales | 1.720.574.976 (aprox. 1,72 B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (cuantizaciones concretas no especificadas) |
| Idiomas soportados | no disponible (el nombre sugiere tamil e ingles) |
| Licencia | infinite-tech-use-only (propietaria, uso restringido) |
| Formato de pesos | GGUF (repo de 4,8 GB); metadatos de parametros en safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion publica sobre la arquitectura interna del modelo. Por el numero de parametros (1,72 B) y el formato de distribucion (GGUF para inferencia on-device), es razonable inferir un transformer decoder-only de escala pequena, pero el autor no lo confirma. Tampoco se documentan el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF, DPO o SFT.

La unica informacion tecnica disponible proviene de los metadatos del repositorio: tags "gguf", "conversational", "endpoints_compatible" y "region:us". El tag "endpoints_compatible" indica que el modelo puede servirse a traves de la infraestructura de inferencia de Hugging Face (Inference Endpoints), y "conversational" sugiere un ajuste para dialogos multi-turno. No hay publicaciones, papers ni blogs tecnicos asociados.

## Capacidades

- Generacion de texto conversacional: el tag "conversational" indica un ajuste para dialogos, aunque no se detallan capacidades especificas.
- Multilingue tamil-ingles (Tanglish): inferido del nombre del modelo, no confirmado en la model card.
- Inferencia on-device: el formato GGUF y el tamano de 1,72 B estan pensados para ejecucion local en dispositivos con recursos limitados.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo thinking, vision o audio: no disponible.
- Compatibilidad con Inference Endpoints de Hugging Face (tag "endpoints_compatible").

## Casos de uso

- Asistente conversacional integrado en la app de Infinite Tech: el modelo esta publicado explicitamente para que la aplicacion propietaria lo descargue y lo ejecute en los dispositivos de sus usuarios; su tamano de 1,72 B y formato GGUF lo hacen viable en moviles de gama media.
- Chat en tamil-ingles (Tanglish) en entornos con conectividad limitada: al ejecutarse localmente, no requiere conexion a un servidor, lo que resulta util en regiones con redes intermitentes donde el registro Tanglish es habitual.
- Prototipado de asistentes multilingues en dispositivos de borde: investigadores pueden estudiar el comportamiento de un modelo pequeno entrenado para mezcla de idiomas, siempre que respeten las restricciones de licencia (lo que en la practica limita este uso).
- Evaluacion de tecnicas de cuantizacion GGUF: el repositorio sirve como caso de estudio de como se distribuye un modelo de 1,72 B en 4,8 GB de cuantizaciones para inferencia local.
- Despliegue mediante Inference Endpoints: el tag "endpoints_compatible" permite servirlo desde la infraestructura gestionada de Hugging Face para pruebas de integracion.
- Integracion en pipelines de CI para validar compatibilidad GGUF: util para verificar que runtimes como llama.cpp o Ollama cargan correctamente el modelo antes de empaquetarlo en una aplicacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: para 1,72 B de parametros, una cuantizacion Q4_K_M ocuparia aproximadamente 1,0-1,2 GB; Q8_0 en torno a 1,8-2,0 GB; FP16 alrededor de 3,4 GB. Estas cifras son estimaciones por tamano de parametros, no datos publicados por el autor.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM puede ejecutar las cuantizaciones mas agresivas; para FP16 se recomienda 6-8 GB.
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060 (12 GB), RTX 4060 (8 GB), RTX 4090 (24 GB) y en GPUs integradas de portatiles con 8 GB de memoria unificada.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y, gracias al tag "endpoints_compatible", Inference Endpoints de Hugging Face. vLLM y TGI no estan confirmados para este repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| INF-5 (Tanglish) | 1,72 B | no disponible | infinite-tech-use-only (propietaria) | GGUF en HF, uso restringido |
| Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 tokens | Apache 2.0 | safetensors y GGUF, uso comercial |
| Llama 3.2 1B Instruct | 1,24 B | 131.072 tokens | Llama 3.2 Community License | safetensors y GGUF, uso comercial con condiciones |
| Gemma 2 2B IT | 2,6 B | 8.192 tokens | Gemma Terms of Use | safetensors y GGUF, uso comercial con condiciones |

La comparativa se limita a parametros, contexto y licencia porque no hay benchmarks publicados de INF-5. Frente a las alternativas, la diferencia clave es la licencia: los tres modelos de referencia permiten uso comercial (con condiciones en Llama y Gemma), mientras que INF-5 lo prohibe fuera de la aplicacion de Infinite Tech. En cobertura de idiomas, solo INF-5 esta orientado explicitamente a Tanglish, aunque sin documentacion que lo respalde.

## Limitaciones y advertencias

- Licencia extremadamente restrictiva: "infinite-tech-use-only" prohibe cualquier uso, redistribucion o trabajo derivado fuera de la aplicacion de Infinite Tech. No es apta para uso comercial, investigacion publicada ni proyectos personales sin autorizacion expresa.
- Ausencia total de documentacion tecnica: no se publican arquitectura, datos de entrenamiento, contexto, idiomas ni procesos de alineacion, lo que impide evaluar su calidad o reproducibilidad.
- Riesgo de alucinacion: no cuantificado; al no haber benchmarks, no puede estimarse su fiabilidad en tareas factuales.
- Sesgos desconocidos: sin informacion sobre la composicion del dataset, no es posible evaluar sesgos de genero, religion, caste o politicos, especialmente relevantes en un modelo orientado a tamil e ingles.
- Limitaciones de contexto e idioma: se desconoce la ventana de contexto y si el modelo maneja otros idiomas ademas de tamil e ingles.
- Sin soporte comunitario: cero likes y 310 descargas indican una adopcion minima; no hay issues, discusiones ni ejemplos de uso publicos.
- Fecha de creacion futura en los metadatos (2026-11-03), lo que sugiere que el repositorio puede haber sido creado con fines de prueba o que los metadatos no son fiables.

## Enlaces

- Hugging Face: https://huggingface.co/Suriya777ff/INF-5-Tanglish-GGUF
- Licencia: referenciada como LICENSE en el repositorio (no se ha podido verificar su contenido)
- No se han encontrado papers, blogs, repositorios de codigo ni demos adicionales en la informacion disponible.
