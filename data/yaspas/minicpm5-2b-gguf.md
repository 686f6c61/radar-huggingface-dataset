# Yaspas/MiniCPM5-2B-GGUF

## Resumen

MiniCPM5-2B es un modelo de lenguaje denso de 2B parámetros desarrollado por OpenBMB (ModelBest) dentro de la serie MiniCPM5, y esta ficha corresponde a la conversión a GGUF publicada por el usuario Yaspas bajo el identificador Yaspas/MiniCPM5-2B-GGUF. Se trata del segundo modelo de la familia, tras MiniCPM5-1B, y reutiliza la misma receta de entrenamiento escalada, con el objetivo declarado de ofrecer un modelo apto para despliegue en dispositivo, entornos locales y escenarios con recursos limitados. El recuento real de parámetros en safetensors es de 2.516.756.480 (unos 2,52 B).

El modelo cubre generación de texto, razonamiento, código, matemáticas, comprensión de contexto largo, uso de herramientas y tareas agénticas, según los propios datos de la model card. Está entrenado con corpus de OpenBMB (Ultra-FineWeb, UltraX-Preview, UltraData-Math, UltraData-Code) y con conjuntos específicos de ajuste supervisado y de refuerzo, incluidos los orientados a agentes. Soporta únicamente inglés y chino y se distribuye con licencia Apache-2.0.

Su relevancia actual radica en el nicho de modelos pequeños: la model card afirma que alcanza SOTA en su comparativa de modelos de código abierto de clase 2B y que se mantiene competitivo frente a modelos de clase 4B, con ventajas en código, matemáticas, contexto largo, uso de herramientas y agentes. No obstante, el repositorio no incluye resultados numéricos de benchmarks, y en el momento de redactar esta ficha acumula 0 descargas y 0 likes, por lo que se trata de una publicación reciente y sin validación comunitaria independiente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia MiniCPM5) |
| Parámetros totales | 2.516.756.480 (~2,52 B) según safetensors |
| Parámetros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (la model card usa la etiqueta "long-context" y menciona ventajas en contexto largo, pero no indica la ventana numérica) |
| Tipos de cuantización | GGUF; los niveles concretos (Q4_K_M, Q8_0, etc.) no se detallan en la información disponible. El repositorio ocupa 9,3 GB, lo que sugiere varias variantes de cuantización |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (este repositorio). La librería declarada es transformers |
| Pipeline | text-generation |
| Autor del repositorio | Yaspas (conversión GGUF de un modelo de OpenBMB) |
| Fecha de publicación | 16 de septiembre de 2026 (creación y última actualización) |

## Arquitectura y entrenamiento

MiniCPM5-2B es un transformer denso de aproximadamente 2,52 B de parámetros, sin mezcla de expertos ni capas recurrentes. Según la model card, es el segundo modelo de la serie MiniCPM5 y escala la misma receta de entrenamiento empleada en MiniCPM5-1B, con especial énfasis en despliegue en dispositivo. La model card hace referencia al informe técnico de MiniCPM (arXiv:2506.07900) para los detalles de arquitectura; no se especifican en la información disponible datos como el número de cabezas de atención, la dimensionalidad oculta, las capas, el esquema de posiciones o la ventana de contexto exacta.

El entrenamiento se apoya en un conjunto de datos de OpenBMB: Ultra-FineWeb, UltraX-Preview y Ultra-FineWeb-L3 para el corpus general de preentrenamiento; UltraData-Math y UltraData-Code para las capacidades de matemáticas y código; UltraData-SFT-2605 para el ajuste supervisado; UltraData-SFT-Agent-2609 para el ajuste orientado a agentes; y UltraData-RL-2609 para la fase de aprendizaje por refuerzo. Esto indica una cadena preentrenamiento → SFT → SFT agéntico → RL. No se dispone del número total de tokens de entrenamiento, de la composición porcentual del dataset ni de la técnica de alineación concreta (RLHF, DPO u otra), más allá de la mención genérica a RL.

