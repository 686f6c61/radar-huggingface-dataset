# TyKaoz/Apertus-v1.5-8B-text-8bit

## Resumen

Apertus-v1.5-8B-text-8bit es una cuantización de 8 bits en formato MLX del modelo `swiss-ai/Apertus-v1.5-8B`, publicada por el desarrollador TyKaoz. Se trata de la rama exclusivamente de texto extraída del checkpoint ómnimodal original: las torres de visión y audio, junto con sus codebooks, se han eliminado de los pesos, de modo que solo se conserva el decodificador de lenguaje. El resultado son 8.053.338.112 parámetros en safetensors con un peso de repositorio de 8,6 GB y un peso efectivo en memoria de aproximadamente 8,0 GB.

El modelo base pertenece a la Swiss AI Initiative, un proyecto conjunto de EPFL, ETH Zurich y CSCS, y se distribuye bajo licencia Apache 2.0 acompañada de la política de uso aceptable de Apertus. La cuantización se ha realizado con `mlx-lm` en 8 bits con tamaño de grupo 64, manteniendo el tokenizador y la plantilla de chat originales. Está pensado específicamente para Apple Silicon, ya que MLX es el framework de arrays de Apple optimizado para memoria unificada.

Su relevancia actual radica en dos factores: por un lado, ofrece una ventana de contexto declarada de 262.144 tokens en un modelo de 8B, algo poco habitual en esa franja de tamaño; por otro, permite ejecutar un modelo suizo totalmente abierto y de pesos abiertos en un portátil Mac sin GPU dedicada. La contrapartida es que el soporte de idiomas se limita a inglés, francés, alemán, italiano y romanche, sin castellano entre ellos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (detalles completos del base no disponibles); activacion xIELU |
| Parametros totales | 8.053.338.112 |
| Parametros activos | No aplica (no es MoE; no se indica mezcla de expertos) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | 8-bit MLX, group size 64 |
| Idiomas soportados | en, fr, de, it, rm |
| Licencia | Apache 2.0 (heredada del modelo base) + politica de uso aceptable de Apertus |
| Formato de pesos | safetensors (formato MLX) |
| Biblioteca | mlx / mlx-lm |
| Modelo base | swiss-ai/Apertus-v1.5-8B |
| Tamano del repositorio | 8,6 GB |
| Peso en memoria (inferencia) | ~8,0 GB |
| Modalidad | Solo texto (torres de imagen y audio eliminadas) |
| Fecha de publicacion (metadatos) | 2026-09-18 |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de dos datos concretos: se trata de la rama de texto de un checkpoint omni (es decir, el modelo base incorporaba torres de vision y audio que aqui se han descartado) y utiliza la activacion xIELU, una funcion de activacion suave y parametrizable empleada en lugar de GELU o SwiGLU en algunas arquitecturas recientes. Con 8.053 millones de parametros totales y sin mencion a expertos, se trata de un transformer denso. El proceso aplicado por TyKaoz consiste en extraer los pesos de la rama de texto del checkpoint original y cuantizarlos a 8 bits con `mlx-lm`, con grupo de cuantizacion de 64, preservando el tokenizador y la plantilla de chat del modelo fuente.

No se proporciona informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF o DPO, ni sobre tecnicas de decodificacion especulativa o atencion lineal en el modelo base. Tampoco se documenta el proceso de destilado o calibracion de la cuantizacion, mas alla de los parametros indicados. Cualquier afirmacion adicional sobre el entrenamiento seria especulativa y no se incluye aqui.

El nombre "v1.5" sugiere una revision del Apertus 8B original, pero la model card no detalla que cambios introduce esa revision respecto a la version previa.

## Capacidades

- Generacion de texto conversacional en los cinco idiomas declarados: ingles, frances, aleman, italiano y romanche.
- Razonamiento de un solo turno o multiturno gracias a la plantilla de chat incluida y a la ventana de contexto de 262.144 tokens.
- Procesamiento de documentos muy largos: libros completos, bases de codigo extensas o historiales de conversacion de cientos de miles de tokens.
- Capacidades multilingues limitadas al ambito linguistico indicado (no se declara castellano ni otros idiomas).
- Ejecucion local en Apple Silicon mediante MLX, sin necesidad de GPU dedicada ni de servicios en la nube.
- No incluye capacidades de vision ni de audio, pese a provenir de un checkpoint omni: esas torres se eliminaron en esta conversion.
- No se documenta soporte explicito de tool calling, function calling ni modos de razonamiento extendido (thinking mode) en la informacion proporcionada.

## Casos de uso

- Procesamiento de documentos legales o normativos extensos: con 262.144 tokens de contexto, el modelo puede ingerir contratos, expedientes o normativas completas en una sola pasada y responder preguntas sobre clausulas concretas sin necesidad de trocear el texto.
- Analisis de repositorios de codigo: permite cargar varios ficheros fuente simultaneamente y responder consultas sobre su estructura, dependencias o posibles errores, aunque la ausencia de tool calling documentado limita la automatizacion completa.
- Asistente conversacional local en macOS: integrable en aplicaciones de escritorio tipo cliente de chat nativo (el propio autor mantiene un cliente macOS), con todos los datos permaneciendo en el dispositivo y sin coste de API.
- Soporte multilingue centroeuropeo: atencion al cliente o generacion de contenidos en aleman, frances, italiano y romanche, cubriendo el mercado suizo y zonas fronterizas, incluido el romanche, idioma con escasisimos recursos en modelos abiertos.
- Resumen y sintesis de corpus largos: agregacion de informes, actas o articulos en un unico prompt largo para producir resumenes coherentes con el conjunto completo en lugar de resumentes parciales.
- Prototipado e investigacion academica: al ser Apache 2.0 y ejecutarse en hardware de consumo, sirve para experimentar con modelos de contexto largo sin presupuesto de infraestructura.
- Transcripcion y reescritura de textos en ingles o frances dentro de flujos editoriales locales, aprovechando la inferencia offline.
- Desarrollo de demos privadas: cualquier escenario donde la confidencialidad impida enviar datos a APIs externas (sanidad, banca, sector publico) y se disponga de Macs con memoria unificada suficiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye tablas de MMLU, HumanEval, GSM8K ni ninguna otra metrica, y las busquedas web realizadas no devolvieron resultados relacionados con el modelo. Tampoco se documentan cifras de latencia o throughput mas alla del peso en memoria (~8,0 GB) y del hecho de estar cuantizado en 8 bits con grupo 64.

