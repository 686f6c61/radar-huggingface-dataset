# xwcg/Qwen2.5-decompile-14B-r2

## Resumen

Qwen2.5-decompile-14B-r2 es un ajuste fino (LoRA) del modelo Qwen2.5-Coder-14B-Instruct de Alibaba, especializado en **descompilación por coincidencia** (matching decompilation). Dado el listado de ensamblador x86-64 de una función compilada con MSVC (Visual C++ 2012, x64, /O2), el modelo escribe código fuente C++ que, al compilarse con esas mismas opciones, produce los mismos bytes que el binario original. Lo publica el usuario xwcg bajo licencia Apache-2.0.

El modelo resuelve un problema clásico de la ingeniería inversa: la descompilación tradicional (Hex-Rays, Ghidra) genera código funcionalmente equivalente pero rara vez idéntico a nivel de bytes, lo que dificulta tareas de verificación, análisis de malware con firmas exactas o reconstrucción de código fuente. Este ajuste ataca esa coincidencia exacta, aunque con un alcance deliberadamente estrecho: un único compilador y un único conjunto de flags.

Arquitectónicamente es un transformer denso de 14.770.033.664 parámetros (heredados del modelo base), distribuido como adaptador LoRA de rango 32 más pesos fusionados en GGUF. El repositorio incluye cuantizaciones Q5_K_M e IQ3_XS, y el modelo está pensado para integrarse en bucles de reparación con retroalimentación del compilador. Su relevancia actual radica en que demuestra que el ajuste fino de un coder de 14B puede superar al modelo base en una tarea de verificación binaria estricta (41/100 frente a 26/100 en una sola respuesta).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2.5), ajuste fino con LoRA (rango 32, alpha 32, todas las proyecciones de atención y MLP) |
| Parametros totales | 14.770.033.664 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 8.192 tokens en entrenamiento; 16k con la cuantización Q5_K_M según el autor; contexto nativo del base no especificado |
| Tipos de cuantizacion | Q5_K_M, IQ3_XS (con importance matrix calculada sobre datos de entrenamiento propios); adaptador LoRA en bf16 |
| Idiomas soportados | No disponible (el modelo base es multilingüe, pero el ajuste está orientado a ensamblador y C++) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA), GGUF (modelos fusionados y cuantizados) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-Coder-14B-Instruct, un transformer decoder-only denso con atención completa, y se ajusta mediante LoRA sobre el modelo base completo en bf16. El adaptador tiene rango 32 y alpha 32, aplicado a todas las proyecciones de atención y MLP. El entrenamiento consistió en 2 épocas, 736 pasos, learning rate 0,00015 y secuencias de hasta 8.192 tokens, con varios ejemplos empaquetados por secuencia y pérdida calculada únicamente sobre las respuestas. El conjunto de datos contiene 4.603 ejemplos (10.445.841 tokens), cada uno de tipo *write*: el listado de ensamblador (con algunos ejemplos resueltos en el prompt) como entrada y el código fuente coincidente como salida. Las fuentes son coincidencias verificadas procedentes de diversas descompilaciones. La pérdida final de entrenamiento fue 0,154 y la de evaluación 0,139 sobre secuencias reservadas.

La innovación técnica no está en la arquitectura, sino en el dominio y el protocolo de uso. El prompt de sistema fija el compilador (cl 17.00, x64, /O2 /GS- /MD /EHsc /GR) y las reglas de salida: un único bloque ```cpp con el archivo completo, funciones y globales llamadas `FUN_<hex>` / `DAT_<hex>` declaradas pero no definidas, y structs provisionales con los offsets de miembro como comentarios. El modelo está diseñado para operar en un bucle de hasta 5 rondas donde cada turno de reparación añade la respuesta anterior y la retroalimentación del verificador (compilación y comparación byte a byte). No se documenta uso de RLHF ni DPO; el ajuste es supervisado sobre pares ensamblador-fuente verificados.

## Capacidades

- Generación de código C++ a partir de listados de ensamblador x86-64 de MSVC, con el objetivo de coincidencia byte a byte tras compilación.
- Razonamiento sobre semántica de bajo nivel: instrucciones, convenciones de llamada, offsets de estructura y variables globales.
- Reparación iterativa: puede usar la retroalimentación del compilador y del comparador para corregir respuestas en rondas sucesivas.
- Formato de salida estructurado: un único bloque ```cpp con reglas de nombrado estrictas (`FUN_<hex>`, `DAT_<hex>`, structs con offsets comentados).
- Soporte de conversación multi-turno mediante la plantilla de chat del modelo base.
- Capacidades heredadas del base (generación de texto y código general) potencialmente presentes, aunque no evaluadas ni garantizadas por el autor.
- No se documentan capacidades de tool calling, agentes autónomos, visión, audio ni modo thinking explícito.

## Casos de uso

