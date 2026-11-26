# zjwan461/bonsai2.5-27b-ninfer

## Resumen

Ternary Bonsai 2.5 27B - NInfer artifacts es una conversión de formato del modelo Ternary Bonsai 2.5 27B de Prism (publicado originalmente como GGUF en `prism-ml/Ternary-Bonsai-2.5-27B-GGUF`) al contenedor de artefactos NInfer v3, empleado por el motor de inferencia `ninfer-windows` del autor zjwan461. No se trata de un reentrenamiento ni de un fine-tune: los pesos ternarios originales con cuantización de grupo de 128 elementos se conservan intactos, incluida la base de Hadamard por bloques que el runtime aplica sobre las activaciones. El repositorio contiene únicamente el componente de texto.

El interés de esta ficha reside en dos frentes. Por un lado, documenta un modelo de 27B con pesos ternarios (2 bits por peso efectivos), lo que reduce el artefacto completo a 5,94 GB por fichero y permite plantear despliegues en hardware muy modesto para su tamaño nominal. Por otro, ilustra un patrón de empaquetado específico de motor (formato `.ninfer`) que rompe la portabilidad respecto a GGUF y obliga a usar el motor del autor para la inferencia.

La información pública disponible es escasa: la model card del repositorio describe el proceso de conversión y los comandos de ejecución, pero no detalla la arquitectura interna del modelo base, el volumen de datos de entrenamiento ni resultados de benchmarks. Esta ficha marca explícitamente como "no disponible" todo dato que no aparece en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención híbrida (tag `hybrid-attention`); detalles internos no disponibles |
| Parametros totales | 27B (según nombre del modelo base); desglose no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | hasta 32768 tokens en el ejemplo de ejecución (`--max-context 32768`); máximo nativo no disponible |
| Tipos de cuantizacion | Ternaria (2 bits) con grupo de 128 (`g128`); empaquetados PTQ1_0 y PQ2_0, ambos idénticos en forma |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Contenedor NInfer v3 (`.ninfer`); origen GGUF |
| Tamano del artefacto | 5,94 GB por fichero (`bonsai25-PTQ1_0.ninfer` y `bonsai25-PQ2_0.ninfer`) |
| Tensores ternarios | 402 |
| Objetos empaquetados | 714 |
| Componentes incluidos | Solo texto (sin torre de visión ni cabeza MTP) |
| Libreria / motor | `ninfer` (repositorio `zjwan461/ninfer-windows`) |
| Modos de razonamiento | `xhigh` (por defecto) y `medium`; `low` no soportado |

## Arquitectura y entrenamiento

El modelo base es un transformer de 27B parámetros con un esquema de atención etiquetado como híbrido, si bien la información disponible no especifica la combinación concreta (por ejemplo, proporción de capas con atención completa frente a atención lineal o deslizante). Lo que sí está documentado es el esquema de cuantización: pesos ternarios con granularidad de grupo de 128 elementos, lo que sitúa el coste de almacenamiento en torno a 2 bits por peso más las escalas de grupo, y explica que un modelo de 27B quepa en 5,94 GB. La conversión preserva además una base de Hadamard por bloques, de modo que el runtime aplica la transformada correspondiente a las activaciones antes de las multiplicaciones, una técnica habitual para reducir el error de cuantización extrema.

No hay información en la documentación proporcionada sobre el número de tokens de entrenamiento, la composición del dataset, si hubo fases de RLHF o DPO, ni sobre innovaciones de decodificación. El repositorio de origen menciona una cabeza MTP (multi-token prediction) presente en los GGUF con sufijo `-mtp`, pero esta conversión no incluye ese componente, por lo que no se puede aprovechar decodificación especulativa con ella. Tampoco se incluye la torre de visión (`Ternary-Bonsai-2.5-27B-mmproj-*.gguf`), de modo que este artefacto es exclusivamente de texto.

## Capacidades

- Generación de texto en modo conversacional y de completado, con el ejemplo canónico de generación de código Python en la model card.
- Razonamiento configurable mediante `--reasoning-effort`, con dos niveles disponibles: `xhigh` (valor por defecto del modelo) y `medium`; el nivel `low` no está soportado.
- Capacidad de visión potencial en el modelo base (existe un `mmproj` en el repositorio original), pero no disponible en este artefacto.
- Decodificación especulativa potencial vía MTP en el modelo base, no disponible en este artefacto.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; el repositorio no declara idiomas.
- Gestión de contexto largo: el motor admite `--max-context 32768` y `--kv-capacity auto` para dimensionar la caché KV.

## Casos de uso

