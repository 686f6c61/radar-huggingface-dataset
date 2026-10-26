# tinyopsec/MiniCPM5-2B-Pashto-GGUF

## Resumen

MiniCPM5-2B-Pashto-GGUF es un conjunto de cuantizaciones en formato GGUF del modelo `nassimjp/MiniCPM5-2B-Pashto`, a su vez derivado de `openbmb/MiniCPM5-2B`, un transformer decoder-only de arquitectura Llama con 2.516.944.896 parámetros (unos 2,52 mil millones). Lo publica el usuario `tinyopsec` y su rasgo diferencial no es el entrenamiento, sino la modificación del tokenizer: se han añadido 46 átomos (tokens) para pashto y urdu, una técnica conocida como *tokenizer surgery* que busca reducir la fragmentación de estas lenguas en subpalabras.

La relevancia del artefacto es doble. Por un lado, empaqueta el modelo en 13 niveles de cuantización (desde F16 hasta Q2_K) generados con llama.cpp, lo que permite ejecutarlo en CPU y en GPUs de gama de entrada. Por otro, sirve como banco de pruebas reproducible para estudiar si ampliar el vocabulario mejora la eficiencia de tokenización en lenguas de bajos recursos antes de invertir en un preentrenamiento o *fine-tuning* completo.

