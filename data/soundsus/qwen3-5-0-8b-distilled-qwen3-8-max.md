# Soundsus/Qwen3.5-0.8B-Distilled-Qwen3.8-Max

## Resumen

El modelo Soundsus/Qwen3.5-0.8B-Distilled-Qwen3.8-Max es un modelo de lenguaje multimodal (vision-language) de 772 millones de parametros, desarrollado por Soundsus mediante destilacion del modelo Qwen3.8-Max sobre la base Qwen3.5-0.8B. El resultado es un modelo compacto que transfiere capacidades de un modelo de gran tamano a un formato ligero, apto para despliegue en entornos con recursos limitados.

El modelo se distribuye exclusivamente en formato GGUF, convertido con la herramienta Unsloth, lo que permite su ejecucion directa con llama.cpp y motores compatibles. Incluye un proyector multimodal (archivo BF16-mmproj.gguf) para el procesamiento de imagenes, lo que lo convierte en una opcion interesante para tareas de vision-language en dispositivos de borde.

Su relevancia radica en la combinacion de un tamano reducido (0,8B) con capacidades multimodales y una arquitectura hibrida que mezcla atencion lineal con transformers tradicionales, caracteristica de la familia Qwen3.5. Esto lo posiciona como una alternativa viable para inferencia local en hardware de consumo, aunque su escasa validacion comunitaria (0 descargas, 0 likes) exige precaucion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida (atencion lineal + transformers) |
| Parametros totales | 772.845.888 (~0,77B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K_L, Q3_K_M, Q4_K_M, Q5_K_M, Q6_K, Q8_0, BF16 |
| Idiomas soportados | No disponible |
| Licencia | No disponible (la familia Qwen3.5 se publica bajo Apache 2.0) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura hibrida de la familia Qwen3.5, que combina atencion lineal con mecanismos de atencion tradicionales tipo transformer. Esta combinacion reduce el coste computacional en secuencias largas manteniendo la calidad de representacion. El modelo es multimodal, con capacidad para procesar texto e imagenes, e incluye un proyector multimodal para la integracion de caracteristicas visuales.

El entrenamiento se realizo mediante destilacion del modelo Qwen3.8-Max sobre la base Qwen3.5-0.8B, un proceso que transfiere el conocimiento de un modelo de gran tamano a uno mucho mas pequeno. La conversion a formato GGUF se llevo a cabo con la libreria Unsloth, que optimiza el proceso de cuantizacion y conversion. No se dispone de informacion detallada sobre el dataset de entrenamiento, el numero de tokens utilizados ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Generacion de texto y conversacion multi-turno (etiqueta "conversational").
- Comprension de imagenes (vision-language), gracias al proyector multimodal incluido.
- Razonamiento basico y respuesta a instrucciones, heredado de la destilacion de Qwen3.8-Max.
- Compatible con llama.cpp y motores de inferencia que soporten formato GGUF.
- Soporte de plantillas de chat mediante Jinja (opcion --jinja en llama.cpp).
- Compatible con endpoints de inferencia (etiqueta "endpoints_compatible").
- Capacidades multilingues: no disponibles (no se especifican idiomas soportados).

## Casos de uso

- Asistente conversacional en dispositivos de borde: con solo 0,77B de parametros, el modelo puede ejecutarse en smartphones, Raspberry Pi o routers con aceleracion NPU, ofreciendo respuestas conversacionales sin conexion a internet.
- Analisis de imagenes en entornos con recursos limitados: gracias a su capacidad vision-language, puede clasificar o describir imagenes en sistemas embebidos de vision artificial, como camaras de seguridad o dispositivos IoT.
- Prototipado rapido de aplicaciones multimodales: los desarrolladores pueden usar el modelo con llama.cpp para validar ideas de productos que combinen texto e imagen antes de escalar a modelos mayores.
- Filtrado y moderacion de contenido visual: el modelo puede analizar imagenes y generar descripciones textuales que alimenten sistemas de moderacion automatizada en plataformas de contenido generado por usuarios.
- Educacion y aprendizaje automatico: su tamano reducido permite ejecutarlo en portatiles sin GPU dedicada, lo que lo hace util para ensenar conceptos de vision-language y destilacion de modelos en cursos universitarios.
- Asistencia a personas con discapacidad visual: el modelo puede describir el contenido de fotografias tomadas con un telefono movil, funcionando como un lector de imagenes accesible y sin coste de API.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,5 GB en BF16 y menos de 0,5 GB en cuantizacion Q4_K_M.
- GPU recomendadas: cualquier GPU con 2 GB o mas de VRAM (GTX 1650, RTX 3050, etc.). Tambien puede ejecutarse en CPU con llama.cpp.
- Compatible con hardware de consumo: si, cabe en cualquier GPU consumer actual e incluso en CPU sin aceleracion grafica.
- Opciones de despliegue: llama.cpp (llama-cli y llama-mtmd-cli), Ollama, y cualquier motor compatible con GGUF.
- Latencia y throughput: no disponibles; por su tamano se estima una latencia inferior a 100 ms por token en GPU moderna y de 1 a 2 segundos por token en CPU, aunque estos valores no estan confirmados por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.5-0.8B (base) | 0,8B | No disponible | Si | Apache 2.0 | Original |
| Soundsus/Qwen3.5-0.8B-Distilled-Qwen3.8-Max | 0,77B | No disponible | Si | No disponible | GGUF |
| Qwen3.5-397B | 397B | No disponible | Si | Apache 2.0 | Original |

La comparativa se limita a la familia Qwen3.5, ya que no se dispone de datos suficientes sobre otros modelos comparables en el mismo rango de tamano con capacidades multimodales.

## Limitaciones y advertencias

- No se dispone de informacion sobre sesgos especificos del modelo, aunque al ser una destilacion de Qwen3.8-Max podria heredar sesgos del modelo original.
- Riesgo de alucinacion: no se han publicado evaluaciones especificas; como modelo de 0,8B, es probable que presente tasas de alucinacion superiores a modelos de mayor tamano.
- Limitaciones de contexto: la longitud de contexto no se ha especificado, por lo que se recomienda precaucion con secuencias largas.
- Idiomas soportados: no especificados; el rendimiento en idiomas distintos del ingles no esta garantizado.
- Licencia: no se indica en la model card; aunque la familia Qwen3.5 se publica bajo Apache 2.0, este modelo derivado no declara su licencia, lo que genera incertidumbre legal para uso comercial.
- El modelo tiene 0 descargas y 0 likes en HuggingFace, lo que indica que no ha sido validado por la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Soundsus/Qwen3.5-0.8B-Distilled-Qwen3.8-Max
- Modelo base Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Documentacion de Qwen3.5 en Transformers: https://huggingface.co/docs/transformers/model_doc/qwen3_5
- Repositorio Qwen3.8 en GitHub: https://github.com/QwenLM/Qwen3.8
- Guia de Qwen3.5: https://qwen-ai.com/qwen-3-5/
- Pagina de Qwen3.5 en Ollama: https://ollama.com/library/qwen3.5:0.8b