Una innovación destacable es la orientación explícita al uso agéntico y al tool calling dentro de una escala de 2B, que tradicionalmente se ha reservado a modelos mucho mayores. La model card menciona además un segundo trabajo de referencia, arXiv:2602.09003, cuyo título y contenido no se detallan en la información proporcionada. Conviene subrayar que este repositorio concreto es una conversión a GGUF realizada por un tercero (Yaspas), no una publicación oficial de OpenBMB, por lo que los detalles técnicos proceden del modelo original y no de una validación independiente del repack.

## Capacidades

- Generación de texto conversacional multi-turno en inglés y chino.
- Razonamiento general e instrucciones: la model card destaca el seguimiento de instrucciones como una de las dimensiones evaluadas.
- Generación y razonamiento sobre código, con ventaja declarada frente a modelos de tamaño similar.
- Razonamiento matemático, apoyado en el dataset UltraData-Math.
- Comprensión de contexto largo: la model card incluye esta dimensión en su gráfico comparativo y etiqueta el modelo como "long-context", aunque sin cifra de ventana publicada.
- Uso de herramientas (tool calling / function calling), con un conjunto de datos de SFT específicamente agéntico (UltraData-SFT-Agent-2609).
- Comportamiento agéntico y razonamiento multi-paso, reforzado mediante la fase de RL (UltraData-RL-2609).
- Despliegue en dispositivo y edge: el modelo está diseñado para ejecución local en hardware limitado, con pesos en GGUF aptos para CPU y GPU modesta.
- Capacidades multilingües limitadas a inglés y chino; no hay soporte declarado de otros idiomas.
- Modo de razonamiento explícito (thinking mode), visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional local sin conexión: el modelo puede ejecutarse íntegramente en un portátil o mini-PC con llama.cpp u Ollama, gestionando conversaciones multi-turno en inglés o chino sin enviar datos a la nube, lo que resulta adecuado para entornos con requisitos de privacidad o conectividad intermitente.
- Autocompletado y revisión de código en el IDE: con 2,52 B de parámetros y pesos GGUF cuantizados, puede integrarse en extensiones locales que sugieren funciones, explican fragmentos o detectan errores, con latencia baja en GPU de gama media o incluso en CPU.
- Agentes locales con tool calling: al estar entrenado con datos de SFT agéntico y RL, puede orquestar llamadas a funciones (APIs locales, sistema de ficheros, bases de datos) en flujos multi-paso ejecutados en el propio dispositivo.
- Procesamiento de documentos largos en el borde: para resumir informes, extraer entidades o responder preguntas sobre contratos y manuales en inglés o chino, aprovechando la orientación a contexto largo del modelo en despliegues donde no se puede usar un servicio en la nube.
- Tutoría y resolución de problemas matemáticos: la combinación de UltraData-Math y la fase de RL lo hace adecuado para asistentes educativos que explican paso a paso ejercicios de nivel escolar o universitario inicial, ejecutables en hardware de bajo coste.
- Extracción estructurada de datos en pipelines ETL: el modelo puede transformar texto no estructurado en JSON o campos tabulares mediante tool calling, integrándose en procesos batch locales sin coste por token.
- Filtrado y clasificación de contenido en el dispositivo: moderación, etiquetado temático o enrutado de consultas en aplicaciones móviles, donde el coste de ejecución local de un modelo de 2B es muy inferior al de una llamada a API.
- Prototipado e investigación en edge AI: por su licencia Apache-2.0 y su tamaño, sirve como base para experimentos de destilación, ajuste fino con LoRA o evaluación de técnicas de cuantización en hardware restringido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numéricos en la información disponible. La model card incluye un gráfico de radar ("Capability Radar by Dimension") que compara el modelo con alternativas de clase 4B en las dimensiones de razonamiento sobre código, razonamiento matemático, seguimiento de instrucciones, conocimiento general, contexto largo y uso de herramientas, pero el gráfico no aporta valores numéricos y las series se normalizan de forma independiente por eje, por lo que no permite extraer cifras comparables.

