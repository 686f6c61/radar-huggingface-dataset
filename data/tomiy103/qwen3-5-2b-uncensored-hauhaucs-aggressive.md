# tomiy103/Qwen3.5-2B-Uncensored-HauhauCS-Aggressive

## Resumen

Qwen3.5-2B-Uncensored-HauhauCS-Aggressive es un ajuste del modelo base Qwen3.5-2B publicado por el usuario tomiy103 (familia de variantes "uncensored" de HauhauCS). Se trata de un modelo denso de 1.881.825.088 parametros, 24 capas y arquitectura hibrida que combina Gated DeltaNet (atencion lineal) con atencion softmax completa en una proporcion 3:1, sobre el que se ha aplicado un proceso de eliminacion de rechazos ("refusals") sin, segun el autor, alterar los datos de entrenamiento ni las capacidades originales.

Su rasgo diferencial es la ausencia declarada de rechazos: el autor afirma "0/465 refusals" en su evaluacion interna, manteniendo el resto del comportamiento del modelo base. Ademas, hereda del base la multimodalidad nativa (texto, imagen y video mediante un codificador de vision separado en formato GGUF) y una ventana de contexto de 262.144 tokens, extensible a 1M con YaRN.

Es relevante ahora porque se apoya en una arquitectura muy reciente (el autor situa el lanzamiento de la arquitectura el 2026-03-02), con soporte en llama.cpp incorporado hace poco, y porque plantea un caso de uso muy concreto: despliegue local en hardware de gama de consumo (desde ~1,2 GB en Q4_K_M) con contexto muy largo y entrada de imagen o video, sin filtros de rechazo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso hibrido: Gated DeltaNet (atencion lineal) + atencion softmax completa, ratio 3:1; 24 capas |
| Parametros totales | 1.881.825.088 (aprox. 1,88 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262K tokens nativos; extensible a 1M con YaRN. Se recomienda mantener al menos 128K para preservar las capacidades de thinking |
| Tipos de cuantizacion | BF16 (3,6 GB), Q8_0 (1,9 GB), Q6_K (1,5 GB), Q4_K_M (1,2 GB); el codificador de vision se distribuye en f16 (mmproj, 638 MB) |
| Idiomas soportados | en, zh, multilingual; el autor declara vocabulario de 248K tokens y 201 idiomas |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (los archivos publicados en el repo); el recuento de parametros indicado en HuggingFace procede de safetensors |

Otros datos de interes: tamano del repositorio 9,3 GB; soporte de multi-token prediction (MTP); funcionalidades declaradas como "endpoints_compatible" y uso conversacional.

## Arquitectura y entrenamiento

La arquitectura es un transformer denso con atencion hibrida: 24 capas que alternan Gated DeltaNet (atencion lineal, mas eficiente en memoria y computo con secuencias largas) y atencion softmax completa en una proporcion 3:1. Esta combinacion es la que permite sostener una ventana nativa de 262K tokens y, con YaRN, llegar a 1M. El modelo incorpora ademas soporte de multi-token prediction (MTP), orientado a acelerar la decodificacion. Es nativamente multimodal: texto, imagen y video, con el codificador de vision entregado como archivo `mmproj` independiente que debe cargarse junto al GGUF principal.

En cuanto al entrenamiento, no se dispone de informacion sobre el volumen de tokens, la composicion del dataset ni las fases de alineacion (RLHF, DPO u otras) del modelo base Qwen3.5-2B: el autor no las detalla. Lo unico documentado sobre el ajuste es que, segun el autor, no se modificaron los datasets ni las capacidades del modelo original, y que el trabajo consistio en la eliminacion de rechazos, con una variante "Aggressive" que aplica un desbloqueo mas agresivo que una futura variante "Balanced" (aun no publicada). El autor describe el resultado como "lossless" en capacidades, afirmacion que no se acompana de mediciones reproducibles en la informacion disponible.

## Capacidades

- Generacion de texto conversacional en modo thinking (activado por defecto) y en modo non-thinking, con parametros de muestreo diferenciados para cada uno.
- Razonamiento multi-paso mediante el modo thinking; el autor advierte que hay que mantener al menos 128K de contexto para no degradar esta capacidad.
- Procesamiento de contexto largo: hasta 262K tokens nativos y 1M con YaRN, adecuado para documentos extensos o conversaciones multi-turno muy largas.
- Multimodalidad nativa: entrada de imagen y video mediante el codificador `mmproj` en f16, cargado junto al modelo principal.
- Multilinguismo: el autor declara 201 idiomas con un vocabulario de 248K tokens; los idiomas etiquetados explicitamente son ingles, chino y "multilingual".
- Multi-token prediction (MTP) para acelerar la decodificacion.
- Ausencia declarada de rechazos: el autor reporta "0/465 refusals" y ausencia total de bloqueos de contenido.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y orquestacion multi-paso con herramientas: no disponible en la informacion proporcionada.
- Capacidades de audio: no disponibles.

## Casos de uso

- Analisis de documentos muy extensos: con 262K tokens de contexto nativo, el modelo puede ingerir informes anuales, expedientes completos o bases de codigo extensas en una sola pasada, sin necesidad de fragmentacion ni de recuperacion externa.
- Atencion al cliente multi-turno: permite mantener historiales de conversacion largos sin perder el hilo; la ventana amplia reduce la perdida de informacion en sesiones prolongadas.
- Procesado de imagen y video en local: al apoyarse en el archivo `mmproj` de 638 MB, puede integrarse en flujos de descripcion de imagenes, transcripcion de contenido visual o extraccion de informacion de capturas y fotogramas sin enviar datos a servicios externos.
- Despliegue en edge o en portatil: la cuantizacion Q4_K_M ocupa 1,2 GB, lo que permite ejecutarlo en GPU de gama de consumo o incluso en CPU con llama.cpp, LM Studio, Jan o koboldcpp.
- Prototipado rapido de razonamiento: el modo thinking por defecto y el coste computacional bajo (1,88 B de parametros) permiten iterar sobre cadenas de razonamiento en pruebas de concepto antes de escalar a modelos mayores de la misma familia (9B, 27B).
- Generacion de contenido sin filtros para investigacion: util en estudios sobre seguridad de modelos, evaluacion de sesgos, red teaming y analisis de comportamiento de modelos desbloqueados, donde los rechazos del modelo base interferirian con la medicion.
- Experimentos de contexto ultralargo con YaRN: escenarios de resumen jerarquico, comparacion de documentos y busqueda semantica sobre corpus de hasta 1M de tokens, verificando en cada caso la degradacion real.
- Traduccion y procesamiento multilingue: con 201 idiomas declarados por el autor, sirve para preprocesado, normalizacion o generacion en idiomas de bajos recursos, siempre que se valide la calidad real por idioma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica estandar, ni comparaciones cuantitativas con el modelo base. El unico dato numerico de evaluacion que aporta el autor es "0/465 refusals", una metrica interna de rechazos que no es comparable con benchmarks de capacidades y que no se acompana de la metodologia de evaluacion.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, segun los archivos publicados): Q4_K_M 1,2 GB; Q6_K 1,5 GB; Q8_0 1,9 GB; BF16 3,6 GB. A estas cifras hay que sumar el codificador de vision (638 MB en f16) si se usan entradas de imagen o video.
- A las cifras anteriores hay que anadir la cache KV, que crece con la longitud de contexto y pasa a ser el factor dominante al acercarse a los 262K tokens. El autor recomienda mantener al menos 128K de contexto; con ese nivel de contexto el consumo total de memoria es notablemente superior al tamano de los pesos.
- GPU de gama de consumo: la cuantizacion Q4_K_M (1,2 GB) entra sin problema en GPUs de 4-8 GB como una RTX 3050, RTX 4060 o RTX 3060, siempre que el contexto se mantenga moderado. Para contexto largo (128K o mas) conviene una GPU de 12-24 GB (RTX 3060 12 GB, RTX 4090, A5000).
- GPU de datacenter: A100, H100 o similares son utiles solo si se busca alto throughput con contexto muy largo o despliegue multiusuario; para una sola peticion el modelo es sobredimensionado para ese hardware.
- Opciones de despliegue: llama.cpp, LM Studio, Jan y koboldcpp para uso local; vLLM, SGLang y KTransformers para produccion y alto rendimiento, segun la recomendacion del autor. El autor advierte de que se trata de una arquitectura muy reciente y de que el soporte en llama.cpp llego hace poco, por lo que hay que usar una build reciente.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.
- Parametros de muestreo recomendados por el autor: modo thinking, temperature 0.6, top_p 0.95, top_k 20, min_p 0; modo non-thinking, temperature 0.7, top_p 0.8, top_k 20, min_p 0.

