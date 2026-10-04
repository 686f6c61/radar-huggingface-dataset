# warped-community/Llama-3.2-1B-litert-lm

## Resumen

Llama-3.2-1B-litert-lm es un espejo (mirror) del modelo Llama-3.2-1B-Instruct de Meta convertido al formato LiteRT-LM para inferencia en dispositivos Android. Lo publica la organizacion warped-community, responsable del mantenimiento de la aplicacion Warped para Android, y su unico proposito declarado es servir como artefacto listo para movil dentro de ese proyecto. Procede del repositorio litert-community/Llama-3.2-1B, en concreto del fichero `llama3_2_1b_mixed_int4_gpu.litertlm`.

Se trata, por tanto, de una redistribucion de pesos ya cuantizados, no de un modelo entrenado o ajustado de nuevo: el `base_model` declarado es meta-llama/Llama-3.2-1B-Instruct. El interes practico esta en el empaquetado, no en el modelo en si. Llama 3.2 1B es un transformer decoder-only de 1.240 millones de parametros con atencion de consultas agrupadas (GQA) y una ventana de contexto de hasta 128.000 tokens en su version original, disenado por Meta para tareas de resumen, extraccion y seguimiento de instrucciones en el borde.

La relevancia de este repositorio es acotada: permite descargar un artefacto `.litertlm` ya listo para ejecutarse con LiteRT-LM (el runtime de Google AI Edge, sucesor de TensorFlow Lite) en GPU de movil, sin necesidad de convertir pesos. Su licencia es la Llama 3.2 Community License, y el repositorio no registra descargas ni interacciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con GQA (heredada de Llama 3.2 1B Instruct) |
| Parametros totales | 1.240 millones (modelo base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128.000 tokens en el modelo base; la ventana efectiva bajo LiteRT-LM no disponible |
| Tipos de cuantizacion | int4 mixta (fichero `llama3_2_1b_mixed_int4_gpu.litertlm`), orientada a delegado GPU |
| Idiomas soportados | no disponible en la ficha del mirror; el modelo base declara ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes |
| Licencia | llama3.2 (Llama 3.2 Community License) |
| Formato de pesos | `.litertlm` (LiteRT-LM / Google AI Edge) |

## Arquitectura y entrenamiento

El repositorio no describe ningun proceso de entrenamiento propio. Se limita a redistribuir un artefacto ya convertido: el fichero `llama3_2_1b_mixed_int4_gpu.litertlm` del repositorio litert-community/Llama-3.2-1B, cuyo origen ultimo es meta-llama/Llama-3.2-1B-Instruct. Por tanto, la arquitectura es la de Llama 3.2 1B: un transformer decoder-only con normalizacion RMSNorm, activacion SwiGLU, RoPE y atencion de consultas agrupadas (32 cabezas de consulta frente a 8 de clave/valor en el modelo de 1B), con un vocabulario de 128.256 entradas.

Sobre el entrenamiento del modelo base, la informacion publica de Meta indica un preentrenamiento con hasta 9 billones de tokens con un corte de conocimiento en diciembre de 2023, seguido de ajuste supervisado y optimizacion por preferencias (RLHF/DPO) en la variante Instruct. La innovacion tecnica relevante aqui no es de modelado sino de despliegue: el formato LiteRT-LM y la cuantizacion int4 mixta permiten ejecutar el modelo con delegacion a GPU en telefonos Android, reduciendo el peso en disco y el consumo de memoria frente a pesos en float16. No se detalla en la ficha que subconjunto de capas queda en int4 y cual en mayor precision.

## Capacidades

- Generacion de texto y seguimiento de instrucciones conversacionales, heredadas del ajuste Instruct del modelo base.
- Razonamiento basico, resumen de documentos y extraccion de informacion estructurada.
- Generacion y explicacion de codigo en tareas sencillas, limitada por el tamano de 1B parametros.
- Operaciones aritmeticas y de sentido comun de baja complejidad; no es fiable en matematicas de varios pasos.
- Soporte de conversaciones multi-turno, sujeto a la ventana de contexto que imponga el runtime LiteRT-LM.
- Capacidad multilingue parcial (el modelo base declara ocho idiomas), aunque la ficha del mirror no confirma el conjunto soportado.
- Tool calling y function calling: no disponible en la informacion proporcionada; Llama 3.2 Instruct de 1B si declara soporte de llamada a herramientas en su model card original, pero este mirror no lo verifica.
- Modo de razonamiento explicito (thinking), vision o audio: no disponible; no forman parte de este artefacto.

## Casos de uso

- Asistente offline integrado en aplicacion Android: el artefacto `.litertlm` se carga directamente con el runtime LiteRT-LM y funciona sin conexion, lo que encaja en escenarios de privacidad estricta donde los datos no deben salir del dispositivo.
- Autocompletado y reescritura de texto en teclados o editores moviles: la latencia de un modelo de 1B cuantizado a int4 sobre GPU de telefono permite sugerencias en tiempo casi interactivo.
- Clasificacion y etiquetado de texto en el dispositivo: categorizar correos, notas o mensajes entrantes sin enviar contenido a un servidor.
- Resumen de notas y transcripciones cortas: adecuado para fragmentos de hasta unos pocos miles de tokens, no para documentos largos si el runtime recorta la ventana.
- Extraccion de campos estructurados (fechas, importes, nombres) de texto libre en aplicaciones de finanzas personales o gestion de gastos.
- Generacion de respuestas de codigo simples en herramientas de desarrollo moviles, como sugerencias de fragmentos o explicaciones de una linea.
- Prototipado rapido de funciones de IA en Android dentro del ecosistema Google AI Edge, usando este repositorio como sustituto directo del original de litert-community.
- Base para experimentos de destilacion o evaluacion comparativa de cuantizacion int4 en GPU movil.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del mirror no incluye tablas de evaluacion, y los resultados publicos de Llama 3.2 1B Instruct corresponden al modelo sin cuantizar, por lo que no son extrapolables al artefacto int4 de este repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 0,6 a 1,0 GB para el fichero int4, mas el espacio de trabajo del runtime (valores orientativos; no confirmados en la ficha).
- GPU de movil: delegado GPU de LiteRT sobre Adreno (Qualcomm Snapdragon 8 Gen 1 o superior) y Mali (Dimensity y Exynos recientes). El nombre del fichero indica que esta optimizado para GPU, no para CPU ni NPU.
- Memoria del dispositivo: se recomienda un telefono con 6 GB de RAM o mas para dejar margen al runtime y al resto de la aplicacion.
- GPU de escritorio: cualquier tarjeta con 4 GB de VRAM o mas puede alojar la version int4, aunque LiteRT-LM esta pensado para Android.
- Cabe en GPU de consumo: si, en RTX 3050/4060 y superiores, y en practicamente cualquier iGPU moderna con memoria compartida suficiente.
- Opciones de despliegue: LiteRT-LM (Google AI Edge), MediaPipe LLM Inference API y la aplicacion AI Edge Gallery. No es directamente compatible con vLLM, TGI, llama.cpp ni Ollama; para esos motores habria que partir del modelo base y convertir a GGUF.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia |
|---|---|---|---|---|
| warped-community/Llama-3.2-1B-litert-lm | 1,24 B | 128.000 tokens (base) | `.litertlm` / LiteRT-LM | Llama 3.2 Community |
| meta-llama/Llama-3.2-1B-Instruct | 1,24 B | 128.000 tokens | safetensors / transformers | Llama 3.2 Community |
| Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 tokens | safetensors, GGUF | Apache 2.0 |
| Gemma 2 2B Instruct | 2,6 B | 8.192 tokens | safetensors, GGUF, LiteRT | Gemma Terms of Use |

El principal competidor en el mismo nicho de despliegue movil es Gemma 2 2B en su version LiteRT, que ofrece mayor capacidad a cambio de mas memoria y de una licencia menos permisiva. Qwen2.5-1.5B-Instruct compite en calidad multilingue y licencia Apache 2.0, pero no dispone de un artefacto LiteRT-LM equivalente a este. No se dispone de datos de rendimiento comparativos entre estos modelos en el contexto de este repositorio.

## Limitaciones y advertencias

- Modelo de 1B parametros: la tasa de alucinacion en tareas de conocimiento factual es alta y el razonamiento multi-paso es fragil.
- La cuantizacion int4 introduce degradacion adicional respecto al modelo en float16; no se documenta el nivel exacto de perdida.
- La ventana de contexto efectiva bajo LiteRT-LM puede ser muy inferior a los 128.000 tokens del modelo base; conviene verificarla antes de usarlo en produccion.
- El mirror no documenta idiomas soportados ni comportamiento multilingue verificado.
- Licencia Llama 3.2 Community: permite uso comercial con condiciones, exige incluir el aviso de licencia, impone la clausula de "Built with Llama" en determinados casos y restringe el uso por parte de entidades con mas de 700 millones de usuarios mensuales.
- Repositorio con cero descargas y cero interacciones: sin senales de validacion por parte de la comunidad, sin historial de versiones y actualizado por ultima vez el mismo dia de su creacion.
- Es un artefacto de redistribucion: no hay garantia de mantenimiento, soporte ni actualizaciones por parte de warped-community.
- Al ser un formato binario propietario del ecosistema Google AI Edge, la portabilidad a otros motores de inferencia es limitada.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/warped-community/Llama-3.2-1B-litert-lm
- Modelo fuente: https://huggingface.co/litert-community/Llama-3.2-1B
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct
- I Ran Local LLMs on My Android Phone (It's FOSS): https://itsfoss.com/android-on-device-ai/
- Awesome Open Source AI: https://awesomeosai.com/
- Aretebase, herramientas de IA en el dispositivo: https://aretebase.com/tools
- Hands-On LLM Serving and Optimization (referencia sobre despliegue de LLM): https://dokumen.pub/hands-on-llm-serving-and-optimization-hosting-llms-at-scale-1.html
