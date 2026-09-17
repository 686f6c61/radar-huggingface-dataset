# UraionLabs/K2-Horizon-7B-oQ8e

## Resumen

K2-Horizon-7B-oQ8e es una cuantizacion en formato MLX del modelo denso IFM/K2-Horizon-7B, publicada por Uraion Labs para inferencia local en Macs con Apple Silicon. No es un modelo entrenado desde cero: es un checkpoint derivado que conserva la arquitectura, el formato de chat, el comportamiento de razonamiento, la interfaz de tool calling y la ventana de contexto nativa de 524.288 tokens del modelo original, reduciendo el espacio en disco y los requisitos de memoria respecto al checkpoint en precision completa.

El modelo base pertenece a la familia K2-Horizon de IFM y se posiciona como el miembro denso de tamano medio, con etiqueta comercial de "7B" aunque el recuento real de parametros en safetensors es de 8.999.178.240 (aproximadamente 9B). Esta orientado a cargas de razonamiento, codigo, contexto largo, ciencia, busqueda y flujos agenticos, e incluye soporte de esfuerzo de razonamiento configurable a nivel de peticion mediante argumentos de la plantilla de chat.

La relevancia de esta ficha concreta es doble. Por un lado, permite ejecutar un modelo de casi 9B con contexto nominal de 512K en hardware de consumo de Apple sin depender de GPUs dedicadas ni de servicios en la nube. Por otro, la model card publica cifras de benchmarks muy altas para su categoria (70,6 en SWE-bench Verified o 73,3 en HMMT Feb 2026), aunque el propio autor advierte que corresponden al checkpoint original de IFM y no deben darse por reproducidas en esta cuantizacion sin una evaluacion independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only |
| Parametros totales | 8.999.178.240 (segun safetensors; etiquetado comercial como 7B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 524.288 tokens nativos (extension progresiva de contexto en el modelo base) |
| Tipos de cuantizacion | oQ8e (8 bits, segun etiquetas); nivel exacto de precision mixta por capa, group size y bits efectivos por peso: no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors en formato MLX (repo de 9,6 GB) |
| Modelo base | IFM/K2-Horizon-7B (relacion: quantized) |
| Runtime objetivo | Apple Silicon macOS (oMLX y runtimes compatibles con MLX) |
| Libreria declarada | mlx |
| Flujo de cuantizacion | oMLX oQe, ejecutado por Uraion Labs |

## Arquitectura y entrenamiento

El modelo original es un transformer denso decoder-only de clase 7B (casi 9B reales), sin mezcla de expertos. La model card no detalla el numero de capas, dimensiones ocultas, cabezas de atencion ni el tipo de atencion empleado, por lo que esos datos quedan como no disponibles. La unica innovacion arquitectonica documentada es la ventana de contexto nativa de 524.288 tokens, obtenida mediante entrenamiento de extension progresiva de contexto. K2-Horizon-7B soporta ademas control del esfuerzo de razonamiento a nivel de peticion a traves de argumentos de su plantilla de chat, y una interfaz de tool calling con parser dedicado.

Sobre los datos de entrenamiento, IFM declara publicar artefactos abiertos para la familia K2-Horizon (datos de entrenamiento, checkpoints, recetas, logs y recursos de evaluacion), pero la informacion proporcionada no incluye numero de tokens, composicion del dataset ni si hubo etapas de RLHF, DPO u otro ajuste por preferencias; todo ello queda como no disponible. Esta ficha corresponde exclusivamente al proceso de cuantizacion: Uraion Labs aplico el flujo oMLX oQe para producir un checkpoint oQ8e, preservando arquitectura, formato de chat, razonamiento y tool calling del upstream. La model card indica explicitamente que la asignacion exacta de precision mixta por capa, el group size, el dataset de calibracion y el tamano final efectivo deben tomarse de la salida real del proceso de cuantizacion, no inferirse.

## Capacidades

- Generacion de texto conversacional y continuacion de contexto largo, con ventana nativa de 524.288 tokens.
- Razonamiento con modo de esfuerzo configurable a nivel de peticion mediante argumentos de la plantilla de chat de K2-Horizon.
- Generacion de codigo y resolucion de tareas de ingenieria de software, evaluadas en el modelo base con SWE-bench Verified, SciCode y Terminal-Bench.
- Tool calling / function calling estructurado, con parser dedicado en el formato de K2-Horizon.
- Flujos agenticos multi-paso: uso de terminal, uso de herramientas, navegacion web y tareas de ingenieria de software de extremo a extremo.
- Razonamiento matematico y cientifico (evaluado en el base con HMMT Feb 2026 y HLE).
- Busqueda y navegacion web (evaluado con BrowseComp bajo protocolo Discard-all@95k en el modelo base).
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma del repositorio.
- No se documentan capacidades de vision, audio ni multimodalidad en la informacion disponible.

## Casos de uso

- Asistente de codigo en local sobre macOS: el modelo puede generar y refactorizar codigo dentro de un Mac con Apple Silicon, sin enviar codigo a servicios externos, gracias al formato MLX y al soporte de tool calling conservado del upstream. Es adecuado para equipos con requisitos de privacidad estrictos.
- Agente de ingenieria de software: con 70,6 en SWE-bench Verified segun IFM, el modelo base esta pensado para resolver incidencias en repositorios reales; en su version cuantizada puede integrarse en un bucle agentico que lea ficheros, aplique parches y ejecute tests a traves de tool calling.
- Automatizacion de terminal y operaciones: con soporte de uso de terminal (39,1 en Terminal-Bench 2.1 en el base), encaja en tareas de administracion de sistemas guiadas por lenguaje natural, generando comandos y verificando su salida en varios pasos.
- Analisis de documentos muy largos: la ventana de 524.288 tokens permite procesar libros tecnicos, expedientes completos o bases de codigo enteras en una sola pasada, util para resumen, extraccion de entidades y preguntas sobre el documento sin troceado agresivo.
- Agentes de navegacion y busqueda: el modelo base reporta 59,0 en BrowseComp, por lo que es adecuado para asistentes que planifican busquedas, consultan paginas y sintetizan resultados en varios pasos.
- Razonamiento matematico y cientifico asistido: con 73,3 en HMMT Feb 2026 y 31,6 en SciCode en el modelo base, puede emplearse como apoyo en resolucion de problemas y generacion de codigo cientifico en un entorno local.
- Prototipado e investigacion en Apple Silicon: sirve como banco de pruebas para estudiar el efecto de la cuantizacion oQ8e sobre razonamiento, tool calling y contexto largo, comparando contra el checkpoint original de IFM.

## Benchmarks y rendimiento

Los resultados siguientes los reporta IFM para el checkpoint original IFM/K2-Horizon-7B. La model card advierte expresamente que esta cuantizacion oQ8e de Uraion Labs no debe suponerse capaz de reproducir esas puntuaciones sin una evaluacion independiente. No hay benchmarks publicados especificos de esta variante cuantizada.

| Benchmark | K2-Horizon-7B | Gemma 4-12B | Qwen3.5-9B | Granite 4.2-8B |
|---|---|---|---|---|
| HMMT Feb 2026 | 73,3 | 63,1 | 65,7 | 66,5 |
| SWE-bench Verified | 70,6 | 30,6 | 50,8 | 47,7 |
| HLE | 18,6 | 15,7 | 14,9 | 9,7 |
| SciCode | 31,6 | no disponible | 27,5 | 30,4 |
| LCR | 68,0 | 61,7 | 65,3 | 43,3 |
| Terminal-Bench 2.1 | 39,1 | 27,3 | 29,2 | 18,4 |
| tau3-Banking | 25,8 | no disponible | 7,0 | 7,6 |
| BrowseComp | 59,0 | no disponible | no disponible | no disponible |

Modelos de referencia adicionales citados en la model card: Mistral Small 4 obtiene 28,0 en SciCode; Muse Glimmer-30B obtiene 24,0 en tau3-Banking; en BrowseComp se citan DeepSeek V4 Flash-0423 con 53,5, GPT-5 con 54,9 y LongCat Flash Thinking-2601 con 56,6. Para BrowseComp, IFM indica que uso el protocolo de longitud de contexto Discard-all@95k, y advierte que los modelos de comparacion pueden emplear harness de evaluacion distintos.

## Requisitos de hardware

- VRAM / memoria unificada estimada para inferencia: el repositorio ocupa 9,6 GB, por lo que los pesos en oQ8e rondan esa cifra. Como estimacion, se necesitan al menos 12-14 GB de memoria unificada disponible para cargar el modelo y operar con contextos cortos.
- Plataforma soportada: Apple Silicon macOS (M1 o posterior) a traves de MLX. No se documenta soporte para CUDA, ROCm ni aceleradores no Apple.
- Cabe en GPU de consumo? No en el sentido habitual: al ser un checkpoint MLX, el destino natural es memoria unificada de Mac. En Macs de 16 GB es probable que quede muy justo una vez anadido el KV cache; 24-32 GB es un punto de partida razonable y 64 GB o mas es recomendable para explotar contextos muy largos.
- Contexto largo: con 524.288 tokens nativos, el KV cache crece de forma significativa. No se dispone de la configuracion de atencion (numero de capas, cabezas KV, GQA/MQA) ni de cifras oficiales de consumo de memoria por token, por lo que cualquier calculo de memoria a contexto completo queda como no disponible.
- Opciones de despliegue: oMLX (https://github.com/jundot/omlx) y runtimes compatibles con MLX. No se documenta compatibilidad directa con vLLM, llama.cpp, Ollama o TGI para este checkpoint en formato MLX.
- Latencia y throughput: no disponibles. No hay cifras publicadas de tokens por segundo para esta cuantizacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| K2-Horizon-7B-oQ8e (esta ficha) | 8,999B reales (clase 7B) | 524.288 tokens | Apache-2.0 | MLX safetensors (8 bits) | Solo Apple Silicon; tool calling y razonamiento conservados |
| IFM/K2-Horizon-7B (base) | 8,999B reales (clase 7B) | 524.288 tokens | Apache-2.0 | safetensors de precision completa | Referencia de maxima calidad; mayor huella de memoria |
| Qwen3.5-9B | no disponible | no disponible | no disponible | no disponible | Comparado por IFM en benchmarks; por debajo en SWE-bench, Terminal-Bench y tau3-Banking |
| Granite 4.2-8B | no disponible | no disponible | no disponible | no disponible | Comparado por IFM; claramente por debajo en SWE-bench y LCR |
| Gemma 4-12B | no disponible | no disponible | no disponible | no disponible | Comparado por IFM; mayor tamano nominal y peor SWE-bench (30,6) |

La comparacion cuantitativa solo es posible en los benchmarks publicados por IFM. Para el resto de atributos de los modelos alternativos (parametros exactos, contexto, licencia y disponibilidad de pesos), la informacion proporcionada no permite completar la tabla.

## Limitaciones y advertencias

- Los benchmarks incluidos corresponden al modelo base IFM/K2-Horizon-7B, no a esta cuantizacion. La cuantizacion a 8 bits puede degradar razonamiento de varios pasos, tool calling y fidelidad en contexto muy largo.
- No hay evaluacion independiente publicada de esta variante, ni cifras de bits efectivos por peso, group size o dataset de calibracion.
- Idioma: unicamente ingles segun la etiqueta del repositorio. El rendimiento en castellano no esta documentado y no deberia asumirse.
- Sesgos conocidos: no disponibles. No se documenta analisis de sesgos, filtrado de datos ni evaluaciones de seguridad en la informacion proporcionada.
- Riesgo de alucinacion: inherente a los modelos generativos; no hay datos especificos de tasas de alucinacion. En tareas agenticas con tool calling, una alucinacion puede traducirse en comandos o parches incorrectos, por lo que se recomienda supervision humana y sandboxing.
- Contexto: los 524.288 tokens son la longitud nativa declarada del base. El consumo real de memoria del KV cache a esa longitud no esta documentado y puede exceder la memoria disponible en muchos equipos.
- Licencia Apache-2.0, permisiva y apta para uso comercial. No obstante, verifique la licencia del modelo base y de cualquier artefacto de IFM que se redistribuya, y conserve los avisos de atribucion correspondientes.
- Dependencia de plataforma: al ser un checkpoint MLX orientado a Apple Silicon, no es portable directamente a stacks CUDA habituales de produccion sin conversion y validacion adicionales.
- Fechas de creacion y actualizacion del repositorio (2026-09-16) y ausencia de descargas y likes: se trata de un artefacto reciente y sin adopcion verificable, lo que reduce la evidencia empirica disponible sobre su comportamiento real.

## Enlaces

- Repositorio HuggingFace de esta cuantizacion: https://huggingface.co/UraionLabs/K2-Horizon-7B-oQ8e
- Modelo base: https://huggingface.co/IFM/K2-Horizon-7B
- Repositorio oMLX: https://github.com/jundot/omlx
- Sitio del autor de la cuantizacion, Uraion Labs: https://uraionlabs.com
- Paper, blog tecnico y demo oficial de K2-Horizon-7B: no disponibles en la informacion proporcionada.
- Resultados de busqueda web: no se ha recuperado ningun resultado relevante sobre el modelo; las busquedas devolvieron unicamente paginas de una tienda de ropa sin relacion con el modelo.
