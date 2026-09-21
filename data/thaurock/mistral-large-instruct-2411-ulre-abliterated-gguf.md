# Thaurock/Mistral-Large-Instruct-2411-ULRE-abliterated-GGUF

## Resumen

Thaurock/Mistral-Large-Instruct-2411-ULRE-abliterated-GGUF es una colección de cuantizaciones en formato GGUF de un modelo derivado de Mistral-Large-Instruct-2411, el modelo denso de 123 000 millones de parámetros publicado por Mistral AI en noviembre de 2024. El autor del repositorio no ha reentrenado el modelo: ha empaquetado en GGUF una versión previamente modificada mediante una técnica denominada ULRE (Unsupervised Layerwise Refusal Erasure), aplicada por el usuario gregfrank, que elimina los vectores de rechazo inyectados en las capas residuales del modelo original. El resultado es un modelo sin filtros de seguridad que responde a peticiones que el modelo base rechazaría.

La relevancia de esta ficha es doble. Por un lado, permite ejecutar localmente en `llama.cpp`, Ollama, LM Studio o Text-Generation-WebUI un modelo de 123B que de otro modo solo sería accesible vía API o en clústeres multi-GPU, gracias a cuantizaciones que van desde los ~246 GB en F16 hasta los ~48 GB en Q2_K. Por otro, es un ejemplo representativo de la práctica de "abliteración" de pesos, un área activa de investigación en seguridad de IA y en evaluación de comportamientos de rechazo.

El repositorio no aporta datos de entrenamiento, benchmarks ni especificaciones propias más allá del listado de archivos: toda la información técnica verificable procede del modelo base. Además, la model card declara licencia Apache 2.0, lo que entra en conflicto con la licencia del modelo original de Mistral AI (Mistral Research License), un punto crítico para cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso de tipo decodificador (heredada del modelo base Mistral-Large-Instruct-2411); la model card de esta derivación no detalla número de capas, cabezas ni esquema de atención |
| Parametros totales | 123 000 millones (123B), según la model card del repositorio |
| Parametros activos | No aplica: el modelo es denso, no es una arquitectura MoE |
| Longitud de contexto | No especificada en la model card de esta derivación. El modelo base Mistral-Large-Instruct-2411 declara 128 000 tokens de contexto |
| Tipos de cuantizacion | GGUF: F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | No disponibles en la model card de esta derivación. El modelo base declara soporte multilingüe (entre otros: inglés, francés, alemán, español, italiano, portugués, árabe, hindi, ruso, chino, japonés y coreano) |
| Licencia | apache-2.0 según la model card del repositorio. El modelo base mistralai/Mistral-Large-Instruct-2411 se distribuye bajo Mistral Research License, por lo que la etiqueta Apache 2.0 de esta derivación es cuando menos discutible |
| Formato de pesos | GGUF, un único archivo por cuantización (sin fragmentación ni splits) |

## Arquitectura y entrenamiento

La model card no documenta ningún proceso de entrenamiento propio. El repositorio es exclusivamente un trabajo de cuantización: parte de los pesos ya modificados del modelo ULRE-abliterated y los convierte a GGUF. La arquitectura subyacente es, por tanto, la de Mistral-Large-Instruct-2411, un transformer denso de 123B parámetros con atención agrupada (GQA) y ventana de contexto de 128 000 tokens, afinado por Mistral AI sobre su preentrenamiento y alineado mediante técnicas de ajuste por instrucciones. No se especifica en la información disponible qué subconjunto de datos, número de tokens o método de alineación (RLHF, DPO u otro) se empleó en la fase de abliteración.

La innovación técnica que define este repositorio es la intervención ULRE (Unsupervised Layerwise Refusal Erasure), descrita por el autor como un método que "desmantela de raíz los vectores de alineación y bloqueo de seguridad inyectados en las capas residuales". Se trata de una variante de las técnicas de *abliteration*, que identifican direcciones en el espacio de activaciones asociadas al comportamiento de rechazo y las proyectan fuera de los pesos. El autor afirma que el proceso no altera las capacidades de programación ni de razonamiento multilingüe, pero no aporta ninguna medición que respalde esa afirmación. No hay información disponible sobre si la modificación se aplicó a todas las capas o a un subconjunto, ni sobre el coste computacional o la pérdida de rendimiento asociada.

## Capacidades

