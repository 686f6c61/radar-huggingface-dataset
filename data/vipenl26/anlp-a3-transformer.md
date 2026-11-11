# vipenl26/anlp-a3-transformer

## Resumen

`vipenl26/anlp-a3-transformer` es un modelo de secuencia decoder-only de tipo transformer, implementado desde cero en PyTorch y entrenado como parte de la asignatura ANLP Monsoon 2026 (Assignment 3, Parte A). Se trata de un artefacto académico, no de un modelo de propósito general: cuenta con 4.038.912 parámetros, 5 capas y una dimensión de modelo de 256, con una longitud máxima de secuencia de 256 tokens. Su objetivo declarado es la modelización de secuencias sobre un corpus cifrado con un esquema de sustitución posicional.

El modelo se entrenó como prefix LM sobre el formato `[BOS] ciphertext [SEP] plaintext [EOS]`, calculando la pérdida únicamente sobre el tramo de texto plano. La precisión de validación por token reportada es de 0,7069, con una tasa de aprendizaje de 0,001. La model card advierte explícitamente de que el cifrado liberado es un one-time pad por posición estadísticamente independiente del carácter que codifica, de modo que los checkpoints se comportan como modelos de lenguaje a nivel de carácter con una pista exacta de longitud, no como descifradores.

Su relevancia es, por tanto, exclusivamente docente y de reproducibilidad: sirve como referencia de implementación mínima de un transformer decoder-only con condicionamiento por prefijo, y como caso de estudio sobre los límites de lo que un modelo de este tamaño puede aprender de una tarea con información mutua nula entre entrada y salida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (prefix LM), implementado desde cero en PyTorch |
| Parametros totales | 4.038.912 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens (longitud maxima de secuencia) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible (repo de 0.0 GB; la carga se realiza via `part1.hf_utils.load_checkpoint`) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only con `d_model` de 256 y 5 capas, entrenado con un esquema de prefix LM: la secuencia de entrada sigue el patrón `[BOS] ciphertext [SEP] plaintext [EOS]` y la función de pérdida se aplica solo sobre el span de texto plano, de forma que el modelo condiciona la generación del plaintext sobre el ciphertext precedente. El coste analítico declarado es de 2.402.025.472 FLOPs por secuencia de 256 tokens. No se especifica en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO; dado el contexto académico, es razonable asumir entrenamiento supervisado con next-token prediction, aunque este extremo no está confirmado en la documentación.

La innovación técnica destacable no está en el modelo sino en el análisis de la tarea: la model card documenta que, tras eliminar los 18 símbolos de puntuación nulos, el ciphertext se alinea 1:1 con el plaintext y, en las posiciones alineadas, el símbolo cifrado es estadísticamente independiente del carácter que codifica. En consecuencia, la única señal recuperable es la longitud del plaintext. Esto convierte al modelo en un modelo de lenguaje a nivel de carácter con una pista exacta de longitud, y explica que la precisión de validación (0,7069) refleje principalmente el aprendizaje de la distribución marginal de caracteres y de la estructura de longitud, no una capacidad de descifrado.

## Capacidades

- Generación de texto a nivel de carácter condicionada por un prefijo (prefix LM), limitada a secuencias de hasta 256 tokens.
- Condicionamiento por ciphertext: el modelo consume un tramo de ciphertext y genera el plaintext correspondiente según el formato de entrenamiento.
- Modelización de la distribución de longitudes del plaintext, derivada de la alineación 1:1 tras eliminar los símbolos nulos.
- Predicción de caracteres con una precisión de validación por token de 0,7069 sobre el corpus de la asignatura.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento.
- No se documentan capacidades multilingües; el modelo opera sobre el vocabulario a nivel de carácter del corpus de entrenamiento, que no se especifica.

## Casos de uso