Las afirmaciones cualitativas recogidas en la model card son las siguientes: MiniCPM5-2B alcanza SOTA dentro del conjunto de comparación de modelos de código abierto de clase 2B, se mantiene competitivo frente a modelos de clase 4B en conjunto y muestra ventajas sobre modelos de tamaño comparable en código, matemáticas, comprensión de contexto largo, uso de herramientas y tareas agénticas. Estas afirmaciones no vienen acompañadas de puntuaciones de MMLU, HumanEval, GSM8K ni de ningún otro benchmark en la información proporcionada, por lo que deben tratarse como declaraciones del autor y no como resultados verificados.

## Requisitos de hardware

Las cifras de VRAM que se indican a continuación son estimaciones derivadas del recuento de parámetros (2,52 B) y del tamaño del repositorio (9,3 GB, compatible con varias cuantizaciones), no datos publicados por el autor.

- Inferencia en FP16/BF16: aproximadamente 5,0 GB de pesos, más memoria para el contexto y las activaciones. Requiere GPU con al menos 8 GB de VRAM para funcionar con holgura.
- Cuantización Q8_0: aproximadamente 2,7 GB de pesos. Cómodo en GPU de 6-8 GB y en memoria unificada.
- Cuantización Q4_K_M: aproximadamente 1,6 GB de pesos. Es el punto de equilibrio habitual entre calidad y tamaño para este rango.
- Cuantizaciones Q3 y Q2: en torno a 1,0-1,3 GB de pesos, a costa de una degradación apreciable de la precisión.
- Ejecución en CPU: viable con llama.cpp u Ollama. Un modelo de 2,5 B en Q4 ocupa alrededor de 2 GB en RAM, por lo que cabe en la mayoría de equipos actuales.
- GPU recomendadas: para uso individual, RTX 3060 12 GB, RTX 4060 Ti, RTX 4090 o Apple Silicon con memoria unificada (M1 Pro en adelante). Para servicio con concurrencia, A100 40/80 GB o H100, aunque el modelo estará infrautilizado en estas GPU salvo que se despliegue con batching elevado.
- GPU de consumo: sí, cabe con holgura en cualquier GPU con 8 GB o más, y en muchas configuraciones con 6 GB si se usa una cuantización Q4 o inferior.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, servidores compatibles con la API de OpenAI sobre llama.cpp u Ollama, y text-generation-inference con backend GGUF. El soporte de vLLM para GGUF es parcial y puede requerir conversión a otros formatos para aprovechar el batching continuo.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia por petición en la información proporcionada.

## Comparativa con modelos similares

Los datos de terceros que aparecen en esta tabla proceden de las fichas públicas de cada modelo y deben verificarse antes de tomar decisiones de producción; el modelo de esta ficha se compara con la información disponible en su propio repositorio.

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato / disponibilidad | Notas |
|---|---|---|---|---|---|---|
| MiniCPM5-2B-GGUF (este repositorio) | 2,52 B | No disponible | en, zh | Apache-2.0 | GGUF; conversión de terceros | SOTA declarado en clase 2B por el autor; sin benchmarks numéricos publicados |
| MiniCPM5-1B | No disponible (modelo de 1B de la misma serie) | No disponible | No disponible | Apache-2.0 (según la serie) | Pesos originales en HuggingFace (openbmb) | Predecesor directo, misma receta de entrenamiento |
| Qwen3-1.7B | 1,7 B | 32.768 tokens nativos | Multilingüe amplio | Apache-2.0 | safetensors, GGUF, múltiples runtimes | Alternativa frecuente en el segmento de 1-2 B |
| Llama-3.2-3B | 3,2 B | 128.000 tokens | Multilingüe (8 idiomas declarados) | Licencia comunitaria de Llama 3.2 | safetensors, GGUF | Referencia de clase 3B con licencia no Apache |