- Generación de texto y razonamiento multilingüe en el rango esperado para un modelo denso de 123B (capacidad heredada del base, no medida en el repositorio).
- Generación y comprensión de código en múltiples lenguajes de programación, según las capacidades declaradas por Mistral AI para Mistral-Large-Instruct-2411.
- Respuesta a instrucciones complejas y tareas de varios pasos.
- Soporte de *function calling* / *tool calling* y de plantillas de chat instructivas, si la plantilla del modelo base se conserva en la conversión a GGUF.
- Contexto largo de hasta 128 000 tokens (valor del modelo base).
- Comportamiento sin rechazos: no aplica filtros de seguridad y responde a peticiones que el modelo original bloquearía. Es una característica del proceso ULRE, no una capacidad funcional añadida.
- No se documenta soporte de visión, audio ni generación de imágenes.
- No se documenta un "modo de razonamiento" o *thinking mode* explícito.

## Casos de uso

- Investigación en seguridad y alineación: el modelo sirve como sujeto de estudio para medir qué información se elimina al aplicar ULRE y cuánto se degradan las capacidades originales, comparándolo con Mistral-Large-Instruct-2411 sin modificar.
- *Red teaming* y generación de conjuntos de datos adversarios: permite producir respuestas que un modelo alineado rechazaría, útiles para entrenar clasificadores de contenido o evaluar guardarraíles de otros sistemas.
- Evaluación de robustez de filtros: se puede usar como generador de *prompts* y respuestas problemáticas en un banco de pruebas cerrado, siempre que el equipo asuma la responsabilidad legal del contenido generado.
- Escritura creativa sin restricciones temáticas: narrativa de ficción que aborde violencia, temas adultos o conflictos morales sin que el modelo se niegue a continuar la escena.
- Inferencia local en entornos aislados (*air-gapped*): al distribuirse en GGUF de archivo único, permite desplegar un modelo de 123B en un servidor sin conexión a internet y sin enviar datos a APIs externas, relevante en ámbitos con requisitos de confidencialidad estrictos.
- Análisis de documentos extensos: con la ventana de contexto de 128 000 tokens del base, se pueden procesar contratos, informes técnicos o expedientes completos en una sola pasada y con la inferencia ejecutándose íntegramente en hardware propio.
- Asistencia a la traducción y a la generación de contenido multilingüe: herencia del soporte idiomático del modelo base, útil en flujos de trabajo que requieren varios idiomas sin depender de servicios en la nube.
- Prototipado de asistentes conversacionales de dominio restringido: el modelo se puede integrar en `llama.cpp` o Ollama mediante su API compatible con OpenAI para construir un *chatbot* interno sobre documentación propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye ninguna medición de MMLU, HumanEval, GSM8K ni de evaluaciones de rechazo, y tampoco se aportan comparaciones numéricas frente al modelo base sin abliterar. La única afirmación cuantitativa del autor es que la cuantización Q5_K_M "retiene el 99 % de las métricas lógicas base", una cifra sin metodología ni datos de respaldo. Cualquier comparación entre el modelo abliterado y el original debe medirse por cuenta propia antes de tomarlo como equivalente.

## Requisitos de hardware

Los pesos ocupan, según las estimaciones de la propia model card:

| Cuantizacion | Tamano de pesos | VRAM para carga completa |
|---|---|---|
| F16 | ~246,0 GB | ~246 GB o mas |
| Q8_0 | ~131,0 GB | ~131 GB o mas |
| Q6_K | ~102,0 GB | ~102 GB o mas |
| Q5_K_M | ~88,0 GB | ~88 GB o mas |
| Q5_K_S | ~86,0 GB | ~86 GB o mas |
| Q4_K_M | ~76,0 GB | ~76 GB o mas |
| Q4_K_S | ~72,0 GB | ~72 GB o mas |
| Q3_K_L | ~64,0 GB | ~64 GB o mas |
| Q3_K_M | ~59,0 GB | ~59 GB o mas |
| Q3_K_S | ~56,0 GB | ~56 GB o mas |
| Q2_K | ~48,0 GB | ~48 GB o mas |

