# swapnilvyom/sarvam-finance-sft-ultra

## Resumen

Sarvam Finance SFT Ultra es un ajuste fino supervisado completo del modelo Sarvam Translate, desarrollado por el usuario swapnilvyom sobre la base de sarvamai/sarvam-translate. El modelo está especializado en traducción de textos del dominio financiero —incluyendo inversión, seguros, acciones, bonos y productos bancarios— desde el inglés hacia el panyabí (pa) y el oriya (or), dos de las 22 lenguas oficiales de la India.

La relevancia de este modelo radica en que aborda un vacío concreto: los modelos de traducción generalistas suelen fallar con la terminología financiera especializada en lenguas indias de baja representación. Al aplicar un ajuste fino completo (no solo adaptadores o LoRA) sobre Sarvam Translate, el modelo ha visto actualizados todos sus pesos para el dominio financiero, lo que debería traducirse en mayor precisión terminológica y mejor manejo de construcciones sintácticas propias del lenguaje financiero en estas dos lenguas.

El modelo tiene 4.300 millones de parámetros, está publicado con licencia Apache 2.0 y los pesos están en formato safetensors. Se distribuye a través de HuggingFace con soporte para la biblioteca Transformers de HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Sarvam Translate, que a su vez se basa en Gemma 3) |
| Parametros totales | 4.300.079.472 (~4,3 B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en precision completa) |
| Idiomas soportados | en, pa, or (inglés, panyabí, oriya) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Sarvam Translate, que a su vez está construido sobre la arquitectura Gemma 3 de Google. Gemma 3 es un transformer decoder-only con atención multi-cabeza, diseñado para ser eficiente en inferencia y entrenamiento. Al tratarse de un ajuste fino completo (full SFT), todos los parámetros del modelo base fueron actualizados durante el entrenamiento, en lugar de congelar capas o usar métodos de adaptación de bajo rango.

El entrenamiento se realizó con datos del dominio financiero en las 22 lenguas indias, aunque el modelo final publicado se centra en los pares inglés-panyabí e inglés-oriya. La model card menciona el uso de métricas de evaluación de traducción como TER, chrF++ y LaBASE, pero no especifica la composición exacta del dataset de entrenamiento, el número de tokens utilizados ni si se aplicaron técnicas adicionales como RLHF o DPO. Tampoco se detalla el número de épocas ni la configuración de hiperparámetros.

## Capacidades

- Traducción automática especializada en el dominio financiero desde inglés hacia panyabí y oriya.
- Cobertura de subdominios financieros: inversión, seguros, acciones, bonos y productos bancarios.
- Manejo de terminología financiera técnica, incluyendo términos regulatorios y de productos de inversión como fondos mutuos (mutual funds).
- Integración sencilla con la biblioteca Transformers de HuggingFace mediante `AutoModelForCausalLM` y `AutoTokenizer`.
- Uso comercial permitido gracias a la licencia Apache 2.0.
- Capacidad de procesamiento de textos largos (la longitud exacta de contexto no está documentada).

## Casos de uso

- Traducción de documentación de fondos mutuos: el modelo puede traducir folletos informativos, informes de rendimiento y documentos de oferta pública desde inglés a panyabí y oriya, garantizando que la terminología regulatoria se traduzca con precisión.
- Localización de plataformas bancarias en línea: integración en aplicaciones de banca digital para traducir estados de cuenta, notificaciones de transacciones y descripciones de productos financieros para hablantes de panyabí y oriya.
- Traducción de contratos de seguros: adecuado para traducir pólizas, condiciones generales y cláusulas de cobertura, donde la precisión terminológica es crítica para evitar malentendidos legales.
- Atención al cliente financiera: despliegue como componente de un sistema de traducción en tiempo real para que agentes de soporte puedan comunicarse con clientes que hablan panyabí u oriya, traduciendo consultas y respuestas sobre productos financieros.
- Generación de contenido educativo financiero: traducción de guías, tutoriales y materiales de educación financiera para audiencias rurales o urbanas que prefieren consumir contenido en su lengua materna.
- Cumplimiento normativo: traducción de comunicaciones regulatorias y avisos legales obligatorios que las instituciones financieras deben proporcionar en lenguas locales según la normativa india.
- Investigación en traducción financiera multilingüe: uso como modelo de referencia para evaluar la calidad de traducción financiera en lenguas indias de baja representación, comparándolo con modelos generalistas.