Conviene subir la advertencia a la primera línea: el propio autor indica que el modelo **no se ha entrenado ni ajustado con datos en pashto ni en urdu**. Los nuevos tokens existen en el vocabulario, pero no hay evidencia publicada de que sus representaciones estén bien formadas. Se distribuye bajo licencia Apache 2.0 y el repositorio ocupa 24,6 GB (incluye todas las variantes). El modelo se publicó el 26 de octubre de 2026 y, en el momento de redactar esta ficha, no registra descargas ni valoraciones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia Llama (según tags del repositorio), base MiniCPM5-2B |
| Parámetros totales | 2.516.944.896 (~2,52 mil millones) |
| Parámetros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q5_0, Q4_K_M (recomendada por el autor), Q4_K_S, Q4_0, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | no disponible (el tokenizer incorpora 46 tokens de pashto/urdu, pero no hay datos de entrenamiento en esos idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (generado con llama.cpp); el modelo base se distribuye en safetensors |

Detalle de ficheros publicados:

| Fichero | Cuantización | Tamaño | Notas |
|---|---|---|---|
| `model-F16.gguf` | F16 | 5,0 GB (dato del autor) | Precisión completa |
| `model-Q8_0.gguf` | Q8_0 | ~2,7 GB (estimado) | 8 bits |
| `model-Q6_K.gguf` | Q6_K | ~2,1 GB (estimado) | 6 bits |
| `model-Q5_K_M.gguf` | Q5_K_M | ~1,8 GB (estimado) | 5 bits medium |
| `model-Q5_K_S.gguf` | Q5_K_S | ~1,7 GB (estimado) | 5 bits small |
| `model-Q5_0.gguf` | Q5_0 | ~1,8 GB (estimado) | 5 bits legacy |
| `model-Q4_K_M.gguf` | Q4_K_M | ~1,6 GB (estimado) | Recomendada por el autor |
| `model-Q4_K_S.gguf` | Q4_K_S | ~1,5 GB (estimado) | 4 bits small |
| `model-Q4_0.gguf` | Q4_0 | ~1,5 GB (estimado) | 4 bits legacy |
| `model-Q3_K_L.gguf` | Q3_K_L | ~1,3 GB (estimado) | 3 bits large |
| `model-Q3_K_M.gguf` | Q3_K_M | ~1,3 GB (estimado) | 3 bits medium |
| `model-Q3_K_S.gguf` | Q3_K_S | ~1,2 GB (estimado) | 3 bits small |
| `model-Q2_K.gguf` | Q2_K | ~1,0 GB (estimado) | 2 bits, mayor pérdida de calidad |

Los tamaños distintos de F16 son estimaciones derivadas del número de parámetros y de los bits por peso; el autor solo documenta el tamaño de la variante F16.

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de la familia MiniCPM5, con arquitectura tipo Llama según los tags del repositorio (`llama`, `minicpm`), y 2,52 mil millones de parámetros en precisión completa. Sobre esa base se ha aplicado exclusivamente cirugía de tokenizer: la incorporación de 46 átomos (tokens) adicionales orientados a pashto y urdu, presumiblemente para cubrir grafías y secuencias de caracteres que el vocabulario original fragmentaba de forma ineficiente. El resultado es un vocabulario distinto del original, con nuevos identificadores de token.

No hay información disponible sobre el número de tokens de entrenamiento, la composición del corpus, ni si el modelo base pasó por fases de RLHF, DPO o ajuste por instrucciones. Tampoco se documenta ningún proceso de preentrenamiento o *fine-tuning* posterior a la modificación del tokenizer: el autor lo indica explícitamente en el descargo de responsabilidad del repositorio ("tokenizer-modified model; not finetuned on Pashto/Urdu data"). En consecuencia, los embeddings asociados a los 46 tokens nuevos no cuentan con garantías de haber sido entrenados; esta es la innovación (y a la vez la limitación) central del artefacto, y solo una evaluación empírica puede determinar si la tokenización mejora la calidad final.

Las cuantizaciones se han generado con llama.cpp, lo que implica compatibilidad directa con el ecosistema GGUF: llama.cpp, llama-cpp-python, Ollama, LM Studio o koboldcpp. No se documentan innovaciones de inferencia adicionales (decodificación especulativa, atención lineal, SSM híbrido).

## Capacidades

- Generación de texto autoregresiva y uso conversacional (tag `conversational`, pipeline `text-generation`).
- Ejecución en CPU y GPU de gama de entrada gracias a las cuantizaciones de 2 a 8 bits.
- Tokenización específica para pashto y urdu: 46 tokens adicionales en el vocabulario; el efecto sobre la calidad de salida no está verificado.
- Compatibilidad con cualquier runtime que lea GGUF (llama.cpp, Ollama, LM Studio, koboldcpp, llama-cpp-python).
- Soporte de *tool calling* / *function calling*: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades de visión, audio o *thinking mode*: no documentadas; el pipeline declarado es solo texto.
- Capacidades multilingües generales: no disponibles (heredadas, en su caso, del modelo base, sin datos publicados aquí).

## Casos de uso

- **Investigación en tokenización de lenguas de bajos recursos**: medir la fertilidad de tokens (tokens por palabra) en corpus pashto y urdu con este vocabulario frente al de `openbmb/MiniCPM5-2B` original; el artefacto aísla la variable del tokenizer, lo que permite una comparación limpia antes de abordar un preentrenamiento.
- **Punto de partida para *fine-tuning* con LoRA o QLoRA**: los modelos de 2,5 mil millones de parámetros se pueden adaptar en una única GPU consumer; los 46 tokens nuevos quedarían como base para un ajuste supervisado en pashto o urdu, con la salvedad de que sus embeddings habría que entrenarlos explícitamente.
- **Prototipado local sin conexión**: con la variante Q4_K_M (~1,6 GB) se puede montar un servidor de generación de texto en un portátil sin GPU, útil para demos, pruebas de integración o entornos con requisitos de privacidad que impiden llamar a APIs externas.
- **Docencia y formación en cuantización GGUF**: las 13 variantes permiten comparar empíricamente el compromiso entre tamaño, velocidad de decodificación y perplejidad en un mismo modelo, un ejercicio habitual en cursos de despliegue de LLM.
- **Banco de pruebas de pipelines llama.cpp**: validar herramientas de conversión, cuantización, *prompt templates* y servidores compatibles con GGUF antes de aplicarlas a modelos de mayor tamaño, con un coste de cómputo mínimo.
- **Despliegue en dispositivos *edge* con recursos limitados**: con Q3_K_M o Q2_K (~1 GB) el modelo cabe en dispositivos tipo Raspberry Pi 5 o mini-PC con 8 GB de RAM; la calidad esperada en esas cuantizaciones es baja, por lo que encaja mejor en tareas de clasificación aproximada o generación de texto auxiliar que en producción sensible.
- **Evaluación de riesgos de vocabularios ampliados**: estudiar cómo se comporta un modelo cuyos tokens nuevos no han sido entrenados (frecuencia de tokens desconocidos en la salida, degradación de la coherencia) y documentar el fenómeno en publicaciones técnicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K, perplejidad en pashto o urdu, ni comparaciones con el modelo base que permitan cuantificar el efecto de la cirugía de tokenizer. Tampoco se han publicado mediciones de latencia o throughput.

## Requisitos de hardware

- **VRAM estimada para inferencia**: F16 requiere ~6 GB contando el contexto y el *overhead* del runtime; Q8_0 ~3 GB; Q4_K_M ~2 GB en total; Q2_K ~1,5 GB en total. Cifras orientativas a partir de los tamaños de pesos indicados o estimados.
- **GPU recomendadas**: para F16, una RTX 3060 de 12 GB o superior; para Q4_K_M basta una GTX 1650 de 4 GB, una RTX 3050 de 8 GB o cualquier iGPU con memoria unificada suficiente. No tiene sentido desplegarlo en A100, H100 o L40S salvo por motivos de agregación de carga.
- **¿Cabe en GPU consumer?**: sí, en todas las cuantizaciones de 4 bits o inferiores. La variante F16 también cabe en tarjetas de 8-12 GB.
- **Opciones de despliegue**: llama.cpp (`llama-cli`, `llama-server`), Ollama (importando el GGUF mediante Modelfile), LM Studio, koboldcpp y llama-cpp-python. vLLM solo sería viable con el modelo base en safetensors, ya que su soporte de GGUF es experimental y no se ha validado aquí. TGI no soporta GGUF de forma nativa.
- **Latencia y throughput**: no disponibles; no se han publicado mediciones. Como referencia cualitativa, un modelo denso de 2,5 mil millones en Q4 corre de forma interactiva en CPU moderna y con holgura en cualquier GPU dedicada de los últimos cinco años, pero se trata de una expectativa general, no de un dato medido sobre este artefacto.
- **Almacenamiento**: el repositorio completo ocupa 24,6 GB; para uso práctico conviene descargar solo el fichero GGUF deseado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato GGUF | Notas |
|---|---|---|---|---|---|
| MiniCPM5-2B-Pashto-GGUF | 2,52 mil M | no disponible | Apache 2.0 | Sí, 13 cuantizaciones | Tokenizer modificado, sin *fine-tuning* en pashto/urdu |
| openbmb/MiniCPM5-2B (base) | 2,52 mil M | no disponible | Apache 2.0 (heredada) | Depende de conversiones de terceros | Referencia directa para medir el efecto del tokenizer |
| Qwen2.5-1.5B-Instruct | ~1,5 mil M | 32 768 tokens (según su model card pública) | Apache 2.0 | Sí, ampliamente convertido | Alternativa consolidada en tamaño similar con licencia permisiva |
| Gemma 2 2B Instruct | ~2,6 mil M | 8 192 tokens (según su model card pública) | Gemma Terms of Use | Sí | Licencia menos permisiva que Apache 2.0 para uso comercial |
| Llama 3.2 1B Instruct | ~1,2 mil M | 131 072 tokens (según su model card pública) | Llama 3.2 Community License | Sí | Contexto mucho mayor, pero licencia con restricciones adicionales |

Los datos de contexto y parámetros de las filas de Qwen, Gemma y Llama provienen de sus model cards públicas y no se han verificado en el marco de esta ficha; no hay benchmarks comparativos disponibles para este modelo. La comparación relevante es, en cualquier caso, contra `openbmb/MiniCPM5-2B`, que permite aislar el efecto de los 46 tokens añadidos.

## Limitaciones y advertencias

- **Sin entrenamiento en los idiomas objetivo**: el autor advierte que el modelo no se ha ajustado con datos en pashto ni urdu. Añadir tokens al vocabulario sin entrenar sus embeddings puede degradar la coherencia, producir secuencias repetidas o generar texto sin sentido en esas lenguas. No debe desplegarse en producción para pashto o urdu sin una evaluación previa.
- **Tokenizer incompatible con el modelo original**: los identificadores de token no coinciden con los de `openbmb/MiniCPM5-2B`. No se pueden reutilizar *prompts* pretokenizados, adaptadores LoRA del modelo base ni comparaciones directas de perplejidad sin remapear el vocabulario.
- **Ausencia total de evaluación**: cero descargas, cero valoraciones y ningún benchmark publicado. No hay evidencia externa sobre calidad, y el repositorio es muy reciente (26 de octubre de 2026).
- **Riesgo de alucinación**: inherente a un modelo denso de 2,5 mil millones; la cuantización agresiva (Q2_K, Q3_K_S) incrementa la probabilidad de degradación adicional.
- **Longitud de contexto desconocida**: no se documenta la ventana de contexto, por lo que no debe asumirse soporte de conversaciones largas ni de documentos extensos.
- **Cuantizaciones de 2 y 3 bits**: pensadas para entornos con memoria muy restringida; la pérdida de calidad frente a Q4_K_M y superiores es significativa en modelos pequeños, donde cada bit cuenta.
- **Licencia**: Apache 2.0 permite uso comercial y modificación, pero conviene verificar las condiciones del modelo base `openbmb/MiniCPM5-2B` y del derivado `nassimjp/MiniCPM5-2B-Pashto` antes de redistribuir. La cadena de derivación incluye dos intermediarios.
- **Sesgos**: no documentados. Al no haber datos sobre el corpus de entrenamiento del modelo base, no es posible evaluar sesgos lingüísticos, culturales o de género.
- **Idiomas soportados no declarados**: el campo de idiomas aparece vacío en los metadatos; el rendimiento en castellano u otras lenguas no está verificado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/tinyopsec/MiniCPM5-2B-Pashto-GGUF
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- Derivado con tokenizer modificado (safetensors): https://huggingface.co/nassimjp/MiniCPM5-2B-Pashto
- llama.cpp (runtime y herramientas de cuantización): https://github.com/ggml-org/llama.cpp
- Ollama (importación de GGUF): https://github.com/ollama/ollama
- LM Studio: https://lmstudio.ai
- koboldcpp: https://github.com/LostRuins/koboldcpp