- A esas cifras hay que sumar el KV cache, que crece con la longitud de contexto y con el número de secuencias simultáneas. A 128 000 tokens el KV cache añade decenas de gigabytes adicionales; conviene medirlo antes de dimensionar el servidor.
- No cabe en ninguna GPU de consumo actual. Una RTX 4090 (24 GB) no puede alojar ni siquiera la cuantización más agresiva (Q2_K, ~48 GB).
- Configuraciones realistas: 2× A100 80 GB o 2× H100 80 GB para Q4_K_M y Q5_K_M con contexto moderado; 4× RTX 4090 (96 GB agregados) para Q3/Q4 con reparto por capas; 1× A100 80 GB para Q3_K_L con contexto reducido.
- Alternativa híbrida: descargar parte de las capas en RAM del sistema y el resto en una sola GPU. Requiere del orden de 64-128 GB de RAM y acepta una penalización notable de velocidad (dependiente del ancho de banda de la CPU y de la PCIe).
- El repositorio está pensado para `llama.cpp` y sus derivados: `llama-cli`, `llama-server`, Ollama, LM Studio y Text-Generation-WebUI. vLLM y TGI tienen soporte limitado o nulo de GGUF, por lo que no son opciones naturales para estos archivos; para esos motores habría que usar los pesos en safetensors del modelo abliterado original.
- No se publican cifras de latencia ni de *tokens* por segundo en la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este repositorio (ULRE-abliterated GGUF) | 123B densos | No declarado (128k en el base) | apache-2.0 declarada, en conflicto con la del base | GGUF, 11 cuantizaciones | Sin filtros de seguridad; sin benchmarks publicados |
| mistralai/Mistral-Large-Instruct-2411 | 123B densos | 128 000 tokens | Mistral Research License | safetensors | Alineado y con filtros; referencia de comparación |
| meta-llama/Llama-3.3-70B-Instruct | 70B densos | 128 000 tokens | Llama 3.3 Community License | safetensors, GGUF (comunitario) | Menor tamaño, más fácil de desplegar en una sola GPU de 80 GB |
| Qwen/Qwen2.5-72B-Instruct | 72B densos | 128 000 tokens | Licencia Qwen | safetensors, GGUF (comunitario) | Alternativa consolidada con ecosistema GGUF maduro |

En la categoría específica de modelos "sin censura" de gran tamaño, las alternativas habituales son variantes abliteradas de Llama 3.x 70B y de Mistral-Small, con mucha más comunidad y cuantizaciones probadas. No se dispone de datos objetivos para comparar rendimiento entre ellas y este modelo.

## Limitaciones y advertencias

- Sesgos: al eliminar los vectores de rechazo se elimina también parte del trabajo de alineación, que incluía mitigaciones de sesgo y de contenido dañino. No hay ninguna evaluación de sesgo publicada para esta derivación.
- Riesgo de alucinación: no se ha medido. La abliteración puede afectar a la calibración del modelo y aumentar la confianza en respuestas incorrectas, pero no hay datos que lo confirmen ni que lo descarten.
- Degradación por cuantización: las variantes Q3 y Q2 conllevan pérdidas notables de coherencia y sintaxis, según advierte el propio autor. Solo Q5_K_M y superiores deberían considerarse para uso serio.
- Licencia: la model card declara apache-2.0, pero el modelo base Mistral-Large-Instruct-2411 se distribuye bajo Mistral Research License, que restringe el uso comercial. Una derivación no puede relajar la licencia del original. Antes de cualquier uso comercial hay que aclarar esta contradicción con Mistral AI; lo prudente es asumir que no está permitido.
- Contenido generado: el modelo no tiene filtros. El autor traslada toda la responsabilidad legal a quien ejecuta la inferencia. En la Unión Europea, su uso está sujeto al Reglamento de IA y a la normativa de servicios digitales.
- Idiomas: no hay lista oficial de idiomas soportados para esta derivación; la cobertura real depende del modelo base y del tokenizador, sin verificación publicada.
- Contexto: aunque el base declara 128 000 tokens, no se ha verificado que la conversión a GGUF preserve el comportamiento correcto en contextos muy largos, ni qué ventana efectiva queda tras la abliteración.
- Mantenimiento: repositorio de autor único, con 0 descargas y 0 *likes* en el momento de la consulta, y sin issues ni historial de actualizaciones. No hay garantía de soporte, correcciones ni auditoría.
- Reproducibilidad: no se documenta el conjunto de datos, el procedimiento exacto de ULRE ni las semillas utilizadas, por lo que el resultado no es reproducible de forma independiente.
- No apto para producción sin evaluación previa: cualquier despliegue orientado a usuarios finales exige una batería propia de pruebas de calidad, seguridad y sesgo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Thaurock/Mistral-Large-Instruct-2411-ULRE-abliterated-GGUF
- Modelo base: https://huggingface.co/mistralai/Mistral-Large-Instruct-2411
- Perfil del autor de la abliteración ULRE: https://huggingface.co/gregfrank
- Perfil del autor de las cuantizaciones GGUF: https://huggingface.co/Thaurock
- Anuncio de Mistral Large 2411 por Mistral AI: https://mistral.ai/news/mistral-large-2411
- Repositorio de llama.cpp (motor de inferencia para estos archivos): https://github.com/ggml-org/llama.cpp
- Resultados de la búsqueda web: no se ha encontrado ningún enlace relevante. Las URLs devueltas corresponden a directorios de colegios internacionales en El Cairo y no guardan relación alguna con el modelo.