## Benchmarks y rendimiento

La model card menciona que se utilizaron las métricas TER, chrF++ y LaBASE para evaluar el modelo por par de lenguas, pero no se han publicado los valores numéricos de estos benchmarks en la información disponible. Tampoco se proporcionan comparaciones con otros modelos de traducción en las mismas condiciones.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 4,3 B parámetros. En FP16, los pesos ocupan aproximadamente 8,6 GB. Con overhead de activaciones y KV cache, se recomienda un mínimo de 12-16 GB de VRAM.
- GPUs recomendadas: una RTX 4090 (24 GB) o una A100 (40 GB) pueden ejecutar el modelo cómodamente. En GPUs con menos de 16 GB, será necesario aplicar cuantización (no incluida en el repositorio actual).
- En consumer GPU: cabe en una RTX 3090 o RTX 4090 en FP16. No cabrá en GPUs de 8 GB sin cuantizar.
- Opciones de despliegue: al ser un modelo compatible con Transformers, puede servirse con vLLM, TGI (Text Generation Inference) o mediante la API de HuggingFace Inference Endpoints. También se puede exportar a GGUF para ejecutarlo con llama.cpp u Ollama, aunque no se proporcionan pesos cuantizados oficiales.
- Latencia y throughput: no disponible en la información publicada. Como referencia, un modelo de 4 B parámetros en una A100 suele generar entre 50 y 150 tokens por segundo dependiendo de la longitud de la secuencia y el batch size.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| Sarvam Finance SFT Ultra | 4,3 B | no disponible | en, pa, or | Apache 2.0 | Traducción financiera especializada |
| Sarvam Translate (base) | no disponible | no disponible | 22 lenguas indias | no disponible | Traducción generalista multilingüe |
| IndicTrans2 | no disponible | no disponible | 22 lenguas indias | MIT | Traducción generalista multilingüe |
| NLLB-200 (Meta) | 600 M - 54 B | 512 tokens | 200 lenguas | CC-BY-NC | Traducción generalista multilingüe |

La comparación directa con Sarvam Translate base permitiría cuantificar la mejora en el dominio financiero, pero no se han publicado los resultados de evaluación. Con IndicTrans2 y NLLB-200, la diferencia clave es la especialización: este modelo está ajustado para terminología financiera, mientras que los otros son traductores generalistas.

## Limitaciones y advertencias

- Limitación idiomática: el modelo solo cubre inglés, panyabí y oriya. No traduce entre panyabí y oriya directamente (solo desde inglés).
- Sin datos de evaluación publicados: no se han publicado valores de TER, chrF++ ni LaBASE, lo que impide verificar objetivamente la calidad de las traducciones.
- Longitud de contexto no documentada: se desconoce el límite de tokens que el modelo puede procesar, lo que puede afectar a documentos financieros largos.
- Dominio restringido: al ser un ajuste fino especializado, puede degradarse en textos fuera del dominio financiero.
- Sin cuantizaciones oficiales: el repositorio solo contiene pesos en FP16/FP32, lo que obliga a cuantizar manualmente para despliegue en hardware modesto.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar traducciones inventadas o incorrectas para términos financieros muy específicos o poco frecuentes.
- Sin información sobre sesgos: no se documentan evaluaciones de sesgo de género, cultural o dialectal en las traducciones.
- Mantenimiento incierto: el modelo tiene cero descargas y cero likes en el momento de la consulta, lo que sugiere que es un proyecto personal sin soporte comunitario ni garantías de mantenimiento.
- Verificación legal necesaria: aunque la licencia Apache 2.0 permite uso comercial, las traducciones financieras generadas deben ser revisadas por expertos antes de su uso en contextos regulatorios.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/swapnilvyom/sarvam-finance-sft-ultra
- Sarvam AI (plataforma oficial): https://www.sarvam.ai/
- Modelos de Sarvam: https://www.sarvam.ai/models