- **Verificación de binarios y análisis de malware**: dado el ensamblador de una función sospechosa, generar candidatos de fuente C++ que reproduzcan exactamente los bytes y permitan comparar contra firmas o bases de código conocidas. El modelo es adecuado porque su salida está pensada para compilarse y compararse byte a byte.
- **Recuperación de código fuente en auditorías**: en procesos de due diligence o auditoría de software legado sin fuentes, reconstruir funciones concretas de binarios MSVC 2012 x64 /O2 y validar la coincidencia con el compilador original.
- **Investigación en descompilación**: usar el modelo como componente generativo dentro de pipelines de investigación que estudien la equivalencia binaria y la fidelidad de la descompilación, aprovechando los bucles de reparación con retroalimentación.
- **Generación de parches verificables**: en tareas de ingeniería inversa donde se necesita modificar una función y recompilarla para obtener un binario equivalente salvo el cambio, el modelo puede proponer el fuente base que sirve de punto de partida.
- **Docencia y formación en ingeniería inversa**: mostrar cómo el ensamblador de una función se corresponde con construcciones C++ concretas, usando el modelo para generar hipótesis que el estudiante compila y verifica.
- **Automatización de pipelines de CI para binarios**: integrar el modelo en un flujo que compile cada respuesta y la compare con el binario original, descartando las que no coinciden; el modelo está diseñado explícitamente para este ciclo de verificación.
- **Análisis de funciones pequeñas y medianas**: procesar funciones de hasta aproximadamente 128 bytes, donde el autor reporta mejores tasas de coincidencia en una sola respuesta, dentro de herramientas de análisis estático.

## Benchmarks y rendimiento

Evaluación del autor sobre funciones reservadas (ninguna de ellas ni sus fuentes en los datos de entrenamiento), decodificación greedy, compiladas y comparadas byte a byte:

| Modelo | Una respuesta (100 funciones) | Bucle de 5 rondas con retroalimentación (85 funciones) |
|---|---|---|
| Qwen2.5-Coder-14B-Instruct (base) | 26/100 | No disponible |
| Ajuste fino r2 | **41/100** | **50/85** |
| Ajuste fino r4 | 36/100 | 48/85 |

En el bucle de 5 rondas, r4 encontró 14 coincidencias en rondas de reparación frente a 10 de r2, y produjo menos respuestas que no compilan. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generales en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: la cuantización Q5_K_M cabe en 16 GB de VRAM con contexto de 16k; la IQ3_XS cabe en 8 GB de VRAM con contexto de 8k (datos del autor).
- **GPU recomendadas**: para Q5_K_M, una RTX 4090 (24 GB), RTX 4080 (16 GB) o A100/H100; para IQ3_XS, GPU consumer de 8-12 GB como RTX 3060 Ti, RTX 4060 Ti o RTX 3080.
- **Cabe en GPU consumer**: sí, en ambas cuantizaciones según el autor; el adaptador LoRA en bf16 requiere el modelo base completo en bf16 (aproximadamente 28-30 GB en FP16/BF16), por lo que necesita A100 40 GB, H100 o dos GPU de 24 GB.
- **Opciones de despliegue**: llama.cpp y Ollama para los GGUF; vLLM o TGI para el modelo fusionado en bf16; PEFT para cargar el adaptador sobre el base.
- **Latencia y throughput**: no disponibles. El tamaño del repositorio (17,5 GB) corresponde a los artefactos publicados, no a un indicador de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5-decompile-14B-r2 | 14,77B | 8k (entrenamiento), 16k con Q5_K_M | Descompilación por coincidencia MSVC x64 | Apache-2.0 | Hugging Face (GGUF + LoRA) |
| Qwen2.5-Coder-14B-Instruct (base) | 14,77B | Contexto nativo del base (no especificado en esta ficha) | Generación de código general | Apache-2.0 | Hugging Face |
| Qwen2.5-decompile-14B-r4 (modelo hermano) | 14,77B | No disponible | Descompilación con entrenamiento en rondas de reparación | Apache-2.0 | Hugging Face |

El modelo base es la referencia directa: r2 lo supera en la tarea específica (41/100 frente a 26/100). El hermano r4 es peor en primera respuesta (36/100) pero mejor en reparación (14 coincidencias en rondas de reparación frente a 10). No se dispone de comparación con descompiladores tradicionales (Hex-Rays, Ghidra) ni con otros ajustes finos de descompilación en la información proporcionada.

## Limitaciones y advertencias

- **Alcance de compilador único**: entrenado solo para VC++ 2012 x64 /O2 (/GS- /MD /EHsc /GR); otros compiladores y opciones quedan fuera del alcance declarado.
- **Funciones grandes**: una sola respuesta coincide con mucha menos frecuencia en funciones de más de aproximadamente 128 bytes; las rondas de retroalimentación ayudan pero no garantizan el éxito.
- **Verificación obligatoria**: las salidas deben compilarse y compararse byte a byte; una respuesta plausible no es una coincidencia. El autor lo advierte explícitamente.
- **Riesgo de alucinación**: el modelo puede generar código que compila pero no reproduce los bytes originales, o que no compila; el bucle de verificación es imprescindible en producción.
- **Sesgos**: no documentados por el autor; al derivar de un modelo base multilingüe, pueden persistir sesgos del base no evaluados en este ajuste.
- **Idiomas**: no se especifican idiomas soportados; el dominio efectivo es ensamblador x86-64 y C++.
- **Licencia**: Apache-2.0 permite uso comercial, pero se hereda del modelo base; conviene revisar los términos de Qwen2.5-Coder-14B-Instruct.
- **Madurez**: 0 descargas y 0 likes en el momento de la consulta, creado en noviembre de 2026; no hay evidencia de uso en producción ni validación independiente.
- **Adaptador LoRA**: requiere el modelo base completo en bf16 para cargarse, lo que eleva los requisitos de memoria frente a los GGUF.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xwcg/Qwen2.5-decompile-14B-r2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-14B-Instruct
- Modelo hermano (r4): no disponible en la información proporcionada
- Paper, blog, repositorio o demo: no disponibles en la información proporcionada
