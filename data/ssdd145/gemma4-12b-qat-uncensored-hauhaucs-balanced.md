# SSDD145/Gemma4-12B-QAT-Uncensored-HauhauCS-Balanced

## Resumen

Gemma4-12B-QAT-Uncensored-HauhauCS-Balanced es una variante sin rechazos del modelo multimodal google/gemma-4-12B-it de Google DeepMind, publicada por el usuario SSDD145 y ajustada por HauhauCS. Se distribuye exclusivamente en formato GGUF, con un peso principal cuantizado en Q4_K_M de 6,9 GB, un proyector visual (mmproj) en BF16 de 168 MB y una cabecera de decodificación especulativa MTP de 242 MB. El modelo conserva la arquitectura densa de 11.907.350.576 parámetros (11,9 B) y la ventana de contexto de 262.144 tokens (256K) del modelo base.

El problema que resuelve es acotado pero relevante para un nicho concreto: eliminar el comportamiento de rechazo del modelo original manteniendo intactas las capacidades de partida. Según el autor, no se han modificado datasets ni capacidades, y las pruebas de rechazo reportadas arrojan 0/465 respuestas deflectadas. El modelo añade además visión (entrada de imagen vía mmproj) y decodificación especulativa con un borrador MTP procedente del release de Gemma 4 de Unsloth, que según el autor aporta aproximadamente un 60 % más de velocidad de generación con salida idéntica.