- Docencia y reproducción de resultados: el checkpoint permite a estudiantes y evaluadores reproducir el experimento del Assignment 3 cargando el modelo con `load_checkpoint` y verificando la precisión de validación reportada.
- Referencia de implementación mínima: sirve como plantilla de un transformer decoder-only con prefix LM en PyTorch puro, útil para comparar con implementaciones basadas en `mamba-ssm` o `fla` en cursos de arquitecturas de secuencia.
- Estudio de límites de aprendizaje: al ser un caso con información mutua nula entre ciphertext y plaintext, permite analizar empíricamente qué aprende un modelo pequeño cuando la tarea no es resoluble, y cómo se refleja en la curva de pérdida.
- Análisis de sesgo de longitud: el modelo puede emplearse para estudiar cómo un modelo de lenguaje a nivel de carácter explota pistas espurias de longitud en lugar de contenido.
- Prototipado de pipelines de carga de checkpoints: el flujo `snapshot_download` + `load_checkpoint` con metadatos (`meta`) ejemplifica un patrón reutilizable para artefactos académicos pequeños.
- Evaluación de robustez de tokenizadores a nivel de carácter: el corpus cifrado con símbolos nulos y separadores `[BOS]`/`[SEP]`/`[EOS]` es un banco de pruebas para tokenizadores y esquemas de enmascaramiento de pérdida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de rendimiento reportado en la model card es la precisión de validación por token:

| Metrica | Valor |
|---|---|
| Precisión de validación por token | 0,7069 |
| FLOPs analíticos por secuencia de 256 tokens | 2.402.025.472 |
| Tasa de aprendizaje | 0,001 |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para los 4.038.912 parámetros (aproximadamente 16 MB solo en pesos, más overhead de activaciones y framework); no se dispone de estimaciones oficiales.
- GPU recomendadas: cualquier GPU con soporte CUDA es suficiente; el ejemplo de la model card usa `device="cuda"`. Una RTX 4090, A100 o H100 están sobradamente dimensionadas para este modelo.
- Cabe en cualquier GPU consumer, incluida una GTX 1650 o una iGPU con suficiente memoria compartida; también es viable en CPU.
- Opciones de despliegue: la model card solo documenta carga mediante `huggingface_hub.snapshot_download` y `part1.hf_utils.load_checkpoint`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, y el formato de pesos no está especificado, por lo que la conversión a GGUF no está garantizada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (transformers decoder-only académicos de ~4M parámetros para tareas de cifrado). Como referencia dimensional, el modelo es aproximadamente tres órdenes de magnitud menor que modelos como GPT-2 small (124M parámetros) o TinyLlama (1.1B), pero no se dispone de datos de rendimiento comparables.

## Limitaciones y advertencias

- El modelo no descifra: la model card establece que el ciphertext es estadísticamente independiente del plaintext en las posiciones alineadas, por lo que solo la longitud es recuperable. Cualquier expectativa de decodificación es incorrecta.
- La precisión de validación de 0,7069 no debe interpretarse como capacidad de descifrado, sino como ajuste a la distribución marginal de caracteres y longitudes.
- Longitud de contexto muy limitada (256 tokens), insuficiente para la mayoría de aplicaciones reales.
- No se documentan idiomas soportados ni composición del vocabulario; el modelo está atado al corpus de la asignatura.
- Riesgo de alucinación irrelevante en el sentido habitual, pero riesgo de sobreinterpretación de resultados por parte de usuarios que asuman capacidades de descifrado.
- Licencia MIT: permite uso comercial y modificación, pero el modelo carece de utilidad práctica fuera del ámbito docente; la licencia no implica idoneidad para producción.
- No se documentan sesgos conocidos, pero al entrenarse sobre un corpus no especificado podría reflejar sesgos de dicho corpus a nivel de carácter.
- El repositorio tiene 0 descargas y 0 likes, y un tamaño de 0.0 GB, lo que sugiere que los pesos podrían no estar efectivamente alojados o que el repo está vacío; conviene verificar la integridad antes de usarlo.

## Enlaces

- Hugging Face: https://huggingface.co/vipenl26/anlp-a3-transformer
- No se han encontrado en la búsqueda web papers, blogs, repositorios ni demos adicionales asociados al modelo.