## Requisitos de hardware

- VRAM/memoria: aproximadamente 8,0 GB para los pesos en 8 bits; el repositorio ocupa 8,6 GB en disco.
- Memoria unificada recomendada: 16 GB como minimo en un Mac Apple Silicon para dejar margen al contexto y al runtime; 32 GB o mas si se van a explotar contextos muy largos, ya que la KV cache crece de forma lineal con los tokens procesados.
- GPU compatibles: exclusivamente Apple Silicon (familia M1, M2, M3, M4 en sus variantes base, Pro, Max y Ultra). No esta pensado para CUDA ni ROCm.
- GPU de consumo NVIDIA: no aplicable; el formato MLX no las soporta. En esas GPUs habria que usar una cuantizacion GGUF del modelo base con llama.cpp.
- Opciones de despliegue: `mlx-lm` (linea de comandos y API de Python), y cualquier runtime construido sobre MLX. No es compatible directamente con vLLM, TGI ni Ollama en su formato actual.
- Latencia y throughput: no disponibles. Dependeran del chip concreto, del ancho de banda de memoria unificada y de la longitud de contexto utilizada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato/plataforma |
|---|---|---|---|---|---|
| TyKaoz/Apertus-v1.5-8B-text-8bit | 8,05B | 262.144 | en, fr, de, it, rm | Apache 2.0 + politica Apertus | MLX 8-bit, Apple Silicon |
| swiss-ai/Apertus-v1.5-8B | 8B (aprox.) | 262.144 | en, fr, de, it, rm | Apache 2.0 + politica Apertus | safetensors completos, multiplataforma |
| Meta Llama 3.1 8B Instruct | 8,03B | 128.000 | multilingue (8 idiomas declarados, incluye es) | Licencia comunitaria Llama 3.1 | safetensors, GGUF, multiplataforma |
| Mistral 7B Instruct v0.3 | 7,25B | 32.768 | multilingue (incluye es) | Apache 2.0 | safetensors, GGUF, multiplataforma |

Nota: los datos de Llama 3.1 8B y Mistral 7B v0.3 proceden de sus especificaciones publicas conocidas, no de una evaluacion comparativa realizada aqui. No se dispone de resultados de benchmarks de Apertus v1.5 8B, por lo que no es posible establecer una comparacion de rendimiento real entre estos modelos con la informacion disponible.

## Limitaciones y advertencias

- Idiomas: no se declara soporte de castellano. Usar el modelo en espanol dara resultados degradados y no deberia considerarse un caso de uso soportado.
- Solo texto: las torres de vision y audio del checkpoint omni original no estan presentes, por lo que no se puede procesar imagenes ni audio.
- Perdida por cuantizacion: la conversion a 8 bits con grupo 64 introduce una degradacion respecto a los pesos originales en fp16/bf16, no cuantificada ni documentada por el autor.
- Plataforma: el formato MLX ata el modelo a Apple Silicon. No hay GGUF ni safetensors estandar, lo que impide su uso en servidores Linux con GPU NVIDIA o AMD sin reconvertir.
- Contexto: aunque se declaran 262.144 tokens, la memoria necesaria para la KV cache a esa longitud es muy superior a los 8 GB de los pesos y probablemente exceda la memoria unificada de la mayoria de Macs de consumo; el contexto efectivo en la practica sera mucho menor.
- Alucinacion: no se documentan evaluaciones de fidelidad ni tasas de alucinacion, y no hay datos de benchmarks que permitan estimar el comportamiento en tareas de razonamiento o matematicas.
- Licencia: Apache 2.0 permite uso comercial, pero va acompanada de la politica de uso aceptable de Apertus, cuyos terminos conviene revisar antes de desplegar en produccion.
- Madurez: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin historial de uso ni validacion por parte de la comunidad.
- Sin benchmarks: la ausencia total de metricas publicadas impide justificar la eleccion del modelo frente a alternativas con evaluaciones conocidas.
- Las busquedas web realizadas no arrojaron informacion relevante sobre este modelo; los resultados obtenidos trataban sobre calendarios de dias festivos y no guardan relacion alguna con la ficha.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/TyKaoz/Apertus-v1.5-8B-text-8bit
- Modelo base: https://huggingface.co/swiss-ai/Apertus-v1.5-8B
- Repositorio MLX: https://github.com/ml-explore/mlx
- Sitio del autor: https://www.tykaoz.bzh
- Iniciativa Swiss AI (EPFL, ETH Zurich, CSCS): no disponible en la informacion proporcionada como enlace directo
- Paper tecnico de Apertus: no disponible en la informacion proporcionada
- Demos o espacios asociados: no disponibles