Su relevancia ahora es doble. Por un lado, ocupa el hueco de los modelos locales sin censura orientados a escritura creativa, roleplay y flujos agénticos de código, ejecutables en una sola GPU de consumo. Por otro, al derivar de pesos QAT oficiales de Google, mantiene buena parte de la calidad del 4-bit oficial en lugar de partir de una cuantización genérica posterior. El repositorio, sin embargo, no tiene descargas ni valoraciones, y no hay validación independiente de sus afirmaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (texto e imagen) derivado de google/gemma-4-12B-it; no disponible el detalle de capas, cabezas de atención ni tipo de atención |
| Parametros totales | 11.907.350.576 (11,9 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (256K) |
| Tipos de cuantizacion | Q4_K_M (único peso de texto publicado); proyector visual mmproj en BF16; cabecera MTP en GGUF. El modelo base está entrenado con QAT para ~4 bits |
| Idiomas soportados | en (inglés) |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | GGUF |
| Tamano del repositorio | 7,8 GB |
| Ficheros publicados | Gemma4-12B-QAT-Uncensored-HauhauCS-Balanced-Q4_K_M.gguf (6,9 GB), mmproj-Gemma4-12B-QAT-Uncensored-HauhauCS-Balanced-BF16.gguf (168 MB), mtp-gemma-4-12B-it.gguf (242 MB) |
| Pipeline declarado | image-text-to-text |
| Modelo base | google/gemma-4-12B-it |
| Variante | Balanced (existe una variante Aggressive mencionada por el autor; no se detalla su publicación) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 11,9 B de parámetros heredado de Gemma 4 12B-it, con soporte multimodal de entrada de imagen mediante un proyector mmproj independiente que se carga junto al peso de texto en llama.cpp. La adaptación de HauhauCS se presenta como un ajuste de comportamiento sin cambios en datasets ni en capacidades: el autor afirma que el modelo conserva el 100 % de lo previsto por los autores originales, únicamente sin rechazos. No se documenta el procedimiento exacto de entrenamiento, el volumen de datos utilizado para el destilado de rechazos ni si hubo RLHF, DPO u otra técnica de alineación en esta variante.

El punto técnico diferencial es el uso de pesos QAT (quantization-aware training) oficiales de Google, diseñados específicamente para ~4 bits. Según el autor, esto hace que Q4_K_M sea el punto óptimo y que cuantizaciones de mayor precisión no aporten calidad real, solo tamaño. La segunda innovación es la decodificación especulativa: el repositorio incluye mtp-gemma-4-12B-it.gguf, una cabecera de multi-token prediction (MTP) procedente del release de Unsloth, que se usa como modelo borrador. El modelo principal verifica cada token propuesto, por lo que la salida es idéntica y la ganancia es puramente de velocidad (aproximadamente un 60 % según el autor, medido únicamente con llama.cpp).

## Capacidades

- Generación de texto conversacional en inglés, con razonamiento previo a la respuesta.
- Escritura creativa, narrativa y roleplay, con ausencia declarada de rechazos en pruebas automatizadas y manuales (0/465).
- Generación y asistencia de código, con la variante Balanced orientada explícitamente a coding agéntico.
- Flujos agénticos y tareas multi-paso: la etiqueta agentic indica este enfoque, aunque la model card no detalla soporte formal de tool calling o function calling.
- Visión: entrada de imagen junto a texto (pipeline image-text-to-text) mediante el proyector mmproj en BF16.
- Ventana de contexto de 262.144 tokens para documentos y conversaciones muy largos.
- Generación acelerada mediante decodificación especulativa con cabecera MTP, sin alteración de la salida verificada.
- Multilingüismo: limitado a inglés según el campo languages del repositorio.
- No se documentan capacidades de audio, vídeo ni modo thinking explícito.

## Casos de uso

- Escritura creativa y ficción sin restricciones temáticas: el modelo está ajustado para no deflectar peticiones, por lo que resulta adecuado para narrativa, guion y desarrollo de personajes donde los modelos alineados rechazan escenas violentas o controvertidas. La variante Balanced mantiene el razonamiento previo a la respuesta, lo que ayuda a preservar coherencia en textos largos.
- Roleplay y personajes conversacionales: con 256K tokens de contexto se puede mantener un historial extenso de interacción y fichas de personaje detalladas sin reinyectar el prompt, algo crítico en sesiones largas de RP.
- Asistencia de código en local: la orientación a coding agéntico y el soporte de contexto largo permiten cargar repositorios o módulos completos para refactorizaciones, revisiones y generación de tests dentro de un flujo de trabajo local con llama.cpp.
- Análisis de imágenes acompañadas de texto: ecografía de diagramas, capturas de interfaz, documentación escaneada o fotografías técnicas; el mmproj permite pasar la imagen junto a la consulta en el mismo prompt.
- Procesamiento de documentación técnica extensa: manuales, especificaciones o contratos de gran volumen caben en 262.144 tokens, lo que permite resumir o extraer información sin trocear el documento.
- Generación en tiempo real con latencia reducida: la cabecera MTP actúa como borrador especulativo y aporta aproximadamente un 60 % más de velocidad en llama.cpp, útil para chat interactivo o autocompletado local.
- Investigación sobre comportamiento y alineación: al declarar 0/465 rechazos sobre el mismo modelo base, sirve como punto de comparación controlado para estudiar cómo cambia el comportamiento de un modelo al eliminar las capas de rechazo, manteniendo supuestamente el resto de capacidades.
- Despliegue en estación de trabajo con una sola GPU: al ser un GGUF Q4_K_M de 6,9 GB, se puede ejecutar íntegramente en GPU en equipos de gama media-alta sin infraestructura de servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El único dato de evaluación reportado por el autor es una prueba de rechazos: 0 respuestas deflectadas sobre 465 prompts, medida con pruebas automatizadas y manuales. El autor reconoce que un número reducido de prompts límite deflecta en el primer intento pero responde a una reformulación. No hay MMLU, HumanEval, GSM8K ni ninguna otra métrica estándar publicada, ni comparaciones cuantitativas con el modelo base.

| Metrica | Resultado | Fuente |
|---|---|---|
| Rechazos (prueba automatizada + manual) | 0 / 465 | Model card del autor |
| Aceleracion con decodificacion especulativa MTP | ~60 % mas de velocidad, salida identica | Model card del autor (medido en llama.cpp) |
| MMLU, HumanEval, GSM8G, MT-Bench y similares | No disponible | No publicados |

## Requisitos de hardware

- Peso Q4_K_M: 6,9 GB en disco. Sumando el proyector visual (168 MB) y la cabecera MTP (242 MB), el conjunto ocupa aproximadamente 7,3 GB de ficheros.
- VRAM estimada para inferencia: en torno a 8-9 GB solo para pesos y proyector si se descargan todos los tensores a GPU; con overhead del runtime y caché KV, el mínimo práctico razonable está alrededor de 10-12 GB. No se dispone del tamaño de la caché KV por token, por lo que el consumo con contextos muy largos (hasta 262.144 tokens) puede superar ampliamente los pesos y requerir cuantización de la caché KV o reducir la ventana efectiva.
- GPU de consumo compatibles: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 Ti Super 16 GB, RTX 4080/4090 24 GB. Con 12 GB conviene limitar la ventana de contexto o mover parte de las capas a CPU.
- GPU profesionales: A100 40/80 GB y H100 80 GB sobran para el modelo; su interés aquí es servir múltiples instancias o ventanas de contexto muy largas.
- Despliegue: llama.cpp (llama-server y llama-cli, con soporte explícito de --spec-type draft-mtp y --mmproj), LM Studio, Jan y koboldcpp. El autor indica compatibilidad con "otros runtimes GGUF", pero no confirma explícitamente vLLM, TGI, Ollama ni SGLang.
- Advertencia de multi-GPU: el autor reporta cuelgues de Gemma 4 con el modo tensor-split de LM Studio y recomienda una sola GPU con layer-split u orden de prioridad.
- Latencia y throughput: no disponibles en cifras absolutas. El único dato relativo es la mejora de aproximadamente el 60 % al usar la cabecera MTP como borrador especulativo en llama.cpp.
- Configuración de muestreo recomendada por el autor: temperature 0.6, top_k 64, top_p 0.9, min_p 0.05, repeat_penalty 1.1.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| Gemma4-12B-QAT-Uncensored-HauhauCS-Balanced | 11,9 B densos | 262.144 | Texto + imagen | gemma | GGUF (Q4_K_M) | Repositorio de terceros, 0 descargas |
| google/gemma-4-12B-it (modelo base) | 11,9 B densos | 262.144 | Texto + imagen | gemma | Safetensors y quants oficiales | Repositorio oficial de Google DeepMind |
| Otras variantes sin censura de Gemma 4 12B | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |
| Alternativas de 12B en GGUF para uso local | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparación directa solo es posible contra el modelo base: misma arquitectura, mismo tamaño, misma ventana de contexto y misma licencia, con la diferencia de que la variante de HauhauCS elimina los rechazos, añade una cabecera MTP para decodificación especulativa y se distribuye únicamente en Q4_K_M. No se dispone de datos de benchmarks que permitan comparar rendimiento real entre ambos.

## Limitaciones y advertencias

- Modelo sin censura: puede generar contenido violento, sexual, ilegal o dañino. No es apto para productos dirigidos al público general ni para entornos sin moderación adicional.
- Licencia Gemma: no es una licencia de código abierto plena. El uso comercial está sujeto a los Gemma Terms of Use y a la política de usos prohibidos de Google; es responsabilidad del usuario verificar el cumplimiento.
- Es un ajuste de terceros no verificado por Google. No hay garantía de que el modelo no haya degradado capacidades durante el proceso de eliminación de rechazos, más allá de la afirmación del autor.
- Riesgo de alucinación: no se han publicado métricas de fidelidad ni de precisión, por lo que el riesgo de invención es desconocido y presumiblemente equivalente al del modelo base.
- Idioma: únicamente inglés declarado. El rendimiento en castellano u otros idiomas no está garantizado ni documentado.
- Contexto: los 262.144 tokens son la ventana nominal; el consumo de memoria asociado no está documentado y la degradación de calidad en ventanas muy largas no se ha medido.
- Cuantización única: solo se publica Q4_K_M. No hay opciones de mayor precisión ni formatos alternativos (safetensors, AWQ, GPTQ) en este repositorio.
- Optimizaciones limitadas al ecosistema llama.cpp: la ganancia del 60 % con MTP fue probada únicamente en llama.cpp, sin datos en otros runtimes.
- Inestabilidad conocida: el autor advierte de cuelgues con tensor-split en LM Studio; se recomienda una sola GPU.
- Ausencia total de tracción: 0 descargas y 0 likes en el momento de la consulta, sin issues ni validación de la comunidad.
- Ajuste de muestreo no estándar: los parámetros recomendados difieren de los de Gemma por defecto, lo que implica que usar los valores habituales puede degradar el comportamiento previsto.
- No se detalla el soporte formal de tool calling ni de function calling; la etiqueta agentic no equivale a una interfaz de herramientas documentada.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/SSDD145/Gemma4-12B-QAT-Uncensored-HauhauCS-Balanced
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Discord del autor del ajuste (HauhauCS), para avisos de versiones y reporte de prompts problemáticos: https://discord.gg/SZ5vacTXYf
- Repositorio de referencia para la cabecera MTP: release de Gemma 4 de Unsloth, citado en la model card sin enlace directo.

Nota: las búsquedas web realizadas no devolvieron resultados relevantes sobre este modelo; los enlaces obtenidos correspondían a contenidos sin relación (estadísticas de rugby league) y no se han incluido. No se han localizado papers, blogs técnicos ni demos asociados a este repositorio en la información disponible.