No se dispone de comparaciones de rendimiento medidas entre estos modelos y MiniCPM5-2B en la información proporcionada, por lo que la tabla se limita a parámetros, contexto, idiomas, licencia y disponibilidad.

## Limitaciones y advertencias

- Este repositorio es una conversión a GGUF publicada por un tercero (Yaspas), no una publicación oficial de OpenBMB. No hay garantía de que la cuantización preserve el comportamiento del modelo original, y los niveles de cuantización concretos no se detallan.
- No se han publicado resultados numéricos de benchmarks. Las afirmaciones de SOTA en clase 2B y de competitividad con modelos de 4B provienen exclusivamente del autor del modelo original y no están verificadas de forma independiente.
- El repositorio tiene 0 descargas y 0 likes en el momento de redactar esta ficha, por lo que carece de validación por parte de la comunidad.
- Sesgos conocidos: no disponibles. No se documenta ninguna auditoría de sesgos, toxicidad o alineación de seguridad en la información proporcionada.
- Riesgo de alucinación: inherente a los modelos de 2B. La capacidad reducida de conocimiento factual y la presión de la cuantización pueden incrementar las invenciones en dominios especializados; se recomienda verificación externa en usos críticos.
- Limitación idiomática: solo inglés y chino. El rendimiento en castellano u otros idiomas no está documentado y previsiblemente será deficiente.
- Contexto: aunque el modelo se etiqueta como "long-context", no se especifica la ventana numérica ni la degradación esperada en longitudes extremas. No debe asumirse un contexto de 128K o similar sin verificación.
- Licencia: Apache-2.0 permite uso comercial y modificación con obligación de conservar el aviso de licencia y el fichero de cambios. Conviene revisar los términos de los datasets de entrenamiento de OpenBMB por si imponen condiciones adicionales sobre los pesos derivados.
- Cuantización: el uso de formatos GGUF de baja precisión (Q4, Q3, Q2) degrada la calidad de forma perceptible, especialmente en matemáticas y código, precisamente las áreas que el autor destaca.
- Idiomas y etiquetado: la model card usa la etiqueta "llama" entre los tags, lo que puede inducir a confusión sobre la arquitectura real, que la propia ficha describe como un transformer denso de la serie MiniCPM5.
- Fechas: el repositorio figura creado y actualizado el 16 de septiembre de 2026, lo que indica una publicación muy reciente y sin historial de mantenimiento.

## Enlaces

- Repositorio de esta ficha: https://huggingface.co/Yaspas/MiniCPM5-2B-GGUF
- Modelo original MiniCPM5-2B: https://huggingface.co/openbmb/MiniCPM5-2B
- Modelo predecesor MiniCPM5-1B: https://huggingface.co/openbmb/MiniCPM5-1B
- Demo en línea: https://huggingface.co/spaces/openbmb/MiniCPM5-2B-Demo
- Repositorio GitHub de OpenBMB MiniCPM: https://github.com/OpenBMB/MiniCPM
- Informe técnico de MiniCPM: https://arxiv.org/pdf/2506.07900
- Segundo trabajo referenciado (título no disponible en la información proporcionada): https://arxiv.org/abs/2602.09003
- Suite de datos UltraData: https://ultradata.openbmb.cn/
- Wiki de MiniCPM (en chino): https://modelbest.feishu.cn/wiki/UtWxwcERfiRIpIkBOjuc3h9tn1D
- README en chino del modelo original: https://huggingface.co/openbmb/MiniCPM5-2B/blob/main/README-cn.md

Nota: la búsqueda web realizada no ha devuelto ningún resultado relevante sobre este modelo; los enlaces devueltos corresponden a foros de calculadoras gráficas (TI-Planet) y no guardan relación con MiniCPM5-2B.