## Comparativa con modelos similares

Comparativa limitada a los modelos enlazados en la propia model card y al modelo base; no hay datos publicados de rendimiento para ninguno de ellos en la informacion disponible.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-2B-Uncensored-HauhauCS-Aggressive (este modelo) | 1,88 B (denso) | 262K nativo, 1M con YaRN | Sin benchmarks publicados; autor declara 0/465 rechazos | Apache-2.0 | GGUF en HuggingFace |
| Qwen3.5-2B (base) | 2B (denso) | 262K nativo (segun la model card de la variante) | No disponible | No disponible | HuggingFace |
| Qwen3.5-9B-Uncensored-HauhauCS-Aggressive | 9B (segun el nombre) | No disponible | No disponible | No disponible | HuggingFace |
| Qwen3.5-27B-Uncensored-HauhauCS-Aggressive | 27B (segun el nombre) | No disponible | No disponible | No disponible | HuggingFace |

## Limitaciones y advertencias

- Modelo explicitamente desbloqueado: no rechaza peticiones y, segun el autor, ha eliminado los rechazos del modelo base. Esto implica riesgo de generar contenido danino, ilegal o gravemente inapropiado si se usa sin moderacion externa.
- El autor senala que el modelo puede anadir ocasionalmente un aviso breve al final de la respuesta (por ejemplo, "esto es informacion general, no asesoramiento legal"). No es un rechazo: el contenido se genera igualmente. Este comportamiento esta heredado del entrenamiento del modelo base.
- Ausencia total de benchmarks publicados: no hay datos verificables de calidad, razonamiento, codigo o matematicas, ni comparacion medida con el modelo base. La afirmacion de "zero capability loss" no esta respaldada por mediciones reproducibles.
- Riesgo de alucinacion: con 1,88 B de parametros, la capacidad de retener y aplicar conocimiento factual es limitada en comparacion con modelos de mayor tamano; la ventana de contexto larga no elimina este riesgo.
- Idiomas: las etiquetas oficiales son en, zh y multilingual, y el autor declara 201 idiomas. El espanol no aparece etiquetado explicitamente; conviene validar la calidad real en castellano antes de usarlo en produccion.
- Contexto: por debajo de 128K tokens el autor advierte de perdida de capacidades de razonamiento. Ademas, la extension a 1M con YaRN suele implicar degradacion de calidad y requiere validacion empirica.
- Compatibilidad: arquitectura muy reciente (lanzamiento el 2026-03-02, segun el autor) con soporte en llama.cpp incorporado hace poco. Se necesita una build reciente; versiones antiguas pueden fallar o no reconocer el modelo.
- Multimodalidad: para usar imagen o video es obligatorio cargar tambien el archivo `mmproj`; cargar solo el GGUF principal deja el modelo en modo texto.
- Licencia Apache-2.0: permite uso comercial y modificacion, pero la responsabilidad legal por el contenido generado recae en el desplegador. La licencia permisiva no exime de cumplir la normativa aplicable sobre contenido.
- Madurez del repositorio: 0 descargas y 0 likes en el momento de la consulta, creado y actualizado con menos de un segundo de diferencia, sin historial de revisiones ni validacion por parte de la comunidad. Procede de un usuario individual, no del equipo de Qwen.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tomiy103/Qwen3.5-2B-Uncensored-HauhauCS-Aggressive
- Modelo base Qwen3.5-2B: https://huggingface.co/Qwen/Qwen3.5-2B
- Variante 9B de la misma familia: https://huggingface.co/HauhauCS/Qwen3.5-9B-Uncensored-HauhauCS-Aggressive
- Variante 27B de la misma familia: https://huggingface.co/HauhauCS/Qwen3.5-27B-Uncensored-HauhauCS-Aggressive
- Perfil del autor de la familia: https://huggingface.co/HauhauCS
- Discord del autor: https://discord.gg/SZ5vacTXYf
