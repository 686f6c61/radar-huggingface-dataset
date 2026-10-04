# Unshifts/gemma-4-12B-it-nvfp4

## Resumen

Unshifts/gemma-4-12B-it-nvfp4 es una publicacion de pesos en HuggingFace que, por su identificador, corresponde a una version cuantizada en formato NVFP4 del modelo instructivo google/gemma-4-12B-it. El autor es el usuario "Unshifts" y el repositorio se creo el 4 de octubre de 2026, con cero descargas y cero "likes" en el momento de la consulta. La model card publicada se limita a la linea `license: gemma`, por lo que no incluye detalles de arquitectura, datos de entrenamiento ni procesos de cuantizacion.

Gemma 4 12B es, segun fuentes publicas de Google, un modelo denso de tamano medio dentro de la familia Gemma 4, situado por encima de las variantes orientadas a borde E2B y E4B, y disenado para tareas que requieren un razonamiento mas solido manteniendo la posibilidad de ejecutarse en un unico acelerador. Google presenta la familia como multimodal, con capacidades de vision ademas de texto.

El interes de esta variante concreta radica en el formato NVFP4: una cuantizacion de 4 bits que cuantiza tanto pesos como activaciones y que esta orientada a la inferencia eficiente sobre arquitecturas Blackwell mediante vLLM, lo que reduce de forma notable los requisitos de memoria frente al checkpoint original. No obstante, al no existir documentacion tecnica en el repositorio de Unshifts, los datos de esta ficha proceden de la informacion publica sobre el modelo base y sobre cuantizaciones NVFP4 equivalentes, y se senalan como tales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en la model card; el modelo base de la familia Gemma 4 12B se describe como transformer denso multimodal (texto e imagen) |
| Parametros totales | 12B nominales segun el nombre del repositorio (no confirmado en la model card) |
| Parametros activos | no aplica (el modelo base se describe como denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (4 bits) en pesos y activaciones, segun el formato indicado en el nombre y en las cuantizaciones NVFP4 equivalentes del modelo base |
| Idiomas soportados | no disponible |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | no disponible; el sufijo nvfp4 apunta a un checkpoint para vLLM con pesos y activaciones en NVFP4 |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura ni sobre el proceso de entrenamiento especifico de esta publicacion. La model card del repositorio de Unshifts contiene unicamente la declaracion de licencia, sin descripcion de la red, del dataset, del numero de tokens vistos ni de las etapas de ajuste (SFT, RLHF o DPO). Cualquier afirmacion al respecto seria especulativa.

Lo que si se puede afirmar con base en fuentes publicas es que el modelo de referencia, google/gemma-4-12B, pertenece a la familia Gemma 4 de Google DeepMind y se describe como un modelo denso de gama media con capacidades multimodales (procesamiento de imagen y texto) y con protocolos de seguridad heredados de los modelos propietarios de Google. En cuanto al formato, NVFP4 es una representacion de 4 bits con bloque de escala que cuantiza pesos y activaciones; segun la documentacion asociada a checkpoints equivalentes, la conversion se realiza con herramientas del ecosistema vLLM (llm-compressor) y esta pensada para inferencia de bajo coste en Blackwell.

## Capacidades

- Generacion de texto en modo instructivo (sufijo -it del identificador).
- Razonamiento de proposito general y respuesta a instrucciones, segun la posicion del modelo en la gama Gemma 4 12B.
- Procesamiento multimodal de entrada: las fuentes de Google describen la familia Gemma 4 como multimodal, con soporte de vision ademas de texto.
- Inferencia cuantizada en 4 bits con pesos y activaciones en NVFP4, lo que habilita despliegue en GPUs Blackwell y en plataformas como Jetson Thor.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; no se enumeran idiomas ni en la ficha de Unshifts ni en los extractos recuperados.
- Modo "thinking" explicito, vision detallada u otras capacidades especiales: no disponible.

## Casos de uso

- Despliegue de un asistente local en estaciones de trabajo con GPU Blackwell: la cuantizacion NVFP4 reduce la huella de memoria del modelo de 12B, lo que permite mantener el modelo residente en VRAM y atender peticiones interactivas sin depender de servicios en la nube.
- Inferencia de alto rendimiento con vLLM: el formato NVFP4 esta integrado en el ecosistema vLLM, de modo que este checkpoint encaja en despliegues con batching continuo y servidor compatible con la API de OpenAI.
- Robotica y computacion de borde sobre NVIDIA Jetson Thor: la documentacion de Jetson AI Lab menciona explicitamente el checkpoint NVFP4 de Gemma 4 12B para vLLM sobre Thor, lo que lo hace candidato para asistentes embebidos en robots o dispositivos autonomos con conectividad limitada.
- Analisis de documentos con componente visual: al proceder de un modelo multimodal, puede emplearse para extraer informacion de capturas, diagramas o documentos escaneados en pipelines internos, siempre que se valide la calidad de la cuantizacion sobre tareas de vision.
- Prototipado e investigacion sobre cuantizacion de 4 bits: el repositorio sirve como punto de partida para medir el impacto de NVFP4 en calidad frente al checkpoint en precision completa, comparando salidas en tareas controladas.
- Procesamiento por lotes de texto en servidores con VRAM limitada: la reduccion de memoria derivada de NVFP4 permite aumentar el tamano de lote o el numero de replicas por GPU en tareas de clasificacion, resumen o extraccion de entidades.
- Entornos con requisitos de residencia de datos: al ejecutarse en infraestructura propia bajo licencia Gemma, puede utilizarse en casos donde el texto no puede salir de la organizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio de Unshifts no incluye tabla de evaluacion alguna y no se dispone de cifras de MMLU, HumanEval, GSM8K ni de tareas multimodales para esta publicacion concreta. Tampoco se han recuperado resultados comparativos publicados para el checkpoint NVFP4 del modelo base. No se incluyen numeros estimados para evitar afirmaciones no verificables.

## Requisitos de hardware

- VRAM estimada: no disponible como dato oficial. Como referencia aritmetica, 12.000 millones de parametros en 4 bits suponen unos 6 GB solo de pesos, a los que hay que sumar cache KV, activaciones y sobrecarga del runtime; en la practica se suele necesitar mas memoria que el peso teorico del modelo.
- GPU compatibles con NVFP4 nativo: arquitecturas Blackwell, es decir, las menciones publicas apuntan a vLLM sobre NVIDIA Jetson Thor y a GPUs de generacion Blackwell.
- GPU Hopper (H100, H200) y Ampere (A100): compatibilidad con NVFP4 no confirmada en la informacion disponible; el formato esta orientado a Blackwell, por lo que en generaciones anteriores puede requerir emulacion o no estar soportado.
- GPU de consumo: no confirmado para este checkpoint. El modelo base de 12B en precision completa no cabe comodamente en GPUs de 8-12 GB; la version NVFP4 reduce el peso teorico a unos 6 GB, lo que la situaria en el rango de tarjetas de 16 GB o superiores con la correspondiente generacion de arquitectura.
- Opciones de despliegue: vLLM para el checkpoint NVFP4; para el modelo base, las fuentes mencionan tambien un GGUF Q4_0 con entrenamiento consciente de cuantizacion para llama.cpp en Thor y AGX Orin, si bien ese artefacto corresponde a Google y no a esta publicacion.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Unshifts/gemma-4-12B-it-nvfp4 | 12B nominales (no confirmado) | NVFP4 | no disponible | gemma | repositorio publico, 0 descargas, sin model card tecnica |
| google/gemma-4-12B | 12B (gama media densa) | precision completa | no disponible | gemma | repositorio oficial de Google |
| google/gemma-4-12B-it | 12B (gama media densa) | precision completa | no disponible | gemma | repositorio oficial de Google, variante instructiva |
| RedHatAI/gemma-4-12B-it-NVFP4 | 12B | NVFP4 (pesos y activaciones, via llm-compressor) | no disponible | gemma | version preliminar sujeta a cambios |
| Gemma 4 12B Q4_0 GGUF (Google) | 12B | Q4_0 con entrenamiento consciente de cuantizacion | no disponible | gemma | distribuido por Google para llama.cpp |

Comparativa de rendimiento: no disponible. No se han recuperado cifras que permitan contrastar la calidad de la cuantizacion de Unshifts frente a las alternativas de Red Hat o de Google.

## Limitaciones y advertencias

- Ausencia total de documentacion: la model card solo declara la licencia. No hay informacion sobre el proceso de cuantizacion, la calibracion, la perdida de calidad ni los datos de entrenamiento, lo que dificulta la reproducibilidad.
- Procedencia no verificada: no se puede confirmar que los pesos deriven del checkpoint instructivo oficial google/gemma-4-12B-it ni que la conversion a NVFP4 se haya realizado con una herramienta estandar.
- Estado del repositorio: cero descargas y cero "likes", sin actualizaciones registradas. No hay evidencia de uso en produccion ni de validacion por terceros.
- Riesgo de degradacion por cuantizacion: la cuantizacion de pesos y activaciones a 4 bits puede reducir la precision en tareas sensibles, especialmente en razonamiento de varios pasos, matematicas y comprension de imagenes. No se han publicado evaluaciones que cuantifiquen esta perdida.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; la cuantizacion agresiva puede acentuarlo. No hay datos especificos para esta variante.
- Limitaciones de contexto e idioma: se desconocen la ventana de contexto real y la cobertura idiomatica; no conviene asumir el comportamiento multilingue del modelo base sin validacion previa.
- Restricciones de licencia: la licencia Gemma impone condiciones de uso, obligaciones de atribucion y una politica de uso prohibido. El uso comercial esta permitido bajo los terminos de dicha licencia, pero debe revisarse antes de cualquier despliegue en produccion.
- Dependencia de hardware: NVFP4 esta orientado a GPU Blackwell; en otras arquitecturas el checkpoint puede no ser utilizable, lo que limita su portabilidad.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Unshifts/gemma-4-12B-it-nvfp4
- Modelo base en HuggingFace: https://huggingface.co/google/gemma-4-12B
- Cuantizacion NVFP4 equivalente de Red Hat: https://huggingface.co/RedHatAI/gemma-4-12B-it-NVFP4
- Ficha de Gemma 4 12B en Jetson AI Lab: https://www.jetson-ai-lab.com/models/gemma4-12b/
- Anuncio de Gemma 4 12B en el blog de Google: https://blog.google/innovation-and-ai/technology/developers-tools/introducing-gemma-4-12B/
- Pagina de la familia Gemma 4 en Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