- Despliegue en hardware de gama media: con 5,94 GB de pesos, el modelo cabe en GPUs consumer con 8-12 GB de VRAM (RTX 3060 Ti, 4060 Ti, 4070), algo inviable para un transformer denso de 27B en FP16. Resulta adecuado para prototipos locales de razonamiento a coste reducido.
- Generación de código en estación de trabajo: el ejemplo de la model card (invertir una lista enlazada en Python) refleja el uso previsto; con 32k de contexto se pueden pasar varios ficheros de un proyecto como referencia.
- Experimentación con cuantización ternaria: útil para investigadores que quieran medir la degradación de un modelo de 27B a 2 bits por peso frente a su equivalente en 4 u 8 bits, usando el mismo motor y el mismo prompt.
- Asistente de razonamiento con esfuerzo ajustable: el parámetro `--reasoning-effort` permite elegir entre `medium` (menor latencia) y `xhigh` (mayor profundidad) según la carga, lo que encaja en pipelines por lotes donde se prioriza el coste.
- Evaluación de motores de inferencia alternativos: el formato `.ninfer` y el motor `ninfer-windows` permiten comparar throughput y latencia frente a llama.cpp u otros runtimes sobre los mismos pesos ternarios de origen.
- Procesamiento de documentos de longitud media: con 32k tokens de ventana se pueden resumir o extraer información de informes, contratos o transcripciones sin trocear en exceso, siempre que el contenido esté en un idioma que el modelo domine (no declarado).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan 5,94 GB; hay que sumar la caché KV. Con 32k de contexto y `--kv-capacity auto`, la VRAM total puede situarse holgadamente por encima de los 8 GB, aunque la cifra exacta no está documentada.
- GPU recomendadas: el ejemplo de compilación usa `-DCMAKE_CUDA_ARCHITECTURES=89`, es decir, arquitectura Ada (RTX 4090, RTX 4080, RTX 4060 Ti, L4). Con recompilación para otras arquitecturas debería funcionar en Ampere (A100, RTX 3090) y anteriores.
- Cabe en GPU consumer: sí, previsiblemente en modelos con 8 GB o más de VRAM si se limita el contexto; la model card no confirma cifras mínimas.
- Opciones de despliegue: exclusivamente el motor `ninfer` del repositorio `zjwan461/ninfer-windows`, compilado con CMake y CUDA. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI con este formato; para esos motores habría que usar los GGUF originales de `prism-ml`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato / motor |
|---|---|---|---|---|---|
| Ternary Bonsai 2.5 27B - NInfer (este) | 27B | hasta 32k en ejemplo | Ternaria 2-bit g128 | Apache 2.0 | `.ninfer` / ninfer |
| Ternary Bonsai 2.5 27B (Prism, original) | 27B | no disponible | Ternaria 2-bit g128 + otras | Apache 2.0 | GGUF / llama.cpp y afines |
| Modelos densos de 27-32B en 4-bit (p. ej. familia Qwen o Gemma) | 27-32B | variable, típicamente 32k-128k | 4-bit (Q4_K_M, AWQ, GPTQ) | variable | GGUF, safetensors |

La comparación relevante es contra el propio modelo original en GGUF: este artefacto no aporta pesos nuevos, solo un contenedor distinto, por lo que la calidad de salida debería ser idéntica y la diferencia se reduce a rendimiento del motor y portabilidad. Frente a modelos densos de tamaño similar en 4 bits, la ventaja es el menor espacio en disco y VRAM; la contrapartida esperable es una mayor degradación por cuantización, extremo que no puede cuantificarse sin benchmarks publicados.

## Limitaciones y advertencias

- No es un modelo nuevo ni un fine-tune: es una conversión de contenedor. Cualquier limitación del modelo base se hereda íntegramente.
- Solo incluye el componente de texto. No hay visión ni cabeza MTP, pese a que el modelo base las soporte en sus GGUF originales.
- Dependencia total del motor `ninfer-windows`: el formato `.ninfer` no es portable a vLLM, llama.cpp, Ollama ni TGI. Migrar requiere volver a los GGUF de origen.
- Idiomas soportados no declarados: no se puede asumir un buen rendimiento en castellano ni en otros idiomas sin evaluarlo.
- Riesgo de alucinación y sesgos: no documentados en la información disponible, pero presentes con alta probabilidad en cualquier modelo de lenguaje; la cuantización ternaria puede agravarlos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día: no hay evidencia de uso en producción ni de validación por terceros.
- El nivel de razonamiento `low` no está soportado; si el pipeline espera ese modo, fallará o se comportará de forma no definida.
- Licencia Apache 2.0 en el artefacto, pero conviene verificar la licencia del modelo base en `prism-ml/Ternary-Bonsai-2.5-27B-GGUF` antes de un uso comercial, ya que la model card no la reproduce.
- La compilación de ejemplo fija `CMAKE_CUDA_ARCHITECTURES=89` y `NINFER_TARGET_SM_COUNT=80`; usar esos valores en otra GPU puede degradar el rendimiento o impedir la ejecución.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/zjwan461/bonsai2.5-27b-ninfer
- Modelo base (GGUF): https://huggingface.co/prism-ml/Ternary-Bonsai-2.5-27B-GGUF
- Motor de inferencia: https://github.com/zjwan461/ninfer-windows
- Documentación de conversión (referenciada en la model card): `docs/maintainer/bonsai-ternary-conversion.md` dentro del repositorio del motor
